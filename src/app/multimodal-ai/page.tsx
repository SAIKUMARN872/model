
"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

import { useRouter } from "next/navigation";

import {
  ArrowLeft,
  Sparkles,
  Plus,
  Send,
  Mic,
  FileText,
  X,
  LoaderCircle,
} from "lucide-react";

import ArchitectureSection from "../../components/multimodal/ArchitectureSection";
import MediaFlowSection from "../../components/multimodal/MediaFlowSection";
import OutputTypesSection from "../../components/multimodal/OutputTypesSection";
import CategoryTabs from "../../components/multimodal/CategoryTabs";
import ToolSidebar from "../../components/multimodal/ToolSidebar";
import MultimodalWorkspace from "../../components/multimodal/MultimodalWorkspace";

import {
  categories,
  getTools,
  type MediaCategory,
  type MediaTool,
} from "../../components/multimodal/config";

/* =========================================================
   SPEECH RECOGNITION TYPES
========================================================= */

type SpeechAlternative = {
  transcript: string;
};

type SpeechResult = {
  isFinal: boolean;
  [index: number]: SpeechAlternative;
};

type SpeechResultEvent = {
  resultIndex: number;
  results: ArrayLike<SpeechResult>;
};

type SpeechErrorEvent = {
  error: string;
  message?: string;
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;

  onstart: ((event: Event) => void) | null;
  onresult: ((event: SpeechResultEvent) => void) | null;
  onerror: ((event: SpeechErrorEvent) => void) | null;
  onend: ((event: Event) => void) | null;

  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

type SpeechRecognitionWindow = {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
};

/* =========================================================
   MAIN PAGE
========================================================= */

export default function MultimodalAIPage() {
  const router = useRouter();

  /* CATEGORY STATE */

  const [activeCategory, setActiveCategory] =
    useState<MediaCategory>("Input");

  const [selectedTool, setSelectedTool] =
    useState("input-text");

  /* INPUT STATE */

  const [prompt, setPrompt] = useState("");

  const [uploadedFile, setUploadedFile] =
    useState<File | null>(null);

  /* GENERATION STATE */

  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [result, setResult] = useState("");

  /* VOICE STATE */

  const [isListening, setIsListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");

  const recognitionRef =
    useRef<SpeechRecognitionLike | null>(null);

  const promptBeforeVoiceRef = useRef("");
  const finalTranscriptRef = useRef("");

  /* =========================================================
     CLEANUP
  ========================================================= */

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  /* =========================================================
     CATEGORY CHANGE
  ========================================================= */

  function changeCategory(category: MediaCategory) {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    const nextTools = getTools(category);

    setIsListening(false);
    setVoiceError("");

    setActiveCategory(category);
    setSelectedTool(nextTools[0]?.id ?? "");

    setGenerated(false);
    setResult("");
  }

  /* =========================================================
     TOOL CHANGE
  ========================================================= */

  function selectTool(tool: MediaTool) {
    setSelectedTool(tool.id);

    setGenerated(false);
    setResult("");
  }

  /* =========================================================
     FILE UPLOAD
  ========================================================= */

  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploadedFile(file);
    setGenerated(false);
    setResult("");

    // Allow selecting the same file again.
    event.target.value = "";
  }

  function removeFile() {
    setUploadedFile(null);
  }

  /* =========================================================
     MICROPHONE / SPEECH TO TEXT
  ========================================================= */

  function handleMicrophone() {
    // Stop recognition if it is already running.
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    /*
      The unknown cast avoids conflicts between custom
      speech types and the browser's Window definitions.
    */

    const browserWindow =
      window as unknown as SpeechRecognitionWindow;

    const SpeechRecognitionAPI =
      browserWindow.SpeechRecognition ??
      browserWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      setVoiceError(
        "Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge."
      );
      return;
    }

    setVoiceError("");

    let recognition: SpeechRecognitionLike;

    try {
      recognition = new SpeechRecognitionAPI();
    } catch {
      setVoiceError(
        "Unable to initialize voice recognition. Please try again."
      );
      return;
    }

    // Indian English. Change to te-IN for Telugu.
    recognition.lang = "en-IN";

    recognition.continuous = true;
    recognition.interimResults = true;

    // Preserve existing typed text.
    promptBeforeVoiceRef.current = prompt.trim();
    finalTranscriptRef.current = "";

    /* START */

    recognition.onstart = (_event: Event) => {
      setIsListening(true);
      setVoiceError("");
    };

    /* TRANSCRIBE SPEECH */

    recognition.onresult = (event: SpeechResultEvent) => {
      let interimTranscript = "";

      for (
        let i = event.resultIndex;
        i < event.results.length;
        i++
      ) {
        const transcript =
          event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          finalTranscriptRef.current += transcript + " ";
        } else {
          interimTranscript += transcript;
        }
      }

      const spokenText = (
        finalTranscriptRef.current + interimTranscript
      ).trim();

      const combinedText = [
        promptBeforeVoiceRef.current,
        spokenText,
      ]
        .filter(Boolean)
        .join(" ");

      // Put recognized words into the input box.
      setPrompt(combinedText);
    };

    /* ERROR */

    recognition.onerror = (event: SpeechErrorEvent) => {
      setIsListening(false);
      recognitionRef.current = null;

      if (
        event.error === "not-allowed" ||
        event.error === "service-not-allowed"
      ) {
        setVoiceError(
          "Microphone permission denied. Please allow microphone access in your browser."
        );
      } else if (event.error === "no-speech") {
        setVoiceError(
          "No speech detected. Please try speaking again."
        );
      } else if (event.error === "audio-capture") {
        setVoiceError(
          "No microphone detected. Please check your microphone connection."
        );
      } else if (event.error !== "aborted") {
        setVoiceError(
          `Voice recognition error: ${event.error}`
        );
      }
    };

    /* STOP */

    recognition.onend = (_event: Event) => {
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;

    /* START RECOGNITION */

    try {
      recognition.start();
    } catch {
      setIsListening(false);
      recognitionRef.current = null;

      setVoiceError(
        "Unable to start voice recognition. Please try again."
      );
    }
  }

  /* =========================================================
     GENERATE
  ========================================================= */

  function generate() {
    if ((!prompt.trim() && !uploadedFile) || generating) {
      return;
    }

    // Stop microphone before generating.
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    setIsListening(false);
    setVoiceError("");

    setGenerating(true);
    setGenerated(false);
    setResult("");

    /*
      FRONTEND SIMULATION

      Backend integration can be connected later through:
      /api/multimodal
    */

    setTimeout(() => {
      const currentTools = getTools(activeCategory);

      const tool = currentTools.find(
        (item) => item.id === selectedTool
      );

      setResult(
        `ModelNow ${
          tool?.name ?? activeCategory
        } pipeline is ready. The request has been prepared for multimodal processing. Backend model inference, media processing and storage can be connected to this interface.`
      );

      setGenerating(false);
      setGenerated(true);
    }, 1200);
  }

  /* =========================================================
     RESET
  ========================================================= */

  function reset() {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      recognitionRef.current = null;
    }

    setIsListening(false);
    setVoiceError("");

    promptBeforeVoiceRef.current = "";
    finalTranscriptRef.current = "";

    setPrompt("");
    setUploadedFile(null);

    setGenerating(false);
    setGenerated(false);
    setResult("");
  }

  /* =========================================================
     KEYBOARD HANDLING
  ========================================================= */

  function handlePromptKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      generate();
    }
  }

  /* =========================================================
     CURRENT TOOLS
  ========================================================= */

  const tools = getTools(activeCategory);

  const currentTool =
    tools.find((tool) => tool.id === selectedTool) ??
    tools[0];

  const isTextInput =
    activeCategory === "Input" &&
    selectedTool === "input-text";

  /* =========================================================
     UI
  ========================================================= */

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* HEADER */}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">

          <div className="flex items-center gap-3">

            <button
              type="button"
              onClick={() => router.push("/chat")}
              aria-label="Back to chat"
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            >
              <ArrowLeft size={17} />
            </button>

            <div className="flex items-center gap-2">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Sparkles size={17} />
              </div>

              <div>
                <h1 className="font-semibold">
                  ModelNow
                </h1>

                <p className="text-[10px] uppercase tracking-wider text-slate-400">
                  Multimodal AI
                </p>
              </div>

            </div>
          </div>

          <div className="flex items-center gap-2">

            <div className="hidden rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-500 md:block">
              Multimodal Media Engine
            </div>

            <div className="flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Ready
            </div>

          </div>
        </div>
      </header>

      {/* HERO */}

      <section className="mx-auto max-w-7xl px-4 pb-7 pt-10 md:px-8 md:pt-12">
        <div className="max-w-4xl">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">
            <Sparkles size={13} />
            Multimodal media
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">
            One AI workspace for{" "}
            <span className="text-slate-500">
              every modality.
            </span>
          </h2>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500 md:text-base">
            ModelNow connects text, images,
            audio, voice and video through
            understanding, generation,
            transformation, processing and
            cross-modal intelligence.
          </p>

        </div>
      </section>

      {/* CATEGORY NAVIGATION */}

      <CategoryTabs
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={changeCategory}
      />

      {/* MAIN WORKSPACE */}

      <section className="mx-auto max-w-7xl px-4 py-6 md:px-8">
        <div className="grid gap-6 lg:grid-cols-[310px_1fr]">

          <ToolSidebar
            activeCategory={activeCategory}
            tools={tools}
            selectedTool={selectedTool}
            onToolSelect={selectTool}
          />

          <div className="min-w-0">

            {isTextInput ? (

              /* CHAT-STYLE TEXT INPUT */

              <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* PANEL HEADER */}

                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-5 md:px-7">

                  <div className="flex min-w-0 items-center gap-3">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
                      <FileText size={22} />
                    </div>

                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Input
                      </p>

                      <h3 className="font-semibold text-slate-900">
                        Text Input
                      </h3>

                      <p className="text-sm text-slate-500">
                        Process natural language instructions and text content.
                      </p>
                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={reset}
                    className="ml-3 flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
                  >
                    <span className="hidden sm:inline">
                      Reset
                    </span>

                    <X size={15} className="sm:hidden" />
                  </button>

                </div>

                {/* CHAT INPUT */}

                <div className="space-y-5 p-4 md:p-7">

                  <div>

                    <label
                      htmlFor="multimodal-prompt"
                      className="mb-3 block text-xs font-medium uppercase tracking-wide text-slate-400"
                    >
                      Multimodal Instruction
                    </label>

                    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white transition focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100">

                      <textarea
                        id="multimodal-prompt"
                        value={prompt}
                        onChange={(event) =>
                          setPrompt(event.target.value)
                        }
                        onKeyDown={handlePromptKeyDown}
                        rows={4}
                        placeholder="Describe what you want ModelNow to do with input..."
                        aria-label="Describe your multimodal instruction"
                        className="max-h-64 min-h-32 w-full resize-y border-0 bg-transparent px-5 py-5 text-sm leading-6 text-slate-800 outline-none placeholder:text-slate-400 focus:ring-0 md:min-h-40 md:text-base"
                      />

                      {/* ATTACHED FILE PREVIEW */}

                      {uploadedFile && (
                        <div className="mx-4 mb-3 flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">

                          <FileText
                            size={18}
                            className="shrink-0 text-slate-500"
                          />

                          <div className="min-w-0 flex-1">

                            <p className="truncate text-sm font-medium text-slate-700">
                              {uploadedFile.name}
                            </p>

                            <p className="text-xs text-slate-400">
                              {(uploadedFile.size / 1024).toFixed(1)} KB
                            </p>

                          </div>

                          <button
                            type="button"
                            onClick={removeFile}
                            aria-label="Remove attached file"
                            className="rounded-full p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                          >
                            <X size={16} />
                          </button>

                        </div>
                      )}

                      {/* CHAT BOX ACTIONS */}

                      <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-3 py-3 md:px-4">

                        <div className="flex min-w-0 items-center gap-1">

                          {/* FILE ATTACHMENT */}

                          <label
                            title="Attach a file"
                            aria-label="Attach a file"
                            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Plus size={22} />

                            <input
                              type="file"
                              className="hidden"
                              onChange={handleUpload}
                              accept="image/*,audio/*,video/*,.pdf,.txt,.doc,.docx,.csv,.json"
                            />
                          </label>

                          {/* MICROPHONE */}

                          <button
                            type="button"
                            onClick={handleMicrophone}
                            title={
                              isListening
                                ? "Stop voice input"
                                : "Start voice input"
                            }
                            aria-label={
                              isListening
                                ? "Stop voice input"
                                : "Start voice input"
                            }
                            aria-pressed={isListening}
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition ${
                              isListening
                                ? "bg-red-100 text-red-600 hover:bg-red-200"
                                : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            }`}
                          >
                            {isListening ? (
                              <span className="relative flex h-5 w-5 items-center justify-center">
                                <span className="absolute h-5 w-5 animate-ping rounded-full bg-red-400 opacity-40" />
                                <Mic size={20} className="relative" />
                              </span>
                            ) : (
                              <Mic size={20} />
                            )}
                          </button>

                          <span className="hidden truncate pl-1 text-xs text-slate-400 sm:inline">
                            {isListening
                              ? "Listening... Speak now"
                              : "Attach files or use voice input"}
                          </span>

                        </div>

                        {/* SEND BUTTON */}

                        <button
                          type="button"
                          onClick={generate}
                          disabled={
                            (!prompt.trim() && !uploadedFile) ||
                            generating
                          }
                          aria-label="Run multimodal instruction"
                          title="Run"
                          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                        >
                          {generating ? (
                            <LoaderCircle
                              size={19}
                              className="animate-spin"
                            />
                          ) : (
                            <Send size={18} />
                          )}
                        </button>

                      </div>
                    </div>

                    {/* VOICE STATUS */}

                    {isListening && (
                      <p
                        role="status"
                        className="mt-2 px-1 text-xs font-medium text-red-600"
                      >
                        Listening to your voice... Click the microphone again to stop.
                      </p>
                    )}

                    {voiceError && (
                      <p
                        role="alert"
                        className="mt-2 px-1 text-xs text-red-600"
                      >
                        {voiceError}
                      </p>
                    )}

                    <p className="mt-2 px-1 text-xs text-slate-400">
                      Press Enter to run · Shift+Enter for a new line
                    </p>

                  </div>

                  {/* PROCESSING STATE */}

                  {generating && (
                    <div
                      role="status"
                      className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600"
                    >
                      <LoaderCircle
                        size={18}
                        className="animate-spin"
                      />
                      Preparing your multimodal request...
                    </div>
                  )}

                  {/* RESULT */}

                  {generated && result && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 md:p-5">

                      <div className="mb-2 flex items-center gap-2">
                        <Sparkles
                          size={17}
                          className="text-slate-700"
                        />

                        <h4 className="text-sm font-semibold text-slate-900">
                          ModelNow Output
                        </h4>
                      </div>

                      <p className="whitespace-pre-wrap text-sm leading-6 text-slate-600">
                        {result}
                      </p>

                      <p className="mt-3 text-xs text-slate-400">
                        This is currently a frontend simulation. Real AI inference requires backend integration.
                      </p>

                    </div>
                  )}

                </div>
              </section>

            ) : (

              /* EXISTING WORKSPACE FOR OTHER TOOLS */

              <MultimodalWorkspace
                activeCategory={activeCategory}
                currentTool={currentTool}
                prompt={prompt}
                uploadedFile={uploadedFile}
                generating={generating}
                generated={generated}
                result={result}
                onPromptChange={setPrompt}
                onUpload={handleUpload}
                onRemoveFile={removeFile}
                onGenerate={generate}
                onReset={reset}
              />

            )}

          </div>
        </div>
      </section>

      {/* ARCHITECTURE */}

      <ArchitectureSection />

      {/* MEDIA FLOW */}

      <MediaFlowSection />

      {/* OUTPUT TYPES */}

      <OutputTypesSection />

    </main>
  );
}
