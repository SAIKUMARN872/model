
"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ShieldCheck,
  Search,
  Plus,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  MoreHorizontal,
  X,
  ChevronDown,
  LockKeyhole,
  Download,
  Eye,
  Pencil,
  Power,
  Filter,
  ShieldAlert,
  CircleCheck,
  Activity,
} from "lucide-react";

type PolicyStatus = "Active" | "Draft" | "Review Required" | "Disabled";
type PolicyCategory =
  | "Access Control"
  | "Data Protection"
  | "AI Governance"
  | "Network Security"
  | "Compliance";

type Policy = {
  id: string;
  name: string;
  description: string;
  category: PolicyCategory;
  status: PolicyStatus;
  owner: string;
  updated: string;
  version: string;
  rules: number;
  enforcement: string;
};

const initialPolicies: Policy[] = [
  {
    id: "POL-001",
    name: "Role-Based Access Control",
    description:
      "Restricts workspace and resource access according to assigned roles and permissions.",
    category: "Access Control",
    status: "Active",
    owner: "Security Team",
    updated: "Nov 02, 2026",
    version: "v2.4",
    rules: 12,
    enforcement: "Enforced",
  },
  {
    id: "POL-002",
    name: "Sensitive Data Protection",
    description:
      "Defines safeguards for sensitive data submitted to AI models, tools, and connected services.",
    category: "Data Protection",
    status: "Active",
    owner: "Platform Team",
    updated: "Nov 01, 2026",
    version: "v1.8",
    rules: 9,
    enforcement: "Enforced",
  },
  {
    id: "POL-003",
    name: "AI Model Usage Policy",
    description:
      "Establishes approved model usage, provider restrictions, and responsible AI requirements.",
    category: "AI Governance",
    status: "Review Required",
    owner: "AI Governance",
    updated: "Oct 29, 2026",
    version: "v1.3",
    rules: 15,
    enforcement: "Partially enforced",
  },
  {
    id: "POL-004",
    name: "Network Access Restrictions",
    description:
      "Controls access to internal services and limits connections to approved network resources.",
    category: "Network Security",
    status: "Active",
    owner: "Infrastructure",
    updated: "Oct 28, 2026",
    version: "v2.1",
    rules: 8,
    enforcement: "Enforced",
  },
  {
    id: "POL-005",
    name: "Audit Log Retention",
    description:
      "Defines audit log retention periods, access permissions, and review requirements.",
    category: "Compliance",
    status: "Draft",
    owner: "Compliance Team",
    updated: "Oct 27, 2026",
    version: "v1.0",
    rules: 6,
    enforcement: "Not enforced",
  },
  {
    id: "POL-006",
    name: "API Key and Secret Management",
    description:
      "Sets requirements for API key storage, rotation, revocation, and secret handling.",
    category: "Access Control",
    status: "Active",
    owner: "Platform Team",
    updated: "Oct 25, 2026",
    version: "v1.6",
    rules: 10,
    enforcement: "Enforced",
  },
  {
    id: "POL-007",
    name: "Browser Automation Guardrails",
    description:
      "Defines approval and access requirements for automated browser actions and external websites.",
    category: "AI Governance",
    status: "Disabled",
    owner: "Automation Team",
    updated: "Oct 22, 2026",
    version: "v1.1",
    rules: 7,
    enforcement: "Not enforced",
  },
];

const categories: PolicyCategory[] = [
  "Access Control",
  "Data Protection",
  "AI Governance",
  "Network Security",
  "Compliance",
];

const statusOptions = [
  "All statuses",
  "Active",
  "Draft",
  "Review Required",
  "Disabled",
];

const categoryOptions = ["All categories", ...categories];

