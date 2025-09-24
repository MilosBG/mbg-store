// components/BasketBallAnimation.tsx
"use client";

import { motion, useAnimation } from "framer-motion";
import Image from "next/image";
import { useEffect } from "react";
// import basketballImg from "@/../public/basketball.png";
import { spinner } from "@/images";

type Props = {
  start: DOMRect;
  end: DOMRect;
  onComplete: () => void;
};

const BasketBallAnimation = ({ start, end, onComplete }: Props) => {
  const controls = useAnimation();

  useEffect(() => {
    const controlAnimation = async () => {
      const midX = (start.left + end.left) / 2;
      const midY = Math.min(start.top, end.top) - 160; // Control point above for curve

      await controls.start({
        translateX: [0, midX - start.left, end.left - start.left],
        translateY: [0, midY - start.top, end.top - start.top],
        transition: {
          duration: 0.8,
          ease: "easeInOut",
        },
      });

      onComplete();
    };

    controlAnimation();
  }, [controls, start, end, onComplete]);

  return (
    <motion.div
      className="fixed translate-1 z-50 pointer-events-none w-10 h-10"
      style={{
        top: `${start.top}px`,
        left: `${start.left}px`,
      }}
      animate={controls}
    >
      <Image
        src={spinner}
        alt="Basketball"
        width={40}
              height={40}
              unoptimized
        className="w-3 h-3"
      />
    </motion.div>
  );
};

export default BasketBallAnimation;
