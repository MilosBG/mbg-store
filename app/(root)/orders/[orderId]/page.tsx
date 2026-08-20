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
      <Container className="mt-4 min-h-[50vh]">
        <H2>Order</H2>

        <Separator className="mt-2 mb-4 bg-mbg-black" />

        <p className="py-3 text-[11px] font-bold uppercase tracking-widest text-mbg-green">
          Please sign in to view your orders.
        </p>
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
     ORDER NOT FOUND
  ======================================================= */

  if (!orderDetails) {
    return (
      <Container className="mt-4 min-h-[50vh]">
        <H2>Order</H2>

        <Separator className="mt-2 mb-4 bg-mbg-black" />

        <p className="py-3 text-[11px] font-bold uppercase tracking-widest text-mbg-green">
          We couldn&apos;t find that order.
        </p>
      </Container>
    );
  }

  /* =======================================================
     STATUS
  ======================================================= */

  const status = String(
    orderDetails.fulfillmentStatus ||
      "PENDING"
  ).toUpperCase();

  /* =======================================================
     PRODUCTS
  ======================================================= */

  const products =
    orderDetails.products ?? [];

  /* =======================================================
     SUBTOTAL

     quantity × unitPrice for every product
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

     The total already stored by mbg-admin / Stripe
  ======================================================= */

  const totalAmount = Number(
    orderDetails.totalAmount ?? subtotal
  );

  /* =======================================================
     SHIPPING

     Example:

     Total       €50
     Subtotal    €40
     ----------------
     Shipping    €10
  ======================================================= */

  const shippingAmount =
    resolveShippingAmount({
      shippingMethod:
        orderDetails.shippingMethod,

      subtotal,

      totalAmount,
    });

  return (
    <Container className="mt-10 min-h-[50vh]">
      {/* ===================================================
          ORDER CARD
      ==================================================== */}

      <section
        className="
          bg-[#dedede]
          px-5
          py-6
          sm:px-7
          lg:px-8
          lg:py-7
        "
      >
        {/* =================================================
            HEADER
        ================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-5
            sm:grid-cols-2
            lg:grid-cols-[1.5fr_1fr_1fr_auto]
            lg:items-center
            lg:gap-8
          "
        >
          {/* ORDER ID */}

          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span
              className="
                text-[10px]
                font-extrabold
                uppercase
                tracking-wider
                text-mbg-black
              "
            >
              Order ID
            </span>

            <span
              className="
                break-all
                text-[10px]
                font-extrabold
                uppercase
                tracking-wider
                text-mbg-green
              "
            >
              {orderId}
            </span>
          </div>

          {/* TOTAL AMOUNT */}

          <div className="flex items-center gap-2">
            <span
              className="
                text-[10px]
                font-extrabold
                uppercase
                tracking-wider
                text-mbg-black
              "
            >
              Total Amount
            </span>

            <span
              className="
                text-[11px]
                font-extrabold
                uppercase
                tracking-wider
                text-mbg-green
              "
            >
              € {formatAmount(totalAmount)}
            </span>
          </div>

          {/* SHIPPING METHOD */}

          <div className="flex items-center gap-2">
            <span
              className="
                text-[10px]
                font-extrabold
                uppercase
                tracking-wider
                text-mbg-black
              "
            >
              Shipping
            </span>

            <span
              className="
                text-[10px]
                font-extrabold
                uppercase
                tracking-wider
                text-mbg-green
              "
            >
              {getShippingLabel(
                orderDetails.shippingMethod
              )}
            </span>
          </div>

          {/* STATUS */}

          <div className="flex lg:justify-end">
            <StatusBadge
              status={status}
            />
          </div>
        </div>

        {/* =================================================
            ORDER TIMELINE
        ================================================== */}

        <div className="mt-8">
          <OrderTimeline
            order={orderDetails}
          />
        </div>

        {/* =================================================
            STATUS MESSAGE
        ================================================== */}

        <p
          className="
            mt-7
            text-[11px]
            font-medium
            text-mbg-black
          "
        >
          {getOrderMessage(status)}
        </p>

        {/* =================================================
            PRODUCT SEPARATOR
        ================================================== */}

        <div className="my-10 h-px w-full bg-mbg-green" />

        {/* =================================================
            PRODUCTS
        ================================================== */}

        <div className="flex flex-col gap-7">
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

              return (
                <div
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
                  className="
                    flex
                    items-start
                    gap-5
                  "
                >
                  {/* ===============================
                      PRODUCT IMAGE
                  ================================ */}

                  <div
                    className="
                      shrink-0
                      bg-white
                    "
                  >
                    <Image
                      src={
                        orderItem
                          .product
                          ?.media?.[0] ||
                        "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                      }
                      alt={
                        orderItem
                          .product
                          ?.title ||
                        "Product"
                      }
                      width={110}
                      height={110}
                      className="
                        h-[110px]
                        w-[110px]
                        object-contain
                        p-1
                      "
                    />
                  </div>

                  {/* ===============================
                      PRODUCT DETAILS
                  ================================ */}

                  <div
                    className="
                      flex
                      min-h-[110px]
                      flex-col
                      justify-center
                      gap-[7px]
                    "
                  >
                    <ProductInformation
                      label="Title"
                      value={
                        orderItem
                          .product
                          ?.title ||
                        "Product"
                      }
                    />

                    {orderItem.color && (
                      <ProductInformation
                        label="Color"
                        value={
                          orderItem.color
                        }
                      />
                    )}

                    {orderItem.size && (
                      <ProductInformation
                        label="Size"
                        value={
                          orderItem.size
                        }
                      />
                    )}

                    <ProductInformation
                      label="Unit Price"
                      value={`€ ${formatAmount(
                        unitPrice
                      )}`}
                    />

                    <ProductInformation
                      label="Quantity"
                      value={String(
                        orderItem.quantity ??
                          1
                      )}
                    />
                  </div>
                </div>
              );
            }
          )}
        </div>

        {/* =================================================
            BOTTOM GREEN LINE
        ================================================== */}

        <div
          className="
            my-10
            h-px
            w-full
            bg-mbg-green
          "
        />

        {/* =================================================
            ORDER PRICE SUMMARY
        ================================================== */}

        <div className="w-full">
          {/* ===============================================
              SUBTOTAL
          ================================================ */}

          <PriceRow
            label="Subtotal"
            value={subtotal}
          />

          {/* ===============================================
              SHIPPING
          ================================================ */}

          <div className="mt-3">
            <PriceRow
              label="Shipping"
              value={shippingAmount}
            />
          </div>

          {/* ===============================================
              TOTAL
          ================================================ */}

          <div
            className="
              mt-7
              flex
              items-center
              justify-between
            "
          >
            <span
              className="
                text-[14px]
                font-extrabold
                uppercase
                tracking-wider
                text-mbg-black
              "
            >
              Total
            </span>

            <span
              className="
                text-[14px]
                font-extrabold
                uppercase
                tracking-wider
                text-mbg-green
              "
            >
              € {formatAmount(
                totalAmount
              )}
            </span>
          </div>
        </div>
      </section>

      {/* ===================================================
          BACK TO ORDERS
      ==================================================== */}

      <div className="mt-5">
        <Link
          href="/orders"
          className="
            text-[10px]
            font-bold
            uppercase
            tracking-widest
            text-mbg-green
            transition-opacity
            hover:opacity-60
          "
        >
          ← Back to orders
        </Link>
      </div>
    </Container>
  );
}

