import React from "react";
import Image from "next/image";
import Link from "next/link";
import { GrindUntilAchieve } from "@/images";
import { getHomeBannerSettings } from "@/lib/homeBanner";

const HomeBanner = async () => {
  const { imageUrl, imageAlt, cta } = await getHomeBannerSettings();

  return (
    <div className="relative mt-5 h-[400px] overflow-hidden bg-mbg-black p-4 mbg-p-center md:h-[500px] lg:h-[680px] 2xl:h-[600px]">
      {imageUrl ? (
        <Image
          src={imageUrl}
          alt={imageAlt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 1200px"
          className="object-cover object-center"
        />
      ) : (
        <Image
          src={GrindUntilAchieve}
          alt="Grind Until Achieve"
          priority
          className="max-h-[200px] w-auto object-contain md:max-h-[260px] lg:max-h-[340px] 2xl:max-h-[400px]"
        />
      )}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[16.6667%] bg-gradient-to-t from-black/55 to-transparent"
      />

      {cta && (
        <Link
          href={cta.href}
          className="absolute bottom-5 left-1/2 z-20 max-w-[90%] -translate-x-1/2 truncate whitespace-nowrap bg-mbg-green px-5 py-2.5 text-center text-[11px] font-bold uppercase tracking-wider text-mbg-black transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mbg-green"
        >
          {cta.label}
        </Link>
      )}
    </div>
  );
};

export default HomeBanner;
