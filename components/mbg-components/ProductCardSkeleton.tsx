import React from "react";

import styles from "./ProductCardSkeleton.module.css";

type SkeletonProps = {
  className?: string;
};

/** Placeholder décoratif réutilisable dans les écrans de chargement. */
export function SkeletonBlock({ className = "" }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`${styles.shimmer} ${className}`}
    />
  );
}

export default function ProductCardSkeleton({
  className = "",
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={`
        ${styles.shimmer}
        flex h-full w-full min-w-0 flex-col
        rounded-md border border-mbg-black/[0.06]
        bg-mbg-white p-2 shadow-sm
        ${className}
      `}
    >
      {/* Même proportion d'image que le squelette d'origine. */}
      <div className="mb-3 overflow-hidden rounded-sm border border-mbg-black/[0.05] bg-mbg-black/[0.02] p-3">
        <div className="aspect-[4/5] w-full rounded-xs bg-mbg-green/[0.07]" />
      </div>

      {/* Nom et catégorie. */}
      <div className="flex flex-1 flex-col px-1">
        <div className="space-y-2">
          <div className="h-3 w-[70%] rounded-full bg-mbg-black/[0.08]" />
          <div className="h-2 w-[42%] rounded-full bg-mbg-black/[0.05]" />
        </div>

        {/* Prix et action : dimensions réservées pendant le chargement. */}
        <div className="mt-auto flex items-center justify-between gap-3 pb-1 pt-5">
          <div className="h-3 w-14 max-w-[50%] rounded-full bg-mbg-black/[0.08]" />
          <div className="size-8 shrink-0 rounded-full bg-mbg-green/[0.07]" />
        </div>
      </div>
    </div>
  );
}
