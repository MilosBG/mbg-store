"use client";

import Container from "@/components/mbg-components/Container";
import { GrindUntilAchieve2 } from "@/images";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clock3,
  Copy,
  Headphones,
  Mail,
  MessageCircle,
  PackageCheck,
  Phone,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

type Lang = "en" | "fr";
type SectionId = "details" | "hours" | "faq" | "returns";

const LANG_STORAGE_KEY = "mbg.contact.lang";
const CONTACT_EMAIL = "contact@milos-bg.com";
const CONTACT_PHONE = "07 83 15 07 91";
// The old file displayed this mobile number but called a different number.
const CONTACT_PHONE_LINK = "tel:+33783150791";
const SECTION_ORDER: SectionId[] = ["details", "hours", "faq", "returns"];

const CONTENT = {
  en: {
    home: "Home",
    current: "Contact",
    shop: "Back to shop",
    language: "Language",
    kicker: "MILOS BG / LET'S CONNECT",
    heroLine1: "EVERY JOURNEY",
    heroLine2: "NEEDS A CONVERSATION.",
    heroDescription:
      "A question about an order, a handcrafted piece or a possible collaboration? The next chapter can start right here.",
    heroNote: "One message. One connection. One step forward.",
    emailAction: "Write to us",
    callAction: "Call us",
    contactPanelKicker: "DIRECT LINE",
    contactPanelTitle: "We're here to listen.",
    contactPanelText:
      "Tell us what you need. We'll help you find the right next step.",
    emailLabel: "Email",
    phoneLabel: "Phone",
    sectionKicker: "YOUR NEXT MOVE",
    sectionTitle: "HOW CAN WE HELP?",
    sectionDescription:
      "Choose a topic or explore the details below. Everything you need, without the detours.",
    allOpen: "Expand all",
    allClose: "Collapse all",
    toc: "On this page",
    tocEyebrow: "QUICK NAVIGATION",
    nav: {
      details: "Contact details",
      hours: "Hours & lead times",
      faq: "Frequently asked",
      returns: "Returns & support",
    },
    accordion: {
      details: "01 / REACH OUT",
      hours: "02 / THE RIGHT TIME",
      faq: "03 / FIND AN ANSWER",
      returns: "04 / WE'VE GOT YOU",
    },
    detailsIntro:
      "Choose the channel that feels easiest. Both lead to the Milos BG team.",
    copy: "Copy email",
    copied: "Copied",
    mailSubject: "Question for Milos BG",
    quickTopicsTitle: "WHAT'S YOUR QUESTION ABOUT?",
    quickTopics: [
      { label: "My order", subject: "Question about my Milos BG order" },
      { label: "Returns", subject: "Milos BG return or exchange" },
      { label: "Partnership", subject: "Milos BG partnership enquiry" },
    ],
    hoursTitle: "Customer support",
    days: "Monday – Friday",
    times: "09:00–12:00 / 14:00–17:00",
    timeZone: "France local time",
    shippingTitle: "Order dispatch",
    shippingText:
      "The published dispatch schedule indicates that orders placed before 14:00 ship the same day. Made-to-order pieces may require production confirmation and a different timeline.",
    replyNote:
      "We generally aim to respond within 24–48 business hours.",
    faqItems: [
      {
        q: "How can I track my order?",
        a: "A tracking link and your invoice are sent by email when your order ships. You can also check the Orders page from the basketball icon menu.",
      },
      {
        q: "How can I request a return?",
        a: "Contact us with your order number and the reason for your request. The stated return period is 14 days, subject to the applicable Terms & Conditions.",
      },
      {
        q: "Can I request a different clothing size?",
        a: "M, L and S are our standard artisan production sizes. Other sizes are made on request, subject to confirmation.",
      },
      {
        q: "Can I contact Milos BG about a partnership?",
        a: "Yes. Send an email outlining your idea and include any useful links or relevant project details.",
      },
    ],
    returnsLead:
      "Something isn't right with an order? Let's work through it together.",
    returnSteps: [
      { title: "Find your order number", text: "Include the reference from your order confirmation." },
      { title: "Explain the situation", text: "Tell us the reason for your return or exchange request." },
      { title: "Send us an email", text: "We'll review your request under the applicable conditions." },
    ],
    termsIntro: "Please review the applicable conditions and any exceptions before requesting a return.",
    terms: "Read Terms & Conditions",
    sizes: "Size guide",
    returnsAction: "Request support",
    returnsSubject: "Help with a Milos BG order / return",
    closingKicker: "GRIND UNTIL ACHIEVE",
    closingTitle: "YOUR JOURNEY MATTERS.",
    closingText:
      "Every question is part of the process. Every exchange is an opportunity to move forward.",
    closingAction: "Start a conversation",
    rights: "All rights reserved",
    backTop: "Back to top",
  },
  fr: {
    home: "Accueil",
    current: "Contact",
    shop: "Retour à la boutique",
    language: "Langue",
    kicker: "MILOS BG / ÉCHANGEONS",
    heroLine1: "CHAQUE PARCOURS",
    heroLine2: "MÉRITE UN ÉCHANGE.",
    heroDescription:
      "Une question concernant une commande, une pièce artisanale ou une éventuelle collaboration ? Le prochain chapitre peut commencer ici.",
    heroNote: "Un message. Une rencontre. Un pas de plus.",
    emailAction: "Nous écrire",
    callAction: "Nous appeler",
    contactPanelKicker: "CONTACT DIRECT",
    contactPanelTitle: "Nous sommes à votre écoute.",
    contactPanelText:
      "Expliquez-nous votre besoin. Nous vous aiderons à trouver la prochaine étape.",
    emailLabel: "E-mail",
    phoneLabel: "Téléphone",
    sectionKicker: "PROCHAINE ÉTAPE",
    sectionTitle: "COMMENT VOUS AIDER ?",
    sectionDescription:
      "Choisissez un sujet ou consultez les informations ci-dessous. L'essentiel, sans détour.",
    allOpen: "Tout déplier",
    allClose: "Tout replier",
    toc: "Dans cette page",
    tocEyebrow: "NAVIGATION RAPIDE",
    nav: {
      details: "Coordonnées",
      hours: "Horaires et délais",
      faq: "Questions fréquentes",
      returns: "Retours et SAV",
    },
    accordion: {
      details: "01 / PRENDRE CONTACT",
      hours: "02 / LE BON MOMENT",
      faq: "03 / TROUVER UNE RÉPONSE",
      returns: "04 / VOUS ACCOMPAGNER",
    },
    detailsIntro:
      "Choisissez le moyen le plus simple pour vous. Dans les deux cas, vous contactez Milos BG.",
    copy: "Copier l'e-mail",
    copied: "Copié",
    mailSubject: "Question pour Milos BG",
    quickTopicsTitle: "QUEL EST LE SUJET DE VOTRE DEMANDE ?",
    quickTopics: [
      { label: "Ma commande", subject: "Question concernant ma commande Milos BG" },
      { label: "Retours", subject: "Retour ou échange Milos BG" },
      { label: "Partenariat", subject: "Proposition de partenariat Milos BG" },
    ],
    hoursTitle: "Service client",
    days: "Du lundi au vendredi",
    times: "09 h–12 h / 14 h–17 h",
    timeZone: "Heure locale française",
    shippingTitle: "Expédition des commandes",
    shippingText:
      "Les informations de livraison publiées indiquent une expédition le jour même pour les commandes passées avant 14 h. Les pièces réalisées sur demande peuvent nécessiter une confirmation de production et des délais différents.",
    replyNote:
      "Nous essayons généralement de répondre sous 24 à 48 heures ouvrées.",
    faqItems: [
      {
        q: "Comment suivre ma commande ?",
        a: "Un lien de suivi et votre facture vous sont envoyés par e-mail lors de l'expédition. Vous pouvez aussi consulter la page Commandes depuis le menu avec l'icône de basketball.",
      },
      {
        q: "Comment demander un retour ?",
        a: "Contactez-nous en indiquant le numéro de commande et le motif de votre demande. Le délai annoncé est de 14 jours, sous réserve des conditions générales applicables.",
      },
      {
        q: "Puis-je demander une autre taille ?",
        a: "Les tailles artisanales standards sont M, L et S. Les autres tailles sont réalisables sur demande, après confirmation.",
      },
      {
        q: "Puis-je proposer un partenariat ?",
        a: "Oui. Envoyez-nous un e-mail présentant votre idée, ainsi que les liens ou détails utiles à votre projet.",
      },
    ],
    returnsLead:
      "Un problème avec une commande ? Examinons ensemble les solutions possibles.",
    returnSteps: [
      { title: "Retrouvez votre numéro", text: "Indiquez la référence figurant sur votre confirmation de commande." },
      { title: "Précisez votre demande", text: "Décrivez le motif du retour ou de l'échange souhaité." },
      { title: "Envoyez-nous un e-mail", text: "Nous étudierons votre demande selon les conditions applicables." },
    ],
    termsIntro: "Consultez les conditions applicables et les éventuelles exclusions avant toute demande de retour.",
    terms: "Consulter les CGV",
    sizes: "Guide des tailles",
    returnsAction: "Demander de l'aide",
    returnsSubject: "Aide pour une commande / un retour Milos BG",
    closingKicker: "GRIND UNTIL ACHIEVE",
    closingTitle: "VOTRE PARCOURS COMPTE.",
    closingText:
      "Chaque question fait partie du chemin. Chaque échange est une occasion d'avancer.",
    closingAction: "Engager la conversation",
    rights: "Tous droits réservés",
    backTop: "Revenir en haut",
  },
} as const;

