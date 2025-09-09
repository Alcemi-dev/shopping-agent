import { useEffect, useState, useRef } from "react";

export function useProductsResize(
  productsRef: React.RefObject<HTMLElement | null>,
  inputRef: React.RefObject<HTMLElement | null>,
  productCount: number
) {
  const [isNarrow, setIsNarrow] = useState(false);
  const lastState = useRef(false);

  useEffect(() => {
    if (productCount <= 1) {
      setIsNarrow(false);
      return;
    }
    if (!productsRef.current || !inputRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const ratio = entry.intersectionRatio;

        // hysteresis: tik keičiam būseną jei stipriai pasikeitė
        if (!lastState.current && ratio < 0.93) {
          lastState.current = true;
          setIsNarrow(true);
        }
        if (!lastState.current && ratio < 0.93) {
          setTimeout(() => {
            lastState.current = true;
            setIsNarrow(true);
          }, 50);
        } else if (lastState.current && ratio > 0.97) {
          lastState.current = false;
          setIsNarrow(false);
        }
      },
      {
        root: document.querySelector(".chat-log"),
        threshold: Array.from({ length: 101 }, (_, i) => i / 100), // 0,01 -> 1.0
      }
    );

    observer.observe(productsRef.current);
    return () => observer.disconnect();
  }, [productsRef, inputRef, productCount]);

  return isNarrow;
}
