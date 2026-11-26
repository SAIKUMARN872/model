
"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Clock3,
  Cpu,
  GitBranch,
  Gauge,
  Layers3,
  Plus,
  RefreshCw,
  Route,
  Save,
  Search,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Trash2,
  X,
  Zap,
} from "lucide-react";

type RoutingRule = {
  id: string;
  name: string;
  description: string;
  condition: string;
  destination: string;
  priority: number;
  enabled: boolean;
  fallback: string;
};

type RouteProvider = {
  id: string;
  name: string;
  provider: string;
  enabled: boolean;
  latency: number;
  inputCost: number;
  outputCost: number;
  health: "Healthy" | "Degraded" | "Unavailable";
  weight: number;
};

const initialProviders: RouteProvider[] = [
  {
    id: "modelnow-quality-12b",
    name: "ModelNow Quality 12B",
    provider: "ModelNow",
    enabled: true,
    latency: 620,
    inputCost: 0.45,
    outputCost: 1.2,
    health: "Healthy",
    weight: 40,
  },
  {
    id: "modelnow-efficient-4b",
    name: "ModelNow Efficient 4B",
    provider: "ModelNow",
    enabled: true,
    latency: 180,
    inputCost: 0.08,
    outputCost: 0.22,
    health: "Healthy",
    weight: 35,
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    provider: "OpenAI",
    enabled: true,
    latency: 850,
    inputCost: 2.5,
    outputCost: 10,
    health: "Healthy",
    weight: 15,
  },
  {
    id: "claude-sonnet",
    name: "Claude Sonnet",
    provider: "Anthropic",
    enabled: false,
    latency: 920,
    inputCost: 3,
    outputCost: 15,
    health: "Unavailable",
    weight: 10,
  },
];

const initialRules: RoutingRule[] = [
  {
    id: "rule-001",
    name: "Fast responses",
    description: "Route simple and latency-sensitive requests to efficient models.",
    condition: "Low latency",
    destination: "modelnow-efficient-4b",
    priority: 1,
    enabled: true,
    fallback: "modelnow-quality-12b",
  },
  {
    id: "rule-002",
    name: "Complex reasoning",
    description: "Prefer quality-focused models for complex reasoning tasks.",
    condition: "Reasoning required",
    destination: "modelnow-quality-12b",
    priority: 2,
    enabled: true,
    fallback: "gpt-4o",
  },
  {
    id: "rule-003",
    name: "Multimodal requests",
    description: "Use models configured for image and multimodal input.",
    condition: "Vision or multimodal",
    destination: "gpt-4o",
    priority: 3,
    enabled: true,
    fallback: "modelnow-quality-12b",
  },
  {
    id: "rule-004",
    name: "Default traffic",
    description: "Handle requests that do not match a higher-priority rule.",
    condition: "Default",
    destination: "modelnow-quality-12b",
    priority: 4,
    enabled: true,
    fallback: "modelnow-efficient-4b",
  },
];

