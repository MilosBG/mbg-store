
import { Suspense } from "react";

import Container from "@/components/mbg-components/Container";
import Chapters from "@/components/mbg-components/Chapters";
import ProductList from "@/components/mbg-components/ProductList";
import ProductCardSkeleton from "@/components/mbg-components/ProductCardSkeleton";

import HomeBanner from "./components/HomeBanner";
import GrindUntilAchieveHero from "./components/GrindUntilAchieveHero";
import WelcomePopup from "./components/WelcomePopup";
import MilosBGAnimatedSlogan from "./components/MilosBGAnimatedSlogan/MilosBGAnimatedSlogan";
import MilosBGSocialsSection from "./components/MilosBGSocialsSection";

import { buildMetadata } from "@/lib/seo";
import { getWelcomeSettings } from "@/lib/welcome";
import { normalizeStoreLanguage } from "@/lib/store-language";

export const dynamic = "force-dynamic";

export const metadata = buildMetadata({
  title: "Milos BG",
  description:
    "A story of progression, written one chapter at a time. Discover handcrafted apparel inspired by basketball, craftsmanship and the GRIND UNTIL ACHIEVE Mentality.",
  path: "/",
  image: "/milos-bg-og.jpg",
  keywords: [
    "Milos BG",
    "Grind Until Achieve",
    "basketball apparel",
    "basketball clothing",
    "streetwear",
    "handcrafted clothing",
    "made in France",
  ],
});

type HomeProps = {
  searchParams: Promise<{
    lang?: string | string[];
  }>;
};

export default async function Home({
  searchParams,
}: HomeProps) {
  const params = await searchParams;

  const rawLang = Array.isArray(params.lang)
    ? params.lang[0]
    : params.lang;

  const lang = normalizeStoreLanguage(rawLang);

  const welcome = await getWelcomeSettings();

  return (
    <Container className="py-3">
      {/* WELCOME POPUP */}
      <WelcomePopup config={welcome} lang={lang} />

      {/* MAIN HOME BANNER */}
      <HomeBanner />

      {/* GRIND UNTIL ACHIEVE HERO */}
      <GrindUntilAchieveHero lang={lang} />

      {/* FIVE CHAPTERS */}
      <Chapters />

      {/* OUTFITS */}
      <Suspense
        fallback={
          <div className="mt-10">
            <p className="heading2-bold py-3">
              Outfits
            </p>

            <div className="mbg-p-between">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        }
      >
        <ProductList />
      </Suspense>

      {/* ANIMATED SLOGAN */}
      <MilosBGAnimatedSlogan />

      {/* SOCIAL NETWORKS */}
      <MilosBGSocialsSection />
    </Container>
  );
}
