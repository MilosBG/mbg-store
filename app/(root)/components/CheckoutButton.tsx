/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { createPayPalCheckout } from "@/lib/checkoutClient";
import { toast } from "react-hot-toast";

type Props = {
  cartItems: any[];
  customer: { clerkId: string; name?: string; email?: string };
  shippingOption?: "FREE" | "EXPRESS";
};

export default function CheckoutButton({
  cartItems,
  customer,
  shippingOption = "FREE",
}: Props) {
  const [loading, setLoading] = useState(false);
  const stockFor = (ci: any) => {
    const vars = ci?.item?.variants ?? [];
    if (Array.isArray(vars) && vars.length > 0) {
      const match = vars.find(
        (v: any) => (v.color ?? "") === (ci.color ?? "") && (v.size ?? "") === (ci.size ?? "")
      );
      return Number(match?.stock ?? 0);
    }
    return Number(ci?.item?.countInStock ?? 0);
  };
  const stockIssues = (cartItems ?? []).some((ci: any) => stockFor(ci) < (ci?.quantity ?? 0));

  const handleCheckout = async () => {
    if (stockIssues) {
      toast.error("Please adjust your cart before checking out.");
      return;
    }

    if (!customer?.clerkId) {
      toast.error("Please sign in to checkout.");
      return;
    }

    const lines = (cartItems ?? [])
      .map((ci: any) => ({
        productId: ci?.item?._id ?? ci?.productId ?? "",
        quantity: Number(ci?.quantity ?? 0),
        unitPrice: Number(ci?.item?.price ?? ci?.unitPrice ?? 0),
        color: ci?.color ?? null,
        size: ci?.size ?? null,
        title: ci?.item?.title ?? ci?.title ?? null,
        image: ci?.item?.media?.[0] ?? ci?.image ?? null,
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
          clerkId: customer.clerkId,
          email: customer.email ?? null,
          name: customer.name ?? null,
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
    <button onClick={handleCheckout} disabled={loading || stockIssues}>
      {loading ? "Redirecting…" : "Pay with PayPal"}
    </button>
  );
}



