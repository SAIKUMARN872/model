"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Cloud,
  Cpu,
  Database,
  Download,
  Globe,
  HardDrive,
  Info,
  LockKeyhole,
  RefreshCw,
  Save,
  Search,
  Server,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
  Terminal,
  ToggleLeft,
  ToggleRight,
  X,
  Zap,
} from "lucide-react";

type Tab =
  | "Overview"
  | "Runtime"
  | "Infrastructure"
  | "Environment Variables"
  | "Services"
  | "Maintenance";

type EnvironmentVariable = {
  id: string;
  key: string;
  value: string;
  description: string;
  secret: boolean;
  enabled: boolean;
};

type SystemSettings = {
  platformMode: string;
  environment: string;
  region: string;
  timezone: string;
  locale: string;
  logLevel: string;
  requestTimeout: number;
  workerConcurrency: number;
  cacheTtl: number;
  maxPayloadMb: number;
  healthChecks: boolean;
  telemetry: boolean;
  debugMode: boolean;
  readOnlyMode: boolean;
  maintenanceMode: boolean;
  automaticRestart: boolean;
  rateLimitProtection: boolean;
  strictValidation: boolean;
};

type ServiceRecord = {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  endpoint: string;
};

const DEFAULT_SETTINGS: SystemSettings = {
  platformMode: "Production",
  environment: "Production",
  region: "ap-south-1",
  timezone: "Asia/Kolkata",
  locale: "en-IN",
  logLevel: "Info",
  requestTimeout: 120,
  workerConcurrency: 8,
  cacheTtl: 300,
  maxPayloadMb: 25,
  healthChecks: true,
  telemetry: true,
  debugMode: false,
  readOnlyMode: false,
  maintenanceMode: false,
  automaticRestart: true,
  rateLimitProtection: true,
  strictValidation: true,
};

const DEFAULT_VARIABLES: EnvironmentVariable[] = [
  {
    id: "ENV-001",
    key: "NODE_ENV",
    value: "production",
    description: "Application runtime environment",
    secret: false,
    enabled: true,
  },
  {
    id: "ENV-002",
    key: "MODELNOW_LOG_LEVEL",
    value: "info",
    description: "Application logging verbosity",
    secret: false,
    enabled: true,
  },
  {
    id: "ENV-003",
    key: "AI_GATEWAY_ENABLED",
    value: "true",
    description: "AI gateway feature configuration",
    secret: false,
    enabled: true,
  },
  {
    id: "ENV-004",
    key: "DATABASE_URL",
    value: "demo-database-connection",
    description: "Database connection placeholder",
    secret: true,
    enabled: true,
  },
  {
    id: "ENV-005",
    key: "MODEL_PROVIDER_API_KEY",
    value: "demo-provider-key-not-a-real-secret",
    description: "Model provider credential placeholder",
    secret: true,
    enabled: false,
  },
];

const DEFAULT_SERVICES: ServiceRecord[] = [
  {
    id: "SVC-001",
    name: "AI Gateway",
    description: "Central model API gateway and request processing",
    category: "Core",
    enabled: true,
    endpoint: "/api/v1/gateway",
  },
  {
    id: "SVC-002",
    name: "Model Routing",
    description: "Model selection, routing policies, and fallback rules",
    category: "AI Infrastructure",
    enabled: true,
    endpoint: "/api/v1/routing",
  },
  {
    id: "SVC-003",
    name: "Agent Service",
    description: "Agent execution and workflow orchestration",
    category: "AI Services",
    enabled: true,
    endpoint: "/api/v1/agents",
  },
  {
    id: "SVC-004",
    name: "Knowledge Service",
    description: "Document ingestion, retrieval, and knowledge search",
    category: "AI Services",
    enabled: true,
    endpoint: "/api/v1/knowledge",
  },
  {
    id: "SVC-005",
    name: "Browser Automation",
    description: "Browser tasks and website automation workflows",
    category: "Automation",
    enabled: false,
    endpoint: "/api/v1/browser",
  },
  {
    id: "SVC-006",
    name: "Multimodal Service",
    description: "Image, audio, and multimodal processing",
    category: "AI Services",
    enabled: true,
    endpoint: "/api/v1/multimodal",
  },
  {
    id: "SVC-007",
    name: "Fine-tuning Service",
    description: "Dataset validation and model training workflows",
    category: "AI Infrastructure",
    enabled: false,
    endpoint: "/api/v1/fine-tuning",
  },
  {
    id: "SVC-008",
    name: "Billing Service",
    description: "Subscription, usage, and billing operations",
    category: "Platform",
    enabled: true,
    endpoint: "/api/v1/billing",
  },
];

function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`sc-toggle ${checked ? "active" : ""}`}
      onClick={onChange}
      aria-label={label}
      aria-pressed={checked}
    >
      <span />
    </button>
  );
}

function Status({ active }: { active: boolean }) {
  return (
    <span className={`sc-status ${active ? "online" : "offline"}`}>
      <span className="sc-status-dot" />
      {active ? "Enabled" : "Disabled"}
    </span>
  );
}

