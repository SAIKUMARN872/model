import { randomUUID } from "node:crypto";
import type { CreateSourceInput, Source } from "../schemas/source-schema.js";
import { validateCreateSourceInput } from "../schemas/source-schema.js";
import { SourceRepository } from "../repository/source-repository.js";

export class SourceService {
  constructor(private readonly repository = new SourceRepository()) {}

  create(input: CreateSourceInput): Source {
    validateCreateSourceInput(input);
    const now = new Date();
    return this.repository.save({
      id: randomUUID(),
      researchId: input.researchId,
      url: new URL(input.url).toString(),
      title: input.title.trim(),
      snippet: input.snippet?.trim() ?? "",
      retrievedAt: now,
      createdAt: now,
    });
  }

  get(id: string): Source | undefined {
    return this.repository.getById(id);
  }

  listByResearch(researchId: string): Source[] {
    return this.repository.listByResearchId(researchId);
  }

  delete(id: string): boolean {
    return this.repository.delete(id);
  }
}
