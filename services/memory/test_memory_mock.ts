import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MemoryRepository,
  MemoryService,
  MemoryController,
  getMemoryConfig,
} from "./index.js";

test("config returns expected defaults", () => {
  const config = getMemoryConfig();
  assert.equal(config.enabled, true);
  assert.equal(config.maxEntries, 1000);
});

test("repository creates and retrieves memories", () => {
  const repo = new MemoryRepository();
  const item = repo.create({ key: "theme", value: "dark" });

  assert.ok(item.id);
  assert.equal(repo.getById(item.id)?.value, "dark");
  assert.equal(repo.getByKey("theme")?.id, item.id);
  assert.equal(repo.count(), 1);
});

test("repository handles missing records", () => {
  const repo = new MemoryRepository();

  assert.equal(repo.getById("missing"), undefined);
  assert.equal(repo.getByKey("missing"), undefined);
  assert.equal(repo.update("missing", { value: 1 }), undefined);
  assert.equal(repo.delete("missing"), false);
});

test("repository updates values and merges metadata", () => {
  const repo = new MemoryRepository();
  const item = repo.create({
    key: "profile",
    value: "old",
    metadata: { source: "test", version: 1 },
  });

  const updated = repo.update(item.id, {
    value: "new",
    metadata: { version: 2 },
  });

  assert.equal(updated?.value, "new");
  assert.deepEqual(updated?.metadata, { source: "test", version: 2 });
});

test("repository deletes and clears records", () => {
  const repo = new MemoryRepository();
  const item = repo.create({ key: "temporary", value: true });

  assert.equal(repo.delete(item.id), true);
  assert.equal(repo.getById(item.id), undefined);

  repo.create({ key: "one", value: 1 });
  repo.clear();

  assert.equal(repo.count(), 0);
  assert.deepEqual(repo.list(), []);
});

test("repository clones returned data", () => {
  const repo = new MemoryRepository();
  const item = repo.create({
    key: "settings",
    value: { enabled: true },
    metadata: { tags: ["original"] },
  });

  (item.value as { enabled: boolean }).enabled = false;
  item.metadata.tags = ["changed"];

  const stored = repo.getById(item.id);
  assert.deepEqual(stored?.value, { enabled: true });
  assert.deepEqual(stored?.metadata, { tags: ["original"] });
});

test("service supports create, read, update, and delete", () => {
  const service = new MemoryService();
  const item = service.create({ key: "language", value: "TypeScript" });

  assert.equal(service.get(item.id)?.value, "TypeScript");
  assert.equal(service.getByKey("language")?.id, item.id);
  assert.equal(
    service.update(item.id, { value: "JavaScript" })?.value,
    "JavaScript",
  );
  assert.equal(service.delete(item.id), true);
  assert.equal(service.get(item.id), undefined);
  assert.equal(service.delete(item.id), false);
});

test("service emits lifecycle events", () => {
  const service = new MemoryService();
  const events: string[] = [];

  service.subscribe((event) => events.push(event.type));

  const item = service.create({ key: "event", value: 1 });
  service.update(item.id, { value: 2 });
  service.delete(item.id);

  assert.deepEqual(events, [
    "memory.created",
    "memory.updated",
    "memory.deleted",
  ]);
});

test("service unsubscribe stops notifications", () => {
  const service = new MemoryService();
  const events: string[] = [];
  const unsubscribe = service.subscribe((event) => events.push(event.type));

  service.create({ key: "first", value: 1 });
  unsubscribe();
  service.create({ key: "second", value: 2 });

  assert.deepEqual(events, ["memory.created"]);
});

test("service shares a repository between instances", () => {
  const repo = new MemoryRepository();
  const first = new MemoryService(repo);
  const second = new MemoryService(repo);

  const item = first.create({ key: "shared", value: 42 });

  assert.equal(second.get(item.id)?.value, 42);
  assert.equal(second.count(), 1);
});

test("controller supports CRUD operations", () => {
  const controller = new MemoryController();
  const item = controller.create({ key: "controller", value: 1 });

  assert.equal(controller.get(item.id)?.value, 1);
  assert.equal(controller.getByKey("controller")?.id, item.id);
  assert.equal(controller.list().length, 1);
  assert.equal(controller.count(), 1);
  assert.equal(controller.update(item.id, { value: 2 })?.value, 2);
  assert.equal(controller.delete(item.id), true);
  assert.equal(controller.get(item.id), undefined);
});

test("controller handles missing records", () => {
  const controller = new MemoryController();

  assert.equal(controller.get("missing"), undefined);
  assert.equal(controller.getByKey("missing"), undefined);
  assert.equal(controller.update("missing", { value: 1 }), undefined);
  assert.equal(controller.delete("missing"), false);
});

test("repository assigns unique IDs", () => {
  const repo = new MemoryRepository();
  const first = repo.create({ key: "same", value: 1 });
  const second = repo.create({ key: "same", value: 2 });

  assert.notEqual(first.id, second.id);
  assert.equal(repo.count(), 2);
});

test("updating without metadata preserves existing metadata", () => {
  const repo = new MemoryRepository();
  const item = repo.create({
    key: "metadata",
    value: 1,
    metadata: { owner: "test" },
  });

  assert.deepEqual(
    repo.update(item.id, { value: 2 })?.metadata,
    { owner: "test" },
  );
});

test("service lists all memories", () => {
  const service = new MemoryService();
  service.create({ key: "first", value: 1 });
  service.create({ key: "second", value: 2 });

  assert.deepEqual(
    service.list().map((item) => item.key),
    ["first", "second"],
  );
});
