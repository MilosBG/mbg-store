import Link from "next/link";
import { BiSolidBasketball } from "react-icons/bi";

export default function NotFound() {
  return (
    <main className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-mbg-black px-5 py-12 text-mbg-white">
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:34px_34px]" />
      <div aria-hidden className="absolute -left-24 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border-[28px] border-mbg-green/20" />

      <section className="relative z-10 w-full max-w-5xl border border-white/15 bg-black/70 p-6 backdrop-blur-sm sm:p-10 lg:p-12">
        <div className="grid items-end gap-8 lg:grid-cols-[1fr_auto]">
          <div>
            <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.32em] text-mbg-green">
              <BiSolidBasketball className="h-4 w-4" /> OUT OF BOUNDS
            </div>
            <div className="mt-5 flex items-end gap-4">
              <span className="text-[clamp(5rem,18vw,12rem)] font-black leading-[0.72] tracking-[-0.08em] text-mbg-white">404</span>
              <span className="mb-2 hidden h-16 w-px bg-mbg-green sm:block" />
            </div>
            <h1 className="mt-7 text-2xl font-black uppercase tracking-tight sm:text-4xl">MISSED THE SHOT.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-mbg-lightgrey">
              This page does not exist, has moved, or is no longer available. Keep moving — direction over speed.
            </p>
            <p className="mt-2 max-w-2xl text-xs leading-5 text-mbg-darkgrey">
              Cette page n’existe pas, a été déplacée ou n’est plus disponible.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:min-w-56">
            <Link href="/" className="rounded-sm bg-mbg-green px-5 py-3 text-center text-xs font-bold uppercase text-mbg-white transition hover:opacity-90">
              Back home
            </Link>
            <Link href="/products" className="rounded-sm border border-white/30 px-5 py-3 text-center text-xs font-bold uppercase text-mbg-white transition hover:border-mbg-green hover:text-mbg-green">
              All outfits
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4 text-[9px] font-bold uppercase tracking-[0.24em] text-mbg-darkgrey">
          <span>MILOS BG</span>
          <span>GRIND UNTIL ACHIEVE</span>
        </div>
      </section>
    </main>
  );
}
