import type { Metadata } from "next";
import Link from "next/link";
import React from "react";
import { notFound } from "next/navigation";

import Container from "@/components/mbg-components/Container";
import { getProductById } from "@/lib/admin";
import { buildMetadata } from "@/lib/seo";
import {
  normalizeStoreLanguage,
  type StoreLanguage,
} from "@/lib/store-language";
import type { Product } from "@/lib/types";
import Gallery from "../../components/Gallery";
import ProductAccordion from "../../components/ProductAccordion";
import ProductInfo from "../../components/ProductInfo";

type PageProps = {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
};

type LocalizedProduct = Product & {
  titleFr?: string;
  descriptionFr?: string;
  categoryFr?: string;
};

const getLocalizedProductContent = (
  product: Product,
  lang: StoreLanguage,
) => {
  const localizedProduct = product as LocalizedProduct;

  if (lang === "fr") {
    return {
      title: localizedProduct.titleFr?.trim() || product.title || "Produit",
      description:
        localizedProduct.descriptionFr?.trim() || product.description || "",
      category:
        localizedProduct.categoryFr?.trim() || product.category || "",
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
  const { productId } = await params;
  const { lang: rawLang } = await searchParams;
  const lang = normalizeStoreLanguage(rawLang);
  const encodedId = encodeURIComponent(productId);

  const fallback = buildMetadata({
    title: lang === "fr" ? "Produit" : "Product",
    description:
      lang === "fr"
        ? "Découvrez les vêtements et accessoires Milos BG inspirés du basketball."
        : "Discover Milos BG basketball-inspired apparel and accessories.",
    path: `/products/${encodedId}`,
    image: "/Grinder.png",
    keywords:
      lang === "fr"
        ? ["Milos BG", "produit", "vêtement", "basketball"]
        : ["Milos BG", "product", "apparel", "basketball"],
    robotsIndex: false,
  });

  try {
    const product = await getProductById(productId);

    if (!product) {
      return fallback;
    }

    const content = getLocalizedProductContent(product, lang);
    const cleanDescription = content.description.replace(/\s+/g, " ").trim();
    const summary = cleanDescription
      ? cleanDescription.slice(0, 155) +
        (cleanDescription.length > 155 ? "..." : "")
      : lang === "fr"
        ? "Découvrez les créations Milos BG conçues pour le terrain et en dehors."
        : "Shop authentic Milos BG gear built for on and off the court.";

    const heroImage =
      Array.isArray(product.media) && product.media.length > 0
        ? product.media[0] ?? "/Grinder.png"
        : "/Grinder.png";

    const canonicalId = encodeURIComponent(product._id ?? productId);

    return buildMetadata({
      title: content.title,
      description: summary,
      path: `/products/${canonicalId}`,
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
  productId,
  lang,
}: {
  productId: string;
  lang: StoreLanguage;
}) => {
  const basePath = `/products/${encodeURIComponent(productId)}`;
  const itemClass =
    "flex h-8 min-w-10 items-center justify-center px-3 text-[10px] font-bold uppercase transition-colors";

  return (
    <div className="flex justify-end pt-4">
      <div
        className="border-mbg-green flex border"
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

const ProductDetails = async ({ params, searchParams }: PageProps) => {
  const { productId } = await params;
  const { lang: rawLang } = await searchParams;
  const lang = normalizeStoreLanguage(rawLang);

  const productDetails = await getProductById(productId);

  if (!productDetails) return notFound();

  return (
    <Container className="min-h-[60vh]">
      <LanguageSwitcher productId={productId} lang={lang} />

      <div className="grid grid-cols-1 gap-7 py-7 md:grid-cols-2 md:gap-5">
        <Gallery productMedia={productDetails.media} />

        <div className="min-w-0">
          <ProductInfo productInfo={productDetails} lang={lang} />
          <ProductAccordion product={productDetails} lang={lang} />
        </div>
      </div>
    </Container>
  );
};

export default ProductDetails;
