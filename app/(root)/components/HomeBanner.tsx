import React from "react";
import { H1 } from "@/components/mbg-components/H1";

const HomeBanner = () => {
  return (
    <div className="py-16 h-[260px] md:py-0 mbg-gradient  rounded-xs px-10 lg:px-24 mbg-p-between">
      <div className="space-y-5">
        <H1 className="text-4xl md:text-6xl font-black"  >
          Basketball <br />
          Grind
        </H1>
      </div>
      <div>

      </div>
    </div>
  );
};

export default HomeBanner;
