import test from "node:test";
import assert from "node:assert/strict";

import {
  loadDeepSearchConfig,
  ResearchRepository,
  SourceRepository,
  CitationRepository,
  SearchRepository,
  ResearchService,
  SourceService,
  CitationService,
  DeepSearchService,
  DeepSearchEventEmitter,
  JobManager,
  createResearchJob,
  createSearchJob,
  validateCreateSourceInput,
  validateCreateCitationInput,
  validateCreateResearchInput,
  validateDeepSearchInput,
  createResearchJob as makeResearchJob,
} from "./index.js";

import type { SearchProvider } from "./services/deep-search-service.js";
import type { Research } from "./schemas/research-schema.js";
import type { Source } from "./schemas/source-schema.js";
import type { Citation } from "./schemas/citation-schema.js";
import type { SearchResult } from "./schemas/deep-search-schema.js";

function sampleResearch(overrides: Partial<Research> = {}): Research {
  const now = new Date("2026-01-01T00:00:00.000Z");
  return {
    id: "research-1",
    query: "TypeScript testing",
    status: "pending",
    depth: 1,
    sourceIds: [],
    citationIds: [],
    createdAt: now,
    updatedAt: now,
    ...overrides,
  };
}

function sampleSource(overrides: Partial<Source> = {}): Source {
  const now = new Date("2026-01-01T00:00:00.000Z");
  return {
    id: "source-1",
    researchId: "research-1",
    url: "https://example.com/article",
    title: "Example article",
    snippet: "Example snippet",
    retrievedAt: now,
    createdAt: now,
    ...overrides,
  };
}

function sampleCitation(overrides: Partial<Citation> = {}): Citation {
  return {
    id: "citation-1",
    researchId: "research-1",
    sourceId: "source-1",
    quote: "A test quote",
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    ...overrides,
  };
}

function sampleResult(overrides: Partial<SearchResult> = {}): SearchResult {
  return {
    query: "TypeScript testing",
    sources: [
      {
        url: "https://example.com/article",
        title: "Example article",
        snippet: "Example snippet",
      },
    ],
    ...overrides,
  };
}

test("config: loads default values", () => {
  const config = loadDeepSearchConfig();
  assert.equal(config.maxQueries, 10);
  assert.equal(config.maxSources, 50);
  assert.equal(config.maxCitations, 100);
  assert.equal(config.maxResearchDepth, 3);
  assert.equal(config.jobTimeoutMs, 120_000);
});

test("config: applies overrides", () => {
  const config = loadDeepSearchConfig({
    maxQueries: 2,
    maxSources: 5,
    maxCitations: 7,
    maxResearchDepth: 2,
    jobTimeoutMs: 5000,
  });
  assert.equal(config.maxQueries, 2);
  assert.equal(config.maxSources, 5);
  assert.equal(config.maxCitations, 7);
  assert.equal(config.maxResearchDepth, 2);
  assert.equal(config.jobTimeoutMs, 5000);
});

test("config: rejects invalid positive integer settings", () => {
  assert.throws(() => loadDeepSearchConfig({ maxQueries: 0 }));
  assert.throws(() => loadDeepSearchConfig({ maxSources: -1 }));
  assert.throws(() => loadDeepSearchConfig({ maxCitations: 1.5 }));
  assert.throws(() => loadDeepSearchConfig({ maxResearchDepth: 0 }));
  assert.throws(() => loadDeepSearchConfig({ jobTimeoutMs: -1 }));
});

test("source schema: accepts valid HTTP URL", () => {
  assert.doesNotThrow(() => validateCreateSourceInput({
    researchId: "research-1",
    url: "https://example.com",
    title: "Example",
  }));
});

test("source schema: rejects missing research ID", () => {
  assert.throws(() => validateCreateSourceInput({
    researchId: " ",
    url: "https://example.com",
    title: "Example",
  }));
});

test("source schema: rejects missing title", () => {
  assert.throws(() => validateCreateSourceInput({
    researchId: "research-1",
    url: "https://example.com",
    title: " ",
  }));
});

test("source schema: rejects malformed URL", () => {
  assert.throws(() => validateCreateSourceInput({
    researchId: "research-1",
    url: "not a URL",
    title: "Example",
  }));
});

