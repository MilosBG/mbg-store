"use client";

import type { Product } from "@/lib/types";
import {
  ArrowLeft,
  ArrowRight,
  PackageSearch,
} from "lucide-react";
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import ProductCard from "./ProductCard";

type ProductRailProps = {
  products: Product[];
};

const ProductRail = ({ products }: ProductRailProps) => {
  const railRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const rail = railRef.current;

    if (!rail) return;

    const { scrollLeft, scrollWidth, clientWidth } = rail;

    setCanScrollLeft(scrollLeft > 4);
    setCanScrollRight(
      scrollLeft + clientWidth < scrollWidth - 4
    );
  }, []);

  useEffect(() => {
    const rail = railRef.current;

    if (!rail) return;

    updateScrollState();

    rail.addEventListener("scroll", updateScrollState, {
      passive: true,
    });

    const resizeObserver = new ResizeObserver(() => {
      updateScrollState();
    });

    resizeObserver.observe(rail);

    return () => {
      rail.removeEventListener("scroll", updateScrollState);
      resizeObserver.disconnect();
    };
  }, [updateScrollState, products.length]);

  const scroll = (direction: "left" | "right") => {
    const rail = railRef.current;

    if (!rail) return;

    const firstCard = rail.querySelector<HTMLElement>(
      "[data-product-card]"
    );

    const cardWidth =
      firstCard?.getBoundingClientRect().width ?? 250;

    const gap = 16;

    /*
     * On déplace plusieurs cartes à la fois sur desktop,
     * mais seulement ~1 carte sur mobile.
     */
    const visibleCards = Math.max(
      1,
      Math.floor(rail.clientWidth / (cardWidth + gap))
    );

    const distance =
      (cardWidth + gap) * Math.max(1, visibleCards - 1);

    rail.scrollBy({
      left: direction === "right" ? distance : -distance,
      behavior: "smooth",
    });
  };

  if (!products.length) {
    return (
      <div className="rounded-2xl border border-black/10 bg-black/[0.02] px-6 py-14 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/5">
          <PackageSearch
            size={21}
            className="text-black/50"
          />
        </div>

        <h3 className="mt-4 text-sm font-semibold uppercase tracking-[0.08em] text-mbg-black">
          No outfits yet
        </h3>

        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-black/50">
          Products will appear here as soon as they are
          available.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-mbg-white/80">
      {/* HEADER */}
      <div className="mb-5 flex items-end justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-mbg-green">
            Collection
          </p>

          <h2 className="mt-1 heading2-bold">
            Outfits
          </h2>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation desktop */}
          <div className="hidden items-center gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Previous products"
              className="
                flex h-10 w-10 items-center justify-center
                rounded-xs border border-black/10
                bg-white
                transition-all duration-200
                hover:border-black hover:bg-mbg-black hover:text-white
                disabled:pointer-events-none
                disabled:opacity-25
              "
            >
              <ArrowLeft size={17} />
            </button>

            <button
              type="button"
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Next products"
              className="
                flex h-10 w-10 items-center justify-center
                rounded-xs border border-black/10
                bg-white
                transition-all duration-200
                hover:border-black hover:bg-mbg-black hover:text-white
                disabled:pointer-events-none
                disabled:opacity-25
              "
            >
              <ArrowRight size={17} />
            </button>
          </div>
        </div>
      </div>

      {/* RAIL */}
      <div className="relative">
        {/* léger fade gauche */}
        {canScrollLeft && (
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute bottom-0 left-0 top-0
              z-10 hidden w-10
              bg-gradient-to-r from-white to-transparent
              md:block
            "
          />
        )}

        {/* léger fade droit */}
        {canScrollRight && (
          <div
            aria-hidden="true"
            className="
              pointer-events-none absolute bottom-0 right-0 top-0
              z-10 hidden w-10
              bg-gradient-to-l from-white to-transparent
              md:block
            "
          />
        )}

        <div
          ref={railRef}
          className="
            flex w-full
            snap-x snap-mandatory
            gap-3 overflow-x-auto
            scroll-smooth
            pb-4
            sm:gap-4

            [&::-webkit-scrollbar]:hidden
            [-ms-overflow-style:none]
            [scrollbar-width:none]
          "
        >
          {products.map((product: Product) => (
            <div
              key={product._id}
              data-product-card
              className="
                min-w-0
                flex-[0_0_calc(50%-6px)]
                snap-start

                sm:flex-[0_0_calc(33.333%-11px)]
                md:flex-[0_0_calc(25%-12px)]
                lg:flex-[0_0_calc(20%-13px)]
              "
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </div>

      {/* MOBILE FOOTER */}
      <div className="mt-1 flex items-center justify-between sm:hidden">
        <p className="text-[10px] uppercase tracking-[0.14em] text-black/40">
          Swipe to explore
        </p>
      </div>
    </div>
  );
};

export default ProductRail;