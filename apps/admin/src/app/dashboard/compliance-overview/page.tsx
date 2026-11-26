
"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  AlertTriangle,
  ArrowDownToLine,
  CalendarDays,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  Download,
  FileCheck2,
  FileText,
  Filter,
  LockKeyhole,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

type ComplianceStatus = "Compliant" | "In review" | "Needs attention" | "Not started";
type Priority = "High" | "Medium" | "Low";

type Framework = {
  id: string;
  name: string;
  description: string;
  progress: number;
  controls: number;
  completed: number;
  status: ComplianceStatus;
};

type ComplianceRecord = {
  id: string;
  title: string;
  category: string;
  owner: string;
  framework: string;
  priority: Priority;
  status: ComplianceStatus;
  dueDate: string;
  evidence: string;
  description: string;
};

const initialFrameworks: Framework[] = [
  {
    id: "SOC2",
    name: "SOC 2 Type II",
    description: "Security, availability, confidentiality, and processing integrity",
    progress: 82,
    controls: 45,
    completed: 37,
    status: "In review",
  },
  {
    id: "ISO27001",
    name: "ISO 27001",
    description: "Information security management system",
    progress: 74,
    controls: 38,
    completed: 28,
    status: "In review",
  },
  {
    id: "GDPR",
    name: "GDPR",
    description: "Data protection and privacy obligations",
    progress: 91,
    controls: 22,
    completed: 20,
    status: "Compliant",
  },
  {
    id: "HIPAA",
    name: "HIPAA readiness",
    description: "Healthcare data safeguards and privacy controls",
    progress: 46,
    controls: 26,
    completed: 12,
    status: "Needs attention",
  },
];

const initialRecords: ComplianceRecord[] = [
  {
    id: "CMP-1001",
    title: "Review administrator access",
    category: "Access control",
    owner: "Security team",
    framework: "SOC2",
    priority: "High",
    status: "Needs attention",
    dueDate: "2026-11-08",
    evidence: "Access review report",
    description: "Review privileged accounts, assigned roles, and approval records.",
  },
  {
    id: "CMP-1002",
    title: "Update incident response procedure",
    category: "Incident management",
    owner: "Platform team",
    framework: "ISO27001",
    priority: "High",
    status: "In review",
    dueDate: "2026-11-10",
    evidence: "Incident response policy",
    description: "Validate escalation steps, incident ownership, and response documentation.",
  },
  {
    id: "CMP-1003",
    title: "Document data retention policy",
    category: "Data privacy",
    owner: "Privacy team",
    framework: "GDPR",
    priority: "Medium",
    status: "Compliant",
    dueDate: "2026-11-12",
    evidence: "Retention policy document",
    description: "Document retention periods, deletion procedures, and exception handling.",
  },
  {
    id: "CMP-1004",
    title: "Verify encryption controls",
    category: "Data protection",
    owner: "Infrastructure team",
    framework: "SOC2",
    priority: "High",
    status: "In review",
    dueDate: "2026-11-14",
    evidence: "Encryption configuration report",
    description: "Review encryption at rest and in transit for relevant systems.",
  },
  {
    id: "CMP-1005",
    title: "Complete vendor risk assessment",
    category: "Third-party risk",
    owner: "Compliance team",
    framework: "ISO27001",
    priority: "Medium",
    status: "Not started",
    dueDate: "2026-11-18",
    evidence: "Vendor assessment register",
    description: "Record vendor risk ratings, reviews, and remediation actions.",
  },
  {
    id: "CMP-1006",
    title: "Review data subject request workflow",
    category: "Data privacy",
    owner: "Privacy team",
    framework: "GDPR",
    priority: "Medium",
    status: "Compliant",
    dueDate: "2026-11-20",
    evidence: "Data request procedure",
    description: "Validate the documented process for handling privacy requests.",
  },
  {
    id: "CMP-1007",
    title: "Review audit log retention",
    category: "Logging and monitoring",
    owner: "Platform team",
    framework: "SOC2",
    priority: "Low",
    status: "Not started",
    dueDate: "2026-11-22",
    evidence: "Audit logging configuration",
    description: "Confirm the intended retention period and access restrictions for audit logs.",
  },
  {
    id: "CMP-1008",
    title: "Document workforce security training",
    category: "People and training",
    owner: "People operations",
    framework: "ISO27001",
    priority: "Low",
    status: "In review",
    dueDate: "2026-11-25",
    evidence: "Training completion register",
    description: "Maintain documentation for security awareness training and completion.",
  },
  {
    id: "CMP-1009",
    title: "Validate sensitive data handling",
    category: "Data protection",
    owner: "Security team",
    framework: "HIPAA",
    priority: "High",
    status: "Needs attention",
    dueDate: "2026-11-06",
    evidence: "Data handling assessment",
    description: "Review safeguards applicable to sensitive healthcare-related information.",
  },
];

