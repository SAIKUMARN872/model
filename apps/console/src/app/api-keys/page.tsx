
"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Check,
  Copy,
  KeyRound,
  LoaderCircle,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";

import { api } from "../../lib/api.js";
import { getResourceEndpoint } from "../../config/console.js";
import BillingPage from "./billing/page";
import CreateKeyPage from "./create-key/page";

type ApiKey = {
  id: string;
  name: string;
  keyPrefix?: string;
  createdAt?: string;
  lastUsedAt?: string;
  expiresAt?: string | null;
  revokedAt?: string | null;
};

type NewSecret = {
  key: string;
  name: string;
};

type ApiResponse<T> = {
  success?: boolean;
  data?: T;
  message?: string;
};

function readData<T>(payload: ApiResponse<T>): T {
  if (
    !payload ||
    payload.success !== true ||
    !("data" in payload)
  ) {
    throw new Error(
      payload?.message ||
        "The API returned an unexpected response."
    );
  }

  return payload.data as T;
}

function formatDate(value?: string | null) {
  if (!value) return "Never";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Unknown"
    : date.toLocaleString();
}

function isExpired(key: ApiKey) {
  if (!key.expiresAt) return false;

  const timestamp = new Date(key.expiresAt).getTime();

  return (
    !Number.isNaN(timestamp) &&
    timestamp <= Date.now()
  );
}

function keyStatus(key: ApiKey) {
  if (key.revokedAt) return "Revoked";
  if (isExpired(key)) return "Expired";

  return "Active";
}

