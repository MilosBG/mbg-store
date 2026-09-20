"use client";

import React from "react";

const BADGE_ASSET_MAP: Record<string, string> = {
  ENCOURAGEMENT: "/grind/badges/milos-bg-badge-encouragement.svg",
  DONT_GIVE_UP: "/grind/badges/milos-bg-badge-dont-give-up.svg",
  EFFORT: "/grind/badges/milos-bg-badge-effort.svg",
  CHALLENGER: "/grind/badges/milos-bg-badge-challenger.svg",
  SHADOW_BREAKER: "/grind/badges/milos-bg-badge-shadow-breaker.svg",
  CONSISTENT: "/grind/badges/milos-bg-badge-consistent.svg",
  LOCKED_IN: "/grind/badges/milos-bg-badge-locked-in.svg",
};

type Props = {
  code: string;
  className?: string;
};

export function BadgeEmblem({ code, className = "" }: Props) {
  const normalized = code.toUpperCase();
  const src = BADGE_ASSET_MAP[normalized];

  if (src) {
    return (
      <img
        src={src}
        alt={normalized.replaceAll("_", " ")}
        className={className}
        draggable={false}
      />
    );
  }

  return (
    <div className={`flex items-center justify-center rounded-full border border-current/20 ${className}`} aria-hidden="true">
      <span className="text-[8px] font-black uppercase tracking-[0.12em]">MBG</span>
    </div>
  );
}
