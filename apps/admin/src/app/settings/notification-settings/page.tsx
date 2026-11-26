
"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Bell,
  Search,
  Plus,
  Download,
  RefreshCw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Smartphone,
  Monitor,
  ShieldCheck,
  CreditCard,
  Activity,
  Users,
  Server,
  Clock,
  X,
  Trash2,
  Send,
  Settings2,
  Filter,
  ChevronDown,
} from "lucide-react";

type NotificationChannel = "Email" | "In-app" | "Webhook" | "SMS";
type NotificationStatus = "Active" | "Paused" | "Failed";
type NotificationPriority = "Critical" | "High" | "Normal" | "Low";

type NotificationRule = {
  id: string;
  name: string;
  category: string;
  channel: NotificationChannel;
  recipient: string;
  priority: NotificationPriority;
  status: NotificationStatus;
  updatedAt: string;
};

const initialRules: NotificationRule[] = [
  { id: "NTF-001", name: "Security alerts", category: "Security", channel: "Email", recipient: "Security administrators", priority: "Critical", status: "Active", updatedAt: "2026-11-04" },
  { id: "NTF-002", name: "Payment failures", category: "Billing", channel: "Email", recipient: "Billing administrators", priority: "High", status: "Active", updatedAt: "2026-11-04" },
  { id: "NTF-003", name: "Usage threshold alerts", category: "Usage", channel: "In-app", recipient: "Organization owners", priority: "High", status: "Active", updatedAt: "2026-11-03" },
  { id: "NTF-004", name: "Provider outage", category: "Infrastructure", channel: "Email", recipient: "Platform operations", priority: "Critical", status: "Active", updatedAt: "2026-11-03" },
  { id: "NTF-005", name: "New organization created", category: "Organizations", channel: "In-app", recipient: "Platform administrators", priority: "Normal", status: "Paused", updatedAt: "2026-11-02" },
  { id: "NTF-006", name: "Weekly usage summary", category: "Reports", channel: "Email", recipient: "Organization owners", priority: "Low", status: "Active", updatedAt: "2026-11-01" },
  { id: "NTF-007", name: "API rate limit exceeded", category: "API", channel: "Webhook", recipient: "Configured endpoint", priority: "High", status: "Failed", updatedAt: "2026-10-31" },
];

const initialPreferences = {
  emailEnabled: true,
  inAppEnabled: true,
  smsEnabled: false,
  webhookEnabled: true,
  securityAlerts: true,
  billingAlerts: true,
  usageAlerts: true,
  modelAlerts: true,
  organizationAlerts: true,
  systemAlerts: true,
  maintenanceAlerts: true,
  productUpdates: false,
  digestEnabled: true,
  digestFrequency: "weekly",
  quietHoursEnabled: false,
  quietStart: "22:00",
  quietEnd: "08:00",
  criticalDuringQuietHours: true,
  retryFailed: true,
  groupSimilar: true,
  requireAcknowledgement: false,
  retentionDays: "90",
  usageThreshold: "80",
  deliveryRetries: "3",
  digestTime: "09:00",
  timezone: "Asia/Kolkata",
};

type Preferences = typeof initialPreferences;

const categories = [
  "Security",
  "Billing",
  "Usage",
  "Infrastructure",
  "Organizations",
  "Reports",
  "API",
  "Models",
  "Maintenance",
  "Product",
];

