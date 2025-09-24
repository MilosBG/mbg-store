"use client";
import React from "react";

export const STATUS_COLORS: Record<string, string> = {
  PENDING: "rounded-xs tracking-widest shadow-sm bg-gray-200 text-gray-700",
  PROCESSING: "rounded-xs tracking-widest shadow-sm bg-blue-200 text-blue-700",
  SHIPPED: "rounded-xs tracking-widest shadow-sm bg-purple-200 text-purple-700",
  DELIVERED: "rounded-xs tracking-widest shadow-sm bg-teal-200 text-teal-800",
  COMPLETED: "rounded-xs tracking-widest shadow-sm bg-green-200 text-green-700",
  CANCELLED: "rounded-xs tracking-widest shadow-sm bg-red-200 text-red-700",
};

export function StatusBadge({ status }: { status: string }) {
  const s = String(status || "PENDING").toUpperCase();
  const cls = STATUS_COLORS[s] || STATUS_COLORS.PENDING;
  return (
    <span className={`inline-block rounded px-2 py-1 text-xs font-semibold ${cls}`}>
      {s}
    </span>
  );
}

export const STATUS_MESSAGES: Record<string, string> = {
  PENDING: "Order received. We will start processing soon.",
  PROCESSING: "We’re preparing your order.",
  SHIPPED: "Your order is on the way.",
  DELIVERED: "Your order has been delivered.",
  COMPLETED: "Order completed. Thank you!",
  CANCELLED: "Order was cancelled.",
};

