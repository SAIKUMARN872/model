import test from "node:test";
import assert from "node:assert/strict";

import {
  ExecutionService,
  ExecutionRepository,
  ExecutionLifecycle,
  ExecutionWorker,
  ExecutionController,
  createExecutionRoutes,
  executionEvents,
  createExecutionRecord,
  validateCreateExecutionInput,
  toExecutionResult,
  assertValidTransition,
  isTerminalStatus,
  executionConfig,
  validateExecutionConfig
} from "./index.js";

let sequence = 0;

function createService() {
  sequence = 0;
  return new ExecutionService(
    new ExecutionRepository(),
    () => `execution-${++sequence}`
  );
}

test("validateCreateExecutionInput accepts a valid request", () => {
  const input = validateCreateExecutionInput({
    task: "send-email",
    input: { to: "test@example.com" },
    metadata: { source: "test" },
    maxAttempts: 2
  });

  assert.equal(input.task, "send-email");
  assert.equal(input.input?.to, "test@example.com");
  assert.equal(input.maxAttempts, 2);
});

test("validateCreateExecutionInput trims task name", () => {
  assert.equal(
    validateCreateExecutionInput({ task: "  task-a  " }).task,
    "task-a"
  );
});

test("validateCreateExecutionInput rejects null", () => {
  assert.throws(() => validateCreateExecutionInput(null), TypeError);
});

test("validateCreateExecutionInput rejects arrays", () => {
  assert.throws(() => validateCreateExecutionInput([]), TypeError);
});

test("validateCreateExecutionInput rejects missing task", () => {
  assert.throws(() => validateCreateExecutionInput({}), /task/);
});

test("validateCreateExecutionInput rejects blank task", () => {
  assert.throws(() => validateCreateExecutionInput({ task: " " }), /task/);
});

test("validateCreateExecutionInput rejects non-string task", () => {
  assert.throws(() => validateCreateExecutionInput({ task: 123 }), /task/);
});

test("validateCreateExecutionInput rejects array input", () => {
  assert.throws(
    () => validateCreateExecutionInput({ task: "a", input: [] }),
    /input/
  );
});

test("validateCreateExecutionInput rejects null input", () => {
  assert.throws(
    () => validateCreateExecutionInput({ task: "a", input: null }),
    /input/
  );
});

test("validateCreateExecutionInput rejects invalid metadata", () => {
  assert.throws(
    () => validateCreateExecutionInput({ task: "a", metadata: [] }),
    /metadata/
  );
});

test("validateCreateExecutionInput rejects invalid maxAttempts", () => {
  assert.throws(
    () => validateCreateExecutionInput({ task: "a", maxAttempts: 0 }),
    /maxAttempts/
  );
});

test("createExecutionRecord creates queued record", () => {
  const now = new Date("2025-01-01T00:00:00.000Z");
  const record = createExecutionRecord("id-1", { task: "task-a" }, now);

  assert.equal(record.id, "id-1");
  assert.equal(record.status, "queued");
  assert.equal(record.attempts, 0);
  assert.equal(record.maxAttempts, 3);
  assert.equal(record.createdAt.toISOString(), now.toISOString());
});

test("createExecutionRecord clones input and metadata", () => {
  const input = { nested: { value: 1 } };
  const metadata = { owner: "unit-test" };
  const record = createExecutionRecord("id-2", {
    task: "task-a",
    input,
    metadata
  });

  input.nested.value = 99;
  metadata.owner = "changed";

  assert.deepEqual(record.input, { nested: { value: 1 } });
  assert.deepEqual(record.metadata, { owner: "unit-test" });
});

test("isTerminalStatus recognizes terminal states", () => {
  assert.equal(isTerminalStatus("succeeded"), true);
  assert.equal(isTerminalStatus("failed"), true);
  assert.equal(isTerminalStatus("cancelled"), true);
  assert.equal(isTerminalStatus("queued"), false);
  assert.equal(isTerminalStatus("running"), false);
});

test("assertValidTransition accepts valid transitions", () => {
  assert.doesNotThrow(() => assertValidTransition("queued", "running"));
  assert.doesNotThrow(() => assertValidTransition("running", "succeeded"));
  assert.doesNotThrow(() => assertValidTransition("running", "failed"));
  assert.doesNotThrow(() => assertValidTransition("failed", "queued"));
});

test("assertValidTransition rejects invalid transitions", () => {
  assert.throws(
    () => assertValidTransition("succeeded", "running"),
    /Invalid execution transition/
  );
});

test("repository creates and retrieves an execution", async () => {
  const repository = new ExecutionRepository();
  const record = createExecutionRecord("repo-1", { task: "task-a" });

  await repository.create(record);

  const found = await repository.getById("repo-1");
  assert.equal(found?.task, "task-a");
  assert.equal(found?.status, "queued");
});

