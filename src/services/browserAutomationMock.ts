export type BrowserMockStatus =
  | "idle"
  | "running"
  | "paused"
  | "approval_required"
  | "approved"
  | "completed"
  | "cancelled"
  | "failed";

export type BrowserMockStepStatus =
  | "pending"
  | "running"
  | "completed"
  | "approval_required"
  | "failed";

export type BrowserMockFailure = {
  stepId: number;
  message: string;
};

export type BrowserMockStep = {
  id: number;
  title: string;
  description: string;
  status: BrowserMockStepStatus;
};

export type BrowserMockTaskResult = {
  title: string;
  summary: string;
  details: string[];
};

export type BrowserMockTask = {
  id: string;
  task: string;
  connector?: string | null;
  status: BrowserMockStatus;
  retryCount: number;
  currentStep: number;
  executionTime: number;
  approvalRequired: boolean;
  message: string;
  createdAt: string;
  steps: BrowserMockStep[];
  failure?: BrowserMockFailure;
  result?: BrowserMockTaskResult;
};

export type CreateBrowserMockTaskPayload = {
  task: string;
  connector?: string | null;
};

const MAX_RETRIES = 3;

const tasks = new Map<
  string,
  BrowserMockTask
>();

const STEP_TEMPLATES: Array<
  Omit<BrowserMockStep, "status">
> = [
  {
    id: 1,
    title: "Understand user request",
    description:
      "Analyze the task, intent, constraints and preferences.",
  },
  {
    id: 2,
    title: "Create execution plan",
    description:
      "Convert the request into safe, executable browser actions.",
  },
  {
    id: 3,
    title: "Open required website",
    description:
      "Navigate to the appropriate website or web application.",
  },
  {
    id: 4,
    title: "Discover relevant content",
    description:
      "Inspect the page and identify useful navigation targets.",
  },
  {
    id: 5,
    title: "Find required information",
    description:
      "Search and identify the requested product, service or page.",
  },
  {
    id: 6,
    title: "Select the best option",
    description:
      "Compare available options against the task requirements.",
  },
  {
    id: 7,
    title: "Prepare the action",
    description:
      "Fill forms, select options and prepare the requested action.",
  },
  {
    id: 8,
    title: "Request user confirmation",
    description:
      "Pause before any irreversible action and request approval.",
  },
  {
    id: 9,
    title: "Verify completion",
    description:
      "Confirm the requested workflow completed successfully.",
  },
];

function cloneTask(
  task: BrowserMockTask,
): BrowserMockTask {
  return {
    ...task,

    steps: task.steps.map((step) => ({
      ...step,
    })),

    failure: task.failure
      ? {
          ...task.failure,
        }
      : undefined,

    result: task.result
      ? {
          ...task.result,
          details: [
            ...task.result.details,
          ],
        }
      : undefined,
  };
}

function createSteps(): BrowserMockStep[] {
  return STEP_TEMPLATES.map((step) => ({
    ...step,
    status: "pending",
  }));
}

