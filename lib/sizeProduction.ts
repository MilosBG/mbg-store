/** Milos BG: optional handmade T-shirt sizes are ordered on request. */
export const STANDARD_TSHIRT_SIZES = ["S", "M", "L"] as const;
export const MAX_ON_REQUEST_QUANTITY = 10;

export type ProductionType = "STANDARD" | "ON_REQUEST";

type SizableProduct = {
  category?: string | null;
  sizes?: string[] | null;
};

/** Only T-shirts/Tops use the S/M/L handmade standard; bottoms keep stock logic. */
export function isMadeToOrderSize(product: SizableProduct, selectedSize?: string | null): boolean {
  const category = String(product.category ?? "").trim().toUpperCase();
  if (!["TOP", "TOPS", "T-SHIRT", "T-SHIRTS", "TEE", "TEES"].includes(category)) return false;
  const size = String(selectedSize ?? "").trim().toUpperCase();
  if (!size || STANDARD_TSHIRT_SIZES.includes(size as "S" | "M" | "L")) return false;
  // Merchant must explicitly publish this optional size in the product editor.
  // "OTHER" is an opt-in free-text size, stored as "OTHER: <requested size>".
  const configured = (product.sizes ?? []).map((option) => String(option).trim().toUpperCase());
  if (size.startsWith("OTHER:")) {
    const detail = size.slice(6).trim();
    return configured.includes("OTHER") && detail.length > 0 && detail.length <= 24 && /^[A-Z0-9 .+\-]+$/.test(detail);
  }
  return configured.includes(size);
}
