import { useEffect, useRef, useState } from "react";
import "../styles/voice-chat.css";
import { useChatEngine } from "../hooks/useChatEngine";
import { useChatScroll } from "../hooks/useChatScroll";
import { useSpeechToText } from "../hooks/useSpeechToText";

type VoiceChatScreenProps = {
  onKeyboard: () => void;
  onBack?: () => void;
};

const VOICE_QUESTIONS = [
  "Question 1: Do you prefer cream or gel?",
  "Question 2: Any allergies?",
  "Question 3: Do you shop online or in store?",
];

export default function VoiceChatScreen({ onKeyboard }: VoiceChatScreenProps) {
  const chat = useChatEngine();
  const logRef = useRef<HTMLDivElement>(null);
  useChatScroll(logRef, chat.messages);

  const { mode, finalText, interimText, toggleListening } = useSpeechToText();

  const [stepIndex, setStepIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState("Hello, what are you looking for today?");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNoInput, setShowNoInput] = useState(false);
  const [hadListening, setHadListening] = useState(false);

  // Kai gaunam galutinį tekstą
  useEffect(() => {
    if (!finalText) return;

    setShowNoInput(false);

    if (finalText.trim().length === 0) return;

    if (stepIndex < VOICE_QUESTIONS.length) {
      chat.addMessage({
        id: `user-${Date.now()}`,
        role: "user",
        kind: "text",
        text: finalText,
      });

      setIsGenerating(true);
      const timeout = setTimeout(() => {
        const aiQ = VOICE_QUESTIONS[stepIndex];
        chat.addMessage({
          id: `ai-q-${Date.now()}`,
          role: "assistant",
          kind: "text",
          text: aiQ,
        });
        setCurrentQuestion(aiQ);
        setStepIndex((s) => s + 1);
        setIsGenerating(false);
      }, 2000);

      return () => clearTimeout(timeout);
    } else {
      setIsGenerating(true);
      chat.sendMessage(finalText);
      setCurrentQuestion("Processing your request…");
      setStepIndex(0);

      const timeout = setTimeout(() => {
        setIsGenerating(false);
      }, 3000);

      return () => clearTimeout(timeout);
    }
  }, [finalText]);

  // Stebim mic būseną
  useEffect(() => {
    if (mode === "listening") {
      setHadListening(true);
    }

    if (mode === "idle" && hadListening && !finalText && !interimText) {
      setShowNoInput(true);
      setHadListening(false); // resetinam
    }
  }, [mode, finalText, interimText, hadListening]);

  return (
    <div className={`voice-chat-screen ${mode === "listening" ? "listening" : ""}`}>
      {/* HEADER */}
      {!isGenerating && !showNoInput && (
        <div className="vc-header">
          <div className="vc-header-line" />
          <h2 className="vc-question">{currentQuestion}</h2>
        </div>
      )}

      {/* BODY */}
      <div className="vc-body" ref={logRef}>
        {interimText && !isGenerating && !showNoInput && <div className="vc-answer">{interimText}</div>}

        {showNoInput && (
          <div className="vc-error">
            <p>Couldn’t hear you. Please try again.</p>
          </div>
        )}

        {isGenerating && finalText && (
          <div className="vc-generating">
            <img src="/img/generating-answer.svg" alt="Generating" />
            <p>Generating answer…</p>
          </div>
        )}
      </div>

      {/* MIC ZONA virš footerio */}
      {!isGenerating && (
        <div className="vc-mic-wrap">
          <button className={`vc-mic ${mode === "listening" ? "is-listening" : ""}`} onClick={toggleListening}>
            <img src="/img/voice-sphere.svg" alt="Mic" />
            {mode === "listening" && (
              <>
                <span className="vc-status">LISTENING...</span>
                <div className="vc-ripples"></div>
              </>
            )}
          </button>
        </div>
      )}

      {/* FOOTER su iconomis */}
      <div className="vc-footer">
        <button className="footer-btn left">
          <img src="/img/speaker.svg" alt="Speaker" />
        </button>
        <button className="footer-btn right" onClick={onKeyboard}>
          <img src="/img/keyboard.svg" alt="Keyboard" />
        </button>
      </div>
    </div>
  );
}
