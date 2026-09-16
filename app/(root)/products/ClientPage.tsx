"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import {
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

type PriceRange =
  | "all"
  | "under-50"
  | "50-100"
  | "over-100";

type Availability = "all" | "available";

const COPY = {
  en: {
    pageTitle: "All Products",
    mantra: "GRIND UNTIL ACHIEVE",

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

    clearFilters: "Clear filters",

    showProducts: "Show products",

    noProducts: "No products",
    noProductsDescription:
      "No products currently match your selection.",

    soldOut: "Sold out",

    other: "Other",
  },

  fr: {
    pageTitle: "Tous les produits",
    mantra: "GRIND UNTIL ACHIEVE",

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

    clearFilters: "Effacer les filtres",

    showProducts: "Afficher les produits",

    noProducts: "Aucun produit",
    noProductsDescription:
      "Aucun produit ne correspond actuellement à votre sélection.",

    soldOut: "Épuisé",

    other: "Autres",
  },
} satisfies Record<StoreLanguage, Record<string, string>>;

const SIZE_ORDER = [
  "XS",
  "S",
  "M",
  "L",
  "XL",
  "XXL",
];

const normalize = (value?: string | null) =>
  (value ?? "").trim().toUpperCase();

const getNumber = (
  value?: number | string | null,
): number | null => {
  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return null;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const parsed = Number(
    String(value)
      .replace(/\s/g, "")
      .replace(",", ".")
      .replace(/[^\d.-]/g, ""),
  );

  return Number.isFinite(parsed)
    ? parsed
    : null;
};

const getProductPrice = (
  product: MBGProduct,
) => {
  return (
    getNumber(product.discountedPrice) ??
    getNumber(product.salePrice) ??
    getNumber(product.price) ??
    0
  );
};

const formatPrice = (price: number) => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(price);
};

const getLocalizedTitle = (
  product: MBGProduct,
  lang: StoreLanguage,
) => {
  if (lang === "fr") {
    return product.titleFr?.trim() || product.title;
  }

  return product.title;
};

const getCategoryKey = (
  product: MBGProduct,
) => {
  return normalize(product.category || "OTHER");
};

const getLocalizedCategory = (
  product: MBGProduct,
  lang: StoreLanguage,
) => {
  if (lang === "fr") {
    return (
      product.categoryFr?.trim() ||
      product.category?.trim() ||
      COPY.fr.other
    );
  }

  return (
    product.category?.trim() ||
    COPY.en.other
  );
};

const getProductSizes = (
  product: MBGProduct,
) => {
  const sizes = new Set<string>();

  product.sizes?.forEach((size) => {
    if (size) {
      sizes.add(normalize(size));
    }
  });

  product.variants?.forEach((variant) => {
    if (variant.size) {
      sizes.add(normalize(variant.size));
    }
  });

  return Array.from(sizes);
};

const getStock = (
  product: MBGProduct,
) => {
  if (typeof product.stock === "number") {
    return product.stock;
  }

  if (typeof product.quantity === "number") {
    return product.quantity;
  }

  if (product.variants?.length) {
    return product.variants.reduce(
      (total, variant) => {
        return (
          total +
          (variant.stock ??
            variant.quantity ??
            0)
        );
      },
      0,
    );
  }

  return null;
};

const getMainImage = (
  product: MBGProduct,
) => {
  const mainMedia =
    product.media?.find(Boolean);

  if (mainMedia) {
    return mainMedia;
  }

  const variantMedia = product.variants
    ?.flatMap(
      (variant) => variant.media || [],
    )
    .find(Boolean);

  return (
    variantMedia ||
    "/placeholder-product.png"
  );
};

const getProductUrl = (
  product: MBGProduct,
  lang: StoreLanguage,
) => {
  const identifier =
    product.slug || product._id;

  return `/products/${encodeURIComponent(
    identifier,
  )}?lang=${lang}`;
};

