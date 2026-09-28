"use client";

import { useEffect, useState } from "react";

export type LegalSettings = {
  businessAddress: string;
  rneRegistration: string;
  repTextileIdu: string;
  returnAddress: string;
  emailProvider: string;
  carrier: string;
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
  termsLastUpdated: "2026-09-25",
  privacyLastUpdated: "2026-09-25",
  legalNoticeLastUpdated: "2026-09-25",
};

let cache: LegalSettings | null = null;
let inFlight: Promise<LegalSettings> | null = null;

async function fetchSettings() {
  if (cache) return cache;
  if (inFlight) return inFlight;

  inFlight = fetch("/api/legal-settings", { cache: "no-store" })
    .then(async (response) => {
      if (!response.ok) throw new Error("Legal settings request failed");
      const data = await response.json();
      const raw = data?.settings ?? {};
      cache = Object.fromEntries(
        Object.entries(DEFAULT_LEGAL_SETTINGS).map(([key, fallback]) => {
          const value = raw[key];
          return [
            key,
            typeof value === "string" && value.trim().length > 0
              ? value
              : fallback,
          ];
        }),
      ) as LegalSettings;
      return cache;
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

export function useLegalSettings() {
  const [settings, setSettings] = useState<LegalSettings>(
    cache ?? DEFAULT_LEGAL_SETTINGS,
  );

  useEffect(() => {
    let active = true;
    void fetchSettings()
      .then((next) => {
        if (active) setSettings(next);
      })
      .catch(() => {
        // On garde les valeurs de secours visibles plutôt que de masquer une
        // information juridique manquante.
      });
    return () => {
      active = false;
    };
  }, []);

  return { settings };
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
