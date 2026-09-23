"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
  type ReactNode,
} from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  Check,
  ChevronRight,
  Clock3,
  Package,
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
  orders?: StorefrontOrder[] | null;
  error: OrdersClientError | null;
};

type OrdersTab = "tracking" | "history";

type ExtendedStorefrontOrder = StorefrontOrder & {
  createdAt?: string | Date | null;
  updatedAt?: string | Date | null;

  orderDate?: string | Date | null;

  estimatedDeliveryDate?: string | Date | null;
  deliveryDate?: string | Date | null;

  shippedAt?: string | Date | null;
  deliveredAt?: string | Date | null;
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
  "PLACED",
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
] as const;

/* =========================================================
   COMPONENT
========================================================= */

export default function OrdersClient({
  orders = [],
  error,
}: OrdersClientProps) {
  const router = useRouter();

  const lastRefreshRef = useRef<number>(0);

  const [activeTab, setActiveTab] =
    useState<OrdersTab>("tracking");

  const [isRefreshing, startTransition] =
    useTransition();

  /* =======================================================
     SAFE ORDERS
  ======================================================= */

  const safeOrders = useMemo<StorefrontOrder[]>(() => {
    if (!Array.isArray(orders)) {
      return [];
    }

    return orders.filter(Boolean);
  }, [orders]);

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

  /* =======================================================
     REFRESH WHEN PAGE BECOMES ACTIVE
  ======================================================= */

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
     STATS
  ======================================================= */

  const stats = useMemo(() => {
    let pending = 0;
    let preparing = 0;
    let shipping = 0;

    for (const order of safeOrders) {
      const status = normalizeStatus(
        order?.fulfillmentStatus,
      );

      if (PENDING_STATUSES.has(status)) {
        pending += 1;
        continue;
      }

      if (PREPARING_STATUSES.has(status)) {
        preparing += 1;
        continue;
      }

      if (SHIPPING_STATUSES.has(status)) {
        shipping += 1;
      }
    }

    return {
      pending,
      preparing,
      shipping,
    };
  }, [safeOrders]);

  /* =======================================================
     FILTERED ORDERS
  ======================================================= */

  const visibleOrders = useMemo(() => {
    return safeOrders.filter((order) => {
      const status = normalizeStatus(
        order?.fulfillmentStatus,
      );

      if (activeTab === "history") {
        return FINAL_STATUSES.has(status);
      }

      return !FINAL_STATUSES.has(status);
    });
  }, [safeOrders, activeTab]);

  /* =======================================================
     ERROR STATE
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
            onClick={() => triggerRefresh(true)}
            className="
              inline-flex
              min-h-11
              items-center
              justify-center
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
              duration-300
              hover:border-mbg-green
              hover:bg-mbg-green
              hover:text-white
              disabled:cursor-wait
              disabled:opacity-50
            "
          >
            <RefreshCw
              className={`
                h-3.5
                w-3.5
                ${isRefreshing ? "animate-spin" : ""}
              `}
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
     EMPTY STATE
  ======================================================= */

  if (!safeOrders.length) {
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
          Your first Milos BG order will appear
          here once your purchase is confirmed.
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
            duration-300
            hover:bg-mbg-black
          "
        >
          Explore Milos BG
        </Link>
      </section>
    );
  }

  /* =======================================================
     MAIN
  ======================================================= */

  return (
    <div className="w-full">
      {/* ===================================================
          NAVIGATION
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
              min-h-11
              items-center
              justify-center
              px-4
              text-[9px]
              font-extrabold
              uppercase
              tracking-[0.2em]
              text-mbg-black/50
              transition-all
              duration-300
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
          icon={Package}
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
          SECTION HEADER
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
          title="Refresh orders"
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            border
            border-mbg-black/10
            text-mbg-black
            transition-all
            duration-300
            hover:border-mbg-green
            hover:bg-mbg-green
            hover:text-white
            disabled:cursor-wait
            disabled:opacity-40
          "
        >
          <RefreshCw
            className={`
              h-4
              w-4
              ${isRefreshing ? "animate-spin" : ""}
            `}
          />
        </button>
      </div>

      {/* ===================================================
          DESKTOP COLUMN HEADERS
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

          <div className="w-[125px]" />
        </div>
      )}

      {/* ===================================================
          ORDERS
      ==================================================== */}

      {visibleOrders.length > 0 ? (
        <div className="space-y-4">
          {visibleOrders.map(
            (order, index) => (
              <OrderRow
                key={
                  String(order?._id ?? "") ||
                  `order-${index}`
                }
                order={order}
              />
            ),
          )}
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
  const typedOrder =
    order as ExtendedStorefrontOrder;

  const orderId = String(
    order?._id ?? "",
  );

  const status = normalizeStatus(
    order?.fulfillmentStatus,
  );

  const products = Array.isArray(
    order?.products,
  )
    ? order.products
    : [];

  const totalItems = products.reduce(
    (sum, product) => {
      const quantity = Number(
        product?.quantity ?? 1,
      );

      return (
        sum +
        (Number.isFinite(quantity)
          ? quantity
          : 1)
      );
    },
    0,
  );

  const createdDate =
    typedOrder.createdAt ??
    typedOrder.orderDate ??
    null;

  const deliveryDate =
    typedOrder.deliveredAt ??
    typedOrder.deliveryDate ??
    typedOrder.estimatedDeliveryDate ??
    null;

  const href = orderId
    ? `/orders/${orderId}`
    : "/orders";

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
          MAIN INFORMATION
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

        <div className="min-w-0">
          <div className="lg:hidden">
            <ColumnLabel>Order</ColumnLabel>
          </div>

          <Link
            href={href}
            className="
              mt-1
              block
              w-fit
              max-w-full
              truncate
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
            #{shortOrderId(orderId)}
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
            {totalItems === 1
              ? "item"
              : "items"}
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
            order?.totalAmount,
          )}
          strong
        />

        {/* ACTION */}

        <Link
          href={href}
          className="
            group
            inline-flex
            min-h-10
            w-fit
            min-w-[125px]
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
            duration-300
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
              duration-300
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
   ORDER PROGRESS
========================================================= */

function OrderProgress({
  status,
}: {
  status: string;
}) {
  if (
    status === "CANCELLED" ||
    status === "REFUNDED"
  ) {
    return (
      <div
        className="
          flex
          flex-col
          gap-3
          sm:flex-row
          sm:items-center
          sm:justify-between
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
          {status === "REFUNDED"
            ? "Order refunded"
            : "Order cancelled"}
        </span>

        <span
          className="
            w-fit
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
          {status === "REFUNDED"
            ? "Refunded"
            : "Cancelled"}
        </span>
      </div>
    );
  }

  const stage = getProgressStage(status);

  const progressPercentage =
    stage <= 0
      ? 0
      : Math.min(
          (stage /
            (PROGRESS_STEPS.length - 1)) *
            100,
          100,
        );

  return (
    <div className="w-full">
      {/* HEADER */}

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
            text-right
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

      {/* TIMELINE */}

      <div className="relative">
        {/* BASE LINE */}

        <div
          className="
            absolute
            left-[12.5%]
            right-[12.5%]
            top-[32px]
            h-[3px]
            overflow-hidden
            bg-mbg-black/10
          "
        >
          <div
            className="
              h-full
              bg-mbg-green
              transition-all
              duration-700
              ease-out
            "
            style={{
              width: `${progressPercentage}%`,
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
                      flex
                      min-h-[18px]
                      items-end
                      justify-center
                      text-[6px]
                      font-bold
                      uppercase
                      leading-tight
                      tracking-[0.08em]
                      sm:text-[8px]
                      sm:tracking-[0.1em]
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
                      shrink-0
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
        transition-all
        duration-300
        hover:border-mbg-black/20
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
   ORDER META
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
    <div className="min-w-0">
      <div className="lg:hidden">
        <ColumnLabel>{label}</ColumnLabel>
      </div>

      <p
        className={`
          mt-1
          truncate
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

/* =========================================================
   COLUMN LABEL
========================================================= */

function ColumnLabel({
  children,
}: {
  children: ReactNode;
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

/* =========================================================
   EMPTY TAB
========================================================= */

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

      {tab === "tracking" && (
        <Link
          href="/products"
          className="
            mt-6
            inline-flex
            min-h-10
            items-center
            justify-center
            bg-mbg-black
            px-6
            text-[8px]
            font-extrabold
            uppercase
            tracking-[0.18em]
            text-white
            transition-colors
            duration-300
            hover:bg-mbg-green
          "
        >
          Explore products
        </Link>
      )}
    </div>
  );
}

/* =========================================================
   TAB CLASS
========================================================= */

function tabClass(active: boolean) {
  return `
    min-h-11
    px-4
    text-[9px]
    font-extrabold
    uppercase
    tracking-[0.2em]
    transition-all
    duration-300
    ${
      active
        ? `
          bg-white
          text-mbg-green
          shadow-[0_2px_10px_rgba(0,0,0,0.04)]
        `
        : `
          text-mbg-black/50
          hover:bg-white/60
          hover:text-mbg-black
        `
    }
  `;
}

/* =========================================================
   NORMALIZE STATUS
========================================================= */

function normalizeStatus(
  value: unknown,
): string {
  return String(value ?? "PENDING")
    .trim()
    .toUpperCase();
}

/* =========================================================
   PROGRESS STAGE
========================================================= */

function getProgressStage(
  status: string,
): number {
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

/* =========================================================
   STATUS LABEL
========================================================= */

function getStatusLabel(
  status: string,
): string {
  const labels: Record<string, string> = {
    PENDING: "Pending confirmation",

    VALIDATION: "Pending confirmation",

    VALIDATING: "Pending confirmation",

    ORDER_PLACED: "Order confirmed",

    PLACED: "Order confirmed",

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
    labels[status] ??
    status.replaceAll("_", " ")
  );
}

/* =========================================================
   SHORT ORDER ID
========================================================= */

function shortOrderId(
  value: unknown,
): string {
  const id = String(value ?? "");

  if (!id) {
    return "ORDER";
  }

  if (id.length <= 10) {
    return id.toUpperCase();
  }

  return id
    .slice(-10)
    .toUpperCase();
}

/* =========================================================
   CURRENCY
========================================================= */

function formatCurrency(
  value: unknown,
): string {
  const numeric =
    typeof value === "number"
      ? value
      : Number(value ?? 0);

  if (!Number.isFinite(numeric)) {
    return "€0.00";
  }

  return new Intl.NumberFormat(
    "en-IE",
    {
      style: "currency",
      currency: "EUR",
    },
  ).format(numeric);
}

/* =========================================================
   DATE
========================================================= */

function formatDate(
  value:
    | string
    | Date
    | null
    | undefined,
): string {
  if (!value) {
    return "—";
  }

  const date =
    value instanceof Date
      ? value
      : new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
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