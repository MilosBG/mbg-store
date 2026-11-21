/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import BasketBall from "@/components/mbg-components/BasketBall";
import BasketBallAnimation from "@/components/mbg-components/BasketBallAnimation";
import useCart from "@/lib/hooks/useCart";
import type { StoreLanguage } from "@/lib/store-language";
import type { Product } from "@/lib/types";
import Link from "next/link";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, ChevronDown, Mail, Ruler } from "lucide-react";

type LocalizedProduct = Product & {
  titleFr?: string;
  descriptionFr?: string;
  categoryFr?: string;
};

type ProductInfoProps = {
  productInfo: Product;
  lang?: StoreLanguage;
};

const CONTACT_EMAIL = "contact@milos-bg.com";
const STANDARD_SIZES = ["M", "L", "S"] as const;

const COPY = {
  en: {
    category: "Category",
    description: "Description",
    colors: "Colors",
    sizes: "Sizes",
    sizeGuide: "Size Guide",
    totalStock: "Standard stock",
    variantStock: "Selected variant",
    outOfStock: "Out of stock",
    quantity: "Quantity",
    addToCart: "Add to the hoop",
    emptyStock: "Empty stock",
    stock: "Stock",
    onlyLeft: (stock: number) => `Only ${stock} left`,
    chooseOptions: "Choose your options",
    pieceLabel: "THE PIECE",
    priceLabel: "ARTISAN EDITION",
    stage: "GRIND UNTIL ACHIEVE",
    customTitle: "Need another size?",
    customText:
      "For XS, XL, XXL, 3XL or a more specific fit, contact our atelier. We will confirm feasibility, pricing and lead time by email.",
    customButton: "Request a custom size",
    requestedSize: "Requested size",
    chooseSize: "Choose a size",
    otherSize: "Other / exact measurements",
    details: "Details",
    detailsPlaceholder:
      "Tell us the size, your measurements, the desired fit or any useful detail.",
    prepareEmail: "Prepare my email",
    writeDirectly: "Or write directly to",
    requestOnly:
      "This request does not create an order. Your final size request is confirmed by email.",
    standardSizes: "Standard artisan sizes available online: M / L / S",
    sizeSpecificPrompt: "Specify your size or measurements",
  },
  fr: {
    category: "Catégorie",
    description: "Description",
    colors: "Couleurs",
    sizes: "Tailles",
    sizeGuide: "Guide des tailles",
    totalStock: "Stock standard",
    variantStock: "Variante sélectionnée",
    outOfStock: "Rupture de stock",
    quantity: "Quantité",
    addToCart: "Ajouter au panier",
    emptyStock: "Stock épuisé",
    stock: "Stock",
    onlyLeft: (stock: number) => `Plus que ${stock} en stock`,
    chooseOptions: "Choisissez vos options",
    pieceLabel: "LA PIÈCE",
    priceLabel: "ÉDITION ARTISANALE",
    stage: "GRIND UNTIL ACHIEVE",
    customTitle: "Besoin d’une autre taille ?",
    customText:
      "Pour XS, XL, XXL, 3XL ou une coupe plus spécifique, contactez notre atelier. Nous confirmerons la faisabilité, le prix et le délai par e-mail.",
    customButton: "Demander une taille spécifique",
    requestedSize: "Taille demandée",
    chooseSize: "Choisissez une taille",
    otherSize: "Autre / mensurations exactes",
    details: "Précisions",
    detailsPlaceholder:
      "Indiquez la taille, vos mensurations, la coupe souhaitée ou toute précision utile.",
    prepareEmail: "Préparer mon e-mail",
    writeDirectly: "Ou écrivez directement à",
    requestOnly:
      "Cette demande ne crée pas de commande. Votre besoin de taille est confirmé par e-mail.",
    standardSizes: "Tailles artisanales standards disponibles en ligne : M / L / S",
    sizeSpecificPrompt: "Précisez la taille ou vos mensurations",
  },
} as const;

