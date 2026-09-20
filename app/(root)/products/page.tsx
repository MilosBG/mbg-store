import type { Metadata } from "next";
import React from "react";

import ClientPage from "./ClientPage";

import Container from "@/components/mbg-components/Container";
import { getProducts } from "@/lib/admin";
import { buildMetadata } from "@/lib/seo";
import {
  normalizeStoreLanguage,
  type StoreLanguage,
} from "@/lib/store-language";

export const dynamic = "force-dynamic";

type ProductsPageProps = {
  searchParams: Promise<{
    lang?: string;
  }>;
};

const META = {
  en: {
    title: "All Products | Milos BG",
    description:
      "Discover all Milos BG artisan creations inspired by basketball, progression and GRIND UNTIL ACHIEVE.",
  },
  fr: {
    title: "Tous les produits | Milos BG",
    description:
      "Découvrez toutes les créations artisanales Milos BG, inspirées par le basketball, la progression et GRIND UNTIL ACHIEVE.",
  },
} satisfies Record<
  StoreLanguage,
  {
    title: string;
    description: string;
  }
>;

export async function generateMetadata({
  searchParams,
}: ProductsPageProps): Promise<Metadata> {
  const params = await searchParams;
  const lang = normalizeStoreLanguage(params.lang);
  const copy = META[lang];

  return buildMetadata({
    title: copy.title,
    description: copy.description,
    path: "/products",
    image: "/Grinder.png",
    keywords: [
      "Milos BG",
      "GRIND UNTIL ACHIEVE",
      "artisan clothing",
      "basketball clothing",
      "TOPS",
      "UPCYCLINGS",
      "BOTTOMS",
      "BACKUPS",
      "CGS",
    ],
  });
}

export default async function ProductsPage({
  searchParams,
}: ProductsPageProps) {
  const params = await searchParams;
  const lang = normalizeStoreLanguage(params.lang);
  const products = await getProducts();

  return (
    <Container>
      <ClientPage
        products={Array.isArray(products) ? products : []}
        lang={lang}
      />
    </Container>
  );
}
