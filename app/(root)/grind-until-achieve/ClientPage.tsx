"use client";

import Container from "@/components/mbg-components/Container";
import { H2 } from "@/components/mbg-components/H2";
import { H3 } from "@/components/mbg-components/H3";
import Separator from "@/components/mbg-components/Separator";
import { GrindUntilAchieve2 } from "@/images";
import Image from "next/image";

import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";

import { BiSolidBasketball } from "react-icons/bi";
import {
  FiBookOpen,
  FiDownload,
  FiExternalLink,
  FiShoppingBag,
} from "react-icons/fi";

// -----------------------------------------------------------------------------
// LANGUAGE
// -----------------------------------------------------------------------------

const LANG_STORAGE_KEY = "mbg.grind-until-achieve.lang" as const;

type Lang = "en" | "fr";

const useLang = (): [Lang, (lang: Lang) => void] => {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const fromUrl = params.get("lang") as Lang | null;
    const fromStorage =
      (localStorage.getItem(LANG_STORAGE_KEY) as Lang | null) ?? null;

    setLang(fromUrl || fromStorage || "en");
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    params.set("lang", lang);

    const url = `${window.location.pathname}?${params.toString()}${
      window.location.hash
    }`;

    window.history.replaceState({}, "", url);

    localStorage.setItem(LANG_STORAGE_KEY, lang);

    document.documentElement.setAttribute("lang", lang);
  }, [lang]);

  return [lang, setLang];
};

// -----------------------------------------------------------------------------
// PURCHASE URLS
// -----------------------------------------------------------------------------
//
// .env.local
//
// NEXT_PUBLIC_GRIND_BOOK_URL=https://...
// NEXT_PUBLIC_GRIND_EBOOK_URL=https://...
//
// BOOK     = Physical book / PayPal
// EBOOK    = Amazon / Kindle / other platform
// -----------------------------------------------------------------------------

const BOOK_URL = process.env.NEXT_PUBLIC_GRIND_BOOK_URL;
const EBOOK_URL = process.env.NEXT_PUBLIC_GRIND_EBOOK_URL;

// -----------------------------------------------------------------------------
// SECTIONS
// -----------------------------------------------------------------------------

const IDS = [
  "story",
  "progression",
  "chapters",
  "book",
  "ebook",
] as const;

const tocItems = {
  en: [
    ["1.", "The direction", IDS[0]],
    ["2.", "From 1 to 5", IDS[1]],
    ["3.", "The five chapters", IDS[2]],
    ["4.", "Physical book", IDS[3]],
    ["5.", "Ebook", IDS[4]],
  ],

  fr: [
    ["1.", "La direction", IDS[0]],
    ["2.", "De 1 à 5", IDS[1]],
    ["3.", "Les cinq chapitres", IDS[2]],
    ["4.", "Livre physique", IDS[3]],
    ["5.", "Ebook", IDS[4]],
  ],
} as const;

// -----------------------------------------------------------------------------
// TITLE
// -----------------------------------------------------------------------------
const GrindTitle = ({
  className = "",
}: {
  className?: string;
}) => {
  return (
    <span
      className={className}
      aria-label="GRIND UNTIL ACHIEVE"
    >
      GR
      <span className="text-mbg-green">I</span>
      ND{" "}
      <span className="text-mbg-green">UNTIL</span>
      {" "}ACHIE
      <span className="text-mbg-green">V</span>
      E
    </span>
  );
};
// -----------------------------------------------------------------------------
// TABLE OF CONTENTS
// -----------------------------------------------------------------------------

