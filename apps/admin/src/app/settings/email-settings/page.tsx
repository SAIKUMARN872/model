
"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Mail,
  Send,
  Server,
  ShieldCheck,
  Settings2,
  CheckCircle2,
  AlertTriangle,
  Search,
  Plus,
  RefreshCw,
  Download,
  X,
  Eye,
  EyeOff,
  Clock,
  FileText,
  Activity,
  Trash2,
  TestTube2,
  Globe,
  KeyRound,
  Inbox,
  CircleCheck,
  CircleX,
} from "lucide-react";

type EmailStatus = "Delivered" | "Queued" | "Failed" | "Bounced";
type EmailType = "Transactional" | "Security" | "Billing" | "Product" | "System";

type EmailRecord = {
  id: string;
  recipient: string;
  subject: string;
  type: EmailType;
  status: EmailStatus;
  provider: string;
  createdAt: string;
};

const initialEmails: EmailRecord[] = [
  {
    id: "EML-2048",
    recipient: "admin@acme.example",
    subject: "Your API usage summary",
    type: "Transactional",
    status: "Delivered",
    provider: "SMTP",
    createdAt: "2026-11-04 09:42",
  },
  {
    id: "EML-2047",
    recipient: "billing@northstar.example",
    subject: "Payment requires attention",
    type: "Billing",
    status: "Queued",
    provider: "SMTP",
    createdAt: "2026-11-04 09:18",
  },
  {
    id: "EML-2046",
    recipient: "security@vertex.example",
    subject: "New API key created",
    type: "Security",
    status: "Delivered",
    provider: "SMTP",
    createdAt: "2026-11-04 08:51",
  },
  {
    id: "EML-2045",
    recipient: "team@bluepeak.example",
    subject: "ModelNow weekly report",
    type: "Product",
    status: "Failed",
    provider: "SMTP",
    createdAt: "2026-11-04 08:25",
  },
  {
    id: "EML-2044",
    recipient: "ops@quantum.example",
    subject: "Scheduled maintenance notice",
    type: "System",
    status: "Bounced",
    provider: "SMTP",
    createdAt: "2026-11-03 17:40",
  },
  {
    id: "EML-2043",
    recipient: "user@acme.example",
    subject: "Welcome to ModelNow",
    type: "Transactional",
    status: "Delivered",
    provider: "SMTP",
    createdAt: "2026-11-03 16:15",
  },
];

const initialSettings = {
  provider: "smtp",
  senderName: "ModelNow",
  senderEmail: "notifications@example.com",
  replyTo: "support@example.com",
  smtpHost: "",
  smtpPort: "587",
  smtpUsername: "",
  smtpPassword: "",
  encryption: "tls",
  apiEndpoint: "",
  apiKey: "",
  region: "us-east-1",
  defaultFromDomain: "example.com",
  dailyLimit: "10000",
  retryAttempts: "3",
  retryDelay: "5",
  timeoutSeconds: "30",
  connectTimeoutSeconds: "10",
  maxRecipients: "50",
  rateLimitPerMinute: "120",
  enabled: false,
  verifyTls: true,
  requireVerifiedSender: true,
  bounceTracking: true,
  complaintTracking: true,
  openTracking: false,
  clickTracking: false,
  queueEnabled: true,
  retryEnabled: true,
  suppressionEnabled: true,
  sendSecurityEmails: true,
  sendBillingEmails: true,
  sendProductEmails: true,
  sendSystemEmails: true,
  sendWelcomeEmails: true,
  sendUsageReports: true,
  sendMaintenanceEmails: true,
  sendMarketingEmails: false,
};

type EmailSettings = typeof initialSettings;

const emailTypes: EmailType[] = [
  "Transactional",
  "Security",
  "Billing",
  "Product",
  "System",
];

