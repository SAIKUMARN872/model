import { ValidationError } from "../exceptions.js";
import type { CreateMessageInput } from "../interfaces.js";
export function validateMessageInput(input: CreateMessageInput): void {
  if (!input?.conversationId?.trim()) throw new ValidationError("conversationId is required");
  if (!["system", "user", "assistant", "tool"].includes(input.role)) throw new ValidationError("Invalid message role");
  if (typeof input.content !== "string" || !input.content.trim()) throw new ValidationError("Message content is required");
}
