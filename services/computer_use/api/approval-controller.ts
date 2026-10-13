import { ApprovalService } from "../services/approval-service.js";
export class ApprovalController {
  constructor(private readonly service = new ApprovalService()) {}
  request(sessionId: string, actionId: string) { return this.service.request(sessionId, actionId); }
  approve(id: string, reason?: string) { return this.service.resolve(id, true, reason); }
  reject(id: string, reason?: string) { return this.service.resolve(id, false, reason); }
  get(id: string) { return this.service.get(id); }
}
