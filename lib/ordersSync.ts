import "server-only";

import { createHash } from "crypto";
import { getAdminDb, getAdminMongoClient } from "./adminDb";
import { ObjectId, type ClientSession, type Db } from "mongodb";

type RawCartItem = {
  productId?: unknown;
  quantity?: unknown;
  unitPrice?: unknown;
  color?: unknown;
  size?: unknown;
  title?: unknown;
  image?: unknown;
};

type RawCheckoutPayload = {
  cartItems?: unknown;
  items?: unknown;
  lines?: unknown;
  customer?: {
    clerkId?: unknown;
    email?: unknown;
    name?: unknown;
  };
  shippingOption?: unknown;
  contact?: {
    email?: unknown;
    phone?: unknown;
  };
  shippingAddress?: {
    firstName?: unknown;
    lastName?: unknown;
    address?: unknown;
    city?: unknown;
    postalCode?: unknown;
    country?: unknown;
    phone?: unknown;
  };
  notes?: unknown;
  metadata?: {
    source?: unknown;
    origin?: unknown;
    generatedAt?: unknown;
    [key: string]: unknown;
  };
  shippingAmount?: unknown;
  subtotalAmount?: unknown;
  totalAmount?: unknown;
  amount?: unknown;
};

type NormalizedCartItem = {
  rawProductId: string;
  productId: ObjectId;
  quantity: number;
  unitPrice: number;
  color?: string | null;
  size?: string | null;
  title?: string | null;
  image?: string | null;
};

type NormalizedCheckoutPayload = {
  items: NormalizedCartItem[];
  shippingOption: "FREE" | "EXPRESS";
  contactEmail: string;
  contactPhone: string | null;
  contactName: string | null;
  customerClerkId: string | null;
  customerEmail: string | null;
  customerName: string | null;
  shippingAddress: {
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone: string | null;
  };
  notes: string | null;
  metadata: {
    source: string | null;
    origin: string | null;
    generatedAt: number | null;
    [key: string]: unknown;
  };
  shippingAmount?: number | null;
  subtotalAmount?: number | null;
  totalAmount?: number | null;
};

type ProductDocument = {
  _id: ObjectId;
  title?: string;
  price?: unknown;
  countInStock?: unknown;
  media?: unknown;
  variants?: Array<{
    color?: unknown;
    size?: unknown;
    stock?: unknown;
  }>;
};

type OrderProductDocument = {
  _id: ObjectId;
  product: ObjectId;
  quantity: number;
  unitPrice: number;
  color?: string;
  size?: string;
  titleSnapshot?: string;
  imageSnapshot?: string | null;
};

type OrderDocument = {
  status: string;
  paypalStatus: string;
  contact: {
    email: string;
    phone?: string | null;
    name?: string | null;
  };
  metadata: Record<string, unknown>;
  fulfillmentStatus: string;
  customerClerkId?: string | null;
  customerEmail?: string | null;
  customerName?: string | null;
  shippingAddress: {
    firstName: string;
    lastName: string;
    street: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string | null;
  };
  shippingRate: string;
  shippingMethod: string;
  notes?: string | null;
  products: OrderProductDocument[];
  totalAmount: number;
  subtotalAmount: number;
  shippingAmount: number;
  amount?: number;
  totalPaid?: number;
  subtotal?: number;
  shippingFee?: number;
  createdAt: Date;
  updatedAt: Date;
};

const SHIPPING_METHOD_LABELS: Record<"FREE" | "EXPRESS", string> = {
  FREE: "FREE_DELIVERY",
  EXPRESS: "EXPRESS_DELIVERY",
};

const DEFAULT_METADATA_SOURCE = "storefront";

