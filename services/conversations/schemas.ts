import { ValidationError } from "./exceptions.js";
import type {
  Conversation, CreateConversationInput, CreateMessageInput, CreateShareInput
} from "./interfaces.js";

export function validateCreateConversation(input: CreateConversationInput): void {
  if (!input || typeof input.ownerId !== "string" || !input.ownerId.trim()) {
    throw new ValidationError("ownerId is required");
  }
  if (input.title !== undefined && typeof input.title !== "string") {
    throw new ValidationError("title must be a string");
  }
}
export function validateConversation(conversation: Conversation): void {
  if (!conversation.id || !conversation.ownerId || !conversation.title) {
    throw new ValidationError("Conversation id, ownerId and title are required");
  }
  if (!["active", "archived", "deleted"].includes(conversation.status)) {
    throw new ValidationError("Invalid conversation status");
  }
  if (!Number.isInteger(conversation.messageCount) || conversation.messageCount < 0) {
    throw new ValidationError("messageCount must be a non-negative integer");
  }
}
export function validateCreateMessage(input: CreateMessageInput): void {
  if (!input || !input.conversationId?.trim()) {
    throw new ValidationError("conversationId is required");
  }
  if (!["system", "user", "assistant", "tool"].includes(input.role)) {
    throw new ValidationError("Invalid message role");
  }
  if (typeof input.content !== "string" || !input.content.trim()) {
    throw new ValidationError("Message content is required");
  }
}
export function validateCreateShare(input: CreateShareInput): void {
  if (!input?.conversationId?.trim() || !input.ownerId?.trim()) {
    throw new ValidationError("conversationId and ownerId are required");
  }
  if (input.expiresAt && Number.isNaN(input.expiresAt.getTime())) {
    throw new ValidationError("expiresAt must be a valid date");
  }
}
