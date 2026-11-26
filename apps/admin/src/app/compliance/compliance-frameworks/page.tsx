
"use client";

import { useMemo, useState } from "react";
import {
  ShieldCheck,
  Search,
  Plus,
  RefreshCw,
  Download,
  Eye,
  X,
  CheckCircle2,
  Clock3,
  AlertTriangle,
  FileCheck2,
  Scale,
  Filter,
} from "lucide-react";

type FrameworkStatus = "Compliant" | "In Progress" | "Review Required";

type Framework = {
  id: string;
  name: string;
  category: string;
  description: string;
  owner: string;
  controls: number;
  verified: number;
  coverage: number;
  status: FrameworkStatus;
  lastReview: string;
  nextReview: string;
};

const initialFrameworks: Framework[] = [
  {
    id: "FW-001",
    name: "SOC 2 Type II",
    category: "Security",
    description: "Security, availability, confidentiality and privacy controls.",
    owner: "Security Team",
    controls: 64,
    verified: 64,
    coverage: 100,
    status: "Compliant",
    lastReview: "Jul 20, 2026",
    nextReview: "Dec 15, 2026",
  },
  {
    id: "FW-002",
    name: "ISO 27001",
    category: "Security",
    description: "Information security management and risk-based controls.",
    owner: "Compliance Team",
    controls: 93,
    verified: 91,
    coverage: 98,
    status: "Compliant",
    lastReview: "Jul 18, 2026",
    nextReview: "Dec 10, 2026",
  },
  {
    id: "FW-003",
    name: "GDPR",
    category: "Privacy",
    description: "Personal data protection and data processing obligations.",
    owner: "Privacy Team",
    controls: 42,
    verified: 41,
    coverage: 99,
    status: "Compliant",
    lastReview: "Jul 15, 2026",
    nextReview: "Nov 30, 2026",
  },
  {
    id: "FW-004",
    name: "HIPAA",
    category: "Privacy",
    description: "Safeguards for protected health information where applicable.",
    owner: "Compliance Team",
    controls: 38,
    verified: 36,
    coverage: 94,
    status: "Review Required",
    lastReview: "Jul 12, 2026",
    nextReview: "Nov 20, 2026",
  },
  {
    id: "FW-005",
    name: "PCI DSS",
    category: "Payments",
    description: "Payment card data security requirements where applicable.",
    owner: "Platform Team",
    controls: 35,
    verified: 30,
    coverage: 87,
    status: "In Progress",
    lastReview: "Jul 10, 2026",
    nextReview: "Nov 25, 2026",
  },
  {
    id: "FW-006",
    name: "AI Governance",
    category: "AI Governance",
    description: "Internal AI risk, model oversight and accountability requirements.",
    owner: "AI Governance Team",
    controls: 28,
    verified: 21,
    coverage: 75,
    status: "In Progress",
    lastReview: "Oct 15, 2026",
    nextReview: "Nov 18, 2026",
  },
];

const statusStyles: Record<string, { color: string; bg: string }> = {
  Compliant: { color: "#047857", bg: "#d1fae5" },
  "In Progress": { color: "#1d4ed8", bg: "#dbeafe" },
  "Review Required": { color: "#b45309", bg: "#fef3c7" },
};

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #e5eaf1",
  borderRadius: 12,
  padding: 20,
};

const buttonStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "9px 12px",
  border: "1px solid #dbe2ea",
  borderRadius: 8,
  background: "#ffffff",
  color: "#334155",
  fontSize: 12,
  fontWeight: 650,
  cursor: "pointer",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "10px 12px",
  border: "1px solid #dbe2ea",
  borderRadius: 8,
  background: "#ffffff",
  color: "#172033",
  outlineColor: "#315fea",
  fontSize: 12,
};

