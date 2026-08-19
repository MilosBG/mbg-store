import Container from "@/components/mbg-components/Container";
import { H2 } from "@/components/mbg-components/H2";
import { H3 } from "@/components/mbg-components/H3";
import Separator from "@/components/mbg-components/Separator";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "The Background",
  description:
    "Discover the inspiration and commitment driving Milos BG's basketball culture collections.",
  path: "/the-background",
  image: "/Grinder.png",
  keywords: ["brand story", "Milos BG", "basketball culture"],
});

const VIDEO_ID = "xXFQgvUs08s"; // ← replace with your YouTube ID (e.g. "dQw4w9WgXcQ")

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
                Home
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
          ← Back to shop
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
          Milos BG is more than a clothing brand, it is a story of progression,
          written one chapter at a time. Born in a modest studio, Milos BG has
          always stood by one uncompromising principle: quality and
          craftsmanship above all else. Every piece is thoughtfully designed,
          tested, refined, and handcrafted with purpose before being released in
          limited editions. Nothing is created simply to fill a collection.
          Every garment has a reason to exist. But Milos BG was never meant to
          be only about clothing. The brand is built around a philosophy of
          continuous improvement, the belief that achievement is not a single
          moment, but the result of what we repeatedly choose to do when nobody
          is watching. That philosophy unfolds through five Chapters: CHAPTER I
          | GRIND The decision to begin. To work when motivation fades. To
          embrace the process and keep moving forward. CHAPTER II | RESILIENCE
          The strength to get back up. To turn failure, pressure and adversity
          into fuel. CHAPTER III | CONSISTENCY The discipline to return every
          day. Small actions, repeated relentlessly, becoming progress. CHAPTER
          IV | FOCUS The ability to silence distractions, trust the path and
          keep your eyes on what matters. CHAPTER V | ACHIEVE Not the end of the
          journey, but the consequence of everything that came before it. GRIND.
          RESILIENCE. CONSISTENCY. FOCUS. ACHIEVE. Five Chapters. One journey.
          Together, they form the Milos BG guideline, like the chapters of a
          book that is not simply meant to be read, but lived. Because once you
          understand the journey, the message becomes simple: GRIND UNTIL
          ACHIEVE. And when that mentality becomes part of who you are, you
          don't simply believe in it, you wear it. That is where clothing and
          philosophy become one. Wear the mentality. MAKE IT YOUR LIKED OUTFITS.
          Each Milos BG collection represents a new Chapter of that story,
          translating its mentality into garments with their own purpose,
          identity and message. Every piece becomes a physical reminder of the
          journey: keep working, keep learning, keep improving, keep moving
          forward. Inspired by craftsmanship, sport, basketball, movement and
          the relentless pursuit of self-improvement, Milos BG creates pieces
          designed to accompany you through the process, from the quiet hours
          when nobody sees the work, to the moments when that work finally
          speaks for itself. Because ACHIEVE means very little without
          everything required to reach it. The setbacks. The repetitions. The
          discipline. The sacrifices. The unseen hours. The days when progress
          feels invisible. That is where Milos BG lives. Not only in the
          victory, but in everything that happens before it. We don't celebrate
          only the destination. We celebrate the GRIND that makes the
          destination possible. Every Chapter tells a story. Every collection
          represents a step forward. Every piece carries a message. And every
          person who wears it continues the journey in their own way. This is
          Milos BG. A story you don't simply read. A mentality you don't simply
          follow. A journey you wear. GRIND UNTIL YOU ACHIEVE. MAKE IT YOUR
          LIKED OUTFITS. Enjoy the Grind. ✿
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
