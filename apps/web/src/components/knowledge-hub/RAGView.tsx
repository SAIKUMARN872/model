"use client";

import { Brain, Play, Settings2 } from "lucide-react";

import Section from "./Section";
import Toggle from "./Toggle";

type RAGViewProps = {
  expandedSections: Record<string, boolean>;
  onToggleSection: (id: string) => void;
  ragMode: string;
  onRagModeChange: (value: string) => void;
  temperature: number;
  onTemperatureChange: (value: number) => void;
  contextCompression: boolean;
  onContextCompressionChange: () => void;
  onRunRAG: () => void;
  ragRunning: boolean;
};

export default function RAGView({
  expandedSections,
  onToggleSection,
  ragMode,
  onRagModeChange,
  temperature,
  onTemperatureChange,
  contextCompression,
  onContextCompressionChange,
  onRunRAG,
  ragRunning,
}: RAGViewProps) {
  return (
    <div className="space-y-5">
      <Section
        id="rag"
        title="RAG Configuration"
        description="Configure retrieval augmented generation"
        icon={Brain}
        expanded={expandedSections.rag ?? true}
        onToggle={onToggleSection}
      >
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <label className="text-xs text-gray-500">
                RAG Mode
              </label>

              <select
                value={ragMode}
                onChange={(event) =>
                  onRagModeChange(event.target.value)
                }
                className="mt-2 w-full rounded-xl border border-white/10 bg-[#0b101b] px-3 py-2.5 text-sm text-gray-300 outline-none"
              >
                <option value="RAG">RAG</option>
                <option value="Advanced RAG">
                  Advanced RAG
                </option>
                <option value="Agentic RAG">
                  Agentic RAG
                </option>
              </select>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
              <div className="flex items-center justify-between">
                <label className="text-xs text-gray-500">
                  Temperature
                </label>

                <span className="text-xs text-violet-400">
                  {temperature.toFixed(1)}
                </span>
              </div>

              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={temperature}
                onChange={(event) =>
                  onTemperatureChange(
                    Number(event.target.value)
                  )
                }
                className="mt-4 w-full accent-violet-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10">
                <Settings2
                  size={16}
                  className="text-violet-400"
                />
              </div>

              <div>
                <div className="text-sm font-medium text-white">
                  Context Compression
                </div>

                <div className="mt-1 text-xs text-gray-500">
                  Reduce context before sending it to the model
                </div>
              </div>
            </div>

            <Toggle
              checked={contextCompression}
              onChange={onContextCompressionChange}
              label="Enable context compression"
            />
          </div>

          <button
            type="button"
            onClick={onRunRAG}
            disabled={ragRunning}
            className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Play size={15} />

            {ragRunning ? "Running..." : "Run RAG Pipeline"}
          </button>
        </div>
      </Section>
    </div>
  );
}