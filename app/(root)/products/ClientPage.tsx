"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  SlidersHorizontal,
  X,
} from "lucide-react";

import type { StoreLanguage } from "@/lib/store-language";

type ProductVariant = {
  _id?: string;
  size?: string;
  stock?: number;
  quantity?: number;
  price?: number | string;
  media?: string[];
};

export type MBGProduct = {
  _id: string;
  slug?: string;
  title: string;
  titleFr?: string;
  description?: string;
  descriptionFr?: string;
  media?: string[];
  category?: string;
  categoryFr?: string;
  price?: number | string;
  discountedPrice?: number | string;
  salePrice?: number | string;
  stock?: number;
  quantity?: number;
  sizes?: string[];
  variants?: ProductVariant[];
};

type Props = {
  products: MBGProduct[];
  lang: StoreLanguage;
};

type SortValue =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "name-asc";

type PriceRange = "all" | "under-50" | "50-100" | "over-100";
type Availability = "all" | "available";

type CategoryOption = {
  key: string;
  label: string;
  count: number;
};

const COPY = {
  en: {
    eyebrow: "MILOS BG / COLLECTION",
    pageTitle: "All Outfits",
    mantra: "GRIND UNTIL ACHIEVE",
    intro:
      "Artisan pieces shaped by basketball, progression and the discipline of moving from step 1 to step 5.",
    productSingular: "piece",
    productPlural: "pieces",
    results: "results",
    hideFilters: "Hide filters",
    showFilters: "Show filters",
    filters: "Filters",
    sortBy: "Sort by",
    featured: "Featured",
    newest: "Newest",
    priceLowHigh: "Price: Low to High",
    priceHighLow: "Price: High to Low",
    nameAZ: "Name: A → Z",
    categories: "Categories",
    availability: "Availability",
    allProducts: "All products",
    inStock: "In stock",
    price: "Shop by price",
    allPrices: "All prices",
    under50: "Under €50",
    between50And100: "€50 – €100",
    over100: "Over €100",
    size: "Size",
    activeFilters: "Active filters",
    clearFilters: "Clear filters",
    showProducts: "Show products",
    noProducts: "No products found",
    noProductsDescription:
      "No piece currently matches this selection. Change or clear a filter to continue exploring.",
    soldOut: "Sold out",
    viewProduct: "View product",
    other: "Other",
  },
  fr: {
    eyebrow: "MILOS BG / COLLECTION",
    pageTitle: "Toutes les tenues",
    mantra: "GRIND UNTIL ACHIEVE",
    intro:
      "Des pièces artisanales nourries par le basketball, la progression et la discipline d'avancer de l'étape 1 à l'étape 5.",
    productSingular: "pièce",
    productPlural: "pièces",
    results: "résultats",
    hideFilters: "Masquer les filtres",
    showFilters: "Afficher les filtres",
    filters: "Filtres",
    sortBy: "Trier par",
    featured: "Sélection",
    newest: "Nouveautés",
    priceLowHigh: "Prix : croissant",
    priceHighLow: "Prix : décroissant",
    nameAZ: "Nom : A → Z",
    categories: "Catégories",
    availability: "Disponibilité",
    allProducts: "Tous les produits",
    inStock: "En stock",
    price: "Rechercher par prix",
    allPrices: "Tous les prix",
    under50: "Moins de 50 €",
    between50And100: "50 € – 100 €",
    over100: "Plus de 100 €",
    size: "Taille",
    activeFilters: "Filtres actifs",
    clearFilters: "Effacer les filtres",
    showProducts: "Afficher les produits",
    noProducts: "Aucun produit trouvé",
    noProductsDescription:
      "Aucune pièce ne correspond à cette sélection. Modifie ou efface un filtre pour poursuivre l'exploration.",
    soldOut: "Épuisé",
    viewProduct: "Voir le produit",
    other: "Autres",
  },
} satisfies Record<StoreLanguage, Record<string, string>>;

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

const normalize = (value?: string | null) =>
  (value ?? "").trim().toUpperCase();

const getNumber = (value?: number | string | null): number | null => {
  if (value === null || value === undefined || value === "") return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;

  const parsed = Number(
    String(value)
      .replace(/\s/g, "")
      .replace(",", ".")
      .replace(/[^\d.-]/g, ""),
  );

  return Number.isFinite(parsed) ? parsed : null;
};

