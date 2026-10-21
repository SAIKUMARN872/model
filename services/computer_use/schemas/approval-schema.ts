
import { z } from "zod";

export const ApprovalRiskSchema = z.enum([
  "low",
  "medium",
  "high",
  "critical",
]);

export const ApprovalStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "expired",
  "cancelled",
]);

export const ApprovalRequestSchema = z
  .object({
    approvalId: z.string().min(1).max(128),
    sessionId: z.string().min(1).max(128),
    actionId: z.string().min(1).max(128),
    requestedBy: z.string().min(1).max(128),
    title: z.string().min(1).max(200),
    description: z.string().min(1).max(2000),
    riskLevel: ApprovalRiskSchema,
    status: ApprovalStatusSchema.default("pending"),
    requestedAt: z.string().datetime(),
    expiresAt: z.string().datetime(),
  })
  .strict()
  .refine(
    (request) =>
      new Date(request.expiresAt).getTime() >
      new Date(request.requestedAt).getTime(),
    { message: "expiresAt must be later than requestedAt" },
  );

export const ApprovalDecisionSchema = z
  .object({
    approvalId: z.string().min(1).max(128),
    decision: z.enum(["approved", "rejected"]),
    reviewedBy: z.string().min(1).max(128),
    reason: z.string().max(1000).optional(),
    decidedAt: z.string().datetime(),
  })
  .strict();

export const ApprovalRecordSchema = z
  .object({
    request: ApprovalRequestSchema,
    decision: ApprovalDecisionSchema.optional(),
  })
  .strict()
  .superRefine((record, ctx) => {
    const { request, decision } = record;

    if (
      request.status === "approved" &&
      decision?.decision !== "approved"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["decision"],
        message: "An approved request requires an approval decision.",
      });
    }

    if (
      request.status === "rejected" &&
      decision?.decision !== "rejected"
    ) {
      ctx.addIssue({
        code: "custom",
        path: ["decision"],
        message: "A rejected request requires a rejection decision.",
      });
    }

    if (decision && decision.approvalId !== request.approvalId) {
      ctx.addIssue({
        code: "custom",
        path: ["decision", "approvalId"],
        message: "Decision approvalId must match the request.",
      });
    }
  });

export type ApprovalRequest = z.infer<typeof ApprovalRequestSchema>;
export type ApprovalDecision = z.infer<typeof ApprovalDecisionSchema>;
export type ApprovalRecord = z.infer<typeof ApprovalRecordSchema>;
