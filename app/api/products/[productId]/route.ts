import { NextRequest, NextResponse } from "next/server";

import { getProductById } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const product = await getProductById(productId);

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error("[api/products/[productId]]", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}