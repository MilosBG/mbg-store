"use client";

import { useCallback, useEffect, useState } from "react";

export type LegalTrackerCategory =
  | "ANALYTICS"
  | "ADVERTISING"
  | "PERSONALIZATION"
  | "SOCIAL"
  | "OTHER";

export type LegalTracker = {
  provider: string;
  name: string;
  purposeFr: string;
  purposeEn: string;
  duration: string;
  category: LegalTrackerCategory;
};

export type LegalSettings = {
  businessAddress: string;
  rneRegistration: string;
  repTextileIdu: string;
  returnAddress: string;
  emailProvider: string;
  carrier: string;
  trackers: LegalTracker[];
  termsLastUpdated: string;
  privacyLastUpdated: string;
  legalNoticeLastUpdated: string;
};

export const DEFAULT_LEGAL_SETTINGS: LegalSettings = {
  businessAddress: "À COMPLÉTER / TO COMPLETE — mbg-admin",
  rneRegistration: "À COMPLÉTER / TO COMPLETE — mbg-admin",
  repTextileIdu: "À COMPLÉTER / TO COMPLETE — mbg-admin",
  returnAddress: "À COMPLÉTER / TO COMPLETE — mbg-admin",
  emailProvider: "À COMPLÉTER / TO COMPLETE — mbg-admin",
  carrier: "À COMPLÉTER / TO COMPLETE — mbg-admin",
  trackers: [],
  termsLastUpdated: "2026-09-28",
  privacyLastUpdated: "2026-09-28",
  legalNoticeLastUpdated: "2026-09-28",
};

function normalize(raw: Partial<LegalSettings> | undefined): LegalSettings {
  return {
    ...DEFAULT_LEGAL_SETTINGS,
    ...(raw ?? {}),
    trackers: Array.isArray(raw?.trackers) ? raw.trackers : [],
  };
}

export function useLegalSettings() {
  const [settings, setSettings] = useState<LegalSettings>(DEFAULT_LEGAL_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch(`/api/legal-settings?t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (!response.ok) throw new Error("Legal settings request failed");
      const data = (await response.json()) as { settings?: Partial<LegalSettings> };
      setSettings(normalize(data.settings));
    } catch (error) {
      console.warn("[LEGAL_SETTINGS] Could not refresh public settings", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onFocus = () => void refresh();
    const onVisibility = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);

  return { settings, loading, refresh };
}

export function formatLegalDate(isoDate: string, lang: "fr" | "en") {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) return isoDate;
  const [year, month, day] = isoDate.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}
