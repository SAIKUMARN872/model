
"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Activity,
  ShieldCheck,
  LockKeyhole,
  Database,
  FileText,
  Search,
  Download,
  Save,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  X,
  Clock,
  UserRound,
  Plus,
  ChevronRight,
  Fingerprint,
  CircleHelp,
} from "lucide-react";

type DataRequestStatus = "Pending" | "Processing" | "Completed" | "Rejected";
type DataRequestType = "Export" | "Deletion" | "Correction" | "Access";

type DataRequest = {
  id: string;
  user: string;
  type: DataRequestType;
  status: DataRequestStatus;
  submitted: string;
  dueDate: string;
};

const initialRequests: DataRequest[] = [
  { id: "DSR-1042", user: "user@example.com", type: "Export", status: "Pending", submitted: "2026-11-04", dueDate: "2026-11-18" },
  { id: "DSR-1041", user: "customer@example.com", type: "Deletion", status: "Processing", submitted: "2026-11-03", dueDate: "2026-11-17" },
  { id: "DSR-1040", user: "member@example.com", type: "Access", status: "Completed", submitted: "2026-11-02", dueDate: "2026-11-16" },
  { id: "DSR-1039", user: "sample@example.com", type: "Correction", status: "Pending", submitted: "2026-11-01", dueDate: "2026-11-15" },
  { id: "DSR-1038", user: "former@example.com", type: "Deletion", status: "Completed", submitted: "2026-10-30", dueDate: "2026-11-13" },
];

const initialSettings = {
  dataEncryption: true,
  redactPersonalData: true,
  allowDataExport: true,
  allowAccountDeletion: true,
  consentRequired: true,
  analyticsOptIn: false,
  modelTrainingOptIn: false,
  retainConversationHistory: true,
  retainAuditLogs: true,
  anonymizeUsageAnalytics: true,
  deleteUploadedFiles: true,
  maskApiCredentials: true,
  allowCookiePreferences: true,
  notifyOnDataRequest: true,
  requireDeletionApproval: true,
  restrictSensitiveDataAccess: true,
  conversationRetentionDays: "90",
  auditRetentionDays: "180",
  uploadedFileRetentionDays: "30",
  analyticsRetentionDays: "90",
  privacyContact: "privacy@modelnow.ai",
  dataRegion: "India",
  deletionGracePeriodDays: "30",
};

type PrivacySettings = typeof initialSettings;

const inventory = [
  { name: "Account Information", category: "Identity", description: "Email, account identifiers, profile preferences", retention: "Account lifetime", classification: "Personal" },
  { name: "Conversation History", category: "Content", description: "User prompts, assistant responses, conversation metadata", retention: "Configurable", classification: "Sensitive" },
  { name: "Uploaded Files", category: "Content", description: "Documents and other files submitted by users", retention: "Configurable", classification: "Sensitive" },
  { name: "Usage Analytics", category: "Analytics", description: "Feature usage, request counts, latency metrics", retention: "Configurable", classification: "Internal" },
  { name: "Audit Events", category: "Security", description: "Administrative actions and access-related events", retention: "Configurable", classification: "Restricted" },
  { name: "API Credentials", category: "Security", description: "API key metadata and credential references", retention: "Until revoked", classification: "Restricted" },
];

const tabs = [
  { id: "overview", label: "Overview", icon: Activity },
  { id: "retention", label: "Data Retention", icon: Clock },
  { id: "consent", label: "Consent & Preferences", icon: Fingerprint },
  { id: "inventory", label: "Data Inventory", icon: Database },
  { id: "requests", label: "Data Requests", icon: FileText },
  { id: "protection", label: "Data Protection", icon: LockKeyhole },
];

function Metric({
  title,
  value,
  detail,
  icon,
  tone = "",
}: {
  title: string;
  value: string | number;
  detail: string;
  icon: ReactNode;
  tone?: string;
}) {
  return (
    <div className="priv-metric">
      <div className={`priv-metric-icon ${tone}`}>{icon}</div>
      <div>
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
    <div className="priv-toggle">
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        className={`priv-switch ${checked ? "on" : ""}`}
        onClick={() => onChange(!checked)}
      />
    </div>
  );
}

