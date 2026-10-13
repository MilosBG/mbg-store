"use client";

import { useUser } from "@clerk/nextjs";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { PiBasketballFill, PiBasketballLight } from "react-icons/pi";

import { GrindUntilAchieve2 } from "@/images";
import type { Product, User } from "@/lib/types";

interface BasketballProps {
  product: Product;
  updateSignedInUser?: (updatedUser: User) => void;
}

type Particle = {
  type: "basketball" | "logo";
  x: number;
  y: number;
  rotation: number;
  size: number;
  delay: number;
};

// Trajectoires autour du ballon : alternance basket / logo G.U.A.
const PARTICLES: Particle[] = [
  { type: "basketball", x: -62, y: -33, rotation: -310, size: 15, delay: 0.00 },
  { type: "logo", x: -36, y: -65, rotation: -220, size: 18, delay: 0.04 },
  { type: "basketball", x: -3, y: -73, rotation: 290, size: 14, delay: 0.02 },
  { type: "logo", x: 32, y: -63, rotation: 210, size: 18, delay: 0.08 },
  { type: "basketball", x: 62, y: -33, rotation: 340, size: 15, delay: 0.03 },
  { type: "logo", x: 72, y: 3, rotation: -280, size: 17, delay: 0.07 },
  { type: "basketball", x: 54, y: 43, rotation: 300, size: 14, delay: 0.05 },
  { type: "logo", x: 22, y: 66, rotation: -200, size: 17, delay: 0.10 },
  { type: "basketball", x: -16, y: 64, rotation: 280, size: 15, delay: 0.07 },
  { type: "logo", x: -50, y: 42, rotation: 240, size: 18, delay: 0.04 },
  { type: "basketball", x: -74, y: 7, rotation: -300, size: 13, delay: 0.09 },
  { type: "logo", x: 9, y: -46, rotation: 180, size: 14, delay: 0.11 },
];

const isInWishlist = (wishlist: unknown, productId: Product["_id"]) =>
  Array.isArray(wishlist) &&
  wishlist.some((id: unknown) => String(id) === String(productId));

