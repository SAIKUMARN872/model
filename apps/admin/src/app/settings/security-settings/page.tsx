
"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  LockKeyhole,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Search,
  Download,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Plus,
  X,
  Ban,
  Globe,
  Server,
  KeyRound,
  Clock3,
  Fingerprint,
  Trash2,
  ChevronRight,
} from "lucide-react";

type Severity = "Critical" | "High" | "Medium" | "Low";
type IncidentStatus = "Open" | "Investigating" | "Resolved" | "Ignored";

type SecurityIncident = {
  id: string;
  title: string;
  category: string;
  severity: Severity;
  status: IncidentStatus;
  source: string;
  time: string;
};

const initialIncidents: SecurityIncident[] = [
  { id: "SEC-2041", title: "Repeated authentication failures", category: "Authentication", severity: "High", status: "Investigating", source: "Identity Service", time: "2026-11-04 09:42" },
  { id: "SEC-2040", title: "Unusual API request volume", category: "API Security", severity: "Medium", status: "Open", source: "AI Gateway", time: "2026-11-04 09:15" },
  { id: "SEC-2039", title: "Expired certificate approaching", category: "Certificates", severity: "Low", status: "Open", source: "Gateway", time: "2026-11-04 08:50" },
  { id: "SEC-2038", title: "Privileged configuration changed", category: "Access Control", severity: "High", status: "Resolved", source: "Admin Console", time: "2026-11-03 17:30" },
  { id: "SEC-2037", title: "Suspicious network origin detected", category: "Network", severity: "Critical", status: "Open", source: "Security Monitor", time: "2026-11-03 15:11" },
];

const initialSecuritySettings = {
  enforceHttps: true,
  secureCookies: true,
  contentSecurityPolicy: true,
  rateLimiting: true,
  ipAllowlistEnabled: false,
  auditLogging: true,
  alertOnCritical: true,
  alertOnFailedLogins: true,
  alertOnPermissionChanges: true,
  encryptStoredData: true,
  encryptBackups: true,
  redactSensitiveLogs: true,
  blockSuspiciousRequests: true,
  requireMfaForAdmins: true,
  sessionProtection: true,
  dependencyMonitoring: true,
  maxRequestsPerMinute: "120",
  maxLoginAttempts: "5",
  sessionIdleMinutes: "30",
  auditRetentionDays: "180",
  allowedIps: "192.0.2.10\n192.0.2.20",
  securityContact: "security@modelnow.ai",
  alertEmail: "admin@modelnow.ai",
};

type SecuritySettings = typeof initialSecuritySettings;

const initialChecklist = [
  { id: "https", title: "HTTPS enforcement", detail: "Redirect HTTP traffic and use secure transport." },
  { id: "mfa", title: "Administrator MFA", detail: "Require strong MFA for privileged accounts." },
  { id: "audit", title: "Audit logging", detail: "Record administrative and security-sensitive events." },
  { id: "encryption", title: "Data encryption", detail: "Protect data at rest and in transit." },
  { id: "dependencies", title: "Dependency monitoring", detail: "Track vulnerable packages and required updates." },
];

