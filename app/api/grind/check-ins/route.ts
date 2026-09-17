import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

import { saveTodayCheckIn } from "@/lib/grind/server";
import type { GrindTask } from "@/types/grind";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const body = await req.json();
    const cycleId = String(body?.cycleId ?? "");
    const tasks = Array.isArray(body?.tasks) ? (body.tasks as GrindTask[]) : [];
    if (!cycleId || tasks.length === 0) {
      return NextResponse.json({ message: "cycleId and tasks are required." }, { status: 400 });
    }

    return NextResponse.json(
      await saveTodayCheckIn({
        clerkId: userId,
        cycleId,
        tasks,
        note: String(body?.note ?? ""),
        showedUp: Boolean(body?.showedUp),
      }),
    );
  } catch (error) {
    console.error("[grind_checkins_POST]", error);
    return NextResponse.json({ message: "Unable to save today's Grind." }, { status: 500 });
  }
}
