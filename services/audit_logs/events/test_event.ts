import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  AuditEventProcessor,
  AuditEventPublisher,
} from "./index.js";

import type {
  AuditEvent,
} from "./event_processor.js";

function createEvent(
  overrides: Partial<AuditEvent> = {},
): AuditEvent {
  return {
    id: "evt-1",
    type: "created",
    severity: "info",
    action: "create",
    resource: "user",
    resourceId: "user-1",
    actorId: "actor-1",
    organizationId: "org-1",
    timestamp: new Date().toISOString(),
    ...overrides,
  };
}

test("publisher creates an audit event", () => {
  const publisher = new AuditEventPublisher();

  const event = publisher.publish({
    type: "created",
    action: "create",
    resource: "user",
    resourceId: "user-1",
    actorId: "actor-1",
    organizationId: "org-1",
  });

  assert.equal(event.type, "created");
  assert.equal(event.severity, "info");
  assert.equal(event.action, "create");
  assert.equal(event.resource, "user");

  assert.ok(event.id);
  assert.ok(event.timestamp);
});

test("publisher supports subscribed listeners", () => {
  const publisher = new AuditEventPublisher();

  const received: AuditEvent[] = [];

  const unsubscribe = publisher.subscribe(
    (event) => {
      received.push(event);
    },
  );

  publisher.publish({
    type: "updated",
    action: "update",
    resource: "project",
  });

  assert.equal(received.length, 1);
  assert.equal(
    received[0]?.action,
    "update",
  );

  assert.equal(
    publisher.listenerCount(),
    1,
  );

  unsubscribe();

  assert.equal(
    publisher.listenerCount(),
    0,
  );
});

test("processor stores events", () => {
  const processor =
    new AuditEventProcessor();

  const event = createEvent();

  const stored =
    processor.process(event);

  assert.equal(stored.id, "evt-1");
  assert.equal(processor.count(), 1);
});

test("processor gets event by id", () => {
  const processor =
    new AuditEventProcessor();

  processor.process(
    createEvent({
      id: "evt-100",
    }),
  );

  const result =
    processor.getById("evt-100");

  assert.ok(result);
  assert.equal(result.id, "evt-100");
});

test("processor filters events", () => {
  const processor =
    new AuditEventProcessor();

  processor.process(
    createEvent({
      id: "evt-1",
      type: "created",
      resource: "user",
      severity: "info",
    }),
  );

  processor.process(
    createEvent({
      id: "evt-2",
      type: "updated",
      resource: "project",
      severity: "warning",
    }),
  );

  const userEvents =
    processor.find({
      resource: "user",
    });

  assert.equal(userEvents.length, 1);
  assert.equal(
    userEvents[0]?.id,
    "evt-1",
  );

  const warningEvents =
    processor.find({
      severity: "warning",
    });

  assert.equal(warningEvents.length, 1);
  assert.equal(
    warningEvents[0]?.id,
    "evt-2",
  );
});

test("processor supports processMany", () => {
  const processor =
    new AuditEventProcessor();

  const events = [
    createEvent({
      id: "evt-1",
    }),
    createEvent({
      id: "evt-2",
    }),
    createEvent({
      id: "evt-3",
    }),
  ];

  const result =
    processor.processMany(events);

  assert.equal(result.length, 3);
  assert.equal(processor.count(), 3);
});

test("processor clear works", () => {
  const processor =
    new AuditEventProcessor();

  processor.process(createEvent());

  assert.equal(processor.count(), 1);

  processor.clear();

  assert.equal(processor.count(), 0);
  assert.deepEqual(
    processor.all(),
    [],
  );
});

test("publisher health works", () => {
  const publisher =
    new AuditEventPublisher();

  const health =
    publisher.health();

  assert.equal(
    health.healthy,
    true,
  );

  assert.equal(
    health.listenerCount,
    0,
  );

  assert.ok(health.timestamp);
});

test("processor health works", () => {
  const processor =
    new AuditEventProcessor();

  const health =
    processor.health();

  assert.equal(
    health.healthy,
    true,
  );

  assert.equal(
    health.eventCount,
    0,
  );

  assert.ok(health.timestamp);
});

test("publisher and processor integration works", () => {
  const publisher =
    new AuditEventPublisher();

  const processor =
    new AuditEventProcessor();

  publisher.subscribe(
    (event) => {
      processor.process(event);
    },
  );

  const event =
    publisher.publish({
      type: "authenticated",
      action: "login",
      resource: "user",
      resourceId: "user-1",
      actorId: "user-1",
    });

  const stored =
    processor.getById(event.id);

  assert.ok(stored);

  assert.equal(
    stored?.type,
    "authenticated",
  );

  assert.equal(
    stored?.action,
    "login",
  );

  assert.equal(
    processor.count(),
    1,
  );
});