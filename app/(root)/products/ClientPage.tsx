"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  SlidersHorizontal,
  X,
} from "lucide-react";

type ProductVariant = {
  _id?: string;
  size?: string;
  color?: string;
  colorName?: string;
  colorHex?: string;
  hex?: string;
  stock?: number;
  quantity?: number;
  price?: number | string;
  media?: string[];
};

type ProductChapter = {
  _id?: string;
  title?: string;
  name?: string;
};

export type MBGProduct = {
  _id: string;

  title: string;
  description?: string;

  media?: string[];

  category?: string;

  chapter?: string | ProductChapter;
  chapters?: Array<string | ProductChapter>;

  price?: number | string;
  discountedPrice?: number | string;
  salePrice?: number | string;

  stock?: number;
  quantity?: number;

  sizes?: string[];

  colors?: Array<
    | string
    | {
        name?: string;
        title?: string;
        hex?: string;
        colorHex?: string;
      }
  >;

  variants?: ProductVariant[];
};

type Props = {
  products: MBGProduct[];
};

type SortValue =
  | "featured"
  | "newest"
  | "price-asc"
  | "price-desc"
  | "name-asc";

const CATEGORY_ORDER = [
  "TOPS",
  "UPCYCLINGS",
  "BOTTOMS",
  "BACKUPS",
  "CGS",
];

const SIZE_ORDER = ["XS", "S", "M", "L", "XL", "XXL"];

const normalize = (value?: string | null) =>
  (value ?? "").trim().toUpperCase();

