import type { Metadata } from "next";
import ChaptersTitle from "@/components/mbg-components/ChaptersTitle";
import Container from "@/components/mbg-components/Container";
import { H2 } from "@/components/mbg-components/H2";
import ProductCard from "@/components/mbg-components/ProductCard";
import type { Product } from "@/lib/types";
import { getChapterDetails } from "@/lib/actions/actions";
import { buildMetadata } from "@/lib/seo";
import Image from "next/image";
import { notFound } from "next/navigation";
import React from "react";

export const revalidate = 3600;

type PageProps = {
  params: { chapterId: string };
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { chapterId } = params;
  const encodedId = encodeURIComponent(chapterId);
  const path = `/chapters/${encodedId}`;

  try {
    const details = await getChapterDetails(chapterId);

    if (details?.title) {
      const rawDescription = typeof details.description === "string" ? details.description : "";
      const cleanDescription = rawDescription.replace(/\s+/g, " ").trim();
      const summary = cleanDescription
        ? cleanDescription.slice(0, 155) + (cleanDescription.length > 155 ? "..." : "")
        : "Discover curated looks for every Milos BG chapter.";
      const image = typeof details.image === "string" && details.image ? details.image : "/Grinder.png";

      return buildMetadata({
        title: `${details.title} Chapter`,
        description: summary,
        path,
        image,
        keywords: ["Milos BG", details.title, "chapters"],
      });
    }
  } catch (error) {
    console.error("Failed to build chapter metadata", error);
  }

  return buildMetadata({
    title: "Chapter",
    description: "Explore Milos BG chapter collections and curated looks.",
    path,
    image: "/Grinder.png",
    keywords: ["Milos BG", "chapters"],
    robotsIndex: false,
  });
}

const ChapterDetails = async ({ params }: PageProps) => {
  const { chapterId } = params;
  const chapterDetails = await getChapterDetails(chapterId);

  if (!chapterDetails) {
    return notFound();
  }

  const themeByTitle: Record<string, { bg: string; text: string }> = {
    grind: { bg: "bg-mbg-black", text: "text-mbg-black" },
    resilience: { bg: "bg-mbg-darkgrey", text: "text-mbg-darkgrey" },
    consistency: { bg: "bg-mbg-lightgrey", text: "text-mbg-lightgrey" },
    focus: { bg: "bg-mbg-green", text: "text-mbg-green" },
    achieve: { bg: "bg-mbg-white", text: "text-mbg-white" },
  };

  const normalizedTitle = chapterDetails.title?.trim().toLowerCase();
  const theme = normalizedTitle ? themeByTitle[normalizedTitle] : undefined;
  const bgClass = theme?.bg ?? "bg-mbg-black";
  const txtClass = theme?.text ?? "text-mbg-black";

  return (
    <Container>
      <div className="bg-mbg-white h-8.5">
        <ChaptersTitle />
      </div>
      <div className="py-5 text-mbg-green flex flex-col items-center gap-0">
        <Image
          src={chapterDetails.image}
          width={1500}
          height={1000}
          alt="chapter"
          className={`w-full h-[200px] object-contain border-b border-mbg-black ${bgClass}`}
        />
        <div className="mbg-p-center border-b border-mbg-green py-5">
          <H2 className={`text-mbg-green text-4xl ${txtClass}`}>{chapterDetails.title}</H2>
        </div>
        
        <div className="self-stretch w-full border-t border-mbg-green bg-mbg-green/10 px-6 py-4 mt-3">
          <p className="uppercase text-[11px] tracking-widest font-bold text-mbg-green py-1 max-w-[1100px] text-left">
            {chapterDetails.description}
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-10">
          {(chapterDetails.products ?? []).map((product: Product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </Container>
  );
};

export default ChapterDetails;
