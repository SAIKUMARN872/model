import React, { useCallback, useEffect, useMemo, useState } from "react";

/* =========================================================
   Constants
========================================================= */

const AGENT_STATUS = {
  RUNNING: "running",
  STOPPED: "stopped",
  PAUSED: "paused",
  ERROR: "error",
};

const AGENT_TYPES = {
  AI: "AI Agent",
  WORKFLOW: "Workflow Agent",
  AUTOMATION: "Automation Agent",
  MONITORING: "Monitoring Agent",
};

const ENVIRONMENTS = {
  DEVELOPMENT: "Development",
  STAGING: "Staging",
  PRODUCTION: "Production",
};

/* =========================================================
   Demo Data
   Replace with real API data later
========================================================= */

const DEMO_AGENTS = [
  {
    id: "agent_001",
    name: "Customer Support Agent",
    description:
      "Handles customer questions, support requests and ticket routing.",
    type: AGENT_TYPES.AI,
    status: AGENT_STATUS.RUNNING,
    health: 98,
    version: "2.4.1",
    owner: "Platform Team",
    environment: ENVIRONMENTS.PRODUCTION,
    executions: 12480,
    successRate: 99.2,
    lastActive: "2 minutes ago",
  },
  {
    id: "agent_002",
    name: "Data Analysis Agent",
    description:
      "Processes business data and generates automated analytical insights.",
    type: AGENT_TYPES.AI,
    status: AGENT_STATUS.RUNNING,
    health: 94,
    version: "1.9.0",
    owner: "Data Team",
    environment: ENVIRONMENTS.PRODUCTION,
    executions: 8230,
    successRate: 97.8,
    lastActive: "5 minutes ago",
  },
  {
    id: "agent_003",
    name: "Invoice Processing Agent",
    description:
      "Automates invoice extraction, validation and financial processing.",
    type: AGENT_TYPES.AUTOMATION,
    status: AGENT_STATUS.PAUSED,
    health: 87,
    version: "3.1.2",
    owner: "Finance Team",
    environment: ENVIRONMENTS.STAGING,
    executions: 4521,
    successRate: 95.4,
    lastActive: "1 hour ago",
  },
  {
    id: "agent_004",
    name: "Security Monitoring Agent",
    description:
      "Monitors system activity and detects suspicious security events.",
    type: AGENT_TYPES.MONITORING,
    status: AGENT_STATUS.RUNNING,
    health: 99,
    version: "4.0.0",
    owner: "Security Team",
    environment: ENVIRONMENTS.PRODUCTION,
    executions: 18790,
    successRate: 99.8,
    lastActive: "30 seconds ago",
  },
  {
    id: "agent_005",
    name: "Workflow Orchestrator",
    description:
      "Coordinates distributed business workflows across multiple services.",
    type: AGENT_TYPES.WORKFLOW,
    status: AGENT_STATUS.STOPPED,
    health: 100,
    version: "2.0.4",
    owner: "Engineering Team",
    environment: ENVIRONMENTS.DEVELOPMENT,
    executions: 2340,
    successRate: 98.1,
    lastActive: "Yesterday",
  },
];

/* =========================================================
   Utility Functions
========================================================= */

const generateId = () =>
  `agent_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 8)}`;

const formatNumber = (number) =>
  new Intl.NumberFormat("en-US").format(number);

const getStatusLabel = (status) => {
  const labels = {
    running: "Running",
    stopped: "Stopped",
    paused: "Paused",
    error: "Error",
  };

  return labels[status] || status;
};

/* =========================================================
   Mock API Layer
   Later replace with:
   services/agents/agentApi.jsx
========================================================= */

const agentApi = {
  getAgents: async () => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return [...DEMO_AGENTS];
  },

  createAgent: async (payload) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      ...payload,
      id: generateId(),
      status: AGENT_STATUS.STOPPED,
      health: 100,
      executions: 0,
      successRate: 100,
      lastActive: "Never",
    };
  },

  updateAgent: async (id, payload) => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    return {
      id,
      ...payload,
    };
  },

  deleteAgent: async () => {
    await new Promise((resolve) => setTimeout(resolve, 400));

    return true;
  },

  lifecycle: async (id, action) => {
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      id,
      action,
    };
  },
};

/* =========================================================
   Status Badge
========================================================= */

const StatusBadge = ({ status }) => {
  return (
    <span className={`agent-status agent-status-${status}`}>
      <span className="agent-status-dot" />
      {getStatusLabel(status)}
    </span>
  );
};

/* =========================================================
   Health Bar
========================================================= */

