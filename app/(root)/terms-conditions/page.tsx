"use client";
import Container from "@/components/mbg-components/Container";
import { H2 } from "@/components/mbg-components/H2";
import { H3 } from "@/components/mbg-components/H3";
import Separator from "@/components/mbg-components/Separator";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import { BiSolidBasketball } from "react-icons/bi";

// -----------------------------------------------------------------------------
// Language helpers (persist to URL & localStorage, default to EN)
// -----------------------------------------------------------------------------
const LANG_STORAGE_KEY = "mbg.lang" as const;
type Lang = "en" | "fr";

const useLang = (): [Lang, (l: Lang) => void] => {
  const [lang, setLang] = useState<Lang>("en");

  // Read initial lang from URL ?lang=, then localStorage, then default
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("lang") as Lang | null;
    const fromStorage =
      (localStorage.getItem(LANG_STORAGE_KEY) as Lang | null) ?? null;
    const initial = (fromUrl || fromStorage || "en") as Lang;
    setLang(initial);
  }, []);

  // Persist to URL + localStorage + <html lang>
  useEffect(() => {
    if (!lang) return;
    const params = new URLSearchParams(window.location.search);
    params.set("lang", lang);
    const url = `${window.location.pathname}?${params.toString()}${
      window.location.hash
    }`;
    window.history.replaceState({}, "", url);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    // reflect to document language for a11y & screen-readers
    document?.documentElement?.setAttribute("lang", lang);
  }, [lang]);

  return [lang, setLang];
};

// -----------------------------------------------------------------------------
// IDs used for IntersectionObserver / anchors
// -----------------------------------------------------------------------------
const IDS = [
  "identification-du-vendeur",
  "application-des-conditions-generales",
  "definitions",
  "conditions-dutilisation-du-site",
  "validite-des-offres",
  "presentation-des-produits",
  "prix-des-produits",
  "commande-et-paiement-securise",
  "securite-des-paiements",
  "identification-et-espace-personnel",
  "livraison",
  "retour-echanges",
  "garanties-legales",
  "traitements-des-colis-non-livres",
  "responsabilite",
  "propriete-intellectuelle",
  "donnees-a-caractere-personnel",
  "produits-personnalises",
  "litiges-et-mediateur",
  "droit-applicable-et-dispositions-generales",
] as const;

// -----------------------------------------------------------------------------
// Table of contents (localized labels)
// -----------------------------------------------------------------------------
const tocItems = {
  fr: [
    ["1.", "Identification du vendeur", IDS[0]],
    ["2.", "Application des Conditions Générales", IDS[1]],
    ["3.", "Définitions", IDS[2]],
    ["4.", "Conditions d’utilisation du Site", IDS[3]],
    ["5.", "Validité des offres", IDS[4]],
    ["6.", "Présentation des produits", IDS[5]],
    ["7.", "Prix des produits", IDS[6]],
    ["8.", "Commande et paiement sécurisé", IDS[7]],
    ["9.", "Sécurité des paiements", IDS[8]],
    ["10.", "Identification et Espace Personnel", IDS[9]],
    ["11.", "Livraison", IDS[10]],
    ["12.", "Retour / Échanges", IDS[11]],
    ["13.", "Garanties légales", IDS[12]],
    ["14.", "Traitement des colis non livrés", IDS[13]],
    ["15.", "Responsabilité", IDS[14]],
    ["16.", "Propriété intellectuelle", IDS[15]],
    ["17.", "Données à Caractère Personnel", IDS[16]],
    ["18.", "Produits personnalisés", IDS[17]],
    ["19.", "Litiges et Médiateur de la consommation", IDS[18]],
    ["20.", "Droit applicable et dispositions générales", IDS[18]],
  ],
  en: [
    ["1.", "Seller identification", IDS[0]],
    ["2.", "Application of the Terms and Conditions", IDS[1]],
    ["3.", "Definitions", IDS[2]],
    ["4.", "Website terms of use", IDS[3]],
    ["5.", "Offer validity", IDS[4]],
    ["6.", "Product presentation", IDS[5]],
    ["7.", "Product pricing", IDS[6]],
    ["8.", "Ordering & secure payment", IDS[7]],
    ["9.", "Payment security", IDS[8]],
    ["10.", "Identification & Account", IDS[9]],
    ["11.", "Delivery", IDS[10]],
    ["12.", "Returns / Exchanges", IDS[11]],
    ["13.", "Statutory warranties", IDS[12]],
    ["14.", "Undelivered parcels handling", IDS[13]],
    ["15.", "Liability", IDS[14]],
    ["16.", "Intellectual property", IDS[15]],
    ["17.", "Personal data", IDS[16]],
    ["18.", "Customized products", IDS[17]],
    ["19.", "Disputes & consumer mediator", IDS[18]],
    ["20.", "Governing law & general provisions", IDS[18]],
  ],
} as const;

type TocProps = { activeId: string | null; lang: Lang };
const Toc: React.FC<TocProps> = ({ activeId, lang }) => (
  <nav
    aria-label={lang === "fr" ? "Sommaire" : "Table of contents"}
    className="rounded-xs bg-mbg-black p-4 ring-1 ring-mbg-black/7"
  >
    <p className="mb-2 text-base font-bold uppercase tracking-wide text-mbg-green">
      {lang === "fr" ? "Sommaire" : "Summary"}
    </p>
    <ol className="space-y-1 text-xs text-mbg-darkgrey uppercase font-semibold leading-6">
      {tocItems[lang].map(([no, label, id]) => (
        <li key={`${id}-${no}` as string}>
          <a
            className={`hover:mbg-link hover:text-mbg-lightgrey hoverEffect ${
              activeId === id ? "text-mbg-green" : ""
            }`}
            href={`#${id}`}
          >
            <span className="mr-2 tabular-nums">{no}</span>
            {label}
          </a>
        </li>
      ))}
    </ol>
  </nav>
);

// -----------------------------------------------------------------------------
// Section wrapper (unchanged)
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
      <details
        className="group rounded-xs border border-mbg-black/7 bg-mbg-white open:bg-mbg-rgbablank transition"
        open={open}
      >
        <summary className="flex w-full cursor-pointer select-none items-center justify-between gap-3 px-4 py-3">
          <H3 className="text-base text-mbg-green m-0">{title}</H3>
          <span
            aria-hidden
            className="ml-auto text-mbg-darkgrey text-[10px] font-semibold uppercase group-open:rotate-180 transition"
          >
            <BiSolidBasketball className="mbg-icon" />
          </span>
        </summary>
        <Separator className="bg-mbg-black/10" />
        <div className="px-4 py-4 flex flex-col items-start gap-2 text-mbg-black/95">
          {children}
        </div>
      </details>
    </section>
  );
};

