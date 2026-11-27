/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Container from "@/components/mbg-components/Container";
import { GrindUntilAchieve2, MBG } from "@/images";
import { createCheckoutOrder } from "@/lib/checkoutClient";
import type { CheckoutLine } from "@/lib/checkoutClient";
import useCart from "@/lib/hooks/useCart";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Loader2, Minus, Plus, ShoppingBag, Trash2, Truck, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useRef, useState, Suspense } from "react";
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

type CheckoutFormErrors = Partial<Record<keyof CheckoutFormState, "required" | "invalidEmail">>;

type Language = "en" | "fr";

const COPY = {
  en: {
    checkout: "Your checkout", intro: "Every piece marks a step in your journey.",
    pieces: "Your pieces", delivery: "Delivery details", confirmation: "Confirmation",
    language: "Language", back: "Continue shopping", empty: "Your Hoop is waiting.",
    emptyText: "Every journey starts with a first piece.", explore: "Explore outfits",
    item: "item", items: "items", quantity: "Quantity", remove: "Remove", decrease: "Decrease quantity", increase: "Increase quantity", color: "Colour", size: "Size", each: "each",
    out: "Out of stock", left: "Available stock:", limit: "Stock limit reached", stockError: "Adjust your quantities before placing your order.",
    contact: "Contact & delivery address", details: "Enter the information needed to deliver your order.",
    requiredNote: "All fields are required.", required: "This field is required.", invalidEmail: "Enter a valid email address.",
    fields: { email: "Email address", firstName: "First name", lastName: "Last name", address: "Street address", city: "City", postalCode: "Postal code", country: "Country", phone: "Phone number" },
    shipping: "Delivery method", standard: "Standard delivery", express: "Express delivery", free: "Free",
    summary: "Order summary", subtotal: "Subtotal", shippingFee: "Delivery", discount: "Discount", total: "Order total", promo: "Promotion code", apply: "Apply", checking: "Checking…", applied: "Code applied", removePromo: "Remove code", promoInvalid: "Unable to apply this code. Check its validity and try again.", promoChanged: "Your order has changed. Apply your code again.",
    termsStart: "I have read and agree to the", terms: "Terms & Conditions", termsError: "Please accept the Terms & Conditions to continue.",
    marketing: "I want to receive Milos BG news, new drops and marketing emails. I can unsubscribe at any time.", optional: "Optional — does not affect your order.",
    submit: "Place order", processing: "Processing…", signIn: "Sign in to place your order.", emptyError: "Your cart is empty.", success: "Order placed successfully.", orderError: "Unable to create the order. Please try again.",
    product: "Milos BG item", checkingNotice: "Please wait while the code is checked.",
  },
  fr: {
    checkout: "Votre panier", intro: "Chaque pièce marque une étape de votre parcours.",
    pieces: "Vos pièces", delivery: "Livraison", confirmation: "Confirmation",
    language: "Langue", back: "Continuer mes achats", empty: "Votre Hoop vous attend.",
    emptyText: "Chaque parcours commence par une première pièce.", explore: "Découvrir les tenues",
    item: "article", items: "articles", quantity: "Quantité", remove: "Retirer", decrease: "Diminuer la quantité", increase: "Augmenter la quantité", color: "Couleur", size: "Taille", each: "l’unité",
    out: "Rupture de stock", left: "Stock disponible :", limit: "Stock maximum atteint", stockError: "Ajustez vos quantités avant de passer commande.",
    contact: "Coordonnées et adresse de livraison", details: "Renseignez les informations nécessaires à la livraison de votre commande.",
    requiredNote: "Tous les champs sont obligatoires.", required: "Ce champ est obligatoire.", invalidEmail: "Saisissez une adresse e-mail valide.",
    fields: { email: "Adresse e-mail", firstName: "Prénom", lastName: "Nom", address: "Adresse postale", city: "Ville", postalCode: "Code postal", country: "Pays", phone: "Téléphone" },
    shipping: "Mode de livraison", standard: "Livraison standard", express: "Livraison express", free: "Gratuite",
    summary: "Récapitulatif", subtotal: "Sous-total", shippingFee: "Livraison", discount: "Remise", total: "Total de la commande", promo: "Code promotionnel", apply: "Appliquer", checking: "Vérification…", applied: "Code appliqué", removePromo: "Retirer le code", promoInvalid: "Impossible d’appliquer ce code. Vérifiez sa validité et réessayez.", promoChanged: "Votre commande a changé. Appliquez de nouveau votre code.",
    termsStart: "J’ai lu et j’accepte les", terms: "conditions générales de vente", termsError: "Veuillez accepter les conditions générales de vente pour continuer.",
    marketing: "Je souhaite recevoir les actualités, les nouvelles collections et les e-mails promotionnels de Milos BG. Je peux me désinscrire à tout moment.", optional: "Facultatif — sans incidence sur votre commande.",
    submit: "Passer commande", processing: "Traitement…", signIn: "Connectez-vous pour passer commande.", emptyError: "Votre panier est vide.", success: "Commande enregistrée avec succès.", orderError: "Impossible de créer la commande. Veuillez réessayer.",
    product: "Article Milos BG", checkingNotice: "Veuillez patienter pendant la vérification du code.",
  },
} as const;

