import type { Metadata } from "next";
import Link from "next/link";
import React from "react";
import { notFound, redirect } from "next/navigation";

import Container from "@/components/mbg-components/Container";

import { getProductBySlugOrId } from "@/lib/admin";
import { buildMetadata } from "@/lib/seo";
import {
  normalizeStoreLanguage,
  type StoreLanguage,
} from "@/lib/store-language";
import type { Product } from "@/lib/types";

import Gallery from "../../components/Gallery";
import ProductAccordion from "../../components/ProductAccordion";
import ProductInfo from "../../components/ProductInfo";

export const revalidate = 3600;

type PageProps = {
  params: Promise<{
    slug: string;
  }>;

  searchParams: Promise<{
    lang?: string | string[];
  }>;
};

type LocalizedProduct = Product & {
  titleFr?: string;
  descriptionFr?: string;
  categoryFr?: string;
};

/* -------------------------------------------------------------------------- */
/*                              LOCALIZED CONTENT                             */
/* -------------------------------------------------------------------------- */

const getLocalizedProductContent = (product: Product, lang: StoreLanguage) => {
  const localizedProduct = product as LocalizedProduct;

  if (lang === "fr") {
    return {
      title: localizedProduct.titleFr?.trim() || product.title || "Produit",

      description:
        localizedProduct.descriptionFr?.trim() || product.description || "",

      category: localizedProduct.categoryFr?.trim() || product.category || "",
    };
  }

  return {
    title: product.title || "Product",
    description: product.description || "",
    category: product.category || "",
  };
};

/* -------------------------------------------------------------------------- */
/*                                  METADATA                                  */
/* -------------------------------------------------------------------------- */

