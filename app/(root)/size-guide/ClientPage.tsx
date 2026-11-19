"use client";

import Container from "@/components/mbg-components/Container";
import { Grinder } from "@/images";
import type { StoreLanguage } from "@/lib/store-language";
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronDown,
  CircleHelp,
  Globe2,
  MoveHorizontal,
  Ruler,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Props = {
  lang: StoreLanguage;
};

type Unit = "cm" | "in";

type SizeKey = "S" | "M" | "L";

type Measurement = {
  key: string;

  label: {
    en: string;
    fr: string;
  };

  values: Record<
    SizeKey,
    {
      cm: string;
      in: string;
    }
  >;
};

const SIZE_ORDER: SizeKey[] = [
  "S",
  "M",
  "L",
];

const MEASUREMENTS: Measurement[] = [
  {
    key: "height",

    label: {
      en: "Body height",
      fr: "Taille du corps",
    },

    values: {
      S: {
        cm: "173–178",
        in: `5'8"–5'10"`,
      },

      M: {
        cm: "178–183",
        in: `5'10"–6'0"`,
      },

      L: {
        cm: "183–188",
        in: `6'0"–6'2"`,
      },
    },
  },

  {
    key: "chest",

    label: {
      en: "Chest",
      fr: "Poitrine",
    },

    values: {
      S: {
        cm: "92–96",
        in: "36–38",
      },

      M: {
        cm: "96–102",
        in: "38–40",
      },

      L: {
        cm: "102–106",
        in: "40–42",
      },
    },
  },

  {
    key: "waist",

    label: {
      en: "Waist",
      fr: "Taille",
    },

    values: {
      S: {
        cm: "74–79",
        in: "29–31",
      },

      M: {
        cm: "79–84",
        in: "31–33",
      },

      L: {
        cm: "84–89",
        in: "33–35",
      },
    },
  },

  {
    key: "hip",

    label: {
      en: "Hip",
      fr: "Hanches",
    },

    values: {
      S: {
        cm: "92–96",
        in: "36–38",
      },

      M: {
        cm: "96–102",
        in: "38–40",
      },

      L: {
        cm: "102–106",
        in: "40–42",
      },
    },
  },

  {
    key: "inseam",

    label: {
      en: "Inseam",
      fr: "Entrejambe",
    },

    values: {
      S: {
        cm: "79–82",
        in: "31–32",
      },

      M: {
        cm: "82–84",
        in: "32–33",
      },

      L: {
        cm: "84–86",
        in: "33–34",
      },
    },
  },
];

