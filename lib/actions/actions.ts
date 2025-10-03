import "server-only";

import { getAdminDb } from "../adminDb";
import { getProductById, getProducts, getProductsByIds } from "../admin";
import type { Chapter, Product } from "../types";
import type { ObjectId } from "mongodb";

const ADMIN_API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");
const STOREFRONT_SERVICE_TOKEN =
  process.env.STOREFRONT_SERVICE_TOKEN || process.env.ADMIN_SERVICE_TOKEN;
const STOREFRONT_ORIGIN = normalizeOrigin(
  process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL,
);
const ORDERS_REVALIDATE_SECONDS = 20;

export { getProducts } from "../admin";

const MAX_SEARCH_RESULTS = 50;

type MongoModule = typeof import("mongodb");
let mongoModulePromise: Promise<MongoModule> | null = null;
async function loadMongoModule(): Promise<MongoModule> {
  if (!mongoModulePromise) {
    mongoModulePromise = import("mongodb");
  }
  return mongoModulePromise;
}

export const getChapters = async (): Promise<Chapter[]> => {
  const db = await getAdminDb();
  const chapters = await db
    .collection<ChapterDocument>("chapters")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return chapters.map((chapter) => serializeChapter(chapter));
};

export const getChapterDetails = async (chapterId: string): Promise<Chapter | null> => {
  const { ObjectId } = await loadMongoModule();
  if (!ObjectId.isValid(chapterId)) {
    return null;
  }

  const db = await getAdminDb();
  const mongoId = new ObjectId(chapterId);
  const chapter = await db.collection<ChapterDocument>("chapters").findOne({ _id: mongoId });
  if (!chapter) {
    return null;
  }

  const productIds = (chapter.products ?? [])
    .map((id) => (typeof id === "string" ? id : id.toHexString()))
    .filter(Boolean);
  const products = productIds.length ? await getProductsByIds(productIds) : [];

  return serializeChapter(chapter, products);
};

export const getProductDetails = async (productId: string) => {
  return getProductById(productId);
};

export const getSearchedProducts = async (query: string): Promise<Product[]> => {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }

  const products = await getProducts({ availableOnly: true });
  const matches = products.filter((product) => {
    const titleMatch = product.title?.toLowerCase().includes(normalized);
    const categoryMatch = product.category?.toLowerCase().includes(normalized);
    const tagMatch = product.tags?.some((tag) => tag.toLowerCase().includes(normalized));
    return Boolean(titleMatch || categoryMatch || tagMatch);
  });

  return matches.slice(0, MAX_SEARCH_RESULTS);
};

// The orders helpers still proxy to the admin app. Consider replacing them with
// direct database lookups if authenticated access is needed on the storefront.

// --------- Internal helpers ---------

type ChapterDocument = {
  _id: ObjectId;
  title: string;
  description?: string;
  image: string;
  products?: Array<ObjectId | string>;
  createdAt?: Date;
  updatedAt?: Date;
};

function serializeChapter(doc: ChapterDocument, products?: Product[]): Chapter {
  return {
    _id: doc._id.toHexString(),
    title: doc.title,
    description: doc.description ?? undefined,
    image: doc.image,
    products,
  };
}


// Temporary storefront order types while real order APIs are wired up.
export type StorefrontOrderProduct = {
  _id?: string;
  quantity: number;
  color?: string;
  size?: string;
  product?: {
    _id?: string;
    title?: string;
    price?: number;
    media?: string[];
  };
};

export type StorefrontOrder = {
  _id: string;
  totalAmount: number;
  fulfillmentStatus?: string;
  products?: StorefrontOrderProduct[];
  processingAt?: string;
  shippedAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  shippingMethod?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  placedAt?: string;
  customerClerkId?: string;
};

