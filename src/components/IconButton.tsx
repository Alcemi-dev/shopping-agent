import React from "react";

type Size = "sm" | "md" | "lg";
type Variant = "primary" | "ghost" | "outline";

type Props = {
  label: string; // a11y: aria-label (must)
  size?: Size;
  variant?: Variant;
  className?: string;
  children: React.ReactNode; // icon node
} & React.ButtonHTMLAttributes<HTMLButtonElement>;

export default function IconButton({
  label,
  size = "md",
  variant = "ghost",
  className = "",
  children,
  ...rest
}: Props) {
  const cls = ["u-iconbtn", `u-iconbtn--${size}`, `u-iconbtn--${variant}`, className].filter(Boolean).join(" ");
  return (
    <button type="button" aria-label={label} className={cls} {...rest}>
      {children}
    </button>
  );
}