export default function NotificationSettingsPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const [rules, setRules] = useState<NotificationRule[]>(initialRules);
  const [preferences, setPreferences] = useState<Preferences>(initialPreferences);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [channelFilter, setChannelFilter] = useState("All");
  const [notice, setNotice] = useState("");
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRuleId, setEditingRuleId] = useState<string | null>(null);
  const [ruleForm, setRuleForm] = useState({
    name: "",
    category: "Security",
    channel: "Email" as NotificationChannel,
    recipient: "",
    priority: "Normal" as NotificationPriority,
  });

  const filteredRules = useMemo(() => {
    return rules.filter((rule) => {
      const searchable = `${rule.id} ${rule.name} ${rule.category} ${rule.recipient}`.toLowerCase();
      return (
        searchable.includes(search.toLowerCase()) &&
        (statusFilter === "All" || rule.status === statusFilter) &&
        (channelFilter === "All" || rule.channel === channelFilter)
      );
    });
  }, [rules, search, statusFilter, channelFilter]);

  const activeCount = rules.filter((rule) => rule.status === "Active").length;
  const pausedCount = rules.filter((rule) => rule.status === "Paused").length;
  const failedCount = rules.filter((rule) => rule.status === "Failed").length;

  function updatePreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    setPreferences((current) => ({ ...current, [key]: value }));
  }

  function saveSettings() {
    try {
      localStorage.setItem("modelnow-notification-preferences", JSON.stringify(preferences));
      localStorage.setItem("modelnow-notification-rules", JSON.stringify(rules));
      setNotice("Notification settings saved in this browser. Backend delivery integration is still required.");
    } catch {
      setNotice("Unable to save settings in this browser.");
    }
  }

  function resetDemo() {
    setRules(initialRules);
    setPreferences(initialPreferences);
    setSearch("");
    setStatusFilter("All");
    setChannelFilter("All");
    setNotice("Notification settings have been reset to demo values.");
  }

  function exportRules() {
    const headers = ["ID", "Name", "Category", "Channel", "Recipient", "Priority", "Status", "Updated"];
    const rows = filteredRules.map((rule) => [
      rule.id,
      rule.name,
      rule.category,
      rule.channel,
      rule.recipient,
      rule.priority,
      rule.status,
      rule.updatedAt,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-notification-rules.csv";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Notification rules exported.");
  }

  function openCreateRule() {
    setEditingRuleId(null);
    setRuleForm({
      name: "",
      category: "Security",
      channel: "Email",
      recipient: "",
      priority: "Normal",
    });
    setShowRuleModal(true);
  }

  function openEditRule(rule: NotificationRule) {
    setEditingRuleId(rule.id);
    setRuleForm({
      name: rule.name,
      category: rule.category,
      channel: rule.channel,
      recipient: rule.recipient,
      priority: rule.priority,
    });
    setShowRuleModal(true);
  }

  function saveRule() {
    if (!ruleForm.name.trim() || !ruleForm.recipient.trim()) {
      setNotice("Enter a rule name and recipient before saving.");
      return;
    }

    if (editingRuleId) {
      setRules((current) =>
        current.map((rule) =>
          rule.id === editingRuleId
            ? {
                ...rule,
                ...ruleForm,
                name: ruleForm.name.trim(),
                recipient: ruleForm.recipient.trim(),
                updatedAt: new Date().toISOString().slice(0, 10),
              }
            : rule,
        ),
      );
      setNotice("Notification rule updated.");
    } else {
      const newRule: NotificationRule = {
        id: `NTF-${String(Date.now()).slice(-6)}`,
        ...ruleForm,
        name: ruleForm.name.trim(),
        recipient: ruleForm.recipient.trim(),
        status: "Active",
        updatedAt: new Date().toISOString().slice(0, 10),
      };
      setRules((current) => [newRule, ...current]);
      setNotice("Notification rule created.");
    }

    setShowRuleModal(false);
  }

  function toggleRule(id: string) {
    setRules((current) =>
      current.map((rule) =>
        rule.id === id
          ? { ...rule, status: rule.status === "Active" ? "Paused" : "Active" }
          : rule,
      ),
    );
  }

  function deleteRule(id: string) {
    setRules((current) => current.filter((rule) => rule.id !== id));
    setNotice("Notification rule deleted from this demo.");
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
      <div className="notify-metric">
        <div className={`notify-metric-icon ${tone}`}>{icon}</div>
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
      <div className="notify-toggle">
        <div>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={title}
          className={`notify-switch ${checked ? "on" : ""}`}
          onClick={() => onChange(!checked)}
        />
      </div>
    );
  }

  function statusClass(status: NotificationStatus) {
    return status.toLowerCase();
  }

  return (
    <main className="notify-page">
      <style>{`
        .notify-page{min-height:100vh;padding:30px;background:#f7f8fc;color:#202a40;font-family:Arial,Helvetica,sans-serif}
        .notify-container{max-width:1280px;margin:0 auto}
        .notify-breadcrumb{display:flex;gap:9px;flex-wrap:wrap;margin-bottom:22px;color:#858da0;font-size:13px}
        .notify-breadcrumb a{color:#5265d9;text-decoration:none}
        .notify-heading{display:flex;justify-content:space-between;align-items:flex-start;gap:18px;margin-bottom:25px}
        .notify-heading-main{display:flex;align-items:center;gap:14px}
        .notify-heading-icon{display:grid;place-items:center;width:50px;height:50px;flex-shrink:0;border-radius:14px;background:#e9edff;color:#5265d9}
        .notify-heading h1{margin:0 0 7px;font-size:27px;letter-spacing:-.6px}
        .notify-heading p{max-width:720px;margin:0;color:#7e8799;font-size:13px;line-height:1.7}
        .notify-actions{display:flex;flex-wrap:wrap;gap:9px}
        .notify-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:39px;padding:0 13px;border:1px solid #dfe4ed;border-radius:9px;background:white;color:#414c64;font-size:12px;font-weight:600;cursor:pointer}
        .notify-btn.primary{background:#5265d9;border-color:#5265d9;color:white}
        .notify-btn.danger{color:#c24141}
        .notify-notice{display:flex;align-items:flex-start;gap:10px;margin-bottom:18px;padding:13px 15px;border:1px solid #dce4ff;border-radius:10px;background:#f0f3ff;color:#4055b5;font-size:12px;line-height:1.6}
        .notify-warning{display:flex;gap:12px;margin-bottom:20px;padding:15px;border:1px solid #f3dfb1;border-radius:11px;background:#fff9e9;color:#94651a;font-size:12px;line-height:1.7}
        .notify-warning strong{display:block;margin-bottom:4px}
        .notify-metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-bottom:22px}
        .notify-metric{display:flex;gap:13px;padding:19px;border:1px solid #e7eaf1;border-radius:12px;background:white}
        .notify-metric-icon{display:grid;place-items:center;width:41px;height:41px;flex-shrink:0;border-radius:10px;background:#edf0ff;color:#5265d9}
        .notify-metric-icon.green{background:#e8f8ef;color:#258452}
        .notify-metric-icon.orange{background:#fff5df;color:#a36e12}
        .notify-metric-icon.red{background:#fff0f0;color:#c24141}
        .notify-metric p{margin:2px 0 7px;color:#818a9c;font-size:11px}
        .notify-metric strong{font-size:23px}
        .notify-metric small{display:block;margin-top:6px;color:#929aab;font-size:10px;line-height:1.5}
        .notify-tabs{display:flex;flex-wrap:wrap;gap:6px;padding:6px;margin-bottom:18px;border:1px solid #e7eaf1;border-radius:11px;background:white}
        .notify-tab{display:inline-flex;align-items:center;gap:8px;padding:11px 14px;border:0;border-radius:7px;background:transparent;color:#6f7890;font-size:12px;font-weight:600;cursor:pointer}
        .notify-tab.active{background:#edf0ff;color:#485dd0}
        .notify-card{overflow:hidden;margin-bottom:18px;border:1px solid #e7eaf1;border-radius:13px;background:white;box-shadow:0 2px 7px rgba(24,36,70,.025)}
        .notify-card-header{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:20px 22px;border-bottom:1px solid #edf0f5}
        .notify-card-header h2{margin:0 0 6px;font-size:15px}
        .notify-card-header p{margin:0;color:#858da0;font-size:12px;line-height:1.6}
        .notify-toolbar{display:flex;flex-wrap:wrap;align-items:center;gap:10px;padding:16px 22px;border-bottom:1px solid #edf0f5}
        .notify-search{position:relative;flex:1 1 220px;min-width:180px}
        .notify-search svg{position:absolute;top:12px;left:12px;color:#929bad}
        .notify-search input{width:100%;height:40px;padding:0 12px 0 37px;border:1px solid #dfe4ed;border-radius:8px;outline:none;font-size:12px}
        .notify-filter{height:40px;min-width:130px;padding:0 12px;border:1px solid #dfe4ed;border-radius:8px;background:white;color:#4b566d;font-size:12px}
        .notify-table-wrap{overflow-x:auto}
        .notify-table{width:100%;border-collapse:collapse;text-align:left;white-space:nowrap}
        .notify-table th{padding:14px 15px;background:#fafbfe;color:#7f889a;font-size:10px;font-weight:700;letter-spacing:.5px;text-transform:uppercase}
        .notify-table td{padding:15px;border-top:1px solid #edf0f5;color:#4b566d;font-size:12px}
        .notify-table strong{color:#263149}
        .notify-subtext{margin-top:5px;color:#8991a2;font-size:10px}
        .notify-badge{display:inline-flex;align-items:center;gap:5px;padding:5px 9px;border-radius:20px;background:#f0f1f5;color:#697386;font-size:10px;font-weight:700}
        .notify-badge.active{background:#eaf9f0;color:#218552}
        .notify-badge.paused{background:#fff5df;color:#9a6a12}
        .notify-badge.failed{background:#fff0f0;color:#c24141}
        .notify-badge.critical{background:#fff0f0;color:#c24141}
        .notify-badge.high{background:#fff5df;color:#9a6a12}
        .notify-badge.normal{background:#edf0ff;color:#485dd0}
        .notify-badge.low{background:#f0f1f5;color:#697386}
        .notify-icon-btn{display:grid;place-items:center;width:32px;height:32px;border:1px solid #e4e8f0;border-radius:7px;background:white;color:#66718a;cursor:pointer}
        .notify-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px 22px;border-top:1px solid #edf0f5;color:#858da0;font-size:11px}
        .notify-empty{padding:42px 20px;text-align:center;color:#858da0;font-size:13px}
        .notify-form-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:17px;padding:22px}
        .notify-field{display:flex;flex-direction:column;gap:8px;min-width:0}
        .notify-field label{color:#39445a;font-size:12px;font-weight:700}
        .notify-field input,.notify-field select{width:100%;height:42px;padding:0 12px;border:1px solid #dfe4ed;border-radius:8px;outline:none;background:white;color:#202a40;font:inherit;font-size:12px}
        .notify-field input:focus,.notify-field select:focus{border-color:#8290ed;box-shadow:0 0 0 3px #edf0ff}
        .notify-field small{color:#8991a2;font-size:11px;line-height:1.6}
        .notify-field.full{grid-column:1/-1}
        .notify-toggle{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:17px 22px;border-bottom:1px solid #edf0f5}
        .notify-toggle:last-child{border-bottom:0}
        .notify-toggle strong{display:block;margin-bottom:5px;font-size:12px}
        .notify-toggle p{margin:0;color:#858da0;font-size:11px;line-height:1.6}
        .notify-switch{position:relative;width:38px;height:22px;flex:0 0 auto;padding:0;border:0;border-radius:20px;background:#cbd1dd;cursor:pointer}
        .notify-switch.on{background:#5265d9}
        .notify-switch:after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:white;transition:transform .15s ease}
        .notify-switch.on:after{transform:translateX(16px)}
        .notify-modal-backdrop{position:fixed;inset:0;z-index:50;display:grid;place-items:center;padding:20px;background:rgba(20,28,48,.45)}
        .notify-modal{width:100%;max-width:540px;overflow:hidden;border:1px solid #e7eaf1;border-radius:15px;background:white;box-shadow:0 20px 70px rgba(20,28,48,.2)}
        .notify-modal-header{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px 22px;border-bottom:1px solid #edf0f5}
        .notify-modal-header h2{margin:0;font-size:17px}
        .notify-modal-body{padding:22px}
        .notify-modal-actions{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:9px;margin-top:22px}
        @media(max-width:1050px){.notify-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:650px){.notify-page{padding:18px 12px}.notify-heading{flex-direction:column}.notify-heading h1{font-size:23px}.notify-actions{width:100%}.notify-btn{flex:1}.notify-tabs{overflow-x:auto;flex-wrap:nowrap}.notify-tab{white-space:nowrap}.notify-form-grid{grid-template-columns:1fr}.notify-field.full{grid-column:auto}.notify-footer{align-items:flex-start;flex-direction:column}}
      `}</style>

      <div className="notify-container">
        <div className="notify-breadcrumb">
          <a href="/dashboard">Admin</a><span>/</span>
          <a href="/settings">Settings</a><span>/</span>
          <span>Notification Settings</span>
        </div>

        <header className="notify-heading">
          <div className="notify-heading-main">
            <div className="notify-heading-icon"><Bell size={24} /></div>
            <div>
              <h1>Notification Settings</h1>
              <p>Manage platform alerts, delivery channels, notification rules, user preferences, and operational events.</p>
            </div>
          </div>
          <div className="notify-actions">
            <button type="button" className="notify-btn" onClick={resetDemo}><RefreshCw size={14} />Reset Demo</button>
            <button type="button" className="notify-btn" onClick={exportRules}><Download size={14} />Export Rules</button>
            <button type="button" className="notify-btn primary" onClick={saveSettings}><Save size={14} />Save Settings</button>
          </div>
        </header>

        {notice && (
          <div className="notify-notice" role="status">
            <CheckCircle2 size={17} />
            <span style={{ flex: 1 }}>{notice}</span>
            <button type="button" className="notify-icon-btn" aria-label="Dismiss notice" onClick={() => setNotice("")}><X size={14} /></button>
          </div>
        )}

        <div className="notify-warning">
          <AlertTriangle size={19} />
          <div>
            <strong>Notification delivery integration required</strong>
            This page manages demo configuration in the browser. Real email, SMS, in-app, and webhook delivery must be implemented and enforced by the backend.
          </div>
        </div>

        <section className="notify-metrics">
          <Metric title="Active Rules" value={activeCount} detail="Enabled notification rules" icon={<CheckCircle2 size={19} />} tone="green" />
          <Metric title="Paused Rules" value={pausedCount} detail="Currently disabled rules" icon={<Clock size={19} />} tone="orange" />
          <Metric title="Failed Rules" value={failedCount} detail="Require delivery investigation" icon={<AlertTriangle size={19} />} tone="red" />
          <Metric title="Total Rules" value={rules.length} detail="Configured demo rules" icon={<Bell size={19} />} tone="" />
        </section>

        <div className="notify-tabs">
          <button type="button" className={`notify-tab ${activeTab === "overview" ? "active" : ""}`} onClick={() => setActiveTab("overview")}><Activity size={15} />Overview</button>
          <button type="button" className={`notify-tab ${activeTab === "channels" ? "active" : ""}`} onClick={() => setActiveTab("channels")}><Send size={15} />Channels</button>
          <button type="button" className={`notify-tab ${activeTab === "preferences" ? "active" : ""}`} onClick={() => setActiveTab("preferences")}><Settings2 size={15} />Preferences</button>
          <button type="button" className={`notify-tab ${activeTab === "rules" ? "active" : ""}`} onClick={() => setActiveTab("rules")}><Filter size={15} />Notification Rules</button>
          <button type="button" className={`notify-tab ${activeTab === "delivery" ? "active" : ""}`} onClick={() => setActiveTab("delivery")}><ShieldCheck size={15} />Delivery Policies</button>
        </div>

        {activeTab === "overview" && (
          <>
            <section className="notify-card">
              <div className="notify-card-header">
                <div><h2>Notification Service Overview</h2><p>Review channel readiness and current policy configuration.</p></div>
                <button type="button" className="notify-btn" onClick={() => setActiveTab("channels")}><Settings2 size={14} />Configure Channels</button>
              </div>
              <div className="notify-form-grid">
                <div className="notify-field"><label>Email Notifications</label><input readOnly value={preferences.emailEnabled ? "Enabled in settings" : "Disabled"} /></div>
                <div className="notify-field"><label>In-app Notifications</label><input readOnly value={preferences.inAppEnabled ? "Enabled in settings" : "Disabled"} /></div>
                <div className="notify-field"><label>SMS Notifications</label><input readOnly value={preferences.smsEnabled ? "Enabled in settings" : "Disabled"} /></div>
                <div className="notify-field"><label>Webhook Notifications</label><input readOnly value={preferences.webhookEnabled ? "Enabled in settings" : "Disabled"} /></div>
                <div className="notify-field"><label>Usage Threshold</label><input readOnly value={`${preferences.usageThreshold}%`} /></div>
                <div className="notify-field"><label>Log Retention</label><input readOnly value={`${preferences.retentionDays} days`} /></div>
              </div>
              <div className="notify-footer">
                <span>These values reflect local demo configuration, not a live delivery health check.</span>
                <button type="button" className="notify-btn primary" onClick={() => setActiveTab("rules")}><Bell size={14} />Manage Rules</button>
              </div>
            </section>

            <section className="notify-card">
              <div className="notify-card-header">
                <div><h2>Recent Notification Rules</h2><p>Latest configured alert rules.</p></div>
                <button type="button" className="notify-btn" onClick={() => setActiveTab("rules")}>View All</button>
              </div>
              <div className="notify-table-wrap">
                <table className="notify-table">
                  <thead><tr><th>Rule</th><th>Category</th><th>Channel</th><th>Priority</th><th>Status</th></tr></thead>
                  <tbody>
                    {rules.slice(0, 5).map((rule) => (
                      <tr key={rule.id}>
                        <td><strong>{rule.name}</strong><div className="notify-subtext">{rule.id}</div></td>
                        <td>{rule.category}</td>
                        <td>{rule.channel}</td>
                        <td><span className={`notify-badge ${rule.priority.toLowerCase()}`}>{rule.priority}</span></td>
                        <td><span className={`notify-badge ${statusClass(rule.status)}`}>{rule.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {activeTab === "channels" && (
          <section className="notify-card">
            <div className="notify-card-header">
              <div><h2>Delivery Channels</h2><p>Enable or disable supported notification channels.</p></div>
              <Send size={21} color="#5265d9" />
            </div>
            <Toggle title="Email Notifications" description="Send transactional and operational notifications through the configured email service." checked={preferences.emailEnabled} onChange={(value) => updatePreference("emailEnabled", value)} />
            <Toggle title="In-app Notifications" description="Display notifications in the ModelNow application notification center." checked={preferences.inAppEnabled} onChange={(value) => updatePreference("inAppEnabled", value)} />
            <Toggle title="SMS Notifications" description="Allow SMS delivery for supported critical alerts when a provider is configured." checked={preferences.smsEnabled} onChange={(value) => updatePreference("smsEnabled", value)} />
            <Toggle title="Webhook Notifications" description="Send configured event payloads to authorized customer or internal webhook endpoints." checked={preferences.webhookEnabled} onChange={(value) => updatePreference("webhookEnabled", value)} />
            <div className="notify-form-grid">
              <div className="notify-field"><label>Default Email Provider</label><input readOnly value="Configured in Email Settings" /></div>
              <div className="notify-field"><label>Webhook Security</label><input readOnly value="Requires server-side signing and verification" /></div>
            </div>
            <div className="notify-footer"><span>Channel toggles do not establish provider connectivity.</span><button type="button" className="notify-btn primary" onClick={saveSettings}><Save size={14} />Save Channels</button></div>
          </section>
        )}

        {activeTab === "preferences" && (
          <>
            <section className="notify-card">
              <div className="notify-card-header">
                <div><h2>Notification Categories</h2><p>Choose which event categories can generate notifications.</p></div>
                <Bell size={21} color="#5265d9" />
              </div>
              <Toggle title="Security Alerts" description="Authentication events, access changes, and suspicious activity." checked={preferences.securityAlerts} onChange={(value) => updatePreference("securityAlerts", value)} />
              <Toggle title="Billing Alerts" description="Payments, invoices, subscription changes, and billing errors." checked={preferences.billingAlerts} onChange={(value) => updatePreference("billingAlerts", value)} />
              <Toggle title="Usage Alerts" description="Quota thresholds, rate limits, budget warnings, and usage summaries." checked={preferences.usageAlerts} onChange={(value) => updatePreference("usageAlerts", value)} />
              <Toggle title="Model Alerts" description="Model availability, provider errors, and routing anomalies." checked={preferences.modelAlerts} onChange={(value) => updatePreference("modelAlerts", value)} />
              <Toggle title="Organization Alerts" description="Organization creation, member changes, and policy updates." checked={preferences.organizationAlerts} onChange={(value) => updatePreference("organizationAlerts", value)} />
              <Toggle title="System Alerts" description="Service health, queue failures, and platform incidents." checked={preferences.systemAlerts} onChange={(value) => updatePreference("systemAlerts", value)} />
              <Toggle title="Maintenance Alerts" description="Planned maintenance and service interruption notices." checked={preferences.maintenanceAlerts} onChange={(value) => updatePreference("maintenanceAlerts", value)} />
              <Toggle title="Product Updates" description="Optional product announcements and feature updates." checked={preferences.productUpdates} onChange={(value) => updatePreference("productUpdates", value)} />
            </section>

            <section className="notify-card">
              <div className="notify-card-header">
                <div><h2>Digest &amp; Quiet Hours</h2><p>Configure notification summaries and delivery timing preferences.</p></div>
                <Clock size={21} color="#5265d9" />
              </div>
              <Toggle title="Scheduled Digest" description="Group eligible low-priority notifications into a scheduled summary." checked={preferences.digestEnabled} onChange={(value) => updatePreference("digestEnabled", value)} />
              <div className="notify-form-grid">
                <div className="notify-field">
                  <label htmlFor="digestFrequency">Digest Frequency</label>
                  <select id="digestFrequency" value={preferences.digestFrequency} onChange={(event) => updatePreference("digestFrequency", event.target.value)}>
                    <option value="daily">Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option>
                  </select>
                </div>
                <div className="notify-field">
                  <label htmlFor="digestTime">Digest Time</label>
                  <input id="digestTime" type="time" value={preferences.digestTime} onChange={(event) => updatePreference("digestTime", event.target.value)} />
                </div>
                <div className="notify-field">
                  <label htmlFor="timezone">Time Zone</label>
                  <select id="timezone" value={preferences.timezone} onChange={(event) => updatePreference("timezone", event.target.value)}>
                    <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                    <option value="Asia/Singapore">Asia/Singapore</option>
                  </select>
                </div>
              </div>
              <Toggle title="Enable Quiet Hours" description="Defer eligible non-critical notifications during the selected period." checked={preferences.quietHoursEnabled} onChange={(value) => updatePreference("quietHoursEnabled", value)} />
              <div className="notify-form-grid">
                <div className="notify-field"><label htmlFor="quietStart">Quiet Hours Start</label><input id="quietStart" type="time" value={preferences.quietStart} onChange={(event) => updatePreference("quietStart", event.target.value)} disabled={!preferences.quietHoursEnabled} /></div>
                <div className="notify-field"><label htmlFor="quietEnd">Quiet Hours End</label><input id="quietEnd" type="time" value={preferences.quietEnd} onChange={(event) => updatePreference("quietEnd", event.target.value)} disabled={!preferences.quietHoursEnabled} /></div>
              </div>
              <Toggle title="Deliver Critical Alerts During Quiet Hours" description="Allow critical security and infrastructure alerts to bypass quiet hours." checked={preferences.criticalDuringQuietHours} onChange={(value) => updatePreference("criticalDuringQuietHours", value)} />
              <div className="notify-footer"><span>Apply these preferences in the notification scheduling service.</span><button type="button" className="notify-btn primary" onClick={saveSettings}><Save size={14} />Save Preferences</button></div>
            </section>
          </>
        )}

        {activeTab === "rules" && (
          <section className="notify-card">
            <div className="notify-card-header">
              <div><h2>Notification Rules</h2><p>Create, search, update, pause, or remove event notification rules.</p></div>
              <button type="button" className="notify-btn primary" onClick={openCreateRule}><Plus size={14} />Create Rule</button>
            </div>
            <div className="notify-toolbar">
              <div className="notify-search"><Search size={16} /><input aria-label="Search rules" placeholder="Search name, recipient, category..." value={search} onChange={(event) => setSearch(event.target.value)} /></div>
              <select className="notify-filter" aria-label="Filter rule status" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
                <option value="All">All statuses</option><option value="Active">Active</option><option value="Paused">Paused</option><option value="Failed">Failed</option>
              </select>
              <select className="notify-filter" aria-label="Filter notification channel" value={channelFilter} onChange={(event) => setChannelFilter(event.target.value)}>
                <option value="All">All channels</option><option value="Email">Email</option><option value="In-app">In-app</option><option value="Webhook">Webhook</option><option value="SMS">SMS</option>
              </select>
              <button type="button" className="notify-btn" onClick={exportRules}><Download size={14} />Export</button>
            </div>
            <div className="notify-table-wrap">
              <table className="notify-table">
                <thead><tr><th>Rule</th><th>Category</th><th>Channel</th><th>Recipient</th><th>Priority</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {filteredRules.map((rule) => (
                    <tr key={rule.id}>
                      <td><strong>{rule.name}</strong><div className="notify-subtext">{rule.id} · Updated {rule.updatedAt}</div></td>
                      <td>{rule.category}</td><td>{rule.channel}</td><td>{rule.recipient}</td>
                      <td><span className={`notify-badge ${rule.priority.toLowerCase()}`}>{rule.priority}</span></td>
                      <td><span className={`notify-badge ${statusClass(rule.status)}`}>{rule.status}</span></td>
                      <td>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button type="button" className="notify-icon-btn" title="Edit rule" onClick={() => openEditRule(rule)}><Settings2 size={14} /></button>
                          <button type="button" className="notify-icon-btn" title={rule.status === "Active" ? "Pause rule" : "Activate rule"} onClick={() => toggleRule(rule.id)}>{rule.status === "Active" ? <Clock size={14} /> : <CheckCircle2 size={14} />}</button>
                          <button type="button" className="notify-icon-btn" title="Delete rule" onClick={() => deleteRule(rule.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredRules.length === 0 && <div className="notify-empty">No notification rules match your filters.</div>}
            </div>
            <div className="notify-footer"><span>Showing {filteredRules.length} of {rules.length} rules</span><span>Rule changes are local demo state.</span></div>
          </section>
        )}

        {activeTab === "delivery" && (
          <>
            <section className="notify-card">
              <div className="notify-card-header">
                <div><h2>Delivery &amp; Reliability</h2><p>Configure retry, grouping, acknowledgement, and retention policies.</p></div>
                <ShieldCheck size={21} color="#5265d9" />
              </div>
              <div className="notify-form-grid">
                <div className="notify-field"><label htmlFor="deliveryRetries">Maximum Delivery Retries</label><input id="deliveryRetries" type="number" min="0" max="20" value={preferences.deliveryRetries} onChange={(event) => updatePreference("deliveryRetries", event.target.value)} /></div>
                <div className="notify-field"><label htmlFor="retentionDays">Notification Log Retention (days)</label><input id="retentionDays" type="number" min="1" max="3650" value={preferences.retentionDays} onChange={(event) => updatePreference("retentionDays", event.target.value)} /></div>
                <div className="notify-field"><label htmlFor="usageThreshold">Usage Alert Threshold (%)</label><input id="usageThreshold" type="number" min="1" max="100" value={preferences.usageThreshold} onChange={(event) => updatePreference("usageThreshold", event.target.value)} /></div>
              </div>
              <Toggle title="Retry Failed Deliveries" description="Retry transient delivery errors with exponential backoff." checked={preferences.retryFailed} onChange={(value) => updatePreference("retryFailed", value)} />
              <Toggle title="Group Similar Notifications" description="Combine repeated events into a single notification where supported." checked={preferences.groupSimilar} onChange={(value) => updatePreference("groupSimilar", value)} />
              <Toggle title="Require Acknowledgement" description="Require authorized administrators to acknowledge selected critical incidents." checked={preferences.requireAcknowledgement} onChange={(value) => updatePreference("requireAcknowledgement", value)} />
              <div className="notify-footer"><span>Delivery guarantees depend on backend queues and provider integrations.</span><button type="button" className="notify-btn primary" onClick={saveSettings}><Save size={14} />Save Delivery Policies</button></div>
            </section>
            <section className="notify-card">
              <div className="notify-card-header">
                <div><h2>Operational Guidance</h2><p>Recommended controls for production notification services.</p></div>
                <ShieldCheck size={21} color="#5265d9" />
              </div>
              {[
                ["Idempotent delivery", "Use event identifiers to prevent duplicate notifications during retries."],
                ["Channel-specific rate limits", "Apply per-user, per-organization, and per-channel sending limits."],
                ["Sensitive data protection", "Avoid including API keys, credentials, or private user data in notification payloads."],
                ["Delivery observability", "Track queued, delivered, failed, bounced, and suppressed notification events."],
              ].map(([title, description]) => (
                <div className="notify-toggle" key={title}>
                  <div><strong>{title}</strong><p>{description}</p></div>
                  <CheckCircle2 size={18} color="#258452" />
                </div>
              ))}
            </section>
          </>
        )}

        <div className="notify-footer" style={{ padding: "12px 0 30px", borderTop: 0 }}>
          <span>ModelNow Admin · Notification Settings</span>
          <button type="button" className="notify-btn primary" onClick={saveSettings}><Save size={14} />Save All Changes</button>
        </div>
      </div>

      {showRuleModal && (
        <div className="notify-modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setShowRuleModal(false); }}>
          <section className="notify-modal" role="dialog" aria-modal="true" aria-labelledby="notify-rule-title">
            <div className="notify-modal-header">
              <h2 id="notify-rule-title">{editingRuleId ? "Edit Notification Rule" : "Create Notification Rule"}</h2>
              <button type="button" className="notify-icon-btn" aria-label="Close dialog" onClick={() => setShowRuleModal(false)}><X size={14} /></button>
            </div>
            <div className="notify-modal-body">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: 15 }}>
                <div className="notify-field" style={{ gridColumn: "1/-1" }}>
                  <label htmlFor="ruleName">Rule Name</label>
                  <input id="ruleName" value={ruleForm.name} onChange={(event) => setRuleForm((current) => ({ ...current, name: event.target.value }))} placeholder="e.g. Model provider outage" />
                </div>
                <div className="notify-field">
                  <label htmlFor="ruleCategory">Category</label>
                  <select id="ruleCategory" value={ruleForm.category} onChange={(event) => setRuleForm((current) => ({ ...current, category: event.target.value }))}>
                    {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                  </select>
                </div>
                <div className="notify-field">
                  <label htmlFor="ruleChannel">Channel</label>
                  <select id="ruleChannel" value={ruleForm.channel} onChange={(event) => setRuleForm((current) => ({ ...current, channel: event.target.value as NotificationChannel }))}>
                    <option value="Email">Email</option><option value="In-app">In-app</option><option value="Webhook">Webhook</option><option value="SMS">SMS</option>
                  </select>
                </div>
                <div className="notify-field" style={{ gridColumn: "1/-1" }}>
                  <label htmlFor="ruleRecipient">Recipient or Destination</label>
                  <input id="ruleRecipient" value={ruleForm.recipient} onChange={(event) => setRuleForm((current) => ({ ...current, recipient: event.target.value }))} placeholder="Team, role, email, or endpoint name" />
                </div>
                <div className="notify-field">
                  <label htmlFor="rulePriority">Priority</label>
                  <select id="rulePriority" value={ruleForm.priority} onChange={(event) => setRuleForm((current) => ({ ...current, priority: event.target.value as NotificationPriority }))}>
                    <option value="Critical">Critical</option><option value="High">High</option><option value="Normal">Normal</option><option value="Low">Low</option>
                  </select>
                </div>
              </div>
              <div className="notify-modal-actions">
                <button type="button" className="notify-btn" onClick={() => setShowRuleModal(false)}>Cancel</button>
                <button type="button" className="notify-btn primary" onClick={saveRule}><Save size={14} />{editingRuleId ? "Save Changes" : "Create Rule"}</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
