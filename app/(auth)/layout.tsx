import type { Metadata } from "next";
import "../globals.css";

import { ClerkProvider } from "@clerk/nextjs";
import { SITE_METADATA } from "@/lib/seo";
import { kanit } from "../fonts";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_METADATA.url),
  title: {
    default: "Account",
    template: `%s | ${SITE_METADATA.name}`,
  },
  description: "Sign in to manage Milos BG orders, wishlist, and account preferences.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" className={kanit.variable}>
        <body className={`${kanit.className} font-kanit text-sm antialiased`}>{children}</body>
      </html>
    </ClerkProvider>
  );
}
