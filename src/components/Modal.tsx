import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

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
  const [_, before, looking, after] = m;
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
  const dlgRef = useRef<HTMLDialogElement | null>(null);

  // atidarymas/uždarymas per showModal/close
  useEffect(() => {
    const dlg = dlgRef.current;
    if (!dlg) return;
    if (open && !dlg.open) {
      dlg.showModal();
    } else if (!open && dlg.open) {
      dlg.close();
    }
  }, [open]);

  // Esc → onClose (dialog 'cancel' įvykis)
  useEffect(() => {
    const dlg = dlgRef.current;
    if (!dlg) return;
    const onCancel = (e: Event) => {
      e.preventDefault();
      onClose();
    };
    dlg.addEventListener("cancel", onCancel);
    return () => dlg.removeEventListener("cancel", onCancel);
  }, [onClose]);

  const labelProps = mode === "answer" ? { "aria-label": title } : { "aria-labelledby": "modal-title" };

  return (
    <dialog
      ref={dlgRef}
      className="modal-root"
      {...labelProps}
      onClick={onClose} // click ant backdrop
    >
      {/* STOP propagation – kad spaudžiant panelę neuždarytų */}
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
    </dialog>
  );
}