test("repository rejects duplicate IDs", async () => {
  const repository = new ExecutionRepository();
  const record = createExecutionRecord("duplicate", { task: "task-a" });

  await repository.create(record);

  await assert.rejects(
    repository.create(record),
    /already exists/
  );
});

test("repository returns undefined for unknown ID", async () => {
  const repository = new ExecutionRepository();

  assert.equal(await repository.getById("missing"), undefined);
});

test("repository updates records", async () => {
  const repository = new ExecutionRepository();
  await repository.create(
    createExecutionRecord("repo-2", { task: "task-a" })
  );

  const updated = await repository.update("repo-2", {
    status: "running",
    attempts: 1
  });

  assert.equal(updated.status, "running");
  assert.equal(updated.attempts, 1);
});

test("repository rejects update for missing record", async () => {
  const repository = new ExecutionRepository();

  await assert.rejects(
    repository.update("missing", { status: "running" }),
    /not found/
  );
});

test("repository deletes a record", async () => {
  const repository = new ExecutionRepository();
  await repository.create(
    createExecutionRecord("repo-3", { task: "task-a" })
  );

  assert.equal(await repository.delete("repo-3"), true);
  assert.equal(await repository.getById("repo-3"), undefined);
});

test("repository returns false deleting a missing record", async () => {
  const repository = new ExecutionRepository();

  assert.equal(await repository.delete("missing"), false);
});

test("repository filters and paginates records", async () => {
  const repository = new ExecutionRepository();

  await repository.create(
    createExecutionRecord("list-1", { task: "alpha" })
  );
  await repository.create(
    createExecutionRecord("list-2", { task: "beta" })
  );
  await repository.create(
    createExecutionRecord("list-3", { task: "alpha" })
  );

  const filtered = await repository.list({ task: "alpha" });
  assert.equal(filtered.length, 2);

  const page = await repository.list({ limit: 1, offset: 1 });
  assert.equal(page.length, 1);
});

test("repository counts records by status", async () => {
  const repository = new ExecutionRepository();

  await repository.create(
    createExecutionRecord("count-1", { task: "alpha" })
  );
  await repository.create(
    createExecutionRecord("count-2", { task: "beta" })
  );

  await repository.update("count-2", { status: "running" });

  assert.equal(await repository.count(), 2);
  assert.equal(await repository.count("queued"), 1);
  assert.equal(await repository.count("running"), 1);
});

test("repository clear removes all records", async () => {
  const repository = new ExecutionRepository();
  await repository.create(
    createExecutionRecord("clear-1", { task: "alpha" })
  );

  await repository.clear();

  assert.equal(await repository.count(), 0);
});

test("service creates executions with deterministic IDs", async () => {
  const service = createService();

  const execution = await service.create({ task: "task-a" });

  assert.equal(execution.id, "execution-1");
  assert.equal(execution.status, "queued");
});

test("service rejects invalid creation input", async () => {
  const service = createService();

  await assert.rejects(
    service.create({ task: "" }),
    /task/
  );
});

test("service gets an execution", async () => {
  const service = createService();
  const created = await service.create({ task: "task-a" });

  assert.equal((await service.get(created.id)).id, created.id);
});

test("service rejects getting an unknown execution", async () => {
  const service = createService();

  await assert.rejects(service.get("missing"), /not found/);
});

test("service lists executions", async () => {
  const service = createService();

  await service.create({ task: "alpha" });
  await service.create({ task: "beta" });

  assert.equal((await service.list()).length, 2);
  assert.equal((await service.list({ task: "alpha" })).length, 1);
});

test("service registers and unregisters handlers", () => {
  const service = createService();
  const handler = () => "ok";

  service.registerHandler("task-a", handler);
  assert.equal(service.unregisterHandler("task-a"), true);
  assert.equal(service.unregisterHandler("task-a"), false);
});

test("service rejects blank handler names", () => {
  const service = createService();

  assert.throws(
    () => service.registerHandler(" ", () => null),
    /Task name/
  );
});

test("service executes a registered handler", async () => {
  const service = createService();

  service.registerHandler("sum", (input) => {
    return Number(input.a) + Number(input.b);
  });

  const execution = await service.create({
    task: "sum",
    input: { a: 2, b: 3 }
  });

  const result = await service.execute(execution.id);

  assert.equal(result.status, "succeeded");
  assert.equal(result.result, 5);
  assert.equal(result.attempts, 1);
  assert.ok(result.startedAt);
  assert.ok(result.completedAt);
});

test("service records handler errors as failed executions", async () => {
  const service = createService();
  service.registerHandler("fail", () => {
    throw new Error("expected failure");
  });

  const execution = await service.create({ task: "fail" });
  const result = await service.execute(execution.id);

  assert.equal(result.status, "failed");
  assert.equal(result.error, "expected failure");
});

