"use client";

import Container from "@/components/mbg-components/Container";
import { H2 } from "@/components/mbg-components/H2";
import { H3 } from "@/components/mbg-components/H3";
import Separator from "@/components/mbg-components/Separator";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { BiSolidBasketball } from "react-icons/bi";
import { buildMetadata } from "@/lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy",
  description: "Understand how Milos BG collects, protects, and uses your personal data across the store.",
  path: "/privacy-policy",
  image: "/Grinder.png",
  keywords: ["privacy policy", "data protection", "Milos BG"],
});



// -----------------------------------------------------------------------------
// Language helpers (persist to URL & localStorage, default to EN)
// -----------------------------------------------------------------------------
const LANG_STORAGE_KEY = "mbg.privacy.lang" as const;
type Lang = "en" | "fr";

const useLang = (): [Lang, (l: Lang) => void] => {
  const [lang, setLang] = useState<Lang>("en");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("lang") as Lang | null;
    const fromStorage = (localStorage.getItem(LANG_STORAGE_KEY) as Lang | null) ?? null;
    const initial = (fromUrl || fromStorage || "en") as Lang;
    setLang(initial);
  }, []);

  useEffect(() => {
    if (!lang) return;
    const params = new URLSearchParams(window.location.search);
    params.set("lang", lang);
    const url = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
    window.history.replaceState({}, "", url);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    document?.documentElement?.setAttribute("lang", lang);
  }, [lang]);

  return [lang, setLang];
};

// -----------------------------------------------------------------------------
// Section IDs used for TOC + active-section highlighting
// -----------------------------------------------------------------------------
const IDS = [
  "qui-sommes-nous",
  "portee",
  "definitions",
  "responsable-du-traitement",
  "donnees-collectees",
  "finalites-et-bases-legales",
  "cookies-et-traceurs",
  "publicite-et-reseaux-sociaux",
  "mesure-daudience-analytics",
  "paiement-et-lutte-contre-la-fraude",
  "compte-client-et-service-client",
  "newsletters-sms",
  "personnalisation-et-profilage",
  "partage-et-sous-traitants",
  "transferts-internationaux",
  "durees-de-conservation",
  "securite",
  "vos-droits",
  "mineurs",
  "signals-consent-gpc",
  "exercer-vos-droits",
  "mises-a-jour",
  "annexe-cookies",
  "annexe-sous-traitants",
  "annexe-bases-legales",
  "contact-dpo",
] as const;

// -----------------------------------------------------------------------------
// Localized TOC labels
// -----------------------------------------------------------------------------
const tocItems = {
  fr: [
    ["1.", "Qui sommes-nous ?", IDS[0]],
    ["2.", "Portée de cette politique", IDS[1]],
    ["3.", "Définitions", IDS[2]],
    ["4.", "Responsable du traitement", IDS[3]],
    ["5.", "Données collectées", IDS[4]],
    ["6.", "Finalités & bases légales", IDS[5]],
    ["7.", "Cookies & traceurs", IDS[6]],
    ["8.", "Publicité & réseaux sociaux", IDS[7]],
    ["9.", "Mesure d’audience (Analytics)", IDS[8]],
    ["10.", "Paiement & anti‑fraude", IDS[9]],
    ["11.", "Compte client & service client", IDS[10]],
    ["12.", "Newsletters & SMS", IDS[11]],
    ["13.", "Personnalisation / profilage", IDS[12]],
    ["14.", "Partage & sous‑traitants", IDS[13]],
    ["15.", "Transferts internationaux", IDS[14]],
    ["16.", "Durées de conservation", IDS[15]],
    ["17.", "Sécurité", IDS[16]],
    ["18.", "Vos droits", IDS[17]],
    ["19.", "Mineurs", IDS[18]],
    ["20.", "Consentement & GPC", IDS[19]],
    ["21.", "Exercer vos droits", IDS[20]],
    ["22.", "Mises à jour", IDS[21]],
    ["Annexe A.", "Table des cookies", IDS[22]],
    ["Annexe B.", "Sous‑traitants", IDS[23]],
    ["Annexe C.", "Bases légales par finalité", IDS[24]],
    ["Contact", "DPO / contact confidentialité", IDS[25]],
  ],
  en: [
    ["1.", "Who we are", IDS[0]],
    ["2.", "Scope of this policy", IDS[1]],
    ["3.", "Definitions", IDS[2]],
    ["4.", "Controller", IDS[3]],
    ["5.", "Data we collect", IDS[4]],
    ["6.", "Purposes & legal bases", IDS[5]],
    ["7.", "Cookies & trackers", IDS[6]],
    ["8.", "Advertising & social", IDS[7]],
    ["9.", "Analytics & measurement", IDS[8]],
    ["10.", "Payments & anti‑fraud", IDS[9]],
    ["11.", "Account & support", IDS[10]],
    ["12.", "Newsletters & SMS", IDS[11]],
    ["13.", "Personalization / profiling", IDS[12]],
    ["14.", "Sharing & processors", IDS[13]],
    ["15.", "International transfers", IDS[14]],
    ["16.", "Retention periods", IDS[15]],
    ["17.", "Security", IDS[16]],
    ["18.", "Your rights", IDS[17]],
    ["19.", "Minors", IDS[18]],
    ["20.", "Consent & GPC", IDS[19]],
    ["21.", "Exercising your rights", IDS[20]],
    ["22.", "Updates", IDS[21]],
    ["Annex A.", "Cookie table (example)", IDS[22]],
    ["Annex B.", "Processor categories", IDS[23]],
    ["Annex C.", "Legal bases by purpose", IDS[24]],
    ["Contact", "DPO / privacy contact", IDS[25]],
  ],
} as const;

