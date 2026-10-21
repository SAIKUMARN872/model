
import { z } from "zod";
import { ViewportSchema } from "./computer-schema";

export const ComputerSessionStatusSchema = z.enum([
  "created",
  "running",
  "paused",
  "waiting_for_approval",
  "completed",
  "failed",
  "cancelled",
  "expired",
]);

export const ComputerSessionSchema = z
  .object({
    sessionId: z.string().min(1).max(128),
    tenantId: z.string().min(1).max(128),
    userId: z.string().min(1).max(128),
    computerId: z.string().min(1).max(128),
    status: ComputerSessionStatusSchema,
    purpose: z.string().min(1).max(1000),
    viewport: ViewportSchema,
    maxActions: z.number().int().min(1).max(10_000).default(100),
    actionsExecuted: z.number().int().min(0).default(0),
    approvalRequiredForSensitiveActions: z.boolean().default(true),
    startedAt: z.string().datetime(),
    expiresAt: z.string().datetime(),
    endedAt: z.string().datetime().optional(),
    metadata: z.record(z.string(), z.string().max(500)).default({}),
  })
  .strict()
  .superRefine((session, ctx) => {
    if (
      new Date(session.expiresAt).getTime() <=
      new Date(session.startedAt).getTime()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["expiresAt"],
        message: "expiresAt must be later than startedAt.",
      });
    }

    if (session.actionsExecuted > session.maxActions) {
      ctx.addIssue({
        code: "custom",
        path: ["actionsExecuted"],
        message: "Executed actions cannot exceed maxActions.",
      });
    }

    const terminalStatuses = [
      "completed",
      "failed",
      "cancelled",
      "expired",
    ];

    if (
      terminalStatuses.includes(session.status) &&
      !session.endedAt
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endedAt"],
        message: "Terminal sessions must have endedAt.",
      });
    }

    if (
      session.endedAt &&
      new Date(session.endedAt).getTime() <
        new Date(session.startedAt).getTime()
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["endedAt"],
        message: "endedAt must not precede startedAt.",
      });
    }
  });

export const CreateComputerSessionSchema = z
  .object({
    computerId: z.string().min(1).max(128),
    purpose: z.string().min(1).max(1000),
    viewport: ViewportSchema.optional(),
    maxActions: z.number().int().min(1).max(10_000).default(100),
    expiresAt: z.string().datetime(),
    approvalRequiredForSensitiveActions: z.boolean().default(true),
  })
  .strict();

export type ComputerSession = z.infer<
  typeof ComputerSessionSchema
>;
export type CreateComputerSession = z.infer<
  typeof CreateComputerSessionSchema
>;
export type ComputerSessionStatus = z.infer<
  typeof ComputerSessionStatusSchema
>;
