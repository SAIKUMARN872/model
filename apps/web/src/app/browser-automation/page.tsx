"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  ArrowLeft,
  ArrowUp,
  Camera,
  Clock3,
  Download,
  ExternalLink,
  FileText,
  FileUp,
  Globe,
  Image as ImageIcon,
  Mic,
  MousePointer2,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  Square,
  Terminal,
  Upload,
  UserCheck,
  X,
} from "lucide-react";

import ActivityLog, {
  type ActivityItem,
} from "../../components/browser_automation/ActivityLog";

import ApprovalPanel from "../../components/browser_automation/ApprovalPanel";
import PaymentPanel from "../../components/browser_automation/PaymentPanel";
import ReceiptPanel from "../../components/browser_automation/ReceiptPanel";
import VerificationPanel from "../../components/browser_automation/VerificationPanel";
import ReminderPanel from "../../components/browser_automation/ReminderPanel";

import BrowserActionStream from "../../components/browser_automation/BrowserActionStream";
import BrowserPreview from "../../components/browser_automation/BrowserPreview";

import RunHistory, {
  saveRunToHistory,
} from "../../components/browser_automation/RunHistory";

import TaskResultPanel from "../../components/browser_automation/TaskResultPanel";

import WorkflowTimeline, {
  type WorkflowStep,
} from "../../components/browser_automation/WorkflowTimeline";

import {
  advanceBrowserAutomationMockTask,
  approveBrowserAutomationMockTask,
  cancelBrowserAutomationMockTask,
  createBrowserAutomationMockTask,
  pauseBrowserAutomationMockTask,
  resumeBrowserAutomationMockTask,
  retryBrowserAutomationMockTask,
  stopBrowserAutomationMockTask,
  type BrowserMockStepStatus,
  type BrowserMockTask,
} from "../../services/browserAutomationMock";

const MAX_TASK_LENGTH = 2000;

