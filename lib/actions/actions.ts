import "server-only";

import { getAdminDb } from "../adminDb";
import { getProductById, getProducts, getProductsByIds } from "../admin";
import type { Chapter, Product } from "../types";
import type { ObjectId } from "mongodb";

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

export const getOrders = async (_customerId: string): Promise<any[]> => {
  return [];
};

export const getOrderDetails = async (_orderId: string): Promise<any | null> => {
  return null;
};
