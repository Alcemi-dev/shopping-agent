import { useRef, useLayoutEffect, useEffect, useState, useMemo } from "react";
import { ProductsStripMessage } from "../components/ProductsStripMessage";
import Chips from "../components/Chips";
import "../styles/chat-screen.css";
import type { Msg } from "../types";

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
  const [showHeadFade, setShowHeadFade] = useState(false);
  const [showFootFade, setShowFootFade] = useState(false);

  const uniqueMessages = useMemo(() => {
    const seen = new Set<string>();
    return messages.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [messages]);
  // vietoj tavo useLayoutEffect
  useLayoutEffect(() => {
    const el = logRef.current;
    if (!el || uniqueMessages.length === 0) return;

    const lastMsgId = uniqueMessages[uniqueMessages.length - 1]?.id;
    if (!lastMsgId) return;

    // surandam paskutinį message elementą ir scrolinam į jį
    const lastEl = el.querySelector(`[data-msg-id="${lastMsgId}"]`);
    if (lastEl) {
      (lastEl as HTMLElement).scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [uniqueMessages.length]);
  // scroll listener abiem fade’ams
  useEffect(() => {
    const el = logRef.current;
    if (!el) return;

    const onScroll = () => {
      setShowHeadFade(el.scrollTop > 0);
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      setShowFootFade(!atBottom);
    };

    onScroll();
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="chat-log" ref={logRef} aria-live="polite">
      {showHeadFade && <div className="chat-head-fade" />}

      {uniqueMessages.map((m) => {
        if (m.role === "user" && m.kind === "text") {
          return (
            <div key={m.id} data-msg-id={m.id} className="msg msg--user">
              <div className="msg-bubble">{m.text}</div>
            </div>
          );
        }

        if (m.role === "assistant" && m.kind === "text") {
          return (
            <div
              key={m.id}
              data-msg-id={m.id}
              className={`msg msg--ai ${"extraClass" in m && m.extraClass ? m.extraClass : ""}`}
            >
              <p className="ai-text">{m.text}</p>
            </div>
          );
        }

        if (m.kind === "products") {
          return (
            <div key={m.id} data-msg-id={m.id} className="msg msg--ai">
              <ProductsStripMessage
                products={m.products}
                header={m.header}
                footer={m.footer}
                onAddToCart={onAddToCart}
              />
            </div>
          );
        }

        if (m.kind === "actions") {
          return (
            <div key={m.id} data-msg-id={m.id} className={`msg msg--ai ${m.extraClass ?? ""}`}>
              <Chips
                items={m.actions.map((a) => a.label)}
                onSelect={(label) => {
                  const chosen = m.actions.find((a) => a.label === label);
                  if (chosen) console.log("User selected:", chosen.value);
                }}
              />
            </div>
          );
        }

        if (m.kind === "loading") {
          return (
            <div key={m.id} data-msg-id={m.id} className="msg msg--ai">
              <LoadingRail />
            </div>
          );
        }

        return null;
      })}

      {showFootFade && <div className="chat-foot-fade" />}
      {extra}
    </div>
  );
}

/* === LoadingRail animacija === */
function LoadingRail() {
  const frames: Array<[number, number, number, number, number]> = [
    [2, 1, 1, 1, 1],
    [3, 2, 1, 1, 1],
    [3, 3, 2, 1, 1],
    [3, 3, 3, 2, 1],
    [3, 3, 3, 3, 2],
    [3, 3, 3, 3, 3],
  ];
  const [f, setF] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setF((p) => (p + 1) % frames.length), 200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="loading-rail" aria-label="Loading" role="status">
      {frames[f].map((n, i) => (
        <span key={i} className={`dash dash--${n}`} />
      ))}
    </div>
  );
}
