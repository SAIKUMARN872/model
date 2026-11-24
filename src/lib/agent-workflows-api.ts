import API from "../config/api";

/* -------------------------------------------------------------------------- */
/* API configuration                                                          */
/* -------------------------------------------------------------------------- */

const API_BASE_URL =
  API.BASE_URL.replace(/\/$/, "");

const WORKFLOW_API_PATH =
  `/${API.VERSION}/agent-workflows`;

function buildUrl(
  path: string,
): string {
  return `${API_BASE_URL}${WORKFLOW_API_PATH}${path}`;
}

/* -------------------------------------------------------------------------- */
/* Shared types                                                               */
/* -------------------------------------------------------------------------- */

export type AgentId =
  | "business-support"
  | "crm"
  | "erp"
  | "hr"
  | "sales"
  | "finance"
  | "custom-enterprise";

export type WorkflowMode =
  | "test"
  | "run";

export type WorkflowExecutionStatus =
  | "queued"
  | "planning"
  | "reasoning"
  | "running"
  | "waiting"
  | "paused"
  | "verifying"
  | "completed"
  | "failed"
  | "cancelled";

export type ApprovalDecision =
  | "approve"
  | "reject";

/* -------------------------------------------------------------------------- */
/* Agent capability contracts                                                 */
/* -------------------------------------------------------------------------- */

export type AgentToolDefinition = {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  requiresApproval: boolean;
};

export type AgentConnectorStatus =
  | "connected"
  | "pending"
  | "error"
  | "disconnected";

export type AgentConnectorDefinition = {
  id: string;
  name: string;
  description: string;
  status: AgentConnectorStatus;
};

export type WorkflowStageCapabilities = {
  stage: string;
  stageIndex: number;
  tools: AgentToolDefinition[];
  connectors: AgentConnectorDefinition[];
};

/* -------------------------------------------------------------------------- */
/* Workflow stage action contracts                                            */
/* -------------------------------------------------------------------------- */

export type WorkflowStageActionType =
  | "input"
  | "tool"
  | "connector"
  | "approval"
  | "decision"
  | "verification"
  | "navigation";

export type WorkflowStageAction = {
  id: string;
  label: string;
  type: WorkflowStageActionType;
  description?: string;
  enabled: boolean;
  requiresApproval?: boolean;
  toolId?: string;
  connectorId?: string;
};

export type WorkflowStageDefinition = {
  id: string;
  name: string;
  index: number;
  description?: string;
  actions: WorkflowStageAction[];
};

export type AgentWorkflowCatalog = {
  agentId: AgentId;
  workflowId: string;
  stages: WorkflowStageCapabilities[];
  stageDefinitions?: WorkflowStageDefinition[];
  totalTools: number;
  totalConnectors: number;
};

/* -------------------------------------------------------------------------- */
/* Planning contracts                                                         */
/* -------------------------------------------------------------------------- */

export type AgentIntent = {
  name: string;
  description?: string;
  confidence?: number;
};

export type WorkflowPlanStepStatus =
  | "pending"
  | "active"
  | "completed"
  | "blocked"
  | "skipped";

export type WorkflowPlanStep = {
  id: string;
  index: number;
  stage: string;
  title: string;
  description?: string;
  status: WorkflowPlanStepStatus;
};

export type ReasoningStepStatus =
  | "pending"
  | "active"
  | "completed";

export type ReasoningStep = {
  id: string;
  index: number;
  title: string;
  description?: string;
  status: ReasoningStepStatus;
};

export type WorkflowPlanningState = {
  intent?: AgentIntent;
  plan: WorkflowPlanStep[];
  reasoning: ReasoningStep[];
  message?: string;
};

export type PlanWorkflowRequest = {
  agentId: AgentId;
  workflowId: string;
  input: string;
};

export type PlanWorkflowResponse =
  WorkflowPlanningState;

/* -------------------------------------------------------------------------- */
/* Custom workflow contracts                                                  */
/* -------------------------------------------------------------------------- */

export type CustomWorkflowDefinition = {
  agentId: "custom-enterprise";
  name: string;
  description: string;
  steps: string[];
  tools: string[];
  connectors: string[];
};

export type SaveCustomWorkflowResponse = {
  agentId: AgentId;
  workflowId: string;
  name: string;
  description?: string;
  steps: string[];
  tools: string[];
  connectors: string[];
};

/* -------------------------------------------------------------------------- */
/* Execution contracts                                                        */
/* -------------------------------------------------------------------------- */

export type WorkflowApproval = {
  required: boolean;
  description: string;
  proposedAction?: string;
};

export type WorkflowVerificationStatus =
  | "pending"
  | "running"
  | "passed"
  | "failed"
  | "skipped";

