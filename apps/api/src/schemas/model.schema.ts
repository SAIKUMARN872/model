import { z } from "zod";
import { idSchema, paginationSchema } from "./common.schema.js";

export const modelQuerySchema = paginationSchema.extend({
  provider: z.string().trim().min(1).max(100).optional(),
  tier: z.enum(["slm", "mlm", "llm"]).optional(),
  capability: z.string().trim().min(1).max(100).optional(),
  available: z.coerce.boolean().optional(),
});

export const modelReferenceSchema = z.object({
  modelId: idSchema,
}).strict();

export const modelSummarySchema = z.object({
  id: idSchema,
  name: z.string().min(1).max(200),
  provider: z.string().min(1).max(100),
  tier: z.enum(["slm", "mlm", "llm"]),
  capabilities: z.array(z.string().min(1).max(100)),
  available: z.boolean(),
});
