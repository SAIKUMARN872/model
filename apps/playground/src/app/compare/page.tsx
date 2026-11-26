
import { useState, type FormEvent } from "react";
import { comparePlayground } from "../../services/playgroundApi";
import "./compare.css";

interface ModelSlot {
  id: string;
}

interface ComparisonMetrics {
  tokens?: number;
  cost?: number;
  latency?: number;
}

interface ComparisonResult {
  model: string;
  content: string;
  metrics: ComparisonMetrics;
}

type JsonRecord = Record<string, unknown>;

const MIN_MODELS = 2;
const MAX_MODELS = 4;

function isRecord(value: unknown): value is JsonRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value === null || value === undefined) return "";
  return JSON.stringify(value, null, 2);
}

function getNumber(value: unknown): number | undefined {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  return value;
}

function normalizeResults(
  response: unknown,
  modelIds: string[]
): ComparisonResult[] {
  const root = isRecord(response) ? response : null;

  const candidates: unknown[] = [
    response,
    root?.results,
    root?.comparisons,
    root?.responses,
    root?.data,
  ];

  const arrayResult = candidates.find(Array.isArray);

  if (Array.isArray(arrayResult)) {
    return arrayResult.map((item, index) => {
      const row = isRecord(item) ? item : {};
      const usage = isRecord(row.usage) ? row.usage : {};

      const output =
        row.output ??
        row.content ??
        row.response ??
        row.text ??
        row.message;

      return {
        model: String(
          row.modelId ??
            row.model ??
            row.modelName ??
            row.name ??
            modelIds[index] ??
            `Result ${index + 1}`
        ),
        content: output !== undefined ? getText(output) : getText(item),
        metrics: {
          tokens: getNumber(row.tokens ?? usage.totalTokens),
          cost: getNumber(row.cost),
          latency: getNumber(row.latency),
        },
      };
    });
  }

  if (root && isRecord(root.responses)) {
    return Object.entries(root.responses).map(([model, value]) => {
      const row = isRecord(value) ? value : {};
      const usage = isRecord(row.usage) ? row.usage : {};

      const output =
        row.output ??
        row.content ??
        row.response ??
        row.text ??
        value;

      return {
        model,
        content: getText(output),
        metrics: {
          tokens: getNumber(row.tokens ?? usage.totalTokens),
          cost: getNumber(row.cost),
          latency: getNumber(row.latency),
        },
      };
    });
  }

  if (root) {
    const output =
      root.output ??
      root.content ??
      root.response ??
      root.text;

    if (output !== undefined) {
      const usage = isRecord(root.usage) ? root.usage : {};

      return [
        {
          model: String(root.model ?? modelIds[0] ?? "Backend response"),
          content: getText(output),
          metrics: {
            tokens: getNumber(root.tokens ?? usage.totalTokens),
            cost: getNumber(root.cost),
            latency: getNumber(root.latency),
          },
        },
      ];
    }
  }

  if (response !== undefined && response !== null) {
    return [
      {
        model: "Raw backend response",
        content: getText(response),
        metrics: {},
      },
    ];
  }

  return [];
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: number | undefined;
}) {
  if (value === undefined) return null;

  return (
    <div className="mc-metric">
      <span>{label}</span>
      <strong>{value.toLocaleString()}</strong>
    </div>
  );
}