const connectors = [
  {
    name: "E-commerce",
    description: "Shopping and product workflows",
  },
  {
    name: "Food",
    description: "Restaurant and food ordering",
  },
  {
    name: "Travel",
    description: "Flights and hotel research",
  },
  {
    name: "Movie Booking",
    description: "Movie and seat selection",
  },
  {
    name: "Payment",
    description: "Payment-ready workflows",
  },
  {
    name: "Email",
    description: "Email-based actions",
  },
  {
    name: "Calendar",
    description: "Calendar scheduling",
  },
  {
    name: "WhatsApp",
    description: "Messaging workflows",
  },
  {
    name: "Slack",
    description: "Team communication",
  },
  {
    name: "Storage",
    description: "Cloud file operations",
  },
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

const exampleTasks = [
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
];

function mapStepStatus(
  status: BrowserMockStepStatus,
): WorkflowStep["status"] {
  switch (status) {
    case "completed":
      return "completed";
    case "running":
      return "running";
    case "approval_required":
      return "approval_required";
    case "failed":
      return "failed";
    default:
      return "pending";
  }
}

function getRunningActivity(stepId: number) {
  switch (stepId) {
    case 1:
      return "Analyzing user intent";
    case 2:
      return "Creating execution plan";
    case 3:
      return "Discovering relevant websites";
    case 4:
      return "Interacting with browser";
    case 5:
      return "Searching for requested information";
    case 6:
      return "Comparing available options";
    case 7:
      return "Preparing requested action";
    case 8:
      return "Waiting for user approval";
    case 9:
      return "Verifying completed action";
    default:
      return "Working on task";
  }
}

function getCompletedActivity(stepId: number) {
  switch (stepId) {
    case 1:
      return "Intent analyzed";
    case 2:
      return "Execution plan created";
    case 3:
      return "Relevant website discovered";
    case 4:
      return "Browser interaction completed";
    case 5:
      return "Search completed";
    case 6:
      return "Options reviewed";
    case 7:
      return "Action prepared";
    case 8:
      return "Action approved";
    case 9:
      return "Result verified";
    default:
      return "Step completed";
  }
}

export default function BrowserAutomationPage() {
  const [task, setTask] = useState("");
  const [showPlan, setShowPlan] = useState(false);
  const [selectedConnector, setSelectedConnector] = useState<string | null>(null);
  const [showConnectors, setShowConnectors] = useState(false);
  const [mockTask, setMockTask] = useState<BrowserMockTask | null>(null);

  // Workflow State అంతా పేజీ లోపలే నేరుగా నిర్వహిస్తున్నాం (No external workflow imports)
  const [approvalCompleted, setApprovalCompleted] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [verificationStarted, setVerificationStarted] = useState(false);
  const [verificationCompleted, setVerificationCompleted] = useState(false);
  const [reminderCompleted, setReminderCompleted] = useState(false);
  const [historySaved, setHistorySaved] = useState(false);

  const savedRunIdRef = useRef<string | null>(null);

  const isRunning = mockTask?.status === "running";
  const isPaused = mockTask?.status === "paused";
  const approvalRequired = mockTask?.status === "approval_required";
  const approvalConfirmed = mockTask?.status === "approved";

  const paymentUnlocked = approvalCompleted && (approvalConfirmed || true);

  const taskCompleted = mockTask?.status === "completed";
  const taskFailed = mockTask?.status === "failed";
  const taskCancelled = mockTask?.status === "cancelled";

  const workflowCompleted =
    verificationCompleted || taskCompleted;

  const finalWorkflowCompleted =
    workflowCompleted && reminderCompleted && historySaved;

  const currentStep = mockTask?.currentStep ?? 0;
  const executionTime = mockTask?.executionTime ?? 0;

  const executionActive = Boolean(
    mockTask &&
      !finalWorkflowCompleted &&
      !taskFailed &&
      !taskCancelled,
  );

  const selectedConnectorData = useMemo(
    () => connectors.find((connector) => connector.name === selectedConnector),
    [selectedConnector],
  );

  const steps: WorkflowStep[] = useMemo(() => {
    if (!mockTask) return [];

    return mockTask.steps.map((step) => ({
      id: String(step.id),
      title: step.title,
      description: step.description,
      status: mapStepStatus(step.status),
    }));
  }, [mockTask]);

  const activityItems: ActivityItem[] = useMemo(() => {
    const items: ActivityItem[] = [];

    if (task.trim()) {
      items.push({
        id: "task-received",
        message: "Task received",
        detail: task.trim(),
        status: "completed",
      });
    }

    if (!mockTask) return items;

    mockTask.steps.forEach((step) => {
      if (step.status === "completed") {
        items.push({
          id: `${step.id}-completed`,
          message: getCompletedActivity(step.id),
          detail: step.description,
          status: "completed",
        });
      } else if (step.status === "running") {
        items.push({
          id: `${step.id}-running`,
          message: getRunningActivity(step.id),
          detail: step.description,
          status: "running",
        });
      } else if (step.status === "approval_required") {
        items.push({
          id: `${step.id}-approval`,
          message: "Waiting for approval",
          detail: "The requested action is ready and requires your confirmation.",
          status: "approval",
        });
      } else if (step.status === "failed") {
        items.push({
          id: `${step.id}-failed`,
          message: "Browser automation failed",
          detail: mockTask.failure?.message ?? "The workflow could not continue.",
          status: "failed",
        });
      }
    });

    if (approvalCompleted) {
      items.push({
        id: "approval-confirmed",
        message: "Approval confirmed",
        detail: "The user approved the sensitive action. Payment is now available.",
        status: "completed",
      });
    }

    if (paymentCompleted) {
      items.push({
        id: "payment-completed",
        message: "Payment completed",
        detail: transactionId
          ? `Payment completed successfully. Transaction reference: ${transactionId}`
          : "The payment demo completed successfully.",
        status: "completed",
      });
    }

    if (verificationStarted) {
      items.push({
        id: "verification-started",
        message: "Payment verification started",
        detail: transactionId
          ? `Checking transaction ${transactionId}.`
          : "Checking the completed payment transaction.",
        status: verificationCompleted ? "completed" : "running",
      });
    }

    if (verificationCompleted) {
      items.push({
        id: "verification-completed",
        message: "Payment verified",
        detail: "The transaction passed verification successfully.",
        status: "completed",
      });
    }

    if (workflowCompleted) {
      items.push({
        id: "task-completed",
        message: "Completed result ready",
        detail: "ModelNow verified the payment workflow and completed the requested task successfully.",
        status: "completed",
      });
    }

    if (reminderCompleted) {
      items.push({
        id: "reminder-completed",
        message: "Reminder scheduled",
        detail: "The follow-up reminder was scheduled successfully.",
        status: "completed",
      });
    }

    if (historySaved) {
      items.push({
        id: "history-saved",
        message: "Final activity recorded",
        detail: "The completed workflow has been added to Run History.",
        status: "completed",
      });
    }

    return items;
  }, [
    mockTask,
    task,
    approvalCompleted,
    paymentCompleted,
    transactionId,
    verificationStarted,
    verificationCompleted,
    workflowCompleted,
    reminderCompleted,
    historySaved,
  ]);

  const resetExecution = useCallback(() => {
    savedRunIdRef.current = null;
    setMockTask(null);
    setApprovalCompleted(false);
    setPaymentCompleted(false);
    setTransactionId(null);
    setVerificationStarted(false);
    setVerificationCompleted(false);
    setReminderCompleted(false);
    setHistorySaved(false);
  }, []);

  const generatePlan = useCallback(() => {
    if (!task.trim() || executionActive) return;
    resetExecution();
    setShowPlan(true);
  }, [executionActive, resetExecution, task]);

  const startExecution = useCallback(() => {
    if (!task.trim() || mockTask) return;

    const createdTask = createBrowserAutomationMockTask({
      task: task.trim(),
      connector: selectedConnector,
    });

    savedRunIdRef.current = null;
    resetExecution();
    setMockTask(createdTask);
    setShowPlan(true);
  }, [mockTask, resetExecution, selectedConnector, task]);

  const pauseExecution = useCallback(() => {
    if (!mockTask) return;
    const updatedTask = pauseBrowserAutomationMockTask(mockTask.id);
    if (updatedTask) setMockTask(updatedTask);
  }, [mockTask]);

  const resumeExecution = useCallback(() => {
    if (!mockTask) return;
    const updatedTask = resumeBrowserAutomationMockTask(mockTask.id);
    if (updatedTask) setMockTask(updatedTask);
  }, [mockTask]);

  const stopExecution = useCallback(() => {
    if (!mockTask) return;
    const updatedTask = stopBrowserAutomationMockTask(mockTask.id);
    if (updatedTask) setMockTask(updatedTask);
  }, [mockTask]);

  const retryExecution = useCallback(() => {
    if (!mockTask) return;
    const retriedTask = retryBrowserAutomationMockTask(mockTask.id);
    if (retriedTask) {
      resetExecution();
      setMockTask(retriedTask);
    }
  }, [mockTask, resetExecution]);

  // Approval పని చేసేలా లాజిక్
  const approveAction = useCallback(() => {
    if (!mockTask) return;
    const updatedTask = approveBrowserAutomationMockTask(mockTask.id);
    if (updatedTask) {
      setMockTask(updatedTask);
    }
    setApprovalCompleted(true);
  }, [mockTask]);

  const cancelApproval = useCallback(() => {
    if (!mockTask) return;
    const updatedTask = cancelBrowserAutomationMockTask(mockTask.id);
    if (updatedTask) setMockTask(updatedTask);
  }, [mockTask]);

  // Payment పూర్తయినప్పుడు
  const handlePaymentComplete = useCallback((reference: string, method?: string) => {
    setPaymentCompleted(true);
    setTransactionId(reference);
    if (method) setPaymentMethod(method);
  }, []);

  // Receipt ప్యానెల్ లో Continue క్లిక్ చేసినప్పుడు Verification మొదలవుతుంది
  const startVerification = useCallback(() => {
    if (!transactionId) return;
    setVerificationStarted(true);
  }, [transactionId]);

  // Verification పూర్తయినప్పుడు
  const completeWorkflow = useCallback(() => {
    if (!mockTask) return;
    const completedTask: BrowserMockTask = {
      ...mockTask,
      status: "completed",
      currentStep: mockTask.steps.length - 1,
      message: "Payment verified and workflow completed successfully.",
      steps: mockTask.steps.map((step) => ({
        ...step,
        status: "completed",
      })),
    };
    setMockTask(completedTask);
    setVerificationCompleted(true);
  }, [mockTask]);

  const toggleConnector = useCallback(
    (connectorName: string) => {
      if (executionActive) return;
      setSelectedConnector((current) =>
        current === connectorName ? null : connectorName,
      );
    },
    [executionActive],
  );

  const runAnotherTask = useCallback(() => {
    resetExecution();
    setTask("");
    setShowPlan(false);
    setSelectedConnector(null);
  }, [resetExecution]);

  const useExample = useCallback(
    (value: string) => {
      resetExecution();
      setTask(value);
      setShowPlan(false);
      setSelectedConnector(null);
    },
    [resetExecution],
  );

  const handleLoadTask = useCallback(
    (historyTask: string) => {
      resetExecution();
      setTask(historyTask);
      setShowPlan(false);
      setSelectedConnector(null);
    },
    [resetExecution],
  );

  // Mock Task Runner
  useEffect(() => {
    if (!mockTask || mockTask.status !== "running") return;

    const timer = window.setTimeout(() => {
      const updatedTask = advanceBrowserAutomationMockTask(mockTask.id);
      if (updatedTask) {
        setMockTask(updatedTask);
      }
    }, 1400);

    return () => {
      window.clearTimeout(timer);
    };
  }, [mockTask]);

  // Run History లో సేవ్ చేయడం
  useEffect(() => {
    if (!mockTask) return;

    const isCompletedRun = mockTask.status === "completed" || verificationCompleted;
    const isOtherTerminalRun =
      mockTask.status === "cancelled" || mockTask.status === "failed";

    if (isCompletedRun && !reminderCompleted) return;
    if (!isCompletedRun && !isOtherTerminalRun) return;
    if (savedRunIdRef.current === mockTask.id) return;

    const parsedCreatedAt = Date.parse(mockTask.createdAt);

    saveRunToHistory({
      id: mockTask.id,
      task: mockTask.task,
      status:
        mockTask.status === "completed" || verificationCompleted
          ? "completed"
          : mockTask.status === "cancelled"
            ? "cancelled"
            : "failed",
      executionTime: mockTask.executionTime,
      createdAt: Number.isNaN(parsedCreatedAt) ? Date.now() : parsedCreatedAt,
      summary:
        mockTask.failure?.message ??
        mockTask.result?.summary ??
        mockTask.message,
    });

    savedRunIdRef.current = mockTask.id;
    setHistorySaved(true);
  }, [mockTask, reminderCompleted, verificationCompleted]);

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex min-h-16 max-w-[1500px] flex-col gap-3 px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4 sm:py-2 lg:px-6">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <a
              href="/chat"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
              aria-label="Back to chat"
            >
              <ArrowLeft size={18} />
            </a>

            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Globe size={19} />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-base font-semibold sm:text-lg">
                  Browser Automation
                </h1>
                <p className="truncate text-[11px] text-slate-500 sm:text-xs">
                  ModelNow intelligent web execution
                </p>
              </div>
            </div>
          </div>

          <div className="flex w-full items-center justify-center sm:w-auto sm:justify-end">
            <div className="flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Automation Ready
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto grid w-full max-w-[1500px] grid-cols-1 gap-4 px-3 py-4 sm:gap-5 sm:px-4 sm:py-5 lg:grid-cols-[minmax(0,1fr)_370px] lg:gap-6 lg:px-6 lg:py-6">
        <section className="space-y-6">
          {/* Task Input - ModelNow Chat Style */}
          <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                if (task.trim() && !executionActive) {
                  generatePlan();
                }
              }}
            >
              <textarea
                value={task}
                maxLength={MAX_TASK_LENGTH}
                disabled={executionActive}
                onChange={(event) => setTask(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    if (task.trim() && !executionActive) {
                      generatePlan();
                    }
                  }
                }}
                placeholder="Message ModelNow… Describe what you want to do on the web."
                aria-label="Message ModelNow"
                rows={3}
                className="w-full resize-none border-0 bg-transparent px-2 py-2 text-sm leading-6 outline-none placeholder:text-slate-400 focus:ring-0 disabled:cursor-not-allowed"
              />

              <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
                <div className="relative flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    disabled={executionActive}
                    onClick={() => {
                      const menu = document.getElementById("browser-automation-plus-menu");
                      menu?.classList.toggle("hidden");
                    }}
                    aria-label="Open attachment menu"
                    title="Add attachment or search"
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                  >
                    <Plus size={18} />
                  </button>

                  <div
                    id="browser-automation-plus-menu"
                    className="hidden absolute bottom-12 left-0 z-50 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        document.getElementById("browser-automation-plus-menu")?.classList.add("hidden");
                        document.getElementById("browser-camera-input")?.click();
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100"
                    >
                      <Camera size={17} /> Camera
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        document.getElementById("browser-automation-plus-menu")?.classList.add("hidden");
                        document.getElementById("browser-photo-input")?.click();
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100"
                    >
                      <ImageIcon size={17} /> Photos
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        document.getElementById("browser-automation-plus-menu")?.classList.add("hidden");
                        document.getElementById("browser-document-input")?.click();
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100"
                    >
                      <FileText size={17} /> PDF / Document
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTask((current) => `${current}${current ? "\n" : ""}Search the web for: `);
                        document.getElementById("browser-automation-plus-menu")?.classList.add("hidden");
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100"
                    >
                      <Search size={17} /> Web Search
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setTask((current) => `${current}${current ? "\n" : ""}Perform deep research on: `);
                        document.getElementById("browser-automation-plus-menu")?.classList.add("hidden");
                      }}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm hover:bg-slate-100"
                    >
                      <Sparkles size={17} /> Deep Search
                    </button>
                  </div>

                  <input
                    id="browser-camera-input"
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        setTask((current) => `${current}${current ? "\n" : ""}Attached image: ${file.name}`);
                      }
                      event.currentTarget.value = "";
                    }}
                  />

                  <input
                    id="browser-photo-input"
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      const files = Array.from(event.target.files ?? []);
                      if (files.length) {
                        setTask((current) =>
                          `${current}${current ? "\n" : ""}Attached photos: ${files.map((file) => file.name).join(", ")}`
                        );
                      }
                      event.currentTarget.value = "";
                    }}
                  />

                  <input
                    id="browser-document-input"
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.ppt,.pptx"
                    multiple
                    className="hidden"
                    onChange={(event) => {
                      const files = Array.from(event.target.files ?? []);
                      if (files.length) {
                        setTask((current) =>
                          `${current}${current ? "\n" : ""}Attached documents: ${files.map((file) => file.name).join(", ")}`
                        );
                      }
                      event.currentTarget.value = "";
                    }}
                  />

                  <span className="hidden text-xs text-slate-400 sm:inline">
                    Enter to send · Shift + Enter for a new line
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-slate-400">
                    {task.length}/{MAX_TASK_LENGTH}
                  </span>

                  <button
                    type="button"
                    disabled={executionActive}
                    onClick={() => {
                      const SpeechRecognitionAPI =
                        (window as any).SpeechRecognition ||
                        (window as any).webkitSpeechRecognition;

                      if (!SpeechRecognitionAPI) {
                        alert("Voice input is not supported in this browser.");
                        return;
                      }

                      const recognition = new SpeechRecognitionAPI();
                      recognition.lang = "en-US";
                      recognition.interimResults = false;
                      recognition.onresult = (event: any) => {
                        const transcript = event.results?.[0]?.[0]?.transcript;
                        if (transcript) {
                          setTask((current) =>
                            `${current}${current ? " " : ""}${transcript}`
                          );
                        }
                      };
                      recognition.start();
                    }}
                    aria-label="Use microphone"
                    title="Voice input"
                    className="flex h-9 w-9 items-center justify-center rounded-full text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                  >
                    <Mic size={18} />
                  </button>

                  <button
                    type="submit"
                    disabled={!task.trim() || executionActive}
                    aria-label="Generate execution plan"
                    title="Send message"
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    <ArrowUp size={18} />
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Execution Plan View (13 steps Progress bar పూర్తిగా తీసేశాము) */}
          {showPlan && (
            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-semibold text-slate-900">
                      AI Execution Plan
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      ModelNow converted your request into an executable browser workflow.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {!mockTask && (
                      <button
                        type="button"
                        onClick={startExecution}
                        disabled={!task.trim()}
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:opacity-40"
                      >
                        <Play size={15} />
                        Start
                      </button>
                    )}

                    {isRunning && (
                      <>
                        <button
                          type="button"
                          onClick={pauseExecution}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm"
                        >
                          <Pause size={15} />
                          Pause
                        </button>
                        <button
                          type="button"
                          onClick={stopExecution}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600"
                        >
                          <Square size={14} />
                          Stop
                        </button>
                      </>
                    )}

                    {isPaused && (
                      <>
                        <button
                          type="button"
                          onClick={resumeExecution}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white"
                        >
                          <Play size={15} />
                          Resume
                        </button>
                        <button
                          type="button"
                          onClick={stopExecution}
                          className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm text-red-600"
                        >
                          <Square size={14} />
                          Stop
                        </button>
                      </>
                    )}

                    {finalWorkflowCompleted && (
                      <button
                        type="button"
                        onClick={runAnotherTask}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm"
                      >
                        <RotateCcw size={15} />
                        Run Another
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {mockTask && (
                <>
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
                    <WorkflowTimeline steps={steps} />

                    <div className="space-y-4">
                      <BrowserPreview
                        currentStep={Math.min(currentStep, 8)}
                        isRunning={Boolean(isRunning)}
                        isPaused={Boolean(isPaused)}
                        task={task}
                      />

                      <BrowserActionStream
                        task={task}
                        currentStep={currentStep}
                        isRunning={Boolean(isRunning)}
                        isPaused={Boolean(isPaused)}
                        approvalRequired={Boolean(approvalRequired && !approvalCompleted)}
                        isCompleted={workflowCompleted}
                        isFailed={taskFailed}
                        failureMessage={mockTask.failure?.message}
                      />

                      <ActivityLog items={activityItems} />
                    </div>
                  </div>

                  {/* Step 6: Approval Panel */}
                  {approvalRequired && !approvalCompleted && (
                    <ApprovalPanel
                      onApprove={approveAction}
                      onCancel={cancelApproval}
                    />
                  )}

                  {/* Step 7 -> Step 8: Payment Panel */}
                  {paymentUnlocked && (
                    <div className="space-y-4">
                      {!paymentCompleted && (
                        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm sm:p-5">
                          <div className="flex items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                              <ShieldCheck size={19} />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="text-sm font-semibold text-emerald-900">
                                Approval confirmed
                              </h3>

                              <p className="mt-1 text-xs text-emerald-700">
                                Your approval was successfully received.
                              </p>

                              <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-4">
                                <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-500">
                                  Next step
                                </p>

                                <p className="mt-1 text-sm font-semibold text-slate-800">
                                  Payment
                                </p>

                                <p className="mt-1 text-xs leading-5 text-slate-500">
                                  Payment options are now available. Choose Google Pay, PhonePe, Paytm, or Card.
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Step 8: Payment Options */}
                      {!paymentCompleted && (
                        <PaymentPanel
                          onPaymentComplete={(reference) => {
                            handlePaymentComplete(reference, "UPI");
                          }}
                        />
                      )}

                      {/* Step 9: Receipt Panel */}
                      {paymentCompleted &&
                        !verificationStarted &&
                        !verificationCompleted && (
                          <ReceiptPanel
                            transactionId={transactionId || "TXN-DEFAULT"}
                            amount={499}
                            paymentMethod={paymentMethod}
                            onContinue={startVerification}
                          />
                        )}

                      {/* Step 10: Verification Panel */}
                      {paymentCompleted &&
                        verificationStarted &&
                        !verificationCompleted && (
                          <VerificationPanel
                            key={transactionId}
                            transactionId={transactionId}
                            onVerified={completeWorkflow}
                          />
                        )}

                      {/* Step 11: Task Result & Completed View */}
                      {verificationCompleted && (
                        <>
                          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm sm:p-5">
                            <div className="flex items-start gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                                <ShieldCheck size={19} />
                              </div>

                              <div className="min-w-0 flex-1">
                                <h3 className="text-sm font-semibold text-emerald-900">
                                  Verification completed
                                </h3>

                                <p className="mt-1 text-xs text-emerald-700">
                                  The payment transaction was verified successfully.
                                </p>

                                <div className="mt-4 rounded-xl border border-emerald-200 bg-white p-4">
                                  <p className="text-[10px] font-semibold uppercase tracking-wide text-emerald-500">
                                    Transaction
                                  </p>

                                  <p className="mt-1 break-all text-sm font-semibold text-slate-900">
                                    {transactionId}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <TaskResultPanel
                            task={task}
                            executionTime={executionTime}
                            onRunAnother={runAnotherTask}
                          />

                          {/* Step 12: Reminder Panel */}
                          {!reminderCompleted && (
                            <ReminderPanel
                              transactionId={transactionId}
                              onReminderComplete={() => {
                                setReminderCompleted(true);
                              }}
                            />
                          )}
                        </>
                      )}
                    </div>
                  )}

                  {/* Failure Banner */}
                  {taskFailed && (
                    <div className="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-100 text-red-600">
                          <X size={16} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-red-800">
                            Automation failed
                          </h3>

                          <p className="mt-1 text-xs text-red-700">
                            {mockTask.failure?.message ??
                              "The browser automation could not be completed."}
                          </p>

                          <div className="mt-4 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={retryExecution}
                              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white"
                            >
                              <RotateCcw size={14} />
                              Retry task
                            </button>

                            <button
                              type="button"
                              onClick={runAnotherTask}
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700"
                            >
                              New task
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cancelled Banner */}
                  {taskCancelled && (
                    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-200 text-slate-600">
                        <Square size={16} />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Automation run cancelled
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          This run was stopped before the workflow completed.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              {!mockTask && (
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm sm:p-8">
                  <Sparkles size={26} className="mx-auto text-slate-400" />
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    Execution plan ready
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Start the task to begin browser execution.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Run History */}
          <RunHistory maxItems={10} onLoadTask={handleLoadTask} />

          {/* Browser Runtime */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
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
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm">
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
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-sm font-semibold">Connectors</h2>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">
                    {connectors.length} available
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  Select a connector to guide the browser automation workflow.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowConnectors((value) => !value)}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold"
              >
                {showConnectors ? "Show less" : "View all"}
              </button>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(showConnectors ? connectors : connectors.slice(0, 6)).map(
                (connector) => {
                  const isSelected = selectedConnector === connector.name;

                  return (
                    <button
                      key={connector.name}
                      type="button"
                      disabled={executionActive}
                      onClick={() => toggleConnector(connector.name)}
                      className={`rounded-xl border p-4 text-left transition ${
                        isSelected
                          ? "border-blue-300 bg-blue-50"
                          : "border-slate-200 bg-white"
                      } disabled:cursor-not-allowed disabled:opacity-60`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                          <Globe size={17} />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold">{connector.name}</p>
                          <p className="mt-1 text-[11px] leading-5 text-slate-500">
                            {connector.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          </div>

          {/* Example Tasks */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Example tasks</h2>
              <span className="text-xs text-slate-400">Try a scenario</span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {exampleTasks.map((example) => {
                const Icon = example.icon;

                return (
                  <button
                    key={example.title}
                    type="button"
                    disabled={executionActive}
                    onClick={() => useExample(example.text)}
                    className="rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Icon size={16} className="text-blue-600" />
                      {example.title}
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{example.text}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Sidebar */}
        <aside className="space-y-5">
          {/* ModelNow Intelligence */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Sparkles size={19} />
              </div>
              <div>
                <h2 className="text-sm font-semibold">ModelNow Intelligence</h2>
                <p className="text-xs text-slate-500">Automation runtime</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                ["Planning Engine", "Ready", "text-emerald-600"],
                ["Browser Engine", "Ready", "text-emerald-600"],
                ["Safety Layer", "Active", "text-emerald-600"],
                ["Human Confirmation", "Enabled", "text-blue-600"],
              ].map(([label, status, color]) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">{label}</span>
                  <span className={`text-xs font-semibold ${color}`}>{status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Current Task */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Terminal size={17} className="text-slate-600" />
              <h2 className="text-sm font-semibold">Current Task</h2>
            </div>

            {task ? (
              <p className="break-words rounded-xl bg-slate-50 p-4 text-xs text-slate-600">
                {task}
              </p>
            ) : (
              <p className="text-xs text-slate-400">
                No automation task has been created yet.
              </p>
            )}

            {selectedConnectorData && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2.5">
                <Globe size={14} className="text-blue-600" />
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-500">
                    Connector
                  </p>
                  <p className="text-xs font-semibold text-blue-800">
                    {selectedConnectorData.name}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Browser Session */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <Globe size={17} className="text-blue-600" />
              <h2 className="text-sm font-semibold">Browser Session</h2>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-xs text-slate-500">Browser</span>
                <span className="text-xs font-semibold text-emerald-600">Ready</span>
              </div>
              <div className="flex justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-xs text-slate-500">Session</span>
                <span className="text-xs font-semibold">Persistent</span>
              </div>
              <div className="flex justify-between rounded-lg bg-slate-50 p-3">
                <span className="text-xs text-slate-500">Downloads</span>
                <span className="text-xs font-semibold">Enabled</span>
              </div>
            </div>
          </div>

          {/* File Operations */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 flex items-center gap-2">
              <FileUp size={17} className="text-slate-600" />
              <h2 className="text-sm font-semibold">File Operations</h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-3">
                <Upload size={16} className="text-slate-500" />
                <p className="mt-2 text-xs font-semibold">Uploads</p>
                <p className="mt-1 text-[11px] text-slate-500">Supported</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-3">
                <Download size={16} className="text-slate-500" />
                <p className="mt-2 text-xs font-semibold">Downloads</p>
                <p className="mt-1 text-[11px] text-slate-500">Supported</p>
              </div>
            </div>
          </div>

          {/* Safety & Control */}
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 sm:p-6">
            <div className="flex gap-3">
              <ShieldCheck size={20} className="shrink-0 text-amber-600" />
              <div>
                <h2 className="text-sm font-semibold text-amber-900">
                  Safety & Control
                </h2>
                <p className="mt-2 text-xs text-amber-800">
                  Irreversible actions such as purchases, bookings, and form submissions require human confirmation.
                </p>
              </div>
            </div>
          </div>

          {/* Execution Stats */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <h2 className="mb-4 text-sm font-semibold">Execution Stats</h2>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-50 p-4">
                <Clock3 size={16} className="text-slate-500" />
                <p className="mt-2 text-lg font-bold">{executionTime}ms</p>
                <p className="text-[11px] text-slate-500">Execution time</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4">
                <UserCheck size={16} className="text-slate-500" />
                <p className="mt-2 text-lg font-bold">
                  {approvalCompleted ? 1 : 0}
                </p>
                <p className="text-[11px] text-slate-500">Approvals</p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}