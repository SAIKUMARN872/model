
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
} from "lucide-react";

export default function CapabilityApiPage() {
  const router = useRouter();
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);

  const closeModal = () => {
    setApiKeyModalOpen(false);
  };

  return (
    <main className="mn-dashboard mn-page">
      <header className="mn-browser-header">
        <div className="mn-browser-heading-content">
          <button
            type="button"
            className="mn-back-link mn-back-arrow-only"
            aria-label="Back to overview"
            title="Back to overview"
            onClick={() => router.back()}
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </button>

          <div className="mn-page__header">
            <div>
              <p className="mn-muted">MODELNOW DEVELOPER API</p>
              <h1>Browser Automation API</h1>
              <p className="mn-muted">
                Create and manage controlled browser automation workflows
                through ModelNow.
              </p>
            </div>
          </div>
        </div>

        <div className="mn-browser-header-actions">
          <CreditsPopup />

          <button
            type="button"
            className="mn-action mn-action--primary"
            onClick={() => setApiKeyModalOpen(true)}
          >
            <KeyRound size={17} />
            Create API Key
          </button>
        </div>
      </header>

      <section
        className="mn-model-card"
        style={{ padding: 24, marginTop: 24 }}
      >
        <h2>Overview</h2>
        <p>
          Design browser tasks, define allowed actions, and review execution
          results. Execution requires a configured browser runtime and
          server-side permissions.
        </p>
      </section>

      <section
        className="mn-model-card"
        style={{ padding: 24, marginTop: 16 }}
      >
        <h2>
          <KeyRound size={18} aria-hidden="true" /> Authentication
        </h2>
        <p>
          Use a valid ModelNow API key from your account's API key settings.
          Keep credentials on a trusted server and never embed secret keys
          in browser code.
        </p>

        <pre style={{ overflowX: "auto", padding: 16 }}>
          <code>Authorization: Bearer YOUR_MODELNOW_API_KEY</code>
        </pre>

        <button
          type="button"
          className="button button--primary"
          onClick={() => setApiKeyModalOpen(true)}
        >
          Create API Key
        </button>
      </section>

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
          <code>POST /api/v1/browser-automation/tasks</code>
        </pre>

        <p>Example request body:</p>

        <pre style={{ overflowX: "auto", padding: 16 }}>
          <code>{`{"task":"Summarize the public information on an approved website","url":"https://example.com"}`}</code>
        </pre>

        <p className="mn-muted">
          Illustrative route only; verify the implemented backend endpoint
          before making requests.
        </p>
      </section>

      <section
        className="mn-model-card"
        style={{ padding: 24, marginTop: 16 }}
      >
        <h2>
          <ShieldCheck size={18} aria-hidden="true" /> Production considerations
        </h2>

        <ul>
          <li>
            Authenticate requests and enforce account, subscription, and
            API-key status.
          </li>
          <li>
            Apply rate limits and usage or credit quotas independently.
          </li>
          <li>
            Validate request schemas and enforce authorization at the server
            boundary.
          </li>
          <li>
            Return documented errors and request identifiers; avoid logging
            secrets.
          </li>
        </ul>
      </section>

      <nav className="mn-browser-page-links">
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

      {apiKeyModalOpen && (
        <ExploreApiKeys onClose={closeModal} />
      )}

      <style>{`
        .mn-browser-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
        }

        .mn-browser-heading-content {
          min-width: 0;
        }

        .mn-browser-header-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .mn-back-arrow-only {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          margin-bottom: 16px;
          padding: 0;
          border: 1px solid #e5e5e5;
          border-radius: 10px;
          background: transparent;
          color: inherit;
          cursor: pointer;
          text-decoration: none;
          transition: background 0.2s ease, border-color 0.2s ease;
        }

        .mn-back-arrow-only:hover {
          background: #f3f4f6;
          border-color: #cbd5e1;
        }

        .mn-browser-page-links {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 20px;
        }

        @media (max-width: 650px) {
          .mn-browser-header {
            flex-direction: column;
          }

          .mn-browser-header-actions {
            width: 100%;
            justify-content: flex-start;
            flex-wrap: wrap;
          }
        }
      `}</style>
    </main>
  );
}
