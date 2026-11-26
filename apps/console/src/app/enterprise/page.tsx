
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Activity,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  FileCheck2,
  KeyRound,
  LockKeyhole,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  X,
  Zap,
} from "lucide-react";

type Capability = {
  title: string;
  description: string;
  category: string;
  href: string;
  icon: React.ElementType;
  keywords: string;
};

type CapabilityGroup = {
  title: string;
  description: string;
  icon: React.ElementType;
  category: string;
  capabilities: Capability[];
};

const groups: CapabilityGroup[] = [
  {
    title: "Identity and access",
    description:
      "Manage authentication, organization membership, and authorization boundaries.",
    icon: KeyRound,
    category: "Identity and access",
    capabilities: [
      {
        title: "Single sign-on",
        description: "Configure identity providers and review SSO readiness.",
        category: "Identity and access",
        href: "/enterprise/sso",
        icon: LockKeyhole,
        keywords: "sso saml oidc identity provider authentication login",
      },
      {
        title: "Role-based access",
        description: "Manage roles, permissions, and authorization policies.",
        category: "Identity and access",
        href: "/enterprise/rbac",
        icon: Users,
        keywords: "rbac roles permissions access authorization users",
      },
      {
        title: "Security controls",
        description: "Review authentication controls and security configuration.",
        category: "Identity and access",
        href: "/enterprise/security",
        icon: ShieldCheck,
        keywords: "security protection controls authentication",
      },
    ],
  },
  {
    title: "Governance and assurance",
    description:
      "Review policy ownership, audit evidence, compliance controls, and remediation.",
    icon: ShieldCheck,
    category: "Governance and assurance",
    capabilities: [
      {
        title: "AI governance",
        description: "Manage policy inventory, ownership, and review workflows.",
        category: "Governance and assurance",
        href: "/enterprise/governance",
        icon: BookOpen,
        keywords: "ai governance policies inventory ownership reviews",
      },
      {
        title: "Audit trail",
        description: "Inspect administrative events and investigation records.",
        category: "Governance and assurance",
        href: "/enterprise/audit",
        icon: ClipboardList,
        keywords: "audit logs events activity investigation records",
      },
      {
        title: "Compliance controls",
        description: "Track control evidence, assessments, and remediation.",
        category: "Governance and assurance",
        href: "/enterprise/compliance",
        icon: FileCheck2,
        keywords: "compliance evidence assessment framework remediation",
      },
    ],
  },
  {
    title: "Service operations",
    description:
      "Inspect service objectives, platform consumption, and available request records.",
    icon: Activity,
    category: "Service operations",
    capabilities: [
      {
        title: "Service level agreements",
        description: "Review service objectives, availability, and error budgets.",
        category: "Service operations",
        href: "/enterprise/sla",
        icon: Zap,
        keywords: "sla service level availability latency error budget",
      },
      {
        title: "Usage and limits",
        description: "Monitor consumption, quotas, and usage visibility.",
        category: "Service operations",
        href: "/usage",
        icon: Activity,
        keywords: "usage limits quota tokens consumption analytics",
      },
      {
        title: "Request logs",
        description: "Review application events and available request records.",
        category: "Service operations",
        href: "/logs",
        icon: ClipboardList,
        keywords: "logs requests application events records",
      },
    ],
  },
];

const allCapabilities = groups.flatMap((group) => group.capabilities);

const requirements = [
  {
    title: "Tenant isolation",
    description:
      "Organization data, configuration, and access boundaries must be enforced by the backend.",
  },
  {
    title: "Least privilege",
    description:
      "Users and service accounts should receive only the permissions required for their responsibilities.",
  },
  {
    title: "Traceable changes",
    description:
      "Administrative actions should be attributable and recorded in an auditable event history.",
  },
  {
    title: "Verified integrations",
    description:
      "Identity providers, security controls, and monitoring integrations should expose verified connection states.",
  },
];

