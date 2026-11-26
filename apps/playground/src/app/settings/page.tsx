
import { useState } from "react";
import {
  Settings,
  User,
  Palette,
  Bell,
  Shield,
  Globe,
  Save,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";
import "./settings.css";

type SettingsSection =
  | "General"
  | "Appearance"
  | "Notifications"
  | "Privacy"
  | "Account";

export default function SettingsPage() {
  const [activeSection, setActiveSection] =
    useState<SettingsSection>("General");

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem("modelnow-settings");

    return saved
      ? JSON.parse(saved)
      : {
          language: "English",
          timezone: "Asia/Kolkata",
          theme: "System",
          compactMode: false,
          emailNotifications: true,
          productUpdates: false,
          usageAlerts: true,
          chatHistory: true,
          improveModel: false,
        };
  });

  const updateSetting = (key: string, value: string | boolean) => {
    setSettings((previous: typeof settings) => ({
      ...previous,
      [key]: value,
    }));
  };

  const saveSettings = () => {
    localStorage.setItem("modelnow-settings", JSON.stringify(settings));
    alert("Settings saved successfully!");
  };

  const sections = [
    { name: "General" as const, icon: Settings },
    { name: "Appearance" as const, icon: Palette },
    { name: "Notifications" as const, icon: Bell },
    { name: "Privacy" as const, icon: Shield },
    { name: "Account" as const, icon: User },
  ];

  const Toggle = ({
    checked,
    onChange,
  }: {
    checked: boolean;
    onChange: (value: boolean) => void;
  }) => (
    <label className="st-toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span />
    </label>
  );

  return (
    <div className="st-page">
      <header className="st-header">
        <div className="st-heading">
          <div className="st-heading-icon">
            <Settings size={23} />
          </div>
          <div>
            <span className="st-eyebrow">MODELNOW WORKSPACE</span>
            <h1>Settings</h1>
            <p>Manage your preferences and account settings.</p>
          </div>
        </div>

        <button className="st-save-button" onClick={saveSettings}>
          <Save size={16} />
          Save changes
        </button>
      </header>

      <div className="st-layout">
        <aside className="st-sidebar">
          <span className="st-sidebar-title">PREFERENCES</span>

          {sections.map((section) => {
            const Icon = section.icon;

            return (
              <button
                key={section.name}
                className={`st-nav-item ${
                  activeSection === section.name ? "st-nav-active" : ""
                }`}
                onClick={() => setActiveSection(section.name)}
              >
                <Icon size={17} />
                <span>{section.name}</span>
              </button>
            );
          })}
        </aside>

        <main className="st-content">
          {activeSection === "General" && (
            <section className="st-panel">
              <div className="st-panel-heading">
                <div>
                  <h2>General settings</h2>
                  <p>Configure your basic workspace preferences.</p>
                </div>
                <Globe size={21} />
              </div>

              <div className="st-setting-row">
                <div>
                  <strong>Language</strong>
                  <p>Choose your preferred display language.</p>
                </div>
                <select
                  value={settings.language}
                  onChange={(e) =>
                    updateSetting("language", e.target.value)
                  }
                >
                  <option>English</option>
                  <option>Telugu</option>
                  <option>Hindi</option>
                </select>
              </div>

              <div className="st-setting-row">
                <div>
                  <strong>Time zone</strong>
                  <p>Set the time zone used in your workspace.</p>
                </div>
                <select
                  value={settings.timezone}
                  onChange={(e) =>
                    updateSetting("timezone", e.target.value)
                  }
                >
                  <option value="Asia/Kolkata">India Standard Time</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">Eastern Time</option>
                  <option value="Europe/London">London</option>
                </select>
              </div>

              <div className="st-setting-row">
                <div>
                  <strong>Compact mode</strong>
                  <p>Use a more compact workspace layout.</p>
                </div>
                <Toggle
                  checked={settings.compactMode}
                  onChange={(value) => updateSetting("compactMode", value)}
                />
              </div>
            </section>
          )}

          {activeSection === "Appearance" && (
            <section className="st-panel">
              <div className="st-panel-heading">
                <div>
                  <h2>Appearance</h2>
                  <p>Personalize how ModelNow looks on your device.</p>
                </div>
                <Palette size={21} />
              </div>

              <div className="st-theme-options">
                {[
                  { name: "Light", icon: Sun },
                  { name: "Dark", icon: Moon },
                  { name: "System", icon: Monitor },
                ].map((theme) => {
                  const Icon = theme.icon;

                  return (
                    <button
                      key={theme.name}
                      className={`st-theme-card ${
                        settings.theme === theme.name ? "st-theme-active" : ""
                      }`}
                      onClick={() => updateSetting("theme", theme.name)}
                    >
                      <Icon size={22} />
                      <strong>{theme.name}</strong>
                      {settings.theme === theme.name && (
                        <span className="st-theme-check">Selected</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="st-note">
                Theme preference is saved locally. Full application-wide theme
                switching can be connected separately.
              </div>
            </section>
          )}

          {activeSection === "Notifications" && (
            <section className="st-panel">
              <div className="st-panel-heading">
                <div>
                  <h2>Notifications</h2>
                  <p>Choose which updates you want to receive.</p>
                </div>
                <Bell size={21} />
              </div>

              <div className="st-setting-row">
                <div>
                  <strong>Email notifications</strong>
                  <p>Receive important updates by email.</p>
                </div>
                <Toggle
                  checked={settings.emailNotifications}
                  onChange={(value) =>
                    updateSetting("emailNotifications", value)
                  }
                />
              </div>

              <div className="st-setting-row">
                <div>
                  <strong>Product updates</strong>
                  <p>Get updates about new ModelNow features.</p>
                </div>
                <Toggle
                  checked={settings.productUpdates}
                  onChange={(value) =>
                    updateSetting("productUpdates", value)
                  }
                />
              </div>

              <div className="st-setting-row">
                <div>
                  <strong>Usage alerts</strong>
                  <p>Receive notifications about usage and limits.</p>
                </div>
                <Toggle
                  checked={settings.usageAlerts}
                  onChange={(value) => updateSetting("usageAlerts", value)}
                />
              </div>
            </section>
          )}

          {activeSection === "Privacy" && (
            <section className="st-panel">
              <div className="st-panel-heading">
                <div>
                  <h2>Privacy and data</h2>
                  <p>Control how your workspace data is handled.</p>
                </div>
                <Shield size={21} />
              </div>

              <div className="st-setting-row">
                <div>
                  <strong>Chat history</strong>
                  <p>Allow conversations to be saved in your history.</p>
                </div>
                <Toggle
                  checked={settings.chatHistory}
                  onChange={(value) => updateSetting("chatHistory", value)}
                />
              </div>

              <div className="st-setting-row">
                <div>
                  <strong>Help improve ModelNow</strong>
                  <p>
                    Allow eligible usage data to be used for product
                    improvement, subject to applicable policies.
                  </p>
                </div>
                <Toggle
                  checked={settings.improveModel}
                  onChange={(value) => updateSetting("improveModel", value)}
                />
              </div>

              <div className="st-note">
                These are local preference controls in this frontend. Actual
                data retention and privacy enforcement require backend support.
              </div>
            </section>
          )}

          {activeSection === "Account" && (
            <section className="st-panel">
              <div className="st-panel-heading">
                <div>
                  <h2>Account information</h2>
                  <p>View your ModelNow account details.</p>
                </div>
                <User size={21} />
              </div>

              <div className="st-profile">
                <div className="st-profile-avatar">PU</div>
                <div>
                  <strong>pujitha</strong>
                  <p>ModelNow workspace account</p>
                </div>
              </div>

              <div className="st-setting-row">
                <div>
                  <strong>Email address</strong>
                  <p>Registered account email.</p>
                </div>
                <span className="st-account-value">
                  pujithamarikanti@gmail.com
                </span>
              </div>

              <div className="st-setting-row">
                <div>
                  <strong>Workspace</strong>
                  <p>Your current workspace.</p>
                </div>
                <span className="st-account-value">ModelNow</span>
              </div>

              <div className="st-note">
                Account editing, password management, and subscription
                management can be connected to the backend.
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