export async function persistCheckoutOrder(
  payload: unknown,
  adminResponse: unknown,
): Promise<void> {
  const normalized = normalizeCheckoutPayload(payload);
  if (!normalized) {
    return;
  }

  const adminOrderId = extractAdminOrderId(adminResponse);
  const db = await getAdminDb();
  const client = await getAdminMongoClient();

  const ordersCollection = db.collection<OrderDocument>("orders");
  const productsCollection = db.collection<ProductDocument>("products");

  const session = client.startSession();

  try {
    await session.withTransaction(async () => {
      const productIds = normalized.items.map((item) => item.productId);
      const uniqueProductIds = Array.from(
        new Set(productIds.map((id) => id.toHexString())),
      ).map((id) => new ObjectId(id));

      const productDocs = await productsCollection
        .find({ _id: { $in: uniqueProductIds } }, { session })
        .toArray();

      const productMap = new Map<string, ProductDocument>(
        productDocs.map((doc) => [doc._id.toHexString(), doc]),
      );

      const now = new Date();
      const orderProducts: OrderProductDocument[] = [];
      const dedupeItems: Array<{
        productId: string;
        color?: string;
        size?: string;
        unitPrice: number;
        quantity: number;
      }> = [];
      let subtotal = 0;

      for (const item of normalized.items) {
        const product = productMap.get(item.productId.toHexString());
        if (!product) {
          throw new Error(`Product ${item.rawProductId} not found in admin database.`);
        }

        const unitPrice = resolveUnitPrice(item.unitPrice, product.price);
        const variantMatch = resolveVariant(product, item.color, item.size);
        const availableStock = resolveAvailableStock(product, variantMatch);

        if (availableStock < item.quantity) {
          throw new Error(
            `Insufficient stock for product ${item.rawProductId}. Requested ${item.quantity}, available ${availableStock}`,
          );
        }

        subtotal += unitPrice * item.quantity;

        orderProducts.push({
          _id: new ObjectId(),
          product: product._id,
          quantity: item.quantity,
          unitPrice,
          color: variantMatch?.color ?? undefined,
          size: variantMatch?.size ?? undefined,
          titleSnapshot: coerceString(item.title) ?? coerceString(product.title) ?? undefined,
          imageSnapshot: coerceString(item.image) ?? resolvePrimaryImage(product),
        });

        dedupeItems.push({
          productId: product._id.toHexString(),
          color: variantMatch?.color ?? "",
          size: variantMatch?.size ?? "",
          unitPrice,
          quantity: item.quantity,
        });
      }

      subtotal = roundCurrency(subtotal);
      const fallbackShipping = normalized.shippingOption === "EXPRESS" ? 10 : 0;
      const shippingAmount = roundCurrency(
        normalized.shippingAmount !== null && normalized.shippingAmount !== undefined
          ? normalized.shippingAmount
          : fallbackShipping,
      );
      const total = roundCurrency(subtotal + shippingAmount);

      const idempotencyKey = buildIdempotencyKey({
        email: normalized.contactEmail,
        generatedAt: normalized.metadata.generatedAt,
        shippingOption: normalized.shippingOption,
        items: dedupeItems,
      });

      const duplicateFilters = [];
      if (adminOrderId) {
        duplicateFilters.push({ "metadata.adminOrderId": adminOrderId });
        duplicateFilters.push({ "metadata.paypalOrderId": adminOrderId });
      }
      if (idempotencyKey) {
        duplicateFilters.push({ "metadata.idempotencyKey": idempotencyKey });
      }
      if (normalized.metadata.generatedAt) {
        duplicateFilters.push({ "metadata.generatedAt": normalized.metadata.generatedAt });
      }

      if (duplicateFilters.length > 0) {
        const existing = await ordersCollection.findOne(
          { $or: duplicateFilters },
          { session, projection: { _id: 1 } },
        );
        if (existing) {
          return;
        }
      }

      for (const item of normalized.items) {
        const product = productMap.get(item.productId.toHexString());
        if (!product) continue;

        const variantMatch = resolveVariant(product, item.color, item.size);
        await decrementInventory({
          db,
          session,
          product,
          quantity: item.quantity,
          variant: variantMatch,
        });
      }

      const metadata: Record<string, unknown> = {
        source: normalized.metadata.source ?? DEFAULT_METADATA_SOURCE,
        origin: normalized.metadata.origin ?? null,
        generatedAt: normalized.metadata.generatedAt ?? Date.now(),
        checkout: {
          shippingOption: normalized.shippingOption,
          shippingAmount,
        },
      };

      if (adminOrderId) {
        metadata.adminOrderId = adminOrderId;
        metadata.paypalOrderId = adminOrderId;
      }
      if (idempotencyKey) metadata.idempotencyKey = idempotencyKey;

      const orderDoc: OrderDocument = {
        status: "PENDING",
        paypalStatus: adminOrderId ? "CREATED" : "PENDING",
        contact: {
          email: normalized.contactEmail,
          phone: normalized.contactPhone,
          name: normalized.contactName,
        },
        metadata,
        fulfillmentStatus: "PENDING",
        customerClerkId: normalized.customerClerkId,
        customerEmail: normalized.customerEmail,
        customerName: normalized.customerName,
        shippingAddress: {
          firstName: normalized.shippingAddress.firstName,
          lastName: normalized.shippingAddress.lastName,
          street: normalized.shippingAddress.address,
          city: normalized.shippingAddress.city,
          postalCode: normalized.shippingAddress.postalCode,
          country: normalized.shippingAddress.country,
          phone: normalized.shippingAddress.phone,
        },
        shippingRate: SHIPPING_METHOD_LABELS[normalized.shippingOption],
        shippingMethod: normalized.shippingOption,
        notes: normalized.notes,
        products: orderProducts,
        subtotalAmount: roundCurrency(subtotal),
        shippingAmount: roundCurrency(shippingAmount),
        totalAmount: roundCurrency(total),
        // Redundant aliases to align with admin UI expectations
        amount: roundCurrency(total),
        totalPaid: roundCurrency(total),
        subtotal: roundCurrency(subtotal),
        shippingFee: roundCurrency(shippingAmount),
        createdAt: now,
        updatedAt: now,
      };

      await ordersCollection.insertOne(orderDoc, { session });
    });
  } finally {
    await session.endSession();
  }
}

