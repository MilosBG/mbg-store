import { currentUser } from "@clerk/nextjs/server";

import GrindToAchieveClient from "@/components/grind-to-achieve/GrindToAchieveClient";
import Container from "@/components/mbg-components/Container";

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
    <Container>
      <GrindToAchieveClient
        lang={lang}
        hustlerName={playerName}
        bookUrl={process.env.NEXT_PUBLIC_GRIND_BOOK_URL || "/the-book"}
        ebookUrl={process.env.NEXT_PUBLIC_GRIND_EBOOK_URL || "/the-book"}
      />
    </Container>
  );
}
