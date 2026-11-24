
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Pin,
  PinOff,
  MessageSquare,
  Search,
  Check,
  X,
  MoreHorizontal,
  Sparkles,
} from "lucide-react";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  pinned: boolean;
};

type Chat = {
  id: string;
  title: string;
  messages: ChatMessage[];
  pinned: boolean;
  updatedAt: number;
};

const STORAGE_KEY = "modelnow-chat-pins-v1";

function isChatMessage(value: unknown): value is ChatMessage {
  if (typeof value !== "object" || value === null) return false;

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "string" &&
    (item.role === "user" || item.role === "assistant") &&
    typeof item.content === "string" &&
    typeof item.pinned === "boolean"
  );
}

function normalizeChats(value: unknown): Chat[] {
  if (!Array.isArray(value)) return [];

  const result: Chat[] = [];

  for (const entry of value) {
    if (typeof entry !== "object" || entry === null) continue;

    const item = entry as Record<string, unknown>;

    if (
      typeof item.id !== "string" ||
      typeof item.title !== "string" ||
      !Array.isArray(item.messages)
    ) {
      continue;
    }

    result.push({
      id: item.id,
      title: item.title,
      messages: item.messages.filter(isChatMessage),
      pinned: item.pinned === true,
      updatedAt:
        typeof item.updatedAt === "number"
          ? item.updatedAt
          : Date.now(),
    });
  }

  return result;
}

function getPreview(chat: Chat) {
  return (
    [...chat.messages]
      .reverse()
      .find((item) => item.content.trim())?.content ??
    "No messages yet"
  );
}

