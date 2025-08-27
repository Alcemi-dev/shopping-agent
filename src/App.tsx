import { useEffect, useRef, useState } from "react";
import { Background, AiButton, Modal, Chips, InputBubble } from "./components";
import Explain from "./components/Explain";

// --- nauja būsena vaizdui: pridedam "category"
type View = "explain" | "chips" | "typing" | "answer" | "category";

type Category = "Consultation" | "Order status" | "Shipping & delivery" | "Returns" | "Product Information" | "Payment";

const CHIP_ITEMS: Category[] = [
  "Consultation",
  "Order status",
  "Shipping & delivery",
  "Returns",
  "Product Information",
  "Payment",
];

// 5 sub-chipai kiekvienai kategorijai
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

// sakinys burbului pagal kategoriją
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
  const [answer, setAnswer] = useState("");

  // --- nauja būsena: kuri kategorija parinkta
  const [category, setCategory] = useState<Category | null>(null);

  const dockRef = useRef<HTMLDivElement>(null);
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  // ===== Helpers =====
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

  // ===== Dock height → CSS var --dock-h =====
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

  // ===== VisualViewport → html.kb-open (iOS/Android keyboards) =====
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

  // ===== Actions =====
  const reset = () => {
    setView("chips");
    setQuery("");
    setAnswer("");
    setCategory(null);
  };

  const submit = () => {
    const q = query.trim();
    if (!q) return;
    setAnswer(`(demo) Answer for: ${q}`);
    setView("answer");
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
    if (view === "answer") {
      setView("typing");
      requestAnimationFrame(() => focusTextarea());
    } else if (view === "typing") {
      setView("chips");
    } else if (view === "category") {
      // grįžtam iš kategorijos į pradinį chipų ekraną
      setCategory(null);
      setView("chips");
    } else {
      handleClose();
    }
  };

  // PRADINIO chipo paspaudimas → rodom kategorijos ekraną (nebe kopijuojam teksto į input)
  const pickTopChip = (v: string) => {
    const cat = v as Category;
    setCategory(cat);
    setView("category");
  };

  // Sub-chipo paspaudimas – kol kas idedam į input ir fokusas (galėsi pakeisti į submit ar kitą srautą)
  const pickSubChip = (v: string) => {
    setQuery(v);
    setView("typing");
    requestAnimationFrame(() => focusTextarea());
  };

  // Focus textarea automatically on "typing"
  useEffect(() => {
    if (!open || view !== "typing") return;
    focusTextarea();
  }, [open, view]);

  return (
    <div className="app-root">
      <Background />

      {!open && <AiButton onOpen={handleOpen} />}

      <Modal
        open={open}
        onClose={handleClose}
        onBack={handleBack}
        // H1 tekstas: explanation – vienas, kituose – kitas
        title={
          view === "explain" ? (
            <>
              Welcome to the AI-
              <span className="break--mobile">
                <br />
              </span>
              powered search
            </>
          ) : (
            <>
              Hello, what are you
              <span className="break--mobile">
                <br />
              </span>{" "}
              looking
              <span className="break--desktop">
                <br />
              </span>{" "}
              for today?
            </>
          )
        }
        // paslepiam H1 tik kategorijos vaizde (Modal'e tvarkoma per showTitle)
        showTitle={view !== "category"}
        mode={view === "answer" ? "answer" : "default"}
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
            {/* KATEGORIJOS ekranas */}
            {view === "category" && category && (
              <section className="category-screen" aria-live="polite">
                <p className="user-bubble">{sentenceFor(category)}</p>
                <p className="subquestion">What kind of information are you looking for?</p>
                <div className="chips-block">
                  <Chips items={SUBCHIPS[category]} onPick={pickSubChip} />
                </div>
              </section>
            )}

            {/* Pradiniai chipai – rodome tik "chips" ir "typing" vaizduose */}
            {(view === "chips" || view === "typing") && (
              <div className="suggestions">
                <Chips items={CHIP_ITEMS} onPick={pickTopChip} />
              </div>
            )}

            {/* Input dock OR Answer center (kaip buvo) */}
            {view !== "answer" ? (
              <div className="input-dock" ref={dockRef}>
                <InputBubble value={query} onChange={setQuery} onSubmit={submit} placeholder="Ask anything…" />
              </div>
            ) : (
              <div className="answer-center">
                <div className="answer-bubble">{answer}</div>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}
