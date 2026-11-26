import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MoveLeft } from "lucide-react";

import { GrindUntilAchieve } from "@/images";

/**
 * Shared route-level and global 404. The critical styles are deliberately
 * self-contained: the global 404 can render without the normal root layout,
 * and some Next.js 15 deployments omit the regular Tailwind CSS for that route.
 * None of the page's layout depends on Tailwind being injected.
 */
const notFoundStyles = `
  /* Reset only when the 404 view is mounted; other routes are unaffected. */
  html:has(.mbg404), body:has(.mbg404) {
    box-sizing: border-box !important;
    width: 100% !important;
    height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
    border: 0 !important;
    overflow: hidden !important;
    background: #050505 !important;
    overscroll-behavior: none;
  }
  .mbg404, .mbg404 * { box-sizing: border-box; }
  .mbg404 * { min-width: 0; }
  .mbg404 {
    --mbg-green: #00821A;
    --mbg-green-light: #8BDA99;
    position: fixed; inset: 0; z-index: 9999; isolation: isolate;
    display: flex; align-items: center; justify-content: center;
    width: 100vw; height: 100vh; height: 100dvh;
    min-height: 0; max-height: 100dvh;
    margin: 0; padding: clamp(12px, 3vw, 36px);
    border: 0; outline: 0; overflow: hidden;
    overscroll-behavior: none;
    background: #050505; color: #ffffff;
    font-family: Kanit, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    -webkit-font-smoothing: antialiased;
    text-align: center;
  }
  .mbg404::before {
    content: ""; position: absolute; inset: 0; z-index: -2; pointer-events: none;
    background:
      radial-gradient(ellipse 48% 48% at 50% 40%, rgba(0,130,26,.19), transparent 79%),
      radial-gradient(ellipse 38% 50% at 15% 85%, rgba(0,130,26,.09), transparent 82%),
      linear-gradient(180deg, #080808 0%, #020202 100%);
  }
  .mbg404::after {
    content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none;
    background-image:
      linear-gradient(rgba(255,255,255,.023) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,.023) 1px, transparent 1px);
    background-size: 44px 44px;
    mask-image: linear-gradient(to bottom, transparent 1%, black 35%, black 66%, transparent 99%);
  }
  .mbg404__card {
    position: relative; display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    width: min(100%, 870px); max-height: 100%;
    padding: clamp(18px, 3vw, 44px) clamp(12px, 4vw, 48px);
    border: 0; outline: 0;
    background: transparent; box-shadow: none;
  }
  .mbg404__label {
    display: inline-flex; align-items: center; justify-content: center; gap: 9px;
    padding: 9px 13px; border: 1px solid rgba(0,130,26,.40);
    background: rgba(0,130,26,.08);
    color: var(--mbg-green-light); font-size: 10px; font-weight: 700;
    line-height: 1.4; letter-spacing: .2em; text-transform: uppercase;
  }
  .mbg404__dot { width: 6px; height: 6px; background: var(--mbg-green); border-radius: 50%; }
  .mbg404__art {
    position: relative; display: flex; align-items: center; justify-content: center;
    width: 100%; margin: clamp(15px, 3vw, 26px) 0 8px;
  }
  .mbg404__art::before {
    content: ""; position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
    width: min(72vw, 360px); height: min(72vw, 360px); border-radius: 50%;
    background: radial-gradient(circle, rgba(0,130,26,.18), rgba(0,130,26,.045) 49%, transparent 72%);
    pointer-events: none;
  }
  .mbg404__image {
    position: relative; display: block;
    width: min(43vw, 245px) !important;
    min-width: 136px; max-width: 100%; height: auto !important;
    object-fit: contain;
    filter: drop-shadow(0 15px 34px rgba(0,0,0,.4));
  }
  .mbg404__rule { width: 56px; height: 2px; margin: 21px 0 17px; background: var(--mbg-green); }
  .mbg404__heading {
    margin: 0; color: #fff;
    font-size: clamp(30px, 5.5vw, 60px); font-weight: 900;
    letter-spacing: -.045em; line-height: 1.04; text-transform: uppercase;
  }
  .mbg404__heading span { color: var(--mbg-green-light); }
  .mbg404__lead, .mbg404__translation {
    width: min(100%, 570px); margin: 16px 0 0;
    color: rgba(255,255,255,.76); font-size: clamp(13px, 1.3vw, 15px);
    line-height: 1.75; font-weight: 400;
  }
  .mbg404__translation { margin-top: 5px; color: rgba(255,255,255,.52); font-size: 13px; }
  .mbg404__actions {
    display: flex; flex-wrap: wrap; align-items: stretch;
    justify-content: center; gap: 12px; width: 100%; max-width: 430px;
    margin: 28px 0 0;
  }
  .mbg404__link {
    display: inline-flex; flex: 1 1 185px; align-items: center; justify-content: center; gap: 9px;
    min-height: 48px; padding: 13px 18px; border: 1px solid rgba(255,255,255,.28);
    color: #fff; background: rgba(255,255,255,.025); text-decoration: none;
    font-family: inherit; font-size: 11px; font-weight: 800; letter-spacing: .1em;
    line-height: 1.3; text-transform: uppercase;
    transition: color .2s, background-color .2s, border-color .2s;
  }
  .mbg404__link--primary { border-color: var(--mbg-green); background: var(--mbg-green); }
  .mbg404__link:hover { border-color: var(--mbg-green); background: rgba(0,130,26,.22); color: #fff; }
  .mbg404__link--primary:hover { background: #fff; color: #050505; border-color: #fff; }
  .mbg404__link:focus-visible { outline: 2px solid var(--mbg-green-light); outline-offset: 4px; }
  .mbg404__footer {
    display: flex; flex-wrap: wrap; align-items: center; justify-content: center;
    gap: 12px; width: 100%; margin: 28px 0 0; padding-top: 17px;
    border-top: 1px solid rgba(255,255,255,.11);
    color: rgba(255,255,255,.48); font-size: 10px; font-weight: 700;
    letter-spacing: .14em; line-height: 1.5; text-transform: uppercase;
  }
  .mbg404__flower { color: var(--mbg-green-light); font-size: 15px; }
  @media (max-width: 560px) {
    .mbg404 { padding: 10px; }
    .mbg404__card { padding: 16px 8px; }
    .mbg404__image { width: min(46vw, 190px) !important; min-width: 130px; }
    .mbg404__heading { font-size: clamp(30px, 8vw, 43px); }
    .mbg404__actions { gap: 9px; margin-top: 24px; }
    .mbg404__link { flex-basis: 100%; min-height: 46px; }
    .mbg404__footer { margin-top: 24px; font-size: 9px; gap: 9px; }
  }
  /* Keep every action reachable on short phones and landscape viewports. */
  @media (max-height: 720px) {
    .mbg404 { padding: 8px; }
    .mbg404__card { padding: 10px 8px; }
    .mbg404__label { padding: 5px 9px; font-size: 9px; }
    .mbg404__art { margin: 8px 0 3px; }
    .mbg404__image { width: min(24vh, 155px) !important; min-width: 0; }
    .mbg404__rule { margin: 8px 0 9px; }
    .mbg404__heading { font-size: clamp(25px, 4.2vw, 40px); }
    .mbg404__lead { margin-top: 8px; font-size: 12px; line-height: 1.45; }
    .mbg404__translation { margin-top: 4px; font-size: 11px; line-height: 1.4; }
    .mbg404__actions { margin-top: 14px; gap: 8px; }
    .mbg404__link { min-height: 40px; padding: 10px 13px; }
    .mbg404__footer { margin-top: 13px; padding-top: 9px; }
  }
  @media (max-height: 520px) {
    .mbg404__image { width: min(19vh, 90px) !important; }
    .mbg404__art { margin: 4px 0 0; }
    .mbg404__heading { font-size: clamp(23px, 4vw, 33px); }
    .mbg404__lead { margin-top: 5px; font-size: 11px; line-height: 1.32; }
    .mbg404__translation { margin-top: 2px; font-size: 10px; line-height: 1.25; }
    .mbg404__actions { margin-top: 8px; }
    .mbg404__link { min-height: 34px; padding: 7px 10px; }
    .mbg404__footer { margin-top: 7px; padding-top: 6px; font-size: 9px; }
  }
  @media (max-width: 560px) and (max-height: 620px) {
    .mbg404__actions { gap: 6px; }
    .mbg404__link { flex-basis: calc(50% - 6px); min-width: 0; padding: 6px 5px; font-size: 9px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .mbg404__link { transition: none; }
  }
`;

