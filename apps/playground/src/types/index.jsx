"use client";

export const USER_ROLES = {
  ADMIN: "admin",
  USER: "user",
  VIEWER: "viewer",
  DEVELOPER: "developer",
};

export const AGENT_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  DRAFT: "draft",
  ERROR: "error",
};

export const MODEL_STATUS = {
  ACTIVE: "active",
  INACTIVE: "inactive",
  DEPRECATED: "deprecated",
};

export const EVALUATION_STATUS = {
  PENDING: "pending",
  RUNNING: "running",
  COMPLETED: "completed",
  FAILED: "failed",
};

export const REQUEST_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

export const MESSAGE_ROLES = {
  USER: "user",
  ASSISTANT: "assistant",
  SYSTEM: "system",
};

export const createUser = (
  data = {}
) => ({
  id: data.id || "",
  name: data.name || "",
  email: data.email || "",
  role:
    data.role ||
    USER_ROLES.USER,
  avatar: data.avatar || "",
  createdAt:
    data.createdAt ||
    new Date().toISOString(),
});

export const createAgent = (
  data = {}
) => ({
  id: data.id || "",
  name: data.name || "",
  description:
    data.description || "",
  status:
    data.status ||
    AGENT_STATUS.DRAFT,
  modelId:
    data.modelId || "",
  createdAt:
    data.createdAt ||
    new Date().toISOString(),
});

export const createModel = (
  data = {}
) => ({
  id: data.id || "",
  name: data.name || "",
  provider:
    data.provider || "",
  version:
    data.version || "",
  status:
    data.status ||
    MODEL_STATUS.ACTIVE,
});

export const createPrompt = (
  data = {}
) => ({
  id: data.id || "",
  name: data.name || "",
  content:
    data.content || "",
  description:
    data.description || "",
  version:
    data.version || "1.0",
});

export const createMessage = (
  data = {}
) => ({
  id:
    data.id ||
    Date.now().toString(),
  role:
    data.role ||
    MESSAGE_ROLES.USER,
  content:
    data.content || "",
  createdAt:
    data.createdAt ||
    new Date().toISOString(),
});

export const createEvaluation = (
  data = {}
) => ({
  id: data.id || "",
  name: data.name || "",
  status:
    data.status ||
    EVALUATION_STATUS.PENDING,
  score:
    data.score ?? null,
  createdAt:
    data.createdAt ||
    new Date().toISOString(),
});

export const isValidUser = (
  user
) => {
  return Boolean(
    user &&
      typeof user === "object" &&
      user.email
  );
};

export const isValidAgent = (
  agent
) => {
  return Boolean(
    agent &&
      typeof agent === "object" &&
      agent.name
  );
};

export const isValidModel = (
  model
) => {
  return Boolean(
    model &&
      typeof model === "object" &&
      model.name
  );
};

export const isValidPrompt = (
  prompt
) => {
  return Boolean(
    prompt &&
      typeof prompt === "object" &&
      prompt.content
  );
};

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