import { currentUser } from "@clerk/nextjs/server";

import Container from "@/components/mbg-components/Container";
import GrindToAchieveClient from "@/components/grind-to-achieve/GrindToAchieveClient";

export const dynamic = "force-dynamic";

export default async function GrindModePage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string | string[] }>;
}) {
  const user = await currentUser();
  const params = await searchParams;
  const raw = Array.isArray(params.lang) ? params.lang[0] : params.lang;
  const lang = raw === "fr" ? "fr" : "en";
  const playerName = user?.firstName || user?.username || "Hustler";

  return (
    <Container className="mt-4 min-h-[70vh]">
      <GrindToAchieveClient
        lang={lang}
        hustlerName={playerName}
        bookUrl={process.env.NEXT_PUBLIC_MBG_BOOK_URL || "/the-book"}
        ebookUrl={process.env.NEXT_PUBLIC_MBG_EBOOK_URL || "/the-book"}
      />
    </Container>
  );
}
