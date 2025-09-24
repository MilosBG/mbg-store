/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";

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
    setLoading(true);
    try {
      if (stockIssues) {
        throw new Error("Some items are out of stock or exceed available quantity");
      }
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cartItems, customer, shippingOption }),
      });
      if (!res.ok) throw new Error("Checkout failed");
      const { approveUrl } = await res.json();
      window.location.href = approveUrl; // redirect to PayPal
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