function generateTaskId(): string {
  return `mock-browser-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function buildResult(
  task: BrowserMockTask,
): BrowserMockTaskResult {
  const lower = task.task.toLowerCase();

  let title = "Browser task completed";

  let summary =
    "The requested browser workflow was completed successfully.";

  if (
    lower.includes("movie") ||
    lower.includes("booking")
  ) {
    title =
      "Movie booking research completed";

    summary =
      "Movie listings and available booking options were reviewed.";
  } else if (
    lower.includes("laptop") ||
    lower.includes("shopping") ||
    lower.includes("buy")
  ) {
    title =
      "Shopping research completed";

    summary =
      "Available products and relevant options were reviewed.";
  } else if (
    lower.includes("flight") ||
    lower.includes("hotel") ||
    lower.includes("travel")
  ) {
    title =
      "Travel research completed";

    summary =
      "Travel options and relevant booking details were reviewed.";
  } else if (
    lower.includes("restaurant") ||
    lower.includes("food") ||
    lower.includes("order")
  ) {
    title =
      "Food research completed";

    summary =
      "Restaurant and ordering options were reviewed.";
  }

  return {
    title,
    summary,
    details: [
      "Task intent analyzed",
      "Browser workflow executed",
      "Relevant information collected",
      "Sensitive action checkpoint respected",
      "Final state verified",
    ],
  };
}

export function createBrowserAutomationMockTask(
  payload: CreateBrowserMockTaskPayload,
): BrowserMockTask {
  const task: BrowserMockTask = {
    id: generateTaskId(),

    task: payload.task.trim(),

    connector:
      payload.connector ?? null,

    status: "running",

    retryCount: 0,

    currentStep: 0,

    executionTime: 120,

    approvalRequired: false,

    message:
      "Browser automation started.",

    createdAt:
      new Date().toISOString(),

    steps: createSteps(),

    failure: undefined,

    result: undefined,
  };

  task.steps[0].status =
    "running";

  tasks.set(
    task.id,
    task,
  );

  return cloneTask(task);
}

export function getBrowserAutomationMockTask(
  taskId: string,
): BrowserMockTask | null {
  const task =
    tasks.get(taskId);

  if (!task) {
    return null;
  }

  return cloneTask(task);
}

export function advanceBrowserAutomationMockTask(
  taskId: string,
): BrowserMockTask | null {
  const task =
    tasks.get(taskId);

  if (!task) {
    return null;
  }

  /*
   * Terminal states.
   */
  if (
    task.status === "completed" ||
    task.status === "cancelled" ||
    task.status === "failed"
  ) {
    return cloneTask(task);
  }

  /*
   * Paused state.
   */
  if (
    task.status === "paused"
  ) {
    return cloneTask(task);
  }

  /*
   * Approval is waiting for the user.
   */
  if (
    task.status === "approval_required"
  ) {
    return cloneTask(task);
  }

  /*
   * Approval has been received.
   *
   * IMPORTANT:
   * Stop here.
   *
   * The next future step will be Payment.
   */
  if (
    task.status === "approved"
  ) {
    return cloneTask(task);
  }

  const currentIndex =
    task.currentStep;

  /*
   * Test failure mode.
   *
   * The first execution of a task containing
   * "fail", "failure" or "error" fails at step 5.
   *
   * After retrying, retryCount becomes 1+,
   * so the retry can continue normally.
   */
  if (
    currentIndex === 4 &&
    task.retryCount === 0 &&
    /fail|failure|error/i.test(
      task.task,
    )
  ) {
    task.status = "failed";

    task.approvalRequired =
      false;

    task.message =
      "Browser automation failed while processing the requested information.";

    task.steps[
      currentIndex
    ].status = "failed";

    task.failure = {
      stepId:
        task.steps[currentIndex]
          .id,

      message:
        "The browser could not complete the requested information lookup.",
    };

    return cloneTask(task);
  }

  /*
   * Safety check.
   */
  if (
    currentIndex >=
    task.steps.length
  ) {
    task.status = "completed";

    task.approvalRequired =
      false;

    task.message =
      "Execution completed successfully.";

    task.result =
      buildResult(task);

    task.failure =
      undefined;

    return cloneTask(task);
  }

  /*
   * Complete current step.
   */
  task.steps[
    currentIndex
  ].status = "completed";

  task.executionTime += 340;

  /*
   * STEP 7 -> STEP 8
   *
   * After preparing the action,
   * stop and require human approval.
   */
  if (
    currentIndex === 6
  ) {
    const approvalIndex = 7;

    task.currentStep =
      approvalIndex;

    task.status =
      "approval_required";

    task.approvalRequired =
      true;

    task.steps[
      approvalIndex
    ].status =
      "approval_required";

    task.message =
      "The workflow is ready for user confirmation before the final action.";

    return cloneTask(task);
  }

  /*
   * Final verification step.
   *
   * This remains part of the existing
   * pre-payment mock flow and can later
   * be replaced by the Payment -> Receipt
   * -> Verification sequence.
   */
  if (
    currentIndex ===
    task.steps.length - 1
  ) {
    task.currentStep =
      task.steps.length;

    task.status =
      "completed";

    task.approvalRequired =
      false;

    task.message =
      "Execution completed successfully.";

    task.result =
      buildResult(task);

    task.failure =
      undefined;

    return cloneTask(task);
  }

  /*
   * Continue normally.
   */
  const nextIndex =
    currentIndex + 1;

  task.currentStep =
    nextIndex;

  task.steps[
    nextIndex
  ].status = "running";

  task.status =
    "running";

  task.approvalRequired =
    false;

  task.message =
    `Running: ${task.steps[nextIndex].title}.`;

  return cloneTask(task);
}

export function pauseBrowserAutomationMockTask(
  taskId: string,
): BrowserMockTask | null {
  const task =
    tasks.get(taskId);

  if (!task) {
    return null;
  }

  if (
    task.status !== "running" ||
    task.currentStep >=
      task.steps.length
  ) {
    return cloneTask(task);
  }

  task.status = "paused";

  task.message =
    "Browser automation paused.";

  return cloneTask(task);
}

export function resumeBrowserAutomationMockTask(
  taskId: string,
): BrowserMockTask | null {
  const task =
    tasks.get(taskId);

  if (!task) {
    return null;
  }

  if (
    task.status === "paused"
  ) {
    task.status = "running";

    task.message =
      "Browser automation resumed.";
  }

  return cloneTask(task);
}

export function stopBrowserAutomationMockTask(
  taskId: string,
): BrowserMockTask | null {
  const task =
    tasks.get(taskId);

  if (!task) {
    return null;
  }

  if (
    task.status === "completed" ||
    task.status === "cancelled"
  ) {
    return cloneTask(task);
  }

  task.status =
    "cancelled";

  task.approvalRequired =
    false;

  task.message =
    "Browser automation stopped by the user.";

  if (
    task.currentStep <
    task.steps.length
  ) {
    task.steps[
      task.currentStep
    ].status = "failed";
  }

  return cloneTask(task);
}

export function approveBrowserAutomationMockTask(
  taskId: string,
): BrowserMockTask | null {
  const task =
    tasks.get(taskId);

  if (!task) {
    return null;
  }

  if (
    task.status !==
    "approval_required"
  ) {
    return cloneTask(task);
  }

  const approvalIndex = 7;

  /*
   * Mark approval step complete.
   */
  task.steps[
    approvalIndex
  ].status = "completed";

  task.approvalRequired =
    false;

  /*
   * Stay on step 7.
   *
   * The following future state
   * will be Payment.
   */
  task.currentStep =
    approvalIndex;

  task.status =
    "approved";

  task.executionTime += 180;

  task.message =
    "User approval received. Payment step is ready.";

  return cloneTask(task);
}

export function cancelBrowserAutomationMockTask(
  taskId: string,
): BrowserMockTask | null {
  const task =
    tasks.get(taskId);

  if (!task) {
    return null;
  }

  task.status =
    "cancelled";

  task.approvalRequired =
    false;

  task.message =
    "Browser automation cancelled.";

  if (
    task.currentStep <
    task.steps.length
  ) {
    task.steps[
      task.currentStep
    ].status = "failed";
  }

  return cloneTask(task);
}

export function retryBrowserAutomationMockTask(
  taskId: string,
): BrowserMockTask | null {
  const task =
    tasks.get(taskId);

  if (!task) {
    return null;
  }

  if (
    task.status !== "failed"
  ) {
    return cloneTask(task);
  }

  /*
   * Maximum retry protection.
   */
  if (
    task.retryCount >=
    MAX_RETRIES
  ) {
    task.status =
      "failed";

    task.approvalRequired =
      false;

    task.message =
      "Maximum retry limit reached for this browser task.";

    task.failure = {
      stepId:
        task.currentStep + 1,

      message:
        `This task has reached the maximum of ${MAX_RETRIES} retry attempts.`,
    };

    return cloneTask(task);
  }

  /*
   * Increment retry count.
   */
  task.retryCount += 1;

  /*
   * Restart execution.
   */
  task.status =
    "running";

  task.currentStep = 0;

  task.executionTime =
    120;

  task.approvalRequired =
    false;

  task.message =
    `Browser automation retry ${task.retryCount} started.`;

  task.failure =
    undefined;

  task.result =
    undefined;

  task.steps =
    createSteps();

  task.steps[0].status =
    "running";

  return cloneTask(task);
}

export function clearBrowserAutomationMockTasks(): void {
  tasks.clear();
}