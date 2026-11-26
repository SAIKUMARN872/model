
"use client";

import { useState } from "react";
import {
  Settings,
  ShieldCheck,
  Bell,
  Clock,
  FileCheck2,
  LockKeyhole,
  Database,
  Mail,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Plus,
  X,
  Trash2,
  Users,
  Globe,
  History,
} from "lucide-react";

type SettingToggle = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
};

type RetentionRule = {
  id: string;
  name: string;
  duration: string;
  category: string;
};

const initialToggles: SettingToggle[] = [
  {
    id: "deadline-alerts",
    title: "Compliance deadline alerts",
    description: "Notify responsible teams before a task or review is due.",
    enabled: true,
  },
  {
    id: "overdue-alerts",
    title: "Overdue task notifications",
    description: "Notify task owners when an open task passes its due date.",
    enabled: true,
  },
  {
    id: "evidence-reminders",
    title: "Evidence collection reminders",
    description: "Remind owners about missing or expiring compliance evidence.",
    enabled: true,
  },
  {
    id: "weekly-digest",
    title: "Weekly compliance digest",
    description: "Prepare a weekly summary of outstanding compliance work.",
    enabled: false,
  },
  {
    id: "critical-alerts",
    title: "Critical risk alerts",
    description: "Highlight critical risks and unresolved high-priority findings.",
    enabled: true,
  },
  {
    id: "audit-trail",
    title: "Audit trail tracking",
    description: "Track administrative changes in compliance configuration.",
    enabled: true,
  },
  {
    id: "approval-required",
    title: "Require approval for policy publication",
    description: "Require a reviewer before a policy is marked as published.",
    enabled: true,
  },
  {
    id: "evidence-expiry",
    title: "Evidence expiry monitoring",
    description: "Flag evidence records that have expired or are nearing expiry.",
    enabled: true,
  },
];

const initialRules: RetentionRule[] = [
  {
    id: "RET-001",
    name: "Audit evidence",
    duration: "7 years",
    category: "Audit",
  },
  {
    id: "RET-002",
    name: "Compliance reports",
    duration: "5 years",
    category: "Reports",
  },
  {
    id: "RET-003",
    name: "Risk assessment records",
    duration: "5 years",
    category: "Risk",
  },
  {
    id: "RET-004",
    name: "Data subject requests",
    duration: "3 years",
    category: "Privacy",
  },
];

const sectionItems = [
  {
    id: "general",
    label: "General",
    description: "Workspace and compliance defaults",
    icon: Settings,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Alerts and reminder preferences",
    icon: Bell,
  },
  {
    id: "workflows",
    label: "Workflows",
    description: "Approvals and task behavior",
    icon: FileCheck2,
  },
  {
    id: "retention",
    label: "Data retention",
    description: "Record retention policies",
    icon: Database,
  },
  {
    id: "access",
    label: "Access & security",
    description: "Administrative access settings",
    icon: LockKeyhole,
  },
  {
    id: "integrations",
    label: "Integrations",
    description: "External systems and notifications",
    icon: Globe,
  },
  {
    id: "history",
    label: "Change history",
    description: "Local configuration change history",
    icon: History,
  },
];

