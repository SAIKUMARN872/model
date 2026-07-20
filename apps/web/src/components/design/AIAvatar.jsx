"use client";

import { Bot } from "lucide-react";

export default function AIAvatar({
  size = 60,
  label = "AI",
}) {
  return (
    <div className="flex flex-col items-center gap-2">

      <div
        style={{
          width: size,
          height: size,
        }}
        className="flex items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
      >
        <Bot size={size / 2} />
      </div>

      <span className="text-sm font-medium text-gray-700">
        {label}
      </span>

    </div>
  );
}