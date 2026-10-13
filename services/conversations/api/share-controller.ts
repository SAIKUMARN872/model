import { ShareService } from "../services/share-service.js";
export class ShareController {
  constructor(private readonly service: ShareService) {}
  create(input: Parameters<ShareService["create"]>[0]) { return this.service.create(input); }
  get(shareId: string, ownerId: string) { return this.service.get(shareId, ownerId); }
  resolve(token: string) { return this.service.resolve(token); }
  revoke(shareId: string, ownerId: string) { return this.service.revoke(shareId, ownerId); }
  list(conversationId: string, ownerId: string) { return this.service.list(conversationId, ownerId); }
}
