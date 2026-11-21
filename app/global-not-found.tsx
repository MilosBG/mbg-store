import type { Metadata } from "next";

import "./globals.css";
import { kanit } from "./fonts";
import NotFound from "./not-found";

/**
 * Next.js 15.4+ experimental global 404.
 * Essential for this project because /(root) and /(auth) each provide
 * their own root layout, so app/not-found.tsx has no shared layout.
 */
export const metadata: Metadata = {
  title: "404 — Out of Bounds | Milos BG",
  description: "This page does not exist or is no longer available.",
  robots: { index: false, follow: false },
};

export default function GlobalNotFound() {
  return (
    <html lang="en" className={kanit.variable}>
      <body className={`${kanit.className} font-kanit antialiased`}>
        <NotFound />
      </body>
    </html>
  );
}
