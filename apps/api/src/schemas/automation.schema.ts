import { z } from "zod";
import { idSchema, prioritySchema, metadataSchema } from "./common.schema.js";

export const createAutomationSchema = z.object({
  name: z.string().trim().min(1).max(160),
  description: z.string().max(4000).optional(),
  trigger: z.object({
    type: z.enum(["manual", "schedule", "webhook", "event"]),
    configuration: metadataSchema.default({}),
  }).strict(),
  steps: z.array(z.object({
    id: idSchema,
    type: z.string().trim().min(1).max(100),
    configuration: metadataSchema.default({}),
  }).strict()).min(1).max(200),
  priority: prioritySchema.default("normal"),
}).strict();

export const runAutomationSchema = z.object({
  input: metadataSchema.default({}),
  idempotencyKey: z.string().min(8).max(200).optional(),
}).strict();
