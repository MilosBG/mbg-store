import { getChapters } from "@/lib/actions/actions";
import Image from "next/image";
import Link from "next/link";
import React from "react";

import { H3 } from "./H3";

const Chapters = async () => {
  const chapters = await getChapters();

  return (
    <section
      className="mt-10"
      aria-labelledby="chapters-title"
    >
      <p
        id="chapters-title"
        className="heading2-bold py-3"
      >
        Chapters
      </p>

      {!chapters || chapters.length === 0 ? (
        <p>No Chapters Found</p>
      ) : (
        <div className="grid grid-cols-2 justify-items-center gap-4 md:grid-cols-5">
          {chapters.map((chapter) => (
            <Link
              href={`/chapters/${chapter._id}`}
              key={chapter._id}
              className="
                group relative
                w-full overflow-hidden
                rounded-t-[5px]
                border border-mbg-black/46
                shadow-md
                transition-all duration-300
                hover:-translate-y-1
                hover:shadow-lg
              "
            >
              {/* BADGE */}
              {chapter.badge?.trim() && (
                <span
                  className="
                    absolute top-2 right-2 z-10
                    inline-flex items-center justify-center
                    rounded-sm
                    border border-white/30
                    bg-mbg-black/85
                    px-2.5 py-1.5
                    text-[8px] font-bold
                    tracking-[0.15em]
                    text-mbg-white
                    uppercase
                    shadow-md
                    backdrop-blur-sm
                    sm:text-[9px]
                  "
                >
                  {chapter.badge}
                </span>
              )}

              {/* IMAGE */}
              <div className="relative aspect-[7/4] w-full overflow-hidden">
                <Image
                  src={chapter.image}
                  alt={chapter.title}
                  fill
                  sizes="(max-width: 767px) 50vw, 20vw"
                  className="
                    mbg-gradient2
                    object-cover
                    transition-transform
                    duration-500
                    group-hover:scale-[1.03]
                  "
                />
              </div>

              {/* TITLE */}
              <H3
                className="
                  rounded-xs
                  bg-mbg-black/7
                  px-3 py-2
                  tracking-wider
                  text-mbg-black
                "
              >
                {chapter.title}
              </H3>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
};

export default Chapters;