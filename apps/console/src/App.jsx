import PlaygroundPage from "./app/playground/page.tsx";
import PromptsPage from "./app/prompts/page.tsx";
import LogsPage from "./app/logs/page.tsx";
import UsagePage from "./app/usage/page.tsx";
import BillingPage from "./app/billing/page.tsx";
import SettingsPage from "./app/settings/page.tsx";
import ConsoleLoginPage from "./app/login/page.tsx";
import LogoutPage from "./app/logout/page.tsx";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, AlertCircle, ArrowDownRight, ArrowRight, ArrowUpRight,
  AudioLines, Blocks, BookOpenText, Bot, Boxes, Check, ChevronDown,
  ChevronLeft, ChevronRight, CircleHelp, Clock3, Command, CreditCard,
  Database, FileClock, FileKey2, Fingerprint, Gauge, GitBranch,
  Globe2, HardDrive, KeyRound, Layers3, LifeBuoy, LockKeyhole, LogOut,
  Menu, MessageSquareText, Moon, MoreHorizontal, Network, PanelLeftClose,
  PanelLeftOpen, RefreshCw, Search, Server, Settings2, Shield, ShieldCheck,
  SlidersHorizontal, Sparkles, TerminalSquare, Users, X, Zap, FileText, Bell
} from "lucide-react";
import {
  Link, NavLink, Navigate, Route, Routes, useLocation
} from "react-router-dom";
import OrganizationCreditsPage from "./app/credits/page.tsx";
import DocumentsPage from "./app/documents/page.tsx";
import NotificationsPage from "./app/notifications/page.tsx";
import MonthlySpendPage from "./app/spend/page.tsx";
import PromptCachingPage from "./app/prompt-caching/page.tsx";
import TokenVolumePage from "./app/token-volume/page.tsx";
import FastModeDocsPage from "./app/docs/fast-mode/page.tsx";
import BatchApiDocsPage from "./app/docs/batch-api/page.tsx";
import PromptCachingDocsPage from "./app/docs/prompt-caching/page.tsx";
import DashboardPage from "./app/dashboard/page.tsx";
import BrowserAutomationPage from "./app/browser-automation/page.tsx";
import KnowledgeHubPage from "./app/knowledge-hub/page.tsx";
import FineTuningPage from "./app/fine-tuning/page.tsx";
import MultimodalAIPage from "./app/multimodal-ai/page.tsx";
import ComputerUsePage from "./app/computer-use/page.tsx";
import PlansPage from "./app/plans/page.tsx";
import ApiKeysPage from "./app/api-keys/page.tsx";
import AgentsPage from "./app/agents/page.tsx";
import EnterprisePage from "./app/enterprise/page.tsx";
import EnterpriseAuditPage from "./app/enterprise/audit/page.tsx";
import EnterpriseSlaPage from "./app/enterprise/sla/page.tsx";
import EnterpriseSsoPage from "./app/enterprise/sso/page.tsx";
import EnterpriseSecurityPage from "./app/enterprise/security/page.tsx";
import EnterpriseRbacPage from "./app/enterprise/rbac/page.tsx";
import EnterpriseGovernancePage from "./app/enterprise/governance/page.tsx";
import EnterpriseCompliancePage from "./app/enterprise/compliance/page.tsx";
import { consoleConfig, getResourceEndpoint } from "./config/console.js";
import { api, ApiError } from "./lib/api.js";
import { ConsoleSidebar as Sidebar, navigation } from "./components/sidebar/ConsoleSidebar.jsx";

