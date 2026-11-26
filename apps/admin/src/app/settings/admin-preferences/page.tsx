
"use client";

import { useState } from "react";
import {
  Palette,
  Bell,
  LayoutDashboard,
  Clock,
  Save,
  RotateCcw,
  CheckCircle2,
  Monitor,
  Table2,
  Eye,
} from "lucide-react";

type Preferences = {
  theme: string;
  dashboardLayout: string;
  defaultLandingPage: string;
  itemsPerPage: string;
  timeFormat: string;
  accentColor: string;
  compactMode: boolean;
  showWelcomeMessage: boolean;
  emailNotifications: boolean;
  securityAlerts: boolean;
  activityNotifications: boolean;
  showQuickStats: boolean;
};

const initialPreferences: Preferences = {
  theme: "light",
  dashboardLayout: "comfortable",
  defaultLandingPage: "/dashboard",
  itemsPerPage: "25",
  timeFormat: "24-hour",
  accentColor: "#5265d9",
  compactMode: false,
  showWelcomeMessage: true,
  emailNotifications: true,
  securityAlerts: true,
  activityNotifications: false,
  showQuickStats: true,
};

export default function AdminPreferencesPage() {
  const [preferences, setPreferences] =
    useState<Preferences>(initialPreferences);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof Preferences>(
    key: K,
    value: Preferences[K],
  ) {
    setPreferences((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function savePreferences() {
    try {
      localStorage.setItem(
        "modelnow-admin-preferences",
        JSON.stringify(preferences),
      );
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  function resetPreferences() {
    setPreferences(initialPreferences);
    setSaved(false);
  }

  function PreferenceToggle({
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
      <div className="ap-toggle-row">
        <div className="ap-toggle-text">
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={checked}
          aria-label={title}
          className={`ap-switch ${checked ? "active" : ""}`}
          onClick={() => onChange(!checked)}
        />
      </div>
    );
  }

  return (
    <main className="ap-page">
      <style>{`
        * { box-sizing: border-box; }

        .ap-page {
          min-height: 100vh;
          padding: 30px;
          background: #f7f8fc;
          color: #182238;
          font-family: Arial, Helvetica, sans-serif;
        }

        .ap-container { max-width: 1180px; margin: 0 auto; }

        .ap-breadcrumb {
          display: flex;
          flex-wrap: wrap;
          gap: 9px;
          margin-bottom: 22px;
          color: #81899b;
          font-size: 13px;
        }

        .ap-breadcrumb a { color: #5266d9; text-decoration: none; }

        .ap-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 26px;
        }

        .ap-heading-main { display: flex; align-items: center; gap: 14px; }

        .ap-heading-icon {
          display: grid;
          place-items: center;
          width: 50px;
          height: 50px;
          flex-shrink: 0;
          border-radius: 14px;
          background: #e9edff;
          color: #5265d9;
        }

        .ap-heading h1 {
          margin: 0 0 7px;
          font-size: 27px;
          letter-spacing: -.6px;
        }

        .ap-heading p {
          margin: 0;
          color: #7c8598;
          font-size: 13px;
          line-height: 1.6;
        }

        .ap-actions { display: flex; gap: 10px; }

        .ap-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 40px;
          padding: 0 15px;
          border: 1px solid #dfe4ed;
          border-radius: 9px;
          background: white;
          color: #3d4860;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .ap-button.primary {
          background: #5265d9;
          color: white;
          border-color: #5265d9;
        }

        .ap-button:hover { opacity: .9; }

        .ap-success {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 20px;
          padding: 13px 15px;
          border: 1px solid #bce8ce;
          border-radius: 10px;
          background: #effbf4;
          color: #187447;
          font-size: 13px;
        }

        .ap-content {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 300px;
          gap: 21px;
          align-items: start;
        }

        .ap-main { display: flex; flex-direction: column; gap: 20px; }

        .ap-card {
          overflow: hidden;
          border: 1px solid #e7eaf1;
          border-radius: 14px;
          background: white;
          box-shadow: 0 2px 7px rgba(24,36,70,.025);
        }

        .ap-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .ap-card-icon {
          display: grid;
          place-items: center;
          width: 39px;
          height: 39px;
          flex-shrink: 0;
          border-radius: 10px;
          background: #f0f2ff;
          color: #5265d9;
        }

        .ap-card-header h2 { margin: 0 0 5px; font-size: 15px; }

        .ap-card-header p {
          margin: 0;
          color: #858da0;
          font-size: 12px;
          line-height: 1.5;
        }

        .ap-fields {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
          padding: 22px;
        }

        .ap-field { display: flex; flex-direction: column; gap: 8px; min-width: 0; }
        .ap-field.full { grid-column: 1 / -1; }

        .ap-field label {
          color: #39445a;
          font-size: 12px;
          font-weight: 700;
        }

        .ap-field select, .ap-field input[type="text"] {
          width: 100%;
          height: 42px;
          padding: 0 12px;
          border: 1px solid #dfe4ed;
          border-radius: 8px;
          outline: none;
          background: white;
          color: #202a40;
          font-size: 13px;
        }

        .ap-field select:focus, .ap-field input:focus {
          border-color: #6677e7;
          box-shadow: 0 0 0 3px rgba(102,119,231,.1);
        }

        .ap-field small {
          color: #9299a9;
          font-size: 11px;
          line-height: 1.5;
        }

        .ap-color-options { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }

        .ap-color {
          width: 30px;
          height: 30px;
          border: 3px solid white;
          border-radius: 50%;
          outline: 1px solid #e0e4ed;
          cursor: pointer;
        }

        .ap-color.selected { outline: 2px solid #202a40; }

        .ap-toggle-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 17px 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .ap-toggle-row:last-child { border-bottom: 0; }

        .ap-toggle-text { min-width: 0; }
        .ap-toggle-text strong { display: block; margin-bottom: 5px; font-size: 12px; }

        .ap-toggle-text p {
          margin: 0;
          color: #858da0;
          font-size: 11px;
          line-height: 1.6;
        }

        .ap-switch {
          position: relative;
          flex: 0 0 auto;
          width: 38px;
          height: 22px;
          padding: 0;
          border: 0;
          border-radius: 20px;
          background: #cbd1dd;
          cursor: pointer;
        }

        .ap-switch.active { background: #5265d9; }

        .ap-switch::after {
          content: "";
          position: absolute;
          top: 3px;
          left: 3px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          transition: transform .15s ease;
        }

        .ap-switch.active::after { transform: translateX(16px); }

        .ap-side { display: flex; flex-direction: column; gap: 18px; }

        .ap-side-card {
          padding: 20px;
          border: 1px solid #e7eaf1;
          border-radius: 14px;
          background: white;
        }

        .ap-side-card h3 { margin: 0 0 16px; font-size: 14px; }

        .ap-preview {
          overflow: hidden;
          border: 1px solid #e4e8f1;
          border-radius: 10px;
          background: #f8f9fd;
        }

        .ap-preview-top {
          display: flex;
          align-items: center;
          gap: 7px;
          padding: 12px;
          border-bottom: 1px solid #e4e8f1;
          background: white;
          font-size: 11px;
          font-weight: 700;
        }

        .ap-preview-logo {
          display: grid;
          place-items: center;
          width: 25px;
          height: 25px;
          border-radius: 7px;
          background: var(--ap-accent);
          color: white;
        }

        .ap-preview-body { display: flex; min-height: 150px; }

        .ap-preview-nav {
          width: 58px;
          padding: 12px 8px;
          border-right: 1px solid #e4e8f1;
          background: white;
        }

        .ap-preview-nav span {
          display: block;
          height: 7px;
          margin-bottom: 12px;
          border-radius: 4px;
          background: #e3e7f0;
        }

        .ap-preview-nav span:first-child { background: var(--ap-accent); }

        .ap-preview-content { flex: 1; padding: 13px; min-width: 0; }

        .ap-preview-content strong { display: block; margin-bottom: 12px; font-size: 11px; }

        .ap-preview-stat {
          height: 42px;
          margin-bottom: 10px;
          border: 1px solid #e5e9f1;
          border-radius: 7px;
          background: white;
        }

        .ap-preview-bar {
          width: 65%;
          height: 5px;
          margin: 12px;
          border-radius: 5px;
          background: var(--ap-accent);
        }

        .ap-note {
          margin: 13px 0 0;
          color: #858da0;
          font-size: 12px;
          line-height: 1.7;
        }

        .ap-color-value {
          color: #6e7890;
          font-size: 12px;
          font-family: monospace;
        }

        @media (max-width: 950px) {
          .ap-content { grid-template-columns: 1fr; }
          .ap-side { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        @media (max-width: 650px) {
          .ap-page { padding: 18px 14px; }
          .ap-heading { flex-direction: column; }
          .ap-heading h1 { font-size: 23px; }
          .ap-actions { width: 100%; }
          .ap-button { flex: 1; }
          .ap-fields { grid-template-columns: 1fr; padding: 17px; }
          .ap-field.full { grid-column: auto; }
          .ap-side { grid-template-columns: 1fr; }
          .ap-toggle-row { padding: 15px 17px; }
        }
      `}</style>

      <div className="ap-container">
        <div className="ap-breadcrumb">
          <a href="/dashboard">Admin</a>
          <span>/</span>
          <a href="/settings">Settings</a>
          <span>/</span>
          <span>Admin Preferences</span>
        </div>

        <header className="ap-heading">
          <div className="ap-heading-main">
            <div className="ap-heading-icon">
              <Palette size={24} />
            </div>
            <div>
              <h1>Admin Preferences</h1>
              <p>
                Personalize your admin workspace, dashboard, appearance,
                and notification preferences.
              </p>
            </div>
          </div>

          <div className="ap-actions">
            <button
              type="button"
              className="ap-button"
              onClick={resetPreferences}
            >
              <RotateCcw size={15} />
              Reset
            </button>
            <button
              type="button"
              className="ap-button primary"
              onClick={savePreferences}
            >
              <Save size={15} />
              Save Preferences
            </button>
          </div>
        </header>

        {saved && (
          <div className="ap-success" role="status">
            <CheckCircle2 size={18} />
            Admin preferences saved in this browser.
          </div>
        )}

        <div className="ap-content">
          <div className="ap-main">
            <section className="ap-card">
              <div className="ap-card-header">
                <span className="ap-card-icon"><Palette size={19} /></span>
                <div>
                  <h2>Appearance</h2>
                  <p>Customize the visual appearance of your admin workspace.</p>
                </div>
              </div>

              <div className="ap-fields">
                <div className="ap-field">
                  <label htmlFor="theme">Theme</label>
                  <select
                    id="theme"
                    value={preferences.theme}
                    onChange={(e) => update("theme", e.target.value)}
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="system">Follow system</option>
                  </select>
                  <small>Preferred interface appearance.</small>
                </div>

                <div className="ap-field">
                  <label htmlFor="dashboardLayout">Dashboard Spacing</label>
                  <select
                    id="dashboardLayout"
                    value={preferences.dashboardLayout}
                    onChange={(e) => update("dashboardLayout", e.target.value)}
                  >
                    <option value="comfortable">Comfortable</option>
                    <option value="compact">Compact</option>
                    <option value="spacious">Spacious</option>
                  </select>
                </div>

                <div className="ap-field full">
                  <label>Accent Color</label>
                  <div className="ap-color-options">
                    {[
                      "#5265d9",
                      "#2563eb",
                      "#0d9488",
                      "#7c3aed",
                      "#db2777",
                      "#ea580c",
                    ].map((color) => (
                      <button
                        key={color}
                        type="button"
                        aria-label={`Select accent color ${color}`}
                        aria-pressed={preferences.accentColor === color}
                        className={`ap-color ${
                          preferences.accentColor === color ? "selected" : ""
                        }`}
                        style={{ background: color }}
                        onClick={() => update("accentColor", color)}
                      />
                    ))}
                    <span className="ap-color-value">
                      {preferences.accentColor}
                    </span>
                  </div>
                </div>

                <div className="ap-field full">
                  <PreferenceToggle
                    title="Compact Mode"
                    description="Reduce spacing between rows and interface elements."
                    checked={preferences.compactMode}
                    onChange={(value) => update("compactMode", value)}
                  />
                  <PreferenceToggle
                    title="Show Welcome Message"
                    description="Display the welcome message when opening the admin dashboard."
                    checked={preferences.showWelcomeMessage}
                    onChange={(value) => update("showWelcomeMessage", value)}
                  />
                </div>
              </div>
            </section>

            <section className="ap-card">
              <div className="ap-card-header">
                <span className="ap-card-icon"><LayoutDashboard size={19} /></span>
                <div>
                  <h2>Workspace Defaults</h2>
                  <p>Choose your default admin landing page and data display options.</p>
                </div>
              </div>

              <div className="ap-fields">
                <div className="ap-field">
                  <label htmlFor="defaultLandingPage">Default Landing Page</label>
                  <select
                    id="defaultLandingPage"
                    value={preferences.defaultLandingPage}
                    onChange={(e) =>
                      update("defaultLandingPage", e.target.value)
                    }
                  >
                    <option value="/dashboard">Dashboard Overview</option>
                    <option value="/organizations">Organizations</option>
                    <option value="/users">Users</option>
                    <option value="/usage">Usage & Analytics</option>
                    <option value="/settings">Settings</option>
                  </select>
                </div>

                <div className="ap-field">
                  <label htmlFor="itemsPerPage">Rows Per Page</label>
                  <select
                    id="itemsPerPage"
                    value={preferences.itemsPerPage}
                    onChange={(e) => update("itemsPerPage", e.target.value)}
                  >
                    <option value="10">10 rows</option>
                    <option value="25">25 rows</option>
                    <option value="50">50 rows</option>
                    <option value="100">100 rows</option>
                  </select>
                </div>

                <div className="ap-field">
                  <label htmlFor="timeFormat">Time Format</label>
                  <select
                    id="timeFormat"
                    value={preferences.timeFormat}
                    onChange={(e) => update("timeFormat", e.target.value)}
                  >
                    <option value="12-hour">12-hour (AM/PM)</option>
                    <option value="24-hour">24-hour</option>
                  </select>
                </div>

                <div className="ap-field">
                  <label>Quick Stats</label>
                  <PreferenceToggle
                    title="Show Quick Stats"
                    description="Display summary metrics on the dashboard."
                    checked={preferences.showQuickStats}
                    onChange={(value) => update("showQuickStats", value)}
                  />
                </div>
              </div>
            </section>

            <section className="ap-card">
              <div className="ap-card-header">
                <span className="ap-card-icon"><Bell size={19} /></span>
                <div>
                  <h2>Notifications</h2>
                  <p>Choose which admin notifications you want to receive.</p>
                </div>
              </div>

              <PreferenceToggle
                title="Email Notifications"
                description="Receive administrative updates and important platform notices by email."
                checked={preferences.emailNotifications}
                onChange={(value) => update("emailNotifications", value)}
              />
              <PreferenceToggle
                title="Security Alerts"
                description="Receive alerts for important security events and account activity."
                checked={preferences.securityAlerts}
                onChange={(value) => update("securityAlerts", value)}
              />
              <PreferenceToggle
                title="Activity Notifications"
                description="Receive notifications about routine platform and workspace activity."
                checked={preferences.activityNotifications}
                onChange={(value) => update("activityNotifications", value)}
              />
            </section>
          </div>

          <aside className="ap-side">
            <section className="ap-side-card">
              <h3><Eye size={16} style={{ display: "inline", marginRight: 7 }} />Live Preview</h3>

              <div
                className="ap-preview"
                style={{ "--ap-accent": preferences.accentColor } as React.CSSProperties}
              >
                <div className="ap-preview-top">
                  <span className="ap-preview-logo">M</span>
                  ModelNow Admin
                </div>
                <div className="ap-preview-body">
                  <div className="ap-preview-nav">
                    <span />
                    <span />
                    <span />
                    <span />
                    <span />
                  </div>
                  <div className="ap-preview-content">
                    <strong>Dashboard</strong>
                    <div className="ap-preview-stat">
                      <div className="ap-preview-bar" />
                    </div>
                    <div className="ap-preview-stat">
                      <div className="ap-preview-bar" style={{ width: "40%" }} />
                    </div>
                  </div>
                </div>
              </div>

              <p className="ap-note">
                Preview updates as you select an accent color. Other preferences
                are stored separately from the actual app-wide theme.
              </p>
            </section>

            <section className="ap-side-card">
              <h3><Monitor size={16} style={{ display: "inline", marginRight: 7 }} />Current Preferences</h3>
              <div className="ap-toggle-row">
                <div className="ap-toggle-text">
                  <strong>Theme</strong>
                  <p>{preferences.theme}</p>
                </div>
              </div>
              <div className="ap-toggle-row">
                <div className="ap-toggle-text">
                  <strong>Layout</strong>
                  <p>{preferences.dashboardLayout}</p>
                </div>
              </div>
              <div className="ap-toggle-row">
                <div className="ap-toggle-text">
                  <strong>Rows per page</strong>
                  <p>{preferences.itemsPerPage} rows</p>
                </div>
              </div>
            </section>

            <section className="ap-side-card">
              <h3><Table2 size={16} style={{ display: "inline", marginRight: 7 }} />Preference Storage</h3>
              <p className="ap-note">
                Saving stores preferences in this browser's local storage.
                Connect the admin preferences API to synchronize settings
                across devices and admin accounts.
              </p>
              <p className="ap-note">
                <Clock size={13} style={{ display: "inline", marginRight: 5 }} />
                Changes are not applied globally by this page alone.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
