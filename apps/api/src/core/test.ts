import assert from "node:assert/strict";
import test from "node:test";
import {
  createServiceToken,
  DependencyContainer,
} from "./container.js";
import { createRequestContext } from "./context.js";
import type { AuthenticatedPrincipal } from "../types/request.types.js";
import type { JsonObject } from "../types/api.types.js";


interface ExampleService {
  readonly value: string;
}

test("factory services are created lazily and cached", () => {
  const container = new DependencyContainer();
  const token = createServiceToken<ExampleService>("example");
  let factoryCalls = 0;

  container.registerFactory(token, () => {
    factoryCalls += 1;
    return { value: "ready" };
  });

  assert.equal(factoryCalls, 0);
  assert.equal(container.resolve(token).value, "ready");
  assert.equal(container.resolve(token).value, "ready");
  assert.equal(factoryCalls, 1);
});

test("registered instances are returned unchanged", () => {
  const container = new DependencyContainer();
  const token = createServiceToken<ExampleService>("instance");
  const instance = { value: "existing" };

  container.registerInstance(token, instance);

  assert.equal(container.resolve(token), instance);
  assert.equal(container.has(token), true);
});

test("duplicate registrations are rejected", () => {
  const container = new DependencyContainer();
  const token = createServiceToken<ExampleService>("duplicate");

  container.registerInstance(token, { value: "first" });

  assert.throws(
    () => container.registerInstance(token, { value: "second" }),
    /already registered/,
  );
});

test("missing dependencies produce a clear error", () => {
  const container = new DependencyContainer();
  const token = createServiceToken<ExampleService>("missing");

  assert.throws(
    () => container.resolve(token),
    /No service is registered.*missing/,
  );
});

test("circular factory resolution is detected", () => {
  const container = new DependencyContainer();
  const token = createServiceToken<ExampleService>("circular");

  container.registerFactory(token, (scope) => scope.resolve(token));

  assert.throws(
    () => container.resolve(token),
    /Circular dependency detected.*circular/,
  );
});

test("services are disposed in reverse creation order", async () => {
  const container = new DependencyContainer();
  const order: string[] = [];
  const first = createServiceToken<ExampleService>("first");
  const second = createServiceToken<ExampleService>("second");

  container.registerFactory(
    first,
    () => ({ value: "first" }),
    () => { order.push("first"); },
  );
  container.registerFactory(
    second,
    () => ({ value: "second" }),
    () => { order.push("second"); },
  );

  container.resolve(first);
  container.resolve(second);
  await container.dispose();

  assert.deepEqual(order, ["second", "first"]);
});

test("disposal is idempotent and resolution afterward is rejected", async () => {
  const container = new DependencyContainer();
  const token = createServiceToken<ExampleService>("disposed");
  let disposeCalls = 0;

  container.registerInstance(
    token,
    { value: "resource" },
    () => { disposeCalls += 1; },
  );

  await container.dispose();
  await container.dispose();

  assert.equal(disposeCalls, 1);
  assert.throws(
    () => container.resolve(token),
    /has been disposed/,
  );
});

test("disposal attempts remaining services when one disposer fails", async () => {
  const container = new DependencyContainer();
  const order: string[] = [];
  const first = createServiceToken<ExampleService>("failing");
  const second = createServiceToken<ExampleService>("remaining");

  container.registerInstance(
    first,
    { value: "first" },
    () => {
      order.push("first");
      throw new Error("cleanup failed");
    },
  );
  container.registerInstance(
    second,
    { value: "second" },
    () => { order.push("second"); },
  );

  await assert.rejects(
    container.dispose(),
    (error: unknown) => {
      assert.ok(error instanceof AggregateError);
      assert.equal(error.errors.length, 1);
      return true;
    },
  );

  assert.deepEqual(order, ["second", "first"]);
});


const principal: AuthenticatedPrincipal = {
  userId: "user-123",
  tenantId: "tenant-456",
  roles: ["member"],
  scopes: ["chat:write"],
};

test("creates a context with supplied request ID and timestamp", () => {
  const receivedAt = "2026-10-17T10:30:00.000Z";
  const context = createRequestContext({
    requestId: "request-123",
    receivedAt,
  });

  assert.equal(context.requestId, "request-123");
  assert.equal(context.receivedAt, receivedAt);
  assert.equal(context.principal, undefined);
});

test("generates a timestamp when one is not supplied", () => {
  const context = createRequestContext({ requestId: "request-123" });

  assert.ok(Number.isFinite(Date.parse(context.receivedAt)));
});

test("rejects invalid request IDs", () => {
  for (const requestId of ["", "   ", "bad\nid", "x".repeat(257)]) {
    assert.throws(
      () => createRequestContext({ requestId }),
      /request ID/,
    );
  }
});