// -----------------------------------------------------------------------------
// Shared section wrapper
// -----------------------------------------------------------------------------
const Section: React.FC<{
  id: string;
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  forceOpen?: boolean;
}> = ({ id, title, children, defaultOpen = true, forceOpen }) => {
  const open = typeof forceOpen === "boolean" ? forceOpen : defaultOpen;
  return (
    <section id={id} className="print:break-before-page text-xs scroll-mt-20">
      <details className="group rounded-xs border border-mbg-black/7 bg-mbg-white open:bg-mbg-rgbablank transition" open={open}>
        <summary className="flex w-full cursor-pointer select-none items-center justify-between gap-3 px-4 py-3">
          <H3 className="text-base text-mbg-green m-0">{title}</H3>
          <span aria-hidden className="ml-auto text-mbg-darkgrey text-[10px] font-semibold uppercase group-open:rotate-180 transition">
            <BiSolidBasketball className="mbg-icon" />
          </span>
        </summary>
        <Separator className="bg-mbg-black/10" />
        <div className="px-4 py-4 flex flex-col items-start gap-2 text-mbg-black/95">{children}</div>
      </details>
    </section>
  );
};

// -----------------------------------------------------------------------------
// TOC component (localized)
// -----------------------------------------------------------------------------
const Toc: React.FC<{ activeId: string | null; lang: Lang }> = ({ activeId, lang }) => (
  <nav aria-label={lang === "fr" ? "Sommaire" : "Table of contents"} className="rounded-xs bg-mbg-black p-4 ring-1 ring-mbg-black/7">
    <p className="mb-2 text-base font-bold uppercase tracking-wide text-mbg-green">{lang === "fr" ? "Sommaire" : "Summary"}</p>
    <ol className="space-y-1 text-xs text-mbg-darkgrey uppercase font-semibold leading-6">
      {tocItems[lang].map(([no, label, id]) => (
        <li key={id as string}>
          <a className={`hover:underline hover:text-mbg-lightgrey hoverEffect ${activeId === id ? "text-mbg-green" : ""}`} href={`#${id}`}>
            <span className="mr-2 tabular-nums">{no}</span>
            {label}
          </a>
        </li>
      ))}
    </ol>
  </nav>
);

