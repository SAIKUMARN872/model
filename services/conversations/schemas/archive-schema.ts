import { ValidationError } from "../exceptions.js";
import type { Conversation } from "../interfaces.js";
export function validateArchiveTarget(conversation: Conversation): void {
  if (conversation.status !== "active") throw new ValidationError("Only active conversations can be archived");
}
