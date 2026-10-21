export type AgentStatus = "draft" | "active" | "archived";

export type AgentModelProvider = "openai" | "anthropic";

export interface AgentModel {
  provider: AgentModelProvider;
  model: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AgentTool {
  name: string;
  description?: string;
  enabled?: boolean;
  requiresApproval?: boolean;
}

export interface AgentRecord {
  id: string;
  tenantId: string;
  name: string;
  description?: string;
  instructions: string;
  model: AgentModel;
  tools: AgentTool[];
  metadata: Record<string, unknown>;
  status: AgentStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  archivedAt?: string;
}

export interface CreateAgentInput {
  tenantId: string;
  name: string;
  description?: string;
  instructions: string;
  model: AgentModel;
  tools?: AgentTool[];
  metadata?: Record<string, unknown>;
}

export interface UpdateAgentInput {
  name?: string;
  description?: string;
  instructions?: string;
  model?: AgentModel;
  tools?: AgentTool[];
  metadata?: Record<string, unknown>;
}

export interface AgentFilters {
  tenantId: string;
  status?: AgentStatus;
  provider?: AgentModelProvider;
  search?: string;
  limit?: number;
  offset?: number;
}

export type ValidationResult<T> =
  | { valid: true; data: T; errors: [] }
  | { valid: false; errors: string[] };

const supportedProviders: readonly AgentModelProvider[] = [
  "openai",
  "anthropic",
];

function isAgentModel(value: unknown): value is AgentModel {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const model = value as Record<string, unknown>;

  return (
    supportedProviders.includes(
      model.provider as AgentModelProvider,
    ) &&
    typeof model.model === "string" &&
    model.model.trim().length > 0 &&
    (model.temperature === undefined ||
      (typeof model.temperature === "number" &&
        Number.isFinite(model.temperature))) &&
    (model.maxTokens === undefined ||
      (Number.isInteger(model.maxTokens) &&
        (model.maxTokens as number) > 0))
  );
}

function isAgentTool(value: unknown): value is AgentTool {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const tool = value as Record<string, unknown>;

  return (
    typeof tool.name === "string" &&
    tool.name.trim().length > 0 &&
    (tool.description === undefined ||
      typeof tool.description === "string") &&
    (tool.enabled === undefined ||
      typeof tool.enabled === "boolean") &&
    (tool.requiresApproval === undefined ||
      typeof tool.requiresApproval === "boolean")
  );
}

function validateAgentFields(
  input: CreateAgentInput | UpdateAgentInput,
  isCreate: boolean,
): string[] {
  const errors: string[] = [];

  if (
    isCreate &&
    (!("tenantId" in input) ||
      typeof input.tenantId !== "string" ||
      input.tenantId.trim().length === 0)
  ) {
    errors.push("tenantId is required.");
  }

  if (
    isCreate &&
    (typeof input.name !== "string" ||
      input.name.trim().length === 0)
  ) {
    errors.push("name is required.");
  }

  if (
    isCreate &&
    (typeof input.instructions !== "string" ||
      input.instructions.trim().length === 0)
  ) {
    errors.push("instructions are required.");
  }

  if ("name" in input && input.name !== undefined &&
      (typeof input.name !== "string" ||
        input.name.trim().length === 0)) {
    errors.push("name must not be empty.");
  }

  if (
    "description" in input &&
    input.description !== undefined &&
    typeof input.description !== "string"
  ) {
    errors.push("description must be a string.");
  }

  if (
    "instructions" in input &&
    input.instructions !== undefined &&
    (typeof input.instructions !== "string" ||
      input.instructions.trim().length === 0)
  ) {
    errors.push("instructions must not be empty.");
  }

  if ("model" in input && input.model !== undefined &&
      !isAgentModel(input.model)) {
    errors.push("model configuration is invalid.");
  }

  if (
    "tools" in input &&
    input.tools !== undefined &&
    (!Array.isArray(input.tools) ||
      !input.tools.every(isAgentTool))
  ) {
    errors.push("tools must contain valid tool definitions.");
  }

  if (
    "metadata" in input &&
    input.metadata !== undefined &&
    (typeof input.metadata !== "object" ||
      input.metadata === null ||
      Array.isArray(input.metadata))
  ) {
    errors.push("metadata must be an object.");
  }

  return errors;
}

export function validateCreateAgent(
  input: CreateAgentInput,
): ValidationResult<CreateAgentInput> {
  const errors = validateAgentFields(input, true);

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      ...input,
      tenantId: input.tenantId.trim(),
      name: input.name.trim(),
      instructions: input.instructions.trim(),
    },
    errors: [],
  };
}

export function validateUpdateAgent(
  input: UpdateAgentInput,
): ValidationResult<UpdateAgentInput> {
  const errors = validateAgentFields(input, false);

  if (Object.keys(input).length === 0) {
    errors.push("At least one field must be provided.");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, data: input, errors: [] };
}
