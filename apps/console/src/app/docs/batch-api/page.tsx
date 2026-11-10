import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Layers } from "lucide-react";

export default function BatchApiDocsPage() {
  return (
    <main className="mn-dashboard mn-page">
      <Link to="/" className="mn-back-link"><ArrowLeft size={16} /> Dashboard</Link>
      <header className="mn-page__header"><span className="mn-resource__icon"><Layers size={22} /></span><div><p className="mn-eyebrow">MODELNOW DOCUMENTATION</p><h1>Batch API</h1><p className="mn-muted">Asynchronous processing for eligible workloads.</p></div></header>
      <section className="mn-panel"><h2>Batch workflow</h2><p>A production batch API should validate requests, authenticate the organization, enforce quotas, create a tracked job, and expose job status and results through authorized endpoints.</p><h2>Operational safeguards</h2><p>Use idempotency controls, bounded batch sizes, explicit job states, retries, cancellation policies, and per-organization usage accounting.</p><p className="mn-muted">This page documents the intended workflow. It does not claim batch processing is active until the service is connected.</p></section>
    </main>
  );
}
