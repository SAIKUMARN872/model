// services/analytics/database/test_database.ts

import {
  DatabaseConnection,
} from "./connection.js";

const assert = {
  equal(actual: unknown, expected: unknown): void {
    if (actual !== expected) {
      throw new Error(
        `Expected ${String(expected)} but received ${String(actual)}`,
      );
    }
  },

  ok(value: unknown): void {
    if (!value) {
      throw new Error("Assertion failed");
    }
  },

  notEqual(actual: unknown, expected: unknown): void {
    if (actual === expected) {
      throw new Error(
        `Expected values to differ, but both were ${String(actual)}`,
      );
    }
  },

  throws(fn: () => void, expected?: RegExp | string): void {
    try {
      fn();
      throw new Error("Expected function to throw");
    } catch (error) {
      if (expected) {
        const message =
          error instanceof Error
            ? error.message
            : String(error);

        if (
          (typeof expected === "string" &&
            !message.includes(expected)) ||
          (expected instanceof RegExp &&
            !expected.test(message))
        ) {
          throw new Error(
            `Expected thrown error to match ${String(expected)}, got ${message}`,
          );
        }
      }
    }
  },
};

async function test(name: string, fn: () => Promise<void> | void): Promise<void> {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

await test("database module", async () => {
  const database =
    new DatabaseConnection({
      maxRecords: 100,
    });

  await test(
    "starts disconnected",
    () => {
      assert.equal(
        database.isConnected(),
        false,
      );

      assert.throws(
        () =>
          database.create({
            organizationId: "org-1",
            eventType: "request",
          }),
        /Database is not connected/,
      );
    },
  );

  await test(
    "connects successfully",
    () => {
      database.connect();

      assert.equal(
        database.isConnected(),
        true,
      );

      assert.equal(
        database.health().connected,
        true,
      );
    },
  );

  await test(
    "creates a record",
    () => {
      const record =
        database.create({
          organizationId: "org-1",
          eventType: "api.request",
          data: {
            model: "gpt",
            latency: 120,
          },
        });

      assert.ok(record.id);

      assert.equal(
        record.organizationId,
        "org-1",
      );

      assert.equal(
        record.eventType,
        "api.request",
      );

      assert.equal(
        record.status,
        "active",
      );

      assert.equal(
        record.data.model,
        "gpt",
      );
    },
  );

  await test(
    "gets record by ID",
    () => {
      const created =
        database.create({
          organizationId: "org-get",
          eventType: "test",
        });

      const record =
        database.getById(
          "org-get",
          created.id,
        );

      assert.ok(record);

      assert.equal(
        record?.id,
        created.id,
      );
    },
  );

  await test(
    "isolates organizations",
    () => {
      const created =
        database.create({
          organizationId: "org-a",
          eventType: "request",
        });

      const result =
        database.getById(
          "org-b",
          created.id,
        );

      assert.equal(
        result,
        undefined,
      );
    },
  );

  await test(
    "finds records by organization",
    () => {
      database.create({
        organizationId: "org-find",
        eventType: "request",
      });

      database.create({
        organizationId: "org-find",
        eventType: "response",
      });

      database.create({
        organizationId: "org-other",
        eventType: "request",
      });

      const records =
        database.find({
          organizationId: "org-find",
        });

      assert.equal(
        records.length,
        2,
      );
    },
  );

  await test(
    "filters by event type",
    () => {
      database.create({
        organizationId: "org-filter",
        eventType: "latency",
      });

      database.create({
        organizationId: "org-filter",
        eventType: "cost",
      });

      const records =
        database.find({
          organizationId: "org-filter",
          eventType: "latency",
        });

      assert.equal(
        records.length,
        1,
      );

      assert.equal(
        records[0].eventType,
        "latency",
      );
    },
  );

  await test(
    "updates a record",
    () => {
      const created =
        database.create({
          organizationId: "org-update",
          eventType: "old.event",
          data: {
            value: 1,
          },
        });

      const updated =
        database.update(
          "org-update",
          created.id,
          {
            eventType: "new.event",
            data: {
              value: 2,
            },
          },
        );

      assert.equal(
        updated.eventType,
        "new.event",
      );

      assert.equal(
        updated.data.value,
        2,
      );

      assert.notEqual(
        updated.updatedAt,
        created.createdAt,
      );
    },
  );

  await test(
    "soft deletes a record",
    () => {
      const created =
        database.create({
          organizationId: "org-soft-delete",
          eventType: "request",
        });

      const deleted =
        database.softDelete(
          "org-soft-delete",
          created.id,
        );

      assert.equal(
        deleted.status,
        "deleted",
      );
    },
  );

  await test(
    "hard deletes a record",
    () => {
      const created =
        database.create({
          organizationId: "org-hard-delete",
          eventType: "request",
        });

      assert.equal(
        database.delete(
          "org-hard-delete",
          created.id,
        ),
        true,
      );

      assert.equal(
        database.getById(
          "org-hard-delete",
          created.id,
        ),
        undefined,
      );
    },
  );

  await test(
    "returns statistics",
    () => {
      const stats =
        database.stats();

      assert.ok(
        stats.totalRecords >= 0,
      );

      assert.ok(
        stats.organizations >= 0,
      );

      assert.ok(
        stats.activeRecords >= 0,
      );

      assert.ok(
        stats.inactiveRecords >= 0,
      );

      assert.ok(
        stats.deletedRecords >= 0,
      );
    },
  );

  await test(
    "returns organization statistics",
    () => {
      const stats =
        database.stats(
          "org-find",
        );

      assert.equal(
        stats.organizations,
        1,
      );
    },
  );

  await test(
    "returns database health",
    () => {
      const health =
        database.health();

      assert.equal(
        health.connected,
        true,
      );

      assert.equal(
        health.healthy,
        true,
      );
    },
  );

  await test(
    "supports transactions",
    () => {
      const before =
        database.size();

      assert.throws(
        () =>
          database.transaction(
            (db) => {
              db.create({
                organizationId:
                  "org-transaction",
                eventType:
                  "transaction.test",
              });

              throw new Error(
                "rollback",
              );
            },
          ),
        /rollback/,
      );

      assert.equal(
        database.size(),
        before,
      );
    },
  );

  await test(
    "supports successful transactions",
    () => {
      const before =
        database.size();

      database.transaction(
        (db) => {
          db.create({
            organizationId:
              "org-success",
            eventType:
              "transaction.success",
          });
        },
      );

      assert.equal(
        database.size(),
        before + 1,
      );
    },
  );

  await test(
    "rejects empty organization ID",
    () => {
      assert.throws(
        () =>
          database.create({
            organizationId: "",
            eventType: "request",
          }),
        /Organization ID cannot be empty/,
      );
    },
  );

  await test(
    "rejects empty event type",
    () => {
      assert.throws(
        () =>
          database.create({
            organizationId: "org-1",
            eventType: "",
          }),
        /Event type cannot be empty/,
      );
    },
  );

  await test(
    "clears organization",
    () => {
      database.create({
        organizationId: "org-clear",
        eventType: "one",
      });

      database.create({
        organizationId: "org-clear",
        eventType: "two",
      });

      const removed =
        database.clearOrganization(
          "org-clear",
        );

      assert.equal(
        removed,
        2,
      );

      assert.equal(
        database.count(
          "org-clear",
        ),
        0,
      );
    },
  );

  await test(
    "clears all records",
    () => {
      database.clear();

      assert.equal(
        database.size(),
        0,
      );
    },
  );

  await test(
    "disconnects successfully",
    () => {
      database.disconnect();

      assert.equal(
        database.isConnected(),
        false,
      );

      assert.equal(
        database.health().connected,
        false,
      );
    },
  );

  console.log(
    "Database test suite completed successfully.",
  );
});