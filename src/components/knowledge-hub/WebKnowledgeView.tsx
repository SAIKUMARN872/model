"use client";

import { useState } from "react";
import {
  Globe,
  RefreshCw,
  Check,
  Search,
  Link,
} from "lucide-react";

import ToggleCard from "./ToggleCard";
import FeatureCard from "./FeatureCard";

export default function WebKnowledgeView() {
  const [url, setUrl] = useState("");
  const [freshness, setFreshness] = useState(true);
  const [verification, setVerification] = useState(true);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleIngestUrl = async () => {
    if (!url.trim()) {
      setError("Please enter a URL.");
      setMessage("");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/knowledge/url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: url.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to ingest the URL."
        );
      }

      setMessage(
        `URL ingested successfully. ${data.ingestion.chunkCount} chunks created.`
      );

      setUrl("");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while ingesting the URL."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold">
          Web Knowledge
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          Combine enterprise knowledge with current web information.
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0b101b] p-5">
        <div className="flex items-center gap-3">
          <Globe
            size={20}
            className="text-violet-400"
          />

          <div>
            <h3 className="font-medium">
              Web Source Ingestion
            </h3>

            <p className="mt-1 text-xs text-gray-600">
              Add websites and URLs as knowledge sources.
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <input
            value={url}
            onChange={(event) => {
              setUrl(event.target.value);
              setError("");
              setMessage("");
            }}
            placeholder="https://example.com/documentation"
            className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none"
            disabled={loading}
          />

          <button
            type="button"
            onClick={handleIngestUrl}
            disabled={loading}
            className="rounded-xl bg-violet-500 px-5 py-3 text-sm font-medium transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Ingesting..." : "Ingest URL"}
          </button>
        </div>

        {message && (
          <div className="mt-4 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
            {message}
          </div>
        )}

        {error && (
          <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
     <ToggleCard
  title="Freshness Detection"
  description="Detect when indexed web content..."
  checked={freshness}
  onChange={() => setFreshness(!freshness)}
/>
<ToggleCard
  title="Source Verification"
  description="Verify source availability and..."
  checked={verification}
  onChange={() => setVerification(!verification)}
/>
    
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FeatureCard
          icon={Search}
          title="Web Search"
          description="Retrieve current information from the web."
        />

        <FeatureCard
          icon={Globe}
          title="Website Crawling"
          description="Index multiple pages from a website."
        />

        <FeatureCard
        icon={Link}
          title="URL Ingestion"
          description="Create knowledge sources from direct URLs."
        />

        <FeatureCard
          icon={RefreshCw}
          title="Freshness Monitoring"
          description="Monitor changes and synchronize sources."
        />
      </div>
    </div>
  );
}