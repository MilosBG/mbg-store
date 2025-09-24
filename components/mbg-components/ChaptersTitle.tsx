import { getChapters } from "@/lib/actions/actions";
import Link from "next/link";
import React from "react";
import { H3 } from "./H3";

const ChaptersTitle = async () => {
  const chapters = await getChapters();
  return (
    <div className="mt-10">
      {!chapters || chapters.length === 0 ? (
        <p>No Chapters Found</p>
      ) : (
        <div className="grid justify-items-center grid-cols-5 gap-4">
          {chapters.map((chapter: ChapterType) => (
            <Link
              href={`/chapters/${chapter._id}`}
              key={chapter._id}
              className=""
            >
              <H3
                className="tracking-wider text-[10px]  md:text-xs px-3 py-2 rounded-xs text-mbg-black"
                key={chapter.title}
              >
                {chapter.title}
              </H3>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChaptersTitle;



  
        