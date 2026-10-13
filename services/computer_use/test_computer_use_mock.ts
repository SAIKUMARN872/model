import test from "node:test";
import assert from "node:assert/strict";

import {
  ComputerUseService,
  ComputerService,
  SessionService,
  ActionService,
  ApprovalService,
  ScreenshotService,
  VerificationService,
  ComputerRepository,
  SessionRepository,
  ActionRepository,
  ScreenshotRepository,
  JobManager,
  createComputer,
  createSession,
  createAction,
  createApproval,
  createScreenshot,
  createComputerJob,
  createSessionJob,
  createVerificationJob,
  loadComputerUseConfig,
  validateAction,
  validateComputer,
  ActionEventEmitter,
  ApprovalEventEmitter,
  ComputerEventEmitter,
  SessionEventEmitter,
  ComputerWorker,
  SessionWorker,
  VerificationWorker,
  ValidationError,
  NotFoundError,
  ApprovalRequiredError,
  InvalidStateError
} from "./index.js";

import type {
  ActionInput,
  ComputerDevice,
  SessionRecord
} from "./interfaces.js";

function makeComputer(
  overrides: Partial<Omit<ComputerDevice, "id">> & { id?: string } = {}
): Omit<ComputerDevice, "id"> & { id?: string } {
  return {
    id: overrides.id ?? "computer-1",
    name: overrides.name ?? "Mock Desktop",
    platform: overrides.platform ?? "test-os",
    width: overrides.width ?? 1280,
    height: overrides.height ?? 720,
    connected: overrides.connected ?? true,
    metadata: overrides.metadata ?? {}
  };
}

function makeAction(overrides: Partial<ActionInput> = {}): ActionInput {
  return {
    type: "click",
    x: 100,
    y: 200,
    requiresApproval: false,
    ...overrides
  };
}

function makeActiveSession(): {
  computers: ComputerService;
  sessions: SessionService;
  computer: ComputerDevice;
  session: SessionRecord;
} {
  const computers = new ComputerService();
  const computer = computers.register(makeComputer());
  const sessions = new SessionService(computers);
  const session = sessions.create(computer.id);
  const activeSession = sessions.start(session.id);

  return { computers, sessions, computer, session: activeSession };
}

test("models create computer, session, action, approval and screenshot records", () => {
  const computer = createComputer(makeComputer());
  assert.ok(computer.id);
  assert.equal(computer.name, "Mock Desktop");

  const session = createSession({ computerId: computer.id });
  assert.ok(session.id);
  assert.equal(session.status, "created");

  const action = createAction(session.id, makeAction());
  assert.ok(action.id);
  assert.equal(action.status, "pending");

  const approval = createApproval(session.id, action.id);
  assert.ok(approval.id);
  assert.equal(approval.status, "pending");

  const screenshot = createScreenshot({
    sessionId: session.id,
    mimeType: "image/png",
    data: "mock-image-data"
  });
  assert.ok(screenshot.id);
  assert.equal(screenshot.sessionId, session.id);
});

test("configuration uses defaults and accepts valid overrides", () => {
  const defaults = loadComputerUseConfig();

  assert.ok(defaults.defaultTimeoutMs > 0);
  assert.ok(defaults.maxTimeoutMs >= defaults.defaultTimeoutMs);
  assert.ok(defaults.maxScreenshots > 0);

  const custom = loadComputerUseConfig({
    defaultTimeoutMs: 1000,
    maxTimeoutMs: 5000,
    maxScreenshots: 10,
    requireApproval: false
  });

  assert.equal(custom.defaultTimeoutMs, 1000);
  assert.equal(custom.maxTimeoutMs, 5000);
  assert.equal(custom.maxScreenshots, 10);
  assert.equal(custom.requireApproval, false);

  assert.throws(
    () => loadComputerUseConfig({ defaultTimeoutMs: 0 }),
    /Invalid computer-use configuration/
  );

  assert.throws(
    () => loadComputerUseConfig({
      defaultTimeoutMs: 5000,
      maxTimeoutMs: 1000
    }),
    /Invalid computer-use configuration/
  );
});

