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
  params: Promise<{ orderId: string }>;
};

type ResolvedOrder = NonNullable<
  Awaited<ReturnType<typeof getOrderDetails>>
>;

type OrderLine = NonNullable<ResolvedOrder["products"]>[number];

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { orderId } = await params;
  const encodedId = encodeURIComponent(orderId);

  return buildMetadata({
    title: `Order ${orderId}`,
    description:
      "Securely review the timeline and fulfillment status for your Milos BG order.",
    path: `/orders/${encodedId}`,
    image: "/Grinder.png",
    keywords: ["orders", "order status", "Milos BG"],
    robotsIndex: false,
  });
}

export default async function OrderDetailsPage({
  params,
}: PageProps) {
  const { orderId } = await params;
  const { userId } = await auth();

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

  const orderDetails = await getOrderDetails(orderId, {
    customerId: userId,
  });

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

  const status = String(
    orderDetails.fulfillmentStatus || "PENDING"
  ).toUpperCase();

  const products = orderDetails.products ?? [];

  /**
   * Sous-total produits
   */
  const subtotal = products.reduce(
    (total: number, item: OrderLine) => {
      const unitPrice =
        item.unitPrice ?? item.product?.price ?? 0;

      const quantity = Number(item.quantity ?? 1);

      return total + Number(unitPrice) * quantity;
    },
    0
  );

  /**
   * Total enregistré sur la commande
   */
  const totalAmount = Number(
    orderDetails.totalAmount ?? subtotal
  );

  /**
   * Dans ta commande exemple :
   *
   * Produits = 40 €
   * Total = 50 €
   *
   * Donc livraison = 10 €
   *
   * Si tu ajoutes plus tard discounts / taxes,
   * il vaudra mieux stocker shippingAmount séparément.
   */
  const shippingAmount = Math.max(
    totalAmount - subtotal,
    0
  );

  return (
    <Container className="mt-10 min-h-[50vh]">
      {/* =====================================================
          ORDER CARD
      ====================================================== */}

      <section className="bg-[#dedede] px-5 py-6 sm:px-7 lg:px-8 lg:py-7">
        {/* ===================================================
            ORDER HEADER
        ==================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-5
            sm:grid-cols-2
            lg:grid-cols-[1.4fr_0.9fr_1fr_auto]
            lg:items-center
            lg:gap-8
          "
        >
          {/* ORDER ID */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-mbg-black">
              Order ID
            </span>

            <span className="break-all text-[10px] font-extrabold uppercase tracking-wider text-mbg-green">
              {orderId}
            </span>
          </div>

          {/* TOTAL */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-mbg-black">
              Total Amount
            </span>

            <span className="text-[11px] font-extrabold uppercase tracking-wider text-mbg-green">
              € {formatAmount(totalAmount)}
            </span>
          </div>

          {/* SHIPPING */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-mbg-black">
              Shipping
            </span>

            <span className="text-[10px] font-extrabold uppercase tracking-wider text-mbg-green">
              {getShippingLabel(orderDetails.shippingMethod)}
            </span>
          </div>

          {/* STATUS */}
          <div className="flex lg:justify-end">
            <StatusBadge status={status} />
          </div>
        </div>

        {/* ===================================================
            TIMELINE + SHIPPING DETAILS
        ==================================================== */}

        <div className="mt-8">
          <OrderTimeline order={orderDetails} />
        </div>

        {/* ===================================================
            ORDER MESSAGE
        ==================================================== */}

        <p className="mt-7 text-[11px] font-medium text-mbg-black">
          {getOrderMessage(status)}
        </p>

        {/* ===================================================
            SEPARATOR
        ==================================================== */}

        <div className="my-10 h-px w-full bg-mbg-green" />

        {/* ===================================================
            PRODUCTS
        ==================================================== */}

        <div className="flex flex-col gap-7">
          {products.map((orderItem: OrderLine) => {
            const unitPrice =
              orderItem.unitPrice ??
              orderItem.product?.price ??
              0;

            return (
              <div
                key={
                  orderItem._id ??
                  `${
                    orderItem.product?._id ?? "item"
                  }-${orderItem.size ?? ""}-${
                    orderItem.color ?? ""
                  }`
                }
                className="flex items-start gap-5"
              >
                {/* PRODUCT IMAGE */}
                <div className="shrink-0 bg-white">
                  <Image
                    src={
                      orderItem.product?.media?.[0] ||
                      "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
                    }
                    alt={
                      orderItem.product?.title ||
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

                {/* PRODUCT INFORMATION */}
                <div className="flex min-h-[110px] flex-col justify-center gap-[7px]">
                  <ProductInformation
                    label="Title"
                    value={
                      orderItem.product?.title ||
                      "Product"
                    }
                  />

                  {orderItem.color && (
                    <ProductInformation
                      label="Color"
                      value={orderItem.color}
                    />
                  )}

                  {orderItem.size && (
                    <ProductInformation
                      label="Size"
                      value={orderItem.size}
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
                      orderItem.quantity ?? 1
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* ===================================================
            TOTAL SEPARATOR
        ==================================================== */}

        <div className="my-10 h-px w-full bg-mbg-green" />

        {/* ===================================================
            TOTALS
        ==================================================== */}

        <div className="ml-auto w-full max-w-[340px]">
          <div className="space-y-3">
            <PriceRow
              label="Subtotal"
              value={subtotal}
            />

            <PriceRow
              label="Shipping"
              value={shippingAmount}
            />
          </div>

          <div className="mt-7 flex items-center justify-between">
            <span className="text-[14px] font-extrabold uppercase tracking-wider text-mbg-black">
              Total
            </span>

            <span className="text-[14px] font-extrabold uppercase tracking-wider text-mbg-green">
              € {formatAmount(totalAmount)}
            </span>
          </div>
        </div>
      </section>

      {/* =====================================================
          BACK TO ORDERS
      ====================================================== */}

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
   PRODUCT INFORMATION
========================================================= */

function ProductInformation({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <p className="text-[9.5px] font-bold uppercase tracking-widest text-mbg-black">
      <span className="inline-block min-w-[72px]">
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
    <div className="flex items-center justify-between">
      <span className="text-[10px] font-extrabold uppercase tracking-wider text-mbg-black">
        {label}
      </span>

      <span className="text-[10px] font-extrabold uppercase tracking-wider text-mbg-green">
        € {formatAmount(value)}
      </span>
    </div>
  );
}

/* =========================================================
   ORDER MESSAGE
========================================================= */

function getOrderMessage(status: string) {
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
   SHIPPING LABEL
========================================================= */

function getShippingLabel(
  shippingMethod?: string
) {
  const method = String(
    shippingMethod || ""
  ).toUpperCase();

  if (method === "EXPRESS") {
    return "Express Delivery";
  }

  if (method === "FREE") {
    return "Free Delivery";
  }

  return method || "Standard Delivery";
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