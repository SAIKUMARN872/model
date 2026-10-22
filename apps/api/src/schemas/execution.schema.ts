import { z } from "zod";
import { idSchema, messageSchema, prioritySchema, metadataSchema } from "./common.schema.js";

export const executionRequestSchema = z.object({
  prompt: messageSchema,
  modelId: idSchema.optional(),
  conversationId: idSchema.optional(),
  priority: prioritySchema.default("normal"),
  maxTokens: z.number().int().min(1).max(200000).optional(),
  temperature: z.number().min(0).max(2).optional(),
  stream: z.boolean().default(false),
  metadata: metadataSchema.optional(),
}).strict();

export const executionStatusSchema = z.enum([
  "queued", "running", "succeeded", "failed", "cancelled",
]);

export const executionResponseSchema = z.object({
  executionId: idSchema,
  status: executionStatusSchema,
  output: z.string().optional(),
  modelId: idSchema.optional(),
  latencyMs: z.number().finite().nonnegative().optional(),
  usage: z.object({
    inputTokens: z.number().int().nonnegative().optional(),
    outputTokens: z.number().int().nonnegative().optional(),
    totalTokens: z.number().int().nonnegative().optional(),
  }).optional(),
});