test("computer validation accepts valid devices and rejects invalid dimensions", () => {
  const computer = createComputer(makeComputer());
  assert.doesNotThrow(() => validateComputer(computer));

  assert.throws(
    () => validateComputer({ ...computer, width: 0 }),
    ValidationError
  );

  assert.throws(
    () => validateComputer({ ...computer, height: -1 }),
    ValidationError
  );

  assert.throws(
    () => validateComputer({ ...computer, name: " " }),
    ValidationError
  );
});

test("action validation accepts valid actions", () => {
  assert.doesNotThrow(() => validateAction(makeAction()));
  assert.doesNotThrow(() => validateAction(makeAction({
    type: "type",
    text: "hello"
  })));
  assert.doesNotThrow(() => validateAction(makeAction({
    type: "press_key",
    key: "Enter"
  })));
});

test("action validation rejects missing types and invalid coordinates", () => {
  assert.throws(
    () => validateAction({ type: "" } as unknown as ActionInput),
    ValidationError
  );

  assert.throws(
    () => validateAction(makeAction({ x: Number.NaN })),
    ValidationError
  );

  assert.throws(
    () => validateAction(makeAction({ y: Number.POSITIVE_INFINITY })),
    ValidationError
  );

  assert.throws(
    () => validateAction(makeAction({ type: "type" })),
    ValidationError
  );

  assert.throws(
    () => validateAction(makeAction({ type: "press_key" })),
    ValidationError
  );

  assert.throws(
    () => validateAction(makeAction({ durationMs: -1 })),
    ValidationError
  );
});

test("computer repository saves, retrieves, lists and deletes devices", () => {
  const repository = new ComputerRepository();
  const computer = createComputer(makeComputer());

  repository.save(computer);

  assert.equal(repository.get(computer.id)?.name, computer.name);
  assert.equal(repository.list().length, 1);
  assert.equal(repository.delete(computer.id), true);
  assert.equal(repository.get(computer.id), undefined);
  assert.equal(repository.delete("missing"), false);
});

test("computer repository returns copies rather than mutable stored records", () => {
  const repository = new ComputerRepository();
  const computer = createComputer(makeComputer());

  repository.save(computer);

  const fetched = repository.get(computer.id)!;
  fetched.name = "Changed";

  assert.equal(repository.get(computer.id)?.name, "Mock Desktop");
});

test("computer service registers and retrieves devices", () => {
  const service = new ComputerService();
  const computer = service.register(makeComputer());

  assert.equal(service.get(computer.id).name, "Mock Desktop");
  assert.equal(service.list().length, 1);
});

test("computer service rejects duplicate device IDs", () => {
  const service = new ComputerService();
  service.register(makeComputer({ id: "duplicate" }));

  assert.throws(
    () => service.register(makeComputer({ id: "duplicate" })),
    ValidationError
  );
});

test("computer service changes connection status and removes devices", () => {
  const service = new ComputerService();
  const computer = service.register(makeComputer());

  assert.equal(service.setConnected(computer.id, false).connected, false);
  assert.equal(service.setConnected(computer.id, true).connected, true);

  service.remove(computer.id);

  assert.throws(() => service.get(computer.id), NotFoundError);
  assert.throws(() => service.remove(computer.id), NotFoundError);
});

test("session repository stores and retrieves sessions", () => {
  const repository = new SessionRepository();
  const session = createSession({ computerId: "computer-1" });

  repository.save(session);

  assert.equal(repository.get(session.id)?.computerId, "computer-1");
  assert.equal(repository.list().length, 1);
});

test("session service creates sessions for connected computers", () => {
  const computers = new ComputerService();
  const computer = computers.register(makeComputer());
  const sessions = new SessionService(computers);

  const session = sessions.create(computer.id, { purpose: "test" });

  assert.equal(session.computerId, computer.id);
  assert.equal(session.status, "created");
  assert.equal(session.metadata.purpose, "test");
  assert.equal(sessions.get(session.id).id, session.id);
});