const HealthBar = ({ health }) => {
  const healthClass =
    health >= 90
      ? "health-good"
      : health >= 70
      ? "health-warning"
      : "health-danger";

  return (
    <div className="agent-health">
      <div className="agent-health-header">
        <span>System Health</span>

        <strong>{health}%</strong>
      </div>

      <div className="agent-health-track">
        <div
          className={`agent-health-progress ${healthClass}`}
          style={{
            width: `${health}%`,
          }}
        />
      </div>
    </div>
  );
};

/* =========================================================
   Agent Card
========================================================= */

const AgentCard = ({
  agent,
  onEdit,
  onDelete,
  onLifecycle,
}) => {
  return (
    <article className="agent-card">
      <div className="agent-card-header">
        <div>
          <h3>{agent.name}</h3>

          <span className="agent-type">
            {agent.type}
          </span>
        </div>

        <StatusBadge status={agent.status} />
      </div>

      <p className="agent-description">
        {agent.description}
      </p>

      <HealthBar health={agent.health} />

      <div className="agent-details">
        <div>
          <span>Owner</span>
          <strong>{agent.owner}</strong>
        </div>

        <div>
          <span>Environment</span>
          <strong>{agent.environment}</strong>
        </div>

        <div>
          <span>Version</span>
          <strong>v{agent.version}</strong>
        </div>

        <div>
          <span>Last Active</span>
          <strong>{agent.lastActive}</strong>
        </div>
      </div>

      <div className="agent-metrics">
        <div>
          <span>Executions</span>
          <strong>
            {formatNumber(agent.executions)}
          </strong>
        </div>

        <div>
          <span>Success Rate</span>
          <strong>{agent.successRate}%</strong>
        </div>
      </div>

      <div className="agent-actions">
        {agent.status === AGENT_STATUS.RUNNING && (
          <>
            <button
              type="button"
              className="button button-secondary"
              onClick={() =>
                onLifecycle(agent.id, "pause")
              }
            >
              Pause
            </button>

            <button
              type="button"
              className="button button-secondary"
              onClick={() =>
                onLifecycle(agent.id, "stop")
              }
            >
              Stop
            </button>
          </>
        )}

        {agent.status === AGENT_STATUS.PAUSED && (
          <button
            type="button"
            className="button button-primary"
            onClick={() =>
              onLifecycle(agent.id, "resume")
            }
          >
            Resume
          </button>
        )}

        {agent.status === AGENT_STATUS.STOPPED && (
          <button
            type="button"
            className="button button-primary"
            onClick={() =>
              onLifecycle(agent.id, "start")
            }
          >
            Start
          </button>
        )}

        <button
          type="button"
          className="button button-secondary"
          onClick={() => onEdit(agent)}
        >
          Edit
        </button>

        <button
          type="button"
          className="button button-danger"
          onClick={() => onDelete(agent.id)}
        >
          Delete
        </button>
      </div>
    </article>
  );
};

/* =========================================================
   Agent Modal
========================================================= */

