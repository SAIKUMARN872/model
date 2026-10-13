import { test } from "node:test";
import assert from "node:assert/strict";

import {
  BrowserEngine,
  BrowserService,
  BrowserSessionManager,
  BrowserTaskManager,
  BrowserSessionRepository,
  BrowserTaskRepository,
  CredentialVault,
  CredentialManager,
  CredentialResolver,
  DownloadStorage,
  DownloadManager,
  DownloadHandler,
  BrowserEventPublisher,
  BrowserEventHandler,
  BrowserJobQueue,
  BrowserJobManager,
  RetryPolicy,
  FailureHandler,
  CheckpointManager,
  RecoveryManager,
  PermissionManager,
  BrowserAuthMiddleware,
  BrowserValidationMiddleware,
  BrowserRepository,
  BrowserOrchestrator,
  BrowserTaskWorker,
  BrowserWorker,
  BrowserController,
  TaskController,
  BrowserTelemetry,
  BrowserMetrics,
  BrowserWorkerPool,
  createBrowserEngine,
  createBrowserConfig,
  validateBrowserConfig,
  validateSessionInput,
  validateTaskInput,
  validateUrl,
  BrowserAutomationError,
  ValidationError,
  NotFoundError,
  PermissionError,
  BrowserTimeoutError
} from "./main.js";

const makeTask = (
  sessionId: string,
  url = "https://example.com"
) => ({
  sessionId,
  url,
  type: "navigate",
  payload: {}
});

test("config validation", () => {
  const config = createBrowserConfig();

  assert.equal(config.headless, true);
  assert.ok(config.timeoutMs > 0);
  assert.ok(config.maxConcurrentTasks > 0);

  assert.doesNotThrow(() => validateBrowserConfig(config));

  assert.throws(
    () => validateBrowserConfig({
      ...config,
      timeoutMs: 0
    }),
    BrowserAutomationError
  );
});

test("URL validation", () => {
  assert.doesNotThrow(() => validateUrl("https://example.com"));

  assert.throws(
    () => validateUrl("not-a-url"),
    ValidationError
  );
});

test("session manager lifecycle", () => {
  const manager = new BrowserSessionManager();

  const session = manager.create({
    userId: "user-1",
    url: "https://example.com"
  });

  assert.ok(session.id);
  assert.equal(session.userId, "user-1");
  assert.equal(session.status, "created");

  assert.equal(
    manager.start(session.id).status,
    "running"
  );

  assert.equal(
    manager.pause(session.id).status,
    "paused"
  );

  assert.equal(
    manager.complete(session.id).status,
    "completed"
  );
});

test("missing session throws", () => {
  const manager = new BrowserSessionManager();

  assert.throws(
    () => manager.get("missing"),
    NotFoundError
  );
});

test("task manager lifecycle", () => {
  const manager = new BrowserTaskManager();

  const task = manager.create(
    makeTask("session-1")
  );

  assert.ok(task.id);
  assert.equal(task.sessionId, "session-1");
  assert.equal(task.status, "queued");

  assert.equal(
    manager.start(task.id).status,
    "running"
  );

  const completed = manager.complete(
    task.id,
    { ok: true }
  );

  assert.equal(
    completed.status,
    "completed"
  );

  assert.deepEqual(
    completed.result,
    { ok: true }
  );
});

test("task validation", () => {
  assert.doesNotThrow(() =>
    validateTaskInput(
      makeTask("session-1")
    )
  );

  assert.throws(
    () =>
      validateTaskInput(
        makeTask("")
      ),
    ValidationError
  );
});

test("session validation", () => {
  assert.doesNotThrow(() =>
    validateSessionInput({
      userId: "user-1",
      url: "https://example.com"
    })
  );

  assert.throws(
    () =>
      validateSessionInput({
        userId: "",
        url: "https://example.com"
      }),
    ValidationError
  );
});

