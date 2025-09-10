// hooks/useSpeechToText.ts
import { useEffect, useRef, useState } from "react";

type Mode = "idle" | "listening" | "error";

export function useSpeechToText() {
  const [mode, setMode] = useState<Mode>("idle");
  const [text, setText] = useState<string>("");
  const recognitionRef = useRef<any>(null);

  // Ilgas testinis fallback sakinys
  const fallbackText =
    "I’m looking for a daily moisturizer that is lightweight, absorbs quickly without leaving my skin greasy, provides hydration throughout the whole day, and is gentle enough for sensitive skin that sometimes gets irritated by stronger products.";

  const startListening = () => {
    setMode("listening");
    setText("");

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        throw new Error("Speech API not supported");
      }

      const recognition = new SpeechRecognition();
      recognition.lang = "en-US";
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setText(transcript);
        setMode("idle");
      };

      recognition.onerror = () => {
        setMode("error");
      };

      recognition.onend = () => {
        // jei nieko nepasakyta → fallback
        if (!text) {
          setText(fallbackText);
          setMode("idle");
        }
      };

      recognition.start();
      recognitionRef.current = recognition;
    } catch (err) {
      console.warn("Speech recognition error:", err);
      // jei nepalaiko → fallback po 3s
      setTimeout(() => {
        if (!text) {
          setText(fallbackText);
          setMode("idle");
        }
      }, 3000);
    }
  };

  const stopListening = () => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setMode("idle");
  };

  return { mode, text, startListening, stopListening };
}
