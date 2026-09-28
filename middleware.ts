import { NextResponse } from "next/server";

import {
  clerkMiddleware,
  createRouteMatcher,
} from "@clerk/nextjs/server";

// -----------------------------------------------------------------------------
// ROUTES PUBLIQUES
// -----------------------------------------------------------------------------
//
// `(.*)` rend publique la route ET toutes ses sous-routes.
//
// Les paramètres query comme :
//
// ?lang=fr
// ?lang=en
// ?query=...
//
// n'ont pas besoin d'être déclarés séparément.
// -----------------------------------------------------------------------------

const isPublicRoute = createRouteMatcher([
  "/",

  // ---------------------------------------------------------------------------
  // AUTHENTIFICATION
  // ---------------------------------------------------------------------------

  "/sign-in(.*)",
  "/sign-up(.*)",

  // ---------------------------------------------------------------------------
  // BOUTIQUE / PAGES PUBLIQUES
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
  // RÉTRACTATION
  // ---------------------------------------------------------------------------
  //
  // IMPORTANT :
  // Le consommateur doit pouvoir accéder au dispositif de rétractation
  // sans devoir être authentifié.
  // ---------------------------------------------------------------------------

  "/withdrawal(.*)",

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
  // API PUBLIQUES — MILOS BG
  // ---------------------------------------------------------------------------

  "/api/milos-bg(.*)",

  // ---------------------------------------------------------------------------
  // API PUBLIQUES — CHECKOUT
  // ---------------------------------------------------------------------------

  "/api/checkout(.*)",

  // ---------------------------------------------------------------------------
  // API PUBLIQUES — LEGAL CONTENT
  // ---------------------------------------------------------------------------
  //
  // Ces endpoints doivent être accessibles aux pages publiques du store.
  //
  // /api/legal-settings
  //     récupère les informations juridiques à afficher.
  //
  // /api/legal/withdrawal-form
  //     génère/télécharge le formulaire PDF de rétractation.
  // ---------------------------------------------------------------------------

  "/api/legal-settings(.*)",
  "/api/legal/withdrawal-form(.*)",
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
  // Toute route qui n'est PAS explicitement publique nécessite
  // une authentification Clerk.
  //
  // IMPORTANT :
  // `x-mbg-maintenance-probe` ne permet jamais de contourner Clerk.
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
      // Un 404 est volontairement toléré :
      // l'absence temporaire de l'endpoint de statut ne doit pas
      // rendre toute la boutique inaccessible.

      if (statusRes.status !== 404) {
        const text = await statusRes
          .text()
          .catch(() => "");

        console.warn(
          `[MBG_STORE] Maintenance status endpoint returned ${statusRes.status}`,
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
    // automatiquement le store inaccessible.

    console.warn(
      "[MBG_STORE] Failed to probe maintenance status",
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
     * Sont notamment exclus :
     *
     * - _next
     * - images
     * - CSS
     * - JavaScript
     * - fonts
     * - PDF / documents
     * - archives
     * - sitemap.xml
     * - robots.txt
     *
     * Les routes API restent interceptées grâce
     * au deuxième matcher ci-dessous.
     */

    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|otf|woff2?|ico|csv|pdf|docx?|xlsx?|zip|webmanifest|xml|txt)).*)",

    /**
     * Toutes les API et TRPC passent par le middleware.
     */

    "/(api|trpc)(.*)",
  ],
};