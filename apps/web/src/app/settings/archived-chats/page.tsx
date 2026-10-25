"use client";

import { useState } from "react";
import { Archive, Search } from "lucide-react";

export default function ArchivedChatsPage() {
  const [search, setSearch] = useState("");

  // Real archived conversations will come from the chat database.
  const archivedChats: { id: string; title: string }[] = [];

  const filteredChats = archivedChats.filter((chat) =>
    chat.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="mx-auto w-full max-w-5xl space-y-8 px-6 py-8 text-[#2d2d2d]">
      <header>
        <h1 className="text-3xl font-normal tracking-tight">
          Archived chats
        </h1>
        <p className="mt-2 text-sm text-gray-500">
          Manage conversations that you have archived.
        </p>
      </header>

      <div className="flex items-center gap-3 rounded-2xl border border-[#e5e5e5] px-4 py-3">
        <Search size={18} className="shrink-0 text-gray-400" />
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search archived chats"
          className="w-full bg-transparent text-sm outline-none placeholder:text-gray-400"
        />
      </div>

      {filteredChats.length === 0 ? (
        <div className="flex min-h-20 items-center justify-center rounded-2xl border border-[#e5e5e5] px-5 py-6 text-center">
          <p className="text-base text-[#676767]">No archived chats</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-[#e5e5e5]">
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center gap-3 border-b border-[#eeeeee] px-5 py-4 last:border-b-0 hover:bg-[#f7f7f7]"
            >
              <Archive size={18} className="text-gray-500" />
              <span className="text-sm">{chat.title}</span>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}