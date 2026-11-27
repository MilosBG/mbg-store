/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import BasketBall from "@/components/mbg-components/BasketBall";
import BasketBallAnimation from "@/components/mbg-components/BasketBallAnimation";
import useCart from "@/lib/hooks/useCart";
import type { StoreLanguage } from "@/lib/store-language";
import type { Product } from "@/lib/types";
import Link from "next/link";
import React, { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Mail, Ruler, ChevronDown } from "lucide-react";

type LocalizedProduct = Product & {
  titleFr?: string;
  descriptionFr?: string;
  categoryFr?: string;
};

type ProductInfoProps = {
  productInfo: Product;
  lang?: StoreLanguage;
};

const COPY = {
  en: {
    category: "Category",
    description: "Description",
    colors: "Colors",
    sizes: "Sizes",
    sizeGuide: "Size Guide",
    totalStock: "Available stock",
    variantStock: "Variant stock",
    outOfStock: "Out of stock",
    quantity: "Quantity",
    shoot: "ADD TO THE HOOP",
    selectOptions: "CHOOSE YOUR OPTIONS",
    discover: "A piece of the journey",
    caption: "GRIND UNTIL ACHIEVE · BUILT WITH INTENTION",
    colorPrompt: "Select your color",
    sizePrompt: "Find your fit",
    sizeRequestTitle: "YOUR JOURNEY. YOUR SIZE.",
    sizeRequestSub: "Need another size? Ask our atelier about a custom fit.",
    requestButton: "REQUEST A SPECIFIC SIZE",
    requestedSize: "Desired size",
    sizeChoose: "Choose a size",
    sizeOther: "Other / exact measurements",
    specifySize: "Specify the size or measurements",
    notes: "Additional details (optional)",
    notesPlaceholder: "Measurements, desired fit, or any useful information...",
    emailRequest: "PREPARE MY EMAIL",
    emailMissing: "Choose a size to prepare your email.",
    requestNotice: "This is an inquiry, not an order. Availability, price and lead time are confirmed by email.",
    copyEmail: "Or write directly to",
    selected: "Selected",
    unavailable: "Unavailable",
    sizesReminder: "Other sizes are available on request, not as standard stock.",
    countLabel: "Choose your quantity",
    shopStage: "02 / MAKE YOUR CHOICE",
    beginning: "A small decision. A step forward.",
    emptyStock: "Empty stock",
    stock: "Stock",
    onlyLeft: (stock: number) => `Only ${stock} left`,
  },
  fr: {
    category: "Catégorie",
    description: "Description",
    colors: "Couleurs",
    sizes: "Tailles",
    sizeGuide: "Guide des tailles",
    totalStock: "Stock disponible",
    variantStock: "Stock de la variante",
    outOfStock: "Rupture de stock",
    quantity: "Quantité",
    shoot: "AJOUTER AU PANIER",
    selectOptions: "CHOISISSEZ VOS OPTIONS",
    discover: "Une pièce de votre parcours",
    caption: "GRIND UNTIL ACHIEVE · FAIT AVEC INTENTION",
    colorPrompt: "Choisissez votre couleur",
    sizePrompt: "Trouvez votre taille",
    sizeRequestTitle: "VOTRE PARCOURS. VOTRE TAILLE.",
    sizeRequestSub: "Une autre taille ? Contactez notre atelier pour une demande spécifique.",
    requestButton: "DEMANDER UNE TAILLE SPÉCIFIQUE",
    requestedSize: "Taille souhaitée",
    sizeChoose: "Choisir une taille",
    sizeOther: "Autre / mensurations exactes",
    specifySize: "Précisez la taille ou vos mensurations",
    notes: "Précisions complémentaires (facultatif)",
    notesPlaceholder: "Mensurations, coupe souhaitée, informations utiles...",
    emailRequest: "PRÉPARER MON E-MAIL",
    emailMissing: "Choisissez une taille pour préparer votre e-mail.",
    requestNotice: "Il s'agit d'une demande, pas d'une commande. Disponibilité, prix et délai sont confirmés par e-mail.",
    copyEmail: "Ou écrivez directement à",
    selected: "Sélectionnée",
    unavailable: "Indisponible",
    sizesReminder: "Les autres tailles se demandent par e-mail et ne constituent pas du stock standard.",
    countLabel: "Choisissez la quantité",
    shopStage: "02 / FAITES VOTRE CHOIX",
    beginning: "Une décision. Un pas de plus.",
    emptyStock: "Stock épuisé",
    stock: "Stock",
    onlyLeft: (stock: number) => `Plus que ${stock} en stock`,
  },
} as const;

