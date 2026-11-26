
"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  Settings,
  UserRound,
  Building2,
  Bell,
  Palette,
  ShieldCheck,
  SlidersHorizontal,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Monitor,
  Moon,
  Sun,
  Globe,
  KeyRound,
  Clock3,
  ChevronRight,
} from "lucide-react";

type Section =
  | "profile"
  | "workspace"
  | "notifications"
  | "appearance"
  | "security"
  | "api";

type SettingsData = {
  fullName: string;
  email: string;
  jobTitle: string;
  company: string;
  workspaceName: string;
  workspaceDescription: string;
  timezone: string;
  language: string;
  emailNotifications: boolean;
  productUpdates: boolean;
  securityAlerts: boolean;
  usageAlerts: boolean;
  weeklyReports: boolean;
  theme: "light" | "dark" | "system";
  compactMode: boolean;
  sessionTimeout: string;
  defaultModel: string;
  temperature: number;
  maxTokens: number;
};

const STORAGE_KEY = "modelnow-console-settings-v1";

const defaultSettings: SettingsData = {
  fullName: "",
  email: "",
  jobTitle: "",
  company: "",
  workspaceName: "My Workspace",
  workspaceDescription: "",
  timezone: "Asia/Kolkata",
  language: "English",
  emailNotifications: true,
  productUpdates: false,
  securityAlerts: true,
  usageAlerts: true,
  weeklyReports: false,
  theme: "light",
  compactMode: false,
  sessionTimeout: "60",
  defaultModel: "modelnow-chat-v5",
  temperature: 0.7,
  maxTokens: 2048,
};

