import { z } from "zod";

export const idSchema = z.string().trim().min(1).max(200);
export const timestampSchema = z.string().datetime({ offset: true });
export const prioritySchema = z.enum(["low", "normal", "high", "critical"]);
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});
export const metadataSchema = z.record(z.string(), z.unknown());
export const messageSchema = z.string().trim().min(1).max(100000);
export type Pagination = z.infer<typeof paginationSchema>;
