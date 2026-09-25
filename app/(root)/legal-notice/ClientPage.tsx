"use client";

import Container from "@/components/mbg-components/Container";
import { H2 } from "@/components/mbg-components/H2";
import { H3 } from "@/components/mbg-components/H3";
import Separator from "@/components/mbg-components/Separator";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { BiSolidBasketball } from "react-icons/bi";

// -----------------------------------------------------------------------------
// Language helpers (persist to URL & localStorage, default to EN)
// -----------------------------------------------------------------------------
const LANG_STORAGE_KEY = "mbg.legal.lang" as const;
type Lang = "en" | "fr";


// -----------------------------------------------------------------------------
// Legal information — COMPLETE THE TODO VALUES BEFORE PRODUCTION
// -----------------------------------------------------------------------------
const LEGAL_INFO = {
  fullName: "Gamil BEN AHMED",
  legalFormFR: "Entrepreneur individuel",
  legalFormEN: "Sole trader",
  businessName: "Milos BG",
  domain: "milos-bg.com",
  siren: "984 671 206",
  ape: "3299Z",
  phoneDisplay: "07 83 15 07 91",
  phoneHref: "tel:+33783150791",
  email: "contact@milos-bg.com",

  // REQUIRED BEFORE PRODUCTION:
  businessAddressFR:
    "À COMPLÉTER — adresse professionnelle complète de l’entreprise",
  businessAddressEN:
    "TO COMPLETE — full professional business address",
  rneRegistrationFR:
    "À COMPLÉTER — mention exacte d’immatriculation RNE/RCS figurant sur votre justificatif INPI",
  rneRegistrationEN:
    "TO COMPLETE — exact RNE/RCS registration details shown on your INPI document",
  repTextileIduFR:
    "À COMPLÉTER — identifiant unique REP textile (TLC), si applicable",
  repTextileIduEN:
    "TO COMPLETE — textile EPR unique identifier (TLC), where applicable",

  // mbg-store is deployed on Vercel. Keep these values only while Vercel is
  // the actual hosting provider serving milos-bg.com.
  hostingName: "Vercel Inc.",
  hostingAddress: "440 N Barranca Avenue #4133, Covina, CA 91723, United States",
  hostingPhoneDisplay: "+1 559 288 7060",
  hostingPhoneHref: "tel:+15592887060",
  hostingUrl: "https://vercel.com",
} as const;

const useLang = (): [Lang, (l: Lang) => void] => {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("lang") as Lang | null;
    const fromStorage =
      (localStorage.getItem(LANG_STORAGE_KEY) as Lang | null) ?? null;
    const initial = (fromUrl || fromStorage || "en") as Lang;
    setLang(initial);
  }, []);

  useEffect(() => {
    if (!lang) return;
    const params = new URLSearchParams(window.location.search);
    params.set("lang", lang);
    const url = `${window.location.pathname}?${params.toString()}${
      window.location.hash
    }`;
    window.history.replaceState({}, "", url);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    document?.documentElement?.setAttribute("lang", lang);
  }, [lang]);

  return [lang, setLang];
};

// -----------------------------------------------------------------------------
// Section IDs used for TOC + active-section highlighting
// -----------------------------------------------------------------------------
const IDS = [
  "identification-de-lediteur",
  "coordonnees-contact",
  "directeur-de-la-publication",
  "hebergeur",
  "immatriculation-fiscalite-rep",
  "propriete-intellectuelle",
] as const;

// -----------------------------------------------------------------------------
// Localized TOC labels
// -----------------------------------------------------------------------------
const tocItems = {
  fr: [
    ["1.", "Identification de l’éditeur", IDS[0]],
    ["2.", "Coordonnées & Contact", IDS[1]],
    ["3.", "Directeur de la publication", IDS[2]],
    ["4.", "Hébergement", IDS[3]],
    ["5.", "Immatriculation, TVA & REP", IDS[4]],
    ["6.", "Propriété intellectuelle", IDS[5]],
  ],
  en: [
    ["1.", "Publisher identification", IDS[0]],
    ["2.", "Contact details", IDS[1]],
    ["3.", "Publication director", IDS[2]],
    ["4.", "Hosting", IDS[3]],
    ["5.", "Registration, VAT & EPR", IDS[4]],
    ["6.", "Intellectual property", IDS[5]],
  ],
} as const;

