export interface Model {
  id: string;
  name: string;
  provider: string;
  description?: string;
  version?: string;
  enabled: boolean;
  contextWindow?: number;
  maxOutputTokens?: number;
  createdAt: string;
  updatedAt: string;
}

export function createModel(
  data: Omit<
    Model,
    "createdAt" | "updatedAt"
  >
): Model {
  const now =
    new Date().toISOString();

  return {
    ...data,
    createdAt: now,
    updatedAt: now,
  };
}

export function updateModel(
  model: Model,
  updates: Partial<Model>
): Model {
  return {
    ...model,
    ...updates,
    id: model.id,
    updatedAt:
      new Date().toISOString(),
  };
}

export function isModelEnabled(
  model: Model
): boolean {
  return model.enabled === true;
}

export function enableModel(
  model: Model
): Model {
  return updateModel(model, {
    enabled: true,
  });
}

export function disableModel(
  model: Model
): Model {
  return updateModel(model, {
    enabled: false,
  });
}