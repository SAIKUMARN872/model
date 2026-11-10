import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Check, Copy, KeyRound, LoaderCircle, ShieldCheck } from "lucide-react";
import { api } from "../../lib/api.js";
import { getResourceEndpoint } from "../../config/console.js";

type ApiEnvelope = {
  success?: unknown;
  data?: unknown;
};

type CreatedApiKey = {
  key: string;
  name?: string;
};

type CreateApiKeyBody = {
  name: string;
  expiresAt?: string;
};

function readData(payload: unknown): unknown {
  if (
    !payload ||
    typeof payload !== "object" ||
    !("success" in payload) ||
    (payload as ApiEnvelope).success !== true ||
    !("data" in payload)
  ) {
    throw new Error("The API returned an unexpected response.");
  }

  return (payload as ApiEnvelope).data;
}

function isCreatedApiKey(value: unknown): value is CreatedApiKey {
  return (
    !!value &&
    typeof value === "object" &&
    "key" in value &&
    typeof value.key === "string" &&
    value.key.length > 0
  );
}

export default function CreateApiKeyPage() {
  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [configurationError, setConfigurationError] = useState("");
  const [name, setName] = useState("");
  const [expiryDays, setExpiryDays] = useState("30");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [secret, setSecret] = useState<string | null>(null);
  const [createdName, setCreatedName] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const configured = getResourceEndpoint("apiKeys");
      if (!configured) {
        setConfigurationError(
          "Set VITE_CONSOLE_ENDPOINT_API_KEYS to the API-key route path before creating keys."
        );
        return;
      }
      setEndpoint(configured);
    } catch (cause) {
      setConfigurationError(
        cause instanceof Error
          ? cause.message
          : "Invalid API-key endpoint configuration."
      );
    }
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!endpoint || creating) return;

    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length > 100) {
      setError("Enter a key name between 1 and 100 characters.");
      return;
    }

    if (!["30", "60", "90", "unlimited"].includes(expiryDays)) {
      setError("Choose a valid expiry option.");
      return;
    }

    const body: CreateApiKeyBody = { name: trimmedName };
    if (expiryDays !== "unlimited") {
      const days = Number(expiryDays);
      body.expiresAt = new Date(
        Date.now() + days * 24 * 60 * 60 * 1000
      ).toISOString();
    }

    setCreating(true);
    setError("");
    setSecret(null);
    setCreatedName("");
    setCopied(false);

    try {
      const result = readData(await api.post(endpoint, body));
      if (!isCreatedApiKey(result)) {
        throw new Error(
          "The server did not return a new key secret. Check the API-key list before retrying."
        );
      }

      setSecret(result.key);
      setCreatedName(
        typeof result.name === "string" ? result.name : trimmedName
      );
      setName("");
      setExpiryDays("30");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not create API key."
      );
    } finally {
      setCreating(false);
    }
  }

  async function copySecret() {
    if (!secret) return;

    try {
      await navigator.clipboard.writeText(secret);
      setCopied(true);
      setError("");
    } catch {
      setError("Clipboard access failed. Select and copy the secret manually.");
    }
  }

  return (
    <main className="mn-dashboard mn-page">
      <Link to="/api-keys" className="mn-back-link">
        <ArrowLeft size={16} /> API keys
      </Link>

      <header className="mn-page__header">
        <span className="mn-resource__icon">
          <KeyRound size={22} />
        </span>
        <div>
          <h1>Create API key</h1>
          <p className="mn-muted">
            Create a credential for applications using ModelNow.
          </p>
        </div>
      </header>

      {configurationError ? (
        <p className="mn-error" role="alert">{configurationError}</p>
      ) : null}

      {error ? <p className="mn-error" role="alert">{error}</p> : null}

      {secret ? (
        <section className="mn-panel" aria-labelledby="mn-created-key-heading">
          <h2 id="mn-created-key-heading">
            <Check size={18} /> API key created
          </h2>
          <p>
            <strong>{createdName}</strong>
          </p>
          <p className="mn-muted">
            Copy this secret now. It will not be shown again after you leave
            this page.
          </p>
          <label htmlFor="mn-created-api-key">API key secret</label>
          <input
            id="mn-created-api-key"
            type="text"
            value={secret}
            readOnly
            autoComplete="off"
            spellCheck={false}
          />
          <button type="button" onClick={() => void copySecret()}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy secret"}
          </button>
          <p>
            <Link to="/api-keys">Return to API-key management</Link>
          </p>
        </section>
      ) : (
        <section className="mn-panel">
          <form onSubmit={handleSubmit}>
            <label htmlFor="mn-create-api-key-name">Key name</label>
            <input
              id="mn-create-api-key-name"
              name="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              minLength={1}
              maxLength={100}
              autoComplete="off"
              required
              disabled={creating}
              placeholder="e.g. Production application"
            />

            <label htmlFor="mn-create-api-key-expiry">Expiry</label>
            <select
              id="mn-create-api-key-expiry"
              name="expiryDays"
              value={expiryDays}
              onChange={(event) => setExpiryDays(event.target.value)}
              disabled={creating}
            >
              <option value="30">30 days</option>
              <option value="60">60 days</option>
              <option value="90">90 days</option>
              <option value="unlimited">Unlimited</option>
            </select>

            <div className="mn-panel" aria-label="API key access information">
              <ShieldCheck size={20} />
              <div>
                <strong>Permission</strong>
                <p>Inference API — inference:invoke</p>
                <p className="mn-muted">
                  The backend assigns this permission. Workspace-level key
                  ownership is not configured by this form.
                </p>
              </div>
            </div>

            <button
              type="submit"
              disabled={!endpoint || creating || Boolean(configurationError)}
            >
              {creating ? (
                <LoaderCircle size={16} />
              ) : (
                <KeyRound size={16} />
              )}
              {creating ? "Creating..." : "Create API key"}
            </button>
          </form>
        </section>
      )}
    </main>
  );
}