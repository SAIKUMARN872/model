
"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import CreditsPopup from "../../components/explore-api-keys/CreditsPopup";
import ExploreApiKeys from "../../components/explore-api-keys/page";
import {
  ArrowLeft,
  KeyRound,
  Code2,
  ShieldCheck,
  Plus,
} from "lucide-react";

export default function CapabilityApiPage() {
  const router = useRouter();

  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  return (
    <main className="mn-dashboard mn-page">
      {/* Top header */}
      <div className="mn-knowledge-header">
        <button
          type="button"
          className="mn-back-link mn-back-arrow-only"
          aria-label="Back to overview"
          title="Back to overview"
          onClick={() => router.back()}
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </button>

        <div className="mn-knowledge-header-actions">
          <CreditsPopup />

          <button
            type="button"
            className="button button--primary mn-create-api-key"
            onClick={() => setShowApiKeyModal(true)}
          >
            <Plus size={16} />
            Create API Key
          </button>
        </div>
      </div>

      {/* Page heading */}
      <header className="mn-page__header">
        <div>
          <p className="mn-muted">MODELNOW DEVELOPER API</p>
          <h1>Knowledge Hub API</h1>
          <p className="mn-muted">
            Search connected knowledge sources and build grounded retrieval
            workflows.
          </p>
        </div>
      </header>

      {/* Overview */}
      <section
        className="mn-model-card"
        style={{ padding: 24, marginTop: 24 }}
      >
        <h2>Overview</h2>
        <p>
          Use ModelNow Knowledge Hub concepts for document ingestion,
          indexing, retrieval, and access-aware results. A working
          deployment requires configured data sources and indexing
          services.
        </p>
      </section>

      {/* Authentication */}
      <section
        className="mn-model-card"
        style={{ padding: 24, marginTop: 16 }}
      >
        <h2>
          <KeyRound size={18} aria-hidden="true" /> Authentication
        </h2>

        <p>
          Use a valid ModelNow API key from your account's API key
          settings. Keep credentials on a trusted server and never
          embed secret keys in browser code.
        </p>

        <pre style={{ overflowX: "auto", padding: 16 }}>
          <code>Authorization: Bearer YOUR_MODELNOW_API_KEY</code>
        </pre>

        <button
          type="button"
          className="button button--primary"
          onClick={() => setShowApiKeyModal(true)}
        >
          Create API Key
        </button>
      </section>

      {/* Request example */}
      <section
        className="mn-model-card"
        style={{ padding: 24, marginTop: 16 }}
      >
        <h2>
          <Code2 size={18} aria-hidden="true" /> Request example
        </h2>

        <p>
          <strong>Method and illustrative path</strong>
        </p>

        <pre style={{ overflowX: "auto", padding: 16 }}>
          <code>POST /api/v1/knowledge-hub/search</code>
        </pre>

        <p>Example request body:</p>

        <pre style={{ overflowX: "auto", padding: 16 }}>
          <code>
            {`{"query":"What does our onboarding policy say?","topK":5}`}
          </code>
        </pre>

        <p className="mn-muted">
          Illustrative route only; verify the implemented backend
          endpoint and request schema.
        </p>
      </section>

      {/* Production considerations */}
      <section
        className="mn-model-card"
        style={{ padding: 24, marginTop: 16 }}
      >
        <h2>
          <ShieldCheck size={18} aria-hidden="true" /> Production
          considerations
        </h2>

        <ul>
          <li>
            Authenticate requests and enforce account, subscription,
            and API-key status.
          </li>
          <li>
            Apply rate limits and usage or credit quotas independently.
          </li>
          <li>
            Validate request schemas and enforce authorization at the
            server boundary.
          </li>
          <li>
            Return documented errors and request identifiers; avoid
            logging secrets.
          </li>
        </ul>
      </section>

      {/* Navigation */}
      <nav className="mn-knowledge-navigation">
        <Link href="/usage" className="button">
          View usage
        </Link>

        <Link href="/logs" className="button">
          View logs
        </Link>

        <Link href="/models" className="button">
          All capabilities
        </Link>
      </nav>

      {/* Shared API Key Modal */}
      {showApiKeyModal && (
        <ExploreApiKeys
          onClose={() => setShowApiKeyModal(false)}
        />
      )}

      {/* Styles */}
      <style>{`
        .mn-knowledge-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          width: 100%;
        }

        .mn-knowledge-header-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          flex-wrap: wrap;
        }

        .mn-back-arrow-only {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          width: 38px;
          height: 38px;
          padding: 0;
          border: 1px solid var(--mn-border, #e5e7eb);
          border-radius: 9px;
          background: var(--mn-card, #fff);
          color: inherit;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s ease,
            border-color 0.2s ease;
        }

        .mn-back-arrow-only:hover {
          background: var(--mn-hover, #f1f5f9);
          border-color: #cbd5e1;
        }

        .mn-create-api-key {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          white-space: nowrap;
        }

        .mn-knowledge-navigation {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 20px;
        }

        @media (max-width: 560px) {
          .mn-knowledge-header {
            align-items: flex-start;
          }

          .mn-knowledge-header-actions {
            gap: 8px;
          }
        }

        @media (max-width: 380px) {
          .mn-knowledge-header {
            flex-wrap: wrap;
          }

          .mn-knowledge-header-actions {
            width: 100%;
            justify-content: flex-end;
          }
        }
      `}</style>
    </main>
  );
}
