export const ORDER_PLACED_SESSION_KEY = "mbg-order-placed";

export type OrderPlacedItem = {
  productId: string;
  title: string;
  image: string | null;
  color: string | null;
  size: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderPlacedSnapshot = {
  orderReference: string | null;
  createdAt: string;

  contact: {
    email: string;
    phone: string | null;
  };

  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string | null;
  };

  shippingOption: "FREE" | "EXPRESS";

  items: OrderPlacedItem[];

  subtotal: number;
  shippingFee: number;
  total: number;

  currency: "EUR";
};

function readString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : null;
}

export function extractOrderReference(payload: unknown): string | null {
  if (typeof payload === "string") {
    return readString(payload);
  }

  if (!payload || typeof payload !== "object") {
    return null;
  }

  const root = payload as Record<string, unknown>;

  const directCandidates = [
    root.orderNumber,
    root.orderReference,
    root.orderId,
    root._id,
    root.id,
  ];

  for (const candidate of directCandidates) {
    const value = readString(candidate);

    if (value) {
      return value;
    }
  }

  if (root.order && typeof root.order === "object") {
    const order = root.order as Record<string, unknown>;

    const nestedCandidates = [
      order.orderNumber,
      order.orderReference,
      order.orderId,
      order._id,
      order.id,
    ];

    for (const candidate of nestedCandidates) {
      const value = readString(candidate);

      if (value) {
        return value;
      }
    }
  }

  return null;
}