// -----------------------------------------------------------------------------
// Content (EN = concise full text; FR = shortened placeholders for you to fill)
// -----------------------------------------------------------------------------
const ContentEN: React.FC<{ allOpen: boolean | null }> = ({ allOpen }) => (
  <>
    <Section id="qui-sommes-nous" forceOpen={allOpen ?? undefined} title="1. Who we are">
      <p>We are Milos BG, an online boutique for handmade apparel and artisan goods, operating <a className="mbg-link" href="https://www.milos-bg.com" target="_blank" rel="noopener noreferrer">milos-bg.com</a>.</p>
    </Section>
    <Section id="portee" forceOpen={allOpen ?? undefined} title="2. Scope of this policy">
      <p>This policy covers data processing via our website, apps, emails, customer support and social pages. It applies to customers, prospects and visitors.</p>
    </Section>
    <Section id="definitions" forceOpen={allOpen ?? undefined} title="3. Definitions">
      <ul className="list-disc space-y-1 pl-6">
        <li><strong>GDPR</strong>: Regulation (EU) 2016/679.</li>
        <li><strong>Personal data</strong>: information relating to an identified or identifiable person.</li>
        <li><strong>Processor</strong>: a provider processing data on our behalf.</li>
        <li><strong>Cookie</strong>: a tracker stored on your device (incl. local storage, pixels, SDKs).</li>
      </ul>
    </Section>
    <Section id="responsable-du-traitement" forceOpen={allOpen ?? undefined} title="4. Controller">
      <p>The controller is Milos BG (see <Link className="mbg-link" href={"legal-notice"}>Legal notice</Link>). Privacy contact : <Link className="mbg-link" href="mailto:contact@milos-bg.com">contact@milos-bg.com</Link></p>
    </Section>
    <Section id="donnees-collectees" forceOpen={allOpen ?? undefined} title="5. Data we collect">
      <ul className="list-disc space-y-1 pl-6">
        <li><strong>Identity</strong>: name, title, birthdate (optional).</li>
        <li><strong>Contact</strong>: email, phone, shipping/billing addresses.</li>
        <li><strong>Account</strong>: login details, order history, preferences.</li>
        <li><strong>Transaction</strong>: cart details, amount, payment status (we never see card numbers).</li>
        <li><strong>Support</strong>: messages, optional recordings, internal notes.</li>
        <li><strong>Technical</strong>: logs, IP address, user‑agent, session identifiers.</li>
        <li><strong>Marketing</strong>: consents, email open/clicks, preferences.</li>
        <li><strong>Social</strong>: interactions, comments, pseudonymized IDs.</li>
      </ul>
    </Section>
    <Section id="finalites-et-bases-legales" forceOpen={allOpen ?? undefined} title="6. Purposes & legal bases">
      <p>We process data to:</p>
      <ul className="list-disc space-y-1 pl-6">
        <li><strong>Sell & deliver</strong> products and manage the contract (performance of contract).</li>
        <li><strong>Create & manage your account</strong>, history, returns, support (contract).</li>
        <li><strong>Payment & anti‑fraud</strong> (legitimate interest / legal obligation).</li>
        <li><strong>Service communications</strong> (legitimate interest / contract).</li>
        <li><strong>Marketing</strong> email/SMS with consent, or to existing customers for similar products (consent/legitimate interest depending on country).</li>
        <li><strong>Personalization</strong> and recommendations (consent if non‑essential cookies involved).</li>
        <li><strong>Analytics</strong> essential/aggregated (legitimate interest); advanced (consent).</li>
        <li><strong>Legal obligations</strong> (billing, accounting, authorities).</li>
      </ul>
    </Section>
    <Section id="cookies-et-traceurs" forceOpen={allOpen ?? undefined} title="7. Cookies & trackers">
      <p>A consent banner lets you accept/refuse non‑essential cookies per purpose (advanced analytics, advertising, personalization, social). You can change choices anytime via “Cookie settings”.</p>
      <p>Browser settings and Global Privacy Control (GPC) signals are honored where required by law.</p>
    </Section>
    <Section id="publicite-et-reseaux-sociaux" forceOpen={allOpen ?? undefined} title="8. Advertising & social">
      <p>We may use platforms (e.g., Meta, Google, Pinterest) for retargeting/affinity. Ad cookies remain off until you consent via the CMP. Audiences may use hashed customer emails (opt‑out available).</p>
    </Section>
    <Section id="mesure-daudience-analytics" forceOpen={allOpen ?? undefined} title="9. Analytics & measurement">
      <p>We measure site performance (page views, conversions, paths). Tools that set non‑essential trackers run only with your consent via the CMP.</p>
    </Section>
    <Section id="paiement-et-lutte-contre-la-fraude" forceOpen={allOpen ?? undefined} title="10. Payments & anti‑fraud">
      <p>Payments are handled by secure providers (e.g., Stripe, PayPal, bank). We never store card numbers. Anti‑fraud checks may be performed (IP checks, inconsistencies, 3‑D Secure).</p>
    </Section>
    <Section id="compte-client-et-service-client" forceOpen={allOpen ?? undefined} title="11. Account & customer support">
      <p>Your account keeps order history, addresses, preferences. Support handles your requests and may access necessary info (order, logistics status, payments). Interactions may be logged.</p>
    </Section>
    <Section id="newsletters-sms" forceOpen={allOpen ?? undefined} title="12. Newsletters & SMS">
      <p>With your consent, we send marketing communications (new items, promos, care tips). You can unsubscribe anytime (link in the email/SMS or from your account).</p>
    </Section>
    <Section id="personnalisation-et-profilage" forceOpen={allOpen ?? undefined} title="13. Personalization / profiling">
      <p>We may tailor content/offers based on browsing and purchases. Where this relies on non‑essential trackers, we only do so with your consent. No profiling producing significant legal effects within the meaning of GDPR.</p>
    </Section>
    <Section id="partage-et-sous-traitants" forceOpen={allOpen ?? undefined} title="14. Sharing & processors">
      <p>We share data only with authorized categories of recipients:</p>
      <ul className="list-disc space-y-1 pl-6">
        <li>Payment & anti‑fraud providers;</li>
        <li>Logistics, printers/workshops for custom make and delivery;</li>
        <li>IT vendors (hosting, CRM, email, analytics, CMP);</li>
        <li>Ad platforms (if consented);</li>
        <li>Public authorities where required.</li>
      </ul>
    </Section>
    <Section id="transferts-internationaux" forceOpen={allOpen ?? undefined} title="15. International transfers">
      <p>Where data is transferred outside the EEA/UK, we implement appropriate safeguards (adequacy decisions, SCCs, supplementary measures). Copies available upon request.</p>
    </Section>
    <Section id="durees-de-conservation" forceOpen={allOpen ?? undefined} title="16. Retention periods">
      <ul className="list-disc space-y-1 pl-6">
        <li><strong>Inactive account</strong>: 3 years after last activity, then deletion/anonymization.</li>
        <li><strong>Orders/invoices</strong>: 10 years (accounting) in secure archive.</li>
        <li><strong>Prospects (email/SMS)</strong>: 3 years after last contact or until consent withdrawal.</li>
        <li><strong>Customer support</strong>: 3 years from last relevant interaction.</li>
        <li><strong>Anti‑fraud / security</strong>: 6 months to 2 years as necessary.</li>
        <li><strong>Cookies</strong>: per Annex A.</li>
      </ul>
    </Section>
    <Section id="securite" forceOpen={allOpen ?? undefined} title="17. Security">
      <p>We apply appropriate technical and organizational measures: in‑transit encryption, access control, logging, backups, environment separation, periodic security tests, permissions and incident management.</p>
    </Section>
    <Section id="vos-droits" forceOpen={allOpen ?? undefined} title="18. Your rights">
      <p>Depending on your jurisdiction: rights of access, rectification, erasure, restriction, objection, portability, withdrawal of consent, and post‑mortem directives (France). California: access, deletion, correction, opt‑out of “sale/sharing” for targeted ads; right to non‑discrimination. Québec: cessation of dissemination/de‑indexing in certain cases.</p>
    </Section>
    <Section id="mineurs" forceOpen={allOpen ?? undefined} title="19. Minors">
      <p>Our site is not intended for children under 15. We do not knowingly collect their data. Parents/guardians may contact us for deletion.</p>
    </Section>
    <Section id="signals-consent-gpc" forceOpen={allOpen ?? undefined} title="20. Consent & Global Privacy Control (GPC)">
      <p>If GPC is enabled in your browser, we treat it as an opt‑out of ad trackers where required by law. You can also manage choices via our cookie banner.</p>
    </Section>
    <Section id="exercer-vos-droits" forceOpen={allOpen ?? undefined} title="21. Exercising your rights">
      <p>Use the <Link className="mbg-link" href="mailto:contact@milos-bg.com">contact@milos-bg.com</Link>. We may ask for information to verify your identity.</p>
    </Section>
    <Section id="mises-a-jour" forceOpen={allOpen ?? undefined} title="22. Updates to this policy">
      <p>We may update this policy to reflect legal changes and our practices. The last update date appears below. For material changes we will notify you by email or site notice.</p>
    </Section>
    <Section id="annexe-cookies" forceOpen={allOpen ?? undefined} title="Annex A — Cookie table (example)">
      <ul className="list-disc space-y-1 pl-6">
        <li><strong>Essential</strong> (session, cart, anti‑bot) — session to 12 months — legal basis: legitimate interest/contract.</li>
        <li><strong>Analytics</strong> (aggregated measurement) — 13 months — consent or legitimate interest depending on setup.</li>
        <li><strong>Advertising</strong> (retargeting) — 3–13 months — consent.</li>
        <li><strong>Personalization</strong> — 6–13 months — consent.</li>
        <li><strong>Social</strong> — 3–13 months — consent.</li>
      </ul>
      <p className="text-[11px] text-mbg-darkgrey">See the consent manager (CMP) in the footer for detailed list.</p>
    </Section>
    <Section id="annexe-sous-traitants" forceOpen={allOpen ?? undefined} title="Annex B — Processor categories">
      <ul className="list-disc space-y-1 pl-6">
        <li>Hosting & CDN;</li>
        <li>Email & SMS platforms;</li>
        <li>Payments & anti‑fraud;</li>
        <li>Analytics & A/B testing;</li>
        <li>Online ads & social;</li>
        <li>Customer service (ticketing, chat);</li>
        <li>Logistics, carriers, workshops.</li>
      </ul>
      <p className="text-[11px] text-mbg-darkgrey">A named list can be provided upon legitimate request.</p>
    </Section>
    <Section id="annexe-bases-legales" forceOpen={allOpen ?? undefined} title="Annex C — Legal bases by purpose (recap)">
      <ul className="list-disc space-y-1 pl-6">
        <li>Sale/delivery/support: contract performance.</li>
        <li>Billing/accounting: legal obligation.</li>
        <li>Essential analytics & security: legitimate interest.</li>
        <li>Direct marketing email/SMS: consent (or legitimate interest for existing customers, country‑dependent).</li>
        <li>Targeted ads, personalization: consent.</li>
        <li>Anti‑fraud: legitimate interest/legal obligation.</li>
      </ul>
    </Section>
    <Section id="contact-dpo" forceOpen={allOpen ?? undefined} title="Contact — DPO / privacy">
      <p>For privacy questions contact us via <Link className="mbg-link" href="mailto:contact@milos-bg.com">contact@milos-bg.com</Link>. If you believe your rights are not respected after contacting us, you may contact your supervisory authority (in France: CNIL).</p>
    </Section>
  </>
);

