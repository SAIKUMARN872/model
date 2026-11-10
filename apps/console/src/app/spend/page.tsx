import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Activity, CreditCard, Cpu, Timer } from "lucide-react";

function CostMetric({ title, detail, icon: Icon }) {
  return (
    <article className="mn-metric-card">
      <div className="mn-metric-card__heading">
        <span>{title}</span>
        <Icon size={18} aria-hidden="true" />
      </div>
      <strong className="mn-metric-card__value">—</strong>
      <p>{detail}</p>
    </article>
  );
}

export default function MonthlySpendPage() {
  return (
    <main className="mn-dashboard mn-page">
      <Link to="/" className="mn-back-link"><ArrowLeft size={16} /> Dashboard</Link>
      <header className="mn-page__header">
        <span className="mn-resource__icon"><CreditCard size={22} /></span>
        <div>
          <p className="mn-eyebrow">COST AND OBSERVABILITY</p>
          <h1>Spend This Month</h1>
          <p className="mn-muted">Track total cost and the components that contribute to AI execution spending.</p>
        </div>
      </header>

      <section className="mn-metrics-grid" aria-label="Monthly cost metrics">
        <CostMetric title="Total cost" detail="Verified combined cost for this month" icon={CreditCard} />
        <CostMetric title="Total token cost" detail="Cost attributed to input and output tokens" icon={Activity} />
        <CostMetric title="Execution cost" detail="Cost attributed to model and workflow execution" icon={Cpu} />
        <CostMetric title="Runtime cost" detail="Cost attributed to runtime and compute resources" icon={Timer} />
      </section>

      <section className="mn-panel">
        <h2>Monthly cost breakdown</h2>
        <p className="mn-muted">Costs are shown only after usage and billing records are connected. Token, execution, and runtime costs must use the billing service's definitions to prevent double counting.</p>
        <div className="mn-dashboard__actions">
          <Link className="mn-action" to="/token-volume">View token volume</Link>
          <Link className="mn-action" to="/credits">Organization credits</Link>
        </div>
      </section>
    </main>
  );
}