/* eslint-disable @typescript-eslint/no-explicit-any */
import { create } from "zustand";
import { toast } from "react-hot-toast";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "@/lib/types";

// Cart uses store Product shape but requires price to be present
export type CartProduct = Product & { price: number };

interface CartItem {
  item: CartProduct;
  quantity: number;
  color?: string;
  size?: string;
}

interface CartStore {
  cartItems: CartItem[];
  addItem: (data: { item: Product | CartProduct; quantity: number; color?: string; size?: string }) => void;
  removeItem: (productId: string, color?: string, size?: string) => void;
  increaseQuantity: (productId: string, color?: string, size?: string) => void;
  decreaseQuantity: (productId: string, color?: string, size?: string) => void;
  clearCart: () => void;
}

// helper to check same line
const isSameLine = (a: CartItem, productId: string, color?: string, size?: string) =>
  a.item._id === productId &&
  a.color === color &&
  a.size === size;

const useCart = create(
  persist<CartStore>(
    (set, get) => ({
      cartItems: [],

      // Helper: find available stock for an item line (variant-aware)
      // If variants exist, prefer exact match (color+size). If only one dimension is provided,
      // match on that. If no match, treat as 0 stock.
      // Fallback to countInStock when variants are absent.
      

      addItem: (data) => {
        const { item, quantity, color, size } = data;
        // Normalize incoming product to a CartProduct with guaranteed numeric price
        const itemWithPrice: CartProduct = {
          ...(item as Product),
          price: Number((item as any)?.price ?? 0),
        } as CartProduct;
        const currentItems = get().cartItems;

        const existing = currentItems.find((ci) =>
          isSameLine(ci, itemWithPrice._id, color, size)
        );

        // Determine stock available for this selected variant/line
        const stock = (() => {
          const vars = itemWithPrice.variants ?? [];
          if (Array.isArray(vars) && vars.length > 0) {
            const match = vars.find((v) =>
              (v.color ?? "") === (color ?? "") && (v.size ?? "") === (size ?? "")
            )
            // If both selected, exact match; else try partial match when present
              || vars.find((v) => (color ? (v.color ?? "") === color : false) && (v.size ?? "") === "")
              || vars.find((v) => (size ? (v.size ?? "") === size : false) && (v.color ?? "") === "");
            return match ? Number(match.stock ?? 0) : 0;
          }
          return typeof itemWithPrice.countInStock === "number" ? itemWithPrice.countInStock : Infinity;
        })();

        if (stock <= 0) {
          toast.error("Out of stock");
          return;
        }

        if (existing) {
          // update quantity
          const desired = existing.quantity + quantity;
          if (desired > stock) {
            toast.error(`Only ${stock} left in stock`);
            return;
          }
          const next = currentItems.map((ci) =>
            isSameLine(ci, itemWithPrice._id, color, size)
              ? { ...ci, quantity: desired }
              : ci
          );
          set({ cartItems: next });
          toast.success("Item quantity updated");
          return;
        }

        const initialQty = Math.min(quantity, stock);
        if (initialQty <= 0) {
          toast.error("Out of stock");
          return;
        }
        set({
          cartItems: [...currentItems, { item: itemWithPrice, quantity: initialQty, color, size }],
        });
        toast.success("Item added to cart");
      },

      removeItem: (productId, color, size) => {
        const next = get().cartItems.filter(
          (ci) => !isSameLine(ci, productId, color, size)
        );
        set({ cartItems: next });
        toast.success("Item removed from cart");
      },

      increaseQuantity: (productId, color, size) => {
        const next = get().cartItems.map((ci) => {
          if (!isSameLine(ci, productId, color, size)) return ci;
          const vars = ci.item.variants ?? [];
          const stock = (() => {
            if (Array.isArray(vars) && vars.length > 0) {
              const match = vars.find((v) =>
                (v.color ?? "") === (color ?? "") && (v.size ?? "") === (size ?? "")
              );
              return match ? Number(match.stock ?? 0) : 0;
            }
            return typeof ci.item.countInStock === "number" ? ci.item.countInStock : Infinity;
          })();
          if (ci.quantity >= stock) {
            toast.error(`Only ${stock} left in stock`);
            return ci;
          }
          return { ...ci, quantity: ci.quantity + 1 };
        });
        set({ cartItems: next });
        toast.success("Item quantity increased");
      },

      decreaseQuantity: (productId, color, size) => {
        const next = get().cartItems.flatMap((ci) => {
          if (!isSameLine(ci, productId, color, size)) return ci;
          if (ci.quantity <= 1) return []; // remove line
          return { ...ci, quantity: ci.quantity - 1 };
        });
        set({ cartItems: next });
        toast.success("Item quantity decreased");
      },

      clearCart: () => {
        set({ cartItems: [] });
        toast.success("Cart cleared");
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useCart;