test("source schema: rejects non-HTTP protocols", () => {
  assert.throws(() => validateCreateSourceInput({
    researchId: "research-1",
    url: "file:///tmp/example",
    title: "Example",
  }));
});

test("citation schema: accepts valid citation", () => {
  assert.doesNotThrow(() => validateCreateCitationInput({
    researchId: "research-1",
    sourceId: "source-1",
    quote: "Quoted text",
  }));
});

test("citation schema: rejects missing research ID", () => {
  assert.throws(() => validateCreateCitationInput({
    researchId: " ",
    sourceId: "source-1",
    quote: "Quoted text",
  }));
});

test("citation schema: rejects missing source ID", () => {
  assert.throws(() => validateCreateCitationInput({
    researchId: "research-1",
    sourceId: " ",
    quote: "Quoted text",
  }));
});

test("citation schema: rejects blank quote", () => {
  assert.throws(() => validateCreateCitationInput({
    researchId: "research-1",
    sourceId: "source-1",
    quote: " ",
  }));
});

test("research schema: accepts valid input", () => {
  assert.doesNotThrow(() => validateCreateResearchInput({
    query: "Research topic",
    depth: 2,
  }));
});

test("research schema: rejects blank query", () => {
  assert.throws(() => validateCreateResearchInput({ query: " " }));
});

test("research schema: rejects invalid depth", () => {
  assert.throws(() => validateCreateResearchInput({ query: "Topic", depth: 0 }));
  assert.throws(() => validateCreateResearchInput({ query: "Topic", depth: 1.2 }));
});

test("deep-search schema: accepts valid input", () => {
  assert.doesNotThrow(() => validateDeepSearchInput({
    query: "Research topic",
    maxQueries: 2,
    maxSources: 5,
    depth: 1,
  }));
});

test("deep-search schema: rejects blank query", () => {
  assert.throws(() => validateDeepSearchInput({ query: " " }));
});

test("deep-search schema: rejects invalid numeric limits", () => {
  assert.throws(() => validateDeepSearchInput({ query: "Topic", maxQueries: 0 }));
  assert.throws(() => validateDeepSearchInput({ query: "Topic", maxSources: -1 }));
  assert.throws(() => validateDeepSearchInput({ query: "Topic", depth: 1.5 }));
});

test("research repository: saves and retrieves a record", () => {
  const repository = new ResearchRepository();
  repository.save(sampleResearch());
  assert.equal(repository.getById("research-1")?.query, "TypeScript testing");
});

test("research repository: returns undefined for missing ID", () => {
  assert.equal(new ResearchRepository().getById("missing"), undefined);
});

test("research repository: clones arrays and dates", () => {
  const repository = new ResearchRepository();
  const research = sampleResearch({ sourceIds: ["source-1"] });
  repository.save(research);

  const result = repository.getById("research-1")!;
  result.sourceIds.push("source-2");
  result.createdAt.setFullYear(2000);

  const again = repository.getById("research-1")!;
  assert.deepEqual(again.sourceIds, ["source-1"]);
  assert.equal(again.createdAt.getUTCFullYear(), 2026);
});

test("research repository: lists and deletes records", () => {
  const repository = new ResearchRepository();
  repository.save(sampleResearch());
  assert.equal(repository.list().length, 1);
  assert.equal(repository.delete("research-1"), true);
  assert.equal(repository.delete("research-1"), false);
  assert.equal(repository.list().length, 0);
});

test("source repository: saves and retrieves source", () => {
  const repository = new SourceRepository();
  repository.save(sampleSource());
  assert.equal(repository.getById("source-1")?.title, "Example article");
});

test("source repository: filters sources by research", () => {
  const repository = new SourceRepository();
  repository.save(sampleSource());
  repository.save(sampleSource({ id: "source-2", researchId: "research-2" }));
  assert.equal(repository.listByResearchId("research-1").length, 1);
});

test("source repository: clones returned dates", () => {
  const repository = new SourceRepository();
  repository.save(sampleSource());
  const source = repository.getById("source-1")!;
  source.createdAt.setFullYear(2000);
  assert.equal(repository.getById("source-1")!.createdAt.getUTCFullYear(), 2026);
});

