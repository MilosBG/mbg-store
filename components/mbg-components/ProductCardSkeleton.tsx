import React from "react";

export default function ProductCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="
        flex
        w-full
        max-w-[280px]
        flex-col
        overflow-hidden
        rounded-md
        border
        border-mbg-black/[0.06]
        bg-mbg-white
        p-2
        shadow-sm
        animate-pulse
      "
    >
      {/* PRODUCT IMAGE */}
      <div
        className="
          relative
          mb-3
          overflow-hidden
          rounded-sm
          border
          border-mbg-black/[0.05]
          bg-mbg-black/[0.02]
          p-3
        "
      >
        <div
          className="
            aspect-[4/5]
            w-full
            rounded-xs
            bg-mbg-green/[0.07]
          "
        />
      </div>

      {/* PRODUCT INFORMATIONS */}
      <div className="flex flex-1 flex-col px-1">
        <div className="space-y-2">
          {/* Product name */}
          <div
            className="
              h-3
              w-[70%]
              rounded-full
              bg-mbg-black/[0.08]
            "
          />

          {/* Category / chapter */}
          <div
            className="
              h-2
              w-[42%]
              rounded-full
              bg-mbg-black/[0.05]
            "
          />
        </div>

        {/* PRICE + ACTION */}
        <div className="mt-5 flex items-center justify-between pb-1">
          <div
            className="
              h-3
              w-14
              rounded-full
              bg-mbg-black/[0.08]
            "
          />

          <div
            className="
              size-8
              rounded-full
              bg-mbg-green/[0.07]
            "
          />
        </div>
      </div>
    </div>
  );
}