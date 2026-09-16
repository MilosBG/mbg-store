import type { Metadata } from "next";

import ClientPage from "./ClientPage";

import { buildMetadata } from "@/lib/seo";
import {
  normalizeStoreLanguage,
  type StoreLanguage,
} from "@/lib/store-language";
import Container from "@/components/mbg-components/Container";

type PageProps = {
  searchParams: Promise<{
    lang?: string;
  }>;
};

const META = {
  en: {
    title: "Men's Size Guide & Fit Guide",
    description:
      "Find your Milos BG size with men's body measurements, size charts and fit advice for S, M and L clothing.",
    breadcrumb: "Size Guide",
  },

  fr: {
    title: "Guide des tailles homme & conseils de coupe",
    description:
      "Trouvez votre taille Milos BG grâce au tableau de mensurations homme, aux tailles S, M et L et à nos conseils de coupe.",
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

  const canonical =
    lang === "fr"
      ? "/size-guide?lang=fr"
      : "/size-guide";

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
              "taille S M L",
              "guide de coupe",
              "vêtement artisanal",
            ]
          : [
              "Milos BG",
              "men's size guide",
              "men's clothing size chart",
              "body measurements",
              "size S M L",
              "fit guide",
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

export default async function Page({
  searchParams,
}: PageProps) {
  const params = await searchParams;

  const lang = normalizeStoreLanguage(
    params.lang,
  );

  const copy = META[lang];

  const pageUrl =
    lang === "fr"
      ? "https://milos-bg.com/size-guide?lang=fr"
      : "https://milos-bg.com/size-guide";

  const faq =
    lang === "fr"
      ? [
          {
            question:
              "Comment choisir ma taille Milos BG ?",
            answer:
              "Comparez vos mensurations de poitrine, taille et hanches avec notre tableau. Si vous êtes entre deux tailles, choisissez la taille supérieure pour une coupe plus ample.",
          },
          {
            question:
              "Les vêtements Milos BG taillent-ils normalement ?",
            answer:
              "La coupe peut varier selon le produit, le tissu et sa construction. Consultez également les informations de coupe indiquées sur chaque fiche produit.",
          },
          {
            question:
              "Que faire si je suis entre deux tailles ?",
            answer:
              "Choisissez la taille inférieure pour une coupe plus ajustée et la taille supérieure pour une silhouette plus ample.",
          },
        ]
      : [
          {
            question:
              "How do I choose my Milos BG size?",
            answer:
              "Compare your chest, waist and hip measurements with our size chart. If you are between sizes, choose the larger size for a looser fit.",
          },
          {
            question:
              "Does Milos BG clothing fit true to size?",
            answer:
              "Fit may vary depending on the product, fabric and garment construction. Product-specific fit information is also available on each product page.",
          },
          {
            question:
              "What should I do if I am between sizes?",
            answer:
              "Choose the smaller size for a closer fit or the larger size for a more relaxed silhouette.",
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
        inLanguage:
          lang === "fr" ? "fr-FR" : "en",
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
          __html: JSON.stringify(
            structuredData,
          ),
        }}
      />

      <Container><ClientPage lang={lang} /></Container>
    </>
  );
}