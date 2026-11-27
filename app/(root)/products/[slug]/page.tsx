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
        className="flex rounded-sm border border-[#00821A]"
        role="group"
        aria-label={lang === "fr" ? "Choisir la langue" : "Choose language"}
      >
        <Link
          href={`${basePath}?lang=en`}
          aria-current={lang === "en" ? "page" : undefined}
          className={`${itemClass} ${
            lang === "en"
              ? "bg-[#00821A] text-white"
              : "bg-white text-[#00821A] hover:bg-[#00821A]/10"
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
              : "bg-white text-black hover:bg-black/5"
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
          detailText: "Explorez les détails, les matières et les finitions de cette pièce.",
          quest: "UN CHAPITRE À PORTER",
          questText:
            "Du terrain au quotidien, la pièce entre dans votre parcours. Choisissez vos options et, si nécessaire, demandez une adaptation avant de poursuivre votre parcours.",
          discover: "DÉCOUVRIR GRIND UNTIL ACHIEVE",
        }
      : {
          back: "All Outfits",
          note: "A piece designed to move through effort, motion and time.",
          detailLabel: "DISCOVER THE PIECE",
          detailText: "Explore the details, materials and finishing touches of this piece.",
          quest: "A CHAPTER TO WEAR",
          questText:
            "From court to everyday life, the piece becomes part of your path. Choose your options and, where appropriate, request a custom fit before the next chapter.",
          discover: "DISCOVER GRIND UNTIL ACHIEVE",
        };

  return (
    <main className="min-h-[65vh] bg-[#ededeb] font-[Kanit,sans-serif] text-black">
      <Container className="min-h-[60vh] py-3 pb-10 sm:py-5 sm:pb-12 lg:py-7 lg:pb-16">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-black/10 pb-3 sm:mb-5 sm:pb-4">
          <div className="min-w-0">
            <Link
              href={`/products?lang=${lang}`}
              className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#404040] transition hover:text-[#00821A]"
            >
              {copy.back}
            </Link>
            <h1 className="mt-1 text-[clamp(1.4rem,3vw,2rem)] font-black uppercase leading-[1.05] tracking-[-0.035em] text-black">
              {localized.title}
            </h1>
            <p className="mt-1 max-w-2xl text-xs leading-5 text-[#404040] sm:text-[13px]">{copy.note}</p>
          </div>
          <LanguageSwitcher slug={productSlug} lang={lang} />
        </div>

        {/* Separate dark cards prevent the left side from stretching to the height of the right accordions. */}
        <section
          aria-label={lang === "fr" ? "Présentation et achat" : "Product gallery and purchase"}
          className="grid min-w-0 items-start gap-3 sm:gap-4 lg:grid-cols-[minmax(0,1.18fr)_minmax(0,0.82fr)] lg:gap-5 xl:grid-cols-[minmax(0,1.236fr)_minmax(0,0.764fr)]"
        >
          {/* Gallery retains natural image framing, modal zoom and mobile thumbnails. */}
          <div className="min-w-0 border border-white/10 bg-[#080808] p-2 text-white shadow-[0_20px_55px_rgba(0,0,0,0.16)] sm:p-3 lg:p-4">
            <div className="mx-auto w-full max-w-[850px] overflow-hidden border border-white/10 bg-[#111111]">
              <Gallery productMedia={productDetails.media} productName={localized.title} />
            </div>
            <div className="mt-3 border-l-2 border-[#00821A] px-3 py-1 sm:mt-4 sm:px-4">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-[#00821A]">
                {copy.detailLabel}
              </p>
              <p className="mt-1 max-w-lg text-[12px] leading-[1.65] text-[#BFBFBF]">
                {copy.detailText}
              </p>
            </div>
          </div>

          {/* Independent right column: purchasing actions and details remain together. */}
          <div className="min-w-0 space-y-3 sm:space-y-4">
            <ProductInfo productInfo={productDetails} lang={lang} />
            <div className="min-w-0 border border-white/10 bg-[#0b0b0b] px-3 py-1 text-white shadow-[0_14px_45px_rgba(0,0,0,0.12)] sm:px-4 sm:py-2">
              <ProductAccordion product={productDetails} lang={lang} />
            </div>
          </div>
        </section>

        <section className="relative mt-4 overflow-hidden border border-white/10 bg-[#070707] text-white shadow-[0_18px_48px_rgba(0,0,0,0.16)] sm:mt-5">
          <div className="grid items-start gap-4 p-4 sm:p-6 lg:grid-cols-[minmax(0,1.618fr)_minmax(0,1fr)] lg:items-end lg:p-8">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#00821A]">{copy.quest}</p>
              <p className="mt-2 max-w-3xl text-[12px] leading-[1.75] text-[#BFBFBF] sm:text-sm">{copy.questText}</p>
            </div>
            <Link
              href={`/grind-until-achieve?lang=${lang}`}
              className="inline-flex min-h-11 items-center justify-center justify-self-start rounded-sm border border-white/25 px-4 py-2.5 text-center text-[10px] font-black uppercase tracking-[0.12em] text-white transition hover:border-[#00821A] hover:bg-[#00821A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00821A] lg:justify-self-end"
            >
              {copy.discover}
            </Link>
          </div>
        </section>
      </Container>
    </main>
  );
};

export default ProductDetails;
