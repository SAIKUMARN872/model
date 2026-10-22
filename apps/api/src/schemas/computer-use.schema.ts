import { z } from "zod";
import { idSchema } from "./common.schema.js";

export const computerUseActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("click"),
    x: z.number().finite().min(0),
    y: z.number().finite().min(0),
    button: z.enum(["left", "right", "middle"]).default("left"),
  }).strict(),
  z.object({
    type: z.literal("type"),
    text: z.string().max(10000),
  }).strict(),
  z.object({
    type: z.literal("key"),
    key: z.string().trim().min(1).max(100),
  }).strict(),
  z.object({
    type: z.literal("scroll"),
    deltaX: z.number().finite().min(-10000).max(10000).default(0),
    deltaY: z.number().finite().min(-10000).max(10000),
  }).strict(),
]);

export const computerUseRequestSchema = z.object({
  sessionId: idSchema.optional(),
  actions: z.array(computerUseActionSchema).min(1).max(100),
  requireApproval: z.boolean().default(true),
}).strict();
