import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, FileText, ShieldCheck } from "lucide-react";

export default function DocumentsPage() {
  return (
    <main className="mn-dashboard mn-page">
      <Link to="/" className="mn-back-link"><ArrowLeft size={16} /> Dashboard</Link>
      <header className="mn-page__header">
        <span className="mn-resource__icon"><FileText size={22} /></span>
        <div>
          <p className="mn-eyebrow">MODELNOW PLATFORM</p>
          <h1>Documents</h1>
          <p className="mn-muted">Access your organization's documents and connected knowledge sources.</p>
        </div>
      </header>

      <section className="mn-panel">
        <h2>Document library</h2>
        <p className="mn-muted">The document service is not connected to this page yet. Documents will appear when an authenticated backend provides the organization's document records.</p>
        <p><ShieldCheck size={17} /> No documents are fabricated, uploaded, or modified by this page.</p>
      </section>
    </main>
  );
}