const getProductPrice = (product: MBGProduct) =>
  getNumber(product.discountedPrice) ??
  getNumber(product.salePrice) ??
  getNumber(product.price) ??
  0;

const getOriginalPrice = (product: MBGProduct) => {
  const current = getProductPrice(product);
  const base = getNumber(product.price);
  return base !== null && base > current ? base : null;
};

const formatPrice = (price: number, lang: StoreLanguage) =>
  new Intl.NumberFormat(lang === "fr" ? "fr-FR" : "en-IE", {
    style: "currency",
    currency: "EUR",
  }).format(price);

const getLocalizedTitle = (product: MBGProduct, lang: StoreLanguage) =>
  lang === "fr" ? product.titleFr?.trim() || product.title : product.title;

const getCategoryKey = (product: MBGProduct) =>
  normalize(product.category || "OTHER");

const getLocalizedCategory = (product: MBGProduct, lang: StoreLanguage) => {
  if (lang === "fr") {
    return (
      product.categoryFr?.trim() ||
      product.category?.trim() ||
      COPY.fr.other
    );
  }

  return product.category?.trim() || COPY.en.other;
};

const getProductSizes = (product: MBGProduct) => {
  const sizes = new Set<string>();

  product.sizes?.forEach((size) => {
    if (size) sizes.add(normalize(size));
  });

  product.variants?.forEach((variant) => {
    if (variant.size) sizes.add(normalize(variant.size));
  });

  return Array.from(sizes);
};

const getStock = (product: MBGProduct) => {
  if (typeof product.stock === "number") return product.stock;
  if (typeof product.quantity === "number") return product.quantity;

  if (product.variants?.length) {
    return product.variants.reduce(
      (total, variant) => total + (variant.stock ?? variant.quantity ?? 0),
      0,
    );
  }

  return null;
};

const getMainImage = (product: MBGProduct) => {
  const mainMedia = product.media?.find(Boolean);
  if (mainMedia) return mainMedia;

  const variantMedia = product.variants
    ?.flatMap((variant) => variant.media || [])
    .find(Boolean);

  return variantMedia || "/placeholder-product.png";
};

const getProductUrl = (product: MBGProduct, lang: StoreLanguage) => {
  const identifier = product.slug || product._id;
  return `/products/${encodeURIComponent(identifier)}?lang=${lang}`;
};

