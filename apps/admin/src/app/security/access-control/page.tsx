
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  CheckCircle2,
  Eye,
  LockKeyhole,
  MoreHorizontal,
  Plus,
  Search,
  Shield,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

type AccessStatus = "Active" | "Pending" | "Suspended";
type AccessLevel = "Full access" | "Read only" | "Read & write" | "Custom";
type PrincipalType = "User" | "Role" | "Service account";

type AccessRule = {
  id: string;
  name: string;
  principal: string;
  principalType: PrincipalType;
  resource: string;
  level: AccessLevel;
  scope: string;
  status: AccessStatus;
  updated: string;
};

const initialRules: AccessRule[] = [
  {
    id: "ACL-1001",
    name: "Platform administration",
    principal: "Super Admin",
    principalType: "Role",
    resource: "All platform resources",
    level: "Full access",
    scope: "Organization",
    status: "Active",
    updated: "Nov 2, 2026",
  },
  {
    id: "ACL-1002",
    name: "Model operations",
    principal: "Platform Engineers",
    principalType: "Role",
    resource: "Model Gateway",
    level: "Read & write",
    scope: "Workspace",
    status: "Active",
    updated: "Nov 2, 2026",
  },
  {
    id: "ACL-1003",
    name: "Usage reporting",
    principal: "Analytics Team",
    principalType: "Role",
    resource: "Usage & Analytics",
    level: "Read only",
    scope: "Organization",
    status: "Active",
    updated: "Nov 1, 2026",
  },
  {
    id: "ACL-1004",
    name: "Knowledge administration",
    principal: "Knowledge Admin",
    principalType: "Role",
    resource: "Knowledge Hub",
    level: "Read & write",
    scope: "Workspace",
    status: "Active",
    updated: "Oct 31, 2026",
  },
  {
    id: "ACL-1005",
    name: "Automation service",
    principal: "browser-agent-prod",
    principalType: "Service account",
    resource: "Browser Automation",
    level: "Custom",
    scope: "Project",
    status: "Pending",
    updated: "Oct 30, 2026",
  },
  {
    id: "ACL-1006",
    name: "Billing visibility",
    principal: "Finance Team",
    principalType: "Role",
    resource: "Billing & Plans",
    level: "Read only",
    scope: "Organization",
    status: "Active",
    updated: "Oct 29, 2026",
  },
  {
    id: "ACL-1007",
    name: "Legacy integration",
    principal: "legacy-integration",
    principalType: "Service account",
    resource: "API Gateway",
    level: "Full access",
    scope: "Organization",
    status: "Suspended",
    updated: "Oct 28, 2026",
  },
];

const emptyRule: AccessRule = {
  id: "",
  name: "",
  principal: "",
  principalType: "User",
  resource: "Model Gateway",
  level: "Read only",
  scope: "Workspace",
  status: "Active",
  updated: "Just now",
};

const resources = [
  "All platform resources",
  "Model Gateway",
  "Usage & Analytics",
  "Knowledge Hub",
  "Browser Automation",
  "Billing & Plans",
  "API Gateway",
  "Fine-tuning",
  "Projects",
];

const inputClass = "ac-input";

