import React, { useMemo, useState } from "react";

const initialIntegrations = [
  {
    id: 1,
    name: "GitHub",
    category: "Developer Tools",
    description:
      "Connect repositories, pull requests, commits, and development workflows.",
    status: "Connected",
    connectedAt: "2026-07-10",
    icon: "GH",
  },
  {
    id: 2,
    name: "Slack",
    category: "Communication",
    description:
      "Receive platform notifications, alerts, and team updates in Slack.",
    status: "Connected",
    connectedAt: "2026-07-12",
    icon: "SL",
  },
  {
    id: 3,
    name: "Microsoft Teams",
    category: "Communication",
    description:
      "Send operational notifications and security alerts to Teams.",
    status: "Available",
    connectedAt: null,
    icon: "MT",
  },
  {
    id: 4,
    name: "Google Workspace",
    category: "Identity",
    description:
      "Integrate Google identity and organizational services.",
    status: "Available",
    connectedAt: null,
    icon: "GW",
  },
  {
    id: 5,
    name: "Datadog",
    category: "Monitoring",
    description:
      "Connect application monitoring, metrics, and infrastructure observability.",
    status: "Available",
    connectedAt: null,
    icon: "DD",
  },
  {
    id: 6,
    name: "PagerDuty",
    category: "Incident Management",
    description:
      "Send critical alerts and incident notifications to on-call teams.",
    status: "Disconnected",
    connectedAt: null,
    icon: "PD",
  },
];

const categories = [
  "All",
  "Developer Tools",
  "Communication",
  "Identity",
  "Monitoring",
  "Incident Management",
];

export default function Integrations() {
  const [integrations, setIntegrations] = useState(
    initialIntegrations
  );

  const [search, setSearch] = useState("");

  const [category, setCategory] = useState("All");

  const [selectedIntegration, setSelectedIntegration] =
    useState(null);

  const filteredIntegrations = useMemo(() => {
    const searchValue = search
      .toLowerCase()
      .trim();

    return integrations.filter((integration) => {
      const matchesSearch =
        integration.name
          .toLowerCase()
          .includes(searchValue) ||
        integration.description
          .toLowerCase()
          .includes(searchValue);

      const matchesCategory =
        category === "All" ||
        integration.category === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [integrations, search, category]);

  const connectedCount = integrations.filter(
    (integration) =>
      integration.status === "Connected"
  ).length;

  const availableCount = integrations.filter(
    (integration) =>
      integration.status === "Available"
  ).length;

  const disconnectedCount =
    integrations.filter(
      (integration) =>
        integration.status === "Disconnected"
    ).length;

  const toggleIntegration = (id) => {
    setIntegrations((current) =>
      current.map((integration) => {
        if (integration.id !== id) {
          return integration;
        }

        const isConnected =
          integration.status === "Connected";

        return {
          ...integration,
          status: isConnected
            ? "Disconnected"
            : "Connected",
          connectedAt: isConnected
            ? null
            : new Date()
                .toISOString()
                .split("T")[0],
        };
      })
    );
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Integrations
          </h1>

          <p style={styles.subtitle}>
            Connect your platform with external
            tools and services.
          </p>
        </div>

        <button
          type="button"
          style={styles.refreshButton}
          onClick={() =>
            setIntegrations([
              ...initialIntegrations,
            ])
          }
        >
          Refresh
        </button>
      </header>

      {/* Statistics */}
      <section style={styles.statsGrid}>
        <StatCard
          title="Total Integrations"
          value={integrations.length}
          description="Available integrations"
        />

        <StatCard
          title="Connected"
          value={connectedCount}
          description="Currently connected"
        />

        <StatCard
          title="Available"
          value={availableCount}
          description="Ready to configure"
        />

        <StatCard
          title="Disconnected"
          value={disconnectedCount}
          description="Currently inactive"
        />
      </section>

      {/* Filters */}
      <section style={styles.filterCard}>
        <div style={styles.searchContainer}>
          <input
            type="text"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Search integrations..."
            style={styles.searchInput}
          />
        </div>

        <div style={styles.categoryContainer}>
          {categories.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() =>
                setCategory(item)
              }
              style={{
                ...styles.categoryButton,
                ...(category === item
                  ? styles.activeCategoryButton
                  : {}),
              }}
            >
              {item}
            </button>
          ))}
        </div>
      </section>

      {/* Integration Grid */}
      <section style={styles.integrationGrid}>
        {filteredIntegrations.length > 0 ? (
          filteredIntegrations.map(
            (integration) => (
              <IntegrationCard
                key={integration.id}
                integration={integration}
                onToggle={() =>
                  toggleIntegration(
                    integration.id
                  )
                }
                onConfigure={() =>
                  setSelectedIntegration(
                    integration
                  )
                }
              />
            )
          )
        ) : (
          <div style={styles.emptyState}>
            <h3>
              No integrations found
            </h3>

            <p>
              Try changing your search or
              category filter.
            </p>
          </div>
        )}
      </section>

      {/* Configuration Modal */}
      {selectedIntegration && (
        <IntegrationModal
          integration={
            selectedIntegration
          }
          onClose={() =>
            setSelectedIntegration(null)
          }
          onToggle={() => {
            toggleIntegration(
              selectedIntegration.id
            );

            setSelectedIntegration(
              null
            );
          }}
        />
      )}
    </div>
  );
}