// -----------------------------------------------------------------------------
// TOC (localized)
// -----------------------------------------------------------------------------
const Toc: React.FC<{ activeId: string | null; lang: Lang }> = ({
  activeId,
  lang,
}) => (
  <nav
    aria-label={lang === "fr" ? "Sommaire" : "Table of contents"}
    className="rounded-xs bg-mbg-black p-4 ring-1 ring-mbg-black/7"
  >
    <p className="mb-2 text-base font-bold uppercase tracking-wide text-mbg-green">
      {lang === "fr" ? "Sommaire" : "Summary"}
    </p>
    <ol className="space-y-1 text-xs text-mbg-darkgrey uppercase font-semibold leading-6">
      {tocItems[lang].map(([no, label, id]) => (
        <li key={id as string}>
          <a
            className={`hover:underline hover:text-mbg-lightgrey hoverEffect ${
              activeId === id ? "text-mbg-green" : ""
            }`}
            href={`#${id}`}
          >
            <span className="mr-2 tabular-nums">{no}</span>
            {label}
          </a>
        </li>
      ))}
    </ol>
  </nav>
);

// -----------------------------------------------------------------------------
// Collapsible section wrapper
// -----------------------------------------------------------------------------
const Section: React.FC<{
  id: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  forceOpen?: boolean;
}> = ({ id, title, children, defaultOpen = true, forceOpen }) => {
  const open = typeof forceOpen === "boolean" ? forceOpen : defaultOpen;
  return (
    <section id={id} className="print:break-before-page text-xs scroll-mt-20">
      <details
        className="group rounded-xs border border-mbg-black/7 bg-mbg-white open:bg-mbg-rgbablank transition"
        open={open}
      >
        <summary className="flex w-full cursor-pointer select-none items-center justify-between gap-3 px-4 py-3">
          <H3 className="text-base text-mbg-green m-0">{title}</H3>
          <span
            aria-hidden
            className="ml-auto text-mbg-darkgrey text-[10px] font-semibold uppercase group-open:rotate-180 transition"
          >
            <BiSolidBasketball className="mbg-icon" />
          </span>
        </summary>
        <Separator className="bg-mbg-black/10" />
        <div className="px-4 py-4 flex flex-col items-start gap-2 text-mbg-black/95">
          {children}
        </div>
      </details>
    </section>
  );
};

