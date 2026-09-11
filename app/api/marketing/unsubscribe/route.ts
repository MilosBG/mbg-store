import { NextRequest, NextResponse } from "next/server";

import {
  cleanMarketingEmail,
  getMarketingUnsubscribeTokenRecord,
  markMarketingUnsubscribeTokenUsed,
  suppressMarketingEmail,
} from "@/lib/marketing-unsubscribe";

export const dynamic = "force-dynamic";

function readSignedRequest(request: NextRequest) {
  const email = cleanMarketingEmail(request.nextUrl.searchParams.get("email"));
  const owner = String(request.nextUrl.searchParams.get("owner") || "");
  const token = String(request.nextUrl.searchParams.get("token") || "");

  return { email, owner, token };
}

function publicPageUrl(
  request: NextRequest,
  values: {
    email: string;
    owner: string;
    token: string;
    status?: string;
  },
) {
  const url = new URL("/marketing/unsubscribe", request.nextUrl.origin);
  url.searchParams.set("owner", values.owner);
  url.searchParams.set("email", values.email);
  url.searchParams.set("token", values.token);
  if (values.status) url.searchParams.set("status", values.status);
  return url;
}

export async function GET(request: NextRequest) {
  const values = readSignedRequest(request);
  return NextResponse.redirect(publicPageUrl(request, values), 307);
}

export async function POST(request: NextRequest) {
  const values = readSignedRequest(request);
  const tokenRecord = await getMarketingUnsubscribeTokenRecord(
    values.owner,
    values.email,
    values.token,
  );

  if (!tokenRecord.valid) {
    return NextResponse.json(
      { ok: false, message: "Invalid unsubscribe link." },
      { status: 400 },
    );
  }

  const contentType = request.headers.get("content-type") || "";
  let action = "";
  let oneClick = false;

  if (
    contentType.includes("application/x-www-form-urlencoded") ||
    contentType.includes("multipart/form-data")
  ) {
    const formData = await request.formData().catch(() => null);
    action = String(formData?.get("action") || "");
    oneClick =
      String(formData?.get("List-Unsubscribe") || "") === "One-Click";
  }

  if (!tokenRecord.preview) {
    await suppressMarketingEmail({
      ownerClerkId: values.owner,
      email: values.email,
    });
  }

  await markMarketingUnsubscribeTokenUsed({
    ownerClerkId: values.owner,
    email: values.email,
    token: values.token,
  });

  // RFC 8058: mailbox providers expect an empty 200 response.
  if (oneClick && action !== "confirm") {
    return new NextResponse(null, { status: 200 });
  }

  return NextResponse.redirect(
    publicPageUrl(request, {
      ...values,
      status: tokenRecord.preview ? "preview-success" : "success",
    }),
    303,
  );
}