export type WorkflowVerification = {
  status: WorkflowVerificationStatus;
  message?: string;
};

export type WorkflowExecution = {
  executionId: string;
  workflowId: string;
  agentId: AgentId;
  status: WorkflowExecutionStatus;
  currentStage: string;
  currentStageIndex: number;
  totalStages: number;
  progress: number;
  message?: string;
  planning?: WorkflowPlanningState;
  approval?: WorkflowApproval;
  verification?: WorkflowVerification;
  result?: unknown;
  error?: string;
};

export type ExecuteWorkflowRequest = {
  agentId: AgentId;
  workflowId: string;
  mode: WorkflowMode;
  input: string;
  workflowDefinition?: CustomWorkflowDefinition;
};

export type ExecuteWorkflowResponse = {
  executionId: string;
  workflowId: string;
  agentId?: AgentId;
  status: WorkflowExecutionStatus;
};

export type WorkflowControlResponse = {
  executionId: string;
  status: WorkflowExecutionStatus;
};

/* -------------------------------------------------------------------------- */
/* Custom agent response                                                      */
/* -------------------------------------------------------------------------- */

export type CreateAgentResponse = {
  agentId: string;
  name: string;
  description?: string;
  workflowId?: string;
};

/* -------------------------------------------------------------------------- */
/* API error                                                                  */
/* -------------------------------------------------------------------------- */

export class AgentWorkflowApiError
  extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly details?: unknown;
  readonly endpoint?: string;

  constructor({
    message,
    status,
    code,
    details,
    endpoint,
  }: {
    message: string;
    status?: number;
    code?: string;
    details?: unknown;
    endpoint?: string;
  }) {
    super(message);

    this.name =
      "AgentWorkflowApiError";

    this.status = status;
    this.code = code;
    this.details = details;
    this.endpoint = endpoint;
  }
}

/* -------------------------------------------------------------------------- */
/* Response parsing                                                           */
/* -------------------------------------------------------------------------- */

async function readResponseBody(
  response: Response,
): Promise<unknown> {
  const contentType =
    response.headers.get(
      "content-type",
    ) ?? "";

  if (
    contentType
      .toLowerCase()
      .includes("application/json")
  ) {
    try {
      return await response.json();
    } catch {
      return undefined;
    }
  }

  const text =
    await response.text();

  return text || undefined;
}

function extractErrorMessage(
  body: unknown,
): string | undefined {
  if (!body) {
    return undefined;
  }

  if (typeof body === "string") {
    return body.trim() || undefined;
  }

  if (
    typeof body !== "object" ||
    body === null
  ) {
    return undefined;
  }

  const record =
    body as Record<
      string,
      unknown
    >;

  const directCandidates = [
    record.message,
    record.detail,
    record.error,
    record.title,
  ];

  for (const candidate of directCandidates) {
    if (
      typeof candidate ===
        "string" &&
      candidate.trim()
    ) {
      return candidate.trim();
    }
  }

  if (
    Array.isArray(
      record.errors,
    )
  ) {
    const messages =
      record.errors
        .map((item) => {
          if (
            typeof item ===
            "string"
          ) {
            return item;
          }

          if (
            item &&
            typeof item ===
              "object"
          ) {
            const value =
              item as Record<
                string,
                unknown
              >;

            if (
              typeof value.message ===
              "string"
            ) {
              return value.message;
            }

            if (
              typeof value.detail ===
              "string"
            ) {
              return value.detail;
            }
          }

          return null;
        })
        .filter(
          (
            value,
          ): value is string =>
            Boolean(value),
        );

    if (messages.length > 0) {
      return messages.join(
        ", ",
      );
    }
  }

  return undefined;
}

function getStatusMessage(
  status: number,
): string {
  switch (status) {
    case 400:
      return "The ModelNow backend rejected the request.";

    case 401:
      return "Authentication is required to use the ModelNow agent workflow API.";

    case 403:
      return "You are not authorized to use this ModelNow agent workflow.";

    case 404:
      return "The requested ModelNow agent workflow endpoint was not found.";

    case 409:
      return "The ModelNow backend could not process the workflow because of a state conflict.";

    case 422:
      return "The ModelNow backend could not validate the workflow request.";

    case 429:
      return "The ModelNow backend rate limit was reached. Please try again later.";

    case 500:
    case 502:
    case 503:
    case 504:
      return "The ModelNow backend is currently unavailable.";

    default:
      return `The ModelNow backend returned HTTP ${status}.`;
  }
}

