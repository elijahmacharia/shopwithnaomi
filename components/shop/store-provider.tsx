"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

type CartLine = { productId: string; quantity: number };
type Wish = { productId: string; savedPrice: string };

type StoreValue = {
  cart: CartLine[];
  wishlist: Wish[];
  addToCart: (productId: string, quantity?: number, stock?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string, price: string) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
};

const StoreContext = createContext<StoreValue | null>(null);
const CART_KEY = "naome.cart";
const WISH_KEY = "naome.wishlist";

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }
  try {
    const value = window.localStorage.getItem(key);
    return value ? (JSON.parse(value) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<Wish[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setCart(read(CART_KEY, []));
    setWishlist(read(WISH_KEY, []));
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    }
  }, [cart, ready]);

  useEffect(() => {
    if (ready) {
      window.localStorage.setItem(WISH_KEY, JSON.stringify(wishlist));
    }
  }, [wishlist, ready]);

  const value = useMemo<StoreValue>(
    () => ({
      cart,
      wishlist,
      addToCart(productId, quantity = 1, stock) {
        setCart((current) => {
          const existing = current.find((line) => line.productId === productId);
          const nextQuantity = (existing?.quantity ?? 0) + quantity;
          if (stock !== undefined && nextQuantity > stock) {
            toast.error(stock <= 0 ? "This product is out of stock." : `Only ${stock} units are available.`);
            return current;
          }
          toast.success("Added to cart.");
          if (!existing) {
            return [...current, { productId, quantity }];
          }
          return current.map((line) => (line.productId === productId ? { ...line, quantity: nextQuantity } : line));
        });
      },
      setQuantity(productId, quantity) {
        setCart((current) => (quantity <= 0 ? current.filter((line) => line.productId !== productId) : current.map((line) => (line.productId === productId ? { ...line, quantity } : line))));
      },
      removeFromCart(productId) {
        setCart((current) => current.filter((line) => line.productId !== productId));
      },
      clearCart() {
        setCart([]);
      },
      toggleWishlist(productId, price) {
        setWishlist((current) => {
          const exists = current.some((item) => item.productId === productId);
          toast.success(exists ? "Removed from wishlist." : "Added to wishlist.");
          return exists ? current.filter((item) => item.productId !== productId) : [...current, { productId, savedPrice: price }];
        });
      },
      removeFromWishlist(productId) {
        setWishlist((current) => current.filter((item) => item.productId !== productId));
        toast.success("Removed from wishlist.");
      },
      isInWishlist(productId) {
        return wishlist.some((item) => item.productId === productId);
      },
      clearWishlist() {
        setWishlist([]);
      },
    }),
    [cart, wishlist],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const value = useContext(StoreContext);
  if (!value) {
    throw new Error("Store provider is missing.");
  }
  return value;
}
