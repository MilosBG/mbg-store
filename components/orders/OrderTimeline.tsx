import React from "react";
import {
  FiExternalLink,
  FiTruck,
} from "react-icons/fi";
import { STATUS_MESSAGES } from "./StatusBadge";

type Props = {
  order: {
    fulfillmentStatus?: string;

    processingAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    completedAt?: string;
    cancelledAt?: string;

    trackingNumber?: string;
    transporter?: string;
    dateMailed?: string;
  };
};

function fmt(d?: string) {
  if (!d) return "";

  const dt = new Date(d);

  if (Number.isNaN(dt.getTime())) {
    return "";
  }

  return dt.toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function normalizeTrackingUrl(
  value?: string
) {
  if (!value) return "";

  const tracking = value.trim();

  if (!tracking) return "";

  if (
    tracking.startsWith("https://") ||
    tracking.startsWith("http://")
  ) {
    return tracking;
  }

  if (tracking.startsWith("www.")) {
    return `https://${tracking}`;
  }

  return "";
}

export function OrderTimeline({
  order,
}: Props) {
  const items = [
    {
      key: "processingAt",
      label: "Processing",
      at: order.processingAt,
      code: "PROCESSING",
    },
    {
      key: "shippedAt",
      label: "Shipped",
      at: order.shippedAt,
      code: "SHIPPED",
    },
    {
      key: "deliveredAt",
      label: "Delivered",
      at: order.deliveredAt,
      code: "DELIVERED",
    },
    {
      key: "completedAt",
      label: "Completed",
      at: order.completedAt,
      code: "COMPLETED",
    },
    {
      key: "cancelledAt",
      label: "Cancelled",
      at: order.cancelledAt,
      code: "CANCELLED",
    },
  ].filter((item) => Boolean(item.at));

  if (!items.length) {
    return (
      <p className="text-[10px] text-mbg-black/50">
        No tracking events yet.
      </p>
    );
  }

  const hasBeenShipped =
    Boolean(order.shippedAt) ||
    [
      "SHIPPED",
      "DELIVERED",
      "COMPLETED",
    ].includes(
      String(
        order.fulfillmentStatus || ""
      ).toUpperCase()
    );

  const trackingUrl =
    normalizeTrackingUrl(
      order.trackingNumber
    );

  return (
    <div>
      {/* ===================================================
          TIMELINE
      ==================================================== */}

      <ul className="space-y-[6px]">
        {items.map((item) => (
          <li
            key={item.key}
            className="
              grid
              grid-cols-[8px_70px_auto_1fr]
              items-center
              gap-x-2
            "
          >
            {/* DOT */}
            <span className="h-2 w-2 rounded-full bg-mbg-green" />

            {/* STATUS */}
            <span className="text-[9.5px] font-extrabold uppercase tracking-wider text-mbg-black">
              {item.label}
            </span>

            {/* DATE */}
            <span className="whitespace-nowrap text-[9.5px] font-medium text-mbg-black/80">
              {fmt(item.at)}
            </span>

            {/* STATUS MESSAGE */}
            <span className="text-[9.5px] uppercase tracking-wide text-mbg-black/50">
              {STATUS_MESSAGES[item.code] ||
                ""}
            </span>
          </li>
        ))}
      </ul>

      {/* ===================================================
          SHIPPING INFORMATION
      ==================================================== */}

      {hasBeenShipped &&
        (order.transporter ||
          order.trackingNumber ||
          order.dateMailed) && (
          <div
            className="
              mt-6
              w-full
              max-w-[530px]
              border
              border-mbg-green
              bg-white/20
              px-5
              py-4
            "
          >
            {/* TITLE */}
            <div className="mb-5 flex items-center gap-2">
              <FiTruck className="text-[16px] text-mbg-green" />

              <span className="text-[10px] font-extrabold uppercase tracking-widest text-mbg-green">
                Shipping Information
              </span>
            </div>

            <div className="space-y-3">
              {/* CARRIER */}
              {order.transporter && (
                <ShippingRow
                  label="Carrier"
                  value={
                    <span className="font-bold uppercase text-mbg-green">
                      {order.transporter}
                    </span>
                  }
                />
              )}

              {/* DATE */}
              {(order.dateMailed ||
                order.shippedAt) && (
                <ShippingRow
                  label="Shipped on"
                  value={
                    <span>
                      {fmt(
                        order.dateMailed ||
                          order.shippedAt
                      )}
                    </span>
                  }
                />
              )}

              {/* TRACKING URL */}
              {trackingUrl && (
                <ShippingRow
                  label="Tracking"
                  value={
                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        font-extrabold
                        uppercase
                        tracking-wider
                        text-mbg-green
                        underline
                        underline-offset-4
                        transition-opacity
                        hover:opacity-60
                      "
                    >
                      Track your package

                      <FiExternalLink className="text-[11px]" />
                    </a>
                  }
                />
              )}

              {/* TRACKING NUMBER */}
              {order.trackingNumber &&
                !trackingUrl && (
                  <ShippingRow
                    label="Tracking #"
                    value={
                      <span className="font-bold text-mbg-green">
                        {order.trackingNumber}
                      </span>
                    }
                  />
                )}
            </div>
          </div>
        )}
    </div>
  );
}

function ShippingRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div
      className="
        grid
        grid-cols-[105px_1fr]
        items-center
        gap-3
        text-[10px]
      "
    >
      <span className="font-extrabold uppercase tracking-wider text-mbg-black">
        {label}
      </span>

      <div className="font-medium text-mbg-black">
        {value}
      </div>
    </div>
  );
}