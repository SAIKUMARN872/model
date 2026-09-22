// services/analytics/audit/test_audit.ts

import {
  AuditLogger,
} from "./logger.js";

import type {
  AuditEvent,
} from "./events.js";

type TestFunction = () => void;

function assert(
  condition: boolean,
  message: string,
): void {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual<T>(
  actual: T,
  expected: T,
  message: string,
): void {
  if (actual !== expected) {
    throw new Error(
      `${message}\nExpected: ${String(expected)}\nActual: ${String(actual)}`,
    );
  }
}

function assertThrows(
  fn: TestFunction,
  message: string,
): void {
  let thrown = false;

  try {
    fn();
  } catch {
    thrown = true;
  }

  assert(thrown, message);
}

function test(
  name: string,
  fn: TestFunction,
): void {
  try {
    fn();

    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);

    throw error;
  }
}

function createLogger(): AuditLogger {
  return new AuditLogger({
    maxEventsPerOrganization: 100,
    defaultQueryLimit: 100,
    maxQueryLimit: 500,
  });
}

function createEvent(
  logger: AuditLogger,
  overrides: Partial<Parameters<
    AuditLogger["log"]
  >[0]> = {},
): AuditEvent {
  return logger.log({
    organizationId: "org-001",

    eventType: "api",

    action: "request.completed",

    severity: "info",

    outcome: "success",

    actor: {
      type: "user",
      id: "user-001",
      name: "Test User",
    },

    request: {
      requestId: "req-001",
      correlationId: "corr-001",
      traceId: "trace-001",
      ipAddress: "127.0.0.1",
      userAgent: "test-agent",
      serviceName: "modelnow-api",
      environment: "test",
    },

    metadata: {
      provider: "openai",
      model: "test-model",
      latencyMs: 120,
    },

    ...overrides,
  });
}

test(
  "AuditLogger initializes correctly",
  () => {
    const logger = createLogger();

    const health = logger.health();

    assertEqual(
      health.healthy,
      true,
      "Logger should be healthy",
    );

    assertEqual(
      health.totalEvents,
      0,
      "Logger should start empty",
    );

    assertEqual(
      health.organizations,
      0,
      "Logger should start with zero organizations",
    );
  },
);

test(
  "creates an audit event",
  () => {
    const logger = createLogger();

    const event = createEvent(logger);

    assert(
      event.id.length > 0,
      "Event ID should exist",
    );

    assertEqual(
      event.organizationId,
      "org-001",
      "Organization ID should match",
    );

    assertEqual(
      event.eventType,
      "api",
      "Event type should match",
    );

    assertEqual(
      event.action,
      "request.completed",
      "Action should match",
    );

    assert(
      event.eventHash.length === 64,
      "SHA-256 hash should contain 64 characters",
    );
  },
);

test(
  "defaults severity and outcome",
  () => {
    const logger = createLogger();

    const event = logger.log({
      organizationId: "org-001",

      eventType: "system",

      action: "system.started",

      actor: {
        type: "system",
        id: "system-001",
      },
    });

    assertEqual(
      event.severity,
      "info",
      "Default severity should be info",
    );

    assertEqual(
      event.outcome,
      "success",
      "Default outcome should be success",
    );
  },
);

test(
  "supports successful events",
  () => {
    const logger = createLogger();

    const event = logger.success({
      organizationId: "org-001",

      eventType: "authentication",

      action: "login",

      actor: {
        type: "user",
        id: "user-001",
      },
    });

    assertEqual(
      event.outcome,
      "success",
      "Outcome should be success",
    );
  },
);

test(
  "supports failed events",
  () => {
    const logger = createLogger();

    const event = logger.failure({
      organizationId: "org-001",

      eventType: "api",

      action: "request.failed",

      actor: {
        type: "service",
        id: "api-service",
      },
    });

    assertEqual(
      event.outcome,
      "failure",
      "Outcome should be failure",
    );

    assertEqual(
      event.severity,
      "error",
      "Default failure severity should be error",
    );
  },
);

test(
  "supports denied events",
  () => {
    const logger = createLogger();

    const event = logger.denied({
      organizationId: "org-001",

      eventType: "authorization",

      action: "access.denied",

      actor: {
        type: "user",
        id: "user-001",
      },
    });

    assertEqual(
      event.outcome,
      "denied",
      "Outcome should be denied",
    );

    assertEqual(
      event.severity,
      "warning",
      "Default denied severity should be warning",
    );
  },
);

test(
  "supports resource information",
  () => {
    const logger = createLogger();

    const event = createEvent(logger, {
      resource: {
        type: "model",
        id: "model-001",
        name: "gpt-production",
      },
    });

    assertEqual(
      event.resource?.type,
      "model",
      "Resource type should match",
    );

    assertEqual(
      event.resource?.id,
      "model-001",
      "Resource ID should match",
    );
  },
);