function normalizeCheckoutPayload(payload: unknown): NormalizedCheckoutPayload | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const source = payload as RawCheckoutPayload;

  const cartItems = resolveCartItems(source);
  if (cartItems.length === 0) {
    return null;
  }

  const contactEmail = coerceEmail(source.contact?.email);
  const shipping = coerceShippingAddress(source.shippingAddress);

  if (!contactEmail || !shipping) {
    return null;
  }

  const shippingOption = coerceShippingOption(source.shippingOption);
  const metadata = coerceMetadata(source.metadata);

  const customerClerkId = coerceString(source.customer?.clerkId);
  const customerEmail = coerceEmail(source.customer?.email);
  const customerName = coerceString(source.customer?.name);

  const contactPhone = coercePhone(source.contact?.phone);
  const explicitContactName = coerceString(source.customer?.name);
  const fallbackContactName = buildName(shipping.firstName, shipping.lastName);
  const shippingAmount = resolveShippingAmount(source, shippingOption);
  const subtotalAmount = coerceCurrency(
    (source as { subtotalAmount?: unknown; subtotal?: unknown }).subtotalAmount ??
      (source as { subtotal?: unknown }).subtotal ??
      null,
  );
  const totalAmount = coerceCurrency(
    (source as { totalAmount?: unknown; total?: unknown; amount?: unknown }).totalAmount ??
      (source as { total?: unknown }).total ??
      (source as { amount?: unknown }).amount ??
      null,
  );

  return {
    items: cartItems,
    shippingOption,
    contactEmail,
    contactPhone,
    contactName: explicitContactName ?? fallbackContactName,
    customerClerkId,
    customerEmail,
    customerName,
    shippingAddress: shipping,
    notes: coerceString(source.notes),
    metadata,
    shippingAmount,
    subtotalAmount,
    totalAmount,
  };
}

function resolveCartItems(source: RawCheckoutPayload): NormalizedCartItem[] {
  const candidateArrays: unknown[][] = [
    Array.isArray(source.lines) ? source.lines : null,
    Array.isArray(source.cartItems) ? source.cartItems : null,
    Array.isArray(source.items) ? source.items : null,
  ].filter((candidate): candidate is unknown[] => Array.isArray(candidate) && candidate.length > 0);

  const baseEntries: unknown[] = candidateArrays[0] ?? [];
  if (baseEntries.length === 0) {
    return [];
  }

  const merged = new Map<string, NormalizedCartItem>();

  for (const entry of baseEntries) {
    if (!entry || typeof entry !== "object") continue;
    const raw = entry as RawCartItem;
    const productId = coerceObjectId(raw.productId);
    const quantity = coercePositiveInteger(raw.quantity);
    if (!productId || quantity <= 0) continue;

    const line: NormalizedCartItem = {
      rawProductId: productId.toHexString(),
      productId,
      quantity,
      unitPrice: coerceNumber(raw.unitPrice),
      color: coerceString(raw.color),
      size: coerceString(raw.size),
      title: coerceString(raw.title),
      image: coerceString(raw.image),
    };

    const dedupeKey = [line.rawProductId, line.color ?? "", line.size ?? ""].join("|");

    const existing = merged.get(dedupeKey);
    if (existing) {
      existing.quantity += line.quantity;
      if ((!existing.unitPrice || existing.unitPrice <= 0) && line.unitPrice > 0) {
        existing.unitPrice = line.unitPrice;
      } else if (
        existing.unitPrice &&
        existing.unitPrice > 0 &&
        line.unitPrice > 0 &&
        existing.unitPrice !== line.unitPrice
      ) {
        // Preserve the highest price when discrepancies exist.
        existing.unitPrice = Math.max(existing.unitPrice, line.unitPrice);
      }
      if (!existing.title && line.title) {
        existing.title = line.title;
      }
      if (!existing.image && line.image) {
        existing.image = line.image;
      }
      continue;
    }

    merged.set(dedupeKey, line);
  }

  return Array.from(merged.values());
}

