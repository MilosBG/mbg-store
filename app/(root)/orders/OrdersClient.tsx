"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useTransition,
} from "react";

import { useRouter } from "next/navigation";

import Image from "next/image";
import Link from "next/link";

import {
  OrderTimeline,
} from "@/components/orders/OrderTimeline";

import {
  StatusBadge,
  STATUS_MESSAGES,
} from "@/components/orders/StatusBadge";

import type {
  StorefrontOrder,
  StorefrontOrderProduct,
} from "@/lib/actions/actions";

/* =========================================================
   CONSTANTS
========================================================= */

const FALLBACK_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

const FOCUS_REFRESH_THROTTLE_MS = 5000;

const SHIPPING_LABELS = {
  EXPRESS: "Express Delivery",
  EXPRESS_DELIVERY: "Express Delivery",
  FREE: "Free Delivery",
  FREE_DELIVERY: "Free Delivery",
  STANDARD: "Standard Delivery",
  STANDARD_DELIVERY: "Standard Delivery",
};

/* =========================================================
   TYPES
========================================================= */

export type OrdersClientError = {
  type:
    | "unauthorized"
    | "network"
    | "unknown";

  message: string;

  status?: number;
};

type OrdersClientProps = {
  orders: StorefrontOrder[];

  error: OrdersClientError | null;
};

/* =========================================================
   COMPONENT
========================================================= */

