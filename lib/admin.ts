import "server-only";

import { getAdminDb } from "./adminDb";
import type { CommerceInfo, Product } from "./types";
import type { ObjectId } from "mongodb";

type CommerceInfoDocument = {
  productReference?: unknown;
  productDetails?: unknown;

  materialComposition?: unknown;
  fabricName?: unknown;
  fabricWeight?: unknown;
  fabricDescription?: unknown;

  fit?: unknown;
  fitNotes?: unknown;

  careInstructions?: unknown;

  countryOfManufacture?: unknown;
  fabricOrigin?: unknown;
  craftsmanship?: unknown;

  certificationName?: unknown;
  certificationScope?: unknown;
  certificateNumber?: unknown;
  certificationInstitute?: unknown;
  certificateUrl?: unknown;

  manufacturerName?: unknown;
  manufacturerAddress?: unknown;
  manufacturerEmail?: unknown;

  shippingProcessingTime?: unknown;
  deliveryEstimate?: unknown;
  withdrawalDays?: unknown;
  returnCostBearer?: unknown;

  safetyWarnings?: unknown;
};

type ProductDocument = {
  _id: ObjectId;

  /**
   * Public URL identifier.
   * Optional in MongoDB so existing products continue to work.
   * When absent, the storefront generates it from the title.
   */
  slug?: string;

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

  variants?: Array<{
    color?: string;
    size?: string;
    stock?: unknown;
  }>;

  countInStock?: unknown;

  fetchToStore?: boolean;

  commerceInfo?: CommerceInfoDocument;

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
    typeof value === "string"
      ? value
      : String(
          (
            value as {
              toString?: () => string;
            }
          ).toString?.() ?? value,
        ),
  );

  return Number.isFinite(parsed) ? parsed : undefined;
}

function toFiniteInteger(value: unknown): number | undefined {
  const numeric = toFiniteNumber(value);

  return numeric === undefined ? undefined : Math.trunc(numeric);
}

function toOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0 ? trimmed : undefined;
}

function ensureStringId(
  value:
    | ObjectId
    | string
    | {
        toHexString?: () => string;
      }
    | undefined,
): string | undefined {
  if (!value) {
    return undefined;
  }

  if (typeof value === "string") {
    return value;
  }

  const maybeToHex = (
    value as {
      toHexString?: () => string;
    }
  ).toHexString;

  if (typeof maybeToHex === "function") {
    try {
      return maybeToHex.call(value);
    } catch {
      // Fall through to string coercion.
    }
  }

  const stringified = String(value);

  return stringified && stringified !== "[object Object]"
    ? stringified
    : undefined;
}

/**
 * Converts a product title into a URL-safe slug.
 *
 * Examples:
 * "GRIND T"  -> "grind-t"
 * "GRIND SL" -> "grind-sl"
 * "GRIND HD" -> "grind-hd"
 */
function createProductSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function serializeCommerceInfo(
  value: CommerceInfoDocument | undefined,
): CommerceInfo | undefined {
  if (!value) {
    return undefined;
  }

  const commerceInfo: CommerceInfo = {
    productReference:
      toOptionalString(value.productReference),

    productDetails:
      toOptionalString(value.productDetails),

    materialComposition:
      toOptionalString(value.materialComposition),

    fabricName:
      toOptionalString(value.fabricName),

    fabricWeight:
      toFiniteNumber(value.fabricWeight),

    fabricDescription:
      toOptionalString(value.fabricDescription),

    fit:
      toOptionalString(value.fit),

    fitNotes:
      toOptionalString(value.fitNotes),

    careInstructions:
      toOptionalString(value.careInstructions),

    countryOfManufacture:
      toOptionalString(value.countryOfManufacture),

    fabricOrigin:
      toOptionalString(value.fabricOrigin),

    craftsmanship:
      toOptionalString(value.craftsmanship),

    certificationName:
      toOptionalString(value.certificationName),

    certificationScope:
      toOptionalString(value.certificationScope),

    certificateNumber:
      toOptionalString(value.certificateNumber),

    certificationInstitute:
      toOptionalString(value.certificationInstitute),

    certificateUrl:
      toOptionalString(value.certificateUrl),

    manufacturerName:
      toOptionalString(value.manufacturerName),

    manufacturerAddress:
      toOptionalString(value.manufacturerAddress),

    manufacturerEmail:
      toOptionalString(value.manufacturerEmail),

    shippingProcessingTime:
      toOptionalString(value.shippingProcessingTime),

    deliveryEstimate:
      toOptionalString(value.deliveryEstimate),

    withdrawalDays:
      toFiniteInteger(value.withdrawalDays),

    returnCostBearer:
      toOptionalString(value.returnCostBearer),

    safetyWarnings:
      toOptionalString(value.safetyWarnings),
  };

  /*
   * Do not send an entirely empty commerceInfo object to the UI.
   * ProductAccordion will therefore remain hidden until at least
   * one useful commercial field has actually been entered.
   */
  const hasContent = Object.values(commerceInfo).some((item) => {
    if (typeof item === "number") {
      return Number.isFinite(item) && item > 0;
    }

    return (
      typeof item === "string" &&
      item.trim().length > 0
    );
  });

  return hasContent ? commerceInfo : undefined;
}

