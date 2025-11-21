/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const ADMIN_API_BASE = (() => {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  return base && base.length > 0 ? base : null;
})();

const STOREFRONT_SERVICE_TOKEN =
  process.env.ADMIN_SERVICE_TOKEN?.trim() ||
  process.env.STOREFRONT_SERVICE_TOKEN?.trim() ||
  process.env.NEXT_PUBLIC_STOREFRONT_SERVICE_TOKEN?.trim() ||
  null;

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ orderId: string }> },
) {
  const { orderId } = await context.params;
  const rawOrderId = orderId?.trim();

  if (!rawOrderId) {
    return NextResponse.json({ error: "Order id is required." }, { status: 400 });
  }

  if (!ADMIN_API_BASE) {
    return NextResponse.json(
      { error: "NEXT_PUBLIC_API_URL is not configured for the storefront." },
      { status: 500 },
    );
  }

  const encodedOrderId = encodeURIComponent(rawOrderId);
  const candidateEndpoints = buildAdminOrderEndpoints(ADMIN_API_BASE, encodedOrderId);

  type ProxyError = { status: number; message: string };
  let lastError: ProxyError | undefined;

  for (const endpoint of candidateEndpoints) {
    try {
      const adminResponse = await fetch(endpoint, {
        headers: {
          Accept: "application/json",
          ...(STOREFRONT_SERVICE_TOKEN
            ? {
                Authorization: `Bearer ${STOREFRONT_SERVICE_TOKEN}`,
                "X-Storefront-Service-Token": STOREFRONT_SERVICE_TOKEN,
              }
            : {}),
        },
        cache: "no-store",
      });

      const contentType = adminResponse.headers.get("content-type")?.toLowerCase() ?? "";
      const text = await adminResponse.text();

      if (contentType.includes("application/json")) {
        let payload: any = null;
        if (text) {
          try {
            payload = JSON.parse(text);
          } catch {
            payload = { raw: text };
          }
        }

        if (payload === null) {
          return NextResponse.json(
            { ok: adminResponse.ok, status: adminResponse.status },
            { status: adminResponse.status },
          );
        }

        return NextResponse.json(payload, { status: adminResponse.status });
      }

      if (!text) {
        return NextResponse.json(
          { ok: adminResponse.ok, status: adminResponse.status },
          { status: adminResponse.status },
        );
      }

      return new NextResponse(text, {
        status: adminResponse.status,
        headers: { "content-type": contentType || "text/plain" },
      });
    } catch (error) {
      const status = lastError?.status ?? 502;
      lastError = {
        status,
        message: `Order verification proxy failed: ${String(error)}`,
      };
    }
  }

  return NextResponse.json(
    {
      error:
        lastError?.message ??
        "Unable to verify the order status. Please try again later or verify mbg-admin storefront integration.",
      details: lastError,
    },
    { status: lastError?.status ?? 502 },
  );
}

function buildAdminOrderEndpoints(base: string, orderId: string): string[] {
  const cleaned = base.replace(/\/$/, "");
  return Array.from(
    new Set([
      `${cleaned}/storefront/orders/${orderId}`,
      `${cleaned}/orders/${orderId}`,
    ]),
  );
}
