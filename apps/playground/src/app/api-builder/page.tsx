import { useMemo, useState } from "react";
import "./api-builder.css";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

interface ApiResponse {
  status: number;
  statusText: string;
  duration: number;
  body: string;
  headers: Record<string, string>;
  ok: boolean;
}

const METHODS: HttpMethod[] = ["GET", "POST", "PUT", "PATCH", "DELETE"];

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

function quoteShell(value: string) {
  return `'${value.replace(/'/g, "'\\''")}'`;
}

export default function ApiBuilderPage() {
  const [method, setMethod] = useState<HttpMethod>("POST");
  const [url, setUrl] = useState(
    "https://jsonplaceholder.typicode.com/posts"
  );

  const [headersText, setHeadersText] = useState(
    JSON.stringify(DEFAULT_HEADERS, null, 2)
  );

  const [body, setBody] = useState(
    JSON.stringify(
      {
        title: "ModelNow API Test",
        body: "Testing API request builder",
        userId: 1,
      },
      null,
      2
    )
  );

  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"body" | "headers">("body");
  const [responseTab, setResponseTab] = useState<"body" | "headers">("body");
  const [copied, setCopied] = useState("");

  const parsedHeaders = useMemo(() => {
    try {
      const parsed = JSON.parse(headersText);

      if (
        !parsed ||
        Array.isArray(parsed) ||
        typeof parsed !== "object"
      ) {
        return null;
      }

      return parsed as Record<string, string>;
    } catch {
      return null;
    }
  }, [headersText]);

  const generatedFetch = useMemo(() => {
    const requestOptions: Record<string, unknown> = {
      method,
      headers: parsedHeaders || {},
    };

    if (method !== "GET" && method !== "DELETE") {
      requestOptions.body = body;
    }

    return `const response = await fetch(${JSON.stringify(
      url
    )}, ${JSON.stringify(requestOptions, null, 2)});

const data = await response.text();
console.log(response.status, data);`;
  }, [method, url, parsedHeaders, body]);

  const generatedCurl = useMemo(() => {
    const headerLines = Object.entries(parsedHeaders || {})
      .map(([key, value]) => `  -H ${quoteShell(`${key}: ${value}`)}`)
      .join(" \\\n");

    const bodyLine =
      method !== "GET" && method !== "DELETE"
        ? ` \\\n  --data-raw ${quoteShell(body)}`
        : "";

    return `curl -X ${method} ${quoteShell(url)}${
      headerLines ? ` \\\n${headerLines}` : ""
    }${bodyLine}`;
  }, [method, url, parsedHeaders, body]);

  async function copyText(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      window.setTimeout(() => setCopied(""), 1800);
    } catch {
      setError("Could not copy. Please copy the text manually.");
    }
  }

  async function sendRequest() {
    setError("");
    setResponse(null);

    if (!url.trim()) {
      setError("Enter an API endpoint URL.");
      return;
    }

    let parsedUrl: URL;

    try {
      parsedUrl = new URL(url.trim());
    } catch {
      setError(
        "Enter a valid absolute URL, including https:// or http://."
      );
      return;
    }

    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      setError("Only HTTP and HTTPS endpoints are supported.");
      return;
    }

    if (!parsedHeaders) {
      setError("Headers must be a valid JSON object.");
      return;
    }

    if (method !== "GET" && method !== "DELETE") {
      try {
        JSON.parse(body);
      } catch {
        setError("The request body is not valid JSON.");
        return;
      }
    }

    setLoading(true);
    const startedAt = performance.now();

    try {
      const requestHeaders = new Headers();

      Object.entries(parsedHeaders).forEach(([key, value]) => {
        requestHeaders.set(key, String(value));
      });

      const result = await fetch(parsedUrl.toString(), {
        method,
        headers: requestHeaders,
        ...(method !== "GET" && method !== "DELETE"
          ? { body }
          : {}),
      });

      const duration = Math.round(performance.now() - startedAt);
      const responseText = await result.text();

      let formattedBody = responseText;

      try {
        formattedBody = JSON.stringify(
          JSON.parse(responseText),
          null,
          2
        );
      } catch {
        // Keep non-JSON responses as plain text.
      }

      const responseHeaders: Record<string, string> = {};

      result.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      setResponse({
        status: result.status,
        statusText: result.statusText,
        duration,
        body: formattedBody || "(Empty response body)",
        headers: responseHeaders,
        ok: result.ok,
      });
    } catch (err) {
      const duration = Math.round(performance.now() - startedAt);

      const message =
        err instanceof Error
          ? err.message
          : "Unknown network error";

      setError(
        `Request failed after ${duration} ms: ${message}. The endpoint may be unavailable or may block browser requests through CORS.`
      );
    } finally {
      setLoading(false);
    }
  }

  function resetBuilder() {
    setMethod("POST");
    setUrl("https://jsonplaceholder.typicode.com/posts");

    setHeadersText(
      JSON.stringify(DEFAULT_HEADERS, null, 2)
    );

    setBody(
      JSON.stringify(
        {
          title: "ModelNow API Test",
          body: "Testing API request builder",
          userId: 1,
        },
        null,
        2
      )
    );

    setResponse(null);
    setError("");
    setActiveTab("body");
    setResponseTab("body");
    setCopied("");
  }

  return (
    <div className="ab-page">
      <section className="ab-request-panel">
        <div className="ab-section-heading">
          <div>
            <h2>Request configuration</h2>
            <p>Configure your endpoint and request parameters.</p>
          </div>

          <div className="ab-heading-status">
            <span className="ab-status-dot" />
            HTTP Client
          </div>

          <button
            type="button"
            className="ab-reset-btn"
            onClick={resetBuilder}
            disabled={loading}
          >
            Reset
          </button>
        </div>

        <div className="ab-url-row">
          <select
            className={`ab-method-select ab-method-${method.toLowerCase()}`}
            value={method}
            onChange={(event) =>
              setMethod(event.target.value as HttpMethod)
            }
            aria-label="HTTP method"
            disabled={loading}
          >
            {METHODS.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <input
            className="ab-url-input"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://api.example.com/endpoint"
            aria-label="Request URL"
            disabled={loading}
          />

          <button
            type="button"
            className="ab-send-btn"
            onClick={sendRequest}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send Request"}
          </button>
        </div>

        <div className="ab-editor-tabs">
          <button
            type="button"
            className={activeTab === "body" ? "active" : ""}
            onClick={() => setActiveTab("body")}
          >
            Body
            <span>JSON</span>
          </button>

          <button
            type="button"
            className={activeTab === "headers" ? "active" : ""}
            onClick={() => setActiveTab("headers")}
          >
            Headers
            <span>
              {Object.keys(parsedHeaders || {}).length}
            </span>
          </button>
        </div>

        {activeTab === "body" ? (
          <div className="ab-editor-area">
            <div className="ab-editor-toolbar">
              <span>Request body</span>
              <span>
                {method === "GET" || method === "DELETE"
                  ? "Not sent for this method"
                  : "application/json"}
              </span>
            </div>

            <textarea
              className="ab-code-editor"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              spellCheck={false}
              disabled={
                loading ||
                method === "GET" ||
                method === "DELETE"
              }
              aria-label="JSON request body"
            />
          </div>
        ) : (
          <div className="ab-editor-area">
            <div className="ab-editor-toolbar">
              <span>Request headers</span>
              <span>JSON object</span>
            </div>

            <textarea
              className="ab-code-editor"
              value={headersText}
              onChange={(event) =>
                setHeadersText(event.target.value)
              }
              spellCheck={false}
              disabled={loading}
              aria-label="Request headers JSON"
            />

            {!parsedHeaders && (
              <div className="ab-inline-error">
                Headers must contain valid JSON.
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="ab-error-message">
            <strong>Request error</strong>
            <span>{error}</span>
          </div>
        )}
      </section>

      <section className="ab-response-panel">
        <div className="ab-section-heading">
          <div>
            <h2>Response</h2>
            <p>Inspect the result returned by the endpoint.</p>
          </div>

          {response && (
            <div className="ab-response-actions">
              <button
                type="button"
                className="ab-copy-btn"
                onClick={() => copyText(response.body, "response")}
              >
                {copied === "response"
                  ? "Copied"
                  : "Copy response"}
              </button>
            </div>
          )}
        </div>

        {response ? (
          <>
            <div className="ab-response-metrics">
              <div className="ab-metric">
                <span>Status</span>
                <strong
                  className={response.ok ? "success" : "failure"}
                >
                  {response.status} {response.statusText}
                </strong>
              </div>

              <div className="ab-metric">
                <span>Duration</span>
                <strong>{response.duration} ms</strong>
              </div>

              <div className="ab-metric">
                <span>Result</span>
                <strong
                  className={response.ok ? "success" : "failure"}
                >
                  {response.ok ? "Success" : "HTTP Error"}
                </strong>
              </div>
            </div>

            <div className="ab-response-tabs">
              <button
                type="button"
                className={responseTab === "body" ? "active" : ""}
                onClick={() => setResponseTab("body")}
              >
                Response Body
              </button>

              <button
                type="button"
                className={
                  responseTab === "headers" ? "active" : ""
                }
                onClick={() => setResponseTab("headers")}
              >
                Response Headers
              </button>
            </div>

            <pre className="ab-response-code">
              {responseTab === "body"
                ? response.body
                : JSON.stringify(response.headers, null, 2)}
            </pre>
          </>
        ) : (
          <div className="ab-empty-response">
            <div className="ab-empty-icon">↗</div>
            <strong>No response yet</strong>
            <span>
              Configure your request and click Send Request to see the
              response here.
            </span>
          </div>
        )}
      </section>

      <section className="ab-code-panel">
        <div className="ab-section-heading">
          <div>
            <h2>Code snippets</h2>
            <p>Use the generated request in your application.</p>
          </div>
        </div>

        <div className="ab-snippet-card">
          <div className="ab-snippet-heading">
            <strong>cURL</strong>
            <button
              type="button"
              onClick={() => copyText(generatedCurl, "curl")}
            >
              {copied === "curl" ? "Copied" : "Copy"}
            </button>
          </div>

          <pre>{generatedCurl}</pre>
        </div>

        <div className="ab-snippet-card">
          <div className="ab-snippet-heading">
            <strong>JavaScript Fetch</strong>
            <button
              type="button"
              onClick={() => copyText(generatedFetch, "fetch")}
            >
              {copied === "fetch" ? "Copied" : "Copy"}
            </button>
          </div>

          <pre>{generatedFetch}</pre>
        </div>
      </section>

      <div className="ab-footer-note">
        <strong>Note:</strong> Response time measures the browser's
        complete request round trip, not just server processing time.
        Browser CORS restrictions may prevent requests to some external APIs.
      </div>
    </div>
  );
}