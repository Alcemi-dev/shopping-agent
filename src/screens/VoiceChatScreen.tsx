// screens/VoiceChatScreen.tsx
import { useEffect, useRef, useState } from "react";
import "../styles/voice-chat.css";
import { useSpeechToText } from "../hooks/useSpeechToText";

type QA = { question: string; answer?: string };

type Props = {
  onBack: () => void;
  onKeyboard: () => void;
};

const QUESTIONS = [
  "Hello, what are you looking for today?",
  "Do you have a preference for brand or budget?",
  "When do you plan to use this product most often?",
];

const FAKE_ANSWERS = [
  "I’m looking for a daily moisturizer that is lightweight, absorbs quickly without leaving my skin greasy, provides hydration throughout the whole day, and is gentle enough for sensitive skin that sometimes gets irritated by stronger products.",
  "I don’t really care much about the brand, but I’d like to keep it under 30 euros if possible, and still get something with good reviews and trusted quality.",
  "Mostly in the mornings before I head out, so something that layers well under makeup and won’t feel too heavy throughout the day would be ideal for me.",
];

export default function VoiceChatScreen({ onBack, onKeyboard }: Props) {
  const [qas, setQas] = useState<QA[]>([{ question: QUESTIONS[0] }]);
  const [step, setStep] = useState(0);

  const { mode, text, startListening } = useSpeechToText();

  const scrollRef = useRef<HTMLDivElement>(null);

  // kai gaunam tekstą → įrašom kaip atsakymą ir pereinam prie kito klausimo
  useEffect(() => {
    if (text) {
      setQas((prev) => {
        const copy = [...prev];
        copy[step] = { ...copy[step], answer: text };
        return copy;
      });

      // kitą klausimą + fake atsakymą po trumpo delay
      setTimeout(() => {
        if (step + 1 < QUESTIONS.length) {
          setQas((prev) => [...prev, { question: QUESTIONS[step + 1], answer: FAKE_ANSWERS[step + 1] }]);
          setStep((s) => s + 1);
        }
      }, 1500);
    }
  }, [text]);

  // auto scroll į apačią, kai pridedamas naujas Q/A
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    }
  }, [qas]);

  return (
    <div className="voicechat-screen">
      {/* Header */}
      <header className="vc-header">
        <button className="vc-back" onClick={onBack}>
          <img src="/img/back.svg" alt="Back" />
          <span>Back</span>
        </button>

        <div className="vc-logo">
          <img src="/img/logo-desktop.svg" alt="Alcemi" />
        </div>

        <button className="vc-close" onClick={onKeyboard}>
          <img src="/img/keyboard.svg" alt="Keyboard" />
        </button>
      </header>

      {/* Main content */}
      <div className="vc-log" ref={scrollRef}>
        {qas.map((qa, i) => (
          <div key={i} className="vc-block">
            <p className="vc-question">{qa.question}</p>
            {qa.answer && <p className="vc-answer">{qa.answer}</p>}
          </div>
        ))}
      </div>

      {/* Footer mic */}
      <footer className="vc-footer">
        <button className={`vc-mic ${mode === "listening" ? "is-listening" : ""}`} onClick={startListening}>
          <img src="/img/voice-chat-sphere-mobile.svg" alt="Mic" />
        </button>
        {mode === "listening" && <p className="vc-status">Listening…</p>}
        {mode === "error" && <p className="vc-status">Couldn’t hear you</p>}
      </footer>
    </div>
  );
}
