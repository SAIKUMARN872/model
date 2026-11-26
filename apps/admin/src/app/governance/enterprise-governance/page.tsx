"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCheck,
  FileText,
  Filter,
  Globe2,
  Layers3,
  Network,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Target,
  Users,
  X,
} from "lucide-react";

type DomainStatus = "Healthy" | "Needs Attention" | "Under Review";
type DomainRisk = "Low" | "Medium" | "High" | "Critical";

type GovernanceDomain = {
  id: string;
  name: string;
  description: string;
  owner: string;
  department: string;
  executiveSponsor: string;
  risk: DomainRisk;
  status: DomainStatus;
  controls: number;
  implemented: number;
  openActions: number;
  lastReview: string;
  nextReview: string;
  objectives: string[];
};

const initialDomains: GovernanceDomain[] = [
  {
    id: "DOM-001",
    name: "AI Governance",
    description:
      "Organization-wide oversight of AI systems, use cases, model decisions, and accountability.",
    owner: "AI Governance Lead",
    department: "AI Platform",
    executiveSponsor: "Chief Technology Officer",
    risk: "High",
    status: "Needs Attention",
    controls: 18,
    implemented: 14,
    openActions: 4,
    lastReview: "2026-09-15",
    nextReview: "2026-11-15",
    objectives: [
      "Establish AI ownership and approval workflows",
      "Maintain an inventory of AI use cases",
      "Define risk-based review requirements",
    ],
  },
  {
    id: "DOM-002",
    name: "Security Governance",
    description:
      "Security ownership, access controls, incident oversight, and security risk accountability.",
    owner: "Security Governance Lead",
    department: "Security Operations",
    executiveSponsor: "Chief Information Security Officer",
    risk: "Medium",
    status: "Healthy",
    controls: 22,
    implemented: 21,
    openActions: 1,
    lastReview: "2026-10-01",
    nextReview: "2027-01-01",
    objectives: [
      "Review privileged access",
      "Maintain incident escalation ownership",
      "Track security control exceptions",
    ],
  },
  {
    id: "DOM-003",
    name: "Data Governance",
    description:
      "Data ownership, classification, lineage, retention, and responsible data handling.",
    owner: "Head of Data Governance",
    department: "Data Platform",
    executiveSponsor: "Chief Data Officer",
    risk: "High",
    status: "Under Review",
    controls: 20,
    implemented: 15,
    openActions: 5,
    lastReview: "2026-08-18",
    nextReview: "2026-11-12",
    objectives: [
      "Assign data owners and stewards",
      "Review data retention requirements",
      "Track sensitive data access",
    ],
  },
  {
    id: "DOM-004",
    name: "Model Lifecycle",
    description:
      "Model registration, evaluation, release approval, monitoring, and retirement governance.",
    owner: "Model Risk Manager",
    department: "AI Platform",
    executiveSponsor: "Chief Technology Officer",
    risk: "High",
    status: "Needs Attention",
    controls: 16,
    implemented: 11,
    openActions: 5,
    lastReview: "2026-09-05",
    nextReview: "2026-11-18",
    objectives: [
      "Maintain model lifecycle records",
      "Document evaluation and release decisions",
      "Define retirement and rollback procedures",
    ],
  },
  {
    id: "DOM-005",
    name: "Third-Party Governance",
    description:
      "Vendor ownership, due diligence, supplier risk reviews, and contractual accountability.",
    owner: "Vendor Risk Lead",
    department: "Procurement",
    executiveSponsor: "Chief Operating Officer",
    risk: "Medium",
    status: "Healthy",
    controls: 14,
    implemented: 13,
    openActions: 1,
    lastReview: "2026-09-25",
    nextReview: "2026-12-25",
    objectives: [
      "Assign accountable vendor owners",
      "Track third-party risk assessments",
      "Review vendor access and contracts",
    ],
  },
  {
    id: "DOM-006",
    name: "Responsible AI",
    description:
      "Fairness, transparency, explainability, human oversight, and responsible AI practices.",
    owner: "Responsible AI Lead",
    department: "AI Governance",
    executiveSponsor: "Chief Risk Officer",
    risk: "Critical",
    status: "Under Review",
    controls: 17,
    implemented: 10,
    openActions: 7,
    lastReview: "2026-07-20",
    nextReview: "2026-11-09",
    objectives: [
      "Document fairness evaluation",
      "Define human oversight responsibilities",
      "Review transparency and explainability needs",
    ],
  },
];

const statusOptions: DomainStatus[] = [
  "Healthy",
  "Needs Attention",
  "Under Review",
];

const riskOptions: DomainRisk[] = [
  "Low",
  "Medium",
  "High",
  "Critical",
];

const departmentOptions = [
  "AI Platform",
  "Security Operations",
  "Data Platform",
  "Procurement",
  "AI Governance",
  "Finance",
  "Legal",
  "Human Resources",
  "Enterprise Operations",
  "Other",
];