const statusColors: Record<ComplianceStatus, CSSProperties> = {
  Compliant: { color: "#067647", background: "#dcfae6" },
  "In review": { color: "#175cd3", background: "#eaf2ff" },
  "Needs attention": { color: "#b42318", background: "#fee4e2" },
  "Not started": { color: "#667085", background: "#f0f2f5" },
};

const priorityColors: Record<Priority, CSSProperties> = {
  High: { color: "#b42318", background: "#fee4e2" },
  Medium: { color: "#b54708", background: "#fff0d5" },
  Low: { color: "#027a48", background: "#dcfae6" },
};

const styles: Record<string, CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#f7f8fa",
    color: "#172033",
    padding: 28,
    fontFamily: "Arial, Helvetica, sans-serif",
  },
  container: { maxWidth: 1480, margin: "0 auto" },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 22,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 750,
    letterSpacing: 1,
    color: "#7b8798",
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: { fontSize: 28, fontWeight: 750, letterSpacing: -0.7, margin: 0 },
  subtitle: { color: "#718096", fontSize: 13, lineHeight: 1.65, marginTop: 8, maxWidth: 750 },
  button: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    border: "1px solid #dce2ea",
    background: "#fff",
    color: "#344054",
    borderRadius: 9,
    padding: "10px 13px",
    fontSize: 12,
    fontWeight: 650,
    cursor: "pointer",
  },
  primary: { background: "#315fe9", color: "#fff", borderColor: "#315fe9" },
  notice: {
    display: "flex",
    gap: 10,
    alignItems: "flex-start",
    background: "#fff8e8",
    color: "#855b0c",
    border: "1px solid #f5d99b",
    borderRadius: 10,
    padding: 13,
    marginBottom: 20,
    fontSize: 12,
    lineHeight: 1.6,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))",
    gap: 14,
    marginBottom: 18,
  },
  card: {
    background: "#fff",
    border: "1px solid #e6eaf0",
    borderRadius: 13,
    padding: 18,
    minWidth: 0,
  },
  row: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  label: { color: "#718096", fontSize: 12, fontWeight: 600 },
  metric: { fontSize: 28, fontWeight: 750, letterSpacing: -0.7, marginTop: 13 },
  foot: { color: "#7b8798", fontSize: 11, marginTop: 9, lineHeight: 1.5 },
  icon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 38,
    height: 38,
    borderRadius: 10,
    background: "#eef3ff",
    color: "#315fe9",
    flexShrink: 0,
  },
  sectionTitle: { fontSize: 15, fontWeight: 750, margin: 0 },
  sectionSub: { color: "#7b8798", fontSize: 12, lineHeight: 1.5, marginTop: 6 },
  frameworks: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 14,
    marginBottom: 18,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 20,
    padding: "5px 8px",
    fontSize: 10,
    fontWeight: 750,
    whiteSpace: "nowrap",
  },
  progressTrack: {
    height: 8,
    background: "#edf0f5",
    borderRadius: 20,
    overflow: "hidden",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  th: {
    textAlign: "left",
    color: "#7b8798",
    background: "#fafbfc",
    fontWeight: 650,
    padding: "12px 10px",
    borderBottom: "1px solid #edf0f4",
    whiteSpace: "nowrap",
  },
  td: {
    padding: "14px 10px",
    borderBottom: "1px solid #edf0f4",
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  },
  inputWrap: {
    minWidth: 210,
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "0 10px",
    border: "1px solid #dce2ea",
    borderRadius: 8,
    background: "#fff",
  },
  select: {
    padding: "10px 12px",
    border: "1px solid #dce2ea",
    borderRadius: 8,
    background: "#fff",
    color: "#344054",
    fontSize: 12,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 50,
    background: "rgba(15,23,42,.35)",
    display: "flex",
    justifyContent: "flex-end",
  },
  drawer: {
    width: "min(450px, 100%)",
    height: "100%",
    overflowY: "auto",
    background: "#fff",
    padding: 24,
    boxShadow: "-12px 0 40px rgba(15,23,42,.12)",
  },
};

