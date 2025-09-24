import { cn } from "@/lib/utils";
import Link from "next/link";
import React from "react";

const Logo = ({ className }: { className?: string }) => {
  return (
    <Link href={"/"}>
      <h2
        className={cn(
          "text-2xl text-mbg-white font-extrabold tracking-wider hover:text-mbg-green hover:cursor-pointer hoverEffect",
          className
        )}
      >
        Milos BG
      </h2>
    </Link>
  );
};

export default Logo;
