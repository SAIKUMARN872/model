
"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  Users,
  Activity,
  CreditCard,
  ShieldCheck,
  FolderKanban,
  Settings,
  CalendarDays,
  Mail,
  Globe,
  Pencil,
  Copy,
  ExternalLink,
  KeyRound,
  Zap,
  Database,
  ArrowUpRight,
  X,
  Save,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

type OrganizationStatus = "Active" | "Suspended" | "Pending";
type OrganizationPlan = "Enterprise" | "Business" | "Starter";

type OrganizationProfile = {
  id: string;
  name: string;
  domain: string;
  owner: string;
  plan: OrganizationPlan;
  status: OrganizationStatus;
  members: number;
  projects: number;
  apiKeys: number;
  requests: number;
  monthlyLimit: number;
  createdAt: string;
  renewalDate: string;
  description: string;
};

const initialProfile: OrganizationProfile = {
  id: "ORG-1001",
  name: "Acme Corporation",
  domain: "acme.com",
  owner: "admin@acme.com",
  plan: "Enterprise",
  status: "Active",
  members: 248,
  projects: 18,
  apiKeys: 12,
  requests: 782400,
  monthlyLimit: 1000000,
  createdAt: "October 12, 2026",
  renewalDate: "November 12, 2026",
  description:
    "Enterprise AI workspace for model access, team collaboration, and workflow automation.",
};

// Explicit locale prevents server/client number-formatting differences.
const numberFormat = new Intl.NumberFormat("en-US");

function formatNumber(value: number) {
  return numberFormat.format(value);
}

const statusStyles: Record<OrganizationStatus, string> = {
  Active: "od-status-active",
  Suspended: "od-status-suspended",
  Pending: "od-status-pending",
};

const planStyles: Record<OrganizationPlan, string> = {
  Enterprise: "od-plan-enterprise",
  Business: "od-plan-business",
  Starter: "od-plan-starter",
};

const shortcuts = [
  {
    title: "Members",
    description: "Review users and access",
    href: "/organizations/organization-members",
    icon: Users,
  },
  {
    title: "Teams & Departments",
    description: "Manage teams and departments",
    href: "/organizations/teams-departments",
    icon: Building2,
  },
  {
    title: "Usage",
    description: "Review request consumption",
    href: "/organizations/usage",
    icon: Activity,
  },
  {
    title: "Billing",
    description: "Plan and renewal information",
    href: "/organizations/billing",
    icon: CreditCard,
  },
  {
    title: "API & Projects",
    description: "Projects and API credentials",
    href: "/organizations/api-projects",
    icon: FolderKanban,
  },
  {
    title: "Security",
    description: "Organization security controls",
    href: "/organizations/security",
    icon: ShieldCheck,
  },
  {
    title: "Activity",
    description: "Review organization events",
    href: "/organizations/activity",
    icon: Activity,
  },
  {
    title: "Settings",
    description: "Organization configuration",
    href: "/organizations/settings",
    icon: Settings,
  },
];

