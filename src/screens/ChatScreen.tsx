import { useRef, useEffect, useState, useMemo } from "react";
import { OverlayAnchor } from "../components/OverlayAnchor";
import { ProductsStripMessage } from "../components/ProductsStripMessage";
import { useAnchorRect } from "../hooks/useAnchorRect";
import Chips from "../components/Chips";
import "../styles/chat-screen.css";
import type { Msg, ProductsMsg, ActionsMsg } from "../types"; // <-- import common Msg type

export type Product = {
  id: string;
  title: string;
  img: string;
  price?: number | string;
  rating?: number; // pvz. 4.8
  reviews?: number; // pvz. 20
};
export default function ChatScreen({ messages, extra }: { messages: Msg[]; extra?: React.ReactNode }) {
  const logRef = useRef<HTMLDivElement>(null);
  // 👇 filtruojam dublikatus pagal id
  const uniqueMessages = useMemo(() => {
    const seen = new Set<string>();
    return messages.filter((m) => {
      if (seen.has(m.id)) return false;
      seen.add(m.id);
      return true;
    });
  }, [messages]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [uniqueMessages, extra]);
  return (
    <div className="chat-log" ref={logRef} aria-live="polite">
      {uniqueMessages.map((m) => {
        if (m.role === "user" && m.kind === "text") {
          return (
            <div key={m.id} className="msg msg--user">
              <div className="msg-bubble">{m.text}</div>
            </div>
          );
        }

        if (m.role === "assistant" && m.kind === "text") {
          return (
            <div key={m.id} className="msg msg--ai">
              <p className="ai-text">{m.text}</p>
            </div>
          );
        }

        if (m.kind === "products") {
          const prod = m as ProductsMsg;
          return <ProductMessage key={m.id} products={prod.products} header={prod.header} footer={prod.footer} />;
        }

        if (m.kind === "actions") {
          const act = m as ActionsMsg;
          return (
            <div key={m.id} className="msg msg--ai">
              <Chips
                items={act.actions.map((a) => a.label)}
                onSelect={(label) => {
                  const chosen = act.actions.find((a) => a.label === label);
                  if (chosen) {
                    // čia gali paleisti tą pačią logiką kaip paspaudus chip anksčiau
                    console.log("User selected:", chosen.value);
                  }
                }}
              />
            </div>
          );
        }

        if (m.kind === "loading") {
          return (
            <div key={m.id} className="msg msg--ai">
              <LoadingRail />
            </div>
          );
        }

        return null;
      })}

      {extra}
    </div>
  );
}

/* === ProductMessage (užrezervuoja vietą ir iškviečia overlay) === */
function ProductMessage({ products, header, footer }: { products: Product[]; header?: string; footer?: string }) {
  const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
  const rect = useAnchorRect(anchorEl);

  // 🔽 perskaitom --dock-h ir pridedam rezervo apačioje
  const [dockH, setDockH] = useState(0);
  useEffect(() => {
    const v = getComputedStyle(document.documentElement).getPropertyValue("--dock-h").trim();
    const px = parseFloat(v.replace("px", "")) || 0;
    setDockH(px);
  }, []);

  const base = products.length === 1 ? 420 : 320; // vizualinė juostos+teksto bazė
  const reserve = Math.max(0, dockH + 150); // papildomas „oro“ tarpas virš input

  return (
    <div className="msg msg--ai">
      <div ref={setAnchorEl}>
        <OverlayAnchor height={base + reserve} />
      </div>
      <ProductsStripMessage products={products} anchorRect={rect} header={header} footer={footer} />
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
