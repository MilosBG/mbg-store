"use client";
import BasketBall from "@/components/mbg-components/BasketBall";
import Button from "@/components/mbg-components/Button";
import BasketBallAnimation from "@/components/mbg-components/BasketBallAnimation";
import useCart from "@/lib/hooks/useCart";
import React, { useEffect, useRef, useState } from "react";

const ProductInfo = ({ productInfo }: { productInfo: ProductType }) => {
  // Compute per-variant stock when variants exist
  const selectStock = (color?: string, size?: string) => {
    const vars = (productInfo as any)?.variants as Array<{ color?: string; size?: string; stock: number }> | undefined;
    if (Array.isArray(vars) && vars.length > 0) {
      const exact = vars.find(v => (v.color ?? '') === (color ?? '') && (v.size ?? '') === (size ?? ''));
      if (exact) return Number(exact.stock || 0);
      // If only one dimension matters
      if (color && !size) {
        const match = vars.find(v => (v.color ?? '') === color);
        return Number(match?.stock || 0);
      }
      if (size && !color) {
        const match = vars.find(v => (v.size ?? '') === size);
        return Number(match?.stock || 0);
      }
      return 0; // no match means not available
    }
    return Number((productInfo as any)?.countInStock ?? 0);
  };

  const [selectedColor, setSeclectedColor] = useState<string>(
    productInfo.colors[0]
  );
  const [selectedSize, setSeclectedSize] = useState<string>(
    productInfo.sizes[0]
  );
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
          {productInfo.title}
        </p>
        <BasketBall product={productInfo} />
      </div>
      <p className="font-bold text-lg text-mbg-green">€ {productInfo.price}</p>

      <div className="flex gap-2 border-b border-t py-2 border-mbg-green ">
        <p className="uppercase text-[11px] font-semibold">Category</p>
        <p className="uppercase text-[11px] font-semibold text-mbg-green">
          {productInfo.category}
        </p>
      </div>
      <div className="flex flex-col gap-2 ">
        <p className="uppercase text-[11px] font-semibold">Description</p>
        <p className="uppercase text-[11px] font-semibold text-mbg-green">
          {productInfo.description}
        </p>
      </div>
      {productInfo.colors.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="uppercase text-[11px] font-semibold">Colors</p>
          <div className="flex gap-2">
            {productInfo.colors.map((color, index) => (
              <p
                key={index}
                onClick={() => setSeclectedColor(color)}
                className={`cursor-pointer border border-mbg-black px-2 py-0.5 rounded-xs text-[10px] uppercase text-mbg-black font-semibold ${
                  selectedColor === color &&
                  "bg-mbg-black text-mbg-green font-semibold"
                }`}
              >
                {color}
              </p>
            ))}
          </div>
        </div>
      )}
      {productInfo.sizes.length > 0 && (
        <div className="flex flex-col gap-2">
          <p className="uppercase text-[11px] font-semibold">Sizes</p>
          <div className="flex gap-2">
            {productInfo.sizes.map((size, index) => (
              <p
                key={index}
                onClick={() => setSeclectedSize(size)}
                className={`cursor-pointer border border-mbg-black px-2 py-0.5 rounded-xs text-[10px] uppercase text-mbg-black font-semibold ${
                  selectedSize === size &&
                  "bg-mbg-black text-mbg-green font-semibold"
                }`}
              >
                {size}
              </p>
            ))}
          </div>
        </div>
      )}

      <p className="text-[11px] uppercase font-semibold">
        {currentStock > 0 ? (
          <span className="text-mbg-green">In stock: {currentStock}</span>
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
          item: productInfo,
          quantity,
          color: selectedColor,
          size: selectedSize,
        });
      }, 800); // match animation duration
    }
  }}
      >
        {currentStock > 0 ? "Shoot" : "Out of stock"}
      </Button>
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
