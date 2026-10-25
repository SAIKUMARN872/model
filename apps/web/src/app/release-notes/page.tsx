
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Rocket,
  Search,
  Sparkles,
  Wrench,
} from "lucide-react";

type ReleaseCategory = "All updates" | "New features" | "Improvements" | "Bug fixes";

type ReleaseItem = {
  id: string;
  date: string;
  version: string;
  title: string;
  description: string;
  category: Exclude<ReleaseCategory, "All updates">;
  details: string[];
};

const releases: ReleaseItem[] = [
  {
    id: "modelnow-initial",
    date: "October 12, 2026",
    version: "v0.1.0",
    title: "ModelNow early access",
    description:
      "Introducing the early ModelNow workspace for exploring AI-powered conversations and productivity tools.",
    category: "New features",
    details: [
      "Chat workspace for interacting with AI.",
      "Knowledge Hub interface for exploring document-based knowledge workflows.",
      "Computer Use interface for exploring desktop automation workflows.",
      "Multimodal AI workspace for exploring text, image, audio, and video workflows.",
    ],
  },
  {
    id: "knowledge-hub",
    date: "October 12, 2026",
    version: "v0.1.0",
    title: "Knowledge Hub workspace",
    description:
      "A dedicated workspace for organizing knowledge and exploring document ingestion and retrieval workflows.",
    category: "New features",
    details: [
      "Knowledge base and document ingestion interface.",
      "Retrieval and RAG configuration views.",
      "Web knowledge interface for exploring URL-based ingestion.",
    ],
  },
  {
    id: "computer-use",
    date: "October 12, 2026",
    version: "v0.1.0",
    title: "Computer Use workspace",
    description:
      "A dedicated interface for exploring computer-use tasks, planning, and execution workflows.",
    category: "New features",
    details: [
      "Task planning and execution views.",
      "Desktop, mouse, keyboard, and vision panels.",
      "Approval and verification workflow interface.",
    ],
  },
];

const categories: ReleaseCategory[] = [
  "All updates",
  "New features",
  "Improvements",
  "Bug fixes",
];

function categoryIcon(category: ReleaseItem["category"]) {
  if (category === "New features") return <Sparkles size={15} />;
  if (category === "Improvements") return <Wrench size={15} />;
  return <CheckCircle2 size={15} />;
}

