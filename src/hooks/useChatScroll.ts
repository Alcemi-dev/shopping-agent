import { useEffect, useLayoutEffect, useState } from "react";
import type { RefObject } from "react";
import type { Msg } from "../types";

export function useChatScroll(logRef: RefObject<HTMLDivElement | null>, messages: Msg[]) {
  const [showHeadFade, setShowHeadFade] = useState(false);
  const [showFootFade, setShowFootFade] = useState(false);

  // scroll into last message smoothly
  useLayoutEffect(() => {
    const el = logRef.current;
    if (!el || messages.length === 0) return;

    const lastMsgId = messages[messages.length - 1]?.id;
    if (!lastMsgId) return;

    const lastEl = el.querySelector(`[data-msg-id="${lastMsgId}"]`);
    if (lastEl instanceof HTMLElement) {
      lastEl.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages.length, logRef]);

  // fades (head/foot gradient matomumas)
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
