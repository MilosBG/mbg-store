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
    emptyDelivery: "Delivery options will be available once you add an outfit.",
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
    emptyDelivery: "Les options de livraison seront disponibles après l’ajout d’une tenue.",
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
        "w-full min-h-12 rounded-sm border bg-white px-3.5 py-3 text-[13px] text-[#171717] placeholder:text-[#999994] outline-none transition-[background-color,border-color,box-shadow] duration-200 focus:bg-[#fcfdfb] focus:ring-1",
        formErrors[field]
          ? "border-red-400 focus:ring-red-400"
          : "border-[#d5d5cf] focus:border-[#00821A] focus:ring-[#00821A]",
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
      <label htmlFor={`hoop-${name}`} className="block text-[11px] font-bold uppercase tracking-[0.08em] text-[#43433e]">
        {FIELD_LABELS[lang][name]} <span aria-hidden="true" className="text-[#00821A]">*</span>
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
        <p id={`hoop-${name}-error`} role="alert" className="text-[11px] text-red-700">{formErrors[name]}</p>
      )}
    </div>
  );

  const totalUnits = cart.cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <main
      lang={lang}
      className="min-h-screen bg-[#f5f5f2] font-kanit text-[#111111] selection:bg-[#00821A] selection:text-white"
    >
      <Container className="pb-12 pt-4 sm:pb-16 sm:pt-6 lg:pb-20">
        <div className="mx-auto w-full max-w-[1240px]">
          {/* Light navigation, straightforward language selection */}
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#deded9] pb-4">
            <nav aria-label={lang === "fr" ? "Fil d’Ariane" : "Breadcrumb"}>
              <ol className="flex flex-wrap items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.09em]">
                <li>
                  <Link href={`/?lang=${lang}`} className="text-[#646460] transition-colors hover:text-[#00821A]">
                    {t.home}
                  </Link>
                </li>
                <li className="text-[#00821A]" aria-hidden="true">/</li>
                <li aria-current="page" className="text-[#111111]">{t.bag}</li>
              </ol>
            </nav>
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <Link
                href={`/products?lang=${lang}`}
                className="inline-flex min-h-10 items-center gap-2 rounded-sm px-1 text-[11px] font-bold uppercase tracking-[0.07em] text-[#404040] transition-colors hover:text-[#00821A]"
              >
                {t.back}<ArrowUpRight aria-hidden="true" size={14} />
              </Link>
              <div
                role="group"
                aria-label={lang === "fr" ? "Langue de la page" : "Page language"}
                className="flex rounded-sm border border-[#cfcfc9] bg-white p-1"
              >
                {(["en", "fr"] as const).map((language) => (
                  <button
                    key={language}
                    type="button"
                    aria-pressed={lang === language}
                    onClick={() => setLang(language)}
                    className={`min-h-9 min-w-10 rounded-sm px-3 text-[11px] font-black uppercase transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00821A] ${lang === language ? "bg-[#00821A] text-white" : "text-[#555550] hover:bg-[#f1f1ee]"}`}
                  >
                    {language.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Short, editorial introduction: light canvas + restrained dark accent */}
          <header className="relative overflow-hidden border border-[#e0e0dc] bg-white shadow-[0_12px_42px_rgba(0,0,0,0.045)]">
            <div className="pointer-events-none absolute -right-10 -top-20 size-60 rounded-full bg-[#00821A]/[0.045] blur-3xl sm:size-72" aria-hidden="true" />
            <div className="relative grid items-center gap-6 px-5 py-7 sm:px-8 sm:py-9 lg:grid-cols-[minmax(0,1fr)_260px] lg:gap-10 lg:px-10">
              <div className="min-w-0">
                <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.19em] text-[#00821A]">
                  <span className="h-[2px] w-6 bg-[#00821A]" aria-hidden="true" />{t.kicker}
                </p>
                <h1 className="mt-3 text-[clamp(2.4rem,6.6vw,4.6rem)] font-black uppercase leading-[0.91] tracking-[-0.06em]">
                  {t.heroFirst} <span className="text-[#00821A]">{t.heroSecond}</span>
                </h1>
                <p className="mt-4 max-w-xl text-[14px] font-semibold leading-6 text-[#242424] sm:text-[15px]">
                  {t.heroHeadline}
                </p>
                <p className="mt-2 max-w-xl text-[12px] leading-6 text-[#686863] sm:text-[13px]">
                  {t.heroBody}
                </p>
              </div>
              <div className="relative hidden min-h-[148px] items-center justify-center overflow-hidden rounded-sm bg-[#171717] px-5 py-4 text-white lg:flex">
                <div className="pointer-events-none absolute -right-12 -top-16 size-40 rounded-full border border-[#00821A]/30" aria-hidden="true" />
                <div className="pointer-events-none absolute -left-12 -bottom-16 size-40 rounded-full border border-white/10" aria-hidden="true" />
                <div className="relative flex flex-col items-center gap-3 text-center">
                  <Image src={GrindUntilAchieve} alt="" aria-hidden="true" className="h-14 w-14 object-contain opacity-90" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/75">GRIND UNTIL ACHIEVE</span>
                  <span className="h-[2px] w-12 bg-[#00821A]" aria-hidden="true" />
                </div>
              </div>
            </div>
            <nav aria-label={lang === "fr" ? "Accès rapide" : "Quick navigation"} className="flex flex-wrap gap-0 border-t border-[#e9e9e4] bg-[#fbfbfa]">
              <a href="#hoop-selection" className="flex min-h-12 min-w-0 flex-1 items-center gap-3 border-r border-[#e9e9e4] px-4 py-3 transition-colors hover:bg-[#f0f5ef] sm:px-7">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-sm bg-[#00821A] text-[10px] font-black text-white">01</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-[#303030] sm:text-[11px]">{t.progress1}</span>
              </a>
              <a href="#hoop-summary-title" className="flex min-h-12 min-w-0 flex-1 items-center gap-3 px-4 py-3 transition-colors hover:bg-[#f0f5ef] sm:px-7">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-sm border border-[#c9c9c4] bg-white text-[10px] font-black text-[#00821A]">02</span>
                <span className="text-[10px] font-bold uppercase tracking-[0.07em] text-[#303030] sm:text-[11px]">{t.progress2}</span>
              </a>
            </nav>
          </header>

          <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.82fr)] lg:items-start lg:gap-7">
            {/* Cart list */}
            <section id="hoop-selection" aria-labelledby="hoop-selection-title" className="min-w-0 scroll-mt-5">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#00821A]">{t.chapterLabel}</p>
                  <h2 id="hoop-selection-title" className="mt-1 text-xl font-black uppercase tracking-[-0.035em] text-[#151515] sm:text-2xl">{t.yourPieces}</h2>
                  <p className="mt-1 text-[12px] text-[#686863]">{t.reviewCaption}</p>
                </div>
                <span className="inline-flex min-h-9 items-center rounded-sm border border-[#d8d8d3] bg-white px-3 text-[11px] font-bold uppercase tracking-[0.07em] text-[#414141]">
                  {totalUnits} {totalUnits === 1 ? t.oneItem : t.items}
                </span>
              </div>

              {cart.cartItems.length === 0 ? (
                <div className="relative overflow-hidden border border-[#dfdfd9] bg-white px-5 py-10 text-center shadow-[0_8px_24px_rgba(0,0,0,0.025)] sm:px-10 sm:py-12">
                  <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[-135px] size-[260px] -translate-x-1/2 rounded-full border border-[#00821A]/15" />
                  <div className="relative mx-auto flex size-[76px] items-center justify-center rounded-full border border-[#00821A]/15 bg-[#f0f6f0]">
                    <Image src={GrindUntilAchieve} alt="" aria-hidden="true" className="size-12 object-contain" />
                  </div>
                  <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#00821A]">{t.emptyBadge}</p>
                  <h3 className="mt-2 text-[clamp(1.35rem,4vw,2rem)] font-black uppercase leading-tight tracking-[-0.035em] text-[#171717]">{t.emptyHeading}</h3>
                  <p className="mx-auto mt-3 max-w-md text-[13px] leading-6 text-[#64645f]">{t.emptyText}</p>
                  <Link
                    href={`/products?lang=${lang}`}
                    className="group mt-6 inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-sm bg-[#00821A] px-5 py-3 text-[11px] font-black uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#111111] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00821A] sm:w-auto"
                  >
                    {t.emptyCTA}<ArrowRight aria-hidden="true" size={16} className="transition-transform group-hover:translate-x-1" />
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
                      <article key={key} className="group overflow-hidden border border-[#e1e1dc] bg-white p-3 shadow-[0_8px_24px_rgba(0,0,0,0.025)] transition-colors hover:border-[#00821A]/35 sm:p-5">
                        <div className="grid min-w-0 grid-cols-[80px_minmax(0,1fr)] gap-3 sm:grid-cols-[112px_minmax(0,1fr)] sm:gap-5">
                          <div className="relative aspect-[4/5] overflow-hidden rounded-sm bg-[#f3f3f0] sm:aspect-square">
                            <Image src={media?.[0] ?? "/placeholder.png"} alt={title ?? "Milos BG"} fill sizes="(max-width:640px) 80px,112px" className="object-contain p-1.5 transition-transform duration-300 motion-safe:group-hover:scale-105" />
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="min-w-0">
                                <p className="text-[10px] font-black uppercase tracking-[0.13em] text-[#00821A]">{String(index + 1).padStart(2, "0")} / MILOS BG</p>
                                <Link href={`/products/${_id}?lang=${lang}`} className="mt-1 block break-words text-[14px] font-black uppercase leading-5 text-[#171717] transition-colors hover:text-[#00821A] sm:text-[17px] sm:leading-6">{title}</Link>
                              </div>
                              <button type="button" onClick={() => cart.removeItem(_id, cartItem.color, cartItem.size)} aria-label={`${t.delete} : ${title}`} className="flex size-10 shrink-0 items-center justify-center rounded-sm border border-[#e0e0db] bg-white text-[#676762] transition-colors hover:border-red-300 hover:bg-red-50 hover:text-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00821A]">
                                <Trash2 aria-hidden="true" size={16} />
                              </button>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-[#777771] sm:text-[11px]">
                              {cartItem.color && <span>{t.color}: <b className="text-[#242424]">{cartItem.color}</b></span>}
                              {cartItem.size && <span>{t.size}: <b className="text-[#242424]">{cartItem.size}</b></span>}
                            </div>
                            <p className="mt-2 text-sm font-bold tabular-nums text-[#171717]">{formatMoney(Number(price))}</p>
                            {madeToOrder && <p className="mt-2 text-[11px] leading-5 text-[#006f18]"><b className="uppercase">{t.madeToOrder}</b> · {t.productionNote}</p>}
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap items-end justify-between gap-3 border-t border-[#ecece8] pt-3 sm:pt-4">
                          <div>
                            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-[#72726d]">{t.quantity}</p>
                            <div className="inline-flex items-center overflow-hidden rounded-sm border border-[#d9d9d4] bg-[#fafaf8]">
                              <button type="button" onClick={() => cart.decreaseQuantity(_id, cartItem.color, cartItem.size)} aria-label={`${t.quantity} − ${title}`} disabled={cartItem.quantity <= 1} className="flex size-10 items-center justify-center text-[#222222] transition-colors hover:bg-[#e9f3e8] disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00821A]"><Minus size={14} aria-hidden="true" /></button>
                              <span aria-live="polite" className="min-w-10 px-2 text-center text-[13px] font-bold tabular-nums text-[#171717]">{cartItem.quantity}</span>
                              <button type="button" onClick={() => cart.increaseQuantity(_id, cartItem.color, cartItem.size)} aria-label={`${t.quantity} + ${title}`} disabled={!canIncrease} className="flex size-10 items-center justify-center text-[#222222] transition-colors hover:bg-[#e9f3e8] disabled:cursor-not-allowed disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00821A]"><Plus size={14} aria-hidden="true" /></button>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#72726d]">{t.lineTotal}</p>
                            <p className="text-lg font-black tabular-nums text-[#00821A] sm:text-xl">{formatMoney(Number(price) * cartItem.quantity)}</p>
                          </div>
                        </div>
                        {stock <= 0 && <p role="alert" className="mt-3 text-[12px] font-semibold text-red-700">{t.outOfStock}</p>}
                        {stock > 0 && cartItem.quantity > stock && <p role="alert" className="mt-3 text-[12px] font-semibold text-red-700">{t.onlyLeft.replace("{count}", String(stock))}</p>}
                      </article>
                    );
                  })}
                  {stockIssues && <p role="alert" className="border border-red-200 bg-red-50 p-4 text-[12px] leading-5 text-red-800">{t.stockWarning}</p>}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                    <Link href={`/products?lang=${lang}`} className="inline-flex min-h-11 items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#00821A] hover:text-[#111111]">{t.back}<ArrowUpRight aria-hidden="true" size={15} /></Link>
                    <a href="#hoop-summary-title" className="inline-flex min-h-11 items-center gap-2 rounded-sm border border-[#cfcfc9] bg-white px-4 text-[11px] font-bold uppercase tracking-[0.07em] text-[#111111] transition-colors hover:border-[#00821A] hover:text-[#00821A]">{t.summary}<ArrowRight aria-hidden="true" size={15} /></a>
                  </div>
                </div>
              )}
            </section>

            {/* Order summary; original stock guard and checkout request stay unchanged */}
            <aside className="min-w-0" aria-labelledby="hoop-summary-title">
              <div className="overflow-hidden border border-[#dcdcd7] bg-white shadow-[0_10px_36px_rgba(0,0,0,0.045)]">
                <div className="relative border-b border-[#e8e8e3] bg-[#fbfbf9] px-5 py-5 sm:px-6">
                  <div className="absolute right-0 top-0 h-[3px] w-20 bg-[#00821A]" aria-hidden="true" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-[#00821A]">{t.recap}</p>
                  <h2 id="hoop-summary-title" className="mt-1 scroll-mt-6 text-xl font-black uppercase tracking-[-0.025em] text-[#171717] sm:text-2xl">{t.summary}</h2>
                  <p className="mt-1 text-[12px] leading-5 text-[#686862]">{t.checkoutCaption}</p>
                </div>
                <div className="space-y-5 px-5 py-5 sm:px-6 sm:py-6">
                  <div className="flex items-center justify-between gap-4 text-[12px]">
                    <span className="font-semibold text-[#565650]">{t.subtotal}</span>
                    <span className="font-bold tabular-nums text-[#1b1b1b]">{formatMoney(subtotalRounded)}</span>
                  </div>
                  {cart.cartItems.length > 0 ? (
                    <>
                      <div className="space-y-2">
                        <label htmlFor="hoop-shipping" className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.08em] text-[#303030]"><Truck aria-hidden="true" size={16} className="text-[#00821A]" />{t.shipping}</label>
                        <select id="hoop-shipping" value={shippingOption} onChange={(event) => setShippingOption(event.target.value as "FREE" | "EXPRESS")} className="min-h-12 w-full rounded-sm border border-[#d1d1cb] bg-white px-3 py-2 text-[12px] font-semibold text-[#1c1c1c] outline-none transition-colors focus:border-[#00821A] focus:ring-1 focus:ring-[#00821A]">
                          <option value="FREE">{t.standardShipping}</option>
                          <option value="EXPRESS">{t.expressShipping}</option>
                        </select>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-[12px] text-[#63635e]">
                        <span>{t.shipping}</span>
                        <span className="font-bold tabular-nums text-[#2b2b2b]">{formatMoney(shippingFee)}</span>
                      </div>
                    </>
                  ) : (
                    <p className="border-l-2 border-[#00821A] bg-[#f4f7f3] px-3 py-3 text-[12px] leading-5 text-[#55554f]">{t.emptyDelivery}</p>
                  )}
                  <div aria-live="polite" className="flex items-end justify-between gap-4 border-t border-[#e8e8e3] pt-5">
                    <span className="text-[13px] font-black uppercase tracking-[0.07em] text-[#222222]">{t.total}</span>
                    <span className="text-[clamp(1.65rem,5vw,2.1rem)] font-black tabular-nums tracking-[-0.03em] text-[#00821A]">{formatMoney(finalTotal)}</span>
                  </div>
                  <p className="text-[10px] leading-5 text-[#777771]">{t.vatNote}</p>
                </div>

                {cart.cartItems.length > 0 && (
                  <form noValidate onSubmit={handleSubmit} aria-busy={isSubmitting} className="space-y-6 border-t border-[#e9e9e4] px-5 py-6 sm:px-6">
                    <div className="space-y-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#00821A]">{t.nextStep}</p>
                        <h3 className="mt-1 text-[15px] font-black uppercase tracking-[-0.01em] text-[#171717]">{t.contactSection}</h3>
                      </div>
                      {field("email", "email", "email")}
                    </div>
                    <div className="border-t border-[#e9e9e4] pt-5">
                      <h3 className="text-[15px] font-black uppercase tracking-[-0.01em] text-[#171717]">{t.deliverySection}</h3>
                      <p className="mt-1 text-[11px] text-[#76766e]">{t.requiredNote}</p>
                      <div className="mt-4 grid min-w-0 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                        {field("firstName", "given-name")}
                        {field("lastName", "family-name")}
                        <div className="sm:col-span-2 lg:col-span-1 xl:col-span-2">{field("address", "street-address")}</div>
                        {field("city", "address-level2")}
                        {field("postalCode", "postal-code")}
                        {field("country", "country-name")}
                        {field("phone", "tel", "tel")}
                      </div>
                    </div>
                    <div className="space-y-4 border-t border-[#e9e9e4] pt-5">
                      <div className="flex items-start gap-3">
                        <input id="agree-tc" type="checkbox" checked={agreeTC} onChange={(event) => { setAgreeTC(event.target.checked); if (event.target.checked) setTcError(null); }} aria-invalid={Boolean(tcError)} aria-describedby={tcError ? "hoop-terms-error" : undefined} className="mt-1 size-4 shrink-0 accent-[#00821A]" />
                        <label htmlFor="agree-tc" className="cursor-pointer text-[12px] leading-5 text-[#3d3d39]">
                          {t.termsPrefix}{" "}<Link href={`/terms-conditions?lang=${lang}`} target="_blank" rel="noopener noreferrer" className="font-bold text-[#00731a] underline underline-offset-2 hover:text-[#111111]">{t.termsLink}</Link>.
                        </label>
                      </div>
                      {tcError && <p id="hoop-terms-error" role="alert" className="text-[12px] leading-5 text-red-700">{tcError}</p>}
                      <div className="flex items-start gap-3 border-t border-[#eeeeea] pt-4">
                        <input id="marketing-opt-in" type="checkbox" checked={marketingOptIn} onChange={(event) => setMarketingOptIn(event.target.checked)} className="mt-1 size-4 shrink-0 accent-[#00821A]" />
                        <div className="text-[12px] leading-5 text-[#4c4c47]">
                          <label htmlFor="marketing-opt-in" className="cursor-pointer">{t.marketing1}{" "}<span className="font-bold text-[#00731a]">{t.marketing2}</span>{t.marketing3}</label>
                          <p className="mt-1 text-[11px] leading-5 text-[#797973]">{t.marketingNote}</p>
                        </div>
                      </div>
                    </div>
                    <button type="submit" disabled={isSubmitting || stockIssues} className="group flex min-h-12 w-full items-center justify-center gap-3 rounded-sm bg-[#00821A] px-4 py-3.5 text-[12px] font-black uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#111111] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00821A]">
                      {isSubmitting ? t.processing : t.confirm}
                      {!isSubmitting && <ArrowRight size={17} aria-hidden="true" className="transition-transform group-hover:translate-x-1" />}
                    </button>
                    <p className="flex items-center justify-center gap-2 text-center text-[11px] leading-5 text-[#73736c]"><ShieldCheck aria-hidden="true" size={15} className="shrink-0 text-[#00821A]" />{t.safe}</p>
                  </form>
                )}
              </div>
            </aside>
          </div>

          <section className="relative mt-8 overflow-hidden rounded-sm bg-[#191919] px-5 py-7 text-white sm:px-8 sm:py-8">
            <div className="absolute right-0 top-0 h-full w-[3px] bg-[#00821A]" aria-hidden="true" />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
              <div className="max-w-2xl">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-[#8ac995]">{t.footerKicker}</p>
                <h2 className="mt-2 text-[18px] font-black uppercase tracking-[-0.025em] text-white sm:text-xl">{t.footerTitle}</h2>
                <p className="mt-1.5 text-[12px] leading-5 text-white/65">{t.footerText}</p>
              </div>
              <Image src={MBG} alt="" aria-hidden="true" className="hidden h-auto w-20 shrink-0 object-contain opacity-30 sm:block" />
            </div>
          </section>
        </div>
      </Container>
    </main>
  );
};

export default Cart;
