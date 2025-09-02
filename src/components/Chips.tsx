import { useEffect, useRef } from "react";

/** Galima paduoti tiesiog string'ą arba struktūrą su label/value */
export type ChipItem = string | { label: string; value: string; disabled?: boolean };

function getLabel(it: ChipItem) {
  return typeof it === "string" ? it : it.label;
}
function getValue(it: ChipItem) {
  return typeof it === "string" ? it : it.value ?? it.label;
}

type Props = {
  items: ChipItem[];
  /** SENAS API: palikta suderinamumui (nelaikoma privaloma) */
  onPick?: (val: string) => void;
  /** NAUJAS API: patogesnis „no products/actions“ naudojimui */
  onSelect?: (val: string, item: ChipItem) => void;
  /** (optional) papildomos klasės, jei kada prireiktų kitur */
  className?: string;
};

export default function Chips({ items, onPick, onSelect, className }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);

  const dragging = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);

  useEffect(() => {
    const onDown = (e: PointerEvent) => {
      const w = wrapRef.current;
      if (w && !w.contains(e.target as Node)) {
        const ae = document.activeElement as HTMLElement | null;
        if (ae?.classList.contains("chip")) ae.blur();
      }
    };
    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`chips-inline${className ? ` ${className}` : ""}`}
      role="list"
      tabIndex={0}
      onKeyDown={(e) => {
        const el = wrapRef.current;
        if (!el) return;
        if (e.key === "ArrowRight") {
          el.scrollBy({ left: 120, behavior: "smooth" });
          e.preventDefault();
        }
        if (e.key === "ArrowLeft") {
          el.scrollBy({ left: -120, behavior: "smooth" });
          e.preventDefault();
        }
      }}
      onPointerDown={(e) => {
        if (e.pointerType === "mouse") return;
        const el = wrapRef.current;
        if (!el) return;
        dragging.current = false;
        startX.current = e.clientX;
        startScroll.current = el.scrollLeft;
        (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
        el.classList.add("is-dragging");
      }}
      onPointerMove={(e) => {
        if (e.pointerType === "mouse") return;
        const el = wrapRef.current;
        if (!el || !el.classList.contains("is-dragging")) return;
        const dx = e.clientX - startX.current;
        if (Math.abs(dx) > 12) dragging.current = true;
        el.scrollLeft = startScroll.current - dx;
        e.preventDefault();
      }}
      onPointerUp={(e) => {
        if (e.pointerType === "mouse") return;
        wrapRef.current?.classList.remove("is-dragging");
        (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
        requestAnimationFrame(() => (dragging.current = false));
      }}
      onPointerCancel={(e) => {
        if (e.pointerType === "mouse") return;
        wrapRef.current?.classList.remove("is-dragging");
        (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
        dragging.current = false;
      }}
    >
      {items.map((item) => {
        const label = getLabel(item);
        const value = getValue(item);
        const disabled = typeof item === "string" ? false : !!item.disabled;

        return (
          <button
            key={value}
            type="button"
            className="chip"
            role="listitem"
            disabled={disabled}
            onClick={(e) => {
              if (dragging.current || disabled) return;
              // palaikome SENĄ API
              onPick?.(value);
              // ir NAUJĄ API
              onSelect?.(value, item);
              (e.currentTarget as HTMLButtonElement).focus({ preventScroll: true });
            }}
          >
            <span className="u-chip__label">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
