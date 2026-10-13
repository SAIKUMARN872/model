import { randomUUID } from "node:crypto";
import type { CreateResearchInput, Research } from "../schemas/research-schema.js";
import { validateCreateResearchInput } from "../schemas/research-schema.js";
import { ResearchRepository } from "../repository/research-repository.js";
import { deepSearchEvents } from "../events/deep-search-events.js";
import { deepSearchSettings } from "../config/settings.js";

export class ResearchService {
  constructor(private readonly repository = new ResearchRepository()) {}

  create(input: CreateResearchInput): Research {
    validateCreateResearchInput(input);
    const depth = input.depth ?? 1;
    if (depth > deepSearchSettings.maxResearchDepth) {
      throw new Error(`depth cannot exceed ${deepSearchSettings.maxResearchDepth}.`);
    }

    const now = new Date();
    const research: Research = {
      id: randomUUID(),
      query: input.query.trim(),
      status: "pending",
      depth,
      sourceIds: [],
      citationIds: [],
      createdAt: now,
      updatedAt: now,
    };
    const saved = this.repository.save(research);
    deepSearchEvents.emit("search.started", {
      researchId: saved.id,
      query: saved.query,
    });
    return saved;
  }

  get(id: string): Research | undefined {
    return this.repository.getById(id);
  }

  list(): Research[] {
    return this.repository.list();
  }

  updateStatus(
    id: string,
    status: Research["status"],
    values: Pick<Partial<Research>, "summary" | "error" | "sourceIds" | "citationIds"> = {},
  ): Research {
    const existing = this.repository.getById(id);
    if (!existing) throw new Error(`Research not found: ${id}`);

    const updated: Research = {
      ...existing,
      ...values,
      status,
      updatedAt: new Date(),
    };
    const saved = this.repository.save(updated);

    if (status === "completed") {
      deepSearchEvents.emit("search.completed", {
        researchId: id,
        sourceCount: saved.sourceIds.length,
      });
    } else if (status === "failed") {
      deepSearchEvents.emit("search.failed", {
        researchId: id,
        error: saved.error ?? "Research failed.",
      });
    }

    return saved;
  }

  delete(id: string): boolean {
    return this.repository.delete(id);
  }
}
