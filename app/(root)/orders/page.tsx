/* eslint-disable @typescript-eslint/no-explicit-any */
import Container from "@/components/mbg-components/Container";
import { H2 } from "@/components/mbg-components/H2";
import Separator from "@/components/mbg-components/Separator";
import { getOrders } from "@/lib/actions/actions";
import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { buildMetadata } from "@/lib/seo";
import { StatusBadge, STATUS_MESSAGES } from "@/components/orders/StatusBadge";
import { OrderTimeline } from "@/components/orders/OrderTimeline";

export const metadata = buildMetadata({
  title: "Orders",
  description: "Review your recent Milos BG orders and track delivery steps.",
  path: "/orders",
  image: "/Grinder.png",
  keywords: ["orders", "purchase history", "Milos BG"],
  robotsIndex: false,
});

export default async function Orders() {
  const { userId } = await auth();

  if (!userId) {
    return (
      <Container className="mt-4 min-h-[50vh]">
        <H2>Your Orders</H2>
        <Separator className="bg-mbg-black mt-2 mb-4" />
        <p className="uppercase text-[11px] tracking-widest font-bold text-mbg-green py-3">
          Please sign in to view your orders.
        </p>
      </Container>
    );
  }

  const orders = await getOrders(userId);

  return (
    <Container className="mt-4 min-h-[50vh]">
      <H2>Your Orders</H2>
      <Separator className="bg-mbg-black mt-2 mb-4" />

      {orders.length === 0 ? (
        <p className="uppercase text-[11px] tracking-widest font-bold text-mbg-green py-3">
          You Have No Order Yet.
        </p>
      ) : (
        <div className="flex flex-col gap-10">
          {orders.map((order: any) => (
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
                <div className="mbg-p-between space-x-2" >
                  <label className=" font-bold uppercase text-xs" >Total Amount</label>
                  <p className="text-mbg-green font-bold uppercase text-xs tracking-widest">
                   €{" "}{Number(order.totalAmount).toFixed(2)}
                  </p>
                </div>
                <StatusBadge
                  status={String(
                    order.fulfillmentStatus || "PENDING"
                  ).toUpperCase()}
                />
              </div>

              <div>
                <OrderTimeline order={order} />
              </div>

              <p className="text-xs text-mbg-black/80">
                {STATUS_MESSAGES[
                  String(order.fulfillmentStatus || "PENDING").toUpperCase()
                ] || ""}
              </p>

              <div className="flex flex-col gap-5 mb-5">
                <Separator className=" border-mbg-green" />
                {(order.products ?? []).map((orderItem: any) => (
                  <div key={orderItem._id} className="flex gap-4">
                    <Image
                      src={orderItem.product?.media?.[0] || "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="}
                      alt={orderItem.product?.title || "Product"}
                      width={100}
                      height={100}
                      className="w-24 h-24 rounded-xs object-contain bg-mbg-rgbablank"
                    />
                    <div className="flex flex-col justify-between">
                      <p className="font-bold tracking-widest text-[9.5px] uppercase">
                        Title{" "}
                        <span className="font-bold tracking-widest text-[9.5px] uppercase text-mbg-green ml-2">
                          {orderItem.product?.title || "Product"}
                        </span>
                      </p>
                      {orderItem.color && (
                        <p className="font-bold tracking-widest text-[9.5px] uppercase">
                          Color{" "}
                          <span className="font-bold tracking-widest text-[9.5px] uppercase text-mbg-green ml-2">{orderItem.color}</span>
                        </p>
                      )}
                      {orderItem.size && (
                        <p className="font-bold tracking-widest text-[9.5px] uppercase">
                          Size{" "}
                          <span className="font-bold tracking-widest text-[9.5px] uppercase text-mbg-green ml-2">{orderItem.size}</span>
                        </p>
                      )}
                      <p className="font-bold tracking-widest text-[9.5px] uppercase">
                        Unit Price{" "}
                        <span className="font-bold tracking-widest text-[9.5px] uppercase text-mbg-green ml-2">
                          €{" "}{Number(orderItem.product?.price ?? 0).toFixed(2)}
                        </span>
                      </p>
                      <p className="font-bold tracking-widest text-[9.5px] uppercase">
                        Quantity{" "}
                        <span className="font-bold tracking-widest text-[9.5px] uppercase text-mbg-green ml-2">{orderItem.quantity}</span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </Container>
  );
}
