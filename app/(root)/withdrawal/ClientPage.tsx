"use client";

import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  CheckCircle2,
  Download,
  Loader2,
  RotateCcw,
} from "lucide-react";

import Container from "@/components/mbg-components/Container";
import { H2 } from "@/components/mbg-components/H2";
import { useLegalSettings } from "@/lib/legal/useLegalSettings";

type Lang = "en" | "fr";
type State = "idle" | "loading" | "success" | "error";

type Receipt = {
  reference: string;
  receivedAt: string;
  emailSent: boolean;
};

const LANG_STORAGE_KEYS = [
  "mbg.lang",
  "mbg.legal.lang",
] as const;

const inputClass =
  "mt-2 w-full rounded-sm border border-mbg-black/15 bg-mbg-white px-3 py-2.5 text-sm text-mbg-black outline-none transition focus:border-mbg-green focus:ring-2 focus:ring-mbg-green/10";

const COPY = {
  en: {
    eyebrow: "GRIND WITH CLARITY",
    title: "WITHDRAWAL",
    intro:
      "Use this page to notify Milos BG of your decision to withdraw from an eligible online purchase. You may also download the PDF model form and send it separately.",

    firstName: "First name *",
    lastName: "Last name *",
    email: "Email used for the order *",
    orderNumber: "Order number *",
    orderDate: "Order date",
    deliveryDate: "Delivery date",
    products: "Product(s) concerned *",
    postalAddress: "Postal address *",
    additionalInfo: "Additional information",

    submit: "Confirm withdrawal",
    pdf: "PDF form",

    returnAddress: "RETURN ADDRESS",
    sideNote:
      "Sending this online notice records your withdrawal request. The physical product return, where required, remains separate.",
    terms: "Terms & Conditions →",

    successEyebrow: "WITHDRAWAL REQUEST RECEIVED",
    successTitle: "REQUEST RECORDED",
    successBody:
      "Your withdrawal request has been recorded. Keep the reference below with your order documents.",
    reference: "Reference",
    received: "Received",
    emailReceipt: "Email receipt",
    emailSent: "sent",
    emailNotSent: "not sent — keep this confirmation page",
    downloadPdf: "Download PDF form",
    viewOrders: "View orders",

    submitError: "Unable to submit withdrawal request.",
    unexpectedError: "An unexpected error occurred.",
  },

  fr: {
    eyebrow: "GRIND WITH CLARITY",
    title: "RÉTRACTATION",
    intro:
      "Utilisez cette page pour notifier à Milos BG votre décision de vous rétracter d’un achat en ligne éligible. Vous pouvez également télécharger le formulaire PDF de rétractation et l’envoyer séparément.",

    firstName: "Prénom *",
    lastName: "Nom *",
    email: "Email utilisé pour la commande *",
    orderNumber: "Numéro de commande *",
    orderDate: "Date de commande",
    deliveryDate: "Date de livraison",
    products: "Produit(s) concerné(s) *",
    postalAddress: "Adresse postale *",
    additionalInfo: "Informations complémentaires",

    submit: "Confirmer la rétractation",
    pdf: "Formulaire PDF",

    returnAddress: "ADRESSE DE RETOUR",
    sideNote:
      "L’envoi de cette notification en ligne enregistre votre demande de rétractation. Le retour physique du produit, lorsqu’il est requis, reste une démarche distincte.",
    terms: "Conditions générales →",

    successEyebrow: "DEMANDE DE RÉTRACTATION REÇUE",
    successTitle: "DEMANDE ENREGISTRÉE",
    successBody:
      "Votre demande de rétractation a été enregistrée. Conservez la référence ci-dessous avec les documents de votre commande.",
    reference: "Référence",
    received: "Reçue le",
    emailReceipt: "Accusé de réception par email",
    emailSent: "envoyé",
    emailNotSent:
      "non envoyé — conservez cette page de confirmation",
    downloadPdf: "Télécharger le formulaire PDF",
    viewOrders: "Voir mes commandes",

    submitError: "Impossible d’envoyer la demande de rétractation.",
    unexpectedError: "Une erreur inattendue est survenue.",
  },
} as const;

