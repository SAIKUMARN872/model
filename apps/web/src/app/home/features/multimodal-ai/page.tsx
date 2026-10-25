"use client";

import {
  useState,
  type ElementType,
  type ChangeEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Upload,
  FileText,
  Image as ImageIcon,
  Mic,
  Volume2,
  Video,
  Type,
  ScanEye,
  FileAudio,
  Languages,
  WandSparkles,
  RefreshCw,
  Layers3,
  Database,
  Brain,
  Search,
  GitBranch,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Play,
  Download,
  X,
  Send,
  FolderInput,
  AudioLines,
  Captions,
  Clapperboard,
  Images,
  Palette,
  Presentation,
  Code2,
  FileOutput,
  Combine,
  Gauge,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type MediaCategory =
  | "Input"
  | "Image"
  | "Audio"
  | "Voice"
  | "Video"
  | "Cross-modal"
  | "Processing"
  | "Output";

type MediaTool = {
  id: string;
  name: string;
  description: string;
  icon: ElementType;
};

type CategoryConfig = {
  id: MediaCategory;
  description: string;
  icon: ElementType;
};

/* =========================================================
   INPUT
========================================================= */

const inputTools: MediaTool[] = [
  {
    id: "input-text",
    name: "Text Input",
    description: "Enter prompts, documents, instructions and content.",
    icon: Type,
  },
  {
    id: "input-image",
    name: "Image Input",
    description: "Upload images for understanding and transformation.",
    icon: ImageIcon,
  },
  {
    id: "input-audio",
    name: "Audio Input",
    description: "Upload audio files for analysis and processing.",
    icon: FileAudio,
  },
  {
    id: "input-voice",
    name: "Voice Input",
    description: "Use spoken language as an AI input.",
    icon: Mic,
  },
  {
    id: "input-video",
    name: "Video Input",
    description: "Upload videos for visual and audio understanding.",
    icon: Video,
  },
];

/* =========================================================
   IMAGE
========================================================= */

const imageTools: MediaTool[] = [
  {
    id: "image-understanding",
    name: "Image Understanding",
    description: "Analyze objects, scenes, text and visual context.",
    icon: ScanEye,
  },
  {
    id: "image-to-text",
    name: "Image to Text",
    description: "Extract and describe information from images.",
    icon: FileText,
  },
  {
    id: "image-to-audio",
    name: "Image to Audio",
    description: "Convert visual information into audio experiences.",
    icon: Volume2,
  },
  {
    id: "image-to-voice",
    name: "Image to Voice",
    description: "Turn image content into spoken responses.",
    icon: AudioLines,
  },
  {
    id: "image-to-video",
    name: "Image to Video",
    description: "Animate and transform images into video.",
    icon: Video,
  },
  {
    id: "image-generation",
    name: "Image Generation",
    description: "Create new images from natural-language prompts.",
    icon: Palette,
  },
];

/* =========================================================
   AUDIO
========================================================= */

const audioTools: MediaTool[] = [
  {
    id: "audio-understanding",
    name: "Audio Understanding",
    description: "Analyze sounds, conversations and audio context.",
    icon: Volume2,
  },
  {
    id: "audio-to-text",
    name: "Audio to Text",
    description: "Transcribe spoken and recorded audio.",
    icon: Captions,
  },
  {
    id: "audio-to-image",
    name: "Audio to Image",
    description: "Create visual concepts from audio input.",
    icon: Images,
  },
  {
    id: "audio-to-voice",
    name: "Audio to Voice",
    description: "Transform and generate voice from audio input.",
    icon: Mic,
  },
  {
    id: "audio-to-video",
    name: "Audio to Video",
    description: "Create video experiences from audio.",
    icon: Video,
  },
  {
    id: "audio-generation",
    name: "Audio Generation",
    description: "Generate audio content from prompts.",
    icon: WandSparkles,
  },
];

/* =========================================================
   VOICE
========================================================= */

const voiceTools: MediaTool[] = [
  {
    id: "speech-to-text",
    name: "Speech to Text",
    description: "Convert spoken language into text.",
    icon: Captions,
  },
  {
    id: "voice-to-text",
    name: "Voice to Text",
    description: "Understand and transcribe voice conversations.",
    icon: FileText,
  },
  {
    id: "voice-to-image",
    name: "Voice to Image",
    description: "Create images from spoken prompts.",
    icon: ImageIcon,
  },
  {
    id: "voice-to-video",
    name: "Voice to Video",
    description: "Create videos using natural voice instructions.",
    icon: Video,
  },
  {
    id: "text-to-voice",
    name: "Text to Voice",
    description: "Convert text into natural AI voice.",
    icon: AudioLines,
  },
  {
    id: "voice-cloning",
    name: "Voice Cloning",
    description: "Create authorized voice replicas for applications.",
    icon: Mic,
  },
  {
    id: "voice-generation",
    name: "Voice Generation",
    description: "Generate natural voice experiences.",
    icon: WandSparkles,
  },
];

/* =========================================================
   VIDEO
========================================================= */

const videoTools: MediaTool[] = [
  {
    id: "video-understanding",
    name: "Video Understanding",
    description: "Analyze scenes, actions, objects and events.",
    icon: ScanEye,
  },
  {
    id: "video-to-text",
    name: "Video to Text",
    description: "Generate transcripts, descriptions and summaries.",
    icon: FileText,
  },
  {
    id: "video-to-image",
    name: "Video to Image",
    description: "Extract frames and create visual assets.",
    icon: Images,
  },
  {
    id: "video-to-audio",
    name: "Video to Audio",
    description: "Extract or transform audio from video.",
    icon: Volume2,
  },
  {
    id: "video-to-voice",
    name: "Video to Voice",
    description: "Generate voice experiences from video content.",
    icon: Mic,
  },
  {
    id: "video-generation",
    name: "Video Generation",
    description: "Generate videos from text and multimodal prompts.",
    icon: Clapperboard,
  },
  {
    id: "video-editing",
    name: "Video Editing",
    description: "Edit and assemble AI-powered video content.",
    icon: WandSparkles,
  },
  {
    id: "video-transformation",
    name: "Video Transformation",
    description: "Transform existing videos into new visual experiences.",
    icon: RefreshCw,
  },
];

/* =========================================================
   CROSS MODAL
========================================================= */

const crossModalTools: MediaTool[] = [
  {
    id: "text-to-image",
    name: "Text to Image",
    description: "Generate images from text prompts.",
    icon: ImageIcon,
  },
  {
    id: "text-to-audio",
    name: "Text to Audio",
    description: "Generate audio from written content.",
    icon: Volume2,
  },
  {
    id: "text-to-voice",
    name: "Text to Voice",
    description: "Convert written text into natural voice.",
    icon: AudioLines,
  },
  {
    id: "text-to-video",
    name: "Text to Video",
    description: "Generate video from natural-language prompts.",
    icon: Video,
  },
  {
    id: "image-to-text-cross",
    name: "Image to Text",
    description: "Convert visual information into text.",
    icon: FileText,
  },
  {
    id: "image-to-audio-cross",
    name: "Image to Audio",
    description: "Create audio experiences from images.",
    icon: Volume2,
  },
  {
    id: "image-to-video-cross",
    name: "Image to Video",
    description: "Transform still images into video.",
    icon: Video,
  },
  {
    id: "audio-to-text-cross",
    name: "Audio to Text",
    description: "Transcribe and understand audio.",
    icon: Captions,
  },
  {
    id: "audio-to-image-cross",
    name: "Audio to Image",
    description: "Create images from audio concepts.",
    icon: ImageIcon,
  },
  {
    id: "audio-to-video-cross",
    name: "Audio to Video",
    description: "Create videos from audio input.",
    icon: Video,
  },
  {
    id: "video-to-text-cross",
    name: "Video to Text",
    description: "Turn video into searchable text.",
    icon: FileText,
  },
  {
    id: "video-to-image-cross",
    name: "Video to Image",
    description: "Extract and transform video frames.",
    icon: Images,
  },
  {
    id: "video-to-audio-cross",
    name: "Video to Audio",
    description: "Extract and transform video audio.",
    icon: Volume2,
  },
];

/* =========================================================
   PROCESSING
========================================================= */

const processingTools: MediaTool[] = [
  {
    id: "transcription",
    name: "Transcription",
    description: "Convert speech and media into searchable text.",
    icon: Captions,
  },
  {
    id: "translation",
    name: "Translation",
    description: "Translate content across supported languages.",
    icon: Languages,
  },
  {
    id: "enhancement",
    name: "Enhancement",
    description: "Improve quality of image, audio and video content.",
    icon: WandSparkles,
  },
  {
    id: "compression",
    name: "Compression",
    description: "Optimize media size while preserving quality.",
    icon: Gauge,
  },
  {
    id: "frame-processing",
    name: "Frame Processing",
    description: "Analyze, extract and transform video frames.",
    icon: Layers3,
  },
  {
    id: "audio-processing",
    name: "Audio Processing",
    description: "Clean, transform and optimize audio.",
    icon: AudioLines,
  },
  {
    id: "media-fusion",
    name: "Media Fusion",
    description: "Combine multiple modalities into one experience.",
    icon: Combine,
  },
];

/* =========================================================
   OUTPUT
========================================================= */

const outputTools: MediaTool[] = [
  {
    id: "output-text",
    name: "Text Output",
    description: "Reports, summaries, descriptions and generated text.",
    icon: FileOutput,
  },
  {
    id: "output-image",
    name: "Image Output",
    description: "Generated and transformed visual content.",
    icon: ImageIcon,
  },
  {
    id: "output-audio",
    name: "Audio Output",
    description: "Generated audio and processed sound.",
    icon: Volume2,
  },
  {
    id: "output-voice",
    name: "Voice Output",
    description: "Natural AI voice responses and narration.",
    icon: Mic,
  },
  {
    id: "output-video",
    name: "Video Output",
    description: "Generated and transformed video experiences.",
    icon: Video,
  },
];

/* =========================================================
   CATEGORIES
========================================================= */

const categories: CategoryConfig[] = [
  {
    id: "Input",
    description: "Accept text, image, audio, voice and video.",
    icon: FolderInput,
  },
  {
    id: "Image",
    description: "Understand, generate and transform images.",
    icon: ImageIcon,
  },
  {
    id: "Audio",
    description: "Understand, generate and transform audio.",
    icon: Volume2,
  },
  {
    id: "Voice",
    description: "Speech, voice generation and voice transformation.",
    icon: Mic,
  },
  {
    id: "Video",
    description: "Understand, generate, edit and transform video.",
    icon: Video,
  },
  {
    id: "Cross-modal",
    description: "Move intelligence between different modalities.",
    icon: GitBranch,
  },
  {
    id: "Processing",
    description: "Process, enhance, translate and fuse media.",
    icon: WandSparkles,
  },
  {
    id: "Output",
    description: "Deliver text, image, audio, voice and video.",
    icon: FileOutput,
  },
];

/* =========================================================
   TOOL MAPPING
========================================================= */

function getTools(category: MediaCategory): MediaTool[] {
  switch (category) {
    case "Input":
      return inputTools;
    case "Image":
      return imageTools;
    case "Audio":
      return audioTools;
    case "Voice":
      return voiceTools;
    case "Video":
      return videoTools;
    case "Cross-modal":
      return crossModalTools;
    case "Processing":
      return processingTools;
    case "Output":
      return outputTools;
    default:
      return inputTools;
  }
}

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

  const [generating, setGenerating] =
    useState(false);

  const [generated, setGenerated] =
    useState(false);

  const [result, setResult] =
    useState("");

  /* =======================================================
     CATEGORY CHANGE
  ======================================================= */

  function changeCategory(category: MediaCategory) {
    const tools = getTools(category);

    setActiveCategory(category);
    setSelectedTool(tools[0]?.id ?? "");
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
     FILE
  ======================================================= */

  function handleUpload(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setUploadedFile(file);
    setGenerated(false);
    setResult("");

    event.target.value = "";
  }

  function removeFile() {
    setUploadedFile(null);
  }

  /* =======================================================
     GENERATE
  ======================================================= */

  function generate() {
    if (!prompt.trim() && !uploadedFile) {
      return;
    }

    setGenerating(true);
    setGenerated(false);
    setResult("");

    setTimeout(() => {
      const tools = getTools(activeCategory);

      const tool =
        tools.find(
          (item) => item.id === selectedTool
        );

      setResult(
        `ModelNow ${tool?.name ?? activeCategory} pipeline is ready. The request has been prepared for multimodal processing. Backend model inference, media processing and storage can be connected to this interface.`
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

  const tools = getTools(activeCategory);

  const currentTool =
    tools.find(
      (tool) => tool.id === selectedTool
    ) ?? tools[0];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-8">

          <div className="flex items-center gap-3">

            <button
              onClick={() => router.push("/chat")}
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

      {/* ===================================================
          HERO
      =================================================== */}

      <section className="mx-auto max-w-7xl px-4 pb-7 pt-10 md:px-8 md:pt-12">

        <div className="max-w-4xl">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm">

            <Sparkles size={13} />

            Multimodal media

          </div>

          <h2 className="text-3xl font-bold tracking-tight text-slate-950 md:text-5xl">

            One AI workspace for
            <span className="text-slate-500">
              {" "}every modality.
            </span>

          </h2>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-500 md:text-base">

            ModelNow connects text, images, audio, voice and
            video through understanding, generation,
            transformation, processing and cross-modal
            intelligence.

          </p>

        </div>

      </section>

      {/* ===================================================
          CATEGORY NAVIGATION
      =================================================== */}

      <section className="mx-auto max-w-7xl px-4 md:px-8">

        <div className="flex gap-2 overflow-x-auto pb-2">

          {categories.map((category) => {

            const Icon = category.icon;

            const active =
              activeCategory === category.id;

            return (

              <button
                key={category.id}
                onClick={() =>
                  changeCategory(category.id)
                }
                className={`flex shrink-0 items-center gap-2 rounded-xl border px-4 py-3 text-xs font-medium transition ${
                  active
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >

                <Icon size={15} />

                {category.id}

              </button>

            );
          })}

        </div>

      </section>

      {/* ===================================================
          MAIN WORKSPACE
      =================================================== */}

      <section className="mx-auto max-w-7xl px-4 py-6 md:px-8">

        <div className="grid gap-6 lg:grid-cols-[310px_1fr]">

          {/* =================================================
              TOOL SIDEBAR
          ================================================= */}

          <aside className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">

            <div className="px-3 pb-3 pt-2">

              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {activeCategory} capabilities
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Select a multimodal operation
              </p>

            </div>

            <div className="max-h-[600px] space-y-1 overflow-y-auto">

              {tools.map((tool) => {

                const Icon = tool.icon;

                const active =
                  selectedTool === tool.id;

                return (

                  <button
                    key={tool.id}
                    onClick={() =>
                      selectTool(tool)
                    }
                    className={`flex w-full items-start gap-3 rounded-xl p-3 text-left transition ${
                      active
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >

                    <div
                      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                        active
                          ? "bg-white/10"
                          : "bg-slate-50"
                      }`}
                    >
                      <Icon size={16} />
                    </div>

                    <div className="min-w-0">

                      <p
                        className={`text-sm font-medium ${
                          active
                            ? "text-white"
                            : "text-slate-800"
                        }`}
                      >
                        {tool.name}
                      </p>

                      <p
                        className={`mt-1 text-[11px] leading-4 ${
                          active
                            ? "text-slate-300"
                            : "text-slate-400"
                        }`}
                      >
                        {tool.description}
                      </p>

                    </div>

                  </button>

                );
              })}

            </div>

          </aside>

          {/* =================================================
              GENERATION WORKSPACE
          ================================================= */}

          <div className="min-w-0">

            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

              {/* TOOL HEADER */}

              <div className="border-b border-slate-100 px-5 py-5 md:px-6">

                <div className="flex items-center justify-between gap-4">

                  <div className="flex items-center gap-3">

                    {currentTool && (
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-50 text-slate-700">
                        <currentTool.icon size={20} />
                      </div>
                    )}

                    <div>

                      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        {activeCategory}
                      </p>

                      <h3 className="font-semibold text-slate-900">
                        {currentTool?.name}
                      </h3>

                      <p className="mt-0.5 text-xs text-slate-500">
                        {currentTool?.description}
                      </p>

                    </div>

                  </div>

                  <button
                    onClick={reset}
                    className="flex h-9 items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-medium text-slate-500 hover:bg-slate-50"
                  >
                    <RefreshCw size={14} />
                    Reset
                  </button>

                </div>

              </div>

              {/* INPUT */}

              <div className="p-5 md:p-6">

                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Multimodal instruction
                </label>

                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 focus-within:border-slate-400 focus-within:bg-white">

                  <textarea
                    value={prompt}
                    onChange={(event) =>
                      setPrompt(event.target.value)
                    }
                    placeholder={`Describe what you want ModelNow to do with ${activeCategory.toLowerCase()}...`}
                    rows={6}
                    className="w-full resize-none bg-transparent px-4 py-4 text-sm leading-6 outline-none placeholder:text-slate-400"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-3 py-3">

                    <div className="flex flex-wrap items-center gap-2">

                      <label className="flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-600 hover:bg-slate-50">

                        <Upload size={14} />

                        Upload media

                        <input
                          type="file"
                          className="hidden"
                          accept="image/*,audio/*,video/*,.pdf,.txt,.doc,.docx"
                          onChange={handleUpload}
                        />

                      </label>

                      {uploadedFile && (

                        <div className="flex max-w-[260px] items-center gap-2 rounded-xl bg-slate-100 px-3 py-2">

                          <FileText
                            size={13}
                            className="shrink-0 text-slate-500"
                          />

                          <span className="truncate text-[11px] text-slate-600">
                            {uploadedFile.name}
                          </span>

                          <button
                            onClick={removeFile}
                            className="shrink-0 text-slate-400 hover:text-slate-700"
                          >
                            <X size={13} />
                          </button>

                        </div>

                      )}

                    </div>

                    <button
                      onClick={generate}
                      disabled={
                        generating ||
                        (!prompt.trim() &&
                          !uploadedFile)
                      }
                      className={`flex h-9 items-center gap-2 rounded-xl px-4 text-xs font-semibold transition ${
                        generating ||
                        (!prompt.trim() &&
                          !uploadedFile)
                          ? "bg-slate-100 text-slate-400"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >

                      {generating ? (
                        <>
                          <Loader2
                            size={14}
                            className="animate-spin"
                          />
                          Processing
                        </>
                      ) : (
                        <>
                          <Send size={14} />
                          Run
                        </>
                      )}

                    </button>

                  </div>

                </div>

                {/* RESULT */}

                {generated && (

                  <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200">

                    <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">

                      <div className="flex items-center gap-2">

                        <CheckCircle2
                          size={15}
                          className="text-emerald-600"
                        />

                        <span className="text-xs font-semibold text-slate-700">
                          Processing result
                        </span>

                      </div>

                      <button className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-900">

                        <Download size={13} />

                        Export

                      </button>

                    </div>

                    <div className="p-5">

                      {(activeCategory === "Image" ||
                        activeCategory ===
                          "Cross-modal") && (

                        <div className="mb-4 flex aspect-video items-center justify-center rounded-xl bg-slate-100">

                          <div className="text-center">

                            <ImageIcon
                              size={32}
                              className="mx-auto text-slate-400"
                            />

                            <p className="mt-2 text-xs text-slate-500">
                              Visual processing output
                            </p>

                          </div>

                        </div>

                      )}

                      {activeCategory ===
                        "Video" && (

                        <div className="mb-4 flex aspect-video items-center justify-center rounded-xl bg-slate-100">

                          <div className="text-center">

                            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">

                              <Play
                                size={19}
                                className="ml-0.5 text-slate-700"
                              />

                            </div>

                            <p className="mt-3 text-xs text-slate-500">
                              Video processing output
                            </p>

                          </div>

                        </div>

                      )}

                      {activeCategory ===
                        "Audio" && (

                        <div className="mb-4 flex items-center gap-4 rounded-xl bg-slate-50 p-5">

                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">

                            <Volume2
                              size={20}
                              className="text-slate-600"
                            />

                          </div>

                          <div className="flex-1">

                            <p className="text-xs font-semibold text-slate-700">
                              Audio processing output
                            </p>

                            <div className="mt-3 flex items-center gap-1">

                              {Array.from({
                                length: 35,
                              }).map(
                                (_, index) => (
                                  <span
                                    key={index}
                                    className="w-1 rounded-full bg-slate-300"
                                    style={{
                                      height: `${
                                        8 +
                                        ((index * 9) %
                                          22)
                                      }px`,
                                    }}
                                  />
                                )
                              )}

                            </div>

                          </div>

                        </div>

                      )}

                      {activeCategory ===
                        "Voice" && (

                        <div className="mb-4 flex items-center gap-4 rounded-xl bg-slate-50 p-5">

                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white">

                            <Mic
                              size={20}
                              className="text-slate-600"
                            />

                          </div>

                          <div>

                            <p className="text-xs font-semibold text-slate-700">
                              Voice processing output
                            </p>

                            <p className="mt-1 text-[11px] text-slate-400">
                              AI voice response ready
                            </p>

                          </div>

                        </div>

                      )}

                      <p className="text-sm leading-7 text-slate-600">
                        {result}
                      </p>

                    </div>

                  </div>

                )}

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* ===================================================
          COMPLETE ARCHITECTURE
      =================================================== */}

      <section className="mx-auto max-w-7xl px-4 pb-10 md:px-8">

        <div className="mb-5">

          <h3 className="text-lg font-semibold">
            Multimodal media architecture
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            ModelNow supports media ingestion, transformation,
            cross-modal intelligence and output generation.
          </p>

        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">

          <ArchitectureCard
            icon={FolderInput}
            title="Input"
            items={[
              "Text",
              "Image",
              "Audio",
              "Voice",
              "Video",
            ]}
          />

          <ArchitectureCard
            icon={Brain}
            title="Understanding"
            items={[
              "Image understanding",
              "Audio understanding",
              "Video understanding",
              "Speech understanding",
            ]}
          />

          <ArchitectureCard
            icon={GitBranch}
            title="Cross-modal"
            items={[
              "Text → Image",
              "Text → Voice",
              "Text → Video",
              "Image → Video",
              "Audio → Image",
            ]}
          />

          <ArchitectureCard
            icon={WandSparkles}
            title="Processing"
            items={[
              "Transcription",
              "Translation",
              "Enhancement",
              "Compression",
              "Media fusion",
            ]}
          />

        </div>

      </section>

      {/* ===================================================
          MEDIA FLOW
      =================================================== */}

      <section className="border-t border-slate-200 bg-white">

        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6">

            <div className="mb-6">

              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Execution pipeline
              </p>

              <h3 className="mt-2 text-lg font-semibold">
                Multimodal media flow
              </h3>

            </div>

            <div className="flex flex-wrap items-center gap-2">

              <FlowStep
                icon={FolderInput}
                text="Input"
              />

              <Arrow />

              <FlowStep
                icon={ScanEye}
                text="Understand"
              />

              <Arrow />

              <FlowStep
                icon={Brain}
                text="Reason"
              />

              <Arrow />

              <FlowStep
                icon={WandSparkles}
                text="Transform"
              />

              <Arrow />

              <FlowStep
                icon={Sparkles}
                text="Generate"
              />

              <Arrow />

              <FlowStep
                icon={CheckCircle2}
                text="Verify"
              />

              <Arrow />

              <FlowStep
                icon={FileOutput}
                text="Output"
              />

            </div>

          </div>

        </div>

      </section>

      {/* ===================================================
          OUTPUT TYPES
      =================================================== */}

      <section className="border-t border-slate-200 bg-slate-50">

        <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">

          <div className="grid gap-4 md:grid-cols-5">

            <OutputCard
              icon={FileText}
              title="Text"
              description="Reports, emails, summaries and code"
            />

            <OutputCard
              icon={ImageIcon}
              title="Image"
              description="Images, diagrams and visual concepts"
            />

            <OutputCard
              icon={Volume2}
              title="Audio"
              description="Audio generation and transformation"
            />

            <OutputCard
              icon={Mic}
              title="Voice"
              description="Voice answers and narration"
            />

            <OutputCard
              icon={Video}
              title="Video"
              description="Generated and transformed video"
            />

          </div>

        </div>

      </section>

    </main>
  );
}

/* =========================================================
   ARCHITECTURE CARD
========================================================= */

function ArchitectureCard({
  icon: Icon,
  title,
  items,
}: {
  icon: ElementType;
  title: string;
  items: string[];
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex items-center gap-3">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
          <Icon size={18} />
        </div>

        <h4 className="font-semibold">
          {title}
        </h4>

      </div>

      <div className="mt-4 space-y-2">

        {items.map((item) => (

          <div
            key={item}
            className="flex items-center gap-2 text-xs text-slate-500"
          >

            <CheckCircle2
              size={13}
              className="text-slate-400"
            />

            {item}

          </div>

        ))}

      </div>

    </div>
  );
}

/* =========================================================
   FLOW STEP
========================================================= */

function FlowStep({
  icon: Icon,
  text,
}: {
  icon: ElementType;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 shadow-sm">

      <Icon
        size={15}
        className="text-slate-500"
      />

      <span className="text-xs font-medium text-slate-600">
        {text}
      </span>

    </div>
  );
}

/* =========================================================
   ARROW
========================================================= */

function Arrow() {
  return (
    <ArrowRight
      size={15}
      className="hidden text-slate-300 sm:block"
    />
  );
}

/* =========================================================
   OUTPUT CARD
========================================================= */

function OutputCard({
  icon: Icon,
  title,
  description,
}: {
  icon: ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">

      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-50 text-slate-600">
        <Icon size={17} />
      </div>

      <h4 className="mt-3 text-sm font-semibold">
        {title}
      </h4>

      <p className="mt-1 text-[11px] leading-5 text-slate-400">
        {description}
      </p>

    </div>
  );
}