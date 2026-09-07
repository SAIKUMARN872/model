export interface Model {
  id: string;
  name: string;
  provider: string;
  description?: string;
  version?: string;
  enabled: boolean;
}

export const models: Model[] = [
  {
    id: "default",
    name: "Default Model",
    provider: "local",
    description:
      "Default AI model for the application.",
    version: "1.0.0",
    enabled: true,
  },
];

export function getModels(): Model[] {
  return [...models];
}

export function getModel(
  id: string
): Model | undefined {
  return models.find(
    (model) => model.id === id
  );
}

export function getEnabledModels(): Model[] {
  return models.filter(
    (model) => model.enabled
  );
}

export function addModel(
  model: Model
): Model {
  models.push(model);

  return model;
}

export function removeModel(
  id: string
): boolean {
  const index = models.findIndex(
    (model) => model.id === id
  );

  if (index === -1) {
    return false;
  }

  models.splice(index, 1);

  return true;
}

export function isModelEnabled(
  id: string
): boolean {
  const model = getModel(id);

  return model?.enabled === true;
}