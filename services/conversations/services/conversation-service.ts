import { validateCreateConversation, validateConversation } from "../schemas.js";
import { createConversation } from "../models.js";
import { AlreadyExistsError, NotFoundError, PermissionError, InvalidStateError, ValidationError } from "../exceptions.js";
import type { Conversation, CreateConversationInput } from "../interfaces.js";
import { ConversationRepository } from "../repository/conversation-repository.js";
import { conversationEvents } from "../events/conversation-events.js";

export class ConversationService {
  constructor(private readonly repository = new ConversationRepository()) {}

  create(input: CreateConversationInput): Conversation {
    validateCreateConversation(input);
    const conversation = createConversation(input);
    validateConversation(conversation);
    this.repository.save(conversation);
    conversationEvents.emit({
      type: "conversation.created", conversationId: conversation.id,
      ownerId: conversation.ownerId, timestamp: new Date()
    });
    return conversation;
  }
  get(id: string, ownerId?: string): Conversation {
    const conversation = this.repository.get(id);
    if (!conversation || conversation.status === "deleted") throw new NotFoundError(`Conversation not found: ${id}`);
    if (ownerId && conversation.ownerId !== ownerId) throw new PermissionError("Conversation access denied");
    return conversation;
  }
  list(ownerId: string): Conversation[] { return this.repository.listByOwner(ownerId); }

  rename(id: string, ownerId: string, title: string): Conversation {
    const conversation = this.get(id, ownerId);
    if (conversation.status !== "active") throw new InvalidStateError("Only active conversations can be renamed");
    if (typeof title !== "string" || !title.trim()) throw new ValidationError("Title is required");
    conversation.title = title.trim();
    conversation.updatedAt = new Date();
    return this.repository.save(conversation);
  }
  ensureUniqueId(id: string): void {
    if (this.repository.get(id)) throw new AlreadyExistsError(`Conversation already exists: ${id}`);
  }
  getRepository(): ConversationRepository { return this.repository; }
}
