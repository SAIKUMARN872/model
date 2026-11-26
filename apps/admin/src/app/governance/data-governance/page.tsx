
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  Download,
  Eye,
  FileText,
  Filter,
  LockKeyhole,
  Plus,
  Search,
  ShieldCheck,
  Tag,
  X,
} from "lucide-react";

type Classification = "Public" | "Internal" | "Confidential" | "Restricted";
type AssetStatus = "Governed" | "Review Required" | "Pending Classification";

type DataAsset = {
  id: string;
  name: string;
  source: string;
  classification: Classification;
  owner: string;
  records: string;
  purpose: string;
  retention: string;
  status: AssetStatus;
  containsPII: boolean;
  lastReviewed: string;
};

const initialAssets: DataAsset[] = [
  {
    id: "DATA-1001",
    name: "Customer Profiles",
    source: "Customer Database",
    classification: "Confidential",
    owner: "Data Governance Team",
    records: "24,800",
    purpose: "Customer account and service information",
    retention: "24 months",
    status: "Governed",
    containsPII: true,
    lastReviewed: "Oct 28, 2026",
  },
  {
    id: "DATA-1002",
    name: "AI Conversation Logs",
    source: "AI Gateway",
    classification: "Restricted",
    owner: "Security Team",
    records: "186,200",
    purpose: "Operational monitoring and service improvement",
    retention: "90 days",
    status: "Review Required",
    containsPII: true,
    lastReviewed: "Oct 24, 2026",
  },
  {
    id: "DATA-1003",
    name: "Model Evaluation Results",
    source: "Evaluation Service",
    classification: "Internal",
    owner: "AI Platform Team",
    records: "8,420",
    purpose: "Model quality and performance analysis",
    retention: "12 months",
    status: "Governed",
    containsPII: false,
    lastReviewed: "Oct 22, 2026",
  },
  {
    id: "DATA-1004",
    name: "Public Documentation",
    source: "Knowledge Hub",
    classification: "Public",
    owner: "Knowledge Team",
    records: "1,240",
    purpose: "Public reference material for AI retrieval",
    retention: "Until superseded",
    status: "Governed",
    containsPII: false,
    lastReviewed: "Oct 20, 2026",
  },
  {
    id: "DATA-1005",
    name: "Employee Directory",
    source: "HR System",
    classification: "Confidential",
    owner: "HR Operations",
    records: "640",
    purpose: "Employee identity and organizational records",
    retention: "Employment term + policy",
    status: "Pending Classification",
    containsPII: true,
    lastReviewed: "Not reviewed",
  },
  {
    id: "DATA-1006",
    name: "Security Audit Events",
    source: "Audit Service",
    classification: "Restricted",
    owner: "Security Team",
    records: "52,900",
    purpose: "Security investigations and accountability",
    retention: "12 months",
    status: "Governed",
    containsPII: false,
    lastReviewed: "Oct 17, 2026",
  },
];

const colors: Record<Classification, { color: string; bg: string }> = {
  Public: { color: "#16845B", bg: "#E8F7EF" },
  Internal: { color: "#315FEA", bg: "#EEF3FF" },
  Confidential: { color: "#B96A12", bg: "#FFF4E5" },
  Restricted: { color: "#C33D46", bg: "#FDECEE" },
};

const statusColors: Record<AssetStatus, { color: string; bg: string }> = {
  Governed: { color: "#16845B", bg: "#E8F7EF" },
  "Review Required": { color: "#B96A12", bg: "#FFF4E5" },
  "Pending Classification": { color: "#7555C7", bg: "#F2EDFF" },
};

const border = "#E5E7EB";
const text = "#172033";
const muted = "#6B7280";
const blue = "#315FEA";

const fieldStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 11px",
  border: `1px solid ${border}`,
  borderRadius: 8,
  background: "#FFFFFF",
  color: text,
  fontSize: 13,
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  border: `1px solid ${border}`,
  borderRadius: 8,
  padding: "9px 12px",
  background: "#FFFFFF",
  color: text,
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const primaryButton: React.CSSProperties = {
  ...buttonStyle,
  background: blue,
  borderColor: blue,
  color: "#FFFFFF",
};

