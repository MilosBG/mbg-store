
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

const ProductCard = ({
  product,
  updateSignedInUser,
}: ProductCardProps) => {
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
      className={`
        group
        relative
        isolate
        flex
        w-full
        max-w-[250px]
        flex-col
        overflow-hidden
        border
        border-mbg-rgbalight
        bg-mbg-white
        shadow-lg
        ${styles.productCard}
      `}
    >
      {/* LIEN PRODUIT : CARTE ENTIÈRE CLIQUABLE */}
      <Link
        href={`/products/${product.slug}`}
        className="
          absolute
          inset-0
          z-10
          outline-none
        "
      >
        <span className="sr-only">
          View {product.title}
        </span>
      </Link>

      {/* IMAGE PRODUIT */}
      <div className="relative w-full overflow-hidden">
        <Image
          src={imgSrc}
          alt={product.title}
          width={250}
          height={300}
          className="
            block
            w-full
            object-contain
            shadow-xs
            transition-transform
            duration-500
            ease-out
            motion-safe:group-hover:scale-[1.025]
          "
        />
      </div>

      {/* INFORMATIONS PRODUIT */}
      <div className="px-2 pt-2">
        <p
          className="
            text-xs
            font-bold
            uppercase
            text-mbg-black
          "
        >
          {product.title}
        </p>

        <p
          className="
            text-[7px]
            font-medium
            uppercase
            tracking-wider
            text-mbg-green
          "
        >
          {product.tags}
        </p>
      </div>

      {/* PRIX + BASKETBALL */}
      <div
        className="
          mt-auto
          flex
          items-center
          justify-between
          border-t
          border-mbg-rgbalight
          bg-mbg-green/7
          px-2
          py-2
          pt-3
        "
      >
        <p className="font-bold text-mbg-green">
          € {product.price}
        </p>

        {/* BOUTON AU-DESSUS DU LIEN DE LA CARTE */}
        <div className="relative z-30">
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

// SKELETON
export function ProductCardSkeleton() {
  return (
    <div
      className="
        flex
        w-full
        max-w-[250px]
        flex-col
        border
        border-mbg-rgbalight
        bg-mbg-white
        shadow-lg
      "
    >
      <div
        className="
          h-[300px]
          w-full
          animate-pulse
          bg-mbg-green/7
        "
      />

      <div className="space-y-2 px-2 pt-2">
        <div
          className="
            h-3
            w-40
            max-w-full
            animate-pulse
            bg-mbg-green/15
          "
        />

        <div
          className="
            h-2
            w-24
            animate-pulse
            bg-mbg-green/10
          "
        />
      </div>

      <div
        className="
          mt-3
          flex
          items-center
          justify-between
          border-t
          border-mbg-rgbalight
          px-2
          py-2
        "
      >
        <div
          className="
            h-3
            w-16
            animate-pulse
            bg-mbg-green/10
          "
        />

        <div
          className="
            h-6
            w-6
            animate-pulse
            rounded-full
            bg-mbg-green/10
          "
        />
      </div>
    </div>
  );
}
