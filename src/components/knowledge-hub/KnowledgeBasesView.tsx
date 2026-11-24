"use client";

import {
  BookOpen,
  Database,
  Plus,
  RefreshCw,
} from "lucide-react";

import Section from "./Section";
import MiniStat from "./MiniStat";
import StatusBadge from "./StatusBadge";

type Collection = {
  id: number;
  name: string;
  description: string;
  documents: number;
  chunks: string;
  type: "Private" | "Shared";
};

type KnowledgeDocument = {
  id: number;
  name: string;
  source: string;
  collection: string;
  chunks: number;
  status: "Indexed" | "Processing" | "Error";
  updated: string;
  size: string;
};

type KnowledgeBasesViewProps = {
  collections: Collection[];
  documents: KnowledgeDocument[];
  expandedSections: Record<string, boolean>;
  onToggleSection: (id: string) => void;
  onCreateCollection: () => void;
  onSync: () => void;
};

export default function KnowledgeBasesView({
  collections,
  documents,
  expandedSections,
  onToggleSection,
  onCreateCollection,
  onSync,
}: KnowledgeBasesViewProps) {
  return (
    <div className="space-y-5">
      <Section
        id="knowledge-bases"
        title="Knowledge Bases"
        description="Organize documents into searchable collections"
        icon={BookOpen}
        expanded={expandedSections["knowledge-bases"] ?? true}
        onToggle={onToggleSection}
      >
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-medium text-white">
                Collections
              </div>

              <div className="mt-1 text-xs text-gray-500">
                Manage your organization's knowledge sources.
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onSync}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-gray-300 transition hover:bg-white/5"
              >
                <RefreshCw size={14} />
                Sync
              </button>

              <button
                type="button"
                onClick={onCreateCollection}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-violet-500"
              >
                <Plus size={14} />
                New collection
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {collections.map((collection) => (
              <div
                key={collection.id}
                className="rounded-2xl border border-white/10 bg-[#0b101b] p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                    <Database
                      size={18}
                      className="text-violet-400"
                    />
                  </div>

                  <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] text-gray-400">
                    {collection.type}
                  </span>
                </div>

                <div className="mt-4 text-sm font-medium text-white">
                  {collection.name}
                </div>

                <div className="mt-1 text-xs leading-5 text-gray-500">
                  {collection.description}
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <MiniStat
                    label="Documents"
                    value={collection.documents}
                  />

                  <MiniStat
                    label="Chunks"
                    value={collection.chunks}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section
        id="documents"
        title="Documents"
        description="View indexed documents and processing status"
        icon={BookOpen}
        expanded={expandedSections.documents ?? true}
        onToggle={onToggleSection}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs text-gray-500">
                <th className="pb-3 font-medium">Document</th>
                <th className="pb-3 font-medium">Source</th>
                <th className="pb-3 font-medium">Collection</th>
                <th className="pb-3 font-medium">Chunks</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Updated</th>
              </tr>
            </thead>

            <tbody>
              {documents.map((document) => (
                <tr
                  key={document.id}
                  className="border-b border-white/5 text-sm"
                >
                  <td className="py-4 text-white">
                    {document.name}
                  </td>

                  <td className="py-4 text-gray-400">
                    {document.source}
                  </td>

                  <td className="py-4 text-gray-400">
                    {document.collection}
                  </td>

                  <td className="py-4 text-gray-400">
                    {document.chunks}
                  </td>

                  <td className="py-4">
                    <StatusBadge status={document.status} />
                  </td>

                  <td className="py-4 text-gray-500">
                    {document.updated}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>
    </div>
  );
}