function IntegrationCard({
  integration,
  onToggle,
  onConfigure,
}) {
  const isConnected =
    integration.status === "Connected";

  return (
    <article style={styles.integrationCard}>
      <div style={styles.cardTop}>
        <div style={styles.integrationIcon}>
          {integration.icon}
        </div>

        <StatusBadge
          status={integration.status}
        />
      </div>

      <div style={styles.cardContent}>
        <h2 style={styles.integrationName}>
          {integration.name}
        </h2>

        <span style={styles.categoryText}>
          {integration.category}
        </span>

        <p style={styles.description}>
          {integration.description}
        </p>
      </div>

      {integration.connectedAt && (
        <p style={styles.connectedDate}>
          Connected on{" "}
          {integration.connectedAt}
        </p>
      )}

      <div style={styles.cardActions}>
        <button
          type="button"
          onClick={onConfigure}
          style={styles.configureButton}
        >
          Configure
        </button>

        <button
          type="button"
          onClick={onToggle}
          style={{
            ...styles.toggleButton,
            ...(isConnected
              ? styles.disconnectButton
              : styles.connectButton),
          }}
        >
          {isConnected
            ? "Disconnect"
            : "Connect"}
        </button>
      </div>
    </article>
  );
}

function IntegrationModal({
  integration,
  onClose,
  onToggle,
}) {
  const isConnected =
    integration.status === "Connected";

  return (
    <div
      style={styles.modalOverlay}
      onClick={onClose}
    >
      <div
        style={styles.modal}
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <div style={styles.modalHeader}>
          <div>
            <h2 style={styles.modalTitle}>
              {integration.name}
            </h2>

            <p style={styles.modalSubtitle}>
              {integration.category}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            style={styles.closeButton}
          >
            ×
          </button>
        </div>

        <div style={styles.modalBody}>
          <p>
            {integration.description}
          </p>

          <div style={styles.configRow}>
            <span>Status</span>

            <StatusBadge
              status={
                integration.status
              }
            />
          </div>

          {isConnected && (
            <div style={styles.configRow}>
              <span>
                Connection
              </span>

              <strong>
                Active
              </strong>
            </div>
          )}

          <div style={styles.configSection}>
            <label style={styles.label}>
              API Endpoint
            </label>

            <input
              type="text"
              placeholder="https://api.example.com"
              style={styles.input}
            />
          </div>

          <div style={styles.configSection}>
            <label style={styles.label}>
              API Key
            </label>

            <input
              type="password"
              placeholder="Enter API key"
              style={styles.input}
            />
          </div>
        </div>

        <div style={styles.modalFooter}>
          <button
            type="button"
            onClick={onClose}
            style={styles.cancelButton}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onToggle}
            style={styles.primaryButton}
          >
            {isConnected
              ? "Disconnect"
              : "Connect Integration"}
          </button>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  let badgeStyle =
    styles.availableBadge;

  if (status === "Connected") {
    badgeStyle = styles.connectedBadge;
  }

  if (status === "Disconnected") {
    badgeStyle = styles.disconnectedBadge;
  }

  return (
    <span
      style={{
        ...styles.statusBadge,
        ...badgeStyle,
      }}
    >
      {status}
    </span>
  );
}

