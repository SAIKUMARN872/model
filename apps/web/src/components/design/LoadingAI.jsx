"use client";

import { Bot } from "lucide-react";

export default function LoadingAI({
  text = "AI is thinking...",
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border bg-white p-8 shadow">

      <div className="animate-spin rounded-full bg-gradient-to-r from-blue-600 to-purple-600 p-5 text-white">
        <Bot size={32} />
      </div>

      <h3 className="text-lg font-semibold">
        {text}
      </h3>

      <div className="flex gap-2">

        <span className="h-3 w-3 animate-bounce rounded-full bg-blue-600"></span>

        <span
          className="h-3 w-3 animate-bounce rounded-full bg-purple-600"
          style={{ animationDelay: "0.2s" }}
        ></span>

        <span
          className="h-3 w-3 animate-bounce rounded-full bg-pink-600"
          style={{ animationDelay: "0.4s" }}
        ></span>

      </div>

    </div>
  );
}