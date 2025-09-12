import { useRef, useMemo, useEffect, useState } from "react";
import "../styles/chat-screen.css";
import type { Msg } from "../types";
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
  onAddToCart?: (title: string, delta: number) => void; // 🛒 callback
  onRetry?: (lastUser: string) => void; // 👈 naujas callback
};

export default function ChatScreen({ messages, extra, onAddToCart, onRetry }: ChatScreenProps) {
  const logRef = useRef<HTMLDivElement>(null);

  const [toast, setToast] = useState<{ title: string; qty: number } | null>(null);

  const uniqueMessages = useMemo(() => {
    const seen = new Set<string>();
    return messages.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [messages]);

  const { showHeadFade, showFootFade } = useChatScroll(logRef, uniqueMessages);

  // Surandam paskutinį user message
  const lastUser = [...messages].reverse().find((m) => m.role === "user" && m.kind === "text");

  // 👇 PRIDĖTA: forward’inti touch iš viso modal į chat-log
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

  // auto-hide toast
  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  return (
    <>
      {showHeadFade && <div className="chat-head-fade" />}
      <div className="chat-log" ref={logRef} aria-live="polite">
        {uniqueMessages.map((m) => (
          <MessageRenderer
            key={m.id}
            m={m}
            onAddToCart={onAddToCart}
            onShowToast={(payload) => setToast(payload)} // 👈 naujas callback
            onRetry={lastUser ? () => onRetry?.(lastUser.text) : undefined}
          />
        ))}
        {extra}
      </div>
      {showFootFade && <div className="chat-foot-fade" />}

      {/* 👇 globalus toast */}
      {toast && (
        <div className="notification-toast">
          <div className="checkmark">
            <img src="/img/check.svg" alt="✓" />
          </div>
          <div className="success-col">
            <div className="product-line">
              <span className="product-name">{toast.title}</span>
              <span className="product-qty">×{toast.qty}</span>
            </div>
            <span className="added">Added to cart successfully</span>
            <button className="view-cart">View cart</button>
          </div>
          <button className="close-btn" onClick={() => setToast(null)}>
            <img src="/img/popup-close.svg" alt="Close" />
          </button>
        </div>
      )}
    </>
  );
}
