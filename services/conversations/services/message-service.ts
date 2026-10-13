import { createMessage } from "../models.js";
import { validateCreateMessage } from "../schemas.js";
import { InvalidStateError, NotFoundError } from "../exceptions.js";
import type { CreateMessageInput, Message } from "../interfaces.js";
import { MessageRepository } from "../repository/message-repository.js";
import { ConversationService } from "./conversation-service.js";
import { loadConversationConfig } from "../config/config.js";

export class MessageService {
  constructor(
    private readonly conversations: ConversationService,
    private readonly messages = new MessageRepository(),
    private readonly maxMessages = loadConversationConfig().maxMessages
  ) {}
  add(input: CreateMessageInput, ownerId: string): Message {
    validateCreateMessage(input);
    const conversation = this.conversations.get(input.conversationId, ownerId);
    if (conversation.status !== "active") throw new InvalidStateError("Conversation is not active");
    if (conversation.messageCount >= this.maxMessages) throw new InvalidStateError("Conversation message limit reached");
    const message = createMessage(input);
    this.messages.save(message);
    conversation.messageCount++;
    conversation.updatedAt = new Date();
    this.conversations.getRepository().save(conversation);
    return message;
  }
  get(id: string): Message {
    const message = this.messages.get(id);
    if (!message) throw new NotFoundError(`Message not found: ${id}`);
    return message;
  }
  list(conversationId: string, ownerId: string): Message[] {
    this.conversations.get(conversationId, ownerId);
    return this.messages.listByConversation(conversationId);
  }
  deleteForConversation(conversationId: string): number {
    return this.messages.deleteByConversation(conversationId);
  }
  getRepository(): MessageRepository { return this.messages; }
}