function useContactLanguage(): [Lang, (language: Lang) => void] {
  const [lang, setLang] = useState<Lang>("en");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get("lang");
    const storedLang = window.localStorage.getItem(LANG_STORAGE_KEY);
    const initial: Lang =
      urlLang === "en" || urlLang === "fr"
        ? urlLang
        : storedLang === "en" || storedLang === "fr"
          ? storedLang
          : "en";
    setLang(initial);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    const url = new URL(window.location.href);
    if (lang === "fr") url.searchParams.set("lang", "fr");
    else url.searchParams.delete("lang");
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    window.localStorage.setItem(LANG_STORAGE_KEY, lang);
  }, [lang, ready]);

  return [lang, setLang];
}

const emptySections: Record<SectionId, boolean> = {
  details: false,
  hours: false,
  faq: false,
  returns: false,
};

const focusStyle =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00821A]";

function AccordionSection({
  id,
  number,
  label,
  kicker,
  open,
  onToggle,
  children,
}: {
  id: SectionId;
  number: string;
  label: string;
  kicker: string;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`scroll-mt-24 overflow-hidden border transition-[border-color,background-color] duration-300 ${open ? "border-[#00821A]/55 bg-[#141814]" : "border-white/10 bg-[#111311] hover:border-white/25"}`}
    >
      <h3 id={`${id}-heading`}>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={`${id}-content`}
          onClick={onToggle}
          className={`flex w-full items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-white/[0.035] sm:gap-5 sm:px-6 sm:py-5 ${focusStyle}`}
        >
          <span className={`flex size-10 shrink-0 items-center justify-center border text-[11px] font-black tabular-nums sm:size-11 ${open ? "border-[#00821A] bg-[#00821A] text-white" : "border-[#00821A]/50 text-[#00821A]"}`}>
            {number}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[9px] font-bold uppercase tracking-[0.13em] text-[#00821A] sm:text-[10px]">{kicker}</span>
            <span className="mt-1 block text-[13px] font-bold uppercase tracking-[0.035em] text-white sm:text-base">{label}</span>
          </span>
          <span className={`flex size-9 shrink-0 items-center justify-center border transition-colors ${open ? "border-[#00821A] bg-[#00821A] text-white" : "border-white/20 text-white/70"}`}>
            <ChevronDown size={18} aria-hidden="true" className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
          </span>
        </button>
      </h3>
      {open && (
        <div id={`${id}-content`} role="region" aria-labelledby={`${id}-heading`} className="mbg-contact-reveal border-t border-white/10 px-4 py-6 sm:px-6 sm:py-7">
          {children}
        </div>
      )}
    </section>
  );
}

