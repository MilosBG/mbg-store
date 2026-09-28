import { NextResponse } from "next/server";

import { connectToDB } from "@/lib/mongoDB";
import LegalSettings, { type LegalSettingsShape } from "@/lib/models/LegalSettings";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const ADMIN_URL = (process.env.MBG_ADMIN_URL || "https://mbg-admin.vercel.app").replace(/\/$/, "");

const FALLBACK = {
  businessAddress: "",
  rneRegistration: "",
  repTextileIdu: "",
  returnAddress: "",
  emailProvider: "",
  carrier: "",
  trackers: [],
  termsLastUpdated: "2026-09-28",
  privacyLastUpdated: "2026-09-28",
  legalNoticeLastUpdated: "2026-09-28",
};

async function localFallback() {
  await connectToDB();
  const doc = await LegalSettings.findOne({ key: "main" }).lean<LegalSettingsShape>();
  return {
    businessAddress: doc?.businessAddress ?? FALLBACK.businessAddress,
    rneRegistration: doc?.rneRegistration ?? FALLBACK.rneRegistration,
    repTextileIdu: doc?.repTextileIdu ?? FALLBACK.repTextileIdu,
    returnAddress: doc?.returnAddress ?? FALLBACK.returnAddress,
    emailProvider: doc?.emailProvider ?? FALLBACK.emailProvider,
    carrier: doc?.carrier ?? FALLBACK.carrier,
    trackers: Array.isArray(doc?.trackers) ? doc.trackers : [],
    termsLastUpdated: doc?.termsLastUpdated ?? FALLBACK.termsLastUpdated,
    privacyLastUpdated: doc?.privacyLastUpdated ?? FALLBACK.privacyLastUpdated,
    legalNoticeLastUpdated: doc?.legalNoticeLastUpdated ?? FALLBACK.legalNoticeLastUpdated,
  };
}

export async function GET() {
  try {
    const response = await fetch(`${ADMIN_URL}/api/public/legal-settings?t=${Date.now()}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    if (!response.ok) throw new Error(`Admin legal API returned ${response.status}`);
    const data = (await response.json()) as { settings?: Record<string, unknown> };
    if (!data.settings) throw new Error("Missing settings payload");
    return NextResponse.json(data, { headers: { "Cache-Control": "no-store, max-age=0" } });
  } catch (error) {
    console.warn("[LEGAL_SETTINGS] Falling back to mbg-store database", error);
    const settings = await localFallback();
    return NextResponse.json(
      { settings, source: "store-fallback" },
      { headers: { "Cache-Control": "no-store, max-age=0" } },
    );
  }
}
