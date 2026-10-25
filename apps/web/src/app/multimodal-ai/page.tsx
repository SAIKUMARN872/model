"use client";

import {
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
   MAIN PAGE
========================================================= */

export default function MultimodalAIPage() {
  const router = useRouter();

  const [activeCategory, setActiveCategory] =
    useState<MediaCategory>("Input");

  const [selectedTool, setSelectedTool] =
    useState("input-text");

  const [prompt, setPrompt] = useState("");

  const [uploadedFile, setUploadedFile] =
    useState<File | null>(null);

  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [result, setResult] = useState("");

  /* =======================================================
     CATEGORY CHANGE
  ======================================================= */

  function changeCategory(category: MediaCategory) {
    const nextTools = getTools(category);

    setActiveCategory(category);
    setSelectedTool(nextTools[0]?.id ?? "");

    setGenerated(false);
    setResult("");
  }

  /* =======================================================
     TOOL CHANGE
  ======================================================= */

  function selectTool(tool: MediaTool) {
    setSelectedTool(tool.id);

    setGenerated(false);
    setResult("");
  }

  /* =======================================================
     FILE UPLOAD
  ======================================================= */

  function handleUpload(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setUploadedFile(file);
    setGenerated(false);
    setResult("");

    event.target.value = "";
  }

  function removeFile() {
    setUploadedFile(null);
  }

  /* =======================================================
     MICROPHONE
  ======================================================= */

  function handleMicrophone() {
    // Voice input can be connected to speech recognition later.
    // This handler intentionally does not request microphone
    // permissions or pretend to transcribe audio.
    console.info(
      "ModelNow microphone selected. Voice input is not configured yet.",
    );
  }

  /* =======================================================
     GENERATE
  ======================================================= */

  function generate() {
    if ((!prompt.trim() && !uploadedFile) || generating) {
      return;
    }

    setGenerating(true);
    setGenerated(false);
    setResult("");

    /*
      Existing frontend processing simulation.

      Later this can connect to:
      /api/multimodal
    */

    setTimeout(() => {
      const currentTools = getTools(activeCategory);

      const tool = currentTools.find(
        (item) => item.id === selectedTool,
      );

      setResult(
        `ModelNow ${
          tool?.name ?? activeCategory
        } pipeline is ready. The request has been prepared for multimodal processing. Backend model inference, media processing and storage can be connected to this interface.`,
      );

      setGenerating(false);
      setGenerated(true);
    }, 1200);
  }

  /* =======================================================
     RESET
  ======================================================= */

  function reset() {
    setPrompt("");
    setUploadedFile(null);
    setGenerating(false);
    setGenerated(false);
    setResult("");
  }

  /* =======================================================
     KEYBOARD HANDLING
  ======================================================= */

  function handlePromptKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      generate();
    }
  }

  /* =======================================================
     CURRENT TOOLS
  ======================================================= */

  const tools = getTools(activeCategory);

  const currentTool =
    tools.find((tool) => tool.id === selectedTool) ??
    tools[0];

  const isTextInput =
    activeCategory === "Input" &&
    selectedTool === "input-text";

  /* =======================================================
     UI
  ======================================================= */

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

                          {/* PLUS / FILE ATTACHMENT */}

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

                          {/* MICROPHONE BUTTON */}

                          <button
                            type="button"
                            onClick={handleMicrophone}
                            title="Voice input"
                            aria-label="Voice input"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          >
                            <Mic size={20} />
                          </button>

                          <span className="hidden truncate pl-1 text-xs text-slate-400 sm:inline">
                            Attach files or use voice input
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

      {/* COMPLETE ARCHITECTURE */}

      <ArchitectureSection />

      {/* MEDIA FLOW */}

      <MediaFlowSection />

      {/* OUTPUT TYPES */}

      <OutputTypesSection />

    </main>
  );
}