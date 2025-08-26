import { useEffect, useRef } from "react";
import VoiceIcon from "../assets/voice.svg?react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
};

export default function InputBubble({ value, onChange, onSubmit, placeholder = "Ask anything…" }: Props) {
  const taRef = useRef<HTMLTextAreaElement>(null);
  const MAX_H = 136; // kaip pas tave

  function autoresize(el: HTMLTextAreaElement) {
    el.style.height = "auto";
    const next = Math.min(el.scrollHeight, MAX_H);
    el.style.height = next + "px";
    el.style.overflowY = el.scrollHeight > next ? "auto" : "hidden";
  }

  function updateFade(el: HTMLTextAreaElement) {
    const wrap = el.closest(".input-wrap") as HTMLElement | null;
    if (!wrap) return;
    const hasOverflow = el.scrollHeight > el.clientHeight + 0.5;
    const atTop = el.scrollTop <= 0;
    wrap.classList.toggle("has-overflow", hasOverflow);
    wrap.classList.toggle("scrolled", !atTop);
    // Nebereikia „bottom glow“, todėl jokio has-more-below nepaliekam
  }

  useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    autoresize(el);
    // focus nečiuopiam – tą daro App pagal tavo flow
  }, []);

  return (
    <form
      className="input-wrap input-bubble"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <textarea
        ref={taRef}
        className="input-field"
        value={value}
        placeholder={placeholder}
        aria-label="Message"
        onInput={(e) => {
          const el = e.currentTarget;
          onChange(el.value);
          autoresize(el);
          updateFade(el);
        }}
        onScroll={(e) => updateFade(e.currentTarget)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
      />
      <button
        type="button"
        className="input-action"
        aria-label="Voice (coming soon)"
        aria-disabled="true"
        tabIndex={-1}
        onPointerDown={(e) => e.preventDefault()}
        onMouseDown={(e) => e.preventDefault()}
        onClick={(e) => e.preventDefault()}
      >
        <VoiceIcon width={20} height={20} aria-hidden="true" focusable="false" />
      </button>
      {/* Tik viršutinė „fade“ juosta */}
      <div className="input-fade-top" aria-hidden="true" />
    </form>
  );
}
