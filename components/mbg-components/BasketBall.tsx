/* eslint-disable @typescript-eslint/no-unused-expressions */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
/* eslint-disable react-hooks/exhaustive-deps */
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { PiBasketballFill, PiBasketballLight } from "react-icons/pi";

import type { Product, User } from "@/lib/types";

interface BasketballProps {
  product: Product
  updateSignedInUser?: (updatedUser: User) => void
}

const BasketBall = ({ product, updateSignedInUser }: BasketballProps) => {
  const router = useRouter();
  const { user } = useUser();

  const [loading, setLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const getUser = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/users");
      const data = await res.json();
      setIsLiked(data.wishlist.includes(product._id));
      setLoading(false);
    } catch (err) {
      console.log("[users_GET]", err);
    }
  };

  useEffect(() => {
    if (user) {
      getUser();
    }
  }, [user]);

    const handleLike = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault()
    try {
      if (!user) {
        router.push("/sign-in");
        return;
      } else {
        setLoading(true);
        const res = await fetch("/api/users/wishlist", {
          method: "POST",
          body: JSON.stringify({ productId: product._id }),
        });
        const updatedUser = await res.json();
        setIsLiked(updatedUser.wishlist.includes(product._id));
        updateSignedInUser && updateSignedInUser(updatedUser)
      }

    } catch (err) {
      console.log("[wishlist_POST]", err);
    }
  };
  return (
    <button onClick={handleLike}>
      {isLiked ? (
        <PiBasketballFill className="w-5 h-5 text-mbg-green" />
      ) : (
        <PiBasketballLight className="w-5 h-5 text-mbg-green" />
      )}
    </button>
  );
};

export default BasketBall;
