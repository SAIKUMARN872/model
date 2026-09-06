"use client";

import React, { useMemo, useState } from "react";

import ApiKeyTable from "../../components/api-key-table/ApiKeyTable";
import Spinner from "../../components/loading/Spinner";

import apiClient from "../../api/client";

/**
 * Enterprise API Keys Management Page
 *
 * Route:
 * /api-keys
 *
 * Responsibilities:
 * - List API keys
 * - Search API keys
 * - Filter API keys
 * - Create new API keys
 * - Revoke API keys
 * - Securely display newly created key
 * - Handle loading and error states
 *
 * Security:
 * - Secret API keys are never persisted in React state
 *   longer than necessary.
 * - Newly created secrets should only be shown once.
 * - Revoked keys cannot be reused.
 */
export default function ApiKeysPage() {
  const [apiKeys, setApiKeys] = useState([]);

  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);

  const [revokingId, setRevokingId] =
    useState(null);

  const [error, setError] = useState(null);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [newKeyName, setNewKeyName] =
    useState("");

  const [newKeyDescription, setNewKeyDescription] =
    useState("");

  const [createdKey, setCreatedKey] =
    useState(null);

  /**
   * Load API keys.
   */
  const loadApiKeys = async () => {
    try {
      setLoading(true);
      setError(null);

      const response =
        await apiClient.get("/api-keys");

      const keys =
        Array.isArray(response)
          ? response
          : response?.data ||
            response?.items ||
            [];

      setApiKeys(keys);
    } catch (requestError) {
      console.error(
        "Failed to load API keys:",
        requestError
      );

      setError(
        requestError?.message ||
          "Unable to load API keys."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Create API key.
   */
  const handleCreateKey = async (
    event
  ) => {
    event.preventDefault();

    if (!newKeyName.trim()) {
      setError(
        "API key name is required."
      );

      return;
    }

    try {
      setCreating(true);
      setError(null);

      const response =
        await apiClient.post(
          "/api-keys",
          {
            name: newKeyName.trim(),
            description:
              newKeyDescription.trim(),
          }
        );

      const key =
        response?.data ||
        response?.key ||
        response;

      /**
       * The backend should return the
       * secret only during creation.
       */
      setCreatedKey(key);

      setShowCreateModal(false);

      setNewKeyName("");

      setNewKeyDescription("");

      await loadApiKeys();
    } catch (requestError) {
      console.error(
        "Failed to create API key:",
        requestError
      );

      setError(
        requestError?.message ||
          "Unable to create API key."
      );
    } finally {
      setCreating(false);
    }
  };

  /**
   * Revoke API key.
   */
  const handleRevokeKey = async (
    apiKey
  ) => {
    const keyId =
      apiKey?.id ||
      apiKey?.keyId;

    if (!keyId) {
      setError(
        "Unable to identify the API key."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to revoke "${apiKey.name}"? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setRevokingId(keyId);

      setError(null);

      await apiClient.delete(
        `/api-keys/${keyId}`
      );

      setApiKeys((currentKeys) =>
        currentKeys.map((key) => {
          const currentKeyId =
            key.id || key.keyId;

          if (
            currentKeyId === keyId
          ) {
            return {
              ...key,
              status: "revoked",
              revokedAt:
                new Date().toISOString(),
            };
          }

          return key;
        })
      );
    } catch (requestError) {
      console.error(
        "Failed to revoke API key:",
        requestError
      );

      setError(
        requestError?.message ||
          "Unable to revoke API key."
      );
    } finally {
      setRevokingId(null);
    }
  };

  /**
   * Filter API keys.
   */
  const filteredKeys = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return apiKeys.filter((key) => {
      const matchesSearch =
        !normalizedSearch ||
        String(
          key.name || ""
        )
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(
          key.description || ""
        )
          .toLowerCase()
          .includes(normalizedSearch) ||
        String(
          key.prefix || ""
        )
          .toLowerCase()
          .includes(normalizedSearch);

      const keyStatus =
        String(
          key.status || "active"
        ).toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        keyStatus === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [
    apiKeys,
    search,
    statusFilter,
  ]);

  /**
   * Copy newly generated API key.
   */
  const handleCopyKey = async () => {
    if (!createdKey) {
      return;
    }

    const secret =
      typeof createdKey === "string"
        ? createdKey
        : createdKey.secret ||
          createdKey.key ||
          createdKey.token;

    if (!secret) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        secret
      );
    } catch (copyError) {
      console.error(
        "Unable to copy API key:",
        copyError
      );
    }
  };

  /**
   * Close newly created key dialog.
   */
  const handleCloseCreatedKey = () => {
    setCreatedKey(null);
  };

  /**
   * Initial loading state.
   */
  if (loading) {
    return (
      <main
        className="console-api-keys"
        aria-label="API Keys"
      >
        <div className="api-keys-loading">
          <Spinner />

          <p>
            Loading API keys...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="console-api-keys"
      aria-label="API Key Management"
    >
      {/* ========================================
          Page Header
      ========================================= */}
      <header className="api-keys-header">
        <div>
          <h1>
            API Keys
          </h1>

          <p>
            Create and manage credentials
            used to authenticate applications
            with your AI platform.
          </p>
        </div>

        <button
          type="button"
          className="api-keys-primary-button"
          onClick={() => {
            setError(null);
            setShowCreateModal(true);
          }}
        >
          Create API Key
        </button>
      </header>

      {/* ========================================
          Error Message
      ========================================= */}
      {error && (
        <div
          className="api-keys-error"
          role="alert"
        >
          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================
          Search & Filters
      ========================================= */}
      <section
        className="api-keys-toolbar"
        aria-label="API key filters"
      >
        <div className="api-keys-search">
          <label
            htmlFor="api-key-search"
            className="sr-only"
          >
            Search API keys
          </label>

          <input
            id="api-key-search"
            type="search"
            placeholder="Search API keys..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />
        </div>

        <div className="api-keys-filter">
          <label
            htmlFor="api-key-status"
            className="sr-only"
          >
            Filter API keys by status
          </label>

          <select
            id="api-key-status"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All Keys
            </option>

            <option value="active">
              Active
            </option>

            <option value="revoked">
              Revoked
            </option>

            <option value="expired">
              Expired
            </option>
          </select>
        </div>

        <div className="api-keys-count">
          {filteredKeys.length} key
          {filteredKeys.length === 1
            ? ""
            : "s"}
        </div>
      </section>

      {/* ========================================
          API Key Table
      ========================================= */}
      <section
        className="api-keys-table-section"
        aria-label="API keys list"
      >
        {filteredKeys.length === 0 ? (
          <div className="api-keys-empty">
            <h2>
              No API keys found
            </h2>

            <p>
              {search ||
              statusFilter !== "all"
                ? "Try changing your search or filter."
                : "Create your first API key to connect an application."}
            </p>

            {!search &&
              statusFilter ===
                "all" && (
                <button
                  type="button"
                  className="api-keys-primary-button"
                  onClick={() =>
                    setShowCreateModal(
                      true
                    )
                  }
                >
                  Create API Key
                </button>
              )}
          </div>
        ) : (
          <ApiKeyTable
            apiKeys={filteredKeys}
            onRevoke={handleRevokeKey}
            revokingId={revokingId}
          />
        )}
      </section>

      {/* ========================================
          Create API Key Modal
      ========================================= */}
      {showCreateModal && (
        <div
          className="api-key-modal-overlay"
          role="presentation"
        >
          <div
            className="api-key-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-api-key-title"
          >
            <header className="api-key-modal__header">
              <div>
                <h2
                  id="create-api-key-title"
                >
                  Create API Key
                </h2>

                <p>
                  Give your API key a
                  recognizable name.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close"
                onClick={() =>
                  setShowCreateModal(
                    false
                  )
                }
              >
                ×
              </button>
            </header>

            <form
              onSubmit={
                handleCreateKey
              }
              className="api-key-form"
            >
              <div className="api-key-form__field">
                <label htmlFor="api-key-name">
                  Name
                </label>

                <input
                  id="api-key-name"
                  type="text"
                  value={newKeyName}
                  onChange={(event) =>
                    setNewKeyName(
                      event.target.value
                    )
                  }
                  placeholder="Production Application"
                  required
                />
              </div>

              <div className="api-key-form__field">
                <label htmlFor="api-key-description">
                  Description
                </label>

                <textarea
                  id="api-key-description"
                  value={
                    newKeyDescription
                  }
                  onChange={(event) =>
                    setNewKeyDescription(
                      event.target.value
                    )
                  }
                  placeholder="Used by the production AI application."
                  rows={4}
                />
              </div>

              <div className="api-key-form__actions">
                <button
                  type="button"
                  onClick={() =>
                    setShowCreateModal(
                      false
                    )
                  }
                  disabled={creating}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="api-keys-primary-button"
                  disabled={creating}
                >
                  {creating
                    ? "Creating..."
                    : "Create API Key"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================
          Newly Created API Key
      ========================================= */}
      {createdKey && (
        <div
          className="api-key-modal-overlay"
          role="presentation"
        >
          <div
            className="api-key-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="created-api-key-title"
          >
            <header className="api-key-modal__header">
              <div>
                <h2
                  id="created-api-key-title"
                >
                  API Key Created
                </h2>

                <p>
                  Copy this key now. For
                  security reasons, you will
                  not be able to view the
                  secret again.
                </p>
              </div>
            </header>

            <div className="api-key-secret">
              <code>
                {typeof createdKey ===
                "string"
                  ? createdKey
                  : createdKey.secret ||
                    createdKey.key ||
                    createdKey.token ||
                    "Secret unavailable"}
              </code>

              <button
                type="button"
                onClick={
                  handleCopyKey
                }
              >
                Copy
              </button>
            </div>

            <div className="api-key-security-warning">
              <strong>
                Security Notice
              </strong>

              <p>
                Store this API key securely.
                Never expose it in frontend
                code, public repositories, or
                client-side applications.
              </p>
            </div>

            <div className="api-key-form__actions">
              <button
                type="button"
                className="api-keys-primary-button"
                onClick={
                  handleCloseCreatedKey
                }
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}