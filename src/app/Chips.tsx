import { useEffect, useRef } from "react";

type Props = { items: string[]; onPick: (val: string) => void };

export default function Chips({ items, onPick }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);

  const dragging = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);

  // nuimam focus nuo chip, kai spaudžiama už ribų
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
      className="suggestions"
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
        // Drag įjungiam tik touch/pen — ant mouse leidžiam normalų click
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
        // didesnis slenkstis, kad „netyčia“ neužsitriggerintų
        if (Math.abs(dx) > 12) dragging.current = true;
        el.scrollLeft = startScroll.current - dx;
        e.preventDefault();
      }}
      onPointerUp={(e) => {
        if (e.pointerType === "mouse") return;
        wrapRef.current?.classList.remove("is-dragging");
        (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
        // atstatom po click įvykdymo
        requestAnimationFrame(() => (dragging.current = false));
      }}
      onPointerCancel={(e) => {
        if (e.pointerType === "mouse") return;
        wrapRef.current?.classList.remove("is-dragging");
        (e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId);
        dragging.current = false;
      }}
    >
      {items.map((label) => (
        <button
          key={label}
          className="chip"
          role="listitem"
          type="button"
          onClick={(e) => {
            if (dragging.current) return;
            onPick(label);
            e.currentTarget.focus({ preventScroll: true });
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
