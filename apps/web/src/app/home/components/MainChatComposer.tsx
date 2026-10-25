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

import { useRouter } from "next/navigation";
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
};

type ResponseRating = "good" | "bad" | null;

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
    name: "Voice",
    description: "Open voice mode",
    icon: Mic,
    action: "voice",
  },
  {
    name: "Camera",
    description: "Take a photo",
    icon: Camera,
    action: "camera",
  },
  {
    name: "Photos",
    description: "Upload photos",
    icon: ImageIcon,
    action: "photos",
  },
  {
    name: "PDF / Document",
    description: "Select a document",
    icon: FileText,
    action: "document",
  },
  {
    name: "Web Search",
    description: "Prepare a web search prompt",
    icon: Globe,
    action: "web-search",
  },
  {
    name: "Deep Search",
    description: "Prepare a research prompt",
    icon: Search,
    action: "deep-search",
  },
  {
    name: "ModelNow Platform",
    description: "Use ModelNow platform capabilities",
    icon: Sparkles,
    action: "platform",
  },
];

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    window.alert(
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
      window.alert(
        "Text copied! You can now share it anywhere.",
      );
    }
  } catch (error) {
    if (
      error instanceof Error &&
      error.name !== "AbortError"
    ) {
      window.alert("Unable to share this message.");
    }
  }
}

export default function MainChatComposer({
  chat,
  onSendMessage,
  onEditMessage,
  isLoading,
  onNewChat,
}: MainChatComposerProps) {
  const router = useRouter();

  const [input, setInput] = useState("");
  const [plusOpen, setPlusOpen] = useState(false);

  const [editingMessageId, setEditingMessageId] =
    useState<string | null>(null);

  const [editingText, setEditingText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const messages = chat.messages;

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

  function startNewChat() {
    setInput("");
    setPlusOpen(false);
    cancelEditing();
    onNewChat();
  }

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

      case "voice":
        router.push("/voice");
        break;

      case "camera":
        cameraInputRef.current?.click();
        break;

      case "photos":
        photoInputRef.current?.click();
        break;

      case "document":
        fileInputRef.current?.click();
        break;

      case "web-search":
        setInput(
          (current) => current || "Search the web for ",
        );
        break;

      case "deep-search":
        setInput(
          (current) => current || "Perform deep research on ",
        );
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

  function sendMessage() {
    const content = input.trim();

    if (!content || isLoading) return;

    onSendMessage(content);
    setInput("");
    setPlusOpen(false);
    cancelEditing();
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  }

  const composerProps: ComposerProps = {
    input,
    setInput,
    isLoading,
    sendMessage,
    handleKeyDown,
    plusOpen,
    setPlusOpen,
    handlePlusItem,
    openVoice: () => router.push("/voice"),
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

  if (messages.length > 0) {
    return (
      <div className="flex min-h-[calc(100vh-72px)] flex-col">
        <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 md:px-8">
          <div className="space-y-6">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                editing={editingMessageId === message.id}
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
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                  <Sparkles size={16} />
                </div>

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
};

function ComposerBox(props: ComposerProps) {
  return (
    <div className="relative rounded-2xl border border-slate-200 bg-white shadow-sm">
      <textarea
        value={props.input}
        onChange={(event) => props.setInput(event.target.value)}
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

function ComposerBar(props: ComposerProps) {
  return (
    <div className="shrink-0 border-t border-slate-200 bg-white px-4 pb-5 pt-3 md:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <textarea
            value={props.input}
            onChange={(event) => props.setInput(event.target.value)}
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

function ComposerActions(props: ComposerProps) {
  return (
    <div className="flex items-center justify-between px-3 pb-3 pt-2">
      <div className="relative z-[60]">
        <button
          type="button"
          aria-label="Open tools"
          aria-expanded={props.plusOpen}
          onClick={() => props.setPlusOpen(!props.plusOpen)}
          className={`flex h-9 w-9 items-center justify-center rounded-xl text-xl ${
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
          aria-label="Voice"
          onClick={props.openVoice}
          className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
        >
          <Mic size={19} />
        </button>

        <button
          type="button"
          aria-label="Send message"
          onClick={props.sendMessage}
          disabled={!props.input.trim() || props.isLoading}
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

function PlusMenu({
  onSelect,
}: {
  onSelect: (item: PlusMenuItem) => void;
}) {
  return (
    <div className="absolute bottom-[calc(100%+12px)] left-0 z-[100] max-h-[min(600px,calc(100vh-120px))] w-[280px] overflow-y-auto overscroll-contain rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
      <div className="sticky top-0 z-10 bg-white px-3 py-2">
        <p className="text-xs font-semibold">Add to chat</p>
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
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
              <Icon size={17} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-900">
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
type ChatMessageProps = {
  message: ChatMessage;
  editing: boolean;
  editingText: string;
  onEditingTextChange: (value: string) => void;
  onStartEdit: () => void;
  onSaveEdit: () => void;
  onCancelEdit: () => void;
};

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

  const [rating, setRating] = useState<ResponseRating>(null);
  const [ratingOpen, setRatingOpen] = useState(false);
  const [isReading, setIsReading] = useState(false);

  const utteranceRef =
    useRef<SpeechSynthesisUtterance | null>(null);

  const bubbleStyle = isUser
    ? "rounded-2xl rounded-br-md bg-slate-900 text-white"
    : "rounded-2xl rounded-tl-md bg-slate-100 text-slate-700";

  const actionStyle =
    "text-slate-500 hover:bg-slate-200 hover:text-slate-900";

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

  function handleReadAloud() {
    // Check for a browser environment before accessing window.
    if (typeof window === "undefined") {
      return;
    }

    if (!("speechSynthesis" in window)) {
      alert("Read aloud is not supported in this browser.");
      return;
    }

    if (isReading) {
      window.speechSynthesis.cancel();
      utteranceRef.current = null;
      setIsReading(false);
      return;
    }

    // Stop any previous speech before reading this response.
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

  function handleRating(
    nextRating: Exclude<ResponseRating, null>,
  ) {
    setRating(nextRating);
    setRatingOpen(false);
  }

  return (
    <article
      className={`group flex items-start gap-3 ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      {!isUser && (
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
          <Sparkles size={16} />
        </div>
      )}

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
            {/* Copy */}
            <button
              type="button"
              onClick={() => void copyText(message.content)}
              title="Copy"
              aria-label="Copy message"
              className={`rounded-lg p-1.5 transition ${actionStyle}`}
            >
              <Copy size={15} />
            </button>

            {isUser ? (
              <>
                {/* User message: Share, then Edit */}
                <button
                  type="button"
                  onClick={() =>
                    void shareText("My Message", message.content)
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
                {/* Rate response */}
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
                          onClick={() => setRatingOpen(false)}
                          aria-label="Close rating popup"
                          className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRating("good")}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition hover:bg-slate-50 ${
                          rating === "good" ? "bg-slate-100" : ""
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
                        onClick={() => handleRating("bad")}
                        className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left text-sm transition hover:bg-slate-50 ${
                          rating === "bad" ? "bg-slate-100" : ""
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

                {/* Read aloud / Stop reading */}
                <button
                  type="button"
                  onClick={handleReadAloud}
                  title={isReading ? "Stop reading" : "Read aloud"}
                  aria-label={
                    isReading ? "Stop reading" : "Read aloud"
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

                {/* Share */}
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