import React from "react";
import { STATUS_MESSAGES } from "./StatusBadge";

type Props = {
  order: {
    processingAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    completedAt?: string;
    cancelledAt?: string;
  };
};

function fmt(d?: string) {
  if (!d) return "";
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? "" : dt.toLocaleString();
}

export function OrderTimeline({ order }: Props) {
  const items = [
    { k: "processingAt", label: "Processing", at: order.processingAt, code: "PROCESSING" },
    { k: "shippedAt", label: "Shipped", at: order.shippedAt, code: "SHIPPED" },
    { k: "deliveredAt", label: "Delivered", at: order.deliveredAt, code: "DELIVERED" },
    { k: "completedAt", label: "Completed", at: order.completedAt, code: "COMPLETED" },
    { k: "cancelledAt", label: "Cancelled", at: order.cancelledAt, code: "CANCELLED" },
  ].filter((i) => !!i.at);

  if (!items.length)
    return <p className="text-xs text-gray-500">No tracking events yet.</p>;

  return (
    <ul className="text-xs space-y-1">
      {items.map((i) => (
        <li key={i.k} className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-mbg-green" />
          <span className="font-bold tracking-widest text-[10px] uppercase">{i.label}</span>
          <span className="text-mbg-black/70 text-[10px]" >{fmt(i.at)}</span>
          <span className="text-mbg-black/50 text-[10px] uppercase tracking-wide"> {STATUS_MESSAGES[i.code] || ""}</span>
        </li>
      ))}
    </ul>
  );
}

