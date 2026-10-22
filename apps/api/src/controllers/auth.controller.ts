import type { Request, RequestHandler } from "express";
import { z } from "zod";
import { ApiError } from "../errors/api.error.js";

const registerSchema = z.object({
  email: z.string().trim().email().max(254).transform((v) => v.toLowerCase()),
  password: z.string().min(12).max(128),
}).strict();

const loginSchema = z.object({
  email: z.string().trim().email().max(254).transform((v) => v.toLowerCase()),
  password: z.string().min(1).max(128),
}).strict();

const refreshSchema = z.object({
  refreshToken: z.string().min(1).max(8192),
}).strict();

export interface AuthCredentials {
  readonly email: string;
  readonly password: string;
}

export interface AuthSession {
  readonly accessToken: string;
  readonly refreshToken?: string;
  readonly expiresIn: number;
  readonly tokenType: "Bearer";
}

export interface AuthService {
  register(credentials: AuthCredentials): Promise<AuthSession>;
  login(credentials: AuthCredentials): Promise<AuthSession>;
  refresh(refreshToken: string): Promise<AuthSession>;
  logout(refreshToken: string): Promise<void>;
}

interface RequestLocals {
  requestId?: string;
}

function getRequestId(locals: RequestLocals): string | undefined {
  return typeof locals.requestId === "string" ? locals.requestId : undefined;
}

function parseInput<T>(
  schema: z.ZodType<T>,
  value: unknown,
): T {
  const parsed = schema.safeParse(value);

  if (!parsed.success) {
    throw new ApiError(
      400,
      "VALIDATION_ERROR",
      "The authentication request contains invalid fields.",
    );
  }

  return parsed.data;
}

function asyncHandler(handler: RequestHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
}

export function createAuthControllers(
  service: AuthService,
): Readonly<Record<string, RequestHandler>> {
  if (!service || typeof service !== "object") {
    throw new TypeError("An authentication service is required.");
  }

  for (const method of ["register", "login", "refresh", "logout"] as const) {
    if (typeof service[method] !== "function") {
      throw new TypeError(`Authentication service method "${method}" is required.`);
    }
  }

  const register = asyncHandler(async (req, res) => {
    const input = parseInput(registerSchema, req.body);
    const session = await service.register(input);

    res.status(201).json({
      data: session,
      requestId: getRequestId(res.locals as RequestLocals),
    });
  });

  const login = asyncHandler(async (req, res) => {
    const input = parseInput(loginSchema, req.body);
    const session = await service.login(input);

    res.status(200).json({
      data: session,
      requestId: getRequestId(res.locals as RequestLocals),
    });
  });

  const refresh = asyncHandler(async (req, res) => {
    const input = parseInput(refreshSchema, req.body);
    const session = await service.refresh(input.refreshToken);

    res.status(200).json({
      data: session,
      requestId: getRequestId(res.locals as RequestLocals),
    });
  });

  const logout = asyncHandler(async (req, res) => {
    const input = parseInput(refreshSchema, req.body);
    await service.logout(input.refreshToken);
    res.status(204).end();
  });

  return Object.freeze({ register, login, refresh, logout });
}
