import { currentUser } from "@clerk/nextjs/server";

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
    <div className="mx-auto w-full max-w-[1680px] px-3 pb-10 sm:px-5 xl:px-7 2xl:px-8">
      <GrindToAchieveClient
        lang={lang}
        hustlerName={playerName}
        bookUrl={process.env.NEXT_PUBLIC_GRIND_BOOK_URL || "https://www.paypal.com/ncp/payment/L29HGX5RLJAEC"}
        ebookUrl={process.env.NEXT_PUBLIC_GRIND_EBOOK_URL || "https://www.amazon.fr/GRIND-UNTIL-ACHIEVE-English-GAMIL-ebook/dp/B0GP19C9PN"}
      />
    </div>
  );
}