export default function SecuritySettingsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [settings, setSettings] = useState<SecuritySettings>(initialSecuritySettings);
  const [incidents, setIncidents] = useState<SecurityIncident[]>(initialIncidents);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [notice, setNotice] = useState("");
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
  const [showIpEditor, setShowIpEditor] = useState(false);
  const [ipDraft, setIpDraft] = useState(initialSecuritySettings.allowedIps);
  const [showContact, setShowContact] = useState(false);

  const filteredIncidents = useMemo(() => {
    const normalized = search.trim().toLowerCase();

    return incidents.filter((incident) => {
      const matchesSearch =
        !normalized ||
        `${incident.id} ${incident.title} ${incident.category} ${incident.source}`
          .toLowerCase()
          .includes(normalized);

      const matchesSeverity =
        severityFilter === "All" || incident.severity === severityFilter;

      const matchesStatus =
        statusFilter === "All" || incident.status === statusFilter;

      return matchesSearch && matchesSeverity && matchesStatus;
    });
  }, [incidents, search, severityFilter, statusFilter]);

  const criticalCount = incidents.filter(
    (incident) => incident.severity === "Critical" && incident.status !== "Resolved" && incident.status !== "Ignored",
  ).length;

  const openCount = incidents.filter(
    (incident) => incident.status === "Open" || incident.status === "Investigating",
  ).length;

  const resolvedCount = incidents.filter(
    (incident) => incident.status === "Resolved",
  ).length;

  const enabledControls = Object.values(settings).filter(
    (value) => value === true,
  ).length;

  const totalControls = Object.values(settings).filter(
    (value) => typeof value === "boolean",
  ).length;

  function updateSetting<K extends keyof SecuritySettings>(
    key: K,
    value: SecuritySettings[K],
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function saveSettings() {
    try {
      localStorage.setItem(
        "modelnow-security-settings",
        JSON.stringify(settings),
      );
      setNotice(
        "Security settings saved in this browser. Connect these controls to backend security services before production use.",
      );
    } catch {
      setNotice("Unable to save security settings in this browser.");
    }
  }

  function resetSettings() {
    setSettings(initialSecuritySettings);
    setIncidents(initialIncidents);
    setSearch("");
    setSeverityFilter("All");
    setStatusFilter("All");
    setNotice("Security settings and incident examples have been reset.");
  }

  function updateIncidentStatus(id: string, status: IncidentStatus) {
    setIncidents((current) =>
      current.map((incident) =>
        incident.id === id ? { ...incident, status } : incident,
      ),
    );

    setSelectedIncident((current) =>
      current?.id === id ? { ...current, status } : current,
    );

    setNotice(`${id} updated to ${status}. This is a local demo change.`);
  }

  function addDemoIncident() {
    const incident: SecurityIncident = {
      id: `SEC-${Date.now().toString().slice(-5)}`,
      title: "New security review required",
      category: "Configuration",
      severity: "Medium",
      status: "Open",
      source: "Admin Console",
      time: new Date().toLocaleString("sv-SE", { hour12: false }).slice(0, 16),
    };

    setIncidents((current) => [incident, ...current]);
    setNotice("Demo security incident created.");
  }

  function exportIncidents() {
    const rows = [
      ["Incident ID", "Title", "Category", "Severity", "Status", "Source", "Time"],
      ...filteredIncidents.map((incident) => [
        incident.id,
        incident.title,
        incident.category,
        incident.severity,
        incident.status,
        incident.source,
        incident.time,
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((value) => `"${String(value).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8;" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-security-incidents.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Security incident list exported.");
  }

  function Metric({
    title,
    value,
    detail,
    icon,
    tone,
  }: {
    title: string;
    value: string | number;
    detail: string;
    icon: ReactNode;
    tone: string;
  }) {
    return (
      <div className="sec-metric">
        <div className={`sec-metric-icon ${tone}`}>{icon}</div>
        <div className="sec-metric-content">
          <p>{title}</p>
          <strong>{value}</strong>
          <small>{detail}</small>
        </div>
      </div>
    );
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
      <div className="sec-toggle">
        <div>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={title}
          className={`sec-switch ${checked ? "on" : ""}`}
          onClick={() => onChange(!checked)}
        />
      </div>
    );
  }

  return (
    <main className="sec-page">
      <style>{`
        .sec-page{min-height:100vh;padding:30px;background:#f7f8fc;color:#202a40;font-family:Arial,Helvetica,sans-serif}
        .sec-container{max-width:1300px;margin:0 auto}
        .sec-breadcrumb{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:22px;color:#858da0;font-size:13px}
        .sec-breadcrumb a{color:#5265d9;text-decoration:none}
        .sec-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:25px}
        .sec-heading-main{display:flex;align-items:center;gap:14px}
        .sec-heading-icon{display:grid;place-items:center;width:50px;height:50px;flex-shrink:0;border-radius:14px;background:#e9edff;color:#5265d9}
        .sec-heading h1{margin:0 0 7px;font-size:27px;letter-spacing:-.6px}
        .sec-heading p{max-width:740px;margin:0;color:#7e8799;font-size:13px;line-height:1.7}
        .sec-actions{display:flex;flex-wrap:wrap;gap:9px}
        .sec-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:39px;padding:0 13px;border:1px solid #dfe4ed;border-radius:9px;background:white;color:#414c64;font-size:12px;font-weight:600;cursor:pointer}
        .sec-btn.primary{background:#5265d9;border-color:#5265d9;color:white}
        .sec-btn.danger{color:#c24141}
        .sec-btn:disabled{opacity:.45;cursor:not-allowed}
        .sec-notice{display:flex;align-items:flex-start;gap:10px;margin-bottom:18px;padding:13px 15px;border:1px solid #dce4ff;border-radius:10px;background:#f0f3ff;color:#4055b5;font-size:12px;line-height:1.6}
        .sec-alert{display:flex;gap:12px;margin-bottom:20px;padding:15px;border:1px solid #f2d5d5;border-radius:11px;background:#fff5f5;color:#a53c3c;font-size:12px;line-height:1.7}
        .sec-alert strong{display:block;margin-bottom:4px}
        .sec-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:22px}
        .sec-metric{display:flex;gap:13px;padding:19px;border:1px solid #e7eaf1;border-radius:12px;background:white}
        .sec-metric-icon{display:grid;place-items:center;width:41px;height:41px;flex-shrink:0;border-radius:10px;background:#edf0ff;color:#5265d9}
        .sec-metric-icon.green{background:#e8f8ef;color:#258452}
        .sec-metric-icon.orange{background:#fff5df;color:#a36e12}
        .sec-metric-icon.red{background:#fff0f0;color:#c24141}
        .sec-metric-icon.teal{background:#e8f8f7;color:#16857d}
        .sec-metric-content p{margin:2px 0 7px;color:#818a9c;font-size:11px}
        .sec-metric-content strong{font-size:23px}
        .sec-metric-content small{display:block;margin-top:6px;color:#929aab;font-size:10px;line-height:1.5}
        .sec-tabs{display:flex;flex-wrap:wrap;gap:6px;padding:6px;margin-bottom:18px;border:1px solid #e7eaf1;border-radius:11px;background:white}
        .sec-tab{display:inline-flex;align-items:center;gap:8px;padding:11px 14px;border:0;border-radius:7px;background:transparent;color:#6f7890;font-size:12px;font-weight:600;cursor:pointer}
        .sec-tab.active{background:#edf0ff;color:#485dd0}
        .sec-card{overflow:hidden;margin-bottom:18px;border:1px solid #e7eaf1;border-radius:13px;background:white;box-shadow:0 2px 7px rgba(24,36,70,.025)}
        .sec-card-header{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:20px 22px;border-bottom:1px solid #edf0f5}
        .sec-card-header h2{margin:0 0 6px;font-size:15px}
        .sec-card-header p{margin:0;color:#858da0;font-size:12px;line-height:1.6}
        .sec-toggle{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:17px 22px;border-bottom:1px solid #edf0f5}
        .sec-toggle:last-child{border-bottom:0}
        .sec-toggle strong{display:block;margin-bottom:5px;font-size:12px}
        .sec-toggle p{margin:0;color:#858da0;font-size:11px;line-height:1.6}
        .sec-switch{position:relative;width:38px;height:22px;flex:0 0 auto;padding:0;border:0;border-radius:20px;background:#cbd1dd;cursor:pointer}
        .sec-switch.on{background:#5265d9}
        .sec-switch:after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:white;transition:transform .15s ease}
        .sec-switch.on:after{transform:translateX(16px)}
        .sec-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:17px;padding:22px}
        .sec-field{display:flex;flex-direction:column;gap:8px;min-width:0}
        .sec-field label{color:#39445a;font-size:12px;font-weight:700}
        .sec-field input,.sec-field select,.sec-field textarea{width:100%;box-sizing:border-box;padding:0 12px;border:1px solid #dfe4ed;border-radius:8px;outline:none;background:white;color:#202a40;font:inherit;font-size:12px}
        .sec-field input,.sec-field select{height:42px}
        .sec-field textarea{min-height:100px;padding:12px;resize:vertical;line-height:1.6}
        .sec-field input:focus,.sec-field select:focus,.sec-field textarea:focus{border-color:#8290ed;box-shadow:0 0 0 3px #edf0ff}
        .sec-field small{color:#8991a2;font-size:11px;line-height:1.6}
        .sec-field.full{grid-column:1/-1}
        .sec-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:16px 22px;border-bottom:1px solid #edf0f5}
        .sec-search{position:relative;flex:1 1 220px;min-width:180px}
        .sec-search svg{position:absolute;top:12px;left:12px;color:#929bad}
        .sec-search input{width:100%;box-sizing:border-box;height:40px;padding:0 12px 0 37px;border:1px solid #dfe4ed;border-radius:8px;outline:none;font-size:12px}
        .sec-filter{height:40px;min-width:130px;padding:0 12px;border:1px solid #dfe4ed;border-radius:8px;background:white;color:#4b566d;font-size:12px}
        .sec-table-wrap{overflow-x:auto}
        .sec-table{width:100%;border-collapse:collapse;text-align:left;white-space:nowrap}
        .sec-table th{padding:14px 15px;background:#fafbfe;color:#7f889a;font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase}
        .sec-table td{padding:15px;border-top:1px solid #edf0f5;color:#4b566d;font-size:12px}
        .sec-table strong{color:#263149}
        .sec-subtext{margin-top:5px;color:#8991a2;font-size:10px}
        .sec-badge{display:inline-flex;align-items:center;gap:5px;padding:5px 9px;border-radius:20px;background:#f0f1f5;color:#697386;font-size:10px;font-weight:700}
        .sec-badge.critical{background:#ffe7e7;color:#b72d2d}
        .sec-badge.high{background:#fff0e5;color:#b9571a}
        .sec-badge.medium{background:#fff5df;color:#9a6a12}
        .sec-badge.low{background:#eaf9f0;color:#218552}
        .sec-badge.open{background:#fff0e5;color:#b9571a}
        .sec-badge.investigating{background:#edf0ff;color:#485dd0}
        .sec-badge.resolved{background:#eaf9f0;color:#218552}
        .sec-badge.ignored{background:#f0f1f5;color:#697386}
        .sec-row-action{display:inline-flex;align-items:center;gap:5px;border:0;background:transparent;color:#5265d9;font-size:11px;font-weight:700;cursor:pointer}
        .sec-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 22px;border-top:1px solid #edf0f5;color:#858da0;font-size:11px}
        .sec-checklist{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:20px}
        .sec-check{display:flex;gap:12px;padding:15px;border:1px solid #e7eaf1;border-radius:10px}
        .sec-check-icon{display:grid;place-items:center;width:30px;height:30px;flex-shrink:0;border-radius:8px;background:#e8f8ef;color:#258452}
        .sec-check strong{display:block;margin-bottom:5px;font-size:12px}
        .sec-check p{margin:0;color:#858da0;font-size:11px;line-height:1.6}
        .sec-mini-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;padding:22px}
        .sec-mini{padding:16px;border:1px solid #e7eaf1;border-radius:10px}
        .sec-mini svg{margin-bottom:12px;color:#5265d9}
        .sec-mini strong{display:block;margin-bottom:6px;font-size:12px}
        .sec-mini p{margin:0;color:#858da0;font-size:11px;line-height:1.6}
        .sec-empty{padding:42px 20px;text-align:center;color:#858da0;font-size:13px}
        .sec-modal-backdrop{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:20px;background:rgba(20,28,48,.45)}
        .sec-modal{width:100%;max-width:590px;max-height:90vh;overflow:auto;border:1px solid #e7eaf1;border-radius:15px;background:white;box-shadow:0 20px 70px rgba(20,28,48,.2)}
        .sec-modal-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px 22px;border-bottom:1px solid #edf0f5}
        .sec-modal-header h2{margin:0;font-size:17px}
        .sec-modal-body{padding:22px}
        .sec-detail-row{display:flex;justify-content:space-between;gap:18px;padding:13px 0;border-bottom:1px solid #edf0f5;font-size:12px}
        .sec-detail-row span{color:#858da0}
        .sec-detail-row strong{text-align:right;overflow-wrap:anywhere}
        @media(max-width:1050px){.sec-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.sec-mini-grid{grid-template-columns:1fr}.sec-checklist{grid-template-columns:1fr}}
        @media(max-width:650px){.sec-page{padding:18px 12px}.sec-heading{flex-direction:column}.sec-heading h1{font-size:23px}.sec-actions{width:100%}.sec-btn{flex:1}.sec-tabs{overflow-x:auto;flex-wrap:nowrap}.sec-tab{white-space:nowrap}.sec-grid{grid-template-columns:1fr}.sec-field.full{grid-column:auto}.sec-footer{align-items:flex-start;flex-direction:column}}
      `}</style>

      <div className="sec-container">
        <div className="sec-breadcrumb">
          <a href="/dashboard">Admin</a><span>/</span>
          <a href="/settings">Settings</a><span>/</span>
          <span>Security Settings</span>
        </div>

        <header className="sec-heading">
          <div className="sec-heading-main">
            <div className="sec-heading-icon"><ShieldCheck size={24} /></div>
            <div>
              <h1>Security Settings</h1>
              <p>Configure platform security controls, incident response, encryption policies, network restrictions, and audit monitoring.</p>
            </div>
          </div>
          <div className="sec-actions">
            <button type="button" className="sec-btn" onClick={resetSettings}><RefreshCw size={14} />Reset Demo</button>
            <button type="button" className="sec-btn" onClick={exportIncidents}><Download size={14} />Export Incidents</button>
            <button type="button" className="sec-btn primary" onClick={saveSettings}><Save size={14} />Save Settings</button>
          </div>
        </header>

        {notice && (
          <div className="sec-notice" role="status">
            <CheckCircle2 size={17} />
            <span style={{ flex: 1 }}>{notice}</span>
            <button type="button" className="sec-btn" onClick={() => setNotice("")}><X size={14} /></button>
          </div>
        )}

        {criticalCount > 0 && (
          <div className="sec-alert">
            <ShieldAlert size={20} />
            <div>
              <strong>{criticalCount} critical security incident{criticalCount > 1 ? "s" : ""} require attention</strong>
              Review open incidents and follow your organization's incident response process. These are illustrative demo records, not live detections.
            </div>
          </div>
        )}

        <section className="sec-metrics">
          <Metric title="Open Incidents" value={openCount} detail="Open or under investigation" icon={<Activity size={19} />} tone="orange" />
          <Metric title="Critical Alerts" value={criticalCount} detail="Unresolved critical examples" icon={<ShieldAlert size={19} />} tone="red" />
          <Metric title="Resolved Incidents" value={resolvedCount} detail="Resolved demo records" icon={<CheckCircle2 size={19} />} tone="green" />
          <Metric title="Controls Enabled" value={`${enabledControls}/${totalControls}`} detail="Boolean settings switched on" icon={<ShieldCheck size={19} />} tone="teal" />
        </section>

        <div className="sec-tabs">
          <button type="button" className={`sec-tab ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}><Activity size={15} />Overview</button>
          <button type="button" className={`sec-tab ${activeTab === "protection" ? "active" : ""}`} onClick={() => setActiveTab("protection")}><ShieldCheck size={15} />Protection</button>
          <button type="button" className={`sec-tab ${activeTab === "network" ? "active" : ""}`} onClick={() => setActiveTab("network")}><Globe size={15} />Network Security</button>
          <button type="button" className={`sec-tab ${activeTab === "data" ? "active" : ""}`} onClick={() => setActiveTab("data")}><LockKeyhole size={15} />Data Protection</button>
          <button type="button" className={`sec-tab ${activeTab === "alerts" ? "active" : ""}`} onClick={() => setActiveTab("alerts")}><AlertTriangle size={15} />Alerts &amp; Audit</button>
          <button type="button" className={`sec-tab ${activeTab === "incidents" ? "active" : ""}`} onClick={() => setActiveTab("incidents")}><Activity size={15} />Incidents</button>
        </div>

        {activeTab === "overview" && (
          <>
            <section className="sec-card">
              <div className="sec-card-header">
                <div><h2>Security Posture</h2><p>Summary of the platform's configurable security controls.</p></div>
                <ShieldCheck size={21} color="#5265d9" />
              </div>
              <div className="sec-checklist">
                {initialChecklist.map((item) => (
                  <div className="sec-check" key={item.id}>
                    <div className={`sec-check-icon ${item.id === "mfa" && !settings.requireMfaForAdmins ? "" : ""}`}>
                      {(
                        item.id === "https" ? settings.enforceHttps :
                        item.id === "mfa" ? settings.requireMfaForAdmins :
                        item.id === "audit" ? settings.auditLogging :
                        item.id === "encryption" ? settings.encryptStoredData :
                        settings.dependencyMonitoring
                      ) ? <CheckCircle2 size={17} /> : <AlertTriangle size={17} />}
                    </div>
                    <div><strong>{item.title}</strong><p>{item.detail}</p></div>
                  </div>
                ))}
              </div>
              <div className="sec-footer"><span>Posture reflects the current frontend settings only.</span><button type="button" className="sec-btn primary" onClick={() => setActiveTab("protection")}>Review Controls <ChevronRight size={14} /></button></div>
            </section>

            <section className="sec-card">
              <div className="sec-card-header"><div><h2>Security Domains</h2><p>Navigate to the controls for each security domain.</p></div></div>
              <div className="sec-mini-grid">
                <div className="sec-mini"><LockKeyhole size={20} /><strong>Application Protection</strong><p>HTTPS, secure cookies, content security policy, and request throttling.</p><button type="button" className="sec-row-action" onClick={() => setActiveTab("protection")}>Configure <ChevronRight size={13} /></button></div>
                <div className="sec-mini"><Globe size={20} /><strong>Network Security</strong><p>IP allowlists and request-rate thresholds for incoming traffic.</p><button type="button" className="sec-row-action" onClick={() => setActiveTab("network")}>Configure <ChevronRight size={13} /></button></div>
                <div className="sec-mini"><KeyRound size={20} /><strong>Data Protection</strong><p>Encryption, log redaction, backup protection, and data handling.</p><button type="button" className="sec-row-action" onClick={() => setActiveTab("data")}>Configure <ChevronRight size={13} /></button></div>
              </div>
            </section>

            <section className="sec-card">
              <div className="sec-card-header">
                <div><h2>Recent Security Incidents</h2><p>Latest illustrative alerts from the demo incident feed.</p></div>
                <button type="button" className="sec-btn" onClick={() => setActiveTab("incidents")}>View All <ChevronRight size={14} /></button>
              </div>
              <div className="sec-table-wrap">
                <table className="sec-table">
                  <thead><tr><th>Incident</th><th>Severity</th><th>Status</th><th>Source</th><th>Time</th><th></th></tr></thead>
                  <tbody>
                    {incidents.slice(0, 4).map((incident) => (
                      <tr key={incident.id}>
                        <td><strong>{incident.title}</strong><div className="sec-subtext">{incident.id} · {incident.category}</div></td>
                        <td><span className={`sec-badge ${incident.severity.toLowerCase()}`}>{incident.severity}</span></td>
                        <td><span className={`sec-badge ${incident.status.toLowerCase()}`}>{incident.status}</span></td>
                        <td>{incident.source}</td>
                        <td>{incident.time}</td>
                        <td><button type="button" className="sec-row-action" onClick={() => setSelectedIncident(incident)}>Details</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {activeTab === "protection" && (
          <section className="sec-card">
            <div className="sec-card-header"><div><h2>Application Security</h2><p>Manage common application-layer protection settings.</p></div><ShieldCheck size={21} color="#5265d9" /></div>
            <Toggle title="Enforce HTTPS" description="Require encrypted transport and redirect unencrypted requests at the edge." checked={settings.enforceHttps} onChange={(value) => updateSetting("enforceHttps", value)} />
            <Toggle title="Secure Cookies" description="Use Secure, HttpOnly, and appropriate SameSite cookie attributes." checked={settings.secureCookies} onChange={(value) => updateSetting("secureCookies", value)} />
            <Toggle title="Content Security Policy" description="Configure a restrictive CSP header to help reduce script injection risk." checked={settings.contentSecurityPolicy} onChange={(value) => updateSetting("contentSecurityPolicy", value)} />
            <Toggle title="Rate Limiting" description="Limit abusive request patterns and protect API and login endpoints." checked={settings.rateLimiting} onChange={(value) => updateSetting("rateLimiting", value)} />
            <Toggle title="Block Suspicious Requests" description="Use server-side detection rules to challenge or block malicious traffic." checked={settings.blockSuspiciousRequests} onChange={(value) => updateSetting("blockSuspiciousRequests", value)} />
            <Toggle title="Administrator MFA" description="Require multi-factor authentication for privileged accounts." checked={settings.requireMfaForAdmins} onChange={(value) => updateSetting("requireMfaForAdmins", value)} />
            <Toggle title="Session Protection" description="Apply secure session expiration, rotation, and invalidation rules." checked={settings.sessionProtection} onChange={(value) => updateSetting("sessionProtection", value)} />
            <div className="sec-footer"><span>Security headers and session controls must be applied server-side.</span><button type="button" className="sec-btn primary" onClick={saveSettings}><Save size={14} />Save Controls</button></div>
          </section>
        )}

        {activeTab === "network" && (
          <>
            <section className="sec-card">
              <div className="sec-card-header"><div><h2>Network Access Controls</h2><p>Configure demo IP allowlisting and request thresholds.</p></div><Globe size={21} color="#5265d9" /></div>
              <Toggle title="Enable IP Allowlist" description="Restrict selected privileged routes to explicitly approved source IP addresses. Ensure you retain an emergency access path." checked={settings.ipAllowlistEnabled} onChange={(value) => updateSetting("ipAllowlistEnabled", value)} />
              <div className="sec-grid">
                <div className="sec-field"><label htmlFor="maxRequestsPerMinute">Maximum Requests Per Minute</label><input id="maxRequestsPerMinute" type="number" min="1" max="100000" value={settings.maxRequestsPerMinute} onChange={(event) => updateSetting("maxRequestsPerMinute", event.target.value)} /><small>Configure rate limits by route, user, and API key on the server.</small></div>
                <div className="sec-field"><label htmlFor="maxLoginAttempts">Maximum Login Attempts</label><input id="maxLoginAttempts" type="number" min="1" max="100" value={settings.maxLoginAttempts} onChange={(event) => updateSetting("maxLoginAttempts", event.target.value)} /></div>
              </div>
              <div className="sec-grid" style={{ paddingTop: 0 }}>
                <div className="sec-field full"><label>Allowed IP Addresses</label><textarea readOnly value={settings.allowedIps} /><small>IP list is read-only here. Use Edit Allowlist to modify the demo values.</small></div>
              </div>
              <div className="sec-footer"><span>{settings.ipAllowlistEnabled ? "IP allowlisting is enabled in demo settings." : "IP allowlisting is disabled in demo settings."}</span><button type="button" className="sec-btn primary" onClick={() => { setIpDraft(settings.allowedIps); setShowIpEditor(true); }}><Plus size={14} />Edit Allowlist</button></div>
            </section>

            <section className="sec-card">
              <div className="sec-card-header"><div><h2>Network Security Guidance</h2><p>Operational controls recommended for deployment.</p></div><Server size={21} color="#5265d9" /></div>
              <div className="sec-toggle"><div><strong>Apply limits at the API gateway</strong><p>Use distributed rate limiting so thresholds remain consistent across instances.</p></div><CheckCircle2 size={18} color="#258452" /></div>
              <div className="sec-toggle"><div><strong>Validate trusted proxy headers</strong><p>Only trust forwarded IP headers from known load balancers or proxies.</p></div><CheckCircle2 size={18} color="#258452" /></div>
              <div className="sec-toggle"><div><strong>Prevent accidental lockout</strong><p>Test allowlist updates and preserve a documented emergency access route.</p></div><CheckCircle2 size={18} color="#258452" /></div>
            </section>
          </>
        )}

        {activeTab === "data" && (
          <section className="sec-card">
            <div className="sec-card-header"><div><h2>Data Protection Controls</h2><p>Configure the intended protections for sensitive platform data.</p></div><LockKeyhole size={21} color="#5265d9" /></div>
            <Toggle title="Encrypt Stored Data" description="Use managed encryption at rest for databases, file stores, and persistent volumes." checked={settings.encryptStoredData} onChange={(value) => updateSetting("encryptStoredData", value)} />
            <Toggle title="Encrypt Backups" description="Encrypt backups and snapshots with managed keys and controlled access." checked={settings.encryptBackups} onChange={(value) => updateSetting("encryptBackups", value)} />
            <Toggle title="Redact Sensitive Logs" description="Mask credentials, tokens, personal data, and sensitive prompt content in logs." checked={settings.redactSensitiveLogs} onChange={(value) => updateSetting("redactSensitiveLogs", value)} />
            <div className="sec-grid">
              <div className="sec-field"><label htmlFor="auditRetentionDays">Audit Log Retention (days)</label><input id="auditRetentionDays" type="number" min="1" max="3650" value={settings.auditRetentionDays} onChange={(event) => updateSetting("auditRetentionDays", event.target.value)} /><small>Align retention with contractual, operational, and legal requirements.</small></div>
              <div className="sec-field"><label>Key Management</label><input readOnly value="Managed KMS recommended" /><small>Do not store encryption keys alongside encrypted data.</small></div>
            </div>
            <div className="sec-footer"><span>Encryption requires infrastructure, database, and storage configuration.</span><button type="button" className="sec-btn primary" onClick={saveSettings}><Save size={14} />Save Data Controls</button></div>
          </section>
        )}

        {activeTab === "alerts" && (
          <>
            <section className="sec-card">
              <div className="sec-card-header"><div><h2>Security Alert Rules</h2><p>Configure which events should generate security notifications.</p></div><AlertTriangle size={21} color="#5265d9" /></div>
              <Toggle title="Audit Logging" description="Record administrative actions, permission changes, and security configuration updates." checked={settings.auditLogging} onChange={(value) => updateSetting("auditLogging", value)} />
              <Toggle title="Alert on Critical Incidents" description="Notify the configured security contact when critical incidents are detected." checked={settings.alertOnCritical} onChange={(value) => updateSetting("alertOnCritical", value)} />
              <Toggle title="Alert on Failed Logins" description="Notify security operators when sign-in failures exceed configured thresholds." checked={settings.alertOnFailedLogins} onChange={(value) => updateSetting("alertOnFailedLogins", value)} />
              <Toggle title="Alert on Permission Changes" description="Record and alert on changes to roles, access policies, and privileged permissions." checked={settings.alertOnPermissionChanges} onChange={(value) => updateSetting("alertOnPermissionChanges", value)} />
              <Toggle title="Dependency Monitoring" description="Monitor dependency vulnerability reports and surface high-risk package updates." checked={settings.dependencyMonitoring} onChange={(value) => updateSetting("dependencyMonitoring", value)} />
              <div className="sec-grid">
                <div className="sec-field"><label htmlFor="securityContact">Security Contact</label><input id="securityContact" type="email" value={settings.securityContact} onChange={(event) => updateSetting("securityContact", event.target.value)} /></div>
                <div className="sec-field"><label htmlFor="alertEmail">Alert Recipient</label><input id="alertEmail" type="email" value={settings.alertEmail} onChange={(event) => updateSetting("alertEmail", event.target.value)} /></div>
              </div>
              <div className="sec-footer"><span>Validate recipients and configure delivery in the notification service.</span><button type="button" className="sec-btn primary" onClick={saveSettings}><Save size={14} />Save Alert Rules</button></div>
            </section>
          </>
        )}

        {activeTab === "incidents" && (
          <section className="sec-card">
            <div className="sec-card-header">
              <div><h2>Security Incidents</h2><p>Search, filter, and manage the illustrative incident queue.</p></div>
              <button type="button" className="sec-btn primary" onClick={addDemoIncident}><Plus size={14} />Add Demo Incident</button>
            </div>
            <div className="sec-toolbar">
              <div className="sec-search"><Search size={16} /><input aria-label="Search incidents" placeholder="Search incident, category, source..." value={search} onChange={(event) => setSearch(event.target.value)} /></div>
              <select className="sec-filter" aria-label="Filter incident severity" value={severityFilter} onChange={(event) => setSeverityFilter(event.target.value)}>
                <option value="All">All severities</option><option value="Critical">Critical</option><option value="High">High</option><option value="Medium">Medium</option><option value="Low">Low</option>
              </select>
              <select className="sec-filter" aria-label="Filter incident status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="All">All statuses</option><option value="Open">Open</option><option value="Investigating">Investigating</option><option value="Resolved">Resolved</option><option value="Ignored">Ignored</option>
              </select>
              <button type="button" className="sec-btn" onClick={exportIncidents}><Download size={14} />Export CSV</button>
            </div>
            <div className="sec-table-wrap">
              <table className="sec-table">
                <thead><tr><th>Incident</th><th>Category</th><th>Severity</th><th>Status</th><th>Source</th><th>Detected</th><th>Action</th></tr></thead>
                <tbody>
                  {filteredIncidents.map((incident) => (
                    <tr key={incident.id}>
                      <td><strong>{incident.title}</strong><div className="sec-subtext">{incident.id}</div></td>
                      <td>{incident.category}</td>
                      <td><span className={`sec-badge ${incident.severity.toLowerCase()}`}>{incident.severity}</span></td>
                      <td><span className={`sec-badge ${incident.status.toLowerCase()}`}>{incident.status}</span></td>
                      <td>{incident.source}</td>
                      <td>{incident.time}</td>
                      <td><button type="button" className="sec-row-action" onClick={() => setSelectedIncident(incident)}>Review <ChevronRight size={13} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredIncidents.length === 0 && <div className="sec-empty">No incidents match the selected filters.</div>}
            </div>
            <div className="sec-footer"><span>Showing {filteredIncidents.length} of {incidents.length} demo incidents.</span><span>Connect a real security event source for live incident data.</span></div>
          </section>
        )}

        <div className="sec-footer" style={{ padding: "12px 0 30px, ", borderTop: 0 }}>
          <span>ModelNow Admin · Security Settings</span>
          <button type="button" className="sec-btn primary" onClick={saveSettings}><Save size={14} />Save All Changes</button>
        </div>
      </div>

      {showIpEditor && (
        <div className="sec-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowIpEditor(false); }}>
          <section className="sec-modal" role="dialog" aria-modal="true" aria-labelledby="sec-ip-title">
            <div className="sec-modal-header">
              <h2 id="sec-ip-title">Edit IP Allowlist</h2>
              <button type="button" className="sec-btn" aria-label="Close IP editor" onClick={() => setShowIpEditor(false)}><X size={14} /></button>
            </div>
            <div className="sec-modal-body">
              <div className="sec-field">
                <label htmlFor="ipDraft">Allowed IP addresses</label>
                <textarea id="ipDraft" value={ipDraft} onChange={(event) => setIpDraft(event.target.value)} placeholder={"192.0.2.10\n192.0.2.20"} />
                <small>Enter one IP address or CIDR range per line. Validate entries on the server before applying real access restrictions.</small>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 22 }}>
                <button type="button" className="sec-btn" onClick={() => setShowIpEditor(false)}>Cancel</button>
                <button type="button" className="sec-btn primary" onClick={() => {
                  updateSetting("allowedIps", ipDraft);
                  setShowIpEditor(false);
                  setNotice("IP allowlist updated in demo settings only.");
                }}><Save size={14} />Save Allowlist</button>
              </div>
            </div>
          </section>
        </div>
      )}

      {selectedIncident && (
        <div className="sec-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedIncident(null); }}>
          <section className="sec-modal" role="dialog" aria-modal="true" aria-labelledby="sec-incident-title">
            <div className="sec-modal-header">
              <div><h2 id="sec-incident-title">{selectedIncident.title}</h2><div className="sec-subtext">{selectedIncident.id}</div></div>
              <button type="button" className="sec-btn" aria-label="Close incident details" onClick={() => setSelectedIncident(null)}><X size={14} /></button>
            </div>
            <div className="sec-modal-body">
              <div className="sec-detail-row"><span>Category</span><strong>{selectedIncident.category}</strong></div>
              <div className="sec-detail-row"><span>Severity</span><strong><span className={`sec-badge ${selectedIncident.severity.toLowerCase()}`}>{selectedIncident.severity}</span></strong></div>
              <div className="sec-detail-row"><span>Status</span><strong><span className={`sec-badge ${selectedIncident.status.toLowerCase()}`}>{selectedIncident.status}</span></strong></div>
              <div className="sec-detail-row"><span>Source</span><strong>{selectedIncident.source}</strong></div>
              <div className="sec-detail-row"><span>Detected at</span><strong>{selectedIncident.time}</strong></div>
              <div style={{ marginTop: 22 }}>
                <label htmlFor="incidentStatus" style={{ display: "block", marginBottom: 8, fontSize: 12, fontWeight: 700 }}>Update incident status</label>
                <select id="incidentStatus" className="sec-filter" style={{ width: "100%" }} value={selectedIncident.status} onChange={(event) => updateIncidentStatus(selectedIncident.id, event.target.value as IncidentStatus)}>
                  <option value="Open">Open</option><option value="Investigating">Investigating</option><option value="Resolved">Resolved</option><option value="Ignored">Ignored</option>
                </select>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 22 }}>
                <button type="button" className="sec-btn" onClick={() => setSelectedIncident(null)}>Close</button>
                <button type="button" className="sec-btn primary" onClick={() => { updateIncidentStatus(selectedIncident.id, "Resolved"); setSelectedIncident(null); }}><CheckCircle2 size={14} />Mark Resolved</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
