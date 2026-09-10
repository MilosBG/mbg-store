/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import BasketBall from "@/components/mbg-components/BasketBall";
import BasketBallAnimation from "@/components/mbg-components/BasketBallAnimation";
import Button from "@/components/mbg-components/Button";
import useCart from "@/lib/hooks/useCart";
import type { StoreLanguage } from "@/lib/store-language";
import type { Product } from "@/lib/types";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";

type LocalizedProduct = Product & {
  titleFr?: string;
  descriptionFr?: string;
  categoryFr?: string;
};

type ProductInfoProps = {
  productInfo: Product;
  lang?: StoreLanguage;
};

const COPY = {
  en: {
    category: "Category",
    description: "Description",
    colors: "Colors",
    sizes: "Sizes",
    sizeGuide: "Size Guide",
    totalStock: "Total items stock",
    variantStock: "Variant stock",
    outOfStock: "Out of stock",
    quantity: "Quantity",
    shoot: "Shoot",
    emptyStock: "Empty stock",
    stock: "Stock",
    onlyLeft: (stock: number) => `Only ${stock} left`,
  },
  fr: {
    category: "Catégorie",
    description: "Description",
    colors: "Couleurs",
    sizes: "Tailles",
    sizeGuide: "Guide des tailles",
    totalStock: "Stock total",
    variantStock: "Stock de la variante",
    outOfStock: "Rupture de stock",
    quantity: "Quantité",
    shoot: "Shooter",
    emptyStock: "Stock épuisé",
    stock: "Stock",
    onlyLeft: (stock: number) => `Plus que ${stock} en stock`,
  },
} as const;