const AgentModal = ({
  agent,
  onClose,
  onSave,
}) => {
  const editing = Boolean(agent);

  const [form, setForm] = useState({
    name: agent?.name || "",
    description: agent?.description || "",
    type: agent?.type || AGENT_TYPES.AI,
    owner: agent?.owner || "",
    environment:
      agent?.environment ||
      ENVIRONMENTS.DEVELOPMENT,
    version: agent?.version || "1.0.0",
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      return;
    }

    try {
      setSaving(true);

      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="agent-modal-overlay">
      <div className="agent-modal">
        <div className="agent-modal-header">
          <div>
            <h2>
              {editing
                ? "Edit Agent"
                : "Create New Agent"}
            </h2>

            <p>
              Configure your enterprise AI agent.
            </p>
          </div>

          <button
            type="button"
            className="agent-close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="agent-form-group">
            <label htmlFor="agent-name">
              Agent Name
            </label>

            <input
              id="agent-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Customer Support Agent"
              required
            />
          </div>

          <div className="agent-form-group">
            <label htmlFor="agent-description">
              Description
            </label>

            <textarea
              id="agent-description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Describe the purpose of this agent"
              rows={4}
            />
          </div>

          <div className="agent-form-row">
            <div className="agent-form-group">
              <label htmlFor="agent-type">
                Agent Type
              </label>

              <select
                id="agent-type"
                name="type"
                value={form.type}
                onChange={handleChange}
              >
                {Object.values(AGENT_TYPES).map(
                  (type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="agent-form-group">
              <label htmlFor="agent-environment">
                Environment
              </label>

              <select
                id="agent-environment"
                name="environment"
                value={form.environment}
                onChange={handleChange}
              >
                {Object.values(
                  ENVIRONMENTS
                ).map((environment) => (
                  <option
                    key={environment}
                    value={environment}
                  >
                    {environment}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="agent-form-row">
            <div className="agent-form-group">
              <label htmlFor="agent-owner">
                Owner
              </label>

              <input
                id="agent-owner"
                name="owner"
                value={form.owner}
                onChange={handleChange}
                placeholder="Platform Team"
              />
            </div>

            <div className="agent-form-group">
              <label htmlFor="agent-version">
                Version
              </label>

              <input
                id="agent-version"
                name="version"
                value={form.version}
                onChange={handleChange}
                placeholder="1.0.0"
              />
            </div>
          </div>

          <div className="agent-modal-actions">
            <button
              type="button"
              className="button button-secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="button button-primary"
              disabled={saving}
            >
              {saving
                ? "Saving..."
                : editing
                ? "Save Changes"
                : "Create Agent"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

/* =========================================================
   Main Agents Component
========================================================= */

const Agents = () => {
  const [agents, setAgents] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [environmentFilter, setEnvironmentFilter] =
    useState("all");

  const [sortBy, setSortBy] =
    useState("name");

  const [modalOpen, setModalOpen] =
    useState(false);

  const [selectedAgent, setSelectedAgent] =
    useState(null);

  /* =======================================================
     Fetch Agents
  ======================================================= */

  const fetchAgents = useCallback(async () => {
    try {
      setLoading(true);

      setError("");

      const response =
        await agentApi.getAgents();

      setAgents(response);
    } catch (err) {
      setError(
        err.message ||
          "Failed to load agents."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
  }, [fetchAgents]);

  /* =======================================================
     Filter + Search + Sort
  ======================================================= */

  const filteredAgents = useMemo(() => {
    const query =
      searchQuery
        .toLowerCase()
        .trim();

    return agents
      .filter((agent) => {
        const matchesSearch =
          !query ||
          agent.name
            .toLowerCase()
            .includes(query) ||
          agent.description
            .toLowerCase()
            .includes(query) ||
          agent.owner
            .toLowerCase()
            .includes(query);

        const matchesStatus =
          statusFilter === "all" ||
          agent.status === statusFilter;

        const matchesEnvironment =
          environmentFilter === "all" ||
          agent.environment ===
            environmentFilter;

        return (
          matchesSearch &&
          matchesStatus &&
          matchesEnvironment
        );
      })
      .sort((a, b) => {
        if (sortBy === "name") {
          return a.name.localeCompare(
            b.name
          );
        }

        if (sortBy === "health") {
          return b.health - a.health;
        }

        if (sortBy === "executions") {
          return (
            b.executions -
            a.executions
          );
        }

        return 0;
      });
  }, [
    agents,
    searchQuery,
    statusFilter,
    environmentFilter,
    sortBy,
  ]);

  /* =======================================================
     Statistics
  ======================================================= */

  const statistics = useMemo(() => {
    const total = agents.length;

    const running = agents.filter(
      (agent) =>
        agent.status ===
        AGENT_STATUS.RUNNING
    ).length;

    const paused = agents.filter(
      (agent) =>
        agent.status ===
        AGENT_STATUS.PAUSED
    ).length;

    const errors = agents.filter(
      (agent) =>
        agent.status ===
        AGENT_STATUS.ERROR
    ).length;

    return {
      total,
      running,
      paused,
      errors,
    };
  }, [agents]);

  /* =======================================================
     Save Agent
  ======================================================= */

  const handleSaveAgent = async (payload) => {
    try {
      setError("");

      if (selectedAgent) {
        const updated =
          await agentApi.updateAgent(
            selectedAgent.id,
            payload
          );

        setAgents((previous) =>
          previous.map((agent) =>
            agent.id === selectedAgent.id
              ? {
                  ...agent,
                  ...updated,
                }
              : agent
          )
        );
      } else {
        const created =
          await agentApi.createAgent(
            payload
          );

        setAgents((previous) => [
          created,
          ...previous,
        ]);
      }

      setModalOpen(false);

      setSelectedAgent(null);
    } catch (err) {
      setError(
        err.message ||
          "Failed to save agent."
      );

      throw err;
    }
  };

  /* =======================================================
     Delete Agent
  ======================================================= */

  const handleDeleteAgent = async (id) => {
    const agent = agents.find(
      (item) => item.id === id
    );

    const confirmed = window.confirm(
      `Delete "${agent?.name}"? This action cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await agentApi.deleteAgent(id);

      setAgents((previous) =>
        previous.filter(
          (item) => item.id !== id
        )
      );
    } catch (err) {
      setError(
        err.message ||
          "Failed to delete agent."
      );
    }
  };

  /* =======================================================
     Lifecycle Action
  ======================================================= */

  const handleLifecycle = async (
    id,
    action
  ) => {
    try {
      setError("");

      await agentApi.lifecycle(
        id,
        action
      );

      const nextStatus = {
        start: AGENT_STATUS.RUNNING,
        resume: AGENT_STATUS.RUNNING,
        pause: AGENT_STATUS.PAUSED,
        stop: AGENT_STATUS.STOPPED,
      };

      setAgents((previous) =>
        previous.map((agent) =>
          agent.id === id
            ? {
                ...agent,
                status:
                  nextStatus[action] ||
                  agent.status,
                lastActive:
                  action === "stop"
                    ? "Just now"
                    : agent.lastActive,
              }
            : agent
        )
      );
    } catch (err) {
      setError(
        err.message ||
          "Agent lifecycle operation failed."
      );
    }
  };

  /* =======================================================
     Loading State
  ======================================================= */

  if (loading) {
    return (
      <div className="agents-page">
        <div className="agents-loading">
          <div className="loading-spinner" />

          <p>
            Loading agent management
            console...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     Main UI
  ======================================================= */

  return (
    <div className="agents-page">
      <header className="agents-page-header">
        <div>
          <span className="agents-eyebrow">
            ENTERPRISE CONTROL CENTER
          </span>

          <h1>AI Agents</h1>

          <p>
            Deploy, monitor and manage
            intelligent agents across your
            organization.
          </p>
        </div>

        <button
          type="button"
          className="button button-primary button-large"
          onClick={() => {
            setSelectedAgent(null);
            setModalOpen(true);
          }}
        >
          + Create Agent
        </button>
      </header>

      {error && (
        <div className="agents-error">
          <strong>Something went wrong</strong>

          <span>{error}</span>

          <button
            type="button"
            onClick={() =>
              setError("")
            }
          >
            ×
          </button>
        </div>
      )}

      {/* Statistics */}

      <section className="agents-statistics">
        <div className="stat-card">
          <span>Total Agents</span>

          <strong>
            {statistics.total}
          </strong>
        </div>

        <div className="stat-card">
          <span>Running</span>

          <strong>
            {statistics.running}
          </strong>
        </div>

        <div className="stat-card">
          <span>Paused</span>

          <strong>
            {statistics.paused}
          </strong>
        </div>

        <div className="stat-card">
          <span>Errors</span>

          <strong>
            {statistics.errors}
          </strong>
        </div>
      </section>

      {/* Filters */}

      <section className="agents-toolbar">
        <div className="agent-search-wrapper">
          <span>⌕</span>

          <input
            type="search"
            value={searchQuery}
            onChange={(event) =>
              setSearchQuery(
                event.target.value
              )
            }
            placeholder="Search agents, owners..."
          />
        </div>

        <select
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

          <option value="running">
            Running
          </option>

          <option value="stopped">
            Stopped
          </option>

          <option value="paused">
            Paused
          </option>

          <option value="error">
            Error
          </option>
        </select>

        <select
          value={environmentFilter}
          onChange={(event) =>
            setEnvironmentFilter(
              event.target.value
            )
          }
        >
          <option value="all">
            All Environments
          </option>

          {Object.values(
            ENVIRONMENTS
          ).map((environment) => (
            <option
              key={environment}
              value={environment}
            >
              {environment}
            </option>
          ))}
        </select>

        <select
          value={sortBy}
          onChange={(event) =>
            setSortBy(
              event.target.value
            )
          }
        >
          <option value="name">
            Sort by Name
          </option>

          <option value="health">
            Sort by Health
          </option>

          <option value="executions">
            Sort by Executions
          </option>
        </select>
      </section>

      {/* Results */}

      <div className="agents-results-header">
        <span>
          Showing{" "}
          <strong>
            {filteredAgents.length}
          </strong>{" "}
          agents
        </span>
      </div>

      {filteredAgents.length === 0 ? (
        <div className="agents-empty">
          <h2>No agents found</h2>

          <p>
            Try changing your search or
            filter settings.
          </p>

          <button
            type="button"
            className="button button-primary"
            onClick={() => {
              setSearchQuery("");
              setStatusFilter("all");
              setEnvironmentFilter("all");
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <section className="agents-grid">
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              onEdit={(selected) => {
                setSelectedAgent(
                  selected
                );

                setModalOpen(true);
              }}
              onDelete={
                handleDeleteAgent
              }
              onLifecycle={
                handleLifecycle
              }
            />
          ))}
        </section>
      )}

      {/* Create / Edit Modal */}

      {modalOpen && (
        <AgentModal
          agent={selectedAgent}
          onClose={() => {
            setModalOpen(false);
            setSelectedAgent(null);
          }}
          onSave={handleSaveAgent}
        />
      )}
    </div>
  );
};

export default Agents;