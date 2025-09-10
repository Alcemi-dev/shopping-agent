import { useEffect, useRef, useState } from "react";
import { Background, AiButton, Modal, InputBubble } from "./components";
import ExplainScreen from "./screens/ExplainScreen";
import ChipsScreen from "./screens/ChipsScreen";
import CategoryScreen from "./screens/CategoryScreen";
import ChatScreen from "./screens/ChatScreen";
import FeedbackScreen from "./screens/FeedbackScreen";
import FeedbackFilledScreen from "./screens/FeedbackFilledScreen";
import ConnectionLostScreen from "./screens/ConnectionLostScreen";
import VoiceScreen from "./screens/VoiceScreen"; // overlay
import VoiceChatScreen from "./screens/VoiceChatScreen"; // 👈 naujas
import type { Msg, Category, View, Collected } from "./types";
import { CHIP_ITEMS, SUBCHIPS } from "./types";
import { createMockEngine, sentenceFor } from "./mock/engine";

export default function App() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("chips");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [showSubchips, setShowSubchips] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [, setCollected] = useState<Collected>({});
  const [cartCount, setCartCount] = useState(0);
  const [hasUnread, setHasUnread] = useState(false);

  const dockRef = useRef<HTMLDivElement>(null);

  const engineRef = useRef(
    createMockEngine({
      setMessages,
      setCollected,
      delayMs: 900,
    })
  );

  /* dock height */
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

  /* mobile keyboard */
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

  /* NOTIFICATION BADGE LOGIC */
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last && last.role === "assistant" && !open) {
      setHasUnread(true);
    }
    if (last && last.kind === "feedback") {
      setView("feedback");
    }
    if (last && last.kind === "connection-lost") {
      setView("connection-lost");
    }
  }, [messages, open]);

  const handleOpen = () => {
    setOpen(true);
    setHasUnread(false);
    if (messages.length === 0) setView("explain");
  };

  const handleClose = () => setOpen(false);

  /** Reset visos būsenos į pradinę */
  const resetAll = () => {
    setView("chips");
    setCategory(null);
    setShowSubchips(false);
    setMessages([]);
    setQuery("");
    setCollected({});
    setCartCount(0);
  };

  const handleBack = () => {
    if (
      view === "chat" ||
      view === "category" ||
      view === "feedback" ||
      view === "feedback-filled" ||
      view === "connection-lost" ||
      view === "voice" ||
      view === "voicechat"
    ) {
      resetAll();
      return;
    }
    handleClose();
  };

  const pickTopChip = (v: string) => {
    const cat = v as Category;
    setCategory(cat);
    setMessages([
      {
        id: crypto.randomUUID?.() ?? Math.random().toString(),
        role: "user",
        kind: "text",
        text: sentenceFor(cat),
      },
    ]);
    setShowSubchips(true);
    setView("category");
  };

  const pickSubChip = (v: string) => {
    setShowSubchips(false);
    send(v);
    setView("chat");
  };

  const send = (text: string) => {
    if (text.trim()) {
      engineRef.current.send(text);
      if (view !== "chat") setView("chat");
      setQuery("");
    }
  };

  useEffect(() => {
    engineRef.current.handleMessagesEffect(messages);
  }, [messages]);

  const handleAddToCart = (title: string) => {
    console.log("Added:", title);
    setCartCount((c) => c + 1);
  };

  return (
    <div className="app-root">
      <Background />
      {!open && <AiButton onOpen={handleOpen} hasUnread={hasUnread} />}

      <Modal
        open={open}
        onClose={handleClose}
        onBack={handleBack}
        modalTitle={
          view === "explain"
            ? "How to use Quick Search"
            : view === "chips" || view === "voice"
            ? "Hello, what are you\nlooking for today?"
            : undefined
        }
        showTitle={view === "explain" || view === "chips"}
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

        <Modal.Screen show={view === "voice"}>
          <VoiceScreen
            onBack={() => setView("chips")}
            onPickChip={pickTopChip}
            onVoiceResult={(text) => {
              // vietoj perėjimo tiesiai į Chat → eik į VoiceChat
              console.log("Voice result:", text);
              setView("voicechat");
            }}
          />
        </Modal.Screen>

        <Modal.Screen show={view === "voicechat"}>
          <VoiceChatScreen onBack={() => setView("chips")} onKeyboard={() => setView("chat")} />
        </Modal.Screen>

        <Modal.Screen show={view === "feedback"}>
          <FeedbackScreen
            onSubmit={(rating, comment) => {
              console.log("Feedback submitted:", rating, comment);
              setView("feedback-filled");
            }}
          />
        </Modal.Screen>

        <Modal.Screen show={view === "feedback-filled"}>
          <FeedbackFilledScreen onNewSearch={() => resetAll()} />
        </Modal.Screen>

        <Modal.Screen show={view === "connection-lost"}>
          <ConnectionLostScreen />
        </Modal.Screen>

        {view !== "explain" &&
          view !== "feedback" &&
          view !== "feedback-filled" &&
          view !== "connection-lost" &&
          view !== "voice" &&
          view !== "voicechat" && (
            <div className="input-dock" ref={dockRef}>
              <InputBubble
                value={query}
                onChange={setQuery}
                onSubmit={() => send(query)}
                onVoice={() => setView("voice")}
                placeholder="Ask anything…"
              />
            </div>
          )}
      </Modal>
    </div>
  );
}
