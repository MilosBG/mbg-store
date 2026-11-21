/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import Container from "@/components/mbg-components/Container";
import { GrindUntilAchieve, MBG } from "@/images";
import { createCheckoutOrder } from "@/lib/checkoutClient";
import { isMadeToOrderSize, MAX_ON_REQUEST_QUANTITY } from "@/lib/sizeProduction";
import type { CheckoutLine } from "@/lib/checkoutClient";
import useCart from "@/lib/hooks/useCart";
import { useUser } from "@clerk/nextjs";
import { toast } from "react-hot-toast";
import { ArrowRight, ArrowUpRight, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  extractOrderReference,
  ORDER_PLACED_SESSION_KEY,
  type OrderPlacedSnapshot,
} from "@/lib/orderPlaced";

type CheckoutFormState = {
  email: string;
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
};

type CheckoutFormErrors = Partial<Record<keyof CheckoutFormState, string>>;

type Lang = "en" | "fr";
const LANGUAGE_KEY = "mbg.the-hoop.lang";

const FIELD_LABELS: Record<Lang, Record<keyof CheckoutFormState, string>> = {
  en: {
    email: "Email", firstName: "First name", lastName: "Last name",
    address: "Address", city: "City", postalCode: "Postal code",
    country: "Country", phone: "Phone",
  },
  fr: {
    email: "E-mail", firstName: "Prénom", lastName: "Nom",
    address: "Adresse", city: "Ville", postalCode: "Code postal",
    country: "Pays", phone: "Téléphone",
  },
};

const LOCALES = {
  en: {
    home: "Home", bag: "The Hoop", back: "Continue exploring",
    kicker: "Milos BG / The Hoop", heroFirst: "THE", heroSecond: "HOOP.",
    heroEyebrow: "THE MOMENT BEFORE THE NEXT CHAPTER",
    heroHeadline: "Every journey begins with a decision.",
    heroBody: "Your chosen pieces are more than outfits. Review your selection, shape the next step, and carry the mentality forward.",
    progress1: "Your selection", progress2: "Your details", progress3: "Your journey continues",
    chapterLabel: "01 / Your selection", yourPieces: "Your chosen outfits",
    items: "outfits", oneItem: "outfit", reviewCaption: "Every piece carries a purpose.",
    emptyBadge: "The story is not over", emptyHeading: "YOUR HOOP IS EMPTY.",
    emptyText: "The next chapter is still unwritten. Discover the collection and choose the piece that will accompany your journey.",
    emptyCTA: "Explore the outfits", each: "Unit price", quantity: "Quantity",
    delete: "Remove item", remove: "Remove", lineTotal: "Line total", color: "Color", size: "Size",
    madeToOrder: "Made to order", productionNote: "Production confirmation required for this size.",
    outOfStock: "Out of stock", onlyLeft: "Only {count} available for this selection.",
    stockWarning: "Some quantities exceed the available stock. Adjust your selection before ordering.",
    recap: "02 / The final details", summary: "Your order", priceSummary: "Order summary",
    subtotal: "Subtotal", shipping: "Delivery", standardShipping: "Standard delivery — included",
    expressShipping: "Express delivery — €10", total: "Total",
    vatNote: "VAT not applicable — Article 293 B of the French Tax Code.",
    nextStep: "Your destination", contactSection: "Contact details", deliverySection: "Delivery address",
    requiredNote: "Required fields", termsPrefix: "I have read and agree to the", termsLink: "Terms & Conditions",
    marketing1: "I would like to receive Milos BG news, new releases and", marketing2: "marketing emails",
    marketing3: ". I can unsubscribe at any time.", marketingNote: "Optional. This choice never affects your order.",
    confirm: "Place your order", processing: "Submitting your order…", checkoutCaption: "Review your details before placing your order.",
    success: "Order placed successfully.", stockToast: "Some items exceed the available stock.",
    signInToast: "Please sign in to place your order.", emptyToast: "Your hoop is empty.",
    termsError: "Please accept the Terms & Conditions to continue.", required: "is required.",
    invalidEmail: "Please enter a valid email address.", unknownError: "Unable to create your order. Please try again.",
    footerKicker: "GRIND UNTIL ACHIEVE", footerTitle: "THE NEXT CHAPTER IS YOURS.",
    footerText: "It is not only about what you wear. It is about what you choose to carry forward.",
    safe: "Review everything before confirming your order", countSuffix: "pieces selected",
  },
  fr: {
    home: "Accueil", bag: "The Hoop", back: "Continuer l'exploration",
    kicker: "Milos BG / The Hoop", heroFirst: "THE", heroSecond: "HOOP.",
    heroEyebrow: "L'INSTANT AVANT LE PROCHAIN CHAPITRE",
    heroHeadline: "Toute aventure commence par une décision.",
    heroBody: "Les pièces que vous avez choisies sont bien plus que des vêtements. Vérifiez votre sélection, préparez la suite et emportez cette mentalité avec vous.",
    progress1: "Votre sélection", progress2: "Vos coordonnées", progress3: "L'aventure continue",
    chapterLabel: "01 / Votre sélection", yourPieces: "Vos tenues choisies",
    items: "tenues", oneItem: "tenue", reviewCaption: "Chaque pièce porte une intention.",
    emptyBadge: "L'histoire n'est pas terminée", emptyHeading: "VOTRE HOOP EST VIDE.",
    emptyText: "Le prochain chapitre reste à écrire. Découvrez les collections et choisissez la pièce qui accompagnera votre parcours.",
    emptyCTA: "Découvrir les tenues", each: "Prix unitaire", quantity: "Quantité",
    delete: "Supprimer l'article", remove: "Supprimer", lineTotal: "Montant", color: "Couleur", size: "Taille",
    madeToOrder: "Sur commande", productionNote: "Confirmation de production nécessaire pour cette taille.",
    outOfStock: "Rupture de stock", onlyLeft: "Seulement {count} disponible(s) pour cette sélection.",
    stockWarning: "Certaines quantités dépassent le stock disponible. Ajustez votre sélection avant de commander.",
    recap: "02 / Les derniers détails", summary: "Votre commande", priceSummary: "Récapitulatif",
    subtotal: "Sous-total", shipping: "Livraison", standardShipping: "Livraison standard — offerte",
    expressShipping: "Livraison express — 10 €", total: "Total",
    vatNote: "TVA non applicable, article 293 B du CGI.",
    nextStep: "Votre destination", contactSection: "Coordonnées", deliverySection: "Adresse de livraison",
    requiredNote: "Champs obligatoires", termsPrefix: "J'ai lu et j'accepte les", termsLink: "Conditions générales de vente",
    marketing1: "Je souhaite recevoir les actualités de Milos BG, les nouveautés et les", marketing2: "e-mails marketing",
    marketing3: ". Je peux me désinscrire à tout moment.", marketingNote: "Facultatif. Ce choix n'affecte jamais votre commande.",
    confirm: "Confirmer la commande", processing: "Envoi de la commande…", checkoutCaption: "Vérifiez vos informations avant de confirmer votre commande.",
    success: "Commande enregistrée avec succès.", stockToast: "Certaines quantités dépassent le stock disponible.",
    signInToast: "Connectez-vous pour passer commande.", emptyToast: "Votre panier est vide.",
    termsError: "Veuillez accepter les conditions générales de vente pour continuer.", required: "est obligatoire.",
    invalidEmail: "Veuillez saisir une adresse e-mail valide.", unknownError: "Impossible de créer la commande. Veuillez réessayer.",
    footerKicker: "GRIND UNTIL ACHIEVE", footerTitle: "LE PROCHAIN CHAPITRE VOUS APPARTIENT.",
    footerText: "Ce n'est pas uniquement ce que vous portez. C'est ce que vous choisissez d'emporter avec vous.",
    safe: "Vérifiez toutes les informations avant de confirmer", countSuffix: "pièces sélectionnées",
  },
} as const;

