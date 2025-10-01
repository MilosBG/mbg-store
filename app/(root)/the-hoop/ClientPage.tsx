/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Button from "@/components/mbg-components/Button";
import Container from "@/components/mbg-components/Container";
import { Grinder } from "@/images";
import useCart from "@/lib/hooks/useCart";
import { createPayPalCheckout } from "@/lib/checkoutClient";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

const Cart = () => {
  const router = useRouter();
  const { user } = useUser();
  const cart = useCart();

  const [loading, setLoading] = useState(false);
  const [shippingOption, setShippingOption] = useState<"FREE" | "EXPRESS">("FREE");

  // NEW: T&C agreement state
  const [agreeTC, setAgreeTC] = useState(false);
  const [tcError, setTcError] = useState<string | null>(null);

  const subtotal = cart.cartItems.reduce(
    (acc, cartItem) => acc + cartItem.item.price * cartItem.quantity,
    0
  );
  const subtotalRounded = Number(subtotal.toFixed(2));
  const shippingFee = shippingOption === "EXPRESS" ? 20 : 0;
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

  const handleCheckout = async () => {
    if (!agreeTC) {
      setTcError("Please accept the Terms & Conditions to continue.");
      return;
    }
    setTcError(null);

    if (stockIssues) {
      toast.error("Please adjust your cart. Some items exceed the available stock.");
      return;
    }

    if (!user) {
      toast.error("Please sign in to checkout.");
      router.push("/sign-in");
      return;
    }

    const lines = cart.cartItems
      .map((cartItem) => ({
        productId: cartItem.item._id,
        quantity: cartItem.quantity,
        unitPrice: Number(cartItem.item.price ?? 0),
        color: cartItem.color ?? null,
        size: cartItem.size ?? null,
        title: cartItem.item.title ?? null,
        image: cartItem.item.media?.[0] ?? null,
      }))
      .filter((line) => line.productId && line.quantity > 0);

    if (lines.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    setLoading(true);
    try {
      const result = await createPayPalCheckout({
        lines,
        customer: {
          clerkId: user.id,
          email: user.emailAddresses[0]?.emailAddress ?? null,
          name: user.fullName ?? null,
        },
        shippingOption,
      });
      window.location.href = result.approveUrl;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Checkout failed.";
      toast.error(message);
      console.error("[checkout] start failed", error);
    } finally {
      setLoading(false);
    }
  };

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
              <option value="EXPRESS">EXPRESS DELIVERY (+20€)</option>
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
              className="mt-0.5 h-3 w-3 rounded-xs border-mbg-black/30 text-mbg-green focus:ring-mbg-green"
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

          <Button
            onClick={handleCheckout}
            className="mt-2.5"
            mbg="primefull"
            disabled={cart.cartItems.length === 0 || loading || !agreeTC || stockIssues}
            aria-disabled={cart.cartItems.length === 0 || loading || !agreeTC || stockIssues}
            aria-describedby={!agreeTC ? "agree-tc" : undefined}
          >
            {loading ? "Redirecting…" : "Checkout with PayPal"}
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default Cart;

