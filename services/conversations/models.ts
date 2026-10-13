import { cloneRecord } from "./utils.js";
import { randomUUID } from "node:crypto";
import { DEFAULT_TITLE } from "./constants.js";
import type {
  ArchiveRecord, Conversation, CreateConversationInput, CreateMessageInput,
  CreateShareInput, DeleteRecord, Message, Share
} from "./interfaces.js";

export function createConversation(input: CreateConversationInput): Conversation {
  const now = new Date();
  return {
    id: `conv_${randomUUID()}`,
    title: input.title?.trim() || DEFAULT_TITLE,
    ownerId: input.ownerId,
    status: "active",
    messageCount: 0,
    createdAt: now,
    updatedAt: now
  };
}
export function createMessage(input: CreateMessageInput): Message {
  return {
    id: `msg_${randomUUID()}`,
    conversationId: input.conversationId,
    role: input.role,
    content: input.content,
    createdAt: new Date(),
    ...(input.metadata ? { metadata: cloneRecord(input.metadata) } : {})
  };
}
export function createShare(input: CreateShareInput): Share {
  return {
    id: `share_${randomUUID()}`,
    conversationId: input.conversationId,
    ownerId: input.ownerId,
    token: randomUUID(),
    isPublic: input.isPublic ?? false,
    createdAt: new Date(),
    ...(input.expiresAt ? { expiresAt: new Date(input.expiresAt) } : {})
  };
}
export function createArchiveRecord(conversationId: string, ownerId: string): ArchiveRecord {
  return { id: `archive_${randomUUID()}`, conversationId, ownerId, archivedAt: new Date() };
}
export function createDeleteRecord(
  conversationId: string, ownerId: string, permanent = false
): DeleteRecord {
  return { id: `delete_${randomUUID()}`, conversationId, ownerId, deletedAt: new Date(), permanent };
}


