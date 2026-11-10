import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Zap } from "lucide-react";

export default function FastModeDocsPage() {
  return (
    <main className="mn-dashboard mn-page">
      <Link to="/" className="mn-back-link"><ArrowLeft size={16} /> Dashboard</Link>
      <header className="mn-page__header"><span className="mn-resource__icon"><Zap size={22} /></span><div><p className="mn-eyebrow">MODELNOW DOCUMENTATION</p><h1>Fast Mode</h1><p className="mn-muted">Lower-latency inference configuration.</p></div></header>
      <section className="mn-panel"><h2>How it should work</h2><p>Fast Mode should select supported inference settings and models according to latency objectives while respecting task quality, provider capability, account entitlements, and cost limits.</p><h2>Before enabling</h2><p>Measure end-to-end latency, timeout rates, quality, and cost against a baseline. Fast Mode must not silently bypass security or routing policies.</p><p className="mn-muted">Availability and configuration require a connected ModelNow runtime.</p></section>
    </main>
  );
}
