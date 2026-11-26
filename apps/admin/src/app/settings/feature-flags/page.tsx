"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Code2,
  Download,
  Flag,
  Layers3,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  Shield,
  SlidersHorizontal,
  ToggleLeft,
  X,
  Zap,
} from "lucide-react";

type FeatureFlag = {
  id: string;
  key: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  environment: "All environments" | "Production" | "Staging" | "Development";
  rollout: number;
  owner: string;
  updatedAt: string;
  protected: boolean;
};

const INITIAL_FLAGS: FeatureFlag[] = [
  {
    id: "FF-001",
    key: "ai.streaming_responses",
    name: "Streaming responses",
    description: "Deliver AI responses progressively as tokens are generated.",
    category: "AI Experience",
    enabled: true,
    environment: "All environments",
    rollout: 100,
    owner: "AI Platform",
    updatedAt: "2026-11-03",
    protected: true,
  },
  {
    id: "FF-002",
    key: "ai.model_routing",
    name: "Intelligent model routing",
    description: "Route requests based on cost, latency, model quality, and policy.",
    category: "AI Infrastructure",
    enabled: true,
    environment: "Production",
    rollout: 100,
    owner: "Infrastructure",
    updatedAt: "2026-11-02",
    protected: true,
  },
  {
    id: "FF-003",
    key: "ai.file_uploads",
    name: "File uploads",
    description: "Allow users to attach supported files to AI conversations.",
    category: "AI Experience",
    enabled: true,
    environment: "All environments",
    rollout: 100,
    owner: "Product",
    updatedAt: "2026-10-29",
    protected: false,
  },
  {
    id: "FF-004",
    key: "agents.workflow_builder",
    name: "Agent workflow builder",
    description: "Enable visual creation and configuration of agent workflows.",
    category: "Agents",
    enabled: true,
    environment: "Staging",
    rollout: 50,
    owner: "Agent Platform",
    updatedAt: "2026-10-28",
    protected: false,
  },
  {
    id: "FF-005",
    key: "browser.computer_use",
    name: "Computer use",
    description: "Enable approved browser and desktop interaction workflows.",
    category: "Automation",
    enabled: false,
    environment: "Development",
    rollout: 10,
    owner: "Automation",
    updatedAt: "2026-10-26",
    protected: true,
  },
  {
    id: "FF-006",
    key: "knowledge.semantic_search",
    name: "Semantic knowledge search",
    description: "Retrieve relevant context from connected knowledge sources.",
    category: "Knowledge",
    enabled: true,
    environment: "All environments",
    rollout: 100,
    owner: "Knowledge Platform",
    updatedAt: "2026-10-25",
    protected: false,
  },
  {
    id: "FF-007",
    key: "billing.usage_dashboard",
    name: "Usage dashboard",
    description: "Display token usage, spending, and plan consumption metrics.",
    category: "Billing",
    enabled: true,
    environment: "Production",
    rollout: 100,
    owner: "Billing",
    updatedAt: "2026-10-24",
    protected: false,
  },
  {
    id: "FF-008",
    key: "models.fine_tuning",
    name: "Model fine-tuning",
    description: "Allow eligible organizations to configure fine-tuning jobs.",
    category: "AI Infrastructure",
    enabled: false,
    environment: "Staging",
    rollout: 25,
    owner: "AI Platform",
    updatedAt: "2026-10-22",
    protected: false,
  },
  {
    id: "FF-009",
    key: "ui.new_navigation",
    name: "Updated navigation",
    description: "Test the refreshed application navigation experience.",
    category: "Experiments",
    enabled: true,
    environment: "Development",
    rollout: 50,
    owner: "Product",
    updatedAt: "2026-10-20",
    protected: false,
  },
  {
    id: "FF-010",
    key: "security.strict_api_validation",
    name: "Strict API validation",
    description: "Apply additional validation rules to incoming API requests.",
    category: "Security",
    enabled: true,
    environment: "All environments",
    rollout: 100,
    owner: "Security",
    updatedAt: "2026-10-19",
    protected: true,
  },
];

const CATEGORIES = [
  "All categories",
  "AI Experience",
  "AI Infrastructure",
  "Agents",
  "Automation",
  "Knowledge",
  "Billing",
  "Experiments",
  "Security",
  "Other",
];

const ENVIRONMENTS = [
  "All environments",
  "Production",
  "Staging",
  "Development",
] as const;

type Tab = "Overview" | "All flags" | "Experiments" | "Configuration";

const EMPTY_FLAG: Omit<FeatureFlag, "id" | "updatedAt"> = {
  key: "",
  name: "",
  description: "",
  category: "AI Experience",
  enabled: false,
  environment: "Development",
  rollout: 100,
  owner: "Product",
  protected: false,
};

function StatusPill({ enabled }: { enabled: boolean }) {
  return (
    <span className={`ff-pill ${enabled ? "success" : "neutral"}`}>
      <span className="ff-status-dot" />
      {enabled ? "Enabled" : "Disabled"}
    </span>
  );
}

function Switch({
  checked,
  onChange,
  label,
  disabled = false,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={`ff-switch ${checked ? "active" : ""}`}
      onClick={onChange}
      aria-label={label}
      aria-pressed={checked}
      disabled={disabled}
    >
      <span />
    </button>
  );
}

