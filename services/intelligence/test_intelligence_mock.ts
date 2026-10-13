import test from "node:test";
import assert from "node:assert/strict";

import {
    IntelligenceService,
    IntelligenceController,
    InMemoryIntelligenceRepository,
    IntelligenceEventBus,
    validateCreateIntelligence,
    validateUpdateIntelligence,
    defaultIntelligenceConfig,
    validateIntelligenceConfig
} from "./index.js";

test("validates intelligence configuration", () => {
    assert.equal(
        validateIntelligenceConfig(defaultIntelligenceConfig).serviceName,
        "intelligence"
    );

    assert.throws(
        () => validateIntelligenceConfig({
            serviceName: "intelligence",
            maxRecords: 0
        }),
        /maxRecords/
    );
});

test("validates create input", () => {
    const input = validateCreateIntelligence({
        name: " Test ",
        description: "Sample",
        metadata: { source: "mock" }
    });

    assert.equal(input.name, "Test");
    assert.equal(input.description, "Sample");
    assert.deepEqual(input.metadata, { source: "mock" });

    assert.throws(
        () => validateCreateIntelligence({ name: " " }),
        /name is required/
    );
});

test("validates update input", () => {
    assert.deepEqual(
        validateUpdateIntelligence({ name: "Updated", status: "inactive" }),
        { name: "Updated", status: "inactive" }
    );

    assert.throws(
        () => validateUpdateIntelligence({ status: "invalid" as "active" }),
        /status/
    );
});

test("repository creates, reads, updates and deletes records", async () => {
    const repository = new InMemoryIntelligenceRepository();
    const now = new Date().toISOString();

    const record = {
        id: "test-1",
        name: "Test",
        description: "",
        status: "active" as const,
        metadata: {},
        createdAt: now,
        updatedAt: now
    };

    await repository.create(record);
    assert.deepEqual(await repository.getById("test-1"), record);
    assert.equal((await repository.getAll()).length, 1);

    const updated = { ...record, name: "Updated" };
    await repository.update(updated);
    assert.equal((await repository.getById("test-1"))?.name, "Updated");

    assert.equal(await repository.delete("test-1"), true);
    assert.equal(await repository.getById("test-1"), null);
    assert.equal(await repository.delete("missing"), false);
});

test("repository rejects duplicate IDs and missing updates", async () => {
    const repository = new InMemoryIntelligenceRepository();
    const now = new Date().toISOString();

    const record = {
        id: "duplicate",
        name: "Test",
        description: "",
        status: "active" as const,
        metadata: {},
        createdAt: now,
        updatedAt: now
    };

    await repository.create(record);
    await assert.rejects(repository.create(record), /already exists/);
    await assert.rejects(
        repository.update({ ...record, id: "missing" }),
        /not found/
    );
});

test("service creates, reads, updates and deletes intelligence", async () => {
    const service = new IntelligenceService();

    const created = await service.create({
        name: "Example",
        description: "Mock record",
        metadata: { source: "test" }
    });

    assert.ok(created.id);
    assert.equal(created.name, "Example");
    assert.equal(created.status, "active");

    assert.equal((await service.getById(created.id))?.name, "Example");
    assert.equal((await service.getAll()).length, 1);

    const updated = await service.update(created.id, {
        name: "Updated",
        status: "inactive"
    });

    assert.equal(updated.name, "Updated");
    assert.equal(updated.status, "inactive");

    assert.equal(await service.delete(created.id), true);
    assert.equal(await service.getById(created.id), null);
    assert.equal(await service.delete(created.id), false);
});

test("service rejects invalid IDs and missing records", async () => {
    const service = new IntelligenceService();

    await assert.rejects(service.getById(""), /id is required/);
    await assert.rejects(service.delete(""), /id is required/);
    await assert.rejects(
        service.update("missing", { name: "Updated" }),
        /not found/
    );
});

test("service emits create, update and delete events", async () => {
    const events = new IntelligenceEventBus();
    const service = new IntelligenceService(
        new InMemoryIntelligenceRepository(),
        events
    );

    const received: string[] = [];

    events.on("intelligence.created", event => {
        received.push(event.type);
    });
    events.on("intelligence.updated", event => {
        received.push(event.type);
    });
    events.on("intelligence.deleted", event => {
        received.push(event.type);
    });

    const record = await service.create({ name: "Event test" });
    await service.update(record.id, { name: "Updated event test" });
    await service.delete(record.id);

    assert.deepEqual(received, [
        "intelligence.created",
        "intelligence.updated",
        "intelligence.deleted"
    ]);
});

test("event bus unsubscribe stops receiving events", async () => {
    const events = new IntelligenceEventBus();
    let count = 0;

    const unsubscribe = events.on("intelligence.deleted", () => {
        count++;
    });

    unsubscribe();

    await events.emit({
        type: "intelligence.deleted",
        id: "test",
        timestamp: new Date().toISOString()
    });

    assert.equal(count, 0);
});

test("controller delegates create, get, update and delete", async () => {
    const controller = new IntelligenceController(
        new IntelligenceService()
    );

    const created = await controller.create({ name: "Controller test" });

    assert.equal((await controller.getById(created.id))?.name, "Controller test");
    assert.equal((await controller.getAll()).length, 1);

    const updated = await controller.update(created.id, {
        name: "Controller updated"
    });

    assert.equal(updated.name, "Controller updated");
    assert.equal(await controller.delete(created.id), true);
});

test("metadata is cloned to prevent external mutation", async () => {
    const service = new IntelligenceService();
    const metadata = { nested: { value: 1 } };

    const created = await service.create({
        name: "Clone test",
        metadata
    });

    metadata.nested.value = 99;
    assert.equal(
        (created.metadata["nested"] as { value: number }).value,
        1
    );

    const fetched = await service.getById(created.id);
    assert.ok(fetched);

    (fetched.metadata["nested"] as { value: number }).value = 50;

    const fetchedAgain = await service.getById(created.id);
    assert.equal(
        (fetchedAgain?.metadata["nested"] as { value: number }).value,
        1
    );
});
