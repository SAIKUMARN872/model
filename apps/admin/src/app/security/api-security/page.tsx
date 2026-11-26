"use client";

import { useMemo, useState } from "react";
import type { ComponentType } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownToLine,
  CheckCircle2,
  Clock3,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  MoreHorizontal,
  Plus,
  Search,
  ShieldCheck,
  Trash2,
  X,
} from "lucide-react";

type KeyStatus = "Active" | "Expired" | "Revoked" | "Pending";
type KeyEnvironment = "Production" | "Development" | "Staging";

type ApiKey = {
  id: string;
  name: string;
  prefix: string;
  owner: string;
  environment: KeyEnvironment;
  scopes: string[];
  created: string;
  expires: string;
  lastUsed: string;
  requests: number;
  status: KeyStatus;
};

const initialKeys: ApiKey[] = [
  {
    id: "KEY-1001",
    name: "Production AI Gateway",
    prefix: "mn_prod_8f2a",
    owner: "Platform Engineering",
    environment: "Production",
    scopes: ["models:read", "models:invoke", "usage:read"],
    created: "Oct 12, 2026",
    expires: "Dec 12, 2026",
    lastUsed: "2 minutes ago",
    requests: 128450,
    status: "Active",
  },
  {
    id: "KEY-1002",
    name: "Frontend Development",
    prefix: "mn_dev_4c91",
    owner: "Frontend Team",
    environment: "Development",
    scopes: ["models:read", "models:invoke"],
    created: "Oct 20, 2026",
    expires: "Jan 20, 2027",
    lastUsed: "18 minutes ago",
    requests: 18320,
    status: "Active",
  },
  {
    id: "KEY-1003",
    name: "Analytics Integration",
    prefix: "mn_prod_7d30",
    owner: "Analytics Team",
    environment: "Production",
    scopes: ["usage:read", "analytics:read"],
    created: "Sep 10, 2026",
    expires: "Nov 10, 2026",
    lastUsed: "Yesterday",
    requests: 42600,
    status: "Active",
  },
  {
    id: "KEY-1004",
    name: "Staging Evaluation",
    prefix: "mn_stg_2b65",
    owner: "ML Engineering",
    environment: "Staging",
    scopes: ["models:read", "models:invoke", "evaluations:write"],
    created: "Aug 15, 2026",
    expires: "Oct 15, 2026",
    lastUsed: "Oct 14, 2026",
    requests: 8700,
    status: "Expired",
  },
  {
    id: "KEY-1005",
    name: "Legacy Service",
    prefix: "mn_prod_1e72",
    owner: "Legacy Integration",
    environment: "Production",
    scopes: ["models:read", "models:invoke", "keys:manage"],
    created: "Jul 8, 2026",
    expires: "Nov 8, 2026",
    lastUsed: "Oct 27, 2026",
    requests: 2150,
    status: "Revoked",
  },
];

const availableScopes = [
  "models:read",
  "models:invoke",
  "usage:read",
  "analytics:read",
  "evaluations:write",
  "keys:manage",
];

const emptyKey: ApiKey = {
  id: "",
  name: "",
  prefix: "",
  owner: "",
  environment: "Development",
  scopes: ["models:read"],
  created: "",
  expires: "",
  lastUsed: "Never",
  requests: 0,
  status: "Active",
};

