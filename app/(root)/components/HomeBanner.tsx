import React from "react";
import Link from "next/link";

import { H1 } from "@/components/mbg-components/H1";

const HomeBanner = () => {
  return (
    <div className="py-16 h-[260px] md:py-0 mbg-gradient  rounded-xs px-10 lg:px-24 mbg-p-between">
      <div className="space-y-5">
        <H1 className="text-4xl md:text-6xl"  >
          Basketball <br />
          Grind
        </H1>
        <Link href={"/"} className="mbg-prime hoveEffect">
          Grind
        </Link>
      </div>
      <div>

      </div>
    </div>
  );
};

export default HomeBanner;
