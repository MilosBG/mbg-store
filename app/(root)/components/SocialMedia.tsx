import React from "react";

import { cn } from "@/lib/utils";
import { TiSocialInstagram, TiSocialYoutube } from "react-icons/ti";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  className?: string;
  iconClassName?: string;
}

const socialLink = [
  {
    title: "INSTAGRAM : @m.i.l.o.s.bg",
    href: "https://www.instagram.com/m.i.l.o.s.bg/",
    icon: <TiSocialInstagram size={16} />,
  },
  {
    title: "YOUTUBE : @milos-bg",
    href: "https://www.youtube.com/@milos-bg",
    icon: <TiSocialYoutube size={16} />,
  },
];

const SocialMedia = ({ className, iconClassName }: Props) => {
  return (
    <TooltipProvider>
      <div className={cn("flex items-center justify-start gap-3.5", className)}>
        {socialLink?.map((item) => (
          <Tooltip key={item?.title}>
            <TooltipTrigger asChild>
              <Link
                key={item?.title}
                target="_blank"
                rel="noopener noreferrer"
                href={item?.href}
                className={cn("social-media", iconClassName)}
              >
                {item?.icon}
              </Link>
            </TooltipTrigger>
            <TooltipContent>{item?.title}</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  );
};

export default SocialMedia;
