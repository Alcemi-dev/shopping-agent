// screens/VoiceScreen.tsx
import { useEffect, useState } from "react";
import "../styles/voice-screen.css";
import Chips from "../components/Chips";
import { CHIP_ITEMS } from "../types";
import { ProductsStripMessage } from "../components/ProductsStripMessage";
import type { Product } from "./ChatScreen";
import { useSpeechToText } from "../hooks/useSpeechToText";

type Props = {
  onBack: () => void;
  onPickChip: (val: string) => void;
  onVoiceResult: (text: string) => void;
  products?: Product[];
};

export default function VoiceScreen({ onBack, onPickChip, onVoiceResult, products }: Props) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 610);
  const { mode, text, startListening } = useSpeechToText();

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 610px)");
    const update = () => setIsMobile(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Kai gaunam tekstą → paduodam į engine
  useEffect(() => {
    if (text) {
      onVoiceResult(text);
    }
  }, [text, onVoiceResult]);

  return (
    <div className="voice-screen">
      {/* Header */}
      <div className="voice-header">
        <h1 className="voice-title">
          {mode === "error" ? "Couldn’t hear you" : "Hello, what are you looking for today?"}
        </h1>
        <p className="voice-subtitle">
          {mode === "listening"
            ? "Listening…"
            : isMobile
            ? "Tap to type · Hold to speak"
            : "Tap to speak · Use keyboard to text chat"}
        </p>
        {mode === "idle" && !text && (
          <div className="voice-chips">
            <Chips items={CHIP_ITEMS} onPick={onPickChip} />
          </div>
        )}
      </div>

      {/* Mic */}
      <button
        className={`mic-btn ${mode === "listening" ? "listening" : ""}`}
        aria-label="Start/stop voice input"
        onClick={startListening}
      >
        <img src={isMobile ? "/img/voice-sphere-mobile.svg" : "/img/voice-sphere-desktop.svg"} alt="Voice sphere" />
      </button>

      {/* Products (jei yra) */}
      {products && (
        <div style={{ width: "100%" }}>
          <ProductsStripMessage products={products} />
        </div>
      )}

      {/* Footer */}
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
