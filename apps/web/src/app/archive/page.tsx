"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Archive,
  MessageSquare,
  RotateCcw,
  Trash2,
  Search,
  X,
  Check,
} from "lucide-react";

type Chat = {
  id: number;
  title: string;
  preview: string;
  date: string;
  archived: boolean;
};

const initialChats: Chat[] = [
  {
    id: 1,
    title: "AI Interview Platform",
    preview: "Let's continue working on the CareerIQ platform...",
    date: "Today",
    archived: false,
  },
  {
    id: 2,
    title: "ModelNow Project",
    preview: "Working on the ModelNow AI platform...",
    date: "Yesterday",
    archived: false,
  },
  {
    id: 3,
    title: "React Development",
    preview: "Explain the React component structure...",
    date: "Sep 15",
    archived: false,
  },
  {
    id: 4,
    title: "Career Planning",
    preview: "Help me create a career roadmap...",
    date: "Sep 14",
    archived: false,
  },
  {
    id: 5,
    title: "AI Agents Research",
    preview: "How do agent workflows work?",
    date: "Sep 12",
    archived: true,
  },
];

export default function ArchivePage() {
  const router = useRouter();

  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [search, setSearch] = useState("");
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "active" | "archived"
  >("archived");
  const [message, setMessage] = useState("");

  const archivedChats = chats.filter(
    (chat) => chat.archived
  );

  const activeChats = chats.filter(
    (chat) => !chat.archived
  );

  const displayedChats = (
    activeTab === "archived"
      ? archivedChats
      : activeChats
  ).filter((chat) =>
    chat.title
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const archiveChat = (id: number) => {
    setChats((previous) =>
      previous.map((chat) =>
        chat.id === id
          ? { ...chat, archived: true }
          : chat
      )
    );

    setMessage("Chat moved to Archived.");
  };

  const restoreChat = (id: number) => {
    setChats((previous) =>
      previous.map((chat) =>
        chat.id === id
          ? { ...chat, archived: false }
          : chat
      )
    );

    setMessage("Chat restored to the active Chat list.");
  };

  const deleteChat = (id: number) => {
    setChats((previous) =>
      previous.filter((chat) => chat.id !== id)
    );

    setSelectedChat(null);
    setShowConfirm(false);
    setMessage("Chat permanently deleted.");
  };

  const openDeleteConfirmation = (chat: Chat) => {
    setSelectedChat(chat);
    setShowConfirm(true);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f8] text-[#171717]">
      <div className="flex min-h-screen">
        {/* Sidebar */}
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
              Chat
            </div>

            <button
              onClick={() => setActiveTab("active")}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                activeTab === "active"
                  ? "bg-[#f3f3f3] font-medium"
                  : "text-[#555] hover:bg-[#f5f5f5]"
              }`}
            >
              <MessageSquare size={17} />
              Chat
              <span className="ml-auto text-xs text-[#999]">
                {activeChats.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("archived")}
              className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                activeTab === "archived"
                  ? "bg-[#f3f3f3] font-medium"
                  : "text-[#555] hover:bg-[#f5f5f5]"
              }`}
            >
              <Archive size={17} />
              Archived
              <span className="ml-auto text-xs text-[#999]">
                {archivedChats.length}
              </span>
            </button>
          </div>

          <div className="border-t border-[#e5e5e5] p-4">
            <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#444]">
                <Archive size={14} />
                Archive
              </div>

              <p className="mt-2 text-xs leading-5 text-[#737373]">
                Remove chats from your active Chat list and
                safely keep them here. You can restore them
                anytime.
              </p>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">
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
                  Archive
                </h1>
                <p className="hidden text-xs text-[#737373] sm:block">
                  Manage your archived conversations
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Archive size={18} className="text-[#666]" />

              <span className="hidden text-xs text-[#737373] sm:block">
                {archivedChats.length} archived
              </span>
            </div>
          </header>

          {/* Content */}
          <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Flow */}
            <div className="mb-8 rounded-2xl border border-[#e5e5e5] bg-white p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f3f3f3]">
                  <Archive size={22} />
                </div>

                <div>
                  <h2 className="text-lg font-semibold">
                    Archived Chats
                  </h2>

                  <p className="mt-1 text-sm leading-6 text-[#737373]">
                    Remove a chat from the active Chat list →
                    keep it safely in Archived → restore it
                    anytime.
                  </p>
                </div>
              </div>
            </div>

            {/* Mobile Tabs */}
            <div className="mb-5 flex rounded-xl border border-[#e5e5e5] bg-white p-1 lg:hidden">
              <button
                onClick={() => setActiveTab("active")}
                className={`flex-1 rounded-lg px-3 py-2 text-sm ${
                  activeTab === "active"
                    ? "bg-[#f3f3f3] font-medium"
                    : "text-[#666]"
                }`}
              >
                Chat ({activeChats.length})
              </button>

              <button
                onClick={() => setActiveTab("archived")}
                className={`flex-1 rounded-lg px-3 py-2 text-sm ${
                  activeTab === "archived"
                    ? "bg-[#f3f3f3] font-medium"
                    : "text-[#666]"
                }`}
              >
                Archived ({archivedChats.length})
              </button>
            </div>

            {/* Search */}
            <div className="mb-5">
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]"
                />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search chats..."
                  className="h-11 w-full rounded-xl border border-[#d9d9d9] bg-white pl-10 pr-4 text-sm outline-none focus:border-[#999]"
                />
              </div>
            </div>

            {/* Message */}
            {message && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-[#d9d9d9] bg-white px-4 py-3 text-sm text-[#444]">
                <Check size={16} />
                {message}

                <button
                  onClick={() => setMessage("")}
                  className="ml-auto rounded-md p-1 hover:bg-[#f3f3f3]"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {/* Section Title */}
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">
                  {activeTab === "archived"
                    ? "Archived"
                    : "Active Chats"}
                </h2>

                <p className="mt-1 text-xs text-[#888]">
                  {activeTab === "archived"
                    ? "These chats are removed from your active Chat list."
                    : "These chats are currently visible in your Chat list."}
                </p>
              </div>
            </div>

            {/* Chat List */}
            {displayedChats.length > 0 ? (
              <div className="overflow-hidden rounded-2xl border border-[#e5e5e5] bg-white">
                {displayedChats.map((chat, index) => (
                  <div
                    key={chat.id}
                    className={`group flex items-center gap-4 px-4 py-4 sm:px-5 ${
                      index !== displayedChats.length - 1
                        ? "border-b border-[#eeeeee]"
                        : ""
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f3f3f3]">
                      {chat.archived ? (
                        <Archive size={18} />
                      ) : (
                        <MessageSquare size={18} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-medium">
                          {chat.title}
                        </h3>

                        {chat.archived && (
                          <span className="rounded-full bg-[#f3f3f3] px-2 py-0.5 text-[10px] text-[#666]">
                            Archived
                          </span>
                        )}
                      </div>

                      <p className="mt-1 truncate text-xs text-[#888]">
                        {chat.preview}
                      </p>

                      <p className="mt-1 text-[11px] text-[#aaa]">
                        {chat.date}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-1">
                      {chat.archived ? (
                        <button
                          onClick={() =>
                            restoreChat(chat.id)
                          }
                          className="flex items-center gap-2 rounded-lg border border-[#d9d9d9] px-3 py-2 text-xs font-medium text-[#444] hover:bg-[#f5f5f5]"
                        >
                          <RotateCcw size={14} />
                          <span className="hidden sm:inline">
                            Restore
                          </span>
                        </button>
                      ) : (
                        <button
                          onClick={() =>
                            archiveChat(chat.id)
                          }
                          className="flex items-center gap-2 rounded-lg border border-[#d9d9d9] px-3 py-2 text-xs font-medium text-[#444] hover:bg-[#f5f5f5]"
                        >
                          <Archive size={14} />
                          <span className="hidden sm:inline">
                            Archive
                          </span>
                        </button>
                      )}

                      <button
                        onClick={() =>
                          openDeleteConfirmation(chat)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-[#999] hover:bg-red-50 hover:text-red-600"
                        aria-label="Delete chat"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#d9d9d9] bg-white px-6 py-14 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#f3f3f3]">
                  <Archive size={22} />
                </div>

                <h3 className="mt-4 text-sm font-semibold">
                  {activeTab === "archived"
                    ? "No archived chats"
                    : "No active chats"}
                </h3>

                <p className="mx-auto mt-2 max-w-md text-xs leading-5 text-[#888]">
                  {activeTab === "archived"
                    ? "Chats that you archive will appear here and can be restored anytime."
                    : "Archived chats are removed from this list but remain safely available in Archived."}
                </p>
              </div>
            )}

            {/* How it works */}
            <div className="mt-8">
              <h2 className="mb-3 text-sm font-semibold">
                How Archive works
              </h2>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[#e5e5e5] bg-white p-4">
                  <div className="text-xs font-semibold">
                    1. Archive
                  </div>

                  <p className="mt-1 text-xs leading-5 text-[#888]">
                    Remove a conversation from your active Chat
                    list.
                  </p>
                </div>

                <div className="rounded-xl border border-[#e5e5e5] bg-white p-4">
                  <div className="text-xs font-semibold">
                    2. Keep safely
                  </div>

                  <p className="mt-1 text-xs leading-5 text-[#888]">
                    The conversation remains available inside
                    Archived.
                  </p>
                </div>

                <div className="rounded-xl border border-[#e5e5e5] bg-white p-4">
                  <div className="text-xs font-semibold">
                    3. Restore anytime
                  </div>

                  <p className="mt-1 text-xs leading-5 text-[#888]">
                    Restore an archived conversation back to the
                    active Chat list.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Modal */}
      {showConfirm && selectedChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#e5e5e5] bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-semibold">
                  Delete chat?
                </h2>

                <p className="mt-2 text-sm leading-6 text-[#737373]">
                  This will permanently delete &quot;
                  {selectedChat.title}&quot;. This action cannot
                  be undone.
                </p>
              </div>

              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-lg p-2 hover:bg-[#f3f3f3]"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="rounded-lg border border-[#d9d9d9] px-4 py-2 text-sm hover:bg-[#f5f5f5]"
              >
                Cancel
              </button>

              <button
                onClick={() =>
                  deleteChat(selectedChat.id)
                }
                className="rounded-lg bg-[#171717] px-4 py-2 text-sm font-medium text-white hover:bg-[#333]"
              >
                Delete permanently
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}