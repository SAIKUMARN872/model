
"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import Link from "next/link";
import {
  Activity,
  Bell,
  Check,
  Clock,
  Database,
  Download,
  Globe,
  Mail,
  RotateCcw,
  Save,
  Settings2,
  ShieldCheck,
  SlidersHorizontal,
} from "lucide-react";

type Settings = {
  timezone: string;
  currency: string;
  defaultPeriod: string;
  refreshInterval: string;
  retentionDays: string;
  requestThreshold: string;
  costThreshold: string;
  tokenThreshold: string;
  emailReports: boolean;
  thresholdAlerts: boolean;
  weeklySummary: boolean;
  includeFailedRequests: boolean;
  comparePreviousPeriod: boolean;
  anonymizeUsers: boolean;
};

const defaultSettings: Settings = {
  timezone: "Asia/Kolkata",
  currency: "USD",
  defaultPeriod: "30",
  refreshInterval: "60",
  retentionDays: "90",
  requestThreshold: "100000",
  costThreshold: "1000",
  tokenThreshold: "10000000",
  emailReports: true,
  thresholdAlerts: true,
  weeklySummary: false,
  includeFailedRequests: true,
  comparePreviousPeriod: true,
  anonymizeUsers: false,
};

const panel: CSSProperties = {
  border: "1px solid var(--border, #e5e7eb)",
  borderRadius: 14,
  background: "var(--panel, #fff)",
  padding: 22,
  minWidth: 0,
};

const muted: CSSProperties = {
  color: "var(--muted-foreground, #6b7280)",
  fontSize: 12,
};

const input: CSSProperties = {
  width: "100%",
  height: 41,
  border: "1px solid var(--border, #d1d5db)",
  borderRadius: 9,
  padding: "0 12px",
  background: "var(--panel, #fff)",
  color: "var(--foreground, #111827)",
  fontSize: 13,
  outline: "none",
};

const button: CSSProperties = {
  height: 40,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  padding: "0 15px",
  borderRadius: 9,
  border: "1px solid var(--border, #d1d5db)",
  background: "var(--panel, #fff)",
  color: "var(--foreground, #111827)",
  cursor: "pointer",
  fontSize: 13,
  fontWeight: 600,
};

const primaryButton: CSSProperties = {
  ...button,
  color: "#fff",
  background: "#4f46e5",
  borderColor: "#4f46e5",
};

function SettingToggle({
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
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        padding: "16px 0",
        borderBottom: "1px solid var(--border, #f0f0f0)",
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 650 }}>{title}</div>
        <p style={{ ...muted, margin: "5px 0 0", lineHeight: 1.6 }}>
          {description}
        </p>
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
          border: "none",
          borderRadius: 20,
          background: checked ? "#4f46e5" : "#cbd5e1",
          cursor: "pointer",
          flexShrink: 0,
          display: "flex",
          justifyContent: checked ? "flex-end" : "flex-start",
          alignItems: "center",
        }}
      >
        <span
          style={{
            width: 19,
            height: 19,
            borderRadius: "50%",
            background: "#fff",
            boxShadow: "0 1px 3px #0002",
          }}
        />
      </button>
    </div>
  );
}

