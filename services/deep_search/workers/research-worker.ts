import type { ResearchService } from "../services/research-service.js";

export class ResearchWorker {
  constructor(private readonly service: ResearchService) {}

  run(researchId: string, summary: string, sourceIds: string[] = []) {
    if (!summary.trim()) throw new Error("summary is required.");
    return this.service.updateStatus(researchId, "completed", {
      summary: summary.trim(),
      sourceIds,
    });
  }

  fail(researchId: string, error: string) {
    if (!error.trim()) throw new Error("error is required.");
    return this.service.updateStatus(researchId, "failed", { error: error.trim() });
  }
}
