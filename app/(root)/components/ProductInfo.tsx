/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import BasketBall from "@/components/mbg-components/BasketBall";
import Button from "@/components/mbg-components/Button";
import BasketBallAnimation from "@/components/mbg-components/BasketBallAnimation";
import useCart from "@/lib/hooks/useCart";
import React, { useEffect, useRef, useState } from "react";
import type { Product } from "@/lib/types";
import Link from "next/link";
import { getProductDetails } from "@/lib/actions/actions";

const ProductInfo = ({ productInfo }: { productInfo: Product }) => {
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
        const fresh = await getProductDetails(productInfo._id);
        if (!mounted || !fresh) return;
        setProduct((prev) => {
          const prevKey = JSON.stringify({
            countInStock: (prev as any)?.countInStock ?? null,
            variants: (prev as any)?.variants ?? null,
            price: (prev as any)?.price ?? null,
            updatedAt: (prev as any)?.updatedAt ?? null,
          });
          const nextKey = JSON.stringify({
            countInStock: (fresh as any)?.countInStock ?? null,
            variants: (fresh as any)?.variants ?? null,
            price: (fresh as any)?.price ?? null,
            updatedAt: (fresh as any)?.updatedAt ?? null,
          });
          if (prevKey !== nextKey) return { ...prev, ...fresh } as Product;
          return prev;
        });
      } catch {
        // ignore transient errors
      }
    };

    const start = () => {
      clear();
      if (document.visibilityState === "visible") {
        // immediate refresh then start interval
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

    // initialize
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
  // Helpers to compute stock for color/size choices
  const stockForColor = (color: string): number => {
    if (!Array.isArray(variants) || variants.length === 0)
      return Number((product as any)?.countInStock ?? 0);
    if (selectedSize) {
      const v = variants.find(
        (x) =>
          (x.color ?? "") === color && (x.size ?? "") === (selectedSize ?? "")
      );
      return Number(v?.stock ?? 0);
    }
    return variants
      .filter((x) => (x.color ?? "") === color)
      .reduce((a, b) => a + Number(b?.stock ?? 0), 0);
  };

  const stockForSize = (size: string): number => {
    if (!Array.isArray(variants) || variants.length === 0)
      return Number((product as any)?.countInStock ?? 0);
    if (selectedColor) {
      const v = variants.find(
        (x) =>
          (x.size ?? "") === size && (x.color ?? "") === (selectedColor ?? "")
      );
      return Number(v?.stock ?? 0);
    }
    return variants
      .filter((x) => (x.size ?? "") === size)
      .reduce((a, b) => a + Number(b?.stock ?? 0), 0);
  };

  const handleSelectColor = (color: string) => {
    if (color === selectedColor) return;
    setSeclectedColor(color);
    if (Array.isArray(variants) && variants.length > 0) {
      const exact = variants.find(
        (v) =>
          (v.color ?? "") === color &&
          (v.size ?? "") === (selectedSize ?? "") &&
          Number(v?.stock ?? 0) > 0
      );
      if (!exact) {
        const alt = variants.find(
          (v) => (v.color ?? "") === color && Number(v?.stock ?? 0) > 0
        );
        if (alt?.size) setSeclectedSize(alt.size);
      }
    }
  };

  const handleSelectSize = (size: string) => {
    if (size === selectedSize) return;
    setSeclectedSize(size);
    if (Array.isArray(variants) && variants.length > 0) {
      const exact = variants.find(
        (v) =>
          (v.size ?? "") === size &&
          (v.color ?? "") === (selectedColor ?? "") &&
          Number(v?.stock ?? 0) > 0
      );
      if (!exact) {
        const alt = variants.find(
          (v) => (v.size ?? "") === size && Number(v?.stock ?? 0) > 0
        );
        if (alt?.color) setSeclectedColor(alt.color);
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
      // Require selections for required dimensions
      const colorReady = !needsColor || !!color;
      const sizeReady = !needsSize || !!size;
      if (!colorReady || !sizeReady) return 0;

      // Exact match when both relevant dimensions are chosen
      const exact = vars.find(
        (v) =>
          (v.color ?? "") === (color ?? "") && (v.size ?? "") === (size ?? "")
      );
      return Number(exact?.stock ?? 0);
    }
    return Number((product as any)?.countInStock ?? 0);
  };

  // Total stock follows admin logic: sum of variants when present, otherwise countInStock
  const totalStock = (() => {
    const vars = variants;
    if (Array.isArray(vars) && vars.length > 0) {
      return vars.reduce((acc, v) => acc + Number(v?.stock ?? 0), 0);
    }
    return Number((product as any)?.countInStock ?? 0);
  })();

  const [selectedColor, setSeclectedColor] = useState<string>(defaults.c);
  const [selectedSize, setSeclectedSize] = useState<string>(defaults.s);
  const currentStock = selectStock(selectedColor, selectedSize);
  const [quantity, setQuantity] = useState<number>(currentStock > 0 ? 1 : 0);

  useEffect(() => {
    // Clamp or reset quantity when selection changes
    setQuantity((q) => {
      if (currentStock <= 0) return 0;
      return Math.min(Math.max(q, 1), currentStock);
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
          {product.title}
        </p>
        <BasketBall product={product} />
      </div>
      <p className="font-bold text-lg text-mbg-green">€ {product.price}</p>

      <div className="flex gap-2 border-b border-t py-2 border-mbg-green ">
        <p className="uppercase text-[11px] font-semibold">Category</p>
        <p className="uppercase text-[11px] font-semibold text-mbg-green">
          {product.category}
        </p>
      </div>
      <div className="flex flex-col gap-2 ">
        <p className="uppercase text-[11px] font-semibold">Description</p>
        <p className="uppercase text-[11px] font-semibold text-mbg-green">
          {product.description}
        </p>
      </div>
      {colorsArr.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="uppercase text-[11px] font-semibold">Colors</p>
          <div className="flex gap-2 flex-wrap">
            {colorsArr.map((color) => {
              const cStock = stockForColor(color);
              const disabled = cStock <= 0;
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
                      ? `Stock: ${cStock}`
                      : undefined
                  }
                >
                  {color}
                  {Array.isArray(variants) && variants.length > 0 && (
                    <span className="ml-1 text-[9px] text-mbg-green">
                      ({cStock})
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
          <p className="uppercase text-[11px] font-semibold">Sizes</p>
          <div className="flex gap-2 flex-wrap">
            {sizesArr.map((size) => {
              const sStock = stockForSize(size);
              const disabled = sStock <= 0;
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
                      ? `Stock: ${sStock}`
                      : undefined
                  }
                >
                  {size}
                  {Array.isArray(variants) && variants.length > 0 && (
                    <span className="ml-1 text-[9px] text-mbg-green">
                      ({sStock})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <Link href={"/size-guide"} className="mbg-link text-[10px]" >Size Guide</Link>
        </div>
      )}

      <p className="text-[11px] uppercase font-semibold">
        {totalStock > 0 ? (
          <>
            <span className="">Total items stock: {totalStock}</span>
            {Array.isArray(variants) && variants.length > 0 && (
              <span className="text-mbg-green">
                {" "}
                {" • Variant Stock :"} {currentStock}
              </span>
            )}
          </>
        ) : (
          <span className="text-red-600">Out of stock</span>
        )}
      </p>

      <div className="flex flex-col gap-2">
        <p className="uppercase text-[11px] font-semibold">Quantity</p>
        <div className="flex gap-3 items-center">
          <div
            role="button"
            onClick={() => quantity > 1 && setQuantity(quantity - 1)}
            className="mbg-p-center bg-mbg-black/7 py-1 px-3 font-bold hover:bg-mbg-green hover:text-mbg-white hoverEffect rounded-xs cursor-pointer"
          >
            -
          </div>
          <p className="font-bold text-[11px] text-mbg-green">{quantity}</p>
          <div
            role="button"
            onClick={() => setQuantity(Math.min(quantity + 1, currentStock))}
            className="mbg-p-center bg-mbg-black/7 py-1 px-3 font-bold hover:bg-mbg-green hover:text-mbg-white hoverEffect rounded-xs cursor-pointer"
          >
            +
          </div>
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
            }, 800); // match animation duration
          }
        }}
      >
        {currentStock > 0 ? "Shoot" : "Empty stock"}
      </Button>
      {currentStock > 0 && currentStock <= 5 && (
        <p className="text-[10px] text-mbg-green uppercase tracking-wider font-medium mt-1">
          Only {currentStock} left
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
