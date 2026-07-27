import React, { useMemo, useState } from "react";

const initialPolicies = [
  {
    id: 1,
    name: "Data Privacy Policy",
    category: "Privacy",
    owner: "Security Team",
    status: "Active",
    lastReviewed: "2026-07-18",
    nextReview: "2026-10-18",
  },
  {
    id: 2,
    name: "AI Model Usage Policy",
    category: "AI Governance",
    owner: "AI Governance Team",
    status: "Active",
    lastReviewed: "2026-07-15",
    nextReview: "2026-10-15",
  },
  {
    id: 3,
    name: "Access Control Policy",
    category: "Security",
    owner: "IT Security",
    status: "Active",
    lastReviewed: "2026-07-10",
    nextReview: "2026-10-10",
  },
  {
    id: 4,
    name: "Data Retention Policy",
    category: "Compliance",
    owner: "Compliance Team",
    status: "Under Review",
    lastReviewed: "2026-06-20",
    nextReview: "2026-07-25",
  },
];

const initialFrameworks = [
  {
    id: 1,
    name: "SOC 2",
    description:
      "Service organization controls for security, availability, and confidentiality.",
    progress: 82,
    status: "In Progress",
  },
  {
    id: 2,
    name: "ISO 27001",
    description:
      "International standard for information security management systems.",
    progress: 68,
    status: "In Progress",
  },
  {
    id: 3,
    name: "GDPR",
    description:
      "Data protection and privacy requirements for personal data.",
    progress: 91,
    status: "Compliant",
  },
];

const initialApprovals = [
  {
    id: 1,
    item: "AI Model Usage Policy",
    requestedBy: "Admin User",
    type: "Policy",
    status: "Pending",
    date: "2026-07-21",
  },
  {
    id: 2,
    item: "Production Access Request",
    requestedBy: "John Smith",
    type: "Access",
    status: "Pending",
    date: "2026-07-20",
  },
  {
    id: 3,
    item: "Data Retention Policy",
    requestedBy: "Compliance Team",
    type: "Policy",
    status: "Pending",
    date: "2026-07-19",
  },
];

