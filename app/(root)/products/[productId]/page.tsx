import type { Metadata } from "next";
import Container from "@/components/mbg-components/Container";
import { getProductById } from "@/lib/admin";
import { buildMetadata } from "@/lib/seo";
import React from "react";
import { notFound } from "next/navigation";
import Gallery from "../../components/Gallery";
import ProductInfo from "../../components/ProductInfo";

export async function generateMetadata({ params }: { params: Promise<{ productId: string }> }): Promise<Metadata> {
  const { productId } = await params;
  const encodedId = encodeURIComponent(productId);
  const fallback = buildMetadata({
    title: "Product",
    description: "Discover Milos BG basketball-inspired apparel and accessories.",
    path: `/products/${encodedId}`,
    image: "/Grinder.png",
    keywords: ["Milos BG", "product"],
    robotsIndex: false,
  });

  try {
    const product = await getProductById(productId);

    if (!product) {
      return fallback;
    }

    const description = typeof product.description === "string" ? product.description : "";
    const cleanDescription = description.replace(/\s+/g, " ").trim();
    const summary = cleanDescription
      ? cleanDescription.slice(0, 155) + (cleanDescription.length > 155 ? "..." : "")
      : "Shop authentic Milos BG gear built for on and off the court.";
    const heroImage = Array.isArray(product.media) && product.media.length > 0 ? product.media[0] ?? "/Grinder.png" : "/Grinder.png";
    const canonicalId = encodeURIComponent(product._id ?? productId);

    return buildMetadata({
      title: product.title ?? "Product",
      description: summary,
      path: `/products/${canonicalId}`,
      image: heroImage,
      keywords: ["Milos BG", product.title ?? "product"],
    });
  } catch (error) {
    console.error("Failed to build product metadata", error);
    return fallback;
  }
}

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