export default function ComplianceSettingsPage() {
  const [activeSection, setActiveSection] = useState("general");
  const [toggles, setToggles] = useState(initialToggles);
  const [rules, setRules] = useState(initialRules);
  const [notice, setNotice] = useState("");
  const [savedAt, setSavedAt] = useState("");
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [ruleForm, setRuleForm] = useState({
    name: "",
    duration: "5 years",
    category: "Compliance",
  });
  const [settings, setSettings] = useState({
    organizationName: "ModelNow",
    workspaceName: "Production",
    defaultFramework: "ISO 27001",
    reviewFrequency: "Quarterly",
    defaultTaskPriority: "Medium",
    reminderDays: "7",
    timezone: "Asia/Kolkata",
    dateFormat: "DD MMM YYYY",
    notificationEmail: "",
    requireMfa: true,
    restrictExports: false,
    sessionTimeout: "30",
    approvalMode: "Two-step approval",
    automaticEvidenceExpiry: true,
  });

  const [changeHistory, setChangeHistory] = useState<
    { id: number; action: string; timestamp: string }[]
  >([
    {
      id: 1,
      action: "Compliance settings workspace initialized",
      timestamp: "Initial configuration",
    },
  ]);

  function updateSetting<K extends keyof typeof settings>(
    key: K,
    value: (typeof settings)[K]
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
  }

  function addHistory(action: string) {
    setChangeHistory((current) => [
      {
        id: Date.now(),
        action,
        timestamp: new Date().toLocaleString(),
      },
      ...current,
    ]);
  }

  function saveSettings() {
    const timestamp = new Date().toLocaleString();
    setSavedAt(timestamp);
    setNotice("Settings saved in the current page session.");
    addHistory(`Saved settings in ${activeSection}`);
  }

  function resetSettings() {
    setSettings({
      organizationName: "ModelNow",
      workspaceName: "Production",
      defaultFramework: "ISO 27001",
      reviewFrequency: "Quarterly",
      defaultTaskPriority: "Medium",
      reminderDays: "7",
      timezone: "Asia/Kolkata",
      dateFormat: "DD MMM YYYY",
      notificationEmail: "",
      requireMfa: true,
      restrictExports: false,
      sessionTimeout: "30",
      approvalMode: "Two-step approval",
      automaticEvidenceExpiry: true,
    });
    setToggles(initialToggles);
    setNotice("Default values restored in the current page session.");
    addHistory("Restored default configuration values");
  }

  function toggleSetting(id: string) {
    const target = toggles.find((item) => item.id === id);
    if (!target) return;

    setToggles((current) =>
      current.map((item) =>
        item.id === id ? { ...item, enabled: !item.enabled } : item
      )
    );
    addHistory(
      `${target.title}: ${target.enabled ? "disabled" : "enabled"}`
    );
  }

  function addRetentionRule(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const newRule: RetentionRule = {
      id: `RET-${String(Date.now()).slice(-5)}`,
      name: ruleForm.name.trim(),
      duration: ruleForm.duration,
      category: ruleForm.category,
    };

    setRules((current) => [...current, newRule]);
    setShowRuleForm(false);
    setRuleForm({
      name: "",
      duration: "5 years",
      category: "Compliance",
    });
    setNotice("Retention rule added to the current page session.");
    addHistory(`Added retention rule: ${newRule.name}`);
  }

  function deleteRetentionRule(rule: RetentionRule) {
    setRules((current) => current.filter((item) => item.id !== rule.id));
    setNotice(`Retention rule "${rule.name}" removed from the local list.`);
    addHistory(`Removed retention rule: ${rule.name}`);
  }

  function exportSettings() {
    const data = {
      product: "ModelNow",
      exportedAt: new Date().toISOString(),
      settings,
      notifications: toggles,
      retentionRules: rules,
    };

    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      })
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "modelnow-compliance-settings.json";
    link.click();
    URL.revokeObjectURL(url);
    setNotice("Configuration exported as JSON.");
  }

  return (
    <main className="settings-page">
      <header className="page-header">
        <div>
          <div className="breadcrumb">
            Admin <span>/</span> Compliance <span>/</span> Compliance Settings
          </div>
          <h1>Compliance Settings</h1>
          <p>
            Configure compliance defaults, notifications, retention rules,
            access preferences, and review workflows.
          </p>
        </div>

        <div className="header-actions">
          <button className="secondary-button" onClick={resetSettings}>
            <RotateCcw size={16} /> Reset defaults
          </button>
          <button className="secondary-button" onClick={exportSettings}>
            <Database size={16} /> Export settings
          </button>
          <button className="primary-button" onClick={saveSettings}>
            <Save size={16} /> Save changes
          </button>
        </div>
      </header>

      {notice && (
        <div className="notice">
          <CheckCircle2 size={17} />
          <span>{notice}</span>
          <button onClick={() => setNotice("")} aria-label="Dismiss notice">
            <X size={16} />
          </button>
        </div>
      )}

      <section className="status-banner">
        <div className="banner-icon">
          <ShieldCheck size={24} />
        </div>
        <div className="banner-copy">
          <strong>Compliance configuration</strong>
          <p>
            Manage workspace preferences and governance defaults from one
            place. Security-sensitive settings require backend enforcement.
          </p>
          {savedAt && <small>Last saved in this session: {savedAt}</small>}
        </div>
        <span className="draft-badge">
          <span /> Local configuration
        </span>
      </section>

      <div className="settings-layout">
        <aside className="settings-sidebar">
          <div className="sidebar-label">SETTINGS</div>
          {sectionItems.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                className={`sidebar-item ${
                  activeSection === item.id ? "active" : ""
                }`}
                onClick={() => setActiveSection(item.id)}
              >
                <span className="sidebar-icon">
                  <Icon size={18} />
                </span>
                <span className="sidebar-copy">
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
                <ChevronRight size={15} className="sidebar-chevron" />
              </button>
            );
          })}

          <div className="sidebar-help">
            <span className="help-icon">
              <ShieldCheck size={19} />
            </span>
            <strong>Need help?</strong>
            <p>Review your organization's compliance procedures before changing production settings.</p>
          </div>
        </aside>

        <section className="settings-content">
          {activeSection === "general" && (
            <section className="settings-card">
              <SectionHeading
                icon={<Settings size={19} />}
                title="General settings"
                description="Set the default behavior for your compliance workspace."
              />

              <div className="form-grid">
                <Field label="Organization name">
                  <input
                    value={settings.organizationName}
                    onChange={(event) =>
                      updateSetting("organizationName", event.target.value)
                    }
                  />
                </Field>
                <Field label="Workspace name">
                  <input
                    value={settings.workspaceName}
                    onChange={(event) =>
                      updateSetting("workspaceName", event.target.value)
                    }
                  />
                </Field>
                <Field label="Default compliance framework">
                  <select
                    value={settings.defaultFramework}
                    onChange={(event) =>
                      updateSetting("defaultFramework", event.target.value)
                    }
                  >
                    <option>ISO 27001</option>
                    <option>SOC 2</option>
                    <option>GDPR</option>
                    <option>EU AI Act</option>
                    <option>NIST AI RMF</option>
                    <option>Internal</option>
                  </select>
                </Field>
                <Field label="Review frequency">
                  <select
                    value={settings.reviewFrequency}
                    onChange={(event) =>
                      updateSetting("reviewFrequency", event.target.value)
                    }
                  >
                    <option>Monthly</option>
                    <option>Quarterly</option>
                    <option>Every 6 months</option>
                    <option>Annually</option>
                  </select>
                </Field>
                <Field label="Default task priority">
                  <select
                    value={settings.defaultTaskPriority}
                    onChange={(event) =>
                      updateSetting("defaultTaskPriority", event.target.value)
                    }
                  >
                    <option>Critical</option>
                    <option>High</option>
                    <option>Medium</option>
                    <option>Low</option>
                  </select>
                </Field>
                <Field label="Default reminder (days before due date)">
                  <select
                    value={settings.reminderDays}
                    onChange={(event) =>
                      updateSetting("reminderDays", event.target.value)
                    }
                  >
                    <option value="1">1 day</option>
                    <option value="3">3 days</option>
                    <option value="7">7 days</option>
                    <option value="14">14 days</option>
                    <option value="30">30 days</option>
                  </select>
                </Field>
                <Field label="Workspace time zone">
                  <select
                    value={settings.timezone}
                    onChange={(event) =>
                      updateSetting("timezone", event.target.value)
                    }
                  >
                    <option value="Asia/Kolkata">India Standard Time</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">US Eastern Time</option>
                    <option value="Europe/London">UK Time</option>
                    <option value="Asia/Singapore">Singapore Time</option>
                  </select>
                </Field>
                <Field label="Date format">
                  <select
                    value={settings.dateFormat}
                    onChange={(event) =>
                      updateSetting("dateFormat", event.target.value)
                    }
                  >
                    <option>DD MMM YYYY</option>
                    <option>MM/DD/YYYY</option>
                    <option>YYYY-MM-DD</option>
                  </select>
                </Field>
              </div>

              <div className="section-divider" />

              <SectionHeading
                icon={<Clock size={19} />}
                title="Default review behavior"
                description="Set expectations for recurring reviews and reminders."
              />

              <ToggleRow
                title="Automatically flag expired evidence"
                description="Identify expired evidence during compliance review."
                enabled={settings.automaticEvidenceExpiry}
                onChange={(value) =>
                  updateSetting("automaticEvidenceExpiry", value)
                }
              />
            </section>
          )}

          {activeSection === "notifications" && (
            <section className="settings-card">
              <SectionHeading
                icon={<Bell size={19} />}
                title="Notification preferences"
                description="Choose which compliance events should trigger notifications."
              />

              <Field label="Notification contact email">
                <input
                  type="email"
                  placeholder="compliance@yourcompany.com"
                  value={settings.notificationEmail}
                  onChange={(event) =>
                    updateSetting("notificationEmail", event.target.value)
                  }
                />
              </Field>

              <div className="section-divider" />

              {toggles.slice(0, 6).map((item) => (
                <ToggleRow
                  key={item.id}
                  title={item.title}
                  description={item.description}
                  enabled={item.enabled}
                  onChange={() => toggleSetting(item.id)}
                />
              ))}

              <div className="info-note">
                <Mail size={17} />
                Email delivery is not connected yet. These controls currently
                represent saved-in-session preferences only.
              </div>
            </section>
          )}

          {activeSection === "workflows" && (
            <section className="settings-card">
              <SectionHeading
                icon={<FileCheck2 size={19} />}
                title="Workflow settings"
                description="Configure approval behavior and default compliance processes."
              />

              <Field label="Policy approval mode">
                <select
                  value={settings.approvalMode}
                  onChange={(event) =>
                    updateSetting("approvalMode", event.target.value)
                  }
                >
                  <option>Single approval</option>
                  <option>Two-step approval</option>
                  <option>Compliance and security approval</option>
                </select>
              </Field>

              <div className="section-divider" />

              {toggles.slice(6).map((item) => (
                <ToggleRow
                  key={item.id}
                  title={item.title}
                  description={item.description}
                  enabled={item.enabled}
                  onChange={() => toggleSetting(item.id)}
                />
              ))}

              <div className="info-note">
                <AlertTriangle size={17} />
                Approval rules must be enforced by the backend before they can
                be relied on for production governance.
              </div>
            </section>
          )}

          {activeSection === "retention" && (
            <section className="settings-card">
              <div className="section-heading">
                <SectionHeading
                  icon={<Database size={19} />}
                  title="Data retention rules"
                  description="Define how long different compliance records should be retained."
                />
                <button
                  className="primary-button"
                  onClick={() => setShowRuleForm(true)}
                >
                  <Plus size={16} /> Add rule
                </button>
              </div>

              <div className="retention-notice">
                <LockKeyhole size={18} />
                <span>
                  Retention periods should be validated against applicable laws,
                  contracts, and your organization's approved policies.
                </span>
              </div>

              <div className="retention-list">
                {rules.map((rule) => (
                  <div className="retention-row" key={rule.id}>
                    <div className="retention-icon">
                      <FileCheck2 size={18} />
                    </div>
                    <div className="retention-name">
                      <strong>{rule.name}</strong>
                      <small>
                        {rule.id} · {rule.category}
                      </small>
                    </div>
                    <span className="retention-duration">{rule.duration}</span>
                    <button
                      className="icon-button danger"
                      onClick={() => deleteRetentionRule(rule)}
                      aria-label={`Delete ${rule.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                {rules.length === 0 && (
                  <div className="empty-state">No retention rules configured.</div>
                )}
              </div>
            </section>
          )}

          {activeSection === "access" && (
            <section className="settings-card">
              <SectionHeading
                icon={<LockKeyhole size={19} />}
                title="Access and security"
                description="Review the security preferences planned for your compliance workspace."
              />

              <ToggleRow
                title="Require multi-factor authentication"
                description="Require an additional verification factor for administrative access."
                enabled={settings.requireMfa}
                onChange={(value) => updateSetting("requireMfa", value)}
              />

              <ToggleRow
                title="Restrict compliance data exports"
                description="Limit export actions to authorized compliance administrators."
                enabled={settings.restrictExports}
                onChange={(value) => updateSetting("restrictExports", value)}
              />

              <div className="section-divider" />

              <Field label="Session timeout">
                <select
                  value={settings.sessionTimeout}
                  onChange={(event) =>
                    updateSetting("sessionTimeout", event.target.value)
                  }
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="60">60 minutes</option>
                  <option value="120">120 minutes</option>
                </select>
              </Field>

              <div className="security-callout">
                <ShieldCheck size={21} />
                <div>
                  <strong>Backend enforcement required</strong>
                  <p>
                    UI preferences alone do not enforce MFA, session expiry, or
                    export permissions. Configure these protections in your
                    authentication and authorization services.
                  </p>
                </div>
              </div>
            </section>
          )}

          {activeSection === "integrations" && (
            <section className="settings-card">
              <SectionHeading
                icon={<Globe size={19} />}
                title="Integrations"
                description="Plan connections for compliance notifications and evidence workflows."
              />

              <IntegrationRow
                icon={<Mail size={19} />}
                name="Email notifications"
                description="Send task reminders, deadline alerts, and compliance summaries."
                status="Not connected"
              />
              <IntegrationRow
                icon={<Database size={19} />}
                name="Evidence storage"
                description="Connect approved storage for policies, audit records, and evidence."
                status="Not connected"
              />
              <IntegrationRow
                icon={<Users size={19} />}
                name="Identity provider"
                description="Connect organization identity and role management."
                status="Not connected"
              />
              <IntegrationRow
                icon={<History size={19} />}
                name="Audit event pipeline"
                description="Send configuration and compliance events to a central audit system."
                status="Not connected"
              />

              <div className="info-note">
                Integrations are UI placeholders. No external service has been
                connected or authorized from this page.
              </div>
            </section>
          )}

          {activeSection === "history" && (
            <section className="settings-card">
              <SectionHeading
                icon={<History size={19} />}
                title="Configuration change history"
                description="Review changes recorded during this page session."
              />

              <div className="history-list">
                {changeHistory.map((entry) => (
                  <div className="history-row" key={entry.id}>
                    <span className="history-dot">
                      <History size={15} />
                    </span>
                    <div>
                      <strong>{entry.action}</strong>
                      <small>{entry.timestamp}</small>
                    </div>
                  </div>
                ))}
              </div>

              <div className="info-note">
                This history is held in local React state. A production audit
                trail must be persisted server-side and protected from
                unauthorized changes.
              </div>
            </section>
          )}

          <div className="bottom-actions">
            <span>
              <ShieldCheck size={15} />
              Review changes before applying them to production.
            </span>
            <button className="primary-button" onClick={saveSettings}>
              <Save size={16} /> Save changes
            </button>
          </div>
        </section>
      </div>

      {showRuleForm && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowRuleForm(false);
          }}
        >
          <section className="modal">
            <div className="modal-heading">
              <div>
                <h2>Add retention rule</h2>
                <p>Define a retention period for a record category.</p>
              </div>
              <button
                className="icon-button"
                onClick={() => setShowRuleForm(false)}
                aria-label="Close modal"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addRetentionRule}>
              <Field label="Rule name">
                <input
                  required
                  value={ruleForm.name}
                  onChange={(event) =>
                    setRuleForm({ ...ruleForm, name: event.target.value })
                  }
                  placeholder="e.g. Vendor review records"
                />
              </Field>

              <Field label="Retention duration">
                <select
                  value={ruleForm.duration}
                  onChange={(event) =>
                    setRuleForm({ ...ruleForm, duration: event.target.value })
                  }
                >
                  <option>6 months</option>
                  <option>1 year</option>
                  <option>2 years</option>
                  <option>3 years</option>
                  <option>5 years</option>
                  <option>7 years</option>
                  <option>10 years</option>
                  <option>Indefinite</option>
                </select>
              </Field>

              <Field label="Record category">
                <select
                  value={ruleForm.category}
                  onChange={(event) =>
                    setRuleForm({ ...ruleForm, category: event.target.value })
                  }
                >
                  <option>Compliance</option>
                  <option>Audit</option>
                  <option>Reports</option>
                  <option>Risk</option>
                  <option>Privacy</option>
                  <option>Vendor</option>
                  <option>Security</option>
                </select>
              </Field>

              <div className="form-note">
                <AlertTriangle size={16} />
                Confirm legal and organizational retention requirements before
                using a rule in production.
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowRuleForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  <Plus size={16} /> Add rule
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <style jsx>{`
        .settings-page {
          --text: #172033;
          --muted: #687386;
          --line: #e6eaf0;
          min-height: 100vh;
          padding: 30px;
          color: var(--text);
          background: #f7f9fc;
          font-family: Arial, Helvetica, sans-serif;
        }

        .page-header,
        .header-actions,
        .section-heading,
        .modal-heading,
        .modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 14px;
        }

        .page-header {
          align-items: flex-start;
          margin-bottom: 23px;
        }

        .breadcrumb {
          margin-bottom: 12px;
          color: var(--muted);
          font-size: 12px;
        }

        .breadcrumb span {
          margin: 0 7px;
          color: #a4adba;
        }

        h1 {
          margin: 0;
          font-size: 28px;
          letter-spacing: -0.7px;
        }

        .page-header p {
          max-width: 720px;
          margin: 8px 0 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.6;
        }

        button,
        input,
        select,
        textarea {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .primary-button,
        .secondary-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 38px;
          padding: 0 13px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          white-space: nowrap;
        }

        .primary-button {
          color: white;
          background: #2459d3;
          border: 1px solid #2459d3;
        }

        .primary-button:hover {
          background: #1948b7;
        }

        .secondary-button {
          color: #354154;
          background: white;
          border: 1px solid #dce2ea;
        }

        .secondary-button:hover {
          background: #f5f7fa;
        }

        .notice {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 17px;
          padding: 12px 14px;
          color: #166534;
          background: #f0fdf4;
          border: 1px solid #bce7cc;
          border-radius: 9px;
          font-size: 12px;
        }

        .notice span {
          flex: 1;
        }

        .notice button {
          display: flex;
          color: inherit;
          background: transparent;
          border: 0;
        }

        .status-banner {
          display: flex;
          align-items: center;
          gap: 15px;
          margin-bottom: 23px;
          padding: 18px 20px;
          background: white;
          border: 1px solid var(--line);
          border-radius: 12px;
        }

        .banner-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 47px;
          height: 47px;
          color: #2459d3;
          background: #edf3ff;
          border-radius: 11px;
        }

        .banner-copy {
          flex: 1;
          min-width: 0;
        }

        .banner-copy strong {
          font-size: 13px;
        }

        .banner-copy p {
          margin: 6px 0 0;
          color: var(--muted);
          font-size: 11px;
          line-height: 1.6;
        }

        .banner-copy small {
          display: block;
          margin-top: 7px;
          color: #16814a;
          font-size: 10px;
        }

        .draft-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 7px 10px;
          color: #8a650c;
          background: #fff8e5;
          border-radius: 6px;
          font-size: 10px;
          white-space: nowrap;
        }

        .draft-badge span {
          width: 6px;
          height: 6px;
          background: #d99a17;
          border-radius: 50%;
        }

        .settings-layout {
          display: grid;
          grid-template-columns: 260px minmax(0, 1fr);
          align-items: start;
          gap: 20px;
        }

        .settings-sidebar,
        .settings-card {
          background: white;
          border: 1px solid var(--line);
          border-radius: 12px;
        }

        .settings-sidebar {
          padding: 13px;
        }

        .sidebar-label {
          padding: 10px 9px 12px;
          color: #98a1b0;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.8px;
        }

        .sidebar-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 12px 9px;
          margin-bottom: 3px;
          color: #667085;
          text-align: left;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 8px;
        }

        .sidebar-item:hover {
          background: #f7f9fc;
        }

        .sidebar-item.active {
          color: #2459d3;
          background: #edf3ff;
          border-color: #dce7ff;
        }

        .sidebar-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 31px;
          height: 31px;
          background: #f0f2f6;
          border-radius: 7px;
        }

        .active .sidebar-icon {
          background: white;
        }

        .sidebar-copy {
          flex: 1;
          min-width: 0;
        }

        .sidebar-copy strong {
          display: block;
          font-size: 11px;
          font-weight: 600;
        }

        .sidebar-copy small {
          display: block;
          margin-top: 4px;
          color: #8993a3;
          font-size: 9px;
          line-height: 1.5;
        }

        .sidebar-chevron {
          flex-shrink: 0;
          color: #a5adba;
        }

        .sidebar-help {
          margin-top: 15px;
          padding: 14px;
          background: #f7f9fc;
          border: 1px solid var(--line);
          border-radius: 9px;
        }

        .help-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 33px;
          height: 33px;
          margin-bottom: 10px;
          color: #2459d3;
          background: #e8efff;
          border-radius: 8px;
        }

        .sidebar-help strong {
          font-size: 11px;
        }

        .sidebar-help p {
          margin: 7px 0 0;
          color: #758196;
          font-size: 10px;
          line-height: 1.7;
        }

        .settings-content {
          min-width: 0;
        }

        .settings-card {
          padding: 23px;
        }

        .section-heading {
          align-items: flex-start;
          margin-bottom: 23px;
        }

        .section-heading h2 {
          margin: 0;
          font-size: 16px;
        }

        .section-heading p {
          margin: 7px 0 0;
          color: var(--muted);
          font-size: 11px;
          line-height: 1.6;
        }

        .section-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 39px;
          height: 39px;
          color: #2459d3;
          background: #edf3ff;
          border-radius: 9px;
        }

        .heading-copy {
          flex: 1;
          min-width: 0;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 18px;
        }

        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
          margin-bottom: 16px;
        }

        .field-label {
          color: #344054;
          font-size: 11px;
          font-weight: 600;
        }

        .field :global(input),
        .field :global(select),
        .field :global(textarea) {
          box-sizing: border-box;
          width: 100%;
          min-height: 40px;
          padding: 10px 12px;
          color: #263248;
          background: white;
          border: 1px solid #dce2ea;
          border-radius: 8px;
          outline: none;
          font-size: 12px;
        }

        .field :global(input:focus),
        .field :global(select:focus),
        .field :global(textarea:focus) {
          border-color: #4778e8;
          box-shadow: 0 0 0 3px #4778e81a;
        }

        .section-divider {
          height: 1px;
          margin: 9px 0 22px;
          background: var(--line);
        }

        .toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 17px 0;
          border-bottom: 1px solid #edf0f4;
        }

        .toggle-row:first-of-type {
          padding-top: 3px;
        }

        .toggle-copy {
          flex: 1;
          min-width: 0;
        }

        .toggle-copy strong {
          display: block;
          color: #344054;
          font-size: 12px;
        }

        .toggle-copy p {
          margin: 6px 0 0;
          color: #7b8698;
          font-size: 11px;
          line-height: 1.6;
        }

        .toggle {
          position: relative;
          display: inline-flex;
          align-items: center;
          flex-shrink: 0;
          width: 42px;
          height: 24px;
          padding: 3px;
          background: #d7dce5;
          border: 0;
          border-radius: 20px;
          transition: background 0.15s;
        }

        .toggle.on {
          background: #2459d3;
        }

        .toggle span {
          display: block;
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 1px 3px #00000020;
          transition: transform 0.15s;
        }

        .toggle.on span {
          transform: translateX(18px);
        }

        .info-note,
        .retention-notice {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 20px;
          padding: 13px;
          color: #7c5b12;
          background: #fff9e9;
          border: 1px solid #f5e7be;
          border-radius: 8px;
          font-size: 11px;
          line-height: 1.7;
        }

        .info-note svg,
        .retention-notice svg {
          flex-shrink: 0;
        }

        .retention-notice {
          margin-top: 0;
          margin-bottom: 17px;
        }

        .retention-list {
          border-top: 1px solid var(--line);
        }

        .retention-row {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 15px 2px;
          border-bottom: 1px solid #edf0f4;
        }

        .retention-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 38px;
          height: 38px;
          color: #2459d3;
          background: #edf3ff;
          border-radius: 8px;
        }

        .retention-name {
          flex: 1;
          min-width: 0;
        }

        .retention-name strong {
          display: block;
          font-size: 12px;
        }

        .retention-name small {
          display: block;
          margin-top: 5px;
          color: #8b95a5;
          font-size: 10px;
        }

        .retention-duration {
          padding: 7px 9px;
          color: #475467;
          background: #f0f2f6;
          border-radius: 6px;
          font-size: 11px;
          white-space: nowrap;
        }

        .icon-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 34px;
          height: 34px;
          color: #667085;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 7px;
        }

        .icon-button:hover {
          background: #f7f9fc;
          border-color: var(--line);
        }

        .icon-button.danger {
          color: #c34242;
        }

        .security-callout {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-top: 22px;
          padding: 16px;
          color: #2459d3;
          background: #f0f5ff;
          border: 1px solid #dce7ff;
          border-radius: 9px;
        }

        .security-callout svg {
          flex-shrink: 0;
        }

        .security-callout strong {
          font-size: 12px;
        }

        .security-callout p {
          margin: 7px 0 0;
          color: #596579;
          font-size: 11px;
          line-height: 1.7;
        }

        .integration-row {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 17px 0;
          border-bottom: 1px solid #edf0f4;
        }

        .integration-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          color: #2459d3;
          background: #edf3ff;
          border-radius: 9px;
        }

        .integration-copy {
          flex: 1;
          min-width: 0;
        }

        .integration-copy strong {
          display: block;
          font-size: 12px;
        }

        .integration-copy p {
          margin: 5px 0 0;
          color: #7b8698;
          font-size: 11px;
          line-height: 1.6;
        }

        .integration-status {
          padding: 7px 9px;
          color: #687386;
          background: #f0f2f6;
          border-radius: 6px;
          font-size: 10px;
          white-space: nowrap;
        }

        .history-list {
          border-top: 1px solid var(--line);
        }

        .history-row {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 17px 0;
          border-bottom: 1px solid #edf0f4;
        }

        .history-dot {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 32px;
          height: 32px;
          color: #2459d3;
          background: #edf3ff;
          border-radius: 50%;
        }

        .history-row strong {
          display: block;
          color: #344054;
          font-size: 12px;
        }

        .history-row small {
          display: block;
          margin-top: 6px;
          color: #8791a1;
          font-size: 10px;
        }

        .empty-state {
          padding: 35px 15px;
          color: #8791a1;
          text-align: center;
          font-size: 12px;
        }

        .bottom-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-top: 18px;
          padding: 15px 18px;
          background: white;
          border: 1px solid var(--line);
          border-radius: 10px;
        }

        .bottom-actions > span {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #758196;
          font-size: 10px;
          line-height: 1.6;
        }

        .bottom-actions > span svg {
          flex-shrink: 0;
          color: #2459d3;
        }

        .modal-backdrop {
          position: fixed;
          z-index: 100;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow-y: auto;
          padding: 20px;
          background: #10182875;
        }

        .modal {
          width: 100%;
          max-width: 490px;
          max-height: calc(100vh - 40px);
          overflow-y: auto;
          padding: 24px;
          background: white;
          border-radius: 14px;
          box-shadow: 0 20px 70px #10182830;
        }

        .modal-heading {
          align-items: flex-start;
          margin-bottom: 22px;
        }

        .modal-heading h2 {
          margin: 0;
          font-size: 17px;
        }

        .modal-heading p {
          margin: 7px 0 0;
          color: #687386;
          font-size: 11px;
          line-height: 1.6;
        }

        .modal form {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }

        .modal-footer {
          justify-content: flex-end;
          margin-top: 14px;
          padding-top: 17px;
          border-top: 1px solid var(--line);
        }

        @media (max-width: 1100px) {
          .settings-layout {
            grid-template-columns: 220px minmax(0, 1fr);
          }

          .header-actions {
            flex-wrap: wrap;
          }
        }

        @media (max-width: 850px) {
          .settings-page {
            padding: 18px;
          }

          .page-header {
            flex-direction: column;
          }

          .header-actions {
            width: 100%;
          }

          .settings-layout {
            grid-template-columns: 1fr;
          }

          .settings-sidebar {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 4px;
          }

          .sidebar-label,
          .sidebar-help {
            grid-column: 1 / -1;
          }

          .sidebar-item {
            min-width: 0;
          }
        }

        @media (max-width: 560px) {
          .form-grid {
            grid-template-columns: 1fr;
            gap: 0;
          }

          .settings-card {
            padding: 17px;
          }

          .settings-sidebar {
            grid-template-columns: 1fr;
          }

          .status-banner {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .draft-badge {
            margin-left: 60px;
          }

          .header-actions {
            align-items: stretch;
            flex-direction: column;
          }

          .bottom-actions {
            align-items: flex-start;
            flex-direction: column;
          }

          .section-heading {
            flex-wrap: wrap;
          }

          .integration-row {
            flex-wrap: wrap;
          }

          .integration-status {
            margin-left: 55px;
          }
        }
      `}</style>
    </main>
  );
}

function SectionHeading({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="section-heading">
      <span className="section-icon">{icon}</span>
      <div className="heading-copy">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <style jsx>{`
        .section-heading {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          min-width: 0;
        }

        .section-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 39px;
          height: 39px;
          color: #2459d3;
          background: #edf3ff;
          border-radius: 9px;
        }

        .heading-copy {
          flex: 1;
          min-width: 0;
        }

        h2 {
          margin: 0;
          color: #172033;
          font-size: 16px;
        }

        p {
          margin: 7px 0 0;
          color: #687386;
          font-size: 11px;
          line-height: 1.6;
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      <style jsx>{`
        .field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
          margin-bottom: 16px;
        }

        .field-label {
          color: #344054;
          font-size: 11px;
          font-weight: 600;
        }

        .field :global(input),
        .field :global(select),
        .field :global(textarea) {
          box-sizing: border-box;
          width: 100%;
          min-height: 40px;
          padding: 10px 12px;
          color: #263248;
          background: white;
          border: 1px solid #dce2ea;
          border-radius: 8px;
          outline: none;
          font-size: 12px;
        }
      `}</style>
    </label>
  );
}

