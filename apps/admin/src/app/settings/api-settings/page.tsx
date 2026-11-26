
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  X,
  Zap,
  Globe,
  Save,
} from "lucide-react";

type ApiKey = {
  id: number;
  name: string;
  prefix: string;
  secret: string;
  environment: "Production" | "Development";
  status: "Active" | "Revoked";
  createdAt: string;
  lastUsed: string;
  permissions: string[];
};

type Endpoint = {
  method: "GET" | "POST" | "PATCH" | "DELETE";
  path: string;
  description: string;
  category: string;
};

const initialKeys: ApiKey[] = [
  {
    id: 1,
    name: "Production Backend",
    prefix: "mn_live_8f2a",
    secret: "mn_live_8f2a9d6c7e1b4a5f",
    environment: "Production",
    status: "Active",
    createdAt: "2026-10-21",
    lastUsed: "2 minutes ago",
    permissions: ["models:read", "chat:write", "usage:read"],
  },
  {
    id: 2,
    name: "Development Integration",
    prefix: "mn_test_4c7b",
    secret: "mn_test_4c7b2e8d1a6f9c3b",
    environment: "Development",
    status: "Active",
    createdAt: "2026-10-27",
    lastUsed: "1 hour ago",
    permissions: ["models:read", "chat:write"],
  },
  {
    id: 3,
    name: "Analytics Service",
    prefix: "mn_live_2a91",
    secret: "mn_live_2a91b6e3c4d8f7a0",
    environment: "Production",
    status: "Active",
    createdAt: "2026-10-29",
    lastUsed: "Yesterday",
    permissions: ["usage:read", "models:read"],
  },
];

const endpoints: Endpoint[] = [
  { method: "POST", path: "/v1/chat/completions", description: "Create a model chat completion.", category: "Chat" },
  { method: "GET", path: "/v1/models", description: "List available AI models.", category: "Models" },
  { method: "GET", path: "/v1/usage", description: "Retrieve usage and token statistics.", category: "Usage" },
  { method: "POST", path: "/v1/embeddings", description: "Generate vector embeddings.", category: "Embeddings" },
  { method: "POST", path: "/v1/files", description: "Upload a supported file.", category: "Files" },
  { method: "GET", path: "/v1/organizations", description: "List accessible organizations.", category: "Organizations" },
];

const methodColors: Record<string, string> = {
  GET: "get",
  POST: "post",
  PATCH: "patch",
  DELETE: "delete",
};

