
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BrainCircuit,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  Clock3,
  Database,
  Eye,
  FileCheck2,
  FilePlus2,
  Filter,
  LockKeyhole,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";

type PolicyStatus = "Active" | "Under Review" | "Draft" | "Restricted";
type PolicyCategory =
  | "Security"
  | "Data Privacy"
  | "AI Governance"
  | "Compliance"
  | "Risk Management";

type GovernancePolicy = {
  id: string;
  name: string;
  category: PolicyCategory;
  owner: string;
  scope: string;
  status: PolicyStatus;
  lastUpdated: string;
  description: string;
  risk: "Low" | "Medium" | "High";
  version: string;
  controls: number;
  reviewDate: string;
  approvalRequired: boolean;
};

const initialPolicies: GovernancePolicy[] = [
  {
    id: "POL-1001",
    name: "Access Control Policy",
    category: "Security",
    owner: "Security Team",
    scope: "Organization",
    status: "Active",
    lastUpdated: "Oct 28, 2026",
    description:
      "Defines identity verification, role-based access, privileged access, and access review requirements across ModelNow.",
    risk: "High",
    version: "v2.4",
    controls: 12,
    reviewDate: "Nov 15, 2026",
    approvalRequired: true,
  },
  {
    id: "POL-1002",
    name: "Data Retention Policy",
    category: "Data Privacy",
    owner: "Compliance Team",
    scope: "Organization",
    status: "Active",
    lastUpdated: "Oct 25, 2026",
    description:
      "Defines retention periods, deletion requirements, and handling of customer data and operational records.",
    risk: "High",
    version: "v1.8",
    controls: 9,
    reviewDate: "Nov 20, 2026",
    approvalRequired: true,
  },
  {
    id: "POL-1003",
    name: "AI Model Usage Policy",
    category: "AI Governance",
    owner: "AI Governance Team",
    scope: "AI Platform",
    status: "Under Review",
    lastUpdated: "Oct 23, 2026",
    description:
      "Sets requirements for model access, approved use cases, model routing, and restrictions on sensitive prompts.",
    risk: "High",
    version: "v1.3",
    controls: 14,
    reviewDate: "Nov 5, 2026",
    approvalRequired: true,
  },
  {
    id: "POL-1004",
    name: "Third-Party Risk Policy",
    category: "Risk Management",
    owner: "Risk Management",
    scope: "Organization",
    status: "Active",
    lastUpdated: "Oct 20, 2026",
    description:
      "Establishes risk assessment and approval requirements for external AI providers, vendors, and integrations.",
    risk: "Medium",
    version: "v1.5",
    controls: 8,
    reviewDate: "Nov 25, 2026",
    approvalRequired: true,
  },
  {
    id: "POL-1005",
    name: "Responsible AI Policy",
    category: "AI Governance",
    owner: "AI Governance Team",
    scope: "AI Platform",
    status: "Draft",
    lastUpdated: "Oct 18, 2026",
    description:
      "Defines expectations for fairness, transparency, human oversight, and responsible AI system deployment.",
    risk: "High",
    version: "v0.9",
    controls: 11,
    reviewDate: "Nov 10, 2026",
    approvalRequired: true,
  },
  {
    id: "POL-1006",
    name: "Audit Logging Standard",
    category: "Compliance",
    owner: "Security Team",
    scope: "Workspace",
    status: "Active",
    lastUpdated: "Oct 16, 2026",
    description:
      "Specifies audit event collection, access to logs, evidence retention, and review of administrative actions.",
    risk: "Medium",
    version: "v2.1",
    controls: 10,
    reviewDate: "Dec 1, 2026",
    approvalRequired: false,
  },
  {
    id: "POL-1007",
    name: "Sensitive Data Handling",
    category: "Data Privacy",
    owner: "Data Governance",
    scope: "AI Platform",
    status: "Under Review",
    lastUpdated: "Oct 12, 2026",
    description:
      "Defines how sensitive data is identified, protected, processed, and shared with approved services.",
    risk: "High",
    version: "v1.1",
    controls: 13,
    reviewDate: "Nov 7, 2026",
    approvalRequired: true,
  },
  {
    id: "POL-1008",
    name: "Workspace Administration",
    category: "Security",
    owner: "Platform Team",
    scope: "Workspace",
    status: "Restricted",
    lastUpdated: "Oct 8, 2026",
    description:
      "Controls workspace-level administration, delegated privileges, and administrative change approvals.",
    risk: "Medium",
    version: "v1.2",
    controls: 7,
    reviewDate: "Nov 30, 2026",
    approvalRequired: false,
  },
];

const categoryOptions: PolicyCategory[] = [
  "Security",
  "Data Privacy",
  "AI Governance",
  "Compliance",
  "Risk Management",
];

const statusOptions: PolicyStatus[] = [
  "Active",
  "Under Review",
  "Draft",
  "Restricted",
];

const owners = [
  "Security Team",
  "Compliance Team",
  "AI Governance Team",
  "Risk Management",
  "Data Governance",
  "Platform Team",
];

const scopes = ["Organization", "AI Platform", "Workspace"];

