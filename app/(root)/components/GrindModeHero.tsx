// components/home/GrindModeHero.tsx

import Image from "next/image";
import Link from "next/link";

import {
  normalizeStoreLanguage,
  type StoreLanguage,
  withStoreLanguage,
} from "@/lib/store-language";
import { GrindUntilAchieve2 } from "@/images";

type GrindModeHeroProps = {
  lang?: StoreLanguage;
};

const copy = {
  en: {
    eyebrow: "GRIND UNTIL ACHIEVE",
    title: "ENTER GRIND MODE",
    description:
      "Challenge yourself. Build better habits. Learn to return. Keep moving.",
    primary: "ENTER GRIND MODE",
    secondary: "DISCOVER THE JOURNEY",
    chapters: "5 CHAPTERS",
    progression: "1 JOURNEY",
  },

  fr: {
    eyebrow: "GRIND UNTIL ACHIEVE",
    title: "ENTRE DANS GRIND MODE",
    description:
      "Challenge-toi. Construis de meilleures habitudes. Apprends à revenir. Continue d’avancer.",
    primary: "ENTRER DANS GRIND MODE",
    secondary: "DÉCOUVRIR LE PARCOURS",
    chapters: "5 CHAPITRES",
    progression: "1 PARCOURS",
  },
} satisfies Record<
  StoreLanguage,
  {
    eyebrow: string;
    title: string;
    description: string;
    primary: string;
    secondary: string;
    chapters: string;
    progression: string;
  }
>;

export default function GrindModeHero({
  lang: rawLang = "en",
}: GrindModeHeroProps) {
  const lang = normalizeStoreLanguage(rawLang);
  const t = copy[lang];

  return (
    <section
      aria-labelledby="grind-mode-hero-title"
      className="
        relative
        isolate
        w-full
        overflow-hidden
        bg-black
        text-white
      "
    >
      {/* BACKGROUND */}
      <div className="absolute inset-0 -z-20">
        <Image
          src={GrindUntilAchieve2}
          alt=""
          fill
          priority
          sizes="100vw"
          className="
            object-cover
            object-center
          "
        />
      </div>

      {/* DARK GRADIENT FOR TEXT READABILITY */}
      <div
        aria-hidden="true"
        className="
          absolute
          inset-0
          -z-10
          bg-gradient-to-r
          from-black
          via-black/75
          to-black/10
        "
      />

      {/* SLIGHT BOTTOM FADE */}
      <div
        aria-hidden="true"
        className="
          absolute
          inset-x-0
          bottom-0
          -z-10
          h-32
          bg-gradient-to-t
          from-black
          to-transparent
        "
      />

      <div
        className="
          mx-auto
          flex
          min-h-[420px]
          w-full
          max-w-[1600px]
          items-center
          px-5
          py-16
          sm:px-8
          md:min-h-[480px]
          md:px-12
          lg:min-h-[520px]
          lg:px-16
          xl:px-20
        "
      >
        <div className="w-full max-w-[720px]">
          {/* EYEBROW */}
          <div className="mb-5 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="h-px w-8 bg-mbg-green"
            />

            <p
              className="
                text-[9px]
                font-bold
                uppercase
                tracking-[0.3em]
                text-mbg-green
                sm:text-[10px]
              "
            >
              {t.eyebrow}
            </p>
          </div>

          {/* TITLE */}
          <h2
            id="grind-mode-hero-title"
            className="
              max-w-[700px]
              text-[42px]
              font-black
              uppercase
              leading-[0.92]
              tracking-[-0.04em]
              text-white
              sm:text-[54px]
              md:text-[66px]
              lg:text-[78px]
            "
          >
            {t.title}
          </h2>

          {/* DESCRIPTION */}
          <p
            className="
              mt-6
              max-w-[560px]
              text-sm
              font-medium
              leading-6
              text-white/70
              sm:text-[15px]
            "
          >
            {t.description}
          </p>

          {/* CTA */}
          <div
            className="
              mt-8
              flex
              flex-col
              gap-3
              sm:flex-row
              sm:items-center
            "
          >
            <Link
              href={withStoreLanguage("/grind-mode", lang)}
              className="
                inline-flex
                min-h-12
                items-center
                justify-center
                border
                border-mbg-green
                bg-mbg-green
                px-6
                text-[10px]
                font-black
                uppercase
                tracking-[0.18em]
                text-white
                transition
                duration-300
                hover:bg-transparent
                hover:text-mbg-green
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-mbg-green
                focus-visible:ring-offset-2
                focus-visible:ring-offset-black
              "
            >
              {t.primary}

              <span
                aria-hidden="true"
                className="ml-4 text-base leading-none"
              >
                →
              </span>
            </Link>

            <Link
              href={withStoreLanguage("/the-background", lang)}
              className="
                inline-flex
                min-h-12
                items-center
                justify-center
                border
                border-white/25
                bg-black/20
                px-6
                text-[10px]
                font-bold
                uppercase
                tracking-[0.18em]
                text-white
                backdrop-blur-sm
                transition
                duration-300
                hover:border-white
                hover:bg-white
                hover:text-black
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-white
                focus-visible:ring-offset-2
                focus-visible:ring-offset-black
              "
            >
              {t.secondary}
            </Link>
          </div>

          {/* MINI GAME LANGUAGE */}
          <div
            className="
              mt-10
              flex
              items-center
              gap-5
              border-t
              border-white/15
              pt-5
            "
          >
            <div>
              <p className="text-xl font-black text-white">
                05
              </p>

              <p
                className="
                  mt-1
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-white/45
                "
              >
                {t.chapters}
              </p>
            </div>

            <div className="h-8 w-px bg-white/15" />

            <div>
              <p className="text-xl font-black text-mbg-green">
                01
              </p>

              <p
                className="
                  mt-1
                  text-[8px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                  text-white/45
                "
              >
                {t.progression}
              </p>
            </div>

            <div className="h-8 w-px bg-white/15" />

            <div className="hidden sm:block">
              <p
                className="
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[0.18em]
                  text-white/50
                "
              >
                GRIND · RESILIENCE · CONSISTENCY · FOCUS · ACHIEVE
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DECORATIVE CHAPTER INDEX */}
      <div
        aria-hidden="true"
        className="
          absolute
          bottom-6
          right-6
          hidden
          text-right
          lg:block
        "
      >
        {[
          "01 GRIND",
          "02 RESILIENCE",
          "03 CONSISTENCY",
          "04 FOCUS",
          "05 ACHIEVE",
        ].map((chapter) => (
          <p
            key={chapter}
            className="
              text-[8px]
              font-bold
              uppercase
              tracking-[0.2em]
              text-white/25
            "
          >
            {chapter}
          </p>
        ))}
      </div>
    </section>
  );
}