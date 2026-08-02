"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { deliveryFor } from "./format";

export { DELIVERY_FEE, FREE_DELIVERY_THRESHOLD, deliveryFor } from "./format";

export type CartItem = {
  /** Unique line key: product id + size (a product in two sizes = two lines). */
  key: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  swatch: [string, string];
  image?: string;
  size?: string;
  qty: number;
};

export type AddPayload = {
  id: string;
  slug: string;
  name: string;
  price: number;
  swatch: [string, string];
  image?: string;
  size?: string;
  qty?: number;
};

type CartContextValue = {
  items: CartItem[];
  count: number;
  subtotal: number;
  delivery: number;
  total: number;
  hydrated: boolean;
  addItem: (payload: AddPayload) => void;
  removeItem: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "abdmall:cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount — keeps SSR and the first client render identical
  // (empty). This is a deliberate external-store sync: localStorage is
  // unavailable during SSR, so it must happen here rather than in an initializer.
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore malformed storage */
    }
    setHydrated(true);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = (payload: AddPayload) => {
    const key = payload.size ? `${payload.id}__${payload.size}` : payload.id;
    const qty = payload.qty ?? 1;
    setItems((prev) => {
      const existing = prev.find((i) => i.key === key);
      if (existing) {
        return prev.map((i) =>
          i.key === key ? { ...i, qty: Math.min(10, i.qty + qty) } : i,
        );
      }
      return [
        ...prev,
        {
          key,
          productId: payload.id,
          slug: payload.slug,
          name: payload.name,
          price: payload.price,
          swatch: payload.swatch,
          image: payload.image,
          size: payload.size,
          qty,
        },
      ];
    });
  };

  const removeItem = (key: string) =>
    setItems((prev) => prev.filter((i) => i.key !== key));

  const setQty = (key: string, qty: number) =>
    setItems((prev) =>
      prev.map((i) =>
        i.key === key ? { ...i, qty: Math.max(1, Math.min(10, qty)) } : i,
      ),
    );

  const clear = () => setItems([]);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
    const delivery = deliveryFor(subtotal);
    return {
      items,
      count: items.reduce((sum, i) => sum + i.qty, 0),
      subtotal,
      delivery,
      total: subtotal + delivery,
      hydrated,
      addItem,
      removeItem,
      setQty,
      clear,
    };
  }, [items, hydrated]);

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
