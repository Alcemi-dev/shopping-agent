// screens/VoiceScreen.tsx
import { useEffect, useState, useRef } from "react";
import "../styles/voice-screen.css";
import Chips from "../components/Chips";
import { CHIP_ITEMS } from "../types";
import { useSpeechToText } from "../hooks/useSpeechToText";

type VoiceScreenProps = {
  onBack: () => void;
  onPickChip: (val: string) => void;
  onVoiceResult: (text: string) => void;
};

export default function VoiceScreen({ onBack, onPickChip, onVoiceResult }: VoiceScreenProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 610);
  const { mode, text, toggleListening } = useSpeechToText(); // 👈 dabar toggleListening

  const chipsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 610px)");
    const update = () => setIsMobile(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (text) {
      onVoiceResult(text);
    }
  }, [text, onVoiceResult]);

  useEffect(() => {
    if (mode === "idle" && !text && chipsRef.current) {
      chipsRef.current.scrollLeft = 0;
    }
  }, [mode, text]);

  return (
    <div className="voice-screen">
      <div className="voice-header">
        <h1 className="voice-title">
          {mode === "error" ? "Couldn’t hear you" : "Hello, what are you looking for today?"}
        </h1>
        <p className="voice-subtitle">
          {mode === "listening"
            ? "Listening…"
            : isMobile
            ? "Tap to type · Tap mic to speak"
            : "Tap mic to speak · Use keyboard to text chat"}
        </p>

        {mode === "idle" && !text && (
          <div className="voice-chips" ref={chipsRef}>
            <Chips items={CHIP_ITEMS} onPick={onPickChip} />
          </div>
        )}
      </div>

      {/* Mic toggle */}
      <button className={`vc-mic ${mode === "listening" ? "is-listening" : ""}`} onClick={toggleListening}>
        <img
          src={
            mode === "listening"
              ? isMobile
                ? "/img/voice-chat-sphere-mobile.svg"
                : "/img/voice-chat-sphere-desktop.svg"
              : isMobile
              ? "/img/voice-sphere-mobile.svg"
              : "/img/voice-sphere-desktop.svg"
          }
        />
      </button>

      <div className="voice-footer">
        <button className="footer-btn">
          <img src="/img/speaker.svg" alt="Speaker" />
        </button>
        <button className="footer-btn" onClick={onBack}>
          <img src="/img/keyboard.svg" alt="Keyboard" />
        </button>
      </div>
    </div>
  );
}
