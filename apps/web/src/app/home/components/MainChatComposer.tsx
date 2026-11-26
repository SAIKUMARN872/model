
"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type ElementType,
  type RefObject,
} from "react";

import Image from "next/image";

import {
  ArrowUp,
  BarChart3,
  Camera,
  Check,
  Copy,
  FileText,
  Globe,
  Image as ImageIcon,
  Layers,
  MessageSquare,
  Mic,
  Pencil,
  Search,
  Share2,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";

import type { Chat, ChatMessage } from "../chat-types";

/* -------------------------------------------------------------------------- */
/* Browser speech recognition types                                           */
/* -------------------------------------------------------------------------- */

type ModelNowSpeechAlternative = {
  transcript: string;
};

type ModelNowSpeechResult = {
  0: ModelNowSpeechAlternative;
  isFinal: boolean;
};

type ModelNowSpeechResults = {
  length: number;
  [index: number]: ModelNowSpeechResult;
};

type ModelNowSpeechResultEvent = {
  resultIndex: number;
  results: ModelNowSpeechResults;
};

type ModelNowSpeechErrorEvent = {
  error: string;
};

type ModelNowSpeechRecognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onresult: ((event: ModelNowSpeechResultEvent) => void) | null;
  onerror: ((event: ModelNowSpeechErrorEvent) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type ModelNowSpeechRecognitionConstructor = {
  new (): ModelNowSpeechRecognition;
};

type ModelNowSpeechWindow = Window & {
  SpeechRecognition?: ModelNowSpeechRecognitionConstructor;
  webkitSpeechRecognition?: ModelNowSpeechRecognitionConstructor;
};

/* -------------------------------------------------------------------------- */
/* Component types                                                            */
/* -------------------------------------------------------------------------- */

type PlusMenuItem = {
  name: string;
  description: string;
  icon: ElementType;
  action: string;
};

type MainChatComposerProps = {
  chat: Chat;
  onSendMessage: (content: string) => void;
  onEditMessage: (messageId: string, content: string) => void;
  isLoading: boolean;
  onNewChat: () => void;
  onOpenSections: () => void;
};

type ResponseRating = "good" | "bad" | null;

/* -------------------------------------------------------------------------- */
/* Plus menu items                                                            */
/* -------------------------------------------------------------------------- */

const plusMenuItems: PlusMenuItem[] = [
  {
    name: "New Chat",
    description: "Start a fresh conversation",
    icon: MessageSquare,
    action: "new-chat",
  },
  {
    name: "Chart",
    description: "AI analytics and charts",
    icon: BarChart3,
    action: "chart",
  },
  {
    name: "Photos",
    description: "Upload photos",
    icon: ImageIcon,
    action: "photos",
  },
  {
    name: "Camera",
    description: "Capture a photo",
    icon: Camera,
    action: "camera",
  },
  {
    name: "PDF / Document",
    description: "Select a document",
    icon: FileText,
    action: "document",
  },
  {
    name: "Web Search",
    description: "Search the web for information",
    icon: Globe,
    action: "web-search",
  },
  {
    name: "Deep Search",
    description: "Perform in-depth AI research",
    icon: Search,
    action: "deep-search",
  },
  {
    name: "Sections",
    description: "Open ModelNow customization sections",
    icon: Layers,
    action: "sections",
  },
  {
    name: "ModelNow Platform",
    description: "Use ModelNow platform capabilities",
    icon: Sparkles,
    action: "platform",
  },
];

/* -------------------------------------------------------------------------- */
/* Copy and share                                                             */
/* -------------------------------------------------------------------------- */

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    console.error(
      "Could not copy. Please check clipboard permissions.",
    );
  }
}

