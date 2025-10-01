import Container from "@/components/mbg-components/Container";
import { H2 } from "@/components/mbg-components/H2";
import { H3 } from "@/components/mbg-components/H3";
import Separator from "@/components/mbg-components/Separator";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "The Background",
  description: "Discover the inspiration and commitment driving Milos BG's basketball culture collections.",
  path: "/the-background",
  image: "/Grinder.png",
  keywords: ["brand story", "Milos BG", "basketball culture"],
});



const VIDEO_ID = "vaeio3idHzU"; // ← replace with your YouTube ID (e.g. "dQw4w9WgXcQ")

const AboutUs = () => {
  return (
    <Container className="mt-4">
      {/* Breadcrumb + Back */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-mbg-black/7 px-4 py-2">
        <nav
          aria-label="Fil d'Ariane"
          className="text-[11px] text-mbg-darkgrey"
        >
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="text-mbg-green uppercase font-medium">
                Accueil
              </Link>
            </li>
            <li aria-hidden className="text-mbg-black bg-mbg-black">
              |
            </li>
            <li className="font-semibold uppercase text-mbg-black">
              The Background
            </li>
          </ol>
        </nav>
        <Link
          href="/"
          className="inline-flex bg-mbg-rgbablank items-center rounded-xs border border-mbg-green px-3 py-1.5 text-[12px] font-semibold text-mbg-green hover:bg-mbg-green hover:text-mbg-white hoverEffect uppercase transition"
        >
          ← Retour à la boutique
        </Link>
      </div>

      <H2>The Background</H2>
      <Separator className="bg-mbg-black mt-2 mb-6" />

      {/* Hero: Video + Intro copy */}
      <section className="grid gap-6">
        <div className="md:col-span-6">
          <div className="rounded-xs border border-mbg-black/10 overflow-hidden shadow-sm bg-mbg-black/5">
            <div className="aspect-video">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${VIDEO_ID}?rel=0&modestbranding=1`}
                title="Présentation — Milos BG"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="mt-5">
        <p className="mt-2 text-xs text-mbg-green">
          Born in a modest studio, the brand has always stood by a simple
          principle : quality and craftsmanship above all else. Each piece is
          meticulously designed, tested, refined, and released in limited,
          purposeful editions.
        </p>
      </section>

      {/* Craft + Materials */}
      <section className="mt-8 grid gap-6">
        <div className="rounded-xs border border-mbg-black/7 bg-mbg-white p-4">
          <H3 className="text-mbg-green text-base m-0">Grind in Production</H3>
          <p className="mt-2 text-xs text-mbg-black/95">
            The main production is handmade, the quality is checked and we give
            our best for a great customer experience
          </p>
        </div>
      </section>

      {/* Numbers / Highlights */}
      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          ["2022", "Year of creation"],

          ["MANTRA", "Grind Until Achieve"],

          ["Slogan", "Make It your Liked OutfitS"],
        ].map(([big, label]) => (
          <div
            key={label}
            className="rounded-xs border border-mbg-black/7 bg-mbg-black/7 p-4 text-center"
          >
            <div className="text-lg uppercase font-bold tracking-tight text-mbg-white/90">
              {big}
            </div>
            <div className="mt-1 text-[9.5px] font-semibold uppercase text-mbg-green">
              {label}
            </div>
          </div>
        ))}
      </section>

      {/* CTA */}
      <section className="mt-10 rounded-xs border border-mbg-green/40 bg-mbg-green/7 p-4">
        <H3 className="text-base text-mbg-green m-0">Get in touch&nbsp;</H3>
        <p className="mt-2 text-xs text-mbg-black/95">
          Grind and discover our <strong>OUTFITS</strong> and{" "}
          <strong>CHAPTERS</strong>
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Link
            href="/"
            className="rounded-xs border border-mbg-green px-3 py-1.5 text-[12px] font-semibold text-mbg-green hover:bg-mbg-green hover:text-mbg-white hoverEffect uppercase transition"
          >
            Discover
          </Link>
          <Link
            href="/contact"
            className="rounded-xs border border-mbg-darkgrey px-3 py-1.5 text-[12px] font-semibold text-mbg-darkgrey hover:bg-mbg-darkgrey hover:text-mbg-white hoverEffect uppercase transition"
          >
            Contact Us
          </Link>
        </div>
      </section>

      <footer className="mt-12 border-t pt-6 text-[10px] text-mbg-green">
        <p>
          Last update&nbsp;:&nbsp;
          {/* {new Date().toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "2-digit",
          })} */}
          {/* UPDATE MANUALLY */}
          24/09/2025
        </p>
        <p className="mt-2">
          &copy; {new Date().getFullYear()} Milos BG - All rights reserved
        </p>
      </footer>
    </Container>
  );
};

export default AboutUs;
