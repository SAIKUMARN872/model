// ModelNow Admin Users page
"use client";

import { useMemo, useState, type ReactNode } from "react";
import {
  Settings2,
  Search,
  Save,
  RefreshCw,
  ShieldCheck,
  Bell,
  LockKeyhole,
  Globe,
  Mail,
  Smartphone,
  Clock3,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  SlidersHorizontal,
} from "lucide-react";

type UserSetting = {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
  scope: string;
};

const initialSettings: UserSetting[] = [
  {
    id: "US-001",
    name: "Email notifications",
    description: "Send account and important platform updates by email.",
    category: "Notifications",
    enabled: true,
    scope: "All users",
  },
  {
    id: "US-002",
    name: "Security alerts",
    description: "Notify users about suspicious logins and security changes.",
    category: "Security",
    enabled: true,
    scope: "All users",
  },
  {
    id: "US-003",
    name: "Multi-factor authentication",
    description: "Require an additional verification step when signing in.",
    category: "Security",
    enabled: false,
    scope: "All users",
  },
  {
    id: "US-004",
    name: "Session timeout",
    description: "Automatically expire inactive user sessions.",
    category: "Security",
    enabled: true,
    scope: "All users",
  },
  {
    id: "US-005",
    name: "Product announcements",
    description: "Allow users to receive product updates and announcements.",
    category: "Notifications",
    enabled: true,
    scope: "All users",
  },
  {
    id: "US-006",
    name: "Login activity emails",
    description: "Send an email after a successful account login.",
    category: "Notifications",
    enabled: false,
    scope: "All users",
  },
  {
    id: "US-007",
    name: "Profile visibility",
    description: "Allow profile details to be visible to organization members.",
    category: "Privacy",
    enabled: true,
    scope: "Organization",
  },
  {
    id: "US-008",
    name: "Usage analytics",
    description: "Allow anonymous product usage analytics for improvements.",
    category: "Privacy",
    enabled: true,
    scope: "All users",
  },
  {
    id: "US-009",
    name: "Mobile notifications",
    description: "Enable push notifications on supported mobile devices.",
    category: "Notifications",
    enabled: true,
    scope: "All users",
  },
  {
    id: "US-010",
    name: "API access",
    description: "Allow eligible users to create and use API keys.",
    category: "Access",
    enabled: true,
    scope: "Eligible users",
  },
  {
    id: "US-011",
    name: "New device verification",
    description: "Verify users when they sign in from an unrecognized device.",
    category: "Security",
    enabled: true,
    scope: "All users",
  },
  {
    id: "US-012",
    name: "Weekly activity summary",
    description: "Send a weekly summary of account activity and usage.",
    category: "Notifications",
    enabled: false,
    scope: "All users",
  },
];

const categories = [
  "All categories",
  "Security",
  "Notifications",
  "Privacy",
  "Access",
];

const categoryIcons: Record<string, ReactNode> = {
  Security: <ShieldCheck size={18} />,
  Notifications: <Bell size={18} />,
  Privacy: <LockKeyhole size={18} />,
  Access: <Settings2 size={18} />,
};

