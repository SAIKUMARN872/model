
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

  return (
    <main className="mn-dashboard mn-page">
      <div className="mn-multimodal-header">
        <button
          type="button"
          className="mn-back-arrow-only"
          onClick={handleBackToOverview}
          aria-label="Back to overview"
          title="Back to overview"
        >
          <ArrowLeft size={20} aria-hidden="true" />
        </button>

        <div className="mn-header-actions">
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

      <header className="mn-page__header">
        <div>
          <p className="mn-muted">MODELNOW DEVELOPER API</p>
          <h1>Multimodal AI API</h1>
          <p className="mn-muted">
            Build workflows combining supported text, image, audio, and other media inputs.
          </p>
        </div>
      </header>

      <section
        className="mn-model-card"
        style={{ padding: 24, marginTop: 24 }}
      >
        <h2>Overview</h2>
        <p>
          Supported inputs and outputs depend on the configured models,
          processing services, file limits, and applicable safety checks.
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
          Keep credentials on a trusted server and never embed secret keys in
          browser code.
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
          <code>POST /api/v1/multimodal-ai</code>
        </pre>

        <p>Example request body:</p>

        <pre style={{ overflowX: "auto", padding: 16 }}>
          <code>{`{"input":{"type":"text","text":"Describe your task here"}}`}</code>
        </pre>

        <p className="mn-muted">
          Illustrative route only; verify supported modalities, payload format,
          and the actual backend endpoint.
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
            Authenticate requests and enforce account, subscription, and API-key status.
          </li>
          <li>
            Apply rate limits and usage or credit quotas independently.
          </li>
          <li>
            Validate request schemas and enforce authorization at the server boundary.
          </li>
          <li>
            Return documented errors and request identifiers; avoid logging secrets.
          </li>
        </ul>
      </section>

      <nav className="mn-multimodal-nav">
        <Link href="/usage" className="button">
          View usage
        </Link>

        <Link href="/logs" className="button">
          View logs
        </Link>
      </nav>

      {showApiKeyModal && (
        <ExploreApiKeys
          onClose={() => setShowApiKeyModal(false)}
        />
      )}

      <style>{`
        .mn-multimodal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .mn-header-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .mn-back-arrow-only {
          display: grid;
          place-items: center;
          width: 40px;
          height: 40px;
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
          gap: 8px;
          white-space: nowrap;
        }

        .mn-multimodal-nav {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 20px;
        }

        @media (max-width: 560px) {
          .mn-multimodal-header {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .mn-header-actions {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </main>
  );
}
