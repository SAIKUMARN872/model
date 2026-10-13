import { MEDIA_TYPES } from "./constants.js";

export function isMediaType(value: unknown): boolean {
  return typeof value === "string" &&
    MEDIA_TYPES.includes(value as (typeof MEDIA_TYPES)[number]);
}

export function validateNonEmpty(value: string, field: string): void {
  if (!value.trim()) throw new Error(`${field} is required`);
}