// -----------------------------------------------------------------------------
// Localized content blocks (FR & EN). IDs are identical to preserve anchors.
// -----------------------------------------------------------------------------
const ContentFR: React.FC<{ allOpen: boolean | null }> = ({ allOpen }) => (
  <>
    {/* 1 */}
    <Section
      id="identification-du-vendeur"
      forceOpen={allOpen ?? undefined}
      title="1. Identification du vendeur"
    >
      <p className="uppercase font-semibold text-mbg-green">
        Nom Complet : Gamil BEN AHMED
      </p>
      <p className="uppercase font-semibold text-mbg-green">
        Forme Juridique : Entrepreneur individuel
      </p>
      <p className="uppercase font-semibold text-mbg-green">Code APE : 3299Z</p>
      <p className="uppercase font-semibold text-mbg-green">
        Nom Commercial : Milos BG
      </p>
      <p className="uppercase font-semibold text-mbg-green">
        Nom de Domaine : milos-bg.com
      </p>
      <p className="uppercase font-semibold text-mbg-green">
        SIREN : 984 671 206
      </p>
    </Section>

    {/* 2 */}
    <Section
      id="application-des-conditions-generales"
      forceOpen={allOpen ?? undefined}
      title="2. Application des Conditions Générales"
    >
      <p>
        Les Conditions Générales ont pour objet de définir les droits et
        obligations des parties dans le cadre de l’utilisation du Site et la
        passation de Commandes sur le Site. Notre Politique de Confidentialité
        vous permet de prendre connaissance des conditions dans lesquelles nous
        traitons et protégeons vos Données à Caractère Personnel. Notre
        Politique de cookies vous informe sur vos droits concernant le dépôt de
        cookies sur votre terminal lors de la consultation du Site.
      </p>
      <p>
        L’accès et l’utilisation du Site impliquent l’acceptation préalable et
        sans réserve par tout Internaute des présentes Conditions Générales. La
        Commande de Produits par le Client implique l’acceptation de
        l’intégralité des présentes Conditions Générales. Cette acceptation est
        confirmée par le fait de cocher une case d’acceptation des Conditions
        Générales lors de la passation de Commande. Le Client reconnaît du même
        fait en avoir pris pleinement connaissance et les accepter sans
        restriction. Le Client reconnaît la valeur de preuve de nos systèmes
        d’enregistrement automatique et renonce à les contester en cas de
        litige, sauf pour lui d’apporter la preuve d’une défaillance de ces
        systèmes.
      </p>
      <p>
        Les Conditions Générales sont applicables aux relations entre les
        parties à l’exclusion de toutes autres conditions et expriment
        l’intégralité des obligations des parties. L’acceptation des Conditions
        Générales suppose de la part des Internautes et Clients qu’ils jouissent
        de la capacité juridique nécessaire pour cela. Si un Internaute ou un
        Client n’est pas en accord avec tout ou partie des Conditions Générales,
        il lui est vivement recommandé de ne pas utiliser le Site. Nous nous
        réservons le droit de refuser unilatéralement et sans notification
        préalable l’accès au Site à tout Internaute ou Client qui ne
        respecterait pas les Conditions Générales et de prendre toutes les
        mesures que nous estimons adaptées en cas de non-respect de ces
        Conditions Générales.
      </p>
      <p>
        Nous nous réservons le droit de modifier ponctuellement ces Conditions
        Générales, étant précisé que les Conditions Générales applicables sont
        celles en vigueur au moment de la Commande et jointes au courrier
        électronique de confirmation de Commande.
      </p>
    </Section>

    {/* 3 */}
    <Section
      id="definitions"
      forceOpen={allOpen ?? undefined}
      title="3. Définitions"
    >
      <ul className="list-disc space-y-2 pl-6">
        <li>
          <strong>Client</strong> : désigne toute personne physique inscrite sur
          le Site
        </li>
        <li>
          <strong>Commande</strong> : désigne la commande d’un Produit effectuée
          par le Client sur le Site
        </li>
        <li>
          <strong>Conditions Générales</strong> : désigne les présentes
          conditions générales de vente et d’utilisation du Site
        </li>
        <li>
          <strong>Espace Personnel</strong> : désigne l’espace personnel du
          Client auquel celui-ci accède après s’être identifié
        </li>
        <li>
          <strong>Internaute</strong> : désigne toute personne se connectant au
          Site
        </li>
        <li>
          <strong>Outfit</strong> : désigne tout bien vendu sur le site.
        </li>
        <li>
          <strong>Chapter</strong> : désigne la collection à laquelle appartient
          un outfit.
        </li>
        <li>
          <strong>Top</strong> : désigne tous les hauts.
        </li>
        <li>
          <strong>Bottom</strong> : désigne tous les bas.
        </li>
        <li>
          <strong>Backup</strong> : désigne tous les accessoires.
        </li>
        <li>
          <strong>Wishlist</strong> : désigne la liste des outfits favoris.
        </li>
        <li>
          <strong>The Hoop</strong> : désigne le panier de shopping.
        </li>
        <li>
          <strong>Site</strong> : désigne le site internet accessible à l’URL{" "}
          <a
            className="mbg-link"
            href="https://www.milos-bg.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            www.milos-bg.com
          </a>
        </li>
      </ul>
    </Section>

    {/* 4 */}
    <Section
      id="conditions-dutilisation-du-site"
      forceOpen={allOpen ?? undefined}
      title="4. Conditions d’utilisation du Site"
    >
      <p>
        Le Site est d’accès libre et gratuit à tout Internaute disposant d’un
        accès à internet. Cependant, les équipements et frais de connexion
        permettant l’accès et l’utilisation du Site sont à la charge exclusive
        de l’Internaute. L’Internaute est entièrement responsable de son
        équipement informatique et de son accès à internet.
      </p>
      <H3 className="mt-2 text-mbg-black/96">
        4.1. Obligations de l’Internaute
      </H3>
      <p className="mt-1">
        L’Internaute s’engage à n’utiliser le Site qu’à des fins légales et
        notamment à&nbsp;:
      </p>
      <ul className="mt-1 list-disc space-y-1 pl-6">
        <li>
          Ne pas accéder frauduleusement et sans autorisation au Site ni
          endommager ou perturber une partie du Site&nbsp;;
        </li>
        <li>
          Ne pas télécharger de virus ou autres codes susceptibles de mettre en
          péril le bon fonctionnement du Site.
        </li>
      </ul>
      <H3 className="mt-3 text-mbg-black/96">4.2. Disponibilité du Site</H3>
      <p className="mt-1">
        Milos BG s’efforce d’assurer la disponibilité du Site 24&nbsp;heures sur
        24, 7&nbsp;jours sur 7, sauf en cas de force majeure ou d’un évènement
        hors de son contrôle. Milos BG peut suspendre ou interrompre l’accès au
        Site, en tout ou partie, notamment pour maintenance, nécessités
        opérationnelles ou en cas d’urgence, et peut enlever ou modifier tout
        contenu, sous réserve d’honorer les Commandes passées. Ces interventions
        ne sauraient engager la responsabilité de Milos BG ni donner lieu à des
        indemnités.
      </p>
    </Section>

    {/* 5 */}
    <Section
      id="validite-des-offres"
      forceOpen={allOpen ?? undefined}
      title="5. Validité des offres"
    >
      <p>
        Nos offres s’adressent à des consommateurs disposant d’une adresse de
        livraison physique en France. Les articles visibles sur le Site sont
        disponibles jusqu’à l’épuisement des stocks. La durée de validité des
        offres et du prix est garantie sous 8&nbsp;jours. En cas de débit ou
        d’encaissement visant la commande d’un article indisponible, Milos BG
        s’engage à proposer un avoir ou à rembourser le Client dans un délai de
        14&nbsp;jours et à prévenir par courrier électronique le Client ayant
        passé commande d’un article indisponible.
      </p>
    </Section>

    {/* 6 */}
    <Section
      id="presentation-des-produits"
      forceOpen={allOpen ?? undefined}
      title="6. Présentation des produits"
    >
      <p>
        Les Produits proposés à la vente sont ceux décrits sur le Site. Milos BG
        apporte le plus grand soin à leur présentation et description. En cas de
        non-conformité du Produit livré, le Client pourra exercer son droit de
        rétractation ou la garantie légale de conformité. Milos BG procédera, le
        cas échéant, à l’échange ou au remboursement (en tout ou partie) du
        prix.
      </p>
      <p>
        Le Client reconnaît avoir eu communication, préalablement à la Commande,
        des informations suivantes&nbsp;:
      </p>
      <ul className="mt-1 list-disc space-y-1 pl-6">
        <li>caractéristiques essentielles du Produit ;</li>
        <li>prix du Produit ;</li>
        <li>frais supplémentaires éventuels ;</li>
        <li>date ou délai de livraison ;</li>
        <li>
          informations relatives à l’identité et aux coordonnées du vendeur.
        </li>
      </ul>
    </Section>

    {/* 7 */}
    <Section
      id="prix-des-produits"
      forceOpen={allOpen ?? undefined}
      title="7. Prix des produits"
    >
      <p>
        Les prix sont présentés en euros (€) toutes taxes comprises, hors frais
        de port. La TVA affichée peut évoluer en cas de modification de taux ou
        de création de taxes. Les Produits sont facturés au prix en vigueur lors
        de l’enregistrement de la Commande. Les frais de livraison apparaissent
        en fin de sélection des Produits.
      </p>
    </Section>

    {/* 8 */}
    <Section
      id="commande-et-paiement-securise"
      forceOpen={allOpen ?? undefined}
      title="8. Commande et paiement sécurisé"
    >
      <H3 className="text-mbg-black/96">8.1&nbsp;: Paiement</H3>
      <p>
        Le Client sélectionne des Produits, valide ses choix, crée si nécessaire
        un Espace Personnel, choisit un mode de paiement et confirme
        définitivement la Commande, emportant acceptation des présentes
        Conditions Générales. La facture et lien de suivi de votre colis seront
        disponible après que l’envoi de ce dernier. Tout ça vous sera communiqué
        par courriel.
      </p>
      <p>
        Nous nous réservons la propriété des Produits jusqu’au complet règlement
        de la Commande.
      </p>
      <p className="font-medium">Paiement par carte bancaire sur le site</p>
      <p>
        Le Client renseigne les données de sa carte (numéro, expiration, CVV)
        puis confirme. Milos BG n’a pas accès aux données de paiement, celles-ci
        étant traitées par un prestataire sécurisé.
      </p>
      <p className="font-medium">PayPal</p>
      <p>
        Avec PayPal, les informations financières ne sont jamais communiquées à
        Milos BG. Le paiement s’effectue via l’adresse email et le mot de passe
        PayPal.
      </p>
      <H3 className="mt-3 text-mbg-black/96">8.2&nbsp;: Défaut de paiement</H3>
      <p>
        Milos BG peut refuser une livraison ou une Commande d’un consommateur
        n’ayant pas réglé totalement une Commande précédente ou en litige de
        paiement.
      </p>
      <H3 className="mt-3 text-mbg-black/96">
        8.3&nbsp;: Vérification des paiements
      </H3>
      <p>
        Milos BG contrôle les Commandes validées pour lutter contre la fraude et
        peut bloquer une Commande en cas de défaut de paiement ou d’adresse
        erronée et demander des justificatifs (domicile, débit, etc.), notamment
        pour une adresse de livraison différente, un nouveau Client ou une
        Commande &gt; 150&nbsp;€.
      </p>
    </Section>

    {/* 9 */}
    <Section
      id="securite-des-paiements"
      forceOpen={allOpen ?? undefined}
      title="9. Sécurité des paiements"
    >
      <p>
        Le site Milos BG utilise le service de paiement sécurisé de PayPal. Le
        gestionnaire de télépaiement délivre un certificat électronique valant
        preuve du montant et de la date de la transaction.
      </p>
    </Section>

    {/* 10 */}
    <Section
      id="identification-et-espace-personnel"
      forceOpen={allOpen ?? undefined}
      title="10. Identification et Espace Personnel"
    >
      <p>
        Le Client peut créer un Espace Personnel (réservé aux personnes de 18
        ans et plus) et est responsable de l’exactitude et de la mise à jour de
        ses informations. Un seul Espace Personnel par Client. Le suivi des
        Commandes et l’historique sont accessibles depuis cet espace. Les
        éléments contractuels requis par la loi sont conservés de façon
        sécurisée par Milos BG.
      </p>
      <p>
        La création et l’authentification sont gérés par un prestataire externe
        qui est{" "}
        <Link
          target="_blank"
          rel="noopener noreferrer"
          className="mbg-link"
          href={"https://clerk.com/"}
        >
          clerk.com
        </Link>
      </p>
      <p>
        Les identifiants sont personnels et confidentiels. En cas de
        perte/oubli, contacter{" "}
        <a className="mbg-link" href="mailto:contact@milos-bg.com">
          contact@milos-bg.com
        </a>
        .
      </p>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          Ne pas créer de fausse identité ni usurper l’identité d’un tiers ;
        </li>
        <li>Vérifier et mettre à jour régulièrement ses données ;</li>
        <li>Ne pas accéder à l’Espace Personnel d’un autre Client ;</li>
        <li>
          Protéger la confidentialité de ses identifiants et se déconnecter
          après chaque session, notamment sur réseau public.
        </li>
      </ul>
      <p>
        Milos BG peut supprimer tout compte ne respectant pas les Conditions
        Générales et signaler aux autorités compétentes les faits justifiant des
        poursuites. Le Client peut résilier à tout moment via le service client
        (formulaire de contact).
      </p>
    </Section>

    {/* 11 */}
    <Section
      id="livraison"
      forceOpen={allOpen ?? undefined}
      title="11. Livraison"
    >
      <p>
        Livraison à l’adresse indiquée par le Client. Toute Commande retournée
        pour adresse erronée/incomplète sera réexpédiée aux frais du Client.
        Délais communiqués au plus tard lors de la confirmation de Commande et
        en tout état de cause ≤ 30&nbsp;jours. Vérification des Produits à la
        livraison (réserves/ refus possibles). Toute anomalie doit être signalée
        à Milos BG dans les 3&nbsp;jours suivant la livraison. Hors force
        majeure, les délais d’expédition sont ceux indiqués lors de la Commande.
      </p>
      <H3 className="mt-2 text-mbg-black/96">
        11.1&nbsp;: France métropolitaine et Corse
      </H3>
      <p>
        Expédition le jour même pour une Commande passée avant 14h (hors
        personnalisations), sinon le lendemain. Objectif de livraison sous 48h
        après réception de la Commande, sans dépasser 30&nbsp;jours, sous
        réserve d’aléas (douanes, transporteur, météo, etc.). Produits
        personnalisés&nbsp;: 8 à 12 jours (texte) et 2 à 3 semaines (logo) pour
        broderie/gravure laser.
      </p>
      <H3 className="mt-2 text-mbg-black/96">11.2&nbsp;: DOM-TOM</H3>
      <p>
        Livraison sous 9 jours ouvrés maximum à compter de la réception de la
        Commande (hors cas de force majeure).
      </p>
      <H3 className="mt-2 text-mbg-black/96">
        11.3&nbsp;: Défaut de livraison ou livraison incomplète
      </H3>
      <p>
        En cas d’absence de livraison dans les délais ou de livraison
        incomplète, contacter Milos BG pour convenir d’un délai supplémentaire
        raisonnable. À défaut de livraison dans ce nouveau délai, la Commande
        peut être annulée et remboursée dans un délai maximal de 14&nbsp;jours
        suivant la résolution du contrat.
      </p>
    </Section>

    {/* 12 */}
    <Section
      id="retour-echanges"
      forceOpen={allOpen ?? undefined}
      title="12. Retour / Échanges"
    >
      <H3 className="text-mbg-black/96">12.1. Droit de rétractation légal</H3>
      <p>
        Délai de 14&nbsp;jours francs à compter du lendemain de la livraison
        (prorogé au premier jour ouvrable si échéance un samedi/dimanche/jour
        férié). Pour une Commande de plusieurs Produits livrés séparément, le
        délai court à compter de la réception du dernier Produit.
      </p>
      <p>
        Remboursement de la totalité des sommes versées, déduction faite des
        éventuels frais d’expédition supplémentaires si un mode de livraison
        plus coûteux a été choisi. Remboursement sous 14&nbsp;jours après
        réception des Produits par Milos BG ou preuve d’expédition fournie par
        le Client (premier des deux événements), via le même moyen de paiement,
        sauf accord contraire.
      </p>
      <H3 className="mt-2 text-mbg-black/96">
        12.2. Échange et retour des Produits
      </H3>
      <p>
        Délai de 30&nbsp;jours à compter de la réception pour échange ou avoir.
        Si la nouvelle Commande est supérieure à la précédente, le Client règle
        la différence ; si elle est inférieure, remboursement de la différence
        ou avoir.
      </p>
      <H3 className="mt-2 text-mbg-black/96">12.3. Conditions et procédure</H3>
      <p>
        Exercer le droit de rétractation/retour par une déclaration dénuée
        d’ambiguïté et renvoyer aux frais du Client des Produits neufs
        (emballage d’origine, non portés, non lavés) avec le numéro de commande
        à&nbsp;:
      </p>
      <address className="not-italic">
        <div className="text-mbg-green font-bold tracking-wide">Milos BG</div>
        <div className="text-mbg-green font-bold tracking-wide">
          Informations de l’adresse :{" "}
          <Link href={"mailto:contact@milos-bg.com"} className="mbg-link">
            contact@milos-bg.com
          </Link>
        </div>
      </address>
      <p>
        Utilisation possible du formulaire de rétractation. Retour sous
        14&nbsp;jours après communication de la décision. Exclusions&nbsp;:
        Produits personnalisés. Produits retournés dans leur état/emballage
        d’origine. Coûts de retour estimés à 6&nbsp;€.
      </p>
      <p>
        Milos BG jugera de l’état des Produits. Aucun retour accepté si Produits
        endommagés/salis. Responsabilité du Client engagée en cas de
        dépréciation au-delà des manipulations nécessaires pour établir la
        nature, les caractéristiques et le bon fonctionnement du Produit. En
        l’absence de remplacement adéquat disponible, Milos BG contactera le
        Client par email.
      </p>
    </Section>

    {/* 13 */}
    <Section
      id="garanties-legales"
      forceOpen={allOpen ?? undefined}
      title="13. Garanties légales"
    >
      <p>
        Produits soumis à la garantie légale de conformité (C. conso. L.217-4 et
        s.) et à la garantie des vices cachés (C. civ. 1641 et s.). Délai de
        2&nbsp;ans à compter de la livraison ou de la découverte du vice. Frais
        de retour à la charge de Milos BG.
      </p>
      <p className="font-medium">
        Garantie relative aux défauts de la chose vendue
      </p>
      <p>
        Au Client de prouver l’existence des vices lors de la vente et leur
        caractère rendant le Produit impropre à son usage. Milos BG n’est pas
        responsable d’une mauvaise utilisation. Le Client peut demander la
        résolution de la vente ou une réduction du prix (C. civ. 1644).
      </p>
      <p className="font-medium">Garantie légale de conformité</p>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          Choix entre réparation ou remplacement (sous réserve du coût non
          disproportionné, C. conso. L.217-9) ;
        </li>
        <li>
          Absence de preuve de la non-conformité exigée pendant 24&nbsp;mois
          (6&nbsp;mois pour biens d’occasion) suivant la délivrance.
        </li>
      </ul>
      <p>Milos BG n’accorde aucune garantie commerciale.</p>
    </Section>

    {/* 14 */}
    <Section
      id="traitements-des-colis-non-livres"
      forceOpen={allOpen ?? undefined}
      title="14. Traitements des colis non livrés par notre prestataire de transport"
    >
      <p>
        Colis non remis pour causes NPAI, non réclamé, refusé, avarie de
        transport, spoliation…
      </p>
      <H3 className="mt-2 text-mbg-black/96">14.1&nbsp;: Retours NPAI</H3>
      <p>
        Après réception et acceptation, Milos BG contacte le Client pour renvoi
        (port à charge du Client) si disponible ou remboursement. Milos BG peut
        rembourser sans renvoi en cas de NPAI multiples.
      </p>
      <H3 className="mt-2 text-mbg-black/96">
        14.2&nbsp;: Retours «&nbsp;NON RÉCLAMÉ&nbsp;»
      </H3>
      <p>
        Après réception et acceptation, Milos BG contacte le Client pour renvoi
        (port à charge du Client) si disponible ou remboursement. Possibilité de
        rembourser sans renvoi en cas de cas répétés.
      </p>
      <H3 className="mt-2 text-mbg-black/96">
        14.3&nbsp;: Retours «&nbsp;REFUSÉ&nbsp;»
      </H3>
      <p>
        En cas de refus à la livraison, un bon d’achat est crédité sous 72h
        après réception. Annulation et remboursement possibles sur demande. La
        réservation des articles n’est pas garantie ; remboursement si
        indisponibilité.
      </p>
    </Section>

    {/* 15 */}
    <Section
      id="responsabilite"
      forceOpen={allOpen ?? undefined}
      title="15. Responsabilité"
    >
      <p>
        Milos BG a une obligation de moyens pour l’accès, la consultation, la
        passation de Commande et la livraison. Sa responsabilité ne saurait être
        engagée pour les inconvénients/dommages inhérents à Internet
        (perturbations, intrusions, virus). Milos BG est responsable de la bonne
        exécution du contrat, sauf force majeure, fait du Client ou fait d’un
        tiers. Les clients bénéficient des garanties des marques présentes sur
        le Site. Milos BG n’est pas responsable du contenu des sites tiers liés.
        Sauf dispositions contraires, la responsabilité est limitée au préjudice
        direct, personnel et certain. Milos BG est entièrement responsable en
        cas de décès ou blessures corporelles dus à sa négligence.
      </p>
    </Section>

    {/* 16 */}
    <Section
      id="propriete-intellectuelle"
      forceOpen={allOpen ?? undefined}
      title="16. Propriété intellectuelle"
    >
      <p>
        Tous les éléments du site Milos BG (visuels, sonores, technologies
        sous-jacentes) sont protégés (droits d’auteur, marques, bases de
        données, brevets) et sont la propriété de Milos BG ou de ses
        partenaires. Toute reproduction/ représentation/ traduction/ adaptation/
        transformation et/ou exploitation, sans consentement préalable,
        constitue une violation susceptible de poursuites. Tout lien hypertexte
        de type framing/ deep-linking/ in-line linking/ lien profond est
        interdit. Tout lien, même tacitement autorisé, devra être retiré sur
        simple demande de Milos BG.
      </p>
    </Section>

    {/* 17 */}
    <Section
      id="donnees-a-caractere-personnel"
      forceOpen={allOpen ?? undefined}
      title="17. Données à Caractère Personnel"
    >
      <p>
        Milos BG collecte certaines données à caractère personnel concernant les
        Clients et Internautes dans les conditions définies dans notre Politique
        de Confidentialité et notre Politique des cookies.
      </p>
    </Section>

    {/* 18 */}
    <Section
      id="produits-personnalises"
      forceOpen={allOpen ?? undefined}
      title="18. Produits personnalisés"
    >
      <p>
        Pour les Produits personnalisés (texte/logo), aucun échange ni
        réclamation n’est accepté et aucun droit de rétractation ne peut être
        exercé. Des différences mineures de rendu peuvent intervenir. Le Client
        déclare disposer des droits et autorisations nécessaires.
      </p>
      <p>
        Le Client garantit que les éléments fournis n’enfreignent pas de droits
        de tiers et supporte toutes conséquences (y compris financières) d’une
        violation éventuelle. Il s’engage à intervenir à toute instance engagée
        contre Milos BG et à supporter les frais/condamnations, y compris frais
        d’avocat.
      </p>
    </Section>

    {/* 19 */}
    <Section
      id="litiges-et-mediateur"
      forceOpen={allOpen ?? undefined}
      title="19. Litiges et Médiateur de la consommation"
    >
      <H3 className="text-mbg-black/96">19.1. Contacter le Service Client</H3>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          {" "}
          Téléphone (non surtaxé) du lundi au vendredi, 9h–12h et 14h–17h&nbsp;:{" "}
          <a className="mbg-link" href="tel:+33783150791">
            07 83 15 07 91
          </a>
        </li>
        <li>
          {" "}
          Par e-mail&nbsp;:{" "}
          <Link className="mbg-link" href={"mailto:contact@milos-bg.com"}>
            contact@milos-bg.com
          </Link>
        </li>
      </ul>
      <H3 className="mt-2 text-mbg-black/96">
        19.2. Médiateur de la consommation
      </H3>
      <p>
        Milos BG adhère au Service du Médiateur de la FEVAD. Après démarche
        préalable écrite auprès de Milos BG, le Médiateur peut être saisi pour
        tout litige de consommation non résolu. Modalités&nbsp;:{" "}
        <a
          className="mbg-link"
          href="https://www.fevad.com"
          target="_blank"
          rel="noreferrer"
        >
          fevad.com
        </a>
        . Plateforme européenne de règlement en ligne des litiges&nbsp;:{" "}
        <a
          className="mbg-link"
          href="https://ec.europa.eu/consumers/odr/main/index.cfm?event=main.complaints.screeningphase"
          target="_blank"
          rel="noreferrer"
        >
          ec.europa.eu/consumers/odr
        </a>
        .
      </p>
    </Section>

    {/* 20 */}
    <Section
      id="droit-applicable-et-dispositions-generales"
      forceOpen={allOpen ?? undefined}
      title="20. Droit applicable et dispositions générales"
    >
      <p>
        La nullité d’une clause n’emporte pas nullité des autres. Le fait de ne
        pas se prévaloir d’un manquement ne vaut pas renonciation. Tout litige
        doit être soumis à l’appréciation de Milos BG préalablement à toute
        action judiciaire en vue d’un règlement amiable (réclamation au Service
        Client). Droit français applicable. À défaut d’accord amiable,
        compétence des tribunaux français. En application de l’article R.631-3
        du Code de la consommation, le consommateur peut saisir la juridiction
        de son lieu de résidence au moment de la conclusion du contrat ou de la
        survenance du fait dommageable.
      </p>
    </Section>

    {/* ... keep the rest of the original FR sections as provided ... */}
  </>
);