const Cart = () => {
  const router = useRouter();
  const [lang, setLang] = useState<Lang>("en");
  const [langReady, setLangReady] = useState(false);
  const t = LOCALES[lang];
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-IE", {
      style: "currency", currency: "EUR",
    }).format(amount);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("lang");
    const saved = window.localStorage.getItem(LANGUAGE_KEY);
    const selected = fromUrl === "en" || fromUrl === "fr"
      ? fromUrl
      : saved === "en" || saved === "fr" ? saved : "en";
    setLang(selected);
    setLangReady(true);
  }, []);

  useEffect(() => {
    if (!langReady) return;
    const url = new URL(window.location.href);
    url.searchParams.set("lang", lang);
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
    window.localStorage.setItem(LANGUAGE_KEY, lang);
  }, [lang, langReady]);
  const { user } = useUser();
  const cart = useCart();
  const clearCart = cart.clearCart;

  const [shippingOption, setShippingOption] = useState<"FREE" | "EXPRESS">(
    "FREE",
  );

  // Checkout form state
  const [formData, setFormData] = useState<CheckoutFormState>({
    email: "",
    firstName: "",
    lastName: "",
    address: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });
  const [formErrors, setFormErrors] = useState<CheckoutFormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  // T&C agreement state
  const [agreeTC, setAgreeTC] = useState(false);
  const [tcError, setTcError] = useState<string | null>(null);

  // Optional marketing consent.
  // Kept separate from the mandatory T&C consent: the customer can order
  // without agreeing to receive marketing communications.
  const [marketingOptIn, setMarketingOptIn] = useState(false);

  const primaryEmail = user?.emailAddresses?.[0]?.emailAddress ?? "";
  const defaultFirstName = user?.firstName ?? "";
  const defaultLastName = user?.lastName ?? "";
  const defaultPhone =
    user?.primaryPhoneNumber?.phoneNumber ??
    user?.phoneNumbers?.[0]?.phoneNumber ??
    "";

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      email: prev.email || primaryEmail,
      firstName: prev.firstName || defaultFirstName,
      lastName: prev.lastName || defaultLastName,
      phone: prev.phone || defaultPhone,
    }));
  }, [primaryEmail, defaultFirstName, defaultLastName, defaultPhone]);

  const subtotal = cart.cartItems.reduce(
    (acc, cartItem) => acc + cartItem.item.price * cartItem.quantity,
    0,
  );
  const subtotalRounded = Number(subtotal.toFixed(2));
  const shippingFee = shippingOption === "EXPRESS" ? 10 : 0;
  const finalTotal = Number((subtotal + shippingFee).toFixed(2));
  // Variant-aware stock check per line
  const lineStock = (ci: { item: any; color?: string; size?: string }) => {
    if (isMadeToOrderSize(ci.item, ci.size)) return MAX_ON_REQUEST_QUANTITY;
    const vars = ci?.item?.variants ?? [];
    if (Array.isArray(vars) && vars.length > 0) {
      const match = vars.find(
        (v: any) =>
          (v.color ?? "") === (ci.color ?? "") &&
          (v.size ?? "") === (ci.size ?? ""),
      );
      return Number(match?.stock ?? 0);
    }
    return Number(ci?.item?.countInStock ?? 0);
  };
  const stockIssues = cart.cartItems.some((ci) => lineStock(ci) < ci.quantity);
  const checkoutLines = useMemo<CheckoutLine[]>(() => {
    return cart.cartItems
      .map((cartItem) => ({
        productId: cartItem.item?._id ?? "",
        quantity: Number(cartItem.quantity ?? 0),
        unitPrice: Number(cartItem.item?.price ?? 0),
        color: cartItem.color ?? null,
        size: cartItem.size ?? null,
        title: cartItem.item?.title ?? null,
        image: cartItem.item?.media?.[0] ?? null,
      }))
      .filter((line) => line.productId && line.quantity > 0);
  }, [cart.cartItems]);

  const checkoutCustomer = useMemo(
    () => ({
      clerkId: user?.id ?? "",
      email: user?.emailAddresses?.[0]?.emailAddress ?? null,
      name: user?.fullName ?? null,
    }),
    [user],
  );

  const ensureCheckoutReady = useCallback(() => {
    if (!agreeTC) {
      setTcError(t.termsError);
      return false;
    }
    setTcError(null);

    if (stockIssues) {
      toast.error(t.stockToast);
      return false;
    }

    if (!user) {
      toast.error(t.signInToast);
      router.push("/sign-in");
      return false;
    }

    if (checkoutLines.length === 0) {
      toast.error(t.emptyToast);
      return false;
    }

    return true;
  }, [agreeTC, checkoutLines, router, stockIssues, user, t]);

  const inputClass = useCallback(
    (field: keyof CheckoutFormState) =>
      [
        "w-full min-h-11 rounded-sm border bg-mbg-white/[0.04] px-3.5 py-3 text-[13px] text-mbg-white placeholder:text-mbg-white/30 outline-none transition-[background-color,border-color,box-shadow] duration-200 focus:bg-mbg-white/[0.07] focus:ring-1",
        formErrors[field]
          ? "border-red-400/90 focus:ring-red-400"
          : "border-mbg-white/20 focus:border-mbg-green focus:ring-mbg-green",
      ].join(" "),
    [formErrors],
  );

  const handleFieldChange = useCallback(
    (field: keyof CheckoutFormState, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      setFormErrors((prev) => {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      });
    },
    [],
  );

  const validateForm = useCallback((): CheckoutFormErrors => {
    const errors: CheckoutFormErrors = {};
    const trimmedEmail = formData.email.trim();
    if (!trimmedEmail) {
      errors.email = `${FIELD_LABELS[lang].email} ${t.required}`;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = t.invalidEmail;
    }

    (
      [
        "firstName",
        "lastName",
        "address",
        "city",
        "postalCode",
        "country",
        "phone",
      ] as Array<keyof CheckoutFormState>
    ).forEach((field) => {
      const value = formData[field].trim();
      if (!value) {
        errors[field] = `${FIELD_LABELS[lang][field]} ${t.required}`;
      }
    });

    return errors;
  }, [formData, lang, t]);

  const handleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!ensureCheckoutReady()) {
        return;
      }

      const validationErrors = validateForm();

      if (Object.keys(validationErrors).length > 0) {
        setFormErrors(validationErrors);
        return;
      }

      setIsSubmitting(true);

      try {
        const result = await createCheckoutOrder({
          lines: checkoutLines,

          shippingOption,

          customer: checkoutCustomer,

          contact: {
            email: formData.email.trim(),
            phone: formData.phone.trim() ? formData.phone.trim() : null,
          },

          shippingAddress: {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            postalCode: formData.postalCode.trim(),
            country: formData.country.trim(),
            phone: formData.phone.trim() ? formData.phone.trim() : null,
          },
        });

        // Marketing consent must never block the order.
        // When checked, this endpoint also re-subscribes an address that had
        // previously used the marketing unsubscribe flow.
        if (marketingOptIn) {
          try {
            const marketingResponse = await fetch("/api/marketing/subscribe", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                email: formData.email.trim(),
                firstName: formData.firstName.trim(),
                consent: true,
                company: "",
              }),
            });

            if (!marketingResponse.ok) {
              const marketingPayload = await marketingResponse
                .json()
                .catch(() => null);

              console.warn(
                "[checkout] Unable to save marketing consent",
                marketingPayload,
              );
            }
          } catch (error) {
            console.warn(
              "[checkout] Unable to reach marketing subscription endpoint",
              error,
            );
          }
        }

        const orderReference = extractOrderReference(result);

        const snapshot: OrderPlacedSnapshot = {
          orderReference,

          createdAt: new Date().toISOString(),

          contact: {
            email: formData.email.trim(),
            phone: formData.phone.trim() ? formData.phone.trim() : null,
          },

          shippingAddress: {
            firstName: formData.firstName.trim(),
            lastName: formData.lastName.trim(),
            address: formData.address.trim(),
            city: formData.city.trim(),
            postalCode: formData.postalCode.trim(),
            country: formData.country.trim(),
            phone: formData.phone.trim() ? formData.phone.trim() : null,
          },

          shippingOption,

          items: checkoutLines.map((line) => ({
            productId: line.productId,

            title: line.title ?? "Milos BG Product",

            image: line.image ?? null,

            color: line.color ?? null,

            size: line.size ?? null,
            productionType: (() => {
              const selected = cart.cartItems.find((item) => item.item._id === line.productId && item.size === line.size && item.color === line.color);
              return selected && isMadeToOrderSize(selected.item, line.size) ? "ON_REQUEST" : "STANDARD";
            })(),

            quantity: line.quantity,

            unitPrice: Number(line.unitPrice),

            lineTotal: Number(
              (Number(line.unitPrice) * Number(line.quantity)).toFixed(2),
            ),
          })),

          subtotal: subtotalRounded,

          shippingFee,

          total: finalTotal,

          currency: "EUR",
        };

        /*
         * On sauvegarde le bon de commande AVANT
         * de vider le panier.
         *
         * sessionStorage est volontairement utilisé :
         * les données disparaissent à la fermeture de l'onglet.
         */
        if (typeof window !== "undefined") {
          try {
            window.sessionStorage.setItem(
              ORDER_PLACED_SESSION_KEY,
              JSON.stringify(snapshot),
            );
          } catch (error) {
            console.warn(
              "[checkout] Unable to save order placed snapshot",
              error,
            );
          }
        }

        setFormErrors({});

        /*
         * La commande existe maintenant côté serveur.
         * On peut donc vider le panier.
         */
        clearCart();

        toast.success(t.success);

        /*
         * replace() plutôt que push():
         * un retour arrière évite de retomber directement
         * sur l'étape de validation de commande.
         */
        if (orderReference) {
          router.replace(
            `/order_placed?order=${encodeURIComponent(orderReference)}`,
          );
        } else {
          router.replace("/order_placed");
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : t.unknownError;

        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      checkoutCustomer,
      checkoutLines,
      clearCart,
      ensureCheckoutReady,
      finalTotal,
      formData,
      marketingOptIn,
      router,
      shippingFee,
      shippingOption,
      subtotalRounded,
      validateForm,
      t,
    ],
  );

  // Keep checkout fields, stock rules and order payload unchanged.
  const field = (name: keyof CheckoutFormState, autoComplete: string, inputType = "text") => (
    <div className="min-w-0 space-y-1.5" key={name}>
      <label htmlFor={`hoop-${name}`} className="block text-[10px] font-bold uppercase tracking-[0.11em] text-mbg-white/75">
        {FIELD_LABELS[lang][name]} <span aria-hidden="true" className="text-mbg-green">*</span>
      </label>
      <input
        id={`hoop-${name}`}
        name={name}
        type={inputType}
        autoComplete={autoComplete}
        inputMode={name === "email" ? "email" : name === "phone" ? "tel" : undefined}
        value={formData[name]}
        placeholder={name === "email" ? "you@example.com" : undefined}
        aria-required="true"
        aria-invalid={Boolean(formErrors[name])}
        aria-describedby={formErrors[name] ? `hoop-${name}-error` : undefined}
        onChange={(event) => handleFieldChange(name, event.target.value)}
        className={inputClass(name)}
      />
      {formErrors[name] && (
        <p id={`hoop-${name}-error`} role="alert" className="text-[11px] text-red-300">{formErrors[name]}</p>
      )}
    </div>
  );

  const totalUnits = cart.cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div lang={lang} className="min-h-screen bg-mbg-black font-kanit text-mbg-white selection:bg-mbg-green selection:text-mbg-white">
      <Container className="pb-16 pt-4 sm:pt-6 lg:pb-24">
        {/* BREADCRUMB + LANGUAGE */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border border-mbg-white/10 bg-mbg-darkgrey/15 px-4 py-3 sm:px-5">
          <nav aria-label={lang === "fr" ? "Fil d'Ariane" : "Breadcrumb"} className="text-[10px] font-semibold uppercase tracking-[0.1em] sm:text-[11px]">
            <ol className="flex items-center gap-2">
              <li><Link href={`/?lang=${lang}`} className="text-mbg-white/50 transition-colors hover:text-mbg-green">{t.home}</Link></li>
              <li aria-hidden="true" className="text-mbg-green">/</li>
              <li className="text-mbg-white">{t.bag}</li>
            </ol>
          </nav>
          <div className="flex items-center gap-3">
            <div role="group" aria-label={lang === "fr" ? "Langue de la page" : "Page language"} className="flex border border-mbg-white/15 bg-mbg-black p-0.5">
              {(["en", "fr"] as const).map((language) => (
                <button
                  key={language}
                  type="button"
                  aria-pressed={lang === language}
                  onClick={() => setLang(language)}
                  className={`min-h-9 min-w-10 px-3 text-[11px] font-black uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mbg-green ${lang === language ? "bg-mbg-green text-mbg-white" : "text-mbg-white/60 hover:bg-mbg-white/10 hover:text-mbg-white"}`}
                >{language.toUpperCase()}</button>
              ))}
            </div>
            <Link href={`/products?lang=${lang}`} className="hidden items-center gap-2 text-[10px] font-bold uppercase tracking-[0.08em] text-mbg-white/65 transition-colors hover:text-mbg-green sm:inline-flex">
              {t.back}<ArrowUpRight aria-hidden="true" size={14}/>
            </Link>
          </div>
        </div>

        {/* HERO — THE FINAL SHOT */}
        <header className="relative isolate overflow-hidden border border-mbg-white/10 bg-mbg-darkgrey/20 px-5 pb-10 pt-9 sm:px-9 sm:pb-12 sm:pt-11 lg:px-12 lg:py-14">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_90%_16%,rgba(0,130,26,0.20),transparent_52%)]" />
          <div aria-hidden="true" className="hoop-orbit pointer-events-none absolute -right-28 -top-40 size-[340px] rounded-full border border-mbg-white/10 sm:-right-24 sm:-top-60 sm:size-[510px]" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-44 top-24 size-[350px] rounded-full border border-mbg-green/15 sm:right-[-160px] sm:top-4 sm:size-[560px]" />
          <Image src={MBG} alt="" aria-hidden="true" className="pointer-events-none absolute -right-7 bottom-0 h-auto w-[170px] object-contain opacity-[0.055] sm:right-8 sm:w-[255px] lg:w-[320px]" />
          <div className="hoop-reveal relative z-10 max-w-3xl">
            <p className="mb-5 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.22em] text-mbg-white/65">
              <span aria-hidden="true" className="h-[3px] w-8 bg-mbg-green"/>{t.kicker}
            </p>
            <h1 className="text-[clamp(3.3rem,9.5vw,7.2rem)] font-black uppercase leading-[0.84] tracking-[-0.07em]">
              <span className="block text-mbg-white">{t.heroFirst}</span>
              <span className="block text-mbg-green">{t.heroSecond}</span>
            </h1>
            <div className="mt-7 h-px max-w-[460px] bg-gradient-to-r from-mbg-green via-mbg-white/20 to-transparent"/>
            <p className="mt-6 text-[10px] font-extrabold uppercase tracking-[0.18em] text-mbg-green sm:text-xs">{t.heroEyebrow}</p>
            <h2 className="mt-3 max-w-xl text-lg font-bold leading-snug text-mbg-white sm:text-2xl">{t.heroHeadline}</h2>
            <p className="mt-3 max-w-xl text-[12px] leading-6 text-mbg-white/65 sm:text-sm sm:leading-7">{t.heroBody}</p>
          </div>
          <div aria-hidden="true" className="absolute bottom-0 left-0 h-[3px] w-[22%] bg-mbg-green"/>
        </header>

        {/* THE THREE STAGES — INFORMATIVE, NOT A PAYMENT PROGRESS INDICATOR */}
        <div className="grid grid-cols-3 border-x border-b border-mbg-white/10 bg-mbg-white/[0.025]">
          {[t.progress1, t.progress2, t.progress3].map((label, index) => (
            <div key={index} className={`flex min-w-0 items-center gap-2 border-r border-mbg-white/10 px-2 py-4 last:border-r-0 sm:gap-3 sm:px-5 ${index === 0 ? "bg-mbg-green/[0.08]" : ""}`}>
              <span className={`flex size-7 shrink-0 items-center justify-center border text-[10px] font-black sm:size-8 ${index === 0 ? "border-mbg-green bg-mbg-green text-mbg-white" : "border-mbg-white/20 text-mbg-white/50"}`}>{`0${index + 1}`}</span>
              <span className="text-[9px] font-bold uppercase leading-4 tracking-[0.04em] text-mbg-white/75 sm:text-[11px]">{label}</span>
            </div>
          ))}
        </div>

        <div className="mt-9 grid min-w-0 gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(310px,0.78fr)] lg:items-start lg:gap-9">
          {/* THE SELECTED PIECES */}
          <section aria-labelledby="hoop-selection-title" className="min-w-0">
            <div className="mb-5 flex flex-wrap items-end justify-between gap-3 border-b border-mbg-white/10 pb-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mbg-green">{t.chapterLabel}</p>
                <h2 id="hoop-selection-title" className="mt-1 text-xl font-black uppercase tracking-[-0.03em] text-mbg-white sm:text-2xl">{t.yourPieces}</h2>
                <p className="mt-1 text-xs text-mbg-white/50">{t.reviewCaption}</p>
              </div>
              <span className="border border-mbg-white/15 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.08em] text-mbg-white/70">
                {totalUnits} {totalUnits === 1 ? t.oneItem : t.items}
              </span>
            </div>

            {cart.cartItems.length === 0 ? (
              <div className="relative overflow-hidden border border-mbg-white/10 bg-mbg-darkgrey/15 px-6 py-11 text-center sm:px-10 sm:py-14">
                <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[-140px] size-[300px] -translate-x-1/2 rounded-full border border-mbg-green/10"/>
                <div className="relative mx-auto flex size-14 items-center justify-center">    <Image
                  src={GrindUntilAchieve}
                  alt="GRIND UNTIL ACHIEVE"
                  width={38}
                  height={38}
                  className="mb-5 size-9 object-contain transition-transform duration-500 motion-safe:hover:scale-110"
                /></div>
                <p className="mt-6 text-[10px] font-bold uppercase tracking-[0.18em] text-mbg-green">{t.emptyBadge}</p>
                <h3 className="mt-3 text-2xl font-black uppercase tracking-[-0.04em] sm:text-3xl">{t.emptyHeading}</h3>
                <p className="mx-auto mt-4 max-w-md text-[13px] leading-7 text-mbg-white/65">{t.emptyText}</p>
                <Link href={`/products?lang=${lang}`} className="group mt-7 inline-flex min-h-11 items-center justify-center gap-3 border border-mbg-green bg-mbg-green px-5 py-3 text-[11px] font-bold uppercase tracking-[0.09em] text-mbg-white transition-colors hover:border-mbg-white hover:bg-mbg-white hover:text-mbg-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mbg-green">
                  {t.emptyCTA}<ArrowRight className="transition-transform group-hover:translate-x-1" size={16}/>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.cartItems.map((cartItem, index) => {
                  const { _id, title, media, price } = cartItem.item;
                  const key = `${_id}-${cartItem.color ?? ""}-${cartItem.size ?? ""}`;
                  const stock = lineStock(cartItem);
                  const madeToOrder = isMadeToOrderSize(cartItem.item, cartItem.size);
                  const canIncrease = cartItem.quantity < stock;
                  return (
                    <article key={key} className="group relative overflow-hidden border border-mbg-white/10 bg-mbg-white/[0.035] p-3 transition-[border-color,background-color] duration-300 hover:border-mbg-green/40 hover:bg-mbg-white/[0.055] sm:p-5">
                      <div aria-hidden="true" className="absolute left-0 top-0 h-full w-[2px] bg-mbg-green/60"/>
                      <div className="grid min-w-0 grid-cols-[85px_minmax(0,1fr)] gap-4 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-5">
                        <div className="relative aspect-square overflow-hidden border border-mbg-white/10 bg-mbg-black">
                          <Image src={media?.[0] ?? "/placeholder.png"} alt={title ?? "Milos BG"} fill sizes="(max-width:640px) 85px,112px" className="object-contain p-2 transition-transform duration-500 motion-safe:group-hover:scale-105" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[9px] font-black uppercase tracking-[0.17em] text-mbg-green">{String(index + 1).padStart(2,"0")} / MILOS BG</p>
                              <Link href={`/products/${_id}?lang=${lang}`} className="mt-1 block break-words text-[13px] font-extrabold uppercase leading-5 text-mbg-white transition-colors hover:text-mbg-green sm:text-base">{title}</Link>
                            </div>
                            <button type="button" onClick={() => cart.removeItem(_id, cartItem.color, cartItem.size)} aria-label={`${t.delete} : ${title}`} className="flex size-9 shrink-0 items-center justify-center border border-mbg-white/15 text-mbg-white/60 transition-colors hover:border-red-400/60 hover:text-red-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mbg-green"><Trash2 aria-hidden="true" size={16}/></button>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.05em] text-mbg-white/55">
                            {cartItem.color && <span>{t.color}: <b className="text-mbg-white/80">{cartItem.color}</b></span>}
                            {cartItem.size && <span>{t.size}: <b className="text-mbg-white/80">{cartItem.size}</b></span>}
                          </div>
                          <p className="mt-2 text-xs font-bold text-mbg-white/80">{formatMoney(Number(price))}</p>
                          {madeToOrder && <p className="mt-2 text-[10px] leading-5 text-mbg-green"><span className="font-black uppercase">{t.madeToOrder}</span> · {t.productionNote}</p>}
                        </div>
                      </div>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-mbg-white/10 pt-4">
                        <div>
                          <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.12em] text-mbg-white/45">{t.quantity}</p>
                          <div className="inline-flex items-center border border-mbg-white/15 bg-mbg-black">
                            <button type="button" onClick={() => cart.decreaseQuantity(_id, cartItem.color, cartItem.size)} aria-label={`${t.quantity} − ${title}`} disabled={cartItem.quantity <= 1} className="flex size-9 items-center justify-center text-mbg-white transition-colors hover:bg-mbg-green disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mbg-green"><Minus size={14}/></button>
                            <span aria-live="polite" className="min-w-10 px-2 text-center text-xs font-black tabular-nums text-mbg-white">{cartItem.quantity}</span>
                            <button type="button" onClick={() => cart.increaseQuantity(_id, cartItem.color, cartItem.size)} aria-label={`${t.quantity} + ${title}`} disabled={!canIncrease} className="flex size-9 items-center justify-center text-mbg-white transition-colors hover:bg-mbg-green disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mbg-green"><Plus size={14}/></button>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-mbg-white/45">{t.lineTotal}</p>
                          <p className="mt-1 text-lg font-black tabular-nums text-mbg-green">{formatMoney(Number(price) * cartItem.quantity)}</p>
                        </div>
                      </div>
                      {stock <= 0 && <p role="alert" className="mt-3 text-[11px] text-red-300">{t.outOfStock}</p>}
                      {stock > 0 && cartItem.quantity > stock && <p role="alert" className="mt-3 text-[11px] text-red-300">{t.onlyLeft.replace("{count}", String(stock))}</p>}
                    </article>
                  );
                })}
                {stockIssues && <p role="alert" className="border border-red-400/30 bg-red-400/10 p-3 text-xs leading-5 text-red-200">{t.stockWarning}</p>}
                <Link href={`/products?lang=${lang}`} className="inline-flex min-h-11 items-center gap-2 py-2 text-[11px] font-bold uppercase tracking-[0.1em] text-mbg-green transition-colors hover:text-mbg-white">{t.back}<ArrowUpRight aria-hidden="true" size={15}/></Link>
              </div>
            )}
          </section>

          {/* CHECKOUT — KEEP ORIGINAL SERVER PAYLOAD / CONSENTS / STOCK GUARDS */}
          <aside className="min-w-0 lg:sticky lg:top-5" aria-labelledby="hoop-summary-title">
            <div className="border border-mbg-white/15 bg-mbg-darkgrey/20">
              <div className="relative overflow-hidden border-b border-mbg-white/10 bg-mbg-white/[0.025] px-5 py-5 sm:px-6">
                <div aria-hidden="true" className="absolute right-0 top-0 h-1 w-20 bg-mbg-green"/>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-mbg-green">{t.recap}</p>
                <h2 id="hoop-summary-title" className="mt-2 text-xl font-black uppercase tracking-[-0.02em]">{t.summary}</h2>
                <p className="mt-1 text-xs text-mbg-white/50">{t.checkoutCaption}</p>
              </div>
              <div className="space-y-4 px-5 py-6 sm:px-6">
                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="font-semibold uppercase tracking-[0.08em] text-mbg-white/55">{t.subtotal}</span>
                  <span className="font-bold tabular-nums text-mbg-white">{formatMoney(subtotalRounded)}</span>
                </div>
                <div className="space-y-2">
                  <label htmlFor="hoop-shipping" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-mbg-white/65"><Truck aria-hidden="true" size={15} className="text-mbg-green"/>{t.shipping}</label>
                  <select id="hoop-shipping" value={shippingOption} onChange={(event) => setShippingOption(event.target.value as "FREE" | "EXPRESS")} className="min-h-11 w-full border border-mbg-white/20 bg-mbg-black px-3 py-2 text-xs font-semibold text-mbg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mbg-green">
                    <option value="FREE">{t.standardShipping}</option>
                    <option value="EXPRESS">{t.expressShipping}</option>
                  </select>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs text-mbg-white/60">
                  <span className="font-semibold uppercase tracking-[0.08em]">{t.shipping}</span>
                  <span className="font-bold tabular-nums text-mbg-white">{formatMoney(shippingFee)}</span>
                </div>
                <div className="flex items-end justify-between gap-3 border-t border-mbg-white/15 pt-5">
                  <span className="text-sm font-black uppercase tracking-[0.1em] text-mbg-white">{t.total}</span>
                  <span className="text-2xl font-black tabular-nums tracking-tight text-mbg-green">{formatMoney(finalTotal)}</span>
                </div>
                <p className="text-[10px] leading-5 text-mbg-white/45">{t.vatNote}</p>
              </div>

              {cart.cartItems.length > 0 && (
                <form noValidate onSubmit={handleSubmit} className="space-y-5 border-t border-mbg-white/10 px-5 py-6 sm:px-6">
                  <div>
                    <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-mbg-green"><span aria-hidden="true" className="h-px w-6 bg-mbg-green"/>{t.nextStep}</p>
                    <h3 className="mt-2 text-base font-black uppercase">{t.contactSection}</h3>
                    <div className="mt-4">{field("email", "email", "email")}</div>
                  </div>
                  <div className="border-t border-mbg-white/10 pt-5">
                    <h3 className="text-base font-black uppercase">{t.deliverySection}</h3>
                    <p className="mt-1 text-[10px] text-mbg-white/40">{t.requiredNote}</p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-2">
                      {field("firstName", "given-name")}
                      {field("lastName", "family-name")}
                      <div className="sm:col-span-2">{field("address", "street-address")}</div>
                      {field("city", "address-level2")}
                      {field("postalCode", "postal-code")}
                      {field("country", "country-name")}
                      {field("phone", "tel", "tel")}
                    </div>
                  </div>
                  <div className="space-y-4 border-t border-mbg-white/10 pt-5">
                    <div className="flex items-start gap-3">
                      <input id="agree-tc" type="checkbox" checked={agreeTC} onChange={(event) => { setAgreeTC(event.target.checked); if (event.target.checked) setTcError(null); }} aria-invalid={Boolean(tcError)} aria-describedby={tcError ? "hoop-terms-error" : undefined} className="mt-1 size-4 shrink-0 accent-[#00821A]" />
                      <label htmlFor="agree-tc" className="cursor-pointer text-[11px] leading-5 text-mbg-white/80">
                        {t.termsPrefix}{" "}<Link href={`/terms-conditions?lang=${lang}`} target="_blank" rel="noopener noreferrer" className="font-bold text-mbg-green underline underline-offset-2 hover:text-mbg-white">{t.termsLink}</Link>.
                      </label>
                    </div>
                    {tcError && <p id="hoop-terms-error" role="alert" className="text-[11px] leading-5 text-red-300">{tcError}</p>}
                    <div className="flex items-start gap-3 border-t border-mbg-white/10 pt-4">
                      <input id="marketing-opt-in" type="checkbox" checked={marketingOptIn} onChange={(event) => setMarketingOptIn(event.target.checked)} className="mt-1 size-4 shrink-0 accent-[#00821A]" />
                      <div className="text-[11px] leading-5 text-mbg-white/75">
                        <label htmlFor="marketing-opt-in" className="cursor-pointer">{t.marketing1}{" "}<span className="font-bold text-mbg-green">{t.marketing2}</span>{t.marketing3}</label>
                        <p className="mt-1 text-[10px] leading-4 text-mbg-white/40">{t.marketingNote}</p>
                      </div>
                    </div>
                  </div>
                  <button type="submit" disabled={isSubmitting || stockIssues} className="group flex min-h-12 w-full items-center justify-center gap-3 border border-mbg-green bg-mbg-green px-4 py-3 text-[11px] font-black uppercase tracking-[0.09em] text-mbg-white transition-[background-color,border-color,color] duration-300 hover:border-mbg-white hover:bg-mbg-white hover:text-mbg-black disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mbg-green">
                    {isSubmitting ? t.processing : t.confirm}
                    {!isSubmitting && <ArrowRight size={17} aria-hidden="true" className="transition-transform group-hover:translate-x-1"/>}
                  </button>
                  <p className="flex items-center justify-center gap-2 text-center text-[10px] text-mbg-white/45"><ShieldCheck size={14} aria-hidden="true" className="text-mbg-green"/>{t.safe}</p>
                </form>
              )}
            </div>
          </aside>
        </div>

        {/* THE JOURNEY CONTINUES */}
        <section className="relative mt-10 overflow-hidden border border-mbg-white/10 bg-mbg-darkgrey/15 px-5 py-9 text-center sm:px-8 sm:py-12">
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,130,26,0.10),transparent_65%)]"/>
          <div className="relative mx-auto max-w-2xl">
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-mbg-green">{t.footerKicker}</p>
            <h2 className="mt-4 text-xl font-black uppercase tracking-[-0.03em] text-mbg-white sm:text-3xl">{t.footerTitle}</h2>
            <p className="mx-auto mt-3 max-w-xl text-[12px] leading-6 text-mbg-white/60 sm:text-sm">{t.footerText}</p>
          </div>
          <div aria-hidden="true" className="absolute bottom-0 left-1/2 h-[2px] w-20 -translate-x-1/2 bg-mbg-green"/>
        </section>
      </Container>
      <style jsx global>{`
        @keyframes hoopReveal { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes hoopOrbit { from { transform:rotate(0deg); } to { transform:rotate(360deg); } }
        .hoop-reveal { animation:hoopReveal 700ms cubic-bezier(.22,1,.36,1) both; }
        .hoop-orbit { animation:hoopOrbit 48s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .hoop-reveal,.hoop-orbit { animation:none; } }
      `}</style>
    </div>
  );
};

export default Cart;
