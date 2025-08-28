import { useEffect, useRef, useState } from "react";
import { Background, AiButton, Modal, Chips, InputBubble } from "./components";
import Explain from "./components/Explain";

/* ===== Types ===== */
type View = "explain" | "chips" | "category" | "chat";

type Category = "Consultation" | "Order status" | "Shipping & delivery" | "Returns" | "Product Information" | "Payment";

type Msg =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; text: string }
  | { id: string; role: "loading" };

const CHIP_ITEMS: Category[] = [
  "Consultation",
  "Order status",
  "Shipping & delivery",
  "Returns",
  "Product Information",
  "Payment",
];

const SUBCHIPS: Record<Category, string[]> = {
  Consultation: ["Book a call", "Skin type quiz", "Routine advice", "Shade matching", "Best-sellers"],
  "Order status": ["Track order", "Change address", "Cancel order", "Invoice copy", "Late delivery"],
  "Shipping & delivery": [
    "Delivery methods",
    "Shipping status",
    "Shipping costs",
    "Delivery times",
    "International shipping",
  ],
  Returns: ["Start a return", "Return policy", "Refund timing", "Exchange item", "Return label"],
  "Product Information": ["Ingredients", "How to use", "Allergies & safety", "Stock availability", "Sizes & variants"],
  Payment: ["Payment methods", "Installments", "Promo codes", "Billing issues", "Tax & VAT"],
};

const LOREM_58 =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam ac sapien auctor, sollicitudin sem sit amet, luctus diam. Phasellus molestie neque vel nunc pretium mollis. Nullam euismod scelerisque ipsum id iaculis. Duis malesuada blandit dui, in molestie quam commodo nec. Sed facilisis eros arcu, at laoreet nunc auctor ut. Proin nulla massa. Curabitur vitae risus in fermentum bibendum.";

/* helper */
const uid = () => Math.random().toString(36).slice(2);

function sentenceFor(c: Category) {
  switch (c) {
    case "Consultation":
      return "I’d like a consultation.";
    case "Order status":
      return "I’m looking for my order status.";
    case "Shipping & delivery":
      return "I’m looking for information about Shipping & delivery.";
    case "Returns":
      return "I need help with returns.";
    case "Product Information":
      return "I’m looking for product information.";
    case "Payment":
      return "I have a question about payments.";
  }
}

/* ===== Loader (5 dashes, 1/2/3 -> unloaded/loading/loaded) ===== */
function LoadingRail() {
  // 1 = unloaded, 2 = loading, 3 = loaded
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
    const id = setInterval(() => setF((p) => (p + 1) % frames.length), 160);
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

export default function App() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("chips");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [showSubchips, setShowSubchips] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);

  const dockRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const logRef = useRef<HTMLDivElement>(null);

  /* textarea helpers */
  function findTextarea(): HTMLTextAreaElement | null {
    const root = dockRef.current;
    if (!root) return null;
    return (root.querySelector("textarea.input-field") as HTMLTextAreaElement | null) ?? null;
  }
  function focusTextarea() {
    taRef.current = findTextarea();
    const el = taRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.value.length;
      el.selectionEnd = el.value.length;
    });
  }

  /* dock height -> --dock-h */
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

  /* mobile keyboard -> html.kb-open */
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

  /* always scroll to bottom on new message */
  useEffect(() => {
    const el = logRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTo({
        top: el.scrollHeight,
        behavior: "smooth",
      });
    });
  }, [messages]);
  /* actions */
  const reset = () => {
    setView("chips");
    setQuery("");
    setCategory(null);
    setShowSubchips(false);
    setMessages([]);
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
      return;
    }
    handleClose();
  };

  /* top chip -> show user bubble + subchips below it */
  const pickTopChip = (v: string) => {
    const cat = v as Category;
    setCategory(cat);
    setMessages([{ id: uid(), role: "user", text: sentenceFor(cat) }]);
    setShowSubchips(true);
    setView("category");
  };

  /* subchip -> send immediately */
  const pickSubChip = (v: string) => {
    setShowSubchips(false);
    send(v);
    setView("chat");
  };

  /* send flow: user bubble -> loader -> 58-word reply */
  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;
    const loaderId = "load_" + uid();
    setMessages((prev) => [...prev, { id: uid(), role: "user", text: q }, { id: loaderId, role: "loading" }]);
    setQuery("");

    // simulate typing delay then swap loader with assistant reply
    setTimeout(() => {
      setMessages((prev) =>
        prev.map((m) =>
          m.role === "loading" && m.id === loaderId ? { id: uid(), role: "assistant", text: LOREM_58 } : m
        )
      );
    }, 900);
  };

  /* input submit */
  const submit = () => send(query);

  /* focus textarea when we enter chat-ish views */
  useEffect(() => {
    if (!open) return;
    if (view === "chips" || view === "category" || view === "chat") {
      requestAnimationFrame(() => focusTextarea());
    }
  }, [open, view]);

  return (
    <div className="app-root">
      <Background />

      {!open && <AiButton onOpen={handleOpen} />}

      <Modal
        open={open}
        onClose={handleClose}
        onBack={handleBack}
        title={view === "explain" ? "Welcome to the AI-powered search" : "Hello, what are you\nlooking for today?"}
        showTitle={view !== "category" && messages.length === 0}
        mode={"default"}
      >
        {view === "explain" ? (
          <Explain
            onContinue={() => {
              setView("chips");
              requestAnimationFrame(() => focusTextarea());
            }}
          />
        ) : (
          <>
            {/* initial chips (only before any conversation starts) */}
            {view === "chips" && messages.length === 0 && (
              <div className="suggestions">
                <Chips items={CHIP_ITEMS} onPick={pickTopChip} />
              </div>
            )}

            <div className="modal-body">
              {/* chat log */}
              <div className="chat-log" ref={logRef} aria-live="polite">
                {messages.map((m) =>
                  m.role === "user" ? (
                    <div key={m.id} className="msg msg--user">
                      <div className="msg-bubble">{m.text}</div>
                    </div>
                  ) : m.role === "loading" ? (
                    <div key={m.id} className="msg msg--ai">
                      <LoadingRail />
                    </div>
                  ) : (
                    <div key={m.id} className="msg msg--ai">
                      <p className="ai-text">{m.text}</p>
                    </div>
                  )
                )}

                {/* when a top category is chosen, show subchips prompt until one is clicked */}
                {view === "category" && showSubchips && category && (
                  <>
                    <p className="subquestion">What kind of information are you looking for?</p>
                    <div className="chips-block">
                      <Chips items={SUBCHIPS[category]} onPick={pickSubChip} />
                    </div>
                  </>
                )}
              </div>

              {/* input dock – always visible in non-explain views */}
              <div className="input-dock" ref={dockRef}>
                <InputBubble value={query} onChange={setQuery} onSubmit={submit} placeholder="Ask anything…" />
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}
