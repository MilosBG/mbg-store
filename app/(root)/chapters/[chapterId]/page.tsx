import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import React from "react";

import ChaptersTitle from "@/components/mbg-components/ChaptersTitle";
import Container from "@/components/mbg-components/Container";
import { H2 } from "@/components/mbg-components/H2";
import ProductCard from "@/components/mbg-components/ProductCard";

import { getChapterDetails } from "@/lib/actions/actions";
import { buildMetadata } from "@/lib/seo";
import type { Product } from "@/lib/types";

export const revalidate = 3600;

type PageProps = {
  params: {
    chapterId: string;
  };
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { chapterId } = params;

  const encodedId = encodeURIComponent(chapterId);
  const path = `/chapters/${encodedId}`;

  try {
    const details =
      await getChapterDetails(chapterId);

    if (details?.title) {
      const rawDescription =
        typeof details.description === "string"
          ? details.description
          : "";

      const cleanDescription = rawDescription
        .replace(/\s+/g, " ")
        .trim();

      const summary = cleanDescription
        ? cleanDescription.slice(0, 155) +
          (cleanDescription.length > 155
            ? "..."
            : "")
        : "Discover curated looks for every Milos BG chapter.";

      const image =
        typeof details.image === "string" &&
        details.image
          ? details.image
          : "/Grinder.png";

      return buildMetadata({
        title: `${details.title} Chapter`,
        description: summary,
        path,
        image,
        keywords: [
          "Milos BG",
          details.title,
          "chapters",
        ],
      });
    }
  } catch (error) {
    console.error(
      "Failed to build chapter metadata",
      error,
    );
  }

  return buildMetadata({
    title: "Chapter",
    description:
      "Explore Milos BG chapter collections and curated looks.",
    path,
    image: "/Grinder.png",
    keywords: ["Milos BG", "chapters"],
    robotsIndex: false,
  });
}

const ChapterDetails = async ({
  params,
}: PageProps) => {
  const { chapterId } = params;

  const chapterDetails =
    await getChapterDetails(chapterId);

  if (!chapterDetails) {
    notFound();
  }

  const themeByTitle: Record<
    string,
    {
      bg: string;
      text: string;
    }
  > = {
    grind: {
      bg: "bg-mbg-black",
      text: "text-mbg-black",
    },

    resilience: {
      bg: "bg-mbg-darkgrey",
      text: "text-mbg-darkgrey",
    },

    consistency: {
      bg: "bg-mbg-lightgrey",
      text: "text-mbg-lightgrey",
    },

    focus: {
      bg: "bg-mbg-green",
      text: "text-mbg-green",
    },

    achieve: {
      bg: "bg-mbg-white",
      text: "text-mbg-black",
    },
  };

  const normalizedTitle =
    chapterDetails.title
      ?.trim()
      .toLowerCase();

  const theme = normalizedTitle
    ? themeByTitle[normalizedTitle]
    : undefined;

  const bgClass =
    theme?.bg ?? "bg-mbg-black";

  const textClass =
    theme?.text ?? "text-mbg-black";

  return (
    <Container>
      {/* CHAPTER NAVIGATION */}
      <div className="bg-mbg-white">
        <ChaptersTitle
          activeChapterId={chapterId}
        />
      </div>

      {/* CHAPTER CONTENT */}
      <div className="flex flex-col items-center gap-0 py-5 text-mbg-green">
        <Image
          src={chapterDetails.image}
          width={1500}
          height={1000}
          alt={`${chapterDetails.title} Chapter`}
          priority
          className={`
            h-[200px] w-full
            border-b border-mbg-black
            object-contain
            ${bgClass}
          `}
        />

        <div className="mbg-p-center border-b border-mbg-green py-5">
          <H2
            className={`
              text-4xl
              ${textClass}
            `}
          >
            {chapterDetails.title}
          </H2>
        </div>

        <div className="mt-3 w-full self-stretch border-t border-mbg-green bg-mbg-green/10 px-6 py-4">
          <p className="max-w-[1100px] py-1 text-left text-[11px] font-bold tracking-widest text-mbg-green uppercase">
            {chapterDetails.description}
          </p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5">
          {(chapterDetails.products ?? []).map(
            (product: Product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ),
          )}
        </div>
      </div>
    </Container>
  );
};

export default ChapterDetails;