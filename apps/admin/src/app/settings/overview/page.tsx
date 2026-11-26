
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  Bell,
  Blocks,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock,
  CreditCard,
  Database,
  FileClock,
  Globe,
  KeyRound,
  LockKeyhole,
  Mail,
  Network,
  Search,
  Server,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
  Webhook,
  Zap,
} from "lucide-react";

type SettingsItem = {
  title: string;
  description: string;
  href: string;
  icon: typeof Settings;
  status?: "Configured" | "Review recommended" | "Coming soon";
};

type SettingsGroup = {
  title: string;
  description: string;
  items: SettingsItem[];
};

const settingsGroups: SettingsGroup[] = [
  {
    title: "Platform",
    description: "Manage the core platform and workspace experience.",
    items: [
      {
        title: "General Settings",
        description: "Platform name, branding, defaults, and basic preferences.",
        href: "/settings/general-settings",
        icon: Settings,
      },
      {
        title: "Platform Configuration",
        description: "Configure platform behavior and operational defaults.",
        href: "/settings/platform-configuration",
        icon: SlidersHorizontal,
      },
      {
        title: "Admin Preferences",
        description: "Customize the administrator experience and defaults.",
        href: "/settings/admin-preferences",
        icon: Users,
      },
      {
        title: "Workspace Settings",
        description: "Control workspace behavior and collaboration defaults.",
        href: "/settings/workspace-settings",
        icon: Building2,
      },
    ],
  },
  {
    title: "People & Access",
    description: "Control users, organizations, authentication, and permissions.",
    items: [
      {
        title: "User Settings",
        description: "Manage account defaults and user-level preferences.",
        href: "/settings/user-settings",
        icon: Users,
      },
      {
        title: "Organization Settings",
        description: "Manage organizations, defaults, and organization policies.",
        href: "/settings/organization-settings",
        icon: Building2,
        status: "Configured",
      },
      {
        title: "Authentication Settings",
        description: "Configure sign-in methods, sessions, and identity providers.",
        href: "/settings/authentication-settings",
        icon: KeyRound,
      },
      {
        title: "Access Control",
        description: "Manage roles, permissions, and administrative access.",
        href: "/settings/access-control-settings",
        icon: ShieldCheck,
      },
    ],
  },
  {
    title: "AI Infrastructure",
    description: "Configure models, providers, routing, and usage controls.",
    items: [
      {
        title: "AI Model Settings",
        description: "Manage available models and model-specific defaults.",
        href: "/settings/ai-model-settings",
        icon: BrainCircuit,
      },
      {
        title: "AI Provider Settings",
        description: "Configure AI providers, credentials, and connectivity.",
        href: "/settings/ai-provider-settings",
        icon: Network,
      },
      {
        title: "Model Routing",
        description: "Configure model selection, fallbacks, and routing rules.",
        href: "/settings/model-routing-settings",
        icon: Zap,
      },
      {
        title: "Usage & Rate Limits",
        description: "Manage quotas, request limits, and spending thresholds.",
        href: "/settings/usage-rate-limits",
        icon: Activity,
        status: "Configured",
      },
    ],
  },
  {
    title: "API & Integrations",
    description: "Manage API access and connected services.",
    items: [
      {
        title: "API Settings",
        description: "Manage API keys, endpoints, and API security options.",
        href: "/settings/api-settings",
        icon: Webhook,
        status: "Configured",
      },
      {
        title: "Integration Settings",
        description: "Configure third-party applications and integrations.",
        href: "/settings/integration-settings",
        icon: Blocks,
      },
    ],
  },
  {
    title: "Billing & Communication",
    description: "Configure billing, email, and notification behavior.",
    items: [
      {
        title: "Billing Settings",
        description: "Manage billing preferences and payment configuration.",
        href: "/settings/billing-settings",
        icon: CreditCard,
      },
      {
        title: "Notification Settings",
        description: "Manage notification rules, channels, and delivery preferences.",
        href: "/settings/notification-settings",
        icon: Bell,
        status: "Configured",
      },
      {
        title: "Email Settings",
        description: "Configure email delivery, sender identity, and templates.",
        href: "/settings/email-settings",
        icon: Mail,
      },
    ],
  },
  {
    title: "Security & Privacy",
    description: "Protect platform data and manage security controls.",
    items: [
      {
        title: "Security Settings",
        description: "Configure security policies and protection controls.",
        href: "/settings/security-settings",
        icon: LockKeyhole,
      },
      {
        title: "Privacy & Data",
        description: "Manage retention, consent, data requests, and protection.",
        href: "/settings/privacy-data-settings",
        icon: Database,
        status: "Configured",
      },
    ],
  },
  {
    title: "System Operations",
    description: "Manage storage, localization, maintenance, and recovery.",
    items: [
      {
        title: "Storage Settings",
        description: "Configure storage destinations and file management.",
        href: "/settings/storage-settings",
        icon: Database,
      },
      {
        title: "Localization Settings",
        description: "Manage languages, regional formats, and time zones.",
        href: "/settings/localization-settings",
        icon: Globe,
        status: "Configured",
      },
      {
        title: "Feature Flags",
        description: "Control feature availability across the platform.",
        href: "/settings/feature-flags",
        icon: Sparkles,
      },
      {
        title: "Maintenance Settings",
        description: "Manage maintenance windows and service availability.",
        href: "/settings/maintenance-settings",
        icon: Server,
      },
      {
        title: "Backup & Recovery",
        description: "Manage backups, restore requests, and recovery policies.",
        href: "/settings/backup-recovery",
        icon: Database,
        status: "Configured",
      },
      {
        title: "System Configuration",
        description: "Manage runtime, infrastructure, and service settings.",
        href: "/settings/system-configuration",
        icon: SlidersHorizontal,
        status: "Configured",
      },
    ],
  },
  {
    title: "Audit & Compliance",
    description: "Review administrative changes and system activity.",
    items: [
      {
        title: "Settings Audit Logs",
        description: "Review configuration changes and administrative events.",
        href: "/settings/settings-audit-logs",
        icon: FileClock,
        status: "Configured",
      },
    ],
  },
];

