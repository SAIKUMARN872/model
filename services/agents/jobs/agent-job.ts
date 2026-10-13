import { randomUUID } from "node:crypto";

import type {
  AgentJob,
  CreateAgentJobInput,
} from "./job-schema.js";

export class AgentJobService {
  create(input: CreateAgentJobInput): AgentJob {
    if (!input.tenantId?.trim()) {
      throw new Error("tenantId is required");
    }

    if (!input.agentId?.trim()) {
      throw new Error("agentId is required");
    }

    if (!input.name?.trim()) {
      throw new Error("Job name is required");
    }

    const timestamp = new Date().toISOString();

    return {
      id: `job_${randomUUID()}`,
      tenantId: input.tenantId.trim(),
      agentId: input.agentId.trim(),
      name: input.name.trim(),
      ...(input.input !== undefined
        ? { input: structuredClone(input.input) }
        : {}),
      status: "queued",
      priority: input.priority ?? 0,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
  }
}

export const agentJobService = new AgentJobService();