const COPY = {
  en: {
    breadcrumb: "Size Guide",

    eyebrow: "SIZE & FIT",

    title: "Men's Size Guide",

    description:
      "Use your body measurements to find the Milos BG size that best matches your proportions and preferred fit.",

    measurementsLink:
      "Measurements",

    measureLink:
      "How to measure",

    fitLink:
      "Fit advice",

    unit: "Unit",

    howToMeasure:
      "How to measure",

    howToMeasureDescription:
      "For the most accurate result, measure directly over light clothing while standing naturally.",

    chest: "Chest",

    chestDescription:
      "Measure horizontally around the fullest part of your chest, under your arms.",

    waist: "Waist",

    waistDescription:
      "Measure around your natural waistline without tightening the tape.",

    hips: "Hips",

    hipsDescription:
      "Measure around the widest part of your hips while standing naturally.",

    inseam: "Inseam",

    inseamDescription:
      "Measure from the crotch to the ankle along the inside of your leg.",

    tableEyebrow: "SIZE CHART",

    bodyMeasurements:
      "Body measurements",

    tableDescription:
      "Compare your measurements with the chart below. Measurements shown are body measurements, not garment dimensions.",

    measurement: "Measurement",

    size: "Size",

    recommended: "Milos BG size",

    note:
      "Use this chart as a general sizing reference. Fit may vary according to garment construction, fabric and intended silhouette.",

    choosingTitle:
      "Between two sizes?",

    choosingDescription:
      "Choose the smaller size for a closer silhouette or the larger size for a more relaxed fit.",

    productFitTitle:
      "Check each product",

    productFitDescription:
      "Each product page may include additional fit and garment-specific measurements.",

    faqEyebrow: "FAQ",

    faqTitle:
      "Size & fit questions",

    faq: [
      {
        q: "How do I choose my Milos BG size?",
        a: "Compare your chest, waist and hip measurements with the size chart. If you are between two sizes, consider your preferred fit.",
      },

      {
        q: "Are these garment measurements?",
        a: "No. The chart primarily shows body measurements. Product-specific garment measurements may be available on individual product pages.",
      },

      {
        q: "What if I am between two sizes?",
        a: "Choose the smaller size for a closer fit or the larger size for a more relaxed silhouette.",
      },
    ],

    supportEyebrow:
      "NEED HELP?",

    supportTitle:
      "Still unsure about your size?",

    supportDescription:
      "Send us your measurements and the product you are interested in. We can help you compare them with the intended fit.",

    products:
      "View products",

    contact:
      "Contact us",
  },

  fr: {
    breadcrumb:
      "Guide des tailles",

    eyebrow:
      "TAILLES & COUPES",

    title:
      "Guide des tailles homme",

    description:
      "Utilisez vos mensurations pour identifier la taille Milos BG correspondant le mieux à votre morphologie et à la coupe recherchée.",

    measurementsLink:
      "Mensurations",

    measureLink:
      "Comment se mesurer",

    fitLink:
      "Conseils de coupe",

    unit: "Unité",

    howToMeasure:
      "Comment se mesurer",

    howToMeasureDescription:
      "Pour obtenir un résultat précis, prenez vos mesures sur des vêtements légers en restant debout naturellement.",

    chest: "Poitrine",

    chestDescription:
      "Mesurez horizontalement autour de la partie la plus large de votre poitrine, sous les bras.",

    waist: "Taille",

    waistDescription:
      "Mesurez autour de votre taille naturelle sans serrer le mètre.",

    hips: "Hanches",

    hipsDescription:
      "Mesurez autour de la partie la plus large de vos hanches en restant naturellement debout.",

    inseam: "Entrejambe",

    inseamDescription:
      "Mesurez depuis l'entrejambe jusqu'à la cheville le long de l'intérieur de la jambe.",

    tableEyebrow:
      "TABLEAU DES TAILLES",

    bodyMeasurements:
      "Mensurations",

    tableDescription:
      "Comparez vos mesures avec le tableau ci-dessous. Les valeurs correspondent aux mensurations du corps et non aux dimensions du vêtement.",

    measurement:
      "Mensuration",

    size: "Taille",

    recommended:
      "Taille Milos BG",

    note:
      "Utilisez ce tableau comme guide général. La coupe peut varier selon la construction du vêtement, le tissu et la silhouette recherchée.",

    choosingTitle:
      "Entre deux tailles ?",

    choosingDescription:
      "Choisissez la taille inférieure pour une silhouette plus ajustée ou la taille supérieure pour une coupe plus ample.",

    productFitTitle:
      "Vérifiez chaque produit",

    productFitDescription:
      "Chaque fiche produit peut comporter des informations de coupe et des mesures spécifiques supplémentaires.",

    faqEyebrow: "FAQ",

    faqTitle:
      "Questions sur les tailles",

    faq: [
      {
        q: "Comment choisir ma taille Milos BG ?",
        a: "Comparez vos mensurations de poitrine, taille et hanches avec le tableau. Si vous êtes entre deux tailles, tenez compte de la coupe recherchée.",
      },

      {
        q: "Ces mesures correspondent-elles au vêtement ?",
        a: "Non. Le tableau indique principalement les mensurations du corps. Des mesures spécifiques au vêtement peuvent être disponibles sur sa fiche produit.",
      },

      {
        q: "Que faire si je suis entre deux tailles ?",
        a: "Choisissez la taille inférieure pour une coupe plus ajustée ou la taille supérieure pour une silhouette plus ample.",
      },
    ],

    supportEyebrow:
      "BESOIN D'AIDE ?",

    supportTitle:
      "Vous hésitez encore sur votre taille ?",

    supportDescription:
      "Envoyez-nous vos mensurations ainsi que le produit qui vous intéresse. Nous pourrons vous aider à les comparer avec la coupe prévue.",

    products:
      "Voir les produits",

    contact:
      "Nous contacter",
  },
} as const;

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00821A] focus-visible:ring-offset-2";

