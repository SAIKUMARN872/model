
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Check,
  CheckCircle2,
  CircleHelp,
  Eye,
  EyeOff,
  Globe,
  KeyRound,
  Plus,
  RefreshCw,
  Search,
  Server,
  Settings2,
  ShieldCheck,
  Trash2,
  X,
  Zap,
} from "lucide-react";

type ProviderStatus = "Connected" | "Not Connected" | "Error" | "Disabled";

type Provider = {
  id: string;
  name: string;
  description: string;
  category: string;
  baseUrl: string;
  status: ProviderStatus;
  enabled: boolean;
  apiKey: string;
  region: string;
  priority: number;
  timeout: number;
  retries: number;
  models: string[];
};

const initialProviders: Provider[] = [
  {
    id: "modelnow",
    name: "ModelNow",
    description: "First-party foundation models and optimized inference.",
    category: "Native",
    baseUrl: "https://api.modelnow.ai/v1",
    status: "Connected",
    enabled: true,
    apiKey: "",
    region: "Global",
    priority: 1,
    timeout: 60,
    retries: 2,
    models: ["ModelNow Quality 12B", "ModelNow Efficient 4B", "ModelNow Foundation 8B"],
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "Hosted language and multimodal model APIs.",
    category: "Cloud",
    baseUrl: "https://api.openai.com/v1",
    status: "Not Connected",
    enabled: false,
    apiKey: "",
    region: "Global",
    priority: 2,
    timeout: 60,
    retries: 2,
    models: ["GPT-4o", "GPT-4.1", "GPT-4o mini"],
  },
  {
    id: "anthropic",
    name: "Anthropic",
    description: "Language models for reasoning, analysis, and writing.",
    category: "Cloud",
    baseUrl: "https://api.anthropic.com",
    status: "Not Connected",
    enabled: false,
    apiKey: "",
    region: "Global",
    priority: 3,
    timeout: 60,
    retries: 2,
    models: ["Claude Sonnet", "Claude Haiku", "Claude Opus"],
  },
  {
    id: "google",
    name: "Google AI",
    description: "Gemini models for long-context and multimodal workloads.",
    category: "Cloud",
    baseUrl: "https://generativelanguage.googleapis.com",
    status: "Not Connected",
    enabled: false,
    apiKey: "",
    region: "Global",
    priority: 4,
    timeout: 60,
    retries: 2,
    models: ["Gemini Flash", "Gemini Pro"],
  },
  {
    id: "together",
    name: "Together AI",
    description: "Hosted open-source models and inference endpoints.",
    category: "Cloud",
    baseUrl: "https://api.together.xyz/v1",
    status: "Not Connected",
    enabled: false,
    apiKey: "",
    region: "Global",
    priority: 5,
    timeout: 60,
    retries: 2,
    models: ["Llama", "Qwen", "DeepSeek"],
  },
];

const providerPresets = [
  {
    name: "Custom OpenAI-Compatible",
    baseUrl: "https://your-provider.example.com/v1",
  },
  {
    name: "Self-Hosted Endpoint",
    baseUrl: "http://localhost:8000/v1",
  },
];

