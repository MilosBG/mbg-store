import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { completeGrindCycle, createGrindCycle } from "@/lib/grind/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    if (body?.action === "complete") {
      const cycleId = String(body?.cycleId ?? "");
      if (!cycleId) return NextResponse.json({ message: "Missing cycleId." }, { status: 400 });
      return NextResponse.json(await completeGrindCycle(userId, cycleId, String(body?.reflection ?? "")));
    }

    const title = String(body?.title ?? "").trim();
    const reason = String(body?.reason ?? "").trim();
    if (!title || !reason) {
      return NextResponse.json({ message: "Title and reason are required." }, { status: 400 });
    }

    return NextResponse.json(await createGrindCycle(userId, title, reason));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update cycle.";
    const status = message === "GRIND_MODE_LOCKED" ? 403 : 500;
    console.error("[grind_cycles_POST]", error);
    return NextResponse.json({ message }, { status });
  }
}
