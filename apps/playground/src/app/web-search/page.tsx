
import { useEffect, useState } from "react";
import {
  Search,
  Globe,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  Loader2,
  Sparkles,
  ShieldCheck,
  Clock3,
  FileText,
} from "lucide-react";

import {
  getAvailableModels,
  testPlayground,
} from "../../services/playgroundApi";

import "./web-search.css";

type SearchSource = {
  title: string;
  url: string;
  snippet: string;
  domain: string;
};

function getResponseText(result: any): string {
  const output =
    result?.output ??
    result?.content ??
    result?.response ??
    result?.choices?.[0]?.message?.content ??
    result?.choices?.[0]?.text ??
    (typeof result?.data === "string" ? result.data : "");

  if (typeof output === "string") return output;

  if (output !== undefined && output !== null) {
    return JSON.stringify(output, null, 2);
  }

  return "The API returned no readable response.";
}

function getSources(result: any): SearchSource[] {
  const rawSources =
    result?.sources ??
    result?.citations ??
    result?.search_results ??
    result?.data?.sources ??
    result?.data?.citations ??
    [];

  if (!Array.isArray(rawSources)) return [];

  return rawSources
    .map((item: any) => {
      const url =
        item?.url ??
        item?.link ??
        item?.uri ??
        "";

      if (typeof url !== "string" || !url.startsWith("http")) {
        return null;
      }

      let domain = "";

      try {
        domain = new URL(url).hostname.replace(/^www\./, "");
      } catch {
        domain = "";
      }

      return {
        title: item?.title ?? item?.name ?? domain ?? "Web source",
        url,
        snippet:
          item?.snippet ??
          item?.description ??
          item?.content ??
          "",
        domain,
      };
    })
    .filter(Boolean) as SearchSource[];
}

