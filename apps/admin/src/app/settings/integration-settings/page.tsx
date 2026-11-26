
"use client";

import { useMemo, useState } from "react";
import {
  Plug,
  Search,
  Plus,
  RefreshCw,
  Save,
  Download,
  CheckCircle2,
  AlertTriangle,
  X,
  Settings2,
  ShieldCheck,
  Cloud,
  Database,
  Activity,
  CreditCard,
  Users,
  Code2,
  Webhook,
  ExternalLink,
  Eye,
  EyeOff,
  Power,
  Clock,
  ChevronRight,
  TestTube2,
  Filter,
} from "lucide-react";

type IntegrationStatus = "Connected" | "Disconnected" | "Needs setup" | "Error";
type IntegrationCategory =
  | "AI Providers"
  | "Collaboration"
  | "Storage"
  | "Observability"
  | "Billing"
  | "CRM"
  | "Developer Tools";

type Integration = {
  id: string;
  name: string;
  provider: string;
  category: IntegrationCategory;
  description: string;
  status: IntegrationStatus;
  environment: string;
  lastTested: string;
  endpoint: string;
  credential: string;
};

const initialIntegrations: Integration[] = [
  {
    id: "int-openai",
    name: "OpenAI",
    provider: "OpenAI",
    category: "AI Providers",
    description: "Connect supported OpenAI models through the AI gateway.",
    status: "Connected",
    environment: "Production",
    lastTested: "2026-11-04 09:20",
    endpoint: "https://api.openai.com/v1",
    credential: "",
  },
  {
    id: "int-anthropic",
    name: "Anthropic",
    provider: "Anthropic",
    category: "AI Providers",
    description: "Configure Claude model access and provider routing.",
    status: "Needs setup",
    environment: "Development",
    lastTested: "Never",
    endpoint: "https://api.anthropic.com",
    credential: "",
  },
  {
    id: "int-google",
    name: "Google AI",
    provider: "Google",
    category: "AI Providers",
    description: "Configure supported Gemini models and provider credentials.",
    status: "Disconnected",
    environment: "Development",
    lastTested: "Never",
    endpoint: "https://generativelanguage.googleapis.com",
    credential: "",
  },
  {
    id: "int-slack",
    name: "Slack",
    provider: "Slack",
    category: "Collaboration",
    description: "Send operational notifications to approved Slack workspaces.",
    status: "Disconnected",
    environment: "Development",
    lastTested: "Never",
    endpoint: "",
    credential: "",
  },
  {
    id: "int-google-drive",
    name: "Google Drive",
    provider: "Google",
    category: "Storage",
    description: "Connect authorized document sources for knowledge workflows.",
    status: "Needs setup",
    environment: "Development",
    lastTested: "Never",
    endpoint: "",
    credential: "",
  },
  {
    id: "int-s3",
    name: "Amazon S3",
    provider: "Amazon Web Services",
    category: "Storage",
    description: "Configure object storage for files and supported data assets.",
    status: "Disconnected",
    environment: "Development",
    lastTested: "Never",
    endpoint: "",
    credential: "",
  },
  {
    id: "int-datadog",
    name: "Datadog",
    provider: "Datadog",
    category: "Observability",
    description: "Forward supported metrics, logs, and traces to observability tools.",
    status: "Connected",
    environment: "Production",
    lastTested: "2026-11-04 08:45",
    endpoint: "",
    credential: "",
  },
  {
    id: "int-stripe",
    name: "Stripe",
    provider: "Stripe",
    category: "Billing",
    description: "Configure billing events and payment service integration.",
    status: "Needs setup",
    environment: "Development",
    lastTested: "Never",
    endpoint: "",
    credential: "",
  },
  {
    id: "int-salesforce",
    name: "Salesforce",
    provider: "Salesforce",
    category: "CRM",
    description: "Connect approved CRM workflows and customer records.",
    status: "Disconnected",
    environment: "Development",
    lastTested: "Never",
    endpoint: "",
    credential: "",
  },
  {
    id: "int-github",
    name: "GitHub",
    provider: "GitHub",
    category: "Developer Tools",
    description: "Connect repository events and approved developer workflows.",
    status: "Connected",
    environment: "Production",
    lastTested: "2026-11-03 18:10",
    endpoint: "",
    credential: "",
  },
  {
    id: "int-webhook",
    name: "Custom Webhook",
    provider: "Custom",
    category: "Developer Tools",
    description: "Send selected platform events to an authorized HTTPS endpoint.",
    status: "Disconnected",
    environment: "Development",
    lastTested: "Never",
    endpoint: "",
    credential: "",
  },
];

