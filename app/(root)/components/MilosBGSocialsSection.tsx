import Link from "next/link";
import { FaInstagram, FaYoutube } from "react-icons/fa";

const socials = [
  {
    name: "Instagram",
    handle: "@m.i.l.o.s.bg",
    url: "https://www.instagram.com/m.i.l.o.s.bg/",
    icon: FaInstagram,
    description:
      "Follow the visual universe of Milos BG: outfits, mentality, details, movement, and the spirit behind the brand.",
  },
  {
    name: "YouTube",
    handle: "@milos-bg",
    url: "https://www.youtube.com/@milos-bg",
    icon: FaYoutube,
    description:
      "Discover the world of Milos BG through videos, creative process, inspiration, and brand storytelling.",
  },
];

const MilosBGSocialsSection = () => {
  return (
    <section className="relative overflow-hidden bg-black px-4 py-20 sm:px-8 lg:px-16">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,130,26,0.18),transparent_35%),radial-gradient(circle_at_bottom,rgba(255,255,255,0.06),transparent_30%)]" />
        <div className="absolute inset-0 bg-black/80" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        {/* Title */}
        <div className="mb-10 text-center">
          <p className="font-kanit text-sm uppercase tracking-[0.35em] text-[#00821A]">
            Stay Connected
          </p>
          <h2 className="mt-3 font-kanit text-3xl font-extrabold uppercase tracking-tight text-white sm:text-4xl lg:text-5xl">
            Follow Milos BG
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-kanit text-sm text-white/70 sm:text-base">
            Explore the universe of Milos BG through our social platforms and
            stay close to the journey, the visuals, and the mindset.
          </p>
        </div>

        {/* Big glass container */}
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.06] p-6 shadow-[0_0_40px_rgba(0,130,26,0.18)] backdrop-blur-2xl sm:p-8 lg:p-10">
          {/* Glow layers */}
          <div className="pointer-events-none absolute -left-20 top-1/2 h-44 w-44 -translate-y-1/2 rounded-full bg-[#00821A]/20 blur-3xl" />
          <div className="pointer-events-none absolute -right-20 top-1/3 h-44 w-44 rounded-full bg-white/10 blur-3xl" />
          <div className="pointer-events-none absolute inset-0 rounded-[32px] ring-1 ring-white/10" />

          <div className="relative grid gap-6 lg:grid-cols-2">
            {socials.map((social) => {
              const Icon = social.icon;

              return (
                <div
                  key={social.name}
                  className="group relative overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.08] p-6 shadow-[0_0_24px_rgba(255,255,255,0.05)] backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-[#00821A]/40 hover:shadow-[0_0_30px_rgba(0,130,26,0.22)] sm:p-7"
                >
                  <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.10),rgba(255,255,255,0.02))]" />
                  <div className="relative">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-black/40 text-[#00821A] shadow-[0_0_18px_rgba(0,130,26,0.22)]">
                        <Icon className="text-2xl" />
                      </div>

                      <div>
                        <h3 className="font-kanit text-2xl font-bold uppercase text-white">
                          {social.name}
                        </h3>
                        <p className="font-kanit text-sm text-white/60">
                          {social.handle}
                        </p>
                      </div>
                    </div>

                    <p className="mt-6 font-kanit text-sm leading-relaxed text-white/75 sm:text-base">
                      {social.description}
                    </p>

                    <Link
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-8 inline-flex items-center gap-3 rounded-full border border-[#00821A]/40 bg-black/60 px-5 py-3 font-kanit text-sm font-bold uppercase tracking-wide text-white transition duration-300 hover:border-[#00821A] hover:bg-[#00821A]/15 hover:shadow-[0_0_18px_rgba(0,130,26,0.25)]"
                    >
                      <Icon className="text-base text-[#00821A]" />
                      Visit {social.name}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default MilosBGSocialsSection;