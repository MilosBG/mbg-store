import type { Metadata } from "next";
import Link from "next/link";
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
    back: "TOUTES LES TENUES",
    eyebrow: "LA PIÈCE / LE PARCOURS",
    intro: "Chaque détail a sa raison d’être. Choisissez votre pièce, définissez vos options et écrivez la suite de votre parcours.",
    gallery: "01 / DÉCOUVRIR LA PIÈCE",
    galleryNote: "Observez les matières, les proportions et les finitions.",
    craft: "FAIT AVEC INTENTION",
    details: "03 / LES DÉTAILS",
    detailsIntro: "Tout ce qui compte, sans détours.",
    experience: "AU-DELÀ DU VÊTEMENT",
    experienceTitle: "CINQ CHAPITRES. UN SEUL PARCOURS.",
    experienceText: "Chaque choix construit la suite. GRIND, RESILIENCE, CONSISTENCY, FOCUS, ACHIEVE : une philosophie qui se vit au quotidien.",
    discover: "DÉCOUVRIR LE PARCOURS",
  } : {
    back: "ALL OUTFITS",
    eyebrow: "THE PIECE / THE JOURNEY",
    intro: "Every detail has a purpose. Discover the piece, choose your options and write the next part of your journey.",
    gallery: "01 / DISCOVER THE PIECE",
    galleryNote: "Explore the materials, proportions and finishing touches.",
    craft: "MADE WITH INTENTION",
    details: "03 / THE DETAILS",
    detailsIntro: "Everything that matters, nothing unnecessary.",
    experience: "BEYOND THE GARMENT",
    experienceTitle: "FIVE CHAPTERS. ONE JOURNEY.",
    experienceText: "Each choice shapes what comes next. GRIND, RESILIENCE, CONSISTENCY, FOCUS, ACHIEVE: a mindset lived every day.",
    discover: "EXPLORE THE JOURNEY",
  };

  return (
    <main className="relative min-h-[65vh] overflow-hidden bg-[#F3F3F0] font-[Kanit,sans-serif] text-black">
      <Container className="pb-10 sm:pb-14 lg:pb-20">
        {/* Navigation + language selection remain visible before the purchase flow. */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 py-4 sm:py-5">
          <nav aria-label={fr ? "Fil d’Ariane" : "Breadcrumb"} className="flex min-w-0 flex-wrap items-center gap-2 text-[10px] font-bold uppercase tracking-[0.12em] text-[#404040]">
            <Link href={`/products?lang=${lang}`} className="transition-colors hover:text-[#00821A]">
              {copy.back}
            </Link>
            <span aria-hidden="true" className="text-[#00821A]">/</span>
            <span aria-current="page" className="max-w-[170px] truncate text-black sm:max-w-xs">
              {localized.title}
            </span>
          </nav>
          <LanguageSwitcher slug={productSlug} lang={lang} />
        </div>

        {/* Shorter narrative header: show the product above the fold. */}
        <header className="relative py-6 sm:py-8 lg:py-10">
          <div className="max-w-3xl">
            <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.19em] text-[#00821A]">
              <span aria-hidden="true" className="h-px w-7 bg-[#00821A]" />
              {copy.eyebrow}
            </p>
            <h1 className="mt-3 text-[clamp(1.75rem,4vw,3.8rem)] font-black uppercase leading-[1.05] tracking-[-0.035em] text-black">
              {localized.title}
            </h1>
            <p className="mt-3 max-w-[610px] text-[12px] leading-[1.7] text-[#404040] sm:text-sm">
              {copy.intro}
            </p>
          </div>
          <div className="mt-6 grid grid-cols-5 gap-1.5 border-t border-black/10 pt-3 sm:gap-3" aria-label={fr ? "Les cinq chapitres" : "The five chapters"}>
            {(["GRIND", "RESILIENCE", "CONSISTENCY", "FOCUS", "ACHIEVE"] as const).map((stage, index) => (
              <div key={stage} className="min-w-0">
                <span className={`block text-[9px] font-black tabular-nums ${index === 0 ? "text-[#00821A]" : "text-[#404040]"}`}>
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="mt-1 block break-words text-[8px] font-semibold uppercase leading-[1.3] tracking-[0.03em] text-[#404040] sm:text-[10px]">
                  {stage}
                </span>
              </div>
            ))}
          </div>
        </header>

        {/* Golden ratio: 61.8% visual / 38.2% commerce on wide screens. */}
        <section aria-label={fr ? "Présentation et achat" : "Product and purchasing options"} className="grid min-w-0 items-start gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1.618fr)_minmax(0,1fr)] lg:gap-7">
          <div className="min-w-0 space-y-3">
            <div className="relative overflow-hidden border border-black/10 bg-[#111111] p-2 sm:p-3">
              <Gallery productMedia={productDetails.media} productName={localized.title} />
            </div>
            <div className="flex flex-wrap items-start justify-between gap-3 border-l-2 border-[#00821A] py-1 pl-3 sm:pl-4">
              <div className="max-w-sm">
                <p className="text-[10px] font-black uppercase tracking-[0.11em] text-black">{copy.gallery}</p>
                <p className="mt-1 text-[11px] leading-[1.5] text-[#404040]">{copy.galleryNote}</p>
              </div>
              <span className="text-[9px] font-bold uppercase tracking-[0.1em] text-[#00821A]">{copy.craft}</span>
            </div>
          </div>

          {/* ProductInfo retains live stock, variant selection, cart animation, and custom-size emails. */}
          <div className="min-w-0">
            <ProductInfo productInfo={productDetails} lang={lang} />
          </div>
        </section>

        {/* Technical accordions are no longer stretching the purchase column. */}
        <section className="mt-8 border border-black/10 bg-white p-4 sm:mt-10 sm:p-6 lg:p-8" aria-labelledby="product-details-heading">
          <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-black/10 pb-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#00821A]">{copy.details}</p>
              <h2 id="product-details-heading" className="mt-1 text-lg font-black uppercase tracking-[-0.01em] text-black sm:text-xl">
                {fr ? "EXPLORER LES DÉTAILS" : "EXPLORE THE DETAILS"}
              </h2>
            </div>
            <span className="text-[11px] leading-5 text-[#404040]">{copy.detailsIntro}</span>
          </div>
          <ProductAccordion product={productDetails} lang={lang} />
        </section>

        <aside className="relative mt-6 overflow-hidden border border-black bg-[#080808] px-5 py-7 text-white sm:px-8 sm:py-9 lg:mt-8 lg:px-11 lg:py-11">
          <div aria-hidden="true" className="absolute inset-y-0 left-0 w-1 bg-[#00821A]" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-4 -top-9 text-[130px] font-black leading-none tracking-tighter text-white/[0.04] sm:text-[180px]">05</div>
          <div className="relative grid items-end gap-6 lg:grid-cols-[minmax(0,1.618fr)_minmax(0,1fr)]">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BFBFBF]">{copy.experience}</p>
              <h2 className="mt-2 text-[clamp(1.5rem,3vw,2.7rem)] font-black uppercase leading-[1.07] tracking-tight text-white">
                {copy.experienceTitle}
              </h2>
              <p className="mt-3 max-w-xl text-[12px] leading-[1.8] text-[#BFBFBF] sm:text-sm">{copy.experienceText}</p>
            </div>
            <Link href={`/grind-until-achieve?lang=${lang}`} className="inline-flex min-h-11 items-center justify-center gap-3 justify-self-start rounded-sm border border-white/35 px-5 py-3 text-[10px] font-black uppercase tracking-[0.12em] text-white transition-colors hover:border-[#00821A] hover:bg-[#00821A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00821A] lg:justify-self-end">
              {copy.discover}<span aria-hidden="true">↗</span>
            </Link>
          </div>
        </aside>
      </Container>
    </main>
  );
};

export default ProductDetails;
