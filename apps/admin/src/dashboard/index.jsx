import React from "react";

const stats = [
  {
    title: "Total Users",
    value: "12,840",
    change: "+12.5%",
    description: "Compared to last month",
  },
  {
    title: "Active Organizations",
    value: "1,284",
    change: "+8.2%",
    description: "Compared to last month",
  },
  {
    title: "API Requests",
    value: "2.4M",
    change: "+18.7%",
    description: "Compared to last month",
  },
  {
    title: "Total Cost",
    value: "$207.62",
    change: "-4.3%",
    description: "Compared to last month",
  },
];

const recentActivity = [
  {
    user: "Admin User",
    action: "Updated organization settings",
    time: "5 minutes ago",
  },
  {
    user: "John Smith",
    action: "Created a new workspace",
    time: "20 minutes ago",
  },
  {
    user: "Sarah Wilson",
    action: "Updated API permissions",
    time: "1 hour ago",
  },
  {
    user: "System",
    action: "Security policy was updated",
    time: "2 hours ago",
  },
  {
    user: "Admin User",
    action: "Added a new API key",
    time: "3 hours ago",
  },
];

const modelUsage = [
  {
    model: "GPT-5.5",
    requests: "12,450",
    usage: "42%",
  },
  {
    model: "Claude Sonnet",
    requests: "8,920",
    usage: "30%",
  },
  {
    model: "Gemini Pro",
    requests: "6,750",
    usage: "18%",
  },
  {
    model: "Llama 3",
    requests: "4,320",
    usage: "10%",
  },
];

