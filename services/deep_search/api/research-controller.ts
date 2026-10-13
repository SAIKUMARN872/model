import type { CreateResearchInput } from "../schemas/research-schema.js";
import type { ResearchService } from "../services/research-service.js";

export class ResearchController {
  constructor(private readonly service: ResearchService) {}

  create(input: CreateResearchInput) {
    return this.service.create(input);
  }

  get(id: string) {
    return this.service.get(id);
  }

  list() {
    return this.service.list();
  }

  updateStatus(
    id: string,
    status: "pending" | "running" | "completed" | "failed" | "cancelled",
    values: { summary?: string; error?: string; sourceIds?: string[]; citationIds?: string[] } = {},
  ) {
    return this.service.updateStatus(id, status, values);
  }

  delete(id: string) {
    return this.service.delete(id);
  }
}
