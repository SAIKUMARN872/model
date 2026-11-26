
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Bot,
  Copy,
  RotateCcw,
  Save,
  Play,
  Check,
  AlertCircle,
  FileText,
  MessageSquare,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  getAvailableModels,
  testPlayground,
} from "../../services/playgroundApi";

import "./system-instructions.css";

type Model = {
  id?: string;
  name?: string;
  model?: string;
  provider?: string;
};

type Template = {
  name: string;
  description: string;
  role: string;
  objective: string;
  tone: string;
  rules: string;
  constraints: string;
  format: string;
};

const templates: Template[] = [
  {
    name: "Helpful Assistant",
    description: "A general-purpose assistant",
    role: "You are a helpful and knowledgeable AI assistant.",
    objective: "Answer the user's questions accurately and helpfully.",
    tone: "Friendly, clear, and professional.",
    rules: "Understand the user's request before answering. Explain complex topics in simple language. Ask for clarification when necessary.",
    constraints: "Do not invent facts. Clearly communicate uncertainty. Stay relevant to the user's request.",
    format: "Use clear paragraphs and bullet points when appropriate.",
  },
  {
    name: "Customer Support",
    description: "Customer service and support",
    role: "You are a professional customer support assistant.",
    objective: "Help customers resolve questions and problems efficiently.",
    tone: "Empathetic, patient, and professional.",
    rules: "Acknowledge the customer's concern. Provide actionable troubleshooting steps. Explain solutions clearly.",
    constraints: "Never promise refunds, credits, or actions without authorization. Do not request passwords or sensitive credentials.",
    format: "Use numbered steps for troubleshooting and concise answers for simple questions.",
  },
  {
    name: "Technical Expert",
    description: "Programming and technical explanations",
    role: "You are an experienced software engineer and technical expert.",
    objective: "Provide accurate technical explanations, debugging guidance, and implementation advice.",
    tone: "Direct, precise, and technically detailed.",
    rules: "Explain the cause of technical problems. Provide practical solutions. Include code examples when useful.",
    constraints: "Do not claim code was tested unless it was actually executed. Identify assumptions and potential risks.",
    format: "Use headings, code blocks, and step-by-step instructions where appropriate.",
  },
  {
    name: "Concise Assistant",
    description: "Short and direct responses",
    role: "You are a concise AI assistant.",
    objective: "Give the user the most useful answer with minimal unnecessary detail.",
    tone: "Clear, direct, and respectful.",
    rules: "Answer the main question first. Remove repetition. Include only relevant details.",
    constraints: "Do not sacrifice accuracy for brevity. Include important warnings when necessary.",
    format: "Prefer short paragraphs and compact bullet points.",
  },
];

const STORAGE_KEY = "modelnow-system-instructions-v1";