test("session service rejects sessions for disconnected computers", () => {
  const computers = new ComputerService();
  const computer = computers.register(makeComputer({ connected: false }));
  const sessions = new SessionService(computers);

  assert.throws(() => sessions.create(computer.id), InvalidStateError);
});

test("session service enforces legal lifecycle transitions", () => {
  const computers = new ComputerService();
  const computer = computers.register(makeComputer());
  const sessions = new SessionService(computers);
  const session = sessions.create(computer.id);

  assert.equal(sessions.start(session.id).status, "active");
  assert.equal(sessions.pause(session.id).status, "paused");
  assert.equal(sessions.resume(session.id).status, "active");
  assert.equal(sessions.close(session.id).status, "closed");

  assert.throws(() => sessions.start(session.id), InvalidStateError);
});

test("session service reports unknown sessions", () => {
  const sessions = new SessionService(new ComputerService());

  assert.throws(() => sessions.get("missing"), NotFoundError);
});

test("action repository stores and filters actions by session", () => {
  const repository = new ActionRepository();
  const first = createAction("session-1", makeAction());
  const second = createAction("session-2", makeAction());

  repository.save(first);
  repository.save(second);

  assert.equal(repository.get(first.id)?.id, first.id);
  assert.equal(repository.listBySession("session-1").length, 1);
  assert.equal(repository.listBySession("unknown").length, 0);
});

test("action service executes an approved action in an active session", async () => {
  const { computer, session } = makeActiveSession();
  const actions = new ActionService(
    new ActionRepository(),
    loadComputerUseConfig({ requireApproval: false })
  );

  const result = await actions.execute(computer, session, makeAction());

  assert.equal(result.status, "completed");
  assert.equal(result.sessionId, session.id);
  assert.ok(result.completedAt);
  assert.deepEqual(result.result, {
    accepted: true,
    simulated: true,
    action: "click"
  });
  assert.equal(actions.get(result.id).status, "completed");
  assert.equal(actions.listBySession(session.id).length, 1);
});

test("action service requires approval when configured", async () => {
  const { computer, session } = makeActiveSession();
  const actions = new ActionService(
    new ActionRepository(),
    loadComputerUseConfig({ requireApproval: true })
  );

  await assert.rejects(
    actions.execute(computer, session, makeAction()),
    ApprovalRequiredError
  );
});

test("action service permits an explicitly approved action", async () => {
  const { computer, session } = makeActiveSession();
  const actions = new ActionService();

  const result = await actions.execute(
    computer,
    session,
    makeAction(),
    true
  );

  assert.equal(result.status, "completed");
});

test("action service rejects actions on inactive sessions", async () => {
  const computers = new ComputerService();
  const computer = computers.register(makeComputer());
  const sessions = new SessionService(computers);
  const session = sessions.create(computer.id);
  const actions = new ActionService();

  await assert.rejects(
    actions.execute(computer, session, makeAction(), true),
    InvalidStateError
  );
});

test("action service rejects mismatched computer and session", async () => {
  const { session } = makeActiveSession();
  const otherComputer = createComputer(makeComputer({ id: "computer-other" }));
  const actions = new ActionService();

  await assert.rejects(
    actions.execute(otherComputer, session, makeAction(), true),
    ValidationError
  );
});

test("action service persists executor errors as failed actions", async () => {
  const { computer, session } = makeActiveSession();
  const actions = new ActionService(
    new ActionRepository(),
    loadComputerUseConfig({ requireApproval: false }),
    {
      async execute() {
        throw new Error("mock executor failure");
      }
    }
  );

  await assert.rejects(
    actions.execute(computer, session, makeAction()),
    /mock executor failure/
  );

  const records = actions.listBySession(session.id);
  assert.equal(records.length, 1);
  assert.equal(records[0].status, "failed");
  assert.equal(records[0].error, "mock executor failure");
});

test("action service reports unknown action IDs", () => {
  const actions = new ActionService();

  assert.throws(() => actions.get("missing"), NotFoundError);
});