const ProductInfo = ({ productInfo, lang = "en" }: ProductInfoProps) => {
  const t = COPY[lang];
  const [product, setProduct] = useState<Product>(productInfo);

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
        const res = await fetch(`/api/products/${encodeURIComponent(productInfo._id)}`, {
          cache: "no-store",
        });
        if (!mounted || res.status === 404) return;
        if (!res.ok) return;
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
          return prevKey !== nextKey ? ({ ...prev, ...fresh } as Product) : prev;
        });
      } catch (error) {
        if (mounted) console.warn("[ProductInfo] refresh error", error);
      }
    };

    const start = () => {
      clear();
      if (document.visibilityState === "visible") {
        fetchLatest();
        intervalId = window.setInterval(fetchLatest, POLL_VISIBLE_MS);
      }
    };

    const onVisibility = () => {
      if (!mounted) return;
      if (document.visibilityState === "visible") start();
      else clear();
    };

    start();
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", start);
    return () => {
      mounted = false;
      clear();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", start);
    };
  }, [productInfo._id]);

  const localizedProduct = product as LocalizedProduct;
  const productTitle = lang === "fr" ? localizedProduct.titleFr?.trim() || product.title : product.title;
  const productDescription = lang === "fr" ? localizedProduct.descriptionFr?.trim() || product.description : product.description;
  const productCategory = lang === "fr" ? localizedProduct.categoryFr?.trim() || product.category : product.category;

  const variants = (product as any)?.variants as Array<{ color?: string; size?: string; stock: number }> | undefined;
  const colorsArr = Array.isArray((product as any)?.colors) ? ((product as any).colors as string[]) : [];
  const sizesArr = Array.isArray((product as any)?.sizes) ? ((product as any).sizes as string[]) : [];

  const orderedSizes = useMemo(
    () => STANDARD_SIZES.filter((size) => sizesArr.some((stored) => stored.trim().toUpperCase() === size)),
    [sizesArr],
  );
  const isStandardSize = (size: string) =>
    STANDARD_SIZES.some((standard) => standard === size.trim().toUpperCase());

  const defaultColor = colorsArr.length > 0 ? "" : colorsArr[0] ?? "";
  const defaultSize = orderedSizes.length > 0 ? "" : "";

  const [selectedColor, setSelectedColor] = useState<string>(defaultColor);
  const [selectedSize, setSelectedSize] = useState<string>(defaultSize);
  const [customOpen, setCustomOpen] = useState(false);
  const [requestedSize, setRequestedSize] = useState("");
  const [customMeasurements, setCustomMeasurements] = useState("");

  const stockForColor = (color: string): number => {
    if (!Array.isArray(variants) || variants.length === 0) {
      return Number((product as any)?.countInStock ?? 0);
    }
    if (selectedSize) {
      const variant = variants.find(
        (item) =>
          (item.color ?? "") === color &&
          (item.size ?? "").trim().toUpperCase() === selectedSize.trim().toUpperCase(),
      );
      return Number(variant?.stock ?? 0);
    }
    return variants
      .filter((item) => (item.color ?? "") === color && isStandardSize(item.size ?? ""))
      .reduce((total, item) => total + Number(item?.stock ?? 0), 0);
  };

  const stockForSize = (size: string): number => {
    if (!Array.isArray(variants) || variants.length === 0) {
      return Number((product as any)?.countInStock ?? 0);
    }
    if (selectedColor) {
      const variant = variants.find(
        (item) =>
          (item.size ?? "").trim().toUpperCase() === size.trim().toUpperCase() &&
          (item.color ?? "") === (selectedColor ?? ""),
      );
      return Number(variant?.stock ?? 0);
    }
    return variants
      .filter((item) => (item.size ?? "").trim().toUpperCase() === size.trim().toUpperCase())
      .reduce((total, item) => total + Number(item?.stock ?? 0), 0);
  };

  const handleSelectColor = (color: string) => {
    if (color === selectedColor) return;
    setSelectedColor(color);
    if (Array.isArray(variants) && variants.length > 0) {
      const exact = variants.find(
        (variant) =>
          (variant.color ?? "") === color &&
          (variant.size ?? "").trim().toUpperCase() === (selectedSize ?? "").trim().toUpperCase() &&
          Number(variant?.stock ?? 0) > 0,
      );
      if (!exact) {
        const alternative = variants.find(
          (variant) =>
            (variant.color ?? "") === color &&
            isStandardSize(variant.size ?? "") &&
            Number(variant?.stock ?? 0) > 0,
        );
        if (alternative?.size) setSelectedSize(alternative.size.trim().toUpperCase());
      }
    }
  };

  const handleSelectSize = (size: string) => {
    const normalized = size.trim().toUpperCase();
    if (normalized === selectedSize.trim().toUpperCase()) return;
    setSelectedSize(normalized);
    if (Array.isArray(variants) && variants.length > 0) {
      const exact = variants.find(
        (variant) =>
          (variant.size ?? "").trim().toUpperCase() === normalized &&
          (variant.color ?? "") === (selectedColor ?? "") &&
          Number(variant?.stock ?? 0) > 0,
      );
      if (!exact) {
        const alternative = variants.find(
          (variant) =>
            (variant.size ?? "").trim().toUpperCase() === normalized &&
            Number(variant?.stock ?? 0) > 0,
        );
        if (alternative?.color) setSelectedColor(alternative.color);
      }
    }
  };

  const selectStock = (color?: string, size?: string) => {
    const vars = (product as any)?.variants as Array<{ color?: string; size?: string; stock: number }> | undefined;
    const hasVariants = Array.isArray(vars) && vars.length > 0;
    const needsColor = hasVariants && colorsArr.length > 0;
    const needsSize = hasVariants && orderedSizes.length > 0;

    if (hasVariants) {
      if (needsColor && !color) return 0;
      if (needsSize && !size) return 0;
      if (needsColor || needsSize) {
        const variant = vars.find(
          (item) =>
            (!needsColor || (item.color ?? "") === (color ?? "")) &&
            (!needsSize || (item.size ?? "").trim().toUpperCase() === (size ?? "").trim().toUpperCase()),
        );
        return Number(variant?.stock ?? 0);
      }
      return vars.reduce((total, variant) => total + Number(variant?.stock ?? 0), 0);
    }

    return Number((product as any)?.countInStock ?? 0);
  };

  const totalStandardStock = (() => {
    if (Array.isArray(variants) && variants.length > 0) {
      const standardVariants = variants.filter((variant) => isStandardSize(variant.size ?? ""));
      return standardVariants.length > 0
        ? standardVariants.reduce((total, variant) => total + Number(variant?.stock ?? 0), 0)
        : variants.reduce((total, variant) => total + Number(variant?.stock ?? 0), 0);
    }
    return Number((product as any)?.countInStock ?? 0);
  })();

  const currentStock = selectStock(selectedColor, selectedSize);
  const [quantity, setQuantity] = useState<number>(currentStock > 0 ? 1 : 0);

  useEffect(() => {
    setQuantity((currentQuantity) => {
      if (currentStock <= 0) return 0;
      return Math.min(Math.max(currentQuantity, 1), currentStock);
    });
  }, [selectedColor, selectedSize, currentStock]);

  const cart = useCart();
  const shootBtnRef = useRef<HTMLButtonElement>(null);
  const [animationData, setAnimationData] = useState<{ start: DOMRect; end: DOMRect } | null>(null);

  const mailSubject = lang === "fr" ? `Demande de taille spécifique — ${productTitle}` : `Custom size inquiry — ${productTitle}`;
  const desiredSize = requestedSize === "OTHER" ? customMeasurements.trim() : requestedSize;
  const mailBody = lang === "fr"
    ? [
        "Bonjour Milos BG,",
        "",
        `Produit : ${productTitle}`,
        `Lien : https://milos-bg.com/products/${encodeURIComponent(product.slug || product._id)}?lang=fr`,
        `Couleur souhaitée : ${selectedColor || "à préciser"}`,
        `Taille demandée : ${desiredSize || "à préciser"}`,
        `Précisions : ${customMeasurements.trim() || "aucune"}`,
        "",
        "Pouvez-vous me confirmer les possibilités, le prix et le délai ?",
        "Merci !",
      ].join("\n")
    : [
        "Hello Milos BG,",
        "",
        `Product: ${productTitle}`,
        `Link: https://milos-bg.com/products/${encodeURIComponent(product.slug || product._id)}?lang=en`,
        `Preferred color: ${selectedColor || "to confirm"}`,
        `Requested size: ${desiredSize || "to confirm"}`,
        `Details: ${customMeasurements.trim() || "none"}`,
        "",
        "Could you confirm feasibility, pricing and lead time?",
        "Thank you!",
      ].join("\n");
  const mailHref = desiredSize
    ? `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(mailSubject)}&body=${encodeURIComponent(mailBody)}`
    : "";

  const needsSelection = (colorsArr.length > 0 && !selectedColor) || (orderedSizes.length > 0 && !selectedSize);
  const canAddToCart = currentStock > 0 && quantity > 0 && !needsSelection;

  return (
    <section className="relative overflow-hidden border border-white/10 bg-[#060606] text-white shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,130,26,0.16),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.04),transparent_28%)]" aria-hidden="true" />
      <div className="relative flex flex-col gap-6 p-5 sm:p-7">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
          <div className="space-y-2 min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#00821A]">{t.stage}</p>
            <h1 className="text-3xl font-black uppercase leading-[0.98] tracking-[-0.04em] sm:text-4xl">{productTitle}</h1>
            <div className="flex flex-wrap items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-white/55">
              <span>{t.pieceLabel}</span>
              {productCategory && <span className="text-[#00821A]">{productCategory}</span>}
            </div>
          </div>
          <div className="shrink-0 rounded-sm border border-white/10 bg-white/5 p-2">
            <BasketBall product={product} />
          </div>
        </div>

        <div className="flex items-end justify-between gap-4 border-l-2 border-[#00821A] pl-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/45">{t.priceLabel}</p>
            <p className="mt-1 text-[30px] font-black tracking-tight text-[#00821A]">€ {product.price}</p>
          </div>
          <span className="max-w-[46%] text-right text-[10px] font-semibold uppercase tracking-[0.12em] text-white/40">
            {t.standardSizes}
          </span>
        </div>

        {productDescription && (
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white">{t.description}</p>
            <p className="text-sm leading-7 text-white/76">{productDescription}</p>
          </div>
        )}

        {colorsArr.length > 0 && (
          <div className="space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white">{t.colors}</p>
            <div className="flex flex-wrap gap-2">
              {colorsArr.map((color) => {
                const colorStock = stockForColor(color);
                const disabled = colorStock <= 0;
                const active = selectedColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => !disabled && handleSelectColor(color)}
                    aria-pressed={active}
                    disabled={disabled}
                    className={`rounded-sm border px-3 py-2 text-[10px] font-bold uppercase tracking-[0.06em] transition ${active ? "border-[#00821A] bg-[#00821A] text-white" : "border-white/20 bg-white/5 text-white"} ${disabled ? "cursor-not-allowed opacity-35" : "hover:border-[#00821A]"}`}
                    title={Array.isArray(variants) && variants.length > 0 ? `${t.stock}: ${colorStock}` : undefined}
                  >
                    {color}
                    {Array.isArray(variants) && variants.length > 0 && <span className={`ml-2 text-[9px] ${active ? "text-white/70" : "text-[#77d488]"}`}>({colorStock})</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {orderedSizes.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white">{t.sizes}</p>
              <Link href={`/size-guide?lang=${lang}`} className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#77d488] underline underline-offset-4 hover:text-white">
                <Ruler size={14} />
                {t.sizeGuide}
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {orderedSizes.map((size) => {
                const sizeStock = stockForSize(size);
                const disabled = sizeStock <= 0;
                const active = selectedSize.trim().toUpperCase() === size;
                return (
                  <button
                    key={size}
                    type="button"
                    onClick={() => !disabled && handleSelectSize(size)}
                    aria-pressed={active}
                    disabled={disabled}
                    className={`min-w-14 rounded-sm border px-4 py-2 text-[11px] font-black uppercase tracking-[0.08em] transition ${active ? "border-white bg-white text-black" : "border-white/20 bg-black text-white"} ${disabled ? "cursor-not-allowed opacity-35" : "hover:border-[#00821A] hover:text-[#77d488]"}`}
                    title={Array.isArray(variants) && variants.length > 0 ? `${t.stock}: ${sizeStock}` : undefined}
                  >
                    {size}
                    {Array.isArray(variants) && variants.length > 0 && <span className={`ml-2 text-[9px] ${active ? "text-black/70" : "text-[#77d488]"}`}>({sizeStock})</span>}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="rounded-sm border border-[#00821A]/35 bg-white/[0.03]">
          <button
            type="button"
            aria-expanded={customOpen}
            onClick={() => setCustomOpen((current) => !current)}
            className="flex w-full items-center justify-between gap-4 p-4 text-left"
          >
            <div className="min-w-0">
              <p className="text-[11px] font-black uppercase tracking-[0.11em] text-white">{t.customTitle}</p>
              <p className="mt-1 text-[12px] leading-6 text-white/65">{t.customText}</p>
            </div>
            <ChevronDown className={`shrink-0 text-[#00821A] transition-transform ${customOpen ? "rotate-180" : ""}`} size={18} />
          </button>
          {customOpen && (
            <div className="space-y-4 border-t border-white/10 p-4">
              <label className="block space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/75">{t.requestedSize}</span>
                <select
                  value={requestedSize}
                  onChange={(event) => setRequestedSize(event.target.value)}
                  className="min-h-11 w-full rounded-sm border border-white/15 bg-black px-3 text-sm text-white outline-none transition focus:border-[#00821A]"
                >
                  <option value="">{t.chooseSize}</option>
                  <option value="XS">XS</option>
                  <option value="XL">XL</option>
                  <option value="XXL">XXL</option>
                  <option value="3XL">3XL</option>
                  <option value="OTHER">{t.otherSize}</option>
                </select>
              </label>
              <label className="block space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/75">{t.details}</span>
                <textarea
                  value={customMeasurements}
                  onChange={(event) => setCustomMeasurements(event.target.value)}
                  rows={requestedSize === "OTHER" ? 4 : 3}
                  placeholder={requestedSize === "OTHER" ? t.sizeSpecificPrompt : t.detailsPlaceholder}
                  className="w-full rounded-sm border border-white/15 bg-black px-3 py-3 text-sm leading-6 text-white outline-none transition focus:border-[#00821A]"
                />
              </label>
              {mailHref ? (
                <a
                  href={mailHref}
                  className="inline-flex min-h-11 items-center justify-center gap-2 rounded-sm bg-[#00821A] px-4 py-3 text-[11px] font-black uppercase tracking-[0.1em] text-white transition hover:bg-white hover:text-black"
                >
                  <Mail size={15} />
                  {t.prepareEmail}
                  <ArrowUpRight size={15} />
                </a>
              ) : (
                <button
                  type="button"
                  disabled
                  className="inline-flex min-h-11 cursor-not-allowed items-center justify-center gap-2 rounded-sm bg-white/10 px-4 py-3 text-[11px] font-black uppercase tracking-[0.1em] text-white/45"
                >
                  <Mail size={15} />
                  {t.prepareEmail}
                </button>
              )}
              <p className="text-[11px] leading-6 text-white/55">{t.requestOnly}</p>
              <p className="text-[11px] text-white/65">
                {t.writeDirectly}{" "}
                <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-[#77d488] underline underline-offset-4">
                  {CONTACT_EMAIL}
                </a>
              </p>
            </div>
          )}
        </div>

        <div className="space-y-4 border-t border-white/10 pt-4">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/85">
            {totalStandardStock > 0 ? (
              <>
                <span>{t.totalStock}: {totalStandardStock}</span>
                {Array.isArray(variants) && variants.length > 0 && selectedSize && selectedColor && (
                  <span className="text-[#77d488]">{" • "}{t.variantStock}: {currentStock}</span>
                )}
              </>
            ) : (
              <span className="text-red-400">{t.outOfStock}</span>
            )}
          </p>

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-white">{t.quantity}</p>
              <div className="inline-flex items-center overflow-hidden rounded-sm border border-white/10 bg-white/5">
                <button
                  type="button"
                  aria-label={lang === "fr" ? "Diminuer la quantité" : "Decrease quantity"}
                  disabled={quantity <= 1}
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  className="h-11 w-11 text-xl font-bold text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-35"
                >
                  −
                </button>
                <p className="min-w-10 text-center text-sm font-bold text-[#77d488]">{quantity}</p>
                <button
                  type="button"
                  aria-label={lang === "fr" ? "Augmenter la quantité" : "Increase quantity"}
                  disabled={currentStock <= 0 || quantity >= currentStock}
                  onClick={() => setQuantity(Math.min(quantity + 1, currentStock))}
                  className="h-11 w-11 text-xl font-bold text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-35"
                >
                  +
                </button>
              </div>
            </div>
            {currentStock > 0 && currentStock <= 5 && !needsSelection && (
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#77d488]">{t.onlyLeft(currentStock)}</p>
            )}
          </div>

          <button
            ref={shootBtnRef}
            type="button"
            disabled={!canAddToCart}
            aria-disabled={!canAddToCart}
            onClick={() => {
              if (!canAddToCart) return;
              const start = shootBtnRef.current?.getBoundingClientRect();
              const end = document.getElementById("basket-icon")?.getBoundingClientRect();
              if (start && end) {
                setAnimationData({ start, end });
                setTimeout(() => {
                  cart.addItem({ item: product, quantity, color: selectedColor, size: selectedSize });
                }, 800);
              } else {
                cart.addItem({ item: product, quantity, color: selectedColor, size: selectedSize });
              }
            }}
            className="inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-sm border border-[#00821A] bg-[#00821A] px-4 py-4 text-[11px] font-black uppercase tracking-[0.14em] text-white transition hover:border-white hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:border-white/10 disabled:bg-white/10 disabled:text-white/35"
          >
            {needsSelection && totalStandardStock > 0 ? t.chooseOptions : currentStock > 0 ? t.addToCart : t.emptyStock}
            <ArrowUpRight size={18} />
          </button>
        </div>

        {animationData && (
          <BasketBallAnimation
            start={animationData.start}
            end={animationData.end}
            onComplete={() => setAnimationData(null)}
          />
        )}
      </div>
    </section>
  );
};

export default ProductInfo;