export default function AIProviderSettingsPage() {
  const [providers, setProviders] = useState<Provider[]>(initialProviders);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("providers");
  const [selectedProviderId, setSelectedProviderId] = useState("modelnow");
  const [showCreate, setShowCreate] = useState(false);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});
  const [notice, setNotice] = useState("");
  const [testingId, setTestingId] = useState("");
  const [routing, setRouting] = useState({
    strategy: "priority",
    fallbackEnabled: true,
    retryOnFailure: true,
    circuitBreaker: true,
    healthChecks: true,
    maxConcurrentRequests: "100",
    failureThreshold: "5",
    recoverySeconds: "30",
  });

  const [newProvider, setNewProvider] = useState({
    name: "",
    description: "",
    baseUrl: "",
    apiKey: "",
    region: "Global",
  });

  const filteredProviders = useMemo(
    () =>
      providers.filter((provider) => {
        const matchesSearch = `${provider.name} ${provider.description} ${provider.baseUrl}`
          .toLowerCase()
          .includes(search.toLowerCase());

        const matchesStatus =
          statusFilter === "All" || provider.status === statusFilter;

        return matchesSearch && matchesStatus;
      }),
    [providers, search, statusFilter],
  );

  const selectedProvider =
    providers.find((provider) => provider.id === selectedProviderId) ??
    providers[0];

  const connectedCount = providers.filter(
    (provider) => provider.status === "Connected" && provider.enabled,
  ).length;

  const enabledCount = providers.filter((provider) => provider.enabled).length;

  function updateProvider(id: string, updates: Partial<Provider>) {
    setProviders((current) =>
      current.map((provider) =>
        provider.id === id ? { ...provider, ...updates } : provider,
      ),
    );
  }

  function saveConfiguration() {
    try {
      const safeProviders = providers.map(({ apiKey, ...provider }) => ({
        ...provider,
        hasApiKey: Boolean(apiKey),
      }));

      localStorage.setItem(
        "modelnow-ai-provider-settings",
        JSON.stringify({
          providers: safeProviders,
          routing,
        }),
      );

      setNotice(
        "Configuration saved in this browser. Provider credentials and live routing must be managed by the backend.",
      );
    } catch {
      setNotice("Unable to save the configuration in this browser.");
    }
  }

  function testConnection(provider: Provider) {
    setTestingId(provider.id);

    if (provider.id === "modelnow" && provider.status === "Connected") {
      setTestingId("");
      setNotice(
        "ModelNow is marked as connected in demo data. A real health-check endpoint is required to verify live connectivity.",
      );
      return;
    }

    if (!provider.apiKey.trim()) {
      setTestingId("");
      setNotice(
        `Add the ${provider.name} API key through a secure backend credential flow before testing connectivity.`,
      );
      return;
    }

    setTestingId("");
    setNotice(
      `No live connection test was performed for ${provider.name}. Connect a backend health-check endpoint to verify credentials safely.`,
    );
  }

  function toggleProvider(provider: Provider) {
    if (!provider.enabled && provider.status !== "Connected") {
      setNotice(
        `Connect and validate ${provider.name} before enabling it for production traffic.`,
      );
      return;
    }

    updateProvider(provider.id, { enabled: !provider.enabled });
    setNotice(
      `${provider.name} ${provider.enabled ? "disabled" : "enabled"} in the current interface.`,
    );
  }

  function createProvider() {
    if (!newProvider.name.trim() || !newProvider.baseUrl.trim()) {
      setNotice("Enter a provider name and base URL.");
      return;
    }

    let normalizedUrl: string;

    try {
      const parsed = new URL(newProvider.baseUrl.trim());

      if (
        parsed.protocol !== "https:" &&
        parsed.hostname !== "localhost" &&
        parsed.hostname !== "127.0.0.1"
      ) {
        setNotice("Use HTTPS for provider endpoints, except local development URLs.");
        return;
      }

      normalizedUrl = parsed.toString().replace(/\/$/, "");
    } catch {
      setNotice("Enter a valid provider URL.");
      return;
    }

    const id = `custom-${Date.now()}`;

    const provider: Provider = {
      id,
      name: newProvider.name.trim(),
      description: newProvider.description.trim() || "Custom model provider.",
      category: "Custom",
      baseUrl: normalizedUrl,
      status: "Not Connected",
      enabled: false,
      apiKey: newProvider.apiKey,
      region: newProvider.region,
      priority: providers.length + 1,
      timeout: 60,
      retries: 2,
      models: [],
    };

    setProviders((current) => [...current, provider]);
    setSelectedProviderId(id);
    setNewProvider({
      name: "",
      description: "",
      baseUrl: "",
      apiKey: "",
      region: "Global",
    });
    setShowCreate(false);
    setNotice(
      "Custom provider added to this interface. Configure secure credential storage and backend validation before use.",
    );
  }

  function deleteProvider(provider: Provider) {
    if (provider.category !== "Custom") {
      setNotice("Built-in providers cannot be removed from the catalog.");
      return;
    }

    setProviders((current) =>
      current.filter((item) => item.id !== provider.id),
    );

    if (selectedProviderId === provider.id) {
      setSelectedProviderId("modelnow");
    }

    setNotice(`${provider.name} removed from the current interface.`);
  }

  function changePriority(providerId: string, priority: number) {
    updateProvider(providerId, {
      priority: Math.max(1, Math.min(providers.length, priority)),
    });
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
      <div className="provider-toggle-row">
        <div>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={title}
          className={`provider-switch ${checked ? "on" : ""}`}
          onClick={() => onChange(!checked)}
        />
      </div>
    );
  }

  return (
    <main className="provider-page">
      <style>{`
        .provider-page{min-height:100vh;background:#f7f8fc;padding:30px;color:#202a40;font-family:Arial,Helvetica,sans-serif}
        .provider-container{max-width:1260px;margin:0 auto}
        .provider-breadcrumb{display:flex;flex-wrap:wrap;gap:9px;margin-bottom:22px;color:#858da0;font-size:13px}
        .provider-breadcrumb a{color:#5265d9;text-decoration:none}
        .provider-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:24px}
        .provider-heading-left{display:flex;align-items:center;gap:14px}
        .provider-heading-icon{display:grid;place-items:center;width:50px;height:50px;flex-shrink:0;border-radius:14px;background:#e9edff;color:#5265d9}
        .provider-heading h1{margin:0 0 7px;font-size:27px;letter-spacing:-.6px}
        .provider-heading p{max-width:720px;margin:0;color:#7e8799;font-size:13px;line-height:1.6}
        .provider-actions{display:flex;flex-wrap:wrap;gap:9px}
        .provider-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:39px;padding:0 13px;border:1px solid #dfe4ed;border-radius:9px;background:#fff;color:#414c64;font-size:12px;font-weight:600;cursor:pointer}
        .provider-btn.primary{background:#5265d9;border-color:#5265d9;color:white}
        .provider-btn.danger{color:#c24141;border-color:#f0dada}
        .provider-notice{display:flex;align-items:flex-start;gap:10px;margin-bottom:18px;padding:13px 15px;border:1px solid #dce4ff;border-radius:10px;background:#f0f3ff;color:#4055b5;font-size:12px;line-height:1.6}
        .provider-warning{display:flex;align-items:flex-start;gap:12px;margin-bottom:20px;padding:15px;border:1px solid #f3dfb1;border-radius:11px;background:#fff9e9;color:#94651a;font-size:12px;line-height:1.6}
        .provider-warning strong{display:block;margin-bottom:4px}
        .provider-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:22px}
        .provider-stat{display:flex;align-items:center;gap:12px;padding:18px;border:1px solid #e7eaf1;border-radius:12px;background:white}
        .provider-stat-icon{display:grid;place-items:center;width:40px;height:40px;flex-shrink:0;border-radius:10px;background:#f0f2ff;color:#5265d9}
        .provider-stat-label{margin-bottom:6px;color:#818a9c;font-size:11px}
        .provider-stat-value{font-size:23px;font-weight:700}
        .provider-tabs{display:flex;flex-wrap:wrap;gap:6px;padding:6px;margin-bottom:18px;border:1px solid #e7eaf1;border-radius:11px;background:white}
        .provider-tab{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 15px;border:0;border-radius:7px;background:transparent;color:#6f7890;font-size:12px;font-weight:600;cursor:pointer}
        .provider-tab.active{background:#edf0ff;color:#485dd0}
        .provider-card{overflow:hidden;margin-bottom:18px;border:1px solid #e7eaf1;border-radius:13px;background:white;box-shadow:0 2px 7px rgba(24,36,70,.025)}
        .provider-card-header{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:20px 22px;border-bottom:1px solid #edf0f5}
        .provider-card-header h2{margin:0 0 6px;font-size:15px}
        .provider-card-header p{margin:0;color:#858da0;font-size:12px;line-height:1.6}
        .provider-toolbar{display:flex;flex-wrap:wrap;gap:10px;padding:16px 22px;border-bottom:1px solid #edf0f5}
        .provider-search{position:relative;flex:1 1 220px;min-width:180px}
        .provider-search svg{position:absolute;top:12px;left:12px;color:#929bad}
        .provider-search input{width:100%;height:40px;padding:0 12px 0 37px;border:1px solid #dfe4ed;border-radius:8px;outline:none;font-size:12px}
        .provider-toolbar select{height:40px;padding:0 10px;border:1px solid #dfe4ed;border-radius:8px;background:white;color:#48536b;font-size:12px}
        .provider-table-wrap{overflow-x:auto}
        .provider-table{width:100%;border-collapse:collapse;text-align:left;white-space:nowrap}
        .provider-table th{padding:14px 16px;background:#fafbfe;color:#7f889a;font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase}
        .provider-table td{padding:15px 16px;border-top:1px solid #edf0f5;color:#4b566d;font-size:12px}
        .provider-name{display:flex;align-items:flex-start;gap:10px;min-width:200px}
        .provider-avatar{display:grid;place-items:center;width:37px;height:37px;flex-shrink:0;border-radius:10px;background:#f0f2ff;color:#5265d9}
        .provider-name strong{display:block;margin:2px 0 5px;color:#263149;font-size:12px}
        .provider-muted{color:#8991a2;font-size:10px;white-space:normal;line-height:1.5}
        .provider-badge{display:inline-flex;align-items:center;gap:5px;padding:5px 9px;border-radius:20px;background:#f0f1f5;color:#697386;font-size:10px;font-weight:700}
        .provider-badge.green{background:#eaf9f0;color:#218552}
        .provider-badge.red{background:#fff0f0;color:#c24141}
        .provider-badge.orange{background:#fff5df;color:#9a6a12}
        .provider-icon-btn{display:grid;place-items:center;width:31px;height:31px;border:1px solid #e4e8f0;border-radius:7px;background:white;color:#66718a;cursor:pointer}
        .provider-row-actions{display:flex;gap:6px}
        .provider-toggle-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:17px 22px;border-bottom:1px solid #edf0f5}
        .provider-toggle-row:last-child{border-bottom:0}
        .provider-toggle-row strong{display:block;margin-bottom:5px;font-size:12px}
        .provider-toggle-row p{margin:0;color:#858da0;font-size:11px;line-height:1.6}
        .provider-switch{position:relative;width:38px;height:22px;flex:0 0 auto;padding:0;border:0;border-radius:20px;background:#cbd1dd;cursor:pointer}
        .provider-switch.on{background:#5265d9}
        .provider-switch:after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:white;transition:transform .15s ease}
        .provider-switch.on:after{transform:translateX(16px)}
        .provider-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:17px;padding:22px}
        .provider-field{display:flex;flex-direction:column;gap:8px;min-width:0}
        .provider-field.full{grid-column:1/-1}
        .provider-field label{color:#39445a;font-size:12px;font-weight:700}
        .provider-field input,.provider-field select,.provider-field textarea{width:100%;padding:11px 12px;border:1px solid #dfe4ed;border-radius:8px;outline:none;background:white;color:#202a40;font:inherit;font-size:12px}
        .provider-field input,.provider-field select{height:42px}
        .provider-field textarea{min-height:75px;resize:vertical}
        .provider-field small{color:#8991a2;font-size:11px;line-height:1.5}
        .provider-input-wrap{position:relative}
        .provider-input-wrap input{padding-right:44px}
        .provider-input-wrap button{position:absolute;right:6px;top:5px;width:32px;height:32px;border:0;background:transparent;color:#7e8799;cursor:pointer}
        .provider-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 22px;border-top:1px solid #edf0f5;color:#858da0;font-size:11px}
        .provider-empty{padding:40px 20px;text-align:center;color:#858da0;font-size:13px}
        .provider-modal-backdrop{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:20px;background:rgba(20,28,48,.45)}
        .provider-modal{width:100%;max-width:600px;max-height:90vh;overflow-y:auto;border:1px solid #e7eaf1;border-radius:15px;background:white;box-shadow:0 20px 70px rgba(20,28,48,.2)}
        .provider-modal-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px 22px;border-bottom:1px solid #edf0f5}
        .provider-modal-header h2{margin:0;font-size:17px}
        .provider-modal-body{padding:22px}
        .provider-modal-actions{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:9px;margin-top:22px}
        .provider-priority{width:70px;height:34px;padding:5px 8px;border:1px solid #dfe4ed;border-radius:7px}
        .provider-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:20px 22px}
        .provider-detail-box{padding:14px;border:1px solid #edf0f5;border-radius:9px;background:#fafbfe}
        .provider-detail-box span{display:block;margin-bottom:7px;color:#858da0;font-size:10px}
        .provider-detail-box strong{display:block;color:#263149;font-size:13px;overflow-wrap:anywhere}
        @media(max-width:950px){.provider-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:650px){.provider-page{padding:18px 12px}.provider-heading{flex-direction:column}.provider-heading h1{font-size:23px}.provider-actions{width:100%}.provider-btn{flex:1}.provider-tabs{overflow-x:auto;flex-wrap:nowrap}.provider-tab{white-space:nowrap}.provider-form-grid{grid-template-columns:1fr}.provider-field.full{grid-column:auto}.provider-footer{align-items:flex-start;flex-direction:column}.provider-detail-grid{grid-template-columns:1fr}}
      `}</style>

      <div className="provider-container">
        <div className="provider-breadcrumb">
          <a href="/dashboard">Admin</a>
          <span>/</span>
          <a href="/settings">Settings</a>
          <span>/</span>
          <span>AI Provider Settings</span>
        </div>

        <header className="provider-heading">
          <div className="provider-heading-left">
            <div className="provider-heading-icon"><Server size={24} /></div>
            <div>
              <h1>AI Provider Settings</h1>
              <p>
                Configure AI provider endpoints, connection settings, credentials
                workflows, provider priority, and inference resilience.
              </p>
            </div>
          </div>
          <div className="provider-actions">
            <button type="button" className="provider-btn" onClick={() => {
              setSearch("");
              setStatusFilter("All");
              setNotice("Provider filters reset.");
            }}>
              <RefreshCw size={14} /> Reset Filters
            </button>
            <button type="button" className="provider-btn primary" onClick={saveConfiguration}>
              <Check size={14} /> Save Configuration
            </button>
          </div>
        </header>

        {notice && (
          <div className="provider-notice" role="status">
            <CheckCircle2 size={17} />
            <span style={{ flex: 1 }}>{notice}</span>
            <button type="button" className="provider-icon-btn" aria-label="Dismiss notification" onClick={() => setNotice("")}>
              <X size={14} />
            </button>
          </div>
        )}

        <div className="provider-warning">
          <AlertTriangle size={19} />
          <div>
            <strong>Secure provider configuration required</strong>
            Provider records on this page are interface data. Never place production API
            keys in browser storage or expose them to client components. Store credentials
            in your backend secret manager and run connection tests server-side.
          </div>
        </div>

        <section className="provider-stats">
          <div className="provider-stat">
            <div className="provider-stat-icon"><Server size={19} /></div>
            <div>
              <div className="provider-stat-label">Registered Providers</div>
              <div className="provider-stat-value">{providers.length}</div>
            </div>
          </div>
          <div className="provider-stat">
            <div className="provider-stat-icon"><CheckCircle2 size={19} /></div>
            <div>
              <div className="provider-stat-label">Connected Providers</div>
              <div className="provider-stat-value">{connectedCount}</div>
            </div>
          </div>
          <div className="provider-stat">
            <div className="provider-stat-icon"><Zap size={19} /></div>
            <div>
              <div className="provider-stat-label">Enabled Providers</div>
              <div className="provider-stat-value">{enabledCount}</div>
            </div>
          </div>
          <div className="provider-stat">
            <div className="provider-stat-icon"><ShieldCheck size={19} /></div>
            <div>
              <div className="provider-stat-label">Routing Strategy</div>
              <div className="provider-stat-value" style={{ fontSize: 18, textTransform: "capitalize" }}>{routing.strategy}</div>
            </div>
          </div>
        </section>

        <div className="provider-tabs">
          <button type="button" className={`provider-tab ${activeTab === "providers" ? "active" : ""}`} onClick={() => setActiveTab("providers")}><Server size={15} />Provider Registry</button>
          <button type="button" className={`provider-tab ${activeTab === "configuration" ? "active" : ""}`} onClick={() => setActiveTab("configuration")}><Settings2 size={15} />Provider Configuration</button>
          <button type="button" className={`provider-tab ${activeTab === "routing" ? "active" : ""}`} onClick={() => setActiveTab("routing")}><Activity size={15} />Resilience & Routing</button>
          <button type="button" className={`provider-tab ${activeTab === "security" ? "active" : ""}`} onClick={() => setActiveTab("security")}><ShieldCheck size={15} />Security</button>
        </div>

        {activeTab === "providers" && (
          <section className="provider-card">
            <div className="provider-card-header">
              <div>
                <h2>Provider Registry</h2>
                <p>Manage registered provider records and inspect their configuration.</p>
              </div>
              <button type="button" className="provider-btn primary" onClick={() => setShowCreate(true)}>
                <Plus size={15} /> Add Provider
              </button>
            </div>

            <div className="provider-toolbar">
              <div className="provider-search">
                <Search size={16} />
                <input aria-label="Search providers" placeholder="Search providers or endpoints..." value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
              <select aria-label="Filter provider status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="All">All statuses</option>
                <option value="Connected">Connected</option>
                <option value="Not Connected">Not Connected</option>
                <option value="Error">Error</option>
                <option value="Disabled">Disabled</option>
              </select>
            </div>

            <div className="provider-table-wrap">
              <table className="provider-table">
                <thead>
                  <tr>
                    <th>Provider</th>
                    <th>Endpoint</th>
                    <th>Models</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Enabled</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProviders.map((provider) => (
                    <tr key={provider.id}>
                      <td>
                        <div className="provider-name">
                          <div className="provider-avatar"><Globe size={17} /></div>
                          <div>
                            <strong>{provider.name}</strong>
                            <div className="provider-muted">{provider.category} · {provider.region}</div>
                            <div className="provider-muted" style={{ marginTop: 4 }}>{provider.description}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ maxWidth: 230, whiteSpace: "normal", overflowWrap: "anywhere" }}>{provider.baseUrl}</td>
                      <td>{provider.models.length} listed<div className="provider-muted" style={{ marginTop: 5 }}>{provider.models.slice(0, 2).join(", ") || "No models registered"}</div></td>
                      <td>
                        <input className="provider-priority" aria-label={`${provider.name} priority`} type="number" min="1" max={providers.length} value={provider.priority} onChange={(event) => changePriority(provider.id, Number(event.target.value) || 1)} />
                      </td>
                      <td>
                        <span className={`provider-badge ${provider.status === "Connected" ? "green" : provider.status === "Error" ? "red" : "orange"}`}>
                          {provider.status === "Connected" && <CheckCircle2 size={11} />}
                          {provider.status}
                        </span>
                      </td>
                      <td>
                        <button type="button" role="switch" aria-checked={provider.enabled} aria-label={`Enable ${provider.name}`} className={`provider-switch ${provider.enabled ? "on" : ""}`} onClick={() => toggleProvider(provider)} />
                      </td>
                      <td>
                        <div className="provider-row-actions">
                          <button type="button" className="provider-icon-btn" title="Configure provider" aria-label={`Configure ${provider.name}`} onClick={() => {
                            setSelectedProviderId(provider.id);
                            setActiveTab("configuration");
                          }}><Settings2 size={14} /></button>
                          <button type="button" className="provider-icon-btn" title="Test provider connection" aria-label={`Test ${provider.name}`} disabled={testingId === provider.id} onClick={() => testConnection(provider)}><RefreshCw size={14} /></button>
                          {provider.category === "Custom" && <button type="button" className="provider-icon-btn" title="Remove custom provider" aria-label={`Remove ${provider.name}`} onClick={() => deleteProvider(provider)}><Trash2 size={14} /></button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProviders.length === 0 && <div className="provider-empty">No providers match your filters.</div>}
            </div>
            <div className="provider-footer">
              <span>Showing {filteredProviders.length} of {providers.length} providers</span>
              <span>Connection status must be verified by the backend</span>
            </div>
          </section>
        )}

        {activeTab === "configuration" && selectedProvider && (
          <>
            <section className="provider-card">
              <div className="provider-card-header">
                <div>
                  <h2>Provider Configuration</h2>
                  <p>Configure the selected provider's endpoint, credentials workflow, and request behavior.</p>
                </div>
                <select aria-label="Select provider to configure" value={selectedProviderId} onChange={(event) => setSelectedProviderId(event.target.value)}>
                  {providers.map((provider) => <option key={provider.id} value={provider.id}>{provider.name}</option>)}
                </select>
              </div>

              <div className="provider-form-grid">
                <div className="provider-field full">
                  <label>Provider Name</label>
                  <input value={selectedProvider.name} onChange={(event) => updateProvider(selectedProvider.id, { name: event.target.value })} />
                </div>
                <div className="provider-field full">
                  <label>Base URL</label>
                  <input value={selectedProvider.baseUrl} onChange={(event) => updateProvider(selectedProvider.id, { baseUrl: event.target.value })} placeholder="https://api.example.com/v1" />
                  <small>Use the provider's documented API base URL. Validate allowed hosts on the backend to prevent server-side request forgery.</small>
                </div>
                <div className="provider-field">
                  <label>Region</label>
                  <select value={selectedProvider.region} onChange={(event) => updateProvider(selectedProvider.id, { region: event.target.value })}>
                    <option>Global</option>
                    <option>US</option>
                    <option>EU</option>
                    <option>India</option>
                    <option>Asia Pacific</option>
                    <option>Self-hosted</option>
                  </select>
                </div>
                <div className="provider-field">
                  <label>Request Timeout (seconds)</label>
                  <input type="number" min="1" max="600" value={selectedProvider.timeout} onChange={(event) => updateProvider(selectedProvider.id, { timeout: Math.max(1, Number(event.target.value) || 1) })} />
                </div>
                <div className="provider-field">
                  <label>Retry Attempts</label>
                  <input type="number" min="0" max="10" value={selectedProvider.retries} onChange={(event) => updateProvider(selectedProvider.id, { retries: Math.max(0, Math.min(10, Number(event.target.value) || 0)) })} />
                </div>
                <div className="provider-field">
                  <label>Routing Priority</label>
                  <input type="number" min="1" max={providers.length} value={selectedProvider.priority} onChange={(event) => changePriority(selectedProvider.id, Number(event.target.value) || 1)} />
                </div>
                <div className="provider-field full">
                  <label>API Credential</label>
                  <div className="provider-input-wrap">
                    <input
                      type={showSecrets[selectedProvider.id] ? "text" : "password"}
                      value={selectedProvider.apiKey}
                      autoComplete="new-password"
                      onChange={(event) => updateProvider(selectedProvider.id, { apiKey: event.target.value })}
                      placeholder="Enter a development-only placeholder, not a production secret"
                    />
                    <button type="button" aria-label={showSecrets[selectedProvider.id] ? "Hide credential" : "Show credential"} onClick={() => setShowSecrets((current) => ({ ...current, [selectedProvider.id]: !current[selectedProvider.id] }))}>
                      {showSecrets[selectedProvider.id] ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <small>For production, replace this field with a backend-managed secret reference. Do not persist actual credentials in localStorage.</small>
                </div>
              </div>

              <div className="provider-footer">
                <span>Selected provider: {selectedProvider.name}</span>
                <div className="provider-actions">
                  <button type="button" className="provider-btn" onClick={() => testConnection(selectedProvider)}><RefreshCw size={14} />Test Connection</button>
                  <button type="button" className="provider-btn primary" onClick={saveConfiguration}><Check size={14} />Save Configuration</button>
                </div>
              </div>
            </section>

            <section className="provider-card">
              <div className="provider-card-header">
                <div>
                  <h2>Registered Model Names</h2>
                  <p>Model identifiers currently associated with this provider record.</p>
                </div>
              </div>
              <div className="provider-detail-grid">
                <div className="provider-detail-box"><span>Provider</span><strong>{selectedProvider.name}</strong></div>
                <div className="provider-detail-box"><span>Provider Status</span><strong>{selectedProvider.status}</strong></div>
                <div className="provider-detail-box"><span>Listed Models</span><strong>{selectedProvider.models.length}</strong></div>
                <div className="provider-detail-box"><span>Request Timeout</span><strong>{selectedProvider.timeout} seconds</strong></div>
              </div>
              {selectedProvider.models.length > 0 ? (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "0 22px 22px" }}>
                  {selectedProvider.models.map((model) => <span key={model} className="provider-badge">{model}</span>)}
                </div>
              ) : (
                <div className="provider-empty">No models are registered for this provider yet. Add model mappings through the model catalog and backend.</div>
              )}
            </section>
          </>
        )}

        {activeTab === "routing" && (
          <>
            <section className="provider-card">
              <div className="provider-card-header">
                <div>
                  <h2>Provider Routing Strategy</h2>
                  <p>Set how the backend should choose between available providers.</p>
                </div>
                <Activity size={21} color="#5265d9" />
              </div>
              <div className="provider-form-grid">
                <div className="provider-field full">
                  <label htmlFor="routingStrategy">Routing Strategy</label>
                  <select id="routingStrategy" value={routing.strategy} onChange={(event) => setRouting((current) => ({ ...current, strategy: event.target.value }))}>
                    <option value="priority">Priority-based</option>
                    <option value="least-latency">Lowest measured latency</option>
                    <option value="round-robin">Round robin</option>
                    <option value="cost-optimized">Cost optimized</option>
                    <option value="capability">Capability matching</option>
                    <option value="weighted">Weighted routing</option>
                  </select>
                  <small>This selection is stored as configuration only. Implement the strategy in the server-side routing service.</small>
                </div>
                <div className="provider-field">
                  <label htmlFor="maxConcurrent">Max Concurrent Requests</label>
                  <input id="maxConcurrent" type="number" min="1" value={routing.maxConcurrentRequests} onChange={(event) => setRouting((current) => ({ ...current, maxConcurrentRequests: event.target.value }))} />
                </div>
                <div className="provider-field">
                  <label htmlFor="failureThreshold">Circuit Breaker Failure Threshold</label>
                  <input id="failureThreshold" type="number" min="1" value={routing.failureThreshold} onChange={(event) => setRouting((current) => ({ ...current, failureThreshold: event.target.value }))} />
                </div>
                <div className="provider-field">
                  <label htmlFor="recoverySeconds">Circuit Recovery (seconds)</label>
                  <input id="recoverySeconds" type="number" min="1" value={routing.recoverySeconds} onChange={(event) => setRouting((current) => ({ ...current, recoverySeconds: event.target.value }))} />
                </div>
              </div>
              <div className="provider-footer">
                <span>Priorities and strategies need server-side enforcement.</span>
                <button type="button" className="provider-btn primary" onClick={saveConfiguration}><Check size={14} />Save Routing</button>
              </div>
            </section>

            <section className="provider-card">
              <div className="provider-card-header">
                <div>
                  <h2>Reliability Controls</h2>
                  <p>Configure fallback, retries, circuit breaking, and provider health checks.</p>
                </div>
              </div>
              <Toggle title="Enable Fallback Providers" description="Allow eligible requests to try another provider when the selected provider fails." checked={routing.fallbackEnabled} onChange={(value) => setRouting((current) => ({ ...current, fallbackEnabled: value }))} />
              <Toggle title="Retry Transient Failures" description="Retry recoverable errors with bounded attempts and exponential backoff." checked={routing.retryOnFailure} onChange={(value) => setRouting((current) => ({ ...current, retryOnFailure: value }))} />
              <Toggle title="Circuit Breaker" description="Temporarily stop routing to providers that exceed the configured failure threshold." checked={routing.circuitBreaker} onChange={(value) => setRouting((current) => ({ ...current, circuitBreaker: value }))} />
              <Toggle title="Provider Health Checks" description="Periodically verify provider health using backend-controlled checks." checked={routing.healthChecks} onChange={(value) => setRouting((current) => ({ ...current, healthChecks: value }))} />
              <div className="provider-footer">
                <span>Fallback behavior should respect data residency and model capability requirements.</span>
                <button type="button" className="provider-btn primary" onClick={saveConfiguration}><Check size={14} />Save Reliability</button>
              </div>
            </section>

            <section className="provider-card">
              <div className="provider-card-header">
                <div>
                  <h2>Provider Priority Order</h2>
                  <p>Current configured priority values for providers marked as enabled.</p>
                </div>
              </div>
              <div className="provider-table-wrap">
                <table className="provider-table">
                  <thead><tr><th>Priority</th><th>Provider</th><th>Status</th><th>Enabled</th></tr></thead>
                  <tbody>
                    {[...providers].sort((a, b) => a.priority - b.priority).map((provider) => (
                      <tr key={provider.id}>
                        <td>#{provider.priority}</td>
                        <td><strong style={{ color: "#263149" }}>{provider.name}</strong></td>
                        <td><span className={`provider-badge ${provider.status === "Connected" ? "green" : "orange"}`}>{provider.status}</span></td>
                        <td>{provider.enabled ? "Yes" : "No"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {activeTab === "security" && (
          <>
            <section className="provider-card">
              <div className="provider-card-header">
                <div>
                  <h2>Provider Security</h2>
                  <p>Recommended controls for credentials, endpoint validation, and administrative access.</p>
                </div>
                <ShieldCheck size={21} color="#5265d9" />
              </div>
              {[
                ["Secret Manager Integration", "Store API credentials in a backend secret manager; expose only secret references to the admin interface."],
                ["Server-Side Credential Validation", "Verify provider credentials using protected backend endpoints without returning secrets to the browser."],
                ["Endpoint Allowlisting", "Restrict provider URLs to approved domains and block private or unexpected network destinations."],
                ["Role-Based Administration", "Limit provider changes to authorized administrators and record the actor for each change."],
                ["Audit Trail", "Record provider creation, configuration changes, credential rotations, and enablement changes."],
                ["Credential Rotation", "Support rotating and revoking credentials without exposing secret values in logs or responses."],
              ].map(([title, description]) => (
                <div key={title} className="provider-toggle-row">
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                    <ShieldCheck size={16} color="#5265d9" style={{ marginTop: 1, flexShrink: 0 }} />
                    <div><strong>{title}</strong><p>{description}</p></div>
                  </div>
                  <span className="provider-badge orange">Backend required</span>
                </div>
              ))}
            </section>

            <section className="provider-card">
              <div className="provider-card-header">
                <div>
                  <h2>Credential Handling</h2>
                  <p>Never store live provider secrets in browser storage or client-side source code.</p>
                </div>
                <KeyRound size={21} color="#5265d9" />
              </div>
              <div style={{ padding: 22, color: "#697386", fontSize: 12, lineHeight: 1.8 }}>
                <p style={{ marginTop: 0 }}>Production credentials should be created, stored, rotated, and revoked through a protected server-side workflow.</p>
                <p>Recommended flow: Admin UI → authenticated admin API → secret manager → provider connection test → audit log.</p>
                <p style={{ marginBottom: 0 }}>Connection results should report a safe status and sanitized error message. Never return provider authorization headers, raw credentials, or sensitive upstream response details to the client.</p>
              </div>
            </section>
          </>
        )}

        <div className="provider-footer" style={{ padding: "12px 0 30px", borderTop: 0 }}>
          <span>ModelNow Admin · AI Provider Configuration</span>
          <button type="button" className="provider-btn primary" onClick={saveConfiguration}><Check size={14} />Save All Changes</button>
        </div>
      </div>

      {showCreate && (
        <div className="provider-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowCreate(false);
        }}>
          <section className="provider-modal" role="dialog" aria-modal="true" aria-labelledby="provider-create-title">
            <div className="provider-modal-header">
              <h2 id="provider-create-title">Add Custom Provider</h2>
              <button type="button" className="provider-icon-btn" aria-label="Close dialog" onClick={() => setShowCreate(false)}><X size={15} /></button>
            </div>
            <div className="provider-modal-body">
              <div className="provider-form-grid" style={{ padding: 0 }}>
                <div className="provider-field full">
                  <label htmlFor="providerName">Provider Name</label>
                  <input id="providerName" value={newProvider.name} onChange={(event) => setNewProvider((current) => ({ ...current, name: event.target.value }))} placeholder="Example: Internal Inference" />
                </div>
                <div className="provider-field full">
                  <label htmlFor="providerDescription">Description</label>
                  <textarea id="providerDescription" value={newProvider.description} onChange={(event) => setNewProvider((current) => ({ ...current, description: event.target.value }))} placeholder="What will this provider be used for?" />
                </div>
                <div className="provider-field full">
                  <label htmlFor="providerBaseUrl">Base URL</label>
                  <input id="providerBaseUrl" value={newProvider.baseUrl} onChange={(event) => setNewProvider((current) => ({ ...current, baseUrl: event.target.value }))} placeholder="https://api.example.com/v1" />
                </div>
                <div className="provider-field">
                  <label htmlFor="providerRegion">Region</label>
                  <select id="providerRegion" value={newProvider.region} onChange={(event) => setNewProvider((current) => ({ ...current, region: event.target.value }))}>
                    <option>Global</option>
                    <option>US</option>
                    <option>EU</option>
                    <option>India</option>
                    <option>Asia Pacific</option>
                    <option>Self-hosted</option>
                  </select>
                </div>
                <div className="provider-field">
                  <label htmlFor="providerPreset">Endpoint Preset</label>
                  <select id="providerPreset" defaultValue="" onChange={(event) => {
                    const preset = providerPresets.find((item) => item.name === event.target.value);
                    if (preset) setNewProvider((current) => ({ ...current, baseUrl: preset.baseUrl }));
                  }}>
                    <option value="">Choose preset</option>
                    {providerPresets.map((preset) => <option key={preset.name} value={preset.name}>{preset.name}</option>)}
                  </select>
                </div>
                <div className="provider-field full">
                  <label htmlFor="providerApiKey">Credential Reference (optional)</label>
                  <input id="providerApiKey" value={newProvider.apiKey} autoComplete="off" onChange={(event) => setNewProvider((current) => ({ ...current, apiKey: event.target.value }))} placeholder="Example: secret-manager/provider-key-id" />
                  <small>Use a secret-manager reference, not a production API key. This form is only a UI placeholder.</small>
                </div>
              </div>
              <div className="provider-modal-actions">
                <button type="button" className="provider-btn" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="button" className="provider-btn primary" onClick={createProvider}><Plus size={14} />Add Provider</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
