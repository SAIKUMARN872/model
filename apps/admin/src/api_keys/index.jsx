import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../api/client";
import API_ENDPOINTS from "../api/endpoints";

/**
 * Enterprise API Key Management
 *
 * Features:
 * - List API keys
 * - Create API keys
 * - Revoke API keys
 * - Rotate API keys
 * - Search and filter
 * - Secure secret handling
 * - Usage tracking
 * - Expiration monitoring
 * - Permission scopes
 */

/* =========================================================
   Constants
========================================================= */

const KEY_STATUS = {
  ACTIVE: "active",
  REVOKED: "revoked",
  EXPIRED: "expired",
};

const INITIAL_FORM = {
  name: "",
  description: "",
  expiresAt: "",
  scopes: [],
};

/* =========================================================
   Utility Functions
========================================================= */

const formatDate = (date) => {
  if (!date) {
    return "Never";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    }
  ).format(new Date(date));
};

const isExpired = (date) => {
  if (!date) {
    return false;
  }

  return (
    new Date(date).getTime() <
    Date.now()
  );
};

const maskApiKey = (key) => {
  if (!key) {
    return "••••••••••••";
  }

  if (key.length <= 12) {
    return "••••••••••••";
  }

  return `${key.substring(
    0,
    8
  )}••••••••${key.substring(
    key.length - 4
  )}`;
};

const getKeyStatus = (key) => {
  if (
    key.status ===
    KEY_STATUS.REVOKED
  ) {
    return KEY_STATUS.REVOKED;
  }

  if (
    isExpired(
      key.expiresAt
    )
  ) {
    return KEY_STATUS.EXPIRED;
  }

  return KEY_STATUS.ACTIVE;
};

/* =========================================================
   API Key Card
========================================================= */