test(
  "redacts sensitive metadata",
  () => {
    const logger = createLogger();

    const event = createEvent(logger, {
      metadata: {
        username: "user",
        password: "super-secret",
        token: "secret-token",
        apiKey: "secret-api-key",
        safeValue: "visible",
      },
    });

    assertEqual(
      event.metadata.password,
      "[REDACTED]",
      "Password should be redacted",
    );

    assertEqual(
      event.metadata.token,
      "[REDACTED]",
      "Token should be redacted",
    );

    assertEqual(
      event.metadata.apiKey,
      "[REDACTED]",
      "API key should be redacted",
    );

    assertEqual(
      event.metadata.safeValue,
      "visible",
      "Safe metadata should remain",
    );
  },
);

test(
  "redacts nested sensitive metadata",
  () => {
    const logger = createLogger();

    const event = createEvent(logger, {
      metadata: {
        user: {
          name: "Prasanth",
          credentials: {
            password: "secret",
            token: "token-value",
          },
        },
      },
    });

    const user =
      event.metadata.user as Record<
        string,
        unknown
      >;

    const credentials =
      user.credentials as Record<
        string,
        unknown
      >;

    assertEqual(
      credentials.password,
      "[REDACTED]",
      "Nested password should be redacted",
    );

    assertEqual(
      credentials.token,
      "[REDACTED]",
      "Nested token should be redacted",
    );
  },
);

test(
  "isolates organizations",
  () => {
    const logger = createLogger();

    createEvent(logger, {
      organizationId: "org-A",
    });

    createEvent(logger, {
      organizationId: "org-B",
    });

    const orgA = logger.query({
      organizationId: "org-A",
    });

    const orgB = logger.query({
      organizationId: "org-B",
    });

    assertEqual(
      orgA.length,
      1,
      "Organization A should have one event",
    );

    assertEqual(
      orgB.length,
      1,
      "Organization B should have one event",
    );

    assertEqual(
      orgA[0].organizationId,
      "org-A",
      "Organization A must not see B events",
    );

    assertEqual(
      orgB[0].organizationId,
      "org-B",
      "Organization B must not see A events",
    );
  },
);

test(
  "queries by event type",
  () => {
    const logger = createLogger();

    createEvent(logger, {
      eventType: "authentication",
      action: "login",
    });

    createEvent(logger, {
      eventType: "api",
      action: "request.completed",
    });

    const events = logger.query({
      organizationId: "org-001",
      eventType: "authentication",
    });

    assertEqual(
      events.length,
      1,
      "Should return one authentication event",
    );

    assertEqual(
      events[0].action,
      "login",
      "Returned event should be login",
    );
  },
);

test(
  "queries by outcome",
  () => {
    const logger = createLogger();

    createEvent(logger, {
      outcome: "success",
    });

    createEvent(logger, {
      outcome: "failure",
    });

    const failures = logger.query({
      organizationId: "org-001",
      outcome: "failure",
    });

    assertEqual(
      failures.length,
      1,
      "Should return one failed event",
    );
  },
);

test(
  "queries by actor",
  () => {
    const logger = createLogger();

    createEvent(logger, {
      actor: {
        type: "user",
        id: "user-A",
      },
    });

    createEvent(logger, {
      actor: {
        type: "user",
        id: "user-B",
      },
    });

    const events = logger.query({
      organizationId: "org-001",
      actorId: "user-A",
    });

    assertEqual(
      events.length,
      1,
      "Should return one event for user A",
    );

    assertEqual(
      events[0].actor.id,
      "user-A",
      "Actor should be user A",
    );
  },
);

test(
  "queries by request ID",
  () => {
    const logger = createLogger();

    createEvent(logger, {
      request: {
        requestId: "req-A",
      },
    });

    createEvent(logger, {
      request: {
        requestId: "req-B",
      },
    });

    const events = logger.query({
      organizationId: "org-001",
      requestId: "req-A",
    });

    assertEqual(
      events.length,
      1,
      "Should return one event for req-A",
    );
  },
);

test(
  "returns newest events first",
  () => {
    const logger = createLogger();

    const first = createEvent(logger, {
      action: "first",
    });

    const second = createEvent(logger, {
      action: "second",
    });

    const events = logger.query({
      organizationId: "org-001",
    });

    assertEqual(
      events[0].id,
      second.id,
      "Newest event should be returned first",
    );

    assertEqual(
      events[1].id,
      first.id,
      "Oldest event should be returned second",
    );
  },
);

