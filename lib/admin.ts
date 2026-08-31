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

  return numeric === undefined
    ? undefined
    : Math.trunc(numeric);
}

function toOptionalString(value: unknown): string | undefined {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();

  return trimmed.length > 0
    ? trimmed
    : undefined;
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

  return stringified &&
    stringified !== "[object Object]"
    ? stringified
    : undefined;
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
  const hasContent = Object.values(commerceInfo).some(
    (item) => {
      if (typeof item === "number") {
        return Number.isFinite(item) && item > 0;
      }

      return (
        typeof item === "string" &&
        item.trim().length > 0
      );
    },
  );

  return hasContent
    ? commerceInfo
    : undefined;
}

function serializeProduct(
  doc: ProductDocument,
): Product {
  const productId =
    ensureStringId(doc._id) ?? String(doc._id);

  return {
    _id: productId,

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

    /*
     * NEW:
     * Sends all commercial/product information
     * from MongoDB to the storefront.
     */
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
   * Your original behaviour is preserved:
   * when availableOnly is true, only products
   * explicitly available to mbg-store are returned.
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
   * Preserve your existing option:
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
   * including commerceInfo.
   */
  const [product] =
    await getProductsByIds([
      id,
    ]);

  return product ?? null;
}