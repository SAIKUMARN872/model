
"use client";

import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import {
  ShieldCheck,
  ClipboardCheck,
  AlertTriangle,
  FileCheck2,
  Search,
  Filter,
  RefreshCw,
  X,
  Eye,
  CheckCircle2,
  Clock3,
  FileText,
  CalendarDays,
  LockKeyhole,
  ChevronRight,
  Download,
  Plus,
  Scale,
  Building2,
  Database,
  Activity,
} from "lucide-react";

type FrameworkStatus = "Compliant" | "In Progress" | "Review Required";

type ComplianceFramework = {
  id: string;
  name: string;
  description: string;
  status: FrameworkStatus;
  coverage: number;
  lastReview: string;
  owner: string;
  controls: number;
  verified: number;
  category: string;
  nextReview: string;
};

type FindingStatus = "Open" | "In Progress" | "Resolved";
type FindingPriority = "Critical" | "High" | "Medium" | "Low";

type Finding = {
  id: string;
  title: string;
  framework: string;
  priority: FindingPriority;
  status: FindingStatus;
  owner: string;
  dueDate: string;
};

type Evidence = {
  id: string;
  name: string;
  framework: string;
  type: string;
  status: "Verified" | "Pending Review" | "Missing";
  updated: string;
};

type ReviewTask = {
  id: string;
  title: string;
  framework: string;
  dueDate: string;
  status: "Upcoming" | "In Progress" | "Completed";
};

const initialFrameworks: ComplianceFramework[] = [
  {
    id: "FW-001",
    name: "SOC 2 Type II",
    description: "Security, availability, confidentiality, processing integrity, and privacy controls.",
    status: "Compliant",
    coverage: 100,
    lastReview: "July 20, 2026",
    owner: "Security Team",
    controls: 64,
    verified: 64,
    category: "Security",
    nextReview: "December 15, 2026",
  },
  {
    id: "FW-002",
    name: "ISO 27001",
    description: "Information security management systems and risk-based security controls.",
    status: "Compliant",
    coverage: 98,
    lastReview: "July 18, 2026",
    owner: "Compliance Team",
    controls: 93,
    verified: 91,
    category: "Security",
    nextReview: "December 10, 2026",
  },
  {
    id: "FW-003",
    name: "GDPR",
    description: "Personal data protection, privacy rights, and data processing obligations.",
    status: "Compliant",
    coverage: 99,
    lastReview: "July 15, 2026",
    owner: "Privacy Team",
    controls: 42,
    verified: 41,
    category: "Privacy",
    nextReview: "November 30, 2026",
  },
  {
    id: "FW-004",
    name: "HIPAA",
    description: "Safeguards for protected health information where applicable.",
    status: "Review Required",
    coverage: 94,
    lastReview: "July 12, 2026",
    owner: "Compliance Team",
    controls: 38,
    verified: 36,
    category: "Privacy",
    nextReview: "November 20, 2026",
  },
  {
    id: "FW-005",
    name: "PCI DSS",
    description: "Payment card data security requirements where applicable.",
    status: "In Progress",
    coverage: 87,
    lastReview: "July 10, 2026",
    owner: "Platform Team",
    controls: 35,
    verified: 30,
    category: "Payments",
    nextReview: "November 25, 2026",
  },
];

const initialFindings: Finding[] = [
  {
    id: "FND-1001",
    title: "Evidence review is pending",
    framework: "ISO 27001",
    priority: "High",
    status: "Open",
    owner: "Compliance Team",
    dueDate: "November 10, 2026",
  },
  {
    id: "FND-1002",
    title: "Privacy retention review",
    framework: "GDPR",
    priority: "Medium",
    status: "In Progress",
    owner: "Privacy Team",
    dueDate: "November 12, 2026",
  },
  {
    id: "FND-1003",
    title: "Payment control evidence gap",
    framework: "PCI DSS",
    priority: "Critical",
    status: "Open",
    owner: "Platform Team",
    dueDate: "November 8, 2026",
  },
  {
    id: "FND-1004",
    title: "Access review documentation",
    framework: "SOC 2 Type II",
    priority: "Low",
    status: "Resolved",
    owner: "Security Team",
    dueDate: "October 20, 2026",
  },
  {
    id: "FND-1005",
    title: "Review health-data safeguards",
    framework: "HIPAA",
    priority: "High",
    status: "In Progress",
    owner: "Compliance Team",
    dueDate: "November 15, 2026",
  },
];

const initialEvidence: Evidence[] = [
  {
    id: "EVD-2001",
    name: "Access Control Review",
    framework: "SOC 2 Type II",
    type: "Review Record",
    status: "Verified",
    updated: "October 28, 2026",
  },
  {
    id: "EVD-2002",
    name: "Security Risk Assessment",
    framework: "ISO 27001",
    type: "Assessment",
    status: "Pending Review",
    updated: "October 27, 2026",
  },
  {
    id: "EVD-2003",
    name: "Data Processing Inventory",
    framework: "GDPR",
    type: "Inventory",
    status: "Verified",
    updated: "October 25, 2026",
  },
  {
    id: "EVD-2004",
    name: "Payment Security Evidence",
    framework: "PCI DSS",
    type: "Evidence Record",
    status: "Missing",
    updated: "Not submitted",
  },
  {
    id: "EVD-2005",
    name: "Health Data Safeguards",
    framework: "HIPAA",
    type: "Control Record",
    status: "Pending Review",
    updated: "October 22, 2026",
  },
];

