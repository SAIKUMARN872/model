import { z } from "zod";

export const ScreenshotSchema = z.object({
  screenshotId: z.string().min(1).max(128),
  sessionId: z.string().min(1).max(128),
  computerId: z.string().min(1).max(128),
  storageKey: z.string().min(1).max(1024),
  mimeType: z.enum(["image/png", "image/jpeg", "image/webp"]),
  width: z.number().int().min(1).max(16384),
  height: z.number().int().min(1).max(16384),
  sizeBytes: z.number().int().min(1).max(25 * 1024 * 1024),
  capturedAt: z.string().datetime(),
  redacted: z.boolean().default(false),
  metadata: z.record(z.string(), z.string().max(500)).default({}),
}).strict();

export const ScreenshotCaptureRequestSchema = z.object({
  sessionId: z.string().min(1).max(128),
  computerId: z.string().min(1).max(128),
  format: z.enum(["png", "jpeg", "webp"]).default("png"),
  quality: z.number().int().min(1).max(100).optional(),
  redactSensitiveContent: z.boolean().default(true),
}).strict().refine(
  v => v.format === "jpeg" || v.quality === undefined,
  {
    message: "quality is only supported for JPEG captures",
    path: ["quality"],
  },
);

export type Screenshot = z.infer<typeof ScreenshotSchema>;
export type ScreenshotCaptureRequest = z.infer<
  typeof ScreenshotCaptureRequestSchema
>;
