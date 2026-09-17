import type { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import Container from "@/components/mbg-components/Container";
import GrindModeClient from "@/components/grind/GrindModeClient";
import { normalizeGrindLanguage } from "@/lib/grind/i18n";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "GRIND MODE | Milos BG",
  description:
    "A private Milos BG game-like progression system built around GRIND, RESILIENCE, CONSISTENCY, FOCUS and ACHIEVE.",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ lang?: string | string[] }>;
};

export default async function GrindModePage({ searchParams }: Props) {
  const { userId } = await auth();
  const { lang: rawLang } = await searchParams;
  const lang = normalizeGrindLanguage(rawLang);

  if (!userId) {
    redirect(`/sign-in?redirect_url=${encodeURIComponent(`/grind-mode?lang=${lang}`)}`);
  }

  const user = await currentUser();
  const playerName =
    user?.firstName ||
    user?.username ||
    "GRINDER";

  const bookUrl = process.env.NEXT_PUBLIC_MBG_BOOK_URL || "/the-book";
  const ebookUrl = process.env.NEXT_PUBLIC_MBG_EBOOK_URL || "/the-book";

  return (
    <Container className="min-h-screen">
      <GrindModeClient
        lang={lang}
        bookUrl={bookUrl}
        ebookUrl={ebookUrl}
        playerName={playerName}
      />
    </Container>
  );
}