export const getOrders = async (customerId: string): Promise<StorefrontOrder[]> => {
  if (!customerId) {
    return [];
  }

  if (!ADMIN_API_BASE) {
    throw createOrdersError(
      "Customer orders endpoint is not configured.",
      500,
    );
  }

  const headers = buildOrdersHeaders();
  const endpoint = `${ADMIN_API_BASE}/orders/customers/${encodeURIComponent(customerId)}`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      headers,
      next: { revalidate: ORDERS_REVALIDATE_SECONDS },
    });
  } catch (error) {
    throw createOrdersError(
      "Failed to reach the customer orders service.",
      undefined,
      error,
    );
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  const rawBody = await response.text();
  const parseBody = (): unknown => {
    if (!rawBody) return [];
    try {
      return JSON.parse(rawBody);
    } catch {
      throw createOrdersError(
        "Unable to parse customer orders response.",
        502,
        { raw: rawBody },
      );
    }
  };

  if (response.status === 401) {
    throw createOrdersError(
      "Customer orders request unauthorized.",
      401,
      rawBody ? safeParse(rawBody) : undefined,
    );
  }

  if (!response.ok) {
    throw createOrdersError(
      "Customer orders request failed.",
      response.status,
      rawBody ? safeParse(rawBody) : undefined,
    );
  }

  if (!contentType.includes("application/json")) {
    throw createOrdersError(
      "Unexpected customer orders response format.",
      502,
      rawBody,
    );
  }

  const payload = parseBody();
  if (!Array.isArray(payload)) {
    throw createOrdersError(
      "Customer orders payload is not an array.",
      502,
      payload,
    );
  }

  return payload
    .map(normalizeOrder)
    .filter((order) => Boolean(order._id));
};

export const getOrderDetails = async (
  orderId: string,
  options?: { customerId?: string },
): Promise<StorefrontOrder | null> => {
  if (!orderId) {
    return null;
  }

  if (!ADMIN_API_BASE) {
    throw createOrdersError(
      "Order details endpoint is not configured.",
      500,
    );
  }

  const headers = buildOrdersHeaders();
  const endpoint = `${ADMIN_API_BASE}/orders/${encodeURIComponent(orderId)}`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      headers,
      next: { revalidate: ORDERS_REVALIDATE_SECONDS },
    });
  } catch (error) {
    throw createOrdersError(
      "Failed to reach the order details service.",
      undefined,
      error,
    );
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() ?? "";
  const rawBody = await response.text();

  if (response.status === 404) {
    return null;
  }

  if (response.status === 401) {
    throw createOrdersError(
      "Order details request unauthorized.",
      401,
      rawBody ? safeParse(rawBody) : undefined,
    );
  }

  if (!response.ok) {
    throw createOrdersError(
      "Order details request failed.",
      response.status,
      rawBody ? safeParse(rawBody) : undefined,
    );
  }

  if (!contentType.includes("application/json")) {
    throw createOrdersError(
      "Unexpected order details response format.",
      502,
      rawBody,
    );
  }

  let payload: unknown;
  try {
    payload = rawBody ? JSON.parse(rawBody) : null;
  } catch {
    throw createOrdersError(
      "Unable to parse order details response.",
      502,
      { raw: rawBody },
    );
  }

  const container = (payload as { orderDetails?: unknown; order?: unknown }) || {};
  const orderPayload = container.orderDetails ?? container.order ?? payload;

  const normalized = orderPayload ? normalizeOrder(orderPayload) : null;

  if (!normalized || !normalized._id) {
    return null;
  }

  if (
    options?.customerId &&
    normalized.customerClerkId &&
    normalized.customerClerkId !== options.customerId
  ) {
    return null;
  }

  return normalized;
};

interface OrdersApiError extends Error {
  status?: number;
  details?: unknown;
}

function createOrdersError(
  message: string,
  status?: number,
  details?: unknown,
): OrdersApiError {
  const error = new Error(message) as OrdersApiError;
  error.status = status;
  error.details = details;
  return error;
}

function safeParse(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text };
  }
}

type AdminOrderPayload = {
  [key: string]: unknown;
  products?: unknown;
};

type AdminOrderProductPayload = {
  [key: string]: unknown;
  product?: unknown;
};

