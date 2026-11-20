import React from "react";
import styles from "./MilosBGAnimatedSlogan.module.css";

const MilosBGAnimatedSlogan = () => {
  return (
    <section
      aria-label="Milos BG slogan"
      className="mt-10 flex min-h-[100px] w-full items-center justify-center bg-[#030303] px-3 py-4 font-kanit sm:min-h-[100px] sm:px-8 lg:min-h-[190px]"
    >
      <h2
        aria-label="MAKE IT YOUR LIKED OUTFITS"
        className={`
          ${styles.sloganText}
          w-full
          whitespace-nowrap
          text-center
          text-[4.6vw]
          leading-none
          font-extrabold
          tracking-[-0.055em]
          uppercase
          sm:text-[4.5vw]
          lg:text-[4.6rem]
        `}
      >
        {/* Only M · I · L · O · S flicker; keep all words intact. */}
        <span aria-hidden="true" className="inline-block whitespace-nowrap">
          <span className={styles.neon}>M</span>AKE
        </span>{" "}
        <span aria-hidden="true" className="inline-block whitespace-nowrap">
          <span className={styles.neon}>I</span>T
        </span>{" "}
        <span aria-hidden="true" className="inline-block whitespace-nowrap">
          YOUR
        </span>{" "}
        <span aria-hidden="true" className="inline-block whitespace-nowrap">
          <span className={styles.neon}>L</span>IKED
        </span>{" "}
        <span aria-hidden="true" className="inline-block whitespace-nowrap">
          <span className={styles.neon}>O</span>UTFIT
          <span className={styles.neon}>S</span>
        </span>
      </h2>
    </section>
  );
};

export default MilosBGAnimatedSlogan;
