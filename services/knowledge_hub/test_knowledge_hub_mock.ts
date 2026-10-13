import test from "node:test";
import assert from "node:assert/strict";

import {
    CollectionController,
    DocumentController,
    KnowledgeController,
    SearchController,
    SourceController,
    SyncController,
    CollectionRepository,
    DocumentRepository,
    SourceRepository,
    ChunkRepository,
    JobManager,
    DocumentService,
    IndexingService,
    IngestionService,
    KnowledgeService,
    SearchService,
    SyncService,
    DocumentEventBus,
    IndexingEventBus,
    IngestionEventBus,
    SearchEventBus,
    validateCollection,
    validateDocument,
    validateSearchInput,
    validateSource,
    validateConfig,
    defaultKnowledgeHubConfig
} from "./index.js";

test("config validation accepts valid configuration", () => {
    assert.deepEqual(
        validateConfig(defaultKnowledgeHubConfig),
        defaultKnowledgeHubConfig
    );

    assert.throws(
        () => validateConfig({
            maxDocuments: 0,
            maxChunksPerDocument: 10,
            chunkSize: 100
        }),
        /positive integer/
    );
});

test("collection schema validates and trims input", () => {
    const result = validateCollection({
        name: "  Engineering  ",
        description: "Docs"
    });

    assert.equal(result.name, "Engineering");
    assert.equal(result.description, "Docs");

    assert.throws(
        () => validateCollection({ name: " " }),
        /name is required/
    );
});

test("document schema validates input", () => {
    const result = validateDocument({
        collectionId: "collection-1",
        title: "  Guide ",
        content: "Knowledge content"
    });

    assert.equal(result.title, "Guide");
    assert.deepEqual(result.metadata, {});

    assert.throws(
        () => validateDocument({
            collectionId: "",
            title: "Guide",
            content: "Content"
        }),
        /collectionId/
    );

    assert.throws(
        () => validateDocument({
            collectionId: "collection-1",
            title: " ",
            content: "Content"
        }),
        /title/
    );
});

test("search schema validates query and limit", () => {
    assert.deepEqual(
        validateSearchInput({ query: "  typescript ", limit: 5 }),
        { query: "typescript", limit: 5 }
    );

    assert.throws(
        () => validateSearchInput({ query: " " }),
        /query/
    );

    assert.throws(
        () => validateSearchInput({ query: "test", limit: 101 }),
        /between 1 and 100/
    );
});

test("source schema validates required fields", () => {
    assert.deepEqual(
        validateSource({
            name: " Web Source ",
            type: " url ",
            uri: " https://example.com "
        }),
        {
            name: "Web Source",
            type: "url",
            uri: "https://example.com"
        }
    );

    assert.throws(
        () => validateSource({ name: "", type: "url", uri: "https://example.com" }),
        /name/
    );
});

test("collection repository supports CRUD operations", async () => {
    const repository = new CollectionRepository();
    const timestamp = new Date().toISOString();

    const collection = {
        id: "collection-1",
        name: "Docs",
        description: "",
        metadata: {},
        createdAt: timestamp,
        updatedAt: timestamp
    };

    await repository.create(collection);

    assert.equal((await repository.getById(collection.id))?.name, "Docs");
    assert.equal((await repository.getAll()).length, 1);

    await repository.update({ ...collection, name: "Updated" });
    assert.equal((await repository.getById(collection.id))?.name, "Updated");

    assert.equal(await repository.delete(collection.id), true);
    assert.equal(await repository.getById(collection.id), null);
});

test("document repository supports CRUD and collection filtering", async () => {
    const repository = new DocumentRepository();
    const timestamp = new Date().toISOString();

    const document = {
        id: "document-1",
        collectionId: "collection-1",
        title: "Guide",
        content: "Hello world",
        status: "active" as const,
        metadata: {},
        createdAt: timestamp,
        updatedAt: timestamp
    };

    await repository.create(document);

    assert.equal((await repository.getById(document.id))?.title, "Guide");
    assert.equal((await repository.getByCollection("collection-1")).length, 1);
    assert.equal((await repository.getByCollection("missing")).length, 0);

    await repository.update({ ...document, title: "Updated guide" });
    assert.equal((await repository.getById(document.id))?.title, "Updated guide");

    assert.equal(await repository.delete(document.id), true);
});

test("source repository stores and retrieves sources", async () => {
    const repository = new SourceRepository();
    const timestamp = new Date().toISOString();

    const source = {
        id: "source-1",
        name: "Website",
        type: "url",
        uri: "https://example.com",
        status: "active" as const,
        createdAt: timestamp,
        updatedAt: timestamp
    };

    await repository.create(source);

    assert.equal((await repository.getById(source.id))?.name, "Website");
    assert.equal((await repository.getAll()).length, 1);

    assert.equal(await repository.delete(source.id), true);
});

