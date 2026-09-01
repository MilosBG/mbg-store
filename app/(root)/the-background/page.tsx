import Container from "@/components/mbg-components/Container";
import { H2 } from "@/components/mbg-components/H2";
import { H3 } from "@/components/mbg-components/H3";
import Separator from "@/components/mbg-components/Separator";
import Link from "next/link";
import { buildMetadata } from "@/lib/seo";
import Image from "next/image";
import { BG, MBG2 } from "@/images";

export const metadata = buildMetadata({
  title: "The Background",
  description:
    "Discover the inspiration and commitment driving Milos BG's basketball culture collections.",
  path: "/the-background",
  image: "/Grinder.png",
  keywords: ["brand story", "Milos BG", "basketball culture"],
});

const VIDEO_ID = "xXFQgvUs08s";

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
      <section className="mt-10 overflow-hidden border-y border-mbg-black/10">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <div className="relative grid min-h-[620px] items-center gap-10 py-12 md:grid-cols-[1.05fr_0.95fr] md:py-0 lg:min-h-[700px]">
            {/* LEFT — CONTENT */}
            <div className="relative z-10 max-w-2xl py-8 md:py-20">
              {/* Small label */}
              <div className="mb-8 flex items-center gap-4">
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-mbg-green">
                  Our Philosophy
                </span>

                <div className="h-px w-10 bg-mbg-green" />
              </div>

              {/* Main title */}
              <h2 className="max-w-xl text-[clamp(2.4rem,5vw,5.5rem)] font-semibold leading-[0.95] tracking-[-0.045em] text-mbg-black">
                A story of
                <span className="block text-mbg-green">progression.</span>
              </h2>

              {/* Intro */}
              <p className="mt-8 max-w-xl text-sm leading-7 text-mbg-darkgrey md:text-[15px]">
                Born in a modest studio, Milos BG has always stood by one
                uncompromising principle,
                <strong className="font-semibold text-mbg-black">
                  {" "}
                  quality and craftsmanship above all else.
                </strong>
              </p>

              <p className="mt-5 max-w-xl text-sm leading-7 text-mbg-darkgrey md:text-[15px]">
                Every piece is thoughtfully designed, tested, refined and
                handcrafted with purpose before being released in limited
                editions. Nothing exists simply to fill a collection.
              </p>

              {/* Mentality */}
              <div className="mt-10 max-w-xl border-l-2 border-mbg-green pl-5">
                <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-mbg-green">
                  The Mentality
                </span>

                <p className="mt-3 text-sm leading-7 text-mbg-black/75">
                  Achievement is not a single moment. It is the result of what
                  we repeatedly choose to do when nobody is watching.
                </p>
              </div>
            </div>

            {/* RIGHT — IMAGE */}
            <div className="relative flex h-[440px] items-center justify-center md:h-full">
              {/* Green detail behind image */}
              <div className="absolute bottom-[12%] right-[12%] h-36 w-36 rounded-full bg-mbg-green/[0.06] blur-3xl md:h-60 md:w-60" />

              <div className="relative h-full w-full max-w-[520px]">
                <Image
                  src={BG}
                  alt="Milos BG — Basketball Court"
                  fill
                  priority
                  className="object-contain object-center"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              </div>
            </div>

            {/* Bottom chapter marker */}
            <div className="absolute bottom-7 left-0 hidden items-center gap-4 md:flex">
              <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-mbg-black/35">
                Grind
              </span>

              <span className="h-px w-8 bg-mbg-black/20" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-mbg-black/35">
                Resilience
              </span>

              <span className="h-px w-8 bg-mbg-black/20" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-mbg-black/35">
                Consistency
              </span>

              <span className="h-px w-8 bg-mbg-black/20" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-mbg-black/35">
                Focus
              </span>

              <span className="h-px w-8 bg-mbg-black/20" />

              <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-mbg-black/35">
                Achieve
              </span>
            </div>
          </div>
        </div>
       
        {/* Five Chapters */}
        <div className="border-y border-mbg-black/10 bg-mbg-black/[0.025] py-12 md:py-16">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-mbg-green">
                  The Guideline
                </span>

                <h3 className="mt-2 text-2xl font-bold uppercase tracking-tight text-mbg-black md:text-4xl">
                  Five Chapters.
                  <br />
                  One Journey.
                </h3>
              </div>

              <p className="max-w-md text-xs leading-6 text-mbg-darkgrey md:text-right">
                Like the chapters of a book, each step builds upon the one
                before it. Not simply meant to be read, but lived.
              </p>
            </div>

            <div className="divide-y divide-mbg-black/10 border-y border-mbg-black/10">
              {[
                {
                  number: "I",
                  title: "GRIND",
                  color: "#000000",
                  description:
                    "The decision to begin. To work when motivation fades. To embrace the process and keep moving forward.",
                },
                {
                  number: "II",
                  title: "RESILIENCE",
                  color: "#404040",
                  description:
                    "The strength to get back up. To turn failure, pressure and adversity into fuel.",
                },
                {
                  number: "III",
                  title: "CONSISTENCY",
                  color: "#BFBFBF",
                  description:
                    "The discipline to return every day. Small actions, repeated relentlessly, becoming progress.",
                },
                {
                  number: "IV",
                  title: "FOCUS",
                  color: "#00821A",
                  description:
                    "The ability to silence distractions, trust the path and keep your eyes on what matters.",
                },
                {
                  number: "V",
                  title: "ACHIEVE",
                  color: "#FFFFFF",
                  description:
                    "Not the end of the journey, but the consequence of everything that came before it.",
                },
              ].map((chapter) => (
                <div
                  key={chapter.title}
                  className="group grid gap-4 py-7 transition-all duration-300 md:grid-cols-[80px_220px_1fr] md:items-center"
                >
                  <span className="text-xs font-bold tracking-[0.2em] text-mbg-green">
                    {chapter.number}
                  </span>

                  <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3">
                    <h4 className="text-xl font-bold uppercase tracking-tight text-mbg-black transition-colors group-hover:text-mbg-green md:text-2xl">
                      {chapter.title}
                    </h4>

                    <span className="inline-flex w-fit items-center gap-2 rounded-full border border-mbg-black/10 bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-mbg-darkgrey">
                      <span
                        className="h-3 w-3 rounded-full border border-mbg-black/15"
                        style={{ backgroundColor: chapter.color }}
                      />
                      {chapter.color}
                    </span>
                  </div>

                  <p className="max-w-xl text-xs leading-6 text-mbg-darkgrey md:text-[13px]">
                    {chapter.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mantra */}
        <div className="mx-auto max-w-full py-14 md:py-20">
          <div className="relative overflow-hidden bg-mbg-black px-6 py-12 md:px-12 md:py-16">
            <span className="absolute right-4 top-0 select-none text-[100px] font-black leading-none text-mbg-white/[0.03] md:text-[180px]">
              05
            </span>

            <div className="relative z-10 max-w-3xl">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-mbg-green">
                The Mantra
              </span>

              <h3 className="mt-5 text-2xl font-bold uppercase leading-[0.95] tracking-[-0.04em] text-mbg-white sm:text-5xl md:text-7xl">
                Gr<text className="text-mbg-green">i</text>nd{" "}
                <text className="text-mbg-green">Until</text> Achie
                <text className="text-mbg-green">v</text>e
              </h3>

              <p className="mt-7 max-w-xl text-xs leading-6 text-mbg-white/60 md:text-sm">
                Once the mentality becomes part of who you are, you don&apos;t
                simply believe in it, you wear it.
              </p>
            </div>
          </div>
        </div>

        {/* Clothing + Philosophy */}
        <div className="mx-auto max-w-5xl pb-14 md:pb-20">
          <div className="grid gap-10 md:grid-cols-2 md:gap-16">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-mbg-green">
                Wear The Mentality
              </span>

              <h3 className="mt-3 text-2xl font-bold uppercase leading-tight tracking-tight text-mbg-black md:text-3xl">
                Where clothing
                <br />
                and philosophy
                <br />
                become one.
              </h3>
            </div>

            <div className="space-y-6 text-[13px] leading-7 text-mbg-darkgrey">
              <p>
                Each Milos BG collection represents a new Chapter of that story,
                translating its mentality into garments with their own purpose,
                identity and message.
              </p>

              <p>
                Every piece becomes a physical reminder of the journey:
                <strong className="font-semibold text-mbg-black">
                  {" "}
                  keep working, keep learning, keep improving, keep moving
                  forward.
                </strong>
              </p>

              <p>
                Inspired by craftsmanship, sport, basketball, movement, and
                Japanese philosophy, especially the spirit of Kaizen, the
                pursuit of continuous improvement through discipline, patience,
                and repetition, Milos BG also draws inspiration from the
                Madagascar periwinkle, a flower whose remarkable resilience and
                ability to endure challenging conditions echo the mindset at the
                heart of the brand.
              </p>
              <p>
                Milos BG creates pieces designed to accompany you throughout the
                process. From the quiet hours when no one sees the work to the
                moments when that dedication finally speaks for itself, every
                garment reflects the belief that progress is built step by step,
                through resilience, consistency, intention, and respect for the
                craft. Like the Madagascar periwinkle, it is about continuing to
                grow, adapt, and move forward regardless of the conditions.
              </p>
            </div>
          </div>
        </div>

        {/* The unseen work */}
        <div className="border-y border-mbg-black/10 py-12 md:py-16">
          <Image
            src={MBG2}
            alt="Grind Until Achieve"
            className="
    mx-auto
    h-auto
    w-[46%]
    max-w-[460px]
    object-center
    py-8
    sm:w-[68%]
    md:w-[64%]
    lg:w-[60%]
  "
          />
        </div>
        {/* The unseen work */}
        <div className="border-y border-mbg-black/10 py-12 md:py-16">
          <div className="mx-auto max-w-5xl">
            <div className="grid gap-10 md:grid-cols-[1fr_1.2fr] md:items-center">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-mbg-green">
                  Before Achievement
                </span>

                <p className="mt-4 max-w-md text-base leading-8 text-mbg-black md:text-lg">
                  ACHIEVE means very little without everything required to reach
                  it.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-x-8 gap-y-0 border-t border-mbg-black/10 sm:grid-cols-3">
                {[
                  "The setbacks",
                  "The repetitions",
                  "The discipline",
                  "The sacrifices",
                  "The unseen hours",
                  "The invisible progress",
                ].map((item, index) => (
                  <div key={item} className="border-b border-mbg-black/10 py-4">
                    <span className="mr-2 text-[9px] font-bold text-mbg-green">
                      0{index + 1}
                    </span>

                    <span className="text-[10px] font-semibold uppercase tracking-wide text-mbg-black">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Closing / Progression Chart */}
        <div className="mx-auto max-w-5xl py-16 md:py-24">
          {/* Heading */}
          <div className="max-w-4xl">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-mbg-green">
              The Journey
            </span>

            <h2 className="mt-5 max-w-3xl text-2xl font-semibold leading-[1.25] tracking-tight text-mbg-black md:text-4xl">
              We don&apos;t celebrate only the destination.
              <span className="mt-1 block text-mbg-green">
                We celebrate the GRIND that makes it possible.
              </span>
            </h2>
          </div>

          {/* Chart */}
          <div className="relative mt-16 md:mt-20">
            {/* Desktop horizontal line */}
            <div className="absolute left-0 right-0 top-[22px] hidden h-px bg-mbg-black/15 md:block" />

            {/* Green progress line */}
            <div className="absolute left-0 top-[22px] hidden h-px w-[75%] bg-mbg-green md:block" />

            <div className="grid gap-10 md:grid-cols-4 md:gap-6">
              {/* 01 */}
              <div className="group relative">
                <div className="relative z-10 flex items-center md:block">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-mbg-green bg-white text-[10px] font-bold tracking-widest text-mbg-green transition-all duration-300 group-hover:bg-mbg-green group-hover:text-white">
                    01
                  </div>

                  {/* Mobile line */}
                  <div className="ml-4 h-px flex-1 bg-mbg-black/10 md:hidden" />
                </div>

                <div className="mt-5 md:mt-8">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-mbg-black/40">
                    Chapter
                  </span>

                  <p className="mt-2 max-w-[190px] text-sm font-semibold leading-6 text-mbg-black">
                    Every Chapter
                    <span className="block font-normal text-mbg-black/60">
                      tells a story.
                    </span>
                  </p>
                </div>
              </div>

              {/* 02 */}
              <div className="group relative">
                <div className="relative z-10 flex items-center md:block">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-mbg-green bg-white text-[10px] font-bold tracking-widest text-mbg-green transition-all duration-300 group-hover:bg-mbg-green group-hover:text-white">
                    02
                  </div>

                  <div className="ml-4 h-px flex-1 bg-mbg-black/10 md:hidden" />
                </div>

                <div className="mt-5 md:mt-8">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-mbg-black/40">
                    Collection
                  </span>

                  <p className="mt-2 max-w-[190px] text-sm font-semibold leading-6 text-mbg-black">
                    Every collection
                    <span className="block font-normal text-mbg-black/60">
                      represents a step forward.
                    </span>
                  </p>
                </div>
              </div>

              {/* 03 */}
              <div className="group relative">
                <div className="relative z-10 flex items-center md:block">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-mbg-green bg-white text-[10px] font-bold tracking-widest text-mbg-green transition-all duration-300 group-hover:bg-mbg-green group-hover:text-white">
                    03
                  </div>

                  <div className="ml-4 h-px flex-1 bg-mbg-black/10 md:hidden" />
                </div>

                <div className="mt-5 md:mt-8">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-mbg-black/40">
                    Piece
                  </span>

                  <p className="mt-2 max-w-[190px] text-sm font-semibold leading-6 text-mbg-black">
                    Every piece
                    <span className="block font-normal text-mbg-black/60">
                      carries a message.
                    </span>
                  </p>
                </div>
              </div>

              {/* 04 */}
              <div className="group relative">
                <div className="relative z-10 flex items-center md:block">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-mbg-black bg-mbg-black text-[10px] font-bold tracking-widest text-white transition-all duration-300 group-hover:border-mbg-green group-hover:bg-mbg-green">
                    04
                  </div>
                </div>

                <div className="mt-5 md:mt-8">
                  <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-mbg-black/40">
                    Journey
                  </span>

                  <p className="mt-2 max-w-[190px] text-sm font-semibold leading-6 text-mbg-black">
                    Every person
                    <span className="block font-normal text-mbg-black/60">
                      continues the journey.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Closing mantra */}
          <div className="mt-16 flex items-center gap-4 border-t border-mbg-black/10 pt-6 md:mt-20">
            <div className="h-[2px] w-8 bg-mbg-green" />

            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-mbg-black">
              Grind Until Achieve
            </p>
          </div>
        </div>

        {/* Final Signature */}
        <div className="bg-mbg-white/90 px-6 py-12 text-center md:py-16">
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-mbg-black/60">
            This is Milos BG
          </p>

          <div className="mx-auto mt-6 max-w-4xl">
            <p className="text-2xl font-bold uppercase leading-[1.15] tracking-tight text-mbg-black sm:text-3xl md:text-5xl">
              A story you don&apos;t simply read.
              <br />
              A mentality you don&apos;t simply follow.
              <br />
              <span className="text-mbg-green">A journey you wear.</span>
            </p>
          </div>

          <div className="mx-auto mt-10 h-px max-w-xs bg-mbg-black/20" />

          <div className="mt-8 space-y-1">
            <p className="text-sm font-black uppercase tracking-[0.15em] text-mbg-black">
              Grind Until <text className="text-mbg-green">You</text> Achieve.
            </p>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-mbg-green">
              Make It Your Liked Outfits.
            </p>

            <p className="pt-3 text-xs font-medium text-mbg-black">
              Enjoy the Grind. ✿
            </p>
          </div>
        </div>
      </section>

      {/* Craft + Materials */}
      <section className="mt-8 grid gap-6">
        <div className="rounded-xs border border-mbg-black/7 bg-mbg-white p-4">
          <H3 className="text-mbg-green text-base m-0">Grind in Production</H3>

          <p className="mt-2 text-xs text-mbg-black/95">
            The main production is handmade, the quality is checked and we give
            our best for a great customer experience.
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
            <div className="text-lg uppercase font-bold tracking-tight text-mbg-black/80">
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
          {/* UPDATE MANUALLY */}
          19/08/2026
        </p>

        <p className="mt-2">
          &copy; {new Date().getFullYear()} Milos BG - All rights reserved
        </p>
      </footer>
    </Container>
  );
};

export default AboutUs;
