import { randomUUID } from "node:crypto";
import type { Citation, CreateCitationInput } from "../schemas/citation-schema.js";
import { validateCreateCitationInput } from "../schemas/citation-schema.js";
import { CitationRepository } from "../repository/citation-repository.js";
import { SourceRepository } from "../repository/source-repository.js";

export class CitationService {
  constructor(
    private readonly citations = new CitationRepository(),
    private readonly sources = new SourceRepository(),
  ) {}

  create(input: CreateCitationInput): Citation {
    validateCreateCitationInput(input);
    const source = this.sources.getById(input.sourceId);
    if (!source) throw new Error(`Source not found: ${input.sourceId}`);
    if (source.researchId !== input.researchId) {
      throw new Error("Source does not belong to the specified research.");
    }

    return this.citations.save({
      id: randomUUID(),
      researchId: input.researchId,
      sourceId: input.sourceId,
      quote: input.quote.trim(),
      ...(input.locator ? { locator: input.locator.trim() } : {}),
      createdAt: new Date(),
    });
  }

  get(id: string): Citation | undefined {
    return this.citations.getById(id);
  }

  listByResearch(researchId: string): Citation[] {
    return this.citations.listByResearchId(researchId);
  }

  delete(id: string): boolean {
    return this.citations.delete(id);
  }
}
