import { useEffect, useRef, useState } from "react";
import { Background, AiButton, Modal, InputBubble } from "./components";
import ExplainScreen from "./screens/ExplainScreen";
import ChipsScreen from "./screens/ChipsScreen";
import CategoryScreen from "./screens/CategoryScreen";
import ChatScreen from "./screens/ChatScreen";
import { MOCK_PRODUCTS } from "./data/products";
import type { Msg, Category, View, Collected } from "./types";
import { CHIP_ITEMS, SUBCHIPS } from "./types";

/* ================== MODULE-LEVEL (persistuoja per StrictMode remount) ================== */
const processedLoaderIds = new Set<string>(); // kuriuos loaderius jau apdorojom
const pendingQueries = new Map<string, string>(); // loaderId -> klausimas (q)

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

export default function App() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("chips");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<Category | null>(null);
  const [showSubchips, setShowSubchips] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [, setCollected] = useState<Collected>({}); // state machine memory

  const dockRef = useRef<HTMLDivElement>(null);

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
    setMessages([{ id: uid(), role: "user", kind: "text", text: sentenceFor(cat) }]);
    setShowSubchips(true);
    setView("category");
  };

  const pickSubChip = (v: string) => {
    setShowSubchips(false);
    send(v);
    setView("chat");
  };

  // === SEND (jokių async čia – tik įrašom loaderį ir užregistruojam query) ===
  const send = (text: string) => {
    const q = text.trim();
    if (!q) return;

    const userMsg: Msg = { id: uid(), role: "user", kind: "text", text: q };
    const loaderId = uid();

    // neleisti, kad keli loaderiai iškart atsirastų
    setMessages((prev) => {
      const last = prev[prev.length - 1];
      if (last?.kind === "loading") {
        return prev; // jau laukiam atsakymo → nebededam dar vieno
      }
      return [...prev, userMsg, { id: loaderId, role: "system", kind: "loading" } as Msg];
    });

    // registruojam query
    pendingQueries.set(loaderId, q);
    setQuery("");
  };

  // === STATE MACHINE EFFECT (reaguoja į naują loaderį, apdoroja TIK KARTĄ) ===
  useEffect(() => {
    let loader: Msg | undefined;
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.kind === "loading") {
        loader = m;
        break;
      }
    }
    if (!loader) return;
    if (processedLoaderIds.has(loader.id)) return;

    // iškart pažymim, kad šitas loader jau tvarkomas
    processedLoaderIds.add(loader.id);

    const q = pendingQueries.get(loader.id) ?? "";

    const t = setTimeout(() => {
      pendingQueries.delete(loader!.id);

      setCollected((current) => {
        // 1) ask skinType
        if (!current.skinType) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === loader!.id
                ? ({
                    ...m,
                    role: "assistant",
                    kind: "text",
                    text: "What’s your skin type? (oily, dry, normal…)",
                  } as Msg)
                : m
            )
          );
          return { ...current, skinType: "pending" };
        }

        // 2) ask budget
        if (current.skinType === "pending") {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === loader!.id
                ? ({
                    ...m,
                    role: "assistant",
                    kind: "text",
                    text: "Great! What’s your budget range?",
                  } as Msg)
                : m
            )
          );
          return { ...current, skinType: q.toLowerCase() };
        }

        // 3) pasirinkimas pagal tekstą
        if (!current.budget) {
          const newState = { ...current, budget: q.toLowerCase() };

          const scenario = q.toLowerCase().includes("none")
            ? "none"
            : q.toLowerCase().includes("many")
            ? "many"
            : "one";

          if (scenario === "one") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === loader!.id
                  ? ({
                      ...m,
                      role: "assistant",
                      kind: "products",
                      products: [MOCK_PRODUCTS[0]],
                      header:
                        "Based on your skin type and other indications, this is the best match for your needs in our store:",
                    } as Msg)
                  : m
              )
            );
          } else if (scenario === "many") {
            setMessages((prev) =>
              prev.map((m) =>
                m.id === loader!.id
                  ? ({
                      ...m,
                      role: "assistant",
                      kind: "products",
                      products: MOCK_PRODUCTS,
                      header:
                        "I couldn’t find anything for your exact request, but here are the closest matches that our customers love:",
                      footer: "Do you need any further help?",
                    } as Msg)
                  : m
              )
            );
          } else {
            // NO RESULTS → VISKĄ viename update
            const actionsId = loader.id + "-actions";
            const supportId = loader.id + "-support";

            setMessages((prev) =>
              prev
                .map((m) =>
                  m.id === loader!.id
                    ? ({
                        ...m,
                        role: "assistant",
                        kind: "text",
                        text: `No results found for ${q}. I suggest checking these items:`,
                      } as Msg)
                    : m
                )
                .concat([
                  {
                    id: actionsId,
                    role: "assistant",
                    kind: "actions",
                    actions: [
                      { label: "Recommendation 1", value: "rec1" },
                      { label: "Recommendation 2", value: "rec2" },
                    ],
                  } as Msg,
                  {
                    id: supportId,
                    role: "assistant",
                    kind: "text",
                    text: "If you need immediate help, call us (+3706 465 8132) or send us an email (info@shop.lt). Would you like me to help you draft and send an email to our customer support manager?",
                  } as Msg,
                ])
            );
          }

          return newState;
        }

        return current;
      });
    }, 900);

    return () => clearTimeout(t);
  }, [messages]);

  const submit = () => {
    if (query.trim()) {
      send(query);
      if (view !== "chat") setView("chat");
    }
  };

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
            extra={
              view === "category" &&
              category &&
              showSubchips && <CategoryScreen items={SUBCHIPS[category]} onPick={pickSubChip} />
            }
          />
        </Modal.Screen>

        {view !== "explain" && (
          <div className="input-dock" ref={dockRef}>
            <InputBubble value={query} onChange={setQuery} onSubmit={submit} placeholder="Ask anything…" />
          </div>
        )}
      </Modal>
    </div>
  );
}
