import "server-only";
import { unstable_noStore as noStore } from "next/cache";

import { getAdminDb } from "@/lib/adminDb";

export type HeaderBannerItem =
  | {
      kind: "promotion";
      id: string;
      code: string;
      minSubtotalCents: number;
    }
  | {
      kind: "message";
      id: string;
      textFr: string;
      textEn: string;
    };

type PromotionBannerRecord = Record<string, unknown> & {
  code?: unknown;
  active?: unknown;
  showInHeader?: unknown;
  startsAt?: Date | string | null;
  expiresAt?: Date | string | null;
  maxUses?: number;
  usedCount?: number;
  minSubtotalCents?: number;
  createdAt?: Date;
};

type MessageRecord = {
  id?: unknown;
  textFr?: unknown;
  textEn?: unknown;
  enabled?: unknown;
};

type SettingsRecord = Record<string, unknown> & {
  enabled?: unknown;
  messages?: MessageRecord[];
};

const CODE_FORMAT = /^[A-Z0-9][A-Z0-9_-]{2,23}$/;

function isEligiblePromotion(promo: PromotionBannerRecord, now: number): boolean {
  if (promo.active !== true || promo.showInHeader !== true) return false;
  if (typeof promo.code !== "string" || !CODE_FORMAT.test(promo.code)) return false;
  const starts = promo.startsAt ? new Date(promo.startsAt).getTime() : null;
  const expires = promo.expiresAt ? new Date(promo.expiresAt).getTime() : null;
  if (starts !== null && (!Number.isFinite(starts) || starts > now)) return false;
  if (expires !== null && (!Number.isFinite(expires) || expires <= now)) return false;
  const maxUses = Number(promo.maxUses) || 0;
  const usedCount = Number(promo.usedCount) || 0;
  if (maxUses > 0 && usedCount >= maxUses) return false;
  return true;
}

/**
 * Read the already-shared admin MongoDB server-side. No public admin API,
 * no service token, and no commercial pricing calculations in the browser.
 */
export async function getHeaderAnnouncements(): Promise<HeaderBannerItem[]> {
  noStore();
  try {
    const db = await getAdminDb();
    const [promotions, settings] = await Promise.all([
      db.collection<PromotionBannerRecord>("promotions")
        .find({ active: true, showInHeader: true })
        .sort({ createdAt: -1 })
        .limit(30)
        .toArray(),
      db.collection<SettingsRecord>("headerannouncementsettings")
        .findOne({ key: "header" }),
    ]);
    const now = Date.now();
    const promoItems: HeaderBannerItem[] = promotions
      .filter((promotion) => isEligiblePromotion(promotion, now))
      .slice(0, 8)
      .map((promotion) => ({
        kind: "promotion",
        id: `promo-${promotion.code}`,
        code: String(promotion.code),
        minSubtotalCents: Number.isSafeInteger(promotion.minSubtotalCents)
          ? Math.max(0, Number(promotion.minSubtotalCents))
          : 0,
      }));

    const messageItems: HeaderBannerItem[] = settings?.enabled === true &&
      Array.isArray(settings.messages)
      ? settings.messages
          .filter((message) => message.enabled === true)
          .slice(0, 6)
          .map((message, index) => ({
            kind: "message" as const,
            id: typeof message.id === "string" ? message.id : `msg-${index}`,
            textFr: typeof message.textFr === "string" ? message.textFr : "",
            textEn: typeof message.textEn === "string" ? message.textEn : "",
          }))
          .filter((message) => Boolean(message.textFr || message.textEn))
      : [];

    return [...promoItems, ...messageItems];
  } catch (error) {
    // Marketing must never break checkout or storefront availability.
    console.error("[header-announcements] Unable to load announcement banner.", error);
    return [];
  }
}
