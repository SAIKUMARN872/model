
"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  Plus,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

type ControlStatus =
  | "Compliant"
  | "Partially Compliant"
  | "Non-Compliant"
  | "Not Assessed";

type ComplianceControl = {
  id: string;
  title: string;
  framework: string;
  category: string;
  description: string;
  owner: string;
  status: ControlStatus;
  evidence: string;
  dueDate: string;
  lastAssessed: string;
};

const initialControls: ComplianceControl[] = [
  {
    id: "CTL-001",
    title: "Access control and least privilege",
    framework: "SOC 2",
    category: "Security",
    description:
      "Access to AI services and enterprise resources is limited to authorized users and approved service identities.",
    owner: "Security Team",
    status: "Compliant",
    evidence: "Access review checklist",
    dueDate: "2026-12-01",
    lastAssessed: "2026-10-20",
  },
  {
    id: "CTL-002",
    title: "Sensitive data protection",
    framework: "ISO 27001",
    category: "Data Protection",
    description:
      "Sensitive information is classified and protected throughout approved processing workflows.",
    owner: "Data Governance Team",
    status: "Partially Compliant",
    evidence: "Data classification sample",
    dueDate: "2026-11-15",
    lastAssessed: "2026-10-18",
  },
  {
    id: "CTL-003",
    title: "AI risk assessment",
    framework: "NIST AI RMF",
    category: "AI Governance",
    description:
      "AI risks are identified, assessed, prioritized, and tracked through defined mitigation activities.",
    owner: "AI Governance Team",
    status: "Compliant",
    evidence: "AI risk register",
    dueDate: "2026-12-10",
    lastAssessed: "2026-10-22",
  },
  {
    id: "CTL-004",
    title: "Model evaluation and validation",
    framework: "NIST AI RMF",
    category: "Model Quality",
    description:
      "Models are evaluated against documented quality, safety, and performance requirements before release.",
    owner: "AI Quality Team",
    status: "Partially Compliant",
    evidence: "Model evaluation report",
    dueDate: "2026-11-20",
    lastAssessed: "2026-10-21",
  },
  {
    id: "CTL-005",
    title: "Security event monitoring",
    framework: "SOC 2",
    category: "Monitoring",
    description:
      "Relevant security events are logged, monitored, and reviewed through a documented process.",
    owner: "Platform Engineering",
    status: "Compliant",
    evidence: "Monitoring configuration review",
    dueDate: "2026-12-05",
    lastAssessed: "2026-10-19",
  },
  {
    id: "CTL-006",
    title: "Incident response readiness",
    framework: "ISO 27001",
    category: "Incident Management",
    description:
      "AI and platform incidents have documented escalation, investigation, and recovery procedures.",
    owner: "Security Team",
    status: "Not Assessed",
    evidence: "Evidence not submitted",
    dueDate: "2026-11-18",
    lastAssessed: "Not assessed",
  },
  {
    id: "CTL-007",
    title: "Vendor risk assessment",
    framework: "SOC 2",
    category: "Third-Party Risk",
    description:
      "Third-party AI service providers are reviewed for relevant security, privacy, and operational risks.",
    owner: "Procurement & Security",
    status: "Non-Compliant",
    evidence: "Vendor review incomplete",
    dueDate: "2026-11-12",
    lastAssessed: "2026-10-16",
  },
  {
    id: "CTL-008",
    title: "Data retention and deletion",
    framework: "ISO 27001",
    category: "Data Protection",
    description:
      "Retention and deletion practices are defined for relevant data stores and processing services.",
    owner: "Data Governance Team",
    status: "Compliant",
    evidence: "Retention policy review",
    dueDate: "2027-01-10",
    lastAssessed: "2026-10-23",
  },
  {
    id: "CTL-009",
    title: "Human oversight for high-impact AI",
    framework: "NIST AI RMF",
    category: "Responsible AI",
    description:
      "Appropriate human review and escalation are defined for designated high-impact use cases.",
    owner: "Responsible AI Team",
    status: "Not Assessed",
    evidence: "Evidence not submitted",
    dueDate: "2026-11-25",
    lastAssessed: "Not assessed",
  },
];

const frameworks = [
  "SOC 2",
  "ISO 27001",
  "NIST AI RMF",
  "GDPR",
  "EU AI Act",
  "Internal Policy",
];

