import { useRef, useState } from "react";

type Mode = "idle" | "listening" | "error";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useSpeechToText() {
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
          setInterimText(transcript);
          resetSilenceTimer();
        }
        if (finalTranscript) {
          setFinalText(finalTranscript);
          setInterimText("");
          resetSilenceTimer();
        }
      };

      recognition.onerror = () => {
        setMode("error");
      };

      recognition.onend = () => {
        setMode("idle");
        recognitionRef.current = null;
        clearTimeout(silenceTimerRef.current);
      };

      recognition.start();
      recognitionRef.current = recognition;

      setFinalText("");
      setInterimText("");
      setMode("listening");
      resetSilenceTimer();
    } catch (err) {
      console.warn("Speech recognition error:", err);
      setMode("error");
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setMode("idle");
    clearTimeout(silenceTimerRef.current);
    wasListening.current = true;
  };

  const resetSilenceTimer = () => {
    clearTimeout(silenceTimerRef.current);
    silenceTimerRef.current = setTimeout(() => {
      stopListening(); // auto stop after 4s silence
    }, 4000);
  };

  return { mode, finalText, interimText, toggleListening, stopListening };
}