function StatCard({
  title,
  value,
  description,
}) {
  return (
    <div style={styles.statCard}>
      <span style={styles.statTitle}>
        {title}
      </span>

      <strong style={styles.statValue}>
        {value}
      </strong>

      <span style={styles.statDescription}>
        {description}
      </span>
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

  refreshButton: {
    padding: "10px 18px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#334155",
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
    display: "block",
    marginTop: "10px",
    fontSize: "28px",
  },

  statDescription: {
    display: "block",
    marginTop: "6px",
    color: "#94a3b8",
    fontSize: "13px",
  },

  filterCard: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "16px",
    padding: "18px",
    marginBottom: "24px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
  },

  searchContainer: {
    flex: 1,
    minWidth: "240px",
  },

  searchInput: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
    outline: "none",
  },

  categoryContainer: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },

  categoryButton: {
    padding: "8px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    backgroundColor: "#ffffff",
    color: "#475569",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },

  activeCategoryButton: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    borderColor: "#2563eb",
  },

  integrationGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "20px",
  },

  integrationCard: {
    display: "flex",
    flexDirection: "column",
    minHeight: "290px",
    padding: "22px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    boxShadow:
      "0 2px 8px rgba(15, 23, 42, 0.04)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  integrationIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "48px",
    height: "48px",
    borderRadius: "10px",
    backgroundColor: "#f1f5f9",
    color: "#334155",
    fontSize: "14px",
    fontWeight: 700,
  },

  cardContent: {
    flex: 1,
  },

  integrationName: {
    margin: "20px 0 5px",
    fontSize: "19px",
  },

  categoryText: {
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: 600,
  },

  description: {
    marginTop: "12px",
    color: "#64748b",
    fontSize: "14px",
    lineHeight: 1.6,
  },

  connectedDate: {
    margin: "10px 0",
    color: "#94a3b8",
    fontSize: "12px",
  },

  cardActions: {
    display: "flex",
    gap: "10px",
    marginTop: "20px",
  },

  configureButton: {
    flex: 1,
    padding: "9px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    backgroundColor: "#ffffff",
    color: "#334155",
    fontWeight: 600,
    cursor: "pointer",
  },

  toggleButton: {
    flex: 1,
    padding: "9px",
    border: "none",
    borderRadius: "7px",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },

  connectButton: {
    backgroundColor: "#2563eb",
  },

  disconnectButton: {
    backgroundColor: "#dc2626",
  },

  statusBadge: {
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "11px",
    fontWeight: 600,
  },

  connectedBadge: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
  },

  availableBadge: {
    backgroundColor: "#dbeafe",
    color: "#1d4ed8",
  },

  disconnectedBadge: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
  },

  emptyState: {
    gridColumn: "1 / -1",
    padding: "60px",
    textAlign: "center",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    color: "#64748b",
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    backgroundColor:
      "rgba(15, 23, 42, 0.55)",
    zIndex: 1000,
  },

  modal: {
    width: "100%",
    maxWidth: "520px",
    backgroundColor: "#ffffff",
    borderRadius: "12px",
    boxShadow:
      "0 20px 50px rgba(15, 23, 42, 0.2)",
    overflow: "hidden",
  },

  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    padding: "22px",
    borderBottom:
      "1px solid #e2e8f0",
  },

  modalTitle: {
    margin: 0,
    fontSize: "20px",
  },

  modalSubtitle: {
    margin: "5px 0 0",
    color: "#64748b",
    fontSize: "13px",
  },

  closeButton: {
    width: "32px",
    height: "32px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    fontSize: "22px",
    cursor: "pointer",
  },

  modalBody: {
    padding: "22px",
  },

  configRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderBottom:
      "1px solid #f1f5f9",
    fontSize: "14px",
  },

  configSection: {
    marginTop: "18px",
  },

  label: {
    display: "block",
    marginBottom: "7px",
    color: "#334155",
    fontSize: "13px",
    fontWeight: 600,
  },

  input: {
    width: "100%",
    boxSizing: "border-box",
    padding: "11px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
  },

  modalFooter: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    padding: "18px 22px",
    borderTop:
      "1px solid #e2e8f0",
  },

  cancelButton: {
    padding: "10px 16px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    backgroundColor: "#ffffff",
    cursor: "pointer",
  },

  primaryButton: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "7px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontWeight: 600,
    cursor: "pointer",
  },
};