import { z } from "zod";
import type { RequestHandler } from "express";
import { ApiError } from "../errors/api.error.js";
import type { AuthenticatedPrincipal } from "../types/request.types.js";

const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(100_000),
}).strict();

export type ChatPrincipal = AuthenticatedPrincipal;

export interface ChatExecutionInput {
  readonly message: string;
  readonly principal: ChatPrincipal;
  readonly requestId?: string;
}

export interface ChatRuntime {
  execute(input: ChatExecutionInput): Promise<unknown>;
}

interface AuthenticatedLocals {
  principal?: ChatPrincipal;
  requestId?: string;
}

export function createChatController(
  runtime: ChatRuntime | null,
): RequestHandler {
  return async (req, res, next): Promise<void> => {
    try {
      const locals = res.locals as AuthenticatedLocals;
      const principal = locals.principal;

      if (
        !principal ||
        typeof principal.userId !== "string" ||
        principal.userId.trim().length === 0 ||
        !Array.isArray(principal.roles) ||
        !Array.isArray(principal.scopes)
      ) {
        throw new ApiError(
          401,
          "UNAUTHENTICATED",
          "Authentication is required.",
        );
      }

      const parsed = chatRequestSchema.safeParse(req.body);

      if (!parsed.success) {
        throw new ApiError(
          400,
          "VALIDATION_ERROR",
          "The chat request contains invalid fields.",
        );
      }

      if (!runtime) {
        throw new ApiError(
          503,
          "RUNTIME_UNAVAILABLE",
          "Chat execution is temporarily unavailable.",
        );
      }

      const result = await runtime.execute({
        message: parsed.data.message,
        principal,
        requestId: locals.requestId,
      });

      res.status(200).json({
        data: result,
        requestId: locals.requestId,
      });
    } catch (error: unknown) {
      next(error);
    }
  };
}

const chatRuntime: ChatRuntime | null = null;

export function isChatRuntimeAvailable(): boolean {
  return chatRuntime !== null;
}

export const chatController = createChatController(chatRuntime);
