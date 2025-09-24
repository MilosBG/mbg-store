import Container from "@/components/mbg-components/Container";
import { getProductById } from "@/lib/admin";
import React from "react";
import { notFound } from "next/navigation";
import Gallery from "../../components/Gallery";
import ProductInfo from "../../components/ProductInfo";

const ProductDetails = async ({
  params,
}: {
  params: Promise<{ productId: string }>;
}) => {
  const { productId } = await params;        // ⟵ await params
  const productDetails = await getProductById(productId);
  if (!productDetails) return notFound();

  return (
    <Container className="min-h-[60vh]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-7 md:gap-5 py-7">
        <Gallery productMedia={productDetails.media} />
        <ProductInfo productInfo={productDetails} />
      </div>
    </Container>
  );
};

export default ProductDetails;
