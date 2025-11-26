import { NextResponse } from "next/server";

const OFFLINE_PATH_CANDIDATES = [
  "/storefront/offline",
  "/store/offline",
  "/maintenance/offline",
  "/offline",
  "/storefront/maintenance",
  "/store/maintenance",
];

const CACHE_HEADERS = {
  "Cache-Control": "no-store, max-age=0, must-revalidate",
  "Content-Type": "text/html; charset=utf-8",
};

const DEFAULT_OFFLINE_HTML =
  process.env.MBG_OFFLINE_HTML ??
  process.env.STORE_OFFLINE_HTML ??
  `
    <div class="bg-mbg-black flex flex-col mbg-p-center min-h-[50%] gap-6 py-12">
      <div class="animated-border mbg-p-center translate-y-20 p-7">
        <img src="/milos-bg-offline.svg" alt="Milos BG" width="180" height="180" loading="lazy" />
      </div>
      <div class="mbg-p-center p-7 translate-y-16 flex gap-1 text-3xl font-semibold uppercase tracking-[0.35em]">
        <span class="off">O</span>
        <span class="off">F</span>
        <span class="off">F</span>
        <span class="off">L</span>
        <span class="off">I</span>
        <span class="off">N</span>
        <span class="off">E</span>
      </div>
      <div class="text-center translate-y-10 text-xs text-mbg-green/70 px-8 max-w-md mbg-p-center">
        <p>We are refreshing the store right now. Please check back soon.</p>
      </div>
      <div class="mbg-p-center translate-y-10 p-7 flex items-center justify-center gap-4">
        <a class="social-media" href="https://www.instagram.com/m.i.l.o.s.bg/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
          <svg stroke="currentColor" fill="currentColor" stroke-width="0" version="1.2" baseProfile="tiny" viewBox="0 0 24 24" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M18 3h-12c-1.7 0-3 1.3-3 3v12c0 1.7 1.3 3 3 3h12c1.7 0 3-1.3 3-3v-12c0-1.7-1.3-3-3-3zm-6 6c1.7 0 3 1.3 3 3s-1.3 3-3 3-3-1.3-3-3 1.3-3 3-3zm3.8-2c0-.7.6-1.2 1.2-1.2s1.2.6 1.2 1.2-.5 1.2-1.2 1.2-1.2-.5-1.2-1.2zm2.2 12h-12c-.6 0-1-.4-1-1v-6h2c0 2.8 2.2 5 5 5s5-2.2 5-5h2v6c0 .6-.4 1-1 1z"></path></svg>
        </a>
        <a class="social-media" href="https://www.youtube.com/@milos-bg" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
          <svg stroke="currentColor" fill="currentColor" stroke-width="0" version="1.2" baseProfile="tiny" viewBox="0 0 24 24" height="16" width="16" xmlns="http://www.w3.org/2000/svg"><path d="M22.8 8.6c-.2-1.5-.4-2.6-1-3-.6-.5-5.8-.6-9.8-.6s-9.2.1-9.8.6c-.6.4-.8 1.5-1 3s-.2 2.4-.2 3.4 0 1.9.2 3.4.4 2.6 1 3c.6.5 5.8.6 9.8.6 4 0 9.2-.1 9.8-.6.6-.4.8-1.5 1-3s.2-2.4.2-3.4 0-1.9-.2-3.4zm-12.8 7v-7.2l6 3.6-6 3.6z"></path></svg>
        </a>
      </div>
    </div>
    <div class="h-[500px] mbg-p-center" >
      <img class="-translate-y-20" src="/Grinder.png" alt="Milos BG" width="700" height="700" loading="lazy" />
    </div>
  `.trim();

export async function GET() {
  const envHtml = process.env.MBG_OFFLINE_HTML ?? process.env.STORE_OFFLINE_HTML;
  if (envHtml) {
    return new NextResponse(envHtml, { headers: CACHE_HEADERS });
  }

  const baseUrls = resolveBaseUrls();

  for (const base of baseUrls) {
    const candidates = buildCandidateUrls(base, OFFLINE_PATH_CANDIDATES);

    for (const url of candidates) {
      try {
        const res = await fetch(url, {
          cache: "no-store",
          // Avoid following redirects to prevent infinite redirect loops (e.g. auth/login redirects).
          redirect: "manual",
          headers: { Accept: "text/html, text/plain" },
        });

        if (!res.ok) {
          continue;
        }

        const contentType = res.headers.get("content-type")?.toLowerCase() ?? "";
        if (!contentType.includes("text/html") && !contentType.includes("text/plain")) {
          continue;
        }

        const html = await res.text();
        if (html.trim()) {
          return new NextResponse(html, { headers: CACHE_HEADERS });
        }
      } catch (error) {
        console.error("Failed to fetch maintenance offline page candidate", url, error);
      }
    }
  }

  return new NextResponse(DEFAULT_OFFLINE_HTML, { headers: CACHE_HEADERS });
}

function resolveBaseUrls(): string[] {
  const candidates = [
    process.env.ADMIN_BASE_URL,
    process.env.NEXT_PUBLIC_ADMIN_API,
    process.env.NEXT_PUBLIC_API_URL,
    process.env.ADMIN_API_URL,
    process.env.API_BASE_URL,
  ];

  return candidates
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value));
}

function buildCandidateUrls(base: string, paths: string[]): string[] {
  const trimmed = base.replace(/\/+$/, "");
  const withApi = /\/api$/i.test(trimmed) ? trimmed : `${trimmed}/api`;
  const roots = Array.from(new Set([withApi, trimmed]));
  const urls: string[] = [];

  for (const root of roots) {
    for (const path of paths) {
      const resolvedPath = path.startsWith("/") ? path : `/${path}`;
      urls.push(`${root}${resolvedPath}`);
    }
  }

  return urls;
}
