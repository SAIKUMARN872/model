"use client";

import { Clock } from "lucide-react";

const chats = [
  {
    id: 1,
    title: "React Dashboard",
    time: "5 min ago",
  },
  {
    id: 2,
    title: "Next.js Authentication",
    time: "18 min ago",
  },
  {
    id: 3,
    title: "Machine Learning Notes",
    time: "1 hour ago",
  },
  {
    id: 4,
    title: "SQL Query Generator",
    time: "Yesterday",
  },
];

export default function RecentChats() {
  return (
    <div className="rounded-xl border bg-white p-5 shadow">

      <div className="mb-5 flex items-center gap-2">
        <Clock className="text-blue-600" />
        <h2 className="text-lg font-semibold">
          Recent Chats
        </h2>
      </div>

      <div className="space-y-3">

        {chats.map((chat) => (
          <div
            key={chat.id}
            className="rounded-lg border p-3 transition hover:bg-gray-50"
          >
            <h3 className="font-medium">
              {chat.title}
            </h3>

            <p className="text-sm text-gray-500">
              {chat.time}
            </p>
          </div>
        ))}

      </div>

    </div>
  );
}