export default function ApiSettingsPage() {
  const [activeTab, setActiveTab] = useState("keys");
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [search, setSearch] = useState("");
  const [environmentFilter, setEnvironmentFilter] = useState("All");
  const [showKey, setShowKey] = useState<Record<number, boolean>>({});
  const [showCreate, setShowCreate] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ApiKey | null>(null);
  const [notice, setNotice] = useState("");
  const [endpointSearch, setEndpointSearch] = useState("");
  const [endpointMethod, setEndpointMethod] = useState("All");
  const [newKey, setNewKey] = useState({
    name: "",
    environment: "Development" as ApiKey["environment"],
    permissions: ["models:read", "chat:write"],
  });

  const [configuration, setConfiguration] = useState({
    enabled: true,
    requireAuthentication: true,
    enforceRateLimits: true,
    allowCors: false,
    logRequests: true,
    rejectUnknownModels: true,
    maxRequestsPerMinute: "120",
    maxRequestsPerDay: "50000",
    requestTimeout: "60",
    maxPayloadMb: "20",
    corsOrigins: "https://app.modelnow.ai",
  });

  const activeKeys = keys.filter((key) => key.status === "Active").length;

  const filteredKeys = useMemo(() => {
    return keys.filter((key) => {
      const matchesSearch = `${key.name} ${key.prefix} ${key.environment}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesEnvironment =
        environmentFilter === "All" || key.environment === environmentFilter;
      return matchesSearch && matchesEnvironment;
    });
  }, [keys, search, environmentFilter]);

  const filteredEndpoints = endpoints.filter((endpoint) => {
    const matchesSearch = `${endpoint.path} ${endpoint.description} ${endpoint.category}`
      .toLowerCase()
      .includes(endpointSearch.toLowerCase());
    const matchesMethod = endpointMethod === "All" || endpoint.method === endpointMethod;
    return matchesSearch && matchesMethod;
  });

  function saveSettings() {
    try {
      localStorage.setItem("modelnow-api-settings", JSON.stringify(configuration));
      localStorage.setItem(
        "modelnow-api-key-metadata",
        JSON.stringify(keys.map(({ secret, ...metadata }) => metadata)),
      );
      setNotice("API settings saved in this browser. Backend enforcement is still required.");
    } catch {
      setNotice("Unable to save API settings in this browser.");
    }
  }

  function createKey() {
    if (!newKey.name.trim()) {
      setNotice("Enter a name for the API key.");
      return;
    }

    const randomPart = Array.from(
      { length: 24 },
      () => Math.floor(Math.random() * 16).toString(16),
    ).join("");

    const secret =
      `${newKey.environment === "Production" ? "mn_live_" : "mn_test_"}${randomPart}`;

    const key: ApiKey = {
      id: Math.max(0, ...keys.map((item) => item.id)) + 1,
      name: newKey.name.trim(),
      prefix: secret.slice(0, 12),
      secret,
      environment: newKey.environment,
      status: "Active",
      createdAt: new Date().toISOString().slice(0, 10),
      lastUsed: "Never",
      permissions: [...newKey.permissions],
    };

    setKeys((current) => [key, ...current]);
    setShowKey((current) => ({ ...current, [key.id]: true }));
    setShowCreate(false);
    setNewKey({
      name: "",
      environment: "Development",
      permissions: ["models:read", "chat:write"],
    });
    setNotice("Demo API key created. Copy it now; this demo does not issue a real server credential.");
  }

  function revokeKey(key: ApiKey) {
    if (key.status === "Revoked") return;

    setKeys((current) =>
      current.map((item) =>
        item.id === key.id ? { ...item, status: "Revoked" } : item,
      ),
    );
    setSelectedKey(null);
    setNotice("Demo key revoked in the current interface. Connect backend revocation to enforce it.");
  }

  function togglePermission(permission: string) {
    setNewKey((current) => ({
      ...current,
      permissions: current.permissions.includes(permission)
        ? current.permissions.filter((item) => item !== permission)
        : [...current.permissions, permission],
    }));
  }

  function copyText(value: string, message: string) {
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(value)
        .then(() => setNotice(message))
        .catch(() => setNotice("Copy failed. Select and copy the value manually."));
    } else {
      setNotice("Clipboard access is unavailable. Select and copy the value manually.");
    }
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
      <div className="api-toggle-row">
        <div>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={title}
          className={`api-switch ${checked ? "on" : ""}`}
          onClick={() => onChange(!checked)}
        />
      </div>
    );
  }

  return (
    <main className="api-page">
      <style>{`
        .api-page {
          min-height: 100vh;
          padding: 30px;
          background: #f7f8fc;
          color: #202a40;
          font-family: Arial, Helvetica, sans-serif;
        }
        .api-container { max-width: 1240px; margin: 0 auto; }
        .api-breadcrumb { display:flex; gap:9px; margin-bottom:22px; color:#858da0; font-size:13px; flex-wrap:wrap; }
        .api-breadcrumb a { color:#5265d9; text-decoration:none; }
        .api-heading { display:flex; justify-content:space-between; align-items:flex-start; gap:18px; margin-bottom:24px; }
        .api-title-group { display:flex; gap:14px; align-items:center; }
        .api-title-icon { display:grid; place-items:center; width:50px; height:50px; border-radius:14px; background:#e9edff; color:#5265d9; flex-shrink:0; }
        .api-heading h1 { margin:0 0 7px; font-size:27px; letter-spacing:-.6px; }
        .api-heading p { margin:0; color:#7e8799; font-size:13px; line-height:1.6; max-width:680px; }
        .api-actions { display:flex; gap:9px; flex-wrap:wrap; }
        .api-btn { display:inline-flex; align-items:center; justify-content:center; gap:8px; min-height:39px; padding:0 13px; border:1px solid #dfe4ed; border-radius:9px; background:white; color:#414c64; font-size:12px; font-weight:600; cursor:pointer; }
        .api-btn.primary { background:#5265d9; border-color:#5265d9; color:white; }
        .api-btn.danger { border-color:#f1caca; color:#c24141; }
        .api-btn:disabled { opacity:.45; cursor:not-allowed; }
        .api-notice { display:flex; gap:9px; align-items:center; margin-bottom:18px; padding:13px 15px; border:1px solid #dce4ff; border-radius:10px; background:#f0f3ff; color:#4055b5; font-size:13px; line-height:1.5; }
        .api-warning { display:flex; gap:12px; padding:15px; margin-bottom:20px; border:1px solid #f3dfb1; border-radius:11px; background:#fff9e9; color:#94651a; font-size:12px; line-height:1.6; }
        .api-warning strong { display:block; margin-bottom:4px; }
        .api-stats { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:14px; margin-bottom:22px; }
        .api-stat { display:flex; align-items:center; gap:12px; padding:18px; border:1px solid #e7eaf1; border-radius:12px; background:white; }
        .api-stat-icon { display:grid; place-items:center; width:40px; height:40px; border-radius:10px; background:#f0f2ff; color:#5265d9; flex-shrink:0; }
        .api-stat-label { color:#818a9c; font-size:11px; margin-bottom:6px; }
        .api-stat-value { color:#202a40; font-size:22px; font-weight:700; }
        .api-tabs { display:flex; flex-wrap:wrap; gap:6px; padding:6px; margin-bottom:18px; border:1px solid #e7eaf1; border-radius:11px; background:white; }
        .api-tab { display:inline-flex; align-items:center; justify-content:center; gap:8px; padding:11px 15px; border:0; border-radius:7px; background:transparent; color:#6f7890; font-size:12px; font-weight:600; cursor:pointer; }
        .api-tab.active { background:#edf0ff; color:#485dd0; }
        .api-card { overflow:hidden; margin-bottom:18px; border:1px solid #e7eaf1; border-radius:13px; background:white; box-shadow:0 2px 7px rgba(24,36,70,.025); }
        .api-card-header { display:flex; align-items:center; justify-content:space-between; gap:14px; padding:20px 22px; border-bottom:1px solid #edf0f5; }
        .api-card-header h2 { margin:0 0 6px; font-size:15px; }
        .api-card-header p { margin:0; color:#858da0; font-size:12px; line-height:1.6; }
        .api-toolbar { display:flex; flex-wrap:wrap; align-items:center; gap:10px; padding:16px 22px; border-bottom:1px solid #edf0f5; }
        .api-search { position:relative; flex:1 1 230px; min-width:180px; }
        .api-search svg { position:absolute; top:12px; left:12px; color:#929bad; }
        .api-search input { width:100%; height:40px; padding:0 12px 0 37px; border:1px solid #dfe4ed; border-radius:8px; outline:none; font-size:12px; }
        .api-toolbar select { height:40px; padding:0 10px; border:1px solid #dfe4ed; border-radius:8px; background:white; color:#48536b; font-size:12px; }
        .api-table-wrap { overflow-x:auto; }
        .api-table { width:100%; border-collapse:collapse; text-align:left; white-space:nowrap; }
        .api-table th { padding:14px 18px; background:#fafbfe; color:#7f889a; font-size:10px; font-weight:700; letter-spacing:.5px; text-transform:uppercase; }
        .api-table td { padding:15px 18px; border-top:1px solid #edf0f5; color:#4b566d; font-size:12px; }
        .api-name { margin-bottom:5px; color:#263149; font-weight:700; }
        .api-muted { color:#8991a2; font-size:11px; }
        .api-badge { display:inline-flex; align-items:center; gap:5px; padding:5px 9px; border-radius:20px; background:#f0f2ff; color:#5265d9; font-size:10px; font-weight:700; }
        .api-badge.green { background:#eaf9f0; color:#218552; }
        .api-badge.red { background:#fff0f0; color:#c24141; }
        .api-badge.gray { background:#f0f1f5; color:#697386; }
        .api-key-value { display:flex; align-items:center; gap:7px; font-family:monospace; font-size:11px; }
        .api-inline-btn { display:grid; place-items:center; width:29px; height:29px; border:1px solid #e4e8f0; border-radius:7px; background:white; color:#66718a; cursor:pointer; }
        .api-row-actions { display:flex; gap:6px; }
        .api-empty { padding:40px 20px; text-align:center; color:#858da0; font-size:13px; }
        .api-footer { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:16px 22px; border-top:1px solid #edf0f5; color:#858da0; font-size:11px; }
        .api-toggle-row { display:flex; align-items:center; justify-content:space-between; gap:16px; padding:17px 22px; border-bottom:1px solid #edf0f5; }
        .api-toggle-row:last-child { border-bottom:0; }
        .api-toggle-row strong { display:block; margin-bottom:5px; font-size:12px; }
        .api-toggle-row p { margin:0; color:#858da0; font-size:11px; line-height:1.6; }
        .api-switch { position:relative; width:38px; height:22px; flex:0 0 auto; padding:0; border:0; border-radius:20px; background:#cbd1dd; cursor:pointer; }
        .api-switch.on { background:#5265d9; }
        .api-switch:after { content:""; position:absolute; top:3px; left:3px; width:16px; height:16px; border-radius:50%; background:white; transition:transform .15s ease; }
        .api-switch.on:after { transform:translateX(16px); }
        .api-form-grid { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:17px; padding:22px; }
        .api-field { display:flex; flex-direction:column; gap:8px; min-width:0; }
        .api-field.full { grid-column:1/-1; }
        .api-field label { color:#39445a; font-size:12px; font-weight:700; }
        .api-field input, .api-field select, .api-field textarea { width:100%; padding:11px 12px; border:1px solid #dfe4ed; border-radius:8px; outline:none; background:white; color:#202a40; font:inherit; font-size:12px; }
        .api-field input, .api-field select { height:42px; }
        .api-field textarea { min-height:78px; resize:vertical; }
        .api-field small { color:#8991a2; font-size:11px; line-height:1.5; }
        .api-method { display:inline-flex; justify-content:center; min-width:58px; padding:5px 7px; border-radius:5px; font-size:10px; font-weight:800; }
        .api-method.get { background:#eaf9f0; color:#218552; }
        .api-method.post { background:#eaf0ff; color:#3e5bc5; }
        .api-method.patch { background:#fff5df; color:#9a6a12; }
        .api-method.delete { background:#fff0f0; color:#c24141; }
        .api-endpoint-path { font-family:monospace; color:#263149; font-size:12px; }
        .api-check-list { display:flex; flex-direction:column; gap:13px; }
        .api-check { display:flex; align-items:flex-start; gap:10px; font-size:12px; line-height:1.5; color:#4b566d; }
        .api-check input { accent-color:#5265d9; margin-top:2px; }
        .api-modal-backdrop { position:fixed; inset:0; z-index:50; display:grid; place-items:center; padding:20px; background:rgba(20,28,48,.45); }
        .api-modal { width:100%; max-width:570px; max-height:90vh; overflow-y:auto; border:1px solid #e7eaf1; border-radius:15px; background:white; box-shadow:0 20px 70px rgba(20,28,48,.2); }
        .api-modal-header { display:flex; align-items:center; justify-content:space-between; gap:12px; padding:20px 22px; border-bottom:1px solid #edf0f5; }
        .api-modal-header h2 { margin:0; font-size:17px; }
        .api-modal-body { padding:22px; }
        .api-modal-actions { display:flex; justify-content:flex-end; flex-wrap:wrap; gap:9px; margin-top:22px; }
        .api-secret-box { padding:13px; border:1px solid #dfe4ed; border-radius:8px; background:#fafbfe; font-family:monospace; font-size:12px; overflow-wrap:anywhere; }
        @media(max-width:950px) { .api-stats { grid-template-columns:repeat(2,minmax(0,1fr)); } }
        @media(max-width:650px) {
          .api-page { padding:18px 12px; }
          .api-heading { flex-direction:column; }
          .api-heading h1 { font-size:23px; }
          .api-actions { width:100%; }
          .api-btn { flex:1; }
          .api-tabs { overflow-x:auto; flex-wrap:nowrap; }
          .api-tab { white-space:nowrap; }
          .api-stats { grid-template-columns:1fr 1fr; }
          .api-form-grid { grid-template-columns:1fr; }
          .api-field.full { grid-column:auto; }
          .api-footer { align-items:flex-start; flex-direction:column; }
        }
      `}</style>

      <div className="api-container">
        <div className="api-breadcrumb">
          <a href="/dashboard">Admin</a>
          <span>/</span>
          <a href="/settings">Settings</a>
          <span>/</span>
          <span>API Settings</span>
        </div>

        <header className="api-heading">
          <div className="api-title-group">
            <div className="api-title-icon"><KeyRound size={24} /></div>
            <div>
              <h1>API Settings</h1>
              <p>
                Manage API credentials, endpoint visibility, request limits,
                authentication requirements, and API gateway configuration.
              </p>
            </div>
          </div>
          <div className="api-actions">
            <button
              type="button"
              className="api-btn"
              onClick={() => {
                setSearch("");
                setEnvironmentFilter("All");
                setNotice("API key list refreshed.");
              }}
            >
              <RefreshCw size={14} />
              Refresh
            </button>
            <button type="button" className="api-btn primary" onClick={saveSettings}>
              <Save size={14} />
              Save Settings
            </button>
          </div>
        </header>

        {notice && (
          <div className="api-notice" role="status">
            <CheckCircle2 size={17} />
            <span>{notice}</span>
            <button
              type="button"
              className="api-inline-btn"
              aria-label="Dismiss notification"
              onClick={() => setNotice("")}
            >
              <X size={14} />
            </button>
          </div>
        )}

        <div className="api-warning">
          <AlertTriangle size={19} />
          <div>
            <strong>Demo credentials — not production API keys</strong>
            The credentials shown here are generated in the browser for UI testing.
            Production keys must be created, stored, hashed where appropriate, and
            validated by your backend. Never put real secrets in localStorage or
            expose them in client-side code.
          </div>
        </div>

        <section className="api-stats">
          <div className="api-stat">
            <div className="api-stat-icon"><KeyRound size={19} /></div>
            <div>
              <div className="api-stat-label">Total API Keys</div>
              <div className="api-stat-value">{keys.length}</div>
            </div>
          </div>
          <div className="api-stat">
            <div className="api-stat-icon"><CheckCircle2 size={19} /></div>
            <div>
              <div className="api-stat-label">Active Keys</div>
              <div className="api-stat-value">{activeKeys}</div>
            </div>
          </div>
          <div className="api-stat">
            <div className="api-stat-icon"><Globe size={19} /></div>
            <div>
              <div className="api-stat-label">API Endpoints</div>
              <div className="api-stat-value">{endpoints.length}</div>
            </div>
          </div>
          <div className="api-stat">
            <div className="api-stat-icon"><Activity size={19} /></div>
            <div>
              <div className="api-stat-label">Rate Limit</div>
              <div className="api-stat-value">{configuration.maxRequestsPerMinute}<span style={{ fontSize: 11, fontWeight: 500 }}> /min</span></div>
            </div>
          </div>
        </section>

        <div className="api-tabs">
          <button type="button" className={`api-tab ${activeTab === "keys" ? "active" : ""}`} onClick={() => setActiveTab("keys")}>
            <KeyRound size={15} /> API Keys
          </button>
          <button type="button" className={`api-tab ${activeTab === "endpoints" ? "active" : ""}`} onClick={() => setActiveTab("endpoints")}>
            <Globe size={15} /> Endpoints
          </button>
          <button type="button" className={`api-tab ${activeTab === "limits" ? "active" : ""}`} onClick={() => setActiveTab("limits")}>
            <Zap size={15} /> Rate Limits
          </button>
          <button type="button" className={`api-tab ${activeTab === "security" ? "active" : ""}`} onClick={() => setActiveTab("security")}>
            <ShieldCheck size={15} /> Security
          </button>
        </div>

        {activeTab === "keys" && (
          <section className="api-card">
            <div className="api-card-header">
              <div>
                <h2>API Credentials</h2>
                <p>Create and manage credentials for services that connect to ModelNow.</p>
              </div>
              <button
                type="button"
                className="api-btn primary"
                onClick={() => {
                  setNewKey({ name: "", environment: "Development", permissions: ["models:read", "chat:write"] });
                  setShowCreate(true);
                }}
              >
                <Plus size={15} /> Create API Key
              </button>
            </div>

            <div className="api-toolbar">
              <div className="api-search">
                <Search size={16} />
                <input
                  aria-label="Search API keys"
                  placeholder="Search by name or key prefix..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
              <select aria-label="Filter API keys by environment" value={environmentFilter} onChange={(event) => setEnvironmentFilter(event.target.value)}>
                <option value="All">All environments</option>
                <option value="Production">Production</option>
                <option value="Development">Development</option>
              </select>
            </div>

            <div className="api-table-wrap">
              <table className="api-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>API Key</th>
                    <th>Environment</th>
                    <th>Status</th>
                    <th>Last Used</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKeys.map((key) => (
                    <tr key={key.id}>
                      <td>
                        <div className="api-name">{key.name}</div>
                        <div className="api-muted">Created {key.createdAt}</div>
                      </td>
                      <td>
                        <div className="api-key-value">
                          <span>{showKey[key.id] ? key.secret : `${key.prefix}••••••••`}</span>
                          <button
                            type="button"
                            className="api-inline-btn"
                            title={showKey[key.id] ? "Hide key" : "Reveal demo key"}
                            aria-label={showKey[key.id] ? "Hide key" : "Reveal demo key"}
                            onClick={() => setShowKey((current) => ({ ...current, [key.id]: !current[key.id] }))}
                          >
                            {showKey[key.id] ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                          <button
                            type="button"
                            className="api-inline-btn"
                            title="Copy demo key"
                            aria-label="Copy demo key"
                            onClick={() => copyText(key.secret, "Demo key copied to clipboard.")}
                          >
                            <Copy size={13} />
                          </button>
                        </div>
                      </td>
                      <td>
                        <span className={`api-badge ${key.environment === "Production" ? "green" : "gray"}`}>
                          {key.environment}
                        </span>
                      </td>
                      <td>
                        <span className={`api-badge ${key.status === "Active" ? "green" : "red"}`}>
                          {key.status === "Active" ? <CheckCircle2 size={11} /> : <X size={11} />}
                          {key.status}
                        </span>
                      </td>
                      <td>{key.lastUsed}</td>
                      <td>
                        <div className="api-row-actions">
                          <button type="button" className="api-inline-btn" title="View key details" aria-label={`View ${key.name}`} onClick={() => setSelectedKey(key)}>
                            <Eye size={14} />
                          </button>
                          {key.status === "Active" && (
                            <button type="button" className="api-inline-btn" title="Revoke key" aria-label={`Revoke ${key.name}`} onClick={() => revokeKey(key)}>
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredKeys.length === 0 && <div className="api-empty">No API keys match your filters.</div>}
            </div>

            <div className="api-footer">
              <span>Showing {filteredKeys.length} of {keys.length} API keys</span>
              <span>Use separate credentials for production and development.</span>
            </div>
          </section>
        )}

        {activeTab === "endpoints" && (
          <section className="api-card">
            <div className="api-card-header">
              <div>
                <h2>API Endpoint Catalog</h2>
                <p>Review the endpoint catalog and HTTP methods represented in this admin demo.</p>
              </div>
              <span className="api-badge">{endpoints.length} endpoints</span>
            </div>

            <div className="api-toolbar">
              <div className="api-search">
                <Search size={16} />
                <input aria-label="Search endpoints" placeholder="Search endpoints..." value={endpointSearch} onChange={(event) => setEndpointSearch(event.target.value)} />
              </div>
              <select aria-label="Filter endpoints by method" value={endpointMethod} onChange={(event) => setEndpointMethod(event.target.value)}>
                <option value="All">All methods</option>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            <div className="api-table-wrap">
              <table className="api-table">
                <thead>
                  <tr><th>Method</th><th>Endpoint</th><th>Category</th><th>Description</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {filteredEndpoints.map((endpoint) => (
                    <tr key={`${endpoint.method}-${endpoint.path}`}>
                      <td><span className={`api-method ${methodColors[endpoint.method]}`}>{endpoint.method}</span></td>
                      <td><span className="api-endpoint-path">{endpoint.path}</span></td>
                      <td>{endpoint.category}</td>
                      <td>{endpoint.description}</td>
                      <td><span className="api-badge gray">Catalog entry</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredEndpoints.length === 0 && <div className="api-empty">No endpoints match your filters.</div>}
            </div>

            <div className="api-footer">
              <span>Showing {filteredEndpoints.length} endpoints</span>
              <span>Connect this catalog to your backend route registry for live status.</span>
            </div>
          </section>
        )}

        {activeTab === "limits" && (
          <>
            <section className="api-card">
              <div className="api-card-header">
                <div>
                  <h2>Request Rate Limits</h2>
                  <p>Set request ceilings and payload limits for API consumers.</p>
                </div>
                <Clock3 size={21} color="#5265d9" />
              </div>

              <div className="api-form-grid">
                <div className="api-field">
                  <label htmlFor="apiRpm">Requests per minute</label>
                  <input id="apiRpm" type="number" min="1" max="100000" value={configuration.maxRequestsPerMinute} onChange={(event) => setConfiguration((current) => ({ ...current, maxRequestsPerMinute: event.target.value }))} />
                  <small>Maximum requests accepted per API key per minute.</small>
                </div>
                <div className="api-field">
                  <label htmlFor="apiRpd">Requests per day</label>
                  <input id="apiRpd" type="number" min="1" value={configuration.maxRequestsPerDay} onChange={(event) => setConfiguration((current) => ({ ...current, maxRequestsPerDay: event.target.value }))} />
                  <small>Daily request budget for each API key.</small>
                </div>
                <div className="api-field">
                  <label htmlFor="apiTimeout">Request timeout (seconds)</label>
                  <input id="apiTimeout" type="number" min="1" max="600" value={configuration.requestTimeout} onChange={(event) => setConfiguration((current) => ({ ...current, requestTimeout: event.target.value }))} />
                  <small>Maximum time allowed for an API request.</small>
                </div>
                <div className="api-field">
                  <label htmlFor="apiPayload">Maximum payload (MB)</label>
                  <input id="apiPayload" type="number" min="1" max="500" value={configuration.maxPayloadMb} onChange={(event) => setConfiguration((current) => ({ ...current, maxPayloadMb: event.target.value }))} />
                  <small>Maximum accepted request payload size.</small>
                </div>
              </div>
            </section>

            <section className="api-card">
              <div className="api-card-header">
                <div>
                  <h2>Rate Limit Enforcement</h2>
                  <p>Enable enforcement controls at the API gateway or backend.</p>
                </div>
              </div>
              <Toggle title="Enforce Rate Limits" description="Reject requests that exceed configured rate limits." checked={configuration.enforceRateLimits} onChange={(value) => setConfiguration((current) => ({ ...current, enforceRateLimits: value }))} />
              <Toggle title="Log API Requests" description="Record request metadata for monitoring, debugging, and audit purposes." checked={configuration.logRequests} onChange={(value) => setConfiguration((current) => ({ ...current, logRequests: value }))} />
              <div className="api-footer">
                <span>Rate limit settings require backend enforcement.</span>
                <button type="button" className="api-btn primary" onClick={saveSettings}><Save size={14} />Save Limits</button>
              </div>
            </section>
          </>
        )}

        {activeTab === "security" && (
          <>
            <section className="api-card">
              <div className="api-card-header">
                <div>
                  <h2>API Security</h2>
                  <p>Configure authentication, request validation, and cross-origin behavior.</p>
                </div>
                <ShieldCheck size={21} color="#5265d9" />
              </div>
              <Toggle title="Enable API Access" description="Allow API requests to be accepted by the platform gateway." checked={configuration.enabled} onChange={(value) => setConfiguration((current) => ({ ...current, enabled: value }))} />
              <Toggle title="Require Authentication" description="Require a valid credential for protected API endpoints." checked={configuration.requireAuthentication} onChange={(value) => setConfiguration((current) => ({ ...current, requireAuthentication: value }))} />
              <Toggle title="Reject Unknown Models" description="Reject requests that reference models not available to the authenticated account." checked={configuration.rejectUnknownModels} onChange={(value) => setConfiguration((current) => ({ ...current, rejectUnknownModels: value }))} />
              <Toggle title="Allow CORS" description="Allow browser-based cross-origin API requests from configured origins." checked={configuration.allowCors} onChange={(value) => setConfiguration((current) => ({ ...current, allowCors: value }))} />

              <div className="api-form-grid">
                <div className="api-field full">
                  <label htmlFor="apiCorsOrigins">Allowed CORS Origins</label>
                  <textarea id="apiCorsOrigins" value={configuration.corsOrigins} onChange={(event) => setConfiguration((current) => ({ ...current, corsOrigins: event.target.value }))} placeholder="https://app.example.com" />
                  <small>Enter trusted origins, one per line. Do not use a wildcard with credentialed requests.</small>
                </div>
              </div>
              <div className="api-footer">
                <span>Use server-side validation and secret management in production.</span>
                <button type="button" className="api-btn primary" onClick={saveSettings}><Save size={14} />Save Security</button>
              </div>
            </section>

            <section className="api-card">
              <div className="api-card-header">
                <div>
                  <h2>Recommended Security Controls</h2>
                  <p>Review these safeguards before enabling production API access.</p>
                </div>
              </div>
              <div style={{ padding: "20px 22px", display: "grid", gap: 14 }}>
                {[
                  "Store production credentials in a managed secret store.",
                  "Apply authentication and authorization on every protected route.",
                  "Rotate credentials and revoke compromised keys promptly.",
                  "Redact API secrets and sensitive payloads from logs.",
                  "Apply per-key, per-user, and per-organization rate limits.",
                  "Restrict CORS origins to explicitly trusted applications.",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, color: "#4b566d", fontSize: 12, lineHeight: 1.6 }}>
                    <CheckCircle2 size={16} color="#218552" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        <div className="api-footer" style={{ padding: "12px 0 30px", borderTop: 0 }}>
          <span>ModelNow Admin · API Configuration</span>
          <button type="button" className="api-btn primary" onClick={saveSettings}><Save size={14} />Save All Changes</button>
        </div>
      </div>

      {showCreate && (
        <div className="api-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowCreate(false);
        }}>
          <section className="api-modal" role="dialog" aria-modal="true" aria-labelledby="api-create-title">
            <div className="api-modal-header">
              <h2 id="api-create-title">Create API Key</h2>
              <button type="button" className="api-inline-btn" aria-label="Close dialog" onClick={() => setShowCreate(false)}><X size={15} /></button>
            </div>
            <div className="api-modal-body">
              <div className="api-field">
                <label htmlFor="apiKeyName">Key Name</label>
                <input id="apiKeyName" value={newKey.name} onChange={(event) => setNewKey((current) => ({ ...current, name: event.target.value }))} placeholder="e.g. Customer Backend" autoFocus />
              </div>

              <div className="api-field" style={{ marginTop: 16 }}>
                <label htmlFor="apiKeyEnvironment">Environment</label>
                <select id="apiKeyEnvironment" value={newKey.environment} onChange={(event) => setNewKey((current) => ({ ...current, environment: event.target.value as ApiKey["environment"] }))}>
                  <option value="Development">Development / Test</option>
                  <option value="Production">Production</option>
                </select>
              </div>

              <h3 style={{ margin: "22px 0 12px", fontSize: 13 }}>Permissions</h3>
              <div className="api-check-list">
                {[
                  { id: "models:read", label: "Read Models", description: "List models and retrieve model metadata." },
                  { id: "chat:write", label: "Create Chat Completions", description: "Submit chat completion requests." },
                  { id: "usage:read", label: "Read Usage", description: "View API usage and token statistics." },
                  { id: "files:write", label: "Manage Files", description: "Upload and manage API files." },
                ].map((permission) => (
                  <label className="api-check" key={permission.id}>
                    <input type="checkbox" checked={newKey.permissions.includes(permission.id)} onChange={() => setNewKey((current) => ({
                      ...current,
                      permissions: current.permissions.includes(permission.id)
                        ? current.permissions.filter((item) => item !== permission.id)
                        : [...current.permissions, permission.id],
                    }))} />
                    <span><strong>{permission.label}</strong><br /><span className="api-muted">{permission.description}</span></span>
                  </label>
                ))}
              </div>

              <div className="api-modal-actions">
                <button type="button" className="api-btn" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="button" className="api-btn primary" onClick={createKey}><Plus size={14} />Generate Demo Key</button>
              </div>
            </div>
          </section>
        </div>
      )}

      {selectedKey && (
        <div className="api-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedKey(null);
        }}>
          <section className="api-modal" role="dialog" aria-modal="true" aria-labelledby="api-details-title">
            <div className="api-modal-header">
              <h2 id="api-details-title">API Key Details</h2>
              <button type="button" className="api-inline-btn" aria-label="Close dialog" onClick={() => setSelectedKey(null)}><X size={15} /></button>
            </div>
            <div className="api-modal-body">
              <div className="api-field">
                <label>Key Name</label>
                <div className="api-secret-box" style={{ fontFamily: "Arial, sans-serif" }}>{selectedKey.name}</div>
              </div>
              <div className="api-field" style={{ marginTop: 16 }}>
                <label>Demo Credential</label>
                <div className="api-secret-box">{selectedKey.secret}</div>
                <button type="button" className="api-btn" style={{ marginTop: 8 }} onClick={() => copyText(selectedKey.secret, "Demo credential copied.")}><Copy size={14} />Copy Demo Credential</button>
              </div>
              <div className="api-field" style={{ marginTop: 16 }}>
                <label>Assigned Permissions</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {selectedKey.permissions.map((permission) => <span className="api-badge" key={permission}>{permission}</span>)}
                </div>
              </div>
              <div className="api-form-grid" style={{ padding: "20px 0 0" }}>
                <div className="api-field">
                  <label>Environment</label>
                  <div className="api-secret-box" style={{ fontFamily: "Arial, sans-serif" }}>{selectedKey.environment}</div>
                </div>
                <div className="api-field">
                  <label>Status</label>
                  <div><span className={`api-badge ${selectedKey.status === "Active" ? "green" : "red"}`}>{selectedKey.status}</span></div>
                </div>
              </div>
              <div className="api-modal-actions">
                <button type="button" className="api-btn" onClick={() => setSelectedKey(null)}>Close</button>
                {selectedKey.status === "Active" && <button type="button" className="api-btn danger" onClick={() => revokeKey(selectedKey)}><Trash2 size={14} />Revoke Key</button>}
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
