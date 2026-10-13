import type { Metadata } from "next";
import { headers } from "next/headers";
import "../globals.css";
import Footer from "./components/Footer";
import Header from "./components/Header";
import MaintenanceGate from "./components/MaintenanceGate";
import { ClerkProvider } from "@clerk/nextjs";
import ToasterProvider from "@/lib/providers/ToasterProvider";
import CookieConsent from "@/components/privacy/CookieConsent";
import { buildMetadata, SITE_METADATA } from "@/lib/seo";
import { kanit } from "../fonts";

const BASE_DESCRIPTION =
  "A story of progression, written one chapter at a time.";

const baseMetadata = buildMetadata({
  title: SITE_METADATA.name,
  description: BASE_DESCRIPTION,
  path: "/",
  image: "/milos-bg-og.jpg",
});

export const metadata: Metadata = {
  ...baseMetadata,

  metadataBase: new URL(SITE_METADATA.url),

  title: {
    default: SITE_METADATA.name,
    template: `%s | ${SITE_METADATA.name}`,
  },
};

type MaintenanceState = {
  isOnline: boolean;
  offlineHtml: string | null;
};

const STATUS_PATH = "/api/milos-bg/status";
const OFFLINE_PATH = "/api/milos-bg/offline";
const MAINTENANCE_FETCH_TIMEOUT_MS = (() => {
  const raw =
    process.env.MBG_STATUS_TIMEOUT_MS ??
    process.env.MAINTENANCE_STATUS_TIMEOUT_MS ??
    "5000";
  const parsed = Number(raw);
  if (Number.isFinite(parsed) && parsed > 0) {
    return Math.max(500, parsed);
  }
  return 5000;
})();
const DEFAULT_OFFLINE_MESSAGE = `
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
      <a class="social-media" href="https://www.threads.com/@m.i.l.o.s.bg" target="_blank" rel="noopener noreferrer" aria-label="Threads">
  <svg stroke="currentColor" fill="currentColor" stroke-width="0" viewBox="0 0 448 512" height="16" width="16" xmlns="http://www.w3.org/2000/svg">
    <path d="M64 32C28.7 32 0 60.7 0 96V416c0 35.3 28.7 64 64 64H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zM294.2 244.3c19.5 9.3 33.7 23.5 41.2 40.9c10.4 24.3 11.4 63.9-20.2 95.4c-24.2 24.1-53.5 35-95.1 35.3h-.2c-46.8-.3-82.8-16.1-106.9-46.8C91.5 341.8 80.4 303.7 80 256v-.1-.1c.4-47.7 11.5-85.7 33-113.1c24.2-30.7 60.2-46.5 106.9-46.8h.2c46.9 .3 83.3 16 108.2 46.6c12.3 15.1 21.3 33.3 27 54.4l-26.9 7.2c-4.7-17.2-11.9-31.9-21.4-43.6c-19.4-23.9-48.7-36.1-87-36.4c-38 .3-66.8 12.5-85.5 36.2c-17.5 22.3-26.6 54.4-26.9 95.5c.3 41.1 9.4 73.3 26.9 95.5c18.7 23.8 47.4 36 85.5 36.2c34.3-.3 56.9-8.4 75.8-27.3c21.5-21.5 21.1-47.9 14.2-64c-4-9.4-11.4-17.3-21.3-23.3c-2.4 18-7.9 32.2-16.5 43.2c-11.4 14.5-27.7 22.4-48.4 23.5c-15.7 .9-30.8-2.9-42.6-10.7c-13.9-9.2-22-23.2-22.9-39.5c-1.7-32.2 23.8-55.3 63.5-57.6c14.1-.8 27.3-.2 39.5 1.9c-1.6-9.9-4.9-17.7-9.8-23.4c-6.7-7.8-17.1-11.8-30.8-11.9h-.4c-11 0-26 3.1-35.6 17.6l-23-15.8c12.8-19.4 33.6-30.1 58.5-30.1h.6c41.8 .3 66.6 26.3 69.1 71.8c1.4 .6 2.8 1.2 4.2 1.9l.1 .5zm-71.8 67.5c17-.9 36.4-7.6 39.7-48.8c-8.8-1.9-18.6-2.9-29-2.9c-3.2 0-6.4 .1-9.6 .3c-28.6 1.6-38.1 15.5-37.4 27.9c.9 16.7 19 24.5 36.4 23.6l-.1-.1z"></path>
  </svg>
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

async function getMaintenanceState(): Promise<MaintenanceState> {
  const headerList = await headers();
  const maintenanceHint = headerList.get("x-mbg-store-online");
  const baseUrl = resolveBaseUrl(headerList);

  if (maintenanceHint === "1") {
    return { isOnline: true, offlineHtml: null };
  }

  if (maintenanceHint === "0") {
    return {
      isOnline: false,
      offlineHtml: await fetchOfflineMarkup(baseUrl),
    };
  }

  return fetchMaintenanceStatus(baseUrl);
}

async function fetchMaintenanceStatus(
  baseUrl: string,
): Promise<MaintenanceState> {
  const statusUrl = buildMaintenanceUrl(baseUrl, STATUS_PATH);
  if (!statusUrl) {
    return { isOnline: true, offlineHtml: null };
  }

  try {
    const statusResponse = await fetchWithRedirects(
      statusUrl,
      {
        cache: "no-store",
        headers: { "x-mbg-maintenance-probe": "1" },
      },
      MAINTENANCE_FETCH_TIMEOUT_MS,
    );

    if (!statusResponse.ok) {
      if (
        statusResponse.status !== 404 &&
        !isRedirectStatus(statusResponse.status)
      ) {
        const errorBody = await statusResponse.text().catch(() => "");
        console.error(
          `Maintenance status request failed with ${statusResponse.status}`,
          errorBody,
        );
      }
      return { isOnline: true, offlineHtml: null };
    }

    const statusPayload = await statusResponse.json().catch(() => null);

    if (statusPayload?.isOnline === false) {
      return {
        isOnline: false,
        offlineHtml: await fetchOfflineMarkup(baseUrl),
      };
    }

    return { isOnline: true, offlineHtml: null };
  } catch (error) {
    logMaintenanceError("Failed to resolve maintenance status", error);
    return { isOnline: true, offlineHtml: null };
  }
}

async function fetchOfflineMarkup(baseUrl: string): Promise<string> {
  const offlineUrl = buildMaintenanceUrl(baseUrl, OFFLINE_PATH);
  if (!offlineUrl) {
    return DEFAULT_OFFLINE_MESSAGE;
  }

  try {
    const offlineResponse = await fetchWithRedirects(
      offlineUrl,
      {
        cache: "no-store",
        headers: { Accept: "text/html", "x-mbg-maintenance-probe": "1" },
      },
      MAINTENANCE_FETCH_TIMEOUT_MS,
    );

    if (!offlineResponse.ok) {
      return DEFAULT_OFFLINE_MESSAGE;
    }

    const offlineHtml = await offlineResponse.text();
    return offlineHtml || DEFAULT_OFFLINE_MESSAGE;
  } catch (error) {
    logMaintenanceError("Failed to load offline markup", error);
    return DEFAULT_OFFLINE_MESSAGE;
  }
}

function buildMaintenanceUrl(baseUrl: string, path: string): string | null {
  if (!baseUrl) {
    return null;
  }

  try {
    return new URL(path, baseUrl).toString();
  } catch {
    return null;
  }
}

function isRedirectStatus(status: number): boolean {
  return status >= 300 && status < 400;
}

function resolveRedirectUrl(
  currentUrl: string,
  location: string,
): string | null {
  try {
    return new URL(location, currentUrl).toString();
  } catch {
    return null;
  }
}

async function fetchWithRedirects(
  initialUrl: string,
  init: RequestInit,
  maxRedirects = 4,
  timeoutMs = MAINTENANCE_FETCH_TIMEOUT_MS,
): Promise<Response> {
  let url = initialUrl;
  const headers = new Headers(init.headers ?? {});
  const visited = new Set<string>();

  for (let attempt = 0; attempt <= maxRedirects; attempt += 1) {
    if (visited.has(url)) {
      logMaintenanceError(
        `Detected redirect loop while fetching ${initialUrl}. Looped back to ${url}`,
        undefined,
        { warn: true },
      );
      return new Response(null, { status: 508, statusText: "Redirect Loop" });
    }
    visited.add(url);

    const response = await fetchWithTimeout(
      url,
      {
        ...init,
        headers,
        redirect: "manual",
      },
      timeoutMs,
    );

    if (!isRedirectStatus(response.status)) {
      return response;
    }

    const location = response.headers.get("location");
    if (!location) {
      return response;
    }

    const nextUrl = resolveRedirectUrl(url, location);
    if (!nextUrl) {
      return response;
    }

    url = nextUrl;
  }

  logMaintenanceError(
    `Exceeded redirect limit while fetching ${initialUrl} after ${
      maxRedirects + 1
    } redirects`,
    undefined,
    { warn: true },
  );
  return new Response(null, {
    status: 508,
    statusText: "Redirect Limit Exceeded",
  });
}

function resolveBaseUrl(
  headerList: Awaited<ReturnType<typeof headers>>,
): string {
  const host = takeFirst(
    headerList.get("x-forwarded-host") ?? headerList.get("host"),
  );
  const protocol = takeFirst(
    headerList.get("x-forwarded-proto") ?? headerList.get("forwarded-proto"),
  );

  if (host) {
    const scheme =
      protocol ?? (process.env.NODE_ENV === "development" ? "http" : "https");
    return `${scheme}://${host}`.replace(/\/+$/, "");
  }

  const envOrigin = resolveEnvOrigin();
  if (envOrigin) {
    return envOrigin;
  }

  const port = process.env.PORT ?? "3000";
  return `http://localhost:${port}`;
}

