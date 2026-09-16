import { NextResponse } from "next/server";
import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";

// -----------------------------------------------------------------------------
// ROUTES PUBLIQUES
// -----------------------------------------------------------------------------
//
// `(.*)` permet de rendre publique la route ET toutes ses sous-routes.
//
// Exemple :
// /products
// /products/grind-t
// /products/grind-t?lang=fr
//
// Les paramètres de query (?lang=fr, ?query=..., etc.) n'ont pas besoin
// d'être déclarés séparément.
// -----------------------------------------------------------------------------

const isPublicRoute = createRouteMatcher([
  "/",

  // ---------------------------------------------------------------------------
  // AUTHENTIFICATION
  // ---------------------------------------------------------------------------
  "/sign-in(.*)",
  "/sign-up(.*)",

  // ---------------------------------------------------------------------------
  // PAGES PUBLIQUES
  // ---------------------------------------------------------------------------
  "/the-hoop(.*)",
  "/the-background(.*)",
  "/terms-conditions(.*)",
  "/privacy-policy(.*)",
  "/legal-notice(.*)",
  "/contact(.*)",
  "/grind-until-achieve(.*)",
  "/size-guide(.*)",

  // ---------------------------------------------------------------------------
  // RECHERCHE
  // ---------------------------------------------------------------------------
  "/search(.*)",

  // ---------------------------------------------------------------------------
  // PRODUITS
  // ---------------------------------------------------------------------------
  "/products(.*)",

  // ---------------------------------------------------------------------------
  // CHAPITRES
  // ---------------------------------------------------------------------------
  "/chapters(.*)",

  // ---------------------------------------------------------------------------
  // SEO
  // ---------------------------------------------------------------------------
  "/robots.txt",
  "/sitemap.xml",

  // ---------------------------------------------------------------------------
  // ROUTES API PUBLIQUES
  // ---------------------------------------------------------------------------
  "/api/milos-bg(.*)",
  "/api/checkout(.*)",
]);

// -----------------------------------------------------------------------------
// ROUTES UTILISÉES PAR LE SYSTÈME DE MAINTENANCE
// -----------------------------------------------------------------------------

const isMaintenanceRoute = createRouteMatcher([
  "/api/milos-bg(.*)",
]);

// -----------------------------------------------------------------------------
// MIDDLEWARE
// -----------------------------------------------------------------------------

export default clerkMiddleware(async (auth, req) => {
  const maintenanceProbeHeader = req.headers.get(
    "x-mbg-maintenance-probe",
  );

  const skipMaintenanceProbe =
    maintenanceProbeHeader === "1" ||
    isMaintenanceRoute(req);

  // ---------------------------------------------------------------------------
  // AUTHENTIFICATION
  // ---------------------------------------------------------------------------
  //
  // Toutes les routes qui ne sont PAS explicitement publiques nécessitent
  // une authentification Clerk.
  //
  // IMPORTANT :
  // l'en-tête x-mbg-maintenance-probe ne permet jamais de contourner Clerk.
  // ---------------------------------------------------------------------------

  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // ---------------------------------------------------------------------------
  // IGNORER LA VÉRIFICATION DE MAINTENANCE
  // ---------------------------------------------------------------------------

  if (skipMaintenanceProbe || req.method !== "GET") {
    return NextResponse.next();
  }

  // ---------------------------------------------------------------------------
  // RÉPONSE PAR DÉFAUT : BOUTIQUE EN LIGNE
  // ---------------------------------------------------------------------------

  const response = NextResponse.next();

  response.headers.set(
    "x-mbg-store-online",
    "1",
  );

  // ---------------------------------------------------------------------------
  // VÉRIFICATION DE L'ÉTAT DE LA BOUTIQUE
  // ---------------------------------------------------------------------------

  try {
    const statusUrl = new URL(
      "/api/milos-bg/status",
      req.url,
    );

    const statusRes = await fetch(statusUrl, {
      cache: "no-store",
      headers: {
        "x-mbg-maintenance-probe": "1",
      },
    });

    // -------------------------------------------------------------------------
    // ENDPOINT NON DISPONIBLE
    // -------------------------------------------------------------------------

    if (!statusRes.ok) {
      // Un 404 est toléré :
      // la boutique reste considérée comme en ligne.

      if (statusRes.status !== 404) {
        const text = await statusRes
          .text()
          .catch(() => "");

        console.warn(
          `Maintenance status endpoint returned ${statusRes.status}`,
          text,
        );
      }

      return response;
    }

    // -------------------------------------------------------------------------
    // LECTURE DU STATUT
    // -------------------------------------------------------------------------

    const payload = await statusRes
      .json()
      .catch(() => null);

    if (payload?.isOnline === false) {
      response.headers.set(
        "x-mbg-store-online",
        "0",
      );
    }
  } catch (error) {
    // Une erreur du système de maintenance ne doit jamais rendre
    // automatiquement la boutique inaccessible.

    console.warn(
      "Failed to probe maintenance status",
      error,
    );
  }

  return response;
});

// -----------------------------------------------------------------------------
// CONFIGURATION NEXT.JS
// -----------------------------------------------------------------------------

export const config = {
  matcher: [
    /**
     * Middleware appliqué aux pages Next.js,
     * sauf aux assets statiques.
     *
     * On exclut notamment :
     *
     * - _next
     * - images
     * - CSS
     * - JavaScript
     * - fonts
     * - documents
     * - sitemap.xml
     * - robots.txt
     *
     * robots.txt et sitemap.xml ne doivent pas dépendre
     * de Clerk ou du système de maintenance.
     */
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)",

    /**
     * Les API et TRPC restent interceptées par le middleware.
     */
    "/(api|trpc)(.*)",
  ],
};