function formatDate(value: string) {
  if (!value) return "Not scheduled";

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function statusClass(status: DomainStatus) {
  if (status === "Healthy") return "eg-status-healthy";
  if (status === "Needs Attention") return "eg-status-attention";
  return "eg-status-review";
}

function riskClass(risk: DomainRisk) {
  return `eg-risk-${risk.toLowerCase()}`;
}

function exportDomains(domains: GovernanceDomain[]) {
  const headers = [
    "Domain ID",
    "Domain",
    "Department",
    "Owner",
    "Executive Sponsor",
    "Risk",
    "Status",
    "Total Controls",
    "Implemented Controls",
    "Open Actions",
    "Last Review",
    "Next Review",
  ];

  const rows = domains.map((domain) => [
    domain.id,
    domain.name,
    domain.department,
    domain.owner,
    domain.executiveSponsor,
    domain.risk,
    domain.status,
    String(domain.controls),
    String(domain.implemented),
    String(domain.openActions),
    domain.lastReview,
    domain.nextReview,
  ]);

  const escapeCell = (value: string) =>
    `"${value.replaceAll('"', '""')}"`;

  const csv = [headers, ...rows]
    .map((row) => row.map(escapeCell).join(","))
    .join("\n");

  const blob = new Blob([csv], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "modelnow-enterprise-governance.csv";
  document.body.appendChild(link);
  link.click();
  link.remove();

  URL.revokeObjectURL(url);
}

export default function EnterpriseGovernancePage() {
  const [domains, setDomains] =
    useState<GovernanceDomain[]>(initialDomains);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [riskFilter, setRiskFilter] = useState("All");
  const [departmentFilter, setDepartmentFilter] =
    useState("All");

  const [selectedDomain, setSelectedDomain] =
    useState<GovernanceDomain | null>(null);

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [notification, setNotification] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    owner: "",
    department: "AI Platform",
    executiveSponsor: "",
    risk: "Medium" as DomainRisk,
    status: "Under Review" as DomainStatus,
    controls: "10",
    lastReview: "",
    nextReview: "",
  });

  const metrics = useMemo(() => {
    const totalControls = domains.reduce(
      (sum, domain) => sum + domain.controls,
      0,
    );

    const implementedControls = domains.reduce(
      (sum, domain) => sum + domain.implemented,
      0,
    );

    const openActions = domains.reduce(
      (sum, domain) => sum + domain.openActions,
      0,
    );

    const attention = domains.filter(
      (domain) => domain.status === "Needs Attention",
    ).length;

    const review = domains.filter(
      (domain) => domain.status === "Under Review",
    ).length;

    const coverage =
      totalControls > 0
        ? Math.round(
            (implementedControls / totalControls) * 100,
          )
        : 0;

    return {
      totalDomains: domains.length,
      totalControls,
      implementedControls,
      openActions,
      attention,
      review,
      coverage,
    };
  }, [domains]);

  const filteredDomains = useMemo(() => {
    const query = search.trim().toLowerCase();

    return domains.filter((domain) => {
      const matchesSearch =
        !query ||
        [
          domain.id,
          domain.name,
          domain.description,
          domain.owner,
          domain.department,
          domain.executiveSponsor,
        ].some((value) =>
          value.toLowerCase().includes(query),
        );

      return (
        matchesSearch &&
        (statusFilter === "All" ||
          domain.status === statusFilter) &&
        (riskFilter === "All" ||
          domain.risk === riskFilter) &&
        (departmentFilter === "All" ||
          domain.department === departmentFilter)
      );
    });
  }, [
    domains,
    search,
    statusFilter,
    riskFilter,
    departmentFilter,
  ]);

  const activeFilters =
    Number(statusFilter !== "All") +
    Number(riskFilter !== "All") +
    Number(departmentFilter !== "All");

  function notify(message: string) {
    setNotification(message);

    window.setTimeout(() => {
      setNotification("");
    }, 3000);
  }

  function updateDomain(
    id: string,
    changes: Partial<GovernanceDomain>,
  ) {
    setDomains((current) =>
      current.map((domain) =>
        domain.id === id ? { ...domain, ...changes } : domain,
      ),
    );

    setSelectedDomain((current) =>
      current?.id === id
        ? { ...current, ...changes }
        : current,
    );
  }

  function createDomain(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const controlCount = Number(form.controls);

    if (!form.name.trim() || !form.owner.trim()) {
      notify("Enter a domain name and accountable owner.");
      return;
    }

    if (
      !Number.isInteger(controlCount) ||
      controlCount < 0
    ) {
      notify("Enter a valid non-negative control count.");
      return;
    }

    const domain: GovernanceDomain = {
      id: `DOM-${String(Date.now()).slice(-6)}`,
      name: form.name.trim(),
      description:
        form.description.trim() ||
        "No description provided yet.",
      owner: form.owner.trim(),
      department: form.department,
      executiveSponsor:
        form.executiveSponsor.trim() || "Not assigned",
      risk: form.risk,
      status: form.status,
      controls: controlCount,
      implemented: 0,
      openActions: 0,
      lastReview: form.lastReview,
      nextReview: form.nextReview,
      objectives: [],
    };

    setDomains((current) => [domain, ...current]);
    setShowCreateModal(false);

    setForm({
      name: "",
      description: "",
      owner: "",
      department: "AI Platform",
      executiveSponsor: "",
      risk: "Medium",
      status: "Under Review",
      controls: "10",
      lastReview: "",
      nextReview: "",
    });

    notify("Governance domain added locally.");
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("All");
    setRiskFilter("All");
    setDepartmentFilter("All");
  }

  return (
    <main className="eg-page">
      <style jsx global>{`
        :root {
          --eg-bg: #f7f8fc;
          --eg-card: #ffffff;
          --eg-text: #172033;
          --eg-muted: #788298;
          --eg-border: #e5e9f1;
          --eg-input: #ffffff;
          --eg-hover: #f5f7fb;
        }

        .eg-page {
          min-height: 100vh;
          padding: 30px;
          background: var(--eg-bg);
          color: var(--eg-text);
          font-family: Arial, Helvetica, sans-serif;
          box-sizing: border-box;
        }

        .eg-page * {
          box-sizing: border-box;
        }

        .eg-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 25px;
        }

        .eg-eyebrow {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #4169e1;
          font-size: 11px;
          font-weight: 750;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 11px;
        }

        .eg-title {
          font-size: clamp(25px, 3vw, 33px);
          font-weight: 760;
          letter-spacing: -1px;
          line-height: 1.2;
          margin: 0 0 9px;
        }

        .eg-subtitle {
          color: var(--eg-muted);
          font-size: 13px;
          line-height: 1.7;
          max-width: 700px;
          margin: 0;
        }

        .eg-header-actions {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
        }

        .eg-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 13px;
          border: 1px solid var(--eg-border);
          border-radius: 9px;
          background: var(--eg-card);
          color: var(--eg-text);
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: 0.15s ease;
          white-space: nowrap;
        }

        .eg-btn:hover {
          background: var(--eg-hover);
          border-color: #c9d2e3;
        }

        .eg-btn-primary {
          background: #4169e1;
          border-color: #4169e1;
          color: #fff;
        }

        .eg-btn-primary:hover {
          background: #3155c5;
          border-color: #3155c5;
        }

        .eg-metrics {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 22px;
        }

        .eg-metric {
          min-width: 0;
          padding: 17px;
          background: var(--eg-card);
          border: 1px solid var(--eg-border);
          border-radius: 13px;
        }

        .eg-metric-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 17px;
        }

        .eg-metric-label {
          font-size: 11px;
          color: var(--eg-muted);
          font-weight: 650;
        }

        .eg-metric-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          border-radius: 9px;
          flex-shrink: 0;
        }

        .eg-metric-value {
          font-size: 28px;
          font-weight: 760;
          letter-spacing: -1px;
          line-height: 1.15;
          margin-bottom: 7px;
        }

        .eg-metric-caption {
          color: var(--eg-muted);
          font-size: 10px;
          line-height: 1.5;
        }

        .eg-overview-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.55fr) minmax(270px, 0.85fr);
          gap: 17px;
          margin-bottom: 19px;
        }

        .eg-panel {
          min-width: 0;
          background: var(--eg-card);
          border: 1px solid var(--eg-border);
          border-radius: 13px;
          overflow: hidden;
        }

        .eg-panel-header {
          padding: 19px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          border-bottom: 1px solid var(--eg-border);
        }

        .eg-panel-title {
          font-size: 14px;
          font-weight: 750;
          margin: 0;
        }

        .eg-panel-description {
          color: var(--eg-muted);
          font-size: 11px;
          line-height: 1.55;
          margin: 6px 0 0;
        }

        .eg-org-chart {
          padding: 23px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .eg-org-node {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 15px;
          border: 1px solid var(--eg-border);
          border-radius: 10px;
          background: var(--eg-card);
          width: 100%;
          max-width: 360px;
        }

        .eg-org-node-primary {
          background: #eef3ff;
          border-color: #cbd8ff;
        }

        .eg-org-node-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 35px;
          height: 35px;
          border-radius: 9px;
          background: #fff;
          color: #4169e1;
          flex-shrink: 0;
        }

        .eg-org-node-name {
          font-size: 12px;
          font-weight: 750;
          margin-bottom: 4px;
        }

        .eg-org-node-description {
          color: var(--eg-muted);
          font-size: 10px;
          line-height: 1.5;
        }

        .eg-org-connector {
          width: 1px;
          height: 23px;
          background: #cbd3e1;
        }

        .eg-org-branches {
          width: 100%;
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 10px;
          position: relative;
          padding-top: 12px;
        }

        .eg-org-branches::before {
          content: "";
          position: absolute;
          top: 0;
          left: 16.66%;
          right: 16.66%;
          height: 1px;
          background: #cbd3e1;
        }

        .eg-org-branch {
          display: flex;
          flex-direction: column;
          align-items: center;
          min-width: 0;
        }

        .eg-org-branch::before {
          content: "";
          height: 12px;
          width: 1px;
          background: #cbd3e1;
        }

        .eg-org-branch-card {
          width: 100%;
          min-height: 106px;
          padding: 12px 9px;
          border: 1px solid var(--eg-border);
          background: var(--eg-card);
          border-radius: 9px;
          text-align: center;
        }

        .eg-org-branch-card svg {
          color: #4169e1;
          margin-bottom: 7px;
        }

        .eg-org-branch-name {
          font-size: 11px;
          font-weight: 750;
          margin-bottom: 5px;
          overflow-wrap: anywhere;
        }

        .eg-org-branch-description {
          font-size: 10px;
          color: var(--eg-muted);
          line-height: 1.5;
        }

        .eg-coverage-body {
          padding: 20px;
        }

        .eg-coverage-main {
          display: flex;
          align-items: center;
          gap: 17px;
          padding: 15px 0 21px;
          border-bottom: 1px solid var(--eg-border);
          margin-bottom: 18px;
        }

        .eg-ring {
          width: 94px;
          height: 94px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          flex-shrink: 0;
          background: conic-gradient(
            #4169e1 var(--eg-coverage),
            #e9edf5 0
          );
        }

        .eg-ring::before {
          content: "";
          position: absolute;
          inset: 9px;
          border-radius: 50%;
          background: var(--eg-card);
        }

        .eg-ring-value {
          position: relative;
          font-size: 20px;
          font-weight: 800;
        }

        .eg-coverage-title {
          font-size: 13px;
          font-weight: 750;
          margin-bottom: 7px;
        }

        .eg-coverage-caption {
          font-size: 11px;
          color: var(--eg-muted);
          line-height: 1.65;
        }

        .eg-progress-item {
          margin-bottom: 17px;
        }

        .eg-progress-item:last-child {
          margin-bottom: 0;
        }

        .eg-progress-heading {
          display: flex;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 8px;
          font-size: 11px;
        }

        .eg-progress-track {
          height: 6px;
          background: var(--eg-border);
          border-radius: 20px;
          overflow: hidden;
        }

        .eg-progress-fill {
          height: 100%;
          border-radius: inherit;
          background: #4169e1;
        }

        .eg-register {
          margin-top: 18px;
        }

        .eg-search-row {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 14px 20px;
          border-bottom: 1px solid var(--eg-border);
          flex-wrap: wrap;
        }

        .eg-search {
          position: relative;
          flex: 1;
          min-width: 180px;
        }

        .eg-search input {
          width: 100%;
          border: 1px solid var(--eg-border);
          border-radius: 9px;
          padding: 10px 12px 10px 35px;
          background: var(--eg-input);
          color: var(--eg-text);
          outline: none;
          font-size: 12px;
        }

        .eg-search-icon {
          position: absolute;
          left: 11px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--eg-muted);
        }

        .eg-select {
          padding: 10px 27px 10px 10px;
          border: 1px solid var(--eg-border);
          border-radius: 9px;
          background: var(--eg-input);
          color: var(--eg-text);
          font-size: 11px;
          outline: none;
          max-width: 190px;
        }

        .eg-table-wrap {
          overflow-x: auto;
          width: 100%;
        }

        .eg-table {
          border-collapse: collapse;
          width: 100%;
          min-width: 850px;
          text-align: left;
        }

        .eg-table th {
          padding: 12px 15px;
          background: var(--eg-hover);
          color: var(--eg-muted);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          white-space: nowrap;
          border-bottom: 1px solid var(--eg-border);
        }

        .eg-table td {
          padding: 15px;
          font-size: 11px;
          border-bottom: 1px solid var(--eg-border);
          vertical-align: middle;
        }

        .eg-table tbody tr:last-child td {
          border-bottom: none;
        }

        .eg-table tbody tr:hover {
          background: var(--eg-hover);
        }

        .eg-domain-name {
          font-size: 12px;
          font-weight: 750;
          margin-bottom: 5px;
        }

        .eg-domain-id {
          font-size: 10px;
          color: var(--eg-muted);
        }

        .eg-domain-description {
          max-width: 300px;
          font-size: 10px;
          line-height: 1.55;
          color: var(--eg-muted);
          margin-top: 6px;
        }

        .eg-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 8px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 750;
          white-space: nowrap;
        }

        .eg-status-healthy {
          color: #147d4d;
          background: #e7f8ef;
        }

        .eg-status-attention {
          color: #b45309;
          background: #fff0df;
        }

        .eg-status-review {
          color: #3556b5;
          background: #eaf0ff;
        }

        .eg-risk-low {
          color: #147d4d;
          background: #e7f8ef;
        }

        .eg-risk-medium {
          color: #946200;
          background: #fff4d7;
        }

        .eg-risk-high {
          color: #c05b18;
          background: #fff0e4;
        }

        .eg-risk-critical {
          color: #c53030;
          background: #ffe8e8;
        }

        .eg-text-button {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 0;
          border: none;
          background: transparent;
          color: #4169e1;
          font-size: 11px;
          font-weight: 750;
          cursor: pointer;
        }

        .eg-text-button:hover {
          text-decoration: underline;
        }

        .eg-empty {
          padding: 45px 20px;
          text-align: center;
          color: var(--eg-muted);
          font-size: 12px;
        }

        .eg-footer {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          padding: 14px 20px;
          border-top: 1px solid var(--eg-border);
          color: var(--eg-muted);
          font-size: 10px;
        }

        .eg-principles {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 13px;
          margin-top: 18px;
        }

        .eg-principle {
          display: flex;
          gap: 11px;
          padding: 16px;
          background: var(--eg-card);
          border: 1px solid var(--eg-border);
          border-radius: 11px;
          min-width: 0;
        }

        .eg-principle-icon {
          width: 33px;
          height: 33px;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          background: #edf2ff;
          color: #4169e1;
        }

        .eg-principle-title {
          font-size: 11px;
          font-weight: 750;
          margin-bottom: 6px;
        }

        .eg-principle-text {
          color: var(--eg-muted);
          font-size: 10px;
          line-height: 1.6;
        }

        .eg-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow-y: auto;
          padding: 18px;
          background: rgba(12, 20, 38, 0.48);
          backdrop-filter: blur(3px);
        }

        .eg-modal {
          width: 100%;
          max-width: 680px;
          max-height: 92vh;
          overflow-y: auto;
          border: 1px solid var(--eg-border);
          border-radius: 15px;
          background: var(--eg-card);
          color: var(--eg-text);
          box-shadow: 0 24px 80px rgba(0, 0, 0, 0.2);
        }

        .eg-modal-header {
          padding: 21px 23px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 15px;
          border-bottom: 1px solid var(--eg-border);
        }

        .eg-modal-header h2 {
          font-size: 18px;
          margin: 0 0 7px;
        }

        .eg-modal-header p {
          color: var(--eg-muted);
          font-size: 11px;
          line-height: 1.6;
          margin: 0;
        }

        .eg-close {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 33px;
          height: 33px;
          border: 1px solid var(--eg-border);
          background: var(--eg-card);
          color: var(--eg-text);
          border-radius: 8px;
          cursor: pointer;
          flex-shrink: 0;
        }

        .eg-form {
          padding: 22px 23px;
        }

        .eg-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 15px;
        }

        .eg-field {
          display: flex;
          flex-direction: column;
          gap: 7px;
          min-width: 0;
        }

        .eg-field-full {
          grid-column: 1 / -1;
        }

        .eg-field label {
          font-size: 11px;
          font-weight: 750;
        }

        .eg-field input,
        .eg-field select,
        .eg-field textarea {
          width: 100%;
          padding: 11px 12px;
          border: 1px solid var(--eg-border);
          border-radius: 9px;
          background: var(--eg-input);
          color: var(--eg-text);
          font-family: inherit;
          font-size: 12px;
          outline: none;
        }

        .eg-field textarea {
          min-height: 85px;
          resize: vertical;
        }

        .eg-modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          flex-wrap: wrap;
          padding-top: 19px;
          margin-top: 21px;
          border-top: 1px solid var(--eg-border);
        }

        .eg-detail-body {
          padding: 22px 23px;
        }

        .eg-detail-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .eg-detail-item {
          padding: 13px;
          background: var(--eg-hover);
          border: 1px solid var(--eg-border);
          border-radius: 10px;
          min-width: 0;
        }

        .eg-detail-label {
          color: var(--eg-muted);
          font-size: 10px;
          margin-bottom: 7px;
        }

        .eg-detail-value {
          font-size: 12px;
          font-weight: 750;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .eg-objectives {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 19px;
        }

        .eg-objective {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          font-size: 11px;
          line-height: 1.6;
        }

        .eg-toast {
          position: fixed;
          right: 24px;
          bottom: 24px;
          z-index: 200;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 13px 17px;
          max-width: calc(100vw - 32px);
          border-radius: 10px;
          background: #172033;
          color: #fff;
          font-size: 12px;
          box-shadow: 0 10px 35px rgba(0, 0, 0, 0.2);
        }

        @media (max-width: 1250px) {
          .eg-metrics {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .eg-principles {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 900px) {
          .eg-overview-grid {
            grid-template-columns: minmax(0, 1fr);
          }
        }

        @media (max-width: 650px) {
          .eg-page {
            padding: 16px;
          }

          .eg-metrics {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .eg-metric {
            padding: 13px;
          }

          .eg-metric-value {
            font-size: 24px;
          }

          .eg-principles {
            grid-template-columns: minmax(0, 1fr);
          }

          .eg-org-chart {
            padding: 15px;
          }

          .eg-org-branches {
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: 5px;
          }

          .eg-org-branch-card {
            padding: 10px 5px;
          }

          .eg-org-branch-name {
            font-size: 10px;
          }

          .eg-org-branch-description {
            font-size: 9px;
          }

          .eg-search-row {
            padding: 13px;
          }

          .eg-search {
            flex-basis: 100%;
          }

          .eg-select {
            flex: 1;
            max-width: none;
            min-width: 110px;
          }

          .eg-form-grid,
          .eg-detail-grid {
            grid-template-columns: minmax(0, 1fr);
          }

          .eg-field-full {
            grid-column: auto;
          }

          .eg-modal-overlay {
            padding: 10px;
          }

          .eg-form,
          .eg-detail-body,
          .eg-modal-header {
            padding: 17px;
          }

          .eg-header-actions {
            width: 100%;
          }

          .eg-header-actions .eg-btn {
            flex: 1;
          }
        }
      `}</style>

      <header className="eg-header">
        <div>
          <div className="eg-eyebrow">
            <Network size={15} />
            ModelNow · Governance Center
          </div>

          <h1 className="eg-title">Enterprise Governance</h1>

          <p className="eg-subtitle">
            Coordinate enterprise-wide governance responsibilities,
            domain ownership, control coverage, executive oversight,
            and accountability across your organization.
          </p>
        </div>

        <div className="eg-header-actions">
          <button
            className="eg-btn"
            onClick={() => exportDomains(filteredDomains)}
          >
            <ArrowDownToLine size={15} />
            Export CSV
          </button>

          <button
            className="eg-btn eg-btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus size={16} />
            Add domain
          </button>
        </div>
      </header>

      <section className="eg-metrics">
        <div className="eg-metric">
          <div className="eg-metric-top">
            <span className="eg-metric-label">
              Governance domains
            </span>
            <span
              className="eg-metric-icon"
              style={{
                color: "#4169e1",
                background: "#edf2ff",
              }}
            >
              <Layers3 size={18} />
            </span>
          </div>
          <div className="eg-metric-value">
            {metrics.totalDomains}
          </div>
          <div className="eg-metric-caption">
            Registered enterprise domains
          </div>
        </div>

        <div className="eg-metric">
          <div className="eg-metric-top">
            <span className="eg-metric-label">
              Control coverage
            </span>
            <span
              className="eg-metric-icon"
              style={{
                color: "#147d4d",
                background: "#e7f8ef",
              }}
            >
              <ShieldCheck size={18} />
            </span>
          </div>
          <div className="eg-metric-value">
            {metrics.coverage}%
          </div>
          <div className="eg-metric-caption">
            {metrics.implementedControls} of {metrics.totalControls}{" "}
            controls marked implemented
          </div>
        </div>

        <div className="eg-metric">
          <div className="eg-metric-top">
            <span className="eg-metric-label">
              Open actions
            </span>
            <span
              className="eg-metric-icon"
              style={{
                color: "#b45309",
                background: "#fff0df",
              }}
            >
              <ClipboardCheck size={18} />
            </span>
          </div>
          <div className="eg-metric-value">
            {metrics.openActions}
          </div>
          <div className="eg-metric-caption">
            Actions requiring follow-up
          </div>
        </div>

        <div className="eg-metric">
          <div className="eg-metric-top">
            <span className="eg-metric-label">
              Needs attention
            </span>
            <span
              className="eg-metric-icon"
              style={{
                color: "#c53030",
                background: "#ffe8e8",
              }}
            >
              <AlertTriangle size={18} />
            </span>
          </div>
          <div className="eg-metric-value">
            {metrics.attention}
          </div>
          <div className="eg-metric-caption">
            Domains flagged for action
          </div>
        </div>

        <div className="eg-metric">
          <div className="eg-metric-top">
            <span className="eg-metric-label">
              Under review
            </span>
            <span
              className="eg-metric-icon"
              style={{
                color: "#3556b5",
                background: "#eaf0ff",
              }}
            >
              <Activity size={18} />
            </span>
          </div>
          <div className="eg-metric-value">
            {metrics.review}
          </div>
          <div className="eg-metric-caption">
            Domains undergoing review
          </div>
        </div>
      </section>

      <section className="eg-overview-grid">
        <div className="eg-panel">
          <div className="eg-panel-header">
            <div>
              <h2 className="eg-panel-title">
                Governance operating model
              </h2>
              <p className="eg-panel-description">
                Illustrative view of enterprise governance
                ownership and coordination.
              </p>
            </div>
            <span className="eg-badge eg-status-review">
              Operating model
            </span>
          </div>

          <div className="eg-org-chart">
            <div className="eg-org-node eg-org-node-primary">
              <div className="eg-org-node-icon">
                <Building2 size={19} />
              </div>
              <div>
                <div className="eg-org-node-name">
                  Executive Governance Council
                </div>
                <div className="eg-org-node-description">
                  Enterprise direction, oversight, and escalation
                </div>
              </div>
            </div>

            <div className="eg-org-connector" />

            <div className="eg-org-node">
              <div className="eg-org-node-icon">
                <Users size={19} />
              </div>
              <div>
                <div className="eg-org-node-name">
                  Governance Leadership
                </div>
                <div className="eg-org-node-description">
                  Domain owners, risk leads, and control stewards
                </div>
              </div>
            </div>

            <div className="eg-org-connector" />

            <div className="eg-org-branches">
              <div className="eg-org-branch">
                <div className="eg-org-branch-card">
                  <ShieldCheck size={19} />
                  <div className="eg-org-branch-name">
                    Risk & Security
                  </div>
                  <div className="eg-org-branch-description">
                    Risk ownership and security controls
                  </div>
                </div>
              </div>

              <div className="eg-org-branch">
                <div className="eg-org-branch-card">
                  <Layers3 size={19} />
                  <div className="eg-org-branch-name">
                    AI & Data
                  </div>
                  <div className="eg-org-branch-description">
                    Models, datasets, and AI use cases
                  </div>
                </div>
              </div>

              <div className="eg-org-branch">
                <div className="eg-org-branch-card">
                  <ClipboardCheck size={19} />
                  <div className="eg-org-branch-name">
                    Assurance
                  </div>
                  <div className="eg-org-branch-description">
                    Reviews, evidence, and remediation
                  </div>
                </div>
              </div>
            </div>

            <div
              style={{
                width: "100%",
                marginTop: 19,
                padding: "12px 14px",
                borderRadius: 9,
                background: "var(--eg-hover)",
                color: "var(--eg-muted)",
                fontSize: 10,
                lineHeight: 1.65,
                textAlign: "center",
              }}
            >
              Illustrative structure only. Adapt the reporting
              lines and accountable roles to your actual organization.
            </div>
          </div>
        </div>

        <div className="eg-panel">
          <div className="eg-panel-header">
            <div>
              <h2 className="eg-panel-title">
                Enterprise control coverage
              </h2>
              <p className="eg-panel-description">
                Summary of the sample control inventory.
              </p>
            </div>
          </div>

          <div className="eg-coverage-body">
            <div className="eg-coverage-main">
              <div
                className="eg-ring"
                style={
                  {
                    "--eg-coverage": `${metrics.coverage}%`,
                  } as React.CSSProperties
                }
              >
                <span className="eg-ring-value">
                  {metrics.coverage}%
                </span>
              </div>

              <div>
                <div className="eg-coverage-title">
                  Implementation progress
                </div>
                <div className="eg-coverage-caption">
                  {metrics.implementedControls} controls marked
                  implemented out of {metrics.totalControls}.
                </div>
              </div>
            </div>

            {domains
              .slice(0, 5)
              .map((domain) => {
                const percentage =
                  domain.controls > 0
                    ? Math.round(
                        (domain.implemented / domain.controls) *
                          100,
                      )
                    : 0;

                return (
                  <div
                    className="eg-progress-item"
                    key={domain.id}
                  >
                    <div className="eg-progress-heading">
                      <span>{domain.name}</span>
                      <span
                        style={{
                          fontWeight: 750,
                          fontVariantNumeric: "tabular-nums",
                        }}
                      >
                        {percentage}%
                      </span>
                    </div>
                    <div className="eg-progress-track">
                      <div
                        className="eg-progress-fill"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}

            <div
              style={{
                marginTop: 20,
                fontSize: 10,
                color: "var(--eg-muted)",
                lineHeight: 1.6,
              }}
            >
              Coverage represents local sample data, not a verified
              audit or certification result.
            </div>
          </div>
        </div>
      </section>

      <section className="eg-panel eg-register">
        <div className="eg-panel-header">
          <div>
            <h2 className="eg-panel-title">
              Enterprise governance domains
            </h2>
            <p className="eg-panel-description">
              Assign ownership, track risk, and manage control
              implementation across business functions.
            </p>
          </div>

          <span className="eg-badge eg-status-healthy">
            {filteredDomains.length} domains
          </span>
        </div>

        <div className="eg-search-row">
          <div className="eg-search">
            <Search
              size={15}
              className="eg-search-icon"
            />
            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search domains, owners, departments..."
              aria-label="Search governance domains"
            />
          </div>

          <button
            className="eg-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter size={14} />
            Filters
            {activeFilters > 0 && (
              <span className="eg-badge eg-status-review">
                {activeFilters}
              </span>
            )}
            <ChevronDown size={13} />
          </button>
        </div>

        {showFilters && (
          <div className="eg-search-row">
            <select
              className="eg-select"
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              aria-label="Filter by domain status"
            >
              <option value="All">All statuses</option>
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              className="eg-select"
              value={riskFilter}
              onChange={(event) =>
                setRiskFilter(event.target.value)
              }
              aria-label="Filter by domain risk"
            >
              <option value="All">All risk levels</option>
              {riskOptions.map((risk) => (
                <option key={risk} value={risk}>
                  {risk} risk
                </option>
              ))}
            </select>

            <select
              className="eg-select"
              value={departmentFilter}
              onChange={(event) =>
                setDepartmentFilter(event.target.value)
              }
              aria-label="Filter by department"
            >
              <option value="All">All departments</option>
              {departmentOptions.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>

            <button className="eg-btn" onClick={resetFilters}>
              <X size={13} />
              Clear filters
            </button>
          </div>
        )}

        <div className="eg-table-wrap">
          <table className="eg-table">
            <thead>
              <tr>
                <th>Governance domain</th>
                <th>Owner</th>
                <th>Department</th>
                <th>Risk</th>
                <th>Status</th>
                <th>Controls</th>
                <th>Next review</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredDomains.map((domain) => (
                <tr key={domain.id}>
                  <td>
                    <div className="eg-domain-name">
                      {domain.name}
                    </div>
                    <div className="eg-domain-id">
                      {domain.id}
                    </div>
                    <div className="eg-domain-description">
                      {domain.description}
                    </div>
                  </td>

                  <td>
                    <div
                      style={{
                        fontWeight: 700,
                        fontSize: 11,
                      }}
                    >
                      {domain.owner}
                    </div>
                    <div
                      style={{
                        marginTop: 5,
                        color: "var(--eg-muted)",
                        fontSize: 10,
                      }}
                    >
                      {domain.executiveSponsor}
                    </div>
                  </td>

                  <td>{domain.department}</td>

                  <td>
                    <span
                      className={`eg-badge ${riskClass(
                        domain.risk,
                      )}`}
                    >
                      {domain.risk}
                    </span>
                  </td>

                  <td>
                    <span
                      className={`eg-badge ${statusClass(
                        domain.status,
                      )}`}
                    >
                      {domain.status}
                    </span>
                  </td>

                  <td>
                    <div style={{ fontWeight: 750 }}>
                      {domain.implemented}/{domain.controls}
                    </div>
                    <div
                      style={{
                        width: 75,
                        height: 5,
                        background: "var(--eg-border)",
                        borderRadius: 10,
                        overflow: "hidden",
                        marginTop: 7,
                      }}
                    >
                      <div
                        style={{
                          width: `${
                            domain.controls > 0
                              ? (domain.implemented /
                                  domain.controls) *
                                100
                              : 0
                          }%`,
                          height: "100%",
                          background: "#4169e1",
                        }}
                      />
                    </div>
                  </td>

                  <td>{formatDate(domain.nextReview)}</td>

                  <td>
                    <button
                      className="eg-text-button"
                      onClick={() => setSelectedDomain(domain)}
                    >
                      Manage
                      <ArrowRight size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredDomains.length === 0 && (
            <div className="eg-empty">
              <Search
                size={27}
                style={{
                  display: "block",
                  margin: "0 auto 10px",
                  opacity: 0.5,
                }}
              />
              <div
                style={{
                  fontWeight: 750,
                  color: "var(--eg-text)",
                  marginBottom: 7,
                }}
              >
                No governance domains found
              </div>
              Try changing your search or filters.
              <div>
                <button
                  className="eg-btn"
                  style={{ marginTop: 14 }}
                  onClick={resetFilters}
                >
                  Clear filters
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="eg-footer">
          <span>
            Showing {filteredDomains.length} of {domains.length}{" "}
            domains
          </span>
          <span>Local demonstration data</span>
        </div>
      </section>

      <section className="eg-principles">
        <div className="eg-principle">
          <div className="eg-principle-icon">
            <Users size={17} />
          </div>
          <div>
            <div className="eg-principle-title">
              Clear accountability
            </div>
            <div className="eg-principle-text">
              Assign an owner and executive sponsor to each
              governance domain.
            </div>
          </div>
        </div>

        <div className="eg-principle">
          <div className="eg-principle-icon">
            <Target size={17} />
          </div>
          <div>
            <div className="eg-principle-title">
              Risk-based oversight
            </div>
            <div className="eg-principle-text">
              Prioritize governance work according to the
              domain&apos;s recorded risk.
            </div>
          </div>
        </div>

        <div className="eg-principle">
          <div className="eg-principle-icon">
            <FileText size={17} />
          </div>
          <div>
            <div className="eg-principle-title">
              Review evidence
            </div>
            <div className="eg-principle-text">
              Maintain review dates, action counts, and
              supporting documentation.
            </div>
          </div>
        </div>

        <div className="eg-principle">
          <div className="eg-principle-icon">
            <Globe2 size={17} />
          </div>
          <div>
            <div className="eg-principle-title">
              Enterprise coordination
            </div>
            <div className="eg-principle-text">
              Coordinate responsibilities across departments
              and business functions.
            </div>
          </div>
        </div>
      </section>

      {showCreateModal && (
        <div
          className="eg-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setShowCreateModal(false);
            }
          }}
        >
          <section
            className="eg-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="eg-create-title"
          >
            <div className="eg-modal-header">
              <div>
                <h2 id="eg-create-title">
                  Add governance domain
                </h2>
                <p>
                  Define the domain, its accountable owner, and
                  review responsibilities.
                </p>
              </div>

              <button
                className="eg-close"
                onClick={() => setShowCreateModal(false)}
                aria-label="Close dialog"
              >
                <X size={17} />
              </button>
            </div>

            <form
              className="eg-form"
              onSubmit={createDomain}
            >
              <div className="eg-form-grid">
                <div className="eg-field">
                  <label htmlFor="eg-name">Domain name *</label>
                  <input
                    id="eg-name"
                    required
                    value={form.name}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        name: event.target.value,
                      })
                    }
                    placeholder="e.g. Financial Governance"
                  />
                </div>

                <div className="eg-field">
                  <label htmlFor="eg-department">
                    Department
                  </label>
                  <select
                    id="eg-department"
                    value={form.department}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        department: event.target.value,
                      })
                    }
                  >
                    {departmentOptions.map((department) => (
                      <option key={department} value={department}>
                        {department}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="eg-field">
                  <label htmlFor="eg-owner">
                    Accountable owner *
                  </label>
                  <input
                    id="eg-owner"
                    required
                    value={form.owner}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        owner: event.target.value,
                      })
                    }
                    placeholder="Owner role or team"
                  />
                </div>

                <div className="eg-field">
                  <label htmlFor="eg-sponsor">
                    Executive sponsor
                  </label>
                  <input
                    id="eg-sponsor"
                    value={form.executiveSponsor}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        executiveSponsor: event.target.value,
                      })
                    }
                    placeholder="Executive role"
                  />
                </div>

                <div className="eg-field">
                  <label htmlFor="eg-risk">
                    Risk level
                  </label>
                  <select
                    id="eg-risk"
                    value={form.risk}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        risk: event.target.value as DomainRisk,
                      })
                    }
                  >
                    {riskOptions.map((risk) => (
                      <option key={risk} value={risk}>
                        {risk}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="eg-field">
                  <label htmlFor="eg-status">
                    Initial status
                  </label>
                  <select
                    id="eg-status"
                    value={form.status}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        status: event.target.value as DomainStatus,
                      })
                    }
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="eg-field">
                  <label htmlFor="eg-controls">
                    Total controls
                  </label>
                  <input
                    id="eg-controls"
                    type="number"
                    min="0"
                    step="1"
                    value={form.controls}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        controls: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="eg-field">
                  <label htmlFor="eg-next-review">
                    Next review date
                  </label>
                  <input
                    id="eg-next-review"
                    type="date"
                    value={form.nextReview}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        nextReview: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="eg-field">
                  <label htmlFor="eg-last-review">
                    Last review date
                  </label>
                  <input
                    id="eg-last-review"
                    type="date"
                    value={form.lastReview}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        lastReview: event.target.value,
                      })
                    }
                  />
                </div>

                <div className="eg-field eg-field-full">
                  <label htmlFor="eg-description">
                    Description
                  </label>
                  <textarea
                    id="eg-description"
                    value={form.description}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        description: event.target.value,
                      })
                    }
                    placeholder="Explain the scope and purpose of this domain..."
                  />
                </div>
              </div>

              <div className="eg-modal-actions">
                <button
                  type="button"
                  className="eg-btn"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="eg-btn eg-btn-primary"
                >
                  <Plus size={15} />
                  Create domain
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {selectedDomain && (
        <div
          className="eg-modal-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedDomain(null);
            }
          }}
        >
          <section
            className="eg-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="eg-detail-title"
          >
            <div className="eg-modal-header">
              <div>
                <h2 id="eg-detail-title">
                  {selectedDomain.name}
                </h2>
                <p>
                  {selectedDomain.id} · Enterprise governance
                  domain
                </p>
              </div>

              <button
                className="eg-close"
                onClick={() => setSelectedDomain(null)}
                aria-label="Close details"
              >
                <X size={17} />
              </button>
            </div>

            <div className="eg-detail-body">
              <p
                style={{
                  color: "var(--eg-muted)",
                  fontSize: 12,
                  lineHeight: 1.7,
                  margin: "0 0 19px",
                }}
              >
                {selectedDomain.description}
              </p>

              <div className="eg-detail-grid">
                <div className="eg-detail-item">
                  <div className="eg-detail-label">
                    Accountable owner
                  </div>
                  <div className="eg-detail-value">
                    {selectedDomain.owner}
                  </div>
                </div>

                <div className="eg-detail-item">
                  <div className="eg-detail-label">
                    Department
                  </div>
                  <div className="eg-detail-value">
                    {selectedDomain.department}
                  </div>
                </div>

                <div className="eg-detail-item">
                  <div className="eg-detail-label">
                    Executive sponsor
                  </div>
                  <div className="eg-detail-value">
                    {selectedDomain.executiveSponsor}
                  </div>
                </div>

                <div className="eg-detail-item">
                  <div className="eg-detail-label">
                    Controls implemented
                  </div>
                  <div className="eg-detail-value">
                    {selectedDomain.implemented} of{" "}
                    {selectedDomain.controls}
                  </div>
                </div>

                <div className="eg-detail-item">
                  <div className="eg-detail-label">
                    Open actions
                  </div>
                  <div className="eg-detail-value">
                    {selectedDomain.openActions}
                  </div>
                </div>

                <div className="eg-detail-item">
                  <div className="eg-detail-label">
                    Last review
                  </div>
                  <div className="eg-detail-value">
                    {formatDate(selectedDomain.lastReview)}
                  </div>
                </div>
              </div>

              <div className="eg-objectives">
                <h3
                  style={{
                    fontSize: 13,
                    margin: "0 0 3px",
                  }}
                >
                  Governance objectives
                </h3>

                {selectedDomain.objectives.length > 0 ? (
                  selectedDomain.objectives.map(
                    (objective) => (
                      <div
                        className="eg-objective"
                        key={objective}
                      >
                        <CheckCircle2
                          size={15}
                          color="#4169e1"
                          style={{
                            flexShrink: 0,
                            marginTop: 1,
                          }}
                        />
                        <span>{objective}</span>
                      </div>
                    ),
                  )
                ) : (
                  <p
                    style={{
                      color: "var(--eg-muted)",
                      fontSize: 11,
                      lineHeight: 1.6,
                    }}
                  >
                    No objectives have been added to this domain yet.
                  </p>
                )}
              </div>

              <div
                style={{
                  marginTop: 22,
                  paddingTop: 19,
                  borderTop: "1px solid var(--eg-border)",
                }}
              >
                <h3
                  style={{
                    fontSize: 13,
                    margin: "0 0 13px",
                  }}
                >
                  Update governance record
                </h3>

                <div className="eg-form-grid">
                  <div className="eg-field">
                    <label htmlFor="eg-edit-owner">
                      Accountable owner
                    </label>
                    <input
                      id="eg-edit-owner"
                      value={selectedDomain.owner}
                      onChange={(event) =>
                        updateDomain(selectedDomain.id, {
                          owner: event.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="eg-field">
                    <label htmlFor="eg-edit-sponsor">
                      Executive sponsor
                    </label>
                    <input
                      id="eg-edit-sponsor"
                      value={selectedDomain.executiveSponsor}
                      onChange={(event) =>
                        updateDomain(selectedDomain.id, {
                          executiveSponsor: event.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="eg-field">
                    <label htmlFor="eg-edit-risk">
                      Risk level
                    </label>
                    <select
                      id="eg-edit-risk"
                      value={selectedDomain.risk}
                      onChange={(event) =>
                        updateDomain(selectedDomain.id, {
                          risk: event.target.value as DomainRisk,
                        })
                      }
                    >
                      {riskOptions.map((risk) => (
                        <option key={risk} value={risk}>
                          {risk}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="eg-field">
                    <label htmlFor="eg-edit-status">
                      Status
                    </label>
                    <select
                      id="eg-edit-status"
                      value={selectedDomain.status}
                      onChange={(event) =>
                        updateDomain(selectedDomain.id, {
                          status: event.target.value as DomainStatus,
                        })
                      }
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="eg-field">
                    <label htmlFor="eg-edit-implemented">
                      Implemented controls
                    </label>
                    <input
                      id="eg-edit-implemented"
                      type="number"
                      min="0"
                      max={selectedDomain.controls}
                      value={selectedDomain.implemented}
                      onChange={(event) => {
                        const value = Number(event.target.value);

                        if (
                          Number.isInteger(value) &&
                          value >= 0 &&
                          value <= selectedDomain.controls
                        ) {
                          updateDomain(selectedDomain.id, {
                            implemented: value,
                          });
                        }
                      }}
                    />
                  </div>

                  <div className="eg-field">
                    <label htmlFor="eg-edit-actions">
                      Open actions
                    </label>
                    <input
                      id="eg-edit-actions"
                      type="number"
                      min="0"
                      step="1"
                      value={selectedDomain.openActions}
                      onChange={(event) => {
                        const value = Number(event.target.value);

                        if (
                          Number.isInteger(value) &&
                          value >= 0
                        ) {
                          updateDomain(selectedDomain.id, {
                            openActions: value,
                          });
                        }
                      }}
                    />
                  </div>

                  <div className="eg-field">
                    <label htmlFor="eg-edit-review">
                      Next review date
                    </label>
                    <input
                      id="eg-edit-review"
                      type="date"
                      value={selectedDomain.nextReview}
                      onChange={(event) =>
                        updateDomain(selectedDomain.id, {
                          nextReview: event.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="eg-modal-actions">
                <button
                  className="eg-btn"
                  onClick={() => setSelectedDomain(null)}
                >
                  Close
                </button>

                <button
                  className="eg-btn eg-btn-primary"
                  onClick={() => {
                    notify("Domain record updated locally.");
                    setSelectedDomain(null);
                  }}
                >
                  <Check size={15} />
                  Save changes
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {notification && (
        <div className="eg-toast" role="status">
          <CheckCircle2 size={17} color="#7ce2a4" />
          {notification}
        </div>
      )}
    </main>
  );
}