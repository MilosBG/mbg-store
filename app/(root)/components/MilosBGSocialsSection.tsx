"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Suspense,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import { MBGPeriwinkle } from "@/images";

type Language = "en" | "fr";

type SubscribeState = "idle" | "loading" | "success" | "error";

type SubscribeResponse = {
  ok?: boolean;
  status?: "SUBSCRIBED" | "RESUBSCRIBED" | "ALREADY_SUBSCRIBED";
  message?: string;
};

const translations = {
  en: {
    eyebrow: "Milos BG Newsletter",
    title: "Stay in the grind.",
    description:
      "Get new drops, behind-the-scenes stories from the workshop and the next steps of Milos BG.",

    firstNameLabel: "First name",
    firstNamePlaceholder: "FIRST NAME",

    emailLabel: "Email",
    emailPlaceholder: "EMAIL",

    subscribe: "Subscribe",
    subscribing: "Subscribing...",

    consent:
      "I agree to receive Milos BG marketing communications by email. I can unsubscribe at any time using the link included in every email.",

    success: {
      SUBSCRIBED: "You're subscribed.",
      RESUBSCRIBED: "Welcome back. Your subscription is active again.",
      ALREADY_SUBSCRIBED: "You're already subscribed.",
      default: "Subscription confirmed.",
    },

    errors: {
      generic: "Something went wrong. Please try again.",
      subscription: "Unable to complete your subscription.",
    },
  },

  fr: {
    eyebrow: "Newsletter Milos BG",
    title: "Reste dans le grind.",
    description:
      "Reçois les nouveaux drops, les coulisses de l'atelier et les prochaines étapes de Milos BG.",

    firstNameLabel: "Prénom",
    firstNamePlaceholder: "PRÉNOM",

    emailLabel: "E-mail",
    emailPlaceholder: "E-MAIL",

    subscribe: "S'inscrire",
    subscribing: "Inscription...",

    consent:
      "Je souhaite recevoir les communications marketing Milos BG par e-mail. Je peux me désinscrire à tout moment grâce au lien présent dans chaque e-mail.",

    success: {
      SUBSCRIBED: "Inscription confirmée.",
      RESUBSCRIBED: "Bon retour. Ton abonnement est de nouveau actif.",
      ALREADY_SUBSCRIBED: "Tu es déjà inscrit à la newsletter.",
      default: "Inscription confirmée.",
    },

    errors: {
      generic: "Une erreur est survenue. Réessaie dans quelques instants.",
      subscription: "Impossible de finaliser l'inscription.",
    },
  },
} as const;

// -----------------------------------------------------------------------------
// NEWSLETTER
// -----------------------------------------------------------------------------

