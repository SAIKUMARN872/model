"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import Section from "../../components/computer-use/shared/Section";
import ActionButton from "../../components/computer-use/shared/ActionButton";
import Metric from "../../components/computer-use/shared/Metric";
import Toggle from "../../components/computer-use/shared/Toggle";
import Modal from "../../components/computer-use/shared/Modal";
import FilesPanel from "../../components/computer-use/files/FilesPanel";
import ManagerPanel from "../../components/computer-use/desktop/ManagerPanel";
import VisionPanel from "../../components/computer-use/vision/VisionPanel";
import MousePanel from "../../components/computer-use/mouse/MousePanel";
import KeyboardPanel from "../../components/computer-use/keyboard/KeyboardPanel";

import {
  ArrowLeft,
  Monitor,
  RefreshCw,
  Cpu,
  MousePointer2,
  MousePointerClick,
  Keyboard,
  Clipboard,
  AppWindow,
  FolderOpen,
  Globe,
  Download,
  Upload,
  Save,
  History,
  Cookie,
  Shield,
  Lock,
  AlertTriangle,
  CreditCard,
  CircleStop,
  CheckCircle2,
  Clock3,
  Play,
  Pause,
  Square,
  RotateCw,
  Search,
  Eye,
  FileText,
  Copy,
  ExternalLink,
  Settings,
  Activity,
  Zap,
  Server,
  Check,
  Mic,
  Paperclip,
  Plus,
  Send,
} from "lucide-react";

type Tab =
  | "manager"
  | "vision"
  | "mouse"
  | "keyboard"
  | "windows"
  | "files"
  | "browser"
  | "apps"
  | "clipboard"
  | "session"
  | "permissions"
  | "safety"
  | "execution";

type LogType = "success" | "info" | "warning" | "error";

type LogItem = {
  id: number;
  time: string;
  message: string;
  type: LogType;
};

type ActionItem = {
  id: number;
  action: string;
  status: "Completed" | "Running" | "Waiting" | "Failed";
  time: string;
};

const tabs: {
  id: Tab;
  label: string;
  icon: any;
}[] = [
  { id: "manager", label: "Desktop", icon: Monitor },
  { id: "vision", label: "Screen & Visual UI", icon: Eye },
  { id: "mouse", label: "Mouse", icon: MousePointer2 },
  { id: "keyboard", label: "Keyboard", icon: Keyboard },
  { id: "windows", label: "Windows", icon: AppWindow },
  { id: "files", label: "Files", icon: FolderOpen },
  { id: "browser", label: "Browser", icon: Globe },
  { id: "apps", label: "Applications", icon: Server },
  { id: "clipboard", label: "Clipboard", icon: Clipboard },
  { id: "session", label: "Session", icon: History },
  { id: "permissions", label: "Permissions & Security", icon: Shield },
  { id: "safety", label: "Safety", icon: AlertTriangle },
  { id: "execution", label: "Execution", icon: Activity },
];

const executionSteps = [
  "Open the required application",
  "Find the required workbook",
  "Read the visible data",
  "Create or update the spreadsheet",
  "Format the report",
  "Save the result",
  "Verify the result",
];

const initialLogs: LogItem[] = [
  {
    id: 1,
    time: "10:42:18",
    message: "Computer session initialized",
    type: "success",
  },
  {
    id: 2,
    time: "10:42:21",
    message: "Screen state captured",
    type: "info",
  },
  {
    id: 3,
    time: "10:42:24",
    message: "Application permissions verified",
    type: "success",
  },
];

const initialActions: ActionItem[] = [
  {
    id: 1,
    action: "Open enterprise application",
    status: "Completed",
    time: "10:41:52",
  },
  {
    id: 2,
    action: "Read current screen",
    status: "Completed",
    time: "10:42:01",
  },
  {
    id: 3,
    action: "Navigate to requested section",
    status: "Running",
    time: "10:42:12",
  },
];