const FIELDS = [
  { name: "email", type: "email", autoComplete: "email", wide: true },
  { name: "firstName", type: "text", autoComplete: "given-name" },
  { name: "lastName", type: "text", autoComplete: "family-name" },
  { name: "address", type: "text", autoComplete: "street-address", wide: true },
  { name: "postalCode", type: "text", autoComplete: "postal-code" },
  { name: "city", type: "text", autoComplete: "address-level2" },
  { name: "country", type: "text", autoComplete: "country-name" },
  { name: "phone", type: "tel", autoComplete: "tel" },
] as const;

const panel = "min-w-0 rounded-sm border border-black/10 bg-white p-4 sm:p-6";
const focus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00821A]";

const CartContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const language: Language = searchParams.get("lang") === "fr" ? "fr" : "en";
  const t = COPY[language];
  const money = (amount: number) => new Intl.NumberFormat(language === "fr" ? "fr-FR" : "en-IE", { style: "currency", currency: "EUR" }).format(amount);
  const localized = useCallback((path: string) => `${path}${path.includes("?") ? "&" : "?"}lang=${language}`, [language]);
  function changeLanguage(next: Language) {
    const url = new URL(window.location.href);
    url.searchParams.set("lang", next);
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
  }
  const submitLock = useRef(false);
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
  const [tcError, setTcError] = useState(false);

  // Optional marketing consent.
  // Kept separate from the mandatory T&C consent: the customer can order
  // without agreeing to receive marketing communications.
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [promoInput, setPromoInput] = useState("");
  const [promoQuote, setPromoQuote] = useState<{ code:string; discountCents:number; subtotalCents:number; totalCents:number; key: string } | null>(null);
  const [promoError, setPromoError] = useState(false);
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

  // A quote is only valid for the exact basket, code and delivery option.
  const promoKey = JSON.stringify([checkoutLines, shippingOption, promoInput.trim()]);
  const activePromo = promoQuote?.key === promoKey ? promoQuote : null;
  const finalTotal = Number((subtotal + shippingFee - (activePromo?.discountCents ?? 0) / 100).toFixed(2));
  const busy = isSubmitting || checkingPromo;
  const itemCount = cart.cartItems.reduce((sum, item) => sum + item.quantity, 0);
  async function applyPromo() {
    if (busy || !promoInput.trim()) return;
    setCheckingPromo(true);
    setPromoError(false);
    setPromoQuote(null);
    try {
      const res = await fetch("/api/promotions/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput.trim(), lines: checkoutLines, shippingOption }),
      });
      const data = await res.json();
      if (!res.ok || !data.code || !Number.isFinite(data.discountCents)) throw new Error("Invalid promotion quote");
      setPromoQuote({ ...data, key: promoKey });
    } catch {
      setPromoQuote(null);
      setPromoError(true);
    } finally {
      setCheckingPromo(false);
    }
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
    if (stockIssues) {
      toast.error(t.stockError);
      document.getElementById("cart-stock-alert")?.focus();
      return false;
    }
    if (!user) {
      toast.error(t.signIn);
      router.push(localized("/sign-in"));
      return false;
    }
    if (checkoutLines.length === 0) {
      toast.error(t.emptyError);
      return false;
    }
    if (!agreeTC) {
      setTcError(true);
      document.getElementById("agree-tc")?.focus();
      return false;
    }
    setTcError(false);
    return true;
  }, [agreeTC, checkoutLines, router, stockIssues, user, localized, t]);

  const inputClass = (field: keyof CheckoutFormState) => [
    "min-h-12 w-full min-w-0 rounded-sm border bg-white px-3 py-2 text-base text-black transition focus:outline-none focus:ring-2 focus:ring-offset-1 sm:text-sm",
    formErrors[field] ? "border-red-600 focus:ring-red-600" : "border-black/20 focus:border-[#00821A] focus:ring-[#00821A]/30",
  ].join(" ");

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
      errors.email = "required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "invalidEmail";
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
        errors[field] = "required";
      }
    });

    return errors;
  }, [formData]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (submitLock.current || checkingPromo) return;

      const validationErrors = validateForm();

      setFormErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0) {
        const first = Object.keys(validationErrors)[0];
        document.getElementById(`checkout-${first}`)?.focus();
        return;
      }
      if (!ensureCheckoutReady()) return;
      submitLock.current = true;
      setIsSubmitting(true);

      try {
        const result = await createCheckoutOrder({
          lines: checkoutLines,
          promoCode: activePromo?.code || undefined,

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

        toast.success(t.success);

        /*
         * replace() plutôt que push():
         * un retour arrière évite de retomber directement
         * sur l'étape de validation de commande.
         */
        if (orderReference) {
          router.replace(
            localized(`/order_placed?order=${encodeURIComponent(orderReference)}`),
          );
        } else {
          router.replace(localized("/order_placed"));
        }
      } catch (error) {
        console.warn("[checkout] Order creation failed", error);
        toast.error(t.orderError);
        submitLock.current = false;
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
      activePromo,
      checkingPromo,
      localized,
      t,
      router,
      shippingFee,
      shippingOption,
      subtotalRounded,
      validateForm,
    ],
  );

  return (
    <main lang={language} className="min-h-screen bg-[#BFBFBF]/10 text-black">
      <Container className="min-w-0 pb-12 pt-5 sm:pt-8 lg:pb-20">
        <header className="overflow-hidden rounded-sm bg-black text-white">
          <div className="relative isolate px-4 py-5 sm:px-8 sm:py-8 lg:px-10">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,#00821A45,transparent_60%)]" />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link href={localized("/products")} className={`inline-flex min-h-11 items-center gap-2 text-xs font-medium text-white/80 transition hover:text-white ${focus}`}>
                <ArrowLeft size={15} aria-hidden="true" /> {t.back}
              </Link>
              <div role="group" aria-label={t.language} className="inline-flex rounded-sm border border-white/25 p-0.5">
                {(["en", "fr"] as const).map((lang) => (
                  <button key={lang} type="button" disabled={isSubmitting} aria-pressed={language === lang} onClick={() => changeLanguage(lang)} className={`min-h-10 min-w-[48px] rounded-sm px-3 text-xs font-bold uppercase transition ${focus} ${language === lang ? "bg-white text-black" : "text-white/70 hover:bg-white/10"}`}>
                    {lang}
                  </button>
                ))}
              </div>
            </div>
            <div className="mt-5 sm:mt-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/70">MILOS BG / {t.checkout}</p>
              <h1 className="mt-2 text-[clamp(2.4rem,8vw,5.5rem)] font-black uppercase leading-[0.95] tracking-[-0.045em]">THE <span className="text-[#00821A]">HOOP</span></h1>
              <p className="mt-3 max-w-lg text-sm leading-relaxed text-white/80">{t.intro}</p>
            </div>
          </div>
          <nav aria-label={t.checkout} className="grid grid-cols-3 border-t border-white/[0.15]">
            {[t.pieces, t.delivery, t.confirmation].map((step, index) => (
              <div key={index} className={`flex min-w-0 items-center gap-1.5 px-2 py-3 sm:gap-3 sm:px-6 sm:py-4 ${index !== 2 ? "border-r border-white/[0.15]" : ""}`}>
                <span className="text-xs font-black text-white sm:text-base">0{index + 1}</span>
                <span className="text-[10px] font-semibold uppercase leading-tight tracking-wide text-white/80 sm:text-xs">{step}</span>
              </div>
            ))}
          </nav>
        </header>

        {cart.cartItems.length === 0 ? (
          <section className={`${panel} mx-auto mt-5 flex max-w-2xl flex-col items-center py-10 text-center sm:mt-8 sm:py-14`}>
            <Image
                                src={GrindUntilAchieve2}
                                alt="GRIND UNTIL ACHIEVE"
                                width={32}
                                height={32}
                                priority
                                className="
                  h-7
                  w-7
                opacity-70
                  cursor-pointer
                  object-contain
                  transition-opacity
                  duration-300
                  group-hover:opacity-80
                "
                              />
            <h2 className="mt-4 text-2xl font-black uppercase tracking-tight sm:text-3xl">{t.empty}</h2>
            <p className="mt-2 text-sm text-[#404040]">{t.emptyText}</p>
            <Image src={MBG} alt="Milos BG" className="my-7 h-auto w-2/5 max-w-[190px] object-contain" />
            <Link href={localized("/products")} className={`inline-flex min-h-12 items-center justify-center gap-3 rounded-sm bg-black px-6 text-xs font-bold uppercase tracking-wider text-white transition hover:bg-[#00821A] ${focus}`}>
              {t.explore}<ArrowRight size={16} aria-hidden="true" />
            </Link>
          </section>
        ) : (
          <form id="checkout-form" noValidate onSubmit={handleSubmit} className="mt-5 grid min-w-0 items-start gap-5 lg:mt-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,0.9fr)] lg:gap-7">
            <div className="min-w-0 space-y-5">
              <section className={panel} aria-labelledby="cart-items-title">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 pb-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#00821A]">01 / THE HOOP</p>
                    <h2 id="cart-items-title" className="mt-1 text-xl font-black uppercase tracking-tight sm:text-2xl">{t.pieces}</h2>
                  </div>
                  <span className="rounded-sm bg-black/5 px-3 py-1.5 text-xs font-semibold tabular-nums">{itemCount} {itemCount === 1 ? t.item : t.items}</span>
                </div>
                <div className="divide-y divide-black/10">
                  {cart.cartItems.map((cartItem) => {
                    const { _id, title, media, price } = cartItem.item;
                    const translated = cartItem.item as typeof cartItem.item & { titleFr?: string };
                    const displayTitle = (language === "fr" ? translated.titleFr?.trim() || title : title) || t.product;
                    const stock = lineStock(cartItem);
                    const maxReached = cartItem.quantity >= stock;
                    return (
                      <article key={`${_id}-${cartItem.color ?? ""}-${cartItem.size ?? ""}`} className="grid min-w-0 grid-cols-[76px_minmax(0,1fr)] items-start gap-3 py-4 sm:grid-cols-[108px_minmax(0,1fr)] sm:gap-5 sm:py-5">
                        <Link href={localized(`/products/${_id}`)} className={`overflow-hidden rounded-sm bg-[#BFBFBF]/[0.15] ${focus}`}>
                          <Image src={media?.[0] ?? "/placeholder.png"} alt={displayTitle} width={216} height={216} className="aspect-square h-auto w-full object-contain" />
                        </Link>
                        <div className="min-w-0">
                          <div className="flex items-start justify-between gap-1.5">
                            <Link href={localized(`/products/${_id}`)} className={`min-w-0 break-words text-sm font-black uppercase leading-snug hover:text-[#00821A] sm:text-base ${focus}`}>{displayTitle}</Link>
                            <button type="button" disabled={busy} onClick={() => cart.removeItem(_id, cartItem.color, cartItem.size)} aria-label={`${t.remove} ${displayTitle}`} title={t.remove} className={`-mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-sm text-[#404040] hover:bg-red-50 hover:text-red-700 disabled:opacity-40 ${focus}`}><Trash2 size={17} aria-hidden="true" /></button>
                          </div>
                          <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-[#404040]">
                            {cartItem.color && <span>{t.color}: {cartItem.color}</span>}
                            {cartItem.size && <span>{t.size}: {cartItem.size}</span>}
                          </div>
                          <p className="mt-1 text-xs tabular-nums text-[#404040]">{money(price)} / {t.each}</p>
                          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                            <div role="group" aria-label={`${t.quantity} — ${displayTitle}`} className="inline-flex items-center rounded-sm border border-black/[0.15]">
                              <button type="button" aria-label={`${t.decrease} ${displayTitle}`} disabled={busy || cartItem.quantity <= 1} onClick={() => cart.decreaseQuantity(_id, cartItem.color, cartItem.size)} className={`flex h-11 w-10 items-center justify-center hover:bg-black/5 disabled:opacity-30 sm:w-11 ${focus}`}><Minus size={15} aria-hidden="true" /></button>
                              <output aria-live="polite" className="min-w-[28px] text-center text-sm font-bold tabular-nums">{cartItem.quantity}</output>
                              <button type="button" aria-label={`${t.increase} ${displayTitle}`} title={maxReached ? t.limit : t.increase} disabled={busy || maxReached} onClick={() => cart.increaseQuantity(_id, cartItem.color, cartItem.size)} className={`flex h-11 w-10 items-center justify-center hover:bg-black/5 disabled:opacity-30 sm:w-11 ${focus}`}><Plus size={15} aria-hidden="true" /></button>
                            </div>
                            <span className="text-base font-black tabular-nums text-[#00821A] sm:text-lg">{money(price * cartItem.quantity)}</span>
                          </div>
                          {(stock <= 0 || cartItem.quantity > stock) && <p role="alert" className="mt-2 text-xs font-medium text-red-700">{stock <= 0 ? t.out : `${t.left} ${stock}`}</p>}
                        </div>
                      </article>
                    );
                  })}
                </div>
                {stockIssues && <p id="cart-stock-alert" tabIndex={-1} role="alert" className="rounded-sm border border-red-700/20 bg-red-50 p-3 text-sm text-red-700">{t.stockError}</p>}
              </section>

              <section className={panel} aria-labelledby="delivery-title">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#00821A]">02 / {t.delivery}</p>
                <h2 id="delivery-title" className="mt-1 text-xl font-black uppercase tracking-tight sm:text-2xl">{t.contact}</h2>
                <p className="mt-2 text-sm leading-relaxed text-[#404040]">{t.details}</p>
                <p className="mt-2 text-xs text-[#404040]">{t.requiredNote}</p>
                <fieldset disabled={busy} className="mt-5 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                  <legend className="sr-only">{t.contact}</legend>
                  {FIELDS.map((field) => {
                    const name = field.name;
                    const id = `checkout-${name}`;
                    const error = formErrors[name];
                    return (
                      <div key={name} className={`min-w-0 ${"wide" in field && field.wide ? "sm:col-span-2" : ""}`}>
                        <label htmlFor={id} className="mb-1.5 block text-xs font-semibold text-[#404040]">{t.fields[name]} <span aria-hidden="true" className="text-[#00821A]">*</span></label>
                        <input id={id} name={name} type={field.type} autoComplete={field.autoComplete} required aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} value={formData[name]} onChange={(event) => handleFieldChange(name, event.target.value)} className={inputClass(name)} />
                        {error && <p id={`${id}-error`} role="alert" className="mt-1 text-xs text-red-700">{t[error]}</p>}
                      </div>
                    );
                  })}
                </fieldset>
                <fieldset disabled={busy} className="mt-6 min-w-0 border-t border-black/10 pt-5">
                  <legend className="sr-only">{t.shipping}</legend>
                  <h3 className="text-sm font-bold uppercase tracking-wide">{t.shipping}</h3>
                  <div className="mt-3 grid gap-2">
                    {(["FREE", "EXPRESS"] as const).map((option) => {
                      const selected = shippingOption === option;
                      const DeliveryIcon = option === "FREE" ? Truck : Zap;
                      return (
                        <label key={option} className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-sm border p-3 transition focus-within:ring-2 focus-within:ring-[#00821A]/30 ${selected ? "border-[#00821A] bg-[#00821A]/5" : "border-black/[0.15] hover:border-black/40"}`}>
                          <input type="radio" name="shipping" value={option} checked={selected} onChange={() => {setShippingOption(option); setPromoError(false);}} className="h-4 w-4 shrink-0 accent-[#00821A]" />
                          <DeliveryIcon size={20} className={selected ? "shrink-0 text-[#00821A]" : "shrink-0 text-[#404040]"} aria-hidden="true" />
                          <span className="min-w-0 flex-1 text-sm font-semibold">{option === "FREE" ? t.standard : t.express}</span>
                          <span className="shrink-0 text-xs font-bold tabular-nums text-[#00821A] sm:text-sm">{option === "FREE" ? t.free : money(10)}</span>
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              </section>
            </div>

            <aside className="min-w-0 space-y-4 lg:sticky lg:top-4" aria-labelledby="summary-title">
              <section className={`${panel} shadow-[0_8px_32px_rgba(0,0,0,0.05)]`}>
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#00821A]">03 / {t.confirmation}</p>
                <h2 id="summary-title" className="mt-1 text-xl font-black uppercase tracking-tight sm:text-2xl">{t.summary}</h2>
                <dl className="mt-5 space-y-3 border-y border-black/10 py-4 text-sm">
                  <div className="flex justify-between gap-3"><dt className="text-[#404040]">{t.subtotal}</dt><dd className="font-semibold tabular-nums">{money(subtotalRounded)}</dd></div>
                  <div className="flex justify-between gap-3"><dt className="text-[#404040]">{t.shippingFee}</dt><dd className="font-semibold tabular-nums">{shippingFee === 0 ? t.free : money(shippingFee)}</dd></div>
                  {activePromo && <div className="flex justify-between gap-3 text-[#00821A]"><dt>{t.discount}</dt><dd className="font-semibold tabular-nums">−{money(activePromo.discountCents / 100)}</dd></div>}
                </dl>
                <fieldset disabled={busy} className="mt-5 min-w-0">
                  <legend className="sr-only">{t.promo}</legend>
                  <label htmlFor="promo-code" className="mb-2 block text-xs font-bold">{t.promo}</label>
                  <div className="flex gap-2">
                    <input id="promo-code" type="text" maxLength={24} autoComplete="off" placeholder="GRIND10" value={promoInput} onChange={(event) => {setPromoInput(event.target.value.toUpperCase()); setPromoQuote(null); setPromoError(false);}} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); void applyPromo(); } }} className={`min-h-12 w-full min-w-0 rounded-sm border border-black/20 px-3 text-base uppercase sm:text-sm ${focus}`} />
                    <button type="button" disabled={busy || !promoInput.trim()} onClick={() => void applyPromo()} className={`inline-flex min-h-12 shrink-0 items-center justify-center rounded-sm bg-black px-3 text-xs font-bold text-white hover:bg-[#00821A] disabled:opacity-40 sm:px-4 ${focus}`}>{checkingPromo ? <Loader2 className="animate-spin" size={17} aria-label={t.checking} /> : t.apply}</button>
                  </div>
                  {promoError && <p role="alert" className="mt-2 text-xs text-red-700">{t.promoInvalid}</p>}
                  {promoQuote && !activePromo && <p role="status" className="mt-2 text-xs text-[#404040]">{t.promoChanged}</p>}
                  {activePromo && <div role="status" className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-semibold text-[#00821A]"><span className="inline-flex items-center gap-1"><Check size={14} aria-hidden="true" />{t.applied}: {activePromo.code}</span><button type="button" onClick={() => {setPromoInput("");setPromoQuote(null);setPromoError(false);}} className={`min-h-10 underline ${focus}`}>{t.removePromo}</button></div>}
                </fieldset>
                <div aria-live="polite" className="mt-5 rounded-sm bg-black px-4 py-5 text-white sm:px-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/[0.75]">{t.total}</p>
                  <p className="mt-1 break-words text-3xl font-black tabular-nums tracking-tight sm:text-4xl">{money(finalTotal)}</p>
                </div>
                <fieldset disabled={busy} className="mt-5 min-w-0 space-y-4">
                  <legend className="sr-only">{t.confirmation}</legend>
                  <div>
                    <div className="flex items-start gap-3">
                      <input id="agree-tc" type="checkbox" required checked={agreeTC} aria-invalid={tcError} aria-describedby={tcError ? "tc-error" : undefined} onChange={(event) => {setAgreeTC(event.target.checked); if (event.target.checked) setTcError(false);}} className="mt-1 h-5 w-5 shrink-0 accent-[#00821A]" />
                      <label htmlFor="agree-tc" className="cursor-pointer text-sm leading-relaxed">{t.termsStart}{" "}<Link href={localized("/terms-conditions")} target="_blank" rel="noopener noreferrer" className={`font-semibold text-[#00821A] underline underline-offset-2 ${focus}`}>{t.terms}</Link>.</label>
                    </div>
                    {tcError && <p id="tc-error" role="alert" className="mt-2 text-xs text-red-700">{t.termsError}</p>}
                  </div>
                  <div className="flex items-start gap-3 border-t border-black/10 pt-4">
                    <input id="marketing-opt-in" type="checkbox" checked={marketingOptIn} onChange={(event) => setMarketingOptIn(event.target.checked)} className="mt-1 h-5 w-5 shrink-0 accent-[#00821A]" />
                    <div><label htmlFor="marketing-opt-in" className="cursor-pointer text-sm leading-relaxed text-[#404040]">{t.marketing}</label><p className="mt-1 text-xs text-[#404040]">{t.optional}</p></div>
                  </div>
                </fieldset>
                <button type="submit" disabled={busy} aria-busy={isSubmitting} className={`mt-5 flex min-h-14 w-full items-center justify-center gap-3 rounded-sm bg-[#00821A] px-4 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-black disabled:cursor-not-allowed disabled:opacity-50 ${focus}`}>
                  {isSubmitting ? <Loader2 size={19} className="animate-spin" aria-hidden="true" /> : <ChevronRight size={19} aria-hidden="true" />}
                  {isSubmitting ? t.processing : t.submit}
                </button>
                {checkingPromo && <p role="status" className="mt-2 text-xs text-[#404040]">{t.checkingNotice}</p>}
              </section>
            </aside>
          </form>
        )}
      </Container>
    </main>
  );
};

export default function Cart() {
  return (
    <Suspense fallback={<div className="min-h-[40vh] bg-white" aria-busy="true" />}>
      <CartContent />
    </Suspense>
  );
}
