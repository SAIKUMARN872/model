import { useState } from "react";

export default function MainComposer() {
  const [message, setMessage] = useState("");

  return (
    <div className="space-y-3">
      <textarea
        rows={5}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="w-full border rounded-lg p-3"
      />

      <button className="bg-black text-white px-5 py-2 rounded">
        Send
      </button>
    </div>
  );
}