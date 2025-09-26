import "server-only";

import { getAdminDb } from "./adminDb";
import type { Product } from "./types";
import type { ObjectId } from "mongodb";

type ProductDocument = {
  _id: ObjectId | { toHexString?: () => string } | string;
  title: string;
  description?: string;
  media?: string[];
  category?: string;
  chapters?: Array<ObjectId | string>;
  tags?: string[];
  price?: unknown;
  expense?: unknown;
  sizes?: string[];
  colors?: string[];
  variants?: Array<{ color?: string; size?: string; stock?: unknown }>;
  countInStock?: unknown;
  fetchToStore?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
};

type MongoModule = typeof import("mongodb");

let mongoModulePromise: Promise<MongoModule> | null = null;
async function loadMongoModule(): Promise<MongoModule> {
  if (!mongoModulePromise) {
    mongoModulePromise = import("mongodb");
  }
  return mongoModulePromise;
}

function toFiniteNumber(value: unknown): number | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : undefined;
  }
  const parsed = Number(
    typeof value === "string" ? value : String((value as { toString?: () => string }).toString?.() ?? value),
  );
  return Number.isFinite(parsed) ? parsed : undefined;
}

function toFiniteInteger(value: unknown): number | undefined {
  const numeric = toFiniteNumber(value);
  return numeric === undefined ? undefined : Math.trunc(numeric);
}

function ensureStringId(value: ObjectId | string | { toHexString?: () => string } | undefined): string | undefined {
  if (!value) return undefined;
  if (typeof value === "string") return value;
  const maybeToHex = (value as { toHexString?: () => string }).toHexString;
  if (typeof maybeToHex === "function") {
    try {
      return maybeToHex.call(value);
    } catch {
      // fall through to string coercion
    }
  }
  const stringified = String(value);
  return stringified && stringified !== "[object Object]" ? stringified : undefined;
}

function serializeProduct(doc: ProductDocument): Product {
  const productId = ensureStringId(doc._id) ?? String(doc._id);

  return {
    _id: productId,
    title: doc.title,
    description: typeof doc.description === "string" ? doc.description : undefined,
    media: doc.media ?? undefined,
    category: doc.category ?? undefined,
    chapters: doc.chapters
      ?.map((id) => ensureStringId(id))
      .filter((id): id is string => Boolean(id)),
    tags: doc.tags ?? undefined,
    price: toFiniteNumber(doc.price),
    cost: toFiniteNumber(doc.expense),
    sizes: doc.sizes ?? undefined,
    colors: doc.colors ?? undefined,
    variants: doc.variants?.map((variant) => ({
      color: variant.color,
      size: variant.size,
      stock: toFiniteInteger(variant.stock) ?? 0,
    })),
    countInStock: toFiniteInteger(doc.countInStock),
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : typeof doc.createdAt === "string"
        ? doc.createdAt
        : undefined,
    updatedAt:
      doc.updatedAt instanceof Date
        ? doc.updatedAt.toISOString()
        : typeof doc.updatedAt === "string"
        ? doc.updatedAt
        : undefined,
    fetchToStore: doc.fetchToStore ?? false,
  };
}

export async function getProducts(
  { availableOnly = true, limit }: { availableOnly?: boolean; limit?: number } = {},
): Promise<Product[]> {
  const db = await getAdminDb();
  const filter: Record<string, unknown> = {};
  if (availableOnly) {
    filter.fetchToStore = true;
  }

  const cursor = db
    .collection<ProductDocument>("products")
    .find(filter)
    .sort({ createdAt: -1 });

  if (typeof limit === "number" && Number.isFinite(limit) && limit > 0) {
    cursor.limit(Math.trunc(limit));
  }

  const docs = await cursor.toArray();
  return docs.map(serializeProduct);
}

export async function getProductsByIds(
  ids: string[],
  { includeHidden = false }: { includeHidden?: boolean } = {},
): Promise<Product[]> {
  const { ObjectId } = await loadMongoModule();
  const validIds = ids.filter((id) => ObjectId.isValid(id));
  if (validIds.length === 0) {
    return [];
  }

  const db = await getAdminDb();
  const mongoIds = validIds.map((id) => new ObjectId(id));
  const filter: Record<string, unknown> = { _id: { $in: mongoIds } };
  if (!includeHidden) {
    filter.fetchToStore = true;
  }

  const docs = await db.collection<ProductDocument>("products").find(filter).toArray();
  const order = new Map(validIds.map((id, index) => [id, index]));
  return docs
    .map(serializeProduct)
    .sort((a, b) => (order.get(a._id) ?? 0) - (order.get(b._id) ?? 0));
}

export async function getProductById(id: string): Promise<Product | null> {
  const { ObjectId } = await loadMongoModule();
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const [product] = await getProductsByIds([id]);
  return product ?? null;
}
