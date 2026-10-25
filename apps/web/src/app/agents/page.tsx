"use client";

import { useState } from "react";
import {
  Bot,
  Workflow,
  Zap,
  Wrench,
  Play,
  Pause,
  Plus,
  ChevronRight,
  CheckCircle2,
  Clock3,
  XCircle,
  ArrowRight,
  Settings2,
  Database,
  Mail,
  Globe,
  FileText,
  Users,
  BriefcaseBusiness,
  Building2,
  DollarSign,
  UserRound,
  Headphones,
  Search,
  MoreHorizontal,
  Sparkles,
} from "lucide-react";

type BusinessArea = {
  name: string;
  description: string;
  icon: any;
};

const businessAreas: BusinessArea[] = [
  {
    name: "Business Support",
    description: "Customer and internal business assistance",
    icon: Headphones,
  },
  {
    name: "CRM",
    description: "Manage leads, customers and CRM workflows",
    icon: Users,
  },
  {
    name: "ERP",
    description: "Automate enterprise resource processes",
    icon: Building2,
  },
  {
    name: "HR",
    description: "Employee and recruitment workflows",
    icon: UserRound,
  },
  {
    name: "Sales",
    description: "Lead qualification and sales automation",
    icon: BriefcaseBusiness,
  },
  {
    name: "Finance",
    description: "Financial operations and approval workflows",
    icon: DollarSign,
  },
];

type WorkflowItem = {
  id: number;
  name: string;
  business: string;
  trigger: string;
  agent: string;
  status: "Active" | "Paused" | "Draft";
  runs: number;
  lastRun: string;
};

const initialWorkflows: WorkflowItem[] = [
  {
    id: 1,
    name: "Customer Support Assistant",
    business: "Business Support",
    trigger: "New customer message",
    agent: "Support Agent",
    status: "Active",
    runs: 1248,
    lastRun: "2 min ago",
  },
  {
    id: 2,
    name: "Lead Qualification",
    business: "CRM",
    trigger: "New CRM lead",
    agent: "Sales Agent",
    status: "Active",
    runs: 842,
    lastRun: "8 min ago",
  },
  {
    id: 3,
    name: "Invoice Review",
    business: "Finance",
    trigger: "Invoice uploaded",
    agent: "Finance Agent",
    status: "Active",
    runs: 426,
    lastRun: "21 min ago",
  },
  {
    id: 4,
    name: "Employee Onboarding",
    business: "HR",
    trigger: "New employee created",
    agent: "HR Agent",
    status: "Paused",
    runs: 187,
    lastRun: "2 hours ago",
  },
];

const executionHistory = [
  {
    workflow: "Customer Support Assistant",
    agent: "Support Agent",
    trigger: "New customer message",
    status: "Completed",
    duration: "2.4s",
    time: "2 min ago",
  },
  {
    workflow: "Lead Qualification",
    agent: "Sales Agent",
    trigger: "New CRM lead",
    status: "Completed",
    duration: "3.8s",
    time: "8 min ago",
  },
  {
    workflow: "Invoice Review",
    agent: "Finance Agent",
    trigger: "Invoice uploaded",
    status: "Completed",
    duration: "4.2s",
    time: "21 min ago",
  },
  {
    workflow: "Employee Onboarding",
    agent: "HR Agent",
    trigger: "New employee created",
    status: "Failed",
    duration: "6.1s",
    time: "1 hour ago",
  },
];

const triggers = [
  {
    name: "New Message",
    description: "When a new message is received",
    icon: Mail,
  },
  {
    name: "New File",
    description: "When a document or file is uploaded",
    icon: FileText,
  },
  {
    name: "Webhook",
    description: "Start workflow from an external service",
    icon: Zap,
  },
  {
    name: "Schedule",
    description: "Run automatically on a schedule",
    icon: Clock3,
  },
];

const agents = [
  {
    name: "Support Agent",
    description: "Handles customer support conversations",
  },
  {
    name: "Sales Agent",
    description: "Qualifies leads and assists sales teams",
  },
  {
    name: "Finance Agent",
    description: "Reviews financial documents and requests",
  },
  {
    name: "HR Agent",
    description: "Handles employee and HR workflows",
  },
];

