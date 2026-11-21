import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MoveLeft } from "lucide-react";

import { GrindUntilAchieve } from "@/images";

/**
 * Shared 404 UI for route-level 404s and the global 404.
 * Global styles are loaded by app/global-not-found.tsx when no root layout matches.
 */
export default function NotFound() {
  return (
    <main
      className="relative isolate flex min-h-[100svh] w-full items-center justify-center overflow-hidden bg-[#050505] px-4 py-8 text-center text-white sm:px-6 sm:py-12"
      style={{ backgroundColor: "#050505", color: "#ffffff", minHeight: "100svh" }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-50 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:42px_42px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/3 h-[22rem] w-[22rem] -translate-x-1/2 rounded-full bg-[#00821A]/20 blur-[105px] sm:h-[30rem] sm:w-[30rem]"
      />
      <section
        className="relative z-10 mx-auto flex w-full max-w-[900px] flex-col items-center border border-white/10 bg-black/70 px-5 py-7 shadow-[0_24px_90px_rgba(0,0,0,0.55)] backdrop-blur-md sm:px-10 sm:py-10 lg:px-14 lg:py-12"
        style={{ maxWidth: 900, width: "100%", marginInline: "auto", textAlign: "center" }}
      >
        <p className="mb-5 inline-flex items-center gap-2 border border-[#00821A]/40 bg-[#00821A]/10 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.24em] text-[#86ca93] sm:mb-7">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-[#00821A]" />
          OUT OF BOUNDS / 404
        </p>

        <div className="relative flex w-full items-center justify-center py-1" style={{ width: "100%", display: "flex", justifyContent: "center" }}>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute h-40 w-40 rounded-full border border-white/10 sm:h-64 sm:w-64"
          />
          <Image
            src={GrindUntilAchieve}
            alt="Grind Until Achieve — Milos BG"
            priority
            sizes="(max-width: 640px) 176px, (max-width: 1024px) 240px, 280px"
            className="relative z-10 h-auto w-44 max-w-full object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.45)] sm:w-60 lg:w-70"
            style={{ width: "min(52vw, 280px)", maxWidth: "100%", height: "auto", objectFit: "contain" }}
          />
        </div>

        <div aria-hidden="true" className="my-6 h-px w-14 bg-[#00821A] sm:my-8" />
        <h1 className="text-[clamp(1.85rem,6.5vw,3.85rem)] font-black uppercase leading-[1.02] tracking-[-0.045em] text-white">
          MISSED THE <span className="text-[#00821A]">SHOT.</span>
        </h1>
        <p className="mt-4 max-w-xl text-[13px] leading-6 text-white/75 sm:text-[15px] sm:leading-7">
          This page has moved, disappeared, or never existed. Keep your focus — the journey continues.
        </p>
        <p className="mt-2 max-w-xl text-[12px] leading-6 text-white/50 sm:text-[13px]">
          Cette page n’existe pas ou n’est plus disponible. Continuez à avancer.
        </p>

        <div className="mt-7 flex w-full max-w-md flex-col items-stretch justify-center gap-3 sm:mt-9 sm:flex-row">
          <Link
            href="/"
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 border border-[#00821A] bg-[#00821A] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.13em] text-white transition-colors hover:border-white hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            <MoveLeft aria-hidden="true" className="h-4 w-4" /> Back home
          </Link>
          <Link
            href="/products"
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 border border-white/20 bg-white/5 px-5 py-3 text-[11px] font-bold uppercase tracking-[0.13em] text-white transition-colors hover:border-[#00821A] hover:text-[#86ca93] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00821A]"
          >
            All outfits <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-8 flex w-full flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-[9px] font-semibold uppercase tracking-[0.18em] text-white/45 sm:mt-10">
          <span>MILOS BG</span>
          <span className="text-[#00821A]">✿</span>
          <span>GRIND UNTIL ACHIEVE</span>
        </div>
      </section>
    </main>
  );
}
