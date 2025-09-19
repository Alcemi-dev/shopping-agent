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
};

export default function ChatScreen({ messages, extra, onAddToCart, onRetry }: ChatScreenProps) {
  const logRef = useRef<HTMLDivElement>(null);
  const [toastList, setToastList] = useState<Toast[]>([]);
  const timersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const lastQtyRef = useRef<Record<string, number>>({}); // 👈 keep previous qty per product

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

  const handleShowToast = (payload: ToastPayload) => {
    payload.items.forEach((item) => {
      const prevQty = lastQtyRef.current[item.title] ?? 0;
      const delta = item.qty - prevQty;

      if (delta > 0) {
        // 🔹 ADD: visada vienas toast per produktą (qty update), perkeliame į viršų
        setToastList((prev) => {
          let existing = prev.find((t) => t.title === item.title && t.status === "added");
          let next = prev.filter((t) => t.id !== existing?.id);

          if (existing) {
            existing = { ...existing, qty: item.qty }; // atnaujintas kiekis
          } else {
            existing = {
              id: Math.random().toString(36).slice(2),
              title: item.title,
              qty: item.qty,
              status: "added",
            };
          }

          // įdedam į viršų
          next = [existing, ...next].slice(0, 3);

          // reset timer
          if (timersRef.current[existing.id]) {
            clearTimeout(timersRef.current[existing.id]);
          }
          timersRef.current[existing.id] = setTimeout(() => {
            setToastList((p) => p.filter((x) => x.id !== existing!.id));
            delete timersRef.current[existing!.id];
          }, 5000);

          return next;
        });
      } else if (delta < 0) {
        // 🔹 REMOVE: grupuojam į vieną toastą per produktą
        setToastList((prev) => {
          let existing = prev.find((t) => t.title === item.title && t.status === "removed");
          let next = prev.filter((t) => t.id !== existing?.id);

          if (existing) {
            existing = { ...existing, qty: existing.qty + Math.abs(delta) };
          } else {
            existing = {
              id: Math.random().toString(36).slice(2),
              title: item.title,
              qty: Math.abs(delta),
              status: "removed",
            };
          }

          // įdedam į viršų
          next = [existing, ...next].slice(0, 3);

          // reset timer
          if (timersRef.current[existing.id]) {
            clearTimeout(timersRef.current[existing.id]);
          }
          timersRef.current[existing.id] = setTimeout(() => {
            setToastList((p) => p.filter((x) => x.id !== existing!.id));
            delete timersRef.current[existing!.id];
          }, 5000);

          return next;
        });
      }

      // updateinam atmintį
      lastQtyRef.current[item.title] = item.qty;
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
          <div key={t.id} className="notification-toast" style={{ zIndex: 3 - i }}>
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
