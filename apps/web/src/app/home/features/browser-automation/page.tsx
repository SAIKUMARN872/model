"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Download,
  ExternalLink,
  FileUp,
  Globe,
  Loader2,
  MousePointer2,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Square,
  Sparkles,
  Terminal,
  Upload,
  UserCheck,
  Zap,
} from "lucide-react";

type TaskStep = {
  id: number;
  title: string;
  description: string;
  status: "pending" | "running" | "completed";
};

const connectors = [
  { name: "E-commerce", description: "Shopping and product workflows" },
  { name: "Food", description: "Restaurant and food ordering" },
  { name: "Travel", description: "Flights and hotel research" },
  { name: "Movie Booking", description: "Movie and seat selection" },
  { name: "Payment", description: "Payment-ready workflows" },
  { name: "Email", description: "Email-based actions" },
  { name: "Calendar", description: "Calendar scheduling" },
  { name: "WhatsApp", description: "Messaging workflows" },
  { name: "Slack", description: "Team communication" },
  { name: "Storage", description: "Cloud file operations" },
];

const browserModules = [
  "Browser Manager",
  "Navigation",
  "Form Filling",
  "Downloads",
  "Uploads",
  "Screenshots",
  "Session Storage",
];

export default function BrowserAutomationPage() {
  const [task, setTask] = useState("");
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedConnector, setSelectedConnector] = useState<string | null>(
    null
  );
  const [showConnectors, setShowConnectors] = useState(false);
  const [executionTime, setExecutionTime] = useState(0);

  const createInitialSteps = (): TaskStep[] => [
    {
      id: 1,
      title: "Understand user request",
      description:
        "Analyze the task, intent, constraints and preferences.",
      status: "pending",
    },
    {
      id: 2,
      title: "Open required website",
      description:
        "Navigate to the appropriate website or web application.",
      status: "pending",
    },
    {
      id: 3,
      title: "Find required information",
      description:
        "Search and identify the requested product, service or page.",
      status: "pending",
    },
    {
      id: 4,
      title: "Prepare the action",
      description:
        "Fill forms, select options and prepare the requested action.",
      status: "pending",
    },
    {
      id: 5,
      title: "Request user confirmation",
      description:
        "Ask for confirmation before any irreversible action.",
      status: "pending",
    },
  ];

  const [steps, setSteps] = useState<TaskStep[]>(createInitialSteps());

  const resetSteps = () => {
    setSteps(createInitialSteps());
    setCurrentStep(0);
    setIsRunning(false);
    setIsPaused(false);
    setExecutionTime(0);
  };

  const generatePlan = () => {
    if (!task.trim()) return;

    setShowPlan(true);
    resetSteps();
  };

  const startExecution = () => {
    if (!task.trim()) return;

    setShowPlan(true);
    setIsRunning(true);
    setIsPaused(false);
    setCurrentStep(0);
    setExecutionTime(120);

    setSteps((previous) =>
      previous.map((step, index) => ({
        ...step,
        status: index === 0 ? "running" : "pending",
      }))
    );
  };

  const pauseExecution = () => {
    setIsPaused(true);
    setIsRunning(false);
  };

  const resumeExecution = () => {
    setIsPaused(false);
    setIsRunning(true);
  };

  const stopExecution = () => {
    resetSteps();
  };

  const simulateNextStep = () => {
    if (!isRunning) return;

    setSteps((previous) =>
      previous.map((step, index) => {
        if (index <= currentStep) {
          return { ...step, status: "completed" };
        }

        if (index === currentStep + 1) {
          return { ...step, status: "running" };
        }

        return { ...step, status: "pending" };
      })
    );

    setExecutionTime((value) => value + 340);

    if (currentStep < steps.length - 1) {
      setCurrentStep((value) => value + 1);
    } else {
      setIsRunning(false);
      setIsPaused(false);
      setCurrentStep(steps.length);
    }
  };

  const useExample = (value: string) => {
    setTask(value);
    setShowPlan(false);
    resetSteps();
  };

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <a
              href="/chat"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            >
              <ArrowLeft size={18} />
            </a>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Globe size={19} />
              </div>

              <div>
                <h1 className="text-lg font-semibold">
                  Browser Automation
                </h1>
                <p className="text-xs text-slate-500">
                  ModelNow intelligent web execution
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Automation Ready
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] grid-cols-1 gap-6 px-6 py-6 lg:grid-cols-[1fr_370px]">
        {/* Main */}
        <section className="space-y-6">
          {/* Hero */}
          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <div className="mb-6 flex items-start gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Sparkles size={24} />
              </div>

              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  What should ModelNow do?
                </h2>

                <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                  Describe a web task in natural language. ModelNow will
                  create an execution plan and use browser automation to
                  complete it.
                </p>
              </div>
            </div>

            <textarea
              value={task}
              onChange={(event) => setTask(event.target.value)}
              placeholder="Example: Find the best movie available tonight, compare prices, and prepare the booking..."
              className="min-h-[150px] w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck size={15} className="text-emerald-600" />
                Sensitive actions require confirmation
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={generatePlan}
                  disabled={!task.trim()}
                  className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Sparkles size={16} />
                  Generate Plan
                </button>

                <button
                  onClick={startExecution}
                  disabled={!task.trim()}
                  className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Zap size={16} />
                  Run Task
                </button>
              </div>
            </div>
          </div>

          {/* Execution plan */}
          {showPlan && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-4 border-b border-slate-200 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold">AI Execution Plan</h2>
                  <p className="mt-1 text-xs text-slate-500">
                    ModelNow converted your request into executable browser
                    actions.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {!isRunning &&
                    !isPaused &&
                    currentStep < steps.length && (
                      <button
                        onClick={startExecution}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        <Play size={15} />
                        Start
                      </button>
                    )}

                  {isRunning && (
                    <>
                      <button
                        onClick={pauseExecution}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                      >
                        <Pause size={15} />
                        Pause
                      </button>

                      <button
                        onClick={stopExecution}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <Square size={14} />
                        Stop
                      </button>
                    </>
                  )}

                  {isPaused && (
                    <>
                      <button
                        onClick={resumeExecution}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        <Play size={15} />
                        Resume
                      </button>

                      <button
                        onClick={stopExecution}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
                      >
                        <Square size={14} />
                        Stop
                      </button>
                    </>
                  )}

                  {currentStep === steps.length && (
                    <button
                      onClick={resetSteps}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium hover:bg-slate-50"
                    >
                      <RotateCcw size={15} />
                      Reset
                    </button>
                  )}
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className={`flex gap-4 rounded-xl border p-4 transition ${
                        step.status === "running"
                          ? "border-blue-200 bg-blue-50"
                          : step.status === "completed"
                          ? "border-emerald-200 bg-emerald-50"
                          : "border-slate-200 bg-white"
                      }`}
                    >
                      <div className="shrink-0">
                        {step.status === "completed" ? (
                          <CheckCircle2
                            size={22}
                            className="text-emerald-600"
                          />
                        ) : step.status === "running" ? (
                          <Loader2
                            size={22}
                            className="animate-spin text-blue-600"
                          />
                        ) : (
                          <div className="flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-slate-300 text-[10px] font-bold text-slate-500">
                            {step.id}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="text-sm font-semibold">
                            {step.title}
                          </h3>

                          <span
                            className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                              step.status === "completed"
                                ? "bg-emerald-100 text-emerald-700"
                                : step.status === "running"
                                ? "bg-blue-100 text-blue-700"
                                : "bg-slate-100 text-slate-500"
                            }`}
                          >
                            {step.status}
                          </span>
                        </div>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {isRunning && currentStep < steps.length && (
                  <button
                    onClick={simulateNextStep}
                    className="mt-5 inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-100"
                  >
                    <MousePointer2 size={14} />
                    Simulate next browser action
                  </button>
                )}

                {!isRunning &&
                  !isPaused &&
                  currentStep === steps.length && (
                    <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                      <CheckCircle2 size={18} />
                      Execution plan completed successfully.
                    </div>
                  )}
              </div>
            </div>
          )}

          {/* Browser architecture */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-sm font-semibold">
                Browser Automation Runtime
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Core modules used by ModelNow for browser-based execution.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {browserModules.map((module, index) => (
                <div
                  key={module}
                  className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
                      {index === 0 ? (
                        <Globe size={17} />
                      ) : index === 1 ? (
                        <ExternalLink size={17} />
                      ) : index === 2 ? (
                        <MousePointer2 size={17} />
                      ) : index === 3 ? (
                        <Download size={17} />
                      ) : index === 4 ? (
                        <Upload size={17} />
                      ) : index === 5 ? (
                        <Sparkles size={17} />
                      ) : (
                        <ShieldCheck size={17} />
                      )}
                    </div>

                    <span className="text-xs font-semibold">{module}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Connectors */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">
                  Connectors
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  External services ModelNow can connect to for automation.
                </p>
              </div>

              <button
                onClick={() => setShowConnectors((value) => !value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold hover:bg-slate-50"
              >
                {showConnectors ? "Hide" : "View all"}
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(showConnectors ? connectors : connectors.slice(0, 6)).map(
                (connector) => (
                  <button
                    key={connector.name}
                    onClick={() => setSelectedConnector(connector.name)}
                    className={`rounded-xl border p-4 text-left transition ${
                      selectedConnector === connector.name
                        ? "border-blue-300 bg-blue-50"
                        : "border-slate-200 bg-white hover:border-blue-200 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                        <Globe size={17} />
                      </div>

                      <div>
                        <p className="text-xs font-semibold">
                          {connector.name}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-500">
                          {connector.description}
                        </p>
                      </div>
                    </div>
                  </button>
                )
              )}
            </div>

            {selectedConnector && (
              <div className="mt-4 flex items-center justify-between rounded-xl border border-blue-200 bg-blue-50 p-4">
                <div>
                  <p className="text-xs font-semibold text-blue-900">
                    Selected connector
                  </p>
                  <p className="mt-1 text-xs text-blue-700">
                    {selectedConnector} connector selected for this workflow.
                  </p>
                </div>

                <button
                  onClick={() => setSelectedConnector(null)}
                  className="text-xs font-semibold text-blue-700 hover:underline"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Example tasks */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Example tasks</h2>
              <span className="text-xs text-slate-400">
                Try a scenario
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {[
                {
                  title: "Travel research",
                  icon: Globe,
                  text: "Find flights and hotels for my trip and compare the best options.",
                },
                {
                  title: "Shopping",
                  icon: ExternalLink,
                  text: "Find a suitable laptop under my budget and compare available options.",
                },
                {
                  title: "Movie booking",
                  icon: Globe,
                  text: "Find a movie playing tonight and prepare the best available seats.",
                },
                {
                  title: "Food ordering",
                  icon: Globe,
                  text: "Find a highly rated restaurant and prepare a food order.",
                },
              ].map((example) => {
                const Icon = example.icon;

                return (
                  <button
                    key={example.title}
                    onClick={() => useExample(example.text)}
                    className="rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-blue-200 hover:bg-blue-50/40"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Icon size={16} className="text-blue-600" />
                      {example.title}
                    </div>

                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      {example.text}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Right sidebar */}
        <aside className="space-y-5">
          {/* Intelligence */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Sparkles size={19} />
              </div>

              <div>
                <h2 className="text-sm font-semibold">
                  ModelNow Intelligence
                </h2>
                <p className="text-xs text-slate-500">
                  Automation runtime
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                ["Planning Engine", "Ready", "text-emerald-600"],
                ["Browser Engine", "Ready", "text-emerald-600"],
                ["Safety Layer", "Active", "text-emerald-600"],
                ["Human Confirmation", "Enabled", "text-blue-600"],
              ].map(([label, status, color]) => (
                <div
                  key={label}
                  className="flex items-center justify-between"
                >
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className={`text-xs font-semibold ${color}`}>
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Current task */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Terminal size={17} className="text-slate-600" />
              <h2 className="text-sm font-semibold">Current Task</h2>
            </div>

            {task ? (
              <p className="rounded-xl bg-slate-50 p-4 text-xs leading-5 text-slate-600">
                {task}
              </p>
            ) : (
              <p className="text-xs leading-5 text-slate-400">
                No automation task has been created yet.
              </p>
            )}
          </div>

          {/* Browser session */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Globe size={17} className="text-blue-600" />
              <h2 className="text-sm font-semibold">
                Browser Session
              </h2>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-xs text-slate-500">
                  Browser
                </span>
                <span className="text-xs font-semibold text-emerald-600">
                  Ready
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-xs text-slate-500">
                  Session
                </span>
                <span className="text-xs font-semibold">
                  Persistent
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-xs text-slate-500">
                  Downloads
                </span>
                <span className="text-xs font-semibold">
                  Enabled
                </span>
              </div>
            </div>
          </div>

          {/* File operations */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <FileUp size={17} className="text-slate-600" />
              <h2 className="text-sm font-semibold">
                File Operations
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <Upload size={16} className="text-slate-500" />
                <p className="mt-2 text-xs font-semibold">
                  Uploads
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Supported
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <Download size={16} className="text-slate-500" />
                <p className="mt-2 text-xs font-semibold">
                  Downloads
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Supported
                </p>
              </div>
            </div>
          </div>

          {/* Safety */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex gap-3">
              <ShieldCheck
                size={20}
                className="mt-0.5 shrink-0 text-amber-600"
              />

              <div>
                <h2 className="text-sm font-semibold text-amber-900">
                  Safety & Control
                </h2>

                <p className="mt-2 text-xs leading-5 text-amber-800">
                  ModelNow can navigate websites and prepare actions,
                  but irreversible actions such as purchases, bookings
                  and submissions should require user approval.
                </p>
              </div>
            </div>
          </div>

          {/* Execution stats */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold">
              Execution Stats
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <Clock3 size={16} className="text-slate-500" />
                <p className="mt-2 text-lg font-bold">
                  {executionTime}ms
                </p>
                <p className="text-[11px] text-slate-500">
                  Execution time
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <UserCheck size={16} className="text-slate-500" />
                <p className="mt-2 text-lg font-bold">
                  {currentStep === steps.length ? 1 : 0}
                </p>
                <p className="text-[11px] text-slate-500">
                  Approvals
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}