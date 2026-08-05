import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { deliveryFor, type AddPayload, type CartItem } from "@abdmall/core";

/**
 * Mobile cart — Context + AsyncStorage, mirroring the web CartProvider. Types
 * are shared from @abdmall/core so a line looks identical on both platforms.
 */

type CartValue = {
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

const CartContext = createContext<CartValue | null>(null);
const STORAGE_KEY = "abdmall:cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load once on mount from AsyncStorage.
  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setItems(JSON.parse(raw) as CartItem[]);
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  // Persist on change (after the initial load).
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items)).catch(() => {});
  }, [items, hydrated]);

  const value = useMemo<CartValue>(() => {
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

export function useCart(): CartValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
