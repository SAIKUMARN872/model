export type ConversationStatus = "active" | "archived" | "deleted";
export type MessageRole = "system" | "user" | "assistant" | "tool";

export interface Conversation {
  id: string;
  title: string;
  ownerId: string;
  status: ConversationStatus;
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
  archivedAt?: Date;
  deletedAt?: Date;
}
export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  createdAt: Date;
  metadata?: Record<string, unknown>;
}
export interface Share {
  id: string;
  conversationId: string;
  ownerId: string;
  token: string;
  isPublic: boolean;
  createdAt: Date;
  expiresAt?: Date;
  revokedAt?: Date;
}
export interface ArchiveRecord {
  id: string;
  conversationId: string;
  ownerId: string;
  archivedAt: Date;
}
export interface DeleteRecord {
  id: string;
  conversationId: string;
  ownerId: string;
  deletedAt: Date;
  permanent: boolean;
}
export interface CreateConversationInput {
  ownerId: string;
  title?: string;
}
export interface CreateMessageInput {
  conversationId: string;
  role: MessageRole;
  content: string;
  metadata?: Record<string, unknown>;
}
export interface CreateShareInput {
  conversationId: string;
  ownerId: string;
  isPublic?: boolean;
  expiresAt?: Date;
}
export interface ConversationEvent {
  type: string;
  conversationId: string;
  ownerId: string;
  timestamp: Date;
  data?: Record<string, unknown>;
}