const ClientPage = ({ products, lang }: Props) => {
  const copy = COPY[lang];

  const [showFilters, setShowFilters] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [sort, setSort] = useState<SortValue>("featured");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [availability, setAvailability] = useState<Availability>("all");
  const [priceRange, setPriceRange] = useState<PriceRange>("all");

  useEffect(() => {
    if (!mobileFiltersOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileFiltersOpen(false);
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobileFiltersOpen]);

  const categories = useMemo(() => {
    const map = new Map<string, CategoryOption>();

    products.forEach((product) => {
      const key = getCategoryKey(product);
      const label = getLocalizedCategory(product, lang);
      const current = map.get(key);

      map.set(key, {
        key,
        label: current?.label || label,
        count: (current?.count || 0) + 1,
      });
    });

    return Array.from(map.values()).sort((a, b) =>
      a.label.localeCompare(b.label),
    );
  }, [products, lang]);

  const sizes = useMemo(() => {
    const allSizes = new Set<string>();

    products.forEach((product) => {
      getProductSizes(product).forEach((size) => allSizes.add(size));
    });

    const ordered = SIZE_ORDER.filter((size) => allSizes.has(size));
    const extras = Array.from(allSizes)
      .filter((size) => !SIZE_ORDER.includes(size))
      .sort();

    return [...ordered, ...extras];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const categoryKey = getCategoryKey(product);

      if (
        selectedCategories.length &&
        !selectedCategories.includes(categoryKey)
      ) {
        return false;
      }

      if (selectedSizes.length) {
        const productSizes = getProductSizes(product);
        const hasSelectedSize = selectedSizes.some((size) =>
          productSizes.includes(size),
        );

        if (!hasSelectedSize) return false;
      }

      if (availability === "available") {
        const stock = getStock(product);
        if (stock !== null && stock <= 0) return false;
      }

      const price = getProductPrice(product);

      if (priceRange === "under-50" && price >= 50) return false;
      if (priceRange === "50-100" && (price < 50 || price > 100)) return false;
      if (priceRange === "over-100" && price <= 100) return false;

      return true;
    });

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return getProductPrice(a) - getProductPrice(b);
        case "price-desc":
          return getProductPrice(b) - getProductPrice(a);
        case "name-asc":
          return getLocalizedTitle(a, lang).localeCompare(
            getLocalizedTitle(b, lang),
          );
        case "newest":
          return b._id.localeCompare(a._id);
        case "featured":
        default:
          return 0;
      }
    });
  }, [
    products,
    selectedCategories,
    selectedSizes,
    availability,
    priceRange,
    sort,
    lang,
  ]);

  const hasFilters =
    selectedCategories.length > 0 ||
    selectedSizes.length > 0 ||
    availability !== "all" ||
    priceRange !== "all";

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setAvailability("all");
    setPriceRange("all");
  };

  const toggleValue = (
    value: string,
    values: string[],
    setValues: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    setValues((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  const resultLabel =
    filteredProducts.length === 1 ? copy.productSingular : copy.productPlural;

  const activeFilterCount =
    selectedCategories.length +
    selectedSizes.length +
    (availability !== "all" ? 1 : 0) +
    (priceRange !== "all" ? 1 : 0);

  return (
    <main className="min-h-screen bg-mbg-white text-mbg-black">
      {/* EDITORIAL HERO */}
      <section className="border-b border-mbg-black bg-mbg-black text-mbg-white">
        <div className="grid min-h-[250px] grid-cols-1 gap-10 px-5 py-9 md:px-8 md:py-11 lg:grid-cols-[1.1fr_0.9fr] lg:px-12 lg:py-14">
          <div className="flex flex-col justify-between gap-10">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.34em] text-mbg-white/55">
                {copy.eyebrow}
              </p>

              <h1 className="mt-4 max-w-[800px] text-[clamp(2.1rem,5vw,4.8rem)] font-black uppercase leading-[0.88] tracking-[-0.055em]">
                {copy.pageTitle}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-mbg-white/65">
              <span className="text-mbg-green">01</span>
              <span>{copy.mantra}</span>
              <span className="h-px w-8 bg-mbg-white/30" />
              <span>
                {products.length} {products.length === 1 ? copy.productSingular : copy.productPlural}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-8 lg:border-l lg:border-mbg-white/15 lg:pl-10">
            <p className="max-w-xl text-base font-medium leading-7 text-mbg-white/75 md:text-lg md:leading-8">
              {copy.intro}
            </p>

            <div className="flex items-center justify-between gap-6 border-t border-mbg-white/15 pt-5">
              <span className="text-[10px] font-semibold uppercase tracking-[0.26em] text-mbg-white/45">
                {String(filteredProducts.length).padStart(2, "0")} / {String(products.length).padStart(2, "0")}
              </span>

              <LanguageSwitch lang={lang} inverted />
            </div>
          </div>
        </div>
      </section>

      {/* CONTROLS */}
      <section className="border-b border-mbg-black/10 bg-mbg-white">
        <div className="flex flex-col gap-4 px-5 py-4 md:px-8 lg:flex-row lg:items-center lg:justify-between lg:px-12">
          <div className="flex items-center justify-between gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-mbg-darkgrey">
              <span className="text-mbg-black">{filteredProducts.length}</span>{" "}
              {resultLabel}
            </p>

            <div className="lg:hidden">
              <LanguageSwitch lang={lang} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 lg:flex lg:items-center lg:gap-3">
            <button
              type="button"
              onClick={() => setShowFilters((current) => !current)}
              className="hidden min-h-11 items-center justify-center gap-2 border border-mbg-black px-4 text-xs font-semibold uppercase tracking-[0.1em] transition-colors hover:bg-mbg-black hover:text-mbg-white lg:flex"
            >
              <SlidersHorizontal size={15} strokeWidth={1.8} />
              {showFilters ? copy.hideFilters : copy.showFilters}
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center bg-mbg-green px-1 text-[10px] text-mbg-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMobileFiltersOpen(true)}
              className="flex min-h-11 items-center justify-center gap-2 border border-mbg-black px-4 text-xs font-semibold uppercase tracking-[0.1em] lg:hidden"
            >
              <SlidersHorizontal size={15} strokeWidth={1.8} />
              {copy.filters}
              {activeFilterCount > 0 && (
                <span className="flex h-5 min-w-5 items-center justify-center bg-mbg-green px-1 text-[10px] text-mbg-white">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <div className="relative">
              <select
                aria-label={copy.sortBy}
                value={sort}
                onChange={(event) => setSort(event.target.value as SortValue)}
                className="min-h-11 w-full cursor-pointer appearance-none border border-mbg-black bg-mbg-white py-2 pl-4 pr-10 text-xs font-semibold uppercase tracking-[0.08em] outline-none transition-colors hover:bg-mbg-black hover:text-mbg-white lg:min-w-[190px]"
              >
                <option value="featured">{copy.featured}</option>
                <option value="newest">{copy.newest}</option>
                <option value="price-asc">{copy.priceLowHigh}</option>
                <option value="price-desc">{copy.priceHighLow}</option>
                <option value="name-asc">{copy.nameAZ}</option>
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
              />
            </div>

            <div className="hidden lg:block">
              <LanguageSwitch lang={lang} />
            </div>
          </div>
        </div>

        {hasFilters && (
          <ActiveFilters
            lang={lang}
            categories={categories}
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
            selectedSizes={selectedSizes}
            setSelectedSizes={setSelectedSizes}
            availability={availability}
            setAvailability={setAvailability}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            clearFilters={clearFilters}
          />
        )}
      </section>

      {/* CATALOGUE */}
      <section className="px-5 pb-24 pt-6 md:px-8 md:pt-8 lg:px-12 lg:pb-32">
        <div className="flex items-start gap-8 xl:gap-12">
          {showFilters && (
            <aside className="sticky top-5 hidden w-[220px] flex-none lg:block xl:w-[250px]">
              <div className="border-y border-mbg-black/10 py-1">
                <Filters
                  lang={lang}
                  categories={categories}
                  sizes={sizes}
                  selectedCategories={selectedCategories}
                  setSelectedCategories={setSelectedCategories}
                  selectedSizes={selectedSizes}
                  setSelectedSizes={setSelectedSizes}
                  availability={availability}
                  setAvailability={setAvailability}
                  priceRange={priceRange}
                  setPriceRange={setPriceRange}
                  toggleValue={toggleValue}
                  hasFilters={hasFilters}
                  clearFilters={clearFilters}
                />
              </div>
            </aside>
          )}

          <div className="min-w-0 flex-1">
            {filteredProducts.length > 0 ? (
              <div
                className={`grid grid-cols-2 gap-x-3 gap-y-10 md:gap-x-5 md:gap-y-14 ${
                  showFilters
                    ? "md:grid-cols-2 xl:grid-cols-3"
                    : "md:grid-cols-3 xl:grid-cols-4"
                }`}
              >
                {filteredProducts.map((product, index) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    lang={lang}
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <EmptyState lang={lang} onClear={clearFilters} hasFilters={hasFilters} />
            )}
          </div>
        </div>
      </section>

      {/* MOBILE FILTER DRAWER */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="Close filters"
            onClick={() => setMobileFiltersOpen(false)}
            className="absolute inset-0 bg-mbg-black/55 backdrop-blur-[2px]"
          />

          <div className="absolute bottom-0 right-0 top-0 flex w-[92%] max-w-[430px] flex-col bg-mbg-white shadow-[-24px_0_60px_rgba(0,0,0,0.18)]">
            <div className="flex items-start justify-between border-b border-mbg-black/10 px-6 py-6">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-mbg-green">
                  {copy.mantra}
                </p>
                <p className="mt-1 text-2xl font-bold uppercase tracking-[-0.03em]">
                  {copy.filters}
                </p>
                <p className="mt-1 text-sm text-mbg-darkgrey">
                  {filteredProducts.length} {copy.results}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close filters"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex h-11 w-11 items-center justify-center border border-mbg-black bg-mbg-black text-mbg-white"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <Filters
                lang={lang}
                categories={categories}
                sizes={sizes}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
                selectedSizes={selectedSizes}
                setSelectedSizes={setSelectedSizes}
                availability={availability}
                setAvailability={setAvailability}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                toggleValue={toggleValue}
                hasFilters={hasFilters}
                clearFilters={clearFilters}
              />
            </div>

            <div className="border-t border-mbg-black/10 bg-mbg-white p-5">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="flex w-full items-center justify-between bg-mbg-black px-5 py-4 text-xs font-semibold uppercase tracking-[0.12em] text-mbg-white transition-colors active:bg-mbg-green"
              >
                <span>{copy.showProducts}</span>
                <span>{String(filteredProducts.length).padStart(2, "0")}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ClientPage;

type FiltersProps = {
  lang: StoreLanguage;
  categories: CategoryOption[];
  sizes: string[];
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSizes: string[];
  setSelectedSizes: React.Dispatch<React.SetStateAction<string[]>>;
  availability: Availability;
  setAvailability: React.Dispatch<React.SetStateAction<Availability>>;
  priceRange: PriceRange;
  setPriceRange: React.Dispatch<React.SetStateAction<PriceRange>>;
  toggleValue: (
    value: string,
    values: string[],
    setValues: React.Dispatch<React.SetStateAction<string[]>>,
  ) => void;
  hasFilters: boolean;
  clearFilters: () => void;
};

const Filters = ({
  lang,
  categories,
  sizes,
  selectedCategories,
  setSelectedCategories,
  selectedSizes,
  setSelectedSizes,
  availability,
  setAvailability,
  priceRange,
  setPriceRange,
  toggleValue,
  hasFilters,
  clearFilters,
}: FiltersProps) => {
  const copy = COPY[lang];

  return (
    <div>
      {!!categories.length && (
        <FilterAccordion label={copy.categories} defaultOpen>
          <div className="space-y-1">
            {categories.map((category) => {
              const active = selectedCategories.includes(category.key);

              return (
                <button
                  type="button"
                  key={category.key}
                  aria-pressed={active}
                  onClick={() =>
                    toggleValue(
                      category.key,
                      selectedCategories,
                      setSelectedCategories,
                    )
                  }
                  className={`group flex w-full items-center justify-between py-2.5 text-left text-[13px] font-semibold uppercase tracking-[0.08em] transition-colors ${
                    active ? "text-mbg-green" : "text-mbg-black hover:text-mbg-green"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span
                      className={`h-1.5 w-1.5 transition-transform ${
                        active
                          ? "scale-100 bg-mbg-green"
                          : "scale-0 bg-mbg-black group-hover:scale-100"
                      }`}
                    />
                    {category.label}
                  </span>

                  <span className="text-[10px] font-medium text-mbg-darkgrey">
                    {String(category.count).padStart(2, "0")}
                  </span>
                </button>
              );
            })}
          </div>
        </FilterAccordion>
      )}

      <FilterAccordion label={copy.availability} defaultOpen>
        <RadioOption
          active={availability === "all"}
          label={copy.allProducts}
          onClick={() => setAvailability("all")}
        />
        <RadioOption
          active={availability === "available"}
          label={copy.inStock}
          onClick={() => setAvailability("available")}
        />
      </FilterAccordion>

      <FilterAccordion label={copy.price}>
        <RadioOption
          active={priceRange === "all"}
          label={copy.allPrices}
          onClick={() => setPriceRange("all")}
        />
        <RadioOption
          active={priceRange === "under-50"}
          label={copy.under50}
          onClick={() => setPriceRange("under-50")}
        />
        <RadioOption
          active={priceRange === "50-100"}
          label={copy.between50And100}
          onClick={() => setPriceRange("50-100")}
        />
        <RadioOption
          active={priceRange === "over-100"}
          label={copy.over100}
          onClick={() => setPriceRange("over-100")}
        />
      </FilterAccordion>

      {!!sizes.length && (
        <FilterAccordion label={copy.size}>
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => {
              const active = selectedSizes.includes(size);

              return (
                <button
                  key={size}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    toggleValue(size, selectedSizes, setSelectedSizes)
                  }
                  className={`min-h-[44px] border px-2 text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${
                    active
                      ? "border-mbg-black bg-mbg-black text-mbg-white"
                      : "border-mbg-black/15 bg-mbg-white text-mbg-black hover:border-mbg-black hover:bg-mbg-black/[0.03]"
                  }`}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </FilterAccordion>
      )}

      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="mb-3 mt-6 flex w-full items-center justify-between border border-mbg-green px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-mbg-green transition-colors hover:bg-mbg-green hover:text-mbg-white"
        >
          {copy.clearFilters}
          <X size={14} />
        </button>
      )}
    </div>
  );
};

const FilterAccordion = ({
  label,
  children,
  defaultOpen = false,
}: {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-mbg-black/10">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between py-5 text-left text-[11px] font-bold uppercase tracking-[0.16em]"
      >
        {label}
        <ChevronDown
          size={15}
          className={`transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && <div className="space-y-2 pb-6">{children}</div>}
    </div>
  );
};

const RadioOption = ({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    aria-pressed={active}
    onClick={onClick}
    className="group flex w-full items-center justify-between py-2 text-left text-sm font-medium"
  >
    <span className="flex items-center gap-3">
      <span
        className={`flex h-[18px] w-[18px] items-center justify-center border transition-colors ${
          active
            ? "border-mbg-black bg-mbg-black"
            : "border-mbg-black/25 group-hover:border-mbg-black"
        }`}
      >
        {active && <span className="h-1.5 w-1.5 bg-mbg-green" />}
      </span>
      {label}
    </span>
  </button>
);

const LanguageSwitch = ({
  lang,
  inverted = false,
}: {
  lang: StoreLanguage;
  inverted?: boolean;
}) => (
  <div
    className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] ${
      inverted ? "text-mbg-white/45" : "text-mbg-darkgrey"
    }`}
  >
    <Link
      href="/products?lang=en"
      aria-current={lang === "en" ? "page" : undefined}
      className={
        lang === "en"
          ? inverted
            ? "text-mbg-white"
            : "text-mbg-black"
          : "transition-opacity hover:opacity-60"
      }
    >
      EN
    </Link>
    <span className={inverted ? "text-mbg-white/20" : "text-mbg-black/20"}>
      /
    </span>
    <Link
      href="/products?lang=fr"
      aria-current={lang === "fr" ? "page" : undefined}
      className={
        lang === "fr"
          ? inverted
            ? "text-mbg-white"
            : "text-mbg-black"
          : "transition-opacity hover:opacity-60"
      }
    >
      FR
    </Link>
  </div>
);

const ProductCard = ({
  product,
  lang,
  index,
}: {
  product: MBGProduct;
  lang: StoreLanguage;
  index: number;
}) => {
  const copy = COPY[lang];
  const image = getMainImage(product);
  const title = getLocalizedTitle(product, lang);
  const category = getLocalizedCategory(product, lang);
  const price = getProductPrice(product);
  const originalPrice = getOriginalPrice(product);
  const stock = getStock(product);

  return (
    <article className="group min-w-0">
      <Link href={getProductUrl(product, lang)} className="block outline-none">
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F2F2F0]">
          <Image
            src={image}
            alt={title}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025]"
          />

          <div className="absolute left-0 top-0 flex items-center">
            <span className="bg-mbg-black px-2.5 py-2 text-[9px] font-bold uppercase tracking-[0.16em] text-mbg-white md:px-3">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="bg-mbg-white/95 px-2.5 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-mbg-black backdrop-blur-sm md:px-3">
              {category}
            </span>
          </div>

          {stock === 0 && (
            <div className="absolute right-0 top-0 bg-mbg-green px-3 py-2 text-[9px] font-bold uppercase tracking-[0.14em] text-mbg-white">
              {copy.soldOut}
            </div>
          )}

          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-mbg-black px-4 py-3 text-mbg-white transition-transform duration-300 group-hover:translate-y-0 max-md:hidden">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[10px] font-semibold uppercase tracking-[0.14em]">
                {copy.viewProduct}
              </span>
              <ArrowUpRight size={15} />
            </div>
          </div>
        </div>

        <div className="border-b border-mbg-black/10 pb-5 pt-3.5 md:pt-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate text-[13px] font-bold uppercase tracking-[0.04em] text-mbg-black md:text-[15px]">
                {title}
              </h2>
              <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.14em] text-mbg-darkgrey">
                {copy.mantra}
              </p>
            </div>

            <div className="shrink-0 text-right">
              <p className="text-[12px] font-bold text-mbg-black md:text-sm">
                {formatPrice(price, lang)}
              </p>
              {originalPrice !== null && (
                <p className="mt-0.5 text-[10px] text-mbg-darkgrey line-through">
                  {formatPrice(originalPrice, lang)}
                </p>
              )}
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
};

const ActiveFilters = ({
  lang,
  categories,
  selectedCategories,
  setSelectedCategories,
  selectedSizes,
  setSelectedSizes,
  availability,
  setAvailability,
  priceRange,
  setPriceRange,
  clearFilters,
}: {
  lang: StoreLanguage;
  categories: CategoryOption[];
  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<string[]>>;
  selectedSizes: string[];
  setSelectedSizes: React.Dispatch<React.SetStateAction<string[]>>;
  availability: Availability;
  setAvailability: React.Dispatch<React.SetStateAction<Availability>>;
  priceRange: PriceRange;
  setPriceRange: React.Dispatch<React.SetStateAction<PriceRange>>;
  clearFilters: () => void;
}) => {
  const copy = COPY[lang];

  const removeCategory = (key: string) =>
    setSelectedCategories((current) => current.filter((item) => item !== key));

  const removeSize = (size: string) =>
    setSelectedSizes((current) => current.filter((item) => item !== size));

  const priceLabel =
    priceRange === "under-50"
      ? copy.under50
      : priceRange === "50-100"
        ? copy.between50And100
        : priceRange === "over-100"
          ? copy.over100
          : "";

  return (
    <div className="flex flex-wrap items-center gap-2 border-t border-mbg-black/10 px-5 py-3 md:px-8 lg:px-12">
      <span className="mr-1 text-[9px] font-bold uppercase tracking-[0.18em] text-mbg-darkgrey">
        {copy.activeFilters}
      </span>

      {selectedCategories.map((key) => {
        const category = categories.find((item) => item.key === key);
        if (!category) return null;

        return (
          <FilterChip key={key} label={category.label} onRemove={() => removeCategory(key)} />
        );
      })}

      {selectedSizes.map((size) => (
        <FilterChip key={size} label={size} onRemove={() => removeSize(size)} />
      ))}

      {availability === "available" && (
        <FilterChip label={copy.inStock} onRemove={() => setAvailability("all")} />
      )}

      {priceRange !== "all" && (
        <FilterChip label={priceLabel} onRemove={() => setPriceRange("all")} />
      )}

      <button
        type="button"
        onClick={clearFilters}
        className="ml-auto text-[9px] font-bold uppercase tracking-[0.14em] text-mbg-green underline decoration-mbg-green/35 underline-offset-4"
      >
        {copy.clearFilters}
      </button>
    </div>
  );
};

const FilterChip = ({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) => (
  <button
    type="button"
    onClick={onRemove}
    className="flex items-center gap-2 border border-mbg-black/15 bg-mbg-white px-2.5 py-1.5 text-[9px] font-bold uppercase tracking-[0.12em] transition-colors hover:border-mbg-black"
  >
    {label}
    <X size={11} />
  </button>
);

const EmptyState = ({
  lang,
  onClear,
  hasFilters,
}: {
  lang: StoreLanguage;
  onClear: () => void;
  hasFilters: boolean;
}) => {
  const copy = COPY[lang];

  return (
    <div className="flex min-h-[440px] flex-col items-start justify-center border-y border-mbg-black/10 px-1 py-16 md:px-10">
      <span className="mb-6 h-1.5 w-12 bg-mbg-green" />
      <p className="text-[clamp(2rem,5vw,4.5rem)] font-black uppercase leading-[0.9] tracking-[-0.045em]">
        {copy.noProducts}
      </p>
      <p className="mt-5 max-w-xl text-sm leading-7 text-mbg-darkgrey md:text-base">
        {copy.noProductsDescription}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-7 border border-mbg-black bg-mbg-black px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-mbg-white transition-colors hover:bg-mbg-green hover:border-mbg-green"
        >
          {copy.clearFilters}
        </button>
      )}
    </div>
  );
};
