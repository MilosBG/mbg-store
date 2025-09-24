"use client";
import Image from "next/image";
import Link from "next/link";
import { MilosBG } from "@/images";
import Container from "@/components/mbg-components/Container";
import { GiBasketballBasket, GiFamilyHouse } from "react-icons/gi";
import { CiBasketball } from "react-icons/ci";
import { IoMdBasketball } from "react-icons/io";
import { UserButton, useUser } from "@clerk/nextjs";
import { useEffect, useRef, useState } from "react";
import useCart from "@/lib/hooks/useCart";
import Input from "@/components/mbg-components/Input";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

const Header = () => {
  const router = useRouter();
  const { user } = useUser();

  const totalQty = useCart((s) =>
    s.cartItems.reduce((sum, ci) => sum + ci.quantity, 0)
  );

  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node) &&
        btnRef.current &&
        !btnRef.current.contains(e.target as Node)
      )
        setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const [query, setQuery] = useState("");

  return (
    <header className="bg-mbg-black shadow-md sticky top-0 z-50">
      <Container className="py-3 text-mbg-darkgrey">
        <div className="bg-mbg-black px-4 mbg-p-center w-full">
          <Link href={"/"}>
            <Image
              src={MilosBG}
              alt="Milos BG Logo"
              width={250}
              height={50}
              priority
              className="cursor-pointer p-7"
            />
          </Link>
        </div>
        <div>
          <div className="bg-mbg-white rounded-tl-md rounded-tr-md text-mbg-black px-4 py-3 mbg-p-between mx-auto p-2 ">
            <div className="w-auto flex items-center gap-2.5 md:gap-0 justify-start">
              <Link href={"/"} className="mbg-icons-style hoverEffect mbg-p-center">
                <GiFamilyHouse />
              </Link>
            </div>

            <div className="flex items-center justify-end w-44 gap-4 relative">

              <div className="mbg-p-center gap-4">
                {user && (
                  <button
                    ref={btnRef}
                    type="button"
                    aria-haspopup="menu"
                    aria-expanded={open}
                    onClick={() => setOpen((v) => !v)}
                  >
                    <IoMdBasketball className="mbg-icons-style hoverEffect" />
                  </button>
                )}
                {user && open && (
                  <div
                    ref={menuRef}
                    role="menu"
                    className="absolute top-19 left-[17px] flex flex-col gap-2 p-3 rounded-b-sm border border-t-0 w-full hoverEffect bg-mbg-rgbablank"
                  >
                    <Link
                      href="/wishlist"
                      className="mbg-hover hoverEffect"
                      role="menuitem"
                      onClick={() => setOpen(false)}
                    >
                      Wishlist
                    </Link>
                    <Link
                      href="/orders"
                      className="mbg-hover hoverEffect"
                      role="menuitem"
                      onClick={() => setOpen(false)}
                    >
                      Orders
                    </Link>
                  </div>
                )}
                <div className="mbg-p-center">
                  {user ? (
                    <UserButton afterSwitchSessionUrl="/sign-in" />
                  ) : (
                    <Link href={"/sign-in"}>
                      <CiBasketball className="mbg-icons-style hoverEffect" />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="bg-mbg-white h-8.5">
            <div className=" px-1 py-1 relative">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search Keys : TOP  |  BOTTOM  |  BACKUP"
                className="bg-mbg-black/7 w-full text-mbg-black focus:ring-mbg-black/7 focus:border-mbg-black focus:bg-mbg-rgbablank"
                width="100%"
              />
              <button
                disabled={query === ""}
                onClick={() => router.push(`/search/${query}`)}
              >
                <Search className="mbg-icon text-mbg-darkgrey hover:text-mbg-green hoverEffect absolute top-[9px] right-2" />
              </button>
            </div>
          </div>
        </div>
        <div className=" h-0 flex items-center justify-center mx-auto w-20">
          <div
            className="container cursor-pointer -translate-y-15 imgbxsh bg-transparent text-mbg-black hover:text-prime-mbg flex px-4 p-2 pt-3 items-center justify-center w-20"
            style={{ borderRadius: "0rem" }}
          >
            <Link
              href={"/the-hoop"}
              className="shadow-md text-mbg-green border-1 border-mbg-black/7 p-2 px-4 rounded-sm hover:text-mbg-green hover:border-1 hover:border-mbg-green/46 hoverEffect"
            >
              <div id="basket-icon" ><GiBasketballBasket className="h-6 w-6 " /></div>
            </Link>
          </div>
          <span
            className="bg-mbg-black text-mbg-white font-medium px-2 h-4 absolute text-xs rounded-xs flex items-center justify-center"
            style={{ top: "110px" }}
          >
            {totalQty}
          </span>
        </div>
      </Container>
    </header>
  );
};

export default Header;