function resolveUnitPrice(preferred: number, fallback: unknown): number {
  if (Number.isFinite(preferred) && preferred > 0) {
    return Number(preferred);
  }

  const fallbackNumber = coerceNumber(fallback);
  if (Number.isFinite(fallbackNumber) && fallbackNumber > 0) {
    return Number(fallbackNumber);
  }

  return 0;
}

function resolveVariant(
  product: ProductDocument,
  color?: string | null,
  size?: string | null,
): { color: string; size: string; stock: number } | null {
  if (!Array.isArray(product.variants) || product.variants.length === 0) {
    return null;
  }

  const normalizedColor = color?.trim().toLowerCase() ?? null;
  const normalizedSize = size?.trim().toLowerCase() ?? null;

  const match = product.variants.find((variant) => {
    if (!variant) return false;
    const variantColor = coerceString(variant.color)?.toLowerCase() ?? null;
    const variantSize = coerceString(variant.size)?.toLowerCase() ?? null;
    return (
      (normalizedColor === null || variantColor === normalizedColor) &&
      (normalizedSize === null || variantSize === normalizedSize)
    );
  });

  if (!match) {
    if (normalizedColor === null && normalizedSize === null) {
      return null;
    }
    throw new Error("Selected product variant could not be resolved in admin inventory.");
  }

  return {
    color: coerceString(match.color) ?? "",
    size: coerceString(match.size) ?? "",
    stock: coercePositiveInteger(match.stock),
  };
}

function resolveAvailableStock(
  product: ProductDocument,
  variant: { stock: number } | null,
): number {
  if (variant) {
    return variant.stock;
  }

  return coercePositiveInteger(product.countInStock);
}

async function decrementInventory({
  db,
  session,
  product,
  quantity,
  variant,
}: {
  db: Db;
  session: ClientSession;
  product: ProductDocument;
  quantity: number;
  variant: { color: string; size: string } | null;
}): Promise<void> {
  const productsCollection = db.collection<ProductDocument>("products");

  const update: Record<string, unknown> = {};
  const inc: Record<string, number> = {};
  const set: Record<string, unknown> = { updatedAt: new Date() };

  if (typeof product.countInStock === "number") {
    inc.countInStock = -quantity;
  }

  if (variant) {
    inc["variants.$[variant].stock"] = -quantity;
  }

  if (Object.keys(inc).length > 0) {
    update.$inc = inc;
  }
  update.$set = set;

  const filter: Record<string, unknown> = { _id: product._id };
  const updateOptions: Record<string, unknown> = { session };

  if (variant) {
    updateOptions.arrayFilters = [
      {
        "variant.color": variant.color,
        "variant.size": variant.size,
      },
    ];
  }

  const result = await productsCollection.updateOne(filter, update, updateOptions);
  if (result.matchedCount === 0 || result.modifiedCount === 0) {
    throw new Error("Failed to update product inventory for checkout order.");
  }
}

function coerceShippingAddress(
  value: RawCheckoutPayload["shippingAddress"],
): NormalizedCheckoutPayload["shippingAddress"] | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  const address = value as RawCheckoutPayload["shippingAddress"];
  const firstName = coerceString(address?.firstName);
  const lastName = coerceString(address?.lastName);
  const street = coerceString(address?.address);
  const city = coerceString(address?.city);
  const postalCode = coerceString(address?.postalCode);
  const country = coerceString(address?.country);

  if (!firstName || !lastName || !street || !city || !postalCode || !country) {
    return null;
  }

  return {
    firstName,
    lastName,
    address: street,
    city,
    postalCode,
    country,
    phone: coercePhone(address?.phone),
  };
}

function coerceMetadata(
  metadata: RawCheckoutPayload["metadata"],
): NormalizedCheckoutPayload["metadata"] {
  if (!metadata || typeof metadata !== "object") {
    return {
      source: DEFAULT_METADATA_SOURCE,
      origin: null,
      generatedAt: null,
    };
  }

  const source = coerceString(metadata.source);
  const origin = coerceString(metadata.origin);
  const generatedAt = coerceTimestamp(metadata.generatedAt);

  return {
    ...metadata,
    source: source ?? DEFAULT_METADATA_SOURCE,
    origin: origin ?? null,
    generatedAt,
  };
}