export default function FeatureFlagsPage() {
  const [flags, setFlags] = useState<FeatureFlag[]>(INITIAL_FLAGS);
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [environment, setEnvironment] = useState("All environments");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [notice, setNotice] = useState("");
  const [saved, setSaved] = useState(false);
  const [draft, setDraft] = useState(EMPTY_FLAG);
  const [configuration, setConfiguration] = useState({
    requireConfirmation: true,
    allowProductionChanges: true,
    auditChanges: true,
    protectCriticalFlags: true,
    defaultRollout: 100,
    emergencyDisable: false,
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("modelnow-admin-feature-flags-v1");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.flags)) setFlags(parsed.flags);
        if (parsed.configuration) {
          setConfiguration((previous) => ({
            ...previous,
            ...parsed.configuration,
          }));
        }
      }
    } catch {
      // Ignore malformed demo data.
    }
  }, []);

  const filteredFlags = useMemo(() => {
    const query = search.trim().toLowerCase();

    return flags.filter((flag) => {
      const matchesSearch =
        !query ||
        flag.name.toLowerCase().includes(query) ||
        flag.key.toLowerCase().includes(query) ||
        flag.description.toLowerCase().includes(query) ||
        flag.owner.toLowerCase().includes(query);

      const matchesCategory =
        category === "All categories" ||
        flag.category === category ||
        (category === "Other" && !CATEGORIES.includes(flag.category));

      const matchesEnvironment =
        environment === "All environments" ||
        flag.environment === "All environments" ||
        flag.environment === environment;

      const matchesStatus =
        statusFilter === "All statuses" ||
        (statusFilter === "Enabled" && flag.enabled) ||
        (statusFilter === "Disabled" && !flag.enabled);

      const matchesTab =
        activeTab !== "Experiments" || flag.category === "Experiments";

      return (
        matchesSearch &&
        matchesCategory &&
        matchesEnvironment &&
        matchesStatus &&
        matchesTab
      );
    });
  }, [flags, search, category, environment, statusFilter, activeTab]);

  const enabledCount = flags.filter((flag) => flag.enabled).length;
  const disabledCount = flags.length - enabledCount;
  const protectedCount = flags.filter((flag) => flag.protected).length;
  const experimentCount = flags.filter(
    (flag) => flag.category === "Experiments",
  ).length;

  function toggleFlag(id: string) {
    const target = flags.find((flag) => flag.id === id);
    if (!target) return;

    if (configuration.protectCriticalFlags && target.protected && target.enabled) {
      setNotice(
        `The critical flag "${target.name}" is protected. Disable critical-flag protection in Configuration before changing it.`,
      );
      return;
    }

    if (
      target.environment === "Production" &&
      !configuration.allowProductionChanges
    ) {
      setNotice("Production changes are disabled in Configuration.");
      return;
    }

    if (configuration.requireConfirmation) {
      setSelectedFlag(target);
      return;
    }

    setFlags((previous) =>
      previous.map((flag) =>
        flag.id === id
          ? {
              ...flag,
              enabled: !flag.enabled,
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : flag,
      ),
    );
    setSaved(false);
    setNotice(`Feature flag "${target.name}" updated in the local demo.`);
  }

  function confirmToggle() {
    if (!selectedFlag) return;

    setFlags((previous) =>
      previous.map((flag) =>
        flag.id === selectedFlag.id
          ? {
              ...flag,
              enabled: !flag.enabled,
              updatedAt: new Date().toISOString().slice(0, 10),
            }
          : flag,
      ),
    );

    setNotice(
      `${selectedFlag.name} ${selectedFlag.enabled ? "disabled" : "enabled"} in the local demo.`,
    );
    setSaved(false);
    setSelectedFlag(null);
  }

  function createFlag() {
    const normalizedKey = draft.key.trim();

    if (!draft.name.trim() || !normalizedKey) {
      setNotice("Enter a feature name and a unique feature key.");
      return;
    }

    if (!/^[a-zA-Z][a-zA-Z0-9_.-]*$/.test(normalizedKey)) {
      setNotice(
        "Feature keys must start with a letter and contain only letters, numbers, dots, underscores, or hyphens.",
      );
      return;
    }

    if (flags.some((flag) => flag.key === normalizedKey)) {
      setNotice("A feature flag with this key already exists.");
      return;
    }

    const newFlag: FeatureFlag = {
      ...draft,
      id: `FF-${String(Date.now()).slice(-6)}`,
      key: normalizedKey,
      name: draft.name.trim(),
      description: draft.description.trim(),
      owner: draft.owner.trim() || "Product",
      updatedAt: new Date().toISOString().slice(0, 10),
    };

    setFlags((previous) => [newFlag, ...previous]);
    setShowCreate(false);
    setDraft(EMPTY_FLAG);
    setActiveTab("All flags");
    setNotice("Feature flag created in the local demo.");
    setSaved(false);
  }

  function saveConfiguration() {
    try {
      localStorage.setItem(
        "modelnow-admin-feature-flags-v1",
        JSON.stringify({ flags, configuration }),
      );
      setSaved(true);
      setNotice("Feature flags and configuration saved in this browser.");
    } catch {
      setNotice("Unable to save settings in browser storage.");
    }
  }

  function resetDemo() {
    setFlags(INITIAL_FLAGS);
    setConfiguration({
      requireConfirmation: true,
      allowProductionChanges: true,
      auditChanges: true,
      protectCriticalFlags: true,
      defaultRollout: 100,
      emergencyDisable: false,
    });

    try {
      localStorage.removeItem("modelnow-admin-feature-flags-v1");
    } catch {
      // Ignore unavailable browser storage.
    }

    setSaved(false);
    setNotice("Feature flags reset to the initial demo configuration.");
  }

  function exportCsv() {
    const headers = [
      "ID",
      "Name",
      "Key",
      "Description",
      "Category",
      "Enabled",
      "Environment",
      "Rollout",
      "Owner",
      "Updated At",
      "Protected",
    ];

    const rows = filteredFlags.map((flag) => [
      flag.id,
      flag.name,
      flag.key,
      flag.description,
      flag.category,
      flag.enabled ? "true" : "false",
      flag.environment,
      flag.rollout,
      flag.owner,
      flag.updatedAt,
      flag.protected ? "true" : "false",
    ]);

    const escapeCell = (value: string | number) =>
      `"${String(value).replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCell).join(","))
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-feature-flags.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("Feature flag CSV exported.");
  }

  function updateConfiguration<K extends keyof typeof configuration>(
    key: K,
    value: (typeof configuration)[K],
  ) {
    setConfiguration((previous) => ({ ...previous, [key]: value }));
    setSaved(false);
  }

  return (
    <main className="feature-flags-page">
      <style>{`
        .feature-flags-page{--ff-bg:#f7f8fc;--ff-card:#fff;--ff-text:#192437;--ff-muted:#7a8598;--ff-border:#e4e8f0;--ff-blue:#315bea;min-height:100vh;background:var(--ff-bg);padding:30px;color:var(--ff-text);font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
        .feature-flags-page *{box-sizing:border-box}
        .ff-shell{max-width:1480px;margin:0 auto}
        .ff-breadcrumb{display:flex;gap:8px;align-items:center;color:var(--ff-muted);font-size:12px;margin-bottom:20px}
        .ff-breadcrumb strong{color:#374258}
        .ff-header{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;flex-wrap:wrap;margin-bottom:24px}
        .ff-title-wrap{display:flex;gap:14px;align-items:flex-start}
        .ff-title-icon{width:48px;height:48px;display:grid;place-items:center;background:#eaf0ff;color:var(--ff-blue);border-radius:14px;flex-shrink:0}
        .ff-title{font-size:27px;font-weight:770;letter-spacing:-.8px;margin:0 0 7px}
        .ff-subtitle{font-size:13px;line-height:1.65;color:var(--ff-muted);max-width:720px;margin:0}
        .ff-actions{display:flex;gap:9px;flex-wrap:wrap}
        .ff-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;border:1px solid var(--ff-border);background:#fff;color:#3f4a60;border-radius:9px;padding:10px 13px;font-size:12px;font-weight:670;cursor:pointer;transition:.15s}
        .ff-btn:hover{background:#f7f9ff;border-color:#bdcafa}
        .ff-btn:disabled{opacity:.55;cursor:not-allowed}
        .ff-btn.primary{background:var(--ff-blue);border-color:var(--ff-blue);color:#fff}
        .ff-btn.primary:hover{background:#244bd1}
        .ff-notice{display:flex;gap:9px;align-items:flex-start;padding:12px 14px;border:1px solid #cbd9ff;background:#eff4ff;color:#2947a2;border-radius:10px;font-size:12px;line-height:1.55;margin-bottom:18px}
        .ff-notice button{margin-left:auto;border:0;background:transparent;color:inherit;cursor:pointer}
        .ff-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:20px}
        .ff-stat{background:#fff;border:1px solid var(--ff-border);border-radius:13px;padding:17px 18px}
        .ff-stat-top{display:flex;align-items:center;justify-content:space-between;gap:10px;color:var(--ff-muted);font-size:12px}
        .ff-stat-icon{width:35px;height:35px;display:grid;place-items:center;background:#f0f3f9;border-radius:10px;color:#5f6d83}
        .ff-stat-value{font-size:28px;font-weight:770;letter-spacing:-.7px;margin-top:13px}
        .ff-stat-note{font-size:11px;color:var(--ff-muted);margin-top:5px}
        .ff-card{background:#fff;border:1px solid var(--ff-border);border-radius:14px;overflow:hidden;margin-bottom:18px}
        .ff-card-head{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap;padding:17px 19px;border-bottom:1px solid var(--ff-border)}
        .ff-card-title{font-size:14px;font-weight:740;margin:0 0 5px}
        .ff-card-subtitle{font-size:11px;line-height:1.55;color:var(--ff-muted);margin:0}
        .ff-tabs{display:flex;gap:5px;padding:6px;border:1px solid var(--ff-border);border-radius:11px;background:#fff;margin-bottom:18px;overflow-x:auto}
        .ff-tab{white-space:nowrap;border:0;background:transparent;border-radius:8px;padding:10px 14px;font-size:12px;font-weight:670;color:#69758a;cursor:pointer}
        .ff-tab.active{background:#edf2ff;color:var(--ff-blue)}
        .ff-filters{display:flex;align-items:center;gap:9px;flex-wrap:wrap;padding:14px 17px;border-bottom:1px solid var(--ff-border)}
        .ff-search{display:flex;align-items:center;gap:8px;border:1px solid var(--ff-border);border-radius:8px;padding:0 10px;min-width:220px;max-width:360px;flex:1;background:#fff}
        .ff-search input{border:0;outline:none;padding:10px 0;width:100%;font-size:12px;color:var(--ff-text);background:transparent}
        .ff-select{border:1px solid var(--ff-border);border-radius:8px;padding:10px 30px 10px 11px;font-size:12px;color:#465168;background:#fff;outline:none;max-width:100%}
        .ff-table-wrap{width:100%;overflow-x:auto}
        .ff-table{width:100%;border-collapse:collapse;text-align:left;min-width:1000px}
        .ff-table th{font-size:10px;letter-spacing:.45px;text-transform:uppercase;color:#8590a2;font-weight:750;background:#fafbfe;padding:12px 15px;border-bottom:1px solid var(--ff-border);white-space:nowrap}
        .ff-table td{font-size:12px;padding:14px 15px;border-bottom:1px solid #eef0f5;color:#3e4960;vertical-align:middle}
        .ff-table tbody tr:hover{background:#fbfcff}
        .ff-table tr:last-child td{border-bottom:0}
        .ff-feature{display:flex;align-items:center;gap:10px;min-width:220px}
        .ff-feature-icon{width:36px;height:36px;display:grid;place-items:center;background:#eff3ff;color:#365bd0;border-radius:10px;flex-shrink:0}
        .ff-feature-name{font-size:12px;font-weight:720;color:#263249}
        .ff-feature-key{font-size:10px;color:#8490a3;margin-top:4px;font-family:ui-monospace,SFMono-Regular,Menlo,monospace}
        .ff-description{font-size:11px;line-height:1.5;color:#7b8699;max-width:260px}
        .ff-pill{display:inline-flex;align-items:center;gap:6px;padding:5px 8px;border-radius:20px;font-size:10px;font-weight:720;white-space:nowrap}
        .ff-pill.success{background:#e8f8ee;color:#17834b}
        .ff-pill.neutral{background:#eff1f5;color:#6b7587}
        .ff-pill.blue{background:#edf2ff;color:#315bea}
        .ff-pill.warning{background:#fff4df;color:#a66a08}
        .ff-status-dot{width:6px;height:6px;border-radius:50%;background:currentColor}
        .ff-rollout{display:flex;align-items:center;gap:8px;min-width:95px}
        .ff-rollout-track{width:54px;height:6px;background:#edf0f5;border-radius:20px;overflow:hidden}
        .ff-rollout-fill{height:100%;background:#315bea;border-radius:20px}
        .ff-empty{text-align:center;padding:42px 15px;color:var(--ff-muted);font-size:12px}
        .ff-empty-icon{width:45px;height:45px;border-radius:12px;background:#f1f4fa;display:grid;place-items:center;margin:0 auto 12px}
        .ff-config-list{padding:0}
        .ff-config-row{display:flex;align-items:center;justify-content:space-between;gap:20px;padding:17px 19px;border-bottom:1px solid #eef0f5}
        .ff-config-row:last-child{border-bottom:0}
        .ff-config-title{font-size:12px;font-weight:720;margin-bottom:5px}
        .ff-config-description{font-size:11px;line-height:1.55;color:var(--ff-muted);max-width:720px}
        .ff-switch{width:39px;height:22px;border:0;border-radius:20px;background:#cbd1dd;padding:3px;cursor:pointer;flex-shrink:0;transition:.15s}
        .ff-switch span{display:block;width:16px;height:16px;border-radius:50%;background:white;box-shadow:0 1px 3px #0002;transition:transform .15s}
        .ff-switch.active{background:var(--ff-blue)}
        .ff-switch.active span{transform:translateX(17px)}
        .ff-switch:disabled{opacity:.5;cursor:not-allowed}
        .ff-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:15px;padding:19px}
        .ff-field{display:flex;flex-direction:column;gap:7px;min-width:0}
        .ff-field label{font-size:11px;font-weight:720;color:#48536a}
        .ff-field input,.ff-field select,.ff-field textarea{width:100%;border:1px solid #dfe4ed;border-radius:8px;padding:11px 12px;font-size:12px;outline:none;background:#fff;color:#273248}
        .ff-field textarea{resize:vertical;min-height:78px}
        .ff-field input:focus,.ff-field select:focus,.ff-field textarea:focus{border-color:#8ea5fb;box-shadow:0 0 0 3px #315bea12}
        .ff-help{font-size:10px;line-height:1.5;color:var(--ff-muted);margin:0}
        .ff-range{display:flex;align-items:center;gap:12px}
        .ff-range input{padding:0;accent-color:var(--ff-blue)}
        .ff-range-value{font-size:12px;font-weight:750;min-width:42px;text-align:right}
        .ff-note{display:flex;align-items:flex-start;gap:9px;padding:12px 14px;border:1px solid #f0dfb9;background:#fff9eb;color:#875b13;border-radius:10px;font-size:11px;line-height:1.6;margin:17px 19px}
        .ff-modal-backdrop{position:fixed;inset:0;background:#10182870;z-index:50;display:flex;align-items:center;justify-content:center;padding:18px}
        .ff-modal{width:100%;max-width:560px;max-height:90vh;overflow-y:auto;background:white;border-radius:16px;box-shadow:0 24px 80px #10182830}
        .ff-modal-head{display:flex;justify-content:space-between;align-items:flex-start;gap:14px;padding:20px;border-bottom:1px solid var(--ff-border)}
        .ff-modal-title{font-size:17px;font-weight:760;margin:0 0 6px}
        .ff-modal-subtitle{font-size:11px;color:var(--ff-muted);line-height:1.5;margin:0}
        .ff-modal-body{padding:20px}
        .ff-modal-footer{display:flex;justify-content:flex-end;gap:9px;padding:15px 20px;border-top:1px solid var(--ff-border)}
        .ff-close{width:30px;height:30px;border:0;border-radius:8px;background:#f3f5f9;display:grid;place-items:center;cursor:pointer;color:#657087}
        @media(max-width:1000px){.ff-stats{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:650px){.feature-flags-page{padding:16px}.ff-title{font-size:23px}.ff-stats{gap:9px}.ff-stat{padding:13px}.ff-stat-value{font-size:24px}.ff-form-grid{grid-template-columns:1fr}.ff-search{min-width:100%;max-width:none}.ff-filters .ff-select{flex:1}.ff-actions{width:100%}.ff-actions .ff-btn{flex:1}.ff-tabs{margin-right:-2px}.ff-tab{padding:10px}}
      `}</style>

      <div className="ff-shell">
        <div className="ff-breadcrumb">
          <span>Admin</span><span>/</span><span>Settings</span><span>/</span>
          <strong>Feature Flags</strong>
        </div>

        <header className="ff-header">
          <div className="ff-title-wrap">
            <div className="ff-title-icon"><Flag size={24} /></div>
            <div>
              <h1 className="ff-title">Feature Flags</h1>
              <p className="ff-subtitle">
                Control feature availability, manage staged rollouts, and configure
                application experiments across ModelNow environments.
              </p>
            </div>
          </div>
          <div className="ff-actions">
            <button className="ff-btn" onClick={resetDemo}><RefreshCw size={14} /> Reset demo</button>
            <button className="ff-btn" onClick={exportCsv}><Download size={14} /> Export CSV</button>
            <button className="ff-btn primary" onClick={() => setShowCreate(true)}><Plus size={15} /> Create flag</button>
          </div>
        </header>

        {notice && (
          <div className="ff-notice">
            <CircleHelp size={16} />
            <span>{notice}</span>
            <button onClick={() => setNotice("")} aria-label="Dismiss notice"><X size={15} /></button>
          </div>
        )}

        <section className="ff-stats">
          <div className="ff-stat">
            <div className="ff-stat-top">Total feature flags <span className="ff-stat-icon"><Flag size={17} /></span></div>
            <div className="ff-stat-value">{flags.length}</div>
            <div className="ff-stat-note">Configured feature definitions</div>
          </div>
          <div className="ff-stat">
            <div className="ff-stat-top">Enabled flags <span className="ff-stat-icon"><CheckCircle2 size={17} /></span></div>
            <div className="ff-stat-value">{enabledCount}</div>
            <div className="ff-stat-note">{flags.length ? Math.round((enabledCount / flags.length) * 100) : 0}% of configured flags enabled</div>
          </div>
          <div className="ff-stat">
            <div className="ff-stat-top">Disabled flags <span className="ff-stat-icon"><ToggleLeft size={17} /></span></div>
            <div className="ff-stat-value">{disabledCount}</div>
            <div className="ff-stat-note">Features currently switched off</div>
          </div>
          <div className="ff-stat">
            <div className="ff-stat-top">Protected flags <span className="ff-stat-icon"><Shield size={17} /></span></div>
            <div className="ff-stat-value">{protectedCount}</div>
            <div className="ff-stat-note">{experimentCount} experiment configured</div>
          </div>
        </section>

        <nav className="ff-tabs" aria-label="Feature flag sections">
          {(["Overview", "All flags", "Experiments", "Configuration"] as Tab[]).map((tab) => (
            <button
              key={tab}
              className={`ff-tab ${activeTab === tab ? "active" : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </nav>

        {activeTab === "Overview" && (
          <>
            <section className="ff-card">
              <div className="ff-card-head">
                <div>
                  <h2 className="ff-card-title">Feature flag status</h2>
                  <p className="ff-card-subtitle">Quickly review and manage the most important feature switches.</p>
                </div>
                <button className="ff-btn" onClick={() => setActiveTab("All flags")}>View all flags <ChevronDown size={14} /></button>
              </div>
              <div className="ff-table-wrap">
                <table className="ff-table">
                  <thead><tr><th>Feature</th><th>Category</th><th>Environment</th><th>Rollout</th><th>Status</th><th>Protected</th><th>Control</th></tr></thead>
                  <tbody>
                    {flags.slice(0, 6).map((flag) => (
                      <tr key={flag.id}>
                        <td>
                          <div className="ff-feature">
                            <div className="ff-feature-icon"><Code2 size={17} /></div>
                            <div><div className="ff-feature-name">{flag.name}</div><div className="ff-feature-key">{flag.key}</div></div>
                          </div>
                        </td>
                        <td>{flag.category}</td>
                        <td>{flag.environment}</td>
                        <td>
                          <div className="ff-rollout"><div className="ff-rollout-track"><div className="ff-rollout-fill" style={{ width: `${flag.rollout}%` }} /></div><span>{flag.rollout}%</span></div>
                        </td>
                        <td><StatusPill enabled={flag.enabled} /></td>
                        <td>{flag.protected ? <span className="ff-pill warning"><Shield size={11} /> Protected</span> : <span className="ff-pill neutral">Standard</span>}</td>
                        <td><Switch checked={flag.enabled} onChange={() => toggleFlag(flag.id)} label={`Toggle ${flag.name}`} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="ff-note"><AlertTriangle size={15} /> Changes on this page affect local demo state only. Runtime enforcement requires a feature-flag service or backend evaluation layer.</div>
            </section>

            <div className="ff-stats">
              <div className="ff-stat">
                <div className="ff-stat-top">AI infrastructure <span className="ff-stat-icon"><Layers3 size={17} /></span></div>
                <div className="ff-stat-value">{flags.filter((flag) => flag.category === "AI Infrastructure").length}</div>
                <div className="ff-stat-note">Model and provider capabilities</div>
              </div>
              <div className="ff-stat">
                <div className="ff-stat-top">Agent features <span className="ff-stat-icon"><Zap size={17} /></span></div>
                <div className="ff-stat-value">{flags.filter((flag) => flag.category === "Agents" || flag.category === "Automation").length}</div>
                <div className="ff-stat-note">Agent and automation capabilities</div>
              </div>
              <div className="ff-stat">
                <div className="ff-stat-top">Security controls <span className="ff-stat-icon"><Shield size={17} /></span></div>
                <div className="ff-stat-value">{flags.filter((flag) => flag.category === "Security").length}</div>
                <div className="ff-stat-note">Security-related feature controls</div>
              </div>
              <div className="ff-stat">
                <div className="ff-stat-top">Experiments <span className="ff-stat-icon"><Activity size={17} /></span></div>
                <div className="ff-stat-value">{experimentCount}</div>
                <div className="ff-stat-note">Experimental application features</div>
              </div>
            </div>
          </>
        )}

        {(activeTab === "All flags" || activeTab === "Experiments") && (
          <section className="ff-card">
            <div className="ff-card-head">
              <div>
                <h2 className="ff-card-title">{activeTab === "Experiments" ? "Experiments" : "All feature flags"}</h2>
                <p className="ff-card-subtitle">
                  Search definitions, filter by environment, and manage feature availability.
                </p>
              </div>
              <span className="ff-pill blue">{filteredFlags.length} results</span>
            </div>
            <div className="ff-filters">
              <div className="ff-search">
                <Search size={15} color="#8a94a6" />
                <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, key, description, owner..." />
                {search && <button onClick={() => setSearch("")} aria-label="Clear search" style={{ border: 0, background: "transparent", cursor: "pointer" }}><X size={14} /></button>}
              </div>
              <select className="ff-select" value={category} onChange={(event) => setCategory(event.target.value)}>
                {CATEGORIES.map((item) => <option key={item}>{item}</option>)}
              </select>
              <select className="ff-select" value={environment} onChange={(event) => setEnvironment(event.target.value)}>
                {ENVIRONMENTS.map((item) => <option key={item}>{item}</option>)}
              </select>
              <select className="ff-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option>All statuses</option>
                <option>Enabled</option>
                <option>Disabled</option>
              </select>
              <button className="ff-btn" onClick={() => { setSearch(""); setCategory("All categories"); setEnvironment("All environments"); setStatusFilter("All statuses"); }}><SlidersHorizontal size={14} /> Clear filters</button>
            </div>
            <div className="ff-table-wrap">
              <table className="ff-table">
                <thead><tr><th>Feature</th><th>Category</th><th>Environment</th><th>Rollout</th><th>Owner</th><th>Status</th><th>Updated</th><th>Control</th></tr></thead>
                <tbody>
                  {filteredFlags.map((flag) => (
                    <tr key={flag.id}>
                      <td>
                        <div className="ff-feature">
                          <div className="ff-feature-icon"><Code2 size={17} /></div>
                          <div><div className="ff-feature-name">{flag.name}</div><div className="ff-feature-key">{flag.key}</div><div className="ff-description" style={{ marginTop: 5 }}>{flag.description}</div></div>
                        </div>
                      </td>
                      <td>{flag.category}</td>
                      <td>{flag.environment}</td>
                      <td><div className="ff-rollout"><div className="ff-rollout-track"><div className="ff-rollout-fill" style={{ width: `${flag.rollout}%` }} /></div><span>{flag.rollout}%</span></div></td>
                      <td>{flag.owner}</td>
                      <td><StatusPill enabled={flag.enabled} /></td>
                      <td>{flag.updatedAt}</td>
                      <td><Switch checked={flag.enabled} onChange={() => toggleFlag(flag.id)} label={`Toggle ${flag.name}`} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredFlags.length === 0 && <div className="ff-empty"><div className="ff-empty-icon"><Search size={21} /></div>No feature flags match these filters.</div>}
            </div>
            <div className="ff-note"><Shield size={15} /> Protected critical flags cannot be switched off while critical-flag protection is enabled. Adjust the policy in Configuration if authorized.</div>
          </section>
        )}

        {activeTab === "Configuration" && (
          <>
            <section className="ff-card">
              <div className="ff-card-head">
                <div><h2 className="ff-card-title">Feature flag policies</h2><p className="ff-card-subtitle">Set default behavior for changes and production operations.</p></div>
                <Settings2 size={19} color="#778195" />
              </div>
              <div className="ff-config-list">
                <div className="ff-config-row">
                  <div><div className="ff-config-title">Require confirmation for changes</div><div className="ff-config-description">Show a confirmation dialog before switching any feature flag on or off.</div></div>
                  <Switch checked={configuration.requireConfirmation} onChange={() => updateConfiguration("requireConfirmation", !configuration.requireConfirmation)} label="Require confirmation" />
                </div>
                <div className="ff-config-row">
                  <div><div className="ff-config-title">Allow production changes</div><div className="ff-config-description">Permit modifications to flags explicitly scoped to the production environment.</div></div>
                  <Switch checked={configuration.allowProductionChanges} onChange={() => updateConfiguration("allowProductionChanges", !configuration.allowProductionChanges)} label="Allow production changes" />
                </div>
                <div className="ff-config-row">
                  <div><div className="ff-config-title">Audit flag changes</div><div className="ff-config-description">Configure the intended policy to record who changed a flag, when it changed, and the previous value.</div></div>
                  <Switch checked={configuration.auditChanges} onChange={() => updateConfiguration("auditChanges", !configuration.auditChanges)} label="Audit flag changes" />
                </div>
                <div className="ff-config-row">
                  <div><div className="ff-config-title">Protect critical flags</div><div className="ff-config-description">Prevent protected critical flags from being disabled through this demo interface.</div></div>
                  <Switch checked={configuration.protectCriticalFlags} onChange={() => updateConfiguration("protectCriticalFlags", !configuration.protectCriticalFlags)} label="Protect critical flags" />
                </div>
                <div className="ff-config-row">
                  <div><div className="ff-config-title">Emergency disable mode</div><div className="ff-config-description">A configuration placeholder for an authorized emergency shutdown workflow. This demo does not change live services.</div></div>
                  <Switch checked={configuration.emergencyDisable} onChange={() => updateConfiguration("emergencyDisable", !configuration.emergencyDisable)} label="Emergency disable mode" />
                </div>
              </div>
            </section>

            <section className="ff-card">
              <div className="ff-card-head">
                <div><h2 className="ff-card-title">Rollout defaults</h2><p className="ff-card-subtitle">Set the default rollout percentage for newly created flags.</p></div>
                <SlidersHorizontal size={19} color="#778195" />
              </div>
              <div className="ff-form-grid">
                <div className="ff-field">
                  <label htmlFor="ff-default-rollout">Default rollout percentage</label>
                  <div className="ff-range">
                    <input id="ff-default-rollout" type="range" min={0} max={100} step={5} value={configuration.defaultRollout} onChange={(event) => updateConfiguration("defaultRollout", Number(event.target.value))} />
                    <span className="ff-range-value">{configuration.defaultRollout}%</span>
                  </div>
                  <p className="ff-help">This default applies to newly created flags; it does not automatically change existing flags.</p>
                </div>
              </div>
              <div className="ff-note"><AlertTriangle size={15} /> These are administrative demo preferences. Enforce production permissions, audit logging, rollout evaluation, and emergency controls in the backend before relying on them.</div>
            </section>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginBottom: 20 }}>
              <button className="ff-btn" onClick={resetDemo}><RefreshCw size={14} /> Reset demo</button>
              <button className="ff-btn primary" onClick={saveConfiguration}><Check size={14} /> {saved ? "Saved" : "Save configuration"}</button>
            </div>
          </>
        )}

        <footer style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", padding: "5px 2px", color: "#8993a5", fontSize: 11 }}>
          <span>ModelNow Admin · Feature Flags</span>
          <span>{saved ? "Local configuration saved" : "Unsaved changes may be lost on refresh"} · Demo mode</span>
        </footer>
      </div>

      {showCreate && (
        <div className="ff-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setShowCreate(false);
        }}>
          <section className="ff-modal" role="dialog" aria-modal="true" aria-labelledby="ff-create-title">
            <div className="ff-modal-head">
              <div>
                <h2 id="ff-create-title" className="ff-modal-title">Create feature flag</h2>
                <p className="ff-modal-subtitle">Add a new feature definition to the local demo catalog.</p>
              </div>
              <button className="ff-close" onClick={() => setShowCreate(false)} aria-label="Close dialog"><X size={16} /></button>
            </div>
            <div className="ff-modal-body">
              <div className="ff-form-grid" style={{ padding: 0 }}>
                <div className="ff-field">
                  <label htmlFor="ff-name">Feature name *</label>
                  <input id="ff-name" value={draft.name} onChange={(event) => setDraft((previous) => ({ ...previous, name: event.target.value }))} placeholder="e.g. Advanced analytics" />
                </div>
                <div className="ff-field">
                  <label htmlFor="ff-key">Feature key *</label>
                  <input id="ff-key" value={draft.key} onChange={(event) => setDraft((previous) => ({ ...previous, key: event.target.value }))} placeholder="analytics.advanced" />
                  <p className="ff-help">Use a unique, stable identifier.</p>
                </div>
                <div className="ff-field" style={{ gridColumn: "1 / -1" }}>
                  <label htmlFor="ff-description">Description</label>
                  <textarea id="ff-description" value={draft.description} onChange={(event) => setDraft((previous) => ({ ...previous, description: event.target.value }))} placeholder="Describe what this feature controls." />
                </div>
                <div className="ff-field">
                  <label htmlFor="ff-category">Category</label>
                  <select id="ff-category" value={draft.category} onChange={(event) => setDraft((previous) => ({ ...previous, category: event.target.value }))}>
                    {CATEGORIES.filter((item) => item !== "All categories" && item !== "Other").map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>
                <div className="ff-field">
                  <label htmlFor="ff-environment">Environment</label>
                  <select id="ff-environment" value={draft.environment} onChange={(event) => setDraft((previous) => ({ ...previous, environment: event.target.value as FeatureFlag["environment"] }))}>
                    {ENVIRONMENTS.map((item) => <option key={item}>{item}</option>)}
                  </select>
                </div>
                <div className="ff-field">
                  <label htmlFor="ff-owner">Owner</label>
                  <input id="ff-owner" value={draft.owner} onChange={(event) => setDraft((previous) => ({ ...previous, owner: event.target.value }))} placeholder="Team or owner" />
                </div>
                <div className="ff-field">
                  <label htmlFor="ff-rollout">Rollout percentage</label>
                  <div className="ff-range">
                    <input id="ff-rollout" type="range" min={0} max={100} step={5} value={draft.rollout} onChange={(event) => setDraft((previous) => ({ ...previous, rollout: Number(event.target.value) }))} />
                    <span className="ff-range-value">{draft.rollout}%</span>
                  </div>
                </div>
                <div className="ff-field" style={{ gridColumn: "1 / -1" }}>
                  <label>Initial state</label>
                  <div className="ff-config-row" style={{ padding: "10px 0", border: 0 }}>
                    <div><div className="ff-config-title">Enable this feature</div><div className="ff-config-description">The new flag will be created with this state.</div></div>
                    <Switch checked={draft.enabled} onChange={() => setDraft((previous) => ({ ...previous, enabled: !previous.enabled }))} label="Enable new feature" />
                  </div>
                </div>
              </div>
            </div>
            <div className="ff-modal-footer">
              <button className="ff-btn" onClick={() => setShowCreate(false)}>Cancel</button>
              <button className="ff-btn primary" onClick={createFlag}><Plus size={14} /> Create flag</button>
            </div>
          </section>
        </div>
      )}

      {selectedFlag && (
        <div className="ff-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setSelectedFlag(null);
        }}>
          <section className="ff-modal" role="dialog" aria-modal="true" aria-labelledby="ff-confirm-title">
            <div className="ff-modal-head">
              <div>
                <h2 id="ff-confirm-title" className="ff-modal-title">Confirm feature change</h2>
                <p className="ff-modal-subtitle">Review the requested change before continuing.</p>
              </div>
              <button className="ff-close" onClick={() => setSelectedFlag(null)} aria-label="Close dialog"><X size={16} /></button>
            </div>
            <div className="ff-modal-body">
              <div className="ff-feature" style={{ marginBottom: 18 }}>
                <div className="ff-feature-icon"><Flag size={18} /></div>
                <div><div className="ff-feature-name">{selectedFlag.name}</div><div className="ff-feature-key">{selectedFlag.key}</div></div>
              </div>
              <div className="ff-config-row" style={{ padding: "13px 0" }}>
                <div><div className="ff-config-title">Current status</div><div className="ff-config-description">Current state of this flag.</div></div>
                <StatusPill enabled={selectedFlag.enabled} />
              </div>
              <div className="ff-config-row" style={{ padding: "13px 0" }}>
                <div><div className="ff-config-title">Requested status</div><div className="ff-config-description">State after confirmation.</div></div>
                <StatusPill enabled={!selectedFlag.enabled} />
              </div>
              {selectedFlag.protected && (
                <div className="ff-note" style={{ margin: "16px 0 0" }}>
                  <Shield size={15} /> This is a protected flag. Confirm that your organization's change-management policy permits this action.
                </div>
              )}
            </div>
            <div className="ff-modal-footer">
              <button className="ff-btn" onClick={() => setSelectedFlag(null)}>Cancel</button>
              <button className="ff-btn primary" onClick={confirmToggle}>
                <Check size={14} /> Confirm change
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}