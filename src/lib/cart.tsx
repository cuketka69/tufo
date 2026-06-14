import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { Product } from "@/lib/eshop-types";

export type CartItem = { p: Product; qty: number };

type CartContextValue = {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (p: Product, qty?: number) => void;
  clear: () => void;
  total: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "tufo-cart";

function load(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(load);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      /* ignore */
    }
  }, [cart]);

  const addToCart = (p: Product, qty = 1) =>
    setCart((c) => {
      const ex = c.find((x) => x.p.id === p.id);
      if (ex) return c.map((x) => (x.p.id === p.id ? { ...x, qty: x.qty + qty } : x));
      return [...c, { p, qty }];
    });

  const clear = () => setCart([]);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      setCart,
      addToCart,
      clear,
      total: cart.reduce((s, x) => s + x.p.price * x.qty, 0),
      count: cart.reduce((s, x) => s + x.qty, 0),
    }),
    [cart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
