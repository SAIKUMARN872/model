
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  Cpu,
  Eye,
  Filter,
  Gauge,
  Layers3,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  X,
  Zap,
} from "lucide-react";

type AIModel = {
  id: string;
  name: string;
  provider: string;
  family: string;
  contextWindow: number;
  maxOutput: number;
  inputPrice: number;
  outputPrice: number;
  latency: number;
  status: "Enabled" | "Disabled" | "Maintenance";
  capabilities: string[];
  featured: boolean;
  description: string;
};

const initialModels: AIModel[] = [
  {
    id: "modelnow-quality-12b",
    name: "ModelNow Quality 12B",
    provider: "ModelNow",
    family: "Foundation",
    contextWindow: 128000,
    maxOutput: 8192,
    inputPrice: 0.45,
    outputPrice: 1.2,
    latency: 620,
    status: "Enabled",
    capabilities: ["Chat", "Reasoning", "JSON"],
    featured: true,
    description: "Quality-focused model for business workflows and complex responses.",
  },
  {
    id: "modelnow-efficient-4b",
    name: "ModelNow Efficient 4B",
    provider: "ModelNow",
    family: "Foundation",
    contextWindow: 32000,
    maxOutput: 4096,
    inputPrice: 0.08,
    outputPrice: 0.22,
    latency: 180,
    status: "Enabled",
    capabilities: ["Chat", "JSON"],
    featured: false,
    description: "Low-latency model for classification and high-volume tasks.",
  },
  {
    id: "modelnow-foundation-8b",
    name: "ModelNow Foundation 8B",
    provider: "ModelNow",
    family: "Foundation",
    contextWindow: 64000,
    maxOutput: 4096,
    inputPrice: 0.18,
    outputPrice: 0.48,
    latency: 320,
    status: "Enabled",
    capabilities: ["Chat", "Reasoning", "JSON", "Tools"],
    featured: false,
    description: "Balanced foundation model for general-purpose AI applications.",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    family: "Multimodal",
    contextWindow: 128000,
    maxOutput: 16384,
    inputPrice: 2.5,
    outputPrice: 10,
    latency: 850,
    status: "Enabled",
    capabilities: ["Chat", "Vision", "Tools", "JSON"],
    featured: true,
    description: "Multimodal model supporting text, image understanding, and tools.",
  },
  {
    id: "claude-sonnet",
    name: "Claude Sonnet",
    provider: "Anthropic",
    family: "Reasoning",
    contextWindow: 200000,
    maxOutput: 8192,
    inputPrice: 3,
    outputPrice: 15,
    latency: 920,
    status: "Enabled",
    capabilities: ["Chat", "Reasoning", "Vision", "Tools"],
    featured: false,
    description: "Model entry for complex writing, analysis, and reasoning workflows.",
  },
  {
    id: "gemini-flash",
    name: "Gemini Flash",
    provider: "Google",
    family: "Multimodal",
    contextWindow: 1000000,
    maxOutput: 8192,
    inputPrice: 0.15,
    outputPrice: 0.6,
    latency: 390,
    status: "Disabled",
    capabilities: ["Chat", "Vision", "Tools", "JSON"],
    featured: false,
    description: "Fast multimodal model entry for large-context use cases.",
  },
];

const providers = ["All", "ModelNow", "OpenAI", "Anthropic", "Google"];
const capabilities = ["Chat", "Reasoning", "Vision", "Tools", "JSON"];

const formatContext = (value: number) =>
  value >= 1000000
    ? `${(value / 1000000).toFixed(value % 1000000 === 0 ? 0 : 1)}M`
    : `${Math.round(value / 1000)}K`;