const resourceDefinitions = {
  models: {
    title: "Model catalog",
    description: "Inspect the model inventory exposed to your organization.",
    endpointKey: "models",
    icon: Boxes,
    columns: ["name", "provider", "status"]
  },
  "api-keys": {
    title: "API keys",
    description: "Review API credential metadata and access configuration.",
    endpointKey: "apiKeys",
    icon: FileKey2,
    columns: ["name", "status", "created_at", "expires_at"]
  },
  usage: {
    title: "Usage & limits",
    description: "Review usage and quota data returned by the platform.",
    endpointKey: "usage",
    icon: Activity,
    columns: ["date", "requests", "tokens", "status"]
  },
  logs: {
    title: "Request logs",
    description: "Inspect request records returned by the logging service.",
    endpointKey: "logs",
    icon: FileClock,
    columns: ["id", "created_at", "status", "model"]
  },
  prompts: {
    title: "Prompt library",
    description: "Review prompts published by your workspace.",
    endpointKey: "prompts",
    icon: MessageSquareText,
    columns: ["name", "version", "status", "updated_at"]
  },
  agents: {
    title: "Agents & workflows",
    description: "Inspect configured agents and workflow definitions.",
    endpointKey: "agents",
    icon: GitBranch,
    columns: ["name", "status", "updated_at"]
  },
  billing: {
    title: "Billing",
    description: "Review subscription and billing information provided by the billing API.",
    endpointKey: "billing",
    icon: CreditCard,
    columns: ["name", "status", "updated_at"]
  },
  governance: {
    title: "Governance",
    description: "Review governance policies and their reported state.",
    endpointKey: "governance",
    icon: ShieldCheck,
    columns: ["name", "status", "updated_at"]
  },
  security: {
    title: "Security",
    description: "Inspect security controls exposed by your backend.",
    endpointKey: "security",
    icon: LockKeyhole,
    columns: ["name", "status", "updated_at"]
  },
  audit: {
    title: "Audit trail",
    description: "Review audit events returned by the audit service.",
    endpointKey: "audit",
    icon: Fingerprint,
    columns: ["id", "created_at", "actor", "action"]
  },
  compliance: {
    title: "Compliance",
    description: "Review compliance control status from the configured service.",
    endpointKey: "compliance",
    icon: Shield,
    columns: ["name", "status", "updated_at"]
  },
  rbac: {
    title: "Role-based access control",
    description: "Review roles and access policies from the authorization service.",
    endpointKey: "rbac",
    icon: Users,
    columns: ["name", "role", "status"]
  },
  sso: {
    title: "Single sign-on",
    description: "Inspect identity-provider configuration exposed by the backend.",
    endpointKey: "sso",
    icon: KeyRound,
    columns: ["name", "provider", "status"]
  },
  sla: {
    title: "Service-level objectives",
    description: "Review service-level measurements and agreement status.",
    endpointKey: "sla",
    icon: Clock3,
    columns: ["name", "target", "actual", "status"]
  },
  enterprise: {
    title: "Enterprise workspace",
    description: "Review organization-level settings and service information.",
    endpointKey: "enterprise",
    icon: Globe2,
    columns: ["name", "status", "updated_at"]
  }
};

