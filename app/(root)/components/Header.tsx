"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

import { GiBasketballBasket, GiFamilyHouse } from "react-icons/gi";
import { FaUserCircle } from "react-icons/fa";
import { IoMdBasketball } from "react-icons/io";

import { UserButton, useUser } from "@clerk/nextjs";

import { MilosBG } from "@/images";
import Container from "@/components/mbg-components/Container";
import Input from "@/components/mbg-components/Input";
import useCart from "@/lib/hooks/useCart";

const Header = () => {
  const router = useRouter();
  const { user } = useUser();

  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const totalQty = useCart((state) =>
    state.cartItems.reduce((sum, item) => sum + item.quantity, 0)
  );

  /*
  |--------------------------------------------------------------------------
  | Close user menu
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        btnRef.current &&
        !btnRef.current.contains(target)
      ) {
        setOpen(false);
      }
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  /*
  |--------------------------------------------------------------------------
  | Search
  |--------------------------------------------------------------------------
  */

  const handleSearch = (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const cleanQuery = query.trim();

    if (!cleanQuery) return;

    router.push(`/search/${encodeURIComponent(cleanQuery)}`);
  };

  const clearSearch = () => {
    setQuery("");
    inputRef.current?.focus();
  };

  return (
    <header className="sticky top-0 z-50 bg-mbg-black shadow-md">
      <Container className="py-3 text-mbg-darkgrey">
        {/* ============================================================= */}
        {/* LOGO */}
        {/* ============================================================= */}

        <div className="mbg-p-center w-full bg-mbg-black px-4">
          <Link
            href="/"
            aria-label="Milos BG - Home"
            className="group"
          >
            <Image
              src={MilosBG}
              alt="Milos BG"
              width={250}
              height={50}
              priority
              className="
                cursor-pointer
                p-7
                transition-opacity
                duration-300
                group-hover:opacity-80
              "
            />
          </Link>
        </div>

        {/* ============================================================= */}
        {/* NAVIGATION */}
        {/* ============================================================= */}

        <div>
          <div
            className="
              mbg-p-between
              mx-auto
              rounded-tl-md
              rounded-tr-md
              bg-mbg-white
              px-4
              py-3
              text-mbg-black
            "
          >
            {/* HOME */}
            <div className="flex w-auto items-center justify-start gap-2.5 md:gap-0">
              <Link
                href="/"
                aria-label="Home"
                className="
                        mbg-p-center
                        rounded-sm
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-mbg-green
                        focus-visible:ring-offset-2
                      "
              >
                <GiFamilyHouse />
              </Link>
            </div>

            {/* ACCOUNT */}
            <div className="relative flex w-44 items-center justify-end gap-4">
              <div className="mbg-p-center gap-4">
                {user && (
                  <div className="relative">
                    <button
                      ref={btnRef}
                      type="button"
                      aria-label="Open account menu"
                      aria-haspopup="menu"
                      aria-expanded={open}
                      onClick={() => setOpen((value) => !value)}
                      className="
                        mbg-p-center
                        rounded-sm
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-mbg-green
                        focus-visible:ring-offset-2
                      "
                    >
                      <IoMdBasketball
                        className={`
                          mbg-icons-style
                          hoverEffect
                          ${
                            open
                              ? "rotate-12 text-mbg-green"
                              : ""
                          }
                        `}
                      />
                    </button>

                    {open && (
                      <div
                        ref={menuRef}
                        role="menu"
                        className="
                          absolute
                          right-0
                          top-[calc(100%+14px)]
                          z-[60]
                          min-w-[160px]
                          overflow-hidden
                          rounded-md
                          border
                          border-mbg-black/10
                          bg-mbg-rgbablank
                          p-1.5
                          shadow-lg
                        "
                      >
                        <Link
                          href="/wishlist"
                          role="menuitem"
                          onClick={() => setOpen(false)}
                          className="
                            block
                            rounded-sm
                            px-3
                            py-2
                            text-sm
                            font-medium
                            text-mbg-black
                            transition-colors
                            duration-200
                            hover:bg-mbg-black/[0.05]
                            hover:text-mbg-green
                          "
                        >
                          Wishlist
                        </Link>

                        <Link
                          href="/orders"
                          role="menuitem"
                          onClick={() => setOpen(false)}
                          className="
                            block
                            rounded-sm
                            px-3
                            py-2
                            text-sm
                            font-medium
                            text-mbg-black
                            transition-colors
                            duration-200
                            hover:bg-mbg-black/[0.05]
                            hover:text-mbg-green
                          "
                        >
                          Orders
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                <div className="mbg-p-center">
                  {user ? (
                    <UserButton afterSwitchSessionUrl="/sign-in" />
                  ) : (
                    <Link
                      href="/sign-in"
                      aria-label="Sign in"
                      className="
                        rounded-full
                        focus-visible:outline-none
                        focus-visible:ring-2
                        focus-visible:ring-mbg-green
                        focus-visible:ring-offset-2
                      "
                    >
                      <FaUserCircle className="mbg-icons-style hoverEffect" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* ============================================================= */}
          {/* SEARCH BAR */}
          {/* ============================================================= */}

          <div className="bg-mbg-white px-1 pb-1">
            <form
              onSubmit={handleSearch}
              role="search"
              className="group relative w-full"
            >
              <div
                className="
                  relative
                  flex
                  w-full
                  items-center
                  overflow-hidden
                  rounded-md
                  border
                  border-transparent
                  bg-mbg-black/[0.06]
                  transition-all
                  duration-300
                  hover:bg-mbg-black/[0.08]
                  focus-within:border-mbg-black/15
                  focus-within:bg-mbg-rgbablank
                  focus-within:shadow-sm
                "
              >
                {/* LEFT SEARCH ICON */}

                <Search
                  size={16}
                  strokeWidth={1.8}
                  aria-hidden="true"
                  className="
                    pointer-events-none
                    absolute
                    left-3
                    z-10
                    text-mbg-darkgrey/50
                    transition-colors
                    duration-300
                    group-focus-within:text-mbg-green
                  "
                />

                {/* INPUT */}

                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search..."
                  aria-label="Search"
                  autoComplete="off"
                  className="
                    h-10
                    w-full
                    border-0
                    bg-transparent
                    pl-10
                    pr-20
                    text-sm
                    text-mbg-black
                    outline-none
                    transition-all
                    duration-300
                    placeholder:text-mbg-darkgrey/45
                    focus:border-0
                    focus:bg-transparent
                    focus:ring-0
                  "
                  width="100%"
                />

                {/* ACTIONS */}

                <div className="absolute right-1 flex items-center gap-0.5">
                  {/* CLEAR */}

                  {query.length > 0 && (
                    <button
                      type="button"
                      onClick={clearSearch}
                      aria-label="Clear search"
                      className="
                        flex
                        size-8
                        items-center
                        justify-center
                        rounded-sm
                        text-mbg-darkgrey/50
                        transition-all
                        duration-200
                        hover:bg-mbg-black/[0.05]
                        hover:text-mbg-black
                        active:scale-90
                      "
                    >
                      <X size={14} strokeWidth={1.8} />
                    </button>
                  )}

                  {/* SEARCH */}

                  <button
                    type="submit"
                    disabled={!query.trim()}
                    aria-label="Search"
                    className="
                      flex
                      size-8
                      items-center
                      justify-center
                      rounded-sm
                      text-mbg-darkgrey
                      transition-all
                      duration-200
                      hover:bg-mbg-black/[0.04]
                      hover:text-mbg-green
                      active:scale-90
                      disabled:pointer-events-none
                      disabled:opacity-30
                    "
                  >
                    <Search size={17} strokeWidth={2} />
                  </button>
                </div>
              </div>

              {/* CATEGORY HINTS */}

              <div
                aria-hidden="true"
                className="
                  pointer-events-none
                  absolute
                  left-1/2
                  top-1/2
                  hidden
                  -translate-x-1/2
                  -translate-y-1/2
                  items-center
                  gap-2
                  whitespace-nowrap
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[0.12em]
                  text-mbg-darkgrey/35
                  transition-opacity
                  duration-200
                  xl:flex
                "
                style={{
                  opacity: query ? 0 : undefined,
                }}
              >
                <span>TOPS</span>

                <span className="text-mbg-green/70">✿</span>

                <span>UPCYCLINGS</span>

                <span className="text-mbg-green/70">✿</span>

                <span>BOTTOMS</span>

                <span className="text-mbg-green/70">✿</span>

                <span>BACKUPS</span>

                <span className="text-mbg-green/70">✿</span>

                <span>CGS</span>
              </div>
            </form>
          </div>
        </div>

        {/* ============================================================= */}
        {/* CART / THE HOOP */}
        {/* ============================================================= */}

        <div className="relative mx-auto flex h-0 w-20 items-center justify-center">
          <div
            className="
              container
              imgbxsh
              flex
              w-20
              -translate-y-15
              cursor-pointer
              items-center
              justify-center
              bg-transparent
              px-4
              p-2
              pt-3
              text-mbg-black
              hover:text-prime-mbg
            "
            style={{ borderRadius: "0rem" }}
          >
            <Link
              href="/the-hoop"
              aria-label={`Basket - ${totalQty} ${
                totalQty === 1 ? "item" : "items"
              }`}
              className="
                rounded-sm
                border
                border-mbg-black/[0.07]
                px-4
                p-2
                text-mbg-green
                shadow-md
                transition-all
                duration-300
                hover:-translate-y-0.5
                hover:border-mbg-green/40
                hover:text-mbg-green
                hover:shadow-lg
                active:translate-y-0
                active:scale-95
              "
            >
              <div id="basket-icon">
                <GiBasketballBasket className="h-6 w-6" />
              </div>
            </Link>
          </div>

          {/* CART BADGE */}

          {totalQty > 0 && (
            <span
              className="
                absolute
                flex
                h-4
                min-w-4
                items-center
                justify-center
                rounded-xs
                bg-mbg-black
                px-1
                text-[10px]
                font-medium
                leading-none
                text-mbg-white
                shadow-sm
              "
              style={{ top: "-14px" }}
            >
              {totalQty > 99 ? "99+" : totalQty}
            </span>
          )}
        </div>
      </Container>
    </header>
  );
};

export default Header;