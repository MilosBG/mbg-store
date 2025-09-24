import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const productId: string | undefined = body?.productId ?? body?.id;
    // Optional payload keys from admin: { productId, fetch, source }

    // Revalidate list path + tag
    try { revalidatePath("/products"); } catch {}
    try { revalidatePath("/"); } catch {}
    try { revalidateTag("products"); } catch {}

    // Revalidate detail path + tag when provided
    if (productId) {
      try { revalidatePath(`/products/${productId}`); } catch {}
      try { revalidateTag(`product:${productId}`); } catch {}
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[admin/sync-product]", err);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
