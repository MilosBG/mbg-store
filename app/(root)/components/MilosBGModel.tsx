import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { IconType } from "react-icons";
import {
  FiArrowRight,
  FiBox,
  FiClock,
  FiEdit3,
  FiGrid,
  FiMapPin,
  FiScissors,
  FiSearch,
  FiTool,
} from "react-icons/fi";

type ProcessStep = {
  number: string;
  title: string;
  description: string;
  icon: IconType;
  className: string;
};

const processSteps: ProcessStep[] = [
  {
    number: "01",
    title: "DESIGN",
    description: "Prototype validé",
    icon: FiEdit3,
    className: "border-mbg-black bg-mbg-black text-mbg-white",
  },
  {
    number: "02",
    title: "MATIÈRE",
    description: "Matière réservée",
    icon: FiScissors,
    className: "border-mbg-darkgrey bg-mbg-darkgrey text-mbg-white",
  },
  {
    number: "03",
    title: "CONFECTION",
    description: "Découpé et assemblé",
    icon: FiTool,
    className: "border-mbg-black/40 bg-mbg-lightgrey text-mbg-black",
  },
  {
    number: "04",
    title: "CONTRÔLE",
    description: "Finitions vérifiées",
    icon: FiSearch,
    className: "border-mbg-green bg-mbg-green text-mbg-white",
  },
  {
    number: "05",
    title: "EXPÉDITION",
    description: "Pièce envoyée",
    icon: FiBox,
    className: "border-mbg-black/40 bg-mbg-white text-mbg-black",
  },
];

const commitments = [
  {
    label: "FAIT EN FRANCE",
    icon: FiMapPin,
  },
  {
    label: "SANS SURPRODUCTION",
    icon: FiGrid,
  },
  {
    label: "PRODUCTION LIMITÉE",
    icon: FiGrid,
  },
];

const MilosBGModel = () => {
  return (
    <section
      id="milos-bg-model"
      className="bg-mbg-rgbalight px-5 py-10 font-kanit text-mbg-black sm:px-6 lg:px-8 lg:py-14"
    >
      <div className="mx-auto max-w-[1440px]">
        {/* Section heading */}
        <h2 className="heading2-bold mb-4">The Milos BG Model</h2>

        {/* Main presentation */}
        <div className="grid overflow-hidden border border-mbg-black bg-mbg-white shadow-mbg-bx-shadow lg:grid-cols-[42%_58%]">
          {/* Workshop image */}
          <div className="relative min-h-[290px] overflow-hidden bg-mbg-black sm:min-h-[370px] lg:min-h-[410px]">
            <Image
              src="/images/milos-bg-workshop.jpg"
              alt="Confection artisanale d’un vêtement Milos BG"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover grayscale"
            />

            <div className="pointer-events-none absolute inset-0 bg-mbg-black/5" />
          </div>

          {/* Main copy */}
          <div className="relative flex min-h-[330px] items-center px-7 py-12 sm:px-10 lg:min-h-0 lg:px-12 xl:px-14">
            <span
              aria-hidden="true"
              className="absolute right-7 top-6 text-5xl leading-none text-mbg-lightgrey/60 sm:right-10 sm:top-8 sm:text-6xl"
            >
              ✿
            </span>

            <div className="relative z-10 max-w-[720px]">
              <h3 className="text-4xl leading-[1.05] font-extrabold tracking-[-0.03em] uppercase sm:text-5xl lg:text-6xl">
                Your order
                <br />
                starts the grind.
              </h3>

              <p className="mt-6 max-w-[650px] text-base leading-relaxed font-normal text-mbg-darkgrey sm:text-lg lg:text-xl">
                Chaque pièce est confectionnée après votre commande, dans notre
                atelier en France.
              </p>
            </div>
          </div>
        </div>

        {/* Production steps */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {processSteps.map((step) => {
            const Icon = step.icon;

            return (
              <article
                key={step.number}
                className={`hoverEffect flex min-h-[220px] flex-col items-center justify-center border px-5 py-7 text-center shadow-mbg-bx-shadow hover:-translate-y-1 ${step.className}`}
              >
                <Icon
                  aria-hidden="true"
                  className="mb-7 h-12 w-12 stroke-[1.3]"
                />

                <h4 className="text-lg leading-tight font-bold uppercase sm:text-xl">
                  {step.number} — {step.title}
                </h4>

                <p className="mt-2 text-sm leading-normal font-normal sm:text-base">
                  {step.description}
                </p>
              </article>
            );
          })}
        </div>

        {/* Manufacturing time */}
        <div className="mt-5 flex flex-col gap-5 border border-mbg-black bg-mbg-black px-6 py-5 text-mbg-white sm:flex-row sm:items-center sm:px-8">
          <div className="flex h-13 w-13 shrink-0 items-center justify-center rounded-full border-2 border-mbg-white">
            <FiClock aria-hidden="true" className="h-6 w-6 stroke-[1.5]" />
          </div>

          <div>
            <h3 className="text-xl leading-tight font-bold uppercase sm:text-2xl">
              Confection à la commande
            </h3>

            <p className="mt-1 text-sm leading-normal font-semibold sm:text-base">
              Expédition estimée :{" "}
              <strong className="font-bold text-mbg-green">
                10 à 15 jours ouvrés
              </strong>
            </p>

            <p className="mt-1 text-sm leading-normal font-normal text-mbg-white/85 sm:text-base">
              Une date précise est affichée avant le paiement.
            </p>
          </div>
        </div>

        {/* Commitments */}
        <div className="mt-6 grid items-center gap-6 lg:grid-cols-[1fr_auto]">
          <div className="grid sm:grid-cols-3">
            {commitments.map((commitment, index) => {
              const Icon = commitment.icon;

              return (
                <div
                  key={commitment.label}
                  className={`flex min-h-20 items-center gap-4 px-2 py-4 sm:px-6 ${
                    index > 0 ? "sm:border-l sm:border-mbg-black/40" : ""
                  }`}
                >
                  <Icon
                    aria-hidden="true"
                    className="h-10 w-10 shrink-0 stroke-[1.3]"
                  />

                  <span className="text-sm leading-tight font-semibold uppercase lg:text-base">
                    {commitment.label}
                  </span>
                </div>
              );
            })}
          </div>

          <Link
            href="/the-background"
            className="hoverEffect group inline-flex min-h-14 items-center justify-center gap-6 border border-mbg-green bg-mbg-green px-7 py-3 text-sm font-semibold uppercase text-mbg-white hover:border-mbg-black hover:bg-mbg-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mbg-green sm:text-base"
          >
            Découvrir le processus
            <FiArrowRight
              aria-hidden="true"
              className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
            />
          </Link>
        </div>

        {/* Mantra */}
        <div className="mt-7 flex items-center gap-4 sm:gap-6">
          <span className="h-px flex-1 bg-mbg-black/40" />

          <p className="flex items-center gap-2 whitespace-nowrap text-[10px] font-medium tracking-[0.2em] uppercase sm:text-sm sm:tracking-[0.3em]">
            Grind Until Achieve.
            <span aria-hidden="true" className="text-lg tracking-normal">
              ✿
            </span>
          </p>

          <span className="h-px flex-1 bg-mbg-black/40" />
        </div>
      </div>
    </section>
  );
};

export default MilosBGModel;