const styles = `
.settings-overview {
  --so-bg: var(--background, #ffffff);
  --so-panel: var(--card, #ffffff);
  --so-text: var(--foreground, #111827);
  --so-muted: var(--muted-foreground, #6b7280);
  --so-border: var(--border, #e5e7eb);
  color: var(--so-text);
  width: 100%;
  min-width: 0;
  padding: 28px;
}
.settings-overview * { box-sizing: border-box; }
.settings-overview .so-header {
  display: flex; align-items: flex-start; justify-content: space-between;
  gap: 18px; flex-wrap: wrap; margin-bottom: 24px;
}
.settings-overview .so-eyebrow {
  display: flex; align-items: center; gap: 8px; color: #64748b;
  font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: .08em;
}
.settings-overview .so-title {
  font-size: clamp(26px, 3vw, 34px); line-height: 1.2;
  font-weight: 750; letter-spacing: -.04em; margin: 10px 0 8px;
}
.settings-overview .so-subtitle {
  color: var(--so-muted); font-size: 14px; line-height: 1.7; max-width: 720px;
}
.settings-overview .so-header-action {
  display: inline-flex; align-items: center; gap: 8px; border: 1px solid var(--so-border);
  padding: 10px 14px; border-radius: 10px; font-size: 13px; font-weight: 650;
  text-decoration: none; color: var(--so-text); background: var(--so-panel);
}
.settings-overview .so-header-action:hover,
.settings-overview .so-card:hover { border-color: #93a9f9; }
.settings-overview .so-metrics {
  display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px; margin-bottom: 24px;
}
.settings-overview .so-metric {
  border: 1px solid var(--so-border); border-radius: 14px; padding: 18px;
  background: var(--so-panel); min-width: 0;
}
.settings-overview .so-metric-top {
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
}
.settings-overview .so-metric-label { font-size: 12px; color: var(--so-muted); font-weight: 600; }
.settings-overview .so-metric-icon {
  width: 34px; height: 34px; display: grid; place-items: center;
  border-radius: 10px; background: #eef2ff; color: #4f46e5;
}
.settings-overview .so-metric-value { font-size: 27px; font-weight: 750; letter-spacing: -.04em; margin-top: 12px; }
.settings-overview .so-metric-note { color: var(--so-muted); font-size: 11px; margin-top: 4px; }
.settings-overview .so-toolbar {
  display: flex; justify-content: space-between; align-items: center;
  gap: 12px; flex-wrap: wrap; margin: 22px 0;
}
.settings-overview .so-search {
  display: flex; align-items: center; gap: 9px; border: 1px solid var(--so-border);
  border-radius: 10px; padding: 0 12px; height: 42px; flex: 1;
  min-width: 220px; max-width: 440px; background: var(--so-panel);
}
.settings-overview .so-search input {
  width: 100%; min-width: 0; border: 0; outline: none; background: transparent;
  color: var(--so-text); font-size: 13px;
}
.settings-overview .so-count { font-size: 12px; color: var(--so-muted); }
.settings-overview .so-group { margin-top: 30px; }
.settings-overview .so-group-heading {
  display: flex; align-items: flex-end; justify-content: space-between;
  gap: 12px; margin-bottom: 13px; flex-wrap: wrap;
}
.settings-overview .so-group-title { font-size: 16px; font-weight: 750; margin: 0 0 5px; }
.settings-overview .so-group-description { font-size: 12px; color: var(--so-muted); margin: 0; }
.settings-overview .so-group-count {
  font-size: 11px; color: var(--so-muted); border: 1px solid var(--so-border);
  border-radius: 999px; padding: 5px 9px;
}
.settings-overview .so-grid {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px;
}
.settings-overview .so-card {
  display: flex; flex-direction: column; text-decoration: none; color: inherit;
  background: var(--so-panel); border: 1px solid var(--so-border);
  border-radius: 13px; padding: 16px; min-width: 0; transition: border-color .15s, transform .15s;
}
.settings-overview .so-card:hover { transform: translateY(-1px); }
.settings-overview .so-card-top {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
}
.settings-overview .so-card-icon {
  display: grid; place-items: center; width: 38px; height: 38px;
  flex-shrink: 0; border-radius: 11px; background: #f1f5f9; color: #334155;
}
.settings-overview .so-card-arrow { color: #94a3b8; margin-top: 4px; }
.settings-overview .so-card-title { font-size: 13px; font-weight: 700; margin: 15px 0 7px; }
.settings-overview .so-card-description {
  font-size: 12px; color: var(--so-muted); line-height: 1.65; flex: 1;
}
.settings-overview .so-card-footer {
  display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
  margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--so-border);
}
.settings-overview .so-status {
  display: inline-flex; align-items: center; gap: 5px; border-radius: 999px;
  padding: 4px 7px; font-size: 10px; font-weight: 650;
}
.settings-overview .so-status-configured { background: #ecfdf5; color: #047857; }
.settings-overview .so-status-review { background: #fff7ed; color: #c2410c; }
.settings-overview .so-status-coming { background: #f1f5f9; color: #475569; }
.settings-overview .so-open { font-size: 11px; color: #4f46e5; font-weight: 650; margin-left: auto; }
.settings-overview .so-empty {
  border: 1px dashed var(--so-border); border-radius: 12px; padding: 36px 20px;
  text-align: center; color: var(--so-muted); font-size: 13px;
}
.settings-overview .so-bottom {
  display: grid; grid-template-columns: 1.3fr 1fr; gap: 14px; margin-top: 30px;
}
.settings-overview .so-info {
  border: 1px solid var(--so-border); border-radius: 14px; padding: 18px;
  background: var(--so-panel);
}
.settings-overview .so-info-title {
  display: flex; align-items: center; gap: 9px; font-size: 14px; font-weight: 750; margin-bottom: 8px;
}
.settings-overview .so-info-text { font-size: 12px; line-height: 1.7; color: var(--so-muted); }
.settings-overview .so-info-link {
  display: inline-flex; align-items: center; gap: 6px; margin-top: 12px;
  font-size: 12px; color: #4f46e5; font-weight: 650; text-decoration: none;
}
@media (max-width: 1100px) {
  .settings-overview .so-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .settings-overview .so-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 640px) {
  .settings-overview { padding: 16px; }
  .settings-overview .so-grid,
  .settings-overview .so-metrics,
  .settings-overview .so-bottom { grid-template-columns: 1fr; }
  .settings-overview .so-search { max-width: none; }
}
`;

