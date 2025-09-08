// App.tsx
import { useEffect, useRef, useState } from "react";
import { Background, AiButton, Modal, InputBubble } from "./components";
import ExplainScreen from "./screens/ExplainScreen";
import ChipsScreen from "./screens/ChipsScreen";
import CategoryScreen from "./screens/CategoryScreen";
import ChatScreen from "./screens/ChatScreen";
import type { Msg, Category, View, Collected } from "./types";
import { CHIP_ITEMS, SUBCHIPS } from "./types";
import { createMockEngine, sentenceFor } from "./mock/engine"; // ⬅️ nauja

export default function App() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("chips");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [showSubchips, setShowSubchips] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [, setCollected] = useState<Collected>({}); // state machine memory
  const [cartCount, setCartCount] = useState(0);

  const dockRef = useRef<HTMLDivElement>(null);

  // ⬇️ Inicijuojam mock engine vieną kartą
  const engineRef = useRef(
    createMockEngine({
      setMessages,
      setCollected,
      // getProducts: () => MOCK_PRODUCTS, // jei nori perleisti iš išorės
      delayMs: 900,
    })
  );

  /* dock height -> --dock-h (paliekam kaip buvo) */
  useEffect(() => {
    const el = dockRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const h = entries[0]?.contentRect.height ?? 0;
      document.documentElement.style.setProperty("--dock-h", `${h}px`);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  /* mobile keyboard -> html.kb-open (paliekam kaip buvo) */
  useEffect(() => {
    const root = document.documentElement;
    if (!open) {
      root.classList.remove("kb-open");
      return;
    }
    const vv = (window as any).visualViewport as VisualViewport | undefined;
    const THRESHOLD = 240;
    let base = vv ? vv.height : window.innerHeight;
    const update = () => {
      const h = vv ? vv.height : window.innerHeight;
      const delta = base - h;
      if (delta > THRESHOLD) root.classList.add("kb-open");
      else root.classList.remove("kb-open");
    };
    const refreshBase = () => {
      base = vv ? vv.height : window.innerHeight;
    };
    update();
    window.addEventListener("resize", refreshBase);
    vv?.addEventListener("resize", update);
    vv?.addEventListener("scroll", update);
    return () => {
      window.removeEventListener("resize", refreshBase);
      vv?.removeEventListener("resize", update);
      vv?.removeEventListener("scroll", update);
      root.classList.remove("kb-open");
    };
  }, [open]);

  /* actions */
  const reset = () => {
    setView("chips");
    setQuery("");
    setCategory(null);
    setShowSubchips(false);
    setMessages([]);
    setCollected({});
  };

  const handleOpen = () => {
    setOpen(true);
    setView("explain");
  };
  const handleClose = () => {
    setOpen(false);
    reset();
  };
  const handleBack = () => {
    if (view === "chat" || view === "category") {
      setView("chips");
      setCategory(null);
      setShowSubchips(false);
      setMessages([]);
      setQuery("");
      setCollected({});
      return;
    }
    handleClose();
  };

  const pickTopChip = (v: string) => {
    const cat = v as Category;
    setCategory(cat);
    setMessages([
      { id: crypto.randomUUID?.() ?? Math.random().toString(), role: "user", kind: "text", text: sentenceFor(cat) },
    ]);
    setShowSubchips(true);
    setView("category");
  };

  const pickSubChip = (v: string) => {
    setShowSubchips(false);
    send(v);
    setView("chat");
  };

  // Pasinaudojam engine siuntimu
  const send = (text: string) => {
    if (text.trim()) {
      engineRef.current.send(text);
      if (view !== "chat") setView("chat");
      setQuery("");
    }
  };

  // deleguojam engine’ui
  useEffect(() => {
    engineRef.current.handleMessagesEffect(messages);
  }, [messages]);

  // Add-to-cart handler
  const handleAddToCart = (title: string) => {
    console.log("Added:", title);
    setCartCount((c) => c + 1);
  };

  return (
    <div className="app-root">
      <Background />
      {!open && <AiButton onOpen={handleOpen} />}

      <Modal
        open={open}
        onClose={handleClose}
        onBack={handleBack}
        modalTitle={view === "explain" ? "How to use Quick Search" : "Hello, what are you\nlooking for today?"}
        showTitle={view !== "category" && messages.length === 0}
        rightSlot={
          cartCount > 0 && (
            <div className="cart-indicator">
              <div className="cart-icon-wrap">
                <img src="/img/cart.svg" alt="Cart" />
                <span className="badge">{cartCount}</span>
              </div>
              <span className="cart-label">Cart</span>
            </div>
          )
        }
      >
        <Modal.Screen show={view === "explain"}>
          <ExplainScreen onContinue={() => setView("chips")} />
        </Modal.Screen>

        <Modal.Screen show={view === "chips"}>
          <ChipsScreen items={CHIP_ITEMS} onPick={pickTopChip} />
        </Modal.Screen>

        <Modal.Screen show={view === "chips" || view === "category" || view === "chat"}>
          <ChatScreen
            messages={messages}
            onAddToCart={handleAddToCart}
            extra={
              view === "category" &&
              category &&
              showSubchips && <CategoryScreen items={SUBCHIPS[category]} onPick={pickSubChip} />
            }
          />
        </Modal.Screen>

        {view !== "explain" && (
          <div className="input-dock" ref={dockRef}>
            <InputBubble value={query} onChange={setQuery} onSubmit={() => send(query)} placeholder="Ask anything…" />
          </div>
        )}
      </Modal>
    </div>
  );
}