export default function WebSearchPage() {
  const [models, setModels] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState("");

  const [query, setQuery] = useState("");
  const [domains, setDomains] = useState("");
  const [searchDepth, setSearchDepth] = useState("advanced");
  const [maxResults, setMaxResults] = useState("5");
  const [searchEnabled, setSearchEnabled] = useState(true);

  const [response, setResponse] = useState("");
  const [sources, setSources] = useState<SearchSource[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const [latency, setLatency] = useState<number | null>(null);
  const [responseModel, setResponseModel] = useState("");

  useEffect(() => {
    let active = true;

    async function loadModels() {
      try {
        const result: any = await getAvailableModels();

        const list = Array.isArray(result)
          ? result
          : result?.models ?? result?.data?.models ?? [];

        const names = list
          .map((item: any) =>
            typeof item === "string"
              ? item
              : item?.id ?? item?.name ?? item?.model
          )
          .filter(
            (item: unknown): item is string =>
              typeof item === "string" && item.length > 0
          );

        if (active) {
          setModels(names);

          if (names.length > 0) {
            setSelectedModel(names[0]);
          }
        }
      } catch {
        if (active) setModels([]);
      }
    }

    void loadModels();

    return () => {
      active = false;
    };
  }, []);

  async function handleSearch() {
    if (!query.trim()) {
      setError("Enter a question or search prompt.");
      return;
    }

    if (!selectedModel) {
      setError("Select an available model first.");
      return;
    }

    setLoading(true);
    setError("");
    setResponse("");
    setSources([]);
    setLatency(null);
    setResponseModel("");

    const startedAt = performance.now();

    try {
      const domainList = domains
        .split(",")
        .map((domain) => domain.trim())
        .filter(Boolean);

      const result: any = await testPlayground({
        input: query.trim(),
        model: selectedModel,
        webSearch: searchEnabled,
        searchOptions: {
          enabled: searchEnabled,
          depth: searchDepth,
          maxResults: Number(maxResults),
          domains: domainList,
        },
      });

      setLatency(
        Math.round(performance.now() - startedAt)
      );

      setResponse(getResponseText(result));
      setSources(getSources(result));
      setResponseModel(result?.model ?? selectedModel);
    } catch (err: any) {
      setError(
        err?.message ??
          "Web search request failed. Check the API connection and backend web-search support."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyResponse() {
    if (!response) return;

    try {
      await navigator.clipboard.writeText(response);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setError("Unable to copy the response.");
    }
  }

  function resetWorkspace() {
    setQuery("");
    setDomains("");
    setSearchDepth("advanced");
    setMaxResults("5");
    setSearchEnabled(true);
    setResponse("");
    setSources([]);
    setError("");
    setLatency(null);
    setResponseModel("");
    setCopied(false);
  }

  return (
    <div className="ws-page">
      {/* Duplicate Web Search Testing heading removed */}

      <div className="ws-status-banner">
        <Globe size={19} />

        <div>
          <strong>Web Search Playground</strong>
          <span>
            Compare AI answers with and without live web search.
          </span>
        </div>

        <span className={`ws-status ${searchEnabled ? "enabled" : ""}`}>
          {searchEnabled ? "Search enabled" : "Search disabled"}
        </span>
      </div>

      <div className="ws-layout">
        <section className="ws-panel ws-config">
          <div className="ws-panel-heading">
            <div>
              <h2>Search Configuration</h2>
              <p>Configure your web search experiment.</p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <Search size={19} />

              <button
                type="button"
                className="ws-reset"
                onClick={resetWorkspace}
                disabled={loading}
              >
                <RotateCcw size={15} />
                Reset
              </button>
            </div>
          </div>

          <div className="ws-field">
            <label htmlFor="ws-query">Search Prompt</label>

            <textarea
              id="ws-query"
              rows={5}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Example: What are the latest developments in AI infrastructure?"
              disabled={loading}
            />

            <small>
              Ask a question that may require up-to-date web information.
            </small>
          </div>

          <div className="ws-toggle-row">
            <div>
              <strong>Enable Web Search</strong>
              <small>Allow the model to retrieve web information.</small>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={searchEnabled}
              className={`ws-switch ${searchEnabled ? "on" : ""}`}
              onClick={() => setSearchEnabled((value) => !value)}
              disabled={loading}
            >
              <span />
            </button>
          </div>

          <div className="ws-field">
            <label htmlFor="ws-model">AI Model</label>

            <select
              id="ws-model"
              value={selectedModel}
              onChange={(event) => setSelectedModel(event.target.value)}
              disabled={models.length === 0 || loading}
            >
              {models.length === 0 && (
                <option value="">No models available</option>
              )}

              {models.map((model) => (
                <option key={model} value={model}>
                  {model}
                </option>
              ))}
            </select>
          </div>

          <div className="ws-field">
            <label htmlFor="ws-depth">Search Depth</label>

            <select
              id="ws-depth"
              value={searchDepth}
              onChange={(event) => setSearchDepth(event.target.value)}
              disabled={!searchEnabled || loading}
            >
              <option value="basic">Basic</option>
              <option value="advanced">Advanced</option>
            </select>

            <small>
              The backend must support the selected search depth.
            </small>
          </div>

          <div className="ws-field">
            <label htmlFor="ws-results">Maximum Search Results</label>

            <select
              id="ws-results"
              value={maxResults}
              onChange={(event) => setMaxResults(event.target.value)}
              disabled={!searchEnabled || loading}
            >
              <option value="3">3 results</option>
              <option value="5">5 results</option>
              <option value="10">10 results</option>
              <option value="15">15 results</option>
            </select>
          </div>

          <div className="ws-field">
            <label htmlFor="ws-domains">
              Preferred Domains <span>(Optional)</span>
            </label>

            <input
              id="ws-domains"
              type="text"
              value={domains}
              onChange={(event) => setDomains(event.target.value)}
              disabled={!searchEnabled || loading}
              placeholder="example.com, docs.example.com"
            />

            <small>Separate multiple domains with commas.</small>
          </div>

          <button
            type="button"
            className="ws-run-button"
            onClick={handleSearch}
            disabled={loading || models.length === 0}
          >
            {loading ? (
              <>
                <Loader2 size={17} className="ws-spin" />
                Searching and testing...
              </>
            ) : (
              <>
                <Search size={17} />
                Run Web Search Test
              </>
            )}
          </button>

          {error && (
            <div className="ws-error" role="alert">
              {error}
            </div>
          )}
        </section>

        <section className="ws-panel ws-results">
          <div className="ws-panel-heading">
            <div>
              <h2>Test Results</h2>
              <p>Inspect the model response and retrieved sources.</p>
            </div>

            <Sparkles size={19} />
          </div>

          {!response && !loading && (
            <div className="ws-empty">
              <div className="ws-empty-icon">
                <Globe size={27} />
              </div>

              <h3>Ready to search the web</h3>

              <p>
                Enter a prompt, choose a model, and run your
                experiment. The response and any returned sources
                will appear here.
              </p>
            </div>
          )}

          {loading && (
            <div className="ws-loading">
              <Loader2 size={29} className="ws-spin" />
              <strong>Running your experiment</strong>
              <span>
                Waiting for the model and search provider...
              </span>
            </div>
          )}

          {response && (
            <>
              <div className="ws-result-meta">
                <span>
                  <ShieldCheck size={14} />
                  Response received
                </span>

                <button
                  type="button"
                  onClick={copyResponse}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>

              <div className="ws-answer">
                <div className="ws-answer-title">AI Answer</div>
                <pre>{response}</pre>
              </div>

              <div className="ws-metrics">
                <div>
                  <small>Model</small>
                  <strong>{responseModel || selectedModel}</strong>
                </div>

                <div>
                  <small>Latency</small>
                  <strong>
                    {latency !== null ? `${latency} ms` : "—"}
                  </strong>
                </div>

                <div>
                  <small>Sources returned</small>
                  <strong>{sources.length}</strong>
                </div>
              </div>

              <div className="ws-source-section">
                <div className="ws-source-heading">
                  <FileText size={16} />
                  <h3>Sources and References</h3>
                  <span>{sources.length}</span>
                </div>

                {sources.length === 0 ? (
                  <div className="ws-no-sources">
                    No structured source links were returned by the API.
                    This does not prove that the provider performed no search.
                  </div>
                ) : (
                  <div className="ws-source-list">
                    {sources.map((source, index) => (
                      <article
                        className="ws-source-card"
                        key={`${source.url}-${index}`}
                      >
                        <div className="ws-source-number">
                          {index + 1}
                        </div>

                        <div className="ws-source-content">
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {source.title}
                            <ExternalLink size={13} />
                          </a>

                          {source.domain && (
                            <small>{source.domain}</small>
                          )}

                          {source.snippet && (
                            <p>{source.snippet}</p>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          <div className="ws-note">
            <Clock3 size={15} />
            <span>
              Search results, citations, and answer quality depend on
              the web-search provider and backend integration.
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}