function resolveShippingAmount(
  source: RawCheckoutPayload,
  shippingOption: "FREE" | "EXPRESS",
): number | null {
  const explicit = coerceCurrency(
    (source as { shippingAmount?: unknown; shippingFee?: unknown; shipping_cost?: unknown })
      .shippingAmount ??
      (source as { shippingFee?: unknown }).shippingFee ??
      (source as { shipping_cost?: unknown }).shipping_cost ??
      null,
  );

  if (explicit !== null && explicit >= 0) {
    return explicit;
  }

  return shippingOption === "EXPRESS" ? 10 : 0;
}

function coerceShippingOption(value: unknown): "FREE" | "EXPRESS" {
  const normalized = coerceString(value)?.toUpperCase();
  if (normalized === "EXPRESS") {
    return "EXPRESS";
  }
  return "FREE";
}

function coerceCurrency(value: unknown): number | null {
  const num = coerceNumber(value);
  if (!Number.isFinite(num)) {
    return null;
  }
  const rounded = roundCurrency(num);
  return rounded >= 0 ? rounded : null;
}

function roundCurrency(value: number): number {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function coerceString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (value instanceof ObjectId) {
    return value.toHexString();
  }
  if (typeof value === "number" || typeof value === "bigint") {
    return value.toString();
  }
  return null;
}

function coerceEmail(value: unknown): string | null {
  const str = coerceString(value);
  if (!str) return null;
  return str.toLowerCase();
}

function coercePhone(value: unknown): string | null {
  const str = coerceString(value);
  if (!str) return null;
  return str;
}

function coerceNumber(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "bigint") {
    return Number(value);
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  if (value && typeof value === "object") {
    const maybeToString = (value as { toString?: () => string }).toString;
    if (typeof maybeToString === "function" && maybeToString !== Object.prototype.toString) {
      try {
        const stringified = maybeToString.call(value);
        if (typeof stringified === "string") {
          const parsed = Number(stringified);
          if (Number.isFinite(parsed)) {
            return parsed;
          }
        }
      } catch {
        // fallback to zero
      }
    }
  }
  return 0;
}

function coercePositiveInteger(value: unknown): number {
  const num = coerceNumber(value);
  if (!Number.isFinite(num)) {
    return 0;
  }
  const integer = Math.max(0, Math.trunc(num));
  return integer;
}

function coerceObjectId(value: unknown): ObjectId | null {
  if (!value) return null;
  if (value instanceof ObjectId) return value;
  const str = coerceString(value);
  if (!str) return null;
  if (!ObjectId.isValid(str)) return null;
  return new ObjectId(str);
}

function coerceTimestamp(value: unknown): number | null {
  if (!value) return null;
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function buildName(firstName: string, lastName: string): string | null {
  const parts = [firstName, lastName]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));
  return parts.length > 0 ? parts.join(" ") : null;
}

function resolvePrimaryImage(product: ProductDocument): string | null {
  if (!Array.isArray(product.media)) {
    return null;
  }
  const first = product.media.find((entry) => typeof entry === "string" && entry.trim().length > 0);
  return first ?? null;
}

function extractAdminOrderId(adminResponse: unknown): string | null {
  if (!adminResponse || typeof adminResponse !== "object") {
    return null;
  }

  const record = adminResponse as Record<string, unknown>;
  const direct = coerceString(record.orderId);
  if (direct) return direct;

  const reference = coerceString(record.reference);
  if (reference) return reference;

  return null;
}

function buildIdempotencyKey({
  email,
  generatedAt,
  shippingOption,
  items,
}: {
  email: string;
  generatedAt: number | null;
  shippingOption: "FREE" | "EXPRESS";
  items: Array<{
    productId: string;
    color?: string;
    size?: string;
    unitPrice: number;
    quantity: number;
  }>;
}): string {
  const sortedItems = items
    .map((item) => ({
      ...item,
      color: item.color ?? "",
      size: item.size ?? "",
      unitPrice: roundCurrency(item.unitPrice),
    }))
    .sort((a, b) => a.productId.localeCompare(b.productId));

  const payload = JSON.stringify({
    email: email.toLowerCase(),
    generatedAt: generatedAt ?? null,
    shippingOption,
    items: sortedItems,
  });

  return createHash("sha256").update(payload).digest("hex");
}
