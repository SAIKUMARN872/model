"use client";

import { useMemo, useState } from "react";
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
} from "lucide-react";

type Chat = {
  id: number;
  title: string;
  preview: string;
  date: string;
  pinned: boolean;
};

const initialChats: Chat[] = [
  {
    id: 1,
    title: "ModelNow Architecture",
    preview: "Discussed the AI platform architecture...",
    date: "Today",
    pinned: true,
  },
  {
    id: 2,
    title: "AI Career Planning",
    preview: "Discussed career roadmap and AI skills...",
    date: "Today",
    pinned: false,
  },
  {
    id: 3,
    title: "React Project Help",
    preview: "Working on a Next.js application...",
    date: "Yesterday",
    pinned: false,
  },
  {
    id: 4,
    title: "Interview Preparation",
    preview: "Frontend developer interview questions...",
    date: "Sep 14",
    pinned: false,
  },
];

export default function PinPage() {
  const router = useRouter();

  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [search, setSearch] = useState("");
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [confirmAction, setConfirmAction] = useState<
    "pin" | "unpin" | null
  >(null);
  const [message, setMessage] = useState("");

  const sortedChats = useMemo(() => {
    return [...chats]
      .filter((chat) => {
        const searchText = search.toLowerCase();

        return (
          chat.title.toLowerCase().includes(searchText) ||
          chat.preview.toLowerCase().includes(searchText)
        );
      })
      .sort((a, b) => {
        if (a.pinned === b.pinned) {
          return a.id - b.id;
        }

        return a.pinned ? -1 : 1;
      });
  }, [chats, search]);

  const openPinConfirmation = (chat: Chat) => {
    setSelectedChat(chat);
    setConfirmAction(chat.pinned ? "unpin" : "pin");
  };

  const closeConfirmation = () => {
    setSelectedChat(null);
    setConfirmAction(null);
  };

  const togglePin = () => {
    if (!selectedChat) return;

    const newPinnedState = !selectedChat.pinned;

    setChats((currentChats) =>
      currentChats.map((chat) =>
        chat.id === selectedChat.id
          ? {
              ...chat,
              pinned: newPinnedState,
            }
          : chat
      )
    );

    setMessage(
      newPinnedState
        ? `"${selectedChat.title}" pinned to the top.`
        : `"${selectedChat.title}" unpinned.`
    );

    closeConfirmation();
  };

  return (
    <main className="min-h-screen bg-[#f7f7f8] text-[#202123]">
      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 hidden h-screen w-[270px] border-r border-[#e5e5e5] bg-white md:block">
        <div className="flex h-full flex-col">
          {/* Logo */}
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
                <p className="text-[11px] text-[#8e8ea0]">
                  AI Platform
                </p>
              </div>
            </button>
          </div>

          {/* Sidebar */}
          <div className="flex-1 px-3 py-4">
            <button
              onClick={() => router.push("/")}
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
                onClick={() => {
                  setSearch("");
                  setMessage("");
                }}
                className="flex w-full items-center gap-3 rounded-lg bg-[#ececf1] px-3 py-2.5 text-sm font-medium text-[#202123]"
              >
                <Pin size={17} />
                All Chats
              </button>

              <button
                onClick={() => {
                  setSearch("");
                  const pinned = chats.filter((chat) => chat.pinned);

                  setMessage(
                    pinned.length > 0
                      ? `${pinned.length} pinned chat${
                          pinned.length === 1 ? "" : "s"
                        } found.`
                      : "No pinned chats."
                  );
                }}
                className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[#565869] transition hover:bg-[#f2f2f2]"
              >
                <Pin size={17} />
                Pinned Chats
              </button>
            </div>
          </div>

          {/* Flow */}
          <div className="border-t border-[#eeeeee] p-4">
            <div className="rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-4">
              <p className="text-xs font-semibold">
                Pin Chat flow
              </p>

              <div className="mt-3 space-y-3">
                <div className="flex gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#202123] text-[10px] text-white">
                    1
                  </div>

                  <p className="text-xs leading-5 text-[#6b6b75]">
                    Select an important chat
                  </p>
                </div>

                <div className="flex gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#202123] text-[10px] text-white">
                    2
                  </div>

                  <p className="text-xs leading-5 text-[#6b6b75]">
                    Confirm pin
                  </p>
                </div>

                <div className="flex gap-2">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#202123] text-[10px] text-white">
                    3
                  </div>

                  <p className="text-xs leading-5 text-[#6b6b75]">
                    Chat stays at the top
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-[#e5e5e5] bg-white px-4 md:hidden">
        <button
          onClick={() => router.push("/")}
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

      {/* Main */}
      <section className="min-h-screen md:ml-[270px]">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-10">
          {/* Header */}
          <div className="border-b border-[#e5e5e5] pb-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Pin Chat
                </h1>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b6b75]">
                  Keep important chats at the top of your chat list
                  and unpin them whenever you no longer need them
                  there.
                </p>
              </div>

              <div className="hidden items-center gap-2 rounded-lg border border-[#e5e5e5] bg-white px-3 py-2 text-xs text-[#6b6b75] sm:flex">
                <Pin size={14} />
                Pinned chats stay on top
              </div>
            </div>
          </div>

          {/* Flow */}
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
                  Pin important conversations so they remain above
                  regular chats.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-[#eeeeee] p-4">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#202123] text-xs font-semibold text-white">
                  1
                </div>

                <h3 className="text-sm font-medium">
                  Select Chat
                </h3>

                <p className="mt-1 text-xs leading-5 text-[#6b6b75]">
                  Choose the conversation you want to keep easily
                  accessible.
                </p>
              </div>

              <div className="rounded-xl border border-[#eeeeee] p-4">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#202123] text-xs font-semibold text-white">
                  2
                </div>

                <h3 className="text-sm font-medium">
                  Pin Chat
                </h3>

                <p className="mt-1 text-xs leading-5 text-[#6b6b75]">
                  Confirm the action and the chat moves to the top.
                </p>
              </div>

              <div className="rounded-xl border border-[#eeeeee] p-4">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-[#202123] text-xs font-semibold text-white">
                  3
                </div>

                <h3 className="text-sm font-medium">
                  Unpin Anytime
                </h3>

                <p className="mt-1 text-xs leading-5 text-[#6b6b75]">
                  Unpin the conversation whenever you no longer
                  need it at the top.
                </p>
              </div>
            </div>
          </div>

          {/* Message */}
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

          {/* Search */}
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

          {/* Chats */}
          <div className="mt-5 space-y-3">
            {sortedChats.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#d9d9d9] bg-white px-6 py-12 text-center">
                <Pin
                  size={28}
                  className="mx-auto text-[#a0a0aa]"
                />

                <h3 className="mt-4 text-sm font-medium">
                  No chats found
                </h3>

                <p className="mt-1 text-xs text-[#8e8ea0]">
                  Try a different search term.
                </p>
              </div>
            ) : (
              sortedChats.map((chat) => (
                <div
                  key={chat.id}
                  className={`group rounded-2xl border bg-white p-4 transition ${
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
                        {chat.preview}
                      </p>

                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <button
                          onClick={() =>
                            openPinConfirmation(chat)
                          }
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
                          className="rounded-lg border border-[#eeeeee] p-2 text-[#8e8ea0] transition hover:bg-[#f7f7f8]"
                          title="More options"
                        >
                          <MoreHorizontal size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Information */}
          <div className="mt-8 rounded-2xl border border-[#e5e5e5] bg-white p-5">
            <div className="flex gap-3">
              <Pin
                size={19}
                className="mt-0.5 shrink-0 text-[#6b6b75]"
              />

              <div>
                <h3 className="text-sm font-semibold">
                  About pinned chats
                </h3>

                <p className="mt-1 text-xs leading-5 text-[#6b6b75]">
                  Pinning only changes the position of a chat in
                  your chat list. The conversation itself remains
                  unchanged. You can unpin it at any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Confirmation Modal */}
      {confirmAction && selectedChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#e5e5e5] bg-white shadow-xl">
            {/* Modal Header */}
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
                onClick={closeConfirmation}
                className="rounded-lg p-1.5 text-[#8e8ea0] hover:bg-[#f2f2f2]"
              >
                <X size={17} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-5 py-5">
              <p className="text-sm leading-6 text-[#565869]">
                {confirmAction === "pin"
                  ? "This chat will be moved to the top of your chat list."
                  : "This chat will return to its normal position in the chat list."}
              </p>

              <div className="mt-4 rounded-xl border border-[#e5e5e5] bg-[#fafafa] p-3">
                <div className="flex items-center gap-2">
                  {confirmAction === "pin" ? (
                    <Pin size={15} />
                  ) : (
                    <PinOff size={15} />
                  )}

                  <span className="text-xs text-[#6b6b75]">
                    {confirmAction === "pin"
                      ? "Important chats stay visible at the top."
                      : "You can pin this chat again anytime."}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 border-t border-[#eeeeee] px-5 py-4">
              <button
                onClick={closeConfirmation}
                className="rounded-lg border border-[#dedede] px-4 py-2 text-sm font-medium text-[#565869] hover:bg-[#f7f7f8]"
              >
                Cancel
              </button>

              <button
                onClick={togglePin}
                className="rounded-lg bg-[#202123] px-4 py-2 text-sm font-medium text-white hover:bg-[#343541]"
              >
                {confirmAction === "pin"
                  ? "Pin chat"
                  : "Unpin chat"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}