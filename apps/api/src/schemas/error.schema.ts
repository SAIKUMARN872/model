import { z } from "zod";

export const validationIssueSchema = z.object({
  path: z.array(z.union([z.string(), z.number()])),
  code: z.string().min(1),
  message: z.string().min(1),
});

export const apiErrorSchema = z.object({
  success: z.literal(false),
  error: z.object({
    code: z.string().min(1),
    message: z.string().min(1),
    issues: z.array(validationIssueSchema).optional(),
    details: z.unknown().optional(),
  }),
  requestId: z.string().optional(),
});

export type ApiErrorResponse = z.infer<typeof apiErrorSchema>;
