import { ValidationError } from "../exceptions.js";
import type { CreateConversationInput } from "../interfaces.js";
export function validateConversationInput(input: CreateConversationInput): void {
  if (!input?.ownerId?.trim()) throw new ValidationError("ownerId is required");
  if (input.title !== undefined && typeof input.title !== "string") throw new ValidationError("title must be a string");
}
