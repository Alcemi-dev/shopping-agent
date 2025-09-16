import { useEffect, useState, useRef } from "react";
import "../styles/voice-screen.css";
import Chips from "../components/Chips";
import { CHIP_ITEMS } from "../types";

type VoiceScreenProps = {
  onBack: () => void;
  onPickChip: (val: string) => void;
  onVoiceStart: (opts?: { autoStart?: boolean }) => void; // 👈 leidžiam perduoti autoStart
};

export default function VoiceScreen({ onBack, onPickChip, onVoiceStart }: VoiceScreenProps) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 610);
  const [isCarousel, setIsCarousel] = useState(false);
  const chipsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 610px)");
    const update = () => setIsMobile(mq.matches);
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Tikrinam ar telpa vertikaliai
  useEffect(() => {
    const el = chipsRef.current;
    if (!el) return;

    const checkOverflow = () => {
      setIsCarousel(el.scrollHeight > el.clientHeight);
    };

    checkOverflow();
    window.addEventListener("resize", checkOverflow);
    return () => window.removeEventListener("resize", checkOverflow);
  }, []);

  return (
    <div className="voice-screen">
      <div className="voice-header">
        <h1 className="voice-title">Hello, what are you looking for today?</h1>
        <p className="voice-subtitle">
          {isMobile ? "Tap to type · Tap mic to speak" : "Tap mic to speak · Use keyboard to text chat"}
        </p>

        <div className={`voice-chips ${isCarousel ? "carousel" : "stack"}`} ref={chipsRef}>
          <Chips items={CHIP_ITEMS} onPick={(val) => onPickChip(val)} />
        </div>
      </div>

      {/* 👇 čia paspaudus pereina į VoiceChatScreen ir iškart paleidžia mic */}
      <button className="mic-btn" onClick={() => onVoiceStart({ autoStart: true })}>
        <img src="/img/voice-sphere.svg" alt="Mic" />
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
