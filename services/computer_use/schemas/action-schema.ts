
import { z } from "zod";

const ActionIdSchema = z.string().min(1).max(128);
const CoordinateSchema = z.number().finite().min(0);

export const MouseClickActionSchema = z
  .object({
    type: z.literal("mouse_click"),
    x: CoordinateSchema,
    y: CoordinateSchema,
    button: z.enum(["left", "right", "middle"]).default("left"),
    clickCount: z.number().int().min(1).max(2).default(1),
  })
  .strict(); 

export const MouseMoveActionSchema = z
  .object({
    type: z.literal("mouse_move"),
    x: CoordinateSchema,
    y: CoordinateSchema,
  })
  .strict();

export const ScrollActionSchema = z
  .object({
    type: z.literal("scroll"),
    x: CoordinateSchema,
    y: CoordinateSchema,
    deltaX: z.number().finite().min(-3000).max(3000).default(0),
    deltaY: z.number().finite().min(-3000).max(3000),
  })
  .strict();

export const KeyPressActionSchema = z
  .object({
    type: z.literal("key_press"),
    key: z.enum([
      "ENTER",
      "ESCAPE",
      "TAB",
      "SPACE",
      "BACKSPACE",
      "DELETE",
      "ARROW_UP",
      "ARROW_DOWN",
      "ARROW_LEFT",
      "ARROW_RIGHT",
      "HOME",
      "END",
      "PAGE_UP",
      "PAGE_DOWN",
    ]),
    modifiers: z
      .array(z.enum(["CTRL", "ALT", "SHIFT", "META"]))
      .max(3)
      .default([]),
  })
  .strict();

export const TypeTextActionSchema = z
  .object({
    type: z.literal("type_text"),
    text: z.string().min(1).max(10_000),
  })
  .strict();

export const WaitActionSchema = z
  .object({
    type: z.literal("wait"),
    durationMs: z.number().int().min(0).max(10_000),
  })
  .strict();

export const ComputerActionSchema = z.discriminatedUnion("type", [
  MouseClickActionSchema,
  MouseMoveActionSchema,
  ScrollActionSchema,
  KeyPressActionSchema,
  TypeTextActionSchema,
  WaitActionSchema,
]);

export const ActionRequestSchema = z
  .object({
    actionId: ActionIdSchema,
    sessionId: z.string().min(1).max(128),
    action: ComputerActionSchema,
    requestedBy: z.string().min(1).max(128),
    idempotencyKey: z.string().min(1).max(128).optional(),
    requiresApproval: z.boolean().default(false),
    createdAt: z.string().datetime(),
  })
  .strict();

export const ActionResultSchema = z
  .object({
    actionId: ActionIdSchema,
    sessionId: z.string().min(1).max(128),
    status: z.enum(["succeeded", "failed", "rejected"]),
    errorCode: z.string().max(100).optional(),
    errorMessage: z.string().max(1000).optional(),
    startedAt: z.string().datetime(),
    completedAt: z.string().datetime(),
  })
  .strict()
  .refine(
    (result) =>
      new Date(result.completedAt).getTime() >=
      new Date(result.startedAt).getTime(),
    { message: "completedAt must not precede startedAt" },
  );

export type ComputerAction = z.infer<typeof ComputerActionSchema>;
export type ActionRequest = z.infer<typeof ActionRequestSchema>;
export type ActionResult = z.infer<typeof ActionResultSchema>;
