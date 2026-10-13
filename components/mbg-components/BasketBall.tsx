"use client";

import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PiBasketballFill, PiBasketballLight } from "react-icons/pi";

import { GrindUntilAchieve2 } from "@/images";
import type { Product, User } from "@/lib/types";
import styles from "./BasketBall.module.css";

interface BasketballProps {
  product: Product;
  updateSignedInUser?: (updatedUser: User) => void;
}

type Particle = {
  kind: "basketball" | "logo";
  x: number;
  y: number;
  rotation: number;
  size: number;
  delay: number;
};

// Positions en pixels autour du bouton. Un même motif alterne ballon/logo G.U.A.
const PARTICLES: Particle[] = [
  { kind: "basketball", x: -62, y: -35, rotation: -310, size: 15, delay: 0 },
  { kind: "logo", x: -37, y: -68, rotation: -220, size: 18, delay: 40 },
  { kind: "basketball", x: -4, y: -75, rotation: 290, size: 14, delay: 20 },
  { kind: "logo", x: 34, y: -64, rotation: 210, size: 18, delay: 80 },
  { kind: "basketball", x: 63, y: -34, rotation: 340, size: 15, delay: 30 },
  { kind: "logo", x: 73, y: 2, rotation: -280, size: 17, delay: 70 },
  { kind: "basketball", x: 55, y: 42, rotation: 300, size: 14, delay: 50 },
  { kind: "logo", x: 22, y: 65, rotation: -200, size: 17, delay: 100 },
  { kind: "basketball", x: -17, y: 64, rotation: 280, size: 15, delay: 70 },
  { kind: "logo", x: -51, y: 43, rotation: 240, size: 18, delay: 40 },
  { kind: "basketball", x: -73, y: 8, rotation: -300, size: 13, delay: 90 },
  { kind: "logo", x: 9, y: -47, rotation: 180, size: 14, delay: 110 },
];

function isInWishlist(wishlist: unknown, productId: Product["_id"]): boolean {
  return (
    Array.isArray(wishlist) &&
    wishlist.some((id: unknown) => String(id) === String(productId))
  );
}

export default function BasketBall({
  product,
  updateSignedInUser,
}: BasketballProps) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkingWishlist, setCheckingWishlist] = useState(false);
  const [effect, setEffect] = useState<{
    key: number;
    kind: "like" | "unlike";
    x: number;
    y: number;
  } | null>(null);

  const buttonRef = useRef<HTMLButtonElement>(null);
  const sequence = useRef(0);
  const activeRequest = useRef(false);
  const effectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (effectTimer.current) clearTimeout(effectTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!user?.id) {
      setIsLiked(false);
      setCheckingWishlist(false);
      return;
    }

    const controller = new AbortController();
    let active = true;

    const loadWishlist = async () => {
      setCheckingWishlist(true);
      try {
        const response = await fetch("/api/users", {
          signal: controller.signal,
          cache: "no-store",
        });
        if (!response.ok) throw new Error(`Wishlist GET: ${response.status}`);
        const data = await response.json();
        if (active) setIsLiked(isInWishlist(data?.wishlist, product._id));
      } catch (error) {
        if (!controller.signal.aborted) console.error("[users_GET]", error);
      } finally {
        if (active) setCheckingWishlist(false);
      }
    };

    void loadWishlist();
    return () => {
      active = false;
      controller.abort();
    };
  }, [user?.id, product._id]);

  const playEffect = (kind: "like" | "unlike") => {
    if (effectTimer.current) clearTimeout(effectTimer.current);
    sequence.current += 1;
    const key = sequence.current;
    // Position réelle du bouton dans la fenêtre. Le portail évite le recadrage
    // de la ProductCard sans libérer le balayage lumineux de son conteneur.
    const bounds = buttonRef.current?.getBoundingClientRect();
    setEffect({
      key,
      kind,
      x: bounds ? bounds.left + bounds.width / 2 : 0,
      y: bounds ? bounds.top + bounds.height / 2 : 0,
    });
    effectTimer.current = setTimeout(() => {
      setEffect((current) => (current?.key === key ? null : current));
    }, 1050);
  };

  const handleLike = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!isLoaded || activeRequest.current || loading || checkingWishlist) return;

    if (!user) {
      router.push("/sign-in");
      return;
    }

    const wasLiked = isLiked;
    const nextLiked = !wasLiked;
    activeRequest.current = true;
    setLoading(true);
    setIsLiked(nextLiked); // Animation immédiate sans attendre le serveur.
    playEffect(nextLiked ? "like" : "unlike");

    try {
      const response = await fetch("/api/users/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product._id }),
      });
      if (!response.ok) throw new Error(`Wishlist POST: ${response.status}`);
      const updatedUser: User = await response.json();
      setIsLiked(isInWishlist(updatedUser.wishlist, product._id));
      updateSignedInUser?.(updatedUser);
    } catch (error) {
      console.error("[wishlist_POST]", error);
      setIsLiked(wasLiked);
      if (effectTimer.current) clearTimeout(effectTimer.current);
      setEffect(null);
    } finally {
      activeRequest.current = false;
      setLoading(false);
    }
  };

  const busy = loading || checkingWishlist || !isLoaded;

  return (
    <div className={styles.root}>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleLike}
        disabled={busy}
        aria-pressed={isLiked}
        aria-busy={busy}
        aria-label={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
        title={isLiked ? "Retirer des favoris" : "Ajouter aux favoris"}
        className={styles.button}
      >
        <span
          key={effect?.key ?? "idle"}
          className={`${styles.icon} ${
            effect?.kind === "like"
              ? styles.iconLike
              : effect?.kind === "unlike"
                ? styles.iconUnlike
                : ""
          }`}
        >
          {isLiked ? (
            <PiBasketballFill className="h-6 w-6" />
          ) : (
            <PiBasketballLight className="h-6 w-6" />
          )}
        </span>
      </button>

      {effect?.kind === "like" && typeof document !== "undefined" && createPortal(
        <span
          key={`burst-${effect.key}`}
          className={styles.burst}
          style={{ left: effect.x, top: effect.y }}
          aria-hidden="true"
        >
          <span className={styles.ring} />
          {PARTICLES.map((particle, index) => (
            <span key={index} className={styles.origin}>
              <span
                className={styles.particle}
                style={
                  {
                    width: particle.size,
                    height: particle.size,
                    marginLeft: -particle.size / 2,
                    marginTop: -particle.size / 2,
                    "--mid-x": `${Math.round(particle.x * 0.7)}px`,
                    "--mid-y": `${Math.round(particle.y * 0.7)}px`,
                    "--end-x": `${particle.x}px`,
                    "--end-y": `${particle.y + 10}px`,
                    "--spin": `${particle.rotation}deg`,
                    "--delay": `${particle.delay}ms`,
                  } as React.CSSProperties
                }
              >
                {particle.kind === "basketball" ? (
                  <PiBasketballFill
                    className="h-full w-full"
                    style={{ color: index % 4 === 0 ? "#000000" : "#00821A" }}
                  />
                ) : (
                  <Image
                    src={GrindUntilAchieve2}
                    alt=""
                    width={particle.size}
                    height={particle.size}
                    className="h-full w-full object-contain"
                    unoptimized
                  />
                )}
              </span>
            </span>
          ))}
        </span>,
        document.body,
      )}
    </div>
  );
}
