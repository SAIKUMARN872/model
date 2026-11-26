"use client";

import {
  FileAudio,
  FileImage,
  FileSpreadsheet,
  FileText,
  Globe,
  Link2,
  Mail,
  Database,
  Cloud,
  Upload,
} from "lucide-react";

import Section from "./Section";
import PipelineGrid from "./PipelineGrid";

type IngestionViewProps = {
  expandedSections: Record<string, boolean>;
  onToggleSection: (id: string) => void;
  onOpenSourceModal?: () => void;
};

export default function IngestionView({
  expandedSections,
  onToggleSection,
  onOpenSourceModal,
}: IngestionViewProps) {
  const sources = [
    {
      title: "Documents",
      description: "PDF, DOCX, TXT and other documents",
      icon: FileText,
    },
    {
      title: "Spreadsheets",
      description: "CSV and structured data files",
      icon: FileSpreadsheet,
    },
    {
      title: "Images",
      description: "Extract knowledge from images",
      icon: FileImage,
    },
    {
      title: "Audio",
      description: "Transcribe and index audio",
      icon: FileAudio,
    },
    {
      title: "Web",
      description: "Ingest web pages and URLs",
      icon: Globe,
    },
    {
      title: "Email",
      description: "Connect organizational email",
      icon: Mail,
    },
    {
      title: "Databases",
      description: "Connect structured databases",
      icon: Database,
    },
    {
      title: "Cloud",
      description: "Connect cloud storage",
      icon: Cloud,
    },
  ];

  return (
    <div className="space-y-5">
      <Section
        id="ingestion-sources"
        title="Knowledge Sources"
        description="Connect the sources that contain your organization's knowledge."
        icon={Upload}
        expanded={expandedSections["ingestion-sources"] ?? true}
        onToggle={onToggleSection}
      >
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {sources.map((source) => {
            const Icon = source.icon;

            return (
              <button
                key={source.title}
                type="button"
                onClick={onOpenSourceModal}
                className="group rounded-2xl border border-white/10 bg-white/[0.02] p-4 text-left transition hover:border-violet-500/30 hover:bg-violet-500/[0.03]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
                  <Icon
                    size={18}
                    className="text-violet-400 transition group-hover:scale-105"
                  />
                </div>

                <div className="mt-4 text-sm font-medium text-white">
                  {source.title}
                </div>

                <div className="mt-1 text-xs leading-5 text-gray-500">
                  {source.description}
                </div>
              </button>
            );
          })}
        </div>
      </Section>

      <Section
        id="ingestion-pipeline"
        title="Ingestion Pipeline"
        description="Knowledge processing flow from source to searchable vectors."
        icon={Link2}
        expanded={expandedSections["ingestion-pipeline"] ?? true}
        onToggle={onToggleSection}
      >
        <PipelineGrid />
      </Section>
    </div>
  );
}