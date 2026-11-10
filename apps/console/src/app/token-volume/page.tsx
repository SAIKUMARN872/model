import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Activity, ArrowDownToLine, ArrowUpFromLine, Layers } from "lucide-react";

function TokenMetric({ title, detail, icon: Icon }) {
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

export default function TokenVolumePage() {
  return (
    <main className="mn-dashboard mn-page">
      <Link to="/" className="mn-back-link"><ArrowLeft size={16} /> Dashboard</Link>
      <header className="mn-page__header">
        <span className="mn-resource__icon"><Activity size={22} /></span>
        <div>
          <p className="mn-eyebrow">USAGE ANALYTICS</p>
          <h1>Token Volume</h1>
          <p className="mn-muted">Inspect total input tokens, output tokens, and combined token volume.</p>
        </div>
      </header>

      <section className="mn-metrics-grid" aria-label="Token volume metrics">
        <TokenMetric title="Total tokens in" detail="Input tokens reported for the selected period" icon={ArrowDownToLine} />
        <TokenMetric title="Total tokens out" detail="Output tokens reported for the selected period" icon={ArrowUpFromLine} />
        <TokenMetric title="Total tokens" detail="Input tokens plus output tokens, using consistent usage records" icon={Layers} />
      </section>

      <section className="mn-panel">
        <h2>Token usage status</h2>
        <p className="mn-muted">Totals remain unavailable until the usage service supplies verified token counts. Provider-specific cached tokens and other token categories should be retained in the usage records so the combined total follows a documented counting rule.</p>
        <div className="mn-dashboard__actions">
          <Link className="mn-action" to="/spend">View monthly spend</Link>
          <Link className="mn-action" to="/prompt-caching">View prompt caching</Link>
        </div>
      </section>
    </main>
  );
}