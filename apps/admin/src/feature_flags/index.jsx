import React, { useMemo, useState } from "react";

const initialFeatureFlags = [
  {
    id: 1,
    name: "Advanced Analytics",
    key: "advanced_analytics",
    description:
      "Enables advanced analytics and reporting capabilities.",
    environment: "Production",
    enabled: true,
    rollout: 100,
    updatedAt: "Today",
  },
  {
    id: 2,
    name: "AI Cost Optimization",
    key: "ai_cost_optimization",
    description:
      "Enables intelligent AI usage and cost optimization features.",
    environment: "Production",
    enabled: true,
    rollout: 75,
    updatedAt: "Yesterday",
  },
  {
    id: 3,
    name: "New Dashboard",
    key: "new_dashboard",
    description:
      "Enables the next-generation administration dashboard.",
    environment: "Staging",
    enabled: true,
    rollout: 50,
    updatedAt: "2 days ago",
  },
  {
    id: 4,
    name: "Security Center",
    key: "security_center",
    description:
      "Provides centralized security monitoring and controls.",
    environment: "Production",
    enabled: true,
    rollout: 100,
    updatedAt: "3 days ago",
  },
  {
    id: 5,
    name: "Beta AI Models",
    key: "beta_ai_models",
    description:
      "Allows selected users to access experimental AI models.",
    environment: "Development",
    enabled: false,
    rollout: 10,
    updatedAt: "5 days ago",
  },
];

