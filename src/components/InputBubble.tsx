import { useEffect, useRef, forwardRef, useLayoutEffect } from "react";
import { SendButtonIcon, VoiceIcon } from './SvgIcons';

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
            {/* Inline mic icon */}
            <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 3.15234V15.1523M6 6.90234V11.4023M15 7.65234V10.6523M3 7.65234V10.6523M12 6.52734V12.9023"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11.458 3.52734C12.583 3.65234 13.208 4.27734 13.333 5.40234C13.458 4.27734 14.083 3.65234 15.208 3.52734C14.083 3.40234 13.458 2.77734 13.333 1.65234C13.208 2.77734 12.583 3.40234 11.458 3.52734Z"
                fill="currentColor"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="voice-label">Voice</span>
          </button>

          <button
            type="submit"
            className={`send-button ${value.trim().length === 0 ? "hidden" : ""}`}
            aria-label="Send message"
          >
            {/* Inline send.svg */}
            <svg width="18" height="19" viewBox="0 0 18 19" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10.7608 8.7764H5.07819C5.07819 8.58164 5.03733 8.38688 4.95634 8.20416L3.25256 4.39535C2.70781 3.17721 4.01091 1.95766 5.21223 2.56035L15.0901 7.51364C16.1366 8.03772 16.1366 9.51507 15.0901 10.0392L5.21294 14.9924C4.01091 15.5951 2.70781 14.3749 3.25256 13.1574L4.9549 9.34864C5.03536 9.16834 5.07686 8.97344 5.07675 8.7764"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>

        <div className="input-fade-top" aria-hidden="true" />
      </form>
    );
  }
);

export default InputBubble;
