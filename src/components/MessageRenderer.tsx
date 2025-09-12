import Chips from "./Chips";
import { ProductsStripMessage } from "./ProductsStripMessage";
import LoadingRail from "./LoadingRail";
import type { Msg } from "../types";

type Props = {
  m: Msg;
  onAddToCart?: (title: string, delta: number) => void;
  onActionSelect?: (value: string) => void; // 👈 pridėti
};

export default function MessageRenderer({ m, onAddToCart, onActionSelect }: Props) {
  // USER text
  if (m.role === "user" && m.kind === "text") {
    return (
      <div data-msg-id={m.id} className="msg msg--user">
        <div className="msg-bubble">{m.text}</div>
      </div>
    );
  }

  // ASSISTANT text
  if (m.role === "assistant" && m.kind === "text") {
    return (
      <div data-msg-id={m.id} className={`msg msg--ai ${"extraClass" in m && m.extraClass ? m.extraClass : ""}`}>
        <p className="ai-text">{m.text}</p>
      </div>
    );
  }

  // ASSISTANT error
  if (m.role === "assistant" && m.kind === "error") {
    return (
      <div data-msg-id={m.id} className="msg msg--ai error-bubble">
        <img src="/img/error.svg" alt="Error" className="error-icon" />
        <p className="ai-text error-text">{m.text}</p>
      </div>
    );
  }

  // Products
  if (m.kind === "products") {
    console.log("Rendering products message", {
      id: m.id,
      header: m.header,
      footer: m.footer,
      visibleCount: (m as any).visibleCount, // 👈 debug
      products: m.products.length,
    });

    return (
      <div data-msg-id={m.id} className="msg msg--ai">
        <ProductsStripMessage
          products={m.products}
          header={m.header}
          footer={m.footer}
          visibleCount={m.visibleCount} // 👈 perduodam
          showMore={m.showMore} // 👈 perduodam
          onAddToCart={onAddToCart}
        />
      </div>
    );
  }
  // Actions (chips)
  if (m.kind === "actions") {
    return (
      <div data-msg-id={m.id} className={`msg msg--ai ${m.extraClass ?? ""}`}>
        <Chips
          items={m.actions.map((a) => a.label)}
          onSelect={(label) => {
            const chosen = m.actions.find((a) => a.label === label);
            if (chosen) {
              onActionSelect?.(chosen.value);
            }
          }}
        />
      </div>
    );
  }

  // Loading
  if (m.kind === "loading") {
    return (
      <div data-msg-id={m.id} className="msg msg--ai">
        <LoadingRail />
      </div>
    );
  }

  return null;
}
