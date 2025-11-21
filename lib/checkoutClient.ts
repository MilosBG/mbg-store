/* eslint-disable @typescript-eslint/no-explicit-any */
export type CheckoutLine = {
  productId: string;
  quantity: number;
  unitPrice?: number;
  color?: string | null;
  size?: string | null;
  title?: string | null;
  image?: string | null;
};

export type CheckoutCustomer = {
  clerkId: string;
  email?: string | null;
  name?: string | null;
};

export type CheckoutPayload = {
  lines: CheckoutLine[];
  customer: CheckoutCustomer;
  shippingOption: "FREE" | "EXPRESS";
};

export type CheckoutSuccess = {
  approveUrl: string;
  orderId?: string | null;
};

const ADMIN_API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const STOREFRONT_SERVICE_TOKEN = process.env.NEXT_PUBLIC_STOREFRONT_SERVICE_TOKEN?.trim();

export async function createPayPalCheckout({
  lines,
  customer,
  shippingOption,
}: CheckoutPayload): Promise<CheckoutSuccess> {
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error("Your cart is empty.");
  }

  if (!customer?.clerkId) {
    throw new Error("You must be signed in to checkout.");
  }

  if (!ADMIN_API_BASE) {
    throw new Error("Storefront checkout endpoint is not configured.");
  }

  const origin = typeof window !== "undefined" ? window.location.origin : undefined;

  const cartItems = lines.map((line) => ({
    productId: line.productId,
    quantity: line.quantity,
    unitPrice: line.unitPrice ?? null,
    color: line.color ?? null,
    size: line.size ?? null,
    title: line.title ?? null,
    image: line.image ?? null,
  }));

  const payload = {
    cartItems,
    customer,
    shippingOption,
    items: cartItems,
    metadata: {
      origin,
      generatedAt: Date.now(),
      source: "storefront",
    },
  };

  const candidateEndpoints = buildCheckoutEndpoints(ADMIN_API_BASE);
  let lastError: { status: number; message: string } | null = null;

  for (const endpoint of candidateEndpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(STOREFRONT_SERVICE_TOKEN
            ? {
                Authorization: `Bearer ${STOREFRONT_SERVICE_TOKEN}`,
                "X-Storefront-Service-Token": STOREFRONT_SERVICE_TOKEN,
              }
            : {}),
          ...(origin ? { "X-Storefront-Origin": origin } : {}),
        },
        body: JSON.stringify(payload),
        cache: "no-store",
      });

      const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
      const bodyText = await response.text();
      let body: any = null;
      if (bodyText) {
        try {
          body = JSON.parse(bodyText);
        } catch {
          body = { raw: bodyText };
        }
      }

      const unauthorized = response.status === 401 || response.status === 403;

      if (unauthorized) {
        lastError = {
          status: response.status,
          message:
            "mbg-admin rejected the storefront token. Verify NEXT_PUBLIC_STOREFRONT_SERVICE_TOKEN and admin permissions.",
        };
        continue;
      }

      if (!response.ok) {
        const message =
          body?.error ??
          body?.message ??
          (typeof body?.raw === "string" ? body.raw : "Checkout request failed.");
        throw new Error(String(message));
      }

      if (!contentType.includes("application/json")) {
        lastError = {
          status: 502,
          message: "Unexpected checkout response format.",
        };
        continue;
      }

      const approveUrl = body?.approveUrl;
      if (typeof approveUrl !== "string" || approveUrl.length === 0) {
        throw new Error("PayPal did not return an approval link.");
      }

      return {
        approveUrl,
        orderId: typeof body?.orderId === "string" ? body.orderId : null,
      };
    } catch (error) {
      lastError = {
        status: lastError?.status ?? 502,
        message: `Checkout request failed: ${String(error instanceof Error ? error.message : error)}`,
      };
    }
  }

  throw new Error(
    lastError?.message ??
      "Checkout service is unreachable. Please try again later or verify mbg-admin storefront integration.",
  );
}

function buildCheckoutEndpoints(base: string): string[] {
  const cleaned = base.replace(/\/$/, "");
  return Array.from(
    new Set([
      "/api/checkout",
      `${cleaned}/storefront/checkout`,
      `${cleaned}/checkout`,
    ]),
  );
}
