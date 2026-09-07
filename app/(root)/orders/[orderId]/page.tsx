import type { Metadata } from "next";

import Container from "@/components/mbg-components/Container";
import { H2 } from "@/components/mbg-components/H2";
import Separator from "@/components/mbg-components/Separator";

import { StatusBadge } from "@/components/orders/StatusBadge";
import { OrderTimeline } from "@/components/orders/OrderTimeline";

import { getOrderDetails } from "@/lib/actions/actions";
import { buildMetadata } from "@/lib/seo";

import Image from "next/image";
import Link from "next/link";

import { auth } from "@clerk/nextjs/server";

/* =========================================================
   TYPES
========================================================= */

type PageProps = {
  params: Promise<{
    orderId: string;
  }>;
};

type ResolvedOrder = NonNullable<
  Awaited<ReturnType<typeof getOrderDetails>>
>;

type OrderLine = NonNullable<
  ResolvedOrder["products"]
>[number];

/* =========================================================
   FALLBACK
========================================================= */

const FALLBACK_IMAGE =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

/* =========================================================
   METADATA
========================================================= */

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { orderId } = await params;

  const encodedId =
    encodeURIComponent(orderId);

  return buildMetadata({
    title: `Order ${orderId}`,

    description:
      "Securely review the timeline and fulfillment status for your Milos BG order.",

    path: `/orders/${encodedId}`,

    image: "/Grinder.png",

    keywords: [
      "orders",
      "order status",
      "Milos BG",
    ],

    robotsIndex: false,
  });
}

/* =========================================================
   PAGE
========================================================= */