// -----------------------------------------------------------------------------
// Localized legal content
// -----------------------------------------------------------------------------
const ContentEN: React.FC<{ allOpen: boolean | null }> = ({ allOpen }) => (
  <>
    <Section
      id="identification-de-lediteur"
      forceOpen={allOpen ?? undefined}
      title="1. Publisher identification"
    >
      <p className="uppercase font-semibold text-mbg-green">
        Full name: {LEGAL_INFO.fullName}
      </p>
      <p className="uppercase font-semibold text-mbg-green">
        Legal form: {LEGAL_INFO.legalFormEN}
      </p>
      <p className="uppercase font-semibold text-mbg-green">
        Business name: {LEGAL_INFO.businessName}
      </p>
      <p>Domain name: {LEGAL_INFO.domain}</p>
      <p>SIREN: {LEGAL_INFO.siren}</p>
      <p>APE code: {LEGAL_INFO.ape}</p>
      <p>
        Professional address:{" "}
        <strong className="text-mbg-green">{LEGAL_INFO.businessAddressEN}</strong>
      </p>
    </Section>

    <Section
      id="coordonnees-contact"
      forceOpen={allOpen ?? undefined}
      title="2. Contact details"
    >
      <ul className="list-disc space-y-1 pl-6">
        <li>
          Phone:{" "}
          <a className="mbg-link" href={LEGAL_INFO.phoneHref}>
            {LEGAL_INFO.phoneDisplay}
          </a>
        </li>
        <li>
          Email:{" "}
          <a className="mbg-link" href={`mailto:${LEGAL_INFO.email}`}>
            {LEGAL_INFO.email}
          </a>
        </li>
      </ul>
    </Section>

    <Section
      id="directeur-de-la-publication"
      forceOpen={allOpen ?? undefined}
      title="3. Publication director"
    >
      <p>
        Publication director: {LEGAL_INFO.fullName}, {LEGAL_INFO.legalFormEN}.
      </p>
    </Section>

    <Section id="hebergeur" forceOpen={allOpen ?? undefined} title="4. Hosting">
      <p>{LEGAL_INFO.hostingName}</p>
      <p>{LEGAL_INFO.hostingAddress}</p>
      <p>
        Phone:{" "}
        <a className="mbg-link" href={LEGAL_INFO.hostingPhoneHref}>
          {LEGAL_INFO.hostingPhoneDisplay}
        </a>
      </p>
      <p>
        Website:{" "}
        <a
          className="mbg-link"
          href={LEGAL_INFO.hostingUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          vercel.com
        </a>
      </p>
    </Section>

    <Section
      id="immatriculation-fiscalite-rep"
      forceOpen={allOpen ?? undefined}
      title="5. Registration, VAT & EPR"
    >
      <p>
        Business registration:{" "}
        <strong className="text-mbg-green">{LEGAL_INFO.rneRegistrationEN}</strong>
      </p>
      <p>
        VAT: VAT not applicable — article 293 B of the French General Tax Code
        (CGI), for as long as Milos BG benefits from the VAT exemption scheme.
      </p>
      <p>
        Textile EPR unique identifier (TLC), where applicable:{" "}
        <strong className="text-mbg-green">{LEGAL_INFO.repTextileIduEN}</strong>
      </p>
    </Section>

    <Section
      id="propriete-intellectuelle"
      forceOpen={allOpen ?? undefined}
      title="6. Intellectual property"
    >
      <p>
        Unless otherwise stated, the structure, texts, visual identity, photos,
        illustrations, graphics, videos, logos and other original content
        published on this website are protected by intellectual property law
        and remain the property of Milos BG or their respective rights holders.
        Any reproduction, adaptation or exploitation beyond the exceptions
        provided by law requires prior authorization.
      </p>
    </Section>
  </>
);

const ContentFR: React.FC<{ allOpen: boolean | null }> = ({ allOpen }) => (
  <>
    <Section
      id="identification-de-lediteur"
      forceOpen={allOpen ?? undefined}
      title="1. Identification de l’éditeur"
    >
      <p className="uppercase font-semibold text-mbg-green">
        Nom complet : {LEGAL_INFO.fullName}
      </p>
      <p className="uppercase font-semibold text-mbg-green">
        Forme juridique : {LEGAL_INFO.legalFormFR}
      </p>
      <p className="uppercase font-semibold text-mbg-green">
        Nom commercial : {LEGAL_INFO.businessName}
      </p>
      <p>Nom de domaine : {LEGAL_INFO.domain}</p>
      <p>SIREN : {LEGAL_INFO.siren}</p>
      <p>Code APE : {LEGAL_INFO.ape}</p>
      <p>
        Adresse professionnelle :{" "}
        <strong className="text-mbg-green">{LEGAL_INFO.businessAddressFR}</strong>
      </p>
    </Section>

    <Section
      id="coordonnees-contact"
      forceOpen={allOpen ?? undefined}
      title="2. Coordonnées & Contact"
    >
      <ul className="list-disc space-y-1 pl-6">
        <li>
          Téléphone :{" "}
          <a className="mbg-link" href={LEGAL_INFO.phoneHref}>
            {LEGAL_INFO.phoneDisplay}
          </a>
        </li>
        <li>
          Courriel :{" "}
          <a className="mbg-link" href={`mailto:${LEGAL_INFO.email}`}>
            {LEGAL_INFO.email}
          </a>
        </li>
      </ul>
    </Section>

    <Section
      id="directeur-de-la-publication"
      forceOpen={allOpen ?? undefined}
      title="3. Directeur de la publication"
    >
      <p>
        Directeur de la publication : {LEGAL_INFO.fullName},{" "}
        {LEGAL_INFO.legalFormFR}.
      </p>
    </Section>

    <Section
      id="hebergeur"
      forceOpen={allOpen ?? undefined}
      title="4. Hébergement"
    >
      <p>{LEGAL_INFO.hostingName}</p>
      <p>{LEGAL_INFO.hostingAddress}</p>
      <p>
        Téléphone :{" "}
        <a className="mbg-link" href={LEGAL_INFO.hostingPhoneHref}>
          {LEGAL_INFO.hostingPhoneDisplay}
        </a>
      </p>
      <p>
        Site :{" "}
        <a
          className="mbg-link"
          href={LEGAL_INFO.hostingUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          vercel.com
        </a>
      </p>
    </Section>

    <Section
      id="immatriculation-fiscalite-rep"
      forceOpen={allOpen ?? undefined}
      title="5. Immatriculation, TVA & REP"
    >
      <p>
        Immatriculation :{" "}
        <strong className="text-mbg-green">{LEGAL_INFO.rneRegistrationFR}</strong>
      </p>
      <p>
        TVA : TVA non applicable — article 293 B du CGI, tant que Milos BG
        bénéficie de la franchise en base de TVA.
      </p>
      <p>
        Identifiant unique REP textile (TLC), lorsque applicable :{" "}
        <strong className="text-mbg-green">{LEGAL_INFO.repTextileIduFR}</strong>
      </p>
    </Section>

    <Section
      id="propriete-intellectuelle"
      forceOpen={allOpen ?? undefined}
      title="6. Propriété intellectuelle"
    >
      <p>
        Sauf mention contraire, la structure, les textes, l’identité visuelle,
        les photographies, illustrations, graphismes, vidéos, logos et autres
        contenus originaux publiés sur le Site sont protégés par le droit de la
        propriété intellectuelle et demeurent la propriété de Milos BG ou de
        leurs titulaires respectifs. Toute reproduction, adaptation ou
        exploitation au-delà des exceptions prévues par la loi nécessite une
        autorisation préalable.
      </p>
    </Section>
  </>
);

// -----------------------------------------------------------------------------
// Page component
// -----------------------------------------------------------------------------
const LegalNotice: React.FC = () => {
  const [lang, setLang] = useLang();

  // Global expand/collapse control
  const [allOpen, setAllOpen] = useState<boolean | null>(null);
  // Active section highlighting
  const [activeId, setActiveId] = useState<string | null>(null);
  // Back-to-top visibility
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Read initial expand state from URL (?open=all|none)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const open = params.get("open");
    if (open === "all") setAllOpen(true);
    if (open === "none") setAllOpen(false);
  }, []);

  // Persist expand state to URL
  useEffect(() => {
    if (allOpen === null) return;
    const params = new URLSearchParams(window.location.search);
    params.set("open", allOpen ? "all" : "none");
    const url = `${window.location.pathname}?${params.toString()}${
      window.location.hash
    }`;
    window.history.replaceState({}, "", url);
  }, [allOpen]);

  // IntersectionObserver to highlight TOC
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if ((visible?.target as HTMLElement)?.id)
          setActiveId((visible!.target as HTMLElement).id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0.2, 0.5, 0.75] },
    );
    IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const allOpenBool = allOpen === true;

  const ui = useMemo(
    () => ({
      breadcrumbHome: lang === "fr" ? "Accueil" : "Home",
      breadcrumbCurrent: lang === "fr" ? "Mentions légales" : "Legal notice",
      backToShop: lang === "fr" ? "← Retour à la boutique" : "← Back to shop",
      expandAll: lang === "fr" ? "Déplier tout" : "Expand all",
      collapseAll: lang === "fr" ? "Replier tout" : "Collapse all",
      ariaExpandAll: lang === "fr" ? "Tout déplier" : "Expand all",
      ariaCollapseAll: lang === "fr" ? "Tout replier" : "Collapse all",
      pageTitle: lang === "fr" ? "Mentions légales" : "Legal notice",
      intro:
        lang === "fr" ? (
          <>
            Informations légales relatives à l’éditeur du site et aux modalités
            de contact.
          </>
        ) : (
          <>
            Legal information about the site publisher and ways to contact us.
          </>
        ),
      lastUpdateLabel:
        lang === "fr" ? "Dernière mise à jour :" : "Last update:",
      rights: lang === "fr" ? "Tous droits réservés" : "All rights reserved",
      tocAria: lang === "fr" ? "Fil d'Ariane" : "Breadcrumb",
    }),
    [lang],
  );

  return (
    <Container className="mt-4">
      {/* Breadcrumb + Back + Language toggle */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-mbg-black/7 px-4 py-2">
        <nav aria-label={ui.tocAria} className="text-[11px] text-mbg-darkgrey">
          <ol className="flex items-center gap-2">
            <li>
              <Link
                href="/products"
                className="text-mbg-green uppercase font-medium"
              >
                {ui.breadcrumbHome}
              </Link>
            </li>
            <li aria-hidden className="text-mbg-black bg-mbg-black">
              |
            </li>
            <li className="font-semibold uppercase text-mbg-black">
              {ui.breadcrumbCurrent}
            </li>
          </ol>
        </nav>
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <div className="inline-flex overflow-hidden rounded-xs border border-mbg-green">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-3 py-1.5 text-[12px] font-semibold uppercase transition ${
                lang === "en"
                  ? "bg-mbg-black text-mbg-white"
                  : "text-mbg-green hover:bg-mbg-green/10"
              }`}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang("fr")}
              className={`px-3 py-1.5 text-[12px] font-semibold uppercase transition ${
                lang === "fr"
                  ? "bg-mbg-black text-mbg-white"
                  : "text-mbg-green hover:bg-mbg-green/10"
              }`}
              aria-pressed={lang === "fr"}
            >
              FR
            </button>
          </div>

          {/* Back to shop */}
          <Link
            href="/products"
            className="inline-flex bg-mbg-rgbablank items-center rounded-xs border border-mbg-green px-3 py-1.5 text-[12px] font-semibold text-mbg-green hover:bg-mbg-green hover:text-mbg-white hoverEffect uppercase transition"
          >
            {ui.backToShop}
          </Link>
        </div>
      </div>

      <H2>{ui.pageTitle}</H2>

      {/* Controls */}
      <div className="mt-2 mb-4 flex flex-wrap items-center gap-2">
        <Separator className="bg-mbg-black flex-1" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAllOpen(allOpenBool ? false : true)}
            className="rounded-xs border border-mbg-green px-3 py-1.5 text-[12px] font-semibold text-mbg-green hover:bg-mbg-green hover:text-mbg-white hoverEffect uppercase transition"
            aria-label={allOpenBool ? ui.ariaCollapseAll : ui.ariaExpandAll}
          >
            {allOpenBool ? ui.collapseAll : ui.expandAll}
          </button>
        </div>
      </div>

      {/* Title blurb */}
      <header className="mb-6">
        <H2 className="text-mbg-black tracking-tight m-0">Milos BG</H2>
        <p className="mt-2 text-xs">{ui.intro}</p>
      </header>

      {/* Mobile TOC */}
      <div className="mb-6 lg:hidden">
        <Toc activeId={activeId} lang={lang} />
      </div>

      {/* Layout: sticky TOC + content */}
      <div className="grid gap-6 lg:grid-cols-12">
        <aside className="hidden lg:block lg:col-span-4">
          <div className="lg:sticky lg:top-1">
            <Toc activeId={activeId} lang={lang} />
          </div>
        </aside>

        <div className="lg:col-span-8 space-y-6">
          {lang === "en" ? (
            <ContentEN allOpen={allOpen} />
          ) : (
            <ContentFR allOpen={allOpen} />
          )}

          <footer className="mt-12 border-t pt-6 text-[10px] text-mbg-green">
            <p>{ui.lastUpdateLabel}&nbsp;25/09/2026</p>
            <p className="mt-2">
              &copy; {new Date().getFullYear()} Milos BG - {ui.rights}
            </p>
          </footer>
        </div>
      </div>

      {/* Floating Back-to-Top */}
      {showTop && (
        <button
          type="button"
          aria-label={lang === "fr" ? "Revenir en haut" : "Back to top"}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 rounded-xs border border-mbg-green bg-mbg-white/90 px-3 py-2 text-[12px] font-semibold text-mbg-green shadow-sm backdrop-blur hover:bg-mbg-green hover:text-mbg-white hoverEffect uppercase transition"
        >
          ↑ {lang === "fr" ? "Haut de page" : "Top"}
        </button>
      )}
    </Container>
  );
};

export default LegalNotice;
