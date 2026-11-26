
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  Blocks,
  BrainCircuit,
  Building2,
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
  Server,
  Settings,
  Shield,
  SlidersHorizontal,
  Users,
  Wallet,
  Webhook,
  Wrench,
  Zap,
} from "lucide-react";

type SettingsItem = {
  title: string;
  href: string;
  icon: typeof Settings;
};

type SettingsGroup = {
  title: string;
  items: SettingsItem[];
};

const groups: SettingsGroup[] = [
  {
    title: "Platform",
    items: [
      { title: "Overview", href: "/settings/overview", icon: Activity },
      { title: "General Settings", href: "/settings/general-settings", icon: Settings },
      { title: "Platform Configuration", href: "/settings/platform-configuration", icon: MonitorCog },
      { title: "Admin Preferences", href: "/settings/admin-preferences", icon: Palette },
      { title: "System Configuration", href: "/settings/system-configuration", icon: Server },
      { title: "Maintenance Settings", href: "/settings/maintenance-settings", icon: Wrench },
    ],
  },
  {
    title: "Users & Organizations",
    items: [
      { title: "User Settings", href: "/settings/user-settings", icon: Users },
      { title: "Organization Settings", href: "/settings/organization-settings", icon: Building2 },
      { title: "Workspace Settings", href: "/settings/workspace-settings", icon: Blocks },
      { title: "Localization Settings", href: "/settings/localization-settings", icon: Globe },
    ],
  },
  {
    title: "Identity & Security",
    items: [
      { title: "Authentication Settings", href: "/settings/authentication-settings", icon: Fingerprint },
      { title: "Access Control Settings", href: "/settings/access-control-settings", icon: LockKeyhole },
      { title: "Security Settings", href: "/settings/security-settings", icon: Shield },
      { title: "Privacy & Data Settings", href: "/settings/privacy-data-settings", icon: KeyRound },
      { title: "Settings Audit Logs", href: "/settings/settings-audit-logs", icon: FileClock },
    ],
  },
  {
    title: "AI Platform",
    items: [
      { title: "API Settings", href: "/settings/api-settings", icon: Webhook },
      { title: "AI Model Settings", href: "/settings/ai-model-settings", icon: BrainCircuit },
      { title: "AI Provider Settings", href: "/settings/ai-provider-settings", icon: Network },
      { title: "Model Routing Settings", href: "/settings/model-routing-settings", icon: Zap },
      { title: "Usage & Rate Limits", href: "/settings/usage-rate-limits", icon: SlidersHorizontal },
      { title: "Feature Flags", href: "/settings/feature-flags", icon: Flag },
    ],
  },
  {
    title: "Billing & Notifications",
    items: [
      { title: "Billing Settings", href: "/settings/billing-settings", icon: Wallet },
      { title: "Notification Settings", href: "/settings/notification-settings", icon: Bell },
      { title: "Email Settings", href: "/settings/email-settings", icon: Mail },
    ],
  },
  {
    title: "Infrastructure & Integrations",
    items: [
      { title: "Integration Settings", href: "/settings/integration-settings", icon: Blocks },
      { title: "Storage Settings", href: "/settings/storage-settings", icon: Database },
      { title: "Backup & Recovery", href: "/settings/backup-recovery", icon: Cloud },
    ],
  },
];

export default function SettingsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/settings") return pathname === "/settings";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <>
      <style>{`
        .mn-settings-shell {
          display: flex;
          width: 100%;
          min-height: 100vh;
          background: #f7f8fc;
          color: #172033;
          font-family: Inter, Arial, sans-serif;
        }

        .mn-settings-sidebar {
          width: 270px;
          min-width: 270px;
          height: 100vh;
          position: sticky;
          top: 0;
          overflow-y: auto;
          overflow-x: hidden;
          padding: 22px 14px;
          background: #fff;
          border-right: 1px solid #e5eaf1;
        }

        .mn-settings-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 9px 20px;
          border-bottom: 1px solid #edf0f5;
          margin-bottom: 15px;
        }

        .mn-settings-brand-icon {
          width: 35px;
          height: 35px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          color: #315fea;
          background: #edf2ff;
        }

        .mn-settings-brand strong {
          font-size: 15px;
          font-weight: 800;
        }

        .mn-settings-brand small {
          display: block;
          margin-top: 3px;
          color: #8a94a5;
          font-size: 10px;
        }

        .mn-settings-home {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 12px;
          margin-bottom: 19px;
          border: 1px solid #e5eaf1;
          border-radius: 9px;
          color: #475569;
          text-decoration: none;
          font-size: 12px;
          font-weight: 700;
        }

        .mn-settings-home.active {
          color: #315fea;
          background: #edf2ff;
          border-color: #dce5ff;
        }

        .mn-settings-group {
          margin-bottom: 21px;
        }

        .mn-settings-group-title {
          padding: 0 10px;
          margin-bottom: 8px;
          color: #929bad;
          font-size: 9px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .mn-settings-link {
          display: flex;
          align-items: center;
          gap: 9px;
          min-height: 36px;
          padding: 8px 10px;
          margin: 2px 0;
          border-radius: 7px;
          color: #657185;
          text-decoration: none;
          font-size: 11px;
          font-weight: 600;
          transition: background .15s, color .15s;
        }

        .mn-settings-link:hover {
          color: #315fea;
          background: #f4f6fb;
        }

        .mn-settings-link.active {
          color: #315fea;
          background: #edf2ff;
          font-weight: 750;
        }

        .mn-settings-link-icon {
          flex-shrink: 0;
        }

        .mn-settings-link-arrow {
          margin-left: auto;
          flex-shrink: 0;
          opacity: .6;
        }

        .mn-settings-content {
          flex: 1;
          min-width: 0;
          overflow-x: auto;
        }

        @media (max-width: 700px) {
          .mn-settings-shell {
            flex-direction: column;
          }

          .mn-settings-sidebar {
            position: relative;
            width: 100%;
            min-width: 0;
            height: auto;
            max-height: 330px;
            border-right: 0;
            border-bottom: 1px solid #e5eaf1;
          }

          .mn-settings-content {
            width: 100%;
          }
        }
      `}</style>

      <div className="mn-settings-shell">
        <aside className="mn-settings-sidebar">
          <div className="mn-settings-brand">
            <span className="mn-settings-brand-icon">
              <Settings size={19} />
            </span>
            <div>
              <strong>Settings</strong>
              <small>ModelNow Administration</small>
            </div>
          </div>

          <Link
            href="/settings"
            className={`mn-settings-home ${
              isActive("/settings") ? "active" : ""
            }`}
          >
            <Activity size={16} />
            All Settings
            <ChevronRight size={14} style={{ marginLeft: "auto" }} />
          </Link>

          {groups.map((group) => (
            <section className="mn-settings-group" key={group.title}>
              <div className="mn-settings-group-title">{group.title}</div>

              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`mn-settings-link ${active ? "active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <Icon className="mn-settings-link-icon" size={15} />
                    <span>{item.title}</span>
                    {active && (
                      <ChevronRight
                        className="mn-settings-link-arrow"
                        size={13}
                      />
                    )}
                  </Link>
                );
              })}
            </section>
          ))}
        </aside>

        <div className="mn-settings-content">{children}</div>
      </div>
    </>
  );
}
