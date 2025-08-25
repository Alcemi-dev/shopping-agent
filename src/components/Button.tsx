import React, { forwardRef } from "react";

type Variant = "primary" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

type Common = {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

type ButtonProps =
  | (Common & React.ButtonHTMLAttributes<HTMLButtonElement> & { as?: "button" })
  | (Common & React.AnchorHTMLAttributes<HTMLAnchorElement> & { as: "a" });

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      as = "button",
      variant = "primary",
      size = "md",
      fullWidth,
      leadingIcon,
      trailingIcon,
      className = "",
      children,
      ...rest
    },
    ref
  ) => {
    const Comp: any = as;
    const cls = ["u-btn", `u-btn--${variant}`, `u-btn--${size}`, fullWidth ? "u-btn--block" : "", className]
      .filter(Boolean)
      .join(" ");

    return (
      <Comp ref={ref} className={cls} {...(rest as any)}>
        {leadingIcon && (
          <span className="u-btn__icon" aria-hidden>
            {leadingIcon}
          </span>
        )}
        <span className="u-btn__label">{children}</span>
        {trailingIcon && (
          <span className="u-btn__icon u-btn__icon--right" aria-hidden>
            {trailingIcon}
          </span>
        )}
      </Comp>
    );
  }
);

export default Button;
