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
  .mbg404, .mbg404 * { box-sizing: border-box; }
  .mbg404 {
    --mbg-green: #00821A;
    --mbg-green-light: #8BDA99;
    position: relative; isolation: isolate;
    display: flex; align-items: center; justify-content: center;
    width: 100%; min-height: 100vh; min-height: 100svh;
    margin: 0; padding: clamp(20px, 5vw, 64px);
    overflow: hidden;
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
    width: min(100%, 870px);
    padding: clamp(28px, 4.6vw, 54px) clamp(22px, 4.8vw, 58px);
    border: 1px solid rgba(255,255,255,.12);
    background: linear-gradient(150deg, rgba(24,24,24,.90), rgba(7,7,7,.94) 65%);
    box-shadow: 0 32px 100px rgba(0,0,0,.55), inset 0 1px rgba(255,255,255,.05);
  }
  .mbg404__card::before {
    content: ""; position: absolute; top: 0; left: 50%; transform: translateX(-50%);
    width: min(42%, 230px); height: 2px; background: var(--mbg-green);
    box-shadow: 0 0 20px rgba(0,130,26,.65);
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
    .mbg404 { padding: 16px; }
    .mbg404__card { padding: 28px 20px; }
    .mbg404__image { width: min(46vw, 190px) !important; min-width: 130px; }
    .mbg404__heading { font-size: clamp(30px, 8vw, 43px); }
    .mbg404__actions { gap: 9px; margin-top: 24px; }
    .mbg404__link { flex-basis: 100%; min-height: 46px; }
    .mbg404__footer { margin-top: 24px; font-size: 9px; gap: 9px; }
  }
  @media (prefers-reduced-motion: reduce) {
    .mbg404__link { transition: none; }
  }
`;

export default function NotFound() {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: notFoundStyles }} />
      <main className="mbg404" style={{ minHeight: "100svh", background: "#050505", color: "#fff" }}>
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
            This page has moved, disappeared, or never existed. Keep your focus — the journey continues.
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
