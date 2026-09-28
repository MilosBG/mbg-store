"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { CheckCircle2, Download, Loader2, RotateCcw } from "lucide-react";

import Container from "@/components/mbg-components/Container";
import { H2 } from "@/components/mbg-components/H2";
import { useLegalSettings } from "@/lib/legal/useLegalSettings";

type State = "idle" | "loading" | "success" | "error";

type Receipt = {
  reference: string;
  receivedAt: string;
  emailSent: boolean;
};

const inputClass =
  "mt-2 w-full rounded-sm border border-mbg-black/15 bg-mbg-white px-3 py-2.5 text-sm text-mbg-black outline-none transition focus:border-mbg-green focus:ring-2 focus:ring-mbg-green/10";

export default function WithdrawalClientPage() {
  const { settings } = useLegalSettings();
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const [receipt, setReceipt] = useState<Receipt | null>(null);

  const returnAddress = useMemo(
    () => settings.returnAddress || settings.businessAddress,
    [settings.returnAddress, settings.businessAddress],
  );

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state === "loading") return;
    setState("loading");
    setError("");

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const response = await fetch("/api/legal/withdrawal-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await response.json()) as Receipt & { error?: string };
      if (!response.ok) throw new Error(data.error || "Unable to submit withdrawal request.");
      setReceipt(data);
      setState("success");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "An unexpected error occurred.");
      setState("error");
    }
  }

  if (state === "success" && receipt) {
    return (
      <Container className="mt-8 min-h-[65vh] pb-16">
        <div className="mx-auto max-w-3xl border border-mbg-green bg-mbg-white p-6 sm:p-8">
          <CheckCircle2 className="h-8 w-8 text-mbg-green" />
          <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.28em] text-mbg-green">
            WITHDRAWAL REQUEST RECEIVED
          </p>
          <H2 className="mt-2">REQUEST RECORDED</H2>
          <p className="mt-4 text-sm leading-6 text-mbg-darkgrey">
            Your withdrawal request has been recorded. Keep the reference below with your order documents.
          </p>
          <div className="mt-6 border border-mbg-black/10 bg-mbg-black/[0.03] p-4 text-sm">
            <p><strong>Reference:</strong> {receipt.reference}</p>
            <p className="mt-2"><strong>Received:</strong> {new Date(receipt.receivedAt).toLocaleString()}</p>
            <p className="mt-2"><strong>Email receipt:</strong> {receipt.emailSent ? "sent" : "not sent — keep this confirmation page"}</p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href="/api/legal/withdrawal-form"
              className="inline-flex items-center gap-2 rounded-sm bg-mbg-black px-4 py-3 text-xs font-bold uppercase text-mbg-white"
            >
              <Download className="h-4 w-4" /> Download PDF form
            </a>
            <Link
              href="/orders"
              className="inline-flex items-center gap-2 rounded-sm border border-mbg-green px-4 py-3 text-xs font-bold uppercase text-mbg-green"
            >
              View orders
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
            GRIND WITH CLARITY
          </p>
          <H2 className="mt-2">WITHDRAWAL</H2>
          <p className="mt-3 max-w-3xl text-xs leading-5 text-mbg-darkgrey">
            Use this page to notify Milos BG of your decision to withdraw from an eligible online purchase. You may also download the PDF model form and send it separately.
          </p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-12">
          <form onSubmit={submit} className="border border-mbg-black/10 bg-mbg-white p-5 lg:col-span-8">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="block">
                <span className="text-xs font-bold uppercase">First name *</span>
                <input name="firstName" required className={inputClass} autoComplete="given-name" />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase">Last name *</span>
                <input name="lastName" required className={inputClass} autoComplete="family-name" />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-bold uppercase">Email used for the order *</span>
                <input name="email" type="email" required className={inputClass} autoComplete="email" />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase">Order number *</span>
                <input name="orderNumber" required className={inputClass} />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase">Order date</span>
                <input name="orderedAt" type="date" className={inputClass} />
              </label>
              <label className="block">
                <span className="text-xs font-bold uppercase">Delivery date</span>
                <input name="receivedAt" type="date" className={inputClass} />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-bold uppercase">Product(s) concerned *</span>
                <textarea name="products" required className={`${inputClass} min-h-24 resize-y`} />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-bold uppercase">Postal address *</span>
                <textarea name="customerAddress" required className={`${inputClass} min-h-20 resize-y`} autoComplete="street-address" />
              </label>
              <label className="block sm:col-span-2">
                <span className="text-xs font-bold uppercase">Additional information</span>
                <textarea name="message" className={`${inputClass} min-h-20 resize-y`} />
              </label>
            </div>

            {state === "error" ? (
              <div className="mt-5 border border-red-300 bg-red-50 p-3 text-xs text-red-800">{error}</div>
            ) : null}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={state === "loading"}
                className="inline-flex items-center gap-2 rounded-sm bg-mbg-green px-5 py-3 text-xs font-bold uppercase text-mbg-white transition hover:opacity-90 disabled:opacity-50"
              >
                {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
                Confirm withdrawal
              </button>
              <a
                href="/api/legal/withdrawal-form"
                className="inline-flex items-center gap-2 rounded-sm border border-mbg-black px-5 py-3 text-xs font-bold uppercase text-mbg-black"
              >
                <Download className="h-4 w-4" /> PDF form
              </a>
            </div>
          </form>

          <aside className="border border-mbg-black/10 bg-mbg-black p-5 text-mbg-white lg:col-span-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-mbg-green">RETURN ADDRESS</p>
            <p className="mt-3 whitespace-pre-line text-sm leading-6">{returnAddress}</p>
            <p className="mt-6 text-[11px] leading-5 text-mbg-lightgrey">
              Sending this online notice records your withdrawal request. The physical product return, where required, remains separate.
            </p>
            <div className="mt-6 border-t border-white/10 pt-5">
              <Link href="/terms-conditions" className="text-xs font-bold uppercase text-mbg-green hover:underline">
                Terms & Conditions →
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </Container>
  );
}