test("service fails when no handler is registered", async () => {
  const service = createService();
  const execution = await service.create({ task: "unknown-task" });

  const result = await service.execute(execution.id);

  assert.equal(result.status, "failed");
  assert.match(result.error ?? "", /No handler registered/);
});

test("service rejects executing a non-queued execution", async () => {
  const service = createService();
  service.registerHandler("task-a", () => "done");

  const execution = await service.create({ task: "task-a" });
  await service.execute(execution.id);

  await assert.rejects(
    service.execute(execution.id),
    /Cannot execute/
  );
});

test("service retries a failed execution", async () => {
  const service = createService();
  let calls = 0;

  service.registerHandler("flaky", () => {
    calls += 1;
    if (calls === 1) throw new Error("temporary");
    return "recovered";
  });

  const execution = await service.create({
    task: "flaky",
    maxAttempts: 2
  });

  assert.equal((await service.execute(execution.id)).status, "failed");
  assert.equal((await service.retry(execution.id)).status, "queued");

  const result = await service.execute(execution.id);

  assert.equal(result.status, "succeeded");
  assert.equal(result.result, "recovered");
  assert.equal(result.attempts, 2);
});

test("service rejects retrying a queued execution", async () => {
  const service = createService();
  const execution = await service.create({ task: "task-a" });

  await assert.rejects(service.retry(execution.id), /Only failed/);
});

test("service rejects retry after max attempts", async () => {
  const service = createService();
  service.registerHandler("always-fail", () => {
    throw new Error("failure");
  });

  const execution = await service.create({
    task: "always-fail",
    maxAttempts: 1
  });

  await service.execute(execution.id);

  await assert.rejects(
    service.retry(execution.id),
    /Maximum execution attempts/
  );
});

test("service cancels a queued execution", async () => {
  const service = createService();
  const execution = await service.create({ task: "task-a" });

  const cancelled = await service.cancel(execution.id);

  assert.equal(cancelled.status, "cancelled");
  assert.ok(cancelled.completedAt);
});

test("service rejects cancelling a succeeded execution", async () => {
  const service = createService();
  service.registerHandler("task-a", () => "done");

  const execution = await service.create({ task: "task-a" });
  await service.execute(execution.id);

  await assert.rejects(
    service.cancel(execution.id),
    /Invalid execution transition/
  );
});

test("service removes a non-running execution", async () => {
  const service = createService();
  const execution = await service.create({ task: "task-a" });

  assert.equal(await service.remove(execution.id), true);
  await assert.rejects(service.get(execution.id), /not found/);
});

test("service rejects removing a running execution", async () => {
  const service = createService();
  const execution = await service.create({ task: "task-a" });

  await service.lifecycle.start(execution.id);

  await assert.rejects(
    service.remove(execution.id),
    /Cannot remove a running/
  );
});

test("lifecycle starts an execution", async () => {
  const repository = new ExecutionRepository();
  const lifecycle = new ExecutionLifecycle(repository);

  await repository.create(
    createExecutionRecord("life-1", { task: "task-a" })
  );

  const started = await lifecycle.start("life-1");

  assert.equal(started.status, "running");
  assert.equal(started.attempts, 1);
});

test("lifecycle succeeds an execution", async () => {
  const repository = new ExecutionRepository();
  const lifecycle = new ExecutionLifecycle(repository);

  await repository.create(
    createExecutionRecord("life-2", { task: "task-a" })
  );
  await lifecycle.start("life-2");

  const succeeded = await lifecycle.succeed("life-2", { ok: true });

  assert.equal(succeeded.status, "succeeded");
  assert.deepEqual(succeeded.result, { ok: true });
});

test("lifecycle fails an execution", async () => {
  const repository = new ExecutionRepository();
  const lifecycle = new ExecutionLifecycle(repository);

  await repository.create(
    createExecutionRecord("life-3", { task: "task-a" })
  );
  await lifecycle.start("life-3");

  const failed = await lifecycle.fail("life-3", "problem");

  assert.equal(failed.status, "failed");
  assert.equal(failed.error, "problem");
});

test("lifecycle rejects invalid transition", async () => {
  const repository = new ExecutionRepository();
  const lifecycle = new ExecutionLifecycle(repository);

  await repository.create(
    createExecutionRecord("life-4", { task: "task-a" })
  );

  await assert.rejects(
    lifecycle.succeed("life-4", "result"),
    /Invalid execution transition/
  );
});

test("toExecutionResult maps an execution record", () => {
  const record = createExecutionRecord("result-1", { task: "task-a" });
  const result = toExecutionResult(record);

  assert.equal(result.id, "result-1");
  assert.equal(result.status, "queued");
  assert.equal(result.durationMs, undefined);
});

