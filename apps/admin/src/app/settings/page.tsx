
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bell,
  Blocks,
  BrainCircuit,
  Building2,
  Check,
  ChevronRight,
  Cloud,
  Database,
  FileClock,
  Fingerprint,
  Flag,
  Globe,
  KeyRound,
  LockKeyhole,
  Mail,
  MonitorCog,
  Network,
  Palette,
  Search,
  Server,
  Settings,
  Shield,
  SlidersHorizontal,
  Users,
  Wallet,
  Webhook,
  Wrench,
  X,
  Zap,
} from "lucide-react";

type SettingsItem = {
  title: string;
  description: string;
  href: string;
  icon: typeof Settings;
  status?: string;
};

type SettingsGroup = {
  title: string;
  description: string;
  items: SettingsItem[];
};

const settingsGroups: SettingsGroup[] = [
  {
    title: "Platform",
    description: "Configure the platform and administrator experience.",
    items: [
      {
        title: "General Settings",
        description: "Platform name, branding, defaults, and basic preferences.",
        href: "/settings/general-settings",
        icon: Settings,
      },
      {
        title: "Platform Configuration",
        description: "Manage global platform behavior and environment options.",
        href: "/settings/platform-configuration",
        icon: MonitorCog,
      },
      {
        title: "Admin Preferences",
        description: "Customize your admin workspace and dashboard defaults.",
        href: "/settings/admin-preferences",
        icon: Palette,
      },
      {
        title: "System Configuration",
        description: "Review system-level configuration and runtime options.",
        href: "/settings/system-configuration",
        icon: Server,
      },
      {
        title: "Maintenance Settings",
        description: "Control maintenance mode and operational windows.",
        href: "/settings/maintenance-settings",
        icon: Wrench,
      },
    ],
  },
  {
    title: "Users & Organizations",
    description: "Manage users, organizations, and workspace behavior.",
    items: [
      {
        title: "User Settings",
        description: "Configure user defaults, registration, and account behavior.",
        href: "/settings/user-settings",
        icon: Users,
      },
      {
        title: "Organization Settings",
        description: "Set organization defaults and management policies.",
        href: "/settings/organization-settings",
        icon: Building2,
      },
      {
        title: "Workspace Settings",
        description: "Manage workspace creation, defaults, and collaboration.",
        href: "/settings/workspace-settings",
        icon: Blocks,
      },
      {
        title: "Localization Settings",
        description: "Configure supported languages, regions, and time zones.",
        href: "/settings/localization-settings",
        icon: Globe,
      },
    ],
  },
  {
    title: "Identity & Security",
    description: "Manage authentication, permissions, and data protection.",
    items: [
      {
        title: "Authentication Settings",
        description: "Configure sign-in methods, sessions, and identity providers.",
        href: "/settings/authentication-settings",
        icon: Fingerprint,
      },
      {
        title: "Access Control Settings",
        description: "Manage roles, permissions, and privileged access.",
        href: "/settings/access-control-settings",
        icon: LockKeyhole,
      },
      {
        title: "Security Settings",
        description: "Review security policies and platform safeguards.",
        href: "/settings/security-settings",
        icon: Shield,
      },
      {
        title: "Privacy & Data Settings",
        description: "Configure data handling, privacy, and retention policies.",
        href: "/settings/privacy-data-settings",
        icon: KeyRound,
      },
      {
        title: "Settings Audit Logs",
        description: "Review administrative changes and configuration history.",
        href: "/settings/settings-audit-logs",
        icon: FileClock,
      },
    ],
  },
  {
    title: "AI Platform",
    description: "Configure models, providers, routing, and consumption limits.",
    items: [
      {
        title: "API Settings",
        description: "Manage API behavior, credentials, and request defaults.",
        href: "/settings/api-settings",
        icon: Webhook,
      },
      {
        title: "AI Model Settings",
        description: "Configure model availability and model-level defaults.",
        href: "/settings/ai-model-settings",
        icon: BrainCircuit,
      },
      {
        title: "AI Provider Settings",
        description: "Manage AI providers, credentials, and provider defaults.",
        href: "/settings/ai-provider-settings",
        icon: Network,
      },
      {
        title: "Model Routing Settings",
        description: "Configure model selection, fallback, and routing policies.",
        href: "/settings/model-routing-settings",
        icon: Zap,
      },
      {
        title: "Usage & Rate Limits",
        description: "Set request quotas, token limits, and rate-limit policies.",
        href: "/settings/usage-rate-limits",
        icon: SlidersHorizontal,
      },
      {
        title: "Feature Flags",
        description: "Control feature availability and staged rollouts.",
        href: "/settings/feature-flags",
        icon: Flag,
      },
    ],
  },
  {
    title: "Billing & Notifications",
    description: "Configure billing behavior and platform communications.",
    items: [
      {
        title: "Billing Settings",
        description: "Manage billing defaults, invoices, and payment policies.",
        href: "/settings/billing-settings",
        icon: Wallet,
      },
      {
        title: "Notification Settings",
        description: "Choose platform alerts and notification preferences.",
        href: "/settings/notification-settings",
        icon: Bell,
      },
      {
        title: "Email Settings",
        description: "Configure email delivery, templates, and sender details.",
        href: "/settings/email-settings",
        icon: Mail,
      },
    ],
  },
  {
    title: "Infrastructure & Integrations",
    description: "Configure connected services, storage, and recovery options.",
    items: [
      {
        title: "Integration Settings",
        description: "Manage connected applications and external services.",
        href: "/settings/integration-settings",
        icon: Blocks,
      },
      {
        title: "Storage Settings",
        description: "Configure file storage, limits, and storage policies.",
        href: "/settings/storage-settings",
        icon: Database,
      },
      {
        title: "Backup & Recovery",
        description: "Manage backup policies and recovery configuration.",
        href: "/settings/backup-recovery",
        icon: Cloud,
      },
    ],
  },
];

