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
    <Container className="mx-auto w-full max-w-[1680px] px-3 pb-10 sm:px-5 xl:px-7 2xl:px-8">
      <GrindToAchieveClient
        lang={lang}
        hustlerName={playerName}
        bookUrl={process.env.NEXT_PUBLIC_MBG_BOOK_URL || "/the-book"}
        ebookUrl={process.env.NEXT_PUBLIC_MBG_EBOOK_URL || "/the-book"}
      />
    </Container>
  );
}
