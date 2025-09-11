import { useRef, useState } from "react";

type Mode = "idle" | "listening" | "error";

// 👇 papildom global window, kad TS žinotų
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export function useSpeechToText() {
  const [mode, setMode] = useState<Mode>("idle");
  const [text, setText] = useState<string>("");

  const recognitionRef = useRef<any>(null);
  const fallbackText =
    "I’m looking for a daily moisturizer that is lightweight, absorbs quickly without leaving my skin greasy, provides hydration throughout the whole day, and is gentle enough for sensitive skin.";

  const toggleListening = () => {
    if (mode === "listening") {
      // sustabdom
      recognitionRef.current?.stop();
      recognitionRef.current = null;
      setMode("idle");
      return;
    }

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

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
        setMode("idle"); // kai gauta – baigiam klausymą
      };

      recognition.onerror = () => {
        setMode("error");
      };

      recognition.onend = () => {
        // jei buvo klausymo režime, bet negavom teksto → fallback
        if (mode === ("listening" as Mode) && !text) {
          setTimeout(() => {
            setText(fallbackText);
            setMode("idle");
          }, 1000);
        }
        recognitionRef.current = null;
      };

      recognition.start();
      recognitionRef.current = recognition;

      setText("");
      setMode("listening"); // 👈 dabar iškart įjungi pulsavimą
    } catch (err) {
      console.warn("Speech recognition error:", err);
      setTimeout(() => {
        setText(fallbackText);
        setMode("idle");
      }, 1000);
    }
  };

  return { mode, text, toggleListening };
}