test("approval service requests and resolves approvals", () => {
  const approvals = new ApprovalService();
  const request = approvals.request("session-1", "action-1");

  assert.equal(request.status, "pending");
  assert.equal(approvals.get(request.id).status, "pending");

  const approved = approvals.resolve(request.id, true, "Reviewed");
  assert.equal(approved.status, "approved");
  assert.equal(approved.reason, "Reviewed");
  assert.ok(approved.resolvedAt);

  assert.throws(
    () => approvals.resolve(request.id, false),
    ApprovalRequiredError
  );
});

test("approval service rejects and lists pending approvals by session", () => {
  const approvals = new ApprovalService();
  const first = approvals.request("session-1", "action-1");
  approvals.request("session-2", "action-2");

  assert.equal(approvals.listBySession("session-1").length, 1);

  const rejected = approvals.resolve(first.id, false, "Not permitted");
  assert.equal(rejected.status, "rejected");
  assert.equal(rejected.reason, "Not permitted");
});

test("approval service reports missing approval records", () => {
  const approvals = new ApprovalService();

  assert.throws(() => approvals.get("missing"), NotFoundError);
  assert.throws(
    () => approvals.resolve("missing", true),
    NotFoundError
  );
});

test("screenshot service saves and retrieves supported screenshots", () => {
  const { session } = makeActiveSession();
  const screenshots = new ScreenshotService();

  const screenshot = screenshots.save(session, "mock-image-data", "image/png");

  assert.ok(screenshot.id);
  assert.equal(screenshot.sessionId, session.id);
  assert.equal(screenshots.get(screenshot.id).data, "mock-image-data");
  assert.equal(screenshots.listBySession(session.id).length, 1);
});

test("screenshot service rejects inactive sessions and empty data", () => {
  const screenshots = new ScreenshotService();
  const session = createSession({ computerId: "computer-1" });

  assert.throws(
    () => screenshots.save(session, "mock-image-data"),
    ValidationError
  );

  const { session: activeSession } = makeActiveSession();

  assert.throws(
    () => screenshots.save(activeSession, " "),
    ValidationError
  );

  assert.throws(
    () => screenshots.save(activeSession, "data", "text/plain"),
    ValidationError
  );
});

test("screenshot service reports unknown screenshot IDs", () => {
  const screenshots = new ScreenshotService();

  assert.throws(() => screenshots.get("missing"), NotFoundError);
});

test("screenshot repository enforces its record limit", () => {
  const repository = new ScreenshotRepository(2);

  const first = createScreenshot({
    sessionId: "session-1",
    data: "one",
    mimeType: "image/png"
  });
  const second = createScreenshot({
    sessionId: "session-1",
    data: "two",
    mimeType: "image/png"
  });
  const third = createScreenshot({
    sessionId: "session-1",
    data: "three",
    mimeType: "image/png"
  });

  repository.save(first);
  repository.save(second);
  repository.save(third);

  assert.equal(repository.get(first.id), undefined);
  assert.equal(repository.get(second.id)?.data, "two");
  assert.equal(repository.get(third.id)?.data, "three");
});

test("verification service validates a completed action", async () => {
  const { computer, session } = makeActiveSession();
  const actions = new ActionService(
    new ActionRepository(),
    loadComputerUseConfig({ requireApproval: false })
  );
  const action = await actions.execute(computer, session, makeAction());
  const verifier = new VerificationService(actions);

  const result = verifier.verify(session, action.id);

  assert.equal(result.valid, true);
  assert.deepEqual(result.issues, []);
});

test("verification service reports a missing action", () => {
  const { session } = makeActiveSession();
  const verifier = new VerificationService(new ActionService());

  const result = verifier.verify(session, "missing-action");

  assert.equal(result.valid, false);
  assert.ok(result.issues.includes("Action not found"));
});

test("verification service flags closed sessions", () => {
  const session: SessionRecord = {
    ...createSession({ computerId: "computer-1" }),
    status: "closed"
  };
  const verifier = new VerificationService();

  const result = verifier.verify(session);

  assert.equal(result.valid, false);
  assert.ok(result.issues.some((issue) => issue.includes("closed")));
});

