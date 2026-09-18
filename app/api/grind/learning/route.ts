import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import {
  abandonImmersionSession,
  completeImmersionSession,
  getLearningDashboard,
  reviewLearningSession,
  startImmersionSession,
} from "@/lib/grind/learning";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  try {
    return NextResponse.json(await getLearningDashboard(userId));
  } catch (error) {
    console.error("[GRIND_LEARNING_GET]", error);
    return NextResponse.json({ error: "LEARNING_LOAD_FAILED" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  try {
    const body = await request.json();
    const action = String(body?.action ?? "").toUpperCase();

    if (action === "START") {
      const result = await startImmersionSession({
        clerkId: userId,
        cycleId: String(body?.cycleId ?? ""),
        clue: String(body?.clue ?? ""),
        attentionCue: String(body?.attentionCue ?? ""),
        durationMinutes: Number(body?.durationMinutes ?? 10),
      });
      return NextResponse.json(result);
    }

    if (action === "COMPLETE") {
      const result = await completeImmersionSession({
        clerkId: userId,
        sessionId: String(body?.sessionId ?? ""),
        recall: String(body?.recall ?? ""),
        observation: String(body?.observation ?? ""),
        nextAction: String(body?.nextAction ?? ""),
      });
      return NextResponse.json(result);
    }

    if (action === "REVIEW") {
      const result = await reviewLearningSession({
        clerkId: userId,
        sessionId: String(body?.sessionId ?? ""),
        recall: String(body?.recall ?? ""),
      });
      return NextResponse.json(result);
    }

    if (action === "ABANDON") {
      await abandonImmersionSession(userId, String(body?.sessionId ?? ""));
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "UNKNOWN_ACTION" }, { status: 400 });
  } catch (error) {
    console.error("[GRIND_LEARNING_POST]", error);
    return NextResponse.json({ error: "LEARNING_ACTION_FAILED" }, { status: 400 });
  }
}
