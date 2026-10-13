import {
  COMPUTER_USE_DEFAULT_TIMEOUT_MS,
  COMPUTER_USE_MAX_TIMEOUT_MS,
  COMPUTER_USE_MAX_SCREENSHOTS,
  COMPUTER_USE_APPROVAL_REQUIRED
} from "../constants.js";
import type { ComputerUseConfig } from "../interfaces.js";

export function loadComputerUseConfig(
  overrides: Partial<ComputerUseConfig> = {}
): ComputerUseConfig {
  const config: ComputerUseConfig = {
    defaultTimeoutMs: COMPUTER_USE_DEFAULT_TIMEOUT_MS,
    maxTimeoutMs: COMPUTER_USE_MAX_TIMEOUT_MS,
    maxScreenshots: COMPUTER_USE_MAX_SCREENSHOTS,
    requireApproval: COMPUTER_USE_APPROVAL_REQUIRED,
    ...overrides
  };

  if (
    config.defaultTimeoutMs <= 0 ||
    config.maxTimeoutMs < config.defaultTimeoutMs ||
    config.maxScreenshots <= 0
  ) {
    throw new Error("Invalid computer-use configuration");
  }

  return config;
}
