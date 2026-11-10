import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, ExternalLink } from "lucide-react";

export default function GovernancePage() {
  return (
    <main className="mn-ent-page">
      <header className="mn-ent-header">
        <p className="mn-ent-eyebrow">ENTERPRISE / GOVERNANCE</p>
        <h1>AI Governance</h1>
        <p className="mn-ent-description">Establish ownership, review requirements, and traceability for models, agents, and AI-enabled workflows.</p>
        <Link className="mn-ent-back" to="/enterprise">
          <ArrowLeft size={16} aria-hidden="true" />
          Enterprise overview
        </Link>
      </header>

      <section className="mn-ent-notice" role="note" aria-label="Integration status">
        <ShieldCheck size={21} aria-hidden="true" />
        <div>
          <h2>Verification required</h2>
          <p>Governance decisions should link to accountable owners, documented policies, review evidence, and controlled exceptions.</p>
        </div>
      </section>

      <section className="mn-ent-grid" aria-label="AI Governance controls">
        <article className="mn-ent-card">
          <span className="mn-ent-card__tag">Inventory</span>
          <h2>Asset inventory</h2>
          <p>Track model and workflow ownership, intended use, risk classification, lifecycle state, and approved deployment scope.</p>
        </article>
        <article className="mn-ent-card">
          <span className="mn-ent-card__tag">Decision controls</span>
          <h2>Policies and approvals</h2>
          <p>Define approval authority, required reviews, documented rationale, and expiry for policy exceptions.</p>
        </article>
        <article className="mn-ent-card">
          <span className="mn-ent-card__tag">Review</span>
          <h2>Ongoing oversight</h2>
          <p>Link evaluations, incidents, material changes, and remediation tasks to the governed asset and accountable owner.</p>
        </article>

      </section>

      <section className="mn-ent-related">
        <h2>Related Enterprise areas</h2>
        <nav aria-label="Related Enterprise pages">
          <Link to="/audit">Audit Trail</Link>
          <Link to="/sla">Service Level Agreements</Link>
          <Link to="/sso">Single Sign-On</Link>
          <Link to="/security">Security Controls</Link>
          <Link to="/rbac">Role-Based Access Control</Link>
          <Link to="/compliance">Compliance Controls</Link>
        </nav>
      </section>

      <p className="mn-ent-footnote">
        Sensitive reads and control changes must be authorized by backend services.
        Displaying this page does not activate a control or establish compliance.
      </p>

      <style>{`
        .mn-ent-page { box-sizing:border-box; width:100%; max-width:1480px; margin:0 auto; padding:30px clamp(18px,3vw,42px) 44px; color:#171717; background:#fff; }
        .mn-ent-header { margin-bottom:25px; }
        .mn-ent-eyebrow { margin:0 0 10px; color:#737373; font-size:11px; font-weight:700; letter-spacing:.09em; }
        .mn-ent-header h1 { margin:0; font-size:clamp(27px,3vw,36px); font-weight:700; letter-spacing:-.04em; line-height:1.2; }
        .mn-ent-description { max-width:760px; margin:10px 0 18px; color:#666; font-size:14px; line-height:1.7; }
        .mn-ent-back { display:inline-flex; align-items:center; gap:7px; color:#262626; font-size:13px; font-weight:600; text-decoration:none; }
        .mn-ent-back:hover { text-decoration:underline; }
        .mn-ent-back:focus-visible,.mn-ent-related a:focus-visible { outline:2px solid #525252; outline-offset:4px; }
        .mn-ent-notice { display:flex; align-items:flex-start; gap:13px; padding:17px 0; margin-bottom:27px; border-top:1px solid #e5e5e5; border-bottom:1px solid #e5e5e5; }
        .mn-ent-notice>svg { flex-shrink:0; color:#404040; margin-top:2px; }
        .mn-ent-notice h2 { margin:0 0 5px; font-size:14px; font-weight:650; }
        .mn-ent-notice p { max-width:960px; margin:0; color:#666; font-size:13px; line-height:1.7; }
        .mn-ent-grid { display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:24px; }
        .mn-ent-card { min-width:0; padding:19px 0; border-top:1px solid #d4d4d4; }
        .mn-ent-card__tag { display:inline-block; margin-bottom:12px; color:#737373; font-size:11px; font-weight:700; letter-spacing:.05em; text-transform:uppercase; }
        .mn-ent-card h2 { margin:0 0 9px; font-size:16px; font-weight:650; letter-spacing:-.015em; }
        .mn-ent-card p { margin:0; color:#666; font-size:13px; line-height:1.75; }
        .mn-ent-related { margin-top:25px; padding-top:20px; border-top:1px solid #e5e5e5; }
        .mn-ent-related h2 { margin:0 0 14px; font-size:17px; }
        .mn-ent-related nav { display:flex; flex-wrap:wrap; gap:10px; }
        .mn-ent-related a { display:inline-flex; align-items:center; gap:6px; padding:9px 11px; border:1px solid #e5e5e5; border-radius:7px; color:#404040; font-size:12px; text-decoration:none; }
        .mn-ent-related a:hover { border-color:#a3a3a3; background:#fafafa; }
        .mn-ent-related a::after { content:"↗"; font-size:12px; color:#737373; }
        .mn-ent-footnote { margin:25px 0 0; color:#737373; font-size:12px; line-height:1.65; }
        @media(max-width:950px) { .mn-ent-grid { grid-template-columns:1fr; gap:0; } }
        @media(max-width:600px) { .mn-ent-page { padding:22px 17px 32px; } .mn-ent-related nav { flex-direction:column; align-items:stretch; } }
        @media(prefers-reduced-motion:reduce) { .mn-ent-page * { scroll-behavior:auto; } }
      `}</style>
    </main>
  );
}