function exportCSV(filename: string, rows: (string | number)[][]) {
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
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function PrivacyDataSettingsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [settings, setSettings] = useState<PrivacySettings>(initialSettings);
  const [requests, setRequests] = useState<DataRequest[]>(initialRequests);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [notice, setNotice] = useState("");
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [requestDraft, setRequestDraft] = useState({
    user: "",
    type: "Access" as DataRequestType,
  });
  const [selectedRequest, setSelectedRequest] = useState<DataRequest | null>(null);
  const [inventorySearch, setInventorySearch] = useState("");

  const filteredRequests = useMemo(() => {
    const term = search.trim().toLowerCase();
    return requests.filter((request) => {
      const matchesSearch =
        !term ||
        `${request.id} ${request.user} ${request.type}`.toLowerCase().includes(term);
      return (
        matchesSearch &&
        (statusFilter === "All" || request.status === statusFilter) &&
        (typeFilter === "All" || request.type === typeFilter)
      );
    });
  }, [requests, search, statusFilter, typeFilter]);

  const filteredInventory = useMemo(() => {
    const term = inventorySearch.trim().toLowerCase();
    return inventory.filter((item) =>
      `${item.name} ${item.category} ${item.description} ${item.classification}`
        .toLowerCase()
        .includes(term),
    );
  }, [inventorySearch]);

  const pendingRequests = requests.filter((r) => r.status === "Pending").length;
  const processingRequests = requests.filter((r) => r.status === "Processing").length;
  const completedRequests = requests.filter((r) => r.status === "Completed").length;
  const enabledControls = Object.values(settings).filter((v) => v === true).length;
  const totalControls = Object.values(settings).filter((v) => typeof v === "boolean").length;

  function updateSetting<K extends keyof PrivacySettings>(
    key: K,
    value: PrivacySettings[K],
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function saveSettings() {
    try {
      localStorage.setItem("modelnow-privacy-data-settings", JSON.stringify(settings));
      setNotice("Settings saved in this browser. Backend enforcement is required before production use.");
    } catch {
      setNotice("Unable to save settings in this browser.");
    }
  }

  function resetDemo() {
    setSettings({ ...initialSettings });
    setRequests([...initialRequests]);
    setSearch("");
    setInventorySearch("");
    setStatusFilter("All");
    setTypeFilter("All");
    setNotice("Privacy settings and sample requests have been reset.");
  }

  function createRequest() {
    const email = requestDraft.user.trim();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setNotice("Enter a valid email address.");
      return;
    }

    const today = new Date();
    const due = new Date(today);
    due.setDate(due.getDate() + 14);

    const formatDate = (date: Date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

    const request: DataRequest = {
      id: `DSR-${Date.now().toString().slice(-6)}`,
      user: email,
      type: requestDraft.type,
      status: "Pending",
      submitted: formatDate(today),
      dueDate: formatDate(due),
    };

    setRequests((current) => [request, ...current]);
    setShowRequestModal(false);
    setRequestDraft({ user: "", type: "Access" });
    setNotice(`${request.id} created as a demo request. No real user data was accessed.`);
  }

  function updateRequestStatus(id: string, status: DataRequestStatus) {
    setRequests((current) =>
      current.map((request) => request.id === id ? { ...request, status } : request),
    );
    setSelectedRequest((current) =>
      current?.id === id ? { ...current, status } : current,
    );
    setNotice(`${id} updated to ${status} in the demo interface.`);
  }

  function exportRequests() {
    exportCSV("modelnow-data-requests.csv", [
      ["Request ID", "User", "Type", "Status", "Submitted", "Due Date"],
      ...filteredRequests.map((r) => [r.id, r.user, r.type, r.status, r.submitted, r.dueDate]),
    ]);
    setNotice("Data request report exported.");
  }

  function exportInventory() {
    exportCSV("modelnow-data-inventory.csv", [
      ["Data Asset", "Category", "Description", "Retention", "Classification"],
      ...filteredInventory.map((item) => [
        item.name, item.category, item.description, item.retention, item.classification,
      ]),
    ]);
    setNotice("Data inventory exported.");
  }

  const statusBadge = (status: string) => (
    <span className={`priv-badge ${status.toLowerCase()}`}>{status}</span>
  );

  return (
    <main className="priv-page">
      <style>{`
        .priv-page{min-height:100vh;padding:30px;background:#f7f8fc;color:#202a40;font-family:Arial,Helvetica,sans-serif}
        .priv-container{max-width:1300px;margin:0 auto}
        .priv-breadcrumb{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:22px;color:#858da0;font-size:13px}
        .priv-breadcrumb a{color:#5265d9;text-decoration:none}
        .priv-heading{display:flex;align-items:flex-start;justify-content:space-between;gap:18px;margin-bottom:25px}
        .priv-heading-main{display:flex;align-items:center;gap:14px}
        .priv-heading-icon{display:grid;place-items:center;width:50px;height:50px;flex-shrink:0;border-radius:14px;background:#e9edff;color:#5265d9}
        .priv-heading h1{margin:0 0 7px;font-size:27px;letter-spacing:-.6px}
        .priv-heading p{max-width:760px;margin:0;color:#7e8799;font-size:13px;line-height:1.7}
        .priv-actions{display:flex;flex-wrap:wrap;gap:9px}
        .priv-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:39px;padding:0 13px;border:1px solid #dfe4ed;border-radius:9px;background:white;color:#414c64;font-size:12px;font-weight:600;cursor:pointer}
        .priv-btn.primary{background:#5265d9;border-color:#5265d9;color:white}
        .priv-notice,.priv-warning{display:flex;align-items:flex-start;gap:10px;margin-bottom:18px;padding:13px 15px;border:1px solid #dce4ff;border-radius:10px;background:#f0f3ff;color:#4055b5;font-size:12px;line-height:1.7}
        .priv-warning{border-color:#f3dfb1;background:#fff9e9;color:#94651a}
        .priv-warning strong{display:block;margin-bottom:4px}
        .priv-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:22px}
        .priv-metric{display:flex;gap:13px;padding:19px;border:1px solid #e7eaf1;border-radius:12px;background:white}
        .priv-metric-icon{display:grid;place-items:center;width:41px;height:41px;flex-shrink:0;border-radius:10px;background:#edf0ff;color:#5265d9}
        .priv-metric-icon.green{background:#e8f8ef;color:#258452}.priv-metric-icon.orange{background:#fff5df;color:#a36e12}.priv-metric-icon.teal{background:#e8f8f7;color:#16857d}
        .priv-metric p{margin:2px 0 7px;color:#818a9c;font-size:11px}.priv-metric strong{font-size:23px}.priv-metric small{display:block;margin-top:6px;color:#929aab;font-size:10px;line-height:1.5}
        .priv-tabs{display:flex;flex-wrap:wrap;gap:6px;padding:6px;margin-bottom:18px;border:1px solid #e7eaf1;border-radius:11px;background:white}
        .priv-tab{display:inline-flex;align-items:center;gap:8px;padding:11px 14px;border:0;border-radius:7px;background:transparent;color:#6f7890;font-size:12px;font-weight:600;cursor:pointer}
        .priv-tab.active{background:#edf0ff;color:#485dd0}
        .priv-card{overflow:hidden;margin-bottom:18px;border:1px solid #e7eaf1;border-radius:13px;background:white;box-shadow:0 2px 7px #18244608}
        .priv-card-header{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:20px 22px;border-bottom:1px solid #edf0f5}
        .priv-card-header h2{margin:0 0 6px;font-size:15px}.priv-card-header p{margin:0;color:#858da0;font-size:12px;line-height:1.6}
        .priv-toggle{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:17px 22px;border-bottom:1px solid #edf0f5}
        .priv-toggle:last-child{border-bottom:0}.priv-toggle strong{display:block;margin-bottom:5px;font-size:12px}.priv-toggle p{margin:0;color:#858da0;font-size:11px;line-height:1.6}
        .priv-switch{position:relative;width:38px;height:22px;flex:0 0 auto;padding:0;border:0;border-radius:20px;background:#cbd1dd;cursor:pointer}
        .priv-switch.on{background:#5265d9}.priv-switch:after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:white;transition:transform .15s}.priv-switch.on:after{transform:translateX(16px)}
        .priv-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:17px;padding:22px}
        .priv-field{display:flex;flex-direction:column;gap:8px;min-width:0}.priv-field label{color:#39445a;font-size:12px;font-weight:700}
        .priv-field input,.priv-field select{width:100%;box-sizing:border-box;height:42px;padding:0 12px;border:1px solid #dfe4ed;border-radius:8px;outline:none;background:white;color:#202a40;font:inherit;font-size:12px}
        .priv-field input:focus,.priv-field select:focus,.priv-search input:focus{border-color:#8290ed;box-shadow:0 0 0 3px #edf0ff}
        .priv-field small{color:#8991a2;font-size:11px;line-height:1.6}.priv-field.full{grid-column:1/-1}
        .priv-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:16px 22px;border-bottom:1px solid #edf0f5}
        .priv-search{position:relative;flex:1 1 220px;min-width:180px}.priv-search svg{position:absolute;top:12px;left:12px;color:#929bad}
        .priv-search input{width:100%;box-sizing:border-box;height:40px;padding:0 12px 0 37px;border:1px solid #dfe4ed;border-radius:8px;outline:none;font-size:12px}
        .priv-filter{height:40px;min-width:130px;padding:0 12px;border:1px solid #dfe4ed;border-radius:8px;background:white;color:#4b566d;font-size:12px}
        .priv-table-wrap{overflow-x:auto}.priv-table{width:100%;border-collapse:collapse;text-align:left;white-space:nowrap}
        .priv-table th{padding:14px 15px;background:#fafbfe;color:#7f889a;font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase}
        .priv-table td{padding:15px;border-top:1px solid #edf0f5;color:#4b566d;font-size:12px}.priv-table strong{color:#263149}
        .priv-badge{display:inline-flex;align-items:center;gap:5px;padding:5px 9px;border-radius:20px;background:#f0f1f5;color:#697386;font-size:10px;font-weight:700}
        .priv-badge.pending{background:#fff5df;color:#9a6a12}.priv-badge.processing{background:#edf0ff;color:#485dd0}.priv-badge.completed{background:#eaf9f0;color:#218552}.priv-badge.rejected{background:#fff0f0;color:#c24141}
        .priv-badge.personal{background:#edf0ff;color:#485dd0}.priv-badge.sensitive{background:#fff5df;color:#9a6a12}.priv-badge.restricted{background:#fff0f0;color:#c24141}.priv-badge.internal{background:#e8f8f7;color:#16857d}
        .priv-row-action{display:inline-flex;align-items:center;gap:5px;border:0;background:transparent;color:#5265d9;font-size:11px;font-weight:700;cursor:pointer}
        .priv-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 22px;border-top:1px solid #edf0f5;color:#858da0;font-size:11px}
        .priv-empty{padding:42px 20px;text-align:center;color:#858da0;font-size:13px}
        .priv-info-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px;padding:22px}
        .priv-info{padding:17px;border:1px solid #e7eaf1;border-radius:10px}.priv-info-icon{display:grid;place-items:center;width:38px;height:38px;margin-bottom:12px;border-radius:9px;background:#edf0ff;color:#5265d9}
        .priv-info h3{margin:0 0 7px;font-size:13px}.priv-info p{margin:0 0 12px;color:#858da0;font-size:11px;line-height:1.7}
        .priv-modal-backdrop{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:20px;background:#141c3073}
        .priv-modal{width:100%;max-width:590px;max-height:90vh;overflow:auto;border:1px solid #e7eaf1;border-radius:15px;background:white;box-shadow:0 20px 70px #141c3033}
        .priv-modal-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px 22px;border-bottom:1px solid #edf0f5}
        .priv-modal-header h2{margin:0;font-size:17px}.priv-modal-body{padding:22px}
        .priv-detail-row{display:flex;justify-content:space-between;gap:18px;padding:13px 0;border-bottom:1px solid #edf0f5;font-size:12px}
        .priv-detail-row span{color:#858da0}.priv-detail-row strong{text-align:right;overflow-wrap:anywhere}
        @media(max-width:1050px){.priv-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.priv-info-grid{grid-template-columns:1fr}}
        @media(max-width:650px){.priv-page{padding:18px 12px}.priv-heading{flex-direction:column}.priv-heading h1{font-size:23px}.priv-actions{width:100%}.priv-btn{flex:1}.priv-tabs{overflow-x:auto;flex-wrap:nowrap}.priv-tab{white-space:nowrap}.priv-grid{grid-template-columns:1fr}.priv-field.full{grid-column:auto}.priv-footer{align-items:flex-start;flex-direction:column}}
      `}</style>

      <div className="priv-container">
        <div className="priv-breadcrumb">
          <a href="/dashboard">Admin</a><span>/</span>
          <a href="/settings">Settings</a><span>/</span>
          <span>Privacy &amp; Data Settings</span>
        </div>

        <header className="priv-heading">
          <div className="priv-heading-main">
            <div className="priv-heading-icon"><ShieldCheck size={24} /></div>
            <div>
              <h1>Privacy &amp; Data Settings</h1>
              <p>Manage data retention, consent preferences, data inventory, and user data requests across ModelNow.</p>
            </div>
          </div>
          <div className="priv-actions">
            <button type="button" className="priv-btn" onClick={resetDemo}><RefreshCw size={14} />Reset Demo</button>
            <button type="button" className="priv-btn" onClick={exportRequests}><Download size={14} />Export Requests</button>
            <button type="button" className="priv-btn primary" onClick={saveSettings}><Save size={14} />Save Settings</button>
          </div>
        </header>

        {notice && (
          <div className="priv-notice" role="status">
            <CheckCircle2 size={17} />
            <span style={{ flex: 1 }}>{notice}</span>
            <button type="button" className="priv-btn" onClick={() => setNotice("")}><X size={14} /></button>
          </div>
        )}

        <div className="priv-warning">
          <AlertTriangle size={19} />
          <div><strong>Backend enforcement required</strong>This page is a frontend prototype. Consent records, deletion workflows, retention enforcement, and privacy requests must be implemented and audited in backend services before production.</div>
        </div>

        <section className="priv-metrics">
          <Metric title="Pending Requests" value={pendingRequests} detail="Awaiting review" icon={<Clock size={19} />} tone="orange" />
          <Metric title="Processing Requests" value={processingRequests} detail="Currently in progress" icon={<Activity size={19} />} />
          <Metric title="Completed Requests" value={completedRequests} detail="Completed demo records" icon={<CheckCircle2 size={19} />} tone="green" />
          <Metric title="Controls Enabled" value={`${enabledControls}/${totalControls}`} detail="Enabled privacy controls" icon={<ShieldCheck size={19} />} tone="teal" />
        </section>

        <div className="priv-tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button key={tab.id} type="button" className={`priv-tab ${activeTab === tab.id ? "active" : ""}`} onClick={() => setActiveTab(tab.id)}>
                <Icon size={15} />{tab.label}
              </button>
            );
          })}
        </div>

        {activeTab === "overview" && <>
          <section className="priv-card">
            <div className="priv-card-header"><div><h2>Privacy Program Overview</h2><p>Summary of current privacy controls and data-handling policies.</p></div><ShieldCheck size={21} color="#5265d9" /></div>
            <div className="priv-info-grid">
              <div className="priv-info"><div className="priv-info-icon"><Database size={20} /></div><h3>Data Lifecycle</h3><p>Define collection, retention, archival, and deletion processes for each data category.</p><button className="priv-row-action" onClick={() => setActiveTab("retention")}>Manage retention <ChevronRight size={13} /></button></div>
              <div className="priv-info"><div className="priv-info-icon"><UserRound size={20} /></div><h3>User Privacy Rights</h3><p>Track access, export, correction, and deletion requests with ownership and deadlines.</p><button className="priv-row-action" onClick={() => setActiveTab("requests")}>Manage requests <ChevronRight size={13} /></button></div>
              <div className="priv-info"><div className="priv-info-icon"><LockKeyhole size={20} /></div><h3>Data Protection</h3><p>Set encryption, redaction, credential masking, and access restriction policies.</p><button className="priv-row-action" onClick={() => setActiveTab("protection")}>Review protection <ChevronRight size={13} /></button></div>
            </div>
          </section>
          <section className="priv-card">
            <div className="priv-card-header"><div><h2>Key Privacy Controls</h2><p>Configure intended platform privacy behaviors.</p></div></div>
            <Toggle title="Require Consent" description="Record user consent for applicable optional data-processing purposes." checked={settings.consentRequired} onChange={(v) => updateSetting("consentRequired", v)} />
            <Toggle title="Anonymize Usage Analytics" description="Remove or transform identifiers from analytics where feasible." checked={settings.anonymizeUsageAnalytics} onChange={(v) => updateSetting("anonymizeUsageAnalytics", v)} />
            <Toggle title="Restrict Sensitive Data Access" description="Limit sensitive data access to authorized roles and services." checked={settings.restrictSensitiveDataAccess} onChange={(v) => updateSetting("restrictSensitiveDataAccess", v)} />
            <Toggle title="Notify on Data Requests" description="Notify the configured privacy contact when a request is submitted." checked={settings.notifyOnDataRequest} onChange={(v) => updateSetting("notifyOnDataRequest", v)} />
            <div className="priv-footer"><span>These switches do not independently establish legal compliance.</span><button className="priv-btn primary" onClick={saveSettings}><Save size={14} />Save Controls</button></div>
          </section>
          <section className="priv-card">
            <div className="priv-card-header"><div><h2>Recent Data Requests</h2><p>Latest sample requests.</p></div><button className="priv-btn" onClick={() => setActiveTab("requests")}>View All <ChevronRight size={14} /></button></div>
            <div className="priv-table-wrap"><table className="priv-table"><thead><tr><th>Request</th><th>User</th><th>Type</th><th>Status</th><th>Submitted</th><th>Due Date</th></tr></thead><tbody>
              {requests.slice(0, 4).map((r) => <tr key={r.id}><td><strong>{r.id}</strong></td><td>{r.user}</td><td>{r.type}</td><td>{statusBadge(r.status)}</td><td>{r.submitted}</td><td>{r.dueDate}</td></tr>)}
            </tbody></table></div>
          </section>
        </>}

        {activeTab === "retention" && <section className="priv-card">
          <div className="priv-card-header"><div><h2>Data Retention Policies</h2><p>Configure intended retention periods for platform data.</p></div><Clock size={21} color="#5265d9" /></div>
          <div className="priv-grid">
            {([
              ["conversationRetentionDays", "Conversation History (days)", "0 can represent immediate deletion if supported by your backend."],
              ["uploadedFileRetentionDays", "Uploaded Files (days)", "Retention for uploaded documents and associated derived files."],
              ["auditRetentionDays", "Audit Logs (days)", "Keep audit records according to security and compliance requirements."],
              ["analyticsRetentionDays", "Analytics Data (days)", "Retention period for analytics and usage information."],
              ["deletionGracePeriodDays", "Deletion Grace Period (days)", "Grace period before eligible deletion workflows execute."],
            ] as const).map(([key, label, help]) => (
              <div className="priv-field" key={key}><label htmlFor={key}>{label}</label><input id={key} type="number" min="0" max="3650" value={settings[key]} onChange={(e) => updateSetting(key, e.target.value)} /><small>{help}</small></div>
            ))}
            <div className="priv-field"><label>Retention Policy Status</label><input readOnly value="Configuration draft" /><small>Automated lifecycle jobs and deletion verification are required.</small></div>
          </div>
          <Toggle title="Retain Conversation History" description="Retain conversation history according to the configured policy." checked={settings.retainConversationHistory} onChange={(v) => updateSetting("retainConversationHistory", v)} />
          <Toggle title="Retain Audit Logs" description="Preserve audit records for the configured period." checked={settings.retainAuditLogs} onChange={(v) => updateSetting("retainAuditLogs", v)} />
          <Toggle title="Delete Uploaded Files After Retention" description="Schedule deletion of expired uploaded files and derived data." checked={settings.deleteUploadedFiles} onChange={(v) => updateSetting("deleteUploadedFiles", v)} />
          <div className="priv-footer"><span>Include backups, replicas, caches, and derived data in retention design.</span><button className="priv-btn primary" onClick={saveSettings}><Save size={14} />Save Retention Policy</button></div>
        </section>}

        {activeTab === "consent" && <section className="priv-card">
          <div className="priv-card-header"><div><h2>Consent &amp; User Preferences</h2><p>Configure user choice for optional analytics and model training.</p></div><Fingerprint size={21} color="#5265d9" /></div>
          <Toggle title="Require Consent Where Applicable" description="Record explicit consent for optional processing activities where required." checked={settings.consentRequired} onChange={(v) => updateSetting("consentRequired", v)} />
          <Toggle title="Allow Analytics Opt-in" description="Allow users to choose whether optional product analytics can be associated with their account." checked={settings.analyticsOptIn} onChange={(v) => updateSetting("analyticsOptIn", v)} />
          <Toggle title="Allow Model Training Opt-in" description="Allow a separately recorded choice for eligible data to be used for model improvement." checked={settings.modelTrainingOptIn} onChange={(v) => updateSetting("modelTrainingOptIn", v)} />
          <Toggle title="Anonymize Usage Analytics" description="Minimize direct identifiers in product analytics." checked={settings.anonymizeUsageAnalytics} onChange={(v) => updateSetting("anonymizeUsageAnalytics", v)} />
          <Toggle title="Allow Cookie Preferences" description="Provide controls for non-essential cookies and similar technologies." checked={settings.allowCookiePreferences} onChange={(v) => updateSetting("allowCookiePreferences", v)} />
          <div className="priv-grid">
            <div className="priv-field"><label htmlFor="privacyContact">Privacy Contact Email</label><input id="privacyContact" type="email" value={settings.privacyContact} onChange={(e) => updateSetting("privacyContact", e.target.value)} /></div>
            <div className="priv-field"><label htmlFor="dataRegion">Default Data Region</label><select id="dataRegion" value={settings.dataRegion} onChange={(e) => updateSetting("dataRegion", e.target.value)}><option>India</option><option>United States</option><option>European Union</option><option>Singapore</option><option>United Kingdom</option></select></div>
          </div>
          <div className="priv-warning" style={{ margin: "0 22px 18px" }}><CircleHelp size={18} /><div>Store consent records with user, purpose, policy version, timestamp, and withdrawal history on the backend.</div></div>
          <div className="priv-footer"><span>Make user consent revocable and auditable.</span><button className="priv-btn primary" onClick={saveSettings}><Save size={14} />Save Preferences</button></div>
        </section>}

        {activeTab === "inventory" && <section className="priv-card">
          <div className="priv-card-header"><div><h2>Data Inventory</h2><p>Illustrative inventory of major ModelNow data categories.</p></div><button className="priv-btn" onClick={exportInventory}><Download size={14} />Export Inventory</button></div>
          <div className="priv-toolbar"><div className="priv-search"><Search size={16} /><input aria-label="Search data inventory" placeholder="Search data assets..." value={inventorySearch} onChange={(e) => setInventorySearch(e.target.value)} /></div><span className="priv-badge">{filteredInventory.length} categories</span></div>
          <div className="priv-table-wrap"><table className="priv-table"><thead><tr><th>Data Asset</th><th>Category</th><th>Description</th><th>Retention</th><th>Classification</th></tr></thead><tbody>
            {filteredInventory.map((item) => <tr key={item.name}><td><strong>{item.name}</strong></td><td>{item.category}</td><td style={{ minWidth: 240, whiteSpace: "normal" }}>{item.description}</td><td>{item.retention}</td><td><span className={`priv-badge ${item.classification.toLowerCase()}`}>{item.classification}</span></td></tr>)}
          </tbody></table>{filteredInventory.length === 0 && <div className="priv-empty">No data assets match your search.</div>}</div>
          <div className="priv-footer"><span>Illustrative inventory only; validate against actual storage systems.</span><button className="priv-btn primary" onClick={() => setShowInventoryModal(true)}><Plus size={14} />Inventory Guidance</button></div>
        </section>}

        {activeTab === "requests" && <section className="priv-card">
          <div className="priv-card-header"><div><h2>Data Subject Requests</h2><p>Track access, export, correction, and deletion requests.</p></div><button className="priv-btn primary" onClick={() => setShowRequestModal(true)}><Plus size={14} />Create Demo Request</button></div>
          <div className="priv-toolbar">
            <div className="priv-search"><Search size={16} /><input aria-label="Search data requests" placeholder="Search request ID or user..." value={search} onChange={(e) => setSearch(e.target.value)} /></div>
            <select className="priv-filter" aria-label="Filter request type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}><option>All</option><option>Access</option><option>Export</option><option>Deletion</option><option>Correction</option></select>
            <select className="priv-filter" aria-label="Filter request status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}><option>All</option><option>Pending</option><option>Processing</option><option>Completed</option><option>Rejected</option></select>
            <button className="priv-btn" onClick={exportRequests}><Download size={14} />Export CSV</button>
          </div>
          <div className="priv-table-wrap"><table className="priv-table"><thead><tr><th>Request ID</th><th>User</th><th>Type</th><th>Status</th><th>Submitted</th><th>Due Date</th><th>Action</th></tr></thead><tbody>
            {filteredRequests.map((r) => <tr key={r.id}><td><strong>{r.id}</strong></td><td>{r.user}</td><td>{r.type}</td><td>{statusBadge(r.status)}</td><td>{r.submitted}</td><td>{r.dueDate}</td><td><button className="priv-row-action" onClick={() => setSelectedRequest(r)}>Review <ChevronRight size={13} /></button></td></tr>)}
          </tbody></table>{filteredRequests.length === 0 && <div className="priv-empty">No requests match your filters.</div>}</div>
          <div className="priv-footer"><span>Showing {filteredRequests.length} of {requests.length} sample requests.</span><span>Verify identity before fulfilling real requests.</span></div>
        </section>}

        {activeTab === "protection" && <section className="priv-card">
          <div className="priv-card-header"><div><h2>Data Protection Controls</h2><p>Configure intended protections for sensitive and restricted data.</p></div><LockKeyhole size={21} color="#5265d9" /></div>
          <Toggle title="Encrypt Data at Rest" description="Use managed encryption for databases and persistent storage." checked={settings.dataEncryption} onChange={(v) => updateSetting("dataEncryption", v)} />
          <Toggle title="Redact Personal Data" description="Mask sensitive personal data in logs and support tooling." checked={settings.redactPersonalData} onChange={(v) => updateSetting("redactPersonalData", v)} />
          <Toggle title="Mask API Credentials" description="Never display complete secret keys in admin tables or logs." checked={settings.maskApiCredentials} onChange={(v) => updateSetting("maskApiCredentials", v)} />
          <Toggle title="Restrict Sensitive Data Access" description="Apply least-privilege access and audit sensitive-data retrieval." checked={settings.restrictSensitiveDataAccess} onChange={(v) => updateSetting("restrictSensitiveDataAccess", v)} />
          <Toggle title="Require Approval for Deletion" description="Require an authorized reviewer before high-impact deletion workflows." checked={settings.requireDeletionApproval} onChange={(v) => updateSetting("requireDeletionApproval", v)} />
          <Toggle title="Allow Data Export" description="Enable the intended export workflow subject to authorization." checked={settings.allowDataExport} onChange={(v) => updateSetting("allowDataExport", v)} />
          <Toggle title="Allow Account Deletion" description="Enable account deletion with safeguards and auditable results." checked={settings.allowAccountDeletion} onChange={(v) => updateSetting("allowAccountDeletion", v)} />
          <div className="priv-footer"><span>Apply controls in backend and storage layers.</span><button className="priv-btn primary" onClick={saveSettings}><Save size={14} />Save Protection Policy</button></div>
        </section>}

        <div className="priv-footer" style={{ padding: "12px 0 30px", borderTop: 0 }}>
          <span>ModelNow Admin · Privacy &amp; Data Settings</span>
          <button className="priv-btn primary" onClick={saveSettings}><Save size={14} />Save All Changes</button>
        </div>
      </div>

      {showRequestModal && <div className="priv-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowRequestModal(false); }}>
        <section className="priv-modal" role="dialog" aria-modal="true" aria-labelledby="priv-request-title">
          <div className="priv-modal-header"><h2 id="priv-request-title">Create Demo Data Request</h2><button className="priv-btn" aria-label="Close request form" onClick={() => setShowRequestModal(false)}><X size={14} /></button></div>
          <div className="priv-modal-body"><div className="priv-grid" style={{ padding: 0 }}>
            <div className="priv-field full"><label htmlFor="requestUser">User Email</label><input id="requestUser" type="email" value={requestDraft.user} onChange={(e) => setRequestDraft((c) => ({ ...c, user: e.target.value }))} placeholder="user@example.com" /></div>
            <div className="priv-field full"><label htmlFor="requestType">Request Type</label><select id="requestType" value={requestDraft.type} onChange={(e) => setRequestDraft((c) => ({ ...c, type: e.target.value as DataRequestType }))}><option value="Access">Access</option><option value="Export">Export</option><option value="Deletion">Deletion</option><option value="Correction">Correction</option></select></div>
            <div className="priv-field full"><small>This creates a sample record only. It does not access, export, modify, or delete real user data.</small></div>
          </div><div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 22 }}><button className="priv-btn" onClick={() => setShowRequestModal(false)}>Cancel</button><button className="priv-btn primary" onClick={createRequest}><Plus size={14} />Create Request</button></div></div>
        </section>
      </div>}

      {selectedRequest && <div className="priv-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setSelectedRequest(null); }}>
        <section className="priv-modal" role="dialog" aria-modal="true" aria-labelledby="priv-detail-title">
          <div className="priv-modal-header"><div><h2 id="priv-detail-title">Data Request Details</h2><small>{selectedRequest.id}</small></div><button className="priv-btn" aria-label="Close request details" onClick={() => setSelectedRequest(null)}><X size={14} /></button></div>
          <div className="priv-modal-body">
            <div className="priv-detail-row"><span>User</span><strong>{selectedRequest.user}</strong></div>
            <div className="priv-detail-row"><span>Request Type</span><strong>{selectedRequest.type}</strong></div>
            <div className="priv-detail-row"><span>Submitted</span><strong>{selectedRequest.submitted}</strong></div>
            <div className="priv-detail-row"><span>Due Date</span><strong>{selectedRequest.dueDate}</strong></div>
            <div className="priv-detail-row"><span>Status</span><strong>{statusBadge(selectedRequest.status)}</strong></div>
            <div className="priv-field" style={{ marginTop: 20 }}><label htmlFor="requestStatus">Update Demo Status</label><select id="requestStatus" value={selectedRequest.status} onChange={(e) => updateRequestStatus(selectedRequest.id, e.target.value as DataRequestStatus)}><option value="Pending">Pending</option><option value="Processing">Processing</option><option value="Completed">Completed</option><option value="Rejected">Rejected</option></select><small>Complete a request only after identity verification and fulfillment are implemented.</small></div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 22 }}><button className="priv-btn" onClick={() => setSelectedRequest(null)}>Close</button><button className="priv-btn primary" onClick={() => { updateRequestStatus(selectedRequest.id, "Completed"); setSelectedRequest(null); }}><CheckCircle2 size={14} />Mark Completed</button></div>
          </div>
        </section>
      </div>}

      {showInventoryModal && <div className="priv-modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setShowInventoryModal(false); }}>
        <section className="priv-modal" role="dialog" aria-modal="true" aria-labelledby="priv-inventory-title">
          <div className="priv-modal-header"><h2 id="priv-inventory-title">Data Inventory Guidance</h2><button className="priv-btn" aria-label="Close inventory guidance" onClick={() => setShowInventoryModal(false)}><X size={14} /></button></div>
          <div className="priv-modal-body">
            <p style={{ color: "#68738a", fontSize: 12, lineHeight: 1.8, marginTop: 0 }}>For each real data asset, document the system owner, processing purpose, data categories, storage region, access roles, retention period, deletion method, and external processors.</p>
            <div className="priv-detail-row"><span>Data assets listed</span><strong>{inventory.length}</strong></div>
            <div className="priv-detail-row"><span>Inventory status</span><strong>Illustrative draft</strong></div>
            <div className="priv-detail-row"><span>Next step</span><strong>Verify against infrastructure</strong></div>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 9, marginTop: 22 }}><button className="priv-btn" onClick={() => setShowInventoryModal(false)}>Close</button><button className="priv-btn primary" onClick={() => { setShowInventoryModal(false); exportInventory(); }}><Download size={14} />Export Inventory</button></div>
          </div>
        </section>
      </div>}
    </main>
  );
}
