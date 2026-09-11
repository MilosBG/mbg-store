"use client";

import Image from "next/image";
import { useState, type ChangeEvent, type FormEvent } from "react";

import { MBGPeriwinkle } from "@/images";

type SubscribeState = "idle" | "loading" | "success" | "error";

type SubscribeResponse = {
  ok?: boolean;
  status?: "SUBSCRIBED" | "RESUBSCRIBED" | "ALREADY_SUBSCRIBED";
  message?: string;
};

const MilosBGSocialsSection = () => {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [state, setState] = useState<SubscribeState>("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (state === "loading") return;

    setState("loading");
    setMessage("");

    try {
      const response = await fetch("/api/marketing/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          email,
          consent,
          company: "",
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as SubscribeResponse;
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "Impossible de finaliser l'inscription.");
      }

      setState("success");
      setMessage(payload.message || "Inscription confirmée.");
      setEmail("");
      setConsent(false);
    } catch (error) {
      setState("error");
      setMessage(error instanceof Error ? error.message : "Une erreur est survenue.");
    }
  };

  return (
    <section className="relative mt-10 min-h-[560px] w-full overflow-hidden bg-black sm:min-h-[500px] lg:min-h-[460px]">
      <Image
        src={MBGPeriwinkle}
        alt="Milos BG Periwinkle"
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />

      <div className="absolute inset-0 bg-black/45" />
      <div className="absolute inset-0 bg-black/20" />

      <div className="relative z-10 mx-auto flex min-h-[560px] w-full max-w-[1536px] items-center justify-center px-4 py-12 sm:min-h-[500px] sm:px-6 lg:min-h-[460px] lg:px-8">
        <div className="w-full max-w-[720px] border border-white/20 bg-black/30 px-5 py-7 shadow-2xl backdrop-blur-xl sm:px-8 sm:py-9 lg:px-10 lg:py-10">
          <div className="mx-auto max-w-[590px] text-center">
            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-mbg-green sm:text-[10px]">
              Milos BG Newsletter
            </p>

            <h2 className="mt-3 text-[clamp(1.9rem,6vw,3.7rem)] font-black uppercase leading-[0.93] tracking-[-0.045em] text-white">
              Stay in the grind.
            </h2>

            <p className="mx-auto mt-4 max-w-[520px] text-xs leading-5 text-white/70 sm:text-sm sm:leading-6">
              Recevez les nouveaux drops, les coulisses de l&apos;atelier et les prochaines étapes de Milos BG.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mx-auto mt-7 max-w-[610px]" noValidate>
            <div className="grid gap-3 sm:grid-cols-[0.72fr_1.28fr_auto]">
              <label className="sr-only" htmlFor="newsletter-first-name">
                Prénom
              </label>
              <input
                id="newsletter-first-name"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setFirstName(event.target.value)}
                placeholder="PRÉNOM"
                maxLength={80}
                className="h-12 min-w-0 border border-white/20 bg-white/10 px-4 text-[11px] font-bold uppercase tracking-[0.08em] text-white outline-none backdrop-blur-md transition placeholder:text-white/45 focus:border-mbg-green focus:bg-white/15 focus:ring-2 focus:ring-mbg-green/20"
              />

              <label className="sr-only" htmlFor="newsletter-email">
                E-mail
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                autoComplete="email"
                inputMode="email"
                value={email}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setEmail(event.target.value)}
                placeholder="E-MAIL"
                className="h-12 min-w-0 border border-white/20 bg-white/10 px-4 text-[11px] font-bold tracking-[0.04em] text-white outline-none backdrop-blur-md transition placeholder:text-white/45 focus:border-mbg-green focus:bg-white/15 focus:ring-2 focus:ring-mbg-green/20"
              />

              <button
                type="submit"
                disabled={state === "loading"}
                className="h-12 bg-mbg-green px-6 text-[10px] font-black uppercase tracking-[0.12em] text-white transition hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-mbg-green disabled:cursor-wait disabled:opacity-60"
              >
                {state === "loading" ? "Inscription..." : "S'inscrire"}
              </button>
            </div>

            <label className="mt-4 flex cursor-pointer items-start gap-3 text-left">
              <input
                type="checkbox"
                required
                checked={consent}
                onChange={(event: ChangeEvent<HTMLInputElement>) => setConsent(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-[#00821A]"
              />
              <span className="text-[10px] leading-[1.55] text-white/60 sm:text-[11px]">
                Je souhaite recevoir les communications marketing Milos BG par e-mail. Je peux me désinscrire à tout moment depuis chaque e-mail.
              </span>
            </label>

            <div aria-live="polite" className="min-h-7 pt-3 text-center">
              {message ? (
                <p
                  className={`text-[10px] font-bold uppercase tracking-[0.08em] ${
                    state === "success" ? "text-mbg-green" : "text-red-300"
                  }`}
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

export default MilosBGSocialsSection;
