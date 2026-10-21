import { z } from "zod";

const Coordinate = z.number().finite().min(0);

export const ComputerActionSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("mouse_click"),
    x: Coordinate,
    y: Coordinate,
    button: z.enum(["left", "right", "middle"]).default("left"),
    clickCount: z.number().int().min(1).max(2).default(1),
  }).strict(),
  z.object({
    type: z.literal("mouse_move"),
    x: Coordinate,
    y: Coordinate,
  }).strict(),
  z.object({
    type: z.literal("scroll"),
    x: Coordinate,
    y: Coordinate,
    deltaX: z.number().finite().min(-3000).max(3000).default(0),
    deltaY: z.number().finite().min(-3000).max(3000),
  }).strict(),
  z.object({
    type: z.literal("key_press"),
    key: z.enum([
      "ENTER", "ESCAPE", "TAB", "SPACE", "BACKSPACE", "DELETE",
      "ARROW_UP", "ARROW_DOWN", "ARROW_LEFT", "ARROW_RIGHT",
      "HOME", "END", "PAGE_UP", "PAGE_DOWN",
    ]),
    modifiers: z.array(z.enum(["CTRL", "ALT", "SHIFT", "META"]))
      .max(3).default([]),
  }).strict(),
  z.object({
    type: z.literal("type_text"),
    text: z.string().min(1).max(10000),
  }).strict(),
  z.object({
    type: z.literal("wait"),
    durationMs: z.number().int().min(0).max(10000),
  }).strict(),
]);

export const ActionRequestSchema = z.object({
  actionId: z.string().min(1).max(128),
  sessionId: z.string().min(1).max(128),
  requestedBy: z.string().min(1).max(128),
  action: ComputerActionSchema,
  requiresApproval: z.boolean().default(false),
  idempotencyKey: z.string().min(1).max(128).optional(),
  createdAt: z.string().datetime(),
}).strict();

export const ActionResultSchema = z.object({
  actionId: z.string().min(1).max(128),
  sessionId: z.string().min(1).max(128),
  status: z.enum(["succeeded", "failed", "rejected"]),
  errorCode: z.string().max(100).optional(),
  errorMessage: z.string().max(1000).optional(),
  startedAt: z.string().datetime(),
  completedAt: z.string().datetime(),
}).strict().refine(
  v => Date.parse(v.completedAt) >= Date.parse(v.startedAt),
  { message: "completedAt must not precede startedAt" },
);

export type ComputerAction = z.infer<typeof ComputerActionSchema>;
export type ActionRequest = z.infer<typeof ActionRequestSchema>;
export type ActionResult = z.infer<typeof ActionResultSchema>;