test("source repository: deletes records", () => {
  const repository = new SourceRepository();
  repository.save(sampleSource());
  assert.equal(repository.delete("source-1"), true);
  assert.equal(repository.getById("source-1"), undefined);
});

test("citation repository: saves and retrieves citation", () => {
  const repository = new CitationRepository();
  repository.save(sampleCitation());
  assert.equal(repository.getById("citation-1")?.quote, "A test quote");
});

test("citation repository: filters by research and source", () => {
  const repository = new CitationRepository();
  repository.save(sampleCitation());
  repository.save(sampleCitation({
    id: "citation-2",
    researchId: "research-2",
    sourceId: "source-2",
  }));
  assert.equal(repository.listByResearchId("research-1").length, 1);
  assert.equal(repository.listBySourceId("source-1").length, 1);
});

test("citation repository: clones dates", () => {
  const repository = new CitationRepository();
  repository.save(sampleCitation());
  repository.getById("citation-1")!.createdAt.setFullYear(2000);
  assert.equal(repository.getById("citation-1")!.createdAt.getUTCFullYear(), 2026);
});

test("citation repository: deletes citation", () => {
  const repository = new CitationRepository();
  repository.save(sampleCitation());
  assert.equal(repository.delete("citation-1"), true);
  assert.equal(repository.getById("citation-1"), undefined);
});

test("search repository: saves and retrieves search result", () => {
  const repository = new SearchRepository();
  repository.save({
    id: "search-1",
    researchId: "research-1",
    result: sampleResult(),
    createdAt: new Date(),
  });
  assert.equal(repository.getById("search-1")?.result.sources.length, 1);
});

test("search repository: clones nested source results", () => {
  const repository = new SearchRepository();
  repository.save({
    id: "search-1",
    researchId: "research-1",
    result: sampleResult(),
    createdAt: new Date(),
  });

  const result = repository.getById("search-1")!;
  result.result.sources[0]!.title = "Mutated";
  assert.equal(repository.getById("search-1")!.result.sources[0]!.title, "Example article");
});

test("search repository: filters by research", () => {
  const repository = new SearchRepository();
  repository.save({
    id: "search-1",
    researchId: "research-1",
    result: sampleResult(),
    createdAt: new Date(),
  });
  repository.save({
    id: "search-2",
    researchId: "research-2",
    result: sampleResult(),
    createdAt: new Date(),
  });
  assert.equal(repository.listByResearchId("research-1").length, 1);
});

test("search repository: deletes search result", () => {
  const repository = new SearchRepository();
  repository.save({
    id: "search-1",
    researchId: "research-1",
    result: sampleResult(),
    createdAt: new Date(),
  });
  assert.equal(repository.delete("search-1"), true);
  assert.equal(repository.getById("search-1"), undefined);
});

test("event emitter: invokes registered listener", () => {
  const events = new DeepSearchEventEmitter();
  let received = "";
  events.on("search.started", (payload) => {
    received = payload.query;
  });
  events.emit("search.started", { researchId: "r1", query: "hello" });
  assert.equal(received, "hello");
});

test("event emitter: unsubscribe stops listener", () => {
  const events = new DeepSearchEventEmitter();
  let count = 0;
  const unsubscribe = events.on("search.started", () => count++);
  unsubscribe();
  events.emit("search.started", { researchId: "r1", query: "hello" });
  assert.equal(count, 0);
});

test("event emitter: clear removes all listeners", () => {
  const events = new DeepSearchEventEmitter();
  let count = 0;
  events.on("search.started", () => count++);
  events.clear();
  events.emit("search.started", { researchId: "r1", query: "hello" });
  assert.equal(count, 0);
});

test("job manager: creates and retrieves a queued job", () => {
  const manager = new JobManager<{ query: string }>();
  manager.create("job-1", { query: "test" });
  assert.equal(manager.get("job-1")?.status, "queued");
});

test("job manager: rejects duplicate job IDs", () => {
  const manager = new JobManager<string>();
  manager.create("job-1", "first");
  assert.throws(() => manager.create("job-1", "second"));
});

