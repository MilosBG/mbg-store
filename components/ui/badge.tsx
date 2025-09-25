import * as React from "react";

import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "outline";
}

const badgeStyles: Record<NonNullable<BadgeProps["variant"]>, string> = {
  default: "inline-flex items-center rounded-xs bg-mbg-black px-2.5 py-0.5 text-xs font-semibold text-white",
  outline: "inline-flex items-center rounded-xs border border-mbg-black/20 px-2.5 py-0.5 text-xs font-semibold text-mbg-black",
};

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "default", ...props }, ref) => {
    const styles = badgeStyles[variant] ?? badgeStyles.default;
    return <div ref={ref} className={cn(styles, className)} {...props} />;
  },
);
Badge.displayName = "Badge";

export { Badge };
