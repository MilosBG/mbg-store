import Image from "next/image";
import Link from "next/link";
import { BiSolidBasketball } from "react-icons/bi";
import { ArrowUpRight } from "lucide-react";

import { GrindUntilAchieve } from "@/images";

export default function NotFound() {
  return (
    <main className="relative isolate flex min-h-[100svh] overflow-hidden bg-[#050505] px-4 py-8 text-white sm:px-6 sm:py-10 lg:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(0,130,26,0.18),transparent_28%),linear-gradient(to_right,rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.05)_1px,transparent_1px)] [background-size:auto,auto,32px_32px,32px_32px] opacity-80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[24rem] w-[24rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00821A]/12 blur-3xl sm:h-[30rem] sm:w-[30rem]"
      />

      <section className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-center">
        <div className="grid w-full items-center gap-8 overflow-hidden border border-white/10 bg-black/65 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-sm sm:gap-10 sm:p-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:p-12 xl:p-14">
          <div className="order-2 flex flex-col items-start lg:order-1">
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-[#77d488]">
              <BiSolidBasketball className="h-4 w-4" />
              OUT OF BOUNDS
            </div>

            <div className="mt-5 flex items-end gap-4">
              <span className="text-[clamp(4.6rem,16vw,10rem)] font-black leading-[0.75] tracking-[-0.09em] text-white">
                404
              </span>
              <span className="mb-2 hidden h-16 w-px bg-[#00821A] sm:block" />
            </div>

            <h1 className="mt-6 text-3xl font-black uppercase leading-[0.95] tracking-[-0.04em] sm:text-4xl xl:text-5xl">
              MISSED THE SHOT.
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-7 text-white/74 sm:text-[15px]">
              This page does not exist, has moved, or is no longer available. Keep moving — direction over speed.
            </p>
            <p className="mt-2 max-w-xl text-sm leading-7 text-white/55">
              Cette page n’existe pas, a été déplacée ou n’est plus disponible.
            </p>

            <div className="mt-7 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap">
              <Link
                href="/"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-sm bg-[#00821A] px-5 text-center text-[11px] font-black uppercase tracking-[0.16em] text-white transition hover:bg-white hover:text-black"
              >
                Back home
                <ArrowUpRight size={16} />
              </Link>
              <Link
                href="/products"
                className="inline-flex min-h-12 items-center justify-center rounded-sm border border-white/20 px-5 text-center text-[11px] font-black uppercase tracking-[0.16em] text-white transition hover:border-[#00821A] hover:text-[#77d488]"
              >
                All outfits
              </Link>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/10 pt-4 text-[10px] font-bold uppercase tracking-[0.18em] text-white/42">
              <span>MILOS BG</span>
              <span>GRIND UNTIL ACHIEVE</span>
            </div>
          </div>

          <div className="order-1 flex items-center justify-center lg:order-2">
            <div className="relative flex w-full max-w-[24rem] items-center justify-center sm:max-w-[28rem] lg:max-w-[32rem]">
              <div
                aria-hidden
                className="absolute inset-6 rounded-full border border-white/10 bg-white/[0.02] blur-2xl"
              />
              <Image
                src={GrindUntilAchieve}
                alt="Grind Until Achieve"
                priority
                className="relative z-10 h-auto w-full max-w-[18rem] object-contain drop-shadow-[0_18px_45px_rgba(0,0,0,0.65)] sm:max-w-[22rem] lg:max-w-[28rem]"
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
