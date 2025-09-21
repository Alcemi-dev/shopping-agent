import { useEffect, useRef, useState } from "react";
import { Background, AiButton, Modal, InputBubble } from "./components";
import ExplainScreen from "./screens/ExplainScreen";
import ChipsScreen from "./screens/MainScreen";
import CategoryScreen from "./screens/CategoryScreen";
import ChatScreen from "./screens/ChatScreen";
import FeedbackScreen from "./screens/FeedbackScreen";
import FeedbackFilledScreen from "./screens/FeedbackFilledScreen";
import ConnectionLostScreen from "./screens/ConnectionLostScreen";
import VoiceScreen from "./screens/VoiceScreen";
import VoiceChatScreen from "./screens/VoiceChatScreen"; // 👈 turi būti default export
import type { Category, View, ShoppingAgentConfig } from "./types";
import { CHIP_ITEMS, SUBCHIPS } from "./types";
import { useChatEngine } from "./hooks/useChatEngine";
import { useSpeechToText } from "./hooks/useSpeechToText";
import { CartIcon } from "./components/SvgIcons";

interface AppProps {
  config: ShoppingAgentConfig;
}

export default function App({ config }: AppProps) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("chips");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [showSubchips, setShowSubchips] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [autoStart, setAutoStart] = useState(false);

  const dockRef = useRef<HTMLDivElement>(null);
  const chat = useChatEngine();

  // 👇 vietoj setMessages naudojam chat.addMessage
  const { mode } = useSpeechToText(chat.addMessage);

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

  /* notification badge + auto-view switching */
  useEffect(() => {
    const last = chat.messages[chat.messages.length - 1];
    if (last && last.role === "assistant" && !open) {
      setHasUnread(true);
    }
    if (last && last.kind === "feedback") {
      setView("feedback");
    }
    if (last && last.kind === "connection-lost") {
      setView("connection-lost");
    }
  }, [chat.messages, open]);

  const handleOpen = () => {
    setOpen(true);
    setHasUnread(false);
    if (chat.messages.length === 0) setView("explain");
  };

  const handleClose = () => setOpen(false);

  const resetAll = () => {
    setView("chips");
    setCategory(null);
    setShowSubchips(false);
    setQuery("");
    chat.reset();
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
    chat.pickCategory(cat);
    setShowSubchips(true);
    setView("category");
  };

  const pickSubChip = (v: string) => {
    setShowSubchips(false);
    chat.sendMessage(v);
    setView("chat");
  };

  const send = (text: string) => {
    if (text.trim()) {
      chat.sendMessage(text);
      if (view !== "chat") setView("chat");
      setQuery("");
    }
  };

  return (
    <div className="app-root">
      <Background />
      {!open && <AiButton onOpen={handleOpen} hasUnread={hasUnread} />}

      <Modal
        open={open}
        onClose={handleClose}
        onBack={handleBack}
        extraClass={mode === "listening" ? "listening" : ""}
        modalTitle={
          view === "explain"
            ? "How to use Quick Search"
            : view === "chips" || view === "voice"
            ? config.welcomeMessage || "Hello, what are you\nlooking for today?"
            : undefined
        }
        showTitle={view === "explain" || view === "chips"}
        rightSlot={
          chat.cartCount > 0 && (
            <div className="cart-indicator">
              <div className="cart-icon-wrap">
                <CartIcon />
                <span className="badge">{chat.cartCount}</span>
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

        <Modal.Screen show={view === "category" || view === "chat"}>
          <ChatScreen
            messages={chat.messages}
            onAddToCart={chat.handleChangeCart}
            onRetry={chat.retry}
            extra={
              view === "category" &&
              category &&
              showSubchips && <CategoryScreen items={SUBCHIPS[category]} onPick={pickSubChip} />
            }
          />
        </Modal.Screen>

        <Modal.Screen show={view === "voice"}>
          <VoiceScreen
            onBack={() => {
              resetAll();
              setView("chips");
            }}
            onPickChip={pickTopChip}
            onVoiceStart={() => {
              setAutoStart(true); // 👈 čia mic startuoja
              setView("voicechat");
            }}
          />
        </Modal.Screen>

        <Modal.Screen show={view === "voicechat"}>
          <VoiceChatScreen
            chat={chat}
            autoStart={autoStart} // 👈 dinamiškai pagal scenarijų
            initialQuestion="Hello, what are you looking for today?"
            onBack={() => setView("chips")}
            onKeyboard={() => setView("chat")}
          />
        </Modal.Screen>

        <Modal.Screen show={view === "feedback"}>
          <FeedbackScreen onSubmit={() => setView("feedback-filled")} />
        </Modal.Screen>

        <Modal.Screen show={view === "feedback-filled"}>
          <FeedbackFilledScreen onNewSearch={resetAll} />
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
                onVoice={() => {
                  if (chat.messages.length === 0) {
                    // 👇 jei istorijos nėra → VoiceScreen
                    setView("voice");
                  } else {
                    // 👇 jei yra istorija → VoiceChatScreen, bet mic nestartuoja
                    setAutoStart(false);
                    setView("voicechat");
                  }
                }}
                placeholder="Ask anything…"
              />
            </div>
          )}
      </Modal>
    </div>
  );
}
