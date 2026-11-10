import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, KeyRound, Code2, ShieldCheck } from "lucide-react";

export default function CapabilityApiPage() {
  return (
    <main className="mn-dashboard mn-page">
      <Link to="/models" className="mn-back-link">
        <ArrowLeft size={16} aria-hidden="true" />
        All AI capabilities
      </Link>

      <header className="mn-page__header">
        <div>
          <p className="mn-muted">MODELNOW DEVELOPER API</p>
          <h1>Knowledge Hub API</h1>
          <p className="mn-muted">Search connected knowledge sources and build grounded retrieval workflows.</p>
        </div>
      </header>

      <section className="mn-model-card" style={{ padding: 24, marginTop: 24 }}>
        <h2>Overview</h2>
        <p>Use ModelNow Knowledge Hub concepts for document ingestion, indexing, retrieval, and access-aware results. A working deployment requires configured data sources and indexing services.</p>
      </section>

      <section className="mn-model-card" style={{ padding: 24, marginTop: 16 }}>
        <h2><KeyRound size={18} aria-hidden="true" /> Authentication</h2>
        <p>Use a valid ModelNow API key from your account's API key settings. Keep credentials on a trusted server and never embed secret keys in browser code.</p>
        <pre style={{ overflowX: "auto", padding: 16 }}><code>Authorization: Bearer YOUR_MODELNOW_API_KEY</code></pre>
        <Link to="/api-keys" className="button button--primary">Manage API keys</Link>
      </section>

      <section className="mn-model-card" style={{ padding: 24, marginTop: 16 }}>
        <h2><Code2 size={18} aria-hidden="true" /> Request example</h2>
        <p><strong>Method and illustrative path</strong></p>
        <pre style={{ overflowX: "auto", padding: 16 }}><code>POST /api/v1/knowledge-hub/search</code></pre>
        <p>Example request body:</p>
<pre style={{ overflowX: "auto", padding: 16 }}><code>{`{"query":"What does our onboarding policy say?","topK":5}`}</code></pre>
        <p className="mn-muted">Illustrative route only; verify the implemented backend endpoint and request schema.</p>
      </section>

      <section className="mn-model-card" style={{ padding: 24, marginTop: 16 }}>
        <h2><ShieldCheck size={18} aria-hidden="true" /> Production considerations</h2>
        <ul>
          <li>Authenticate requests and enforce account, subscription, and API-key status.</li>
          <li>Apply rate limits and usage or credit quotas independently.</li>
          <li>Validate request schemas and enforce authorization at the server boundary.</li>
          <li>Return documented errors and request identifiers; avoid logging secrets.</li>
        </ul>
      </section>

      <nav style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 20 }}>
        <Link to="/usage" className="button">View usage</Link>
        <Link to="/logs" className="button">View logs</Link>
        <Link to="/models" className="button">All capabilities</Link>
      </nav>
    </main>
  );
}