export default function ModelRoutingSettingsPage() {
  const [providers, setProviders] = useState<RouteProvider[]>(initialProviders);
  const [rules, setRules] = useState<RoutingRule[]>(initialRules);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [notice, setNotice] = useState("");
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [settings, setSettings] = useState({
    strategy: "priority",
    defaultModel: "modelnow-quality-12b",
    fallbackModel: "modelnow-efficient-4b",
    maxFallbackAttempts: "2",
    requestTimeout: "60",
    maxRetries: "2",
    latencyTarget: "1000",
    costLimit: "5",
    maxConcurrentRequests: "100",
    circuitBreakerThreshold: "5",
    circuitBreakerRecovery: "30",
    enableFallback: true,
    enableHealthChecks: true,
    enableRetries: true,
    enableCircuitBreaker: true,
    enableCostOptimization: false,
    enableLatencyOptimization: true,
    respectModelCapabilities: true,
    respectProviderStatus: true,
    logRoutingDecisions: true,
  });

  const [ruleDraft, setRuleDraft] = useState({
    name: "",
    description: "",
    condition: "Low latency",
    destination: "modelnow-efficient-4b",
    fallback: "modelnow-quality-12b",
    enabled: true,
  });

  const enabledProviders = providers.filter((provider) => provider.enabled);
  const enabledRules = rules.filter((rule) => rule.enabled);

  const filteredRules = useMemo(
    () =>
      rules.filter((rule) =>
        `${rule.name} ${rule.description} ${rule.condition}`
          .toLowerCase()
          .includes(search.toLowerCase()),
      ),
    [rules, search],
  );

  const totalWeight = enabledProviders.reduce(
    (sum, provider) => sum + provider.weight,
    0,
  );

  function saveSettings() {
    try {
      localStorage.setItem(
        "modelnow-routing-settings",
        JSON.stringify({ settings, providers, rules }),
      );
      setNotice(
        "Routing configuration saved in this browser. The backend routing engine must load and enforce these settings for live traffic.",
      );
    } catch {
      setNotice("Unable to save routing configuration.");
    }
  }

  function updateSettings<K extends keyof typeof settings>(
    key: K,
    value: (typeof settings)[K],
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function updateProvider(
    id: string,
    updates: Partial<RouteProvider>,
  ) {
    setProviders((current) =>
      current.map((provider) =>
        provider.id === id ? { ...provider, ...updates } : provider,
      ),
    );
  }

  function moveRule(id: string, direction: "up" | "down") {
    const ordered = [...rules].sort((a, b) => a.priority - b.priority);
    const index = ordered.findIndex((rule) => rule.id === id);
    const targetIndex = direction === "up" ? index - 1 : index + 1;

    if (index < 0 || targetIndex < 0 || targetIndex >= ordered.length) {
      return;
    }

    [ordered[index], ordered[targetIndex]] = [
      ordered[targetIndex],
      ordered[index],
    ];

    setRules(
      ordered.map((rule, i) => ({ ...rule, priority: i + 1 })),
    );
  }

  function openCreateRule() {
    setEditingRuleId(null);
    setRuleDraft({
      name: "",
      description: "",
      condition: "Low latency",
      destination: settings.defaultModel,
      fallback: settings.fallbackModel,
      enabled: true,
    });
    setShowRuleModal(true);
  }

  function openEditRule(rule: RoutingRule) {
    setEditingRuleId(rule.id);
    setRuleDraft({
      name: rule.name,
      description: rule.description,
      condition: rule.condition,
      destination: rule.destination,
      fallback: rule.fallback,
      enabled: rule.enabled,
    });
    setShowRuleModal(true);
  }

  function saveRule() {
    if (!ruleDraft.name.trim()) {
      setNotice("Enter a name for the routing rule.");
      return;
    }

    if (
      !providers.some(
        (provider) =>
          provider.id === ruleDraft.destination && provider.enabled,
      )
    ) {
      setNotice("Choose an enabled destination model.");
      return;
    }

    if (editingRuleId) {
      setRules((current) =>
        current.map((rule) =>
          rule.id === editingRuleId
            ? {
                ...rule,
                ...ruleDraft,
                name: ruleDraft.name.trim(),
              }
            : rule,
        ),
      );
      setNotice("Routing rule updated in the current interface.");
    } else {
      const newRule: RoutingRule = {
        id: `rule-${Date.now()}`,
        ...ruleDraft,
        name: ruleDraft.name.trim(),
        priority: rules.length + 1,
      };

      setRules((current) => [...current, newRule]);
      setNotice("Routing rule added to the current interface.");
    }

    setShowRuleModal(false);
  }

  function deleteRule(id: string) {
    const target = rules.find((rule) => rule.id === id);

    if (target?.condition === "Default") {
      setNotice("The default routing rule cannot be deleted.");
      return;
    }

    setRules((current) =>
      current
        .filter((rule) => rule.id !== id)
        .sort((a, b) => a.priority - b.priority)
        .map((rule, index) => ({ ...rule, priority: index + 1 })),
    );
    setNotice("Routing rule removed from the current interface.");
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
      <div className="routing-toggle-row">
        <div>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={title}
          className={`routing-switch ${checked ? "on" : ""}`}
          onClick={() => onChange(!checked)}
        />
      </div>
    );
  }

  return (
    <main className="routing-page">
      <style>{`
        .routing-page{min-height:100vh;padding:30px;background:#f7f8fc;color:#202a40;font-family:Arial,Helvetica,sans-serif}
        .routing-container{max-width:1260px;margin:0 auto}
        .routing-breadcrumb{display:flex;flex-wrap:wrap;gap:9px;margin-bottom:22px;color:#858da0;font-size:13px}
        .routing-breadcrumb a{color:#5265d9;text-decoration:none}
        .routing-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:24px}
        .routing-heading-left{display:flex;align-items:center;gap:14px}
        .routing-heading-icon{display:grid;place-items:center;width:50px;height:50px;flex-shrink:0;border-radius:14px;background:#e9edff;color:#5265d9}
        .routing-heading h1{margin:0 0 7px;font-size:27px;letter-spacing:-.6px}
        .routing-heading p{max-width:700px;margin:0;color:#7e8799;font-size:13px;line-height:1.6}
        .routing-actions{display:flex;flex-wrap:wrap;gap:9px}
        .routing-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:39px;padding:0 13px;border:1px solid #dfe4ed;border-radius:9px;background:white;color:#414c64;font-size:12px;font-weight:600;cursor:pointer}
        .routing-btn.primary{background:#5265d9;border-color:#5265d9;color:white}
        .routing-btn.danger{color:#c24141}
        .routing-notice{display:flex;align-items:flex-start;gap:10px;margin-bottom:18px;padding:13px 15px;border:1px solid #dce4ff;border-radius:10px;background:#f0f3ff;color:#4055b5;font-size:12px;line-height:1.6}
        .routing-warning{display:flex;align-items:flex-start;gap:12px;margin-bottom:20px;padding:15px;border:1px solid #f3dfb1;border-radius:11px;background:#fff9e9;color:#94651a;font-size:12px;line-height:1.6}
        .routing-warning strong{display:block;margin-bottom:4px}
        .routing-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:22px}
        .routing-stat{display:flex;align-items:center;gap:12px;padding:18px;border:1px solid #e7eaf1;border-radius:12px;background:white}
        .routing-stat-icon{display:grid;place-items:center;width:40px;height:40px;flex-shrink:0;border-radius:10px;background:#f0f2ff;color:#5265d9}
        .routing-stat-label{margin-bottom:6px;color:#818a9c;font-size:11px}
        .routing-stat-value{font-size:23px;font-weight:700}
        .routing-tabs{display:flex;flex-wrap:wrap;gap:6px;padding:6px;margin-bottom:18px;border:1px solid #e7eaf1;border-radius:11px;background:white}
        .routing-tab{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 15px;border:0;border-radius:7px;background:transparent;color:#6f7890;font-size:12px;font-weight:600;cursor:pointer}
        .routing-tab.active{background:#edf0ff;color:#485dd0}
        .routing-card{overflow:hidden;margin-bottom:18px;border:1px solid #e7eaf1;border-radius:13px;background:white;box-shadow:0 2px 7px rgba(24,36,70,.025)}
        .routing-card-header{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:20px 22px;border-bottom:1px solid #edf0f5}
        .routing-card-header h2{margin:0 0 6px;font-size:15px}
        .routing-card-header p{margin:0;color:#858da0;font-size:12px;line-height:1.6}
        .routing-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:17px;padding:22px}
        .routing-field{display:flex;flex-direction:column;gap:8px;min-width:0}
        .routing-field.full{grid-column:1/-1}
        .routing-field label{color:#39445a;font-size:12px;font-weight:700}
        .routing-field input,.routing-field select,.routing-field textarea{width:100%;padding:11px 12px;border:1px solid #dfe4ed;border-radius:8px;outline:none;background:white;color:#202a40;font:inherit;font-size:12px}
        .routing-field input,.routing-field select{height:42px}
        .routing-field textarea{min-height:75px;resize:vertical}
        .routing-field small{color:#8991a2;font-size:11px;line-height:1.5}
        .routing-toggle-row{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:17px 22px;border-bottom:1px solid #edf0f5}
        .routing-toggle-row:last-child{border-bottom:0}
        .routing-toggle-row strong{display:block;margin-bottom:5px;font-size:12px}
        .routing-toggle-row p{margin:0;color:#858da0;font-size:11px;line-height:1.6}
        .routing-switch{position:relative;width:38px;height:22px;flex:0 0 auto;padding:0;border:0;border-radius:20px;background:#cbd1dd;cursor:pointer}
        .routing-switch.on{background:#5265d9}
        .routing-switch:after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:white;transition:transform .15s ease}
        .routing-switch.on:after{transform:translateX(16px)}
        .routing-table-wrap{overflow-x:auto}
        .routing-table{width:100%;border-collapse:collapse;text-align:left;white-space:nowrap}
        .routing-table th{padding:14px 16px;background:#fafbfe;color:#7f889a;font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase}
        .routing-table td{padding:15px 16px;border-top:1px solid #edf0f5;color:#4b566d;font-size:12px}
        .routing-model{display:flex;align-items:center;gap:10px;min-width:200px}
        .routing-model-icon{display:grid;place-items:center;width:35px;height:35px;flex-shrink:0;border-radius:9px;background:#f0f2ff;color:#5265d9}
        .routing-model strong{display:block;margin-bottom:5px;color:#263149;font-size:12px}
        .routing-muted{color:#8991a2;font-size:10px;white-space:normal;line-height:1.5}
        .routing-badge{display:inline-flex;align-items:center;gap:5px;padding:5px 9px;border-radius:20px;background:#f0f1f5;color:#697386;font-size:10px;font-weight:700}
        .routing-badge.green{background:#eaf9f0;color:#218552}
        .routing-badge.red{background:#fff0f0;color:#c24141}
        .routing-badge.orange{background:#fff5df;color:#9a6a12}
        .routing-icon-btn{display:grid;place-items:center;width:31px;height:31px;border:1px solid #e4e8f0;border-radius:7px;background:white;color:#66718a;cursor:pointer}
        .routing-icon-btn:disabled{opacity:.35;cursor:not-allowed}
        .routing-row-actions{display:flex;gap:6px}
        .routing-search{position:relative;flex:1 1 220px;min-width:180px}
        .routing-search svg{position:absolute;top:12px;left:12px;color:#929bad}
        .routing-search input{width:100%;height:40px;padding:0 12px 0 37px;border:1px solid #dfe4ed;border-radius:8px;outline:none;font-size:12px}
        .routing-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:16px 22px;border-bottom:1px solid #edf0f5}
        .routing-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 22px;border-top:1px solid #edf0f5;color:#858da0;font-size:11px}
        .routing-empty{padding:40px 20px;text-align:center;color:#858da0;font-size:13px}
        .routing-progress{height:7px;overflow:hidden;border-radius:10px;background:#edf0f5}
        .routing-progress span{display:block;height:100%;border-radius:10px;background:#5265d9}
        .routing-modal-backdrop{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:20px;background:rgba(20,28,48,.45)}
        .routing-modal{width:100%;max-width:590px;max-height:90vh;overflow-y:auto;border:1px solid #e7eaf1;border-radius:15px;background:white;box-shadow:0 20px 70px rgba(20,28,48,.2)}
        .routing-modal-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px 22px;border-bottom:1px solid #edf0f5}
        .routing-modal-header h2{margin:0;font-size:17px}
        .routing-modal-body{padding:22px}
        .routing-modal-actions{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:9px;margin-top:22px}
        @media(max-width:950px){.routing-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:650px){.routing-page{padding:18px 12px}.routing-heading{flex-direction:column}.routing-heading h1{font-size:23px}.routing-actions{width:100%}.routing-btn{flex:1}.routing-tabs{overflow-x:auto;flex-wrap:nowrap}.routing-tab{white-space:nowrap}.routing-form-grid{grid-template-columns:1fr}.routing-field.full{grid-column:auto}.routing-footer{align-items:flex-start;flex-direction:column}}
      `}</style>

      <div className="routing-container">
        <div className="routing-breadcrumb">
          <a href="/dashboard">Admin</a>
          <span>/</span>
          <a href="/settings">Settings</a>
          <span>/</span>
          <span>Model Routing Settings</span>
        </div>

        <header className="routing-heading">
          <div className="routing-heading-left">
            <div className="routing-heading-icon"><GitBranch size={24} /></div>
            <div>
              <h1>Model Routing Settings</h1>
              <p>
                Configure intelligent model selection, priority rules, fallback
                behavior, load distribution, and inference resilience.
              </p>
            </div>
          </div>
          <div className="routing-actions">
            <button type="button" className="routing-btn" onClick={() => {
              setSearch("");
              setNotice("Routing rule search cleared.");
            }}>
              <RefreshCw size={14} /> Reset Filters
            </button>
            <button type="button" className="routing-btn primary" onClick={saveSettings}>
              <Save size={14} /> Save Configuration
            </button>
          </div>
        </header>

        {notice && (
          <div className="routing-notice" role="status">
            <CheckCircle2 size={17} />
            <span style={{ flex: 1 }}>{notice}</span>
            <button type="button" className="routing-icon-btn" aria-label="Dismiss notification" onClick={() => setNotice("")}><X size={14} /></button>
          </div>
        )}

        <div className="routing-warning">
          <CircleHelp size={19} />
          <div>
            <strong>Routing settings are not yet connected to live inference</strong>
            This page edits demonstration configuration in the browser. Production
            routing requires a server-side routing engine, real provider health checks,
            authorization, telemetry, and request-level policy enforcement.
          </div>
        </div>

        <section className="routing-stats">
          <div className="routing-stat">
            <div className="routing-stat-icon"><Layers3 size={19} /></div>
            <div><div className="routing-stat-label">Registered Models</div><div className="routing-stat-value">{providers.length}</div></div>
          </div>
          <div className="routing-stat">
            <div className="routing-stat-icon"><CheckCircle2 size={19} /></div>
            <div><div className="routing-stat-label">Enabled Models</div><div className="routing-stat-value">{enabledProviders.length}</div></div>
          </div>
          <div className="routing-stat">
            <div className="routing-stat-icon"><GitBranch size={19} /></div>
            <div><div className="routing-stat-label">Active Rules</div><div className="routing-stat-value">{enabledRules.length}</div></div>
          </div>
          <div className="routing-stat">
            <div className="routing-stat-icon"><Zap size={19} /></div>
            <div><div className="routing-stat-label">Enabled Route Weight</div><div className="routing-stat-value">{totalWeight}%</div></div>
          </div>
        </section>

        <div className="routing-tabs">
          <button type="button" className={`routing-tab ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}><Route size={15} />Overview</button>
          <button type="button" className={`routing-tab ${activeTab === "rules" ? "active" : ""}`} onClick={() => setActiveTab("rules")}><GitBranch size={15} />Routing Rules</button>
          <button type="button" className={`routing-tab ${activeTab === "models" ? "active" : ""}`} onClick={() => setActiveTab("models")}><Cpu size={15} />Model Weights</button>
          <button type="button" className={`routing-tab ${activeTab === "resilience" ? "active" : ""}`} onClick={() => setActiveTab("resilience")}><ShieldCheck size={15} />Resilience</button>
          <button type="button" className={`routing-tab ${activeTab === "advanced" ? "active" : ""}`} onClick={() => setActiveTab("advanced")}><SlidersHorizontal size={15} />Advanced</button>
        </div>

        {activeTab === "overview" && (
          <>
            <section className="routing-card">
              <div className="routing-card-header">
                <div><h2>Routing Strategy</h2><p>Select the default strategy for deciding which model receives a request.</p></div>
                <Settings2 size={21} color="#5265d9" />
              </div>
              <div className="routing-form-grid">
                <div className="routing-field full">
                  <label htmlFor="routingStrategy">Selection Strategy</label>
                  <select id="routingStrategy" value={settings.strategy} onChange={(event) => updateSettings("strategy", event.target.value)}>
                    <option value="priority">Priority-based routing</option>
                    <option value="least-latency">Lowest latency</option>
                    <option value="cost-optimized">Cost-optimized routing</option>
                    <option value="round-robin">Round robin</option>
                    <option value="weighted">Weighted distribution</option>
                    <option value="capability">Capability-based routing</option>
                    <option value="quality">Quality-based routing</option>
                  </select>
                  <small>Use request complexity, model capability, organization policy, and current provider health when selecting a destination.</small>
                </div>
                <div className="routing-field">
                  <label htmlFor="defaultModel">Default Model</label>
                  <select id="defaultModel" value={settings.defaultModel} onChange={(event) => updateSettings("defaultModel", event.target.value)}>
                    {providers.filter((provider) => provider.enabled).map((provider) => <option key={provider.id} value={provider.id}>{provider.name}</option>)}
                  </select>
                </div>
                <div className="routing-field">
                  <label htmlFor="fallbackModel">Fallback Model</label>
                  <select id="fallbackModel" value={settings.fallbackModel} onChange={(event) => updateSettings("fallbackModel", event.target.value)}>
                    {providers.filter((provider) => provider.enabled).map((provider) => <option key={provider.id} value={provider.id}>{provider.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="routing-footer">
                <span>Default and fallback models must be available to the routing service.</span>
                <button type="button" className="routing-btn primary" onClick={saveSettings}><Save size={14} />Save Strategy</button>
              </div>
            </section>

            <section className="routing-card">
              <div className="routing-card-header">
                <div><h2>Routing Policy</h2><p>Control how the routing engine handles model capabilities and failures.</p></div>
              </div>
              <Toggle title="Enable Fallback Routing" description="Try an eligible alternative model when the selected destination fails." checked={settings.enableFallback} onChange={(value) => updateSettings("enableFallback", value)} />
              <Toggle title="Respect Model Capabilities" description="Do not route requests to models that lack required tools, vision, or output capabilities." checked={settings.respectModelCapabilities} onChange={(value) => updateSettings("respectModelCapabilities", value)} />
              <Toggle title="Respect Provider Status" description="Exclude disabled or unhealthy providers from eligible destinations." checked={settings.respectProviderStatus} onChange={(value) => updateSettings("respectProviderStatus", value)} />
              <Toggle title="Enable Latency Optimization" description="Prefer eligible models that meet the configured latency target." checked={settings.enableLatencyOptimization} onChange={(value) => updateSettings("enableLatencyOptimization", value)} />
              <Toggle title="Enable Cost Optimization" description="Prefer eligible lower-cost models when request quality requirements are met." checked={settings.enableCostOptimization} onChange={(value) => updateSettings("enableCostOptimization", value)} />
              <div className="routing-footer">
                <span>Enforce all routing policies on the server, not in the browser.</span>
                <button type="button" className="routing-btn primary" onClick={saveSettings}><Save size={14} />Save Policy</button>
              </div>
            </section>

            <section className="routing-card">
              <div className="routing-card-header">
                <div><h2>Routing Flow</h2><p>Reference flow for a production model-routing request.</p></div>
              </div>
              <div style={{ padding: 22, display: "grid", gap: 10 }}>
                {[
                  ["01", "Receive Request", "Authenticate request and resolve organization, workspace, and model permissions."],
                  ["02", "Evaluate Policies", "Match model requirements, routing rules, budget limits, and data policies."],
                  ["03", "Select Destination", "Choose an enabled, healthy provider based on the configured strategy."],
                  ["04", "Execute Inference", "Send the request with bounded timeout, token limits, and request tracing."],
                  ["05", "Recover if Needed", "Apply safe retry, circuit-breaker, and fallback rules where permitted."],
                  ["06", "Record Outcome", "Log routing decisions, latency, token usage, cost, and sanitized errors."],
                ].map(([number, title, description], index) => (
                  <div key={number}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 13 }}>
                      <div style={{ display: "grid", placeItems: "center", width: 34, height: 34, flexShrink: 0, borderRadius: 9, background: "#edf0ff", color: "#5265d9", fontSize: 11, fontWeight: 700 }}>{number}</div>
                      <div style={{ flex: 1 }}>
                        <strong style={{ display: "block", margin: "2px 0 5px", fontSize: 12 }}>{title}</strong>
                        <p style={{ margin: 0, color: "#858da0", fontSize: 11, lineHeight: 1.7 }}>{description}</p>
                      </div>
                    </div>
                    {index < 5 && <div style={{ height: 14, marginLeft: 16, borderLeft: "1px dashed #d4d9e5" }} />}
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === "rules" && (
          <section className="routing-card">
            <div className="routing-card-header">
              <div><h2>Routing Rules</h2><p>Define conditions, model destinations, and fallback destinations.</p></div>
              <button type="button" className="routing-btn primary" onClick={openCreateRule}><Plus size={14} />Add Rule</button>
            </div>
            <div className="routing-toolbar">
              <div className="routing-search">
                <Search size={16} />
                <input aria-label="Search routing rules" placeholder="Search rules or conditions..." value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
              <span className="routing-badge">{filteredRules.length} rules</span>
            </div>
            <div className="routing-table-wrap">
              <table className="routing-table">
                <thead><tr><th>Priority</th><th>Rule</th><th>Condition</th><th>Destination</th><th>Fallback</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {[...filteredRules].sort((a, b) => a.priority - b.priority).map((rule) => {
                    const destination = providers.find((provider) => provider.id === rule.destination);
                    const fallback = providers.find((provider) => provider.id === rule.fallback);

                    return (
                      <tr key={rule.id}>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                            <strong>#{rule.priority}</strong>
                            <div style={{ display: "grid", gap: 3 }}>
                              <button type="button" className="routing-icon-btn" aria-label="Move rule up" disabled={rule.priority === 1} onClick={() => moveRule(rule.id, "up")}><ArrowUp size={12} /></button>
                              <button type="button" className="routing-icon-btn" aria-label="Move rule down" disabled={rule.priority === rules.length} onClick={() => moveRule(rule.id, "down")}><ArrowDown size={12} /></button>
                            </div>
                          </div>
                        </td>
                        <td><strong style={{ color: "#263149" }}>{rule.name}</strong><div className="routing-muted" style={{ marginTop: 5 }}>{rule.description}</div></td>
                        <td><span className="routing-badge">{rule.condition}</span></td>
                        <td>{destination?.name ?? rule.destination}</td>
                        <td>{fallback?.name ?? rule.fallback}</td>
                        <td><span className={`routing-badge ${rule.enabled ? "green" : ""}`}>{rule.enabled ? "Enabled" : "Disabled"}</span></td>
                        <td>
                          <div className="routing-row-actions">
                            <button type="button" className="routing-icon-btn" title="Edit rule" aria-label={`Edit ${rule.name}`} onClick={() => openEditRule(rule)}><Settings2 size={14} /></button>
                            <button type="button" role="switch" aria-checked={rule.enabled} aria-label={`Toggle ${rule.name}`} className={`routing-switch ${rule.enabled ? "on" : ""}`} onClick={() => setRules((current) => current.map((item) => item.id === rule.id ? { ...item, enabled: !item.enabled } : item))} />
                            {rule.condition !== "Default" && <button type="button" className="routing-icon-btn" title="Delete rule" aria-label={`Delete ${rule.name}`} onClick={() => deleteRule(rule.id)}><Trash2 size={14} /></button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredRules.length === 0 && <div className="routing-empty">No routing rules match your search.</div>}
            </div>
            <div className="routing-footer">
              <span>Lower priority numbers are evaluated first in this interface.</span>
              <button type="button" className="routing-btn primary" onClick={saveSettings}><Save size={14} />Save Rules</button>
            </div>
          </section>
        )}

        {activeTab === "models" && (
          <>
            <section className="routing-card">
              <div className="routing-card-header">
                <div><h2>Model Weights & Availability</h2><p>Configure weights for weighted routing and manage model eligibility.</p></div>
                <Gauge size={21} color="#5265d9" />
              </div>
              <div className="routing-table-wrap">
                <table className="routing-table">
                  <thead><tr><th>Model</th><th>Provider</th><th>Health</th><th>Weight</th><th>Input / 1M</th><th>Latency</th><th>Enabled</th></tr></thead>
                  <tbody>
                    {providers.map((provider) => (
                      <tr key={provider.id}>
                        <td><div className="routing-model"><div className="routing-model-icon"><Cpu size={16} /></div><div><strong>{provider.name}</strong><div className="routing-muted">{provider.id}</div></div></div></td>
                        <td>{provider.provider}</td>
                        <td><span className={`routing-badge ${provider.health === "Healthy" ? "green" : provider.health === "Degraded" ? "orange" : "red"}`}>{provider.health}</span></td>
                        <td style={{ minWidth: 120 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input aria-label={`${provider.name} routing weight`} type="number" min="0" max="100" value={provider.weight} style={{ width: 58, height: 32, border: "1px solid #dfe4ed", borderRadius: 7, padding: "0 7px" }} onChange={(event) => updateProvider(provider.id, { weight: Math.max(0, Math.min(100, Number(event.target.value) || 0)) })} />
                            <span className="routing-muted">%</span>
                          </div>
                          <div className="routing-progress" style={{ marginTop: 8 }}><span style={{ width: `${provider.weight}%` }} /></div>
                        </td>
                        <td>${provider.inputCost.toFixed(2)}</td>
                        <td>{provider.latency} ms</td>
                        <td><button type="button" role="switch" aria-checked={provider.enabled} aria-label={`Enable ${provider.name}`} className={`routing-switch ${provider.enabled ? "on" : ""}`} onClick={() => updateProvider(provider.id, { enabled: !provider.enabled })} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="routing-footer">
                <span>Enabled model weight total: {totalWeight}%. Normalize weights in the backend before weighted selection.</span>
                <button type="button" className="routing-btn primary" onClick={saveSettings}><Save size={14} />Save Weights</button>
              </div>
            </section>

            <section className="routing-card">
              <div className="routing-card-header">
                <div><h2>Cost & Latency Targets</h2><p>Define limits that the routing engine can use when comparing eligible models.</p></div>
              </div>
              <div className="routing-form-grid">
                <div className="routing-field">
                  <label htmlFor="latencyTarget">Target Latency (ms)</label>
                  <input id="latencyTarget" type="number" min="1" value={settings.latencyTarget} onChange={(event) => updateSettings("latencyTarget", event.target.value)} />
                </div>
                <div className="routing-field">
                  <label htmlFor="costLimit">Estimated Cost Ceiling ($ / 1M tokens)</label>
                  <input id="costLimit" type="number" min="0" step="0.1" value={settings.costLimit} onChange={(event) => updateSettings("costLimit", event.target.value)} />
                </div>
              </div>
              <div className="routing-footer">
                <span>Prices and latency shown here are illustrative configuration values.</span>
                <button type="button" className="routing-btn primary" onClick={saveSettings}><Save size={14} />Save Targets</button>
              </div>
            </section>
          </>
        )}

        {activeTab === "resilience" && (
          <>
            <section className="routing-card">
              <div className="routing-card-header">
                <div><h2>Fallback & Retry Policy</h2><p>Control safe recovery behavior when upstream inference requests fail.</p></div>
                <RefreshCw size={21} color="#5265d9" />
              </div>
              <div className="routing-form-grid">
                <div className="routing-field">
                  <label htmlFor="maxFallbackAttempts">Maximum Fallback Attempts</label>
                  <input id="maxFallbackAttempts" type="number" min="0" max="10" value={settings.maxFallbackAttempts} onChange={(event) => updateSettings("maxFallbackAttempts", event.target.value)} />
                </div>
                <div className="routing-field">
                  <label htmlFor="requestTimeout">Request Timeout (seconds)</label>
                  <input id="requestTimeout" type="number" min="1" max="600" value={settings.requestTimeout} onChange={(event) => updateSettings("requestTimeout", event.target.value)} />
                </div>
                <div className="routing-field">
                  <label htmlFor="maxRetries">Maximum Retry Attempts</label>
                  <input id="maxRetries" type="number" min="0" max="10" value={settings.maxRetries} onChange={(event) => updateSettings("maxRetries", event.target.value)} />
                </div>
                <div className="routing-field">
                  <label htmlFor="breakerThreshold">Circuit Breaker Failure Threshold</label>
                  <input id="breakerThreshold" type="number" min="1" value={settings.circuitBreakerThreshold} onChange={(event) => updateSettings("circuitBreakerThreshold", event.target.value)} />
                </div>
                <div className="routing-field">
                  <label htmlFor="breakerRecovery">Circuit Breaker Recovery (seconds)</label>
                  <input id="breakerRecovery" type="number" min="1" value={settings.circuitBreakerRecovery} onChange={(event) => updateSettings("circuitBreakerRecovery", event.target.value)} />
                </div>
              </div>
              <Toggle title="Enable Retries" description="Retry transient failures using bounded attempts and backoff." checked={settings.enableRetries} onChange={(value) => updateSettings("enableRetries", value)} />
              <Toggle title="Enable Circuit Breaker" description="Temporarily stop sending requests to a provider after repeated failures." checked={settings.enableCircuitBreaker} onChange={(value) => updateSettings("enableCircuitBreaker", value)} />
              <Toggle title="Enable Provider Health Checks" description="Use backend health signals to exclude unhealthy destinations." checked={settings.enableHealthChecks} onChange={(value) => updateSettings("enableHealthChecks", value)} />
              <Toggle title="Enable Fallback Routing" description="Allow fallback models when eligible and permitted by data and capability policies." checked={settings.enableFallback} onChange={(value) => updateSettings("enableFallback", value)} />
              <div className="routing-footer">
                <span>Retries should be bounded and must account for request idempotency.</span>
                <button type="button" className="routing-btn primary" onClick={saveSettings}><Save size={14} />Save Resilience</button>
              </div>
            </section>

            <section className="routing-card">
              <div className="routing-card-header">
                <div><h2>Failure Handling Guidelines</h2><p>Recommended behavior for production routing services.</p></div>
              </div>
              <div style={{ display: "grid", gap: 15, padding: 22 }}>
                {[
                  ["Rate limited", "Respect Retry-After when present and apply bounded exponential backoff."],
                  ["Provider unavailable", "Open the circuit after the configured threshold and evaluate eligible fallbacks."],
                  ["Timeout", "Stop the attempt at the request deadline and avoid unbounded retry chains."],
                  ["Invalid model request", "Return a clear validation error instead of retrying the same invalid request."],
                  ["Capability mismatch", "Do not fall back to a model that cannot satisfy required tools, modalities, or output constraints."],
                ].map(([title, description]) => (
                  <div key={title} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <CheckCircle2 size={16} color="#5265d9" style={{ marginTop: 2, flexShrink: 0 }} />
                    <div><strong style={{ fontSize: 12 }}>{title}</strong><p style={{ margin: "5px 0 0", color: "#858da0", fontSize: 11, lineHeight: 1.7 }}>{description}</p></div>
                  </div>
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === "advanced" && (
          <>
            <section className="routing-card">
              <div className="routing-card-header">
                <div><h2>Advanced Routing Controls</h2><p>Set concurrency limits and decision logging behavior.</p></div>
                <SlidersHorizontal size={21} color="#5265d9" />
              </div>
              <div className="routing-form-grid">
                <div className="routing-field">
                  <label htmlFor="maxConcurrent">Maximum Concurrent Requests</label>
                  <input id="maxConcurrent" type="number" min="1" value={settings.maxConcurrentRequests} onChange={(event) => updateSettings("maxConcurrentRequests", event.target.value)} />
                  <small>Enforce through backend concurrency control or provider-specific limits.</small>
                </div>
                <div className="routing-field">
                  <label>Current Routing Strategy</label>
                  <input value={settings.strategy.replaceAll("-", " ")} readOnly />
                  <small>Change the strategy on the Overview tab.</small>
                </div>
              </div>
              <Toggle title="Log Routing Decisions" description="Record selected destination, rule ID, strategy, and reason for routing." checked={settings.logRoutingDecisions} onChange={(value) => updateSettings("logRoutingDecisions", value)} />
              <div className="routing-footer">
                <span>Redact sensitive prompt content from operational logs.</span>
                <button type="button" className="routing-btn primary" onClick={saveSettings}><Save size={14} />Save Advanced Settings</button>
              </div>
            </section>

            <section className="routing-card">
              <div className="routing-card-header">
                <div><h2>Configuration Summary</h2><p>Review the current settings before saving.</p></div>
              </div>
              <div style={{ padding: 22, display: "grid", gap: 0 }}>
                {[
                  ["Strategy", settings.strategy.replaceAll("-", " ")],
                  ["Default model", providers.find((provider) => provider.id === settings.defaultModel)?.name ?? settings.defaultModel],
                  ["Fallback model", providers.find((provider) => provider.id === settings.fallbackModel)?.name ?? settings.fallbackModel],
                  ["Enabled models", `${enabledProviders.length} of ${providers.length}`],
                  ["Enabled routing rules", `${enabledRules.length} of ${rules.length}`],
                  ["Request timeout", `${settings.requestTimeout} seconds`],
                  ["Fallback", settings.enableFallback ? "Enabled" : "Disabled"],
                  ["Decision logging", settings.logRoutingDecisions ? "Enabled" : "Disabled"],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", gap: 18, padding: "12px 0", borderBottom: "1px solid #edf0f5", fontSize: 12 }}>
                    <span style={{ color: "#858da0" }}>{label}</span>
                    <strong style={{ textAlign: "right", textTransform: "capitalize" }}>{value}</strong>
                  </div>
                ))}
              </div>
              <div className="routing-footer">
                <span>Saving does not deploy or activate server-side routing.</span>
                <button type="button" className="routing-btn primary" onClick={saveSettings}><Save size={14} />Save Configuration</button>
              </div>
            </section>
          </>
        )}

        <div className="routing-footer" style={{ padding: "12px 0 30px", borderTop: 0 }}>
          <span>ModelNow Admin · Model Routing Configuration</span>
          <button type="button" className="routing-btn primary" onClick={saveSettings}><Save size={14} />Save All Changes</button>
        </div>
      </div>

      {showRuleModal && (
        <div className="routing-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowRuleModal(false);
        }}>
          <section className="routing-modal" role="dialog" aria-modal="true" aria-labelledby="routing-rule-title">
            <div className="routing-modal-header">
              <h2 id="routing-rule-title">{editingRuleId ? "Edit Routing Rule" : "Create Routing Rule"}</h2>
              <button type="button" className="routing-icon-btn" aria-label="Close dialog" onClick={() => setShowRuleModal(false)}><X size={15} /></button>
            </div>
            <div className="routing-modal-body">
              <div className="routing-form-grid" style={{ padding: 0 }}>
                <div className="routing-field full">
                  <label htmlFor="ruleName">Rule Name</label>
                  <input id="ruleName" value={ruleDraft.name} onChange={(event) => setRuleDraft((current) => ({ ...current, name: event.target.value }))} placeholder="Example: Low-cost classification" />
                </div>
                <div className="routing-field full">
                  <label htmlFor="ruleDescription">Description</label>
                  <textarea id="ruleDescription" value={ruleDraft.description} onChange={(event) => setRuleDraft((current) => ({ ...current, description: event.target.value }))} placeholder="Describe when this rule should apply." />
                </div>
                <div className="routing-field full">
                  <label htmlFor="ruleCondition">Condition</label>
                  <select id="ruleCondition" value={ruleDraft.condition} onChange={(event) => setRuleDraft((current) => ({ ...current, condition: event.target.value }))}>
                    <option>Low latency</option>
                    <option>Reasoning required</option>
                    <option>Vision or multimodal</option>
                    <option>Low cost</option>
                    <option>Long context</option>
                    <option>Tool calling</option>
                    <option>Default</option>
                    <option>Custom condition</option>
                  </select>
                </div>
                <div className="routing-field">
                  <label htmlFor="ruleDestination">Destination Model</label>
                  <select id="ruleDestination" value={ruleDraft.destination} onChange={(event) => setRuleDraft((current) => ({ ...current, destination: event.target.value }))}>
                    {providers.filter((provider) => provider.enabled).map((provider) => <option key={provider.id} value={provider.id}>{provider.name}</option>)}
                  </select>
                </div>
                <div className="routing-field">
                  <label htmlFor="ruleFallback">Fallback Model</label>
                  <select id="ruleFallback" value={ruleDraft.fallback} onChange={(event) => setRuleDraft((current) => ({ ...current, fallback: event.target.value }))}>
                    {providers.filter((provider) => provider.enabled).map((provider) => <option key={provider.id} value={provider.id}>{provider.name}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginTop: 18 }}>
                <Toggle title="Enable This Rule" description="Include this rule in the configured routing policy." checked={ruleDraft.enabled} onChange={(value) => setRuleDraft((current) => ({ ...current, enabled: value }))} />
              </div>
              <div className="routing-modal-actions">
                <button type="button" className="routing-btn" onClick={() => setShowRuleModal(false)}>Cancel</button>
                <button type="button" className="routing-btn primary" onClick={saveRule}><Check size={14} />{editingRuleId ? "Save Rule" : "Create Rule"}</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
