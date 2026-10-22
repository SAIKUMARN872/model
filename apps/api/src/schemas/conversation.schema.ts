import { z } from "zod";
import { idSchema, paginationSchema, messageSchema, metadataSchema } from "./common.schema.js";

export const createConversationSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  metadata: metadataSchema.optional(),
}).strict();

export const conversationQuerySchema = paginationSchema.extend({
  cursor: idSchema.optional(),
});

export const addConversationMessageSchema = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: messageSchema,
  metadata: metadataSchema.optional(),
}).strict();
