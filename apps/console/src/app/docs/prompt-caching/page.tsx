import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Database } from "lucide-react";

export default function PromptCachingDocsPage() {
  return (
    <main className="mn-dashboard mn-page">
      <Link to="/" className="mn-back-link"><ArrowLeft size={16} /> Dashboard</Link>
      <header className="mn-page__header"><span className="mn-resource__icon"><Database size={22} /></span><div><p className="mn-eyebrow">MODELNOW DOCUMENTATION</p><h1>Prompt Caching</h1><p className="mn-muted">Reuse eligible prompt prefixes where supported.</p></div></header>
      <section className="mn-panel"><h2>Cache behavior</h2><p>Cache eligibility depends on provider support and request structure. Keep cache keys scoped to the correct tenant and avoid sharing private context between organizations.</p><h2>Measurement and controls</h2><p>Track cache hits, reused tokens, expiry, invalidation, and measured cost impact. Respect provider rules, data retention policies, and organization security boundaries.</p><p className="mn-muted">Live cache controls require an implemented and monitored backend integration.</p></section>
    </main>
  );
}
