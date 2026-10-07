import type {
  AgentJob,
  CreateAgentJobInput,
} from "./job-schema.js";

import { agentJobService } from "./agent-job.js";

export class JobManager {
  create(input: CreateAgentJobInput): AgentJob {
    return agentJobService.create(input);
  }
}

export const jobManager = new JobManager();

