/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";

const ADMIN_API_BASE = (() => {
  const base = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
  if (!base) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }
  return base;
})();
const ADMIN_SERVICE_TOKEN = process.env.ADMIN_SERVICE_TOKEN;

export async function POST(req: NextRequest) {
  if (!ADMIN_SERVICE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "ADMIN_SERVICE_TOKEN is missing. Please set it so the storefront can authenticate with mbg-admin.",
      },
      { status: 500 }
    );
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request payload." },
      { status: 400 }
    );
  }

  const candidateEndpoints = buildAdminCheckoutEndpoints(ADMIN_API_BASE);
  let lastError: { status: number; message: string } | null = null;

  for (const endpoint of candidateEndpoints) {
    try {
      const adminResponse = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${ADMIN_SERVICE_TOKEN}`,
          "X-Storefront-Service-Token": ADMIN_SERVICE_TOKEN,
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const contentType =
        adminResponse.headers.get("content-type")?.toLowerCase() ?? "";
      const text = await adminResponse.text();
      let data: any = null;
      if (text) {
        try {
          data = JSON.parse(text);
        } catch {
          data = { raw: text };
        }
      }

      const looksLikeClerk =
        adminResponse.url?.includes("sign-in") ||
        (typeof data?.raw === "string" &&
          data.raw.toLowerCase().includes("clerk"));

      if (
        looksLikeClerk ||
        adminResponse.status === 401 ||
        adminResponse.status === 403
      ) {
        lastError = {
          status: adminResponse.status,
          message:
            "mbg-admin rejected the service token. Ensure the admin endpoint trusts ADMIN_SERVICE_TOKEN and exposes /storefront/checkout.",
        };
        continue;
      }

      if (!adminResponse.ok) {
        return NextResponse.json(
          data ?? { error: "Checkout request failed." },
          { status: adminResponse.status }
        );
      }

      if (!contentType.includes("application/json")) {
        lastError = {
          status: 502,
          message: "Unexpected checkout response format.",
        };
        continue;
      }

      return NextResponse.json(data ?? { approveUrl: null });
    } catch (error) {
      lastError = {
        status: 502,
        message: `Checkout proxy request failed: ${String(error)}`,
      };
    }
  }

  return NextResponse.json(
    {
      error:
        lastError?.message ??
        "Checkout service is unreachable. Please try again later or verify mbg-admin storefront integration.",
      details: lastError,
    },
    { status: lastError?.status ?? 502 }
  );
}

function buildAdminCheckoutEndpoints(base: string): string[] {
  const endpoints = new Set<string>();
  const cleaned = base.replace(/\/$/, "");
  endpoints.add(`${cleaned}/storefront/checkout`);
  endpoints.add(`${cleaned}/checkout`);
  return Array.from(endpoints);
}