export default async function OrderDetailsPage({
  params,
}: PageProps) {
  const { orderId } = await params;

  const { userId } = await auth();

  /* =======================================================
     AUTH
  ======================================================= */

  if (!userId) {
    return (
      <Container className="mt-8 min-h-[60vh]">
        <div className="mb-6">
          <H2>Your Order</H2>

          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-mbg-black/45">
            Review your order details and delivery
            progress.
          </p>
        </div>

        <Separator className="mb-8 bg-mbg-black" />

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
            Account required
          </span>

          <h3 className="text-xl font-extrabold uppercase tracking-tight text-mbg-black md:text-2xl">
            Sign in to view your order
          </h3>

          <p className="mt-3 max-w-sm text-[11px] leading-relaxed text-mbg-black/50">
            Your order information is securely
            associated with your Milos BG account.
          </p>

          <Link
            href="/sign-in"
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
            Sign In
          </Link>
        </section>
      </Container>
    );
  }

  /* =======================================================
     GET ORDER
  ======================================================= */

  const orderDetails =
    await getOrderDetails(orderId, {
      customerId: userId,
    });

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!orderDetails) {
    return (
      <Container className="mt-8 min-h-[60vh]">
        <div className="mb-6">
          <H2>Your Order</H2>
        </div>

        <Separator className="mb-8 bg-mbg-black" />

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
            Order unavailable
          </span>

          <h3 className="text-xl font-extrabold uppercase tracking-tight text-mbg-black">
            Order not found
          </h3>

          <p className="mt-3 max-w-sm text-[11px] leading-relaxed text-mbg-black/50">
            We couldn&apos;t find this order or it
            isn&apos;t associated with your account.
          </p>

          <Link
            href="/orders"
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
            View My Orders
          </Link>
        </section>
      </Container>
    );
  }

  /* =======================================================
     DATA
  ======================================================= */

  const status = String(
    orderDetails.fulfillmentStatus ||
      "PENDING"
  ).toUpperCase();

  const products =
    orderDetails.products ?? [];

  const totalQuantity =
    products.reduce(
      (
        total: number,
        orderItem: OrderLine
      ) =>
        total +
        Number(
          orderItem.quantity ?? 1
        ),
      0
    );

  /* =======================================================
     SUBTOTAL
  ======================================================= */

  const subtotal = products.reduce(
    (
      total: number,
      orderItem: OrderLine
    ) => {
      const unitPrice = Number(
        orderItem.unitPrice ??
          orderItem.product?.price ??
          0
      );

      const quantity = Number(
        orderItem.quantity ?? 1
      );

      return (
        total +
        unitPrice * quantity
      );
    },
    0
  );

  /* =======================================================
     TOTAL
  ======================================================= */

  const totalAmount = Number(
    orderDetails.totalAmount ??
      subtotal
  );

  /* =======================================================
     SHIPPING
  ======================================================= */

  const shippingAmount =
    resolveShippingAmount({
      shippingMethod:
        orderDetails.shippingMethod,

      subtotal,

      totalAmount,
    });

  /* =======================================================
     RENDER
  ======================================================= */

  return (
    <Container className="mt-8 min-h-[60vh] pb-16">
      {/* ===================================================
          PAGE TOP
      ==================================================== */}

      <div
        className="
          mb-6
          flex
          flex-col
          gap-5
          sm:flex-row
          sm:items-end
          sm:justify-between
        "
      >
        <div>
          <span className="text-[9px] font-extrabold uppercase tracking-[0.25em] text-mbg-green">
            Order Details
          </span>

          <H2>Your Order</H2>

          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-mbg-black/40">
            Follow your order from confirmation
            to delivery.
          </p>
        </div>

        <Link
          href="/orders"
          className="
            group
            inline-flex
            w-fit
            items-center
            gap-2
            text-[9px]
            font-extrabold
            uppercase
            tracking-[0.18em]
            text-mbg-black/55
            transition-colors
            duration-200
            hover:text-mbg-green
          "
        >
          <span
            className="
              transition-transform
              duration-300
              group-hover:-translate-x-1
            "
          >
            ←
          </span>

          All Orders
        </Link>
      </div>

      <Separator className="mb-8 bg-mbg-black" />

      {/* ===================================================
          MAIN ORDER CARD
      ==================================================== */}

      <section
        className="
          overflow-hidden
          border
          border-mbg-black/10
          bg-[#f2f2f2]
        "
      >
        {/* =================================================
            ORDER HEADER
        ================================================== */}

        <header className="px-5 py-6 sm:px-7 lg:px-8">
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
                Order ID
              </p>

              <p
                className="
                  mt-2
                  break-all
                  text-[11px]
                  font-extrabold
                  uppercase
                  tracking-[0.08em]
                  text-mbg-black
                  sm:text-xs
                "
              >
                #{orderId}
              </p>
            </div>

            <StatusBadge
              status={status}
            />
          </div>
        </header>

        {/* =================================================
            ORDER STATS
        ================================================== */}

        <div
          className="
            grid
            grid-cols-1
            border-y
            border-mbg-black/10
            sm:grid-cols-3
          "
        >
          <OrderStat
            label="Total Amount"
            value={`€ ${formatAmount(
              totalAmount
            )}`}
          />

          <OrderStat
            label="Shipping"
            value={getShippingLabel(
              orderDetails.shippingMethod
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

        {/* =================================================
            ORDER PROGRESS
        ================================================== */}

        <div className="px-5 py-7 sm:px-7 sm:py-8 lg:px-8">
          <div className="mb-5 flex items-center justify-between gap-4">
            <span className="text-[8px] font-extrabold uppercase tracking-[0.25em] text-mbg-black/40">
              Order Progress
            </span>

            <span className="text-[8px] font-extrabold uppercase tracking-[0.18em] text-mbg-green">
              {formatStatus(status)}
            </span>
          </div>

          <OrderTimeline
            order={orderDetails}
          />

          <div
            className="
              mt-7
              border-l-2
              border-mbg-green
              bg-white/45
              px-4
              py-3
            "
          >
            <p className="text-[11px] font-medium leading-relaxed text-mbg-black/65">
              {getOrderMessage(status)}
            </p>
          </div>
        </div>

        {/* =================================================
            PRODUCTS HEADER
        ================================================== */}

        <div className="border-t border-mbg-black/10 px-5 pt-7 sm:px-7 lg:px-8">
          <div
            className="
              flex
              items-end
              justify-between
              gap-4
            "
          >
            <div>
              <span className="text-[8px] font-extrabold uppercase tracking-[0.25em] text-mbg-green">
                Your Pieces
              </span>

              <h3 className="mt-1 text-base font-extrabold uppercase tracking-tight text-mbg-black">
                Items in this order
              </h3>
            </div>

            <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-mbg-black/40">
              {totalQuantity}{" "}
              {totalQuantity === 1
                ? "Item"
                : "Items"}
            </span>
          </div>
        </div>

        {/* =================================================
            PRODUCTS
        ================================================== */}

        <div className="px-5 sm:px-7 lg:px-8">
          <div className="mt-5 divide-y divide-mbg-black/10">
            {products.map(
              (
                orderItem: OrderLine
              ) => {
                const unitPrice =
                  Number(
                    orderItem.unitPrice ??
                      orderItem.product
                        ?.price ??
                      0
                  );

                const quantity =
                  Number(
                    orderItem.quantity ??
                      1
                  );

                const lineTotal =
                  unitPrice *
                  quantity;

                return (
                  <OrderProduct
                    key={
                      orderItem._id ??
                      `${
                        orderItem.product
                          ?._id ??
                        "item"
                      }-${
                        orderItem.size ??
                        ""
                      }-${
                        orderItem.color ??
                        ""
                      }`
                    }
                    orderItem={
                      orderItem
                    }
                    unitPrice={
                      unitPrice
                    }
                    quantity={
                      quantity
                    }
                    lineTotal={
                      lineTotal
                    }
                  />
                );
              }
            )}
          </div>
        </div>

        {/* =================================================
            PRICE SUMMARY
        ================================================== */}

        <div
          className="
            mt-4
            border-t
            border-mbg-black/10
            bg-white/40
            px-5
            py-7
            sm:px-7
            sm:py-8
            lg:px-8
          "
        >
          <div className="ml-auto w-full sm:max-w-sm">
            <div className="flex flex-col gap-4">
              <PriceRow
                label="Subtotal"
                value={subtotal}
              />

              <PriceRow
                label="Shipping"
                value={shippingAmount}
              />
            </div>

            <div className="my-6 h-px w-full bg-mbg-black/15" />

            <div className="flex items-end justify-between gap-5">
              <div>
                <p className="text-[8px] font-extrabold uppercase tracking-[0.23em] text-mbg-black/40">
                  Order Total
                </p>

                <p className="mt-1 text-[10px] font-medium text-mbg-black/45">
                  Including delivery
                </p>
              </div>

              <span className="text-xl font-extrabold uppercase tracking-tight text-mbg-green sm:text-2xl">
                €{" "}
                {formatAmount(
                  totalAmount
                )}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ===================================================
          BOTTOM NAVIGATION
      ==================================================== */}

      <div className="mt-6">
        <Link
          href="/orders"
          className="
            group
            inline-flex
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
          <span
            className="
              transition-transform
              duration-300
              group-hover:-translate-x-1
            "
          >
            ←
          </span>

          Back to Orders
        </Link>
      </div>
    </Container>
  );
}

/* =========================================================
   ORDER PRODUCT
========================================================= */

function OrderProduct({
  orderItem,
  unitPrice,
  quantity,
  lineTotal,
}: {
  orderItem: OrderLine;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
}) {
  const image =
    orderItem.product?.media?.[0] ||
    FALLBACK_IMAGE;

  const title =
    orderItem.product?.title ||
    "Product";

  return (
    <div
      className="
        flex
        gap-4
        py-6
        sm:gap-6
        sm:py-7
      "
    >
      {/* IMAGE */}

      <div
        className="
          flex
          h-[92px]
          w-[92px]
          shrink-0
          items-center
          justify-center
          overflow-hidden
          bg-white
          sm:h-[115px]
          sm:w-[115px]
        "
      >
        <Image
          src={image}
          alt={title}
          width={115}
          height={115}
          className="h-full w-full object-contain p-1"
        />
      </div>

      {/* DETAILS */}

      <div
        className="
          flex
          min-w-0
          flex-1
          flex-col
          justify-between
          gap-4
        "
      >
        <div>
          <p className="text-[8px] font-extrabold uppercase tracking-[0.22em] text-mbg-black/35">
            Product
          </p>

          <h4
            className="
              mt-1
              line-clamp-2
              text-[11px]
              font-extrabold
              uppercase
              tracking-[0.08em]
              text-mbg-black
              sm:text-xs
            "
          >
            {title}
          </h4>

          {/* ATTRIBUTES */}

          <div className="mt-3 flex flex-wrap gap-2">
            {orderItem.color && (
              <ProductAttribute
                label="Color"
                value={
                  orderItem.color
                }
              />
            )}

            {orderItem.size && (
              <ProductAttribute
                label="Size"
                value={
                  orderItem.size
                }
              />
            )}

            <ProductAttribute
              label="Qty"
              value={String(
                quantity
              )}
            />
          </div>
        </div>

        {/* PRICE */}

        <div
          className="
            flex
            flex-wrap
            items-end
            justify-between
            gap-3
          "
        >
          <div>
            <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-mbg-black/35">
              Unit Price
            </p>

            <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.1em] text-mbg-black/65">
              €{" "}
              {formatAmount(
                unitPrice
              )}
            </p>
          </div>

          <div className="text-right">
            <p className="text-[8px] font-bold uppercase tracking-[0.16em] text-mbg-black/35">
              Line Total
            </p>

            <p className="mt-1 text-xs font-extrabold uppercase tracking-[0.08em] text-mbg-green">
              €{" "}
              {formatAmount(
                lineTotal
              )}
            </p>
          </div>
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
        bg-white/60
        px-2
        py-1.5
        text-[8px]
        font-bold
        uppercase
        tracking-[0.13em]
        text-mbg-black/45
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
        gap-5
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

      <p className="mt-0 text-right text-[10px] font-extrabold uppercase tracking-[0.09em] text-mbg-green sm:mt-2 sm:text-left">
        {value}
      </p>
    </div>
  );
}

