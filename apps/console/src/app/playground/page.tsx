import { useState, type FormEvent } from "react";
import { AlertCircle, Clock3, RefreshCw, Send, TerminalSquare } from "lucide-react";
import { api, ApiError } from "../../lib/api.js";
import ModelSelector from "../../components/playground/ModelSelector.jsx";
import PromptEditor from "../../components/playground/PromptEditor.jsx";
import ResponseViewer from "../../components/playground/ResponseViewer.jsx";
import Spinner from "../../components/loading/Spinner.jsx";

function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error) return error.message;
  return "An unexpected error occurred while contacting the API.";
}

function formatResponse(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2) ?? String(value);
  } catch {
    return String(value);
  }
}

export default function PlaygroundPage() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("");
  const [response, setResponse] = useState<unknown>(null);
  const [hasResponse, setHasResponse] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [duration, setDuration] = useState<number | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const message = prompt.trim();
    if (!message || busy) return;

    setBusy(true);
    setError("");
    setResponse(null);
    setHasResponse(false);
    setDuration(null);

    const started = performance.now();

    try {
      const body: Record<string, string> = { message };
      if (model.trim()) body.model = model.trim();

      const result = await api.post("/api/v1/chat", body);
      setResponse(result);
      setHasResponse(true);
    } catch (cause) {
      setError(getErrorMessage(cause));
    } finally {
      setDuration(Math.round(performance.now() - started));
      setBusy(false);
    }
  }

  return (
    <div className="page-stack">
      <header className="page-heading">
        <div>
          <div className="page-eyebrow">DEVELOPMENT WORKSPACE</div>
          <h1>Playground</h1>
          <p>Test prompts against the authenticated ModelNow chat API.</p>
        </div>
      </header>

      <div className="notice" role="note">
        <TerminalSquare size={18} aria-hidden="true" />
        <div>
          <strong>Live API execution</strong>
          <p>
            Requests are sent to <code>POST /api/v1/chat</code>. Authentication,
            model routing, quotas, and runtime availability are enforced by the server.
            Do not submit secrets or sensitive customer data.
          </p>
        </div>
      </div>

      <form className="playground-layout" onSubmit={submit}>
        <section className="form-card" aria-labelledby="playground-request-heading">
          <h2 id="playground-request-heading">Request</h2>

          <ModelSelector
            label="Model ID (optional)"
            models={[]}
            value={model}
            onChange={setModel}
            disabled={busy}
          />

          <PromptEditor
            label="Prompt"
            value={prompt}
            onChange={setPrompt}
            placeholder="Enter a non-sensitive test prompt..."
            rows={10}
            maxLength={20000}
            disabled={busy}
          />

          <div className="field-footer">
            <span aria-live="polite">
              {prompt.length.toLocaleString()} / 20,000 characters
            </span>
            <button
              className="button button--primary"
              type="submit"
              disabled={busy || !prompt.trim()}
            >
              {busy
                ? <RefreshCw size={15} className="spin" aria-hidden="true" />
                : <Send size={15} aria-hidden="true" />}
              {busy ? "Sending..." : "Send request"}
            </button>
          </div>
        </section>

        <section className="form-card result-card" aria-labelledby="playground-response-heading">
          <div className="result-card__heading">
            <h2 id="playground-response-heading">Response</h2>
            <span>
              {busy ? "Running" : error ? "Failed" : hasResponse ? "Received" : "Waiting"}
            </span>
          </div>

          {busy && (
            <div className="notice">
              <Spinner label="Waiting for the API response..." size={20} />
              <p>The server may reject the request if the runtime is unavailable.</p>
            </div>
          )}

          <ResponseViewer
            response={hasResponse ? formatResponse(response) : ""}
            loading={busy}
            error={error || undefined}
          />
          {!busy && !error && !hasResponse && (
            <p className="page-footnote">
              No response yet. Submit a prompt to inspect the actual API response.
            </p>
          )}

          {duration !== null && (
            <p className="page-footnote">
              <Clock3 size={14} aria-hidden="true" /> Client request duration: {duration.toLocaleString()} ms
            </p>
          )}
        </section>
      </form>

      <p className="page-footnote">
        Duration measures total client request time, not server inference latency.
        Token counts and model metrics are shown only if returned by the API.
      </p>
    </div>
  );
}