function Badge({ value }: { value: Classification | AssetStatus }) {
  const config =
    value in colors
      ? colors[value as Classification]
      : statusColors[value as AssetStatus];

  return (
    <span
      style={{
        display: "inline-flex",
        padding: "5px 8px",
        borderRadius: 20,
        color: config.color,
        background: config.bg,
        fontSize: 10,
        fontWeight: 750,
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </span>
  );
}

function Metric({
  title,
  value,
  description,
  icon: Icon,
  color,
  bg,
}: {
  title: string;
  value: number;
  description: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <article
      style={{
        background: "#FFFFFF",
        border: `1px solid ${border}`,
        borderRadius: 12,
        padding: 17,
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
        <span style={{ fontSize: 12, fontWeight: 650, color: muted }}>
          {title}
        </span>
        <span
          style={{
            width: 35,
            height: 35,
            borderRadius: 9,
            display: "grid",
            placeItems: "center",
            color,
            background: bg,
            flexShrink: 0,
          }}
        >
          <Icon size={18} />
        </span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 13 }}>{value}</div>
      <div style={{ color: muted, fontSize: 11, marginTop: 6 }}>{description}</div>
    </article>
  );
}

export default function DataGovernancePage() {
  const [assets, setAssets] = useState(initialAssets);
  const [search, setSearch] = useState("");
  const [classificationFilter, setClassificationFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [piiFilter, setPiiFilter] = useState("All");
  const [selected, setSelected] = useState<DataAsset | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    source: "",
    classification: "Internal" as Classification,
    owner: "Data Governance Team",
    records: "0",
    purpose: "",
    retention: "12 months",
    containsPII: false,
  });

  const metrics = useMemo(
    () => ({
      total: assets.length,
      governed: assets.filter((a) => a.status === "Governed").length,
      sensitive: assets.filter(
        (a) =>
          a.classification === "Confidential" ||
          a.classification === "Restricted",
      ).length,
      review: assets.filter((a) => a.status !== "Governed").length,
      pii: assets.filter((a) => a.containsPII).length,
    }),
    [assets],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return assets.filter((asset) => {
      const matchesSearch =
        !query ||
        [
          asset.id,
          asset.name,
          asset.source,
          asset.owner,
          asset.purpose,
          asset.classification,
        ].some((value) => value.toLowerCase().includes(query));

      return (
        matchesSearch &&
        (classificationFilter === "All" ||
          asset.classification === classificationFilter) &&
        (statusFilter === "All" || asset.status === statusFilter) &&
        (piiFilter === "All" ||
          (piiFilter === "Contains PII" && asset.containsPII) ||
          (piiFilter === "No PII" && !asset.containsPII))
      );
    });
  }, [assets, search, classificationFilter, statusFilter, piiFilter]);

  function updateAsset(updated: DataAsset) {
    setAssets((current) =>
      current.map((asset) => (asset.id === updated.id ? updated : asset)),
    );
    setSelected(updated);
    setNotice(`${updated.name} updated successfully.`);
  }

  function createAsset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.source.trim() || !form.purpose.trim()) {
      setError("Enter an asset name, source, and purpose.");
      return;
    }

    const nextId =
      Math.max(1000, ...assets.map((asset) => Number(asset.id.slice(5)))) + 1;

    const asset: DataAsset = {
      ...form,
      id: `DATA-${nextId}`,
      name: form.name.trim(),
      source: form.source.trim(),
      purpose: form.purpose.trim(),
      status: "Pending Classification",
      records: form.records.trim() || "0",
      lastReviewed: "Not reviewed",
    };

    setAssets((current) => [asset, ...current]);
    setShowForm(false);
    setForm({
      name: "",
      source: "",
      classification: "Internal",
      owner: "Data Governance Team",
      records: "0",
      purpose: "",
      retention: "12 months",
      containsPII: false,
    });
    setNotice(`${asset.name} added to the data inventory.`);
  }

  function exportCsv() {
    const headers = [
      "ID",
      "Asset",
      "Source",
      "Classification",
      "Owner",
      "Records",
      "Purpose",
      "Retention",
      "Status",
      "Contains PII",
      "Last Reviewed",
    ];

    const rows = filtered.map((a) => [
      a.id,
      a.name,
      a.source,
      a.classification,
      a.owner,
      a.records,
      a.purpose,
      a.retention,
      a.status,
      a.containsPII ? "Yes" : "No",
      a.lastReviewed,
    ]);

    const csvCell = (value: string) =>
      `"${value.replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-data-inventory.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Filtered data inventory exported as CSV.");
  }

  return (
    <main
      className="dg-page"
      style={{
        minHeight: "100%",
        padding: 28,
        background: "#F7F8FA",
        color: text,
        fontFamily: "inherit",
      }}
    >
      <style>{`
        .dg-table { width:100%; min-width:930px; border-collapse:collapse; text-align:left; }
        .dg-table th { padding:12px 14px; background:#FAFBFC; color:${muted}; font-size:10px; letter-spacing:.06em; white-space:nowrap; border-bottom:1px solid ${border}; }
        .dg-table td { padding:14px; border-bottom:1px solid ${border}; font-size:12px; }
        .dg-table tbody tr:hover { background:#FAFBFF; }
        .dg-label { display:block; margin-bottom:7px; font-size:12px; font-weight:700; color:#4B5563; }
        .dg-card { border:1px solid ${border}; border-radius:12px; background:#FFFFFF; overflow:hidden; }
        @media(max-width:700px) {
          .dg-page { padding:15px !important; }
          .dg-header-actions { width:100%; }
          .dg-header-actions button { flex:1; }
        }
      `}</style>

      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: 18,
          marginBottom: 24,
        }}
      >
        <div style={{ maxWidth: 780 }}>
          <div
            style={{
              display: "flex",
              gap: 7,
              alignItems: "center",
              color: blue,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            <Database size={16} /> Governance / Data Governance
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: 29,
              lineHeight: 1.2,
              letterSpacing: "-.7px",
              fontWeight: 800,
            }}
          >
            Data Governance
          </h1>
          <p
            style={{
              margin: "10px 0 0",
              color: muted,
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            Discover, classify, and govern enterprise data used across ModelNow.
            Track ownership, sensitive information, retention requirements, and
            review readiness from one workspace.
          </p>
        </div>

        <div
          className="dg-header-actions"
          style={{ display: "flex", flexWrap: "wrap", gap: 9 }}
        >
          <button type="button" style={buttonStyle} onClick={exportCsv}>
            <Download size={15} /> Export CSV
          </button>
          <button
            type="button"
            style={primaryButton}
            onClick={() => {
              setError("");
              setShowForm(true);
            }}
          >
            <Plus size={15} /> Register asset
          </button>
        </div>
      </header>

      {notice && (
        <div
          role="status"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 10,
            padding: "11px 13px",
            marginBottom: 18,
            background: "#F0FBF5",
            border: "1px solid #BDE8CF",
            color: "#176B48",
            borderRadius: 9,
            fontSize: 12,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <CheckCircle2 size={16} /> {notice}
          </span>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
            style={{ border: 0, background: "transparent", cursor: "pointer" }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))",
          gap: 13,
          marginBottom: 22,
        }}
      >
        <Metric title="Data Assets" value={metrics.total} description="Registered inventory items" icon={Database} color={blue} bg="#EEF3FF" />
        <Metric title="Governed Assets" value={metrics.governed} description="Marked as governed" icon={ShieldCheck} color="#16845B" bg="#E8F7EF" />
        <Metric title="Sensitive Assets" value={metrics.sensitive} description="Confidential or restricted" icon={LockKeyhole} color="#C33D46" bg="#FDECEE" />
        <Metric title="Review Required" value={metrics.review} description="Pending classification or review" icon={Clock3} color="#B96A12" bg="#FFF4E5" />
      </section>

      <section
        className="dg-card"
        style={{ padding: 18, marginBottom: 22 }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>
              Data classification overview
            </h2>
            <p style={{ margin: "5px 0 0", fontSize: 12, color: muted }}>
              Distribution of assets by sensitivity level.
            </p>
          </div>
          <span style={{ color: muted, fontSize: 11 }}>
            <Activity size={13} style={{ verticalAlign: "middle", marginRight: 5 }} />
            Based on inventory entries
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))",
            gap: 12,
          }}
        >
          {(["Public", "Internal", "Confidential", "Restricted"] as const).map(
            (level) => {
              const count = assets.filter(
                (asset) => asset.classification === level,
              ).length;
              const config = colors[level];
              const percent = assets.length
                ? Math.round((count / assets.length) * 100)
                : 0;

              return (
                <button
                  type="button"
                  key={level}
                  onClick={() => setClassificationFilter(level)}
                  style={{
                    textAlign: "left",
                    border: `1px solid ${border}`,
                    borderRadius: 10,
                    background:
                      classificationFilter === level ? config.bg : "#FFFFFF",
                    padding: 14,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontSize: 11, color: muted }}>{level}</div>
                  <div
                    style={{
                      fontSize: 25,
                      fontWeight: 800,
                      color: config.color,
                      marginTop: 7,
                    }}
                  >
                    {count}
                  </div>
                  <div
                    style={{
                      height: 5,
                      background: "#EEF0F4",
                      borderRadius: 10,
                      overflow: "hidden",
                      marginTop: 11,
                    }}
                  >
                    <div
                      style={{
                        width: `${percent}%`,
                        height: "100%",
                        background: config.color,
                        borderRadius: 10,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 10, color: muted, marginTop: 6 }}>
                    {percent}% of assets
                  </div>
                </button>
              );
            },
          )}
        </div>
      </section>

      <section className="dg-card">
        <div style={{ padding: "18px 20px", borderBottom: `1px solid ${border}` }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>
            Data asset inventory
          </h2>
          <p style={{ margin: "5px 0 0", fontSize: 12, color: muted }}>
            Search assets, review classifications, and manage data ownership.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            padding: "15px 20px",
            borderBottom: `1px solid ${border}`,
          }}
        >
          <div style={{ flex: "1 1 230px", position: "relative" }}>
            <Search
              size={16}
              style={{
                position: "absolute",
                top: 11,
                left: 11,
                color: muted,
              }}
            />
            <input
              aria-label="Search data assets"
              placeholder="Search assets, sources, owners..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ ...fieldStyle, paddingLeft: 36 }}
            />
          </div>

          <select
            aria-label="Classification filter"
            value={classificationFilter}
            onChange={(e) => setClassificationFilter(e.target.value)}
            style={{ ...fieldStyle, width: "auto", minWidth: 145 }}
          >
            <option value="All">All classifications</option>
            {(["Public", "Internal", "Confidential", "Restricted"] as const).map((level) => (
              <option key={level}>{level}</option>
            ))}
          </select>

          <select
            aria-label="Status filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ ...fieldStyle, width: "auto", minWidth: 155 }}
          >
            <option value="All">All statuses</option>
            {(["Governed", "Review Required", "Pending Classification"] as const).map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>

          <select
            aria-label="Sensitive data filter"
            value={piiFilter}
            onChange={(e) => setPiiFilter(e.target.value)}
            style={{ ...fieldStyle, width: "auto", minWidth: 125 }}
          >
            <option value="All">All data types</option>
            <option>Contains PII</option>
            <option>No PII</option>
          </select>

          <button
            type="button"
            style={buttonStyle}
            onClick={() => {
              setSearch("");
              setClassificationFilter("All");
              setStatusFilter("All");
              setPiiFilter("All");
            }}
          >
            <Filter size={14} /> Clear
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="dg-table">
            <thead>
              <tr>
                <th>DATA ASSET</th>
                <th>SOURCE</th>
                <th>CLASSIFICATION</th>
                <th>OWNER</th>
                <th>PII</th>
                <th>RETENTION</th>
                <th>STATUS</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((asset) => (
                <tr key={asset.id}>
                  <td>
                    <button
                      type="button"
                      onClick={() => setSelected(asset)}
                      style={{
                        border: 0,
                        padding: 0,
                        background: "transparent",
                        color: text,
                        fontSize: 12,
                        fontWeight: 750,
                        cursor: "pointer",
                        textAlign: "left",
                      }}
                    >
                      {asset.name}
                    </button>
                    <div style={{ color: muted, fontSize: 10, marginTop: 5 }}>
                      {asset.id} · {asset.records} records
                    </div>
                  </td>
                  <td>{asset.source}</td>
                  <td><Badge value={asset.classification} /></td>
                  <td>{asset.owner}</td>
                  <td>
                    <span style={{ color: asset.containsPII ? "#C33D46" : "#16845B", fontWeight: 700 }}>
                      {asset.containsPII ? "Yes" : "No"}
                    </span>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>{asset.retention}</td>
                  <td><Badge value={asset.status} /></td>
                  <td>
                    <button type="button" style={buttonStyle} onClick={() => setSelected(asset)}>
                      <Eye size={13} /> View
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", padding: 35 }}>
                    <Search size={24} color={muted} />
                    <p style={{ fontWeight: 750 }}>No data assets found</p>
                    <p style={{ color: muted, fontSize: 12 }}>
                      Try another search or clear the filters.
                    </p>
                    <button
                      type="button"
                      style={buttonStyle}
                      onClick={() => {
                        setSearch("");
                        setClassificationFilter("All");
                        setStatusFilter("All");
                        setPiiFilter("All");
                      }}
                    >
                      Clear filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
            padding: "13px 20px",
            color: muted,
            fontSize: 11,
          }}
        >
          <span>Showing {filtered.length} of {assets.length} assets</span>
          <span>Inventory actions use local demo state</span>
        </div>
      </section>

      <section
        style={{
          display: "flex",
          gap: 10,
          padding: 14,
          border: `1px solid ${border}`,
          borderRadius: 10,
          background: "#FFFFFF",
          color: muted,
          fontSize: 11,
          lineHeight: 1.7,
          marginTop: 20,
        }}
      >
        <ShieldCheck size={17} color={blue} />
        <span>
          <strong style={{ color: text }}>Data governance notice.</strong>{" "}
          Inventory entries are sample data. Classification labels do not
          automatically secure underlying data. Connect your data catalog,
          access-control service, retention enforcement, and audit APIs before
          relying on these values operationally.
        </span>
      </section>

      {showForm && (
        <div
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowForm(false);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            padding: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(15,23,42,.5)",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            style={{
              width: "100%",
              maxWidth: 620,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#FFFFFF",
              borderRadius: 14,
              padding: 22,
              boxShadow: "0 24px 70px rgba(15,23,42,.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 19 }}>Register data asset</h2>
                <p style={{ color: muted, fontSize: 12 }}>
                  Add a dataset to the governance inventory.
                </p>
              </div>
              <button type="button" aria-label="Close form" style={buttonStyle} onClick={() => setShowForm(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={createAsset}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))",
                  gap: 15,
                  marginTop: 20,
                }}
              >
                <label>
                  <span className="dg-label">Asset name *</span>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={fieldStyle} placeholder="e.g. Product Analytics" />
                </label>

                <label>
                  <span className="dg-label">Data source *</span>
                  <input required value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} style={fieldStyle} placeholder="e.g. Analytics Warehouse" />
                </label>

                <label>
                  <span className="dg-label">Classification</span>
                  <select value={form.classification} onChange={(e) => setForm({ ...form, classification: e.target.value as Classification })} style={fieldStyle}>
                    <option>Public</option>
                    <option>Internal</option>
                    <option>Confidential</option>
                    <option>Restricted</option>
                  </select>
                </label>

                <label>
                  <span className="dg-label">Owner</span>
                  <select value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} style={fieldStyle}>
                    <option>Data Governance Team</option>
                    <option>Security Team</option>
                    <option>AI Platform Team</option>
                    <option>Knowledge Team</option>
                    <option>HR Operations</option>
                    <option>Platform Team</option>
                  </select>
                </label>

                <label>
                  <span className="dg-label">Record count</span>
                  <input value={form.records} onChange={(e) => setForm({ ...form, records: e.target.value })} style={fieldStyle} />
                </label>

                <label>
                  <span className="dg-label">Retention period</span>
                  <select value={form.retention} onChange={(e) => setForm({ ...form, retention: e.target.value })} style={fieldStyle}>
                    <option>30 days</option>
                    <option>90 days</option>
                    <option>12 months</option>
                    <option>24 months</option>
                    <option>Employment term + policy</option>
                    <option>Until superseded</option>
                    <option>Custom policy</option>
                  </select>
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  <span className="dg-label">Purpose *</span>
                  <textarea required rows={3} value={form.purpose} onChange={(e) => setForm({ ...form, purpose: e.target.value })} style={{ ...fieldStyle, resize: "vertical" }} placeholder="Describe the dataset's intended use..." />
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12, gridColumn: "1 / -1" }}>
                  <input type="checkbox" checked={form.containsPII} onChange={(e) => setForm({ ...form, containsPII: e.target.checked })} />
                  This asset may contain personally identifiable information (PII)
                </label>
              </div>

              {error && <p role="alert" style={{ color: "#C33D46", fontSize: 12 }}>{error}</p>}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 22, paddingTop: 16, borderTop: `1px solid ${border}` }}>
                <button type="button" style={buttonStyle} onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" style={primaryButton}><Plus size={15} /> Register asset</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selected && (
        <div
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            padding: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(15,23,42,.5)",
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            style={{
              width: "100%",
              maxWidth: 650,
              maxHeight: "90vh",
              overflowY: "auto",
              background: "#FFFFFF",
              borderRadius: 14,
              padding: 22,
              boxShadow: "0 24px 70px rgba(15,23,42,.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 19 }}>{selected.name}</h2>
                <p style={{ margin: "6px 0", fontSize: 12, color: muted }}>{selected.id}</p>
              </div>
              <button type="button" aria-label="Close details" style={buttonStyle} onClick={() => setSelected(null)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "15px 0" }}>
              <Badge value={selected.classification} />
              <Badge value={selected.status} />
            </div>

            <p style={{ color: "#4B5563", fontSize: 13, lineHeight: 1.8 }}>{selected.purpose}</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, margin: "18px 0" }}>
              {[
                ["Source", selected.source],
                ["Owner", selected.owner],
                ["Records", selected.records],
                ["Retention", selected.retention],
                ["Contains PII", selected.containsPII ? "Yes" : "No"],
                ["Last reviewed", selected.lastReviewed],
              ].map(([label, value]) => (
                <div key={label} style={{ border: `1px solid ${border}`, borderRadius: 9, padding: 12 }}>
                  <div style={{ color: muted, fontSize: 10 }}>{label}</div>
                  <div style={{ fontSize: 12, fontWeight: 750, marginTop: 6, overflowWrap: "anywhere" }}>{value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 9, borderTop: `1px solid ${border}`, paddingTop: 17 }}>
              {selected.status !== "Governed" && (
                <button
                  type="button"
                  style={primaryButton}
                  onClick={() => updateAsset({ ...selected, status: "Governed", lastReviewed: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) })}
                >
                  <CheckCircle2 size={15} /> Mark governed
                </button>
              )}
              {selected.status !== "Review Required" && (
                <button
                  type="button"
                  style={buttonStyle}
                  onClick={() => updateAsset({ ...selected, status: "Review Required" })}
                >
                  <Clock3 size={15} /> Request review
                </button>
              )}
              <button
                type="button"
                style={buttonStyle}
                onClick={() => updateAsset({ ...selected, classification: "Restricted", status: "Review Required" })}
              >
                <LockKeyhole size={15} /> Mark restricted
              </button>
            </div>

            <p style={{ color: muted, fontSize: 11, lineHeight: 1.7, marginTop: 17 }}>
              These actions update the local demo inventory only. Actual data
              classification, retention enforcement, and access controls require
              connected backend services.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