function normalizeLang(value: string | null | undefined): Lang | null {
  return value === "fr" || value === "en" ? value : null;
}

function readCurrentLang(): Lang {
  if (typeof window === "undefined") return "en";

  const params = new URLSearchParams(window.location.search);
  const fromUrl = normalizeLang(params.get("lang"));

  if (fromUrl) return fromUrl;

  for (const key of LANG_STORAGE_KEYS) {
    const stored = normalizeLang(window.localStorage.getItem(key));
    if (stored) return stored;
  }

  const htmlLang = normalizeLang(
    document.documentElement.lang.toLowerCase().slice(0, 2),
  );

  return htmlLang ?? "en";
}

/**
 * Follows the existing Milos BG EN / FR selector.
 *
 * It reacts to:
 * - ?lang=en / ?lang=fr
 * - localStorage language keys
 * - <html lang="..."> changes
 *
 * The short interval also covers selectors implemented with
 * history.replaceState(), which does not emit popstate.
 */
function useStoreLanguage(): Lang {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const sync = () => {
      const next = readCurrentLang();
      setLang((current) => (current === next ? current : next));
    };

    sync();

    const observer = new MutationObserver(sync);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["lang"],
    });

    window.addEventListener("popstate", sync);
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);

    const interval = window.setInterval(sync, 350);

    return () => {
      observer.disconnect();
      window.removeEventListener("popstate", sync);
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
      window.clearInterval(interval);
    };
  }, []);

  return lang;
}

