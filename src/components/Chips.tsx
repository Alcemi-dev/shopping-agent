import { useEffect, useRef, forwardRef } from "react";
import { useDragScroll } from "../hooks/useDragScroll";

export type ChipItem = string | { label: string; value: string; disabled?: boolean };

function getLabel(it: ChipItem) {
  return typeof it === "string" ? it : it.label;
}
function getValue(it: ChipItem) {
  return typeof it === "string" ? it : it.value ?? it.label;
}

type Props = {
  items: ChipItem[];
  onPick?: (val: string) => void;
  onSelect?: (val: string, item: ChipItem) => void;
  className?: string;
};

const Chips = forwardRef<HTMLDivElement, Props>(({ items, onPick, onSelect, className }, ref) => {
  const wrapRef = useRef<HTMLDivElement>(null);

  // drag hook
  useDragScroll(wrapRef);

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
      ref={(node) => {
        wrapRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) (ref as any).current = node;
      }}
      className={`chips-inline${className ? ` ${className}` : ""}`}
      role="list"
      tabIndex={0}
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
              if (disabled) return;
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
});

export default Chips;
