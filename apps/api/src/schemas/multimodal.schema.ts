import { z } from "zod";
import { idSchema, messageSchema } from "./common.schema.js";

export const multimodalRequestSchema = z.object({
  inputText: messageSchema.optional(),
  fileIds: z.array(idSchema).max(20).default([]),
  tasks: z.array(z.enum([
    "image_understanding", "audio_transcription", "audio_generation",
    "video_understanding", "text_generation",
  ])).min(1).max(5),
  modelId: idSchema.optional(),
  requireSafetyReview: z.boolean().default(true),
}).strict().refine(
  (value) => Boolean(value.inputText) || value.fileIds.length > 0,
  { message: "Provide inputText or at least one fileId." },
);
