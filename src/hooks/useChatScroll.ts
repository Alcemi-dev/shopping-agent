import { useEffect, useLayoutEffect, useState } from "react";
import type { RefObject } from "react";
import type { Msg } from "../types";

export function useChatScroll(logRef: RefObject<HTMLDivElement | null>, messages: Msg[]) {
  const [showHeadFade, setShowHeadFade] = useState(false);
  const [showFootFade, setShowFootFade] = useState(false);

  // scroll into view kai atsiranda nauja žinutė
  useLayoutEffect(() => {
    const el = logRef.current;
    if (!el || messages.length === 0) return;

    const lastMsg = messages[messages.length - 1];
    if (!lastMsg) return;

    const lastEl = el.querySelector(`[data-msg-id="${lastMsg.id}"]`);
    if (lastEl instanceof HTMLElement) {
      lastEl.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages, logRef]); // 👈 priklausomybė nuo viso messages, ne tik length

  // fade gradientai
  useEffect(() => {
    const el = logRef.current;
    if (!el) return;

    const onScroll = () => {
      setShowHeadFade(el.scrollTop > 0);
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 1;
      setShowFootFade(!atBottom);
    };

    onScroll();
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [logRef]);

  return { showHeadFade, showFootFade };
}
