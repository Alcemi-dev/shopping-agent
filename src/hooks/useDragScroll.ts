import { useEffect } from "react";

export function useDragScroll<T extends HTMLElement>(ref: React.RefObject<T | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let dragging = false;
    let startX = 0;
    let startScrollLeft = 0;

    const cancelDrag = (e?: Event) => {
      if (!dragging) return;
      dragging = false;
      el.classList.remove("is-dragging");
      // jei buvo pointer capture – paleidžiam
      // @ts-expect-error TS nežino apie optional
      e?.pointerId && (el as HTMLElement).releasePointerCapture?.((e as PointerEvent).pointerId);
    };

    const onPointerDown = (e: PointerEvent) => {
      // pele – tik left click
      if (e.pointerType === "mouse" && e.button !== 0) return;
      dragging = true;
      startX = e.clientX;
      startScrollLeft = el.scrollLeft;
      el.classList.add("is-dragging");
      (el as HTMLElement).setPointerCapture?.(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      el.scrollLeft = startScrollLeft - dx;
    };

    const onPointerUp = (e: PointerEvent) => cancelDrag(e);
    const onPointerCancel = (e: PointerEvent) => cancelDrag(e);

    // Saugikliai: jei tab’as pasidaro hidden / langas praranda fokusą – išeinam iš drag
    const onVisibility = () => cancelDrag();
    const onBlur = () => cancelDrag();

    // Elemento listeneriai
    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerCancel);

    // Dokumento/lango listeneriai (failsafe)
    document.addEventListener("pointerup", onPointerUp);
    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("pagehide", onVisibility);

    return () => {
      // Elemento cleanup
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerCancel);

      // Dokumento/lango cleanup
      document.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", onVisibility);
    };
    // ⬇️ jei ref.current pasikeičia, efektas atsikabins nuo seno ir prisikabins prie naujo
  }, [ref.current]);
}
