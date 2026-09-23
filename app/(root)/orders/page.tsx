"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Check,
  ChevronRight,
  Clock3,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  Truck,
  type LucideIcon,
} from "lucide-react";

import type { StorefrontOrder } from "@/lib/actions/actions";

/* =========================================================
   TYPES
========================================================= */

export type OrdersClientError = {
  type: "unauthorized" | "network" | "unknown";
  message: string;
  status?: number;
};

type OrdersClientProps = {
  orders: StorefrontOrder[];
  error: OrdersClientError | null;
};

type OrdersTab = "tracking" | "history";

type OrderWithDates = StorefrontOrder & {
  createdAt?: string | Date;
  updatedAt?: string | Date;

  orderDate?: string | Date;

  estimatedDeliveryDate?: string | Date;
  deliveryDate?: string | Date;

  shippedAt?: string | Date;
  deliveredAt?: string | Date;
};

/* =========================================================
   CONSTANTS
========================================================= */

const FOCUS_REFRESH_THROTTLE_MS = 5000;

const FINAL_STATUSES = new Set([
  "DELIVERED",
  "COMPLETED",
  "CANCELLED",
  "REFUNDED",
]);

const PENDING_STATUSES = new Set([
  "PENDING",
  "VALIDATION",
  "VALIDATING",
  "ORDER_PLACED",
]);

const PREPARING_STATUSES = new Set([
  "PROCESSING",
  "PREPARING",
  "PREPARED",
]);

const SHIPPING_STATUSES = new Set([
  "SHIPPED",
  "IN_TRANSIT",
  "OUT_FOR_DELIVERY",
]);

const PROGRESS_STEPS = [
  "Confirmed",
  "Preparing",
  "Shipped",
  "Delivered",
];

/* =========================================================
   COMPONENT
========================================================= */

