import React from "react";

import Container from "@/components/mbg-components/Container";
import ProductCardSkeleton, {
  SkeletonBlock,
} from "@/components/mbg-components/ProductCardSkeleton";

export default function LoadingChapter() {
  return (
    <Container>
      <p role="status" className="sr-only">
        Loading chapter and products…
      </p>

      <div aria-hidden="true">
        {/* Navigation entre les cinq chapitres. */}
        <div className="flex items-center gap-2 overflow-hidden bg-mbg-white py-4 sm:gap-3">
          {Array.from({ length: 5 }, (_, index) => (
            <SkeletonBlock
              key={index}
              className="h-9 min-w-0 flex-1 rounded-xs bg-mbg-black/[0.06]"
            />
          ))}
        </div>

        <div className="flex flex-col items-center gap-0 py-5">
          {/* La page finale réserve 200 px à l'image du chapitre. */}
          <SkeletonBlock className="h-[200px] w-full border-b border-mbg-black/10 bg-mbg-green/[0.06]" />

          <div className="flex max-w-full items-center justify-center border-b border-mbg-green/20 py-5">
            <SkeletonBlock className="h-10 w-48 max-w-full rounded-xs bg-mbg-black/[0.08]" />
          </div>

          {/* Description du chapitre. */}
          <div className="mt-3 w-full self-stretch border-t border-mbg-green/20 bg-mbg-green/10 px-6 py-4">
            <div className="max-w-[1100px] space-y-2.5 py-1">
              <SkeletonBlock className="h-2.5 w-full rounded-full bg-mbg-green/10" />
              <SkeletonBlock className="h-2.5 w-[85%] rounded-full bg-mbg-green/10" />
              <SkeletonBlock className="h-2.5 w-[55%] rounded-full bg-mbg-green/10" />
            </div>
          </div>

          {/* Même grille responsive que les produits de la page finale. */}
          <div className="mt-10 grid w-full grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: 10 }, (_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
