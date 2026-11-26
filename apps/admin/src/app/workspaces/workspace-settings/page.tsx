
"use client";

import { useState, type CSSProperties } from "react";
import {
  Settings,
  Building2,
  ShieldCheck,
  Users,
  Bell,
  Clock3,
  LockKeyhole,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Mail,
  KeyRound,
  Monitor,
  ChevronRight,
} from "lucide-react";

type WorkspaceSettings = {
  workspaceName: string;
  workspaceSlug: string;
  companyEmail: string;
  website: string;
  timezone: string;
  language: string;
  defaultRole: string;
  approvalRequired: boolean;
  allowInvitations: boolean;
  enforceMfa: boolean;
  enforceSso: boolean;
  sessionTimeout: string;
  maxSessions: string;
  passwordExpiry: string;
  notifyAccessRequests: boolean;
  notifySecurityEvents: boolean;
  notifyInvitations: boolean;
  notifyWeeklyReport: boolean;
};

const defaultSettings: WorkspaceSettings = {
  workspaceName: "ModelNow Workspace",
  workspaceSlug: "modelnow",
  companyEmail: "admin@modelnow.ai",
  website: "https://modelnow.ai",
  timezone: "Asia/Kolkata",
  language: "English",
  defaultRole: "Member",
  approvalRequired: true,
  allowInvitations: true,
  enforceMfa: true,
  enforceSso: false,
  sessionTimeout: "60",
  maxSessions: "5",
  passwordExpiry: "90",
  notifyAccessRequests: true,
  notifySecurityEvents: true,
  notifyInvitations: true,
  notifyWeeklyReport: false,
};

type SectionId = "general" | "access" | "security" | "sessions" | "notifications";

const navigation: { id: SectionId; label: string; icon: typeof Settings }[] = [
  { id: "general", label: "General", icon: Building2 },
  { id: "access", label: "Access & permissions", icon: Users },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "sessions", label: "Sessions", icon: Monitor },
  { id: "notifications", label: "Notifications", icon: Bell },
];