function normalizeOrder(entry: unknown): StorefrontOrder {
  const source: AdminOrderPayload =
    typeof entry === "object" && entry !== null ? (entry as AdminOrderPayload) : {};

  const products = Array.isArray(source.products)
    ? source.products
        .map((item) => normalizeOrderProduct(item))
        .filter((item: StorefrontOrderProduct) => item.quantity > 0)
    : undefined;

  const fulfillmentStatus =
    typeof source.fulfillmentStatus === "string"
      ? source.fulfillmentStatus
      : typeof source.status === "string"
      ? source.status
      : undefined;

  const totalAmountSource =
    source.totalAmount ?? source.amount ?? source.total ?? 0;

  const processingAtSource =
    (source.processingAt ?? source.placedAt ?? source.createdAt) as unknown;
  const shippedAtSource = (source.shippedAt ?? (source as { shipped_at?: unknown }).shipped_at) as unknown;
  const deliveredAtSource = (source.deliveredAt ?? (source as { delivered_at?: unknown }).delivered_at) as unknown;
  const completedAtSource = (source.completedAt ?? (source as { completed_at?: unknown }).completed_at) as unknown;
  const cancelledAtSource = (source.cancelledAt ?? (source as { cancelled_at?: unknown }).cancelled_at) as unknown;
  const placedAtSource = (source.placedAt ?? source.createdAt) as unknown;

  const customerClerkId = toStringSafe(
    (source.customerClerkId ??
      (source as { customerClerk?: unknown }).customerClerk ??
      source.customerId ??
      source.customer_id ??
      (source as { customer?: unknown }).customer) as unknown,
  );

  const order: StorefrontOrder = {
    _id: toStringSafe(source._id) ?? toStringSafe(source.id) ?? "",
    totalAmount: numberFromUnknown(totalAmountSource),
    fulfillmentStatus,
    products,
    processingAt: toIsoString(processingAtSource),
    shippedAt: toIsoString(shippedAtSource),
    deliveredAt: toIsoString(deliveredAtSource),
    completedAt: toIsoString(completedAtSource),
    cancelledAt: toIsoString(cancelledAtSource),
    shippingMethod: toStringSafe(source.shippingMethod),
    trackingNumber: toStringSafe(source.trackingNumber),
    trackingUrl: toStringSafe(source.trackingUrl),
    placedAt: toIsoString(placedAtSource),
    customerClerkId,
  };

  return order;
}

function normalizeOrderProduct(entry: unknown): StorefrontOrderProduct {
  const source: AdminOrderProductPayload =
    typeof entry === "object" && entry !== null
      ? (entry as AdminOrderProductPayload)
      : {};

  const productSource =
    typeof source.product === "object" && source.product !== null
      ? (source.product as { [key: string]: unknown })
      : undefined;

  const productMedia = Array.isArray(productSource?.media)
    ? productSource?.media.filter((item: unknown): item is string => typeof item === "string")
    : undefined;

  return {
    _id: toStringSafe(source._id),
    quantity: numberFromUnknown(source.quantity),
    color: toStringSafe(source.color),
    size: toStringSafe(source.size),
    product: productSource
      ? {
          _id: toStringSafe(productSource._id),
          title: toStringSafe(productSource.title),
          price:
            productSource.price === undefined
              ? undefined
              : numberFromUnknown(productSource.price),
          media: productMedia,
        }
      : undefined,
  };
}

function toIsoString(value: unknown): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  return undefined;
}

function toStringSafe(value: unknown): string | undefined {
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "bigint") {
    return value.toString();
  }
  return undefined;
}

function numberFromUnknown(value: unknown): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function normalizeOrigin(value: string | undefined): string | undefined {
  if (!value) {
    return undefined;
  }
  if (/^https?:\/\//i.test(value)) {
    return value;
  }
  if (!value.includes(":") && !value.startsWith("//")) {
    return `https://${value}`;
  }
  if (value.startsWith("//")) {
    return `https:${value}`;
  }
  return undefined;
}



function buildOrdersHeaders(forceToken = false): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/json",
  };

  const token = STOREFRONT_SERVICE_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else if (forceToken || Boolean(ADMIN_API_BASE)) {
    throw createOrdersError(
      "STOREFRONT service token is missing.",
      500,
    );
  }

  if (STOREFRONT_ORIGIN) {
    headers.Origin = STOREFRONT_ORIGIN;
  }

  return headers;
}


