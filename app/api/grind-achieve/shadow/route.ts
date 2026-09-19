import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { abandonShadow, createShadow } from "@/lib/grind-to-achieve/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  try {
    const body = await request.json();
    const action = String(body?.action ?? "CREATE").toUpperCase();
    if (action === "CREATE") {
      return NextResponse.json(await createShadow(
        userId,
        String(body?.attemptId ?? body?.seriesId ?? ""),
      ));
    }
    if (action === "ABANDON") {
      await abandonShadow(userId, String(body?.shadowId ?? ""));
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "UNKNOWN_ACTION" }, { status: 400 });
  } catch (error) {
    console.error("[GTA_SHADOW]", error);
    const message = error instanceof Error ? error.message : "SHADOW_ACTION_FAILED";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
