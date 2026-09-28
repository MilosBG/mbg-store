import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const FALLBACK_ADMIN_URL =
  "https://mbg-admin.vercel.app";

export async function GET() {
  const adminUrl = (
    process.env.MBG_ADMIN_URL ||
    FALLBACK_ADMIN_URL
  ).replace(/\/+$/, "");

  try {
    const response = await fetch(
      `${adminUrl}/api/public/legal-settings`,
      {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      },
    );

    const text = await response.text();

    if (!response.ok) {
      console.error(
        `[LEGAL_SETTINGS] mbg-admin returned ${response.status}`,
        text,
      );

      return NextResponse.json(
        {
          error: "LEGAL_SETTINGS_UPSTREAM_ERROR",
          status: response.status,
        },
        {
          status: 502,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    let payload: unknown;

    try {
      payload = JSON.parse(text);
    } catch {
      console.error(
        "[LEGAL_SETTINGS] mbg-admin returned non-JSON content.",
        text.slice(0, 500),
      );

      return NextResponse.json(
        {
          error: "LEGAL_SETTINGS_INVALID_JSON",
        },
        {
          status: 502,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    }

    return NextResponse.json(payload, {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate",
      },
    });
  } catch (error) {
    console.error(
      "[LEGAL_SETTINGS] Failed to reach mbg-admin.",
      error,
    );

    return NextResponse.json(
      {
        error: "LEGAL_SETTINGS_UNAVAILABLE",
      },
      {
        status: 502,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  }
}
