import React, { useCallback, useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Copy,
  KeyRound,
  LoaderCircle,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2
} from "lucide-react";
import { api } from "../../lib/api.js";
import { getResourceEndpoint } from "../../config/console.js";

function readData(payload) {
  if (!payload || payload.success !== true || !("data" in payload)) {
    throw new Error("The API returned an unexpected response.");
  }
  return payload.data;
}

function formatDate(value) {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Unknown" : date.toLocaleString();
}

function isExpired(key) {
  return Boolean(key.expiresAt && new Date(key.expiresAt).getTime() <= Date.now());
}

function keyStatus(key) {
  if (key.revokedAt) return "Revoked";
  if (isExpired(key)) return "Expired";
  return "Active";
}

export default function ApiKeysPage() {
  const location = useLocation();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [endpoint, setEndpoint] = useState(null);
  const [configurationError, setConfigurationError] = useState("");
  const [keys, setKeys] = useState([]);
  const [name, setName] = useState("");
  const [expiryDays, setExpiryDays] = useState("30");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [newSecret, setNewSecret] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("create") === "1") {
      setError("");
      setNotice("");
      setName("");
      setExpiryDays("30");
      setCreateModalOpen(true);
    }
  }, [location.search]);
  useEffect(() => {
    try {
      const configured = getResourceEndpoint("apiKeys");
      if (!configured) {
        setConfigurationError(
          "Set VITE_CONSOLE_ENDPOINT_API_KEYS to the API-key route path before using this page."
        );
        return;
      }
      setEndpoint(configured);
    } catch (cause) {
      setConfigurationError(
        cause instanceof Error ? cause.message : "Invalid API-key endpoint configuration."
      );
    }
  }, []);

  const loadKeys = useCallback(async () => {
    if (!endpoint) return;
    setLoading(true);
    setError("");
    try {
      const data = readData(await api.get(endpoint));
      if (!Array.isArray(data)) {
        throw new Error("The API returned an invalid API-key list.");
      }
      setKeys(data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load API keys.");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    void loadKeys();
  }, [loadKeys]);

  async function createKey(event) {
    event.preventDefault();
    if (!endpoint || creating) return;

    setCreating(true);
    setError("");
    setNotice("");
    setNewSecret(null);
    setCopied(false);

    try {
      const body = { name: name.trim() };
      if (expiryDays !== "unlimited") {
        const days = Number(expiryDays);
        if (![30, 60, 90].includes(days)) {
          throw new Error("Choose a valid API-key expiry.");
        }
        body.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
      }

      const created = readData(await api.post(endpoint, body));
      if (!created || typeof created.key !== "string" || !created.key) {
        throw new Error("The server did not return a new key secret. Check the key list before retrying.");
      }

      setNewSecret({
        key: created.key,
        name: typeof created.name === "string" ? created.name : body.name
      });
      setName("");
      setExpiryDays("30");
      setNotice("API key created. Copy the secret now; it will not be shown again.");
      await loadKeys();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create API key.");
    } finally {
      setCreating(false);
    }
  }

  async function rotateKey(key) {
    if (!endpoint || busyId) return;
    if (!window.confirm(`Rotate "${key.name}"? The current secret will be replaced.`)) return;

    setBusyId(key.id);
    setError("");
    setNotice("");
    setNewSecret(null);
    setCopied(false);

    try {
      const data = readData(await api.post(`${endpoint}/${encodeURIComponent(key.id)}/rotate`, {}));
      if (!data || typeof data.key !== "string" || !data.key) {
        throw new Error("The server did not return the replacement secret.");
      }
      setNewSecret({
        key: data.key,
        name: typeof data.name === "string" ? data.name : key.name
      });
      setNotice("Key rotated. Copy the replacement secret now.");
      await loadKeys();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not rotate API key.");
    } finally {
      setBusyId(null);
    }
  }

  async function revokeKey(key) {
    if (!endpoint || busyId) return;
    if (!window.confirm(`Revoke "${key.name}"? Applications using this key will lose access.`)) return;

    setBusyId(key.id);
    setError("");
    setNotice("");
    setNewSecret(null);

    try {
      readData(await api.delete(`${endpoint}/${encodeURIComponent(key.id)}`));
      setNotice(`"${key.name}" was revoked.`);
      await loadKeys();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not revoke API key.");
    } finally {
      setBusyId(null);
    }
  }

  async function copySecret() {
    if (!newSecret?.key) return;
    try {
      await navigator.clipboard.writeText(newSecret.key);
      setCopied(true);
    } catch {
      setError("Clipboard access failed. Select and copy the secret manually.");
    }
  }

  return (
    <main className="mn-dashboard mn-page">
      <Link to="/" className="mn-back-link">
        <ArrowLeft size={16} /> Dashboard
      </Link>

      <header className="mn-page__header">
        <span className="mn-resource__icon"><KeyRound size={22} /></span>
        <div>
          <h1>API keys</h1>
          <p className="mn-muted">Manage credentials for applications using ModelNow.</p>
        </div>
      </header>

      <section className="mn-panel mn-key-panel">
        <ShieldCheck size={25} />
        <div>
          <h2>Credential security</h2>
          <p>Secrets are shown only when created or rotated. Store them securely; never commit them to source control or share them publicly.</p>
        </div>
      </section>

      {configurationError ? <p className="mn-error" role="alert">{configurationError}</p> : null}
      {error ? <p className="mn-error" role="alert">{error}</p> : null}
      {notice ? <p role="status" aria-live="polite">{notice}</p> : null}

      {newSecret ? (
        <section className="mn-panel" aria-labelledby="new-secret-heading">
          <h2 id="new-secret-heading">Your new API key</h2>
          <p><strong>{newSecret.name}</strong> Ã¢â‚¬â€ copy this secret now. It will not be available after you leave this page or dismiss this section.</p>
          <label htmlFor="mn-new-api-key">Secret</label>
          <input
            id="mn-new-api-key"
            type="text"
            readOnly
            value={newSecret.key}
            autoComplete="off"
            spellCheck="false"
            aria-label="New API key secret"
          />
          <button type="button" onClick={() => void copySecret()}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy secret"}
          </button>
          <button type="button" onClick={() => setNewSecret(null)}>Dismiss secret</button>
        </section>
      ) : null}

      {createModalOpen ? (
        <div className="mn-modal-backdrop" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setCreateModalOpen(false);
        }}>
          <section className="mn-panel" role="dialog" aria-modal="true" aria-labelledby="mn-create-api-key-title">
            <div className="mn-page__header">
              <h2 id="mn-create-api-key-title">Create an API key</h2>
              <button type="button" onClick={() => setCreateModalOpen(false)}>Close</button>
            </div>
            
        <form onSubmit={createKey}>
          <label htmlFor="mn-api-key-name">Key name</label>
          <input
            id="mn-api-key-name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            minLength={1}
            maxLength={100}
            required
            autoComplete="off"
            placeholder="e.g. Production inference"
          />

          <label htmlFor="mn-api-key-expiry">Expiry</label>
          <select
            id="mn-api-key-expiry"
            name="expiryDays"
            value={expiryDays}
            onChange={(event) => setExpiryDays(event.target.value)}
          >
            <option value="30">30 days</option>
            <option value="60">60 days</option>
            <option value="90">90 days</option>
            <option value="unlimited">Unlimited</option>
          </select>

          <button type="submit" disabled={!endpoint || creating}>
            {creating ? <LoaderCircle size={16} /> : <Plus size={16} />}
            {creating ? "CreatingÃ¢â‚¬Â¦" : "Create API key"}
          </button>
        </form>
          </section>
        </div>
      ) : null}

      <div className="mn-dashboard__actions">
        <button type="button" className="mn-action mn-action--primary" onClick={() => {
          setError("");
          setNotice("");
          setName("");
          setExpiryDays("30");
          setCreateModalOpen(true);
        }}>
          <Plus size={16} /> Create API key
        </button>
      </div>
      <section className="mn-panel">
        <div className="mn-page__header">
          <div>
            <h2>Your API keys</h2>
            <p className="mn-muted">Secrets are never returned by the list endpoint.</p>
          </div>
          <button type="button" onClick={() => void loadKeys()} disabled={!endpoint || loading}>
            {loading ? <LoaderCircle size={16} /> : <RefreshCw size={16} />}
            Refresh
          </button>
        </div>

        {loading && keys.length === 0 ? <p>Loading API keysÃ¢â‚¬Â¦</p> : null}
        {!loading && !error && endpoint && keys.length === 0 ? <p>No API keys found.</p> : null}

        {keys.length > 0 ? (
          <div className="mn-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Prefix</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Last used</th>
                  <th>Expires</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((key) => {
                  const status = keyStatus(key);
                  const active = status === "Active";
                  return (
                    <tr key={key.id}>
                      <td>{key.name}</td>
                      <td><code>{key.keyPrefix || "Ã¢â‚¬â€"}</code></td>
                      <td>{status}</td>
                      <td>{formatDate(key.createdAt)}</td>
                      <td>{formatDate(key.lastUsedAt)}</td>
                      <td>{formatDate(key.expiresAt)}</td>
                      <td>
                        {active ? (
                          <>
                            <button
                              type="button"
                              onClick={() => void rotateKey(key)}
                              disabled={Boolean(busyId)}
                              aria-label={`Rotate ${key.name}`}
                            >
                              {busyId === key.id ? <LoaderCircle size={16} /> : <RefreshCw size={16} />}
                              Rotate
                            </button>
                            <button
                              type="button"
                              onClick={() => void revokeKey(key)}
                              disabled={Boolean(busyId)}
                              aria-label={`Revoke ${key.name}`}
                            >
                              <Trash2 size={16} /> Revoke
                            </button>
                          </>
                        ) : <span className="mn-muted">No actions</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>
    </main>
  );
}