export default function AIModelSettingsPage() {
  const [models, setModels] = useState<AIModel[]>(initialModels);
  const [search, setSearch] = useState("");
  const [providerFilter, setProviderFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [capabilityFilter, setCapabilityFilter] = useState("All");
  const [activeTab, setActiveTab] = useState("catalog");
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [notice, setNotice] = useState("");
  const [settings, setSettings] = useState({
    defaultModel: "modelnow-quality-12b",
    fallbackModel: "modelnow-efficient-4b",
    maxOutputTokens: "4096",
    defaultTemperature: "0.7",
    defaultTopP: "1",
    timeoutSeconds: "60",
    enableStreaming: true,
    enableToolCalling: true,
    enableJsonMode: true,
    enableModelFallback: true,
    requireEnabledModel: true,
    logModelRequests: true,
  });

  const [newModel, setNewModel] = useState({
    id: "",
    name: "",
    provider: "ModelNow",
    family: "Foundation",
    contextWindow: "32000",
    maxOutput: "4096",
    inputPrice: "0",
    outputPrice: "0",
    latency: "500",
    description: "",
    capabilities: ["Chat"],
  });

  const filteredModels = useMemo(() => {
    return models.filter((model) => {
      const matchesSearch = `${model.name} ${model.id} ${model.provider} ${model.family}`
        .toLowerCase()
        .includes(search.toLowerCase());
      const matchesProvider =
        providerFilter === "All" || model.provider === providerFilter;
      const matchesStatus =
        statusFilter === "All" || model.status === statusFilter;
      const matchesCapability =
        capabilityFilter === "All" ||
        model.capabilities.includes(capabilityFilter);

      return (
        matchesSearch &&
        matchesProvider &&
        matchesStatus &&
        matchesCapability
      );
    });
  }, [models, search, providerFilter, statusFilter, capabilityFilter]);

  const enabledCount = models.filter((model) => model.status === "Enabled").length;
  const featuredCount = models.filter(
    (model) => model.featured && model.status === "Enabled",
  ).length;
  const providerCount = new Set(
    models.filter((model) => model.status === "Enabled").map((model) => model.provider),
  ).size;
  const averageLatency = models.length
    ? Math.round(
        models
          .filter((model) => model.status === "Enabled")
          .reduce((sum, model) => sum + model.latency, 0) /
          Math.max(enabledCount, 1),
      )
    : 0;

  function saveSettings() {
    try {
      localStorage.setItem("modelnow-ai-model-settings", JSON.stringify(settings));
      localStorage.setItem("modelnow-ai-model-catalog", JSON.stringify(models));
      setNotice(
        "Model settings saved in this browser. Connect the backend to apply these settings to live inference.",
      );
    } catch {
      setNotice("Unable to save settings in this browser.");
    }
  }

  function toggleModelStatus(modelId: string) {
    setModels((current) =>
      current.map((model) =>
        model.id === modelId
          ? {
              ...model,
              status: model.status === "Enabled" ? "Disabled" : "Enabled",
            }
          : model,
      ),
    );
    setNotice("Model status updated in the current interface.");
  }

  function toggleFeatured(modelId: string) {
    setModels((current) =>
      current.map((model) =>
        model.id === modelId ? { ...model, featured: !model.featured } : model,
      ),
    );
  }

  function createModel() {
    const id = newModel.id.trim().toLowerCase().replace(/\s+/g, "-");

    if (!id || !newModel.name.trim()) {
      setNotice("Enter both a model ID and model name.");
      return;
    }

    if (models.some((model) => model.id === id)) {
      setNotice("A model with this ID already exists.");
      return;
    }

    const model: AIModel = {
      id,
      name: newModel.name.trim(),
      provider: newModel.provider,
      family: newModel.family,
      contextWindow: Math.max(1, Number(newModel.contextWindow) || 32000),
      maxOutput: Math.max(1, Number(newModel.maxOutput) || 4096),
      inputPrice: Math.max(0, Number(newModel.inputPrice) || 0),
      outputPrice: Math.max(0, Number(newModel.outputPrice) || 0),
      latency: Math.max(0, Number(newModel.latency) || 0),
      status: "Disabled",
      capabilities: newModel.capabilities,
      featured: false,
      description: newModel.description.trim() || "Custom model configuration.",
    };

    setModels((current) => [...current, model]);
    setShowCreate(false);
    setNewModel({
      id: "",
      name: "",
      provider: "ModelNow",
      family: "Foundation",
      contextWindow: "32000",
      maxOutput: "4096",
      inputPrice: "0",
      outputPrice: "0",
      latency: "500",
      description: "",
      capabilities: ["Chat"],
    });
    setNotice("Model added as disabled. Configure its provider connection before enabling live requests.");
  }

  function toggleNewCapability(capability: string) {
    setNewModel((current) => ({
      ...current,
      capabilities: current.capabilities.includes(capability)
        ? current.capabilities.filter((item) => item !== capability)
        : [...current.capabilities, capability],
    }));
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
      <div className="model-toggle-row">
        <div>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={title}
          className={`model-switch ${checked ? "on" : ""}`}
          onClick={() => onChange(!checked)}
        />
      </div>
    );
  }

  return (
    <main className="model-settings-page">
      <style>{`
        .model-settings-page {
          min-height:100vh;padding:30px;background:#f7f8fc;color:#202a40;
          font-family:Arial,Helvetica,sans-serif;
        }
        .model-container{max-width:1260px;margin:0 auto}
        .model-breadcrumb{display:flex;gap:9px;margin-bottom:22px;color:#858da0;font-size:13px;flex-wrap:wrap}
        .model-breadcrumb a{color:#5265d9;text-decoration:none}
        .model-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:24px}
        .model-title-wrap{display:flex;align-items:center;gap:14px}
        .model-title-icon{display:grid;place-items:center;width:50px;height:50px;flex-shrink:0;border-radius:14px;background:#e9edff;color:#5265d9}
        .model-heading h1{margin:0 0 7px;font-size:27px;letter-spacing:-.6px}
        .model-heading p{margin:0;color:#7e8799;font-size:13px;line-height:1.6;max-width:690px}
        .model-actions{display:flex;gap:9px;flex-wrap:wrap}
        .model-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:39px;padding:0 13px;border:1px solid #dfe4ed;border-radius:9px;background:white;color:#414c64;font-size:12px;font-weight:600;cursor:pointer}
        .model-btn.primary{background:#5265d9;border-color:#5265d9;color:white}
        .model-btn:disabled{opacity:.45;cursor:not-allowed}
        .model-notice{display:flex;align-items:center;gap:9px;padding:13px 15px;margin-bottom:18px;border:1px solid #dce4ff;border-radius:10px;background:#f0f3ff;color:#4055b5;font-size:12px;line-height:1.6}
        .model-warning{display:flex;align-items:flex-start;gap:12px;padding:15px;margin-bottom:20px;border:1px solid #f3dfb1;border-radius:11px;background:#fff9e9;color:#94651a;font-size:12px;line-height:1.6}
        .model-warning strong{display:block;margin-bottom:4px}
        .model-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:22px}
        .model-stat{display:flex;align-items:center;gap:12px;padding:18px;border:1px solid #e7eaf1;border-radius:12px;background:white}
        .model-stat-icon{display:grid;place-items:center;width:40px;height:40px;flex-shrink:0;border-radius:10px;background:#f0f2ff;color:#5265d9}
        .model-stat-label{margin-bottom:6px;color:#818a9c;font-size:11px}
        .model-stat-value{color:#202a40;font-size:23px;font-weight:700}
        .model-tabs{display:flex;flex-wrap:wrap;gap:6px;padding:6px;margin-bottom:18px;border:1px solid #e7eaf1;border-radius:11px;background:white}
        .model-tab{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 15px;border:0;border-radius:7px;background:transparent;color:#6f7890;font-size:12px;font-weight:600;cursor:pointer}
        .model-tab.active{background:#edf0ff;color:#485dd0}
        .model-card{overflow:hidden;margin-bottom:18px;border:1px solid #e7eaf1;border-radius:13px;background:white;box-shadow:0 2px 7px rgba(24,36,70,.025)}
        .model-card-header{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:20px 22px;border-bottom:1px solid #edf0f5}
        .model-card-header h2{margin:0 0 6px;font-size:15px}
        .model-card-header p{margin:0;color:#858da0;font-size:12px;line-height:1.6}
        .model-toolbar{display:flex;align-items:center;flex-wrap:wrap;gap:10px;padding:16px 22px;border-bottom:1px solid #edf0f5}
        .model-search{position:relative;flex:1 1 220px;min-width:180px}
        .model-search svg{position:absolute;top:12px;left:12px;color:#929bad}
        .model-search input{width:100%;height:40px;padding:0 12px 0 37px;border:1px solid #dfe4ed;border-radius:8px;outline:none;font-size:12px}
        .model-toolbar select{height:40px;padding:0 10px;border:1px solid #dfe4ed;border-radius:8px;background:white;color:#48536b;font-size:12px}
        .model-table-wrap{overflow-x:auto}
        .model-table{width:100%;border-collapse:collapse;text-align:left;white-space:nowrap}
        .model-table th{padding:14px 16px;background:#fafbfe;color:#7f889a;font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase}
        .model-table td{padding:15px 16px;border-top:1px solid #edf0f5;color:#4b566d;font-size:12px}
        .model-name{display:flex;align-items:flex-start;gap:10px}
        .model-avatar{display:grid;place-items:center;width:36px;height:36px;flex-shrink:0;border-radius:9px;background:#f0f2ff;color:#5265d9}
        .model-name strong{display:block;margin:2px 0 5px;color:#263149;font-size:12px}
        .model-muted{color:#8991a2;font-size:10px}
        .model-badge{display:inline-flex;align-items:center;gap:5px;padding:5px 9px;border-radius:20px;background:#f0f2ff;color:#5265d9;font-size:10px;font-weight:700}
        .model-badge.green{background:#eaf9f0;color:#218552}
        .model-badge.red{background:#fff0f0;color:#c24141}
        .model-badge.gray{background:#f0f1f5;color:#697386}
        .model-badge.orange{background:#fff5df;color:#9a6a12}
        .model-capabilities{display:flex;flex-wrap:wrap;gap:5px;max-width:180px}
        .model-capability{padding:4px 7px;border:1px solid #e5e8f0;border-radius:5px;background:#fafbfe;color:#697386;font-size:10px}
        .model-icon-btn{display:grid;place-items:center;width:31px;height:31px;border:1px solid #e4e8f0;border-radius:7px;background:white;color:#66718a;cursor:pointer}
        .model-row-actions{display:flex;gap:6px}
        .model-toggle-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:17px 22px;border-bottom:1px solid #edf0f5}
        .model-toggle-row:last-child{border-bottom:0}
        .model-toggle-row strong{display:block;margin-bottom:5px;font-size:12px}
        .model-toggle-row p{margin:0;color:#858da0;font-size:11px;line-height:1.6}
        .model-switch{position:relative;width:38px;height:22px;flex:0 0 auto;padding:0;border:0;border-radius:20px;background:#cbd1dd;cursor:pointer}
        .model-switch.on{background:#5265d9}
        .model-switch:after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:white;transition:transform .15s ease}
        .model-switch.on:after{transform:translateX(16px)}
        .model-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:17px;padding:22px}
        .model-field{display:flex;flex-direction:column;gap:8px;min-width:0}
        .model-field.full{grid-column:1/-1}
        .model-field label{color:#39445a;font-size:12px;font-weight:700}
        .model-field input,.model-field select,.model-field textarea{width:100%;padding:11px 12px;border:1px solid #dfe4ed;border-radius:8px;outline:none;background:white;color:#202a40;font:inherit;font-size:12px}
        .model-field input,.model-field select{height:42px}
        .model-field textarea{min-height:80px;resize:vertical}
        .model-field small{color:#8991a2;font-size:11px;line-height:1.5}
        .model-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 22px;border-top:1px solid #edf0f5;color:#858da0;font-size:11px}
        .model-empty{padding:40px 20px;text-align:center;color:#858da0;font-size:13px}
        .model-modal-backdrop{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:20px;background:rgba(20,28,48,.45)}
        .model-modal{width:100%;max-width:600px;max-height:90vh;overflow-y:auto;border:1px solid #e7eaf1;border-radius:15px;background:white;box-shadow:0 20px 70px rgba(20,28,48,.2)}
        .model-modal-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px 22px;border-bottom:1px solid #edf0f5}
        .model-modal-header h2{margin:0;font-size:17px}
        .model-modal-body{padding:22px}
        .model-modal-actions{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:9px;margin-top:22px}
        .model-capability-list{display:flex;flex-wrap:wrap;gap:10px}
        .model-capability-option{display:flex;align-items:center;gap:7px;padding:9px 11px;border:1px solid #dfe4ed;border-radius:8px;color:#4b566d;font-size:12px}
        .model-capability-option input{accent-color:#5265d9}
        .model-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
        .model-detail-box{padding:14px;border:1px solid #edf0f5;border-radius:9px;background:#fafbfe}
        .model-detail-box span{display:block;margin-bottom:7px;color:#858da0;font-size:10px}
        .model-detail-box strong{font-size:14px;color:#263149;overflow-wrap:anywhere}
        @media(max-width:950px){.model-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:650px){.model-settings-page{padding:18px 12px}.model-heading{flex-direction:column}.model-heading h1{font-size:23px}.model-actions{width:100%}.model-btn{flex:1}.model-tabs{overflow-x:auto;flex-wrap:nowrap}.model-tab{white-space:nowrap}.model-form-grid{grid-template-columns:1fr}.model-field.full{grid-column:auto}.model-footer{align-items:flex-start;flex-direction:column}.model-detail-grid{grid-template-columns:1fr}}
      `}</style>

      <div className="model-container">
        <div className="model-breadcrumb">
          <a href="/dashboard">Admin</a>
          <span>/</span>
          <a href="/settings">Settings</a>
          <span>/</span>
          <span>AI Model Settings</span>
        </div>

        <header className="model-heading">
          <div className="model-title-wrap">
            <div className="model-title-icon"><Cpu size={24} /></div>
            <div>
              <h1>AI Model Settings</h1>
              <p>
                Manage model availability, capabilities, inference defaults,
                token limits, and model-level configuration across ModelNow.
              </p>
            </div>
          </div>
          <div className="model-actions">
            <button type="button" className="model-btn" onClick={() => {
              setSearch("");
              setProviderFilter("All");
              setStatusFilter("All");
              setCapabilityFilter("All");
              setNotice("Model catalog filters reset.");
            }}>
              <RefreshCw size={14} /> Reset Filters
            </button>
            <button type="button" className="model-btn primary" onClick={saveSettings}>
              <Check size={14} /> Save Settings
            </button>
          </div>
        </header>

        {notice && (
          <div className="model-notice" role="status">
            <CheckCircle2 size={17} />
            <span>{notice}</span>
            <button type="button" className="model-icon-btn" aria-label="Dismiss notification" onClick={() => setNotice("")}>
              <X size={14} />
            </button>
          </div>
        )}

        <div className="model-warning">
          <AlertTriangle size={19} />
          <div>
            <strong>Model catalog is currently demo data</strong>
            Changes made here update the current interface and browser storage when saved.
            Actual model availability, provider connections, pricing, and inference behavior
            must be validated and enforced by the backend.
          </div>
        </div>

        <section className="model-stats">
          <div className="model-stat">
            <div className="model-stat-icon"><Layers3 size={19} /></div>
            <div>
              <div className="model-stat-label">Registered Models</div>
              <div className="model-stat-value">{models.length}</div>
            </div>
          </div>
          <div className="model-stat">
            <div className="model-stat-icon"><CheckCircle2 size={19} /></div>
            <div>
              <div className="model-stat-label">Enabled Models</div>
              <div className="model-stat-value">{enabledCount}</div>
            </div>
          </div>
          <div className="model-stat">
            <div className="model-stat-icon"><Activity size={19} /></div>
            <div>
              <div className="model-stat-label">Provider Sources</div>
              <div className="model-stat-value">{providerCount}</div>
            </div>
          </div>
          <div className="model-stat">
            <div className="model-stat-icon"><Zap size={19} /></div>
            <div>
              <div className="model-stat-label">Average Listed Latency</div>
              <div className="model-stat-value">{averageLatency}<span style={{ fontSize: 11, fontWeight: 500 }}> ms</span></div>
            </div>
          </div>
        </section>

        <div className="model-tabs">
          <button type="button" className={`model-tab ${activeTab === "catalog" ? "active" : ""}`} onClick={() => setActiveTab("catalog")}><Layers3 size={15} />Model Catalog</button>
          <button type="button" className={`model-tab ${activeTab === "defaults" ? "active" : ""}`} onClick={() => setActiveTab("defaults")}><Settings2 size={15} />Inference Defaults</button>
          <button type="button" className={`model-tab ${activeTab === "capabilities" ? "active" : ""}`} onClick={() => setActiveTab("capabilities")}><SlidersHorizontal size={15} />Capabilities</button>
          <button type="button" className={`model-tab ${activeTab === "governance" ? "active" : ""}`} onClick={() => setActiveTab("governance")}><ShieldCheck size={15} />Governance</button>
        </div>

        {activeTab === "catalog" && (
          <section className="model-card">
            <div className="model-card-header">
              <div>
                <h2>Model Catalog</h2>
                <p>Inspect model metadata, enable or disable models, and choose featured options.</p>
              </div>
              <button type="button" className="model-btn primary" onClick={() => setShowCreate(true)}>
                <Plus size={15} /> Add Model
              </button>
            </div>

            <div className="model-toolbar">
              <div className="model-search">
                <Search size={16} />
                <input aria-label="Search models" placeholder="Search model name, ID, or provider..." value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
              <select aria-label="Filter by provider" value={providerFilter} onChange={(event) => setProviderFilter(event.target.value)}>
                {providers.map((provider) => <option key={provider} value={provider}>{provider === "All" ? "All providers" : provider}</option>)}
              </select>
              <select aria-label="Filter by status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="All">All statuses</option>
                <option value="Enabled">Enabled</option>
                <option value="Disabled">Disabled</option>
                <option value="Maintenance">Maintenance</option>
              </select>
              <select aria-label="Filter by capability" value={capabilityFilter} onChange={(event) => setCapabilityFilter(event.target.value)}>
                <option value="All">All capabilities</option>
                {capabilities.map((capability) => <option key={capability} value={capability}>{capability}</option>)}
              </select>
            </div>

            <div className="model-table-wrap">
              <table className="model-table">
                <thead>
                  <tr>
                    <th>Model</th>
                    <th>Provider</th>
                    <th>Context</th>
                    <th>Input / Output</th>
                    <th>Latency</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredModels.map((model) => (
                    <tr key={model.id}>
                      <td>
                        <div className="model-name">
                          <div className="model-avatar"><Cpu size={17} /></div>
                          <div>
                            <strong>{model.name}</strong>
                            <div className="model-muted">{model.id}</div>
                            <div className="model-capabilities" style={{ marginTop: 7 }}>
                              {model.capabilities.slice(0, 3).map((capability) => <span className="model-capability" key={capability}>{capability}</span>)}
                              {model.capabilities.length > 3 && <span className="model-capability">+{model.capabilities.length - 3}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>{model.provider}<div className="model-muted" style={{ marginTop: 5 }}>{model.family}</div></td>
                      <td>{formatContext(model.contextWindow)}<div className="model-muted" style={{ marginTop: 5 }}>Max output {model.maxOutput.toLocaleString()}</div></td>
                      <td>
                        <div>${model.inputPrice.toFixed(2)}</div>
                        <div className="model-muted" style={{ marginTop: 5 }}>${model.outputPrice.toFixed(2)} / 1M tokens</div>
                      </td>
                      <td>{model.latency} ms</td>
                      <td>
                        <span className={`model-badge ${model.status === "Enabled" ? "green" : model.status === "Disabled" ? "gray" : "orange"}`}>
                          {model.status}
                        </span>
                        {model.featured && <div style={{ marginTop: 6 }}><span className="model-badge"><Star size={10} />Featured</span></div>}
                      </td>
                      <td>
                        <div className="model-row-actions">
                          <button type="button" className="model-icon-btn" title="View model details" aria-label={`View ${model.name}`} onClick={() => setSelectedModel(model)}><Eye size={14} /></button>
                          <button type="button" className="model-icon-btn" title={model.featured ? "Remove featured status" : "Feature model"} aria-label={model.featured ? "Unfeature model" : "Feature model"} onClick={() => toggleFeatured(model.id)}><Star size={14} fill={model.featured ? "#5265d9" : "none"} /></button>
                          <button type="button" className="model-icon-btn" title={model.status === "Enabled" ? "Disable model" : "Enable model"} aria-label={model.status === "Enabled" ? "Disable model" : "Enable model"} onClick={() => toggleModelStatus(model.id)}><CheckCircle2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredModels.length === 0 && <div className="model-empty">No models match your selected filters.</div>}
            </div>
            <div className="model-footer">
              <span>Showing {filteredModels.length} of {models.length} models</span>
              <span>{featuredCount} enabled featured models</span>
            </div>
          </section>
        )}

        {activeTab === "defaults" && (
          <>
            <section className="model-card">
              <div className="model-card-header">
                <div>
                  <h2>Default Inference Configuration</h2>
                  <p>Choose default and fallback models, generation parameters, and request timeouts.</p>
                </div>
                <Gauge size={21} color="#5265d9" />
              </div>
              <div className="model-form-grid">
                <div className="model-field">
                  <label htmlFor="defaultModel">Default Model</label>
                  <select id="defaultModel" value={settings.defaultModel} onChange={(event) => setSettings((current) => ({ ...current, defaultModel: event.target.value }))}>
                    {models.filter((model) => model.status === "Enabled").map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}
                  </select>
                  <small>Used when a request does not specify a model.</small>
                </div>
                <div className="model-field">
                  <label htmlFor="fallbackModel">Fallback Model</label>
                  <select id="fallbackModel" value={settings.fallbackModel} onChange={(event) => setSettings((current) => ({ ...current, fallbackModel: event.target.value }))}>
                    <option value="">No fallback</option>
                    {models.filter((model) => model.status === "Enabled").map((model) => <option key={model.id} value={model.id}>{model.name}</option>)}
                  </select>
                  <small>Used when the primary model is unavailable, if fallback is enabled.</small>
                </div>
                <div className="model-field">
                  <label htmlFor="maxOutputTokens">Maximum Output Tokens</label>
                  <input id="maxOutputTokens" type="number" min="1" max="200000" value={settings.maxOutputTokens} onChange={(event) => setSettings((current) => ({ ...current, maxOutputTokens: event.target.value }))} />
                  <small>Global output cap; model-specific limits still apply.</small>
                </div>
                <div className="model-field">
                  <label htmlFor="timeoutSeconds">Request Timeout (seconds)</label>
                  <input id="timeoutSeconds" type="number" min="1" max="600" value={settings.timeoutSeconds} onChange={(event) => setSettings((current) => ({ ...current, timeoutSeconds: event.target.value }))} />
                  <small>Maximum configured wait time for model requests.</small>
                </div>
                <div className="model-field">
                  <label htmlFor="temperature">Default Temperature</label>
                  <input id="temperature" type="number" min="0" max="2" step="0.1" value={settings.defaultTemperature} onChange={(event) => setSettings((current) => ({ ...current, defaultTemperature: event.target.value }))} />
                  <small>Lower values favor more consistent outputs.</small>
                </div>
                <div className="model-field">
                  <label htmlFor="topP">Default Top P</label>
                  <input id="topP" type="number" min="0" max="1" step="0.05" value={settings.defaultTopP} onChange={(event) => setSettings((current) => ({ ...current, defaultTopP: event.target.value }))} />
                  <small>Sampling threshold between 0 and 1.</small>
                </div>
              </div>
              <div className="model-footer">
                <span>Values are configuration placeholders until connected to inference services.</span>
                <button type="button" className="model-btn primary" onClick={saveSettings}><Check size={14} />Save Defaults</button>
              </div>
            </section>

            <section className="model-card">
              <div className="model-card-header">
                <div>
                  <h2>Generation Features</h2>
                  <p>Configure default behavior for supported model requests.</p>
                </div>
              </div>
              <Toggle title="Streaming Responses" description="Allow incremental response delivery when supported by the provider." checked={settings.enableStreaming} onChange={(value) => setSettings((current) => ({ ...current, enableStreaming: value }))} />
              <Toggle title="Tool Calling" description="Allow supported models to return structured tool-call requests." checked={settings.enableToolCalling} onChange={(value) => setSettings((current) => ({ ...current, enableToolCalling: value }))} />
              <Toggle title="JSON Output Mode" description="Allow supported models to return constrained JSON output." checked={settings.enableJsonMode} onChange={(value) => setSettings((current) => ({ ...current, enableJsonMode: value }))} />
              <div className="model-footer">
                <span>Only enable features supported by the selected model and provider.</span>
                <button type="button" className="model-btn primary" onClick={saveSettings}><Check size={14} />Save Features</button>
              </div>
            </section>
          </>
        )}

        {activeTab === "capabilities" && (
          <section className="model-card">
            <div className="model-card-header">
              <div>
                <h2>Model Capability Registry</h2>
                <p>Review the declared capabilities of every model in the catalog.</p>
              </div>
              <SlidersHorizontal size={21} color="#5265d9" />
            </div>
            <div className="model-table-wrap">
              <table className="model-table">
                <thead>
                  <tr><th>Model</th><th>Chat</th><th>Reasoning</th><th>Vision</th><th>Tool Calling</th><th>JSON</th></tr>
                </thead>
                <tbody>
                  {models.map((model) => (
                    <tr key={model.id}>
                      <td><strong style={{ color: "#263149" }}>{model.name}</strong><div className="model-muted" style={{ marginTop: 5 }}>{model.provider} · {model.status}</div></td>
                      {capabilities.map((capability) => (
                        <td key={capability}>
                          {model.capabilities.includes(capability)
                            ? <CheckCircle2 size={17} color="#218552" />
                            : <X size={16} color="#cbd1dd" />}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="model-footer">
              <span>Capabilities are catalog metadata, not a live provider capability check.</span>
              <span>{capabilities.length} capability types</span>
            </div>
          </section>
        )}

        {activeTab === "governance" && (
          <>
            <section className="model-card">
              <div className="model-card-header">
                <div>
                  <h2>Model Governance</h2>
                  <p>Configure platform-level model request guardrails and operational behavior.</p>
                </div>
                <ShieldCheck size={21} color="#5265d9" />
              </div>
              <Toggle title="Enable Model Fallback" description="Allow configured fallback behavior when the primary model is unavailable." checked={settings.enableModelFallback} onChange={(value) => setSettings((current) => ({ ...current, enableModelFallback: value }))} />
              <Toggle title="Require Enabled Models" description="Reject requests for models disabled in the platform catalog." checked={settings.requireEnabledModel} onChange={(value) => setSettings((current) => ({ ...current, requireEnabledModel: value }))} />
              <Toggle title="Log Model Requests" description="Record request metadata for observability and audit. Sensitive values should be redacted." checked={settings.logModelRequests} onChange={(value) => setSettings((current) => ({ ...current, logModelRequests: value }))} />
              <div className="model-footer">
                <span>Backend authorization and request validation are required.</span>
                <button type="button" className="model-btn primary" onClick={saveSettings}><Check size={14} />Save Governance</button>
              </div>
            </section>

            <section className="model-card">
              <div className="model-card-header">
                <div>
                  <h2>Governance Checklist</h2>
                  <p>Recommended operational safeguards for a production model platform.</p>
                </div>
              </div>
              <div style={{ display: "grid", gap: 14, padding: 22 }}>
                {[
                  "Validate model access against organization and workspace permissions.",
                  "Enforce model-specific context and output-token limits server-side.",
                  "Verify provider capabilities before allowing vision or tool calling.",
                  "Track model latency, error rate, token usage, and cost.",
                  "Keep a change history for model status, pricing, and default changes.",
                  "Prevent disabled or unapproved models from being selected by routing.",
                ].map((item) => (
                  <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 10, color: "#4b566d", fontSize: 12, lineHeight: 1.6 }}>
                    <ShieldCheck size={16} color="#5265d9" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        <div className="model-footer" style={{ padding: "12px 0 30px", borderTop: 0 }}>
          <span>ModelNow Admin · AI Model Configuration</span>
          <button type="button" className="model-btn primary" onClick={saveSettings}><Check size={14} />Save All Changes</button>
        </div>
      </div>

      {showCreate && (
        <div className="model-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowCreate(false);
        }}>
          <section className="model-modal" role="dialog" aria-modal="true" aria-labelledby="model-create-title">
            <div className="model-modal-header">
              <h2 id="model-create-title">Add AI Model</h2>
              <button type="button" className="model-icon-btn" aria-label="Close dialog" onClick={() => setShowCreate(false)}><X size={15} /></button>
            </div>
            <div className="model-modal-body">
              <div className="model-form-grid" style={{ padding: 0 }}>
                <div className="model-field">
                  <label htmlFor="newModelName">Model Name</label>
                  <input id="newModelName" value={newModel.name} onChange={(event) => setNewModel((current) => ({ ...current, name: event.target.value }))} placeholder="Example: ModelNow Pro 8B" />
                </div>
                <div className="model-field">
                  <label htmlFor="newModelId">Model ID</label>
                  <input id="newModelId" value={newModel.id} onChange={(event) => setNewModel((current) => ({ ...current, id: event.target.value }))} placeholder="modelnow-pro-8b" />
                </div>
                <div className="model-field">
                  <label htmlFor="newModelProvider">Provider</label>
                  <select id="newModelProvider" value={newModel.provider} onChange={(event) => setNewModel((current) => ({ ...current, provider: event.target.value }))}>
                    {providers.filter((provider) => provider !== "All").map((provider) => <option key={provider} value={provider}>{provider}</option>)}
                    <option value="Custom">Custom</option>
                  </select>
                </div>
                <div className="model-field">
                  <label htmlFor="newModelFamily">Model Family</label>
                  <select id="newModelFamily" value={newModel.family} onChange={(event) => setNewModel((current) => ({ ...current, family: event.target.value }))}>
                    <option>Foundation</option>
                    <option>Reasoning</option>
                    <option>Multimodal</option>
                    <option>Embedding</option>
                    <option>Fine-tuned</option>
                    <option>Custom</option>
                  </select>
                </div>
                <div className="model-field">
                  <label htmlFor="newModelContext">Context Window (tokens)</label>
                  <input id="newModelContext" type="number" min="1" value={newModel.contextWindow} onChange={(event) => setNewModel((current) => ({ ...current, contextWindow: event.target.value }))} />
                </div>
                <div className="model-field">
                  <label htmlFor="newModelOutput">Max Output Tokens</label>
                  <input id="newModelOutput" type="number" min="1" value={newModel.maxOutput} onChange={(event) => setNewModel((current) => ({ ...current, maxOutput: event.target.value }))} />
                </div>
                <div className="model-field">
                  <label htmlFor="newModelInputPrice">Input Price / 1M Tokens ($)</label>
                  <input id="newModelInputPrice" type="number" min="0" step="0.01" value={newModel.inputPrice} onChange={(event) => setNewModel((current) => ({ ...current, inputPrice: event.target.value }))} />
                </div>
                <div className="model-field">
                  <label htmlFor="newModelOutputPrice">Output Price / 1M Tokens ($)</label>
                  <input id="newModelOutputPrice" type="number" min="0" step="0.01" value={newModel.outputPrice} onChange={(event) => setNewModel((current) => ({ ...current, outputPrice: event.target.value }))} />
                </div>
                <div className="model-field">
                  <label htmlFor="newModelLatency">Listed Latency (ms)</label>
                  <input id="newModelLatency" type="number" min="0" value={newModel.latency} onChange={(event) => setNewModel((current) => ({ ...current, latency: event.target.value }))} />
                </div>
                <div className="model-field full">
                  <label htmlFor="newModelDescription">Description</label>
                  <textarea id="newModelDescription" value={newModel.description} onChange={(event) => setNewModel((current) => ({ ...current, description: event.target.value }))} placeholder="Describe the intended use case for this model." />
                </div>
                <div className="model-field full">
                  <label>Capabilities</label>
                  <div className="model-capability-list">
                    {capabilities.map((capability) => (
                      <label key={capability} className="model-capability-option">
                        <input type="checkbox" checked={newModel.capabilities.includes(capability)} onChange={() => toggleNewCapability(capability)} />
                        {capability}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div className="model-modal-actions">
                <button type="button" className="model-btn" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="button" className="model-btn primary" onClick={createModel}><Plus size={14} />Add Model</button>
              </div>
            </div>
          </section>
        </div>
      )}

      {selectedModel && (
        <div className="model-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedModel(null);
        }}>
          <section className="model-modal" role="dialog" aria-modal="true" aria-labelledby="model-details-title">
            <div className="model-modal-header">
              <h2 id="model-details-title">Model Details</h2>
              <button type="button" className="model-icon-btn" aria-label="Close dialog" onClick={() => setSelectedModel(null)}><X size={15} /></button>
            </div>
            <div className="model-modal-body">
              <div className="model-name" style={{ marginBottom: 20 }}>
                <div className="model-avatar"><Cpu size={19} /></div>
                <div>
                  <strong style={{ fontSize: 15 }}>{selectedModel.name}</strong>
                  <div className="model-muted" style={{ marginTop: 6 }}>{selectedModel.id}</div>
                  <div style={{ marginTop: 8 }}><span className={`model-badge ${selectedModel.status === "Enabled" ? "green" : selectedModel.status === "Disabled" ? "gray" : "orange"}`}>{selectedModel.status}</span></div>
                </div>
              </div>
              <p style={{ color: "#697386", fontSize: 12, lineHeight: 1.7 }}>{selectedModel.description}</p>
              <div className="model-detail-grid">
                <div className="model-detail-box"><span>Provider</span><strong>{selectedModel.provider}</strong></div>
                <div className="model-detail-box"><span>Family</span><strong>{selectedModel.family}</strong></div>
                <div className="model-detail-box"><span>Context Window</span><strong>{selectedModel.contextWindow.toLocaleString()} tokens</strong></div>
                <div className="model-detail-box"><span>Max Output</span><strong>{selectedModel.maxOutput.toLocaleString()} tokens</strong></div>
                <div className="model-detail-box"><span>Input Price / 1M</span><strong>${selectedModel.inputPrice.toFixed(2)}</strong></div>
                <div className="model-detail-box"><span>Output Price / 1M</span><strong>${selectedModel.outputPrice.toFixed(2)}</strong></div>
                <div className="model-detail-box"><span>Listed Latency</span><strong>{selectedModel.latency} ms</strong></div>
                <div className="model-detail-box"><span>Featured</span><strong>{selectedModel.featured ? "Yes" : "No"}</strong></div>
              </div>
              <h3 style={{ margin: "20px 0 10px", fontSize: 13 }}>Capabilities</h3>
              <div className="model-capability-list">
                {selectedModel.capabilities.map((capability) => <span className="model-capability" key={capability}>{capability}</span>)}
              </div>
              <div className="model-modal-actions">
                <button type="button" className="model-btn" onClick={() => setSelectedModel(null)}>Close</button>
                <button type="button" className="model-btn primary" onClick={() => {
                  toggleModelStatus(selectedModel.id);
                  setSelectedModel(null);
                }}>
                  <CheckCircle2 size={14} />
                  {selectedModel.status === "Enabled" ? "Disable Model" : "Enable Model"}
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
