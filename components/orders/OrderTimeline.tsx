import React from "react";
import { FiExternalLink, FiTruck } from "react-icons/fi";
import { STATUS_MESSAGES } from "./StatusBadge";

type Props = {
  order: {
    fulfillmentStatus?: string;

    processingAt?: string;
    shippedAt?: string;
    deliveredAt?: string;
    completedAt?: string;
    cancelledAt?: string;

    // Shipping information coming from mbg-admin
    trackingNumber?: string;
    transporter?: string;
    dateMailed?: string;
  };
};

function fmt(d?: string) {
  if (!d) return "";

  const dt = new Date(d);

  return isNaN(dt.getTime())
    ? ""
    : dt.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
}

/**
 * Transforme :
 *
 * www.colissimo.fr/...
 *
 * en :
 *
 * https://www.colissimo.fr/...
 *
 * afin que le lien fonctionne correctement dans href.
 */
function normalizeTrackingUrl(value?: string) {
  if (!value) return "";

  const tracking = value.trim();

  if (!tracking) return "";

  if (
    tracking.startsWith("http://") ||
    tracking.startsWith("https://")
  ) {
    return tracking;
  }

  if (tracking.startsWith("www.")) {
    return `https://${tracking}`;
  }

  return "";
}

export function OrderTimeline({ order }: Props) {
  const items = [
    {
      k: "processingAt",
      label: "Processing",
      at: order.processingAt,
      code: "PROCESSING",
    },
    {
      k: "shippedAt",
      label: "Shipped",
      at: order.shippedAt,
      code: "SHIPPED",
    },
    {
      k: "deliveredAt",
      label: "Delivered",
      at: order.deliveredAt,
      code: "DELIVERED",
    },
    {
      k: "completedAt",
      label: "Completed",
      at: order.completedAt,
      code: "COMPLETED",
    },
    {
      k: "cancelledAt",
      label: "Cancelled",
      at: order.cancelledAt,
      code: "CANCELLED",
    },
  ].filter((i) => !!i.at);

  if (!items.length) {
    return (
      <p className="text-xs text-gray-500">
        No tracking events yet.
      </p>
    );
  }

  /*
   * IMPORTANT :
   *
   * On utilise shippedAt et pas uniquement :
   *
   * order.fulfillmentStatus === "SHIPPED"
   *
   * Ainsi le tracking reste visible quand la commande
   * devient ensuite DELIVERED ou COMPLETED.
   */
  const hasBeenShipped = Boolean(order.shippedAt);

  const trackingUrl = normalizeTrackingUrl(
    order.trackingNumber
  );

  return (
    <div>
      {/* ==================================================
          ORDER TIMELINE
      ================================================== */}

      <ul className="space-y-1 text-xs">
        {items.map((i) => (
          <li
            key={i.k}
            className="flex flex-wrap items-center gap-2"
          >
            {/* DOT */}
            <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-mbg-green" />

            {/* STATUS */}
            <span className="text-[10px] font-bold uppercase tracking-widest text-mbg-black">
              {i.label}
            </span>

            {/* DATE */}
            <span className="text-[10px] text-mbg-black/70">
              {fmt(i.at)}
            </span>

            {/* MESSAGE */}
            <span className="text-[10px] uppercase tracking-wide text-mbg-black/50">
              {STATUS_MESSAGES[i.code] || ""}
            </span>
          </li>
        ))}
      </ul>

      {/* ==================================================
          SHIPPING INFORMATION
      ================================================== */}

      {hasBeenShipped &&
        (order.transporter || order.trackingNumber) && (
          <div className="mt-5">
            <div className="max-w-[520px] border-l-2 border-mbg-green pl-4">
              {/* HEADER */}
              <div className="mb-3 flex items-center gap-2">
                <FiTruck className="text-[13px] text-mbg-green" />

                <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-mbg-black">
                  Shipping Information
                </span>
              </div>

              <div className="space-y-2">
                {/* TRANSPORTER */}
                {order.transporter && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="min-w-[90px] text-[10px] font-bold uppercase tracking-wider text-mbg-black">
                      Carrier
                    </span>

                    <span className="text-[10px] font-bold uppercase tracking-wider text-mbg-green">
                      {order.transporter}
                    </span>
                  </div>
                )}

                {/* DATE MAILED */}
                {order.dateMailed && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="min-w-[90px] text-[10px] font-bold uppercase tracking-wider text-mbg-black">
                      Shipped on
                    </span>

                    <span className="text-[10px] font-medium tracking-wide text-mbg-black/70">
                      {fmt(order.dateMailed)}
                    </span>
                  </div>
                )}

                {/* TRACKING URL */}
                {trackingUrl && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="min-w-[90px] text-[10px] font-bold uppercase tracking-wider text-mbg-black">
                      Tracking
                    </span>

                    <a
                      href={trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        inline-flex
                        items-center
                        gap-1
                        text-[10px]
                        font-bold
                        uppercase
                        tracking-wider
                        text-mbg-green
                        underline
                        decoration-1
                        underline-offset-4
                        transition-opacity
                        hover:opacity-60
                      "
                    >
                      Track your package

                      <FiExternalLink className="text-[11px]" />
                    </a>
                  </div>
                )}

                {/* TRACKING NUMBER WITHOUT URL */}
                {order.trackingNumber && !trackingUrl && (
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="min-w-[90px] text-[10px] font-bold uppercase tracking-wider text-mbg-black">
                      Tracking #
                    </span>

                    <span className="text-[10px] font-bold tracking-wide text-mbg-green">
                      {order.trackingNumber}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </div>
  );
}