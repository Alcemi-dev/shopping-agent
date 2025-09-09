import { useRef, useMemo, useEffect } from "react";
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
  onAddToCart?: (title: string) => void; // 🛒 callback
};

export default function ChatScreen({ messages, extra, onAddToCart }: ChatScreenProps) {
  const logRef = useRef<HTMLDivElement>(null);

  const uniqueMessages = useMemo(() => {
    const seen = new Set<string>();
    return messages.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [messages]);

  const { showHeadFade, showFootFade } = useChatScroll(logRef, uniqueMessages);
  useEffect(() => {
    const host = document.querySelector(".modal-card") as HTMLElement | null;
    const log = logRef.current;
    if (!host || !log) return;

    let startY = 0;
    let lastY = 0;
    let active = false;

    const onStart = (e: TouchEvent) => {
      if (log.contains(e.target as Node)) return; // jei spaudžia chat'ą — nieko
      startY = lastY = e.touches[0].clientY;
      active = true;
    };

    const onMove = (e: TouchEvent) => {
      if (!active) return;
      const y = e.touches[0].clientY;
      const dy = y - lastY;
      log.scrollBy({ top: -dy }); // 👈 forwardinam judesį į chat-log
      lastY = y;
    };

    const onEnd = () => {
      active = false; // naršyklė pati suteikia inerciją
    };

    host.addEventListener("touchstart", onStart, { passive: true });
    host.addEventListener("touchmove", onMove, { passive: true });
    host.addEventListener("touchend", onEnd, { passive: true });
    host.addEventListener("touchcancel", onEnd, { passive: true });

    return () => {
      host.removeEventListener("touchstart", onStart);
      host.removeEventListener("touchmove", onMove);
      host.removeEventListener("touchend", onEnd);
      host.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  return (
    <>
      {showHeadFade && <div className="chat-head-fade" />}
      <div className="chat-log" ref={logRef} aria-live="polite">
        {uniqueMessages.map((m) => (
          <MessageRenderer key={m.id} m={m} onAddToCart={onAddToCart} />
        ))}
        {extra}
      </div>
      {showFootFade && <div className="chat-foot-fade" />}
    </>
  );
}
