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

function StatusIcon({ type }: { type: "success" | "error" | "neutral" }) {
  const symbol = type === "success" ? "✓" : type === "error" ? "!" : "↘";
  return <span className={`mbg-unsub-status mbg-unsub-status--${type}`}>{symbol}</span>;
}

const PAGE_CSS = `
  .mbg-unsub-page,
  .mbg-unsub-page * {
    box-sizing: border-box;
  }

  .mbg-unsub-page {
    --mbg-green: #00821A;
    --mbg-black: #0A0A0A;
    --mbg-ink: #111111;
    --mbg-grey: #666966;
    --mbg-line: rgba(10, 10, 10, 0.12);
    --mbg-paper: #F3F4F0;
    --mbg-white: #FFFFFF;
    min-height: 100svh;
    margin: 0;
    padding: 22px 14px;
    color: var(--mbg-ink);
    background:
      radial-gradient(circle at 12% 8%, rgba(0,130,26,.08), transparent 24rem),
      linear-gradient(90deg, transparent 49.85%, rgba(10,10,10,.045) 50%, transparent 50.15%),
      var(--mbg-paper);
    font-family: Kanit, Inter, Arial, Helvetica, sans-serif;
  }

  .mbg-unsub-shell {
    width: min(100%, 920px);
    margin: 0 auto;
    background: var(--mbg-white);
    border: 1px solid var(--mbg-line);
    box-shadow: 0 28px 80px rgba(0,0,0,.10);
    overflow: hidden;
  }

  .mbg-unsub-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    min-height: 78px;
    padding: 18px 24px;
    background: var(--mbg-black);
    color: white;
  }

  .mbg-unsub-brand {
    margin: 0;
    font-size: 24px;
    line-height: 1;
    font-weight: 900;
    letter-spacing: -0.055em;
    text-transform: uppercase;
  }

  .mbg-unsub-brand strong {
    color: var(--mbg-green);
    font-weight: 900;
  }

  .mbg-unsub-mantra {
    margin: 0;
    color: rgba(255,255,255,.52);
    font-size: 10px;
    line-height: 1.2;
    font-weight: 800;
    letter-spacing: .20em;
    text-transform: uppercase;
    text-align: right;
  }

  .mbg-unsub-grid {
    display: grid;
    grid-template-columns: 180px minmax(0, 1fr);
    min-height: 560px;
  }

  .mbg-unsub-rail {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 30px 24px;
    background: #111;
    color: white;
    overflow: hidden;
  }

  .mbg-unsub-rail::before,
  .mbg-unsub-rail::after {
    content: "";
    position: absolute;
    border: 1px solid rgba(255,255,255,.10);
    border-radius: 999px;
  }

  .mbg-unsub-rail::before {
    width: 250px;
    height: 250px;
    right: -160px;
    top: 55px;
  }

  .mbg-unsub-rail::after {
    width: 150px;
    height: 150px;
    left: -100px;
    bottom: 45px;
  }

  .mbg-unsub-index {
    position: relative;
    z-index: 1;
    margin: 0;
    color: var(--mbg-green);
    font-size: 11px;
    font-weight: 900;
    letter-spacing: .16em;
    text-transform: uppercase;
  }

  .mbg-unsub-rail-copy {
    position: relative;
    z-index: 1;
    margin: 0;
    max-width: 115px;
    color: rgba(255,255,255,.52);
    font-size: 10px;
    line-height: 1.7;
    font-weight: 700;
    letter-spacing: .10em;
    text-transform: uppercase;
  }

  .mbg-unsub-content {
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    padding: 54px clamp(28px, 7vw, 76px) 42px;
  }

  .mbg-unsub-status {
    display: inline-flex;
    width: 46px;
    height: 46px;
    align-items: center;
    justify-content: center;
    margin-bottom: 24px;
    border: 1px solid var(--mbg-line);
    font-size: 22px;
    line-height: 1;
    font-weight: 900;
  }

  .mbg-unsub-status--success {
    color: white;
    border-color: var(--mbg-green);
    background: var(--mbg-green);
  }

  .mbg-unsub-status--error {
    color: white;
    border-color: #A32B2B;
    background: #A32B2B;
  }

  .mbg-unsub-status--neutral {
    color: var(--mbg-green);
    background: rgba(0,130,26,.06);
  }

  .mbg-unsub-kicker {
    margin: 0 0 10px;
    color: var(--mbg-green);
    font-size: 10px;
    line-height: 1.2;
    font-weight: 900;
    letter-spacing: .18em;
    text-transform: uppercase;
  }

  .mbg-unsub-kicker--error {
    color: #A32B2B;
  }

  .mbg-unsub-title {
    max-width: 650px;
    margin: 0;
    color: var(--mbg-black);
    font-size: clamp(42px, 7vw, 82px);
    line-height: .91;
    font-weight: 900;
    letter-spacing: -.060em;
    text-transform: uppercase;
  }

  .mbg-unsub-lead {
    max-width: 620px;
    margin: 26px 0 0;
    color: var(--mbg-grey);
    font-size: 15px;
    line-height: 1.8;
    font-weight: 400;
  }

  .mbg-unsub-email {
    display: inline-flex;
    align-items: center;
    align-self: flex-start;
    max-width: 100%;
    margin-top: 24px;
    padding: 12px 14px;
    border: 1px solid var(--mbg-line);
    background: #F8F8F6;
    color: var(--mbg-black);
    font-size: 12px;
    line-height: 1.3;
    font-weight: 800;
    overflow-wrap: anywhere;
  }

  .mbg-unsub-note {
    max-width: 640px;
    margin-top: 26px;
    padding: 18px 20px;
    border-left: 3px solid var(--mbg-green);
    background: #F7F8F5;
    color: #626562;
    font-size: 12px;
    line-height: 1.75;
  }

  .mbg-unsub-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 12px;
    margin-top: 30px;
  }

  .mbg-unsub-primary,
  .mbg-unsub-secondary {
    min-height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 22px;
    border-radius: 0;
    font-family: inherit;
    font-size: 10px;
    line-height: 1;
    font-weight: 900;
    letter-spacing: .10em;
    text-transform: uppercase;
    text-decoration: none;
    cursor: pointer;
    transition: transform .18s ease, background-color .18s ease, color .18s ease, border-color .18s ease;
  }

  .mbg-unsub-primary {
    border: 1px solid var(--mbg-black);
    background: var(--mbg-black);
    color: white;
  }

  .mbg-unsub-primary:hover {
    border-color: var(--mbg-green);
    background: var(--mbg-green);
    transform: translateY(-1px);
  }

  .mbg-unsub-secondary {
    border: 1px solid var(--mbg-line);
    background: white;
    color: var(--mbg-black);
  }

  .mbg-unsub-secondary:hover {
    border-color: var(--mbg-black);
    background: var(--mbg-black);
    color: white;
    transform: translateY(-1px);
  }

  .mbg-unsub-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 18px;
    padding: 18px 24px;
    border-top: 1px solid var(--mbg-line);
    color: rgba(10,10,10,.48);
    font-size: 9px;
    line-height: 1.4;
    font-weight: 800;
    letter-spacing: .10em;
    text-transform: uppercase;
  }

  .mbg-unsub-footer strong {
    color: var(--mbg-black);
  }

  @media (max-width: 720px) {
    .mbg-unsub-page {
      padding: 0;
      background: var(--mbg-paper);
    }

    .mbg-unsub-shell {
      min-height: 100svh;
      border-left: 0;
      border-right: 0;
      border-top: 0;
      box-shadow: none;
    }

    .mbg-unsub-topbar {
      min-height: 70px;
      padding: 16px 18px;
    }

    .mbg-unsub-brand {
      font-size: 21px;
    }

    .mbg-unsub-mantra {
      max-width: 120px;
      font-size: 8px;
      letter-spacing: .14em;
    }

    .mbg-unsub-grid {
      display: block;
      min-height: 0;
    }

    .mbg-unsub-rail {
      min-height: 68px;
      padding: 18px;
      flex-direction: row;
      align-items: center;
      gap: 18px;
    }

    .mbg-unsub-rail-copy {
      max-width: none;
      text-align: right;
      font-size: 8px;
    }

    .mbg-unsub-content {
      min-height: calc(100svh - 202px);
      justify-content: flex-start;
      padding: 38px 20px 34px;
    }

    .mbg-unsub-status {
      width: 42px;
      height: 42px;
      margin-bottom: 22px;
    }

    .mbg-unsub-title {
      font-size: clamp(40px, 14vw, 64px);
      max-width: 100%;
    }

    .mbg-unsub-lead {
      margin-top: 22px;
      font-size: 14px;
      line-height: 1.72;
    }

    .mbg-unsub-email {
      width: 100%;
      margin-top: 20px;
    }

    .mbg-unsub-note {
      margin-top: 20px;
      padding: 15px 16px;
    }

    .mbg-unsub-actions {
      margin-top: 26px;
      display: grid;
      grid-template-columns: 1fr;
    }

    .mbg-unsub-primary,
    .mbg-unsub-secondary {
      width: 100%;
      min-height: 50px;
    }

    .mbg-unsub-footer {
      align-items: flex-start;
      padding: 16px 18px;
      font-size: 8px;
    }
  }
`;

