
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Download,
  Gauge,
  Layers3,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  X,
  Zap,
} from "lucide-react";

type UsageRecord = {
  id: string;
  name: string;
  type: "Organization" | "Workspace" | "User" | "API Key";
  requests: number;
  tokens: number;
  cost: number;
  limit: number;
  status: "Normal" | "Warning" | "Exceeded";
};

const initialUsage: UsageRecord[] = [
  { id: "org-001", name: "ModelNow Internal", type: "Organization", requests: 18240, tokens: 4850000, cost: 42.8, limit: 100, status: "Normal" },
  { id: "org-002", name: "Acme AI", type: "Organization", requests: 14560, tokens: 3920000, cost: 78.4, limit: 100, status: "Warning" },
  { id: "ws-001", name: "Production Workspace", type: "Workspace", requests: 9270, tokens: 2130000, cost: 31.2, limit: 60, status: "Normal" },
  { id: "user-001", name: "admin@modelnow.ai", type: "User", requests: 2840, tokens: 740000, cost: 8.5, limit: 20, status: "Normal" },
  { id: "key-001", name: "Production API Key", type: "API Key", requests: 22300, tokens: 5800000, cost: 112.6, limit: 100, status: "Exceeded" },
  { id: "ws-002", name: "Development Workspace", type: "Workspace", requests: 4620, tokens: 920000, cost: 17.3, limit: 40, status: "Normal" },
];

const initialLimits = {
  organizationMonthlyBudget: "1000",
  workspaceMonthlyBudget: "300",
  userMonthlyBudget: "100",
  requestsPerMinute: "120",
  requestsPerHour: "3000",
  requestsPerDay: "25000",
  tokensPerMinute: "100000",
  maxInputTokens: "32000",
  maxOutputTokens: "8000",
  warningThreshold: "80",
  hardLimitThreshold: "100",
  concurrentRequests: "20",
  burstLimit: "30",
  resetPeriod: "monthly",
  enableOrganizationLimits: true,
  enableWorkspaceLimits: true,
  enableUserLimits: true,
  enableApiKeyLimits: true,
  enableTokenLimits: true,
  enableRequestLimits: true,
  enableBudgetAlerts: true,
  enableHardStop: true,
  enableAutomaticReset: true,
  enableRateLimitHeaders: true,
  enableBurstProtection: true,
};

type Limits = typeof initialLimits;

