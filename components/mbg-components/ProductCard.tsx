"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";

import BasketBall from "./BasketBall";
import styles from "./ProductCard.module.css";
import type { Product, User } from "@/lib/types";

interface ProductCardProps {
  product: Product;
  updateSignedInUser?: (updatedUser: User) => void;
}

const ProductCard = ({ product, updateSignedInUser }: ProductCardProps) => {
  const fallbackSvg =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="250" height="300"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#9ca3af" font-size="14">No image</text></svg>',
    );

  const imgSrc =
    Array.isArray(product.media) && product.media[0]
      ? product.media[0]
      : fallbackSvg;

  return (
    <article
      style={{ overflow: "visible" }}
      className={`
        group relative isolate z-0 flex w-full max-w-[250px] flex-col
        overflow-visible border border-mbg-rgbalight bg-mbg-white shadow-lg
        hover:z-20 focus-within:z-20
        ${styles.productCard}
      `}
    >
      {/* L'ensemble de la carte ouvre le produit, sauf le bouton favoris. */}
      <Link
        href={`/products/${product.slug}`}
        className="absolute inset-0 z-10 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mbg-green"
      >
        <span className="sr-only">View {product.title}</span>
      </Link>

      {/* Seule l'image est recadrée ; la carte laisse sortir les confettis. */}
      <div className="relative w-full overflow-hidden">
        <Image
          src={imgSrc}
          alt={product.title}
          width={250}
          height={300}
          className="block w-full object-contain shadow-xs transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.025]"
        />
      </div>

      <div className="px-2 py-2">
        <p className="text-xs font-bold uppercase text-mbg-black">
          {product.title}
        </p>
        <p className="text-[7px] font-medium uppercase tracking-wider text-mbg-green">
          {product.tags}
        </p>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-mbg-rgbalight bg-mbg-green/7 px-2 py-2">
        <p className="font-bold text-mbg-green">€ {product.price}</p>

        {/* Au-dessus du lien produit ; particules libres de dépasser la carte. */}
        <div className="relative z-30 flex shrink-0 items-center justify-center overflow-visible">
          <BasketBall
            product={product}
            updateSignedInUser={updateSignedInUser}
          />
        </div>
      </div>
    </article>
  );
};

export default ProductCard;

export function ProductCardSkeleton() {
  return (
    <div className="flex w-full max-w-[250px] flex-col border border-mbg-rgbalight bg-mbg-white shadow-lg">
      <div className="h-[300px] w-full animate-pulse bg-mbg-green/7" />

      <div className="space-y-2 px-2 pt-2">
        <div className="h-3 w-40 max-w-full animate-pulse bg-mbg-green/15" />
        <div className="h-2 w-24 animate-pulse bg-mbg-green/10" />
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-mbg-rgbalight px-2 py-2">
        <div className="h-3 w-16 animate-pulse bg-mbg-green/10" />
        <div className="h-6 w-6 animate-pulse rounded-full bg-mbg-green/10" />
      </div>
    </div>
  );
}
