import { useRef, useEffect, useState } from "react";

type Msg =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; text: string }
  | { id: string; role: "loading" };

export default function ChatScreen({ messages, extra }: { messages: Msg[]; extra?: React.ReactNode }) {
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, extra]);

  return (
    <div className="chat-log" ref={logRef} aria-live="polite">
      {messages.map((m) =>
        m.role === "user" ? (
          <div key={m.id} className="msg msg--user">
            <div className="msg-bubble">{m.text}</div>
          </div>
        ) : m.role === "assistant" ? (
          <div key={m.id} className="msg msg--ai">
            <p className="ai-text">{m.text}</p>
          </div>
        ) : (
          <div key={m.id} className="msg msg--ai">
            <LoadingRail />
          </div>
        )
      )}

      {/* 👇 čia pridedam papildomą turinį */}
      {extra}
    </div>
  );
}

function LoadingRail() {
  const frames: Array<[number, number, number, number, number]> = [
    [2, 1, 1, 1, 1],
    [3, 2, 1, 1, 1],
    [3, 3, 2, 1, 1],
    [3, 3, 3, 2, 1],
    [3, 3, 3, 3, 2],
    [3, 3, 3, 3, 3],
  ];
  const [f, setF] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setF((p) => (p + 1) % frames.length), 160);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="loading-rail" aria-label="Loading" role="status">
      {frames[f].map((n, i) => (
        <span key={i} className={`dash dash--${n}`} />
      ))}
    </div>
  );
}