const BasketBall = ({ product, updateSignedInUser }: BasketballProps) => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const reduceMotion = useReducedMotion();

  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingWishlist, setCheckingWishlist] = useState(false);
  const [animationId, setAnimationId] = useState(0);
  const [animationType, setAnimationType] = useState<"like" | "unlike" | "idle">("idle");

  // Synchronisation de l'état réel des favoris à l'ouverture de la carte.
  useEffect(() => {
    if (!user?.id) {
      setIsLiked(false);
      setCheckingWishlist(false);
      return;
    }

    const controller = new AbortController();
    let active = true;

    const fetchWishlist = async () => {
      setCheckingWishlist(true);
      try {
        const res = await fetch("/api/users", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Wishlist GET: ${res.status}`);

        const data = await res.json();
        if (active) setIsLiked(isInWishlist(data?.wishlist, product._id));
      } catch (error) {
        if (!controller.signal.aborted) {
          console.error("[users_GET]", error);
        }
      } finally {
        if (active) setCheckingWishlist(false);
      }
    };

    void fetchWishlist();
    return () => {
      active = false;
      controller.abort();
    };
  }, [user?.id, product._id]);

  const handleLike = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading || checkingWishlist || !isLoaded) return;

    if (!user) {
      router.push("/sign-in");
      return;
    }

    const previousLiked = isLiked;
    const nextLiked = !previousLiked;

    // Feedback immédiat : l'animation ne dépend pas de la latence réseau.
    setIsLiked(nextLiked);
    setAnimationType(nextLiked ? "like" : "unlike");
    setAnimationId((id) => id + 1);
    setLoading(true);

    try {
      const res = await fetch("/api/users/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id }),
      });
      if (!res.ok) throw new Error(`Wishlist POST: ${res.status}`);

      const updatedUser: User = await res.json();
      setIsLiked(isInWishlist(updatedUser.wishlist, product._id));
      updateSignedInUser?.(updatedUser);
    } catch (error) {
      console.error("[wishlist_POST]", error);
      setIsLiked(previousLiked);
      setAnimationType("idle");
    } finally {
      setLoading(false);
    }
  };

  const animateIcon = !reduceMotion && animationId > 0;
  const isAdding = animationType === "like";
  const showConfetti = animateIcon && isAdding;

  return (
    <div className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center overflow-visible">
      <motion.button
        type="button"
        onClick={handleLike}
        disabled={loading || checkingWishlist || !isLoaded}
        aria-pressed={isLiked}
        aria-busy={loading || checkingWishlist}
        aria-label={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
        title={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
        whileTap={reduceMotion ? undefined : { scale: 0.85 }}
        className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full text-[#00821A] transition-colors hover:bg-[#00821A]/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00821A] disabled:cursor-wait"
      >
        <motion.span
          key={`icon-${animationId}`}
          className="flex items-center justify-center"
          initial={
            animateIcon
              ? isAdding
                ? { scale: 0.25, rotate: -35, y: 5 }
                : { scale: 1.15, rotate: 10, y: 0 }
              : false
          }
          animate={
            animateIcon
              ? isAdding
                ? {
                    scale: [0.25, 1.48, 0.88, 1],
                    rotate: [-35, 18, -7, 0],
                    y: [5, -7, 2, 0],
                  }
                : {
                    scale: [1.15, 0.82, 1],
                    rotate: [10, -5, 0],
                    y: [0, 2, 0],
                  }
              : { scale: 1, rotate: 0, y: 0 }
          }
          transition={{
            duration: animateIcon ? (isAdding ? 0.58 : 0.3) : 0,
            ease: "easeOut",
            times: isAdding ? [0, 0.38, 0.72, 1] : [0, 0.5, 1],
          }}
        >
          {isLiked ? (
            <PiBasketballFill className="h-6 w-6 text-[#00821A]" />
          ) : (
            <PiBasketballLight className="h-6 w-6 text-[#00821A]" />
          )}
        </motion.span>
      </motion.button>

      {/* Particules au-dessus de la carte, jamais interactives. */}
      {showConfetti && (
        <span
          key={`burst-${animationId}`}
          className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
          aria-hidden="true"
        >
          {/* Onde lumineuse initiale, aux couleurs de Milos BG. */}
          <motion.span
            className="absolute h-7 w-7 rounded-full border-2 border-[#00821A]"
            initial={{ opacity: 0.75, scale: 0.4 }}
            animate={{ opacity: [0.75, 0.45, 0], scale: [0.4, 1.6, 3.2] }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />

          {PARTICLES.map((particle, index) => (
            <motion.span
              key={`${animationId}-${index}`}
              className="absolute flex items-center justify-center"
              style={{ width: particle.size, height: particle.size }}
              initial={{ opacity: 0, x: 0, y: 0, scale: 0.2, rotate: 0 }}
              animate={{
                opacity: [0, 1, 1, 0],
                x: [0, particle.x * 0.22, particle.x * 0.8, particle.x],
                y: [0, particle.y * 0.22, particle.y * 0.85, particle.y + 10],
                scale: [0.2, 1.28, 1, 0.55],
                rotate: [0, particle.rotation * 0.2, particle.rotation * 0.75, particle.rotation],
              }}
              transition={{
                duration: 0.82,
                delay: particle.delay,
                ease: [0.22, 1, 0.36, 1],
                times: [0, 0.18, 0.62, 1],
              }}
            >
              {particle.type === "basketball" ? (
                <PiBasketballFill
                  className="h-full w-full drop-shadow-sm"
                  style={{ color: index % 4 === 0 ? "#000000" : "#00821A" }}
                />
              ) : (
                <Image
                  src={GrindUntilAchieve2}
                  alt=""
                  width={particle.size}
                  height={particle.size}
                  loading="eager"
                  className="h-full w-full object-contain drop-shadow-[0_0_3px_rgba(0,130,26,0.55)]"
                />
              )}
            </motion.span>
          ))}
        </span>
      )}
    </div>
  );
};

export default BasketBall;