test("chunk repository orders chunks and deletes by document", async () => {
    const repository = new ChunkRepository();

    await repository.create({
        id: "chunk-2",
        documentId: "document-1",
        content: "second",
        index: 1,
        metadata: {}
    });

    await repository.create({
        id: "chunk-1",
        documentId: "document-1",
        content: "first",
        index: 0,
        metadata: {}
    });

    const chunks = await repository.getByDocument("document-1");

    assert.deepEqual(chunks.map(chunk => chunk.content), ["first", "second"]);
    assert.equal(await repository.deleteByDocument("document-1"), 2);
    assert.equal((await repository.getByDocument("document-1")).length, 0);
});

test("job manager creates and updates jobs", async () => {
    const manager = new JobManager();
    const job = await manager.create("indexing", { documentId: "doc-1" });

    assert.equal(job.status, "pending");
    assert.equal(job.type, "indexing");

    const updated = await manager.updateStatus(job.id, "completed");
    assert.equal(updated.status, "completed");

    assert.equal((await manager.get(job.id))?.status, "completed");
    assert.equal((await manager.list()).length, 1);

    await assert.rejects(
        manager.updateStatus("missing", "failed"),
        /Job not found/
    );
});

test("document service creates, reads, updates and deletes documents", async () => {
    const collections = new CollectionRepository();
    const documents = new DocumentRepository();
    const timestamp = new Date().toISOString();

    await collections.create({
        id: "collection-1",
        name: "Docs",
        description: "",
        metadata: {},
        createdAt: timestamp,
        updatedAt: timestamp
    });

    const service = new DocumentService(
        documents,
        collections,
        new DocumentEventBus()
    );

    const created = await service.create({
        collectionId: "collection-1",
        title: "First document",
        content: "Hello knowledge hub"
    });

    assert.equal(created.title, "First document");
    assert.equal((await service.getAll()).length, 1);

    const updated = await service.update(created.id, {
        title: "Updated document",
        content: "Updated content"
    });

    assert.equal(updated.title, "Updated document");
    assert.equal((await service.getById(created.id))?.content, "Updated content");

    assert.equal(await service.delete(created.id), true);
    assert.equal(await service.getById(created.id), null);
});

test("document service rejects documents for missing collections", async () => {
    const service = new DocumentService(
        new DocumentRepository(),
        new CollectionRepository()
    );

    await assert.rejects(
        service.create({
            collectionId: "missing",
            title: "Guide",
            content: "Content"
        }),
        /Collection not found/
    );
});

test("indexing service splits document content into chunks", async () => {
    const documents = new DocumentRepository();
    const chunks = new ChunkRepository();
    const timestamp = new Date().toISOString();

    await documents.create({
        id: "document-1",
        collectionId: "collection-1",
        title: "Index me",
        content: "A".repeat(2100),
        status: "active",
        metadata: {},
        createdAt: timestamp,
        updatedAt: timestamp
    });

    const service = new IndexingService(documents, chunks, new IndexingEventBus());
    const indexed = await service.index("document-1");

    assert.equal(indexed.length, 3);
    assert.equal(indexed[0].index, 0);
    assert.equal(indexed[0].content.length, 1000);
    assert.equal(indexed[2].content.length, 100);

    await assert.rejects(service.index("missing"), /Document not found/);
});

test("ingestion service creates a source and ingests it into a collection", async () => {
    const sources = new SourceRepository();
    const documents = new DocumentRepository();
    const timestamp = new Date().toISOString();

    await sources.create({
        id: "source-1",
        name: "Example source",
        type: "url",
        uri: "https://example.com",
        status: "active",
        createdAt: timestamp,
        updatedAt: timestamp
    });

    const service = new IngestionService(
        sources,
        documents,
        new IngestionEventBus()
    );

    const document = await service.ingest("source-1", "collection-1");

    assert.equal(document.title, "Example source");
    assert.equal(document.collectionId, "collection-1");
    assert.equal(document.metadata["sourceId"], "source-1");

    await assert.rejects(
        service.ingest("missing", "collection-1"),
        /Source not found/
    );
});

test("search service returns documents matching all query terms", async () => {
    const documents = new DocumentRepository();
    const timestamp = new Date().toISOString();

    await documents.create({
        id: "doc-1",
        collectionId: "collection-1",
        title: "TypeScript Guide",
        content: "Learn strict TypeScript testing",
        status: "active",
        metadata: {},
        createdAt: timestamp,
        updatedAt: timestamp
    });

    await documents.create({
        id: "doc-2",
        collectionId: "collection-2",
        title: "JavaScript Guide",
        content: "Learn JavaScript basics",
        status: "active",
        metadata: {},
        createdAt: timestamp,
        updatedAt: timestamp
    });

    const service = new SearchService(documents, new SearchEventBus());

    const results = await service.search({ query: "typescript strict" });
    assert.equal(results.length, 1);
    assert.equal(results[0].id, "doc-1");

    const filtered = await service.search({
        query: "guide",
        collectionId: "collection-2"
    });

    assert.equal(filtered.length, 1);
    assert.equal(filtered[0].id, "doc-2");
});

