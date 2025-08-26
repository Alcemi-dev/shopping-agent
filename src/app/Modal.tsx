import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onBack?: () => void;
  title: string;
  children: ReactNode;
  mode?: "default" | "answer";
};

function withResponsiveBreaks(text: string) {
  const m = text.match(/^(.*?\bare you)\s+(looking)\b(.*)$/i);
  if (!m) return text;
  const before = m[1];
  const looking = m[2];
  const after = m[3];
  return (
    <>
      {before}
      <span className="break--mobile" aria-hidden="true">
        <br />
      </span>{" "}
      {looking}{" "}
      <span className="break--desktop" aria-hidden="true">
        <br />
      </span>
      {after.trimStart()}
    </>
  );
}

// Pagal WCAG: visi fokusinami elementai modalo viduje
function getFocusable(root: HTMLElement): HTMLElement[] {
  const selector = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    '[tabindex]:not([tabindex="-1"])',
  ].join(", ");
  const list = Array.from(root.querySelectorAll<HTMLElement>(selector));
  // atmesti paslėptus / neaktyvius
  return list.filter((el) => {
    const style = window.getComputedStyle(el);
    if (style.visibility === "hidden" || style.display === "none") return false;
    if (el.hasAttribute("inert") || el.getAttribute("aria-hidden") === "true") return false;
    return true;
  });
}

export default function Modal({ open, onClose, onBack, title, children, mode = "default" }: Props) {
  const [show, setShow] = useState(open);

  // a11y: prisiminti atidarytoją ir grąžinti fokusą uždarius
  const openerRef = useRef<HTMLElement | null>(null);
  // a11y: fokusuoti dialogo panelę atidarius + naudoti focus trap
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Mount/unmount pagal `open`
  useEffect(() => {
    if (open) setShow(true);
    else if (show) setShow(false);
  }, [open, show]);

  // Uždarant — grąžinti fokusą į atidariusį elementą (jei jis dar DOM)
  useEffect(() => {
    if (open) {
      openerRef.current = (document.activeElement as HTMLElement) ?? null;

      // Fokusuojam panelę, kad TAB pradėtų nuo modalo konteksto
      requestAnimationFrame(() => {
        panelRef.current?.focus?.();
      });

      // Užrakinti fono scroll'ą
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = prev;
      };
    } else {
      if (openerRef.current && document.contains(openerRef.current)) {
        openerRef.current.focus?.();
      }
      openerRef.current = null;
    }
  }, [open]);

  // ESC uždarymas kai atidaryta
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Focus trap: TAB/Shift+TAB ciklas tik modalo viduje
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const root = panelRef.current;
      if (!root) return;

      const focusables = getFocusable(root);
      if (focusables.length === 0) {
        e.preventDefault();
        root.focus();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;
      const isInside = !!active && root.contains(active);

      if (e.shiftKey) {
        // Shift+Tab nuo pirmo arba nuo išorės → į paskutinį
        if (!isInside || active === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab nuo paskutinio → į pirmą
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown, true); // capture fazė
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [open]);

  if (!show) return null;

  // a11y: jei antraštė nerodoma (answer mode), naudokime aria-label vietoj aria-labelledby
  const labelProps = mode === "answer" ? { "aria-label": title } : { "aria-labelledby": "modal-title" };

  return (
    <div id="ai-modal" className="modal-root open" role="dialog" aria-modal="true" {...labelProps} onClick={onClose}>
      <div className="backdrop" />
      <div className="modal-card" onClick={(e) => e.stopPropagation()} ref={panelRef} tabIndex={-1}>
        <div className="modal-ctr">
          <div className="modal-head" role="toolbar" aria-label="AI modal navigation">
            <button type="button" className="head-logo-mobile" aria-label="Back" onClick={onBack ?? onClose}>
              <img src="/img/logo-mobile.svg" alt="Alcemi" />
            </button>

            <button className="icon-btn head-back" aria-label="Back" onClick={onBack ?? onClose}>
              <img src="/img/back.svg" alt="" aria-hidden="true" />
            </button>

            <div className="head-spacer" aria-hidden />

            <button className="icon-btn head-close" aria-label="Close" onClick={onClose}>
              <img src="/img/close.svg" alt="" aria-hidden="true" />
            </button>
          </div>

          <div className={`modal-col ${mode === "answer" ? "is-answer" : ""}`}>
            {mode !== "answer" && (
              <h1 id="modal-title" className="modal-title">
                {withResponsiveBreaks(title)}
              </h1>
            )}
            <div className="modal-body">{children}</div>
          </div>

          <div className="modal-footer">
            <img className="powered-by" src="/img/logo-desktop.svg" alt="Powered by Alcemi" />
          </div>
        </div>
      </div>
    </div>
  );
}
