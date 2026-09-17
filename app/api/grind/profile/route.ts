import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getGrindDashboard } from "@/lib/grind/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const { userId } = await auth();
  if (!userId) return new NextResponse("Unauthorized", { status: 401 });

  try {
    return NextResponse.json(await getGrindDashboard(userId));
  } catch (error) {
    console.error("[grind_profile_GET]", error);
    return NextResponse.json({ message: "Unable to load GRIND MODE." }, { status: 500 });
  }
}
