import Chips from "./Chips";
import { ProductsStripMessage } from "./ProductsStripMessage";
import LoadingRail from "./LoadingRail";
import type { Msg } from "../types";

type Props = {
  m: Msg;
  onAddToCart?: (title: string) => void;
  onActionSelect?: (value: string) => void; // 👈 pridėta
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

  // Products
  if (m.kind === "products") {
    return (
      <div data-msg-id={m.id} className="msg msg--ai">
        <ProductsStripMessage products={m.products} header={m.header} footer={m.footer} onAddToCart={onAddToCart} />
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
              console.log("User selected:", chosen.value);
              onActionSelect?.(chosen.value); // 👈 kviečiam viršutinę logiką
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