export default function OrdersClient({
  orders,
  error,
}: OrdersClientProps) {
  const router = useRouter();

  const lastRefreshRef =
    useRef<number>(0);

  const [
    isRefreshing,
    startTransition,
  ] = useTransition();

  /* =======================================================
     REFRESH
  ======================================================= */

  const triggerRefresh = useCallback(
    (force = false) => {
      const now = Date.now();

      if (
        !force &&
        now - lastRefreshRef.current <
          FOCUS_REFRESH_THROTTLE_MS
      ) {
        return;
      }

      lastRefreshRef.current = now;

      startTransition(() => {
        router.refresh();
      });
    },
    [router]
  );

  /* =======================================================
     REFRESH WHEN TAB BECOMES ACTIVE
  ======================================================= */

  useEffect(() => {
    const handleFocus = () => {
      triggerRefresh(false);
    };

    const handleVisibility = () => {
      if (
        document.visibilityState === "visible"
      ) {
        triggerRefresh(false);
      }
    };

    window.addEventListener(
      "focus",
      handleFocus
    );

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, [triggerRefresh]);

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <section
        className="
          flex
          min-h-[280px]
          flex-col
          items-center
          justify-center
          border
          border-mbg-black/10
          bg-mbg-black/[0.025]
          px-6
          py-14
          text-center
        "
      >
        <span className="mb-4 text-[9px] font-extrabold uppercase tracking-[0.25em] text-mbg-green">
          Unable to load orders
        </span>

        <h3 className="text-xl font-extrabold uppercase tracking-tight text-mbg-black">
          Something went wrong
        </h3>

        <p className="mt-3 max-w-md text-[11px] leading-relaxed text-mbg-black/55">
          {error.message}
        </p>

        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          {error.type ===
            "unauthorized" && (
            <Link
              href="/sign-in"
              className="
                inline-flex
                min-h-11
                items-center
                justify-center
                bg-mbg-black
                px-6
                text-[10px]
                font-extrabold
                uppercase
                tracking-[0.18em]
                text-white
                transition-colors
                duration-300
                hover:bg-mbg-green
              "
            >
              Sign In
            </Link>
          )}

          <button
            type="button"
            disabled={isRefreshing}
            onClick={() =>
              triggerRefresh(true)
            }
            className="
              inline-flex
              min-h-11
              items-center
              justify-center
              border
              border-mbg-black
              px-6
              text-[10px]
              font-extrabold
              uppercase
              tracking-[0.18em]
              text-mbg-black
              transition-all
              duration-300
              hover:border-mbg-green
              hover:bg-mbg-green
              hover:text-white
              disabled:cursor-wait
              disabled:opacity-50
            "
          >
            {isRefreshing
              ? "Refreshing..."
              : "Try Again"}
          </button>
        </div>
      </section>
    );
  }

  /* =======================================================
     EMPTY STATE
  ======================================================= */

  if (!orders.length) {
    return (
      <section
        className="
          flex
          min-h-[320px]
          flex-col
          items-center
          justify-center
          border
          border-mbg-black/10
          bg-mbg-black/[0.025]
          px-6
          py-14
          text-center
        "
      >
        <span
          className="
            mb-5
            flex
            h-14
            w-14
            items-center
            justify-center
            rounded-full
            border
            border-mbg-black/10
            text-xl
          "
        >
          +
        </span>

        <span className="mb-3 text-[9px] font-extrabold uppercase tracking-[0.25em] text-mbg-green">
          Order history
        </span>

        <h3 className="text-xl font-extrabold uppercase tracking-tight text-mbg-black md:text-2xl">
          No orders yet
        </h3>

        <p className="mt-3 max-w-sm text-[11px] leading-relaxed text-mbg-black/55">
          Your purchases will appear here once
          you place your first order.
        </p>

        <Link
          href="/"
          className="
            mt-7
            inline-flex
            min-h-11
            items-center
            justify-center
            bg-mbg-black
            px-7
            text-[10px]
            font-extrabold
            uppercase
            tracking-[0.18em]
            text-white
            transition-colors
            duration-300
            hover:bg-mbg-green
          "
        >
          Explore Milos BG
        </Link>
      </section>
    );
  }

  /* =======================================================
     ORDERS LIST
  ======================================================= */

  return (
    <div className="flex flex-col gap-6 md:gap-8">
      {orders.map((order) => {
        const status = String(
          order.fulfillmentStatus ||
            "PENDING"
        ).toUpperCase();

        const products =
          order.products ?? [];

        const totalQuantity =
          products.reduce(
            (total, item) =>
              total +
              Number(
                item.quantity ?? 1
              ),
            0
          );

        return (
          <article
            key={order._id}
            className="
              group
              overflow-hidden
              border
              border-mbg-black/10
              bg-[#f3f3f3]
              transition-all
              duration-300
              ease-out
              hover:-translate-y-[2px]
              hover:border-mbg-black/20
              hover:shadow-[0_16px_45px_rgba(0,0,0,0.07)]
            "
          >
            {/* ===============================================
                HEADER
            ================================================ */}

            <div className="px-5 pt-5 sm:px-7 sm:pt-7">
              <div
                className="
                  flex
                  flex-col
                  gap-5
                  sm:flex-row
                  sm:items-start
                  sm:justify-between
                "
              >
                <div className="min-w-0">
                  <p className="text-[8px] font-extrabold uppercase tracking-[0.25em] text-mbg-black/40">
                    Order
                  </p>

                  <Link
                    href={`/orders/${order._id}`}
                    className="
                      mt-1
                      block
                      max-w-full
                      break-all
                      text-[11px]
                      font-extrabold
                      uppercase
                      tracking-[0.08em]
                      text-mbg-black
                      transition-colors
                      duration-200
                      hover:text-mbg-green
                    "
                  >
                    #{order._id}
                  </Link>
                </div>

                <div className="shrink-0">
                  <StatusBadge
                    status={status}
                  />
                </div>
              </div>
            </div>

            {/* ===============================================
                ORDER STATS
            ================================================ */}

            <div
              className="
                mt-6
                grid
                grid-cols-1
                border-y
                border-mbg-black/10
                sm:grid-cols-3
              "
            >
              <OrderStat
                label="Total"
                value={`€ ${formatAmount(
                  order.totalAmount
                )}`}
              />

              <OrderStat
                label="Shipping"
                value={formatShippingMethod(
                  order.shippingMethod
                )}
                border
              />

              <OrderStat
                label={
                  totalQuantity === 1
                    ? "Item"
                    : "Items"
                }
                value={String(
                  totalQuantity
                )}
                border
              />
            </div>

            {/* ===============================================
                TIMELINE
            ================================================ */}

            <div className="px-5 py-7 sm:px-7 sm:py-8">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-[8px] font-extrabold uppercase tracking-[0.25em] text-mbg-black/40">
                  Order Progress
                </span>

                <span className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-mbg-green">
                  {status.replaceAll(
                    "_",
                    " "
                  )}
                </span>
              </div>

              <OrderTimeline
                order={order}
              />

              {STATUS_MESSAGES[
                status
              ] && (
                <div
                  className="
                    mt-6
                    border-l-2
                    border-mbg-green
                    bg-white/45
                    px-4
                    py-3
                  "
                >
                  <p className="text-[11px] font-medium leading-relaxed text-mbg-black/65">
                    {
                      STATUS_MESSAGES[
                        status
                      ]
                    }
                  </p>
                </div>
              )}
            </div>

            {/* ===============================================
                PRODUCTS
            ================================================ */}

            {products.length > 0 && (
              <div className="border-t border-mbg-black/10">
                <div className="px-5 pt-6 sm:px-7">
                  <span className="text-[8px] font-extrabold uppercase tracking-[0.25em] text-mbg-black/40">
                    Items in this order
                  </span>
                </div>

                <div className="divide-y divide-mbg-black/10 px-5 sm:px-7">
                  {products.map(
                    (
                      orderItem,
                      index
                    ) => (
                      <OrderProduct
                        key={
                          orderItem._id ??
                          index
                        }
                        product={
                          orderItem
                        }
                      />
                    )
                  )}
                </div>
              </div>
            )}

            {/* ===============================================
                FOOTER CTA
            ================================================ */}

            <div
              className="
                flex
                flex-col
                gap-4
                border-t
                border-mbg-black/10
                bg-white/35
                px-5
                py-5
                sm:flex-row
                sm:items-center
                sm:justify-between
                sm:px-7
              "
            >
              <p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-mbg-black/40">
                Full order information,
                products and price summary
              </p>

              <Link
                href={`/orders/${order._id}`}
                className="
                  group/link
                  inline-flex
                  w-fit
                  items-center
                  gap-3
                  text-[9px]
                  font-extrabold
                  uppercase
                  tracking-[0.18em]
                  text-mbg-black
                  transition-colors
                  duration-200
                  hover:text-mbg-green
                "
              >
                View Order

                <span
                  className="
                    transition-transform
                    duration-300
                    group-hover/link:translate-x-1
                  "
                >
                  →
                </span>
              </Link>
            </div>
          </article>
        );
      })}
    </div>
  );
}

