import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { achieveAttempt, startAttempt } from "@/lib/grind-to-achieve/server";
import type { GTAFocusCheck } from "@/types/grind-achieve";

export const dynamic = "force-dynamic";

const validFocus = new Set<GTAFocusCheck>(["LOCKED_IN", "RETURNED", "LOST_FOCUS"]);

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  try {
    const body = await request.json();
    const action = String(body?.action ?? "").toUpperCase();

    if (action === "START") {
      return NextResponse.json(await startAttempt({
        clerkId: userId,
        challengeId: body?.challengeId ? String(body.challengeId) : undefined,
        shadowId: body?.shadowId ? String(body.shadowId) : undefined,
      }));
    }

    if (action === "ACHIEVE") {
      const focusCheck = String(body?.focusCheck ?? "") as GTAFocusCheck;
      if (!validFocus.has(focusCheck)) {
        return NextResponse.json({ error: "INVALID_FOCUS_CHECK" }, { status: 400 });
      }
      return NextResponse.json(await achieveAttempt({
        clerkId: userId,
        attemptId: String(body?.attemptId ?? ""),
        focusCheck,
        note: String(body?.note ?? ""),
      }));
    }

    return NextResponse.json({ error: "UNKNOWN_ACTION" }, { status: 400 });
  } catch (error) {
    console.error("[GTA_ATTEMPTS]", error);
    const message = error instanceof Error ? error.message : "ACTION_FAILED";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