function StatusBadge({ status }: { status: ComplianceStatus }) {
  return <span style={{ ...styles.badge, ...statusColors[status] }}>{status}</span>;
}

function PriorityBadge({ priority }: { priority: Priority }) {
  return <span style={{ ...styles.badge, ...priorityColors[priority] }}>{priority}</span>;
}

export default function ComplianceOverviewPage() {
  const [records, setRecords] = useState<ComplianceRecord[]>(initialRecords);
  const [frameworks] = useState<Framework[]>(initialFrameworks);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [frameworkFilter, setFrameworkFilter] = useState("All");
  const [selected, setSelected] = useState<ComplianceRecord | null>(null);

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase();

    return records.filter((record) => {
      const matchesSearch =
        !query ||
        record.id.toLowerCase().includes(query) ||
        record.title.toLowerCase().includes(query) ||
        record.owner.toLowerCase().includes(query) ||
        record.category.toLowerCase().includes(query) ||
        record.evidence.toLowerCase().includes(query);

      return (
        matchesSearch &&
        (statusFilter === "All" || record.status === statusFilter) &&
        (priorityFilter === "All" || record.priority === priorityFilter) &&
        (frameworkFilter === "All" || record.framework === frameworkFilter)
      );
    });
  }, [records, search, statusFilter, priorityFilter, frameworkFilter]);

  const completedControls = frameworks.reduce((total, framework) => total + framework.completed, 0);
  const totalControls = frameworks.reduce((total, framework) => total + framework.controls, 0);
  const attentionCount = records.filter((record) => record.status === "Needs attention").length;
  const reviewCount = records.filter((record) => record.status === "In review").length;
  const completedTasks = records.filter((record) => record.status === "Compliant").length;

  const exportCsv = () => {
    const headers = [
      "ID",
      "Title",
      "Category",
      "Owner",
      "Framework",
      "Priority",
      "Status",
      "Due date",
      "Evidence",
    ];

    const rows = filteredRecords.map((record) => [
      record.id,
      record.title,
      record.category,
      record.owner,
      record.framework,
      record.priority,
      record.status,
      record.dueDate,
      record.evidence,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-compliance-records.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  const changeStatus = (id: string, status: ComplianceStatus) => {
    setRecords((current) =>
      current.map((record) => (record.id === id ? { ...record, status } : record))
    );
    setSelected((current) => (current?.id === id ? { ...current, status } : current));
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setPriorityFilter("All");
    setFrameworkFilter("All");
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <div>
            <div style={styles.eyebrow}>Admin / Dashboard</div>
            <h1 style={styles.title}>Compliance Overview</h1>
            <p style={styles.subtitle}>
              Track compliance readiness, policy reviews, control completion, evidence, and upcoming audit tasks across ModelNow.
            </p>
          </div>

          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <button type="button" style={styles.button} onClick={exportCsv}>
              <Download size={15} /> Export report
            </button>
            <button type="button" style={{ ...styles.button, ...styles.primary }} onClick={() => window.print()}>
              <ArrowDownToLine size={15} /> Print summary
            </button>
          </div>
        </header>

        <div style={styles.notice}>
          <AlertTriangle size={17} />
          <span>
            <strong>Illustrative compliance data.</strong> This dashboard does not establish certification or legal compliance. Framework progress, controls, owners, and evidence are sample records and require validation by your compliance team.
          </span>
        </div>

        <section style={styles.grid}>
          <article style={styles.card}>
            <div style={styles.row}>
              <span style={styles.label}>Overall readiness</span>
              <span style={styles.icon}><ShieldCheck size={19} /></span>
            </div>
            <div style={styles.metric}>78%</div>
            <div style={styles.foot}>Illustrative score across tracked frameworks</div>
          </article>

          <article style={styles.card}>
            <div style={styles.row}>
              <span style={styles.label}>Controls completed</span>
              <span style={styles.icon}><CheckCircle2 size={19} /></span>
            </div>
            <div style={styles.metric}>{completedControls}<span style={{ fontSize: 15, color: "#718096" }}> / {totalControls}</span></div>
            <div style={styles.foot}>Completed controls in sample framework data</div>
          </article>

          <article style={styles.card}>
            <div style={styles.row}>
              <span style={styles.label}>Needs attention</span>
              <span style={{ ...styles.icon, background: "#fff0ee", color: "#b42318" }}><AlertTriangle size={19} /></span>
            </div>
            <div style={styles.metric}>{attentionCount}</div>
            <div style={styles.foot}>Records requiring follow-up</div>
          </article>

          <article style={styles.card}>
            <div style={styles.row}>
              <span style={styles.label}>Under review</span>
              <span style={{ ...styles.icon, background: "#eaf2ff", color: "#175cd3" }}><Clock3 size={19} /></span>
            </div>
            <div style={styles.metric}>{reviewCount}</div>
            <div style={styles.foot}>{completedTasks} records marked compliant</div>
          </article>
        </section>

        <section style={{ marginBottom: 22 }}>
          <div style={{ marginBottom: 13 }}>
            <h2 style={styles.sectionTitle}>Compliance frameworks</h2>
            <p style={styles.sectionSub}>Readiness overview by framework</p>
          </div>

          <div style={styles.frameworks}>
            {frameworks.map((framework) => (
              <article key={framework.id} style={styles.card}>
                <div style={styles.row}>
                  <span style={{ ...styles.icon, width: 42, height: 42 }}>
                    {framework.id === "GDPR" ? <LockKeyhole size={20} /> : <FileCheck2 size={20} />}
                  </span>
                  <StatusBadge status={framework.status} />
                </div>

                <h3 style={{ fontSize: 16, margin: "17px 0 7px" }}>{framework.name}</h3>
                <p style={{ fontSize: 11, lineHeight: 1.6, color: "#718096", minHeight: 36, margin: 0 }}>
                  {framework.description}
                </p>

                <div style={{ ...styles.row, margin: "18px 0 8px" }}>
                  <span style={styles.label}>Readiness</span>
                  <strong style={{ fontSize: 13 }}>{framework.progress}%</strong>
                </div>

                <div style={styles.progressTrack}>
                  <div
                    style={{
                      height: "100%",
                      width: `${framework.progress}%`,
                      background: framework.progress >= 90 ? "#159568" : framework.progress >= 70 ? "#315fe9" : "#e69a28",
                      borderRadius: 20,
                    }}
                  />
                </div>

                <div style={{ ...styles.row, marginTop: 12 }}>
                  <span style={{ fontSize: 11, color: "#718096" }}>
                    {framework.completed} of {framework.controls} controls
                  </span>
                  <button
                    type="button"
                    style={{ ...styles.button, padding: "7px 9px", fontSize: 11 }}
                    onClick={() => setFrameworkFilter(framework.id)}
                  >
                    View tasks
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section style={{ ...styles.card, marginBottom: 18 }}>
          <div style={styles.row}>
            <div>
              <h2 style={styles.sectionTitle}>Compliance tasks and evidence</h2>
              <p style={styles.sectionSub}>Search, filter, inspect, and update sample compliance records</p>
            </div>
            <div style={{ display: "flex", gap: 7, alignItems: "center", color: "#718096", fontSize: 11 }}>
              <ClipboardCheck size={16} /> {filteredRecords.length} records
            </div>
          </div>

          <div style={{ display: "flex", gap: 9, flexWrap: "wrap", margin: "18px 0 14px" }}>
            <div style={styles.inputWrap}>
              <Search size={15} color="#8490a2" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search tasks, owners, evidence..."
                aria-label="Search compliance records"
                style={{ border: 0, outline: 0, width: "100%", padding: "10px 0", fontSize: 12, background: "transparent", color: "#344054" }}
              />
            </div>

            <select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={styles.select}>
              <option value="All">All statuses</option>
              <option value="Compliant">Compliant</option>
              <option value="In review">In review</option>
              <option value="Needs attention">Needs attention</option>
              <option value="Not started">Not started</option>
            </select>

            <select aria-label="Filter by priority" value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} style={styles.select}>
              <option value="All">All priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>

            <select aria-label="Filter by framework" value={frameworkFilter} onChange={(event) => setFrameworkFilter(event.target.value)} style={styles.select}>
              <option value="All">All frameworks</option>
              {frameworks.map((framework) => (
                <option key={framework.id} value={framework.id}>{framework.name}</option>
              ))}
            </select>

            <button type="button" style={styles.button} onClick={clearFilters}>
              <Filter size={14} /> Clear
            </button>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  {["Task", "Framework", "Owner", "Priority", "Due date", "Status", "Evidence", ""].map((heading, index) => (
                    <th key={`${heading}-${index}`} style={styles.th}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record) => (
                  <tr key={record.id}>
                    <td style={styles.td}>
                      <div style={{ fontWeight: 700 }}>{record.title}</div>
                      <div style={{ fontSize: 10, color: "#8490a2", marginTop: 5 }}>{record.id} · {record.category}</div>
                    </td>
                    <td style={styles.td}>{record.framework}</td>
                    <td style={styles.td}>{record.owner}</td>
                    <td style={styles.td}><PriorityBadge priority={record.priority} /></td>
                    <td style={styles.td}>{record.dueDate}</td>
                    <td style={styles.td}><StatusBadge status={record.status} /></td>
                    <td style={styles.td}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                        <FileText size={14} color="#718096" /> {record.evidence}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button type="button" style={{ ...styles.button, padding: "7px 9px" }} onClick={() => setSelected(record)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredRecords.length === 0 && (
                  <tr>
                    <td colSpan={8} style={{ ...styles.td, textAlign: "center", padding: 28, color: "#718096" }}>
                      No compliance records match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section style={styles.grid}>
          <article style={styles.card}>
            <div style={styles.row}>
              <div>
                <h2 style={styles.sectionTitle}>Upcoming review dates</h2>
                <p style={styles.sectionSub}>Sample deadlines for planning purposes</p>
              </div>
              <CalendarDays size={20} color="#315fe9" />
            </div>
            {[
              ["Nov 06, 2026", "Sensitive data handling", "High priority"],
              ["Nov 08, 2026", "Administrator access review", "High priority"],
              ["Nov 10, 2026", "Incident response procedure", "Policy review"],
            ].map(([date, title, detail]) => (
              <div key={title} style={{ padding: "14px 0", borderBottom: "1px solid #edf0f4" }}>
                <div style={{ fontSize: 11, fontWeight: 750, color: "#315fe9" }}>{date}</div>
                <div style={{ fontSize: 12, fontWeight: 700, marginTop: 5 }}>{title}</div>
                <div style={{ fontSize: 10, color: "#8490a2", marginTop: 4 }}>{detail}</div>
              </div>
            ))}
          </article>

          <article style={styles.card}>
            <div style={styles.row}>
              <div>
                <h2 style={styles.sectionTitle}>Evidence management</h2>
                <p style={styles.sectionSub}>Evidence tracking summary</p>
              </div>
              <FileCheck2 size={20} color="#315fe9" />
            </div>
            {[
              { label: "Evidence references", value: records.length, detail: "Sample linked records" },
              { label: "Policy reviews", value: records.filter((record) => record.category.toLowerCase().includes("privacy") || record.category.toLowerCase().includes("incident")).length, detail: "Privacy and incident-related tasks" },
              { label: "High-priority tasks", value: records.filter((record) => record.priority === "High").length, detail: "Require closer review" },
            ].map((item) => (
              <div key={item.label} style={{ ...styles.row, padding: "16px 0", borderBottom: "1px solid #edf0f4" }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{item.label}</div>
                  <div style={{ fontSize: 10, color: "#8490a2", marginTop: 4 }}>{item.detail}</div>
                </div>
                <strong style={{ fontSize: 21 }}>{item.value}</strong>
              </div>
            ))}
          </article>
        </section>

        <footer style={{ textAlign: "center", color: "#8490a2", fontSize: 11, marginTop: 22 }}>
          ModelNow Admin · Compliance Overview · Sample data
        </footer>
      </div>

      {selected && (
        <div style={styles.overlay} onClick={() => setSelected(null)}>
          <aside style={styles.drawer} onClick={(event) => event.stopPropagation()}>
            <div style={{ ...styles.row, marginBottom: 22 }}>
              <div>
                <div style={styles.eyebrow}>Compliance record</div>
                <h2 style={{ fontSize: 21, margin: 0 }}>{selected.id}</h2>
              </div>
              <button type="button" aria-label="Close details" style={styles.button} onClick={() => setSelected(null)}>
                <X size={16} />
              </button>
            </div>

            <h3 style={{ fontSize: 17, lineHeight: 1.5 }}>{selected.title}</h3>
            <p style={{ color: "#667085", fontSize: 13, lineHeight: 1.7 }}>{selected.description}</p>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", margin: "18px 0" }}>
              <StatusBadge status={selected.status} />
              <PriorityBadge priority={selected.priority} />
            </div>

            {[
              ["Category", selected.category],
              ["Framework", selected.framework],
              ["Owner", selected.owner],
              ["Due date", selected.dueDate],
              ["Evidence", selected.evidence],
            ].map(([label, value]) => (
              <div key={label} style={{ ...styles.row, padding: "14px 0", borderBottom: "1px solid #edf0f4" }}>
                <span style={styles.label}>{label}</span>
                <strong style={{ fontSize: 12, textAlign: "right", maxWidth: "60%", overflowWrap: "anywhere" }}>{value}</strong>
              </div>
            ))}

            <h3 style={{ fontSize: 14, marginTop: 25 }}>Update task status</h3>
            <p style={styles.sectionSub}>Changes are stored only in this page's local state.</p>

            <div style={{ display: "grid", gap: 9, marginTop: 14 }}>
              {(["Not started", "In review", "Needs attention", "Compliant"] as ComplianceStatus[]).map((status) => (
                <button
                  type="button"
                  key={status}
                  style={{
                    ...styles.button,
                    justifyContent: "flex-start",
                    borderColor: selected.status === status ? "#315fe9" : "#dce2ea",
                    background: selected.status === status ? "#eef3ff" : "#fff",
                  }}
                  onClick={() => changeStatus(selected.id, status)}
                >
                  {selected.status === status ? <CheckCircle2 size={15} /> : <ClipboardCheck size={15} />}
                  {status}
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