export default function WorkspaceSettingsPage() {
  const [settings, setSettings] =
    useState<WorkspaceSettings>(defaultSettings);
  const [savedSettings, setSavedSettings] =
    useState<WorkspaceSettings>(defaultSettings);
  const [activeSection, setActiveSection] = useState<SectionId>("general");
  const [notice, setNotice] = useState("");
  const [hasSaved, setHasSaved] = useState(false);

  const dirty =
    JSON.stringify(settings) !== JSON.stringify(savedSettings);

  function update<K extends keyof WorkspaceSettings>(
    key: K,
    value: WorkspaceSettings[K]
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
    setNotice("");
    setHasSaved(false);
  }

  function saveSettings() {
    setSavedSettings({ ...settings });
    setNotice(
      "Settings saved in this demo. Connect a backend to persist workspace configuration."
    );
    setHasSaved(true);
  }

  function resetSettings() {
    setSettings({ ...savedSettings });
    setNotice("Unsaved changes have been discarded.");
    setHasSaved(false);
  }

  function restoreDefaults() {
    setSettings({ ...defaultSettings });
    setNotice("Default values loaded. Save to keep these changes in this demo.");
    setHasSaved(false);
  }

  const panelStyle: CSSProperties = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 13,
    overflow: "hidden",
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    height: 41,
    padding: "0 12px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    background: "#fff",
    color: "#111827",
    fontSize: 13,
    outline: "none",
    boxSizing: "border-box",
  };

  const buttonStyle: CSSProperties = {
    minHeight: 38,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "0 13px",
    border: "1px solid #d1d5db",
    borderRadius: 8,
    background: "#fff",
    color: "#374151",
    cursor: "pointer",
    fontSize: 12,
    fontWeight: 650,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "28px clamp(14px, 3vw, 32px)",
        background: "#f8fafc",
        color: "#111827",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                color: "#64748b",
                fontSize: 12,
                marginBottom: 10,
              }}
            >
              <Settings size={15} />
              Admin / Workspace / Configuration
            </div>
            <h1
              style={{
                margin: 0,
                fontSize: "clamp(25px, 3vw, 32px)",
                letterSpacing: "-0.8px",
              }}
            >
              Workspace Settings
            </h1>
            <p
              style={{
                color: "#64748b",
                fontSize: 14,
                lineHeight: 1.6,
                margin: "9px 0 0",
              }}
            >
              Manage workspace identity, access policies, security, and
              notifications.
            </p>
          </div>

          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <button style={buttonStyle} onClick={restoreDefaults}>
              <RotateCcw size={15} /> Restore defaults
            </button>
            <button
              style={{
                ...buttonStyle,
                background: dirty ? "#2563eb" : "#94a3b8",
                color: "#fff",
                borderColor: dirty ? "#2563eb" : "#94a3b8",
                cursor: dirty ? "pointer" : "not-allowed",
              }}
              disabled={!dirty}
              onClick={saveSettings}
            >
              <Save size={15} /> Save changes
            </button>
          </div>
        </header>

        {notice && (
          <div
            role="status"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 10,
              padding: 14,
              marginBottom: 20,
              borderRadius: 10,
              border: `1px solid ${hasSaved ? "#bbf7d0" : "#bfdbfe"}`,
              background: hasSaved ? "#f0fdf4" : "#eff6ff",
              color: hasSaved ? "#166534" : "#1d4ed8",
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            {hasSaved ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertTriangle size={18} />
            )}
            <span style={{ flex: 1 }}>{notice}</span>
            <button
              aria-label="Dismiss notification"
              onClick={() => setNotice("")}
              style={{
                border: 0,
                background: "transparent",
                color: "inherit",
                cursor: "pointer",
              }}
            >
              ×
            </button>
          </div>
        )}

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(210px, 250px) minmax(0, 1fr)",
            gap: 20,
            alignItems: "start",
          }}
        >
          <aside style={panelStyle}>
            <div style={{ padding: 18, borderBottom: "1px solid #e5e7eb" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 11,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    display: "grid",
                    placeItems: "center",
                    borderRadius: 11,
                    background: "#eff6ff",
                    color: "#2563eb",
                  }}
                >
                  <Building2 size={21} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 750,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {settings.workspaceName || "Unnamed workspace"}
                  </div>
                  <div
                    style={{
                      color: "#64748b",
                      fontSize: 11,
                      marginTop: 4,
                    }}
                  >
                    Workspace configuration
                  </div>
                </div>
              </div>
            </div>

            <nav style={{ padding: 9 }}>
              {navigation.map((item) => {
                const Icon = item.icon;
                const active = activeSection === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    style={{
                      width: "100%",
                      minHeight: 43,
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      padding: "0 11px",
                      marginBottom: 3,
                      textAlign: "left",
                      border: 0,
                      borderRadius: 8,
                      background: active ? "#eff6ff" : "transparent",
                      color: active ? "#1d4ed8" : "#475569",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: active ? 750 : 550,
                    }}
                  >
                    <Icon size={17} />
                    <span style={{ flex: 1 }}>{item.label}</span>
                    {active && <ChevronRight size={15} />}
                  </button>
                );
              })}
            </nav>

            <div
              style={{
                margin: 12,
                padding: 12,
                borderRadius: 9,
                background: "#f8fafc",
                border: "1px solid #e5e7eb",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 7,
                  alignItems: "center",
                  color: "#475569",
                  fontSize: 11,
                  fontWeight: 750,
                }}
              >
                <ShieldCheck size={15} />
                Security status
              </div>
              <div
                style={{
                  color: "#64748b",
                  fontSize: 11,
                  lineHeight: 1.6,
                  marginTop: 7,
                }}
              >
                MFA is {settings.enforceMfa ? "enabled" : "disabled"} in the
                current configuration.
              </div>
            </div>
          </aside>

          <div style={{ display: "grid", gap: 18, minWidth: 0 }}>
            {activeSection === "general" && (
              <section style={panelStyle}>
                <SectionHeader
                  icon={<Building2 size={19} />}
                  title="General information"
                  description="Manage your workspace identity and regional preferences."
                />
                <div style={{ padding: 22 }}>
                  <div style={fieldGridStyle}>
                    <Field label="Workspace name">
                      <input
                        style={inputStyle}
                        value={settings.workspaceName}
                        onChange={(e) =>
                          update("workspaceName", e.target.value)
                        }
                        placeholder="Enter workspace name"
                      />
                    </Field>
                    <Field label="Workspace slug">
                      <input
                        style={inputStyle}
                        value={settings.workspaceSlug}
                        onChange={(e) =>
                          update(
                            "workspaceSlug",
                            e.target.value
                              .toLowerCase()
                              .replace(/[^a-z0-9-]/g, "-")
                          )
                        }
                        placeholder="workspace-slug"
                      />
                    </Field>
                    <Field label="Administrator email">
                      <div style={{ position: "relative" }}>
                        <Mail
                          size={16}
                          style={inputIconStyle}
                        />
                        <input
                          type="email"
                          style={{ ...inputStyle, paddingLeft: 38 }}
                          value={settings.companyEmail}
                          onChange={(e) =>
                            update("companyEmail", e.target.value)
                          }
                        />
                      </div>
                    </Field>
                    <Field label="Company website">
                      <div style={{ position: "relative" }}>
                        <Globe size={16} style={inputIconStyle} />
                        <input
                          style={{ ...inputStyle, paddingLeft: 38 }}
                          value={settings.website}
                          onChange={(e) => update("website", e.target.value)}
                        />
                      </div>
                    </Field>
                    <Field label="Timezone">
                      <select
                        style={inputStyle}
                        value={settings.timezone}
                        onChange={(e) => update("timezone", e.target.value)}
                      >
                        <option value="Asia/Kolkata">India Standard Time (IST)</option>
                        <option value="UTC">UTC</option>
                        <option value="America/New_York">Eastern Time</option>
                        <option value="Europe/London">London</option>
                        <option value="Asia/Singapore">Singapore</option>
                      </select>
                    </Field>
                    <Field label="Workspace language">
                      <select
                        style={inputStyle}
                        value={settings.language}
                        onChange={(e) => update("language", e.target.value)}
                      >
                        <option>English</option>
                        <option>Telugu</option>
                        <option>Hindi</option>
                      </select>
                    </Field>
                  </div>
                </div>
              </section>
            )}

            {activeSection === "access" && (
              <section style={panelStyle}>
                <SectionHeader
                  icon={<Users size={19} />}
                  title="Access and permissions"
                  description="Configure invitation behavior and default employee permissions."
                />
                <div style={{ padding: 22 }}>
                  <Field label="Default employee role">
                    <select
                      style={{ ...inputStyle, maxWidth: 380 }}
                      value={settings.defaultRole}
                      onChange={(e) => update("defaultRole", e.target.value)}
                    >
                      <option>Member</option>
                      <option>Viewer</option>
                      <option>Developer</option>
                      <option>Analyst</option>
                    </select>
                  </Field>
                  <div style={{ marginTop: 20 }}>
                    <ToggleRow
                      title="Allow workspace invitations"
                      description="Allow authorized workspace administrators to invite employees."
                      checked={settings.allowInvitations}
                      onChange={(value) => update("allowInvitations", value)}
                    />
                    <ToggleRow
                      title="Require approval for access requests"
                      description="Require an administrator decision before granting requested resource access."
                      checked={settings.approvalRequired}
                      onChange={(value) => update("approvalRequired", value)}
                    />
                  </div>
                </div>
              </section>
            )}

            {activeSection === "security" && (
              <section style={panelStyle}>
                <SectionHeader
                  icon={<ShieldCheck size={19} />}
                  title="Security policies"
                  description="Set baseline authentication and account security requirements."
                />
                <div style={{ padding: 22 }}>
                  <ToggleRow
                    title="Enforce multi-factor authentication"
                    description="Require a second authentication factor for workspace users."
                    checked={settings.enforceMfa}
                    onChange={(value) => update("enforceMfa", value)}
                  />
                  <ToggleRow
                    title="Single sign-on (SSO)"
                    description="Configure your identity provider before enforcing SSO in production."
                    checked={settings.enforceSso}
                    onChange={(value) => update("enforceSso", value)}
                  />
                  <div style={{ marginTop: 22 }}>
                    <Field label="Password expiry">
                      <select
                        style={{ ...inputStyle, maxWidth: 380 }}
                        value={settings.passwordExpiry}
                        onChange={(e) =>
                          update("passwordExpiry", e.target.value)
                        }
                      >
                        <option value="30">Every 30 days</option>
                        <option value="60">Every 60 days</option>
                        <option value="90">Every 90 days</option>
                        <option value="180">Every 180 days</option>
                        <option value="0">No expiry policy</option>
                      </select>
                    </Field>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 10,
                      padding: 13,
                      marginTop: 20,
                      borderRadius: 9,
                      background: "#fffbeb",
                      border: "1px solid #fde68a",
                      color: "#92400e",
                      fontSize: 12,
                      lineHeight: 1.6,
                    }}
                  >
                    <KeyRound size={17} style={{ flexShrink: 0 }} />
                    <span>
                      These controls currently update the interface only.
                      Enforcing MFA, SSO, and password policies requires
                      integration with the authentication backend.
                    </span>
                  </div>
                </div>
              </section>
            )}

            {activeSection === "sessions" && (
              <section style={panelStyle}>
                <SectionHeader
                  icon={<Monitor size={19} />}
                  title="Session controls"
                  description="Define the intended session duration and concurrent session limit."
                />
                <div style={{ padding: 22 }}>
                  <div style={fieldGridStyle}>
                    <Field label="Session timeout">
                      <select
                        style={inputStyle}
                        value={settings.sessionTimeout}
                        onChange={(e) =>
                          update("sessionTimeout", e.target.value)
                        }
                      >
                        <option value="15">15 minutes</option>
                        <option value="30">30 minutes</option>
                        <option value="60">60 minutes</option>
                        <option value="120">2 hours</option>
                        <option value="480">8 hours</option>
                      </select>
                    </Field>
                    <Field label="Maximum concurrent sessions">
                      <select
                        style={inputStyle}
                        value={settings.maxSessions}
                        onChange={(e) => update("maxSessions", e.target.value)}
                      >
                        <option value="1">1 session</option>
                        <option value="3">3 sessions</option>
                        <option value="5">5 sessions</option>
                        <option value="10">10 sessions</option>
                      </select>
                    </Field>
                  </div>
                  <div
                    style={{
                      marginTop: 20,
                      padding: 15,
                      borderRadius: 10,
                      background: "#f8fafc",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        fontSize: 13,
                        fontWeight: 750,
                      }}
                    >
                      <Clock3 size={17} color="#2563eb" />
                      Current session policy
                    </div>
                    <p
                      style={{
                        color: "#64748b",
                        fontSize: 12,
                        lineHeight: 1.7,
                        margin: "8px 0 0",
                      }}
                    >
                      Sessions time out after {settings.sessionTimeout} minutes
                      of inactivity, with a configured limit of{" "}
                      {settings.maxSessions} concurrent session(s) per user.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {activeSection === "notifications" && (
              <section style={panelStyle}>
                <SectionHeader
                  icon={<Bell size={19} />}
                  title="Notification preferences"
                  description="Choose which workspace events should generate notifications."
                />
                <div style={{ padding: 22 }}>
                  <ToggleRow
                    title="Access requests"
                    description="Notify administrators when employees request additional permissions."
                    checked={settings.notifyAccessRequests}
                    onChange={(value) =>
                      update("notifyAccessRequests", value)
                    }
                  />
                  <ToggleRow
                    title="Security events"
                    description="Notify administrators about important security-related events."
                    checked={settings.notifySecurityEvents}
                    onChange={(value) =>
                      update("notifySecurityEvents", value)
                    }
                  />
                  <ToggleRow
                    title="Workspace invitations"
                    description="Notify administrators when invitations are created or accepted."
                    checked={settings.notifyInvitations}
                    onChange={(value) => update("notifyInvitations", value)}
                  />
                  <ToggleRow
                    title="Weekly workspace report"
                    description="Enable a weekly summary of workspace activity and usage."
                    checked={settings.notifyWeeklyReport}
                    onChange={(value) => update("notifyWeeklyReport", value)}
                  />
                </div>
              </section>
            )}

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <span style={{ color: "#64748b", fontSize: 11 }}>
                {dirty ? "You have unsaved changes." : "All changes are up to date."}
              </span>
              <div style={{ display: "flex", gap: 9 }}>
                <button
                  style={buttonStyle}
                  disabled={!dirty}
                  onClick={resetSettings}
                >
                  Discard changes
                </button>
                <button
                  style={{
                    ...buttonStyle,
                    background: "#2563eb",
                    color: "#fff",
                    borderColor: "#2563eb",
                    opacity: dirty ? 1 : 0.6,
                  }}
                  disabled={!dirty}
                  onClick={saveSettings}
                >
                  <Save size={15} /> Save changes
                </button>
              </div>
            </div>
          </div>
        </div>

        <footer
          style={{
            marginTop: 24,
            padding: 15,
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            background: "#f1f5f9",
            color: "#64748b",
            fontSize: 11,
            lineHeight: 1.7,
          }}
        >
          <strong style={{ color: "#334155" }}>Demo mode:</strong> Settings
          are held in React state and are not persisted to a server or browser
          storage. Authentication enforcement, audit logging, and durable
          configuration require backend integration.
        </footer>
      </div>
    </main>
  );
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: "20px 22px",
        borderBottom: "1px solid #e5e7eb",
      }}
    >
      <div
        style={{
          width: 38,
          height: 38,
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
          borderRadius: 10,
          background: "#eff6ff",
          color: "#2563eb",
        }}
      >
        {icon}
      </div>
      <div>
        <h2 style={{ margin: 0, fontSize: 16 }}>{title}</h2>
        <p
          style={{
            color: "#64748b",
            fontSize: 12,
            lineHeight: 1.6,
            margin: "6px 0 0",
          }}
        >
          {description}
        </p>
      </div>
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
    <label style={{ display: "block", minWidth: 0 }}>
      <span
        style={{
          display: "block",
          marginBottom: 8,
          color: "#374151",
          fontSize: 12,
          fontWeight: 650,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function ToggleRow({
  title,
  description,
  checked,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 18,
        padding: "16px 0",
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 700 }}>{title}</div>
        <div
          style={{
            color: "#64748b",
            fontSize: 12,
            lineHeight: 1.6,
            marginTop: 5,
          }}
        >
          {description}
        </div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onChange(!checked)}
        style={{
          width: 44,
          height: 25,
          padding: 3,
          flexShrink: 0,
          border: 0,
          borderRadius: 20,
          background: checked ? "#2563eb" : "#cbd5e1",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: checked ? "flex-end" : "flex-start",
        }}
      >
        <span
          style={{
            width: 19,
            height: 19,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
          }}
        />
      </button>
    </div>
  );
}

const fieldGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 18,
};

const inputIconStyle: CSSProperties = {
  position: "absolute",
  top: 12,
  left: 12,
  color: "#94a3b8",
};
