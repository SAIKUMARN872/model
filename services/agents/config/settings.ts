export interface AgentSettings {
  defaultModel: string;
  maxConcurrentJobs: number;
  jobTimeoutMs: number;
  enableEvents: boolean;
  enableWorkers: boolean;
}

export const settings: AgentSettings = {
  defaultModel: "default",
  maxConcurrentJobs: 10,
  jobTimeoutMs: 300_000,
  enableEvents: true,
  enableWorkers: true,
};

