"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, ChevronLeft, ChevronRight, Copy, X } from "lucide-react";

import type { HeaderBannerItem } from "@/lib/header-announcements";

type Props = {
  items: HeaderBannerItem[];
  customerName?: string | null;
};

const CLOSE_KEY = "mbg-header-announcements-closed";

export default function HeaderAnnouncementBar({ items, customerName }: Props) {
  const search = useSearchParams();
  const isFr = search.get("lang") === "fr";
  const [closed, setClosed] = useState(true); // Avoid a flash after session dismissal.
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try { setClosed(sessionStorage.getItem(CLOSE_KEY) === "1"); }
    catch { setClosed(false); }
  }, []);

  useEffect(() => {
    if (items.length <= 1 || paused || closed) return;
    if (typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const intervalId = window.setInterval(() => {
      setIndex((previous) => (previous + 1) % items.length);
      setCopied(false);
    }, 6500);
    return () => window.clearInterval(intervalId);
  }, [items.length, paused, closed]);

  if (closed || items.length === 0) return null;

  const item = items[index % items.length];
  const name = customerName?.trim().slice(0, 70) || "";

  function move(delta: number) {
    setIndex((previous) => (previous + delta + items.length) % items.length);
    setCopied(false);
  }

  async function copyPromo(code: string) {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch { setCopied(false); }
  }

  function dismiss() {
    setClosed(true);
    try { sessionStorage.setItem(CLOSE_KEY, "1"); } catch { /* private browsing */ }
  }

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
      className="relative w-full border-t border-white/10 bg-black/70 text-[#BFBFBF] backdrop-blur-sm"
    >
      <div className="mx-auto flex min-h-9 w-full max-w-[1600px] items-center gap-1 px-2 sm:gap-2 sm:px-5">
        {items.length > 1 ? (
          <button type="button" onClick={() => move(-1)}
            aria-label={isFr ? "Annonce précédente" : "Previous announcement"}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-[#BFBFBF] hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00821A]">
            <ChevronLeft size={14} />
          </button>
        ) : <span className="w-1 shrink-0" aria-hidden="true" />}

        <div className="min-w-0 flex-1 overflow-x-auto text-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <div className="inline-flex min-h-9 min-w-max items-center justify-center gap-1 whitespace-nowrap px-1 text-[10px] font-semibold tracking-[0.025em] sm:text-xs">
            {item.kind === "promotion" ? (
              <>
                <span>{isFr ? "Utilise ton code" : "Use your code"}</span>
                <button type="button" onClick={() => void copyPromo(item.code)}
                  title={isFr ? "Copier le code promotionnel" : "Copy promotion code"}
                  aria-label={isFr ? `Copier le code ${item.code}` : `Copy code ${item.code}`}
                  className="inline-flex items-center gap-1 rounded-sm border-b border-dotted border-white/45 text-[11px] font-black text-[#FFFFFF] transition hover:border-[#00821A] hover:text-[#FFFFFF] sm:text-xs">
                  <span>{item.code}</span>
                  {copied ? <Check size={11} /> : <Copy size={11} />}
                </button>
                {name && (
                  <span className="font-black text-[#00821A]">{", "}{name}</span>
                )}
                {item.minSubtotalCents > 0 && (
                  <span className="ml-1 text-[#BFBFBF]/85">
                    {"· "}{isFr ? "dès" : "from"}{" "}
                    {(item.minSubtotalCents / 100).toLocaleString(isFr ? "fr-FR" : "en-GB", { style: "currency", currency: "EUR" })}
                    {isFr ? " d’achat" : " order"}
                  </span>
                )}
                {copied && <span className="sr-only" role="status">{isFr ? "Code copié" : "Code copied"}</span>}
              </>
            ) : (
              <span>{isFr ? (item.textFr || item.textEn) : (item.textEn || item.textFr)}</span>
            )}
          </div>
        </div>

        {items.length > 1 && (
          <button type="button" onClick={() => move(1)}
            aria-label={isFr ? "Annonce suivante" : "Next announcement"}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-[#BFBFBF] hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00821A]">
            <ChevronRight size={14} />
          </button>
        )}
        <button type="button" onClick={dismiss}
          aria-label={isFr ? "Fermer la banderole" : "Dismiss announcements"}
          className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-sm text-[#BFBFBF] hover:bg-white/10 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#00821A]">
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
