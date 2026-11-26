
import {
  useState,
  useRef,
  useEffect,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import {
  Send,
  Bot,
  User,
  Copy,
  Check,
  Sparkles,
  LoaderCircle,
} from "lucide-react";

export interface ChatMessage {
  id: string | number;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
}

interface ChatWindowProps {
  messages?: ChatMessage[];
  onSend?: (message: string) => void | Promise<void>;
  loading?: boolean;
  title?: string;
}

export default function ChatWindow({
  messages = [],
  onSend,
  loading = false,
  title = "ModelNow Playground",
}: ChatWindowProps) {
  const [input, setInput] = useState("");
  const [copiedId, setCopiedId] = useState<string | number | null>(null);

  const messageAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messageAreaRef.current?.scrollTo({
      top: messageAreaRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const handleSend = async (): Promise<void> => {
    const message = input.trim();

    if (!message || loading || !onSend) return;

    setInput("");

    try {
      await onSend(message);
    } catch (error) {
      setInput(message);
      console.error("Chat request failed:", error);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    void handleSend();
  };

  const handleKeyDown = (
    event: KeyboardEvent<HTMLInputElement>
  ): void => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSend();
    }
  };

  const handleCopy = async (
    id: string | number,
    content: string
  ): Promise<void> => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId(null), 1800);
    } catch (error) {
      console.error("Unable to copy message:", error);
    }
  };

  return (
    <section className="chat-window">
      <header className="chat-window-header">
        <div className="chat-window-title">
          <div className="chat-window-brand-icon">
            <Sparkles size={18} />
          </div>

          <div>
            <h2>{title}</h2>
            <span>AI MODEL PLAYGROUND</span>
          </div>
        </div>

        <div className="chat-window-status">
          <span className="chat-status-dot" />
          Ready
        </div>
      </header>

      <div
        className="chat-message-area"
        ref={messageAreaRef}
        aria-live="polite"
      >
        {messages.length === 0 ? (
          <div className="chat-empty-state">
            <div className="chat-empty-icon">
              <Sparkles size={30} />
            </div>

            <h3>How can I help you today?</h3>

            <p>
              Start a conversation to test models through
              your ModelNow Playground.
            </p>

            <div className="chat-suggestion-list">
              <button
                type="button"
                onClick={() =>
                  setInput("Explain how AI model routing works.")
                }
              >
                Explain AI model routing
              </button>

              <button
                type="button"
                onClick={() =>
                  setInput("Compare GPT and Claude models.")
                }
              >
                Compare AI models
              </button>

              <button
                type="button"
                onClick={() =>
                  setInput("Write a Python function to sort a list.")
                }
              >
                Generate code
              </button>
            </div>
          </div>
        ) : (
          <div className="chat-message-list">
            {messages.map((message) => {
              const isUser = message.role === "user";
              const isSystem = message.role === "system";

              return (
                <div
                  key={message.id}
                  className={`chat-message-row ${
                    isUser
                      ? "chat-message-user"
                      : "chat-message-assistant"
                  } ${isSystem ? "chat-message-system" : ""}`}
                >
                  <div className="chat-message-avatar">
                    {isUser ? (
                      <User size={17} />
                    ) : (
                      <Bot size={18} />
                    )}
                  </div>

                  <div className="chat-message-content">
                    <div className="chat-message-meta">
                      <strong>
                        {isUser
                          ? "You"
                          : isSystem
                            ? "System"
                            : "ModelNow"}
                      </strong>

                      {message.createdAt && (
                        <span>{message.createdAt}</span>
                      )}
                    </div>

                    <div className="chat-message-bubble">
                      {message.content}
                    </div>

                    {!isSystem && (
                      <div className="chat-message-actions">
                        <button
                          type="button"
                          title="Copy message"
                          onClick={() =>
                            void handleCopy(message.id, message.content)
                          }
                        >
                          {copiedId === message.id ? (
                            <Check size={14} />
                          ) : (
                            <Copy size={14} />
                          )}
                          {copiedId === message.id ? "Copied" : "Copy"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="chat-message-row chat-message-assistant">
                <div className="chat-message-avatar">
                  <Bot size={18} />
                </div>

                <div className="chat-message-content">
                  <div className="chat-message-meta">
                    <strong>ModelNow</strong>
                  </div>

                  <div className="chat-loading-bubble">
                    <LoaderCircle size={16} className="chat-spinner" />
                    Generating response...
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <form className="chat-composer" onSubmit={handleSubmit}>
        <div className="chat-composer-row">
          <input
            ref={inputRef}
            type="text"
            value={input}
            disabled={loading}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message ModelNow..."
            aria-label="Chat message"
          />

          <button
            type="submit"
            disabled={!input.trim() || loading || !onSend}
            aria-label="Send message"
          >
            {loading ? (
              <LoaderCircle size={18} className="chat-spinner" />
            ) : (
              <Send size={17} />
            )}
            <span>{loading ? "Sending" : "Send"}</span>
          </button>
        </div>

        <p className="chat-composer-caption">
          AI responses may contain errors. Verify important information.
        </p>
      </form>
    </section>
  );
}
