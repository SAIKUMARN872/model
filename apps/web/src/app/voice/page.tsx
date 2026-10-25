"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Send,
  MessageSquare,
  Loader2,
  Bot,
  User,
} from "lucide-react";

type VoiceStatus = "idle" | "listening" | "processing" | "speaking";

type VoiceMessage = {
  id: number;
  role: "user" | "assistant";
  text: string;
};

type SpeechRecognitionEventLike = {
  results: {
    [index: number]: {
      [index: number]: {
        transcript: string;
      };
    };
  };
};

type SpeechRecognitionErrorEventLike = {
  error: string;
};

interface SpeechRecognitionLike {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult:
    | ((event: SpeechRecognitionEventLike) => void)
    | null;
  onerror:
    | ((event: SpeechRecognitionErrorEventLike) => void)
    | null;
  onend: (() => void) | null;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

export default function VoicePage() {
  const router = useRouter();

  const [status, setStatus] = useState<VoiceStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [input, setInput] = useState("");
  const [voiceOutput, setVoiceOutput] = useState(true);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [error, setError] = useState("");

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const messageIdRef = useRef(1);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const speakText = (text: string) => {
    if (!voiceOutput || typeof window === "undefined") {
      setStatus("idle");
      return;
    }

    if (!("speechSynthesis" in window)) {
      setStatus("idle");
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    utterance.lang = "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setStatus("speaking");
    };

    utterance.onend = () => {
      setStatus("idle");
    };

    utterance.onerror = () => {
      setStatus("idle");
    };

    window.speechSynthesis.speak(utterance);
  };

  const startListening = () => {
    if (typeof window === "undefined") {
      return;
    }

    setError("");

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech recognition is not supported in this browser. Please use Google Chrome."
      );
      return;
    }

    if (status === "listening") {
      recognitionRef.current?.stop();
      setStatus("idle");
      return;
    }

    window.speechSynthesis?.cancel();

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      let finalText = "";
      let interimText = "";

      for (let i = 0; i < Object.keys(event.results).length; i++) {
        const result = event.results[i];

        if (!result) {
          continue;
        }

        const text = result[0]?.transcript || "";

        if (i === Object.keys(event.results).length - 1) {
          interimText += text;
        } else {
          finalText += text;
        }
      }

      const combinedText =
        `${finalText} ${interimText}`.trim();

