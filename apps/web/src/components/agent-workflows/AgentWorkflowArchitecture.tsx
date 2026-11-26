import {
  ArrowDown,
} from "lucide-react";

type AgentWorkflowArchitectureProps = {
  stages: string[];
};

export default function AgentWorkflowArchitecture({
  stages,
}: AgentWorkflowArchitectureProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          ModelNow execution architecture
        </p>

        <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
          User → Intent → Planner → Reasoning → Agent → Tools → Enterprise systems → Execution → Verification
        </h2>

        <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-500">
          Every enterprise agent follows this common runtime architecture.
          The business workflow tree changes by agent.
        </p>
      </div>

      <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-9">
        {stages.map((stage, index) => (
          <div
            key={stage}
            className="relative rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="text-xs font-bold text-slate-400">
              {String(index + 1).padStart(2, "0")}
            </div>

            <div className="mt-2 text-sm font-semibold text-slate-900">
              {stage}
            </div>

            {index < stages.length - 1 && (
              <ArrowDown
                size={15}
                className="absolute -bottom-5 left-1/2 z-10 text-slate-300 xl:-right-5 xl:top-1/2 xl:bottom-auto xl:left-auto xl:rotate-[-90deg]"
              />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}