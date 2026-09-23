import { auth } from "@clerk/nextjs/server";

import {
  getOrders,
  type StorefrontOrder,
} from "@/lib/actions/actions";
import { buildMetadata } from "@/lib/seo";

import OrdersClient, { type OrdersClientError } from "./OrdersClient";
import Container from "@/components/mbg-components/Container";

export const metadata = buildMetadata({
  title: "Orders",
  description: "Review your Milos BG orders and track their delivery.",
  path: "/orders",
  image: "/Grinder.png",
  keywords: ["orders", "purchase history", "Milos BG"],
  robotsIndex: false,
});

export default async function Orders() {
  const { userId } = await auth();
  let orders: StorefrontOrder[] = [];
  let error: OrdersClientError | null = null;

  if (userId) {
    try {
      const result = await getOrders(userId);
      orders = Array.isArray(result) ? result : [];
    } catch (err) {
      const status =
        typeof (err as { status?: unknown } | null)?.status === "number"
          ? (err as { status: number }).status
          : undefined;

      error = {
        type: status === 401 ? "unauthorized" : "network",
        message:
          status === 401
            ? "We couldn't verify your session. Please sign in again."
            : "We couldn't load your orders right now.",
        status,
      };

      console.error("Failed to fetch customer orders", err);
    }
  }

  return (
    <Container className="pb-10">
      <OrdersClient
        orders={orders}
        error={error}
        requiresSignIn={!userId}
      />
    </Container>
  );
}
