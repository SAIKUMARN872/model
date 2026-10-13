import { DeleteService } from "../services/delete-service.js";
export class DeleteController {
  constructor(private readonly service: DeleteService) {}
  delete(conversationId: string, ownerId: string, permanent = false) {
    return this.service.delete(conversationId, ownerId, permanent);
  }
}
