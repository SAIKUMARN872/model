import { createShare } from "../models.js";
import { PermissionError, NotFoundError, InvalidStateError, ValidationError } from "../exceptions.js";
import type { CreateShareInput, Share } from "../interfaces.js";
import { validateCreateShare } from "../schemas.js";
import { ShareRepository } from "../repository/share-repository.js";
import { ConversationService } from "./conversation-service.js";
import { loadConversationConfig } from "../config/config.js";
import { isExpired } from "../utils.js";
import { emitShareEvent } from "../events/share-events.js";

export class ShareService {
  constructor(
    private readonly conversations: ConversationService,
    private readonly repository = new ShareRepository(),
    private readonly allowPublicShares = loadConversationConfig().allowPublicShares,
    private readonly maxShares = loadConversationConfig().maxShares
  ) {}
  create(input: CreateShareInput): Share {
    validateCreateShare(input);
    const conversation = this.conversations.get(input.conversationId, input.ownerId);
    if (conversation.status !== "active" && conversation.status !== "archived") {
      throw new InvalidStateError("This conversation cannot be shared");
    }
    if (input.isPublic && !this.allowPublicShares) throw new PermissionError("Public sharing is disabled");
    if (input.expiresAt && input.expiresAt.getTime() <= Date.now()) {
      throw new ValidationError("Share expiry must be in the future");
    }
    const activeShares = this.repository.listByConversation(input.conversationId)
      .filter(item => !item.revokedAt && !isExpired(item.expiresAt));
    if (activeShares.length >= this.maxShares) throw new InvalidStateError("Share limit reached");
    const share = createShare(input);
    this.repository.save(share);
    emitShareEvent(share.conversationId, share.ownerId, share.id);
    return share;
  }
  get(id: string, ownerId: string): Share {
    const share = this.repository.get(id);
    if (!share) throw new NotFoundError(`Share not found: ${id}`);
    if (share.ownerId !== ownerId) throw new PermissionError("Share access denied");
    if (share.revokedAt || isExpired(share.expiresAt)) throw new NotFoundError("Share is no longer available");
    return share;
  }
  resolve(token: string): Share {
    const share = this.repository.getByToken(token);
    if (!share || share.revokedAt || isExpired(share.expiresAt)) {
      throw new NotFoundError("Share not found or expired");
    }
    return share;
  }
  revoke(id: string, ownerId: string): Share {
    const share = this.get(id, ownerId);
    share.revokedAt = new Date();
    return this.repository.save(share);
  }
  list(conversationId: string, ownerId: string): Share[] {
    this.conversations.get(conversationId, ownerId);
    return this.repository.listByConversation(conversationId)
      .filter(item => !item.revokedAt && !isExpired(item.expiresAt));
  }
}
