import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

const MEMORY_TYPES = Object.freeze({
  SHORT_TERM: "short_term",
  LONG_TERM: "long_term",
  SEMANTIC: "semantic",
  EPISODIC: "episodic",
});

const MEMORY_STATUS = Object.freeze({
  ACTIVE: "active",
  ARCHIVED: "archived",
  DELETED: "deleted",
});

const MemoryManager = ({
  apiBaseUrl = "/api",
  agentId,
  workspaceId,
  agentName = "AI Agent",
}) => {
  const [memories, setMemories] = useState(
    []
  );

  const [search, setSearch] =
    useState("");

  const [typeFilter, setTypeFilter] =
    useState("all");

  const [statusFilter, setStatusFilter] =
    useState(
      MEMORY_STATUS.ACTIVE
    );

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState(null);

  const [error, setError] =
    useState(null);

  const [success, setSuccess] =
    useState(null);

  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [form, setForm] = useState({
    content: "",
    type: MEMORY_TYPES.LONG_TERM,
    importance: 0.5,
    tags: "",
  });

  const loadMemories =
    useCallback(async () => {
      if (!agentId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const params =
          new URLSearchParams();

        params.set(
          "agentId",
          agentId
        );

        if (workspaceId) {
          params.set(
            "workspaceId",
            workspaceId
          );
        }

        params.set(
          "status",
          statusFilter
        );

        const response =
          await fetch(
            `${apiBaseUrl}/memories?${params.toString()}`,
            {
              method: "GET",
              credentials: "include",
              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        if (!response.ok) {
          throw new Error(
            `Unable to load memories (${response.status}).`
          );
        }

        const data =
          await response.json();

        setMemories(
          Array.isArray(data.memories)
            ? data.memories
            : []
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load memories."
        );
      } finally {
        setLoading(false);
      }
    }, [
      apiBaseUrl,
      agentId,
      workspaceId,
      statusFilter,
    ]);

  useEffect(() => {
    loadMemories();
  }, [loadMemories]);

  const filteredMemories =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return memories.filter(
        (memory) => {
          const matchesType =
            typeFilter === "all" ||
            memory.type === typeFilter;

          const searchableText =
            [
              memory.content,
              ...(Array.isArray(
                memory.tags
              )
                ? memory.tags
                : []),
            ]
              .join(" ")
              .toLowerCase();

          const matchesSearch =
            !normalizedSearch ||
            searchableText.includes(
              normalizedSearch
            );

          return (
            matchesType &&
            matchesSearch
          );
        }
      );
    }, [
      memories,
      search,
      typeFilter,
    ]);

  const updateForm = (
    field,
    value
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const createMemory =
    async (event) => {
      event.preventDefault();

      if (!form.content.trim()) {
        setError(
          "Memory content is required."
        );

        return;
      }

      setSaving(true);
      setError(null);
      setSuccess(null);

      try {
        const response =
          await fetch(
            `${apiBaseUrl}/memories`,
            {
              method: "POST",
              credentials: "include",
              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },
              body: JSON.stringify({
                agentId,
                workspaceId,
                content:
                  form.content.trim(),

                type: form.type,

                importance:
                  Number(
                    form.importance
                  ),

                tags: form.tags
                  .split(",")
                  .map((tag) =>
                    tag.trim()
                  )
                  .filter(Boolean),
              }),
            }
          );

        if (!response.ok) {
          throw new Error(
            "Failed to create memory."
          );
        }

        const data =
          await response.json();

        if (data.memory) {
          setMemories(
            (current) => [
              data.memory,
              ...current,
            ]
          );
        } else {
          await loadMemories();
        }

        setForm({
          content: "",
          type:
            MEMORY_TYPES.LONG_TERM,
          importance: 0.5,
          tags: "",
        });

        setShowCreateForm(false);

        setSuccess(
          "Memory created successfully."
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to create memory."
        );
      } finally {
        setSaving(false);
      }
    };

  const archiveMemory =
    async (memoryId) => {
      setDeletingId(memoryId);
      setError(null);
      setSuccess(null);

      try {
        const response =
          await fetch(
            `${apiBaseUrl}/memories/${memoryId}`,
            {
              method: "PATCH",
              credentials: "include",
              headers: {
                "Content-Type":
                  "application/json",

                Accept:
                  "application/json",
              },
              body: JSON.stringify({
                status:
                  MEMORY_STATUS.ARCHIVED,
              }),
            }
          );

        if (!response.ok) {
          throw new Error(
            "Failed to archive memory."
          );
        }

        setMemories(
          (current) =>
            current.filter(
              (memory) =>
                memory.id !== memoryId
            )
        );

        setSuccess(
          "Memory archived successfully."
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to archive memory."
        );
      } finally {
        setDeletingId(null);
      }
    };

  const deleteMemory =
    async (memoryId) => {
      const confirmed =
        window.confirm(
          "Are you sure you want to permanently delete this memory?"
        );

      if (!confirmed) {
        return;
      }

      setDeletingId(memoryId);
      setError(null);
      setSuccess(null);

      try {
        const response =
          await fetch(
            `${apiBaseUrl}/memories/${memoryId}`,
            {
              method: "DELETE",
              credentials: "include",
              headers: {
                Accept:
                  "application/json",
              },
            }
          );

        if (!response.ok) {
          throw new Error(
            "Failed to delete memory."
          );
        }

        setMemories(
          (current) =>
            current.filter(
              (memory) =>
                memory.id !== memoryId
            )
        );

        setSuccess(
          "Memory deleted successfully."
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to delete memory."
        );
      } finally {
        setDeletingId(null);
      }
    };

  if (loading) {
    return (
      <section className="memory-manager">
        <div className="memory-manager__loading">
          Loading agent memory...
        </div>
      </section>
    );
  }

  return (
    <section className="memory-manager">
      <header className="memory-manager__header">
        <div>
          <span className="memory-manager__eyebrow">
            Agent Memory
          </span>

          <h2>
            Memory Manager
          </h2>

          <p>
            Manage persistent context and
            knowledge stored for{" "}
            <strong>
              {agentName}
            </strong>
            .
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowCreateForm(
              (current) => !current
            )
          }
        >
          {showCreateForm
            ? "Cancel"
            : "Add Memory"}
        </button>
      </header>

      {error && (
        <div
          className="memory-manager__alert memory-manager__alert--error"
          role="alert"
        >
          {error}
        </div>
      )}

      {success && (
        <div
          className="memory-manager__alert memory-manager__alert--success"
          role="status"
        >
          {success}
        </div>
      )}

      {showCreateForm && (
        <form
          className="memory-manager__create-form"
          onSubmit={createMemory}
        >
          <div className="memory-manager__field">
            <label htmlFor="memory-content">
              Memory Content
            </label>

            <textarea
              id="memory-content"
              value={form.content}
              onChange={(event) =>
                updateForm(
                  "content",
                  event.target.value
                )
              }
              placeholder="Enter information the agent should remember..."
              rows={5}
              required
            />
          </div>

          <div className="memory-manager__form-grid">
            <div className="memory-manager__field">
              <label htmlFor="memory-type">
                Memory Type
              </label>

              <select
                id="memory-type"
                value={form.type}
                onChange={(event) =>
                  updateForm(
                    "type",
                    event.target.value
                  )
                }
              >
                <option
                  value={
                    MEMORY_TYPES.SHORT_TERM
                  }
                >
                  Short Term
                </option>

                <option
                  value={
                    MEMORY_TYPES.LONG_TERM
                  }
                >
                  Long Term
                </option>

                <option
                  value={
                    MEMORY_TYPES.SEMANTIC
                  }
                >
                  Semantic
                </option>

                <option
                  value={
                    MEMORY_TYPES.EPISODIC
                  }
                >
                  Episodic
                </option>
              </select>
            </div>

            <div className="memory-manager__field">
              <label htmlFor="memory-importance">
                Importance
              </label>

              <input
                id="memory-importance"
                type="number"
                min="0"
                max="1"
                step="0.1"
                value={
                  form.importance
                }
                onChange={(event) =>
                  updateForm(
                    "importance",
                    event.target.value
                  )
                }
              />
            </div>

            <div className="memory-manager__field">
              <label htmlFor="memory-tags">
                Tags
              </label>

              <input
                id="memory-tags"
                type="text"
                value={form.tags}
                onChange={(event) =>
                  updateForm(
                    "tags",
                    event.target.value
                  )
                }
                placeholder="user, preference, project"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
          >
            {saving
              ? "Saving..."
              : "Save Memory"}
          </button>
        </form>
      )}

      <div className="memory-manager__toolbar">
        <div className="memory-manager__search">
          <label htmlFor="memory-search">
            Search Memory
          </label>

          <input
            id="memory-search"
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Search stored memories..."
          />
        </div>

        <div className="memory-manager__filter">
          <label htmlFor="memory-type-filter">
            Type
          </label>

          <select
            id="memory-type-filter"
            value={typeFilter}
            onChange={(event) =>
              setTypeFilter(
                event.target.value
              )
            }
          >
            <option value="all">
              All Types
            </option>

            <option
              value={
                MEMORY_TYPES.SHORT_TERM
              }
            >
              Short Term
            </option>

            <option
              value={
                MEMORY_TYPES.LONG_TERM
              }
            >
              Long Term
            </option>

            <option
              value={
                MEMORY_TYPES.SEMANTIC
              }
            >
              Semantic
            </option>

            <option
              value={
                MEMORY_TYPES.EPISODIC
              }
            >
              Episodic
            </option>
          </select>
        </div>

        <div className="memory-manager__filter">
          <label htmlFor="memory-status-filter">
            Status
          </label>

          <select
            id="memory-status-filter"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
          >
            <option
              value={
                MEMORY_STATUS.ACTIVE
              }
            >
              Active
            </option>

            <option
              value={
                MEMORY_STATUS.ARCHIVED
              }
            >
              Archived
            </option>
          </select>
        </div>
      </div>

      <section className="memory-manager__list">
        <div className="memory-manager__list-header">
          <div>
            <h3>
              Stored Memories
            </h3>

            <p>
              {filteredMemories.length}{" "}
              memories found
            </p>
          </div>

          <button
            type="button"
            onClick={loadMemories}
          >
            Refresh
          </button>
        </div>

        {filteredMemories.length ===
        0 ? (
          <div className="memory-manager__empty">
            <strong>
              No memories found
            </strong>

            <p>
              Add a memory or change
              your search filters.
            </p>
          </div>
        ) : (
          <div className="memory-manager__memory-list">
            {filteredMemories.map(
              (memory) => (
                <article
                  key={memory.id}
                  className="memory-manager__memory-card"
                >
                  <div className="memory-manager__memory-header">
                    <div>
                      <span
                        className={`memory-manager__type memory-manager__type--${memory.type}`}
                      >
                        {memory.type ||
                          "unknown"}
                      </span>

                      <span
                        className={`memory-manager__status memory-manager__status--${memory.status}`}
                      >
                        {memory.status ||
                          "active"}
                      </span>
                    </div>

                    <span>
                      Importance:{" "}
                      {Number(
                        memory.importance ||
                          0
                      ).toFixed(1)}
                    </span>
                  </div>

                  <p className="memory-manager__content">
                    {memory.content}
                  </p>

                  {Array.isArray(
                    memory.tags
                  ) &&
                    memory.tags.length >
                      0 && (
                      <div className="memory-manager__tags">
                        {memory.tags.map(
                          (tag) => (
                            <span
                              key={tag}
                            >
                              #
                              {tag}
                            </span>
                          )
                        )}
                      </div>
                    )}

                  <footer className="memory-manager__memory-footer">
                    <small>
                      {memory.createdAt
                        ? new Date(
                            memory.createdAt
                          ).toLocaleString()
                        : "Recently created"}
                    </small>

                    <div>
                      <button
                        type="button"
                        disabled={
                          deletingId ===
                          memory.id
                        }
                        onClick={() =>
                          archiveMemory(
                            memory.id
                          )
                        }
                      >
                        Archive
                      </button>

                      <button
                        type="button"
                        disabled={
                          deletingId ===
                          memory.id
                        }
                        onClick={() =>
                          deleteMemory(
                            memory.id
                          )
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </footer>
                </article>
              )
            )}
          </div>
        )}
      </section>
    </section>
  );
};

export default MemoryManager;