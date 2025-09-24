/* eslint-disable @typescript-eslint/no-unused-vars */
import { Product } from "./types";

const base = process.env.ADMIN_BASE_URL || process.env.NEXT_PUBLIC_ADMIN_API || process.env.NEXT_PUBLIC_API_URL;

function adminUrl(path: string) {
  if (!base) throw new Error("Missing ADMIN_BASE_URL (or NEXT_PUBLIC_ADMIN_API/NEXT_PUBLIC_API_URL) for admin calls");
  const b = String(base).trim().replace(/\/+$/, "");
  const root = /\/api$/i.test(b) ? b : `${b}/api`;
  const sep = path.startsWith("/") ? "" : "/";
  return `${root}${sep}${path}`;
}

export async function getProducts(
  { availableOnly = true, limit }: { availableOnly?: boolean; limit?: number } = {}
): Promise<Product[]> {
  const url = adminUrl(`products?availableOnly=${availableOnly ? "true" : "false"}`);
  const res = await fetch(url, {
    // Keep fresh results; admin will still call our webhook for instant UI revalidation
    cache: "no-store",
    next: { tags: ["products"] },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Admin products fetch failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as Product[];
  const filtered = (data || []).filter((p) => p?.fetchToStore === true);
  if (typeof limit === "number" && isFinite(limit) && limit > 0) return filtered.slice(0, limit);
  return filtered;
}

export async function getProductById(id: string): Promise<Product | null> {
  // On the client, use our proxy API to avoid CORS and leaking admin origin
  if (typeof window !== "undefined") {
    const res = await fetch(`/api/products/${encodeURIComponent(id)}`, {
      cache: "no-store",
      next: { tags: [`product:${id}`] },
    });
    if (res.status === 404) return null;
    if (!res.ok) {
      const _ = await res.text().catch(() => "");
      // Gracefully return null on failures when reading from wishlist
      return null;
    }
    const data = (await res.json()) as Product;
    if (!data?.fetchToStore) return null;
    return data;
  }

  const url = adminUrl(`products/${encodeURIComponent(id)}`);
  const res = await fetch(url, {
    cache: "no-store",
    next: { tags: [`product:${id}`] },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Admin product fetch failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as Product;
  if (!data?.fetchToStore) return null;
  return data;
}
