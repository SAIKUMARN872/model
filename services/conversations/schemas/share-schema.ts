import { ValidationError } from "../exceptions.js";
import type { CreateShareInput } from "../interfaces.js";
export function validateShareInput(input: CreateShareInput): void {
  if (!input?.conversationId?.trim() || !input.ownerId?.trim()) {
    throw new ValidationError("conversationId and ownerId are required");
  }
  if (input.expiresAt && Number.isNaN(input.expiresAt.getTime())) {
    throw new ValidationError("Invalid share expiry");
  }
}
