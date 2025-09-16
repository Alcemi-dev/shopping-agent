import { useRef, useState } from "react";
import { uid } from "../mock/engine";
import type { Msg } from "../types";

type Mode = "idle" | "listening" | "error";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

// Priimam addMessage iš chatEngine
export function useSpeechToText(addMessage: (msg: Msg) => void) {
  const [mode, setMode] = useState<Mode>("idle");
  const [finalText, setFinalText] = useState<string>("");
  const [interimText, setInterimText] = useState<string>("");

  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<any>(null);
  const wasListening = useRef(false);

  const toggleListening = () => {
    if (mode === "listening") {
      stopListening();
      wasListening.current = true;
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) throw new Error("Speech API not supported");

      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        let transcript = "";
        let finalTranscript = "";

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) finalTranscript += result[0].transcript;
          else transcript += result[0].transcript;
        }

        if (transcript) {
          console.log("🎤 Interim voice text:", transcript);
          setInterimText(transcript);
          resetSilenceTimer();
        }
        if (finalTranscript) {
          console.log("✅ Final voice text:", finalTranscript.trim());
          setFinalText(finalTranscript);
          setInterimText("");
          resetSilenceTimer();

          const userMsg: Msg = {
            id: uid(),
            role: "user",
            kind: "text",
            text: finalTranscript.trim(),
          };
          console.log("👤 Adding userMsg to chat:", userMsg);
          addMessage(userMsg);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn("⚠️ Speech recognition error:", err);
        setMode("error");
      };

      recognition.onend = () => {
        console.log("ℹ️ Speech recognition ended");
        setMode("idle");
        recognitionRef.current = null;
        clearTimeout(silenceTimerRef.current);
      };

      recognition.start();
      recognitionRef.current = recognition;

      console.log("🎙️ Speech recognition started");
      setFinalText("");
      setInterimText("");
      setMode("listening");
      resetSilenceTimer();
    } catch (err) {
      console.warn("Speech recognition setup error:", err);
      setMode("error");
    }
  };

  const stopListening = () => {
    console.log("🛑 Stop listening");
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setMode("idle");
    clearTimeout(silenceTimerRef.current);
    wasListening.current = true;
  };

  const resetSilenceTimer = () => {
    clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      console.log("⏱️ Silence timeout reached → auto stop");
      stopListening();
    }, 4000);
  };

  return { mode, finalText, interimText, toggleListening, stopListening };
}
