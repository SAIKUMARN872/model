
"use client";

import React, { useState } from "react";
import Link from "next/link";
import CreditsPopup from "../../components/explore-api-keys/CreditsPopup";
import ExploreApiKeys from "../../components/explore-api-keys/page";
import {
  ArrowLeft,
  Workflow,
  Plus,
} from "lucide-react";

export default function AgentsPage() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [notice, setNotice] = useState("");

  const [showApiKeyModal, setShowApiKeyModal] = useState(false);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNotice(
      "Draft validated locally. Connect the authenticated agents API to save or deploy this agent."
    );
  }

  return (
    <main className="mn-dashboard mn-page">
      {/* Top header actions */}
      <div className="mn-agents-header">
        <Link href="/" className="mn-back-link">
          <ArrowLeft size={16} />
          Dashboard
        </Link>

        <div className="mn-agents-header-actions">
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
        <span className="mn-resource__icon">
          <Workflow size={22} />
        </span>

        <div>
          <h1>Agents &amp; Workflows API</h1>
          <p className="mn-muted">
            Create an agent draft and design business workflows. Saving and
            deployment require the authenticated ModelNow API.
          </p>
        </div>
      </header>

      {/* Agent form */}
      <form className="mn-panel mn-agent-form" onSubmit={submit}>
        <label>
          Agent name
          <input
            required
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Support assistant"
          />
        </label>

        <label>
          Description
          <textarea
            maxLength={2000}
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Describe the agent's purpose and boundaries."
          />
        </label>

        <button className="mn-action mn-action--primary" type="submit">
          Validate agent draft
        </button>

        {notice ? (
          <p role="status" className="mn-notice">
            {notice}
          </p>
        ) : null}
      </form>

      <p className="mn-dashboard__note">
        This validates a local draft only. It does not claim to persist or
        deploy an agent until the real agents API is connected.
      </p>

      {/* Shared API Key Modal */}
      {showApiKeyModal && (
        <ExploreApiKeys
          onClose={() => setShowApiKeyModal(false)}
        />
      )}

      {/* Page styles */}
      <style>{`
        .mn-agents-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .mn-agents-header-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
        }

        .mn-create-api-key {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
        }

        @media (max-width: 560px) {
          .mn-agents-header {
            align-items: flex-start;
            flex-wrap: wrap;
          }

          .mn-agents-header-actions {
            flex-wrap: wrap;
          }
        }
      `}</style>
    </main>
  );
}
