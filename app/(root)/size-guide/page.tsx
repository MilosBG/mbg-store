import type { Metadata } from "next";

import ClientPage from "./ClientPage";
import { buildMetadata } from "@/lib/seo";
import {
  normalizeStoreLanguage,
  type StoreLanguage,
} from "@/lib/store-language";

type PageProps = {
  searchParams: Promise<{
    lang?: string;
  }>;
};

const META = {
  en: {
    title: "Men's Size Guide & Fit Guide",
    description:
      "Find your Milos BG size with men's body measurements, size charts for M, L and S and an indicative custom-size finder.",
    breadcrumb: "Size Guide",
  },
  fr: {
    title: "Guide des tailles homme & conseils de coupe",
    description:
      "Trouvez votre taille Milos BG grâce au tableau de mensurations homme, aux tailles M, L et S et à un simulateur indicatif pour le sur-mesure.",
    breadcrumb: "Guide des tailles",
  },
} satisfies Record<
  StoreLanguage,
  {
    title: string;
    description: string;
    breadcrumb: string;
  }
>;

export async function generateMetadata({
  searchParams,
}: PageProps): Promise<Metadata> {
  const params = await searchParams;
  const lang = normalizeStoreLanguage(params.lang);
  const meta = META[lang];
  const canonical = lang === "fr" ? "/size-guide?lang=fr" : "/size-guide";

  return {
    ...buildMetadata({
      title: meta.title,
      description: meta.description,
      path: canonical,
      image: "/Grinder.png",
      keywords:
        lang === "fr"
          ? [
              "Milos BG",
              "guide des tailles",
              "guide taille homme",
              "mensurations homme",
              "taille vêtement homme",
              "taille M L S",
              "guide de coupe",
              "simulateur de taille",
              "taille sur mesure",
              "vêtement artisanal",
            ]
          : [
              "Milos BG",
              "men's size guide",
              "men's clothing size chart",
              "body measurements",
              "size M L S",
              "fit guide",
              "custom size finder",
              "artisan clothing",
              "basketball clothing",
            ],
    }),
    alternates: {
      canonical,
      languages: {
        en: "/size-guide",
        fr: "/size-guide?lang=fr",
        "x-default": "/size-guide",
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function Page({ searchParams }: PageProps) {
  const params = await searchParams;
  const lang = normalizeStoreLanguage(params.lang);
  const copy = META[lang];
  const pageUrl =
    lang === "fr"
      ? "https://milos-bg.com/size-guide?lang=fr"
      : "https://milos-bg.com/size-guide";

  const faq =
    lang === "fr"
      ? [
          {
            question: "Comment choisir ma taille Milos BG ?",
            answer:
              "Comparez vos mensurations de poitrine, taille et hanches avec le tableau. Si vous êtes entre deux tailles, tenez compte de la coupe recherchée.",
          },
          {
            question: "Ces mesures correspondent-elles au vêtement ?",
            answer:
              "Non. Le tableau indique principalement les mensurations du corps. Des mesures spécifiques au vêtement peuvent être disponibles sur sa fiche produit.",
          },
          {
            question: "Que faire si je suis entre deux tailles ?",
            answer:
              "Choisissez la taille inférieure pour une coupe plus ajustée ou la taille supérieure pour une silhouette plus ample.",
          },
          {
            question: "Puis-je demander une taille différente de M, L ou S ?",
            answer:
              "Les autres tailles relèvent d'une commande personnalisée. Le simulateur fournit un repère indicatif à partir de vos mensurations ; la faisabilité et la coupe finale sont confirmées individuellement.",
          },
        ]
      : [
          {
            question: "How do I choose my Milos BG size?",
            answer:
              "Compare your chest, waist and hip measurements with the size chart. If you are between two sizes, consider your preferred fit.",
          },
          {
            question: "Are these garment measurements?",
            answer:
              "No. The chart primarily shows body measurements. Product-specific garment measurements may be available on individual product pages.",
          },
          {
            question: "What if I am between two sizes?",
            answer:
              "Choose the smaller size for a closer fit or the larger size for a more relaxed silhouette.",
          },
          {
            question: "Can I request a size outside M, L or S?",
            answer:
              "Other sizes are considered custom orders. Our simulator offers an approximate reference based on body measurements; we confirm feasibility and the final fit individually.",
          },
        ];

  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": pageUrl,
        url: pageUrl,
        name: copy.title,
        description: copy.description,
        inLanguage: lang === "fr" ? "fr-FR" : "en",
        isPartOf: {
          "@type": "WebSite",
          name: "Milos BG",
          url: "https://milos-bg.com",
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Milos BG",
            item: "https://milos-bg.com",
          },
          {
            "@type": "ListItem",
            position: 2,
            name: copy.breadcrumb,
            item: pageUrl,
          },
        ],
      },
      {
        "@type": "FAQPage",
        mainEntity: faq.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData).replace(/</g, "\\u003c"),
        }}
      />
      {/* ClientPage handles its own section-level Containers. */}
      <ClientPage lang={lang} />
    </>
  );
}
