import { NextRequest, NextResponse } from "next/server";

import { subscribeToMarketing } from "@/lib/marketing-subscribe";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));

  // Lightweight honeypot. Real users never fill this field.
  if (typeof body?.company === "string" && body.company.trim()) {
    return NextResponse.json({
      ok: true,
      status: "SUBSCRIBED",
      message: "Merci. Votre inscription a bien été prise en compte.",
    });
  }

  if (body?.consent !== true) {
    return NextResponse.json(
      { message: "Veuillez confirmer votre accord pour recevoir la newsletter." },
      { status: 400 },
    );
  }

  const result = await subscribeToMarketing({
    email: body?.email,
    firstName: body?.firstName,
    source: "MILOS_BG_SOCIALS_SECTION",
  });

  if (!result.ok) {
    return NextResponse.json({ message: result.message }, { status: 400 });
  }

  return NextResponse.json(result);
}
