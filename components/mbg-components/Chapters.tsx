import { getChapters } from "@/lib/actions/actions";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { H3 } from "./H3";

const Chapters = async () => {
  const chapters = await getChapters();
  return (
    <div className="mt-10">
      <p className="py-3  heading2-bold">Chapters</p>
      {!chapters || chapters.length === 0 ? (
        <p>No Chapters Found</p>
      ) : (
        <div className="grid justify-items-center grid-cols-2 md:grid-cols-5 gap-4">
          {chapters.map((chapter: ChapterType) => (
            <Link
              href={`/chapters/${chapter._id}`}
              key={chapter._id}
              className="shadow-md border border-mbg-black/46 rounded-t-[5px]"
            >
              <Image
                key={chapter._id}
                src={chapter.image}
                alt={chapter.title}
                width={350}
                height={200}
                className="rounded-t-sm cursor-pointer mbg-gradient2"
              />
              <H3
                className="tracking-wider bg-mbg-black/7 px-3 py-2 rounded-xs text-mbg-black"
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

export default Chapters;



  
        