function resolveEnvOrigin(): string | null {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.SITE_URL,
    process.env.VERCEL_URL,
    process.env.NEXT_PUBLIC_VERCEL_URL,
    process.env.NEXT_PUBLIC_API_URL,
    process.env.NEXT_PUBLIC_ADMIN_API,
    process.env.API_BASE_URL,
    process.env.ADMIN_BASE_URL,
    process.env.ADMIN_API_URL,
  ];

  for (const candidate of candidates) {
    const origin = coerceOrigin(candidate);
    if (origin) {
      return origin;
    }
  }

  return null;
}

function coerceOrigin(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const normalized = trimmed.startsWith("http")
    ? trimmed
    : `https://${trimmed}`;

  try {
    return new URL(normalized).origin;
  } catch {
    return null;
  }
}

function takeFirst(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const first = value.split(",")[0]?.trim();
  return first || null;
}

function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...init, signal: controller.signal }).finally(() => {
    clearTimeout(timeoutId);
  });
}

type MaintenanceLogOptions = { warn?: boolean } | undefined;

function logMaintenanceError(
  context: string,
  error?: unknown,
  options?: MaintenanceLogOptions,
): void {
  const warn = options?.warn ?? false;

  if (
    error instanceof Error &&
    error.message.includes("Exceeded redirect limit")
  ) {
    console.warn(`${context}: redirect loop detected`, error);
    return;
  }

  if (warn) {
    if (error !== undefined) {
      console.warn(context, error);
    } else {
      console.warn(context);
    }
    return;
  }

  if (error !== undefined) {
    console.error(context, error);
  } else {
    console.error(context);
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const maintenanceState = await getMaintenanceState();

  return (
    <html lang="en" className={kanit.variable}>
      <body className={`${kanit.className} font-kanit text-sm antialiased`}>
        <ClerkProvider>
          <MaintenanceGate
            isOnline={maintenanceState.isOnline}
            offlineHtml={maintenanceState.offlineHtml}
            statusPath={STATUS_PATH}
            fallbackHtml={DEFAULT_OFFLINE_MESSAGE}
          >
            <ToasterProvider />
            <Header />
            <CookieConsent />
            {children}
            <Footer />
          </MaintenanceGate>
        </ClerkProvider>
      </body>
    </html>
  );
}
