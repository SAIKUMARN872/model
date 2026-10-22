import { z } from "zod";
import { idSchema, paginationSchema } from "./common.schema.js";

export const fileQuerySchema = paginationSchema.extend({
  conversationId: idSchema.optional(),
  contentType: z.string().max(200).optional(),
});

export const fileMetadataSchema = z.object({
  filename: z.string().trim().min(1).max(255),
  contentType: z.string().trim().min(1).max(200),
  sizeBytes: z.number().int().positive().max(1024 * 1024 * 1024),
  checksumSha256: z.string().regex(/^[a-fA-F0-9]{64}$/).optional(),
}).strict();
