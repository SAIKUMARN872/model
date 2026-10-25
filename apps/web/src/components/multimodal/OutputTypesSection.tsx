import {
  FileText,
  Image as ImageIcon,
  Volume2,
  Mic,
  Video,
} from "lucide-react";

import OutputCard from "./OutputCard";

export default function OutputTypesSection() {
  return (
    <section className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 md:px-8">
        <div className="mb-5">
          <h3 className="text-lg font-semibold text-slate-900">
            Output types
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            ModelNow can generate and transform multiple
            output formats from a single multimodal workflow.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-5">
          <OutputCard
            icon={FileText}
            title="Text"
            description="Reports, emails, summaries and code"
          />

          <OutputCard
            icon={ImageIcon}
            title="Image"
            description="Images, diagrams and visual concepts"
          />

          <OutputCard
            icon={Volume2}
            title="Audio"
            description="Audio generation and transformation"
          />

          <OutputCard
            icon={Mic}
            title="Voice"
            description="Voice answers and narration"
          />

          <OutputCard
            icon={Video}
            title="Video"
            description="Generated and transformed video"
          />
        </div>
      </div>
    </section>
  );
}