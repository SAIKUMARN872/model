"use client";

import React, { useMemo, useState } from "react";

import usePrompts from "../../hooks/usePrompts";
import Spinner from "../../components/loading/Spinner";

/**
 * Enterprise Prompt Management Page
 *
 * Route:
 * /prompts
 *
 * Responsibilities:
 * - List reusable prompts
 * - Search prompts
 * - Filter by status
 * - Filter by environment
 * - Create prompts
 * - Edit prompts
 * - Delete prompts
 * - View prompt details
 * - Manage prompt versions
 */
export default function PromptsPage() {
  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [environmentFilter, setEnvironmentFilter] =
    useState("all");

  const [selectedPrompt, setSelectedPrompt] =
    useState(null);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [editingPrompt, setEditingPrompt] =
    useState(null);

  const [deletingId, setDeletingId] =
    useState(null);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState(null);

  const [form, setForm] = useState({
    name: "",
    description: "",
    content: "",
    environment: "development",
    status: "draft",
    tags: "",
  });

  /**
   * Prompt data hook.
   */
  const {
    data,
    loading,
    refetch,
    createPrompt,
    updatePrompt,
    deletePrompt,
  } = usePrompts();

  /**
   * Normalize API response.
   */
  const prompts = useMemo(() => {
    if (Array.isArray(data)) {
      return data;
    }

    return (
      data?.prompts ||
      data?.items ||
      data?.results ||
      []
    );
  }, [data]);

  /**
   * Get unique environments.
   */
  const environments = useMemo(() => {
    const values = new Set();

    prompts.forEach((prompt) => {
      if (prompt?.environment) {
        values.add(
          String(
            prompt.environment
          ).toLowerCase()
        );
      }
    });

    return Array.from(values).sort();
  }, [prompts]);

  /**
   * Filter prompts.
   */
  const filteredPrompts = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return prompts.filter((prompt) => {
      const name =
        String(
          prompt?.name ||
            prompt?.title ||
            ""
        ).toLowerCase();

      const description =
        String(
          prompt?.description || ""
        ).toLowerCase();

      const content =
        String(
          prompt?.content ||
            prompt?.template ||
            ""
        ).toLowerCase();

      const status =
        String(
          prompt?.status ||
            "draft"
        ).toLowerCase();

      const environment =
        String(
          prompt?.environment ||
            "development"
        ).toLowerCase();

      const matchesSearch =
        !normalizedSearch ||
        name.includes(
          normalizedSearch
        ) ||
        description.includes(
          normalizedSearch
        ) ||
        content.includes(
          normalizedSearch
        );

      const matchesStatus =
        statusFilter === "all" ||
        status ===
          statusFilter;

      const matchesEnvironment =
        environmentFilter === "all" ||
        environment ===
          environmentFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesEnvironment
      );
    });
  }, [
    prompts,
    search,
    statusFilter,
    environmentFilter,
  ]);

  /**
   * Reset form.
   */
  const resetForm = () => {
    setForm({
      name: "",
      description: "",
      content: "",
      environment: "development",
      status: "draft",
      tags: "",
    });

    setEditingPrompt(null);
  };

  /**
   * Open create modal.
   */
  const handleCreate = () => {
    resetForm();

    setError(null);

    setShowCreateModal(true);
  };

  /**
   * Open edit modal.
   */
  const handleEdit = (
    prompt
  ) => {
    setEditingPrompt(prompt);

    setForm({
      name:
        prompt?.name ||
        prompt?.title ||
        "",
      description:
        prompt?.description ||
        "",
      content:
        prompt?.content ||
        prompt?.template ||
        "",
      environment:
        prompt?.environment ||
        "development",
      status:
        prompt?.status ||
        "draft",
      tags:
        Array.isArray(
          prompt?.tags
        )
          ? prompt.tags.join(
              ", "
            )
          : prompt?.tags ||
            "",
    });

    setError(null);

    setShowCreateModal(true);
  };

  /**
   * Handle form field changes.
   */
  const handleFormChange = (
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  /**
   * Save prompt.
   */
  const handleSubmit = async (
    event
  ) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError(
        "Prompt name is required."
      );

      return;
    }

    if (!form.content.trim()) {
      setError(
        "Prompt content is required."
      );

      return;
    }

    try {
      setSaving(true);

      setError(null);

      const payload = {
        name:
          form.name.trim(),

        description:
          form.description.trim(),

        content:
          form.content,

        environment:
          form.environment,

        status:
          form.status,

        tags: form.tags
          .split(",")
          .map(
            (tag) =>
              tag.trim()
          )
          .filter(Boolean),
      };

      if (
        editingPrompt
      ) {
        const promptId =
          editingPrompt.id ||
          editingPrompt.promptId;

        if (
          typeof updatePrompt ===
          "function"
        ) {
          await updatePrompt(
            promptId,
            payload
          );
        }
      } else {
        if (
          typeof createPrompt ===
          "function"
        ) {
          await createPrompt(
            payload
          );
        }
      }

      setShowCreateModal(false);

      resetForm();

      await refetch?.();
    } catch (requestError) {
      console.error(
        "Failed to save prompt:",
        requestError
      );

      setError(
        requestError?.message ||
          "Unable to save prompt."
      );
    } finally {
      setSaving(false);
    }
  };

  /**
   * Delete prompt.
   */
  const handleDelete = async (
    prompt
  ) => {
    const promptId =
      prompt?.id ||
      prompt?.promptId;

    if (!promptId) {
      setError(
        "Unable to identify the prompt."
      );

      return;
    }

    const confirmed =
      window.confirm(
        `Are you sure you want to delete "${prompt.name}"? This action cannot be undone.`
      );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(promptId);

      setError(null);

      if (
        typeof deletePrompt ===
        "function"
      ) {
        await deletePrompt(
          promptId
        );
      }

      if (
        selectedPrompt?.id ===
        promptId
      ) {
        setSelectedPrompt(null);
      }

      await refetch?.();
    } catch (requestError) {
      console.error(
        "Failed to delete prompt:",
        requestError
      );

      setError(
        requestError?.message ||
          "Unable to delete prompt."
      );
    } finally {
      setDeletingId(null);
    }
  };

  /**
   * Get prompt status.
   */
  const getStatus = (
    prompt
  ) => {
    return String(
      prompt?.status ||
        "draft"
    ).toLowerCase();
  };

  /**
   * Get prompt version.
   */
  const getVersion = (
    prompt
  ) => {
    return (
      prompt?.version ||
      prompt?.currentVersion ||
      1
    );
  };

  /**
   * Initial loading state.
   */
  if (
    loading &&
    prompts.length === 0
  ) {
    return (
      <main
        className="console-prompts"
        aria-label="Prompt Management"
      >
        <div className="prompts-loading">
          <Spinner />

          <p>
            Loading prompts...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="console-prompts"
      aria-label="Prompt Management"
    >
      {/* ========================================
          Page Header
      ========================================= */}
      <header className="prompts-header">
        <div>
          <h1>
            Prompts
          </h1>

          <p>
            Create, manage, and reuse
            production-ready prompts
            across your AI applications.
          </p>
        </div>

        <button
          type="button"
          className="prompts-primary-button"
          onClick={
            handleCreate
          }
        >
          Create Prompt
        </button>
      </header>

      {/* ========================================
          Error Message
      ========================================= */}
      {error && (
        <div
          className="prompts-error"
          role="alert"
        >
          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              setError(null)
            }
          >
            Dismiss
          </button>
        </div>
      )}

      {/* ========================================
          Prompt Statistics
      ========================================= */}
      <section className="prompts-stats">
        <div className="prompt-stat-card">
          <span>
            Total Prompts
          </span>

          <strong>
            {prompts.length}
          </strong>
        </div>

        <div className="prompt-stat-card">
          <span>
            Published
          </span>

          <strong>
            {
              prompts.filter(
                (prompt) =>
                  getStatus(
                    prompt
                  ) ===
                  "published"
              ).length
            }
          </strong>
        </div>

        <div className="prompt-stat-card">
          <span>
            Drafts
          </span>

          <strong>
            {
              prompts.filter(
                (prompt) =>
                  getStatus(
                    prompt
                  ) ===
                  "draft"
              ).length
            }
          </strong>
        </div>

        <div className="prompt-stat-card">
          <span>
            Environments
          </span>

          <strong>
            {environments.length}
          </strong>
        </div>
      </section>

      {/* ========================================
          Filters
      ========================================= */}
      <section
        className="prompts-toolbar"
        aria-label="Prompt filters"
      >
        <div className="prompts-search">
          <label
            htmlFor="prompt-search"
            className="sr-only"
          >
            Search prompts
          </label>

          <input
            id="prompt-search"
            type="search"
            placeholder="Search prompts..."
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
          />
        </div>

        <div className="prompts-filter">
          <label htmlFor="prompt-status">
            Status
          </label>

          <select
            id="prompt-status"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All Statuses
            </option>

            <option value="draft">
              Draft
            </option>

            <option value="published">
              Published
            </option>

            <option value="archived">
              Archived
            </option>
          </select>
        </div>

        <div className="prompts-filter">
          <label htmlFor="prompt-environment">
            Environment
          </label>

          <select
            id="prompt-environment"
            value={
              environmentFilter
            }
            onChange={(event) =>
              setEnvironmentFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All Environments
            </option>

            {environments.map(
              (environment) => (
                <option
                  key={
                    environment
                  }
                  value={
                    environment
                  }
                >
                  {environment}
                </option>
              )
            )}
          </select>
        </div>
      </section>

      {/* ========================================
          Prompt List
      ========================================= */}
      <section
        className="prompts-list"
        aria-label="Prompts"
      >
        {filteredPrompts.length ===
        0 ? (
          <div className="prompts-empty">
            <h2>
              No prompts found
            </h2>

            <p>
              Create a prompt or
              adjust your search and
              filters.
            </p>

            <button
              type="button"
              className="prompts-primary-button"
              onClick={
                handleCreate
              }
            >
              Create Prompt
            </button>
          </div>
        ) : (
          <div className="prompts-table-container">
            <table className="prompts-table">
              <thead>
                <tr>
                  <th>
                    Name
                  </th>

                  <th>
                    Environment
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Version
                  </th>

                  <th>
                    Updated
                  </th>

                  <th>
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredPrompts.map(
                  (prompt) => {
                    const promptId =
                      prompt?.id ||
                      prompt?.promptId;

                    return (
                      <tr
                        key={
                          promptId
                        }
                      >
                        <td>
                          <div className="prompt-name-cell">
                            <strong>
                              {prompt.name ||
                                prompt.title ||
                                "Untitled Prompt"}
                            </strong>

                            <span>
                              {prompt.description ||
                                "No description"}
                            </span>
                          </div>
                        </td>

                        <td>
                          <span className="prompt-environment">
                            {prompt.environment ||
                              "development"}
                          </span>
                        </td>

                        <td>
                          <span
                            className={`prompt-status prompt-status--${getStatus(
                              prompt
                            )}`}
                          >
                            {getStatus(
                              prompt
                            )}
                          </span>
                        </td>

                        <td>
                          v
                          {getVersion(
                            prompt
                          )}
                        </td>

                        <td>
                          {prompt.updatedAt
                            ? new Intl.DateTimeFormat(
                                "en-IN",
                                {
                                  dateStyle:
                                    "medium",
                                }
                              ).format(
                                new Date(
                                  prompt.updatedAt
                                )
                              )
                            : "—"}
                        </td>

                        <td>
                          <div className="prompt-actions">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedPrompt(
                                  prompt
                                )
                              }
                            >
                              View
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                handleEdit(
                                  prompt
                                )
                              }
                            >
                              Edit
                            </button>

                            <button
                              type="button"
                              disabled={
                                deletingId ===
                                promptId
                              }
                              onClick={() =>
                                handleDelete(
                                  prompt
                                )
                              }
                            >
                              {deletingId ===
                              promptId
                                ? "Deleting..."
                                : "Delete"}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ========================================
          Create / Edit Modal
      ========================================= */}
      {showCreateModal && (
        <div
          className="prompt-modal-overlay"
          role="presentation"
        >
          <div
            className="prompt-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="prompt-modal-title"
          >
            <header className="prompt-modal-header">
              <div>
                <h2 id="prompt-modal-title">
                  {editingPrompt
                    ? "Edit Prompt"
                    : "Create Prompt"}
                </h2>

                <p>
                  Define a reusable
                  prompt template.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close"
                onClick={() => {
                  setShowCreateModal(
                    false
                  );

                  resetForm();
                }}
              >
                ×
              </button>
            </header>

            <form
              className="prompt-form"
              onSubmit={
                handleSubmit
              }
            >
              <div className="prompt-form-field">
                <label htmlFor="prompt-name">
                  Name
                </label>

                <input
                  id="prompt-name"
                  type="text"
                  value={
                    form.name
                  }
                  onChange={(event) =>
                    handleFormChange(
                      "name",
                      event.target
                        .value
                    )
                  }
                  placeholder="Customer Support Assistant"
                  required
                />
              </div>

              <div className="prompt-form-field">
                <label htmlFor="prompt-description">
                  Description
                </label>

                <input
                  id="prompt-description"
                  type="text"
                  value={
                    form.description
                  }
                  onChange={(event) =>
                    handleFormChange(
                      "description",
                      event.target
                        .value
                    )
                  }
                  placeholder="Handles customer support requests."
                />
              </div>

              <div className="prompt-form-row">
                <div className="prompt-form-field">
                  <label htmlFor="prompt-environment-form">
                    Environment
                  </label>

                  <select
                    id="prompt-environment-form"
                    value={
                      form.environment
                    }
                    onChange={(event) =>
                      handleFormChange(
                        "environment",
                        event.target
                          .value
                      )
                    }
                  >
                    <option value="development">
                      Development
                    </option>

                    <option value="staging">
                      Staging
                    </option>

                    <option value="production">
                      Production
                    </option>
                  </select>
                </div>

                <div className="prompt-form-field">
                  <label htmlFor="prompt-status-form">
                    Status
                  </label>

                  <select
                    id="prompt-status-form"
                    value={
                      form.status
                    }
                    onChange={(event) =>
                      handleFormChange(
                        "status",
                        event.target
                          .value
                      )
                    }
                  >
                    <option value="draft">
                      Draft
                    </option>

                    <option value="published">
                      Published
                    </option>

                    <option value="archived">
                      Archived
                    </option>
                  </select>
                </div>
              </div>

              <div className="prompt-form-field">
                <label htmlFor="prompt-tags">
                  Tags
                </label>

                <input
                  id="prompt-tags"
                  type="text"
                  value={
                    form.tags
                  }
                  onChange={(event) =>
                    handleFormChange(
                      "tags",
                      event.target
                        .value
                    )
                  }
                  placeholder="support, customer, production"
                />

                <small>
                  Separate tags with
                  commas.
                </small>
              </div>

              <div className="prompt-form-field">
                <label htmlFor="prompt-content">
                  Prompt Content
                </label>

                <textarea
                  id="prompt-content"
                  value={
                    form.content
                  }
                  onChange={(event) =>
                    handleFormChange(
                      "content",
                      event.target
                        .value
                    )
                  }
                  placeholder="You are a helpful customer support assistant..."
                  rows={12}
                  required
                />
              </div>

              <footer className="prompt-modal-footer">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(
                      false
                    );

                    resetForm();
                  }}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="prompts-primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingPrompt
                    ? "Update Prompt"
                    : "Create Prompt"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}

      {/* ========================================
          Prompt Details Modal
      ========================================= */}
      {selectedPrompt && (
        <div
          className="prompt-modal-overlay"
          role="presentation"
        >
          <div
            className="prompt-details-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="prompt-details-title"
          >
            <header className="prompt-modal-header">
              <div>
                <h2 id="prompt-details-title">
                  {selectedPrompt.name ||
                    selectedPrompt.title}
                </h2>

                <p>
                  Prompt version v
                  {getVersion(
                    selectedPrompt
                  )}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close prompt details"
                onClick={() =>
                  setSelectedPrompt(
                    null
                  )
                }
              >
                ×
              </button>
            </header>

            <div className="prompt-details-content">
              <div className="prompt-detail-meta">
                <span>
                  Environment:{" "}
                  <strong>
                    {selectedPrompt.environment ||
                      "development"}
                  </strong>
                </span>

                <span>
                  Status:{" "}
                  <strong>
                    {getStatus(
                      selectedPrompt
                    )}
                  </strong>
                </span>

                <span>
                  Version:{" "}
                  <strong>
                    v
                    {getVersion(
                      selectedPrompt
                    )}
                  </strong>
                </span>
              </div>

              <div className="prompt-detail-description">
                <h3>
                  Description
                </h3>

                <p>
                  {selectedPrompt.description ||
                    "No description available."}
                </p>
              </div>

              <div className="prompt-detail-content">
                <h3>
                  Prompt Content
                </h3>

                <pre>
                  {selectedPrompt.content ||
                    selectedPrompt.template ||
                    "No prompt content available."}
                </pre>
              </div>

              {Array.isArray(
                selectedPrompt.tags
              ) &&
                selectedPrompt.tags
                  .length > 0 && (
                  <div className="prompt-detail-tags">
                    <h3>
                      Tags
                    </h3>

                    <div>
                      {selectedPrompt.tags.map(
                        (tag) => (
                          <span
                            key={tag}
                          >
                            {tag}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}
            </div>

            <footer className="prompt-modal-footer">
              <button
                type="button"
                onClick={() =>
                  setSelectedPrompt(
                    null
                  )
                }
              >
                Close
              </button>

              <button
                type="button"
                className="prompts-primary-button"
                onClick={() => {
                  handleEdit(
                    selectedPrompt
                  );

                  setSelectedPrompt(
                    null
                  );
                }}
              >
                Edit Prompt
              </button>
            </footer>
          </div>
        </div>
      )}
    </main>
  );
}