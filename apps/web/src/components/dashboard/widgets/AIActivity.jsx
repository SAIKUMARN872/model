"use client";

import { Brain } from "lucide-react";

const activities = [
  {
    id: 1,
    title: "Generated AI Response",
    time: "2 mins ago",
  },
  {
    id: 2,
    title: "Uploaded Document",
    time: "10 mins ago",
  },
  {
    id: 3,
    title: "Created New Chat",
    time: "25 mins ago",
  },
];

export default function AIActivity() {
  return (
    <div className="rounded-xl border bg-white p-5 shadow">

      <div className="mb-5 flex items-center gap-2">
        <Brain className="text-blue-600" />
        <h2 className="text-lg font-semibold">
          AI Activity
        </h2>
      </div>

      <div className="space-y-4">
        {activities.map((item) => (
          <div
            key={item.id}
            className="rounded-lg border p-3 hover:bg-gray-50"
          >
            <h3 className="font-medium">
              {item.title}
            </h3>

            <p className="text-sm text-gray-500">
              {item.time}
            </p>
          </div>
        ))}
      </div>

    </div>
  );
}