const ProductInfo = ({ productInfo, lang = "en" }: ProductInfoProps) => {
  const t = COPY[lang];

  // Live copy of the product for real-time stock updates
  const [product, setProduct] = useState<Product>(productInfo);

  // Poll product details; pause when tab hidden and refresh on focus
  useEffect(() => {
    let mounted = true;
    const POLL_VISIBLE_MS = 5000;
    let intervalId: number | null = null;

    const clear = () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
        intervalId = null;
      }
    };

    const fetchLatest = async () => {
      try {
        const res = await fetch(
          `/api/products/${encodeURIComponent(productInfo._id)}`,
          {
            cache: "no-store",
          },
        );

        if (!mounted) return;
        if (res.status === 404) return;

        if (!res.ok) {
          if (res.status >= 500 && mounted) {
            console.warn(`[ProductInfo] refresh failed (${res.status})`);
          }
          return;
        }

        const fresh = (await res.json()) as Product;
        if (!mounted || !fresh) return;

        setProduct((prev) => {
          const prevKey = JSON.stringify({
            countInStock: (prev as any)?.countInStock ?? null,
            variants: (prev as any)?.variants ?? null,
            price: (prev as any)?.price ?? null,
            updatedAt: (prev as any)?.updatedAt ?? null,
            titleFr: (prev as any)?.titleFr ?? null,
            descriptionFr: (prev as any)?.descriptionFr ?? null,
            categoryFr: (prev as any)?.categoryFr ?? null,
          });

          const nextKey = JSON.stringify({
            countInStock: (fresh as any)?.countInStock ?? null,
            variants: (fresh as any)?.variants ?? null,
            price: (fresh as any)?.price ?? null,
            updatedAt: (fresh as any)?.updatedAt ?? null,
            titleFr: (fresh as any)?.titleFr ?? null,
            descriptionFr: (fresh as any)?.descriptionFr ?? null,
            categoryFr: (fresh as any)?.categoryFr ?? null,
          });

          if (prevKey !== nextKey) return { ...prev, ...fresh } as Product;
          return prev;
        });
      } catch (error) {
        if (mounted) {
          console.warn("[ProductInfo] refresh error", error);
        }
      }
    };

    const start = () => {
      clear();
      if (document.visibilityState === "visible") {
        // Immediate refresh then start interval
        fetchLatest();
        intervalId = window.setInterval(fetchLatest, POLL_VISIBLE_MS);
      }
    };

    const onVisibility = () => {
      if (!mounted) return;
      if (document.visibilityState === "visible") start();
      else clear();
    };

    const onFocus = () => {
      if (!mounted) return;
      start();
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", onFocus);

    return () => {
      mounted = false;
      clear();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", onFocus);
    };
  }, [productInfo._id]);

  const localizedProduct = product as LocalizedProduct;
  const productTitle =
    lang === "fr"
      ? localizedProduct.titleFr?.trim() || product.title
      : product.title;
  const productDescription =
    lang === "fr"
      ? localizedProduct.descriptionFr?.trim() || product.description
      : product.description;
  const productCategory =
    lang === "fr"
      ? localizedProduct.categoryFr?.trim() || product.category
      : product.category;

  const variants = (product as any)?.variants as
    | Array<{ color?: string; size?: string; stock: number }>
    | undefined;

  const colorsArr = [...new Set([
    ...(Array.isArray(product.colors) ? product.colors : []),
    ...(Array.isArray(product.variants) ? product.variants.map((item) => item.color || "") : []),
  ].map((color) => color.trim()).filter(Boolean))];

  const sizesArr = Array.isArray((product as any)?.sizes)
    ? ((product as any).sizes as string[])
    : [];

  // No hard-coded textile sizes: accessories may have a unique size, a
  // numeric size, or no size at all. Read choices from the actual product.
  const oneSizeAliases = ["ONE SIZE", "ONESIZE", "OS", "U", "UNIQUE", "TAILLE UNIQUE", "TU"];
  const sizeKey = (size: string) => {
    const upper = size.trim().toUpperCase();
    return oneSizeAliases.includes(upper) ? "ONE_SIZE" : upper;
  };
  const sameSize = (left: string, right: string) => sizeKey(left) === sizeKey(right);
  const sizesFromVariants = Array.isArray(variants)
    ? variants.map((variant) => variant.size || "")
    : [];
  const uniqueSizes = new Map<string, string>();
  // Variant labels are canonical for stock and checkout; size metadata is a fallback.
  [...sizesFromVariants, ...sizesArr].forEach((size) => {
    const key = sizeKey(size);
    if (key && !uniqueSizes.has(key)) uniqueSizes.set(key, size.trim());
  });
  // Preserve the brand order for classic garments, then show any other real sizes.
  const sizeRank = (size: string) => {
    const rank = ["M", "L", "S"].indexOf(sizeKey(size));
    return rank < 0 ? 3 : rank;
  };
  const orderedSizes = [...uniqueSizes.values()].sort(
    (left, right) => sizeRank(left) - sizeRank(right),
  );
  const hasSizeChoice = orderedSizes.length > 0;
  const isOneSize = orderedSizes.length === 1 && sizeKey(orderedSizes[0]) === "ONE_SIZE";
  const isAccessory = /accessor|accessoire|bag|sac|casquette|cap|chapeau|hat|jewellery|bijou/i.test(
    `${productCategory || ""} ${(product.tags || []).join(" ")}`,
  );
  const canRequestCustomSize = !isOneSize && !isAccessory;
  const sizeLabel = (size: string) =>
    sizeKey(size) === "ONE_SIZE" ? (lang === "fr" ? "TAILLE UNIQUE" : "ONE SIZE") : size;

  const [customRequestOpen, setCustomRequestOpen] = useState(false);
  const [requestedSize, setRequestedSize] = useState("");
  const [specificSize, setSpecificSize] = useState("");
  const [requestNotes, setRequestNotes] = useState("");

  // Require explicit user selection when options exist
  const pickDefaults = () => {
    const c = colorsArr.length === 1 ? colorsArr[0] : "";
    const s = orderedSizes.length === 1 ? orderedSizes[0] : "";
    return { c, s };
  };

  const defaults = pickDefaults();

  const [selectedColor, setSeclectedColor] = useState<string>(defaults.c);
  const [selectedSize, setSeclectedSize] = useState<string>(defaults.s);

  // Helpers to compute stock for color/size choices
  const stockForColor = (color: string): number => {
    if (!Array.isArray(variants) || variants.length === 0) {
      return Number((product as any)?.countInStock ?? 0);
    }

    if (selectedSize) {
      const variant = variants.find(
        (item) =>
          (item.color ?? "") === color &&
          sameSize(item.size ?? "", selectedSize ?? ""),
      );
      return Number(variant?.stock ?? 0);
    }

    return variants
      .filter((item) =>
        (item.color ?? "") === color &&
        (!hasSizeChoice || orderedSizes.some((size) => sameSize(item.size ?? "", size))),
      )
      .reduce((total, item) => total + Number(item?.stock ?? 0), 0);
  };

  const stockForSize = (size: string): number => {
    if (!Array.isArray(variants) || variants.length === 0) {
      return Number((product as any)?.countInStock ?? 0);
    }

    if (selectedColor) {
      const variant = variants.find(
        (item) =>
          sameSize(item.size ?? "", size) &&
          (item.color ?? "") === (selectedColor ?? ""),
      );
      return Number(variant?.stock ?? 0);
    }

    return variants
      .filter((item) => sameSize(item.size ?? "", size))
      .reduce((total, item) => total + Number(item?.stock ?? 0), 0);
  };

  const handleSelectColor = (color: string) => {
    if (color === selectedColor) return;

    setSeclectedColor(color);

    if (Array.isArray(variants) && variants.length > 0) {
      const exact = variants.find(
        (variant) =>
          (variant.color ?? "") === color &&
          sameSize(variant.size ?? "", selectedSize ?? "") &&
          Number(variant?.stock ?? 0) > 0,
      );

      if (!exact) {
        const alternative = variants.find(
          (variant) =>
            (variant.color ?? "") === color &&
            Number(variant?.stock ?? 0) > 0,
        );

        if (alternative?.size) setSeclectedSize(alternative.size);
      }
    }
  };

  const handleSelectSize = (size: string) => {
    if (size === selectedSize) return;

    setSeclectedSize(size);

    if (Array.isArray(variants) && variants.length > 0) {
      const exact = variants.find(
        (variant) =>
          sameSize(variant.size ?? "", size) &&
          (variant.color ?? "") === (selectedColor ?? "") &&
          Number(variant?.stock ?? 0) > 0,
      );

      if (!exact) {
        const alternative = variants.find(
          (variant) =>
            sameSize(variant.size ?? "", size) &&
            Number(variant?.stock ?? 0) > 0,
        );

        if (alternative?.color) setSeclectedColor(alternative.color);
      }
    }
  };

  // Compute per-variant stock when variants exist
  const selectStock = (color?: string, size?: string) => {
    const vars = (product as any)?.variants as
      | Array<{ color?: string; size?: string; stock: number }>
      | undefined;

    const hasVariants = Array.isArray(vars) && vars.length > 0;
    const needsColor = hasVariants && colorsArr.length > 0;
    const needsSize = hasVariants && hasSizeChoice;

    if (hasVariants) {
      const colorReady = !needsColor || !!color;
      const sizeReady = !needsSize || !!size;

      if (!colorReady || !sizeReady) return 0;

      const exact = vars.find(
        (variant) =>
          (variant.color ?? "") === (color ?? "") &&
          sameSize(variant.size ?? "", size ?? ""),
      );

      return Number(exact?.stock ?? 0);
    }

    return Number((product as any)?.countInStock ?? 0);
  };

  // Total stock follows admin logic: sum of variants when present, otherwise countInStock
  const totalStock = (() => {
    if (Array.isArray(variants) && variants.length > 0) {
      return variants.reduce(
        (total, variant) => total + Number(variant?.stock ?? 0),
        0,
      );
    }

    return Number((product as any)?.countInStock ?? 0);
  })();

  // Every configured sellable variant counts, including ONE SIZE accessories.
  const availableStock = totalStock;
  const currentStock = selectStock(selectedColor, selectedSize);
  const [quantity, setQuantity] = useState<number>(currentStock > 0 ? 1 : 0);

  useEffect(() => {
    // Clamp or reset quantity when selection changes
    setQuantity((currentQuantity) => {
      if (currentStock <= 0) return 0;
      return Math.min(Math.max(currentQuantity, 1), currentStock);
    });
  }, [selectedColor, selectedSize, currentStock]);

  const cart = useCart();

  const shootBtnRef = useRef<HTMLButtonElement>(null);
  const [animationData, setAnimationData] = useState<{
    start: DOMRect;
    end: DOMRect;
  } | null>(null);

  const requestedCustomSize = requestedSize === "OTHER"
    ? specificSize.trim()
    : requestedSize;
  const mailSubject = lang === "fr"
    ? `Demande de taille spécifique — ${productTitle}`
    : `Custom size inquiry — ${productTitle}`;
  const mailBody = lang === "fr"
    ? [
        "Bonjour Milos BG,",
        "",
        "Je souhaite me renseigner sur une taille spécifique pour cette pièce.",
        `Produit : ${productTitle}`,
        `Lien : https://milos-bg.com/products/${encodeURIComponent(product.slug || product._id)}?lang=fr`,
        `Taille demandée : ${requestedCustomSize}`,
        `Couleur souhaitée : ${selectedColor || "à préciser"}`,
        `Précisions : ${requestNotes.trim() || "aucune"}`,
        "",
        "Pouvez-vous m'indiquer les possibilités, le prix et le délai ?",
        "Merci !",
      ].join("\n")
    : [
        "Hello Milos BG,",
        "",
        "I'd like to ask about a custom size for this piece.",
        `Product: ${productTitle}`,
        `Link: https://milos-bg.com/products/${encodeURIComponent(product.slug || product._id)}?lang=en`,
        `Requested size: ${requestedCustomSize}`,
        `Preferred color: ${selectedColor || "to confirm"}`,
        `Details: ${requestNotes.trim() || "none"}`,
        "",
        "Could you confirm feasibility, pricing and lead time?",
        "Thank you!",
      ].join("\n");
  const mailHref = requestedCustomSize
    ? `mailto:contact@milos-bg.com?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`
    : "";
  const needsSelection =
    (colorsArr.length > 0 && !selectedColor) ||
    (hasSizeChoice && !selectedSize);
  const canAddToCart = currentStock > 0 && quantity > 0 && !needsSelection;
  const productCurrency = Number.isFinite(Number(product.price))
    ? new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-IE", {
        style: "currency", currency: "EUR", maximumFractionDigits: 2,
      }).format(Number(product.price))
    : "—";

  return (
    <section className="relative overflow-hidden border border-black/10 bg-white font-[Kanit,sans-serif] shadow-[0_18px_55px_rgba(0,0,0,0.035)]">
      <div className="h-1 w-full bg-[#00821A]" />
      <div className="p-4 sm:p-5 lg:p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0 space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-[0.21em] text-[#00821A]">{t.discover}</p>
            <h2 className="text-[clamp(1.45rem,3vw,2.4rem)] font-bold uppercase leading-[1.05] tracking-[-0.025em] text-black">
              {productTitle}
            </h2>
            {productCategory && (
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#404040]">
                {t.category} <span className="ml-2 text-[#00821A]">/ {productCategory}</span>
              </p>
            )}
          </div>
          <div className="shrink-0 border border-black/10 p-2 text-[#00821A]"><BasketBall product={product} /></div>
        </div>
        <div className="mb-4 flex items-center justify-between gap-3 border-y border-black/10 py-3">
          <p className="text-[clamp(1.5rem,3vw,2.1rem)] font-bold tracking-tight text-[#00821A]">{productCurrency}</p>
          <span className="max-w-[46%] text-right text-[9px] font-semibold uppercase leading-relaxed tracking-[0.06em] text-[#404040]">
            {t.caption}
          </span>
        </div>

        {productDescription && (
          <div className="mb-5 border-l-2 border-[#00821A] pl-3">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.18em] text-black/50">{t.description}</p>
            <p className="whitespace-pre-line text-[13px] leading-[1.75] text-[#404040] sm:text-sm">{productDescription}</p>
          </div>
        )}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-black/10 pb-3">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-black">{t.shopStage}</p>
          <span className="text-[9px] font-medium uppercase tracking-[0.1em] text-black/50">{t.beginning}</span>
        </div>

        {colorsArr.length > 0 && (
          <fieldset className="mb-5 min-w-0 space-y-3">
            <legend className="text-[11px] font-bold uppercase tracking-[0.1em] text-black">{t.colorPrompt}</legend>
            <div className="flex flex-wrap gap-2">
              {colorsArr.map((color) => {
                const stock = stockForColor(color);
                const disabled = stock <= 0;
                const active = selectedColor === color;
                return (
                  <button key={color} type="button" aria-pressed={active} disabled={disabled}
                    title={`${color} · ${t.stock}: ${stock}`}
                    onClick={() => handleSelectColor(color)}
                    className={`min-h-10 rounded-sm border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.055em] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00821A] ${active ? "border-black bg-black text-white" : "border-black/20 bg-[#F5F5F2] text-black hover:border-[#00821A]"} ${disabled ? "cursor-not-allowed opacity-35" : ""}`}>
                    {color}<span className={`ml-2 text-[9px] ${active ? "text-[#BFBFBF]" : "text-[#00821A]"}`}>{stock}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {orderedSizes.length > 0 && (
          <fieldset className="mb-3 min-w-0 space-y-3">
            <legend className="text-[11px] font-bold uppercase tracking-[0.1em] text-black">{t.sizePrompt}</legend>
            <div className="flex flex-wrap items-center gap-2">
              {orderedSizes.map((size) => {
                const stock = stockForSize(size);
                const disabled = stock <= 0;
                const active = sameSize(selectedSize, size);
                return (
                  <button key={size} type="button" aria-pressed={active} disabled={disabled}
                    onClick={() => handleSelectSize(size)}
                    className={`min-h-10 min-w-12 rounded-sm border px-3 text-[11px] font-bold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00821A] ${active ? "border-[#00821A] bg-[#00821A] text-white" : "border-black/20 bg-white text-black hover:border-[#00821A]"} ${disabled ? "cursor-not-allowed opacity-35" : ""}`}>
                    {sizeLabel(size)}
                  </button>
                );
              })}
              {!isOneSize && !isAccessory && (
                <Link href={`/size-guide?lang=${lang}`} className="ml-auto inline-flex min-h-10 items-center gap-1.5 text-[11px] font-semibold text-[#00821A] underline underline-offset-4 hover:text-black">
                  <Ruler size={14} aria-hidden="true" />{t.sizeGuide}
                </Link>
              )}
            </div>
          </fieldset>
        )}

        {canRequestCustomSize && (
        <div className="my-5 border border-[#00821A]/25 bg-[#F4F7F3]">
          <button type="button" aria-expanded={customRequestOpen} aria-controls="mbg-custom-size-panel"
            onClick={() => setCustomRequestOpen((current) => !current)}
            className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-[#EAF2E9] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00821A]">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-[#00821A] text-white"><Ruler size={19} aria-hidden="true" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-black uppercase tracking-[0.07em] text-black">{t.sizeRequestTitle}</span>
              <span className="mt-1 block text-[11px] leading-relaxed text-[#404040]">{t.sizeRequestSub}</span>
            </span>
            <ChevronDown size={17} className={`shrink-0 text-[#00821A] transition-transform duration-300 ${customRequestOpen ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
          {customRequestOpen && (
            <div id="mbg-custom-size-panel" className="space-y-4 border-t border-[#00821A]/20 p-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-black">{t.requestedSize}</span>
                  <select value={requestedSize} onChange={(event) => setRequestedSize(event.target.value)}
                    className="min-h-11 w-full rounded-sm border border-black/20 bg-white px-3 text-xs text-black focus:border-[#00821A] focus:outline-none">
                    <option value="">{t.sizeChoose}</option>
                    <option value="XS">XS</option>
                    <option value="XL">XL</option>
                    <option value="XXL">XXL</option>
                    <option value="3XL">3XL</option>
                    <option value="OTHER">{t.sizeOther}</option>
                  </select>
                </label>
                {requestedSize === "OTHER" && (
                  <label className="block space-y-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wide text-black">{t.specifySize}</span>
                    <input value={specificSize} maxLength={100} onChange={(event) => setSpecificSize(event.target.value)}
                      className="min-h-11 w-full rounded-sm border border-black/20 bg-white px-3 text-xs focus:border-[#00821A] focus:outline-none"
                      placeholder={lang === "fr" ? "Ex. 4XL, tour de poitrine..." : "E.g. 4XL, chest measurement..."} />
                  </label>
                )}
              </div>
              <label className="block space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wide text-black">{t.notes}</span>
                <textarea value={requestNotes} maxLength={1000} rows={3} onChange={(event) => setRequestNotes(event.target.value)}
                  placeholder={t.notesPlaceholder}
                  className="w-full resize-y rounded-sm border border-black/20 bg-white px-3 py-2 text-xs leading-relaxed text-black focus:border-[#00821A] focus:outline-none" />
              </label>
              {mailHref ? (
                <a href={mailHref} className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-sm bg-black px-4 py-3 text-[11px] font-bold uppercase tracking-[0.08em] text-white transition-colors hover:bg-[#00821A] sm:w-auto">
                  <Mail size={15} aria-hidden="true" />{t.emailRequest}<ArrowUpRight size={15} aria-hidden="true" />
                </a>
              ) : (
                <button type="button" disabled className="inline-flex min-h-11 w-full cursor-not-allowed items-center justify-center gap-2 rounded-sm bg-black/30 px-4 py-3 text-[11px] font-bold uppercase text-white sm:w-auto">
                  <Mail size={15} aria-hidden="true" />{t.emailRequest}
                </button>
              )}
              <p className="text-[11px] leading-relaxed text-[#404040]">{t.requestNotice}</p>
              <p className="text-[10px] text-[#404040]">{t.copyEmail} <a className="font-semibold text-[#00821A] underline underline-offset-2" href="mailto:contact@milos-bg.com">contact@milos-bg.com</a></p>
            </div>
          )}
        </div>

        )}

        <div className="space-y-4 border-t border-black/10 pt-5">
          <p className="text-[10px] font-black uppercase tracking-[0.1em] text-[#404040]">
            {availableStock > 0 ? (
              <>{t.totalStock}: <span className="text-black">{availableStock}</span>
                {selectedSize && selectedColor && (
                  <span className="ml-2 text-[#00821A]">· {t.variantStock}: {currentStock}</span>
                )}
              </>
            ) : <span className="text-[#a12e2e]">{t.outOfStock}</span>}
          </p>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-wide text-black">{t.countLabel}</p>
              <div className="inline-flex h-11 items-center border border-black/15 bg-[#F5F5F2]">
                <button type="button" aria-label={lang === "fr" ? "Diminuer la quantité" : "Decrease quantity"}
                  disabled={quantity <= 1} onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="h-11 w-11 text-lg text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30">−</button>
                <output aria-live="polite" className="min-w-10 text-center text-sm font-bold tabular-nums text-black">{quantity}</output>
                <button type="button" aria-label={lang === "fr" ? "Augmenter la quantité" : "Increase quantity"}
                  disabled={currentStock <= 0 || quantity >= currentStock} onClick={() => setQuantity((prev) => Math.min(prev + 1, currentStock))}
                  className="h-11 w-11 text-lg text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30">+</button>
              </div>
            </div>
            {currentStock > 0 && currentStock <= 5 && !needsSelection && (
              <span className="text-[10px] font-semibold uppercase tracking-wide text-[#00821A]">{t.onlyLeft(currentStock)}</span>
            )}
          </div>
          <button ref={shootBtnRef} type="button" disabled={!canAddToCart} aria-disabled={!canAddToCart}
            onClick={() => {
              if (!canAddToCart) return;
              const start = shootBtnRef.current?.getBoundingClientRect();
              const end = document.getElementById("basket-icon")?.getBoundingClientRect();
              if (start && end) {
                setAnimationData({ start, end });
                window.setTimeout(() => {
                  cart.addItem({ item: product, quantity, color: selectedColor, size: selectedSize });
                }, 800);
              } else {
                // Avoid silently losing a cart action when the basket icon is hidden on mobile.
                cart.addItem({ item: product, quantity, color: selectedColor, size: selectedSize });
              }
            }}
            className="flex min-h-14 w-full items-center justify-center gap-3 rounded-sm bg-black px-5 py-4 text-[12px] font-black uppercase tracking-[0.12em] text-white transition-colors hover:bg-[#00821A] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00821A] disabled:cursor-not-allowed disabled:bg-black/15 disabled:text-black/45">
            {needsSelection && availableStock > 0 ? t.selectOptions : currentStock > 0 ? t.shoot : t.emptyStock}
            <ArrowUpRight size={19} aria-hidden="true" />
          </button>
          {animationData && (
            <BasketBallAnimation start={animationData.start} end={animationData.end} onComplete={() => setAnimationData(null)} />
          )}
        </div>
      </div>
    </section>
  );
};

export default ProductInfo;
