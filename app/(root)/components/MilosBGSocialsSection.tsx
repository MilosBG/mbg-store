import Image from "next/image";
import Link from "next/link";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { MBGPeriwinkle } from "@/images";

const MilosBGSocialsSection = () => {
  return (
    <section
      id="socials"
      className="relative w-full overflow-hidden bg-black font-kanit"
    >
      {/* =========================================================
          BACKGROUND
      ========================================================== */}

      <div className="absolute inset-0">
        <Image
          src={MBGPeriwinkle}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Dark cinematic overlay */}
        <div className="absolute inset-0 bg-black/25" />

        {/* Vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,rgba(0,0,0,0.78)_100%)]" />

        {/* Center green atmosphere */}
        <div className="absolute left-1/2 top-[56%] h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00821A]/10 blur-[130px]" />
      </div>

      {/* =========================================================
          MAIN CONTENT
      ========================================================== */}

      <div className="relative z-10 mx-auto flex min-h-[760px] w-full max-w-[1536px] flex-col px-5 py-14 sm:px-8 lg:min-h-[900px] lg:px-12 lg:py-16">
        {/* =====================================================
            TITLE
        ====================================================== */}

        <div className="mb-8 text-center lg:mb-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.48em] text-[#00B82E] sm:text-xs">
            Stay Connected
          </p>

          <h2 className="mt-3 text-[clamp(2.2rem,4.3vw,4.3rem)] font-extrabold uppercase leading-[0.95] tracking-[-0.045em] text-white">
            Follow The Journey
          </h2>
        </div>

        {/* =====================================================
            LARGE GLASS CONTAINER
        ====================================================== */}

        <div className="relative flex flex-1 overflow-hidden rounded-[28px] border border-white/35 bg-black/[0.26] shadow-[0_0_40px_rgba(255,255,255,0.08),0_0_70px_rgba(0,130,26,0.14),inset_0_1px_0_rgba(255,255,255,0.22)] backdrop-blur-[8px]">
          {/* Top glow */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-[2px] w-[48%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#7DFF93] to-transparent shadow-[0_0_18px_#00B82E]" />

          {/* Bottom green glow */}
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-[2px] w-[55%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#00B82E] to-transparent shadow-[0_0_25px_rgba(0,255,70,0.9)]" />

          {/* Internal green center glow */}
          <div className="pointer-events-none absolute left-1/2 top-[47%] h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00821A]/13 blur-[100px]" />

          {/* subtle inner highlight */}
          <div className="pointer-events-none absolute inset-[1px] rounded-[27px] border border-white/[0.04]" />

          {/* ===================================================
              INNER CONTENT
          ==================================================== */}

          <div className="relative z-10 flex w-full flex-col px-6 py-10 sm:px-10 lg:px-20 lg:pb-8 lg:pt-16">
            <div className="grid flex-1 items-center gap-8 lg:grid-cols-[1fr_300px_1fr] lg:gap-10">
              {/* =================================================
                  INSTAGRAM
              ================================================== */}

              <div className="flex justify-center">
                <article className="group relative flex min-h-[460px] w-full max-w-[370px] flex-col items-center justify-center overflow-hidden rounded-[24px] border border-white/25 bg-black/[0.34] px-8 py-10 text-center shadow-[0_20px_55px_rgba(0,0,0,0.45),0_0_25px_rgba(255,255,255,0.04)] backdrop-blur-[12px] transition-all duration-500 hover:-translate-y-1 hover:border-[#00B82E]/60 hover:shadow-[0_20px_65px_rgba(0,0,0,0.5),0_0_35px_rgba(0,184,46,0.18)]">
                  {/* card glow bottom */}
                  <div className="pointer-events-none absolute bottom-0 left-1/2 h-[2px] w-[65%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#00B82E] to-transparent shadow-[0_0_18px_rgba(0,255,70,0.9)]" />

                  {/* Icon ring */}
                  <div className="relative flex h-[110px] w-[110px] items-center justify-center rounded-full border border-[#00B82E]/70 bg-black/30 shadow-[0_0_28px_rgba(0,184,46,0.28)]">
                    <div className="absolute inset-[9px] rounded-full border border-white/[0.08]" />

                    <FaInstagram className="relative z-10 text-[42px] text-white" />
                  </div>

                  <p className="mt-7 text-[11px] font-medium uppercase tracking-[0.42em] text-[#00D238]">
                    Instagram
                  </p>

                  <h3 className="mt-3 text-[clamp(1.7rem,2.4vw,2.3rem)] font-extrabold tracking-[-0.03em] text-white">
                    m.i.l.o.s.bg
                  </h3>

                  {/* Small green divider */}
                  <div className="mt-4 h-px w-16 bg-[#00B82E] shadow-[0_0_8px_rgba(0,255,70,0.8)]" />

                  <p className="mt-6 max-w-[280px] text-sm leading-7 text-white/65">
                    Outfits, craftsmanship, details,
                    <br className="hidden sm:block" />
                    inspiration and moments
                    <br className="hidden sm:block" />
                    behind Milos BG.
                  </p>

                  <Link
                    href="https://www.instagram.com/m.i.l.o.s.bg/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Follow Milos BG on Instagram"
                    className="mt-8 inline-flex min-w-[220px] items-center justify-center gap-4 rounded-full border border-white/25 bg-black/75 px-7 py-4 text-sm font-bold uppercase tracking-[0.08em] text-white shadow-[0_8px_25px_rgba(0,0,0,0.45)] transition-all duration-300 hover:border-[#00B82E] hover:bg-[#00821A]/25 hover:shadow-[0_0_25px_rgba(0,184,46,0.28)]"
                  >
                    <FaInstagram className="text-xl text-[#00D238]" />
                    Follow
                  </Link>
                </article>
              </div>

              {/* =================================================
                  CENTER
              ================================================== */}

              <div className="relative hidden h-full min-h-[430px] items-center justify-center lg:flex">
                {/* left construction line */}
                <div className="absolute left-0 top-1/2 h-[68%] w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-white/20 to-transparent">
                  <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00D238] shadow-[0_0_10px_rgba(0,255,70,0.9)]" />
                </div>

                {/* right construction line */}
                <div className="absolute right-0 top-1/2 h-[68%] w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-white/20 to-transparent">
                  <span className="absolute left-1/2 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00D238] shadow-[0_0_10px_rgba(0,255,70,0.9)]" />
                </div>

                {/* Leave the real periwinkle visible from the background */}
                <div className="pointer-events-none absolute left-1/2 top-1/2 h-[260px] w-[260px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00821A]/10 blur-[55px]" />
              </div>

              {/* =================================================
                  MOBILE CENTER DIVIDER
              ================================================== */}

              <div className="flex items-center justify-center gap-4 py-2 lg:hidden">
                <div className="h-px w-20 bg-gradient-to-r from-transparent to-[#00B82E]" />

                <span className="h-2 w-2 rounded-full bg-[#00D238] shadow-[0_0_10px_#00D238]" />

                <div className="h-px w-20 bg-gradient-to-l from-transparent to-[#00B82E]" />
              </div>

              {/* =================================================
                  YOUTUBE
              ================================================== */}

              <div className="flex justify-center">
                <article className="group relative flex min-h-[460px] w-full max-w-[370px] flex-col items-center justify-center overflow-hidden rounded-[24px] border border-white/25 bg-black/[0.34] px-8 py-10 text-center shadow-[0_20px_55px_rgba(0,0,0,0.45),0_0_25px_rgba(255,255,255,0.04)] backdrop-blur-[12px] transition-all duration-500 hover:-translate-y-1 hover:border-[#00B82E]/60 hover:shadow-[0_20px_65px_rgba(0,0,0,0.5),0_0_35px_rgba(0,184,46,0.18)]">
                  {/* card glow bottom */}
                  <div className="pointer-events-none absolute bottom-0 left-1/2 h-[2px] w-[65%] -translate-x-1/2 bg-gradient-to-r from-transparent via-[#00B82E] to-transparent shadow-[0_0_18px_rgba(0,255,70,0.9)]" />

                  {/* Icon ring */}
                  <div className="relative flex h-[110px] w-[110px] items-center justify-center rounded-full border border-[#00B82E]/70 bg-black/30 shadow-[0_0_28px_rgba(0,184,46,0.28)]">
                    <div className="absolute inset-[9px] rounded-full border border-white/[0.08]" />

                    <FaYoutube className="relative z-10 text-[45px] text-white" />
                  </div>

                  <p className="mt-7 text-[11px] font-medium uppercase tracking-[0.42em] text-[#00D238]">
                    YouTube
                  </p>

                  <h3 className="mt-3 text-[clamp(1.7rem,2.4vw,2.3rem)] font-extrabold tracking-[-0.03em] text-white">
                    @milos-bg
                  </h3>

                  {/* Small green divider */}
                  <div className="mt-4 h-px w-16 bg-[#00B82E] shadow-[0_0_8px_rgba(0,255,70,0.8)]" />

                  <p className="mt-6 max-w-[280px] text-sm leading-7 text-white/65">
                    Stories, creative process,
                    <br className="hidden sm:block" />
                    movement and the philosophy
                    <br className="hidden sm:block" />
                    behind Milos BG.
                  </p>

                  <Link
                    href="https://www.youtube.com/@milos-bg"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Subscribe to Milos BG on YouTube"
                    className="mt-8 inline-flex min-w-[220px] items-center justify-center gap-4 rounded-full border border-white/25 bg-black/75 px-7 py-4 text-sm font-bold uppercase tracking-[0.08em] text-white shadow-[0_8px_25px_rgba(0,0,0,0.45)] transition-all duration-300 hover:border-[#00B82E] hover:bg-[#00821A]/25 hover:shadow-[0_0_25px_rgba(0,184,46,0.28)]"
                  >
                    <FaYoutube className="text-xl text-[#00D238]" />
                    Subscribe
                  </Link>
                </article>
              </div>
            </div>

            {/* ===================================================
                BOTTOM MANTRA
            ==================================================== */}

            <div className="mt-10 flex w-full items-center justify-center gap-5 pb-1 lg:mt-8">
              <div className="hidden h-px flex-1 bg-gradient-to-r from-transparent via-white/40 to-white/50 sm:block" />

              <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 whitespace-nowrap text-[9px] font-medium uppercase tracking-[0.28em] text-white/65 sm:gap-x-6 sm:text-[11px] lg:gap-x-8 lg:text-xs">
                <span>Grind</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#00D238] shadow-[0_0_7px_#00D238]" />

                <span>Resilience</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#00D238] shadow-[0_0_7px_#00D238]" />

                <span>Consistency</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#00D238] shadow-[0_0_7px_#00D238]" />

                <span>Focus</span>
                <span className="h-1.5 w-1.5 rounded-full bg-[#00D238] shadow-[0_0_7px_#00D238]" />

                <span>Achieve</span>
              </div>

              <div className="hidden h-px flex-1 bg-gradient-to-l from-transparent via-white/40 to-white/50 sm:block" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MilosBGSocialsSection;