/* -------------------------------------------------------------------------- */
/* Fetch helper                                                               */
/* -------------------------------------------------------------------------- */

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const url = buildUrl(path);

  const headers = new Headers(
    options.headers,
  );

  if (
    !headers.has(
      "Accept",
    )
  ) {
    headers.set(
      "Accept",
      "application/json",
    );
  }

  if (
    options.body &&
    !headers.has(
      "Content-Type",
    )
  ) {
    headers.set(
      "Content-Type",
      "application/json",
    );
  }

  let response: Response;

  try {
    response = await fetch(
      url,
      {
        ...options,
        headers,
      },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "";

    throw new AgentWorkflowApiError(
      {
        message:
          "Unable to connect to the ModelNow backend. Please make sure the backend API is running and reachable.",
        details:
          message || undefined,
        endpoint: url,
      },
    );
  }

  const body =
    await readResponseBody(
      response,
    );

  if (!response.ok) {
    const backendMessage =
      extractErrorMessage(
        body,
      );

    throw new AgentWorkflowApiError(
      {
        message:
          backendMessage ||
          getStatusMessage(
            response.status,
          ),
        status:
          response.status,
        code:
          typeof body ===
            "object" &&
          body !== null &&
          typeof (
            body as Record<
              string,
              unknown
            >
          ).code ===
            "string"
            ? (
                body as Record<
                  string,
                  unknown
                >
              ).code as string
            : undefined,
        details: body,
        endpoint: url,
      },
    );
  }

  if (
    response.status ===
    204
  ) {
    return undefined as T;
  }

  return body as T;
}

/* -------------------------------------------------------------------------- */
/* Catalog                                                                    */
/* -------------------------------------------------------------------------- */

export async function getAgentWorkflowCatalog(
  agentId: AgentId,
): Promise<AgentWorkflowCatalog> {
  return request<AgentWorkflowCatalog>(
    `/catalog/${encodeURIComponent(
      agentId,
    )}`,
    {
      method: "GET",
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Planning                                                                   */
/* -------------------------------------------------------------------------- */

export async function planWorkflow(
  payload: PlanWorkflowRequest,
): Promise<PlanWorkflowResponse> {
  return request<PlanWorkflowResponse>(
    "/plan",
    {
      method: "POST",
      body: JSON.stringify(
        payload,
      ),
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Execution                                                                  */
/* -------------------------------------------------------------------------- */

export async function executeWorkflow(
  payload: ExecuteWorkflowRequest,
): Promise<ExecuteWorkflowResponse> {
  return request<ExecuteWorkflowResponse>(
    "/execute",
    {
      method: "POST",
      body: JSON.stringify(
        payload,
      ),
    },
  );
}

export async function getWorkflowExecution(
  executionId: string,
): Promise<WorkflowExecution> {
  return request<WorkflowExecution>(
    `/executions/${encodeURIComponent(
      executionId,
    )}`,
    {
      method: "GET",
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Execution controls                                                         */
/* -------------------------------------------------------------------------- */

export async function pauseWorkflowExecution(
  executionId: string,
): Promise<WorkflowControlResponse> {
  return request<WorkflowControlResponse>(
    `/executions/${encodeURIComponent(
      executionId,
    )}/pause`,
    {
      method: "POST",
    },
  );
}

export async function resumeWorkflowExecution(
  executionId: string,
): Promise<WorkflowControlResponse> {
  return request<WorkflowControlResponse>(
    `/executions/${encodeURIComponent(
      executionId,
    )}/resume`,
    {
      method: "POST",
    },
  );
}

export async function cancelWorkflowExecution(
  executionId: string,
): Promise<WorkflowControlResponse> {
  return request<WorkflowControlResponse>(
    `/executions/${encodeURIComponent(
      executionId,
    )}/cancel`,
    {
      method: "POST",
    },
  );
}

export async function resolveWorkflowApproval(
  executionId: string,
  decision: ApprovalDecision,
): Promise<WorkflowControlResponse> {
  return request<WorkflowControlResponse>(
    `/executions/${encodeURIComponent(
      executionId,
    )}/approval`,
    {
      method: "POST",
      body: JSON.stringify(
        {
          decision,
        },
      ),
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Custom workflow                                                            */
/* -------------------------------------------------------------------------- */

export async function saveCustomWorkflow(
  payload: CustomWorkflowDefinition,
): Promise<SaveCustomWorkflowResponse> {
  return request<SaveCustomWorkflowResponse>(
    "/custom-workflows",
    {
      method: "POST",
      body: JSON.stringify(
        payload,
      ),
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Optional custom-agent creation contract                                    */
/* -------------------------------------------------------------------------- */

export async function createAgent(
  payload: CustomWorkflowDefinition,
): Promise<CreateAgentResponse> {
  return request<CreateAgentResponse>(
    "/agents",
    {
      method: "POST",
      body: JSON.stringify(
        payload,
      ),
    },
  );
}