function ToggleRow({
  title,
  description,
  enabled,
  onChange,
}: {
  title: string;
  description: string;
  enabled: boolean;
  onChange: (enabled: boolean) => void;
}) {
  return (
    <div className="toggle-row">
      <div className="toggle-copy">
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      <button
        type="button"
        className={`toggle ${enabled ? "on" : ""}`}
        role="switch"
        aria-checked={enabled}
        aria-label={title}
        onClick={() => onChange(!enabled)}
      >
        <span />
      </button>
      <style jsx>{`
        .toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 17px 0;
          border-bottom: 1px solid #edf0f4;
        }

        .toggle-copy {
          flex: 1;
          min-width: 0;
        }

        .toggle-copy strong {
          display: block;
          color: #344054;
          font-size: 12px;
        }

        .toggle-copy p {
          margin: 6px 0 0;
          color: #7b8698;
          font-size: 11px;
          line-height: 1.6;
        }

        .toggle {
          position: relative;
          display: inline-flex;
          align-items: center;
          flex-shrink: 0;
          width: 42px;
          height: 24px;
          padding: 3px;
          background: #d7dce5;
          border: 0;
          border-radius: 20px;
          cursor: pointer;
        }

        .toggle.on {
          background: #2459d3;
        }

        .toggle span {
          display: block;
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          box-shadow: 0 1px 3px #00000020;
        }

        .toggle.on span {
          transform: translateX(18px);
        }
      `}</style>
    </div>
  );
}

function IntegrationRow({
  icon,
  name,
  description,
  status,
}: {
  icon: React.ReactNode;
  name: string;
  description: string;
  status: string;
}) {
  return (
    <div className="integration-row">
      <span className="integration-icon">{icon}</span>
      <div className="integration-copy">
        <strong>{name}</strong>
        <p>{description}</p>
      </div>
      <span className="integration-status">{status}</span>
      <style jsx>{`
        .integration-row {
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 17px 0;
          border-bottom: 1px solid #edf0f4;
        }

        .integration-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 42px;
          height: 42px;
          color: #2459d3;
          background: #edf3ff;
          border-radius: 9px;
        }

        .integration-copy {
          flex: 1;
          min-width: 0;
        }

        .integration-copy strong {
          display: block;
          color: #172033;
          font-size: 12px;
        }

        .integration-copy p {
          margin: 5px 0 0;
          color: #7b8698;
          font-size: 11px;
          line-height: 1.6;
        }

        .integration-status {
          padding: 7px 9px;
          color: #687386;
          background: #f0f2f6;
          border-radius: 6px;
          font-size: 10px;
          white-space: nowrap;
        }
      `}</style>
    </div>
  );
}