test("session repository", () => {
  const repository = new BrowserSessionRepository();
  const manager = new BrowserSessionManager();

  const session = manager.create({
    userId: "user-1",
    url: "https://example.com"
  });

  repository.create(session);

  assert.equal(
    repository.get(session.id).id,
    session.id
  );

  assert.equal(
    repository.list().length,
    1
  );

  repository.delete(session.id);

  assert.equal(
    repository.list().length,
    0
  );
});

test("task repository", () => {
  const repository = new BrowserTaskRepository();
  const manager = new BrowserTaskManager();

  const task = manager.create(
    makeTask("session-1")
  );

  repository.create(task);

  assert.equal(
    repository.get(task.id).id,
    task.id
  );

  assert.equal(
    repository.list().length,
    1
  );

  repository.delete(task.id);

  assert.equal(
    repository.list().length,
    0
  );
});

test("credential vault", () => {
  const vault = new CredentialVault();

  const credential = vault.set({
    name: "example",
    username: "user",
    password: "secret"
  });

  assert.ok(credential.id);
  assert.equal(
    vault.get(credential.id).username,
    "user"
  );

  vault.delete(credential.id);

  assert.throws(
    () => vault.get(credential.id),
    NotFoundError
  );
});

test("credential manager and resolver", () => {
  const vault = new CredentialVault();
  const manager = new CredentialManager(vault);
  const resolver = new CredentialResolver(manager);

  manager.save({
    name: "github",
    username: "demo",
    password: "password"
  });

  const credential = resolver.resolve("github");

  assert.equal(
    credential.username,
    "demo"
  );

  assert.equal(
    credential.password,
    "password"
  );
});

test("download manager", () => {
  const storage = new DownloadStorage();
  const manager = new DownloadManager(storage);

  const download = manager.create({
    filename: "example.txt",
    content: "hello"
  });

  assert.ok(download.id);
  assert.equal(
    download.filename,
    "example.txt"
  );

  assert.equal(
    manager.get(download.id).content,
    "hello"
  );
});

test("download handler", () => {
  const storage = new DownloadStorage();
  const manager = new DownloadManager(storage);
  const handler = new DownloadHandler(manager);

  const download = handler.handle({
    filename: "result.json",
    content: "{\"ok\":true}"
  });

  assert.equal(
    download.filename,
    "result.json"
  );
});

test("event publisher and handler", () => {
  const publisher = new BrowserEventPublisher();
  const received: unknown[] = [];

  const handler = new BrowserEventHandler(
    publisher
  );

  handler.on((event) => {
    received.push(event);
  });

  publisher.publish({
    type: "browser.started",
    sessionId: "session-1",
    data: {
      url: "https://example.com"
    }
  });

  assert.equal(
    received.length,
    1
  );
});

test("job queue", async () => {
  const queue = new BrowserJobQueue();

  const job = queue.enqueue({
    type: "browser",
    payload: {
      taskId: "task-1"
    }
  });

  assert.ok(job.id);
  assert.equal(queue.size(), 1);

  const results = await queue.process(
    async (queuedJob) => ({
      id: queuedJob.id,
      success: true
    })
  );

  assert.equal(results.length, 1);
  assert.equal(results[0].success, true);
  assert.equal(queue.size(), 0);
});

test("job manager", async () => {
  const queue = new BrowserJobQueue();
  const manager = new BrowserJobManager(queue);

  const job = manager.create({
    type: "browser",
    payload: {
      taskId: "task-1"
    }
  });

  assert.ok(job.id);

  const results = await manager.run(
    async () => ({
      success: true
    })
  );

  assert.equal(results.length, 1);
  assert.equal(results[0].success, true);
});

test("retry policy", () => {
  const policy = new RetryPolicy({
    maxAttempts: 3,
    delayMs: 0
  });

  assert.equal(
    policy.shouldRetry(1),
    true
  );

  assert.equal(
    policy.shouldRetry(2),
    true
  );

  assert.equal(
    policy.shouldRetry(3),
    false
  );
});

test("failure handler", () => {
  const handler = new FailureHandler();

  const failure = handler.handle(
    new Error("browser failed"),
    {
      taskId: "task-1"
    }
  );

  assert.ok(failure);
  assert.equal(
    failure.taskId,
    "task-1"
  );
});