const today = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDate = (value: string) => {
  if (!value) return "";
  const date = new Date(`${value}T12:00:00`);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export default function ApiSecurityPage() {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [environmentFilter, setEnvironmentFilter] =
    useState("All environments");
  const [selected, setSelected] = useState<ApiKey | null>(null);
  const [draft, setDraft] = useState<ApiKey>(emptyKey);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [showPrefixes, setShowPrefixes] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<ApiKey | null>(null);
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const filteredKeys = useMemo(() => {
    const query = search.trim().toLowerCase();

    return keys.filter((key) => {
      const matchesSearch =
        !query ||
        key.id.toLowerCase().includes(query) ||
        key.name.toLowerCase().includes(query) ||
        key.owner.toLowerCase().includes(query) ||
        key.prefix.toLowerCase().includes(query) ||
        key.scopes.some((scope) => scope.toLowerCase().includes(query));

      return (
        matchesSearch &&
        (statusFilter === "All statuses" || key.status === statusFilter) &&
        (environmentFilter === "All environments" ||
          key.environment === environmentFilter)
      );
    });
  }, [keys, search, statusFilter, environmentFilter]);

  const activeCount = keys.filter((key) => key.status === "Active").length;

  const productionCount = keys.filter(
    (key) =>
      key.environment === "Production" && key.status === "Active",
  ).length;

  const expiredCount = keys.filter(
    (key) => key.status === "Expired",
  ).length;

  const totalRequests = keys.reduce(
    (sum, key) => sum + key.requests,
    0,
  );

  function openCreate() {
    setEditingId(null);
    setDraft({ ...emptyKey, scopes: ["models:read"] });
    setError("");
    setGeneratedKey(null);
    setFormOpen(true);
    setSelected(null);
    setMenuId(null);
  }

  function openEdit(key: ApiKey) {
    setEditingId(key.id);
    setDraft({ ...key, scopes: [...key.scopes] });
    setError("");
    setGeneratedKey(null);
    setMenuId(null);
    setSelected(null);
    setFormOpen(true);
  }

  function toggleScope(scope: string) {
    setDraft((current) => ({
      ...current,
      scopes: current.scopes.includes(scope)
        ? current.scopes.filter((item) => item !== scope)
        : [...current.scopes, scope],
    }));
  }

  function saveKey() {
    if (!draft.name.trim() || !draft.owner.trim()) {
      setError("Enter a key name and owner.");
      return;
    }

    if (draft.scopes.length === 0) {
      setError("Select at least one permission scope.");
      return;
    }

    if (!draft.expires) {
      setError("Choose an expiration date.");
      return;
    }

    if (draft.expires <= today()) {
      setError("Expiration date must be in the future.");
      return;
    }

    const duplicate = keys.some(
      (key) =>
        key.name.toLowerCase() === draft.name.trim().toLowerCase() &&
        key.id !== editingId,
    );

    if (duplicate) {
      setError("A key with this name already exists.");
      return;
    }

    if (editingId) {
      const updated: ApiKey = {
        ...draft,
        id: editingId,
        name: draft.name.trim(),
        owner: draft.owner.trim(),
      };

      setKeys((current) =>
        current.map((key) =>
          key.id === editingId ? updated : key,
        ),
      );

      setNotice("API key metadata updated in local demo state.");
      setFormOpen(false);
      setError("");
      return;
    }

    // This is only a fictional demo placeholder, not a real API credential.
    const randomPart =
      typeof crypto !== "undefined" &&
      typeof crypto.randomUUID === "function"
        ? crypto.randomUUID().replace(/-/g, "")
        : `${Date.now()}${Math.random().toString(16).slice(2)}`;

    const demoSecret = `mn_demo_${randomPart}`;

    const environmentPrefix =
      draft.environment === "Production"
        ? "prod"
        : draft.environment === "Staging"
          ? "stg"
          : "dev";

    const created: ApiKey = {
      ...draft,
      id: `KEY-${Date.now().toString().slice(-6)}`,
      name: draft.name.trim(),
      owner: draft.owner.trim(),
      prefix: `mn_${environmentPrefix}_${randomPart.slice(-4)}`,
      created: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      lastUsed: "Never",
      requests: 0,
      status: "Pending",
    };

    setKeys((current) => [created, ...current]);
    setGeneratedKey(demoSecret);
    setCopied(false);
    setNotice("Demo key record created as Pending.");
    setError("");
  }

  function closeForm() {
    setFormOpen(false);
    setGeneratedKey(null);
    setError("");
  }

  function changeStatus(key: ApiKey, status: KeyStatus) {
    setKeys((current) =>
      current.map((item) =>
        item.id === key.id ? { ...item, status } : item,
      ),
    );

    setSelected((current) =>
      current?.id === key.id ? { ...current, status } : current,
    );

    setConfirmTarget(null);
    setMenuId(null);
    setNotice(
      `${key.name} marked ${status.toLowerCase()} in local demo state.`,
    );
  }

  async function copyDemoKey() {
    if (!generatedKey) return;

    try {
      if (!navigator.clipboard?.writeText) {
        setNotice("Clipboard access is unavailable in this browser.");
        return;
      }

      await navigator.clipboard.writeText(generatedKey);
      setCopied(true);
      setNotice("Demo placeholder copied to clipboard.");
    } catch {
      setNotice("Clipboard access was unavailable.");
    }
  }

  function exportCsv() {
    const rows = [
      [
        "Key ID",
        "Name",
        "Prefix",
        "Owner",
        "Environment",
        "Scopes",
        "Created",
        "Expires",
        "Last used",
        "Requests",
        "Status",
      ],
      ...filteredKeys.map((key) => [
        key.id,
        key.name,
        key.prefix,
        key.owner,
        key.environment,
        key.scopes.join("; "),
        key.created,
        key.expires,
        key.lastUsed,
        String(key.requests),
        key.status,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${value.replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );

    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-api-security.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();

    window.setTimeout(() => URL.revokeObjectURL(url), 1000);

    setNotice("Filtered API key metadata exported to CSV.");
  }

  const metrics = [
    {
      title: "API keys",
      value: keys.length.toLocaleString(),
      detail: "Sample key records",
      icon: KeyRound,
      color: "#315fea",
      bg: "#eff4ff",
    },
    {
      title: "Active keys",
      value: activeCount.toLocaleString(),
      detail: "Marked active in the demo",
      icon: CheckCircle2,
      color: "#15803d",
      bg: "#ecfdf3",
    },
    {
      title: "Production keys",
      value: productionCount.toLocaleString(),
      detail: "Active production records",
      icon: ShieldCheck,
      color: "#7c3aed",
      bg: "#f5f3ff",
    },
    {
      title: "Requests recorded",
     value: totalRequests.toLocaleString("en-US"),
      detail: `${expiredCount} expired key record(s)`,
      icon: Activity,
      color: "#c2410c",
      bg: "#fff7ed",
    },
  ];

  return (
    <main className="api-security-page">
      <div className="api-security-container">
        <header className="api-page-header">
          <div className="api-heading-copy">
            <p className="api-eyebrow">
              <ShieldCheck size={17} />
              <span>MODELNOW ADMIN</span>
              <span className="api-breadcrumb-separator">/</span>
              <span>SECURITY</span>
              <span className="api-breadcrumb-separator">/</span>
              <span>API SECURITY</span>
            </p>

            <h1>API Security</h1>

            <p className="api-page-description">
              Review API credential metadata, permission scopes,
              expiration, and key lifecycle status.
            </p>
          </div>

          <div className="api-header-actions">
            <button
              type="button"
              onClick={exportCsv}
              className="api-button api-button-secondary"
            >
              <ArrowDownToLine size={16} />
              Export CSV
            </button>

            <button
              type="button"
              onClick={openCreate}
              className="api-button api-button-primary"
            >
              <Plus size={17} />
              Create API key
            </button>
          </div>
        </header>

        <section className="api-demo-warning">
          <div className="api-warning-icon">
            <AlertTriangle size={19} />
          </div>
          <div>
            <h2>Demo credentials only</h2>
            <p>
              This page uses fictional records and a nonfunctional demo
              placeholder. It does not create, authenticate, or revoke
              real API credentials. Never expose real secrets in frontend
              code or logs.
            </p>
          </div>
        </section>

        {notice && (
          <div className="api-notice" role="status">
            <CheckCircle2 size={18} />
            <p>{notice}</p>
            <button
              type="button"
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
            >
              <X size={17} />
            </button>
          </div>
        )}

        <section className="api-metrics-grid">
          {metrics.map((metric) => {
            const Icon = metric.icon;

            return (
              <article className="api-metric-card" key={metric.title}>
                <div className="api-metric-top">
                  <div>
                    <p className="api-metric-title">{metric.title}</p>
                    <p className="api-metric-value">{metric.value}</p>
                  </div>

                  <div
                    className="api-metric-icon"
                    style={{
                      backgroundColor: metric.bg,
                      color: metric.color,
                    }}
                  >
                    <Icon size={22} />
                  </div>
                </div>

                <p className="api-metric-detail">{metric.detail}</p>
              </article>
            );
          })}
        </section>

        <section className="api-inventory-card">
          <div className="api-inventory-header">
            <div>
              <h2>API key inventory</h2>
              <p>
                Search keys, review permissions, and manage demo
                key metadata.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowPrefixes((value) => !value)}
              className="api-button api-button-secondary api-show-prefix-button"
            >
              {showPrefixes ? (
                <EyeOff size={16} />
              ) : (
                <Eye size={16} />
              )}
              {showPrefixes ? "Hide prefixes" : "Show prefixes"}
            </button>
          </div>

          <div className="api-filter-grid">
            <div className="api-search-field">
              <Search size={17} />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search key, owner, scope..."
                aria-label="Search API keys"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="api-select"
              aria-label="Filter by key status"
            >
              <option>All statuses</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Expired</option>
              <option>Revoked</option>
            </select>

            <select
              value={environmentFilter}
              onChange={(event) =>
                setEnvironmentFilter(event.target.value)
              }
              className="api-select"
              aria-label="Filter by environment"
            >
              <option>All environments</option>
              <option>Production</option>
              <option>Staging</option>
              <option>Development</option>
            </select>
          </div>

          <div className="api-results-bar">
            <span>
              Showing <strong>{filteredKeys.length}</strong> of{" "}
              <strong>{keys.length}</strong> keys
            </span>
            {(search ||
              statusFilter !== "All statuses" ||
              environmentFilter !== "All environments") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("All statuses");
                  setEnvironmentFilter("All environments");
                }}
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="api-table-wrapper">
            <table className="api-table">
              <thead>
                <tr>
                  <th>API KEY</th>
                  <th>OWNER</th>
                  <th>ENVIRONMENT</th>
                  <th>PERMISSION SCOPES</th>
                  <th>LAST USED</th>
                  <th>EXPIRES</th>
                  <th>STATUS</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>

              <tbody>
                {filteredKeys.map((key) => (
                  <tr key={key.id}>
                    <td>
                      <button
                        type="button"
                        onClick={() => {
                          setSelected(key);
                          setMenuId(null);
                        }}
                        className="api-key-name-button"
                      >
                        <span className="api-key-title">{key.name}</span>
                        <span className="api-key-prefix">
                          {showPrefixes
                            ? key.prefix
                            : `${key.prefix.slice(0, 7)}••••••`}
                        </span>
                        <span className="api-key-id">{key.id}</span>
                      </button>
                    </td>

                    <td>
                      <span className="api-owner">{key.owner}</span>
                    </td>

                    <td>
                      <EnvironmentBadge environment={key.environment} />
                    </td>

                    <td>
                      <div className="api-scope-list">
                        {key.scopes.slice(0, 2).map((scope) => (
                          <span className="api-scope-tag" key={scope}>
                            {scope}
                          </span>
                        ))}
                        {key.scopes.length > 2 && (
                          <span className="api-scope-more">
                            +{key.scopes.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className="api-table-muted">{key.lastUsed}</span>
                    </td>

                    <td>
                      <span className="api-table-muted">{key.expires}</span>
                    </td>

                    <td>
                      <KeyStatusBadge status={key.status} />
                    </td>

                    <td className="api-actions-cell">
                      <button
                        type="button"
                        onClick={() =>
                          setMenuId(
                            menuId === key.id ? null : key.id,
                          )
                        }
                        aria-label={`Actions for ${key.name}`}
                        aria-expanded={menuId === key.id}
                        className="api-icon-button"
                      >
                        <MoreHorizontal size={18} />
                      </button>

                      {menuId === key.id && (
                        <>
                          <button
                            type="button"
                            aria-label="Close actions menu"
                            className="api-menu-backdrop"
                            onClick={() => setMenuId(null)}
                          />
                          <div className="api-actions-menu">
                            <button
                              type="button"
                              onClick={() => {
                                setSelected(key);
                                setMenuId(null);
                              }}
                            >
                              <Eye size={15} />
                              View details
                            </button>

                            <button
                              type="button"
                              onClick={() => openEdit(key)}
                            >
                              <KeyRound size={15} />
                              Edit metadata
                            </button>

                            {key.status !== "Revoked" && (
                              <button
                                type="button"
                                className="api-menu-danger"
                                onClick={() => {
                                  setConfirmTarget(key);
                                  setMenuId(null);
                                }}
                              >
                                <Trash2 size={15} />
                                Revoke key
                              </button>
                            )}

                            {key.status === "Pending" && (
                              <button
                                type="button"
                                onClick={() =>
                                  changeStatus(key, "Active")
                                }
                              >
                                <CheckCircle2 size={15} />
                                Mark active (demo)
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </td>
                  </tr>
                ))}

                {filteredKeys.length === 0 && (
                  <tr>
                    <td colSpan={8}>
                      <div className="api-empty-state">
                        <div className="api-empty-icon">
                          <Search size={23} />
                        </div>
                        <h3>No API keys found</h3>
                        <p>
                          Try another search term or adjust your filters.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSearch("");
                            setStatusFilter("All statuses");
                            setEnvironmentFilter("All environments");
                          }}
                          className="api-button api-button-secondary"
                        >
                          Clear filters
                        </button>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="api-table-footer">
            <span>
              <LockKeyhole size={14} />
              Sample data only · No real credentials are stored
            </span>
            <span>{keys.length} sample records</span>
          </div>
        </section>

        <section className="api-guidance-grid">
          <InfoCard
            icon={LockKeyhole}
            title="Least privilege"
            description="Grant only the scopes required by each integration. Avoid broad administrative scopes."
          />
          <InfoCard
            icon={Clock3}
            title="Rotate credentials"
            description="Use defined expiration dates and a controlled rotation process for production credentials."
          />
          <InfoCard
            icon={ShieldCheck}
            title="Protect secrets"
            description="Store real credentials server-side or in a secret manager. Display secret material only when securely issued."
          />
        </section>

        <footer className="api-page-footer">
          <span>ModelNow API Security · Frontend prototype</span>
          <span>Illustrative data · Local page state only</span>
        </footer>
      </div>

      {selected && (
        <div
          className="api-overlay api-drawer-overlay"
          onClick={() => setSelected(null)}
        >
          <aside
            className="api-details-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="api-drawer-header">
              <div>
                <p className="api-dialog-eyebrow">API KEY DETAILS</p>
                <h2>{selected.name}</h2>
                <p className="api-dialog-subtitle">{selected.id}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                aria-label="Close details"
                className="api-icon-button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="api-detail-summary">
              <div className="api-detail-summary-icon">
                <KeyRound size={23} />
              </div>
              <div>
                <p>Credential record</p>
                <span>{selected.environment} environment</span>
              </div>
              <KeyStatusBadge status={selected.status} />
            </div>

            <div className="api-detail-list">
              <DetailRow label="Key prefix" value={selected.prefix} />
              <DetailRow label="Owner" value={selected.owner} />
              <DetailRow
                label="Environment"
                value={selected.environment}
              />
              <DetailRow label="Status" value={selected.status} />
              <DetailRow label="Created" value={selected.created} />
              <DetailRow label="Expires" value={selected.expires} />
              <DetailRow label="Last used" value={selected.lastUsed} />
              <DetailRow
                label="Recorded requests"
                value={selected.requests.toLocaleString()}
              />
            </div>

            <div className="api-detail-scopes">
              <h3>Permission scopes</h3>
              <p>Permissions assigned to this key record.</p>
              <div className="api-detail-scope-list">
                {selected.scopes.map((scope) => (
                  <span key={scope} className="api-scope-tag">
                    {scope}
                  </span>
                ))}
              </div>
            </div>

            <div className="api-inline-warning">
              <AlertTriangle size={17} />
              <p>
                No real secret is stored or shown here. A backend service
                must securely issue and validate actual API credentials.
              </p>
            </div>

            <div className="api-drawer-actions">
              <button
                type="button"
                onClick={() => openEdit(selected)}
                className="api-button api-button-primary api-button-full"
              >
                Edit metadata
              </button>

              {selected.status !== "Revoked" && (
                <button
                  type="button"
                  onClick={() => setConfirmTarget(selected)}
                  className="api-button api-button-danger-outline api-button-full"
                >
                  <Trash2 size={16} />
                  Revoke key
                </button>
              )}
            </div>
          </aside>
        </div>
      )}

      {formOpen && (
        <div
          className="api-overlay api-modal-overlay"
          onClick={closeForm}
        >
          <section
            className="api-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="api-modal-header">
              <div>
                <p className="api-dialog-eyebrow">
                  {editingId ? "KEY CONFIGURATION" : "NEW CREDENTIAL RECORD"}
                </p>
                <h2>
                  {editingId
                    ? "Edit API key metadata"
                    : "Create API key record"}
                </h2>
                <p className="api-dialog-subtitle">
                  Configure sample metadata and permission scopes.
                </p>
              </div>

              <button
                type="button"
                onClick={closeForm}
                aria-label="Close form"
                className="api-icon-button"
              >
                <X size={18} />
              </button>
            </div>

            <div className="api-form-warning">
              <ShieldCheck size={18} />
              <p>
                This form creates or updates frontend demo records only.
                It does not issue real API credentials.
              </p>
            </div>

            <div className="api-form-grid">
              <label className="api-form-label">
                <span>Key name <b>*</b></span>
                <input
                  value={draft.name}
                  onChange={(event) =>
                    setDraft({ ...draft, name: event.target.value })
                  }
                  placeholder="e.g. Production model service"
                  className="api-form-input"
                />
              </label>

              <label className="api-form-label">
                <span>Owner <b>*</b></span>
                <input
                  value={draft.owner}
                  onChange={(event) =>
                    setDraft({ ...draft, owner: event.target.value })
                  }
                  placeholder="Team or service owner"
                  className="api-form-input"
                />
              </label>

              <label className="api-form-label">
                <span>Environment</span>
                <select
                  value={draft.environment}
                  onChange={(event) =>
                    setDraft({
                      ...draft,
                      environment: event.target.value as KeyEnvironment,
                    })
                  }
                  className="api-form-input"
                >
                  <option>Development</option>
                  <option>Staging</option>
                  <option>Production</option>
                </select>
              </label>

              <label className="api-form-label">
                <span>Expiration date <b>*</b></span>
                <input
                  type="date"
                  min={today()}
                  value={draft.expires}
                  onChange={(event) =>
                    setDraft({ ...draft, expires: event.target.value })
                  }
                  className="api-form-input"
                />
              </label>
            </div>

            <div className="api-permissions-section">
              <h3>Permission scopes <b>*</b></h3>
              <p>
                Select only the permissions this integration requires.
              </p>

              <div className="api-permission-grid">
                {availableScopes.map((scope) => (
                  <label
                    key={scope}
                    className={`api-permission-option ${
                      draft.scopes.includes(scope)
                        ? "api-permission-selected"
                        : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={draft.scopes.includes(scope)}
                      onChange={() => toggleScope(scope)}
                    />
                    <span className="api-checkbox-visual">
                      <CheckCircle2 size={16} />
                    </span>
                    <span className="api-permission-name">{scope}</span>
                  </label>
                ))}
              </div>
            </div>

            {error && (
              <div className="api-form-error" role="alert">
                <AlertTriangle size={17} />
                <span>{error}</span>
              </div>
            )}

            {generatedKey && (
              <div className="api-generated-key">
                <div className="api-generated-header">
                  <AlertTriangle size={19} />
                  <div>
                    <h3>Demo placeholder only</h3>
                    <p>
                      This is a random frontend placeholder, not a valid
                      API key. Real keys must be issued securely by the
                      backend.
                    </p>
                  </div>
                </div>

                <div className="api-generated-value">
                  <code>{generatedKey}</code>
                  <button
                    type="button"
                    onClick={copyDemoKey}
                    className="api-button api-button-secondary"
                  >
                    <Copy size={15} />
                    {copied ? "Copied" : "Copy"}
                  </button>
                </div>
              </div>
            )}

            <div className="api-modal-footer">
              <button
                type="button"
                onClick={closeForm}
                className="api-button api-button-secondary"
              >
                {generatedKey && !editingId ? "Close" : "Cancel"}
              </button>

              <button
                type="button"
                onClick={saveKey}
                className="api-button api-button-primary"
              >
                {editingId
                  ? "Save metadata"
                  : generatedKey
                    ? "Create another"
                    : "Create demo record"}
              </button>
            </div>
          </section>
        </div>
      )}

      {confirmTarget && (
        <ConfirmDialog
          title="Revoke this API key?"
          description={`The demo will mark "${confirmTarget.name}" as revoked. No real credential will be revoked.`}
          confirmLabel="Revoke key"
          onCancel={() => setConfirmTarget(null)}
          onConfirm={() => changeStatus(confirmTarget, "Revoked")}
        />
      )}

      <style jsx global>{`
        .api-security-page,
        .api-security-page * {
          box-sizing: border-box;
        }

        .api-security-page {
          min-height: 100vh;
          width: 100%;
          background: #f6f8fc;
          color: #172033;
          padding: 30px;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 14px;
          line-height: 1.5;
        }

        .api-security-page button,
        .api-security-page input,
        .api-security-page select {
          font: inherit;
        }

        .api-security-page button {
          cursor: pointer;
        }

        .api-security-page button:focus-visible,
        .api-security-page input:focus-visible,
        .api-security-page select:focus-visible {
          outline: 3px solid rgba(49, 95, 234, 0.22);
          outline-offset: 2px;
        }

        .api-security-container {
          width: 100%;
          max-width: 1600px;
          margin: 0 auto;
        }

        .api-page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 26px;
        }

        .api-heading-copy {
          min-width: 0;
        }

        .api-eyebrow {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 8px;
          margin: 0 0 12px;
          color: #315fea;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.1px;
        }

        .api-breadcrumb-separator {
          color: #b9c1d1;
        }

        .api-page-header h1 {
          margin: 0;
          color: #172033;
          font-size: clamp(27px, 3vw, 34px);
          line-height: 1.2;
          font-weight: 750;
          letter-spacing: -1.1px;
        }

        .api-page-description {
          max-width: 680px;
          margin: 10px 0 0;
          color: #657087;
          font-size: 14px;
          line-height: 1.8;
        }

        .api-header-actions {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .api-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 40px;
          padding: 10px 15px;
          border: 1px solid transparent;
          border-radius: 9px;
          font-size: 13px;
          font-weight: 650;
          line-height: 1.2;
          text-decoration: none;
          transition:
            background 0.16s ease,
            border-color 0.16s ease,
            box-shadow 0.16s ease,
            transform 0.16s ease;
        }

        .api-button:active {
          transform: translateY(1px);
        }

        .api-button-primary {
          background: #315fea;
          color: #fff;
          border-color: #315fea;
          box-shadow: 0 2px 5px rgba(49, 95, 234, 0.15);
        }

        .api-button-primary:hover {
          background: #244bc7;
          border-color: #244bc7;
        }

        .api-button-secondary {
          background: #fff;
          color: #39445b;
          border-color: #dfe4ee;
        }

        .api-button-secondary:hover {
          background: #f7f9fd;
          border-color: #cbd4e3;
        }

        .api-button-danger-outline {
          background: #fff;
          border-color: #fecaca;
          color: #b42318;
        }

        .api-button-danger-outline:hover {
          background: #fff5f5;
        }

        .api-button-full {
          width: 100%;
          min-height: 44px;
        }

        .api-demo-warning {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          padding: 16px 18px;
          margin-bottom: 22px;
          border: 1px solid #f4d58b;
          border-radius: 12px;
          background: #fffaf0;
          color: #874b08;
        }

        .api-warning-icon {
          display: grid;
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 9px;
          background: #fff0c2;
          color: #a15c00;
        }

        .api-demo-warning h2 {
          margin: 1px 0 4px;
          font-size: 13px;
          font-weight: 750;
        }

        .api-demo-warning p {
          margin: 0;
          color: #8b5b1c;
          font-size: 12px;
          line-height: 1.8;
        }

        .api-notice {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 0 0 20px;
          padding: 12px 15px;
          border: 1px solid #b8e6ca;
          border-radius: 10px;
          background: #f0fdf4;
          color: #166534;
        }

        .api-notice p {
          flex: 1;
          margin: 0;
          font-size: 13px;
        }

        .api-notice button {
          display: grid;
          place-items: center;
          padding: 5px;
          border: 0;
          border-radius: 6px;
          background: transparent;
          color: #166534;
        }

        .api-notice button:hover {
          background: #dcfce7;
        }

        .api-metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 17px;
          margin-bottom: 25px;
        }

        .api-metric-card {
          min-width: 0;
          padding: 20px;
          border: 1px solid #e5e9f1;
          border-radius: 15px;
          background: #fff;
          box-shadow: 0 2px 7px rgba(23, 32, 51, 0.025);
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            transform 0.2s ease;
        }

        .api-metric-card:hover {
          border-color: #d7e0f3;
          box-shadow: 0 8px 22px rgba(23, 32, 51, 0.055);
          transform: translateY(-2px);
        }

        .api-metric-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 10px;
        }

        .api-metric-title {
          margin: 0;
          color: #68748a;
          font-size: 12px;
          font-weight: 650;
        }

        .api-metric-value {
          margin: 11px 0 0;
          color: #172033;
          font-size: clamp(25px, 2.3vw, 32px);
          font-weight: 750;
          line-height: 1.15;
          letter-spacing: -0.8px;
          overflow-wrap: anywhere;
        }

        .api-metric-icon {
          display: grid;
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 12px;
        }

        .api-metric-detail {
          margin: 15px 0 0;
          color: #8791a4;
          font-size: 11px;
          line-height: 1.6;
        }

        .api-inventory-card {
          margin-bottom: 22px;
          overflow: visible;
          border: 1px solid #e4e8f0;
          border-radius: 15px;
          background: #fff;
          box-shadow: 0 2px 7px rgba(23, 32, 51, 0.025);
        }

        .api-inventory-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 21px 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .api-inventory-header h2 {
          margin: 0;
          color: #172033;
          font-size: 16px;
          font-weight: 750;
        }

        .api-inventory-header p {
          margin: 5px 0 0;
          color: #8490a4;
          font-size: 12px;
          line-height: 1.7;
        }

        .api-show-prefix-button {
          flex-shrink: 0;
        }

        .api-filter-grid {
          display: grid;
          grid-template-columns: minmax(220px, 1.6fr) minmax(155px, 1fr) minmax(175px, 1fr);
          gap: 12px;
          padding: 18px 22px 12px;
        }

        .api-search-field {
          display: flex;
          align-items: center;
          gap: 9px;
          min-width: 0;
          min-height: 42px;
          padding: 0 12px;
          border: 1px solid #dfe4ee;
          border-radius: 9px;
          background: #fff;
          color: #8791a4;
          transition:
            border-color 0.15s ease,
            box-shadow 0.15s ease;
        }

        .api-search-field:focus-within {
          border-color: #7190f4;
          box-shadow: 0 0 0 3px rgba(49, 95, 234, 0.09);
        }

        .api-search-field input {
          width: 100%;
          min-width: 0;
          padding: 11px 0;
          border: 0;
          outline: none;
          background: transparent;
          color: #172033;
          font-size: 12px;
        }

        .api-search-field input::placeholder {
          color: #a0a9b9;
        }

        .api-search-field button {
          display: grid;
          flex-shrink: 0;
          place-items: center;
          padding: 4px;
          border: 0;
          border-radius: 5px;
          background: transparent;
          color: #7c8799;
        }

        .api-search-field button:hover {
          background: #f0f3f9;
        }

        .api-select,
        .api-form-input {
          width: 100%;
          min-width: 0;
          min-height: 42px;
          padding: 10px 12px;
          border: 1px solid #dfe4ee;
          border-radius: 9px;
          background-color: #fff;
          color: #39445b;
          font-size: 12px;
        }

        .api-select:focus,
        .api-form-input:focus {
          border-color: #7190f4;
          outline: none;
          box-shadow: 0 0 0 3px rgba(49, 95, 234, 0.09);
        }

        .api-results-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 8px 22px 13px;
          color: #8a94a6;
          font-size: 11px;
        }

        .api-results-bar strong {
          color: #445067;
          font-weight: 750;
        }

        .api-results-bar button {
          padding: 3px 0;
          border: 0;
          background: transparent;
          color: #315fea;
          font-size: 11px;
          font-weight: 700;
        }

        .api-results-bar button:hover {
          text-decoration: underline;
        }

        .api-table-wrapper {
          width: 100%;
          overflow-x: auto;
          border-top: 1px solid #edf0f5;
        }

        .api-table {
          width: 100%;
          min-width: 1120px;
          border-collapse: separate;
          border-spacing: 0;
          text-align: left;
        }

        .api-table thead {
          background: #f8f9fc;
        }

        .api-table th {
          padding: 13px 15px;
          border-bottom: 1px solid #e9edf4;
          color: #8993a5;
          font-size: 10px;
          font-weight: 750;
          letter-spacing: 0.7px;
          white-space: nowrap;
        }

        .api-table th:first-child,
        .api-table td:first-child {
          padding-left: 22px;
        }

        .api-table th:last-child,
        .api-table td:last-child {
          padding-right: 18px;
        }

        .api-table td {
          padding: 17px 15px;
          border-bottom: 1px solid #edf0f5;
          color: #4c586d;
          font-size: 12px;
          vertical-align: middle;
        }

        .api-table tbody tr {
          transition: background 0.15s ease;
        }

        .api-table tbody tr:hover {
          background: #f9fbff;
        }

        .api-table tbody tr:last-child td {
          border-bottom: 0;
        }

        .api-key-name-button {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          max-width: 250px;
          padding: 0;
          border: 0;
          background: transparent;
          text-align: left;
        }

        .api-key-title {
          color: #202b40;
          font-size: 12px;
          font-weight: 750;
          line-height: 1.5;
        }

        .api-key-name-button:hover .api-key-title {
          color: #315fea;
        }

        .api-key-prefix {
          max-width: 100%;
          overflow: hidden;
          color: #6d7890;
          font-family: Consolas, Monaco, monospace;
          font-size: 10px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .api-key-id {
          color: #a0a8b6;
          font-family: Consolas, Monaco, monospace;
          font-size: 10px;
        }

        .api-owner {
          display: inline-block;
          max-width: 180px;
          color: #59657a;
          line-height: 1.6;
        }

        .api-table-muted {
          color: #727e93;
          font-size: 11px;
          white-space: nowrap;
        }

        .api-status-badge,
        .api-environment-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 5px 9px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 750;
          white-space: nowrap;
        }

        .api-status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: currentColor;
        }

        .api-status-active {
          background: #eaf8ef;
          color: #168044;
        }

        .api-status-expired {
          background: #fff4df;
          color: #a25a00;
        }

        .api-status-revoked {
          background: #f0f1f4;
          color: #667085;
        }

        .api-status-pending {
          background: #eaf1ff;
          color: #315fea;
        }

        .api-env-production {
          background: #f2ebff;
          color: #7040bd;
        }

        .api-env-staging {
          background: #fff4df;
          color: #9a6109;
        }

        .api-env-development {
          background: #eaf1ff;
          color: #315fea;
        }

        .api-scope-list {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 5px;
          max-width: 260px;
        }

        .api-scope-tag {
          display: inline-flex;
          align-items: center;
          max-width: 100%;
          padding: 5px 7px;
          overflow-wrap: anywhere;
          border: 1px solid #e6eaf1;
          border-radius: 6px;
          background: #f7f8fb;
          color: #58647a;
          font-family: Consolas, Monaco, monospace;
          font-size: 10px;
          line-height: 1.4;
        }

        .api-scope-more {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 25px;
          padding: 4px 7px;
          border-radius: 6px;
          background: #edf3ff;
          color: #315fea;
          font-size: 10px;
          font-weight: 750;
        }

        .api-actions-cell {
          position: relative;
          width: 56px;
          text-align: right;
        }

        .api-icon-button {
          display: inline-grid;
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          place-items: center;
          border: 1px solid #e2e7f0;
          border-radius: 9px;
          background: #fff;
          color: #647087;
          transition:
            border-color 0.15s ease,
            background 0.15s ease,
            color 0.15s ease;
        }

        .api-icon-button:hover {
          border-color: #cbd6ec;
          background: #f5f8ff;
          color: #315fea;
        }

        .api-menu-backdrop {
          position: fixed;
          z-index: 20;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
          background: transparent;
          cursor: default;
        }

        .api-actions-menu {
          position: absolute;
          z-index: 21;
          top: 52px;
          right: 12px;
          width: 190px;
          padding: 5px;
          border: 1px solid #e3e8f1;
          border-radius: 11px;
          background: #fff;
          box-shadow: 0 12px 34px rgba(23, 32, 51, 0.14);
        }

        .api-actions-menu button {
          display: flex;
          align-items: center;
          gap: 9px;
          width: 100%;
          padding: 10px;
          border: 0;
          border-radius: 7px;
          background: transparent;
          color: #465268;
          font-size: 12px;
          text-align: left;
        }

        .api-actions-menu button:hover {
          background: #f3f6fb;
        }

        .api-actions-menu .api-menu-danger {
          color: #c53030;
        }

        .api-actions-menu .api-menu-danger:hover {
          background: #fff1f1;
        }

        .api-empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 54px 20px;
          text-align: center;
        }

        .api-empty-icon {
          display: grid;
          width: 54px;
          height: 54px;
          place-items: center;
          margin-bottom: 14px;
          border-radius: 16px;
          background: #eff4ff;
          color: #315fea;
        }

        .api-empty-state h3 {
          margin: 0;
          color: #263248;
          font-size: 15px;
          font-weight: 750;
        }

        .api-empty-state p {
          margin: 7px 0 17px;
          color: #8490a4;
          font-size: 12px;
        }

        .api-table-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          padding: 14px 22px;
          border-top: 1px solid #edf0f5;
          color: #8a94a6;
          font-size: 10px;
        }

        .api-table-footer span:first-child {
          display: inline-flex;
          align-items: center;
          gap: 7px;
        }

        .api-guidance-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .api-info-card {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          padding: 19px;
          border: 1px solid #e5e9f1;
          border-radius: 14px;
          background: #fff;
        }

        .api-info-icon {
          display: grid;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 11px;
          background: #edf3ff;
          color: #315fea;
        }

        .api-info-card h3 {
          margin: 1px 0 0;
          color: #263248;
          font-size: 13px;
          font-weight: 750;
        }

        .api-info-card p {
          margin: 7px 0 0;
          color: #7d899e;
          font-size: 11px;
          line-height: 1.8;
        }

        .api-page-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          padding: 17px 0 3px;
          border-top: 1px solid #e3e8f0;
          color: #929bad;
          font-size: 11px;
        }

        .api-overlay {
          position: fixed;
          z-index: 100;
          inset: 0;
          background: rgba(17, 24, 39, 0.48);
          backdrop-filter: blur(3px);
        }

        .api-drawer-overlay {
          display: flex;
          justify-content: flex-end;
        }

        .api-details-drawer {
          display: flex;
          flex-direction: column;
          width: 100%;
          max-width: 480px;
          height: 100%;
          padding: 27px;
          overflow-y: auto;
          border-left: 1px solid #e5e9f1;
          background: #fff;
          box-shadow: -12px 0 40px rgba(17, 24, 39, 0.12);
          animation: api-drawer-in 0.2s ease-out;
        }

        .api-drawer-header,
        .api-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
        }

        .api-dialog-eyebrow {
          margin: 0 0 8px;
          color: #315fea;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.1px;
        }

        .api-drawer-header h2,
        .api-modal-header h2 {
          margin: 0;
          color: #172033;
          font-size: 21px;
          font-weight: 750;
          line-height: 1.4;
          letter-spacing: -0.45px;
        }

        .api-dialog-subtitle {
          margin: 5px 0 0;
          color: #8490a4;
          font-size: 12px;
          line-height: 1.7;
        }

        .api-detail-summary {
          display: flex;
          align-items: center;
          gap: 11px;
          margin: 25px 0 21px;
          padding: 14px;
          border: 1px solid #e5eaf3;
          border-radius: 12px;
          background: #f8faff;
        }

        .api-detail-summary-icon {
          display: grid;
          width: 42px;
          height: 42px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 11px;
          background: #e9f0ff;
          color: #315fea;
        }

        .api-detail-summary > div:nth-child(2) {
          flex: 1;
          min-width: 0;
        }

        .api-detail-summary p {
          margin: 0;
          color: #29354b;
          font-size: 12px;
          font-weight: 750;
        }

        .api-detail-summary span {
          display: block;
          margin-top: 3px;
          color: #7e899d;
          font-size: 11px;
        }

        .api-detail-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .api-detail-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
          padding-bottom: 13px;
          border-bottom: 1px solid #edf0f5;
        }

        .api-detail-row span:first-child {
          color: #7c879b;
          font-size: 12px;
        }

        .api-detail-row span:last-child {
          max-width: 65%;
          overflow-wrap: anywhere;
          color: #354157;
          font-size: 12px;
          font-weight: 700;
          text-align: right;
        }

        .api-detail-scopes {
          margin-top: 25px;
        }

        .api-detail-scopes h3 {
          margin: 0;
          color: #29354b;
          font-size: 13px;
          font-weight: 750;
        }

        .api-detail-scopes > p {
          margin: 5px 0 13px;
          color: #8a94a6;
          font-size: 11px;
        }

        .api-detail-scope-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .api-inline-warning {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 24px;
          padding: 13px;
          border: 1px solid #f2d79d;
          border-radius: 10px;
          background: #fffaf0;
          color: #9a6109;
        }

        .api-inline-warning svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .api-inline-warning p {
          margin: 0;
          font-size: 11px;
          line-height: 1.8;
        }

        .api-drawer-actions {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-top: 24px;
          padding-bottom: 8px;
        }

        .api-modal-overlay {
          display: grid;
          place-items: center;
          padding: 20px;
          overflow-y: auto;
        }

        .api-modal {
          width: 100%;
          max-width: 680px;
          max-height: calc(100vh - 40px);
          padding: 27px;
          overflow-y: auto;
          border: 1px solid #e5e9f1;
          border-radius: 17px;
          background: #fff;
          box-shadow: 0 24px 80px rgba(17, 24, 39, 0.2);
          animation: api-modal-in 0.18s ease-out;
        }

        .api-form-warning {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 22px;
          padding: 12px 14px;
          border: 1px solid #d9e5ff;
          border-radius: 10px;
          background: #f5f8ff;
          color: #315fea;
        }

        .api-form-warning svg {
          flex-shrink: 0;
          margin-top: 1px;
        }

        .api-form-warning p {
          margin: 0;
          color: #53658d;
          font-size: 11px;
          line-height: 1.8;
        }

        .api-form-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 17px;
          margin-top: 23px;
        }

        .api-form-label {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
          color: #39445b;
          font-size: 12px;
          font-weight: 700;
        }

        .api-form-label b,
        .api-permissions-section h3 b {
          color: #dc2626;
        }

        .api-form-input {
          min-height: 43px;
          color: #273247;
          font-weight: 400;
        }

        .api-form-input::placeholder {
          color: #a0a9b9;
        }

        .api-permissions-section {
          margin-top: 26px;
        }

        .api-permissions-section h3 {
          margin: 0;
          color: #29354b;
          font-size: 13px;
          font-weight: 750;
        }

        .api-permissions-section > p {
          margin: 5px 0 13px;
          color: #8490a4;
          font-size: 11px;
          line-height: 1.7;
        }

        .api-permission-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 9px;
        }

        .api-permission-option {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
          padding: 13px;
          border: 1px solid #e2e7f0;
          border-radius: 10px;
          background: #fff;
          cursor: pointer;
          transition:
            border-color 0.15s ease,
            background 0.15s ease;
        }

        .api-permission-option:hover {
          border-color: #bacbff;
          background: #f9fbff;
        }

        .api-permission-selected {
          border-color: #b7c9ff;
          background: #f4f7ff;
        }

        .api-permission-option input {
          position: absolute;
          width: 1px;
          height: 1px;
          opacity: 0;
        }

        .api-checkbox-visual {
          display: grid;
          width: 18px;
          height: 18px;
          flex-shrink: 0;
          place-items: center;
          border: 1px solid #d3dbe8;
          border-radius: 5px;
          background: #fff;
          color: transparent;
        }

        .api-permission-selected .api-checkbox-visual {
          border-color: #315fea;
          background: #315fea;
          color: #fff;
        }

        .api-permission-name {
          min-width: 0;
          overflow-wrap: anywhere;
          color: #47536a;
          font-family: Consolas, Monaco, monospace;
          font-size: 11px;
        }

        .api-form-error {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-top: 18px;
          padding: 11px 13px;
          border: 1px solid #fecaca;
          border-radius: 9px;
          background: #fff5f5;
          color: #b42318;
          font-size: 12px;
        }

        .api-generated-key {
          margin-top: 20px;
          padding: 15px;
          border: 1px solid #f1d69c;
          border-radius: 12px;
          background: #fffaf0;
        }

        .api-generated-header {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          color: #9a6109;
        }

        .api-generated-header svg {
          flex-shrink: 0;
        }

        .api-generated-header h3 {
          margin: 0;
          font-size: 12px;
          font-weight: 750;
        }

        .api-generated-header p {
          margin: 5px 0 0;
          color: #8b6425;
          font-size: 11px;
          line-height: 1.7;
        }

        .api-generated-value {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-top: 13px;
        }

        .api-generated-value code {
          flex: 1;
          min-width: 0;
          padding: 10px;
          overflow-wrap: anywhere;
          border: 1px solid #f0e1bd;
          border-radius: 8px;
          background: #fff;
          color: #5f4a24;
          font-family: Consolas, Monaco, monospace;
          font-size: 11px;
        }

        .api-modal-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 26px;
          padding-top: 18px;
          border-top: 1px solid #edf0f5;
        }

        .api-confirm-modal {
          width: 100%;
          max-width: 440px;
          padding: 26px;
          border: 1px solid #e5e9f1;
          border-radius: 16px;
          background: #fff;
          box-shadow: 0 24px 80px rgba(17, 24, 39, 0.2);
          animation: api-modal-in 0.18s ease-out;
        }

        .api-confirm-icon {
          display: grid;
          width: 46px;
          height: 46px;
          place-items: center;
          border-radius: 12px;
          background: #fff0f0;
          color: #c53030;
        }

        .api-confirm-modal h2 {
          margin: 17px 0 0;
          color: #202b40;
          font-size: 19px;
          font-weight: 750;
        }

        .api-confirm-modal > p {
          margin: 9px 0 0;
          color: #758197;
          font-size: 12px;
          line-height: 1.8;
        }

        .api-confirm-actions {
          display: flex;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 9px;
          margin-top: 23px;
        }

        .api-button-danger {
          background: #dc2626;
          color: #fff;
          border-color: #dc2626;
        }

        .api-button-danger:hover {
          background: #b91c1c;
          border-color: #b91c1c;
        }

        @keyframes api-modal-in {
          from {
            opacity: 0;
            transform: translateY(7px) scale(0.99);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes api-drawer-in {
          from {
            opacity: 0.7;
            transform: translateX(18px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @media (min-width: 1500px) {
          .api-security-page {
            padding: 34px;
          }

          .api-metric-card {
            padding: 23px;
          }
        }

        @media (max-width: 1100px) {
          .api-security-page {
            padding: 23px;
          }

          .api-metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .api-filter-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .api-search-field {
            grid-column: 1 / -1;
          }

          .api-guidance-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .api-security-page {
            padding: 16px;
          }

          .api-page-header {
            flex-direction: column;
            gap: 18px;
          }

          .api-header-actions {
            width: 100%;
          }

          .api-header-actions .api-button {
            flex: 1;
          }

          .api-eyebrow {
            font-size: 9px;
            letter-spacing: 0.65px;
          }

          .api-page-description {
            font-size: 13px;
          }

          .api-demo-warning {
            padding: 13px;
          }

          .api-metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .api-metric-card {
            padding: 14px;
            border-radius: 12px;
          }

          .api-metric-title {
            font-size: 11px;
          }

          .api-metric-value {
            font-size: 25px;
          }

          .api-metric-icon {
            width: 36px;
            height: 36px;
          }

          .api-metric-detail {
            font-size: 10px;
          }

          .api-inventory-header {
            align-items: flex-start;
            flex-direction: column;
            padding: 17px;
          }

          .api-filter-grid {
            grid-template-columns: 1fr;
            padding: 15px 17px 10px;
          }

          .api-search-field {
            grid-column: auto;
          }

          .api-results-bar {
            padding-right: 17px;
            padding-left: 17px;
          }

          .api-table-footer {
            padding-right: 17px;
            padding-left: 17px;
          }

          .api-details-drawer {
            padding: 21px;
          }

          .api-modal-overlay {
            padding: 10px;
          }

          .api-modal {
            max-height: calc(100vh - 20px);
            padding: 20px;
            border-radius: 14px;
          }

          .api-form-grid,
          .api-permission-grid {
            grid-template-columns: 1fr;
          }

          .api-generated-value {
            align-items: stretch;
            flex-direction: column;
          }

          .api-modal-footer {
            justify-content: stretch;
          }

          .api-modal-footer .api-button {
            flex: 1;
          }

          .api-page-footer {
            flex-direction: column;
            align-items: flex-start;
          }
        }

        @media (max-width: 390px) {
          .api-security-page {
            padding: 11px;
          }

          .api-metrics-grid {
            grid-template-columns: 1fr;
          }

          .api-header-actions {
            flex-direction: column;
          }

          .api-header-actions .api-button {
            width: 100%;
          }

          .api-details-drawer {
            padding: 16px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .api-security-page *,
          .api-security-page *::before,
          .api-security-page *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>
    </main>
  );
}

function KeyStatusBadge({ status }: { status: KeyStatus }) {
  const classNames: Record<KeyStatus, string> = {
    Active: "api-status-active",
    Expired: "api-status-expired",
    Revoked: "api-status-revoked",
    Pending: "api-status-pending",
  };

  return (
    <span className={`api-status-badge ${classNames[status]}`}>
      <span className="api-status-dot" />
      {status}
    </span>
  );
}

function EnvironmentBadge({
  environment,
}: {
  environment: KeyEnvironment;
}) {
  const classNames: Record<KeyEnvironment, string> = {
    Production: "api-env-production",
    Staging: "api-env-staging",
    Development: "api-env-development",
  };

  return (
    <span className={`api-environment-badge ${classNames[environment]}`}>
      {environment}
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
    <div className="api-detail-row">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function InfoCard({
  icon: Icon,
  title,
  description,
}: {
  icon: ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
}) {
  return (
    <article className="api-info-card">
      <div className="api-info-icon">
        <Icon size={19} />
      </div>
      <div>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </article>
  );
}

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="api-overlay api-modal-overlay"
      onClick={onCancel}
    >
      <section
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="api-confirm-title"
        className="api-confirm-modal"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="api-confirm-icon">
          <Trash2 size={21} />
        </div>

        <h2 id="api-confirm-title">{title}</h2>
        <p>{description}</p>

        <div className="api-confirm-actions">
          <button
            type="button"
            onClick={onCancel}
            className="api-button api-button-secondary"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="api-button api-button-danger"
          >
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>
  );
}