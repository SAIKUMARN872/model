"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import ModeSelector from "./ModeSelector";
import PromptSuggestions from "./PromptSuggestions";

export default function AdvancedChatInput() {
  const [message, setMessage] = useState("");

  const handleSubmit = () => {
    if (!message.trim()) return;

    console.log("Message:", message);
    setMessage("");
  };

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">

      <ModeSelector />

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask anything..."
        rows={4}
        className="mt-4 w-full resize-none rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
      />

      <PromptSuggestions />

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
        >
          <Send size={18} />
          Send
        </button>
      </div>

    </div>
  );
}