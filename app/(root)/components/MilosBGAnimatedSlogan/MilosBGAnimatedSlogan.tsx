import React from "react";
import styles from "./MilosBGAnimatedSlogan.module.css";

const MilosBGAnimatedSlogan = () => {
  return (
    <section
      aria-label="Milos BG slogan"
      className="flex min-h-[280px] w-full items-center justify-center overflow-hidden bg-[#030303] px-5 py-16 font-kanit sm:min-h-[360px] sm:px-8 lg:min-h-[450px]"
    >
      <h2
        className={`${styles.animatedGradientText} text-center text-[clamp(2.4rem,7vw,7.5rem)] leading-[0.95] font-extrabold tracking-[-0.04em] uppercase`}
      >
        MAKE IT YOUR
        <br className="sm:hidden" /> LIKED OUTFITS
      </h2>
    </section>
  );
};

export default MilosBGAnimatedSlogan;