export default function NotFound() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: notFoundStyles }} />
      <main className="mbg404" style={{ background: "#050505", color: "#fff" }}>
        <section className="mbg404__card" aria-labelledby="mbg404-heading">
          <p className="mbg404__label">
            <span aria-hidden="true" className="mbg404__dot" />
            OUT OF BOUNDS / 404
          </p>

          <div className="mbg404__art">
            <Image
              src={GrindUntilAchieve}
              alt="Grind Until Achieve — Milos BG"
              priority
              sizes="(max-width: 560px) 190px, 245px"
              className="mbg404__image"
              style={{ width: "min(43vw, 245px)", height: "auto", maxWidth: "100%" }}
            />
          </div>

          <div className="mbg404__rule" aria-hidden="true" />
          <h1 id="mbg404-heading" className="mbg404__heading">
            MISSED THE <span>SHOT.</span>
          </h1>
          <p className="mbg404__lead">
            This page has moved, disappeared, or never existed. Keep your focus, the journey continues.
          </p>
          <p className="mbg404__translation">
            Cette page n’existe pas ou n’est plus disponible. Continuez à avancer.
          </p>

          <nav className="mbg404__actions" aria-label="Continue browsing Milos BG">
            <Link href="/" className="mbg404__link mbg404__link--primary">
              <MoveLeft aria-hidden="true" size={16} /> Back home
            </Link>
            <Link href="/products" className="mbg404__link">
              All outfits <ArrowUpRight aria-hidden="true" size={16} />
            </Link>
          </nav>

          <div className="mbg404__footer">
            <span>MILOS BG</span>
            <span className="mbg404__flower" aria-hidden="true">✿</span>
            <span>GRIND UNTIL ACHIEVE</span>
          </div>
        </section>
      </main>
    </>
  );
}