test("checkpoint manager", () => {
  const manager = new CheckpointManager();

  const checkpoint = manager.save({
    sessionId: "session-1",
    taskId: "task-1",
    state: {
      step: 2
    }
  });

  assert.ok(checkpoint.id);

  const restored =
    manager.restore(checkpoint.id);

  assert.equal(
    restored.sessionId,
    "session-1"
  );

  assert.deepEqual(
    restored.state,
    { step: 2 }
  );
});

test("recovery manager", () => {
  const checkpoints =
    new CheckpointManager();

  const recovery =
    new RecoveryManager(checkpoints);

  const checkpoint = checkpoints.save({
    sessionId: "session-1",
    taskId: "task-1",
    state: {
      step: 5
    }
  });

  const result =
    recovery.recover(checkpoint.id);

  assert.equal(
    result.taskId,
    "task-1"
  );

  assert.deepEqual(
    result.state,
    { step: 5 }
  );
});

test("permission manager", () => {
  const manager =
    new PermissionManager();

  manager.grant(
    "user-1",
    "browser.execute"
  );

  assert.equal(
    manager.has(
      "user-1",
      "browser.execute"
    ),
    true
  );

  assert.equal(
    manager.has(
      "user-1",
      "browser.delete"
    ),
    false
  );

  assert.throws(
    () =>
      manager.require(
        "user-1",
        "browser.delete"
      ),
    PermissionError
  );
});

test("authentication middleware", () => {
  const permissions =
    new PermissionManager();

  permissions.grant(
    "user-1",
    "browser.execute"
  );

  const auth =
    new BrowserAuthMiddleware(
      permissions
    );

  const context =
    auth.authenticate({
      userId: "user-1",
      permission: "browser.execute"
    });

  assert.equal(
    context.userId,
    "user-1"
  );
});

test("validation middleware", () => {
  const middleware =
    new BrowserValidationMiddleware();

  const result =
    middleware.validate({
      url: "https://example.com"
    });

  assert.equal(
    result.url,
    "https://example.com"
  );
});

test("browser repository", () => {
  const repository =
    new BrowserRepository();

  assert.ok(repository.sessions);
  assert.ok(repository.tasks);
});

test("orchestrator creates and executes task", async () => {
  const sessions =
    new BrowserSessionManager();

  const tasks =
    new BrowserTaskManager();

  const jobs =
    new BrowserJobManager(
      new BrowserJobQueue()
    );

  const worker =
    new BrowserTaskWorker(
      sessions,
      tasks,
      jobs
    );

  const orchestrator =
    new BrowserOrchestrator(
      sessions,
      tasks,
      worker
    );

  const session =
    sessions.create({
      userId: "user-1",
      url: "https://example.com"
    });

  const task =
    tasks.create(
      makeTask(session.id)
    );

  const result =
    await orchestrator.execute(
      task.id
    );

  assert.equal(
    result.id,
    task.id
  );

  assert.equal(
    result.status,
    "completed"
  );
});

test("task worker executes task", async () => {
  const sessions =
    new BrowserSessionManager();

  const tasks =
    new BrowserTaskManager();

  const jobs =
    new BrowserJobManager(
      new BrowserJobQueue()
    );

  const worker =
    new BrowserTaskWorker(
      sessions,
      tasks,
      jobs
    );

  const session =
    sessions.create({
      userId: "user-1",
      url: "https://example.com"
    });

  const task =
    tasks.create(
      makeTask(session.id)
    );

  const result =
    await worker.execute(
      task.id
    );

  assert.equal(
    result.status,
    "completed"
  );
});

test("browser worker executes task", async () => {
  const sessions =
    new BrowserSessionManager();

  const tasks =
    new BrowserTaskManager();

  const jobs =
    new BrowserJobManager(
      new BrowserJobQueue()
    );

  const taskWorker =
    new BrowserTaskWorker(
      sessions,
      tasks,
      jobs
    );

  const worker =
    new BrowserWorker(taskWorker);

  const session =
    sessions.create({
      userId: "user-1",
      url: "https://example.com"
    });

  const task =
    tasks.create(
      makeTask(session.id)
    );

  const result =
    await worker.run(task.id);

  assert.equal(
    result.status,
    "completed"
  );
});

