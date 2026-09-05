"use client";

import { useState } from "react";

export default function Playground() {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="p-6">
      <h1 className="mb-6 text-3xl font-bold">
        AI Playground
      </h1>

      <textarea
        className="w-full rounded-lg border p-4"
        rows={8}
        placeholder="Type your prompt..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button className="mt-5 rounded bg-indigo-600 px-6 py-3 text-white">
        Run Prompt
      </button>
    </div>
  );
}