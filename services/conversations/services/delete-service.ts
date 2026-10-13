import { createDeleteRecord } from "../models.js";
import { InvalidStateError } from "../exceptions.js";
import type { DeleteRecord } from "../interfaces.js";
import { ConversationService } from "./conversation-service.js";
import { MessageService } from "./message-service.js";
import { emitDeleteEvent } from "../events/delete-events.js";

export class DeleteService {
  constructor(private readonly conversations: ConversationService, private readonly messages?: MessageService) {}
  delete(id: string, ownerId: string, permanent = false): DeleteRecord {
    const conversation = this.conversations.get(id, ownerId);
    if (conversation.status === "deleted") throw new InvalidStateError("Conversation is already deleted");
    conversation.status = "deleted";
    conversation.deletedAt = new Date();
    conversation.updatedAt = new Date();
    this.conversations.getRepository().save(conversation);
    if (permanent) this.messages?.deleteForConversation(id);
    const record = createDeleteRecord(id, ownerId, permanent);
    emitDeleteEvent(id, ownerId);
    return record;
  }
}
