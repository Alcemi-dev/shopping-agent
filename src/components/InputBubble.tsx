import { useEffect, useRef, forwardRef } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
};

const InputBubble = forwardRef<HTMLTextAreaElement, Props>(
  ({ value, onChange, onSubmit, placeholder = "Ask anything…" }, ref) => {
    const taRef = useRef<HTMLTextAreaElement>(null);
    const MAX_H = 136;

    function autoresize(el: HTMLTextAreaElement) {
      el.style.height = "auto";
      const next = Math.min(el.scrollHeight, MAX_H);
      el.style.height = next + "px";
      el.style.overflowY = el.scrollHeight > next ? "auto" : "hidden";
      updateFade(el);
    }

    function resetSize(el: HTMLTextAreaElement) {
      el.style.height = "auto"; // resetinam
      el.style.overflowY = "hidden";
      updateFade(el);
    }

    function updateFade(el: HTMLTextAreaElement) {
      const wrap = el.closest(".input-wrap") as HTMLElement | null;
      if (!wrap) return;
      const hasOverflow = el.scrollHeight > el.clientHeight + 0.5;
      const atTop = el.scrollTop <= 0;
      wrap.classList.toggle("has-overflow", hasOverflow);
      wrap.classList.toggle("scrolled", !atTop);
    }

    useEffect(() => {
      const el = taRef.current;
      if (!el) return;
      autoresize(el);
    }, [value]);

    return (
      <form
        className="input-wrap input-bubble"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
          if (taRef.current) resetSize(taRef.current); // resetinam po submit
        }}
      >
        <textarea
          ref={(node) => {
            taRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref) (ref as any).current = node;
          }}
          className="input-field"
          value={value}
          placeholder={placeholder}
          aria-label="Message"
          onInput={(e) => {
            const el = e.currentTarget;
            onChange(el.value);
            autoresize(el);
          }}
          onScroll={(e) => updateFade(e.currentTarget)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSubmit();
              if (taRef.current) resetSize(taRef.current);
            }
          }}
        />

        <button type="submit" className="input-action" aria-label="Send message">
          <img src="/img/send-button.svg" alt="" width={32} height={32} />
        </button>

        {/* Gradient overlay */}
        <div className="input-fade-top" aria-hidden="true" />
      </form>
    );
  }
);

export default InputBubble;