function buildSystemPrompt(values: {
  role: string;
  objective: string;
  tone: string;
  rules: string;
  constraints: string;
  format: string;
}) {
  return [
    values.role && `ROLE\n${values.role}`,
    values.objective && `OBJECTIVE\n${values.objective}`,
    values.tone && `TONE\n${values.tone}`,
    values.rules && `BEHAVIOR RULES\n${values.rules}`,
    values.constraints && `CONSTRAINTS\n${values.constraints}`,
    values.format && `RESPONSE FORMAT\n${values.format}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export default function SystemInstructionsPage() {
  const [models, setModels] = useState<Model[]>([]);
  const [selectedModel, setSelectedModel] = useState("");

  const [role, setRole] = useState("");
  const [objective, setObjective] = useState("");
  const [tone, setTone] = useState("");
  const [rules, setRules] = useState("");
  const [constraints, setConstraints] = useState("");
  const [format, setFormat] = useState("");

  const [testInput, setTestInput] = useState("");
  const [response, setResponse] = useState("");

  const [loading, setLoading] = useState(false);
  const [modelsLoading, setModelsLoading] = useState(true);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [activeTemplate, setActiveTemplate] = useState("");

  const systemPrompt = useMemo(
    () =>
      buildSystemPrompt({
        role,
        objective,
        tone,
        rules,
        constraints,
        format,
      }),
    [role, objective, tone, rules, constraints, format]
  );

  const wordCount = systemPrompt.trim()
    ? systemPrompt.trim().split(/\s+/).length
    : 0;

  useEffect(() => {
    let active = true;

    async function loadModels() {
      try {
        const result = await getAvailableModels();

        if (!active) return;

        const list = Array.isArray(result)
          ? result
          : Array.isArray((result as any)?.models)
            ? (result as any).models
            : [];

        setModels(list);

        if (list.length) {
          const first = list[0];

          setSelectedModel(
            first.id || first.model || first.name || ""
          );
        }
      } catch {
        if (active) {
          setError(
            "Could not load available models. Check your API connection."
          );
        }
      } finally {
        if (active) setModelsLoading(false);
      }
    }

    void loadModels();

    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const data = JSON.parse(stored);

        setRole(data.role || "");
        setObjective(data.objective || "");
        setTone(data.tone || "");
        setRules(data.rules || "");
        setConstraints(data.constraints || "");
        setFormat(data.format || "");

        setSelectedModel(
          (current) => current || data.selectedModel || ""
        );
      }
    } catch {
      // Ignore invalid local draft data.
    }

    return () => {
      active = false;
    };
  }, []);

  function applyTemplate(template: Template) {
    setRole(template.role);
    setObjective(template.objective);
    setTone(template.tone);
    setRules(template.rules);
    setConstraints(template.constraints);
    setFormat(template.format);

    setActiveTemplate(template.name);
    setResponse("");
    setError("");
    setSaved(false);
  }

  function saveDraft() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          role,
          objective,
          tone,
          rules,
          constraints,
          format,
          selectedModel,
        })
      );

      setSaved(true);
    } catch {
      setError("Unable to save the draft in browser storage.");
    }
  }

  function resetForm() {
    setRole("");
    setObjective("");
    setTone("");
    setRules("");
    setConstraints("");
    setFormat("");
    setResponse("");
    setError("");
    setActiveTemplate("");
    setSaved(false);
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(systemPrompt);
    } catch {
      setError("Could not copy the system instructions.");
    }
  }

  async function runTest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setResponse("");

    if (!systemPrompt.trim()) {
      setError("Add system instructions before running a test.");
      return;
    }

    if (!testInput.trim()) {
      setError("Enter a test message.");
      return;
    }

    if (!selectedModel) {
      setError("Select an available model.");
      return;
    }

    setLoading(true);

    try {
      const result = await testPlayground({
        input: testInput.trim(),
        model: selectedModel,
        systemPrompt,
      });

      const data = result as any;

      const output =
        data?.output ??
        data?.content ??
        data?.response ??
        data?.choices?.[0]?.message?.content ??
        data?.choices?.[0]?.text;

      if (typeof output === "string" && output.trim()) {
        setResponse(output);
      } else {
        setError(
          "The API request completed, but no readable response was returned."
        );
      }
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "The model test failed. Check the API connection."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="si-page">
      {/* Duplicate System Instructions page heading removed */}

      <section className="si-template-section">
        <div className="si-section-heading">
          <div>
            <h2>
              <Sparkles size={17} />
              Start with a template
            </h2>
            <p>
              Choose a starting point or create your own instructions.
            </p>
          </div>
        </div>

        <div className="si-template-grid">
          {templates.map((template) => (
            <button
              key={template.name}
              type="button"
              className={`si-template-card ${
                activeTemplate === template.name ? "active" : ""
              }`}
              onClick={() => applyTemplate(template)}
              disabled={loading}
            >
              <span className="si-template-icon">
                <FileText size={18} />
              </span>

              <span className="si-template-copy">
                <strong>{template.name}</strong>
                <small>{template.description}</small>
              </span>

              {activeTemplate === template.name && (
                <Check className="si-template-check" size={16} />
              )}
            </button>
          ))}
        </div>
      </section>

      <div className="si-workspace">
        <section className="si-editor-panel">
          <div className="si-panel-heading">
            <div>
              <h2>
                <Bot size={18} />
                Instruction Builder
              </h2>
              <p>Configure the behavior of your selected model.</p>
            </div>

            <div className="si-header-actions">
              <button
                type="button"
                className="si-secondary-btn"
                onClick={resetForm}
                disabled={loading}
              >
                <RotateCcw size={15} />
                Reset
              </button>

              <button
                type="button"
                className="si-primary-btn"
                onClick={saveDraft}
                disabled={loading}
              >
                {saved ? <Check size={15} /> : <Save size={15} />}
                {saved ? "Saved" : "Save draft"}
              </button>
            </div>
          </div>

          <span className="si-draft-label">Editable draft</span>

          <div className="si-fields">
            <label className="si-field">
              <span>1. Role</span>
              <small>Who should the AI act as?</small>

              <textarea
                value={role}
                onChange={(e) => {
                  setRole(e.target.value);
                  setSaved(false);
                  setActiveTemplate("");
                }}
                placeholder="Example: You are an experienced financial assistant..."
                rows={3}
                disabled={loading}
              />
            </label>

            <label className="si-field">
              <span>2. Objective</span>
              <small>What should the AI accomplish?</small>

              <textarea
                value={objective}
                onChange={(e) => {
                  setObjective(e.target.value);
                  setSaved(false);
                  setActiveTemplate("");
                }}
                placeholder="Describe the main goal of the assistant..."
                rows={3}
                disabled={loading}
              />
            </label>

            <label className="si-field">
              <span>3. Tone and personality</span>
              <small>How should responses sound?</small>

              <textarea
                value={tone}
                onChange={(e) => {
                  setTone(e.target.value);
                  setSaved(false);
                  setActiveTemplate("");
                }}
                placeholder="Example: Professional, friendly, concise..."
                rows={2}
                disabled={loading}
              />
            </label>

            <label className="si-field">
              <span>4. Behavior rules</span>
              <small>What rules should the AI follow?</small>

              <textarea
                value={rules}
                onChange={(e) => {
                  setRules(e.target.value);
                  setSaved(false);
                  setActiveTemplate("");
                }}
                placeholder="Enter instructions the model should follow..."
                rows={4}
                disabled={loading}
              />
            </label>

            <label className="si-field">
              <span>5. Constraints and restrictions</span>
              <small>What should the AI avoid doing?</small>

              <textarea
                value={constraints}
                onChange={(e) => {
                  setConstraints(e.target.value);
                  setSaved(false);
                  setActiveTemplate("");
                }}
                placeholder="Example: Do not invent facts or expose confidential information..."
                rows={3}
                disabled={loading}
              />
            </label>

            <label className="si-field">
              <span>6. Response format</span>
              <small>How should the answer be structured?</small>

              <textarea
                value={format}
                onChange={(e) => {
                  setFormat(e.target.value);
                  setSaved(false);
                  setActiveTemplate("");
                }}
                placeholder="Example: Use headings, bullet points, and code blocks..."
                rows={3}
                disabled={loading}
              />
            </label>
          </div>

          <div className="si-editor-footer">
            <span>{wordCount} words in system instructions</span>

            <button
              type="button"
              className="si-copy-btn"
              onClick={copyPrompt}
              disabled={!systemPrompt || loading}
            >
              <Copy size={14} />
              Copy instructions
            </button>
          </div>
        </section>

        <aside className="si-preview-panel">
          <div className="si-panel-heading">
            <div>
              <h2>
                <FileText size={17} />
                Instruction Preview
              </h2>
              <p>Combined instructions sent to the model.</p>
            </div>
          </div>

          <pre className="si-preview-content">
            {systemPrompt ||
              "Your combined system instructions will appear here as you complete the fields."}
          </pre>

          <div className="si-preview-note">
            <ShieldCheck size={16} />
            <span>
              System instructions guide model behavior. Actual compliance
              depends on the selected model and its capabilities.
            </span>
          </div>
        </aside>
      </div>

      <form className="si-test-panel" onSubmit={runTest}>
        <div className="si-panel-heading">
          <div>
            <h2>
              <MessageSquare size={18} />
              Test System Instructions
            </h2>
            <p>
              Send a test message with your configured instructions.
            </p>
          </div>

          <span className="si-test-badge">Live API test</span>
        </div>

        <div className="si-test-config">
          <label className="si-field">
            <span>Model</span>

            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              disabled={modelsLoading || models.length === 0 || loading}
            >
              {modelsLoading && (
                <option value="">Loading models...</option>
              )}

              {!modelsLoading && models.length === 0 && (
                <option value="">No models available</option>
              )}

              {models.map((model, index) => {
                const value =
                  model.id || model.model || model.name || "";

                return (
                  <option key={`${value}-${index}`} value={value}>
                    {model.name || model.id || model.model}
                    {model.provider ? ` (${model.provider})` : ""}
                  </option>
                );
              })}
            </select>
          </label>
        </div>

        <label className="si-field">
          <span>Test message</span>

          <textarea
            value={testInput}
            onChange={(e) => setTestInput(e.target.value)}
            placeholder="Example: Explain artificial intelligence to a beginner..."
            rows={3}
            disabled={loading}
          />
        </label>

        {error && (
          <div className="si-error" role="alert">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <div className="si-run-footer">
          <span>
            The request uses your current system instructions and selected
            model.
          </span>

          <button
            type="submit"
            className="si-primary-btn"
            disabled={loading || modelsLoading || !selectedModel}
          >
            <Play size={15} />
            {loading ? "Running test..." : "Run test"}
          </button>
        </div>

        {response && (
          <div className="si-response">
            <div className="si-response-heading">
              <Check size={16} />
              Model response
            </div>

            <pre>{response}</pre>
          </div>
        )}
      </form>
    </main>
  );
}