export default function OrdersClient({
  orders,
  error,
}: OrdersClientProps) {
  const router = useRouter();

  const lastRefreshRef = useRef(0);

  const [activeTab, setActiveTab] =
    useState<OrdersTab>("tracking");

  const [isRefreshing, startTransition] =
    useTransition();

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
    [router],
  );

  useEffect(() => {
    const handleFocus = () => {
      triggerRefresh(false);
    };

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        triggerRefresh(false);
      }
    };

    window.addEventListener("focus", handleFocus);

    document.addEventListener(
      "visibilitychange",
      handleVisibility,
    );

    return () => {
      window.removeEventListener(
        "focus",
        handleFocus,
      );

      document.removeEventListener(
        "visibilitychange",
        handleVisibility,
      );
    };
  }, [triggerRefresh]);

  /* =======================================================
     ORDER FILTERS
  ======================================================= */

  const stats = useMemo(() => {
    let pending = 0;
    let preparing = 0;
    let shipping = 0;

    orders.forEach((order) => {
      const status = normalizeStatus(
        order.fulfillmentStatus,
      );

      if (PENDING_STATUSES.has(status)) {
        pending += 1;
        return;
      }

      if (PREPARING_STATUSES.has(status)) {
        preparing += 1;
        return;
      }

      if (SHIPPING_STATUSES.has(status)) {
        shipping += 1;
      }
    });

    return {
      pending,
      preparing,
      shipping,
    };
  }, [orders]);

  const visibleOrders = useMemo(() => {
    return orders.filter((order) => {
      const status = normalizeStatus(
        order.fulfillmentStatus,
      );

      if (activeTab === "history") {
        return FINAL_STATUSES.has(status);
      }

      return !FINAL_STATUSES.has(status);
    });
  }, [orders, activeTab]);

  /* =======================================================
     ERROR
  ======================================================= */

  if (error) {
    return (
      <section
        className="
          flex
          min-h-[300px]
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
            mb-3
            text-[9px]
            font-extrabold
            uppercase
            tracking-[0.25em]
            text-mbg-green
          "
        >
          Unable to load orders
        </span>

        <h3
          className="
            text-xl
            font-extrabold
            uppercase
            tracking-tight
            text-mbg-black
          "
        >
          Something went wrong
        </h3>

        <p
          className="
            mt-3
            max-w-md
            text-[11px]
            leading-relaxed
            text-mbg-black/50
          "
        >
          {error.message}
        </p>

        <div
          className="
            mt-7
            flex
            flex-wrap
            items-center
            justify-center
            gap-3
          "
        >
          {error.type === "unauthorized" && (
            <Link
              href="/sign-in"
              className="
                inline-flex
                min-h-11
                items-center
                justify-center
                bg-mbg-black
                px-6
                text-[9px]
                font-extrabold
                uppercase
                tracking-[0.18em]
                text-white
                transition-colors
                hover:bg-mbg-green
              "
            >
              Sign In
            </Link>
          )}

          <button
            type="button"
            disabled={isRefreshing}
            onClick={() => triggerRefresh(true)}
            className="
              inline-flex
              min-h-11
              items-center
              gap-2
              border
              border-mbg-black
              px-6
              text-[9px]
              font-extrabold
              uppercase
              tracking-[0.18em]
              text-mbg-black
              transition-all
              hover:border-mbg-green
              hover:bg-mbg-green
              hover:text-white
              disabled:cursor-wait
              disabled:opacity-50
            "
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${
                isRefreshing
                  ? "animate-spin"
                  : ""
              }`}
            />

            {isRefreshing
              ? "Refreshing"
              : "Try Again"}
          </button>
        </div>
      </section>
    );
  }

  /* =======================================================
     EMPTY
  ======================================================= */

  if (!orders.length) {
    return (
      <section
        className="
          flex
          min-h-[360px]
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
        <div
          className="
            mb-6
            flex
            h-14
            w-14
            items-center
            justify-center
            bg-mbg-black
            text-white
          "
        >
          <ShoppingBag className="h-5 w-5" />
        </div>

        <span
          className="
            mb-3
            text-[9px]
            font-extrabold
            uppercase
            tracking-[0.25em]
            text-mbg-green
          "
        >
          Order history
        </span>

        <h3
          className="
            text-xl
            font-extrabold
            uppercase
            tracking-tight
            text-mbg-black
            md:text-2xl
          "
        >
          No orders yet
        </h3>

        <p
          className="
            mt-3
            max-w-sm
            text-[11px]
            leading-relaxed
            text-mbg-black/50
          "
        >
          Your first Milos BG order will appear here.
        </p>

        <Link
          href="/products"
          className="
            mt-7
            inline-flex
            min-h-11
            items-center
            justify-center
            bg-mbg-green
            px-8
            text-[9px]
            font-extrabold
            uppercase
            tracking-[0.18em]
            text-white
            transition-colors
            hover:bg-mbg-black
          "
        >
          Explore Milos BG
        </Link>
      </section>
    );
  }

  /* =======================================================
     PAGE
  ======================================================= */

  return (
    <div>
      {/* ===================================================
          TABS
      ==================================================== */}

      <nav
        className="
          mb-8
          border
          border-mbg-black/10
          bg-mbg-black/[0.025]
          p-1
        "
      >
        <div className="grid grid-cols-3">
          <button
            type="button"
            onClick={() =>
              setActiveTab("tracking")
            }
            className={tabClass(
              activeTab === "tracking",
            )}
          >
            Tracking
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab("history")
            }
            className={tabClass(
              activeTab === "history",
            )}
          >
            History
          </button>

          <Link
            href="/cart"
            className="
              flex
              min-h-10
              items-center
              justify-center
              px-4
              text-[9px]
              font-extrabold
              uppercase
              tracking-[0.2em]
              text-mbg-black/50
              transition-colors
              hover:bg-white
              hover:text-mbg-green
            "
          >
            Cart
          </Link>
        </div>
      </nav>

      {/* ===================================================
          SUMMARY
      ==================================================== */}

      <div
        className="
          mb-10
          grid
          grid-cols-1
          gap-3
          sm:grid-cols-2
          xl:grid-cols-4
        "
      >
        <SummaryCard
          label="Pending"
          value={stats.pending}
          icon={Clock3}
        />

        <SummaryCard
          label="Preparing"
          value={stats.preparing}
          icon={PackageCheck}
        />

        <SummaryCard
          label="In delivery"
          value={stats.shipping}
          icon={Truck}
        />

        <Link
          href="/products"
          className="
            group
            flex
            min-h-[118px]
            flex-col
            items-center
            justify-center
            bg-mbg-green
            px-5
            text-center
            text-white
            transition-all
            duration-300
            hover:bg-mbg-black
          "
        >
          <span
            className="
              text-3xl
              font-light
              leading-none
              transition-transform
              duration-300
              group-hover:rotate-90
            "
          >
            +
          </span>

          <span
            className="
              mt-3
              text-[9px]
              font-extrabold
              uppercase
              tracking-[0.18em]
            "
          >
            Continue shopping
          </span>
        </Link>
      </div>

      {/* ===================================================
          SECTION TITLE
      ==================================================== */}

      <div
        className="
          mb-5
          flex
          items-end
          justify-between
          gap-5
        "
      >
        <div>
          <p
            className="
              text-[8px]
              font-extrabold
              uppercase
              tracking-[0.25em]
              text-mbg-green
            "
          >
            {activeTab === "tracking"
              ? "Current activity"
              : "Archive"}
          </p>

          <h3
            className="
              mt-1
              text-lg
              font-extrabold
              uppercase
              tracking-tight
              text-mbg-black
            "
          >
            {activeTab === "tracking"
              ? "Order tracking"
              : "Order history"}
          </h3>
        </div>

        <button
          type="button"
          onClick={() => triggerRefresh(true)}
          disabled={isRefreshing}
          aria-label="Refresh orders"
          className="
            flex
            h-10
            w-10
            items-center
            justify-center
            border
            border-mbg-black/10
            text-mbg-black
            transition-colors
            hover:border-mbg-green
            hover:bg-mbg-green
            hover:text-white
            disabled:opacity-40
          "
        >
          <RefreshCw
            className={`h-4 w-4 ${
              isRefreshing ? "animate-spin" : ""
            }`}
          />
        </button>
      </div>

      {/* ===================================================
          DESKTOP COLUMN LABELS
      ==================================================== */}

      {visibleOrders.length > 0 && (
        <div
          className="
            mb-3
            hidden
            grid-cols-[1.4fr_1fr_1fr_0.8fr_auto]
            gap-4
            px-5
            lg:grid
          "
        >
          <ColumnLabel>Order</ColumnLabel>

          <ColumnLabel>Created</ColumnLabel>

          <ColumnLabel>Delivery</ColumnLabel>

          <ColumnLabel>Total</ColumnLabel>

          <div className="w-[118px]" />
        </div>
      )}

      {/* ===================================================
          ORDERS
      ==================================================== */}

      {visibleOrders.length > 0 ? (
        <div className="space-y-4">
          {visibleOrders.map((order) => (
            <OrderRow
              key={order._id}
              order={order}
            />
          ))}
        </div>
      ) : (
        <EmptyTab tab={activeTab} />
      )}
    </div>
  );
}

/* =========================================================
   ORDER ROW
========================================================= */

function OrderRow({
  order,
}: {
  order: StorefrontOrder;
}) {
  const typedOrder = order as OrderWithDates;

  const status = normalizeStatus(
    order.fulfillmentStatus,
  );

  const totalItems =
    order.products?.reduce(
      (sum, product) =>
        sum + Number(product.quantity ?? 1),
      0,
    ) ?? 0;

  const createdDate =
    typedOrder.createdAt ??
    typedOrder.orderDate;

  const deliveryDate =
    typedOrder.deliveredAt ??
    typedOrder.deliveryDate ??
    typedOrder.estimatedDeliveryDate;

  return (
    <article
      className="
        overflow-hidden
        border
        border-mbg-black/10
        bg-white
        transition-all
        duration-300
        hover:border-mbg-black/20
        hover:shadow-[0_14px_40px_rgba(0,0,0,0.055)]
      "
    >
      {/* ===================================================
          ORDER MAIN ROW
      ==================================================== */}

      <div
        className="
          grid
          gap-5
          px-5
          py-5
          lg:grid-cols-[1.4fr_1fr_1fr_0.8fr_auto]
          lg:items-center
          lg:gap-4
        "
      >
        {/* ORDER */}

        <div>
          <p className="lg:hidden">
            <ColumnLabel>Order</ColumnLabel>
          </p>

          <Link
            href={`/orders/${order._id}`}
            className="
              mt-1
              block
              w-fit
              text-[11px]
              font-extrabold
              uppercase
              tracking-[0.08em]
              text-mbg-black
              transition-colors
              hover:text-mbg-green
            "
          >
            #{shortOrderId(order._id)}
          </Link>

          <p
            className="
              mt-1
              text-[8px]
              font-semibold
              uppercase
              tracking-[0.15em]
              text-mbg-black/35
            "
          >
            {totalItems}{" "}
            {totalItems === 1 ? "item" : "items"}
          </p>
        </div>

        {/* CREATED */}

        <OrderMeta
          label="Created"
          value={formatDate(createdDate)}
        />

        {/* DELIVERY */}

        <OrderMeta
          label="Delivery"
          value={formatDate(deliveryDate)}
        />

        {/* TOTAL */}

        <OrderMeta
          label="Total"
          value={formatCurrency(
            order.totalAmount,
          )}
          strong
        />

        {/* CTA */}

        <Link
          href={`/orders/${order._id}`}
          className="
            group
            inline-flex
            min-h-10
            w-fit
            min-w-[118px]
            items-center
            justify-center
            gap-2
            border
            border-mbg-black/10
            px-4
            text-[8px]
            font-extrabold
            uppercase
            tracking-[0.14em]
            text-mbg-black
            transition-all
            hover:border-mbg-green
            hover:bg-mbg-green
            hover:text-white
          "
        >
          View details

          <ChevronRight
            className="
              h-3.5
              w-3.5
              transition-transform
              group-hover:translate-x-0.5
            "
          />
        </Link>
      </div>

      {/* ===================================================
          PROGRESS
      ==================================================== */}

      <div
        className="
          border-t
          border-mbg-black/10
          bg-mbg-black/[0.018]
          px-5
          py-5
          sm:px-7
          sm:py-6
        "
      >
        <OrderProgress status={status} />
      </div>
    </article>
  );
}

/* =========================================================
   PROGRESS
========================================================= */

function OrderProgress({
  status,
}: {
  status: string;
}) {
  if (status === "CANCELLED") {
    return (
      <div
        className="
          flex
          items-center
          justify-between
          gap-4
        "
      >
        <span
          className="
            text-[9px]
            font-extrabold
            uppercase
            tracking-[0.18em]
            text-mbg-black
          "
        >
          Order cancelled
        </span>

        <span
          className="
            border
            border-mbg-black/10
            px-3
            py-1.5
            text-[8px]
            font-extrabold
            uppercase
            tracking-[0.15em]
            text-mbg-black/45
          "
        >
          Cancelled
        </span>
      </div>
    );
  }

  const stage = getProgressStage(status);

  const progress =
    stage <= 0
      ? 0
      : Math.min((stage / 3) * 100, 100);

  return (
    <div>
      <div
        className="
          mb-5
          flex
          items-center
          justify-between
          gap-4
        "
      >
        <span
          className="
            text-[8px]
            font-extrabold
            uppercase
            tracking-[0.2em]
            text-mbg-black/40
          "
        >
          Progress
        </span>

        <span
          className="
            text-[8px]
            font-extrabold
            uppercase
            tracking-[0.18em]
            text-mbg-green
          "
        >
          {getStatusLabel(status)}
        </span>
      </div>

      <div className="relative">
        {/* BACKGROUND LINE */}

        <div
          className="
            absolute
            left-[12.5%]
            right-[12.5%]
            top-[32px]
            h-[3px]
            bg-mbg-black/10
          "
        >
          <div
            className="
              h-full
              bg-mbg-green
              transition-all
              duration-700
            "
            style={{
              width: `${progress}%`,
            }}
          />
        </div>

        {/* STEPS */}

        <div
          className="
            relative
            grid
            grid-cols-4
          "
        >
          {PROGRESS_STEPS.map(
            (label, index) => {
              const completed =
                index < stage;

              const current =
                index === stage;

              return (
                <div
                  key={label}
                  className="
                    flex
                    min-w-0
                    flex-col
                    items-center
                    text-center
                  "
                >
                  <span
                    className={`
                      mb-3
                      min-h-[18px]
                      text-[7px]
                      font-bold
                      uppercase
                      tracking-[0.1em]
                      sm:text-[8px]
                      ${
                        completed ||
                        current
                          ? "text-mbg-black"
                          : "text-mbg-black/35"
                      }
                    `}
                  >
                    {label}
                  </span>

                  <span
                    className={`
                      relative
                      z-10
                      flex
                      h-5
                      w-5
                      items-center
                      justify-center
                      border-2
                      bg-white
                      transition-all
                      duration-300
                      ${
                        completed
                          ? "border-mbg-green bg-mbg-green text-white"
                          : current
                            ? "border-mbg-green text-mbg-green"
                            : "border-mbg-black/15 text-transparent"
                      }
                    `}
                  >
                    {completed && (
                      <Check
                        className="h-3 w-3"
                        strokeWidth={3}
                      />
                    )}

                    {current &&
                      !completed && (
                        <span
                          className="
                            h-1.5
                            w-1.5
                            bg-mbg-green
                          "
                        />
                      )}
                  </span>
                </div>
              );
            },
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   SUMMARY CARD
========================================================= */

function SummaryCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: LucideIcon;
}) {
  return (
    <div
      className="
        relative
        min-h-[118px]
        overflow-hidden
        border
        border-mbg-black/10
        bg-white
        px-5
        pb-5
        pt-8
      "
    >
      <div
        className="
          absolute
          left-4
          top-0
          flex
          h-10
          w-10
          items-center
          justify-center
          bg-mbg-black
          text-white
        "
      >
        <Icon className="h-4 w-4" />
      </div>

      <p
        className="
          text-3xl
          font-extrabold
          leading-none
          text-mbg-green
        "
      >
        {value}
      </p>

      <p
        className="
          mt-3
          text-[8px]
          font-extrabold
          uppercase
          tracking-[0.17em]
          text-mbg-black/45
        "
      >
        {label}
      </p>
    </div>
  );
}

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function OrderMeta({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div>
      <div className="lg:hidden">
        <ColumnLabel>{label}</ColumnLabel>
      </div>

      <p
        className={`
          mt-1
          text-[10px]
          uppercase
          tracking-[0.06em]
          ${
            strong
              ? "font-extrabold text-mbg-green"
              : "font-bold text-mbg-black"
          }
        `}
      >
        {value}
      </p>
    </div>
  );
}

function ColumnLabel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span
      className="
        text-[8px]
        font-extrabold
        uppercase
        tracking-[0.22em]
        text-mbg-black/35
      "
    >
      {children}
    </span>
  );
}

function EmptyTab({
  tab,
}: {
  tab: OrdersTab;
}) {
  return (
    <div
      className="
        flex
        min-h-[220px]
        flex-col
        items-center
        justify-center
        border
        border-mbg-black/10
        bg-mbg-black/[0.018]
        px-6
        text-center
      "
    >
      <span
        className="
          text-[9px]
          font-extrabold
          uppercase
          tracking-[0.2em]
          text-mbg-green
        "
      >
        {tab === "tracking"
          ? "All clear"
          : "History"}
      </span>

      <p
        className="
          mt-3
          max-w-sm
          text-[11px]
          font-medium
          leading-relaxed
          text-mbg-black/45
        "
      >
        {tab === "tracking"
          ? "You don't have any active orders right now."
          : "No completed orders are available yet."}
      </p>
    </div>
  );
}

/* =========================================================
   HELPERS
========================================================= */

function tabClass(active: boolean) {
  return `
    min-h-10
    px-4
    text-[9px]
    font-extrabold
    uppercase
    tracking-[0.2em]
    transition-all
    ${
      active
        ? "bg-white text-mbg-green shadow-[0_2px_10px_rgba(0,0,0,0.04)]"
        : "text-mbg-black/50 hover:bg-white/60 hover:text-mbg-black"
    }
  `;
}

function normalizeStatus(
  value: string | null | undefined,
) {
  return String(value || "PENDING")
    .trim()
    .toUpperCase();
}

function getProgressStage(status: string) {
  if (
    status === "DELIVERED" ||
    status === "COMPLETED"
  ) {
    return 3;
  }

  if (SHIPPING_STATUSES.has(status)) {
    return 2;
  }

  if (PREPARING_STATUSES.has(status)) {
    return 1;
  }

  return 0;
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    PENDING: "Pending confirmation",
    VALIDATION: "Pending confirmation",
    VALIDATING: "Pending confirmation",
    ORDER_PLACED: "Order confirmed",

    PROCESSING: "Preparing",
    PREPARING: "Preparing",
    PREPARED: "Prepared",

    SHIPPED: "Shipped",
    IN_TRANSIT: "In transit",
    OUT_FOR_DELIVERY: "Out for delivery",

    DELIVERED: "Delivered",
    COMPLETED: "Completed",

    REFUNDED: "Refunded",
    CANCELLED: "Cancelled",
  };

  return (
    labels[status] ||
    status.replaceAll("_", " ")
  );
}

function shortOrderId(value: string) {
  if (value.length <= 10) {
    return value.toUpperCase();
  }

  return value
    .slice(-10)
    .toUpperCase();
}

function formatCurrency(value: unknown) {
  const numeric =
    typeof value === "number"
      ? value
      : Number(value ?? 0);

  if (!Number.isFinite(numeric)) {
    return "€0.00";
  }

  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(numeric);
}

function formatDate(
  value:
    | string
    | Date
    | null
    | undefined,
) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}