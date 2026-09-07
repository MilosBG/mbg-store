import Container from "@/components/mbg-components/Container";
import { H2 } from "@/components/mbg-components/H2";
import Separator from "@/components/mbg-components/Separator";

import {
  getOrders,
  type StorefrontOrder,
} from "@/lib/actions/actions";

import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

import { buildMetadata } from "@/lib/seo";

import OrdersClient, {
  type OrdersClientError,
} from "./OrdersClient";

export const metadata = buildMetadata({
  title: "Orders",
  description:
    "Review your recent Milos BG orders and track delivery steps.",
  path: "/orders",
  image: "/Grinder.png",
  keywords: [
    "orders",
    "purchase history",
    "Milos BG",
  ],
  robotsIndex: false,
});

export default async function Orders() {
  const { userId } = await auth();

  /* =========================================================
     NOT LOGGED IN
  ========================================================= */

  if (!userId) {
    return (
      <Container className="mt-8 min-h-[60vh]">
        <div className="mb-6">
          <H2>Your Orders</H2>

          <p className="mt-2 max-w-xl text-[10px] font-semibold uppercase tracking-[0.18em] text-mbg-black/50">
            Track your orders, products and delivery progress.
          </p>
        </div>

        <Separator className="mb-8 bg-mbg-black" />

        <section
          className="
            flex
            min-h-[260px]
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

          <h3 className="max-w-md text-xl font-extrabold uppercase tracking-tight text-mbg-black md:text-2xl">
            Sign in to view your orders
          </h3>

          <p className="mt-3 max-w-md text-[11px] leading-relaxed text-mbg-black/55">
            Your order history, current status and delivery
            progress will appear here.
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
              transition-all
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

  /* =========================================================
     ORDERS
  ========================================================= */

  let orders: StorefrontOrder[] | null = null;

  let error: OrdersClientError | null = null;

  try {
    orders = await getOrders(userId);
  } catch (err) {
    const status =
      typeof (
        err as
          | { status?: number }
          | null
          | undefined
      )?.status === "number"
        ? (err as { status?: number }).status
        : undefined;

    if (status === 401) {
      error = {
        type: "unauthorized",
        message:
          "We couldn't verify your session. Please sign in again.",
        status,
      };
    } else {
      error = {
        type: "network",
        message:
          "We couldn't load your orders right now.",
        status,
      };
    }

    console.error(
      "Failed to fetch customer orders",
      err
    );
  }

  return (
    <Container className="mt-8 min-h-[60vh] pb-16">
      {/* =====================================================
          PAGE HEADER
      ====================================================== */}

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
          <H2>Your Orders</H2>

          <p className="mt-2 max-w-xl text-[10px] font-semibold uppercase tracking-[0.18em] text-mbg-black/50">
            Track your orders, products and delivery
            progress.
          </p>
        </div>

        {!error && orders && orders.length > 0 && (
          <div
            className="
              inline-flex
              w-fit
              items-center
              border
              border-mbg-black/10
              bg-mbg-black/[0.025]
              px-4
              py-2
            "
          >
            <span className="text-[9px] font-extrabold uppercase tracking-[0.18em] text-mbg-black/50">
              {orders.length}{" "}
              {orders.length === 1
                ? "Order"
                : "Orders"}
            </span>
          </div>
        )}
      </div>

      <Separator className="mb-8 bg-mbg-black" />

      {/* =====================================================
          CLIENT LIST
      ====================================================== */}

      <OrdersClient
        orders={orders ?? []}
        error={error}
      />
    </Container>
  );
}