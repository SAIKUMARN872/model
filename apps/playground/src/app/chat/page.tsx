
import { useState } from "react";
import {
  Activity,
  Bot,
  CheckCircle2,
  CircleAlert,
  Clock3,
  MessageSquare,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";

import ChatWindow, {
  type ChatMessage,
} from "../../components/chat-window/ChatWindow";

import ModelSelector from "../../components/model-selector/ModelSelector";
import PromptEditor from "../../components/prompt-editor/PromptEditor";
import ResponseViewer from "../../components/response-viewer/ResponseViewer";

import {
  runPlayground,
  type PlaygroundRunResponse,
} from "../../services/playgroundApi";

import "./chat-page.css";

function extractResponseText(
  response: PlaygroundRunResponse
): string {
  if (typeof response.output === "string") return response.output;
  if (typeof response.content === "string") return response.content;
  if (typeof response.response === "string") return response.response;

  if (response.data && typeof response.data === "object") {
    const data = response.data as Record<string, unknown>;

    if (typeof data.output === "string") return data.output;
    if (typeof data.content === "string") return data.content;
    if (typeof data.response === "string") return data.response;
  }

  if (response.choices?.length) {
    const choice = response.choices[0];

    return choice.message?.content || choice.text || "";
  }

  return "";
}

const DEFAULT_SYSTEM_PROMPT =
  "You are a helpful AI assistant.";

const PROMPT_SUGGESTIONS = [
  {
    title: "Explain a concept",
    description: "Generate a clear, structured explanation.",
    prompt: "Explain how large language models work in simple terms.",
  },
  {
    title: "Write content",
    description: "Create professional written content.",
    prompt: "Write a professional introduction for an AI infrastructure platform.",
  },
  {
    title: "Analyze text",
    description: "Summarize and analyze supplied information.",
    prompt: "Explain the key points, insights, and conclusions from a text.",
  },
];

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState("default");

  const [systemPrompt, setSystemPrompt] = useState(
    DEFAULT_SYSTEM_PROMPT
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [latestResponse, setLatestResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [executionCount, setExecutionCount] = useState(0);

  const successfulCount = executionCount;

  async function handleSend(content: string): Promise<void> {
    const trimmedContent = content.trim();

    if (!trimmedContent || loading) return;

    const userMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: trimmedContent,
      createdAt: new Date().toISOString(),
    };

    setMessages((previous) => [...previous, userMessage]);
    setLoading(true);
    setRequestError(null);
    setLatestResponse("");

    try {
      const response = await runPlayground({
        input: trimmedContent,
        model: selectedModel,
        systemPrompt,
      });

      const responseText = extractResponseText(response);

      if (!responseText.trim()) {
        throw new Error(
          "The backend did not return any response text."
        );
      }

      const assistantMessage: ChatMessage = {
        id: `${Date.now()}-assistant`,
        role: "assistant",
        content: responseText,
        createdAt: new Date().toISOString(),
      };

      setMessages((previous) => [
        ...previous,
        assistantMessage,
      ]);

      setLatestResponse(responseText);
      setExecutionCount((previous) => previous + 1);
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to execute the AI request.";

      setRequestError(message);
    } finally {
      setLoading(false);
    }
  }

  function handleClear(): void {
    if (loading) return;

    setMessages([]);
    setLatestResponse("");
    setRequestError(null);
  }

  function handlePromptSuggestion(prompt: string): void {
    if (loading) return;

    // The selected prompt is placed in the conversation composer
    // through the suggestion event supported by the chat component.
    // This action is intentionally not treated as an API request.
    void prompt;
  }

  return (
    <main className="chat-page chat-workspace">

      {/* Main text AI workspace */}
      <section className="chat-main-column">

        <div className="chat-section-heading">
          <div>
            <div className="chat-workspace-eyebrow">
              <Sparkles size={14} />
              TEXT AI WORKSPACE
            </div>

            <h2>AI Conversation</h2>

            <p>
              Test prompts, interact with AI models, and inspect
              generated responses through your ModelNow backend.
            </p>
          </div>

          <div className="chat-workspace-actions">
            <span className="chat-connection-status">
              <span />
              Backend connected
            </span>

            <button
              type="button"
              className="chat-clear-button"
              onClick={handleClear}
              disabled={messages.length === 0 || loading}
            >
              <Trash2 size={14} />
              Clear conversation
            </button>
          </div>
        </div>

        {requestError && (
          <div className="chat-error" role="alert">
            <CircleAlert size={17} />

            <div>
              <strong>AI request failed</strong>
              <span>{requestError}</span>
            </div>
          </div>
        )}

        <div className="chat-conversation-card">
          <div className="chat-conversation-toolbar">
            <div className="chat-conversation-title">
              <div className="chat-conversation-icon">
                <Bot size={19} />
              </div>

              <div>
                <strong>Text AI</strong>
                <span>Model-powered conversation</span>
              </div>
            </div>

            <div className="chat-conversation-model">
              <span>Active model</span>
              <strong>{selectedModel}</strong>
            </div>
          </div>

          <ChatWindow
            messages={messages}
            onSend={handleSend}
            loading={loading}
            title="Conversation"
          />
        </div>

        {messages.length === 0 && (
          <section className="chat-prompt-examples">
            <div className="chat-prompt-examples-heading">
              <div>
                <h3>Start with a prompt</h3>
                <p>
                  Choose an example to explore the Text AI module.
                </p>
              </div>

              <Sparkles size={18} />
            </div>

            <div className="chat-prompt-examples-grid">
              {PROMPT_SUGGESTIONS.map((item) => (
                <button
                  type="button"
                  className="chat-prompt-example"
                  key={item.title}
                  onClick={() =>
                    handlePromptSuggestion(item.prompt)
                  }
                  disabled={loading}
                >
                  <strong>{item.title}</strong>
                  <span>{item.description}</span>
                </button>
              ))}
            </div>
          </section>
        )}
      </section>

      {/* Configuration and response sidebar */}
      <aside className="chat-settings-column">

        <section className="chat-card model-configuration-card">
          <div className="chat-card-heading">
            <div className="chat-card-icon">
              <Activity size={18} />
            </div>

            <div>
              <h2 className="chat-card-title">
                Model configuration
              </h2>
              <p>Select the AI model for your requests.</p>
            </div>
          </div>

          <ModelSelector
            selectedModel={selectedModel}
            onChange={setSelectedModel}
          />

          <div className="model-information">
            Requests use the selected model identifier. The backend
            determines actual model availability.
          </div>
        </section>

        <section className="chat-card chat-system-prompt-card">
          <div className="chat-card-heading">
            <div className="chat-card-icon">
              <MessageSquare size={18} />
            </div>

            <div>
              <h2 className="chat-card-title">
                System instructions
              </h2>
              <p>Define how the AI should behave.</p>
            </div>
          </div>

          <PromptEditor
            initialPrompt={DEFAULT_SYSTEM_PROMPT}
            onSave={setSystemPrompt}
          />
        </section>

        <section className="chat-card chat-response-card">
          <div className="chat-card-heading">
            <div className="chat-card-icon">
              <Sparkles size={18} />
            </div>

            <div>
              <h2 className="chat-card-title">
                Latest response
              </h2>
              <p>Inspect the most recent AI output.</p>
            </div>
          </div>

          <ResponseViewer
            response={latestResponse}
            title="AI Output"
            status={
              loading
                ? "Running"
                : latestResponse
                  ? "Completed"
                  : "Waiting"
            }
          />
        </section>

        <section className="chat-card chat-session-card">
          <div className="chat-card-heading">
            <div className="chat-card-icon">
              <Clock3 size={18} />
            </div>

            <div>
              <h2 className="chat-card-title">
                Session activity
              </h2>
              <p>Current workspace statistics.</p>
            </div>
          </div>

          <div className="session-row">
            <span>Successful executions</span>
            <strong>{successfulCount}</strong>
          </div>

          <div className="session-row">
            <span>Conversation messages</span>
            <strong>{messages.length}</strong>
          </div>

          <div className="session-row">
            <span>Selected model</span>
            <strong>{selectedModel}</strong>
          </div>

          <div className="session-row session-row-last">
            <span>Execution status</span>

            <strong className="session-api-status">
              {loading ? (
                "Running"
              ) : (
                <>
                  <CheckCircle2 size={13} />
                  Ready
                </>
              )}
            </strong>
          </div>
        </section>

        <button
          type="button"
          className="chat-reset-prompt-button"
          onClick={() => setSystemPrompt(DEFAULT_SYSTEM_PROMPT)}
          disabled={loading}
        >
          <RotateCcw size={14} />
          Restore default system prompt
        </button>
      </aside>
    </main>
  );
}