export default function EmailSettingsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [settings, setSettings] = useState<EmailSettings>(initialSettings);
  const [emails, setEmails] = useState<EmailRecord[]>(initialEmails);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [notice, setNotice] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showTestModal, setShowTestModal] = useState(false);
  const [testRecipient, setTestRecipient] = useState("");
  const [testSubject, setTestSubject] = useState("ModelNow email configuration test");

  const filteredEmails = useMemo(() => {
    return emails.filter((email) => {
      const query = `${email.id} ${email.recipient} ${email.subject} ${email.provider}`.toLowerCase();
      const matchesSearch = query.includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || email.status === statusFilter;
      const matchesType = typeFilter === "All" || email.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });
  }, [emails, search, statusFilter, typeFilter]);

  const deliveredCount = emails.filter((email) => email.status === "Delivered").length;
  const queuedCount = emails.filter((email) => email.status === "Queued").length;
  const failedCount = emails.filter((email) => email.status === "Failed" || email.status === "Bounced").length;

  function updateSetting<K extends keyof EmailSettings>(
    key: K,
    value: EmailSettings[K],
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function saveSettings() {
    try {
      localStorage.setItem("modelnow-email-settings", JSON.stringify(settings));
      localStorage.setItem("modelnow-email-activity", JSON.stringify(emails));
      setNotice(
        "Email settings saved in this browser. Configure and validate the mail provider on the server before enabling production delivery.",
      );
    } catch {
      setNotice("Unable to save email settings in this browser.");
    }
  }

  function resetDemo() {
    setSettings(initialSettings);
    setEmails(initialEmails);
    setSearch("");
    setStatusFilter("All");
    setTypeFilter("All");
    setNotice("Email settings demo has been reset.");
  }

  function exportActivity() {
    const header = ["ID", "Recipient", "Subject", "Type", "Status", "Provider", "Created At"];
    const rows = filteredEmails.map((email) => [
      email.id,
      email.recipient,
      email.subject,
      email.type,
      email.status,
      email.provider,
      email.createdAt,
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-email-activity.csv";
    anchor.click();
    URL.revokeObjectURL(url);
    setNotice("Email activity exported.");
  }

  function addTestRecord() {
    if (!testRecipient.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(testRecipient.trim())) {
      setNotice("Enter a valid recipient email address.");
      return;
    }

    const item: EmailRecord = {
      id: `EML-${String(Date.now()).slice(-6)}`,
      recipient: testRecipient.trim(),
      subject: testSubject.trim() || "ModelNow test email",
      type: "System",
      status: "Queued",
      provider: settings.provider.toUpperCase(),
      createdAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    };

    setEmails((current) => [item, ...current]);
    setShowTestModal(false);
    setNotice(
      "A test email record was added to the local demo queue. No real email has been sent.",
    );
    setTestRecipient("");
    setTestSubject("ModelNow email configuration test");
  }

  function updateEmailStatus(id: string, status: EmailStatus) {
    setEmails((current) =>
      current.map((email) => (email.id === id ? { ...email, status } : email)),
    );
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
      <div className="email-metric">
        <div className={`email-metric-icon ${tone}`}>{icon}</div>
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
      <div className="email-toggle">
        <div>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={title}
          className={`email-switch ${checked ? "on" : ""}`}
          onClick={() => onChange(!checked)}
        />
      </div>
    );
  }

  function statusClass(status: EmailStatus) {
    return status.toLowerCase();
  }

  return (
    <main className="email-page">
      <style>{`
        .email-page{min-height:100vh;padding:30px;background:#f7f8fc;color:#202a40;font-family:Arial,Helvetica,sans-serif}
        .email-container{max-width:1280px;margin:0 auto}
        .email-breadcrumb{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:22px;color:#858da0;font-size:13px}
        .email-breadcrumb a{color:#5265d9;text-decoration:none}
        .email-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:25px}
        .email-heading-main{display:flex;align-items:center;gap:14px}
        .email-heading-icon{display:grid;place-items:center;width:50px;height:50px;flex-shrink:0;border-radius:14px;background:#e9edff;color:#5265d9}
        .email-heading h1{margin:0 0 7px;font-size:27px;letter-spacing:-.6px}
        .email-heading p{max-width:720px;margin:0;color:#7e8799;font-size:13px;line-height:1.7}
        .email-actions{display:flex;flex-wrap:wrap;gap:9px}
        .email-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:39px;padding:0 13px;border:1px solid #dfe4ed;border-radius:9px;background:white;color:#414c64;font-size:12px;font-weight:600;cursor:pointer}
        .email-btn.primary{background:#5265d9;border-color:#5265d9;color:white}
        .email-btn:disabled{opacity:.5;cursor:not-allowed}
        .email-notice{display:flex;align-items:flex-start;gap:10px;margin-bottom:18px;padding:13px 15px;border:1px solid #dce4ff;border-radius:10px;background:#f0f3ff;color:#4055b5;font-size:12px;line-height:1.6}
        .email-warning{display:flex;gap:12px;margin-bottom:20px;padding:15px;border:1px solid #f3dfb1;border-radius:11px;background:#fff9e9;color:#94651a;font-size:12px;line-height:1.7}
        .email-warning strong{display:block;margin-bottom:4px}
        .email-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:22px}
        .email-metric{display:flex;gap:13px;padding:19px;border:1px solid #e7eaf1;border-radius:12px;background:white}
        .email-metric-icon{display:grid;place-items:center;width:41px;height:41px;flex-shrink:0;border-radius:10px;background:#edf0ff;color:#5265d9}
        .email-metric-icon.green{background:#e8f8ef;color:#258452}
        .email-metric-icon.orange{background:#fff5df;color:#a36e12}
        .email-metric-icon.red{background:#fff0f0;color:#c24141}
        .email-metric p{margin:2px 0 7px;color:#818a9c;font-size:11px}
        .email-metric strong{font-size:23px}
        .email-metric small{display:block;margin-top:6px;color:#929aab;font-size:10px;line-height:1.5}
        .email-tabs{display:flex;flex-wrap:wrap;gap:6px;padding:6px;margin-bottom:18px;border:1px solid #e7eaf1;border-radius:11px;background:white}
        .email-tab{display:inline-flex;align-items:center;gap:8px;padding:11px 14px;border:0;border-radius:7px;background:transparent;color:#6f7890;font-size:12px;font-weight:600;cursor:pointer}
        .email-tab.active{background:#edf0ff;color:#485dd0}
        .email-card{overflow:hidden;margin-bottom:18px;border:1px solid #e7eaf1;border-radius:13px;background:white;box-shadow:0 2px 7px rgba(24,36,70,.025)}
        .email-card-header{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:20px 22px;border-bottom:1px solid #edf0f5}
        .email-card-header h2{margin:0 0 6px;font-size:15px}
        .email-card-header p{margin:0;color:#858da0;font-size:12px;line-height:1.6}
        .email-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:16px 22px;border-bottom:1px solid #edf0f5}
        .email-search{position:relative;flex:1 1 220px;min-width:180px}
        .email-search svg{position:absolute;top:12px;left:12px;color:#929bad}
        .email-search input{width:100%;height:40px;padding:0 12px 0 37px;border:1px solid #dfe4ed;border-radius:8px;outline:none;font-size:12px}
        .email-filter{height:40px;min-width:130px;padding:0 12px;border:1px solid #dfe4ed;border-radius:8px;background:white;color:#4b566d;font-size:12px}
        .email-table-wrap{overflow-x:auto}
        .email-table{width:100%;border-collapse:collapse;text-align:left;white-space:nowrap}
        .email-table th{padding:14px 15px;background:#fafbfe;color:#7f889a;font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase}
        .email-table td{padding:15px;border-top:1px solid #edf0f5;color:#4b566d;font-size:12px}
        .email-table strong{color:#263149}
        .email-subtext{margin-top:5px;color:#8991a2;font-size:10px}
        .email-badge{display:inline-flex;align-items:center;gap:5px;padding:5px 9px;border-radius:20px;background:#f0f1f5;color:#697386;font-size:10px;font-weight:700}
        .email-badge.delivered{background:#eaf9f0;color:#218552}
        .email-badge.queued{background:#fff5df;color:#9a6a12}
        .email-badge.failed,.email-badge.bounced{background:#fff0f0;color:#c24141}
        .email-icon-btn{display:grid;place-items:center;width:32px;height:32px;border:1px solid #e4e8f0;border-radius:7px;background:white;color:#66718a;cursor:pointer}
        .email-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 22px;border-top:1px solid #edf0f5;color:#858da0;font-size:11px}
        .email-empty{padding:42px 20px;text-align:center;color:#858da0;font-size:13px}
        .email-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:17px;padding:22px}
        .email-field{display:flex;flex-direction:column;gap:8px;min-width:0}
        .email-field label{color:#39445a;font-size:12px;font-weight:700}
        .email-field input,.email-field select{width:100%;height:42px;padding:0 12px;border:1px solid #dfe4ed;border-radius:8px;outline:none;background:white;color:#202a40;font:inherit;font-size:12px}
        .email-field input:focus,.email-field select:focus{border-color:#8290ed;box-shadow:0 0 0 3px #edf0ff}
        .email-field input:disabled,.email-field select:disabled{background:#f5f6fa;color:#969eae;cursor:not-allowed}
        .email-field small{color:#8991a2;font-size:11px;line-height:1.6}
        .email-field.full{grid-column:1/-1}
        .email-input-with-action{display:flex;gap:8px}
        .email-input-with-action input{flex:1;min-width:0}
        .email-toggle{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:17px 22px;border-bottom:1px solid #edf0f5}
        .email-toggle:last-child{border-bottom:0}
        .email-toggle strong{display:block;margin-bottom:5px;font-size:12px}
        .email-toggle p{margin:0;color:#858da0;font-size:11px;line-height:1.6}
        .email-switch{position:relative;width:38px;height:22px;flex:0 0 auto;padding:0;border:0;border-radius:20px;background:#cbd1dd;cursor:pointer}
        .email-switch.on{background:#5265d9}
        .email-switch:after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:white;transition:transform .15s ease}
        .email-switch.on:after{transform:translateX(16px)}
        .email-modal-backdrop{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:20px;background:rgba(20,28,48,.45)}
        .email-modal{width:100%;max-width:520px;overflow:hidden;border:1px solid #e7eaf1;border-radius:15px;background:white;box-shadow:0 20px 70px rgba(20,28,48,.2)}
        .email-modal-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px 22px;border-bottom:1px solid #edf0f5}
        .email-modal-header h2{margin:0;font-size:17px}
        .email-modal-body{padding:22px}
        .email-modal-actions{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:9px;margin-top:22px}
        .email-provider-card{display:flex;align-items:flex-start;gap:12px;padding:16px;border:1px solid #e7eaf1;border-radius:10px;background:#fff}
        .email-provider-card.active{border-color:#b7c1ff;background:#fafbff}
        .email-provider-card input{margin-top:3px;accent-color:#5265d9}
        .email-provider-card strong{display:block;margin-bottom:5px;font-size:12px}
        .email-provider-card p{margin:0;color:#858da0;font-size:11px;line-height:1.6}
        @media(max-width:1050px){.email-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:650px){.email-page{padding:18px 12px}.email-heading{flex-direction:column}.email-heading h1{font-size:23px}.email-actions{width:100%}.email-btn{flex:1}.email-tabs{overflow-x:auto;flex-wrap:nowrap}.email-tab{white-space:nowrap}.email-form-grid{grid-template-columns:1fr}.email-field.full{grid-column:auto}.email-footer{align-items:flex-start;flex-direction:column}}
      `}</style>

      <div className="email-container">
        <div className="email-breadcrumb">
          <a href="/dashboard">Admin</a>
          <span>/</span>
          <a href="/settings">Settings</a>
          <span>/</span>
          <span>Email Settings</span>
        </div>

        <header className="email-heading">
          <div className="email-heading-main">
            <div className="email-heading-icon"><Mail size={24} /></div>
            <div>
              <h1>Email Settings</h1>
              <p>
                Configure email providers, sender identities, delivery policies,
                templates, retries, and outbound email activity for ModelNow.
              </p>
            </div>
          </div>
          <div className="email-actions">
            <button type="button" className="email-btn" onClick={resetDemo}>
              <RefreshCw size={14} />Reset Demo
            </button>
            <button type="button" className="email-btn" onClick={exportActivity}>
              <Download size={14} />Export Activity
            </button>
            <button type="button" className="email-btn primary" onClick={saveSettings}>
              <CheckCircle2 size={14} />Save Settings
            </button>
          </div>
        </header>

        {notice && (
          <div className="email-notice" role="status">
            <CheckCircle2 size={17} />
            <span style={{ flex: 1 }}>{notice}</span>
            <button type="button" className="email-icon-btn" aria-label="Dismiss notification" onClick={() => setNotice("")}>
              <X size={14} />
            </button>
          </div>
        )}

        <div className="email-warning">
          <AlertTriangle size={19} />
          <div>
            <strong>Email delivery is not connected</strong>
            The displayed activity is sample data. Provider credentials must be
            configured securely on the server. Saving this page does not send
            emails or verify SMTP/API connectivity.
          </div>
        </div>

        <section className="email-metrics">
          <Metric title="Delivered" value={deliveredCount} detail="Marked delivered in demo" icon={<CircleCheck size={19} />} tone="green" />
          <Metric title="Queued" value={queuedCount} detail="Awaiting processing" icon={<Inbox size={19} />} tone="orange" />
          <Metric title="Failed / Bounced" value={failedCount} detail="Needs investigation" icon={<CircleX size={19} />} tone="red" />
          <Metric title="Email Records" value={emails.length} detail="Current demo activity" icon={<Activity size={19} />} tone="" />
        </section>

        <div className="email-tabs">
          <button type="button" className={`email-tab ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}><Activity size={15} />Overview</button>
          <button type="button" className={`email-tab ${activeTab === "provider" ? "active" : ""}`} onClick={() => setActiveTab("provider")}><Server size={15} />Provider Configuration</button>
          <button type="button" className={`email-tab ${activeTab === "sender" ? "active" : ""}`} onClick={() => setActiveTab("sender")}><Mail size={15} />Sender &amp; Templates</button>
          <button type="button" className={`email-tab ${activeTab === "delivery" ? "active" : ""}`} onClick={() => setActiveTab("delivery")}><Settings2 size={15} />Delivery Policies</button>
          <button type="button" className={`email-tab ${activeTab === "activity" ? "active" : ""}`} onClick={() => setActiveTab("activity")}><FileText size={15} />Email Activity</button>
        </div>

        {activeTab === "overview" && (
          <>
            <section className="email-card">
              <div className="email-card-header">
                <div><h2>Email Service Overview</h2><p>Current configuration and delivery readiness.</p></div>
                <button type="button" className="email-btn" onClick={() => setActiveTab("provider")}><Settings2 size={14} />Configure Provider</button>
              </div>
              <div className="email-form-grid">
                <div className="email-field">
                  <label>Selected Provider</label>
                  <input value={settings.provider.toUpperCase()} readOnly />
                  <small>The selected provider is a configuration preference, not a verified connection.</small>
                </div>
                <div className="email-field">
                  <label>Service Status</label>
                  <input value={settings.enabled ? "Enabled in settings — connection unverified" : "Disabled"} readOnly />
                  <small>Production status must be confirmed by a server-side health check.</small>
                </div>
                <div className="email-field">
                  <label>Sender Identity</label>
                  <input value={`${settings.senderName} <${settings.senderEmail}>`} readOnly />
                </div>
                <div className="email-field">
                  <label>Daily Sending Limit</label>
                  <input value={settings.dailyLimit} readOnly />
                </div>
              </div>
              <div className="email-footer">
                <span>Use a verified sending domain and monitor bounce and complaint rates.</span>
                <button type="button" className="email-btn primary" onClick={() => setShowTestModal(true)}><TestTube2 size={14} />Create Test Record</button>
              </div>
            </section>

            <section className="email-card">
              <div className="email-card-header">
                <div><h2>Recent Email Activity</h2><p>Latest sample outbound email records.</p></div>
                <button type="button" className="email-btn" onClick={() => setActiveTab("activity")}>View All</button>
              </div>
              <div className="email-table-wrap">
                <table className="email-table">
                  <thead><tr><th>Email</th><th>Recipient</th><th>Type</th><th>Status</th><th>Created</th></tr></thead>
                  <tbody>
                    {emails.slice(0, 4).map((email) => (
                      <tr key={email.id}>
                        <td><strong>{email.subject}</strong><div className="email-subtext">{email.id}</div></td>
                        <td>{email.recipient}</td>
                        <td>{email.type}</td>
                        <td><span className={`email-badge ${statusClass(email.status)}`}>{email.status}</span></td>
                        <td>{email.createdAt}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="email-footer">
                <span>Sample records only. Provider delivery events are not connected.</span>
                <span>{emails.length} total records</span>
              </div>
            </section>
          </>
        )}

        {activeTab === "provider" && (
          <>
            <section className="email-card">
              <div className="email-card-header">
                <div><h2>Email Provider</h2><p>Select the provider type that your backend will use.</p></div>
                <Server size={21} color="#5265d9" />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12, padding: 22 }}>
                {[
                  { value: "smtp", title: "SMTP Server", description: "Use an SMTP relay with server-managed credentials." },
                  { value: "ses", title: "Amazon SES", description: "Use a verified domain and server-side cloud credentials." },
                  { value: "sendgrid", title: "SendGrid", description: "Use a transactional email API with restricted credentials." },
                  { value: "resend", title: "Resend", description: "Use a transactional email API and verified sender domain." },
                ].map((provider) => (
                  <label key={provider.value} className={`email-provider-card ${settings.provider === provider.value ? "active" : ""}`}>
                    <input type="radio" name="emailProvider" value={provider.value} checked={settings.provider === provider.value} onChange={() => updateSetting("provider", provider.value)} />
                    <div>
                      <strong>{provider.title}</strong>
                      <p>{provider.description}</p>
                    </div>
                  </label>
                ))}
              </div>
              {settings.provider === "smtp" ? (
                <div className="email-form-grid">
                  <div className="email-field">
                    <label htmlFor="smtpHost">SMTP Host</label>
                    <input id="smtpHost" value={settings.smtpHost} onChange={(event) => updateSetting("smtpHost", event.target.value)} placeholder="smtp.example.com" />
                  </div>
                  <div className="email-field">
                    <label htmlFor="smtpPort">SMTP Port</label>
                    <select id="smtpPort" value={settings.smtpPort} onChange={(event) => updateSetting("smtpPort", event.target.value)}>
                      <option value="587">587 — STARTTLS</option>
                      <option value="465">465 — Implicit TLS</option>
                      <option value="25">25 — Server relay</option>
                    </select>
                  </div>
                  <div className="email-field">
                    <label htmlFor="smtpUsername">SMTP Username</label>
                    <input id="smtpUsername" autoComplete="off" value={settings.smtpUsername} onChange={(event) => updateSetting("smtpUsername", event.target.value)} placeholder="SMTP username" />
                  </div>
                  <div className="email-field">
                    <label htmlFor="smtpPassword">SMTP Password</label>
                    <div className="email-input-with-action">
                      <input id="smtpPassword" type={showPassword ? "text" : "password"} autoComplete="new-password" value={settings.smtpPassword} onChange={(event) => updateSetting("smtpPassword", event.target.value)} placeholder="Configure on server" />
                      <button type="button" className="email-icon-btn" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                    </div>
                    <small>For production, do not save secrets in localStorage. Use server-side environment variables or a secrets manager.</small>
                  </div>
                  <div className="email-field">
                    <label htmlFor="encryption">Transport Encryption</label>
                    <select id="encryption" value={settings.encryption} onChange={(event) => updateSetting("encryption", event.target.value)}>
                      <option value="tls">STARTTLS</option>
                      <option value="ssl">Implicit TLS</option>
                      <option value="none">No encryption (not recommended)</option>
                    </select>
                  </div>
                  <div className="email-field">
                    <label htmlFor="timeoutSeconds">Connection Timeout (seconds)</label>
                    <input id="timeoutSeconds" type="number" min="5" max="180" value={settings.timeoutSeconds} onChange={(event) => updateSetting("timeoutSeconds", event.target.value)} />
                  </div>
                </div>
              ) : (
                <div className="email-form-grid">
                  <div className="email-field">
                    <label htmlFor="apiEndpoint">Provider API Endpoint</label>
                    <input id="apiEndpoint" value={settings.apiEndpoint} onChange={(event) => updateSetting("apiEndpoint", event.target.value)} placeholder="https://api.provider.example" />
                  </div>
                  <div className="email-field">
                    <label htmlFor="apiKey">Provider API Key</label>
                    <div className="email-input-with-action">
                      <input id="apiKey" type={showApiKey ? "text" : "password"} autoComplete="new-password" value={settings.apiKey} onChange={(event) => updateSetting("apiKey", event.target.value)} placeholder="Configure on server" />
                      <button type="button" className="email-icon-btn" aria-label={showApiKey ? "Hide API key" : "Show API key"} onClick={() => setShowApiKey((value) => !value)}>{showApiKey ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                    </div>
                    <small>Use a server-side secret store. Never expose API keys in browser code.</small>
                  </div>
                  <div className="email-field">
                    <label htmlFor="region">Provider Region</label>
                    <input id="region" value={settings.region} onChange={(event) => updateSetting("region", event.target.value)} placeholder="us-east-1" />
                  </div>
                </div>
              )}
              <Toggle title="Enable Email Service" description="Record the intended enabled state. Actual sending must also be enabled and validated by the backend." checked={settings.enabled} onChange={(value) => updateSetting("enabled", value)} />
              <Toggle title="Verify TLS Certificates" description="Require certificate validation for encrypted SMTP or HTTPS provider connections." checked={settings.verifyTls} onChange={(value) => updateSetting("verifyTls", value)} />
              <div className="email-footer">
                <span>Keep provider credentials outside client-side storage in production.</span>
                <button type="button" className="email-btn primary" onClick={saveSettings}><CheckCircle2 size={14} />Save Provider Settings</button>
              </div>
            </section>
          </>
        )}

        {activeTab === "sender" && (
          <>
            <section className="email-card">
              <div className="email-card-header">
                <div><h2>Sender Identity</h2><p>Set the default sender name, sender address, and reply-to address.</p></div>
                <Mail size={21} color="#5265d9" />
              </div>
              <div className="email-form-grid">
                <div className="email-field">
                  <label htmlFor="senderName">Sender Name</label>
                  <input id="senderName" value={settings.senderName} onChange={(event) => updateSetting("senderName", event.target.value)} />
                </div>
                <div className="email-field">
                  <label htmlFor="senderEmail">Sender Email</label>
                  <input id="senderEmail" type="email" value={settings.senderEmail} onChange={(event) => updateSetting("senderEmail", event.target.value)} />
                </div>
                <div className="email-field">
                  <label htmlFor="replyTo">Reply-To Address</label>
                  <input id="replyTo" type="email" value={settings.replyTo} onChange={(event) => updateSetting("replyTo", event.target.value)} />
                </div>
                <div className="email-field">
                  <label htmlFor="defaultFromDomain">Sender Domain</label>
                  <input id="defaultFromDomain" value={settings.defaultFromDomain} onChange={(event) => updateSetting("defaultFromDomain", event.target.value)} />
                  <small>Replace the example domain with a domain you control and have verified.</small>
                </div>
              </div>
              <Toggle title="Require Verified Sender" description="Prevent sending from unverified sender identities in the production provider." checked={settings.requireVerifiedSender} onChange={(value) => updateSetting("requireVerifiedSender", value)} />
            </section>

            <section className="email-card">
              <div className="email-card-header">
                <div><h2>Email Categories</h2><p>Control which types of email your notification service may send.</p></div>
                <FileText size={21} color="#5265d9" />
              </div>
              <Toggle title="Welcome Emails" description="Account onboarding and welcome messages." checked={settings.sendWelcomeEmails} onChange={(value) => updateSetting("sendWelcomeEmails", value)} />
              <Toggle title="Security Emails" description="Login alerts, credential changes, and security events." checked={settings.sendSecurityEmails} onChange={(value) => updateSetting("sendSecurityEmails", value)} />
              <Toggle title="Billing Emails" description="Invoices, payment receipts, and subscription notices." checked={settings.sendBillingEmails} onChange={(value) => updateSetting("sendBillingEmails", value)} />
              <Toggle title="Usage Reports" description="Usage summaries, quota warnings, and budget notifications." checked={settings.sendUsageReports} onChange={(value) => updateSetting("sendUsageReports", value)} />
              <Toggle title="Product Emails" description="Product updates and operational communications." checked={settings.sendProductEmails} onChange={(value) => updateSetting("sendProductEmails", value)} />
              <Toggle title="System Emails" description="Platform-generated notices and administrative communications." checked={settings.sendSystemEmails} onChange={(value) => updateSetting("sendSystemEmails", value)} />
              <Toggle title="Maintenance Emails" description="Planned maintenance and service availability notifications." checked={settings.sendMaintenanceEmails} onChange={(value) => updateSetting("sendMaintenanceEmails", value)} />
              <Toggle title="Marketing Emails" description="Optional promotional communications, subject to consent and applicable law." checked={settings.sendMarketingEmails} onChange={(value) => updateSetting("sendMarketingEmails", value)} />
              <div className="email-footer">
                <span>Respect unsubscribe preferences and applicable email regulations.</span>
                <button type="button" className="email-btn primary" onClick={saveSettings}><CheckCircle2 size={14} />Save Sender Settings</button>
              </div>
            </section>
          </>
        )}

        {activeTab === "delivery" && (
          <>
            <section className="email-card">
              <div className="email-card-header">
                <div><h2>Delivery Limits &amp; Retry Policy</h2><p>Configure local policy values for the backend email queue.</p></div>
                <Settings2 size={21} color="#5265d9" />
              </div>
              <div className="email-form-grid">
                <div className="email-field">
                  <label htmlFor="dailyLimit">Daily Sending Limit</label>
                  <input id="dailyLimit" type="number" min="1" value={settings.dailyLimit} onChange={(event) => updateSetting("dailyLimit", event.target.value)} />
                </div>
                <div className="email-field">
                  <label htmlFor="rateLimit">Rate Limit Per Minute</label>
                  <input id="rateLimit" type="number" min="1" value={settings.rateLimitPerMinute} onChange={(event) => updateSetting("rateLimitPerMinute", event.target.value)} />
                </div>
                <div className="email-field">
                  <label htmlFor="maxRecipients">Maximum Recipients Per Message</label>
                  <input id="maxRecipients" type="number" min="1" max="500" value={settings.maxRecipients} onChange={(event) => updateSetting("maxRecipients", event.target.value)} />
                </div>
                <div className="email-field">
                  <label htmlFor="retryAttempts">Maximum Retry Attempts</label>
                  <input id="retryAttempts" type="number" min="0" max="20" value={settings.retryAttempts} onChange={(event) => updateSetting("retryAttempts", event.target.value)} />
                </div>
                <div className="email-field">
                  <label htmlFor="retryDelay">Initial Retry Delay (minutes)</label>
                  <input id="retryDelay" type="number" min="1" max="1440" value={settings.retryDelay} onChange={(event) => updateSetting("retryDelay", event.target.value)} />
                </div>
                <div className="email-field">
                  <label htmlFor="connectTimeoutSeconds">Connection Timeout (seconds)</label>
                  <input id="connectTimeoutSeconds" type="number" min="1" max="180" value={settings.connectTimeoutSeconds} onChange={(event) => updateSetting("connectTimeoutSeconds", event.target.value)} />
                </div>
              </div>
              <Toggle title="Enable Email Queue" description="Use a durable backend queue rather than sending directly from request handlers." checked={settings.queueEnabled} onChange={(value) => updateSetting("queueEnabled", value)} />
              <Toggle title="Retry Transient Failures" description="Retry temporary failures with backoff and a maximum attempt count." checked={settings.retryEnabled} onChange={(value) => updateSetting("retryEnabled", value)} />
              <Toggle title="Bounce & Complaint Tracking" description="Process provider events and maintain bounce and complaint records." checked={settings.bounceTracking && settings.complaintTracking} onChange={(value) => { updateSetting("bounceTracking", value); updateSetting("complaintTracking", value); }} />
              <Toggle title="Suppression List" description="Prevent delivery to addresses that have bounced, complained, or unsubscribed." checked={settings.suppressionEnabled} onChange={(value) => updateSetting("suppressionEnabled", value)} />
              <Toggle title="Open Tracking" description="Enable open tracking only where appropriate and legally permitted." checked={settings.openTracking} onChange={(value) => updateSetting("openTracking", value)} />
              <Toggle title="Click Tracking" description="Enable link tracking only where appropriate and legally permitted." checked={settings.clickTracking} onChange={(value) => updateSetting("clickTracking", value)} />
              <div className="email-footer">
                <span>Enforce sending limits, retries, and suppression rules server-side.</span>
                <button type="button" className="email-btn primary" onClick={saveSettings}><CheckCircle2 size={14} />Save Delivery Policies</button>
              </div>
            </section>
          </>
        )}

        {activeTab === "activity" && (
          <section className="email-card">
            <div className="email-card-header">
              <div><h2>Email Activity Log</h2><p>Search and filter sample email delivery records.</p></div>
              <button type="button" className="email-btn primary" onClick={() => setShowTestModal(true)}><Plus size={14} />Add Test Record</button>
            </div>
            <div className="email-toolbar">
              <div className="email-search">
                <Search size={16} />
                <input aria-label="Search email activity" placeholder="Search recipient, subject, ID..." value={search} onChange={(event) => setSearch(event.target.value)} />
              </div>
              <select className="email-filter" aria-label="Filter email status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="All">All statuses</option>
                <option value="Delivered">Delivered</option>
                <option value="Queued">Queued</option>
                <option value="Failed">Failed</option>
                <option value="Bounced">Bounced</option>
              </select>
              <select className="email-filter" aria-label="Filter email type" value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
                <option value="All">All types</option>
                {emailTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
              <button type="button" className="email-btn" onClick={exportActivity}><Download size={14} />Export</button>
            </div>
            <div className="email-table-wrap">
              <table className="email-table">
                <thead><tr><th>Email</th><th>Recipient</th><th>Type</th><th>Provider</th><th>Created</th><th>Status</th><th>Update</th></tr></thead>
                <tbody>
                  {filteredEmails.map((email) => (
                    <tr key={email.id}>
                      <td><strong>{email.subject}</strong><div className="email-subtext">{email.id}</div></td>
                      <td>{email.recipient}</td>
                      <td>{email.type}</td>
                      <td>{email.provider}</td>
                      <td>{email.createdAt}</td>
                      <td><span className={`email-badge ${statusClass(email.status)}`}>{email.status}</span></td>
                      <td>
                        <select
                          className="email-filter"
                          aria-label={`Update ${email.id} status`}
                          value={email.status}
                          onChange={(event) => updateEmailStatus(email.id, event.target.value as EmailStatus)}
                        >
                          <option value="Queued">Queued</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Failed">Failed</option>
                          <option value="Bounced">Bounced</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredEmails.length === 0 && <div className="email-empty">No email records match your filters.</div>}
            </div>
            <div className="email-footer">
              <span>Showing {filteredEmails.length} of {emails.length} records</span>
              <span>Statuses can be edited for demo purposes only.</span>
            </div>
          </section>
        )}

        <div className="email-footer" style={{ padding: "12px 0 30px", borderTop: 0 }}>
          <span>ModelNow Admin · Email Settings</span>
          <button type="button" className="email-btn primary" onClick={saveSettings}><CheckCircle2 size={14} />Save All Changes</button>
        </div>
      </div>

      {showTestModal && (
        <div
          className="email-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowTestModal(false);
          }}
        >
          <section className="email-modal" role="dialog" aria-modal="true" aria-labelledby="email-test-title">
            <div className="email-modal-header">
              <h2 id="email-test-title">Create Email Test Record</h2>
              <button type="button" className="email-icon-btn" aria-label="Close dialog" onClick={() => setShowTestModal(false)}><X size={14} /></button>
            </div>
            <div className="email-modal-body">
              <div style={{ display: "grid", gap: 16 }}>
                <div className="email-field">
                  <label htmlFor="testRecipient">Recipient Email</label>
                  <input id="testRecipient" type="email" value={testRecipient} onChange={(event) => setTestRecipient(event.target.value)} placeholder="you@example.com" />
                </div>
                <div className="email-field">
                  <label htmlFor="testSubject">Subject</label>
                  <input id="testSubject" value={testSubject} onChange={(event) => setTestSubject(event.target.value)} placeholder="Test email subject" />
                </div>
              </div>
              <div className="email-warning" style={{ marginTop: 18, marginBottom: 0 }}>
                <AlertTriangle size={17} />
                <div>This creates a local queue record only. It does not send a real email or verify your provider.</div>
              </div>
              <div className="email-modal-actions">
                <button type="button" className="email-btn" onClick={() => setShowTestModal(false)}>Cancel</button>
                <button type="button" className="email-btn primary" onClick={addTestRecord}><Plus size={14} />Add Test Record</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
