import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertCircle, Database, RefreshCw, Search } from "lucide-react";
import { api, ApiError } from "../../lib/api.js";
import { getResourceEndpoint } from "../../config/console.js";

type PromptRecord = Record<string, unknown>;

type LoadState = {
  loading: boolean;
  loaded: boolean;
  error: string;
};

function errorText(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "Unable to load prompt records.";
}

function asRecordArray(value: unknown): PromptRecord[] | null {
  if (Array.isArray(value)) {
    if (!value.every((item) =>
      item !== null && typeof item === "object" && !Array.isArray(item)
    )) return null;
    return value as PromptRecord[];
  }

  if (!value || typeof value !== "object") return null;
  const object = value as Record<string, unknown>;

  for (const key of ["data", "items", "results", "prompts"]) {
    const candidate = object[key];

    if (Array.isArray(candidate)) return asRecordArray(candidate);

    if (candidate && typeof candidate === "object" && !Array.isArray(candidate)) {
      const nested = candidate as Record<string, unknown>;
      for (const nestedKey of ["items", "results", "prompts"]) {
        if (Array.isArray(nested[nestedKey])) {
          return asRecordArray(nested[nestedKey]);
        }
      }
    }
  }

  return null;
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  try {
    return JSON.stringify(value);
  } catch {
    return "[unavailable]";
  }
}

function displayLabel(key: string): string {
  return key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function PromptsPage() {
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [configurationError, setConfigurationError] = useState("");
  const [state, setState] = useState<LoadState>({
    loading: false,
    loaded: false,
    error: ""
  });
  const [records, setRecords] = useState<PromptRecord[] | null>(null);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PromptRecord | null>(null);

  useEffect(() => {
    try {
      setEndpoint(getResourceEndpoint("prompts"));
      setConfigurationError("");
    } catch (cause) {
      setEndpoint(null);
      setConfigurationError(errorText(cause));
    }
  }, []);

  const load = useCallback(async () => {
    if (!endpoint) return;

    setState({ loading: true, loaded: false, error: "" });
    setRecords(null);
    setSelected(null);

    try {
      const payload = await api.get(endpoint);
      const result = asRecordArray(payload);

      if (result === null) {
        setState({
          loading: false,
          loaded: true,
          error: "The endpoint returned an unsupported response format."
        });
        return;
      }

      setRecords(result);
      setState({ loading: false, loaded: true, error: "" });
    } catch (cause) {
      setState({ loading: false, loaded: false, error: errorText(cause) });
    }
  }, [endpoint]);

  useEffect(() => {
    if (endpoint) void load();
  }, [endpoint, load]);

  const filtered = useMemo(() => {
    if (!records) return [];
    const needle = query.trim().toLowerCase();
    if (!needle) return records;

    return records.filter((record) =>
      Object.entries(record).some(([key, value]) =>
        `${key} ${displayValue(value)}`.toLowerCase().includes(needle)
      )
    );
  }, [records, query]);

  const columns = useMemo(() => {
    if (!records?.length) return [];

    const preferred = [
      "name", "title", "id", "version", "status",
      "updatedAt", "updated_at", "createdAt", "created_at"
    ];
    const keys = Array.from(new Set(records.flatMap((record) => Object.keys(record))));

    return [
      ...preferred.filter((key) => keys.includes(key)),
      ...keys.filter((key) => !preferred.includes(key))
    ].slice(0, 7);
  }, [records]);

  return (
    <div className="page-stack">
      <header className="page-heading">
        <div>
          <div className="page-eyebrow">PROMPT STUDIO</div>
          <h1>Prompts</h1>
          <p>Inspect prompt records returned by the configured ModelNow API.</p>
        </div>
        <button
          type="button"
          className="button button--secondary"
          onClick={() => void load()}
          disabled={!endpoint || state.loading}
        >
          <RefreshCw size={15} className={state.loading ? "spin" : ""} aria-hidden="true" />
          Refresh
        </button>
      </header>

      <div className="resource-summary">
        <div className="resource-summary__icon">
          <Database size={22} aria-hidden="true" />
        </div>
        <div>
          <strong>Backend-backed prompt records</strong>
          <p>Only records returned by the configured endpoint are displayed.</p>
        </div>
        <div className="resource-summary__right">
          {state.loading ? <span>Loading</span> :
            state.error || configurationError ? <span>Request failed</span> :
            state.loaded ? <span>Response received</span> :
            <span>Not configured</span>}
        </div>
      </div>

      {configurationError && (
        <div className="notice notice--error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <div>
            <strong>Invalid endpoint configuration</strong>
            <p>{configurationError}</p>
          </div>
        </div>
      )}

      {!endpoint && !configurationError && (
        <div className="notice">
          <Database size={18} aria-hidden="true" />
          <div>
            <strong>Prompt API endpoint not configured</strong>
            <p>
              Configure <code>VITE_CONSOLE_ENDPOINT_PROMPTS</code> with a verified same-origin
              API path and restart the console. No placeholder prompt records are generated.
            </p>
          </div>
        </div>
      )}

      {state.error && (
        <div className="notice notice--error" role="alert">
          <AlertCircle size={18} aria-hidden="true" />
          <div>
            <strong>Unable to load prompts</strong>
            <p>{state.error}</p>
          </div>
        </div>
      )}

      {state.loading && <div className="table-empty" role="status">Loading prompt records…</div>}

      {state.loaded && records === null && state.error && (
        <div className="table-empty">No records available until the API request succeeds.</div>
      )}

      {state.loaded && records && records.length === 0 && (
        <div className="table-empty">The API returned no prompt records.</div>
      )}

      {state.loaded && records && records.length > 0 && (
        <section className="data-card" aria-label="Prompt records">
          <div className="data-card__toolbar">
            <div className="data-card__count">
              {filtered.length} of {records.length} record{records.length === 1 ? "" : "s"}
            </div>
            <label className="table-search">
              <Search size={15} aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter returned prompts"
                aria-label="Filter prompt records"
              />
            </label>
          </div>

          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {columns.map((column) => <th key={column}>{displayLabel(column)}</th>)}
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((record, index) => {
                  const identity = displayValue(
                    record.id ?? record.key ?? record.name ?? record.title ?? index
                  );

                  return (
                    <tr key={identity}>
                      {columns.map((column) => (
                        <td key={column}>
                          <span title={displayValue(record[column])}>
                            {displayValue(record[column])}
                          </span>
                        </td>
                      ))}
                      <td>
                        <button
                          type="button"
                          className="button button--secondary"
                          onClick={() => setSelected(record)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 && (
            <div className="table-empty">No records match your filter.</div>
          )}
        </section>
      )}

      {selected && (
        <section className="form-card" aria-labelledby="prompt-detail-heading">
          <div className="result-card__heading">
            <h2 id="prompt-detail-heading">Prompt details</h2>
            <button
              type="button"
              className="button button--secondary"
              onClick={() => setSelected(null)}
            >
              Close
            </button>
          </div>
          <pre className="response-json">{displayValue(selected)}</pre>
        </section>
      )}

      <p className="page-footnote">
        This page is read-only until a verified prompt mutation API is connected.
        It does not claim to create, edit, delete, or persist prompts.
      </p>
    </div>
  );
}