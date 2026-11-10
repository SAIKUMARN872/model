import {
  Activity,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  CircleHelp,
  Clock3,
  FileClock,
  Fingerprint,
  Globe2,
  KeyRound,
  LockKeyhole,
  Network,
  RefreshCw,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";
import { Link } from "react-router-dom";

const sections = [
  {
    title: "Identity and access",
    description:
      "Review identity-provider readiness, authentication controls, and organization access boundaries.",
    icon: KeyRound,
    items: [
      { label: "Single sign-on", detail: "Identity-provider configuration", path: "/sso" },
      { label: "Role-based access", detail: "Roles and authorization policies", path: "/rbac" },
      { label: "Security controls", detail: "Authentication and security posture", path: "/security" },
    ],
  },
  {
    title: "Governance and assurance",
    description:
      "Review policy ownership, audit evidence, and reported compliance-control status.",
    icon: ShieldCheck,
    items: [
      { label: "Governance", detail: "Policies and organizational controls", path: "/governance" },
      { label: "Audit trail", detail: "Administrative and platform events", path: "/audit" },
      { label: "Compliance", detail: "Control evidence and review status", path: "/compliance" },
    ],
  },
  {
    title: "Service operations",
    description:
      "Review service-level objectives and the operational information exposed by connected services.",
    icon: Activity,
    items: [
      { label: "Service-level objectives", detail: "Targets and measured performance", path: "/sla" },
      { label: "Usage and limits", detail: "Consumption and quota visibility", path: "/usage" },
      { label: "Request logs", detail: "Available request records", path: "/logs" },
    ],
  },
];

const principles = [
  {
    title: "Tenant isolation",
    description:
      "Organization-scoped resources must be authorized by the backend on every request.",
    icon: Building2,
  },
  {
    title: "Least privilege",
    description:
      "Administrative permissions should be explicit, reviewable, and limited to required actions.",
    icon: LockKeyhole,
  },
  {
    title: "Traceable changes",
    description:
      "Sensitive changes should produce attributable audit events with appropriate retention.",
    icon: FileClock,
  },
  {
    title: "Verified integrations",
    description:
      "Identity, monitoring, and compliance states must come from authoritative service responses.",
    icon: Network,
  },
];

type EnterpriseLinkProps = {
  path: string;
  label: string;
  detail: string;
};

function EnterpriseLink({ path, label, detail }: EnterpriseLinkProps) {
  return (
    <Link className="mn-enterprise-link" to={path}>
      <span className="mn-enterprise-link__copy">
        <strong>{label}</strong>
        <span>{detail}</span>
      </span>
      <ArrowRight size={17} aria-hidden="true" />
    </Link>
  );
}

type EnterpriseSectionProps = { section: (typeof sections)[number] };

function EnterpriseSection({ section }: EnterpriseSectionProps) {
  const Icon = section.icon;

  return (
    <section className="mn-enterprise-section" aria-labelledby={`enterprise-${section.title}`}>
      <div className="mn-enterprise-section__heading">
        <span className="mn-enterprise-icon">
          <Icon size={19} aria-hidden="true" />
        </span>
        <div>
          <h2 id={`enterprise-${section.title}`}>{section.title}</h2>
          <p>{section.description}</p>
        </div>
      </div>

      <div className="mn-enterprise-links">
        {section.items.map((item) => (
          <EnterpriseLink key={item.path} {...item} />
        ))}
      </div>
    </section>
  );
}

export default function EnterprisePage() {
  return (
    <main className="mn-enterprise-page">
      <header className="mn-enterprise-header">
        <div className="mn-enterprise-breadcrumb">
          <Building2 size={15} aria-hidden="true" />
          <span>Administration</span>
          <span aria-hidden="true">/</span>
          <span>Enterprise</span>
        </div>

        <div className="mn-enterprise-title-row">
          <div>
            <h1>Enterprise</h1>
            <p>
              Organization administration, security, governance, and service
              operations in one place.
            </p>
          </div>
          <span className="mn-enterprise-status">
            <CircleHelp size={15} aria-hidden="true" />
            Verification required
          </span>
        </div>
      </header>

      <section className="mn-enterprise-notice" aria-label="Integration status">
        <span className="mn-enterprise-notice__icon">
          <RefreshCw size={18} aria-hidden="true" />
        </span>
        <div>
          <h2>Enterprise readiness</h2>
          <p>
            This page does not assume that enterprise integrations are enabled.
            Open each area to inspect the status returned by its configured
            service. Unverified controls must not be treated as active.
          </p>
        </div>
      </section>

      <section className="mn-enterprise-metrics" aria-label="Enterprise capability areas">
        <article>
          <span className="mn-enterprise-metric__icon"><Users size={18} /></span>
          <span className="mn-enterprise-metric__label">Organization access</span>
          <strong>Review required</strong>
          <span className="mn-enterprise-metric__detail">Membership and roles</span>
        </article>
        <article>
          <span className="mn-enterprise-metric__icon"><Fingerprint size={18} /></span>
          <span className="mn-enterprise-metric__label">Identity controls</span>
          <strong>Unverified</strong>
          <span className="mn-enterprise-metric__detail">SSO and authentication</span>
        </article>
        <article>
          <span className="mn-enterprise-metric__icon"><ShieldCheck size={18} /></span>
          <span className="mn-enterprise-metric__label">Governance</span>
          <strong>Review required</strong>
          <span className="mn-enterprise-metric__detail">Policies and evidence</span>
        </article>
        <article>
          <span className="mn-enterprise-metric__icon"><Clock3 size={18} /></span>
          <span className="mn-enterprise-metric__label">Service objectives</span>
          <strong>Unverified</strong>
          <span className="mn-enterprise-metric__detail">Measurements and targets</span>
        </article>
      </section>

      <section className="mn-enterprise-content" aria-labelledby="enterprise-capabilities">
        <div className="mn-enterprise-section-intro">
          <div>
            <h2 id="enterprise-capabilities">Enterprise capabilities</h2>
            <p>Open a control area to review its configuration and available records.</p>
          </div>
        </div>

        <div className="mn-enterprise-sections">
          {sections.map((section) => (
            <EnterpriseSection key={section.title} section={section} />
          ))}
        </div>
      </section>

      <section className="mn-enterprise-content" aria-labelledby="enterprise-principles">
        <div className="mn-enterprise-section-intro">
          <div>
            <h2 id="enterprise-principles">Production requirements</h2>
            <p>Foundational controls for a secure, multi-tenant enterprise platform.</p>
          </div>
        </div>

        <div className="mn-enterprise-principles">
          {principles.map((principle) => {
            const Icon = principle.icon;

            return (
              <article key={principle.title}>
                <Icon size={19} aria-hidden="true" />
                <div>
                  <h3>{principle.title}</h3>
                  <p>{principle.description}</p>
                </div>
              </article>
            );
          })}
        </div>
      </section>

            <section className="mn-enterprise-content" aria-label="Enterprise control areas">
        <div className="mn-enterprise-section-intro">
          <div>
            <h2>Enterprise control areas</h2>
            <p>Open an area to review its configuration workflow and available evidence.</p>
          </div>
        </div>
        <nav className="mn-enterprise-sections" aria-label="Enterprise navigation">
          <div className="mn-enterprise-section">
            <div className="mn-enterprise-links">
              <Link className="mn-enterprise-link" to="/audit"><span className="mn-enterprise-link__copy"><strong>Audit trail</strong><span>Events and investigation evidence</span></span><ArrowRight size={17} aria-hidden="true" /></Link>
              <Link className="mn-enterprise-link" to="/sla"><span className="mn-enterprise-link__copy"><strong>Service level agreements</strong><span>Objectives and measured performance</span></span><ArrowRight size={17} aria-hidden="true" /></Link>
              <Link className="mn-enterprise-link" to="/sso"><span className="mn-enterprise-link__copy"><strong>Single sign-on</strong><span>Identity provider and authentication</span></span><ArrowRight size={17} aria-hidden="true" /></Link>
              <Link className="mn-enterprise-link" to="/security"><span className="mn-enterprise-link__copy"><strong>Security controls</strong><span>Credentials and tenant boundaries</span></span><ArrowRight size={17} aria-hidden="true" /></Link>
            </div>
          </div>
          <div className="mn-enterprise-section">
            <div className="mn-enterprise-links">
              <Link className="mn-enterprise-link" to="/rbac"><span className="mn-enterprise-link__copy"><strong>Role-based access</strong><span>Roles and server-side permissions</span></span><ArrowRight size={17} aria-hidden="true" /></Link>
              <Link className="mn-enterprise-link" to="/governance"><span className="mn-enterprise-link__copy"><strong>AI governance</strong><span>Ownership, policy, and review</span></span><ArrowRight size={17} aria-hidden="true" /></Link>
              <Link className="mn-enterprise-link" to="/compliance"><span className="mn-enterprise-link__copy"><strong>Compliance controls</strong><span>Control evidence and remediation</span></span><ArrowRight size={17} aria-hidden="true" /></Link>
            </div>
          </div>
        </nav>
      </section>
      <footer className="mn-enterprise-footer">
        <div>
          <CheckCircle2 size={17} aria-hidden="true" />
          <span>Enterprise overview</span>
          <span className="mn-enterprise-footer__separator" aria-hidden="true">·</span>
          <span>Capability status must be service-verified</span>
        </div>
        <Link to="/governance">
          Review governance <ArrowUpRight size={15} aria-hidden="true" />
        </Link>
      </footer>

      <style>{`
        .mn-enterprise-page {
          width: 100%;
          max-width: 1480px;
          margin: 0 auto;
          padding: 30px clamp(18px, 3vw, 42px) 44px;
          color: #171717;
          background: #fff;
        }
        .mn-enterprise-header { margin-bottom: 25px; }
        .mn-enterprise-breadcrumb {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 19px; color: #737373; font-size: 12px;
        }
        .mn-enterprise-title-row {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 20px;
        }
        .mn-enterprise-title-row h1 {
          margin: 0; color: #171717; font-size: clamp(27px, 3vw, 36px);
          font-weight: 700; letter-spacing: -.045em; line-height: 1.2;
        }
        .mn-enterprise-title-row p {
          max-width: 720px; margin: 10px 0 0; color: #666;
          font-size: 14px; line-height: 1.7;
        }
        .mn-enterprise-status {
          display: inline-flex; flex-shrink: 0; align-items: center; gap: 7px;
          padding: 8px 11px; border: 1px solid #e5e5e5; border-radius: 7px;
          color: #525252; background: #fafafa; font-size: 12px; font-weight: 600;
        }
        .mn-enterprise-notice {
          display: flex; align-items: flex-start; gap: 13px;
          padding: 17px 0; margin-bottom: 22px;
          border-top: 1px solid #e5e5e5; border-bottom: 1px solid #e5e5e5;
        }
        .mn-enterprise-notice__icon {
          display: grid; flex: 0 0 36px; width: 36px; height: 36px;
          place-items: center; border-radius: 8px;
          color: #404040; background: #f5f5f5;
        }
        .mn-enterprise-notice h2 { margin: 0 0 5px; font-size: 14px; font-weight: 650; }
        .mn-enterprise-notice p {
          max-width: 920px; margin: 0; color: #666; font-size: 13px; line-height: 1.65;
        }
        .mn-enterprise-metrics {
          display: grid; grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 0; margin-bottom: 36px; border-top: 1px solid #e5e5e5;
          border-bottom: 1px solid #e5e5e5;
        }
        .mn-enterprise-metrics article {
          display: flex; min-width: 0; flex-direction: column; align-items: flex-start;
          gap: 8px; padding: 19px 18px; border-right: 1px solid #eee;
        }
        .mn-enterprise-metrics article:first-child { padding-left: 0; }
        .mn-enterprise-metrics article:last-child { border-right: 0; }
        .mn-enterprise-metric__icon {
          display: grid; width: 34px; height: 34px; place-items: center;
          border: 1px solid #e5e5e5; border-radius: 8px; color: #404040;
        }
        .mn-enterprise-metric__label { color: #666; font-size: 12px; }
        .mn-enterprise-metrics article strong { color: #262626; font-size: 15px; font-weight: 650; }
        .mn-enterprise-metric__detail { color: #737373; font-size: 12px; }
        .mn-enterprise-content { margin-top: 35px; }
        .mn-enterprise-section-intro { margin-bottom: 17px; }
        .mn-enterprise-section-intro h2 { margin: 0; font-size: 20px; font-weight: 700; letter-spacing: -.025em; }
        .mn-enterprise-section-intro p { margin: 7px 0 0; color: #737373; font-size: 13px; line-height: 1.6; }
        .mn-enterprise-sections { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 25px; }
        .mn-enterprise-section { min-width: 0; border-top: 1px solid #d4d4d4; }
        .mn-enterprise-section__heading { display: flex; align-items: flex-start; gap: 11px; padding: 18px 0 14px; }
        .mn-enterprise-icon {
          display: grid; flex: 0 0 36px; width: 36px; height: 36px;
          place-items: center; border: 1px solid #e5e5e5; border-radius: 8px;
          color: #262626; background: #fafafa;
        }
        .mn-enterprise-section__heading h2 { margin: 1px 0 5px; font-size: 15px; font-weight: 650; }
        .mn-enterprise-section__heading p { margin: 0; color: #737373; font-size: 12px; line-height: 1.6; }
        .mn-enterprise-links { display: flex; flex-direction: column; }
        .mn-enterprise-link {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          padding: 13px 0; border-top: 1px solid #eee; color: #404040;
          text-decoration: none; transition: color .15s ease;
        }
        .mn-enterprise-link__copy { display: flex; min-width: 0; flex-direction: column; gap: 5px; }
        .mn-enterprise-link__copy strong { color: #262626; font-size: 13px; font-weight: 600; }
        .mn-enterprise-link__copy span { color: #737373; font-size: 12px; line-height: 1.5; }
        .mn-enterprise-link > svg { flex-shrink: 0; color: #737373; }
        .mn-enterprise-link:hover,
        .mn-enterprise-link:hover strong,
        .mn-enterprise-link:hover > svg { color: #000; }
        .mn-enterprise-link:focus-visible,
        .mn-enterprise-footer a:focus-visible { outline: 2px solid #525252; outline-offset: 4px; }
        .mn-enterprise-principles {
          display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0 28px;
          border-top: 1px solid #e5e5e5;
        }
        .mn-enterprise-principles article {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 17px 0; border-bottom: 1px solid #eee;
        }
        .mn-enterprise-principles article > svg { flex-shrink: 0; margin-top: 2px; color: #404040; }
        .mn-enterprise-principles h3 { margin: 0 0 5px; color: #262626; font-size: 13px; font-weight: 650; }
        .mn-enterprise-principles p { margin: 0; color: #737373; font-size: 12px; line-height: 1.65; }
        .mn-enterprise-footer {
          display: flex; align-items: center; justify-content: space-between; gap: 16px;
          margin-top: 32px; padding-top: 17px; border-top: 1px solid #e5e5e5;
          color: #737373; font-size: 12px;
        }
        .mn-enterprise-footer > div { display: flex; align-items: center; flex-wrap: wrap; gap: 8px; }
        .mn-enterprise-footer > div > svg { color: #525252; }
        .mn-enterprise-footer__separator { color: #a3a3a3; }
        .mn-enterprise-footer a {
          display: inline-flex; align-items: center; gap: 5px; flex-shrink: 0;
          color: #262626; font-weight: 600; text-decoration: none;
        }
        .mn-enterprise-footer a:hover { color: #000; text-decoration: underline; }
        @media (max-width: 1050px) {
          .mn-enterprise-sections { grid-template-columns: 1fr; gap: 24px; }
          .mn-enterprise-section__heading { max-width: 700px; }
          .mn-enterprise-links { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 24px; }
        }
        @media (max-width: 700px) {
          .mn-enterprise-page { padding: 22px 17px 32px; }
          .mn-enterprise-title-row { flex-direction: column; }
          .mn-enterprise-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .mn-enterprise-metrics article { padding: 15px 10px; border-bottom: 1px solid #eee; }
          .mn-enterprise-metrics article:first-child { padding-left: 10px; }
          .mn-enterprise-metrics article:nth-child(2) { border-right: 0; }
          .mn-enterprise-metrics article:nth-child(3) { padding-left: 10px; border-bottom: 0; }
          .mn-enterprise-metrics article:nth-child(4) { border-right: 0; border-bottom: 0; }
          .mn-enterprise-links { grid-template-columns: 1fr; }
          .mn-enterprise-principles { grid-template-columns: 1fr; }
          .mn-enterprise-footer { align-items: flex-start; flex-direction: column; }
        }
        @media (prefers-reduced-motion: reduce) {
          .mn-enterprise-link { transition: none; }
        }
      `}</style>
</main>
  );
}
