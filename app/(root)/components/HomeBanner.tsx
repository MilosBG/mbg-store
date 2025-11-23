import React from "react";
import Image from "next/image";
import { GrindUntilAchieve } from "@/images";

const HomeBanner = () => {
  return (
    <div className=" mt-5 h-[300px]  bg-mbg-black p-4 mbg-p-center">
      <div className="">
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