const ContentFR: React.FC<{ allOpen: boolean | null }> = ({ allOpen }) => (
  <>
    {/* NOTE: Short French placeholders so you can paste full text later */}
          {/* 1 */}
          <Section id="qui-sommes-nous" forceOpen={allOpen ?? undefined} title="1. Qui sommes-nous ?">
            <p>Nous sommes Milos BG, boutique en ligne d’articles artisanaux et vêtements faits main. Nous exploitons le site <a className="mbg-link" href="https://www.milos-bg.com" target="_blank" rel="noopener noreferrer">milos-bg.com</a>.</p>
          </Section>

          {/* 2 */}
          <Section id="portee" forceOpen={allOpen ?? undefined} title="2. Portée de cette politique">
            <p>Cette politique s’applique aux traitements de données effectués via notre site, nos applications éventuelles, nos emails, notre service client et nos pages sociales. Elle couvre les clients, les prospects et les visiteurs.</p>
          </Section>

          {/* 3 */}
          <Section id="definitions" forceOpen={allOpen ?? undefined} title="3. Définitions">
            <ul className="list-disc space-y-1 pl-6">
              <li><strong>RGPD</strong> : Règlement (UE) 2016/679.</li>
              <li><strong>Donnée personnelle</strong> : information relative à une personne identifiée ou identifiable.</li>
              <li><strong>Sous‑traitant</strong> : prestataire traitant des données pour notre compte.</li>
              <li><strong>Cookie</strong> : traceur stocké sur votre appareil (incluant local storage, pixels et SDK).</li>
            </ul>
          </Section>

          {/* 4 */}
          <Section id="responsable-du-traitement" forceOpen={allOpen ?? undefined} title="4. Responsable du traitement">
            <p>Le responsable du traitement est Milos BG (voir <Link className="mbg-link" href={"legal-notice"} >Mentions légales</Link>). Contact confidentialité : <Link className="mbg-link" href="mailto:contact@milos-bg.com">contact@milos-bg.com</Link></p>
          </Section>

          {/* 5 */}
          <Section id="donnees-collectees" forceOpen={allOpen ?? undefined} title="5. Données collectées">
            <ul className="list-disc space-y-1 pl-6">
              <li><strong>Identité</strong> : nom, prénom, civilité, date de naissance (facultatif).</li>
              <li><strong>Coordonnées</strong> : email, téléphone, adresses de livraison/facturation.</li>
              <li><strong>Compte</strong> : identifiants, historique de commandes, préférences.</li>
              <li><strong>Transaction</strong> : détail panier, montant, statut de paiement (pas d’accès aux numéros de carte).</li>
              <li><strong>Service client</strong> : messages, enregistrements facultatifs, notes internes.</li>
              <li><strong>Technique</strong> : logs, adresse IP, user‑agent, identifiants de session.</li>
              <li><strong>Marketing</strong> : consentements, ouverture/clic emails, préférences.</li>
              <li><strong>Réseaux sociaux</strong> : interactions, commentaires, identifiants pseudonymisés.</li>
            </ul>
          </Section>

          {/* 6 */}
          <Section id="finalites-et-bases-legales" forceOpen={allOpen ?? undefined} title="6. Finalités & bases légales">
            <p>Nous traitons vos données pour :</p>
            <ul className="list-disc space-y-1 pl-6">
              <li><strong>Vendre et livrer</strong> nos produits, gérer la relation contractuelle (exécution du contrat).</li>
              <li><strong>Créer et gérer le compte</strong>, historique, retours, SAV (exécution du contrat).</li>
              <li><strong>Paiement & anti‑fraude</strong> (intérêt légitime / obligation légale).</li>
              <li><strong>Communications de service</strong> (intérêt légitime / exécution du contrat).</li>
              <li><strong>Prospection</strong> email/SMS si consentie ou clients existants pour produits similaires (consentement/intérêt légitime selon pays).</li>
              <li><strong>Personnalisation</strong> du site et recommandations (consentement si via cookies non essentiels).</li>
              <li><strong>Mesure d’audience</strong> essentielle et agrégée (intérêt légitime) ; avancée (consentement).</li>
              <li><strong>Respect des obligations légales</strong> (facturation, comptabilité, demandes autorités).</li>
            </ul>
          </Section>

          {/* 7 */}
          <Section id="cookies-et-traceurs" forceOpen={allOpen ?? undefined} title="7. Cookies & traceurs">
            <p>Un bandeau de consentement vous permet d’accepter/refuser les cookies non essentiels par finalité (analytics avancée, publicité, personnalisation, réseaux sociaux). Vous pouvez modifier vos choix à tout moment via « Paramètres cookies » en bas de page.</p>
            <p>Les paramètres de votre navigateur et le signal Global Privacy Control (GPC) sont pris en compte lorsque requis par la loi.</p>
          </Section>

          {/* 8 */}
          <Section id="publicite-et-reseaux-sociaux" forceOpen={allOpen ?? undefined} title="8. Publicité & réseaux sociaux">
            <p>Nous pouvons utiliser des plateformes (ex. Meta, Google, Pinterest) pour des campagnes de retargeting/affinité. Les cookies publicitaires sont désactivés tant que vous n’avez pas consenti via le CMP. Les audiences peuvent être constituées d’emails hachés de clients (opt‑out possible).</p>
          </Section>

          {/* 9 */}
          <Section id="mesure-daudience-analytics" forceOpen={allOpen ?? undefined} title="9. Mesure d’audience (Analytics)">
            <p>Nous mesurons les performances du site (pages vues, conversions, parcours). Lorsque des outils déposent des traceurs non strictement nécessaires, ils ne sont activés qu’avec votre consentement via le CMP.</p>
          </Section>

          {/* 10 */}
          <Section id="paiement-et-lutte-contre-la-fraude" forceOpen={allOpen ?? undefined} title="10. Paiement & anti‑fraude">
            <p>Le paiement est confié à des prestataires sécurisés (ex. Stripe, PayPal, prestataire bancaire). Nous ne stockons jamais vos numéros de carte. Des contrôles anti‑fraude peuvent être réalisés (vérification IP, incohérences, 3‑D Secure).</p>
          </Section>

          {/* 11 */}
          <Section id="compte-client-et-service-client" forceOpen={allOpen ?? undefined} title="11. Compte client & service client">
            <p>Votre compte conserve l’historique de commandes, adresses, préférences. Le service client traite vos demandes et peut accéder aux informations nécessaires à la résolution (commande, statut logistique, paiements). Les échanges peuvent être historisés.</p>
          </Section>

          {/* 12 */}
          <Section id="newsletters-sms" forceOpen={allOpen ?? undefined} title="12. Newsletters & SMS">
            <p>Avec votre consentement, nous envoyons des communications marketing (nouveautés, promotions, conseils d’entretien des vêtements faits main). Vous pouvez vous désabonner à tout moment (lien dans l’email/SMS ou depuis votre compte).</p>
          </Section>

          {/* 13 */}
          <Section id="personnalisation-et-profilage" forceOpen={allOpen ?? undefined} title="13. Personnalisation / profilage">
            <p>Nous pouvons adapter les contenus/offres selon votre navigation et vos achats. Lorsque cela repose sur des traceurs non essentiels, nous le faisons uniquement avec votre consentement. Aucun profilage produisant des effets juridiques significatifs au sens du RGPD n’est effectué.</p>
          </Section>

          {/* 14 */}
          <Section id="partage-et-sous-traitants" forceOpen={allOpen ?? undefined} title="14. Partage & sous‑traitants">
            <p>Nous partageons des données uniquement avec des catégories de destinataires autorisés :
            </p>
            <ul className="list-disc space-y-1 pl-6">
              <li>Prestataires de paiement et de prévention de fraude ;</li>
              <li>Logisticiens, imprimeurs/ateliers pour fabrication sur‑mesure et livraison ;</li>
              <li>Fournisseurs IT (hébergement, CRM, emailing, analytics, CMP) ;</li>
              <li>Plateformes publicitaires (si consentement) ;</li>
              <li>Autorités publiques, lorsque requis.</li>
            </ul>
          </Section>

          {/* 15 */}
          <Section id="transferts-internationaux" forceOpen={allOpen ?? undefined} title="15. Transferts internationaux">
            <p>Si des données sont transférées hors EEE/Royaume‑Uni, nous mettons en place des garanties appropriées (décisions d’adéquation, Clauses Contractuelles Types, mesures supplémentaires). Vous pouvez obtenir copie des garanties sur demande.</p>
          </Section>

          {/* 16 */}
          <Section id="durees-de-conservation" forceOpen={allOpen ?? undefined} title="16. Durées de conservation">
            <ul className="list-disc space-y-1 pl-6">
              <li><strong>Compte client inactif</strong> : 3 ans après la dernière activité, puis suppression/anonymisation.</li>
              <li><strong>Commandes/factures</strong> : 10 ans (obligation comptable) en archivage sécurisé.</li>
              <li><strong>Prospects (email/SMS)</strong> : 3 ans après le dernier contact ou jusqu’au retrait du consentement.</li>
              <li><strong>Service client</strong> : 3 ans à compter de la dernière interaction pertinente.</li>
              <li><strong>Anti‑fraude / sécurité</strong> : 6 mois à 2 ans selon nécessité.</li>
              <li><strong>Cookies</strong> : durée selon l’Annexe A.</li>
            </ul>
          </Section>

          {/* 17 */}
          <Section id="securite" forceOpen={allOpen ?? undefined} title="17. Sécurité">
            <p>Nous appliquons des mesures techniques et organisationnelles adaptées : chiffrement en transit, contrôle d’accès, journalisation, sauvegardes, cloisonnement des environnements, tests de sécurité périodiques, gestion des habilitations et des incidents.</p>
          </Section>

          {/* 18 */}
          <Section id="vos-droits" forceOpen={allOpen ?? undefined} title="18. Vos droits">
            <p>Selon votre juridiction, vous disposez notamment des droits d’accès, rectification, effacement, limitation, opposition, portabilité, retrait du consentement et directives post‑mortem (France). En Californie : accès, suppression, correction, opt‑out de la « vente/partage » à des fins de publicité ciblée ; droit à la non‑discrimination. Au Québec : droit à la cessation de diffusion/ réindexation dans certains cas.</p>
          </Section>

          {/* 19 */}
          <Section id="mineurs" forceOpen={allOpen ?? undefined} title="19. Mineurs">
            <p>Notre site n’est pas destiné aux enfants de moins de 15 ans. Nous ne collectons pas sciemment leurs données. Les parents/tuteurs peuvent nous contacter pour suppression.</p>
          </Section>

          {/* 20 */}
          <Section id="signals-consent-gpc" forceOpen={allOpen ?? undefined} title="20. Consentement & Global Privacy Control (GPC)">
            <p>Si GPC est activé dans votre navigateur, nous le traitons comme une opposition/opt‑out aux traceurs publicitaires lorsque la loi l’impose. Vous pouvez aussi paramétrer vos choix via notre bannière cookies.</p>
          </Section>

          {/* 21 */}
          <Section id="exercer-vos-droits" forceOpen={allOpen ?? undefined} title="21. Exercer vos droits">
            <p>Pour exercer vos droits, écrivez nous via <Link className="mbg-link" href="mailto:contact@milos-bg.com">contact@milos-bg.com</Link>. Afin de protéger votre compte, nous pouvons vous demander des informations permettant de vérifier votre identité.</p>
          </Section>

          {/* 22 */}
          <Section id="mises-a-jour" forceOpen={allOpen ?? undefined} title="22. Mises à jour de cette politique">
            <p>Nous pouvons modifier cette politique pour refléter les évolutions légales et nos pratiques. La date de dernière mise à jour figure ci‑dessous. En cas de changements substantiels, nous vous en informerons par email ou via un avis sur le site.</p>
          </Section>

          {/* Annexes */}
          <Section id="annexe-cookies" forceOpen={allOpen ?? undefined} title="Annexe A — Table des cookies (exemple)">
            <ul className="list-disc space-y-1 pl-6">
              <li><strong>Essentiels</strong> (session, panier, anti‑bot) — durée : session à 12 mois — base légale : intérêt légitime/exécution du contrat.</li>
              <li><strong>Analytics</strong> (mesure d’audience agrégée) — 13 mois — consentement ou intérêt légitime selon paramétrage.</li>
              <li><strong>Publicité</strong> (retargeting) — 3 à 13 mois — consentement.</li>
              <li><strong>Personnalisation</strong> — 6 à 13 mois — consentement.</li>
              <li><strong>Réseaux sociaux</strong> — 3 à 13 mois — consentement.</li>
            </ul>
            <p className="text-[11px] text-mbg-darkgrey">La liste détaillée est disponible dans le gestionnaire de consentement (CMP) accessible en bas de page.</p>
          </Section>

          <Section id="annexe-sous-traitants" forceOpen={allOpen ?? undefined} title="Annexe B — Catégories de sous‑traitants">
            <ul className="list-disc space-y-1 pl-6">
              <li>Hébergement & CDN ;</li>
              <li>Plateforme d’emailing & SMS ;</li>
              <li>Solutions de paiement & lutte anti‑fraude ;</li>
              <li>Outils analytics & A/B testing ;</li>
              <li>Publicité en ligne & réseaux sociaux ;</li>
              <li>Service client (ticketing, chat) ;</li>
              <li>Logistique, transporteurs, ateliers de fabrication.</li>
            </ul>
            <p className="text-[11px] text-mbg-darkgrey">Une liste nominative peut être fournie sur demande légitime.</p>
          </Section>

          <Section id="annexe-bases-legales" forceOpen={allOpen ?? undefined} title="Annexe C — Bases légales par finalité (récap)">
            <ul className="list-disc space-y-1 pl-6">
              <li>Vente/livraison/SAV : exécution du contrat.</li>
              <li>Facturation/comptabilité : obligation légale.</li>
              <li>Analytics essentiel & sécurité : intérêt légitime.</li>
              <li>Marketing direct email/SMS : consentement (ou intérêt légitime clients existants, pays‑dépendant).</li>
              <li>Publicité ciblée, personnalisation : consentement.</li>
              <li>Anti‑fraude : intérêt légitime/obligation légale.</li>
            </ul>
          </Section>

          <Section id="contact-dpo" forceOpen={allOpen ?? undefined} title="Contact — DPO / confidentialité">
            <p>Pour toute question relative à la confidentialité adressez vous à <Link className="mbg-link" href="mailto:contact@milos-bg.com">contact@milos-bg.com</Link>. Si vous estimez, après nous avoir contactés, que vos droits ne sont pas respectés, vous pouvez saisir l’autorité de contrôle compétente (en France : CNIL).</p>
          </Section>
  </>
);

