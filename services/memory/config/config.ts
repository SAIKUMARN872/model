import { memorySettings } from "./settings.js";

export interface MemoryConfig {
  enabled: boolean;
  maxEntries: number;
}

export function getMemoryConfig(): MemoryConfig {
  return {
    enabled: memorySettings.enabled,
    maxEntries: memorySettings.maxEntries,
  };
}