export default function ClientPage() {
  const [lang, setLang] = useContactLanguage();
  const copy = CONTENT[lang];
  const [expanded, setExpanded] = useState<Record<SectionId, boolean>>(emptySections);
  const [activeSection, setActiveSection] = useState<SectionId | null>(null);
  const [showTop, setShowTop] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const allExpanded = SECTION_ORDER.every((id) => expanded[id]);

  const navItems = useMemo(
    () => SECTION_ORDER.map((id, index) => ({ id, number: `0${index + 1}`, label: copy.nav[id] })),
    [copy],
  );

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveSection(visible.target.id as SectionId);
      },
      { rootMargin: "-18% 0px -65% 0px", threshold: 0 },
    );
    SECTION_ORDER.forEach((id) => {
      const section = document.getElementById(id);
      if (section) observer.observe(section);
    });
    return () => observer.disconnect();
  }, []);

  const toggleSection = (id: SectionId) => {
    setExpanded((previous) => ({ ...previous, [id]: !previous[id] }));
  };

  const expandAll = () => {
    const next = !allExpanded;
    setExpanded({ details: next, hours: next, faq: next, returns: next });
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setCopiedEmail(true);
    } catch {
      setCopiedEmail(false);
    }
  };

  const mailLink = (subject: string) =>
    `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;

  return (
    <main className="min-h-screen overflow-x-clip bg-[#080A08] font-kanit text-white selection:bg-[#00821A] selection:text-white">
      <Container className="pb-14 pt-4 sm:pb-20 sm:pt-6">
        {/* Breadcrumb + language switch */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-white/[0.035] px-3 py-3 sm:px-5">
          <nav aria-label={lang === "fr" ? "Fil d'Ariane" : "Breadcrumb"} className="min-w-0 text-[10px] font-semibold uppercase tracking-[0.08em] sm:text-xs">
            <ol className="flex min-w-0 items-center gap-2 sm:gap-3">
              <li><Link href="/" className={`text-white/55 transition-colors hover:text-[#00821A] ${focusStyle}`}>{copy.home}</Link></li>
              <li aria-hidden="true" className="text-[#00821A]">/</li>
              <li className="truncate text-white">{copy.current}</li>
            </ol>
          </nav>
          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
            <div role="group" aria-label={copy.language} className="inline-flex border border-white/15 bg-black p-0.5">
              {(["en", "fr"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={lang === value}
                  onClick={() => setLang(value)}
                  className={`min-h-9 min-w-10 px-3 text-[11px] font-black uppercase transition-colors ${focusStyle} ${lang === value ? "bg-[#00821A] text-white" : "text-white/60 hover:bg-white/10 hover:text-white"}`}
                >
                  {value}
                </button>
              ))}
            </div>
            <Link href="/products" className={`inline-flex min-h-10 items-center gap-2 border border-white/20 px-3 text-[10px] font-bold uppercase text-white/80 transition-colors hover:border-[#00821A] hover:text-white sm:px-4 ${focusStyle}`}>
              {copy.shop}<ArrowUpRight size={14} aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* Editorial hero */}
        <header className="mbg-contact-enter relative isolate mb-8 overflow-hidden border border-white/10 bg-[#0D120E] px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_85%_18%,rgba(0,130,26,0.18),transparent_55%)]" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-36 flex size-[310px] items-center justify-center rounded-full border border-white/10 sm:size-[440px]">
            <Image src={GrindUntilAchieve2} alt="" width={210} height={210} className="mbg-contact-float size-[115px] object-contain opacity-20 sm:size-[185px]" />
          </div>
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-52 -right-28 size-[330px] rounded-full border border-[#00821A]/15 sm:size-[500px]" />
          <div className="relative z-10 grid min-w-0 gap-9 lg:grid-cols-[minmax(0,1.28fr)_minmax(290px,.72fr)] lg:items-end lg:gap-10">
            <div className="min-w-0">
              <div className="mb-6 flex items-center gap-3">
                <span className="h-[3px] w-9 bg-[#00821A]" aria-hidden="true" />
                <span className="text-[10px] font-bold uppercase tracking-[0.19em] text-white/65">{copy.kicker}</span>
              </div>
              <h1 className="max-w-[850px] text-[clamp(1.85rem,6.4vw,4.5rem)] font-black uppercase leading-[0.99] tracking-[-0.045em] [text-wrap:balance]">
                <span className="block">{copy.heroLine1}</span>
                <span className="mt-2 block text-[#00821A]">{copy.heroLine2}</span>
              </h1>
              <div aria-hidden="true" className="mt-7 h-px w-full max-w-lg bg-gradient-to-r from-[#00821A] via-white/20 to-transparent" />
              <p className="mt-6 max-w-xl text-[13px] leading-6 text-white/75 sm:text-sm sm:leading-7">{copy.heroDescription}</p>
              <div className="mt-6 flex flex-wrap gap-2 sm:mt-8">
                <a href={mailLink(copy.mailSubject)} className={`group inline-flex min-h-11 items-center justify-center gap-2 bg-[#00821A] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.05em] text-white transition-colors hover:bg-white hover:text-black ${focusStyle}`}>
                  <Mail size={16} aria-hidden="true" />{copy.emailAction}<ArrowUpRight size={14} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
                </a>
                <a href={CONTACT_PHONE_LINK} className={`inline-flex min-h-11 items-center justify-center gap-2 border border-white/30 px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.05em] text-white transition-colors hover:border-[#00821A] hover:bg-[#00821A]/10 ${focusStyle}`}>
                  <Phone size={15} aria-hidden="true" />{copy.callAction}
                </a>
              </div>
              <p className="mt-6 text-[10px] font-medium uppercase tracking-[0.13em] text-white/40">{copy.heroNote}</p>
            </div>

            <div className="border border-white/15 bg-black/70 p-5 backdrop-blur-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#00821A]">{copy.contactPanelKicker}</p>
                <MessageCircle size={19} className="text-[#00821A]" aria-hidden="true" />
              </div>
              <h2 className="text-xl font-extrabold uppercase leading-tight tracking-[-0.025em] sm:text-2xl">{copy.contactPanelTitle}</h2>
              <p className="mt-3 text-xs leading-6 text-white/60">{copy.contactPanelText}</p>
              <div className="mt-6 space-y-4 border-t border-white/10 pt-5">
                <div className="flex min-w-0 items-start gap-3">
                  <Mail size={17} className="mt-0.5 shrink-0 text-[#00821A]" aria-hidden="true" />
                  <div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[0.13em] text-white/45">{copy.emailLabel}</p><a href={`mailto:${CONTACT_EMAIL}`} className={`mt-1 block break-all text-xs font-bold text-white hover:text-[#00821A] ${focusStyle}`}>{CONTACT_EMAIL}</a></div>
                </div>
                <div className="flex min-w-0 items-start gap-3">
                  <Phone size={17} className="mt-0.5 shrink-0 text-[#00821A]" aria-hidden="true" />
                  <div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[0.13em] text-white/45">{copy.phoneLabel}</p><a href={CONTACT_PHONE_LINK} className={`mt-1 block text-xs font-bold text-white hover:text-[#00821A] ${focusStyle}`}>{CONTACT_PHONE}</a></div>
                </div>
              </div>
            </div>
          </div>
          <div aria-hidden="true" className="absolute bottom-0 left-0 h-[3px] w-[24%] bg-[#00821A]" />
        </header>

        {/* Navigation / sections */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-5">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#00821A]">{copy.sectionKicker}</p>
            <h2 className="mt-1 text-lg font-extrabold uppercase tracking-[-0.02em] sm:text-2xl">{copy.sectionTitle}</h2>
            <p className="mt-2 max-w-xl text-xs leading-6 text-white/55">{copy.sectionDescription}</p>
          </div>
          <button onClick={expandAll} type="button" className={`inline-flex min-h-10 items-center gap-2 border border-[#00821A]/75 px-4 text-[10px] font-bold uppercase tracking-[0.06em] text-white transition-colors hover:bg-[#00821A] ${focusStyle}`}>
            {allExpanded ? <RotateCcw size={14} aria-hidden="true" /> : <ArrowRight size={14} aria-hidden="true" />}
            {allExpanded ? copy.allClose : copy.allOpen}
          </button>
        </div>

        <div className="grid min-w-0 gap-5 lg:grid-cols-[minmax(225px,.32fr)_minmax(0,1fr)] lg:gap-7">
          <aside className="min-w-0 lg:sticky lg:top-5 lg:self-start">
            <nav aria-label={copy.toc} className="border border-white/10 bg-[#111311] p-4 sm:p-5">
              <div aria-hidden="true" className="mb-4 h-[3px] w-12 bg-[#00821A]" />
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-[#00821A]">{copy.tocEyebrow}</p>
              <p className="mt-1 text-sm font-bold uppercase text-white">{copy.toc}</p>
              <ol className="mt-5 grid grid-cols-2 gap-2 border-t border-white/10 pt-4 lg:grid-cols-1 lg:gap-1">
                {navItems.map(({ id, number, label }) => (
                  <li key={id}>
                    <a
                      href={`#${id}`}
                      onClick={() => { setActiveSection(id); setExpanded((previous) => ({ ...previous, [id]: true })); }}
                      aria-current={activeSection === id ? "location" : undefined}
                      className={`group flex min-h-11 min-w-0 items-center gap-2 border-l-2 px-2 py-2 text-[10px] font-bold uppercase leading-4 transition-colors sm:gap-3 sm:px-3 ${focusStyle} ${activeSection === id ? "border-[#00821A] bg-[#00821A]/10 text-white" : "border-transparent text-white/65 hover:border-[#00821A]/60 hover:bg-white/[0.04] hover:text-white"}`}
                    >
                      <span className="shrink-0 text-[#00821A]">{number}</span>
                      <span className="min-w-0 flex-1">{label}</span>
                      <ArrowUpRight size={13} className="hidden shrink-0 opacity-0 transition-opacity group-hover:opacity-100 sm:block" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ol>
              <div className="mt-5 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4 text-[9px] font-semibold uppercase tracking-[0.09em] text-white/35">
                {(["GRIND", "RESILIENCE", "CONSISTENCY", "FOCUS", "ACHIEVE"] as const).map((word, index) => (
                  <span key={word} className="inline-flex items-center gap-2">{index > 0 && <span className="text-[#00821A]">✿</span>}{word}</span>
                ))}
              </div>
            </nav>
          </aside>

          <div className="min-w-0 space-y-3 sm:space-y-4">
            <AccordionSection id="details" number="01" label={copy.nav.details} kicker={copy.accordion.details} open={expanded.details} onToggle={() => toggleSection("details")}>
              <p className="max-w-2xl text-xs leading-6 text-white/70 sm:text-sm">{copy.detailsIntro}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <a href={`mailto:${CONTACT_EMAIL}`} className={`group flex min-w-0 items-start gap-3 border border-white/15 bg-black/40 p-4 transition-colors hover:border-[#00821A]/65 sm:p-5 ${focusStyle}`}>
                  <Mail size={20} className="shrink-0 text-[#00821A]" aria-hidden="true" />
                  <span className="min-w-0"><span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">{copy.emailLabel}</span><span className="mt-2 block break-all text-[13px] font-semibold text-white">{CONTACT_EMAIL}</span></span>
                  <ArrowUpRight size={15} className="ml-auto shrink-0 text-white/50 transition-colors group-hover:text-[#00821A]" aria-hidden="true" />
                </a>
                <a href={CONTACT_PHONE_LINK} className={`group flex min-w-0 items-start gap-3 border border-white/15 bg-black/40 p-4 transition-colors hover:border-[#00821A]/65 sm:p-5 ${focusStyle}`}>
                  <Phone size={20} className="shrink-0 text-[#00821A]" aria-hidden="true" />
                  <span className="min-w-0"><span className="block text-[10px] font-bold uppercase tracking-[0.12em] text-white/50">{copy.phoneLabel}</span><span className="mt-2 block text-[13px] font-semibold text-white">{CONTACT_PHONE}</span></span>
                  <ArrowUpRight size={15} className="ml-auto shrink-0 text-white/50 transition-colors group-hover:text-[#00821A]" aria-hidden="true" />
                </a>
              </div>
              <button type="button" onClick={copyEmail} className={`mt-4 inline-flex min-h-10 items-center gap-2 border border-white/20 px-4 text-[10px] font-bold uppercase text-white/80 transition-colors hover:border-[#00821A] hover:text-white ${focusStyle}`}>
                {copiedEmail ? <Check size={14} aria-hidden="true" /> : <Copy size={14} aria-hidden="true" />}
                {copiedEmail ? copy.copied : copy.copy}
              </button>
              <div className="mt-7 border-t border-white/10 pt-5">
                <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.13em] text-[#00821A]">{copy.quickTopicsTitle}</p>
                <div className="flex flex-wrap gap-2">
                  {copy.quickTopics.map((topic) => (
                    <a key={topic.label} href={mailLink(topic.subject)} className={`inline-flex min-h-10 items-center gap-2 border border-[#00821A]/45 bg-[#00821A]/[0.06] px-3 text-[10px] font-bold uppercase text-white transition-colors hover:border-[#00821A] hover:bg-[#00821A]/20 ${focusStyle}`}>
                      {topic.label}<ArrowUpRight size={13} aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </AccordionSection>

            <AccordionSection id="hours" number="02" label={copy.nav.hours} kicker={copy.accordion.hours} open={expanded.hours} onToggle={() => toggleSection("hours")}>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border border-white/10 bg-black/35 p-4 sm:p-5">
                  <Clock3 size={20} className="text-[#00821A]" aria-hidden="true" />
                  <h4 className="mt-4 text-sm font-bold uppercase text-white">{copy.hoursTitle}</h4>
                  <p className="mt-2 text-xs text-white/70">{copy.days}</p>
                  <p className="mt-2 text-sm font-bold tabular-nums text-white">{copy.times}</p>
                  <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.08em] text-[#00821A]">{copy.timeZone}</p>
                </div>
                <div className="border border-white/10 bg-black/35 p-4 sm:p-5">
                  <PackageCheck size={20} className="text-[#00821A]" aria-hidden="true" />
                  <h4 className="mt-4 text-sm font-bold uppercase text-white">{copy.shippingTitle}</h4>
                  <p className="mt-2 text-xs leading-6 text-white/65">{copy.shippingText}</p>
                </div>
              </div>
              <div className="mt-4 flex items-start gap-3 border-l-[3px] border-[#00821A] bg-[#00821A]/[0.07] px-4 py-3">
                <Headphones size={17} className="mt-0.5 shrink-0 text-[#00821A]" aria-hidden="true" />
                <p className="text-xs leading-6 text-white/75">{copy.replyNote}</p>
              </div>
            </AccordionSection>

            <AccordionSection id="faq" number="03" label={copy.nav.faq} kicker={copy.accordion.faq} open={expanded.faq} onToggle={() => toggleSection("faq")}>
              <div className="space-y-2">
                {copy.faqItems.map((item, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div key={item.q} className="overflow-hidden border border-white/10 bg-black/30">
                      <h4>
                        <button type="button" aria-expanded={isOpen} aria-controls={`contact-faq-answer-${index}`} id={`contact-faq-question-${index}`} onClick={() => setOpenFaq(isOpen ? null : index)} className={`flex w-full items-center justify-between gap-3 px-4 py-4 text-left text-[12px] font-semibold text-white transition-colors hover:bg-white/[0.035] sm:text-[13px] ${focusStyle}`}>
                          <span>{item.q}</span>
                          <ChevronDown size={17} className={`shrink-0 text-[#00821A] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                        </button>
                      </h4>
                      {isOpen && <div id={`contact-faq-answer-${index}`} role="region" aria-labelledby={`contact-faq-question-${index}`} className="border-t border-white/10 px-4 py-4 text-xs leading-6 text-white/65 sm:text-[13px]">{item.a}</div>}
                    </div>
                  );
                })}
              </div>
              <Link href="/size-guide" className={`mt-5 inline-flex items-center gap-2 text-xs font-bold text-[#00821A] underline decoration-[#00821A]/40 underline-offset-4 hover:decoration-[#00821A] ${focusStyle}`}>
                {copy.sizes}<ArrowRight size={15} aria-hidden="true" />
              </Link>
            </AccordionSection>

            <AccordionSection id="returns" number="04" label={copy.nav.returns} kicker={copy.accordion.returns} open={expanded.returns} onToggle={() => toggleSection("returns")}>
              <p className="max-w-2xl text-sm font-medium leading-7 text-white/85">{copy.returnsLead}</p>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {copy.returnSteps.map((step, index) => (
                  <div key={step.title} className="border border-white/10 bg-black/30 p-4">
                    <span className="text-xl font-black tabular-nums text-[#00821A]">0{index + 1}</span>
                    <h4 className="mt-3 text-xs font-bold uppercase leading-5 text-white">{step.title}</h4>
                    <p className="mt-2 text-[11px] leading-5 text-white/60">{step.text}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 border-l-[3px] border-[#00821A] bg-white/[0.04] p-4">
                <div className="flex items-start gap-2">
                  <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#00821A]" aria-hidden="true" />
                  <p className="text-xs leading-6 text-white/70">{copy.termsIntro}</p>
                </div>
                <Link href="/terms-conditions" className={`mt-3 inline-flex items-center gap-2 text-xs font-bold text-[#00821A] underline underline-offset-4 hover:text-white ${focusStyle}`}>
                  {copy.terms}<ArrowUpRight size={14} aria-hidden="true" />
                </Link>
              </div>
              <a href={mailLink(copy.returnsSubject)} className={`mt-5 inline-flex min-h-11 items-center justify-center gap-2 bg-[#00821A] px-5 text-[11px] font-bold uppercase tracking-[0.04em] text-white transition-colors hover:bg-white hover:text-black ${focusStyle}`}>
                <Mail size={16} aria-hidden="true" />{copy.returnsAction}<ArrowUpRight size={14} aria-hidden="true" />
              </a>
            </AccordionSection>

            {/* Closing signature */}
            <div className="relative mt-7 overflow-hidden border border-[#00821A]/35 bg-[#101711] px-5 py-9 text-center sm:px-9 sm:py-12">
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,130,26,0.1),transparent_65%)]" />
              <div className="relative mx-auto flex max-w-xl flex-col items-center">
                <Sparkles size={24} className="text-[#00821A]" aria-hidden="true" />
                <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">{copy.closingKicker}</p>
                <h2 className="mt-2 text-[clamp(1.4rem,5vw,2.6rem)] font-black uppercase leading-tight tracking-[-0.025em]">{copy.closingTitle}</h2>
                <div aria-hidden="true" className="my-5 h-[2px] w-14 bg-[#00821A]" />
                <p className="max-w-md text-xs leading-6 text-white/65 sm:text-sm">{copy.closingText}</p>
                <a href={mailLink(copy.mailSubject)} className={`mt-6 inline-flex min-h-11 items-center gap-2 border border-[#00821A] px-5 text-[11px] font-bold uppercase transition-colors hover:bg-[#00821A] ${focusStyle}`}>
                  {copy.closingAction}<ArrowUpRight size={14} aria-hidden="true" />
                </a>
              </div>
            </div>

            <footer className="mt-8 border-t border-white/10 pt-5 text-[10px] font-medium text-white/45">
              <p>© {new Date().getFullYear()} Milos BG — {copy.rights}</p>
            </footer>
          </div>
        </div>
      </Container>

      {showTop && (
        <button type="button" aria-label={copy.backTop} onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className={`fixed bottom-5 right-5 z-40 flex size-11 items-center justify-center border border-[#00821A] bg-black/95 text-white shadow-lg backdrop-blur transition-colors hover:bg-[#00821A] sm:bottom-7 sm:right-7 ${focusStyle}`}>
          <ArrowUp size={18} aria-hidden="true" />
        </button>
      )}

      <style jsx global>{`
        @keyframes mbg-contact-entrance {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes mbg-contact-float-animation {
          0%, 100% { transform: translateY(0) rotate(-7deg); }
          50% { transform: translateY(8px) rotate(-4deg); }
        }
        .mbg-contact-enter { animation: mbg-contact-entrance 650ms cubic-bezier(.22,1,.36,1) both; }
        .mbg-contact-reveal { animation: mbg-contact-entrance 280ms ease-out both; }
        .mbg-contact-float { animation: mbg-contact-float-animation 9s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .mbg-contact-enter, .mbg-contact-reveal, .mbg-contact-float { animation: none; }
        }
      `}</style>
    </main>
  );
}