/* =========================================================
   PRICE ROW
========================================================= */

function PriceRow({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-5">
      <span className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-mbg-black/55">
        {label}
      </span>

      <span className="text-[11px] font-extrabold uppercase tracking-[0.1em] text-mbg-black">
        € {formatAmount(value)}
      </span>
    </div>
  );
}

/* =========================================================
   ORDER STATUS MESSAGE
========================================================= */

function getOrderMessage(
  status: string
): string {
  switch (status) {
    case "PROCESSING":
      return "We're preparing your order.";

    case "SHIPPED":
      return "Your order is on the way.";

    case "DELIVERED":
      return "Your order has been delivered.";

    case "COMPLETED":
      return "Order completed. Thank you!";

    case "CANCELLED":
      return "This order has been cancelled.";

    case "REFUNDED":
      return "This order has been refunded.";

    default:
      return "Your order has been received.";
  }
}

/* =========================================================
   STATUS DISPLAY
========================================================= */

function formatStatus(
  status: string
): string {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) =>
      letter.toUpperCase()
    );
}

/* =========================================================
   SHIPPING METHOD
========================================================= */

function getShippingLabel(
  shippingMethod?: string
): string {
  const method = String(
    shippingMethod || ""
  )
    .trim()
    .toUpperCase();

  switch (method) {
    case "EXPRESS":
    case "EXPRESS_DELIVERY":
      return "Express Delivery";

    case "FREE":
    case "FREE_DELIVERY":
      return "Free Delivery";

    case "STANDARD":
    case "STANDARD_DELIVERY":
      return "Standard Delivery";

    default:
      return (
        shippingMethod ||
        "Standard Delivery"
      );
  }
}

/* =========================================================
   SHIPPING AMOUNT
========================================================= */

function resolveShippingAmount({
  shippingMethod,
  subtotal,
  totalAmount,
}: {
  shippingMethod?: string;
  subtotal: number;
  totalAmount: number;
}): number {
  const method = String(
    shippingMethod || ""
  )
    .trim()
    .toUpperCase();

  if (
    method === "FREE" ||
    method === "FREE_DELIVERY"
  ) {
    return 0;
  }

  return Math.max(
    totalAmount - subtotal,
    0
  );
}

/* =========================================================
   MONEY FORMAT
========================================================= */

function formatAmount(
  value: unknown
): string {
  const numeric =
    typeof value === "number"
      ? value
      : Number(value ?? 0);

  if (
    !Number.isFinite(
      numeric
    )
  ) {
    return "0.00";
  }

  return numeric.toFixed(2);
}