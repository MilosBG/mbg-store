import Container from "@/components/mbg-components/Container";
import HomeBanner from "./components/HomeBanner";
import Chapters from "@/components/mbg-components/Chapters";
import ProductList from "@/components/mbg-components/ProductList";
import { buildMetadata } from "@/lib/seo";
import { Suspense } from "react";
import ProductCardSkeleton from "@/components/mbg-components/ProductCardSkeleton";
import MilosBGModel from "./components/MilosBGModel";
import MilosBGBook from "./components/MilosBGBook";
import MilosBGAnimatedSlogan from "./components/MilosBGAnimatedSlogan/MilosBGAnimatedSlogan";
import MilosBGSocialsSection from "./components/MilosBGSocialsSection";
import GrindModeHero from "./components/GrindModeHero";

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

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    lang?: string | string[];
  }>;
}) {
  const { lang } = await searchParams;
  return (
    <Container className="py-3">
      <HomeBanner />
      <GrindModeHero lang={lang === "fr" ? "fr" : "en"} />
      <Chapters />
      <Suspense
        fallback={
          <div className="mt-10">
            <p className="py-3 heading2-bold">Outfits</p>
            <div className="mbg-p-between">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
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
      <MilosBGAnimatedSlogan />
      <MilosBGBook />
      <MilosBGSocialsSection />
    </Container>
  );
}
