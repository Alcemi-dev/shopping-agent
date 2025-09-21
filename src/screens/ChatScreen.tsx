// src/screens/ChatScreen.tsx
import { useRef, useMemo, useEffect, useState } from "react";
import "../styles/chat-screen.css";
import type { Msg, ToastPayload } from "../types";
import MessageRenderer from "../components/MessageRenderer";
import { useChatScroll } from "../hooks/useChatScroll";

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

export default function ChatScreen({ messages, extra, onAddToCart, onRetry }: ChatScreenProps) {
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
  const lastUser = [...messages].reverse().find((m) => m.role === "user" && m.kind === "text");

  const scheduleRemove = (id: string) => {
    setToastList((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToastList((prev) => prev.filter((t) => t.id !== id));
    }, 400);
  };

  const handleShowToast = (payload: ToastPayload) => {
    payload.items.forEach((item) => {
      setToastList((prev) => {
        const status: "added" | "removed" = item.status;
        let existing = prev.find((t) => t.title === item.title && t.status === status);
        let next = prev.filter((t) => t.id !== existing?.id);

        if (existing) {
          if (status === "added") {
            // ✅ Added – rodom bendrą kiekį iš state
            existing = { ...existing, qty: item.qty, exiting: false };
          } else {
            // ✅ Removed – kaupiam pašalintų kiekį
            existing = { ...existing, qty: existing.qty + item.qty, exiting: false };
          }
        } else {
          existing = {
            id: Math.random().toString(36).slice(2),
            title: item.title,
            qty: item.qty,
            status,
          };
        }

        next = [existing, ...next].slice(0, 3);

        if (timersRef.current[existing.id]) {
          clearTimeout(timersRef.current[existing.id]);
        }
        timersRef.current[existing.id] = setTimeout(() => {
          scheduleRemove(existing!.id);
          delete timersRef.current[existing!.id];
        }, 3400);

        return next;
      });
    });
  };

  // forward touch events
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
        <div className="chat-messages">
          {uniqueMessages.map((m) => (
            <MessageRenderer
              key={m.id}
              m={m}
              onAddToCart={onAddToCart}
              onShowToast={handleShowToast}
              onRetry={lastUser ? () => onRetry?.(lastUser.text) : undefined}
            />
          ))}
          <div className="products-overlay">{extra}</div>
        </div>
      </div>

      {showFootFade && <div className="chat-foot-fade" />}

      {/* Toast stack */}
      <div className="toast-stack">
        {toastList.map((t, i) => {
          const offsetY = -(i * 12);
          const opacity = 1 - i * 0.25;
          return (
            <div
              key={t.id}
              className={`notification-toast ${t.exiting ? "exit" : "enter"}`}
              style={{
                zIndex: 3 - i,
                transform: `translate(-50%, ${offsetY}px)`,
                opacity,
              }}
            >
              <div className="checkmark">
                <img src="/img/check.svg" alt="✓" />
              </div>
              <div className="success-col">
                <div className="product-line">
                  <span className="product-name">{t.title}</span>
                  <span className="product-qty">×{t.qty}</span>
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
                  if (timersRef.current[t.id]) {
                    clearTimeout(timersRef.current[t.id]);
                    delete timersRef.current[t.id];
                  }
                  scheduleRemove(t.id);
                }}
              >
                <img src="/img/popup-close.svg" alt="Close" />
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