const Toc: React.FC<{
  activeId: string | null;
  lang: Lang;
}> = ({ activeId, lang }) => {
  return (
    <nav
      aria-label={lang === "fr" ? "Sommaire" : "Table of contents"}
      className="
        rounded-xs
        bg-mbg-black
        p-4
        ring-1
        ring-mbg-black/7
      "
    >
      <p
        className="
          mb-3
          text-base
          font-bold
          uppercase
          tracking-wide
          text-mbg-green
        "
      >
        {lang === "fr" ? "Sommaire" : "Summary"}
      </p>

      <ol
        className="
          space-y-1
          text-xs
          font-semibold
          uppercase
          leading-6
          text-mbg-darkgrey
        "
      >
        {tocItems[lang].map(([number, label, id]) => (
          <li key={id}>
            <a
              href={`#${id}`}
              className={`
                transition
                hover:text-mbg-lightgrey
                hover:underline
                ${
                  activeId === id
                    ? "text-mbg-green"
                    : ""
                }
              `}
            >
              <span className="mr-2 tabular-nums">
                {number}
              </span>

              {label}
            </a>
          </li>
        ))}
      </ol>

      <Separator className="my-4 bg-mbg-white/10" />

      <div className="text-[11px] uppercase leading-5 text-mbg-lightgrey">
        <p>GRIND</p>
        <p>RESILIENCE</p>
        <p>CONSISTENCY</p>
        <p>FOCUS</p>
        <p>ACHIEVE</p>
      </div>
    </nav>
  );
};

// -----------------------------------------------------------------------------
// COLLAPSIBLE SECTION
// -----------------------------------------------------------------------------

type SectionProps = {
  id: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  forceOpen?: boolean;
};

const Section: React.FC<SectionProps> = ({
  id,
  title,
  children,
  defaultOpen = true,
  forceOpen,
}) => {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (typeof forceOpen === "boolean") {
      setOpen(forceOpen);
    }
  }, [forceOpen]);

  return (
    <section
      id={id}
      className="
        scroll-mt-20
        text-xs
        print:break-before-page
      "
    >
      <details
        open={open}
        onToggle={(event) => {
          if (typeof forceOpen !== "boolean") {
            setOpen(event.currentTarget.open);
          }
        }}
        className="
          group
          rounded-xs
          border
          border-mbg-black/7
          bg-mbg-white
          transition
          open:bg-mbg-rgbablank
        "
      >
        <summary
          className="
            flex
            w-full
            cursor-pointer
            select-none
            items-center
            justify-between
            gap-3
            px-4
            py-3
          "
        >
          <H3 className="m-0 text-base text-mbg-green">
            {title}
          </H3>

          <BiSolidBasketball
            aria-hidden
            className="
              mbg-icon
              text-mbg-darkgrey
              transition-transform
              group-open:rotate-180
            "
          />
        </summary>

        <Separator className="bg-mbg-black/10" />

        <div
          className="
            flex
            flex-col
            items-start
            gap-4
            px-4
            py-5
            text-mbg-black/95
          "
        >
          {children}
        </div>
      </details>
    </section>
  );
};

// -----------------------------------------------------------------------------
// CHAPTER CARD
// -----------------------------------------------------------------------------

type ChapterCardProps = {
  number: string;
  name: string;
  sentence: string;
};

const ChapterCard = ({
  number,
  name,
  sentence,
}: ChapterCardProps) => {
  return (
    <div
      className="
        group
        relative
        overflow-hidden
        border
        border-mbg-black/10
        bg-mbg-white
        p-4
        transition
        hover:border-mbg-green
      "
    >
      <div
        className="
          mb-5
          flex
          items-start
          justify-between
          gap-3
        "
      >
        <span
          className="
            text-3xl
            font-bold
            leading-none
            text-mbg-green
          "
        >
          {number}
        </span>

        <BiSolidBasketball
          className="
            text-lg
            text-mbg-black/15
            transition
            group-hover:text-mbg-green
          "
        />
      </div>

      <p
        className="
          mb-2
          text-sm
          font-bold
          uppercase
          tracking-wide
          text-mbg-black
        "
      >
        {name}
      </p>

      <p className="text-xs leading-5 text-mbg-darkgrey">
        {sentence}
      </p>
    </div>
  );
};

// -----------------------------------------------------------------------------
// PURCHASE BUTTON
// -----------------------------------------------------------------------------

type PurchaseButtonProps = {
  href?: string;
  children: React.ReactNode;
  icon: React.ReactNode;
};

