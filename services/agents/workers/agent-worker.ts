import type { AgentJob } from "../jobs/job-schema.js";

export interface AgentWorker {
  execute(job: AgentJob): Promise<unknown>;
}

export class DefaultAgentWorker implements AgentWorker {
  async execute(job: AgentJob): Promise<unknown> {
    return {
      jobId: job.id,
      agentId: job.agentId,
      status: "completed",
      input: job.input,
    };
  }
}

export const agentWorker = new DefaultAgentWorker();

