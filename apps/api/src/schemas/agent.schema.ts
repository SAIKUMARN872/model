import { z } from "zod";
import { idSchema, metadataSchema } from "./common.schema.js";

export const createAgentSchema = z.object({
  name: z.string().trim().min(1).max(120),
  description: z.string().max(4000).optional(),
  instructions: z.string().trim().min(1).max(30000),
  modelId: idSchema.optional(),
  tools: z.array(idSchema).max(100).default([]),
  metadata: metadataSchema.optional(),
}).strict();

export const updateAgentSchema = createAgentSchema.partial();
export const runAgentSchema = z.object({
  input: z.string().trim().min(1).max(100000),
  conversationId: idSchema.optional(),
  metadata: metadataSchema.optional(),
}).strict();
