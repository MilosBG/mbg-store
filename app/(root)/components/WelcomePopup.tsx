"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { GrindUntilAchieve } from "@/images";
import type { WelcomePublic } from "@/lib/welcome";

type Props = { config: WelcomePublic | null; lang: "en" | "fr" };
export default function WelcomePopup({ config, lang }: Props) {
  const [shown, setShown] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const key = `mbg-welcome-dismissed-${config?.revision || "v1"}`;
  useEffect(() => {
    if (!config?.enabled) return;
    try { if (window.sessionStorage.getItem(key)) return; } catch { /* sessionStorage may be unavailable */ }
    const id = window.setTimeout(() => { previousFocus.current = document.activeElement as HTMLElement; setShown(true); }, config.delayMs);
    return () => window.clearTimeout(id);
  }, [config?.delayMs, config?.enabled, key]);
  useEffect(() => {
    if (!shown) return;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") dismiss();
      if (event.key === "Tab") {
        const modal = document.getElementById("mbg-welcome-dialog");
        const controls = modal?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])');
        if (!controls?.length) return;
        const first=controls[0],last=controls[controls.length-1];
        if (event.shiftKey && document.activeElement === first) {event.preventDefault();last.focus();}
        else if (!event.shiftKey && document.activeElement === last) {event.preventDefault();first.focus();}
      }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = old; document.removeEventListener("keydown", onKey); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shown]);
  function dismiss() {
    setShown(false);
    try {window.sessionStorage.setItem(key,"1");} catch { /* storage disabled */ }
    window.setTimeout(()=>previousFocus.current?.focus(),0);
  }
  if (!config || !shown) return null;
  const isFr = lang === "fr";
  const title = isFr ? config.titleFr || config.titleEn : config.titleEn;
  const message = isFr ? config.messageFr || config.messageEn : config.messageEn;
  const offer = isFr ? config.promoFr || config.promoEn : config.promoEn;
  const cta = isFr ? config.ctaLabelFr || config.ctaLabelEn : config.ctaLabelEn;
  const socials = [
    { label: "INSTAGRAM", href: config.instagram },
    { label: "YOUTUBE", href: config.youtube },
    { label: "THREADS", href: config.threads },
  ].filter(x => x.href);
  return <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-3 py-6 backdrop-blur-sm" onMouseDown={(e)=>{if(e.currentTarget===e.target)dismiss();}}>
    <section id="mbg-welcome-dialog" role="dialog" aria-modal="true" aria-labelledby="mbg-welcome-title" aria-describedby="mbg-welcome-body" className="relative max-h-[90vh] w-full max-w-[560px] overflow-y-auto rounded-sm border border-white/30 bg-[#F7F7F7] p-5 shadow-2xl sm:p-9">
      <button ref={closeRef} type="button" onClick={dismiss} aria-label={isFr?"Fermer la fenêtre de bienvenue":"Close welcome popup"} className="absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-sm border border-black/20 text-lg font-bold text-black hover:bg-black hover:text-white">×</button>
      <div className="mb-5 flex min-h-32 items-center justify-center overflow-hidden rounded-sm bg-black px-4 py-6 sm:min-h-40">
        <Image
          src={GrindUntilAchieve}
          alt="Grind Until Achieve — Milos BG"
          priority
          className="max-h-28 w-auto max-w-[85%] object-contain sm:max-h-36"
        />
      </div>
      <p className="mb-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#00821A]">FIVE CHAPTERS. ONE JOURNEY.</p>
      <h2 id="mbg-welcome-title" className="max-w-[440px] pr-9 text-2xl font-black uppercase leading-tight tracking-tight text-black sm:text-4xl">{title}</h2>
      <p id="mbg-welcome-body" className="mt-4 whitespace-pre-line text-sm leading-6 text-[#404040]">{message}</p>
      {(offer || config.promoCode) && <div className="mt-6 border-l-2 border-[#00821A] bg-white p-4"><p className="text-[10px] font-black uppercase tracking-[0.13em] text-[#00821A]">{isFr?"OFFRE & ACTUALITÉS":"OFFER & NEWS"}</p>{offer&&<p className="mt-1 whitespace-pre-line text-sm font-medium text-black">{offer}</p>}{config.promoCode&&<div className="mt-3 flex flex-wrap items-center justify-between gap-2"><code className="border border-dashed border-[#00821A] bg-white px-3 py-2 text-sm font-bold tracking-widest">{config.promoCode}</code><button type="button" onClick={()=>{void navigator.clipboard?.writeText(config.promoCode);}} className="min-h-10 rounded-sm bg-black px-4 text-[10px] font-black uppercase text-white">{isFr?"COPIER":"COPY CODE"}</button></div>}</div>}
      {socials.length>0&&<div className="mt-6"><p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#404040]">{isFr?"RETROUVE-NOUS SUR":"FOLLOW THE JOURNEY"}</p><div className="mt-3 flex flex-wrap gap-2">{socials.map(x=><a key={x.label} href={x.href} target="_blank" rel="noopener noreferrer" className="rounded-sm border border-black px-3 py-2 text-[10px] font-bold uppercase text-black hover:border-[#00821A] hover:text-[#00821A]">{x.label}</a>)}</div></div>}
      <Link onClick={dismiss} href={config.ctaHref} className="mt-7 flex min-h-12 items-center justify-center rounded-sm bg-[#00821A] px-4 py-3 text-center text-xs font-black uppercase tracking-[0.12em] text-white hover:bg-black">{cta||"DISCOVER"}</Link>
      <button type="button" onClick={dismiss} className="mt-3 w-full min-h-10 text-[11px] font-bold uppercase text-[#404040] hover:text-black">{isFr?"CONTINUER SANS OFFRE":"CONTINUE EXPLORING"}</button>
    </section>
  </div>;
}