test("job manager completes jobs and stores results", async () => {
  const jobs = new JobManager();
  const job = createComputerJob("sum", { a: 2, b: 3 });

  jobs.add(job);

  const result = await jobs.process(job, (payload: { a: number; b: number }) => payload.a + payload.b);

  assert.equal(result, 5);
  assert.equal(job.status, "completed");
  assert.equal(job.result, 5);
  assert.equal(jobs.get(job.id)?.status, "completed");
  assert.equal(jobs.list().length, 1);
});

test("job manager marks failing jobs as failed and rethrows errors", async () => {
  const jobs = new JobManager();
  const job = createComputerJob("failure", {});

  await assert.rejects(
    jobs.process(job, async () => {
      throw new Error("job failed");
    }),
    /job failed/
  );

  assert.equal(job.status, "failed");
  assert.equal(job.error, "job failed");
});

test("job factory functions create valid job records", () => {
  const computerJob = createComputerJob("test", { value: 1 });
  const sessionJob = createSessionJob("session-1", "start");
  const verificationJob = createVerificationJob("session-1", "action-1");

  assert.ok(computerJob.id);
  assert.equal(computerJob.status, "pending");
  assert.equal(sessionJob.sessionId, "session-1");
  assert.equal(sessionJob.operation, "start");
  assert.equal(verificationJob.actionId, "action-1");
});

test("event emitters notify listeners and support unsubscribe", () => {
  const emitters = [
    new ActionEventEmitter(),
    new ApprovalEventEmitter(),
    new ComputerEventEmitter(),
    new SessionEventEmitter()
  ];

  for (const emitter of emitters) {
    const received: unknown[] = [];
    const unsubscribe = emitter.on((event) => received.push(event));

    emitter.emit("mock.event", "entity-1", { ok: true });

    assert.equal(received.length, 1);
    unsubscribe();

    emitter.emit("mock.event", "entity-1", { ok: false });
    assert.equal(received.length, 1);
  }
});

test("computer worker executes an action using registered services", async () => {
  const computers = new ComputerService();
  const computer = computers.register(makeComputer());
  const sessions = new SessionService(computers);
  const session = sessions.start(sessions.create(computer.id).id);
  const actions = new ActionService(
    new ActionRepository(),
    loadComputerUseConfig({ requireApproval: false })
  );

  const worker = new ComputerWorker(computers, sessions, actions);
  const result = await worker.run(
    computer.id,
    session.id,
    makeAction(),
    true
  );

  assert.equal(result.status, "completed");
});

test("session worker applies session operations", () => {
  const computers = new ComputerService();
  const computer = computers.register(makeComputer());
  const sessions = new SessionService(computers);
  const session = sessions.create(computer.id);
  const worker = new SessionWorker(sessions);

  assert.equal(worker.run(session.id, "start").status, "active");
  assert.equal(worker.run(session.id, "pause").status, "paused");
  assert.equal(worker.run(session.id, "resume").status, "active");
  assert.equal(worker.run(session.id, "close").status, "closed");
});

test("verification worker returns verification results", () => {
  const { session } = makeActiveSession();
  const worker = new VerificationWorker(new VerificationService());

  const result = worker.run(session);

  assert.equal(result.sessionId, session.id);
  assert.equal(result.valid, true);
});

test("computer-use service provides an integrated workflow", async () => {
  const service = new ComputerUseService();

  const computer = service.registerComputer(makeComputer());
  const session = service.createSession(computer.id);
  const activeSession = service.startSession(session.id);

  const action = await service.executeAction(
    computer.id,
    activeSession.id,
    makeAction(),
    true
  );

  assert.equal(action.status, "completed");

  const screenshot = service.captureScreenshot(
    activeSession.id,
    "mock-image-data"
  );

  assert.equal(screenshot.sessionId, activeSession.id);

  const verification = service.verification.verify(
    activeSession,
    action.id
  );

  assert.equal(verification.valid, true);
});

test("computer-use service rejects unknown computers", () => {
  const service = new ComputerUseService();

  assert.throws(
    () => service.createSession("missing-computer"),
    NotFoundError
  );
});

