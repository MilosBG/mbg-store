import type { Metadata } from "next";
import "../globals.css";

import { ClerkProvider } from "@clerk/nextjs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    template: "%s | Milos BG - STORE AUTH",
    default: "Milos BG - STORE AUTH",
  },
  description: "Milos BG Ecommerce store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="font-kanit text-sm antialiased">{children}</body>
      </html>
    </ClerkProvider>
  );
}
