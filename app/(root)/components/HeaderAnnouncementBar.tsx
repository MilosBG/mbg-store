"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Copy } from "lucide-react";
import type { HeaderBannerItem } from "@/lib/header-announcements";
import styles from "./HeaderAnnouncementBar.module.css";

type Props = {
  items: HeaderBannerItem[];
  customerName?: string | null;
};

type CopyStatus = "idle" | "copied" | "failed";

/**
 * Clipboard fallback for some mobile WebViews and versions of Safari.
 * Must be called directly from a click handler (user activation).
 */
async function copyCode(code: string): Promise<boolean> {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(code);
      return true;
    } catch {
      // Continue with the fallback below.
    }
  }

  const temporary = document.createElement("textarea");
  temporary.value = code;
  temporary.setAttribute("readonly", "");
  temporary.style.position = "fixed";
  temporary.style.top = "0";
  temporary.style.left = "0";
  temporary.style.width = "1px";
  temporary.style.opacity = "0";
  document.body.appendChild(temporary);
  temporary.focus();
  temporary.select();
  temporary.setSelectionRange(0, temporary.value.length);
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch {
    copied = false;
  } finally {
    temporary.remove();
  }
  return copied;
}

/** Visible while mbg-admin returns at least one active announcement. */
export default function HeaderAnnouncementBar({ items, customerName }: Props) {
  const search = useSearchParams();
  const isFr = search.get("lang") === "fr";
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>("idle");
  const total = items.length;
  const multiple = total > 1;

  useEffect(() => {
    if (!multiple || paused) return;
    if (typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const intervalId = window.setInterval(() => {
      setIndex((previous) => (previous + 1) % total);
      setCopyStatus("idle");
    }, 6500);
    return () => window.clearInterval(intervalId);
  }, [total, multiple, paused]);

  if (total === 0) return null;

  const item = items[index % total];
  const name = customerName?.trim().slice(0, 70) || "";

  function move(delta: number) {
    setIndex((previous) => (previous + delta + total) % total);
    setCopyStatus("idle");
  }

  async function copyPromo(code: string) {
    const success = await copyCode(code);
    setCopyStatus(success ? "copied" : "failed");
  }

  const navClass = "flex h-8 w-8 shrink-0 items-center justify-center rounded-sm text-[#BFBFBF] transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00821A]";

  return (
    <div
      data-mbg-header-banner="true"
      role="region"
      aria-label={isFr ? "Annonces Milos BG" : "Milos BG announcements"}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false);
      }}
      className={`relative w-full border-t border-white/50 bg-black/50 text-[#BFBFBF] backdrop-blur-sm ${styles.shimmerBar}`}
    >
      <div className="relative z-10 mx-auto flex min-h-10 w-full max-w-[1600px] items-center gap-1 px-2 sm:gap-2 sm:px-5">
        {multiple ? (
          <button type="button" className={navClass} onClick={() => move(-1)}
            aria-label={isFr ? "Annonce précédente" : "Previous announcement"}>
            <ChevronLeft size={15} aria-hidden="true" />
          </button>
        ) : <span className="w-1 shrink-0" aria-hidden="true" />}

        <div className="min-w-0 flex-1 overflow-x-auto text-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="inline-flex min-h-10 min-w-max items-center justify-center gap-1 whitespace-nowrap px-1 text-[10px] font-semibold tracking-[0.025em] sm:text-xs">
            {item.kind === "promotion" ? (
              <>
                <span>{isFr ? "Utilise ton code" : "Use your code"}</span>
                <button
                  type="button"
                  onClick={() => void copyPromo(item.code)}
                  title={isFr ? "Copier le code promotionnel" : "Copy promotion code"}
                  aria-label={isFr ? `Copier le code ${item.code}` : `Copy code ${item.code}`}
                  className="inline-flex min-h-8 items-center gap-1 rounded-sm border-b border-dotted border-white/45 px-1 text-[11px] font-black text-[#FFFFFF] transition-colors hover:border-[#00821A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00821A] sm:text-xs"
                >
                  <span>{item.code}</span>
                  {copyStatus === "copied" ? <Check size={12} aria-hidden="true" /> : <Copy size={12} aria-hidden="true" />}
                </button>
                {name && <span className="font-black text-[#00821A]">{", "}{name}</span>}
                {copyStatus === "copied" && (
                  <span role="status" className="ml-1 text-[10px] font-medium text-[#00821A]">
                    {isFr ? "Copié !" : "Copied!"}
                  </span>
                )}
                {copyStatus === "failed" && (
                  <span role="status" className="ml-1 text-[10px] font-medium text-white">
                    {isFr ? "Sélectionne le code pour le copier" : "Select the code to copy it"}
                  </span>
                )}
              </>
            ) : (
              <span>{isFr ? (item.textFr || item.textEn) : (item.textEn || item.textFr)}</span>
            )}
          </div>
        </div>

        {multiple && (
          <button type="button" className={navClass} onClick={() => move(1)}
            aria-label={isFr ? "Annonce suivante" : "Next announcement"}>
            <ChevronRight size={15} aria-hidden="true" />
          </button>
        )}
      </div>
    </div>
  );
}
