import { MBGBooks } from "@/images";
import Image from "next/image";
import { FiArrowUpRight, FiBookOpen, FiPackage } from "react-icons/fi";

export type MilosBGBookProps = {
  /** Canonical Amazon Kindle product URL. */
  amazonUrl?: string;
  /** PayPal payment link for the printed edition. */
  paypalUrl?: string;
  className?: string;
};

const DEFAULT_AMAZON_URL =
  "https://www.amazon.fr/GRIND-UNTIL-ACHIEVE-English-GAMIL-ebook/dp/B0GP19C9PN";

const DEFAULT_PAYPAL_URL =
  "https://www.paypal.com/ncp/payment/L29HGX5RLJAEC";

const MilosBGBook = ({
  amazonUrl = DEFAULT_AMAZON_URL,
  paypalUrl = DEFAULT_PAYPAL_URL,
  className = "",
}: MilosBGBookProps) => {
  return (
    <section
      id="the-book"
      aria-labelledby="the-book-title"
      className={`relative isolate overflow-hidden bg-mbg-white font-kanit text-mbg-black ${className}`}
    >
      {/* Subtle basketball-court construction lines. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-24 -top-36 h-[520px] w-[520px] rounded-full border-2 border-mbg-black/10" />
        <div className="absolute -right-6 top-28 h-44 w-72 rounded-l-full border-2 border-r-0 border-mbg-black/10" />
        <div className="absolute -bottom-56 -left-28 h-[460px] w-[460px] rounded-full border-2 border-mbg-black/10" />
        <div className="absolute bottom-8 left-1/3 h-px w-1/3 bg-mbg-black/10" />
      </div>

      <div className="mx-auto w-full max-w-[1536px] px-4 py-8 sm:px-6 lg:px-10 lg:py-12">
        <p className="mb-4 text-base font-black uppercase tracking-tight lg:hidden">
          The book
        </p>

        <div className="relative overflow-hidden border border-mbg-black/10 bg-mbg-white shadow-[0_14px_50px_rgba(0,0,0,0.08)]">
          <aside className="absolute inset-y-0 left-0 z-20 hidden w-[72px] items-start justify-center bg-mbg-black pt-10 lg:flex">
            <span className="[writing-mode:vertical-rl] rotate-180 text-sm font-bold uppercase tracking-[0.18em] text-mbg-white">
              The book
            </span>
          </aside>

          <div className="lg:pl-[72px]">
            <div className="relative grid min-h-[590px] items-center lg:grid-cols-[0.9fr_1.1fr]">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-[31%] top-[-7rem] hidden select-none text-[21rem] font-extrabold leading-none text-transparent [-webkit-text-stroke:2px_rgba(0,0,0,0.1)] xl:block"
              >
                05
              </span>

              <div className="relative z-10 px-6 pb-4 pt-10 sm:px-10 lg:px-12 lg:py-16 xl:px-14">
                <div className="mb-4 h-[3px] w-24 bg-mbg-green" />
                <p className="mb-5 text-sm font-bold uppercase tracking-tight text-mbg-green sm:text-base">
                  Milos BG — Personal development
                </p>

                <h2
                  id="the-book-title"
                  className="max-w-[670px] text-[clamp(3rem,6.6vw,6.3rem)] font-black uppercase leading-[0.94] tracking-[-0.055em]"
                >
                  The grind is
                  <br />
                  not a moment.
                  <br />
                  It is a way of life.
                </h2>

                <div className="mt-6 h-[3px] w-72 max-w-full bg-mbg-green" />
                <p className="mt-5 max-w-xl text-base leading-relaxed text-mbg-darkgrey sm:text-lg">
                  Five chapters built on discipline, resilience, consistency,
                  focus and achievement.
                </p>
                <p className="mt-2 max-w-xl text-base font-medium text-mbg-green sm:text-lg">
                  Read it. Apply it. Write your own chapter.
                </p>
              </div>

              <div className="relative z-10 flex min-h-[420px] items-center justify-center overflow-hidden px-2 pb-8 sm:px-8 lg:min-h-[590px] lg:px-2 lg:pb-0 lg:pr-5">
                <Image
                  src={MBGBooks}
                  alt="GRIND UNTIL ACHIEVE in Kindle and printed editions, showing the back cover, spine and front cover"
                  width={1536}
                  height={1024}
                  priority
                  sizes="(max-width: 1023px) 100vw, 56vw"
                  className="h-auto w-full max-w-[900px] mix-blend-multiply"
                />
              </div>
            </div>

            <div className="grid border-t border-mbg-black/10 md:grid-cols-2">
              <article className="grid min-h-64 grid-cols-[74px_1fr] gap-5 bg-mbg-black p-6 text-mbg-white sm:grid-cols-[110px_1fr] sm:p-9">
                <div className="flex items-center justify-center">
                  <FiBookOpen aria-hidden="true" className="h-16 w-16 stroke-[1.3] sm:h-20 sm:w-20" />
                </div>

                <div className="flex min-w-0 flex-col justify-center">
                  <h3 className="text-2xl font-extrabold uppercase leading-none sm:text-3xl">
                    Ebook
                  </h3>
                  <p className="mt-3 text-sm text-mbg-white/75 sm:text-base">
                    English edition <span className="text-mbg-green">•</span> 47 pages{" "}
                    <span className="text-mbg-green">•</span> Kindle
                  </p>

                  <a
                    href={amazonUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group mt-5 inline-flex min-h-14 items-center justify-center gap-3 border border-mbg-white bg-mbg-black px-5 text-center text-sm font-extrabold uppercase tracking-wide text-mbg-white transition-colors duration-300 hover:bg-mbg-white hover:text-mbg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mbg-green"
                    aria-label="Buy the English ebook edition on Amazon (opens in a new tab)"
                  >
                    Buy on Amazon
                    <FiArrowUpRight aria-hidden="true" className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                </div>
              </article>

              <article className="grid min-h-64 grid-cols-[74px_1fr] gap-5 bg-mbg-green p-6 text-mbg-white sm:grid-cols-[110px_1fr] sm:p-9">
                <div className="flex items-center justify-center">
                  <FiPackage aria-hidden="true" className="h-16 w-16 stroke-[1.3] sm:h-20 sm:w-20" />
                </div>

                <div className="flex min-w-0 flex-col justify-center">
                  <h3 className="text-2xl font-extrabold uppercase leading-none sm:text-3xl">
                    Physical book
                  </h3>
                  <p className="mt-3 text-sm text-mbg-white/85 sm:text-base">
                    A printed edition to keep close.
                  </p>

                  <a
                    href={paypalUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group mt-5 inline-flex min-h-14 items-center justify-center gap-3 bg-mbg-black px-5 text-center text-sm font-extrabold uppercase tracking-wide text-mbg-white transition-colors duration-300 hover:bg-mbg-white hover:text-mbg-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-mbg-white"
                    aria-label="Order the printed edition securely with PayPal (opens in a new tab)"
                  >
                    Order the book
                    <FiArrowUpRight aria-hidden="true" className="h-5 w-5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>

                  <p className="mt-3 text-xs text-mbg-white/80 sm:text-sm">
                    Secure checkout via PayPal
                  </p>
                </div>
              </article>
            </div>

            <footer className="flex min-h-24 items-center justify-center gap-3 border-t border-mbg-black/10 bg-mbg-white px-5 py-6">
              <p className="text-center text-xl font-black uppercase tracking-[-0.035em] sm:text-2xl">
                Grind until achieve.
              </p>
              <Image
                src="/images/milos-bg/books/milos-flower.png"
                alt=""
                aria-hidden="true"
                width={1254}
                height={1254}
                className="h-9 w-9 object-contain"
              />
            </footer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MilosBGBook;