/* =========================================================
   ORDER STAT
========================================================= */

function OrderStat({
  label,
  value,
  border = false,
}: {
  label: string;

  value: string;

  border?: boolean;
}) {
  return (
    <div
      className={`
        flex
        items-center
        justify-between
        gap-3
        px-5
        py-4
        sm:block
        sm:px-6
        sm:py-5
        ${
          border
            ? "border-t border-mbg-black/10 sm:border-l sm:border-t-0"
            : ""
        }
      `}
    >
      <p className="text-[8px] font-extrabold uppercase tracking-[0.22em] text-mbg-black/40">
        {label}
      </p>

      <p className="mt-0 text-[10px] font-extrabold uppercase tracking-[0.1em] text-mbg-green sm:mt-2">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   PRODUCT
========================================================= */

function OrderProduct({
  product,
}: {
  product: StorefrontOrderProduct;
}) {
  const imageSrc =
    product.product?.media?.[0] ||
    FALLBACK_IMAGE;

  const unitPrice =
    product.unitPrice ??
    product.product?.price ??
    0;

  const quantity = Number(
    product.quantity ?? 1
  );

  const lineTotal =
    Number(unitPrice) *
    quantity;

  return (
    <div
      className="
        flex
        gap-4
        py-5
        sm:gap-5
        sm:py-6
      "
    >
      {/* IMAGE */}

      <div
        className="
          flex
          h-[88px]
          w-[88px]
          shrink-0
          items-center
          justify-center
          overflow-hidden
          bg-white
          sm:h-[100px]
          sm:w-[100px]
        "
      >
        <Image
          src={imageSrc}
          alt={
            product.product?.title ||
            "Product"
          }
          width={100}
          height={100}
          className="h-full w-full object-contain p-1"
        />
      </div>

      {/* INFORMATION */}

      <div
        className="
          flex
          min-w-0
          flex-1
          flex-col
          justify-between
          gap-3
        "
      >
        <div>
          <h4
            className="
              line-clamp-2
              text-[11px]
              font-extrabold
              uppercase
              tracking-[0.08em]
              text-mbg-black
              sm:text-xs
            "
          >
            {product.product?.title ||
              "Product"}
          </h4>

          <div className="mt-3 flex flex-wrap gap-2">
            {product.color && (
              <ProductAttribute
                label="Color"
                value={product.color}
              />
            )}

            {product.size && (
              <ProductAttribute
                label="Size"
                value={product.size}
              />
            )}

            <ProductAttribute
              label="Qty"
              value={String(quantity)}
            />
          </div>
        </div>

        {/* PRICE */}

        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-mbg-black/45">
            € {formatAmount(unitPrice)}{" "}
            × {quantity}
          </p>

          <p className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-mbg-green">
            €{" "}
            {formatAmount(
              lineTotal
            )}
          </p>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   PRODUCT ATTRIBUTE
========================================================= */

function ProductAttribute({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <span
      className="
        inline-flex
        items-center
        gap-1.5
        border
        border-mbg-black/10
        bg-white/55
        px-2
        py-1.5
        text-[8px]
        font-bold
        uppercase
        tracking-[0.13em]
        text-mbg-black/55
      "
    >
      {label}

      <strong className="font-extrabold text-mbg-black">
        {value}
      </strong>
    </span>
  );
}

/* =========================================================
   MONEY
========================================================= */

function formatAmount(
  value: unknown
): string {
  const numeric =
    typeof value === "number"
      ? value
      : Number(value ?? 0);

  if (!Number.isFinite(numeric)) {
    return "0.00";
  }

  return numeric.toFixed(2);
}

/* =========================================================
   SHIPPING
========================================================= */

function formatShippingMethod(
  value: string | undefined | null
): string {
  if (!value) {
    return "Standard Delivery";
  }

  const normalized =
    value.trim().toUpperCase();

  if (
    SHIPPING_LABELS[
      normalized as keyof typeof SHIPPING_LABELS
    ]
  ) {
    return SHIPPING_LABELS[
      normalized as keyof typeof SHIPPING_LABELS
    ];
  }

  if (
    normalized.includes("EXPRESS")
  ) {
    return "Express Delivery";
  }

  if (
    normalized.includes("FREE")
  ) {
    return "Free Delivery";
  }

  return value;
}