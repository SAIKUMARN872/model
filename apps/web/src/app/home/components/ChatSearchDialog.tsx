
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Search, MessageSquare, X, Clock } from "lucide-react";
import type { Chat } from "../chat-types";

type ChatSearchDialogProps = {
  chats: Chat[];
  activeChatId: string;
  onSelectChat: (chatId: string) => void;
  onClose: () => void;
};

export default function ChatSearchDialog({
  chats,
  activeChatId,
  onSelectChat,
  onClose,
}: ChatSearchDialogProps) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const visibleChats = useMemo(
    () =>
      chats
        .filter((chat) => !chat.archived)
        .sort((a, b) => b.updatedAt - a.updatedAt),
    [chats],
  );

  const activeChat = visibleChats.find(
    (chat) => chat.id === activeChatId,
  );

  const filteredChats = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return visibleChats.slice(0, 12);
    }

    return visibleChats.filter((chat) =>
      chat.title.toLowerCase().includes(normalizedQuery),
    );
  }, [query, visibleChats]);

  useEffect(() => {
    inputRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  function selectChat(chatId: string) {
    onSelectChat(chatId);
    onClose();
  }

  function formatDate(timestamp: number) {
    const date = new Date(timestamp);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    }

    if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    return date.toLocaleDateString([], {
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center bg-black/40 px-4 pt-[12vh] backdrop-blur-[2px]"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="chat-search-title"
        className="w-full max-w-[600px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-slate-100 px-4">
          <Search className="h-5 w-5 shrink-0 text-slate-400" />

          <input
            ref={inputRef}
            id="chat-search-title"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search your conversations..."
            className="h-14 min-w-0 flex-1 bg-transparent text-[14px] text-slate-900 outline-none placeholder:text-slate-400"
          />

          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[min(65vh,520px)] overflow-y-auto p-3">
          {!query.trim() && activeChat && (
            <section className="mb-4">
              <div className="mb-2 flex items-center gap-2 px-2">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Last opened
                </h3>
              </div>

              <button
                type="button"
                onClick={() => selectChat(activeChat.id)}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <MessageSquare className="h-4 w-4" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-slate-900">
                    {activeChat.title}
                  </span>
                  <span className="mt-0.5 block text-[11px] text-slate-400">
                    Currently open
                  </span>
                </span>
              </button>
            </section>
          )}

          <section>
            <div className="mb-2 flex items-center justify-between px-2">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                {query.trim() ? "Search results" : "Recent conversations"}
              </h3>

              <span className="text-[11px] text-slate-400">
                {filteredChats.length} {filteredChats.length === 1 ? "chat" : "chats"}
              </span>
            </div>

            {filteredChats.length > 0 ? (
              <div className="space-y-0.5">
                {filteredChats.map((chat) => (
                  <button
                    key={chat.id}
                    type="button"
                    onClick={() => selectChat(chat.id)}
                    className="group flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition hover:bg-slate-50"
                  >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-500 transition group-hover:bg-white">
                      <MessageSquare className="h-4 w-4" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-slate-800">
                        {chat.title}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-slate-400">
                        Conversation
                      </span>
                    </span>

                    <span className="shrink-0 text-[11px] text-slate-400">
                      {formatDate(chat.updatedAt)}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-slate-100">
                  <Search className="h-5 w-5 text-slate-400" />
                </span>

                <p className="text-[13px] font-medium text-slate-700">
                  No conversations found
                </p>
                <p className="mt-1 text-[12px] text-slate-400">
                  Try searching with a different title.
                </p>
              </div>
            )}
          </section>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
          <p className="text-[11px] text-slate-400">
            Search your saved conversations
          </p>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-2.5 py-1 text-[11px] font-medium text-slate-500 hover:bg-slate-50"
          >
            Esc to close
          </button>
        </div>
      </div>
    </div>
  );
}
