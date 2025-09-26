import type { Metadata } from "next";
/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "@/components/mbg-components/Container";
import { H2 } from "@/components/mbg-components/H2";
import Separator from "@/components/mbg-components/Separator";
import { StatusBadge, STATUS_MESSAGES } from "@/components/orders/StatusBadge";
import { OrderTimeline } from "@/components/orders/OrderTimeline";
import { getOrderDetails } from "@/lib/actions/actions";
import { buildMetadata } from "@/lib/seo";
import Image from "next/image";
import Link from "next/link";

type PageProps = {
  params: Promise<{ orderId: string }>;
};

type ResolvedOrder = NonNullable<Awaited<ReturnType<typeof getOrderDetails>>>;
type OrderLine = NonNullable<ResolvedOrder["products"]>[number];

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { orderId } = await params;
  const encodedId = encodeURIComponent(orderId);
  return buildMetadata({
    title: `Order ${orderId}`,
    description: "Securely review the timeline and fulfillment status for your Milos BG order.",
    path: `/orders/${encodedId}`,
    image: "/Grinder.png",
    keywords: ["orders", "order status", "Milos BG"],
    robotsIndex: false,
  });
}

export default async function OrderDetailsPage({ params }: PageProps) {
  const { orderId } = await params;
  const baseData = await getOrderDetails(orderId);
  const fallbackOrder: ResolvedOrder = {
    _id: orderId,
    totalAmount: 0,
    fulfillmentStatus: "PENDING",
    products: [],
  };
  const orderDetails = baseData ?? fallbackOrder;
  const status = String(orderDetails.fulfillmentStatus || "PENDING").toUpperCase();

  return (
    <Container className="mt-4 min-h-[50vh]">
      <div className="flex items-center gap-2">
        <H2><Link href={"/orders"}>Order</Link></H2>
        <p className="text-mbg-green text-lg font-extrabold uppercase tracking-widest">{orderId}</p>
      </div>
      <Separator className="bg-mbg-black mt-2 mb-4" />

      <div className="flex items-center gap-3">
        <StatusBadge status={status} />
        <p className="text-xs">{STATUS_MESSAGES[status] || ""}</p>
      </div>

      <div className="mt-4">
        <OrderTimeline order={orderDetails} />
      </div>

      <div className="flex flex-col gap-5 mt-6">
        {(orderDetails.products ?? []).map((orderItem: OrderLine) => (
          <div key={orderItem._id ?? `${orderItem.product?._id ?? "item"}-${orderItem.size ?? ""}-${orderItem.color ?? ""}`} className="flex gap-4">
            <Image
              src={orderItem.product?.media?.[0] || "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="}
              alt={orderItem.product?.title || "Product"}
              width={100}
              height={100}
              className="w-24 h-24 rounded-xs object-contain bg-mbg-rgbablank"
            />
            <div className="flex flex-col justify-between">
              <p className="font-bold tracking-widest text-[9.5px] uppercase">
                Title <span className="font-bold tracking-widest text-[9.5px] uppercase text-mbg-green ml-2">{orderItem.product?.title || "Product"}</span>
              </p>
              {orderItem.color && (
                <p className="font-bold tracking-widest text-[9.5px] uppercase">
                  Color <span className="font-bold tracking-widest text-[9.5px] uppercase text-mbg-green ml-2">{orderItem.color}</span>
                </p>
              )}
              {orderItem.size && (
                <p className="font-bold tracking-widest text-[9.5px] uppercase">
                  Size <span className="font-bold tracking-widest text-[9.5px] uppercase text-mbg-green ml-2">{orderItem.size}</span>
                </p>
              )}
              <p className="font-bold tracking-widest text-[9.5px] uppercase">
                Unit Price <span className="font-bold tracking-widest text-[9.5px] uppercase text-mbg-green ml-2">? {Number(orderItem.product?.price ?? 0).toFixed(2)}</span>
              </p>
              <p className="font-bold tracking-widest text-[9.5px] uppercase">
                Quantity <span className="font-bold tracking-widest text-[9.5px] uppercase text-mbg-green ml-2">{orderItem.quantity}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}
