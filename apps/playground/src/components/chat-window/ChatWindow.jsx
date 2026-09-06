import React, {
  useState,
} from "react";

export default function ChatWindow() {
  const [messages, setMessages] =
    useState([]);

  const [input, setInput] =
    useState("");

  const handleSend = () => {
    if (!input.trim()) {
      return;
    }

    const newMessage = {
      id: Date.now(),
      role: "user",
      content: input,
      createdAt:
        new Date().toISOString(),
    };

    setMessages((previous) => [
      ...previous,
      newMessage,
    ]);

    setInput("");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        minHeight: "500px",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border:
          "1px solid #e2e8f0",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          padding: "16px 20px",
          borderBottom:
            "1px solid #e2e8f0",
        }}
      >
        <h2
          style={{
            margin: 0,
          }}
        >
          AI Chat
        </h2>
      </header>

      <div
        style={{
          flex: 1,
          padding: "20px",
          overflowY: "auto",
        }}
      >
        {messages.length === 0 ? (
          <p
            style={{
              color: "#64748b",
              textAlign: "center",
            }}
          >
            Start a conversation
            with the AI assistant.
          </p>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              style={{
                marginBottom: "12px",
                padding: "12px 16px",
                borderRadius: "8px",
                backgroundColor:
                  "#f1f5f9",
              }}
            >
              {message.content}
            </div>
          ))
        )}
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          padding: "16px",
          borderTop:
            "1px solid #e2e8f0",
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(event) =>
            setInput(event.target.value)
          }
          onKeyDown={(event) => {
            if (
              event.key === "Enter"
            ) {
              handleSend();
            }
          }}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "8px",
            border:
              "1px solid #cbd5e1",
            outline: "none",
          }}
        />

        <button
          type="button"
          onClick={handleSend}
          style={{
            padding: "12px 20px",
            border: "none",
            borderRadius: "8px",
            backgroundColor:
              "#2563eb",
            color: "#ffffff",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}