      setTranscript(combinedText);
      setInput(combinedText);
    };

    recognition.onerror = (event) => {
      setStatus("idle");

      if (event.error === "not-allowed") {
        setError(
          "Microphone permission was denied. Please allow microphone access in your browser."
        );
      } else if (event.error === "no-speech") {
        setError("No speech detected. Please try again.");
      } else {
        setError("Voice recognition stopped. Please try again.");
      }
    };

    recognition.onend = () => {
      setStatus((current) =>
        current === "listening" ? "idle" : current
      );
    };

    recognitionRef.current = recognition;
    setStatus("listening");

    try {
      recognition.start();
    } catch {
      setStatus("idle");
      setError("Unable to start microphone. Please try again.");
    }
  };

  const generateAIResponse = (prompt: string) => {
    const normalized = prompt.toLowerCase();

    if (normalized.includes("hello") || normalized.includes("hi")) {
      return "Hello! I am ModelNow Voice Assistant. How can I help you today?";
    }

    if (
      normalized.includes("modelnow") ||
      normalized.includes("model now")
    ) {
      return "ModelNow is an AI platform designed to help users work with multiple AI capabilities including agents, automation, RAG, multimodal AI, and model optimization.";
    }

    if (
      normalized.includes("career") ||
      normalized.includes("job")
    ) {
      return "I can help you explore career options, identify skill gaps, prepare for interviews, and create a learning roadmap.";
    }

    if (
      normalized.includes("rag") ||
      normalized.includes("knowledge")
    ) {
      return "ModelNow can use Knowledge and RAG to retrieve relevant information from connected documents and knowledge sources before generating an AI response.";
    }

    if (
      normalized.includes("agent") ||
      normalized.includes("workflow")
    ) {
      return "Agent workflows allow ModelNow to coordinate multiple AI steps and tools to complete a task instead of generating only a single response.";
    }

    if (
      normalized.includes("browser") ||
      normalized.includes("automation")
    ) {
      return "Browser automation allows an AI workflow to interact with supported websites and complete approved browser-based tasks.";
    }

    return `I received your request: "${prompt}". ModelNow can process this prompt and provide an AI-generated response through the voice interface.`;
  };

  const processPrompt = async (prompt?: string) => {
    const finalPrompt = (prompt ?? input).trim();

    if (!finalPrompt) {
      setError("Please enter a message or use the microphone.");
      return;
    }

    setError("");
    window.speechSynthesis?.cancel();

    const userMessage: VoiceMessage = {
      id: messageIdRef.current++,
      role: "user",
      text: finalPrompt,
    };

    setMessages((previous) => [
      ...previous,
      userMessage,
    ]);

    setInput("");
    setTranscript("");
    setStatus("processing");

    /*
      ModelNow backend integration can be added here.

      Example:

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: finalPrompt,
        }),
      });

      const data = await response.json();

      const aiResponse = data.message;
    */

    await new Promise<void>((resolve) => {
      window.setTimeout(resolve, 900);
    });

    const aiResponse = generateAIResponse(finalPrompt);

    const assistantMessage: VoiceMessage = {
      id: messageIdRef.current++,
      role: "assistant",
      text: aiResponse,
    };

    setMessages((previous) => [
      ...previous,
      assistantMessage,
    ]);

    if (voiceOutput) {
      speakText(aiResponse);
    } else {
      setStatus("idle");
    }
  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();
    void processPrompt();
  };

  const clearConversation = () => {
    window.speechSynthesis?.cancel();
    recognitionRef.current?.abort();

    setMessages([]);
    setInput("");
    setTranscript("");
    setError("");
    setStatus("idle");
  };

  const getStatusText = () => {
    switch (status) {
      case "listening":
        return "Listening...";
      case "processing":
        return "ModelNow is processing...";
      case "speaking":
        return "AI is speaking...";
      default:
        return "Ready for voice";
    }
  };

  const isBusy =
    status === "listening" ||
    status === "processing" ||
    status === "speaking";

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#171717]">
      <div className="flex min-h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden w-[270px] shrink-0 border-r border-[#e5e5e5] bg-white lg:flex lg:flex-col">
          <div className="flex h-16 items-center border-b border-[#e5e5e5] px-5">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-sm font-semibold hover:opacity-70"
            >
              <ArrowLeft size={18} />
              ModelNow
            </button>
          </div>

          <div className="flex-1 px-3 py-4">
            <div className="mb-2 px-3 text-xs font-medium uppercase tracking-wide text-[#737373]">
              Voice
            </div>

            <button
              className="flex w-full items-center gap-3 rounded-lg bg-[#f3f3f3] px-3 py-2.5 text-sm font-medium"
            >
              <MessageSquare size={17} />
              Voice Assistant
            </button>

            <button
              onClick={clearConversation}
              className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#555] hover:bg-[#f5f5f5]"
            >
              <MessageSquare size={17} />
              New Voice Chat
            </button>
          </div>

          <div className="border-t border-[#e5e5e5] p-4">
            <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3">
              <div className="text-xs font-semibold text-[#444]">
                Voice Pipeline
              </div>

              <div className="mt-2 space-y-2 text-xs text-[#737373]">
                <div className="flex items-center gap-2">
                  <Mic size={13} />
                  Voice Input
                </div>

                <div className="flex items-center gap-2">
                  <MessageSquare size={13} />
                  Speech-to-Text
                </div>

                <div className="flex items-center gap-2">
                  <Bot size={13} />
                  AI Processing
                </div>

                <div className="flex items-center gap-2">
                  <Volume2 size={13} />
                  Text-to-Speech
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex min-w-0 flex-1 flex-col">
          {/* Header */}
          <header className="flex h-16 items-center justify-between border-b border-[#e5e5e5] bg-white px-4 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push("/")}
                className="rounded-lg p-2 hover:bg-[#f3f3f3] lg:hidden"
                aria-label="Back to ModelNow"
              >
                <ArrowLeft size={19} />
              </button>

              <div>
                <h1 className="text-base font-semibold">
                  Voice
                </h1>
                <p className="hidden text-xs text-[#737373] sm:block">
                  Talk to ModelNow using your voice
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div
                className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs ${
                  status === "listening"
                    ? "border-red-200 bg-red-50 text-red-600"
                    : status === "processing"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : status === "speaking"
                    ? "border-blue-200 bg-blue-50 text-blue-600"
                    : "border-[#e5e5e5] bg-white text-[#737373]"
                }`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${
                    status === "listening"
                      ? "bg-red-500"
                      : status === "processing"
                      ? "bg-amber-500"
                      : status === "speaking"
                      ? "bg-blue-500"
                      : "bg-green-500"
                  }`}
                />
                {getStatusText()}
              </div>

              <button
                onClick={clearConversation}
                className="hidden rounded-lg border border-[#e5e5e5] px-3 py-1.5 text-xs font-medium hover:bg-[#f5f5f5] sm:block"
              >
                Clear
              </button>
            </div>
          </header>

          {/* Content */}
          <div className="flex flex-1 flex-col">
            {messages.length === 0 ? (
              <div className="mx-auto flex w-full max-w-4xl flex-1 flex-col justify-center px-4 py-10 sm:px-6">
                <div className="mx-auto w-full max-w-2xl text-center">
                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#e5e5e5] bg-white shadow-sm">
                    <Mic size={30} />
                  </div>

                  <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    Talk to ModelNow
                  </h2>

                  <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#737373]">
                    Speak naturally. ModelNow converts your voice into
                    text, processes your request, and can respond with
                    AI-generated voice output.
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-[#e5e5e5] bg-white p-4 text-left">
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#f3f3f3]">
                        <Mic size={18} />
                      </div>
                      <h3 className="text-sm font-semibold">
                        Voice Input
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-[#737373]">
                        Speak your prompt using your microphone.
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#e5e5e5] bg-white p-4 text-left">
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#f3f3f3]">
                        <MessageSquare size={18} />
                      </div>
                      <h3 className="text-sm font-semibold">
                        Speech to Text
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-[#737373]">
                        Your spoken words are converted into text.
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#e5e5e5] bg-white p-4 text-left">
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#f3f3f3]">
                        <Bot size={18} />
                      </div>
                      <h3 className="text-sm font-semibold">
                        AI Processing
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-[#737373]">
                        ModelNow processes the prompt and generates a
                        response.
                      </p>
                    </div>

                    <div className="rounded-xl border border-[#e5e5e5] bg-white p-4 text-left">
                      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-[#f3f3f3]">
                        <Volume2 size={18} />
                      </div>
                      <h3 className="text-sm font-semibold">
                        Voice Output
                      </h3>
                      <p className="mt-1 text-xs leading-5 text-[#737373]">
                        The AI response can be spoken back to you.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-6 sm:px-6">
                <div className="space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-3 ${
                        message.role === "user"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      {message.role === "assistant" && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e5e5e5] bg-white">
                          <Bot size={16} />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                          message.role === "user"
                            ? "bg-[#171717] text-white"
                            : "border border-[#e5e5e5] bg-white text-[#333]"
                        }`}
                      >
                        {message.text}
                      </div>

                      {message.role === "user" && (
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[#e5e5e5] bg-white">
                          <User size={16} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Live Transcript */}
            {transcript && status === "listening" && (
              <div className="mx-auto w-full max-w-3xl px-4 pb-3 sm:px-6">
                <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3">
                  <div className="mb-1 flex items-center gap-2 text-xs font-medium text-red-600">
                    <Mic size={13} />
                    Live transcript
                  </div>

                  <p className="text-sm text-[#444]">
                    {transcript}
                  </p>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div className="mx-auto w-full max-w-3xl px-4 pb-3 sm:px-6">
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              </div>
            )}

            {/* Composer */}
            <div className="border-t border-[#e5e5e5] bg-white px-4 py-4 sm:px-6">
              <form
                onSubmit={handleSubmit}
                className="mx-auto flex w-full max-w-3xl items-end gap-2"
              >
                <button
                  type="button"
                  onClick={startListening}
                  disabled={
                    status === "processing" ||
                    status === "speaking"
                  }
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition ${
                    status === "listening"
                      ? "border-red-300 bg-red-50 text-red-600"
                      : "border-[#e5e5e5] bg-white text-[#555] hover:bg-[#f5f5f5]"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                  aria-label={
                    status === "listening"
                      ? "Stop listening"
                      : "Start voice input"
                  }
                >
                  {status === "listening" ? (
                    <MicOff size={19} />
                  ) : (
                    <Mic size={19} />
                  )}
                </button>

                <div className="relative flex-1">
                  <textarea
                    value={input}
                    onChange={(event) =>
                      setInput(event.target.value)
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key === "Enter" &&
                        !event.shiftKey
                      ) {
                        event.preventDefault();

                        if (!isBusy) {
                          void processPrompt();
                        }
                      }
                    }}
                    placeholder="Speak or type your message..."
                    rows={1}
                    className="min-h-11 w-full resize-none rounded-xl border border-[#d9d9d9] bg-white px-4 py-3 pr-24 text-sm outline-none transition placeholder:text-[#999] focus:border-[#999]"
                  />

                  <div className="absolute bottom-1.5 right-1.5 flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (voiceOutput) {
                          window.speechSynthesis?.cancel();
                          setStatus("idle");
                        }

                        setVoiceOutput((current) => !current);
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-lg text-[#666] hover:bg-[#f3f3f3]"
                      aria-label={
                        voiceOutput
                          ? "Disable voice output"
                          : "Enable voice output"
                      }
                    >
                      {voiceOutput ? (
                        <Volume2 size={17} />
                      ) : (
                        <VolumeX size={17} />
                      )}
                    </button>

                    <button
                      type="submit"
                      disabled={
                        !input.trim() ||
                        status === "processing" ||
                        status === "speaking"
                      }
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#171717] text-white transition hover:bg-[#333] disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Send message"
                    >
                      {status === "processing" ? (
                        <Loader2
                          size={16}
                          className="animate-spin"
                        />
                      ) : (
                        <Send size={16} />
                      )}
                    </button>
                  </div>
                </div>
              </form>

              <p className="mx-auto mt-2 max-w-3xl text-center text-[11px] text-[#999]">
                Voice input uses your browser&apos;s speech
                recognition. Voice output uses your browser&apos;s
                text-to-speech engine.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}