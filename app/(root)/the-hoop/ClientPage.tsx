/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Container from "@/components/mbg-components/Container";
import { Grinder } from "@/images";
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

  const [shippingOption, setShippingOption] = useState<"FREE" | "EXPRESS">("FREE");

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
  // NEW: T&C agreement state
  const [agreeTC, setAgreeTC] = useState(false);
  const [tcError, setTcError] = useState<string | null>(null);

  const primaryEmail = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const defaultFirstName = user?.firstName ?? "";
  const defaultLastName = user?.lastName ?? "";
  const defaultPhone =
    user?.primaryPhoneNumber?.phoneNumber ?? user?.phoneNumbers?.[0]?.phoneNumber ?? "";

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
    0
  );
  const subtotalRounded = Number(subtotal.toFixed(2));
  const shippingFee = shippingOption === "EXPRESS" ? 10 : 0;
  const finalTotal = Number((subtotal + shippingFee).toFixed(2));
  // Variant-aware stock check per line
  const lineStock = (ci: { item: any; color?: string; size?: string }) => {
    const vars = ci?.item?.variants ?? [];
    if (Array.isArray(vars) && vars.length > 0) {
      const match = vars.find(
        (v: any) => (v.color ?? "") === (ci.color ?? "") && (v.size ?? "") === (ci.size ?? "")
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
      toast.error("Please adjust your cart. Some items exceed the available stock.");
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
        "w-full rounded-xs border bg-mbg-rgbablank px-3 py-2 text-xs uppercase tracking-widest text-mbg-black transition duration-200 focus:outline-none focus:ring-2",
        formErrors[field] ? "border-red-500 focus:ring-red-500" : "border-mbg-green focus:ring-mbg-green",
      ].join(" "),
    [formErrors],
  );

  const handleFieldChange = useCallback((field: keyof CheckoutFormState, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const validateForm = useCallback((): CheckoutFormErrors => {
    const errors: CheckoutFormErrors = {};
    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      errors.email = `${FIELD_LABELS.email} is required.`;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = "Enter a valid email address.";
    }

    (["firstName", "lastName", "address", "city", "postalCode", "country", "phone"] as Array<
      keyof CheckoutFormState
    >).forEach((field) => {
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

        setFormErrors({});
        clearCart();
        toast.success(
       "Order created. We will reach out with payment instructions.",
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to create order. Please try again.";
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
      formData,
      shippingOption,
      validateForm,
    ],
  );

  return (
    <Container className="min-h-screen">
      <div className="flex gap-4 max-lg:flex-col ">
        <div className="w-2/3 max-lg:w-full">
          <p className="heading2-bold py-3">The Hoop</p>
          <hr className="py-3 bg-mbg-black/7 border-mbg-green" />

          {cart.cartItems.length === 0 ? (
            <>
              <p className="uppercase text-[11px] tracking-widest font-bold text-mbg-green py-3">
                Empty Hoop...
              </p>
              <div>
                <Image src={Grinder} alt="Grinder" className="bg-mbg-white/46" />
                <Link href="/" className="mbg-prime-full mbg-p-center">
                  Shoot Now
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
                    className="w-full max-sm:flex-col max-sm:gap-3 gap-3 hover:bg-mbg-green/7 hoverEffect px-5 py-5 border-b bg-mbg-white/46 border-mbg-black/7"
                  >
                    <div className="flex items-start">
                      <div className="relative">
                        <Image
                          src={media?.[0] ?? "/placeholder.png"}
                          alt={title ?? "Item"}
                          width={100}
                          height={100}
                          className="w-24 h-24 rounded-xs object-contain bg-mbg-rgbablank"
                        />
                        <Trash2
                          className="mbg-icon hover:text-mbg-green hoverEffect cursor-pointer absolute top-1 right-1 bg-mbg-black/7 p-0.5 "
                          onClick={() => cart.removeItem(_id, cartItem.color, cartItem.size)}
                        />
                      </div>

                      <div className="ml-4">
                        <Link href={`/products/${_id}`}>
                          <p className="font-bold tracking-widest text-[10px] uppercase">
                            {title}
                          </p>
                        </Link>
                        <p className="text-[10px] text-mbg-black/60 uppercase">
                          {cartItem.color || ""} {cartItem.size || ""}
                        </p>
                        <p className="uppercase text-[11px] font-semibold text-mbg-green">
                          € {price}
                        </p>
                      </div>
                    </div>

                    <div className="flex w-full justify-between items-center p-2 mt-2 bg-mbg-black/7">
                      <div
                        role="button"
                        onClick={() => cart.decreaseQuantity(_id, cartItem.color, cartItem.size)}
                        className="mbg-p-center bg-mbg-black/7 py-0.5 px-2.5 font-bold hover:bg-mbg-green hover:text-mbg-white hoverEffect rounded-xs cursor-pointer"
                      >
                        -
                      </div>
                      <p className="font-bold text-[11px] text-mbg-green">
                        {cartItem.quantity}
                      </p>
                      <div
                        role="button"
                        onClick={() => cart.increaseQuantity(_id, cartItem.color, cartItem.size)}
                        className="mbg-p-center bg-mbg-black/7 py-0.5 px-2.5 font-bold hover:bg-mbg-green hover:text-mbg-white hoverEffect rounded-xs cursor-pointer"
                      >
                        +
                      </div>
                    </div>
                    {lineStock(cartItem) <= 0 && (
                      <p className="text-[10px] text-red-600 mt-1">Out of stock</p>
                    )}
                    {lineStock(cartItem) > 0 && cartItem.quantity > lineStock(cartItem) && (
                      <p className="text-[10px] text-red-600 mt-1">Only {lineStock(cartItem)} left</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="w-1/3 max-lg:w-full flex flex-col gap-3 bg-mbg-black/7 mt-5 px-4 py-4.5">
          <p className="text-sm font-bold uppercase text-mbg-black">
            Summary{" "}
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
          <div className="mbg-p-between items-center">
            <label className="text-xs uppercase font-bold text-mbg-black/46">
              Shipping
            </label>
            <select
              value={shippingOption}
              onChange={(e) => setShippingOption(e.target.value as "FREE" | "EXPRESS")}
              className="text-mbg-green bg-mbg-rgbablank focus:ring-mbg-green focus:border-mbg-green rounded-xs border px-3 py-1 text-xs transition duration-200 focus:ring-2 focus:outline-none"
            >
              <option value="FREE">FREE DELIVERY (0€)</option>
              <option value="EXPRESS">EXPRESS DELIVERY (10€)</option>
            </select>
          </div>

          {/* Final total (subtotal + shipping) */}
          <div className="mbg-p-between">
            <span className="text-xs uppercase font-bold text-mbg-black/46">
              Total
            </span>
            <span className="text-xs text-mbg-green uppercase font-bold">
              € {finalTotal}
            </span>
          </div>
          <hr className=" border-mbg-green" />
          <p className="text-[9px] uppercase text-mbg-green">All taxes included</p>
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
            <label htmlFor="agree-tc" className="text-[11px] leading-5 uppercase">
              I have read and agree to the{" "}
              <Link href="/terms-conditions" className="mbg-link" target="_blank" rel="noopener noreferrer">
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
          <form className="mt-3 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <div>
              <p className="text-xs uppercase font-bold text-mbg-black/46">Contact Details</p>
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
                  placeholder="admin@example.com"
                  onChange={(event) => handleFieldChange("email", event.target.value)}
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
              <p className="text-xs uppercase font-bold text-mbg-black/46">Delivery</p>
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
                      onChange={(event) => handleFieldChange("firstName", event.target.value)}
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
                      onChange={(event) => handleFieldChange("lastName", event.target.value)}
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
                    onChange={(event) => handleFieldChange("address", event.target.value)}
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
                      onChange={(event) => handleFieldChange("city", event.target.value)}
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
                      onChange={(event) => handleFieldChange("postalCode", event.target.value)}
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
                      onChange={(event) => handleFieldChange("country", event.target.value)}
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
                      onChange={(event) => handleFieldChange("phone", event.target.value)}
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
              className="mbg-prime-full mbg-p-center mt-1 w-full disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Submit order"}
            </button>
          </form>
        </div>
      </div>
    </Container>
  );
};

export default Cart;
