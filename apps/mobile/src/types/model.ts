export interface AIModel {
  id: string;
  name: string;
  provider: string;
  version?: string;
  description?: string;
  enabled: boolean;
  contextLength?: number;
}

export const DEFAULT_MODEL: AIModel = {
  id: "default",
  name: "Default AI Model",
  provider: "local",
  version: "1.0.0",
  description:
    "Default model for the application.",
  enabled: true,
  contextLength: 4096,
};

export function createModel(
  model: AIModel
): AIModel {
  return {
    ...model,
  };
}

export function isModelEnabled(
  model: AIModel
): boolean {
  return model.enabled;
}

export function enableModel(
  model: AIModel
): AIModel {
  return {
    ...model,
    enabled: true,
  };
}

export function disableModel(
  model: AIModel
): AIModel {
  return {
    ...model,
    enabled: false,
  };
}

export function getModelName(
  model: AIModel
): string {
  return model.name;
}

export default DEFAULT_MODEL;