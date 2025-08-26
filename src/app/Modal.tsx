import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import "../styles/modal.css";

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

export default function Modal({ open, onClose, onBack, title, children, mode = "default" }: Props) {
  const [show, setShow] = useState(open);

  // Mount/unmount pagal `open`
  useEffect(() => {
    if (open) setShow(true);
    else if (show) setShow(false);
  }, [open, show]);

  // ESC uždarymas kai atidaryta
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!show) return null;

  return (
    <div
      id="ai-modal"
      className="modal-root open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      onClick={onClose}
    >
      <div className="backdrop" />
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
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