export default async function MarketingUnsubscribePage({
  searchParams,
}: PageProps) {
  const params = await searchParams;
  const owner = first(params.owner);
  const email = cleanMarketingEmail(first(params.email));
  const token = first(params.token);
  const status = first(params.status);

  const tokenRecord = await getMarketingUnsubscribeTokenRecord(owner, email, token);
  const valid = tokenRecord.valid;
  const preview = tokenRecord.preview;
  const success = status === "success" || status === "preview-success";
  const actionQuery = queryString({ owner, email, token });

  let railLabel = "Preferences";
  let railCopy = "Control your marketing communications.";
  if (success) {
    railLabel = "Updated";
    railCopy = preview ? "Preview completed. No change saved." : "Your preference has been saved.";
  } else if (!valid) {
    railLabel = "Invalid link";
    railCopy = "Return to the original e-mail and try again.";
  }

  return (
    <main className="mbg-unsub-page">
      <style>{PAGE_CSS}</style>

      <section className="mbg-unsub-shell" aria-labelledby="unsubscribe-title">
        <header className="mbg-unsub-topbar">
          <p className="mbg-unsub-brand">
            MILOS <strong>BG</strong>
          </p>
          <p className="mbg-unsub-mantra">GRIND UNTIL ACHIEVE</p>
        </header>

        <div className="mbg-unsub-grid">
          <aside className="mbg-unsub-rail" aria-hidden="true">
            <p className="mbg-unsub-index">{railLabel}</p>
            <p className="mbg-unsub-rail-copy">{railCopy}</p>
          </aside>

          <div className="mbg-unsub-content">
            {!valid ? (
              <>
                <StatusIcon type="error" />
                <p className="mbg-unsub-kicker mbg-unsub-kicker--error">Lien invalide</p>
                <h1 id="unsubscribe-title" className="mbg-unsub-title">
                  Impossible de continuer
                </h1>
                <p className="mbg-unsub-lead">
                  Ce lien de désinscription est invalide, incomplet ou a été modifié. Revenez à
                  l’e-mail d’origine et utilisez le lien « Se désinscrire ».
                </p>
                <div className="mbg-unsub-actions">
                  <Link href="/" className="mbg-unsub-primary">
                    Retour sur milos-bg.com
                  </Link>
                </div>
              </>
            ) : success ? (
              <>
                <StatusIcon type="success" />
                <p className="mbg-unsub-kicker">
                  {preview ? "Test terminé" : "Préférences mises à jour"}
                </p>
                <h1 id="unsubscribe-title" className="mbg-unsub-title">
                  {preview ? "Aucune modification" : "Vous êtes désinscrit"}
                </h1>
                <p className="mbg-unsub-lead">
                  {preview
                    ? "Cet e-mail était un test. Le parcours fonctionne correctement et aucune préférence marketing n’a été modifiée."
                    : "Cette adresse ne recevra plus les futures campagnes marketing Milos BG. La modification est prise en compte immédiatement."}
                </p>
                <div className="mbg-unsub-email">{email}</div>
                <div className="mbg-unsub-actions">
                  <Link href="/" className="mbg-unsub-primary">
                    Retour à la boutique
                  </Link>
                </div>
              </>
            ) : (
              <>
                <StatusIcon type="neutral" />
                <p className="mbg-unsub-kicker">
                  {preview ? "Aperçu" : "Préférences marketing"}
                </p>
                <h1 id="unsubscribe-title" className="mbg-unsub-title">
                  Se désinscrire
                </h1>
                <p className="mbg-unsub-lead">
                  {preview
                    ? "Voici la page publique que verra un destinataire. La confirmation en mode test n’enregistre aucune désinscription."
                    : "Confirmez votre choix si vous ne souhaitez plus recevoir les e-mails marketing Milos BG à cette adresse."}
                </p>

                <div className="mbg-unsub-email">{email}</div>

                <div className="mbg-unsub-note">
                  {preview
                    ? "Mode aperçu : aucune préférence marketing ne sera modifiée."
                    : "Cette action concerne uniquement les communications marketing. Les e-mails nécessaires au suivi d’une commande, d’un paiement, d’une facture ou d’une livraison restent actifs."}
                </div>

                <form method="post" action={`/api/marketing/unsubscribe?${actionQuery}`}>
                  <input type="hidden" name="action" value="confirm" />
                  <div className="mbg-unsub-actions">
                    <button type="submit" className="mbg-unsub-primary">
                      {preview ? "Tester la confirmation" : "Confirmer la désinscription"}
                    </button>
                    <Link href="/" className="mbg-unsub-secondary">
                      Conserver mes e-mails
                    </Link>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>

        <footer className="mbg-unsub-footer">
          <span>
            <strong>Milos BG</strong> · France
          </span>
          <span>Make it your liked outfits</span>
        </footer>
      </section>
    </main>
  );
}
