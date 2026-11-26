"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MessageSquare,
  Send,
  Paperclip,
  Mic,
  Copy,
  Share2,
  MoreVertical,
  Trash2,
  Layers,
  Sparkles,
  Clock3,
  BriefcaseBusiness,
  Settings,
  Database,
  CreditCard,
  Archive,
  Pencil,
  Check,
  X,
  Pin,
  PinOff,
} from "lucide-react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

type Chat = {
  id: string;
  title: string;
  messages: ChatMessage[];
  archived: boolean;
  pinned: boolean;
  updatedAt: number;
};

const STORAGE_KEY = "modelnow-chat-v5";
const MAX_TITLE_LENGTH = 36;

function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function createChat(): Chat {
  return {
    id: createId(),
    title: "New Chat",
    messages: [],
    archived: false,
    pinned: false,
    updatedAt: Date.now(),
  };
}

function getChatTitle(text: string): string {
  const cleaned = text.trim().replace(/\s+/g, " ");
  if (!cleaned) return "New Chat";
  if (cleaned.length <= MAX_TITLE_LENGTH) return cleaned;
  return `${cleaned.slice(0, MAX_TITLE_LENGTH).trimEnd()}...`;
}

function generateAIResponse(prompt: string): string {
  const lower = prompt.toLowerCase().trim();

  if (lower.includes("what is model now") || lower.includes("what is modelnow")) {
    return (
      "ModelNow is an intelligent, unified AI platform built for multi-model access, " +
      "enterprise workflows, prompt automation, custom knowledge bases, and multimodal capabilities. " +
      "It lets you build, compare, and deploy smart AI assistants in one clean workspace."
    );
  }

  if (
    lower.includes("hello") ||
    lower.includes("hi") ||
    lower.includes("how are you")
  ) {
    return (
      "Hello! I am doing great and ready to assist you. " +
      "You can ask me questions, build projects, customize workflows, or explore ModelNow features. How can I help you today?"
    );
  }

  if (lower.includes("who made you") || lower.includes("who created you")) {
    return "I am the ModelNow AI Assistant, engineered to power your automation and AI productivity workflows.";
  }

  return `I have processed your query: "${prompt}". I'm set up inside your ModelNow workspace to assist with answers, coding, analysis, and custom workflows.`;
}

function normalizeChats(value: unknown): Chat[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry): Chat[] => {
    if (!entry || typeof entry !== "object") return [];
    const item = entry as Record<string, unknown>;

    if (typeof item.id !== "string" || !Array.isArray(item.messages)) {
      return [];
    }

    const messages: ChatMessage[] = item.messages.flatMap((raw) => {
      if (!raw || typeof raw !== "object") return [];
      const m = raw as Record<string, unknown>;
      if (
        typeof m.id !== "string" ||
        (m.role !== "user" && m.role !== "assistant") ||
        typeof m.content !== "string"
      ) {
        return [];
      }
      return [{ id: m.id, role: m.role, content: m.content }];
    });

    const firstUserMsg = messages.find((m) => m.role === "user");
    const savedTitle = typeof item.title === "string" ? item.title : "New Chat";
    const title =
      (!savedTitle.trim() || savedTitle === "New Chat") && firstUserMsg
        ? getChatTitle(firstUserMsg.content)
        : savedTitle;

    return [
      {
        id: item.id,
        title,
        messages,
        archived: item.archived === true,
        pinned: item.pinned === true,
        updatedAt:
          typeof item.updatedAt === "number" ? item.updatedAt : Date.now(),
      },
    ];
  });
}

async function copyText(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  } catch {
    alert("Could not copy. Please check your clipboard permissions.");
  }
}

async function shareText(title: string, text: string): Promise<void> {
  try {
    if (navigator.share) {
      await navigator.share({ title, text });
    } else {
      await navigator.clipboard.writeText(text);
      alert("Text copied! You can now share it anywhere.");
    }
  } catch (error) {
    if (error instanceof Error && error.name !== "AbortError") {
      alert("Unable to share.");
    }
  }
}

