import { useState, useEffect } from "react";
import type { Product, ToastPayload } from "../../types";

type Options = {
  onAddToCart?: (title: string, delta: number) => void;
  onShowToast?: (payload: ToastPayload) => void;
};

export function useProductsState(products: Product[], { onAddToCart, onShowToast }: Options = {}) {
  const [muted, setMuted] = useState<Record<string, boolean>>({});
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [lastChange, setLastChange] = useState<{
    delta: number;
    next: number;
    product: Product;
  } | null>(null);

  // 👇 Visas side-effect logikas dedam čia
  useEffect(() => {
    if (!lastChange) return;
    const { delta, next, product } = lastChange;

    if (delta !== 0) {
      onAddToCart?.(product.title, delta);

      if (delta > 0) {
        onShowToast?.({
          items: [{ title: product.title, qty: next, status: "added" }],
        });
      } else {
        const removed = Math.abs(delta);
        onShowToast?.({
          items: [{ title: product.title, qty: removed, status: "removed" }],
        });
      }
    }

    setLastChange(null); // resetinam
  }, [lastChange, onAddToCart, onShowToast]);

  const changeQty = (id: string, delta: number, product?: Product) => {
    setQuantities((prev) => {
      const current = prev[id] ?? 0;
      const next = Math.max(0, current + delta);

      if (product) {
        // 👇 užfiksuojam pakeitimą, bet ne render callback’o viduje kviečiam setState kitam componentui
        setLastChange({ delta, next, product });
      }

      return { ...prev, [id]: next };
    });
  };

  const toggleDislike = (id: string) => {
    setMuted((prev) => {
      const newMuted = !prev[id];
      if (newMuted) {
        const qty = quantities[id] ?? 0;
        if (qty > 0) {
          const product = products.find((p) => p.id === id);
          if (product) {
            setLastChange({ delta: -qty, next: 0, product });
          }
        }
        setQuantities((q) => ({ ...q, [id]: 0 }));
        setFavorites((f) => ({ ...f, [id]: false }));
      }
      return { ...prev, [id]: newMuted };
    });
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const newFav = !prev[id];
      if (newFav) setMuted((m) => ({ ...m, [id]: false }));
      return { ...prev, [id]: newFav };
    });
  };

  return { muted, favorites, quantities, changeQty, toggleDislike, toggleFavorite };
}