const ApiKeyCard = ({
  apiKey,
  onRevoke,
  onRotate,
}) => {
  const status =
    getKeyStatus(apiKey);

  return (
    <div className="api-key-card">
      <div className="api-key-card-header">
        <div>
          <h3>
            {apiKey.name}
          </h3>

          <p>
            {apiKey.description ||
              "No description provided"}
          </p>
        </div>

        <span
          className={`api-key-status api-key-status-${status}`}
        >
          {status}
        </span>
      </div>

      <div className="api-key-value">
        <code>
          {maskApiKey(
            apiKey.key ||
              apiKey.prefix
          )}
        </code>
      </div>

      <div className="api-key-details">
        <div>
          <span>
            Created
          </span>

          <strong>
            {formatDate(
              apiKey.createdAt
            )}
          </strong>
        </div>

        <div>
          <span>
            Last Used
          </span>

          <strong>
            {formatDate(
              apiKey.lastUsedAt
            )}
          </strong>
        </div>

        <div>
          <span>
            Expires
          </span>

          <strong>
            {formatDate(
              apiKey.expiresAt
            )}
          </strong>
        </div>

        <div>
          <span>
            Requests
          </span>

          <strong>
            {(
              apiKey.requestCount ||
              0
            ).toLocaleString()}
          </strong>
        </div>
      </div>

      <div className="api-key-scopes">
        {(
          apiKey.scopes || []
        ).map(
          (scope) => (
            <span
              key={scope}
              className="api-key-scope"
            >
              {scope}
            </span>
          )
        )}
      </div>

      <div className="api-key-actions">
        {status ===
          KEY_STATUS.ACTIVE && (
          <>
            <button
              type="button"
              onClick={() =>
                onRotate(apiKey)
              }
            >
              Rotate
            </button>

            <button
              type="button"
              className="danger"
              onClick={() =>
                onRevoke(apiKey)
              }
            >
              Revoke
            </button>
          </>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   Create API Key Modal
========================================================= */

const CreateApiKeyModal = ({
  form,
  setForm,
  onClose,
  onSubmit,
  loading,
}) => {
  const availableScopes = [
    "agents:read",
    "agents:write",
    "analytics:read",
    "users:read",
    "users:write",
    "organizations:read",
    "organizations:write",
    "billing:read",
  ];

  const toggleScope = (
    scope
  ) => {
    setForm((current) => {
      const exists =
        current.scopes.includes(
          scope
        );

      return {
        ...current,

        scopes: exists
          ? current.scopes.filter(
              (item) =>
                item !== scope
            )
          : [
              ...current.scopes,
              scope,
            ],
      };
    });
  };

  return (
    <div className="api-key-modal-overlay">
      <div className="api-key-modal">
        <div className="api-key-modal-header">
          <div>
            <h2>
              Create API Key
            </h2>

            <p>
              Generate a secure credential
              for programmatic access.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <form
          onSubmit={onSubmit}
        >
          <div className="api-key-form-group">
            <label>
              Name
            </label>

            <input
              type="text"
              value={form.name}
              onChange={(event) =>
                setForm({
                  ...form,
                  name:
                    event.target
                      .value,
                })
              }
              placeholder="Production API Key"
              required
            />
          </div>

          <div className="api-key-form-group">
            <label>
              Description
            </label>

            <textarea
              value={
                form.description
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  description:
                    event.target
                      .value,
                })
              }
              placeholder="Describe the purpose of this key"
              rows={3}
            />
          </div>

          <div className="api-key-form-group">
            <label>
              Expiration Date
            </label>

            <input
              type="date"
              value={
                form.expiresAt
              }
              onChange={(event) =>
                setForm({
                  ...form,
                  expiresAt:
                    event.target
                      .value,
                })
              }
            />
          </div>

          <div className="api-key-form-group">
            <label>
              Permissions
            </label>

            <div className="api-key-scope-selector">
              {availableScopes.map(
                (scope) => (
                  <label
                    key={scope}
                    className="api-key-scope-option"
                  >
                    <input
                      type="checkbox"
                      checked={form.scopes.includes(
                        scope
                      )}
                      onChange={() =>
                        toggleScope(
                          scope
                        )
                      }
                    />

                    <span>
                      {scope}
                    </span>
                  </label>
                )
              )}
            </div>
          </div>

          <div className="api-key-modal-actions">
            <button
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create API Key"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================================
   Main API Keys Component
========================================================= */

const ApiKeys = () => {
  const [
    apiKeys,
    setApiKeys,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    actionLoading,
    setActionLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");

  const [
    showCreateModal,
    setShowCreateModal,
  ] = useState(false);

  const [
    form,
    setForm,
  ] = useState(
    INITIAL_FORM
  );

  /* =======================================================
     Load API Keys
  ======================================================= */

  const loadApiKeys =
    useCallback(
      async () => {
        try {
          setLoading(true);

          setError("");

          const response =
            await api.get(
              API_ENDPOINTS.API_KEYS
                .LIST
            );

          setApiKeys(
            response.data?.data ||
              response.data ||
              []
          );
        } catch (err) {
          console.error(
            "Failed to load API keys:",
            err
          );

          setError(
            err.message ||
              "Unable to load API keys."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  /* =======================================================
     Initial Load
  ======================================================= */

  useEffect(() => {
    loadApiKeys();
  }, [
    loadApiKeys,
  ]);

  /* =======================================================
     Create API Key
  ======================================================= */

  const handleCreate =
    async (event) => {
      event.preventDefault();

      try {
        setActionLoading(
          true
        );

        setError("");

        await api.post(
          API_ENDPOINTS.API_KEYS
            .CREATE,
          {
            name:
              form.name,

            description:
              form.description,

            expiresAt:
              form.expiresAt ||
              null,

            scopes:
              form.scopes,
          }
        );

        setForm(
          INITIAL_FORM
        );

        setShowCreateModal(
          false
        );

        await loadApiKeys();
      } catch (err) {
        console.error(
          "Failed to create API key:",
          err
        );

        setError(
          err.message ||
            "Unable to create API key."
        );
      } finally {
        setActionLoading(
          false
        );
      }
    };

  /* =======================================================
     Revoke API Key
  ======================================================= */

  const handleRevoke =
    async (apiKey) => {
      const confirmed =
        window.confirm(
          `Are you sure you want to revoke "${apiKey.name}"? This action cannot be undone.`
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(
          true
        );

        setError("");

        await api.post(
          API_ENDPOINTS.API_KEYS
            .REVOKE(
              apiKey.id
            )
        );

        await loadApiKeys();
      } catch (err) {
        console.error(
          "Failed to revoke API key:",
          err
        );

        setError(
          err.message ||
            "Unable to revoke API key."
        );
      } finally {
        setActionLoading(
          false
        );
      }
    };

  /* =======================================================
     Rotate API Key
  ======================================================= */

  const handleRotate =
    async (apiKey) => {
      const confirmed =
        window.confirm(
          `Rotate "${apiKey.name}"? The current key will stop working.`
        );

      if (!confirmed) {
        return;
      }

      try {
        setActionLoading(
          true
        );

        setError("");

        const response =
          await api.post(
            API_ENDPOINTS.API_KEYS
              .ROTATE(
                apiKey.id
              )
          );

        const newKey =
          response.data?.key;

        if (newKey) {
          window.alert(
            `New API key:\n\n${newKey}\n\nCopy it now. For security reasons, it may not be shown again.`
          );
        }

        await loadApiKeys();
      } catch (err) {
        console.error(
          "Failed to rotate API key:",
          err
        );

        setError(
          err.message ||
            "Unable to rotate API key."
        );
      } finally {
        setActionLoading(
          false
        );
      }
    };

  /* =======================================================
     Filtered API Keys
  ======================================================= */

  const filteredApiKeys =
    useMemo(() => {
      return apiKeys.filter(
        (apiKey) => {
          const status =
            getKeyStatus(
              apiKey
            );

          const matchesSearch =
            apiKey.name
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              ) ||
            apiKey.description
              ?.toLowerCase()
              .includes(
                search.toLowerCase()
              );

          const matchesStatus =
            statusFilter ===
              "all" ||
            status ===
              statusFilter;

          return (
            matchesSearch &&
            matchesStatus
          );
        }
      );
    }, [
      apiKeys,
      search,
      statusFilter,
    ]);

  /* =======================================================
     Statistics
  ======================================================= */

  const statistics =
    useMemo(() => {
      const active =
        apiKeys.filter(
          (key) =>
            getKeyStatus(key) ===
            KEY_STATUS.ACTIVE
        ).length;

      const revoked =
        apiKeys.filter(
          (key) =>
            getKeyStatus(key) ===
            KEY_STATUS.REVOKED
        ).length;

      const expired =
        apiKeys.filter(
          (key) =>
            getKeyStatus(key) ===
            KEY_STATUS.EXPIRED
        ).length;

      return {
        total:
          apiKeys.length,

        active,

        revoked,

        expired,
      };
    }, [apiKeys]);

  /* =======================================================
     Loading State
  ======================================================= */

  if (loading) {
    return (
      <div className="api-keys-page">
        <div className="api-keys-loading">
          Loading API keys...
        </div>
      </div>
    );
  }

  /* =======================================================
     Main UI
  ======================================================= */

  return (
    <div className="api-keys-page">
      {/* Header */}

      <header className="api-keys-header">
        <div>
          <span className="api-keys-eyebrow">
            DEVELOPER PLATFORM
          </span>

          <h1>
            API Keys
          </h1>

          <p>
            Manage secure credentials
            used to access your platform
            programmatically.
          </p>
        </div>

        <button
          type="button"
          className="api-keys-primary-button"
          onClick={() =>
            setShowCreateModal(
              true
            )
          }
        >
          + Create API Key
        </button>
      </header>

      {/* Error */}

      {error && (
        <div className="api-keys-error">
          {error}
        </div>
      )}

      {/* Statistics */}

      <section className="api-keys-statistics">
        <div className="api-keys-stat-card">
          <span>
            Total Keys
          </span>

          <strong>
            {statistics.total}
          </strong>
        </div>

        <div className="api-keys-stat-card">
          <span>
            Active
          </span>

          <strong>
            {statistics.active}
          </strong>
        </div>

        <div className="api-keys-stat-card">
          <span>
            Expired
          </span>

          <strong>
            {statistics.expired}
          </strong>
        </div>

        <div className="api-keys-stat-card">
          <span>
            Revoked
          </span>

          <strong>
            {statistics.revoked}
          </strong>
        </div>
      </section>

      {/* Filters */}

      <section className="api-keys-toolbar">
        <input
          type="search"
          placeholder="Search API keys..."
          value={search}
          onChange={(event) =>
            setSearch(
              event.target.value
            )
          }
        />

        <select
          value={
            statusFilter
          }
          onChange={(event) =>
            setStatusFilter(
              event.target.value
            )
          }
        >
          <option value="all">
            All Statuses
          </option>

          <option value="active">
            Active
          </option>

          <option value="expired">
            Expired
          </option>

          <option value="revoked">
            Revoked
          </option>
        </select>

        <button
          type="button"
          onClick={
            loadApiKeys
          }
        >
          Refresh
        </button>
      </section>

      {/* Global Action Loading */}

      {actionLoading && (
        <div className="api-keys-action-loading">
          Processing secure API key
          operation...
        </div>
      )}

      {/* API Key List */}

      <section className="api-keys-grid">
        {filteredApiKeys.length ===
        0 ? (
          <div className="api-keys-empty">
            <h2>
              No API keys found
            </h2>

            <p>
              Create an API key to
              enable secure programmatic
              access.
            </p>

            <button
              type="button"
              onClick={() =>
                setShowCreateModal(
                  true
                )
              }
            >
              Create Your First
              API Key
            </button>
          </div>
        ) : (
          filteredApiKeys.map(
            (apiKey) => (
              <ApiKeyCard
                key={
                  apiKey.id
                }
                apiKey={
                  apiKey
                }
                onRevoke={
                  handleRevoke
                }
                onRotate={
                  handleRotate
                }
              />
            )
          )
        )}
      </section>

      {/* Create Modal */}

      {showCreateModal && (
        <CreateApiKeyModal
          form={form}
          setForm={setForm}
          onClose={() => {
            setShowCreateModal(
              false
            );

            setForm(
              INITIAL_FORM
            );
          }}
          onSubmit={
            handleCreate
          }
          loading={
            actionLoading
          }
        />
      )}
    </div>
  );
};

export default ApiKeys;