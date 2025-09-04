import { useEffect, useRef, forwardRef, useLayoutEffect } from "react";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  placeholder?: string;
};

const InputBubble = forwardRef<HTMLTextAreaElement, Props>(
  ({ value, onChange, onSubmit, placeholder = "Ask anything…" }, ref) => {
    const taRef = useRef<HTMLTextAreaElement>(null);
    const roRef = useRef<ResizeObserver | null>(null);
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
      // Saugiam perskaičiavimui — pirma nuliojam, tada matuojam
      el.style.height = "auto";
      const next = Math.min(el.scrollHeight, MAX_H);
      el.style.height = next + "px";
      el.style.overflowY = el.scrollHeight > next ? "auto" : "hidden";
      updateFade(el);
    }

    function resetSize(el: HTMLTextAreaElement) {
      el.style.height = "auto";
      el.style.overflowY = "hidden";
      updateFade(el);
    }

    // 1) Perskaičiuoti kai keičiasi value
    useEffect(() => {
      const el = taRef.current;
      if (!el) return;
      autoresize(el);
    }, [value]);

    // 2) Perskaičiuoti kai keičiasi layout (breakpoint’ai, modal width ir pan.)
    useLayoutEffect(() => {
      const el = taRef.current;
      if (!el) return;

      // pradinė būsena
      autoresize(el);

      // ResizeObserver ant textarea ir jos wrap’o
      const wrap = el.closest(".input-wrap") as HTMLElement | null;
      const ro = new ResizeObserver(() => {
        // Vengiame sinchroninio reflow — atidedam į kitą frame
        requestAnimationFrame(() => {
          if (taRef.current) autoresize(taRef.current);
        });
      });
      ro.observe(el);
      if (wrap) ro.observe(wrap);
      roRef.current = ro;

      // Fallback: lango resize / orientationchange
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
          if (taRef.current) resetSize(taRef.current); // reset po submit
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
              e.currentTarget.form?.requestSubmit();
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