const allItems = settingsGroups.flatMap((group) => group.items);

const overviewItem: SettingsItem = {
  title: "Overview",
  description: "Review settings categories and manage platform configuration.",
  href: "/settings",
  icon: Activity,
};

export default function SettingsPage() {
  const [search, setSearch] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All settings");
  const [notice, setNotice] = useState("");

  const filteredGroups = useMemo(() => {
    const query = search.trim().toLowerCase();

    return settingsGroups
      .filter(
        (group) =>
          selectedGroup === "All settings" || group.title === selectedGroup,
      )
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => {
          if (!query) return true;

          return (
            item.title.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            group.title.toLowerCase().includes(query)
          );
        }),
      }))
      .filter((group) => group.items.length > 0);
  }, [search, selectedGroup]);

  const visibleCount = filteredGroups.reduce(
    (total, group) => total + group.items.length,
    0,
  );

  const styles = `
    .settings-page {
      --settings-text: #172033;
      --settings-muted: #6b7688;
      --settings-border: #e5eaf1;
      --settings-primary: #315fea;
      width: 100%;
      max-width: 1700px;
      margin: 0 auto;
      padding: 28px;
      color: var(--settings-text);
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 14px;
    }

    .settings-page * { box-sizing: border-box; }

    .settings-hero {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 22px;
      margin-bottom: 25px;
    }

    .settings-eyebrow {
      color: #5872b8;
      font-size: 11px;
      font-weight: 800;
      letter-spacing: 1.5px;
      margin-bottom: 9px;
    }

    .settings-hero h1 {
      margin: 0;
      font-size: clamp(27px, 3vw, 34px);
      font-weight: 760;
      letter-spacing: -1px;
      line-height: 1.2;
    }

    .settings-hero p {
      max-width: 720px;
      margin: 10px 0 0;
      color: var(--settings-muted);
      font-size: 13px;
      line-height: 1.7;
    }

    .settings-primary-button {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      gap: 8px;
      min-height: 40px;
      padding: 0 14px;
      border: 1px solid var(--settings-primary);
      border-radius: 9px;
      background: var(--settings-primary);
      color: white;
      font-weight: 700;
      text-decoration: none;
      white-space: nowrap;
    }

    .settings-primary-button:hover { background: #244dc9; }

    .settings-summary-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 15px;
      margin-bottom: 27px;
    }

    .settings-summary-card {
      padding: 18px;
      border: 1px solid var(--settings-border);
      border-radius: 12px;
      background: #fff;
      box-shadow: 0 2px 8px #17203304;
    }

    .settings-summary-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      margin-bottom: 17px;
    }

    .settings-summary-icon {
      display: grid;
      place-items: center;
      width: 39px;
      height: 39px;
      border-radius: 10px;
    }

    .settings-icon-blue { color: #315fea; background: #eaf0ff; }
    .settings-icon-purple { color: #8053d6; background: #f1eaff; }
    .settings-icon-green { color: #14804a; background: #e5f8ed; }
    .settings-icon-orange { color: #c56a12; background: #fff1df; }

    .settings-summary-label {
      color: #758195;
      font-size: 11px;
      font-weight: 700;
    }

    .settings-summary-value {
      display: block;
      font-size: 28px;
      font-weight: 760;
      letter-spacing: -0.8px;
    }

    .settings-summary-caption {
      margin-top: 5px;
      color: var(--settings-muted);
      font-size: 11px;
      line-height: 1.5;
    }

    .settings-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      flex-wrap: wrap;
      padding: 15px;
      margin-bottom: 23px;
      border: 1px solid var(--settings-border);
      border-radius: 12px;
      background: #fff;
    }

    .settings-search {
      display: flex;
      align-items: center;
      gap: 9px;
      flex: 1 1 280px;
      max-width: 480px;
      min-height: 40px;
      padding: 0 12px;
      border: 1px solid #e2e7ef;
      border-radius: 9px;
      color: #758195;
      background: #fff;
    }

    .settings-search:focus-within {
      border-color: #9db4ff;
      box-shadow: 0 0 0 3px #315fea12;
    }

    .settings-search input {
      width: 100%;
      min-width: 0;
      border: 0;
      outline: 0;
      color: var(--settings-text);
      background: transparent;
      font: inherit;
    }

    .settings-filter-group {
      display: flex;
      flex-wrap: wrap;
      gap: 7px;
    }

    .settings-filter {
      min-height: 34px;
      padding: 0 11px;
      border: 1px solid transparent;
      border-radius: 8px;
      color: #657185;
      background: transparent;
      cursor: pointer;
      font-size: 11px;
      font-weight: 700;
    }

    .settings-filter:hover {
      background: #f4f6fa;
    }

    .settings-filter.active {
      border-color: #dce5ff;
      color: #315fea;
      background: #edf2ff;
    }

    .settings-group {
      margin-top: 29px;
    }

    .settings-group-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 15px;
      margin-bottom: 13px;
    }

    .settings-group-header h2 {
      margin: 0;
      font-size: 17px;
      font-weight: 760;
      letter-spacing: -0.3px;
    }

    .settings-group-header p {
      margin: 5px 0 0;
      color: var(--settings-muted);
      font-size: 12px;
      line-height: 1.6;
    }

    .settings-group-count {
      padding: 5px 9px;
      border: 1px solid var(--settings-border);
      border-radius: 999px;
      color: #64748b;
      background: #fff;
      font-size: 10px;
      font-weight: 750;
      white-space: nowrap;
    }

    .settings-cards {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 13px;
    }

    .settings-card {
      display: flex;
      align-items: flex-start;
      gap: 13px;
      min-width: 0;
      min-height: 125px;
      padding: 17px;
      border: 1px solid var(--settings-border);
      border-radius: 12px;
      background: #fff;
      color: inherit;
      text-decoration: none;
      transition: border-color .15s ease, box-shadow .15s ease, transform .15s ease;
    }

    .settings-card:hover {
      border-color: #c8d6ff;
      box-shadow: 0 7px 22px #1720330a;
      transform: translateY(-1px);
    }

    .settings-card-icon {
      display: grid;
      place-items: center;
      width: 40px;
      height: 40px;
      flex: 0 0 40px;
      border: 1px solid #e6ecff;
      border-radius: 10px;
      color: #315fea;
      background: #f0f4ff;
    }

    .settings-card-content {
      flex: 1;
      min-width: 0;
    }

    .settings-card-title-row {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 8px;
    }

    .settings-card h3 {
      margin: 2px 0 0;
      color: #263247;
      font-size: 12px;
      font-weight: 760;
      line-height: 1.5;
    }

    .settings-card p {
      margin: 7px 0 0;
      color: #788497;
      font-size: 11px;
      line-height: 1.6;
    }

    .settings-card-arrow {
      flex: 0 0 auto;
      margin-top: 2px;
      color: #9aa4b2;
      transition: transform .15s ease, color .15s ease;
    }

    .settings-card:hover .settings-card-arrow {
      color: var(--settings-primary);
      transform: translateX(2px);
    }

    .settings-notice {
      display: flex;
      align-items: center;
      gap: 9px;
      padding: 12px 14px;
      margin-bottom: 20px;
      border: 1px solid #bde8d0;
      border-radius: 9px;
      background: #f0fdf4;
      color: #166534;
      font-size: 12px;
    }

    .settings-notice button {
      display: grid;
      place-items: center;
      width: 25px;
      height: 25px;
      margin-left: auto;
      border: 0;
      border-radius: 6px;
      color: inherit;
      background: transparent;
      cursor: pointer;
    }

    .settings-notice button:hover { background: #dcfce7; }

    .settings-empty {
      padding: 40px 20px;
      border: 1px dashed #d8e0eb;
      border-radius: 12px;
      color: #758195;
      background: #fff;
      text-align: center;
    }

    .settings-empty strong {
      display: block;
      margin-bottom: 6px;
      color: #263247;
    }

    .settings-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
      margin-top: 34px;
      padding: 18px 0 4px;
      border-top: 1px solid var(--settings-border);
      color: #8490a1;
      font-size: 11px;
    }

    .settings-footer span {
      display: inline-flex;
      align-items: center;
      gap: 7px;
    }

    @media (max-width: 1150px) {
      .settings-page { padding: 22px; }
      .settings-cards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .settings-summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    }

    @media (max-width: 680px) {
      .settings-page { padding: 15px; }
      .settings-hero { flex-direction: column; }
      .settings-primary-button { width: 100%; }
      .settings-summary-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
      .settings-summary-card { padding: 13px; }
      .settings-summary-value { font-size: 24px; }
      .settings-toolbar { align-items: stretch; }
      .settings-search { max-width: none; flex-basis: 100%; }
      .settings-filter-group { width: 100%; }
      .settings-filter { flex: 1 1 auto; }
      .settings-cards { grid-template-columns: 1fr; }
      .settings-card { min-height: 108px; }
      .settings-group-header { align-items: flex-start; }
    }

    @media (max-width: 370px) {
      .settings-summary-grid { grid-template-columns: 1fr; }
    }
  `;

  return (
    <main className="settings-page">
      <style>{styles}</style>

      <header className="settings-hero">
        <div>
          <div className="settings-eyebrow">MODELNOW ADMINISTRATION</div>
          <h1>Settings</h1>
          <p>
            Manage platform configuration, security policies, AI services,
            billing, integrations, and system-wide preferences from one place.
          </p>
        </div>

        <Link className="settings-primary-button" href="/settings/general-settings">
          <Settings size={16} />
          General settings
          <ArrowRight size={15} />
        </Link>
      </header>

      <section className="settings-summary-grid" aria-label="Settings summary">
        <article className="settings-summary-card">
          <div className="settings-summary-top">
            <span className="settings-summary-icon settings-icon-blue">
              <SlidersHorizontal size={19} />
            </span>
            <span className="settings-summary-label">Configuration</span>
          </div>
          <strong className="settings-summary-value">27</strong>
          <p className="settings-summary-caption">
            Settings pages in the admin workspace
          </p>
        </article>

        <article className="settings-summary-card">
          <div className="settings-summary-top">
            <span className="settings-summary-icon settings-icon-purple">
              <Shield size={19} />
            </span>
            <span className="settings-summary-label">Security</span>
          </div>
          <strong className="settings-summary-value">5</strong>
          <p className="settings-summary-caption">
            Identity, access, privacy, and audit areas
          </p>
        </article>

        <article className="settings-summary-card">
          <div className="settings-summary-top">
            <span className="settings-summary-icon settings-icon-green">
              <BrainCircuit size={19} />
            </span>
            <span className="settings-summary-label">AI Platform</span>
          </div>
          <strong className="settings-summary-value">6</strong>
          <p className="settings-summary-caption">
            Model, provider, routing, and usage controls
          </p>
        </article>

        <article className="settings-summary-card">
          <div className="settings-summary-top">
            <span className="settings-summary-icon settings-icon-orange">
              <Activity size={19} />
            </span>
            <span className="settings-summary-label">Organization</span>
          </div>
          <strong className="settings-summary-value">6</strong>
          <p className="settings-summary-caption">
            Categories for platform-wide administration
          </p>
        </article>
      </section>

      {notice && (
        <div className="settings-notice" role="status">
          <Check size={16} />
          <span>{notice}</span>
          <button
            type="button"
            onClick={() => setNotice("")}
            aria-label="Dismiss notification"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <section className="settings-toolbar" aria-label="Find settings">
        <label className="settings-search">
          <Search size={17} />
          <span className="settings-sr-only">Search settings</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search settings by name or description..."
            aria-label="Search settings by name or description"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              style={{
                display: "grid",
                placeItems: "center",
                border: 0,
                background: "transparent",
                color: "#758195",
                cursor: "pointer",
              }}
            >
              <X size={15} />
            </button>
          )}
        </label>

        <div className="settings-filter-group">
          {[
            "All settings",
            ...settingsGroups.map((group) => group.title),
          ].map((group) => (
            <button
              key={group}
              type="button"
              className={`settings-filter ${
                selectedGroup === group ? "active" : ""
              }`}
              onClick={() => setSelectedGroup(group)}
            >
              {group}
            </button>
          ))}
        </div>
      </section>

      <div aria-live="polite" style={{ color: "#758195", fontSize: 11 }}>
        Showing {visibleCount} of {allItems.length} settings pages
      </div>

      {filteredGroups.length === 0 ? (
        <div className="settings-empty" style={{ marginTop: 16 }}>
          <Search
            size={25}
            style={{ display: "block", margin: "0 auto 12px" }}
          />
          <strong>No settings found</strong>
          Try a different search term or select another category.
        </div>
      ) : (
        filteredGroups.map((group) => (
          <section className="settings-group" key={group.title}>
            <div className="settings-group-header">
              <div>
                <h2>{group.title}</h2>
                <p>{group.description}</p>
              </div>
              <span className="settings-group-count">
                {group.items.length}{" "}
                {group.items.length === 1 ? "setting" : "settings"}
              </span>
            </div>

            <div className="settings-cards">
              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    href={item.href}
                    className="settings-card"
                    key={item.href}
                  >
                    <span className="settings-card-icon">
                      <Icon size={19} />
                    </span>
                    <span className="settings-card-content">
                      <span className="settings-card-title-row">
                        <h3>{item.title}</h3>
                        <ChevronRight
                          className="settings-card-arrow"
                          size={16}
                        />
                      </span>
                      <p>{item.description}</p>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))
      )}

      <footer className="settings-footer">
        <span>
          <Settings size={14} />
          ModelNow Admin · Settings
        </span>
        <span>
          <Activity size={14} />
          Configuration hub
        </span>
      </footer>
    </main>
  );
}
