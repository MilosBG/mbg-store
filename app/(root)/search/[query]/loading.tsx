import React from "react";

import Container from "@/components/mbg-components/Container";
import { H2 } from "@/components/mbg-components/H2";
import ProductCardSkeleton from "@/components/mbg-components/ProductCardSkeleton";
import Separator from "@/components/mbg-components/Separator";

export default function LoadingSearchPage() {
  return (
    <Container className="mt-4 min-h-[50vh]">
      <H2>Search results</H2>
      <Separator className="bg-mbg-black mt-2 mb-4" />

      <p role="status" className="sr-only">
        Loading search results…
      </p>

      <div
        aria-hidden="true"
        className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5"
      >
        {Array.from({ length: 10 }, (_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    </Container>
  );
}
