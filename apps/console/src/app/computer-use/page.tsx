
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

  const handleBackToOverview = () => {
    const historyState = window.history.state as { idx?: number } | null;

    if (typeof historyState?.idx === "number" && historyState.idx > 0) {
      router.back();
    } else {
      router.push("/");
    }
  };

  const closeModal = () => {
    setShowApiKeyModal(false);
  };

  return (
    <main className="mn-dashboard mn-page">
      {/* Top header actions */}
      <div className="mn-computer-header">
        <button
          type="button"
          className="mn-back-arrow-only"
          onClick={handleBackToOverview}
          aria-label="Back to overview"
          title="Back to overview"
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </button>

        <div className="mn-computer-header-actions">
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
          <h1>Computer Use API</h1>
          <p className="mn-muted">
            Coordinate controlled interactions with approved desktop
            environments.
          </p>
        </div>
      </header>

      {/* Overview */}
      <section className="mn-model-card mn-computer-card">
        <h2>Overview</h2>
        <p>
          Computer-use operations must run in an approved execution environment
          with explicit permissions, scoped actions, and appropriate safety
          controls.
        </p>
      </section>

      {/* Authentication */}
      <section className="mn-model-card mn-computer-card">
        <h2>
          <KeyRound size={18} aria-hidden="true" /> Authentication
        </h2>

        <p>
          Use a valid ModelNow API key from your account's API key settings.
          Keep credentials on a trusted server and never embed secret keys in
          browser code.
        </p>

        <pre className="mn-computer-code">
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
      <section className="mn-model-card mn-computer-card">
        <h2>
          <Code2 size={18} aria-hidden="true" /> Request example
        </h2>

        <p>
          <strong>Method and illustrative path</strong>
        </p>

        <pre className="mn-computer-code">
          <code>POST /api/v1/computer-use/tasks</code>
        </pre>

        <p>Example request body:</p>

        <pre className="mn-computer-code">
          <code>
            {`{"environmentId":"your-environment-id","task":"Open the approved application"}`}
          </code>
        </pre>

        <p className="mn-muted">
          Illustrative route only; do not send requests until the execution API
          and permission model are implemented.
        </p>
      </section>

      {/* Production considerations */}
      <section className="mn-model-card mn-computer-card">
        <h2>
          <ShieldCheck size={18} aria-hidden="true" /> Production
          considerations
        </h2>

        <ul>
          <li>
            Authenticate requests and enforce account, subscription, and
            API-key status.
          </li>
          <li>Apply rate limits and usage or credit quotas independently.</li>
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

      {/* Navigation */}
      <nav className="mn-computer-navigation">
        <Link href="/usage" className="button">
          View usage
        </Link>

        <Link href="/logs" className="button">
          View logs
        </Link>
      </nav>

      {/* Shared API Key Popup */}
      {showApiKeyModal && (
        <ExploreApiKeys onClose={closeModal} />
      )}

      <style>{`
        .mn-computer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          width: 100%;
        }

        .mn-computer-header-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 12px;
        }

        .mn-back-arrow-only {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          border: 1px solid var(--mn-border, #e5e7eb);
          border-radius: 9px;
          background: var(--mn-card, #fff);
          color: var(--mn-text, #172033);
          cursor: pointer;
          transition: background 0.2s ease, border-color 0.2s ease;
        }

        .mn-back-arrow-only:hover {
          background: var(--mn-hover, #f1f5f9);
          border-color: var(--mn-primary, #315fe8);
        }

        .mn-create-api-key {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          white-space: nowrap;
        }

        .mn-computer-card {
          padding: 24px;
          margin-top: 16px;
        }

        .mn-computer-card:first-of-type {
          margin-top: 24px;
        }

        .mn-computer-card h2 {
          display: flex;
          align-items: center;
          gap: 9px;
        }

        .mn-computer-code {
          overflow-x: auto;
          padding: 16px;
          border-radius: 9px;
        }

        .mn-computer-navigation {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 20px;
        }

        @media (max-width: 560px) {
          .mn-computer-header {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .mn-computer-header-actions {
            width: 100%;
          }

          .mn-computer-card {
            padding: 18px;
          }
        }
      `}</style>
    </main>
  );
}
