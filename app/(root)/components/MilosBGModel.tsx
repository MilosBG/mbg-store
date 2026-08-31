import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { IconType } from "react-icons";
import {
  FiArrowRight,
  FiTruck,
  FiClock,
  FiShoppingCart,
  FiGrid,
  FiMapPin,
  FiCheckSquare,
  FiSearch,
  FiScissors,
} from "react-icons/fi";
import { CraftMan } from "@/images";

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
    title: "ORDER",
    description: "Place your order",
    icon: FiShoppingCart,
    className: "border-mbg-black bg-mbg-black/10 text-mbg-white",
  },
  {
    number: "02",
    title: "INVOICE",
    description: "Pay your invoice",
    icon: FiCheckSquare,
    className: "border-mbg-black bg-mbg-black/10 text-mbg-white",
  },
  {
    number: "03",
    title: "PRODUCTION",
    description: "We produce your items",
    icon: FiScissors,
    className: "border-mbg-black bg-mbg-black/10 text-mbg-white",
  },
  {
    number: "04",
    title: "QUALITY",
    description: "We check the finishing",
    icon: FiSearch,
    className: "border-mbg-black bg-mbg-black/10 text-mbg-white",
  },
  {
    number: "05",
    title: "SHIPPING",
    description: "We ship your outfits",
    icon: FiTruck,
    className: "border-mbg-black bg-mbg-black/10 text-mbg-white",
  },
];

const commitments = [
  {
    label: "MADE IN FRANCE",
    icon: FiMapPin,
  },
  {
    label: "NO OVERPRODUCTION",
    icon: FiGrid,
  },
  {
    label: "LIMITED PRODUCTION",
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
        <h2 className="heading2-bold mb-4">How we work</h2>

        {/* Main presentation */}
        <div className="grid overflow-hidden border border-mbg-black bg-mbg-white shadow-mbg-bx-shadow lg:grid-cols-[42%_58%]">
          {/* Workshop image */}
          <div className="relative min-h-[290px] overflow-hidden bg-mbg-black sm:min-h-[370px] lg:min-h-[410px]">
            <Image
              src={CraftMan}
              alt="Handcrafted production of a Milos BG garment"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover grayscale"
            />

            <div className="pointer-events-none absolute inset-0 bg-mbg-black/5" />
          </div>

          {/* Main copy */}
          <div className="relative flex min-h-[330px] items-center px-7 py-12 sm:px-10 lg:min-h-0 lg:px-12 xl:px-14">
            <div className="relative z-10 max-w-[720px]">
              <h3 className="text-4xl leading-[1.05] font-extrabold tracking-[-0.03em] uppercase sm:text-5xl lg:text-6xl">
                Your order
                <br />
                starts the grind.
              </h3>

              <p className="mt-6 max-w-[650px] text-xs leading-relaxed font-normal text-mbg-darkgrey sm:text-sm lg:text-lg">
                Every piece is made after you place your order, in our workshop
                in France.
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
                className={`hoverEffect flex min-h-[220px] flex-col items-center justify-center border-dashed px-5 py-7 text-center shadow-mbg-bx-shadow hover:-translate-y-1 hover:bg-mbg-white/80 hover:text-mbg-black ${step.className}`}
              >
                <Icon
                  aria-hidden="true"
                  className="mb-7 h-7 w-7 bg-mbg-black/10 rounded-xs p-1.5 stroke-[1.3]"
                />

                <h4 className="text-base leading-tight font-bold uppercase sm:text-lg">
                  {step.number} — {step.title}
                </h4>

                <p className="mt-2 text-xs leading-normal font-normal sm:text-sm">
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
              Made to order
            </h3>

            <p className="mt-1 text-sm leading-normal font-semibold sm:text-base">
              Estimated shipping |{" "}
              <strong className="font-bold text-mbg-green">
                10 to 15 business days
              </strong>
            </p>

            <p className="mt-1 text-xs leading-normal font-normal text-mbg-white/85 sm:text-sm">
              The exact date will be confirmed by email after payment.
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
                    className="h-7 w-7 shrink-0 stroke-[1.3]"
                  />

                  <span className="text-sm leading-tight font-semibold uppercase lg:text-base">
                    {commitment.label}
                  </span>
                </div>
              );
            })}
          </div>

          <Link
            href="https://www.youtube.com/@milos-bg"
            target="_blank"
            rel="noopener noreferrer"
            className="hoverEffect group inline-flex min-h-14 items-center justify-center gap-6 border border-mbg-green bg-mbg-green px-7 py-3 text-sm font-semibold uppercase text-mbg-white hover:border-mbg-black hover:bg-mbg-black focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mbg-green sm:text-base"
          >
            Discover the process
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
            Grind Until Achieve
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
