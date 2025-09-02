import { useRef } from "react";

export function OverlayAnchor({ height = 260 }: { height?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={ref}
      data-overlay-anchor
      style={{ height, pointerEvents: "none" }} // 👈 inline apsauga
      aria-hidden="true"
    />
  );
}
