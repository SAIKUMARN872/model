"use client";

import { Search, SlidersHorizontal } from "lucide-react";

import Section from "./Section";
import Toggle from "./Toggle";

type SearchResult = {
  id: number;
  title: string;
  collection: string;
  score: number;
  content: string;
};

type RetrievalViewProps = {
  expandedSections: Record<string, boolean>;
  onToggleSection: (id: string) => void;
  searchQuery: string;
  onSearchQueryChange: (value: string) => void;
  searchResults: SearchResult[];
  retrievalMode: string;
  onRetrievalModeChange: (value: string) => void;
  rerankingEnabled: boolean;
  onRerankingChange: () => void;
};

export default function RetrievalView({
  expandedSections,
  onToggleSection,
  searchQuery,
  onSearchQueryChange,
  searchResults,
  retrievalMode,
  onRetrievalModeChange,
  rerankingEnabled,
  onRerankingChange,
}: RetrievalViewProps) {
  return (
    <div className="space-y-5">
      <Section
        id="retrieval"
        title="Semantic Retrieval"
        description="Search knowledge using semantic similarity"
        icon={Search}
        expanded={expandedSections.retrieval ?? true}
        onToggle={onToggleSection}
      >
        <div className="space-y-5">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
              />

              <input
                value={searchQuery}
                onChange={(event) =>
                  onSearchQueryChange(event.target.value)
                }
                placeholder="Search your knowledge..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white outline-none placeholder:text-gray-600 focus:border-violet-500/40"
              />
            </div>

            <select
              value={retrievalMode}
              onChange={(event) =>
                onRetrievalModeChange(event.target.value)
              }
              className="rounded-xl border border-white/10 bg-[#0b101b] px-4 py-3 text-sm text-gray-300 outline-none"
            >
              <option value="Semantic">Semantic</option>
              <option value="Keyword">Keyword</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
                <SlidersHorizontal
                  size={16}
                  className="text-violet-400"
                />
              </div>

              <div>
                <div className="text-sm font-medium text-white">
                  Reranking
                </div>

                <div className="mt-1 text-xs text-gray-500">
                  Improve result relevance after retrieval
                </div>
              </div>
            </div>

            <Toggle
              checked={rerankingEnabled}
              onChange={onRerankingChange}
              label="Enable reranking"
            />
          </div>

          <div className="space-y-3">
            {searchResults.length === 0 ? (
              <div className="rounded-xl border border-white/10 p-8 text-center text-sm text-gray-500">
                No matching results found.
              </div>
            ) : (
              searchResults.map((result) => (
                <div
                  key={result.id}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-white">
                        {result.title}
                      </div>

                      <div className="mt-1 text-xs text-gray-500">
                        {result.collection}
                      </div>
                    </div>

                    <span className="rounded-full bg-violet-500/10 px-2.5 py-1 text-xs text-violet-400">
                      {(result.score * 100).toFixed(1)}%
                    </span>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-gray-400">
                    {result.content}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </Section>
    </div>
  );
}