const palette = {
  blue: "#315FEA",
  blueLight: "#EEF3FF",
  green: "#16845B",
  greenLight: "#E8F7EF",
  orange: "#B96A12",
  orangeLight: "#FFF4E5",
  red: "#C33D46",
  redLight: "#FDECEE",
  purple: "#7555C7",
  purpleLight: "#F2EDFF",
  text: "#172033",
  muted: "#6B7280",
  border: "#E5E7EB",
  background: "#F7F8FA",
  white: "#FFFFFF",
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    padding: "28px",
    maxWidth: "1600px",
    margin: "0 auto",
    color: palette.text,
    fontFamily: "inherit",
    background: palette.background,
    minHeight: "100%",
  },
  eyebrow: {
    display: "inline-flex",
    alignItems: "center",
    gap: "7px",
    color: palette.blue,
    fontSize: "12px",
    fontWeight: 750,
    letterSpacing: "0.07em",
    textTransform: "uppercase",
    marginBottom: "10px",
  },
  title: {
    fontSize: "29px",
    lineHeight: 1.2,
    fontWeight: 780,
    letterSpacing: "-0.8px",
    margin: 0,
  },
  subtitle: {
    color: palette.muted,
    fontSize: "14px",
    lineHeight: 1.7,
    maxWidth: "760px",
    marginTop: "10px",
    marginBottom: 0,
  },
  button: {
    border: `1px solid ${palette.border}`,
    borderRadius: "9px",
    background: palette.white,
    color: palette.text,
    padding: "10px 13px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: 650,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  primaryButton: {
    border: `1px solid ${palette.blue}`,
    borderRadius: "9px",
    background: palette.blue,
    color: "#FFFFFF",
    padding: "10px 14px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontSize: "13px",
    fontWeight: 700,
    cursor: "pointer",
    whiteSpace: "nowrap",
  },
  panel: {
    background: palette.white,
    border: `1px solid ${palette.border}`,
    borderRadius: "13px",
    overflow: "hidden",
  },
  panelHeader: {
    padding: "18px 20px",
    borderBottom: `1px solid ${palette.border}`,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    flexWrap: "wrap",
  },
  sectionTitle: {
    margin: 0,
    fontSize: "15px",
    fontWeight: 750,
    letterSpacing: "-0.2px",
  },
  sectionDescription: {
    margin: "5px 0 0",
    fontSize: "12px",
    lineHeight: 1.5,
    color: palette.muted,
  },
  field: {
    width: "100%",
    boxSizing: "border-box",
    border: `1px solid ${palette.border}`,
    borderRadius: "8px",
    padding: "10px 11px",
    background: palette.white,
    color: palette.text,
    fontSize: "13px",
    outline: "none",
  },
  fieldLabel: {
    display: "block",
    marginBottom: "7px",
    fontSize: "12px",
    fontWeight: 700,
    color: "#4B5563",
  },
};

function StatusBadge({ status }: { status: PolicyStatus }) {
  const config: Record<
    PolicyStatus,
    { background: string; color: string; dot: string }
  > = {
    Active: {
      background: palette.greenLight,
      color: palette.green,
      dot: palette.green,
    },
    "Under Review": {
      background: palette.orangeLight,
      color: palette.orange,
      dot: palette.orange,
    },
    Draft: {
      background: "#F3F4F6",
      color: "#606775",
      dot: "#8A909B",
    },
    Restricted: {
      background: palette.redLight,
      color: palette.red,
      dot: palette.red,
    },
  };

  const item = config[status];

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "5px 9px",
        borderRadius: "20px",
        background: item.background,
        color: item.color,
        fontSize: "11px",
        fontWeight: 750,
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: "6px",
          height: "6px",
          borderRadius: "50%",
          background: item.dot,
        }}
      />
      {status}
    </span>
  );
}

