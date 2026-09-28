import { NextResponse } from "next/server";

import { connectToDB } from "@/lib/mongoDB";
import LegalSettings from "@/lib/models/LegalSettings";

export const dynamic = "force-dynamic";

const DEFAULTS = {
  key: "main",
  businessAddress: "",
  rneRegistration: "",
  repTextileIdu: "",
  returnAddress: "",
  emailProvider: "",
  carrier: "",
  termsLastUpdated: "2026-09-25",
  privacyLastUpdated: "2026-09-25",
  legalNoticeLastUpdated: "2026-09-25",
};

export async function GET() {
  await connectToDB();
  const doc = await LegalSettings.findOne({ key: "main" }).lean();

  return NextResponse.json(
    {
      settings: {
        businessAddress: doc?.businessAddress ?? DEFAULTS.businessAddress,
        rneRegistration: doc?.rneRegistration ?? DEFAULTS.rneRegistration,
        repTextileIdu: doc?.repTextileIdu ?? DEFAULTS.repTextileIdu,
        returnAddress: doc?.returnAddress ?? DEFAULTS.returnAddress,
        emailProvider: doc?.emailProvider ?? DEFAULTS.emailProvider,
        carrier: doc?.carrier ?? DEFAULTS.carrier,
        termsLastUpdated: doc?.termsLastUpdated ?? DEFAULTS.termsLastUpdated,
        privacyLastUpdated: doc?.privacyLastUpdated ?? DEFAULTS.privacyLastUpdated,
        legalNoticeLastUpdated:
          doc?.legalNoticeLastUpdated ?? DEFAULTS.legalNoticeLastUpdated,
      },
    },
    {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    },
  );
}
