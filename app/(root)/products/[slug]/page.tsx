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
      ? `${cleanDescription.slice(0, 155)}${cleanDescription.length > 155 ? "..." : ""}`
      : lang === "fr"
        ? "Découvrez les créations Milos BG conçues pour le terrain et en dehors."
        : "Shop authentic Milos BG gear built for on and off the court.";

    const heroImage =
      Array.isArray(product.media) && product.media.length > 0
        ? (product.media[0] ?? "/Grinder.png")
        : "/Grinder.png";

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
        className="flex border border-[#00821A]"
        role="group"
        aria-label={lang === "fr" ? "Choisir la langue" : "Choose language"}
      >
        <Link
          href={`${basePath}?lang=en`}
          aria-current={lang === "en" ? "page" : undefined}
          className={`${itemClass} ${
            lang === "en"
              ? "bg-[#00821A] text-white"
              : "text-[#00821A] hover:bg-[#00821A]/10"
          }`}
        >
          EN
        </Link>

        <Link
          href={`${basePath}?lang=fr`}
          aria-current={lang === "fr" ? "page" : undefined}
          className={`${itemClass} ${
            lang === "fr"
              ? "bg-black text-white"
              : "text-black hover:bg-black/5"
          }`}
        >
          FR
        </Link>
      </div>
    </div>
  );
};

const ProductDetails = async ({ params, searchParams }: PageProps) => {
  const { slug } = await params;
  const { lang: rawLang } = await searchParams;
  const lang = normalizeStoreLanguage(rawLang);

  const productDetails = await getProductBySlugOrId(slug);
  if (!productDetails) notFound();

  if (productDetails.slug && slug !== productDetails.slug) {
    const langParam =
      typeof rawLang === "string" ? `?lang=${encodeURIComponent(rawLang)}` : "";
    redirect(`/products/${encodeURIComponent(productDetails.slug)}${langParam}`);
  }

  const productSlug = productDetails.slug || slug;
  const localized = getLocalizedProductContent(productDetails, lang);
  const copy =
    lang === "fr"
      ? {
          back: "Toutes les tenues",
          note: "Une pièce pensée pour traverser l’effort, le mouvement et le temps.",
          detailLabel: "DÉCOUVRIR LA PIÈCE",
          detailText: "Explorez les détails, la matière et la présence du vêtement.",
          quest: "UN CHAPITRE À PORTER",
          questText:
            "Du terrain au quotidien, la pièce entre dans votre parcours. Choisissez vos options, demandez une taille spécifique si nécessaire et avancez vers le prochain chapitre.",
          discover: "DÉCOUVRIR GRIND UNTIL ACHIEVE",
        }
      : {
          back: "All Outfits",
          note: "A piece designed to move through effort, motion and time.",
          detailLabel: "DISCOVER THE PIECE",
          detailText: "Explore the details, the fabric and the presence of the garment.",
          quest: "A CHAPTER TO WEAR",
          questText:
            "From court to everyday life, the piece becomes part of your path. Choose your options, request a custom size if needed, and move toward the next chapter.",
          discover: "DISCOVER GRIND UNTIL ACHIEVE",
        };

  return (
    <div className="bg-[#ececeb] text-black">
      <Container className="min-h-[60vh] py-4 sm:py-6 lg:py-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4 border-b border-black/10 pb-4">
          <div className="min-w-0">
            <Link
              href={`/products?lang=${lang}`}
              className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#404040] transition hover:text-[#00821A]"
            >
              {copy.back}
            </Link>
            <h1 className="mt-2 text-2xl font-black uppercase tracking-[-0.04em] text-black sm:text-3xl">
              {localized.title}
            </h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-[#404040]">{copy.note}</p>
          </div>
          <LanguageSwitcher slug={productSlug} lang={lang} />
        </div>

        <section className="overflow-hidden border border-black/10 bg-[#0a0a0a] shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]">
            <div className="border-b border-white/10 p-4 sm:p-5 lg:border-b-0 lg:border-r lg:border-white/10 lg:p-6">
              <div className="overflow-hidden border border-white/10 bg-[#151515] p-2 sm:p-3">
                <Gallery productMedia={productDetails.media} />
              </div>
              <div className="mt-4 border-l-2 border-[#00821A] pl-4 text-white">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#77d488]">{copy.detailLabel}</p>
                <p className="mt-2 max-w-lg text-[13px] leading-6 text-white/68">{copy.detailText}</p>
              </div>
            </div>

            <div className="min-w-0 p-4 sm:p-5 lg:p-6">
              <ProductInfo productInfo={productDetails} lang={lang} />
              <div className="mt-5">
                <ProductAccordion product={productDetails} lang={lang} />
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 overflow-hidden border border-black/10 bg-black text-white shadow-[0_18px_48px_rgba(0,0,0,0.16)]">
          <div className="grid grid-cols-1 gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#77d488]">{copy.quest}</p>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-white/70">{copy.questText}</p>
            </div>
            <Link
              href={`/grind-until-achieve?lang=${lang}`}
              className="inline-flex min-h-12 items-center justify-center border border-white/20 px-5 py-3 text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:border-[#00821A] hover:bg-[#00821A]"
            >
              {copy.discover}
            </Link>
          </div>
        </section>
      </Container>
    </div>
  );
};

export default ProductDetails;
