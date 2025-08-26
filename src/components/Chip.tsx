import React from "react";

type Size = "sm" | "md";
type Variant = "default" | "soft" | "outline";

type Props = {
  children: React.ReactNode;
  selected?: boolean;
  disabled?: boolean;
  size?: Size;
  variant?: Variant;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void; // ⬅️ leisk event
  className?: string;
};

export default function Chip({
  children,
  selected = false,
  disabled = false,
  size = "md",
  variant = "default",
  onClick,
  className = "",
}: Props) {
  const cls = ["u-chip", `u-chip--${size}`, `u-chip--${variant}`, selected ? "is-selected" : "", className]
    .filter(Boolean)
    .join(" ");

  return (
    <button
      type="button"
      className={cls}
      disabled={disabled}
      aria-pressed={selected}
      data-selected={selected ? "" : undefined}
      onClick={onClick}
    >
      <span className="u-chip__label">{children}</span>
    </button>
  );
}
