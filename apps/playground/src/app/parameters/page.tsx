
import { useEffect, useState } from "react";
import {
  SlidersHorizontal,
  RotateCcw,
  Play,
  Info,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

import {
  getAvailableModels,
  testPlayground,
  type PlaygroundRunResponse,
} from "../../services/playgroundApi";

import "./parameters.css";

interface ParameterConfig {
  temperature: number;
  topP: number;
  maxTokens: number;
  frequencyPenalty: number;
  presencePenalty: number;
}

interface ParameterMetrics {
  tokens?: number;
  cost?: number;
  latency?: number;
}

const DEFAULT_PARAMETERS: ParameterConfig = {
  temperature: 0.7,
  topP: 1,
  maxTokens: 2048,
  frequencyPenalty: 0,
  presencePenalty: 0,
};

const PARAMETER_INFO = [
  {
    key: "temperature",
    title: "Temperature",
    description:
      "Controls randomness. Lower values produce more focused responses; higher values encourage variation.",
    min: 0,
    max: 2,
    step: 0.1,
    unit: "",
    recommended: "0.7",
  },
  {
    key: "topP",
    title: "Top P",
    description:
      "Controls nucleus sampling. Lower values restrict the token selection pool.",
    min: 0,
    max: 1,
    step: 0.05,
    unit: "",
    recommended: "1.0",
  },
  {
    key: "maxTokens",
    title: "Maximum Tokens",
    description:
      "Sets the maximum number of tokens the model can generate in its response.",
    min: 1,
    max: 32768,
    step: 1,
    unit: "tokens",
    recommended: "2048",
  },
  {
    key: "frequencyPenalty",
    title: "Frequency Penalty",
    description:
      "Reduces repeated tokens and phrases. Higher values discourage frequent repetition.",
    min: -2,
    max: 2,
    step: 0.1,
    unit: "",
    recommended: "0",
  },
  {
    key: "presencePenalty",
    title: "Presence Penalty",
    description:
      "Encourages new topics by penalizing tokens that have already appeared.",
    min: -2,
    max: 2,
    step: 0.1,
    unit: "",
    recommended: "0",
  },
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function extractOutput(response: PlaygroundRunResponse): string {
  const root = response as Record<string, unknown>;

  const candidates = [
    root.output,
    root.content,
    root.response,
    response.choices?.[0]?.message?.content,
    response.choices?.[0]?.text,
  ];

  for (const value of candidates) {
    if (typeof value === "string" && value.trim()) {
      return value;
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

function getMetrics(response: PlaygroundRunResponse): ParameterMetrics {
  return {
    tokens: response.tokens ?? response.usage?.totalTokens,
    cost: response.cost,
    latency: response.latency,
  };
}

function validateParameters(parameters: ParameterConfig): string[] {
  const errors: string[] = [];

  if (parameters.temperature < 0 || parameters.temperature > 2) {
    errors.push("Temperature must be between 0 and 2.");
  }

  if (parameters.topP < 0 || parameters.topP > 1) {
    errors.push("Top P must be between 0 and 1.");
  }

  if (
    !Number.isInteger(parameters.maxTokens) ||
    parameters.maxTokens < 1 ||
    parameters.maxTokens > 32768
  ) {
    errors.push("Maximum tokens must be an integer between 1 and 32768.");
  }

  if (
    parameters.frequencyPenalty < -2 ||
    parameters.frequencyPenalty > 2
  ) {
    errors.push("Frequency penalty must be between -2 and 2.");
  }

  if (
    parameters.presencePenalty < -2 ||
    parameters.presencePenalty > 2
  ) {
    errors.push("Presence penalty must be between -2 and 2.");
  }

  return errors;
}

export default function ParametersPage() {
  const [parameters, setParameters] =
    useState<ParameterConfig>(DEFAULT_PARAMETERS);

  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("");

  const [modelsLoading, setModelsLoading] = useState(true);
  const [modelError, setModelError] = useState("");

  const [prompt, setPrompt] = useState(
    "Explain how artificial intelligence can improve business productivity. Give three practical examples."
  );

  const [systemPrompt, setSystemPrompt] = useState(
    "You are a helpful AI assistant. Provide clear and accurate answers."
  );

  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [metrics, setMetrics] = useState<ParameterMetrics>({});
  const [error, setError] = useState("");

  const [executionStatus, setExecutionStatus] = useState<
    "waiting" | "completed" | "failed"
  >("waiting");

  const validationErrors = validateParameters(parameters);

  useEffect(() => {
    let active = true;

    async function loadModels() {
      try {
        setModelsLoading(true);
        setModelError("");

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
            validModels.includes(current) ? current : validModels[0]
          );
        } else {
          setModelError("No backend models are currently available.");
        }
      } catch (requestError: unknown) {
        if (!active) return;

        setModelError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load available models."
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

  const updateParameter = (
    key: keyof ParameterConfig,
    value: number
  ) => {
    setParameters((current) => ({
      ...current,
      [key]: value,
    }));
  };

  const resetParameters = () => {
    setParameters(DEFAULT_PARAMETERS);
    setResponse("");
    setMetrics({});
    setError("");
    setExecutionStatus("waiting");
  };

  const runTest = async () => {
    setError("");
    setResponse("");
    setMetrics({});

    if (!selectedModel) {
      setError("Select an available backend model first.");
      setExecutionStatus("failed");
      return;
    }

    if (!prompt.trim()) {
      setError("Enter a test prompt before running the test.");
      setExecutionStatus("failed");
      return;
    }

    if (!systemPrompt.trim()) {
      setError("Enter system instructions before running the test.");
      setExecutionStatus("failed");
      return;
    }

    const errors = validateParameters(parameters);

    if (errors.length > 0) {
      setError(errors.join(" "));
      setExecutionStatus("failed");
      return;
    }

    setLoading(true);
    setExecutionStatus("waiting");

    try {
      const result = await testPlayground({
        input: prompt.trim(),
        model: selectedModel,
        systemPrompt: systemPrompt.trim(),
        temperature: parameters.temperature,
        maxTokens: parameters.maxTokens,
        topP: parameters.topP,
        frequencyPenalty: parameters.frequencyPenalty,
        presencePenalty: parameters.presencePenalty,
      });

      setResponse(extractOutput(result));
      setMetrics(getMetrics(result));
      setExecutionStatus("completed");
    } catch (requestError: unknown) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Parameter test failed."
      );
      setExecutionStatus("failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pc-page">
      {/* Duplicate Parameter Controls heading removed */}

      <div className="pc-layout">
        <main className="pc-main">
          <section className="pc-card">
            <div className="pc-card-heading">
              <div>
                <h3>
                  <SlidersHorizontal size={16} />
                  Generation Parameters
                </h3>
                <p>
                  Adjust the values to control how the selected model
                  generates responses.
                </p>
              </div>

              <span className="pc-step">01</span>
            </div>

            <div className="pc-parameter-list">
              {PARAMETER_INFO.map((item) => {
                const key = item.key as keyof ParameterConfig;
                const value = parameters[key];

                return (
                  <div className="pc-parameter" key={item.key}>
                    <div className="pc-parameter-heading">
                      <div>
                        <label htmlFor={`pc-${item.key}`}>
                          {item.title}
                        </label>
                        <p>{item.description}</p>
                      </div>

                      <strong>
                        {value}
                        {item.unit ? ` ${item.unit}` : ""}
                      </strong>
                    </div>

                    <input
                      id={`pc-${item.key}`}
                      type="range"
                      min={item.min}
                      max={item.max}
                      step={item.step}
                      value={value}
                      onChange={(event) =>
                        updateParameter(
                          key,
                          Number(event.target.value)
                        )
                      }
                      disabled={loading}
                    />

                    <div className="pc-range-footer">
                      <span>{item.min}</span>

                      <input
                        type="number"
                        min={item.min}
                        max={item.max}
                        step={item.step}
                        value={value}
                        onChange={(event) =>
                          updateParameter(
                            key,
                            Number(event.target.value)
                          )
                        }
                        disabled={loading}
                        aria-label={`${item.title} numeric value`}
                      />

                      <span>{item.max}</span>
                    </div>

                    <div className="pc-recommended">
                      Recommended starting value: {item.recommended}
                    </div>
                  </div>
                );
              })}
            </div>

            {validationErrors.length > 0 && (
              <div className="pc-validation" role="alert">
                <AlertCircle size={15} />
                <div>
                  {validationErrors.map((message) => (
                    <p key={message}>{message}</p>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="pc-card">
            <div className="pc-card-heading">
              <div>
                <h3>Test Configuration</h3>
                <p>
                  Choose a backend model and provide the prompts to execute.
                </p>
              </div>

              <span className="pc-step">02</span>
            </div>

            <div className="pc-field">
              <label htmlFor="pc-model">Backend Model</label>

              {modelsLoading ? (
                <div className="pc-loading-text">
                  <Loader2 size={15} className="pc-spin" />
                  Loading available models...
                </div>
              ) : models.length > 0 ? (
                <select
                  id="pc-model"
                  value={selectedModel}
                  onChange={(event) =>
                    setSelectedModel(event.target.value)
                  }
                  disabled={loading}
                >
                  {models.map((model) => (
                    <option value={model} key={model}>
                      {model}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="pc-inline-error">
                  {modelError || "No available models."}
                </div>
              )}
            </div>

            <div className="pc-field">
              <label htmlFor="pc-system-prompt">
                System Instructions
              </label>
              <textarea
                id="pc-system-prompt"
                rows={3}
                value={systemPrompt}
                onChange={(event) =>
                  setSystemPrompt(event.target.value)
                }
                placeholder="Define how the model should behave..."
                disabled={loading}
              />
            </div>

            <div className="pc-field">
              <label htmlFor="pc-test-prompt">Test Prompt</label>
              <textarea
                id="pc-test-prompt"
                rows={5}
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Enter the prompt you want to test..."
                disabled={loading}
              />
            </div>

            <div className="pc-execution-summary">
              <Info size={15} />
              <p>
                The selected model and parameter values are sent to the
                existing Playground API. Unsupported parameters may be
                rejected by the backend or provider.
              </p>
            </div>

            <button
              type="button"
              className="pc-run-button"
              onClick={() => void runTest()}
              disabled={
                loading ||
                modelsLoading ||
                models.length === 0 ||
                validationErrors.length > 0
              }
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="pc-spin" />
                  Running test...
                </>
              ) : (
                <>
                  <Play size={16} />
                  Run Parameter Test
                </>
              )}
            </button>
          </section>
        </main>

        <aside className="pc-sidebar">
          <section className="pc-card">
            <div className="pc-card-heading">
              <div>
                <h3>Current Configuration</h3>
                <p>Parameter values being tested.</p>
              </div>
            </div>

            {Object.entries(parameters).map(([key, value]) => (
              <div className="pc-config-row" key={key}>
                <span>
                  {key === "topP"
                    ? "Top P"
                    : key.replace(/([A-Z])/g, " $1")}
                </span>
                <strong>{value}</strong>
              </div>
            ))}
          </section>

          <section className="pc-card">
            <div className="pc-card-heading">
              <div>
                <h3>Execution Status</h3>
                <p>Latest test status.</p>
              </div>
            </div>

            <div className="pc-status-row">
              <span>Status</span>
              <strong>
                {loading
                  ? "Running"
                  : executionStatus === "completed"
                    ? "Completed"
                    : executionStatus === "failed"
                      ? "Failed"
                      : "Waiting"}
              </strong>
            </div>

            <div className="pc-status-row">
              <span>Model</span>
              <strong>{selectedModel || "Not selected"}</strong>
            </div>

            <div className="pc-status-row">
              <span>Parameters</span>
              <strong>{Object.keys(parameters).length} configured</strong>
            </div>

            <div className="pc-status-row">
              <span>Validation</span>
              <strong>
                {validationErrors.length === 0 ? "Valid" : "Invalid"}
              </strong>
            </div>
          </section>

          <section className="pc-card">
            <div className="pc-card-heading">
              <div>
                <h3>Execution Metrics</h3>
                <p>Values returned by the backend.</p>
              </div>
            </div>

            <div className="pc-metric">
              <span>Total Tokens</span>
              <strong>
                {metrics.tokens !== undefined
                  ? metrics.tokens.toLocaleString()
                  : "—"}
              </strong>
            </div>

            <div className="pc-metric">
              <span>Cost</span>
              <strong>
                {metrics.cost !== undefined
                  ? String(metrics.cost)
                  : "—"}
              </strong>
            </div>

            <div className="pc-metric">
              <span>Latency</span>
              <strong>
                {metrics.latency !== undefined
                  ? `${metrics.latency} ms`
                  : "—"}
              </strong>
            </div>
          </section>
        </aside>
      </div>

      {error && (
        <div className="pc-error" role="alert">
          <AlertCircle size={16} />
          <div>
            <strong>Execution failed</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <section className="pc-card pc-response">
        <div className="pc-card-heading">
          <div>
            <h3>
              {executionStatus === "completed" && (
                <CheckCircle2 size={16} />
              )}
              Model Response
            </h3>
            <p>Actual response received from the backend.</p>
          </div>

          <span className="pc-response-status">
            {loading
              ? "Executing"
              : response
                ? "Response received"
                : "No response"}
          </span>
        </div>

        <div className="pc-response-body">
          {loading ? (
            <div className="pc-loading-text">
              <Loader2 size={18} className="pc-spin" />
              Waiting for model response...
            </div>
          ) : response ? (
            <pre>{response}</pre>
          ) : (
            <div className="pc-empty">
              Adjust the parameters and run a test to see the model response.
            </div>
          )}
        </div>
      </section>

      <div className="pc-api-note">
        <strong>API Endpoint</strong>
        <code>POST /api/playground/chat</code>
        <span>
          Parameter support depends on the selected model provider.
        </span>
      </div>
    </div>
  );
}
