import {
  AudioLines,
  Brain,
  FileAudio,
  FileImage,
  FileOutput,
  FileText,
  Image as ImageIcon,
  Languages,
  Mic,
  Play,
  ScanEye,
  Sparkles,
  Subtitles,
  WandSparkles,
  Volume2,
  Video,
} from "lucide-react";

import type {
  CategoryConfig,
  MediaCategory,
} from "./CategoryTabs";

import type { MediaTool } from "./ToolSidebar";

export type { MediaCategory, CategoryConfig } from "./CategoryTabs";
export type { MediaTool } from "./ToolSidebar";

/* -------------------------------------------------------------------------- */
/* Input tools                                                                */
/* -------------------------------------------------------------------------- */

const inputTools: MediaTool[] = [
  {
    id: "input-text",
    name: "Text Input",
    description: "Process natural language instructions and text content.",
    icon: FileText,
  },
  {
    id: "input-image",
    name: "Image Input",
    description: "Upload and understand visual information.",
    icon: FileImage,
  },
  {
    id: "input-audio",
    name: "Audio Input",
    description: "Process audio recordings and sound.",
    icon: FileAudio,
  },
  {
    id: "input-video",
    name: "Video Input",
    description: "Analyze video content and visual events.",
    icon: Video,
  },
];

/* -------------------------------------------------------------------------- */
/* Image tools                                                                */
/* -------------------------------------------------------------------------- */

const imageTools: MediaTool[] = [
  {
    id: "image-understanding",
    name: "Image Understanding",
    description: "Analyze objects, scenes, text and visual context.",
    icon: ScanEye,
  },
  {
    id: "image-generation",
    name: "Image Generation",
    description: "Generate images from natural language instructions.",
    icon: ImageIcon,
  },
  {
    id: "image-editing",
    name: "Image Editing",
    description: "Transform, enhance and modify existing images.",
    icon: WandSparkles,
  },
  {
    id: "image-captioning",
    name: "Image Captioning",
    description: "Generate accurate descriptions from images.",
    icon: FileImage,
  },
];

/* -------------------------------------------------------------------------- */
/* Audio tools                                                                */
/* -------------------------------------------------------------------------- */

const audioTools: MediaTool[] = [
  {
    id: "audio-understanding",
    name: "Audio Understanding",
    description: "Understand spoken content, sounds and audio context.",
    icon: AudioLines,
  },
  {
    id: "audio-transcription",
    name: "Transcription",
    description: "Convert spoken audio into structured text.",
    icon: FileText,
  },
  {
    id: "audio-generation",
    name: "Audio Generation",
    description: "Generate audio from text and multimodal instructions.",
    icon: Volume2,
  },
  {
    id: "audio-enhancement",
    name: "Audio Enhancement",
    description: "Improve clarity and quality of audio content.",
    icon: WandSparkles,
  },
];

/* -------------------------------------------------------------------------- */
/* Voice tools                                                                */
/* -------------------------------------------------------------------------- */

const voiceTools: MediaTool[] = [
  {
    id: "voice-input",
    name: "Voice Input",
    description: "Interact with ModelNow using natural speech.",
    icon: Mic,
  },
  {
    id: "voice-transcription",
    name: "Voice Transcription",
    description: "Convert spoken conversations into text.",
    icon: Subtitles,
  },
  {
    id: "voice-generation",
    name: "Voice Generation",
    description: "Generate natural AI voice responses.",
    icon: Volume2,
  },
  {
    id: "voice-conversation",
    name: "Voice Conversation",
    description: "Enable real-time conversational AI experiences.",
    icon: AudioLines,
  },
];

/* -------------------------------------------------------------------------- */
/* Video tools                                                                */
/* -------------------------------------------------------------------------- */

const videoTools: MediaTool[] = [
  {
    id: "video-understanding",
    name: "Video Understanding",
    description: "Analyze scenes, actions and events across video.",
    icon: ScanEye,
  },
  {
    id: "video-generation",
    name: "Video Generation",
    description: "Generate video content from multimodal instructions.",
    icon: Video,
  },
  {
    id: "video-analysis",
    name: "Video Analysis",
    description: "Extract structured information from video.",
    icon: Play,
  },
  {
    id: "video-transformation",
    name: "Video Transformation",
    description: "Transform and enhance existing video content.",
    icon: WandSparkles,
  },
];