const categories = [
  "Security",
  "Data Protection",
  "AI Governance",
  "Model Quality",
  "Monitoring",
  "Incident Management",
  "Third-Party Risk",
  "Responsible AI",
  "Operations",
  "Other",
];

const owners = [
  "Security Team",
  "Data Governance Team",
  "AI Governance Team",
  "AI Quality Team",
  "Platform Engineering",
  "Procurement & Security",
  "Responsible AI Team",
  "Compliance Team",
];

const statusColors: Record<
  ControlStatus,
  { color: string; bg: string }
> = {
  Compliant: { color: "#16845B", bg: "#E8F7EF" },
  "Partially Compliant": { color: "#B76E00", bg: "#FFF4DD" },
  "Non-Compliant": { color: "#B42318", bg: "#FEECEB" },
  "Not Assessed": { color: "#667085", bg: "#F0F1F4" },
};

const border = "#E5E7EB";
const ink = "#172033";
const muted = "#6B7280";
const blue = "#315FEA";

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 11px",
  border: `1px solid ${border}`,
  borderRadius: 8,
  background: "#FFFFFF",
  color: ink,
  fontSize: 12,
};

const secondaryButton: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "9px 12px",
  border: `1px solid ${border}`,
  borderRadius: 8,
  background: "#FFFFFF",
  color: ink,
  fontSize: 12,
  fontWeight: 700,
  cursor: "pointer",
};

const primaryButton: React.CSSProperties = {
  ...secondaryButton,
  background: blue,
  color: "#FFFFFF",
  borderColor: blue,
};

function StatusPill({ status }: { status: ControlStatus }) {
  const colors = statusColors[status];

  return (
    <span
      style={{
        display: "inline-flex",
        padding: "5px 9px",
        borderRadius: 20,
        background: colors.bg,
        color: colors.color,
        fontSize: 10,
        fontWeight: 750,
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  bg,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <article
      style={{
        padding: 17,
        border: `1px solid ${border}`,
        borderRadius: 12,
        background: "#FFFFFF",
        minWidth: 0,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 650, color: muted }}>
          {title}
        </span>
        <span
          style={{
            display: "grid",
            placeItems: "center",
            width: 34,
            height: 34,
            borderRadius: 9,
            color,
            background: bg,
          }}
        >
          <Icon size={17} />
        </span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, marginTop: 12 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: muted, marginTop: 5 }}>
        {subtitle}
      </div>
    </article>
  );
}

