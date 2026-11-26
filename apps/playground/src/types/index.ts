export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  VIEWER: "viewer",
  DEVELOPER: "developer",
} as const;

export const AGENT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  DRAFT: "draft",
  ERROR: "error",
} as const;

export const MODEL_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  DEPRECATED: "deprecated",
} as const;

export const EVALUATION_STATUS = {
  PENDING: "pending",
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
} as const;

export const REQUEST_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
} as const;

export const MESSAGE_ROLES = {
  USER: "user",
  ASSISTANT: "assistant",
  SYSTEM: "system",
} as const;

// Shared interfaces

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
  createdAt: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  status: string;
  modelId: string;
  createdAt: string;
}

export interface Model {
  id: string;
  name: string;
  provider: string;
  version: string;
  status: string;
}

export interface Prompt {
  id: string;
  name: string;
  content: string;
  description: string;
  version: string;
}

export interface Message {
  id: string;
  role: string;
  content: string;
  createdAt: string;
}

export interface Evaluation {
  id: string;
  name: string;
  status: string;
  score: number | null;
  createdAt: string;
}

// Factory functions

export function createUser(
  data: Partial<User> = {}
): User {
  return {
    id: data.id || "",
    name: data.name || "",
    email: data.email || "",
    role: data.role || USER_ROLES.USER,
    avatar: data.avatar || "",
    createdAt: data.createdAt || new Date().toISOString(),
  };
}

export function createAgent(
  data: Partial<Agent> = {}
): Agent {
  return {
    id: data.id || "",
    name: data.name || "",
    description: data.description || "",
    status: data.status || AGENT_STATUS.DRAFT,
    modelId: data.modelId || "",
    createdAt: data.createdAt || new Date().toISOString(),
  };
}

export function createModel(
  data: Partial<Model> = {}
): Model {
  return {
    id: data.id || "",
    name: data.name || "",
    provider: data.provider || "",
    version: data.version || "",
    status: data.status || MODEL_STATUS.ACTIVE,
  };
}

export function createPrompt(
  data: Partial<Prompt> = {}
): Prompt {
  return {
    id: data.id || "",
    name: data.name || "",
    content: data.content || "",
    description: data.description || "",
    version: data.version || "1.0",
  };
}

export function createMessage(
  data: Partial<Message> = {}
): Message {
  return {
    id: data.id || Date.now().toString(),
    role: data.role || MESSAGE_ROLES.USER,
    content: data.content || "",
    createdAt: data.createdAt || new Date().toISOString(),
  };
}

export function createEvaluation(
  data: Partial<Evaluation> = {}
): Evaluation {
  return {
    id: data.id || "",
    name: data.name || "",
    status: data.status || EVALUATION_STATUS.PENDING,
    score: data.score ?? null,
    createdAt: data.createdAt || new Date().toISOString(),
  };
}

// Validation helpers

export function isValidUser(
  user: unknown
): user is User {
  return (
    typeof user === "object" &&
    user !== null &&
    "email" in user &&
    Boolean(user.email)
  );
}

export function isValidAgent(
  agent: unknown
): agent is Agent {
  return (
    typeof agent === "object" &&
    agent !== null &&
    "name" in agent &&
    Boolean(agent.name)
  );
}

export function isValidModel(
  model: unknown
): model is Model {
  return (
    typeof model === "object" &&
    model !== null &&
    "name" in model &&
    Boolean(model.name)
  );
}

export function isValidPrompt(
  prompt: unknown
): prompt is Prompt {
  return (
    typeof prompt === "object" &&
    prompt !== null &&
    "content" in prompt &&
    Boolean(prompt.content)
  );
}

export default {
  USER_ROLES,
  AGENT_STATUS,
  MODEL_STATUS,
  EVALUATION_STATUS,
  REQUEST_STATUS,
  MESSAGE_ROLES,
  createUser,
  createAgent,
  createModel,
  createPrompt,
  createMessage,
  createEvaluation,
  isValidUser,
  isValidAgent,
  isValidModel,
  isValidPrompt,
};