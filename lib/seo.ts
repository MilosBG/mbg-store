import type { Metadata } from "next";

export const SITE_URL = "https://www.milos-bg.com";
const SITE_NAME = "Milos BG";

const DEFAULT_OG_IMAGE = "/images/seo/milos-bg-og.jpg";

export const SITE_METADATA = {
  name: SITE_NAME,
  url: SITE_URL,
};

export type BuildMetadataParams = {
  title: string;
  description: string;
  path?: string;
  image?: string;
  keywords?: string[];
  robotsIndex?: boolean;
};

function absoluteUrl(path?: string): string {
  if (!path) return SITE_URL;

  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  return new URL(path, SITE_URL).toString();
}

export function buildMetadata({
  title,
  description,
  path = "/",
  image = DEFAULT_OG_IMAGE,
  keywords = [],
  robotsIndex = true,
}: BuildMetadataParams): Metadata {
  const canonical = absoluteUrl(path);
  const ogImage = absoluteUrl(image);

  const isHomePage = path === "/";
  const titleWithSite = isHomePage
    ? "Milos BG — Grind Until Achieve"
    : `${title} | ${SITE_NAME}`;

  return {
    title,
    description,
    keywords,

    alternates: {
      canonical,
    },

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
          type: "image/jpeg",
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
      ? {
          index: true,
          follow: true,
        }
      : {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        },
  };
}