export const MEDIA_TYPES = ["audio", "document", "image", "text", "video"] as const;
export type MediaType = (typeof MEDIA_TYPES)[number];
export type ProcessingStatus = "pending" | "processing" | "completed" | "failed";
