import { useEffect } from "react";

export function useDragScroll<T extends HTMLElement>(ref: React.RefObject<T | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let dragging = false;
    let startX = 0;
    let startScrollLeft = 0;

    const cancelDrag = (e?: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("is-dragging");
      if (e) (el as HTMLElement).releasePointerCapture?.(e.pointerId);
    };

    const onPointerDown = (e: PointerEvent) => {
      dragging = false;
      startX = e.clientX;
      startScrollLeft = el.scrollLeft;
    };

    const onPointerMove = (e: PointerEvent) => {
      const dx = e.clientX - startX;
      if (!dragging && Math.abs(dx) > 10) {
        dragging = true;
        el.classList.add("is-dragging");
        (el as HTMLElement).setPointerCapture?.(e.pointerId);
      }
      if (dragging) {
        el.scrollLeft = startScrollLeft - dx;
        e.preventDefault();
      }
    };

    const onPointerUp = (e: PointerEvent) => cancelDrag(e);
    const onPointerCancel = (e: PointerEvent) => cancelDrag(e);

    const onVisibility = () => cancelDrag();
    const onBlur = () => cancelDrag();

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerCancel);

    document.addEventListener("pointerup", onPointerUp);
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onVisibility);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerCancel);

      document.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onVisibility);
    };
  }, [ref.current]);
}