const ProductInfo = ({ productInfo, lang = "en" }: ProductInfoProps) => {
  const t = COPY[lang];

  // Live copy of the product for real-time stock updates
  const [product, setProduct] = useState<Product>(productInfo);

  // Poll product details; pause when tab hidden and refresh on focus
  useEffect(() => {
    let mounted = true;
    const POLL_VISIBLE_MS = 5000;
    let intervalId: number | null = null;

    const clear = () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const fetchLatest = async () => {
      try {
        const res = await fetch(
          `/api/products/${encodeURIComponent(productInfo._id)}`,
          {
            cache: "no-store",
          },
        );

        if (!mounted) return;
        if (res.status === 404) return;

        if (!res.ok) {
          if (res.status >= 500 && mounted) {
            console.warn(`[ProductInfo] refresh failed (${res.status})`);
          }
          return;
        }

        const fresh = (await res.json()) as Product;
        if (!mounted || !fresh) return;

        setProduct((prev) => {
          const prevKey = JSON.stringify({
            countInStock: (prev as any)?.countInStock ?? null,
            variants: (prev as any)?.variants ?? null,
            price: (prev as any)?.price ?? null,
            updatedAt: (prev as any)?.updatedAt ?? null,
            titleFr: (prev as any)?.titleFr ?? null,
            descriptionFr: (prev as any)?.descriptionFr ?? null,
            categoryFr: (prev as any)?.categoryFr ?? null,
          });

          const nextKey = JSON.stringify({
            countInStock: (fresh as any)?.countInStock ?? null,
            variants: (fresh as any)?.variants ?? null,
            price: (fresh as any)?.price ?? null,
            updatedAt: (fresh as any)?.updatedAt ?? null,
            titleFr: (fresh as any)?.titleFr ?? null,
            descriptionFr: (fresh as any)?.descriptionFr ?? null,
            categoryFr: (fresh as any)?.categoryFr ?? null,
          });

          if (prevKey !== nextKey) return { ...prev, ...fresh } as Product;
          return prev;
        });
      } catch (error) {
        if (mounted) {
          console.warn("[ProductInfo] refresh error", error);
        }
      }
    };

    const start = () => {
      clear();
      if (document.visibilityState === "visible") {
        // Immediate refresh then start interval
        fetchLatest();
        intervalId = window.setInterval(fetchLatest, POLL_VISIBLE_MS);
      }
    };

    const onVisibility = () => {
      if (!mounted) return;
      if (document.visibilityState === "visible") start();
      else clear();
    };

    const onFocus = () => {
      if (!mounted) return;
      start();
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);

    return () => {
      mounted = false;
      clear();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
    };
  }, [productInfo._id]);

  const localizedProduct = product as LocalizedProduct;
  const productTitle =
    lang === "fr"
      ? localizedProduct.titleFr?.trim() || product.title
      : product.title;
  const productDescription =
    lang === "fr"
      ? localizedProduct.descriptionFr?.trim() || product.description
      : product.description;
  const productCategory =
    lang === "fr"
      ? localizedProduct.categoryFr?.trim() || product.category
      : product.category;

  const variants = (product as any)?.variants as
    | Array<{ color?: string; size?: string; stock: number }>
    | undefined;

  const colorsArr = Array.isArray((product as any)?.colors)
    ? ((product as any).colors as string[])
    : [];

  const sizesArr = Array.isArray((product as any)?.sizes)
    ? ((product as any).sizes as string[])
    : [];

  // Require explicit user selection when options exist
  const pickDefaults = () => {
    const c = colorsArr.length > 0 ? "" : colorsArr[0] ?? "";
    const s = sizesArr.length > 0 ? "" : sizesArr[0] ?? "";
    return { c, s };
  };

  const defaults = pickDefaults();

  const [selectedColor, setSeclectedColor] = useState<string>(defaults.c);
  const [selectedSize, setSeclectedSize] = useState<string>(defaults.s);

  // Helpers to compute stock for color/size choices
  const stockForColor = (color: string): number => {
    if (!Array.isArray(variants) || variants.length === 0) {
      return Number((product as any)?.countInStock ?? 0);
    }

    if (selectedSize) {
      const variant = variants.find(
        (item) =>
          (item.color ?? "") === color &&
          (item.size ?? "") === (selectedSize ?? ""),
      );
      return Number(variant?.stock ?? 0);
    }

    return variants
      .filter((item) => (item.color ?? "") === color)
      .reduce((total, item) => total + Number(item?.stock ?? 0), 0);
  };

  const stockForSize = (size: string): number => {
    if (!Array.isArray(variants) || variants.length === 0) {
      return Number((product as any)?.countInStock ?? 0);
    }

    if (selectedColor) {
      const variant = variants.find(
        (item) =>
          (item.size ?? "") === size &&
          (item.color ?? "") === (selectedColor ?? ""),
      );
      return Number(variant?.stock ?? 0);
    }

    return variants
      .filter((item) => (item.size ?? "") === size)
      .reduce((total, item) => total + Number(item?.stock ?? 0), 0);
  };

  const handleSelectColor = (color: string) => {
    if (color === selectedColor) return;

    setSeclectedColor(color);

    if (Array.isArray(variants) && variants.length > 0) {
      const exact = variants.find(
        (variant) =>
          (variant.color ?? "") === color &&
          (variant.size ?? "") === (selectedSize ?? "") &&
          Number(variant?.stock ?? 0) > 0,
      );

      if (!exact) {
        const alternative = variants.find(
          (variant) =>
            (variant.color ?? "") === color &&
            Number(variant?.stock ?? 0) > 0,
        );

        if (alternative?.size) setSeclectedSize(alternative.size);
      }
    }
  };

  const handleSelectSize = (size: string) => {
    if (size === selectedSize) return;

    setSeclectedSize(size);

    if (Array.isArray(variants) && variants.length > 0) {
      const exact = variants.find(
        (variant) =>
          (variant.size ?? "") === size &&
          (variant.color ?? "") === (selectedColor ?? "") &&
          Number(variant?.stock ?? 0) > 0,
      );

      if (!exact) {
        const alternative = variants.find(
          (variant) =>
            (variant.size ?? "") === size &&
            Number(variant?.stock ?? 0) > 0,
        );

        if (alternative?.color) setSeclectedColor(alternative.color);
      }
    }
  };

  // Compute per-variant stock when variants exist
  const selectStock = (color?: string, size?: string) => {
    const vars = (product as any)?.variants as
      | Array<{ color?: string; size?: string; stock: number }>
      | undefined;

    const hasVariants = Array.isArray(vars) && vars.length > 0;
    const needsColor = hasVariants && colorsArr.length > 0;
    const needsSize = hasVariants && sizesArr.length > 0;

    if (hasVariants) {
      const colorReady = !needsColor || !!color;
      const sizeReady = !needsSize || !!size;

      if (!colorReady || !sizeReady) return 0;

      const exact = vars.find(
        (variant) =>
          (variant.color ?? "") === (color ?? "") &&
          (variant.size ?? "") === (size ?? ""),
      );

      return Number(exact?.stock ?? 0);
    }

    return Number((product as any)?.countInStock ?? 0);
  };

  // Total stock follows admin logic: sum of variants when present, otherwise countInStock
  const totalStock = (() => {
    if (Array.isArray(variants) && variants.length > 0) {
      return variants.reduce(
        (total, variant) => total + Number(variant?.stock ?? 0),
        0,
      );
    }

    return Number((product as any)?.countInStock ?? 0);
  })();

  const currentStock = selectStock(selectedColor, selectedSize);
  const [quantity, setQuantity] = useState<number>(currentStock > 0 ? 1 : 0);

  useEffect(() => {
    // Clamp or reset quantity when selection changes
    setQuantity((currentQuantity) => {
      if (currentStock <= 0) return 0;
      return Math.min(Math.max(currentQuantity, 1), currentStock);
    });
  }, [selectedColor, selectedSize, currentStock]);

  const cart = useCart();

  const shootBtnRef = useRef<HTMLButtonElement>(null);
  const [animationData, setAnimationData] = useState<{
    start: DOMRect;
    end: DOMRect;
  } | null>(null);

  return (
    <div className="w-full md:w-full flex flex-col gap-4 bg-mbg-green/7 px-7 py-4">
      <div className="flex items-center justify-between border-b border-mbg-green pb-1">
        <p className="text-xl font-bold uppercase text-mbg-black">
          {productTitle}
        </p>
        <BasketBall product={product} />
      </div>

      <p className="font-bold text-lg text-mbg-green">€ {product.price}</p>

      <div className="flex gap-2 border-b border-t py-2 border-mbg-green">
        <p className="uppercase text-[11px] font-semibold">{t.category}</p>
        <p className="uppercase text-[11px] font-semibold text-mbg-green">
          {productCategory}
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="uppercase text-[11px] font-semibold">{t.description}</p>
        <p className="uppercase text-[11px] font-semibold text-mbg-green">
          {productDescription}
        </p>
      </div>

      {colorsArr.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="uppercase text-[11px] font-semibold">{t.colors}</p>

          <div className="flex gap-2 flex-wrap">
            {colorsArr.map((color) => {
              const colorStock = stockForColor(color);
              const disabled = colorStock <= 0;

              return (
                <button
                  key={color}
                  type="button"
                  onClick={() => !disabled && handleSelectColor(color)}
                  aria-pressed={selectedColor === color}
                  disabled={disabled}
                  className={`px-2 py-0.5 rounded-xs text-[10px] uppercase border font-semibold transition ${
                    selectedColor === color
                      ? "bg-mbg-black text-mbg-green border-mbg-black"
                      : "text-mbg-black border-mbg-black"
                  } ${
                    disabled
                      ? "opacity-40 cursor-not-allowed"
                      : "cursor-pointer hover:bg-mbg-black/7"
                  }`}
                  title={
                    Array.isArray(variants) && variants.length > 0
                      ? `${t.stock}: ${colorStock}`
                      : undefined
                  }
                >
                  {color}
                  {Array.isArray(variants) && variants.length > 0 && (
                    <span className="ml-1 text-[9px] text-mbg-green">
                      ({colorStock})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {sizesArr.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="uppercase text-[11px] font-semibold">{t.sizes}</p>

          <div className="flex gap-2 flex-wrap">
            {sizesArr.map((size) => {
              const sizeStock = stockForSize(size);
              const disabled = sizeStock <= 0;

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() => !disabled && handleSelectSize(size)}
                  aria-pressed={selectedSize === size}
                  disabled={disabled}
                  className={`px-2 py-0.5 rounded-xs text-[10px] uppercase border font-semibold transition ${
                    selectedSize === size
                      ? "bg-mbg-black text-mbg-green border-mbg-black"
                      : "text-mbg-black border-mbg-black"
                  } ${
                    disabled
                      ? "opacity-40 cursor-not-allowed"
                      : "cursor-pointer hover:bg-mbg-black/7"
                  }`}
                  title={
                    Array.isArray(variants) && variants.length > 0
                      ? `${t.stock}: ${sizeStock}`
                      : undefined
                  }
                >
                  {size}
                  {Array.isArray(variants) && variants.length > 0 && (
                    <span className="ml-1 text-[9px] text-mbg-green">
                      ({sizeStock})
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <Link
            href={`/size-guide?lang=${lang}`}
            className="mbg-link text-[10px]"
          >
            {t.sizeGuide}
          </Link>
        </div>
      )}

      <p className="text-[11px] uppercase font-semibold">
        {totalStock > 0 ? (
          <>
            <span>
              {t.totalStock}: {totalStock}
            </span>

            {Array.isArray(variants) && variants.length > 0 && (
              <span className="text-mbg-green">
                {" • "}
                {t.variantStock}: {currentStock}
              </span>
            )}
          </>
        ) : (
          <span className="text-red-600">{t.outOfStock}</span>
        )}
      </p>

      <div className="flex flex-col gap-2">
        <p className="uppercase text-[11px] font-semibold">{t.quantity}</p>

        <div className="flex gap-3 items-center">
          <button
            type="button"
            aria-label={lang === "fr" ? "Diminuer la quantité" : "Decrease quantity"}
            disabled={quantity <= 1}
            onClick={() => quantity > 1 && setQuantity(quantity - 1)}
            className="mbg-p-center bg-mbg-black/7 py-1 px-3 font-bold hover:bg-mbg-green hover:text-mbg-white hoverEffect rounded-xs cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          >
            -
          </button>

          <p className="font-bold text-[11px] text-mbg-green">{quantity}</p>

          <button
            type="button"
            aria-label={lang === "fr" ? "Augmenter la quantité" : "Increase quantity"}
            disabled={currentStock <= 0 || quantity >= currentStock}
            onClick={() => setQuantity(Math.min(quantity + 1, currentStock))}
            className="mbg-p-center bg-mbg-black/7 py-1 px-3 font-bold hover:bg-mbg-green hover:text-mbg-white hoverEffect rounded-xs cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
          >
            +
          </button>
        </div>
      </div>

      <Button
        ref={shootBtnRef}
        mbg="primefull"
        type="button"
        disabled={currentStock <= 0 || quantity <= 0}
        aria-disabled={currentStock <= 0 || quantity <= 0}
        onClick={() => {
          const start = shootBtnRef.current?.getBoundingClientRect();
          const end = document
            .getElementById("basket-icon")
            ?.getBoundingClientRect();

          if (start && end) {
            setAnimationData({ start, end });

            // Add to cart only after animation finishes
            setTimeout(() => {
              cart.addItem({
                item: product,
                quantity,
                color: selectedColor,
                size: selectedSize,
              });
            }, 800);
          }
        }}
      >
        {currentStock > 0 ? t.shoot : t.emptyStock}
      </Button>

      {currentStock > 0 && currentStock <= 5 && (
        <p className="text-[10px] text-mbg-green uppercase tracking-wider font-medium mt-1">
          {t.onlyLeft(currentStock)}
        </p>
      )}

      {animationData && (
        <BasketBallAnimation
          start={animationData.start}
          end={animationData.end}
          onComplete={() => setAnimationData(null)}
        />
      )}
    </div>
  );
};

export default ProductInfo;