export default function ChatPage() {
  const router = useRouter();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChatId, setActiveChatId] = useState("");
  const [input, setInput] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [headerMenuOpen, setHeaderMenuOpen] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");

  useEffect(() => {
    let restored: Chat[] = [];
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) restored = normalizeChats(JSON.parse(saved));
    } catch (error) {
      console.error("Unable to load saved chats:", error);
    }

    const params = new URLSearchParams(window.location.search);
    const requestedChatId = params.get("chatId");
    const requestedChat = restored.find(
      (chat) => chat.id === requestedChatId && !chat.archived
    );
    const firstActiveChat = restored.find((chat) => !chat.archived);

    let finalChats = restored;
    let finalActiveChatId = "";

    if (restored.length === 0) {
      const newChat = createChat();
      finalChats = [newChat];
      finalActiveChatId = newChat.id;
    } else if (requestedChat) {
      finalActiveChatId = requestedChat.id;
    } else if (firstActiveChat) {
      finalActiveChatId = firstActiveChat.id;
    } else {
      const newChat = createChat();
      finalChats = [...restored, newChat];
      finalActiveChatId = newChat.id;
    }

    setChats(finalChats);
    setActiveChatId(finalActiveChatId);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch (error) {
      console.error("Unable to save chats:", error);
    }
  }, [chats, loaded]);

  const activeChat = useMemo(
    () => chats.find((chat) => chat.id === activeChatId) ?? null,
    [chats, activeChatId]
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.messages.length]);

  const activeUnarchivedChats = useMemo(
    () =>
      chats
        .filter((c) => !c.archived)
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [chats]
  );

  const pinnedChats = useMemo(
    () => activeUnarchivedChats.filter((c) => c.pinned),
    [activeUnarchivedChats]
  );

  const recentChats = activeUnarchivedChats;

  function cancelEditingMessage() {
    setEditingMessageId(null);
    setEditingText("");
  }

  function startNewChat() {
    if (activeChat && activeChat.messages.length === 0) {
      setHeaderMenuOpen(false);
      return;
    }

    const newChat = createChat();
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChat.id);
    setInput("");
    setHeaderMenuOpen(false);
    cancelEditingMessage();
  }

  function openChat(chatId: string) {
    const chat = chats.find((item) => item.id === chatId);
    if (!chat || chat.archived) return;

    setActiveChatId(chatId);
    setInput("");
    setHeaderMenuOpen(false);
    cancelEditingMessage();
  }

  function togglePinChat(chatId: string) {
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? { ...chat, pinned: !chat.pinned, updatedAt: Date.now() }
          : chat
      )
    );
  }

  function startEditingMessage(message: ChatMessage) {
    if (message.role !== "user") return;
    setEditingMessageId(message.id);
    setEditingText(message.content);
  }

  function saveEditedMessage() {
    const updatedText = editingText.trim();
    if (!updatedText || !activeChat || !editingMessageId) return;

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== activeChat.id) return chat;

        const updatedMessages = chat.messages.map((message) =>
          message.id === editingMessageId && message.role === "user"
            ? { ...message, content: updatedText }
            : message
        );

        const firstUserMsg = updatedMessages.find((m) => m.role === "user");
        const wasFirstMsg = firstUserMsg?.id === editingMessageId;

        return {
          ...chat,
          title: wasFirstMsg ? getChatTitle(updatedText) : chat.title,
          messages: updatedMessages,
          updatedAt: Date.now(),
        };
      })
    );

    cancelEditingMessage();
  }

  function sendMessage() {
    const text = input.trim();
    if (!text || !activeChat || activeChat.archived) return;

    const userMessage: ChatMessage = {
      id: createId(),
      role: "user",
      content: text,
    };

    const assistantMessage: ChatMessage = {
      id: createId(),
      role: "assistant",
      content: generateAIResponse(text),
    };

    setChats((prev) =>
      prev.map((chat) => {
        if (chat.id !== activeChat.id) return chat;

        const hasPriorUserMsg = chat.messages.some((m) => m.role === "user");
        const title =
          !hasPriorUserMsg || chat.title === "New Chat"
            ? getChatTitle(text)
            : chat.title;

        return {
          ...chat,
          title,
          messages: [...chat.messages, userMessage, assistantMessage],
          updatedAt: Date.now(),
        };
      })
    );

    setInput("");
    cancelEditingMessage();
  }

  function archiveChat(chatId: string) {
    const target = chats.find((c) => c.id === chatId);
    if (!target || target.archived) return;

    const updatedChats = chats.map((c) =>
      c.id === chatId ? { ...c, archived: true, updatedAt: Date.now() } : c
    );

    if (activeChatId === chatId) {
      const nextActive = updatedChats.find((c) => !c.archived);
      if (nextActive) {
        setChats(updatedChats);
        setActiveChatId(nextActive.id);
      } else {
        const newChat = createChat();
        setChats([...updatedChats, newChat]);
        setActiveChatId(newChat.id);
      }
    } else {
      setChats(updatedChats);
    }

    setHeaderMenuOpen(false);
  }

  function deleteChat(chatId: string) {
    const target = chats.find((c) => c.id === chatId);
    if (!target) return;

    if (
      !window.confirm(
        `Delete "${target.title}" permanently? This cannot be undone.`
      )
    ) {
      return;
    }

    const remaining = chats.filter((c) => c.id !== chatId);
    if (activeChatId === chatId) {
      const nextActive = remaining.find((c) => !c.archived);
      if (nextActive) {
        setChats(remaining);
        setActiveChatId(nextActive.id);
      } else {
        const newChat = createChat();
        setChats([...remaining, newChat]);
        setActiveChatId(newChat.id);
      }
    } else {
      setChats(remaining);
    }

    setHeaderMenuOpen(false);
  }

  if (!loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-slate-500">
        Loading ModelNow...
      </div>
    );
  }

  return (
    <main className="flex h-screen overflow-hidden bg-white text-slate-900">
      {/* SIDEBAR */}
      <aside className="flex w-72 shrink-0 flex-col border-r border-slate-200 bg-slate-50">
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-base font-bold">ModelNow</h1>
            <p className="text-[10px] tracking-widest text-slate-400">
              AI PLATFORM
            </p>
          </div>
        </div>

        <div className="space-y-1 border-b border-slate-200 px-3 py-3">
          <button
            type="button"
            onClick={startNewChat}
            className="flex w-full items-center gap-3 rounded-xl bg-slate-900 px-3 py-2.5 text-left text-sm text-white shadow-sm transition hover:bg-slate-800"
          >
            <MessageSquare size={17} />
            <span className="font-medium">New Chat</span>
          </button>

          <button
            type="button"
            onClick={() => router.push("/plugins")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            <Layers size={18} /> Plugins
          </button>
          <button
            type="button"
            onClick={() => router.push("/schedule")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            <Clock3 size={18} /> Schedule
          </button>
          <button
            type="button"
            onClick={() => router.push("/projects")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            <BriefcaseBusiness size={18} /> Projects
          </button>
          <button
            type="button"
            onClick={() => router.push("/customize")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            <Settings size={18} /> Customize
          </button>
          <button
            type="button"
            onClick={() => router.push("/library")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            <Database size={18} /> Library
          </button>
          <button
            type="button"
            onClick={() => router.push("/plans")}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            <CreditCard size={18} /> Plans
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-2">
          {/* PINNED SECTION */}
          {pinnedChats.length > 0 && (
            <section className="mb-4">
              <h2 className="mb-2 flex items-center gap-1.5 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <Pin size={12} /> Pinned
              </h2>
              <div className="space-y-0.5">
                {pinnedChats.map((chat) => (
                  <div
                    key={`pinned-${chat.id}`}
                    className={`group flex items-center justify-between rounded-lg px-2 py-1.5 ${
                      activeChatId === chat.id
                        ? "bg-slate-200 text-slate-900"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => openChat(chat.id)}
                      className="flex min-w-0 flex-1 items-center gap-2.5 text-left text-sm"
                    >
                      <MessageSquare size={16} className="shrink-0 text-slate-400" />
                      <span className="truncate">{chat.title}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePinChat(chat.id)}
                      title="Unpin"
                      className="ml-1 rounded p-1 text-blue-600 opacity-90 hover:bg-blue-100"
                    >
                      <PinOff size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* RECENT SECTION */}
          <section>
            <h2 className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Recent
            </h2>
            {recentChats.length === 0 ? (
              <p className="px-2 py-2 text-xs text-slate-400">No recent chats</p>
            ) : (
              <div className="space-y-0.5">
                {recentChats.map((chat) => (
                  <div
                    key={`recent-${chat.id}`}
                    className={`group flex items-center justify-between rounded-lg px-2 py-1.5 ${
                      activeChatId === chat.id
                        ? "bg-slate-200 text-slate-900"
                        : "text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => openChat(chat.id)}
                      className="flex min-w-0 flex-1 items-center gap-2.5 text-left text-sm"
                    >
                      <MessageSquare size={16} className="shrink-0 text-slate-400" />
                      <span className="truncate">{chat.title}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => togglePinChat(chat.id)}
                      title={chat.pinned ? "Unpin chat" : "Pin chat"}
                      className={`ml-1 rounded p-1 ${
                        chat.pinned
                          ? "text-blue-600 hover:bg-blue-100"
                          : "text-slate-400 opacity-0 group-hover:opacity-100 hover:bg-slate-200 hover:text-slate-700"
                      }`}
                    >
                      {chat.pinned ? <PinOff size={14} /> : <Pin size={14} />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* WORKSPACE FOOTER */}
        <div className="flex items-center gap-3 border-t border-slate-200 p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-700">
            U
          </div>
          <div>
            <p className="text-sm font-medium">User</p>
            <p className="text-xs text-slate-400">Personal workspace</p>
          </div>
        </div>
      </aside>

      {/* MAIN CHAT AREA */}
      <section className="flex min-w-0 flex-1 flex-col">
        <header className="relative z-20 flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-6">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold">
              {activeChat?.title || "ModelNow"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="rounded-lg px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100"
            >
              Dashboard
            </button>
            <button
              type="button"
              aria-label="Chat options"
              onClick={() => setHeaderMenuOpen((open) => !open)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            >
              <MoreVertical size={18} />
            </button>
          </div>

          {headerMenuOpen && activeChat && (
            <>
              <button
                type="button"
                aria-label="Close menu"
                className="fixed inset-0 z-30 cursor-default"
                onClick={() => setHeaderMenuOpen(false)}
              />
              <div className="absolute right-6 top-14 z-40 w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                <button
                  type="button"
                  onClick={() => {
                    setHeaderMenuOpen(false);
                    const text = activeChat.messages
                      .map((m) => `${m.role === "user" ? "You" : "AI"}: ${m.content}`)
                      .join("\n\n");
                    void shareText(activeChat.title, text);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                >
                  <Share2 size={16} /> Share Chat
                </button>
                <button
                  type="button"
                  onClick={() => archiveChat(activeChat.id)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-slate-700 hover:bg-slate-100"
                >
                  <Archive size={16} /> Archive
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  type="button"
                  onClick={() => deleteChat(activeChat.id)}
                  className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </>
          )}
        </header>

        {/* MESSAGES LIST */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8">
          {!activeChat || activeChat.messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100">
                <Sparkles size={24} className="text-slate-700" />
              </div>
              <h2 className="text-xl font-semibold">ModelNow</h2>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Start a conversation to organize projects, code, and automate workflows.
              </p>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6">
              {activeChat.messages.map((message) => (
                <article
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {message.role === "assistant" && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                      <Sparkles size={16} />
                    </div>
                  )}

                  {/* MESSAGE CONTAINER */}
                  <div
                    className={`group relative max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                      message.role === "user"
                        ? "border border-blue-200/60 bg-blue-100 text-slate-900"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {editingMessageId === message.id ? (
                      <div className="space-y-2">
                        <textarea
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          className="w-full resize-none rounded-lg border border-slate-300 bg-white p-2 text-slate-900 outline-none"
                          rows={3}
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={cancelEditingMessage}
                            className="flex items-center gap-1 rounded px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900"
                          >
                            <X size={12} /> Cancel
                          </button>
                          <button
                            type="button"
                            onClick={saveEditedMessage}
                            className="flex items-center gap-1 rounded bg-blue-600 px-2.5 py-1 text-xs text-white hover:bg-blue-500"
                          >
                            <Check size={12} /> Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="whitespace-pre-wrap break-words leading-relaxed">
                          {message.content}
                        </p>

                        {/* ACTIONS: COPY, SHARE, EDIT */}
                        <div className="mt-2 flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100">
                          <button
                            type="button"
                            onClick={() => void copyText(message.content)}
                            title="Copy response"
                            className={`rounded p-1 ${
                              message.role === "user"
                                ? "text-slate-600 hover:bg-blue-200/60"
                                : "text-slate-500 hover:bg-slate-200"
                            }`}
                          >
                            <Copy size={14} />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void shareText(
                                message.role === "user"
                                  ? "My Message"
                                  : "ModelNow Response",
                                message.content
                              )
                            }
                            title="Share"
                            className={`rounded p-1 ${
                              message.role === "user"
                                ? "text-slate-600 hover:bg-blue-200/60"
                                : "text-slate-500 hover:bg-slate-200"
                            }`}
                          >
                            <Share2 size={14} />
                          </button>

                          {message.role === "user" && (
                            <button
                              type="button"
                              onClick={() => startEditingMessage(message)}
                              title="Edit"
                              className="rounded p-1 text-slate-600 hover:bg-blue-200/60"
                            >
                              <Pencil size={14} />
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </article>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* INPUT COMPOSER */}
        <div className="border-t border-slate-200 px-4 py-4 sm:px-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-2 shadow-sm focus-within:border-slate-400"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Ask ModelNow..."
              rows={2}
              className="w-full resize-none bg-transparent px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400"
            />
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => alert("File attachment coming soon.")}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <Paperclip size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => alert("Voice input coming soon.")}
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                >
                  <Mic size={18} />
                </button>
              </div>

              <button
                type="submit"
                disabled={!input.trim() || !activeChat || activeChat.archived}
                className="rounded-xl bg-slate-900 p-2 text-white hover:bg-slate-800 disabled:opacity-30"
              >
                <Send size={16} />
              </button>
            </div>
          </form>
          <p className="mt-2 text-center text-xs text-slate-400">
            ModelNow can make mistakes. Verify important information.
          </p>
        </div>
      </section>
    </main>
  );
}