export default function UserSettingsPage() {
  const [settings, setSettings] = useState(initialSettings);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All categories");
  const [statusFilter, setStatusFilter] = useState("All");
  const [scopeFilter, setScopeFilter] = useState("All scopes");
  const [activeTab, setActiveTab] = useState("All settings");
  const [saved, setSaved] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const filteredSettings = useMemo(() => {
    return settings.filter((setting) => {
      const matchesSearch =
        setting.name.toLowerCase().includes(search.toLowerCase()) ||
        setting.description.toLowerCase().includes(search.toLowerCase()) ||
        setting.id.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All categories" || setting.category === category;

      const matchesStatus =
        statusFilter === "All" ||
        (statusFilter === "Enabled" && setting.enabled) ||
        (statusFilter === "Disabled" && !setting.enabled);

      const matchesScope =
        scopeFilter === "All scopes" || setting.scope === scopeFilter;

      const matchesTab =
        activeTab === "All settings" ||
        (activeTab === "Enabled" && setting.enabled) ||
        (activeTab === "Disabled" && !setting.enabled);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesStatus &&
        matchesScope &&
        matchesTab
      );
    });
  }, [settings, search, category, statusFilter, scopeFilter, activeTab]);

  const enabledCount = settings.filter((setting) => setting.enabled).length;
  const disabledCount = settings.length - enabledCount;
  const securityCount = settings.filter(
    (setting) => setting.category === "Security" && setting.enabled
  ).length;
  const notificationCount = settings.filter(
    (setting) => setting.category === "Notifications" && setting.enabled
  ).length;

  function toggleSetting(id: string) {
    setSettings((current) =>
      current.map((setting) =>
        setting.id === id
          ? { ...setting, enabled: !setting.enabled }
          : setting
      )
    );
    setSaved(false);
  }

  function saveSettings() {
    setSaved(true);
  }

  function resetSettings() {
    setSettings(initialSettings);
    setSearch("");
    setCategory("All categories");
    setStatusFilter("All");
    setScopeFilter("All scopes");
    setActiveTab("All settings");
    setSaved(false);
    setShowResetConfirm(false);
  }

  return (
    <main className="user-settings-page">
      <style jsx>{`
        .user-settings-page {
          min-height: 100vh;
          padding: 30px;
          background: #f7f8fc;
          color: #172033;
          font-family: Arial, Helvetica, sans-serif;
        }

        * {
          box-sizing: border-box;
        }

        .page-shell {
          max-width: 1500px;
          margin: 0 auto;
        }

        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #8790a3;
          font-size: 12px;
          margin-bottom: 20px;
        }

        .breadcrumb strong {
          color: #475467;
          font-weight: 600;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 25px;
        }

        .heading {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .heading-icon {
          display: grid;
          place-items: center;
          width: 48px;
          height: 48px;
          border-radius: 14px;
          background: #e9efff;
          color: #315fea;
          flex-shrink: 0;
        }

        h1 {
          margin: 0 0 8px;
          font-size: 27px;
          letter-spacing: -0.8px;
          font-weight: 750;
        }

        .subtitle {
          margin: 0;
          color: #7b8497;
          font-size: 13px;
          line-height: 1.6;
        }

        .header-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        button,
        input,
        select {
          font: inherit;
        }

        button {
          cursor: pointer;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 9px;
          font-size: 12px;
          font-weight: 650;
          border: 1px solid #e0e5ee;
          background: #fff;
          color: #445066;
          transition: 0.18s ease;
        }

        .btn:hover {
          background: #f6f8fc;
        }

        .btn-primary {
          background: #315fea;
          color: #fff;
          border-color: #315fea;
        }

        .btn-primary:hover {
          background: #254fd0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 23px;
        }

        .stat-card {
          background: #fff;
          border: 1px solid #e8ebf2;
          border-radius: 13px;
          padding: 20px;
          min-width: 0;
        }

        .stat-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          margin-bottom: 17px;
        }

        .stat-label {
          color: #7b8497;
          font-size: 12px;
          font-weight: 600;
        }

        .stat-icon {
          width: 35px;
          height: 35px;
          border-radius: 10px;
          display: grid;
          place-items: center;
          color: #315fea;
          background: #edf2ff;
        }

        .stat-number {
          font-size: 27px;
          line-height: 1.2;
          font-weight: 750;
          letter-spacing: -0.7px;
        }

        .stat-note {
          color: #929bad;
          font-size: 11px;
          margin-top: 8px;
        }

        .content-card {
          background: #fff;
          border: 1px solid #e7eaf1;
          border-radius: 14px;
          overflow: hidden;
        }

        .card-heading {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 21px 22px;
          border-bottom: 1px solid #edf0f5;
          flex-wrap: wrap;
        }

        .card-title {
          margin: 0 0 5px;
          font-size: 15px;
          font-weight: 750;
        }

        .card-description {
          color: #8790a3;
          font-size: 12px;
          margin: 0;
          line-height: 1.5;
        }

        .tabs {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 0 22px;
          border-bottom: 1px solid #edf0f5;
          overflow-x: auto;
        }

        .tab {
          padding: 14px 13px;
          border: none;
          background: transparent;
          color: #818a9d;
          font-size: 12px;
          font-weight: 650;
          white-space: nowrap;
          border-bottom: 2px solid transparent;
        }

        .tab.active {
          color: #315fea;
          border-bottom-color: #315fea;
        }

        .filter-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 18px 22px;
          flex-wrap: wrap;
        }

        .search-box {
          position: relative;
          flex: 1;
          min-width: 210px;
        }

        .search-box :global(svg) {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9aa3b3;
        }

        .search-box input,
        .filter-select {
          width: 100%;
          min-height: 39px;
          border: 1px solid #e0e5ee;
          border-radius: 8px;
          background: #fff;
          outline: none;
          color: #354057;
          font-size: 12px;
        }

        .search-box input {
          padding: 0 12px 0 36px;
        }

        .search-box input:focus,
        .filter-select:focus {
          border-color: #91aaff;
          box-shadow: 0 0 0 3px #315fea12;
        }

        .filter-select {
          width: auto;
          min-width: 140px;
          padding: 0 32px 0 11px;
        }

        .filter-label {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #778195;
          font-size: 12px;
          font-weight: 600;
        }

        .results-count {
          padding: 0 22px 15px;
          color: #8992a3;
          font-size: 11px;
        }

        .settings-list {
          border-top: 1px solid #edf0f5;
        }

        .setting-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          padding: 18px 22px;
          border-bottom: 1px solid #f0f2f6;
          transition: background 0.15s ease;
        }

        .setting-row:last-child {
          border-bottom: none;
        }

        .setting-row:hover {
          background: #fbfcff;
        }

        .setting-main {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          min-width: 0;
          flex: 1;
        }

        .setting-icon {
          width: 39px;
          height: 39px;
          display: grid;
          place-items: center;
          color: #536aab;
          background: #f0f4ff;
          border-radius: 11px;
          flex-shrink: 0;
        }

        .setting-name {
          font-size: 13px;
          font-weight: 700;
          margin: 1px 0 6px;
          color: #273248;
        }

        .setting-description {
          color: #8992a3;
          font-size: 12px;
          line-height: 1.55;
          margin: 0 0 9px;
          max-width: 650px;
        }

        .setting-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 7px;
        }

        .category-pill,
        .scope-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 8px;
          border-radius: 6px;
          background: #f4f6fa;
          color: #68748a;
          font-size: 10px;
          font-weight: 650;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 700;
          color: #16845a;
        }

        .status-pill.off {
          color: #929bad;
        }

        .toggle-area {
          display: flex;
          align-items: center;
          gap: 13px;
          flex-shrink: 0;
        }

        .toggle-label {
          font-size: 11px;
          color: #778195;
          min-width: 48px;
          text-align: right;
        }

        .toggle {
          position: relative;
          width: 42px;
          height: 24px;
          border-radius: 20px;
          border: none;
          background: #d9dee8;
          padding: 3px;
          transition: background 0.18s ease;
        }

        .toggle.on {
          background: #315fea;
        }

        .toggle-knob {
          display: block;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 1px 3px #00000020;
          transition: transform 0.18s ease;
        }

        .toggle.on .toggle-knob {
          transform: translateX(18px);
        }

        .empty-state {
          padding: 55px 20px;
          text-align: center;
          color: #8790a3;
        }

        .empty-state h3 {
          color: #344054;
          margin: 12px 0 6px;
          font-size: 14px;
        }

        .empty-state p {
          font-size: 12px;
          margin: 0;
        }

        .footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          padding: 17px 22px;
          border-top: 1px solid #edf0f5;
          background: #fcfcfe;
        }

        .footer-note {
          color: #8992a3;
          font-size: 11px;
          display: flex;
          align-items: center;
          gap: 7px;
        }

        .save-message {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #16845a;
          font-size: 11px;
          font-weight: 650;
        }

        .modal-backdrop {
          position: fixed;
          inset: 0;
          z-index: 50;
          background: #17203370;
          display: grid;
          place-items: center;
          padding: 20px;
        }

        .modal {
          width: 100%;
          max-width: 410px;
          background: #fff;
          border-radius: 15px;
          padding: 25px;
          box-shadow: 0 24px 80px #17203325;
        }

        .modal-icon {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border-radius: 12px;
          background: #fff3df;
          color: #bd7a18;
          margin-bottom: 15px;
        }

        .modal h2 {
          margin: 0 0 9px;
          font-size: 18px;
        }

        .modal p {
          color: #778195;
          font-size: 13px;
          line-height: 1.65;
          margin: 0 0 22px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 9px;
        }

        .mobile-note {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 17px;
          padding: 14px 16px;
          border: 1px solid #dce6ff;
          background: #f2f6ff;
          color: #52658f;
          border-radius: 10px;
          font-size: 11px;
          line-height: 1.6;
        }

        @media (max-width: 1000px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 640px) {
          .user-settings-page {
            padding: 18px 12px;
          }

          h1 {
            font-size: 23px;
          }

          .stats-grid {
            gap: 10px;
          }

          .stat-card {
            padding: 15px;
          }

          .stat-number {
            font-size: 23px;
          }

          .filter-row {
            padding: 14px;
          }

          .search-box {
            min-width: 100%;
          }

          .filter-select {
            flex: 1;
            min-width: 120px;
          }

          .setting-row {
            align-items: flex-start;
            padding: 16px 14px;
          }

          .setting-main {
            gap: 9px;
          }

          .setting-icon {
            width: 34px;
            height: 34px;
          }

          .toggle-area {
            gap: 7px;
            flex-direction: column;
            align-items: flex-end;
          }

          .toggle-label {
            min-width: auto;
          }

          .card-heading {
            padding: 17px 14px;
          }

          .tabs {
            padding: 0 10px;
          }

          .footer {
            padding: 14px;
          }
        }
      `}</style>

      <div className="page-shell">
        <div className="breadcrumb">
          <span>Admin</span>
          <span>/</span>
          <span>Users</span>
          <span>/</span>
          <strong>User Settings</strong>
        </div>

        <header className="page-header">
          <div className="heading">
            <div className="heading-icon">
              <Settings2 size={24} />
            </div>
            <div>
              <h1>User Settings</h1>
              <p className="subtitle">
                Configure default user preferences, privacy controls, access,
                and account security policies.
              </p>
            </div>
          </div>

          <div className="header-actions">
            <button
              className="btn"
              onClick={() => setShowResetConfirm(true)}
            >
              <RefreshCw size={15} />
              Reset defaults
            </button>
            <button className="btn btn-primary" onClick={saveSettings}>
              <Save size={15} />
              Save changes
            </button>
          </div>
        </header>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Total settings</span>
              <div className="stat-icon">
                <SlidersHorizontal size={18} />
              </div>
            </div>
            <div className="stat-number">{settings.length}</div>
            <div className="stat-note">Available user controls</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Enabled settings</span>
              <div
                className="stat-icon"
                style={{ color: "#16845a", background: "#e8f8f0" }}
              >
                <CheckCircle2 size={18} />
              </div>
            </div>
            <div className="stat-number">{enabledCount}</div>
            <div className="stat-note">Currently switched on</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Disabled settings</span>
              <div
                className="stat-icon"
                style={{ color: "#b7791f", background: "#fff4df" }}
              >
                <AlertTriangle size={18} />
              </div>
            </div>
            <div className="stat-number">{disabledCount}</div>
            <div className="stat-note">Currently switched off</div>
          </div>

          <div className="stat-card">
            <div className="stat-top">
              <span className="stat-label">Security controls</span>
              <div className="stat-icon">
                <ShieldCheck size={18} />
              </div>
            </div>
            <div className="stat-number">{securityCount}/4</div>
            <div className="stat-note">Security policies enabled</div>
          </div>
        </section>

        <section className="content-card">
          <div className="card-heading">
            <div>
              <h2 className="card-title">User preference controls</h2>
              <p className="card-description">
                Manage default behaviors for user accounts across ModelNow.
              </p>
            </div>
            <span className="category-pill">
              <Globe size={13} />
              Platform-wide configuration
            </span>
          </div>

          <div className="tabs">
            {["All settings", "Enabled", "Disabled"].map((tab) => (
              <button
                key={tab}
                className={`tab ${activeTab === tab ? "active" : ""}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
                <span style={{ marginLeft: 7, opacity: 0.65 }}>
                  {tab === "All settings"
                    ? settings.length
                    : tab === "Enabled"
                      ? enabledCount
                      : disabledCount}
                </span>
              </button>
            ))}
          </div>

          <div className="filter-row">
            <div className="search-box">
              <Search size={16} />
              <input
                aria-label="Search user settings"
                placeholder="Search by name, description, or ID..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <label className="filter-label">
              <SlidersHorizontal size={14} />
              <select
                className="filter-select"
                aria-label="Filter by category"
                value={category}
                onChange={(event) => setCategory(event.target.value)}
              >
                {categories.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>

            <select
              className="filter-select"
              aria-label="Filter by status"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option>All</option>
              <option>Enabled</option>
              <option>Disabled</option>
            </select>

            <select
              className="filter-select"
              aria-label="Filter by scope"
              value={scopeFilter}
              onChange={(event) => setScopeFilter(event.target.value)}
            >
              <option>All scopes</option>
              <option>All users</option>
              <option>Organization</option>
              <option>Eligible users</option>
            </select>
          </div>

          <div className="results-count">
            Showing {filteredSettings.length} of {settings.length} settings
          </div>

          <div className="settings-list">
            {filteredSettings.map((setting) => (
              <div className="setting-row" key={setting.id}>
                <div className="setting-main">
                  <div className="setting-icon">
                    {categoryIcons[setting.category] ?? (
                      <Settings2 size={18} />
                    )}
                  </div>
                  <div>
                    <h3 className="setting-name">{setting.name}</h3>
                    <p className="setting-description">
                      {setting.description}
                    </p>
                    <div className="setting-meta">
                      <span className="category-pill">
                        {setting.category}
                      </span>
                      <span className="scope-pill">
                        {setting.scope}
                      </span>
                      <span
                        className={`status-pill ${setting.enabled ? "" : "off"}`}
                      >
                        {setting.enabled ? (
                          <CheckCircle2 size={12} />
                        ) : (
                          <Clock3 size={12} />
                        )}
                        {setting.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="toggle-area">
                  <span className="toggle-label">
                    {setting.enabled ? "On" : "Off"}
                  </span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={setting.enabled}
                    aria-label={`${setting.enabled ? "Disable" : "Enable"} ${setting.name}`}
                    className={`toggle ${setting.enabled ? "on" : ""}`}
                    onClick={() => toggleSetting(setting.id)}
                  >
                    <span className="toggle-knob" />
                  </button>
                </div>
              </div>
            ))}

            {filteredSettings.length === 0 && (
              <div className="empty-state">
                <Search size={28} />
                <h3>No settings found</h3>
                <p>Try changing your search term or filters.</p>
              </div>
            )}
          </div>

          <div className="footer">
            <div className="footer-note">
              <ShieldCheck size={15} />
              Changes affect the displayed demo configuration.
            </div>
            {saved && (
              <div className="save-message">
                <CheckCircle2 size={15} />
                Changes saved in this page session.
              </div>
            )}
            <button className="btn btn-primary" onClick={saveSettings}>
              <Save size={15} />
              Save changes
            </button>
          </div>
        </section>

        <div className="mobile-note">
          <Smartphone size={17} />
          <span>
            <strong>Mobile and device preferences:</strong> Push notification
            and device verification controls are included in this settings
            inventory. Actual device enforcement requires backend integration.
          </span>
        </div>

        {showResetConfirm && (
          <div
            className="modal-backdrop"
            onClick={() => setShowResetConfirm(false)}
          >
            <div
              className="modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="reset-title"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-icon">
                <AlertTriangle size={22} />
              </div>
              <h2 id="reset-title">Reset user settings?</h2>
              <p>
                This will restore all settings and filters to their original
                demo defaults. Your current changes on this page will be lost.
              </p>
              <div className="modal-actions">
                <button
                  className="btn"
                  onClick={() => setShowResetConfirm(false)}
                >
                  Cancel
                </button>
                <button className="btn btn-primary" onClick={resetSettings}>
                  <RefreshCw size={14} />
                  Reset settings
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}