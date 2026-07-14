"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type CartLine = {
  id: string;
  name: string;
  price: number;
  emoji: string;
  imageUrl?: string | null;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  totalItems: number;
  subtotal: number;
  addItem: (item: Omit<CartLine, "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  getQty: (id: string) => number;
  clearCart: () => void;
  ready: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "sunnys-kitchen-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  // Load persisted cart once on mount (client only, avoids hydration mismatch).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // ignore corrupt storage
    } finally {
      setReady(true);
    }
  }, []);

  // Persist on every change, after the initial load has completed.
  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // ignore write failures (private browsing, quota, etc.)
    }
  }, [lines, ready]);

  function addItem(item: Omit<CartLine, "qty">, qty = 1) {
    setLines((prev) => {
      const existing = prev.find((l) => l.id === item.id);
      if (existing) {
        return prev.map((l) =>
          l.id === item.id ? { ...l, qty: l.qty + qty } : l
        );
      }
      return [...prev, { ...item, qty }];
    });
  }

  function removeItem(id: string) {
    setLines((prev) => prev.filter((l) => l.id !== id));
  }

  function setQty(id: string, qty: number) {
    if (qty <= 0) {
      removeItem(id);
      return;
    }
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, qty } : l)));
  }

  function getQty(id: string) {
    return lines.find((l) => l.id === id)?.qty ?? 0;
  }

  function clearCart() {
    setLines([]);
  }

  const totalItems = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty, 0),
    [lines]
  );
  const subtotal = useMemo(
    () => lines.reduce((sum, l) => sum + l.qty * l.price, 0),
    [lines]
  );

  return (
    <CartContext.Provider
      value={{
        lines,
        totalItems,
        subtotal,
        addItem,
        removeItem,
        setQty,
        getQty,
        clearCart,
        ready,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside a CartProvider");
  return ctx;
}