/* -------------------------------------------------------------------------- */
/* Cross-modal tools                                                          */
/* -------------------------------------------------------------------------- */

const crossModalTools: MediaTool[] = [
  {
    id: "text-image",
    name: "Text → Image",
    description: "Generate visual content from text instructions.",
    icon: ImageIcon,
  },
  {
    id: "text-voice",
    name: "Text → Voice",
    description: "Convert text into natural spoken responses.",
    icon: Volume2,
  },
  {
    id: "text-video",
    name: "Text → Video",
    description: "Create video experiences from text.",
    icon: Video,
  },
  {
    id: "image-video",
    name: "Image → Video",
    description: "Transform images into dynamic video content.",
    icon: Play,
  },
  {
    id: "audio-image",
    name: "Audio → Image",
    description: "Use audio context to generate visual content.",
    icon: ImageIcon,
  },
];

/* -------------------------------------------------------------------------- */
/* Processing tools                                                           */
/* -------------------------------------------------------------------------- */

const processingTools: MediaTool[] = [
  {
    id: "processing-transcription",
    name: "Transcription",
    description: "Convert audio and speech into searchable text.",
    icon: FileText,
  },
  {
    id: "processing-translation",
    name: "Translation",
    description: "Translate text, audio and multimodal content.",
    icon: Languages,
  },
  {
    id: "processing-enhancement",
    name: "Enhancement",
    description: "Improve quality across supported media formats.",
    icon: WandSparkles,
  },
  {
    id: "processing-compression",
    name: "Compression",
    description: "Optimize media size while preserving quality.",
    icon: FileOutput,
  },
  {
    id: "processing-fusion",
    name: "Media Fusion",
    description: "Combine multiple media types into one workflow.",
    icon: Sparkles,
  },
];

/* -------------------------------------------------------------------------- */
/* Output tools                                                               */
/* -------------------------------------------------------------------------- */

const outputTools: MediaTool[] = [
  {
    id: "output-text",
    name: "Text Output",
    description: "Generate reports, summaries, code and structured text.",
    icon: FileText,
  },
  {
    id: "output-image",
    name: "Image Output",
    description: "Generate diagrams, visuals and images.",
    icon: ImageIcon,
  },
  {
    id: "output-audio",
    name: "Audio Output",
    description: "Generate and transform audio content.",
    icon: Volume2,
  },
  {
    id: "output-voice",
    name: "Voice Output",
    description: "Generate natural voice responses and narration.",
    icon: Mic,
  },
  {
    id: "output-video",
    name: "Video Output",
    description: "Generate and transform video experiences.",
    icon: Video,
  },
];

/* -------------------------------------------------------------------------- */
/* Category configuration                                                      */
/* -------------------------------------------------------------------------- */

export const categories: CategoryConfig[] = [
  {
    id: "Input",
    description: "Text and media inputs",
    icon: FileText,
  },
  {
    id: "Image",
    description: "Image understanding and generation",
    icon: ImageIcon,
  },
  {
    id: "Audio",
    description: "Audio understanding and generation",
    icon: AudioLines,
  },
  {
    id: "Voice",
    description: "Voice interaction and synthesis",
    icon: Mic,
  },
  {
    id: "Video",
    description: "Video understanding and generation",
    icon: Video,
  },
  {
    id: "Cross-modal",
    description: "Transform one media type into another",
    icon: Sparkles,
  },
  {
    id: "Processing",
    description: "Media transformation and processing",
    icon: WandSparkles,
  },
  {
    id: "Output",
    description: "Multimodal output formats",
    icon: FileOutput,
  },
];

/* -------------------------------------------------------------------------- */
/* Tool resolver                                                               */
/* -------------------------------------------------------------------------- */

export function getTools(
  category: MediaCategory,
): MediaTool[] {
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