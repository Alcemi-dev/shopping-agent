import { useRef, useMemo, useEffect, useState } from "react";
import "../styles/chat-screen.css";
import type { Msg } from "../types";
import MessageRenderer from "../components/MessageRenderer";
import { useChatScroll } from "../hooks/useChatScroll";
import type { ToastPayload } from "../components/MessageRenderer";

export type Product = {
  id: string;
  title: string;
  img: string;
  price?: number | string;
  rating?: number;
  reviews?: number;
};

type ChatScreenProps = {
  messages: Msg[];
  extra?: React.ReactNode;
  onAddToCart?: (title: string, delta: number) => void;
  onRetry?: (lastUser: string) => void;
};

type Toast = {
  id: string;
  title: string;
  qty: number;
  status: "added" | "removed";
  exiting?: boolean;
};

export default function ChatScreen({
  messages,
  extra,
  onAddToCart,
  onRetry,
}: ChatScreenProps) {
  const logRef = useRef<HTMLDivElement>(null);
  const [toastList, setToastList] = useState<Toast[]>([]);
  const timersRef = useRef<Record<string, NodeJS.Timeout>>({});

  const uniqueMessages = useMemo(() => {
    const seen = new Set<string>();
    return messages.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [messages]);

  const { showHeadFade, showFootFade } = useChatScroll(logRef, uniqueMessages);

  const lastUser = [...messages]
    .reverse()
    .find((m) => m.role === "user" && m.kind === "text");

  // 👇 handle toast updates su resetinimu
  const handleShowToast = (payload: ToastPayload) => {
    payload.items.forEach((item) => {
      setToastList((prev) => {
        let next = [...prev];
        const existing = next.find((t) => t.title === item.title);

        if (existing) {
          // update qty/status
          next = next.map((t) =>
            t.title === item.title
              ? {
                  ...t,
                  qty: item.qty,
                  status: item.qty > 0 ? "added" : "removed",
                }
              : t
          );

          // 👇 resetinam timerį visada (tiek +, tiek -)
          if (timersRef.current[item.title]) {
            clearTimeout(timersRef.current[item.title]);
          }
          timersRef.current[item.title] = setTimeout(() => {
            setToastList((prev) => prev.filter((x) => x.title !== item.title));
            delete timersRef.current[item.title];
          }, 5000);
        } else {
          // naujas toast
          const newToast: Toast = {
            id: Math.random().toString(36),
            title: item.title,
            qty: item.qty,
            status: item.qty > 0 ? "added" : "removed",
          };

          next = [newToast, ...next];

          timersRef.current[item.title] = setTimeout(() => {
            setToastList((prev) => prev.filter((x) => x.id !== newToast.id));
            delete timersRef.current[item.title];
          }, 3400);
        }

        // max 3 visible
        return next.slice(0, 3);
      });
    });
  };

  // forward touch events (fix for modal scroll)
  useEffect(() => {
    const host = document.querySelector(".modal-card") as HTMLElement | null;
    const log = logRef.current;
    if (!host || !log) return;
    const forwardTouch = (e: TouchEvent) => {
      if (!log.contains(e.target as Node)) {
        log.dispatchEvent(
          new TouchEvent(e.type, {
            bubbles: true,
            cancelable: true,
          })
        );
      }
    };

    host.addEventListener("touchstart", forwardTouch, { passive: true });
    host.addEventListener("touchmove", forwardTouch, { passive: true });
    host.addEventListener("touchend", forwardTouch, { passive: true });
    host.addEventListener("touchcancel", forwardTouch, { passive: true });

    return () => {
      host.removeEventListener("touchstart", forwardTouch);
      host.removeEventListener("touchmove", forwardTouch);
      host.removeEventListener("touchend", forwardTouch);
      host.removeEventListener("touchcancel", forwardTouch);
    };
  }, []);

  return (
    <>
      {showHeadFade && <div className="chat-head-fade" />}
      <div className="chat-log" ref={logRef} aria-live="polite">
        {uniqueMessages.map((m) => (
          <MessageRenderer
            key={m.id}
            m={m}
            onAddToCart={onAddToCart}
            onShowToast={handleShowToast}
            onRetry={lastUser ? () => onRetry?.(lastUser.text) : undefined}
          />
        ))}
        {extra}
      </div>
      {showFootFade && <div className="chat-foot-fade" />}

      {/* Toast stack */}
      <div className="toast-stack">
        {toastList.map((t, i) => (
          <div
            key={t.id}
            className={`notification-toast ${t.exiting ? "exit" : ""}`}
            style={{ zIndex: 3 - i }}
          >
            <div className="checkmark">
              <img src="/img/check.svg" alt="✓" />
            </div>
            <div className="success-col">
              <div className="product-line">
                <span className="product-name">{t.title}</span>
                {t.status === "added" && (
                  <span className="product-qty">×{t.qty}</span>
                )}
              </div>

              {t.status === "added" ? (
                <>
                  <span className="added">Added to cart successfully</span>
                  <button className="view-cart">View cart</button>
                </>
              ) : (
                <span className="added">Removed from your cart</span>
              )}
            </div>
            <button
              className="close-btn"
              onClick={() => {
                if (timersRef.current[t.title]) {
                  clearTimeout(timersRef.current[t.title]);
                  delete timersRef.current[t.title];
                }
                setToastList((prev) => prev.filter((x) => x.id !== t.id));
              }}
            >
              <img src="/img/popup-close.svg" alt="Close" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}
