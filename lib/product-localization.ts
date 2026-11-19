import type { StoreLanguage } from "./store-language";
import type { CommerceInfo, Product } from "./types";

type ProductTextFields = Pick<
  Product,
  "title" | "titleFr" | "description" | "descriptionFr" | "category" | "categoryFr"
>;

/**
 * EN is the source language. Each French value is independently optional;
 * missing/empty translations fall back to the corresponding English value.
 */
export function getLocalizedProductText(
  product: ProductTextFields,
  field: "title" | "description" | "category",
  lang: StoreLanguage,
): string {
  const english = product[field] ?? "";
  if (lang !== "fr") return english;

  const frenchField = `${field}Fr` as "titleFr" | "descriptionFr" | "categoryFr";
  return product[frenchField]?.trim() || english;
}

export function getLocalizedCommerceInfo(
  product: Pick<Product, "commerceInfo" | "commerceInfoFr">,
  lang: StoreLanguage,
): CommerceInfo {
  const english = product.commerceInfo ?? {};
  if (lang !== "fr") return english;

  // A blank translation should not replace existing English copy.
  const translations = Object.fromEntries(
    Object.entries(product.commerceInfoFr ?? {}).filter(
      ([, value]) => typeof value === "string" && value.trim().length > 0,
    ),
  ) as Partial<CommerceInfo>;

  return { ...english, ...translations };
}
