"use client";

import ChatInput from "./input/ChatInput";
import Message from "./messages/Message";

export default function ChatWindow() {
  return (
    <div className="flex h-full flex-col rounded-xl bg-white shadow">

      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        <Message
          sender="AI"
          text="Hello! How can I help you today?"
        />

        <Message
          sender="You"
          text="Show me today's analytics."
        />

      </div>

      <div className="border-t p-4">
        <ChatInput />
      </div>

    </div>
  );
}