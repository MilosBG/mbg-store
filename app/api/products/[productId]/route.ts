import { NextRequest, NextResponse } from "next/server";

// Build API URL that tolerates base values that already include '/api'
function withApi(base: string, path: string): string {
  let b = base.trim().replace(/\/+$/, "");
  const root = /\/api$/i.test(b) ? b : `${b}/api`;
  const sep = path.startsWith("/") ? "" : "/";
  return `${root}${sep}${path}`;
}

export const dynamic = "force-dynamic"; // ensure no caching issues in dev

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const base = process.env.NEXT_PUBLIC_ADMIN_API || process.env.NEXT_PUBLIC_API_URL;
    if (!base) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_ADMIN_API or NEXT_PUBLIC_API_URL" },
        { status: 500 }
      );
    }

    const url = withApi(base, `products/${encodeURIComponent(productId)}`);
    const res = await fetch(url, { cache: "no-store" });

    // Forward upstream status and body
    const text = await res.text();
    const contentType = res.headers.get("content-type") || "application/json";
    return new NextResponse(text, {
      status: res.status,
      headers: { "content-type": contentType },
    });
  } catch (err) {
    console.error("[api/products/[productId]]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
