import { useCallback, useEffect, useState } from "react";

export function useVoice() {
  const [isListening, setIsListening] =
    useState(false);

  const [transcript, setTranscript] =
    useState("");

  const [error, setError] =
    useState(null);

  const [isSupported, setIsSupported] =
    useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const supported =
      "SpeechRecognition" in window ||
      "webkitSpeechRecognition" in window;

    setIsSupported(supported);
  }, []);

  const startListening = useCallback(() => {
    if (typeof window === "undefined") {
      return;
    }

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Voice recognition is not supported in this browser."
      );

      return;
    }

    setError(null);

    const recognition =
      new SpeechRecognition();

    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const result =
        event.results[0][0].transcript;

      setTranscript(result);
    };

    recognition.onerror = (event) => {
      setError(
        event.error ||
          "Voice recognition failed."
      );

      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript("");
    setError(null);
  }, []);

  return {
    isListening,
    transcript,
    error,
    isSupported,
    startListening,
    stopListening,
    clearTranscript,
  };
}

export default useVoice;