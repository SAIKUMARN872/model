
"use client";

import { useState } from "react";
import {
  Settings,
  Globe,
  Building2,
  Languages,
  Clock,
  Save,
  RotateCcw,
  CheckCircle2,
} from "lucide-react";

type GeneralSettings = {
  platformName: string;
  platformUrl: string;
  supportEmail: string;
  companyName: string;
  defaultLanguage: string;
  timezone: string;
  dateFormat: string;
  maintenanceMode: boolean;
  allowRegistration: boolean;
};

const initialSettings: GeneralSettings = {
  platformName: "ModelNow",
  platformUrl: "https://modelnow.ai",
  supportEmail: "support@modelnow.ai",
  companyName: "ModelNow",
  defaultLanguage: "English",
  timezone: "Asia/Kolkata",
  dateFormat: "DD/MM/YYYY",
  maintenanceMode: false,
  allowRegistration: true,
};

export default function GeneralSettingsPage() {
  const [settings, setSettings] =
    useState<GeneralSettings>(initialSettings);
  const [saved, setSaved] = useState(false);

  function update<K extends keyof GeneralSettings>(
    key: K,
    value: GeneralSettings[K],
  ) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function saveSettings() {
    try {
      localStorage.setItem(
        "modelnow-admin-general-settings",
        JSON.stringify(settings),
      );
      setSaved(true);
    } catch {
      setSaved(false);
    }
  }

  function resetSettings() {
    setSettings(initialSettings);
    setSaved(false);
  }

  return (
    <main className="general-page">
      <style>{`
        * { box-sizing: border-box; }

        .general-page {
          min-height: 100vh;
          padding: 30px;
          background: #f7f8fc;
          color: #172033;
          font-family: Arial, Helvetica, sans-serif;
        }

        .general-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .general-breadcrumb {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 22px;
          color: #7b8498;
          font-size: 13px;
        }

        .general-breadcrumb a {
          color: #5268d9;
          text-decoration: none;
        }

        .general-heading {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          margin-bottom: 28px;
        }

        .general-title {
          display: flex;
          align-items: center;
          gap: 13px;
        }

        .general-title-icon {
          display: grid;
          place-items: center;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: #e9edff;
          color: #4c61d7;
        }

        .general-title h1 {
          margin: 0 0 7px;
          font-size: 28px;
          letter-spacing: -0.7px;
        }

        .general-title p {
          margin: 0;
          color: #737d91;
          font-size: 14px;
          line-height: 1.6;
        }

        .general-actions {
          display: flex;
          gap: 10px;
        }

        .general-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 40px;
          padding: 0 15px;
          border: 1px solid #dfe3ec;
          border-radius: 9px;
          background: white;
          color: #39445b;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }

        .general-button.primary {
          background: #4e60d9;
          color: white;
          border-color: #4e60d9;
        }

        .general-button:hover { opacity: 0.9; }

        .general-alert {
          display: flex;
          align-items: center;
          gap: 9px;
          margin-bottom: 20px;
          padding: 13px 15px;
          border: 1px solid #b9e8cf;
          border-radius: 10px;
          background: #effbf4;
          color: #187447;
          font-size: 13px;
        }

        .general-layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 285px;
          gap: 22px;
          align-items: start;
        }

        .general-main {
          display: flex;
          flex-direction: column;
          gap: 20px;
          min-width: 0;
        }

        .general-card {
          overflow: hidden;
          border: 1px solid #e7eaf1;
          border-radius: 14px;
          background: white;
          box-shadow: 0 2px 7px rgba(24, 36, 70, 0.025);
        }

        .general-card-header {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 22px;
          border-bottom: 1px solid #edf0f5;
        }

        .general-card-header > span {
          display: grid;
          place-items: center;
          width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #f0f2ff;
          color: #5265d9;
        }

        .general-card-header h2 {
          margin: 0 0 5px;
          font-size: 15px;
          font-weight: 700;
        }

        .general-card-header p {
          margin: 0;
          color: #838b9d;
          font-size: 12px;
          line-height: 1.5;
        }

        .general-fields {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
          padding: 22px;
        }

        .general-field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }

        .general-field.full { grid-column: 1 / -1; }

        .general-field label {
          color: #384359;
          font-size: 12px;
          font-weight: 700;
        }

        .general-field input,
        .general-field select {
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

        .general-field input:focus,
        .general-field select:focus {
          border-color: #6576e7;
          box-shadow: 0 0 0 3px rgba(101, 118, 231, 0.11);
        }

        .general-field small {
          color: #9299a9;
          font-size: 11px;
          line-height: 1.5;
        }

        .general-side {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .general-side-card {
          padding: 20px;
          border: 1px solid #e7eaf1;
          border-radius: 14px;
          background: white;
        }

        .general-side-card h3 {
          margin: 0 0 16px;
          font-size: 14px;
        }

        .general-toggle-row {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          padding: 15px 0;
          border-top: 1px solid #edf0f5;
        }

        .general-toggle-row:first-of-type {
          padding-top: 0;
          border-top: 0;
        }

        .general-toggle-row strong {
          display: block;
          margin-bottom: 5px;
          font-size: 12px;
        }

        .general-toggle-row p {
          margin: 0;
          color: #858da0;
          font-size: 11px;
          line-height: 1.5;
        }

        .general-switch {
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

        .general-switch.active { background: #5367df; }

        .general-switch::after {
          content: "";
          position: absolute;
          top: 3px;
          left: 3px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          transition: transform 0.15s ease;
        }

        .general-switch.active::after { transform: translateX(16px); }

        .general-status {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #218052;
          font-size: 12px;
        }

        .general-status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #29b36f;
        }

        .general-side-note {
          margin-top: 14px;
          color: #818a9d;
          font-size: 12px;
          line-height: 1.7;
        }

        @media (max-width: 950px) {
          .general-layout { grid-template-columns: 1fr; }
          .general-side {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 650px) {
          .general-page { padding: 18px 14px; }
          .general-heading { flex-direction: column; }
          .general-title h1 { font-size: 23px; }
          .general-actions { width: 100%; }
          .general-button { flex: 1; }
          .general-fields { grid-template-columns: 1fr; padding: 17px; }
          .general-field.full { grid-column: auto; }
          .general-side { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="general-container">
        <div className="general-breadcrumb">
          <a href="/dashboard">Admin</a>
          <span>/</span>
          <a href="/settings">Settings</a>
          <span>/</span>
          <span>General Settings</span>
        </div>

        <header className="general-heading">
          <div className="general-title">
            <div className="general-title-icon">
              <Settings size={24} />
            </div>
            <div>
              <h1>General Settings</h1>
              <p>
                Manage your platform identity, regional preferences, and
                default application behavior.
              </p>
            </div>
          </div>

          <div className="general-actions">
            <button
              className="general-button"
              type="button"
              onClick={resetSettings}
            >
              <RotateCcw size={15} />
              Reset
            </button>
            <button
              className="general-button primary"
              type="button"
              onClick={saveSettings}
            >
              <Save size={15} />
              Save Changes
            </button>
          </div>
        </header>

        {saved && (
          <div className="general-alert" role="status">
            <CheckCircle2 size={18} />
            Settings saved in this browser.
          </div>
        )}

        <div className="general-layout">
          <div className="general-main">
            <section className="general-card">
              <div className="general-card-header">
                <span><Building2 size={19} /></span>
                <div>
                  <h2>Platform Identity</h2>
                  <p>Configure your platform name and contact information.</p>
                </div>
              </div>

              <div className="general-fields">
                <div className="general-field">
                  <label htmlFor="platformName">Platform Name</label>
                  <input
                    id="platformName"
                    value={settings.platformName}
                    onChange={(e) => update("platformName", e.target.value)}
                    placeholder="ModelNow"
                  />
                  <small>Name displayed throughout the admin platform.</small>
                </div>

                <div className="general-field">
                  <label htmlFor="companyName">Company Name</label>
                  <input
                    id="companyName"
                    value={settings.companyName}
                    onChange={(e) => update("companyName", e.target.value)}
                    placeholder="Company name"
                  />
                </div>

                <div className="general-field full">
                  <label htmlFor="platformUrl">Platform URL</label>
                  <input
                    id="platformUrl"
                    type="url"
                    value={settings.platformUrl}
                    onChange={(e) => update("platformUrl", e.target.value)}
                    placeholder="https://example.com"
                  />
                </div>

                <div className="general-field full">
                  <label htmlFor="supportEmail">Support Email</label>
                  <input
                    id="supportEmail"
                    type="email"
                    value={settings.supportEmail}
                    onChange={(e) => update("supportEmail", e.target.value)}
                    placeholder="support@example.com"
                  />
                  <small>Used as the default platform support contact.</small>
                </div>
              </div>
            </section>

            <section className="general-card">
              <div className="general-card-header">
                <span><Globe size={19} /></span>
                <div>
                  <h2>Regional Preferences</h2>
                  <p>Set the default language, timezone, and date format.</p>
                </div>
              </div>

              <div className="general-fields">
                <div className="general-field">
                  <label htmlFor="defaultLanguage">Default Language</label>
                  <select
                    id="defaultLanguage"
                    value={settings.defaultLanguage}
                    onChange={(e) =>
                      update("defaultLanguage", e.target.value)
                    }
                  >
                    <option>English</option>
                    <option>Telugu</option>
                    <option>Hindi</option>
                    <option>Spanish</option>
                    <option>French</option>
                    <option>Japanese</option>
                  </select>
                </div>

                <div className="general-field">
                  <label htmlFor="timezone">Default Timezone</label>
                  <select
                    id="timezone"
                    value={settings.timezone}
                    onChange={(e) => update("timezone", e.target.value)}
                  >
                    <option value="Asia/Kolkata">India Standard Time (IST)</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT/BST)</option>
                    <option value="Asia/Singapore">Singapore (SGT)</option>
                  </select>
                </div>

                <div className="general-field">
                  <label htmlFor="dateFormat">Date Format</label>
                  <select
                    id="dateFormat"
                    value={settings.dateFormat}
                    onChange={(e) => update("dateFormat", e.target.value)}
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div className="general-field">
                  <label>Current Configuration</label>
                  <div className="general-status">
                    <span className="general-status-dot" />
                    Configuration ready
                  </div>
                  <small>
                    <Clock size={12} style={{ display: "inline", marginRight: 5 }} />
                    Timezone: {settings.timezone}
                  </small>
                </div>
              </div>
            </section>
          </div>

          <aside className="general-side">
            <section className="general-side-card">
              <h3>Platform Behavior</h3>

              <div className="general-toggle-row">
                <div>
                  <strong>Maintenance Mode</strong>
                  <p>Restrict normal access during planned maintenance.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.maintenanceMode}
                  aria-label="Maintenance Mode"
                  className={`general-switch ${
                    settings.maintenanceMode ? "active" : ""
                  }`}
                  onClick={() =>
                    update("maintenanceMode", !settings.maintenanceMode)
                  }
                />
              </div>

              <div className="general-toggle-row">
                <div>
                  <strong>Allow Registration</strong>
                  <p>Allow new users to register for the platform.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.allowRegistration}
                  aria-label="Allow Registration"
                  className={`general-switch ${
                    settings.allowRegistration ? "active" : ""
                  }`}
                  onClick={() =>
                    update("allowRegistration", !settings.allowRegistration)
                  }
                />
              </div>
            </section>

            <section className="general-side-card">
              <h3>Configuration Status</h3>
              <div className="general-status">
                <span className="general-status-dot" />
                Local settings available
              </div>
              <p className="general-side-note">
                Changes are stored in this browser when you select Save
                Changes. Connect this page to the admin settings API to
                persist configuration across users and devices.
              </p>
            </section>

            <section className="general-side-card">
              <h3>Quick Information</h3>
              <div className="general-toggle-row">
                <div>
                  <strong>Settings Module</strong>
                  <p>General configuration</p>
                </div>
              </div>
              <div className="general-toggle-row">
                <div>
                  <strong>Storage</strong>
                  <p>Browser local storage</p>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
