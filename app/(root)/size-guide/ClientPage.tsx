"use client";

import Container from "@/components/mbg-components/Container";
import { Grinder } from "@/images";

import type { StoreLanguage } from "@/lib/store-language";

import {
  ArrowDown,
  ArrowRight,
  Check,
  CircleHelp,
  MoveHorizontal,
  Ruler,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import React, {
  useMemo,
  useState,
} from "react";

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

export default function ClientPage({
  lang,
}: Props) {
  const copy = COPY[lang];

  const [unit, setUnit] =
    useState<Unit>("cm");

  const [openFaq, setOpenFaq] =
    useState<number | null>(0);

  const measurementTips =
    useMemo(
      () => [
        {
          title: copy.chest,
          description:
            copy.chestDescription,
          icon: MoveHorizontal,
        },

        {
          title: copy.waist,
          description:
            copy.waistDescription,
          icon: Ruler,
        },

        {
          title: copy.hips,
          description:
            copy.hipsDescription,
          icon: MoveHorizontal,
        },

        {
          title: copy.inseam,
          description:
            copy.inseamDescription,
          icon: ArrowDown,
        },
      ],
      [copy],
    );

  const localizedHref = (
    href: string,
  ) => {
    if (lang === "en") {
      return href;
    }

    return `${href}${
      href.includes("?")
        ? "&"
        : "?"
    }lang=fr`;
  };

  return (
    <main className="min-h-screen bg-mbg-white text-mbg-black">
      {/* HERO */}
      <section className="border-b border-mbg-black/10">
        <Container>
          <div className="grid gap-10 py-10 md:grid-cols-[1.05fr_.95fr] md:items-center md:py-16 lg:gap-20 lg:py-20">
            {/* TEXT */}
            <div>
              {/* BREADCRUMB */}
              <nav
                aria-label="Breadcrumb"
                className="mb-8 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em]"
              >
                <Link
                  href={localizedHref(
                    "/",
                  )}
                  className="text-mbg-darkgrey transition-colors hover:text-mbg-black"
                >
                  Milos BG
                </Link>

                <span className="text-mbg-black/20">
                  /
                </span>

                <span>
                  {copy.breadcrumb}
                </span>
              </nav>

              <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-mbg-green">
                {copy.eyebrow}
              </p>

              <h1 className="mt-4 max-w-2xl text-[38px] font-semibold leading-[0.98] tracking-[-0.045em] sm:text-5xl lg:text-[64px]">
                {copy.title}
              </h1>

              <p className="mt-6 max-w-xl text-sm leading-7 text-mbg-darkgrey md:text-base">
                {copy.description}
              </p>

              {/* UNIT + LANG */}
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <div>
                  <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-mbg-darkgrey">
                    {copy.unit}
                  </p>

                  <div className="inline-flex border border-mbg-black/10">
                    {(
                      [
                        "cm",
                        "in",
                      ] as const
                    ).map(
                      (value) => {
                        const active =
                          unit ===
                          value;

                        return (
                          <button
                            key={
                              value
                            }
                            type="button"
                            onClick={() =>
                              setUnit(
                                value,
                              )
                            }
                            aria-pressed={
                              active
                            }
                            className={`
                              min-w-[70px]
                              px-5
                              py-3
                              text-xs
                              font-bold
                              uppercase
                              transition-colors
                              ${
                                active
                                  ? "bg-mbg-black text-mbg-white"
                                  : "bg-mbg-white hover:bg-mbg-black/[0.03]"
                              }
                            `}
                          >
                            {value}
                          </button>
                        );
                      },
                    )}
                  </div>
                </div>

                {/* LANGUAGE */}
                <div>
                  <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.18em] text-mbg-darkgrey">
                    Language
                  </p>

                  <div className="flex min-h-[42px] items-center gap-3 text-xs font-bold">
                    <Link
                      href="/size-guide"
                      aria-current={
                        lang ===
                        "en"
                          ? "page"
                          : undefined
                      }
                      className={
                        lang ===
                        "en"
                          ? "text-mbg-green"
                          : "text-mbg-darkgrey hover:text-mbg-black"
                      }
                    >
                      EN
                    </Link>

                    <span className="text-mbg-black/20">
                      /
                    </span>

                    <Link
                      href="/size-guide?lang=fr"
                      aria-current={
                        lang ===
                        "fr"
                          ? "page"
                          : undefined
                      }
                      className={
                        lang ===
                        "fr"
                          ? "text-mbg-green"
                          : "text-mbg-darkgrey hover:text-mbg-black"
                      }
                    >
                      FR
                    </Link>
                  </div>
                </div>
              </div>

              {/* QUICK LINKS */}
              <nav
                aria-label="Size guide sections"
                className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-mbg-black/10 pt-5"
              >
                <a
                  href="#measurements"
                  className="text-[10px] font-bold uppercase tracking-[0.15em] underline-offset-4 hover:underline"
                >
                  01{" "}
                  {
                    copy.measurementsLink
                  }
                </a>

                <a
                  href="#how-to-measure"
                  className="text-[10px] font-bold uppercase tracking-[0.15em] underline-offset-4 hover:underline"
                >
                  02{" "}
                  {
                    copy.measureLink
                  }
                </a>

                <a
                  href="#fit-advice"
                  className="text-[10px] font-bold uppercase tracking-[0.15em] underline-offset-4 hover:underline"
                >
                  03{" "}
                  {copy.fitLink}
                </a>
              </nav>
            </div>

            {/* HERO IMAGE */}
            <div className="relative flex aspect-[4/5] max-h-[570px] items-center justify-center overflow-hidden bg-mbg-black/[0.025]">
              <Image
                src={Grinder}
                alt=""
                priority
                className="h-[82%] w-auto object-contain"
              />

              <span className="absolute left-5 top-5 text-[9px] font-bold uppercase tracking-[0.3em] text-mbg-black/35">
                MILOS BG
              </span>

              <span className="absolute bottom-5 right-5 text-[9px] font-bold uppercase tracking-[0.3em] text-mbg-green">
                GRIND UNTIL ACHIEVE
              </span>
            </div>
          </div>
        </Container>
      </section>

      {/* MEASUREMENTS */}
      <section
        id="measurements"
        className="scroll-mt-28"
      >
        <Container>
          <div className="py-14 md:py-20">
            <SectionHeading
              number="01"
              eyebrow={
                copy.tableEyebrow
              }
              title={
                copy.bodyMeasurements
              }
              description={
                copy.tableDescription
              }
            />

            {/* DESKTOP */}
            <div className="mt-10 hidden overflow-hidden border border-mbg-black/10 md:block">
              <table className="w-full border-collapse">
                <caption className="sr-only">
                  {copy.bodyMeasurements}
                </caption>

                <thead>
                  <tr className="bg-mbg-black text-mbg-white">
                    <th
                      scope="col"
                      className="w-[34%] px-6 py-5 text-left text-[10px] font-semibold uppercase tracking-[0.2em]"
                    >
                      {copy.measurement}
                    </th>

                    {SIZE_ORDER.map(
                      (size) => (
                        <th
                          key={
                            size
                          }
                          scope="col"
                          className="border-l border-mbg-white/15 px-5 py-5 text-center"
                        >
                          <span className="text-xl font-semibold">
                            {size}
                          </span>
                        </th>
                      ),
                    )}
                  </tr>
                </thead>

                <tbody>
                  {MEASUREMENTS.map(
                    (
                      measurement,
                      index,
                    ) => (
                      <tr
                        key={
                          measurement.key
                        }
                        className={`
                          border-t
                          border-mbg-black/10
                          transition-colors
                          hover:bg-mbg-green/[0.035]
                          ${
                            index %
                              2 ===
                            1
                              ? "bg-mbg-black/[0.018]"
                              : ""
                          }
                        `}
                      >
                        <th
                          scope="row"
                          className="px-6 py-6 text-left text-xs font-semibold uppercase tracking-[0.1em]"
                        >
                          {
                            measurement
                              .label[
                              lang
                            ]
                          }
                        </th>

                        {SIZE_ORDER.map(
                          (
                            size,
                          ) => (
                            <td
                              key={
                                size
                              }
                              className="border-l border-mbg-black/10 px-5 py-6 text-center text-sm font-semibold"
                            >
                              {
                                measurement
                                  .values[
                                  size
                                ][
                                  unit
                                ]
                              }
                            </td>
                          ),
                        )}
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}
            <div className="mt-8 grid gap-4 md:hidden">
              {SIZE_ORDER.map(
                (size) => (
                  <article
                    key={size}
                    className="border border-mbg-black/10"
                  >
                    <header className="flex items-center justify-between bg-mbg-black px-5 py-4 text-mbg-white">
                      <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-mbg-white/60">
                        {
                          copy.recommended
                        }
                      </span>

                      <strong className="text-2xl">
                        {size}
                      </strong>
                    </header>

                    <dl>
                      {MEASUREMENTS.map(
                        (
                          measurement,
                          index,
                        ) => (
                          <div
                            key={
                              measurement.key
                            }
                            className={`
                              flex
                              items-center
                              justify-between
                              gap-5
                              border-t
                              border-mbg-black/10
                              px-5
                              py-4
                              ${
                                index %
                                  2 ===
                                1
                                  ? "bg-mbg-black/[0.018]"
                                  : ""
                              }
                            `}
                          >
                            <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-mbg-darkgrey">
                              {
                                measurement
                                  .label[
                                  lang
                                ]
                              }
                            </dt>

                            <dd className="text-sm font-semibold">
                              {
                                measurement
                                  .values[
                                  size
                                ][
                                  unit
                                ]
                              }
                            </dd>
                          </div>
                        ),
                      )}
                    </dl>
                  </article>
                ),
              )}
            </div>

            <div className="mt-5 flex max-w-4xl items-start gap-3 border-l-2 border-mbg-green py-1 pl-4">
              <CircleHelp
                size={16}
                className="mt-0.5 flex-none text-mbg-green"
              />

              <p className="text-[11px] leading-6 text-mbg-darkgrey">
                {copy.note}
              </p>
            </div>
          </div>
        </Container>
      </section>

      {/* HOW TO MEASURE */}
      <section
        id="how-to-measure"
        className="scroll-mt-28 border-y border-mbg-black/10 bg-mbg-black/[0.018]"
      >
        <Container>
          <div className="py-14 md:py-20">
            <SectionHeading
              number="02"
              title={
                copy.howToMeasure
              }
              description={
                copy.howToMeasureDescription
              }
            />

            <div className="mt-10 grid border-l border-t border-mbg-black/10 sm:grid-cols-2 lg:grid-cols-4">
              {measurementTips.map(
                (
                  item,
                  index,
                ) => {
                  const Icon =
                    item.icon;

                  return (
                    <article
                      key={
                        item.title
                      }
                      className="min-h-[230px] border-b border-r border-mbg-black/10 bg-mbg-white p-6 transition-colors hover:bg-mbg-green/[0.025]"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-11 w-11 items-center justify-center border border-mbg-black/10">
                          <Icon
                            size={
                              18
                            }
                            strokeWidth={
                              1.5
                            }
                          />
                        </div>

                        <span className="text-[10px] font-semibold text-mbg-black/25">
                          0
                          {index +
                            1}
                        </span>
                      </div>

                      <h3 className="mt-8 text-sm font-semibold uppercase tracking-[0.08em]">
                        {
                          item.title
                        }
                      </h3>

                      <p className="mt-3 text-xs leading-6 text-mbg-darkgrey">
                        {
                          item.description
                        }
                      </p>
                    </article>
                  );
                },
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* FIT ADVICE */}
      <section
        id="fit-advice"
        className="scroll-mt-28"
      >
        <Container>
          <div className="py-14 md:py-20">
            <SectionHeading
              number="03"
              title={
                lang === "fr"
                  ? "Conseils de coupe"
                  : "Fit advice"
              }
            />

            <div className="mt-10 grid border border-mbg-black/10 md:grid-cols-2">
              <article className="p-7 md:p-10">
                <span className="flex h-9 w-9 items-center justify-center bg-mbg-black text-mbg-white">
                  <Check
                    size={16}
                  />
                </span>

                <h3 className="mt-8 text-xl font-semibold tracking-[-0.025em]">
                  {
                    copy.choosingTitle
                  }
                </h3>

                <p className="mt-4 max-w-md text-sm leading-7 text-mbg-darkgrey">
                  {
                    copy.choosingDescription
                  }
                </p>
              </article>

              <article className="border-t border-mbg-black/10 bg-mbg-black/[0.02] p-7 md:border-l md:border-t-0 md:p-10">
                <span className="flex h-9 w-9 items-center justify-center border border-mbg-black/10">
                  <Ruler
                    size={16}
                  />
                </span>

                <h3 className="mt-8 text-xl font-semibold tracking-[-0.025em]">
                  {
                    copy.productFitTitle
                  }
                </h3>

                <p className="mt-4 max-w-md text-sm leading-7 text-mbg-darkgrey">
                  {
                    copy.productFitDescription
                  }
                </p>

                <Link
                  href={localizedHref(
                    "/products",
                  )}
                  className="mt-7 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em]"
                >
                  {copy.products}

                  <ArrowRight
                    size={14}
                  />
                </Link>
              </article>
            </div>
          </div>
        </Container>
      </section>

      {/* FAQ */}
      <section className="border-t border-mbg-black/10">
        <Container>
          <div className="grid gap-10 py-14 md:grid-cols-[.7fr_1.3fr] md:py-20 lg:gap-20">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-mbg-green">
                {copy.faqEyebrow}
              </p>

              <h2 className="mt-3 text-3xl font-semibold tracking-[-0.035em]">
                {copy.faqTitle}
              </h2>
            </div>

            <div className="border-t border-mbg-black/10">
              {copy.faq.map(
                (
                  item,
                  index,
                ) => {
                  const open =
                    openFaq ===
                    index;

                  return (
                    <article
                      key={item.q}
                      className="border-b border-mbg-black/10"
                    >
                      <button
                        type="button"
                        aria-expanded={
                          open
                        }
                        onClick={() =>
                          setOpenFaq(
                            open
                              ? null
                              : index,
                          )
                        }
                        className="flex w-full items-center justify-between gap-6 py-6 text-left"
                      >
                        <span className="text-sm font-semibold">
                          {
                            item.q
                          }
                        </span>

                        <span
                          className={`
                            text-xl
                            font-light
                            transition-transform
                            ${
                              open
                                ? "rotate-45"
                                : ""
                            }
                          `}
                        >
                          +
                        </span>
                      </button>

                      {open && (
                        <p className="max-w-2xl pb-6 text-sm leading-7 text-mbg-darkgrey">
                          {
                            item.a
                          }
                        </p>
                      )}
                    </article>
                  );
                },
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-mbg-black text-mbg-white">
        <Container>
          <div className="flex flex-col gap-9 py-14 md:flex-row md:items-end md:justify-between md:py-20">
            <div className="max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-mbg-green">
                {
                  copy.supportEyebrow
                }
              </p>

              <h2 className="mt-4 text-3xl font-semibold tracking-[-0.035em] md:text-4xl">
                {
                  copy.supportTitle
                }
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-7 text-mbg-white/60">
                {
                  copy.supportDescription
                }
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href={localizedHref(
                  "/products",
                )}
                className="flex min-h-[50px] items-center justify-center gap-2 border border-mbg-white/20 px-7 text-xs font-semibold uppercase tracking-[0.1em] transition-colors hover:bg-mbg-white hover:text-mbg-black"
              >
                {
                  copy.products
                }
              </Link>

              <Link
                href={localizedHref(
                  "/contact",
                )}
                className="flex min-h-[50px] items-center justify-center gap-2 bg-mbg-white px-7 text-xs font-semibold uppercase tracking-[0.1em] text-mbg-black transition-opacity hover:opacity-85"
              >
                {copy.contact}

                <ArrowRight
                  size={14}
                />
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
    <header className="grid gap-5 md:grid-cols-[120px_1fr]">
      <div>
        <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-mbg-green">
          {number}
        </span>
      </div>

      <div className="max-w-2xl">
        {eyebrow && (
          <p className="mb-2 text-[9px] font-bold uppercase tracking-[0.22em] text-mbg-darkgrey">
            {eyebrow}
          </p>
        )}

        <h2 className="text-2xl font-semibold tracking-[-0.03em] md:text-3xl">
          {title}
        </h2>

        {description && (
          <p className="mt-4 text-sm leading-7 text-mbg-darkgrey">
            {description}
          </p>
        )}
      </div>
    </header>
  );
}