const ContentEN: React.FC<{ allOpen: boolean | null }> = ({ allOpen }) => (
  <>
    {/* 1 */}
    <Section
      id="identification-du-vendeur"
      forceOpen={allOpen ?? undefined}
      title="1. Seller identification"
    >
      <p className="uppercase font-semibold text-mbg-green">
        Full Name : Gamil BEN AHMED
      </p>
      <p className="uppercase font-semibold text-mbg-green">
        Legal Form : Sole Trader
      </p>
      <p className="uppercase font-semibold text-mbg-green">APE Code : 3299Z</p>
      <p className="uppercase font-semibold text-mbg-green">
        Business Name : Milos BG
      </p>
      <p className="uppercase font-semibold text-mbg-green">
        Domain Name : milos-bg.com
      </p>
      <p className="uppercase font-semibold text-mbg-green">
        SIREN : 984 671 206
      </p>
    </Section>

    {/* 2 */}
    <Section
      id="application-des-conditions-generales"
      forceOpen={allOpen ?? undefined}
      title="2. Application of the Terms and Conditions"
    >
      <p>
        These Terms and Conditions define the parties’ rights and obligations
        regarding the use of the Website and the placing of Orders on the
        Website. Our Privacy Policy explains how we process and protect your
        Personal Data. Our Cookie Policy informs you of your rights concerning
        the placing of cookies on your device when browsing the Website.
      </p>
      <p>
        Access to and use of the Website imply prior and unconditional
        acceptance of these Terms and Conditions by any Internet User. Placing
        an Order by the Customer implies acceptance of all of these Terms and
        Conditions, confirmed by ticking the appropriate checkbox at checkout.
        The Customer acknowledges having read and accepted them without
        reservation and recognizes the evidentiary value of our automatic
        recording systems, unless they prove a failure of such systems.
      </p>
      <p>
        The Terms and Conditions apply to the relationship between the parties
        to the exclusion of any other terms and constitute the entire agreement.
        Acceptance by Internet Users and Customers implies they have the legal
        capacity to do so. If a User or Customer disagrees with any part, they
        are advised not to use the Website. We reserve the right to deny access
        to any User or Customer who does not comply and to take any measures we
        deem appropriate in the event of non‑compliance.
      </p>
      <p>
        We may amend these Terms and Conditions from time to time. The
        applicable version is the one in force at the time of the Order and
        attached to the Order confirmation email.
      </p>
    </Section>

    {/* 3 */}
    <Section
      id="definitions"
      forceOpen={allOpen ?? undefined}
      title="3. Definitions"
    >
      <ul className="list-disc space-y-2 pl-6">
        <li>
          <strong>Customer</strong>: any natural person registered on the
          Website.
        </li>
        <li>
          <strong>Order</strong>: an order for a Product placed by the Customer
          on the Website.
        </li>
        <li>
          <strong>Terms and Conditions</strong>: these terms of sale and website
          use.
        </li>
        <li>
          <strong>Account</strong>: the Customer’s personal area accessible
          after identification.
        </li>
        <li>
          <strong>User</strong>: any person connecting to the Website.
        </li>
        <li>
          <strong>Outfit</strong>: any good sold on the Website.
        </li>
        <li>
          <strong>Chapter</strong> : any collection.
        </li>
        <li>
          <strong>Top</strong> : any top wear.
        </li>
        <li>
          <strong>Bottom</strong> : any bottom wear.
        </li>
        <li>
          <strong>Backup</strong> : any accessory.
        </li>
        <li>
          <strong>Wishlist</strong> : favorite outfit list.
        </li>
        <li>
          <strong>The Hoop</strong> : it is the shopping cart.
        </li>
        <li>
          <strong>Website</strong>: the website at{" "}
          <a
            className="mbg-link"
            href="https://www.milos-bg.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            www.milos-bg.com
          </a>
        </li>
      </ul>
    </Section>

    {/* 4 */}
    <Section
      id="conditions-dutilisation-du-site"
      forceOpen={allOpen ?? undefined}
      title="4. Website terms of use"
    >
      <p>
        The Website is freely accessible to any User with an Internet
        connection. Equipment and connection costs remain the User’s sole
        responsibility. The User is fully responsible for their device and
        Internet access.
      </p>
      <H3 className="mt-2 text-mbg-black/96">4.1. User obligations</H3>
      <p className="mt-1">
        The User agrees to use the Website lawfully and in particular to:
      </p>
      <ul className="mt-1 list-disc space-y-1 pl-6">
        <li>
          Not access the Website fraudulently or without authorization, nor
          damage or disrupt any part of it;
        </li>
        <li>
          Not upload viruses or code that could jeopardize the Website’s proper
          functioning.
        </li>
      </ul>
      <H3 className="mt-3 text-mbg-black/96">4.2. Website availability</H3>
      <p className="mt-1">
        Milos BG endeavors to keep the Website available 24/7 except in force
        majeure or events beyond its control. Milos BG may suspend or interrupt
        access, in whole or in part, notably for maintenance, operational needs
        or emergencies, and may remove or modify any content, while honoring
        Orders already placed. Such actions do not incur Milos BG’s liability.
      </p>
    </Section>

    {/* 5 */}
    <Section
      id="validite-des-offres"
      forceOpen={allOpen ?? undefined}
      title="5. Offer validity"
    >
      <p>
        Our offers are intended for consumers with a physical delivery address
        in France. Items shown on the Website are available while stocks last.
        Offer and price validity is guaranteed for 8 days. In the event of a
        charge for an unavailable item, Milos BG will offer a credit or refund
        within 14 days and notify the Customer by email.
      </p>
    </Section>

    {/* 6 */}
    <Section
      id="presentation-des-produits"
      forceOpen={allOpen ?? undefined}
      title="6. Product presentation"
    >
      <p>
        Products offered for sale are those described on the Website. Milos BG
        takes great care in their presentation and description. In the event of
        non‑conformity of the delivered Product, the Customer may exercise the
        right of withdrawal or the statutory conformity warranty. Milos BG will
        exchange or refund the price (in whole or part) where applicable.
      </p>
      <p>
        The Customer acknowledges having received, prior to ordering, the
        following information:
      </p>
      <ul className="mt-1 list-disc space-y-1 pl-6">
        <li>essential characteristics of the Product;</li>
        <li>Product price;</li>
        <li>any additional charges;</li>
        <li>delivery date or timeframe;</li>
        <li>
          information relating to the seller’s identity and contact details.
        </li>
      </ul>
    </Section>

    {/* 7 */}
    <Section
      id="prix-des-produits"
      forceOpen={allOpen ?? undefined}
      title="7. Product pricing"
    >
      <p>
        Prices are shown in euros (€) including all taxes, excluding shipping.
        VAT displayed may change in the event of a rate change or new taxes.
        Products are invoiced at the price in force when the Order is recorded.
        Shipping costs appear at the end of Product selection.
      </p>
    </Section>

    {/* 8 */}
    <Section
      id="commande-et-paiement-securise"
      forceOpen={allOpen ?? undefined}
      title="8. Ordering & secure payment"
    >
      <H3 className="text-mbg-black/96">8.1: Payment</H3>
      <p>
        The Customer selects Products, validates choices, creates an Account if
        needed, chooses a payment method and confirms the Order, thereby
        accepting these Terms. The invoice and the order tracking link are
        available only after the product was shipped. It will be sent via email.
      </p>
      <p>We retain title to Products until full payment of the Order.</p>
      <p className="font-medium">Payment by bank card on the site</p>
      <p>
        The Customer enters card details (number, expiry, CVV) then confirms.
        Milos BG has no access to payment data, which are processed by a secure
        provider.
      </p>
      <p className="font-medium">PayPal</p>
      <p>
        With PayPal, financial information is never communicated to Milos BG.
        Payment is made via the PayPal email address and password.
      </p>
      <H3 className="mt-3 text-mbg-black/96">8.2: Payment default</H3>
      <p>
        Milos BG may refuse delivery or an Order from a consumer who has not
        fully paid a previous Order or is in a payment dispute.
      </p>
      <H3 className="mt-3 text-mbg-black/96">8.3: Payment verification</H3>
      <p>
        Milos BG checks validated Orders to combat fraud and may block an Order
        in case of non‑payment or incorrect address and request supporting
        documents (proof of address, debit, etc.), notably for different
        delivery address, new Customer or Order &gt; €150.
      </p>
    </Section>

    {/* 9 */}
    <Section
      id="securite-des-paiements"
      forceOpen={allOpen ?? undefined}
      title="9. Payment security"
    >
      <p>
        The Milos BG site uses PayPal’s secure payment. The e‑payment manager
        issues an electronic certificate as proof of the transaction’s amount
        and date.
      </p>
    </Section>

    {/* 10 */}
    <Section
      id="identification-et-espace-personnel"
      forceOpen={allOpen ?? undefined}
      title="10. Identification & Account"
    >
      <p>
        The Customer may create an Account (for persons 18+). They are
        responsible for the accuracy and updating of their information. One
        Account per Customer. Order tracking and history are accessible from
        this area. Contractual elements required by law are securely stored by
        Milos BG.
      </p>
      <p>
        Account creation and authentication are managed by an external provider,{" "}
        <Link
          target="_blank"
          rel="noopener noreferrer"
          className="mbg-link"
          href={"https://clerk.com/"}
        >
          clerk.com
        </Link>
        .
      </p>

      <p>
        Login details are personal and confidential. In case of
        loss/forgetfulness, contact{" "}
        <a className="mbg-link" href="mailto:contact@milos-bg.com">
          contact@milos-bg.com
        </a>
        .
      </p>
      <ul className="list-disc space-y-1 pl-6">
        <li>Do not create a false identity or impersonate a third party;</li>
        <li>Check and regularly update your data;</li>
        <li>Do not access another Customer’s Account;</li>
        <li>
          Protect confidentiality of login details and log out after each
          session, especially on public networks.
        </li>
      </ul>
      <p>
        Milos BG may delete any account not complying with the Terms and report
        to authorities any facts justifying prosecution. The Customer may
        terminate at any time via customer service (contact form).
      </p>
    </Section>

    {/* 11 */}
    <Section
      id="livraison"
      forceOpen={allOpen ?? undefined}
      title="11. Delivery"
    >
      <p>
        Delivery to the address indicated by the Customer. Any Order returned
        due to an incorrect/incomplete address will be reshipped at the
        Customer’s expense. Deadlines are communicated at the latest in the
        Order confirmation and in any event ≤ 30 days. Products must be checked
        on delivery (reservations/refusal possible). Any anomaly must be
        reported to Milos BG within 3 days of delivery. Barring force majeure,
        dispatch times are those indicated when ordering.
      </p>
      <H3 className="mt-2 text-mbg-black/96">
        11.1: Mainland France & Corsica
      </H3>
      <p>
        Same‑day shipping for Orders placed before 2 p.m. (excluding
        customization), otherwise next day. Target delivery within 48 hours
        after receipt of the Order, without exceeding 30 days, subject to
        contingencies (customs, carrier, weather, etc.). Customized products:
        8–12 days (text) and 2–3 weeks (logo) for embroidery/laser engraving.
      </p>
      <H3 className="mt-2 text-mbg-black/96">11.2: Overseas territories</H3>
      <p>
        Delivery within 9 working days maximum from receipt of the Order (except
        in force majeure).
      </p>
      <H3 className="mt-2 text-mbg-black/96">
        11.3: Failed or incomplete delivery
      </H3>
      <p>
        If delivery is not made on time or is incomplete, contact Milos BG to
        agree on a reasonable additional period. If delivery still does not
        occur, the Order may be canceled and refunded within 14 days from
        cancellation.
      </p>
    </Section>

    {/* 12 */}
    <Section
      id="retour-echanges"
      forceOpen={allOpen ?? undefined}
      title="12. Returns / Exchanges"
    >
      <H3 className="text-mbg-black/96">12.1. Statutory right of withdrawal</H3>
      <p>
        Period of 14 clear days from the day after delivery (extended to the
        next working day if the deadline falls on a Saturday/Sunday/public
        holiday). For an Order of several Products delivered separately, the
        period runs from receipt of the last Product.
      </p>
      <p>
        Refund of all sums paid, less any additional shipping costs if a more
        expensive delivery method was chosen. Refund within 14 days after Milos
        BG receives the Products or the Customer provides proof of shipment
        (whichever occurs first), via the same means of payment, unless
        otherwise agreed.
      </p>
      <H3 className="mt-2 text-mbg-black/96">12.2. Exchange and returns</H3>
      <p>
        30‑day period from receipt for exchange or credit. If the new Order is
        higher, the Customer pays the difference; if lower, the difference is
        refunded or credited.
      </p>
      <H3 className="mt-2 text-mbg-black/96">12.3. Conditions and procedure</H3>
      <p>
        Exercise the right of withdrawal/return by an unambiguous statement and
        return, at the Customer’s expense, new Products (original packaging,
        unworn, unwashed) with the order number to :
      </p>
      <address className="not-italic">
        <div className="text-mbg-green font-bold tracking-wide">Milos BG</div>
        <div className="text-mbg-green font-bold tracking-wide">
          Address Information :{" "}
          <Link href={"mailto:contact@milos-bg.com"} className="mbg-link">
            contact@milos-bg.com
          </Link>
        </div>
      </address>
      <p>
        The withdrawal form may be used. Return within 14 days after notifying
        the decision. Exclusions: customized Products. Products must be returned
        in their original condition/packaging. Estimated return cost €6.
      </p>
      <p>
        Milos BG will assess the condition of returned Products. No return
        accepted if Products are damaged/soiled. The Customer is liable for any
        depreciation beyond what is necessary to establish the nature,
        characteristics and proper functioning of the Product. If a suitable
        replacement is unavailable, Milos BG will contact the Customer by email.
      </p>
    </Section>

    {/* 13 */}
    <Section
      id="garanties-legales"
      forceOpen={allOpen ?? undefined}
      title="13. Statutory warranties"
    >
      <p>
        Products are subject to the legal warranty of conformity (French
        Consumer Code L.217‑4 et seq.) and the warranty against hidden defects
        (French Civil Code 1641 et seq.). Period of 2 years from delivery or
        discovery of the defect. Return costs borne by Milos BG.
      </p>
      <p className="font-medium">Warranty for defects in the sold item</p>
      <p>
        The Customer must prove the existence of the defects at the time of sale
        and that they render the Product unfit for its intended use. Milos BG is
        not liable for misuse. The Customer may seek rescission of the sale or a
        price reduction (Civil Code 1644).
      </p>
      <p className="font-medium">Legal warranty of conformity</p>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          Choice between repair or replacement (subject to non‑disproportionate
          cost, Consumer Code L.217‑9);
        </li>
        <li>
          No proof of non‑conformity required for 24 months (6 months for
          second‑hand goods) following delivery.
        </li>
      </ul>
      <p>Milos BG grants no commercial warranty.</p>
    </Section>

    {/* 14 */}
    <Section
      id="traitements-des-colis-non-livres"
      forceOpen={allOpen ?? undefined}
      title="14. Handling of undelivered parcels by our carrier"
    >
      <p>
        Parcels not delivered due to “address unknown”, unclaimed, refused,
        carrier damage, tampering, etc.
      </p>
      <H3 className="mt-2 text-mbg-black/96">
        14.1: NPAI (addressee unknown) returns
      </H3>
      <p>
        After receipt and acceptance, Milos BG contacts the Customer for
        reshipment (postage at Customer’s expense) if available, or refund.
        Milos BG may refund without reshipment in case of multiple NPAI.
      </p>
      <H3 className="mt-2 text-mbg-black/96">14.2: “UNCLAIMED” returns</H3>
      <p>
        After receipt and acceptance, Milos BG contacts the Customer for
        reshipment (postage at Customer’s expense) if available, or refund.
        Possible refund without reshipment in repeated cases.
      </p>
      <H3 className="mt-2 text-mbg-black/96">14.3: “REFUSED” returns</H3>
      <p>
        In case of refusal on delivery, a store credit is issued within 72 hours
        after receipt. Cancellation and refund on request. Reservation of items
        is not guaranteed; refund if unavailable.
      </p>
    </Section>

    {/* 15 */}
    <Section
      id="responsabilite"
      forceOpen={allOpen ?? undefined}
      title="15. Liability"
    >
      <p>
        Milos BG has a duty of care regarding access, browsing, ordering and
        delivery. It cannot be held liable for inconveniences/damages inherent
        to the Internet (disruptions, intrusions, viruses). Milos BG is
        responsible for proper performance of the contract, except in force
        majeure, acts of the Customer or third party. Customers benefit from
        brand warranties featured on the Website. Milos BG is not responsible
        for third‑party website content. Unless otherwise provided, liability is
        limited to direct, personal and certain damage. Milos BG is fully liable
        in the event of death or personal injury due to its negligence.
      </p>
    </Section>

    {/* 16 */}
    <Section
      id="propriete-intellectuelle"
      forceOpen={allOpen ?? undefined}
      title="16. Intellectual property"
    >
      <p>
        All elements of the Milos BG site (visuals, sounds, underlying
        technologies) are protected (copyrights, trademarks, databases, patents)
        and are the property of Milos BG or its partners. Any
        reproduction/representation/translation/adaptation/transformation and/or
        exploitation without prior consent constitutes an infringement subject
        to legal action. Framing, deep‑linking, in‑line linking or deep links
        are prohibited. Any link, even tacitly authorized, must be removed upon
        simple request from Milos BG.
      </p>
    </Section>

    {/* 17 */}
    <Section
      id="donnees-a-caractere-personnel"
      forceOpen={allOpen ?? undefined}
      title="17. Personal data"
    >
      <p>
        Milos BG collects certain personal data concerning Customers and Users
        under the conditions defined in our Privacy Policy and Cookie Policy.
      </p>
    </Section>

    {/* 18 */}
    <Section
      id="produits-personnalises"
      forceOpen={allOpen ?? undefined}
      title="18. Customized products"
    >
      <p>
        For customized Products (text/logo), no exchange or claim is accepted
        and no right of withdrawal can be exercised. Minor differences in
        rendering may occur. The Customer declares they have the necessary
        rights and permissions.
      </p>
      <p>
        The Customer warrants that the elements provided do not infringe
        third‑party rights and bears all consequences (including financial) of
        any breach. They undertake to intervene in any proceedings brought
        against Milos BG and to bear the costs/awards, including attorney’s
        fees.
      </p>
    </Section>

    {/* 19 */}
    <Section
      id="litiges-et-mediateur"
      forceOpen={allOpen ?? undefined}
      title="19. Disputes & consumer mediator"
    >
      <H3 className="text-mbg-black/96">19.1. Contact Customer Service</H3>
      <ul className="list-disc space-y-1 pl-6">
        <li>
          {" "}
          Phone (standard rate) Monday–Friday, 9am–12pm and 2pm–5pm:{" "}
          <a className="mbg-link" href="tel:+33783150791">
            07 83 15 07 91
          </a>
        </li>
        <li>
          {" "}
          Email :{" "}
          <Link className="mbg-link" href={"mailto:contact@milos-bg.com"}>
            contact@milos-bg.com
          </Link>
        </li>
      </ul>
      <H3 className="mt-2 text-mbg-black/96">19.2. Consumer mediator</H3>
      <p>
        Milos BG is a member of the FEVAD Consumer Mediator Service. After prior
        written contact with Milos BG, the Mediator may be referred any
        unresolved consumer dispute. Details:{" "}
        <a
          className="mbg-link"
          href="https://www.fevad.com"
          target="_blank"
          rel="noreferrer"
        >
          fevad.com
        </a>
        . EU online dispute resolution platform:{" "}
        <a
          className="mbg-link"
          href="https://ec.europa.eu/consumers/odr/main/index.cfm?event=main.complaints.screeningphase"
          target="_blank"
          rel="noreferrer"
        >
          ec.europa.eu/consumers/odr
        </a>
        .
      </p>
    </Section>

    {/* 20 */}
    <Section
      id="droit-applicable-et-dispositions-generales"
      forceOpen={allOpen ?? undefined}
      title="20. Governing law & general provisions"
    >
      <p>
        The nullity of one clause does not render the others void. Failure to
        enforce a breach does not constitute a waiver. Any dispute must first be
        referred to Milos BG for amicable resolution (Customer Service
        complaint). French law applies. Failing amicable settlement, French
        courts have jurisdiction. Under Article R.631‑3 of the French Consumer
        Code, the consumer may refer the matter to the court of their place of
        residence at the time of the conclusion of the contract or the
        occurrence of the harmful event.
      </p>
    </Section>
  </>
);

