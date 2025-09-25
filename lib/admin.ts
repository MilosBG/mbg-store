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
    cache: "no-store",
    headers: { Accept: "application/json" },
    next: { tags: ["products"] },
  });
  const raw = await res.text().catch(() => "");
  if (!res.ok) {
    console.error(`Admin products fetch failed: ${res.status} ${raw}`);
    return [];
  }
  const contentType = res.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("application/json")) {
    console.error(
      `Admin products fetch returned non-JSON (content-type: ${contentType || "unknown"}). Snippet: ${raw.slice(0, 200)}`
    );
    return [];
  }
  let data: Product[] = [];
  try {
    data = JSON.parse(raw) as Product[];
  } catch (error) {
    console.error(`Admin products JSON parse failed: ${String(error)}. Snippet: ${raw.slice(0, 200)}`);
    return [];
  }
  const filtered = (data || []).filter((p) => p?.fetchToStore === true);
  if (typeof limit === "number" && isFinite(limit) && limit > 0) {
    return filtered.slice(0, limit);
  }
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
    headers: { Accept: "application/json" },
    next: { tags: [`product:${id}`] },
  });
  const raw = await res.text().catch(() => "");
  if (res.status === 404) return null;
  if (!res.ok) {
    console.error(`Admin product fetch failed: ${res.status} ${raw}`);
    return null;
  }
  const contentType = res.headers.get("content-type")?.toLowerCase() ?? "";
  if (!contentType.includes("application/json")) {
    console.error(
      `Admin product fetch returned non-JSON (content-type: ${contentType || "unknown"}). Snippet: ${raw.slice(0, 200)}`
    );
    return null;
  }
  let data: Product;
  try {
    data = JSON.parse(raw) as Product;
  } catch (error) {
    console.error(`Admin product JSON parse failed: ${String(error)}. Snippet: ${raw.slice(0, 200)}`);
    return null;
  }
  if (!data?.fetchToStore) return null;
  return data;
}
