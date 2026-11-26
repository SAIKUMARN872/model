
"use client";

import { useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  FileText,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  Send,
  Settings2,
  Sparkles,
  Trash2,
  X,
  Zap,
} from "lucide-react";

type Prompt = {
  id: string;
  name: string;
  model: string;
  systemPrompt: string;
  userPrompt: string;
  status: "Draft" | "Sent";
  createdAt: string;
  response?: string;
};

const MODELS = [
  "GPT-4o",
  "GPT-4o-mini",
  "Claude 3.5 Sonnet",
  "Gemini 2.0 Flash",
  "Llama 3.3 70B",
];

const INITIAL_PROMPTS: Prompt[] = [];

export default function PromptsPage() {
  const [prompts, setPrompts] = useState<Prompt[]>(INITIAL_PROMPTS);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const [editorOpen, setEditorOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [name, setName] = useState("");
  const [model, setModel] = useState("GPT-4o");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(2048);

  const [response, setResponse] = useState("");
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"editor" | "response">(
    "editor"
  );

  const filteredPrompts = useMemo(() => {
    return prompts.filter((prompt) => {
      const matchesSearch =
        prompt.name.toLowerCase().includes(search.toLowerCase()) ||
        prompt.userPrompt.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "All" || prompt.status === filter;

      return matchesSearch && matchesFilter;
    });
  }, [prompts, search, filter]);

  const resetEditor = () => {
    setName("");
    setModel("GPT-4o");
    setSystemPrompt("");
    setUserPrompt("");
    setTemperature(0.7);
    setMaxTokens(2048);
    setResponse("");
    setError("");
    setActiveTab("editor");
    setSelectedId(null);
  };

  const openCreate = () => {
    resetEditor();
    setEditorOpen(true);
  };

  const openPrompt = (prompt: Prompt) => {
    setSelectedId(prompt.id);
    setName(prompt.name);
    setModel(prompt.model);
    setSystemPrompt(prompt.systemPrompt);
    setUserPrompt(prompt.userPrompt);
    setResponse(prompt.response || "");
    setError("");
    setActiveTab(prompt.response ? "response" : "editor");
    setEditorOpen(true);
  };

  const savePrompt = (): string | null => {
    if (!name.trim()) {
      setError("Please enter a prompt name.");
      return null;
    }

    if (!userPrompt.trim()) {
      setError("Please enter a user prompt.");
      return null;
    }

    const id = selectedId || crypto.randomUUID();
    const existing = prompts.find((item) => item.id === id);

    const prompt: Prompt = {
      id,
      name: name.trim(),
      model,
      systemPrompt,
      userPrompt,
      status: existing?.status || "Draft",
      createdAt: existing?.createdAt || new Date().toISOString(),
      response: existing?.response,
    };

    setPrompts((previous) => {
      const exists = previous.some((item) => item.id === id);

      return exists
        ? previous.map((item) => (item.id === id ? prompt : item))
        : [prompt, ...previous];
    });

    setSelectedId(id);
    setError("");

    return id;
  };

  const sendPrompt = async () => {
    const id = savePrompt();
    if (!id) return;

    setLoading(true);
    setError("");
    setResponse("");
    setActiveTab("response");

    // Frontend demonstration only.
    // Replace this simulated response with the real API later.
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const demoResponse =
      `This is a frontend demonstration response.\n\n` +
      `Selected model: ${model}\n\n` +
      `Your message:\n${userPrompt}\n\n` +
      `The prompt editor and response interface are working in demo mode. ` +
      `Connect a model execution API when backend integration is ready.`;

    setResponse(demoResponse);

    setPrompts((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Sent",
              response: demoResponse,
            }
          : item
      )
    );

    setLoading(false);
  };

  const deletePrompt = (id: string) => {
    setPrompts((previous) =>
      previous.filter((item) => item.id !== id)
    );

    if (selectedId === id) {
      setEditorOpen(false);
      resetEditor();
    }
  };

  const copyResponse = async () => {
    if (!response) return;

    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setError("Unable to copy response.");
    }
  };

  const closeEditor = () => {
    if (loading) return;
    setEditorOpen(false);
    resetEditor();
  };

  return (
    <div className="page-stack prompts-page">
      {/* HEADER */}
      <header className="page-heading prompts-header">
        <div>
          <div className="page-eyebrow">PROMPT STUDIO</div>
          <h1>Prompts</h1>
          <p>
            Create, manage and test AI prompts in your ModelNow workspace.
          </p>
        </div>

        <button
          type="button"
          className="button button--primary"
          onClick={openCreate}
        >
          <Plus size={16} />
          Create Prompt
        </button>
      </header>

      {/* DEMO MODE NOTICE */}
      <div className="prompts-demo-notice">
        <Sparkles size={17} />
        <div>
          <strong>Frontend preview mode</strong>
          <span>
            Prompt execution currently displays a simulated response.
            No backend requests are made.
          </span>
        </div>
        <span className="prompts-demo-badge">DEMO</span>
      </div>

      {/* STATISTICS */}
      <section className="prompts-stat-grid">
        <div className="prompts-stat">
          <div className="prompts-stat-icon blue">
            <FileText size={20} />
          </div>
          <div>
            <span>Total prompts</span>
            <strong>{prompts.length}</strong>
          </div>
        </div>

        <div className="prompts-stat">
          <div className="prompts-stat-icon green">
            <Check size={20} />
          </div>
          <div>
            <span>Sent prompts</span>
            <strong>
              {prompts.filter((item) => item.status === "Sent").length}
            </strong>
          </div>
        </div>

        <div className="prompts-stat">
          <div className="prompts-stat-icon orange">
            <FileText size={20} />
          </div>
          <div>
            <span>Draft prompts</span>
            <strong>
              {prompts.filter((item) => item.status === "Draft").length}
            </strong>
          </div>
        </div>

        <div className="prompts-stat">
          <div className="prompts-stat-icon purple">
            <Zap size={20} />
          </div>
          <div>
            <span>Available models</span>
            <strong>{MODELS.length}</strong>
          </div>
        </div>
      </section>

      {/* PROMPT INVENTORY */}
      <section className="data-card prompts-inventory">
        <div className="prompts-inventory-top">
          <div>
            <h2>Prompt inventory</h2>
            <p>Manage and organize your prompt collection.</p>
          </div>

          <button
            type="button"
            className="button button--secondary"
            onClick={() => {
              setSearch("");
              setFilter("All");
            }}
          >
            <RefreshCw size={15} />
            Reset filters
          </button>
        </div>

        <div className="prompts-toolbar">
          <label className="table-search prompts-search">
            <Search size={16} />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search prompts..."
              aria-label="Search prompts"
            />
          </label>

          <select
            className="prompts-select"
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter prompts"
          >
            <option value="All">All prompts</option>
            <option value="Draft">Draft</option>
            <option value="Sent">Sent</option>
          </select>
        </div>

        {filteredPrompts.length > 0 ? (
          <div className="table-scroll">
            <table className="prompts-table">
              <thead>
                <tr>
                  <th>Prompt name</th>
                  <th>Model</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredPrompts.map((prompt) => (
                  <tr key={prompt.id}>
                    <td>
                      <div className="prompts-name">
                        <div className="prompts-row-icon">
                          <MessageSquare size={17} />
                        </div>
                        <div>
                          <strong>{prompt.name}</strong>
                          <span>
                            {prompt.userPrompt.slice(0, 55)}
                            {prompt.userPrompt.length > 55 ? "..." : ""}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td>{prompt.model}</td>

                    <td>
                      <span
                        className={`prompts-status ${
                          prompt.status === "Sent" ? "sent" : "draft"
                        }`}
                      >
                        <span />
                        {prompt.status}
                      </span>
                    </td>

                    <td>
                      {new Date(prompt.createdAt).toLocaleDateString()}
                    </td>

                    <td>
                      <div className="prompts-actions">
                        <button
                          type="button"
                          onClick={() => openPrompt(prompt)}
                        >
                          View
                        </button>

                        <button
                          type="button"
                          className="prompts-delete"
                          onClick={() => deletePrompt(prompt.id)}
                          aria-label={`Delete ${prompt.name}`}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="prompts-empty">
            <div className="prompts-empty-icon">
              <MessageSquare size={27} />
            </div>

            <h3>
              {prompts.length === 0
                ? "No prompts created yet"
                : "No matching prompts"}
            </h3>

            <p>
              {prompts.length === 0
                ? "Your saved prompts will appear here. Use the Create Prompt button above to get started."
                : "Try changing your search or status filter."}
            </p>

            {/* Duplicate Create button removed. */}
          </div>
        )}
      </section>

      <p className="page-footnote">
        Changes are stored in frontend memory only and will reset when
        this page is reloaded. Model execution is simulated in this preview.
      </p>

      {/* PROMPT EDITOR */}
      {editorOpen && (
        <div className="prompts-modal-overlay">
          <section
            className="prompts-editor"
            role="dialog"
            aria-modal="true"
            aria-labelledby="prompts-editor-title"
          >
            {/* EDITOR HEADER */}
            <div className="prompts-editor-header">
              <div className="prompts-editor-title">
                <button
                  type="button"
                  className="prompts-back-button"
                  onClick={closeEditor}
                  disabled={loading}
                  aria-label="Back to prompt inventory"
                >
                  <ArrowLeft size={18} />
                </button>

                <div>
                  <span className="page-eyebrow">PROMPT STUDIO</span>
                  <h2 id="prompts-editor-title">
                    {selectedId ? "Edit Prompt" : "Create Prompt"}
                  </h2>
                </div>
              </div>

              <button
                type="button"
                className="prompts-close-button"
                onClick={closeEditor}
                disabled={loading}
                aria-label="Close editor"
              >
                <X size={19} />
              </button>
            </div>

            {/* EDITOR TABS */}
            <div className="prompts-editor-tabs">
              <button
                type="button"
                className={activeTab === "editor" ? "active" : ""}
                onClick={() => setActiveTab("editor")}
              >
                <Settings2 size={15} />
                Prompt editor
              </button>

              <button
                type="button"
                className={activeTab === "response" ? "active" : ""}
                onClick={() => setActiveTab("response")}
              >
                <MessageSquare size={15} />
                Response
                {response && <span className="prompts-tab-dot" />}
              </button>
            </div>

            <div className="prompts-editor-body">
              {activeTab === "editor" ? (
                <div className="prompts-editor-layout">
                  {/* MAIN EDITOR */}
                  <div className="prompts-editor-main">
                    <div className="prompts-field">
                      <label htmlFor="prompt-name">
                        Prompt name <span>*</span>
                      </label>

                      <input
                        id="prompt-name"
                        value={name}
                        onChange={(event) => setName(event.target.value)}
                        placeholder="e.g. Customer support assistant"
                        maxLength={120}
                      />

                      <small>
                        Give your prompt a descriptive name.
                      </small>
                    </div>

                    <div className="prompts-field">
                      <label htmlFor="system-prompt">
                        System instructions
                      </label>

                      <textarea
                        id="system-prompt"
                        value={systemPrompt}
                        onChange={(event) =>
                          setSystemPrompt(event.target.value)
                        }
                        placeholder="Define the AI's role, behavior, rules and context..."
                        rows={7}
                      />

                      <small>
                        Instructions that define how the AI should behave.
                      </small>
                    </div>

                    <div className="prompts-field">
                      <label htmlFor="user-prompt">
                        User message <span>*</span>
                      </label>

                      <textarea
                        id="user-prompt"
                        value={userPrompt}
                        onChange={(event) =>
                          setUserPrompt(event.target.value)
                        }
                        placeholder="Enter the message you want to send to the model..."
                        rows={8}
                      />

                      <small>
                        The actual message sent to the selected model.
                      </small>
                    </div>
                  </div>

                  {/* SETTINGS PANEL */}
                  <aside className="prompts-settings">
                    <div className="prompts-settings-heading">
                      <Settings2 size={17} />
                      <strong>Model configuration</strong>
                    </div>

                    <div className="prompts-field">
                      <label htmlFor="prompt-model">AI model</label>

                      <div className="prompts-model-select">
                        <select
                          id="prompt-model"
                          value={model}
                          onChange={(event) => setModel(event.target.value)}
                        >
                          {MODELS.map((item) => (
                            <option key={item} value={item}>
                              {item}
                            </option>
                          ))}
                        </select>
                        <ChevronDown size={15} />
                      </div>
                    </div>

                    <div className="prompts-field">
                      <div className="prompts-label-row">
                        <label htmlFor="temperature">Temperature</label>
                        <strong>{temperature.toFixed(1)}</strong>
                      </div>

                      <input
                        id="temperature"
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={temperature}
                        onChange={(event) =>
                          setTemperature(Number(event.target.value))
                        }
                      />

                      <div className="prompts-range-labels">
                        <span>Precise</span>
                        <span>Creative</span>
                      </div>
                    </div>

                    <div className="prompts-field">
                      <label htmlFor="max-tokens">Max tokens</label>

                      <input
                        id="max-tokens"
                        type="number"
                        min="1"
                        max="128000"
                        value={maxTokens}
                        onChange={(event) =>
                          setMaxTokens(
                            Math.max(
                              1,
                              Math.min(128000, Number(event.target.value) || 1)
                            )
                          )
                        }
                      />
                    </div>

                    <div className="prompts-config-note">
                      <Sparkles size={16} />
                      <p>
                        These settings are part of the frontend preview.
                        They are not yet sent to an AI provider.
                      </p>
                    </div>
                  </aside>
                </div>
              ) : (
                <div className="prompts-response-section">
                  <div className="prompts-response-heading">
                    <div>
                      <div className="prompts-response-icon">
                        <Sparkles size={20} />
                      </div>
                      <div>
                        <h3>Model response</h3>
                        <p>{model} · Frontend demo</p>
                      </div>
                    </div>

                    {response && (
                      <button
                        type="button"
                        className="button button--secondary"
                        onClick={() => void copyResponse()}
                      >
                        {copied ? (
                          <Check size={15} />
                        ) : (
                          <Copy size={15} />
                        )}
                        {copied ? "Copied" : "Copy"}
                      </button>
                    )}
                  </div>

                  {loading ? (
                    <div className="prompts-response-loading">
                      <RefreshCw size={22} className="prompts-spin" />
                      <strong>Generating response...</strong>
                      <span>
                        Simulating a model response for this frontend preview.
                      </span>
                    </div>
                  ) : response ? (
                    <pre className="prompts-response-output">
                      {response}
                    </pre>
                  ) : (
                    <div className="prompts-response-empty">
                      <MessageSquare size={30} />
                      <strong>No response yet</strong>
                      <span>
                        Open the Prompt Editor and send a message to see
                        the response here.
                      </span>
                      <button
                        type="button"
                        className="button button--secondary"
                        onClick={() => setActiveTab("editor")}
                      >
                        Back to editor
                      </button>
                    </div>
                  )}

                  <div className="prompts-response-disclaimer">
                    <AlertCircle size={15} />
                    This is a simulated frontend response, not an actual
                    AI-generated result.
                  </div>
                </div>
              )}
            </div>

            {/* ERROR */}
            {error && (
              <div className="prompts-editor-error" role="alert">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* FOOTER */}
            <div className="prompts-editor-footer">
              <div className="prompts-footer-left">
                <span className="prompts-demo-indicator" />
                Frontend preview
              </div>

              <div className="prompts-footer-actions">
                <button
                  type="button"
                  className="button button--secondary"
                  onClick={closeEditor}
                  disabled={loading}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  className="button button--secondary"
                  onClick={() => {
                    if (savePrompt()) {
                      setActiveTab("editor");
                    }
                  }}
                  disabled={loading}
                >
                  Save Prompt
                </button>

                <button
                  type="button"
                  className="button button--primary"
                  onClick={() => void sendPrompt()}
                  disabled={loading || !name.trim() || !userPrompt.trim()}
                >
                  {loading ? (
                    <RefreshCw size={15} className="prompts-spin" />
                  ) : (
                    <Send size={15} />
                  )}

                  {loading ? "Sending..." : "Send Prompt"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* PAGE STYLES */}
      <style jsx>{`
        .prompts-page {
          min-width: 0;
        }

        .prompts-header {
          align-items: center;
        }

        .prompts-demo-notice {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 17px;
          border: 1px solid #dbeafe;
          border-radius: 11px;
          background: #f8fbff;
          color: #2563eb;
        }

        .prompts-demo-notice div {
          display: flex;
          flex: 1;
          flex-direction: column;
          gap: 3px;
        }

        .prompts-demo-notice strong {
          font-size: 13px;
        }

        .prompts-demo-notice span {
          color: #64748b;
          font-size: 12px;
        }

        .prompts-demo-badge {
          padding: 5px 9px;
          border-radius: 6px;
          background: #dbeafe;
          color: #1d4ed8 !important;
          font-size: 10px !important;
          font-weight: 700;
        }

        .prompts-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .prompts-stat {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 20px;
          border: 1px solid var(--border, #e2e8f0);
          border-radius: 12px;
          background: var(--card, #fff);
        }

        .prompts-stat-icon {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 10px;
        }

        .prompts-stat-icon.blue {
          background: #eff6ff;
          color: #2563eb;
        }

        .prompts-stat-icon.green {
          background: #ecfdf5;
          color: #059669;
        }

        .prompts-stat-icon.orange {
          background: #fff7ed;
          color: #ea580c;
        }

        .prompts-stat-icon.purple {
          background: #f5f3ff;
          color: #7c3aed;
        }

        .prompts-stat > div:last-child {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .prompts-stat span {
          color: #64748b;
          font-size: 12px;
        }

        .prompts-stat strong {
          font-size: 23px;
          color: var(--foreground, #0f172a);
        }

        .prompts-inventory {
          overflow: hidden;
        }

        .prompts-inventory-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 14px;
          padding: 21px 22px;
          border-bottom: 1px solid var(--border, #e2e8f0);
        }

        .prompts-inventory-top h2 {
          margin: 0;
          font-size: 16px;
        }

        .prompts-inventory-top p {
          margin: 6px 0 0;
          color: #64748b;
          font-size: 12px;
        }

        .prompts-toolbar {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 15px 22px;
          border-bottom: 1px solid var(--border, #e2e8f0);
        }

        .prompts-search {
          max-width: 390px;
          flex: 1;
        }

        .prompts-select {
          min-width: 160px;
          padding: 9px 12px;
          border: 1px solid var(--border, #e2e8f0);
          border-radius: 8px;
          background: var(--card, #fff);
          color: var(--foreground, #0f172a);
          font-size: 13px;
        }

        .prompts-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .prompts-table th {
          padding: 14px 17px;
          background: var(--muted, #f8fafc);
          color: #64748b;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: .04em;
          white-space: nowrap;
        }

        .prompts-table td {
          padding: 15px 17px;
          border-top: 1px solid var(--border, #e2e8f0);
          font-size: 13px;
          white-space: nowrap;
        }

        .prompts-name {
          display: flex;
          align-items: center;
          gap: 11px;
          min-width: 230px;
        }

        .prompts-row-icon {
          display: grid;
          place-items: center;
          width: 36px;
          height: 36px;
          border-radius: 9px;
          background: #eff6ff;
          color: #2563eb;
        }

        .prompts-name > div:last-child {
          display: flex;
          flex-direction: column;
          gap: 4px;
          min-width: 0;
        }

        .prompts-name strong {
          font-weight: 600;
        }

        .prompts-name span {
          max-width: 230px;
          overflow: hidden;
          color: #94a3b8;
          font-size: 11px;
          text-overflow: ellipsis;
        }

        .prompts-status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 5px 9px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
        }

        .prompts-status > span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        .prompts-status.sent {
          background: #ecfdf5;
          color: #047857;
        }

        .prompts-status.sent > span {
          background: #10b981;
        }

        .prompts-status.draft {
          background: #fff7ed;
          color: #c2410c;
        }

        .prompts-status.draft > span {
          background: #f97316;
        }

        .prompts-actions {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .prompts-actions button {
          display: inline-flex;
          align-items: center;
          border: 0;
          background: transparent;
          color: #2563eb;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .prompts-actions .prompts-delete {
          color: #dc2626;
        }

        .prompts-empty {
          display: flex;
          align-items: center;
          flex-direction: column;
          padding: 55px 20px;
          text-align: center;
        }

        .prompts-empty-icon {
          display: grid;
          place-items: center;
          width: 58px;
          height: 58px;
          margin-bottom: 16px;
          border-radius: 15px;
          background: #eff6ff;
          color: #2563eb;
        }

        .prompts-empty h3 {
          margin: 0;
          font-size: 16px;
        }

        .prompts-empty p {
          max-width: 380px;
          margin: 8px 0 18px;
          color: #64748b;
          font-size: 13px;
          line-height: 1.6;
        }

        .prompts-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 1200;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
          background: rgba(15, 23, 42, .48);
          backdrop-filter: blur(3px);
        }

        .prompts-editor {
          display: flex;
          flex-direction: column;
          width: min(1100px, 100%);
          height: min(850px, 94vh);
          overflow: hidden;
          border: 1px solid var(--border, #e2e8f0);
          border-radius: 15px;
          background: var(--card, #fff);
          box-shadow: 0 25px 80px rgba(15, 23, 42, .2);
        }

        .prompts-editor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 19px 24px;
          border-bottom: 1px solid var(--border, #e2e8f0);
        }

        .prompts-editor-title {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .prompts-editor-title h2 {
          margin: 4px 0 0;
          font-size: 18px;
        }

        .prompts-back-button,
        .prompts-close-button {
          display: grid;
          place-items: center;
          width: 36px;
          height: 36px;
          border: 1px solid var(--border, #e2e8f0);
          border-radius: 8px;
          background: transparent;
          color: var(--foreground, #334155);
          cursor: pointer;
        }

        .prompts-editor-tabs {
          display: flex;
          gap: 25px;
          padding: 0 24px;
          border-bottom: 1px solid var(--border, #e2e8f0);
        }

        .prompts-editor-tabs button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 15px 2px;
          border: 0;
          border-bottom: 2px solid transparent;
          background: transparent;
          color: #64748b;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .prompts-editor-tabs button.active {
          border-bottom-color: #315fea;
          color: #315fea;
        }

        .prompts-tab-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #10b981;
        }

        .prompts-editor-body {
          flex: 1;
          min-height: 0;
          overflow: auto;
        }

        .prompts-editor-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 290px;
          min-height: 100%;
        }

        .prompts-editor-main {
          display: flex;
          flex-direction: column;
          gap: 23px;
          padding: 24px;
        }

        .prompts-field {
          display: flex;
          flex-direction: column;
          gap: 9px;
          min-width: 0;
        }

        .prompts-field label {
          color: var(--foreground, #0f172a);
          font-size: 12px;
          font-weight: 600;
        }

        .prompts-field label span {
          color: #dc2626;
        }

        .prompts-field input:not([type="range"]),
        .prompts-field textarea,
        .prompts-model-select select {
          width: 100%;
          box-sizing: border-box;
          padding: 11px 12px;
          border: 1px solid var(--border, #dbe2ea);
          border-radius: 8px;
          outline: none;
          background: var(--card, #fff);
          color: var(--foreground, #0f172a);
          font: inherit;
          font-size: 13px;
        }

        .prompts-field textarea {
          resize: vertical;
          line-height: 1.65;
        }

        .prompts-field input:focus,
        .prompts-field textarea:focus,
        .prompts-model-select select:focus {
          border-color: #315fea;
          box-shadow: 0 0 0 3px rgba(49, 95, 234, .1);
        }

        .prompts-field small {
          color: #94a3b8;
          font-size: 11px;
        }

        .prompts-settings {
          display: flex;
          flex-direction: column;
          gap: 23px;
          padding: 23px 19px;
          border-left: 1px solid var(--border, #e2e8f0);
          background: var(--muted, #fafbfc);
        }

        .prompts-settings-heading {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 13px;
        }

        .prompts-model-select {
          position: relative;
        }

        .prompts-model-select select {
          appearance: none;
          padding-right: 32px;
        }

        .prompts-model-select > svg {
          position: absolute;
          top: 13px;
          right: 11px;
          pointer-events: none;
        }

        .prompts-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .prompts-label-row strong {
          color: #315fea;
          font-size: 12px;
        }

        .prompts-field input[type="range"] {
          width: 100%;
          accent-color: #315fea;
        }

        .prompts-range-labels {
          display: flex;
          justify-content: space-between;
          color: #94a3b8;
          font-size: 10px;
        }

        .prompts-config-note {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          padding: 12px;
          border: 1px solid #dbeafe;
          border-radius: 9px;
          background: #eff6ff;
          color: #2563eb;
        }

        .prompts-config-note svg {
          flex: 0 0 auto;
        }

        .prompts-config-note p {
          margin: 0;
          color: #475569;
          font-size: 11px;
          line-height: 1.6;
        }

        .prompts-response-section {
          display: flex;
          flex-direction: column;
          gap: 20px;
          padding: 25px;
        }

        .prompts-response-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .prompts-response-heading > div {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .prompts-response-icon {
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 10px;
          background: #eff6ff;
          color: #315fea;
        }

        .prompts-response-heading h3 {
          margin: 0;
          font-size: 15px;
        }

        .prompts-response-heading p {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 11px;
        }

        .prompts-response-loading,
        .prompts-response-empty {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 12px;
          min-height: 300px;
          padding: 25px;
          border: 1px dashed var(--border, #cbd5e1);
          border-radius: 12px;
          color: #64748b;
          text-align: center;
        }

        .prompts-response-loading strong,
        .prompts-response-empty strong {
          color: var(--foreground, #0f172a);
          font-size: 14px;
        }

        .prompts-response-loading span,
        .prompts-response-empty span {
          max-width: 380px;
          font-size: 12px;
          line-height: 1.6;
        }

        .prompts-response-output {
          min-height: 230px;
          overflow: auto;
          padding: 20px;
          border: 1px solid var(--border, #e2e8f0);
          border-radius: 10px;
          background: var(--muted, #f8fafc);
          color: var(--foreground, #334155);
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
          font-size: 12px;
          line-height: 1.8;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .prompts-response-disclaimer {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 11px;
        }

        .prompts-editor-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 11px 24px;
          border-top: 1px solid #fecaca;
          background: #fef2f2;
          color: #b91c1c;
          font-size: 12px;
        }

        .prompts-editor-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
          padding: 15px 22px;
          border-top: 1px solid var(--border, #e2e8f0);
          background: var(--card, #fff);
        }

        .prompts-footer-left {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #64748b;
          font-size: 11px;
        }

        .prompts-demo-indicator {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #f59e0b;
        }

        .prompts-footer-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 9px;
          flex-wrap: wrap;
        }

        .prompts-spin {
          animation: prompts-spin 1s linear infinite;
        }

        @keyframes prompts-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 950px) {
          .prompts-stat-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .prompts-editor-layout {
            grid-template-columns: 1fr;
          }

          .prompts-settings {
            border-top: 1px solid var(--border, #e2e8f0);
            border-left: 0;
          }
        }

        @media (max-width: 600px) {
          .prompts-header,
          .prompts-inventory-top {
            align-items: flex-start;
            flex-direction: column;
          }

          .prompts-toolbar {
            flex-direction: column;
          }

          .prompts-search {
            max-width: none;
          }

          .prompts-select {
            width: 100%;
          }

          .prompts-stat-grid {
            gap: 9px;
          }

          .prompts-stat {
            padding: 12px;
            gap: 8px;
          }

          .prompts-stat-icon {
            width: 34px;
            height: 34px;
          }

          .prompts-stat strong {
            font-size: 19px;
          }

          .prompts-modal-overlay {
            padding: 0;
          }

          .prompts-editor {
            width: 100%;
            height: 100%;
            max-height: 100%;
            border-radius: 0;
          }

          .prompts-editor-header {
            padding: 15px;
          }

          .prompts-editor-main,
          .prompts-settings {
            padding: 17px;
          }

          .prompts-editor-footer {
            align-items: flex-start;
            flex-direction: column;
          }

          .prompts-footer-actions {
            width: 100%;
          }

          .prompts-footer-actions button {
            flex: 1;
          }
        }
      `}</style>
    </div>
  );
}
