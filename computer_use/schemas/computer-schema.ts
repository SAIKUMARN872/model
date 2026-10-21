import { z } from "zod";

export const ViewportSchema = z.object({
  width: z.number().int().min(1).max(16384),
  height: z.number().int().min(1).max(16384),
  scaleFactor: z.number().finite().min(0.5).max(4).default(1),
}).strict();

export const ComputerCapabilitiesSchema = z.object({
  mouse: z.boolean().default(true),
  keyboard: z.boolean().default(true),
  screenshot: z.boolean().default(true),
  clipboardRead: z.boolean().default(false),
  clipboardWrite: z.boolean().default(false),
  fileUpload: z.boolean().default(false),
  fileDownload: z.boolean().default(false),
}).strict();

export const ComputerSchema = z.object({
  computerId: z.string().min(1).max(128),
  tenantId: z.string().min(1).max(128),
  name: z.string().min(1).max(200),
  platform: z.enum(["windows", "macos", "linux", "browser"]),
  status: z.enum(["available", "busy", "offline", "maintenance"]),
  viewport: ViewportSchema,
  capabilities: ComputerCapabilitiesSchema,
  isolated: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
}).strict().refine(
  v => Date.parse(v.updatedAt) >= Date.parse(v.createdAt),
  { message: "updatedAt must not precede createdAt" },
);

export const RegisterComputerSchema = ComputerSchema.omit({
  computerId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export type Viewport = z.infer<typeof ViewportSchema>;
export type ComputerCapabilities = z.infer<typeof ComputerCapabilitiesSchema>;
export type Computer = z.infer<typeof ComputerSchema>;
export type RegisterComputer = z.infer<typeof RegisterComputerSchema>;
