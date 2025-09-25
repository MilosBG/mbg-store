import type { Metadata } from "next";

const FALLBACK_SITE_URL = "https://www.milos-bg.com";
const SITE_NAME = "Milos BG";
const DEFAULT_OG_IMAGE = "/Grinder.png";

const SITE_URL_CANDIDATES = [
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.NEXT_PUBLIC_APP_URL,
  process.env.SITE_URL,
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
  process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : undefined,
  process.env.NEXT_PUBLIC_API_URL,
];

function normalizeUrl(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  try {
    return new URL(trimmed).origin;
  } catch {
    try {
      return new URL(`https://${trimmed}`).origin;
    } catch {
      return null;
    }
  }
}

export const SITE_URL =
  SITE_URL_CANDIDATES.map(normalizeUrl).find((url): url is string => Boolean(url)) ??
  FALLBACK_SITE_URL;

export const SITE_METADATA = {
  name: SITE_NAME,
  url: SITE_URL,
};

export type BuildMetadataParams = {
  title: string;
  description: string;
  path: string;
  image?: string;
  keywords?: string[];
  robotsIndex?: boolean;
};

function absoluteUrl(path: string | undefined): string {
  if (!path) {
    return SITE_URL;
  }
  if (/^https?:/i.test(path)) {
    return path;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${normalized}`;
}

export function buildMetadata({
  title,
  description,
  path,
  image,
  keywords,
  robotsIndex = true,
}: BuildMetadataParams): Metadata {
  const canonical = absoluteUrl(path);
  const ogImage = absoluteUrl(image ?? DEFAULT_OG_IMAGE);
  const titleWithSite = `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    keywords,
    alternates: { canonical },
    openGraph: {
      type: "website",
      locale: "en_US",
      url: canonical,
      siteName: SITE_NAME,
      title: titleWithSite,
      description,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: titleWithSite,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titleWithSite,
      description,
      images: [ogImage],
    },
    robots: robotsIndex
      ? undefined
      : { index: false, follow: false, googleBot: { index: false, follow: false } },
  };
}
