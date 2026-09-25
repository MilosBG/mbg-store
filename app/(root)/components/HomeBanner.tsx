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
          className="mbg-home-cta absolute bottom-5 left-1/2 z-20 inline-flex min-h-12 max-w-[90%] -translate-x-1/2 items-center justify-center overflow-hidden whitespace-nowrap border border-white/25 bg-black px-6 text-center text-[10px] font-black uppercase tracking-[0.18em] text-white transition-colors duration-300 hover:border-white hover:bg-white hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
            <span className="mbg-home-cta-sweep absolute -inset-y-1/2 -left-1/2 w-[45%] -skew-x-[20deg] bg-gradient-to-r from-transparent via-white/60 to-transparent blur-md" />
          </span>
          <span aria-hidden="true" className="mbg-home-cta-inner pointer-events-none absolute inset-0 z-0 bg-gradient-to-r from-black/0 via-white/10 to-black/0" />
          <span className="relative z-10 truncate">{cta.label}</span>
        </Link>
      )}
    </div>
  );
};

export default HomeBanner;
