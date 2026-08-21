import Link from "next/link";
import { FaInstagram, FaYoutube } from "react-icons/fa";
import { MBGPeriwinkle } from "@/images";

const MilosBGSocialsSection = () => {
  return (
    <section
      id="socials"
      className="relative w-full overflow-hidden px-4 py-16 font-kanit sm:px-6 sm:py-20 lg:px-10 lg:py-24"
      style={{
        backgroundImage: `url(${MBGPeriwinkle.src})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Overlay sombre pour garder le contraste */}
      <div className="absolute inset-0 bg-black/70" />

      {/* Glow vert subtil */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,130,26,0.14),transparent_40%)]" />

      <div className="relative z-10 mx-auto max-w-[1450px]">
        <div className="mb-9 text-center sm:mb-12">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.45em] text-[#00821A] sm:text-xs">
            Stay connected
          </p>

          <h2 className="text-2xl font-extrabold uppercase tracking-[-0.035em] text-white sm:text-3xl lg:text-4xl">
            Follow the journey
          </h2>
        </div>

        <div className="relative overflow-hidden rounded-[24px] border border-white/[0.12] bg-white/[0.045] px-5 py-10 shadow-[0_0_60px_rgba(0,130,26,0.13),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[22px] sm:px-8 sm:py-12 lg:min-h-[390px] lg:px-12 lg:py-10">
          <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[240px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#00821A]/10 blur-[90px]" />
          <div className="pointer-events-none absolute bottom-0 left-1/2 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-[#00821A]/70 to-transparent shadow-[0_0_22px_rgba(0,130,26,0.7)]" />

          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1fr_180px_1fr] lg:gap-12">
            {/* Instagram */}
            <div className="flex justify-center lg:justify-end">
              <article className="group relative w-full max-w-[360px] overflow-hidden rounded-[22px] border border-white/[0.12] bg-black/30 p-7 text-center shadow-[0_12px_35px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#00821A]/45 hover:bg-white/[0.07] hover:shadow-[0_18px_55px_rgba(0,130,26,0.16)] sm:p-8">
                <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[#00821A]/20 blur-[65px] opacity-60 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative">
                  <div className="mx-auto flex h-[70px] w-[70px] items-center justify-center rounded-full border border-white/10 bg-white/[0.06] shadow-[0_0_30px_rgba(0,130,26,0.16)] backdrop-blur-lg">
                    <FaInstagram className="text-[30px] text-white" />
                  </div>

                  <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#00821A]">
                    Instagram
                  </p>

                  <h3 className="mt-1 text-xl font-extrabold tracking-[-0.025em] text-white sm:text-2xl">
                    m.i.l.o.s.bg
                  </h3>

                  <p className="mx-auto mt-4 max-w-[270px] text-xs leading-5 text-white/55 sm:text-sm">
                    Outfits, craftsmanship, details, inspiration and moments
                    behind Milos BG.
                  </p>

                  <Link
                    href="https://www.instagram.com/m.i.l.o.s.bg/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-7 inline-flex min-w-[150px] items-center justify-center gap-2 rounded-full border border-white/15 bg-black px-6 py-3 text-xs font-bold uppercase tracking-[0.08em] text-white transition-all duration-300 hover:border-[#00821A] hover:bg-[#00821A] hover:shadow-[0_0_25px_rgba(0,130,26,0.4)]"
                  >
                    <FaInstagram className="text-base" />
                    Follow
                  </Link>
                </div>
              </article>
            </div>

            {/* Centre */}
            <div className="relative hidden h-full min-h-[220px] items-center justify-center lg:flex">
              <div className="absolute left-0 top-1/2 h-[65%] w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
              <div className="absolute right-0 top-1/2 h-[65%] w-px -translate-y-1/2 bg-gradient-to-b from-transparent via-white/10 to-transparent" />
              <div className="absolute h-28 w-28 rounded-full bg-[#00821A]/20 blur-[45px]" />

              <div className="relative flex h-[105px] w-[105px] items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.035] shadow-[0_0_45px_rgba(0,130,26,0.16)] backdrop-blur-md">
                <span className="translate-y-[-2px] text-[62px] leading-none text-white">
                  ✿
                </span>
              </div>
            </div>

            {/* YouTube */}
            <div className="flex justify-center lg:justify-start">
              <article className="group relative w-full max-w-[360px] overflow-hidden rounded-[22px] border border-white/[0.12] bg-black/30 p-7 text-center shadow-[0_12px_35px_rgba(0,0,0,0.25)] backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-[#00821A]/45 hover:bg-white/[0.07] hover:shadow-[0_18px_55px_rgba(0,130,26,0.16)] sm:p-8">
                <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-[#00821A]/20 blur-[65px] opacity-60 transition-opacity duration-500 group-hover:opacity-100" />

                <div className="relative">
                  <div className="mx-auto flex h-[70px] w-[70px] items-center justify-center rounded-full border border-white/10 bg-white/[0.06] shadow-[0_0_30px_rgba(0,130,26,0.16)] backdrop-blur-lg">
                    <FaYoutube className="text-[32px] text-white" />
                  </div>

                  <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.32em] text-[#00821A]">
                    YouTube
                  </p>

                  <h3 className="mt-1 text-xl font-extrabold tracking-[-0.025em] text-white sm:text-2xl">
                    @milos-bg
                  </h3>

                  <p className="mx-auto mt-4 max-w-[270px] text-xs leading-5 text-white/55 sm:text-sm">
                    Stories, creative process, movement and the philosophy
                    behind Milos BG.
                  </p>

                  <Link
                    href="https://www.youtube.com/@milos-bg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-7 inline-flex min-w-[150px] items-center justify-center gap-2 rounded-full border border-white/15 bg-black px-6 py-3 text-xs font-bold uppercase tracking-[0.08em] text-white transition-all duration-300 hover:border-[#00821A] hover:bg-[#00821A] hover:shadow-[0_0_25px_rgba(0,130,26,0.4)]"
                  >
                    <FaYoutube className="text-base" />
                    Subscribe
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MilosBGSocialsSection;