export default function PinPage() {
  const router = useRouter();

  const [chats, setChats] = useState<Chat[]>([]);
  const [search, setSearch] = useState("");
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [confirmAction, setConfirmAction] = useState<
    "pin" | "unpin" | null
  >(null);
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Load shared chat history.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        setChats(normalizeChats(JSON.parse(saved)));
      }
    } catch (error) {
      console.error("Unable to load ModelNow chats:", error);
    }

    setLoaded(true);
  }, []);

  // Persist changes to the same storage key used by Chat and Recents.
  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch (error) {
      console.error("Unable to save ModelNow chats:", error);
    }
  }, [chats, loaded]);

  const filteredChats = useMemo(() => {
    const query = search.trim().toLowerCase();

    return chats
      .filter(
        (chat) =>
          chat.title.toLowerCase().includes(query) ||
          chat.messages.some((item) =>
            item.content.toLowerCase().includes(query)
          )
      )
      .sort((a, b) => {
        if (a.pinned !== b.pinned) {
          return a.pinned ? -1 : 1;
        }

        return b.updatedAt - a.updatedAt;
      });
  }, [chats, search]);

  const pinnedCount = chats.filter((chat) => chat.pinned).length;

  function openChat(chat: Chat) {
    router.push(`/chat?chatId=${encodeURIComponent(chat.id)}`);
  }

  function persistChats(updatedChats: Chat[]) {
    setChats(updatedChats);

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(updatedChats)
      );
    } catch (error) {
      console.error("Unable to save ModelNow chats:", error);
      setMessage("Unable to save changes in this browser.");
    }
  }

  function openPinConfirmation(chat: Chat) {
    setSelectedChat(chat);
    setConfirmAction(chat.pinned ? "unpin" : "pin");
    setMessage("");
  }

  function closeConfirmation() {
    setSelectedChat(null);
    setConfirmAction(null);
  }

  function togglePin() {
    if (!selectedChat || !confirmAction) return;

    const shouldPin = confirmAction === "pin";
    const selectedId = selectedChat.id;

    const updatedChats = chats.map((chat) =>
      chat.id === selectedId
        ? {
            ...chat,
            pinned: shouldPin,
            updatedAt: Date.now(),
          }
        : chat
    );

    persistChats(updatedChats);

    setMessage(
      shouldPin
        ? `"${selectedChat.title}" pinned successfully.`
        : `"${selectedChat.title}" unpinned successfully.`
    );

    closeConfirmation();
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-[#202123]">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-[270px] border-r border-[#e5e5e5] bg-white md:block">
        <div className="flex h-full flex-col">
          <div className="flex h-[64px] items-center border-b border-[#eeeeee] px-5">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex items-center gap-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#202123] text-sm font-bold text-white">
                M
              </div>

              <div className="text-left">
                <p className="text-[15px] font-semibold">ModelNow</p>
                <p className="text-[11px] text-[#8e8ea0]">
                  AI Platform
                </p>
              </div>
            </button>
          </div>

          <div className="flex-1 px-3 py-4">
            <button
              type="button"
              onClick={() => router.push("/chat")}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#565869] transition hover:bg-[#f2f2f2]"
            >
              <MessageSquare size={18} />
              Chat
            </button>

            <div className="mt-6">
              <div className="mb-2 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-[#8e8ea0]">
                <Pin size={14} />
                Pin Chat
              </div>

              <button
                type="button"
                onClick={() => setSearch("")}
                className="flex w-full items-center gap-3 rounded-lg bg-[#ececf1] px-3 py-2.5 text-sm font-medium text-[#202123]"
              >
                <Pin size={17} />
                All Chats
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setMessage(
                    pinnedCount
                      ? `${pinnedCount} pinned chat${pinnedCount === 1 ? "" : "s"} found.`
                      : "No pinned chats yet."
                  );
                }}
                className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#565869] transition hover:bg-[#f2f2f2]"
              >
                <Pin size={17} />
                Pinned Chats
              </button>
            </div>
          </div>

          <div className="border-t border-[#eeeeee] p-4">
            <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4">
              <p className="text-xs font-semibold">Pin Chat flow</p>

              <div className="mt-3 space-y-3">
                {[
                  "Select an important chat",
                  "Confirm pin",
                  "Chat stays at the top",
                ].map((step, index) => (
                  <div key={step} className="flex gap-2">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#202123] text-[10px] text-white">
                      {index + 1}
                    </div>

                    <p className="text-xs leading-5 text-[#6b6b75]">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#e5e5e5] bg-white px-4 md:hidden">
        <button
          type="button"
          onClick={() => router.push("/chat")}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft size={18} />
          ModelNow
        </button>

        <div className="flex items-center gap-2 text-sm font-medium">
          <Pin size={17} />
          Pin Chat
        </div>
      </header>

      {/* Main content */}
      <section className="min-h-screen md:ml-[270px]">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
          <div className="border-b border-[#e5e5e5] pb-6">
            <h1 className="text-2xl font-semibold tracking-tight">
              Pin Chat
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b6b75]">
              Keep important conversations at the top of your chat list.
              Pin or unpin them whenever you need.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-[#e5e5e5] bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1f1f1]">
                <Pin size={20} />
              </div>

              <div>
                <h2 className="text-sm font-semibold">
                  Keep important chats accessible
                </h2>
                <p className="mt-1 text-xs text-[#8e8ea0]">
                  Pinned status is shared with the Chat page.
                </p>
              </div>
            </div>
          </div>

          {message && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#d9d9d9] bg-white px-4 py-3 text-sm text-[#565869]">
              <Check size={17} />
              <span>{message}</span>

              <button
                type="button"
                onClick={() => setMessage("")}
                className="ml-auto rounded-md p-1 hover:bg-[#f2f2f2]"
                aria-label="Dismiss notification"
              >
                <X size={15} />
              </button>
            </div>
          )}

          <div className="relative mt-8">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e8ea0]"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search chats..."
              className="w-full rounded-xl border border-[#e5e5e5] bg-white py-3 pl-10 pr-4 text-sm outline-none transition placeholder:text-[#a0a0aa] focus:border-[#b8b8bd]"
            />
          </div>

          <div className="mt-5 space-y-3">
            {!loaded ? (
              <div className="rounded-2xl border border-[#e5e5e5] bg-white px-6 py-12 text-center text-sm text-[#8e8ea0]">
                Loading chats...
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#d9d9d9] bg-white px-6 py-12 text-center">
                <Pin size={28} className="mx-auto text-[#a0a0aa]" />

                <h3 className="mt-4 text-sm font-medium">
                  No chats found
                </h3>

                <p className="mt-1 text-xs text-[#8e8ea0]">
                  Send a message in Chat or try another search.
                </p>

                <button
                  type="button"
                  onClick={() => router.push("/chat")}
                  className="mt-5 rounded-xl bg-[#202123] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#343541]"
                >
                  Go to Chat
                </button>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`rounded-2xl border bg-white p-4 transition ${
                    chat.pinned
                      ? "border-[#d4d4d4]"
                      : "border-[#e5e5e5]"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                        chat.pinned
                          ? "bg-[#202123] text-white"
                          : "bg-[#f1f1f1] text-[#565869]"
                      }`}
                    >
                      <MessageSquare size={18} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-semibold">
                          {chat.title}
                        </h3>

                        {chat.pinned && (
                          <span className="flex shrink-0 items-center gap-1 rounded-md bg-[#f1f1f1] px-2 py-1 text-[10px] font-medium text-[#565869]">
                            <Pin size={11} />
                            Pinned
                          </span>
                        )}
                      </div>

                      <p className="mt-1 truncate text-xs text-[#8e8ea0]">
                        {getPreview(chat)}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openPinConfirmation(chat)}
                          className="flex items-center gap-2 rounded-lg border border-[#dedede] px-3 py-2 text-xs font-medium text-[#565869] transition hover:bg-[#f7f7f8]"
                        >
                          {chat.pinned ? (
                            <>
                              <PinOff size={14} />
                              Unpin
                            </>
                          ) : (
                            <>
                              <Pin size={14} />
                              Pin chat
                            </>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => openChat(chat)}
                          className="rounded-lg border border-[#eeeeee] px-3 py-2 text-xs text-[#565869] hover:bg-[#f7f7f8]"
                        >
                          Open chat
                        </button>

                        <MoreHorizontal
                          size={16}
                          className="ml-auto text-[#8e8ea0]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 rounded-2xl border border-[#e5e5e5] bg-white p-5">
            <div className="flex gap-3">
              <Sparkles
                size={19}
                className="mt-0.5 shrink-0 text-[#6b6b75]"
              />

              <div>
                <h3 className="text-sm font-semibold">
                  About pinned chats
                </h3>

                <p className="mt-1 text-xs leading-5 text-[#6b6b75]">
                  Pinning changes the position of a conversation in the
                  chat list. It does not change the messages themselves.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Confirmation modal */}
      {confirmAction && selectedChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#e5e5e5] bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-[#eeeeee] px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f1f1f1]">
                  {confirmAction === "pin" ? (
                    <Pin size={18} />
                  ) : (
                    <PinOff size={18} />
                  )}
                </div>

                <div>
                  <h2 className="text-sm font-semibold">
                    {confirmAction === "pin"
                      ? "Pin this chat?"
                      : "Unpin this chat?"}
                  </h2>

                  <p className="mt-1 text-xs text-[#8e8ea0]">
                    {selectedChat.title}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeConfirmation}
                className="rounded-lg p-1.5 text-[#8e8ea0] hover:bg-[#f2f2f2]"
                aria-label="Close confirmation"
              >
                <X size={17} />
              </button>
            </div>

            <div className="px-5 py-5">
              <p className="text-sm leading-6 text-[#565869]">
                {confirmAction === "pin"
                  ? "This chat will be marked as pinned."
                  : "This chat will be removed from the pinned list."}
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#eeeeee] px-5 py-4">
              <button
                type="button"
                onClick={closeConfirmation}
                className="rounded-lg border border-[#dedede] px-4 py-2 text-sm font-medium text-[#565869] hover:bg-[#f7f7f8]"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={togglePin}
                className="rounded-lg bg-[#202123] px-4 py-2 text-sm font-medium text-white hover:bg-[#343541]"
              >
                {confirmAction === "pin" ? "Pin chat" : "Unpin chat"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