// -----------------------------------------------------------------------------
// Page
// -----------------------------------------------------------------------------
const PrivacyPolicy: React.FC = () => {
  const [lang, setLang] = useLang();

  // Global expand/collapse control
  const [allOpen, setAllOpen] = useState<boolean | null>(null);
  // Active section highlighting
  const [activeId, setActiveId] = useState<string | null>(null);
  // Back-to-top visibility
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Read initial expand state from URL (?open=all|none)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const open = params.get("open");
    if (open === "all") setAllOpen(true);
    if (open === "none") setAllOpen(false);
  }, []);

  // Persist expand state to URL
  useEffect(() => {
    if (allOpen === null) return;
    const params = new URLSearchParams(window.location.search);
    params.set("open", allOpen ? "all" : "none");
    const url = `${window.location.pathname}?${params.toString()}${window.location.hash}`;
    window.history.replaceState({}, "", url);
  }, [allOpen]);

  // IntersectionObserver to highlight TOC
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if ((visible?.target as HTMLElement)?.id) setActiveId((visible!.target as HTMLElement).id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0.2, 0.5, 0.75] }
    );
    IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  const allOpenBool = allOpen === true;

  const ui = useMemo(() => ({
    breadcrumbHome: lang === "fr" ? "Accueil" : "Home",
    breadcrumbCurrent: lang === "fr" ? "Politique de Confidentialité" : "Privacy Policy",
    backToShop: lang === "fr" ? "← Retour à la boutique" : "← Back to shop",
    expandAll: lang === "fr" ? "Déplier tout" : "Expand all",
    collapseAll: lang === "fr" ? "Replier tout" : "Collapse all",
    ariaExpandAll: lang === "fr" ? "Tout déplier" : "Expand all",
    ariaCollapseAll: lang === "fr" ? "Tout replier" : "Collapse all",
    siteTitle: "Milos BG",
    intro: lang === "fr"
      ? (<>Cette politique décrit comment nous collectons, utilisons, partageons et protégeons vos données personnelles lorsque vous visitez notre site, créez un compte, passez commande ou interagissez avec nous.</>)
      : (<>This policy explains how we collect, use, share and protect your personal data when you visit our site, create an account, place orders or interact with us.</>),
    subIntro: lang === "fr"
      ? (<>Document conforme au RGPD/UK GDPR avec mentions pour d’autres juridictions (CPRA/CCPA, Loi 25 – Québec). Ceci n’est pas un conseil juridique.</>)
      : (<>Designed for GDPR/UK GDPR and includes notes for other jurisdictions (CPRA/CCPA, Québec Law 25). This is not legal advice.</>),
    tocAria: lang === "fr" ? "Fil d'Ariane" : "Breadcrumb",
    lastUpdateLabel: lang === "fr" ? "Dernière mise à jour :" : "Last update:",
    rights: lang === "fr" ? "Tous droits réservés" : "All rights reserved",
  }), [lang]);

  return (
    <Container className="mt-4">
      {/* Breadcrumb + Back + Language toggle */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-mbg-black/7 px-4 py-2">
        <nav aria-label={ui.tocAria} className="text-[11px] text-mbg-darkgrey">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="text-mbg-green uppercase font-medium">{ui.breadcrumbHome}</Link>
            </li>
            <li aria-hidden className="text-mbg-black bg-mbg-black">|</li>
            <li className="font-semibold uppercase text-mbg-black">{ui.breadcrumbCurrent}</li>
          </ol>
        </nav>
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <div className="inline-flex overflow-hidden rounded-xs border border-mbg-green">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-3 py-1.5 text-[12px] font-semibold uppercase transition ${lang === "en" ? "bg-mbg-black text-mbg-white" : "text-mbg-green hover:bg-mbg-green/10"}`}
              aria-pressed={lang === "en"}
            >EN</button>
            <button
              type="button"
              onClick={() => setLang("fr")}
              className={`px-3 py-1.5 text-[12px] font-semibold uppercase transition ${lang === "fr" ? "bg-mbg-black text-mbg-white" : "text-mbg-green hover:bg-mbg-green/10"}`}
              aria-pressed={lang === "fr"}
            >FR</button>
          </div>
          {/* Back to shop */}
          <Link
            href="/"
            className="inline-flex bg-mbg-rgbablank items-center rounded-xs border border-mbg-green px-3 py-1.5 text-[12px] font-semibold text-mbg-green hover:bg-mbg-green hover:text-mbg-white hoverEffect uppercase transition"
          >
            {ui.backToShop}
          </Link>
        </div>
      </div>

      <H2>{lang === "fr" ? "Politique de Confidentialité" : "Privacy Policy"}</H2>

      {/* Controls */}
      <div className="mt-2 mb-4 flex flex-wrap items-center gap-2">
        <Separator className="bg-mbg-black flex-1" />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setAllOpen(allOpenBool ? false : true)}
            className="rounded-xs border border-mbg-green px-3 py-1.5 text-[12px] font-semibold text-mbg-green hover:bg-mbg-green hover:text-mbg-white hoverEffect uppercase transition"
            aria-label={allOpenBool ? ui.ariaCollapseAll : ui.ariaExpandAll}
          >
            {allOpenBool ? ui.collapseAll : ui.expandAll}
          </button>
        </div>
      </div>

      {/* Title blurb */}
      <header className="mb-6">
        <H2 className="text-mbg-black tracking-tight m-0">Milos BG</H2>
        <p className="mt-2 text-xs">{ui.intro}</p>
        <p className="mt-1 text-[11px] text-mbg-darkgrey">{ui.subIntro}</p>
      </header>

      {/* Mobile TOC */}
      <div className="mb-6 lg:hidden">
        <Toc activeId={activeId} lang={lang} />
      </div>

      {/* Layout: sticky TOC + content */}
      <div className="grid gap-6 lg:grid-cols-12">
        <aside className="hidden lg:block lg:col-span-4">
          <div className="lg:sticky lg:top-1">
            <Toc activeId={activeId} lang={lang} />
          </div>
        </aside>

        <div className="lg:col-span-8 space-y-6">
          {lang === "en" ? <ContentEN allOpen={allOpen} /> : <ContentFR allOpen={allOpen} />}

          <footer className="mt-12 border-t pt-6 text-[10px] text-mbg-green">
            <p>
              {ui.lastUpdateLabel}&nbsp;23/09/2025
            </p>
            <p className="mt-2">&copy; {new Date().getFullYear()} Milos BG - {ui.rights}</p>
          </footer>
        </div>
      </div>

      {/* Floating Back-to-Top */}
      {showTop && (
        <button
          type="button"
          aria-label={lang === "fr" ? "Revenir en haut" : "Back to top"}
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 z-40 rounded-xs border border-mbg-green bg-mbg-white/90 px-3 py-2 text-[12px] font-semibold text-mbg-green shadow-sm backdrop-blur hover:bg-mbg-green hover:text-mbg-white hoverEffect uppercase transition"
        >
          ↑ {lang === "fr" ? "Haut de page" : "Top"}
        </button>
      )}
    </Container>
  );
};

export default PrivacyPolicy;