// -----------------------------------------------------------------------------
// Page component
// -----------------------------------------------------------------------------
const TermsAndConditions: React.FC = () => {
  const [lang, setLang] = useLang();

  // Global expand/collapse control
  const [allOpen, setAllOpen] = useState<boolean | null>(null);

  // Back-to-top visibility & active section
  const [showTop, setShowTop] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 400);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // IntersectionObserver for active TOC highlighting
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if ((visible?.target as HTMLElement)?.id)
          setActiveId((visible!.target as HTMLElement).id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0.2, 0.5, 0.75] }
    );
    IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  // Sync expand state with URL param
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const open = params.get("open");
    if (open === "all") setAllOpen(true);
    if (open === "none") setAllOpen(false);
  }, []);
  useEffect(() => {
    if (allOpen === null) return;
    const params = new URLSearchParams(window.location.search);
    params.set("open", allOpen ? "all" : "none");
    const url = `${window.location.pathname}?${params.toString()}${
      window.location.hash
    }`;
    window.history.replaceState({}, "", url);
  }, [allOpen]);

  const allOpenBool = allOpen === true;

  // Localized texts for UI chrome
  const ui = useMemo(
    () => ({
      breadcrumbHome: lang === "fr" ? "Accueil" : "Home",
      breadcrumbCurrent:
        lang === "fr" ? "Conditions Générales" : "Terms & Conditions",
      backToShop: lang === "fr" ? "← Retour à la boutique" : "← Back to shop",
      expandAll: lang === "fr" ? "Déplier tout" : "Expand all",
      collapseAll: lang === "fr" ? "Replier tout" : "Collapse all",
      ariaExpandAll: lang === "fr" ? "Tout déplier" : "Expand all",
      ariaCollapseAll: lang === "fr" ? "Tout replier" : "Collapse all",
      siteTitle: "Milos BG",
      intro:
        lang === "fr" ? (
          <>
            Les présentes conditions générales régissent l’utilisation du site
            et la passation de commandes sur{" "}
            <a
              href="https://www.milos-bg.com"
              className="mbg-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {" "}
              milos-bg.com
            </a>
            .
          </>
        ) : (
          <>
            These terms govern use of the site and placing orders on{" "}
            <a
              href="https://www.milos-bg.com"
              className="mbg-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              {" "}
              milos-bg.com
            </a>
            .
          </>
        ),
      lastUpdateLabel:
        lang === "fr" ? "Dernière mise à jour :" : "Last update:",
      rights: lang === "fr" ? "Tous droits réservés" : "All rights reserved",
      tocAria: lang === "fr" ? "Fil d'Ariane" : "Breadcrumb",
      summaryLabel: lang === "fr" ? "Sommaire" : "Summary",
    }),
    [lang]
  );

  return (
    <Container className="mt-4">
      {/* Breadcrumb + Back + Language toggle */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 bg-mbg-black/7 px-4 py-2">
        <nav aria-label={ui.tocAria} className="text-[11px] text-mbg-darkgrey">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="text-mbg-green uppercase font-medium">
                {ui.breadcrumbHome}
              </Link>
            </li>
            <li aria-hidden className="text-mbg-black bg-mbg-black">
              |
            </li>
            <li className="font-semibold uppercase text-mbg-black">
              {ui.breadcrumbCurrent}
            </li>
          </ol>
        </nav>
        <div className="flex items-center gap-2">
          {/* Language toggle */}
          <div className="inline-flex overflow-hidden rounded-xs border border-mbg-green">
            <button
              type="button"
              onClick={() => setLang("en")}
              className={`px-3 py-1.5 text-[12px] font-semibold uppercase transition ${
                lang === "en"
                  ? "bg-mbg-black text-mbg-white"
                  : "text-mbg-green hover:bg-mbg-green/10"
              }`}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => setLang("fr")}
              className={`px-3 py-1.5 text-[12px] font-semibold uppercase transition ${
                lang === "fr"
                  ? "bg-mbg-black text-mbg-white"
                  : "text-mbg-green hover:bg-mbg-green/10"
              }`}
              aria-pressed={lang === "fr"}
            >
              FR
            </button>
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

      <H2>{lang === "fr" ? "Conditions Générales" : "Terms & Conditions"}</H2>

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

      {/* Title */}
      <header className="mb-6">
        <H2 className="text-mbg-black tracking-tight m-0">{ui.siteTitle}</H2>
        <p className="mt-2 text-xs">{ui.intro}</p>
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
          {lang === "en" ? (
            <ContentEN allOpen={allOpen} />
          ) : (
            <ContentFR allOpen={allOpen} />
          )}

          <footer className="mt-12 border-t pt-6 text-[10px] text-mbg-green">
            <p>{ui.lastUpdateLabel}&nbsp; 23/09/2025</p>
            <p className="mt-2">
              &copy; {new Date().getFullYear()} Milos BG - {ui.rights}
            </p>
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

export default TermsAndConditions;
