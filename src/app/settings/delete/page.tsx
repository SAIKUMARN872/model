
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Trash2,
  MessageSquare,
  RotateCcw,
  Search,
  X,
  AlertTriangle,
  Check,
  Trash,
} from "lucide-react";

import type { Chat } from "../../home/chat-types";
import { loadChats, saveChats } from "../../home/chat-storage";

export default function DeletePage() {
  const router = useRouter();

  const [chats, setChats] = useState<Chat[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"active" | "trash">("trash");
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [confirmAction, setConfirmAction] = useState<
    "delete" | "permanent" | "restore" | null
  >(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setChats(loadChats());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) {
      saveChats(chats);
    }
  }, [chats, loaded]);

  const filteredChats = useMemo(() => {
    return chats.filter((chat) => {
      const matchesStatus =
        activeTab === "trash"
          ? chat.trashed === true
          : !chat.trashed && !chat.archived;

      const preview =
        chat.messages.length > 0
          ? chat.messages[chat.messages.length - 1].content
          : "No messages yet.";

      const matchesSearch =
        chat.title.toLowerCase().includes(search.toLowerCase()) ||
        preview.toLowerCase().includes(search.toLowerCase());

      return matchesStatus && matchesSearch;
    }).sort((a, b) => b.updatedAt - a.updatedAt);
  }, [chats, search, activeTab]);

  const getPreview = (chat: Chat) => {
    if (chat.messages.length === 0) return "No messages yet.";

    return chat.messages[chat.messages.length - 1].content;
  };

  const getDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const openConfirmation = (
    chat: Chat,
    action: "delete" | "permanent" | "restore",
  ) => {
    setSelectedChat(chat);
    setConfirmAction(action);
  };

  const closeConfirmation = () => {
    setSelectedChat(null);
    setConfirmAction(null);
  };

  const deleteToTrash = () => {
    if (!selectedChat) return;

    setChats((current) =>
      current.map((chat) =>
        chat.id === selectedChat.id
          ? {
              ...chat,
              trashed: true,
              pinned: false,
              updatedAt: Date.now(),
            }
          : chat,
      ),
    );

    setMessage(`"${selectedChat.title}" moved to Trash.`);
    closeConfirmation();
  };

  const restoreChat = () => {
    if (!selectedChat) return;

    setChats((current) =>
      current.map((chat) =>
        chat.id === selectedChat.id
          ? {
              ...chat,
              trashed: false,
              archived: false,
              updatedAt: Date.now(),
            }
          : chat,
      ),
    );

    setMessage(`"${selectedChat.title}" restored to your chat list.`);
    closeConfirmation();
  };

  const permanentlyDelete = () => {
    if (!selectedChat) return;

    setChats((current) =>
      current.filter((chat) => chat.id !== selectedChat.id),
    );

    setMessage(`"${selectedChat.title}" permanently deleted.`);
    closeConfirmation();
  };

  const handleConfirm = () => {
    if (confirmAction === "delete") deleteToTrash();
    if (confirmAction === "restore") restoreChat();
    if (confirmAction === "permanent") permanentlyDelete();
  };

  const confirmationTitle = () => {
    if (confirmAction === "delete") return "Move this chat to Trash?";
    if (confirmAction === "restore") return "Restore this chat?";
    return "Permanently delete this chat?";
  };

  const confirmationDescription = () => {
    if (confirmAction === "delete") {
      return "This chat will be moved to Trash. You can restore it later.";
    }

    if (confirmAction === "restore") {
      return "This chat will return to your active chat list.";
    }

    return "This action cannot be undone. The chat will be permanently removed.";
  };

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-[#202123]">
      <aside className="fixed left-0 top-0 hidden h-screen w-[270px] border-r border-[#e5e5e5] bg-white md:block">
        <div className="flex h-full flex-col">
          <div className="flex h-[64px] items-center border-b border-[#eeeeee] px-5">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#202123] text-sm font-bold text-white">
                M
              </div>
              <div className="text-left">
                <p className="text-[15px] font-semibold">ModelNow</p>
                <p className="text-[11px] text-[#8e8ea0]">AI Platform</p>
              </div>
            </button>
          </div>

          <div className="flex-1 px-3 py-4">
            <button
              onClick={() => router.push("/home")}
              className="mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#565869] transition hover:bg-[#f2f2f2]"
            >
              <MessageSquare size={18} />
              Chat
            </button>

            <div className="mt-5">
              <div className="mb-2 flex items-center gap-2 px-3 text-[11px] font-semibold uppercase tracking-wide text-[#8e8ea0]">
                <Trash2 size={14} />
                Delete
              </div>

              <button
                onClick={() => setActiveTab("active")}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  activeTab === "active"
                    ? "bg-[#ececf1] font-medium text-[#202123]"
                    : "text-[#565869] hover:bg-[#f2f2f2]"
                }`}
              >
                <MessageSquare size={17} />
                Active Chats
              </button>

              <button
                onClick={() => setActiveTab("trash")}
                className={`mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  activeTab === "trash"
                    ? "bg-[#ececf1] font-medium text-[#202123]"
                    : "text-[#565869] hover:bg-[#f2f2f2]"
                }`}
              >
                <Trash2 size={17} />
                Trash
              </button>
            </div>
          </div>

          <div className="border-t border-[#eeeeee] p-4">
            <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4">
              <p className="text-xs font-semibold">Delete flow</p>
              <div className="mt-3 space-y-3 text-xs leading-5 text-[#6b6b75]">
                <p>1. Confirm delete</p>
                <p>2. Move to Trash</p>
                <p>3. Restore or permanently delete</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#e5e5e5] bg-white px-4 md:hidden">
        <button
          onClick={() => router.push("/home")}
          className="flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft size={18} />
          ModelNow
        </button>
        <div className="flex items-center gap-2 text-sm font-medium">
          <Trash2 size={17} />
          Delete
        </div>
      </header>

   <section className="min-h-screen w-full">
<div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
          <div className="border-b border-[#e5e5e5] pb-6">
            <h1 className="text-2xl font-semibold tracking-tight">Delete</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b6b75]">
              Manage deleted chats. Restore chats or permanently remove them.
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-[#e5e5e5] bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f1f1f1]">
                <Trash2 size={20} />
              </div>
              <div>
                <h2 className="text-sm font-semibold">
                  Chat deletion workflow
                </h2>
                <p className="mt-1 text-xs text-[#8e8ea0]">
                  Deleted chats are kept in Trash until permanently removed.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {[
                ["1", "Confirm Delete", "Confirm before moving a chat."],
                ["2", "Move to Trash", "The chat is kept in Trash."],
                ["3", "Restore or Delete", "Restore it or permanently remove it."],
              ].map(([number, title, description]) => (
                <div key={number} className="rounded-xl border border-[#eeeeee] p-4">
                  <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#202123] text-xs font-semibold text-white">
                    {number}
                  </div>
                  <h3 className="text-sm font-medium">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-[#6b6b75]">
                    {description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {message && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#d9d9d9] bg-white px-4 py-3 text-sm text-[#565869]">
              <Check size={17} />
              {message}
              <button
                onClick={() => setMessage("")}
                className="ml-auto rounded-md p-1 hover:bg-[#f2f2f2]"
              >
                <X size={15} />
              </button>
            </div>
          )}

          <div className="mt-8 flex items-center gap-2 border-b border-[#e5e5e5]">
            <button
              onClick={() => setActiveTab("active")}
              className={`border-b-2 px-4 py-3 text-sm font-medium ${
                activeTab === "active"
                  ? "border-[#202123] text-[#202123]"
                  : "border-transparent text-[#8e8ea0]"
              }`}
            >
              Active Chats
            </button>
            <button
              onClick={() => setActiveTab("trash")}
              className={`border-b-2 px-4 py-3 text-sm font-medium ${
                activeTab === "trash"
                  ? "border-[#202123] text-[#202123]"
                  : "border-transparent text-[#8e8ea0]"
              }`}
            >
              Trash
            </button>
          </div>

          <div className="relative mt-5">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8e8ea0]"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search chats..."
              className="w-full rounded-xl border border-[#e5e5e5] bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-[#b8b8bd]"
            />
          </div>

          <div className="mt-5 space-y-3">
            {!loaded ? (
              <div className="rounded-2xl border border-[#e5e5e5] bg-white p-8 text-center text-sm text-[#8e8ea0]">
                Loading chats...
              </div>
            ) : filteredChats.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#d9d9d9] bg-white px-6 py-12 text-center">
                <Trash2 size={28} className="mx-auto text-[#a0a0aa]" />
                <h3 className="mt-4 text-sm font-medium">
                  {activeTab === "trash" ? "Trash is empty" : "No active chats"}
                </h3>
                <p className="mt-1 text-xs text-[#8e8ea0]">
                  {activeTab === "trash"
                    ? "Chats deleted from the three-dot menu will appear here."
                    : "Your active chats will appear here."}
                </p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div
                  key={chat.id}
                  className="group rounded-2xl border border-[#e5e5e5] bg-white p-4 transition hover:border-[#d4d4d4]"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f1f1f1]">
                      {activeTab === "trash" ? (
                        <Trash2 size={18} />
                      ) : (
                        <MessageSquare size={18} />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="truncate text-sm font-semibold">
                          {chat.title}
                        </h3>
                        <span className="text-xs text-[#8e8ea0]">
                          {getDate(chat.updatedAt)}
                        </span>
                      </div>

                      <p className="mt-1 truncate text-xs text-[#8e8ea0]">
                        {getPreview(chat)}
                      </p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        {activeTab === "active" ? (
                          <button
                            onClick={() => openConfirmation(chat, "delete")}
                            className="flex items-center gap-2 rounded-lg border border-[#dedede] px-3 py-2 text-xs font-medium text-[#565869] hover:bg-[#f7f7f8]"
                          >
                            <Trash2 size={14} />
                            Delete chat
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => openConfirmation(chat, "restore")}
                              className="flex items-center gap-2 rounded-lg border border-[#dedede] px-3 py-2 text-xs font-medium text-[#565869] hover:bg-[#f7f7f8]"
                            >
                              <RotateCcw size={14} />
                              Restore
                            </button>
                            <button
                              onClick={() => openConfirmation(chat, "permanent")}
                              className="flex items-center gap-2 rounded-lg border border-[#dedede] px-3 py-2 text-xs font-medium text-[#565869] hover:bg-[#f7f7f8]"
                            >
                              <Trash size={14} />
                              Permanently delete
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-8 rounded-2xl border border-[#e5e5e5] bg-white p-5">
            <div className="flex gap-3">
              <AlertTriangle size={19} className="mt-0.5 shrink-0 text-[#6b6b75]" />
              <div>
                <h3 className="text-sm font-semibold">About deleted chats</h3>
                <p className="mt-1 text-xs leading-5 text-[#6b6b75]">
                  Deleting a chat moves it to Trash. You can restore it or
                  permanently delete it from this page.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {confirmAction && selectedChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#e5e5e5] bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-[#eeeeee] px-5 py-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#f1f1f1]">
                  {confirmAction === "delete" && <Trash2 size={18} />}
                  {confirmAction === "restore" && <RotateCcw size={18} />}
                  {confirmAction === "permanent" && <Trash size={18} />}
                </div>
                <div>
                  <h2 className="text-sm font-semibold">
                    {confirmationTitle()}
                  </h2>
                  <p className="mt-1 text-xs text-[#8e8ea0]">
                    {selectedChat.title}
                  </p>
                </div>
              </div>
              <button
                onClick={closeConfirmation}
                className="rounded-lg p-1.5 text-[#8e8ea0] hover:bg-[#f2f2f2]"
              >
                <X size={17} />
              </button>
            </div>

            <div className="px-5 py-5">
              <p className="text-sm leading-6 text-[#565869]">
                {confirmationDescription()}
              </p>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#eeeeee] px-5 py-4">
              <button
                onClick={closeConfirmation}
                className="rounded-lg border border-[#dedede] px-4 py-2 text-sm font-medium text-[#565869] hover:bg-[#f7f7f8]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="rounded-lg bg-[#202123] px-4 py-2 text-sm font-medium text-white hover:bg-[#343541]"
              >
                {confirmAction === "delete" && "Move to Trash"}
                {confirmAction === "restore" && "Restore"}
                {confirmAction === "permanent" && "Delete permanently"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
