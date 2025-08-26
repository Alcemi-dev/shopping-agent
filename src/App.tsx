import { useEffect, useRef, useState } from "react";

import Background from "./app/Background";
import AiButton from "./app/AiButton";
import Modal from "./app/Modal";
import Chips from "./app/Chips";

import Button from "./components/Button";
import IconButton from "./components/IconButton";
import Chip from "./components/Chip";
import InputBubble from "./components/InputBubble";

import "./styles/layout.css";
import "./styles/button.css";
import "./styles/chips.css";
import VoiceIcon from "./assets/voice.svg";

type View = "chips" | "typing" | "answer";
const CHIP_ITEMS = ["Product", "Information", "Support", "Brand assets", "Consultation", "Dresses for summer"];

export default function App() {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("chips");
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");

  const taRef = useRef<HTMLTextAreaElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const MAX_H = 136;

  function updateFade(el: HTMLTextAreaElement) {
    const wrap = el.closest(".input-wrap") as HTMLElement | null;
    if (!wrap) return;

    const hasOverflow = el.scrollHeight > el.clientHeight + 0.5;
    const atTop = el.scrollTop <= 0;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 0.5;

    wrap.classList.toggle("has-overflow", hasOverflow);
    wrap.classList.toggle("scrolled", !atTop);
    wrap.classList.toggle("has-more-below", !atBottom);
  }

  function autoresize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, MAX_H);
    el.style.height = next + "px";
    el.style.overflowY = el.scrollHeight > next ? "auto" : "hidden";
  }

  // Fokusas į textarea kai atidarom modalą ir pereinam į "typing"
  useEffect(() => {
    if (!open || view !== "typing") return;
    const el = taRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.focus();
      el.selectionStart = el.value.length;
      el.selectionEnd = el.value.length;
      autoresize(el);
    });
  }, [open, view]);

  // Keyboard state: add/remove html.kb-open TIK kai realiai susitraukia viewport (tikra klaviatūra)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const root = document.documentElement;

    if (!open) {
      root.classList.remove("kb-open");
      return;
    }

    const vv = window.visualViewport || null;
    const THRESHOLD = 240;

    let baseHeight = 0;
    const currentVVH = () => (vv ? vv.height : window.innerHeight);

    const updateBase = () => {
      const h = currentVVH();
      if (!root.classList.contains("kb-open")) {
        baseHeight = Math.max(baseHeight, h);
      }
    };

    const recompute = () => {
      const h = currentVVH();
      const delta = Math.max(0, baseHeight - h);
      const shouldOpen = delta > THRESHOLD;
      root.classList.toggle("kb-open", shouldOpen);
    };

    const handleVVChange = () => {
      updateBase();
      requestAnimationFrame(recompute);
    };

    const handleOrientation = () => {
      root.classList.remove("kb-open");
      baseHeight = 0;
      requestAnimationFrame(() => {
        updateBase();
        recompute();
      });
    };

    // Fallback labai seniems browseriams be visualViewport
    const isEditable = (el: Element | null) =>
      !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || (el as HTMLElement).isContentEditable);

    const onFocusIn = (e: FocusEvent) => {
      if (!vv && isEditable(e.target as Element)) root.classList.add("kb-open");
    };
    const onFocusOut = () => {
      if (!vv) root.classList.remove("kb-open");
    };

    // Init
    updateBase();
    recompute();

    vv?.addEventListener("resize", handleVVChange);
    vv?.addEventListener("scroll", handleVVChange);
    window.addEventListener("resize", handleVVChange);
    window.addEventListener("orientationchange", handleOrientation);

    document.addEventListener("focusin", onFocusIn, true);
    document.addEventListener("focusout", onFocusOut, true);

    return () => {
      vv?.removeEventListener("resize", handleVVChange);
      vv?.removeEventListener("scroll", handleVVChange);
      window.removeEventListener("resize", handleVVChange);
      window.removeEventListener("orientationchange", handleOrientation);
      document.removeEventListener("focusin", onFocusIn, true);
      document.removeEventListener("focusout", onFocusOut, true);
      root.classList.remove("kb-open");
    };
  }, [open]);

  // Reali .input-dock aukščio metrika → --dock-h
  useEffect(() => {
    if (typeof window === "undefined" || !open) return;
    const root = document.documentElement;
    const dock = dockRef.current;
    if (!dock) return;

    const setDockH = () => {
      const h = Math.ceil(dock.getBoundingClientRect().height || 0);
      root.style.setProperty("--dock-h", `${h}px`);
    };

    const ro = new ResizeObserver(() => requestAnimationFrame(setDockH));
    ro.observe(dock);

    const vv = window.visualViewport;
    const onVV = () => requestAnimationFrame(setDockH);

    vv?.addEventListener("resize", onVV);
    vv?.addEventListener("scroll", onVV);
    window.addEventListener("orientationchange", onVV);
    window.addEventListener("resize", onVV);

    setDockH();

    return () => {
      ro.disconnect();
      vv?.removeEventListener("resize", onVV);
      vv?.removeEventListener("scroll", onVV);
      window.removeEventListener("orientationchange", onVV);
      window.removeEventListener("resize", onVV);
      root.style.removeProperty("--dock-h");
    };
  }, [open]);

  function pickChip(v: string) {
    setQuery(v);
    setView("typing");
    requestAnimationFrame(() => {
      if (taRef.current) autoresize(taRef.current);
    });
  }

  function submit() {
    if (!query.trim()) return;
    setTimeout(() => {
      setAnswer("AI answer will be displayed in this bubble…");
      setView("answer");
    }, 400);
  }

  function reset() {
    setQuery("");
    setAnswer("");
    setView("chips");
  }

  function handleBack() {
    if (view === "answer") {
      setView("typing");
      requestAnimationFrame(() => taRef.current?.focus());
    } else if (view === "typing") {
      setView("chips");
    } else {
      setOpen(false);
    }
  }

  return (
    <div className="app-shell">
      <Background />
      {import.meta.env.DEV && !open && (
        <div className="dev-pane">
          <Button>Primary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <IconButton label="Close">
            <img src="/img/close.svg" alt="" />
          </IconButton>
          <Chip>Consultation</Chip>
          <Chip selected>Order status</Chip>
        </div>
      )}

      {!open && (
        <AiButton
          onOpen={() => {
            setOpen(true);
            reset();
            requestAnimationFrame(() => taRef.current?.focus());
          }}
        />
      )}

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        onBack={handleBack}
        title="Hello, what are you looking for today?"
        mode={view === "answer" ? "answer" : "default"}
      >
        {view !== "answer" && (
          <div className="suggestions">
            <Chips items={CHIP_ITEMS} onPick={pickChip} />
          </div>
        )}

        {view !== "answer" ? (
          <div className="input-dock" ref={dockRef}>
            <InputBubble value={query} onChange={setQuery} onSubmit={submit} placeholder="Ask anything…" />
          </div>
        ) : (
          <div className="answer-center">
            {/* paliekam kaip yra */}
            <div className="answer-bubble">{answer}</div>
          </div>
        )}
      </Modal>
    </div>
  );
}
