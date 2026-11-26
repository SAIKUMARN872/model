"use client";

import {
  ArrowRight,
  Brain,
  Database,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";

type PipelineGridProps = {
  retrievalEnabled?: boolean;
  rerankingEnabled?: boolean;
  compressionEnabled?: boolean;
};

export default function PipelineGrid({
  retrievalEnabled = true,
  rerankingEnabled = true,
  compressionEnabled = true,
}: PipelineGridProps) {
  const steps = [
    {
      title: "Ingestion",
      description: "Load and process knowledge sources",
      icon: Zap,
      enabled: true,
    },
    {
      title: "Chunking",
      description: "Split content into searchable chunks",
      icon: Sparkles,
      enabled: true,
    },
    {
      title: "Embeddings",
      description: "Convert content into vectors",
      icon: Brain,
      enabled: true,
    },
    {
      title: "Vector Store",
      description: "Store and index embeddings",
      icon: Database,
      enabled: true,
    },
    {
      title: "Retrieval",
      description: "Find relevant knowledge",
      icon: Search,
      enabled: retrievalEnabled,
    },
    {
      title: "Reranking",
      description: "Improve relevance ranking",
      icon: ArrowRight,
      enabled: rerankingEnabled,
    },
    {
      title: "Compression",
      description: "Optimize retrieved context",
      icon: Sparkles,
      enabled: compressionEnabled,
    },
  ];

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
      {steps.map((step, index) => {
        const Icon = step.icon;

        return (
          <div
            key={step.title}
            className={`relative rounded-2xl border p-4 transition ${
              step.enabled
                ? "border-white/10 bg-[#0b101b]"
                : "border-white/5 bg-white/[0.02] opacity-50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                <Icon size={18} className="text-violet-400" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-gray-600">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <h3 className="text-sm font-medium text-white">
                    {step.title}
                  </h3>
                </div>

                <p className="mt-1 text-xs leading-5 text-gray-500">
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}