import { createArchiveRecord } from "../models.js";
import { InvalidStateError, NotFoundError } from "../exceptions.js";
import type { ArchiveRecord } from "../interfaces.js";
import { ArchiveRepository } from "../repository/archive-repository.js";
import { ConversationService } from "./conversation-service.js";
import { emitArchiveEvent } from "../events/archive-events.js";

export class ArchiveService {
  constructor(
    private readonly conversations: ConversationService,
    private readonly repository = new ArchiveRepository()
  ) {}
  archive(id: string, ownerId: string): ArchiveRecord {
    const conversation = this.conversations.get(id, ownerId);
    if (conversation.status !== "active") throw new InvalidStateError("Only active conversations can be archived");
    conversation.status = "archived";
    conversation.archivedAt = new Date();
    conversation.updatedAt = new Date();
    this.conversations.getRepository().save(conversation);
    const record = createArchiveRecord(id, ownerId);
    this.repository.save(record);
    emitArchiveEvent(id, ownerId);
    return record;
  }
  restore(id: string, ownerId: string): void {
    const conversation = this.conversations.get(id, ownerId);
    if (conversation.status !== "archived") throw new InvalidStateError("Conversation is not archived");
    conversation.status = "active";
    delete conversation.archivedAt;
    conversation.updatedAt = new Date();
    this.conversations.getRepository().save(conversation);
  }
  list(ownerId: string): ArchiveRecord[] { return this.repository.listByOwner(ownerId); }
  get(id: string): ArchiveRecord {
    const record = this.repository.listByConversation(id).at(-1);
    if (!record) throw new NotFoundError(`Archive record not found: ${id}`);
    return record;
  }
}
