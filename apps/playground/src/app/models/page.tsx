
import { useEffect, useMemo, useState } from "react";
import {
  getAvailableModels,
  getAvailableProviders,
  testPlayground,
  type PlaygroundRunResponse,
} from "../../services/playgroundApi";
import "./models.css";

function extractResponseText(response: PlaygroundRunResponse): string {
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

function formatMetric(value: unknown, suffix = ""): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value}${suffix}`;
  }

  if (typeof value === "string" && value.trim()) {
    return `${value}${suffix}`;
  }

  return "Not returned";
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (
      error.message.includes("401") ||
      error.message.toLowerCase().includes("unauthorized")
    ) {
      return "Authentication is required. Connect the Playground to your real backend login before loading protected model endpoints.";
    }

    if (
      error.message.includes("403") ||
      error.message.toLowerCase().includes("forbidden")
    ) {
      return "The current account is not authorized to access the model catalogue.";
    }

    return error.message;
  }

  return "Unable to connect to the Playground API.";
}

export default function ModelsPage() {
  const [models, setModels] = useState<string[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");

  const [loadingCatalogue, setLoadingCatalogue] = useState(true);
  const [catalogueError, setCatalogueError] = useState("");

  const [testPrompt, setTestPrompt] = useState(
    "Explain the difference between small, medium and large language models with one practical example."
  );

  const [testOutput, setTestOutput] = useState("");
  const [testError, setTestError] = useState("");
  const [testLoading, setTestLoading] = useState(false);

  const [testMetrics, setTestMetrics] = useState<{
    latency: string;
    tokens: string;
    cost: string;
    returnedModel: string;
  } | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCatalogue() {
      setLoadingCatalogue(true);
      setCatalogueError("");

      try {
        const [availableModels, availableProviders] = await Promise.all([
          getAvailableModels(),
          getAvailableProviders(),
        ]);

        if (!active) return;

        const validModels = Array.isArray(availableModels)
          ? availableModels.filter(
              (model): model is string =>
                typeof model === "string" && model.trim().length > 0
            )
          : [];

        const validProviders = Array.isArray(availableProviders)
          ? availableProviders.filter(
              (provider): provider is string =>
                typeof provider === "string" &&
                provider.trim().length > 0
            )
          : [];

        setModels(validModels);
        setProviders(validProviders);

        setSelectedId((current) => {
          if (current && validModels.includes(current)) {
            return current;
          }

          return validModels[0] || "";
        });
      } catch (error: unknown) {
        if (!active) return;

        setCatalogueError(getErrorMessage(error));
        setModels([]);
        setProviders([]);
        setSelectedId("");
      } finally {
        if (active) {
          setLoadingCatalogue(false);
        }
      }
    }

    void loadCatalogue();

    return () => {
      active = false;
    };
  }, []);

  const filteredModels = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return models;

    return models.filter((model) =>
      model.toLowerCase().includes(term)
    );
  }, [models, search]);

  const selectedModel =
    models.find((model) => model === selectedId) || "";

  const handleTestModel = async () => {
    if (!selectedModel) {
      setTestError("Select an available backend model first.");
      return;
    }

    if (!testPrompt.trim()) {
      setTestError("Enter a prompt before testing the model.");
      return;
    }

    setTestLoading(true);
    setTestError("");
    setTestOutput("");
    setTestMetrics(null);

    try {
      const response = await testPlayground({
        input: testPrompt.trim(),
        model: selectedModel,
      });

      const output = extractResponseText(response);

      if (!output.trim()) {
        throw new Error(
          "The backend returned no readable response. Check its response format."
        );
      }

      setTestOutput(output);

      setTestMetrics({
        latency: formatMetric(response.latency, " ms"),
        tokens: formatMetric(
          response.usage?.totalTokens ?? response.tokens
        ),
        cost: formatMetric(response.cost),
        returnedModel: response.model || selectedModel,
      });
    } catch (error: unknown) {
      setTestError(getErrorMessage(error));
    } finally {
      setTestLoading(false);
    }
  };

  const reloadCatalogue = async () => {
    setLoadingCatalogue(true);
    setCatalogueError("");

    try {
      const [availableModels, availableProviders] = await Promise.all([
        getAvailableModels(),
        getAvailableProviders(),
      ]);

      const validModels = Array.isArray(availableModels)
        ? availableModels.filter(
            (model): model is string =>
              typeof model === "string" && model.trim().length > 0
          )
        : [];

      const validProviders = Array.isArray(availableProviders)
        ? availableProviders.filter(
            (provider): provider is string =>
              typeof provider === "string" &&
              provider.trim().length > 0
          )
        : [];

      setModels(validModels);
      setProviders(validProviders);

      setSelectedId((current) =>
        current && validModels.includes(current)
          ? current
          : validModels[0] || ""
      );

      setTestOutput("");
      setTestError("");
      setTestMetrics(null);
    } catch (error: unknown) {
      setCatalogueError(getErrorMessage(error));
      setModels([]);
      setProviders([]);
      setSelectedId("");
    } finally {
      setLoadingCatalogue(false);
    }
  };

  return (
    <main className="models-page">
      {/* Model statistics */}
      <section className="models-stats">
        <article className="models-stat-card">
          <span className="models-stat-symbol blue">▦</span>
          <div>
            <span>Available models</span>
            <strong>
              {loadingCatalogue ? "..." : models.length}
            </strong>
            <small>Returned by backend</small>
          </div>
        </article>

        <article className="models-stat-card">
          <span className="models-stat-symbol violet">P</span>
          <div>
            <span>Available providers</span>
            <strong>
              {loadingCatalogue ? "..." : providers.length}
            </strong>
            <small>Returned by backend</small>
          </div>
        </article>

        <article className="models-stat-card">
          <span className="models-stat-symbol green">✓</span>
          <div>
            <span>Selected model</span>
            <strong className="models-stat-selected">
              {selectedModel || "None"}
            </strong>
            <small>Current selection</small>
          </div>
        </article>

        <article className="models-stat-card">
          <span className="models-stat-symbol orange">↗</span>
          <div>
            <span>Test endpoint</span>
            <strong className="models-stat-selected">
              /playground/chat
            </strong>
            <small>POST request</small>
          </div>
        </article>
      </section>

      {/* Single model selection section */}
      <section className="models-catalogue">
        <div className="models-section-heading">
          <div>
            <h2>Available backend models</h2>
            <p>
              Choose one model from the models returned by the ModelNow API.
            </p>
          </div>

          <button
            type="button"
            onClick={reloadCatalogue}
            disabled={loadingCatalogue}
          >
            {loadingCatalogue ? "Loading..." : "Refresh models ↻"}
          </button>
        </div>

        {catalogueError && (
          <div className="models-test-error" role="alert">
            <strong>Unable to load model catalogue</strong>
            <p>{catalogueError}</p>
          </div>
        )}

        <div className="models-toolbar">
          <label className="models-search">
            <span aria-hidden="true">⌕</span>

            <input
              type="search"
              placeholder="Search available model IDs..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />

            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
              >
                ×
              </button>
            )}
          </label>

          <span className="models-toolbar-hint">
            Select a model to use in the testing workspace
          </span>
        </div>

        {loadingCatalogue ? (
          <div className="models-empty">
            <strong>Loading available models...</strong>
            <p>Contacting the ModelNow Playground API.</p>
          </div>
        ) : filteredModels.length > 0 ? (
          <div className="models-grid">
            {filteredModels.map((model) => (
              <button
                type="button"
                key={model}
                className={`model-card ${
                  selectedId === model ? "selected" : ""
                }`}
                onClick={() => {
                  setSelectedId(model);
                  setTestOutput("");
                  setTestError("");
                  setTestMetrics(null);
                }}
              >
                <div className="model-card-top">
                  <span className="model-category-mark">AI</span>
                  <span className="model-catalogue-label">
                    Backend model
                  </span>
                </div>

                <div className="model-card-title">
                  <h3>{model}</h3>
                  <span>Model ID</span>
                </div>

                <p className="model-description">
                  Model identifier returned by the configured backend.
                </p>

                <div className="model-card-footer">
                  <span>Available</span>
                  <span>
                    {selectedId === model
                      ? "Selected ✓"
                      : "Select →"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="models-empty">
            <strong>
              {models.length === 0
                ? "No backend models returned"
                : "No matching models found"}
            </strong>

            <p>
              {models.length === 0
                ? "Check backend availability and authentication."
                : "Try a different search term."}
            </p>

            {models.length > 0 && (
              <button
                type="button"
                onClick={() => setSearch("")}
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </section>

      {/* Model testing */}
      <section className="models-workbench">
        <div className="models-workbench-heading">
          <div>
            <span className="models-eyebrow">SELECTED MODEL</span>
            <h2>Model testing</h2>
            <p>
              Submit a prompt to test the model selected above.
            </p>
          </div>
        </div>

        <div className="models-workbench-grid">
          <div className="models-detail-panel">
            <div className="models-selected-title">
              <div>
                <h3>{selectedModel || "No model selected"}</h3>

                <span>
                  {selectedModel
                    ? "Selected backend model"
                    : "Select a model from the catalogue above"}
                </span>
              </div>

              <span className="models-preview-status">
                {selectedModel ? "Backend listed" : "Not selected"}
              </span>
            </div>

            <div className="models-spec-grid">
              <div>
                <span>Model ID</span>
                <strong>{selectedModel || "—"}</strong>
              </div>

              <div>
                <span>Availability</span>
                <strong>
                  {selectedModel ? "Listed by API" : "Unknown"}
                </strong>
              </div>

              <div>
                <span>Providers</span>
                <strong>{providers.length}</strong>
              </div>

              <div>
                <span>Category</span>
                <strong>Not supplied</strong>
              </div>
            </div>

            <div className="models-detail-block">
              <h4>Backend providers</h4>

              {providers.length > 0 ? (
                <div className="model-tags">
                  {providers.map((provider) => (
                    <span key={provider}>{provider}</span>
                  ))}
                </div>
              ) : (
                <p>No providers returned by the backend.</p>
              )}
            </div>
          </div>

          <div className="models-test-panel">
            <div className="models-test-heading">
              <div>
                <h3>Test selected model</h3>
                <p>
                  Send a real request through the Playground API.
                </p>
              </div>

              <span className="models-api-chip">API TEST</span>
            </div>

            <label
              className="models-prompt-label"
              htmlFor="model-test-prompt"
            >
              Test prompt
            </label>

            <textarea
              id="model-test-prompt"
              value={testPrompt}
              onChange={(event) => setTestPrompt(event.target.value)}
              placeholder="Enter a prompt to test this model..."
              rows={5}
            />

            <div className="models-test-request-info">
              <span>
                Model: <strong>{selectedModel || "Not selected"}</strong>
              </span>

              <span>
                Method: <strong>POST</strong>
              </span>

              <span>
                Endpoint: <strong>/playground/chat</strong>
              </span>
            </div>

            <button
              type="button"
              className="models-test-button"
              onClick={handleTestModel}
              disabled={
                testLoading ||
                !selectedModel ||
                !testPrompt.trim()
              }
            >
              {testLoading ? "Testing model..." : "Run model test →"}
            </button>

            {testError && (
              <div className="models-test-error" role="alert">
                <strong>Test request failed</strong>
                <p>{testError}</p>
              </div>
            )}

            {testOutput && (
              <div className="models-test-result">
                <div className="models-result-heading">
                  <strong>Model response</strong>
                  <span>Response received</span>
                </div>

                <pre>{testOutput}</pre>

                {testMetrics && (
                  <div className="models-result-metrics">
                    <div>
                      <span>Latency</span>
                      <strong>{testMetrics.latency}</strong>
                    </div>

                    <div>
                      <span>Tokens</span>
                      <strong>{testMetrics.tokens}</strong>
                    </div>

                    <div>
                      <span>Cost</span>
                      <strong>{testMetrics.cost}</strong>
                    </div>

                    <div>
                      <span>Returned model</span>
                      <strong>{testMetrics.returnedModel}</strong>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <p className="models-footnote">
        Model categories and task capabilities are not currently
        returned by the available model-list API. They are therefore
        not inferred or displayed as verified backend metadata.
      </p>
    </main>
  );
}
