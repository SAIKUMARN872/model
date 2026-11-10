import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CreditCard, RefreshCw, ShieldCheck } from "lucide-react";

function Metric({ label, value = "—", detail }) {
  return (
    <article className="mn-metric-card">
      <div className="mn-metric-card__heading">{label}</div>
      <strong className="mn-metric-card__value">{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

export default function OrganizationCreditsPage() {
  return (
    <main className="mn-dashboard mn-page">
      <Link to="/" className="mn-back-link"><ArrowLeft size={16} /> Dashboard</Link>
      <header className="mn-page__header">
        <span className="mn-resource__icon"><CreditCard size={22} /></span>
        <div>
          <p className="mn-eyebrow">BILLING AND USAGE</p>
          <h1>Organization Credits</h1>
          <p className="mn-muted">Review available credits, allocations, and credit usage for your organization.</p>
        </div>
      </header>

      <section className="mn-metrics-grid" aria-label="Organization credit metrics">
        <Metric label="Available credits" detail="Current verified balance" />
        <Metric label="Credits used" detail="Usage for the current billing period" />
        <Metric label="Credits allocated" detail="Total credits assigned to this organization" />
        <Metric label="Credits remaining" detail="Balance after confirmed usage" />
      </section>

      <section className="mn-panel">
        <h2>Credit balance status</h2>
        <p className="mn-muted">Live credit data is not connected to this page yet. Values will appear when the authenticated billing service provides the organization's balance and usage.</p>
        <p><ShieldCheck size={17} /> Balances must come from the server; this page does not estimate or modify credits.</p>
        <div className="mn-dashboard__actions">
          <Link className="mn-action" to="/plans">View plans</Link>
          <Link className="mn-action" to="/spend">View monthly spend</Link>
        </div>
      </section>
    </main>
  );
}