export default function FeatureFlags() {
  const [flags, setFlags] = useState(
    initialFeatureFlags
  );

  const [search, setSearch] = useState("");
  const [environment, setEnvironment] =
    useState("All");

  const [showCreateForm, setShowCreateForm] =
    useState(false);

  const [newFlag, setNewFlag] = useState({
    name: "",
    key: "",
    description: "",
    environment: "Development",
    rollout: 100,
  });

  const filteredFlags = useMemo(() => {
    return flags.filter((flag) => {
      const matchesSearch =
        flag.name
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        flag.key
          .toLowerCase()
          .includes(search.toLowerCase());

      const matchesEnvironment =
        environment === "All" ||
        flag.environment === environment;

      return (
        matchesSearch &&
        matchesEnvironment
      );
    });
  }, [flags, search, environment]);

  const enabledCount = flags.filter(
    (flag) => flag.enabled
  ).length;

  const disabledCount =
    flags.length - enabledCount;

  const productionCount = flags.filter(
    (flag) =>
      flag.environment === "Production"
  ).length;

  const toggleFlag = (id) => {
    setFlags((currentFlags) =>
      currentFlags.map((flag) =>
        flag.id === id
          ? {
              ...flag,
              enabled: !flag.enabled,
              updatedAt: "Just now",
            }
          : flag
      )
    );
  };

  const handleCreateFlag = (event) => {
    event.preventDefault();

    if (
      !newFlag.name.trim() ||
      !newFlag.key.trim()
    ) {
      return;
    }

    const flag = {
      id: Date.now(),
      name: newFlag.name,
      key: newFlag.key,
      description:
        newFlag.description ||
        "No description provided.",
      environment: newFlag.environment,
      enabled: false,
      rollout: Number(newFlag.rollout),
      updatedAt: "Just now",
    };

    setFlags((currentFlags) => [
      flag,
      ...currentFlags,
    ]);

    setNewFlag({
      name: "",
      key: "",
      description: "",
      environment: "Development",
      rollout: 100,
    });

    setShowCreateForm(false);
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Feature Flags
          </h1>

          <p style={styles.subtitle}>
            Manage feature releases, environments,
            and controlled rollouts across your
            platform.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowCreateForm(
              !showCreateForm
            )
          }
          style={styles.primaryButton}
        >
          + Create Feature Flag
        </button>
      </div>

      {/* Statistics */}
      <div style={styles.statsGrid}>
        <StatCard
          title="Total Flags"
          value={flags.length}
          description="Configured feature flags"
        />

        <StatCard
          title="Enabled"
          value={enabledCount}
          description="Currently active"
        />

        <StatCard
          title="Disabled"
          value={disabledCount}
          description="Currently inactive"
        />

        <StatCard
          title="Production"
          value={productionCount}
          description="Production flags"
        />
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div style={styles.formCard}>
          <h2 style={styles.formTitle}>
            Create Feature Flag
          </h2>

          <form
            onSubmit={handleCreateFlag}
          >
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Flag Name
                </label>

                <input
                  type="text"
                  value={newFlag.name}
                  onChange={(event) =>
                    setNewFlag({
                      ...newFlag,
                      name:
                        event.target.value,
                    })
                  }
                  placeholder="Example: New Dashboard"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Flag Key
                </label>

                <input
                  type="text"
                  value={newFlag.key}
                  onChange={(event) =>
                    setNewFlag({
                      ...newFlag,
                      key:
                        event.target.value,
                    })
                  }
                  placeholder="Example: new_dashboard"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Environment
                </label>

                <select
                  value={
                    newFlag.environment
                  }
                  onChange={(event) =>
                    setNewFlag({
                      ...newFlag,
                      environment:
                        event.target.value,
                    })
                  }
                  style={styles.input}
                >
                  <option>
                    Development
                  </option>
                  <option>
                    Staging
                  </option>
                  <option>
                    Production
                  </option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Rollout Percentage
                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={newFlag.rollout}
                  onChange={(event) =>
                    setNewFlag({
                      ...newFlag,
                      rollout:
                        event.target.value,
                    })
                  }
                  style={styles.input}
                />
              </div>

              <div
                style={{
                  ...styles.formGroup,
                  gridColumn: "1 / -1",
                }}
              >
                <label style={styles.label}>
                  Description
                </label>

                <textarea
                  value={
                    newFlag.description
                  }
                  onChange={(event) =>
                    setNewFlag({
                      ...newFlag,
                      description:
                        event.target.value,
                    })
                  }
                  placeholder="Describe what this feature flag controls..."
                  rows="3"
                  style={styles.textarea}
                />
              </div>
            </div>

            <div style={styles.formActions}>
              <button
                type="button"
                onClick={() =>
                  setShowCreateForm(false)
                }
                style={styles.cancelButton}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={styles.primaryButton}
              >
                Create Flag
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div style={styles.toolbar}>
        <input
          type="text"
          placeholder="Search feature flags..."
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
          style={styles.search}
        />

        <select
          value={environment}
          onChange={(event) =>
            setEnvironment(
              event.target.value
            )
          }
          style={styles.select}
        >
          <option value="All">
            All Environments
          </option>

          <option value="Development">
            Development
          </option>

          <option value="Staging">
            Staging
          </option>

          <option value="Production">
            Production
          </option>
        </select>
      </div>

      {/* Feature Flag Table */}
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              Configured Feature Flags
            </h2>

            <p style={styles.sectionSubtitle}>
              Control feature availability and
              rollout percentages.
            </p>
          </div>

          <span style={styles.resultCount}>
            {filteredFlags.length} flags
          </span>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>
                  Feature
                </th>

                <th style={styles.th}>
                  Environment
                </th>

                <th style={styles.th}>
                  Rollout
                </th>

                <th style={styles.th}>
                  Status
                </th>

                <th style={styles.th}>
                  Updated
                </th>

                <th style={styles.th}>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredFlags.length > 0 ? (
                filteredFlags.map((flag) => (
                  <tr key={flag.id}>
                    <td style={styles.td}>
                      <div>
                        <strong>
                          {flag.name}
                        </strong>

                        <div
                          style={
                            styles.flagKey
                          }
                        >
                          {flag.key}
                        </div>

                        <div
                          style={
                            styles.description
                          }
                        >
                          {
                            flag.description
                          }
                        </div>
                      </div>
                    </td>

                    <td style={styles.td}>
                      <span
                        style={
                          styles.environmentBadge
                        }
                      >
                        {flag.environment}
                      </span>
                    </td>

                    <td style={styles.td}>
                      <div
                        style={
                          styles.rolloutContainer
                        }
                      >
                        <div
                          style={
                            styles.progressBackground
                          }
                        >
                          <div
                            style={{
                              ...styles.progressBar,
                              width: `${flag.rollout}%`,
                            }}
                          />
                        </div>

                        <span>
                          {flag.rollout}%
                        </span>
                      </div>
                    </td>

                    <td style={styles.td}>
                      <button
                        type="button"
                        onClick={() =>
                          toggleFlag(flag.id)
                        }
                        style={{
                          ...styles.statusButton,
                          ...(flag.enabled
                            ? styles.enabled
                            : styles.disabled),
                        }}
                      >
                        {flag.enabled
                          ? "Enabled"
                          : "Disabled"}
                      </button>
                    </td>

                    <td style={styles.td}>
                      {flag.updatedAt}
                    </td>

                    <td style={styles.td}>
                      <button
                        type="button"
                        onClick={() =>
                          toggleFlag(flag.id)
                        }
                        style={
                          styles.actionButton
                        }
                      >
                        {flag.enabled
                          ? "Disable"
                          : "Enable"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    style={styles.emptyState}
                  >
                    No feature flags found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
}) {
  return (
    <div style={styles.statCard}>
      <div style={styles.statTitle}>
        {title}
      </div>

      <div style={styles.statValue}>
        {value}
      </div>

      <div style={styles.statDescription}>
        {description}
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: "32px",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "28px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    fontWeight: 700,
  },

  subtitle: {
    marginTop: "8px",
    color: "#64748b",
    fontSize: "15px",
  },

  primaryButton: {
    padding: "11px 18px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(210px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },

  statCard: {
    padding: "22px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    boxShadow:
      "0 2px 8px rgba(15, 23, 42, 0.04)",
  },

  statTitle: {
    color: "#64748b",
    fontSize: "14px",
    fontWeight: 600,
  },

  statValue: {
    marginTop: "12px",
    fontSize: "28px",
    fontWeight: 700,
  },

  statDescription: {
    marginTop: "6px",
    color: "#94a3b8",
    fontSize: "13px",
  },

  formCard: {
    padding: "24px",
    marginBottom: "24px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
  },

  formTitle: {
    margin: "0 0 20px",
    fontSize: "20px",
  },

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(250px, 1fr))",
    gap: "18px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    fontSize: "13px",
    fontWeight: 600,
    color: "#334155",
  },

  input: {
    padding: "11px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
    backgroundColor: "#ffffff",
  },

  textarea: {
    padding: "11px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    resize: "vertical",
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },

  cancelButton: {
    padding: "11px 18px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    cursor: "pointer",
  },

  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    marginBottom: "20px",
  },

  search: {
    flex: 1,
    maxWidth: "420px",
    padding: "11px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
  },

  select: {
    padding: "11px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    fontSize: "14px",
  },

  tableCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    overflow: "hidden",
  },

  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "24px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "19px",
  },

  sectionSubtitle: {
    marginTop: "6px",
    color: "#64748b",
    fontSize: "14px",
  },

  resultCount: {
    color: "#64748b",
    fontSize: "13px",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "900px",
  },

  th: {
    padding: "13px 16px",
    textAlign: "left",
    backgroundColor: "#f8fafc",
    color: "#64748b",
    fontSize: "12px",
    textTransform: "uppercase",
    borderTop: "1px solid #e2e8f0",
    borderBottom: "1px solid #e2e8f0",
  },

  td: {
    padding: "16px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "14px",
  },

  flagKey: {
    marginTop: "4px",
    color: "#64748b",
    fontSize: "12px",
    fontFamily: "monospace",
  },

  description: {
    marginTop: "7px",
    maxWidth: "350px",
    color: "#94a3b8",
    fontSize: "12px",
  },

  environmentBadge: {
    padding: "5px 9px",
    borderRadius: "6px",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    fontSize: "12px",
    fontWeight: 600,
  },

  rolloutContainer: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    minWidth: "150px",
  },

  progressBackground: {
    width: "100px",
    height: "7px",
    borderRadius: "10px",
    backgroundColor: "#e2e8f0",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    backgroundColor: "#2563eb",
    borderRadius: "10px",
  },

  statusButton: {
    padding: "6px 10px",
    border: "none",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },

  enabled: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
  },

  disabled: {
    backgroundColor: "#f1f5f9",
    color: "#64748b",
  },

  actionButton: {
    padding: "7px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "6px",
    backgroundColor: "#ffffff",
    color: "#334155",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },

  emptyState: {
    padding: "50px",
    textAlign: "center",
    color: "#64748b",
  },
};