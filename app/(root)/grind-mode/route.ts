import { NextRequest, NextResponse } from "next/server";

/** Ancienne adresse du jeu : redirection permanente vers la page du livre. */
export function GET(request: NextRequest) {
  const destination = new URL("/grind-until-achieve", request.url);
  const lang = request.nextUrl.searchParams.get("lang");
  if (lang === "en" || lang === "fr") {
    destination.searchParams.set("lang", lang);
  }
  return NextResponse.redirect(destination, 308);
}