export default function ApiKeysPage() {
  const searchParams = useSearchParams();

  const [endpoint, setEndpoint] = useState<string | null>(null);
  const [configurationError, setConfigurationError] =
    useState("");

  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(false);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [billingOpen, setBillingOpen] = useState(false);

  const [creating, setCreating] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [newSecret, setNewSecret] =
    useState<NewSecret | null>(null);

  const [copied, setCopied] = useState(false);

  // 1. Configure the shared backend endpoint
  useEffect(() => {
    try {
      const configured = getResourceEndpoint("apiKeys");

      if (!configured) {
        setConfigurationError(
          "API Keys endpoint is not configured. Set NEXT_PUBLIC_CONSOLE_ENDPOINT_API_KEYS."
        );
        return;
      }

      setConfigurationError("");
      setEndpoint(configured);
    } catch (cause) {
      setConfigurationError(
        cause instanceof Error
          ? cause.message
          : "Invalid API-key endpoint configuration."
      );
    }
  }, []);

  // 2. Open popup when Dashboard navigates with ?create=1
  useEffect(() => {
    const params = searchParams;

    if (params.get("create") === "1") {
      setCreateModalOpen(true);
      setError("");
      setNotice("");
    }
  }, [searchParams]);

  // 3. Load API keys
  const loadKeys = useCallback(async () => {
    if (!endpoint) return;

    setLoading(true);
    setError("");

    try {
      const payload = await api.get(endpoint);
      const data = readData<unknown>(payload);

      const records = Array.isArray(data)
        ? data
        : data &&
            typeof data === "object" &&
            Array.isArray(
              (data as { keys?: unknown[] }).keys
            )
          ? (data as { keys: unknown[] }).keys
          : null;

      if (!records) {
        throw new Error(
          "The API returned an invalid API-key list."
        );
      }

      setKeys(
        records
          .map((record: any) => ({
            ...record,
            id: String(record.id ?? record._id ?? ""),
          }))
          .filter((record: ApiKey) => Boolean(record.id))
      );
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not load API keys."
      );
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => {
    void loadKeys();
  }, [loadKeys]);

  // Refresh when the user returns to this page
  useEffect(() => {
    if (!endpoint) return;

    const handleFocus = () => {
      void loadKeys();
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, [endpoint, loadKeys]);

  // 4. Popup controls
  function openCreateModal() {
    setError("");
    setNotice("");
    setCreateModalOpen(true);
  }

  function closeCreateModal() {
    if (creating) return;

    setCreateModalOpen(false);
  }

  // 5. Create API key using the separate popup component
  async function createKey(
    keyName: string,
    expiry: string
  ) {
    if (!endpoint || creating || !keyName.trim()) return;

    setCreating(true);
    setError("");
    setNotice("");
    setNewSecret(null);
    setCopied(false);

    try {
      const body: {
        name: string;
        expiresAt?: string;
      } = {
        name: keyName.trim(),
      };

      if (expiry !== "Never") {
        const days = Number.parseInt(expiry, 10);

        if (![30, 60, 90].includes(days)) {
          throw new Error("Choose a valid API-key expiry.");
        }

        body.expiresAt = new Date(
          Date.now() + days * 24 * 60 * 60 * 1000
        ).toISOString();
      }

      const response = await api.post(endpoint, body);

      const created = readData<{
        key?: string;
        name?: string;
      }>(response);

      if (
        !created ||
        typeof created.key !== "string" ||
        !created.key
      ) {
        throw new Error(
          "The server did not return a new key secret."
        );
      }

      setNewSecret({
        key: created.key,
        name:
          typeof created.name === "string"
            ? created.name
            : body.name,
      });

      setCreateModalOpen(false);

      setNotice(
        "API key created successfully. Copy the secret now; it will not be shown again."
      );

      await loadKeys();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not create API key."
      );
    } finally {
      setCreating(false);
    }
  }

  // 6. Rotate API key
  async function rotateKey(key: ApiKey) {
    if (!endpoint || busyId) return;

    if (
      !window.confirm(
        `Rotate "${key.name}"? The current secret will be replaced.`
      )
    ) {
      return;
    }

    setBusyId(key.id);
    setError("");
    setNotice("");
    setNewSecret(null);
    setCopied(false);

    try {
      const response = await api.post(
        `${endpoint}/${encodeURIComponent(key.id)}/rotate`,
        {}
      );

      const data = readData<{
        key?: string;
        name?: string;
      }>(response);

      if (!data?.key) {
        throw new Error(
          "The server did not return the replacement secret."
        );
      }

      setNewSecret({
        key: data.key,
        name: data.name || key.name,
      });

      setNotice(
        "API key rotated successfully. Copy the replacement secret now."
      );

      await loadKeys();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not rotate API key."
      );
    } finally {
      setBusyId(null);
    }
  }

  // 7. Revoke API key
  async function revokeKey(key: ApiKey) {
    if (!endpoint || busyId) return;

    if (
      !window.confirm(
        `Revoke "${key.name}"? Applications using this key will lose access.`
      )
    ) {
      return;
    }

    setBusyId(key.id);
    setError("");
    setNotice("");
    setNewSecret(null);

    try {
      const response = await api.delete(
        `${endpoint}/${encodeURIComponent(key.id)}`
      );

      readData(response);

      setNotice(`"${key.name}" was revoked.`);

      await loadKeys();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not revoke API key."
      );
    } finally {
      setBusyId(null);
    }
  }

  // 8. Copy new secret
  async function copySecret() {
    if (!newSecret?.key) return;

    try {
      await navigator.clipboard.writeText(newSecret.key);

      setCopied(true);
      setNotice("API key copied successfully.");
    } catch {
      setError(
        "Clipboard access failed. Select and copy the secret manually."
      );
    }
  }

  const activeKeys = keys.filter(
    (key) => keyStatus(key) === "Active"
  );

  return (
    <main className="mn-api-page">
      <style>{`
        .mn-api-page {
          width: 100%;
          min-height: 100%;
          padding: 24px 20px 40px;
          color: var(--foreground, #171717);
        }

        .mn-api-page,
        .mn-api-page * {
          box-sizing: border-box;
        }

        .mn-api-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 10px;
        }

        .mn-api-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 0;
          font-size: 28px;
          font-weight: 600;
          letter-spacing: -0.6px;
        }

        .mn-api-count {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-width: 27px;
          height: 27px;
          padding: 0 8px;
          border-radius: 50px;
          background: #eeeeee;
          color: #555;
          font-size: 13px;
          font-weight: 600;
        }

        .mn-api-primary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 36px;
          padding: 7px 14px;
          border: 1px solid #111;
          border-radius: 11px;
          background: #111;
          color: #fff;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
        }

        .mn-api-primary-button:hover {
          background: #303030;
        }

        .mn-api-description {
          margin: 0 0 22px;
          color: var(--muted, #777);
          font-size: 15px;
          line-height: 1.6;
        }

        .mn-api-plan-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          min-height: 128px;
          padding: 22px 25px;
          border: 1px solid var(--border, #e3e3e3);
          border-radius: 18px;
          background: var(--card, #fff);
        }

        .mn-api-plan-content {
          display: grid;
          gap: 16px;
        }

        .mn-api-plan-heading {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .mn-api-plan-heading strong {
          font-size: 17px;
          font-weight: 600;
        }

        .mn-api-plan-badge {
          padding: 8px 14px;
          border-radius: 10px;
          background: #f0f0f0;
          color: #444;
          font-size: 14px;
        }

        .mn-api-plan-description {
          margin: 0;
          color: var(--muted, #777);
          font-size: 15px;
          line-height: 1.5;
        }

        .mn-api-billing-button {
          min-height: 44px;
          padding: 9px 18px;
          border: 1px solid var(--border, #dedede);
          border-radius: 12px;
          background: var(--card, #fff);
          color: inherit;
          font-size: 15px;
          cursor: pointer;
          white-space: nowrap;
        }

        .mn-api-billing-button:hover {
          background: var(--surface, #f7f7f7);
        }

        .mn-api-workspace-row {
          display: flex;
          align-items: center;
          margin: 48px 0 38px;
        }

        .mn-api-workspace-chip {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          min-height: 36px;
          padding: 6px 10px;
          border: 1px solid var(--border, #dedede);
          border-radius: 10px;
          background: var(--card, #fff);
          font-size: 14px;
        }

        .mn-api-workspace-label {
          color: #929292;
        }

        .mn-api-workspace-dot {
          width: 15px;
          height: 15px;
          border-radius: 4px;
          background: #6551d9;
        }

        .mn-api-workspace-name {
          color: var(--foreground, #171717);
        }

        .mn-api-empty-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 435px;
          padding: 40px 20px;
          border: 1px solid var(--border, #e3e3e3);
          border-radius: 18px;
          background: var(--card, #fff);
          text-align: center;
        }

        .mn-api-empty-icon {
          margin-bottom: 18px;
          color: #111;
          transform: rotate(-25deg);
        }

        .mn-api-empty-title {
          margin: 0 0 10px;
          font-size: 17px;
          font-weight: 500;
        }

        .mn-api-empty-description {
          max-width: 410px;
          margin: 0 0 20px;
          color: var(--muted, #777);
          font-size: 15px;
          line-height: 1.5;
        }

        .mn-api-empty-description a {
          color: #356fbd;
          text-decoration: underline;
        }

        .mn-api-secondary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 36px;
          padding: 7px 13px;
          border: 1px solid var(--border, #dedede);
          border-radius: 10px;
          background: var(--card, #fff);
          color: inherit;
          font-size: 15px;
          cursor: pointer;
        }

        .mn-api-secondary-button:hover {
          background: var(--surface, #f6f6f6);
        }

        .mn-api-secondary-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .mn-api-table-card {
          overflow: hidden;
          border: 1px solid var(--border, #e3e3e3);
          border-radius: 16px;
          background: var(--card, #fff);
        }

        .mn-api-table-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 20px 22px;
          border-bottom: 1px solid var(--border, #e3e3e3);
        }

        .mn-api-table-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }

        .mn-api-table-scroll {
          width: 100%;
          overflow-x: auto;
        }

        .mn-api-table {
          width: 100%;
          border-collapse: collapse;
          white-space: nowrap;
        }

        .mn-api-table th,
        .mn-api-table td {
          padding: 15px 18px;
          border-bottom: 1px solid var(--border, #e8e8e8);
          text-align: left;
          font-size: 14px;
        }

        .mn-api-table th {
          color: var(--muted, #777);
          font-size: 13px;
          font-weight: 600;
        }

        .mn-api-status {
          display: inline-flex;
          padding: 5px 9px;
          border-radius: 20px;
          background: #e9f7ed;
          color: #23743b;
          font-size: 12px;
          font-weight: 600;
        }

        .mn-api-status--inactive {
          background: #f1f1f1;
          color: #777;
        }

        .mn-api-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .mn-api-actions button {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 6px 8px;
          border: 1px solid var(--border, #dedede);
          border-radius: 8px;
          background: transparent;
          color: inherit;
          cursor: pointer;
        }

        .mn-api-actions button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .mn-api-message {
          margin: 16px 0;
          padding: 12px 14px;
          border: 1px solid var(--border, #ddd);
          border-radius: 10px;
          font-size: 14px;
        }

        .mn-api-error {
          border-color: #f0b8b8;
          background: #fff4f4;
          color: #a52a2a;
        }

        .mn-api-notice {
          border-color: #b9dfc2;
          background: #f0faf2;
          color: #276b37;
        }

        .mn-api-secret-card {
          display: grid;
          gap: 12px;
          margin: 20px 0;
          padding: 20px;
          border: 1px solid var(--border, #ddd);
          border-radius: 14px;
          background: var(--card, #fff);
        }

        .mn-api-secret-card h2 {
          margin: 0;
          font-size: 18px;
        }

        .mn-api-secret-card p {
          margin: 0;
          color: var(--muted, #777);
          line-height: 1.5;
        }

        .mn-api-secret-input {
          width: 100%;
          min-width: 0;
          padding: 12px;
          border: 1px solid var(--border, #ddd);
          border-radius: 9px;
          background: var(--surface, #fafafa);
          color: inherit;
          font-family: monospace;
        }

        .mn-api-secret-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .mn-api-spin {
          animation: mn-api-rotation 1s linear infinite;
        }

        @keyframes mn-api-rotation {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 650px) {
          .mn-api-page {
            padding: 18px 12px 30px;
          }

          .mn-api-topbar {
            align-items: flex-start;
          }

          .mn-api-title {
            font-size: 23px;
          }

          .mn-api-primary-button {
            font-size: 13px;
            padding: 7px 9px;
          }

          .mn-api-plan-card {
            align-items: flex-start;
            flex-direction: column;
            padding: 18px;
          }

          .mn-api-workspace-row {
            margin: 30px 0 22px;
          }

          .mn-api-empty-card {
            min-height: 350px;
          }
        }
      `}</style>

      {/* Page heading */}
      <header className="mn-api-topbar">
        <h1 className="mn-api-title">
          API keys
          <span className="mn-api-count">{keys.length}</span>
        </h1>

        <button
          type="button"
          className="mn-api-primary-button"
          onClick={openCreateModal}
        >
          <Plus size={19} />
          Create key
        </button>
      </header>

      <p className="mn-api-description">
        Manage API keys created across your ModelNow workspace.
        Keys created from Dashboard, Agents, Browser Automation,
        Computer Use, Fine-tuning, Knowledge Hub, and Multimodal AI
        appear here when they belong to the same authenticated workspace.
      </p>

      {/* Plan card */}
      <section className="mn-api-plan-card">
        <div className="mn-api-plan-content">
          <div className="mn-api-plan-heading">
            <strong>Your plan</strong>
            <span className="mn-api-plan-badge">
              Evaluation access
            </span>
          </div>

          <p className="mn-api-plan-description">
            This free plan is for evaluating ModelNow's capabilities
            before commercial use.
          </p>
        </div>

        <button
          type="button"
          className="mn-api-billing-button"
          onClick={() => setBillingOpen(true)}
        >
          Set up billing
        </button>
      </section>

      {/* Workspace */}
      <div className="mn-api-workspace-row">
        <div className="mn-api-workspace-chip">
          <span className="mn-api-workspace-label">
            Workspace
          </span>

          <span className="mn-api-workspace-dot" />

          <span className="mn-api-workspace-name">
            Default
          </span>
        </div>
      </div>

      {/* Messages */}
      {configurationError && (
        <div className="mn-api-message mn-api-error" role="alert">
          {configurationError}
        </div>
      )}

      {error && (
        <div className="mn-api-message mn-api-error" role="alert">
          {error}
        </div>
      )}

      {notice && (
        <div className="mn-api-message mn-api-notice" role="status">
          {notice}
        </div>
      )}

      {/* Newly created or rotated secret */}
      {newSecret && (
        <section className="mn-api-secret-card">
          <h2>Your new API key</h2>

          <p>
            <strong>{newSecret.name}</strong> — copy this secret now.
            It will not be shown again after you dismiss it.
          </p>

          <label htmlFor="mn-api-secret">Secret</label>

          <input
            id="mn-api-secret"
            className="mn-api-secret-input"
            type="text"
            readOnly
            value={newSecret.key}
            autoComplete="off"
            spellCheck="false"
          />

          <div className="mn-api-secret-actions">
            <button
              type="button"
              className="mn-api-secondary-button"
              onClick={() => void copySecret()}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? "Copied" : "Copy secret"}
            </button>

            <button
              type="button"
              className="mn-api-secondary-button"
              onClick={() => setNewSecret(null)}
            >
              Dismiss
            </button>
          </div>
        </section>
      )}

      {/* Loading */}
      {loading && keys.length === 0 && (
        <section className="mn-api-empty-card">
          <LoaderCircle
            size={32}
            className="mn-api-spin"
          />
          <p>Loading API keys...</p>
        </section>
      )}

      {/* Empty state */}
      {!loading && keys.length === 0 && !error && endpoint && (
        <section className="mn-api-empty-card">
          <KeyRound
            className="mn-api-empty-icon"
            size={68}
            strokeWidth={1.4}
          />

          <h2 className="mn-api-empty-title">
            Create an API key
          </h2>

          <p className="mn-api-empty-description">
            Create a key to integrate with the ModelNow API.
            You can use the API directly or through a{" "}
            <Link href="/docs">client SDK</Link>.
          </p>

          <button
            type="button"
            className="mn-api-secondary-button"
            onClick={openCreateModal}
          >
            Create key
          </button>
        </section>
      )}

      {/* Central API key inventory */}
      {keys.length > 0 && (
        <section className="mn-api-table-card">
          <div className="mn-api-table-header">
            <div>
              <h2>Your API keys</h2>
              <p className="mn-api-plan-description">
                {activeKeys.length} active key
                {activeKeys.length === 1 ? "" : "s"}
              </p>
            </div>

            <button
              type="button"
              className="mn-api-secondary-button"
              onClick={() => void loadKeys()}
              disabled={!endpoint || loading}
            >
              {loading ? (
                <LoaderCircle
                  size={16}
                  className="mn-api-spin"
                />
              ) : (
                <RefreshCw size={16} />
              )}
              Refresh
            </button>
          </div>

          <div className="mn-api-table-scroll">
            <table className="mn-api-table">
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

                      <td>
                        <code>{key.keyPrefix || "—"}</code>
                      </td>

                      <td>
                        <span
                          className={
                            active
                              ? "mn-api-status"
                              : "mn-api-status mn-api-status--inactive"
                          }
                        >
                          {status}
                        </span>
                      </td>

                      <td>{formatDate(key.createdAt)}</td>
                      <td>{formatDate(key.lastUsedAt)}</td>
                      <td>{formatDate(key.expiresAt)}</td>

                      <td>
                        {active ? (
                          <div className="mn-api-actions">
                            <button
                              type="button"
                              onClick={() => void rotateKey(key)}
                              disabled={Boolean(busyId)}
                              aria-label={`Rotate ${key.name}`}
                            >
                              {busyId === key.id ? (
                                <LoaderCircle
                                  size={15}
                                  className="mn-api-spin"
                                />
                              ) : (
                                <RefreshCw size={15} />
                              )}
                              Rotate
                            </button>

                            <button
                              type="button"
                              onClick={() => void revokeKey(key)}
                              disabled={Boolean(busyId)}
                              aria-label={`Revoke ${key.name}`}
                            >
                              <Trash2 size={15} />
                              Revoke
                            </button>
                          </div>
                        ) : (
                          <span>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Separate Create Key popup component */}
      {createModalOpen && (
        <CreateKeyPage
          onClose={closeCreateModal}
          onCreate={createKey}
          creating={creating}
          error={error}
        />
      )}

      {/* Billing popup */}
      {billingOpen && (
        <BillingPage onClose={() => setBillingOpen(false)} />
      )}
    </main>
  );
}
