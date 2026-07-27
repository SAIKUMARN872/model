import React, { useMemo, useState } from "react";

const initialCostData = [
  {
    id: 1,
    model: "GPT-5.5",
    provider: "OpenAI",
    requests: 12450,
    inputTokens: 2480000,
    outputTokens: 920000,
    cost: 84.65,
    status: "Active",
  },
  {
    id: 2,
    model: "Claude Sonnet",
    provider: "Anthropic",
    requests: 8920,
    inputTokens: 1760000,
    outputTokens: 680000,
    cost: 62.4,
    status: "Active",
  },
  {
    id: 3,
    model: "Gemini Pro",
    provider: "Google",
    requests: 6750,
    inputTokens: 1340000,
    outputTokens: 510000,
    cost: 41.85,
    status: "Active",
  },
  {
    id: 4,
    model: "Llama 3",
    provider: "Meta",
    requests: 4320,
    inputTokens: 980000,
    outputTokens: 360000,
    cost: 18.72,
    status: "Active",
  },
];

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US").format(value);

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

export default function CostEngine() {
  const [costData] = useState(initialCostData);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState("30 Days");

  const filteredData = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return costData;

    return costData.filter(
      (item) =>
        item.model.toLowerCase().includes(query) ||
        item.provider.toLowerCase().includes(query) ||
        item.status.toLowerCase().includes(query)
    );
  }, [costData, search]);

  const totalCost = costData.reduce(
    (total, item) => total + item.cost,
    0
  );

  const totalRequests = costData.reduce(
    (total, item) => total + item.requests,
    0
  );

  const totalInputTokens = costData.reduce(
    (total, item) => total + item.inputTokens,
    0
  );

  const totalOutputTokens = costData.reduce(
    (total, item) => total + item.outputTokens,
    0
  );

  const budget = 500;

  const budgetPercentage = Math.min(
    (totalCost / budget) * 100,
    100
  );

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Cost Engine</h1>
          <p style={styles.subtitle}>
            Monitor AI usage, token consumption, and infrastructure costs.
          </p>
        </div>

        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={styles.select}
        >
          <option>7 Days</option>
          <option>30 Days</option>
          <option>90 Days</option>
          <option>1 Year</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div style={styles.cardGrid}>
        <SummaryCard
          title="Total Cost"
          value={formatCurrency(totalCost)}
          description={`Current period: ${period}`}
          icon="💰"
        />

        <SummaryCard
          title="Total Requests"
          value={formatNumber(totalRequests)}
          description="AI API requests"
          icon="⚡"
        />

        <SummaryCard
          title="Input Tokens"
          value={formatNumber(totalInputTokens)}
          description="Tokens processed"
          icon="📥"
        />

        <SummaryCard
          title="Output Tokens"
          value={formatNumber(totalOutputTokens)}
          description="Tokens generated"
          icon="📤"
        />
      </div>

      {/* Budget Section */}
      <div style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Budget Overview</h2>
            <p style={styles.sectionSubtitle}>
              Track your current AI spending against the configured budget.
            </p>
          </div>

          <strong style={styles.budgetText}>
            {formatCurrency(totalCost)} / {formatCurrency(budget)}
          </strong>
        </div>

        <div style={styles.progressBackground}>
          <div
            style={{
              ...styles.progressBar,
              width: `${budgetPercentage}%`,
            }}
          />
        </div>

        <div style={styles.budgetFooter}>
          <span>{budgetPercentage.toFixed(1)}% used</span>
          <span>
            {formatCurrency(Math.max(budget - totalCost, 0))} remaining
          </span>
        </div>
      </div>

      {/* Cost Table */}
      <div style={styles.section}>
        <div style={styles.tableHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Model Cost Breakdown</h2>
            <p style={styles.sectionSubtitle}>
              Review usage and cost by AI model and provider.
            </p>
          </div>

          <input
            type="text"
            placeholder="Search models..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.search}
          />
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Model</th>
                <th style={styles.th}>Provider</th>
                <th style={styles.th}>Requests</th>
                <th style={styles.th}>Input Tokens</th>
                <th style={styles.th}>Output Tokens</th>
                <th style={styles.th}>Cost</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>

            <tbody>
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id}>
                    <td style={styles.td}>
                      <strong>{item.model}</strong>
                    </td>

                    <td style={styles.td}>
                      {item.provider}
                    </td>

                    <td style={styles.td}>
                      {formatNumber(item.requests)}
                    </td>

                    <td style={styles.td}>
                      {formatNumber(item.inputTokens)}
                    </td>

                    <td style={styles.td}>
                      {formatNumber(item.outputTokens)}
                    </td>

                    <td style={styles.td}>
                      <strong>{formatCurrency(item.cost)}</strong>
                    </td>

                    <td style={styles.td}>
                      <span style={styles.status}>
                        <span style={styles.statusDot} />
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    style={styles.emptyState}
                  >
                    No matching models found.
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

function SummaryCard({
  title,
  value,
  description,
  icon,
}) {
  return (
    <div style={styles.summaryCard}>
      <div style={styles.cardTop}>
        <span style={styles.cardTitle}>{title}</span>
        <span style={styles.icon}>{icon}</span>
      </div>

      <div style={styles.cardValue}>
        {value}
      </div>

      <div style={styles.cardDescription}>
        {description}
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: "32px",
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    color: "#0f172a",
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
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
    marginBottom: 0,
    color: "#64748b",
    fontSize: "15px",
  },

  select: {
    padding: "10px 14px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    fontSize: "14px",
    cursor: "pointer",
  },

  cardGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "24px",
  },

  summaryCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "22px",
    boxShadow:
      "0 2px 8px rgba(15, 23, 42, 0.05)",
  },

  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: {
    color: "#64748b",
    fontSize: "14px",
    fontWeight: 600,
  },

  icon: {
    fontSize: "20px",
  },

  cardValue: {
    marginTop: "14px",
    fontSize: "26px",
    fontWeight: 700,
  },

  cardDescription: {
    marginTop: "8px",
    color: "#94a3b8",
    fontSize: "13px",
  },

  section: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow:
      "0 2px 8px rgba(15, 23, 42, 0.04)",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "20px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: 700,
  },

  sectionSubtitle: {
    marginTop: "6px",
    marginBottom: 0,
    color: "#64748b",
    fontSize: "14px",
  },

  budgetText: {
    fontSize: "16px",
  },

  progressBackground: {
    width: "100%",
    height: "12px",
    backgroundColor: "#e2e8f0",
    borderRadius: "999px",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    backgroundColor: "#2563eb",
    borderRadius: "999px",
    transition: "width 0.3s ease",
  },

  budgetFooter: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "10px",
    color: "#64748b",
    fontSize: "13px",
  },

  tableHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    marginBottom: "20px",
  },

  search: {
    width: "220px",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    outline: "none",
    fontSize: "14px",
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto",
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: "850px",
  },

  th: {
    padding: "14px 12px",
    textAlign: "left",
    fontSize: "12px",
    color: "#64748b",
    backgroundColor: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
    textTransform: "uppercase",
  },

  td: {
    padding: "16px 12px",
    borderBottom: "1px solid #f1f5f9",
    fontSize: "14px",
  },

  status: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    color: "#15803d",
    fontSize: "13px",
    fontWeight: 600,
  },

  statusDot: {
    width: "7px",
    height: "7px",
    borderRadius: "50%",
    backgroundColor: "#22c55e",
  },

  emptyState: {
    textAlign: "center",
    padding: "40px",
    color: "#64748b",
  },
};