const tools = [
  {
    name: "CRM",
    description: "Read and update CRM records",
    icon: Users,
  },
  {
    name: "Database",
    description: "Query enterprise databases",
    icon: Database,
  },
  {
    name: "Web",
    description: "Search and retrieve web information",
    icon: Globe,
  },
  {
    name: "Email",
    description: "Send and manage emails",
    icon: Mail,
  },
];

const actions = [
  "Create record",
  "Update record",
  "Send email",
  "Generate document",
  "Call API",
  "Request approval",
];

export default function AgentWorkflowsPage() {
  const [selectedBusiness, setSelectedBusiness] =
    useState("Business Support");

  const [workflows, setWorkflows] =
    useState<WorkflowItem[]>(initialWorkflows);

  const [selectedTrigger, setSelectedTrigger] =
    useState("New Message");

  const [selectedAgent, setSelectedAgent] =
    useState("Support Agent");

  const [selectedTool, setSelectedTool] =
    useState("CRM");

  const [selectedAction, setSelectedAction] =
    useState("Create record");

  const [workflowName, setWorkflowName] = useState(
    "New Enterprise Workflow"
  );

  const [isRunning, setIsRunning] = useState(false);

  const [showCreate, setShowCreate] = useState(false);

  const [activeTab, setActiveTab] = useState<
    "workflows" | "builder" | "history"
  >("workflows");

  const toggleWorkflow = (id: number) => {
    setWorkflows((current) =>
      current.map((workflow) => {
        if (workflow.id !== id) {
          return workflow;
        }

        return {
          ...workflow,
          status:
            workflow.status === "Active"
              ? "Paused"
              : "Active",
        };
      })
    );
  };

  const createWorkflow = () => {
    const newWorkflow: WorkflowItem = {
      id: Date.now(),
      name: workflowName || "New Workflow",
      business: selectedBusiness,
      trigger: selectedTrigger,
      agent: selectedAgent,
      status: "Draft",
      runs: 0,
      lastRun: "Never",
    };

    setWorkflows((current) => [
      newWorkflow,
      ...current,
    ]);

    setShowCreate(false);
    setActiveTab("workflows");
  };

  const runWorkflow = () => {
    setIsRunning(true);

    setTimeout(() => {
      setIsRunning(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#f7f8fa] text-slate-900">

      {/* ==========================================
          SIDEBAR
      ========================================== */}

      <aside className="fixed left-0 top-0 z-30 flex h-screen w-[250px] flex-col border-r border-slate-200 bg-white">

        <div className="flex h-16 items-center border-b border-slate-200 px-5">

          <div className="flex items-center gap-2">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
              <Sparkles size={18} />
            </div>

            <div>
              <h1 className="text-sm font-bold">
                ModelNow
              </h1>

              <p className="text-[11px] text-slate-500">
                Enterprise AI Platform
              </p>
            </div>

          </div>

        </div>

        <div className="p-4">

          <button
            onClick={() => {
              setShowCreate(true);
              setActiveTab("builder");
            }}
            className="flex w-full items-center gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
          >
            <Plus size={17} />
            New Workflow
          </button>

        </div>

        <nav className="flex-1 px-3">

          <NavItem
            icon={<Sparkles size={17} />}
            label="Chat"
          />

          <NavItem
            icon={<Zap size={17} />}
            label="Intelligence"
          />

          <NavItem
            icon={<Globe size={17} />}
            label="Browser Automation"
          />

          <NavItem
            icon={<Workflow size={17} />}
            label="Agent Workflows"
            active
          />

          <NavItem
            icon={<Building2 size={17} />}
            label="Enterprise Hub"
          />

        </nav>

        <div className="border-t border-slate-200 p-4">

          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            ModelNow Intelligence
          </p>

          <StatusItem
            label="Cost Optimization"
          />

          <StatusItem
            label="Latency Optimization"
          />

          <StatusItem
            label="Quality Routing"
          />

        </div>

      </aside>

      {/* ==========================================
          MAIN
      ========================================== */}

      <main className="ml-[250px] min-h-screen">

        {/* TOP BAR */}

        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-7">

          <div>

            <h2 className="text-base font-semibold">
              Agent Workflows
            </h2>

            <p className="text-xs text-slate-500">
              Build and automate intelligent enterprise workflows
            </p>

          </div>

          <div className="flex items-center gap-3">

            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium">
              AI Agents
            </div>

            <div className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white">
              Enterprise Workspace
            </div>

          </div>

        </header>

        <div className="p-7">

          {/* ======================================
              HERO
          ====================================== */}

          <div className="mb-7 flex items-start justify-between">

            <div>

              <div className="mb-2 flex items-center gap-2">

                <span className="rounded-full bg-slate-900 px-3 py-1 text-[11px] font-medium text-white">
                  ModelNow Platform
                </span>

                <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium text-emerald-700">
                  Enterprise Ready
                </span>

              </div>

              <h1 className="text-2xl font-bold tracking-tight">
                Intelligent Agent Workflows
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Connect triggers, AI agents, enterprise tools
                and actions to automate business processes.
              </p>

            </div>

            <button
              onClick={() => {
                setShowCreate(true);
                setActiveTab("builder");
              }}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Plus size={17} />
              Create Workflow
            </button>

          </div>

          {/* ======================================
              KPI CARDS
          ====================================== */}

          <div className="mb-7 grid grid-cols-4 gap-4">

            <MetricCard
              label="Active Workflows"
              value="12"
              change="+3 this month"
            />

            <MetricCard
              label="AI Agents"
              value="18"
              change="+5 this month"
            />

            <MetricCard
              label="Workflow Runs"
              value="24.8K"
              change="+18.4%"
            />

            <MetricCard
              label="Success Rate"
              value="98.2%"
              change="+2.1%"
            />

          </div>

          {/* ======================================
              TABS
          ====================================== */}

          <div className="mb-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1">

            <TabButton
              active={activeTab === "workflows"}
              onClick={() => setActiveTab("workflows")}
            >
              Workflows
            </TabButton>

            <TabButton
              active={activeTab === "builder"}
              onClick={() => setActiveTab("builder")}
            >
              Workflow Builder
            </TabButton>

            <TabButton
              active={activeTab === "history"}
              onClick={() => setActiveTab("history")}
            >
              Execution History
            </TabButton>

          </div>

          {/* ======================================
              WORKFLOWS TAB
          ====================================== */}

          {activeTab === "workflows" && (

            <>

              {/* BUSINESS AREAS */}

              <section className="mb-7">

                <div className="mb-4">

                  <h2 className="text-lg font-semibold">
                    Business Workflows
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Choose a business area to build intelligent
                    workflows.
                  </p>

                </div>

                <div className="grid grid-cols-3 gap-4">

                  {businessAreas.map((business) => {

                    const Icon = business.icon;

                    const active =
                      selectedBusiness === business.name;

                    return (

                      <button
                        key={business.name}
                        onClick={() =>
                          setSelectedBusiness(
                            business.name
                          )
                        }
                        className={`group rounded-2xl border p-5 text-left transition ${
                          active
                            ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                        }`}
                      >

                        <div className="mb-4 flex items-center justify-between">

                          <div
                            className={`flex h-11 w-11 items-center justify-center rounded-xl ${
                              active
                                ? "bg-white/10"
                                : "bg-slate-100"
                            }`}
                          >
                            <Icon
                              size={20}
                              className={
                                active
                                  ? "text-white"
                                  : "text-slate-700"
                              }
                            />
                          </div>

                          <ChevronRight
                            size={17}
                            className={
                              active
                                ? "text-white/60"
                                : "text-slate-400"
                            }
                          />

                        </div>

                        <p className="text-sm font-semibold">
                          {business.name}
                        </p>

                        <p
                          className={`mt-1 text-xs leading-5 ${
                            active
                              ? "text-white/60"
                              : "text-slate-500"
                          }`}
                        >
                          {business.description}
                        </p>

                      </button>

                    );
                  })}

                </div>

              </section>

              {/* WORKFLOW LIST */}

              <section>

                <div className="mb-4 flex items-center justify-between">

                  <div>

                    <h2 className="text-lg font-semibold">
                      Workflows
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Manage your automated AI workflows.
                    </p>

                  </div>

                  <button
                    onClick={() => setActiveTab("history")}
                    className="text-xs font-medium text-slate-600 hover:text-slate-900"
                  >
                    View execution history →
                  </button>

                </div>

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

                  <div className="grid grid-cols-[1.8fr_1fr_1.2fr_1fr_100px_90px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">

                    <span>Workflow</span>
                    <span>Business</span>
                    <span>Trigger</span>
                    <span>Agent</span>
                    <span>Status</span>
                    <span>Runs</span>

                  </div>

                  {workflows.map((workflow) => (

                    <div
                      key={workflow.id}
                      className="grid grid-cols-[1.8fr_1fr_1.2fr_1fr_100px_90px] items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0"
                    >

                      <div>

                        <p className="text-sm font-semibold">
                          {workflow.name}
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                          Last run {workflow.lastRun}
                        </p>

                      </div>

                      <span className="text-xs text-slate-600">
                        {workflow.business}
                      </span>

                      <span className="text-xs text-slate-600">
                        {workflow.trigger}
                      </span>

                      <span className="text-xs font-medium text-slate-700">
                        {workflow.agent}
                      </span>

                      <button
                        onClick={() =>
                          toggleWorkflow(workflow.id)
                        }
                        className={`w-fit rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                          workflow.status === "Active"
                            ? "bg-emerald-50 text-emerald-700"
                            : workflow.status === "Paused"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {workflow.status}
                      </button>

                      <span className="text-xs font-semibold text-slate-700">
                        {workflow.runs.toLocaleString()}
                      </span>

                    </div>

                  ))}

                </div>

              </section>

            </>

          )}

          {/* ======================================
              BUILDER TAB
          ====================================== */}

          {activeTab === "builder" && (

            <section>

              <div className="mb-5">

                <h2 className="text-lg font-semibold">
                  Workflow Builder
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Build a workflow by connecting a trigger,
                  AI agent, tools and actions.
                </p>

              </div>

              <div className="grid grid-cols-[1fr_320px] gap-5">

                {/* CANVAS */}

                <div className="rounded-2xl border border-slate-200 bg-white p-6">

                  <div className="mb-6 flex items-center justify-between">

                    <div>

                      <input
                        value={workflowName}
                        onChange={(event) =>
                          setWorkflowName(
                            event.target.value
                          )
                        }
                        className="w-[350px] border-none bg-transparent text-lg font-semibold outline-none"
                      />

                      <p className="mt-1 text-xs text-slate-400">
                        {selectedBusiness} workflow
                      </p>

                    </div>

                    <div className="flex gap-2">

                      <button
                        onClick={() => setActiveTab("workflows")}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium hover:bg-slate-50"
                      >
                        Save Draft
                      </button>

                      <button
                        onClick={runWorkflow}
                        className="flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800"
                      >
                        {isRunning ? (
                          <>
                            <Pause size={14} />
                            Running...
                          </>
                        ) : (
                          <>
                            <Play size={14} />
                            Test Workflow
                          </>
                        )}
                      </button>

                    </div>

                  </div>

                  {/* FLOW */}

                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8">

                    <div className="flex flex-col items-center">

                      <WorkflowNode
                        number="01"
                        title="Trigger"
                        subtitle={selectedTrigger}
                        icon={<Zap size={19} />}
                      />

                      <FlowArrow />

                      <WorkflowNode
                        number="02"
                        title="AI Agent"
                        subtitle={selectedAgent}
                        icon={<Bot size={19} />}
                      />

                      <FlowArrow />

                      <WorkflowNode
                        number="03"
                        title="Tools"
                        subtitle={selectedTool}
                        icon={<Wrench size={19} />}
                      />

                      <FlowArrow />

                      <WorkflowNode
                        number="04"
                        title="Action"
                        subtitle={selectedAction}
                        icon={<ArrowRight size={19} />}
                      />

                      {isRunning && (

                        <div className="mt-5 flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-medium text-blue-700">

                          <span className="h-2 w-2 animate-pulse rounded-full bg-blue-500" />

                          ModelNow is executing the workflow...

                        </div>

                      )}

                    </div>

                  </div>

                </div>

                {/* CONFIGURATION */}

                <div className="space-y-4">

                  <BuilderSelect
                    title="Business"
                    value={selectedBusiness}
                    options={businessAreas.map(
                      (item) => item.name
                    )}
                    onChange={setSelectedBusiness}
                  />

                  <BuilderSelect
                    title="Trigger"
                    value={selectedTrigger}
                    options={triggers.map(
                      (item) => item.name
                    )}
                    onChange={setSelectedTrigger}
                  />

                  <BuilderSelect
                    title="AI Agent"
                    value={selectedAgent}
                    options={agents.map(
                      (item) => item.name
                    )}
                    onChange={setSelectedAgent}
                  />

                  <BuilderSelect
                    title="Tool"
                    value={selectedTool}
                    options={tools.map(
                      (item) => item.name
                    )}
                    onChange={setSelectedTool}
                  />

                  <BuilderSelect
                    title="Action"
                    value={selectedAction}
                    options={actions}
                    onChange={setSelectedAction}
                  />

                  <button
                    onClick={createWorkflow}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white hover:bg-slate-800"
                  >
                    <Plus size={17} />
                    Create Workflow
                  </button>

                </div>

              </div>

              {/* AVAILABLE COMPONENTS */}

              <div className="mt-7 grid grid-cols-3 gap-4">

                <ComponentPanel
                  title="Triggers"
                  icon={<Zap size={18} />}
                  count={triggers.length}
                />

                <ComponentPanel
                  title="AI Agents"
                  icon={<Bot size={18} />}
                  count={agents.length}
                />

                <ComponentPanel
                  title="Tools & Actions"
                  icon={<Wrench size={18} />}
                  count={tools.length + actions.length}
                />

              </div>

            </section>

          )}

          {/* ======================================
              HISTORY TAB
          ====================================== */}

          {activeTab === "history" && (

            <section>

              <div className="mb-5">

                <h2 className="text-lg font-semibold">
                  Execution History
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Monitor workflow executions and AI agent activity.
                </p>

              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">

                <div className="grid grid-cols-[1.5fr_1fr_1.2fr_110px_90px_110px] gap-4 border-b border-slate-200 bg-slate-50 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400">

                  <span>Workflow</span>
                  <span>Agent</span>
                  <span>Trigger</span>
                  <span>Status</span>
                  <span>Duration</span>
                  <span>Time</span>

                </div>

                {executionHistory.map((execution, index) => (

                  <div
                    key={index}
                    className="grid grid-cols-[1.5fr_1fr_1.2fr_110px_90px_110px] items-center gap-4 border-b border-slate-100 px-5 py-4 last:border-b-0"
                  >

                    <div>

                      <p className="text-sm font-semibold">
                        {execution.workflow}
                      </p>

                      <p className="mt-1 text-[11px] text-slate-400">
                        Execution #{1000 + index}
                      </p>

                    </div>

                    <span className="text-xs font-medium text-slate-700">
                      {execution.agent}
                    </span>

                    <span className="text-xs text-slate-600">
                      {execution.trigger}
                    </span>

                    <span
                      className={`flex w-fit items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        execution.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-red-50 text-red-700"
                      }`}
                    >

                      {execution.status === "Completed" ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <XCircle size={12} />
                      )}

                      {execution.status}

                    </span>

                    <span className="text-xs text-slate-600">
                      {execution.duration}
                    </span>

                    <span className="text-xs text-slate-500">
                      {execution.time}
                    </span>

                  </div>

                ))}

              </div>

              {/* EXECUTION SUMMARY */}

              <div className="mt-6 grid grid-cols-3 gap-4">

                <ExecutionCard
                  title="Successful Runs"
                  value="24,386"
                  icon={<CheckCircle2 size={19} />}
                />

                <ExecutionCard
                  title="Average Duration"
                  value="3.2s"
                  icon={<Clock3 size={19} />}
                />

                <ExecutionCard
                  title="Failed Runs"
                  value="426"
                  icon={<XCircle size={19} />}
                />

              </div>

            </section>

          )}

        </div>

      </main>

      {/* ==========================================
          CREATE MODAL
      ========================================== */}

      {showCreate && (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-6 backdrop-blur-sm">

          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white shadow-2xl">

            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">

              <div>

                <h3 className="text-base font-semibold">
                  Create Agent Workflow
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  Start with a business workflow template.
                </p>

              </div>

              <button
                onClick={() => setShowCreate(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <XIcon />
              </button>

            </div>

            <div className="space-y-5 p-6">

              <div>

                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Workflow Name
                </label>

                <input
                  value={workflowName}
                  onChange={(event) =>
                    setWorkflowName(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-slate-500"
                  placeholder="Enter workflow name"
                />

              </div>

              <div>

                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Business Area
                </label>

                <select
                  value={selectedBusiness}
                  onChange={(event) =>
                    setSelectedBusiness(
                      event.target.value
                    )
                  }
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none"
                >

                  {businessAreas.map((business) => (
                    <option
                      key={business.name}
                      value={business.name}
                    >
                      {business.name}
                    </option>
                  ))}

                </select>

              </div>

              <div className="grid grid-cols-2 gap-3">

                <QuickOption
                  title="CRM Automation"
                  description="Leads & customers"
                />

                <QuickOption
                  title="HR Automation"
                  description="Employee workflows"
                />

                <QuickOption
                  title="Sales Automation"
                  description="Lead qualification"
                />

                <QuickOption
                  title="Finance Automation"
                  description="Invoices & approvals"
                />

              </div>

            </div>

            <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">

              <button
                onClick={() => setShowCreate(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                onClick={createWorkflow}
                className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Create Workflow
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

/* ==========================================
   NAV ITEM
========================================== */

function NavItem({
  icon,
  label,
  active = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
}) {
  return (
    <button
      className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
        active
          ? "bg-slate-100 font-medium text-slate-900"
          : "text-slate-600 hover:bg-slate-50"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

/* ==========================================
   STATUS ITEM
========================================== */

function StatusItem({
  label,
}: {
  label: string;
}) {
  return (
    <div className="mb-2 flex items-center justify-between">

      <span className="text-xs text-slate-600">
        {label}
      </span>

      <span className="text-[10px] font-medium text-emerald-600">
        ● Active
      </span>

    </div>
  );
}

/* ==========================================
   METRIC
========================================== */

function MetricCard({
  label,
  value,
  change,
}: {
  label: string;
  value: string;
  change: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">

      <p className="text-xs text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold">
        {value}
      </p>

      <p className="mt-1 text-[11px] font-medium text-emerald-600">
        {change}
      </p>

    </div>
  );
}

/* ==========================================
   TAB BUTTON
========================================== */

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-lg px-4 py-2.5 text-xs font-medium transition ${
        active
          ? "bg-slate-900 text-white"
          : "text-slate-600 hover:bg-slate-100"
      }`}
    >
      {children}
    </button>
  );
}

/* ==========================================
   WORKFLOW NODE
========================================== */

function WorkflowNode({
  number,
  title,
  subtitle,
  icon,
}: {
  number: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-[500px] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

      <div className="flex items-center gap-4">

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
          {icon}
        </div>

        <div className="flex-1">

          <div className="flex items-center gap-2">

            <span className="text-[10px] font-semibold text-slate-400">
              {number}
            </span>

            <p className="text-sm font-semibold">
              {title}
            </p>

          </div>

          <p className="mt-1 text-xs text-slate-500">
            {subtitle}
          </p>

        </div>

        <Settings2
          size={16}
          className="text-slate-400"
        />

      </div>

    </div>
  );
}

/* ==========================================
   FLOW ARROW
========================================== */

function FlowArrow() {
  return (
    <div className="flex h-12 items-center justify-center">

      <div className="h-8 w-px bg-slate-300" />

    </div>
  );
}

/* ==========================================
   BUILDER SELECT
========================================== */

function BuilderSelect({
  title,
  value,
  options,
  onChange,
}: {
  title: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">

      <div className="mb-2 flex items-center justify-between">

        <label className="text-xs font-semibold text-slate-600">
          {title}
        </label>

        <Settings2
          size={14}
          className="text-slate-400"
        />

      </div>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs outline-none"
      >

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}

      </select>

    </div>
  );
}

/* ==========================================
   COMPONENT PANEL
========================================== */

function ComponentPanel({
  title,
  icon,
  count,
}: {
  title: string;
  icon: React.ReactNode;
  count: number;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
        {icon}
      </div>

      <div>

        <p className="text-sm font-semibold">
          {title}
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {count} components available
        </p>

      </div>

    </div>
  );
}

/* ==========================================
   EXECUTION CARD
========================================== */

function ExecutionCard({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">

      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
        {icon}
      </div>

      <div>

        <p className="text-xs text-slate-500">
          {title}
        </p>

        <p className="mt-1 text-xl font-bold">
          {value}
        </p>

      </div>

    </div>
  );
}

/* ==========================================
   QUICK OPTION
========================================== */

function QuickOption({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <button className="rounded-xl border border-slate-200 p-3 text-left hover:border-slate-300 hover:bg-slate-50">

      <p className="text-xs font-semibold">
        {title}
      </p>

      <p className="mt-1 text-[10px] text-slate-500">
        {description}
      </p>

    </button>
  );
}

/* ==========================================
   X ICON
========================================== */

function XIcon() {
  return (
    <span className="text-lg leading-none">
      ×
    </span>
  );
}