export default function SettingsOverviewPage() {
  const [search, setSearch] = useState("");

  const normalizedSearch = search.trim().toLowerCase();

  const filteredGroups = useMemo(() => {
    if (!normalizedSearch) return settingsGroups;

    return settingsGroups
      .map((group) => ({
        ...group,
        items: group.items.filter((item) =>
          [
            item.title,
            item.description,
            group.title,
            item.href,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedSearch),
        ),
      }))
      .filter((group) => group.items.length > 0);
  }, [normalizedSearch]);

  const allItems = settingsGroups.flatMap((group) => group.items);
  const configuredCount = allItems.filter(
    (item) => item.status === "Configured",
  ).length;
  const visibleCount = filteredGroups.reduce(
    (total, group) => total + group.items.length,
    0,
  );

  return (
    <main className="settings-overview">
      <style>{styles}</style>

      <header className="so-header">
        <div>
          <div className="so-eyebrow">
            <Settings size={15} />
            Admin Console
            <ChevronRight size={13} />
            Settings
          </div>
          <h1 className="so-title">Settings Overview</h1>
          <p className="so-subtitle">
            Configure ModelNow&apos;s platform, AI infrastructure, access
            policies, integrations, billing, and system operations from one
            central workspace.
          </p>
        </div>

        <Link href="/settings/settings-audit-logs" className="so-header-action">
          <FileClock size={16} />
          View audit logs
          <ArrowRight size={15} />
        </Link>
      </header>

      <section className="so-metrics" aria-label="Settings summary">
        <div className="so-metric">
          <div className="so-metric-top">
            <span className="so-metric-label">Settings categories</span>
            <span className="so-metric-icon">
              <SlidersHorizontal size={17} />
            </span>
          </div>
          <div className="so-metric-value">{allItems.length}</div>
          <div className="so-metric-note">Available configuration areas</div>
        </div>

        <div className="so-metric">
          <div className="so-metric-top">
            <span className="so-metric-label">Settings groups</span>
            <span className="so-metric-icon">
              <Blocks size={17} />
            </span>
          </div>
          <div className="so-metric-value">{settingsGroups.length}</div>
          <div className="so-metric-note">Organized by platform function</div>
        </div>

        <div className="so-metric">
          <div className="so-metric-top">
            <span className="so-metric-label">Implemented pages</span>
            <span className="so-metric-icon">
              <CheckCircle2 size={17} />
            </span>
          </div>
          <div className="so-metric-value">{configuredCount}</div>
          <div className="so-metric-note">
            Pages marked as configured in this UI
          </div>
        </div>

        <div className="so-metric">
          <div className="so-metric-top">
            <span className="so-metric-label">Platform scope</span>
            <span className="so-metric-icon">
              <Server size={17} />
            </span>
          </div>
          <div className="so-metric-value">Admin</div>
          <div className="so-metric-note">ModelNow control workspace</div>
        </div>
      </section>

      <section className="so-toolbar">
        <label className="so-search">
          <Search size={17} color="#94a3b8" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search settings, categories, or descriptions..."
            aria-label="Search settings"
          />
        </label>
        <span className="so-count">
          Showing {visibleCount} of {allItems.length} settings
        </span>
      </section>

      {filteredGroups.length === 0 ? (
        <div className="so-empty">
          <Search size={25} />
          <p>No settings match &quot;{search}&quot;.</p>
          <button
            type="button"
            onClick={() => setSearch("")}
            style={{
              border: 0,
              background: "transparent",
              color: "#4f46e5",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Clear search
          </button>
        </div>
      ) : (
        filteredGroups.map((group) => (
          <section className="so-group" key={group.title}>
            <div className="so-group-heading">
              <div>
                <h2 className="so-group-title">{group.title}</h2>
                <p className="so-group-description">{group.description}</p>
              </div>
              <span className="so-group-count">
                {group.items.length}{" "}
                {group.items.length === 1 ? "setting" : "settings"}
              </span>
            </div>

            <div className="so-grid">
              {group.items.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    href={item.href}
                    className="so-card"
                    key={item.href}
                  >
                    <div className="so-card-top">
                      <span className="so-card-icon">
                        <Icon size={19} />
                      </span>
                      <ArrowRight className="so-card-arrow" size={17} />
                    </div>

                    <h3 className="so-card-title">{item.title}</h3>
                    <p className="so-card-description">{item.description}</p>

                    <div className="so-card-footer">
                      {item.status ? (
                        <span
                          className={`so-status ${
                            item.status === "Configured"
                              ? "so-status-configured"
                              : item.status === "Review recommended"
                                ? "so-status-review"
                                : "so-status-coming"
                          }`}
                        >
                          {item.status === "Configured" ? (
                            <CheckCircle2 size={12} />
                          ) : item.status === "Review recommended" ? (
                            <Clock size={12} />
                          ) : (
                            <CircleHelp size={12} />
                          )}
                          {item.status}
                        </span>
                      ) : (
                        <span className="so-status so-status-coming">
                          <Settings size={12} />
                          Open settings
                        </span>
                      )}
                      <span className="so-open">Open <ArrowRight size={12} /></span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        ))
      )}

      <section className="so-bottom">
        <div className="so-info">
          <div className="so-info-title">
            <ShieldCheck size={19} color="#059669" />
            Security and configuration
          </div>
          <p className="so-info-text">
            Use the security, access control, API, and privacy sections to
            review administrative policies. Production changes should be
            validated and enforced by your backend services, not only by the
            browser interface.
          </p>
          <Link href="/settings/security-settings" className="so-info-link">
            Review security settings <ArrowRight size={14} />
          </Link>
        </div>

        <div className="so-info">
          <div className="so-info-title">
            <Clock size={19} color="#6366f1" />
            Change history
          </div>
          <p className="so-info-text">
            Review configuration changes and administrative activity in the
            Settings Audit Logs section. For production, audit events should
            be recorded on the server with access controls and durable storage.
          </p>
          <Link
            href="/settings/settings-audit-logs"
            className="so-info-link"
          >
            Open audit logs <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    </main>
  );
}