export default function UsageRateLimitsPage() {
  const [usage, setUsage] = useState<UsageRecord[]>(initialUsage);
  const [limits, setLimits] = useState<Limits>(initialLimits);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("overview");
  const [notice, setNotice] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<UsageRecord | null>(null);
  const [draftLimit, setDraftLimit] = useState("100");

  const totalRequests = usage.reduce((sum, item) => sum + item.requests, 0);
  const totalTokens = usage.reduce((sum, item) => sum + item.tokens, 0);
  const totalCost = usage.reduce((sum, item) => sum + item.cost, 0);
  const warningCount = usage.filter((item) => item.status === "Warning").length;
  const exceededCount = usage.filter((item) => item.status === "Exceeded").length;

  const filteredUsage = useMemo(
    () =>
      usage.filter((item) => {
        const matchesSearch = `${item.name} ${item.id} ${item.type}`
          .toLowerCase()
          .includes(search.toLowerCase());

        const matchesType = typeFilter === "All" || item.type === typeFilter;
        const matchesStatus = statusFilter === "All" || item.status === statusFilter;

        return matchesSearch && matchesType && matchesStatus;
      }),
    [usage, search, typeFilter, statusFilter],
  );

  function updateLimit<K extends keyof Limits>(key: K, value: Limits[K]) {
    setLimits((current) => ({ ...current, [key]: value }));
  }

  function saveConfiguration() {
    try {
      localStorage.setItem("modelnow-usage-rate-limits", JSON.stringify(limits));
      localStorage.setItem("modelnow-usage-records", JSON.stringify(usage));
      setNotice(
        "Configuration saved in this browser. Connect the backend usage service to enforce these limits against live requests.",
      );
    } catch {
      setNotice("Unable to save configuration in this browser.");
    }
  }

  function openEdit(record: UsageRecord) {
    setEditingRecord(record);
    setDraftLimit(String(record.limit));
    setShowEditModal(true);
  }

  function saveRecordLimit() {
    if (!editingRecord) return;

    const parsedLimit = Number(draftLimit);

    if (!Number.isFinite(parsedLimit) || parsedLimit <= 0) {
      setNotice("Enter a valid limit greater than zero.");
      return;
    }

    setUsage((current) =>
      current.map((item) => {
        if (item.id !== editingRecord.id) return item;

        const percentage = (item.cost / parsedLimit) * 100;
        const status: UsageRecord["status"] =
          percentage >= 100
            ? "Exceeded"
            : percentage >= Number(limits.warningThreshold)
              ? "Warning"
              : "Normal";

        return { ...item, limit: parsedLimit, status };
      }),
    );

    setShowEditModal(false);
    setNotice("The demo usage limit has been updated.");
  }

  function exportCSV() {
    const header = [
      "ID",
      "Name",
      "Type",
      "Requests",
      "Tokens",
      "Cost USD",
      "Budget USD",
      "Status",
    ];

    const rows = filteredUsage.map((item) => [
      item.id,
      item.name,
      item.type,
      item.requests,
      item.tokens,
      item.cost,
      item.limit,
      item.status,
    ]);

    const csv = [header, ...rows]
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");

    anchor.href = url;
    anchor.download = "modelnow-usage-rate-limits.csv";
    anchor.click();

    URL.revokeObjectURL(url);
    setNotice("Usage report exported.");
  }

  function resetDemoData() {
    setUsage(initialUsage);
    setLimits(initialLimits);
    setSearch("");
    setTypeFilter("All");
    setStatusFilter("All");
    setNotice("Demo usage data and settings have been reset.");
  }

  function Toggle({
    title,
    description,
    checked,
    onChange,
  }: {
    title: string;
    description: string;
    checked: boolean;
    onChange: (value: boolean) => void;
  }) {
    return (
      <div className="limits-toggle-row">
        <div>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={title}
          className={`limits-switch ${checked ? "on" : ""}`}
          onClick={() => onChange(!checked)}
        />
      </div>
    );
  }

  function StatCard({
    title,
    value,
    subtitle,
    icon,
    tone = "blue",
  }: {
    title: string;
    value: string;
    subtitle: string;
    icon: React.ReactNode;
    tone?: string;
  }) {
    return (
      <div className="limits-stat">
        <div className={`limits-stat-icon ${tone}`}>{icon}</div>
        <div className="limits-stat-content">
          <div className="limits-stat-label">{title}</div>
          <div className="limits-stat-value">{value}</div>
          <div className="limits-stat-subtitle">{subtitle}</div>
        </div>
      </div>
    );
  }

  return (
    <main className="limits-page">
      <style>{`
        .limits-page{min-height:100vh;padding:30px;background:#f7f8fc;color:#202a40;font-family:Arial,Helvetica,sans-serif}
        .limits-container{max-width:1280px;margin:0 auto}
        .limits-breadcrumb{display:flex;flex-wrap:wrap;gap:9px;margin-bottom:22px;color:#858da0;font-size:13px}
        .limits-breadcrumb a{color:#5265d9;text-decoration:none}
        .limits-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:25px}
        .limits-heading-main{display:flex;align-items:center;gap:14px}
        .limits-heading-icon{display:grid;place-items:center;width:50px;height:50px;flex-shrink:0;border-radius:14px;background:#e9edff;color:#5265d9}
        .limits-heading h1{margin:0 0 7px;font-size:27px;letter-spacing:-.6px}
        .limits-heading p{max-width:720px;margin:0;color:#7e8799;font-size:13px;line-height:1.7}
        .limits-actions{display:flex;flex-wrap:wrap;gap:9px}
        .limits-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:39px;padding:0 13px;border:1px solid #dfe4ed;border-radius:9px;background:white;color:#414c64;font-size:12px;font-weight:600;cursor:pointer}
        .limits-btn.primary{background:#5265d9;border-color:#5265d9;color:white}
        .limits-btn:disabled{opacity:.45;cursor:not-allowed}
        .limits-notice{display:flex;align-items:flex-start;gap:10px;margin-bottom:18px;padding:13px 15px;border:1px solid #dce4ff;border-radius:10px;background:#f0f3ff;color:#4055b5;font-size:12px;line-height:1.6}
        .limits-warning{display:flex;align-items:flex-start;gap:12px;margin-bottom:20px;padding:15px;border:1px solid #f3dfb1;border-radius:11px;background:#fff9e9;color:#94651a;font-size:12px;line-height:1.7}
        .limits-warning strong{display:block;margin-bottom:4px}
        .limits-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:22px}
        .limits-stat{display:flex;align-items:flex-start;gap:13px;padding:19px;border:1px solid #e7eaf1;border-radius:12px;background:white}
        .limits-stat-icon{display:grid;place-items:center;width:41px;height:41px;flex-shrink:0;border-radius:10px;background:#edf0ff;color:#5265d9}
        .limits-stat-icon.green{background:#e8f8ef;color:#258452}
        .limits-stat-icon.orange{background:#fff5df;color:#a36e12}
        .limits-stat-icon.red{background:#fff0f0;color:#c24141}
        .limits-stat-label{margin:1px 0 7px;color:#818a9c;font-size:11px}
        .limits-stat-value{font-size:23px;font-weight:700;letter-spacing:-.3px}
        .limits-stat-subtitle{margin-top:6px;color:#929aab;font-size:10px;line-height:1.5}
        .limits-tabs{display:flex;flex-wrap:wrap;gap:6px;padding:6px;margin-bottom:18px;border:1px solid #e7eaf1;border-radius:11px;background:white}
        .limits-tab{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 14px;border:0;border-radius:7px;background:transparent;color:#6f7890;font-size:12px;font-weight:600;cursor:pointer}
        .limits-tab.active{background:#edf0ff;color:#485dd0}
        .limits-card{overflow:hidden;margin-bottom:18px;border:1px solid #e7eaf1;border-radius:13px;background:white;box-shadow:0 2px 7px rgba(24,36,70,.025)}
        .limits-card-header{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:20px 22px;border-bottom:1px solid #edf0f5}
        .limits-card-header h2{margin:0 0 6px;font-size:15px}
        .limits-card-header p{margin:0;color:#858da0;font-size:12px;line-height:1.6}
        .limits-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:17px;padding:22px}
        .limits-field{display:flex;flex-direction:column;gap:8px;min-width:0}
        .limits-field.full{grid-column:1/-1}
        .limits-field label{color:#39445a;font-size:12px;font-weight:700}
        .limits-field input,.limits-field select{width:100%;height:42px;padding:0 12px;border:1px solid #dfe4ed;border-radius:8px;outline:none;background:white;color:#202a40;font:inherit;font-size:12px}
        .limits-field input:focus,.limits-field select:focus{border-color:#8290ed;box-shadow:0 0 0 3px #edf0ff}
        .limits-field small{color:#8991a2;font-size:11px;line-height:1.6}
        .limits-toggle-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:17px 22px;border-bottom:1px solid #edf0f5}
        .limits-toggle-row:last-child{border-bottom:0}
        .limits-toggle-row strong{display:block;margin-bottom:5px;font-size:12px}
        .limits-toggle-row p{margin:0;color:#858da0;font-size:11px;line-height:1.6}
        .limits-switch{position:relative;width:38px;height:22px;flex:0 0 auto;padding:0;border:0;border-radius:20px;background:#cbd1dd;cursor:pointer}
        .limits-switch.on{background:#5265d9}
        .limits-switch:after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:white;transition:transform .15s ease}
        .limits-switch.on:after{transform:translateX(16px)}
        .limits-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:16px 22px;border-bottom:1px solid #edf0f5}
        .limits-search{position:relative;flex:1 1 220px;min-width:180px}
        .limits-search svg{position:absolute;top:12px;left:12px;color:#929bad}
        .limits-search input{width:100%;height:40px;padding:0 12px 0 37px;border:1px solid #dfe4ed;border-radius:8px;outline:none;font-size:12px}
        .limits-filter{height:40px;min-width:135px;padding:0 30px 0 12px;border:1px solid #dfe4ed;border-radius:8px;background:white;color:#4b566d;font-size:12px}
        .limits-table-wrap{overflow-x:auto}
        .limits-table{width:100%;border-collapse:collapse;text-align:left;white-space:nowrap}
        .limits-table th{padding:14px 16px;background:#fafbfe;color:#7f889a;font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase}
        .limits-table td{padding:15px 16px;border-top:1px solid #edf0f5;color:#4b566d;font-size:12px}
        .limits-table strong{color:#263149}
        .limits-muted{margin-top:5px;color:#8991a2;font-size:10px}
        .limits-badge{display:inline-flex;align-items:center;gap:5px;padding:5px 9px;border-radius:20px;background:#f0f1f5;color:#697386;font-size:10px;font-weight:700}
        .limits-badge.green{background:#eaf9f0;color:#218552}
        .limits-badge.orange{background:#fff5df;color:#9a6a12}
        .limits-badge.red{background:#fff0f0;color:#c24141}
        .limits-icon-btn{display:grid;place-items:center;width:32px;height:32px;border:1px solid #e4e8f0;border-radius:7px;background:white;color:#66718a;cursor:pointer}
        .limits-progress{height:7px;min-width:90px;overflow:hidden;border-radius:10px;background:#edf0f5}
        .limits-progress span{display:block;height:100%;border-radius:10px;background:#5265d9}
        .limits-progress span.orange{background:#e7a23b}
        .limits-progress span.red{background:#d64b4b}
        .limits-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 22px;border-top:1px solid #edf0f5;color:#858da0;font-size:11px}
        .limits-empty{padding:42px 20px;text-align:center;color:#858da0;font-size:13px}
        .limits-breakdown{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;padding:22px}
        .limits-breakdown-card{padding:17px;border:1px solid #e7eaf1;border-radius:10px;background:#fcfcff}
        .limits-breakdown-card span{display:block;margin-bottom:8px;color:#858da0;font-size:11px}
        .limits-breakdown-card strong{font-size:21px}
        .limits-modal-backdrop{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:20px;background:rgba(20,28,48,.45)}
        .limits-modal{width:100%;max-width:480px;overflow:hidden;border:1px solid #e7eaf1;border-radius:15px;background:white;box-shadow:0 20px 70px rgba(20,28,48,.2)}
        .limits-modal-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px 22px;border-bottom:1px solid #edf0f5}
        .limits-modal-header h2{margin:0;font-size:17px}
        .limits-modal-body{padding:22px}
        .limits-modal-actions{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:9px;margin-top:22px}
        @media(max-width:1000px){.limits-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:650px){.limits-page{padding:18px 12px}.limits-heading{flex-direction:column}.limits-heading h1{font-size:23px}.limits-actions{width:100%}.limits-btn{flex:1}.limits-tabs{overflow-x:auto;flex-wrap:nowrap}.limits-tab{white-space:nowrap}.limits-form-grid{grid-template-columns:1fr}.limits-field.full{grid-column:auto}.limits-breakdown{grid-template-columns:1fr}.limits-footer{align-items:flex-start;flex-direction:column}}
      `}</style>

      <div className="limits-container">
        <div className="limits-breadcrumb">
          <a href="/dashboard">Admin</a>
          <span>/</span>
          <a href="/settings">Settings</a>
          <span>/</span>
          <span>Usage &amp; Rate Limits</span>
        </div>

        <header className="limits-heading">
          <div className="limits-heading-main">
            <div className="limits-heading-icon"><Gauge size={24} /></div>
            <div>
              <h1>Usage &amp; Rate Limits</h1>
              <p>
                Monitor AI consumption, configure budgets, enforce request and
                token limits, and manage usage protection across ModelNow.
              </p>
            </div>
          </div>
          <div className="limits-actions">
            <button type="button" className="limits-btn" onClick={resetDemoData}>
              <RefreshCw size={14} />Reset Demo
            </button>
            <button type="button" className="limits-btn" onClick={exportCSV}>
              <Download size={14} />Export CSV
            </button>
            <button type="button" className="limits-btn primary" onClick={saveConfiguration}>
              <Save size={14} />Save Settings
            </button>
          </div>
        </header>

        {notice && (
          <div className="limits-notice" role="status">
            <CheckCircle2 size={17} />
            <span style={{ flex: 1 }}>{notice}</span>
            <button type="button" className="limits-icon-btn" aria-label="Dismiss notification" onClick={() => setNotice("")}>
              <X size={14} />
            </button>
          </div>
        )}

        <div className="limits-warning">
          <AlertTriangle size={19} />
          <div>
            <strong>Demo data — production enforcement requires backend integration</strong>
            Usage figures are illustrative. Browser-side settings do not restrict live
            API traffic. Apply quotas and rate limits in the API gateway or usage
            service, using atomic counters, organization-aware policies, and server-side
            billing records.
          </div>
        </div>

        <section className="limits-stats">
          <StatCard title="Total Requests" value={totalRequests.toLocaleString("en-US")} subtitle="Across displayed demo records" icon={<Activity size={19} />} />
          <StatCard title="Tokens Processed" value={`${(totalTokens / 1000000).toFixed(2)}M`} subtitle="Illustrative input and output usage" icon={<Zap size={19} />} tone="green" />
          <StatCard title="Estimated Cost" value={`$${totalCost.toFixed(2)}`} subtitle="Demo consumption estimate" icon={<BarChart3 size={19} />} tone="orange" />
          <StatCard title="Limit Alerts" value={String(warningCount + exceededCount)} subtitle={`${warningCount} warning · ${exceededCount} exceeded`} icon={<AlertTriangle size={19} />} tone={exceededCount > 0 ? "red" : "blue"} />
        </section>

        <div className="limits-tabs">
          <button type="button" className={`limits-tab ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}><BarChart3 size={15} />Usage Overview</button>
          <button type="button" className={`limits-tab ${activeTab === "quotas" ? "active" : ""}`} onClick={() => setActiveTab("quotas")}><Layers3 size={15} />Quotas &amp; Budgets</button>
          <button type="button" className={`limits-tab ${activeTab === "rate" ? "active" : ""}`} onClick={() => setActiveTab("rate")}><Gauge size={15} />Rate Limits</button>
          <button type="button" className={`limits-tab ${activeTab === "protection" ? "active" : ""}`} onClick={() => setActiveTab("protection")}><ShieldCheck size={15} />Protection</button>
        </div>

        {activeTab === "overview" && (
          <>
            <section className="limits-card">
              <div className="limits-card-header">
                <div>
                  <h2>Usage by Organization, Workspace &amp; User</h2>
                  <p>Review request volume, token consumption, estimated cost, and budget utilization.</p>
                </div>
                <button type="button" className="limits-btn" onClick={exportCSV}><Download size={14} />Export</button>
              </div>
              <div className="limits-toolbar">
                <div className="limits-search">
                  <Search size={16} />
                  <input aria-label="Search usage records" placeholder="Search names or IDs..." value={search} onChange={(event) => setSearch(event.target.value)} />
                </div>
                <select aria-label="Filter usage by type" className="limits-filter" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                  <option value="All">All types</option>
                  <option value="Organization">Organization</option>
                  <option value="Workspace">Workspace</option>
                  <option value="User">User</option>
                  <option value="API Key">API Key</option>
                </select>
                <select aria-label="Filter usage by status" className="limits-filter" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                  <option value="All">All statuses</option>
                  <option value="Normal">Normal</option>
                  <option value="Warning">Warning</option>
                  <option value="Exceeded">Exceeded</option>
                </select>
              </div>
              <div className="limits-table-wrap">
                <table className="limits-table">
                  <thead>
                    <tr><th>Name</th><th>Type</th><th>Requests</th><th>Tokens</th><th>Cost</th><th>Budget Usage</th><th>Status</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filteredUsage.map((item) => {
                      const percentage = Math.min(100, (item.cost / item.limit) * 100);
                      const tone = item.status === "Exceeded" ? "red" : item.status === "Warning" ? "orange" : "";
                      return (
                        <tr key={item.id}>
                          <td><strong>{item.name}</strong><div className="limits-muted">{item.id}</div></td>
                          <td>{item.type}</td>
                          <td>{item.requests.toLocaleString("en-US")}</td>
                          <td>{item.tokens.toLocaleString("en-US")}</td>
                          <td><strong>${item.cost.toFixed(2)}</strong></td>
                          <td style={{ minWidth: 140 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 7 }}>
                              <span>{percentage.toFixed(1)}%</span>
                              <span className="limits-muted">${item.limit.toFixed(0)}</span>
                            </div>
                            <div className="limits-progress"><span className={tone} style={{ width: `${percentage}%` }} /></div>
                          </td>
                          <td><span className={`limits-badge ${item.status === "Normal" ? "green" : item.status === "Warning" ? "orange" : "red"}`}>{item.status}</span></td>
                          <td><button type="button" className="limits-icon-btn" title="Edit budget limit" aria-label={`Edit budget for ${item.name}`} onClick={() => openEdit(item)}><SlidersHorizontal size={14} /></button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                {filteredUsage.length === 0 && <div className="limits-empty">No usage records match the selected filters.</div>}
              </div>
              <div className="limits-footer">
                <span>Showing {filteredUsage.length} of {usage.length} records</span>
                <span>Displayed usage and costs are sample values.</span>
              </div>
            </section>

            <section className="limits-card">
              <div className="limits-card-header">
                <div><h2>Usage Summary</h2><p>Aggregate values for the current sample dataset.</p></div>
                <Activity size={20} color="#5265d9" />
              </div>
              <div className="limits-breakdown">
                <div className="limits-breakdown-card"><span>Total organizations</span><strong>{usage.filter((item) => item.type === "Organization").length}</strong></div>
                <div className="limits-breakdown-card"><span>Workspaces</span><strong>{usage.filter((item) => item.type === "Workspace").length}</strong></div>
                <div className="limits-breakdown-card"><span>API keys</span><strong>{usage.filter((item) => item.type === "API Key").length}</strong></div>
              </div>
            </section>
          </>
        )}

        {activeTab === "quotas" && (
          <>
            <section className="limits-card">
              <div className="limits-card-header">
                <div><h2>Budget &amp; Quota Defaults</h2><p>Configure default spending budgets for each resource scope.</p></div>
                <Users size={21} color="#5265d9" />
              </div>
              <div className="limits-form-grid">
                <div className="limits-field">
                  <label htmlFor="orgBudget">Organization Monthly Budget (USD)</label>
                  <input id="orgBudget" type="number" min="0" value={limits.organizationMonthlyBudget} onChange={(event) => updateLimit("organizationMonthlyBudget", event.target.value)} />
                  <small>Maximum monthly spend allowed for an organization.</small>
                </div>
                <div className="limits-field">
                  <label htmlFor="workspaceBudget">Workspace Monthly Budget (USD)</label>
                  <input id="workspaceBudget" type="number" min="0" value={limits.workspaceMonthlyBudget} onChange={(event) => updateLimit("workspaceMonthlyBudget", event.target.value)} />
                  <small>Default budget for each workspace.</small>
                </div>
                <div className="limits-field">
                  <label htmlFor="userBudget">User Monthly Budget (USD)</label>
                  <input id="userBudget" type="number" min="0" value={limits.userMonthlyBudget} onChange={(event) => updateLimit("userMonthlyBudget", event.target.value)} />
                  <small>Per-user budget when individual quotas are enabled.</small>
                </div>
                <div className="limits-field">
                  <label htmlFor="resetPeriod">Quota Reset Period</label>
                  <select id="resetPeriod" value={limits.resetPeriod} onChange={(event) => updateLimit("resetPeriod", event.target.value)}>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="billing-cycle">Billing cycle</option>
                  </select>
                  <small>Reset periods must use a consistent server-side timezone.</small>
                </div>
                <div className="limits-field">
                  <label htmlFor="warningThreshold">Warning Threshold (%)</label>
                  <input id="warningThreshold" type="number" min="1" max="100" value={limits.warningThreshold} onChange={(event) => updateLimit("warningThreshold", event.target.value)} />
                  <small>Send alerts when the configured budget is approaching its limit.</small>
                </div>
                <div className="limits-field">
                  <label htmlFor="hardLimitThreshold">Hard Limit Threshold (%)</label>
                  <input id="hardLimitThreshold" type="number" min="1" max="200" value={limits.hardLimitThreshold} onChange={(event) => updateLimit("hardLimitThreshold", event.target.value)} />
                  <small>Define the enforcement threshold for budget protection.</small>
                </div>
              </div>
              <Toggle title="Organization Quotas" description="Apply default monthly budgets and usage caps to organizations." checked={limits.enableOrganizationLimits} onChange={(value) => updateLimit("enableOrganizationLimits", value)} />
              <Toggle title="Workspace Quotas" description="Apply workspace-level budgets independently within organization policy." checked={limits.enableWorkspaceLimits} onChange={(value) => updateLimit("enableWorkspaceLimits", value)} />
              <Toggle title="User Quotas" description="Enforce per-user spending and consumption limits." checked={limits.enableUserLimits} onChange={(value) => updateLimit("enableUserLimits", value)} />
              <Toggle title="API Key Quotas" description="Support dedicated quotas for individual API credentials." checked={limits.enableApiKeyLimits} onChange={(value) => updateLimit("enableApiKeyLimits", value)} />
              <div className="limits-footer">
                <span>Define how nested quotas interact in the backend policy service.</span>
                <button type="button" className="limits-btn primary" onClick={saveConfiguration}><Save size={14} />Save Quotas</button>
              </div>
            </section>
          </>
        )}

        {activeTab === "rate" && (
          <>
            <section className="limits-card">
              <div className="limits-card-header">
                <div><h2>Request Rate Limits</h2><p>Configure request limits across time windows.</p></div>
                <Gauge size={21} color="#5265d9" />
              </div>
              <div className="limits-form-grid">
                <div className="limits-field">
                  <label htmlFor="rpm">Requests per Minute</label>
                  <input id="rpm" type="number" min="1" value={limits.requestsPerMinute} onChange={(event) => updateLimit("requestsPerMinute", event.target.value)} />
                  <small>Short-window protection against traffic spikes.</small>
                </div>
                <div className="limits-field">
                  <label htmlFor="rph">Requests per Hour</label>
                  <input id="rph" type="number" min="1" value={limits.requestsPerHour} onChange={(event) => updateLimit("requestsPerHour", event.target.value)} />
                  <small>Hourly request quota per configured scope.</small>
                </div>
                <div className="limits-field">
                  <label htmlFor="rpd">Requests per Day</label>
                  <input id="rpd" type="number" min="1" value={limits.requestsPerDay} onChange={(event) => updateLimit("requestsPerDay", event.target.value)} />
                  <small>Daily request quota, independent of burst limits.</small>
                </div>
                <div className="limits-field">
                  <label htmlFor="concurrent">Concurrent Requests</label>
                  <input id="concurrent" type="number" min="1" value={limits.concurrentRequests} onChange={(event) => updateLimit("concurrentRequests", event.target.value)} />
                  <small>Maximum simultaneous requests per applicable scope.</small>
                </div>
                <div className="limits-field">
                  <label htmlFor="burst">Burst Limit</label>
                  <input id="burst" type="number" min="1" value={limits.burstLimit} onChange={(event) => updateLimit("burstLimit", event.target.value)} />
                  <small>Temporary burst capacity above the sustained request rate.</small>
                </div>
              </div>
              <Toggle title="Enable Request Limits" description="Apply configured request limits at the API gateway or request service." checked={limits.enableRequestLimits} onChange={(value) => updateLimit("enableRequestLimits", value)} />
              <Toggle title="Enable Burst Protection" description="Apply bounded burst handling to prevent sudden traffic spikes." checked={limits.enableBurstProtection} onChange={(value) => updateLimit("enableBurstProtection", value)} />
              <Toggle title="Expose Rate Limit Headers" description="Return remaining quota and reset metadata in API responses." checked={limits.enableRateLimitHeaders} onChange={(value) => updateLimit("enableRateLimitHeaders", value)} />
              <div className="limits-footer">
                <span>Use atomic distributed counters for accurate enforcement across multiple instances.</span>
                <button type="button" className="limits-btn primary" onClick={saveConfiguration}><Save size={14} />Save Rate Limits</button>
              </div>
            </section>

            <section className="limits-card">
              <div className="limits-card-header">
                <div><h2>Token Limits</h2><p>Bound model input, output, and token throughput.</p></div>
                <Zap size={21} color="#5265d9" />
              </div>
              <div className="limits-form-grid">
                <div className="limits-field">
                  <label htmlFor="tpm">Tokens per Minute</label>
                  <input id="tpm" type="number" min="1" value={limits.tokensPerMinute} onChange={(event) => updateLimit("tokensPerMinute", event.target.value)} />
                  <small>Token throughput cap across the selected scope.</small>
                </div>
                <div className="limits-field">
                  <label htmlFor="inputTokens">Maximum Input Tokens</label>
                  <input id="inputTokens" type="number" min="1" value={limits.maxInputTokens} onChange={(event) => updateLimit("maxInputTokens", event.target.value)} />
                  <small>Maximum accepted prompt or context token count.</small>
                </div>
                <div className="limits-field">
                  <label htmlFor="outputTokens">Maximum Output Tokens</label>
                  <input id="outputTokens" type="number" min="1" value={limits.maxOutputTokens} onChange={(event) => updateLimit("maxOutputTokens", event.target.value)} />
                  <small>Maximum generated tokens per request, subject to model capabilities.</small>
                </div>
              </div>
              <Toggle title="Enable Token Limits" description="Validate token throughput and input/output caps before model execution." checked={limits.enableTokenLimits} onChange={(value) => updateLimit("enableTokenLimits", value)} />
              <div className="limits-footer">
                <span>Tokenization and actual provider usage should be verified server-side.</span>
                <button type="button" className="limits-btn primary" onClick={saveConfiguration}><Save size={14} />Save Token Limits</button>
              </div>
            </section>
          </>
        )}

        {activeTab === "protection" && (
          <>
            <section className="limits-card">
              <div className="limits-card-header">
                <div><h2>Usage Protection Policies</h2><p>Choose how ModelNow should respond when usage approaches or exceeds configured limits.</p></div>
                <ShieldCheck size={21} color="#5265d9" />
              </div>
              <Toggle title="Budget Alerts" description="Notify authorized administrators when spending reaches the warning threshold." checked={limits.enableBudgetAlerts} onChange={(value) => updateLimit("enableBudgetAlerts", value)} />
              <Toggle title="Hard Budget Stop" description="Reject further billable requests after a hard budget threshold is reached." checked={limits.enableHardStop} onChange={(value) => updateLimit("enableHardStop", value)} />
              <Toggle title="Automatic Quota Reset" description="Reset quota counters according to the selected period." checked={limits.enableAutomaticReset} onChange={(value) => updateLimit("enableAutomaticReset", value)} />
              <Toggle title="Rate Limit Response Headers" description="Include rate-limit and reset information in applicable API responses." checked={limits.enableRateLimitHeaders} onChange={(value) => updateLimit("enableRateLimitHeaders", value)} />
              <Toggle title="Provider-Level Token Protection" description="Keep configured token ceilings within provider limits and model capabilities." checked={limits.enableTokenLimits} onChange={(value) => updateLimit("enableTokenLimits", value)} />
              <div className="limits-footer">
                <span>Ensure emergency overrides are authorized, audited, and time-limited.</span>
                <button type="button" className="limits-btn primary" onClick={saveConfiguration}><Save size={14} />Save Protection</button>
              </div>
            </section>

            <section className="limits-card">
              <div className="limits-card-header">
                <div><h2>Recommended Enforcement Sequence</h2><p>Reference sequence for applying usage controls to incoming requests.</p></div>
                <Clock3 size={21} color="#5265d9" />
              </div>
              <div style={{ padding: 22, display: "grid", gap: 17 }}>
                {[
                  ["01", "Authenticate request", "Resolve the API key, organization, workspace, and user permissions."],
                  ["02", "Check quotas and budget", "Evaluate remaining budgets and applicable hard-stop policies."],
                  ["03", "Apply rate limits", "Check distributed counters, concurrent requests, and burst capacity."],
                  ["04", "Validate token limits", "Validate model context length, input tokens, and requested output tokens."],
                  ["05", "Record consumption", "Track actual provider usage and reconcile final cost after inference."],
                  ["06", "Notify and audit", "Send threshold alerts and record policy decisions without exposing secrets."],
                ].map(([number, title, description], index) => (
                  <div key={number} style={{ display: "flex", gap: 13 }}>
                    <div style={{ display: "grid", placeItems: "center", width: 34, height: 34, flexShrink: 0, borderRadius: 9, background: "#edf0ff", color: "#5265d9", fontSize: 11, fontWeight: 700 }}>{number}</div>
                    <div style={{ flex: 1 }}>
                      <strong style={{ display: "block", marginBottom: 5, fontSize: 12 }}>{title}</strong>
                      <p style={{ margin: 0, color: "#858da0", fontSize: 11, lineHeight: 1.7 }}>{description}</p>
                    </div>
                    {index === 0 && <span />}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        <div className="limits-footer" style={{ padding: "12px 0 30px", borderTop: 0 }}>
          <span>ModelNow Admin · Usage &amp; Rate Limits</span>
          <button type="button" className="limits-btn primary" onClick={saveConfiguration}><Save size={14} />Save All Changes</button>
        </div>
      </div>

      {showEditModal && editingRecord && (
        <div className="limits-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowEditModal(false);
        }}>
          <section className="limits-modal" role="dialog" aria-modal="true" aria-labelledby="edit-limit-title">
            <div className="limits-modal-header">
              <h2 id="edit-limit-title">Edit Usage Budget</h2>
              <button type="button" className="limits-icon-btn" aria-label="Close dialog" onClick={() => setShowEditModal(false)}><X size={14} /></button>
            </div>
            <div className="limits-modal-body">
              <div style={{ marginBottom: 19 }}>
                <div style={{ color: "#858da0", fontSize: 11, marginBottom: 6 }}>Resource</div>
                <strong style={{ fontSize: 14 }}>{editingRecord.name}</strong>
                <div className="limits-muted">{editingRecord.type} · {editingRecord.id}</div>
              </div>
              <div className="limits-field">
                <label htmlFor="editBudget">Budget Limit (USD)</label>
                <input id="editBudget" type="number" min="1" step="1" value={draftLimit} onChange={(event) => setDraftLimit(event.target.value)} />
                <small>Changing this value updates the displayed demo status; it does not change billing or live enforcement.</small>
              </div>
              <div className="limits-modal-actions">
                <button type="button" className="limits-btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="button" className="limits-btn primary" onClick={saveRecordLimit}><Save size={14} />Save Budget</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