const getNumber = (
  value?: number | string | null,
): number | null => {
  if (value === null || value === undefined || value === "") {
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

  return Number.isFinite(parsed) ? parsed : null;
};

const getProductPrice = (product: MBGProduct) => {
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

const getChapterName = (product: MBGProduct) => {
  if (typeof product.chapter === "string") {
    return product.chapter;
  }

  if (product.chapter?.title) {
    return product.chapter.title;
  }

  if (product.chapter?.name) {
    return product.chapter.name;
  }

  const firstChapter = product.chapters?.[0];

  if (typeof firstChapter === "string") {
    return firstChapter;
  }

  return firstChapter?.title || firstChapter?.name || "";
};

const getProductCategory = (product: MBGProduct) => {
  return product.category || getChapterName(product) || "AUTRES";
};

const getProductSizes = (product: MBGProduct) => {
  const sizes = new Set<string>();

  product.sizes?.forEach((size) => {
    if (size) sizes.add(normalize(size));
  });

  product.variants?.forEach((variant) => {
    if (variant.size) {
      sizes.add(normalize(variant.size));
    }
  });

  return Array.from(sizes);
};

const getProductColors = (product: MBGProduct) => {
  const colors = new Map<
    string,
    {
      name: string;
      hex?: string;
    }
  >();

  product.colors?.forEach((color) => {
    if (typeof color === "string") {
      colors.set(normalize(color), {
        name: color,
      });

      return;
    }

    const name = color.name || color.title;

    if (!name) return;

    colors.set(normalize(name), {
      name,
      hex: color.hex || color.colorHex,
    });
  });

  product.variants?.forEach((variant) => {
    const name = variant.colorName || variant.color;

    if (!name) return;

    colors.set(normalize(name), {
      name,
      hex: variant.colorHex || variant.hex,
    });
  });

  return Array.from(colors.values());
};

const getStock = (product: MBGProduct) => {
  if (typeof product.stock === "number") {
    return product.stock;
  }

  if (typeof product.quantity === "number") {
    return product.quantity;
  }

  if (product.variants?.length) {
    return product.variants.reduce((total, variant) => {
      return total + (variant.stock ?? variant.quantity ?? 0);
    }, 0);
  }

  return null;
};

const getMainImage = (product: MBGProduct) => {
  const mediaImage = product.media?.find(Boolean);

  if (mediaImage) {
    return mediaImage;
  }

  const variantImage = product.variants
    ?.flatMap((variant) => variant.media || [])
    .find(Boolean);

  return variantImage || "/placeholder-product.png";
};

const colorNameToHex = (name: string) => {
  const colors: Record<string, string> = {
    BLACK: "#000000",
    NOIR: "#000000",

    WHITE: "#FFFFFF",
    BLANC: "#FFFFFF",

    GREY: "#BFBFBF",
    GRAY: "#BFBFBF",
    GRIS: "#BFBFBF",

    GREEN: "#00821A",
    VERT: "#00821A",

    BLUE: "#2454A4",
    BLEU: "#2454A4",

    RED: "#B3261E",
    ROUGE: "#B3261E",

    BROWN: "#72533F",
    MARRON: "#72533F",

    BEIGE: "#D7C3A5",
  };

  return colors[normalize(name)] || "#D9D9D9";
};

const ClientPage = ({ products }: Props) => {
  const [showFilters, setShowFilters] = useState(true);

  const [mobileFiltersOpen, setMobileFiltersOpen] =
    useState(false);

  const [sort, setSort] =
    useState<SortValue>("featured");

  const [selectedCategories, setSelectedCategories] =
    useState<string[]>([]);

  const [selectedSizes, setSelectedSizes] = useState<
    string[]
  >([]);

  const [selectedColors, setSelectedColors] = useState<
    string[]
  >([]);

  const [availability, setAvailability] = useState<
    "all" | "available"
  >("all");

  const [priceRange, setPriceRange] = useState<
    "all" | "under-50" | "50-100" | "over-100"
  >("all");

  const categories = useMemo(() => {
    const found = new Set(
      products.map((product) =>
        normalize(getProductCategory(product)),
      ),
    );

    const ordered = CATEGORY_ORDER.filter((category) =>
      found.has(category),
    );

    const extras = Array.from(found)
      .filter(
        (category) =>
          category &&
          !CATEGORY_ORDER.includes(category),
      )
      .sort();

    return [...ordered, ...extras];
  }, [products]);

  const sizes = useMemo(() => {
    const allSizes = new Set<string>();

    products.forEach((product) => {
      getProductSizes(product).forEach((size) =>
        allSizes.add(size),
      );
    });

    const ordered = SIZE_ORDER.filter((size) =>
      allSizes.has(size),
    );

    const extras = Array.from(allSizes)
      .filter((size) => !SIZE_ORDER.includes(size))
      .sort();

    return [...ordered, ...extras];
  }, [products]);

  const colors = useMemo(() => {
    const map = new Map<
      string,
      {
        name: string;
        hex?: string;
      }
    >();

    products.forEach((product) => {
      getProductColors(product).forEach((color) => {
        map.set(normalize(color.name), color);
      });
    });

    return Array.from(map.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  }, [products]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const category = normalize(
        getProductCategory(product),
      );

      if (
        selectedCategories.length &&
        !selectedCategories.includes(category)
      ) {
        return false;
      }

      if (selectedSizes.length) {
        const productSizes = getProductSizes(product);

        const containsSize = selectedSizes.some((size) =>
          productSizes.includes(size),
        );

        if (!containsSize) {
          return false;
        }
      }

      if (selectedColors.length) {
        const productColors = getProductColors(product).map(
          (color) => normalize(color.name),
        );

        const containsColor = selectedColors.some(
          (color) => productColors.includes(color),
        );

        if (!containsColor) {
          return false;
        }
      }

      if (availability === "available") {
        const stock = getStock(product);

        if (stock !== null && stock <= 0) {
          return false;
        }
      }

      const price = getProductPrice(product);

      if (priceRange === "under-50" && price >= 50) {
        return false;
      }

      if (
        priceRange === "50-100" &&
        (price < 50 || price > 100)
      ) {
        return false;
      }

      if (priceRange === "over-100" && price <= 100) {
        return false;
      }

      return true;
    });

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return (
            getProductPrice(a) - getProductPrice(b)
          );

        case "price-desc":
          return (
            getProductPrice(b) - getProductPrice(a)
          );

        case "name-asc":
          return a.title.localeCompare(b.title);

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
    selectedColors,
    availability,
    priceRange,
    sort,
  ]);

  const hasFilters =
    selectedCategories.length > 0 ||
    selectedSizes.length > 0 ||
    selectedColors.length > 0 ||
    availability !== "all" ||
    priceRange !== "all";

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedSizes([]);
    setSelectedColors([]);
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
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  };

  return (
    <main className="min-h-screen bg-mbg-white text-mbg-black">
      {/* HEADER */}
      <section className="px-5 pb-7 pt-8 md:px-8 lg:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h1
              className="
                text-[24px]
                font-semibold
                tracking-[-0.03em]
                md:text-[28px]
              "
            >
              Tous les produits
              <span className="ml-2 text-mbg-darkgrey">
                ({filteredProducts.length})
              </span>
            </h1>

            <p className="mt-1 text-sm text-mbg-darkgrey">
              GRIND UNTIL ACHIEVE
            </p>
          </div>

          <div className="flex items-center gap-5">
            {/* DESKTOP FILTER TOGGLE */}
            <button
              type="button"
              onClick={() =>
                setShowFilters((current) => !current)
              }
              className="
                hidden
                items-center
                gap-2
                text-sm
                font-medium
                transition-opacity
                hover:opacity-60
                lg:flex
              "
            >
              {showFilters
                ? "Masquer les filtres"
                : "Afficher les filtres"}

              <SlidersHorizontal size={18} />
            </button>

            {/* MOBILE FILTER BUTTON */}
            <button
              type="button"
              onClick={() =>
                setMobileFiltersOpen(true)
              }
              className="
                flex
                flex-1
                items-center
                justify-center
                gap-2
                border
                border-mbg-black
                px-4
                py-3
                text-sm
                font-medium
                lg:hidden
              "
            >
              Filtres
              <SlidersHorizontal size={17} />
            </button>

            {/* SORT */}
            <div className="relative flex flex-1 items-center lg:flex-none">
              <select
                aria-label="Trier les produits"
                value={sort}
                onChange={(event) =>
                  setSort(
                    event.target.value as SortValue,
                  )
                }
                className="
                  w-full
                  cursor-pointer
                  appearance-none
                  border
                  border-mbg-black
                  bg-mbg-white
                  py-3
                  pl-4
                  pr-10
                  text-sm
                  font-medium
                  outline-none
                  lg:border-0
                  lg:py-1
                "
              >
                <option value="featured">
                  Trier par
                </option>

                <option value="newest">
                  Nouveautés
                </option>

                <option value="price-asc">
                  Prix : croissant
                </option>

                <option value="price-desc">
                  Prix : décroissant
                </option>

                <option value="name-asc">
                  Nom : A → Z
                </option>
              </select>

              <ChevronDown
                size={18}
                className="
                  pointer-events-none
                  absolute
                  right-3
                "
              />
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <section className="px-5 pb-24 md:px-8 lg:px-12">
        <div className="flex items-start gap-7">
          {/* DESKTOP SIDEBAR */}
          {showFilters && (
            <aside
              className="
                sticky
                top-5
                hidden
                h-[calc(100vh-40px)]
                w-[220px]
                flex-none
                overflow-y-auto
                pr-4
                lg:block
                [scrollbar-width:none]
                [&::-webkit-scrollbar]:hidden
              "
            >
              <Filters
                categories={categories}
                sizes={sizes}
                colors={colors}
                selectedCategories={
                  selectedCategories
                }
                setSelectedCategories={
                  setSelectedCategories
                }
                selectedSizes={selectedSizes}
                setSelectedSizes={setSelectedSizes}
                selectedColors={selectedColors}
                setSelectedColors={setSelectedColors}
                availability={availability}
                setAvailability={setAvailability}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                toggleValue={toggleValue}
                hasFilters={hasFilters}
                clearFilters={clearFilters}
              />
            </aside>
          )}

          {/* PRODUCTS */}
          <div className="min-w-0 flex-1">
            {filteredProducts.length ? (
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
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                  />
                ))}
              </div>
            ) : (
              <EmptyState
                onClear={clearFilters}
                hasFilters={hasFilters}
              />
            )}
          </div>
        </div>
      </section>

      {/* MOBILE FILTER DRAWER */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          <button
            type="button"
            aria-label="Fermer les filtres"
            onClick={() =>
              setMobileFiltersOpen(false)
            }
            className="absolute inset-0 bg-mbg-black/40"
          />

          <div
            className="
              absolute
              bottom-0
              right-0
              top-0
              w-[90%]
              max-w-[420px]
              overflow-y-auto
              bg-mbg-white
              px-6
              pb-32
              pt-6
            "
          >
            <div className="mb-7 flex items-center justify-between">
              <div>
                <p className="text-xl font-semibold">
                  Filtres
                </p>

                <p className="text-sm text-mbg-darkgrey">
                  {filteredProducts.length} produits
                </p>
              </div>

              <button
                type="button"
                aria-label="Fermer"
                onClick={() =>
                  setMobileFiltersOpen(false)
                }
                className="
                  flex
                  h-10
                  w-10
                  items-center
                  justify-center
                  rounded-full
                  bg-mbg-black
                  text-mbg-white
                "
              >
                <X size={20} />
              </button>
            </div>

            <Filters
              categories={categories}
              sizes={sizes}
              colors={colors}
              selectedCategories={selectedCategories}
              setSelectedCategories={
                setSelectedCategories
              }
              selectedSizes={selectedSizes}
              setSelectedSizes={setSelectedSizes}
              selectedColors={selectedColors}
              setSelectedColors={setSelectedColors}
              availability={availability}
              setAvailability={setAvailability}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              toggleValue={toggleValue}
              hasFilters={hasFilters}
              clearFilters={clearFilters}
            />

            <div
              className="
                fixed
                bottom-0
                right-0
                w-[90%]
                max-w-[420px]
                border-t
                border-mbg-black/10
                bg-mbg-white
                p-5
              "
            >
              <button
                type="button"
                onClick={() =>
                  setMobileFiltersOpen(false)
                }
                className="
                  w-full
                  bg-mbg-black
                  px-6
                  py-4
                  text-sm
                  font-semibold
                  uppercase
                  tracking-wide
                  text-mbg-white
                "
              >
                Afficher {filteredProducts.length} produits
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
  categories: string[];
  sizes: string[];

  colors: {
    name: string;
    hex?: string;
  }[];

  selectedCategories: string[];
  setSelectedCategories: React.Dispatch<
    React.SetStateAction<string[]>
  >;

  selectedSizes: string[];
  setSelectedSizes: React.Dispatch<
    React.SetStateAction<string[]>
  >;

  selectedColors: string[];
  setSelectedColors: React.Dispatch<
    React.SetStateAction<string[]>
  >;

  availability: "all" | "available";
  setAvailability: React.Dispatch<
    React.SetStateAction<"all" | "available">
  >;

  priceRange:
    | "all"
    | "under-50"
    | "50-100"
    | "over-100";

  setPriceRange: React.Dispatch<
    React.SetStateAction<
      "all" | "under-50" | "50-100" | "over-100"
    >
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
  categories,
  sizes,
  colors,

  selectedCategories,
  setSelectedCategories,

  selectedSizes,
  setSelectedSizes,

  selectedColors,
  setSelectedColors,

  availability,
  setAvailability,

  priceRange,
  setPriceRange,

  toggleValue,

  hasFilters,
  clearFilters,
}: FiltersProps) => {
  return (
    <div>
      {/* CATEGORIES */}
      {!!categories.length && (
        <div className="pb-8">
          <p className="mb-4 text-[13px] font-semibold uppercase tracking-[0.12em] text-mbg-darkgrey">
            Catégories
          </p>

          <div className="space-y-3">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                onClick={() =>
                  toggleValue(
                    category,
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
                    selectedCategories.includes(category)
                      ? "text-mbg-green"
                      : "text-mbg-black"
                  }
                `}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      )}

      <FilterAccordion
        label="Disponibilité"
        defaultOpen
      >
        <RadioOption
          active={availability === "all"}
          label="Tous les produits"
          onClick={() =>
            setAvailability("all")
          }
        />

        <RadioOption
          active={availability === "available"}
          label="En stock"
          onClick={() =>
            setAvailability("available")
          }
        />
      </FilterAccordion>

      <FilterAccordion label="Rechercher par prix">
        <RadioOption
          active={priceRange === "all"}
          label="Tous les prix"
          onClick={() => setPriceRange("all")}
        />

        <RadioOption
          active={priceRange === "under-50"}
          label="Moins de 50 €"
          onClick={() =>
            setPriceRange("under-50")
          }
        />

        <RadioOption
          active={priceRange === "50-100"}
          label="50 € – 100 €"
          onClick={() =>
            setPriceRange("50-100")
          }
        />

        <RadioOption
          active={priceRange === "over-100"}
          label="Plus de 100 €"
          onClick={() =>
            setPriceRange("over-100")
          }
        />
      </FilterAccordion>

      {!!sizes.length && (
        <FilterAccordion label="Taille">
          <div className="grid grid-cols-3 gap-2">
            {sizes.map((size) => {
              const active =
                selectedSizes.includes(size);

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

      {!!colors.length && (
        <FilterAccordion label="Couleur">
          <div className="space-y-3">
            {colors.map((color) => {
              const key = normalize(color.name);

              const active =
                selectedColors.includes(key);

              const background =
                color.hex ||
                colorNameToHex(color.name);

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    toggleValue(
                      key,
                      selectedColors,
                      setSelectedColors,
                    )
                  }
                  className="
                    flex
                    w-full
                    items-center
                    gap-3
                    text-left
                    text-sm
                    font-medium
                  "
                >
                  <span
                    className="
                      relative
                      flex
                      h-6
                      w-6
                      flex-none
                      items-center
                      justify-center
                      rounded-full
                      border
                      border-mbg-black/20
                    "
                    style={{
                      backgroundColor: background,
                    }}
                  >
                    {active && (
                      <Check
                        size={13}
                        className={
                          background.toLowerCase() ===
                            "#ffffff" ||
                          background.toLowerCase() ===
                            "#bfbfbf"
                            ? "text-mbg-black"
                            : "text-mbg-white"
                        }
                      />
                    )}
                  </span>

                  <span>{color.name}</span>
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
          className="
            mt-6
            flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-mbg-green
          "
        >
          <X size={15} />
          Effacer les filtres
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
          setOpen((current) => !current)
        }
        className="
          flex
          w-full
          items-center
          justify-between
          py-5
          text-left
          text-[15px]
          font-semibold
        "
      >
        {label}

        <ChevronDown
          size={18}
          className={`
            transition-transform
            duration-200
            ${open ? "rotate-180" : ""}
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
      className="
        flex
        w-full
        items-center
        gap-3
        text-left
        text-sm
        font-medium
      "
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
}: {
  product: MBGProduct;
}) => {
  const image = getMainImage(product);

  const category =
    getProductCategory(product);

  const chapter = getChapterName(product);

  const price = getProductPrice(product);

  const colors = getProductColors(product);

  const stock = getStock(product);

  return (
    <article className="group min-w-0">
      <Link
        href={`/products/${product._id}`}
        className="block"
      >
        {/* IMAGE */}
        <div
          className="
            relative
            aspect-[4/5]
            w-full
            overflow-hidden
            bg-[#F5F5F5]
          "
        >
          <Image
            src={image}
            alt={product.title}
            fill
            sizes="
              (max-width: 768px) 50vw,
              (max-width: 1280px) 33vw,
              25vw
            "
            className="
              object-cover
              transition-transform
              duration-500
              ease-out
              group-hover:scale-[1.015]
            "
          />

          {stock === 0 && (
            <div
              className="
                absolute
                left-3
                top-3
                bg-mbg-white
                px-3
                py-2
                text-[10px]
                font-bold
                uppercase
                tracking-[0.12em]
              "
            >
              Épuisé
            </div>
          )}
        </div>

        {/* INFO */}
        <div className="pt-3">
          {!!colors.length && (
            <div className="mb-3 flex items-center gap-1.5">
              {colors
                .slice(0, 5)
                .map((color) => (
                  <span
                    key={color.name}
                    title={color.name}
                    className="
                      h-[17px]
                      w-[17px]
                      rounded-full
                      border
                      border-mbg-black/15
                    "
                    style={{
                      backgroundColor:
                        color.hex ||
                        colorNameToHex(
                          color.name,
                        ),
                    }}
                  />
                ))}

              {colors.length > 5 && (
                <span className="ml-1 text-xs text-mbg-darkgrey">
                  +{colors.length - 5}
                </span>
              )}
            </div>
          )}

          {chapter && (
            <p
              className="
                mb-1
                text-xs
                font-semibold
                uppercase
                tracking-[0.12em]
                text-mbg-green
              "
            >
              {chapter}
            </p>
          )}

          <h2
            className="
              truncate
              text-[15px]
              font-semibold
              text-mbg-black
              md:text-base
            "
          >
            {product.title}
          </h2>

          <p
            className="
              mt-1
              text-[13px]
              text-mbg-darkgrey
              md:text-sm
            "
          >
            {category}
          </p>

          <p
            className="
              mt-3
              text-[14px]
              font-semibold
              text-mbg-black
              md:text-[15px]
            "
          >
            {formatPrice(price)}
          </p>
        </div>
      </Link>
    </article>
  );
};

const EmptyState = ({
  onClear,
  hasFilters,
}: {
  onClear: () => void;
  hasFilters: boolean;
}) => {
  return (
    <div
      className="
        flex
        min-h-[420px]
        flex-col
        items-center
        justify-center
        border-t
        border-mbg-black/10
        text-center
      "
    >
      <p className="text-2xl font-semibold">
        Aucun produit
      </p>

      <p className="mt-2 max-w-md text-sm leading-6 text-mbg-darkgrey">
        Aucun produit ne correspond actuellement à
        votre sélection.
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="
            mt-6
            bg-mbg-black
            px-6
            py-3
            text-sm
            font-semibold
            text-mbg-white
          "
        >
          Effacer les filtres
        </button>
      )}
    </div>
  );
};