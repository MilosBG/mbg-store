"use client";

import Container from "@/components/mbg-components/Container";
import { GrindUntilAchieve } from "@/images";
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
  FiPlus,
  FiArrowUpRight,
  FiArrowUp,
} from "react-icons/fi";

// -----------------------------------------------------------------------------
// LANGUAGE
// -----------------------------------------------------------------------------

const LANG_STORAGE_KEY = "mbg.grind-until-achieve.lang" as const;

type Lang = "en" | "fr";

const useLang = (): [Lang, (lang: Lang) => void] => {
  const [lang, setLang] = useState<Lang>("en");
  const [langReady, setLangReady] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    const fromUrl = params.get("lang") as Lang | null;
    const fromStorage =
      (localStorage.getItem(LANG_STORAGE_KEY) as Lang | null) ?? null;

    const initialLang =
      fromUrl === "en" || fromUrl === "fr"
        ? fromUrl
        : fromStorage === "en" || fromStorage === "fr"
          ? fromStorage
          : "en";

    setLang(initialLang);
    setLangReady(true);
  }, []);

  useEffect(() => {
    if (!langReady) return;
    const params = new URLSearchParams(window.location.search);

    params.set("lang", lang);

    const url = `${window.location.pathname}?${params.toString()}${
      window.location.hash
    }`;

    window.history.replaceState({}, "", url);

    localStorage.setItem(LANG_STORAGE_KEY, lang);

    document.documentElement.setAttribute("lang", lang);
  }, [lang, langReady]);

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

const IDS = ["story", "progression", "chapters", "book", "ebook"] as const;

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
const GrindTitle = ({ className = "" }: { className?: string }) => {
  return (
    <span className={className} aria-label="GRIND UNTIL ACHIEVE">
      GR
      <span className="text-mbg-green">I</span>
      ND <span className="text-mbg-green">UNTIL</span> ACHIE
      <span className="text-mbg-green">V</span>E
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
      className="relative overflow-hidden border border-mbg-white/10 bg-mbg-darkgrey/20 p-4 sm:p-5 lg:p-6"
    >
      <div
        aria-hidden="true"
        className="absolute left-0 top-0 h-1 w-20 bg-mbg-green"
      />
      <div className="mb-5 flex items-center justify-between border-b border-mbg-white/10 pb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mbg-white/55">
            Milos BG / 01—05
          </p>
          <p className="mt-1 text-sm font-bold uppercase tracking-[0.08em] text-mbg-white">
            {lang === "fr" ? "Sommaire" : "Contents"}
          </p>
        </div>
        <BiSolidBasketball
          aria-hidden="true"
          className="text-xl text-mbg-green"
        />
      </div>

      <ol className="space-y-1">
        {tocItems[lang].map(([number, label, id]) => (
          <li key={id}>
            <a
              href={`#${id}`}
              aria-current={activeId === id ? "location" : undefined}
              className={`group flex min-h-11 items-center gap-3 border-l-2 px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.06em] transition-[background-color,border-color,color,padding] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mbg-green ${
                activeId === id
                  ? "border-mbg-green bg-mbg-green/10 text-mbg-white"
                  : "border-transparent text-mbg-white/65 hover:border-mbg-green/60 hover:bg-mbg-white/[0.05] hover:text-mbg-white"
              }`}
            >
              <span className="w-6 shrink-0 font-black tabular-nums text-mbg-green">
                {number}
              </span>
              <span className="flex-1">{label}</span>
              <FiArrowUpRight
                aria-hidden="true"
                className="text-sm opacity-0 transition-[transform,opacity] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-70"
              />
            </a>
          </li>
        ))}
      </ol>

      <div className="mt-6 border-t border-mbg-white/10 pt-5">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-mbg-white/45">
          {["GRIND", "RESILIENCE", "CONSISTENCY", "FOCUS", "ACHIEVE"].map(
            (word, index) => (
              <React.Fragment key={word}>
                {index > 0 && <span className="text-mbg-green">✿</span>}
                <span>{word}</span>
              </React.Fragment>
            ),
          )}
        </div>
      </div>
    </nav>
  );
};

// -----------------------------------------------------------------------------
// COLLAPSIBLE SECTION
// -----------------------------------------------------------------------------

type ExpandCommand = {
  expanded: boolean;
  sequence: number;
};