/* =========================================================
   PRODUCT INFORMATION ROW
========================================================= */

function ProductInformation({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <p
      className="
        text-[9.5px]
        font-bold
        uppercase
        tracking-widest
        text-mbg-black
      "
    >
      <span
        className="
          inline-block
          min-w-[80px]
        "
      >
        {label}
      </span>

      <span className="text-mbg-green">
        {value}
      </span>
    </p>
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
    <div
      className="
        flex
        items-center
        justify-between
      "
    >
      <span
        className="
          text-[10px]
          font-extrabold
          uppercase
          tracking-wider
          text-mbg-black
        "
      >
        {label}
      </span>

      <span
        className="
          text-[10px]
          font-extrabold
          uppercase
          tracking-wider
          text-mbg-green
        "
      >
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

    default:
      return "Your order has been received.";
  }
}

/* =========================================================
   SHIPPING METHOD LABEL
========================================================= */

function getShippingLabel(
  shippingMethod?: string
): string {
  const method = String(
    shippingMethod || ""
  ).toUpperCase();

  switch (method) {
    case "EXPRESS":
      return "Express Delivery";

    case "FREE":
      return "Free Delivery";

    default:
      return (
        method ||
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
  ).toUpperCase();

  /*
   * FREE shipping must always display €0.00.
   */
  if (method === "FREE") {
    return 0;
  }

  /*
   * Currently your Order object does not expose a separate
   * shippingAmount field.
   *
   * Therefore:
   *
   * Total - products subtotal = shipping amount.
   *
   * Example:
   *
   * €50.00 - €40.00 = €10.00
   */
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

  if (!Number.isFinite(numeric)) {
    return "0.00";
  }

  return numeric.toFixed(2);
}