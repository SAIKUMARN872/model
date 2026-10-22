import { z } from "zod";
import { idSchema, prioritySchema } from "./common.schema.js";

export const createFineTuningJobSchema = z.object({
  name: z.string().trim().min(1).max(160),
  baseModelId: idSchema,
  datasetId: idSchema,
  method: z.enum(["lora", "qlora", "full"]).default("lora"),
  epochs: z.number().int().min(1).max(100).default(3),
  learningRate: z.number().positive().max(1).default(0.0002),
  batchSize: z.number().int().min(1).max(1024).default(1),
  priority: prioritySchema.default("normal"),
}).strict();

export const fineTuningJobStatusSchema = z.enum([
  "queued", "preparing", "training", "evaluating",
  "completed", "failed", "cancelled",
]);
