import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { assertAdmin, createAdminChallenge, deleteAdminChallenge, listAdminChallenges, updateAdminChallenge } from "@/lib/grind-to-achieve/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  try {
    await assertAdmin(userId);
    return NextResponse.json(await listAdminChallenges());
  } catch (error) {
    const message = error instanceof Error ? error.message : "FAILED";
    return NextResponse.json({ error: message }, { status: 403 });
  }
}

export async function POST(request: Request) {
  const { userId } = await auth();
  try {
    const adminId = await assertAdmin(userId);
    const body = await request.json();
    return NextResponse.json(await createAdminChallenge({
      adminId,
      title: String(body?.title ?? ""),
      description: String(body?.description ?? ""),
      category: String(body?.category ?? "CHALLENGE"),
      status: body?.status === "PUBLISHED" ? "PUBLISHED" : "DRAFT",
      audienceMode: body?.audienceMode === "SELECTED_HUSTLERS" ? "SELECTED_HUSTLERS" : "ALL",
      clerkIds: Array.isArray(body?.clerkIds) ? body.clerkIds.map(String) : [],
      startsAt: body?.startsAt ? String(body.startsAt) : null,
      endsAt: body?.endsAt ? String(body.endsAt) : null,
      priority: Number(body?.priority ?? 0),
      media: body?.media ? String(body.media) : null,
      measurementType: ["COUNT", "DISTANCE", "TIME_HELD", "PAGES", "WORDS", "CUSTOM"].includes(String(body?.measurementType))
        ? String(body.measurementType) as "COUNT" | "DISTANCE" | "TIME_HELD" | "PAGES" | "WORDS" | "CUSTOM"
        : "COUNT",
      unitLabel: String(body?.unitLabel ?? "reps"),
      targetValue: body?.targetValue === "" || body?.targetValue == null ? null : Number(body.targetValue),
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "CREATE_FAILED";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const { userId } = await auth();
  try {
    const adminId = await assertAdmin(userId);
    const body = await request.json();
    return NextResponse.json(await updateAdminChallenge({
      adminId,
      id: String(body?.id ?? ""),
      patch: (body?.patch ?? {}) as Record<string, unknown>,
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "UPDATE_FAILED";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}


export async function DELETE(request: Request) {
  const { userId } = await auth();
  try {
    const adminId = await assertAdmin(userId);
    const body = await request.json();
    return NextResponse.json(await deleteAdminChallenge({
      adminId,
      id: String(body?.id ?? ""),
    }));
  } catch (error) {
    const message = error instanceof Error ? error.message : "DELETE_FAILED";
    const status = message === "CHALLENGE_NOT_FOUND" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}
