"use client";

import Container from "@/components/mbg-components/Container";
import { Grinder } from "@/images";
import type { StoreLanguage } from "@/lib/store-language";
import {
  ArrowDown, ArrowRight, ArrowUpRight, ChevronDown,
  CircleHelp, Globe2, Calculator, RotateCcw, MoveHorizontal,
  Ruler, ScanLine, ShieldCheck
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type ChangeEvent, type FormEvent, useState } from "react";

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

const SIZE_ORDER: SizeKey[] = ["M", "L", "S"];

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
      {
        q: "Can I request a size outside M, L or S?",
        a: "Other sizes are considered custom orders. Our simulator offers an approximate reference based on body measurements; we confirm feasibility and the final fit individually.",
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
      {
        q: "Puis-je demander une taille différente de M, L ou S ?",
        a: "Les autres tailles relèvent d'une commande personnalisée. Le simulateur fournit un repère indicatif à partir de vos mensurations ; la faisabilité et la coupe finale sont confirmées individuellement.",
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

/**
 * Only M, L and S are regular production sizes.
 * Other bands are a simple linear extrapolation from the nearest standard size.
 * They are indicative body measurements, NOT official garment patterns/sizes.
 */
type ExtendedSize =
  | "XXS"
  | "XS"
  | SizeKey
  | "XL"
  | "2XL"
  | "3XL"
  | "4XL";
type SimField = "chest" | "waist" | "hip";
type SimValues = Record<SimField, string>;
type SimResult = ExtendedSize | "custom";
type Band = Record<SimField, readonly [number, number]>;

const EXTENDED_ORDER: ExtendedSize[] = [
  "XXS", "XS", "S", "M", "L", "XL", "2XL", "3XL", "4XL",
];
const BODY_BANDS: Record<ExtendedSize, Band> = {
  XXS: { chest: [80, 86], waist: [64, 69], hip: [80, 86] },
  XS: { chest: [86, 92], waist: [69, 74], hip: [86, 92] },
  S: { chest: [92, 96], waist: [74, 79], hip: [92, 96] },
  M: { chest: [96, 102], waist: [79, 84], hip: [96, 102] },
  L: { chest: [102, 106], waist: [84, 89], hip: [102, 106] },
  XL: { chest: [106, 112], waist: [89, 94], hip: [106, 112] },
  "2XL": { chest: [112, 118], waist: [94, 99], hip: [112, 118] },
  "3XL": { chest: [118, 124], waist: [99, 104], hip: [118, 124] },
  "4XL": { chest: [124, 130], waist: [104, 109], hip: [124, 130] },
};

const FIELDS: SimField[] = ["chest", "waist", "hip"];

function estimateFit(valuesCm: Partial<Record<SimField, number>>): SimResult {
  const matches = FIELDS.filter((field) => valuesCm[field] !== undefined).map((field) => {
    const value = valuesCm[field] as number;
    return EXTENDED_ORDER.findIndex((size, i) => {
      const [min, max] = BODY_BANDS[size][field];
      // A shared boundary belongs to the larger size; include the last upper bound.
      return value >= min && (value < max || (i === EXTENDED_ORDER.length - 1 && value <= max));
    });
  });

  if (!matches.length || matches.some((index) => index < 0)) return "custom";
  const smallest = Math.min(...matches);
  const largest = Math.max(...matches);
  // Different proportions can require individual pattern making.
  if (largest - smallest > 1) return "custom";
  return EXTENDED_ORDER[largest];
}


const focusRing = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00821A] focus-visible:ring-offset-2 focus-visible:ring-offset-white";
const focusRingDark = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00821A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#000000]";
const buttonPrimary = `inline-flex min-h-11 items-center justify-center gap-2 border border-[#00821A] bg-[#00821A] px-5 py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.09em] text-white transition-[background-color,border-color,transform] duration-300 hover:border-[#00821A] hover:bg-[#00821A] motion-safe:hover:-translate-y-0.5 ${focusRingDark}`;
const buttonOutline = `inline-flex min-h-11 items-center justify-center gap-2 border border-white/25 bg-white/[0.04] px-5 py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.09em] text-white transition-[background-color,border-color,transform] duration-300 hover:border-white/70 hover:bg-white/10 motion-safe:hover:-translate-y-0.5 ${focusRingDark}`;
const buttonLight = `inline-flex min-h-11 items-center justify-center gap-2 border border-black/15 bg-white px-5 py-2.5 text-center text-[11px] font-bold uppercase tracking-[0.09em] text-black transition-[background-color,border-color,transform] duration-300 hover:border-[#00821A] hover:text-[#00821A] motion-safe:hover:-translate-y-0.5 ${focusRing}`;
const sectionSpacing = "py-12 sm:py-16 lg:py-[92px]";

export default function ClientPage({ lang }: Props) {
  const copy = COPY[lang];
  const fr = lang === "fr";
  const [unit, setUnit] = useState<Unit>("cm");
  const [selectedSize, setSelectedSize] = useState<SizeKey>("M");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [simValues, setSimValues] = useState<SimValues>({ chest: "", waist: "", hip: "" });
  const [simResult, setSimResult] = useState<SimResult | null>(null);
  const [simError, setSimError] = useState("");

  const ui = fr ? {
    language: "Langue",
    eyebrow: "Milos BG / Le guide de coupe",
    heroLead: "La bonne coupe fait partie du parcours.",
    heroDetail: "Trouver votre taille, c’est choisir la liberté de mouvement et le confort qui vous accompagneront au quotidien.",
    chapter: "VOTRE PARCOURS",
    nav: "Parcourir le guide",
    stages: ["Se mesurer", "Comparer", "Choisir"],
    standard: "Tailles standards",
    madeToOrder: "Autres tailles sur demande",
    start: "Explorer les tailles",
    trySim: "Trouver ma taille",
    navChart: "Tableau",
    navMeasure: "Se mesurer",
    navSimulator: "Simulateur",
    navAdvice: "Conseils",
    compareLabel: "Comparateur de tailles",
    chooseSize: "Choisir une taille",
    selected: "Taille sélectionnée",
    sizeTip: "Choisissez M, L ou S pour comparer les mensurations.",
    units: "Unité de mesure",
    bodyNote: "Mesures du corps, pas du vêtement",
    sizeHeader: "Taille",
    guideNote: "Ces valeurs sont des repères indicatifs. Vérifiez toujours les informations de coupe sur la fiche du produit.",
    measureLabel: "LES BONNES MESURES",
    measureN: "04 points essentiels",
    measureTip: "Utilisez un mètre souple, restez droit et ne serrez pas le ruban.",
    fitBespoke: "VOTRE PROPRE MESURE",
    simIntro: "Parce qu'aucun parcours ne se ressemble, estimez votre repère de taille à partir de votre corps. Une estimation n'est pas une taille confectionnée.",
    simulatorHint: "Entrez au minimum votre tour de poitrine. Taille et hanches sont facultatives.",
    chestRequired: "Tour de poitrine *",
    optional: "facultatif",
    calc: "Estimer ma taille",
    reset: "Effacer",
    estimate: "VOTRE ESTIMATION",
    resultInitial: "Vos mesures traceront la prochaine étape.",
    resultStandard: "Taille standard Milos BG",
    resultCustom: "Taille personnalisée sur demande",
    resultBespoke: "Étude individuelle nécessaire",
    resultStandardDesc: "Cette taille fait partie de notre production standard. Vérifiez la coupe sur chaque fiche produit.",
    resultCustomDesc: "Ce repère est extrapolé à partir de nos tailles standards. La disponibilité et les mesures finales sont à confirmer avant production.",
    resultBespokeDesc: "Vos proportions ne correspondent pas à une seule plage cohérente. Contactez-nous pour étudier votre coupe.",
    approx: "Fourchettes corporelles estimées",
    disclaimer: "Simulateur indicatif uniquement : il ne garantit ni l'ajustement ni la faisabilité des tailles sur demande.",
    simError: "Saisissez une poitrine valide (50 à 230 cm) et vérifiez les mesures facultatives.",
    simRequest: "Demander un conseil",
    fitLabel: "LA COUPE JUSTE",
    adviceLead: "La taille, c'est une mesure. La coupe, c'est un choix.",
    fitShort: "Coupe près du corps",
    fitShortDesc: "Entre deux tailles ? La plus petite donnera généralement une silhouette plus ajustée.",
    fitRoomy: "Coupe plus ample",
    fitRoomyDesc: "La plus grande taille offre davantage d'aisance. Le résultat dépend aussi du patronage.",
    fitProduct: "Chaque pièce a son caractère",
    fitProductDesc: "Les mensurations du corps sont des repères. Les dimensions réelles et la coupe varient selon les vêtements.",
    faqLead: "Les réponses avant de choisir.",
    finalEyebrow: "PRENEZ LA BONNE DIRECTION",
    finalTitle: "Votre prochaine pièce commence ici.",
    finalDesc: "Une mesure, une coupe, une intention : choisissez la pièce qui vous accompagnera dans votre GRIND.",
    viewOutfits: "Découvrir les outfits",
    contact: "Nous contacter",
    resultContact: "Faire confirmer ma taille",
    standardS: "Standard",
  } : {
    language: "Language",
    eyebrow: "Milos BG / The fit journal",
    heroLead: "The right fit is part of the journey.",
    heroDetail: "Finding your size means choosing the freedom of movement and comfort that will follow you every day.",
    chapter: "YOUR JOURNEY",
    nav: "Explore the guide",
    stages: ["Measure", "Compare", "Choose"],
    standard: "Standard sizes",
    madeToOrder: "Other sizes by request",
    start: "Explore sizes",
    trySim: "Find my size",
    navChart: "Size chart",
    navMeasure: "How to measure",
    navSimulator: "Size finder",
    navAdvice: "Fit advice",
    compareLabel: "Size comparison",
    chooseSize: "Choose a size",
    selected: "Selected size",
    sizeTip: "Select M, L or S to compare body measurements.",
    units: "Measurement unit",
    bodyNote: "Body measurements, not garment dimensions",
    sizeHeader: "Size",
    guideNote: "These values are indicative. Always check the intended fit on each product page.",
    measureLabel: "KNOW YOUR MEASUREMENTS",
    measureN: "04 essential points",
    measureTip: "Use a soft measuring tape, stand naturally, and avoid pulling it tight.",
    fitBespoke: "YOUR OWN MEASURE",
    simIntro: "No two journeys are identical. Estimate a sizing reference from your body measurements. An estimate is not a finished garment size.",
    simulatorHint: "Enter at least your chest measurement. Waist and hips are optional.",
    chestRequired: "Chest *",
    optional: "optional",
    calc: "Estimate my size",
    reset: "Clear",
    estimate: "YOUR ESTIMATE",
    resultInitial: "Your measurements will reveal a starting point.",
    resultStandard: "Milos BG standard size",
    resultCustom: "Custom size by request",
    resultBespoke: "Individual fitting advised",
    resultStandardDesc: "This size belongs to our standard production. Check the intended fit on each product page.",
    resultCustomDesc: "This is a theoretical reference extrapolated from our standard sizes. Availability and final measurements require confirmation before production.",
    resultBespokeDesc: "Your proportions don't fall within one consistent size band. Contact us for individual guidance.",
    approx: "Estimated body measurement ranges",
    disclaimer: "Indicative simulator only: neither fit nor feasibility of custom sizes is guaranteed.",
    simError: "Enter a valid chest measurement (50–230 cm), and check optional measurements.",
    simRequest: "Ask for guidance",
    fitLabel: "THE RIGHT FIT",
    adviceLead: "Size is a measurement. Fit is a choice.",
    fitShort: "Closer fit",
    fitShortDesc: "Between two sizes? The smaller one generally provides a more fitted silhouette.",
    fitRoomy: "Relaxed fit",
    fitRoomyDesc: "The larger size offers more ease. The garment's actual cut also matters.",
    fitProduct: "Every piece has its own character",
    fitProductDesc: "Body measurements are a reference. Actual garment dimensions and fits can vary by product.",
    faqLead: "Answers before you decide.",
    finalEyebrow: "TAKE THE NEXT STEP",
    finalTitle: "Your next piece begins here.",
    finalDesc: "A measurement, a fit, an intention: find the piece that moves with you through the GRIND.",
    viewOutfits: "Discover outfits",
    contact: "Contact us",
    resultContact: "Confirm my size",
    standardS: "Standard",
  };

  const localizedHref = (href: string) => fr ? `${href}${href.includes("?") ? "&" : "?"}lang=fr` : href;
  const navItems = [
    { n: "01", name: ui.navChart, href: "#measurements" },
    { n: "02", name: ui.navMeasure, href: "#how-to-measure" },
    { n: "03", name: ui.navSimulator, href: "#size-simulator" },
    { n: "04", name: ui.navAdvice, href: "#fit-advice" },
  ];
  const measures = [
    { name: copy.chest, description: copy.chestDescription, icon: MoveHorizontal },
    { name: copy.waist, description: copy.waistDescription, icon: Ruler },
    { name: copy.hips, description: copy.hipsDescription, icon: MoveHorizontal },
    { name: copy.inseam, description: copy.inseamDescription, icon: ArrowDown },
  ];

  function updateSimValue(field: SimField, value: string) {
    setSimValues((prev) => ({ ...prev, [field]: value }));
    setSimResult(null);
    setSimError("");
  }

  function changeUnit(next: Unit) {
    if (next === unit) return;
    const nextValues = { ...simValues };
    FIELDS.forEach((field) => {
      const raw = simValues[field].trim();
      if (!raw) return;
      const parsed = Number(raw.replace(",", "."));
      if (!Number.isFinite(parsed)) return;
      nextValues[field] = String(Math.round((next === "cm" ? parsed * 2.54 : parsed / 2.54) * 10) / 10);
    });
    setSimValues(nextValues);
    setUnit(next);
    setSimResult(null);
    setSimError("");
  }

  function runSimulation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values: Partial<Record<SimField, number>> = {};
    let invalid = !simValues.chest.trim();
    FIELDS.forEach((field) => {
      const raw = simValues[field].trim();
      if (!raw) return;
      const value = Number(raw.replace(",", "."));
      const cm = unit === "in" ? value * 2.54 : value;
      if (!Number.isFinite(cm) || cm < 50 || cm > 230) invalid = true;
      else values[field] = cm;
    });
    if (invalid) {
      setSimError(ui.simError);
      setSimResult(null);
      return;
    }
    setSimError("");
    const size = estimateFit(values);
    setSimResult(size);
    if (size === "S" || size === "M" || size === "L") setSelectedSize(size);
  }

  function resetSimulation() {
    setSimValues({ chest: "", waist: "", hip: "" });
    setSimResult(null);
    setSimError("");
  }

  const isStandard = simResult === "M" || simResult === "L" || simResult === "S";
  const isExtended = simResult !== null && simResult !== "custom" && !isStandard;
  const displayNumber = (value: number) => unit === "cm" ? String(value) : String(Math.round(value / 2.54 * 10) / 10);

  return (
    <main className="min-h-screen overflow-x-clip bg-[#FFFFFF] font-kanit text-[#000000] selection:bg-[#00821A] selection:text-white">
      {/* Intro: editorial + product illustration */}
      <section className="relative overflow-hidden border-b border-white/10 bg-[#000000] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_84%_26%,rgba(0,130,26,0.17),transparent_55%)]" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-52 size-[430px] rounded-full border border-white/10 sm:size-[650px]" />
        <Container>
          <div className="relative grid gap-9 py-8 sm:py-12 lg:min-h-[580px] lg:grid-cols-[minmax(0,1.1fr)_minmax(0,.9fr)] lg:items-center lg:gap-14 lg:py-16">
            <div className="min-w-0">
              <nav aria-label={fr ? "Fil d'Ariane" : "Breadcrumb"} className="mb-8 flex flex-wrap items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.1em] text-white/55">
                <Link href={localizedHref("/")} className={`transition-colors hover:text-[#00821A] ${focusRingDark}`}>MILOS BG</Link>
                <span aria-hidden="true" className="text-[#00821A]">/</span>
                <span className="text-white">{copy.breadcrumb}</span>
              </nav>

              <div className="mb-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#00821A]">
                <span aria-hidden="true" className="h-[2px] w-8 bg-[#00821A]" />
                {ui.eyebrow}
              </div>
              <h1 className="max-w-[790px] text-[clamp(2.4rem,8vw,5.5rem)] font-black uppercase leading-[.94] tracking-[-0.055em]">
                {fr ? <>Trouvez <span className="text-[#00821A]">votre</span><br />juste taille.</> : <>Find <span className="text-[#00821A]">your</span><br />right fit.</>}
              </h1>
              <p className="mt-7 max-w-xl text-base font-semibold leading-6 text-white sm:text-lg">{ui.heroLead}</p>
              <p className="mt-3 max-w-lg text-[13px] leading-6 text-white/60 sm:text-sm sm:leading-7">{ui.heroDetail}</p>

              <div className="mt-7 flex flex-wrap gap-2 sm:mt-9 sm:gap-3">
                <a href="#measurements" className={buttonPrimary}>{ui.start}<ArrowRight size={15} aria-hidden="true" /></a>
                <a href="#size-simulator" className={buttonOutline}>{ui.trySim}<ScanLine size={15} aria-hidden="true" /></a>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-2 border-t border-white/10 pt-5 sm:mt-10" aria-label={ui.chapter}>
                {ui.stages.map((step, index) => (
                  <div key={step} className="min-w-0 border-l-2 border-[#00821A]/50 pl-3">
                    <span className="block text-[10px] font-black text-[#00821A]">0{index + 1}</span>
                    <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.05em] text-white/70 sm:text-[11px]">{step}</span>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
                <Globe2 size={15} className="text-[#00821A]" aria-hidden="true" />
                <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-white/60">{ui.language}</span>
                <div role="group" aria-label={ui.language} className="inline-flex border border-white/20 bg-white/[0.04] p-1">
                  {(["en", "fr"] as const).map((value) => (
                    <Link
                      key={value}
                      href={value === "en" ? "/size-guide" : "/size-guide?lang=fr"}
                      hrefLang={value}
                      aria-current={lang === value ? "page" : undefined}
                      className={`flex min-h-9 min-w-12 items-center justify-center text-[11px] font-bold uppercase tracking-[0.07em] transition-colors ${focusRingDark} ${lang === value ? "bg-[#00821A] text-white" : "text-white/55 hover:bg-white/10 hover:text-white"}`}
                    >{value}</Link>
                  ))}
                </div>
              </div>
            </div>

            <div className="relative min-w-0 overflow-hidden border border-white/10 bg-[#BFBFBF] text-[#000000]">
              <div className="pointer-events-none absolute -right-[20%] top-[3%] size-[80%] rounded-full border border-black/10" aria-hidden="true" />
              <div className="pointer-events-none absolute -bottom-[26%] -left-[20%] size-[75%] rounded-full border border-[#00821A]/15" aria-hidden="true" />
              <div className="relative flex aspect-[1.45/1] items-center justify-center sm:aspect-[1.65/1] lg:aspect-[.92/1]">
                <span className="absolute left-4 top-4 z-10 text-[10px] font-bold uppercase tracking-[0.17em] text-[#00821A] sm:left-6 sm:top-6">M / L / S</span>
                <Image
                  src={Grinder}
                  priority
                  alt=""
                  sizes="(max-width: 1023px) 90vw, 42vw"
                  className="relative z-[1] h-[76%] w-auto max-w-[76%] object-contain drop-shadow-[0_18px_18px_rgba(0,0,0,0.15)] motion-safe:animate-[mbg-fit-appear_800ms_ease-out_both]"
                />
                <div className="absolute bottom-4 right-4 z-10 border-l-2 border-[#00821A] pl-3 text-right sm:bottom-6 sm:right-6">
                  <span className="block text-[9px] font-semibold uppercase tracking-[0.15em] text-black/60">{ui.standard}</span>
                  <span className="block text-2xl font-black tracking-[-0.05em] sm:text-3xl">M · L · S</span>
                </div>
              </div>
              <div className="relative z-10 flex items-center justify-between gap-3 border-t border-black/10 bg-[#FFFFFF] px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.1em] sm:px-6">
                <span>{ui.madeToOrder}</span>
                <span className="text-[#00821A]">✿</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Compact wayfinding */}
      <section className="border-b border-black/10 bg-white" aria-label={ui.nav}>
        <Container>
          <div className="grid grid-cols-2 gap-2 py-4 sm:grid-cols-4 sm:gap-3 sm:py-5">
            {navItems.map((item) => (
              <a key={item.n} href={item.href} className={`group flex min-h-12 min-w-0 items-center justify-between gap-2 border border-black/10 px-3 py-2.5 transition-[background-color,border-color] hover:border-[#00821A]/50 hover:bg-[#00821A]/[0.035] sm:px-4 ${focusRing}`}>
                <span className="flex min-w-0 items-center gap-2">
                  <span className="text-[10px] font-black text-[#00821A]">{item.n}</span>
                  <span className="min-w-0 truncate text-[11px] font-semibold uppercase tracking-[0.03em]">{item.name}</span>
                </span>
                <ArrowUpRight size={15} className="shrink-0 text-[#00821A] transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </a>
            ))}
          </div>
        </Container>
      </section>

      {/* 01 · TABLE */}
      <section id="measurements" className="scroll-mt-24 bg-[#FFFFFF]">
        <Container>
          <div className={sectionSpacing}>
            <SectionHeading number="01" eyebrow={copy.tableEyebrow} title={copy.bodyMeasurements} description={copy.tableDescription} />
            <div className="mt-7 overflow-hidden border border-black/10 bg-white sm:mt-10">
              <div className="grid gap-5 border-b border-black/10 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:p-6 lg:p-8">
                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#404040]">{ui.chooseSize}</p>
                  <div role="group" aria-label={ui.chooseSize} className="flex gap-2">
                    {SIZE_ORDER.map((size) => (
                      <button key={size} type="button" aria-pressed={selectedSize === size} onClick={() => setSelectedSize(size)} className={`flex h-12 w-14 items-center justify-center border text-lg font-black transition-[background-color,border-color,color,transform] duration-300 sm:h-14 sm:w-16 ${focusRing} ${selectedSize === size ? "border-[#00821A] bg-[#00821A] text-white" : "border-black/15 bg-white text-[#000000] hover:border-[#00821A] hover:text-[#00821A]"}`}>{size}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.14em] text-[#404040]">{ui.units}</p>
                  <div role="group" aria-label={ui.units} className="inline-flex border border-black/15 bg-[#FFFFFF] p-1">
                    {(["cm", "in"] as const).map((value) => (
                      <button key={value} type="button" aria-pressed={unit === value} onClick={() => changeUnit(value)} className={`min-h-10 min-w-14 px-3 text-[11px] font-bold uppercase transition-colors ${focusRing} ${unit === value ? "bg-[#000000] text-white" : "text-black/60 hover:text-[#00821A]"}`}>{value}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2 border-b border-black/10 bg-[#FFFFFF] px-4 py-3 sm:px-6">
                <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.07em] text-[#404040]"><CircleHelp size={14} className="text-[#00821A]" aria-hidden="true" /> {ui.bodyNote}</span>
                <span className="hidden text-[10px] font-bold uppercase tracking-[0.08em] text-[#00821A] sm:block">{ui.selected}: {selectedSize}</span>
              </div>

              {/* Accessible full comparison on desktop */}
              <div className="hidden md:block">
                <table className="w-full table-fixed border-collapse text-left">
                  <caption className="sr-only">{copy.bodyMeasurements} ({unit})</caption>
                  <thead>
                    <tr className="bg-[#000000] text-white">
                      <th scope="col" className="w-[34%] px-6 py-5 text-[11px] font-semibold uppercase tracking-[0.09em]">{copy.measurement}</th>
                      {SIZE_ORDER.map((size) => (
                        <th key={size} scope="col" className={`border-l border-white/10 px-4 py-4 text-center text-xl font-black ${selectedSize === size ? "bg-[#00821A]" : ""}`}>{size}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MEASUREMENTS.map((measurement, index) => (
                      <tr key={measurement.key} className={`border-t border-black/10 ${index % 2 ? "bg-[#FFFFFF]" : "bg-white"}`}>
                        <th scope="row" className="px-6 py-5 text-[12px] font-semibold text-[#404040]">{measurement.label[lang]}</th>
                        {SIZE_ORDER.map((size) => (
                          <td key={size} className={`border-l border-black/10 px-4 py-5 text-center text-[13px] font-semibold tabular-nums ${selectedSize === size ? "bg-[#00821A]/[0.08] text-[#00821A]" : "text-[#404040]"}`}>{measurement.values[size][unit]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* One clearly readable size-sheet on narrow screens */}
              <div className="md:hidden">
                <div className="flex items-center justify-between bg-[#000000] px-4 py-4 text-white">
                  <span className="text-[11px] font-bold uppercase tracking-[0.07em]">{ui.selected}</span>
                  <span className="text-3xl font-black leading-none text-[#00821A]">{selectedSize}</span>
                </div>
                <dl>
                  {MEASUREMENTS.map((measurement, index) => (
                    <div key={measurement.key} className={`flex items-center justify-between gap-4 border-b border-black/10 px-4 py-4 ${index % 2 ? "bg-[#FFFFFF]" : "bg-white"}`}>
                      <dt className="min-w-0 text-[12px] font-medium text-[#404040]">{measurement.label[lang]}</dt>
                      <dd className="shrink-0 text-right text-[13px] font-bold tabular-nums text-[#000000]">{measurement.values[selectedSize][unit]}</dd>
                    </div>
                  ))}
                </dl>
              </div>
              <div className="flex items-start gap-3 bg-[#BFBFBF]/15 p-4 sm:p-6">
                <ShieldCheck size={18} className="mt-0.5 shrink-0 text-[#00821A]" aria-hidden="true" />
                <p className="text-[12px] leading-6 text-[#404040]">{ui.guideNote} {unit === "in" ? (fr ? "La stature est donnée en pieds et pouces." : "Body height is in feet and inches.") : ""}</p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 02 · MEASUREMENTS */}
      <section id="how-to-measure" className="scroll-mt-24 border-y border-black/10 bg-white">
        <Container>
          <div className={sectionSpacing}>
            <SectionHeading number="02" eyebrow={ui.measureLabel} title={copy.howToMeasure} description={copy.howToMeasureDescription} />
            <div className="mt-8 flex items-center gap-2 text-[11px] font-semibold text-[#00821A] sm:mt-10"><Ruler size={16} aria-hidden="true" /> {ui.measureN}</div>
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {measures.map((measure, index) => {
                const Icon = measure.icon;
                return (
                  <article key={measure.name} className="group relative overflow-hidden border border-black/10 bg-[#FFFFFF] p-5 transition-[border-color,transform] duration-300 hover:border-[#00821A]/60 motion-safe:hover:-translate-y-1 sm:p-6">
                    <span aria-hidden="true" className="absolute left-0 top-0 h-[2px] w-0 bg-[#00821A] transition-[width] duration-500 group-hover:w-full" />
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex size-11 items-center justify-center border border-[#00821A]/15 bg-white text-[#00821A]"><Icon size={20} strokeWidth={1.7} aria-hidden="true" /></span>
                      <span className="text-[11px] font-bold text-black/30">0{index + 1}</span>
                    </div>
                    <h3 className="mt-7 text-[16px] font-extrabold uppercase tracking-[-0.015em]">{measure.name}</h3>
                    <p className="mt-3 text-[12px] leading-[1.75] text-[#404040]">{measure.description}</p>
                  </article>
                );
              })}
            </div>
            <div className="mt-5 flex items-start gap-3 border-l-[3px] border-[#00821A] bg-[#BFBFBF]/15 p-4 sm:p-5"><CircleHelp size={18} className="mt-0.5 shrink-0 text-[#00821A]" aria-hidden="true" /><p className="text-[12px] leading-6 text-[#404040]">{ui.measureTip}</p></div>
          </div>
        </Container>
      </section>

      {/* 03 · SIZE FINDER */}
      <section id="size-simulator" className="relative scroll-mt-24 overflow-hidden bg-[#000000] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute right-[-200px] top-[-220px] size-[500px] rounded-full border border-[#00821A]/20" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_100%_10%,rgba(0,130,26,0.16),transparent_60%)]" />
        <Container>
          <div className={`relative ${sectionSpacing}`}>
            <SectionHeading dark number="03" eyebrow={ui.fitBespoke} title={fr ? "Trouvez votre repère." : "Find your reference."} description={ui.simIntro} />
            <div className="mt-8 grid overflow-hidden border border-white/15 bg-[#404040] sm:mt-10 lg:grid-cols-[minmax(0,1.07fr)_minmax(0,.93fr)]">
              <form onSubmit={runSimulation} noValidate className="min-w-0 p-5 sm:p-8 lg:p-10">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.08em]"><Calculator size={17} className="text-[#00821A]" aria-hidden="true" /> {fr ? "Vos mensurations" : "Your measurements"}</p>
                  <span className="border border-white/20 px-2 py-1 text-[10px] font-bold text-white/65">{unit.toUpperCase()}</span>
                </div>
                <p className="mt-3 max-w-lg text-[12px] leading-6 text-white/60">{ui.simulatorHint}</p>
                <div className="mt-7 grid gap-4 sm:grid-cols-3">
                  {FIELDS.map((field) => (
                    <div key={field} className="min-w-0">
                      <label htmlFor={`sim-${field}`} className="mb-2 flex flex-wrap gap-1 text-[11px] font-semibold">
                        {field === "chest" ? ui.chestRequired : field === "waist" ? copy.waist : copy.hips}
                        {field !== "chest" && <span className="text-[10px] font-normal text-white/45">({ui.optional})</span>}
                      </label>
                      <div className="relative">
                        <input
                          id={`sim-${field}`}
                          name={field}
                          type="number"
                          inputMode="decimal"
                          min={unit === "cm" ? 50 : 19.7}
                          max={unit === "cm" ? 230 : 90.6}
                          step="any"
                          placeholder={unit === "cm" ? field === "chest" ? "99" : field === "waist" ? "82" : "100" : field === "chest" ? "39" : field === "waist" ? "32" : "39.4"}
                          required={field === "chest"}
                          aria-invalid={Boolean(simError) && field === "chest"}
                          aria-describedby={simError && field === "chest" ? "fit-error" : undefined}
                          value={simValues[field]}
                          onChange={(event: ChangeEvent<HTMLInputElement>) => updateSimValue(field, event.target.value)}
                          className={`h-12 w-full min-w-0 border bg-[#000000] px-3 pr-9 text-[14px] font-semibold tabular-nums text-white outline-none transition-[border-color,box-shadow] placeholder:text-white/25 focus:border-[#00821A] focus:ring-1 focus:ring-[#00821A] ${simError && field === "chest" ? "border-red-500" : "border-white/20"}`}
                        />
                        <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] text-white/40">{unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {simError && <p id="fit-error" role="alert" className="mt-3 text-[11px] leading-5 text-red-300">{simError}</p>}
                <div className="mt-7 flex flex-wrap gap-2">
                  <button type="submit" className={`${buttonPrimary} flex-1 sm:flex-none`}>{ui.calc}<ArrowRight size={15} aria-hidden="true" /></button>
                  <button type="button" onClick={resetSimulation} className={buttonOutline}><RotateCcw size={14} aria-hidden="true" /> {ui.reset}</button>
                </div>
              </form>
              <div aria-live="polite" aria-atomic="true" className="flex min-w-0 flex-col justify-between gap-6 border-t border-white/15 bg-[#404040]/30 p-5 sm:p-8 lg:border-l lg:border-t-0 lg:p-10">
                <div>
                  <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.15em] text-[#00821A]"><ScanLine size={15} aria-hidden="true" /> {ui.estimate}</p>
                  {simResult === null ? (
                    <div className="mt-7 flex min-h-[115px] items-center gap-4 border-l-2 border-white/15 pl-5">
                      <Ruler size={29} className="shrink-0 text-white/25" aria-hidden="true" />
                      <p className="max-w-xs text-[13px] leading-6 text-white/60">{ui.resultInitial}</p>
                    </div>
                  ) : (
                    <div className="mt-6 motion-safe:animate-[mbg-fit-appear_500ms_ease-out_both]">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/55">{isStandard ? ui.resultStandard : isExtended ? ui.resultCustom : ui.resultBespoke}</p>
                      <p className="mt-2 text-[clamp(2.6rem,8vw,4.5rem)] font-black uppercase leading-none tracking-[-0.06em] text-[#00821A]">{simResult === "custom" ? (fr ? "Sur mesure" : "Custom") : simResult}</p>
                      <p className="mt-5 max-w-md text-[12px] leading-[1.8] text-white/70">{isStandard ? ui.resultStandardDesc : isExtended ? ui.resultCustomDesc : ui.resultBespokeDesc}</p>
                      {simResult !== null && simResult !== "custom" && !isStandard && (
                        <div className="mt-5 border-t border-white/15 pt-5">
                          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.09em] text-white/55">{ui.approx} ({unit})</p>
                          <dl className="space-y-2 text-[11px]">
                            {FIELDS.map((field) => (
                              <div key={field} className="flex items-center justify-between gap-3">
                                <dt className="text-white/65">{field === "chest" ? copy.chest : field === "waist" ? copy.waist : copy.hips}</dt>
                                <dd className="font-bold tabular-nums">{displayNumber(BODY_BANDS[simResult][field][0])}–{displayNumber(BODY_BANDS[simResult][field][1])}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="border-t border-white/15 pt-5">
                  <p className="text-[11px] leading-[1.8] text-white/55">{ui.disclaimer}</p>
                  <Link href={localizedHref("/contact")} className={`mt-4 inline-flex min-h-10 items-center gap-2 text-[11px] font-bold uppercase tracking-[0.06em] text-[#00821A] hover:text-white ${focusRingDark}`}>{ui.resultContact}<ArrowUpRight size={15} aria-hidden="true" /></Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 04 · FIT ADVICE */}
      <section id="fit-advice" className="scroll-mt-24 bg-[#FFFFFF]">
        <Container>
          <div className={sectionSpacing}>
            <SectionHeading number="04" eyebrow={ui.fitLabel} title={ui.adviceLead} description={copy.choosingDescription} />
            <div className="mt-8 grid gap-3 md:grid-cols-3 sm:mt-10">
              {[
                { number: "01", title: ui.fitShort, body: ui.fitShortDesc },
                { number: "02", title: ui.fitRoomy, body: ui.fitRoomyDesc },
                { number: "03", title: ui.fitProduct, body: ui.fitProductDesc },
              ].map((tip, index) => (
                <article key={tip.number} className={`group min-w-0 border p-6 transition-[transform,border-color] duration-300 motion-safe:hover:-translate-y-1 sm:p-8 ${index === 0 ? "border-[#404040] bg-[#404040] text-white" : "border-black/10 bg-white text-[#000000] hover:border-[#00821A]/45"}`}>
                  <div className="flex items-center justify-between gap-3"><span className={`text-[11px] font-bold ${index === 0 ? "text-[#00821A]" : "text-[#00821A]"}`}>{tip.number}</span><MoveHorizontal size={18} className={index === 0 ? "text-white/45" : "text-black/35"} aria-hidden="true" /></div>
                  <h3 className="mt-12 text-[17px] font-extrabold uppercase leading-tight tracking-[-0.025em]">{tip.title}</h3>
                  <p className={`mt-3 text-[12px] leading-[1.8] ${index === 0 ? "text-white/70" : "text-[#404040]"}`}>{tip.body}</p>
                  {index === 2 && <Link href={localizedHref("/products")} className={`${buttonLight} mt-6`}>{copy.products}<ArrowRight size={14} aria-hidden="true" /></Link>}
                </article>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ · accessible accordion */}
      <section className="border-t border-black/10 bg-white">
        <Container>
          <div className={`${sectionSpacing} grid gap-8 lg:grid-cols-[minmax(0,.7fr)_minmax(0,1.3fr)] lg:gap-16`}>
            <div><SectionHeading number="05" eyebrow={copy.faqEyebrow} title={copy.faqTitle} description={ui.faqLead} /></div>
            <div className="space-y-2">
              {copy.faq.map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <article key={item.q} className={`overflow-hidden border transition-colors duration-300 ${isOpen ? "border-[#00821A]/60" : "border-black/10"}`}>
                    <h3>
                      <button type="button" id={`size-faq-question-${index}`} aria-controls={`size-faq-answer-${index}`} aria-expanded={isOpen} onClick={() => setOpenFaq(isOpen ? null : index)} className={`flex min-h-16 w-full items-center justify-between gap-4 px-4 py-4 text-left transition-colors hover:bg-[#FFFFFF] sm:px-5 ${focusRing}`}>
                        <span className="text-[12px] font-semibold leading-6 sm:text-[13px]">{item.q}</span>
                        <span className={`flex size-8 shrink-0 items-center justify-center border transition-colors ${isOpen ? "border-[#00821A] bg-[#00821A] text-white" : "border-black/10 bg-[#FFFFFF] text-black"}`}><ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" /></span>
                      </button>
                    </h3>
                    {isOpen && <div id={`size-faq-answer-${index}`} role="region" aria-labelledby={`size-faq-question-${index}`} className="border-t border-black/10 bg-[#FFFFFF] px-4 py-5 sm:px-5"><p className="text-[12px] leading-[1.85] text-[#404040] sm:text-[13px]">{item.a}</p></div>}
                  </article>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-[#000000] text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_0%_100%,rgba(0,130,26,0.16),transparent_60%)]" />
        <Container>
          <div className={`${sectionSpacing} relative grid gap-7 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-12`}>
            <div className="max-w-2xl">
              <div className="mb-4 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.18em] text-[#00821A]"><span className="h-[2px] w-8 bg-[#00821A]" /> {ui.finalEyebrow}</div>
              <h2 className="text-[clamp(2rem,7vw,3.8rem)] font-black uppercase leading-[1.02] tracking-[-0.045em]">{ui.finalTitle}</h2>
              <p className="mt-5 max-w-xl text-[13px] leading-7 text-white/65">{ui.finalDesc}</p>
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              <Link href={localizedHref("/products")} className={buttonPrimary}>{ui.viewOutfits}<ArrowRight size={16} aria-hidden="true" /></Link>
              <Link href={localizedHref("/contact")} className={buttonOutline}>{ui.contact}<ArrowUpRight size={16} aria-hidden="true" /></Link>
            </div>
          </div>
        </Container>
      </section>

      <style jsx global>{`
        @keyframes mbg-fit-appear {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          [class*="mbg-fit-appear"] { animation: none !important; }
        }
      `}</style>
    </main>
  );
}

function SectionHeading({ number, eyebrow, title, description, dark = false }: {
  number: string;
  eyebrow?: string;
  title: string;
  description?: string;
  dark?: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-[55px_minmax(0,1fr)] sm:gap-5">
      <div className="flex items-center gap-2 text-[11px] font-black tracking-[0.08em] text-[#00821A]">
        {number}<span aria-hidden="true" className="h-px w-6 bg-[#00821A]/60" />
      </div>
      <div className="max-w-3xl">
        {eyebrow && <p className={`mb-3 text-[10px] font-bold uppercase tracking-[0.15em] ${dark ? "text-[#00821A]" : "text-[#404040]"}`}>{eyebrow}</p>}
        <h2 className={`text-[clamp(1.8rem,5vw,3.2rem)] font-black uppercase leading-[1.06] tracking-[-0.045em] ${dark ? "text-white" : "text-[#000000]"}`}>{title}</h2>
        {description && <p className={`mt-4 max-w-2xl text-[13px] leading-7 sm:text-sm ${dark ? "text-white/60" : "text-[#404040]"}`}>{description}</p>}
      </div>
    </div>
  );
}