function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] ?? {
    color: "#475569",
    bg: "#f1f5f9",
  };

  return (
    <span
      style={{
        display: "inline-flex",
        padding: "5px 8px",
        borderRadius: 6,
        background: style.bg,
        color: style.color,
        fontSize: 11,
        fontWeight: 750,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

export default function ComplianceFrameworksPage() {
  const [frameworks, setFrameworks] = useState(initialFrameworks);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selected, setSelected] = useState<Framework | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Security");
  const [newOwner, setNewOwner] = useState("Compliance Team");

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();

    return frameworks.filter((item) => {
      const matchesQuery =
        !term ||
        [
          item.id,
          item.name,
          item.description,
          item.owner,
          item.category,
        ].some((value) => value.toLowerCase().includes(term));

      return (
        matchesQuery &&
        (statusFilter === "All" || item.status === statusFilter) &&
        (categoryFilter === "All" || item.category === categoryFilter)
      );
    });
  }, [frameworks, query, statusFilter, categoryFilter]);

  const compliant = frameworks.filter(
    (item) => item.status === "Compliant"
  ).length;

  const inProgress = frameworks.filter(
    (item) => item.status === "In Progress"
  ).length;

  const reviewRequired = frameworks.filter(
    (item) => item.status === "Review Required"
  ).length;

  const averageCoverage = frameworks.length
    ? Math.round(
        frameworks.reduce((sum, item) => sum + item.coverage, 0) /
          frameworks.length
      )
    : 0;

  function updateStatus(id: string, status: FrameworkStatus) {
    setFrameworks((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item))
    );

    setSelected((current) =>
      current?.id === id ? { ...current, status } : current
    );

    setNotice(`${id} updated to ${status}. Local demo only.`);
  }

  function createFramework(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = newName.trim();

    if (!name) return;

    if (
      frameworks.some(
        (item) => item.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      setNotice("A framework with this name already exists.");
      return;
    }

    const created: Framework = {
      id: `FW-${String(Date.now()).slice(-6)}`,
      name,
      category: newCategory,
      description: "Custom framework. Add applicable requirements and controls.",
      owner: newOwner,
      controls: 0,
      verified: 0,
      coverage: 0,
      status: "In Progress",
      lastReview: "Not reviewed",
      nextReview: "Not scheduled",
    };

    setFrameworks((current) => [created, ...current]);
    setNewName("");
    setShowForm(false);
    setNotice(`${name} added to the local demo.`);
  }

  function exportCSV() {
    const header = [
      "ID",
      "Name",
      "Category",
      "Owner",
      "Controls",
      "Verified",
      "Coverage",
      "Status",
      "Last Review",
      "Next Review",
    ];

    const rows = filtered.map((item) => [
      item.id,
      item.name,
      item.category,
      item.owner,
      item.controls,
      item.verified,
      `${item.coverage}%`,
      item.status,
      item.lastReview,
      item.nextReview,
    ]);

    const escape = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [header, ...rows]
      .map((row) => row.map(escape).join(","))
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" })
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "compliance-frameworks.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <main
      style={{
        maxWidth: 1600,
        margin: "0 auto",
        padding: "28px 24px 40px",
        color: "#172033",
        fontFamily: "inherit",
        fontSize: 14,
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 25,
        }}
      >
        <div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div
              style={{
                display: "grid",
                placeItems: "center",
                width: 45,
                height: 45,
                borderRadius: 12,
                background: "#e0eaff",
                color: "#315fea",
              }}
            >
              <Scale size={23} />
            </div>
            <div>
              <h1
                style={{
                  margin: 0,
                  fontSize: 27,
                  fontWeight: 850,
                  letterSpacing: "-0.7px",
                }}
              >
                Compliance Frameworks
              </h1>
              <p style={{ margin: "5px 0 0", color: "#64748b", fontSize: 12 }}>
                ModelNow Admin / Compliance / Frameworks
              </p>
            </div>
          </div>

          <p
            style={{
              color: "#64748b",
              lineHeight: 1.7,
              maxWidth: 760,
              marginTop: 14,
            }}
          >
            Manage framework records, review control coverage, track ownership,
            and identify frameworks that require attention.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <button
            style={buttonStyle}
            onClick={() => {
              setQuery("");
              setStatusFilter("All");
              setCategoryFilter("All");
              setNotice("Filters cleared.");
            }}
          >
            <RefreshCw size={14} /> Reset filters
          </button>
          <button style={buttonStyle} onClick={exportCSV}>
            <Download size={14} /> Export CSV
          </button>
          <button
            style={{
              ...buttonStyle,
              background: "#315fea",
              borderColor: "#315fea",
              color: "#ffffff",
            }}
            onClick={() => setShowForm(true)}
          >
            <Plus size={15} /> Add framework
          </button>
        </div>
      </header>

      {notice && (
        <div
          role="status"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 10,
            padding: 12,
            marginBottom: 18,
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: 9,
            color: "#1d4ed8",
            fontSize: 12,
          }}
        >
          {notice}
          <button
            aria-label="Dismiss notice"
            onClick={() => setNotice("")}
            style={{ ...buttonStyle, padding: 4 }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
          gap: 14,
          marginBottom: 22,
        }}
      >
        {[
          {
            title: "Total Frameworks",
            value: frameworks.length,
            icon: ShieldCheck,
            color: "#315fea",
            bg: "#e0eaff",
            description: "Framework records",
          },
          {
            title: "Compliant",
            value: compliant,
            icon: CheckCircle2,
            color: "#047857",
            bg: "#d1fae5",
            description: "Marked compliant in demo data",
          },
          {
            title: "In Progress",
            value: inProgress,
            icon: Clock3,
            color: "#1d4ed8",
            bg: "#dbeafe",
            description: "Work still underway",
          },
          {
            title: "Review Required",
            value: reviewRequired,
            icon: AlertTriangle,
            color: "#b45309",
            bg: "#fef3c7",
            description: "Needs further assessment",
          },
          {
            title: "Average Coverage",
            value: `${averageCoverage}%`,
            icon: FileCheck2,
            color: "#7c3aed",
            bg: "#ede9fe",
            description: "Illustrative control coverage",
          },
        ].map((metric) => {
          const Icon = metric.icon;

          return (
            <article key={metric.title} style={cardStyle}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                }}
              >
                <span
                  style={{
                    color: "#64748b",
                    fontSize: 12,
                    fontWeight: 650,
                  }}
                >
                  {metric.title}
                </span>
                <span
                  style={{
                    display: "grid",
                    placeItems: "center",
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    color: metric.color,
                    background: metric.bg,
                  }}
                >
                  <Icon size={19} />
                </span>
              </div>
              <div style={{ fontSize: 28, fontWeight: 850, marginTop: 14 }}>
                {metric.value}
              </div>
              <p
                style={{
                  margin: "5px 0 0",
                  color: "#64748b",
                  fontSize: 12,
                }}
              >
                {metric.description}
              </p>
            </article>
          );
        })}
      </div>

      <section style={cardStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 18,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>
              Framework registry
            </h2>
            <p style={{ margin: "5px 0 0", color: "#64748b", fontSize: 12 }}>
              {filtered.length} framework(s) displayed
            </p>
          </div>
          <Filter size={18} color="#64748b" />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
            gap: 10,
            marginBottom: 18,
          }}
        >
          <div style={{ position: "relative" }}>
            <Search
              size={15}
              color="#94a3b8"
              style={{
                position: "absolute",
                left: 11,
                top: 12,
              }}
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search name, owner, ID..."
              style={{ ...inputStyle, paddingLeft: 34 }}
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            style={inputStyle}
          >
            {[
              "All",
              ...Array.from(new Set(frameworks.map((item) => item.category))),
            ].map((category) => (
              <option key={category} value={category}>
                {category === "All" ? "All categories" : category}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            style={inputStyle}
          >
            {["All", "Compliant", "In Progress", "Review Required"].map(
              (status) => (
                <option key={status} value={status}>
                  {status === "All" ? "All statuses" : status}
                </option>
              )
            )}
          </select>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              minWidth: 950,
              borderCollapse: "collapse",
              textAlign: "left",
            }}
          >
            <thead>
              <tr style={{ background: "#f8fafc", color: "#64748b" }}>
                {[
                  "Framework",
                  "Category",
                  "Owner",
                  "Controls",
                  "Coverage",
                  "Status",
                  "Next review",
                  "Action",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      padding: "13px 10px",
                      fontSize: 11,
                      fontWeight: 750,
                      borderBottom: "1px solid #e5eaf1",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td
                    style={{
                      padding: "14px 10px",
                      borderBottom: "1px solid #edf0f5",
                    }}
                  >
                    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <span
                        style={{
                          display: "grid",
                          placeItems: "center",
                          width: 35,
                          height: 35,
                          borderRadius: 9,
                          background: "#eff6ff",
                          color: "#315fea",
                          flexShrink: 0,
                        }}
                      >
                        <Scale size={17} />
                      </span>
                      <span>
                        <strong style={{ display: "block", fontSize: 12 }}>
                          {item.name}
                        </strong>
                        <span style={{ color: "#94a3b8", fontSize: 11 }}>
                          {item.id}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "14px 10px",
                      borderBottom: "1px solid #edf0f5",
                      fontSize: 12,
                    }}
                  >
                    {item.category}
                  </td>
                  <td
                    style={{
                      padding: "14px 10px",
                      borderBottom: "1px solid #edf0f5",
                      fontSize: 12,
                    }}
                  >
                    {item.owner}
                  </td>
                  <td
                    style={{
                      padding: "14px 10px",
                      borderBottom: "1px solid #edf0f5",
                      fontSize: 12,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.verified}/{item.controls}
                  </td>
                  <td
                    style={{
                      padding: "14px 10px",
                      borderBottom: "1px solid #edf0f5",
                      minWidth: 125,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 11,
                        marginBottom: 6,
                      }}
                    >
                      <span>{item.coverage}%</span>
                    </div>
                    <div
                      style={{
                        height: 6,
                        background: "#e9eef5",
                        borderRadius: 10,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          height: "100%",
                          width: `${item.coverage}%`,
                          background:
                            item.coverage >= 95
                              ? "#059669"
                              : item.coverage >= 85
                                ? "#315fea"
                                : "#d97706",
                        }}
                      />
                    </div>
                  </td>
                  <td
                    style={{
                      padding: "14px 10px",
                      borderBottom: "1px solid #edf0f5",
                    }}
                  >
                    <StatusBadge status={item.status} />
                  </td>
                  <td
                    style={{
                      padding: "14px 10px",
                      borderBottom: "1px solid #edf0f5",
                      fontSize: 12,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {item.nextReview}
                  </td>
                  <td
                    style={{
                      padding: "14px 10px",
                      borderBottom: "1px solid #edf0f5",
                    }}
                  >
                    <button
                      style={buttonStyle}
                      onClick={() => setSelected(item)}
                    >
                      <Eye size={14} /> Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 && (
          <p
            style={{
              padding: 25,
              textAlign: "center",
              color: "#64748b",
              fontSize: 12,
            }}
          >
            No frameworks match your search or filters.
          </p>
        )}
      </section>

      <div
        style={{
          marginTop: 18,
          padding: 14,
          borderRadius: 9,
          background: "#f8fafc",
          color: "#64748b",
          fontSize: 12,
          lineHeight: 1.7,
        }}
      >
        <strong style={{ color: "#334155" }}>Demo notice:</strong> These are
        illustrative framework records. Status and coverage values are not
        evidence of certification or legal compliance. Connect authenticated
        backend services and verified evidence before using this page for
        production compliance reporting.
      </div>

      {showForm && (
        <div
          onClick={() => setShowForm(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            display: "grid",
            placeItems: "center",
            padding: 16,
            background: "rgba(15,23,42,0.45)",
          }}
        >
          <form
            onSubmit={createFramework}
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(480px, 100%)",
              padding: 24,
              borderRadius: 14,
              background: "#ffffff",
              boxShadow: "0 20px 60px rgba(15,23,42,0.18)",
              display: "grid",
              gap: 15,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 19 }}>Add framework</h2>
                <p style={{ color: "#64748b", fontSize: 12 }}>
                  Create a local framework record.
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                style={buttonStyle}
                onClick={() => setShowForm(false)}
              >
                <X size={16} />
              </button>
            </div>

            <label style={{ display: "grid", gap: 7, fontSize: 12 }}>
              Framework name
              <input
                required
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="e.g. Internal AI Standard"
                style={inputStyle}
              />
            </label>

            <label style={{ display: "grid", gap: 7, fontSize: 12 }}>
              Category
              <select
                value={newCategory}
                onChange={(event) => setNewCategory(event.target.value)}
                style={inputStyle}
              >
                {[
                  "Security",
                  "Privacy",
                  "Payments",
                  "AI Governance",
                  "Other",
                ].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>

            <label style={{ display: "grid", gap: 7, fontSize: 12 }}>
              Owner
              <select
                value={newOwner}
                onChange={(event) => setNewOwner(event.target.value)}
                style={inputStyle}
              >
                {[
                  "Compliance Team",
                  "Security Team",
                  "Privacy Team",
                  "Platform Team",
                  "AI Governance Team",
                  "Unassigned",
                ].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </label>

            <div
              style={{
                padding: 12,
                borderRadius: 8,
                background: "#fff7ed",
                color: "#9a3412",
                fontSize: 12,
                lineHeight: 1.6,
              }}
            >
              New records start at 0% coverage and In Progress. Adding a record
              does not establish compliance or certification.
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button
                type="button"
                style={buttonStyle}
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  ...buttonStyle,
                  background: "#315fea",
                  color: "#ffffff",
                  borderColor: "#315fea",
                }}
              >
                <Plus size={14} /> Create
              </button>
            </div>
          </form>
        </div>
      )}

      {selected && (
        <div
          onClick={() => setSelected(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(15,23,42,0.45)",
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Framework details"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(460px, 100%)",
              height: "100%",
              overflowY: "auto",
              boxSizing: "border-box",
              padding: 24,
              background: "#ffffff",
              boxShadow: "-10px 0 40px rgba(15,23,42,0.12)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: 12,
                alignItems: "center",
              }}
            >
              <div>
                <p style={{ color: "#64748b", fontSize: 12 }}>Framework details</p>
                <h2 style={{ margin: 0, fontSize: 22 }}>{selected.name}</h2>
              </div>
              <button
                aria-label="Close details"
                style={buttonStyle}
                onClick={() => setSelected(null)}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ marginTop: 18 }}>
              <StatusBadge status={selected.status} />
            </div>

            <p style={{ color: "#64748b", lineHeight: 1.7, marginTop: 16 }}>
              {selected.description}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 10,
                marginTop: 20,
              }}
            >
              {[
                ["Framework ID", selected.id],
                ["Category", selected.category],
                ["Owner", selected.owner],
                ["Control coverage", `${selected.coverage}%`],
                ["Verified controls", `${selected.verified}/${selected.controls}`],
                ["Last review", selected.lastReview],
                ["Next review", selected.nextReview],
              ].map(([label, value]) => (
                <div
                  key={label}
                  style={{
                    padding: 13,
                    background: "#f8fafc",
                    borderRadius: 9,
                    minWidth: 0,
                  }}
                >
                  <div style={{ color: "#64748b", fontSize: 11 }}>{label}</div>
                  <div
                    style={{
                      marginTop: 6,
                      fontSize: 12,
                      fontWeight: 750,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {value}
                  </div>
                </div>
              ))}
            </div>

            <h3 style={{ marginTop: 25, fontSize: 14 }}>Update demo status</h3>
            <div style={{ display: "grid", gap: 9 }}>
              {(
                ["Compliant", "In Progress", "Review Required"] as FrameworkStatus[]
              ).map((status) => (
                <button
                  key={status}
                  style={{
                    ...buttonStyle,
                    justifyContent: "space-between",
                    padding: 12,
                    background:
                      selected.status === status ? "#eff6ff" : "#ffffff",
                  }}
                  onClick={() => updateStatus(selected.id, status)}
                >
                  {status}
                  {selected.status === status && (
                    <CheckCircle2 size={15} color="#315fea" />
                  )}
                </button>
              ))}
            </div>

            <p
              style={{
                color: "#64748b",
                fontSize: 12,
                lineHeight: 1.7,
                marginTop: 14,
              }}
            >
              This changes local demonstration data only. It does not verify
              controls or grant a certification.
            </p>
          </aside>
        </div>
      )}
    </main>
  );
}
