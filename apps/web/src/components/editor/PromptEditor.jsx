import { useState } from "react";

export default function PromptEditor() {
  const [prompt, setPrompt] = useState("");

  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold mb-3">Prompt Editor</h2>

      <textarea
        rows={8}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Write your prompt..."
        className="w-full rounded-md border p-3 outline-none"
      />

      <div className="mt-4 flex justify-end">
        <button className="rounded bg-black px-4 py-2 text-white">
          Save Prompt
        </button>
      </div>
    </div>
  );
}