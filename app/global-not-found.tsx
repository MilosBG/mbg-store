import type { Metadata } from "next";

import "./globals.css";
import { kanit } from "./fonts";
import NotFound from "./not-found";

export const metadata: Metadata = {
  title: "404 — Out of Bounds | Milos BG",
  description: "This page does not exist or is no longer available.",
  robots: { index: false, follow: false },
};

/**
 * Standalone 404 for unmatched URLs outside the storefront/auth root layouts.
 * Inline body styles and NotFound's scoped <style> make it resilient when the
 * Next.js 15 global 404 does not load the usual Tailwind stylesheet.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={kanit.variable}>
      <body
        className={kanit.className}
        style={{
          margin: 0,
          minHeight: "100vh",
          backgroundColor: "#050505",
          color: "#ffffff",
          fontFamily: `${kanit.style.fontFamily}, system-ui, Arial, sans-serif`,
        }}
      >
        <NotFound />
      </body>
    </html>
  );
}