function StatusBadge({ status }: { status: PolicyStatus }) {
  return (
    <span className={`status-badge status-${status.toLowerCase().replaceAll(" ", "-")}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}

function MetricCard({
  icon,
  label,
  value,
  detail,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  detail: string;
  tone: string;
}) {
  return (
    <div className="metric-card">
      <div className="metric-top">
        <span className={`metric-icon ${tone}`}>{icon}</span>
        <span className="metric-detail">{detail}</span>
      </div>
      <div className="metric-value">{value}</div>
      <div className="metric-label">{label}</div>
    </div>
  );
}

export default function SecurityPoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>(initialPolicies);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [notice, setNotice] = useState("");
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newCategory, setNewCategory] = useState<PolicyCategory>("Access Control");
  const [newOwner, setNewOwner] = useState("Security Team");
  const [newRules, setNewRules] = useState("5");

  const filteredPolicies = useMemo(() => {
    const term = search.trim().toLowerCase();

    return policies.filter((policy) => {
      const matchesSearch =
        !term ||
        policy.name.toLowerCase().includes(term) ||
        policy.id.toLowerCase().includes(term) ||
        policy.description.toLowerCase().includes(term) ||
        policy.owner.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All statuses" || policy.status === statusFilter;

      const matchesCategory =
        categoryFilter === "All categories" ||
        policy.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [policies, search, statusFilter, categoryFilter]);

  const activeCount = policies.filter((p) => p.status === "Active").length;
  const reviewCount = policies.filter((p) => p.status === "Review Required").length;
  const draftCount = policies.filter((p) => p.status === "Draft").length;
  const enforcedCount = policies.filter((p) => p.enforcement === "Enforced").length;

  function notify(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 3000);
  }

  function togglePolicy(policyId: string) {
    setPolicies((current) =>
      current.map((policy) => {
        if (policy.id !== policyId) return policy;

        const nextStatus: PolicyStatus =
          policy.status === "Active" ? "Disabled" : "Active";

        return {
          ...policy,
          status: nextStatus,
          enforcement: nextStatus === "Active" ? "Enforced" : "Not enforced",
          updated: "Nov 03, 2026",
        };
      })
    );

    setSelectedPolicy((current) => {
      if (!current || current.id !== policyId) return current;

      const nextStatus: PolicyStatus =
        current.status === "Active" ? "Disabled" : "Active";

      return {
        ...current,
        status: nextStatus,
        enforcement: nextStatus === "Active" ? "Enforced" : "Not enforced",
        updated: "Nov 03, 2026",
      };
    });

    notify("Policy status updated in this demo.");
  }

  function createPolicy(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!newName.trim()) {
      notify("Enter a policy name.");
      return;
    }

    const policy: Policy = {
      id: `POL-${String(policies.length + 1).padStart(3, "0")}`,
      name: newName.trim(),
      description: newDescription.trim() || "No description provided.",
      category: newCategory,
      status: "Draft",
      owner: newOwner.trim() || "Security Team",
      updated: "Nov 03, 2026",
      version: "v1.0",
      rules: Math.max(0, Number(newRules) || 0),
      enforcement: "Not enforced",
    };

    setPolicies((current) => [policy, ...current]);
    setShowCreate(false);
    setNewName("");
    setNewDescription("");
    setNewCategory("Access Control");
    setNewOwner("Security Team");
    setNewRules("5");
    setSearch("");
    setStatusFilter("All statuses");
    setCategoryFilter("All categories");
    notify("Draft policy created locally.");
  }

  function exportPolicies() {
    const headers = [
      "ID",
      "Name",
      "Category",
      "Status",
      "Owner",
      "Version",
      "Rules",
      "Enforcement",
      "Updated",
    ];

    const rows = filteredPolicies.map((p) => [
      p.id,
      p.name,
      p.category,
      p.status,
      p.owner,
      p.version,
      String(p.rules),
      p.enforcement,
      p.updated,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${cell.replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-security-policies.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    notify("Policy list exported.");
  }

  return (
    <main className="security-page">
      <style jsx global>{`
        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          background: #f6f8fc;
          color: #172033;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
            "Segoe UI", sans-serif;
        }

        button,
        input,
        select,
        textarea {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .security-page {
          min-height: 100vh;
          padding: 30px;
          background: #f6f8fc;
        }

        .security-container {
          max-width: 1500px;
          margin: 0 auto;
        }

        .security-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #8792a5;
          font-size: 12px;
          margin-bottom: 22px;
        }

        .security-breadcrumb span:last-child {
          color: #4b5870;
          font-weight: 600;
        }

        .security-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 26px;
        }

        .security-title-row {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .security-title-icon {
          width: 48px;
          height: 48px;
          border-radius: 15px;
          display: grid;
          place-items: center;
          color: #315fea;
          background: #e8eeff;
          border: 1px solid #d9e3ff;
          flex-shrink: 0;
        }

        .security-header h1 {
          margin: 0;
          font-size: 27px;
          letter-spacing: -0.8px;
          line-height: 1.2;
          font-weight: 750;
        }

        .security-subtitle {
          color: #78849a;
          font-size: 13px;
          line-height: 1.6;
          margin: 8px 0 0;
          max-width: 650px;
        }

        .security-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 40px;
          border-radius: 10px;
          border: 1px solid #dce3ee;
          background: white;
          color: #34415a;
          padding: 0 14px;
          font-size: 12px;
          font-weight: 650;
          transition: 0.15s ease;
          white-space: nowrap;
        }

        .btn:hover {
          border-color: #aebfe9;
          background: #f8faff;
        }

        .btn-primary {
          color: white;
          background: #315fea;
          border-color: #315fea;
          box-shadow: 0 5px 12px #315fea1b;
        }

        .btn-primary:hover {
          background: #244ed0;
          border-color: #244ed0;
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 23px;
        }

        .metric-card {
          min-width: 0;
          padding: 18px;
          border-radius: 15px;
          background: white;
          border: 1px solid #e7ebf3;
          box-shadow: 0 2px 5px #24324d05;
        }

        .metric-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }

        .metric-icon {
          width: 35px;
          height: 35px;
          display: grid;
          place-items: center;
          border-radius: 11px;
        }

        .tone-blue {
          color: #315fea;
          background: #edf2ff;
        }

        .tone-green {
          color: #16845c;
          background: #e8f8f0;
        }

        .tone-amber {
          color: #b77912;
          background: #fff5df;
        }

        .tone-purple {
          color: #7855cf;
          background: #f1ebff;
        }

        .metric-detail {
          font-size: 10px;
          color: #8792a5;
          text-align: right;
        }

        .metric-value {
          margin-top: 17px;
          font-size: 28px;
          letter-spacing: -0.7px;
          font-weight: 750;
          color: #1b2740;
        }

        .metric-label {
          margin-top: 5px;
          color: #7d899e;
          font-size: 12px;
        }

        .policy-notice {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 15px 17px;
          margin-bottom: 22px;
          border: 1px solid #f4dfb4;
          border-radius: 13px;
          background: #fffbf2;
          color: #805b19;
        }

        .policy-notice strong {
          display: block;
          font-size: 12px;
          margin-bottom: 4px;
        }

        .policy-notice p {
          margin: 0;
          font-size: 11px;
          line-height: 1.55;
          color: #927442;
        }

        .policy-notice-icon {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .section-card {
          background: white;
          border: 1px solid #e5eaf2;
          border-radius: 16px;
          box-shadow: 0 3px 8px #24324d04;
          overflow: hidden;
        }

        .section-heading {
          padding: 20px 22px 17px;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 15px;
          border-bottom: 1px solid #edf0f6;
        }

        .section-heading h2 {
          font-size: 15px;
          letter-spacing: -0.2px;
          margin: 0;
          color: #202c43;
        }

        .section-heading p {
          font-size: 11px;
          color: #8792a5;
          margin: 6px 0 0;
        }

        .policy-count {
          color: #68758c;
          background: #f3f5f9;
          border: 1px solid #e8ecf3;
          padding: 5px 9px;
          border-radius: 8px;
          font-size: 10px;
          font-weight: 650;
          white-space: nowrap;
        }

        .filters-row {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
          padding: 16px 22px;
          border-bottom: 1px solid #edf0f6;
        }

        .search-box {
          flex: 1;
          min-width: 210px;
          max-width: 420px;
          position: relative;
        }

        .search-box svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a0b3;
        }

        .search-box input {
          width: 100%;
          height: 39px;
          border-radius: 9px;
          border: 1px solid #e0e6ef;
          padding: 0 12px 0 37px;
          outline: none;
          background: #fff;
          font-size: 12px;
          color: #26344d;
        }

        .search-box input:focus,
        .filter-select:focus,
        .form-field input:focus,
        .form-field textarea:focus,
        .form-field select:focus {
          border-color: #88a2f8;
          box-shadow: 0 0 0 3px #315fea12;
        }

        .filter-select {
          height: 39px;
          min-width: 145px;
          border: 1px solid #e0e6ef;
          border-radius: 9px;
          padding: 0 28px 0 11px;
          outline: none;
          color: #48566e;
          background: white;
          font-size: 11px;
        }

        .table-scroll {
          width: 100%;
          overflow-x: auto;
        }

        .policy-table {
          width: 100%;
          border-collapse: collapse;
          min-width: 940px;
        }

        .policy-table th {
          padding: 13px 17px;
          text-align: left;
          background: #fafbfe;
          color: #8b96a9;
          border-bottom: 1px solid #edf0f6;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-size: 9px;
          font-weight: 750;
          white-space: nowrap;
        }

        .policy-table td {
          padding: 15px 17px;
          border-bottom: 1px solid #f0f2f7;
          font-size: 11px;
          color: #4c5970;
          vertical-align: middle;
        }

        .policy-table tr:last-child td {
          border-bottom: 0;
        }

        .policy-table tbody tr:hover {
          background: #fafbff;
        }

        .policy-name-cell {
          display: flex;
          align-items: flex-start;
          gap: 11px;
          min-width: 245px;
        }

        .policy-row-icon {
          display: grid;
          place-items: center;
          width: 33px;
          height: 33px;
          flex-shrink: 0;
          color: #4669d8;
          background: #eef2ff;
          border-radius: 10px;
        }

        .policy-name {
          color: #25314a;
          font-size: 11px;
          font-weight: 700;
          margin: 1px 0 5px;
          cursor: pointer;
          text-align: left;
          border: 0;
          padding: 0;
          background: transparent;
        }

        .policy-name:hover {
          color: #315fea;
        }

        .policy-description {
          max-width: 300px;
          color: #8994a6;
          font-size: 10px;
          line-height: 1.5;
        }

        .policy-id {
          color: #8490a4;
          font-size: 10px;
          font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        }

        .category-tag {
          display: inline-flex;
          padding: 5px 8px;
          background: #f3f5fa;
          color: #58657c;
          border-radius: 6px;
          font-size: 9px;
          white-space: nowrap;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 8px;
          border-radius: 6px;
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .status-active {
          color: #16845c;
          background: #e8f8f0;
        }

        .status-draft {
          color: #68758c;
          background: #eff2f7;
        }

        .status-review-required {
          color: #ae7413;
          background: #fff4db;
        }

        .status-disabled {
          color: #c24d58;
          background: #fff0f1;
        }

        .owner-cell {
          color: #536078;
          white-space: nowrap;
        }

        .updated-cell {
          color: #8792a5;
          white-space: nowrap;
          font-size: 10px;
        }

        .row-actions {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .icon-btn {
          width: 30px;
          height: 30px;
          display: inline-grid;
          place-items: center;
          border: 1px solid transparent;
          background: transparent;
          color: #8a96a9;
          border-radius: 8px;
        }

        .icon-btn:hover {
          color: #315fea;
          background: #edf2ff;
          border-color: #dfe7ff;
        }

        .table-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 14px 22px;
          border-top: 1px solid #edf0f6;
          color: #8994a6;
          font-size: 10px;
        }

        .empty-state {
          text-align: center;
          padding: 52px 20px;
          color: #8792a5;
        }

        .empty-state svg {
          margin-bottom: 12px;
          color: #9eabc0;
        }

        .empty-state h3 {
          color: #34415a;
          font-size: 13px;
          margin: 0 0 7px;
        }

        .empty-state p {
          font-size: 11px;
          margin: 0;
        }

        .lower-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.15fr) minmax(300px, 0.85fr);
          gap: 18px;
          margin-top: 20px;
        }

        .activity-list {
          padding: 5px 22px 10px;
        }

        .activity-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 15px 0;
          border-bottom: 1px solid #f0f2f7;
        }

        .activity-item:last-child {
          border-bottom: 0;
        }

        .activity-icon {
          width: 32px;
          height: 32px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          flex-shrink: 0;
          background: #eff3ff;
          color: #4b6ce0;
        }

        .activity-copy {
          flex: 1;
        }

        .activity-copy strong {
          display: block;
          color: #34415a;
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .activity-copy p {
          margin: 0;
          color: #8792a5;
          font-size: 10px;
          line-height: 1.5;
        }

        .activity-time {
          color: #9aa4b4;
          font-size: 9px;
          white-space: nowrap;
        }

        .compliance-content {
          padding: 20px 22px;
        }

        .compliance-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }

        .compliance-row strong {
          font-size: 11px;
          color: #34415a;
        }

        .compliance-row span {
          color: #8792a5;
          font-size: 10px;
        }

        .progress-track {
          height: 7px;
          border-radius: 10px;
          background: #edf0f6;
          overflow: hidden;
          margin: 10px 0 7px;
        }

        .progress-fill {
          height: 100%;
          border-radius: inherit;
          background: #315fea;
          transition: width 0.2s ease;
        }

        .compliance-note {
          display: flex;
          gap: 9px;
          align-items: flex-start;
          margin-top: 22px;
          padding: 12px;
          background: #f5f8ff;
          color: #6e7da0;
          border: 1px solid #e7edff;
          border-radius: 10px;
          font-size: 10px;
          line-height: 1.5;
        }

        .compliance-note svg {
          flex-shrink: 0;
          color: #5475e2;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 100;
          background: #111b31a3;
          backdrop-filter: blur(3px);
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 20px;
        }

        .modal-card {
          width: min(560px, 100%);
          max-height: 90vh;
          overflow-y: auto;
          background: white;
          border-radius: 17px;
          box-shadow: 0 20px 70px #101a3030;
        }

        .modal-header {
          padding: 20px 22px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          border-bottom: 1px solid #edf0f6;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 17px;
          color: #202c43;
        }

        .modal-header p {
          margin: 6px 0 0;
          font-size: 11px;
          color: #8792a5;
          line-height: 1.5;
        }

        .modal-close {
          display: grid;
          place-items: center;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          border: 1px solid #e7ebf3;
          background: white;
          color: #7c879a;
        }

        .modal-body {
          padding: 22px;
        }

        .form-field {
          margin-bottom: 17px;
        }

        .form-field label {
          display: block;
          color: #45536c;
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 7px;
        }

        .form-field input,
        .form-field textarea,
        .form-field select {
          width: 100%;
          border: 1px solid #dfe5ef;
          border-radius: 9px;
          padding: 11px 12px;
          color: #34415a;
          outline: none;
          background: white;
          font-size: 12px;
        }

        .form-field textarea {
          min-height: 90px;
          resize: vertical;
          line-height: 1.5;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
          padding: 16px 22px;
          border-top: 1px solid #edf0f6;
          background: #fbfcfe;
          border-radius: 0 0 17px 17px;
        }

        .detail-panel {
          position: fixed;
          inset: 0 0 0 auto;
          z-index: 110;
          width: min(480px, 100%);
          height: 100vh;
          overflow-y: auto;
          background: white;
          box-shadow: -15px 0 55px #13203a1a;
          border-left: 1px solid #e5eaf2;
        }

        .detail-header {
          padding: 23px;
          border-bottom: 1px solid #edf0f6;
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .detail-heading-icon {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .detail-heading-icon h2 {
          margin: 0;
          font-size: 16px;
          color: #202c43;
        }

        .detail-heading-icon p {
          margin: 5px 0 0;
          color: #8792a5;
          font-size: 10px;
        }

        .detail-content {
          padding: 22px;
        }

        .detail-description {
          color: #748097;
          font-size: 12px;
          line-height: 1.7;
          margin: 0 0 22px;
        }

        .detail-meta {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 24px;
        }

        .detail-meta-item {
          padding: 13px;
          border: 1px solid #e9edf4;
          border-radius: 10px;
          background: #fbfcfe;
        }

        .detail-meta-item span {
          display: block;
          color: #8b96a9;
          font-size: 10px;
          margin-bottom: 7px;
        }

        .detail-meta-item strong {
          color: #34415a;
          font-size: 11px;
        }

        .detail-section-title {
          font-size: 12px;
          color: #34415a;
          font-weight: 750;
          margin: 23px 0 12px;
        }

        .rule-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 0;
          border-bottom: 1px solid #f0f2f7;
          font-size: 11px;
          color: #68758c;
          line-height: 1.5;
        }

        .rule-item:last-child {
          border-bottom: 0;
        }

        .rule-item svg {
          color: #16845c;
          flex-shrink: 0;
          margin-top: 1px;
        }

        .detail-actions {
          display: flex;
          gap: 9px;
          margin-top: 24px;
          flex-wrap: wrap;
        }

        .toast {
          position: fixed;
          z-index: 200;
          bottom: 24px;
          right: 24px;
          display: flex;
          align-items: center;
          gap: 10px;
          max-width: calc(100% - 32px);
          padding: 13px 16px;
          background: #17253e;
          color: white;
          border-radius: 11px;
          box-shadow: 0 10px 35px #17253e30;
          font-size: 12px;
          animation: toast-in 0.2s ease;
        }

        @keyframes toast-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .demo-footer {
          margin-top: 18px;
          color: #9aa4b4;
          font-size: 10px;
          text-align: center;
          line-height: 1.6;
        }

        @media (max-width: 1050px) {
          .security-page {
            padding: 22px;
          }

          .metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .security-header {
            flex-direction: column;
          }

          .lower-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 640px) {
          .security-page {
            padding: 15px;
          }

          .security-header h1 {
            font-size: 22px;
          }

          .security-title-icon {
            width: 42px;
            height: 42px;
          }

          .security-actions {
            width: 100%;
          }

          .security-actions .btn {
            flex: 1;
          }

          .metrics-grid {
            gap: 10px;
          }

          .metric-card {
            padding: 14px;
          }

          .metric-value {
            font-size: 24px;
            margin-top: 13px;
          }

          .metric-detail {
            font-size: 9px;
          }

          .section-heading {
            padding: 17px;
          }

          .filters-row {
            padding: 14px;
          }

          .search-box {
            max-width: none;
            flex-basis: 100%;
          }

          .filter-select {
            flex: 1;
            min-width: 0;
          }

          .table-footer {
            align-items: flex-start;
            flex-direction: column;
            padding: 14px 17px;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .activity-time {
            display: none;
          }

          .detail-meta {
            gap: 8px;
          }
        }
      `}</style>

      <div className="security-container">
        <div className="security-breadcrumb">
          <span>ModelNow</span>
          <span>/</span>
          <span>Security</span>
          <span>/</span>
          <span>Security Policies</span>
        </div>

        <header className="security-header">
          <div className="security-title-row">
            <div className="security-title-icon">
              <ShieldCheck size={25} />
            </div>
            <div>
              <h1>Security Policies</h1>
              <p className="security-subtitle">
                Define, manage, and monitor security policies across your ModelNow
                workspace and AI services.
              </p>
            </div>
          </div>

          <div className="security-actions">
            <button className="btn" onClick={exportPolicies}>
              <Download size={15} />
              Export policies
            </button>
            <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
              <Plus size={16} />
              Create policy
            </button>
          </div>
        </header>

        <section className="metrics-grid">
          <MetricCard
            icon={<ShieldCheck size={18} />}
            label="Active policies"
            value={activeCount}
            detail="Currently enabled"
            tone="tone-blue"
          />
          <MetricCard
            icon={<CircleCheck size={18} />}
            label="Enforced policies"
            value={enforcedCount}
            detail="Demo status"
            tone="tone-green"
          />
          <MetricCard
            icon={<AlertTriangle size={18} />}
            label="Require review"
            value={reviewCount}
            detail="Attention needed"
            tone="tone-amber"
          />
          <MetricCard
            icon={<FileText size={18} />}
            label="Draft policies"
            value={draftCount}
            detail="Not yet enforced"
            tone="tone-purple"
          />
        </section>

        {reviewCount > 0 && (
          <div className="policy-notice">
            <AlertTriangle className="policy-notice-icon" size={19} />
            <div>
              <strong>{reviewCount} policy needs review</strong>
              <p>
                Review pending policies before relying on them for production
                security enforcement.
              </p>
            </div>
          </div>
        )}

        <section className="section-card">
          <div className="section-heading">
            <div>
              <h2>Policy inventory</h2>
              <p>Review policy ownership, status, category, and enforcement.</p>
            </div>
            <span className="policy-count">{filteredPolicies.length} policies</span>
          </div>

          <div className="filters-row">
            <div className="search-box">
              <Search size={15} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search policies, IDs, or owners..."
                aria-label="Search security policies"
              />
            </div>

            <select
              className="filter-select"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter by status"
            >
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <select
              className="filter-select"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              aria-label="Filter by category"
            >
              {categoryOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>

            <button
              className="btn"
              onClick={() => {
                setSearch("");
                setStatusFilter("All statuses");
                setCategoryFilter("All categories");
                setShowFilters((current) => !current);
              }}
              title="Reset filters"
            >
              <Filter size={14} />
              Reset
            </button>
          </div>

          {showFilters && (
            <div style={{ padding: "10px 22px", color: "#8792a5", fontSize: 11 }}>
              Filters reset. Use the search field and dropdowns to narrow the policy inventory.
            </div>
          )}

          {filteredPolicies.length === 0 ? (
            <div className="empty-state">
              <Search size={25} />
              <h3>No policies found</h3>
              <p>Try another search term or reset your filters.</p>
            </div>
          ) : (
            <div className="table-scroll">
              <table className="policy-table">
                <thead>
                  <tr>
                    <th>Policy</th>
                    <th>Category</th>
                    <th>Status</th>
                    <th>Owner</th>
                    <th>Updated</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPolicies.map((policy) => (
                    <tr key={policy.id}>
                      <td>
                        <div className="policy-name-cell">
                          <div className="policy-row-icon">
                            <LockKeyhole size={16} />
                          </div>
                          <div>
                            <button
                              className="policy-name"
                              onClick={() => setSelectedPolicy(policy)}
                            >
                              {policy.name}
                            </button>
                            <div className="policy-description">
                              {policy.description}
                            </div>
                            <div className="policy-id" style={{ marginTop: 5 }}>
                              {policy.id} · {policy.version}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-tag">{policy.category}</span>
                      </td>
                      <td>
                        <StatusBadge status={policy.status} />
                      </td>
                      <td className="owner-cell">{policy.owner}</td>
                      <td className="updated-cell">{policy.updated}</td>
                      <td>
                        <div className="row-actions">
                          <button
                            className="icon-btn"
                            title="View policy"
                            aria-label={`View ${policy.name}`}
                            onClick={() => setSelectedPolicy(policy)}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            className="icon-btn"
                            title={policy.status === "Active" ? "Disable policy" : "Enable policy"}
                            aria-label={policy.status === "Active" ? "Disable policy" : "Enable policy"}
                            onClick={() => togglePolicy(policy.id)}
                          >
                            <Power size={15} />
                          </button>
                          <button
                            className="icon-btn"
                            title="More actions"
                            aria-label={`More actions for ${policy.name}`}
                            onClick={() => setSelectedPolicy(policy)}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="table-footer">
            <span>
              Showing {filteredPolicies.length} of {policies.length} policies
            </span>
            <span>Changes are local demo state only</span>
          </div>
        </section>

        <div className="lower-grid">
          <section className="section-card">
            <div className="section-heading">
              <div>
                <h2>Policy activity</h2>
                <p>Example events for the current demo workspace.</p>
              </div>
              <Activity size={17} color="#8491a7" />
            </div>

            <div className="activity-list">
              <div className="activity-item">
                <div className="activity-icon">
                  <Pencil size={15} />
                </div>
                <div className="activity-copy">
                  <strong>AI Model Usage Policy flagged for review</strong>
                  <p>Governance review is required before the next release.</p>
                </div>
                <span className="activity-time">Oct 29</span>
              </div>

              <div className="activity-item">
                <div className="activity-icon">
                  <ShieldCheck size={15} />
                </div>
                <div className="activity-copy">
                  <strong>Sensitive Data Protection remains active</strong>
                  <p>Sample policy status indicates enforcement is enabled.</p>
                </div>
                <span className="activity-time">Nov 01</span>
              </div>

              <div className="activity-item">
                <div className="activity-icon">
                  <FileText size={15} />
                </div>
                <div className="activity-copy">
                  <strong>Audit Log Retention is still a draft</strong>
                  <p>Finalize its settings and review requirements before activation.</p>
                </div>
                <span className="activity-time">Oct 27</span>
              </div>
            </div>
          </section>

          <section className="section-card">
            <div className="section-heading">
              <div>
                <h2>Policy coverage</h2>
                <p>Distribution of policies by category.</p>
              </div>
              <ShieldAlert size={17} color="#8491a7" />
            </div>

            <div className="compliance-content">
              {categories.map((category) => {
                const count = policies.filter((p) => p.category === category).length;
                const percent = policies.length
                  ? Math.round((count / policies.length) * 100)
                  : 0;

                return (
                  <div key={category} style={{ marginBottom: 17 }}>
                    <div className="compliance-row" style={{ marginBottom: 0 }}>
                      <strong>{category}</strong>
                      <span>
                        {count} {count === 1 ? "policy" : "policies"}
                      </span>
                    </div>
                    <div className="progress-track">
                      <div
                        className="progress-fill"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              <div className="compliance-note">
                <Clock3 size={15} />
                <span>
                  This coverage view summarizes the sample policies shown here.
                  It is not a verified compliance assessment.
                </span>
              </div>
            </div>
          </section>
        </div>

        <p className="demo-footer">
          ModelNow Security Policies · Prototype interface · Connect your policy
          service and audit database before using this page for production enforcement.
        </p>
      </div>

      {showCreate && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowCreate(false);
          }}
        >
          <div
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="create-policy-title"
          >
            <div className="modal-header">
              <div>
                <h2 id="create-policy-title">Create security policy</h2>
                <p>Create a draft policy for the ModelNow workspace.</p>
              </div>
              <button
                className="modal-close"
                onClick={() => setShowCreate(false)}
                aria-label="Close dialog"
              >
                <X size={17} />
              </button>
            </div>

            <form onSubmit={createPolicy}>
              <div className="modal-body">
                <div className="form-field">
                  <label htmlFor="policy-name">Policy name *</label>
                  <input
                    id="policy-name"
                    value={newName}
                    onChange={(event) => setNewName(event.target.value)}
                    placeholder="e.g. Model Access Restrictions"
                    required
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="policy-description">Description</label>
                  <textarea
                    id="policy-description"
                    value={newDescription}
                    onChange={(event) => setNewDescription(event.target.value)}
                    placeholder="Describe the policy objective and scope..."
                  />
                </div>

                <div className="form-grid">
                  <div className="form-field">
                    <label htmlFor="policy-category">Category</label>
                    <select
                      id="policy-category"
                      value={newCategory}
                      onChange={(event) =>
                        setNewCategory(event.target.value as PolicyCategory)
                      }
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-field">
                    <label htmlFor="policy-rules">Number of rules</label>
                    <input
                      id="policy-rules"
                      type="number"
                      min="0"
                      max="999"
                      value={newRules}
                      onChange={(event) => setNewRules(event.target.value)}
                    />
                  </div>
                </div>

                <div className="form-field" style={{ marginBottom: 0 }}>
                  <label htmlFor="policy-owner">Policy owner</label>
                  <input
                    id="policy-owner"
                    value={newOwner}
                    onChange={(event) => setNewOwner(event.target.value)}
                    placeholder="Team or owner"
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Plus size={15} />
                  Create draft
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedPolicy && (
        <>
          <div
            role="presentation"
            onClick={() => setSelectedPolicy(null)}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 105,
              background: "#111b3150",
            }}
          />
          <aside
            className="detail-panel"
            role="dialog"
            aria-modal="true"
            aria-labelledby="policy-detail-title"
          >
            <div className="detail-header">
              <div className="detail-heading-icon">
                <div className="security-title-icon">
                  <ShieldCheck size={22} />
                </div>
                <div>
                  <h2 id="policy-detail-title">{selectedPolicy.name}</h2>
                  <p>
                    {selectedPolicy.id} · {selectedPolicy.version}
                  </p>
                </div>
              </div>
              <button
                className="modal-close"
                onClick={() => setSelectedPolicy(null)}
                aria-label="Close policy details"
              >
                <X size={17} />
              </button>
            </div>

            <div className="detail-content">
              <StatusBadge status={selectedPolicy.status} />

              <p className="detail-description" style={{ marginTop: 16 }}>
                {selectedPolicy.description}
              </p>

              <div className="detail-meta">
                <div className="detail-meta-item">
                  <span>Category</span>
                  <strong>{selectedPolicy.category}</strong>
                </div>
                <div className="detail-meta-item">
                  <span>Owner</span>
                  <strong>{selectedPolicy.owner}</strong>
                </div>
                <div className="detail-meta-item">
                  <span>Rules</span>
                  <strong>{selectedPolicy.rules}</strong>
                </div>
                <div className="detail-meta-item">
                  <span>Enforcement</span>
                  <strong>{selectedPolicy.enforcement}</strong>
                </div>
                <div className="detail-meta-item">
                  <span>Version</span>
                  <strong>{selectedPolicy.version}</strong>
                </div>
                <div className="detail-meta-item">
                  <span>Last updated</span>
                  <strong>{selectedPolicy.updated}</strong>
                </div>
              </div>

              <h3 className="detail-section-title">Policy checklist</h3>
              <div className="rule-item">
                <CheckCircle2 size={16} />
                <span>Policy owner and category are recorded.</span>
              </div>
              <div className="rule-item">
                <CheckCircle2 size={16} />
                <span>Policy description is available for review.</span>
              </div>
              <div className="rule-item">
                <CheckCircle2 size={16} />
                <span>Policy status is tracked in the local interface.</span>
              </div>
              <div className="rule-item">
                <AlertTriangle size={16} color="#b77912" />
                <span>
                  Rule evaluation and enforcement must be implemented in the
                  backend before this policy can protect real resources.
                </span>
              </div>

              <div className="detail-actions">
                <button
                  className="btn btn-primary"
                  onClick={() => togglePolicy(selectedPolicy.id)}
                >
                  <Power size={14} />
                  {selectedPolicy.status === "Active" ? "Disable policy" : "Enable policy"}
                </button>
                <button
                  className="btn"
                  onClick={() => {
                    setSelectedPolicy(null);
                    setShowCreate(true);
                    setNewName(`${selectedPolicy.name} - Copy`);
                    setNewDescription(selectedPolicy.description);
                    setNewCategory(selectedPolicy.category);
                    setNewOwner(selectedPolicy.owner);
                    setNewRules(String(selectedPolicy.rules));
                  }}
                >
                  <Pencil size={14} />
                  Create a copy
                </button>
              </div>
            </div>
          </aside>
        </>
      )}

      {notice && (
        <div className="toast" role="status">
          <CheckCircle2 size={17} color="#73e0ac" />
          {notice}
        </div>
      )}
    </main>
  );
}
