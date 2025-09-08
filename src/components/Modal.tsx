import type { ReactNode } from "react";
import { useEffect, useRef } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onBack?: () => void;
  modalTitle?: ReactNode;
  children: ReactNode;
  mode?: "default" | "answer";
  showTitle?: boolean;
  rightSlot?: ReactNode; // 🛒 papildomas slotas header'io dešinėje
};

/* Sub-komponentas: <Modal.Screen show={...}> */
function ModalScreen({ show, children }: { show: boolean; children: ReactNode }) {
  if (!show) return null;
  return <>{children}</>;
}

export default function Modal({
  open,
  onClose,
  onBack,
  modalTitle,
  children,
  mode = "default",
  showTitle = true,
  rightSlot,
}: Props) {
  const dlgRef = useRef<HTMLDialogElement | null>(null);
  const headRef = useRef<HTMLDivElement | null>(null);

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

  // Esc → onClose
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

  // measure header height -> --head-h (responsive chat height)
  useEffect(() => {
    const head = headRef.current;
    if (!head) return;
    const root = document.documentElement;
    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height ?? 0;
      root.style.setProperty("--head-h", `${h}px`);
    });
    ro.observe(head);
    return () => ro.disconnect();
  }, []);

  // accessibility props
  const labelProps =
    mode === "answer"
      ? { "aria-label": typeof modalTitle === "string" ? modalTitle : undefined }
      : { "aria-labelledby": "modal-title" };

  return (
    <dialog
      id="ai-modal"
      ref={dlgRef}
      className="modal-root"
      {...labelProps}
      onClick={onClose} // click ant backdrop
    >
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-ctr">
          <div className="modal-head" role="toolbar" aria-label="AI modal navigation" ref={headRef}>
            <button type="button" className="head-logo-mobile" onClick={onBack ?? onClose}>
              <img src="/img/logo-mobile.svg" alt="Alcemi" />
            </button>

            <button className="icon-btn head-back" onClick={onBack ?? onClose}>
              <img src="/img/back.svg" alt="" aria-hidden="true" />
            </button>

            <div className="head-spacer" />

            {/* 🛒 Cart / Notification vieta */}
            {rightSlot}

            <button className="icon-btn head-close" onClick={onClose}>
              <img src="/img/close.svg" alt="" aria-hidden="true" />
            </button>
          </div>

          <div className={`modal-col ${mode === "answer" ? "is-answer" : ""}`}>
            {mode !== "answer" && showTitle && modalTitle && (
              <h1 id="modal-title" className="modal-title">
                {modalTitle}
              </h1>
            )}
            <div className="modal-body">{children}</div>
          </div>

          <div className="modal-footer">
            <img className="powered-by" src="/img/logo-desktop.svg" alt="Powered by Alcemi" />
          </div>
        </div>

        {/* Host elementas produktų juostai */}
        <div id="modal-overlays" aria-hidden />
      </div>
    </dialog>
  );
}

Modal.Screen = ModalScreen;