test("job manager: updates job status and result", () => {
  const manager = new JobManager<string>();
  manager.create("job-1", "payload");
  const job = manager.update("job-1", "completed", { result: { ok: true } });
  assert.equal(job.status, "completed");
  assert.deepEqual(job.result, { ok: true });
});

test("job manager: throws when updating missing job", () => {
  const manager = new JobManager<string>();
  assert.throws(() => manager.update("missing", "failed"));
});

test("job manager: lists and deletes jobs", () => {
  const manager = new JobManager<string>();
  manager.create("job-1", "one");
  manager.create("job-2", "two");
  assert.equal(manager.list().length, 2);
  assert.equal(manager.delete("job-1"), true);
  assert.equal(manager.list().length, 1);
});

test("job factories: create research and search jobs", () => {
  const researchJob = createResearchJob("research-1", "topic", 2);
  const searchJob = createSearchJob("research-1", "topic");

  assert.equal(researchJob.researchId, "research-1");
  assert.equal(researchJob.depth, 2);
  assert.equal(searchJob.researchId, "research-1");
  assert.equal(searchJob.query, "topic");
  assert.ok(researchJob.id);
  assert.ok(searchJob.id);
});

test("research service: creates a pending research record", () => {
  const service = new ResearchService(new ResearchRepository());
  const research = service.create({ query: "Research topic" });
  assert.equal(research.status, "pending");
  assert.equal(research.query, "Research topic");
  assert.equal(research.depth, 1);
});

test("research service: rejects depth above configured maximum", () => {
  const service = new ResearchService(new ResearchRepository());
  assert.throws(() => service.create({ query: "topic", depth: 999 }));
});

test("research service: updates status and summary", () => {
  const service = new ResearchService(new ResearchRepository());
  const research = service.create({ query: "topic" });
  const updated = service.updateStatus(research.id, "completed", {
    summary: "Finished",
    sourceIds: ["source-1"],
  });
  assert.equal(updated.status, "completed");
  assert.equal(updated.summary, "Finished");
  assert.deepEqual(updated.sourceIds, ["source-1"]);
});

test("research service: throws when updating unknown research", () => {
  const service = new ResearchService(new ResearchRepository());
  assert.throws(() => service.updateStatus("missing", "failed"));
});

test("research service: gets, lists and deletes records", () => {
  const service = new ResearchService(new ResearchRepository());
  const research = service.create({ query: "topic" });
  assert.equal(service.get(research.id)?.id, research.id);
  assert.equal(service.list().length, 1);
  assert.equal(service.delete(research.id), true);
  assert.equal(service.get(research.id), undefined);
});

test("source service: creates a normalized source", () => {
  const service = new SourceService(new SourceRepository());
  const source = service.create({
    researchId: "research-1",
    url: "https://example.com",
    title: "  Example title  ",
    snippet: "  snippet  ",
  });
  assert.equal(source.title, "Example title");
  assert.equal(source.snippet, "snippet");
  assert.equal(source.url, "https://example.com/");
});

test("source service: rejects invalid source input", () => {
  const service = new SourceService(new SourceRepository());
  assert.throws(() => service.create({
    researchId: "research-1",
    url: "bad",
    title: "title",
  }));
});

test("source service: gets, lists and deletes sources", () => {
  const service = new SourceService(new SourceRepository());
  const source = service.create({
    researchId: "research-1",
    url: "https://example.com",
    title: "Example",
  });
  assert.equal(service.get(source.id)?.id, source.id);
  assert.equal(service.listByResearch("research-1").length, 1);
  assert.equal(service.delete(source.id), true);
  assert.equal(service.get(source.id), undefined);
});

test("citation service: creates citation when source exists", () => {
  const sourceRepository = new SourceRepository();
  sourceRepository.save(sampleSource());
  const service = new CitationService(new CitationRepository(), sourceRepository);
  const citation = service.create({
    researchId: "research-1",
    sourceId: "source-1",
    quote: "  Important quote  ",
  });
  assert.equal(citation.quote, "Important quote");
});

test("citation service: rejects missing source", () => {
  const service = new CitationService(new CitationRepository(), new SourceRepository());
  assert.throws(() => service.create({
    researchId: "research-1",
    sourceId: "missing",
    quote: "Quote",
  }));
});

