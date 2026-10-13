import { settings, type AgentSettings } from "./settings.js";

export interface AgentsConfig {
  environment: string;
  settings: AgentSettings;
}

export const config: AgentsConfig = {
  environment: process.env.NODE_ENV ?? "development",
  settings,
};

export function getConfig(): AgentsConfig {
  return config;
}

