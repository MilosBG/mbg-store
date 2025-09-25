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


const BASE_DESCRIPTION = "MAKE IT YOUR LIKED OUTFITS";

const baseMetadata = buildMetadata({
  title: SITE_METADATA.name,
  description: BASE_DESCRIPTION,
  path: "/",
  image: "/Grinder.png",
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
      <a class="social-media" href="https://www.youtube.com/@Milos-BG" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
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
  baseUrl: string
): Promise<MaintenanceState> {
  const statusUrl = buildMaintenanceUrl(baseUrl, STATUS_PATH);
  if (!statusUrl) {
    return { isOnline: true, offlineHtml: null };
  }

  try {
    const statusResponse = await fetchWithRedirects(statusUrl, {
      cache: "no-store",
      headers: { "x-mbg-maintenance-probe": "1" },
    });

    if (!statusResponse.ok) {
      if (
        statusResponse.status !== 404 &&
        !isRedirectStatus(statusResponse.status)
      ) {
        const errorBody = await statusResponse.text().catch(() => "");
        console.error(
          `Maintenance status request failed with ${statusResponse.status}`,
          errorBody
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
    const offlineResponse = await fetchWithRedirects(offlineUrl, {
      cache: "no-store",
      headers: { Accept: "text/html", "x-mbg-maintenance-probe": "1" },
    });

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
  location: string
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
  maxRedirects = 4
): Promise<Response> {
  let url = initialUrl;
  const headers = new Headers(init.headers ?? {});
  const visited = new Set<string>();

  for (let attempt = 0; attempt <= maxRedirects; attempt += 1) {
    if (visited.has(url)) {
      logMaintenanceError(
        `Detected redirect loop while fetching ${initialUrl}. Looped back to ${url}`,
        undefined,
        { warn: true }
      );
      return new Response(null, { status: 508, statusText: "Redirect Loop" });
    }
    visited.add(url);

    const response = await fetch(url, {
      ...init,
      headers,
      redirect: "manual",
    });

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
    { warn: true }
  );
  return new Response(null, {
    status: 508,
    statusText: "Redirect Limit Exceeded",
  });
}

function resolveBaseUrl(
  headerList: Awaited<ReturnType<typeof headers>>
): string {
  const host = takeFirst(
    headerList.get("x-forwarded-host") ?? headerList.get("host")
  );
  const protocol = takeFirst(
    headerList.get("x-forwarded-proto") ?? headerList.get("forwarded-proto")
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

type MaintenanceLogOptions = { warn?: boolean } | undefined;

function logMaintenanceError(
  context: string,
  error?: unknown,
  options?: MaintenanceLogOptions
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