export default function ComparePage() {
  const [models, setModels] = useState<ModelSlot[]>([
    { id: "" },
    { id: "" },
  ]);

  const [prompt, setPrompt] = useState("");

  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful AI assistant."
  );

  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(1);
  const [maxTokens, setMaxTokens] = useState(2048);

  const [responseFormat, setResponseFormat] = useState<"text" | "json">(
    "text"
  );

  const [results, setResults] = useState<ComparisonResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);

  const updateModel = (index: number, value: string): void => {
    setModels((previous) =>
      previous.map((model, currentIndex) =>
        currentIndex === index ? { id: value } : model
      )
    );
  };

  const addModel = (): void => {
    if (models.length < MAX_MODELS) {
      setModels((previous) => [...previous, { id: "" }]);
    }
  };

  const removeModel = (index: number): void => {
    if (models.length <= MIN_MODELS) return;

    setModels((previous) =>
      previous.filter((_, currentIndex) => currentIndex !== index)
    );
  };

  const handleCompare = async (
    event: FormEvent<HTMLFormElement>
  ): Promise<void> => {
    event.preventDefault();
    setError(null);

    if (!prompt.trim()) {
      setError("Enter a prompt before comparing models.");
      return;
    }

    const modelIds = models.map((model) => model.id.trim());

    if (modelIds.some((id) => !id)) {
      setError("Enter a model identifier for every model.");
      return;
    }

    const uniqueIds = new Set(modelIds.map((id) => id.toLowerCase()));

    if (uniqueIds.size !== modelIds.length) {
      setError("Each model must have a unique identifier.");
      return;
    }

    if (
      temperature < 0 ||
      temperature > 2 ||
      topP < 0 ||
      topP > 1 ||
      !Number.isInteger(maxTokens) ||
      maxTokens < 1
    ) {
      setError("Check the model parameter values.");
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const response = await comparePlayground({
        prompt: prompt.trim(),
        models: modelIds,
        systemPrompt: systemPrompt.trim(),
        parameters: {
          temperature,
          topP,
          maxTokens,
        },
        responseFormat,
      });

      const normalized = normalizeResults(response, modelIds);

      setResults(normalized);
      setLastRunAt(new Date().toLocaleTimeString());
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Model comparison request failed."
      );
    } finally {
      setLoading(false);
    }
  };

  const clearComparison = (): void => {
    setResults([]);
    setError(null);
    setLastRunAt(null);
  };

  return (
    <div className="mc-page">
      {/* Duplicate Model Comparison heading removed */}

      <div className="mc-main-grid">
        <form
          className="mc-panel mc-config-panel"
          onSubmit={handleCompare}
        >
          <div className="mc-panel-heading">
            <div>
              <h3>Comparison Configuration</h3>
              <p>Configure your experiment.</p>
            </div>

            <span className="mc-step">01</span>
          </div>

          <div className="mc-field-section">
            <div className="mc-field-heading">
              <label>Models</label>
              <span>
                {models.length} / {MAX_MODELS}
              </span>
            </div>

            <div className="mc-model-list">
              {models.map((model, index) => (
                <div className="mc-model-row" key={index}>
                  <div className="mc-model-number">
                    {String(index + 1).padStart(2, "0")}
                  </div>

                  <input
                    type="text"
                    value={model.id}
                    onChange={(event) =>
                      updateModel(index, event.target.value)
                    }
                    placeholder="Enter backend model ID"
                    aria-label={`Model ${index + 1} identifier`}
                    disabled={loading}
                  />

                  {models.length > MIN_MODELS && (
                    <button
                      type="button"
                      className="mc-remove-model"
                      onClick={() => removeModel(index)}
                      disabled={loading}
                      aria-label={`Remove model ${index + 1}`}
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>

            <button
              type="button"
              className="mc-add-model"
              onClick={addModel}
              disabled={models.length >= MAX_MODELS || loading}
            >
              + Add another model
            </button>

            <p className="mc-help">
              Use model identifiers accepted by your ModelNow backend.
            </p>
          </div>

          <div className="mc-divider" />

          <div className="mc-field-section">
            <label htmlFor="mc-system-prompt">
              System Instructions
            </label>

            <textarea
              id="mc-system-prompt"
              rows={3}
              value={systemPrompt}
              onChange={(event) => setSystemPrompt(event.target.value)}
              disabled={loading}
              placeholder="Define model behavior..."
            />
          </div>

          <div className="mc-field-section">
            <label htmlFor="mc-user-prompt">
              Test Prompt <span className="mc-required">*</span>
            </label>

            <textarea
              id="mc-user-prompt"
              className="mc-main-prompt"
              rows={6}
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              disabled={loading}
              placeholder="Enter the prompt you want to test across all selected models..."
              required
            />

            <div className="mc-character-count">
              {prompt.length.toLocaleString()} characters
            </div>
          </div>

          <div className="mc-divider" />

          <div className="mc-field-section">
            <div className="mc-field-heading">
              <label>Parameter Controls</label>
              <span>Shared across models</span>
            </div>

            <div className="mc-slider-control">
              <div>
                <label htmlFor="mc-temperature">Temperature</label>
                <strong>{temperature.toFixed(1)}</strong>
              </div>

              <input
                id="mc-temperature"
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(event) =>
                  setTemperature(Number(event.target.value))
                }
                disabled={loading}
              />

              <div className="mc-range-labels">
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </div>

            <div className="mc-two-columns">
              <div>
                <label htmlFor="mc-top-p">Top P</label>
                <input
                  id="mc-top-p"
                  type="number"
                  min="0"
                  max="1"
                  step="0.05"
                  value={topP}
                  onChange={(event) =>
                    setTopP(Number(event.target.value))
                  }
                  disabled={loading}
                />
              </div>

              <div>
                <label htmlFor="mc-max-tokens">Max Tokens</label>
                <input
                  id="mc-max-tokens"
                  type="number"
                  min="1"
                  max="1000000"
                  step="1"
                  value={maxTokens}
                  onChange={(event) =>
                    setMaxTokens(Number(event.target.value))
                  }
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="mc-response-format">
                Response Format
              </label>

              <select
                id="mc-response-format"
                value={responseFormat}
                onChange={(event) =>
                  setResponseFormat(
                    event.target.value as "text" | "json"
                  )
                }
                disabled={loading}
              >
                <option value="text">Text</option>
                <option value="json">JSON</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="mc-error" role="alert">
              <strong>Comparison failed</strong>
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            className="mc-run-button"
            disabled={loading || !prompt.trim()}
          >
            {loading ? (
              <>
                <span className="mc-spinner" />
                Running comparison...
              </>
            ) : (
              <>
                Run Model Comparison
                <span>→</span>
              </>
            )}
          </button>

          <p className="mc-submit-note">
            The same prompt and parameters are sent to every selected model.
          </p>
        </form>

        <section className="mc-results-section">
          <div className="mc-panel mc-results-panel">
            <div className="mc-panel-heading mc-results-heading">
              <div>
                <h3>Comparison Results</h3>
                <p>
                  Independent responses returned by the backend.
                </p>
              </div>

              {results.length > 0 && (
                <button
                  type="button"
                  className="mc-clear-button"
                  onClick={clearComparison}
                  disabled={loading}
                >
                  Clear
                </button>
              )}
            </div>

            {loading ? (
              <div className="mc-empty-state">
                <span className="mc-large-spinner" />
                <h3>Executing comparison</h3>
                <p>
                  Waiting for responses from the selected models.
                </p>
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="mc-result-summary">
                  <strong>
                    {results.length} result
                    {results.length === 1 ? "" : "s"} received
                  </strong>

                  {lastRunAt && (
                    <span>Completed at {lastRunAt}</span>
                  )}
                </div>

                <div className="mc-result-grid">
                  {results.map((result, index) => (
                    <article
                      className="mc-result-card"
                      key={`${result.model}-${index}`}
                    >
                      <div className="mc-result-card-heading">
                        <div className="mc-result-model-icon">
                          {index + 1}
                        </div>

                        <div>
                          <h4>{result.model}</h4>
                          <span>Backend response</span>
                        </div>
                      </div>

                      <div className="mc-result-content">
                        {result.content || "Empty response returned."}
                      </div>

                      {(result.metrics.tokens !== undefined ||
                        result.metrics.cost !== undefined ||
                        result.metrics.latency !== undefined) && (
                        <div className="mc-result-metrics">
                          <Metric
                            label="Tokens"
                            value={result.metrics.tokens}
                          />

                          <Metric
                            label="Cost (backend units)"
                            value={result.metrics.cost}
                          />

                          <Metric
                            label="Latency (ms)"
                            value={result.metrics.latency}
                          />
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <div className="mc-empty-state">
                <div className="mc-empty-icon">⇄</div>
                <h3>Ready to compare models</h3>
                <p>
                  Enter at least two model identifiers, write a prompt,
                  and run your first comparison.
                </p>

                <div className="mc-empty-checklist">
                  <span>✓ Same prompt for each model</span>
                  <span>✓ Shared parameter configuration</span>
                  <span>✓ Independent backend responses</span>
                </div>
              </div>
            )}
          </div>

          <div className="mc-info-panel">
            <strong>Comparison endpoint</strong>
            <code>POST /api/playground/compare</code>
            <p>
              The backend must accept the comparison payload and return
              model responses. Metrics are displayed only when returned
              by the backend.
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}