const PurchaseButton = ({
  href,
  children,
  icon,
}: PurchaseButtonProps) => {
  if (!href) {
    return (
      <span
        className="
          inline-flex
          cursor-not-allowed
          items-center
          gap-2
          border
          border-mbg-black/15
          px-4
          py-2.5
          text-xs
          font-semibold
          uppercase
          text-mbg-darkgrey
          opacity-50
        "
      >
        {icon}
        {children}
      </span>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="
        inline-flex
        items-center
        gap-2
        bg-mbg-black
        px-4
        py-2.5
        text-xs
        font-semibold
        uppercase
        text-mbg-white
        transition
        hover:bg-mbg-green
      "
    >
      {icon}

      {children}

      <FiExternalLink />
    </a>
  );
};

// -----------------------------------------------------------------------------
// CONTENT EN
// -----------------------------------------------------------------------------

const ContentEN: React.FC<{
  allOpen: boolean | null;
}> = ({ allOpen }) => {
  return (
    <>
      <Section
        id="story"
        forceOpen={allOpen ?? undefined}
        title="1. The direction"
      >
        <p className="max-w-2xl leading-6">
          <strong>GRIND UNTIL ACHIEVE</strong> is the direction
          behind Milos BG. It is a way of understanding
          progression: start, endure, repeat, focus, achieve —
          then begin again.
        </p>

        <div
          className="
            grid
            w-full
            gap-px
            overflow-hidden
            border
            border-mbg-black/10
            bg-mbg-black/10
            sm:grid-cols-2
          "
        >
          {[
            ["Basketball", "provides the mindset."],
            ["Craftsmanship", "provides the material."],
            ["Design", "provides the language."],
            ["The five chapters", "provide the structure."],
          ].map(([title, text]) => (
            <div
              key={title}
              className="bg-mbg-white p-4"
            >
              <p className="font-bold uppercase text-mbg-black">
                {title}
              </p>

              <p className="mt-1 text-mbg-darkgrey">
                {text}
              </p>
            </div>
          ))}
        </div>

        <div
          className="
            w-full
            border-l-4
            border-mbg-green
            bg-mbg-black
            p-5
            text-mbg-white
          "
        >
          <p
            className="
              text-sm
              font-semibold
              uppercase
              tracking-wide
            "
          >
            GRIND UNTIL ACHIEVE provides the direction.
          </p>
        </div>
      </Section>

      <Section
        id="progression"
        forceOpen={allOpen ?? undefined}
        title="2. From 1 to 5"
      >
        <p className="leading-6">
          Progress does not happen in one movement. It happens
          through five stages.
        </p>

        <div className="grid w-full gap-3 sm:grid-cols-5">
          {[
            ["01", "START"],
            ["02", "ENDURE"],
            ["03", "REPEAT"],
            ["04", "FOCUS"],
            ["05", "ACHIEVE"],
          ].map(([number, label]) => (
            <div
              key={number}
              className="
                flex
                min-h-28
                flex-col
                justify-between
                border
                border-mbg-black/10
                p-4
              "
            >
              <span className="text-2xl font-bold text-mbg-green">
                {number}
              </span>

              <span className="font-bold uppercase">
                {label}
              </span>
            </div>
          ))}
        </div>

        <p className="leading-6">
          Achievement is not presented as the end of the
          journey. Once a goal is reached, the experience
          becomes the foundation for the next cycle.
        </p>
      </Section>

      <Section
        id="chapters"
        forceOpen={allOpen ?? undefined}
        title="3. The five chapters"
      >
        <div className="grid w-full gap-3 md:grid-cols-2 xl:grid-cols-5">
          <ChapterCard
            number="1"
            name="GRIND"
            sentence="Decide to begin."
          />

          <ChapterCard
            number="2"
            name="RESILIENCE"
            sentence="Continue after impact or failure."
          />

          <ChapterCard
            number="3"
            name="CONSISTENCY"
            sentence="Transform effort into habit."
          />

          <ChapterCard
            number="4"
            name="FOCUS"
            sentence="Give the accumulated force a direction."
          />

          <ChapterCard
            number="5"
            name="ACHIEVE"
            sentence="Reach, understand, then begin again."
          />
        </div>
      </Section>

      <Section
        id="book"
        forceOpen={allOpen ?? undefined}
        title="4. Physical book"
      >
        <div
          className="
            grid
            w-full
            overflow-hidden
            border
            border-mbg-black/10
            lg:grid-cols-[220px_1fr]
          "
        >
          <div
            className="
              flex
              min-h-[280px]
              items-center
              justify-center
              bg-mbg-black
              p-8
            "
          >
            <div className="text-center text-mbg-white">
              <FiBookOpen className="mx-auto mb-5 text-3xl text-mbg-green" />

              <p className="text-lg font-bold uppercase leading-tight">
                <GrindTitle />
              </p>

              <p
                className="
                  mt-4
                  text-[10px]
                  uppercase
                  tracking-[0.3em]
                  text-mbg-lightgrey
                "
              >
                Milos BG
              </p>
            </div>
          </div>

          <div
            className="
              flex
              flex-col
              justify-center
              gap-4
              bg-mbg-white
              p-6
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-mbg-green
                "
              >
                Physical edition
              </p>

              <h4
                className="
                  mt-1
                  text-xl
                  font-bold
                  uppercase
                  text-mbg-black
                "
              >
                GRIND UNTIL ACHIEVE
              </h4>
            </div>

            <p className="max-w-xl leading-6 text-mbg-darkgrey">
              A physical object dedicated to the philosophy
              behind Milos BG and its five-stage progression.
              Designed to be read, kept and revisited as the
              journey evolves.
            </p>

            <div>
              <PurchaseButton
                href={BOOK_URL}
                icon={<FiShoppingBag />}
              >
                Buy the book
              </PurchaseButton>
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="ebook"
        forceOpen={allOpen ?? undefined}
        title="5. Ebook"
      >
        <div
          className="
            flex
            w-full
            flex-col
            justify-between
            gap-6
            border
            border-mbg-black/10
            bg-mbg-black
            p-6
            text-mbg-white
            md:flex-row
            md:items-center
          "
        >
          <div className="max-w-2xl">
            <div
              className="
                mb-4
                inline-flex
                items-center
                gap-2
                text-mbg-green
              "
            >
              <FiDownload />

              <span
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                "
              >
                Digital edition
              </span>
            </div>

            <h4 className="text-xl font-bold uppercase">
              Read GRIND UNTIL ACHIEVE digitally
            </h4>

            <p
              className="
                mt-3
                max-w-xl
                text-xs
                leading-6
                text-mbg-lightgrey
              "
            >
              Access the philosophy, the five chapters and the
              progression model wherever you are.
            </p>
          </div>

          <div className="shrink-0">
            <PurchaseButton
              href={EBOOK_URL}
              icon={<FiDownload />}
            >
              Get the ebook
            </PurchaseButton>
          </div>
        </div>
      </Section>
    </>
  );
};

// -----------------------------------------------------------------------------
// CONTENT FR
// -----------------------------------------------------------------------------

const ContentFR: React.FC<{
  allOpen: boolean | null;
}> = ({ allOpen }) => {
  return (
    <>
      <Section
        id="story"
        forceOpen={allOpen ?? undefined}
        title="1. La direction"
      >
        <p className="max-w-2xl leading-6">
          <strong>GRIND UNTIL ACHIEVE</strong> représente la
          direction de Milos BG. C&apos;est une manière de
          comprendre la progression : commencer, résister,
          répéter, se concentrer, accomplir — puis recommencer.
        </p>

        <div
          className="
            grid
            w-full
            gap-px
            overflow-hidden
            border
            border-mbg-black/10
            bg-mbg-black/10
            sm:grid-cols-2
          "
        >
          {[
            ["Le basketball", "fournit la mentalité."],
            ["L’artisanat", "fournit la matière."],
            ["Le design", "fournit le langage."],
            ["Les cinq chapitres", "fournissent la structure."],
          ].map(([title, text]) => (
            <div
              key={title}
              className="bg-mbg-white p-4"
            >
              <p className="font-bold uppercase text-mbg-black">
                {title}
              </p>

              <p className="mt-1 text-mbg-darkgrey">
                {text}
              </p>
            </div>
          ))}
        </div>

        <div
          className="
            w-full
            border-l-4
            border-mbg-green
            bg-mbg-black
            p-5
            text-mbg-white
          "
        >
          <p
            className="
              text-sm
              font-semibold
              uppercase
              tracking-wide
            "
          >
            GRIND UNTIL ACHIEVE fournit la direction.
          </p>
        </div>
      </Section>

      <Section
        id="progression"
        forceOpen={allOpen ?? undefined}
        title="2. De 1 à 5"
      >
        <p className="leading-6">
          La progression ne se fait pas en un seul mouvement.
          Elle se construit à travers cinq étapes.
        </p>

        <div className="grid w-full gap-3 sm:grid-cols-5">
          {[
            ["01", "COMMENCER"],
            ["02", "RÉSISTER"],
            ["03", "RÉPÉTER"],
            ["04", "ORIENTER"],
            ["05", "ACCOMPLIR"],
          ].map(([number, label]) => (
            <div
              key={number}
              className="
                flex
                min-h-28
                flex-col
                justify-between
                border
                border-mbg-black/10
                p-4
              "
            >
              <span className="text-2xl font-bold text-mbg-green">
                {number}
              </span>

              <span className="font-bold uppercase">
                {label}
              </span>
            </div>
          ))}
        </div>

        <p className="leading-6">
          ACHIEVE n&apos;est pas présenté comme une fin.
          Lorsqu&apos;un objectif est atteint, ce qui a été
          appris devient la base du prochain cycle.
        </p>
      </Section>

      <Section
        id="chapters"
        forceOpen={allOpen ?? undefined}
        title="3. Les cinq chapitres"
      >
        <div className="grid w-full gap-3 md:grid-cols-2 xl:grid-cols-5">
          <ChapterCard
            number="1"
            name="GRIND"
            sentence="Décider de commencer."
          />

          <ChapterCard
            number="2"
            name="RESILIENCE"
            sentence="Continuer après le choc ou l’échec."
          />

          <ChapterCard
            number="3"
            name="CONSISTENCY"
            sentence="Transformer l’effort en habitude."
          />

          <ChapterCard
            number="4"
            name="FOCUS"
            sentence="Orienter correctement cette force."
          />

          <ChapterCard
            number="5"
            name="ACHIEVE"
            sentence="Atteindre, comprendre, puis repartir."
          />
        </div>
      </Section>

      <Section
        id="book"
        forceOpen={allOpen ?? undefined}
        title="4. Livre physique"
      >
        <div
          className="
            grid
            w-full
            overflow-hidden
            border
            border-mbg-black/10
            lg:grid-cols-[220px_1fr]
          "
        >
          <div
            className="
              flex
              min-h-[280px]
              items-center
              justify-center
              bg-mbg-black
              p-8
            "
          >
            <div className="text-center text-mbg-white">
              <FiBookOpen className="mx-auto mb-5 text-3xl text-mbg-green" />

              <p className="text-lg font-bold uppercase leading-tight">
                <GrindTitle />
              </p>

              <p
                className="
                  mt-4
                  text-[10px]
                  uppercase
                  tracking-[0.3em]
                  text-mbg-lightgrey
                "
              >
                Milos BG
              </p>
            </div>
          </div>

          <div
            className="
              flex
              flex-col
              justify-center
              gap-4
              bg-mbg-white
              p-6
            "
          >
            <div>
              <p
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-mbg-green
                "
              >
                Édition physique
              </p>

              <h4
                className="
                  mt-1
                  text-xl
                  font-bold
                  uppercase
                  text-mbg-black
                "
              >
                GRIND UNTIL ACHIEVE
              </h4>
            </div>

            <p className="max-w-xl leading-6 text-mbg-darkgrey">
              Un objet physique consacré à la philosophie de
              Milos BG et à sa progression en cinq étapes. Un
              livre conçu pour être lu, conservé et revisité à
              mesure que le parcours évolue.
            </p>

            <div>
              <PurchaseButton
                href={BOOK_URL}
                icon={<FiShoppingBag />}
              >
                Acheter le livre
              </PurchaseButton>
            </div>
          </div>
        </div>
      </Section>

      <Section
        id="ebook"
        forceOpen={allOpen ?? undefined}
        title="5. Ebook"
      >
        <div
          className="
            flex
            w-full
            flex-col
            justify-between
            gap-6
            border
            border-mbg-black/10
            bg-mbg-black
            p-6
            text-mbg-white
            md:flex-row
            md:items-center
          "
        >
          <div className="max-w-2xl">
            <div
              className="
                mb-4
                inline-flex
                items-center
                gap-2
                text-mbg-green
              "
            >
              <FiDownload />

              <span
                className="
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                "
              >
                Édition numérique
              </span>
            </div>

            <h4 className="text-xl font-bold uppercase">
              Lire GRIND UNTIL ACHIEVE en numérique
            </h4>

            <p
              className="
                mt-3
                max-w-xl
                text-xs
                leading-6
                text-mbg-lightgrey
              "
            >
              Retrouvez la philosophie, les cinq chapitres et
              la progression de 1 à 5 où que vous soyez.
            </p>
          </div>

          <div className="shrink-0">
            <PurchaseButton
              href={EBOOK_URL}
              icon={<FiDownload />}
            >
              Obtenir l&apos;ebook
            </PurchaseButton>
          </div>
        </div>
      </Section>
    </>
  );
};

// -----------------------------------------------------------------------------
// PAGE
// -----------------------------------------------------------------------------

const ClientPage: React.FC = () => {
  const [lang, setLang] = useLang();

  const [allOpen, setAllOpen] =
    useState<boolean | null>(null);

  const [activeId, setActiveId] =
    useState<string | null>(null);

  const [showTop, setShowTop] = useState(false);

  // ---------------------------------------------------------------------------
  // BACK TO TOP
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const onScroll = () => {
      setShowTop(window.scrollY > 400);
    };

    onScroll();

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  // ---------------------------------------------------------------------------
  // ACTIVE TOC SECTION
  // ---------------------------------------------------------------------------

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) =>
              b.intersectionRatio - a.intersectionRatio
          )[0];

        const id = (visible?.target as HTMLElement)?.id;

        if (id) {
          setActiveId(id);
        }
      },
      {
        rootMargin: "-20% 0px -60% 0px",
        threshold: [0.2, 0.5, 0.75],
      }
    );

    IDS.forEach((id) => {
      const element = document.getElementById(id);

      if (element) {
        observer.observe(element);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  const allOpenBool = allOpen === true;

  const ui = useMemo(
    () => ({
      breadcrumbHome:
        lang === "fr" ? "Accueil" : "Home",

      breadcrumbCurrent: "GRIND UNTIL ACHIEVE",

      backToShop:
        lang === "fr"
          ? "← Retour à la boutique"
          : "← Back to shop",

      expandAll:
        lang === "fr"
          ? "Déplier tout"
          : "Expand all",

      collapseAll:
        lang === "fr"
          ? "Replier tout"
          : "Collapse all",

      pageTitle: "GRIND UNTIL ACHIEVE",

      intro:
        lang === "fr"
          ? "Une histoire de progression, écrite un chapitre à la fois."
          : "A story of progression, written one chapter at a time.",

      philosophy:
        lang === "fr"
          ? "Commencer. Résister. Répéter. Se concentrer. Accomplir. Puis repartir."
          : "Start. Endure. Repeat. Focus. Achieve. Then begin again.",

      lastUpdateLabel:
        lang === "fr"
          ? "Dernière mise à jour :"
          : "Last update:",

      rights:
        lang === "fr"
          ? "Tous droits réservés"
          : "All rights reserved",

      breadcrumbAria:
        lang === "fr"
          ? "Fil d'Ariane"
          : "Breadcrumb",
    }),
    [lang]
  );

  return (
    <Container className="mt-4">
      {/* ------------------------------------------------------------------ */}
      {/* TOP BAR */}
      {/* ------------------------------------------------------------------ */}

      <div
        className="
          mb-4
          flex
          flex-wrap
          items-center
          justify-between
          gap-3
          bg-mbg-black/7
          px-4
          py-2
        "
      >
        <nav
          aria-label={ui.breadcrumbAria}
          className="text-[11px] text-mbg-darkgrey"
        >
          <ol className="flex items-center gap-2">
            <li>
              <Link
                href="/"
                className="
                  font-medium
                  uppercase
                  text-mbg-green
                "
              >
                {ui.breadcrumbHome}
              </Link>
            </li>

            <li aria-hidden>|</li>

            <li
              className="
                font-semibold
                uppercase
                text-mbg-black
              "
            >
              {ui.breadcrumbCurrent}
            </li>
          </ol>
        </nav>

        <div className="flex items-center gap-2">
          {/* LANGUAGE */}

          <div
            className="
              inline-flex
              overflow-hidden
              rounded-xs
              border
              border-mbg-green
            "
          >
            <button
              type="button"
              onClick={() => setLang("en")}
              aria-pressed={lang === "en"}
              className={`
                px-3
                py-1.5
                text-[12px]
                font-semibold
                uppercase
                transition
                ${
                  lang === "en"
                    ? "bg-mbg-black text-mbg-white"
                    : "text-mbg-green hover:bg-mbg-green/10"
                }
              `}
            >
              EN
            </button>

            <button
              type="button"
              onClick={() => setLang("fr")}
              aria-pressed={lang === "fr"}
              className={`
                px-3
                py-1.5
                text-[12px]
                font-semibold
                uppercase
                transition
                ${
                  lang === "fr"
                    ? "bg-mbg-black text-mbg-white"
                    : "text-mbg-green hover:bg-mbg-green/10"
                }
              `}
            >
              FR
            </button>
          </div>

          <Link
            href="/"
            className="
              inline-flex
              items-center
              border
              border-mbg-green
              bg-mbg-rgbablank
              px-3
              py-1.5
              text-[12px]
              font-semibold
              uppercase
              text-mbg-green
              transition
              hover:bg-mbg-green
              hover:text-mbg-white
            "
          >
            {ui.backToShop}
          </Link>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* PAGE TITLE */}
      {/* ------------------------------------------------------------------ */}

      <H2>
        <GrindTitle />
      </H2>

      <div
        className="
          mb-4
          mt-2
          flex
          flex-wrap
          items-center
          gap-2
        "
      >
        <Separator className="flex-1 bg-mbg-black" />

        <button
          type="button"
          onClick={() =>
            setAllOpen(allOpenBool ? false : true)
          }
          className="
            border
            border-mbg-green
            px-3
            py-1.5
            text-[12px]
            font-semibold
            uppercase
            text-mbg-green
            transition
            hover:bg-mbg-green
            hover:text-mbg-white
          "
        >
          {allOpenBool
            ? ui.collapseAll
            : ui.expandAll}
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* HERO */}
      {/* ------------------------------------------------------------------ */}

      <header
        className="
          relative
          mb-6
          overflow-hidden
          bg-mbg-black
          px-5
          py-10
          text-mbg-white
          md:px-8
          md:py-14
        "
      >
        <BiSolidBasketball
          aria-hidden
          className="
            absolute
            -right-10
            -top-12
            text-[220px]
            text-mbg-white/[0.035]
          "
        />

        <div className="relative z-10 max-w-3xl">
          <p
            className="
              mb-4
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.35em]
              text-mbg-green
            "
          >
            Milos BG · Book / Ebook
          </p>

          <h1
            className="
              text-3xl
              font-bold
              uppercase
              leading-none
              tracking-tight
              sm:text-4xl
              lg:text-5xl
            "
          >
            <GrindTitle />
          </h1>

          <p
            className="
              mt-5
              text-sm
              font-medium
              uppercase
              tracking-wide
              text-mbg-lightgrey
            "
          >
            {ui.intro}
          </p>

          <p
            className="
              mt-3
              max-w-2xl
              text-xs
              leading-6
              text-mbg-lightgrey/80
            "
          >
            {ui.philosophy}
          </p>

          <div className="mt-8 flex items-center gap-2">
            {["1", "2", "3", "4", "5"].map(
              (number, index) => (
                <React.Fragment key={number}>
                  <span
                    className={`
                      flex
                      size-8
                      items-center
                      justify-center
                      border
                      text-xs
                      font-bold
                      ${
                        number === "1" ||
                        number === "5"
                          ? "border-mbg-green bg-mbg-green text-mbg-white"
                          : "border-mbg-white/20 text-mbg-white"
                      }
                    `}
                  >
                    {number}
                  </span>

                  {index < 4 && (
                    <span className="h-px w-4 bg-mbg-white/20" />
                  )}
                </React.Fragment>
              )
            )}
          </div>
        </div>
      </header>

      {/* ------------------------------------------------------------------ */}
      {/* MOBILE TOC */}
      {/* ------------------------------------------------------------------ */}

      <div className="mb-6 lg:hidden">
        <Toc
          activeId={activeId}
          lang={lang}
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* CONTENT */}
      {/* ------------------------------------------------------------------ */}

      <div className="grid gap-6 lg:grid-cols-12">
        <aside className="hidden lg:col-span-4 lg:block">
          <div className="lg:sticky lg:top-4">
            <Toc
              activeId={activeId}
              lang={lang}
            />
          </div>
        </aside>

        <div className="space-y-6 lg:col-span-8">
          {lang === "en" ? (
            <ContentEN allOpen={allOpen} />
          ) : (
            <ContentFR allOpen={allOpen} />
          )}

          {/* -------------------------------------------------------------- */}
          {/* FINAL MANTRA */}
          {/* -------------------------------------------------------------- */}

          <div
            className="
              mt-10
              border
              border-mbg-green
              bg-mbg-white
              px-6
              py-10
              text-center
              
            "
          >
                <Image
                  src={GrindUntilAchieve2}
                  alt="GRIND UNTIL ACHIEVE"
                  width={32}
                  height={32}
                  priority
                  className="
    h-5
    w-5
    cursor-pointer
    object-contain
    transition-opacity
    duration-300
    group-hover:opacity-80
  "
                />

            <p
              className="
                text-xl
                font-bold
                uppercase
                tracking-tight
                text-mbg-black
              "
            >
              <GrindTitle />
            </p>

            <p
              className="
                mt-3
                text-[10px]
                font-semibold
                uppercase
                tracking-[0.3em]
                text-mbg-darkgrey
              "
            >
              From chapter <strong className="text-mbg-green">I</strong> to <strong className="text-mbg-green">V</strong> 
            </p>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* FOOTER */}
          {/* -------------------------------------------------------------- */}

          <footer
            className="
              mt-12
              border-t
              pt-6
              text-[10px]
              text-mbg-green
            "
          >
            <p>
              {ui.lastUpdateLabel}&nbsp;16/09/2026
            </p>

            <p className="mt-2">
              &copy; {new Date().getFullYear()} Milos BG
              {" - "}
              {ui.rights}
            </p>
          </footer>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* BACK TO TOP */}
      {/* ------------------------------------------------------------------ */}

      {showTop && (
        <button
          type="button"
          aria-label={
            lang === "fr"
              ? "Revenir en haut"
              : "Back to top"
          }
          onClick={() =>
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            })
          }
          className="
            fixed
            bottom-6
            right-6
            z-40
            border
            border-mbg-green
            bg-mbg-white/90
            px-3
            py-2
            text-[12px]
            font-semibold
            uppercase
            text-mbg-green
            shadow-sm
            backdrop-blur
            transition
            hover:bg-mbg-green
            hover:text-mbg-white
          "
        >
          ↑ {lang === "fr" ? "Haut" : "Top"}
        </button>
      )}
    </Container>
  );
};

export default ClientPage;