export default function AnalyticsSettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [notice, setNotice] = useState("");
  const [lastSaved, setLastSaved] = useState("Not saved in this session");

  const updateSetting = <K extends keyof Settings>(
    key: K,
    value: Settings[K]
  ) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setNotice("");
  };

  const saveSettings = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLastSaved(new Date().toLocaleString());
    setNotice(
      "Settings validated for this session. Connect the settings API to persist them permanently."
    );
  };

  const resetSettings = () => {
    setSettings(defaultSettings);
    setNotice("Settings have been reset to their default values.");
  };

  const exportSettings = () => {
    const blob = new Blob([JSON.stringify(settings, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "modelnow-analytics-settings.json";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
    setNotice("Analytics settings exported as JSON.");
  };

  const field = (
    label: string,
    description: string,
    control: React.ReactNode
  ) => (
    <div style={{ display: "grid", gap: 7 }}>
      <label style={{ fontSize: 13, fontWeight: 650 }}>{label}</label>
      {control}
      <p style={{ ...muted, margin: 0, lineHeight: 1.6 }}>{description}</p>
    </div>
  );

  return (
    <main
      style={{
        maxWidth: 1450,
        margin: "0 auto",
        padding: "28px clamp(16px, 3vw, 32px)",
        color: "var(--foreground, #111827)",
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 18,
          flexWrap: "wrap",
          marginBottom: 25,
        }}
      >
        <div>
          <div style={{ ...muted, marginBottom: 8 }}>
            <Link
              href="/usage"
              style={{ color: "inherit", textDecoration: "none" }}
            >
              Usage &amp; Analytics
            </Link>{" "}
            / Analytics Settings
          </div>
          <h1
            style={{
              fontSize: "clamp(26px, 3vw, 33px)",
              fontWeight: 750,
              letterSpacing: "-0.8px",
              margin: "0 0 8px",
            }}
          >
            Analytics Settings
          </h1>
          <p style={{ ...muted, fontSize: 14, margin: 0 }}>
            Configure reporting defaults, notifications, data retention, and usage thresholds.
          </p>
        </div>

        <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
          <button style={button} onClick={exportSettings} type="button">
            <Download size={15} />
            Export settings
          </button>
          <button style={button} onClick={resetSettings} type="button">
            <RotateCcw size={15} />
            Reset
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
            padding: "13px 15px",
            borderRadius: 10,
            border: "1px solid #a7f3d0",
            background: "#ecfdf5",
            color: "#065f46",
            fontSize: 13,
            marginBottom: 20,
          }}
        >
          <Check size={17} style={{ flexShrink: 0 }} />
          <span>{notice}</span>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 14,
          marginBottom: 22,
        }}
      >
        {[
          {
            label: "Reporting timezone",
            value: settings.timezone,
            icon: Globe,
            color: "#6366f1",
          },
          {
            label: "Default time range",
            value: `${settings.defaultPeriod} days`,
            icon: Clock,
            color: "#0284c7",
          },
          {
            label: "Data retention",
            value: `${settings.retentionDays} days`,
            icon: Database,
            color: "#059669",
          },
          {
            label: "Alert notifications",
            value: settings.thresholdAlerts ? "Enabled" : "Disabled",
            icon: Bell,
            color: "#d97706",
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} style={panel}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 15,
                }}
              >
                <span style={muted}>{item.label}</span>
                <Icon size={19} color={item.color} />
              </div>
              <div style={{ fontSize: 19, fontWeight: 750, overflowWrap: "anywhere" }}>
                {item.value}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={saveSettings}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 440px), 1fr))",
            gap: 20,
          }}
        >
          <section style={panel}>
            <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  background: "#eef2ff",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <SlidersHorizontal size={20} color="#4f46e5" />
              </div>
              <div>
                <h2 style={{ margin: "0 0 5px", fontSize: 16, fontWeight: 750 }}>
                  General preferences
                </h2>
                <p style={{ ...muted, margin: 0 }}>
                  Set the default behavior for analytics dashboards.
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gap: 20 }}>
              {field(
                "Reporting timezone",
                "Used to display dates and reporting periods.",
                <select
                  value={settings.timezone}
                  onChange={(event) =>
                    updateSetting("timezone", event.target.value)
                  }
                  style={input}
                >
                  <option value="Asia/Kolkata">India Standard Time (Asia/Kolkata)</option>
                  <option value="UTC">Coordinated Universal Time (UTC)</option>
                  <option value="America/New_York">Eastern Time (New York)</option>
                  <option value="America/Los_Angeles">Pacific Time (Los Angeles)</option>
                  <option value="Europe/London">United Kingdom (London)</option>
                  <option value="Asia/Singapore">Singapore (Singapore)</option>
                </select>
              )}

              {field(
                "Display currency",
                "Currency preference for cost and revenue views.",
                <select
                  value={settings.currency}
                  onChange={(event) =>
                    updateSetting("currency", event.target.value)
                  }
                  style={input}
                >
                  <option value="USD">USD — US Dollar</option>
                  <option value="INR">INR — Indian Rupee</option>
                  <option value="EUR">EUR — Euro</option>
                  <option value="GBP">GBP — British Pound</option>
                  <option value="SGD">SGD — Singapore Dollar</option>
                </select>
              )}

              {field(
                "Default reporting period",
                "Initial date range when opening analytics pages.",
                <select
                  value={settings.defaultPeriod}
                  onChange={(event) =>
                    updateSetting("defaultPeriod", event.target.value)
                  }
                  style={input}
                >
                  <option value="1">Last 24 hours</option>
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last 12 months</option>
                </select>
              )}

              {field(
                "Dashboard refresh interval",
                "Preferred refresh interval for live dashboard views.",
                <select
                  value={settings.refreshInterval}
                  onChange={(event) =>
                    updateSetting("refreshInterval", event.target.value)
                  }
                  style={input}
                >
                  <option value="0">Manual refresh only</option>
                  <option value="30">Every 30 seconds</option>
                  <option value="60">Every minute</option>
                  <option value="300">Every 5 minutes</option>
                  <option value="900">Every 15 minutes</option>
                </select>
              )}
            </div>
          </section>

          <section style={panel}>
            <div style={{ display: "flex", gap: 12, marginBottom: 10 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  background: "#ecfdf5",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <Bell size={20} color="#059669" />
              </div>
              <div>
                <h2 style={{ margin: "0 0 5px", fontSize: 16, fontWeight: 750 }}>
                  Notifications
                </h2>
                <p style={{ ...muted, margin: 0 }}>
                  Choose which analytics notifications to enable.
                </p>
              </div>
            </div>

            <SettingToggle
              title="Email report notifications"
              description="Notify administrators when reports are ready."
              checked={settings.emailReports}
              onChange={(value) => updateSetting("emailReports", value)}
            />
            <SettingToggle
              title="Threshold alerts"
              description="Enable alerts when usage exceeds configured limits."
              checked={settings.thresholdAlerts}
              onChange={(value) => updateSetting("thresholdAlerts", value)}
            />
            <SettingToggle
              title="Weekly analytics summary"
              description="Prepare a weekly summary for configured recipients."
              checked={settings.weeklySummary}
              onChange={(value) => updateSetting("weeklySummary", value)}
            />
            <SettingToggle
              title="Compare previous period"
              description="Show period-over-period comparisons by default."
              checked={settings.comparePreviousPeriod}
              onChange={(value) =>
                updateSetting("comparePreviousPeriod", value)
              }
            />
          </section>

          <section style={panel}>
            <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  background: "#fff7ed",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <Activity size={20} color="#c2410c" />
              </div>
              <div>
                <h2 style={{ margin: "0 0 5px", fontSize: 16, fontWeight: 750 }}>
                  Usage alert thresholds
                </h2>
                <p style={{ ...muted, margin: 0 }}>
                  Configure the limits used by the analytics interface.
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gap: 19 }}>
              {field(
                "Request threshold",
                "Requests in the selected reporting period.",
                <input
                  type="number"
                  min="1"
                  required
                  value={settings.requestThreshold}
                  onChange={(event) =>
                    updateSetting("requestThreshold", event.target.value)
                  }
                  style={input}
                />
              )}

              {field(
                "AI cost threshold (selected currency)",
                "Alert threshold for estimated AI spending.",
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={settings.costThreshold}
                  onChange={(event) =>
                    updateSetting("costThreshold", event.target.value)
                  }
                  style={input}
                />
              )}

              {field(
                "Token threshold",
                "Token volume limit for the selected reporting period.",
                <input
                  type="number"
                  min="1"
                  required
                  value={settings.tokenThreshold}
                  onChange={(event) =>
                    updateSetting("tokenThreshold", event.target.value)
                  }
                  style={input}
                />
              )}
            </div>
          </section>

          <section style={panel}>
            <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 11,
                  background: "#eff6ff",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={20} color="#2563eb" />
              </div>
              <div>
                <h2 style={{ margin: "0 0 5px", fontSize: 16, fontWeight: 750 }}>
                  Data and privacy
                </h2>
                <p style={{ ...muted, margin: 0 }}>
                  Set preferences for reporting data and retention.
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gap: 20 }}>
              {field(
                "Analytics data retention",
                "Preferred retention period in days. Backend enforcement is required.",
                <select
                  value={settings.retentionDays}
                  onChange={(event) =>
                    updateSetting("retentionDays", event.target.value)
                  }
                  style={input}
                >
                  <option value="30">30 days</option>
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">365 days</option>
                </select>
              )}

              <SettingToggle
                title="Include failed requests"
                description="Include failed and rejected requests in usage reports."
                checked={settings.includeFailedRequests}
                onChange={(value) =>
                  updateSetting("includeFailedRequests", value)
                }
              />

              <SettingToggle
                title="Anonymize user identifiers"
                description="Prefer anonymized user identifiers in analytics views and exports."
                checked={settings.anonymizeUsers}
                onChange={(value) => updateSetting("anonymizeUsers", value)}
              />

              <div
                style={{
                  padding: 14,
                  borderRadius: 10,
                  border: "1px solid var(--border, #e5e7eb)",
                  background: "var(--muted, #f9fafb)",
                  display: "flex",
                  gap: 10,
                }}
              >
                <Database
                  size={17}
                  color="#64748b"
                  style={{ flexShrink: 0 }}
                />
                <p style={{ ...muted, margin: 0, lineHeight: 1.7 }}>
                  These settings currently update local page state only. Data
                  retention, anonymization, alerts, and refresh scheduling need
                  backend services before they take effect across the platform.
                </p>
              </div>
            </div>
          </section>
        </div>

        <div
          style={{
            ...panel,
            marginTop: 20,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 15,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div style={{ fontSize: 13, fontWeight: 650 }}>Analytics configuration</div>
            <p style={{ ...muted, margin: "5px 0 0" }}>
              Last saved: {lastSaved}
            </p>
          </div>
          <div style={{ display: "flex", gap: 9, flexWrap: "wrap" }}>
            <button type="button" style={button} onClick={resetSettings}>
              <RotateCcw size={15} />
              Restore defaults
            </button>
            <button type="submit" style={primaryButton}>
              <Save size={15} />
              Save settings
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
