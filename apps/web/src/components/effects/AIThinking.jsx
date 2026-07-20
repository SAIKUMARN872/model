"use client";

import { Brain } from "lucide-react";

export default function AIThinking({
  text = "AI is thinking...",
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border bg-white p-8 shadow">

      <div className="mb-5 animate-pulse rounded-full bg-blue-100 p-5">
        <Brain size={40} className="text-blue-600" />
      </div>

      <h2 className="text-xl font-semibold">
        {text}
      </h2>

      <div className="mt-5 flex gap-2">
        <span className="h-3 w-3 animate-bounce rounded-full bg-blue-500"></span>

        <span
          className="h-3 w-3 animate-bounce rounded-full bg-blue-500"
          style={{ animationDelay: "0.2s" }}
        ></span>

        <span
          className="h-3 w-3 animate-bounce rounded-full bg-blue-500"
          style={{ animationDelay: "0.4s" }}
        ></span>
      </div>

    </div>
  );
}