export default function OrganizationDetailsPage() {
  const [organization, setOrganization] =
    useState<OrganizationProfile>(initialProfile);
  const [form, setForm] =
    useState<OrganizationProfile>(initialProfile);
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);

  const usagePercentage = Math.min(
    100,
    Math.round(
      (organization.requests /
        Math.max(organization.monthlyLimit, 1)) *
        100
    )
  );

  function notify(message: string) {
    setNotice(message);
  }

  function startEditing() {
    setForm({ ...organization });
    setEditing(true);
    setNotice("");
  }

  function saveChanges() {
    if (
      !form.name.trim() ||
      !form.owner.trim() ||
      !form.domain.trim()
    ) {
      notify("Organization name, owner email, and domain are required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.owner.trim())) {
      notify("Enter a valid owner email address.");
      return;
    }

    setOrganization({
      ...form,
      name: form.name.trim(),
      owner: form.owner.trim(),
      domain: form.domain.trim(),
      description: form.description.trim(),
    });

    setEditing(false);
    notify("Organization profile updated in this preview.");
  }

  async function copyOrganizationId() {
    try {
      await navigator.clipboard.writeText(organization.id);
      setCopied(true);
      notify("Organization ID copied.");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      notify(`Copy failed. Organization ID: ${organization.id}`);
    }
  }

  function toggleOrganizationStatus() {
    const nextStatus: OrganizationStatus =
      organization.status === "Active" ? "Suspended" : "Active";

    setOrganization((current) => ({
      ...current,
      status: nextStatus,
    }));

    notify(`Organization status changed to ${nextStatus}.`);
  }

  const metrics = [
    {
      label: "Organization members",
      value: formatNumber(organization.members),
      note: "Total registered members",
      icon: Users,
      color: "od-icon-blue",
    },
    {
      label: "Projects",
      value: formatNumber(organization.projects),
      note: "Organization projects",
      icon: FolderKanban,
      color: "od-icon-purple",
    },
    {
      label: "API keys",
      value: formatNumber(organization.apiKeys),
      note: "Configured credentials",
      icon: KeyRound,
      color: "od-icon-amber",
    },
    {
      label: "Requests this month",
      value: formatNumber(organization.requests),
      note: "Illustrative usage metric",
      icon: Zap,
      color: "od-icon-green",
    },
  ];

  return (
    <main className="od-page">
      <style>{`
        .od-page {
          min-height: 100vh;
          padding: 28px;
          background: #f5f7fb;
          color: #172033;
          font-family: Arial, Helvetica, sans-serif;
        }
        .od-container { max-width: 1500px; margin: 0 auto; }
        .od-stack { display: grid; gap: 22px; }
        .od-topbar, .od-actions, .od-inline, .od-heading,
        .od-card-heading, .od-stat-top, .od-row, .od-modal-header,
        .od-modal-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .od-topbar { flex-wrap: wrap; }
        .od-actions { flex-wrap: wrap; }
        .od-link-back { color: #536176; text-decoration: none; font-size: 14px; }
        .od-link-back:hover, .od-link:hover { color: #245ce5; }
        .od-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 13px;
          border: 1px solid #dce3ee;
          border-radius: 9px;
          background: #fff;
          color: #253047;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
        }
        .od-button:hover { background: #f8fafc; }
        .od-button-primary { background: #245ce5; color: white; border-color: #245ce5; }
        .od-button-primary:hover { background: #1749c4; }
        .od-panel { background: white; border: 1px solid #e1e7f0; border-radius: 15px; box-shadow: 0 2px 7px rgba(22,34,56,.025); }
        .od-hero { overflow: hidden; }
        .od-hero-stripe { height: 5px; background: linear-gradient(90deg,#2563eb,#6366f1,#8b5cf6); }
        .od-hero-content { padding: 26px; }
        .od-heading { justify-content: flex-start; align-items: flex-start; }
        .od-logo {
          display: flex; width: 62px; height: 62px; flex: 0 0 62px;
          align-items: center; justify-content: center; border-radius: 15px;
          background: #edf4ff; color: #245ce5;
        }
        .od-title { margin: 0; font-size: clamp(23px,3vw,31px); letter-spacing: -.7px; overflow-wrap: anywhere; }
        .od-subtitle { margin: 8px 0 0; color: #718096; font-size: 13px; }
        .od-meta { display: flex; flex-wrap: wrap; gap: 14px; margin-top: 15px; color: #617087; font-size: 12px; }
        .od-meta span { display: inline-flex; align-items: center; gap: 6px; }
        .od-status, .od-plan { display: inline-flex; align-items: center; border-radius: 999px; padding: 6px 10px; font-size: 11px; font-weight: 700; white-space: nowrap; }
        .od-status-active { color: #047857; background: #dff8ed; }
        .od-status-suspended { color: #b91c1c; background: #fee2e2; }
        .od-status-pending { color: #92400e; background: #fef3c7; }
        .od-plan { border-radius: 8px; }
        .od-plan-enterprise { color: #6d28d9; background: #f1eaff; }
        .od-plan-business { color: #1d4ed8; background: #e8f1ff; }
        .od-plan-starter { color: #475569; background: #eef2f7; }
        .od-description { margin: 22px 0 0; max-width: 850px; color: #5d6b80; font-size: 13px; line-height: 1.8; }
        .od-notice { padding: 13px 15px; border: 1px solid #cfe0ff; border-radius: 10px; background: #edf5ff; color: #214a91; font-size: 12px; line-height: 1.7; }
        .od-notice-error { border-color: #fecaca; background: #fff1f2; color: #9f1239; }
        .od-stats { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 15px; }
        .od-stat { padding: 19px; }
        .od-stat-top { align-items: flex-start; }
        .od-stat-label { margin: 0; color: #64748b; font-size: 12px; line-height: 1.5; }
        .od-stat-value { margin-top: 17px; font-size: 25px; font-weight: 750; letter-spacing: -.5px; overflow-wrap: anywhere; }
        .od-stat-note { margin-top: 7px; color: #94a3b8; font-size: 11px; }
        .od-icon-box { display: flex; width: 40px; height: 40px; flex: 0 0 40px; align-items: center; justify-content: center; border-radius: 11px; }
        .od-icon-blue { background: #eaf2ff; color: #2563eb; }
        .od-icon-purple { background: #f1eaff; color: #7c3aed; }
        .od-icon-amber { background: #fff4dc; color: #b77909; }
        .od-icon-green { background: #e2f9ed; color: #059669; }
        .od-columns { display: grid; grid-template-columns: minmax(0,2fr) minmax(280px,1fr); gap: 20px; }
        .od-section { padding: 22px; min-width: 0; }
        .od-card-title { margin: 0; font-size: 17px; font-weight: 750; }
        .od-card-description { margin: 6px 0 0; color: #8490a3; font-size: 12px; }
        .od-usage-numbers { display: flex; align-items: flex-end; justify-content: space-between; flex-wrap: wrap; gap: 12px; margin-top: 25px; }
        .od-usage-percent { font-size: 32px; font-weight: 750; }
        .od-usage-caption { margin-top: 5px; color: #8490a3; font-size: 12px; }
        .od-usage-total { color: #64748b; font-size: 12px; }
        .od-progress { height: 10px; margin-top: 15px; overflow: hidden; border-radius: 999px; background: #edf1f7; }
        .od-progress-fill { height: 100%; border-radius: inherit; transition: width .2s ease; }
        .od-small-note { display: flex; align-items: center; gap: 7px; margin-top: 16px; color: #8995a7; font-size: 11px; line-height: 1.6; }
        .od-link { display: inline-flex; align-items: center; gap: 5px; margin-top: 17px; color: #245ce5; font-size: 12px; font-weight: 700; text-decoration: none; }
        .od-subscription { margin-top: 20px; padding: 17px; border: 1px solid #e7ddff; border-radius: 12px; background: #f7f3ff; }
        .od-sub-label { color: #6d4ab1; font-size: 12px; }
        .od-sub-plan { margin-top: 8px; color: #38216b; font-size: 24px; font-weight: 750; }
        .od-sub-note { margin-top: 7px; color: #765da5; font-size: 12px; }
        .od-detail-row { display: flex; align-items: flex-start; gap: 12px; margin-top: 20px; color: #64748b; }
        .od-detail-row svg { margin-top: 2px; flex: 0 0 auto; }
        .od-detail-label { color: #94a3b8; font-size: 11px; }
        .od-detail-value { margin-top: 5px; color: #273449; font-size: 12px; font-weight: 650; overflow-wrap: anywhere; }
        .od-section-heading { margin-bottom: 14px; }
        .od-section-heading h2 { margin: 0; font-size: 18px; }
        .od-section-heading p { margin: 6px 0 0; color: #8490a3; font-size: 12px; }
        .od-shortcuts { display: grid; grid-template-columns: repeat(4,minmax(0,1fr)); gap: 13px; }
        .od-shortcut { display: flex; min-width: 0; align-items: flex-start; gap: 11px; padding: 16px; border: 1px solid #e1e7f0; border-radius: 12px; background: white; color: inherit; text-decoration: none; transition: border-color .15s,box-shadow .15s; }
        .od-shortcut:hover { border-color: #b8ccff; box-shadow: 0 4px 12px rgba(37,99,235,.06); }
        .od-shortcut-icon { display: flex; flex: 0 0 36px; width: 36px; height: 36px; align-items: center; justify-content: center; border-radius: 9px; background: #f0f3f8; color: #5c6c83; }
        .od-shortcut-content { flex: 1; min-width: 0; }
        .od-shortcut-title { font-size: 12px; font-weight: 750; }
        .od-shortcut-description { margin-top: 6px; color: #8490a3; font-size: 11px; line-height: 1.6; }
        .od-shortcut-arrow { flex: 0 0 auto; color: #9aa6b7; }
        .od-control-row { display: flex; align-items: center; justify-content: space-between; gap: 15px; padding: 17px 0; border-bottom: 1px solid #eef1f6; }
        .od-control-row:last-child { border-bottom: 0; padding-bottom: 0; }
        .od-control-label { font-size: 13px; font-weight: 700; }
        .od-control-description { margin-top: 5px; color: #8490a3; font-size: 12px; line-height: 1.6; }
        .od-modal-overlay { position: fixed; z-index: 100; inset: 0; display: flex; align-items: center; justify-content: center; overflow-y: auto; padding: 20px; background: rgba(15,23,42,.58); }
        .od-modal { width: 100%; max-width: 570px; max-height: calc(100vh - 40px); overflow-y: auto; border-radius: 16px; background: white; box-shadow: 0 24px 80px rgba(15,23,42,.25); }
        .od-modal-header { padding: 20px 22px; border-bottom: 1px solid #edf0f5; }
        .od-modal-header h2 { margin: 0; font-size: 19px; }
        .od-modal-header p { margin: 6px 0 0; color: #8490a3; font-size: 12px; line-height: 1.6; }
        .od-icon-button { display: flex; align-items: center; justify-content: center; width: 34px; height: 34px; border: 0; border-radius: 8px; background: #f1f4f8; cursor: pointer; }
        .od-form { display: grid; gap: 16px; padding: 22px; }
        .od-field { display: grid; gap: 7px; color: #334155; font-size: 12px; font-weight: 700; }
        .od-input, .od-select, .od-textarea { width: 100%; box-sizing: border-box; border: 1px solid #dce3ee; border-radius: 9px; padding: 11px 12px; background: white; color: #172033; font: inherit; font-size: 13px; outline: none; }
        .od-input:focus, .od-select:focus, .od-textarea:focus { border-color: #4c7cf0; box-shadow: 0 0 0 3px rgba(37,99,235,.1); }
        .od-textarea { min-height: 95px; resize: vertical; }
        .od-modal-footer { justify-content: flex-end; padding: 16px 22px; border-top: 1px solid #edf0f5; }
        .od-footer { padding-top: 16px; border-top: 1px solid #e1e7f0; color: #98a2b3; font-size: 11px; }
        @media (max-width: 1100px) {
          .od-stats { grid-template-columns: repeat(2,minmax(0,1fr)); }
          .od-shortcuts { grid-template-columns: repeat(2,minmax(0,1fr)); }
        }
        @media (max-width: 760px) {
          .od-page { padding: 15px; }
          .od-columns { grid-template-columns: 1fr; }
          .od-hero-content { padding: 19px; }
          .od-section { padding: 17px; }
          .od-heading { gap: 12px; }
          .od-logo { width: 48px; height: 48px; flex-basis: 48px; }
          .od-logo svg { width: 25px; }
        }
        @media (max-width: 480px) {
          .od-stats, .od-shortcuts { grid-template-columns: 1fr; }
          .od-title { font-size: 23px; }
          .od-topbar { align-items: flex-start; }
          .od-actions { width: 100%; }
          .od-actions .od-button { flex: 1; }
          .od-meta { flex-direction: column; gap: 9px; }
          .od-control-row { align-items: flex-start; }
        }
      `}</style>

      <div className="od-container od-stack">
        <div className="od-topbar">
          <Link
            href="/organizations/all-organizations"
            className="od-link-back"
          >
            <span className="od-inline" style={{ justifyContent: "flex-start" }}>
              <ArrowLeft size={16} />
              Back to all organizations
            </span>
          </Link>

          <div className="od-actions">
            <button
              type="button"
              className="od-button"
              onClick={copyOrganizationId}
            >
              <Copy size={15} />
              {copied ? "Copied ID" : "Copy organization ID"}
            </button>
            <button
              type="button"
              className="od-button od-button-primary"
              onClick={startEditing}
            >
              <Pencil size={15} />
              Edit profile
            </button>
          </div>
        </div>

        {notice && (
          <div
            role="status"
            className={`od-notice ${
              notice.includes("required") ||
              notice.includes("valid") ||
              notice.includes("failed")
                ? "od-notice-error"
                : ""
            }`}
          >
            {notice}
          </div>
        )}

        <section className="od-panel od-hero">
          <div className="od-hero-stripe" />
          <div className="od-hero-content">
            <div className="od-topbar">
              <div className="od-heading">
                <div className="od-logo">
                  <Building2 size={30} />
                </div>
                <div>
                  <div className="od-inline" style={{ justifyContent: "flex-start", flexWrap: "wrap" }}>
                    <h1 className="od-title">{organization.name}</h1>
                    <span className={`od-status ${statusStyles[organization.status]}`}>
                      {organization.status}
                    </span>
                  </div>
                  <p className="od-subtitle">Organization profile and administration</p>
                  <div className="od-meta">
                    <span><Building2 size={14} />{organization.id}</span>
                    <span><Globe size={14} />{organization.domain}</span>
                    <span><CalendarDays size={14} />Created {organization.createdAt}</span>
                  </div>
                </div>
              </div>

              <div className="od-actions">
                <span className={`od-plan ${planStyles[organization.plan]}`}>
                  {organization.plan} plan
                </span>
                <button type="button" className="od-button" onClick={toggleOrganizationStatus}>
                  {organization.status === "Active" ? "Suspend organization" : "Activate organization"}
                </button>
              </div>
            </div>

            <p className="od-description">
              {organization.description || "No organization description."}
            </p>
          </div>
        </section>

        <div className="od-notice">
          <strong>Preview data:</strong> This page displays a sample organization.
          Edits and status changes are held in page state only and are not saved to a backend.
        </div>

        <section className="od-stats" aria-label="Organization metrics">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <article className="od-panel od-stat" key={metric.label}>
                <div className="od-stat-top">
                  <p className="od-stat-label">{metric.label}</p>
                  <span className={`od-icon-box ${metric.color}`}>
                    <Icon size={19} />
                  </span>
                </div>
                <div className="od-stat-value">{metric.value}</div>
                <p className="od-stat-note">{metric.note}</p>
              </article>
            );
          })}
        </section>

        <div className="od-columns">
          <section className="od-panel od-section">
            <div className="od-card-heading">
              <div>
                <h2 className="od-card-title">Organization usage</h2>
                <p className="od-card-description">Monthly request consumption</p>
              </div>
              <Activity size={21} color="#2563eb" />
            </div>

            <div className="od-usage-numbers">
              <div>
                <div className="od-usage-percent">{usagePercentage}%</div>
                <div className="od-usage-caption">Monthly limit used</div>
              </div>
              <div className="od-usage-total">
                {formatNumber(organization.requests)} / {formatNumber(organization.monthlyLimit)} requests
              </div>
            </div>

            <div
              className="od-progress"
              role="progressbar"
              aria-label="Monthly request usage"
              aria-valuenow={usagePercentage}
              aria-valuemin={0}
              aria-valuemax={100}
            >
              <div
                className="od-progress-fill"
                style={{
                  width: `${usagePercentage}%`,
                  background: usagePercentage >= 90 ? "#d97706" : "#2563eb",
                }}
              />
            </div>

            <div className="od-small-note">
              <Database size={15} />
              Usage values are illustrative until connected to live telemetry.
            </div>

            <Link href="/organizations/usage" className="od-link">
              View detailed usage <ArrowUpRight size={15} />
            </Link>
          </section>

          <section className="od-panel od-section">
            <h2 className="od-card-title">Subscription</h2>
            <p className="od-card-description">Current plan information</p>

            <div className="od-subscription">
              <div className="od-sub-label">Current plan</div>
              <div className="od-sub-plan">{organization.plan}</div>
              <div className="od-sub-note">Organization subscription</div>
            </div>

            <div className="od-detail-row">
              <CalendarDays size={17} />
              <div>
                <div className="od-detail-label">Next renewal</div>
                <div className="od-detail-value">{organization.renewalDate}</div>
              </div>
            </div>

            <div className="od-detail-row">
              <CreditCard size={17} />
              <div>
                <div className="od-detail-label">Billing status</div>
                <div className="od-detail-value">Not connected</div>
              </div>
            </div>

            <Link href="/organizations/billing" className="od-link">
              Open billing <ArrowUpRight size={15} />
            </Link>
          </section>
        </div>

        <section>
          <div className="od-section-heading">
            <h2>Management shortcuts</h2>
            <p>Access organization administration areas.</p>
          </div>

          <div className="od-shortcuts">
            {shortcuts.map((shortcut) => {
              const Icon = shortcut.icon;
              return (
                <Link
                  key={shortcut.href}
                  href={shortcut.href}
                  className="od-shortcut"
                >
                  <span className="od-shortcut-icon"><Icon size={18} /></span>
                  <span className="od-shortcut-content">
                    <span className="od-shortcut-title">{shortcut.title}</span>
                    <span className="od-shortcut-description">{shortcut.description}</span>
                  </span>
                  <ArrowUpRight className="od-shortcut-arrow" size={15} />
                </Link>
              );
            })}
          </div>
        </section>

        <section className="od-panel od-section">
          <div className="od-card-heading">
            <div className="od-inline" style={{ justifyContent: "flex-start" }}>
              <ShieldCheck size={21} color="#059669" />
              <h2 className="od-card-title">Organization controls</h2>
            </div>
          </div>

          <div className="od-control-row">
            <div>
              <div className="od-control-label">Organization access</div>
              <div className="od-control-description">Current account status</div>
            </div>
            <span className={`od-status ${statusStyles[organization.status]}`}>
              {organization.status}
            </span>
          </div>

          <div className="od-control-row">
            <div>
              <div className="od-control-label">Organization owner</div>
              <div className="od-control-description">{organization.owner}</div>
            </div>
            <Mail size={18} color="#94a3b8" />
          </div>

          <div className="od-control-row">
            <div>
              <div className="od-control-label">Security settings</div>
              <div className="od-control-description">
                Review authentication and access policies
              </div>
            </div>
            <Link href="/organizations/security" className="od-link" style={{ marginTop: 0 }}>
              Review <ExternalLink size={14} />
            </Link>
          </div>
        </section>

        {editing && (
          <div
            className="od-modal-overlay"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setEditing(false);
            }}
          >
            <section
              role="dialog"
              aria-modal="true"
              aria-labelledby="od-edit-title"
              className="od-modal"
            >
              <div className="od-modal-header">
                <div>
                  <h2 id="od-edit-title">Edit organization profile</h2>
                  <p>Update the displayed organization information.</p>
                </div>
                <button
                  type="button"
                  className="od-icon-button"
                  aria-label="Close edit form"
                  onClick={() => setEditing(false)}
                >
                  <X size={18} />
                </button>
              </div>

              <form
                className="od-form"
                onSubmit={(event) => {
                  event.preventDefault();
                  saveChanges();
                }}
              >
                <label className="od-field">
                  Organization name
                  <input
                    className="od-input"
                    value={form.name}
                    onChange={(event) =>
                      setForm({ ...form, name: event.target.value })
                    }
                    required
                  />
                </label>

                <label className="od-field">
                  Owner email
                  <input
                    className="od-input"
                    type="email"
                    value={form.owner}
                    onChange={(event) =>
                      setForm({ ...form, owner: event.target.value })
                    }
                    required
                  />
                </label>

                <label className="od-field">
                  Domain
                  <input
                    className="od-input"
                    value={form.domain}
                    onChange={(event) =>
                      setForm({ ...form, domain: event.target.value })
                    }
                    required
                  />
                </label>

                <label className="od-field">
                  Plan
                  <select
                    className="od-select"
                    value={form.plan}
                    onChange={(event) =>
                      setForm({
                        ...form,
                        plan: event.target.value as OrganizationPlan,
                      })
                    }
                  >
                    <option value="Starter">Starter</option>
                    <option value="Business">Business</option>
                    <option value="Enterprise">Enterprise</option>
                  </select>
                </label>

                <label className="od-field">
                  Description
                  <textarea
                    className="od-textarea"
                    value={form.description}
                    onChange={(event) =>
                      setForm({ ...form, description: event.target.value })
                    }
                  />
                </label>

                <div className="od-modal-footer" style={{ padding: "14px 0 0" }}>
                  <button
                    type="button"
                    className="od-button"
                    onClick={() => setEditing(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="od-button od-button-primary">
                    <Save size={15} />
                    Save profile
                  </button>
                </div>
              </form>
            </section>
          </div>
        )}

        <footer className="od-footer">
          ModelNow Admin · Organization Details · Frontend preview
        </footer>
      </div>
    </main>
  );
}