export default function ReleaseNotesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] =
    useState<ReleaseCategory>("All updates");
  const [filterOpen, setFilterOpen] = useState(false);
  const [expanded, setExpanded] = useState<string[]>([
    "modelnow-initial",
  ]);

  const filteredReleases = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return releases.filter((release) => {
      const matchesCategory =
        category === "All updates" || release.category === category;

      const searchableText = [
        release.title,
        release.description,
        release.version,
        release.date,
        ...release.details,
      ]
        .join(" ")
        .toLowerCase();

      return (
        matchesCategory &&
        (!normalizedQuery || searchableText.includes(normalizedQuery))
      );
    });
  }, [query, category]);

  function toggleExpanded(id: string) {
    setExpanded((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/chat"
            className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Sparkles size={19} />
            </span>
            <span className="text-lg font-semibold tracking-tight">
              ModelNow
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Product updates
            </div>
            <Link
              href="/chat"
              className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium transition hover:bg-slate-50"
            >
              Open ModelNow
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        <nav
          aria-label="Breadcrumb"
          className="mb-9 flex flex-wrap items-center gap-2 text-sm text-slate-500"
        >
          <Link href="/help" className="hover:text-slate-900">
            Help Center
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-slate-800">ModelNow</span>
          <span aria-hidden="true">/</span>
          <span className="font-medium text-slate-900">
            Release notes
          </span>
        </nav>

        <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16">
          <div className="min-w-0">
            <div className="mb-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600">
                <Rocket size={14} />
                Product changelog
              </div>

              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                ModelNow release notes
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                Review the latest updates, new features, improvements, and
                changes to ModelNow.
              </p>

              <p className="mt-4 flex items-center gap-2 text-sm text-slate-500">
                <CalendarDays size={16} />
                Latest updates appear first
              </p>
            </div>

            <div className="mb-7 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search release notes"
                  aria-label="Search release notes"
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                />
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setFilterOpen((open) => !open)}
                  aria-expanded={filterOpen}
                  className="flex h-11 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 px-4 text-sm font-medium hover:bg-slate-50 sm:w-44"
                >
                  {category}
                  <ChevronDown size={16} />
                </button>

                {filterOpen && (
                  <div className="absolute right-0 top-12 z-20 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                    {categories.map((item) => (
                      <button
                        type="button"
                        key={item}
                        onClick={() => {
                          setCategory(item);
                          setFilterOpen(false);
                        }}
                        className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                          category === item
                            ? "bg-slate-100 font-medium"
                            : "hover:bg-slate-50"
                        }`}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-0">
              {filteredReleases.map((release, index) => {
                const isExpanded = expanded.includes(release.id);

                return (
                  <article
                    key={release.id}
                    className="relative border-t border-slate-200 py-7 sm:py-8"
                  >
                    {index === 0 && (
                      <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        <CircleDot size={12} />
                        Latest update
                      </div>
                    )}

                    <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500">
                      <time>{release.date}</time>
                      <span aria-hidden="true">·</span>
                      <span className="rounded-md border border-slate-200 px-2 py-0.5 text-xs">
                        {release.version}
                      </span>
                    </div>

                    <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
                      {release.title}
                    </h2>

                    <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base">
                      {release.description}
                    </p>

                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                        {categoryIcon(release.category)}
                        {release.category}
                      </span>

                      <button
                        type="button"
                        onClick={() => toggleExpanded(release.id)}
                        aria-expanded={isExpanded}
                        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
                      >
                        {isExpanded ? "Show less" : "Read more"}
                        <ChevronDown
                          size={15}
                          className={`transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="mt-5 rounded-xl bg-slate-50 p-4 sm:p-5">
                        <h3 className="mb-3 text-sm font-semibold">
                          What’s included
                        </h3>
                        <ul className="space-y-2.5">
                          {release.details.map((detail) => (
                            <li
                              key={detail}
                              className="flex items-start gap-2.5 text-sm leading-6 text-slate-600"
                            >
                              <CheckCircle2
                                size={16}
                                className="mt-1 shrink-0 text-emerald-600"
                              />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </article>
                );
              })}

              {filteredReleases.length === 0 && (
                <div className="border-t border-slate-200 py-12 text-center">
                  <Search
                    size={24}
                    className="mx-auto mb-3 text-slate-400"
                  />
                  <h2 className="font-medium">No updates found</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Try another search or select a different category.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setCategory("All updates");
                    }}
                    className="mt-4 text-sm font-medium underline underline-offset-4"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 py-6 text-sm text-slate-500">
              You’re viewing the available ModelNow release history.
            </div>
          </div>

          <aside className="h-fit rounded-2xl border border-slate-200 p-5 lg:sticky lg:top-24">
            <h2 className="font-semibold">About release notes</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Find product changes in one place. Each entry describes an
              update and groups its related features or improvements.
            </p>

            <div className="my-5 border-t border-slate-200" />

            <h3 className="text-sm font-semibold">Browse updates</h3>
            <div className="mt-3 space-y-1">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => {
                    setCategory(item);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                    category === item
                      ? "bg-slate-100 font-medium text-slate-900"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {item}
                  <ArrowUpRight size={14} />
                </button>
              ))}
            </div>

            <div className="my-5 border-t border-slate-200" />

            <Link
              href="/help"
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-black"
            >
              <ArrowLeft size={15} />
              Back to Help Center
            </Link>
          </aside>
        </section>

        <footer className="mt-12 border-t border-slate-200 py-6 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} ModelNow
        </footer>
      </div>
    </main>
  );
}
