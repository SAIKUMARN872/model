import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Database, Gauge, Zap } from "lucide-react";

function CacheMetric({ title, detail }) {
  return (
    <article className="mn-metric-card">
      <div className="mn-metric-card__heading">{title}</div>
      <strong className="mn-metric-card__value">—</strong>
      <p>{detail}</p>
    </article>
  );
}

export default function PromptCachingPage() {
  return (
    <main className="mn-dashboard mn-page">
      <Link to="/" className="mn-back-link"><ArrowLeft size={16} /> Dashboard</Link>
      <header className="mn-page__header">
        <span className="mn-resource__icon"><Database size={22} /></span>
        <div>
          <p className="mn-eyebrow">PERFORMANCE AND COST</p>
          <h1>Prompt Caching</h1>
          <p className="mn-muted">Understand cache reuse, token savings, and latency when provider telemetry is available.</p>
        </div>
      </header>

      <section className="mn-metrics-grid" aria-label="Prompt caching metrics">
        <CacheMetric title="Cache hit rate" detail="Cache hits divided by eligible cache requests" />
        <CacheMetric title="Cached input tokens" detail="Input tokens reported as served from cache" />
        <CacheMetric title="Cache write tokens" detail="Tokens written to cache, where supported" />
        <CacheMetric title="Estimated cost savings" detail="Savings calculated from verified provider pricing and cache usage" />
        <CacheMetric title="Cache reads" detail="Confirmed cache-read events" />
        <CacheMetric title="Latency impact" detail="Measured latency difference for comparable requests" />
      </section>

      <section className="mn-panel">
        <h2>How caching is reported</h2>
        <p className="mn-muted">Cache capabilities and billing differ by provider and model. ModelNow should report provider-returned cache usage separately from ordinary input and output tokens, and calculate savings only when pricing and usage data are available.</p>
        <div className="mn-dashboard__actions">
          <Link className="mn-action" to="/docs/prompt-caching"><Zap size={16} /> Prompt caching docs</Link>
          <Link className="mn-action" to="/spend"><Gauge size={16} /> View monthly spend</Link>
        </div>
      </section>
    </main>
  );
}