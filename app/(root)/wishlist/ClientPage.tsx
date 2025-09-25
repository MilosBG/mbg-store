/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Container from "@/components/mbg-components/Container";
import { H2 } from "@/components/mbg-components/H2";
import Loader from "@/components/mbg-components/Loader";
import ProductCard from "@/components/mbg-components/ProductCard";
import Separator from "@/components/mbg-components/Separator";
import { getProductById } from "@/lib/admin";
import { useUser } from "@clerk/nextjs";
import React, { useEffect, useState } from "react";
import type { Product, User } from "@/lib/types";

const Wishlist = () => {
  const { user } = useUser();

  const [loading, setLoading] = useState(true);
  const [signedInUser, setSignedInUser] = useState<User | null>(null);
  const [wishlist, setWishlist] = useState<Product[]>([]);

  const getUser = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setSignedInUser(data);
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

  const getWishlstProducts = async () => {
    setLoading(true);
    if (!signedInUser) return;
    const wishlistProducts = await Promise.all(
      signedInUser.wishlist.map(async (productId) => {
        const res = await getProductById(productId);
        return res;
      })
    );
    setWishlist(wishlistProducts.filter(Boolean) as Product[]);
    setLoading(false);
  };

  useEffect(() => {
    if (signedInUser) {
      getWishlstProducts();
    }
  }, [signedInUser]);
    
    const updateSignedInUser = (updatedUser: User) => {
        setSignedInUser(updatedUser)
    }

  return loading ? (
    <Loader />
  ) : (
    <Container className="mt-4 min-h-[50vh]">
      <H2>Your Wishlist</H2>
      <Separator className="bg-mbg-black mt-2 mb-4" />
      {wishlist.length === 0 && (
        <p className="uppercase text-[11px] tracking-widest font-bold text-mbg-green py-3">
          No Items In Your Wishlist...
        </p>
      )}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-10">
        {wishlist.map((product) => (
          <ProductCard key={product._id} product={product} updateSignedInUser={updateSignedInUser} />
        ))}
      </div>
    </Container>
  );
};

export default Wishlist;
