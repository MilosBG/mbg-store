import Container from "@/components/mbg-components/Container";
import Link from "next/link";
import Image from "next/image";
import { buildMetadata } from "@/lib/seo";

import {
  ACHIEVE,
  BG,
  CONSISTENCY,
  FOCUS,
  GRIND,
  MBG2,
  RESILIENCE,
} from "@/images";

export const metadata = buildMetadata({
  title: "The Background",
  description:
    "Enter the world of Milos BG: five chapters, one journey, and the craftsmanship behind the GRIND UNTIL ACHIEVE mentality.",
  path: "/the-background",
  image: "/Grinder.png",
  keywords: [
    "brand story",
    "Milos BG",
    "basketball culture",
    "Grind Until Achieve",
    "craftsmanship",
  ],
});

const VIDEO_ID = "dadrxcC8HOw";

const chapters = [
  {
    number: "I",
    title: "GRIND",
    passage: "THE CALL",
    color: "#000000",
    emblem: GRIND,
    short: "The moment you decide to begin.",
    description:
      "The decision to begin. To work when motivation fades. To embrace the process and keep moving forward.",
    challenge: "Will you begin even before you feel ready?",
  },
  {
    number: "II",
    title: "RESILIENCE",
    passage: "THE FALL",
    color: "#404040",
    emblem: RESILIENCE,
    short: "The courage to rise after impact.",
    description:
      "The strength to get back up. To turn failure, pressure and adversity into fuel — not a reason to stop.",
    challenge: "What will you learn from what tried to break you?",
  },
  {
    number: "III",
    title: "CONSISTENCY",
    passage: "THE RETURN",
    color: "#BFBFBF",
    emblem: CONSISTENCY,
    short: "The quiet discipline of showing up again.",
    description:
      "The discipline to return every day. Small actions, repeated with intention, becoming progress that may remain invisible for a long time.",
    challenge: "Can you continue when there is no applause?",
  },
  {
    number: "IV",
    title: "FOCUS",
    passage: "THE AIM",
    color: "#00821A",
    emblem: FOCUS,
    short: "The choice to give your effort direction.",
    description:
      "The ability to silence distractions, trust the path and keep your eyes on what matters. Energy becomes meaningful when it has a direction.",
    challenge: "What deserves your undivided attention?",
  },
  {
    number: "V",
    title: "ACHIEVE",
    passage: "THE ASCENT",
    color: "#FFFFFF",
    emblem: ACHIEVE,
    short: "The outcome and the beginning of more.",
    description:
      "Not the end of the journey, but the consequence of everything that came before it. What you learn becomes the foundation of the next chapter.",
    challenge: "Who will you become on the way there?",
  },
] as const;

const unseenWork = [
  "The setbacks",
  "The repetitions",
  "The discipline",
  "The sacrifices",
  "The unseen hours",
  "The invisible progress",
] as const;

const progression = [
  {
    number: "01",
    title: "A CHAPTER",
    text: "Every chapter tells a story.",
  },
  {
    number: "02",
    title: "A COLLECTION",
    text: "Every collection represents a step forward.",
  },
  {
    number: "03",
    title: "A PIECE",
    text: "Every piece carries a message.",
  },
  {
    number: "04",
    title: "YOUR JOURNEY",
    text: "Every person continues the journey.",
  },
] as const;

const Mantra = ({ className = "" }: { className?: string }) => (
  <span className={className}>
    GR<span className="text-mbg-green">I</span>ND{" "}
    <span className="text-mbg-green">UNTIL</span> ACHIE
    <span className="text-mbg-green">V</span>E
  </span>
);

