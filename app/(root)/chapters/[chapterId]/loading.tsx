import Container from "@/components/mbg-components/Container";
import ProductCardSkeleton from "@/components/mbg-components/ProductCardSkeleton";

export default function LoadingChapter() {
  return (
    <Container>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
        {Array.from({ length: 10 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </Container>
  );
}
