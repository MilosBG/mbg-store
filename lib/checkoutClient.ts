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
  orderId?: string;
};

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

  const response = await fetch("/api/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(origin ? { "X-Storefront-Origin": origin } : {}),
    },
    body: JSON.stringify({
      cartItems,
      customer,
      shippingOption,
      items: cartItems,
      metadata: {
        origin,
        generatedAt: Date.now(),
        source: "storefront",
      },
    }),
  });

  const bodyText = await response.text();
  let body: any = null;
  if (bodyText) {
    try {
      body = JSON.parse(bodyText);
    } catch {
      body = { raw: bodyText };
    }
  }

  if (!response.ok) {
    const message =
      body?.error ??
      body?.message ??
      (body?.raw && typeof body.raw === "string"
        ? body.raw
        : `Checkout failed (${response.status})`);
    throw new Error(String(message));
  }

  const approveUrl = body?.approveUrl;
  if (typeof approveUrl !== "string" || approveUrl.length === 0) {
    throw new Error("PayPal did not return an approval link.");
  }

  return { approveUrl, orderId: body?.orderId };
}
