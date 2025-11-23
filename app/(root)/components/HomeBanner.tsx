import React from "react";
import Image from "next/image";
import { GrindUntilAchieve } from "@/images";

const HomeBanner = () => {
  return (
    <div className="py-16 mt-5 h-[300px] md:py-0 bg-mbg-white/50  rounded-xs px-10 lg:px-24 mbg-p-center">
      <div className="space-y-5">
      </div>
      <div>
        <Image
          src={GrindUntilAchieve}
          alt="Grind Until Achieve"
          className="max-h-[120px] md:max-h-[140px] w-auto object-contain"
        />
      </div>
      <div></div>
    </div>
  );
};

export default HomeBanner;
