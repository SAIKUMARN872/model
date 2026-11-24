import { Zap } from "lucide-react";

type PlatformLayersPanelProps = {
  layers: Array<[string, string]>;
};

export default function PlatformLayersPanel({
  layers,
}: PlatformLayersPanelProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
          <Zap size={18} />
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Supporting platform
          </p>

          <h3 className="mt-1 text-2xl font-bold">
            ModelNow Agent Platform
          </h3>

          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
            These layers support planning, reasoning, agents, tools,
            connectors and runtime execution.
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {layers.map(([name, description]) => (
          <div
            key={name}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
          >
            <div className="font-mono text-sm font-bold text-slate-900">
              {name}
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-500">
              {description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}