test(
  "limits query results",
  () => {
    const logger = createLogger();

    for (let i = 0; i < 10; i++) {
      createEvent(logger, {
        action: `action.${i}`,
      });
    }

    const events = logger.query({
      organizationId: "org-001",
      limit: 3,
    });

    assertEqual(
      events.length,
      3,
      "Query should respect limit",
    );
  },
);

test(
  "enforces organization retention",
  () => {
    const logger = new AuditLogger({
      maxEventsPerOrganization: 3,
    });

    for (let i = 0; i < 5; i++) {
      createEvent(logger, {
        action: `action.${i}`,
      });
    }

    assertEqual(
      logger.count("org-001"),
      3,
      "Only three events should be retained",
    );

    const events = logger.query({
      organizationId: "org-001",
    });

    assertEqual(
      events[0].action,
      "action.4",
      "Newest event should remain",
    );

    assertEqual(
      events[2].action,
      "action.2",
      "Oldest retained event should remain",
    );
  },
);

test(
  "creates a hash chain",
  () => {
    const logger = createLogger();

    const first = createEvent(logger, {
      action: "first",
    });

    const second = createEvent(logger, {
      action: "second",
    });

    assertEqual(
      first.previousEventHash,
      undefined,
      "First event should have no previous hash",
    );

    assertEqual(
      second.previousEventHash,
      first.eventHash,
      "Second event should reference first hash",
    );

    assertEqual(
      logger.verifyIntegrity("org-001"),
      true,
      "Hash chain should be valid",
    );
  },
);

test(
  "getById returns the correct event",
  () => {
    const logger = createLogger();

    const created = createEvent(logger);

    const found = logger.getById(
      "org-001",
      created.id,
    );

    assert(
      found !== undefined,
      "Event should be found",
    );

    assertEqual(
      found?.id,
      created.id,
      "Returned event ID should match",
    );
  },
);

test(
  "getById does not cross organization boundaries",
  () => {
    const logger = createLogger();

    const event = createEvent(logger, {
      organizationId: "org-A",
    });

    const result = logger.getById(
      "org-B",
      event.id,
    );

    assertEqual(
      result,
      undefined,
      "Event must not be accessible from another organization",
    );
  },
);

test(
  "rejects empty organization ID",
  () => {
    const logger = createLogger();

    assertThrows(
      () =>
        logger.log({
          organizationId: "",

          eventType: "api",

          action: "test",

          actor: {
            type: "system",
            id: "system",
          },
        }),

      "Empty organization ID should be rejected",
    );
  },
);

test(
  "rejects empty action",
  () => {
    const logger = createLogger();

    assertThrows(
      () =>
        logger.log({
          organizationId: "org-001",

          eventType: "api",

          action: "",

          actor: {
            type: "system",
            id: "system",
          },
        }),

      "Empty action should be rejected",
    );
  },
);

test(
  "rejects empty actor ID",
  () => {
    const logger = createLogger();

    assertThrows(
      () =>
        logger.log({
          organizationId: "org-001",

          eventType: "api",

          action: "test",

          actor: {
            type: "system",
            id: "",
          },
        }),

      "Empty actor ID should be rejected",
    );
  },
);

test(
  "supports custom sensitive keys",
  () => {
    const logger = new AuditLogger({
      sensitiveKeys: [
        "internalSecret",
      ],
    });

    const event = createEvent(logger, {
      metadata: {
        internalSecret: "hidden",
      },
    });

    assertEqual(
      event.metadata.internalSecret,
      "[REDACTED]",
      "Custom sensitive key should be redacted",
    );
  },
);

test(
  "reports logger health",
  () => {
    const logger = createLogger();

    createEvent(logger, {
      organizationId: "org-A",
    });

    createEvent(logger, {
      organizationId: "org-B",
    });

    const health = logger.health();

    assertEqual(
      health.healthy,
      true,
      "Logger should be healthy",
    );

    assertEqual(
      health.totalEvents,
      2,
      "Health should report two events",
    );

    assertEqual(
      health.organizations,
      2,
      "Health should report two organizations",
    );
  },
);

test(
  "clears organization events",
  () => {
    const logger = createLogger();

    createEvent(logger);

    createEvent(logger);

    const removed =
      logger.clearOrganization(
        "org-001",
      );

    assertEqual(
      removed,
      2,
      "Two events should be removed",
    );

    assertEqual(
      logger.count("org-001"),
      0,
      "Organization should contain zero events",
    );
  },
);

test(
  "handles circular metadata safely",
  () => {
    const logger = createLogger();

    const metadata: Record<
      string,
      unknown
    > = {
      service: "test",
    };

    metadata.self = metadata;

    const event = createEvent(logger, {
      metadata,
    });

    assertEqual(
      event.metadata.self,
      "[Circular]",
      "Circular metadata should be safely represented",
    );
  },
);

console.log("");
console.log(
  "Audit test suite completed successfully.",
);