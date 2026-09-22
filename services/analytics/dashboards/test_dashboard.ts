// services/analytics/dashboards/test_dashboard.ts

import {
  DashboardManager,
} from "./dashboard.js";

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

await test("dashboard module", async () => {
  const manager = new DashboardManager({
    maxDashboardsPerOrganization: 5,
    maxWidgetsPerDashboard: 3,
    retentionLimit: 100,
  });

  await test(
    "creates dashboard",
    () => {
      const dashboard =
        manager.createDashboard({
          organizationId: "org-1",
          name: "AI Analytics",
          description: "AI usage dashboard",
        });

      assert.equal(
        dashboard.organizationId,
        "org-1",
      );

      assert.equal(
        dashboard.name,
        "AI Analytics",
      );

      assert.equal(
        dashboard.widgets.length,
        0,
      );
    },
  );

  await test(
    "isolates organizations",
    () => {
      const dashboard =
        manager.createDashboard({
          organizationId: "org-2",
          name: "Organization 2",
        });

      assert.equal(
        manager.getByOrganization("org-1")
          .some(
            (item) =>
              item.id === dashboard.id,
          ),
        false,
      );

      assert.equal(
        manager.getByOrganization("org-2")
          .length,
        1,
      );
    },
  );

  await test(
    "updates dashboard",
    () => {
      const dashboard =
        manager.createDashboard({
          organizationId: "org-3",
          name: "Old Name",
        });

      const updated =
        manager.updateDashboard(
          "org-3",
          dashboard.id,
          {
            name: "New Name",
            description: "Updated",
          },
        );

      assert.equal(
        updated.name,
        "New Name",
      );

      assert.equal(
        updated.description,
        "Updated",
      );
    },
  );

  await test(
    "supports default dashboard",
    () => {
      const first =
        manager.createDashboard({
          organizationId: "org-default",
          name: "First",
          isDefault: true,
        });

      const second =
        manager.createDashboard({
          organizationId: "org-default",
          name: "Second",
          isDefault: true,
        });

      const current =
        manager.getDefault("org-default");

      assert.ok(current);

      assert.equal(
        current?.id,
        second.id,
      );

      const firstReloaded =
        manager.getDashboard(
          "org-default",
          first.id,
        );

      assert.equal(
        firstReloaded?.isDefault,
        false,
      );
    },
  );

  await test(
    "adds widget",
    () => {
      const dashboard =
        manager.createDashboard({
          organizationId: "org-widget",
          name: "Widget Dashboard",
        });

      const widget =
        manager.addWidget(
          "org-widget",
          dashboard.id,
          {
            type: "metric",
            title: "Total Requests",
            size: "small",
            config: {
              metric: "requests.total",
              unit: "count",
            },
          },
        );

      assert.equal(
        widget.type,
        "metric",
      );

      assert.equal(
        widget.title,
        "Total Requests",
      );

      const loaded =
        manager.getWidget(
          "org-widget",
          dashboard.id,
          widget.id,
        );

      assert.ok(loaded);
      assert.equal(
        loaded?.title,
        "Total Requests",
      );
    },
  );

  await test(
    "updates widget",
    () => {
      const dashboard =
        manager.createDashboard({
          organizationId: "org-update-widget",
          name: "Dashboard",
        });

      const widget =
        manager.addWidget(
          "org-update-widget",
          dashboard.id,
          {
            type: "line",
            title: "Latency",
          },
        );

      const updated =
        manager.updateWidget(
          "org-update-widget",
          dashboard.id,
          widget.id,
          {
            title: "Average Latency",
            size: "large",
          },
        );

      assert.equal(
        updated.title,
        "Average Latency",
      );

      assert.equal(
        updated.size,
        "large",
      );
    },
  );

  await test(
    "removes widget",
    () => {
      const dashboard =
        manager.createDashboard({
          organizationId: "org-remove",
          name: "Dashboard",
        });

      const widget =
        manager.addWidget(
          "org-remove",
          dashboard.id,
          {
            type: "bar",
            title: "Costs",
          },
        );

      assert.equal(
        manager.removeWidget(
          "org-remove",
          dashboard.id,
          widget.id,
        ),
        true,
      );

      assert.equal(
        manager.getDashboard(
          "org-remove",
          dashboard.id,
        )?.widgets.length,
        0,
      );
    },
  );

  await test(
    "rejects empty organization",
    () => {
      assert.throws(
        () =>
          manager.createDashboard({
            organizationId: "",
            name: "Dashboard",
          }),
        /Organization ID cannot be empty/,
      );
    },
  );

  await test(
    "rejects empty dashboard name",
    () => {
      assert.throws(
        () =>
          manager.createDashboard({
            organizationId: "org-1",
            name: "",
          }),
        /Dashboard name cannot be empty/,
      );
    },
  );

  await test(
    "rejects invalid widget type",
    () => {
      const dashboard =
        manager.createDashboard({
          organizationId: "org-invalid",
          name: "Dashboard",
        });

      assert.throws(
        () =>
          manager.addWidget(
            "org-invalid",
            dashboard.id,
            {
              type: "invalid" as "metric",
              title: "Invalid",
            },
          ),
        /Unsupported widget type/,
      );
    },
  );

  await test(
    "enforces widget limit",
    () => {
      const dashboard =
        manager.createDashboard({
          organizationId: "org-limit",
          name: "Dashboard",
        });

      manager.addWidget(
        "org-limit",
        dashboard.id,
        {
          type: "metric",
          title: "One",
        },
      );

      manager.addWidget(
        "org-limit",
        dashboard.id,
        {
          type: "metric",
          title: "Two",
        },
      );

      manager.addWidget(
        "org-limit",
        dashboard.id,
        {
          type: "metric",
          title: "Three",
        },
      );

      assert.throws(
        () =>
          manager.addWidget(
            "org-limit",
            dashboard.id,
            {
              type: "metric",
              title: "Four",
            },
          ),
        /Widget limit exceeded/,
      );
    },
  );

  await test(
    "deletes dashboard",
    () => {
      const dashboard =
        manager.createDashboard({
          organizationId: "org-delete",
          name: "Delete Me",
        });

      assert.equal(
        manager.deleteDashboard(
          "org-delete",
          dashboard.id,
        ),
        true,
      );

      assert.equal(
        manager.getDashboard(
          "org-delete",
          dashboard.id,
        ),
        undefined,
      );
    },
  );

  await test(
    "clears organization",
    () => {
      manager.createDashboard({
        organizationId: "org-clear",
        name: "One",
      });

      manager.createDashboard({
        organizationId: "org-clear",
        name: "Two",
      });

      const removed =
        manager.clearOrganization(
          "org-clear",
        );

      assert.equal(removed, 2);

      assert.equal(
        manager.getByOrganization(
          "org-clear",
        ).length,
        0,
      );
    },
  );

  await test(
    "returns health",
    () => {
      const health = manager.health();

      assert.equal(
        typeof health.healthy,
        "boolean",
      );

      assert.ok(
        health.dashboards >= 0,
      );

      assert.ok(
        health.organizations >= 0,
      );
    },
  );

  await test(
    "clears manager",
    () => {
      manager.clear();

      assert.equal(
        manager.size(),
        0,
      );
    },
  );
});