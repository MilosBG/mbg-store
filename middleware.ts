import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",

  // Pages accessibles sans connexion.
  "/the-hoop",
  "/the-background",
  "/terms-conditions",
  "/search/:query",
  "/products/:productId",
  "/privacy-policy",
  "/contact",

  // Routes API publiques existantes.
  "/api/milos-bg(.*)",
  "/api/checkout(.*)",
]);

const isMaintenanceRoute = createRouteMatcher(["/api/milos-bg(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  const maintenanceProbeHeader = req.headers.get("x-mbg-maintenance-probe");
  const skipMaintenanceProbe =
    maintenanceProbeHeader === "1" || isMaintenanceRoute(req);

  // L'en-tête de maintenance ne dispense jamais de l'authentification.
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  if (skipMaintenanceProbe || req.method !== "GET") {
    return NextResponse.next();
  }

  const response = NextResponse.next();
  response.headers.set("x-mbg-store-online", "1");

  try {
    const statusUrl = new URL("/api/milos-bg/status", req.url);
    const statusRes = await fetch(statusUrl, {
      cache: "no-store",
      headers: { "x-mbg-maintenance-probe": "1" },
    });

    if (!statusRes.ok) {
      if (statusRes.status !== 404) {
        const text = await statusRes.text().catch(() => "");
        console.warn(
          `Maintenance status endpoint returned ${statusRes.status}`,
          text,
        );
      }
      return response;
    }

    const payload = await statusRes.json().catch(() => null);

    if (payload?.isOnline === false) {
      response.headers.set("x-mbg-store-online", "0");
    }
  } catch (error) {
    console.warn("Failed to probe maintenance status", error);
  }

  return response;
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