test("sync service updates source timestamp", async () => {
    const sources = new SourceRepository();
    const timestamp = new Date().toISOString();

    await sources.create({
        id: "source-1",
        name: "Website",
        type: "url",
        uri: "https://example.com",
        status: "active",
        createdAt: timestamp,
        updatedAt: timestamp
    });

    const service = new SyncService(sources);
    const synced = await service.sync("source-1");

    assert.equal(synced.id, "source-1");
    assert.ok(synced.updatedAt);

    await assert.rejects(service.sync("missing"), /Source not found/);
});

test("knowledge service manages jobs", async () => {
    const service = new KnowledgeService(new JobManager());

    const job = await service.createJob("embedding", {
        documentId: "document-1"
    });

    assert.equal((await service.getJob(job.id))?.type, "embedding");
    assert.equal((await service.listJobs()).length, 1);
});

test("document event bus delivers events and supports unsubscribe", async () => {
    const events = new DocumentEventBus();
    let count = 0;

    const unsubscribe = events.on(() => {
        count++;
    });

    await events.emit({
        type: "document.created",
        documentId: "doc-1",
        timestamp: new Date().toISOString()
    });

    unsubscribe();

    await events.emit({
        type: "document.deleted",
        documentId: "doc-1",
        timestamp: new Date().toISOString()
    });

    assert.equal(count, 1);
});

test("indexing event bus delivers events", async () => {
    const events = new IndexingEventBus();
    const received: string[] = [];

    events.on(event => {
        received.push(event.type);
    });

    await events.emit({
        type: "indexing.started",
        documentId: "doc-1",
        timestamp: new Date().toISOString()
    });

    assert.deepEqual(received, ["indexing.started"]);
});

test("ingestion event bus delivers events", async () => {
    const events = new IngestionEventBus();
    let count = 0;

    events.on(() => {
        count++;
    });

    await events.emit({
        type: "ingestion.completed",
        sourceId: "source-1",
        timestamp: new Date().toISOString()
    });

    assert.equal(count, 1);
});

test("search event bus delivers events", async () => {
    const events = new SearchEventBus();
    let resultCount = -1;

    events.on(event => {
        resultCount = event.resultCount;
    });

    await events.emit({
        query: "test",
        resultCount: 2,
        timestamp: new Date().toISOString()
    });

    assert.equal(resultCount, 2);
});

test("controllers expose their basic operations", async () => {
    const collectionController = new CollectionController();
    const collection = await collectionController.create({ name: "Controller docs" });

    assert.equal((await collectionController.getById(collection.id))?.name, "Controller docs");
    assert.equal((await collectionController.getAll()).length, 1);

    const documentController = new DocumentController();
    await assert.rejects(
        documentController.create({
            collectionId: collection.id,
            title: "Controller document",
            content: "Content"
        }),
        /Collection not found/
    );

    const knowledgeController = new KnowledgeController();
    const job = await knowledgeController.createJob("sync", { sourceId: "source-1" });
    assert.equal((await knowledgeController.getJob(job.id))?.type, "sync");
    assert.equal((await knowledgeController.listJobs()).length, 1);

    const searchController = new SearchController();
    assert.deepEqual(await searchController.search({ query: "no results" }), []);

    const sourceController = new SourceController();
    const source = await sourceController.create({
        name: "Controller source",
        type: "url",
        uri: "https://example.com"
    });
    assert.equal(source.name, "Controller source");
    assert.equal((await sourceController.getAll()).length, 1);

    const syncController = new SyncController(
        new SyncService(new SourceRepository())
    );
    await assert.rejects(syncController.sync("missing"), /Source not found/);
});

test("repositories return cloned data", async () => {
    const repository = new CollectionRepository();
    const timestamp = new Date().toISOString();

    await repository.create({
        id: "clone-test",
        name: "Original",
        description: "",
        metadata: { nested: { value: 1 } },
        createdAt: timestamp,
        updatedAt: timestamp
    });

    const fetched = await repository.getById("clone-test");
    assert.ok(fetched);

    (fetched.metadata["nested"] as { value: number }).value = 99;

    const fetchedAgain = await repository.getById("clone-test");
    assert.equal(
        (fetchedAgain?.metadata["nested"] as { value: number }).value,
        1
    );
});