test("citation service: rejects source from another research", () => {
  const sourceRepository = new SourceRepository();
  sourceRepository.save(sampleSource({ researchId: "different-research" }));
  const service = new CitationService(new CitationRepository(), sourceRepository);
  assert.throws(() => service.create({
    researchId: "research-1",
    sourceId: "source-1",
    quote: "Quote",
  }));
});

test("citation service: lists, gets and deletes citations", () => {
  const sourceRepository = new SourceRepository();
  sourceRepository.save(sampleSource());
  const service = new CitationService(new CitationRepository(), sourceRepository);
  const citation = service.create({
    researchId: "research-1",
    sourceId: "source-1",
    quote: "Quote",
  });
  assert.equal(service.get(citation.id)?.id, citation.id);
  assert.equal(service.listByResearch("research-1").length, 1);
  assert.equal(service.delete(citation.id), true);
});

test("deep search service: completes search and saves sources", async () => {
  const provider: SearchProvider = {
    async search(query) {
      return sampleResult({ query });
    },
  };
  const researchRepository = new ResearchRepository();
  const sourceRepository = new SourceRepository();
  const researches = new ResearchService(researchRepository);
  const sources = new SourceService(sourceRepository);
  const service = new DeepSearchService(
    provider,
    researches,
    sources,
    new SearchRepository(),
  );

  const result = await service.search({ query: "testing", maxSources: 5 });
  const research = researches.get(result.researchId);

  assert.equal(result.result.query, "testing");
  assert.equal(result.result.sources.length, 1);
  assert.equal(research?.status, "completed");
  assert.equal(research?.sourceIds.length, 1);
  assert.equal(sources.listByResearch(result.researchId).length, 1);
});

test("deep search service: respects maxSources", async () => {
  const provider: SearchProvider = {
    async search(query) {
      return sampleResult({
        query,
        sources: [
          { url: "https://example.com/1", title: "One" },
          { url: "https://example.com/2", title: "Two" },
          { url: "https://example.com/3", title: "Three" },
        ],
      });
    },
  };
  const researches = new ResearchService(new ResearchRepository());
  const service = new DeepSearchService(
    provider,
    researches,
    new SourceService(new SourceRepository()),
    new SearchRepository(),
  );

  const result = await service.search({ query: "topic", maxSources: 2 });
  assert.equal(result.result.sources.length, 2);
  assert.equal(researches.get(result.researchId)?.sourceIds.length, 2);
});

test("deep search service: marks research failed when provider rejects", async () => {
  const provider: SearchProvider = {
    async search() {
      throw new Error("Provider unavailable");
    },
  };
  const researches = new ResearchService(new ResearchRepository());
  const service = new DeepSearchService(
    provider,
    researches,
    new SourceService(new SourceRepository()),
    new SearchRepository(),
  );

  await assert.rejects(() => service.search({ query: "topic" }), /Provider unavailable/);
  assert.equal(researches.list()[0]?.status, "failed");
  assert.equal(researches.list()[0]?.error, "Provider unavailable");
});

test("deep search service: rejects blank query before searching", async () => {
  let called = false;
  const provider: SearchProvider = {
    async search() {
      called = true;
      return sampleResult();
    },
  };
  const service = new DeepSearchService(provider);
  await assert.rejects(() => service.search({ query: " " }));
  assert.equal(called, false);
});

test("deep search service: rejects invalid source URL and marks research failed", async () => {
  const provider: SearchProvider = {
    async search(query) {
      return sampleResult({
        query,
        sources: [{ url: "bad-url", title: "Bad source" }],
      });
    },
  };
  const researches = new ResearchService(new ResearchRepository());
  const service = new DeepSearchService(
    provider,
    researches,
    new SourceService(new SourceRepository()),
    new SearchRepository(),
  );

  await assert.rejects(() => service.search({ query: "topic" }));
  assert.equal(researches.list()[0]?.status, "failed");
});

test("job factory produces distinct IDs", () => {
  const first = makeResearchJob("r1", "topic", 1);
  const second = makeResearchJob("r1", "topic", 1);
  assert.notEqual(first.id, second.id);
});
