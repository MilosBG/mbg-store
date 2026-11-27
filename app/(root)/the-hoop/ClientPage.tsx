/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Container from "@/components/mbg-components/Container";
import { MBG } from "@/images";
import { createCheckoutOrder } from "@/lib/checkoutClient";
import type { CheckoutLine } from "@/lib/checkoutClient";
import useCart from "@/lib/hooks/useCart";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  extractOrderReference,
  ORDER_PLACED_SESSION_KEY,
  type OrderPlacedSnapshot,
} from "@/lib/orderPlaced";

type CheckoutFormState = {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
};

type CheckoutFormErrors = Partial<Record<keyof CheckoutFormState, string>>;

const FIELD_LABELS: Record<keyof CheckoutFormState, string> = {
  email: "Email",
  firstName: "First name",
  lastName: "Last name",
  address: "Address",
  city: "City",
  postalCode: "Postal code",
  country: "Country",
  phone: "Phone",
};

const Cart = () => {
  const router = useRouter();
  const { user } = useUser();
  const cart = useCart();
  const clearCart = cart.clearCart;

  const [shippingOption, setShippingOption] = useState<"FREE" | "EXPRESS">(
    "FREE",
  );

  // Checkout form state
  const [formData, setFormData] = useState<CheckoutFormState>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });
  const [formErrors, setFormErrors] = useState<CheckoutFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // T&C agreement state
  const [agreeTC, setAgreeTC] = useState(false);
  const [tcError, setTcError] = useState<string | null>(null);

  // Optional marketing consent.
  // Kept separate from the mandatory T&C consent: the customer can order
  // without agreeing to receive marketing communications.
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoQuote, setPromoQuote] = useState<{ code:string; discountCents:number; subtotalCents:number; totalCents:number } | null>(null);
  const [promoError, setPromoError] = useState("");
  const [checkingPromo, setCheckingPromo] = useState(false);

  const primaryEmail = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const defaultFirstName = user?.firstName ?? "";
  const defaultLastName = user?.lastName ?? "";
  const defaultPhone =
    user?.primaryPhoneNumber?.phoneNumber ??
    user?.phoneNumbers?.[0]?.phoneNumber ??
    "";

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      email: prev.email || primaryEmail,
      firstName: prev.firstName || defaultFirstName,
      lastName: prev.lastName || defaultLastName,
      phone: prev.phone || defaultPhone,
    }));
  }, [primaryEmail, defaultFirstName, defaultLastName, defaultPhone]);

  const subtotal = cart.cartItems.reduce(
    (acc, cartItem) => acc + cartItem.item.price * cartItem.quantity,
    0,
  );
  const subtotalRounded = Number(subtotal.toFixed(2));
  const shippingFee = shippingOption === "EXPRESS" ? 10 : 0;
  const finalTotal = Number((subtotal + shippingFee - (promoQuote?.discountCents ?? 0)/100).toFixed(2));
  // Variant-aware stock check per line
  const lineStock = (ci: { item: any; color?: string; size?: string }) => {
    const vars = ci?.item?.variants ?? [];
    if (Array.isArray(vars) && vars.length > 0) {
      const match = vars.find(
        (v: any) =>
          (v.color ?? "") === (ci.color ?? "") &&
          (v.size ?? "") === (ci.size ?? ""),
      );
      return Number(match?.stock ?? 0);
    }
    return Number(ci?.item?.countInStock ?? 0);
  };
  const stockIssues = cart.cartItems.some((ci) => lineStock(ci) < ci.quantity);
  const checkoutLines = useMemo<CheckoutLine[]>(() => {
    return cart.cartItems
      .map((cartItem) => ({
        productId: cartItem.item?._id ?? "",
        quantity: Number(cartItem.quantity ?? 0),
        unitPrice: Number(cartItem.item?.price ?? 0),
        color: cartItem.color ?? null,
        size: cartItem.size ?? null,
        title: cartItem.item?.title ?? null,
        image: cartItem.item?.media?.[0] ?? null,
      }))
      .filter((line) => line.productId && line.quantity > 0);
  }, [cart.cartItems]);

  // Re-evaluate the code if the cart or shipping option changes.
  useEffect(() => { setPromoQuote(null); setPromoError(""); }, [checkoutLines, shippingOption]);
  async function applyPromo() {
    setCheckingPromo(true); setPromoError("");
    try {
      const res = await fetch("/api/promotions/quote", { method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({ code:promoInput.trim(), lines:checkoutLines, shippingOption }) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error||"Code invalide.");
      setPromoQuote(data.code?data:null);
    } catch (e) {setPromoQuote(null);setPromoError(e instanceof Error?e.message:"Impossible de vérifier le code.");}
    finally {setCheckingPromo(false);}
  }
  const checkoutCustomer = useMemo(
    () => ({
      clerkId: user?.id ?? "",
      email: user?.emailAddresses?.[0]?.emailAddress ?? null,
      name: user?.fullName ?? null,
    }),
    [user],
  );

  const ensureCheckoutReady = useCallback(() => {
    if (!agreeTC) {
      setTcError("Please accept the Terms & Conditions to continue.");
      return false;
    }
    setTcError(null);

    if (stockIssues) {
      toast.error(
        "Please adjust your cart. Some items exceed the available stock.",
      );
      return false;
    }

    if (!user) {
      toast.error("Please sign in to checkout.");
      router.push("/sign-in");
      return false;
    }

    if (checkoutLines.length === 0) {
      toast.error("Your cart is empty.");
      return false;
    }

    return true;
  }, [agreeTC, checkoutLines, router, stockIssues, user]);

  const inputClass = useCallback(
    (field: keyof CheckoutFormState) =>
      [
        "min-h-11 w-full min-w-0 rounded-sm border bg-white px-3 py-2 text-xs text-black transition duration-200 focus:outline-none focus:ring-2",
        formErrors[field]
          ? "border-red-500 focus:ring-red-500"
          : "border-mbg-green focus:ring-mbg-green",
      ].join(" "),
    [formErrors],
  );

  const handleFieldChange = useCallback(
    (field: keyof CheckoutFormState, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setFormErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const validateForm = useCallback((): CheckoutFormErrors => {
    const errors: CheckoutFormErrors = {};
    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      errors.email = `${FIELD_LABELS.email} is required.`;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Enter a valid email address.";
    }

    (
      [
        "firstName",
        "lastName",
        "address",
        "city",
        "postalCode",
        "country",
        "phone",
      ] as Array<keyof CheckoutFormState>
    ).forEach((field) => {
      const value = formData[field].trim();
      if (!value) {
        errors[field] = `${FIELD_LABELS[field]} is required.`;
      }
    });

    return errors;
  }, [formData]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!ensureCheckoutReady()) {
        return;
      }

      const validationErrors = validateForm();

      if (Object.keys(validationErrors).length > 0) {
        setFormErrors(validationErrors);
        return;
      }

      setIsSubmitting(true);

      try {
        const result = await createCheckoutOrder({
          lines: checkoutLines,
          promoCode: promoQuote?.code || undefined,

          shippingOption,

          customer: checkoutCustomer,

          contact: {
            email: formData.email.trim(),
            phone: formData.phone.trim() ? formData.phone.trim() : null,
          },

          shippingAddress: {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            postalCode: formData.postalCode.trim(),
            country: formData.country.trim(),
            phone: formData.phone.trim() ? formData.phone.trim() : null,
          },
        });

        // Marketing consent must never block the order.
        // When checked, this endpoint also re-subscribes an address that had
        // previously used the marketing unsubscribe flow.
        if (marketingOptIn) {
          try {
            const marketingResponse = await fetch("/api/marketing/subscribe", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: formData.email.trim(),
                firstName: formData.firstName.trim(),
                consent: true,
                company: "",
              }),
            });

            if (!marketingResponse.ok) {
              const marketingPayload = await marketingResponse
                .json()
                .catch(() => null);

              console.warn(
                "[checkout] Unable to save marketing consent",
                marketingPayload,
              );
            }
          } catch (error) {
            console.warn(
              "[checkout] Unable to reach marketing subscription endpoint",
              error,
            );
          }
        }

        const orderReference = extractOrderReference(result);

        const snapshot: OrderPlacedSnapshot = {
          orderReference,

          createdAt: new Date().toISOString(),

          contact: {
            email: formData.email.trim(),
            phone: formData.phone.trim() ? formData.phone.trim() : null,
          },

          shippingAddress: {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            postalCode: formData.postalCode.trim(),
            country: formData.country.trim(),
            phone: formData.phone.trim() ? formData.phone.trim() : null,
          },

          shippingOption,

          items: checkoutLines.map((line) => ({
            productId: line.productId,

            title: line.title ?? "Milos BG Product",

            image: line.image ?? null,

            color: line.color ?? null,

            size: line.size ?? null,

            quantity: line.quantity,

            unitPrice: Number(line.unitPrice),

            lineTotal: Number(
              (Number(line.unitPrice) * Number(line.quantity)).toFixed(2),
            ),
          })),

          subtotal: result.itemTotal ?? subtotalRounded,
          shippingFee: result.shippingAmount ?? shippingFee,
          discountAmount: result.discountAmount ?? 0,
          promoCode: result.promoCode ?? null,
          total: result.total ?? finalTotal,

          currency: "EUR",
        };

        /*
         * On sauvegarde le bon de commande AVANT
         * de vider le panier.
         *
         * sessionStorage est volontairement utilisé :
         * les données disparaissent à la fermeture de l'onglet.
         */
        if (typeof window !== "undefined") {
          try {
            window.sessionStorage.setItem(
              ORDER_PLACED_SESSION_KEY,
              JSON.stringify(snapshot),
            );
          } catch (error) {
            console.warn(
              "[checkout] Unable to save order placed snapshot",
              error,
            );
          }
        }

        setFormErrors({});

        /*
         * La commande existe maintenant côté serveur.
         * On peut donc vider le panier.
         */
        clearCart();

        toast.success("Order placed successfully.");

        /*
         * replace() plutôt que push():
         * un retour arrière évite de retomber directement
         * sur l'étape de validation de commande.
         */
        if (orderReference) {
          router.replace(
            `/order_placed?order=${encodeURIComponent(orderReference)}`,
          );
        } else {
          router.replace("/order_placed");
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to create order. Please try again.";

        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      checkoutCustomer,
      checkoutLines,
      clearCart,
      ensureCheckoutReady,
      finalTotal,
      formData,
      marketingOptIn,
      promoQuote,
      router,
      shippingFee,
      shippingOption,
      subtotalRounded,
      validateForm,
    ],
  );

  return (
    <main className="min-h-screen bg-white text-black">
      <Container className="min-w-0 pb-12 pt-6 sm:pt-10 lg:pb-20">
      <div className={cart.cartItems.length > 0 ? "grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(330px,0.82fr)] lg:items-start lg:gap-8" : "mx-auto max-w-3xl"}>
        <section className="min-w-0">
          <header className="mb-6 border-b border-[#BFBFBF]/60 pb-6 sm:mb-8 sm:pb-8">
            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.21em] text-[#00821A]">
              MILOS BG / THE JOURNEY CONTINUES
            </p>
            <h1 className="text-[clamp(2rem,7vw,4.5rem)] font-black uppercase leading-[0.98] tracking-[-0.045em] text-black">
              THE <span className="text-[#00821A]">HOOP.</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-[#404040]">
              Your pieces are ready for the next chapter. Review your selection, choose your delivery and complete the journey.
            </p>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#404040]">
              <span><span className="text-[#00821A]">01</span> YOUR PIECES</span>
              <span><span className="text-[#00821A]">02</span> DELIVERY</span>
              <span><span className="text-[#00821A]">03</span> CONFIRMATION</span>
            </div>
          </header>

          {cart.cartItems.length === 0 ? (
            <>
              <div className="border border-[#BFBFBF]/60 bg-white px-5 py-10 text-center sm:px-8 sm:py-14">
                <p className="text-sm font-bold uppercase tracking-[0.1em] text-[#404040]">Your Hoop is waiting.</p>
                <p className="mx-auto mt-2 max-w-sm text-xs leading-5 text-[#404040]">Every journey starts with a first piece.</p>
                <Image
                  src={MBG}
                  alt="Grind Until Achieve"
                  className="
    mx-auto
    h-auto
    w-[46%]
    max-w-[460px]
    object-center
    py-8
    sm:w-[68%]
    md:w-[64%]
    lg:w-[60%]
  "
                />
                <Link href="/products" className="mx-auto mt-3 inline-flex min-h-11 items-center justify-center rounded-sm bg-[#00821A] px-7 text-xs font-black uppercase tracking-[0.12em] text-white transition-colors hover:bg-black">
                  EXPLORE OUTFITS
                </Link>
              </div>
            </>
          ) : (
            <div>
              {cart.cartItems.map((cartItem) => {
                const key = `${cartItem.item._id}-${cartItem.color ?? ""}-${cartItem.size ?? ""}`;
                const { _id, title, media, price } = cartItem.item;

                return (
                  <div
                    key={key}
                    className="mb-3 min-w-0 border border-[#BFBFBF]/60 bg-white p-3 transition-colors hover:border-[#00821A]/40 sm:p-5"
                  >
                    <div className="flex min-w-0 items-start gap-3 sm:gap-5">
                      <div className="relative shrink-0">
                        <Image
                          src={media?.[0] ?? "/placeholder.png"}
                          alt={title ?? "Item"}
                          width={100}
                          height={100}
                          className="h-20 w-20 rounded-sm bg-[#BFBFBF]/10 object-contain sm:h-28 sm:w-28"
                        />
                        <button
                          type="button"
                          aria-label={`Remove ${title ?? "item"} from cart`}
                          title="Remove item"
                          className="absolute -right-2 -top-2 inline-flex h-9 w-9 items-center justify-center rounded-sm border border-[#BFBFBF]/60 bg-white text-[#404040] transition-colors hover:border-red-500 hover:text-red-600 focus-visible:outline-2 focus-visible:outline-[#00821A]"
                          onClick={() => cart.removeItem(_id, cartItem.color, cartItem.size)}
                        >
                          <Trash2 size={15} aria-hidden="true" />
                        </button>
                      </div>

                      <div className="min-w-0 flex-1 pl-1 sm:pl-0">
                        <Link href={`/products/${_id}`}>
                          <p className="break-words text-sm font-black uppercase tracking-[0.05em] text-black sm:text-base">
                            {title}
                          </p>
                        </Link>
                        <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-[#404040]">
                          {cartItem.color || ""} {cartItem.size || ""}
                        </p>
                        <p className="mt-2 text-sm font-black uppercase text-[#00821A]">
                          € {price}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex w-full items-center justify-between gap-3 border-t border-[#BFBFBF]/30 pt-3">
                      <button
                        type="button"
                        aria-label={`Decrease quantity of ${title ?? "item"}`}
                        onClick={() => cart.decreaseQuantity(_id, cartItem.color, cartItem.size)}
                        className="flex h-11 w-11 items-center justify-center rounded-sm border border-[#BFBFBF]/60 bg-white text-lg font-bold transition hover:border-[#00821A] hover:text-[#00821A] focus-visible:outline-2 focus-visible:outline-[#00821A]"
                      >
                        −
                      </button>
                      <output className="min-w-8 text-center text-sm font-black text-[#00821A]" aria-live="polite">
                        {cartItem.quantity}
                      </output>
                      <button
                        type="button"
                        aria-label={`Increase quantity of ${title ?? "item"}`}
                        onClick={() => cart.increaseQuantity(_id, cartItem.color, cartItem.size)}
                        className="flex h-11 w-11 items-center justify-center rounded-sm border border-[#BFBFBF]/60 bg-white text-lg font-bold transition hover:border-[#00821A] hover:text-[#00821A] focus-visible:outline-2 focus-visible:outline-[#00821A]"
                      >
                        +
                      </button>
                    </div>
                    {lineStock(cartItem) <= 0 && (
                      <p className="text-[10px] text-red-600 mt-1">
                        Out of stock
                      </p>
                    )}
                    {lineStock(cartItem) > 0 &&
                      cartItem.quantity > lineStock(cartItem) && (
                        <p className="text-[10px] text-red-600 mt-1">
                          Only {lineStock(cartItem)} left
                        </p>
                      )}
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {cart.cartItems.length > 0 && (
        <aside className="min-w-0 self-start rounded-sm border border-[#BFBFBF]/60 bg-white p-4 shadow-[0_6px_28px_rgba(0,0,0,0.04)] sm:p-6 lg:mt-1">
          <p className="mb-1 text-[10px] font-black uppercase tracking-[0.19em] text-[#00821A]">02 / CHECKOUT</p>
          <p className="mb-3 text-xl font-black uppercase tracking-tight text-black">
            Order summary{" "}
            <span className="text-mbg-green font-medium">{`${
              cart.cartItems.length
            } ${cart.cartItems.length > 1 ? "items" : "item"}`}</span>
          </p>

          {/* Subtotal */}
          <div className="mbg-p-between">
            <span className="text-xs uppercase font-bold text-mbg-black/46">
              Subtotal
            </span>
            <span className="text-xs text-mbg-green uppercase font-bold">
              € {subtotalRounded}
            </span>
          </div>

          {/* Shipping selector (FREE vs EXPRESS) */}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <label className="text-xs uppercase font-bold text-mbg-black/46">
              Shipping
            </label>
            <select
              value={shippingOption}
              onChange={(e) =>
                setShippingOption(e.target.value as "FREE" | "EXPRESS")
              }
              className="min-h-11 w-full min-w-0 rounded-sm border border-[#BFBFBF]/60 bg-white px-3 text-xs font-bold text-[#00821A] transition focus:border-[#00821A] focus:outline-none focus:ring-2 focus:ring-[#00821A]/20 sm:w-auto"
            >
              <option value="FREE">FREE DELIVERY (0€)</option>
              <option value="EXPRESS">EXPRESS DELIVERY (10€)</option>
            </select>
          </div>

          <div className="space-y-2 border-t border-mbg-black/10 pt-3">
            <label htmlFor="promo-code" className="block text-[10px] font-black uppercase tracking-wide text-mbg-black">Promotion code</label>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input id="promo-code" type="text" maxLength={24} placeholder="GRIND10" value={promoInput} onChange={(e)=>{setPromoInput(e.target.value.toUpperCase());setPromoQuote(null);setPromoError("");}} className="min-h-11 w-full min-w-0 rounded-sm border border-mbg-black/20 bg-white px-3 text-xs font-bold tracking-widest" />
              <button type="button" disabled={checkingPromo || !promoInput.trim()} onClick={()=>void applyPromo()} className="min-h-11 w-full shrink-0 rounded-sm bg-black px-5 text-[10px] font-bold uppercase tracking-wider text-white transition hover:bg-[#00821A] disabled:opacity-50 sm:w-auto">{checkingPromo?"CHECKING…":"APPLY"}</button>
            </div>
            {promoError && <p role="alert" className="text-[11px] text-red-700">{promoError}</p>}
            {promoQuote && <p role="status" className="text-xs font-bold text-mbg-green">{promoQuote.code} − € {(promoQuote.discountCents/100).toFixed(2)}</p>}
          </div>

          {/* Final total (subtotal + shipping - validated discount) */}
          <div className="mt-2 flex items-center justify-between gap-4 rounded-sm bg-[#00821A]/10 px-3 py-4">
            <span className="text-xs uppercase font-black tracking-[0.07em] text-black">
              Total
            </span>
            <span className="text-xl font-black text-[#00821A]">
              € {finalTotal.toFixed(2)}
            </span>
          </div>
          <hr className=" border-mbg-green" />
          <p className="text-[9px] uppercase text-mbg-green">
            All taxes included
          </p>
          <p className="text-[9px] uppercase text-mbg-green">VAT 20%</p>

          {/* NEW: Terms & Conditions agreement */}
          <div className="mt-1 flex items-start gap-2">
            <input
              id="agree-tc"
              type="checkbox"
              checked={agreeTC}
              onChange={(e) => {
                setAgreeTC(e.target.checked);
                if (e.target.checked) setTcError(null);
              }}
              className="mt-0.5 h-3 w-3 accent-mbg-black rounded-xs border-mbg-green text-mbg-green focus:ring-mbg-green"
            />
            <label
              htmlFor="agree-tc"
              className="text-[11px] leading-5 uppercase"
            >
              I have read and agree to the{" "}
              <Link
                href="/terms-conditions"
                className="mbg-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms & Conditions
              </Link>
              .
            </label>
          </div>
          {tcError && (
            <p className="text-[10px] text-red-600 -mt-1" role="alert">
              {tcError}
            </p>
          )}

          {/* Optional marketing consent */}
          <div className="mt-1 border-t border-mbg-black/10 pt-3">
            <div className="flex items-start gap-2">
              <input
                id="marketing-opt-in"
                type="checkbox"
                checked={marketingOptIn}
                onChange={(event) => setMarketingOptIn(event.target.checked)}
                className="mt-0.5 h-3 w-3 rounded-xs border-mbg-green accent-mbg-green text-mbg-green focus:ring-mbg-green"
              />
              <label
                htmlFor="marketing-opt-in"
                className="cursor-pointer text-[11px] leading-5 uppercase"
              >
                I want to receive Milos BG news, new drops and{" "}
                <span className="font-bold text-mbg-green">
                  marketing emails
                </span>
                . I can unsubscribe at any time.
              </label>
            </div>
            <p className="mt-1 pl-5 text-[9px] leading-4 text-mbg-black/46">
              Optional. This choice does not affect your order.
            </p>
          </div>

          <form
            className="mt-5 flex flex-col gap-5 border-t border-[#BFBFBF]/30 pt-5"
            onSubmit={handleSubmit}
            noValidate
          >
            <div>
              <p className="text-xs uppercase font-bold text-mbg-black/46">
                Contact Details
              </p>
              <div className="mt-2 flex flex-col gap-2">
                <label
                  htmlFor="checkout-email"
                  className="text-[11px] font-semibold uppercase tracking-wide text-mbg-black"
                >
                  {FIELD_LABELS.email}
                </label>
                <input
                  id="checkout-email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  placeholder="you@example.com"
                  onChange={(event) =>
                    handleFieldChange("email", event.target.value)
                  }
                  className={inputClass("email")}
                />
                {formErrors.email && (
                  <p className="text-[10px] text-red-600" role="alert">
                    {formErrors.email}
                  </p>
                )}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase font-bold text-mbg-black/46">
                Delivery
              </p>
              <div className="mt-2 grid grid-cols-1 gap-2">
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="checkout-first-name"
                      className="text-[11px] font-semibold uppercase tracking-wide text-mbg-black"
                    >
                      {FIELD_LABELS.firstName}
                    </label>
                    <input
                      id="checkout-first-name"
                      type="text"
                      autoComplete="given-name"
                      value={formData.firstName}
                      onChange={(event) =>
                        handleFieldChange("firstName", event.target.value)
                      }
                      className={inputClass("firstName")}
                    />
                    {formErrors.firstName && (
                      <p className="text-[10px] text-red-600" role="alert">
                        {formErrors.firstName}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="checkout-last-name"
                      className="text-[11px] font-semibold uppercase tracking-wide text-mbg-black"
                    >
                      {FIELD_LABELS.lastName}
                    </label>
                    <input
                      id="checkout-last-name"
                      type="text"
                      autoComplete="family-name"
                      value={formData.lastName}
                      onChange={(event) =>
                        handleFieldChange("lastName", event.target.value)
                      }
                      className={inputClass("lastName")}
                    />
                    {formErrors.lastName && (
                      <p className="text-[10px] text-red-600" role="alert">
                        {formErrors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="checkout-address"
                    className="text-[11px] font-semibold uppercase tracking-wide text-mbg-black"
                  >
                    {FIELD_LABELS.address}
                  </label>
                  <input
                    id="checkout-address"
                    type="text"
                    autoComplete="street-address"
                    value={formData.address}
                    onChange={(event) =>
                      handleFieldChange("address", event.target.value)
                    }
                    className={inputClass("address")}
                  />
                  {formErrors.address && (
                    <p className="text-[10px] text-red-600" role="alert">
                      {formErrors.address}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="checkout-city"
                      className="text-[11px] font-semibold uppercase tracking-wide text-mbg-black"
                    >
                      {FIELD_LABELS.city}
                    </label>
                    <input
                      id="checkout-city"
                      type="text"
                      autoComplete="address-level2"
                      value={formData.city}
                      onChange={(event) =>
                        handleFieldChange("city", event.target.value)
                      }
                      className={inputClass("city")}
                    />
                    {formErrors.city && (
                      <p className="text-[10px] text-red-600" role="alert">
                        {formErrors.city}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="checkout-postal-code"
                      className="text-[11px] font-semibold uppercase tracking-wide text-mbg-black"
                    >
                      {FIELD_LABELS.postalCode}
                    </label>
                    <input
                      id="checkout-postal-code"
                      type="text"
                      autoComplete="postal-code"
                      value={formData.postalCode}
                      onChange={(event) =>
                        handleFieldChange("postalCode", event.target.value)
                      }
                      className={inputClass("postalCode")}
                    />
                    {formErrors.postalCode && (
                      <p className="text-[10px] text-red-600" role="alert">
                        {formErrors.postalCode}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="checkout-country"
                      className="text-[11px] font-semibold uppercase tracking-wide text-mbg-black"
                    >
                      {FIELD_LABELS.country}
                    </label>
                    <input
                      id="checkout-country"
                      type="text"
                      autoComplete="country-name"
                      value={formData.country}
                      onChange={(event) =>
                        handleFieldChange("country", event.target.value)
                      }
                      className={inputClass("country")}
                    />
                    {formErrors.country && (
                      <p className="text-[10px] text-red-600" role="alert">
                        {formErrors.country}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label
                      htmlFor="checkout-phone"
                      className="text-[11px] font-semibold uppercase tracking-wide text-mbg-black"
                    >
                      {FIELD_LABELS.phone}
                    </label>
                    <input
                      id="checkout-phone"
                      type="tel"
                      autoComplete="tel"
                      value={formData.phone}
                      onChange={(event) =>
                        handleFieldChange("phone", event.target.value)
                      }
                      className={inputClass("phone")}
                    />
                    {formErrors.phone && (
                      <p className="text-[10px] text-red-600" role="alert">
                        {formErrors.phone}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="mt-2 flex min-h-12 w-full items-center justify-center rounded-sm bg-[#00821A] px-5 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00821A] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Submit order"}
            </button>
          </form>
        </aside>
        )}
      </div>
      </Container>
    </main>
  );
};

export default Cart;