const categories: IntegrationCategory[] = [
  "AI Providers",
  "Collaboration",
  "Storage",
  "Observability",
  "Billing",
  "CRM",
  "Developer Tools",
];

const categoryIcons: Record<IntegrationCategory, typeof Plug> = {
  "AI Providers": Cloud,
  Collaboration: Users,
  Storage: Database,
  Observability: Activity,
  Billing: CreditCard,
  CRM: Users,
  "Developer Tools": Code2,
};

const statusClass: Record<IntegrationStatus, string> = {
  Connected: "int-status-connected",
  Disconnected: "int-status-disconnected",
  "Needs setup": "int-status-setup",
  Error: "int-status-error",
};

export default function IntegrationSettingsPage() {
  const [integrations, setIntegrations] =
    useState<Integration[]>(initialIntegrations);
  const [activeCategory, setActiveCategory] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [selected, setSelected] = useState<Integration | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [draft, setDraft] = useState({
    name: "",
    provider: "",
    category: "Developer Tools" as IntegrationCategory,
    description: "",
    endpoint: "",
    credential: "",
  });

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();

    return integrations.filter((integration) => {
      const matchesSearch =
        !term ||
        `${integration.name} ${integration.provider} ${integration.category} ${integration.description}`
          .toLowerCase()
          .includes(term);

      const matchesCategory =
        activeCategory === "All" || integration.category === activeCategory;

      const matchesStatus =
        statusFilter === "All" || integration.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [integrations, search, activeCategory, statusFilter]);

  const connected = integrations.filter(
    (integration) => integration.status === "Connected",
  ).length;

  const needsSetup = integrations.filter(
    (integration) => integration.status === "Needs setup",
  ).length;

  const errors = integrations.filter(
    (integration) => integration.status === "Error",
  ).length;

  function saveDemo() {
    try {
      const safeData = integrations.map(({ credential, ...item }) => ({
        ...item,
        credential: credential ? "[configured]" : "",
      }));

      localStorage.setItem(
        "modelnow-integration-settings-demo",
        JSON.stringify(safeData),
      );

      setNotice(
        "Integration configuration saved as demo metadata in this browser. Credentials are not saved.",
      );
    } catch {
      setNotice("Unable to save demo configuration in this browser.");
    }
  }

  function updateIntegration(id: string, changes: Partial<Integration>) {
    setIntegrations((current) =>
      current.map((item) => (item.id === id ? { ...item, ...changes } : item)),
    );

    setSelected((current) =>
      current?.id === id ? { ...current, ...changes } : current,
    );
  }

  function openConfiguration(integration: Integration) {
    setSelected({ ...integration });
    setShowSecret(false);
  }

  function saveConfiguration() {
    if (!selected) return;

    if (selected.endpoint && !/^https:\/\//i.test(selected.endpoint)) {
      setNotice("Use an HTTPS endpoint for this integration.");
      return;
    }

    const updated: Integration = {
      ...selected,
      status: selected.credential.trim()
        ? "Connected"
        : selected.status === "Connected"
          ? "Needs setup"
          : selected.status,
      environment: selected.environment || "Development",
    };

    updateIntegration(updated.id, updated);
    setSelected(null);
    setNotice(
      `${updated.name} configuration updated in the demo interface. A real provider connection has not been verified.`,
    );
  }

  function testIntegration(integration: Integration) {
    updateIntegration(integration.id, {
      lastTested: new Date().toLocaleString(),
    });

    setNotice(
      `${integration.name}: demo test recorded. Connect a backend health-check endpoint to test the real integration.`,
    );
  }

  function toggleConnection(integration: Integration) {
    const nextStatus: IntegrationStatus =
      integration.status === "Connected" ? "Disconnected" : "Needs setup";

    updateIntegration(integration.id, { status: nextStatus });
    setNotice(
      `${integration.name} marked ${nextStatus.toLowerCase()} in the demo interface. No external account was connected or disconnected.`,
    );
  }

  function createIntegration() {
    if (!draft.name.trim() || !draft.provider.trim()) {
      setNotice("Enter an integration name and provider.");
      return;
    }

    if (draft.endpoint && !/^https:\/\//i.test(draft.endpoint)) {
      setNotice("Use an HTTPS endpoint for this integration.");
      return;
    }

    const newIntegration: Integration = {
      id: `custom-${Date.now()}`,
      name: draft.name.trim(),
      provider: draft.provider.trim(),
      category: draft.category,
      description: draft.description.trim() || "Custom platform integration.",
      status: "Needs setup",
      environment: "Development",
      lastTested: "Never",
      endpoint: draft.endpoint.trim(),
      credential: "",
    };

    setIntegrations((current) => [newIntegration, ...current]);
    setDraft({
      name: "",
      provider: "",
      category: "Developer Tools",
      description: "",
      endpoint: "",
      credential: "",
    });
    setShowCreate(false);
    setActiveCategory("All");
    setStatusFilter("All");
    setSearch("");
    setNotice(`${newIntegration.name} added to the demo integration catalog.`);
  }

  function exportIntegrations() {
    const rows = [
      ["Name", "Provider", "Category", "Status", "Environment", "Endpoint", "Last Tested"],
      ...filtered.map((item) => [
        item.name,
        item.provider,
        item.category,
        item.status,
        item.environment,
        item.endpoint,
        item.lastTested,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-integrations.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Integration catalog exported.");
  }

  function resetDemo() {
    setIntegrations([...initialIntegrations]);
    setActiveCategory("All");
    setStatusFilter("All");
    setSearch("");
    setNotice("Integration catalog reset to its initial demo data.");
  }

  return (
    <main className="int-page">
      <style>{`
        .int-page{min-height:100vh;background:#f7f8fc;color:#202a40;padding:30px;font-family:Arial,Helvetica,sans-serif}
        .int-container{max-width:1320px;margin:auto}
        .int-breadcrumb{display:flex;gap:9px;margin-bottom:22px;color:#8790a2;font-size:12px;flex-wrap:wrap}
        .int-breadcrumb a{color:#5265d9;text-decoration:none}
        .int-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:20px;margin-bottom:25px}
        .int-title{display:flex;align-items:center;gap:14px}
        .int-title-icon{display:grid;place-items:center;width:50px;height:50px;background:#e9edff;color:#5265d9;border-radius:14px}
        .int-title h1{margin:0 0 7px;font-size:27px;letter-spacing:-.6px}
        .int-title p{margin:0;max-width:720px;color:#818a9c;font-size:12px;line-height:1.8}
        .int-actions{display:flex;gap:8px;flex-wrap:wrap}
        .int-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:39px;padding:0 13px;border:1px solid #dfe4ed;border-radius:9px;background:white;color:#46516a;font-size:12px;font-weight:600;cursor:pointer}
        .int-btn.primary{background:#5265d9;border-color:#5265d9;color:white}
        .int-btn.danger{color:#c24141}
        .int-btn:disabled{opacity:.5;cursor:not-allowed}
        .int-notice{display:flex;align-items:flex-start;gap:10px;padding:13px 15px;margin-bottom:18px;background:#f0f3ff;border:1px solid #dce4ff;border-radius:10px;color:#4055b5;font-size:12px;line-height:1.6}
        .int-warning{display:flex;align-items:flex-start;gap:11px;padding:15px;margin-bottom:20px;border:1px solid #f3dfb1;border-radius:11px;background:#fff9e9;color:#94651a;font-size:12px;line-height:1.7}
        .int-warning strong{display:block;margin-bottom:4px}
        .int-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:22px}
        .int-stat{display:flex;gap:13px;padding:19px;background:white;border:1px solid #e7eaf1;border-radius:12px}
        .int-stat-icon{display:grid;place-items:center;flex-shrink:0;width:41px;height:41px;border-radius:10px;background:#edf0ff;color:#5265d9}
        .int-stat-icon.green{background:#e8f8ef;color:#258452}.int-stat-icon.orange{background:#fff5df;color:#a36e12}.int-stat-icon.red{background:#fff0f0;color:#c24141}
        .int-stat p{margin:2px 0 7px;color:#818a9c;font-size:11px}.int-stat strong{font-size:24px}.int-stat small{display:block;margin-top:5px;color:#929aab;font-size:10px}
        .int-layout{display:grid;grid-template-columns:230px minmax(0,1fr);gap:18px;align-items:start}
        .int-sidebar,.int-panel{background:white;border:1px solid #e7eaf1;border-radius:13px;overflow:hidden}
        .int-side-head{padding:19px 17px;border-bottom:1px solid #edf0f5}
        .int-side-head h2{margin:0 0 5px;font-size:13px}.int-side-head p{margin:0;color:#858da0;font-size:11px}
        .int-category-list{padding:9px}
        .int-category{display:flex;align-items:center;justify-content:space-between;gap:8px;width:100%;padding:11px 10px;margin-bottom:3px;border:0;border-radius:8px;background:transparent;color:#657087;text-align:left;font-size:11px;cursor:pointer}
        .int-category.active{background:#edf0ff;color:#485dd0;font-weight:700}
        .int-category span{display:flex;align-items:center;gap:9px}
        .int-count{min-width:23px;padding:4px 5px;border-radius:12px;background:#f1f3f8;color:#68738a;text-align:center;font-size:10px}
        .int-category.active .int-count{background:white;color:#485dd0}
        .int-panel-header{display:flex;align-items:center;justify-content:space-between;gap:15px;padding:19px 20px;border-bottom:1px solid #edf0f5}
        .int-panel-header h2{margin:0 0 5px;font-size:15px}.int-panel-header p{margin:0;color:#858da0;font-size:11px;line-height:1.6}
        .int-toolbar{display:flex;align-items:center;gap:9px;flex-wrap:wrap;padding:15px 20px;border-bottom:1px solid #edf0f5}
        .int-search{position:relative;flex:1 1 220px;min-width:150px}
        .int-search svg{position:absolute;left:11px;top:12px;color:#929bad}
        .int-search input{width:100%;height:39px;box-sizing:border-box;padding:0 12px 0 35px;border:1px solid #dfe4ed;border-radius:8px;outline:none;font-size:12px}
        .int-select{height:39px;min-width:135px;padding:0 10px;border:1px solid #dfe4ed;border-radius:8px;background:white;color:#4b566d;font-size:12px}
        .int-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:13px;padding:17px}
        .int-card{min-width:0;padding:17px;border:1px solid #e7eaf1;border-radius:11px;transition:border-color .15s,box-shadow .15s}
        .int-card:hover{border-color:#cbd2fa;box-shadow:0 4px 15px #27396b0a}
        .int-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}
        .int-brand{display:flex;align-items:center;gap:11px;min-width:0}
        .int-brand-icon{display:grid;place-items:center;width:42px;height:42px;flex-shrink:0;border-radius:10px;background:#edf0ff;color:#5265d9}
        .int-brand h3{margin:0 0 5px;font-size:13px}.int-brand p{margin:0;color:#8991a2;font-size:10px}
        .int-status{display:inline-flex;align-items:center;gap:5px;white-space:nowrap;padding:5px 8px;border-radius:20px;font-size:9px;font-weight:700}
        .int-status-connected{background:#eaf9f0;color:#218552}.int-status-disconnected{background:#f0f1f5;color:#697386}.int-status-setup{background:#fff5df;color:#9a6a12}.int-status-error{background:#fff0f0;color:#c24141}
        .int-description{min-height:42px;margin:15px 0;color:#727d92;font-size:11px;line-height:1.7}
        .int-card-meta{display:flex;justify-content:space-between;gap:10px;padding-top:12px;border-top:1px solid #edf0f5;color:#8991a2;font-size:10px}
        .int-card-actions{display:flex;gap:7px;margin-top:13px}
        .int-card-actions .int-btn{min-height:34px;padding:0 10px;font-size:10px}
        .int-card-actions .int-btn:first-child{flex:1}
        .int-empty{padding:45px 20px;text-align:center;color:#858da0;font-size:12px}
        .int-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 20px;border-top:1px solid #edf0f5;color:#858da0;font-size:10px}
        .int-modal-backdrop{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:20px;background:#141c3073}
        .int-modal{width:100%;max-width:600px;max-height:90vh;overflow:auto;border:1px solid #e7eaf1;border-radius:15px;background:white;box-shadow:0 20px 70px #141c3033}
        .int-modal-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px 22px;border-bottom:1px solid #edf0f5}
        .int-modal-head h2{margin:0;font-size:17px}.int-modal-body{padding:22px}
        .int-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px}
        .int-field{display:flex;flex-direction:column;gap:7px;min-width:0}
        .int-field.full{grid-column:1/-1}
        .int-field label{font-size:11px;font-weight:700;color:#39445a}
        .int-field input,.int-field select,.int-field textarea{box-sizing:border-box;width:100%;min-height:40px;padding:10px 11px;border:1px solid #dfe4ed;border-radius:8px;outline:none;background:white;color:#202a40;font:inherit;font-size:12px}
        .int-field textarea{min-height:80px;resize:vertical}
        .int-field input:focus,.int-field select:focus,.int-field textarea:focus{border-color:#8290ed;box-shadow:0 0 0 3px #edf0ff}
        .int-field small{color:#8991a2;font-size:10px;line-height:1.6}
        .int-modal-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:22px}
        .int-detail{display:flex;justify-content:space-between;gap:18px;padding:13px 0;border-bottom:1px solid #edf0f5;font-size:12px}
        .int-detail span{color:#858da0}.int-detail strong{text-align:right;overflow-wrap:anywhere}
        .int-security-note{display:flex;gap:9px;padding:12px;margin-top:17px;border-radius:8px;background:#f5f7fc;color:#68738a;font-size:10px;line-height:1.7}
        @media(max-width:1100px){.int-layout{grid-template-columns:1fr}.int-category-list{display:flex;flex-wrap:wrap;gap:5px}.int-category{width:auto;margin:0}.int-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:700px){.int-page{padding:18px 12px}.int-heading{flex-direction:column}.int-title h1{font-size:23px}.int-actions{width:100%}.int-actions .int-btn{flex:1}.int-grid{grid-template-columns:1fr;padding:11px}.int-form-grid{grid-template-columns:1fr}.int-field.full{grid-column:auto}.int-stats{gap:9px}.int-stat{padding:13px}.int-stat strong{font-size:20px}.int-panel-header{align-items:flex-start;flex-direction:column}.int-toolbar{padding:12px}.int-footer{align-items:flex-start;flex-direction:column}}
      `}</style>

      <div className="int-container">
        <div className="int-breadcrumb">
          <a href="/dashboard">Admin</a><span>/</span>
          <a href="/settings">Settings</a><span>/</span>
          <span>Integration Settings</span>
        </div>

        <header className="int-heading">
          <div className="int-title">
            <div className="int-title-icon"><Plug size={24} /></div>
            <div>
              <h1>Integration Settings</h1>
              <p>Manage external services, AI providers, storage connections, developer tools, and platform integrations from one workspace.</p>
            </div>
          </div>
          <div className="int-actions">
            <button className="int-btn" onClick={resetDemo}><RefreshCw size={14} />Reset Demo</button>
            <button className="int-btn" onClick={exportIntegrations}><Download size={14} />Export</button>
            <button className="int-btn primary" onClick={() => setShowCreate(true)}><Plus size={14} />Add Integration</button>
          </div>
        </header>

        {notice && <div className="int-notice" role="status">
          <CheckCircle2 size={17} />
          <span style={{ flex: 1 }}>{notice}</span>
          <button className="int-btn" onClick={() => setNotice("")} aria-label="Dismiss notification"><X size={14} /></button>
        </div>}

        <div className="int-warning">
          <AlertTriangle size={19} />
          <div><strong>Demo integration catalog</strong>Connection statuses are illustrative. Real integrations require backend adapters, secure secret storage, authorization, provider-specific health checks, and audited connection changes.</div>
        </div>

        <section className="int-stats">
          <div className="int-stat"><div className="int-stat-icon green"><CheckCircle2 size={20} /></div><div><p>Connected</p><strong>{connected}</strong><small>Demo connected services</small></div></div>
          <div className="int-stat"><div className="int-stat-icon orange"><Settings2 size={20} /></div><div><p>Needs Setup</p><strong>{needsSetup}</strong><small>Awaiting configuration</small></div></div>
          <div className="int-stat"><div className="int-stat-icon"><Plug size={20} /></div><div><p>Total Integrations</p><strong>{integrations.length}</strong><small>Available catalog entries</small></div></div>
          <div className="int-stat"><div className="int-stat-icon red"><AlertTriangle size={20} /></div><div><p>Reported Errors</p><strong>{errors}</strong><small>Demo error states</small></div></div>
        </section>

        <div className="int-layout">
          <aside className="int-sidebar">
            <div className="int-side-head"><h2>Integration Categories</h2><p>Filter the service catalog</p></div>
            <div className="int-category-list">
              <button className={`int-category ${activeCategory === "All" ? "active" : ""}`} onClick={() => setActiveCategory("All")}><span><Plug size={15} />All Integrations</span><span className="int-count">{integrations.length}</span></button>
              {categories.map((category) => {
                const Icon = categoryIcons[category];
                const count = integrations.filter((item) => item.category === category).length;
                return <button key={category} className={`int-category ${activeCategory === category ? "active" : ""}`} onClick={() => setActiveCategory(category)}><span><Icon size={15} />{category}</span><span className="int-count">{count}</span></button>;
              })}
            </div>
          </aside>

          <section className="int-panel">
            <div className="int-panel-header">
              <div><h2>Integration Catalog</h2><p>Configure, review, and manage the services used by ModelNow.</p></div>
              <span className="int-status int-status-connected"><ShieldCheck size={12} />Admin managed</span>
            </div>
            <div className="int-toolbar">
              <div className="int-search"><Search size={15} /><input aria-label="Search integrations" placeholder="Search integrations..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
              <select className="int-select" aria-label="Filter by connection status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All statuses</option><option value="Connected">Connected</option><option value="Disconnected">Disconnected</option><option value="Needs setup">Needs setup</option><option value="Error">Error</option>
              </select>
              <button className="int-btn" onClick={exportIntegrations}><Filter size={14} />Export Results</button>
            </div>

            {filtered.length > 0 ? <div className="int-grid">
              {filtered.map((integration) => {
                const Icon = categoryIcons[integration.category];
                return <article className="int-card" key={integration.id}>
                  <div className="int-card-top">
                    <div className="int-brand"><div className="int-brand-icon"><Icon size={21} /></div><div><h3>{integration.name}</h3><p>{integration.provider} · {integration.category}</p></div></div>
                    <span className={`int-status ${statusClass[integration.status]}`}>{integration.status}</span>
                  </div>
                  <p className="int-description">{integration.description}</p>
                  <div className="int-card-meta"><span><Cloud size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {integration.environment}</span><span><Clock size={12} style={{ display: "inline", verticalAlign: "middle" }} /> {integration.lastTested === "Never" ? "Not tested" : integration.lastTested}</span></div>
                  <div className="int-card-actions">
                    <button className="int-btn" onClick={() => openConfiguration(integration)}><Settings2 size={13} />Configure</button>
                    <button className="int-btn" title="Record demo test" aria-label={`Test ${integration.name}`} onClick={() => testIntegration(integration)}><TestTube2 size={14} /></button>
                    <button className="int-btn" title="Toggle demo status" aria-label={`${integration.status === "Connected" ? "Disconnect" : "Set up"} ${integration.name}`} onClick={() => toggleConnection(integration)}><Power size={14} /></button>
                  </div>
                </article>;
              })}
            </div> : <div className="int-empty">No integrations match your filters.</div>}

            <div className="int-footer"><span>Showing {filtered.length} of {integrations.length} integrations</span><span>Changes in this prototype do not call external services.</span></div>
          </section>
        </div>
      </div>

      {selected && <div className="int-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelected(null); }}>
        <section className="int-modal" role="dialog" aria-modal="true" aria-labelledby="int-config-title">
          <div className="int-modal-head"><div><h2 id="int-config-title">Configure {selected.name}</h2><small>{selected.category} · {selected.provider}</small></div><button className="int-btn" aria-label="Close configuration" onClick={() => setSelected(null)}><X size={14} /></button></div>
          <div className="int-modal-body">
            <div className="int-form-grid">
              <div className="int-field full"><label htmlFor="int-endpoint">API Endpoint / Base URL</label><input id="int-endpoint" value={selected.endpoint} onChange={(e) => setSelected({ ...selected, endpoint: e.target.value })} placeholder="https://api.example.com" /><small>Use the provider's official HTTPS endpoint. Leave blank if this integration uses OAuth or does not require a base URL.</small></div>
              <div className="int-field"><label htmlFor="int-environment">Environment</label><select id="int-environment" value={selected.environment} onChange={(e) => setSelected({ ...selected, environment: e.target.value })}><option>Development</option><option>Staging</option><option>Production</option></select></div>
              <div className="int-field"><label htmlFor="int-status">Demo Status</label><select id="int-status" value={selected.status} onChange={(e) => setSelected({ ...selected, status: e.target.value as IntegrationStatus })}><option>Connected</option><option>Disconnected</option><option>Needs setup</option><option>Error</option></select></div>
              <div className="int-field full"><label htmlFor="int-credential">Credential / Secret (optional)</label><div style={{ display: "flex", gap: 7 }}><input id="int-credential" type={showSecret ? "text" : "password"} autoComplete="new-password" value={selected.credential} onChange={(e) => setSelected({ ...selected, credential: e.target.value })} placeholder="Enter a development credential" /><button className="int-btn" type="button" onClick={() => setShowSecret((v) => !v)} aria-label={showSecret ? "Hide credential" : "Show credential"}>{showSecret ? <EyeOff size={14} /> : <Eye size={14} />}</button></div><small>This prototype does not send or persist credentials. Never use production secrets in this demo form.</small></div>
            </div>
            <div className="int-security-note"><ShieldCheck size={17} /><span>Production requirements: store secrets in a managed secrets service, encrypt them at rest, apply least-privilege access, rotate credentials, and audit all changes.</span></div>
            <div className="int-modal-actions"><button className="int-btn" onClick={() => setSelected(null)}>Cancel</button><button className="int-btn primary" onClick={saveConfiguration}><Save size={14} />Save Demo Configuration</button></div>
          </div>
        </section>
      </div>}

      {showCreate && <div className="int-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowCreate(false); }}>
        <section className="int-modal" role="dialog" aria-modal="true" aria-labelledby="int-create-title">
          <div className="int-modal-head"><h2 id="int-create-title">Add Custom Integration</h2><button className="int-btn" aria-label="Close add integration form" onClick={() => setShowCreate(false)}><X size={14} /></button></div>
          <div className="int-modal-body">
            <div className="int-form-grid">
              <div className="int-field"><label htmlFor="custom-name">Integration Name *</label><input id="custom-name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Internal Analytics" /></div>
              <div className="int-field"><label htmlFor="custom-provider">Provider *</label><input id="custom-provider" value={draft.provider} onChange={(e) => setDraft({ ...draft, provider: e.target.value })} placeholder="Your provider" /></div>
              <div className="int-field"><label htmlFor="custom-category">Category</label><select id="custom-category" value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as IntegrationCategory })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></div>
              <div className="int-field"><label htmlFor="custom-endpoint">HTTPS Endpoint</label><input id="custom-endpoint" value={draft.endpoint} onChange={(e) => setDraft({ ...draft, endpoint: e.target.value })} placeholder="https://service.example.com" /></div>
              <div className="int-field full"><label htmlFor="custom-description">Description</label><textarea id="custom-description" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} placeholder="Describe what this integration will do..." /></div>
            </div>
            <div className="int-modal-actions"><button className="int-btn" onClick={() => setShowCreate(false)}>Cancel</button><button className="int-btn primary" onClick={createIntegration}><Plus size={14} />Add Integration</button></div>
          </div>
        </section>
      </div>}
    </main>
  );
}
