import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export async function POST(request: NextRequest) {
  const base = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");
  const token = process.env.ADMIN_SERVICE_TOKEN || process.env.STOREFRONT_SERVICE_TOKEN;
  if (!base || !token) return NextResponse.json({error:"Promotion service not configured."},{status:503});
  const input = await request.json().catch(()=>null);
  if (!input || !Array.isArray(input.lines) || input.lines.length>50) return NextResponse.json({error:"Invalid cart."},{status:400});
  try {
    const r = await fetch(`${base}/storefront/promotions/quote`,{
      method:"POST",cache:"no-store",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},
      body:JSON.stringify({lines:input.lines,code:input.code,shippingOption:input.shippingOption}),
      signal:AbortSignal.timeout(10000),
    });
    const data=await r.json().catch(()=>({error:"Unable to validate promotion."}));
    return NextResponse.json(data,{status:r.status,headers:{"Cache-Control":"private, no-store"}});
  } catch {return NextResponse.json({error:"Promotion service temporarily unavailable."},{status:502});}
}
