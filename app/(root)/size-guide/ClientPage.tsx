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
  Calculator,
  RotateCcw,
  MoveHorizontal,
  Ruler,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type FormEvent, useState } from "react";

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
const STANDARDS: ExtendedSize[] = ["M", "L", "S"];

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

const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00821A] focus-visible:ring-offset-2";
const primaryButton =
  `inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-[#00821A] px-[21px] py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.07em] text-white transition-colors duration-200 hover:bg-[#006a17] active:bg-[#005b12] ${focusRing}`;
const secondaryButton =
  `inline-flex min-h-11 items-center justify-center gap-2 rounded-sm border border-black/20 bg-white px-[21px] py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.07em] text-black transition-colors duration-200 hover:border-[#00821A] hover:text-[#00821A] ${focusRing}`;
const sectionSpace = "py-[34px] sm:py-[55px] lg:py-[89px]";

export default function ClientPage({ lang }: Props) {
  const copy = COPY[lang];
  const fr = lang === "fr";
  const [unit, setUnit] = useState<Unit>("cm");
  const [selectedSize, setSelectedSize] = useState<SizeKey>("M");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [simValues, setSimValues] = useState<SimValues>({ chest: "", waist: "", hip: "" });
  const [simResult, setSimResult] = useState<SimResult | null>(null);
  const [simError, setSimError] = useState("");

  const ui = fr
    ? {
        language: "Langue",
        sizeRange: "Tailles standards : M · L · S",
        chartLink: "Voir les tailles",
        simulatorLink: "Simuler ma taille",
        navigation: "Navigation du guide",
        unitLabel: "Unité",
        selectSize: "Comparer les tailles",
        customShort: "Autres tailles : sur demande",
        standardLabel: "Standard",
        sizeInstruction: "Sélectionnez M, L ou S pour voir ses mesures.",
        measureTag: "4 gestes simples",
        inchesNote: "La stature est indiquée en pieds et pouces ; les autres valeurs en pouces.",
        simulatorEyebrow: "TAILLES PERSONNALISÉES",
        simulatorTitle: "Une autre taille ?",
        simulatorIntro: "Indiquez votre tour de poitrine et, si vous le souhaitez, votre taille et vos hanches. Nous estimons le repère le plus proche, même hors des tailles standards.",
        simulatorStep: "Vos mensurations",
        chestRequired: "Poitrine *",
        optional: "Facultatif",
        example: "Ex.",
        calc: "Estimer ma taille",
        reset: "Effacer",
        resultsTitle: "Votre estimation",
        initial: "Votre résultat apparaîtra ici.",
        resultStandard: "Taille standard",
        resultCustom: "Taille personnalisée — sur demande",
        resultBespoke: "Coupe personnalisée à étudier",
        standardDescription: "Cette taille fait partie des trois tailles standards Milos BG. Vérifiez la coupe sur la fiche produit.",
        customDescription: "Repère théorique extrapolé des tailles standards : cette taille n'est pas une taille de série et doit être confirmée avant confection.",
        bespokeDescription: "Vos proportions sortent des repères simulés ou correspondent à plusieurs tailles éloignées. Une étude personnalisée sera plus fiable.",
        indicative: "Estimation indicative, pas une garantie d'ajustement. Les autres tailles ne sont pas des tailles standards : leur faisabilité et leurs dimensions sont à confirmer.",
        contact: "Demander conseil",
        error: "Saisissez un tour de poitrine valide (50 à 230 cm, ou équivalent en pouces). Vérifiez également les mesures facultatives.",
        approx: "Fourchettes théoriques du corps",
        detailUnit: "en",
        tips: "Mesurez-vous sans serrer le mètre. Les champs taille et hanches sont facultatifs.",
        fitHeading: "Bien choisir sa coupe",
      }
    : {
        language: "Language",
        sizeRange: "Standard sizes: M · L · S",
        chartLink: "View size chart",
        simulatorLink: "Find my size",
        navigation: "Guide navigation",
        unitLabel: "Unit",
        selectSize: "Compare sizes",
        customShort: "Other sizes: by request",
        standardLabel: "Standard",
        sizeInstruction: "Select M, L or S to view its measurements.",
        measureTag: "4 simple steps",
        inchesNote: "Height is displayed in feet and inches; all other measurements are in inches.",
        simulatorEyebrow: "CUSTOM SIZING",
        simulatorTitle: "Need another size?",
        simulatorIntro: "Enter your chest measurement and, if you like, your waist and hips. We'll estimate the nearest reference, including sizes outside our standard range.",
        simulatorStep: "Your body measurements",
        chestRequired: "Chest *",
        optional: "Optional",
        example: "E.g.",
        calc: "Estimate my size",
        reset: "Clear",
        resultsTitle: "Your estimate",
        initial: "Your result will appear here.",
        resultStandard: "Standard size",
        resultCustom: "Custom size — by request",
        resultBespoke: "Individual sizing advised",
        standardDescription: "This is one of the three Milos BG standard sizes. Check each product's intended fit before ordering.",
        customDescription: "A theoretical reference extrapolated from the standard sizes: not an off-the-rack size, and subject to confirmation before production.",
        bespokeDescription: "Your proportions extend beyond the simulated bands or span distant size categories. Individual guidance is more reliable.",
        indicative: "Indicative estimate, not a fit guarantee. Other sizes are non-standard; feasibility and final dimensions must be confirmed.",
        contact: "Ask for guidance",
        error: "Enter a valid chest measurement (50–230 cm, or the equivalent in inches). Check optional measurements too.",
        approx: "Estimated body ranges",
        detailUnit: "in",
        tips: "Measure without tightening the tape. Waist and hips are optional.",
        fitHeading: "Choosing your fit",
      };

  const localizedHref = (href: string) =>
    fr ? `${href}${href.includes("?") ? "&" : "?"}lang=fr` : href;

  const nav = [
    { number: "01", label: copy.measurementsLink, href: "#measurements" },
    { number: "02", label: copy.measureLink, href: "#how-to-measure" },
    { number: "03", label: fr ? "Simulateur" : "Size finder", href: "#size-simulator" },
    { number: "04", label: copy.fitLink, href: "#fit-advice" },
  ];
  const measurementTips = [
    { title: copy.chest, description: copy.chestDescription, icon: MoveHorizontal },
    { title: copy.waist, description: copy.waistDescription, icon: Ruler },
    { title: copy.hips, description: copy.hipsDescription, icon: MoveHorizontal },
    { title: copy.inseam, description: copy.inseamDescription, icon: ArrowDown },
  ];

  const updateSimValue = (field: SimField, value: string) => {
    setSimValues((current) => ({ ...current, [field]: value }));
    setSimResult(null);
    setSimError("");
  };

  const changeUnit = (next: Unit) => {
    if (next === unit) return;
    const converted = { ...simValues };
    FIELDS.forEach((field) => {
      const current = simValues[field].trim();
      if (!current) return;
      const value = Number(current.replace(",", "."));
      if (!Number.isFinite(value)) return;
      converted[field] = String(Math.round((next === "cm" ? value * 2.54 : value / 2.54) * 10) / 10);
    });
    setSimValues(converted);
    setUnit(next);
    setSimResult(null);
    setSimError("");
  };

  const runSimulation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsed: Partial<Record<SimField, number>> = {};
    let invalid = !simValues.chest.trim();
    FIELDS.forEach((field) => {
      if (!simValues[field].trim()) return;
      const number = Number(simValues[field].trim().replace(",", "."));
      const cm = unit === "in" ? number * 2.54 : number;
      if (!Number.isFinite(cm) || cm < 50 || cm > 230) {
        invalid = true;
      } else {
        parsed[field] = cm;
      }
    });
    if (invalid) {
      setSimError(ui.error);
      setSimResult(null);
      return;
    }
    setSimError("");
    const size = estimateFit(parsed);
    setSimResult(size);
    if (size === "S" || size === "M" || size === "L") setSelectedSize(size);
  };

  const resetSimulation = () => {
    setSimValues({ chest: "", waist: "", hip: "" });
    setSimResult(null);
    setSimError("");
  };
  const isStandardResult = simResult !== null && simResult !== "custom" && STANDARDS.includes(simResult);
  const isExtendedResult = simResult !== null && simResult !== "custom" && !isStandardResult;
  const valueDisplay = (cm: number) => unit === "cm" ? String(cm) : String(Math.round((cm / 2.54) * 10) / 10);

  return (
    <main className="min-h-screen overflow-x-clip bg-white font-kanit text-black">
      {/* Compact editorial hero: image does not dominate the mobile viewport. */}
      <section className="border-b border-black/10 bg-[#F8F9F8]">
        <Container>
          <div className="grid min-w-0 gap-[21px] py-[21px] sm:gap-[34px] sm:py-[34px] lg:grid-cols-[minmax(0,1.04fr)_minmax(0,.96fr)] lg:items-center lg:gap-[55px] lg:py-[55px]">
            <div className="min-w-0">
              <nav aria-label={fr ? "Fil d'Ariane" : "Breadcrumb"} className="mb-[21px] flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.08em] sm:mb-[34px]">
                <Link className={`text-black/55 hover:text-[#00821A] ${focusRing}`} href={localizedHref("/")}>MILOS BG</Link>
                <span className="text-black/25">/</span>
                <span className="text-black/85">{copy.breadcrumb}</span>
              </nav>
              <p className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#00821A]">
                <span className="h-0.5 w-[21px] bg-[#00821A]" />{copy.eyebrow}
              </p>
              <h1 className="mt-[13px] max-w-[690px] text-[clamp(2.05rem,8.25vw,3.45rem)] font-semibold leading-[1.04] tracking-[-0.045em] lg:text-[clamp(3.25rem,5vw,5.1rem)]">
                {copy.title}<span className="text-[#00821A]">.</span>
              </h1>
              <p className="mt-[13px] max-w-[530px] text-[13px] leading-[1.7] text-[#404040] sm:mt-[21px] sm:text-sm sm:leading-7">{copy.description}</p>
              <div className="mt-[21px] flex flex-wrap items-center gap-2 text-[10px] font-medium text-[#404040] sm:mt-[34px]">
                <span className="inline-flex items-center gap-1.5 rounded-sm border border-[#00821A]/20 bg-[#00821A]/[0.05] px-2.5 py-1.5 text-[#006b16]">
                  <Check size={13} aria-hidden="true" />{ui.sizeRange}
                </span>
                <span className="inline-flex items-center gap-1.5 px-1 py-1.5"><Ruler size={13} aria-hidden="true" />{ui.customShort}</span>
              </div>
              <div className="mt-[21px] grid grid-cols-2 gap-2 sm:mt-[34px] sm:flex sm:flex-wrap sm:gap-3">
                <a href="#measurements" className={`${primaryButton} min-w-0 px-2.5 sm:px-[21px]`}>{ui.chartLink}<ArrowRight size={14} aria-hidden="true" /></a>
                <a href="#size-simulator" className={`${secondaryButton} min-w-0 px-2.5 sm:px-[21px]`}>{ui.simulatorLink}</a>
              </div>
              <div className="mt-[21px] flex items-center gap-2 border-t border-black/10 pt-[13px] sm:mt-[34px] sm:pt-[21px]">
                <Globe2 size={14} aria-hidden="true" className="text-[#00821A]" />
                <span className="mr-1 text-[10px] font-medium text-black/60">{ui.language}</span>
                <div className="inline-flex gap-1 rounded-sm border border-black/10 bg-white p-[3px]" role="group" aria-label={ui.language}>
                  {(["en", "fr"] as const).map((value) => (
                    <Link
                      key={value}
                      href={value === "en" ? "/size-guide" : "/size-guide?lang=fr"}
                      hrefLang={value}
                      aria-current={lang === value ? "page" : undefined}
                      className={`flex min-h-9 min-w-11 items-center justify-center rounded-sm px-2 text-[10px] font-semibold tracking-[0.08em] transition-colors ${focusRing} ${lang === value ? "bg-black text-white" : "text-black/65 hover:text-[#00821A]"}`}
                    >{value.toUpperCase()}</Link>
                  ))}
                </div>
              </div>
            </div>
            <div className="relative min-w-0 overflow-hidden rounded-sm border border-black/10 bg-[#ECEFEB]">
              <div className="relative flex aspect-[1.82/1] items-center justify-center sm:aspect-[1.65/1] lg:aspect-[.94/1]">
                <span aria-hidden="true" className="absolute inset-x-0 top-0 h-[3px] bg-[#00821A]" />
                <span className="absolute left-[13px] top-[13px] text-[9px] font-medium uppercase tracking-[0.12em] text-black/45 sm:left-[21px] sm:top-[21px]">MILOS BG / SIZE & FIT</span>
                <Image
                  src={Grinder}
                  alt=""
                  priority
                  sizes="(max-width: 1023px) 100vw, 46vw"
                  className="h-[75%] w-auto max-w-[80%] object-contain drop-shadow-[0_14px_18px_rgba(0,0,0,0.08)]"
                />
                <span className="absolute bottom-[13px] right-[13px] text-[11px] font-semibold tracking-[0.17em] text-[#00821A] sm:bottom-[21px] sm:right-[21px]">M / L / S</span>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <nav aria-label={ui.navigation} className="border-b border-black/10 bg-white">
        <Container>
          <div className="grid grid-cols-2 gap-2 py-[13px] sm:grid-cols-4 sm:gap-3 sm:py-[21px]">
            {nav.map((item) => (
              <a key={item.number} href={item.href} className={`group flex min-h-10 min-w-0 items-center justify-between gap-2 rounded-sm border border-black/10 bg-[#FAFAFA] px-3 py-2 text-[10px] font-semibold transition-colors hover:border-[#00821A]/50 hover:bg-[#00821A]/[0.04] ${focusRing}`}>
                <span className="flex min-w-0 items-center gap-2"><span className="text-[#00821A]">{item.number}</span><span className="truncate">{item.label}</span></span>
                <ArrowRight size={13} className="shrink-0 text-[#00821A]" aria-hidden="true" />
              </a>
            ))}
          </div>
        </Container>
      </nav>

      <section id="measurements" className="scroll-mt-20 bg-white">
        <Container>
          <div className={sectionSpace}>
            <SectionHeading number="01" eyebrow={copy.tableEyebrow} title={copy.bodyMeasurements} description={copy.tableDescription} />
            <div className="mt-[21px] flex flex-wrap items-end justify-between gap-3 rounded-sm border border-black/10 bg-[#F8F9F8] p-[13px] sm:mt-[34px] sm:p-[21px]">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.09em] text-[#404040]">{ui.selectSize}</p>
                <div role="group" aria-label={ui.selectSize} className="flex gap-1.5">
                  {SIZE_ORDER.map((size) => (
                    <button
                      key={size}
                      type="button"
                      aria-pressed={selectedSize === size}
                      onClick={() => setSelectedSize(size)}
                      className={`flex h-11 w-11 items-center justify-center rounded-sm border text-[13px] font-semibold transition-colors sm:h-12 sm:w-12 ${focusRing} ${selectedSize === size ? "border-[#00821A] bg-[#00821A] text-white" : "border-black/15 bg-white hover:border-[#00821A] hover:text-[#00821A]"}`}
                    >{size}</button>
                  ))}
                </div>
              </div>
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.09em] text-[#404040]">{ui.unitLabel}</p>
                <div role="group" aria-label={ui.unitLabel} className="flex gap-1 rounded-sm border border-black/15 bg-white p-[3px]">
                  {(["cm", "in"] as const).map((value) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={unit === value}
                      onClick={() => changeUnit(value)}
                      className={`min-h-10 min-w-12 rounded-sm px-2 text-[11px] font-semibold uppercase transition-colors ${focusRing} ${unit === value ? "bg-black text-white" : "text-black/65 hover:text-[#00821A]"}`}
                    >{value}</button>
                  ))}
                </div>
              </div>
            </div>

            {/* Full table: M, L, S left-to-right, with the chosen column highlighted. */}
            <div className="mt-[13px] hidden overflow-hidden rounded-sm border border-black/10 md:block">
              <table className="w-full table-fixed border-collapse">
                <caption className="sr-only">{copy.bodyMeasurements} ({unit})</caption>
                <thead>
                  <tr className="bg-black text-white">
                    <th scope="col" className="w-[34%] px-[21px] py-[21px] text-left text-[11px] font-semibold uppercase tracking-[0.08em]">{copy.measurement}</th>
                    {SIZE_ORDER.map((size) => (
                      <th key={size} scope="col" className={`border-l border-white/15 px-[13px] py-[13px] text-center text-xl font-semibold ${selectedSize === size ? "bg-[#00821A]" : ""}`}>
                        {size}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MEASUREMENTS.map((measurement, index) => (
                    <tr key={measurement.key} className={`border-t border-black/10 ${index % 2 ? "bg-[#FAFAFA]" : "bg-white"}`}>
                      <th scope="row" className="px-[21px] py-[21px] text-left text-[12px] font-medium">{measurement.label[lang]}</th>
                      {SIZE_ORDER.map((size) => (
                        <td key={size} className={`border-l border-black/10 px-[13px] py-[21px] text-center text-[13px] font-semibold tabular-nums ${selectedSize === size ? "bg-[#00821A]/[0.07] text-[#006b16]" : ""}`}>
                          {measurement.values[size][unit]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Only one size sheet at once on phones, no tall stack of repeated cards. */}
            <div className="mt-[13px] md:hidden">
              <article key={selectedSize} className="overflow-hidden rounded-sm border border-black/10 bg-white">
                <header className="flex items-center justify-between bg-black px-[13px] py-[13px] text-white">
                  <span className="text-[10px] font-medium tracking-[0.07em] text-white/75">{copy.recommended} · {ui.standardLabel}</span>
                  <strong className="text-[21px] font-semibold leading-none text-white">{selectedSize}</strong>
                </header>
                <dl>
                  {MEASUREMENTS.map((measurement, index) => (
                    <div key={measurement.key} className={`flex items-center justify-between gap-[13px] border-t border-black/10 px-[13px] py-[13px] ${index % 2 ? "bg-[#FAFAFA]" : "bg-white"}`}>
                      <dt className="min-w-0 text-[11px] font-medium text-[#404040]">{measurement.label[lang]}</dt>
                      <dd className="shrink-0 text-right text-[13px] font-semibold tabular-nums">{measurement.values[selectedSize][unit]}</dd>
                    </div>
                  ))}
                </dl>
              </article>
              <p className="mt-2 text-[11px] leading-5 text-[#404040]">{ui.sizeInstruction}</p>
            </div>
            <div className="mt-[21px] flex items-start gap-[13px] border-l-[3px] border-[#00821A] bg-[#F8F9F8] px-[13px] py-[13px]">
              <CircleHelp size={16} className="mt-0.5 shrink-0 text-[#00821A]" aria-hidden="true" />
              <p className="text-[11px] leading-[1.7] text-[#404040]">{copy.note}{unit === "in" && ` ${ui.inchesNote}`}</p>
            </div>
          </div>
        </Container>
      </section>

      <section id="how-to-measure" className="scroll-mt-20 border-y border-black/10 bg-[#F8F9F8]">
        <Container>
          <div className={sectionSpace}>
            <SectionHeading number="02" eyebrow={ui.measureTag} title={copy.howToMeasure} description={copy.howToMeasureDescription} />
            <div className="mt-[21px] grid grid-cols-2 gap-2 sm:mt-[34px] sm:gap-[13px] lg:grid-cols-4">
              {measurementTips.map((item, index) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="min-w-0 rounded-sm border border-black/10 bg-white p-[13px] sm:p-[21px]">
                    <div className="flex items-start justify-between gap-1.5">
                      <span className="flex h-[34px] w-[34px] shrink-0 items-center justify-center rounded-sm bg-[#00821A]/[0.07] text-[#00821A] sm:h-11 sm:w-11"><Icon size={17} strokeWidth={1.8} aria-hidden="true" /></span>
                      <span className="text-[10px] font-semibold text-black/30">0{index + 1}</span>
                    </div>
                    <h3 className="mt-[13px] text-[12px] font-semibold sm:mt-[21px] sm:text-sm">{item.title}</h3>
                    <p className="mt-2 text-[11px] leading-[1.65] text-[#404040] sm:text-[13px]">{item.description}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      {/* Custom size finder uses actual standard BODY ranges and extrapolates only as a guide. */}
      <section id="size-simulator" className="scroll-mt-20 bg-white">
        <Container>
          <div className={sectionSpace}>
            <SectionHeading number="03" eyebrow={ui.simulatorEyebrow} title={ui.simulatorTitle} description={ui.simulatorIntro} />
            <div className="mt-[21px] grid overflow-hidden rounded-sm border border-black/10 sm:mt-[34px] lg:grid-cols-[1.08fr_.92fr]">
              <form onSubmit={runSimulation} noValidate className="min-w-0 p-[21px] sm:p-[34px]">
                <div className="flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-[12px] font-semibold"><Calculator size={17} className="text-[#00821A]" aria-hidden="true" />{ui.simulatorStep}</p>
                  <span className="text-[10px] font-medium text-black/50">{unit.toUpperCase()}</span>
                </div>
                <p className="mt-[13px] max-w-lg text-[12px] leading-[1.65] text-[#404040]">{ui.tips}</p>
                <div className="mt-[21px] grid gap-[13px] sm:grid-cols-3">
                  {FIELDS.map((field) => (
                    <div key={field} className="min-w-0">
                      <label htmlFor={`sim-${field}`} className="mb-2 block text-[11px] font-semibold">
                        {field === "chest" ? ui.chestRequired : field === "waist" ? copy.waist : copy.hips}
                        {field !== "chest" && <span className="ml-1 text-[10px] font-normal text-black/55">({ui.optional})</span>}
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
                          aria-invalid={!!simError && field === "chest"}
                          aria-describedby={simError && field === "chest" ? "sim-error" : undefined}
                          value={simValues[field]}
                          onChange={(event) => updateSimValue(field, event.target.value)}
                          className={`h-11 w-full min-w-0 rounded-sm border border-black/20 bg-white px-[13px] pr-9 text-[13px] tabular-nums outline-none transition-colors placeholder:text-black/25 focus:border-[#00821A] focus:ring-1 focus:ring-[#00821A] ${simError && field === "chest" ? "border-red-600" : ""}`}
                        />
                        <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[10px] text-black/40">{unit}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {simError && <p id="sim-error" role="alert" className="mt-[13px] text-[11px] leading-5 text-red-700">{simError}</p>}
                <div className="mt-[21px] flex flex-wrap items-center gap-2">
                  <button type="submit" className={`${primaryButton} flex-1 sm:flex-none`}>
                    {ui.calc}<ArrowRight size={15} aria-hidden="true" />
                  </button>
                  <button type="button" onClick={resetSimulation} className={`${secondaryButton} px-[13px]`}>
                    <RotateCcw size={14} aria-hidden="true" />{ui.reset}
                  </button>
                </div>
              </form>

              <div aria-live="polite" aria-atomic="true" className="flex min-w-0 flex-col justify-between gap-[21px] border-t border-black/10 bg-[#F8F9F8] p-[21px] sm:p-[34px] lg:border-l lg:border-t-0">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#00821A]">{ui.resultsTitle}</p>
                  {simResult === null ? (
                    <div className="mt-[21px] flex min-h-[89px] items-center gap-[13px] border-l-2 border-black/15 pl-[13px]">
                      <Ruler size={23} className="shrink-0 text-black/30" aria-hidden="true" />
                      <p className="text-[13px] leading-6 text-[#404040]">{ui.initial}</p>
                    </div>
                  ) : (
                    <div className="mt-[13px]">
                      <p className="text-[10px] font-semibold uppercase tracking-[0.09em] text-black/55">
                        {isStandardResult ? ui.resultStandard : isExtendedResult ? ui.resultCustom : ui.resultBespoke}
                      </p>
                      <p className="mt-1 text-[clamp(2.4rem,6vw,3.45rem)] font-semibold leading-none tracking-[-0.04em] text-[#00821A]">
                        {simResult === "custom" ? (fr ? "Sur mesure" : "Custom") : simResult}
                      </p>
                      <p className="mt-[13px] text-[12px] leading-[1.7] text-[#404040]">
                        {isStandardResult ? ui.standardDescription : isExtendedResult ? ui.customDescription : ui.bespokeDescription}
                      </p>
                      {isExtendedResult && (
                        <div className="mt-[13px] border-t border-black/10 pt-[13px]">
                          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.07em] text-black/50">{ui.approx} ({unit})</p>
                          <dl className="space-y-1.5 text-[11px]">
                            {FIELDS.map((field) => (
                              <div key={field} className="flex justify-between gap-3">
                                <dt className="text-[#404040]">{field === "chest" ? copy.chest : field === "waist" ? copy.waist : copy.hips}</dt>
                                <dd className="font-semibold tabular-nums">{valueDisplay(BODY_BANDS[simResult][field][0])}–{valueDisplay(BODY_BANDS[simResult][field][1])}</dd>
                              </div>
                            ))}
                          </dl>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div className="border-t border-black/10 pt-[13px]">
                  <p className="text-[11px] leading-[1.7] text-[#404040]">{ui.indicative}</p>
                  <Link href={localizedHref("/contact")} className={`mt-[13px] inline-flex min-h-10 items-center gap-2 text-[11px] font-semibold text-[#006b16] underline decoration-[#00821A]/30 underline-offset-4 hover:decoration-[#00821A] ${focusRing}`}>
                    {ui.contact}<ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="fit-advice" className="scroll-mt-20 border-t border-black/10 bg-[#F8F9F8]">
        <Container>
          <div className={sectionSpace}>
            <SectionHeading number="04" eyebrow={ui.fitHeading} title={copy.fitLink} />
            <div className="mt-[21px] grid gap-[13px] sm:mt-[34px] md:grid-cols-2">
              <article className="rounded-sm bg-black p-[21px] text-white sm:p-[34px]">
                <span className="flex h-[34px] w-[34px] items-center justify-center rounded-sm bg-[#00821A]"><Check size={18} aria-hidden="true" /></span>
                <h3 className="mt-[21px] text-[21px] font-semibold leading-tight">{copy.choosingTitle}</h3>
                <p className="mt-[13px] text-[13px] leading-[1.7] text-white/75">{copy.choosingDescription}</p>
              </article>
              <article className="rounded-sm border border-black/10 bg-white p-[21px] sm:p-[34px]">
                <span className="flex h-[34px] w-[34px] items-center justify-center rounded-sm bg-[#00821A]/[0.07] text-[#00821A]"><Ruler size={18} aria-hidden="true" /></span>
                <h3 className="mt-[21px] text-[21px] font-semibold leading-tight">{copy.productFitTitle}</h3>
                <p className="mt-[13px] text-[13px] leading-[1.7] text-[#404040]">{copy.productFitDescription}</p>
                <Link href={localizedHref("/products")} className={`${secondaryButton} mt-[21px]`}>{copy.products}<ArrowRight size={14} aria-hidden="true" /></Link>
              </article>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-t border-black/10 bg-white">
        <Container>
          <div className={`${sectionSpace} grid gap-[21px] lg:grid-cols-[.75fr_1.25fr] lg:gap-[55px]`}>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#00821A]">{copy.faqEyebrow}</p>
              <h2 className="mt-[13px] text-[clamp(1.55rem,5vw,2.4rem)] font-semibold leading-[1.1] tracking-[-0.03em]">{copy.faqTitle}</h2>
            </div>
            <div className="space-y-2">
              {copy.faq.map((item, index) => {
                const isOpen = openFaq === index;
                return (
                  <article key={item.q} className="overflow-hidden rounded-sm border border-black/10 bg-white">
                    <h3>
                      <button
                        type="button"
                        id={`size-faq-question-${index}`}
                        aria-controls={`size-faq-answer-${index}`}
                        aria-expanded={isOpen}
                        onClick={() => setOpenFaq(isOpen ? null : index)}
                        className={`flex min-h-12 w-full items-center justify-between gap-[13px] px-[13px] py-[13px] text-left hover:bg-[#F8F9F8] sm:px-[21px] ${focusRing}`}
                      >
                        <span className="text-[12px] font-semibold leading-[1.6] sm:text-[13px]">{item.q}</span>
                        <span className={`flex h-[28px] w-[28px] shrink-0 items-center justify-center rounded-sm transition-colors ${isOpen ? "bg-[#00821A] text-white" : "bg-[#F8F9F8] text-black"}`}>
                          <ChevronDown size={15} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} aria-hidden="true" />
                        </span>
                      </button>
                    </h3>
                    {isOpen && (
                      <div id={`size-faq-answer-${index}`} role="region" aria-labelledby={`size-faq-question-${index}`} className="border-t border-black/10 px-[13px] py-[13px] sm:px-[21px]">
                        <p className="text-[12px] leading-[1.7] text-[#404040] sm:text-[13px]">{item.a}</p>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-black text-white">
        <Container>
          <div className={`${sectionSpace} grid gap-[21px] lg:grid-cols-[1.1fr_.9fr] lg:items-end lg:gap-[55px]`}>
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-[#60d178]">{copy.supportEyebrow}</p>
              <h2 className="mt-[13px] text-[clamp(1.75rem,6vw,3.35rem)] font-semibold leading-[1.08] tracking-[-0.035em]">{copy.supportTitle}</h2>
              <p className="mt-[13px] text-[13px] leading-[1.7] text-white/70">{copy.supportDescription}</p>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap lg:justify-end">
              <Link href={localizedHref("/contact")} className={`${primaryButton} min-w-0 px-2 sm:px-[21px]`}>{copy.contact}<ArrowRight size={14} aria-hidden="true" /></Link>
              <Link href={localizedHref("/products")} className={`inline-flex min-h-11 min-w-0 items-center justify-center rounded-sm border border-white/35 px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.07em] text-white transition-colors hover:bg-white hover:text-black sm:px-[21px] ${focusRing}`}>{copy.products}</Link>
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
    <header className="grid gap-[13px] sm:grid-cols-[55px_minmax(0,1fr)] sm:gap-[21px]">
      <div className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] text-[#00821A]">
        {number}<span aria-hidden="true" className="h-px w-[21px] bg-[#00821A]/50" />
      </div>
      <div className="max-w-3xl">
        {eyebrow && <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-black/55">{eyebrow}</p>}
        <h2 className="text-[clamp(1.55rem,5vw,2.8rem)] font-semibold leading-[1.1] tracking-[-0.035em]">{title}</h2>
        {description && <p className="mt-[13px] max-w-2xl text-[13px] leading-[1.7] text-[#404040] sm:text-sm">{description}</p>}
      </div>
    </header>
  );
}
