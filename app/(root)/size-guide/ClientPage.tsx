"use client";

import Container from "@/components/mbg-components/Container";
import { H2 } from "@/components/mbg-components/H2";
import { Grinder } from "@/images";
import Image from "next/image";
import React, { useState } from "react";

// ------------------------------------------------------------
// Men’s Size Guide Page (TSX)
// - TailwindCSS utility classes
// - Unit toggle (cm / in)
// - Responsive, accessible table
// - Measurement tips + illustration slot
// ------------------------------------------------------------

// Data model

type Range = `${number}-${number}` | string; // allow strings like 5'8" - 5'10"

type SizeRow = {
  label: string;
  key: string;
  values: Record<string, { cm?: Range; in?: Range; text?: string }>; // per size key
};

type SizeKey = "M" | "L" | "S";

const SIZE_ORDER: SizeKey[] = ["M", "L", "S"];

// Table rows (derived from the reference image)
const rows: SizeRow[] = [
  {
    label: "Milos BG",
    key: "int",
    values: {
      M: { text: "M" },
      L: { text: "L" },
      S: { text: "S" },
    },
  },
  // Measurements
  {
    label: "Body height",
    key: "height",
    values: {
      M: { cm: "178-183", in: "5'10\"-6'" },
      L: { cm: "183-188", in: "6'-6'2\"" },
      S: { cm: "173-178", in: "5'8\"-5'10\"" },
    },
  },
  {
    label: "Chest",
    key: "chest",
    values: {
      M: { cm: "96-102", in: "38-40" },
      L: { cm: "102-106", in: "40-42" },
      S: { cm: "92-96", in: "36-38" },
    },
  },
  {
    label: "Waist",
    key: "waist",
    values: {
      M: { cm: "79-84", in: "31-33" },
      L: { cm: "84-89", in: "33-35" },
      S: { cm: "74-79", in: "29-31" },
    },
  },
  {
    label: "Hip",
    key: "hip",
    values: {
      M: { cm: "96-102", in: "38-40" },
      L: { cm: "102-106", in: "40-42" },
      S: { cm: "92-96", in: "36-38" },
    },
  },
  {
    label: "Inseam",
    key: "inseam",
    values: {
      M: { cm: "82-84", in: "32-33" },
      L: { cm: "84-86", in: "33-34" },
      S: { cm: "79-82", in: "31-32" },
    },
  },
];

const cellClasses = "px-3 py-2 align-top  border-mbg-black/7 text-sm";

export default function SizesGuidePage() {
  const [unit, setUnit] = useState<"cm" | "in">("cm");



  return (
    <Container>
      <main className="min-h-screen bg-mbg-white">
        {/* Hero */}
        <section className="relative border-b">
          <div className="max-w-7xl mx-auto px-6 py-10 grid gap-8 md:grid-cols-2 items-center">
            <div>
              <H2>
                Men’s Size Guide
              </H2>
              <p className="mt-3 text-xs text-mbg-green">
                Find your best fit with international conversions and body
                measurements. Toggle between centimeters and inches as you
                prefer.
              </p>

              {/* Unit toggle */}
              <div className="mt-6 inline-flex items-center rounded-xs border p-1 bg-mbg-black/7">
                {(["cm", "in"] as const).map((u) => (
                  <button
                    key={u}
                    className={
                      "px-4 py-2 text-sm rounded-xs transition " +
                      (unit === u
                        ? "bg-mbg-white shadow font-medium"
                        : "text-mbg-black hover:text-mbg-green hoverEffect")
                    }
                    onClick={() => setUnit(u)}
                    aria-pressed={unit === u}
                  >
                    {u.toUpperCase()}
                  </button>
                ))}
              </div>

              {/* Tips */}
              <ul className="mt-6 space-y-2 text-xs text-gray-600 list-disc pl-5">
                <li>
                  Chest: measure around the fullest part, under your arms.
                </li>
                <li>Waist: measure at the natural waistline where you bend.</li>
                <li>Hip: measure around the widest part of your hips.</li>
                <li>Inseam: measure from crotch to ankle bone.</li>
              </ul>
            </div>

            {/* Illustration (replace src with your asset path). */}
            <div className="flex justify-center md:justify-end">
              <Image
                src={Grinder}
                alt="Measurement guide silhouette showing chest, waist, hip and inseam"
                className="max-h-[360px] w-auto object-contain"
              />
            </div>
          </div>
        </section>

        {/* Table */}
        <section className="max-w-7xl mx-auto px-6 py-10 text-xs uppercase font-medium tracking-widest">
          <div className="overflow-x-auto border border-mbg-black/7  shadow-sm">
            <table className="min-w-[720px] w-full">
              
              <tbody>
                {rows.map((row) => (
                  <tr key={row.key} className="odd:bg-mbg-white even:bg-mbg-black/7 hover:bg-mbg-green/7 hoverEffect">
                    <th
                      scope="row"
                      className={
                        "sticky left-0  z-10 px-3 py-2 text-left font-bold tracking-widest border-b border-mbg-black/7"
                      }
                    >
                      {row.label}
                    </th>

                    {SIZE_ORDER.map((size) => {
                      const cell = row.values[size];
                      const showText = cell?.text != null;
                      const display = showText
                        ? cell.text
                        : unit === "cm"
                        ? cell?.cm ?? "—"
                        : cell?.in ?? "—";

                      return (
                        <td key={size} className={`${cellClasses} text-center`}>
                          {display}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Helper footer */}
          <p className="text-[10px] text-mbg-green mt-3">
            * Values are based on the reference chart and intended as a general
            guide. Fit may vary by brand and style.
          </p>
        </section>

        {/* CTA */}
        <section className="bg-mbg-black/10 border-t">
          <div className="max-w-7xl mx-auto px-6 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-base font-semibold">
                Still unsure about your size?
              </h2>
              <p className="text-xs mt-1">
                Compare both units above or contact our team for personalized
                help.
              </p>
            </div>
            <a
              href="/contact"
              className="mbg-prime"
            >
              Contact Support
            </a>
          </div>
        </section>
      </main>
    </Container>
  );
}