function serializeProduct(
  doc: ProductDocument,
): Product {
  const productId =
    ensureStringId(doc._id) ?? String(doc._id);

  return {
    _id: productId,

    /**
     * A slug stored in MongoDB has priority.
     * Existing products without a slug remain compatible because
     * one is generated automatically from the product title.
     */
    slug:
      toOptionalString(doc.slug) ??
      createProductSlug(doc.title),

    title: doc.title,

    description:
      typeof doc.description === "string"
        ? doc.description
        : undefined,

    media: doc.media ?? undefined,

    category:
      doc.category ?? undefined,

    chapters: doc.chapters
      ?.map((id) => ensureStringId(id))
      .filter(
        (id): id is string =>
          Boolean(id),
      ),

    tags: doc.tags ?? undefined,

    price:
      toFiniteNumber(doc.price),

    cost:
      toFiniteNumber(doc.expense),

    sizes:
      doc.sizes ?? undefined,

    colors:
      doc.colors ?? undefined,

    variants: doc.variants?.map(
      (variant) => ({
        color: variant.color,
        size: variant.size,
        stock:
          toFiniteInteger(
            variant.stock,
          ) ?? 0,
      }),
    ),

    countInStock:
      toFiniteInteger(
        doc.countInStock,
      ),

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

    fetchToStore:
      doc.fetchToStore ?? false,

    commerceInfo:
      serializeCommerceInfo(
        doc.commerceInfo,
      ),
  };
}

export async function getProducts(
  {
    availableOnly = true,
    limit,
  }: {
    availableOnly?: boolean;
    limit?: number;
  } = {},
): Promise<Product[]> {
  const db = await getAdminDb();

  const filter: Record<string, unknown> = {};

  /*
   * Preserve the existing storefront behaviour:
   * when availableOnly is true, only products explicitly
   * available to mbg-store are returned.
   */
  if (availableOnly) {
    filter.fetchToStore = true;
  }

  const cursor = db
    .collection<ProductDocument>(
      "products",
    )
    .find(filter)
    .sort({
      createdAt: -1,
    });

  if (
    typeof limit === "number" &&
    Number.isFinite(limit) &&
    limit > 0
  ) {
    cursor.limit(
      Math.trunc(limit),
    );
  }

  const docs =
    await cursor.toArray();

  return docs.map(
    serializeProduct,
  );
}

export async function getProductsByIds(
  ids: string[],
  {
    includeHidden = false,
  }: {
    includeHidden?: boolean;
  } = {},
): Promise<Product[]> {
  const { ObjectId } =
    await loadMongoModule();

  const validIds = ids.filter(
    (id) =>
      ObjectId.isValid(id),
  );

  if (validIds.length === 0) {
    return [];
  }

  const db =
    await getAdminDb();

  const mongoIds =
    validIds.map(
      (id) =>
        new ObjectId(id),
    );

  const filter: Record<string, unknown> = {
    _id: {
      $in: mongoIds,
    },
  };

  /*
   * Preserve the existing option:
   * hidden products may only be retrieved
   * when includeHidden === true.
   */
  if (!includeHidden) {
    filter.fetchToStore = true;
  }

  const docs = await db
    .collection<ProductDocument>(
      "products",
    )
    .find(filter)
    .toArray();

  const order = new Map(
    validIds.map(
      (id, index) => [
        id,
        index,
      ],
    ),
  );

  return docs
    .map(serializeProduct)
    .sort(
      (a, b) =>
        (order.get(a._id) ?? 0) -
        (order.get(b._id) ?? 0),
    );
}

/**
 * Retrieves a storefront product using either:
 *
 * - its new public slug:
 *   /products/grind-t
 *
 * - or its old MongoDB ObjectId:
 *   /products/68...
 *
 * This keeps old links compatible while allowing clean public URLs.
 */
export async function getProductBySlugOrId(
  slugOrId: string,
): Promise<Product | null> {
  const value = slugOrId.trim();

  if (!value) {
    return null;
  }

  const normalizedValue =
    value.toLowerCase();

  const { ObjectId } =
    await loadMongoModule();

  const db =
    await getAdminDb();

  const collection =
    db.collection<ProductDocument>(
      "products",
    );

  let product:
    | ProductDocument
    | null = null;

  /*
   * 1. Backward compatibility with old MongoDB-ID URLs.
   */
  if (ObjectId.isValid(value)) {
    product = await collection.findOne({
      _id: new ObjectId(value),
      fetchToStore: true,
    });
  }

  /*
   * 2. Preferred lookup using a slug stored in MongoDB.
   */
  if (!product) {
    product = await collection.findOne({
      slug: normalizedValue,
      fetchToStore: true,
    });
  }

  /*
   * 3. Compatibility for existing products that do not yet have
   *    a `slug` field in MongoDB.
   *
   *    Their public slug is derived from the title, exactly like
   *    serializeProduct().
   */
  if (!product) {
    const availableProducts =
      await collection
        .find({
          fetchToStore: true,
        })
        .toArray();

    product =
      availableProducts.find(
        (item) =>
          createProductSlug(
            item.title,
          ) === normalizedValue,
      ) ?? null;
  }

  if (!product) {
    return null;
  }

  return serializeProduct(product);
}

export async function getProductById(
  id: string,
): Promise<Product | null> {
  const { ObjectId } =
    await loadMongoModule();

  if (!ObjectId.isValid(id)) {
    return null;
  }

  /*
   * This deliberately uses getProductsByIds,
   * so the same serialization is used everywhere,
   * including slug and commerceInfo.
   */
  const [product] =
    await getProductsByIds([
      id,
    ]);

  return product ?? null;
}