const navigation: {
  id: Section;
  label: string;
  description: string;
  icon: typeof UserRound;
}[] = [
  {
    id: "profile",
    label: "Profile",
    description: "Personal information",
    icon: UserRound,
  },
  {
    id: "workspace",
    label: "Workspace",
    description: "Organization settings",
    icon: Building2,
  },
  {
    id: "notifications",
    label: "Notifications",
    description: "Manage your alerts",
    icon: Bell,
  },
  {
    id: "appearance",
    label: "Appearance",
    description: "Customize your console",
    icon: Palette,
  },
  {
    id: "security",
    label: "Security",
    description: "Session preferences",
    icon: ShieldCheck,
  },
  {
    id: "api",
    label: "API preferences",
    description: "Default model settings",
    icon: SlidersHorizontal,
  },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<Section>("profile");

  const [settings, setSettings] =
    useState<SettingsData>(defaultSettings);

  const [savedSettings, setSavedSettings] =
    useState<SettingsData>(defaultSettings);

  const [isLoaded, setIsLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  const [notice, setNotice] = useState("");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (stored) {
        const parsed = JSON.parse(stored) as Partial<SettingsData>;
        const restored = {
          ...defaultSettings,
          ...parsed,
        };

        setSettings(restored);
        setSavedSettings(restored);
      }
    } catch {
      setNotice("Unable to load saved settings.");
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const hasChanges =
    JSON.stringify(settings) !== JSON.stringify(savedSettings);

  function update<K extends keyof SettingsData>(
    field: K,
    value: SettingsData[K]
  ) {
    setSettings((previous) => ({
      ...previous,
      [field]: value,
    }));

    setSaveStatus("idle");
    setNotice("");
  }

  function saveSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!settings.fullName.trim()) {
      setNotice("Please enter your full name.");
      setActiveSection("profile");
      return;
    }

    if (
      settings.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.email)
    ) {
      setNotice("Please enter a valid email address.");
      setActiveSection("profile");
      return;
    }

    setSaveStatus("saving");
    setNotice("");

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
      );

      setSavedSettings({ ...settings });
      setSaveStatus("saved");
      setNotice("Your settings have been saved.");
    } catch {
      setSaveStatus("error");
      setNotice(
        "Unable to save settings in this browser. Please check your browser storage."
      );
    }
  }

  function resetChanges() {
    setSettings({ ...savedSettings });
    setSaveStatus("idle");
    setNotice("Unsaved changes have been discarded.");
  }

  function restoreDefaults() {
    const confirmed = window.confirm(
      "Restore all settings to their default values? This will replace your saved browser settings."
    );

    if (!confirmed) return;

    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(defaultSettings)
      );

      setSettings({ ...defaultSettings });
      setSavedSettings({ ...defaultSettings });
      setSaveStatus("saved");
      setNotice("Default settings restored.");
    } catch {
      setSaveStatus("error");
      setNotice("Unable to restore default settings.");
    }
  }

  const currentSection = navigation.find(
    (item) => item.id === activeSection
  );

  if (!isLoaded) {
    return (
      <div className="settings-loading">
        <div className="loading-spinner" />
        <span>Loading settings...</span>
        <style jsx>{`
          .settings-loading {
            min-height: 70vh;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            color: #64748b;
            font-size: 14px;
          }
          .loading-spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #dbe4f5;
            border-top-color: #315fea;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  return (
    <main className="settings-page">
      <style jsx>{`
        .settings-page {
          width: 100%;
          min-height: 100%;
          padding: 30px;
          color: #172033;
          background: #f8fafc;
          box-sizing: border-box;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 26px;
        }

        .heading {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .heading-icon {
          width: 43px;
          height: 43px;
          display: grid;
          place-items: center;
          background: #eaf0ff;
          color: #315fea;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .page-header h1 {
          font-size: 25px;
          margin: 0;
          font-weight: 750;
          letter-spacing: -0.5px;
        }

        .page-header p {
          color: #718096;
          font-size: 13px;
          margin: 6px 0 0;
        }

        .header-actions {
          display: flex;
          gap: 9px;
          flex-wrap: wrap;
        }

        .button {
          border: 1px solid #dce2eb;
          background: white;
          color: #334155;
          border-radius: 9px;
          padding: 10px 14px;
          font-size: 13px;
          font-weight: 650;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: 0.2s;
        }

        .button:hover {
          background: #f1f5f9;
        }

        .button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .button-primary {
          background: #315fea;
          color: white;
          border-color: #315fea;
        }

        .button-primary:hover {
          background: #244fd0;
        }

        .settings-layout {
          display: grid;
          grid-template-columns: 245px minmax(0, 1fr);
          gap: 22px;
          align-items: start;
        }

        .settings-nav,
        .settings-content {
          background: white;
          border: 1px solid #e6eaf0;
          border-radius: 13px;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.025);
        }

        .settings-nav {
          padding: 10px;
          position: sticky;
          top: 20px;
        }

        .nav-heading {
          padding: 12px 12px 13px;
          font-size: 11px;
          color: #94a3b8;
          font-weight: 750;
          letter-spacing: 0.9px;
          text-transform: uppercase;
        }

        .nav-item {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 12px 11px;
          border: 0;
          border-radius: 9px;
          background: transparent;
          color: #64748b;
          text-align: left;
          cursor: pointer;
          margin-bottom: 3px;
        }

        .nav-item:hover {
          background: #f7f9fc;
          color: #315fea;
        }

        .nav-item.active {
          color: #315fea;
          background: #edf3ff;
        }

        .nav-item-text {
          flex: 1;
          min-width: 0;
        }

        .nav-item strong {
          display: block;
          font-size: 13px;
          font-weight: 700;
        }

        .nav-item small {
          display: block;
          font-size: 11px;
          color: #94a3b8;
          margin-top: 4px;
        }

        .settings-content {
          min-width: 0;
          overflow: hidden;
        }

        .section-header {
          padding: 23px 25px;
          border-bottom: 1px solid #edf0f4;
        }

        .section-header h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 750;
        }

        .section-header p {
          margin: 6px 0 0;
          font-size: 13px;
          color: #8290a3;
        }

        .section-body {
          padding: 25px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        .field {
          min-width: 0;
        }

        .field.full {
          grid-column: 1 / -1;
        }

        .field label {
          display: block;
          color: #344054;
          font-size: 12px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .field input,
        .field select,
        .field textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #dce2eb;
          background: white;
          color: #172033;
          border-radius: 8px;
          padding: 11px 12px;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .field input:focus,
        .field select:focus,
        .field textarea:focus {
          border-color: #315fea;
          box-shadow: 0 0 0 3px rgba(49, 95, 234, 0.1);
        }

        .field textarea {
          resize: vertical;
          min-height: 90px;
        }

        .field input:disabled {
          background: #f8fafc;
          color: #94a3b8;
          cursor: not-allowed;
        }

        .field-help {
          color: #94a3b8;
          font-size: 11px;
          line-height: 1.5;
          margin-top: 7px;
        }

        .divider {
          height: 1px;
          background: #edf0f4;
          margin: 25px 0;
        }

        .subheading {
          font-size: 14px;
          font-weight: 750;
          margin: 0 0 6px;
        }

        .subdescription {
          color: #8491a4;
          font-size: 12px;
          margin: 0 0 18px;
        }

        .toggle-list {
          display: grid;
          gap: 0;
        }

        .toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 17px 0;
          border-bottom: 1px solid #f0f2f5;
        }

        .toggle-row:last-child {
          border-bottom: 0;
        }

        .toggle-copy {
          min-width: 0;
        }

        .toggle-copy strong {
          display: block;
          font-size: 13px;
          color: #344054;
        }

        .toggle-copy span {
          display: block;
          font-size: 11px;
          color: #94a3b8;
          margin-top: 5px;
          line-height: 1.5;
        }

        .switch {
          width: 42px;
          height: 24px;
          border: 0;
          border-radius: 20px;
          background: #cbd5e1;
          padding: 3px;
          cursor: pointer;
          flex-shrink: 0;
          transition: 0.2s;
        }

        .switch.on {
          background: #315fea;
        }

        .switch span {
          display: block;
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          transition: transform 0.2s;
        }

        .switch.on span {
          transform: translateX(18px);
        }

        .theme-options {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }

        .theme-option {
          border: 1px solid #dce2eb;
          border-radius: 10px;
          padding: 15px;
          text-align: left;
          background: white;
          cursor: pointer;
          color: #475569;
        }

        .theme-option.selected {
          border: 1.5px solid #315fea;
          background: #f5f8ff;
          color: #315fea;
        }

        .theme-option strong {
          display: block;
          font-size: 12px;
          margin-top: 10px;
        }

        .theme-option small {
          display: block;
          font-size: 10px;
          color: #94a3b8;
          margin-top: 4px;
        }

        .security-card {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          border: 1px solid #e5eaf2;
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 14px;
        }

        .security-icon {
          width: 38px;
          height: 38px;
          border-radius: 9px;
          display: grid;
          place-items: center;
          color: #315fea;
          background: #edf3ff;
          flex-shrink: 0;
        }

        .security-card strong {
          display: block;
          font-size: 13px;
        }

        .security-card p {
          margin: 5px 0 0;
          color: #8793a5;
          font-size: 11px;
          line-height: 1.5;
        }

        .notice {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          padding: 12px 14px;
          border-radius: 9px;
          margin-bottom: 18px;
          font-size: 12px;
          line-height: 1.5;
        }

        .notice.success {
          background: #ecfdf3;
          color: #067647;
          border: 1px solid #abefc6;
        }

        .notice.error {
          background: #fff4f2;
          color: #b42318;
          border: 1px solid #fecdca;
        }

        .content-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          padding: 17px 25px;
          border-top: 1px solid #edf0f4;
          background: #fcfdff;
        }

        .footer-note {
          color: #94a3b8;
          font-size: 11px;
        }

        .footer-actions {
          display: flex;
          gap: 9px;
        }

        .danger-zone {
          border: 1px solid #fee4e2;
          background: #fffafa;
          border-radius: 10px;
          padding: 17px;
          margin-top: 25px;
        }

        .danger-zone h3 {
          margin: 0;
          color: #b42318;
          font-size: 13px;
        }

        .danger-zone p {
          color: #8f7777;
          font-size: 11px;
          line-height: 1.5;
          margin: 7px 0 13px;
        }

        .danger-button {
          border: 1px solid #fecdca;
          background: white;
          color: #b42318;
          border-radius: 8px;
          padding: 9px 12px;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .danger-button:hover {
          background: #fff1f0;
        }

        @media (max-width: 900px) {
          .settings-page {
            padding: 20px;
          }

          .settings-layout {
            grid-template-columns: 1fr;
          }

          .settings-nav {
            position: static;
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .nav-heading {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 600px) {
          .settings-page {
            padding: 14px;
          }

          .page-header {
            flex-direction: column;
          }

          .header-actions {
            width: 100%;
          }

          .header-actions .button {
            flex: 1;
          }

          .settings-nav {
            grid-template-columns: 1fr;
          }

          .form-grid {
            grid-template-columns: 1fr;
          }

          .field.full {
            grid-column: auto;
          }

          .section-body {
            padding: 18px;
          }

          .section-header {
            padding: 18px;
          }

          .theme-options {
            grid-template-columns: 1fr;
          }

          .content-footer {
            padding: 15px 18px;
          }

          .footer-actions {
            width: 100%;
          }

          .footer-actions .button {
            flex: 1;
          }
        }
      `}</style>

      <header className="page-header">
        <div>
          <div className="heading">
            <div className="heading-icon">
              <Settings size={22} />
            </div>
            <div>
              <h1>Settings</h1>
              <p>
                Manage your ModelNow account, workspace, and
                preferences.
              </p>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className="button"
            onClick={resetChanges}
            disabled={!hasChanges}
          >
            <RotateCcw size={15} />
            Discard
          </button>

          <button
            type="button"
            className="button button-primary"
         onClick={() => {
  const form = document.getElementById("settings-form");

  if (form instanceof HTMLFormElement) {
    form.requestSubmit();
  }
}}
            disabled={!hasChanges || saveStatus === "saving"}
          >
            <Save size={15} />
            {saveStatus === "saving"
              ? "Saving..."
              : "Save changes"}
          </button>
        </div>
      </header>

      <div className="settings-layout">
        <aside className="settings-nav">
          <div className="nav-heading">Settings menu</div>

          {navigation.map((item) => {
            const Icon = item.icon;
            const active = activeSection === item.id;

            return (
              <button
                type="button"
                key={item.id}
                className={`nav-item ${active ? "active" : ""}`}
                onClick={() => {
                  setActiveSection(item.id);
                  setNotice("");
                }}
                aria-current={active ? "page" : undefined}
              >
                <Icon size={18} />
                <span className="nav-item-text">
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
                <ChevronRight size={15} />
              </button>
            );
          })}
        </aside>

        <section className="settings-content">
          <div className="section-header">
            <h2>{currentSection?.label}</h2>
            <p>{currentSection?.description}</p>
          </div>

          <form id="settings-form" onSubmit={saveSettings}>
            <div className="section-body">
              {notice && (
                <div
                  className={`notice ${
                    saveStatus === "saved" ? "success" : "error"
                  }`}
                  role="status"
                >
                  {saveStatus === "saved" ? (
                    <CheckCircle2 size={17} />
                  ) : (
                    <AlertCircle size={17} />
                  )}
                  {notice}
                </div>
              )}

              {activeSection === "profile" && (
                <>
                  <h3 className="subheading">Personal information</h3>
                  <p className="subdescription">
                    Update the personal details associated with
                    your ModelNow account.
                  </p>

                  <div className="form-grid">
                    <div className="field">
                      <label htmlFor="fullName">Full name</label>
                      <input
                        id="fullName"
                        value={settings.fullName}
                        onChange={(e) =>
                          update("fullName", e.target.value)
                        }
                        placeholder="Your full name"
                        autoComplete="name"
                        required
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="email">Email address</label>
                      <input
                        id="email"
                        type="email"
                        value={settings.email}
                        onChange={(e) =>
                          update("email", e.target.value)
                        }
                        placeholder="you@company.com"
                        autoComplete="email"
                      />
                      <div className="field-help">
                        Email changes may require account
                        verification when connected to authentication.
                      </div>
                    </div>

                    <div className="field">
                      <label htmlFor="jobTitle">Job title</label>
                      <input
                        id="jobTitle"
                        value={settings.jobTitle}
                        onChange={(e) =>
                          update("jobTitle", e.target.value)
                        }
                        placeholder="e.g. Developer"
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="company">Company</label>
                      <input
                        id="company"
                        value={settings.company}
                        onChange={(e) =>
                          update("company", e.target.value)
                        }
                        placeholder="Company name"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeSection === "workspace" && (
                <>
                  <h3 className="subheading">Workspace details</h3>
                  <p className="subdescription">
                    Configure the workspace displayed in your
                    ModelNow Console.
                  </p>

                  <div className="form-grid">
                    <div className="field full">
                      <label htmlFor="workspaceName">
                        Workspace name
                      </label>
                      <input
                        id="workspaceName"
                        value={settings.workspaceName}
                        onChange={(e) =>
                          update("workspaceName", e.target.value)
                        }
                        placeholder="Workspace name"
                      />
                    </div>

                    <div className="field full">
                      <label htmlFor="workspaceDescription">
                        Workspace description
                      </label>
                      <textarea
                        id="workspaceDescription"
                        value={settings.workspaceDescription}
                        onChange={(e) =>
                          update(
                            "workspaceDescription",
                            e.target.value
                          )
                        }
                        placeholder="Describe what this workspace is used for..."
                      />
                    </div>

                    <div className="field">
                      <label htmlFor="timezone">Timezone</label>
                      <select
                        id="timezone"
                        value={settings.timezone}
                        onChange={(e) =>
                          update("timezone", e.target.value)
                        }
                      >
                        <option value="Asia/Kolkata">
                          India Standard Time (UTC+05:30)
                        </option>
                        <option value="UTC">
                          UTC
                        </option>
                        <option value="America/New_York">
                          Eastern Time
                        </option>
                        <option value="America/Los_Angeles">
                          Pacific Time
                        </option>
                        <option value="Europe/London">
                          London
                        </option>
                        <option value="Asia/Singapore">
                          Singapore
                        </option>
                      </select>
                    </div>

                    <div className="field">
                      <label htmlFor="language">Language</label>
                      <select
                        id="language"
                        value={settings.language}
                        onChange={(e) =>
                          update("language", e.target.value)
                        }
                      >
                        <option value="English">English</option>
                        <option value="Hindi">Hindi</option>
                        <option value="Telugu">Telugu</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {activeSection === "notifications" && (
                <>
                  <h3 className="subheading">
                    Notification preferences
                  </h3>
                  <p className="subdescription">
                    Choose which notifications you want to receive.
                  </p>

                  <div className="toggle-list">
                    {(
                      [
                        [
                          "emailNotifications",
                          "Email notifications",
                          "Receive important account and workspace updates by email.",
                        ],
                        [
                          "securityAlerts",
                          "Security alerts",
                          "Receive alerts about sign-ins and important security events.",
                        ],
                        [
                          "usageAlerts",
                          "Usage and billing alerts",
                          "Get notified about usage thresholds and billing activity.",
                        ],
                        [
                          "weeklyReports",
                          "Weekly usage reports",
                          "Receive a weekly summary of your workspace activity.",
                        ],
                        [
                          "productUpdates",
                          "Product announcements",
                          "Hear about new ModelNow features and product updates.",
                        ],
                      ] as const
                    ).map(([key, title, description]) => (
                      <div className="toggle-row" key={key}>
                        <div className="toggle-copy">
                          <strong>{title}</strong>
                          <span>{description}</span>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={settings[key]}
                          aria-label={title}
                          className={`switch ${
                            settings[key] ? "on" : ""
                          }`}
                          onClick={() => update(key, !settings[key])}
                        >
                          <span />
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {activeSection === "appearance" && (
                <>
                  <h3 className="subheading">
                    Appearance preferences
                  </h3>
                  <p className="subdescription">
                    Choose how the ModelNow Console should look.
                  </p>

                  <div className="field full">
                    <label>Interface theme</label>

                    <div className="theme-options">
                      {(
                        [
                          ["light", Sun, "Light", "Bright interface"],
                          ["dark", Moon, "Dark", "Dark interface"],
                          [
                            "system",
                            Monitor,
                            "System",
                            "Follow device settings",
                          ],
                        ] as const
                      ).map(([value, Icon, title, description]) => (
                        <button
                          type="button"
                          key={value}
                          className={`theme-option ${
                            settings.theme === value
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => update("theme", value)}
                          aria-pressed={settings.theme === value}
                        >
                          <Icon size={21} />
                          <strong>{title}</strong>
                          <small>{description}</small>
                        </button>
                      ))}
                    </div>

                    <div className="field-help">
                      This saves your theme preference. Applying a
                      full dark theme across the application requires
                      theme support in the console layout.
                    </div>
                  </div>

                  <div className="divider" />

                  <div className="toggle-row">
                    <div className="toggle-copy">
                      <strong>Compact interface</strong>
                      <span>
                        Prefer tighter spacing and denser tables.
                      </span>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={settings.compactMode}
                      aria-label="Compact interface"
                      className={`switch ${
                        settings.compactMode ? "on" : ""
                      }`}
                      onClick={() =>
                        update("compactMode", !settings.compactMode)
                      }
                    >
                      <span />
                    </button>
                  </div>
                </>
              )}

              {activeSection === "security" && (
                <>
                  <h3 className="subheading">
                    Security preferences
                  </h3>
                  <p className="subdescription">
                    Review your session preferences and account
                    security options.
                  </p>

                  <div className="security-card">
                    <div className="security-icon">
                      <KeyRound size={19} />
                    </div>
                    <div>
                      <strong>Authentication and password</strong>
                      <p>
                        Password changes, multi-factor
                        authentication, and account recovery should
                        be managed through your connected
                        authentication service.
                      </p>
                    </div>
                  </div>

                  <div className="security-card">
                    <div className="security-icon">
                      <ShieldCheck size={19} />
                    </div>
                    <div>
                      <strong>Multi-factor authentication</strong>
                      <p>
                        MFA status is not available in this
                        frontend-only settings page. Connect your
                        authentication provider to manage it here.
                      </p>
                    </div>
                  </div>

                  <div className="divider" />

                  <div className="field">
                    <label htmlFor="sessionTimeout">
                      Session timeout
                    </label>
                    <select
                      id="sessionTimeout"
                      value={settings.sessionTimeout}
                      onChange={(e) =>
                        update("sessionTimeout", e.target.value)
                      }
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="240">4 hours</option>
                      <option value="480">8 hours</option>
                    </select>
                    <div className="field-help">
                      This stores your preferred timeout. It does not
                      change actual authentication-session expiry
                      until connected to your authentication backend.
                    </div>
                  </div>

                  <div className="danger-zone">
                    <h3>Account actions</h3>
                    <p>
                      For security, account deletion, session
                      revocation, and password changes should be
                      handled by authenticated backend operations.
                      These actions are not performed by this page.
                    </p>
                    <button
                      type="button"
                      className="danger-button"
                      onClick={() =>
                        setNotice(
                          "Account security actions require backend authentication integration."
                        )
                      }
                    >
                      View account security requirements
                    </button>
                  </div>
                </>
              )}

              {activeSection === "api" && (
                <>
                  <h3 className="subheading">
                    Default API preferences
                  </h3>
                  <p className="subdescription">
                    Set default parameters for new API requests.
                    Individual requests can override these values.
                  </p>

                  <div className="form-grid">
                    <div className="field full">
                      <label htmlFor="defaultModel">
                        Default model
                      </label>
                      <select
                        id="defaultModel"
                        value={settings.defaultModel}
                        onChange={(e) =>
                          update("defaultModel", e.target.value)
                        }
                      >
                        <option value="modelnow-chat-v5">
                          ModelNow Chat V5
                        </option>
                        <option value="modelnow-mobile-chats-v1">
                          ModelNow Mobile Chats V1
                        </option>
                      </select>
                      <div className="field-help">
                        These are configurable model identifiers.
                        Availability depends on your account and
                        model access.
                      </div>
                    </div>

                    <div className="field">
                      <label htmlFor="temperature">
                        Temperature: {settings.temperature.toFixed(1)}
                      </label>
                      <input
                        id="temperature"
                        type="range"
                        min="0"
                        max="2"
                        step="0.1"
                        value={settings.temperature}
                        onChange={(e) =>
                          update(
                            "temperature",
                            Number(e.target.value)
                          )
                        }
                      />
                      <div className="field-help">
                        Lower values produce more predictable
                        outputs. Higher values allow more variation.
                      </div>
                    </div>

                    <div className="field">
                      <label htmlFor="maxTokens">
                        Maximum output tokens
                      </label>
                      <input
                        id="maxTokens"
                        type="number"
                        min="1"
                        max="128000"
                        value={settings.maxTokens}
                        onChange={(e) =>
                          update(
                            "maxTokens",
                            Math.min(
                              128000,
                              Math.max(1, Number(e.target.value) || 1)
                            )
                          )
                        }
                      />
                      <div className="field-help">
                        Maximum output length for new requests.
                        Actual model limits may differ.
                      </div>
                    </div>
                  </div>

                  <div className="divider" />

                  <div className="security-card">
                    <div className="security-icon">
                      <Globe size={19} />
                    </div>
                    <div>
                      <strong>API key management</strong>
                      <p>
                        Create, rotate, and revoke API keys from the
                        API Keys section. Secret keys should never be
                        stored in browser settings or localStorage.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <footer className="content-footer">
              <div className="footer-note">
                {hasChanges
                  ? "You have unsaved changes."
                  : "All changes are up to date."}
              </div>

              <div className="footer-actions">
                <button
                  type="button"
                  className="button"
                  onClick={resetChanges}
                  disabled={!hasChanges}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="button button-primary"
                  disabled={!hasChanges || saveStatus === "saving"}
                >
                  <Save size={15} />
                  {saveStatus === "saving"
                    ? "Saving..."
                    : "Save changes"}
                </button>
              </div>
            </footer>
          </form>
        </section>
      </div>
    </main>
  );
}