const initialTasks: ReviewTask[] = [
  {
    id: "TSK-3001",
    title: "Review ISO control evidence",
    framework: "ISO 27001",
    dueDate: "November 10, 2026",
    status: "In Progress",
  },
  {
    id: "TSK-3002",
    title: "Review payment controls",
    framework: "PCI DSS",
    dueDate: "November 12, 2026",
    status: "Upcoming",
  },
  {
    id: "TSK-3003",
    title: "Validate privacy inventory",
    framework: "GDPR",
    dueDate: "November 15, 2026",
    status: "Upcoming",
  },
  {
    id: "TSK-3004",
    title: "Review privileged access",
    framework: "SOC 2 Type II",
    dueDate: "October 25, 2026",
    status: "Completed",
  },
];

const statusColors: Record<string, { color: string; bg: string }> = {
  Compliant: { color: "#047857", bg: "#d1fae5" },
  "In Progress": { color: "#1d4ed8", bg: "#dbeafe" },
  "Review Required": { color: "#b45309", bg: "#fef3c7" },
  Open: { color: "#b91c1c", bg: "#fee2e2" },
  Resolved: { color: "#047857", bg: "#d1fae5" },
  "Pending Review": { color: "#a16207", bg: "#fef3c7" },
  Verified: { color: "#047857", bg: "#d1fae5" },
  Missing: { color: "#b91c1c", bg: "#fee2e2" },
  Upcoming: { color: "#64748b", bg: "#f1f5f9" },
  Completed: { color: "#047857", bg: "#d1fae5" },
  Critical: { color: "#b91c1c", bg: "#fee2e2" },
  High: { color: "#c2410c", bg: "#ffedd5" },
  Medium: { color: "#a16207", bg: "#fef3c7" },
  Low: { color: "#047857", bg: "#d1fae5" },
};

const base: CSSProperties = {
  color: "#172033",
  fontFamily: "inherit",
  fontSize: 14,
};

const card: CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e5eaf1",
  borderRadius: 12,
  padding: 20,
};

const muted: CSSProperties = {
  color: "#64748b",
  fontSize: 12,
  lineHeight: 1.6,
};

const buttonStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  padding: "9px 12px",
  borderRadius: 8,
  border: "1px solid #dbe2ea",
  background: "#ffffff",
  color: "#334155",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 650,
};

const inputStyle: CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  padding: "10px 12px",
  border: "1px solid #dbe2ea",
  borderRadius: 8,
  outlineColor: "#315fea",
  background: "#ffffff",
  color: "#172033",
  fontSize: 12,
};

function Badge({ value }: { value: string }) {
  const colors = statusColors[value] ?? {
    color: "#475569",
    bg: "#f1f5f9",
  };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 6,
        padding: "4px 8px",
        background: colors.bg,
        color: colors.color,
        fontSize: 11,
        fontWeight: 750,
        whiteSpace: "nowrap",
      }}
    >
      {value}
    </span>
  );
}

function SectionTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
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
        <h2 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>{title}</h2>
        {description && (
          <p style={{ ...muted, margin: "5px 0 0" }}>{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div
      style={{
        height: 7,
        borderRadius: 20,
        background: "#e9eef5",
        overflow: "hidden",
        minWidth: 85,
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${Math.min(100, Math.max(0, value))}%`,
          borderRadius: 20,
          background: value >= 95 ? "#059669" : value >= 85 ? "#315fea" : "#d97706",
          transition: "width 180ms ease",
        }}
      />
    </div>
  );
}

export default function CompliancePage() {
  const [frameworks, setFrameworks] = useState(initialFrameworks);
  const [findings, setFindings] = useState(initialFindings);
  const [evidence, setEvidence] = useState(initialEvidence);
  const [tasks, setTasks] = useState(initialTasks);

  const [activeTab, setActiveTab] = useState("Overview");
  const [query, setQuery] = useState("");
  const [frameworkFilter, setFrameworkFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedFramework, setSelectedFramework] =
    useState<ComplianceFramework | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [notice, setNotice] = useState("");

  const [newFrameworkName, setNewFrameworkName] = useState("");
  const [newFrameworkCategory, setNewFrameworkCategory] = useState("Security");
  const [newFrameworkOwner, setNewFrameworkOwner] = useState("Compliance Team");

  const [newFindingTitle, setNewFindingTitle] = useState("");
  const [newFindingFramework, setNewFindingFramework] = useState("SOC 2 Type II");
  const [newFindingPriority, setNewFindingPriority] =
    useState<FindingPriority>("Medium");

  const [newEvidenceName, setNewEvidenceName] = useState("");
  const [newEvidenceFramework, setNewEvidenceFramework] = useState("SOC 2 Type II");

  const activeFindings = findings.filter((item) => item.status !== "Resolved").length;
  const criticalFindings = findings.filter(
    (item) => item.priority === "Critical" && item.status !== "Resolved"
  ).length;
  const verifiedEvidence = evidence.filter((item) => item.status === "Verified").length;
  const enabledFrameworks = frameworks.filter(
    (item) => item.status === "Compliant"
  ).length;

  const averageCoverage = frameworks.length
    ? (
        frameworks.reduce((sum, item) => sum + item.coverage, 0) /
        frameworks.length
      ).toFixed(1)
    : "0.0";

  const filteredFrameworks = useMemo(() => {
    const term = query.trim().toLowerCase();

    return frameworks.filter((framework) => {
      const matchesQuery =
        !term ||
        [
          framework.name,
          framework.owner,
          framework.category,
          framework.description,
        ].some((value) => value.toLowerCase().includes(term));

      const matchesStatus =
        statusFilter === "All" || framework.status === statusFilter;

      return matchesQuery && matchesStatus;
    });
  }, [frameworks, query, statusFilter]);

  const filteredFindings = useMemo(() => {
    const term = query.trim().toLowerCase();

    return findings.filter((finding) => {
      const matchesQuery =
        !term ||
        [
          finding.id,
          finding.title,
          finding.framework,
          finding.owner,
        ].some((value) => value.toLowerCase().includes(term));

      const matchesFramework =
        frameworkFilter === "All" || finding.framework === frameworkFilter;

      const matchesStatus =
        statusFilter === "All" || finding.status === statusFilter;

      return matchesQuery && matchesFramework && matchesStatus;
    });
  }, [findings, query, frameworkFilter, statusFilter]);

  function updateFrameworkStatus(id: string, status: FrameworkStatus) {
    setFrameworks((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item))
    );

    setSelectedFramework((current) =>
      current && current.id === id ? { ...current, status } : current
    );

    setNotice(`${id} updated to ${status}. Demo state only.`);
  }

  function updateFindingStatus(id: string, status: FindingStatus) {
    setFindings((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item))
    );
    setNotice(`${id} updated to ${status}. Demo state only.`);
  }

  function updateEvidenceStatus(id: string, status: Evidence["status"]) {
    setEvidence((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item))
    );
    setNotice(`${id} updated to ${status}. Demo state only.`);
  }

  function updateTaskStatus(id: string, status: ReviewTask["status"]) {
    setTasks((current) =>
      current.map((item) => (item.id === id ? { ...item, status } : item))
    );
    setNotice(`${id} updated to ${status}. Demo state only.`);
  }

  function createFramework(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = newFrameworkName.trim();

    if (!name) {
      setNotice("Enter a framework name.");
      return;
    }

    if (
      frameworks.some(
        (framework) => framework.name.toLowerCase() === name.toLowerCase()
      )
    ) {
      setNotice("A framework with that name already exists.");
      return;
    }

    const created: ComplianceFramework = {
      id: `FW-${String(Date.now()).slice(-6)}`,
      name,
      description: "Custom framework record. Configure real requirements before use.",
      status: "In Progress",
      coverage: 0,
      lastReview: "Not reviewed",
      owner: newFrameworkOwner,
      controls: 0,
      verified: 0,
      category: newFrameworkCategory,
      nextReview: "Not scheduled",
    };

    setFrameworks((current) => [...current, created]);
    setNewFrameworkName("");
    setShowCreateForm(false);
    setActiveTab("Frameworks");
    setNotice(`${name} created as a demo record. No certification is implied.`);
  }

  function createFinding(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const title = newFindingTitle.trim();

    if (!title) {
      setNotice("Enter a finding title.");
      return;
    }

    const created: Finding = {
      id: `FND-${String(Date.now()).slice(-6)}`,
      title,
      framework: newFindingFramework,
      priority: newFindingPriority,
      status: "Open",
      owner: "Unassigned",
      dueDate: "Not scheduled",
    };

    setFindings((current) => [created, ...current]);
    setNewFindingTitle("");
    setActiveTab("Findings");
    setNotice("Finding created in local demo data.");
  }

  function createEvidence(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const name = newEvidenceName.trim();

    if (!name) {
      setNotice("Enter an evidence record name.");
      return;
    }

    const created: Evidence = {
      id: `EVD-${String(Date.now()).slice(-6)}`,
      name,
      framework: newEvidenceFramework,
      type: "Evidence Record",
      status: "Pending Review",
      updated: "November 2, 2026",
    };

    setEvidence((current) => [created, ...current]);
    setNewEvidenceName("");
    setActiveTab("Evidence");
    setNotice("Evidence record created. No file has been uploaded.");
  }

  function resetDemo() {
    setFrameworks(initialFrameworks);
    setFindings(initialFindings);
    setEvidence(initialEvidence);
    setTasks(initialTasks);
    setQuery("");
    setFrameworkFilter("All");
    setStatusFilter("All");
    setSelectedFramework(null);
    setShowCreateForm(false);
    setNotice("Compliance demo data has been reset.");
  }

  const metrics = [
    {
      title: "Average Framework Coverage",
      value: `${averageCoverage}%`,
      description: "Average across displayed demo frameworks",
      icon: ShieldCheck,
      color: "#047857",
      bg: "#d1fae5",
    },
    {
      title: "Active Frameworks",
      value: String(frameworks.length),
      description: `${enabledFrameworks} marked compliant in demo data`,
      icon: Scale,
      color: "#315fea",
      bg: "#e0eaff",
    },
    {
      title: "Open Findings",
      value: String(activeFindings),
      description: `${criticalFindings} critical unresolved finding(s)`,
      icon: AlertTriangle,
      color: "#b45309",
      bg: "#fef3c7",
    },
    {
      title: "Verified Evidence",
      value: `${verifiedEvidence}/${evidence.length}`,
      description: "Evidence records marked verified",
      icon: FileCheck2,
      color: "#7c3aed",
      bg: "#ede9fe",
    },
  ];

  const tabs = [
    "Overview",
    "Frameworks",
    "Findings",
    "Evidence",
    "Reviews",
  ];

  return (
    <main style={{ ...base, maxWidth: 1600, margin: "0 auto", padding: "28px 24px 40px" }}>
      <header
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 18,
          marginBottom: 25,
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div
              style={{
                width: 43,
                height: 43,
                display: "grid",
                placeItems: "center",
                borderRadius: 12,
                background: "#e0eaff",
                color: "#315fea",
              }}
            >
              <ClipboardCheck size={23} />
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: 27, fontWeight: 850, letterSpacing: "-0.7px" }}>
                Compliance Center
              </h1>
              <p style={{ ...muted, margin: "5px 0 0", fontSize: 13 }}>
                ModelNow Admin Console / Compliance
              </p>
            </div>
          </div>
          <p style={{ color: "#64748b", lineHeight: 1.7, maxWidth: 760, marginTop: 15 }}>
            Track compliance frameworks, control evidence, remediation findings,
            privacy reviews, and audit-readiness activities across ModelNow.
          </p>
        </div>

        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <button style={buttonStyle} onClick={resetDemo}>
            <RefreshCw size={14} />
            Reset demo
          </button>
          <button
            style={{ ...buttonStyle, background: "#315fea", borderColor: "#315fea", color: "#ffffff" }}
            onClick={() => setShowCreateForm(true)}
          >
            <Plus size={15} />
            Add record
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
            gap: 12,
            padding: "11px 14px",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            color: "#1d4ed8",
            borderRadius: 9,
            marginBottom: 18,
            fontSize: 12,
          }}
        >
          <span>{notice}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
            style={{ ...buttonStyle, border: 0, padding: 3, background: "transparent" }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 6,
          flexWrap: "wrap",
          borderBottom: "1px solid #e5eaf1",
          marginBottom: 24,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              setQuery("");
              setStatusFilter("All");
              setFrameworkFilter("All");
            }}
            style={{
              padding: "11px 15px",
              background: "transparent",
              border: 0,
              borderBottom: activeTab === tab ? "2px solid #315fea" : "2px solid transparent",
              color: activeTab === tab ? "#315fea" : "#64748b",
              fontWeight: activeTab === tab ? 750 : 550,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(215px, 1fr))",
              gap: 15,
              marginBottom: 25,
            }}
          >
            {metrics.map((metric) => {
              const Icon = metric.icon;

              return (
                <article key={metric.title} style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 }}>
                    <span style={{ color: "#64748b", fontSize: 12, fontWeight: 650 }}>
                      {metric.title}
                    </span>
                    <span style={{ display: "grid", placeItems: "center", width: 36, height: 36, background: metric.bg, color: metric.color, borderRadius: 10 }}>
                      <Icon size={19} />
                    </span>
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 850, marginTop: 15 }}>
                    {metric.value}
                  </div>
                  <p style={{ ...muted, margin: "5px 0 0" }}>{metric.description}</p>
                </article>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: 18, marginBottom: 25 }}>
            <section style={card}>
              <SectionTitle
                title="Framework coverage"
                description="Illustrative coverage by framework"
                action={
                  <button style={buttonStyle} onClick={() => setActiveTab("Frameworks")}>
                    View all <ChevronRight size={14} />
                  </button>
                }
              />
              <div style={{ display: "grid", gap: 19 }}>
                {frameworks.slice(0, 5).map((framework) => (
                  <div key={framework.id}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 12, fontWeight: 700 }}>{framework.name}</span>
                      <span style={{ fontSize: 12, fontWeight: 750 }}>{framework.coverage}%</span>
                    </div>
                    <ProgressBar value={framework.coverage} />
                  </div>
                ))}
              </div>
            </section>

            <section style={card}>
              <SectionTitle
                title="Attention required"
                description="Items that may need further review"
              />
              {[
                {
                  title: "Critical findings",
                  value: String(criticalFindings),
                  description: "Unresolved critical-priority demo findings",
                  icon: AlertTriangle,
                  color: "#b91c1c",
                  bg: "#fee2e2",
                  tab: "Findings",
                },
                {
                  title: "Evidence pending review",
                  value: String(evidence.filter((item) => item.status === "Pending Review").length),
                  description: "Evidence records awaiting review",
                  icon: FileText,
                  color: "#a16207",
                  bg: "#fef3c7",
                  tab: "Evidence",
                },
                {
                  title: "Frameworks needing review",
                  value: String(frameworks.filter((item) => item.status === "Review Required").length),
                  description: "Framework records flagged for review",
                  icon: Clock3,
                  color: "#315fea",
                  bg: "#e0eaff",
                  tab: "Frameworks",
                },
              ].map((item) => {
                const Icon = item.icon;

                return (
                  <button
                    key={item.title}
                    onClick={() => setActiveTab(item.tab)}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "13px 0",
                      border: 0,
                      borderBottom: "1px solid #edf0f5",
                      background: "transparent",
                      textAlign: "left",
                      cursor: "pointer",
                      color: "#172033",
                    }}
                  >
                    <span style={{ display: "grid", placeItems: "center", padding: 9, borderRadius: 9, background: item.bg, color: item.color }}>
                      <Icon size={18} />
                    </span>
                    <span style={{ flex: 1 }}>
                      <span style={{ display: "block", fontWeight: 750, fontSize: 12 }}>{item.title}</span>
                      <span style={{ ...muted, display: "block" }}>{item.description}</span>
                    </span>
                    <strong style={{ fontSize: 20 }}>{item.value}</strong>
                    <ChevronRight size={15} color="#94a3b8" />
                  </button>
                );
              })}
              <div style={{ ...muted, marginTop: 15 }}>
                These counts are calculated from the sample records on this page.
              </div>
            </section>
          </div>

          <section style={{ ...card, marginBottom: 25 }}>
            <SectionTitle
              title="Upcoming review tasks"
              description="Review schedule from demo data"
              action={
                <button style={buttonStyle} onClick={() => setActiveTab("Reviews")}>
                  All reviews <ChevronRight size={14} />
                </button>
              }
            />
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: 600 }}>
                <thead>
                  <tr style={{ background: "#f8fafc", color: "#64748b" }}>
                    {["Task", "Framework", "Due date", "Status"].map((heading) => (
                      <th key={heading} style={{ padding: "12px 10px", fontSize: 11, borderBottom: "1px solid #e5eaf1" }}>
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {tasks.slice(0, 4).map((task) => (
                    <tr key={task.id}>
                      <td style={{ padding: "13px 10px", borderBottom: "1px solid #edf0f5", fontSize: 12, fontWeight: 700 }}>
                        {task.title}
                      </td>
                      <td style={{ padding: "13px 10px", borderBottom: "1px solid #edf0f5", fontSize: 12 }}>
                        {task.framework}
                      </td>
                      <td style={{ padding: "13px 10px", borderBottom: "1px solid #edf0f5", fontSize: 12 }}>
                        {task.dueDate}
                      </td>
                      <td style={{ padding: "13px 10px", borderBottom: "1px solid #edf0f5" }}>
                        <Badge value={task.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      {activeTab === "Frameworks" && (
        <section style={{ ...card, marginBottom: 25 }}>
          <SectionTitle
            title="Compliance frameworks"
            description="Review framework records and their illustrative control coverage."
            action={
              <button style={buttonStyle} onClick={() => setShowCreateForm(true)}>
                <Plus size={14} /> Add framework
              </button>
            }
          />
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}>
            <div style={{ flex: "1 1 240px" }}>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search frameworks or owners..."
                style={inputStyle}
              />
            </div>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 160 }}>
              {["All", "Compliant", "In Progress", "Review Required"].map((value) => (
                <option key={value} value={value}>{value === "All" ? "All statuses" : value}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px, 1fr))", gap: 14 }}>
            {filteredFrameworks.map((framework) => (
              <article key={framework.id} style={{ border: "1px solid #e5eaf1", borderRadius: 11, padding: 17 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                  <span style={{ display: "grid", placeItems: "center", width: 38, height: 38, background: "#eff6ff", color: "#315fea", borderRadius: 10 }}>
                    <Scale size={20} />
                  </span>
                  <Badge value={framework.status} />
                </div>
                <h3 style={{ fontSize: 15, margin: "14px 0 6px" }}>{framework.name}</h3>
                <p style={{ ...muted, minHeight: 56, margin: 0 }}>{framework.description}</p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, margin: "16px 0 8px" }}>
                  <span style={{ color: "#64748b" }}>Control coverage</span>
                  <strong>{framework.coverage}%</strong>
                </div>
                <ProgressBar value={framework.coverage} />
                <div style={{ ...muted, display: "flex", justifyContent: "space-between", marginTop: 13, gap: 10 }}>
                  <span>{framework.verified}/{framework.controls} controls</span>
                  <span>{framework.category}</span>
                </div>
                <button
                  onClick={() => setSelectedFramework(framework)}
                  style={{ ...buttonStyle, width: "100%", marginTop: 16 }}
                >
                  View details <ChevronRight size={14} />
                </button>
              </article>
            ))}
          </div>

          {filteredFrameworks.length === 0 && (
            <p style={{ ...muted, textAlign: "center", padding: 25 }}>No frameworks match your filters.</p>
          )}
        </section>
      )}

      {activeTab === "Findings" && (
        <section style={{ ...card, marginBottom: 25 }}>
          <SectionTitle
            title="Compliance findings"
            description="Track gaps and remediation status."
          />
          <form onSubmit={createFinding} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 10, padding: 15, background: "#f8fafc", borderRadius: 10, marginBottom: 18 }}>
            <input value={newFindingTitle} onChange={(event) => setNewFindingTitle(event.target.value)} placeholder="Finding title" style={inputStyle} required />
            <select value={newFindingFramework} onChange={(event) => setNewFindingFramework(event.target.value)} style={inputStyle}>
              {frameworks.map((framework) => <option key={framework.id} value={framework.name}>{framework.name}</option>)}
            </select>
            <select value={newFindingPriority} onChange={(event) => setNewFindingPriority(event.target.value as FindingPriority)} style={inputStyle}>
              {["Critical", "High", "Medium", "Low"].map((priority) => <option key={priority} value={priority}>{priority} priority</option>)}
            </select>
            <button type="submit" style={{ ...buttonStyle, background: "#315fea", color: "#fff", borderColor: "#315fea" }}>
              <Plus size={14} /> Add finding
            </button>
          </form>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 15 }}>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search findings..." style={{ ...inputStyle, flex: "1 1 220px" }} />
            <select value={frameworkFilter} onChange={(event) => setFrameworkFilter(event.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 170 }}>
              <option value="All">All frameworks</option>
              {frameworks.map((framework) => <option key={framework.id} value={framework.name}>{framework.name}</option>)}
            </select>
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} style={{ ...inputStyle, width: "auto", minWidth: 140 }}>
              {["All", "Open", "In Progress", "Resolved"].map((value) => <option key={value} value={value}>{value === "All" ? "All statuses" : value}</option>)}
            </select>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: 800 }}>
              <thead>
                <tr style={{ background: "#f8fafc", color: "#64748b" }}>
                  {["Finding", "Framework", "Priority", "Owner", "Due date", "Status"].map((heading) => (
                    <th key={heading} style={{ padding: "12px 10px", fontSize: 11, borderBottom: "1px solid #e5eaf1" }}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredFindings.map((finding) => (
                  <tr key={finding.id}>
                    <td style={{ padding: "13px 10px", borderBottom: "1px solid #edf0f5" }}>
                      <div style={{ fontSize: 12, fontWeight: 750 }}>{finding.title}</div>
                      <div style={muted}>{finding.id}</div>
                    </td>
                    <td style={{ padding: "13px 10px", borderBottom: "1px solid #edf0f5", fontSize: 12 }}>{finding.framework}</td>
                    <td style={{ padding: "13px 10px", borderBottom: "1px solid #edf0f5" }}><Badge value={finding.priority} /></td>
                    <td style={{ padding: "13px 10px", borderBottom: "1px solid #edf0f5", fontSize: 12 }}>{finding.owner}</td>
                    <td style={{ padding: "13px 10px", borderBottom: "1px solid #edf0f5", fontSize: 12 }}>{finding.dueDate}</td>
                    <td style={{ padding: "13px 10px", borderBottom: "1px solid #edf0f5" }}>
                      <select
                        value={finding.status}
                        onChange={(event) => updateFindingStatus(finding.id, event.target.value as FindingStatus)}
                        aria-label={`Update ${finding.id} status`}
                        style={{ ...inputStyle, minWidth: 125 }}
                      >
                        {["Open", "In Progress", "Resolved"].map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredFindings.length === 0 && <p style={{ ...muted, textAlign: "center", padding: 20 }}>No findings match the current filters.</p>}
        </section>
      )}

      {activeTab === "Evidence" && (
        <section style={{ ...card, marginBottom: 25 }}>
          <SectionTitle
            title="Evidence management"
            description="Track evidence records and their review state. Actual document uploads are not connected."
          />
          <form onSubmit={createEvidence} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, padding: 15, background: "#f8fafc", borderRadius: 10, marginBottom: 18 }}>
            <input value={newEvidenceName} onChange={(event) => setNewEvidenceName(event.target.value)} placeholder="Evidence record name" style={inputStyle} required />
            <select value={newEvidenceFramework} onChange={(event) => setNewEvidenceFramework(event.target.value)} style={inputStyle}>
              {frameworks.map((framework) => <option key={framework.id} value={framework.name}>{framework.name}</option>)}
            </select>
            <button type="submit" style={{ ...buttonStyle, background: "#315fea", color: "#fff", borderColor: "#315fea" }}>
              <Plus size={14} /> Add evidence record
            </button>
          </form>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", minWidth: 700 }}>
              <thead>
                <tr style={{ background: "#f8fafc", color: "#64748b" }}>
                  {["Evidence record", "Framework", "Type", "Last updated", "Status", "Action"].map((heading) => (
                    <th key={heading} style={{ padding: "12px 10px", fontSize: 11, borderBottom: "1px solid #e5eaf1" }}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {evidence.map((item) => (
                  <tr key={item.id}>
                    <td style={{ padding: "14px 10px", borderBottom: "1px solid #edf0f5" }}>
                      <div style={{ display: "flex", gap: 9, alignItems: "center" }}>
                        <span style={{ color: "#315fea" }}><FileText size={18} /></span>
                        <span>
                          <span style={{ display: "block", fontWeight: 750, fontSize: 12 }}>{item.name}</span>
                          <span style={muted}>{item.id}</span>
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 10px", borderBottom: "1px solid #edf0f5", fontSize: 12 }}>{item.framework}</td>
                    <td style={{ padding: "14px 10px", borderBottom: "1px solid #edf0f5", fontSize: 12 }}>{item.type}</td>
                    <td style={{ padding: "14px 10px", borderBottom: "1px solid #edf0f5", fontSize: 12 }}>{item.updated}</td>
                    <td style={{ padding: "14px 10px", borderBottom: "1px solid #edf0f5" }}><Badge value={item.status} /></td>
                    <td style={{ padding: "14px 10px", borderBottom: "1px solid #edf0f5" }}>
                      <select
                        value={item.status}
                        onChange={(event) => updateEvidenceStatus(item.id, event.target.value as Evidence["status"])}
                        aria-label={`Update ${item.id} status`}
                        style={{ ...inputStyle, minWidth: 145 }}
                      >
                        {["Verified", "Pending Review", "Missing"].map((status) => <option key={status} value={status}>{status}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div style={{ padding: 13, marginTop: 15, borderRadius: 9, background: "#eff6ff", color: "#1d4ed8", fontSize: 12 }}>
            Evidence records are metadata only. Uploading, storing, validating, and securely accessing evidence files require backend integration.
          </div>
        </section>
      )}

      {activeTab === "Reviews" && (
        <section style={{ ...card, marginBottom: 25 }}>
          <SectionTitle
            title="Audit readiness & reviews"
            description="Track review tasks and update their demo status."
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))", gap: 13, marginBottom: 20 }}>
            {[
              { title: "Upcoming", value: tasks.filter((task) => task.status === "Upcoming").length, icon: CalendarDays },
              { title: "In progress", value: tasks.filter((task) => task.status === "In Progress").length, icon: Activity },
              { title: "Completed", value: tasks.filter((task) => task.status === "Completed").length, icon: CheckCircle2 },
            ].map((item) => {
              const Icon = item.icon;

              return (
                <div key={item.title} style={{ padding: 16, border: "1px solid #e5eaf1", borderRadius: 10 }}>
                  <Icon size={19} color="#315fea" />
                  <div style={{ ...muted, marginTop: 10 }}>{item.title}</div>
                  <div style={{ fontSize: 25, fontWeight: 800, marginTop: 4 }}>{item.value}</div>
                </div>
              );
            })}
          </div>

          <div style={{ display: "grid", gap: 12 }}>
            {tasks.map((task) => (
              <article key={task.id} style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 13, padding: 15, border: "1px solid #e5eaf1", borderRadius: 10 }}>
                <span style={{ display: "grid", placeItems: "center", background: "#eff6ff", color: "#315fea", padding: 10, borderRadius: 9 }}>
                  <CalendarDays size={19} />
                </span>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 13, fontWeight: 750 }}>{task.title}</div>
                  <div style={{ ...muted, marginTop: 4 }}>{task.framework} · Due {task.dueDate}</div>
                  <div style={{ ...muted, marginTop: 3 }}>{task.id}</div>
                </div>
                <Badge value={task.status} />
                <select
                  value={task.status}
                  onChange={(event) => updateTaskStatus(task.id, event.target.value as ReviewTask["status"])}
                  aria-label={`Update ${task.id} status`}
                  style={{ ...inputStyle, width: "auto", minWidth: 145 }}
                >
                  {["Upcoming", "In Progress", "Completed"].map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </article>
            ))}
          </div>
        </section>
      )}

      <section style={{ marginBottom: 24 }}>
        <SectionTitle
          title="Compliance capabilities"
          description="Areas that can be connected to ModelNow services."
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(215px, 1fr))", gap: 13 }}>
          {[
            { icon: Scale, title: "Framework monitoring", text: "Track applicable regulatory and security frameworks." },
            { icon: ShieldCheck, title: "Control management", text: "Map requirements to controls and verification records." },
            { icon: FileCheck2, title: "Evidence collection", text: "Maintain traceable evidence metadata and review history." },
            { icon: AlertTriangle, title: "Risk remediation", text: "Assign findings, priorities, and remediation status." },
            { icon: LockKeyhole, title: "Privacy governance", text: "Track privacy-related reviews and obligations." },
            { icon: Building2, title: "Third-party risk", text: "Plan supplier reviews and track associated risks." },
            { icon: Database, title: "Data governance", text: "Connect data inventories, retention policies, and access reviews." },
            { icon: Activity, title: "Continuous monitoring", text: "Integrate verified control signals from production services." },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <article key={item.title} style={{ ...card, padding: 16 }}>
                <span style={{ display: "inline-grid", placeItems: "center", padding: 9, background: "#eff6ff", color: "#315fea", borderRadius: 9 }}>
                  <Icon size={19} />
                </span>
                <h3 style={{ margin: "12px 0 6px", fontSize: 13, fontWeight: 750 }}>{item.title}</h3>
                <p style={{ ...muted, margin: 0 }}>{item.text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <div style={{ ...muted, padding: 14, background: "#f8fafc", borderRadius: 9 }}>
        <strong style={{ color: "#475569" }}>Important:</strong>{" "}
        This page uses sample records and local frontend state. Framework coverage does not establish certification or legal compliance. Only display a framework as compliant after the organization has assessed the applicable requirements and has reliable supporting evidence. Real compliance status, evidence files, audit logs, and permissions require authenticated backend services.
      </div>

      {showCreateForm && (
        <div
          onClick={() => setShowCreateForm(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(15, 23, 42, 0.45)",
            display: "grid",
            placeItems: "center",
            padding: 16,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Add compliance record"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(520px, 100%)",
              background: "#ffffff",
              borderRadius: 14,
              padding: 24,
              boxSizing: "border-box",
              boxShadow: "0 20px 60px rgba(15, 23, 42, 0.18)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 19, margin: 0 }}>Add compliance record</h2>
                <p style={{ ...muted, margin: "5px 0 0" }}>Choose which type of record to create.</p>
              </div>
              <button aria-label="Close form" style={{ ...buttonStyle, padding: 7 }} onClick={() => setShowCreateForm(false)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", gap: 7, marginBottom: 18, flexWrap: "wrap" }}>
              {[
                { value: "framework", label: "Framework" },
                { value: "finding", label: "Finding" },
                { value: "evidence", label: "Evidence record" },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setNotice(`To add a ${option.label.toLowerCase()}, select its corresponding tab and use its creation form.`)}
                  style={buttonStyle}
                >
                  {option.label}
                </button>
              ))}
            </div>

            <form onSubmit={createFramework} style={{ display: "grid", gap: 15 }}>
              <label style={{ display: "grid", gap: 7, fontSize: 12, fontWeight: 700 }}>
                Framework name
                <input
                  value={newFrameworkName}
                  onChange={(event) => setNewFrameworkName(event.target.value)}
                  placeholder="Enter a framework name"
                  style={inputStyle}
                  required
                />
              </label>

              <label style={{ display: "grid", gap: 7, fontSize: 12, fontWeight: 700 }}>
                Category
                <select value={newFrameworkCategory} onChange={(event) => setNewFrameworkCategory(event.target.value)} style={inputStyle}>
                  {["Security", "Privacy", "Payments", "AI Governance", "Other"].map((category) => <option key={category} value={category}>{category}</option>)}
                </select>
              </label>

              <label style={{ display: "grid", gap: 7, fontSize: 12, fontWeight: 700 }}>
                Owner
                <select value={newFrameworkOwner} onChange={(event) => setNewFrameworkOwner(event.target.value)} style={inputStyle}>
                  {["Compliance Team", "Security Team", "Privacy Team", "Platform Team", "Unassigned"].map((owner) => <option key={owner} value={owner}>{owner}</option>)}
                </select>
              </label>

              <div style={{ padding: 12, borderRadius: 8, background: "#fff7ed", color: "#9a3412", fontSize: 12, lineHeight: 1.6 }}>
                New frameworks start with zero verified controls and In Progress status. Creating this record does not establish certification.
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 5 }}>
                <button type="button" style={buttonStyle} onClick={() => setShowCreateForm(false)}>Cancel</button>
                <button type="submit" style={{ ...buttonStyle, background: "#315fea", color: "#ffffff", borderColor: "#315fea" }}>
                  <Plus size={14} /> Create framework
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedFramework && (
        <div
          onClick={() => setSelectedFramework(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background: "rgba(15, 23, 42, 0.45)",
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
              width: "min(470px, 100%)",
              height: "100%",
              overflowY: "auto",
              background: "#ffffff",
              padding: 24,
              boxSizing: "border-box",
              boxShadow: "-10px 0 40px rgba(15,23,42,0.12)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
              <div>
                <div style={muted}>Framework details</div>
                <h2 style={{ margin: "5px 0 0", fontSize: 22 }}>{selectedFramework.name}</h2>
              </div>
              <button aria-label="Close framework details" style={{ ...buttonStyle, padding: 7 }} onClick={() => setSelectedFramework(null)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ marginTop: 20, display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Badge value={selectedFramework.status} />
              <Badge value={selectedFramework.category} />
            </div>

            <p style={{ color: "#64748b", lineHeight: 1.7, marginTop: 17 }}>
              {selectedFramework.description}
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 20 }}>
              {[
                { label: "Illustrative coverage", value: `${selectedFramework.coverage}%` },
                { label: "Verified controls", value: `${selectedFramework.verified}/${selectedFramework.controls}` },
                { label: "Owner", value: selectedFramework.owner },
                { label: "Category", value: selectedFramework.category },
                { label: "Last review", value: selectedFramework.lastReview },
                { label: "Next review", value: selectedFramework.nextReview },
              ].map((item) => (
                <div key={item.label} style={{ padding: 13, background: "#f8fafc", borderRadius: 9, minWidth: 0 }}>
                  <div style={muted}>{item.label}</div>
                  <div style={{ fontSize: 12, fontWeight: 750, marginTop: 6, overflowWrap: "anywhere" }}>{item.value}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 24 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 12 }}>
                <strong>Control coverage</strong>
                <strong>{selectedFramework.coverage}%</strong>
              </div>
              <ProgressBar value={selectedFramework.coverage} />
            </div>

            <div style={{ marginTop: 28, borderTop: "1px solid #e5eaf1", paddingTop: 20 }}>
              <h3 style={{ fontSize: 14, margin: "0 0 12px" }}>Update demo status</h3>
              <div style={{ display: "grid", gap: 9 }}>
                {(["Compliant", "In Progress", "Review Required"] as FrameworkStatus[]).map((status) => (
                  <button
                    key={status}
                    onClick={() => updateFrameworkStatus(selectedFramework.id, status)}
                    style={{
                      ...buttonStyle,
                      justifyContent: "space-between",
                      padding: 12,
                      background: selectedFramework.status === status ? "#eff6ff" : "#ffffff",
                      borderColor: selectedFramework.status === status ? "#93c5fd" : "#dbe2ea",
                    }}
                  >
                    <span>{status}</span>
                    {selectedFramework.status === status && <CheckCircle2 size={15} color="#315fea" />}
                  </button>
                ))}
              </div>
              <p style={{ ...muted, marginTop: 12 }}>
                This updates only the local demo status. It does not verify controls or grant a certification.
              </p>
            </div>
          </aside>
        </div>
      )}
    </main>
  );
}
