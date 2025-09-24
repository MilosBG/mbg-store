/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useCart from "@/lib/hooks/useCart"; // <-- import your cart hook
import Button from "@/components/mbg-components/Button";


export default function PaymentSuccess() {
  const search = useSearchParams();
  const router = useRouter();
  const cart = useCart();
  const token = search.get("token") || search.get("orderId");

  const [status, setStatus] = useState<"loading"|"ok"|"err">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        setStatus("err");
        setMessage("Missing PayPal token.");
        return;
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/paypal/capture`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: token }),
        });
        if (!res.ok) throw new Error("Capture failed");

        if (!cancelled) {
          // Clear cart (only after confirmed capture)
          if (typeof cart?.clearCart === "function") cart.clearCart();
          else if (typeof window !== "undefined") {
            // fallback if your hook doesn't expose clearCart
            // match zustand persist key in lib/hooks/useCart.tsx
            localStorage.removeItem("cart-storage");
          }

          setStatus("ok");
          setMessage("Valid Payment. Your order is being processed");
        }
      } catch (e: any) {
        if (!cancelled) {
          setStatus("err");
          setMessage(e?.message || "Capture failed");
        }
      }
    })();
    return () => { cancelled = true; };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <main className="min-h-[50vh] flex flex-col items-center justify-center p-8">
      {status === "loading" && <p className="text-[10px] font-medium uppercase text-mbg-black tracking-wide">Finalizing your payment…</p>}
      {status === "ok" && (
        <>
          <h1 className="text-3xl font-bold text-mbg-green">Order Placed Successfully</h1>
          <p className="mt-2 text-[10px] font-medium uppercase tracking-wide">{message}</p>
          <Button mbg="prime" className="mt-2" onClick={() => router.push("/")}>
            Keep shooting
          </Button>
        </>
      )}
      {status === "err" && (
        <>
          <h1 className="text-3xl font-bold text-mbg-blue">Payment issue</h1>
          <p className="mt-2  text-[10px] font-medium uppercase tracking-wide">{message}</p>
          <Button mbg="prime" className="mt-2" onClick={() => router.push("/the-hoop")}>
            Back to the hoop
          </Button>
        </>
      )}
    </main>
  );
}
