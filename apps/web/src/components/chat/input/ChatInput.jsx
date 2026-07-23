"use client";

import { useState } from "react";
import { Send } from "lucide-react";

export default function ChatInput() {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;

    console.log(message);
    setMessage("");
  };

  return (
    <div className="flex gap-3">

      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 rounded-lg border px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
      />

      <button
        onClick={handleSend}
        className="rounded-lg bg-blue-600 px-5 text-white hover:bg-blue-700"
      >
        <Send size={18} />
      </button>

    </div>
  );
}