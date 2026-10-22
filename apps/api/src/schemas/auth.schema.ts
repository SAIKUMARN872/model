import { z } from "zod";

export const loginRequestSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(1).max(1024),
}).strict();

export const registerRequestSchema = z.object({
  email: z.string().trim().email().max(320),
  password: z.string().min(12).max(1024),
  displayName: z.string().trim().min(1).max(120),
}).strict();

export const refreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1).max(8192),
}).strict();

export const tokenResponseSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1).optional(),
  tokenType: z.literal("Bearer").default("Bearer"),
  expiresIn: z.number().int().positive(),
});