export default function SystemConfigurationPage() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [settings, setSettings] =
    useState<SystemSettings>(DEFAULT_SETTINGS);
  const [variables, setVariables] =
    useState<EnvironmentVariable[]>(DEFAULT_VARIABLES);
  const [services, setServices] =
    useState<ServiceRecord[]>(DEFAULT_SERVICES);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");
  const [saved, setSaved] = useState(false);
  const [showVariableModal, setShowVariableModal] = useState(false);
  const [showValue, setShowValue] = useState<Record<string, boolean>>({});
  const [variableKey, setVariableKey] = useState("");
  const [variableValue, setVariableValue] = useState("");
  const [variableDescription, setVariableDescription] = useState("");
  const [variableSecret, setVariableSecret] = useState(false);
  const [variableEnabled, setVariableEnabled] = useState(true);
  const [serviceFilter, setServiceFilter] = useState("All services");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("modelnow-system-configuration-v1");
      if (!raw) return;

      const parsed = JSON.parse(raw) as {
        settings?: Partial<SystemSettings>;
        variables?: EnvironmentVariable[];
        services?: ServiceRecord[];
      };

      if (parsed.settings) {
        setSettings((previous) => ({ ...previous, ...parsed.settings }));
      }
      if (Array.isArray(parsed.variables)) setVariables(parsed.variables);
      if (Array.isArray(parsed.services)) setServices(parsed.services);
    } catch {
      // Ignore invalid local demo data.
    }
  }, []);

  const enabledServices = services.filter((service) => service.enabled).length;
  const enabledVariables = variables.filter((item) => item.enabled).length;

  const filteredVariables = variables.filter((item) => {
    const query = search.trim().toLowerCase();
    return (
      !query ||
      item.key.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query)
    );
  });

  const filteredServices = services.filter((service) => {
    const query = search.trim().toLowerCase();
    const matchesSearch =
      !query ||
      service.name.toLowerCase().includes(query) ||
      service.description.toLowerCase().includes(query) ||
      service.endpoint.toLowerCase().includes(query);

    const matchesFilter =
      serviceFilter === "All services" ||
      (serviceFilter === "Enabled" && service.enabled) ||
      (serviceFilter === "Disabled" && !service.enabled) ||
      service.category === serviceFilter;

    return matchesSearch && matchesFilter;
  });

  function updateSetting<K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K],
  ) {
    setSettings((previous) => ({ ...previous, [key]: value }));
    setSaved(false);
  }

  function saveConfiguration() {
    try {
      localStorage.setItem(
        "modelnow-system-configuration-v1",
        JSON.stringify({ settings, variables, services }),
      );
      setSaved(true);
      setNotice("Configuration saved in this browser.");
    } catch {
      setNotice("Could not save configuration to browser storage.");
    }
  }

  function resetConfiguration() {
    setSettings(DEFAULT_SETTINGS);
    setVariables(DEFAULT_VARIABLES);
    setServices(DEFAULT_SERVICES);
    setShowValue({});
    try {
      localStorage.removeItem("modelnow-system-configuration-v1");
    } catch {
      // Ignore unavailable browser storage.
    }
    setSaved(false);
    setNotice("System configuration demo has been reset.");
  }

  function addVariable() {
    const key = variableKey.trim();

    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      setNotice("Use a valid variable name with letters, numbers, and underscores.");
      return;
    }

    if (variables.some((item) => item.key === key)) {
      setNotice("A variable with this name already exists.");
      return;
    }

    const item: EnvironmentVariable = {
      id: `ENV-${Date.now()}`,
      key,
      value: variableValue,
      description: variableDescription.trim() || "Custom environment variable",
      secret: variableSecret,
      enabled: variableEnabled,
    };

    setVariables((previous) => [item, ...previous]);
    setShowVariableModal(false);
    setVariableKey("");
    setVariableValue("");
    setVariableDescription("");
    setVariableSecret(false);
    setVariableEnabled(true);
    setSaved(false);
    setNotice("Environment variable added to the local demo.");
  }

  function deleteVariable(item: EnvironmentVariable) {
    setVariables((previous) => previous.filter((entry) => entry.id !== item.id));
    setSaved(false);
    setNotice(`${item.key} removed from the local demo.`);
  }

  function exportConfiguration() {
    const content = JSON.stringify(
      {
        exportedAt: new Date().toISOString(),
        settings,
        services,
        variables: variables.map((item) => ({
          ...item,
          value: item.secret ? "[REDACTED]" : item.value,
        })),
      },
      null,
      2,
    );

    const url = URL.createObjectURL(
      new Blob([content], { type: "application/json" }),
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-system-configuration.json";
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("Configuration exported. Secret values were redacted.");
  }

  async function copyValue(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setNotice("Value copied to clipboard.");
    } catch {
      setNotice("Clipboard access is unavailable in this browser.");
    }
  }

  const tabs: { label: Tab; icon: typeof Settings2 }[] = [
    { label: "Overview", icon: Activity },
    { label: "Runtime", icon: Cpu },
    { label: "Infrastructure", icon: Cloud },
    { label: "Environment Variables", icon: Terminal },
    { label: "Services", icon: Server },
    { label: "Maintenance", icon: SlidersHorizontal },
  ];

  return (
    <main className="system-config">
      <style>{`
        .system-config{--sc-blue:#315bea;--sc-text:#1b2639;--sc-muted:#7b879a;--sc-border:#e4e8f0;min-height:100vh;padding:30px;background:#f7f8fc;color:var(--sc-text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .system-config *{box-sizing:border-box}
        .sc-shell{max-width:1450px;margin:auto}
        .sc-breadcrumb{display:flex;align-items:center;gap:8px;margin-bottom:20px;color:var(--sc-muted);font-size:12px}
        .sc-breadcrumb strong{color:#39445a}
        .sc-header{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;flex-wrap:wrap;margin-bottom:24px}
        .sc-heading{display:flex;align-items:flex-start;gap:14px}
        .sc-heading-icon{display:grid;place-items:center;width:49px;height:49px;border-radius:14px;background:#eaf0ff;color:var(--sc-blue);flex-shrink:0}
        .sc-title{font-size:27px;font-weight:780;letter-spacing:-.8px;margin:0 0 7px}
        .sc-subtitle{font-size:13px;line-height:1.65;color:var(--sc-muted);max-width:760px;margin:0}
        .sc-actions{display:flex;gap:9px;flex-wrap:wrap}
        .sc-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:10px 13px;border:1px solid var(--sc-border);border-radius:9px;background:white;color:#3f4a60;font-size:12px;font-weight:680;cursor:pointer}
        .sc-btn:hover{background:#f7f9ff;border-color:#bdcafa}
        .sc-btn.primary{background:var(--sc-blue);border-color:var(--sc-blue);color:white}
        .sc-btn.primary:hover{background:#254bd1}
        .sc-btn.danger{color:#c13e3e}
        .sc-btn:disabled{opacity:.5;cursor:not-allowed}
        .sc-alert{display:flex;align-items:flex-start;gap:9px;padding:12px 14px;border:1px solid #cbd9ff;background:#eff4ff;color:#2947a2;border-radius:10px;font-size:12px;line-height:1.55;margin-bottom:18px}
        .sc-alert button{margin-left:auto;border:0;background:transparent;color:inherit;cursor:pointer}
        .sc-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:20px}
        .sc-stat{padding:17px 18px;background:white;border:1px solid var(--sc-border);border-radius:13px}
        .sc-stat-top{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:12px;color:var(--sc-muted)}
        .sc-stat-icon{width:35px;height:35px;display:grid;place-items:center;background:#f0f3f9;color:#5f6d83;border-radius:10px}
        .sc-stat-value{font-size:27px;font-weight:780;letter-spacing:-.7px;margin-top:13px}
        .sc-stat-note{font-size:11px;color:var(--sc-muted);margin-top:5px}
        .sc-tabs{display:flex;gap:5px;padding:6px;border:1px solid var(--sc-border);border-radius:11px;background:white;margin-bottom:18px;overflow-x:auto}
        .sc-tab{display:inline-flex;align-items:center;gap:8px;white-space:nowrap;border:0;background:transparent;border-radius:8px;padding:10px 13px;font-size:12px;font-weight:670;color:#69758a;cursor:pointer}
        .sc-tab.active{background:#edf2ff;color:var(--sc-blue)}
        .sc-card{background:white;border:1px solid var(--sc-border);border-radius:14px;overflow:hidden;margin-bottom:18px}
        .sc-card-head{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:17px 19px;border-bottom:1px solid var(--sc-border)}
        .sc-card-title{font-size:14px;font-weight:750;margin:0 0 5px}
        .sc-card-subtitle{font-size:11px;line-height:1.55;color:var(--sc-muted);margin:0}
        .sc-status{display:inline-flex;align-items:center;gap:6px;padding:5px 8px;border-radius:20px;font-size:10px;font-weight:720;white-space:nowrap}
        .sc-status.online{background:#e8f8ee;color:#17834b}
        .sc-status.offline{background:#f0f2f6;color:#6c778a}
        .sc-status-dot{width:6px;height:6px;border-radius:50%;background:currentColor}
        .sc-table-wrap{width:100%;overflow-x:auto}
        .sc-table{width:100%;border-collapse:collapse;text-align:left;min-width:850px}
        .sc-table th{font-size:10px;letter-spacing:.45px;text-transform:uppercase;color:#8590a2;font-weight:750;background:#fafbfe;padding:12px 15px;border-bottom:1px solid var(--sc-border);white-space:nowrap}
        .sc-table td{font-size:12px;padding:14px 15px;border-bottom:1px solid #eef0f5;color:#3e4960;vertical-align:middle}
        .sc-table tbody tr:hover{background:#fbfcff}
        .sc-table tr:last-child td{border-bottom:0}
        .sc-name{font-size:12px;font-weight:720;color:#263249;margin-bottom:4px}
        .sc-muted{font-size:11px;color:var(--sc-muted);line-height:1.55}
        .sc-mono{font-family:ui-monospace,SFMono-Regular,Menlo,monospace;font-size:11px;overflow-wrap:anywhere}
        .sc-search{display:flex;align-items:center;gap:8px;border:1px solid var(--sc-border);border-radius:8px;padding:0 10px;min-width:220px;max-width:380px;flex:1;background:white}
        .sc-search input{border:0;outline:none;padding:10px 0;width:100%;font-size:12px;color:var(--sc-text);background:transparent}
        .sc-filters{display:flex;align-items:center;gap:9px;flex-wrap:wrap;padding:14px 17px;border-bottom:1px solid var(--sc-border)}
        .sc-select{border:1px solid var(--sc-border);border-radius:8px;padding:10px 11px;font-size:12px;color:#465168;background:white;outline:none}
        .sc-layout{display:grid;grid-template-columns:minmax(0,1.2fr) minmax(280px,.8fr);gap:18px}
        .sc-config-row{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:16px 19px;border-bottom:1px solid #eef0f5}
        .sc-config-row:last-child{border-bottom:0}
        .sc-config-title{font-size:12px;font-weight:720;margin-bottom:5px}
        .sc-config-description{font-size:11px;line-height:1.55;color:var(--sc-muted);max-width:720px}
        .sc-toggle{width:39px;height:22px;border:0;border-radius:20px;background:#cbd1dd;padding:3px;cursor:pointer;flex-shrink:0;transition:.15s}
        .sc-toggle span{display:block;width:16px;height:16px;border-radius:50%;background:white;box-shadow:0 1px 3px #0002;transition:transform .15s}
        .sc-toggle.active{background:var(--sc-blue)}
        .sc-toggle.active span{transform:translateX(17px)}
        .sc-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px;padding:19px}
        .sc-field{display:flex;flex-direction:column;gap:7px;min-width:0}
        .sc-field label{font-size:11px;font-weight:720;color:#48536a}
        .sc-field input,.sc-field select{width:100%;border:1px solid #dfe4ed;border-radius:8px;padding:11px 12px;font-size:12px;outline:none;background:white;color:#273248}
        .sc-field input:focus,.sc-field select:focus{border-color:#8ea5fb;box-shadow:0 0 0 3px #315bea12}
        .sc-field.full{grid-column:1/-1}
        .sc-note{display:flex;align-items:flex-start;gap:9px;padding:12px 14px;border:1px solid #f0dfb9;background:#fff9eb;color:#875b13;border-radius:10px;font-size:11px;line-height:1.6;margin:17px 19px}
        .sc-banner{padding:22px;background:linear-gradient(125deg,#233d94,#315bea);border-radius:13px;color:white;margin-bottom:18px}
        .sc-banner-title{font-size:21px;font-weight:780;letter-spacing:-.5px;margin:11px 0}
        .sc-banner-copy{font-size:12px;line-height:1.7;color:#e0e8ff}
        .sc-mini-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:16px}
        .sc-mini{border:1px solid #edf0f5;border-radius:10px;padding:14px}
        .sc-mini-label{font-size:11px;color:var(--sc-muted)}
        .sc-mini-value{font-size:19px;font-weight:760;margin-top:8px}
        .sc-service-icon{display:grid;place-items:center;width:34px;height:34px;border-radius:10px;background:#eff3ff;color:var(--sc-blue)}
        .sc-value-box{display:flex;align-items:center;gap:7px;max-width:240px}
        .sc-value-text{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:165px}
        .sc-icon-btn{display:grid;place-items:center;width:29px;height:29px;border:1px solid var(--sc-border);background:white;border-radius:7px;color:#66738a;cursor:pointer;flex-shrink:0}
        .sc-icon-btn:hover{background:#f2f5ff;color:var(--sc-blue)}
        .sc-empty{text-align:center;padding:38px 15px;color:var(--sc-muted);font-size:12px}
        .sc-modal-backdrop{position:fixed;inset:0;background:#10182870;z-index:50;display:flex;align-items:center;justify-content:center;padding:18px}
        .sc-modal{width:100%;max-width:540px;max-height:90vh;overflow-y:auto;background:white;border-radius:16px;box-shadow:0 24px 80px #10182830}
        .sc-modal-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;padding:20px;border-bottom:1px solid var(--sc-border)}
        .sc-modal-title{font-size:17px;font-weight:760;margin:0 0 6px}
        .sc-modal-subtitle{font-size:11px;color:var(--sc-muted);line-height:1.5;margin:0}
        .sc-modal-body{padding:20px}
        .sc-modal-footer{display:flex;justify-content:flex-end;gap:9px;padding:15px 20px;border-top:1px solid var(--sc-border)}
        .sc-close{width:30px;height:30px;border:0;border-radius:8px;background:#f3f5f9;display:grid;place-items:center;cursor:pointer;color:#657087}
        .sc-footer{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:5px 2px;color:#8993a5;font-size:11px}
        @media(max-width:1000px){.sc-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.sc-layout{grid-template-columns:1fr}}
        @media(max-width:650px){.system-config{padding:16px}.sc-title{font-size:23px}.sc-stats{gap:9px}.sc-stat{padding:13px}.sc-stat-value{font-size:23px}.sc-form-grid{grid-template-columns:1fr}.sc-field.full{grid-column:auto}.sc-search{min-width:100%;max-width:none}.sc-filters .sc-select{flex:1}.sc-actions{width:100%}.sc-actions .sc-btn{flex:1}.sc-tab{padding:10px}.sc-mini-grid{grid-template-columns:1fr 1fr}}
      `}</style>

      <div className="sc-shell">
        <div className="sc-breadcrumb">
          <span>Admin</span>
          <ChevronRight size={13} />
          <span>Settings</span>
          <ChevronRight size={13} />
          <strong>System Configuration</strong>
        </div>

        <header className="sc-header">
          <div className="sc-heading">
            <div className="sc-heading-icon">
              <Settings2 size={24} />
            </div>
            <div>
              <h1 className="sc-title">System Configuration</h1>
              <p className="sc-subtitle">
                Manage ModelNow platform runtime preferences, infrastructure
                defaults, environment variable records, service availability,
                and maintenance controls.
              </p>
            </div>
          </div>
          <div className="sc-actions">
            <button className="sc-btn" onClick={resetConfiguration}>
              <RefreshCw size={14} /> Reset demo
            </button>
            <button className="sc-btn" onClick={exportConfiguration}>
              <Download size={14} /> Export JSON
            </button>
            <button className="sc-btn primary" onClick={saveConfiguration}>
              <Save size={14} /> {saved ? "Saved" : "Save configuration"}
            </button>
          </div>
        </header>

        {notice && (
          <div className="sc-alert">
            <Info size={16} />
            <span>{notice}</span>
            <button
              onClick={() => setNotice("")}
              aria-label="Dismiss notification"
            >
              <X size={15} />
            </button>
          </div>
        )}

        <section className="sc-stats">
          <div className="sc-stat">
            <div className="sc-stat-top">
              Platform environment
              <span className="sc-stat-icon"><Globe size={17} /></span>
            </div>
            <div className="sc-stat-value">{settings.environment}</div>
            <div className="sc-stat-note">Selected configuration profile</div>
          </div>
          <div className="sc-stat">
            <div className="sc-stat-top">
              Enabled services
              <span className="sc-stat-icon"><Server size={17} /></span>
            </div>
            <div className="sc-stat-value">{enabledServices}/{services.length}</div>
            <div className="sc-stat-note">Service configuration records</div>
          </div>
          <div className="sc-stat">
            <div className="sc-stat-top">
              Enabled variables
              <span className="sc-stat-icon"><Terminal size={17} /></span>
            </div>
            <div className="sc-stat-value">{enabledVariables}</div>
            <div className="sc-stat-note">Local demo variable records</div>
          </div>
          <div className="sc-stat">
            <div className="sc-stat-top">
              Runtime protection
              <span className="sc-stat-icon"><ShieldCheck size={17} /></span>
            </div>
            <div className="sc-stat-value">
              {settings.rateLimitProtection && settings.strictValidation
                ? "Active"
                : "Review"}
            </div>
            <div className="sc-stat-note">Based on selected demo controls</div>
          </div>
        </section>

        <nav className="sc-tabs" aria-label="System configuration sections">
          {tabs.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.label}
                className={`sc-tab ${tab === item.label ? "active" : ""}`}
                onClick={() => {
                  setTab(item.label);
                  setSearch("");
                }}
              >
                <Icon size={15} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {tab === "Overview" && (
          <div className="sc-layout">
            <div>
              <section className="sc-banner">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                  <span style={{ fontSize: 11, fontWeight: 750, color: "#dce5ff" }}>
                    PLATFORM CONFIGURATION
                  </span>
                  <Zap size={22} />
                </div>
                <div className="sc-banner-title">One place for system-wide defaults</div>
                <div className="sc-banner-copy">
                  Review runtime behavior, platform services, logging,
                  infrastructure preferences, and maintenance safeguards.
                  These settings currently operate as a frontend demonstration.
                </div>
                <button
                  className="sc-btn"
                  style={{ marginTop: 17 }}
                  onClick={() => setTab("Runtime")}
                >
                  <Cpu size={14} /> Configure runtime
                </button>
              </section>

              <section className="sc-card">
                <div className="sc-card-head">
                  <div>
                    <h2 className="sc-card-title">Configuration summary</h2>
                    <p className="sc-card-subtitle">
                      Current values selected for the local demo.
                    </p>
                  </div>
                  <Settings2 size={18} color="#778195" />
                </div>
                <div className="sc-table-wrap">
                  <table className="sc-table">
                    <thead>
                      <tr><th>Setting</th><th>Current value</th><th>Category</th></tr>
                    </thead>
                    <tbody>
                      <tr><td>Platform mode</td><td>{settings.platformMode}</td><td>General</td></tr>
                      <tr><td>Environment</td><td>{settings.environment}</td><td>Runtime</td></tr>
                      <tr><td>Region</td><td>{settings.region}</td><td>Infrastructure</td></tr>
                      <tr><td>Log level</td><td>{settings.logLevel}</td><td>Observability</td></tr>
                      <tr><td>Request timeout</td><td>{settings.requestTimeout} seconds</td><td>Runtime</td></tr>
                      <tr><td>Worker concurrency</td><td>{settings.workerConcurrency}</td><td>Infrastructure</td></tr>
                      <tr><td>Cache TTL</td><td>{settings.cacheTtl} seconds</td><td>Performance</td></tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <div>
              <section className="sc-card">
                <div className="sc-card-head">
                  <div>
                    <h2 className="sc-card-title">Platform safeguards</h2>
                    <p className="sc-card-subtitle">Review important control preferences.</p>
                  </div>
                  <ShieldCheck size={18} color="#778195" />
                </div>
                {[
                  {
                    key: "healthChecks" as const,
                    title: "Health checks",
                    description: "Enable the intended health-check policy.",
                  },
                  {
                    key: "rateLimitProtection" as const,
                    title: "Rate-limit protection",
                    description: "Keep request protection enabled.",
                  },
                  {
                    key: "strictValidation" as const,
                    title: "Strict validation",
                    description: "Prefer strict input validation.",
                  },
                  {
                    key: "automaticRestart" as const,
                    title: "Automatic restart",
                    description: "Allow configured services to restart automatically.",
                  },
                ].map((item) => (
                  <div className="sc-config-row" key={item.key}>
                    <div>
                      <div className="sc-config-title">{item.title}</div>
                      <div className="sc-config-description">{item.description}</div>
                    </div>
                    <Toggle
                      checked={settings[item.key]}
                      onChange={() => updateSetting(item.key, !settings[item.key])}
                      label={item.title}
                    />
                  </div>
                ))}
                <div style={{ padding: 16 }}>
                  <button className="sc-btn primary" style={{ width: "100%" }} onClick={saveConfiguration}>
                    <Save size={14} /> Save safeguards
                  </button>
                </div>
              </section>

              <section className="sc-card">
                <div className="sc-card-head">
                  <div>
                    <h2 className="sc-card-title">Service summary</h2>
                    <p className="sc-card-subtitle">Configured platform components.</p>
                  </div>
                  <Activity size={18} color="#778195" />
                </div>
                <div className="sc-mini-grid">
                  <div className="sc-mini">
                    <div className="sc-mini-label">Enabled services</div>
                    <div className="sc-mini-value">{enabledServices}</div>
                  </div>
                  <div className="sc-mini">
                    <div className="sc-mini-label">Disabled services</div>
                    <div className="sc-mini-value">{services.length - enabledServices}</div>
                  </div>
                </div>
                <div style={{ padding: "0 16px 16px" }}>
                  <button className="sc-btn" style={{ width: "100%" }} onClick={() => setTab("Services")}>
                    Manage services <ChevronRight size={14} />
                  </button>
                </div>
              </section>
            </div>
          </div>
        )}

        {tab === "Runtime" && (
          <>
            <section className="sc-card">
              <div className="sc-card-head">
                <div>
                  <h2 className="sc-card-title">Runtime configuration</h2>
                  <p className="sc-card-subtitle">
                    Configure platform mode, environment, logging, and request limits.
                  </p>
                </div>
                <Cpu size={19} color="#778195" />
              </div>
              <div className="sc-form-grid">
                <div className="sc-field">
                  <label htmlFor="sc-platform-mode">Platform mode</label>
                  <select id="sc-platform-mode" value={settings.platformMode} onChange={(e) => updateSetting("platformMode", e.target.value)}>
                    <option>Production</option>
                    <option>Development</option>
                    <option>Testing</option>
                    <option>Demo</option>
                  </select>
                </div>
                <div className="sc-field">
                  <label htmlFor="sc-environment">Environment profile</label>
                  <select id="sc-environment" value={settings.environment} onChange={(e) => updateSetting("environment", e.target.value)}>
                    <option>Production</option>
                    <option>Staging</option>
                    <option>Development</option>
                    <option>Local</option>
                  </select>
                </div>
                <div className="sc-field">
                  <label htmlFor="sc-log-level">Log level</label>
                  <select id="sc-log-level" value={settings.logLevel} onChange={(e) => updateSetting("logLevel", e.target.value)}>
                    <option>Error</option>
                    <option>Warn</option>
                    <option>Info</option>
                    <option>Debug</option>
                    <option>Trace</option>
                  </select>
                </div>
                <div className="sc-field">
                  <label htmlFor="sc-timeout">Request timeout (seconds)</label>
                  <input id="sc-timeout" type="number" min={5} max={900} value={settings.requestTimeout} onChange={(e) => updateSetting("requestTimeout", Math.min(900, Math.max(5, Number(e.target.value) || 5)))} />
                </div>
                <div className="sc-field">
                  <label htmlFor="sc-workers">Worker concurrency</label>
                  <input id="sc-workers" type="number" min={1} max={256} value={settings.workerConcurrency} onChange={(e) => updateSetting("workerConcurrency", Math.min(256, Math.max(1, Number(e.target.value) || 1)))} />
                </div>
                <div className="sc-field">
                  <label htmlFor="sc-payload">Maximum payload (MB)</label>
                  <input id="sc-payload" type="number" min={1} max={500} value={settings.maxPayloadMb} onChange={(e) => updateSetting("maxPayloadMb", Math.min(500, Math.max(1, Number(e.target.value) || 1)))} />
                </div>
              </div>
            </section>

            <section className="sc-card">
              <div className="sc-card-head">
                <div>
                  <h2 className="sc-card-title">Runtime feature controls</h2>
                  <p className="sc-card-subtitle">Select which runtime behaviors the platform should use.</p>
                </div>
                <ToggleRight size={19} color="#778195" />
              </div>
              {[
                { key: "healthChecks" as const, title: "Health checks", description: "Enable health-check configuration." },
                { key: "telemetry" as const, title: "Telemetry", description: "Allow configured telemetry collection." },
                { key: "debugMode" as const, title: "Debug mode", description: "Enable verbose diagnostics in the intended runtime." },
                { key: "rateLimitProtection" as const, title: "Rate-limit protection", description: "Apply the intended request protection policy." },
                { key: "strictValidation" as const, title: "Strict validation", description: "Enable stricter input validation preferences." },
              ].map((item) => (
                <div className="sc-config-row" key={item.key}>
                  <div>
                    <div className="sc-config-title">{item.title}</div>
                    <div className="sc-config-description">{item.description}</div>
                  </div>
                  <Toggle checked={settings[item.key]} onChange={() => updateSetting(item.key, !settings[item.key])} label={item.title} />
                </div>
              ))}
              <div className="sc-note">
                <AlertTriangle size={15} />
                Debug logging may expose sensitive diagnostic data. Do not enable it in production without appropriate access controls and log redaction.
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 19px 19px" }}>
                <button className="sc-btn primary" onClick={saveConfiguration}><Save size={14} /> Save runtime settings</button>
              </div>
            </section>
          </>
        )}

        {tab === "Infrastructure" && (
          <>
            <section className="sc-card">
              <div className="sc-card-head">
                <div>
                  <h2 className="sc-card-title">Infrastructure defaults</h2>
                  <p className="sc-card-subtitle">Configure region, locale, timezone, and caching preferences.</p>
                </div>
                <Cloud size={19} color="#778195" />
              </div>
              <div className="sc-form-grid">
                <div className="sc-field">
                  <label htmlFor="sc-region">Deployment region</label>
                  <select id="sc-region" value={settings.region} onChange={(e) => updateSetting("region", e.target.value)}>
                    <option value="ap-south-1">Asia Pacific — Mumbai</option>
                    <option value="ap-southeast-1">Asia Pacific — Singapore</option>
                    <option value="us-east-1">US East — N. Virginia</option>
                    <option value="us-west-2">US West — Oregon</option>
                    <option value="eu-west-1">Europe — Ireland</option>
                  </select>
                </div>
                <div className="sc-field">
                  <label htmlFor="sc-timezone">Default timezone</label>
                  <select id="sc-timezone" value={settings.timezone} onChange={(e) => updateSetting("timezone", e.target.value)}>
                    <option value="Asia/Kolkata">Asia/Kolkata</option>
                    <option value="UTC">UTC</option>
                    <option value="Asia/Singapore">Asia/Singapore</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="America/New_York">America/New_York</option>
                  </select>
                </div>
                <div className="sc-field">
                  <label htmlFor="sc-locale">Default locale</label>
                  <select id="sc-locale" value={settings.locale} onChange={(e) => updateSetting("locale", e.target.value)}>
                    <option value="en-IN">English (India)</option>
                    <option value="en-US">English (United States)</option>
                    <option value="en-GB">English (United Kingdom)</option>
                    <option value="te-IN">Telugu (India)</option>
                    <option value="hi-IN">Hindi (India)</option>
                  </select>
                </div>
                <div className="sc-field">
                  <label htmlFor="sc-cache-ttl">Cache TTL (seconds)</label>
                  <input id="sc-cache-ttl" type="number" min={0} max={86400} value={settings.cacheTtl} onChange={(e) => updateSetting("cacheTtl", Math.min(86400, Math.max(0, Number(e.target.value) || 0)))} />
                </div>
              </div>
            </section>

            <section className="sc-card">
              <div className="sc-card-head">
                <div>
                  <h2 className="sc-card-title">Infrastructure controls</h2>
                  <p className="sc-card-subtitle">Review intended health and service recovery policies.</p>
                </div>
                <HardDrive size={19} color="#778195" />
              </div>
              {[
                { key: "healthChecks" as const, title: "Health-check monitoring", description: "Configure periodic health-check behavior." },
                { key: "automaticRestart" as const, title: "Automatic service restart", description: "Allow service supervisors to restart eligible processes." },
                { key: "telemetry" as const, title: "Infrastructure telemetry", description: "Enable configured infrastructure metrics collection." },
              ].map((item) => (
                <div className="sc-config-row" key={item.key}>
                  <div>
                    <div className="sc-config-title">{item.title}</div>
                    <div className="sc-config-description">{item.description}</div>
                  </div>
                  <Toggle checked={settings[item.key]} onChange={() => updateSetting(item.key, !settings[item.key])} label={item.title} />
                </div>
              ))}
              <div className="sc-note">
                <Info size={15} />
                Region and infrastructure selections are local configuration values. They do not move deployments or change your cloud provider.
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 19px 19px" }}>
                <button className="sc-btn primary" onClick={saveConfiguration}><Save size={14} /> Save infrastructure settings</button>
              </div>
            </section>
          </>
        )}

        {tab === "Environment Variables" && (
          <section className="sc-card">
            <div className="sc-card-head">
              <div>
                <h2 className="sc-card-title">Environment variable registry</h2>
                <p className="sc-card-subtitle">
                  Manage demo variable records. Secret values are redacted in exports.
                </p>
              </div>
              <button className="sc-btn primary" onClick={() => setShowVariableModal(true)}>
                <Terminal size={14} /> Add variable
              </button>
            </div>
            <div className="sc-note">
              <LockKeyhole size={15} />
              Never store production credentials in browser storage. Use server-side environment variables or a managed secrets vault in the real deployment.
            </div>
            <div className="sc-filters">
              <div className="sc-search">
                <Search size={15} color="#8a94a6" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search variable name or description..." />
              </div>
              <button className="sc-btn" onClick={() => setSearch("")}>Clear search</button>
            </div>
            <div className="sc-table-wrap">
              <table className="sc-table">
                <thead>
                  <tr><th>Variable</th><th>Value</th><th>Type</th><th>Status</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filteredVariables.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="sc-name">{item.key}</div>
                        <div className="sc-muted">{item.description}</div>
                      </td>
                      <td>
                        <div className="sc-value-box">
                          <span className="sc-value-text sc-mono">
                            {item.secret && !showValue[item.id] ? "••••••••••••" : item.value || "(empty)"}
                          </span>
                          {item.secret && (
                            <button className="sc-icon-btn" title={showValue[item.id] ? "Hide value" : "Reveal demo value"} onClick={() => setShowValue((previous) => ({ ...previous, [item.id]: !previous[item.id] }))}>
                              {showValue[item.id] ? <LockKeyhole size={13} /> : <Info size={13} />}
                            </button>
                          )}
                          {!item.secret && (
                            <button className="sc-icon-btn" title="Copy value" onClick={() => copyValue(item.value)}>
                              <Download size={13} />
                            </button>
                          )}
                        </div>
                      </td>
                      <td>{item.secret ? "Secret placeholder" : "Plain text"}</td>
                      <td><Status active={item.enabled} /></td>
                      <td>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                          <Toggle checked={item.enabled} onChange={() => { setVariables((previous) => previous.map((entry) => entry.id === item.id ? { ...entry, enabled: !entry.enabled } : entry)); setSaved(false); }} label={`Toggle ${item.key}`} />
                          <button className="sc-btn danger" onClick={() => deleteVariable(item)}>Remove</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredVariables.length === 0 && <div className="sc-empty">No environment variables match your search.</div>}
            </div>
          </section>
        )}

        {tab === "Services" && (
          <section className="sc-card">
            <div className="sc-card-head">
              <div>
                <h2 className="sc-card-title">Platform services</h2>
                <p className="sc-card-subtitle">
                  Review service configuration records and their intended API paths.
                </p>
              </div>
              <span className="sc-status online">{enabledServices} enabled</span>
            </div>
            <div className="sc-filters">
              <div className="sc-search">
                <Search size={15} color="#8a94a6" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search services or endpoints..." />
              </div>
              <select className="sc-select" value={serviceFilter} onChange={(e) => setServiceFilter(e.target.value)}>
                <option>All services</option>
                <option>Enabled</option>
                <option>Disabled</option>
                <option>Core</option>
                <option>AI Infrastructure</option>
                <option>AI Services</option>
                <option>Automation</option>
                <option>Platform</option>
              </select>
            </div>
            <div className="sc-table-wrap">
              <table className="sc-table">
                <thead>
                  <tr><th>Service</th><th>Category</th><th>Endpoint path</th><th>Status</th><th>Control</th></tr>
                </thead>
                <tbody>
                  {filteredServices.map((service) => (
                    <tr key={service.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span className="sc-service-icon"><Server size={16} /></span>
                          <div>
                            <div className="sc-name">{service.name}</div>
                            <div className="sc-muted">{service.description}</div>
                          </div>
                        </div>
                      </td>
                      <td>{service.category}</td>
                      <td><span className="sc-mono">{service.endpoint}</span></td>
                      <td><Status active={service.enabled} /></td>
                      <td>
                        <Toggle
                          checked={service.enabled}
                          onChange={() => {
                            setServices((previous) => previous.map((entry) => entry.id === service.id ? { ...entry, enabled: !entry.enabled } : entry));
                            setSaved(false);
                          }}
                          label={`Toggle ${service.name}`}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredServices.length === 0 && <div className="sc-empty">No services match the selected filters.</div>}
            </div>
            <div className="sc-note">
              <AlertTriangle size={15} />
              Toggling a service here changes only its demo status. Real service enablement requires backend service discovery and authorization checks.
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 19px 19px" }}>
              <button className="sc-btn primary" onClick={saveConfiguration}><Save size={14} /> Save service settings</button>
            </div>
          </section>
        )}

        {tab === "Maintenance" && (
          <>
            <section className="sc-card">
              <div className="sc-card-head">
                <div>
                  <h2 className="sc-card-title">Maintenance controls</h2>
                  <p className="sc-card-subtitle">
                    Configure platform maintenance, read-only access, and operational safeguards.
                  </p>
                </div>
                <Settings2 size={19} color="#778195" />
              </div>
              {[
                {
                  key: "maintenanceMode" as const,
                  title: "Maintenance mode",
                  description: "Mark the platform as undergoing planned maintenance in this configuration.",
                },
                {
                  key: "readOnlyMode" as const,
                  title: "Read-only mode",
                  description: "Indicate that write operations should be restricted by the backend.",
                },
                {
                  key: "automaticRestart" as const,
                  title: "Automatic service restart",
                  description: "Use the configured restart preference for supervised services.",
                },
                {
                  key: "healthChecks" as const,
                  title: "Health checks",
                  description: "Keep health-check monitoring enabled during maintenance.",
                },
                {
                  key: "telemetry" as const,
                  title: "Telemetry collection",
                  description: "Continue configured operational metrics collection.",
                },
              ].map((item) => (
                <div className="sc-config-row" key={item.key}>
                  <div>
                    <div className="sc-config-title">{item.title}</div>
                    <div className="sc-config-description">{item.description}</div>
                  </div>
                  <Toggle checked={settings[item.key]} onChange={() => updateSetting(item.key, !settings[item.key])} label={item.title} />
                </div>
              ))}
              {(settings.maintenanceMode || settings.readOnlyMode) && (
                <div className="sc-note">
                  <AlertTriangle size={15} />
                  Maintenance or read-only mode is selected in the demo. The live platform is not affected until the backend enforces these controls.
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "flex-end", padding: "0 19px 19px" }}>
                <button className="sc-btn primary" onClick={saveConfiguration}><Save size={14} /> Save maintenance settings</button>
              </div>
            </section>

            <section className="sc-card">
              <div className="sc-card-head">
                <div>
                  <h2 className="sc-card-title">Configuration actions</h2>
                  <p className="sc-card-subtitle">Export the current configuration or restore demo defaults.</p>
                </div>
                <RefreshCw size={18} color="#778195" />
              </div>
              <div className="sc-config-row">
                <div>
                  <div className="sc-config-title">Export configuration</div>
                  <div className="sc-config-description">Download settings and service records as JSON, with secret values redacted.</div>
                </div>
                <button className="sc-btn" onClick={exportConfiguration}><Download size={14} /> Export JSON</button>
              </div>
              <div className="sc-config-row">
                <div>
                  <div className="sc-config-title">Reset demo settings</div>
                  <div className="sc-config-description">Restore the initial example settings, variables, and service records.</div>
                </div>
                <button className="sc-btn" onClick={resetConfiguration}><RefreshCw size={14} /> Reset demo</button>
              </div>
            </section>
          </>
        )}

        <footer className="sc-footer">
          <span>ModelNow Admin · System Configuration</span>
          <span>{saved ? "Saved in this browser" : "Local demo"} · Backend enforcement required</span>
        </footer>
      </div>

      {showVariableModal && (
        <div
          className="sc-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowVariableModal(false);
          }}
        >
          <section className="sc-modal" role="dialog" aria-modal="true" aria-labelledby="sc-variable-title">
            <div className="sc-modal-head">
              <div>
                <h2 id="sc-variable-title" className="sc-modal-title">Add environment variable</h2>
                <p className="sc-modal-subtitle">Create a local demo record. This does not change the server environment.</p>
              </div>
              <button className="sc-close" onClick={() => setShowVariableModal(false)} aria-label="Close dialog">
                <X size={16} />
              </button>
            </div>
            <div className="sc-modal-body">
              <div className="sc-form-grid" style={{ padding: 0 }}>
                <div className="sc-field full">
                  <label htmlFor="sc-variable-key">Variable name</label>
                  <input id="sc-variable-key" value={variableKey} onChange={(e) => setVariableKey(e.target.value)} placeholder="e.g. MODELNOW_FEATURE_ENABLED" />
                </div>
                <div className="sc-field full">
                  <label htmlFor="sc-variable-value">Demo value</label>
                  <input id="sc-variable-value" value={variableValue} onChange={(e) => setVariableValue(e.target.value)} placeholder="Enter a placeholder value" />
                </div>
                <div className="sc-field full">
                  <label htmlFor="sc-variable-description">Description</label>
                  <input id="sc-variable-description" value={variableDescription} onChange={(e) => setVariableDescription(e.target.value)} placeholder="What is this variable used for?" />
                </div>
              </div>
              <div className="sc-config-row" style={{ padding: "14px 0" }}>
                <div>
                  <div className="sc-config-title">Treat as secret</div>
                  <div className="sc-config-description">Mask the value and redact it from exported JSON.</div>
                </div>
                <Toggle checked={variableSecret} onChange={() => setVariableSecret((value) => !value)} label="Treat variable as secret" />
              </div>
              <div className="sc-config-row" style={{ padding: "14px 0" }}>
                <div>
                  <div className="sc-config-title">Enabled</div>
                  <div className="sc-config-description">Mark this variable as enabled in the demo registry.</div>
                </div>
                <Toggle checked={variableEnabled} onChange={() => setVariableEnabled((value) => !value)} label="Enable variable" />
              </div>
              <div className="sc-note">
                <LockKeyhole size={15} />
                Do not enter real API keys, passwords, database URLs, or production credentials.
              </div>
            </div>
            <div className="sc-modal-footer">
              <button className="sc-btn" onClick={() => setShowVariableModal(false)}>Cancel</button>
              <button className="sc-btn primary" onClick={addVariable}>Add variable</button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}