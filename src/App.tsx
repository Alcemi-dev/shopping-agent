import { useEffect, useRef, useState } from "react";
import { Background, AiButton, Modal, Chips, InputBubble } from "./components";
import Explain from "./components/Explain";

type View = "explain" | "chips" | "typing" | "answer";
const CHIP_ITEMS = ["Product", "Information", "Support", "Brand assets", "Consultation", "Dresses for summer"];

export default function App() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("chips");
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");

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
    } else {
      handleClose();
    }
  };

  const pickChip = (v: string) => {
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
        title={view === "explain" ? "Welcome to the AI-powered search" : "Hello, what are you looking for today"}
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
            {/* Suggestions rail */}
            <div className="suggestions">
              <Chips items={CHIP_ITEMS} onPick={pickChip} />
            </div>

            {/* Input dock OR Answer center */}
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
