import { ValidationError } from "../exceptions.js";
import type { Conversation } from "../interfaces.js";
export function validateDeleteTarget(conversation: Conversation): void {
  if (conversation.status === "deleted") throw new ValidationError("Conversation is already deleted");
}