export default function ComputerUsePage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>("manager");
  const [computerRunning, setComputerRunning] = useState(true);
  const [taskRunning, setTaskRunning] = useState(false);
  const [taskPaused, setTaskPaused] = useState(false);
  const [taskText, setTaskText] = useState("");
  const [currentStep, setCurrentStep] = useState(0);

  const [approvalRequired, setApprovalRequired] = useState(true);
  const [paymentProtection, setPaymentProtection] = useState(true);
  const [sensitiveActionProtection, setSensitiveActionProtection] =
    useState(true);
  const [domainRestriction, setDomainRestriction] = useState(true);

  const [logs, setLogs] = useState<LogItem[]>(initialLogs);
  const [actions, setActions] = useState<ActionItem[]>(initialActions);

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showFileModal, setShowFileModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  const [selectedFile, setSelectedFile] = useState("Quarterly_Report.xlsx");

  const [mousePosition, setMousePosition] = useState({
    x: 642,
    y: 388,
  });

  const progress = useMemo(() => {
    return Math.round((currentStep / executionSteps.length) * 100);
  }, [currentStep]);

  function addLog(message: string, type: LogType = "info") {
    setLogs((prev) => [
      {
        id: Date.now(),
        time: new Date().toLocaleTimeString([], {
          hour12: false,
        }),
        message,
        type,
      },
      ...prev,
    ]);
  }

  function startComputer() {
    setComputerRunning(true);
    addLog("Virtual computer started", "success");
  }

  function stopComputer() {
    setComputerRunning(false);
    setTaskRunning(false);
    setTaskPaused(false);
    addLog("Virtual computer stopped", "warning");
  }

  function restartComputer() {
    setComputerRunning(false);
    addLog("Restarting virtual computer...", "info");

    setTimeout(() => {
      setComputerRunning(true);
      addLog("Virtual computer restarted", "success");
    }, 700);
  }

  function resetEnvironment() {
    setCurrentStep(0);
    setTaskRunning(false);
    setTaskPaused(false);
    addLog("Computer environment reset", "success");
  }

  function screenshot() {
    addLog("Screenshot captured successfully", "success");
  }

  function detectUI() {
    addLog("UI elements detected: 18 interactive elements", "success");
  }

  function runMouseAction(action: string) {
    setMousePosition({
      x: Math.floor(Math.random() * 900) + 100,
      y: Math.floor(Math.random() * 450) + 100,
    });

    addLog(`Mouse action executed: ${action}`, "success");
  }

  function runKeyboardAction(action: string) {
    addLog(`Keyboard action executed: ${action}`, "success");
  }

  function runWindowAction(action: string) {
    addLog(`Window action executed: ${action}`, "success");
  }

  function runFileAction(action: string) {
    addLog(`File operation executed: ${action}`, "success");
  }

  function runBrowserAction(action: string) {
    addLog(`Browser action executed: ${action}`, "success");
  }

  function startTask() {
    if (!computerRunning) {
      addLog("Cannot start task because computer is stopped", "error");
      return;
    }

    if (!taskText.trim()) {
      setShowTaskModal(true);
      return;
    }

    setTaskRunning(true);
    setTaskPaused(false);
    setCurrentStep(1);

    setActions((prev) => [
      {
        id: Date.now(),
        action: taskText,
        status: "Running",
        time: new Date().toLocaleTimeString(),
      },
      ...prev,
    ]);

    addLog(`Task started: ${taskText}`, "success");
  }

  function nextStep() {
    if (!taskRunning || taskPaused) return;

    if (currentStep < executionSteps.length) {
      const next = currentStep + 1;

      setCurrentStep(next);

      addLog(
        `${executionSteps[Math.min(next - 1, executionSteps.length - 1)]} completed`,
        "success"
      );

      if (next === executionSteps.length) {
        setTaskRunning(false);

        setActions((prev) =>
          prev.map((item, index) =>
            index === 0
              ? {
                  ...item,
                  status: "Completed",
                }
              : item
          )
        );

        addLog("Task completed and result verified", "success");
      }
    }
  }

  function pauseTask() {
    setTaskPaused(true);
    addLog("Task execution paused", "warning");
  }

  function resumeTask() {
    setTaskPaused(false);
    addLog("Task execution resumed", "success");
  }

  function stopTask() {
    setTaskRunning(false);
    setTaskPaused(false);
    addLog("Task execution stopped", "warning");
  }

  function requestApproval() {
    setShowApprovalModal(true);
    addLog("Human approval requested for sensitive action", "warning");
  }

  function approveAction() {
    setShowApprovalModal(false);
    addLog("Sensitive action approved by user", "success");
  }

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-900">
      {/* HEADER */}
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1500px] items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push("/chat")}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white hover:bg-slate-50"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Monitor size={21} />
              </div>

              <div>
                <h1 className="text-lg font-semibold">
                  ModelNow Computer Use
                </h1>

                <p className="text-xs text-slate-500">
                  AI-powered computer interaction platform
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${
                computerRunning
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  computerRunning ? "bg-emerald-500" : "bg-red-500"
                }`}
              />

              {computerRunning ? "Computer Online" : "Computer Offline"}
            </div>

            <button
              onClick={requestApproval}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm hover:bg-slate-50"
            >
              <Shield size={16} />
              Approval
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1500px]">
        {/* SIDEBAR */}
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:block">
          <div className="sticky top-16 p-4">
            <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Computer Use
            </p>

            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const active = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition ${
                      active
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    <Icon size={17} />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </aside>

        {/* CONTENT */}
        <section className="min-w-0 flex-1 p-6">
          {/* HERO */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col justify-between gap-5 xl:flex-row xl:items-center">
              <div>
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                  <Monitor size={16} />
                  COMPUTER USE
                </div>

                <h2 className="text-2xl font-bold tracking-tight">
                  Control computers with AI
                </h2>

                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
                  ModelNow can understand screens, control applications,
                  operate browsers, manage files, use keyboards and mice, and
                  execute multi-step computer tasks with enterprise safety
                  controls.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <Metric label="Sessions" value="1,284" />
                <Metric label="Actions" value="28.6K" />
                <Metric label="Success" value="96.4%" />
                <Metric label="Avg. Time" value="42s" />
              </div>
            </div>
          </div>
          {/* TASK BAR - MODELNOW CHAT BOX */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <div className="min-w-0 flex-1 rounded-2xl border border-slate-300 bg-white p-3 transition focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-100">
                <textarea
                  value={taskText}
                  onChange={(event) => setTaskText(event.target.value)}
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();
                      startTask();
                    }
                  }}
                  rows={2}
                  placeholder="Tell Computer Use what you want it to do..."
                  aria-label="Describe your computer task"
                  className="max-h-40 min-h-16 w-full resize-y border-0 bg-transparent px-1 py-2 text-sm leading-6 text-slate-900 outline-none placeholder:text-slate-400 focus:ring-0"
                />

                <div className="flex items-center justify-between border-t border-slate-100 pt-3">
                  <div className="flex items-center gap-2">
                    {/* Plus button */}
                    <button
                      type="button"
                      onClick={() => setShowFileModal(true)}
                      aria-label="Attach a file"
                      title="Attach a file"
                      className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Plus size={21} />
                    </button>

                    {/* Microphone button */}
                    <button
                      type="button"
                      onClick={() =>
                        addLog(
                          "Microphone selected. Voice input is not configured yet.",
                          "info"
                        )
                      }
                      aria-label="Use microphone"
                      title="Use microphone"
                      className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Mic size={19} />
                    </button>

                    <span className="hidden text-xs text-slate-400 sm:inline">
                      Enter to send · Shift+Enter for a new line
                    </span>
                  </div>

                  {/* Send button */}
                  <button
                    type="button"
                    onClick={startTask}
                    disabled={!taskText.trim() || !computerRunning}
                    aria-label="Start computer task"
                    title="Start Task"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>

              {/* Next Step remains available */}
              <button
                onClick={nextStep}
                disabled={!taskRunning || taskPaused}
                className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next Step
              </button>
            </div>
          </div>

          {/* ACTIVE TASK */}
          {taskRunning && (
            <div className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Current Task
                  </p>

                  <h3 className="mt-1 text-base font-semibold">
                    {taskText}
                  </h3>
                </div>

                <div className="flex gap-2">
                  {taskPaused ? (
                    <button
                      onClick={resumeTask}
                      className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                    >
                      <Play size={15} />
                      Resume
                    </button>
                  ) : (
                    <button
                      onClick={pauseTask}
                      className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm"
                    >
                      <Pause size={15} />
                      Pause
                    </button>
                  )}

                  <button
                    onClick={stopTask}
                    className="flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm text-red-600"
                  >
                    <Square size={15} />
                    Stop
                  </button>
                </div>
              </div>

              <div className="mb-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-slate-900 transition-all"
                  style={{
                    width: `${Math.max(progress, 8)}%`,
                  }}
                />
              </div>

              <div className="grid gap-2 md:grid-cols-5">
                {executionSteps.map((step, index) => {
                  const completed = index < currentStep;
                  const running = index === currentStep;

                  return (
                    <div
                      key={step}
                      className={`rounded-lg border p-3 ${
                        completed
                          ? "border-emerald-200 bg-emerald-50"
                          : running
                          ? "border-blue-200 bg-blue-50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    >
                      <div className="mb-2 flex items-center gap-2">
                        {completed ? (
                          <CheckCircle2
                            size={16}
                            className="text-emerald-600"
                          />
                        ) : running ? (
                          <Clock3 size={16} className="text-blue-600" />
                        ) : (
                          <span className="text-xs font-semibold text-slate-400">
                            {index + 1}
                          </span>
                        )}
                      </div>

                      <p className="text-xs font-medium">{step}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB CONTENT */}
          {activeTab === "manager" && (
            <ManagerPanel
              running={computerRunning}
              start={startComputer}
              stop={stopComputer}
              restart={restartComputer}
              reset={resetEnvironment}
            />
          )}

          {activeTab === "vision" && (
            <VisionPanel
              screenshot={screenshot}
              detectUI={detectUI}
              addLog={addLog}
            />
          )}

          {activeTab === "mouse" && (
            <MousePanel
              position={mousePosition}
              runAction={runMouseAction}
            />
          )}

          {activeTab === "keyboard" && (
            <KeyboardPanel runAction={runKeyboardAction} />
          )}

          {activeTab === "windows" && (
            <WindowPanel runAction={runWindowAction} />
          )}

          {activeTab === "files" && (
            <FilesPanel
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
              runAction={runFileAction}
              openModal={() => setShowFileModal(true)}
            />
          )}

          {activeTab === "browser" && (
            <BrowserPanel runAction={runBrowserAction} />
          )}

          {activeTab === "apps" && (
            <ApplicationsPanel runAction={runWindowAction} />
          )}

          {activeTab === "clipboard" && (
            <ClipboardPanel runAction={runKeyboardAction} />
          )}

          {activeTab === "session" && (
            <SessionPanel addLog={addLog} />
          )}

          {activeTab === "permissions" && (
            <PermissionsPanel
              approvalRequired={approvalRequired}
              setApprovalRequired={setApprovalRequired}
              domainRestriction={domainRestriction}
              setDomainRestriction={setDomainRestriction}
            />
          )}

          {activeTab === "safety" && (
            <SafetyPanel
              paymentProtection={paymentProtection}
              setPaymentProtection={setPaymentProtection}
              sensitiveActionProtection={sensitiveActionProtection}
              setSensitiveActionProtection={
                setSensitiveActionProtection
              }
              requestApproval={requestApproval}
            />
          )}

          {activeTab === "execution" && (
            <ExecutionPanel
              actions={actions}
              logs={logs}
              retry={() => {
                addLog("Retrying last failed action", "info");
              }}
            />
          )}

          {/* BOTTOM ARCHITECTURE */}
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2">
              <Cpu size={18} />
              <h3 className="font-semibold">
                Computer Use Architecture
              </h3>
            </div>

            <div className="grid gap-3 md:grid-cols-6">
              {[
                ["Understand", "Understand task"],
                ["Observe", "Screen + vision"],
                ["Plan", "Create action plan"],
                ["Act", "Mouse + keyboard"],
                ["Verify", "Check result"],
                ["Complete", "Finish safely"],
              ].map(([title, subtitle], index) => (
                <div key={title} className="relative">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="mb-2 flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-xs font-bold text-white">
                      {index + 1}
                    </div>

                    <p className="text-sm font-semibold">{title}</p>

                    <p className="mt-1 text-xs text-slate-500">
                      {subtitle}
                    </p>
                  </div>

                  {index < 5 && (
                    <div className="absolute right-[-12px] top-1/2 hidden text-slate-300 md:block">
                      →
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* TASK MODAL */}
      {showTaskModal && (
        <Modal
          title="Create Computer Task"
          onClose={() => setShowTaskModal(false)}
        >
          <p className="mb-4 text-sm text-slate-500">
            Describe what you want ModelNow Computer Use to perform.
          </p>

          <textarea
            value={taskText}
            onChange={(e) => setTaskText(e.target.value)}
            placeholder="Example: Open the CRM and update the customer record..."
            className="min-h-32 w-full rounded-lg border border-slate-200 p-3 text-sm outline-none focus:border-slate-400"
          />

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setShowTaskModal(false)}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Cancel
            </button>

            <button
              onClick={() => {
                setShowTaskModal(false);
                startTask();
              }}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white"
            >
              Start Task
            </button>
          </div>
        </Modal>
      )}

      {/* FILE MODAL */}
      {showFileModal && (
        <Modal
          title="Upload File"
          onClose={() => setShowFileModal(false)}
        >
          <div className="rounded-xl border-2 border-dashed border-slate-200 p-8 text-center">
            <Upload
              className="mx-auto mb-3 text-slate-400"
              size={28}
            />

            <p className="text-sm font-medium">Upload a file</p>

            <p className="mt-1 text-xs text-slate-500">
              PDF, DOCX, XLSX, CSV, TXT and images
            </p>

            <button
              onClick={() => {
                setShowFileModal(false);
                addLog("File uploaded successfully", "success");
              }}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white"
            >
              Select File
            </button>
          </div>
        </Modal>
      )}

      {/* APPROVAL MODAL */}
      {showApprovalModal && (
        <Modal
          title="Action Approval Required"
          onClose={() => setShowApprovalModal(false)}
        >
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex gap-3">
              <AlertTriangle
                size={20}
                className="mt-0.5 text-amber-600"
              />

              <div>
                <p className="text-sm font-semibold">
                  Sensitive action detected
                </p>

                <p className="mt-1 text-xs leading-5 text-amber-800">
                  ModelNow requires human approval before executing an
                  irreversible or sensitive action.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              onClick={() => setShowApprovalModal(false)}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Cancel
            </button>

            <button
              onClick={approveAction}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm text-white"
            >
              <Check size={15} />
              Approve & Continue
            </button>
          </div>
        </Modal>
      )}
    </main>
  );
}

/* =========================================================
   WINDOWS
========================================================= */

function WindowPanel({
  runAction,
}: {
  runAction: (action: string) => void;
}) {
  const windows = ["Chrome", "Excel", "CRM Portal", "VS Code"];

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Section
        title="Window Management"
        description="Open, close and switch between applications."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          {windows.map((item) => (
            <div
              key={item}
              className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
            >
              <div className="flex items-center gap-3">
                <AppWindow size={18} />

                <div>
                  <p className="text-sm font-medium">{item}</p>
                  <p className="text-xs text-emerald-600">Running</p>
                </div>
              </div>

              <button
                onClick={() => runAction(`Switch to ${item}`)}
                className="rounded-lg border px-3 py-2 text-xs"
              >
                Switch
              </button>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Window Actions">
        <div className="grid grid-cols-2 gap-2">
          {[
            "Open Application",
            "Close Application",
            "Minimize",
            "Maximize",
            "Switch Window",
            "Resize Window",
          ].map((item) => (
            <ActionButton
              key={item}
              icon={AppWindow}
              label={item}
              onClick={() => runAction(item)}
            />
          ))}
        </div>
      </Section>
    </div>
  );
}

/* =========================================================
   BROWSER
========================================================= */

function BrowserPanel({
  runAction,
}: {
  runAction: (action: string) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-3">
      <div className="xl:col-span-2">
        <Section
          title="Browser Automation"
          description="Navigate websites and interact with web applications."
        >
          <div className="mb-4 flex gap-2">
            <input
              defaultValue="https://enterprise-app.local"
              className="h-10 flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none"
            />

            <ActionButton
              icon={ExternalLink}
              label="Navigate"
              onClick={() => runAction("Navigate")}
            />
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="mb-4 flex items-center gap-2">
              <button
                onClick={() => runAction("Back")}
                className="rounded-lg border bg-white px-3 py-2 text-xs"
              >
                ←
              </button>

              <button
                onClick={() => runAction("Forward")}
                className="rounded-lg border bg-white px-3 py-2 text-xs"
              >
                →
              </button>

              <button
                onClick={() => runAction("Refresh")}
                className="rounded-lg border bg-white p-2"
              >
                <RefreshCw size={14} />
              </button>
            </div>

            <div className="rounded-xl bg-white p-8">
              <div className="mx-auto max-w-lg">
                <Search className="mb-4 text-slate-400" />

                <h4 className="text-lg font-semibold">
                  Enterprise Application
                </h4>

                <p className="mt-2 text-sm text-slate-500">
                  Browser state is available for AI observation and action.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => runAction("Submit form")}
                    className="rounded-lg bg-slate-900 px-4 py-3 text-sm text-white"
                  >
                    Submit Form
                  </button>

                  <button
                    onClick={() => runAction("Download")}
                    className="rounded-lg border px-4 py-3 text-sm"
                  >
                    Download
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Section>
      </div>

      <Section title="Browser Capabilities">
        <Capability icon={Globe} text="Open browser" />
        <Capability icon={Globe} text="Navigate websites" />
        <Capability icon={AppWindow} text="Manage tabs" />
        <Capability icon={FileText} text="Fill forms" />
        <Capability icon={Download} text="Downloads" />
        <Capability
          icon={MousePointerClick}
          text="Website interaction"
        />
      </Section>
    </div>
  );
}

/* =========================================================
   APPLICATIONS
========================================================= */

function ApplicationsPanel({
  runAction,
}: {
  runAction: (action: string) => void;
}) {
  const applications = [
    "Chrome",
    "Microsoft Excel",
    "Microsoft Word",
    "VS Code",
    "CRM",
    "ERP",
    "Finance Portal",
    "HR Portal",
  ];

  return (
    <Section
      title="Applications"
      description="Interact with desktop and business applications."
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {applications.map((app) => (
          <button
            key={app}
            onClick={() => runAction(`Open ${app}`)}
            className="rounded-xl border border-slate-200 bg-slate-50 p-5 text-left hover:bg-slate-100"
          >
            <AppWindow size={20} />

            <p className="mt-3 text-sm font-semibold">{app}</p>

            <p className="mt-1 text-xs text-slate-500">
              Open application
            </p>
          </button>
        ))}
      </div>
    </Section>
  );
}

/* =========================================================
   CLIPBOARD
========================================================= */

function ClipboardPanel({
  runAction,
}: {
  runAction: (action: string) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Section
        title="Clipboard"
        description="Read and write clipboard content."
      >
        <textarea
          defaultValue="ModelNow clipboard content"
          className="min-h-44 w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm outline-none"
        />

        <div className="mt-4 flex flex-wrap gap-2">
          <ActionButton
            icon={Clipboard}
            label="Read Clipboard"
            onClick={() => runAction("Read clipboard")}
          />

          <ActionButton
            icon={Copy}
            label="Write Clipboard"
            onClick={() => runAction("Write clipboard")}
          />

          <ActionButton
            icon={Copy}
            label="Copy"
            onClick={() => runAction("Copy")}
          />

          <ActionButton
            icon={Clipboard}
            label="Paste"
            onClick={() => runAction("Paste")}
          />
        </div>
      </Section>

      <Section title="Clipboard State">
        <InfoRow label="Status" value="Available" />
        <InfoRow label="Characters" value="32" />
        <InfoRow label="Last Updated" value="10:42:13" />
        <InfoRow label="Security" value="Protected" />
      </Section>
    </div>
  );
}

/* =========================================================
   SESSION
========================================================= */

function SessionPanel({
  addLog,
}: {
  addLog: (message: string, type?: LogType) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Section
        title="Session Management"
        description="Save and restore computer state."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <ActionButton
            icon={Save}
            label="Save Session"
            onClick={() =>
              addLog("Computer session saved", "success")
            }
          />

          <ActionButton
            icon={History}
            label="Restore Session"
            onClick={() =>
              addLog("Previous computer session restored", "success")
            }
          />

          <ActionButton
            icon={Cookie}
            label="Cookies"
            onClick={() =>
              addLog("Cookie state inspected", "info")
            }
          />

          <ActionButton
            icon={Settings}
            label="User Preferences"
            onClick={() =>
              addLog("User preferences loaded", "success")
            }
          />
        </div>
      </Section>

      <Section title="Persistent State">
        <InfoRow label="Session" value="#1284" />
        <InfoRow label="Cookies" value="Protected" />
        <InfoRow label="Local Storage" value="Available" />
        <InfoRow label="Preferences" value="Synced" />
      </Section>
    </div>
  );
}

/* =========================================================
   PERMISSIONS
========================================================= */

function PermissionsPanel({
  approvalRequired,
  setApprovalRequired,
  domainRestriction,
  setDomainRestriction,
}: {
  approvalRequired: boolean;
  setApprovalRequired: (value: boolean) => void;
  domainRestriction: boolean;
  setDomainRestriction: (value: boolean) => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Section
        title="Permissions & Security"
        description="Control what Computer Use is allowed to access."
      >
        <SettingRow
          icon={Shield}
          title="Action Approval"
          description="Require human approval for sensitive actions."
          enabled={approvalRequired}
          onChange={setApprovalRequired}
        />

        <SettingRow
          icon={Globe}
          title="Domain Restrictions"
          description="Restrict browser actions to approved domains."
          enabled={domainRestriction}
          onChange={setDomainRestriction}
        />

        <SettingRow
          icon={Lock}
          title="Application Permissions"
          description="Allow access only to approved applications."
          enabled={true}
          onChange={() => {}}
        />

        <SettingRow
          icon={FileText}
          title="File Permissions"
          description="Protect restricted enterprise files."
          enabled={true}
          onChange={() => {}}
        />
      </Section>

      <Section title="Approved Access">
        <InfoRow label="Applications" value="12 approved" />
        <InfoRow label="Domains" value="8 approved" />
        <InfoRow label="File Locations" value="5 approved" />
        <InfoRow label="Risk Level" value="Low" />
      </Section>
    </div>
  );
}

/* =========================================================
   SAFETY
========================================================= */

function SafetyPanel({
  paymentProtection,
  setPaymentProtection,
  sensitiveActionProtection,
  setSensitiveActionProtection,
  requestApproval,
}: {
  paymentProtection: boolean;
  setPaymentProtection: (value: boolean) => void;
  sensitiveActionProtection: boolean;
  setSensitiveActionProtection: (value: boolean) => void;
  requestApproval: () => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Section
        title="Safety Controls"
        description="Protect users from risky computer actions."
      >
        <SettingRow
          icon={AlertTriangle}
          title="Risk Detection"
          description="Identify potentially dangerous actions."
          enabled={true}
          onChange={() => {}}
        />

        <SettingRow
          icon={Shield}
          title="Sensitive Action Detection"
          description="Detect actions involving sensitive information."
          enabled={sensitiveActionProtection}
          onChange={setSensitiveActionProtection}
        />

        <SettingRow
          icon={CreditCard}
          title="Payment Protection"
          description="Block payment actions without confirmation."
          enabled={paymentProtection}
          onChange={setPaymentProtection}
        />

        <SettingRow
          icon={CheckCircle2}
          title="Confirmation Required"
          description="Require human confirmation before irreversible actions."
          enabled={true}
          onChange={() => {}}
        />
      </Section>

      <Section
        title="Emergency Controls"
        description="Immediately stop computer execution."
      >
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="flex gap-3">
            <CircleStop className="text-red-600" />

            <div>
              <p className="font-semibold text-red-800">
                Emergency Stop
              </p>

              <p className="mt-1 text-xs leading-5 text-red-700">
                Immediately stop all computer actions and prevent further
                execution.
              </p>

              <button
                onClick={requestApproval}
                className="mt-4 flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white"
              >
                <CircleStop size={15} />
                Emergency Stop
              </button>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}

/* =========================================================
   EXECUTION
========================================================= */

function ExecutionPanel({
  actions,
  logs,
  retry,
}: {
  actions: ActionItem[];
  logs: LogItem[];
  retry: () => void;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <Section
        title="Task Execution"
        description="Current and previous computer actions."
      >
        <div className="space-y-2">
          {actions.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 p-4"
            >
              <div>
                <p className="text-sm font-medium">{item.action}</p>

                <p className="mt-1 text-xs text-slate-400">
                  {item.time}
                </p>
              </div>

              <StatusBadge status={item.status} />
            </div>
          ))}
        </div>

        <button
          onClick={retry}
          className="mt-4 flex items-center gap-2 rounded-lg border px-4 py-2 text-sm"
        >
          <RotateCw size={15} />
          Retry Last Action
        </button>
      </Section>

      <Section
        title="Action History & Audit Logs"
        description="Every computer action is recorded."
      >
        <div className="max-h-80 space-y-2 overflow-auto">
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3"
            >
              <LogIcon type={log.type} />

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium">{log.message}</p>

                <p className="mt-1 text-[11px] text-slate-400">
                  {log.time}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}

/* =========================================================
   LOCAL UI HELPERS
========================================================= */

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 py-3 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function Capability({
  icon: Icon,
  text,
}: {
  icon: any;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3 border-b border-slate-100 py-3 last:border-0">
      <Icon size={16} className="text-slate-500" />
      <span className="text-sm">{text}</span>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  title,
  description,
  enabled,
  onChange,
}: {
  icon: any;
  title: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-4 last:border-0">
      <div className="flex gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
          <Icon size={17} />
        </div>

        <div>
          <p className="text-sm font-medium">{title}</p>

          <p className="mt-1 max-w-md text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>

      <Toggle enabled={enabled} onChange={onChange} />
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: ActionItem["status"];
}) {
  const styles = {
    Completed: "bg-emerald-50 text-emerald-700",
    Running: "bg-blue-50 text-blue-700",
    Waiting: "bg-amber-50 text-amber-700",
    Failed: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}

function LogIcon({
  type,
}: {
  type: LogType;
}) {
  if (type === "success") {
    return (
      <CheckCircle2
        size={16}
        className="mt-0.5 shrink-0 text-emerald-600"
      />
    );
  }

  if (type === "warning") {
    return (
      <AlertTriangle
        size={16}
        className="mt-0.5 shrink-0 text-amber-600"
      />
    );
  }

  if (type === "error") {
    return (
      <AlertTriangle
        size={16}
        className="mt-0.5 shrink-0 text-red-600"
      />
    );
  }

  return (
    <Activity
      size={16}
      className="mt-0.5 shrink-0 text-slate-500"
    />
  );
}