import type { Metadata } from "next";
import Link from "next/link";

import {
  cleanMarketingEmail,
  getMarketingUnsubscribeTokenRecord,
} from "@/lib/marketing-unsubscribe";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Préférences e-mail | Milos BG",
  description: "Gérez vos préférences pour les e-mails marketing Milos BG.",
  robots: {
    index: false,
    follow: false,
  },
};

type PageProps = {
  searchParams: Promise<{
    owner?: string | string[];
    email?: string | string[];
    token?: string | string[];
    status?: string | string[];
  }>;
};

function first(value?: string | string[]) {
  return Array.isArray(value) ? value[0] || "" : value || "";
}

function queryString(values: {
  owner: string;
  email: string;
  token: string;
}) {
  const query = new URLSearchParams({
    owner: values.owner,
    email: values.email,
    token: values.token,
  });
  return query.toString();
}

function StatusMark({ success }: { success: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={`flex h-12 w-12 items-center justify-center border text-2xl font-black ${
        success
          ? "border-[#00821A] bg-[#00821A] text-white"
          : "border-red-700 bg-red-700 text-white"
      }`}
    >
      {success ? "✓" : "!"}
    </div>
  );
}

export default async function MarketingUnsubscribePage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const owner = first(params.owner);
  const email = cleanMarketingEmail(first(params.email));
  const token = first(params.token);
  const status = first(params.status);

  const tokenRecord = await getMarketingUnsubscribeTokenRecord(
    owner,
    email,
    token,
  );
  const valid = tokenRecord.valid;
  const preview = tokenRecord.preview;

  const success = status === "success" || status === "preview-success";
  const actionQuery = queryString({ owner, email, token });

  return (
    <main className="min-h-screen bg-[#f4f4f1] px-4 py-8 text-[#101010] sm:px-6 sm:py-12">
      <section className="mx-auto w-full max-w-[760px] overflow-hidden border border-black/10 bg-white shadow-[0_24px_70px_rgba(0,0,0,0.08)]">
        <header className="flex flex-wrap items-center justify-between gap-4 bg-[#101010] px-5 py-5 text-white sm:px-7">
          <div className="text-xl font-black uppercase tracking-[-0.04em]">
            MILOS <span className="text-[#00821A]">BG</span>
          </div>
          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-white/60">
            GRIND UNTIL ACHIEVE
          </p>
        </header>

        <div className="px-6 py-10 sm:px-10 sm:py-14 lg:px-14 lg:py-16">
          {!valid ? (
            <>
              <StatusMark success={false} />
              <p className="mt-7 text-[10px] font-black uppercase tracking-[0.18em] text-red-700">
                Lien invalide
              </p>
              <h1 className="mt-3 text-[clamp(2.3rem,8vw,4.8rem)] font-black uppercase leading-[0.92] tracking-[-0.055em]">
                Impossible de continuer
              </h1>
              <p className="mt-6 max-w-xl text-sm leading-7 text-black/60">
                Ce lien de désinscription est invalide, incomplet ou a été modifié.
                Revenez à l’e-mail d’origine et utilisez le lien « Se désinscrire ».
              </p>
            </>
          ) : success ? (
            <>
              <StatusMark success />
              <p className="mt-7 text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">
                {preview ? "Test terminé" : "Préférences mises à jour"}
              </p>
              <h1 className="mt-3 text-[clamp(2.3rem,8vw,4.8rem)] font-black uppercase leading-[0.92] tracking-[-0.055em]">
                {preview ? "Aucune modification" : "Vous êtes désinscrit"}
              </h1>
              <p className="mt-6 max-w-xl text-sm leading-7 text-black/60">
                {preview
                  ? "Cet e-mail était un test. Le parcours fonctionne correctement et aucune préférence marketing n’a été modifiée."
                  : "Cette adresse ne recevra plus les futures campagnes marketing Milos BG. La modification est prise en compte immédiatement."}
              </p>
              <div className="mt-6 inline-flex max-w-full break-all border border-black/10 bg-[#f4f4f1] px-3 py-2 text-xs font-bold">
                {email}
              </div>
            </>
          ) : (
            <>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#00821A]">
                {preview ? "Aperçu" : "Préférences marketing"}
              </p>
              <h1 className="mt-3 text-[clamp(2.3rem,8vw,4.8rem)] font-black uppercase leading-[0.92] tracking-[-0.055em]">
                Se désinscrire
              </h1>
              <p className="mt-6 max-w-xl text-sm leading-7 text-black/60">
                {preview
                  ? "Voici la page publique que verra un destinataire. La confirmation en mode test n’enregistre aucune désinscription."
                  : "Confirmez ci-dessous si vous ne souhaitez plus recevoir les e-mails marketing Milos BG à cette adresse."}
              </p>

              <div className="mt-6 inline-flex max-w-full break-all border border-black/10 bg-[#f4f4f1] px-3 py-2 text-xs font-bold">
                {email}
              </div>

              <div className="mt-8 border-l-[3px] border-[#00821A] bg-[#f4f4f1] px-5 py-4 text-xs leading-6 text-black/60">
                {preview
                  ? "Mode aperçu : aucune préférence marketing ne sera modifiée."
                  : "Cette action concerne uniquement les communications marketing. Les e-mails nécessaires au suivi d’une commande, d’un paiement, d’une facture ou d’une livraison restent actifs."}
              </div>

              <form
                method="post"
                action={`/api/marketing/unsubscribe?${actionQuery}`}
                className="mt-8"
              >
                <input type="hidden" name="action" value="confirm" />
                <button
                  type="submit"
                  className="inline-flex min-h-12 w-full items-center justify-center bg-[#101010] px-6 text-[11px] font-black uppercase tracking-[0.08em] text-white transition hover:bg-[#00821A] sm:w-auto"
                >
                  {preview ? "Tester la confirmation" : "Confirmer la désinscription"}
                </button>
              </form>
            </>
          )}

          <div className="mt-10 border-t border-black/10 pt-6">
            <Link
              href="/"
              className="inline-flex min-h-11 items-center justify-center border border-black/15 px-5 text-[10px] font-black uppercase tracking-[0.08em] transition hover:border-black hover:bg-black hover:text-white"
            >
              Retour sur milos-bg.com
            </Link>
          </div>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-black/10 px-5 py-5 text-[9px] font-bold uppercase tracking-[0.09em] text-black/45 sm:px-7">
          <span>Milos BG</span>
          <span>Make it your liked outfits</span>
        </footer>
      </section>
    </main>
  );
}
