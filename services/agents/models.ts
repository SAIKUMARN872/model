import type {
  AgentStatus,
  AgentTool,
} from "./enterprise/enterprise-agent-schema.js";

import type {
  WorkflowStatus,
  WorkflowStep,
} from "./workflows/workflow-schema.js";

import type {
  JobStatus,
  AgentJob,
} from "./jobs/job-schema.js";

export type {
  AgentStatus,
  AgentTool,
  WorkflowStatus,
  WorkflowStep,
  JobStatus,
  AgentJob,
};

export interface Agent {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  instructions: string;
  model: string;
  tools: AgentTool[];
  metadata: Record<string, unknown>;
  status: AgentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Workflow {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  steps: WorkflowStep[];
  status: WorkflowStatus;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface AgentExecution {
  id: string;
  agentId: string;
  tenantId: string;
  input?: unknown;
  output?: unknown;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  error?: string;
  createdAt: string;
  updatedAt: string;
  startedAt?: string;
  completedAt?: string;
}

