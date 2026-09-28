export type LegalTracker = {
  provider: string;
  name: string;
  category: string;
  purposeFr: string;
  purposeEn: string;
  duration: string;
};

export type PublicLegalSettings = {
  fullName: string;
  legalFormFr: string;
  legalFormEn: string;
  businessName: string;
  siren: string;
  apeCode: string;
  rneRegistration: string;
  businessAddress: string;
  phoneDisplay: string;
  phoneHref: string;
  email: string;
  domain: string;
  repTextileIdu: string;
  returnAddress: string;
  emailProvider: string;
  carrier: string;
  trackers: LegalTracker[];
  termsLastUpdated: string;
  privacyLastUpdated: string;
  legalNoticeLastUpdated: string;
};

export const LEGAL_SETTINGS_FALLBACK: PublicLegalSettings = {
  fullName: "Gamil BEN AHMED",
  legalFormFr: "Entrepreneur individuel",
  legalFormEn: "Sole trader",
  businessName: "Milos BG",
  siren: "984 671 206",
  apeCode: "3299Z",
  rneRegistration: "",
  businessAddress: "",
  phoneDisplay: "07 83 15 07 91",
  phoneHref: "tel:+33783150791",
  email: "contact@milos-bg.com",
  domain: "milos-bg.com",
  repTextileIdu: "",
  returnAddress: "",
  emailProvider: "",
  carrier: "",
  trackers: [],
  termsLastUpdated: "",
  privacyLastUpdated: "",
  legalNoticeLastUpdated: "",
};

export async function getPublicLegalSettings(): Promise<PublicLegalSettings> {
  try {
    const response = await fetch("/api/legal-settings", {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return LEGAL_SETTINGS_FALLBACK;
    }

    const payload = await response.json();

    return {
      ...LEGAL_SETTINGS_FALLBACK,
      ...(payload?.settings ?? {}),
      trackers: Array.isArray(payload?.settings?.trackers)
        ? payload.settings.trackers
        : [],
    };
  } catch {
    return LEGAL_SETTINGS_FALLBACK;
  }
}
