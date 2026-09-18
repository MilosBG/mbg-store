import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getDashboard } from "@/lib/grind-to-achieve/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get("lang") === "fr" ? "fr" : "en";
  try {
    return NextResponse.json(await getDashboard(userId, lang));
  } catch (error) {
    console.error("[GTA_DASHBOARD]", error);
    return NextResponse.json({ error: "DASHBOARD_LOAD_FAILED" }, { status: 500 });
  }
}
