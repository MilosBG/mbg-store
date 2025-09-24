import Container from "@/components/mbg-components/Container";
import { H2 } from "@/components/mbg-components/H2";
import Separator from "@/components/mbg-components/Separator";
import ProductCardSkeleton from "@/components/mbg-components/ProductCardSkeleton";

export default function LoadingSearchPage() {
  return (
    <Container className="mt-4">
      <H2>Search results</H2>
      <Separator className="bg-mbg-black mt-2 mb-4" />
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
        {Array.from({ length: 10 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </Container>
  );
}

