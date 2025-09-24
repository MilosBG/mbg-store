
import Container from "@/components/mbg-components/Container";
import HomeBanner from "./components/HomeBanner";
import Chapters from "@/components/mbg-components/Chapters";
import ProductList from "@/components/mbg-components/ProductList";
import { Suspense } from "react";
import ProductCardSkeleton from "@/components/mbg-components/ProductCardSkeleton";

export default function Home() {
  return (
    <Container className="py-3" >
      <HomeBanner />
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
    </Container>
  );
}