export default function ComplianceManagementPage() {
  const [controls, setControls] = useState(initialControls);
  const [search, setSearch] = useState("");
  const [frameworkFilter, setFrameworkFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [selected, setSelected] = useState<ComplianceControl | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    framework: "SOC 2",
    category: "Security",
    description: "",
    owner: "Security Team",
    dueDate: "",
    evidence: "",
  });

  const stats = useMemo(() => {
    const compliant = controls.filter((c) => c.status === "Compliant").length;
    const partial = controls.filter(
      (c) => c.status === "Partially Compliant",
    ).length;
    const nonCompliant = controls.filter(
      (c) => c.status === "Non-Compliant",
    ).length;
    const assessed = controls.filter(
      (c) => c.status !== "Not Assessed",
    ).length;

    return {
      total: controls.length,
      compliant,
      partial,
      nonCompliant,
      notAssessed: controls.length - assessed,
      score: controls.length
        ? Math.round(
            ((compliant + partial * 0.5) / controls.length) * 100,
          )
        : 0,
    };
  }, [controls]);

  const filteredControls = useMemo(() => {
    const query = search.trim().toLowerCase();

    return controls.filter((control) => {
      const matchesSearch =
        !query ||
        [
          control.id,
          control.title,
          control.description,
          control.framework,
          control.category,
          control.owner,
          control.evidence,
        ].some((value) => value.toLowerCase().includes(query));

      return (
        matchesSearch &&
        (frameworkFilter === "All" ||
          control.framework === frameworkFilter) &&
        (statusFilter === "All" || control.status === statusFilter) &&
        (categoryFilter === "All" || control.category === categoryFilter)
      );
    });
  }, [controls, search, frameworkFilter, statusFilter, categoryFilter]);

  function updateControl(updated: ComplianceControl) {
    setControls((current) =>
      current.map((control) =>
        control.id === updated.id ? updated : control,
      ),
    );
    setSelected(updated);
    setNotice(`${updated.id} assessment updated.`);
  }

  function createControl(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (
      !form.title.trim() ||
      !form.description.trim() ||
      !form.evidence.trim() ||
      !form.dueDate
    ) {
      setError("Complete all required fields before adding a control.");
      return;
    }

    const nextNumber =
      Math.max(
        0,
        ...controls.map((c) => Number(c.id.replace("CTL-", ""))),
      ) + 1;

    const newControl: ComplianceControl = {
      id: `CTL-${String(nextNumber).padStart(3, "0")}`,
      title: form.title.trim(),
      framework: form.framework,
      category: form.category,
      description: form.description.trim(),
      owner: form.owner,
      status: "Not Assessed",
      evidence: form.evidence.trim(),
      dueDate: form.dueDate,
      lastAssessed: "Not assessed",
    };

    setControls((current) => [newControl, ...current]);
    setShowCreate(false);
    setForm({
      title: "",
      framework: "SOC 2",
      category: "Security",
      description: "",
      owner: "Security Team",
      dueDate: "",
      evidence: "",
    });
    setNotice(`${newControl.id} added to the compliance register.`);
  }

  function exportCsv() {
    const headers = [
      "Control ID",
      "Control",
      "Framework",
      "Category",
      "Description",
      "Owner",
      "Status",
      "Evidence",
      "Due Date",
      "Last Assessed",
    ];

    const rows = filteredControls.map((c) => [
      c.id,
      c.title,
      c.framework,
      c.category,
      c.description,
      c.owner,
      c.status,
      c.evidence,
      c.dueDate,
      c.lastAssessed,
    ]);

    const escapeCsv = (value: string) => `"${value.replace(/"/g, '""')}"`;
    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCsv).join(","))
      .join("\r\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-compliance-register.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Compliance register exported to CSV.");
  }

  return (
    <main
      className="compliance-page"
      style={{
        minHeight: "100%",
        padding: 28,
        background: "#F7F8FA",
        color: ink,
        fontFamily: "inherit",
      }}
    >
      <style>{`
        .compliance-table { width:100%; min-width:900px; border-collapse:collapse; text-align:left; }
        .compliance-table th { padding:12px 14px; background:#FAFBFC; color:${muted}; font-size:10px; letter-spacing:.05em; white-space:nowrap; border-bottom:1px solid ${border}; }
        .compliance-table td { padding:14px; border-bottom:1px solid ${border}; font-size:12px; vertical-align:middle; }
        .compliance-table tbody tr:hover { background:#FAFBFF; }
        .compliance-label { display:block; margin-bottom:7px; color:#4B5563; font-size:12px; font-weight:700; }
        .compliance-card { background:#FFFFFF; border:1px solid ${border}; border-radius:12px; overflow:hidden; }
        @media(max-width:700px) {
          .compliance-page { padding:15px !important; }
          .compliance-header-actions { width:100%; }
          .compliance-header-actions button { flex:1; }
        }
      `}</style>

      <header
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 18,
          marginBottom: 24,
        }}
      >
        <div style={{ maxWidth: 750 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              color: blue,
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: ".06em",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            <ClipboardCheck size={16} /> Governance / Compliance
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
            Compliance Management
          </h1>
          <p
            style={{
              margin: "10px 0 0",
              color: muted,
              fontSize: 14,
              lineHeight: 1.7,
            }}
          >
            Track AI governance controls, compliance evidence, framework
            coverage, assessment status, and remediation actions in one place.
          </p>
        </div>

        <div
          className="compliance-header-actions"
          style={{ display: "flex", gap: 9, flexWrap: "wrap" }}
        >
          <button type="button" style={secondaryButton} onClick={exportCsv}>
            <Download size={15} /> Export CSV
          </button>
          <button
            type="button"
            style={primaryButton}
            onClick={() => {
              setError("");
              setShowCreate(true);
            }}
          >
            <Plus size={15} /> Add control
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
            border: "1px solid #BDE8CF",
            background: "#F0FBF5",
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
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
            style={{ border: 0, background: "transparent", cursor: "pointer" }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))",
          gap: 13,
          marginBottom: 22,
        }}
      >
        <MetricCard title="Total Controls" value={stats.total} subtitle="Tracked compliance controls" icon={FileCheck2} color={blue} bg="#EEF3FF" />
        <MetricCard title="Compliant" value={stats.compliant} subtitle="Controls marked compliant" icon={CheckCircle2} color="#16845B" bg="#E8F7EF" />
        <MetricCard title="Partial" value={stats.partial} subtitle="Controls needing improvement" icon={Clock3} color="#B76E00" bg="#FFF4DD" />
        <MetricCard title="Non-Compliant" value={stats.nonCompliant} subtitle="Require remediation" icon={AlertTriangle} color="#B42318" bg="#FEECEB" />
        <MetricCard title="Not Assessed" value={stats.notAssessed} subtitle="Awaiting assessment" icon={ClipboardCheck} color="#667085" bg="#F0F1F4" />
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
          gap: 15,
          marginBottom: 22,
        }}
      >
        <article className="compliance-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <ShieldCheck size={18} color={blue} />
            <h2 style={{ margin: 0, fontSize: 14 }}>Control readiness</h2>
          </div>

          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: 22 }}>
            <span style={{ fontSize: 35, fontWeight: 850 }}>{stats.score}%</span>
            <span style={{ color: muted, fontSize: 11 }}>weighted control score</span>
          </div>

          <div style={{ height: 9, borderRadius: 20, background: "#EEF0F3", overflow: "hidden", marginTop: 14 }}>
            <div style={{ width: `${stats.score}%`, height: "100%", background: blue, borderRadius: 20, transition: "width .2s" }} />
          </div>

          <div style={{ color: muted, fontSize: 11, lineHeight: 1.7, marginTop: 12 }}>
            Illustrative score: fully compliant controls count as 1, partially
            compliant controls count as 0.5, and other statuses count as 0.
            This is not a formal certification result.
          </div>
        </article>

        <article className="compliance-card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <AlertTriangle size={18} color="#B42318" />
            <h2 style={{ margin: 0, fontSize: 14 }}>Items needing attention</h2>
          </div>

          <div style={{ display: "grid", gap: 13, marginTop: 18 }}>
            {[
              {
                label: "Non-compliant controls",
                count: stats.nonCompliant,
                color: "#B42318",
                status: "Non-Compliant",
              },
              {
                label: "Partially compliant controls",
                count: stats.partial,
                color: "#B76E00",
                status: "Partially Compliant",
              },
              {
                label: "Controls not assessed",
                count: stats.notAssessed,
                color: "#667085",
                status: "Not Assessed",
              },
            ].map((item) => (
              <button
                type="button"
                key={item.status}
                onClick={() => setStatusFilter(item.status)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 10,
                  padding: "11px 12px",
                  border: `1px solid ${border}`,
                  borderRadius: 8,
                  background: "#FFFFFF",
                  textAlign: "left",
                  cursor: "pointer",
                }}
              >
                <span style={{ color: "#4B5563", fontSize: 12 }}>{item.label}</span>
                <span style={{ color: item.color, fontSize: 17, fontWeight: 850 }}>{item.count}</span>
              </button>
            ))}
          </div>
        </article>
      </section>

      <section className="compliance-card">
        <div style={{ padding: "18px 20px", borderBottom: `1px solid ${border}` }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>
            Compliance control register
          </h2>
          <p style={{ margin: "5px 0 0", color: muted, fontSize: 12 }}>
            Review framework coverage, evidence references, owners, and assessment results.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, padding: "15px 20px", borderBottom: `1px solid ${border}` }}>
          <div style={{ flex: "1 1 210px", position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: 11, top: 11, color: muted }} />
            <input
              aria-label="Search compliance controls"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search controls, owners, evidence..."
              style={{ ...inputStyle, paddingLeft: 36 }}
            />
          </div>

          <select aria-label="Filter by framework" value={frameworkFilter} onChange={(e) => setFrameworkFilter(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 135 }}>
            <option value="All">All frameworks</option>
            {frameworks.map((framework) => <option key={framework}>{framework}</option>)}
          </select>

          <select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 150 }}>
            <option value="All">All statuses</option>
            <option>Compliant</option>
            <option>Partially Compliant</option>
            <option>Non-Compliant</option>
            <option>Not Assessed</option>
          </select>

          <select aria-label="Filter by category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 145 }}>
            <option value="All">All categories</option>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>

          <button type="button" style={secondaryButton} onClick={() => { setSearch(""); setFrameworkFilter("All"); setStatusFilter("All"); setCategoryFilter("All"); }}>
            <Filter size={14} /> Clear
          </button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="compliance-table">
            <thead>
              <tr>
                <th>CONTROL</th>
                <th>FRAMEWORK</th>
                <th>CATEGORY</th>
                <th>OWNER</th>
                <th>STATUS</th>
                <th>DUE DATE</th>
                <th>EVIDENCE</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredControls.map((control) => (
                <tr key={control.id}>
                  <td>
                    <button
                      type="button"
                      onClick={() => setSelected(control)}
                      style={{ padding: 0, border: 0, background: "transparent", color: ink, textAlign: "left", fontWeight: 750, fontSize: 12, cursor: "pointer" }}
                    >
                      {control.title}
                    </button>
                    <div style={{ color: muted, fontSize: 10, marginTop: 5 }}>{control.id}</div>
                  </td>
                  <td>
                    <span style={{ padding: "5px 8px", borderRadius: 7, background: "#F2F4F7", fontSize: 10, fontWeight: 750 }}>
                      {control.framework}
                    </span>
                  </td>
                  <td>{control.category}</td>
                  <td>{control.owner}</td>
                  <td><StatusPill status={control.status} /></td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <CalendarDays size={13} style={{ verticalAlign: "middle", marginRight: 5, color: muted }} />
                    {control.dueDate}
                  </td>
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <FileText size={13} color={muted} />
                      <span style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{control.evidence}</span>
                    </span>
                  </td>
                  <td>
                    <button type="button" style={secondaryButton} onClick={() => setSelected(control)}>
                      <Eye size={13} /> Review
                    </button>
                  </td>
                </tr>
              ))}

              {filteredControls.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ padding: 35, textAlign: "center" }}>
                    <Search size={24} color={muted} />
                    <p style={{ fontWeight: 750 }}>No controls found</p>
                    <p style={{ color: muted, fontSize: 12 }}>
                      Change your search terms or filters.
                    </p>
                    <button type="button" style={secondaryButton} onClick={() => { setSearch(""); setFrameworkFilter("All"); setStatusFilter("All"); setCategoryFilter("All"); }}>
                      Clear filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10, padding: "13px 20px", color: muted, fontSize: 11 }}>
          <span>Showing {filteredControls.length} of {controls.length} controls</span>
          <span>Sample compliance register · Local demo state</span>
        </div>
      </section>

      <section style={{ display: "flex", gap: 10, padding: 14, border: `1px solid ${border}`, borderRadius: 10, background: "#FFFFFF", color: muted, fontSize: 11, lineHeight: 1.7, marginTop: 20 }}>
        <ShieldCheck size={17} color={blue} />
        <span>
          <strong style={{ color: ink }}>Compliance note.</strong>{" "}
          Framework labels indicate which framework a sample control is mapped
          to; they do not demonstrate certification or legal compliance.
          Evidence references are placeholders until connected to real records.
        </span>
      </section>

      {showCreate && (
        <div
          onMouseDown={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}
          style={{ position: "fixed", inset: 0, zIndex: 1000, padding: 18, display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(15,23,42,.5)" }}
        >
          <section role="dialog" aria-modal="true" style={{ width: "100%", maxWidth: 640, maxHeight: "90vh", overflowY: "auto", background: "#FFFFFF", borderRadius: 14, padding: 22, boxShadow: "0 24px 70px rgba(15,23,42,.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <h2 style={{ margin: 0, fontSize: 19 }}>Add compliance control</h2>
                <p style={{ color: muted, fontSize: 12 }}>New controls begin as not assessed.</p>
              </div>
              <button type="button" aria-label="Close form" style={secondaryButton} onClick={() => setShowCreate(false)}><X size={16} /></button>
            </div>

            <form onSubmit={createControl}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: 15, marginTop: 18 }}>
                <label style={{ gridColumn: "1 / -1" }}>
                  <span className="compliance-label">Control name *</span>
                  <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} placeholder="e.g. Model change approval" />
                </label>

                <label>
                  <span className="compliance-label">Framework</span>
                  <select value={form.framework} onChange={(e) => setForm({ ...form, framework: e.target.value })} style={inputStyle}>
                    {frameworks.map((framework) => <option key={framework}>{framework}</option>)}
                  </select>
                </label>

                <label>
                  <span className="compliance-label">Category</span>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                    {categories.map((category) => <option key={category}>{category}</option>)}
                  </select>
                </label>

                <label>
                  <span className="compliance-label">Control owner</span>
                  <select value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} style={inputStyle}>
                    {owners.map((owner) => <option key={owner}>{owner}</option>)}
                  </select>
                </label>

                <label>
                  <span className="compliance-label">Due date *</span>
                  <input required type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} style={inputStyle} />
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  <span className="compliance-label">Description *</span>
                  <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, resize: "vertical" }} placeholder="Describe the expected control and outcome." />
                </label>

                <label style={{ gridColumn: "1 / -1" }}>
                  <span className="compliance-label">Evidence reference *</span>
                  <input required value={form.evidence} onChange={(e) => setForm({ ...form, evidence: e.target.value })} style={inputStyle} placeholder="e.g. Evidence repository link or document reference" />
                </label>
              </div>

              {error && <p role="alert" style={{ color: "#B42318", fontSize: 12 }}>{error}</p>}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${border}` }}>
                <button type="button" style={secondaryButton} onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" style={primaryButton}><Plus size={15} /> Add control</button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selected && (
        <div
          onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}
          style={{ position: "fixed", inset: 0, zIndex: 1000, padding: 18, display: "flex", justifyContent: "center", alignItems: "center", background: "rgba(15,23,42,.5)" }}
        >
          <section role="dialog" aria-modal="true" style={{ width: "100%", maxWidth: 620, maxHeight: "90vh", overflowY: "auto", background: "#FFFFFF", borderRadius: 14, padding: 22, boxShadow: "0 24px 70px rgba(15,23,42,.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <div>
                <div style={{ color: blue, fontSize: 11, fontWeight: 800 }}>{selected.id} · {selected.framework}</div>
                <h2 style={{ margin: "8px 0", fontSize: 20 }}>{selected.title}</h2>
              </div>
              <button type="button" aria-label="Close control details" style={secondaryButton} onClick={() => setSelected(null)}><X size={16} /></button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "12px 0" }}>
              <StatusPill status={selected.status} />
              <span style={{ padding: "5px 9px", borderRadius: 20, background: "#F0F1F4", color: "#4B5563", fontSize: 10, fontWeight: 750 }}>{selected.category}</span>
            </div>

            <p style={{ fontSize: 13, lineHeight: 1.8, color: "#4B5563" }}>{selected.description}</p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 10, margin: "18px 0" }}>
              {[
                ["Framework", selected.framework],
                ["Owner", selected.owner],
                ["Due date", selected.dueDate],
                ["Last assessed", selected.lastAssessed],
              ].map(([label, value]) => (
                <div key={label} style={{ border: `1px solid ${border}`, borderRadius: 9, padding: 12 }}>
                  <div style={{ color: muted, fontSize: 10 }}>{label}</div>
                  <div style={{ fontSize: 12, fontWeight: 750, marginTop: 6, lineHeight: 1.6 }}>{value}</div>
                </div>
              ))}
            </div>

            <h3 style={{ fontSize: 13, marginBottom: 8 }}>Evidence reference</h3>
            <div style={{ border: `1px solid ${border}`, borderRadius: 9, padding: 13, color: "#4B5563", fontSize: 12, lineHeight: 1.7 }}>
              <FileText size={15} style={{ verticalAlign: "middle", marginRight: 7 }} />
              {selected.evidence}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 9, marginTop: 20, paddingTop: 16, borderTop: `1px solid ${border}` }}>
              {(["Compliant", "Partially Compliant", "Non-Compliant", "Not Assessed"] as ControlStatus[])
                .filter((status) => status !== selected.status)
                .map((status) => (
                  <button
                    type="button"
                    key={status}
                    style={status === "Compliant" ? primaryButton : secondaryButton}
                    onClick={() => updateControl({
                      ...selected,
                      status,
                      lastAssessed: new Date().toISOString().slice(0, 10),
                    })}
                  >
                    {status === "Compliant" && <Check size={14} />}
                    {status}
                  </button>
                ))}
            </div>

            <p style={{ color: muted, fontSize: 11, lineHeight: 1.7, marginTop: 16 }}>
              Assessment changes are local demo actions. In production, store
              actual evidence, reviewer identity, timestamps, and approval
              history.
            </p>
          </section>
        </div>
      )}
    </main>
  );
}
