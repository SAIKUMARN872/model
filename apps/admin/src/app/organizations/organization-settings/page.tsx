
"use client";

import { useState, type CSSProperties } from "react";
import {
  Building2,
  Save,
  RefreshCw,
  Globe,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  Bell,
  Users,
  CreditCard,
  Database,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  X,
  LockKeyhole,
  Clock3,
  FileText,
  ChevronRight,
  Settings2,
} from "lucide-react";

type SettingsTab =
  | "general"
  | "regional"
  | "notifications"
  | "access"
  | "data"
  | "danger";

type OrganizationSettings = {
  name: string;
  slug: string;
  industry: string;
  website: string;
  email: string;
  phone: string;
  description: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  timezone: string;
  language: string;
  dateFormat: string;
  weekStarts: string;
  defaultRole: string;
  sessionDuration: string;
  requireMfa: boolean;
  inviteApproval: boolean;
  emailNotifications: boolean;
  securityAlerts: boolean;
  usageAlerts: boolean;
  billingNotifications: boolean;
  weeklyReport: boolean;
  auditRetention: string;
  dataRegion: string;
  allowExports: boolean;
  allowApiKeys: boolean;
};

const initialSettings: OrganizationSettings = {
  name: "Acme Corporation",
  slug: "acme-corporation",
  industry: "Technology",
  website: "https://acme.example",
  email: "admin@acme.example",
  phone: "+91 98765 43210",
  description: "Enterprise AI workspace for teams, applications, and internal workflows.",
  address: "12 Business Park",
  city: "Hyderabad",
  state: "Telangana",
  country: "India",
  postalCode: "500001",
  timezone: "Asia/Kolkata",
  language: "en",
  dateFormat: "DD MMM YYYY",
  weekStarts: "Monday",
  defaultRole: "Member",
  sessionDuration: "12 hours",
  requireMfa: true,
  inviteApproval: false,
  emailNotifications: true,
  securityAlerts: true,
  usageAlerts: true,
  billingNotifications: true,
  weeklyReport: false,
  auditRetention: "90 days",
  dataRegion: "Asia Pacific",
  allowExports: true,
  allowApiKeys: true,
};

const tabs: {
  id: SettingsTab;
  label: string;
  description: string;
  icon: typeof Building2;
}[] = [
  { id: "general", label: "General", description: "Organization identity and contact information", icon: Building2 },
  { id: "regional", label: "Regional preferences", description: "Language, timezone, and date formatting", icon: Globe },
  { id: "notifications", label: "Notifications", description: "Email updates and operational alerts", icon: Bell },
  { id: "access", label: "Access and permissions", description: "Default roles and authentication requirements", icon: ShieldCheck },
  { id: "data", label: "Data management", description: "Data region, exports, and retention preferences", icon: Database },
  { id: "danger", label: "Danger zone", description: "Sensitive organization-level actions", icon: AlertTriangle },
];

const fieldStyle: CSSProperties = {
  width: "100%",
  minWidth: 0,
  padding: "11px 12px",
  border: "1px solid #dfe5ef",
  borderRadius: 8,
  background: "#fff",
  color: "#263248",
  fontSize: 12,
  outline: "none",
};

const labelStyle: CSSProperties = {
  display: "block",
  marginBottom: 7,
  color: "#4c5870",
  fontSize: 11,
  fontWeight: 650,
};