export default function Dashboard() {
  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Dashboard</h1>
          <p style={styles.subtitle}>
            Welcome back. Here's an overview of your platform.
          </p>
        </div>

        <button style={styles.primaryButton}>
          Generate Report
        </button>
      </header>

      {/* Stats */}
      <section style={styles.statsGrid}>
        {stats.map((stat) => (
          <div key={stat.title} style={styles.statCard}>
            <div style={styles.statHeader}>
              <span style={styles.statTitle}>
                {stat.title}
              </span>

              <span style={styles.statIcon}>
                ●
              </span>
            </div>

            <div style={styles.statValue}>
              {stat.value}
            </div>

            <div style={styles.statFooter}>
              <span style={styles.change}>
                {stat.change}
              </span>

              <span style={styles.description}>
                {stat.description}
              </span>
            </div>
          </div>
        ))}
      </section>

      {/* Main Content */}
      <section style={styles.contentGrid}>
        {/* Activity */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                Recent Activity
              </h2>

              <p style={styles.cardSubtitle}>
                Latest events across your platform
              </p>
            </div>

            <button style={styles.secondaryButton}>
              View All
            </button>
          </div>

          <div>
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                style={styles.activityItem}
              >
                <div style={styles.activityIcon}>
                  {activity.user.charAt(0)}
                </div>

                <div style={styles.activityContent}>
                  <strong style={styles.activityUser}>
                    {activity.user}
                  </strong>

                  <span style={styles.activityAction}>
                    {activity.action}
                  </span>

                  <span style={styles.activityTime}>
                    {activity.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* System Health */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>
                System Health
              </h2>

              <p style={styles.cardSubtitle}>
                Current platform status
              </p>
            </div>

            <span style={styles.healthyBadge}>
              All Systems Operational
            </span>
          </div>

          <div style={styles.healthList}>
            <HealthItem
              name="API Gateway"
              status="Operational"
            />

            <HealthItem
              name="Authentication"
              status="Operational"
            />

            <HealthItem
              name="Database"
              status="Operational"
            />

            <HealthItem
              name="AI Services"
              status="Operational"
            />

            <HealthItem
              name="Background Jobs"
              status="Operational"
            />
          </div>
        </div>
      </section>

      {/* Model Usage */}
      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.cardTitle}>
              AI Model Usage
            </h2>

            <p style={styles.cardSubtitle}>
              Usage distribution across configured models
            </p>
          </div>

          <select style={styles.select}>
            <option>Last 30 Days</option>
            <option>Last 7 Days</option>
            <option>Last 90 Days</option>
          </select>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Model</th>
                <th style={styles.th}>Requests</th>
                <th style={styles.th}>Usage</th>
                <th style={styles.th}>Distribution</th>
              </tr>
            </thead>

            <tbody>
              {modelUsage.map((model) => (
                <tr key={model.model}>
                  <td style={styles.td}>
                    <strong>{model.model}</strong>
                  </td>

                  <td style={styles.td}>
                    {model.requests}
                  </td>

                  <td style={styles.td}>
                    {model.usage}
                  </td>

                  <td style={styles.td}>
                    <div style={styles.progressBackground}>
                      <div
                        style={{
                          ...styles.progressBar,
                          width: model.usage,
                        }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quick Actions */}
      <section style={styles.quickActions}>
        <h2 style={styles.cardTitle}>
          Quick Actions
        </h2>

        <div style={styles.actionGrid}>
          <ActionButton text="Manage Users" />
          <ActionButton text="Manage Organizations" />
          <ActionButton text="View Audit Logs" />
          <ActionButton text="Manage API Keys" />
          <ActionButton text="View Analytics" />
          <ActionButton text="Security Settings" />
        </div>
      </section>
    </div>
  );
}

function HealthItem({ name, status }) {
  return (
    <div style={styles.healthItem}>
      <div style={styles.healthName}>
        <span style={styles.healthDot} />
        {name}
      </div>

      <span style={styles.healthStatus}>
        {status}
      </span>
    </div>
  );
}

function ActionButton({ text }) {
  return (
    <button style={styles.actionButton}>
      {text}
      <span>→</span>
    </button>
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
    gap: "20px",
  },

  title: {
    margin: 0,
    fontSize: "30px",
    fontWeight: 700,
  },

  subtitle: {
    margin: "8px 0 0",
    color: "#64748b",
    fontSize: "15px",
  },

  primaryButton: {
    padding: "11px 18px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },

  statsGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },

  statCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "22px",
    boxShadow:
      "0 2px 8px rgba(15, 23, 42, 0.05)",
  },

  statHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  statTitle: {
    color: "#64748b",
    fontSize: "14px",
    fontWeight: 600,
  },

  statIcon: {
    color: "#2563eb",
    fontSize: "18px",
  },

  statValue: {
    marginTop: "14px",
    fontSize: "28px",
    fontWeight: 700,
  },

  statFooter: {
    display: "flex",
    gap: "8px",
    marginTop: "10px",
    flexWrap: "wrap",
  },

  change: {
    color: "#16a34a",
    fontSize: "13px",
    fontWeight: 600,
  },

  description: {
    color: "#94a3b8",
    fontSize: "13px",
  },

  contentGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "24px",
    marginBottom: "24px",
  },

  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow:
      "0 2px 8px rgba(15, 23, 42, 0.04)",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "20px",
  },

  cardTitle: {
    margin: 0,
    fontSize: "19px",
    fontWeight: 700,
  },

  cardSubtitle: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  secondaryButton: {
    border: "1px solid #cbd5e1",
    backgroundColor: "#ffffff",
    borderRadius: "7px",
    padding: "8px 12px",
    fontSize: "13px",
    cursor: "pointer",
  },

  activityItem: {
    display: "flex",
    gap: "14px",
    padding: "15px 0",
    borderBottom: "1px solid #f1f5f9",
  },

  activityIcon: {
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    backgroundColor: "#eff6ff",
    color: "#2563eb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
  },

  activityContent: {
    display: "flex",
    flexDirection: "column",
    gap: "3px",
  },

  activityUser: {
    fontSize: "14px",
  },

  activityAction: {
    color: "#475569",
    fontSize: "13px",
  },

  activityTime: {
    color: "#94a3b8",
    fontSize: "12px",
  },

  healthyBadge: {
    padding: "6px 10px",
    borderRadius: "20px",
    backgroundColor: "#f0fdf4",
    color: "#15803d",
    fontSize: "12px",
    fontWeight: 600,
  },

  healthList: {
    display: "flex",
    flexDirection: "column",
  },

  healthItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 0",
    borderBottom: "1px solid #f1f5f9",
  },

  healthName: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px",
    fontWeight: 500,
  },

  healthDot: {
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    backgroundColor: "#22c55e",
  },

  healthStatus: {
    color: "#16a34a",
    fontSize: "13px",
    fontWeight: 600,
  },

  select: {
    padding: "9px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "7px",
    backgroundColor: "#ffffff",
    fontSize: "13px",
  },

  tableWrapper: {
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "650px",
  },

  th: {
    padding: "13px 12px",
    textAlign: "left",
    backgroundColor: "#f8fafc",
    color: "#64748b",
    fontSize: "12px",
    textTransform: "uppercase",
    borderBottom: "1px solid #e2e8f0",
  },

  td: {
    padding: "16px 12px",
    fontSize: "14px",
    borderBottom: "1px solid #f1f5f9",
  },

  progressBackground: {
    width: "180px",
    height: "8px",
    borderRadius: "20px",
    backgroundColor: "#e2e8f0",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    backgroundColor: "#2563eb",
    borderRadius: "20px",
  },

  quickActions: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "24px",
  },

  actionGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "12px",
    marginTop: "18px",
  },

  actionButton: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 16px",
    backgroundColor: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "8px",
    color: "#0f172a",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
};