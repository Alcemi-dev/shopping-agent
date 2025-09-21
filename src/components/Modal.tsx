import type { ReactNode } from "react";
import { useEffect, useRef } from "react";
import { BackIcon, CloseIcon, LogoMobileIcon, LogoDesktopIcon, BackgroundGradiantMobile, BackgroundGradiantDesktop, BackgroundGradiantExplain } from './SvgIcons';

type Props = {
  open: boolean;
  onClose: () => void;
  onBack?: () => void;
  modalTitle?: ReactNode;
  children: ReactNode;
  mode?: "default" | "answer";
  showTitle?: boolean;
  rightSlot?: ReactNode; // 🛒 papildomas slotas header'io dešinėje
  extraClass?: string; // 👈 leidžia perduoti pvz. "listening"
};

function ModalScreen({
  show,
  children,
}: {
  show: boolean;
  children: ReactNode;
}) {
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
  extraClass = "",
}: Props) {
  const dlgRef = useRef<HTMLDialogElement | null>(null);
  const headRef = useRef<HTMLDivElement | null>(null);

  // atidarymas/uždarymas
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

  // measure header height -> --head-h
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

  const labelProps =
    mode === "answer"
      ? {
          "aria-label": typeof modalTitle === "string" ? modalTitle : undefined,
        }
      : { "aria-labelledby": "modal-title" };

  return (
    <dialog
      id="ai-modal"
      ref={dlgRef}
      className="modal-root"
      {...labelProps}
      onClick={onClose}
    >
      <div
        className={`modal-card ${extraClass}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-ctr">
          <div
            className="modal-head"
            role="toolbar"
            aria-label="AI modal navigation"
            ref={headRef}
          >
            <button
              type="button"
              className="head-logo-mobile"
              onClick={onBack ?? onClose}
            >
              <LogoMobileIcon />
            </button>

            <button className="icon-btn head-back" onClick={onBack ?? onClose}>
              <BackIcon />
            </button>

            <div className="head-spacer" />

            {/* 611–790px: Powered by mobile logo headeryje */}
            <LogoMobileIcon className="powered-by powered-by--head" />

            {rightSlot}

            <button className="icon-btn head-close" onClick={onClose}>
              <CloseIcon />
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

          {/* ≥790px: Powered by desktop logo footeryje */}
          <div className="modal-footer">
            <LogoDesktopIcon className="powered-by powered-by--footer" />
          </div>
        </div>

        <div id="modal-overlays" aria-hidden />
        
        {/* Background SVG Components */}
        <div className="background-svg-container" aria-hidden="true">
          <BackgroundGradiantMobile className="background-svg background-svg--mobile" />
          <BackgroundGradiantDesktop className="background-svg background-svg--desktop" />
          <BackgroundGradiantExplain className="background-svg background-svg--explain" />
        </div>
      </div>
    </dialog>
  );
}

Modal.Screen = ModalScreen;