async function shareText(title: string, text: string) {
  try {
    if (navigator.share) {
      await navigator.share({ title, text });
    } else {
      await navigator.clipboard.writeText(text);
      console.error(
        "Text copied! You can now share it anywhere.",
      );
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.name !== "AbortError"
    ) {
      console.error("Unable to share this message.");
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Main chat composer                                                         */
/* -------------------------------------------------------------------------- */

export default function MainChatComposer({
  chat,
  onSendMessage,
  onEditMessage,
  isLoading,
  onNewChat,
  onOpenSections,
}: MainChatComposerProps) {
  const [input, setInput] = useState("");
  const [plusOpen, setPlusOpen] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const [editingMessageId, setEditingMessageId] =
    useState<string | null>(null);

  const [editingText, setEditingText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const recognitionRef =
    useRef<ModelNowSpeechRecognition | null>(null);

  const voiceBaseTextRef = useRef("");
  const voiceFinalTextRef = useRef("");

  const messages = chat.messages;

  /* ------------------------------------------------------------------------ */
  /* Speech-to-text                                                           */
  /* ------------------------------------------------------------------------ */

  function stopVoiceInput() {
    const recognition = recognitionRef.current;

    if (!recognition) {
      setIsListening(false);
      return;
    }

    try {
      recognition.stop();
    } catch {
      recognitionRef.current = null;
      setIsListening(false);
    }
  }

  function startVoiceInput() {
    if (typeof window === "undefined") return;

    if (recognitionRef.current) {
      stopVoiceInput();
      return;
    }

    const speechWindow =
      window as unknown as ModelNowSpeechWindow;

    const SpeechRecognitionAPI =
      speechWindow.SpeechRecognition ||
      speechWindow.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      console.error(
        "Speech recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.",
      );
      return;
    }

    try {
      const recognition =
        new SpeechRecognitionAPI() as ModelNowSpeechRecognition;

      recognition.lang = navigator.language || "en-US";
      recognition.continuous = true;
      recognition.interimResults = true;

      voiceBaseTextRef.current = input.trim();
      voiceFinalTextRef.current = "";

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (
        event: ModelNowSpeechResultEvent,
      ) => {
        let interimTranscript = "";

        for (
          let i = event.resultIndex;
          i < event.results.length;
          i++
        ) {
          const result = event.results[i];
          const transcript = result[0]?.transcript || "";

          if (result.isFinal) {
            voiceFinalTextRef.current += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }

        const spokenText = (
          voiceFinalTextRef.current + interimTranscript
        ).trim();

        const originalText = voiceBaseTextRef.current;

        setInput(
          [originalText, spokenText]
            .filter(Boolean)
            .join(originalText ? " " : ""),
        );
      };

      recognition.onerror = (
        event: ModelNowSpeechErrorEvent,
      ) => {
        setIsListening(false);

        if (
          event.error === "not-allowed" ||
          event.error === "service-not-allowed"
        ) {
          console.error(
            "Microphone permission was denied. Please allow microphone access in your browser settings.",
          );
        } else if (event.error === "audio-capture") {
          console.error(
            "No microphone was detected. Please connect or enable a microphone.",
          );
        } else if (
          event.error !== "no-speech" &&
          event.error !== "aborted"
        ) {
          console.error(
            `Voice recognition error: ${event.error}`,
          );
        }
      };

      recognition.onend = () => {
        const spokenText =
          voiceFinalTextRef.current.trim();

        const originalText = voiceBaseTextRef.current;

        if (spokenText) {
          setInput(
            [originalText, spokenText]
              .filter(Boolean)
              .join(originalText ? " " : ""),
          );
        }

        recognitionRef.current = null;
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setIsListening(false);

      console.error(
        "Could not start voice recognition. Please check your microphone and try again.",
      );
    }
  }

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // Recognition may already have stopped.
        }

        recognitionRef.current = null;
      }
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Message editing                                                          */
  /* ------------------------------------------------------------------------ */

  function cancelEditing() {
    setEditingMessageId(null);
    setEditingText("");
  }

  function startEditing(message: ChatMessage) {
    if (message.role !== "user") return;

    setEditingMessageId(message.id);
    setEditingText(message.content);
  }

  function saveEditing() {
    const content = editingText.trim();

    if (!content || !editingMessageId) return;

    onEditMessage(editingMessageId, content);
    cancelEditing();
  }

  /* ------------------------------------------------------------------------ */
  /* New chat                                                                 */
  /* ------------------------------------------------------------------------ */

  function startNewChat() {
    setInput("");
    setPlusOpen(false);
    cancelEditing();
    onNewChat();
  }

  /* ------------------------------------------------------------------------ */
  /* Plus menu actions                                                        */
  /* ------------------------------------------------------------------------ */

  function handlePlusItem(item: PlusMenuItem) {
    setPlusOpen(false);

    switch (item.action) {
      case "new-chat":
        startNewChat();
        break;

      case "chart":
        setInput(
          (current) =>
            current ||
            "Help me analyze data and create a chart: ",
        );
        break;

      case "photos":
        photoInputRef.current?.click();
        break;

      case "camera":
        cameraInputRef.current?.click();
        break;

      case "document":
        fileInputRef.current?.click();
        break;

      case "web-search":
        setInput(
          (current) =>
            current || "Search the web for ",
        );
        break;

      case "deep-search":
        setInput(
          (current) =>
            current || "Perform deep research on ",
        );
        break;

      case "sections":
        onOpenSections();
        break;

      case "platform":
        setInput(
          (current) =>
            current ||
            "Build an AI workflow using ModelNow platform capabilities.",
        );
        break;

      default:
        break;
    }
  }

  /* ------------------------------------------------------------------------ */
  /* File handling                                                            */
  /* ------------------------------------------------------------------------ */

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setInput((current) =>
      current
        ? `${current}\nAttached file: ${file.name}`
        : `Attached file: ${file.name}`,
    );

    event.target.value = "";
  }

  function handlePhotoChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setInput((current) =>
      current
        ? `${current}\nPhoto selected: ${file.name}`
        : `Photo selected: ${file.name}`,
    );

    event.target.value = "";
  }

  function handleCameraChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    setInput((current) =>
      current
        ? `${current}\nCamera image selected: ${file.name}`
        : `Camera image selected: ${file.name}`,
    );

    event.target.value = "";
  }

  /* ------------------------------------------------------------------------ */
  /* Send message                                                             */
  /* ------------------------------------------------------------------------ */

  function sendMessage() {
    const content = input.trim();

    if (!content || isLoading) return;

    if (recognitionRef.current) {
      stopVoiceInput();
    }

    onSendMessage(content);

    setInput("");
    setPlusOpen(false);
    cancelEditing();
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Composer props                                                           */
  /* ------------------------------------------------------------------------ */

  const composerProps: ComposerProps = {
    input,
    setInput,
    isLoading,
    sendMessage,
    handleKeyDown,
    plusOpen,
    setPlusOpen,
    handlePlusItem,
    openVoice: startVoiceInput,
    isListening,
  };

  const hiddenInputs = (
    <HiddenInputs
      fileInputRef={fileInputRef}
      photoInputRef={photoInputRef}
      cameraInputRef={cameraInputRef}
      handleFileChange={handleFileChange}
      handlePhotoChange={handlePhotoChange}
      handleCameraChange={handleCameraChange}
    />
  );

  /* ------------------------------------------------------------------------ */
  /* Existing conversation                                                    */
  /* ------------------------------------------------------------------------ */

  if (messages.length > 0) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] flex-col">
        <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 md:px-8">
          <div className="space-y-6">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                editing={
                  editingMessageId === message.id
                }
                editingText={editingText}
                onEditingTextChange={setEditingText}
                onStartEdit={() => startEditing(message)}
                onSaveEdit={saveEditing}
                onCancelEdit={cancelEditing}
              />
            ))}

            {isLoading && (
              <div
                className="flex items-start gap-3"
                role="status"
                aria-label="ModelNow is preparing a response"
              >
                <div className="rounded-2xl bg-slate-100 px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
                    <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <ComposerBar {...composerProps} />

        {hiddenInputs}
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Empty conversation                                                       */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 md:px-8">
      <div className="mb-8 text-center">
        <div className="relative mx-auto mb-5 h-16 w-16 overflow-hidden rounded-2xl">
          <Image
            src="/modelnow-logo.png"
            alt="ModelNow logo"
            fill
            sizes="64px"
            className="object-contain"
            priority
          />
        </div>

        <h2 className="text-2xl font-bold md:text-3xl">
          ModelNow
        </h2>

        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-500">
          One intelligent AI platform for models, automation,
          enterprise workflows, knowledge and multimodal AI.
        </p>
      </div>

      <div className="mx-auto max-w-3xl">
        <ComposerBox {...composerProps} />
      </div>

      {hiddenInputs}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Composer component types                                                  */
/* -------------------------------------------------------------------------- */

type ComposerProps = {
  input: string;
  setInput: (value: string) => void;
  isLoading: boolean;
  sendMessage: () => void;
  handleKeyDown: (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => void;
  plusOpen: boolean;
  setPlusOpen: (value: boolean) => void;
  handlePlusItem: (item: PlusMenuItem) => void;
  openVoice: () => void;
  isListening: boolean;
};

/* -------------------------------------------------------------------------- */
/* Main composer box                                                          */
/* -------------------------------------------------------------------------- */

function ComposerBox(props: ComposerProps) {
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm">
      <textarea
        value={props.input}
        onChange={(event) =>
          props.setInput(event.target.value)
        }
        onKeyDown={props.handleKeyDown}
        placeholder="Message ModelNow..."
        rows={4}
        maxLength={100000}
        aria-label="Message ModelNow"
        className="w-full resize-none bg-transparent px-5 pt-5 text-sm leading-6 outline-none placeholder:text-slate-400"
      />

      <ComposerActions {...props} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Bottom composer bar                                                        */
/* -------------------------------------------------------------------------- */

function ComposerBar(props: ComposerProps) {
  return (
    <div className="shrink-0 border-t border-slate-200 bg-white px-4 pb-5 pt-3 md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <textarea
            value={props.input}
            onChange={(event) =>
              props.setInput(event.target.value)
            }
            onKeyDown={props.handleKeyDown}
            placeholder="Message ModelNow..."
            rows={2}
            maxLength={100000}
            aria-label="Message ModelNow"
            className="w-full resize-none bg-transparent px-4 pt-4 text-sm leading-6 outline-none placeholder:text-slate-400"
          />

          <ComposerActions {...props} />
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Composer buttons                                                           */
/* -------------------------------------------------------------------------- */

function ComposerActions(props: ComposerProps) {
  return (
    <div className="flex items-center justify-between px-3 pb-3 pt-2">
      <div className="relative z-[60]">
        <button
          type="button"
          aria-label="Open tools"
          aria-expanded={props.plusOpen}
          aria-haspopup="true"
          onClick={() =>
            props.setPlusOpen(!props.plusOpen)
          }
          className={`flex h-9 w-9 items-center justify-center rounded-xl text-xl transition ${
            props.plusOpen
              ? "bg-slate-100 text-slate-900"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          +
        </button>

        {props.plusOpen && (
          <PlusMenu onSelect={props.handlePlusItem} />
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          aria-label={
            props.isListening
              ? "Stop voice input"
              : "Start voice input"
          }
          title={
            props.isListening
              ? "Stop voice input"
              : "Speak your message"
          }
          aria-pressed={props.isListening}
          onClick={props.openVoice}
          className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
            props.isListening
              ? "animate-pulse bg-red-100 text-red-600"
              : "text-slate-500 hover:bg-slate-100"
          }`}
        >
          <Mic size={19} />
        </button>

        <button
          type="button"
          aria-label="Send message"
          onClick={props.sendMessage}
          disabled={
            !props.input.trim() || props.isLoading
          }
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            props.input.trim() && !props.isLoading
              ? "bg-slate-900 text-white hover:bg-slate-800"
              : "bg-slate-100 text-slate-400"
          }`}
        >
          <ArrowUp size={18} />
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Plus menu                                                                  */
/* -------------------------------------------------------------------------- */

function PlusMenu({
  onSelect,
}: {
  onSelect: (item: PlusMenuItem) => void;
}) {
  return (
    <div className="absolute bottom-full left-0 z-[100] mb-2 max-h-[min(360px,calc(100vh-140px))] w-[230px] overflow-y-auto overscroll-contain rounded-xl border border-slate-200 bg-white p-1 shadow-xl">
      <div className="sticky top-0 z-10 bg-white px-2.5 py-1.5">
        <p className="text-xs font-semibold text-slate-900">
          Add to chat
        </p>

        <p className="text-[10px] text-slate-400">
          Choose a ModelNow capability
        </p>
      </div>

      {plusMenuItems.map((item) => {
        const Icon = item.icon;

        return (
          <button
            type="button"
            key={item.action}
            onClick={() => onSelect(item)}
            className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition hover:bg-slate-50"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
              <Icon size={15} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-medium text-slate-900">
                {item.name}
              </p>

              <p className="text-[10px] leading-4 text-slate-400">
                {item.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Chat message types                                                         */
/* -------------------------------------------------------------------------- */

type ChatMessageProps = {
  message: ChatMessage;
  editing: boolean;
  editingText: string;
  onEditingTextChange: (value: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
};

/* -------------------------------------------------------------------------- */
/* Chat message                                                               */
/* -------------------------------------------------------------------------- */

function ChatMessage({
  message,
  editing,
  editingText,
  onEditingTextChange,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
}: ChatMessageProps) {
  const isUser = message.role === "user";

  const [rating, setRating] =
    useState<ResponseRating>(null);

  const [ratingOpen, setRatingOpen] = useState(false);
  const [isReading, setIsReading] = useState(false);

  const utteranceRef =
    useRef<SpeechSynthesisUtterance | null>(null);

  const bubbleStyle = isUser
    ? "rounded-2xl rounded-br-md bg-slate-100 text-slate-700"
    : "rounded-2xl rounded-tl-md bg-slate-100 text-slate-700";

  const actionStyle =
    "text-slate-500 hover:bg-slate-200 hover:text-slate-900";

  /* ------------------------------------------------------------------------ */
  /* Read-aloud cleanup                                                       */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    return () => {
      if (
        typeof window !== "undefined" &&
        utteranceRef.current &&
        "speechSynthesis" in window
      ) {
        window.speechSynthesis.cancel();
        utteranceRef.current = null;
      }
    };
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Read message aloud                                                       */
  /* ------------------------------------------------------------------------ */

  function handleReadAloud() {
    if (typeof window === "undefined") return;

    if (!("speechSynthesis" in window)) {
      console.error(
        "Read aloud is not supported in this browser.",
      );
      return;
    }

    if (isReading) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
      setIsReading(false);
      return;
    }

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(
      message.content,
    );

    utterance.lang = navigator.language || "en-US";
    utterance.rate = 1;
    utterance.pitch = 1;

    utterance.onend = () => {
      utteranceRef.current = null;
      setIsReading(false);
    };

    utterance.onerror = () => {
      utteranceRef.current = null;
      setIsReading(false);
    };

    utteranceRef.current = utterance;
    setIsReading(true);

    window.speechSynthesis.speak(utterance);
  }

  /* ------------------------------------------------------------------------ */
  /* Response rating                                                          */
  /* ------------------------------------------------------------------------ */

  function handleRating(
    nextRating: Exclude<ResponseRating, null>,
  ) {
    setRating(nextRating);
    setRatingOpen(false);
  }

  /* ------------------------------------------------------------------------ */
  /* Message UI                                                               */
  /* ------------------------------------------------------------------------ */

  return (
    <article
      className={`group flex items-start gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`max-w-[85%] min-w-0 ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`whitespace-pre-wrap break-words px-4 py-3 text-sm leading-6 ${bubbleStyle}`}
        >
          {editing ? (
            <div className="min-w-[220px] space-y-2">
              <textarea
                autoFocus
                value={editingText}
                onChange={(event) =>
                  onEditingTextChange(event.target.value)
                }
                rows={Math.min(
                  8,
                  Math.max(
                    3,
                    editingText.split("\n").length + 1,
                  ),
                )}
                aria-label="Edit your message"
                className="w-full resize-y rounded-lg border border-slate-300 bg-white p-2 text-sm leading-5 text-slate-900 outline-none focus:border-slate-500"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onCancelEdit}
                  className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-200"
                >
                  <X size={13} />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={onSaveEdit}
                  disabled={!editingText.trim()}
                  className="flex items-center gap-1 rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white hover:bg-slate-800 disabled:opacity-40"
                >
                  <Check size={13} />
                  Save
                </button>
              </div>
            </div>
          ) : (
            message.content
          )}
        </div>

        {!editing && (
          <div
            className={`mt-1 flex flex-wrap items-center gap-1 ${
              isUser ? "justify-end" : "justify-start"
            }`}
          >
            <button
              type="button"
              onClick={() =>
                void copyText(message.content)
              }
              title="Copy"
              aria-label="Copy message"
              className={`rounded-lg p-1.5 transition ${actionStyle}`}
            >
              <Copy size={15} />
            </button>

            {isUser ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    void shareText(
                      "My Message",
                      message.content,
                    )
                  }
                  title="Share"
                  aria-label="Share message"
                  className={`rounded-lg p-1.5 transition ${actionStyle}`}
                >
                  <Share2 size={15} />
                </button>

                <button
                  type="button"
                  onClick={onStartEdit}
                  title="Edit"
                  aria-label="Edit message"
                  className={`rounded-lg p-1.5 transition ${actionStyle}`}
                >
                  <Pencil size={15} />
                </button>
              </>
            ) : (
              <>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() =>
                      setRatingOpen((open) => !open)
                    }
                    title="Rate response"
                    aria-label="Rate response"
                    aria-expanded={ratingOpen}
                    className={`flex items-center gap-1 rounded-lg p-1.5 transition ${
                      rating
                        ? "bg-slate-200 text-slate-900"
                        : actionStyle
                    }`}
                  >
                    {rating === "good" ? (
                      <ThumbsUp
                        size={15}
                        className="fill-current"
                      />
                    ) : rating === "bad" ? (
                      <ThumbsDown
                        size={15}
                        className="fill-current"
                      />
                    ) : (
                      <ThumbsUp size={15} />
                    )}
                  </button>

                  {ratingOpen && (
                    <div
                      role="dialog"
                      aria-label="Rate this response"
                      className="absolute bottom-[calc(100%+10px)] left-0 z-50 w-60 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
                    >
                      <div className="flex items-center justify-between px-2 py-2">
                        <p className="text-sm font-semibold text-slate-900">
                          Rate this response
                        </p>

                        <button
                          type="button"
                          onClick={() =>
                            setRatingOpen(false)
                          }
                          aria-label="Close rating popup"
                          className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleRating("good")
                        }
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition hover:bg-slate-50 ${
                          rating === "good"
                            ? "bg-slate-100"
                            : ""
                        }`}
                      >
                        <ThumbsUp
                          size={17}
                          className={
                            rating === "good"
                              ? "text-slate-900"
                              : "text-slate-500"
                          }
                        />

                        <span className="flex-1 text-slate-800">
                          Good response
                        </span>

                        {rating === "good" && (
                          <Check size={15} />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleRating("bad")
                        }
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition hover:bg-slate-50 ${
                          rating === "bad"
                            ? "bg-slate-100"
                            : ""
                        }`}
                      >
                        <ThumbsDown
                          size={17}
                          className={
                            rating === "bad"
                              ? "text-slate-900"
                              : "text-slate-500"
                          }
                        />

                        <span className="flex-1 text-slate-800">
                          Bad response
                        </span>

                        {rating === "bad" && (
                          <Check size={15} />
                        )}
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleReadAloud}
                  title={
                    isReading
                      ? "Stop reading"
                      : "Read aloud"
                  }
                  aria-label={
                    isReading
                      ? "Stop reading"
                      : "Read aloud"
                  }
                  aria-pressed={isReading}
                  className={`flex items-center gap-1 rounded-lg p-1.5 transition ${
                    isReading
                      ? "bg-slate-200 text-slate-900"
                      : actionStyle
                  }`}
                >
                  {isReading ? (
                    <VolumeX size={15} />
                  ) : (
                    <Volume2 size={15} />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() =>
                    void shareText(
                      "ModelNow Response",
                      message.content,
                    )
                  }
                  title="Share"
                  aria-label="Share response"
                  className={`rounded-lg p-1.5 transition ${actionStyle}`}
                >
                  <Share2 size={15} />
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* Hidden file inputs                                                         */
/* -------------------------------------------------------------------------- */

function HiddenInputs({
  fileInputRef,
  photoInputRef,
  cameraInputRef,
  handleFileChange,
  handlePhotoChange,
  handleCameraChange,
}: {
  fileInputRef: RefObject<HTMLInputElement | null>;
  photoInputRef: RefObject<HTMLInputElement | null>;
  cameraInputRef: RefObject<HTMLInputElement | null>;
  handleFileChange: (
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
  handlePhotoChange: (
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
  handleCameraChange: (
    event: ChangeEvent<HTMLInputElement>,
  ) => void;
}) {
  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.json"
        onChange={handleFileChange}
      />

      <input
        ref={photoInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handlePhotoChange}
      />

      <input
        ref={cameraInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        capture="environment"
        onChange={handleCameraChange}
      />
    </>
  );
}
