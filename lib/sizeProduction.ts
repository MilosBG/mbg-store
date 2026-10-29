/** Milos BG — artisan T-shirt sizing and server-side order validation. */
export const STANDARD_TSHIRT_SIZES = ["S", "M", "L"] as const;
export const DEFAULT_ON_REQUEST_SIZES = ["XS", "XL", "2XL", "3XL", "OTHER"] as const;
export const MAX_ON_REQUEST_QUANTITY = 10;

export type ProductionType = "STANDARD" | "ON_REQUEST";

type SizableProduct = {
  category?: string | null;
  sizes?: string[] | null;
};

const TOP_CATEGORIES = ["TOP", "TOPS", "T-SHIRT", "T-SHIRTS", "TEE", "TEES"];
const normalize = (value?: string | null) => String(value ?? "").trim().toUpperCase();

/** Optional sizes are available by default for artisan Tops, even when SIZES is S/M/L. */
export function supportsArtisanSizes(product: SizableProduct): boolean {
  return TOP_CATEGORIES.includes(normalize(product.category));
}

/** Additional options from MBG ADMIN are included alongside the built-in suggestions. */
export function getOnRequestSizeOptions(product: SizableProduct): string[] {
  if (!supportsArtisanSizes(product)) return [];
  const extras = (product.sizes ?? [])
    .map((size) => normalize(size))
    .filter((size) => size && !STANDARD_TSHIRT_SIZES.some((standard) => standard === size));
  return [...new Set([...DEFAULT_ON_REQUEST_SIZES, ...extras])];
}

/** Works with the UI's OTHER placeholder and the order's OTHER: 4XL snapshot. */
export function isMadeToOrderSize(product: SizableProduct, selectedSize?: string | null): boolean {
  if (!supportsArtisanSizes(product)) return false;
  const size = normalize(selectedSize);
  if (!size || STANDARD_TSHIRT_SIZES.some((standard) => standard === size)) return false;
  if (size.startsWith("OTHER:")) {
    const detail = size.slice("OTHER:".length).trim();
    return detail.length > 0 && detail.length <= 24 && /^[A-Z0-9 .+\-]+$/.test(detail);
  }
  return getOnRequestSizeOptions(product).includes(size);
}

/** Validate a persisted order line, not only a visible selector option. */
export function isOfferedProductSize(product: SizableProduct, selectedSize?: string | null): boolean {
  const size = normalize(selectedSize);
  if (!size || size === "OTHER") return false;
  if (isMadeToOrderSize(product, size)) return true;
  if (size.startsWith("OTHER:")) return false; // Invalid custom syntax / non-Top product.
  return (product.sizes ?? []).some((option) => normalize(option) === size);
}
