import { useEffect } from "react";
import type { RefObject } from "react";

export function useDragScroll(ref: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    const down = (e: MouseEvent) => {
      isDown = true;
      startX = e.pageX;
      scrollLeft = el.scrollLeft;
      el.style.cursor = "grabbing";
      console.log(">>> mousedown", startX, scrollLeft);
    };

    const up = () => {
      if (!isDown) return;
      isDown = false;
      el.style.cursor = "grab";
      console.log(">>> mouseup");
    };

    const move = (e: MouseEvent) => {
      if (!isDown) return;
      const walk = e.pageX - startX;
      el.scrollLeft = scrollLeft - walk;
      console.log(">>> mousemove", e.pageX, "scrollLeft:", el.scrollLeft);
    };

    el.addEventListener("mousedown", down);
    window.addEventListener("mouseup", up);
    window.addEventListener("mousemove", move);

    el.style.cursor = "grab";

    return () => {
      el.removeEventListener("mousedown", down);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("mousemove", move);
    };
  }, [ref]);
}
