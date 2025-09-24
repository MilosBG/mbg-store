"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import BasketBall from "./BasketBall";
import type { Product, User } from "@/lib/types";

interface ProductCardProps {
  product: Product
  updateSignedInUser?: (updatedUser: User) => void
}

const ProductCard = ({ product, updateSignedInUser }: ProductCardProps) => {
  const fallbackSvg =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="250" height="300"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-size="14">No image</text></svg>'
    );
  const imgSrc = (Array.isArray(product.media) && product.media[0]) ? product.media[0] : fallbackSvg;
  return (
    <>
      <Link
        href={`/products/${product._id}`}
        className="bg-mbg-white p-2  rounded-t-md shadow-lg w-fit flex flex-col "
      >
        <Image
          src={imgSrc}
          alt={`${product.title}`}
          width={250}
          height={300}
          className="object-contain w-full p-4 shadow-xs rounded-b-md mb-2 border-b-2 border-l-1 border-r-1 border-mbg-black/7"
        />
        <div>
          <p className="text-xs font-bold uppercase text-mbg-black">
            {product.title}
          </p>
          <p className="text-[7px] font-medium uppercase tracking-wider text-mbg-green">
            {product.tags}
          </p>
        </div>
        <div className="mt-3 bg-mbg-green/7 py-2 px-2 mbg-p-between">
          <p className="font-bold text-mbg-green">€ {product.price}</p>
          <BasketBall product={product} updateSignedInUser={updateSignedInUser} />
        </div>
      </Link>
    </>
  );
};

export default ProductCard;

// Skeleton placeholder for product card while loading
export function ProductCardSkeleton() {
  return (
    <div className="bg-mbg-white p-2 rounded-t-md shadow-lg w-fit flex flex-col">
      <div className="w-full p-4 rounded-b-md mb-2 border-b-2 border-l-1 border-r-1 border-mbg-black/7">
        <div className="h-[300px] w-[250px] max-w-full mx-auto rounded-xs animate-pulse bg-mbg-green/7" />
      </div>
      <div className="space-y-2">
        <div className="h-3 w-40 rounded-xs bg-mbg-green animate-pulse/7" />
        <div className="h-2 w-24 rounded-xs bg-mbg-green animate-pulse/7" />
      </div>
      <div className="mt-3 py-2 px-2 mbg-p-between">
        <div className="h-3 w-16 rounded-xs bg-mbg-green/7 animate-pulse" />
        <div className="h-6 w-6 rounded-full bg-mbg-green/7 animate-pulse" />
      </div>
    </div>
  );
}
