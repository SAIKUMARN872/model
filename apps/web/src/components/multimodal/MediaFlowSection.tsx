import {
  Brain,
  FileOutput,
  FolderInput,
  ScanEye,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import FlowStep from "./FlowStep";
import Arrow from "./Arrow";

export default function MediaFlowSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 md:px-8">
      <div className="mb-5">
        <h3 className="text-lg font-semibold">
          Multimodal media flow
        </h3>

        <p className="mt-1 text-sm text-slate-500">
          ModelNow processes different media types
          through a unified multimodal pipeline.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <div className="flex min-w-max items-center justify-center gap-2">
          <FlowStep
            icon={FolderInput}
            text="Media Input"
          />

          <Arrow />

          <FlowStep
            icon={ScanEye}
            text="Media Understanding"
          />

          <Arrow />

          <FlowStep
            icon={Brain}
            text="Multimodal Reasoning"
          />

          <Arrow />

          <FlowStep
            icon={WandSparkles}
            text="Transformation"
          />

          <Arrow />

          <FlowStep
            icon={Sparkles}
            text="Generation"
          />

          <Arrow />

          <FlowStep
            icon={FileOutput}
            text="Output"
          />
        </div>
      </div>
    </section>
  );
}