const AboutUs = () => {
  return (
    <main className="min-h-screen bg-mbg-black font-kanit text-mbg-white selection:bg-mbg-green selection:text-mbg-white">
      <Container className="pb-12 pt-4 sm:pt-6">
        {/* BREADCRUMBS */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-mbg-white/10 bg-mbg-darkgrey/20 px-4 py-3 sm:px-5">
          <nav aria-label="Breadcrumb" className="text-[10px] font-bold uppercase tracking-[0.12em] sm:text-xs">
            <ol className="flex items-center gap-3">
              <li>
                <Link href="/" className="text-mbg-white/55 transition-colors hover:text-mbg-green">
                  Home
                </Link>
              </li>
              <li aria-hidden="true" className="text-mbg-green">/</li>
              <li className="text-mbg-white">The Background</li>
            </ol>
          </nav>
          <Link
            href="/products"
            className="inline-flex min-h-9 items-center border border-mbg-green/60 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.09em] text-mbg-white transition-colors hover:bg-mbg-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mbg-green"
          >
            Back to the outfits <span aria-hidden="true" className="ml-2">↗</span>
          </Link>
        </div>

        {/* ACT I: THE THRESHOLD */}
        <header className="relative isolate overflow-hidden border border-mbg-white/10 bg-[#070b08]">
          <div aria-hidden="true" className="mbg-ambient pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_78%_28%,rgba(0,130,26,0.18),transparent_57%)]" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-28 -top-40 size-[400px] rounded-full border border-mbg-white/10 sm:size-[640px]" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-32 top-24 size-[340px] rounded-full border border-mbg-green/15 sm:size-[580px]" />
          <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 hidden w-[57%] opacity-30 lg:block">
            <Image
              src={BG}
              alt=""
              fill
              priority
              sizes="(min-width: 1024px) 45vw, 1px"
              className="object-contain object-right [mask-image:linear-gradient(to_right,transparent,black_40%)]"
            />
          </div>

          <div className="relative z-10 grid min-h-[575px] items-center gap-10 px-5 pb-20 pt-16 sm:px-9 sm:pb-24 sm:pt-20 lg:min-h-[680px] lg:grid-cols-[minmax(0,1fr)_220px] lg:px-14">
            <div className="mbg-entrance max-w-4xl">
              <div className="mb-8 flex items-center gap-3">
                <span aria-hidden="true" className="h-[3px] w-10 shrink-0 bg-mbg-green" />
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-mbg-white/70 sm:text-xs">
                  Milos BG <span className="mx-2 text-mbg-green">/</span> The Background
                </p>
              </div>
              <p className="mb-4 text-xs font-semibold uppercase tracking-[0.23em] text-mbg-green">
                An invitation to go beyond yourself
              </p>
              <h1 className="max-w-4xl text-[clamp(2.8rem,8.7vw,7.5rem)] text-mbg-black font-black uppercase leading-[0.9] tracking-normal text-shadow-2xs text-shadow-mbg-green/50">
                THE JOURNEY
                <span className="mt-2 block text-mbg-green">IS THE TEST.</span>
              </h1>
              <div className="mt-8 h-px w-full max-w-xl bg-gradient-to-r from-mbg-green via-mbg-white/20 to-transparent" />
              <p className="mt-7 max-w-xl text-sm font-medium leading-7 text-mbg-white/80 sm:text-base sm:leading-8">
                Not every journey leads through mountains or across oceans. Some begin with a choice to keep going when the path becomes difficult.
              </p>
              <p className="mt-3 max-w-xl text-xs leading-6 text-mbg-white/55 sm:text-sm sm:leading-7">
                This is the world of Milos BG. Five chapters, countless unseen hours, and one mentality <strong className="font-bold text-mbg-white">GRIND UNTIL ACHIEVE</strong>
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href="#the-origin"
                  className="inline-flex min-h-12 items-center justify-center gap-3 border border-mbg-green bg-mbg-green px-5 py-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-mbg-white transition-[background-color,border-color,transform] duration-300 hover:border-mbg-white hover:bg-mbg-black motion-safe:hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mbg-white"
                >
                  Enter the journey <span aria-hidden="true">↓</span>
                </a>
                <a
                  href="#the-film"
                  className="inline-flex min-h-12 items-center justify-center border border-mbg-white/25 bg-mbg-white/[0.04] px-5 py-3 text-[11px] font-extrabold uppercase tracking-[0.12em] text-mbg-white transition-colors duration-300 hover:border-mbg-green hover:bg-mbg-green/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mbg-green"
                >
                  Watch the story ↗
                </a>
              </div>
            </div>
            <div className="hidden self-end justify-self-end pb-7 text-right lg:block" aria-hidden="true">
              <p className="text-[112px] font-black leading-none tracking-[-0.1em] text-mbg-white/[0.07]">05</p>
              <p className="mt-2 text-[10px] font-extrabold uppercase tracking-[0.25em] text-mbg-green">Five Chapters</p>
              <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.18em] text-mbg-white/45">One Journey</p>
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-5 border-t border-mbg-white/10 bg-mbg-black/45">
            {chapters.map((chapter) => (
              <a
                key={chapter.number}
                href="#five-chapters"
                className="group flex min-h-[68px] min-w-0 flex-col items-center justify-center gap-1 border-r border-mbg-white/10 px-1 py-3 text-center transition-colors hover:bg-mbg-green/10 last:border-r-0 sm:min-h-[78px]"
                aria-label={`Explore ${chapter.title}`}
              >
                <span className="text-xs font-black text-mbg-green sm:text-sm">{chapter.number}</span>
                <span className="text-[8px] font-black uppercase tracking-[-0.01em] text-mbg-white/65 transition-colors group-hover:text-mbg-white sm:text-[10px] sm:tracking-[0.06em]">
                  {chapter.title}
                </span>
              </a>
            ))}
          </div>
          <div aria-hidden="true" className="absolute bottom-0 left-0 z-20 h-[3px] w-1/5 bg-mbg-green" />
        </header>

        {/* ACT II: THE ORIGIN */}
        <section id="the-origin" aria-labelledby="origin-title" className="scroll-mt-16 border-x border-b border-mbg-white/10 px-5 py-16 sm:px-9 sm:py-20 lg:px-14 lg:py-28">
          <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.27em] text-mbg-green">01 / The origin</p>
              <h2 id="origin-title" className="mt-5 text-[clamp(2.3rem,5.5vw,5.5rem)] font-black uppercase leading-[0.96] tracking-[-0.055em]">
                GREAT THINGS
                <span className="block text-mbg-green">BEGIN QUIETLY.</span>
              </h2>
              <div className="mt-7 h-[3px] w-14 bg-mbg-green" />
            </div>
            <div className="space-y-6 text-sm leading-8 text-mbg-white/70 sm:text-[15px]">
              <p>
                Born in a modest studio, Milos BG has always stood by one uncompromising principle: <strong className="font-semibold text-mbg-white">quality and craftsmanship above all else.</strong>
              </p>
              <p>
                Every piece is thoughtfully designed, tested, refined and handcrafted with purpose before being released in limited editions. Nothing exists simply to fill a collection.
              </p>
              <p>
                Inspired by basketball and the discipline behind it, the brand tells a story about effort, the part of achievement that rarely appears in the spotlight.
              </p>
              <blockquote className="border-l-[3px] border-mbg-green bg-mbg-white/[0.035] px-5 py-5 text-base font-semibold leading-8 text-mbg-white sm:text-lg">
                “Achievement is not a single moment. It is the result of what we repeatedly choose to do when nobody is watching.”

                <text className="text-mbg-darkgrey">Gamil BEN. A</text>
              </blockquote>
            </div>
          </div>
        </section>

        {/* THE FILM */}
        <section id="the-film" aria-labelledby="film-title" className="scroll-mt-16 border-x border-b border-mbg-white/10 bg-mbg-darkgrey/15 px-4 py-12 sm:px-8 sm:py-16 lg:px-14 lg:py-20">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.27em] text-mbg-green">A closer look</p>
              <h2 id="film-title" className="mt-3 text-2xl font-black uppercase tracking-[-0.045em] sm:text-4xl">THE STORY IN MOTION.</h2>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-mbg-white/45">Milos BG / Film</span>
          </div>
          <div className="relative overflow-hidden border border-mbg-white/15 bg-mbg-black shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
            <div aria-hidden="true" className="h-[3px] w-28 bg-mbg-green" />
            <div className="aspect-video">
              <iframe
                className="h-full w-full"
                src={`https://www.youtube.com/embed/${VIDEO_ID}?rel=0`}
                title="The Background — Milos BG"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
              />
            </div>
          </div>
          <p className="mt-4 text-xs leading-6 text-mbg-white/45">Before the outfit, there is an idea. Before the result, there is the work.</p>
        </section>

        {/* ACT III: THE FIVE TRIALS */}
        <section id="five-chapters" aria-labelledby="chapters-title" className="scroll-mt-14 border-x border-b border-mbg-white/10 px-4 py-16 sm:px-8 sm:py-20 lg:px-14 lg:py-24">
          <div className="mb-10 grid gap-6 lg:grid-cols-[1fr_0.75fr] lg:items-end lg:gap-14">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.27em] text-mbg-green">02 / The five chapters</p>
              <h2 id="chapters-title" className="mt-4 text-[clamp(2.7rem,6.6vw,6.5rem)] font-black uppercase leading-[0.92] tracking-[-0.055em]">
                FIVE TRIALS.
                <span className="block text-mbg-green">ONE JOURNEY.</span>
              </h2>
            </div>
            <div className="max-w-md lg:pb-2">
              <p className="text-sm leading-7 text-mbg-white/65">
                Every new chapter asks something of you. Each stage builds on the one before it. These are not simply words to read, they are principles to live.
              </p>
              <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.14em] text-mbg-green">Open a chapter to discover its challenge ↓</p>
            </div>
          </div>

          <div className="border-t border-mbg-white/15">
            {chapters.map((chapter) => (
              <details
                key={chapter.number}
                className="group border-b border-mbg-white/15 bg-transparent transition-colors duration-300 open:bg-mbg-white/[0.035]"
              >
                <summary className="grid min-h-[128px] cursor-pointer list-none grid-cols-[44px_minmax(0,1fr)_54px] items-center gap-3 px-2 py-5 transition-colors hover:bg-mbg-green/[0.045] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-mbg-green sm:grid-cols-[65px_minmax(0,1fr)_100px_38px] sm:gap-5 sm:px-4 [&::-webkit-details-marker]:hidden">
                  <span className="self-start pt-2 text-xs font-black tracking-[0.09em] text-mbg-green sm:self-center sm:pt-0 sm:text-sm">{chapter.number}</span>
                  <span className="min-w-0">
                    <span className="block text-[9px] font-bold uppercase tracking-[0.2em] text-mbg-white/40 sm:text-[10px]">{chapter.passage}</span>
                    <span className="mt-2 block break-words text-[clamp(1.35rem,4.2vw,3.5rem)] font-black uppercase leading-none tracking-[-0.045em] text-mbg-white transition-colors duration-300 group-hover:text-mbg-green">{chapter.title}</span>
                    <span className="mt-2 block text-[10px] leading-5 text-mbg-white/55 sm:text-xs">{chapter.short}</span>
                  </span>
                  <span className={`relative flex h-14 w-14 items-center rounded-full justify-center border border-mbg-green/70 p-2 sm:h-20 sm:w-20 sm:p-3 ${chapter.title === "GRIND" ? "bg-mbg-green/70" : "bg-mbg-black"}`}>
                    <Image src={chapter.emblem} alt="" className="max-h-full w-full object-contain transition-transform duration-500 motion-safe:group-hover:scale-110" sizes="(max-width: 600px) 56px, 80px" />
                  </span>
                  <span aria-hidden="true" className="hidden size-9 items-center justify-center border border-mbg-white/20 text-lg font-light text-mbg-green transition-transform duration-300 group-open:rotate-45 sm:flex">+</span>
                </summary>
                <div className="mbg-chapter-content grid gap-5 border-t border-mbg-white/10 px-4 pb-8 pt-6 sm:grid-cols-[1fr_0.8fr] sm:gap-10 sm:px-8">
                  <div>
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-mbg-green">The meaning</p>
                    <p className="max-w-2xl text-sm leading-7 text-mbg-white/75">{chapter.description}</p>
                    <div className="mt-5 flex items-center gap-3">
                      <span className="h-[3px] w-11 border border-mbg-white/20" style={{ backgroundColor: chapter.color }} />
                      <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-mbg-white/45">Chapter signature: {chapter.color}</span>
                    </div>
                  </div>
                  <div className="border-l-2 border-mbg-green bg-mbg-black/45 px-5 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-mbg-white/45">The question</p>
                    <p className="mt-3 text-base font-semibold leading-7 text-mbg-white">{chapter.challenge}</p>
                  </div>
                </div>
                <div aria-hidden="true" className="h-[2px] w-16 bg-mbg-green transition-all duration-500 group-open:w-1/4" />
              </details>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-extrabold uppercase tracking-[0.1em] text-mbg-white/45">The fifth chapter is never the last step.</span>
            <Link href="/grind-until-achieve" className="inline-flex min-h-11 items-center border border-mbg-green px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-mbg-white transition-colors hover:bg-mbg-green focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mbg-green">
              Explore the mantra <span aria-hidden="true" className="ml-3">↗</span>
            </Link>
          </div>
        </section>

        {/* ACT IV: WHAT WE CARRY */}
        <section aria-labelledby="meaning-title" className="border-x border-b border-mbg-white/10 bg-mbg-darkgrey/10 px-5 py-16 sm:px-9 sm:py-20 lg:px-14 lg:py-24">
          <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.27em] text-mbg-green">03 / The inspiration</p>
              <h2 id="meaning-title" className="mt-4 text-[clamp(2.35rem,5.2vw,5rem)] font-black uppercase leading-[0.94] tracking-[-0.05em]">
                CARRY THE
                <span className="block text-mbg-green">MEANING.</span>
              </h2>
              <p className="mt-7 max-w-md text-sm leading-8 text-mbg-white/65">
                Each Milos BG collection represents another chapter of the story. The idea is to translate a mentality into garments with their own identity, purpose and message.
              </p>
              <div className="mt-8 max-w-[450px] border border-mbg-white/10 bg-mbg-black/60 px-7 py-8">
                <Image src={MBG2} alt="Grind Until Achieve visual identity" className="mx-auto h-auto max-h-[240px] w-full object-contain" sizes="(max-width: 1023px) 75vw, 360px" />
              </div>
            </div>

            <div className="space-y-3">
              <article className="group border border-mbg-white/10 bg-mbg-black/45 p-5 transition-colors duration-300 hover:border-mbg-green/45 sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-black uppercase text-mbg-white">KAIZEN</h3>
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-mbg-green">01 / Improve</span>
                </div>
                <div className="my-4 h-px bg-mbg-white/10" />
                <p className="text-sm leading-7 text-mbg-white/65">The pursuit of continuous improvement. Progress is shaped through patience, repetition and the decision to become a little better, one day at a time.</p>
              </article>
              <article className="group border border-mbg-white/10 bg-mbg-black/45 p-5 transition-colors duration-300 hover:border-mbg-green/45 sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-black uppercase text-mbg-white">KINTSUGI</h3>
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-mbg-green">02 / Rebuild</span>
                </div>
                <div className="my-4 h-px bg-mbg-white/10" />
                <p className="text-sm leading-7 text-mbg-white/65">The Japanese art of repairing broken objects while acknowledging the marks of their history. A reminder that what has been endured can become part of our strength.</p>
              </article>
              <article className="group border border-mbg-white/10 bg-mbg-black/45 p-5 transition-colors duration-300 hover:border-mbg-green/45 sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-black uppercase text-mbg-white">MADAGASCAR PERIWINKLE</h3>
                  <span className="text-[10px] font-black uppercase tracking-[0.18em] text-mbg-green">03 / Endure</span>
                </div>
                <div className="my-4 h-px bg-mbg-white/10" />
                <p className="text-sm leading-7 text-mbg-white/65">A resilient flower that can thrive in challenging conditions. Its ability to adapt and keep growing echoes the mentality behind Milos BG.</p>
              </article>
            </div>
          </div>
          <div className="mt-12 grid gap-0 border-y border-mbg-white/10 sm:grid-cols-[0.8fr_1.2fr]">
            <div className="border-b border-mbg-white/10 py-6 sm:border-b-0 sm:border-r sm:pr-6">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-mbg-green">Grind in production</p>
              <h3 className="mt-3 text-xl font-black uppercase tracking-[-0.03em] text-mbg-white">Crafted with purpose.</h3>
            </div>
            <div className="py-6 sm:pl-7">
              <p className="text-sm leading-7 text-mbg-white/65">Milos BG&apos;s main production is handmade. Quality is checked, details matter, and every piece is intended to offer a considered customer experience, not just another item of clothing.</p>
            </div>
          </div>
          <p className="mt-12 max-w-3xl border-l-[3px] border-mbg-green pl-5 text-sm leading-8 text-mbg-white/75 sm:text-base">
            From craftsmanship and sport to basketball, movement and Japanese philosophy, the influences may be different but they lead to one belief, <strong className="text-mbg-white">progress is not defined by perfection. It is built through persistence.</strong>
          </p>
        </section>

        {/* ACT V: THE WORK NOBODY SEES */}
        <section aria-labelledby="unseen-title" className="relative isolate overflow-hidden border-x border-b border-mbg-white/10 bg-[#080b09] px-5 py-16 sm:px-9 sm:py-20 lg:px-14 lg:py-24">
          <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 size-[400px] rounded-full border border-mbg-green/10" />
          <div className="relative z-10 grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center lg:gap-16">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.27em] text-mbg-green">04 / Before achievement</p>
              <h2 id="unseen-title" className="mt-5 text-[clamp(2.45rem,5.6vw,5.2rem)] font-black uppercase leading-[0.95] tracking-[-0.05em]">
                THE WORK
                <span className="block text-mbg-green">NOBODY SEES.</span>
              </h2>
              <p className="mt-7 max-w-lg text-sm leading-8 text-mbg-white/65">
                ACHIEVE means very little without everything required to reach it. Every piece is meant to accompany the person doing that work, from the quiet hours to the moment dedication speaks for itself.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-px border border-mbg-white/10 bg-mbg-white/10 sm:grid-cols-3">
              {unseenWork.map((item, index) => (
                <div key={item} className="group min-h-[125px] bg-[#0c0f0d] p-5 transition-colors duration-300 hover:bg-mbg-green/[0.12] sm:p-6">
                  <span className="text-xs font-black text-mbg-green">0{index + 1}</span>
                  <p className="mt-6 text-xs font-bold uppercase leading-5 tracking-[0.04em] text-mbg-white/75 sm:text-sm">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* THE ROAD CONTINUES */}
        <section aria-labelledby="road-title" className="border-x border-b border-mbg-white/10 px-5 py-16 sm:px-9 sm:py-20 lg:px-14 lg:py-24">
          <div className="max-w-4xl">
            <p className="text-[10px] font-black uppercase tracking-[0.27em] text-mbg-green">05 / The journey continues</p>
            <h2 id="road-title" className="mt-5 text-[clamp(2rem,4.7vw,4.5rem)] font-black uppercase leading-[1.03] tracking-[-0.05em]">
              WE DON&apos;T CELEBRATE ONLY THE DESTINATION.
              <span className="mt-2 block text-mbg-green">WE CELEBRATE THE GRIND THAT MAKES IT POSSIBLE.</span>
            </h2>
          </div>
          <div className="relative mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-4">
            <div aria-hidden="true" className="absolute left-0 right-0 top-[22px] hidden h-px bg-mbg-green/50 lg:block" />
            {progression.map((step) => (
              <div key={step.number} className="group relative border-l border-mbg-white/10 py-2 pl-5 transition-colors hover:border-mbg-green lg:border-l-0 lg:pl-0">
                <div className="relative z-10 flex size-11 items-center justify-center border border-mbg-green bg-mbg-black text-xs font-black text-mbg-green transition-colors duration-300 group-hover:bg-mbg-green group-hover:text-mbg-white">
                  {step.number}
                </div>
                <h3 className="mt-6 text-xs font-black uppercase tracking-[0.15em] text-mbg-green">{step.title}</h3>
                <p className="mt-3 max-w-[220px] text-sm leading-7 text-mbg-white/70">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* MANTRA / FINAL INVITATION */}
        <section aria-labelledby="mantra-title" className="relative isolate overflow-hidden border-x border-b border-mbg-white/10 bg-[#071008] px-5 py-16 text-center sm:px-9 sm:py-20 lg:px-14 lg:py-28">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,130,26,0.18),transparent_65%)]" />
          <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 size-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-mbg-white/10 sm:size-[750px]" />
          <div className="relative z-10 mx-auto max-w-5xl">
            <p className="text-[10px] font-black uppercase tracking-[0.27em] text-mbg-green">The mantra / The promise to yourself</p>
            <h2 id="mantra-title" className="mt-7 text-[clamp(2rem,7vw,6.75rem)] font-black text-mbg-black uppercase leading-[0.94] tracking-[-0.01em] text-shadow-2xs text-shadow-mbg-green/50">
              <Mantra />
            </h2>
            <div className="mx-auto mt-8 h-[3px] w-16 bg-mbg-green" />
            <p className="mx-auto mt-8 max-w-2xl text-sm leading-8 text-mbg-white/75 sm:text-base">
              A story you don&apos;t simply read. A mentality you don&apos;t simply follow. <strong className="font-bold text-mbg-white">A journey you wear.</strong>
            </p>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-mbg-green">Five chapters. One journey.</p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link href="/products" className="inline-flex min-h-12 items-center justify-center border border-mbg-green bg-mbg-green px-6 py-3 text-xs font-black uppercase tracking-[0.12em] text-mbg-white transition-[background-color,transform] duration-300 hover:bg-mbg-black motion-safe:hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mbg-white">
                Discover the outfits <span aria-hidden="true" className="ml-3">↗</span>
              </Link>
              <Link href="/contact" className="inline-flex min-h-12 items-center justify-center border border-mbg-white/25 px-6 py-3 text-xs font-black uppercase tracking-[0.12em] text-mbg-white transition-colors duration-300 hover:border-mbg-green hover:bg-mbg-green/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mbg-green">
                Contact Milos BG
              </Link>
            </div>
            <p className="mt-12 text-xs font-black uppercase tracking-[0.16em] text-mbg-white/60">
              Grind Until <span className="text-mbg-green">You</span> Achieve.
            </p>
            <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.2em] text-mbg-green">Make It Your Liked Outfits</p>
            <p className="mt-4 text-xs font-medium text-mbg-white/60">Enjoy the Grind. ✿</p>
          </div>
        </section>

        {/* QUICK FACTS */}
        <section aria-label="Milos BG highlights" className="grid grid-cols-1 border-x border-b border-mbg-white/10 sm:grid-cols-3">
          {[
            { value: "2022", label: "Year of creation" },
            { value: "05", label: "Chapters / One journey" },
            { value: "01", label: "Mentality / Grind Until Achieve" },
          ].map((fact) => (
            <div key={fact.label} className="border-b border-mbg-white/10 px-6 py-7 text-center last:border-b-0 sm:border-b-0 sm:border-r sm:border-mbg-white/10 sm:last:border-r-0">
              <p className="text-2xl font-black text-mbg-white">{fact.value}</p>
              <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-mbg-green">{fact.label}</p>
            </div>
          ))}
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-mbg-white/10 py-7 text-[10px] font-medium text-mbg-white/45">
          <p>Last update: 21/11/2026</p>
          <p>&copy; {new Date().getFullYear()} Milos BG — All rights reserved</p>
        </footer>
      </Container>

      <style>{`
        @keyframes mbg-background-enter {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes mbg-ambient-shift {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 0.95; transform: scale(1.05); }
        }
        @keyframes mbg-chapter-enter {
          from { opacity: 0; transform: translateY(-5px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .mbg-entrance {
          animation: mbg-background-enter 850ms cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .mbg-ambient {
          animation: mbg-ambient-shift 14s ease-in-out infinite;
        }
        details[open] > .mbg-chapter-content {
          animation: mbg-chapter-enter 350ms ease-out both;
        }
        @media (prefers-reduced-motion: reduce) {
          .mbg-entrance, .mbg-ambient, details[open] > .mbg-chapter-content { animation: none; }
        }
      `}</style>
    </main>
  );
};

export default AboutUs;
