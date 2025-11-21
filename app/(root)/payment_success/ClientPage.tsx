/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import useCart from "@/lib/hooks/useCart"; // <-- import your cart hook
import Button from "@/components/mbg-components/Button";

const STOREFRONT_SERVICE_TOKEN = process.env.NEXT_PUBLIC_STOREFRONT_SERVICE_TOKEN?.trim();

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function extractPayPalStatus(payload: unknown): string | null {
  if (payload === null || typeof payload !== "object") {
    return null;
  }

  const directStatus = (payload as any)?.status;
  if (typeof directStatus === "string" && directStatus.trim().length > 0) {
    return directStatus.trim().toUpperCase();
  }

  const firstPurchaseUnit = Array.isArray((payload as any)?.purchase_units)
    ? (payload as any).purchase_units[0]
    : null;
  const firstCapture = Array.isArray(firstPurchaseUnit?.payments?.captures)
    ? firstPurchaseUnit.payments.captures[0]
    : null;
  const captureStatus = typeof firstCapture?.status === "string" ? firstCapture.status.trim() : null;

  return captureStatus ? captureStatus.toUpperCase() : null;
}

export default function PaymentSuccess() {
  const search = useSearchParams();
  const router = useRouter();
  const clearCart = useCart((state) => state.clearCart);

  const [status, setStatus] = useState<"loading" | "ok" | "err">("loading");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState<string | null>(null);
  const processedSessionRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const resolveOrderId = () => {
      const paramSession =
        search?.get("session_id") ||
        search?.get("orderId") ||
        search?.get("token");

      if (paramSession) {
        return paramSession;
      }

      if (typeof window === "undefined") {
        return null;
      }

      try {
        return window.sessionStorage.getItem("mbg-last-paypal-order");
      } catch {
        return null;
      }
    };

    const currentSession = resolveOrderId();

    if (!currentSession) {
      setStatus("err");
      setMessage("Missing PayPal order reference.");
      return;
    }

    if (processedSessionRef.current === currentSession) {
      return;
    }
    processedSessionRef.current = currentSession;
    setOrderId(currentSession);

    const verifyOrder = async () => {
      let confirmationMessage = "Payment confirmed. Your order is being processed.";
      const encodedSession = encodeURIComponent(currentSession);
      const payerId =
        search?.get("PayerID") ||
        search?.get("payerId") ||
        search?.get("payer_id") ||
        null;

      let captureSucceeded = false;

      try {
        const captureResponse = await fetch("/api/paypal/capture", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(STOREFRONT_SERVICE_TOKEN
              ? { Authorization: `Bearer ${STOREFRONT_SERVICE_TOKEN}` }
              : {}),
          },
          body: JSON.stringify({
            orderId: currentSession,
            token: currentSession,
            payerId,
          }),
          cache: "no-store",
        });

        const captureBody = await readResponseBody(captureResponse);
        const captureStatus = extractPayPalStatus(captureBody);

        if (captureResponse.ok) {
          const normalizedStatus = captureStatus ?? undefined;
          if (normalizedStatus === "PAYER_ACTION_REQUIRED") {
            captureSucceeded = false;
            confirmationMessage =
              "Your PayPal payment still needs a final confirmation. Follow the instructions in PayPal to finish the payment.";
            console.warn("[checkout] PayPal capture requires payer action", {
              status: captureStatus,
              body: captureBody,
            });
          } else {
            captureSucceeded = true;
          }
        } else {
          console.error("[checkout] PayPal capture failed", {
            status: captureResponse.status,
            body: captureBody,
          });
          confirmationMessage =
            "We received your PayPal approval, but payment capture is still pending. We will confirm shortly.";
        }
      } catch (error) {
        console.error("[checkout] PayPal capture request failed", error);
        confirmationMessage =
          "We received your PayPal approval, but payment capture is still pending. We will confirm shortly.";
      }

      if (captureSucceeded) {
        try {
          const response = await fetch(`/api/orders/${encodedSession}`, {
            headers: {
              Accept: "application/json",
              ...(STOREFRONT_SERVICE_TOKEN
                ? { Authorization: `Bearer ${STOREFRONT_SERVICE_TOKEN}` }
                : {}),
            },
            cache: "no-store",
          });

          if (!response.ok) {
            confirmationMessage =
              "Payment captured. We will confirm your order shortly.";
          }
        } catch (error) {
          console.error("[checkout] order verification failed", error);
          confirmationMessage =
            "Payment captured. We will confirm your order shortly.";
        }
      }

      if (!cancelled) {
        if (captureSucceeded) {
          if (typeof clearCart === "function") {
            clearCart();
          } else if (typeof window !== "undefined") {
            try {
              localStorage.removeItem("cart-storage");
            } catch {
              // ignore storage failures
            }
          }
        }

        if (typeof window !== "undefined") {
          try {
            window.sessionStorage.removeItem("mbg-last-paypal-order");
          } catch {
            // ignore storage failures
          }
        }

        setStatus(captureSucceeded ? "ok" : "err");
        setMessage(confirmationMessage);
      }
    };

    verifyOrder();

    return () => {
      cancelled = true;
    };
  }, [clearCart, search]);

  return (
    <main className="min-h-[50vh] flex flex-col items-center justify-center p-8">
      {status === "loading" && (
        <p className="text-[10px] font-medium uppercase text-mbg-black tracking-wide">
          Finalizing your payment.
        </p>
      )}
      {status === "ok" && (
        <>
          <h1 className="text-xl md:text-3xl font-bold text-mbg-green">
            Order Placed Successfully
          </h1>
          <p className="mt-2 text-[10px] font-medium uppercase tracking-wide">{message}</p>
          {orderId && (
            <p className="mt-1 text-[10px] text-mbg-black/60 uppercase tracking-wide">
              PayPal Reference: {orderId}
            </p>
          )}
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
