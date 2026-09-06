"use client";

import React, {
  useCallback,
  useState,
} from "react";

/**
 * Enterprise API Key Table
 *
 * Responsibilities:
 * - Display API keys
 * - Show key metadata
 * - Copy API keys to clipboard
 * - Revoke API keys
 * - Handle loading state
 * - Handle error state
 * - Handle empty state
 *
 * Expected API key object:
 *
 * {
 *   id: "key_123",
 *   name: "Production API Key",
 *   key: "sk_live_********",
 *   prefix: "sk_live_",
 *   status: "active",
 *   scopes: ["models:read"],
 *   createdAt: "2026-07-01T10:00:00Z",
 *   lastUsedAt: "2026-07-29T10:00:00Z"
 * }
 */

export default function ApiKeyTable({
  apiKeys = [],
  loading = false,
  error = null,
  onRevoke,
  onRefresh,
}) {
  const [
    copiedKeyId,
    setCopiedKeyId,
  ] = useState(null);

  const [
    revokingKeyId,
    setRevokingKeyId,
  ] = useState(null);

  /**
   * Format date.
   */
  const formatDate = useCallback(
    (date) => {
      if (!date) {
        return "Never";
      }

      const parsedDate =
        new Date(date);

      if (
        Number.isNaN(
          parsedDate.getTime()
        )
      ) {
        return "Unknown";
      }

      return new Intl.DateTimeFormat(
        "en-IN",
        {
          dateStyle: "medium",
          timeStyle: "short",
        }
      ).format(parsedDate);
    },
    []
  );

  /**
   * Copy API key.
   */
  const handleCopy = async (
    apiKey
  ) => {
    const value =
      apiKey?.key ||
      apiKey?.token ||
      "";

    if (!value) {
      return;
    }

    try {
      await navigator.clipboard.writeText(
        value
      );

      setCopiedKeyId(
        apiKey.id
      );

      setTimeout(() => {
        setCopiedKeyId(
          null
        );
      }, 2000);
    } catch (copyError) {
      console.error(
        "Failed to copy API key:",
        copyError
      );
    }
  };

  /**
   * Revoke API key.
   */
  const handleRevoke = async (
    apiKey
  ) => {
    if (!apiKey?.id) {
      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to revoke "${apiKey.name || "this API key"}"? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setRevokingKeyId(
        apiKey.id
      );

      if (
        typeof onRevoke ===
        "function"
      ) {
        await onRevoke(
          apiKey.id
        );
      }
    } catch (revokeError) {
      console.error(
        "Failed to revoke API key:",
        revokeError
      );
    } finally {
      setRevokingKeyId(
        null
      );
    }
  };

  /**
   * Get status class.
   */
  const getStatusClass = (
    status
  ) => {
    const normalizedStatus =
      String(
        status || "unknown"
      ).toLowerCase();

    if (
      normalizedStatus ===
      "active"
    ) {
      return "api-key-status api-key-status--active";
    }

    if (
      normalizedStatus ===
      "revoked"
    ) {
      return "api-key-status api-key-status--revoked";
    }

    if (
      normalizedStatus ===
      "expired"
    ) {
      return "api-key-status api-key-status--expired";
    }

    return "api-key-status";
  };

  /**
   * Loading state.
   */
  if (loading) {
    return (
      <div
        className="api-key-table-wrapper"
        aria-busy="true"
      >
        <div className="api-key-table-loading">
          <div className="api-key-table-spinner" />

          <p>
            Loading API keys...
          </p>
        </div>
      </div>
    );
  }

  /**
   * Error state.
   */
  if (error) {
    return (
      <div
        className="api-key-table-wrapper"
        role="alert"
      >
        <div className="api-key-table-error">
          <h3>
            Unable to load API keys
          </h3>

          <p>
            {error?.message ||
              error ||
              "An unexpected error occurred."}
          </p>

          {typeof onRefresh ===
            "function" && (
            <button
              type="button"
              onClick={
                onRefresh
              }
              className="api-key-refresh-button"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  /**
   * Empty state.
   */
  if (
    !Array.isArray(
      apiKeys
    ) ||
    apiKeys.length === 0
  ) {
    return (
      <div className="api-key-table-wrapper">
        <div className="api-key-table-empty">
          <div className="api-key-empty-icon">
            🔑
          </div>

          <h3>
            No API keys found
          </h3>

          <p>
            Create an API key to
            authenticate requests
            from your applications.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="api-key-table-wrapper">
      {/* ======================================
          Table Header
      ======================================= */}
      <div className="api-key-table-toolbar">
        <div>
          <h2>
            API Keys
          </h2>

          <p>
            Manage credentials used to
            access your platform APIs.
          </p>
        </div>

        {typeof onRefresh ===
          "function" && (
          <button
            type="button"
            onClick={
              onRefresh
            }
            className="api-key-refresh-button"
          >
            Refresh
          </button>
        )}
      </div>

      {/* ======================================
          Table
      ======================================= */}
      <div className="api-key-table-scroll">
        <table className="api-key-table">
          <thead>
            <tr>
              <th>
                Name
              </th>

              <th>
                API Key
              </th>

              <th>
                Status
              </th>

              <th>
                Scopes
              </th>

              <th>
                Created
              </th>

              <th>
                Last Used
              </th>

              <th>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {apiKeys.map(
              (apiKey) => {
                const keyId =
                  apiKey?.id;

                const displayKey =
                  apiKey?.key ||
                  apiKey?.token ||
                  apiKey?.prefix ||
                  "••••••••••••";

                const scopes =
                  Array.isArray(
                    apiKey?.scopes
                  )
                    ? apiKey.scopes
                    : [];

                const isRevoking =
                  revokingKeyId ===
                  keyId;

                return (
                  <tr
                    key={
                      keyId ||
                      displayKey
                    }
                  >
                    {/* ==============================
                        Name
                    =============================== */}
                    <td>
                      <div className="api-key-name">
                        <strong>
                          {apiKey?.name ||
                            "Unnamed API Key"}
                        </strong>

                        {apiKey?.description && (
                          <span>
                            {
                              apiKey.description
                            }
                          </span>
                        )}
                      </div>
                    </td>

                    {/* ==============================
                        API Key
                    =============================== */}
                    <td>
                      <div className="api-key-value">
                        <code>
                          {displayKey}
                        </code>

                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              apiKey
                            )
                          }
                          disabled={
                            !apiKey?.key &&
                            !apiKey?.token
                          }
                          aria-label={`Copy ${apiKey?.name || "API key"}`}
                          className="api-key-copy-button"
                        >
                          {copiedKeyId ===
                          keyId
                            ? "Copied"
                            : "Copy"}
                        </button>
                      </div>
                    </td>

                    {/* ==============================
                        Status
                    =============================== */}
                    <td>
                      <span
                        className={getStatusClass(
                          apiKey?.status
                        )}
                      >
                        <span className="api-key-status-dot" />

                        {apiKey?.status ||
                          "Unknown"}
                      </span>
                    </td>

                    {/* ==============================
                        Scopes
                    =============================== */}
                    <td>
                      <div className="api-key-scopes">
                        {scopes.length >
                        0 ? (
                          scopes.map(
                            (
                              scope
                            ) => (
                              <span
                                key={
                                  scope
                                }
                                className="api-key-scope"
                              >
                                {
                                  scope
                                }
                              </span>
                            )
                          )
                        ) : (
                          <span>
                            No scopes
                          </span>
                        )}
                      </div>
                    </td>

                    {/* ==============================
                        Created
                    =============================== */}
                    <td>
                      {formatDate(
                        apiKey?.createdAt
                      )}
                    </td>

                    {/* ==============================
                        Last Used
                    =============================== */}
                    <td>
                      {formatDate(
                        apiKey?.lastUsedAt
                      )}
                    </td>

                    {/* ==============================
                        Actions
                    =============================== */}
                    <td>
                      <div className="api-key-actions">
                        {apiKey?.status !==
                          "revoked" && (
                          <button
                            type="button"
                            onClick={() =>
                              handleRevoke(
                                apiKey
                              )
                            }
                            disabled={
                              isRevoking
                            }
                            className="api-key-revoke-button"
                          >
                            {isRevoking
                              ? "Revoking..."
                              : "Revoke"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              }
            )}
          </tbody>
        </table>
      </div>

      {/* ======================================
          Footer
      ======================================= */}
      <div className="api-key-table-footer">
        <span>
          {apiKeys.length}{" "}
          {apiKeys.length === 1
            ? "API key"
            : "API keys"}
        </span>
      </div>
    </div>
  );
}