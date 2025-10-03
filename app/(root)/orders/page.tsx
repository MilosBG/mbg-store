import Container from "@/components/mbg-components/Container";
import { H2 } from "@/components/mbg-components/H2";
import Separator from "@/components/mbg-components/Separator";
import { getOrders, type StorefrontOrder } from "@/lib/actions/actions";
import { auth } from "@clerk/nextjs/server";
import React from "react";
import { buildMetadata } from "@/lib/seo";
import OrdersClient, { type OrdersClientError } from "./OrdersClient";

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

  let orders: StorefrontOrder[] | null = null;
  let error: OrdersClientError | null = null;

  try {
    orders = await getOrders(userId);
  } catch (err) {
    const status =
      typeof (err as { status?: number } | null | undefined)?.status === "number"
        ? (err as { status?: number }).status
        : undefined;

    if (status === 401) {
      error = {
        type: "unauthorized",
        message:
          "We couldn't verify your session. Please sign in again, then tap retry.",
        status,
      };
    } else {
      error = {
        type: "network",
        message: "Couldn't load your orders. Tap to retry.",
        status,
      };
    }

    console.error("Failed to fetch customer orders", err);
  }

  return (
    <Container className="mt-4 min-h-[50vh]">
      <H2>Your Orders</H2>
      <Separator className="bg-mbg-black mt-2 mb-4" />
      <OrdersClient orders={orders ?? []} error={error} />
    </Container>
  );
}
