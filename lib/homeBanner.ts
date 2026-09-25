import "server-only";

import { unstable_noStore as noStore } from "next/cache";

import { getAdminDb } from "@/lib/adminDb";
import { getProductsByIds } from "@/lib/admin";

type HomeBannerDocument = {
  key: string;
  imageUrl?: string;
  imageAlt?: string;
  ctaType?: "none" | "product" | "link";
  ctaLabel?: string;
  ctaProductId?: string;
  ctaHref?: string;
};

export type HomeBannerSettings = {
  imageUrl: string | null;
  imageAlt: string;
  cta: { label: string; href: string } | null;
};

const DEFAULT_BANNER: HomeBannerSettings = {
  imageUrl: null,
  imageAlt: "Grind Until Achieve",
  cta: null,
};

function cloudinaryImage(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value.trim());
    return url.protocol === "https:" &&
      url.hostname === "res.cloudinary.com" &&
      /^\/[^/]+\/image\/upload\/.+/.test(url.pathname)
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function safeLink(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const href = value.trim();
  if (/^\/(?!\/)[^\s\\]*$/.test(href)) return href;
  try {
    const url = new URL(href);
    return url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

export async function getHomeBannerSettings(): Promise<HomeBannerSettings> {
  noStore();

  try {
    const db = await getAdminDb();
    const document = await db
      .collection<HomeBannerDocument>("homebanners")
      .findOne({ key: "home" });

    if (!document) return DEFAULT_BANNER;

    const imageUrl = cloudinaryImage(document.imageUrl);
    const imageAlt =
      imageUrl && typeof document.imageAlt === "string"
        ? document.imageAlt.trim().slice(0, 140) || "Milos BG"
        : DEFAULT_BANNER.imageAlt;

    let cta: HomeBannerSettings["cta"] = null;
    const label = document.ctaLabel?.trim().slice(0, 60);

    if (label && document.ctaType === "link") {
      const href = safeLink(document.ctaHref);
      if (href) cta = { label, href };
    }

    if (label && document.ctaType === "product" && document.ctaProductId) {
      const [product] = await getProductsByIds([document.ctaProductId]);
      if (product?.slug) {
        cta = { label, href: `/products/${encodeURIComponent(product.slug)}` };
      }
    }

    return { imageUrl, imageAlt, cta };
  } catch (error) {
    console.error("Failed to load the home banner", error);
    return DEFAULT_BANNER;
  }
}