export default function WithdrawalClientPage() {
  const { settings } = useLegalSettings();

  const lang = useStoreLanguage();
  const t = COPY[lang];

  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const returnAddress = useMemo(
    () => settings.returnAddress || settings.businessAddress,
    [settings.returnAddress, settings.businessAddress],
  );

  const pdfHref = `/api/legal/withdrawal-form?lang=${lang}`;
  const termsHref = `/terms-conditions?lang=${lang}`;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (state === "loading") return;

    setState("loading");
    setError("");

    const form = new FormData(event.currentTarget);

    const payload = {
      ...Object.fromEntries(form.entries()),
      lang,
    };

    try {
      const response = await fetch("/api/legal/withdrawal-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as Receipt & {
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || t.submitError);
      }

      setReceipt(data);
      setState("success");

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : t.unexpectedError,
      );
      setState("error");
    }
  }

  if (state === "success" && receipt) {
    return (
      <Container className="mt-8 min-h-[65vh] pb-16">
        <div className="mx-auto max-w-3xl border border-mbg-green bg-mbg-white p-6 sm:p-8">
          <CheckCircle2 className="h-8 w-8 text-mbg-green" />

          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.28em] text-mbg-green">
            {t.successEyebrow}
          </p>

          <H2 className="mt-2">{t.successTitle}</H2>

          <p className="mt-4 text-sm leading-6 text-mbg-darkgrey">
            {t.successBody}
          </p>

          <div className="mt-6 border border-mbg-black/10 bg-mbg-black/[0.03] p-4 text-sm">
            <p>
              <strong>{t.reference}:</strong>{" "}
              {receipt.reference}
            </p>

            <p className="mt-2">
              <strong>{t.received}:</strong>{" "}
              {new Intl.DateTimeFormat(
                lang === "fr" ? "fr-FR" : "en-GB",
                {
                  dateStyle: "medium",
                  timeStyle: "short",
                },
              ).format(new Date(receipt.receivedAt))}
            </p>

            <p className="mt-2">
              <strong>{t.emailReceipt}:</strong>{" "}
              {receipt.emailSent
                ? t.emailSent
                : t.emailNotSent}
            </p>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={pdfHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-sm bg-mbg-black px-4 py-3 text-xs font-bold uppercase text-mbg-white"
            >
              <Download className="h-4 w-4" />
              {t.downloadPdf}
            </a>

            <Link
              href="/orders"
              className="inline-flex items-center gap-2 rounded-sm border border-mbg-green px-4 py-3 text-xs font-bold uppercase text-mbg-green"
            >
              {t.viewOrders}
            </Link>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="mt-6 pb-16">
      <div className="mx-auto max-w-5xl">
        <div className="border-b border-mbg-black/10 pb-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-mbg-green">
            {t.eyebrow}
          </p>

          <H2 className="mt-2">{t.title}</H2>

          <p className="mt-3 max-w-3xl text-xs leading-5 text-mbg-darkgrey">
            {t.intro}
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <form
            onSubmit={submit}
            className="border border-mbg-black/10 bg-mbg-white p-5 lg:col-span-8"
          >
            <input
              type="hidden"
              name="lang"
              value={lang}
            />

            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold uppercase">
                  {t.firstName}
                </span>

                <input
                  name="firstName"
                  required
                  className={inputClass}
                  autoComplete="given-name"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase">
                  {t.lastName}
                </span>

                <input
                  name="lastName"
                  required
                  className={inputClass}
                  autoComplete="family-name"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-xs font-bold uppercase">
                  {t.email}
                </span>

                <input
                  name="email"
                  type="email"
                  required
                  className={inputClass}
                  autoComplete="email"
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase">
                  {t.orderNumber}
                </span>

                <input
                  name="orderNumber"
                  required
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase">
                  {t.orderDate}
                </span>

                <input
                  name="orderedAt"
                  type="date"
                  className={inputClass}
                />
              </label>

              <label className="block">
                <span className="text-xs font-bold uppercase">
                  {t.deliveryDate}
                </span>

                <input
                  name="receivedAt"
                  type="date"
                  className={inputClass}
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-xs font-bold uppercase">
                  {t.products}
                </span>

                <textarea
                  name="products"
                  required
                  className={`${inputClass} min-h-24 resize-y`}
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-xs font-bold uppercase">
                  {t.postalAddress}
                </span>

                <textarea
                  name="customerAddress"
                  required
                  className={`${inputClass} min-h-20 resize-y`}
                  autoComplete="street-address"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="text-xs font-bold uppercase">
                  {t.additionalInfo}
                </span>

                <textarea
                  name="message"
                  className={`${inputClass} min-h-20 resize-y`}
                />
              </label>
            </div>

            {state === "error" ? (
              <div className="mt-5 border border-red-300 bg-red-50 p-3 text-xs text-red-800">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={state === "loading"}
                className="inline-flex items-center gap-2 rounded-sm bg-mbg-green px-5 py-3 text-xs font-bold uppercase text-mbg-white transition hover:opacity-90 disabled:opacity-50"
              >
                {state === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RotateCcw className="h-4 w-4" />
                )}

                {t.submit}
              </button>

              <a
                href={pdfHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-sm border border-mbg-black px-5 py-3 text-xs font-bold uppercase text-mbg-black"
              >
                <Download className="h-4 w-4" />
                {t.pdf}
              </a>
            </div>
          </form>

          <aside className="border border-mbg-black/10 bg-mbg-black p-5 text-mbg-white lg:col-span-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-mbg-green">
              {t.returnAddress}
            </p>

            <p className="mt-3 whitespace-pre-line text-sm leading-6">
              {returnAddress}
            </p>

            <p className="mt-6 text-[11px] leading-5 text-mbg-lightgrey">
              {t.sideNote}
            </p>

            <div className="mt-6 border-t border-white/10 pt-5">
              <Link
                href={termsHref}
                className="text-xs font-bold uppercase text-mbg-green hover:underline"
              >
                {t.terms}
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </Container>
  );
}
