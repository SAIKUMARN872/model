import { randomUUID } from "node:crypto";
import type { DeepSearchInput, SearchResult } from "../schemas/deep-search-schema.js";
import { validateDeepSearchInput } from "../schemas/deep-search-schema.js";
import { ResearchService } from "./research-service.js";
import { SourceService } from "./source-service.js";
import { SearchRepository } from "../repository/search-repository.js";
import { deepSearchSettings } from "../config/settings.js";

export interface SearchProvider {
  search(query: string): Promise<SearchResult>;
}

export class DeepSearchService {
  constructor(
    private readonly provider: SearchProvider,
    private readonly researches = new ResearchService(),
    private readonly sources = new SourceService(),
    private readonly searches = new SearchRepository(),
  ) {}

  async search(input: DeepSearchInput): Promise<{
    researchId: string;
    result: SearchResult;
  }> {
    validateDeepSearchInput(input);
    const maxQueries = Math.min(input.maxQueries ?? 1, deepSearchSettings.maxQueries);
    const maxSources = Math.min(input.maxSources ?? 10, deepSearchSettings.maxSources);
    const research = this.researches.create({
      query: input.query,
      depth: Math.min(input.depth ?? 1, deepSearchSettings.maxResearchDepth),
    });

    try {
      this.researches.updateStatus(research.id, "running");
      const result = await this.provider.search(input.query);
      const sources = result.sources.slice(0, maxSources);
      const normalized: SearchResult = {
        query: result.query,
        sources: sources.map((source) => ({
          url: source.url,
          title: source.title,
          ...(source.snippet ? { snippet: source.snippet } : {}),
        })),
      };

      const sourceIds: string[] = [];
      for (const source of normalized.sources) {
        const created = this.sources.create({
          researchId: research.id,
          url: source.url,
          title: source.title,
          snippet: source.snippet,
        });
        sourceIds.push(created.id);
      }

      this.searches.save({
        id: randomUUID(),
        researchId: research.id,
        result: normalized,
        createdAt: new Date(),
      });

      this.researches.updateStatus(research.id, "completed", { sourceIds });
      void maxQueries;
      return { researchId: research.id, result: normalized };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      this.researches.updateStatus(research.id, "failed", { error: message });
      throw error;
    }
  }
}
