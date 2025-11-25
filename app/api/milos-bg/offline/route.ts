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

const DEFAULT_OFFLINE_HTML = process.env.MBG_OFFLINE_HTML ?? process.env.STORE_OFFLINE_HTML ?? "offline";

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
