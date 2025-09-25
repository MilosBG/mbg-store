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
  params: Promise<{ chapterId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { chapterId } = await params;
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
  const { chapterId } = await params; // 👈 await params
  const chapterDetails = await getChapterDetails(chapterId);

  if (!chapterDetails) {
    return notFound();
  }

  type ChapterTitle = "Grind" | "Resilience" | "Consistency" | "Focus" | "Achieve";

  const bgByTitle = {
    Grind: "bg-mbg-black",
    Resilience: "bg-mbg-darkgrey",
    Consistency: "bg-mbg-lightgrey",
    Focus: "bg-mbg-green",
    Achieve: "bg-mbg-white",
  } as const;

  const textByTitle = {
    Grind: "text-mbg-black",
    Resilience: "text-mbg-darkgrey",
    Consistency: "text-mbg-lightgrey",
    Focus: "text-mbg-green",
    Achieve: "text-mbg-white",
  } as const;

  const bgClass = bgByTitle[chapterDetails.title as ChapterTitle] ?? "bg-mbg-black";
  const txtClass = textByTitle[chapterDetails.title as ChapterTitle] ?? "text-mbg-black";

  return (
    <Container>
      <div className="bg-mbg-white h-8.5">
        <ChaptersTitle />
      </div>
      <div className=" py-5 text-mbg-green flex flex-col itmes-center gap-0">
        <Image
          src={chapterDetails.image}
          width={1500}
          height={1000}
          alt="chapter"
            className={`w-full h-[200px] object-contain border-b-1 border-mbg-black ${bgClass}`}
        />
        <div className="mbg-p-center border-b border-mbg-green py-5" >
            <H2 className={`text-mbg-green text-4xl ${txtClass}`}  >{chapterDetails.title}</H2>
        </div>
        
        <div className="bg-mbg-green/10 p-5" >
            <p className="uppercase text-[11px] tracking-widest font-bold text-mbg-green py-3 max-w-[900px]">
              {chapterDetails.description}
                  </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-10">
          {chapterDetails.products.map((product: Product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </Container>
  );
};

export default ChapterDetails;
