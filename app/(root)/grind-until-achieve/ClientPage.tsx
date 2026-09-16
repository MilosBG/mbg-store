"use client";

import Container from "@/components/mbg-components/Container";
import { H2 } from "@/components/mbg-components/H2";
import { H3 } from "@/components/mbg-components/H3";
import Separator from "@/components/mbg-components/Separator";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { BiSolidBasketball } from "react-icons/bi";
import { FiPhone, FiMail } from "react-icons/fi";

// -----------------------------------------------------------------------------
// Language helpers (persist to URL & localStorage, default to EN)
// -----------------------------------------------------------------------------
const LANG_STORAGE_KEY = "mbg.contact.lang" as const;
type Lang = "en" | "fr";

const useLang = (): [Lang, (l: Lang) => void] => {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("lang") as Lang | null;
    const fromStorage = (localStorage.getItem(LANG_STORAGE_KEY) as Lang | null) ?? null;
    const initial = (fromUrl || fromStorage || "en") as Lang;
    setLang(initial);
  }, []);

  useEffect(() => {
    if (!lang) return;
    const params = new URLSearchParams(window.location.search);
    params.set("lang", lang);
    const url = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
    window.history.replaceState({}, "", url);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    document?.documentElement?.setAttribute("lang", lang);
  }, [lang]);

  return [lang, setLang];
};

// -----------------------------------------------------------------------------
// Section IDs used for TOC + active-section highlighting
// -----------------------------------------------------------------------------
const IDS = ["coordonnees", "horaires", "faq", "retours"] as const;

// -----------------------------------------------------------------------------
// Localized TOC labels
// -----------------------------------------------------------------------------
const tocItems = {
  fr: [
    ["1.", "Coordonnées", IDS[0]],
    ["2.", "Horaires & délais", IDS[1]],
    ["3.", "FAQ (rapide)", IDS[2]],
    ["4.", "Retours & SAV", IDS[3]],
  ],
  en: [
    ["1.", "Contact details", IDS[0]],
    ["2.", "Hours & lead times", IDS[1]],
    ["3.", "Quick FAQ", IDS[2]],
    ["4.", "Returns & support", IDS[3]],
  ],
} as const;