test("rejects invalid timestamps", () => {
  assert.throws(
    () => createRequestContext({
      requestId: "request-123",
      receivedAt: "not-a-date",
    }),
    /valid date-time/,
  );
});

test("validates and copies authenticated principal arrays", () => {
  const roles = ["member"];
  const scopes = ["chat:write"];
  const context = createRequestContext({
    requestId: "request-123",
    principal: {
      userId: "user-123",
      roles,
      scopes,
    },
  });

  roles.push("admin");
  scopes.push("admin:all");

  assert.deepEqual(context.principal?.roles, ["member"]);
  assert.deepEqual(context.principal?.scopes, ["chat:write"]);
  assert.ok(Object.isFrozen(context.principal));
  assert.ok(Object.isFrozen(context.principal?.roles));
});

test("rejects malformed principal identity and permissions", () => {
  assert.throws(
    () => createRequestContext({
      requestId: "request-123",
      principal: {
        userId: " ",
        roles: [],
        scopes: [],
      },
    }),
    /userId/,
  );

  assert.throws(
    () => createRequestContext({
      requestId: "request-123",
      principal: {
        userId: "user-123",
        roles: [" "],
        scopes: [],
      },
    }),
    /roles/,
  );
});

test("copies and deeply freezes metadata without freezing the source", () => {
  const source = {
    feature: "chat",
    flags: { safeMode: true },
  } as JsonObject;

  const context = createRequestContext({
    requestId: "request-123",
    metadata: source,
  });

  assert.ok(Object.isFrozen(context));
  assert.ok(Object.isFrozen(context.metadata));
  assert.ok(Object.isFrozen(context.metadata?.flags));

  (source.flags as { safeMode: boolean }).safeMode = false;

  assert.equal(
    (context.metadata?.flags as { safeMode: boolean }).safeMode,
    true,
  );
  assert.equal(Object.isFrozen(source), false);
});

test("rejects cyclic metadata", () => {
  const cyclic: Record<string, unknown> = {};
  cyclic["self"] = cyclic;

  assert.throws(
    () => createRequestContext({
      requestId: "request-123",
      metadata: cyclic as JsonObject,
    }),
    /cycles/,
  );
});

test("rejects class instances inside metadata", () => {
  class CustomMetadata {
    readonly value = "not-plain-json";
  }

  assert.throws(
    () => createRequestContext({
      requestId: "request-123",
      metadata: { item: new CustomMetadata() } as unknown as JsonObject,
    }),
    /plain JSON objects/,
  );
});

test("does not mutate the supplied principal", () => {
  const source: AuthenticatedPrincipal = {
    userId: principal.userId,
    tenantId: principal.tenantId,
    roles: [...principal.roles],
    scopes: [...principal.scopes],
  };

  const context = createRequestContext({
    requestId: "request-123",
    principal: source,
  });

  assert.notEqual(context.principal, source);
  assert.notEqual(context.principal?.roles, source.roles);
  assert.deepEqual(source.roles, ["member"]);
});

import { ApplicationLifecycle } from "./lifecycle.js";

test("lifecycle starts in order and stops in reverse order", async () => {
  const lifecycle = new ApplicationLifecycle();
  const events: string[] = [];

  lifecycle
    .register({
      name: "database",
      start: () => { events.push("start:database"); },
      stop: () => { events.push("stop:database"); },
    })
    .register({
      name: "http",
      start: () => { events.push("start:http"); },
      stop: () => { events.push("stop:http"); },
    });

  await lifecycle.start();
  assert.equal(lifecycle.state, "started");

  await lifecycle.stop();
  assert.equal(lifecycle.state, "stopped");
  assert.deepEqual(events, [
    "start:database",
    "start:http",
    "stop:http",
    "stop:database",
  ]);
});

test("repeated start and stop calls do not repeat component actions", async () => {
  const lifecycle = new ApplicationLifecycle();
  let starts = 0;
  let stops = 0;

  lifecycle.register({
    name: "resource",
    start: () => { starts += 1; },
    stop: () => { stops += 1; },
  });

  await lifecycle.start();
  await lifecycle.start();
  await lifecycle.stop();
  await lifecycle.stop();

  assert.equal(starts, 1);
  assert.equal(stops, 1);
});

test("startup failure cleans up previously started components", async () => {
  const lifecycle = new ApplicationLifecycle();
  const events: string[] = [];

  lifecycle
    .register({
      name: "first",
      start: () => { events.push("start:first"); },
      stop: () => { events.push("stop:first"); },
    })
    .register({
      name: "second",
      start: () => {
        events.push("start:second");
        throw new Error("startup failed");
      },
      stop: () => { events.push("stop:second"); },
    });

  await assert.rejects(lifecycle.start(), /startup failed/);
  assert.equal(lifecycle.state, "failed");
  assert.deepEqual(events, [
    "start:first",
    "start:second",
    "stop:first",
  ]);
});