test("controllers expose operations", async () => {
  const sessions =
    new BrowserSessionManager();

  const tasks =
    new BrowserTaskManager();

  const jobs =
    new BrowserJobManager(
      new BrowserJobQueue()
    );

  const taskWorker =
    new BrowserTaskWorker(
      sessions,
      tasks,
      jobs
    );

  const orchestrator =
    new BrowserOrchestrator(
      sessions,
      tasks,
      taskWorker
    );

  const browserController =
    new BrowserController(
      sessions,
      orchestrator
    );

  const taskController =
    new TaskController(
      tasks,
      orchestrator
    );

  const session =
    browserController.createSession({
      userId: "user-1",
      url: "https://example.com"
    });

  assert.ok(session.id);

  const task =
    taskController.createTask(
      makeTask(session.id)
    );

  assert.equal(
    task.sessionId,
    session.id
  );

  const result =
    await taskController.executeTask(
      task.id
    );

  assert.equal(
    result.status,
    "completed"
  );
});

test("telemetry records an event", () => {
  const telemetry =
    new BrowserTelemetry();

  assert.doesNotThrow(() => {
    telemetry.record({
      name: "browser.task.completed",
      value: 1,
      tags: {
        taskId: "task-1"
      }
    });
  });
});

test("metrics records values", () => {
  const metrics =
    new BrowserMetrics();

  assert.doesNotThrow(() => {
    metrics.record(
      "browser.tasks",
      1
    );

    metrics.record(
      "browser.tasks",
      1
    );
  });
});

test("worker pool executes multiple tasks", async () => {
  const sessions =
    new BrowserSessionManager();

  const tasks =
    new BrowserTaskManager();

  const jobs =
    new BrowserJobManager(
      new BrowserJobQueue()
    );

  const taskWorker =
    new BrowserTaskWorker(
      sessions,
      tasks,
      jobs
    );

  const worker =
    new BrowserWorker(taskWorker);

  const pool =
    new BrowserWorkerPool(
      worker,
      2
    );

  const session =
    sessions.create({
      userId: "user-1",
      url: "https://example.com"
    });

  const task1 =
    tasks.create(
      makeTask(
        session.id,
        "https://example.com/1"
      )
    );

  const task2 =
    tasks.create(
      makeTask(
        session.id,
        "https://example.com/2"
      )
    );

  const results =
    await pool.run([
      task1.id,
      task2.id
    ]);

  assert.equal(
    results.length,
    2
  );

  assert.equal(
    results[0].status,
    "completed"
  );

  assert.equal(
    results[1].status,
    "completed"
  );
});

test("browser engine creates and runs task", async () => {
  const engine =
    createBrowserEngine();

  const session =
    engine.createSession({
      userId: "user-1",
      url: "https://example.com"
    });

  assert.ok(session.id);

  const task =
    engine.createTask(
      makeTask(session.id)
    );

  const result =
    await engine.runTask(task.id);

  assert.equal(
    result.status,
    "completed"
  );
});

test("browser service exposes engine", async () => {
  const engine =
    createBrowserEngine();

  const service =
    new BrowserService(engine);

  const session =
    service.createSession({
      userId: "user-1",
      url: "https://example.com"
    });

  const task =
    service.createTask(
      makeTask(session.id)
    );

  const result =
    await service.runTask(task.id);

  assert.equal(
    result.status,
    "completed"
  );
});

test("browser timeout error", () => {
  const error =
    new BrowserTimeoutError(
      "browser operation timed out"
    );

  assert.equal(
    error.message,
    "browser operation timed out"
  );

  assert.equal(
    error instanceof BrowserAutomationError,
    true
  );
});

test("browser engine export", () => {
  assert.equal(
    typeof BrowserEngine,
    "function"
  );
});