const solidButton =
  `group inline-flex min-h-12 items-center justify-center gap-3 rounded-sm bg-[#00821A] px-6 py-3 text-center text-[11px] font-bold uppercase tracking-[0.13em] text-white shadow-[0_12px_28px_-13px_rgba(0,130,26,0.85)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#006b16] hover:shadow-[0_16px_34px_-13px_rgba(0,130,26,0.75)] active:translate-y-0 ${focusRing}`;

const outlineButton =
  `group inline-flex min-h-12 items-center justify-center gap-3 rounded-sm border border-black/20 bg-white px-6 py-3 text-center text-[11px] font-bold uppercase tracking-[0.13em] text-black transition-all duration-200 hover:-translate-y-0.5 hover:border-black hover:bg-black hover:text-white active:translate-y-0 ${focusRing}`;

export default function ClientPage({ lang }: Props) {
  const copy = COPY[lang];
  const [unit, setUnit] = useState<Unit>("cm");
  const [selectedSize, setSelectedSize] = useState<SizeKey | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const ui =
    lang === "fr"
      ? {
          language: "Langue",
          explore: "Explorer le guide",
          viewChart: "Voir le tableau des tailles",
          learnMeasure: "Prendre mes mesures",
          sizeRange: "Tailles standards : S · M · L",
          guideIndex: "Navigation rapide",
          selectSize: "Mettre une taille en évidence",
          sizeInstruction: "Sélectionnez une taille pour comparer plus facilement les mensurations.",
          unitLabel: "Unité de mesure",
          artisan: "Coupe & fabrication artisanales",
          details: "Détails du guide",
          inchesNote: "La stature est affichée en pieds et pouces ; les autres valeurs sont en pouces.",
          standardSizes: "Tailles standards",
          support: "Conseil personnalisé",
          fitHeading: "L'essentiel pour choisir",
          measureTag: "4 étapes simples",
          faqTag: "Vos questions, nos réponses",
          helpTag: "Nous sommes à votre écoute",
        }
      : {
          language: "Language",
          explore: "Explore the guide",
          viewChart: "View size chart",
          learnMeasure: "How to measure",
          sizeRange: "Standard sizes: S · M · L",
          guideIndex: "Quick navigation",
          selectSize: "Highlight a size",
          sizeInstruction: "Select a size to compare its measurements more easily.",
          unitLabel: "Measurement unit",
          artisan: "Artisan-made fit & construction",
          details: "Guide details",
          inchesNote: "Height is shown in feet and inches; all other measurements are in inches.",
          standardSizes: "Standard sizes",
          support: "Personalized guidance",
          fitHeading: "Find your preferred fit",
          measureTag: "4 simple steps",
          faqTag: "Your questions, answered",
          helpTag: "We are here to help",
        };

  const measurementTips = [
    { title: copy.chest, description: copy.chestDescription, icon: MoveHorizontal },
    { title: copy.waist, description: copy.waistDescription, icon: Ruler },
    { title: copy.hips, description: copy.hipsDescription, icon: MoveHorizontal },
    { title: copy.inseam, description: copy.inseamDescription, icon: ArrowDown },
  ];

  const localizedHref = (href: string) =>
    lang === "fr" ? `${href}${href.includes("?") ? "&" : "?"}lang=fr` : href;

  const quickLinks = [
    { number: "01", label: copy.measurementsLink, href: "#measurements" },
    { number: "02", label: copy.measureLink, href: "#how-to-measure" },
    { number: "03", label: copy.fitLink, href: "#fit-advice" },
  ];

  return (
    <main className="min-h-screen overflow-x-clip bg-white font-kanit text-black">
      {/* HERO: premium editorial layout + visible primary action */}
      <section className="relative isolate overflow-hidden border-b border-black/10 bg-[#F8F9F8]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-44 h-[400px] w-[400px] rounded-full bg-[#00821A]/[0.045] blur-3xl lg:h-[650px] lg:w-[650px]"
        />
        <Container>
          <div className="grid gap-9 py-8 sm:py-12 lg:grid-cols-[1.05fr_.95fr] lg:items-center lg:gap-14 lg:py-20 xl:gap-20">
            <div className="min-w-0">
              <nav
                aria-label={lang === "fr" ? "Fil d’Ariane" : "Breadcrumb"}
                className="mb-9 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]"
              >
                <Link
                  href={localizedHref("/")}
                  className={`text-black/50 transition-colors hover:text-[#00821A] ${focusRing}`}
                >
                  MILOS BG
                </Link>
                <span aria-hidden="true" className="text-black/25">/</span>
                <span className="text-black">{copy.breadcrumb}</span>
              </nav>

              <div className="mb-5 flex flex-wrap items-center gap-3">
                <span className="h-1.5 w-7 bg-[#00821A]" aria-hidden="true" />
                <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#00821A]">
                  {copy.eyebrow}
                </span>
              </div>

              <h1 className="max-w-[740px] text-[clamp(2.55rem,5.5vw,5.4rem)] font-semibold leading-[0.96] tracking-[-0.052em]">
                {copy.title}
                <span className="text-[#00821A]">.</span>
              </h1>
              <p className="mt-7 max-w-xl text-sm leading-[1.9] text-[#404040] sm:text-base">
                {copy.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-2 rounded-sm border border-[#00821A]/20 bg-[#00821A]/[0.06] px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#00821A]">
                  <Check size={13} strokeWidth={2.5} aria-hidden="true" />
                  {ui.sizeRange}
                </span>
                <span className="inline-flex items-center gap-2 rounded-sm border border-black/10 bg-white px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#404040]">
                  <Ruler size={13} aria-hidden="true" />
                  {ui.artisan}
                </span>
              </div>

              <div className="mt-9 grid gap-3 sm:flex sm:flex-wrap">
                <a href="#measurements" className={solidButton}>
                  {ui.viewChart}
                  <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </a>
                <a href="#how-to-measure" className={outlineButton}>
                  <Ruler size={17} aria-hidden="true" />
                  {ui.learnMeasure}
                </a>
              </div>

              <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-black/10 pt-5">
                <Globe2 size={16} aria-hidden="true" className="text-[#00821A]" />
                <span className="mr-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-[#404040]">
                  {ui.language}
                </span>
                <div className="inline-flex gap-1 rounded-sm border border-black/10 bg-white p-1" role="group" aria-label={ui.language}>
                  {(["en", "fr"] as const).map((value) => (
                    <Link
                      key={value}
                      href={value === "en" ? "/size-guide" : "/size-guide?lang=fr"}
                      hrefLang={value}
                      aria-current={lang === value ? "page" : undefined}
                      className={`inline-flex min-h-10 min-w-14 items-center justify-center rounded-sm px-3 text-xs font-bold tracking-[0.12em] transition-colors ${focusRing} ${
                        lang === value
                          ? "bg-black text-white shadow-sm"
                          : "text-[#404040] hover:bg-[#00821A]/10 hover:text-[#00821A]"
                      }`}
                    >
                      {value.toUpperCase()}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative min-w-0">
              <div className="relative isolate flex aspect-[5/4] items-center justify-center overflow-hidden rounded-sm border border-black/10 bg-[#EFEFEC] sm:aspect-[5/4] lg:aspect-[4/5]">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-[radial-gradient(circle_at_60%_38%,rgba(255,255,255,0.95),rgba(255,255,255,0)_60%)]"
                />
                <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[#00821A]" />
                <span className="absolute left-5 top-6 z-10 text-[10px] font-bold uppercase tracking-[0.25em] text-black/40 sm:left-8">
                  MILOS BG / FIT GUIDE
                </span>
                <Image
                  src={Grinder}
                  alt=""
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="relative z-[1] h-[80%] w-auto max-w-[90%] object-contain drop-shadow-[0_25px_25px_rgba(0,0,0,0.08)]"
                />
                <div className="absolute bottom-5 left-5 right-5 z-10 flex items-end justify-between gap-4 border-t border-black/10 pt-4 sm:bottom-8 sm:left-8 sm:right-8">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.19em] text-black/45">
                    {ui.standardSizes}
                  </span>
                  <span className="text-base font-bold tracking-[0.22em] text-[#00821A]">S / M / L</span>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Section navigation: clearly tappable, not text-only links */}
      <section aria-label={ui.guideIndex} className="border-b border-black/10 bg-white">
        <Container>
          <div className="grid gap-2 py-4 sm:grid-cols-3 sm:gap-3">
            {quickLinks.map((item) => (
              <a
                key={item.number}
                href={item.href}
                className={`group flex min-h-14 items-center justify-between gap-3 rounded-sm border border-black/10 bg-white px-4 py-3 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#00821A]/45 hover:bg-[#00821A]/[0.04] hover:shadow-[0_10px_22px_-15px_rgba(0,0,0,0.35)] ${focusRing}`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="text-[10px] font-bold tracking-[0.15em] text-[#00821A]">{item.number}</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.1em] sm:text-[11px]">{item.label}</span>
                </span>
                <ArrowRight size={16} className="shrink-0 text-[#00821A] transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* SIZE CHART */}
      <section id="measurements" className="scroll-mt-24 bg-white">
        <Container>
          <div className="py-16 md:py-24">
            <SectionHeading number="01" eyebrow={copy.tableEyebrow} title={copy.bodyMeasurements} description={copy.tableDescription} />

            <div className="mt-9 rounded-sm border border-black/10 bg-[#F8F9F8] p-4 sm:p-6">
              <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center">
                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#404040]">{ui.selectSize}</p>
                  <div className="flex flex-wrap items-center gap-2" role="group" aria-label={ui.selectSize}>
                    {SIZE_ORDER.map((size) => {
                      const active = selectedSize === size;
                      return (
                        <button
                          key={size}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setSelectedSize(active ? null : size)}
                          className={`inline-flex h-12 w-14 items-center justify-center rounded-sm border text-sm font-bold transition-all duration-200 sm:h-14 sm:w-16 ${focusRing} ${
                            active
                              ? "border-[#00821A] bg-[#00821A] text-white shadow-[0_10px_18px_-12px_rgba(0,130,26,0.9)]"
                              : "border-black/15 bg-white text-black hover:border-[#00821A] hover:text-[#00821A]"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                  <p className="mt-3 text-[11px] leading-5 text-[#404040]">{ui.sizeInstruction}</p>
                </div>
                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-[#404040]">{ui.unitLabel}</p>
                  <div className="inline-flex rounded-sm border border-black/15 bg-white p-1" role="group" aria-label={ui.unitLabel}>
                    {(["cm", "in"] as const).map((value) => (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={unit === value}
                        onClick={() => setUnit(value)}
                        className={`min-h-11 min-w-20 rounded-sm px-4 text-xs font-bold uppercase tracking-[0.14em] transition-colors ${focusRing} ${
                          unit === value
                            ? "bg-black text-white shadow-sm"
                            : "text-[#404040] hover:bg-[#00821A]/10 hover:text-[#00821A]"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop: readable table + highlighted size */}
            <div className="mt-4 hidden overflow-hidden rounded-sm border border-black/10 shadow-[0_16px_40px_-34px_rgba(0,0,0,0.45)] md:block">
              <table className="w-full table-fixed border-collapse">
                <caption className="sr-only">{copy.bodyMeasurements} ({unit})</caption>
                <thead>
                  <tr className="bg-black text-white">
                    <th scope="col" className="w-[34%] px-6 py-6 text-left text-[11px] font-semibold uppercase tracking-[0.16em]">
                      {copy.measurement}
                    </th>
                    {SIZE_ORDER.map((size) => (
                      <th
                        key={size}
                        scope="col"
                        className={`border-l border-white/15 px-4 py-5 text-center text-2xl font-semibold transition-colors ${selectedSize === size ? "bg-[#00821A] text-white" : ""}`}
                      >
                        {size}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MEASUREMENTS.map((measurement, index) => (
                    <tr key={measurement.key} className={`${index % 2 ? "bg-[#F8F8F7]" : "bg-white"} border-t border-black/10 hover:bg-[#F3F7F3]`}>
                      <th scope="row" className="px-6 py-6 text-left text-[12px] font-semibold uppercase tracking-[0.08em]">
                        {measurement.label[lang]}
                      </th>
                      {SIZE_ORDER.map((size) => (
                        <td
                          key={size}
                          className={`border-l border-black/10 px-4 py-6 text-center text-sm font-semibold tabular-nums transition-colors ${
                            selectedSize === size ? "bg-[#00821A]/[0.10] text-[#006b16]" : ""
                          }`}
                        >
                          {measurement.values[size][unit]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile: stacked cards without horizontal scrolling */}
            <div className="mt-4 grid gap-4 md:hidden">
              {SIZE_ORDER.map((size) => (
                <article
                  key={size}
                  className={`overflow-hidden rounded-sm border bg-white transition-all ${
                    selectedSize === size ? "border-[#00821A] shadow-[0_14px_28px_-20px_rgba(0,130,26,0.55)]" : "border-black/10"
                  }`}
                >
                  <header className={`flex items-center justify-between px-5 py-4 text-white ${selectedSize === size ? "bg-[#00821A]" : "bg-black"}`}>
                    <span className="text-[10px] font-bold uppercase tracking-[0.17em] text-white/80">{copy.recommended}</span>
                    <strong className="text-2xl font-semibold tracking-[0.07em]">{size}</strong>
                  </header>
                  <dl>
                    {MEASUREMENTS.map((measurement, index) => (
                      <div key={measurement.key} className={`flex items-center justify-between gap-5 border-t border-black/10 px-5 py-3.5 ${index % 2 ? "bg-[#F8F8F7]" : "bg-white"}`}>
                        <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-[#404040]">
                          {measurement.label[lang]}
                        </dt>
                        <dd className="shrink-0 text-right text-sm font-semibold tabular-nums">
                          {measurement.values[size][unit]}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </article>
              ))}
            </div>

            <div className="mt-6 flex max-w-4xl items-start gap-3 rounded-sm border border-[#00821A]/20 bg-[#00821A]/[0.045] px-5 py-4">
              <CircleHelp size={18} aria-hidden="true" className="mt-0.5 shrink-0 text-[#00821A]" />
              <div className="text-xs leading-6 text-[#404040]">
                <p>{copy.note}</p>
                {unit === "in" && <p className="mt-1">{ui.inchesNote}</p>}
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* HOW TO MEASURE */}
      <section id="how-to-measure" className="scroll-mt-24 border-y border-black/10 bg-[#F8F9F8]">
        <Container>
          <div className="py-16 md:py-24">
            <SectionHeading number="02" eyebrow={ui.measureTag} title={copy.howToMeasure} description={copy.howToMeasureDescription} />
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {measurementTips.map((item, index) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="group relative overflow-hidden rounded-sm border border-black/10 bg-white p-6 transition-all duration-200 hover:-translate-y-1 hover:border-[#00821A]/45 hover:shadow-[0_20px_40px_-30px_rgba(0,0,0,0.35)] lg:min-h-[250px]">
                    <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 origin-left scale-x-0 bg-[#00821A] transition-transform duration-200 group-hover:scale-x-100" />
                    <div className="flex items-start justify-between gap-3">
                      <span className="flex h-12 w-12 items-center justify-center rounded-sm border border-[#00821A]/20 bg-[#00821A]/[0.06] text-[#00821A]">
                        <Icon size={20} strokeWidth={1.8} aria-hidden="true" />
                      </span>
                      <span className="text-[11px] font-bold tracking-[0.12em] text-black/30">0{index + 1}</span>
                    </div>
                    <h3 className="mt-8 text-base font-semibold uppercase tracking-[0.06em]">{item.title}</h3>
                    <p className="mt-3 text-[13px] leading-6 text-[#404040]">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* FIT ADVICE */}
      <section id="fit-advice" className="scroll-mt-24 bg-white">
        <Container>
          <div className="py-16 md:py-24">
            <SectionHeading number="03" eyebrow={ui.fitHeading} title={copy.fitLink} />
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              <article className="relative overflow-hidden rounded-sm bg-black p-7 text-white sm:p-10">
                <div aria-hidden="true" className="absolute right-0 top-0 h-full w-1 bg-[#00821A]" />
                <span className="flex h-12 w-12 items-center justify-center rounded-sm bg-[#00821A] text-white">
                  <Check size={22} aria-hidden="true" />
                </span>
                <h3 className="mt-9 text-xl font-semibold tracking-[-0.02em] sm:text-2xl">{copy.choosingTitle}</h3>
                <p className="mt-4 max-w-lg text-sm leading-7 text-white/75">{copy.choosingDescription}</p>
              </article>
              <article className="rounded-sm border border-black/10 bg-[#F8F9F8] p-7 sm:p-10">
                <span className="flex h-12 w-12 items-center justify-center rounded-sm border border-black/10 bg-white text-[#00821A]">
                  <Ruler size={22} aria-hidden="true" />
                </span>
                <h3 className="mt-9 text-xl font-semibold tracking-[-0.02em] sm:text-2xl">{copy.productFitTitle}</h3>
                <p className="mt-4 max-w-lg text-sm leading-7 text-[#404040]">{copy.productFitDescription}</p>
                <Link href={localizedHref("/products")} className={`${solidButton} mt-7 w-full sm:w-auto`}>
                  {copy.products}
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </article>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="border-t border-black/10 bg-[#F8F9F8]">
        <Container>
          <div className="grid gap-10 py-16 md:grid-cols-[0.8fr_1.2fr] md:py-24 lg:gap-16">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.26em] text-[#00821A]">{copy.faqEyebrow}</span>
              <h2 className="mt-4 max-w-sm text-3xl font-semibold leading-[1.06] tracking-[-0.035em] md:text-4xl">{copy.faqTitle}</h2>
              <p className="mt-5 text-sm text-[#404040]">{ui.faqTag}</p>
            </div>
            <div className="space-y-3">
              {copy.faq.map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <article key={item.q} className={`overflow-hidden rounded-sm border bg-white transition-colors ${isOpen ? "border-[#00821A]/40" : "border-black/10"}`}>
                    <h3>
                      <button
                        type="button"
                        id={`size-faq-question-${index}`}
                        aria-controls={`size-faq-answer-${index}`}
                        aria-expanded={isOpen}
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className={`flex min-h-[70px] w-full items-center justify-between gap-5 px-5 py-5 text-left transition-colors hover:bg-[#00821A]/[0.035] sm:px-6 ${focusRing}`}
                      >
                        <span className="text-[13px] font-semibold leading-6 sm:text-sm">{item.q}</span>
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm border transition-all ${isOpen ? "rotate-180 border-[#00821A] bg-[#00821A] text-white" : "border-black/10 bg-[#F8F9F8] text-black"}`}>
                          <ChevronDown size={17} aria-hidden="true" />
                        </span>
                      </button>
                    </h3>
                    {isOpen && (
                      <div
                        id={`size-faq-answer-${index}`}
                        role="region"
                        aria-labelledby={`size-faq-question-${index}`}
                        className="border-t border-black/10 px-5 py-5 sm:px-6"
                      >
                        <p className="text-[13px] leading-7 text-[#404040] sm:text-sm">{item.a}</p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA: clear primary and secondary buttons */}
      <section className="relative isolate overflow-hidden bg-black text-white">
        <div aria-hidden="true" className="absolute -right-40 -top-60 h-[500px] w-[500px] rounded-full bg-[#00821A]/15 blur-[100px]" />
        <Container>
          <div className="relative grid gap-10 py-16 md:grid-cols-[1.3fr_0.7fr] md:items-end md:py-24">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[#66D17B]">
                <span className="h-1.5 w-7 bg-[#00821A]" aria-hidden="true" />
                {copy.supportEyebrow}
              </span>
              <h2 className="mt-5 text-3xl font-semibold leading-[1.04] tracking-[-0.035em] sm:text-4xl lg:text-5xl">{copy.supportTitle}</h2>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/70">{copy.supportDescription}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-1 xl:grid-cols-2">
              <Link href={localizedHref("/contact")} className={`${solidButton} min-h-14`}>
                {copy.contact}
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
              <Link
                href={localizedHref("/products")}
                className={`group inline-flex min-h-14 items-center justify-center gap-3 rounded-sm border border-white/35 bg-white/10 px-6 py-3 text-center text-[11px] font-bold uppercase tracking-[0.13em] text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-white hover:text-black active:translate-y-0 ${focusRing}`}
              >
                {copy.products}
                <ArrowRight size={17} className="transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}

function SectionHeading({
  number,
  eyebrow,
  title,
  description,
}: {
  number: string;
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <header className="grid gap-5 md:grid-cols-[96px_minmax(0,1fr)] lg:grid-cols-[120px_minmax(0,1fr)]">
      <div className="flex items-center gap-3 self-start pt-1">
        <span className="text-[13px] font-bold tracking-[0.16em] text-[#00821A]">{number}</span>
        <span aria-hidden="true" className="h-px w-8 bg-[#00821A]/50" />
      </div>
      <div className="max-w-3xl">
        {eyebrow && <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.21em] text-[#404040]">{eyebrow}</p>}
        <h2 className="text-[clamp(1.8rem,3vw,2.85rem)] font-semibold leading-[1.08] tracking-[-0.035em]">{title}</h2>
        {description && <p className="mt-5 max-w-2xl text-sm leading-7 text-[#404040]">{description}</p>}
      </div>
    </header>
  );
}
