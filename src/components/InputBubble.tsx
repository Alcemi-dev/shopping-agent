import { useEffect, useRef, forwardRef, useLayoutEffect } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onVoice?: () => void;
  placeholder?: string;
};

const InputBubble = forwardRef<HTMLTextAreaElement, Props>(
  ({ value, onChange, onSubmit, onVoice, placeholder = "Ask anything…" }, ref) => {
    const taRef = useRef<HTMLTextAreaElement>(null);
    const roRef = useRef<ResizeObserver | null>(null);

    const MIN_H = 24;
    const MAX_H = 136;

    function updateFade(el: HTMLTextAreaElement) {
      const wrap = el.closest(".input-wrap") as HTMLElement | null;
      if (!wrap) return;
      const hasOverflow = el.scrollHeight > el.clientHeight + 0.5;
      const atTop = el.scrollTop <= 0;
      wrap.classList.toggle("has-overflow", hasOverflow);
      wrap.classList.toggle("scrolled", !atTop);
    }

    function autoresize(el: HTMLTextAreaElement) {
      el.style.height = MIN_H + "px";
      const next = Math.min(el.scrollHeight, MAX_H);
      el.style.height = next + "px";
      el.style.overflowY = el.scrollHeight > MAX_H ? "auto" : "hidden";
      updateFade(el);
    }

    function resetSize(el: HTMLTextAreaElement) {
      el.style.height = MIN_H + "px";
      el.style.overflowY = "hidden";
      updateFade(el);
    }

    useEffect(() => {
      if (taRef.current) autoresize(taRef.current);
    }, [value]);

    useLayoutEffect(() => {
      const el = taRef.current;
      if (!el) return;
      autoresize(el);

      const wrap = el.closest(".input-wrap") as HTMLElement | null;
      const ro = new ResizeObserver(() => {
        requestAnimationFrame(() => {
          if (taRef.current) autoresize(taRef.current);
        });
      });
      ro.observe(el);
      if (wrap) ro.observe(wrap);
      roRef.current = ro;

      const onWinResize = () => {
        if (!taRef.current) return;
        requestAnimationFrame(() => autoresize(taRef.current!));
      };
      window.addEventListener("resize", onWinResize);
      window.addEventListener("orientationchange", onWinResize);

      return () => {
        ro.disconnect();
        roRef.current = null;
        window.removeEventListener("resize", onWinResize);
        window.removeEventListener("orientationchange", onWinResize);
      };
    }, []);

    return (
      <form
        className="input-wrap input-bubble"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
          if (taRef.current) resetSize(taRef.current);
        }}
      >
        <textarea
          name="message"
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
              e.currentTarget.form?.requestSubmit();
              if (taRef.current) resetSize(taRef.current);
            }
          }}
        />

        <div className="button-group">
          <button
            type="button"
            className={`voice-button ${value.trim().length > 0 ? "hidden" : ""}`}
            aria-label="Start voice input"
            onClick={onVoice}
          >
            <img src="/img/voice.svg" alt="Voice button" />
          </button>

          <button
            type="submit"
            className={`send-button ${value.trim().length === 0 ? "hidden" : ""}`}
            aria-label="Send message"
          >
            <img src="/img/send-button.svg" alt="Send" />
          </button>
        </div>

        <div className="input-fade-top" aria-hidden="true" />
      </form>
    );
  }
);

export default InputBubble;