export async function generateMetadata({
  params,
  searchParams,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;

  const { lang: rawLang } = await searchParams;

  const lang = normalizeStoreLanguage(rawLang);

  const encodedSlug = encodeURIComponent(slug);

  const fallback = buildMetadata({
    title: lang === "fr" ? "Produit" : "Product",

    description:
      lang === "fr"
        ? "Découvrez les vêtements et accessoires Milos BG inspirés du basketball."
        : "Discover Milos BG basketball-inspired apparel and accessories.",

    path: `/products/${encodedSlug}`,

    image: "/Grinder.png",

    keywords:
      lang === "fr"
        ? ["Milos BG", "produit", "vêtement", "basketball"]
        : ["Milos BG", "product", "apparel", "basketball"],

    robotsIndex: false,
  });

  try {
    const product = await getProductBySlugOrId(slug);

    if (!product) {
      return fallback;
    }

    const content = getLocalizedProductContent(product, lang);

    const cleanDescription = content.description.replace(/\s+/g, " ").trim();

    const summary = cleanDescription
      ? `${cleanDescription.slice(0, 155)}${
          cleanDescription.length > 155 ? "..." : ""
        }`
      : lang === "fr"
        ? "Découvrez les créations Milos BG conçues pour le terrain et en dehors."
        : "Shop authentic Milos BG gear built for on and off the court.";

    const heroImage =
      Array.isArray(product.media) && product.media.length > 0
        ? (product.media[0] ?? "/Grinder.png")
        : "/Grinder.png";

    /**
     * Important :
     * la canonical utilise maintenant le slug,
     * plus jamais le MongoDB _id.
     */
    const canonicalSlug = encodeURIComponent(product.slug || slug);

    return buildMetadata({
      title: content.title,

      description: summary,

      path: `/products/${canonicalSlug}`,

      image: heroImage,

      keywords:
        lang === "fr"
          ? ["Milos BG", content.title, "basketball", "vêtement"]
          : ["Milos BG", content.title, "basketball", "apparel"],
    });
  } catch (error) {
    console.error("Failed to build product metadata", error);

    return fallback;
  }
}

/* -------------------------------------------------------------------------- */
/*                              LANGUAGE SWITCHER                             */
/* -------------------------------------------------------------------------- */

const LanguageSwitcher = ({
  slug,
  lang,
}: {
  slug: string;
  lang: StoreLanguage;
}) => {
  const basePath = `/products/${encodeURIComponent(slug)}`;

  const itemClass =
    "flex h-8 min-w-10 items-center justify-center px-3 text-[10px] font-bold uppercase transition-colors";

  return (
    <div className="flex justify-end">
      <div
        className="flex border border-mbg-green"
        role="group"
        aria-label={lang === "fr" ? "Choisir la langue" : "Choose language"}
      >
        <Link
          href={`${basePath}?lang=en`}
          aria-current={lang === "en" ? "page" : undefined}
          className={`${itemClass} ${
            lang === "en"
              ? "bg-mbg-green text-mbg-white"
              : "text-mbg-green hover:bg-mbg-green/10"
          }`}
        >
          EN
        </Link>

        <Link
          href={`${basePath}?lang=fr`}
          aria-current={lang === "fr" ? "page" : undefined}
          className={`${itemClass} ${
            lang === "fr"
              ? "bg-mbg-black text-mbg-white"
              : "text-mbg-black hover:bg-mbg-black/5"
          }`}
        >
          FR
        </Link>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                PRODUCT PAGE                                */
/* -------------------------------------------------------------------------- */

const ProductDetails = async ({ params, searchParams }: PageProps) => {
  const { slug } = await params;

  const { lang: rawLang } = await searchParams;

  const lang = normalizeStoreLanguage(rawLang);

  const productDetails = await getProductBySlugOrId(slug);

  if (!productDetails) {
    notFound();
  }

  /**
   * On préfère toujours le slug réel
   * renvoyé par la DB.
   */
  if (productDetails.slug && slug !== productDetails.slug) {
    const langParam =
      typeof rawLang === "string" ? `?lang=${encodeURIComponent(rawLang)}` : "";

    redirect(
      `/products/${encodeURIComponent(productDetails.slug)}${langParam}`,
    );
  }
  const productSlug = productDetails.slug || slug;

  const localized = getLocalizedProductContent(productDetails, lang);
  const fr = lang === "fr";
  const copy = fr ? {
    back: "Toutes les tenues",
    edition: "LA COLLECTION / LA QUÊTE",
    headingOne: "CHAQUE PIÈCE.",
    headingTwo: "UN NOUVEAU CHAPITRE.",
    introduction: "L’aventure ne se raconte pas seulement. Elle se construit, une décision après l’autre.",
    stages: ["GRIND", "RESILIENCE", "CONSISTENCY", "FOCUS", "ACHIEVE"],
    photoLabel: "01 / LA PIÈCE",
    photoNote: "Découvrez les détails, la matière, le caractère.",
    experience: "AU-DELÀ DU VÊTEMENT",
    experienceTitle: "PORTEZ VOTRE PROCHAIN CHAPITRE.",
    experienceText: "Cinq chapitres. Un seul voyage. Un chemin de discipline, de résilience et de progression — à vivre à votre rythme.",
    discover: "DÉCOUVRIR L’HISTOIRE",
    craft: "FAIT AVEC INTENTION",
  } : {
    back: "All Outfits",
    edition: "THE COLLECTION / THE QUEST",
    headingOne: "EVERY PIECE.",
    headingTwo: "A NEW CHAPTER.",
    introduction: "The journey is not simply told. It is built, one decision at a time.",
    stages: ["GRIND", "RESILIENCE", "CONSISTENCY", "FOCUS", "ACHIEVE"],
    photoLabel: "01 / THE PIECE",
    photoNote: "Explore every detail, every texture, every choice.",
    experience: "BEYOND THE GARMENT",
    experienceTitle: "WEAR YOUR NEXT CHAPTER.",
    experienceText: "Five chapters. One journey. A path of discipline, resilience and progress — yours to walk.",
    discover: "EXPLORE THE STORY",
    craft: "MADE WITH INTENTION",
  };

  return (
    <div className="relative min-h-[70vh] overflow-hidden bg-[#F4F4F1] font-[Kanit,sans-serif] text-black">
      <Container className="pb-12 sm:pb-16 lg:pb-24">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 py-4 sm:py-5">
          <nav aria-label={fr ? "Fil d’Ariane" : "Breadcrumb"} className="flex min-w-0 flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#404040]">
            <Link href={`/products?lang=${lang}`} className="transition-colors hover:text-[#00821A]">{copy.back}</Link>
            <span aria-hidden="true" className="text-[#00821A]">/</span>
            <span aria-current="page" className="max-w-48 truncate text-black sm:max-w-xs">{localized.title}</span>
          </nav>
          <LanguageSwitcher slug={productSlug} lang={lang} />
        </div>

        <header className="relative overflow-hidden border-b border-black/10 py-8 sm:py-11 lg:py-14">
          <div className="pointer-events-none absolute -right-10 top-0 hidden select-none text-[190px] font-black leading-none tracking-tighter text-black/[0.025] lg:block" aria-hidden="true">01</div>
          <div className="relative max-w-4xl">
            <p className="mb-5 inline-flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#00821A]">
              <span className="h-px w-8 bg-[#00821A]" aria-hidden="true" />{copy.edition}
            </p>
            <h1 className="text-[clamp(2rem,5.6vw,5.1rem)] font-black uppercase leading-[0.99] tracking-[-0.043em]">
              <span className="block">{copy.headingOne}</span>
              <span className="block text-[#00821A]">{copy.headingTwo}</span>
            </h1>
            <p className="mt-5 max-w-xl text-[13px] leading-[1.8] text-[#404040] sm:text-[15px]">
              {copy.introduction}
            </p>
          </div>
          <div className="relative mt-8 grid grid-cols-5 gap-1.5 sm:mt-10 sm:gap-3" aria-label={fr ? "Les cinq chapitres" : "The five chapters"}>
            {copy.stages.map((stage, index) => (
              <div key={stage} className={`border-t-2 pt-3 ${index === 0 ? "border-[#00821A]" : "border-black/15"}`}>
                <span className="block text-[10px] font-black tabular-nums text-[#00821A]">0{index + 1}</span>
                <span className="mt-1 block break-words text-[8px] font-bold uppercase leading-[1.4] tracking-[0.02em] text-black/70 sm:text-[10px]">{stage}</span>
              </div>
            ))}
          </div>
        </header>

        <div className="grid items-start gap-6 py-8 sm:gap-8 sm:py-11 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.94fr)] lg:gap-10 xl:gap-14">
          <div className="min-w-0 space-y-4 lg:sticky lg:top-6">
            <div className="relative border border-black/10 bg-[#E8E8E5] p-2 sm:p-3">
              <Gallery productMedia={productDetails.media} productName={localized.title} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-l-2 border-[#00821A] pl-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-black">{copy.photoLabel}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-[#404040]">{copy.photoNote}</p>
              </div>
              <span className="text-[9px] font-semibold uppercase tracking-[0.13em] text-[#00821A]">{copy.craft}</span>
            </div>
          </div>

          <div className="min-w-0 space-y-5">
            <ProductInfo productInfo={productDetails} lang={lang} />
            <ProductAccordion product={productDetails} lang={lang} />
          </div>
        </div>

        <aside className="relative mt-4 overflow-hidden bg-black px-6 py-9 text-white sm:px-9 sm:py-12 lg:px-14 lg:py-14">
          <div className="absolute left-0 top-0 h-full w-1 bg-[#00821A]" />
          <div className="pointer-events-none absolute -right-6 -top-12 select-none text-[170px] font-black leading-none text-white/[0.045] sm:text-[250px]" aria-hidden="true">05</div>
          <div className="relative grid items-end gap-8 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="max-w-2xl">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#BFBFBF]">{copy.experience}</p>
              <h2 className="mt-3 text-3xl font-black uppercase leading-[1.05] tracking-[-0.025em] sm:text-4xl">{copy.experienceTitle}</h2>
              <p className="mt-4 max-w-xl text-[13px] leading-[1.8] text-white/70">{copy.experienceText}</p>
            </div>
            <Link href={`/grind-until-achieve?lang=${lang}`} className="inline-flex min-h-12 items-center justify-center gap-4 self-end border border-white/60 px-6 py-3 text-[11px] font-black uppercase tracking-[0.12em] text-white transition-colors hover:border-[#00821A] hover:bg-[#00821A]">
              {copy.discover}<span aria-hidden="true">↗</span>
            </Link>
          </div>
        </aside>
      </Container>
    </div>
  );
};

export default ProductDetails;
