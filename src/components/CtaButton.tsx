import type { FC, ButtonHTMLAttributes } from "react";
import "../styles/explain.css"; // gali išskirti css arba naudoti tą patį

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
};

const CtaButton: FC<Props> = ({ children, ...rest }) => {
  return (
    <button type="button" className="explain-cta" {...rest}>
      {children}
    </button>
  );
};

export default CtaButton;
