import { z } from "zod";
import { paginationSchema } from "./common.schema.js";

export const usageQuerySchema = paginationSchema.extend({
  from: z.string().datetime({ offset: true }).optional(),
  to: z.string().datetime({ offset: true }).optional(),
  groupBy: z.enum(["day", "model", "provider", "capability"]).default("day"),
}).refine(
  (value) => !value.from || !value.to || value.from <= value.to,
  { message: "'from' must not be later than 'to'.", path: ["from"] },
);

export const usageSummarySchema = z.object({
  requestCount: z.number().int().nonnegative(),
  inputTokens: z.number().int().nonnegative(),
  outputTokens: z.number().int().nonnegative(),
  estimatedCost: z.number().finite().nonnegative(),
  currency: z.string().length(3).default("USD"),
});
