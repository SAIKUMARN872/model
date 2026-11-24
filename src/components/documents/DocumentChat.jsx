"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function DocumentChat() {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;

    console.log("Document Chat:", message);
    setMessage("");
  };

  return (
    <div className="rounded-xl border bg-white p-5 shadow">

      <h2 className="mb-4 text-xl font-semibold">
        Document Chat
      </h2>

      <textarea
        rows={5}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Ask questions about your document..."
        className="w-full rounded-lg border p-3 outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={handleSend}
        className="mt-4 flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
      >
        <Send size={18} />
        Send
      </button>

    </div>
  );
}