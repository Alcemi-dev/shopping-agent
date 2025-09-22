import { useEffect, useRef, useState } from "react";
import "../styles/voice-chat.css";
import { useChatScroll } from "../hooks/useChatScroll";
import { useSpeechToText } from "../hooks/useSpeechToText";
import type { AssistantTextMsg, Msg } from "../types";
import type { useChatEngine } from "../hooks/useChatEngine";
import { ProductsStripVoice } from "../components/ProductsStrip/ProductsStripVoice";
import { LoadingProducts } from "../components/LoadingProducts";
import { GeneratingAnswerIcon, VoiceSphereIcon, SpeakerIcon, KeyboardIcon } from "../components/SvgIcons";

type VoiceChatScreenProps = {
  chat: ReturnType<typeof useChatEngine>;
  onKeyboard: () => void;
  onBack?: () => void;
  autoStart?: boolean;
  initialQuestion?: string;
};

const VOICE_QUESTIONS = [
  "Question nr.1: Do you prefer vegan friendly options or have some specific needs to help us find you the best product?",
  "Question nr.2: Do you have any alergies or any medical problems?",
  "Question nr.3: Do you prefer shopping online or do you prefer going to the store?",
];

export default function VoiceChatScreen({
  chat,
  onKeyboard,
  autoStart,
  initialQuestion = "Hello, what are you looking for today?",
}: VoiceChatScreenProps) {
  const logRef = useRef<HTMLDivElement>(null);
  useChatScroll(logRef, chat.messages);

  const { mode, finalText, interimText, toggleListening } = useSpeechToText((msg) => {
    chat.addMessage(msg);
  });

  const [stepIndex, setStepIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(initialQuestion);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showNoInput, setShowNoInput] = useState(false);
  const [hadListening, setHadListening] = useState(false);
  const [, setHasSubmitted] = useState(false);

  // Resume
  useEffect(() => {
    const lastAssistant = [...chat.messages].reverse().find((m) => m.role === "assistant" && m.kind === "text");
    if (lastAssistant) {
      setCurrentQuestion(lastAssistant.text);
      setHasSubmitted(true);

      const idx = VOICE_QUESTIONS.findIndex((q) => q === lastAssistant.text);
      if (idx >= 0) setStepIndex(idx + 1);
    } else {
      setCurrentQuestion(initialQuestion);
      setStepIndex(0);
    }
  }, []);

  // Auto start mic
  useEffect(() => {
    if (autoStart) {
      const t = setTimeout(() => toggleListening(), 50);
      return () => clearTimeout(t);
    }
  }, [autoStart]);

  // Handle finalText
  useEffect(() => {
    if (!finalText) return;
    setShowNoInput(false);
    if (finalText.trim().length === 0) return;
    setHasSubmitted(true);

    const lower = finalText.toLowerCase();
    const keywords = [
      "one",
      "two",
      "three",
      "four",
      "five",
      "six",
      "seven",
      "eight",
      "many",
      "alternative",
      "more",
      "none",
      "feedback",
      "connection",
      "error",
    ];

    if (keywords.some((k) => lower.includes(k))) {
      chat.sendMessage(finalText, { source: "voice" });
      return;
    }

    // 👇 įdedam loading pranešimą prieš AI atsakymą
    const loaderMsg: Msg = {
      id: `loader-${Date.now()}`,
      role: "system",
      kind: "loading",
      target: "text",
    };
    chat.addMessage(loaderMsg);
    console.log("⏳ Added loader message", loaderMsg);

    if (stepIndex < VOICE_QUESTIONS.length) {
      setIsGenerating(true);
      const timeout = setTimeout(() => {
        const aiQ = VOICE_QUESTIONS[stepIndex];
        const aiMsg: Msg = {
          id: crypto.randomUUID?.() ?? `ai-${Date.now()}`,
          role: "assistant",
          kind: "text",
          text: aiQ,
        };
        chat.addMessage(aiMsg);
        setCurrentQuestion(aiQ);
        setStepIndex((s) => s + 1);
        setIsGenerating(false);
      }, 2000);
      return () => clearTimeout(timeout);
    } else {
      setIsGenerating(true);
      const processingMsg: AssistantTextMsg = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        kind: "text",
        text: "Processing your request…",
      };
      const timeout = setTimeout(() => {
        chat.addMessage(processingMsg);
        setCurrentQuestion(processingMsg.text);
        setStepIndex(0);
        setIsGenerating(false);
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [finalText]);

  // Track mic state
  useEffect(() => {
    if (mode === "listening") {
      setHadListening(true);
      setShowNoInput(false);
    }
    if (mode === "idle" && hadListening && !finalText && !interimText) {
      setShowNoInput(true);
      setHadListening(false);
    }
  }, [mode, finalText, interimText, hadListening]);

  // Follow-up handler
  const handleFollowUp = () => {
    const lastAssistant = [...chat.messages].reverse().find((m) => m.role === "assistant" && m.kind === "text");
    const followUpMsg: Msg = {
      id: crypto.randomUUID?.() ?? `ai-${Date.now()}`,
      role: "assistant",
      kind: "text",
      text: lastAssistant?.text ?? "Do you need any further assistance?",
    };
    chat.addMessage(followUpMsg);
    setCurrentQuestion(followUpMsg.text);
  };

  // paskutinė žinutė
  const lastMsg = [...chat.messages].reverse()[0];
  const isLoadingProducts = lastMsg?.kind === "loading" && (lastMsg as any).target === "products";
  const isLoadingText = lastMsg?.kind === "loading" && (lastMsg as any).target === "text";

  console.log("🎯 Debug lastMsg:", lastMsg);
  console.log(
    "⚡ isGenerating:",
    isGenerating,
    "isLoadingText:",
    isLoadingText,
    "isLoadingProducts:",
    isLoadingProducts
  );

  const showMic = !isGenerating && !isLoadingProducts && lastMsg?.kind !== "products";

  return (
    <div className={`voice-chat-screen ${mode === "listening" ? "listening" : ""}`}>
      {!showNoInput && mode === "listening" && !isGenerating && (
        <div className="vc-header">
          <div className="vc-header-line" />
          <h2 className="vc-question">{currentQuestion}</h2>
        </div>
      )}

      <div className="vc-body" ref={logRef}>
        {!showNoInput ? (
          <>
            {(() => {
              if (!lastMsg) return null;

              if (isLoadingProducts) {
                console.log("📦 Rodo product loading");
                return <LoadingProducts />;
              }

              // 👇 Loader rodom grynai pagal state, nepriklausomai nuo lastMsg
              if (isGenerating) {
                console.log("✍️ Rodo text generating (pagal isGenerating=true)");
                return (
                  <div className="vc-generating">
                    <GeneratingAnswerIcon />
                    <p>GENERATING ANSWER…</p>
                  </div>
                );
              }

              if (lastMsg.kind === "products") {
                return (
                  <ProductsStripVoice
                    key={lastMsg.id}
                    products={lastMsg.products}
                    header={lastMsg.header}
                    footer={lastMsg.footer}
                    visibleCount={lastMsg.visibleCount}
                    showMore={lastMsg.showMore}
                    onAddToCart={chat.handleChangeCart}
                    onFollowUp={handleFollowUp}
                    className="products-voice"
                  />
                );
              }

              if (lastMsg.role === "assistant" && lastMsg.kind === "text") {
                if (mode === "listening" || isGenerating) return null;
                return (
                  <>
                    <p className="vc-instruction">Answer the question or input any information you wish</p>
                    <div className="vc-answer vc-answer--ai">{lastMsg.text}</div>
                  </>
                );
              }

              if (lastMsg.role === "user" && lastMsg.kind === "text") {
                if (isGenerating || mode === "listening") return null;
                return <div className="vc-answer vc-answer--user">{lastMsg.text}</div>;
              }
              return null;
            })()}

            {mode === "listening" && interimText && <div className="vc-answer vc-answer--user">{interimText}</div>}
          </>
        ) : (
          <div className="vc-noinput-overlay">
            <p className="vc-noinput-title">Couldn’t hear you! Can you repeat?</p>
            <p className="vc-noinput-sub">Tap to type · Hold to speak</p>
          </div>
        )}
      </div>

      {showMic && (
        <div className="vc-mic-wrap">
          <button className={`vc-mic ${mode === "listening" ? "is-listening" : ""}`} onClick={toggleListening}>
            <VoiceSphereIcon />
            {mode === "listening" && <div className="vc-ripples"></div>}
          </button>
          {mode === "listening" && <span className="vc-status">LISTENING...</span>}
        </div>
      )}

      <div className="vc-footer">
        <button className="footer-btn left">
          <SpeakerIcon />
        </button>
        <button className="footer-btn right" onClick={onKeyboard}>
          <KeyboardIcon />
        </button>
      </div>
    </div>
  );
}
