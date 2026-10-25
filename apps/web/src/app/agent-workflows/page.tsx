
"use client";

import {
  AlertCircle,
  ArrowLeft,
  ArrowUp,
  BarChart3,
  Bot,
  Camera,
  CheckCircle2,
  FileText,
  Globe,
  Image as ImageIcon,
  Layers3,
  Mic,
  Plus,
  Search,
  Sparkles,
  TrendingUp,
  Users,
  WalletCards,
  Zap,
  type LucideIcon,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from "react";

import AgentTree from "../../components/agent-workflows/AgentTree";
import CustomAgentModal from "../../components/agent-workflows/CustomAgentModal";
import ExecutionPanel from "../../components/agent-workflows/ExecutionPanel";
import PlanningReasoningPanel from "../../components/agent-workflows/PlanningReasoningPanel";
import ToolsConnectorsPanel from "../../components/agent-workflows/ToolsConnectorsPanel";
import WorkflowStageActionsPanel from "../../components/agent-workflows/WorkflowStageActionsPanel";

import {
  AGENT_WORKFLOW_DEFINITIONS,
} from "../../lib/agent-workflow-definitions";

import {
  cancelWorkflowExecution,
  executeWorkflow,
  getAgentWorkflowCatalog,
  getWorkflowExecution,
  pauseWorkflowExecution,
  resolveWorkflowApproval,
  resumeWorkflowExecution,
  saveCustomWorkflow,
  type AgentConnectorDefinition,
  type AgentId,
  type AgentToolDefinition,
  type ApprovalDecision,
  type CustomWorkflowDefinition,
  type WorkflowExecution,
  type WorkflowMode,
  type WorkflowPlanningState,
  type WorkflowStageDefinition,
} from "../../lib/agent-workflows-api";

type AgentDefinition = {
  id: AgentId;
  name: string;
  description: string;
  inputLabel: string;
  inputPlaceholder: string;
  icon: LucideIcon;
};

type ComposerTool = {
  label: string;
  description: string;
  icon: LucideIcon;
  action: () => void;
};

const agentDefinitions: AgentDefinition[] = [
  {
    id: "business-support",
    name: "Business Support",
    description:
      "Customer support lifecycle from request understanding through resolution, ticketing, escalation, verification and closure.",
    inputLabel: "Customer Request",
    inputPlaceholder: "Describe the customer request...",
    icon: Users,
  },
  {
    id: "crm",
    name: "CRM",
    description:
      "Customer lifecycle from customer identification through lead qualification, opportunity, follow-up, quote, approval, deal and close.",
    inputLabel: "Customer",
    inputPlaceholder: "Enter the customer or CRM request...",
    icon: Layers3,
  },
  {
    id: "erp",
    name: "ERP",
    description:
      "Enterprise request lifecycle across procurement, purchase order, approval, supplier fulfillment, invoice, payment and accounting.",
    inputLabel: "Request",
    inputPlaceholder: "Describe the ERP request...",
    icon: Layers3,
  },
  {
    id: "hr",
    name: "HR",
    description:
      "Employee workflow from the initial request through employee records, policy knowledge, approval, HR action, notification and audit.",
    inputLabel: "Employee Request",
    inputPlaceholder: "Describe the employee request...",
    icon: Users,
  },
  {
    id: "sales",
    name: "Sales",
    description:
      "Sales lifecycle from lead research and qualification through opportunity, outreach, meeting, proposal, negotiation and close.",
    inputLabel: "Lead",
    inputPlaceholder: "Describe the sales lead or request...",
    icon: TrendingUp,
  },
  {
    id: "finance",
    name: "Finance",
    description:
      "Financial workflow from request and data retrieval through analysis, validation, approval, transaction, reconciliation and audit.",
    inputLabel: "Financial Request",
    inputPlaceholder: "Describe the financial request...",
    icon: WalletCards,
  },
  {
    id: "custom-enterprise",
    name: "Custom Enterprise Agent",
    description:
      "Organization-defined agent with a custom workflow, custom tools, custom connectors and ModelNow execution.",
    inputLabel: "Organization Request",
    inputPlaceholder:
      "Describe the request for your custom enterprise agent...",
    icon: Bot,
  },
];

const terminalExecutionStatuses: WorkflowExecution["status"][] = [
  "completed",
  "failed",
  "cancelled",
];

const chartStages = [
  {
    name: "Request",
    description: "Understand",
    icon: Search,
  },
  {
    name: "Plan",
    description: "Reason",
    icon: Sparkles,
  },
  {
    name: "Execute",
    description: "Run tasks",
    icon: Zap,
  },
  {
    name: "Verify",
    description: "Validate",
    icon: CheckCircle2,
  },
];

function getWorkflowId(agentId: AgentId): string {
  return AGENT_WORKFLOW_DEFINITIONS[agentId].workflowId;
}

function normalizeMessage(message: string): string {
  return message.trim().replace(/\s+/g, " ");
}

export default function AgentWorkflowsPage() {
  const [selectedAgentId, setSelectedAgentId] =
    useState<AgentId>("business-support");

  const [requestInput, setRequestInput] = useState("");
  const [plusOpen, setPlusOpen] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState("");

  const [planning, setPlanning] =
    useState<WorkflowPlanningState | null>(null);

  const [planningLoading, setPlanningLoading] = useState(false);
  const [planningError, setPlanningError] = useState("");

  const [execution, setExecution] =
    useState<WorkflowExecution | null>(null);

  const [executionMode, setExecutionMode] =
    useState<WorkflowMode | null>(null);

  const [loading, setLoading] = useState(false);
  const [controlLoading, setControlLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState("");

  const [catalog, setCatalog] = useState<{
    stages: Array<{
      stage: string;
      stageIndex: number;
      tools: AgentToolDefinition[];
      connectors: AgentConnectorDefinition[];
    }>;
    stageDefinitions?: WorkflowStageDefinition[];
    totalTools: number;
    totalConnectors: number;
  } | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showCreateAgent, setShowCreateAgent] = useState(false);

  const [customName, setCustomName] = useState("");
  const [customDescription, setCustomDescription] = useState("");
  const [customStepsText, setCustomStepsText] = useState("");
  const [customToolsText, setCustomToolsText] = useState("");
  const [customConnectorsText, setCustomConnectorsText] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const requestTextareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedAgent = useMemo(
    () =>
      agentDefinitions.find((agent) => agent.id === selectedAgentId) ??
      agentDefinitions[0],
    [selectedAgentId],
  );

  const customWorkflowDefinition = useMemo<CustomWorkflowDefinition>(
    () => ({
      agentId: "custom-enterprise",
      name: customName.trim() || "Custom Enterprise Agent",
      description: customDescription.trim(),
      steps: customStepsText
        .split(/\r?\n/)
        .map((step) => step.trim())
        .filter(Boolean),
      tools: customToolsText
        .split(",")
        .map((tool) => tool.trim())
        .filter(Boolean),
      connectors: customConnectorsText
        .split(",")
        .map((connector) => connector.trim())
        .filter(Boolean),
    }),
    [
      customName,
      customDescription,
      customStepsText,
      customToolsText,
      customConnectorsText,
    ],
  );

  useEffect(() => {
    let disposed = false;

    async function loadCatalog() {
      setCatalogLoading(true);
      setCatalogError("");
      setCatalog(null);

      try {
        const result = await getAgentWorkflowCatalog(selectedAgentId);

        if (!disposed) {
          setCatalog({
            stages: result.stages,
            stageDefinitions: result.stageDefinitions,
            totalTools: result.totalTools,
            totalConnectors: result.totalConnectors,
          });
        }
      } catch (error) {
        if (!disposed) {
          setCatalogError(
            error instanceof Error
              ? error.message
              : "Unable to load the agent tools and connectors.",
          );
        }
      } finally {
        if (!disposed) {
          setCatalogLoading(false);
        }
      }
    }

    void loadCatalog();

    return () => {
      disposed = true;
    };
  }, [selectedAgentId]);

  useEffect(() => {
    const executionId = execution?.executionId;

    if (
      !executionId ||
      terminalExecutionStatuses.includes(execution.status)
    ) {
      return;
    }

    let disposed = false;

    async function pollStatus() {
      try {
        const latest = await getWorkflowExecution(executionId!);

        if (disposed) return;

        setExecution(latest);

        if (latest.planning) {
          setPlanning(latest.planning);
        }
      } catch (error) {
        if (!disposed) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to retrieve workflow execution status.",
          );
        }
      }
    }

    void pollStatus();

    const interval = window.setInterval(() => {
      void pollStatus();
    }, 2500);

    return () => {
      disposed = true;
      window.clearInterval(interval);
    };
  }, [execution?.executionId]);

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const selectAgent = (agentId: AgentId) => {
    if (loading || controlLoading || planningLoading) return;

    setSelectedAgentId(agentId);
    setRequestInput("");
    setSelectedFileName("");
    setPlanning(null);
    setPlanningError("");
    setExecution(null);
    setExecutionMode(null);
    setPlusOpen(false);
    clearMessages();
  };

  const submitRequest = async () => {
    clearMessages();
    setPlanningError("");

    const input = requestInput.trim();

    if (!input) {
      setErrorMessage(
        `Enter a ${selectedAgent.inputLabel.toLowerCase()} before sending.`,
      );
      requestTextareaRef.current?.focus();
      return;
    }

    if (
      selectedAgentId === "custom-enterprise" &&
      customWorkflowDefinition.steps.length === 0
    ) {
      setErrorMessage(
        "Define at least one stage in your custom enterprise agent before sending.",
      );
      return;
    }

    setLoading(true);
    setExecutionMode("run");
    setExecution(null);
    setPlanning(null);

    try {
      const result = await executeWorkflow({
        agentId: selectedAgentId,
        workflowId: getWorkflowId(selectedAgentId),
        mode: "run",
        input,
        workflowDefinition:
          selectedAgentId === "custom-enterprise"
            ? customWorkflowDefinition
            : undefined,
      });

      const latest = await getWorkflowExecution(result.executionId);

      setExecution(latest);

      if (latest.planning) {
        setPlanning(latest.planning);
      }

      setSuccessMessage("Your request was submitted to the agent workflow.");
      setRequestInput("");
      setSelectedFileName("");
    } catch (error) {
      setExecutionMode(null);
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit the request.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRequestKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (!loading && !controlLoading) {
        void submitRequest();
      }
    }
  };

  const handleSelectedFile = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    setSelectedFileName(file.name);

    setRequestInput((current) =>
      current.trim()
        ? current
        : `Please analyze the attached file: ${file.name}`,
    );

    event.target.value = "";
  };

  const refreshExecution = async (executionId: string) => {
    const latest = await getWorkflowExecution(executionId);

    setExecution(latest);

    if (latest.planning) {
      setPlanning(latest.planning);
    }

    return latest;
  };

  const pauseExecution = async () => {
    if (!execution?.executionId) return;

    setControlLoading(true);
    clearMessages();

    try {
      await pauseWorkflowExecution(execution.executionId);
      await refreshExecution(execution.executionId);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to pause the workflow.",
      );
    } finally {
      setControlLoading(false);
    }
  };

  const resumeExecution = async () => {
    if (!execution?.executionId) return;

    setControlLoading(true);
    clearMessages();

    try {
      await resumeWorkflowExecution(execution.executionId);
      await refreshExecution(execution.executionId);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to resume the workflow.",
      );
    } finally {
      setControlLoading(false);
    }
  };

  const stopExecution = async () => {
    if (!execution?.executionId) return;

    setControlLoading(true);
    clearMessages();

    try {
      await cancelWorkflowExecution(execution.executionId);
      await refreshExecution(execution.executionId);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Unable to stop the workflow.",
      );
    } finally {
      setControlLoading(false);
    }
  };

  const handleApproval = async (decision: ApprovalDecision) => {
    if (!execution?.executionId) return;

    setControlLoading(true);
    clearMessages();

    try {
      await resolveWorkflowApproval(execution.executionId, decision);
      await refreshExecution(execution.executionId);

      setSuccessMessage(
        decision === "approve"
          ? "Approval submitted. The backend will continue the workflow."
          : "Approval rejected. The backend will handle the rejected execution.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit the approval decision.",
      );
    } finally {
      setControlLoading(false);
    }
  };

  const saveCustomAgent = async () => {
    clearMessages();

    if (!customWorkflowDefinition.name.trim()) {
      setErrorMessage("Enter a name for the custom enterprise agent.");
      return;
    }

    if (customWorkflowDefinition.steps.length === 0) {
      setErrorMessage("Add at least one custom workflow stage.");
      return;
    }

    setSaving(true);

    try {
      const result = await saveCustomWorkflow(customWorkflowDefinition);

      setSuccessMessage(
        `Custom workflow "${result.name}" saved successfully.`,
      );

      setShowCreateAgent(false);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to save the custom enterprise agent.",
      );
    } finally {
      setSaving(false);
    }
  };

  const clearExecution = () => {
    setExecution(null);
    setExecutionMode(null);
    clearMessages();
  };

  const currentStageIndex = execution?.currentStageIndex ?? 0;

  const currentStageCatalog = catalog?.stages.find(
    (stage) => stage.stageIndex === currentStageIndex,
  );

  const currentStageDefinition =
    catalog?.stageDefinitions?.find(
      (stage) => stage.index === currentStageIndex,
    ) ?? null;

  const canPause = Boolean(
    execution &&
      ["queued", "planning", "reasoning", "running", "waiting"].includes(
        execution.status,
      ),
  );

  const canResume = execution?.status === "paused";

  const canStop = Boolean(
    execution &&
      !terminalExecutionStatuses.includes(execution.status),
  );

  const visibleErrorMessage = (() => {
    const pageError = normalizeMessage(errorMessage);

    if (!pageError) return "";

    if (
      pageError === normalizeMessage(catalogError) ||
      pageError === normalizeMessage(planningError)
    ) {
      return "";
    }

    return errorMessage;
  })();

  const composerTools: ComposerTool[] = [
    {
      label: "Chart",
      description: "Prepare a chart request",
      icon: BarChart3,
      action: () => {
        setRequestInput((current) =>
          current || "Help me analyze data and create a chart: ",
        );
      },
    },
    {
      label: "Photos",
      description: "Choose an image",
      icon: ImageIcon,
      action: () => photoInputRef.current?.click(),
    },
    {
      label: "Camera",
      description: "Select a camera image",
      icon: Camera,
      action: () => cameraInputRef.current?.click(),
    },
    {
      label: "PDF / Document",
      description: "Choose a document",
      icon: FileText,
      action: () => fileInputRef.current?.click(),
    },
    {
      label: "Web Search",
      description: "Prepare a web search request",
      icon: Globe,
      action: () =>
        setRequestInput((current) => current || "Search the web for "),
    },
    {
      label: "Deep Search",
      description: "Prepare a research request",
      icon: Search,
      action: () =>
        setRequestInput((current) => current || "Perform deep research on "),
    },
  ];

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-[1500px] items-center justify-between gap-4 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <a
              href="/chat"
              aria-label="Back to chat"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
            >
              <ArrowLeft size={19} />
            </a>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Bot size={19} />
            </div>

            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold sm:text-lg">
                Agent Workflows
              </h1>
              <p className="truncate text-xs text-slate-500">
                Enterprise agents and workflow execution
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateAgent(true)}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus size={16} />
            Create custom agent
          </button>
        </div>
      </header>

      <div className="mx-auto max-w-[1500px] space-y-6 px-4 py-6 sm:px-6">
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <AgentTree
            agents={agentDefinitions}
            selectedAgentId={selectedAgentId}
            disabled={loading || controlLoading || planningLoading}
            onSelect={selectAgent}
          />

          <section className="space-y-6">
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="h-1.5 bg-slate-900" />

              <div className="p-6 sm:p-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
                    <Bot size={22} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        Selected agent
                      </p>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                        Active
                      </span>
                    </div>

                    <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
                      {selectedAgent.name}
                    </h2>

                    <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                      {selectedAgent.description}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Request and chart remain in the same box. */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
                  <Sparkles size={18} />
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                    User request
                  </p>
                  <h3 className="mt-1 text-lg font-bold text-slate-950">
                    {selectedAgent.inputLabel}
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Describe what the selected agent needs to accomplish.
                  </p>
                </div>
              </div>

              <div className="mt-5 overflow-visible rounded-2xl border border-slate-200 bg-white shadow-sm">
                <textarea
                  ref={requestTextareaRef}
                  value={requestInput}
                  onChange={(event) => setRequestInput(event.target.value)}
                  onKeyDown={handleRequestKeyDown}
                  rows={4}
                  maxLength={100000}
                  disabled={loading || controlLoading || planningLoading}
                  placeholder={selectedAgent.inputPlaceholder}
                  aria-label={selectedAgent.inputLabel}
                  className="w-full resize-none rounded-t-2xl bg-transparent px-5 pt-5 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-60"
                />

                {selectedFileName && (
                  <div className="mx-4 mb-2 flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2 text-xs text-slate-600">
                    <span className="flex min-w-0 items-center gap-2">
                      <FileText size={15} className="shrink-0" />
                      <span className="truncate">{selectedFileName}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedFileName("")}
                      className="shrink-0 font-semibold hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                )}

                <div className="flex items-center justify-between px-3 pb-3 pt-2">
                  <div className="relative z-20">
                    <button
                      type="button"
                      aria-label="Open tools"
                      aria-expanded={plusOpen}
                      onClick={() => setPlusOpen((open) => !open)}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl text-xl ${
                        plusOpen
                          ? "bg-slate-100 text-slate-900"
                          : "text-slate-500 hover:bg-slate-100"
                      }`}
                    >
                      +
                    </button>

                    {plusOpen && (
                      <div className="absolute bottom-[calc(100%+10px)] left-0 z-50 max-h-[min(500px,calc(100vh-120px))] w-[280px] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-2 shadow-2xl">
                        <div className="px-3 py-2">
                          <p className="text-xs font-semibold">Add to request</p>
                          <p className="text-[10px] text-slate-400">
                            Choose a ModelNow capability
                          </p>
                        </div>

                        {composerTools.map((tool) => {
                          const Icon = tool.icon;

                          return (
                            <button
                              type="button"
                              key={tool.label}
                              onClick={() => {
                                setPlusOpen(false);
                                tool.action();
                              }}
                              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-slate-50"
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-600">
                                <Icon size={17} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-slate-900">
                                  {tool.label}
                                </p>
                                <p className="text-[10px] leading-4 text-slate-400">
                                  {tool.description}
                                </p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      aria-label="Voice"
                      onClick={() => {
                        window.location.href = "/voice";
                      }}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
                    >
                      <Mic size={19} />
                    </button>

                    <button
                      type="button"
                      aria-label="Send request"
                      onClick={() => void submitRequest()}
                      disabled={
                        !requestInput.trim() ||
                        loading ||
                        controlLoading ||
                        planningLoading
                      }
                      className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                        requestInput.trim() &&
                        !loading &&
                        !controlLoading &&
                        !planningLoading
                          ? "bg-slate-900 text-white hover:bg-slate-800"
                          : "bg-slate-100 text-slate-400"
                      }`}
                    >
                      {loading ? (
                        <span
                          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
                          aria-label="Submitting"
                        />
                      ) : (
                        <ArrowUp size={18} />
                      )}
                    </button>
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.json"
                  onChange={handleSelectedFile}
                />

                <input
                  ref={photoInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleSelectedFile}
                />

                <input
                  ref={cameraInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  capture="environment"
                  onChange={handleSelectedFile}
                />
              </div>

              {/* Chart inside the Customer Request card */}
              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-slate-700 shadow-sm">
                      <TrendingUp size={17} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">
                        Workflow chart
                      </h4>
                      <p className="text-xs text-slate-500">
                        Request-to-verification overview
                      </p>
                    </div>
                  </div>

                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-600">
                    4 stages
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-4 sm:gap-2">
                  {chartStages.map((stage, index) => {
                    const Icon = stage.icon;

                    return (
                      <div
                        key={stage.name}
                        className="relative flex min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 sm:flex-col sm:items-start sm:p-4"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                          <Icon size={18} />
                        </div>

                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-900">
                            {stage.name}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {stage.description}
                          </p>
                        </div>

                        {index < chartStages.length - 1 && (
                          <div
                            aria-hidden="true"
                            className="hidden sm:block absolute -right-2 top-1/2 z-10 h-px w-2 bg-slate-300"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="mt-4 text-xs leading-5 text-slate-500">
                  This is a workflow overview, not live execution progress.
                </p>
              </div>

              {(visibleErrorMessage || successMessage) && (
                <div
                  role="status"
                  className={`mt-5 flex items-start gap-3 rounded-2xl border p-4 text-sm ${
                    visibleErrorMessage
                      ? "border-red-200 bg-red-50 text-red-700"
                      : "border-slate-200 bg-slate-50 text-slate-700"
                  }`}
                >
                  {visibleErrorMessage ? (
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  ) : (
                    <CheckCircle2 size={18} className="mt-0.5 shrink-0" />
                  )}
                  <span>{visibleErrorMessage || successMessage}</span>
                </div>
              )}

              {planningError && (
                <div className="mt-5 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  <AlertCircle size={18} className="mt-0.5 shrink-0" />
                  <span>{planningError}</span>
                </div>
              )}
            </div>

            {planning && <PlanningReasoningPanel planning={planning} />}

            {execution && (
              <WorkflowStageActionsPanel stage={currentStageDefinition} />
            )}

            <ToolsConnectorsPanel
              catalog={catalog}
              catalogLoading={catalogLoading}
              catalogError={catalogError}
              currentStageIndex={currentStageIndex}
              selectedAgentId={selectedAgentId}
              execution={execution}
            />

            {execution && (
              <ExecutionPanel
                execution={execution}
                currentStageCatalog={currentStageCatalog}
                controlLoading={controlLoading}
                canPause={canPause}
                canResume={canResume}
                canStop={canStop}
                onPause={pauseExecution}
                onResume={resumeExecution}
                onStop={stopExecution}
                onApproval={handleApproval}
                onClear={clearExecution}
              />
            )}

            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 bg-slate-900 px-6 py-6 text-white sm:px-8">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  How ModelNow handles your request
                </p>
                <h3 className="mt-1 text-xl font-bold">
                  From request to verified execution
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">
                  ModelNow turns your request into a controlled enterprise
                  workflow. The selected agent interprets the task, uses
                  required tools and connectors, and reports the execution
                  result.
                </p>
              </div>

              <div className="grid gap-4 p-6 sm:grid-cols-4 sm:p-8">
                {chartStages.map((stage, index) => {
                  const Icon = stage.icon;

                  const descriptions = [
                    "Understand what you need the selected enterprise agent to accomplish.",
                    "Organize the task and determine the required workflow steps.",
                    "Use agents, tools and enterprise connectors to perform the workflow.",
                    "Review execution, approvals and verification before returning the result.",
                  ];

                  return (
                    <div
                      key={stage.name}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                        <Icon size={18} />
                      </div>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {String(index + 1).padStart(2, "0")}
                      </p>
                      <h4 className="mt-1 text-sm font-bold text-slate-950">
                        {stage.name}
                      </h4>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {descriptions[index]}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </div>

      <CustomAgentModal
        open={showCreateAgent}
        saving={saving}
        errorMessage={errorMessage}
        customName={customName}
        customDescription={customDescription}
        customStepsText={customStepsText}
        customToolsText={customToolsText}
        customConnectorsText={customConnectorsText}
        onClose={() => setShowCreateAgent(false)}
        onSave={saveCustomAgent}
        onNameChange={setCustomName}
        onDescriptionChange={setCustomDescription}
        onStepsChange={setCustomStepsText}
        onToolsChange={setCustomToolsText}
        onConnectorsChange={setCustomConnectorsText}
      />
    </main>
  );
}
