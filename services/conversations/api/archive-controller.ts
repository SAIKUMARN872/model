import { ArchiveService } from "../services/archive-service.js";
export class ArchiveController {
  constructor(private readonly service: ArchiveService) {}
  archive(conversationId: string, ownerId: string) { return this.service.archive(conversationId, ownerId); }
  restore(conversationId: string, ownerId: string): void { this.service.restore(conversationId, ownerId); }
  list(ownerId: string) { return this.service.list(ownerId); }
}
