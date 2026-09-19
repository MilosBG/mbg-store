"use client";

import type { SVGProps } from "react";

type Props = SVGProps<SVGSVGElement> & {
  code?: string;
};

const common = {
  viewBox: "0 0 64 64",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function Encouragement(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...common} {...props}>
      <path d="M32 12c4 7 4 12 0 18-4-6-4-11 0-18Z" />
      <path d="M18 18c7 2 11 6 13 12-7-1-11-5-13-12Z" />
      <path d="M46 18c-7 2-11 6-13 12 7-1 11-5 13-12Z" />
      <path d="M20 39c6-4 12-4 18 0-5 5-11 5-18 0Z" />
      <path d="M44 39c-6-4-12-4-18 0 5 5 11 5 18 0Z" />
      <circle cx="32" cy="32" r="5" />
      <path d="M32 45v8M28 49h8" />
    </svg>
  );
}

function DontGiveUp(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...common} {...props}>
      <path d="M47 24a18 18 0 1 0 1 17" />
      <path d="m43 14 5 10-11 1" />
      <path d="M23 39 31 31l7 5 7-10" />
      <path d="m41 26 4 0 0 4" />
    </svg>
  );
}

function Effort(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...common} {...props}>
      <path d="M18 48c5-13 10-21 14-30 3 7 4 12 3 17 4-5 7-9 9-13 4 11 3 20-2 26-6 8-19 8-24 0Z" />
      <path d="M25 48c2-7 5-12 8-17 2 5 3 9 2 13 2-2 4-5 6-7 0 9-5 14-10 14-3 0-5-1-6-3Z" />
      <path d="M14 16h10M17 11l4 10" />
    </svg>
  );
}

function Challenger(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...common} {...props}>
      <circle cx="22" cy="32" r="11" />
      <circle cx="42" cy="32" r="11" />
      <path d="M27 20 37 44M37 20 27 44" />
      <path d="M12 17 18 11l6 6M52 47l-6 6-6-6" />
    </svg>
  );
}

function ShadowBreaker(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...common} {...props}>
      <path d="M25 14c-7 4-11 11-11 19 0 10 8 18 18 18" />
      <path d="M39 14c7 4 11 11 11 19 0 10-8 18-18 18" opacity=".55" />
      <path d="m35 10-7 15 8 3-9 24" />
      <path d="M19 34h9M36 34h9" />
    </svg>
  );
}

function Consistent(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...common} {...props}>
      <path d="M14 44V26M24 44V20M34 44V30M44 44V16M54 44V24" />
      <path d="M12 49h44" />
      <path d="m14 22 10-7 10 10 10-14 10 8" />
      <circle cx="14" cy="22" r="2" fill="currentColor" stroke="none" />
      <circle cx="24" cy="15" r="2" fill="currentColor" stroke="none" />
      <circle cx="34" cy="25" r="2" fill="currentColor" stroke="none" />
      <circle cx="44" cy="11" r="2" fill="currentColor" stroke="none" />
      <circle cx="54" cy="19" r="2" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LockedIn(props: SVGProps<SVGSVGElement>) {
  return (
    <svg {...common} {...props}>
      <circle cx="32" cy="32" r="17" />
      <circle cx="32" cy="32" r="8" />
      <path d="M32 7v10M32 47v10M7 32h10M47 32h10" />
      <path d="m32 27 5 5-5 5-5-5 5-5Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function BadgeEmblem({ code = "ENCOURAGEMENT", ...props }: Props) {
  switch (code) {
    case "DONT_GIVE_UP":
    case "RETURN":
      return <DontGiveUp {...props} />;
    case "EFFORT":
    case "FLAME":
      return <Effort {...props} />;
    case "CHALLENGER":
    case "TARGET":
      return <Challenger {...props} />;
    case "SHADOW_BREAKER":
    case "SHIELD":
      return <ShadowBreaker {...props} />;
    case "CONSISTENT":
    case "REPEAT":
      return <Consistent {...props} />;
    case "LOCKED_IN":
    case "FOCUS":
      return <LockedIn {...props} />;
    default:
      return <Encouragement {...props} />;
  }
}
