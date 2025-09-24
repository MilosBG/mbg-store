/* eslint-disable @typescript-eslint/no-explicit-any */
export const getChapters = async () => {
  const chapters = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chapters`);
  return await chapters.json();
};

export const getChapterDetails = async (chapterId: string) => {
  const chapter = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/chapters/${encodeURIComponent(chapterId)}`
  );
  return await chapter.json()
};

export const getProducts = async () => {
  const base = process.env.NEXT_PUBLIC_ADMIN_API || process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("Missing NEXT_PUBLIC_ADMIN_API or NEXT_PUBLIC_API_URL for products");
  const url = `${base}/api/products?availableOnly=true`;
  return fetchJSON(url, { cache: "no-store" });
};

export const getProductDetails = async (productId: string) => {
  const base = process.env.NEXT_PUBLIC_ADMIN_API || process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("Missing NEXT_PUBLIC_ADMIN_API or NEXT_PUBLIC_API_URL for product details");
  const url = `${base}/api/products/${encodeURIComponent(productId)}`;
  return fetchJSON(url, { cache: "no-store" });
};

export const getSearchedProducts = async (query: string) => {
  const base = process.env.NEXT_PUBLIC_ADMIN_API || process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("Missing NEXT_PUBLIC_ADMIN_API or NEXT_PUBLIC_API_URL for search");
  const url = `${base}/api/search/${encodeURIComponent(query)}?availableOnly=true`;
  return fetchJSON(url, { cache: "no-store" });
};

// actions.ts

// Helper: convert MongoDB Decimal128 JSON ({ $numberDecimal: "12.34" }) to number
const normalizeDecimals = (value: any): any => {
  if (Array.isArray(value)) return value.map(normalizeDecimals);

  if (value && typeof value === "object") {
    // Decimal128 shape
    if ("$numberDecimal" in value) {
      const str = (value as { $numberDecimal: string }).$numberDecimal;
      const n = parseFloat(str);
      return Number.isFinite(n) ? n : str;
    }

    // Recurse objects
    const out: Record<string, any> = {};
    for (const [k, v] of Object.entries(value)) out[k] = normalizeDecimals(v);
    return out;
  }

  return value;
};

// Fetch JSON safely, erroring if the response isn't JSON (e.g. HTML error page)
async function fetchJSON<T = any>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status} for ${url}: ${text.slice(0, 120)}`);
  }
  const ct = (res.headers.get("content-type") || "").toLowerCase();
  if (!ct.includes("application/json")) {
    const text = await res.text().catch(() => "");
    throw new Error(`Expected JSON from ${url} but got '${ct}'. Snippet: ${text.slice(0, 120)}`);
  }
  return res.json() as Promise<T>;
}

type OrderType = any; // keep your real type here

type OrdersApiResponse = OrderType[] | { orders: OrderType[] };

export const getOrders = async (customerId: string): Promise<OrderType[]> => {
  const admin = process.env.NEXT_PUBLIC_ADMIN_API;
  const legacy = process.env.NEXT_PUBLIC_API_URL;
  const id = encodeURIComponent(customerId);

  // Try a few candidate endpoints to maximize compatibility across backends
  const bases = [admin, legacy].filter(Boolean) as string[];
  const candidates: string[] = [];
  for (const b of bases) {
    candidates.push(
      `${b}/api/orders/customers/${id}`,
      `${b}/orders/customers/${id}`,
      `${b}/api/orders?customerClerkId=${id}`,
      `${b}/api/orders?customer=${id}`
    );
  }

  for (const url of candidates) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) continue;
      const raw: OrdersApiResponse = await res.json();
      const arr = Array.isArray(raw) ? raw : (raw as any)?.orders ?? [];
      const normalized = normalizeDecimals(arr) as OrderType[];
      if (Array.isArray(normalized)) return normalized;
    } catch {
      // try next candidate
    }
  }
  return [];
};

export const getOrderDetails = async (orderId: string): Promise<any> => {
  const base = process.env.NEXT_PUBLIC_ADMIN_API || process.env.NEXT_PUBLIC_API_URL;
  if (!base) throw new Error("Missing NEXT_PUBLIC_ADMIN_API or NEXT_PUBLIC_API_URL for order details");
  const url = `${base}/api/orders/${encodeURIComponent(orderId)}`;
  return fetchJSON(url, { cache: "no-store" });
};