export default function EnterprisePage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All areas");

  const filteredCapabilities = useMemo(() => {
    const query = search.trim().toLowerCase();

    return allCapabilities.filter((item) => {
      const matchesCategory =
        category === "All areas" || item.category === category;

      const searchableText =
        `${item.title} ${item.description} ${item.category} ${item.keywords}`.toLowerCase();

      const matchesSearch = !query || searchableText.includes(query);

      return matchesCategory && matchesSearch;
    });
  }, [search, category]);

  const visibleGroups = groups
    .map((group) => ({
      ...group,
      capabilities: group.capabilities.filter((item) =>
        filteredCapabilities.some((filtered) => filtered.href === item.href)
      ),
    }))
    .filter((group) => group.capabilities.length > 0);

  const clearFilters = () => {
    setSearch("");
    setCategory("All areas");
  };

  return (
    <main className="enterprise-page">
      <style>{`
        .enterprise-page {
          --ent-text: #111827;
          --ent-muted: #64748b;
          --ent-border: #e5e7eb;
          --ent-primary: #315fea;
          --ent-surface: #ffffff;
          width: 100%;
          min-height: 100%;
          padding: 30px;
          color: var(--ent-text);
          background: #f8fafc;
        }

        .ent-container {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
        }

        .ent-eyebrow {
          margin: 0 0 9px;
          color: #64748b;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.2px;
          text-transform: uppercase;
        }

        .ent-heading-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .ent-heading-row h1 {
          margin: 0;
          color: #111827;
          font-size: 28px;
          font-weight: 750;
          letter-spacing: -0.8px;
        }

        .ent-subtitle {
          margin: 9px 0 0;
          color: var(--ent-muted);
          font-size: 14px;
          line-height: 1.6;
        }

        .ent-count {
          flex-shrink: 0;
          padding: 8px 12px;
          border: 1px solid var(--ent-border);
          border-radius: 8px;
          background: #fff;
          color: #475569;
          font-size: 12px;
          font-weight: 650;
        }

        .ent-toolbar {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 17px;
          margin-bottom: 28px;
          border: 1px solid var(--ent-border);
          border-radius: 12px;
          background: #fff;
        }

        .ent-search {
          position: relative;
          flex: 1;
          min-width: 180px;
        }

        .ent-search-icon {
          position: absolute;
          top: 50%;
          left: 13px;
          width: 18px;
          height: 18px;
          color: #94a3b8;
          transform: translateY(-50%);
          pointer-events: none;
        }

        .ent-search input {
          width: 100%;
          height: 44px;
          padding: 0 42px;
          border: 1px solid #dfe3ea;
          border-radius: 8px;
          outline: none;
          background: #fff;
          color: #111827;
          font-size: 13px;
          transition: border-color .18s, box-shadow .18s;
        }

        .ent-search input:focus {
          border-color: var(--ent-primary);
          box-shadow: 0 0 0 3px rgba(49,95,234,.10);
        }

        .ent-search input::placeholder {
          color: #94a3b8;
        }

        .ent-clear {
          position: absolute;
          top: 50%;
          right: 12px;
          display: grid;
          width: 24px;
          height: 24px;
          place-items: center;
          border: 0;
          border-radius: 5px;
          background: transparent;
          color: #64748b;
          cursor: pointer;
          transform: translateY(-50%);
        }

        .ent-clear:hover {
          background: #f1f5f9;
        }

        .ent-filter {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .ent-filter label {
          color: #475569;
          font-size: 12px;
          font-weight: 650;
        }

        .ent-filter select {
          width: 210px;
          height: 44px;
          padding: 0 35px 0 12px;
          border: 1px solid #dfe3ea;
          border-radius: 8px;
          outline: none;
          background: #fff;
          color: #1f2937;
          font-size: 13px;
          cursor: pointer;
        }

        .ent-filter select:focus {
          border-color: var(--ent-primary);
          box-shadow: 0 0 0 3px rgba(49,95,234,.10);
        }

        .ent-groups {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 20px;
          align-items: start;
        }

        .ent-group {
          min-width: 0;
          padding: 20px;
          border: 1px solid var(--ent-border);
          border-radius: 13px;
          background: #fff;
        }

        .ent-group-header {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          margin-bottom: 18px;
        }

        .ent-group-icon {
          display: grid;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          place-items: center;
          border: 1px solid #e4eaff;
          border-radius: 10px;
          background: #f3f6ff;
          color: var(--ent-primary);
        }

        .ent-group-header h2 {
          margin: 1px 0 5px;
          color: #111827;
          font-size: 15px;
          font-weight: 750;
        }

        .ent-group-header p {
          margin: 0;
          color: #64748b;
          font-size: 12px;
          line-height: 1.55;
        }

        .ent-capability-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .ent-capability {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          padding: 13px;
          border: 1px solid #e9edf3;
          border-radius: 9px;
          background: #fff;
          color: inherit;
          text-decoration: none;
          transition: border-color .18s, background .18s, transform .18s, box-shadow .18s;
        }

        .ent-capability:hover {
          border-color: #b9c9ff;
          background: #f8faff;
          box-shadow: 0 4px 14px rgba(15,23,42,.045);
          transform: translateY(-1px);
        }

        .ent-capability:focus-visible {
          outline: 3px solid rgba(49,95,234,.22);
          outline-offset: 2px;
        }

        .ent-capability-icon {
          display: grid;
          width: 36px;
          height: 36px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 8px;
          background: #f1f5f9;
          color: #475569;
        }

        .ent-capability-content {
          flex: 1;
          min-width: 0;
        }

        .ent-capability-content h3 {
          margin: 0 0 4px;
          color: #1e293b;
          font-size: 13px;
          font-weight: 750;
          line-height: 1.4;
        }

        .ent-capability-content p {
          margin: 0;
          color: #64748b;
          font-size: 11px;
          line-height: 1.55;
        }

        .ent-capability-arrow {
          display: grid;
          width: 28px;
          height: 28px;
          flex-shrink: 0;
          place-items: center;
          border-radius: 7px;
          color: #94a3b8;
          transition: background .18s, color .18s, transform .18s;
        }

        .ent-capability:hover .ent-capability-arrow {
          background: #eaf0ff;
          color: var(--ent-primary);
          transform: translateX(2px);
        }

        .ent-empty {
          padding: 55px 20px;
          border: 1px dashed #cbd5e1;
          border-radius: 12px;
          background: #fff;
          text-align: center;
        }

        .ent-empty-icon {
          display: grid;
          width: 44px;
          height: 44px;
          margin: 0 auto 12px;
          place-items: center;
          border-radius: 12px;
          background: #f1f5f9;
          color: #64748b;
        }

        .ent-empty h3 {
          margin: 0 0 6px;
          font-size: 15px;
          font-weight: 750;
        }

        .ent-empty p {
          margin: 0 0 16px;
          color: #64748b;
          font-size: 13px;
        }

        .ent-reset-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          min-height: 36px;
          padding: 0 13px;
          border: 1px solid #dbe3f2;
          border-radius: 7px;
          background: #fff;
          color: #315fea;
          font-size: 12px;
          font-weight: 700;
          cursor: pointer;
        }

        .ent-reset-button:hover {
          background: #f5f7ff;
        }

        .ent-foundation {
          margin-top: 30px;
          padding: 22px;
          border: 1px solid var(--ent-border);
          border-radius: 12px;
          background: #fff;
        }

        .ent-foundation-heading {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 17px;
        }

        .ent-foundation-heading > div:first-child {
          flex: 1;
        }

        .ent-foundation-heading h2 {
          margin: 0;
          font-size: 19px;
          font-weight: 750;
          letter-spacing: -.3px;
        }

        .ent-foundation-heading p {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 12px;
        }

        .ent-requirements {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
        }

        .ent-requirement {
          padding: 15px;
          border: 1px solid #e9edf3;
          border-radius: 9px;
          background: #fafbfc;
        }

        .ent-requirement-icon {
          margin-bottom: 10px;
          color: #315fea;
        }

        .ent-requirement h3 {
          margin: 0 0 6px;
          font-size: 12px;
          font-weight: 750;
        }

        .ent-requirement p {
          margin: 0;
          color: #64748b;
          font-size: 11px;
          line-height: 1.6;
        }

        .ent-note {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 17px;
          padding: 13px 15px;
          border: 1px solid #dbeafe;
          border-radius: 9px;
          background: #f5f9ff;
          color: #475569;
          font-size: 11px;
          line-height: 1.6;
        }

        .ent-note svg {
          flex-shrink: 0;
          margin-top: 1px;
          color: #315fea;
        }

        @media (max-width: 1100px) {
          .ent-groups {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .ent-requirements {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 700px) {
          .enterprise-page {
            padding: 18px 14px;
          }

          .ent-heading-row {
            align-items: flex-start;
            flex-direction: column;
            gap: 12px;
          }

          .ent-heading-row h1 {
            font-size: 23px;
          }

          .ent-toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .ent-filter {
            align-items: flex-start;
            flex-direction: column;
            gap: 7px;
          }

          .ent-filter select {
            width: 100%;
          }

          .ent-groups {
            grid-template-columns: 1fr;
          }

          .ent-requirements {
            grid-template-columns: 1fr;
          }

          .ent-foundation {
            padding: 16px;
          }
        }
      `}</style>

      <div className="ent-container">
        <div className="ent-heading-row">
          <div>
            <p className="ent-eyebrow">Control center</p>
            <h1>Enterprise capabilities</h1>
            <p className="ent-subtitle">
              Access and review the configuration areas available to your organization.
            </p>
          </div>

          <div className="ent-count" aria-live="polite">
            {filteredCapabilities.length} of {allCapabilities.length} capabilities
          </div>
        </div>

        <section className="ent-toolbar" aria-label="Search and filter capabilities">
          <div className="ent-search">
            <Search className="ent-search-icon" aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search enterprise capabilities..."
              aria-label="Search enterprise capabilities"
            />
            {search && (
              <button
                type="button"
                className="ent-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div className="ent-filter">
            <label htmlFor="enterprise-category">Category</label>
            <select
              id="enterprise-category"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option>All areas</option>
              {groups.map((group) => (
                <option key={group.category} value={group.category}>
                  {group.category}
                </option>
              ))}
            </select>
          </div>
        </section>

        {filteredCapabilities.length > 0 ? (
          <section className="ent-groups" aria-label="Enterprise capability groups">
            {visibleGroups.map((group) => {
              const GroupIcon = group.icon;

              return (
                <article className="ent-group" key={group.title}>
                  <div className="ent-group-header">
                    <div className="ent-group-icon">
                      <GroupIcon size={20} />
                    </div>
                    <div>
                      <h2>{group.title}</h2>
                      <p>{group.description}</p>
                    </div>
                  </div>

                  <div className="ent-capability-list">
                    {group.capabilities.map((capability) => {
                      const CapabilityIcon = capability.icon;

                      return (
                        <Link
                          href={capability.href}
                          className="ent-capability"
                          key={capability.href}
                        >
                          <div className="ent-capability-icon">
                            <CapabilityIcon size={17} />
                          </div>

                          <div className="ent-capability-content">
                            <h3>{capability.title}</h3>
                            <p>{capability.description}</p>
                          </div>

                          <div className="ent-capability-arrow">
                            <ArrowRight size={17} />
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </section>
        ) : (
          <div className="ent-empty">
            <div className="ent-empty-icon">
              <Search size={20} />
            </div>
            <h3>No capabilities found</h3>
            <p>
              Try another search term or select a different category.
            </p>
            <button
              type="button"
              className="ent-reset-button"
              onClick={clearFilters}
            >
              <X size={14} />
              Clear filters
            </button>
          </div>
        )}

        <section className="ent-foundation">
          <div className="ent-foundation-heading">
            <div>
              <p className="ent-eyebrow">Platform foundation</p>
              <h2>Production requirements</h2>
              <p>
                Core principles for operating enterprise capabilities reliably.
              </p>
            </div>
            <SlidersHorizontal size={21} color="#64748b" />
          </div>

          <div className="ent-requirements">
            {requirements.map((item) => (
              <article className="ent-requirement" key={item.title}>
                <CheckCircle2
                  className="ent-requirement-icon"
                  size={19}
                />
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>

          <div className="ent-note">
            <ShieldCheck size={17} />
            <span>
              This page is the enterprise navigation overview. Actual access
              enforcement, integration status, audit records, and compliance
              evidence must be verified through the connected backend services.
              The presence of a capability here does not mean that it is
              configured or enabled.
            </span>
          </div>
        </section>
      </div>
    </main>
  );
}
