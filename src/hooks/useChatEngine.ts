import { useEffect, useRef, useState } from "react";
import type { Msg, Category, Collected } from "../types";
import { createMockEngine, sentenceFor } from "../mock/engine";

export function useChatEngine() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [, setCollected] = useState<Collected>({});
  const [cartCount, setCartCount] = useState(0);

  const engineRef = useRef(
    createMockEngine({
      setMessages,
      setCollected,
      delayMs: 900,
    })
  );

  useEffect(() => {
    engineRef.current.handleMessagesEffect(messages);
  }, [messages]);

  const sendMessage = (text: string, opts?: { source?: "chat" | "voice" }) => {
    if (text.trim()) {
      engineRef.current.send(text, opts);
    }
  };

  const addMessage = (msg: Msg) => {
    setMessages((prev) => [...prev, msg]);
  };

  const removeMessage = (id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  const replaceMessage = (id: string, newMsg: Msg) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? newMsg : m)));
  };

  /** Category pasirinkimas – tik user bubble + extra (CategoryScreen) */
  const pickCategory = (cat: Category) => {
    const userMsg: Msg = {
      id: crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      role: "user",
      kind: "text",
      text: sentenceFor(cat),
    };

    // 👇 Tik pridedam userMsg
    setMessages((prev) => [...prev, userMsg]);

    // ❌ Nebesiunčiam į engine → kad nebūtų loaderio ir default atsakymo
    // engineRef.current.send(userMsg.text, { source: "chat" });
  };

  const retry = (lastUser: string) => {
    setMessages((prev) => {
      const lastUserMsg = [...prev].reverse().find((m) => m.role === "user" && m.kind === "text");
      const lastErrorMsg = [...prev].reverse().find((m) => m.role === "assistant" && m.kind === "error");

      let filtered = prev;
      if (lastUserMsg) filtered = filtered.filter((m) => m.id !== lastUserMsg.id);
      if (lastErrorMsg) filtered = filtered.filter((m) => m.id !== lastErrorMsg.id);

      return filtered;
    });

    if (lastUser.trim()) {
      engineRef.current.send(lastUser, { source: "chat" });
    }
  };

  const handleChangeCart = (_title: string, delta: number) => {
    setCartCount((c) => Math.max(0, c + delta));
  };

  const reset = () => {
    setMessages([]);
    setCollected({});
    setCartCount(0);
  };

  return {
    messages,
    cartCount,
    sendMessage,
    addMessage,
    removeMessage,
    replaceMessage,
    pickCategory,
    retry,
    handleChangeCart,
    reset,
  };
}
