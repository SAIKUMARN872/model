import {
  Brain,
  GitBranch,
  FolderInput,
  WandSparkles,
} from "lucide-react";

import ArchitectureCard from "./ArchitectureCard";

export default function ArchitectureSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 md:px-8">
      <div className="mb-5">
        <h3 className="text-lg font-semibold">
          Multimodal media architecture
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          ModelNow supports media ingestion,
          transformation, cross-modal intelligence
          and output generation.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <ArchitectureCard
          icon={FolderInput}
          title="Input"
          items={[
            "Text",
            "Image",
            "Audio",
            "Voice",
            "Video",
          ]}
        />

        <ArchitectureCard
          icon={Brain}
          title="Understanding"
          items={[
            "Image understanding",
            "Audio understanding",
            "Video understanding",
            "Speech understanding",
          ]}
        />

        <ArchitectureCard
          icon={GitBranch}
          title="Cross-modal"
          items={[
            "Text → Image",
            "Text → Voice",
            "Text → Video",
            "Image → Video",
            "Audio → Image",
          ]}
        />

        <ArchitectureCard
          icon={WandSparkles}
          title="Processing"
          items={[
            "Transcription",
            "Translation",
            "Enhancement",
            "Compression",
            "Media fusion",
          ]}
        />
      </div>
    </section>
  );
}