import Chips from "./Chips";
import { ProductsStripChat } from "./ProductsStrip/ProductsStripChat";
import LoadingRail from "./LoadingRail";
import type { Msg } from "../types";

// 👇 bendras toast payload tipas
export type ToastPayload = {
  items: { title: string; qty: number }[];
};

type Props = {
  m: Msg;
  onAddToCart?: (title: string, delta: number) => void;
  onActionSelect?: (value: string) => void;
  onRetry?: () => void;
  onShowToast?: (payload: ToastPayload) => void;
};

export default function MessageRenderer({ m, onAddToCart, onActionSelect, onRetry, onShowToast }: Props) {
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
        <div>
          <p className="ai-text error-text">{m.text}</p>
          {onRetry && (
            <button className="retry-btn" onClick={onRetry}>
              Retry
            </button>
          )}
        </div>
      </div>
    );
  }

  // Products
  if (m.kind === "products") {
    return (
      <div data-msg-id={m.id} className="msg msg--ai">
        <ProductsStripChat
          products={m.products}
          header={m.header}
          footer={m.footer}
          visibleCount={m.visibleCount}
          showMore={m.showMore}
          onAddToCart={onAddToCart}
          onShowToast={onShowToast} // 👈 forwardinam
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
