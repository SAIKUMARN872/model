import { z } from "zod";
import { idSchema, paginationSchema } from "./common.schema.js";

export const capabilityQuerySchema = paginationSchema.extend({
  category: z.string().trim().min(1).max(100).optional(),
  enabled: z.coerce.boolean().optional(),
});

export const capabilitySchema = z.object({
  id: idSchema,
  name: z.string().trim().min(1).max(160),
  description: z.string().max(4000),
  category: z.string().trim().min(1).max(100),
  enabled: z.boolean(),
  version: z.string().min(1).max(80).optional(),
});
