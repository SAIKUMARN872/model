
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

  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);

  const handleBackToOverview = () => {
    const historyState = window.history.state as { idx?: number } | null;

    if (typeof historyState?.idx === "number" && historyState.idx > 0) {
      router.back();
    } else {
      router.push("/");
    }
  };

  return (
    <main className="mn-dashboard mn-page">
      {/* Top header */}
      <header className="mn-finetuning-header">
        <div className="mn-finetuning-heading">
          <button
            type="button"
            className="mn-back-arrow-only"
            onClick={handleBackToOverview}
            aria-label="Back to overview"
            title="Back to overview"
          >
            <ArrowLeft size={20} aria-hidden="true" />
          </button>

          <div className="mn-page__header">
            <div>
              <p className="mn-muted">MODELNOW DEVELOPER API</p>
              <h1>Fine-Tuning API</h1>
              <p className="mn-muted">
                Prepare model customization jobs, datasets, and evaluation
                workflows.
              </p>
            </div>
          </div>
        </div>

        <div className="mn-finetuning-header-actions">
          <CreditsPopup />

          <button
            type="button"
            className="mn-action mn-action--primary"
            onClick={() => setApiKeyModalOpen(true)}
          >
            <Plus size={17} />
            Create API Key
          </button>
        </div>
      </header>

      {/* Overview */}
      <section className="mn-model-card mn-finetuning-card">
        <h2>Overview</h2>
        <p>
          Training requires a supported base model, validated dataset,
          compute capacity, and server-side job management. Pricing depends
          on the selected model and compute.
        </p>
      </section>

      {/* Authentication */}
      <section className="mn-model-card mn-finetuning-card">
        <h2>
          <KeyRound size={18} aria-hidden="true" /> Authentication
        </h2>

        <p>
          Use a valid ModelNow API key from your account's API key settings.
          Keep credentials on a trusted server and never embed secret keys
          in browser code.
        </p>

        <pre className="mn-finetuning-code">
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

      {/* Request example */}
      <section className="mn-model-card mn-finetuning-card">
        <h2>
          <Code2 size={18} aria-hidden="true" /> Request example
        </h2>

        <p>
          <strong>Method and illustrative path</strong>
        </p>

        <pre className="mn-finetuning-code">
          <code>POST /api/v1/fine-tuning/jobs</code>
        </pre>

        <p>Example request body:</p>

        <pre className="mn-finetuning-code">
          <code>
            {`{"baseModel":"your-supported-model","datasetId":"your-dataset-id"}`}
          </code>
        </pre>

        <p className="mn-muted">
          Illustrative route only; model IDs, dataset IDs, and job creation
          schema must be confirmed.
        </p>
      </section>

      {/* Production considerations */}
      <section className="mn-model-card mn-finetuning-card">
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

      {/* Related pages */}
      <nav className="mn-finetuning-links" aria-label="Related pages">
        <Link href="/usage" className="button">
          View usage
        </Link>

        <Link href="/logs" className="button">
          View logs
        </Link>
      </nav>

      {/* Shared Explore API Keys component */}
      {apiKeyModalOpen && (
        <ExploreApiKeys
          onClose={() => setApiKeyModalOpen(false)}
        />
      )}

      <style>{`
        .mn-finetuning-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          width: 100%;
        }

        .mn-finetuning-heading {
          min-width: 0;
        }

        .mn-finetuning-header-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          flex-wrap: wrap;
          gap: 12px;
          flex-shrink: 0;
          margin-top: 4px;
        }

        .mn-finetuning-header-actions > button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          white-space: nowrap;
        }

        .mn-back-arrow-only {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          margin-bottom: 16px;
          padding: 0;
          border: 1px solid var(--mn-border, #e5e5e5);
          border-radius: 10px;
          background: transparent;
          color: inherit;
          cursor: pointer;
          transition:
            background 0.2s ease,
            border-color 0.2s ease;
        }

        .mn-back-arrow-only:hover {
          background: var(--mn-hover, #f3f4f6);
          border-color: #cbd5e1;
        }

        .mn-back-arrow-only:focus-visible {
          outline: 2px solid var(--mn-primary, #315fe8);
          outline-offset: 3px;
        }

        .mn-finetuning-card {
          padding: 24px;
          margin-top: 16px;
        }

        .mn-finetuning-card:first-of-type {
          margin-top: 24px;
        }

        .mn-finetuning-code {
          overflow-x: auto;
          padding: 16px;
          border-radius: 9px;
        }

        .mn-finetuning-links {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 20px;
        }

        @media (max-width: 650px) {
          .mn-finetuning-header {
            flex-direction: column;
          }

          .mn-finetuning-header-actions {
            width: 100%;
            justify-content: flex-start;
          }

          .mn-finetuning-card {
            padding: 18px;
          }
        }
      `}</style>
    </main>
  );
}