// -----------------------------------------------------------------------------
// TOC (localized)
// -----------------------------------------------------------------------------
const Toc: React.FC<{ activeId: string | null; lang: Lang }> = ({ activeId, lang }) => (
  <nav aria-label={lang === "fr" ? "Sommaire" : "Table of contents"} className="rounded-xs bg-mbg-black p-4 ring-1 ring-mbg-black/7">
    <p className="mb-2 text-base font-bold uppercase tracking-wide text-mbg-green">{lang === "fr" ? "Sommaire" : "Summary"}</p>
    <ol className="space-y-1 text-xs text-mbg-darkgrey uppercase font-semibold leading-6">
      {tocItems[lang].map(([no, label, id]) => (
        <li key={id as string}>
          <a className={`hover:underline hover:text-mbg-lightgrey hoverEffect ${activeId === id ? "text-mbg-green" : ""}`} href={`#${id}`}>
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
const Section: React.FC<{ id: string; title: string; children: React.ReactNode; defaultOpen?: boolean; forceOpen?: boolean; }> = ({ id, title, children, defaultOpen = true, forceOpen }) => {
  const open = typeof forceOpen === "boolean" ? forceOpen : defaultOpen;
  return (
    <section id={id} className="print:break-before-page text-xs scroll-mt-20">
      <details className="group rounded-xs border border-mbg-black/7 bg-mbg-white open:bg-mbg-rgbablank transition" open={open}>
        <summary className="flex w-full cursor-pointer select-none items-center justify-between gap-3 px-4 py-3">
          <H3 className="text-base text-mbg-green m-0">{title}</H3>
          <span aria-hidden className="ml-auto text-mbg-darkgrey text-[10px] font-semibold uppercase group-open:rotate-180 transition">
            <BiSolidBasketball className="mbg-icon" />
          </span>
        </summary>
        <Separator className="bg-mbg-black/10" />
        <div className="px-4 py-4 flex flex-col items-start gap-3 text-mbg-black/95">{children}</div>
      </details>
    </section>
  );
};

// -----------------------------------------------------------------------------
// Content (EN full, FR concise placeholders for you to fill later)
// -----------------------------------------------------------------------------
const ContentEN: React.FC<{ allOpen: boolean | null }> = ({ allOpen }) => (
  <>
    <Section id="coordonnees" forceOpen={allOpen ?? undefined} title="1. Contact details">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3">
          <FiPhone className="mt-0.5" />
          <div>
            <p className="m-0 text-[12px] font-semibold uppercase text-mbg-darkgrey">Phone</p>
            <a className="mbg-link" href="tel:+33450458002">07 83 15 07 91</a>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <FiMail className="mt-0.5" />
          <div>
            <p className="m-0 text-[12px] font-semibold uppercase text-mbg-darkgrey">Email</p>
                   <a className="mbg-link" href="mailto:contact@milos-bg.com">contact@milos-bg.com</a>
          </div>
        </div>
      </div>
    </Section>

    <Section id="horaires" forceOpen={allOpen ?? undefined} title="2. Hours & lead times">
      <ul className="list-disc space-y-1 pl-6">
        <li>Customer support : Mon–Fri, 9:00–12:00 / 14:00–17:00 (CET).</li>
        <li>Shipping: orders placed before 14:00 ship the same day.</li>
      </ul>
    </Section>

    <Section id="faq" forceOpen={allOpen ?? undefined} title="3. Quick FAQ">
      <details className="w-full rounded-xs border border-mbg-black/7 bg-mbg-white">
        <summary className="cursor-pointer select-none px-3 py-2 text-[12px] font-semibold">How can I track my order?</summary>
        <div className="px-3 pb-3 text-mbg-black/95 text-xs">We send you the tracking link by email as well as your invoice once your order is shipped. You can see the progress of your order by going to “Orders” page in the basketball icon menu.</div>
      </details>
      <details className="w-full rounded-xs border border-mbg-black/7 bg-mbg-white">
        <summary className="cursor-pointer select-none px-3 py-2 text-[12px] font-semibold">How do I request a return?</summary>
        <div className="px-3 pb-3 text-mbg-black/95 text-xs">Contact support. Returns accepted within 14 days. See {" "}
        <Link className="mbg-link" href="/terms-conditions">Terms & Conditions</Link>.</div>
      </details>
    </Section>

    <Section id="retours" forceOpen={allOpen ?? undefined} title="4. Returns & support">
      <p>
        For returns/exchanges, include your order number (#) and the reason.For more precision see {" "}
        <Link className="mbg-link" href="/terms-conditions">Terms & Conditions</Link>.
      </p>
    </Section>
  </>
);

const ContentFR: React.FC<{ allOpen: boolean | null }> = ({ allOpen }) => (
  <>
    {/* Short placeholders — replace with your full FR text later if desired */}
    <Section id="coordonnees" forceOpen={allOpen ?? undefined} title="1. Coordonnées">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3">
          <FiPhone className="mt-0.5" />
          <div>
            <p className="m-0 text-[12px] font-semibold uppercase text-mbg-darkgrey">Téléphone</p>
            <a className="mbg-link" href="tel:+33450458002">07 83 15 07 91</a>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <FiMail className="mt-0.5" />
          <div>
            <p className="m-0 text-[12px] font-semibold uppercase text-mbg-darkgrey">Courriel</p>
            <a className="mbg-link" href="mailto:contact@milos-bg.com">contact@milos-bg.com</a>
          </div>
        </div>
      </div>
    </Section>

    <Section id="horaires" forceOpen={allOpen ?? undefined} title="2. Horaires & délais">
      <ul className="list-disc space-y-1 pl-6">
        <li>Service client : lundi → vendredi, 9h–12h / 14h–17h (CET).</li>
        <li>Expédition : commandes passées avant 14h expédiées le jour même.</li>
      </ul>
    </Section>

    <Section id="faq" forceOpen={allOpen ?? undefined} title="3. FAQ (rapide)">
      <details className="w-full rounded-xs border border-mbg-black/7 bg-mbg-white">
        <summary className="cursor-pointer select-none px-3 py-2 text-[12px] font-semibold">Comment suivre ma commande ?</summary>
        <div className="px-3 pb-3 text-mbg-black/95 text-xs">Nous vous envoyons un couriel de suivi de votre commande ainsi que votre facture une fois que votre commande est posté. Vous pouvez suivre la progression de votre commande en vous  rendant sur la page “Orders” qui se situe dans le menu ayant pour icône un ballon de basket.</div>
      </details>
      <details className="w-full rounded-xs border border-mbg-black/7 bg-mbg-white">
        <summary className="cursor-pointer select-none px-3 py-2 text-[12px] font-semibold">Comment demander un retour ?</summary>
        <div className="px-3 pb-3 text-mbg-black/95 text-xs">Contacter le service client. Retours sous 14 jours. Voir les {" "}
        <Link className="mbg-link" href="/terms-conditions">CGV</Link>.</div>
      </details>
    </Section>

    <Section id="retours" forceOpen={allOpen ?? undefined} title="4. Retours & SAV">
      <p>
        Pour les retours/échanges, indiquez votre n° de commande ainsi que le motif. Pour plus de précision voir les {" "}
        <Link className="mbg-link" href="/terms-conditions">CGV</Link>.
      </p>
    </Section>
  </>
);

// -----------------------------------------------------------------------------
// Page component
// -----------------------------------------------------------------------------
const Contact: React.FC = () => {
  const [lang, setLang] = useLang();

  const [allOpen, setAllOpen] = useState<boolean | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // IntersectionObserver to highlight TOC
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if ((visible?.target as HTMLElement)?.id) setActiveId((visible!.target as HTMLElement).id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0.2, 0.5, 0.75] }
    );
    IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const allOpenBool = allOpen === true;

  const ui = useMemo(() => ({
    breadcrumbHome: lang === "fr" ? "Accueil" : "Home",
    breadcrumbCurrent: lang === "fr" ? "Contact" : "Contact",
    backToShop: lang === "fr" ? "← Retour à la boutique" : "← Back to shop",
    expandAll: lang === "fr" ? "Déplier tout" : "Expand all",
    collapseAll: lang === "fr" ? "Replier tout" : "Collapse all",
    ariaExpandAll: lang === "fr" ? "Tout déplier" : "Expand all",
    ariaCollapseAll: lang === "fr" ? "Tout replier" : "Collapse all",
    pageTitle: "Contact",
    intro: lang === "fr"
      ? (<>Des questions sur une commande, un retour ou un vêtement fait main ? Écrivez‑nous, nous répondons généralement sous 24–48h ouvrées.</>)
      : (<>Questions about an order, a return, or handmade apparel? Write to us, we usually reply within 24–48 business hours.</>),
    lastUpdateLabel: lang === "fr" ? "Dernière mise à jour :" : "Last update:",
    rights: lang === "fr" ? "Tous droits réservés" : "All rights reserved",
    tocAria: lang === "fr" ? "Fil d'Ariane" : "Breadcrumb",
  }), [lang]);

  return (
    <Container className="mt-4">
      {/* Breadcrumb + Back + Language toggle */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-mbg-black/7 px-4 py-2">
        <nav aria-label={ui.tocAria} className="text-[11px] text-mbg-darkgrey">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="text-mbg-green uppercase font-medium">{ui.breadcrumbHome}</Link>
            </li>
            <li aria-hidden className="text-mbg-black bg-mbg-black">|</li>
            <li className="font-semibold uppercase text-mbg-black">{ui.breadcrumbCurrent}</li>
          </ol>
        </nav>
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <div className="inline-flex overflow-hidden rounded-xs border border-mbg-green">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-3 py-1.5 text-[12px] font-semibold uppercase transition ${lang === "en" ? "bg-mbg-black text-mbg-white" : "text-mbg-green hover:bg-mbg-green/10"}`}
              aria-pressed={lang === "en"}
            >EN</button>
            <button
              type="button"
              onClick={() => setLang("fr")}
              className={`px-3 py-1.5 text-[12px] font-semibold uppercase transition ${lang === "fr" ? "bg-mbg-black text-mbg-white" : "text-mbg-green hover:bg-mbg-green/10"}`}
              aria-pressed={lang === "fr"}
            >FR</button>
          </div>
          {/* Back to shop */}
          <Link
            href="/"
            className="inline-flex bg-mbg-rgbablank items-center rounded-xs border border-mbg-green px-3 py-1.5 text-[12px] font-semibold text-mbg-green hover:bg-mbg-green hover:text-mbg-white hoverEffect uppercase transition"
          >
            {ui.backToShop}
          </Link>
        </div>
      </div>

      <H2>{ui.pageTitle}</H2>
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

      <header className="mb-6">
        <H2 className="text-mbg-black tracking-tight m-0">Milos BG</H2>
        <p className="mt-2 text-xs">{ui.intro}</p>
      </header>

      {/* Mobile TOC */}
      <div className="mb-6 lg:hidden">
        <Toc activeId={activeId} lang={lang} />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <aside className="hidden lg:block lg:col-span-4">
          <div className="lg:sticky lg:top-1">
            <Toc activeId={activeId} lang={lang} />
          </div>
        </aside>

        <div className="lg:col-span-8 space-y-6">
          {lang === "en" ? <ContentEN allOpen={allOpen} /> : <ContentFR allOpen={allOpen} />}

          <footer className="mt-12 border-t pt-6 text-[10px] text-mbg-green">
            <p>
              {ui.lastUpdateLabel}&nbsp;23/09/2025
            </p>
            <p className="mt-2">&copy; {new Date().getFullYear()} Milos BG - {ui.rights}</p>
          </footer>
        </div>
      </div>

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

export default Contact;