export default function Governance() {
  const [policies, setPolicies] =
    useState(initialPolicies);

  const [frameworks] =
    useState(initialFrameworks);

  const [approvals, setApprovals] =
    useState(initialApprovals);

  const [search, setSearch] = useState("");

  const [category, setCategory] =
    useState("All");

  const [showPolicyForm, setShowPolicyForm] =
    useState(false);

  const [newPolicy, setNewPolicy] =
    useState({
      name: "",
      category: "Security",
      owner: "",
    });

  const filteredPolicies = useMemo(() => {
    return policies.filter((policy) => {
      const searchText =
        search.toLowerCase().trim();

      const matchesSearch =
        policy.name
          .toLowerCase()
          .includes(searchText) ||
        policy.owner
          .toLowerCase()
          .includes(searchText);

      const matchesCategory =
        category === "All" ||
        policy.category === category;

      return (
        matchesSearch &&
        matchesCategory
      );
    });
  }, [policies, search, category]);

  const activePolicies = policies.filter(
    (policy) =>
      policy.status === "Active"
  ).length;

  const pendingApprovals =
    approvals.filter(
      (item) =>
        item.status === "Pending"
    ).length;

  const compliantFrameworks =
    frameworks.filter(
      (item) =>
        item.status === "Compliant"
    ).length;

  const approveRequest = (id) => {
    setApprovals((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Approved",
            }
          : item
      )
    );
  };

  const rejectRequest = (id) => {
    setApprovals((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              status: "Rejected",
            }
          : item
      )
    );
  };

  const handleCreatePolicy = (event) => {
    event.preventDefault();

    if (
      !newPolicy.name.trim() ||
      !newPolicy.owner.trim()
    ) {
      return;
    }

    const policy = {
      id: Date.now(),
      name: newPolicy.name,
      category: newPolicy.category,
      owner: newPolicy.owner,
      status: "Active",
      lastReviewed: "Not reviewed",
      nextReview: "Not scheduled",
    };

    setPolicies((current) => [
      policy,
      ...current,
    ]);

    setNewPolicy({
      name: "",
      category: "Security",
      owner: "",
    });

    setShowPolicyForm(false);
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>
            Governance
          </h1>

          <p style={styles.subtitle}>
            Manage policies, compliance frameworks,
            approvals, and organizational governance.
          </p>
        </div>

        <button
          type="button"
          onClick={() =>
            setShowPolicyForm(
              !showPolicyForm
            )
          }
          style={styles.primaryButton}
        >
          + Create Policy
        </button>
      </header>

      {/* Summary Cards */}
      <section style={styles.statsGrid}>
        <StatCard
          title="Total Policies"
          value={policies.length}
          description="Governance policies"
        />

        <StatCard
          title="Active Policies"
          value={activePolicies}
          description="Currently active"
        />

        <StatCard
          title="Pending Approvals"
          value={pendingApprovals}
          description="Require administrator action"
        />

        <StatCard
          title="Compliant Frameworks"
          value={compliantFrameworks}
          description="Compliance frameworks"
        />
      </section>

      {/* Create Policy */}
      {showPolicyForm && (
        <section style={styles.formCard}>
          <h2 style={styles.sectionTitle}>
            Create Governance Policy
          </h2>

          <form
            onSubmit={handleCreatePolicy}
          >
            <div style={styles.formGrid}>
              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Policy Name
                </label>

                <input
                  value={newPolicy.name}
                  onChange={(event) =>
                    setNewPolicy({
                      ...newPolicy,
                      name:
                        event.target.value,
                    })
                  }
                  placeholder="Example: API Security Policy"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Category
                </label>

                <select
                  value={
                    newPolicy.category
                  }
                  onChange={(event) =>
                    setNewPolicy({
                      ...newPolicy,
                      category:
                        event.target.value,
                    })
                  }
                  style={styles.input}
                >
                  <option>
                    Security
                  </option>
                  <option>
                    Privacy
                  </option>
                  <option>
                    Compliance
                  </option>
                  <option>
                    AI Governance
                  </option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Policy Owner
                </label>

                <input
                  value={newPolicy.owner}
                  onChange={(event) =>
                    setNewPolicy({
                      ...newPolicy,
                      owner:
                        event.target.value,
                    })
                  }
                  placeholder="Example: Security Team"
                  style={styles.input}
                />
              </div>
            </div>

            <div style={styles.formActions}>
              <button
                type="button"
                onClick={() =>
                  setShowPolicyForm(false)
                }
                style={styles.secondaryButton}
              >
                Cancel
              </button>

              <button
                type="submit"
                style={styles.primaryButton}
              >
                Create Policy
              </button>
            </div>
          </form>
        </section>
      )}

      {/* Policies */}
      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              Governance Policies
            </h2>

            <p style={styles.sectionSubtitle}>
              Manage and review organizational
              policies.
            </p>
          </div>

          <div style={styles.filters}>
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search policies..."
              style={styles.search}
            />

            <select
              value={category}
              onChange={(event) =>
                setCategory(
                  event.target.value
                )
              }
              style={styles.select}
            >
              <option value="All">
                All Categories
              </option>

              <option value="Security">
                Security
              </option>

              <option value="Privacy">
                Privacy
              </option>

              <option value="Compliance">
                Compliance
              </option>

              <option value="AI Governance">
                AI Governance
              </option>
            </select>
          </div>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>
                  Policy
                </th>

                <th style={styles.th}>
                  Category
                </th>

                <th style={styles.th}>
                  Owner
                </th>

                <th style={styles.th}>
                  Status
                </th>

                <th style={styles.th}>
                  Last Reviewed
                </th>

                <th style={styles.th}>
                  Next Review
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredPolicies.length > 0 ? (
                filteredPolicies.map(
                  (policy) => (
                    <tr key={policy.id}>
                      <td style={styles.td}>
                        <strong>
                          {policy.name}
                        </strong>
                      </td>

                      <td style={styles.td}>
                        <span
                          style={
                            styles.categoryBadge
                          }
                        >
                          {policy.category}
                        </span>
                      </td>

                      <td style={styles.td}>
                        {policy.owner}
                      </td>

                      <td style={styles.td}>
                        <StatusBadge
                          status={
                            policy.status
                          }
                        />
                      </td>

                      <td style={styles.td}>
                        {policy.lastReviewed}
                      </td>

                      <td style={styles.td}>
                        {policy.nextReview}
                      </td>
                    </tr>
                  )
                )
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    style={styles.emptyState}
                  >
                    No policies found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Compliance Frameworks */}
      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              Compliance Frameworks
            </h2>

            <p style={styles.sectionSubtitle}>
              Monitor your organization's
              compliance readiness.
            </p>
          </div>
        </div>

        <div style={styles.frameworkGrid}>
          {frameworks.map((framework) => (
            <div
              key={framework.id}
              style={styles.frameworkCard}
            >
              <div
                style={
                  styles.frameworkHeader
                }
              >
                <h3 style={styles.frameworkName}>
                  {framework.name}
                </h3>

                <StatusBadge
                  status={
                    framework.status
                  }
                />
              </div>

              <p
                style={
                  styles.frameworkDescription
                }
              >
                {framework.description}
              </p>

              <div
                style={
                  styles.progressHeader
                }
              >
                <span>
                  Compliance Progress
                </span>

                <strong>
                  {framework.progress}%
                </strong>
              </div>

              <div
                style={
                  styles.progressBackground
                }
              >
                <div
                  style={{
                    ...styles.progressBar,
                    width: `${framework.progress}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Approval Requests */}
      <section style={styles.card}>
        <div style={styles.cardHeader}>
          <div>
            <h2 style={styles.sectionTitle}>
              Approval Requests
            </h2>

            <p style={styles.sectionSubtitle}>
              Review and manage pending governance
              requests.
            </p>
          </div>
        </div>

        <div style={styles.tableWrapper}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>
                  Request
                </th>

                <th style={styles.th}>
                  Requested By
                </th>

                <th style={styles.th}>
                  Type
                </th>

                <th style={styles.th}>
                  Date
                </th>

                <th style={styles.th}>
                  Status
                </th>

                <th style={styles.th}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {approvals.map((request) => (
                <tr key={request.id}>
                  <td style={styles.td}>
                    <strong>
                      {request.item}
                    </strong>
                  </td>

                  <td style={styles.td}>
                    {request.requestedBy}
                  </td>

                  <td style={styles.td}>
                    {request.type}
                  </td>

                  <td style={styles.td}>
                    {request.date}
                  </td>

                  <td style={styles.td}>
                    <StatusBadge
                      status={
                        request.status
                      }
                    />
                  </td>

                  <td style={styles.td}>
                    {request.status ===
                    "Pending" ? (
                      <div
                        style={
                          styles.actionGroup
                        }
                      >
                        <button
                          type="button"
                          onClick={() =>
                            approveRequest(
                              request.id
                            )
                          }
                          style={
                            styles.approveButton
                          }
                        >
                          Approve
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            rejectRequest(
                              request.id
                            )
                          }
                          style={
                            styles.rejectButton
                          }
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span
                        style={
                          styles.completedText
                        }
                      >
                        Completed
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
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
      <span style={styles.statTitle}>
        {title}
      </span>

      <div style={styles.statValue}>
        {value}
      </div>

      <span style={styles.statDescription}>
        {description}
      </span>
    </div>
  );
}

function StatusBadge({ status }) {
  const statusStyle =
    status === "Active" ||
    status === "Compliant" ||
    status === "Approved"
      ? styles.successBadge
      : status === "Rejected"
      ? styles.errorBadge
      : styles.warningBadge;

  return (
    <span
      style={{
        ...styles.statusBadge,
        ...statusStyle,
      }}
    >
      {status}
    </span>
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

  secondaryButton: {
    padding: "10px 16px",
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
    marginTop: "12px",
    fontSize: "28px",
    fontWeight: 700,
  },

  statDescription: {
    display: "block",
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

  formGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
    marginTop: "20px",
  },

  formGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },

  label: {
    color: "#334155",
    fontSize: "13px",
    fontWeight: 600,
  },

  input: {
    padding: "11px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    fontSize: "14px",
  },

  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "10px",
    marginTop: "20px",
  },

  card: {
    marginBottom: "24px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    overflow: "hidden",
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "20px",
    padding: "24px",
  },

  sectionTitle: {
    margin: 0,
    fontSize: "19px",
    fontWeight: 700,
  },

  sectionSubtitle: {
    margin: "6px 0 0",
    color: "#64748b",
    fontSize: "14px",
  },

  filters: {
    display: "flex",
    gap: "10px",
  },

  search: {
    width: "220px",
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    fontSize: "14px",
  },

  select: {
    padding: "10px 12px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
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

  categoryBadge: {
    padding: "5px 9px",
    borderRadius: "6px",
    backgroundColor: "#f1f5f9",
    color: "#475569",
    fontSize: "12px",
    fontWeight: 600,
  },

  statusBadge: {
    display: "inline-block",
    padding: "5px 9px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: 600,
  },

  successBadge: {
    backgroundColor: "#dcfce7",
    color: "#15803d",
  },

  warningBadge: {
    backgroundColor: "#fef3c7",
    color: "#a16207",
  },

  errorBadge: {
    backgroundColor: "#fee2e2",
    color: "#b91c1c",
  },

  emptyState: {
    padding: "50px",
    textAlign: "center",
    color: "#64748b",
  },

  frameworkGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    padding: "0 24px 24px",
  },

  frameworkCard: {
    padding: "20px",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
  },

  frameworkHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "10px",
  },

  frameworkName: {
    margin: 0,
    fontSize: "17px",
  },

  frameworkDescription: {
    minHeight: "48px",
    color: "#64748b",
    fontSize: "13px",
    lineHeight: 1.5,
  },

  progressHeader: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
    color: "#64748b",
    fontSize: "12px",
  },

  progressBackground: {
    height: "8px",
    borderRadius: "10px",
    backgroundColor: "#e2e8f0",
    overflow: "hidden",
  },

  progressBar: {
    height: "100%",
    borderRadius: "10px",
    backgroundColor: "#2563eb",
  },

  actionGroup: {
    display: "flex",
    gap: "8px",
  },

  approveButton: {
    padding: "7px 11px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#16a34a",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },

  rejectButton: {
    padding: "7px 11px",
    border: "none",
    borderRadius: "6px",
    backgroundColor: "#dc2626",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: 600,
    cursor: "pointer",
  },

  completedText: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: 600,
  },
};