const ClientPage = ({
  products,
  lang,
}: Props) => {
  const copy = COPY[lang];

  const [showFilters, setShowFilters] =
    useState(true);

  const [
    mobileFiltersOpen,
    setMobileFiltersOpen,
  ] = useState(false);

  const [sort, setSort] =
    useState<SortValue>("featured");

  const [
    selectedCategories,
    setSelectedCategories,
  ] = useState<string[]>([]);

  const [selectedSizes, setSelectedSizes] =
    useState<string[]>([]);

  const [availability, setAvailability] =
    useState<Availability>("all");

  const [priceRange, setPriceRange] =
    useState<PriceRange>("all");

  /*
   * Les catégories gardent une clé stable
   * provenant de category, tandis que leur
   * label est traduit.
   */
  const categories = useMemo(() => {
    const map = new Map<
      string,
      string
    >();

    products.forEach((product) => {
      const key =
        getCategoryKey(product);

      const label =
        getLocalizedCategory(
          product,
          lang,
        );

      if (!map.has(key)) {
        map.set(key, label);
      }
    });

    return Array.from(
      map.entries(),
    )
      .map(([key, label]) => ({
        key,
        label,
      }))
      .sort((a, b) =>
        a.label.localeCompare(b.label),
      );
  }, [products, lang]);

  const sizes = useMemo(() => {
    const allSizes =
      new Set<string>();

    products.forEach((product) => {
      getProductSizes(product).forEach(
        (size) => allSizes.add(size),
      );
    });

    const ordered =
      SIZE_ORDER.filter((size) =>
        allSizes.has(size),
      );

    const extras = Array.from(
      allSizes,
    )
      .filter(
        (size) =>
          !SIZE_ORDER.includes(size),
      )
      .sort();

    return [...ordered, ...extras];
  }, [products]);

  const filteredProducts =
    useMemo(() => {
      const filtered =
        products.filter((product) => {
          const categoryKey =
            getCategoryKey(product);

          if (
            selectedCategories.length &&
            !selectedCategories.includes(
              categoryKey,
            )
          ) {
            return false;
          }

          if (selectedSizes.length) {
            const productSizes =
              getProductSizes(product);

            const hasSelectedSize =
              selectedSizes.some(
                (size) =>
                  productSizes.includes(
                    size,
                  ),
              );

            if (!hasSelectedSize) {
              return false;
            }
          }

          if (
            availability ===
            "available"
          ) {
            const stock =
              getStock(product);

            if (
              stock !== null &&
              stock <= 0
            ) {
              return false;
            }
          }

          const price =
            getProductPrice(product);

          if (
            priceRange ===
              "under-50" &&
            price >= 50
          ) {
            return false;
          }

          if (
            priceRange ===
              "50-100" &&
            (price < 50 ||
              price > 100)
          ) {
            return false;
          }

          if (
            priceRange ===
              "over-100" &&
            price <= 100
          ) {
            return false;
          }

          return true;
        });

      return [...filtered].sort(
        (a, b) => {
          switch (sort) {
            case "price-asc":
              return (
                getProductPrice(a) -
                getProductPrice(b)
              );

            case "price-desc":
              return (
                getProductPrice(b) -
                getProductPrice(a)
              );

            case "name-asc":
              return getLocalizedTitle(
                a,
                lang,
              ).localeCompare(
                getLocalizedTitle(
                  b,
                  lang,
                ),
              );

            case "newest":
              return b._id.localeCompare(
                a._id,
              );

            case "featured":
            default:
              return 0;
          }
        },
      );
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
    setValues: React.Dispatch<
      React.SetStateAction<string[]>
    >,
  ) => {
    setValues((current) =>
      current.includes(value)
        ? current.filter(
            (item) => item !== value,
          )
        : [...current, value],
    );
  };

  return (
    <main className="min-h-screen bg-mbg-white/50 text-mbg-black">
      {/* PAGE HEADER */}
      <section className="px-5 pb-7 pt-8 md:px-8 lg:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1 className="text-[24px] font-semibold tracking-[-0.03em] md:text-[28px]">
              {copy.pageTitle}

              <span className="ml-2 text-mbg-darkgrey">
                (
                {
                  filteredProducts.length
                }
                )
              </span>
            </h1>

            <p className="mt-1 text-sm text-mbg-darkgrey">
              {copy.mantra}
            </p>
          </div>

          <div className="flex items-center gap-5">
            {/* LANGUAGE */}
            <div className="flex items-center gap-2 text-xs font-semibold">
              <Link
                href="/products?lang=en"
                aria-current={
                  lang === "en"
                    ? "page"
                    : undefined
                }
                className={
                  lang === "en"
                    ? "text-mbg-black"
                    : "text-mbg-darkgrey"
                }
              >
                EN
              </Link>

              <span className="text-mbg-black/20">
                /
              </span>

              <Link
                href="/products?lang=fr"
                aria-current={
                  lang === "fr"
                    ? "page"
                    : undefined
                }
                className={
                  lang === "fr"
                    ? "text-mbg-black"
                    : "text-mbg-darkgrey"
                }
              >
                FR
              </Link>
            </div>

            {/* DESKTOP FILTERS */}
            <button
              type="button"
              onClick={() =>
                setShowFilters(
                  (current) =>
                    !current,
                )
              }
              className="hidden items-center gap-2 text-sm font-medium transition-opacity hover:opacity-60 lg:flex"
            >
              {showFilters
                ? copy.hideFilters
                : copy.showFilters}

              <SlidersHorizontal
                size={18}
              />
            </button>

            {/* MOBILE FILTERS */}
            <button
              type="button"
              onClick={() =>
                setMobileFiltersOpen(
                  true,
                )
              }
              className="flex flex-1 items-center justify-center gap-2 border border-mbg-black px-4 py-3 text-sm font-medium lg:hidden"
            >
              {copy.filters}

              <SlidersHorizontal
                size={17}
              />
            </button>

            {/* SORT */}
            <div className="relative flex flex-1 items-center lg:flex-none">
              <select
                aria-label={
                  copy.sortBy
                }
                value={sort}
                onChange={(event) =>
                  setSort(
                    event.target
                      .value as SortValue,
                  )
                }
                className="w-full cursor-pointer appearance-none border border-mbg-black bg-mbg-white py-3 pl-4 pr-10 text-sm font-medium outline-none lg:border-0 lg:py-1"
              >
                <option value="featured">
                  {copy.sortBy}
                </option>

                <option value="newest">
                  {copy.newest}
                </option>

                <option value="price-asc">
                  {
                    copy.priceLowHigh
                  }
                </option>

                <option value="price-desc">
                  {
                    copy.priceHighLow
                  }
                </option>

                <option value="name-asc">
                  {copy.nameAZ}
                </option>
              </select>

              <ChevronDown
                size={18}
                className="pointer-events-none absolute right-3"
              />
            </div>
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="px-5 pb-24 md:px-8 lg:px-12">
        <div className="flex items-start gap-8">
          {showFilters && (
            <aside className="sticky top-5 hidden h-[calc(100vh-40px)] w-[220px] flex-none overflow-y-auto pr-4 lg:block [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <Filters
                lang={lang}
                categories={
                  categories
                }
                sizes={sizes}
                selectedCategories={
                  selectedCategories
                }
                setSelectedCategories={
                  setSelectedCategories
                }
                selectedSizes={
                  selectedSizes
                }
                setSelectedSizes={
                  setSelectedSizes
                }
                availability={
                  availability
                }
                setAvailability={
                  setAvailability
                }
                priceRange={
                  priceRange
                }
                setPriceRange={
                  setPriceRange
                }
                toggleValue={
                  toggleValue
                }
                hasFilters={
                  hasFilters
                }
                clearFilters={
                  clearFilters
                }
              />
            </aside>
          )}

          <div className="min-w-0 flex-1">
            {filteredProducts.length >
            0 ? (
              <div
                className={`
                  grid
                  grid-cols-2
                  gap-x-3
                  gap-y-10
                  md:gap-x-4
                  md:gap-y-14
                  ${
                    showFilters
                      ? "md:grid-cols-2 lg:grid-cols-3"
                      : "md:grid-cols-3 lg:grid-cols-4"
                  }
                `}
              >
                {filteredProducts.map(
                  (product) => (
                    <ProductCard
                      key={
                        product._id
                      }
                      product={
                        product
                      }
                      lang={lang}
                    />
                  ),
                )}
              </div>
            ) : (
              <EmptyState
                lang={lang}
                onClear={
                  clearFilters
                }
                hasFilters={
                  hasFilters
                }
              />
            )}
          </div>
        </div>
      </section>

      {/* MOBILE DRAWER */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="Close"
            onClick={() =>
              setMobileFiltersOpen(
                false,
              )
            }
            className="absolute inset-0 bg-mbg-black/40"
          />

          <div className="absolute bottom-0 right-0 top-0 w-[90%] max-w-[420px] overflow-y-auto bg-mbg-white px-6 pb-32 pt-6">
            <div className="mb-7 flex items-center justify-between">
              <div>
                <p className="text-xl font-semibold">
                  {copy.filters}
                </p>

                <p className="text-sm text-mbg-darkgrey">
                  {
                    filteredProducts.length
                  }{" "}
                  {copy.pageTitle.toLowerCase()}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close"
                onClick={() =>
                  setMobileFiltersOpen(
                    false,
                  )
                }
                className="flex h-10 w-10 items-center justify-center rounded-full bg-mbg-black text-mbg-white"
              >
                <X size={20} />
              </button>
            </div>

            <Filters
              lang={lang}
              categories={
                categories
              }
              sizes={sizes}
              selectedCategories={
                selectedCategories
              }
              setSelectedCategories={
                setSelectedCategories
              }
              selectedSizes={
                selectedSizes
              }
              setSelectedSizes={
                setSelectedSizes
              }
              availability={
                availability
              }
              setAvailability={
                setAvailability
              }
              priceRange={
                priceRange
              }
              setPriceRange={
                setPriceRange
              }
              toggleValue={
                toggleValue
              }
              hasFilters={
                hasFilters
              }
              clearFilters={
                clearFilters
              }
            />

            <div className="fixed bottom-0 right-0 w-[90%] max-w-[420px] border-t border-mbg-black/10 bg-mbg-white p-5">
              <button
                type="button"
                onClick={() =>
                  setMobileFiltersOpen(
                    false,
                  )
                }
                className="w-full bg-mbg-black px-6 py-4 text-sm font-semibold uppercase tracking-wide text-mbg-white"
              >
                {copy.showProducts}{" "}
                (
                {
                  filteredProducts.length
                }
                )
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default ClientPage;

type CategoryOption = {
  key: string;
  label: string;
};

type FiltersProps = {
  lang: StoreLanguage;

  categories: CategoryOption[];

  sizes: string[];

  selectedCategories: string[];

  setSelectedCategories: React.Dispatch<
    React.SetStateAction<string[]>
  >;

  selectedSizes: string[];

  setSelectedSizes: React.Dispatch<
    React.SetStateAction<string[]>
  >;

  availability: Availability;

  setAvailability: React.Dispatch<
    React.SetStateAction<Availability>
  >;

  priceRange: PriceRange;

  setPriceRange: React.Dispatch<
    React.SetStateAction<PriceRange>
  >;

  toggleValue: (
    value: string,
    values: string[],
    setValues: React.Dispatch<
      React.SetStateAction<string[]>
    >,
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
      {/* CATEGORIES */}
      {!!categories.length && (
        <div className="pb-8">
          <p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.12em] text-mbg-darkgrey">
            {copy.categories}
          </p>

          <div className="space-y-3">
            {categories.map(
              (category) => {
                const active =
                  selectedCategories.includes(
                    category.key,
                  );

                return (
                  <button
                    type="button"
                    key={
                      category.key
                    }
                    onClick={() =>
                      toggleValue(
                        category.key,
                        selectedCategories,
                        setSelectedCategories,
                      )
                    }
                    className={`
                      block
                      text-left
                      text-[15px]
                      font-semibold
                      transition-opacity
                      hover:opacity-50
                      ${
                        active
                          ? "text-mbg-green"
                          : "text-mbg-black"
                      }
                    `}
                  >
                    {
                      category.label
                    }
                  </button>
                );
              },
            )}
          </div>
        </div>
      )}

      {/* AVAILABILITY */}
      <FilterAccordion
        label={copy.availability}
        defaultOpen
      >
        <RadioOption
          active={
            availability === "all"
          }
          label={copy.allProducts}
          onClick={() =>
            setAvailability("all")
          }
        />

        <RadioOption
          active={
            availability ===
            "available"
          }
          label={copy.inStock}
          onClick={() =>
            setAvailability(
              "available",
            )
          }
        />
      </FilterAccordion>

      {/* PRICE */}
      <FilterAccordion
        label={copy.price}
      >
        <RadioOption
          active={
            priceRange === "all"
          }
          label={copy.allPrices}
          onClick={() =>
            setPriceRange("all")
          }
        />

        <RadioOption
          active={
            priceRange ===
            "under-50"
          }
          label={copy.under50}
          onClick={() =>
            setPriceRange(
              "under-50",
            )
          }
        />

        <RadioOption
          active={
            priceRange ===
            "50-100"
          }
          label={
            copy.between50And100
          }
          onClick={() =>
            setPriceRange("50-100")
          }
        />

        <RadioOption
          active={
            priceRange ===
            "over-100"
          }
          label={copy.over100}
          onClick={() =>
            setPriceRange(
              "over-100",
            )
          }
        />
      </FilterAccordion>

      {/* SIZE */}
      {!!sizes.length && (
        <FilterAccordion
          label={copy.size}
        >
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => {
              const active =
                selectedSizes.includes(
                  size,
                );

              return (
                <button
                  key={size}
                  type="button"
                  onClick={() =>
                    toggleValue(
                      size,
                      selectedSizes,
                      setSelectedSizes,
                    )
                  }
                  className={`
                    min-h-[44px]
                    border
                    px-2
                    text-sm
                    font-semibold
                    transition-colors
                    ${
                      active
                        ? "border-mbg-black bg-mbg-black text-mbg-white"
                        : "border-mbg-black/15 bg-mbg-white text-mbg-black hover:border-mbg-black"
                    }
                  `}
                >
                  {size}
                </button>
              );
            })}
          </div>
        </FilterAccordion>
      )}

      {/* NO COLOR FILTER */}

      {hasFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="mt-6 flex items-center gap-2 text-sm font-semibold text-mbg-green"
        >
          <X size={15} />

          {copy.clearFilters}
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
  const [open, setOpen] =
    useState(defaultOpen);

  return (
    <div className="border-t border-mbg-black/10">
      <button
        type="button"
        onClick={() =>
          setOpen(
            (current) => !current,
          )
        }
        className="flex w-full items-center justify-between py-5 text-left text-[15px] font-semibold"
      >
        {label}

        <ChevronDown
          size={18}
          className={`
            transition-transform
            duration-200
            ${
              open
                ? "rotate-180"
                : ""
            }
          `}
        />
      </button>

      {open && (
        <div className="space-y-3 pb-6">
          {children}
        </div>
      )}
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
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-3 text-left text-sm font-medium"
    >
      <span
        className={`
          flex
          h-[18px]
          w-[18px]
          items-center
          justify-center
          rounded-full
          border
          ${
            active
              ? "border-mbg-black"
              : "border-mbg-black/30"
          }
        `}
      >
        {active && (
          <span className="h-2 w-2 rounded-full bg-mbg-black" />
        )}
      </span>

      {label}
    </button>
  );
};

const ProductCard = ({
  product,
  lang,
}: {
  product: MBGProduct;
  lang: StoreLanguage;
}) => {
  const copy = COPY[lang];

  const image =
    getMainImage(product);

  const title =
    getLocalizedTitle(
      product,
      lang,
    );

  const category =
    getLocalizedCategory(
      product,
      lang,
    );

  const price =
    getProductPrice(product);

  const stock =
    getStock(product);

  return (
    <article className="group min-w-0">
      <Link
        href={getProductUrl(
          product,
          lang,
        )}
        className="block"
      >
        {/* IMAGE */}
        <div className="relative aspect-[4/5] w-full overflow-hidden bg-[#F5F5F5]">
          <Image
            src={image}
            alt={title}
            fill
            sizes="
              (max-width: 768px) 50vw,
              (max-width: 1280px) 33vw,
              25vw
            "
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.015]"
          />

          {stock === 0 && (
            <div className="absolute left-3 top-3 bg-mbg-white px-3 py-2 text-[10px] font-bold uppercase tracking-[0.12em]">
              {copy.soldOut}
            </div>
          )}
        </div>

        {/* INFORMATIONS */}
        <div className="pt-4">
          {/*
            Plus de :
            - pastilles de couleur
            - color ID
            - chapter ID
            - MongoDB ObjectId
          */}

          <h2 className="text-[15px] font-semibold text-mbg-black md:text-base">
            {title}
          </h2>

          <p className="mt-1 text-[13px] text-mbg-darkgrey md:text-sm">
            {category}
          </p>

          <p className="mt-3 text-[14px] font-semibold text-mbg-black md:text-[15px]">
            {formatPrice(price)}
          </p>
        </div>
      </Link>
    </article>
  );
};

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
    <div className="flex min-h-[420px] flex-col items-center justify-center border-t border-mbg-black/10 text-center">
      <p className="text-2xl font-semibold">
        {copy.noProducts}
      </p>

      <p className="mt-2 max-w-md text-sm leading-6 text-mbg-darkgrey">
        {copy.noProductsDescription}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="mt-6 bg-mbg-black px-6 py-3 text-sm font-semibold text-mbg-white"
        >
          {copy.clearFilters}
        </button>
      )}
    </div>
  );
};