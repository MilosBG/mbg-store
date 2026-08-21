import { MBGBooks } from "@/images";
import Image from "next/image";
import { FiArrowUpRight, FiTablet } from "react-icons/fi";
import { PiBookBookmark } from "react-icons/pi";

export type MilosBGBookProps = {
  amazonUrl?: string;
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
      className={`relative isolate mt-10 overflow-hidden bg-[#f4f4f4] font-kanit text-mbg-black ${className}`}
    >
      {/* ====================================================== */}
      {/* BASKETBALL COURT CONSTRUCTION LINES                    */}
      {/* ====================================================== */}

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
      >
        <div className="absolute -right-28 -top-36 h-[500px] w-[500px] rounded-full border-2 border-mbg-black/10" />

        <div className="absolute -right-10 top-32 h-44 w-72 rounded-l-full border-2 border-r-0 border-mbg-black/10" />

        <div className="absolute -bottom-64 -left-32 h-[500px] w-[500px] rounded-full border-2 border-mbg-black/10" />

        <div className="absolute bottom-20 left-[12%] h-40 w-64 rotate-[-14deg] rounded-[50%] border-2 border-mbg-black/10" />
      </div>

      {/* ====================================================== */}
      {/* MAIN CONTAINER                                         */}
      {/* ====================================================== */}

      <div className="relative z-10 mx-auto w-full max-w-[1536px] px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        {/* MOBILE SECTION LABEL */}
        <p className="mb-3 text-center text-[11px] font-extrabold uppercase lg:hidden">
          The book
        </p>

        <div className="relative overflow-hidden border border-mbg-black/10 bg-mbg-rgbablank shadow-mbg-bx-shadow">
          {/* ====================================================== */}
          {/* DESKTOP SIDE LABEL                                     */}
          {/* ====================================================== */}

          <aside className="absolute inset-y-0 left-0 z-40 hidden w-[72px] items-start justify-center bg-mbg-black pt-10 lg:flex">
            <span className="rotate-180 text-[12px] font-bold uppercase tracking-[0.16em] text-mbg-white [writing-mode:vertical-rl]">
              The book
            </span>
          </aside>

          <div className="lg:pl-[72px]">
            {/* ====================================================== */}
            {/* HERO                                                   */}
            {/* ====================================================== */}

            <div className="relative grid items-center lg:min-h-[610px] lg:grid-cols-[0.88fr_1.12fr] xl:min-h-[650px]">
              {/* BACKGROUND CHAPTER NUMBER */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-[31%] top-[-5.5rem] hidden select-none text-[19rem] font-extrabold leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(0,0,0,0.09)] xl:block"
              >
                05
              </span>

              {/* ====================================================== */}
              {/* TEXT                                                   */}
              {/* ====================================================== */}

              <div
                className="
                  relative z-30
                  flex w-full flex-col
                  items-center
                  px-5 pb-6 pt-10
                  text-center
                  sm:px-8
                  lg:items-start
                  lg:px-11
                  lg:py-14
                  lg:text-left
                  xl:px-[52px]
                "
              >
                {/* TOP GREEN LINE */}
                <div className="mb-4 h-[3px] w-24 bg-mbg-green" />

                {/* EYEBROW */}
                <p
                  className="
                    mb-5
                    w-full
                    text-center
                    text-[11px]
                    font-bold
                    uppercase
                    tracking-[-0.02em]
                    text-mbg-black
                    sm:text-xs
                    lg:text-left
                    lg:text-sm
                  "
                >
                  Milos BG — Personal development
                </p>

                {/* MAIN TITLE */}
                <h2
                  id="the-book-title"
                  className="
                    w-full
                    max-w-[520px]
                    text-center
                    text-[clamp(1.7rem,8vw,2.25rem)]
                    font-black
                    uppercase
                    leading-[0.96]
                    tracking-[-0.055em]
                    sm:text-[clamp(2rem,6vw,3rem)]
                    lg:max-w-none
                    lg:text-left
                    lg:text-[clamp(2.25rem,4.45vw,4.75rem)]
                  "
                >
                  <span className="block lg:whitespace-nowrap">
                    <span className="text-mbg-green">The grind</span> is
                  </span>

                  <span className="block lg:whitespace-nowrap">
                    Not a moment.
                  </span>

                  <span className="block lg:whitespace-nowrap">
                    It{" "}
                    <span className="text-mbg-green">is a mentality</span>.
                  </span>
                </h2>

                {/* BOTTOM GREEN LINE */}
                <div className="mt-5 h-[3px] w-full max-w-72 bg-mbg-green" />

                {/* DESCRIPTION */}
                <p
                  className="
                    mt-4
                    w-full
                    max-w-[440px]
                    text-center
                    text-[11px]
                    leading-[1.55]
                    text-mbg-darkgrey
                    sm:text-xs
                    lg:text-left
                    lg:text-sm
                  "
                >
                  Five chapters built on discipline, resilience, consistency,
                  focus and achievement.
                </p>

                {/* SECONDARY COPY */}
                <p
                  className="
                    mt-2
                    w-full
                    max-w-[440px]
                    text-center
                    text-[11px]
                    font-medium
                    leading-[1.45]
                    text-mbg-green
                    sm:text-xs
                    lg:text-left
                    lg:text-sm
                  "
                >
                  Read it. Apply it. Write your own chapter.
                </p>
              </div>

              {/* ====================================================== */}
              {/* BOOK IMAGE                                             */}
              {/* ====================================================== */}

              <div
                className="
                  relative z-20
                  flex min-h-[360px]
                  w-full
                  items-center
                  justify-center
                  overflow-visible
                  px-5
                  pb-8
                  pt-2
                  sm:min-h-[400px]
                  sm:px-8
                  lg:min-h-[610px]
                  lg:-translate-x-2
                  lg:px-0
                  lg:pb-0
                  lg:pt-0
                  xl:min-h-[650px]
                  xl:-translate-x-5
                "
              >
                <Image
                  src={MBGBooks}
                  alt="GRIND UNTIL ACHIEVE ebook and printed editions, with the back cover, spine and front cover"
                  priority
                  sizes="(max-width: 1023px) 90vw, 59vw"
                  className="
                    mx-auto
                    h-auto
                    w-full
                    max-w-[960px]
                    object-contain
                  "
                />
              </div>
            </div>

            {/* ====================================================== */}
            {/* BOOK FORMATS                                           */}
            {/* ====================================================== */}

            <div className="grid border-t border-mbg-black/10 md:grid-cols-2">
              {/* ====================================================== */}
              {/* EBOOK                                                  */}
              {/* ====================================================== */}

              <article
                className="
                  flex min-h-[220px]
                  flex-col
                  items-center
                  justify-center
                  gap-4
                  bg-mbg-black
                  px-6
                  py-8
                  text-center
                  text-mbg-white
                  sm:px-8
                  md:min-h-[240px]
                  lg:grid
                  lg:min-h-[190px]
                  lg:grid-cols-[92px_1fr]
                  lg:items-center
                  lg:gap-5
                  lg:px-8
                  lg:py-7
                  lg:text-left
                "
              >
                <FiTablet
                  aria-hidden="true"
                  className="
                    h-8
                    w-8
                    shrink-0
                    stroke-[1.35]
                    sm:h-9
                    sm:w-9
                    lg:h-10
                    lg:w-10
                    lg:justify-self-center
                  "
                />

                <div
                  className="
                    flex
                    w-full
                    max-w-[380px]
                    min-w-0
                    flex-col
                    items-center
                    text-center
                    lg:items-start
                    lg:text-left
                  "
                >
                  <h3 className="text-lg font-extrabold uppercase leading-none sm:text-xl">
                    Ebook
                  </h3>

                  <p className="mt-2 text-[11px] leading-[1.4] text-mbg-white/75 sm:text-xs">
                    English edition{" "}
                    <span className="text-mbg-green">•</span>{" "}
                    47 pages{" "}
                    <span className="text-mbg-green">•</span>{" "}
                    Kindle
                  </p>

                  <a
                    href={amazonUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Buy the English ebook edition on Amazon"
                    className="
                      group
                      mt-4
                      inline-flex
                      min-h-10
                      w-full
                      max-w-[320px]
                      items-center
                      justify-center
                      gap-2
                      border
                      border-mbg-white
                      bg-mbg-black
                      px-5
                      text-center
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-wide
                      text-mbg-white
                      transition-colors
                      duration-300
                      hover:bg-mbg-white
                      hover:text-mbg-black
                      focus-visible:outline
                      focus-visible:outline-2
                      focus-visible:outline-offset-2
                      focus-visible:outline-mbg-green
                      lg:max-w-[380px]
                    "
                  >
                    Buy on Amazon

                    <FiArrowUpRight
                      aria-hidden="true"
                      className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </a>
                </div>
              </article>

              {/* ====================================================== */}
              {/* PHYSICAL BOOK                                          */}
              {/* ====================================================== */}

              <article
                className="
                  flex min-h-[220px]
                  flex-col
                  items-center
                  justify-center
                  gap-4
                  bg-mbg-black/20
                  px-6
                  py-8
                  text-center
                  text-mbg-white
                  sm:px-8
                  md:min-h-[240px]
                  lg:grid
                  lg:min-h-[190px]
                  lg:grid-cols-[92px_1fr]
                  lg:items-center
                  lg:gap-5
                  lg:px-8
                  lg:py-7
                  lg:text-left
                "
              >
                <PiBookBookmark
                  aria-hidden="true"
                  className="
                    h-8
                    w-8
                    shrink-0
                    stroke-[1.35]
                    sm:h-9
                    sm:w-9
                    lg:h-10
                    lg:w-10
                    lg:justify-self-center
                  "
                />

                <div
                  className="
                    flex
                    w-full
                    max-w-[380px]
                    min-w-0
                    flex-col
                    items-center
                    text-center
                    lg:items-start
                    lg:text-left
                  "
                >
                  <h3 className="text-lg font-extrabold uppercase leading-none sm:text-xl">
                    Physical book
                  </h3>

                  <p className="mt-2 text-[11px] leading-[1.4] text-mbg-white/85 sm:text-xs">
                    A printed edition to keep close.
                  </p>

                  <a
                    href={paypalUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label="Order the printed edition securely with PayPal"
                    className="
                      group
                      mt-4
                      inline-flex
                      min-h-10
                      w-full
                      max-w-[320px]
                      items-center
                      justify-center
                      gap-2
                      bg-mbg-black
                      px-5
                      text-center
                      text-[11px]
                      font-bold
                      uppercase
                      tracking-wide
                      text-mbg-white
                      transition-colors
                      duration-300
                      hover:bg-mbg-white
                      hover:text-mbg-black
                      focus-visible:outline
                      focus-visible:outline-2
                      focus-visible:outline-offset-2
                      focus-visible:outline-mbg-white
                      lg:max-w-[380px]
                    "
                  >
                    Order the book

                    <FiArrowUpRight
                      aria-hidden="true"
                      className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    />
                  </a>

                  <p className="mt-2 text-center text-[10px] text-mbg-white/80 sm:text-[11px] lg:text-left">
                    Secure checkout via PayPal
                  </p>
                </div>
              </article>
            </div>

            {/* ====================================================== */}
            {/* BOOK SUMMARY ACCORDION                                 */}
            {/* ====================================================== */}

            <div className="border-t border-mbg-black/15 bg-mbg-white">
              <details className="group">
                {/* ====================================================== */}
                {/* ACCORDION HEADER                                       */}
                {/* ====================================================== */}

                <summary
                  className="
                    flex
                    min-h-[82px]
                    cursor-pointer
                    list-none
                    items-center
                    justify-between
                    gap-6
                    px-6
                    py-4
                    transition-colors
                    duration-300
                    hover:bg-mbg-black/[0.025]
                    sm:px-8
                    lg:px-10
                    [&::-webkit-details-marker]:hidden
                  "
                >
                  <div className="flex items-center gap-5 sm:gap-7">
                    {/* CHAPTER NUMBER */}
                    <span className="text-[9px] font-black tracking-[0.18em] text-mbg-green sm:text-[10px]">
                      01
                    </span>

                    <div>
                      <p className="text-[8px] font-extrabold uppercase tracking-[0.22em] text-mbg-green sm:text-[9px]">
                        About the book
                      </p>

                      <h3 className="mt-1 text-[12px] font-black uppercase tracking-[-0.02em] text-mbg-black sm:text-sm">
                        Read the summary
                      </h3>
                    </div>
                  </div>

                  {/* PLUS / MINUS BUTTON */}
                  <span
                    aria-hidden="true"
                    className="
                      relative
                      flex
                      h-7
                      w-7
                      shrink-0
                      items-center
                      justify-center
                      border
                      border-mbg-black
                      transition-colors
                      duration-300
                      group-open:bg-mbg-black
                    "
                  >
                    {/* HORIZONTAL LINE */}
                    <span
                      className="
                        absolute
                        h-[1.5px]
                        w-3.5
                        bg-mbg-black
                        transition-colors
                        duration-300
                        group-open:bg-mbg-white
                      "
                    />

                    {/* VERTICAL LINE */}
                    <span
                      className="
                        absolute
                        h-3.5
                        w-[1.5px]
                        bg-mbg-black
                        transition-all
                        duration-300
                        group-open:rotate-90
                        group-open:bg-mbg-white
                      "
                    />
                  </span>
                </summary>

                {/* ====================================================== */}
                {/* ACCORDION CONTENT                                      */}
                {/* ====================================================== */}

                <div className="border-t border-mbg-black/10 bg-[#f7f7f7]">
                  <div
                    className="
                      grid
                      gap-8
                      px-6
                      py-9
                      sm:px-8
                      lg:grid-cols-[190px_1fr]
                      lg:gap-12
                      lg:px-10
                      lg:py-12
                    "
                  >
                    {/* ====================================================== */}
                    {/* LEFT COLUMN                                            */}
                    {/* ====================================================== */}

                    <div className="text-center lg:text-left">
                      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-mbg-green">
                        Grind Until Achieve
                      </p>

                      <div className="mx-auto mt-3 h-[3px] w-12 bg-mbg-green lg:mx-0" />

                      <p className="mx-auto mt-5 max-w-[150px] text-[10px] font-medium uppercase leading-[1.65] tracking-[0.06em] text-mbg-black/50 lg:mx-0">
                        Five chapters.
                        <br />
                        One mentality.
                        <br />
                        One journey.
                      </p>
                    </div>

                    {/* ====================================================== */}
                    {/* SUMMARY TEXT                                           */}
                    {/* ====================================================== */}

                    <div className="mx-auto max-w-[760px] text-center lg:mx-0 lg:text-left">
                      <p className="text-[13px] leading-[1.8] text-mbg-black/75 sm:text-sm sm:leading-[1.9]">
                        This book is an invitation to the{" "}
                        <strong className="font-bold text-mbg-black">
                          Grind
                        </strong>
                        , the{" "}
                        <strong className="font-bold text-mbg-black">
                          Resilience
                        </strong>
                        , the{" "}
                        <strong className="font-bold text-mbg-black">
                          Consistency
                        </strong>
                        , the{" "}
                        <strong className="font-bold text-mbg-black">
                          Focus
                        </strong>{" "}
                        in order to{" "}
                        <strong className="font-bold text-mbg-green">
                          Achieve
                        </strong>
                        .
                      </p>

                      <p className="mt-4 text-[13px] leading-[1.8] text-mbg-black/75 sm:text-sm sm:leading-[1.9]">
                        The journey is challenging, however, it ultimately
                        culminates in authentic achievement.
                      </p>

                      <p className="mt-4 text-[13px] leading-[1.8] text-mbg-black/75 sm:text-sm sm:leading-[1.9]">
                        <strong className="font-bold text-mbg-black">
                          Grind Until Achieve
                        </strong>{" "}
                        is a mantra, a mentality.
                      </p>

                      {/* ====================================================== */}
                      {/* FINAL STATEMENT                                        */}
                      {/* ====================================================== */}

                      <div className="mx-auto mt-7 max-w-[520px] border-l-[3px] border-mbg-green pl-4 text-left lg:mx-0">
                        <p className="text-sm font-bold leading-[1.6] text-mbg-green sm:text-[15px]">
                          Now it&apos;s up to you to write your own chapter.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ====================================================== */}
                  {/* FIVE CHAPTERS                                           */}
                  {/* ====================================================== */}

                  <div className="border-t border-mbg-black/10 px-6 py-5 sm:px-8 lg:px-10">
                    <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 lg:justify-start">
                      <span className="text-[9px] font-black uppercase tracking-[0.13em] text-mbg-black">
                        Grind
                      </span>

                      <span className="text-[9px] text-mbg-green">✿</span>

                      <span className="text-[9px] font-black uppercase tracking-[0.13em] text-mbg-black">
                        Resilience
                      </span>

                      <span className="text-[9px] text-mbg-green">✿</span>

                      <span className="text-[9px] font-black uppercase tracking-[0.13em] text-mbg-black">
                        Consistency
                      </span>

                      <span className="text-[9px] text-mbg-green">✿</span>

                      <span className="text-[9px] font-black uppercase tracking-[0.13em] text-mbg-black">
                        Focus
                      </span>

                      <span className="text-[9px] text-mbg-green">✿</span>

                      <span className="text-[9px] font-black uppercase tracking-[0.13em] text-mbg-green">
                        Achieve
                      </span>
                    </div>
                  </div>
                </div>
              </details>
            </div>

            {/* ====================================================== */}
            {/* FOOTER                                                 */}
            {/* ====================================================== */}

            <footer className="flex min-h-[68px] items-center justify-center gap-2 border-t border-mbg-black/20 bg-mbg-white/90 px-5 py-4">
              <p className="text-center text-[12px] font-black uppercase tracking-[-0.025em] sm:text-sm">
                Gr<span className="text-mbg-green">i</span>nd{" "}
                <span className="text-mbg-green">until</span> achie
                <span className="text-mbg-green">v</span>e
              </p>
            </footer>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MilosBGBook;