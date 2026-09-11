import { NextRequest, NextResponse } from "next/server";

import {
  cleanMarketingEmail,
  suppressMarketingEmail,
  verifyMarketingUnsubscribeToken,
} from "@/lib/marketing-unsubscribe";

export const dynamic = "force-dynamic";

function readSignedRequest(request: NextRequest) {
  const email = cleanMarketingEmail(request.nextUrl.searchParams.get("email"));
  const owner = String(request.nextUrl.searchParams.get("owner") || "");
  const token = String(request.nextUrl.searchParams.get("token") || "");
  const preview = request.nextUrl.searchParams.get("preview") === "1";

  return { email, owner, token, preview };
}

function isValid({
  email,
  owner,
  token,
}: {
  email: string;
  owner: string;
  token: string;
}) {
  return Boolean(
    email && owner && token && verifyMarketingUnsubscribeToken(owner, email, token),
  );
}

function publicPageUrl(
  request: NextRequest,
  values: {
    email: string;
    owner: string;
    token: string;
    preview: boolean;
    status?: string;
  },
) {
  const url = new URL("/marketing/unsubscribe", request.nextUrl.origin);
  url.searchParams.set("owner", values.owner);
  url.searchParams.set("email", values.email);
  url.searchParams.set("token", values.token);
  if (values.preview) url.searchParams.set("preview", "1");
  if (values.status) url.searchParams.set("status", values.status);
  return url;
}

export async function GET(request: NextRequest) {
  const values = readSignedRequest(request);
  return NextResponse.redirect(publicPageUrl(request, values), 307);
}

export async function POST(request: NextRequest) {
  const values = readSignedRequest(request);

  if (!isValid(values)) {
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

  if (!values.preview) {
    await suppressMarketingEmail({
      ownerClerkId: values.owner,
      email: values.email,
    });
  }

  // RFC 8058: mailbox providers expect an empty 200 response.
  if (oneClick && action !== "confirm") {
    return new NextResponse(null, { status: 200 });
  }

  return NextResponse.redirect(
    publicPageUrl(request, {
      ...values,
      status: values.preview ? "preview-success" : "success",
    }),
    303,
  );
}
