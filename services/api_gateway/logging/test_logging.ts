import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";

import {
  AuditLogger,
  Logger,
} from "./index.js";

test("logger creates structured log entries", () => {
  const output: string[] = [];

  const originalLog = console.log;

  console.log = (message?: unknown) => {
    output.push(String(message));
  };

  try {
    const logger = new Logger({
      serviceName: "test-service",
      level: "info",
      consoleOutput: true,
    });

    logger.info("Application started", {
      requestId: "req-001",
      userId: "user-001",
    });

    assert.equal(output.length, 1);

    const entry = JSON.parse(output[0]);

    assert.equal(
      entry.level,
      "info",
    );

    assert.equal(
      entry.message,
      "Application started",
    );

    assert.equal(
      entry.service,
      "test-service",
    );

    assert.equal(
      entry.context.requestId,
      "req-001",
    );
  } finally {
    console.log = originalLog;
  }
});

test("logger filters messages below minimum level", () => {
  const output: string[] = [];

  const originalLog = console.log;

  console.log = (message?: unknown) => {
    output.push(String(message));
  };

  try {
    const logger = new Logger({
      level: "warn",
      consoleOutput: true,
    });

    logger.debug("debug");
    logger.info("info");
    logger.warn("warning");

    assert.equal(output.length, 1);

    const entry = JSON.parse(output[0]);

    assert.equal(
      entry.level,
      "warn",
    );
  } finally {
    console.log = originalLog;
  }
});

test("logger writes errors with error information", () => {
  const output: string[] = [];

  const originalError = console.error;

  console.error = (message?: unknown) => {
    output.push(String(message));
  };

  try {
    const logger = new Logger({
      level: "error",
      consoleOutput: true,
    });

    const error = new Error(
      "Database connection failed",
    );

    logger.error(
      "Database request failed",
      {
        requestId: "req-002",
      },
      error,
    );

    assert.equal(output.length, 1);

    const entry = JSON.parse(output[0]);

    assert.equal(
      entry.level,
      "error",
    );

    assert.equal(
      entry.error.message,
      "Database connection failed",
    );

    assert.equal(
      entry.context.requestId,
      "req-002",
    );
  } finally {
    console.error = originalError;
  }
});

test("child logger preserves parent context", () => {
  const output: string[] = [];

  const originalLog = console.log;

  console.log = (message?: unknown) => {
    output.push(String(message));
  };

  try {
    const logger = new Logger({
      level: "info",
      consoleOutput: true,
    });

    const requestLogger = logger.child({
      requestId: "req-100",
      organizationId: "org-100",
    });

    requestLogger.info("Request received", {
      operation: "search",
    });

    assert.equal(output.length, 1);

    const entry = JSON.parse(output[0]);

    assert.equal(
      entry.context.requestId,
      "req-100",
    );

    assert.equal(
      entry.context.organizationId,
      "org-100",
    );

    assert.equal(
      entry.context.operation,
      "search",
    );
  } finally {
    console.log = originalLog;
  }
});

test("logger writes JSON logs to file", () => {
  const directory = mkdtempSync(
    join(tmpdir(), "modelnow-log-"),
  );

  const filePath = join(
    directory,
    "application.log",
  );

  const logger = new Logger({
    serviceName: "file-test",
    level: "info",
    filePath,
    consoleOutput: false,
  });

  logger.info("File log message");

  const content = readFileSync(
    filePath,
    "utf8",
  ).trim();

  const entry = JSON.parse(content);

  assert.equal(
    entry.message,
    "File log message",
  );

  assert.equal(
    entry.service,
    "file-test",
  );
});

test("audit logger records login events", () => {
  const audit = new AuditLogger({
    consoleOutput: false,
  });

  const event = audit.login(
    "user-001",
    "org-001",
    "req-001",
  );

  assert.ok(event.eventId);

  assert.equal(
    event.action,
    "login",
  );

  assert.equal(
    event.outcome,
    "success",
  );

  assert.equal(
    event.userId,
    "user-001",
  );

  assert.equal(
    event.organizationId,
    "org-001",
  );

  assert.equal(
    audit.size(),
    1,
  );
});

test("audit logger records authorization success", () => {
  const audit = new AuditLogger({
    consoleOutput: false,
  });

  const event =
    audit.authorization(
      "user-001",
      "documents",
      "success",
      {
        organizationId: "org-001",
        requestId: "req-200",
        resourceId: "doc-001",
      },
    );

  assert.equal(
    event.action,
    "authorize",
  );

  assert.equal(
    event.outcome,
    "success",
  );

  assert.equal(
    event.resource,
    "documents",
  );

  assert.equal(
    event.resourceId,
    "doc-001",
  );
});

test("audit logger records authorization denial", () => {
  const audit = new AuditLogger({
    consoleOutput: false,
  });

  const event =
    audit.authorization(
      "user-002",
      "admin-panel",
      "failure",
      {
        organizationId: "org-002",
      },
    );

  assert.equal(
    event.action,
    "deny",
  );

  assert.equal(
    event.outcome,
    "failure",
  );
});

test("audit logger filters events", () => {
  const audit = new AuditLogger({
    consoleOutput: false,
  });

  audit.login(
    "user-001",
    "org-001",
  );

  audit.login(
    "user-002",
    "org-002",
  );

  audit.logout(
    "user-001",
    "org-001",
  );

  const userEvents = audit.query({
    userId: "user-001",
  });

  assert.equal(
    userEvents.length,
    2,
  );

  const loginEvents = audit.query({
    action: "login",
  });

  assert.equal(
    loginEvents.length,
    2,
  );

  const organizationEvents =
    audit.query({
      organizationId: "org-002",
    });

  assert.equal(
    organizationEvents.length,
    1,
  );
});

test("audit logger supports limits", () => {
  const audit = new AuditLogger({
    consoleOutput: false,
  });

  audit.login("user-1");
  audit.login("user-2");
  audit.login("user-3");

  const events = audit.query({
    limit: 2,
  });

  assert.equal(
    events.length,
    2,
  );

  assert.equal(
    events[0].userId,
    "user-2",
  );

  assert.equal(
    events[1].userId,
    "user-3",
  );
});

test("health checks work", () => {
  const logger = new Logger({
    consoleOutput: false,
  });

  const audit = new AuditLogger({
    consoleOutput: false,
  });

  const loggerHealth = logger.health();
  const auditHealth = audit.health();

  assert.equal(
    loggerHealth.status,
    "healthy",
  );

  assert.equal(
    auditHealth.status,
    "healthy",
  );
});

test("audit logger clear removes events", () => {
  const audit = new AuditLogger({
    consoleOutput: false,
  });

  audit.login("user-001");

  assert.equal(
    audit.size(),
    1,
  );

  audit.clear();

  assert.equal(
    audit.size(),
    0,
  );
});