type SectionProps = {
  id: string;
  title: string;
  children: React.ReactNode;
  expandCommand: ExpandCommand;
};

const Section: React.FC<SectionProps> = ({
  id,
  title,
  children,
  expandCommand,
}) => {
  // All sections start closed. Bulk actions only run when the button is clicked;
  // manual accordion interaction remains possible afterwards.
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (expandCommand.sequence > 0) {
      setOpen(expandCommand.expanded);
    }
  }, [expandCommand.sequence, expandCommand.expanded]);

  const titleParts = title.split(". ");
  const number = titleParts[0].padStart(2, "0");
  const label = titleParts.slice(1).join(". ") || title;

  return (
    <section id={id} className="scroll-mt-24 print:break-before-page">
      <details
        open={open}
        onToggle={(event) => setOpen(event.currentTarget.open)}
        className="mbg-accordion group overflow-hidden border border-mbg-white/10 bg-mbg-darkgrey/20 transition-[border-color,background-color,box-shadow] duration-300 hover:border-mbg-white/25 open:border-mbg-green/60 open:bg-mbg-darkgrey/25 open:shadow-[0_0_28px_rgba(0,130,26,0.08)]"
      >
        <summary className="flex min-h-[78px] w-full cursor-pointer list-none items-center justify-between gap-4 px-4 py-4 outline-none transition-colors duration-300 marker:hidden hover:bg-mbg-white/[0.035] focus-visible:bg-mbg-white/[0.06] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-mbg-green sm:px-6 [&::-webkit-details-marker]:hidden">
          <span className="flex min-w-0 items-center gap-3 sm:gap-5">
            <span className="flex size-10 shrink-0 items-center justify-center border border-mbg-green/35 bg-mbg-black text-xs font-black tabular-nums text-mbg-green transition-[border-color,background-color] duration-300 group-open:border-mbg-green group-open:bg-mbg-green/10 sm:size-11">
              {number}
            </span>
            <h3 className="min-w-0 text-[13px] font-bold uppercase leading-snug tracking-[0.045em] text-mbg-white sm:text-[15px]">
              {label}
            </h3>
          </span>
          <span className="flex size-9 shrink-0 items-center justify-center border border-mbg-white/20 text-mbg-white/75 transition-[background-color,border-color,color] duration-300 group-hover:border-mbg-green/70 group-open:border-mbg-green group-open:bg-mbg-green group-open:text-mbg-white sm:size-10">
            <FiPlus
              aria-hidden="true"
              className="text-base transition-transform duration-300 group-open:rotate-45"
            />
          </span>
        </summary>

        <div className="h-px bg-gradient-to-r from-mbg-green via-mbg-white/15 to-transparent" />
        <div className="mbg-accordion-body flex flex-col items-start gap-5 px-4 py-6 text-xs leading-relaxed text-mbg-white/80 sm:px-6 sm:py-7">
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

const ChapterCard = ({ number, name, sentence }: ChapterCardProps) => {
  return (
    <div className="group relative flex min-h-[165px] flex-col overflow-hidden border border-mbg-white/10 bg-mbg-white/[0.035] p-4 transition-[transform,border-color,background-color] duration-300 motion-safe:hover:-translate-y-1 hover:border-mbg-green/70 hover:bg-mbg-green/[0.07] sm:p-5">
      <span
        aria-hidden="true"
        className="absolute left-0 top-0 h-[2px] w-0 bg-mbg-green transition-[width] duration-500 group-hover:w-full"
      />
      <div className="mb-6 flex items-start justify-between gap-3">
        <span className="text-3xl font-black leading-none tracking-tight text-mbg-green">
          {number}
        </span>
        <BiSolidBasketball
          aria-hidden="true"
          className="text-xl text-mbg-white/20 transition-[color,transform] duration-500 group-hover:rotate-45 group-hover:text-mbg-green"
        />
      </div>
      <p className="mb-2 text-sm font-extrabold uppercase tracking-wide text-mbg-white">
        {name}
      </p>
      <p className="text-xs leading-5 text-mbg-white/60">{sentence}</p>
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

const PurchaseButton = ({ href, children, icon }: PurchaseButtonProps) => {
  const styles =
    "group inline-flex min-h-11 items-center justify-center gap-3 border px-4 py-3 text-[11px] font-bold uppercase tracking-[0.07em] transition-[background-color,border-color,color,transform] duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mbg-green";

  if (!href) {
    return (
      <span
        aria-disabled="true"
        className={`${styles} cursor-not-allowed border-mbg-white/15 bg-mbg-white/[0.04] text-mbg-white/40`}
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
      className={`${styles} border-mbg-green bg-mbg-green text-mbg-white hover:border-mbg-white hover:bg-mbg-white hover:text-mbg-black motion-safe:hover:-translate-y-0.5`}
    >
      {icon}
      {children}
      <FiExternalLink
        aria-hidden="true"
        className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
      />
    </a>
  );
};

// -----------------------------------------------------------------------------
// CONTENT EN
// -----------------------------------------------------------------------------

const ContentEN: React.FC<{
  expandCommand: ExpandCommand;
}> = ({ expandCommand }) => {
  return (
    <>
      <Section
        id="story"
        expandCommand={expandCommand}
        title="1. The direction"
      >
        <p className="max-w-2xl leading-6">
          <strong>GRIND UNTIL ACHIEVE</strong> is the direction behind Milos BG.
          It is a way of understanding progression: start, endure, repeat,
          focus, achieve — then begin again.
        </p>

        <div
          className={`
            grid
            w-full
            gap-px
            overflow-hidden
            border
            border-mbg-white/10
            bg-mbg-white/[0.06]
            sm:grid-cols-2
          `}
        >
          {[
            ["Basketball", "provides the mindset."],
            ["Craftsmanship", "provides the material."],
            ["Design", "provides the language."],
            ["The five chapters", "provide the structure."],
          ].map(([title, text]) => (
            <div key={title} className="bg-mbg-white/[0.035] p-4">
              <p className="font-bold uppercase text-mbg-white">{title}</p>

              <p className="mt-1 text-mbg-white/65">{text}</p>
            </div>
          ))}
        </div>

        <div
          className={`
            w-full
            border-l-4
            border-mbg-green
            bg-mbg-black
            p-5
            text-mbg-white
          `}
        >
          <p
            className={`
              text-sm
              font-semibold
              uppercase
              tracking-wide
            `}
          >
            GRIND UNTIL ACHIEVE provides the direction.
          </p>
        </div>
      </Section>

      <Section
        id="progression"
        expandCommand={expandCommand}
        title="2. From 1 to 5"
      >
        <p className="leading-6">
          Progress does not happen in one movement. It happens through five
          stages.
        </p>

        <div className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
          {[
            ["01", "START"],
            ["02", "ENDURE"],
            ["03", "REPEAT"],
            ["04", "FOCUS"],
            ["05", "ACHIEVE"],
          ].map(([number, label]) => (
            <div
              key={number}
              className={`
                flex
                min-h-28
                flex-col
                justify-between
                border
                border-mbg-white/10
                p-4
              `}
            >
              <span className="text-2xl font-bold text-mbg-green">
                {number}
              </span>

              <span className="font-bold uppercase">{label}</span>
            </div>
          ))}
        </div>

        <p className="leading-6">
          Achievement is not presented as the end of the journey. Once a goal is
          reached, the experience becomes the foundation for the next cycle.
        </p>
      </Section>

      <Section
        id="chapters"
        expandCommand={expandCommand}
        title="3. The five chapters"
      >
        <div className="grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <ChapterCard number="I" name="GRIND" sentence="Decide to begin." />

          <ChapterCard
            number="II"
            name="RESILIENCE"
            sentence="Continue after impact or failure."
          />

          <ChapterCard
            number="III"
            name="CONSISTENCY"
            sentence="Transform effort into habit."
          />

          <ChapterCard
            number="IV"
            name="FOCUS"
            sentence="Give the accumulated force a direction."
          />

          <ChapterCard
            number="V"
            name="ACHIEVE"
            sentence="Reach, understand, then begin again."
          />
        </div>
      </Section>

      <Section id="book" expandCommand={expandCommand} title="4. Physical book">
        <div
          className={`
            grid
            w-full
            overflow-hidden
            border
            border-mbg-white/10
            lg:grid-cols-[220px_1fr]
          `}
        >
          <div
            className={`
              flex
              min-h-[280px]
              items-center
              justify-center
              bg-mbg-black
              p-8
            `}
          >
            <div className="text-center text-mbg-white">
              <FiBookOpen className="mx-auto mb-5 text-3xl text-mbg-green" />

              <p className="text-sm font-bold uppercase leading-tight">
                <GrindTitle />
              </p>

              <p
                className={`
                  mt-4
                  text-[10px]
                  uppercase
                  tracking-[0.3em]
                  text-mbg-white/65
                `}
              >
                Milos BG
              </p>
            </div>
          </div>

          <div
            className={`
              flex
              flex-col
              justify-center
              gap-4
              bg-mbg-white/[0.045]
              p-6
            `}
          >
            <div>
              <p
                className={`
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-mbg-green
                `}
              >
                Physical edition
              </p>

              <h4
                className={`
                  mt-1
                  text-xl
                  font-bold
                  uppercase
                  text-mbg-white
                `}
              >
                GRIND UNTIL ACHIEVE
              </h4>
            </div>

            <p className="max-w-xl leading-6 text-mbg-white/65">
              A physical object dedicated to the philosophy behind Milos BG and
              its five-stage progression. Designed to be read, kept and
              revisited as the journey evolves.
            </p>

            <div>
              <PurchaseButton href={BOOK_URL} icon={<FiShoppingBag />}>
                Buy the book
              </PurchaseButton>
            </div>
          </div>
        </div>
      </Section>

      <Section id="ebook" expandCommand={expandCommand} title="5. Ebook">
        <div
          className={`
            flex
            w-full
            flex-col
            justify-between
            gap-6
            border
            border-mbg-white/10
            bg-mbg-black
            p-6
            text-mbg-white
            md:flex-row
            md:items-center
          `}
        >
          <div className="max-w-2xl">
            <div
              className={`
                mb-4
                inline-flex
                items-center
                gap-2
                text-mbg-green
              `}
            >
              <FiDownload />

              <span
                className={`
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                `}
              >
                Digital edition
              </span>
            </div>

            <h4 className="text-xl font-bold uppercase">
              Read GRIND UNTIL ACHIEVE digitally
            </h4>

            <p
              className={`
                mt-3
                max-w-xl
                text-xs
                leading-6
                text-mbg-white/65
              `}
            >
              Access the philosophy, the five chapters and the progression model
              wherever you are.
            </p>
          </div>

          <div className="shrink-0">
            <PurchaseButton href={EBOOK_URL} icon={<FiDownload />}>
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
  expandCommand: ExpandCommand;
}> = ({ expandCommand }) => {
  return (
    <>
      <Section id="story" expandCommand={expandCommand} title="1. La direction">
        <p className="max-w-2xl leading-6">
          <strong>GRIND UNTIL ACHIEVE</strong> représente la direction de Milos
          BG. C&apos;est une manière de comprendre la progression : commencer,
          résister, répéter, se concentrer, accomplir — puis recommencer.
        </p>

        <div
          className={`
            grid
            w-full
            gap-px
            overflow-hidden
            border
            border-mbg-white/10
            bg-mbg-white/[0.06]
            sm:grid-cols-2
          `}
        >
          {[
            ["Le basketball", "fournit la mentalité."],
            ["L’artisanat", "fournit la matière."],
            ["Le design", "fournit le langage."],
            ["Les cinq chapitres", "fournissent la structure."],
          ].map(([title, text]) => (
            <div key={title} className="bg-mbg-white/[0.035] p-4">
              <p className="font-bold uppercase text-mbg-white">{title}</p>

              <p className="mt-1 text-mbg-white/65">{text}</p>
            </div>
          ))}
        </div>

        <div
          className={`
            w-full
            border-l-4
            border-mbg-green
            bg-mbg-black
            p-5
            text-mbg-white
          `}
        >
          <p
            className={`
              text-sm
              font-semibold
              uppercase
              tracking-wide
            `}
          >
            GRIND UNTIL ACHIEVE fournit la direction.
          </p>
        </div>
      </Section>

      <Section
        id="progression"
        expandCommand={expandCommand}
        title="2. De 1 à 5"
      >
        <p className="leading-6">
          La progression ne se fait pas en un seul mouvement. Elle se construit
          à travers cinq étapes.
        </p>

        <div className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3 xl:grid-cols-5">
          {[
            ["01", "COMMENCER"],
            ["02", "RÉSISTER"],
            ["03", "RÉPÉTER"],
            ["04", "ORIENTER"],
            ["05", "ACCOMPLIR"],
          ].map(([number, label]) => (
            <div
              key={number}
              className={`
                flex
                min-h-28
                flex-col
                justify-between
                border
                border-mbg-white/10
                p-4
              `}
            >
              <span className="text-2xl font-bold text-mbg-green">
                {number}
              </span>

              <span className="font-bold uppercase">{label}</span>
            </div>
          ))}
        </div>

        <p className="leading-6">
          ACHIEVE n&apos;est pas présenté comme une fin. Lorsqu&apos;un objectif
          est atteint, ce qui a été appris devient la base du prochain cycle.
        </p>
      </Section>

      <Section
        id="chapters"
        expandCommand={expandCommand}
        title="3. Les cinq chapitres"
      >
        <div className="grid w-full gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <ChapterCard
            number="I"
            name="GRIND"
            sentence="Décider de commencer."
          />

          <ChapterCard
            number="II"
            name="RESILIENCE"
            sentence="Continuer après le choc ou l’échec."
          />

          <ChapterCard
            number="III"
            name="CONSISTENCY"
            sentence="Transformer l’effort en habitude."
          />

          <ChapterCard
            number="IV"
            name="FOCUS"
            sentence="Orienter correctement cette force."
          />

          <ChapterCard
            number="V"
            name="ACHIEVE"
            sentence="Atteindre, comprendre, puis repartir."
          />
        </div>
      </Section>

      <Section
        id="book"
        expandCommand={expandCommand}
        title="4. Livre physique"
      >
        <div
          className={`
            grid
            w-full
            overflow-hidden
            border
            border-mbg-white/10
            lg:grid-cols-[220px_1fr]
          `}
        >
          <div
            className={`
              flex
              min-h-[280px]
              items-center
              justify-center
              bg-mbg-black
              p-8
            `}
          >
            <div className="text-center text-mbg-white">
              <FiBookOpen className="mx-auto mb-5 text-3xl text-mbg-green" />

              <p className="text-lg font-bold uppercase leading-tight">
                <GrindTitle />
              </p>

              <p
                className={`
                  mt-4
                  text-[10px]
                  uppercase
                  tracking-[0.3em]
                  text-mbg-white/65
                `}
              >
                Milos BG
              </p>
            </div>
          </div>

          <div
            className={`
              flex
              flex-col
              justify-center
              gap-4
              bg-mbg-white/[0.045]
              p-6
            `}
          >
            <div>
              <p
                className={`
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[0.2em]
                  text-mbg-green
                `}
              >
                Édition physique
              </p>

              <h4
                className={`
                  mt-1
                  text-xl
                  font-bold
                  uppercase
                  text-mbg-white
                `}
              >
                GRIND UNTIL ACHIEVE
              </h4>
            </div>

            <p className="max-w-xl leading-6 text-mbg-white/65">
              Un objet physique consacré à la philosophie de Milos BG et à sa
              progression en cinq étapes. Un livre conçu pour être lu, conservé
              et revisité à mesure que le parcours évolue.
            </p>

            <div>
              <PurchaseButton href={BOOK_URL} icon={<FiShoppingBag />}>
                Acheter le livre
              </PurchaseButton>
            </div>
          </div>
        </div>
      </Section>

      <Section id="ebook" expandCommand={expandCommand} title="5. Ebook">
        <div
          className={`
            flex
            w-full
            flex-col
            justify-between
            gap-6
            border
            border-mbg-white/10
            bg-mbg-black
            p-6
            text-mbg-white
            md:flex-row
            md:items-center
          `}
        >
          <div className="max-w-2xl">
            <div
              className={`
                mb-4
                inline-flex
                items-center
                gap-2
                text-mbg-green
              `}
            >
              <FiDownload />

              <span
                className={`
                  text-[10px]
                  font-bold
                  uppercase
                  tracking-[0.2em]
                `}
              >
                Édition numérique
              </span>
            </div>

            <h4 className="text-xl font-bold uppercase">
              Lire GRIND UNTIL ACHIEVE en numérique
            </h4>

            <p
              className={`
                mt-3
                max-w-xl
                text-xs
                leading-6
                text-mbg-white/65
              `}
            >
              Retrouvez la philosophie, les cinq chapitres et la progression de
              1 à 5 où que vous soyez.
            </p>
          </div>

          <div className="shrink-0">
            <PurchaseButton href={EBOOK_URL} icon={<FiDownload />}>
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
  const [expandCommand, setExpandCommand] = useState<ExpandCommand>({
    expanded: false,
    sequence: 0,
  });
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const id = (visible?.target as HTMLElement | undefined)?.id;
        if (id) setActiveId(id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0.2, 0.5, 0.75] },
    );
    IDS.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });
    return () => observer.disconnect();
  }, [lang]);

  const ui = useMemo(
    () => ({
      breadcrumbHome: lang === "fr" ? "Accueil" : "Home",
      backToShop: lang === "fr" ? "Retour à la boutique" : "Back to shop",
      expandAll: lang === "fr" ? "Tout déplier" : "Expand all",
      collapseAll: lang === "fr" ? "Tout replier" : "Collapse all",
      intro:
        lang === "fr"
          ? "Une histoire de progression, écrite un chapitre à la fois."
          : "A story of progression, written one chapter at a time.",
      philosophy:
        lang === "fr"
          ? "Commencer. Résister. Répéter. Se concentrer. Accomplir. Puis repartir."
          : "Start. Endure. Repeat. Focus. Achieve. Then begin again.",
      lastUpdateLabel:
        lang === "fr" ? "Dernière mise à jour :" : "Last update:",
      rights: lang === "fr" ? "Tous droits réservés" : "All rights reserved",
      breadcrumbAria: lang === "fr" ? "Fil d'Ariane" : "Breadcrumb",
      sections:
        lang === "fr" ? "Explorer les chapitres" : "Explore the chapters",
      chaptersCount:
        lang === "fr"
          ? "05 chapitres · 01 parcours"
          : "05 chapters · 01 journey",
      guide:
        lang === "fr"
          ? "La mentalité derrière Milos BG"
          : "The mentality behind Milos BG",
      conclusion:
        lang === "fr"
          ? "Cinq chapitres. Un parcours."
          : "Five chapters. One journey.",
    }),
    [lang],
  );

  const handleToggleAll = () => {
    setExpandCommand((prev) => ({
      expanded: !prev.expanded,
      sequence: prev.sequence + 1,
    }));
  };

  return (
    <div className="min-h-screen bg-mbg-black font-kanit text-mbg-white selection:bg-mbg-green selection:text-mbg-white">
      <Container className="pb-16 pt-4 sm:pt-6">
        {/* UTILITY BAR */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-mbg-white/10 bg-mbg-darkgrey/15 px-3 py-3 sm:px-5">
          <nav
            aria-label={ui.breadcrumbAria}
            className="min-w-0 text-[10px] font-semibold uppercase tracking-[0.08em] sm:text-xs"
          >
            <ol className="flex items-center gap-2 sm:gap-3">
              <li>
                <Link
                  href="/"
                  className="text-mbg-white/55 transition-colors hover:text-mbg-green focus-visible:outline-2 focus-visible:outline-mbg-green"
                >
                  {ui.breadcrumbHome}
                </Link>
              </li>
              <li aria-hidden className="text-mbg-green">
                /
              </li>
              <li className="truncate text-mbg-white">GRIND UNTIL ACHIEVE</li>
            </ol>
          </nav>

          <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">
            <div
              aria-label="Language"
              className="inline-flex border border-mbg-white/15 bg-mbg-black p-0.5"
            >
              {(["en", "fr"] as const).map((language) => (
                <button
                  key={language}
                  type="button"
                  onClick={() => setLang(language)}
                  aria-pressed={lang === language}
                  className={`min-h-9 min-w-10 px-3 text-[11px] font-extrabold uppercase transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-mbg-green ${
                    lang === language
                      ? "bg-mbg-green text-mbg-white"
                      : "text-mbg-white/60 hover:bg-mbg-white/10 hover:text-mbg-white"
                  }`}
                >
                  {language}
                </button>
              ))}
            </div>
            <Link
              href="/"
              className="inline-flex min-h-10 items-center gap-2 border border-mbg-white/15 px-3 text-[10px] font-bold uppercase tracking-[0.04em] text-mbg-white/80 transition-[background-color,border-color,color] duration-300 hover:border-mbg-green hover:bg-mbg-green/10 hover:text-mbg-white focus-visible:outline-2 focus-visible:outline-mbg-green sm:px-4"
            >
              {ui.backToShop}
              <FiArrowUpRight aria-hidden="true" />
            </Link>
          </div>
        </div>


{/* HERO */}
<header
  className={`
    mbg-enter
    relative isolate mb-7
    overflow-hidden
    border border-mbg-white/10
    bg-mbg-darkgrey/20
    px-5 py-11
    sm:px-8 sm:py-14
    lg:px-12 lg:py-16
  `}
>
  {/* Dégradé de fond */}
  <div
    aria-hidden="true"
    className={`
      pointer-events-none
      absolute inset-0 z-0
      bg-[radial-gradient(ellipse_at_85%_20%,rgba(0,130,26,0.16),transparent_48%)]
    `}
  />

  {/* Cercle supérieur */}
  <div
    aria-hidden="true"
    className={`
      pointer-events-none
      absolute -right-20 -top-28 z-0
      size-[310px]
      rounded-full
      border border-mbg-white/10
      sm:size-[420px]
    `}
  />

  {/* Cercle inférieur + logo parfaitement centré */}
  <div
    aria-hidden="true"
    className={`
      pointer-events-none
      absolute
      right-[-42px]
      top-[92px]
      z-0
      size-[340px]
      sm:right-[-72px]
      sm:top-[78px]
      sm:size-[520px]
    `}
  >
    {/* Cercle décoratif */}
    <div
      className={`
        absolute inset-0
        rounded-full
        border border-mbg-green/10
      `}
    />

    {/* Logo centré dans le cercle */}
    <div
      className={`
        absolute inset-0
        flex items-center justify-center
      `}
    >
      <Image
        src={GrindUntilAchieve2}
        alt=""
        width={260}
        height={260}
        className={`
          mbg-float
          size-[150px]
          shrink-0
          object-contain
          opacity-70
          sm:size-[220px]
        `}
      />
    </div>
  </div>

  {/* Contenu principal */}
  <div
    className={`
      relative z-10
      w-full min-w-0 max-w-3xl
      [container-type:inline-size]
    `}
  >
    {/* Label */}
    <div className="mb-7 flex items-center gap-3">
      <span
        aria-hidden="true"
        className="h-[3px] w-9 shrink-0 bg-mbg-green"
      />

      <span
        className={`
          text-[10px]
          font-bold uppercase
          tracking-[0.24em]
          text-mbg-white/70
        `}
      >
        {ui.guide}
      </span>
    </div>

    {/* Titre responsive sur une seule ligne */}
    <h1
      className={`
        w-full
        whitespace-nowrap
        text-[clamp(0.875rem,7cqw,3.75rem)]
        font-black uppercase
        leading-none
        tracking-[-0.05em]
        text-mbg-white
      `}
    >
      <GrindTitle />
    </h1>

    {/* Ligne décorative */}
    <div
      className={`
        mt-7 h-px w-full max-w-lg
        bg-gradient-to-r
        from-mbg-green
        via-mbg-white/20
        to-transparent
      `}
    />

    {/* Introduction */}
    <p
      className={`
        mt-6 max-w-2xl
        text-sm font-semibold leading-6
        text-mbg-white
        sm:text-base sm:leading-7
      `}
    >
      {ui.intro}
    </p>

    {/* Philosophie */}
    <p
      className={`
        mt-3 max-w-2xl
        text-xs leading-6
        text-mbg-white/60
        sm:text-sm sm:leading-7
      `}
    >
      {ui.philosophy}
    </p>

    {/* Progression des cinq chapitres */}
    <div
      className={`
        mt-9 flex flex-wrap
        items-center gap-2
        sm:gap-3
      `}
      aria-label={ui.chaptersCount}
    >
      {(["I", "II", "III", "IV", "V"] as const).map(
        (number, index) => (
          <React.Fragment key={number}>
            <span
              className={`
                flex size-9
                items-center justify-center
                border
                text-xs font-black
                transition-[background-color,border-color,transform]
                duration-300
                motion-safe:hover:-translate-y-0.5
                sm:size-10
                ${
                  number === "I" || number === "V"
                    ? "border-mbg-green bg-mbg-green text-mbg-white"
                    : "border-mbg-white/20 bg-mbg-black/60 text-mbg-white/75 hover:border-mbg-green/60"
                }
              `}
            >
              {number}
            </span>

            {index < 4 && (
              <span
                aria-hidden="true"
                className={`
                  h-px w-3 bg-mbg-white/20
                  sm:w-5
                `}
              />
            )}
          </React.Fragment>
        )
      )}
    </div>
  </div>

  {/* Barre inférieure verte */}
  <div
    aria-hidden="true"
    className={`
      absolute bottom-0 left-0
      h-[3px] w-1/5
      bg-mbg-green
    `}
  />
</header>



        {/* CONTENT ACTIONS */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-mbg-white/10 pb-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mbg-green">
              {ui.chaptersCount}
            </p>
            <h2 className="mt-1 text-base font-extrabold uppercase tracking-[0.03em] sm:text-lg">
              {ui.sections}
            </h2>
          </div>
          <button
            type="button"
            onClick={handleToggleAll}
            className="inline-flex min-h-10 items-center gap-2 border border-mbg-green/70 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.06em] text-mbg-white transition-[background-color,border-color,color] duration-300 hover:border-mbg-green hover:bg-mbg-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mbg-green sm:px-4"
          >
            <FiPlus
              aria-hidden="true"
              className={`text-sm transition-transform duration-300 ${expandCommand.expanded ? "rotate-45" : ""}`}
            />
            {expandCommand.expanded ? ui.collapseAll : ui.expandAll}
          </button>
        </div>

        <div className="grid gap-5 lg:grid-cols-[minmax(235px,0.36fr)_minmax(0,1fr)] lg:gap-7">
          <aside className="lg:sticky lg:top-5 lg:self-start">
            <Toc activeId={activeId} lang={lang} />
          </aside>

          <div className="min-w-0 space-y-3 sm:space-y-4">
            {lang === "en" ? (
              <ContentEN expandCommand={expandCommand} />
            ) : (
              <ContentFR expandCommand={expandCommand} />
            )}

            {/* FINAL BRAND MESSAGE */}
            <div className="relative mt-8 overflow-hidden border border-mbg-green/40 bg-mbg-darkgrey/20 px-6 py-9 text-center sm:py-11">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,130,26,0.09),transparent_65%)]"
              />
              <div className="relative mx-auto flex max-w-xl flex-col items-center">
                <Image
                  src={GrindUntilAchieve}
                  alt="GRIND UNTIL ACHIEVE"
                  width={38}
                  height={38}
                  className="mb-5 size-9 object-contain transition-transform duration-500 motion-safe:hover:scale-110"
                />
                <p className="text-lg font-black uppercase tracking-[-0.03em] text-mbg-white sm:text-2xl">
                  <GrindTitle />
                </p>
                <span className="my-5 h-[2px] w-14 bg-mbg-green" />
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-mbg-white/65 sm:text-xs">
                  {ui.conclusion}
                </p>
              </div>
            </div>

            <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 border-t border-mbg-white/10 pt-5 text-[10px] font-medium text-mbg-white/50">
              <p>{ui.lastUpdateLabel}&nbsp;16/09/2026</p>
              <p>
                &copy; {new Date().getFullYear()} Milos BG — {ui.rights}
              </p>
            </footer>
          </div>
        </div>

        {showTop && (
          <button
            type="button"
            aria-label={lang === "fr" ? "Revenir en haut" : "Back to top"}
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="fixed bottom-5 right-5 z-40 flex size-11 items-center justify-center border border-mbg-green bg-mbg-black/95 text-mbg-white shadow-lg shadow-mbg-black/40 backdrop-blur transition-[background-color,transform] duration-300 hover:bg-mbg-green motion-safe:hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mbg-green sm:bottom-7 sm:right-7"
          >
            <FiArrowUp aria-hidden="true" className="text-lg" />
          </button>
        )}
      </Container>

      <style jsx global>{`
        @keyframes mbg-enter {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes mbg-float {
          0%,
          100% {
            transform: translateY(0) rotate(-10deg);
          }
          50% {
            transform: translateY(8px) rotate(-7deg);
          }
        }
        .mbg-enter {
          animation: mbg-enter 650ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .mbg-float {
          animation: mbg-float 9s ease-in-out infinite;
        }
        .mbg-accordion[open] .mbg-accordion-body {
          animation: mbg-enter 340ms ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .mbg-enter,
          .mbg-float,
          .mbg-accordion[open] .mbg-accordion-body {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
};

export default ClientPage;