function RiskBadge({ risk }: { risk: GovernancePolicy["risk"] }) {
  const colors = {
    Low: { color: palette.green, background: palette.greenLight },
    Medium: { color: palette.orange, background: palette.orangeLight },
    High: { color: palette.red, background: palette.redLight },
  };
  const item = colors[risk];

  return (
    <span
      style={{
        display: "inline-flex",
        borderRadius: "6px",
        padding: "4px 7px",
        background: item.background,
        color: item.color,
        fontSize: "11px",
        fontWeight: 750,
      }}
    >
      {risk}
    </span>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
  color,
  background,
  trend,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
  color: string;
  background: string;
  trend?: string;
}) {
  return (
    <article
      style={{
        background: palette.white,
        border: `1px solid ${palette.border}`,
        borderRadius: "12px",
        padding: "18px",
        minWidth: 0,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <span style={{ fontSize: "12px", color: palette.muted, fontWeight: 650 }}>
          {title}
        </span>
        <span
          style={{
            display: "grid",
            placeItems: "center",
            width: "35px",
            height: "35px",
            borderRadius: "9px",
            color,
            background,
            flexShrink: 0,
          }}
        >
          <Icon size={18} />
        </span>
      </div>

      <div
        style={{
          fontSize: "29px",
          fontWeight: 800,
          letterSpacing: "-0.8px",
          marginTop: "14px",
        }}
      >
        {value}
      </div>

      <div
        style={{
          fontSize: "11px",
          color: palette.muted,
          marginTop: "6px",
          lineHeight: 1.5,
        }}
      >
        {description}
      </div>

      {trend && (
        <div
          style={{
            marginTop: "12px",
            color,
            display: "flex",
            alignItems: "center",
            gap: "5px",
            fontSize: "11px",
            fontWeight: 700,
          }}
        >
          <ArrowUpRight size={13} />
          {trend}
        </div>
      )}
    </article>
  );
}

function Modal({
  title,
  subtitle,
  onClose,
  children,
  width = "620px",
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: string;
}) {
  return (
    <div
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.48)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "18px",
      }}
    >
      <section
        role="dialog"
        aria-modal="true"
        style={{
          width: "100%",
          maxWidth: width,
          maxHeight: "90vh",
          overflowY: "auto",
          background: palette.white,
          borderRadius: "15px",
          boxShadow: "0 24px 80px rgba(15, 23, 42, 0.24)",
        }}
      >
        <div
          style={{
            padding: "20px 22px",
            borderBottom: `1px solid ${palette.border}`,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "15px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "18px", margin: 0, fontWeight: 780 }}>
              {title}
            </h2>
            {subtitle && (
              <p
                style={{
                  margin: "6px 0 0",
                  fontSize: "12px",
                  lineHeight: 1.6,
                  color: palette.muted,
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onClose}
            style={{
              ...styles.button,
              padding: "7px",
              border: "none",
              background: "#F3F4F6",
            }}
          >
            <X size={17} />
          </button>
        </div>
        <div style={{ padding: "22px" }}>{children}</div>
      </section>
    </div>
  );
}

const blankPolicy = (): Omit<GovernancePolicy, "id" | "lastUpdated"> => ({
  name: "",
  category: "Security",
  owner: "Security Team",
  scope: "Organization",
  status: "Draft",
  description: "",
  risk: "Medium",
  version: "v1.0",
  controls: 0,
  reviewDate: "Nov 30, 2026",
  approvalRequired: true,
});

export default function GovernancePage() {
  const [policies, setPolicies] =
    useState<GovernancePolicy[]>(initialPolicies);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [riskFilter, setRiskFilter] = useState("All risks");
  const [selectedPolicy, setSelectedPolicy] =
    useState<GovernancePolicy | null>(null);
  const [editingPolicy, setEditingPolicy] =
    useState<GovernancePolicy | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(blankPolicy());
  const [formError, setFormError] = useState("");
  const [activeTab, setActiveTab] = useState<
    "Policies" | "AI Governance" | "Compliance"
  >("Policies");
  const [notice, setNotice] = useState("");

  const metrics = useMemo(() => {
    const active = policies.filter((p) => p.status === "Active").length;
    const reviews = policies.filter(
      (p) => p.status === "Under Review",
    ).length;
    const highRisk = policies.filter(
      (p) => p.risk === "High" && p.status !== "Active",
    ).length;
    const totalControls = policies.reduce((sum, p) => sum + p.controls, 0);

    return {
      total: policies.length,
      active,
      reviews,
      drafts: policies.filter((p) => p.status === "Draft").length,
      violations: highRisk,
      totalControls,
    };
  }, [policies]);

  const filteredPolicies = useMemo(() => {
    const query = search.trim().toLowerCase();

    return policies.filter((policy) => {
      const matchesSearch =
        !query ||
        [
          policy.id,
          policy.name,
          policy.owner,
          policy.category,
          policy.scope,
          policy.description,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesStatus =
        statusFilter === "All statuses" || policy.status === statusFilter;
      const matchesCategory =
        categoryFilter === "All categories" ||
        policy.category === categoryFilter;
      const matchesRisk =
        riskFilter === "All risks" || policy.risk === riskFilter;

      return (
        matchesSearch && matchesStatus && matchesCategory && matchesRisk
      );
    });
  }, [policies, search, statusFilter, categoryFilter, riskFilter]);

  function openCreateForm() {
    setEditingPolicy(null);
    setForm(blankPolicy());
    setFormError("");
    setShowForm(true);
  }

  function openEditForm(policy: GovernancePolicy) {
    setEditingPolicy(policy);
    setForm({
      name: policy.name,
      category: policy.category,
      owner: policy.owner,
      scope: policy.scope,
      status: policy.status,
      description: policy.description,
      risk: policy.risk,
      version: policy.version,
      controls: policy.controls,
      reviewDate: policy.reviewDate,
      approvalRequired: policy.approvalRequired,
    });
    setFormError("");
    setSelectedPolicy(null);
    setShowForm(true);
  }

  function savePolicy(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (!form.name.trim() || !form.description.trim()) {
      setFormError("Enter a policy name and description.");
      return;
    }

    const today = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "2-digit",
      year: "numeric",
    });

    if (editingPolicy) {
      const updated: GovernancePolicy = {
        ...editingPolicy,
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        lastUpdated: today,
      };

      setPolicies((current) =>
        current.map((p) => (p.id === updated.id ? updated : p)),
      );
      setNotice(`${updated.name} updated successfully.`);
    } else {
      const nextNumber =
        Math.max(
          1000,
          ...policies.map((p) => Number(p.id.replace("POL-", ""))),
        ) + 1;

      const created: GovernancePolicy = {
        ...form,
        id: `POL-${nextNumber}`,
        name: form.name.trim(),
        description: form.description.trim(),
        lastUpdated: today,
      };

      setPolicies((current) => [created, ...current]);
      setNotice(`${created.name} created successfully.`);
    }

    setShowForm(false);
  }

  function changePolicyStatus(
    policy: GovernancePolicy,
    status: PolicyStatus,
  ) {
    const updated = { ...policy, status };
    setPolicies((current) =>
      current.map((p) => (p.id === policy.id ? updated : p)),
    );
    setSelectedPolicy(updated);
    setNotice(`${policy.name} moved to ${status}.`);
  }

  function updateForm<K extends keyof ReturnType<typeof blankPolicy>>(
    key: K,
    value: ReturnType<typeof blankPolicy>[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  const tabs = [
    { label: "Policies", count: policies.length },
    { label: "AI Governance", count: 4 },
    { label: "Compliance", count: 3 },
  ] as const;

  return (
    <main style={styles.page}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "20px",
          flexWrap: "wrap",
          marginBottom: "26px",
        }}
      >
        <div style={{ maxWidth: "820px" }}>
          <div style={styles.eyebrow}>
            <ShieldCheck size={15} />
            Platform / Governance
          </div>
          <h1 style={styles.title}>Governance Center</h1>
          <p style={styles.subtitle}>
            Manage platform policies, responsible AI practices, access
            controls, compliance oversight, and organization-wide risk.
          </p>
        </div>

        <div style={{ display: "flex", gap: "9px", flexWrap: "wrap" }}>
          <button
            type="button"
            style={styles.button}
            onClick={() => {
              setSearch("");
              setStatusFilter("All statuses");
              setCategoryFilter("All categories");
              setRiskFilter("All risks");
              setNotice("Policy filters reset.");
            }}
          >
            <RefreshCw size={15} />
            Reset filters
          </button>
          <button
            type="button"
            style={styles.primaryButton}
            onClick={openCreateForm}
          >
            <Plus size={16} />
            Create policy
          </button>
        </div>
      </header>

      {notice && (
        <div
          role="status"
          style={{
            padding: "11px 14px",
            marginBottom: "18px",
            border: "1px solid #BDE8CF",
            background: "#F0FBF5",
            color: "#176B48",
            borderRadius: "9px",
            fontSize: "12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <CheckCircle2 size={16} />
            {notice}
          </span>
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
            style={{
              border: "none",
              background: "transparent",
              color: "inherit",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
            }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(205px, 1fr))",
          gap: "14px",
          marginBottom: "24px",
        }}
      >
        <MetricCard
          title="Total Policies"
          value={metrics.total}
          description="Policies tracked in this workspace"
          icon={ClipboardCheck}
          color={palette.blue}
          background={palette.blueLight}
        />
        <MetricCard
          title="Active Policies"
          value={metrics.active}
          description="Currently marked as enforced"
          icon={ShieldCheck}
          color={palette.green}
          background={palette.greenLight}
          trend="Active status"
        />
        <MetricCard
          title="Pending Reviews"
          value={metrics.reviews}
          description="Policies awaiting review"
          icon={Clock3}
          color={palette.orange}
          background={palette.orangeLight}
        />
        <MetricCard
          title="High-Risk Items"
          value={metrics.violations}
          description="High-risk policies not yet active"
          icon={ShieldAlert}
          color={palette.red}
          background={palette.redLight}
        />
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "14px",
          marginBottom: "24px",
        }}
      >
        <article
          style={{
            ...styles.panel,
            padding: "17px",
            display: "flex",
            alignItems: "center",
            gap: "13px",
          }}
        >
          <div
            style={{
              background: palette.purpleLight,
              color: palette.purple,
              borderRadius: "10px",
              width: "42px",
              height: "42px",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <FileCheck2 size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "12px", color: palette.muted }}>
              Policy controls
            </div>
            <div style={{ fontSize: "21px", fontWeight: 800, marginTop: "4px" }}>
              {metrics.totalControls}
            </div>
          </div>
          <span style={{ fontSize: "11px", color: palette.muted }}>
            Across policies
          </span>
        </article>

        <article
          style={{
            ...styles.panel,
            padding: "17px",
            display: "flex",
            alignItems: "center",
            gap: "13px",
          }}
        >
          <div
            style={{
              background: palette.greenLight,
              color: palette.green,
              borderRadius: "10px",
              width: "42px",
              height: "42px",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <Activity size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "12px", color: palette.muted }}>
              Active coverage
            </div>
            <div style={{ fontSize: "21px", fontWeight: 800, marginTop: "4px" }}>
              {metrics.total
                ? Math.round((metrics.active / metrics.total) * 100)
                : 0}
              %
            </div>
          </div>
          <span style={{ fontSize: "11px", color: palette.muted }}>
            Active policies
          </span>
        </article>

        <article
          style={{
            ...styles.panel,
            padding: "17px",
            display: "flex",
            alignItems: "center",
            gap: "13px",
          }}
        >
          <div
            style={{
              background: palette.orangeLight,
              color: palette.orange,
              borderRadius: "10px",
              width: "42px",
              height: "42px",
              display: "grid",
              placeItems: "center",
              flexShrink: 0,
            }}
          >
            <AlertTriangle size={20} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "12px", color: palette.muted }}>
              Draft policies
            </div>
            <div style={{ fontSize: "21px", fontWeight: 800, marginTop: "4px" }}>
              {metrics.drafts}
            </div>
          </div>
          <span style={{ fontSize: "11px", color: palette.muted }}>
            Need completion
          </span>
        </article>
      </section>

      <section style={{ ...styles.panel, marginBottom: "24px" }}>
        <div style={styles.panelHeader}>
          <div>
            <h2 style={styles.sectionTitle}>Governance Workspace</h2>
            <p style={styles.sectionDescription}>
              Review policies, AI controls, and compliance readiness.
            </p>
          </div>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              fontSize: "11px",
              color: palette.muted,
              background: "#F8FAFC",
              padding: "7px 9px",
              border: `1px solid ${palette.border}`,
              borderRadius: "8px",
            }}
          >
            <span
              style={{
                width: "7px",
                height: "7px",
                borderRadius: "50%",
                background: palette.green,
              }}
            />
            Demo workspace
          </span>
        </div>

        <div
          style={{
            display: "flex",
            gap: "22px",
            padding: "0 20px",
            borderBottom: `1px solid ${palette.border}`,
            overflowX: "auto",
          }}
        >
          {tabs.map((tab) => (
            <button
              type="button"
              key={tab.label}
              onClick={() => setActiveTab(tab.label)}
              style={{
                border: "none",
                borderBottom:
                  activeTab === tab.label
                    ? `2px solid ${palette.blue}`
                    : "2px solid transparent",
                background: "transparent",
                padding: "15px 0 13px",
                color:
                  activeTab === tab.label ? palette.blue : palette.muted,
                fontSize: "12px",
                fontWeight: activeTab === tab.label ? 750 : 600,
                cursor: "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {tab.label}
              <span
                style={{
                  marginLeft: "7px",
                  borderRadius: "6px",
                  padding: "3px 6px",
                  background:
                    activeTab === tab.label ? palette.blueLight : "#F3F4F6",
                  color:
                    activeTab === tab.label ? palette.blue : palette.muted,
                  fontSize: "10px",
                }}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {activeTab === "Policies" && (
          <>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                padding: "17px 20px",
                borderBottom: `1px solid ${palette.border}`,
              }}
            >
              <div style={{ flex: "1 1 220px", position: "relative" }}>
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    top: "11px",
                    left: "11px",
                    color: palette.muted,
                  }}
                />
                <input
                  aria-label="Search policies"
                  placeholder="Search policies, owners, IDs..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  style={{ ...styles.field, paddingLeft: "36px" }}
                />
              </div>

              <select
                aria-label="Filter by status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                style={{ ...styles.field, width: "auto", minWidth: "145px" }}
              >
                <option>All statuses</option>
                {statusOptions.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>

              <select
                aria-label="Filter by category"
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                style={{ ...styles.field, width: "auto", minWidth: "155px" }}
              >
                <option>All categories</option>
                {categoryOptions.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>

              <select
                aria-label="Filter by risk"
                value={riskFilter}
                onChange={(event) => setRiskFilter(event.target.value)}
                style={{ ...styles.field, width: "auto", minWidth: "120px" }}
              >
                <option>All risks</option>
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>

              <button
                type="button"
                style={styles.button}
                onClick={() => {
                  setStatusFilter("All statuses");
                  setCategoryFilter("All categories");
                  setRiskFilter("All risks");
                }}
              >
                <Filter size={15} />
                Clear filters
              </button>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                  minWidth: "950px",
                }}
              >
                <thead>
                  <tr style={{ background: "#FAFBFC" }}>
                    {[
                      "POLICY",
                      "CATEGORY",
                      "OWNER",
                      "SCOPE",
                      "RISK",
                      "STATUS",
                      "UPDATED",
                      "",
                    ].map((heading) => (
                      <th
                        key={heading}
                        style={{
                          padding: "12px 15px",
                          borderBottom: `1px solid ${palette.border}`,
                          fontSize: "10px",
                          fontWeight: 800,
                          letterSpacing: "0.06em",
                          color: palette.muted,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {filteredPolicies.map((policy) => (
                    <tr
                      key={policy.id}
                      style={{ borderBottom: `1px solid ${palette.border}` }}
                    >
                      <td style={{ padding: "15px", minWidth: "220px" }}>
                        <button
                          type="button"
                          onClick={() => setSelectedPolicy(policy)}
                          style={{
                            display: "block",
                            padding: 0,
                            border: "none",
                            background: "transparent",
                            color: palette.text,
                            fontSize: "12px",
                            fontWeight: 750,
                            cursor: "pointer",
                            textAlign: "left",
                          }}
                        >
                          {policy.name}
                        </button>
                        <div
                          style={{
                            fontSize: "10px",
                            color: palette.muted,
                            marginTop: "5px",
                          }}
                        >
                          {policy.id} · {policy.version}
                        </div>
                      </td>
                      <td style={{ padding: "15px", fontSize: "11px" }}>
                        {policy.category}
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          fontSize: "11px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {policy.owner}
                      </td>
                      <td style={{ padding: "15px", fontSize: "11px" }}>
                        {policy.scope}
                      </td>
                      <td style={{ padding: "15px" }}>
                        <RiskBadge risk={policy.risk} />
                      </td>
                      <td style={{ padding: "15px" }}>
                        <StatusBadge status={policy.status} />
                      </td>
                      <td
                        style={{
                          padding: "15px",
                          color: palette.muted,
                          fontSize: "11px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {policy.lastUpdated}
                      </td>
                      <td style={{ padding: "15px" }}>
                        <button
                          type="button"
                          aria-label={`View ${policy.name}`}
                          onClick={() => setSelectedPolicy(policy)}
                          style={{
                            border: "1px solid transparent",
                            background: "transparent",
                            color: palette.muted,
                            cursor: "pointer",
                            display: "grid",
                            placeItems: "center",
                            padding: "5px",
                            borderRadius: "6px",
                          }}
                        >
                          <MoreHorizontal size={17} />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredPolicies.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: "42px 20px" }}>
                        <div style={{ textAlign: "center" }}>
                          <Search
                            size={24}
                            color={palette.muted}
                            style={{ margin: "0 auto 10px" }}
                          />
                          <div
                            style={{
                              fontSize: "13px",
                              fontWeight: 750,
                            }}
                          >
                            No policies found
                          </div>
                          <p
                            style={{
                              fontSize: "12px",
                              color: palette.muted,
                            }}
                          >
                            Try a different search term or clear your filters.
                          </p>
                          <button
                            type="button"
                            style={styles.button}
                            onClick={() => {
                              setSearch("");
                              setStatusFilter("All statuses");
                              setCategoryFilter("All categories");
                              setRiskFilter("All risks");
                            }}
                          >
                            Clear all filters
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div
              style={{
                padding: "13px 20px",
                borderTop: `1px solid ${palette.border}`,
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                flexWrap: "wrap",
                color: palette.muted,
                fontSize: "11px",
              }}
            >
              <span>
                Showing {filteredPolicies.length} of {policies.length} policies
              </span>
              <span>Policy actions update this demo workspace only</span>
            </div>
          </>
        )}

        {activeTab === "AI Governance" && (
          <div
            style={{
              padding: "20px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "14px",
            }}
          >
            {[
              {
                title: "Model Approval",
                description:
                  "Track review and approval of models before production use.",
                icon: BrainCircuit,
                color: palette.purple,
                background: palette.purpleLight,
                status: "Review workflow",
              },
              {
                title: "Responsible AI",
                description:
                  "Manage fairness, transparency, human oversight, and model risk.",
                icon: Sparkles,
                color: palette.blue,
                background: palette.blueLight,
                status: "Policy tracking",
              },
              {
                title: "Data Privacy",
                description:
                  "Review data handling, retention, and sensitive information controls.",
                icon: Database,
                color: palette.green,
                background: palette.greenLight,
                status: "Controls tracking",
              },
              {
                title: "AI Access",
                description:
                  "Define who can use models and which capabilities are permitted.",
                icon: LockKeyhole,
                color: palette.orange,
                background: palette.orangeLight,
                status: "Access governance",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article
                  key={item.title}
                  style={{
                    border: `1px solid ${palette.border}`,
                    borderRadius: "11px",
                    padding: "17px",
                    background: "#FFFFFF",
                  }}
                >
                  <div
                    style={{
                      width: "39px",
                      height: "39px",
                      borderRadius: "9px",
                      display: "grid",
                      placeItems: "center",
                      color: item.color,
                      background: item.background,
                    }}
                  >
                    <Icon size={19} />
                  </div>
                  <h3
                    style={{
                      fontSize: "14px",
                      margin: "14px 0 7px",
                      fontWeight: 750,
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "12px",
                      color: palette.muted,
                      lineHeight: 1.7,
                      margin: 0,
                      minHeight: "62px",
                    }}
                  >
                    {item.description}
                  </p>
                  <div
                    style={{
                      borderTop: `1px solid ${palette.border}`,
                      paddingTop: "12px",
                      marginTop: "14px",
                      display: "flex",
                      alignItems: "center",
                      gap: "7px",
                      fontSize: "11px",
                      fontWeight: 700,
                      color: item.color,
                    }}
                  >
                    <CheckCircle2 size={14} />
                    {item.status}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {activeTab === "Compliance" && (
          <div style={{ padding: "20px" }}>
            <div
              style={{
                padding: "15px",
                border: "1px solid #F3D5A5",
                borderRadius: "10px",
                background: "#FFFAF1",
                display: "flex",
                gap: "12px",
                alignItems: "flex-start",
                marginBottom: "16px",
              }}
            >
              <AlertTriangle size={19} color={palette.orange} />
              <div>
                <div style={{ fontSize: "13px", fontWeight: 750 }}>
                  Compliance evidence needs verification
                </div>
                <p
                  style={{
                    fontSize: "12px",
                    lineHeight: 1.7,
                    color: "#785A2A",
                    margin: "6px 0 0",
                  }}
                >
                  These are illustrative governance indicators. Connect audit
                  evidence, control tests, and compliance systems before
                  treating them as actual compliance results.
                </p>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "12px",
              }}
            >
              {[
                {
                  title: "Control inventory",
                  value: `${metrics.totalControls} demo controls`,
                  description: "Control counts entered in sample policies",
                  icon: ClipboardCheck,
                },
                {
                  title: "Review workflow",
                  value: `${metrics.reviews} pending reviews`,
                  description: "Policies marked Under Review",
                  icon: Clock3,
                },
                {
                  title: "Risk follow-up",
                  value: `${metrics.violations} high-risk items`,
                  description: "High-risk policies not marked Active",
                  icon: ShieldAlert,
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <article
                    key={item.title}
                    style={{
                      border: `1px solid ${palette.border}`,
                      borderRadius: "10px",
                      padding: "16px",
                    }}
                  >
                    <Icon size={19} color={palette.blue} />
                    <div
                      style={{
                        fontSize: "12px",
                        color: palette.muted,
                        marginTop: "12px",
                      }}
                    >
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontSize: "17px",
                        fontWeight: 800,
                        marginTop: "6px",
                      }}
                    >
                      {item.value}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        color: palette.muted,
                        lineHeight: 1.6,
                        marginTop: "6px",
                      }}
                    >
                      {item.description}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
          gap: "18px",
          marginBottom: "24px",
        }}
      >
        <article style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Attention Required</h2>
              <p style={styles.sectionDescription}>
                Policies that may need governance follow-up.
              </p>
            </div>
            <AlertTriangle size={18} color={palette.orange} />
          </div>

          <div style={{ padding: "8px 18px" }}>
            {policies
              .filter(
                (p) =>
                  p.status === "Under Review" ||
                  p.status === "Draft" ||
                  (p.risk === "High" && p.status !== "Active"),
              )
              .slice(0, 5)
              .map((policy) => (
                <button
                  type="button"
                  key={policy.id}
                  onClick={() => setSelectedPolicy(policy)}
                  style={{
                    width: "100%",
                    padding: "13px 0",
                    border: "none",
                    borderBottom: `1px solid ${palette.border}`,
                    background: "transparent",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: "12px",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: palette.text,
                      }}
                    >
                      {policy.name}
                    </div>
                    <div
                      style={{
                        fontSize: "10px",
                        color: palette.muted,
                        marginTop: "5px",
                      }}
                    >
                      {policy.id} · {policy.owner}
                    </div>
                  </div>
                  <StatusBadge status={policy.status} />
                </button>
              ))}
          </div>
        </article>

        <article style={styles.panel}>
          <div style={styles.panelHeader}>
            <div>
              <h2 style={styles.sectionTitle}>Governance Capabilities</h2>
              <p style={styles.sectionDescription}>
                Core governance areas in the ModelNow platform.
              </p>
            </div>
            <Shield size={18} color={palette.blue} />
          </div>

          <div
            style={{
              padding: "15px 18px",
              display: "grid",
              gap: "14px",
            }}
          >
            {[
              {
                title: "Policy lifecycle",
                description: "Draft, review, activate, and restrict policies.",
                icon: FilePlus2,
              },
              {
                title: "Access and authorization",
                description: "Define governance requirements for platform access.",
                icon: LockKeyhole,
              },
              {
                title: "Risk and accountability",
                description: "Identify risk indicators and accountable policy owners.",
                icon: Users,
              },
              {
                title: "Audit and evidence",
                description: "Prepare control evidence for compliance verification.",
                icon: FileCheck2,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "11px",
                  }}
                >
                  <span
                    style={{
                      width: "32px",
                      height: "32px",
                      flexShrink: 0,
                      display: "grid",
                      placeItems: "center",
                      color: palette.blue,
                      background: palette.blueLight,
                      borderRadius: "8px",
                    }}
                  >
                    <Icon size={16} />
                  </span>
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 750 }}>
                      {item.title}
                    </div>
                    <div
                      style={{
                        fontSize: "11px",
                        lineHeight: 1.6,
                        color: palette.muted,
                        marginTop: "4px",
                      }}
                    >
                      {item.description}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      <footer
        style={{
          border: `1px solid ${palette.border}`,
          borderRadius: "10px",
          padding: "13px 15px",
          background: "#FFFFFF",
          display: "flex",
          alignItems: "flex-start",
          gap: "10px",
          color: palette.muted,
          fontSize: "11px",
          lineHeight: 1.7,
        }}
      >
        <ShieldCheck size={17} color={palette.blue} style={{ flexShrink: 0 }} />
        <span>
          <strong style={{ color: palette.text }}>Governance demo mode.</strong>{" "}
          Policies, statuses, and metrics use local React state and sample data.
          Changes are not persisted after a page refresh. Production policy
          enforcement, audit trails, approval workflows, and compliance
          verification require backend APIs and server-side authorization.
        </span>
      </footer>

      {showForm && (
        <Modal
          title={editingPolicy ? "Edit governance policy" : "Create governance policy"}
          subtitle={
            editingPolicy
              ? `Update details for ${editingPolicy.id}.`
              : "Add a policy to the local governance workspace."
          }
          onClose={() => setShowForm(false)}
        >
          <form onSubmit={savePolicy}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
                gap: "16px",
              }}
            >
              <label>
                <span style={styles.fieldLabel}>Policy name *</span>
                <input
                  value={form.name}
                  onChange={(event) => updateForm("name", event.target.value)}
                  placeholder="e.g. API Security Policy"
                  style={styles.field}
                  autoFocus
                />
              </label>

              <label>
                <span style={styles.fieldLabel}>Category</span>
                <select
                  value={form.category}
                  onChange={(event) =>
                    updateForm("category", event.target.value as PolicyCategory)
                  }
                  style={styles.field}
                >
                  {categoryOptions.map((category) => (
                    <option key={category}>{category}</option>
                  ))}
                </select>
              </label>

              <label>
                <span style={styles.fieldLabel}>Policy owner</span>
                <select
                  value={form.owner}
                  onChange={(event) => updateForm("owner", event.target.value)}
                  style={styles.field}
                >
                  {owners.map((owner) => (
                    <option key={owner}>{owner}</option>
                  ))}
                </select>
              </label>

              <label>
                <span style={styles.fieldLabel}>Scope</span>
                <select
                  value={form.scope}
                  onChange={(event) => updateForm("scope", event.target.value)}
                  style={styles.field}
                >
                  {scopes.map((scope) => (
                    <option key={scope}>{scope}</option>
                  ))}
                </select>
              </label>

              <label>
                <span style={styles.fieldLabel}>Status</span>
                <select
                  value={form.status}
                  onChange={(event) =>
                    updateForm("status", event.target.value as PolicyStatus)
                  }
                  style={styles.field}
                >
                  {statusOptions.map((status) => (
                    <option key={status}>{status}</option>
                  ))}
                </select>
              </label>

              <label>
                <span style={styles.fieldLabel}>Risk level</span>
                <select
                  value={form.risk}
                  onChange={(event) =>
                    updateForm(
                      "risk",
                      event.target.value as GovernancePolicy["risk"],
                    )
                  }
                  style={styles.field}
                >
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                </select>
              </label>

              <label>
                <span style={styles.fieldLabel}>Version</span>
                <input
                  value={form.version}
                  onChange={(event) => updateForm("version", event.target.value)}
                  style={styles.field}
                  placeholder="v1.0"
                />
              </label>

              <label>
                <span style={styles.fieldLabel}>Control count</span>
                <input
                  type="number"
                  min={0}
                  value={form.controls}
                  onChange={(event) =>
                    updateForm("controls", Math.max(0, Number(event.target.value)))
                  }
                  style={styles.field}
                />
              </label>

              <label style={{ gridColumn: "1 / -1" }}>
                <span style={styles.fieldLabel}>Description *</span>
                <textarea
                  value={form.description}
                  onChange={(event) =>
                    updateForm("description", event.target.value)
                  }
                  placeholder="Describe the policy's purpose and requirements..."
                  rows={4}
                  style={{ ...styles.field, resize: "vertical", lineHeight: 1.6 }}
                />
              </label>

              <label style={{ gridColumn: "1 / -1" }}>
                <span style={styles.fieldLabel}>Next review date</span>
                <input
                  value={form.reviewDate}
                  onChange={(event) =>
                    updateForm("reviewDate", event.target.value)
                  }
                  style={styles.field}
                  placeholder="e.g. Nov 30, 2026"
                />
              </label>

              <label
                style={{
                  gridColumn: "1 / -1",
                  display: "flex",
                  alignItems: "center",
                  gap: "9px",
                  fontSize: "12px",
                  color: "#4B5563",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={form.approvalRequired}
                  onChange={(event) =>
                    updateForm("approvalRequired", event.target.checked)
                  }
                />
                Approval required before policy activation
              </label>
            </div>

            {formError && (
              <p
                role="alert"
                style={{
                  margin: "14px 0 0",
                  color: palette.red,
                  fontSize: "12px",
                }}
              >
                {formError}
              </p>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "9px",
                marginTop: "22px",
                paddingTop: "17px",
                borderTop: `1px solid ${palette.border}`,
              }}
            >
              <button
                type="button"
                style={styles.button}
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
              <button type="submit" style={styles.primaryButton}>
                <Check size={15} />
                {editingPolicy ? "Save changes" : "Create policy"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {selectedPolicy && (
        <Modal
          title={selectedPolicy.name}
          subtitle={`${selectedPolicy.id} · ${selectedPolicy.version}`}
          onClose={() => setSelectedPolicy(null)}
          width="700px"
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              marginBottom: "18px",
            }}
          >
            <StatusBadge status={selectedPolicy.status} />
            <RiskBadge risk={selectedPolicy.risk} />
          </div>

          <p
            style={{
              fontSize: "13px",
              lineHeight: 1.8,
              color: "#4B5563",
              margin: "0 0 20px",
            }}
          >
            {selectedPolicy.description}
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
              gap: "10px",
              marginBottom: "20px",
            }}
          >
            {[
              ["Owner", selectedPolicy.owner],
              ["Category", selectedPolicy.category],
              ["Scope", selectedPolicy.scope],
              ["Controls", String(selectedPolicy.controls)],
              ["Last updated", selectedPolicy.lastUpdated],
              ["Next review", selectedPolicy.reviewDate],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  padding: "12px",
                  border: `1px solid ${palette.border}`,
                  borderRadius: "9px",
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    color: palette.muted,
                    fontSize: "10px",
                    marginBottom: "6px",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontSize: "12px",
                    fontWeight: 700,
                    overflowWrap: "anywhere",
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "flex",
              gap: "9px",
              flexWrap: "wrap",
              borderTop: `1px solid ${palette.border}`,
              paddingTop: "17px",
            }}
          >
            <button
              type="button"
              style={styles.primaryButton}
              onClick={() => openEditForm(selectedPolicy)}
            >
              <Pencil size={15} />
              Edit policy
            </button>

            {selectedPolicy.status !== "Active" && (
              <button
                type="button"
                style={styles.button}
                onClick={() => changePolicyStatus(selectedPolicy, "Active")}
              >
                <CheckCircle2 size={15} color={palette.green} />
                Mark active
              </button>
            )}

            {selectedPolicy.status !== "Under Review" && (
              <button
                type="button"
                style={styles.button}
                onClick={() =>
                  changePolicyStatus(selectedPolicy, "Under Review")
                }
              >
                <Clock3 size={15} color={palette.orange} />
                Send for review
              </button>
            )}

            {selectedPolicy.status !== "Restricted" && (
              <button
                type="button"
                style={styles.button}
                onClick={() => changePolicyStatus(selectedPolicy, "Restricted")}
              >
                <LockKeyhole size={15} color={palette.red} />
                Restrict policy
              </button>
            )}

            {selectedPolicy.status !== "Draft" && (
              <button
                type="button"
                style={styles.button}
                onClick={() => changePolicyStatus(selectedPolicy, "Draft")}
              >
                <Pencil size={15} />
                Move to draft
              </button>
            )}
          </div>

          <p
            style={{
              margin: "17px 0 0",
              fontSize: "11px",
              color: palette.muted,
              lineHeight: 1.7,
            }}
          >
            Status changes are local demo actions. They do not enforce
            permissions or modify backend policy rules.
          </p>
        </Modal>
      )}
    </main>
  );
}
