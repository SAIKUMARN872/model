import {
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Zap,
} from "lucide-react";

import type {
  AgentConnectorDefinition,
  AgentToolDefinition,
  WorkflowExecution,
} from "../../lib/agent-workflows-api";

type CatalogStage = {
  stage: string;
  stageIndex: number;
  tools: AgentToolDefinition[];
  connectors: AgentConnectorDefinition[];
};

type ToolsConnectorsPanelProps = {
  catalog: {
    stages: CatalogStage[];
    totalTools: number;
    totalConnectors: number;
  } | null;
  catalogLoading: boolean;
  catalogError: string;
  currentStageIndex: number;
  selectedAgentId: string;
  execution: WorkflowExecution | null;
};

function toolTypeClasses(
  tool: AgentToolDefinition,
) {
  if (!tool.enabled) {
    return "border-slate-200 bg-slate-50 text-slate-500";
  }

  if (tool.requiresApproval) {
    return "border-amber-200 bg-amber-50 text-amber-800";
  }

  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

function connectorStatusClasses(
  connector: AgentConnectorDefinition,
) {
  switch (connector.status) {
    case "connected":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";

    case "pending":
      return "border-amber-200 bg-amber-50 text-amber-700";

    case "error":
      return "border-red-200 bg-red-50 text-red-700";

    default:
      return "border-slate-200 bg-slate-50 text-slate-500";
  }
}

export default function ToolsConnectorsPanel({
  catalog,
  catalogLoading,
  catalogError,
  currentStageIndex,
  selectedAgentId,
  execution,
}: ToolsConnectorsPanelProps) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <Zap size={18} />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
              Tool platform + connectors
            </p>

            <h3 className="mt-1 text-xl font-bold">
              Agent capabilities
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Tools and connectors come from the backend catalog for this
              agent.
            </p>
          </div>
        </div>

        {catalog && (
          <div className="flex gap-2">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
              {catalog.totalTools} tools
            </span>

            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600">
              {catalog.totalConnectors} connectors
            </span>
          </div>
        )}
      </div>

      {catalogLoading && (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          <RefreshCw
            size={17}
            className="animate-spin"
          />

          Loading tools and connectors from the backend...
        </div>
      )}

      {catalogError && (
        <div className="mt-5 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <AlertCircle
            size={18}
            className="mt-0.5 shrink-0"
          />

          <div>
            <div className="font-semibold">
              Tool catalog is not available yet
            </div>

            <div className="mt-1 text-xs leading-5">
              {catalogError}
            </div>
          </div>
        </div>
      )}

      {catalog &&
        catalog.stages.length > 0 && (
          <div className="mt-6 space-y-4">
            {catalog.stages.map(
              (stage) => (
                <div
                  key={`${selectedAgentId}-stage-${stage.stageIndex}`}
                  className={`rounded-2xl border p-5 ${
                    currentStageIndex ===
                    stage.stageIndex
                      ? "border-blue-200 bg-blue-50/50"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                        Stage{" "}
                        {stage.stageIndex + 1}
                      </div>

                      <h4 className="mt-1 text-sm font-bold text-slate-900">
                        {stage.stage}
                      </h4>
                    </div>

                    {currentStageIndex ===
                      stage.stageIndex &&
                      execution && (
                        <span className="rounded-full border border-blue-200 bg-blue-100 px-3 py-1.5 text-[10px] font-semibold uppercase text-blue-700">
                          Current stage
                        </span>
                      )}
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div>
                      <div className="mb-2 text-xs font-semibold text-slate-700">
                        Tools
                      </div>

                      {stage.tools.length >
                      0 ? (
                        <div className="space-y-2">
                          {stage.tools.map(
                            (tool) => (
                              <div
                                key={tool.id}
                                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="text-xs font-semibold text-slate-900">
                                      {tool.name}
                                    </div>

                                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                                      {tool.description}
                                    </p>
                                  </div>

                                  <span
                                    className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-semibold ${toolTypeClasses(
                                      tool,
                                    )}`}
                                  >
                                    {tool.enabled
                                      ? tool.requiresApproval
                                        ? "Approval"
                                        : "Enabled"
                                      : "Disabled"}
                                  </span>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 p-3 text-xs text-slate-400">
                          No tools assigned to this stage.
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="mb-2 text-xs font-semibold text-slate-700">
                        Connectors
                      </div>

                      {stage.connectors.length >
                      0 ? (
                        <div className="space-y-2">
                          {stage.connectors.map(
                            (connector) => (
                              <div
                                key={connector.id}
                                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <div className="text-xs font-semibold text-slate-900">
                                      {connector.name}
                                    </div>

                                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                                      {connector.description}
                                    </p>
                                  </div>

                                  <span
                                    className={`shrink-0 rounded-full border px-2 py-1 text-[9px] font-semibold ${connectorStatusClasses(
                                      connector,
                                    )}`}
                                  >
                                    {connector.status}
                                  </span>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-slate-200 p-3 text-xs text-slate-400">
                          No connectors assigned to this stage.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ),
            )}
          </div>
        )}

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck
            size={17}
            className="mt-0.5 shrink-0 text-slate-600"
          />

          <div>
            <div className="text-xs font-semibold text-slate-900">
              Backend-owned capability control
            </div>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              Tool availability, connector availability, permissions and
              approval requirements are controlled by the backend.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}