const NewsletterContent = () => {
  const searchParams = useSearchParams();

  /**
   * English is the default language.
   *
   * /                    → EN
   * /?lang=en            → EN
   * /?lang=fr            → FR
   */
  const language: Language =
    searchParams.get("lang") === "fr" ? "fr" : "en";

  const t = translations[language];

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);

  const [state, setState] =
    useState<SubscribeState>("idle");

  const [message, setMessage] = useState("");

  // ---------------------------------------------------------------------------
  // SUBMIT
  // ---------------------------------------------------------------------------

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (state === "loading") return;

    setState("loading");
    setMessage("");

    try {
      const response = await fetch(
        "/api/marketing/subscribe",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            firstName: firstName.trim(),
            email: email.trim().toLowerCase(),
            consent,
            company: "",
          }),
        },
      );

      const payload = (await response
        .json()
        .catch(() => ({}))) as SubscribeResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(t.errors.subscription);
      }

      setState("success");

      switch (payload.status) {
        case "SUBSCRIBED":
          setMessage(t.success.SUBSCRIBED);
          break;

        case "RESUBSCRIBED":
          setMessage(t.success.RESUBSCRIBED);
          break;

        case "ALREADY_SUBSCRIBED":
          setMessage(t.success.ALREADY_SUBSCRIBED);
          break;

        default:
          setMessage(t.success.default);
      }

      setFirstName("");
      setEmail("");
      setConsent(false);
    } catch (error) {
      setState("error");

      setMessage(
        error instanceof Error
          ? error.message
          : t.errors.generic,
      );
    }
  };

  return (
    <section
      aria-labelledby="mbg-newsletter-title"
      className="
        relative
        mt-10
        min-h-[560px]
        w-full
        overflow-hidden
        bg-black
        sm:min-h-[500px]
        lg:min-h-[460px]
      "
    >
      {/* ------------------------------------------------------------------ */}
      {/* BACKGROUND                                                         */}
      {/* ------------------------------------------------------------------ */}

      <Image
        src={MBGPeriwinkle}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/45"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-black/20"
      />

      {/* ------------------------------------------------------------------ */}
      {/* CONTENT                                                            */}
      {/* ------------------------------------------------------------------ */}

      <div
        className="
          relative
          z-10
          mx-auto
          flex
          min-h-[560px]
          w-full
          max-w-[1536px]
          items-center
          justify-center
          px-4
          py-12
          sm:min-h-[500px]
          sm:px-6
          lg:min-h-[460px]
          lg:px-8
        "
      >
        <div
          className="
            w-full
            max-w-[720px]
            border
            border-white/20
            bg-black/30
            px-5
            py-7
            shadow-2xl
            backdrop-blur-xl
            sm:px-8
            sm:py-9
            lg:px-10
            lg:py-10
          "
        >
          {/* -------------------------------------------------------------- */}
          {/* HEADER                                                         */}
          {/* -------------------------------------------------------------- */}

          <div className="mx-auto max-w-[590px] text-center">
            <p
              className="
                text-[9px]
                font-black
                uppercase
                tracking-[0.24em]
                text-mbg-green
                sm:text-[10px]
              "
            >
              {t.eyebrow}
            </p>

            <h2
              id="mbg-newsletter-title"
              className="
                mt-3
                text-[clamp(1.9rem,6vw,3.7rem)]
                font-black
                uppercase
                leading-[0.93]
                tracking-[-0.045em]
                text-white
              "
            >
              {t.title}
            </h2>

            <p
              className="
                mx-auto
                mt-4
                max-w-[520px]
                text-xs
                leading-5
                text-white/70
                sm:text-sm
                sm:leading-6
              "
            >
              {t.description}
            </p>
          </div>

          {/* -------------------------------------------------------------- */}
          {/* FORM                                                           */}
          {/* -------------------------------------------------------------- */}

          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-7 max-w-[610px]"
            noValidate
          >
            <div
              className="
                grid
                gap-3
                sm:grid-cols-[0.72fr_1.28fr_auto]
              "
            >
              {/* FIRST NAME */}

              <label
                className="sr-only"
                htmlFor="newsletter-first-name"
              >
                {t.firstNameLabel}
              </label>

              <input
                id="newsletter-first-name"
                name="firstName"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(
                  event: ChangeEvent<HTMLInputElement>,
                ) => setFirstName(event.target.value)}
                placeholder={t.firstNamePlaceholder}
                maxLength={80}
                className="
                  h-12
                  min-w-0
                  border
                  border-white/20
                  bg-white/10
                  px-4
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-[0.08em]
                  text-white
                  outline-none
                  backdrop-blur-md
                  transition
                  placeholder:text-white/45
                  focus:border-mbg-green
                  focus:bg-white/15
                  focus:ring-2
                  focus:ring-mbg-green/20
                "
              />

              {/* EMAIL */}

              <label
                className="sr-only"
                htmlFor="newsletter-email"
              >
                {t.emailLabel}
              </label>

              <input
                id="newsletter-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(
                  event: ChangeEvent<HTMLInputElement>,
                ) => setEmail(event.target.value)}
                placeholder={t.emailPlaceholder}
                className="
                  h-12
                  min-w-0
                  border
                  border-white/20
                  bg-white/10
                  px-4
                  text-[11px]
                  font-bold
                  tracking-[0.04em]
                  text-white
                  outline-none
                  backdrop-blur-md
                  transition
                  placeholder:text-white/45
                  focus:border-mbg-green
                  focus:bg-white/15
                  focus:ring-2
                  focus:ring-mbg-green/20
                "
              />

              {/* SUBMIT */}

             <button
  type="submit"
  disabled={state === "loading"}
  className="
    h-12
    bg-mbg-green
    px-6
    text-[10px]
    font-black
    uppercase
    tracking-[0.12em]
    text-white
    transition
    hover:bg-white
    hover:text-black
    focus-visible:outline-2
    focus-visible:outline-offset-2
    focus-visible:outline-mbg-green
    disabled:cursor-wait
    disabled:opacity-60
  "
>
  {state === "loading"
    ? t.subscribing
    : t.subscribe}
</button>
            </div>

            {/* ------------------------------------------------------------ */}
            {/* CONSENT                                                      */}
            {/* ------------------------------------------------------------ */}

            <label
              className="
                mt-4
                flex
                cursor-pointer
                items-start
                gap-3
                text-left
              "
            >
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(
                  event: ChangeEvent<HTMLInputElement>,
                ) => setConsent(event.target.checked)}
                className="
                  mt-0.5
                  h-4
                  w-4
                  shrink-0
                  accent-[#00821A]
                "
              />

              <span
                className="
                  text-[10px]
                  leading-[1.55]
                  text-white/60
                  sm:text-[11px]
                "
              >
                {t.consent}
              </span>
            </label>

            {/* ------------------------------------------------------------ */}
            {/* FEEDBACK                                                     */}
            {/* ------------------------------------------------------------ */}

            <div
              aria-live="polite"
              aria-atomic="true"
              className="min-h-7 pt-3 text-center"
            >
              {message ? (
                <p
                  role={
                    state === "error"
                      ? "alert"
                      : "status"
                  }
                  className={`
                    text-[10px]
                    font-bold
                    uppercase
                    tracking-[0.08em]
                    ${
                      state === "success"
                        ? "text-mbg-green"
                        : "text-red-300"
                    }
                  `}
                >
                  {message}
                </p>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

// -----------------------------------------------------------------------------
// EXPORT
// -----------------------------------------------------------------------------
//
// Suspense évite les erreurs de prerender Next.js liées à useSearchParams().
// La version anglaise reste le comportement par défaut.
// -----------------------------------------------------------------------------

const MilosBGSocialsSection = () => {
  return (
    <Suspense fallback={null}>
      <NewsletterContent />
    </Suspense>
  );
};

export default MilosBGSocialsSection;