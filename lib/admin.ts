import { Decimal128, ObjectId } from "mongodb";

import { getAdminDb } from "./adminDb";
import type { Product } from "./types";

type ProductDocument = {
  _id: ObjectId;
  title: string;
  description?: string;
  media?: string[];
  category?: string;
  chapters?: Array<ObjectId | string>;
  tags?: string[];
  price?: Decimal128 | number | string;
  expense?: Decimal128 | number | string;
  sizes?: string[];
  colors?: string[];
  variants?: Array<{ color?: string; size?: string; stock?: number | string }>;
  countInStock?: number;
  fetchToStore?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
};

function decimalToNumber(value?: Decimal128 | number | string | null): number | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
  const str = value instanceof Decimal128 ? value.toString() : String(value);
  const numeric = Number(str);
  return Number.isFinite(numeric) ? numeric : undefined;
}

function ensureStringId(value: ObjectId | string | undefined): string | undefined {
  if (!value) return undefined;
  return typeof value === "string" ? value : value.toHexString();
}

function serializeProduct(doc: ProductDocument): Product {
  return {
    _id: doc._id.toHexString(),
    title: doc.title,
    description: doc.description ?? undefined,
    media: doc.media ?? undefined,
    category: doc.category ?? undefined,
    chapters: doc.chapters?.map((id) => ensureStringId(id)).filter(Boolean) as string[] | undefined,
    tags: doc.tags ?? undefined,
    price: decimalToNumber(doc.price),
    cost: decimalToNumber(doc.expense),
    sizes: doc.sizes ?? undefined,
    colors: doc.colors ?? undefined,
    variants: doc.variants?.map((variant) => ({
      color: variant.color,
      size: variant.size,
      stock: typeof variant.stock === "number" ? variant.stock : Number(variant.stock ?? 0),
    })),
    countInStock: typeof doc.countInStock === "number" ? doc.countInStock : undefined,
    createdAt: doc.createdAt ? doc.createdAt.toISOString() : undefined,
    updatedAt: doc.updatedAt ? doc.updatedAt.toISOString() : undefined,
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
  if (!ObjectId.isValid(id)) {
    return null;
  }

  const [product] = await getProductsByIds([id]);
  return product ?? null;
}
