// services/analytics/events/test_events.ts

import {
  createAnalyticsEvent,
  validateEventInput,
} from "./events.js";

import {
  EventConsumer,
} from "./consumer.js";

const assert = {
  ok(value: unknown): void {
    if (!value) {
      throw new Error("Assertion failed");
    }
  },

  equal(actual: unknown, expected: unknown): void {
    if (actual !== expected) {
      throw new Error(
        `Expected ${String(expected)} but received ${String(actual)}`,
      );
    }
  },

  doesNotThrow(fn: () => void): void {
    try {
      fn();
    } catch (error) {
      throw new Error(
        `Expected function not to throw, but it threw ${
          error instanceof Error ? error.message : String(error)
        }`,
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

  async rejects(
    fn: () => Promise<unknown> | unknown,
    expected?: RegExp | string,
  ): Promise<void> {
    try {
      await fn();
      throw new Error("Expected function to reject");
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
            `Expected rejected value to match ${String(expected)}, got ${message}`,
          );
        }
      }
    }
  },
};

async function test(
  name: string,
  fn: () => Promise<void> | void,
): Promise<void> {
  try {
    await fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
}

await test("events module", async () => {
  await test(
    "creates an analytics event",
    () => {
      const event =
        createAnalyticsEvent({
          organizationId: "org-1",
          type: "request",
          source: "api-gateway",
          data: {
            endpoint: "/chat",
          },
        });

      assert.ok(event.id);

      assert.equal(
        event.organizationId,
        "org-1",
      );

      assert.equal(
        event.type,
        "request",
      );

      assert.equal(
        event.severity,
        "info",
      );

      assert.equal(
        event.source,
        "api-gateway",
      );

      assert.equal(
        event.data.endpoint,
        "/chat",
      );

      assert.ok(event.timestamp);
    },
  );

  await test(
    "supports all event types",
    () => {
      const types = [
        "request",
        "response",
        "error",
        "latency",
        "cost",
        "quality",
        "token_usage",
        "cache",
        "custom",
      ] as const;

      for (const type of types) {
        const event =
          createAnalyticsEvent({
            organizationId: "org-types",
            type,
            source: "test",
          });

        assert.equal(
          event.type,
          type,
        );
      }
    },
  );

  await test(
    "supports severity levels",
    () => {
      const severities = [
        "debug",
        "info",
        "warning",
        "error",
        "critical",
      ] as const;

      for (const severity of severities) {
        const event =
          createAnalyticsEvent({
            organizationId: "org-severity",
            type: "error",
            severity,
            source: "test",
          });

        assert.equal(
          event.severity,
          severity,
        );
      }
    },
  );

  await test(
    "supports request metadata",
    () => {
      const event =
        createAnalyticsEvent({
          organizationId: "org-meta",
          type: "request",
          source: "gateway",
          requestId: "req-123",
          userId: "user-123",
          provider: "openai",
          model: "gpt-model",
        });

      assert.equal(
        event.requestId,
        "req-123",
      );

      assert.equal(
        event.userId,
        "user-123",
      );

      assert.equal(
        event.provider,
        "openai",
      );

      assert.equal(
        event.model,
        "gpt-model",
      );
    },
  );

  await test(
    "validates event input",
    () => {
      assert.doesNotThrow(() =>
        validateEventInput({
          organizationId: "org-valid",
          type: "request",
          source: "test",
        }),
      );
    },
  );

  await test(
    "rejects empty organization",
    () => {
      assert.throws(
        () =>
          createAnalyticsEvent({
            organizationId: "",
            type: "request",
            source: "test",
          }),
        /Organization ID cannot be empty/,
      );
    },
  );

  await test(
    "rejects empty source",
    () => {
      assert.throws(
        () =>
          createAnalyticsEvent({
            organizationId: "org-1",
            type: "request",
            source: "",
          }),
        /Event source cannot be empty/,
      );
    },
  );

  await test(
    "rejects invalid timestamp",
    () => {
      assert.throws(
        () =>
          createAnalyticsEvent({
            organizationId: "org-1",
            type: "request",
            source: "test",
            timestamp: "invalid-date",
          }),
        /Invalid event timestamp/,
      );
    },
  );

  await test(
    "consumer starts and stops",
    () => {
      const consumer =
        new EventConsumer();

      assert.equal(
        consumer.isRunning(),
        false,
      );

      consumer.start();

      assert.equal(
        consumer.isRunning(),
        true,
      );

      consumer.stop();

      assert.equal(
        consumer.isRunning(),
        false,
      );
    },
  );

  await test(
    "publishes events to consumer",
    async () => {
      const consumer =
        new EventConsumer();

      consumer.start();

      let received = false;

      consumer.register(
        (event) => {
          received = true;

          assert.equal(
            event.type,
            "request",
          );
        },
      );

      await consumer.publish({
        organizationId: "org-publish",
        type: "request",
        source: "api",
      });

      assert.equal(
        received,
        true,
      );
    },
  );

  await test(
    "stores published events",
    async () => {
      const consumer =
        new EventConsumer();

      consumer.start();

      const event =
        await consumer.publish({
          organizationId: "org-store",
          type: "request",
          source: "api",
        });

      assert.equal(
        consumer.size(),
        1,
      );

      const stored =
        consumer.getEvent(event.id);

      assert.ok(stored);

      assert.equal(
        stored?.id,
        event.id,
      );
    },
  );

  await test(
    "filters consumer events",
    async () => {
      const consumer =
        new EventConsumer();

      consumer.start();

      let received = 0;

      consumer.register(
        () => {
          received += 1;
        },
        {
          organizationId: "org-filter",
          type: "error",
        },
      );

      await consumer.publish({
        organizationId: "org-filter",
        type: "request",
        source: "api",
      });

      await consumer.publish({
        organizationId: "org-filter",
        type: "error",
        source: "api",
      });

      assert.equal(
        received,
        1,
      );
    },
  );

  await test(
    "supports event queries",
    async () => {
      const consumer =
        new EventConsumer();

      consumer.start();

      await consumer.publish({
        organizationId: "org-query",
        type: "request",
        source: "api",
      });

      await consumer.publish({
        organizationId: "org-query",
        type: "error",
        source: "api",
      });

      const errors =
        consumer.getEvents({
          organizationId: "org-query",
          type: "error",
        });

      assert.equal(
        errors.length,
        1,
      );

      assert.equal(
        errors[0].type,
        "error",
      );
    },
  );

  await test(
    "supports unregister",
    () => {
      const consumer =
        new EventConsumer();

      const id =
        consumer.register(
          () => undefined,
        );

      assert.equal(
        consumer.consumerCount(),
        1,
      );

      assert.equal(
        consumer.unregister(id),
        true,
      );

      assert.equal(
        consumer.consumerCount(),
        0,
      );
    },
  );

  await test(
    "rejects publish before start",
    async () => {
      const consumer =
        new EventConsumer();

      await assert.rejects(
        () =>
          consumer.publish({
            organizationId: "org-1",
            type: "request",
            source: "api",
          }),
        /Event consumer is not running/,
      );
    },
  );

  await test(
    "enforces event retention",
    async () => {
      const consumer =
        new EventConsumer({
          maxEvents: 2,
        });

      consumer.start();

      await consumer.publish({
        organizationId: "org-retention",
        type: "request",
        source: "api",
      });

      await consumer.publish({
        organizationId: "org-retention",
        type: "response",
        source: "api",
      });

      await consumer.publish({
        organizationId: "org-retention",
        type: "error",
        source: "api",
      });

      assert.equal(
        consumer.size(),
        2,
      );

      const events =
        consumer.getEvents({
          organizationId:
            "org-retention",
        });

      assert.equal(
        events[0].type,
        "response",
      );

      assert.equal(
        events[1].type,
        "error",
      );
    },
  );

  await test(
    "returns consumer health",
    () => {
      const consumer =
        new EventConsumer();

      consumer.start();

      const health =
        consumer.health();

      assert.equal(
        health.running,
        true,
      );

      assert.equal(
        health.healthy,
        true,
      );

      assert.equal(
        health.eventCount,
        0,
      );

      assert.equal(
        health.consumerCount,
        0,
      );
    },
  );

  await test(
    "clears events",
    async () => {
      const consumer =
        new EventConsumer();

      consumer.start();

      await consumer.publish({
        organizationId: "org-clear",
        type: "request",
        source: "api",
      });

      assert.equal(
        consumer.size(),
        1,
      );

      consumer.clear();

      assert.equal(
        consumer.size(),
        0,
      );
    },
  );

  console.log(
    "Events test suite completed successfully.",
  );
});