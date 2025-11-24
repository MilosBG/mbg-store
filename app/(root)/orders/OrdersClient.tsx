'use client';

import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef } from "react";

import Separator from "@/components/mbg-components/Separator";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { StatusBadge, STATUS_MESSAGES } from "@/components/orders/StatusBadge";
import type { StorefrontOrder, StorefrontOrderProduct } from "@/lib/actions/actions";

const FALLBACK_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
const FOCUS_REFRESH_THROTTLE_MS = 5000;
const SHIPPING_LABELS = {
  EXPRESS: "Express Delivery",
  EXPRESS_DELIVERY: "Express Delivery",
  FREE: "Free Delivery",
  FREE_DELIVERY: "Free Delivery",
  STANDARD: "Standard Delivery",
};

export type OrdersClientError = {
  type: "unauthorized" | "network" | "unknown";
  message: string;
  status?: number;
};

type OrdersClientProps = {
  orders: StorefrontOrder[];
  error: OrdersClientError | null;
};

export default function OrdersClient({ orders, error }: OrdersClientProps) {
  const router = useRouter();
  const lastRefreshRef = useRef<number>(0);

  const triggerRefresh = useCallback(() => {
    const now = Date.now();
    if (now - lastRefreshRef.current < FOCUS_REFRESH_THROTTLE_MS) {
      return;
    }
    lastRefreshRef.current = now;
    router.refresh();
  }, [router]);

  useEffect(() => {
    const handleFocus = () => triggerRefresh();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        triggerRefresh();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [triggerRefresh]);

  const retryButton = (
    <button
      onClick={triggerRefresh}
      className="mt-3 inline-flex items-center justify-center rounded-sm border border-mbg-green px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-mbg-green hover:bg-mbg-green/10"
      type="button"
    >
      Retry
    </button>
  );

  if (error) {
    return (
      <div className="flex flex-col gap-2 py-3">
        <p className="uppercase text-[11px] tracking-widest font-bold text-mbg-green">
          {error.message}
        </p>
        {error.type === "unauthorized" ? (
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/sign-in"
              className="inline-flex items-center justify-center rounded-sm border border-mbg-green px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-mbg-green hover:bg-mbg-green/10"
            >
              Sign In
            </Link>
            {retryButton}
          </div>
        ) : (
          retryButton
        )}
      </div>
    );
  }

  if (!orders.length) {
    return (
      <p className="uppercase text-[11px] tracking-widest font-bold text-mbg-green py-3">
        You Have No Order Yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-10">
      {orders.map((order) => (
        <div
          key={order._id}
          className="flex flex-col gap-8 p-4 hover:bg-mbg-green/20 bg-mbg-black/7"
        >
          <div className="flex gap-8 items-center justify-between flex-wrap">
            <p className="font-bold uppercase text-xs">
              Order ID{" "}
              <Link
                href={`/orders/${order._id}`}
                className="text-mbg-green font-bold uppercase text-xs tracking-widest"
              >
                {order._id}
              </Link>
            </p>
            <div className="mbg-p-between space-x-2">
              <label className="font-bold uppercase text-xs">Total Amount</label>
              <p className="text-mbg-green font-bold uppercase text-xs tracking-widest">
                €{" "}
                {formatAmount(order.totalAmount)}
              </p>
            </div>
            <div className="mbg-p-between space-x-2">
              <label className="font-bold uppercase text-xs">Shipping</label>
              <p className="text-mbg-green font-bold uppercase text-xs tracking-widest">
                {formatShippingMethod(order.shippingMethod)}
              </p>
            </div>
            <StatusBadge
              status={String(order.fulfillmentStatus || "PENDING").toUpperCase()}
            />
          </div>

          <div>
            <OrderTimeline order={order} />
          </div>

          <p className="text-xs text-mbg-black/80">
            {STATUS_MESSAGES[String(order.fulfillmentStatus || "PENDING").toUpperCase()] || ""}
          </p>

          <div className="flex flex-col gap-5 mb-5">
            <Separator className="border-mbg-green" />
            {(order.products ?? []).map((orderItem, idx) => (
              <OrderProduct key={orderItem._id ?? idx} product={orderItem} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function OrderProduct({ product }: { product: StorefrontOrderProduct }) {
  const imageSrc = product.product?.media?.[0] || FALLBACK_IMAGE;
  const unitPrice = product.unitPrice ?? product.product?.price ?? 0;

  return (
    <div className="flex gap-4">
      <Image
        src={imageSrc}
        alt={product.product?.title || "Product"}
        width={100}
        height={100}
        className="w-24 h-24 rounded-xs object-contain bg-mbg-rgbablank"
      />
      <div className="flex flex-col justify-between">
        <p className="font-bold tracking-widest text-[9.5px] uppercase">
          Title{" "}
          <span className="font-bold tracking-widest text-[9.5px] uppercase text-mbg-green ml-2">
            {product.product?.title || "Product"}
          </span>
        </p>
        {product.color && (
          <p className="font-bold tracking-widest text-[9.5px] uppercase">
            Color{" "}
            <span className="font-bold tracking-widest text-[9.5px] uppercase text-mbg-green ml-2">
              {product.color}
            </span>
          </p>
        )}
        {product.size && (
          <p className="font-bold tracking-widest text-[9.5px] uppercase">
            Size{" "}
            <span className="font-bold tracking-widest text-[9.5px] uppercase text-mbg-green ml-2">
              {product.size}
            </span>
          </p>
        )}
        <p className="font-bold tracking-widest text-[9.5px] uppercase">
          Unit Price{" "}
          <span className="font-bold tracking-widest text-[9.5px] uppercase text-mbg-green ml-2">
            €{" "}
            {formatAmount(unitPrice)}
          </span>
        </p>
        <p className="font-bold tracking-widest text-[9.5px] uppercase">
          Quantity{" "}
          <span className="font-bold tracking-widest text-[9.5px] uppercase text-mbg-green ml-2">
            {product.quantity}
          </span>
        </p>
      </div>
    </div>
  );
}

function formatAmount(value: unknown): string {
  const numeric = typeof value === "number" ? value : Number(value ?? 0);
  if (!Number.isFinite(numeric)) {
    return "0.00";
  }
  return numeric.toFixed(2);
}

function formatShippingMethod(value: string | undefined | null): string {
  if (!value) return "Standard Delivery";
  const normalized = value.trim().toUpperCase();
  if (SHIPPING_LABELS[normalized as keyof typeof SHIPPING_LABELS]) {
    return SHIPPING_LABELS[normalized as keyof typeof SHIPPING_LABELS];
  }
  if (normalized.includes("EXPRESS")) return "Express Delivery";
  if (normalized.includes("FREE")) return "Free Delivery";
  return value;
}
