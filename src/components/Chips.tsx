import { useEffect, useRef, useState } from "react";
import { useDragScroll } from "../hooks/useDragScroll";

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
  onPick?: (val: string) => void; // SENAS API
  onSelect?: (val: string, item: ChipItem) => void; // NAUJAS API
  className?: string;
};

export default function Chips({ items, onPick, onSelect, className }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [wasDrag, setWasDrag] = useState(false);

  // bendras drag scroll hook’as (pele + touch)
  useDragScroll(wrapRef);

  // blur hack (kad focus nepaliktų ant chip)
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
      onPointerDown={() => setWasDrag(false)}
      onPointerMove={() => setWasDrag(true)}
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
              if (wasDrag || disabled) return; // jeigu buvo drag, click nevykdom
              onPick?.(value);
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
