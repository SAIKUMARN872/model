import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Copy,
  KeyRound,
  LoaderCircle,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  X
} from "lucide-react";
import { api } from "../../lib/api.js";
import { getResourceEndpoint } from "../../config/console.js";

type KeyRecord = {
  id: string;
  name: string;
  keyPrefix?: string | null;
  userId?: string | null;
  organizationId?: string | null;
  scopes?: string[];
  createdAt?: string | null;
  lastUsedAt?: string | null;
  expiresAt?: string | null;
  revokedAt?: string | null;
};

type CreatedSecret = { key: string; name: string };

function readData(payload: unknown): unknown {
  if (
    !payload ||
    typeof payload !== "object" ||
    !("success" in payload) ||
    payload.success !== true ||
    !("data" in payload)
  ) {
    throw new Error("The API returned an unexpected response.");
  }
  return payload.data;
}

function dateValue(value?: string | null): number | null {
  if (!value) return null;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

function formatDate(value?: string | null): string {
  if (!value) return "Never";
  const parsed = dateValue(value);
  return parsed === null ? "Unknown" : new Date(parsed).toLocaleString();
}

function statusOf(key: KeyRecord): "Active" | "Expired" | "Revoked" {
  if (key.revokedAt) return "Revoked";
  const expiry = dateValue(key.expiresAt);
  if (expiry !== null && expiry <= Date.now()) return "Expired";
  return "Active";
}

function ownerLabel(key: KeyRecord): string {
  if (key.organizationId) return "Organization-owned";
  if (key.userId) return "User-owned";
  return "Not provided";
}

export default function KeysAccessPage() {
  const location = useLocation();
  const [endpoint, setEndpoint] = useState("");
  const [configurationError, setConfigurationError] = useState("");
  const [keys, setKeys] = useState<KeyRecord[]>([]);
  const [name, setName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [ownerFilter, setOwnerFilter] = useState("All");
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [newSecret, setNewSecret] = useState<CreatedSecret | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
      const params = new URLSearchParams(location.search);
      if (params.get("create") === "1") {
        setError("");
        setNotice("");
        setName("");
        setExpiry("");
        setCreateModalOpen(true);
      }
    }, [location.search]);

  useEffect(() => {
    try {
      const configured = getResourceEndpoint("apiKeys");
      if (!configured) {
        setConfigurationError(
          "API-key endpoint is not configured. Set VITE_CONSOLE_ENDPOINT_API_KEYS."
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
      const valid = data.filter((item): item is KeyRecord =>
        Boolean(
          item &&
          typeof item === "object" &&
          typeof item.id === "string" &&
          typeof item.name === "string"
        )
      );
      setKeys(valid);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load API keys.");
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    void loadKeys();
  }, [loadKeys]);

  const filteredKeys = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    return keys.filter((key) => {
      const status = statusOf(key);
      const owner = ownerLabel(key);
      const matchesQuery =
        !query ||
        key.name.toLocaleLowerCase().includes(query) ||
        (key.keyPrefix || "").toLocaleLowerCase().includes(query) ||
        key.id.toLocaleLowerCase().includes(query);
      const matchesStatus = statusFilter === "All" || status === statusFilter;
      const matchesOwner = ownerFilter === "All" || owner === ownerFilter;
      return matchesQuery && matchesStatus && matchesOwner;
    });
  }, [keys, search, statusFilter, ownerFilter]);

  const activeCount = keys.filter((key) => statusOf(key) === "Active").length;
  const expiredCount = keys.filter((key) => statusOf(key) === "Expired").length;
  const revokedCount = keys.filter((key) => statusOf(key) === "Revoked").length;

  async function createKey(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!endpoint || creating) return;

    setCreating(true);
    setError("");
    setNotice("");
    setNewSecret(null);
    setCopied(false);

    try {
      const body: { name: string; expiresAt?: string } = { name: name.trim() };
      if (expiry) {
        const expiryDate = new Date(expiry);
        if (!Number.isFinite(expiryDate.getTime()) || expiryDate.getTime() <= Date.now()) {
          throw new Error("Choose an expiry time in the future.");
        }
        body.expiresAt = expiryDate.toISOString();
      }

      const created = readData(await api.post(endpoint, body));
      if (
        !created ||
        typeof created !== "object" ||
        !("key" in created) ||
        typeof created.key !== "string" ||
        !created.key
      ) {
        throw new Error("The server did not return a new secret. Refresh the list before retrying.");
      }

      const createdName =
        "name" in created && typeof created.name === "string"
          ? created.name
          : body.name;
      setNewSecret({ key: created.key, name: createdName });
      setName("");
      setExpiry("");
      setNotice("Key created. Copy the secret now; it will not be shown again.");
      await loadKeys();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create API key.");
    } finally {
      setCreating(false);
    }
  }

  async function rotateKey(key: KeyRecord) {
    if (!endpoint || busyId) return;
    if (!window.confirm(`Rotate "${key.name}"? The existing key will be revoked.`)) return;

    setBusyId(key.id);
    setError("");
    setNotice("");
    setNewSecret(null);
    setCopied(false);
    try {
      const data = readData(
        await api.post(`${endpoint}/${encodeURIComponent(key.id)}/rotate`, {})
      );
      if (
        !data ||
        typeof data !== "object" ||
        !("key" in data) ||
        typeof data.key !== "string" ||
        !data.key
      ) {
        throw new Error("The server did not return the replacement secret.");
      }
      const replacementName =
        "name" in data && typeof data.name === "string" ? data.name : key.name;
      setNewSecret({ key: data.key, name: replacementName });
      setNotice("Key rotated. Copy the replacement secret now.");
      await loadKeys();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not rotate API key.");
    } finally {
      setBusyId(null);
    }
  }

  async function revokeKey(key: KeyRecord) {
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
      setNotice("Secret copied to clipboard.");
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
          <h1>Keys &amp; Access</h1>
          <p className="mn-muted">
            Manage API credentials, review their status, and control access.
          </p>
        </div>
      </header>

      <section className="mn-panel mn-key-panel">
        <ShieldCheck size={25} />
        <div>
          <h2>Key security</h2>
          <p>
            A key grants the permissions of its owner. Keep secrets private,
            rotate compromised credentials immediately, and revoke keys no
            longer needed. Secret values are not returned by the list endpoint.
          </p>
        </div>
      </section>

      <section className="mn-panel" aria-labelledby="plan-heading">
        <h2 id="plan-heading">Your plan</h2>
        <p><strong>Current account access</strong></p>
        <p className="mn-muted">
          Plan and entitlement details are managed by your account subscription.
          This page does not infer a plan from API-key records.
        </p>
      </section>

      {configurationError ? <p className="mn-error" role="alert">{configurationError}</p> : null}
      {error ? <p className="mn-error" role="alert">{error}</p> : null}
      {notice ? <p role="status" aria-live="polite">{notice}</p> : null}

      {newSecret ? (
        <section className="mn-panel" aria-labelledby="new-secret-heading">
          <div className="mn-page__header">
            <div>
              <h2 id="new-secret-heading">New secret</h2>
              <p>{newSecret.name}. This value is only shown in this response.</p>
            </div>
            <button type="button" onClick={() => { setNewSecret(null); setCopied(false); }}>
              <X size={16} /> Dismiss
            </button>
          </div>
          <label htmlFor="mn-new-api-key">API key secret</label>
          <input
            id="mn-new-api-key"
            type="password"
            readOnly
            value={newSecret.key}
            autoComplete="off"
            spellCheck={false}
            onFocus={(event) => event.currentTarget.select()}
          />
          <button type="button" onClick={() => void copySecret()}>
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? "Copied" : "Copy secret"}
          </button>
          <p className="mn-muted">
            Store it in a secrets manager. Do not put it in source control or client-side code.
          </p>
        </section>
      ) : null}

      <section className="mn-panel" aria-labelledby="create-key-heading">
        <div className="mn-page__header">
          <div>
            <h2 id="create-key-heading">API keys</h2>
            <p className="mn-muted">
              Create a key for authenticated inference requests.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setError("");
              setNotice("");
              setName("");
              setExpiry("");
              setCreateModalOpen(true);
            }}
            disabled={!endpoint || creating}
          >
            <Plus size={16} />
            Create API key
          </button>
        </div>
      </section>

      {createModalOpen ? (
        <div
          className="mn-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !creating) {
              setCreateModalOpen(false);
            }
          }}
        >
          <section
            className="mn-panel mn-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="mn-create-modal-title"
            aria-describedby="mn-create-modal-description"
          >
            <div className="mn-page__header">
              <div>
                <h2 id="mn-create-modal-title">Create API key</h2>
                <p id="mn-create-modal-description" className="mn-muted">
                  Name your key and optionally set an expiry. The secret is shown only once.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                disabled={creating}
                aria-label="Close create API key dialog"
              >
                Close
              </button>
            </div>

            <form onSubmit={createKey}>
              <label htmlFor="mn-api-key-name">Name</label>
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
                autoFocus
              />

              <label htmlFor="mn-api-key-expiry">Expires</label>
              <input
                id="mn-api-key-expiry"
                type="datetime-local"
                value={expiry}
                min={new Date(Date.now() + 60000).toISOString().slice(0, 16)}
                onChange={(event) => setExpiry(event.target.value)}
              />
              <p className="mn-muted">Leave empty for no expiry date.</p>

              <label htmlFor="mn-api-key-scope">Scope</label>
              <select id="mn-api-key-scope" value="workspace" disabled>
                <option value="workspace">Workspace (default)</option>
              </select>
              <p className="mn-muted">
                The current server assigns the inference:invoke permission.
                Configurable scopes are not supported by the API yet.
              </p>

              {error ? <p className="mn-error" role="alert">{error}</p> : null}

              <div className="mn-page__header">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!endpoint || creating || !name.trim()}
                >
                  {creating ? <LoaderCircle size={16} /> : <Plus size={16} />}
                  {creating ? "Creatingâ€¦" : "Create key"}
                </button>
              </div>
            </form>
          </section>
        </div>
      ) : null}

      <section className="mn-panel" aria-labelledby="inventory-heading">
        <div className="mn-page__header">
          <div>
            <h2 id="inventory-heading">API key inventory</h2>
            <p className="mn-muted">
              {keys.length} total Ã‚Â· {activeCount} active Ã‚Â· {expiredCount} expired Ã‚Â· {revokedCount} revoked
            </p>
          </div>
          <button type="button" onClick={() => void loadKeys()} disabled={!endpoint || loading}>
            {loading ? <LoaderCircle size={16} /> : <RefreshCw size={16} />}
            Refresh
          </button>
        </div>

        <div className="mn-page__header">
          <label htmlFor="mn-key-search"><Search size={16} /> Search keys</label>
          <input
            id="mn-key-search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, prefix, or ID"
            autoComplete="off"
          />
          <label htmlFor="mn-key-status">Status</label>
          <select id="mn-key-status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
            <option>All</option>
            <option>Active</option>
            <option>Expired</option>
            <option>Revoked</option>
          </select>
          <label htmlFor="mn-key-owner">Owner type</label>
          <select id="mn-key-owner" value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>
            <option>All</option>
            <option>User-owned</option>
            <option>Organization-owned</option>
            <option>Not provided</option>
          </select>
        </div>

        {loading && keys.length === 0 ? <p>Loading API keysÃ¢â‚¬Â¦</p> : null}
        {!loading && !error && endpoint && filteredKeys.length === 0 ? (
          <p>{keys.length ? "No keys match these filters." : "No API keys found for this account."}</p>
        ) : null}

        {filteredKeys.length > 0 ? (
          <div className="mn-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Name / key prefix</th>
                  <th>Linked account</th>
                  <th>Workspace</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Last used</th>
                  <th>Expires</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredKeys.map((key) => {
                  const status = statusOf(key);
                  const active = status === "Active";
                  return (
                    <tr key={key.id}>
                      <td>
                        <strong>{key.name}</strong>
                        <br />
                        <code>{key.keyPrefix ? `${key.keyPrefix}Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢Ã¢â‚¬Â¢` : "Secret hidden"}</code>
                        <br />
                        <small className="mn-muted">ID: {key.id}</small>
                      </td>
                      <td>{ownerLabel(key)}</td>
                      <td>
                        {key.organizationId
                          ? "Organization workspace (ID only)"
                          : key.userId
                            ? "Personal account"
                            : "Not provided"}
                      </td>
                      <td><span className={`mn-key-status mn-key-status--${status.toLowerCase()}`}>{status}</span></td>
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
                              {busyId === key.id ? <LoaderCircle size={16} /> : <Trash2 size={16} />}
                              Revoke
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

        <p className="mn-muted">
          Linked account and workspace names are not returned by the current API contract.
          Ownership labels above use the returned owner identifiers and do not grant additional access.
        </p>
      </section>
    </main>
  );
}