export default function OrganizationSettingsPage() {
  const [settings, setSettings] = useState<OrganizationSettings>(initialSettings);
  const [savedSettings, setSavedSettings] = useState<OrganizationSettings>(initialSettings);
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [notice, setNotice] = useState("");
  const [noticeType, setNoticeType] = useState<"success" | "warning">("success");
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [saving, setSaving] = useState(false);

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(savedSettings);

  function update<K extends keyof OrganizationSettings>(
    key: K,
    value: OrganizationSettings[K],
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function showMessage(
    message: string,
    type: "success" | "warning" = "success",
  ) {
    setNotice(message);
    setNoticeType(type);
  }

  function saveSettings() {
    setSaving(true);

    // Preview only: connect this action to the organization's settings API.
    setTimeout(() => {
      setSavedSettings({ ...settings });
      setSaving(false);
      showMessage(
        "Settings saved in this page's current session. Connect the backend API for persistent organization settings.",
      );
    }, 300);
  }

  function resetSettings() {
    setSettings({ ...savedSettings });
    setShowResetConfirm(false);
    showMessage("Unsaved changes have been discarded.");
  }

  function resetToDefaults() {
    setSettings({ ...initialSettings });
    setShowResetConfirm(false);
    showMessage("Default preview settings restored. Save to apply them to this page's session.");
  }

  function downloadSettings() {
    const content = JSON.stringify(settings, null, 2);
    const blob = new Blob([content], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-organization-settings.json";
    anchor.click();
    URL.revokeObjectURL(url);
    showMessage("Organization settings exported as JSON.");
  }

  function requestDelete() {
    if (deleteConfirmation !== settings.name) {
      showMessage("Enter the exact organization name to continue the preview confirmation.", "warning");
      return;
    }

    setShowDeleteConfirm(false);
    setDeleteConfirmation("");
    showMessage(
      "Deletion was not performed. Connect an authenticated backend workflow with authorization checks and explicit confirmation before implementing organization deletion.",
      "warning",
    );
  }

  function renderField(
    label: string,
    key: keyof OrganizationSettings,
    placeholder = "",
    type = "text",
  ) {
    const value = settings[key];

    return (
      <div key={key}>
        <label htmlFor={`org-setting-${key}`} style={labelStyle}>{label}</label>
        <input
          id={`org-setting-${key}`}
          type={type}
          value={String(value)}
          placeholder={placeholder}
          onChange={(event) => update(key, event.target.value as never)}
          style={fieldStyle}
        />
      </div>
    );
  }

  function renderSelect(
    label: string,
    key: keyof OrganizationSettings,
    options: string[],
  ) {
    return (
      <div key={key}>
        <label htmlFor={`org-setting-${key}`} style={labelStyle}>{label}</label>
        <select
          id={`org-setting-${key}`}
          value={String(settings[key])}
          onChange={(event) => update(key, event.target.value as never)}
          style={fieldStyle}
        >
          {options.map((option) => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>
    );
  }

  function renderToggle(
    title: string,
    description: string,
    key: keyof OrganizationSettings,
  ) {
    const checked = Boolean(settings[key]);

    return (
      <div className="org-settings-toggle-row" key={key}>
        <div className="org-settings-toggle-copy">
          <div className="org-settings-toggle-title">{title}</div>
          <div className="org-settings-toggle-description">{description}</div>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={title}
          className={`org-settings-switch ${checked ? "on" : ""}`}
          onClick={() => update(key, !checked as never)}
        >
          <span className="org-settings-switch-knob" />
        </button>
      </div>
    );
  }

  return (
    <main className="org-settings-page">
      <style>{`
        * { box-sizing: border-box; }
        .org-settings-page {
          min-height: 100vh; padding: 30px; background: #f7f8fc;
          color: #182238; font-family: Arial, Helvetica, sans-serif;
        }
        .org-settings-container { max-width: 1420px; margin: 0 auto; }
        .org-settings-breadcrumb { margin-bottom: 15px; color: #8490a4; font-size: 12px; }
        .org-settings-breadcrumb span { color: #315fe8; }
        .org-settings-header {
          display: flex; justify-content: space-between; align-items: flex-start;
          gap: 18px; flex-wrap: wrap; margin-bottom: 25px;
        }
        .org-settings-heading { margin: 0 0 8px; font-size: 27px; font-weight: 750; letter-spacing: -.7px; }
        .org-settings-subheading { margin: 0; color: #7e899d; font-size: 13px; line-height: 1.6; }
        .org-settings-header-actions { display: flex; gap: 9px; flex-wrap: wrap; }
        .org-settings-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 10px 13px; border: 1px solid #dfe4ed; border-radius: 8px;
          background: #fff; color: #435069; font-size: 12px; font-weight: 650; cursor: pointer;
        }
        .org-settings-btn:hover { background: #f1f4fb; }
        .org-settings-btn:disabled { opacity: .6; cursor: not-allowed; }
        .org-settings-btn.primary { background: #315fe8; color: #fff; border-color: #315fe8; }
        .org-settings-btn.danger { background: #c83f43; color: #fff; border-color: #c83f43; }
        .org-settings-notice {
          display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;
          padding: 12px 14px; margin-bottom: 18px; border-radius: 9px;
          font-size: 12px; line-height: 1.6;
        }
        .org-settings-notice.success { border: 1px solid #bce8ce; background: #effaf3; color: #176c40; }
        .org-settings-notice.warning { border: 1px solid #f1d9a6; background: #fff8e9; color: #875b0a; }
        .org-settings-dismiss { border: 0; background: transparent; color: inherit; cursor: pointer; }
        .org-settings-summary {
          display: flex; align-items: center; gap: 15px; padding: 19px;
          margin-bottom: 21px; border: 1px solid #e7ebf3; border-radius: 12px; background: #fff;
        }
        .org-settings-org-icon {
          display: grid; place-items: center; width: 52px; height: 52px;
          border-radius: 13px; background: #edf2ff; color: #315fe8; flex-shrink: 0;
        }
        .org-settings-org-name { margin: 0 0 5px; font-size: 16px; font-weight: 750; }
        .org-settings-org-meta { color: #8590a3; font-size: 11px; line-height: 1.6; overflow-wrap: anywhere; }
        .org-settings-summary-right { margin-left: auto; text-align: right; }
        .org-settings-badge {
          display: inline-flex; align-items: center; gap: 6px; padding: 6px 9px;
          border-radius: 20px; background: #eaf8ef; color: #187747; font-size: 10px; font-weight: 700;
        }
        .org-settings-layout { display: grid; grid-template-columns: 255px minmax(0, 1fr); gap: 20px; align-items: start; }
        .org-settings-sidebar { padding: 8px; border: 1px solid #e7ebf3; border-radius: 12px; background: #fff; }
        .org-settings-sidebar-label { padding: 11px 10px 8px; color: #9aa3b3; font-size: 9px; font-weight: 750; letter-spacing: .8px; text-transform: uppercase; }
        .org-settings-nav {
          display: flex; align-items: center; gap: 10px; width: 100%;
          padding: 11px 10px; border: 0; border-radius: 8px; background: transparent;
          text-align: left; color: #65718a; cursor: pointer;
        }
        .org-settings-nav:hover { background: #f6f8fd; }
        .org-settings-nav.active { background: #edf2ff; color: #315fe8; }
        .org-settings-nav.danger { color: #c34442; }
        .org-settings-nav-copy { min-width: 0; flex: 1; }
        .org-settings-nav-title { font-size: 11px; font-weight: 700; }
        .org-settings-nav-description { margin-top: 4px; color: #939caf; font-size: 9px; line-height: 1.5; }
        .org-settings-nav.active .org-settings-nav-description { color: #647dbb; }
        .org-settings-card { border: 1px solid #e7ebf3; border-radius: 12px; background: #fff; overflow: hidden; }
        .org-settings-card-header { padding: 21px 23px; border-bottom: 1px solid #edf0f5; }
        .org-settings-card-title { margin: 0 0 6px; font-size: 15px; font-weight: 750; }
        .org-settings-card-description { margin: 0; color: #8792a5; font-size: 11px; line-height: 1.6; }
        .org-settings-card-body { padding: 23px; }
        .org-settings-section-label {
          margin: 0 0 16px; color: #26344c; font-size: 12px; font-weight: 750;
        }
        .org-settings-section-note { margin: -9px 0 17px; color: #8792a5; font-size: 11px; line-height: 1.6; }
        .org-settings-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 18px 16px; }
        .org-settings-span-2 { grid-column: 1 / -1; }
        .org-settings-divider { height: 1px; margin: 23px 0; background: #edf0f5; }
        .org-settings-textarea {
          width: 100%; min-height: 92px; resize: vertical; padding: 11px 12px;
          border: 1px solid #dfe5ef; border-radius: 8px; font: inherit;
          color: #263248; font-size: 12px; outline: none;
        }
        .org-settings-textarea:focus, .org-settings-page input:focus, .org-settings-page select:focus { border-color: #7898ff; }
        .org-settings-toggle-row {
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          padding: 16px 0; border-bottom: 1px solid #edf0f5;
        }
        .org-settings-toggle-row:last-child { border-bottom: 0; }
        .org-settings-toggle-copy { flex: 1; min-width: 0; }
        .org-settings-toggle-title { margin-bottom: 5px; color: #303c53; font-size: 12px; font-weight: 700; }
        .org-settings-toggle-description { color: #8993a6; font-size: 11px; line-height: 1.6; }
        .org-settings-switch {
          position: relative; flex-shrink: 0; width: 39px; height: 23px;
          border: 0; border-radius: 20px; background: #c8cfdb; cursor: pointer;
        }
        .org-settings-switch.on { background: #315fe8; }
        .org-settings-switch-knob {
          position: absolute; top: 3px; left: 3px; width: 17px; height: 17px;
          border-radius: 50%; background: #fff; transition: left .15s;
        }
        .org-settings-switch.on .org-settings-switch-knob { left: 19px; }
        .org-settings-info {
          display: flex; align-items: flex-start; gap: 10px; padding: 13px;
          margin-top: 18px; border: 1px solid #e2e8fa; border-radius: 9px;
          background: #f5f7ff; color: #5a6784; font-size: 11px; line-height: 1.6;
        }
        .org-settings-info strong { color: #314779; }
        .org-settings-danger-card { padding: 17px 0; border-bottom: 1px solid #f1e5e5; }
        .org-settings-danger-card:last-child { border-bottom: 0; }
        .org-settings-danger-title { margin: 0 0 7px; color: #b33c3f; font-size: 13px; font-weight: 750; }
        .org-settings-danger-description { margin: 0 0 14px; color: #7e899d; font-size: 11px; line-height: 1.7; }
        .org-settings-card-footer {
          display: flex; justify-content: space-between; align-items: center; gap: 12px;
          flex-wrap: wrap; padding: 15px 23px; border-top: 1px solid #edf0f5; background: #fbfcfe;
        }
        .org-settings-footer-note { color: #8a95a8; font-size: 10px; }
        .org-settings-footer-actions { display: flex; gap: 8px; flex-wrap: wrap; }
        .org-settings-modal-backdrop {
          position: fixed; inset: 0; z-index: 100; display: grid; place-items: center;
          padding: 18px; background: #0f172a7a;
        }
        .org-settings-modal { width: 100%; max-width: 450px; border-radius: 14px; background: #fff; overflow: hidden; }
        .org-settings-modal-body { padding: 22px; }
        .org-settings-modal-title { margin: 0 0 9px; font-size: 17px; font-weight: 750; }
        .org-settings-modal-description { margin: 0 0 18px; color: #7f8ba0; font-size: 12px; line-height: 1.7; }
        .org-settings-modal-footer { display: flex; justify-content: flex-end; gap: 8px; padding: 14px 22px; border-top: 1px solid #edf0f5; background: #fbfcfe; }
        @media (max-width: 900px) { .org-settings-layout { grid-template-columns: 1fr; } .org-settings-sidebar { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 3px; } .org-settings-sidebar-label { grid-column: 1 / -1; } }
        @media (max-width: 600px) {
          .org-settings-page { padding: 16px; }
          .org-settings-heading { font-size: 23px; }
          .org-settings-summary { align-items: flex-start; flex-wrap: wrap; }
          .org-settings-summary-right { width: 100%; margin-left: 0; text-align: left; }
          .org-settings-sidebar { grid-template-columns: 1fr; }
          .org-settings-form-grid { grid-template-columns: 1fr; }
          .org-settings-span-2 { grid-column: auto; }
          .org-settings-card-header, .org-settings-card-body { padding: 17px; }
          .org-settings-card-footer { padding: 14px 17px; }
          .org-settings-footer-actions { width: 100%; }
          .org-settings-footer-actions button { flex: 1; }
        }
      `}</style>

      <div className="org-settings-container">
        <div className="org-settings-breadcrumb">
          Organizations / <span>Settings</span>
        </div>

        <header className="org-settings-header">
          <div>
            <h1 className="org-settings-heading">Organization Settings</h1>
            <p className="org-settings-subheading">
              Manage organization identity, preferences, notifications, and access controls.
            </p>
          </div>
          <div className="org-settings-header-actions">
            <button className="org-settings-btn" onClick={downloadSettings}>
              <FileText size={14} /> Export settings
            </button>
            <button
              className="org-settings-btn primary"
              onClick={saveSettings}
              disabled={!hasChanges || saving}
            >
              <Save size={14} /> {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </header>

        {notice && (
          <div className={`org-settings-notice ${noticeType}`} role="status">
            <span>{noticeType === "success" ? <CheckCircle2 size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: 7 }} /> : <AlertTriangle size={15} style={{ display: "inline", verticalAlign: "middle", marginRight: 7 }} />}{notice}</span>
            <button className="org-settings-dismiss" onClick={() => setNotice("")} aria-label="Dismiss notification">
              <X size={15} />
            </button>
          </div>
        )}

        <section className="org-settings-summary">
          <div className="org-settings-org-icon"><Building2 size={25} /></div>
          <div style={{ minWidth: 0 }}>
            <h2 className="org-settings-org-name">{settings.name || "Unnamed organization"}</h2>
            <div className="org-settings-org-meta">
              Organization slug: {settings.slug || "Not set"} · {settings.industry || "Industry not set"}
            </div>
            <div className="org-settings-org-meta">{settings.email || "No contact email configured"}</div>
          </div>
          <div className="org-settings-summary-right">
            <span className="org-settings-badge"><CheckCircle2 size={12} /> Active preview</span>
            <div className="org-settings-org-meta" style={{ marginTop: 7 }}>
              {hasChanges ? "Unsaved changes" : "No unsaved changes"}
            </div>
          </div>
        </section>

        <div className="org-settings-layout">
          <aside className="org-settings-sidebar">
            <div className="org-settings-sidebar-label">Organization configuration</div>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  className={`org-settings-nav ${activeTab === tab.id ? "active" : ""} ${tab.id === "danger" ? "danger" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={17} />
                  <div className="org-settings-nav-copy">
                    <div className="org-settings-nav-title">{tab.label}</div>
                    <div className="org-settings-nav-description">{tab.description}</div>
                  </div>
                  <ChevronRight size={13} />
                </button>
              );
            })}
          </aside>

          <section className="org-settings-card">
            <div className="org-settings-card-header">
              <h2 className="org-settings-card-title">
                {tabs.find((tab) => tab.id === activeTab)?.label}
              </h2>
              <p className="org-settings-card-description">
                {tabs.find((tab) => tab.id === activeTab)?.description}
              </p>
            </div>

            {activeTab === "general" && (
              <div className="org-settings-card-body">
                <h3 className="org-settings-section-label">Organization identity</h3>
                <p className="org-settings-section-note">Basic information used to identify this organization in the ModelNow admin workspace.</p>
                <div className="org-settings-form-grid">
                  {renderField("Organization name", "name", "Enter organization name")}
                  {renderField("Organization slug", "slug", "organization-slug")}
                  {renderSelect("Industry", "industry", ["Technology", "Financial services", "Healthcare", "Education", "Retail", "Manufacturing", "Consulting", "Other"])}
                  {renderField("Website", "website", "https://example.com", "url")}
                  {renderField("Contact email", "email", "admin@example.com", "email")}
                  {renderField("Contact phone", "phone", "+91 00000 00000", "tel")}
                  <div className="org-settings-span-2">
                    <label htmlFor="org-setting-description" style={labelStyle}>Organization description</label>
                    <textarea
                      id="org-setting-description"
                      className="org-settings-textarea"
                      value={settings.description}
                      onChange={(event) => update("description", event.target.value)}
                      placeholder="Describe your organization"
                    />
                  </div>
                </div>

                <div className="org-settings-divider" />
                <h3 className="org-settings-section-label">Business address</h3>
                <div className="org-settings-form-grid">
                  {renderField("Street address", "address", "Street and building")}
                  {renderField("City", "city", "City")}
                  {renderField("State / province", "state", "State")}
                  {renderField("Country", "country", "Country")}
                  {renderField("Postal code", "postalCode", "Postal code")}
                </div>
              </div>
            )}

            {activeTab === "regional" && (
              <div className="org-settings-card-body">
                <h3 className="org-settings-section-label">Regional preferences</h3>
                <p className="org-settings-section-note">Choose how dates, times, and language preferences appear in the admin workspace.</p>
                <div className="org-settings-form-grid">
                  {renderSelect("Timezone", "timezone", ["Asia/Kolkata", "UTC", "America/New_York", "America/Los_Angeles", "Europe/London", "Europe/Berlin", "Asia/Singapore", "Asia/Tokyo"])}
                  {renderSelect("Display language", "language", ["en", "en-GB", "hi", "te", "fr", "de", "es", "ja"])}
                  {renderSelect("Date format", "dateFormat", ["DD MMM YYYY", "DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"])}
                  {renderSelect("Week starts on", "weekStarts", ["Monday", "Sunday", "Saturday"])}
                </div>
                <div className="org-settings-info">
                  <Globe size={17} />
                  <div><strong>Preview only.</strong> These selections update this page's local form state. Connect your backend and shared formatting utilities to apply regional preferences across the application.</div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="org-settings-card-body">
                <h3 className="org-settings-section-label">Email and operational notifications</h3>
                <p className="org-settings-section-note">Choose which notifications this organization would like to receive.</p>
                {renderToggle("Email notifications", "Enable organization-level email notifications.", "emailNotifications")}
                {renderToggle("Security alerts", "Notify designated contacts about suspicious sign-ins and security events.", "securityAlerts")}
                {renderToggle("Usage alerts", "Notify contacts when AI usage or configured thresholds require attention.", "usageAlerts")}
                {renderToggle("Billing notifications", "Receive invoice, payment, and subscription-related notices.", "billingNotifications")}
                {renderToggle("Weekly activity report", "Prepare a weekly summary of organization activity and usage.", "weeklyReport")}
                <div className="org-settings-info">
                  <Mail size={17} />
                  <div><strong>Delivery is not connected.</strong> These controls are UI preferences only. Email delivery requires a notification service and backend configuration.</div>
                </div>
              </div>
            )}

            {activeTab === "access" && (
              <div className="org-settings-card-body">
                <h3 className="org-settings-section-label">Default access configuration</h3>
                <p className="org-settings-section-note">Configure intended defaults for new members and organization sessions.</p>
                <div className="org-settings-form-grid">
                  {renderSelect("Default role for new members", "defaultRole", ["Member", "Viewer", "Developer", "Admin"])}
                  {renderSelect("Session duration", "sessionDuration", ["1 hour", "4 hours", "8 hours", "12 hours", "24 hours"])}
                </div>
                <div className="org-settings-divider" />
                {renderToggle("Require multi-factor authentication", "Require members to complete an additional authentication step. Backend enforcement is required.", "requireMfa")}
                {renderToggle("Require approval for invitations", "Require an authorized administrator to approve member invitations.", "inviteApproval")}
                <div className="org-settings-info">
                  <LockKeyhole size={17} />
                  <div><strong>Security-critical settings.</strong> These values do not enforce MFA, session expiration, or invitation approval until validated and applied by the backend authentication and authorization services.</div>
                </div>
              </div>
            )}

            {activeTab === "data" && (
              <div className="org-settings-card-body">
                <h3 className="org-settings-section-label">Data and retention preferences</h3>
                <p className="org-settings-section-note">Review intended storage region, audit retention, and export permissions.</p>
                <div className="org-settings-form-grid">
                  {renderSelect("Preferred data region", "dataRegion", ["Asia Pacific", "United States", "European Union"])}
                  {renderSelect("Audit log retention", "auditRetention", ["30 days", "90 days", "180 days", "365 days", "Indefinite"])}
                </div>
                <div className="org-settings-divider" />
                {renderToggle("Allow data exports", "Allow authorized users to request organization data exports.", "allowExports")}
                {renderToggle("Allow API key creation", "Allow authorized developers to create organization API keys.", "allowApiKeys")}
                <div className="org-settings-info">
                  <Database size={17} />
                  <div><strong>Data residency notice.</strong> Changing a preferred region does not migrate stored data or change where data is physically processed. Actual residency and retention need backend, storage, and compliance support.</div>
                </div>
              </div>
            )}

            {activeTab === "danger" && (
              <div className="org-settings-card-body">
                <div className="org-settings-info" style={{ marginTop: 0, borderColor: "#f0d4d4", background: "#fff5f4", color: "#984141" }}>
                  <AlertTriangle size={18} />
                  <div><strong>Proceed carefully.</strong> These actions can affect organization access or data. This preview intentionally does not perform destructive backend operations.</div>
                </div>

                <div className="org-settings-danger-card" style={{ marginTop: 15 }}>
                  <h3 className="org-settings-danger-title">Reset preview settings</h3>
                  <p className="org-settings-danger-description">Restore the original sample configuration. This changes only the local page state and does not modify production settings.</p>
                  <button className="org-settings-btn" onClick={() => setShowResetConfirm(true)}>
                    <RefreshCw size={14} /> Reset settings
                  </button>
                </div>

                <div className="org-settings-danger-card">
                  <h3 className="org-settings-danger-title">Export organization configuration</h3>
                  <p className="org-settings-danger-description">Download the current form values as a JSON file for review or development.</p>
                  <button className="org-settings-btn" onClick={downloadSettings}>
                    <FileText size={14} /> Export configuration
                  </button>
                </div>

                <div className="org-settings-danger-card">
                  <h3 className="org-settings-danger-title">Delete organization</h3>
                  <p className="org-settings-danger-description">Organization deletion is disabled in this preview. A production implementation must validate permissions, ownership, dependencies, retention obligations, and explicit confirmation on the server.</p>
                  <button className="org-settings-btn" style={{ color: "#bd3e42", borderColor: "#efcaca" }} onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 size={14} /> Review deletion workflow
                  </button>
                </div>
              </div>
            )}

            <div className="org-settings-card-footer">
              <span className="org-settings-footer-note">
                {hasChanges ? "You have unsaved changes." : "All current form values are saved in this page session."}
              </span>
              <div className="org-settings-footer-actions">
                <button className="org-settings-btn" onClick={resetSettings} disabled={!hasChanges}>
                  Discard changes
                </button>
                <button className="org-settings-btn primary" onClick={saveSettings} disabled={!hasChanges || saving}>
                  <Save size={14} /> {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </section>
        </div>

        {showResetConfirm && (
          <div className="org-settings-modal-backdrop" onClick={() => setShowResetConfirm(false)}>
            <section className="org-settings-modal" role="dialog" aria-modal="true" aria-labelledby="org-reset-title" onClick={(event) => event.stopPropagation()}>
              <div className="org-settings-modal-body">
                <h2 className="org-settings-modal-title" id="org-reset-title">Reset preview settings?</h2>
                <p className="org-settings-modal-description">This restores the original sample values in the current page. It will discard your current edits.</p>
              </div>
              <div className="org-settings-modal-footer">
                <button className="org-settings-btn" onClick={() => setShowResetConfirm(false)}>Cancel</button>
                <button className="org-settings-btn primary" onClick={resetToDefaults}>Reset preview</button>
              </div>
            </section>
          </div>
        )}

        {showDeleteConfirm && (
          <div className="org-settings-modal-backdrop" onClick={() => setShowDeleteConfirm(false)}>
            <section className="org-settings-modal" role="dialog" aria-modal="true" aria-labelledby="org-delete-title" onClick={(event) => event.stopPropagation()}>
              <div className="org-settings-modal-body">
                <h2 className="org-settings-modal-title" id="org-delete-title">Organization deletion workflow</h2>
                <p className="org-settings-modal-description">
                  This is a confirmation preview only. Enter <strong>{settings.name}</strong> to test the confirmation flow. No organization or data will be deleted.
                </p>
                <label htmlFor="org-delete-confirmation" style={labelStyle}>Organization name</label>
                <input
                  id="org-delete-confirmation"
                  style={fieldStyle}
                  value={deleteConfirmation}
                  onChange={(event) => setDeleteConfirmation(event.target.value)}
                  placeholder={settings.name}
                />
              </div>
              <div className="org-settings-modal-footer">
                <button className="org-settings-btn" onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmation(""); }}>Cancel</button>
                <button className="org-settings-btn danger" onClick={requestDelete}>
                  <AlertTriangle size={14} /> Test confirmation
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
