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

export type ContactDetails = {
  email: string;
  phone?: string | null;
};

export type ShippingAddress = {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone?: string | null;
};

export type CheckoutPayload = {
  lines: CheckoutLine[];
  customer: CheckoutCustomer;
  shippingOption: "FREE" | "EXPRESS";
  contact: ContactDetails;
  shippingAddress: ShippingAddress;
  notes?: string | null;
};

export type CheckoutOrderResult = {
  orderId: string | null;
  reference?: string | null;
  approveUrl?: string | null;
  message?: string | null;
  raw?: unknown;
};

function resolveAdminBase() {
  const explicit = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (explicit && explicit.length > 0) {
    return explicit.replace(/\/$/, "");
  }

  if (process.env.NODE_ENV !== "production") {
    const fallback = "http://localhost:3000/api";
    console.warn(
      "[checkout] NEXT_PUBLIC_API_URL missing – falling back to",
      fallback,
    );
    return fallback;
  }

  return "";
}

const ADMIN_API_BASE = resolveAdminBase();
const STOREFRONT_SERVICE_TOKEN = process.env.NEXT_PUBLIC_STOREFRONT_SERVICE_TOKEN?.trim();

export async function createCheckoutOrder({
  lines,
  customer,
  shippingOption,
  contact,
  shippingAddress,
  notes,
}: CheckoutPayload): Promise<CheckoutOrderResult> {
  if (!Array.isArray(lines) || lines.length === 0) {
    throw new Error("Your cart is empty.");
  }

  if (!customer?.clerkId) {
    throw new Error("You must be signed in to checkout.");
  }

  if (!contact?.email) {
    throw new Error("Contact email is required.");
  }

  if (!shippingAddress) {
    throw new Error("Shipping details are required.");
  }

  const essentialShippingFields: Array<keyof ShippingAddress> = [
    "firstName",
    "lastName",
    "address",
    "city",
    "postalCode",
    "country",
  ];

  const missingShippingField = essentialShippingFields.find((field) => {
    const value = shippingAddress?.[field];
    return typeof value !== "string" || value.trim().length === 0;
  });

  if (missingShippingField) {
    throw new Error("Shipping details are incomplete. Please fill out all required fields.");
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

  const subtotalAmount = Number(
    cartItems.reduce((sum, line) => sum + (Number(line.unitPrice) || 0) * line.quantity, 0).toFixed(2),
  );
  const shippingAmount = shippingOption === "EXPRESS" ? 10 : 0;
  const totalAmount = Number((subtotalAmount + shippingAmount).toFixed(2));

  const normalizedContact = {
    email: contact.email.trim(),
    phone: contact.phone?.toString().trim() || null,
  };

  const normalizedShipping = {
    firstName: shippingAddress.firstName.trim(),
    lastName: shippingAddress.lastName.trim(),
    address: shippingAddress.address.trim(),
    city: shippingAddress.city.trim(),
    postalCode: shippingAddress.postalCode.trim(),
    country: shippingAddress.country.trim(),
    phone: shippingAddress.phone?.toString().trim() || null,
  };

  const payload = {
    cartItems,
    customer,
    shippingOption,
    lines: cartItems,
    items: cartItems,
    contact: normalizedContact,
    shippingAddress: normalizedShipping,
    notes: typeof notes === "string" && notes.trim().length > 0 ? notes.trim() : undefined,
    metadata: {
      origin,
      generatedAt: Date.now(),
      source: "storefront",
    },
    shippingAmount,
    subtotalAmount,
    totalAmount,
    amount: totalAmount,
    shippingRate: shippingOption === "EXPRESS" ? "EXPRESS_DELIVERY" : "FREE_DELIVERY",
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

      return {
        orderId: typeof body?.orderId === "string" ? body.orderId : null,
        reference: typeof body?.reference === "string" ? body.reference : null,
        approveUrl:
          typeof body?.approveUrl === "string" && body.approveUrl.length > 0
            ? body.approveUrl
            : null,
        message: typeof body?.message === "string" ? body.message : null,
        raw: body,
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