function formatLabel(value) {
  return String(value || "")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatValue(value) {
  if (value === null || value === undefined || value === "") return "ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â";
  if (typeof value === "boolean") return value ? "Enabled" : "Disabled";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function StatusDot({ status = "unknown" }) {
  const normalized = String(status).toLowerCase();
  const tone =
    ["healthy", "ok", "active", "ready", "enabled", "success", "operational"].includes(normalized)
      ? "success"
      : ["degraded", "warning", "pending", "unknown"].includes(normalized)
        ? "warning"
        : ["error", "failed", "unhealthy", "disabled", "inactive"].includes(normalized)
          ? "danger"
          : "neutral";

  return <span className={`status-dot status-dot--${tone}`} aria-hidden="true" />;
}

function Badge({ children, tone = "neutral" }) {
  return <span className={`badge badge--${tone}`}>{children}</span>;
}

function SectionHeading({ eyebrow, title, description, actions }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
      {actions && <div className="section-actions">{actions}</div>}
    </div>
  );
}

function LoadingState({ label = "Loading data" }) {
  return (
    <div className="state-panel" role="status" aria-live="polite">
      <RefreshCw className="spin" size={20} />
      <strong>{label}</strong>
      <span>Waiting for the platform response.</span>
    </div>
  );
}

function ErrorState({ error, onRetry }) {
  return (
    <div className="state-panel state-panel--error" role="alert">
      <AlertCircle size={22} />
      <strong>Unable to load platform data</strong>
      <span>{error?.message || "An unexpected error occurred."}</span>
      {onRetry && (
        <button className="button button--secondary" onClick={onRetry}>
          <RefreshCw size={15} /> Try again
        </button>
      )}
    </div>
  );
}

function EmptyState({ title = "No records returned", description = "The API returned no records for this view." }) {
  return (
    <div className="state-panel">
      <Database size={22} />
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}

function useHealth() {
  const [state, setState] = useState({
    loading: true,
    data: null,
    error: null,
    checkedAt: null
  });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const data = await api.get("/api/v1/health");
      setState({
        loading: false,
        data,
        error: null,
        checkedAt: new Date()
      });
    } catch (error) {
      setState({
        loading: false,
        data: null,
        error,
        checkedAt: new Date()
      });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { ...state, refresh };
}

function HealthCard() {
  const health = useHealth();
  const payload = health.data;
  const reportedStatus =
    payload && typeof payload === "object"
      ? payload.status || payload.state || "reachable"
      : "reachable";

  const healthy = !health.error &&
    ["healthy", "ok", "ready", "operational", "reachable"].includes(
      String(reportedStatus).toLowerCase()
    );

  return (
    <div className="health-card">
      <div className="health-card__top">
        <div className="health-card__icon"><Server size={18} /></div>
        <Badge tone={health.loading ? "neutral" : health.error ? "danger" : healthy ? "success" : "warning"}>
          <StatusDot status={health.loading ? "unknown" : health.error ? "error" : reportedStatus} />
          {health.loading ? "Checking" : health.error ? "Unreachable" : formatLabel(reportedStatus)}
        </Badge>
      </div>
      <div className="health-card__title">API connectivity</div>
      <div className="health-card__description">
        {health.error
          ? health.error.message
          : health.loading
            ? "Checking the configured API health endpoint."
            : "Health endpoint responded successfully."}
      </div>
      <div className="health-card__bottom">
        <span>
          {health.checkedAt
            ? `Checked ${health.checkedAt.toLocaleTimeString()}`
            : "Awaiting first check"}
        </span>
        <button
          className="icon-button"
          aria-label="Refresh API health"
          title="Refresh API health"
          onClick={health.refresh}
          disabled={health.loading}
        >
          <RefreshCw size={15} className={health.loading ? "spin" : ""} />
        </button>
      </div>
    </div>
  );
}

function OverviewPage() {
  const location = useLocation();

  return (
    <div className="page-stack">
      <SectionHeading
        eyebrow="WORKSPACE OVERVIEW"
        title="Good to see you."
        description="Monitor platform connectivity and open the operational areas available to your workspace."
        actions={
          <span className="button button--primary" aria-disabled="true">Model catalog unavailable</span>
        }
      />

      <div className="welcome-banner">
        <div className="welcome-banner__content">
          <div className="welcome-banner__tag"><Sparkles size={14} /> MODELNOW PLATFORM</div>
          <h2>Your AI operations, in one place.</h2>
          <p>
            Manage model access, prompts, workflows, usage, and enterprise controls
            from a single operational workspace.
          </p>
        </div>
        <div className="welcome-banner__art" aria-hidden="true">
          <div className="orbit orbit--one" />
          <div className="orbit orbit--two" />
          <div className="orbit orbit--three" />
          <div className="orbit__core"><AudioLines size={32} /></div>
          <div className="orbit__node orbit__node--one"><Zap size={14} /></div>
          <div className="orbit__node orbit__node--two"><Network size={14} /></div>
          <div className="orbit__node orbit__node--three"><Layers3 size={14} /></div>
        </div>
      </div>

      <div className="section-subheading">
        <div>
          <h2>Platform status</h2>
          <p>Live checks from the configured backend.</p>
        </div>
        <Badge tone="neutral">Live endpoint</Badge>
      </div>

      <div className="status-grid">
        <HealthCard />
        <div className="info-card">
          <div className="info-card__icon info-card__icon--blue"><Network size={18} /></div>
          <div className="info-card__label">Routing & inference</div>
          <h3>Backend integration</h3>
          <p>Connect the model registry and routing APIs to show live inference status here.</p>
          <span className="text-link" aria-disabled="true">Model catalog unavailable</span>
        </div>
        <div className="info-card">
          <div className="info-card__icon info-card__icon--purple"><ShieldCheck size={18} /></div>
          <div className="info-card__label">Security posture</div>
          <h3>Control visibility</h3>
          <p>Security and compliance views require authorized backend resource endpoints.</p>
          <Link to="/security" className="text-link">Review security <ArrowRight size={14} /></Link>
        </div>
      </div>

      <div className="section-subheading section-subheading--spaced">
        <div>
          <h2>Workspace shortcuts</h2>
          <p>Jump directly to an operational area.</p>
        </div>
      </div>

      <div className="shortcut-grid">
        {[
          { title: "Playground", description: "Test the configured chat API.", icon: TerminalSquare, path: "/playground" },
          { title: "API keys", description: "Review credential metadata.", icon: KeyRound, path: "/api-keys" },
          { title: "Usage & limits", description: "Inspect quota and usage records.", icon: Activity, path: "/usage" },
          { title: "Agents & workflows", description: "Review automation resources.", icon: GitBranch, path: "/agents" }
        ].map((item) => {
          const Icon = item.icon;
          return (
            <Link className="shortcut-card" to={item.path} key={item.path}>
              <span className="shortcut-card__icon"><Icon size={19} /></span>
              <span className="shortcut-card__copy">
                <strong>{item.title}</strong>
                <small>{item.description}</small>
              </span>
              <ArrowUpRight className="shortcut-card__arrow" size={17} />
            </Link>
          );
        })}
      </div>
      <p className="page-footnote">
        View: {location.pathname} ÃƒÆ’Ã†â€™ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â· API origin: {consoleConfig.apiBaseUrl || "same origin"}
      </p>
    </div>
  );
}

function getRows(payload) {
  if (Array.isArray(payload)) return payload;
  if (payload && Array.isArray(payload.data)) return payload.data;
  if (payload && Array.isArray(payload.items)) return payload.items;
  if (payload && Array.isArray(payload.results)) return payload.results;
  return null;
}

function ResourcePage({ resourceKey }) {
  const definition = resourceDefinitions[resourceKey];
  const Icon = definition.icon;
  const [state, setState] = useState({
    loading: false,
    payload: null,
    error: null,
    loaded: false
  });
  const [query, setQuery] = useState("");

  const endpoint = useMemo(() => {
    try {
      return getResourceEndpoint(definition.endpointKey);
    } catch (error) {
      return { invalid: true, message: error.message };
    }
  }, [definition.endpointKey]);

  const load = useCallback(async () => {
    if (!endpoint || typeof endpoint !== "string") return;
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const payload = await api.get(endpoint);
      setState({ loading: false, payload, error: null, loaded: true });
    } catch (error) {
      setState({ loading: false, payload: null, error, loaded: true });
    }
  }, [endpoint]);

  useEffect(() => {
    if (typeof endpoint === "string") load();
  }, [endpoint, load]);

  const rows = getRows(state.payload);
  const filteredRows = useMemo(() => {
    if (!rows) return [];
    const normalized = query.trim().toLowerCase();
    if (!normalized) return rows;
    return rows.filter((row) =>
      Object.values(row || {}).some((value) =>
        formatValue(value).toLowerCase().includes(normalized)
      )
    );
  }, [rows, query]);

  return (
    <div className="page-stack">
      <SectionHeading
        eyebrow="PLATFORM RESOURCE"
        title={definition.title}
        description={definition.description}
        actions={
          <button
            className="button button--secondary"
            onClick={load}
            disabled={state.loading || typeof endpoint !== "string"}
          >
            <RefreshCw size={15} className={state.loading ? "spin" : ""} />
            Refresh
          </button>
        }
      />

      <div className="resource-summary">
        <div className="resource-summary__icon"><Icon size={22} /></div>
        <div>
          <strong>Backend-backed resource view</strong>
          <p>Records are displayed only when returned by the configured API.</p>
        </div>
        <div className="resource-summary__right">
          {state.loading ? <Badge tone="neutral">Loading</Badge> :
            state.error ? <Badge tone="danger">Request failed</Badge> :
            state.loaded ? <Badge tone="success">Response received</Badge> :
            <Badge tone="warning">Not configured</Badge>}
        </div>
      </div>

      {endpoint && typeof endpoint === "object" && (
        <div className="notice notice--error" role="alert">
          <AlertCircle size={18} />
          <div>
            <strong>Invalid endpoint configuration</strong>
            <p>{endpoint.message}</p>
          </div>
        </div>
      )}

      {!endpoint && (
        <div className="notice">
          <Database size={18} />
          <div>
            <strong>Backend contract not configured</strong>
            <p>
              Set <code>VITE_CONSOLE_ENDPOINT_{definition.endpointKey.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase()}</code>
              {" "}to the verified same-origin API path, then restart the console.
              No placeholder records or simulated data are shown.
            </p>
          </div>
        </div>
      )}

      {state.error && <ErrorState error={state.error} onRetry={load} />}

      {state.loading && <LoadingState label={`Loading ${definition.title.toLowerCase()}`} />}

      {state.loaded && !state.error && rows === null && (
        <div className="notice notice--error">
          <AlertCircle size={18} />
          <div>
            <strong>Unexpected response shape</strong>
            <p>
              Expected a JSON array or an object containing a data, items, or results array.
              Adapt the resource serializer to the actual backend response contract.
            </p>
          </div>
        </div>
      )}

      {state.loaded && !state.error && rows !== null && rows.length === 0 && (
        <EmptyState />
      )}

      {state.loaded && !state.error && rows && rows.length > 0 && (
        <div className="data-card">
          <div className="data-card__toolbar">
            <div className="data-card__count">{filteredRows.length} record{filteredRows.length === 1 ? "" : "s"}</div>
            <label className="table-search">
              <Search size={15} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Filter returned records"
                aria-label={`Filter ${definition.title}`}
              />
            </label>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {definition.columns.map((column) => (
                    <th key={column}>{formatLabel(column)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((row, index) => (
                  <tr key={String(row.id ?? row.key ?? row.name ?? index)}>
                    {definition.columns.map((column) => {
                      const value = row?.[column];
                      return (
                        <td key={column}>
                          {column === "status"
                            ? <span className="table-status"><StatusDot status={value} />{formatValue(value)}</span>
                            : <span title={formatValue(value)}>{formatValue(value)}</span>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredRows.length === 0 && (
            <div className="table-empty">No records match your filter.</div>
          )}
        </div>
      )}

      <div className="page-footnote">
        This view is read-only. Mutations require explicit backend contracts, authorization checks,
        and audit logging before controls are enabled.
      </div>
    </div>
  );
}

function LegacyPlaygroundPage() {
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError(null);
    setResult(null);
    setBusy(true);

    try {
      // This request is deliberately not sent until the backend chat contract is verified.
      const response = await api.post("/api/v1/chat", {
        message: prompt.trim(),
        ...(model.trim() ? { model: model.trim() } : {})
      });
      setResult(response);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page-stack">
      <SectionHeading
        eyebrow="DEVELOPMENT WORKSPACE"
        title="Playground"
        description="Send a test request through the authenticated ModelNow chat API."
      />
      <div className="notice">
        <TerminalSquare size={18} />
        <div>
          <strong>Live API request</strong>
          <p>
            Submitting sends the prompt to <code>POST /api/v1/chat</code>.
            Authentication and runtime availability are controlled by the backend.
            Do not enter secrets or sensitive customer data.
          </p>
        </div>
      </div>
      <form className="playground-layout" onSubmit={submit}>
        <div className="form-card">
          <label className="field-label" htmlFor="model-id">Model ID (optional)</label>
          <input
            id="model-id"
            className="field-input"
            value={model}
            onChange={(event) => setModel(event.target.value)}
            placeholder="Use server-side routing"
            maxLength={200}
          />
          <label className="field-label" htmlFor="prompt-input">Prompt</label>
          <textarea
            id="prompt-input"
            className="field-textarea"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Enter a non-sensitive test prompt..."
            rows={9}
            maxLength={20000}
            required
          />
          <div className="field-footer">
            <span>{prompt.length.toLocaleString()} / 20,000 characters</span>
            <button className="button button--primary" type="submit" disabled={busy || !prompt.trim()}>
              {busy ? <RefreshCw size={15} className="spin" /> : <Zap size={15} />}
              {busy ? "Sending..." : "Send request"}
            </button>
          </div>
        </div>
        <div className="form-card result-card">
          <div className="result-card__heading">
            <h2>Response</h2>
            <Badge tone={busy ? "warning" : error ? "danger" : result ? "success" : "neutral"}>
              {busy ? "Running" : error ? "Failed" : result ? "Received" : "Waiting"}
            </Badge>
          </div>
          {busy && <LoadingState label="Waiting for the chat API" />}
          {error && <ErrorState error={error} />}
          {result && (
            <pre className="response-json">{JSON.stringify(result, null, 2)}</pre>
          )}
          {!busy && !error && !result && (
            <EmptyState
              title="No response yet"
              description="Submit a prompt to view the actual API response."
            />
          )}
        </div>
      </form>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="not-found">
      <div className="not-found__code">404</div>
      <h1>Page not found</h1>
      <p>The requested console route does not exist.</p>
      <Link className="button button--primary" to="/">Return to overview</Link>
    </div>
  );
}

function Header({ onMenu, onCollapse, collapsed }) {
  const location = useLocation();
  const currentItem = navigation.flatMap((group) => group.items)
    .find((item) => item.path === location.pathname);
  const resourceTitle = resourceDefinitions[location.pathname.slice(1)]?.title;
  const title = location.pathname === "/"
    ? "Overview"
    : currentItem?.label || resourceTitle || (location.pathname === "/playground" ? "Playground" : "Console");

  return (
    <header className="topbar">
      <div className="topbar__left">
        <button className="icon-button mobile-menu-button" onClick={onMenu} aria-label="Open navigation">
          <Menu size={19} />
        </button>
        <button className="icon-button desktop-collapse-button" onClick={onCollapse} aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}>
          {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
        </button>
        <div className="breadcrumb">
          <span>ModelNow</span>
          <ChevronRight size={14} />
          <strong>{title}</strong>
        </div>
      </div>
      <div className="topbar__right">
        <div className="environment-pill"><span /> Console</div>
        <div className="topbar-divider" />
        <button className="icon-button" title="Help" aria-label="Help">
          <CircleHelp size={18} />
        </button>
        <button className="icon-button" title="Settings" aria-label="Settings" onClick={() => window.location.assign("/settings")}>
          <Settings2 size={18} />
        </button>
        <div className="user-avatar" title="Workspace account">MN</div>
      </div>
    </header>
  );
}

function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        window.location.assign("/api-keys");
      }
      if (event.key === "Escape") setMobileOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (location.pathname === "/login") return <ConsoleLoginPage />;

  return (
    <div className="app-shell">
      <Sidebar
        mobileOpen={mobileOpen}
        onNavigate={() => setMobileOpen(false)}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />
      <div className={`app-main ${collapsed ? "app-main--collapsed" : ""}`}>
        <Header
          onMenu={() => setMobileOpen(true)}
          onCollapse={() => setCollapsed((value) => !value)}
          collapsed={collapsed}
        />
        <main className="main-content" id="main-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/credits" element={<OrganizationCreditsPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/spend" element={<MonthlySpendPage />} />
            <Route path="/prompt-caching" element={<PromptCachingPage />} />
            <Route path="/token-volume" element={<TokenVolumePage />} />
            <Route path="/docs/fast-mode" element={<FastModeDocsPage />} />
            <Route path="/docs/batch-api" element={<BatchApiDocsPage />} />
            <Route path="/docs/prompt-caching" element={<PromptCachingDocsPage />} />
            <Route path="/prompts" element={<PromptsPage />} />
            <Route path="/logs" element={<LogsPage />} />
            <Route path="/usage" element={<UsagePage />} />
            <Route path="/billing" element={<BillingPage />} />
            <Route path="/playground" element={<PlaygroundPage />} />
            <Route path="/browser-automation" element={<BrowserAutomationPage />} />
            <Route path="/knowledge-hub" element={<KnowledgeHubPage />} />
            <Route path="/fine-tuning" element={<FineTuningPage />} />
            <Route path="/multimodal-ai" element={<MultimodalAIPage />} />
            <Route path="/computer-use" element={<ComputerUsePage />} />
            <Route path="/plans" element={<PlansPage />} />
            <Route path="/api-keys" element={<ApiKeysPage />} />
            <Route path="/agents" element={<AgentsPage />} />
            <Route path="/agents/new" element={<AgentsPage />} />
                        <Route path="/enterprise" element={<EnterprisePage />} />
            <Route path="/audit" element={<EnterpriseAuditPage />} />
            <Route path="/sla" element={<EnterpriseSlaPage />} />
            <Route path="/sso" element={<EnterpriseSsoPage />} />
            <Route path="/security" element={<EnterpriseSecurityPage />} />
            <Route path="/rbac" element={<EnterpriseRbacPage />} />
            <Route path="/governance" element={<EnterpriseGovernancePage />} />
            <Route path="/compliance" element={<EnterpriseCompliancePage />} />{Object.keys(resourceDefinitions).filter((key) => !["enterprise", "audit", "sla", "sso", "security", "rbac", "governance", "compliance", "prompts"].includes(key)).map((key) => (
              <Route
                key={key}
                path={`/${key === "apiKeys" ? "api-keys" : key}`}
                element={<ResourcePage resourceKey={key} />}
              />
            ))}
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/logout" element={<LogoutPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
        <footer className="app-footer">
          <span>Enterprise AI operations</span>
          <span className="footer-spacer" />
          <span className="footer-status"><StatusDot status="healthy" /> Console loaded</span>
        </footer>
      </div>
    </div>
  );
}

export default App;