export default function AccessControlPage() {
  const [rules, setRules] = useState<AccessRule[]>(initialRules);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [levelFilter, setLevelFilter] = useState("All access levels");
  const [selected, setSelected] = useState<AccessRule | null>(null);
  const [draft, setDraft] = useState<AccessRule>(emptyRule);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const filteredRules = useMemo(() => {
    const query = search.trim().toLowerCase();

    return rules.filter((rule) => {
      const matchesSearch =
        !query ||
        [
          rule.id,
          rule.name,
          rule.principal,
          rule.principalType,
          rule.resource,
          rule.scope,
        ].some((value) => value.toLowerCase().includes(query));

      return (
        matchesSearch &&
        (statusFilter === "All statuses" ||
          rule.status === statusFilter) &&
        (levelFilter === "All access levels" ||
          rule.level === levelFilter)
      );
    });
  }, [rules, search, statusFilter, levelFilter]);

  const activeCount = rules.filter(
    (rule) => rule.status === "Active"
  ).length;

  const pendingCount = rules.filter(
    (rule) => rule.status === "Pending"
  ).length;

  const privilegedCount = rules.filter(
    (rule) =>
      rule.level === "Full access" && rule.status === "Active"
  ).length;

  function openCreate() {
    setEditingId(null);
    setDraft({ ...emptyRule });
    setError("");
    setMenuId(null);
    setFormOpen(true);
  }

  function openEdit(rule: AccessRule) {
    setEditingId(rule.id);
    setDraft({ ...rule });
    setError("");
    setMenuId(null);
    setSelected(null);
    setFormOpen(true);
  }

  function saveRule() {
    if (!draft.name.trim() || !draft.principal.trim()) {
      setError(
        "Enter a rule name and a user, role, or service account."
      );
      return;
    }

    const duplicate = rules.some(
      (rule) =>
        rule.name.trim().toLowerCase() ===
          draft.name.trim().toLowerCase() &&
        rule.id !== editingId
    );

    if (duplicate) {
      setError("A rule with this name already exists.");
      return;
    }

    const saved: AccessRule = {
      ...draft,
      id:
        editingId ??
        `ACL-${Date.now().toString().slice(-6)}`,
      name: draft.name.trim(),
      principal: draft.principal.trim(),
      updated: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    };

    if (editingId) {
      setRules((current) =>
        current.map((rule) =>
          rule.id === editingId ? saved : rule
        )
      );
      setNotice("Access rule updated in the local demo.");
    } else {
      setRules((current) => [saved, ...current]);
      setNotice("Access rule created in the local demo.");
    }

    setFormOpen(false);
    setError("");
  }

  function toggleStatus(rule: AccessRule) {
    const status: AccessStatus =
      rule.status === "Active" ? "Suspended" : "Active";

    const updatedRule = {
      ...rule,
      status,
      updated: "Just now",
    };

    setRules((current) =>
      current.map((item) =>
        item.id === rule.id ? updatedRule : item
      )
    );

    setSelected((current) =>
      current?.id === rule.id ? updatedRule : current
    );

    setMenuId(null);
    setNotice(
      `${rule.id} marked ${status.toLowerCase()} in the local demo.`
    );
  }

  function exportCsv() {
    const headers = [
      "Rule ID",
      "Rule name",
      "Principal",
      "Principal type",
      "Resource",
      "Access level",
      "Scope",
      "Status",
      "Updated",
    ];

    const rows = filteredRules.map((rule) => [
      rule.id,
      rule.name,
      rule.principal,
      rule.principalType,
      rule.resource,
      rule.level,
      rule.scope,
      rule.status,
      rule.updated,
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row
          .map(
            (cell) =>
              `"${String(cell).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "modelnow-access-control.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setNotice("Filtered access rules exported to CSV.");
  }

  const metrics = [
    {
      title: "Total access rules",
      value: rules.length,
      detail: "Configured demo rules",
      icon: Shield,
      color: "#315fea",
      bg: "#eff6ff",
    },
    {
      title: "Active rules",
      value: activeCount,
      detail: "Marked active",
      icon: ShieldCheck,
      color: "#15803d",
      bg: "#f0fdf4",
    },
    {
      title: "Pending reviews",
      value: pendingCount,
      detail: "Require administrator review",
      icon: Activity,
      color: "#c2410c",
      bg: "#fff7ed",
    },
    {
      title: "Privileged rules",
      value: privilegedCount,
      detail: "Active full-access rules",
      icon: LockKeyhole,
      color: "#7c3aed",
      bg: "#f5f3ff",
    },
  ];

  return (
    <main className="ac-page">
      <style>{`
        .ac-page {
          min-height: 100vh;
          padding: 30px;
          background: #f7f8fc;
          color: #111827;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 14px;
        }
        .ac-page * { box-sizing: border-box; }
        .ac-container { max-width: 1500px; margin: 0 auto; }
        .ac-stack { display: flex; flex-direction: column; gap: 24px; }
        .ac-header { display: flex; flex-wrap: wrap; align-items: flex-start; justify-content: space-between; gap: 20px; }
        .ac-breadcrumb { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; margin: 0 0 12px; color: #315fea; font-size: 11px; font-weight: 800; letter-spacing: 1px; }
        .ac-muted-separator { color: #cbd5e1; }
        .ac-title { margin: 0; font-size: 30px; font-weight: 750; letter-spacing: -0.8px; }
        .ac-description { max-width: 650px; margin: 9px 0 0; color: #6b7280; font-size: 13px; line-height: 1.8; }
        .ac-actions { display: flex; flex-wrap: wrap; gap: 9px; }
        .ac-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 40px; padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 9px; background: #fff; color: #374151; font-size: 12px; font-weight: 700; cursor: pointer; transition: background .15s, border-color .15s; }
        .ac-button:hover { background: #f8faff; border-color: #cbd5e1; }
        .ac-button-primary { border-color: #315fea; background: #315fea; color: #fff; }
        .ac-button-primary:hover { border-color: #244bd0; background: #244bd0; }
        .ac-button-danger { color: #b91c1c; }
        .ac-button:focus-visible, .ac-page input:focus-visible, .ac-page select:focus-visible { outline: 3px solid #c7d2fe; outline-offset: 2px; }
        .ac-notice { display: flex; align-items: flex-start; gap: 12px; padding: 15px 17px; border: 1px solid #bfdbfe; border-radius: 12px; background: #eff6ff; color: #1e40af; line-height: 1.6; }
        .ac-notice strong { display: block; font-size: 13px; }
        .ac-notice p { margin: 4px 0 0; color: #1d4ed8; font-size: 12px; }
        .ac-toast { display: flex; justify-content: space-between; align-items: center; gap: 12px; padding: 12px 15px; border: 1px solid #bbf7d0; border-radius: 10px; background: #f0fdf4; color: #166534; font-size: 12px; }
        .ac-icon-button { display: inline-grid; place-items: center; width: 34px; height: 34px; border: 1px solid #e5e7eb; border-radius: 8px; background: white; color: #6b7280; cursor: pointer; }
        .ac-icon-button:hover { background: #f9fafb; color: #111827; }
        .ac-metrics { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 15px; }
        .ac-metric, .ac-panel { border: 1px solid #e5e7eb; border-radius: 15px; background: #fff; box-shadow: 0 2px 6px rgba(15,23,42,.025); }
        .ac-metric { padding: 20px; }
        .ac-metric-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
        .ac-metric-label { color: #6b7280; font-size: 12px; font-weight: 600; }
        .ac-metric-value { margin-top: 12px; font-size: 30px; font-weight: 750; line-height: 1; }
        .ac-metric-detail { margin-top: 12px; color: #9ca3af; font-size: 11px; }
        .ac-metric-icon { display: grid; place-items: center; width: 43px; height: 43px; border-radius: 12px; flex-shrink: 0; }
        .ac-panel { padding: 21px; }
        .ac-panel-heading { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: 12px; }
        .ac-section-title { margin: 0; font-size: 15px; font-weight: 750; }
        .ac-section-description { margin: 6px 0 0; color: #9ca3af; font-size: 11px; line-height: 1.7; }
        .ac-count { padding: 7px 10px; border-radius: 8px; background: #f3f4f6; color: #6b7280; font-size: 11px; }
        .ac-filters { display: grid; grid-template-columns: 1.5fr 1fr 1fr; gap: 12px; margin-top: 20px; }
        .ac-search { position: relative; }
        .ac-search svg { position: absolute; left: 12px; top: 13px; color: #9ca3af; pointer-events: none; }
        .ac-input { display: block; width: 100%; min-height: 42px; padding: 10px 12px; border: 1px solid #e5e7eb; border-radius: 9px; background: #fff; color: #111827; font-size: 12px; outline: none; }
        .ac-search .ac-input { padding-left: 37px; }
        .ac-input:focus { border-color: #315fea; box-shadow: 0 0 0 3px rgba(49,95,234,.1); }
        .ac-table-wrap { width: 100%; margin-top: 20px; overflow-x: auto; }
        .ac-table { width: 100%; min-width: 980px; border-collapse: collapse; text-align: left; }
        .ac-table th { padding: 13px 14px; border-top: 1px solid #e5e7eb; border-bottom: 1px solid #e5e7eb; background: #f9fafb; color: #6b7280; font-size: 9px; font-weight: 800; letter-spacing: .8px; white-space: nowrap; }
        .ac-table td { padding: 15px 14px; border-bottom: 1px solid #f0f1f5; color: #4b5563; font-size: 12px; vertical-align: middle; }
        .ac-table tbody tr:hover { background: #fafbff; }
        .ac-rule-name { display: block; padding: 0; border: 0; background: none; color: #111827; text-align: left; font-size: 12px; font-weight: 750; cursor: pointer; }
        .ac-rule-name:hover { color: #315fea; }
        .ac-rule-id { margin-top: 5px; color: #9ca3af; font-size: 10px; }
        .ac-principal { color: #374151; font-weight: 650; }
        .ac-subtext { margin-top: 5px; color: #9ca3af; font-size: 10px; }
        .ac-badge { display: inline-flex; align-items: center; padding: 5px 9px; border-radius: 7px; font-size: 10px; font-weight: 750; white-space: nowrap; }
        .ac-status { border-radius: 999px; }
        .ac-full { background: #f5f3ff; color: #6d28d9; }
        .ac-read { background: #eff6ff; color: #1d4ed8; }
        .ac-write { background: #f0fdf4; color: #15803d; }
        .ac-custom { background: #f3f4f6; color: #4b5563; }
        .ac-active { background: #dcfce7; color: #166534; }
        .ac-pending { background: #ffedd5; color: #9a3412; }
        .ac-suspended { background: #fee2e2; color: #991b1b; }
        .ac-row-menu { position: relative; }
        .ac-menu { position: absolute; z-index: 20; top: 42px; right: 0; width: 165px; padding: 5px; border: 1px solid #e5e7eb; border-radius: 11px; background: #fff; box-shadow: 0 12px 35px rgba(15,23,42,.13); }
        .ac-menu button { display: block; width: 100%; padding: 9px 10px; border: 0; border-radius: 7px; background: transparent; color: #374151; text-align: left; font-size: 11px; cursor: pointer; }
        .ac-menu button:hover { background: #f3f6ff; color: #315fea; }
        .ac-empty { padding: 45px 15px !important; color: #9ca3af !important; text-align: center; }
        .ac-footnote { margin: 15px 0 0; color: #9ca3af; font-size: 10px; }
        .ac-info-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 15px; }
        .ac-info-card { display: flex; align-items: flex-start; gap: 12px; padding: 19px; border: 1px solid #e5e7eb; border-radius: 14px; background: #fff; }
        .ac-info-icon { display: grid; place-items: center; width: 39px; height: 39px; flex-shrink: 0; border-radius: 11px; background: #eff6ff; color: #315fea; }
        .ac-info-title { margin: 0; font-size: 12px; font-weight: 750; }
        .ac-info-description { margin: 7px 0 0; color: #9ca3af; font-size: 11px; line-height: 1.7; }
        .ac-info-arrow { margin-left: auto; flex-shrink: 0; color: #9ca3af; }
        .ac-footer { display: flex; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding: 17px 0; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 10px; }
        .ac-overlay { position: fixed; inset: 0; z-index: 40; display: flex; justify-content: flex-end; background: rgba(15,23,42,.45); }
        .ac-drawer { width: min(100%, 430px); height: 100%; overflow-y: auto; padding: 25px; background: #fff; box-shadow: -10px 0 35px rgba(15,23,42,.12); }
        .ac-drawer-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
        .ac-eyebrow { color: #315fea; font-size: 10px; font-weight: 800; letter-spacing: 1px; }
        .ac-drawer-title { margin: 8px 0 0; font-size: 21px; font-weight: 750; overflow-wrap: anywhere; }
        .ac-detail-list { margin-top: 25px; }
        .ac-detail-row { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; padding: 13px 0; border-bottom: 1px solid #f0f1f5; }
        .ac-detail-label { color: #6b7280; font-size: 12px; }
        .ac-detail-value { max-width: 62%; color: #111827; text-align: right; font-size: 12px; font-weight: 700; overflow-wrap: anywhere; }
        .ac-warning { margin-top: 22px; padding: 14px; border: 1px solid #fde68a; border-radius: 11px; background: #fffbeb; color: #92400e; font-size: 11px; line-height: 1.7; }
        .ac-drawer-actions { display: grid; gap: 10px; margin-top: 22px; }
        .ac-modal-overlay { position: fixed; inset: 0; z-index: 50; display: grid; place-items: center; padding: 18px; background: rgba(15,23,42,.55); }
        .ac-modal { width: min(100%, 590px); max-height: 90vh; overflow-y: auto; padding: 25px; border: 1px solid #e5e7eb; border-radius: 17px; background: #fff; box-shadow: 0 24px 80px rgba(15,23,42,.2); }
        .ac-modal-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
        .ac-modal-title { margin: 0; font-size: 20px; font-weight: 750; }
        .ac-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; margin-top: 22px; }
        .ac-field { display: flex; flex-direction: column; gap: 8px; color: #4b5563; font-size: 11px; font-weight: 700; }
        .ac-field-full { grid-column: 1 / -1; }
        .ac-error { margin-top: 15px; color: #dc2626; font-size: 12px; }
        .ac-modal-footer { display: flex; justify-content: flex-end; flex-wrap: wrap; gap: 9px; margin-top: 24px; padding-top: 18px; border-top: 1px solid #f0f1f5; }
        @media (max-width: 1100px) {
          .ac-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .ac-info-grid { grid-template-columns: 1fr; }
        }
        @media (max-width: 700px) {
          .ac-page { padding: 16px; }
          .ac-title { font-size: 25px; }
          .ac-header { flex-direction: column; }
          .ac-actions { width: 100%; }
          .ac-actions .ac-button { flex: 1; }
          .ac-metrics { gap: 10px; }
          .ac-metric { padding: 14px; }
          .ac-metric-value { font-size: 26px; }
          .ac-metric-icon { width: 36px; height: 36px; }
          .ac-panel { padding: 15px; }
          .ac-filters { grid-template-columns: 1fr; }
          .ac-form-grid { grid-template-columns: 1fr; }
          .ac-field-full { grid-column: auto; }
          .ac-modal { padding: 18px; }
          .ac-drawer { padding: 18px; }
        }
        @media (max-width: 420px) {
          .ac-metrics { grid-template-columns: 1fr; }
          .ac-actions { flex-direction: column; }
          .ac-actions .ac-button { width: 100%; }
        }
      `}</style>

      <div className="ac-container ac-stack">
        <header className="ac-header">
          <div>
            <p className="ac-breadcrumb">
              <ShieldCheck size={16} />
              MODELNOW ADMIN
              <span className="ac-muted-separator">/</span>
              SECURITY
              <span className="ac-muted-separator">/</span>
              ACCESS CONTROL
            </p>
            <h1 className="ac-title">Access Control</h1>
            <p className="ac-description">
              Review who can access platform resources, which permissions
              they receive, and the scope of each access rule.
            </p>
          </div>

          <div className="ac-actions">
            <button className="ac-button" onClick={exportCsv}>
              <ArrowDownToLine size={16} />
              Export CSV
            </button>
            <button
              className="ac-button ac-button-primary"
              onClick={openCreate}
            >
              <Plus size={17} />
              Add access rule
            </button>
          </div>
        </header>

        <div className="ac-notice">
          <LockKeyhole size={19} />
          <div>
            <strong>Frontend demonstration</strong>
            <p>
              These are illustrative sample rules. Changes are held in local
              page state only. Real access enforcement must be implemented
              and validated by the backend.
            </p>
          </div>
        </div>

        {notice && (
          <div className="ac-toast" role="status">
            <span>{notice}</span>
            <button
              className="ac-icon-button"
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <section className="ac-metrics">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <article className="ac-metric" key={metric.title}>
                <div className="ac-metric-top">
                  <div>
                    <div className="ac-metric-label">{metric.title}</div>
                    <div className="ac-metric-value">{metric.value}</div>
                  </div>
                  <div
                    className="ac-metric-icon"
                    style={{
                      backgroundColor: metric.bg,
                      color: metric.color,
                    }}
                  >
                    <Icon size={21} />
                  </div>
                </div>
                <p className="ac-metric-detail">{metric.detail}</p>
              </article>
            );
          })}
        </section>

        <section className="ac-panel">
          <div className="ac-panel-heading">
            <div>
              <h2 className="ac-section-title">Access rules</h2>
              <p className="ac-section-description">
                Search, inspect, and manage sample resource access rules.
              </p>
            </div>
            <span className="ac-count">
              {filteredRules.length} of {rules.length} rules
            </span>
          </div>

          <div className="ac-filters">
            <div className="ac-search">
              <Search size={16} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search rules, roles, resources..."
                aria-label="Search access rules"
                className={inputClass}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className={inputClass}
              aria-label="Filter by status"
            >
              <option>All statuses</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Suspended</option>
            </select>

            <select
              value={levelFilter}
              onChange={(event) => setLevelFilter(event.target.value)}
              className={inputClass}
              aria-label="Filter by access level"
            >
              <option>All access levels</option>
              <option>Full access</option>
              <option>Read only</option>
              <option>Read & write</option>
              <option>Custom</option>
            </select>
          </div>

          <div className="ac-table-wrap">
            <table className="ac-table">
              <thead>
                <tr>
                  {[
                    "RULE",
                    "PRINCIPAL",
                    "RESOURCE",
                    "ACCESS LEVEL",
                    "SCOPE",
                    "STATUS",
                    "UPDATED",
                    "",
                  ].map((heading, index) => (
                    <th key={`${heading}-${index}`}>{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRules.map((rule) => (
                  <tr key={rule.id}>
                    <td>
                      <button
                        className="ac-rule-name"
                        onClick={() => setSelected(rule)}
                      >
                        {rule.name}
                      </button>
                      <div className="ac-rule-id">{rule.id}</div>
                    </td>
                    <td>
                      <div className="ac-principal">{rule.principal}</div>
                      <div className="ac-subtext">
                        {rule.principalType}
                      </div>
                    </td>
                    <td>{rule.resource}</td>
                    <td>
                      <AccessBadge level={rule.level} />
                    </td>
                    <td>{rule.scope}</td>
                    <td>
                      <StatusBadge status={rule.status} />
                    </td>
                    <td>{rule.updated}</td>
                    <td>
                      <div className="ac-row-menu">
                        <button
                          className="ac-icon-button"
                          onClick={() =>
                            setMenuId(
                              menuId === rule.id ? null : rule.id
                            )
                          }
                          aria-label={`Actions for ${rule.name}`}
                          aria-expanded={menuId === rule.id}
                        >
                          <MoreHorizontal size={16} />
                        </button>

                        {menuId === rule.id && (
                          <div className="ac-menu">
                            <button
                              onClick={() => {
                                setSelected(rule);
                                setMenuId(null);
                              }}
                            >
                              View details
                            </button>
                            <button onClick={() => openEdit(rule)}>
                              Edit rule
                            </button>
                            <button onClick={() => toggleStatus(rule)}>
                              {rule.status === "Active"
                                ? "Suspend rule"
                                : "Activate rule"}
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredRules.length === 0 && (
                  <tr>
                    <td colSpan={8} className="ac-empty">
                      No access rules match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="ac-footnote">
            Sample rules · No real access permissions are changed.
          </p>
        </section>

        <section className="ac-info-grid">
          <InfoCard
            icon={Users}
            title="Principal-based access"
            description="Rules can target individual users, platform roles, or service accounts."
          />
          <InfoCard
            icon={Eye}
            title="Least privilege"
            description="Prefer the narrowest resource scope and access level needed for a task."
          />
          <InfoCard
            icon={CheckCircle2}
            title="Review before activation"
            description="Validate ownership, scope, and business purpose before enabling real rules."
          />
        </section>

        <footer className="ac-footer">
          <span>ModelNow Access Control · Frontend prototype</span>
          <span>{rules.length} sample rules configured</span>
        </footer>
      </div>

      {selected && (
        <div
          className="ac-overlay"
          onClick={() => setSelected(null)}
        >
          <aside
            className="ac-drawer"
            role="dialog"
            aria-modal="true"
            aria-label="Access rule details"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="ac-drawer-header">
              <div>
                <div className="ac-eyebrow">ACCESS RULE DETAILS</div>
                <h2 className="ac-drawer-title">{selected.name}</h2>
                <div className="ac-rule-id">{selected.id}</div>
              </div>
              <button
                className="ac-icon-button"
                onClick={() => setSelected(null)}
                aria-label="Close details"
              >
                <X size={17} />
              </button>
            </div>

            <div className="ac-detail-list">
              <DetailRow label="Principal" value={selected.principal} />
              <DetailRow
                label="Principal type"
                value={selected.principalType}
              />
              <DetailRow label="Resource" value={selected.resource} />
              <DetailRow label="Access level" value={selected.level} />
              <DetailRow label="Scope" value={selected.scope} />
              <DetailRow label="Status" value={selected.status} />
              <DetailRow label="Last updated" value={selected.updated} />
            </div>

            <div className="ac-warning">
              This is a local demonstration. Backend authorization must
              independently validate every request and resource.
            </div>

            <div className="ac-drawer-actions">
              <button
                className="ac-button ac-button-primary"
                onClick={() => openEdit(selected)}
              >
                Edit access rule
              </button>
              <button
                className="ac-button"
                onClick={() => toggleStatus(selected)}
              >
                {selected.status === "Active"
                  ? "Suspend rule"
                  : "Activate rule"}
              </button>
            </div>
          </aside>
        </div>
      )}

      {formOpen && (
        <div
          className="ac-modal-overlay"
          onClick={() => setFormOpen(false)}
        >
          <section
            className="ac-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="ac-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="ac-modal-header">
              <div>
                <h2 id="ac-modal-title" className="ac-modal-title">
                  {editingId ? "Edit access rule" : "Add access rule"}
                </h2>
                <p className="ac-section-description">
                  Configure a sample access rule.
                </p>
              </div>
              <button
                className="ac-icon-button"
                onClick={() => setFormOpen(false)}
                aria-label="Close form"
              >
                <X size={16} />
              </button>
            </div>

            <div className="ac-form-grid">
              <label className="ac-field">
                Rule name *
                <input
                  value={draft.name}
                  onChange={(event) =>
                    setDraft({ ...draft, name: event.target.value })
                  }
                  placeholder="e.g. Model review access"
                  className={inputClass}
                />
              </label>

              <label className="ac-field">
                Principal *
                <input
                  value={draft.principal}
                  onChange={(event) =>
                    setDraft({ ...draft, principal: event.target.value })
                  }
                  placeholder="User, role, or service account"
                  className={inputClass}
                />
              </label>

              <label className="ac-field">
                Principal type
                <select
                  value={draft.principalType}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      principalType: event.target.value as PrincipalType,
                    })
                  }
                  className={inputClass}
                >
                  <option>User</option>
                  <option>Role</option>
                  <option>Service account</option>
                </select>
              </label>

              <label className="ac-field">
                Resource
                <select
                  value={draft.resource}
                  onChange={(event) =>
                    setDraft({ ...draft, resource: event.target.value })
                  }
                  className={inputClass}
                >
                  {resources.map((resource) => (
                    <option key={resource}>{resource}</option>
                  ))}
                </select>
              </label>

              <label className="ac-field">
                Access level
                <select
                  value={draft.level}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      level: event.target.value as AccessLevel,
                    })
                  }
                  className={inputClass}
                >
                  <option>Full access</option>
                  <option>Read only</option>
                  <option>Read & write</option>
                  <option>Custom</option>
                </select>
              </label>

              <label className="ac-field">
                Scope
                <select
                  value={draft.scope}
                  onChange={(event) =>
                    setDraft({ ...draft, scope: event.target.value })
                  }
                  className={inputClass}
                >
                  <option>Organization</option>
                  <option>Workspace</option>
                  <option>Project</option>
                  <option>Resource</option>
                </select>
              </label>

              <label className="ac-field ac-field-full">
                Status
                <select
                  value={draft.status}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      status: event.target.value as AccessStatus,
                    })
                  }
                  className={inputClass}
                >
                  <option>Active</option>
                  <option>Pending</option>
                  <option>Suspended</option>
                </select>
              </label>
            </div>

            {error && (
              <p className="ac-error" role="alert">
                {error}
              </p>
            )}

            <div className="ac-modal-footer">
              <button
                className="ac-button"
                onClick={() => setFormOpen(false)}
              >
                Cancel
              </button>
              <button
                className="ac-button ac-button-primary"
                onClick={saveRule}
              >
                {editingId ? "Save changes" : "Create rule"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function StatusBadge({ status }: { status: AccessStatus }) {
  const classes: Record<AccessStatus, string> = {
    Active: "ac-active",
    Pending: "ac-pending",
    Suspended: "ac-suspended",
  };

  return (
    <span className={`ac-badge ac-status ${classes[status]}`}>
      {status}
    </span>
  );
}

function AccessBadge({ level }: { level: AccessLevel }) {
  const classes: Record<AccessLevel, string> = {
    "Full access": "ac-full",
    "Read only": "ac-read",
    "Read & write": "ac-write",
    Custom: "ac-custom",
  };

  return (
    <span className={`ac-badge ${classes[level]}`}>
      {level}
    </span>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="ac-detail-row">
      <span className="ac-detail-label">{label}</span>
      <span className="ac-detail-value">{value}</span>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof Shield;
  title: string;
  description: string;
}) {
  return (
    <article className="ac-info-card">
      <div className="ac-info-icon">
        <Icon size={19} />
      </div>
      <div>
        <h3 className="ac-info-title">{title}</h3>
        <p className="ac-info-description">{description}</p>
      </div>
      <ArrowRight size={15} className="ac-info-arrow" />
    </article>
  );
}
