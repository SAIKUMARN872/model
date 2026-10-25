"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Globe,
  Link2,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
  Upload,
  X,
  Zap,
} from "lucide-react";

type Website = {
  id: number;
  name: string;
  url: string;
  pages: number;
  chunks: number;
  status: "Indexed" | "Indexing" | "Failed";
  lastCrawled: string;
  visibility: "Private" | "Shared";
};

const initialWebsites: Website[] = [
  {
    id: 1,
    name: "ModelNow Documentation",
    url: "https://docs.modelnow.ai",
    pages: 184,
    chunks: 12640,
    status: "Indexed",
    lastCrawled: "12 min ago",
    visibility: "Private",
  },
  {
    id: 2,
    name: "ModelNow Website",
    url: "https://modelnow.ai",
    pages: 96,
    chunks: 7340,
    status: "Indexed",
    lastCrawled: "1 hour ago",
    visibility: "Shared",
  },
  {
    id: 3,
    name: "AI Research Portal",
    url: "https://research.example.com",
    pages: 42,
    chunks: 3180,
    status: "Indexing",
    lastCrawled: "Running now",
    visibility: "Private",
  },
];

export default function WebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>(initialWebsites);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [websiteName, setWebsiteName] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [visibility, setVisibility] =
    useState<Website["visibility"]>("Private");
  const [autoCrawl, setAutoCrawl] = useState(true);
  const [crawlFrequency, setCrawlFrequency] = useState("Daily");
  const [chunkSize, setChunkSize] = useState("800");
  const [overlap, setOverlap] = useState("120");

  const filteredWebsites = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return websites;

    return websites.filter(
      (website) =>
        website.name.toLowerCase().includes(query) ||
        website.url.toLowerCase().includes(query) ||
        website.status.toLowerCase().includes(query)
    );
  }, [websites, search]);

  const totalPages = websites.reduce((sum, item) => sum + item.pages, 0);
  const totalChunks = websites.reduce((sum, item) => sum + item.chunks, 0);
  const indexedCount = websites.filter(
    (item) => item.status === "Indexed"
  ).length;

  function addWebsite() {
    if (!websiteName.trim() || !websiteUrl.trim()) return;

    const newWebsite: Website = {
      id: Date.now(),
      name: websiteName.trim(),
      url: websiteUrl.trim(),
      pages: 0,
      chunks: 0,
      status: "Indexing",
      lastCrawled: "Starting now",
      visibility,
    };

    setWebsites((current) => [newWebsite, ...current]);
    setWebsiteName("");
    setWebsiteUrl("");
    setVisibility("Private");
    setShowAdd(false);
  }

  function deleteWebsite(id: number) {
    setWebsites((current) => current.filter((website) => website.id !== id));
  }

  function reindexWebsite(id: number) {
    setWebsites((current) =>
      current.map((website) =>
        website.id === id
          ? {
              ...website,
              status: "Indexing",
              lastCrawled: "Running now",
            }
          : website
      )
    );

    setTimeout(() => {
      setWebsites((current) =>
        current.map((website) =>
          website.id === id
            ? {
                ...website,
                status: "Indexed",
                lastCrawled: "Just now",
              }
            : website
        )
      );
    }, 1500);
  }

  return (
    <main className="min-h-screen bg-[#f7f8fa] text-[#111827]">
      <div className="mx-auto max-w-[1500px] px-6 py-7">
        {/* Header */}
        <div className="mb-7 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/agent-builder/knowledge"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5e7eb] bg-white text-[#6b7280] transition hover:bg-[#f3f4f6]"
            >
              <ArrowLeft size={17} />
            </Link>

            <div>
              <div className="flex items-center gap-2">
                <Globe size={20} className="text-[#2563eb]" />
                <h1 className="text-[24px] font-semibold tracking-[-0.02em]">
                  Websites
                </h1>
              </div>
              <p className="mt-1 text-[13px] text-[#6b7280]">
                Crawl websites and make their content available to your agents.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 rounded-lg bg-[#111827] px-4 py-2.5 text-[13px] font-medium text-white transition hover:bg-[#1f2937]"
          >
            <Plus size={16} />
            Add website
          </button>
        </div>

        {/* Metrics */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <MetricCard
            icon={<Globe size={18} />}
            label="Websites"
            value={websites.length.toString()}
            description={`${indexedCount} indexed`}
          />

          <MetricCard
            icon={<Activity size={18} />}
            label="Indexed pages"
            value={totalPages.toLocaleString()}
            description="Across all websites"
          />

          <MetricCard
            icon={<Link2 size={18} />}
            label="Knowledge chunks"
            value={totalChunks.toLocaleString()}
            description="Available for RAG"
          />

          <MetricCard
            icon={<Zap size={18} />}
            label="Crawler"
            value="Active"
            description="Automatic indexing enabled"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_330px]">
          {/* Main */}
          <section>
            <div className="rounded-xl border border-[#e5e7eb] bg-white">
              <div className="flex flex-col gap-4 border-b border-[#eef0f2] p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-[15px] font-semibold">
                    Website knowledge sources
                  </h2>
                  <p className="mt-1 text-[12px] text-[#6b7280]">
                    Manage crawled websites used by your knowledge system.
                  </p>
                </div>

                <div className="relative w-full sm:w-[250px]">
                  <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                  />
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search websites..."
                    className="h-9 w-full rounded-lg border border-[#e5e7eb] bg-[#fafafa] pl-9 pr-3 text-[12px] outline-none transition focus:border-[#9ca3af]"
                  />
                </div>
              </div>

              <div className="divide-y divide-[#eef0f2]">
                {filteredWebsites.length === 0 ? (
                  <div className="px-6 py-14 text-center">
                    <Globe
                      size={30}
                      className="mx-auto mb-3 text-[#c4c9d1]"
                    />
                    <p className="text-[13px] font-medium">
                      No websites found
                    </p>
                    <p className="mt-1 text-[12px] text-[#6b7280]">
                      Try a different search or add a new website.
                    </p>
                  </div>
                ) : (
                  filteredWebsites.map((website) => (
                    <WebsiteRow
                      key={website.id}
                      website={website}
                      onDelete={() => deleteWebsite(website.id)}
                      onReindex={() => reindexWebsite(website.id)}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Crawl Activity */}
            <div className="mt-6 rounded-xl border border-[#e5e7eb] bg-white">
              <div className="border-b border-[#eef0f2] px-5 py-4">
                <h2 className="text-[14px] font-semibold">Crawler activity</h2>
              </div>

              <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-3">
                <ActivityCard
                  icon={<CheckCircle2 size={17} />}
                  title="Successful crawls"
                  value="128"
                  text="No indexing errors"
                />

                <ActivityCard
                  icon={<Clock3 size={17} />}
                  title="Average crawl"
                  value="2m 18s"
                  text="Across all sources"
                />

                <ActivityCard
                  icon={<ShieldCheck size={17} />}
                  title="Secure sources"
                  value="100%"
                  text="HTTPS sources"
                />
              </div>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="space-y-5">
            <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <Settings2 size={17} className="text-[#6b7280]" />
                <h2 className="text-[14px] font-semibold">Crawler settings</h2>
              </div>

              <div className="space-y-5">
                <ToggleRow
                  label="Automatic crawling"
                  description="Keep website content updated automatically."
                  enabled={autoCrawl}
                  onChange={setAutoCrawl}
                />

                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#374151]">
                    Crawl frequency
                  </label>
                  <select
                    value={crawlFrequency}
                    onChange={(e) => setCrawlFrequency(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[#e5e7eb] bg-white px-3 text-[12px] outline-none"
                  >
                    <option>Hourly</option>
                    <option>Daily</option>
                    <option>Weekly</option>
                    <option>Monthly</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#374151]">
                    Chunk size
                  </label>
                  <input
                    value={chunkSize}
                    onChange={(e) => setChunkSize(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[#e5e7eb] px-3 text-[12px] outline-none focus:border-[#9ca3af]"
                  />
                  <p className="mt-1 text-[11px] text-[#9ca3af]">
                    Number of tokens per knowledge chunk.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-[12px] font-medium text-[#374151]">
                    Chunk overlap
                  </label>
                  <input
                    value={overlap}
                    onChange={(e) => setOverlap(e.target.value)}
                    className="h-9 w-full rounded-lg border border-[#e5e7eb] px-3 text-[12px] outline-none focus:border-[#9ca3af]"
                  />
                </div>

                <button className="w-full rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-[12px] font-medium text-[#374151] transition hover:bg-[#f9fafb]">
                  Save settings
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
              <h2 className="mb-3 text-[14px] font-semibold">
                Website ingestion
              </h2>

              <div className="space-y-3 text-[12px] text-[#6b7280]">
                <InfoRow
                  label="Crawler"
                  value="Active"
                  valueClass="text-emerald-600"
                />
                <InfoRow label="Sitemap" value="Auto detected" />
                <InfoRow label="Robots.txt" value="Respected" />
                <InfoRow label="HTTPS" value="Required" />
                <InfoRow label="JavaScript" value="Supported" />
              </div>
            </div>

            <div className="rounded-xl border border-[#dbeafe] bg-[#eff6ff] p-5">
              <div className="mb-2 flex items-center gap-2 text-[#2563eb]">
                <ShieldCheck size={17} />
                <h2 className="text-[13px] font-semibold">
                  Knowledge security
                </h2>
              </div>

              <p className="text-[11px] leading-5 text-[#4b6b91]">
                Website content is processed into knowledge chunks before being
                used by your agents. Access follows the configured knowledge
                permissions.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Add Website Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-5">
          <div className="w-full max-w-[520px] rounded-xl border border-[#e5e7eb] bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#eef0f2] px-5 py-4">
              <div>
                <h2 className="text-[15px] font-semibold">
                  Add website source
                </h2>
                <p className="mt-1 text-[11px] text-[#6b7280]">
                  Add a website for crawling and knowledge indexing.
                </p>
              </div>

              <button
                onClick={() => setShowAdd(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[#6b7280] hover:bg-[#f3f4f6]"
              >
                <X size={17} />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[#374151]">
                  Website name
                </label>
                <input
                  value={websiteName}
                  onChange={(e) => setWebsiteName(e.target.value)}
                  placeholder="e.g. Product Documentation"
                  className="h-10 w-full rounded-lg border border-[#e5e7eb] px-3 text-[12px] outline-none focus:border-[#9ca3af]"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[#374151]">
                  Website URL
                </label>
                <div className="relative">
                  <Link2
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]"
                  />
                  <input
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="h-10 w-full rounded-lg border border-[#e5e7eb] pl-9 pr-3 text-[12px] outline-none focus:border-[#9ca3af]"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[12px] font-medium text-[#374151]">
                  Visibility
                </label>

                <div className="grid grid-cols-2 gap-3">
                  {(["Private", "Shared"] as const).map((item) => (
                    <button
                      key={item}
                      onClick={() => setVisibility(item)}
                      className={`rounded-lg border px-3 py-3 text-left transition ${
                        visibility === item
                          ? "border-[#111827] bg-[#f9fafb]"
                          : "border-[#e5e7eb] bg-white hover:bg-[#f9fafb]"
                      }`}
                    >
                      <div className="text-[12px] font-medium">{item}</div>
                      <div className="mt-1 text-[10px] leading-4 text-[#6b7280]">
                        {item === "Private"
                          ? "Only your agent can access this source."
                          : "Available to permitted team members."}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-[#f8fafc] p-3 text-[11px] leading-5 text-[#64748b]">
                <div className="flex items-center gap-2 font-medium text-[#475569]">
                  <Upload size={14} />
                  What happens next?
                </div>
                <p className="mt-1">
                  The crawler discovers pages, extracts content, creates
                  chunks, and makes the resulting knowledge available to RAG.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-[#eef0f2] px-5 py-4">
              <button
                onClick={() => setShowAdd(false)}
                className="rounded-lg border border-[#e5e7eb] px-4 py-2 text-[12px] font-medium text-[#374151] hover:bg-[#f9fafb]"
              >
                Cancel
              </button>

              <button
                onClick={addWebsite}
                disabled={!websiteName.trim() || !websiteUrl.trim()}
                className="rounded-lg bg-[#111827] px-4 py-2 text-[12px] font-medium text-white transition hover:bg-[#1f2937] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Add & index
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function MetricCard({
  icon,
  label,
  value,
  description,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-xl border border-[#e5e7eb] bg-white p-5">
      <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-[#f3f4f6] text-[#4b5563]">
        {icon}
      </div>
      <div className="text-[12px] text-[#6b7280]">{label}</div>
      <div className="mt-1 text-[22px] font-semibold tracking-[-0.02em]">
        {value}
      </div>
      <div className="mt-1 text-[11px] text-[#9ca3af]">{description}</div>
    </div>
  );
}

function WebsiteRow({
  website,
  onDelete,
  onReindex,
}: {
  website: Website;
  onDelete: () => void;
  onReindex: () => void;
}) {
  const isIndexing = website.status === "Indexing";

  return (
    <div className="px-5 py-4 transition hover:bg-[#fafafa]">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#eff6ff] text-[#2563eb]">
            <Globe size={18} />
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[13px] font-semibold">{website.name}</h3>

              <StatusBadge status={website.status} />
              <span className="rounded-full bg-[#f3f4f6] px-2 py-0.5 text-[10px] text-[#6b7280]">
                {website.visibility}
              </span>
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-[#6b7280]">
              <Link2 size={12} />
              <span className="truncate">{website.url}</span>
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-4 text-[10px] text-[#9ca3af]">
              <span>{website.pages.toLocaleString()} pages</span>
              <span>{website.chunks.toLocaleString()} chunks</span>
              <span>Last crawled: {website.lastCrawled}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 lg:shrink-0">
          <button
            onClick={onReindex}
            disabled={isIndexing}
            className="flex items-center gap-1.5 rounded-lg border border-[#e5e7eb] px-3 py-2 text-[11px] font-medium text-[#374151] transition hover:bg-[#f9fafb] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isIndexing ? (
              <Loader2 size={13} className="animate-spin" />
            ) : (
              <RefreshCw size={13} />
            )}
            {isIndexing ? "Indexing" : "Re-index"}
          </button>

          <button
            onClick={onDelete}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#9ca3af] transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            title="Delete website"
          >
            <Trash2 size={14} />
          </button>

          <Link
            href={`/agent-builder/knowledge/websites/${website.id}`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#e5e7eb] text-[#6b7280] transition hover:bg-[#f9fafb]"
          >
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Website["status"] }) {
  if (status === "Indexed") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-[#ecfdf3] px-2 py-0.5 text-[10px] font-medium text-[#15803d]">
        <CheckCircle2 size={11} />
        Indexed
      </span>
    );
  }

  if (status === "Indexing") {
    return (
      <span className="flex items-center gap-1 rounded-full bg-[#eff6ff] px-2 py-0.5 text-[10px] font-medium text-[#2563eb]">
        <Loader2 size={11} className="animate-spin" />
        Indexing
      </span>
    );
  }

  return (
    <span className="rounded-full bg-[#fef2f2] px-2 py-0.5 text-[10px] font-medium text-[#dc2626]">
      Failed
    </span>
  );
}

function ActivityCard({
  icon,
  title,
  value,
  text,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-[#eef0f2] bg-[#fafafa] p-4">
      <div className="mb-3 flex items-center gap-2 text-[#6b7280]">
        {icon}
        <span className="text-[11px]">{title}</span>
      </div>

      <div className="text-[19px] font-semibold">{value}</div>
      <p className="mt-1 text-[10px] text-[#9ca3af]">{text}</p>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <div className="text-[12px] font-medium text-[#374151]">{label}</div>
        <div className="mt-1 text-[10px] leading-4 text-[#9ca3af]">
          {description}
        </div>
      </div>

      <button
        onClick={() => onChange(!enabled)}
        className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition ${
          enabled ? "bg-[#111827]" : "bg-[#d1d5db]"
        }`}
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition ${
            enabled ? "left-[18px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function InfoRow({
  label,
  value,
  valueClass = "text-[#374151]",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span>{label}</span>
      <span className={`font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}