test("toExecutionResult calculates duration", () => {
  const record = createExecutionRecord("result-2", { task: "task-a" });
  record.startedAt = new Date("2025-01-01T00:00:00.000Z");
  record.completedAt = new Date("2025-01-01T00:00:02.000Z");
  record.status = "succeeded";

  assert.equal(toExecutionResult(record).durationMs, 2000);
});

test("execution config has valid defaults", () => {
  assert.equal(executionConfig.defaultMaxAttempts, 3);
  assert.equal(executionConfig.maxConcurrent, 5);
  assert.doesNotThrow(() => validateExecutionConfig({ ...executionConfig }));
});

test("execution config rejects invalid values", () => {
  assert.throws(
    () =>
      validateExecutionConfig({
        defaultMaxAttempts: 0,
        maxConcurrent: 1,
        retryDelayMs: 0,
        retentionMs: 100
      }),
    /at least 1/
  );
});

test("worker processes queued executions", async () => {
  const service = createService();
  service.registerHandler("echo", (input) => input.message);

  await service.create({
    task: "echo",
    input: { message: "hello" }
  });
  await service.create({
    task: "echo",
    input: { message: "world" }
  });

  const worker = new ExecutionWorker(service, 2);
  const processed = await worker.processQueued();

  assert.equal(processed.length, 2);
  assert.ok(processed.every((item) => item.status === "succeeded"));
});

test("worker runOnce returns processed count", async () => {
  const service = createService();
  service.registerHandler("echo", () => "ok");
  await service.create({ task: "echo" });

  const worker = new ExecutionWorker(service);

  assert.equal(await worker.runOnce(), 1);
  assert.equal(await worker.runOnce(), 0);
});

test("worker rejects invalid concurrency", () => {
  const service = createService();

  assert.throws(
    () => new ExecutionWorker(service, 0),
    /concurrency/
  );
});

test("worker processes a specific execution", async () => {
  const service = createService();
  service.registerHandler("echo", () => "ok");
  const execution = await service.create({ task: "echo" });

  const worker = new ExecutionWorker(service);
  const result = await worker.process(execution.id);

  assert.equal(result.status, "succeeded");
});

test("controller creates an execution", async () => {
  const service = createService();
  const controller = new ExecutionController(service);

  const response = await controller.create({
    body: { task: "task-a" }
  });

  assert.equal(response.statusCode, 201);
});

test("controller returns 400 for invalid create request", async () => {
  const controller = new ExecutionController(createService());

  const response = await controller.create({ body: {} });

  assert.equal(response.statusCode, 400);
  assert.ok("error" in (response.body as object));
});

test("controller gets an execution", async () => {
  const service = createService();
  const controller = new ExecutionController(service);
  const created = await service.create({ task: "task-a" });

  const response = await controller.get({
    params: { id: created.id }
  });

  assert.equal(response.statusCode, 200);
});

test("controller returns 404 for missing execution", async () => {
  const controller = new ExecutionController(createService());

  const response = await controller.get({
    params: { id: "missing" }
  });

  assert.equal(response.statusCode, 404);
});

test("controller lists executions", async () => {
  const service = createService();
  const controller = new ExecutionController(service);
  await service.create({ task: "task-a" });

  const response = await controller.list({});

  assert.equal(response.statusCode, 200);
  assert.equal((response.body as unknown[]).length, 1);
});

test("controller cancels an execution", async () => {
  const service = createService();
  const controller = new ExecutionController(service);
  const created = await service.create({ task: "task-a" });

  const response = await controller.cancel({
    params: { id: created.id }
  });

  assert.equal(response.statusCode, 200);
});

test("controller retries a failed execution", async () => {
  const service = createService();
  service.registerHandler("task-a", () => {
    throw new Error("failure");
  });

  const controller = new ExecutionController(service);
  const created = await service.create({ task: "task-a", maxAttempts: 2 });
  await service.execute(created.id);

  const response = await controller.retry({
    params: { id: created.id }
  });

  assert.equal(response.statusCode, 200);
});

test("routes expose execution endpoints", () => {
  const controller = new ExecutionController(createService());
  const routes = createExecutionRoutes(controller);

  assert.ok(routes.some((route) => route.path === "/executions"));
  assert.ok(routes.some((route) => route.path === "/executions/:id"));
  assert.ok(routes.some((route) => route.path === "/executions/:id/retry"));
  assert.ok(routes.some((route) => route.path === "/executions/:id/cancel"));
});

test("execution events emit created events", async () => {
  const service = createService();
  let emittedId: string | undefined;

  const listener = (record: { id: string }) => {
    emittedId = record.id;
  };

  executionEvents.onEvent("execution:created", listener);

  try {
    const created = await service.create({ task: "task-a" });
    assert.equal(emittedId, created.id);
  } finally {
    executionEvents.offEvent("execution:created", listener);
  }
});
