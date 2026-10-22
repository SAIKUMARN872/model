import type { RequestHandler } from "express";
import { z } from "zod";
import { AuthenticationError } from "../errors/authentication.error.js";
import { ApiError } from "../errors/api.error.js";
import { ValidationError } from "../errors/validation.error.js";

import type { AuthenticatedPrincipal } from "../types/request.types.js";

export interface AgentRecord {
  readonly id: string;
  readonly [key: string]: unknown;
}

export interface AgentService {
  create(input: CreateAgentInput, principal: AuthenticatedPrincipal): Promise<unknown>;
  list(query: ListAgentsInput, principal: AuthenticatedPrincipal): Promise<unknown>;
  get(id: string, principal: AuthenticatedPrincipal): Promise<unknown | null>;
  update(id: string, input: UpdateAgentInput, principal: AuthenticatedPrincipal): Promise<unknown | null>;
  delete(id: string, principal: AuthenticatedPrincipal): Promise<boolean | void>;
  run(id: string, input: RunAgentInput, principal: AuthenticatedPrincipal): Promise<unknown>;
}

const createAgentSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().trim().max(4000).optional(),
  instructions: z.string().trim().min(1).max(50_000),
  model: z.string().trim().min(1).max(200).optional(),
  tools: z.array(z.string().trim().min(1).max(100)).max(100).optional(),
}).strict();

const updateAgentSchema = z.object({
  name: z.string().trim().min(1).max(120).optional(),
  description: z.string().trim().max(4000).nullable().optional(),
  instructions: z.string().trim().min(1).max(50_000).optional(),
  model: z.string().trim().min(1).max(200).optional(),
  tools: z.array(z.string().trim().min(1).max(100)).max(100).optional(),
}).strict().refine(
  (value) => Object.keys(value).length > 0,
  { message: "At least one field must be provided." },
);

const runAgentSchema = z.object({
  input: z.unknown(),
  conversationId: z.string().trim().min(1).max(200).optional(),
}).strict();

const idSchema = z.object({
  agentId: z.string().trim().min(1).max(200),
}).strict();

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).max(1_000_000).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
}).strict();

export type CreateAgentInput = z.infer<typeof createAgentSchema>;
export type UpdateAgentInput = z.infer<typeof updateAgentSchema>;
export type RunAgentInput = z.infer<typeof runAgentSchema>;
export type ListAgentsInput = z.infer<typeof paginationSchema>;

type LocalsWithPrincipal = {
  principal?: AuthenticatedPrincipal;
  requestId?: string;
};

function getPrincipal(
  locals: LocalsWithPrincipal,
): AuthenticatedPrincipal {
  const principal = locals.principal;

  if (
    !principal ||
    typeof principal.userId !== "string" ||
    principal.userId.trim().length === 0
  ) {
    throw new AuthenticationError("Authentication is required.");
  }

  return principal;
}

function getRequestId(locals: LocalsWithPrincipal): string | undefined {
  return typeof locals.requestId === "string"
    ? locals.requestId
    : undefined;
}

function parseOrThrow<T>(
  schema: z.ZodType<T>,
  input: unknown,
): T {
  const parsed = schema.safeParse(input);

  if (!parsed.success) {
    throw new ValidationError(
      parsed.error.issues.map((issue) => ({
        path: issue.path.filter(
          (part): part is string | number =>
            typeof part === "string" || typeof part === "number",
        ),
        code: issue.code,
        message: issue.message,
      })),
      "The request contains invalid fields.",
    );
  }

  return parsed.data;
}

function asyncHandler(
  handler: RequestHandler,
): RequestHandler {
  return (request, response, next) => {
    Promise.resolve(handler(request, response, next)).catch(next);
  };
}

export function createAgentControllers(
  service: AgentService,
): Readonly<Record<string, RequestHandler>> {
  if (!service || typeof service !== "object") {
    throw new TypeError("An agent service implementation is required.");
  }

  for (const method of ["create", "list", "get", "update", "delete", "run"] as const) {
    if (typeof service[method] !== "function") {
      throw new TypeError(`Agent service method "${method}" is required.`);
    }
  }

  const create = asyncHandler(async (request, response) => {
    const principal = getPrincipal(response.locals as LocalsWithPrincipal);
    const input = parseOrThrow(createAgentSchema, request.body);
    const data = await service.create(input, principal);

    response.status(201).json({
      data,
      requestId: getRequestId(response.locals as LocalsWithPrincipal),
    });
  });

  const list = asyncHandler(async (request, response) => {
    const principal = getPrincipal(response.locals as LocalsWithPrincipal);
    const input = parseOrThrow(paginationSchema, request.query);
    const data = await service.list(input, principal);

    response.status(200).json({
      data,
      requestId: getRequestId(response.locals as LocalsWithPrincipal),
    });
  });

  const get = asyncHandler(async (request, response) => {
    const principal = getPrincipal(response.locals as LocalsWithPrincipal);
    const { agentId: id } = parseOrThrow(idSchema, request.params);
    const data = await service.get(id, principal);

    if (data === null) {
      throw new ApiError(404, "AGENT_NOT_FOUND", "The requested agent was not found.");
    }

    response.status(200).json({
      data,
      requestId: getRequestId(response.locals as LocalsWithPrincipal),
    });
  });

  const update = asyncHandler(async (request, response) => {
    const principal = getPrincipal(response.locals as LocalsWithPrincipal);
    const { agentId: id } = parseOrThrow(idSchema, request.params);
    const input = parseOrThrow(updateAgentSchema, request.body);
    const data = await service.update(id, input, principal);

    if (data === null) {
      throw new ApiError(404, "AGENT_NOT_FOUND", "The requested agent was not found.");
    }

    response.status(200).json({
      data,
      requestId: getRequestId(response.locals as LocalsWithPrincipal),
    });
  });

  const remove = asyncHandler(async (request, response) => {
    const principal = getPrincipal(response.locals as LocalsWithPrincipal);
    const { agentId: id } = parseOrThrow(idSchema, request.params);
    const result = await service.delete(id, principal);

    if (result === false) {
      throw new ApiError(404, "AGENT_NOT_FOUND", "The requested agent was not found.");
    }

    response.status(204).end();
  });

  const run = asyncHandler(async (request, response) => {
    const principal = getPrincipal(response.locals as LocalsWithPrincipal);
    const { agentId: id } = parseOrThrow(idSchema, request.params);
    const input = parseOrThrow(runAgentSchema, request.body);
    const data = await service.run(id, input, principal);

    response.status(200).json({
      data,
      requestId: getRequestId(response.locals as LocalsWithPrincipal),
    });
  });

  return Object.freeze({ create, list, get, update, delete: remove, run });
}
