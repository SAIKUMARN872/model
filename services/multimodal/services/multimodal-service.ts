import { ProcessingService } from "../processing-service.js";
import { SessionService } from "../session-service.js";

export class MultimodalService {
  readonly processing: ProcessingService;
  readonly sessions: SessionService;

  constructor() {
    this.processing = new ProcessingService();
    this.sessions = new SessionService();
  }

  async health() {
    return {
      status: "ok" as const,
      service: "multimodal" as const,
      timestamp: new Date().toISOString(),
    };
  }
}
