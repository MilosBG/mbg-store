import "server-only";
import { getAdminDb } from "@/lib/adminDb";

export type WelcomePublic = {
  enabled: boolean; delayMs: number;
  titleEn: string; titleFr: string; messageEn: string; messageFr: string;
  promoEn: string; promoFr: string; promoCode: string;
  ctaLabelEn: string; ctaLabelFr: string; ctaHref: string;
  instagram: string; youtube: string; threads: string;
  revision: string;
};

export async function getWelcomeSettings(): Promise<WelcomePublic | null> {
  try {
    const db = await getAdminDb();
    const data = await db.collection("welcomesettings").findOne({ key: "home", enabled: true });
    if (!data) return null;
    const value = (key: string) => typeof data[key] === "string" ? data[key] as string : "";
    return {
      enabled: true,
      delayMs: Math.min(30000, Math.max(0, Number(data.delayMs) || 0)),
      titleEn:value("titleEn"), titleFr:value("titleFr"), messageEn:value("messageEn"), messageFr:value("messageFr"),
      promoEn:value("promoEn"), promoFr:value("promoFr"), promoCode:value("promoCode"),
      ctaLabelEn:value("ctaLabelEn"), ctaLabelFr:value("ctaLabelFr"),
      ctaHref: /^\/(?!\/)/.test(value("ctaHref")) ? value("ctaHref") : "/products",
      instagram:value("instagram"), youtube:value("youtube"), threads:value("threads"),
      revision: data.updatedAt instanceof Date ? data.updatedAt.toISOString() : "v1",
    };
  } catch (error) {
    console.error("[welcome] Unable to load welcome settings.", error);
    return null; // A failure to load marketing must never break storefront.
  }
}
