
import { useEffect, useMemo, useState } from "react";

import PromptValidation, {
  validatePrompt,
  type PromptFormValues,
  type PromptSubmitValues,
} from "../../validations/promptValidation";

import PromptEditor from "../../components/prompt-editor/PromptEditor";
import ModelSelector from "../../components/model-selector/ModelSelector";

import {
  getAvailableModels,
  testPlayground,
  type PlaygroundRunResponse,
} from "../../services/playgroundApi";

import "./prompts.css";

interface PromptMetrics {
  tokens?: number;
  cost?: number;
  latency?: number;
}

interface PromptVersion {
  id: number;
  name: string;
  description: string;
  content: string;
  temperature: number;
  maxTokens: number;
  createdAt: string;
}

interface SavedPromptDraft {
  prompt: PromptFormValues;
  systemPrompt: string;
  selectedModel: string;
  versions: PromptVersion[];
}

const STORAGE_KEY = "modelnow-prompt-testing-v2";

const DEFAULT_PROMPT: PromptFormValues = {
  name: "",
  description: "",
  content: "",
  temperature: 0.7,
  maxTokens: 2048,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function extractResponse(response: PlaygroundRunResponse): string {
  const root = response as Record<string, unknown>;

  const candidates = [
    root.output,
    root.content,
    root.response,
    response.choices?.[0]?.message?.content,
    response.choices?.[0]?.text,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
  }

  if (isRecord(root.data)) {
    for (const key of ["output", "content", "response", "text"]) {
      const value = root.data[key];

      if (typeof value === "string" && value.trim()) {
        return value;
      }
    }
  }

  return JSON.stringify(response, null, 2);
}

function extractMetrics(response: PlaygroundRunResponse): PromptMetrics {
  return {
    tokens: response.tokens ?? response.usage?.totalTokens,
    cost: response.cost,
    latency: response.latency,
  };
}

function getPromptSuggestions(content: string): string[] {
  const suggestions: string[] = [];
  const normalized = content.toLowerCase();

  if (content.trim().length < 30) {
    suggestions.push(
      "Add more context so the model understands the task."
    );
  }

  if (!/\b(goal|task|objective|purpose)\b/.test(normalized)) {
    suggestions.push(
      "Clearly state the goal or task you want the model to complete."
    );
  }

  if (!/\b(example|for example|sample)\b/.test(normalized)) {
    suggestions.push(
      "Consider including an example of the expected result."
    );
  }

  if (!/\b(format|json|bullet|table|structure)\b/.test(normalized)) {
    suggestions.push(
      "Specify the expected response format."
    );
  }

  if (!/\b(do not|don't|must|avoid|only)\b/.test(normalized)) {
    suggestions.push(
      "Add constraints or instructions describing what the model should avoid."
    );
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "Your prompt includes several useful instruction elements. Test it and review the actual response."
    );
  }

  return suggestions;
}

export default function PromptsPage() {
  const [initialPrompt, setInitialPrompt] =
    useState<Partial<PromptFormValues>>(DEFAULT_PROMPT);

  const [promptDraft, setPromptDraft] =
    useState<PromptFormValues>(DEFAULT_PROMPT);

  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful AI assistant."
  );

  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("");

  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelError, setModelError] = useState("");

  const [versions, setVersions] = useState<PromptVersion[]>([]);
  const [versionNumber, setVersionNumber] = useState(0);

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");
  const [metrics, setMetrics] = useState<PromptMetrics>({});
  const [error, setError] = useState<string | null>(null);

  const [draftStatus, setDraftStatus] = useState("");
  const [executionStatus, setExecutionStatus] = useState<
    "waiting" | "completed"
  >("waiting");

  const suggestions = useMemo(
    () => getPromptSuggestions(promptDraft.content),
    [promptDraft.content]
  );

  // Load backend-confirmed models.
  useEffect(() => {
    let active = true;

    async function loadModels() {
      setModelsLoading(true);
      setModelError("");

      try {
        const availableModels = await getAvailableModels();

        if (!active) return;

        const validModels = availableModels.filter(
          (model) =>
            typeof model === "string" &&
            model.trim().length > 0
        );

        setModels(validModels);

        if (validModels.length > 0) {
          setSelectedModel((current) =>
            validModels.includes(current)
              ? current
              : validModels[0]
          );
        } else {
          setModelError(
            "The backend did not return any available models."
          );
        }
      } catch (requestError: unknown) {
        if (!active) return;

        setModelError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load backend models."
        );
      } finally {
        if (active) setModelsLoading(false);
      }
    }

    void loadModels();

    return () => {
      active = false;
    };
  }, []);

  // Restore the saved draft and prompt versions.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) return;

      const parsed: unknown = JSON.parse(saved);

      if (!isRecord(parsed) || !isRecord(parsed.prompt)) {
        return;
      }

      const prompt = parsed.prompt;

      if (
        typeof prompt.name !== "string" ||
        typeof prompt.description !== "string" ||
        typeof prompt.content !== "string"
      ) {
        return;
      }

      const restoredPrompt: PromptFormValues = {
        name: prompt.name,
        description: prompt.description,
        content: prompt.content,
        temperature:
          typeof prompt.temperature === "number" ||
          typeof prompt.temperature === "string"
            ? prompt.temperature
            : 0.7,
        maxTokens:
          typeof prompt.maxTokens === "number" ||
          typeof prompt.maxTokens === "string"
            ? prompt.maxTokens
            : 2048,
      };

      setInitialPrompt(restoredPrompt);
      setPromptDraft(restoredPrompt);

      if (typeof parsed.systemPrompt === "string") {
        setSystemPrompt(parsed.systemPrompt);
      }

      if (typeof parsed.selectedModel === "string") {
        setSelectedModel(parsed.selectedModel);
      }

      if (Array.isArray(parsed.versions)) {
        setVersions(
          parsed.versions.filter(
            (item): item is PromptVersion =>
              isRecord(item) &&
              typeof item.id === "number" &&
              typeof item.name === "string" &&
              typeof item.description === "string" &&
              typeof item.content === "string" &&
              typeof item.temperature === "number" &&
              typeof item.maxTokens === "number" &&
              typeof item.createdAt === "string"
          )
        );
      }

      setVersionNumber(1);
      setDraftStatus("Saved prompt draft restored.");
    } catch {
      setDraftStatus(
        "Could not restore the previous prompt draft."
      );
    }
  }, []);

  const handleValidPrompt = (values: PromptFormValues) => {
    setPromptDraft(values);
  };

  const handleSystemPromptSave = (value: string) => {
    setSystemPrompt(value);
    setDraftStatus("System instructions updated.");
  };

  const handleSaveDraft = () => {
    const validationErrors = validatePrompt(promptDraft);

    if (Object.keys(validationErrors).length > 0) {
      setDraftStatus(
        "Complete the required prompt fields before saving."
      );
      return;
    }

    const draft: SavedPromptDraft = {
      prompt: promptDraft,
      systemPrompt,
      selectedModel,
      versions,
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
      setDraftStatus(
        "Prompt draft and versions saved in this browser."
      );
    } catch {
      setDraftStatus(
        "Unable to save. Browser storage may be unavailable."
      );
    }
  };

  const handleSaveVersion = () => {
    const validationErrors = validatePrompt(promptDraft);

    if (Object.keys(validationErrors).length > 0) {
      setDraftStatus(
        "Enter a valid prompt before creating a version."
      );
      return;
    }

    const version: PromptVersion = {
      id: Date.now(),
      name: promptDraft.name,
      description: promptDraft.description,
      content: promptDraft.content,
      temperature: Number(promptDraft.temperature),
      maxTokens: Number(promptDraft.maxTokens),
      createdAt: new Date().toLocaleString(),
    };

    setVersions((current) => [version, ...current]);

    setDraftStatus(
      "New prompt version created. Save the draft to persist it."
    );
  };

  const handleRestoreVersion = (version: PromptVersion) => {
    const restored: PromptFormValues = {
      name: version.name,
      description: version.description,
      content: version.content,
      temperature: version.temperature,
      maxTokens: version.maxTokens,
    };

    setInitialPrompt(restored);
    setPromptDraft(restored);
    setVersionNumber((current) => current + 1);

    setDraftStatus(`Restored prompt version: ${version.name}`);

    setResult("");
    setMetrics({});
    setError(null);
    setExecutionStatus("waiting");
  };

  const handleDeleteVersion = (id: number) => {
    setVersions((current) =>
      current.filter((item) => item.id !== id)
    );

    setDraftStatus(
      "Prompt version removed. Save the draft to persist the change."
    );
  };

  const handleTestPrompt = async (values: PromptSubmitValues) => {
    setError(null);
    setResult("");
    setMetrics({});
    setExecutionStatus("waiting");

    if (!selectedModel) {
      setError(
        "Select an available backend model before testing."
      );
      return;
    }

    if (!systemPrompt.trim()) {
      setError("Enter system instructions before testing.");
      return;
    }

    setPromptDraft(values);
    setLoading(true);

    try {
      const response = await testPlayground({
        input: values.content,
        model: selectedModel,
        systemPrompt,
        temperature: values.temperature,
        maxTokens: values.maxTokens,
      });

      setResult(extractResponse(response));
      setMetrics(extractMetrics(response));
      setExecutionStatus("completed");
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Prompt execution failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-page">
      {/* Duplicate Prompt Testing heading removed */}

      <div className="pt-grid">
        <div className="pt-left">
          <section className="pt-card">
            <div className="pt-card-heading">
              <div>
                <h3>Prompt Configuration</h3>
                <p>
                  Write and validate the prompt you want to test.
                </p>
              </div>

              <span className="pt-step">01</span>
            </div>

            <PromptValidation
              key={`prompt-${versionNumber}`}
              initialPrompt={initialPrompt}
              onValid={handleValidPrompt}
              onSubmit={(values) => {
                void handleTestPrompt(values);
              }}
              submitLabel={loading ? "Testing..." : "Test Prompt"}
            />

            <div className="pt-action-row">
              <button
                type="button"
                className="pt-save-button"
                onClick={handleSaveDraft}
                disabled={loading}
              >
                Save Draft
              </button>

              <button
                type="button"
                className="pt-version-button"
                onClick={handleSaveVersion}
                disabled={loading}
              >
                Save Prompt Version
              </button>
            </div>

            {draftStatus && (
              <p className="pt-draft-status" role="status">
                {draftStatus}
              </p>
            )}
          </section>

          <PromptEditor
            key={`system-${versionNumber}`}
            initialPrompt={systemPrompt}
            onSave={handleSystemPromptSave}
          />

          <section className="pt-card">
            <div className="pt-card-heading">
              <div>
                <h3>Prompt Improvement Review</h3>
                <p>
                  Suggestions based on the text of your current prompt.
                </p>
              </div>

              <span className="pt-step">03</span>
            </div>

            <div className="pt-review-list">
              {suggestions.map((suggestion, index) => (
                <div className="pt-review-item" key={index}>
                  <span>{index + 1}</span>
                  <p>{suggestion}</p>
                </div>
              ))}
            </div>

            <p className="pt-hint">
              These are writing suggestions, not AI-generated changes.
              Edit your prompt and test the revised version to evaluate it.
            </p>
          </section>

          <section className="pt-card">
            <div className="pt-card-heading">
              <div>
                <h3>Prompt Versions</h3>
                <p>
                  Save, restore and manage different prompt revisions.
                </p>
              </div>

              <span className="pt-step">
                {versions.length} saved
              </span>
            </div>

            {versions.length === 0 ? (
              <div className="pt-empty pt-version-empty">
                No versions saved yet. Create a valid prompt and select
                Save Prompt Version.
              </div>
            ) : (
              <div className="pt-version-list">
                {versions.map((version, index) => (
                  <div className="pt-version-item" key={version.id}>
                    <div className="pt-version-info">
                      <strong>
                        V{versions.length - index} — {version.name}
                      </strong>

                      <span>{version.createdAt}</span>

                      <p>
                        Temperature: {version.temperature} · Max tokens:{" "}
                        {version.maxTokens}
                      </p>
                    </div>

                    <div className="pt-version-actions">
                      <button
                        type="button"
                        onClick={() => handleRestoreVersion(version)}
                        disabled={loading}
                      >
                        Restore
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteVersion(version.id)}
                        disabled={loading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="pt-right">
          <section className="pt-card">
            <div className="pt-card-heading">
              <div>
                <h3>Execution Settings</h3>
                <p>Choose a real backend model.</p>
              </div>

              <span className="pt-step">02</span>
            </div>

            {modelsLoading ? (
              <p className="pt-hint">
                Loading available backend models...
              </p>
            ) : models.length > 0 ? (
              <div className="pt-setting">
                <ModelSelector
                  models={models.map((model) => ({
                    id: model,
                    name: model,
                    provider: "Backend",
                  }))}
                  selectedModel={selectedModel}
                  onChange={setSelectedModel}
                />
              </div>
            ) : (
              <div className="pt-error" role="alert">
                <strong>Models unavailable</strong>
                <p>
                  {modelError ||
                    "No backend models were returned."}
                </p>
              </div>
            )}

            {modelError && models.length > 0 && (
              <p className="pt-hint">{modelError}</p>
            )}

            <div className="pt-setting">
              <label>Temperature</label>
              <p className="pt-hint">
                Set between 0 and 2 in Prompt Configuration.
              </p>
              <strong>
                {Number(promptDraft.temperature).toFixed(1)}
              </strong>
            </div>

            <div className="pt-setting">
              <label>Maximum Tokens</label>
              <strong>
                {Number(promptDraft.maxTokens).toLocaleString()}
              </strong>
            </div>

            <div className="pt-execution-note">
              The selected model, prompt, system instructions, temperature
              and maximum tokens are sent to the existing backend chat API.
            </div>
          </section>

          <section className="pt-card">
            <div className="pt-card-heading">
              <div>
                <h3>Execution Status</h3>
                <p>Current test information.</p>
              </div>
            </div>

            <div className="pt-status-row">
              <span className="pt-status-label">Execution</span>
              <strong>
                {loading
                  ? "Running"
                  : error
                    ? "Failed"
                    : executionStatus === "completed"
                      ? "Completed"
                      : "Waiting"}
              </strong>
            </div>

            <div className="pt-status-row">
              <span className="pt-status-label">Model</span>
              <strong>{selectedModel || "Not selected"}</strong>
            </div>

            <div className="pt-status-row">
              <span className="pt-status-label">Prompt</span>
              <strong>{promptDraft.name || "Untitled"}</strong>
            </div>

            <div className="pt-status-row">
              <span className="pt-status-label">
                System instructions
              </span>
              <strong>
                {systemPrompt.trim() ? "Configured" : "Empty"}
              </strong>
            </div>
          </section>

          <section className="pt-card">
            <div className="pt-card-heading">
              <div>
                <h3>Execution Metrics</h3>
                <p>Metrics returned by the backend.</p>
              </div>
            </div>

            <div className="pt-metrics-grid">
              <div>
                <span>Total Tokens</span>
                <strong>
                  {metrics.tokens !== undefined
                    ? metrics.tokens.toLocaleString()
                    : "—"}
                </strong>
              </div>

              <div>
                <span>Cost</span>
                <strong>
                  {metrics.cost !== undefined
                    ? String(metrics.cost)
                    : "—"}
                </strong>
              </div>
            </div>

            <div className="pt-latency">
              <span>Latency</span>
              <strong>
                {metrics.latency !== undefined
                  ? `${metrics.latency} ms`
                  : "—"}
              </strong>
            </div>

            <p className="pt-hint">
              Missing metrics remain blank. No estimated values are shown.
            </p>
          </section>
        </aside>
      </div>

      {error && (
        <div className="pt-error" role="alert">
          <strong>Prompt execution failed</strong>
          <p>{error}</p>
        </div>
      )}

      <section className="pt-response">
        <div className="pt-card-heading">
          <div>
            <h3>Model Response</h3>
            <p>Actual output returned by the backend.</p>
          </div>

          <span className="pt-response-status">
            {loading
              ? "Executing"
              : result
                ? "Response received"
                : "No response"}
          </span>
        </div>

        <div className="pt-response-body">
          {loading ? (
            <div className="pt-loading">
              <span className="pt-spinner" />
              Waiting for the backend response...
            </div>
          ) : result ? (
            <pre>{result}</pre>
          ) : (
            <div className="pt-empty">
              Your model response will appear here after a successful
              prompt execution.
            </div>
          )}
        </div>
      </section>

      <div className="pt-api-note">
        <strong>Execution API</strong>
        <code>POST /api/playground/chat</code>
        <span>
          Drafts and prompt versions are stored in this browser, not in
          backend prompt storage.
        </span>
      </div>
    </div>
  );
}
