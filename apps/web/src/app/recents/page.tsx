
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  MessageSquare,
  Pin,
  PinOff,
  Trash2,
  Share2,
  MoreHorizontal,
  Clock3,
  Archive,
  ArrowLeft,
  X,
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
      .find((message) => message.content.trim())?.content ??
    "No messages yet"
  );
}

function getGroup(timestamp: number) {
  const date = new Date(timestamp);
  const now = new Date();

  const sameDay =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  if (sameDay) return "Today";

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);

  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();

  if (isYesterday) return "Yesterday";

  const sevenDaysAgo = new Date(now);
  sevenDaysAgo.setDate(now.getDate() - 7);

  if (date >= sevenDaysAgo) return "Previous 7 days";

  return "Older";
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function RecentsPage() {
  const router = useRouter();

  const [chats, setChats] = useState<Chat[]>([]);
  const [search, setSearch] = useState("");
  const [menuChatId, setMenuChatId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Chat | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (saved) {
        setChats(normalizeChats(JSON.parse(saved)));
      }
    } catch (error) {
      console.error("Unable to load recent chats:", error);
    }

    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(chats));
    } catch (error) {
      console.error("Unable to save recent chats:", error);
    }
  }, [chats, loaded]);

  const recentChats = useMemo(() => {
    const query = search.trim().toLowerCase();

    return chats
      .filter((chat) => !chat.pinned)
      .filter(
        (chat) =>
          chat.title.toLowerCase().includes(query) ||
          chat.messages.some((message) =>
            message.content.toLowerCase().includes(query)
          )
      )
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [chats, search]);

  const groups = [
    "Today",
    "Yesterday",
    "Previous 7 days",
    "Older",
  ] as const;

  function openChat(chat: Chat) {
    setMenuChatId(null);
    router.push(`/chat?chatId=${encodeURIComponent(chat.id)}`);
  }

  function persistChats(updated: Chat[]) {
    setChats(updated);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error("Unable to save chats:", error);
      setNotice("Unable to save changes in this browser.");
    }
  }

  function updatePin(chat: Chat) {
    const shouldPin = !chat.pinned;

    const updated = chats.map((item) =>
      item.id === chat.id
        ? {
            ...item,
            pinned: shouldPin,
            updatedAt: Date.now(),
          }
        : item
    );

    persistChats(updated);

    setNotice(
      shouldPin
        ? `"${chat.title}" moved to Pinned.`
        : `"${chat.title}" moved back to Recents.`
    );

    setMenuChatId(null);
  }

  function deleteChat() {
    if (!confirmDelete) return;

    const updated = chats.filter(
      (chat) => chat.id !== confirmDelete.id
    );

    persistChats(updated);
    setNotice(`"${confirmDelete.title}" deleted.`);
    setConfirmDelete(null);
    setMenuChatId(null);
  }

  async function shareChat(chat: Chat) {
    const text = `${chat.title}\n\n${getPreview(chat)}`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: chat.title,
          text,
        });
      } else {
        await navigator.clipboard.writeText(text);
        setNotice("Chat details copied.");
      }
    } catch {
      // Sharing may be cancelled by the user.
    }

    setMenuChatId(null);
  }

  function archiveChat(chat: Chat) {
    // This removes the chat from storage.
    // A separate archive feature would need its own archived state.
    const updated = chats.filter((item) => item.id !== chat.id);

    persistChats(updated);
    setNotice(`"${chat.title}" archived.`);
    setMenuChatId(null);
  }

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-[#202123]">
      <aside className="fixed left-0 top-0 hidden h-screen w-[260px] border-r border-[#e5e5e5] bg-white md:flex md:flex-col">
        <div className="flex h-16 items-center gap-3 border-b border-[#eeeeee] px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#202123] font-bold text-white">
            M
          </div>

          <div>
            <p className="text-sm font-semibold">ModelNow</p>
            <p className="text-[11px] text-[#8e8ea0]">AI Platform</p>
          </div>
        </div>

        <div className="flex-1 px-3 py-4">
          <button
            onClick={() => router.push("/chat")}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#565869] hover:bg-[#f2f2f2]"
          >
            <MessageSquare size={18} />
            Chat
          </button>

          <button
            onClick={() => router.push("/pinned")}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#565869] hover:bg-[#f2f2f2]"
          >
            <Pin size={18} />
            Pinned Chats
          </button>

          <button className="mt-1 flex w-full items-center gap-3 rounded-lg bg-[#ececf1] px-3 py-2.5 text-sm font-medium">
            <Clock3 size={18} />
            Recents
          </button>
        </div>
      </aside>

      <section className="min-h-screen md:ml-[260px]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-[#e5e5e5] bg-white px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/chat")}
              className="rounded-lg p-2 hover:bg-[#f2f2f2]"
              aria-label="Back to chat"
            >
              <ArrowLeft size={18} />
            </button>

            <div>
              <h1 className="text-lg font-semibold">Recents</h1>
              <p className="text-xs text-[#8e8ea0]">
                Your recent conversations
              </p>
            </div>
          </div>

          <span className="rounded-lg bg-[#f1f1f1] px-3 py-2 text-xs text-[#565869]">
            {recentChats.length} chats
          </span>
        </header>

        <div className="mx-auto max-w-5xl px-4 py-7 sm:px-8">
          <div className="relative">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e8ea0]"
            />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search recent chats..."
              className="w-full rounded-xl border border-[#e5e5e5] bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#b8b8bd]"
            />
          </div>

          {notice && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#e5e5e5] bg-white px-4 py-3 text-sm text-[#565869]">
              <span>{notice}</span>
              <button
                onClick={() => setNotice("")}
                className="ml-auto rounded p-1 hover:bg-[#f2f2f2]"
                aria-label="Dismiss notification"
              >
                <X size={15} />
              </button>
            </div>
          )}

          {!loaded ? (
            <div className="mt-8 rounded-2xl border border-[#e5e5e5] bg-white p-10 text-center text-sm text-[#8e8ea0]">
              Loading conversations...
            </div>
          ) : recentChats.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-dashed border-[#d9d9d9] bg-white px-6 py-14 text-center">
              <MessageSquare
                size={30}
                className="mx-auto text-[#a0a0aa]"
              />

              <h2 className="mt-4 text-sm font-semibold">
                {search ? "No matching chats" : "No recent chats yet"}
              </h2>

              <p className="mt-2 text-sm text-[#8e8ea0]">
                {search
                  ? "Try another search term."
                  : "Start a conversation in Chat. It will appear here automatically."}
              </p>

              <button
                onClick={() => router.push("/chat")}
                className="mt-5 rounded-xl bg-[#202123] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#343541]"
              >
                Start a chat
              </button>
            </div>
          ) : (
            <div className="mt-8 space-y-8">
              {groups.map((group) => {
                const groupChats = recentChats.filter(
                  (chat) => getGroup(chat.updatedAt) === group
                );

                if (groupChats.length === 0) return null;

                return (
                  <section key={group}>
                    <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-[#8e8ea0]">
                      {group}
                    </h2>

                    <div className="space-y-2">
                      {groupChats.map((chat) => (
                        <article
                          key={chat.id}
                          className="relative flex items-start gap-3 rounded-xl border border-[#e5e5e5] bg-white p-4 transition hover:border-[#cfcfd4]"
                        >
                          <button
                            onClick={() => openChat(chat)}
                            className="flex min-w-0 flex-1 items-start gap-3 text-left"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#f1f1f1]">
                              <MessageSquare
                                size={18}
                                className="text-[#565869]"
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="truncate text-sm font-semibold">
                                {chat.title}
                              </h3>

                              <p className="mt-1 line-clamp-2 text-sm leading-5 text-[#6b6b75]">
                                {getPreview(chat)}
                              </p>

                              <p className="mt-2 text-[11px] text-[#8e8ea0]">
                                Updated {formatTime(chat.updatedAt)}
                              </p>
                            </div>
                          </button>

                          <div className="relative shrink-0">
                            <button
                              onClick={() =>
                                setMenuChatId(
                                  menuChatId === chat.id ? null : chat.id
                                )
                              }
                              className="rounded-lg p-2 text-[#8e8ea0] hover:bg-[#f2f2f2]"
                              aria-label={`Actions for ${chat.title}`}
                            >
                              <MoreHorizontal size={18} />
                            </button>

                            {menuChatId === chat.id && (
                              <div className="absolute right-0 top-10 z-30 w-44 rounded-xl border border-[#e5e5e5] bg-white p-1 shadow-lg">
                                <button
                                  onClick={() => updatePin(chat)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs hover:bg-[#f5f5f5]"
                                >
                                  {chat.pinned ? (
                                    <PinOff size={15} />
                                  ) : (
                                    <Pin size={15} />
                                  )}
                                  {chat.pinned ? "Unpin chat" : "Pin chat"}
                                </button>

                                <button
                                  onClick={() => shareChat(chat)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs hover:bg-[#f5f5f5]"
                                >
                                  <Share2 size={15} />
                                  Share
                                </button>

                                <button
                                  onClick={() => archiveChat(chat)}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs hover:bg-[#f5f5f5]"
                                >
                                  <Archive size={15} />
                                  Archive
                                </button>

                                <button
                                  onClick={() => {
                                    setConfirmDelete(chat);
                                    setMenuChatId(null);
                                  }}
                                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-xs text-red-600 hover:bg-red-50"
                                >
                                  <Trash2 size={15} />
                                  Delete chat
                                </button>
                              </div>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}

          <div className="mt-8 rounded-xl border border-[#e5e5e5] bg-white p-4">
            <div className="flex items-start gap-3">
              <Sparkles size={18} className="mt-0.5 text-[#6b6b75]" />

              <div>
                <p className="text-sm font-medium">Your chat history</p>
                <p className="mt-1 text-xs leading-5 text-[#8e8ea0]">
                  Recent conversations come from the shared Chat history.
                  Pinning a chat moves it to Pinned Chats.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl border border-[#e5e5e5] bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between">
              <h2 className="text-base font-semibold">Delete chat?</h2>

              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg p-1 text-[#8e8ea0] hover:bg-[#f2f2f2]"
                aria-label="Close delete dialog"
              >
                <X size={17} />
              </button>
            </div>

            <p className="mt-3 text-sm leading-6 text-[#6b6b75]">
              Delete &quot;{confirmDelete.title}&quot;? This removes the
              conversation from Chat, Recents, and Pinned Chats.
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="rounded-lg border border-[#dedede] px-4 py-2 text-sm hover:bg-[#f7f7f8]"
              >
                Cancel
              </button>

              <button
                onClick={deleteChat}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