test("shutdown attempts all components when one stop action fails", async () => {
  const lifecycle = new ApplicationLifecycle();
  const events: string[] = [];

  lifecycle
    .register({
      name: "first",
      start: () => { events.push("start:first"); },
      stop: () => { events.push("stop:first"); },
    })
    .register({
      name: "second",
      start: () => { events.push("start:second"); },
      stop: () => {
        events.push("stop:second");
        throw new Error("stop failed");
      },
    });

  await lifecycle.start();
  await assert.rejects(lifecycle.stop(), AggregateError);

  assert.equal(lifecycle.state, "failed");
  assert.deepEqual(events, [
    "start:first",
    "start:second",
    "stop:second",
    "stop:first",
  ]);
});

test("duplicate lifecycle names and late registrations are rejected", async () => {
  const lifecycle = new ApplicationLifecycle();
  const component = {
    name: "unique",
    start: () => {},
    stop: () => {},
  };

  lifecycle.register(component);
  assert.throws(() => lifecycle.register(component), /already registered/);

  await lifecycle.start();
  assert.throws(() => lifecycle.register({
    name: "late",
    start: () => {},
    stop: () => {},
  }), /Cannot register/);

  await lifecycle.stop();
});

test("stopping before startup prevents later startup", async () => {
  const lifecycle = new ApplicationLifecycle();

  await lifecycle.stop();

  assert.equal(lifecycle.state, "stopped");
  await assert.rejects(lifecycle.start(), /Cannot start lifecycle/);
});


import { Application } from "./application.js";

test("application starts once and stops before disposing services", async () => {
  const app = new Application();
  const events: string[] = [];
  const token = createServiceToken<{ name: string }>("test-service");

  app.container.registerInstance(
    token,
    { name: "example" },
    () => { events.push("dispose:service"); },
  );

  app.register({
    name: "worker",
    start: () => { events.push("start:worker"); },
    stop: () => { events.push("stop:worker"); },
  });

  await Promise.all([app.start(), app.start()]);

  assert.equal(app.state, "running");
  assert.equal(app.container.resolve(token).name, "example");

  await Promise.all([app.stop(), app.stop()]);

  assert.equal(app.state, "stopped");
  assert.deepEqual(events, [
    "start:worker",
    "stop:worker",
    "dispose:service",
  ]);
});

test("application rejects startup after shutdown", async () => {
  const app = new Application();

  await app.stop();

  assert.equal(app.state, "stopped");
  await assert.rejects(app.start(), /Cannot start application/);
});

test("application cleans up services when component startup fails", async () => {
  const app = new Application();
  const events: string[] = [];
  const token = createServiceToken<{ id: number }>("startup-cleanup");

  app.container.registerInstance(
    token,
    { id: 1 },
    () => { events.push("dispose:service"); },
  );

  app.register({
    name: "failing-worker",
    start: () => {
      throw new Error("component startup failure");
    },
    stop: () => { events.push("stop:failing-worker"); },
  });

  await assert.rejects(app.start(), /component startup failure/);

  assert.equal(app.state, "failed");
  assert.deepEqual(events, ["dispose:service"]);
});

test("application attempts container disposal after lifecycle shutdown fails", async () => {
  const app = new Application();
  const events: string[] = [];
  const token = createServiceToken<{ id: number }>("shutdown-cleanup");

  app.container.registerInstance(
    token,
    { id: 2 },
    () => { events.push("dispose:service"); },
  );

  app.register({
    name: "failing-stop",
    start: () => {},
    stop: () => {
      events.push("stop:component");
      throw new Error("component shutdown failure");
    },
  });

  await app.start();
  await assert.rejects(app.stop(), AggregateError);

  assert.equal(app.state, "failed");
  assert.deepEqual(events, [
    "stop:component",
    "dispose:service",
  ]);
});

test("application prevents late component registration", async () => {
  const app = new Application();

  await app.start();

  assert.throws(() => app.register({
    name: "late-component",
    start: () => {},
    stop: () => {},
  }), /Cannot register components/);

  await app.stop();
});

test("application aggregates startup and cleanup errors", async () => {
  const app = new Application();
  const token = createServiceToken<{ id: number }>("failing-disposer");

  app.container.registerInstance(
    token,
    { id: 3 },
    () => {
      throw new Error("service disposal failure");
    },
  );

  app.register({
    name: "startup-failure",
    start: () => {
      throw new Error("service startup failure");
    },
    stop: () => {},
  });

  await assert.rejects(app.start(), AggregateError);
  assert.equal(app.state, "failed");
});

