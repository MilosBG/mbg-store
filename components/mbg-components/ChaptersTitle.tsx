import { getChapters } from "@/lib/actions/actions";
import Link from "next/link";
import React from "react";

import { H3 } from "./H3";

type ChaptersTitleProps = {
  activeChapterId?: string;
};

const ChaptersTitle = async ({
  activeChapterId,
}: ChaptersTitleProps) => {
  const chapters = await getChapters();

  if (!chapters || chapters.length === 0) {
    return (
      <p className="py-3 text-center text-xs text-mbg-black/60">
        No Chapters Found
      </p>
    );
  }

  return (
    <nav
      aria-label="Chapter navigation"
      className="mt-10 grid w-full grid-cols-5 border-y border-mbg-black/10 bg-mbg-white"
    >
      {chapters.map((chapter) => {
        const chapterId =
          chapter._id.toString();

        const href =
          `/chapters/${chapterId}`;

        const isActive =
          chapterId === activeChapterId;

        return (
          <Link
            href={href}
            key={chapterId}
            aria-current={
              isActive ? "page" : undefined
            }
            className={`
              group relative
              flex min-h-10 w-full
              items-center justify-center
              overflow-hidden
              px-1 py-2
              transition-colors duration-300

              ${
                isActive
                  ? "bg-mbg-green/10"
                  : "hover:bg-mbg-black/[0.04]"
              }
            `}
          >
            <H3
              className={`
                text-center
                text-[7px] font-bold
                tracking-[0.04em]
                uppercase
                transition-colors duration-300
                sm:text-[9px]
                sm:tracking-wider
                md:text-xs

                ${
                  isActive
                    ? "text-mbg-green"
                    : "text-mbg-black group-hover:text-mbg-green"
                }
              `}
            >
              {chapter.title}
            </H3>

            {/* ACTIVE INDICATOR */}
            <span
              aria-hidden="true"
              className={`
                absolute right-0 bottom-0 left-0
                h-[2px]
                origin-center
                bg-mbg-green
                transition-transform
                duration-300

                ${
                  isActive
                    ? "scale-x-100"
                    : "scale-x-0 group-hover:scale-x-50"
                }
              `}
            />
          </Link>
        );
      })}
    </nav>
  );
};

export default ChaptersTitle;