import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";
import assert from "node:assert/strict";

const root = process.cwd();

const analyticsTests = [
  "anomaly_detection/test_anomaly_detection.ts",
  "audit/test_audit.ts",
  "cache/test_cache.ts",
  "config/test_config.ts",
  "cost/test_cost.ts",
  "dashboards/test_dashboard.ts",
  "database/test_database.ts",
  "events/test_events.ts",
  "forecasting/test_forecasting.ts",
  "latency/test_latency.ts",
  "metrics/test_metrics.ts",
  "models/test_models.ts",
  "organizations/test_organizations.ts",
  "performance/test_performance.ts",
  "reports/test_reports.ts",
  "routing/test_routing.ts",
  "usage/test_usage.ts",
  "users/test_users.ts",
];

test("MODELNOW ANALYTICS COMPLETE TEST", () => {
  console.log("");
  console.log("========================================");
  console.log("MODELNOW ANALYTICS TEST");
  console.log("========================================");

  console.log("SERVICE: analytics");
  console.log("TEST MODE: existing module tests");
  console.log("TOTAL MODULES:", analyticsTests.length);

  let passed = 0;
  let failed = 0;

  for (const relativeTest of analyticsTests) {
    const testPath = join(
      root,
      "services",
      "analytics",
      relativeTest,
    );

    console.log("");
    console.log("----------------------------------------");
    console.log("TEST FILE:", relativeTest);
    console.log("----------------------------------------");

    if (!existsSync(testPath)) {
      console.log("STATUS: MISSING");
      failed++;
      continue;
    }

    try {
      execFileSync(
        process.execPath,
        [
          join(root, "node_modules", "tsx", "dist", "cli.mjs"),
          "--test",
          testPath,
        ],
        {
          cwd: root,
          stdio: "inherit",
          encoding: "utf8",
        },
      );

      console.log("MODULE TEST: PASS");
      passed++;
    } catch {
      console.log("MODULE TEST: FAIL");
      failed++;
    }
  }

  console.log("");
  console.log("========================================");
  console.log("ANALYTICS TEST SUMMARY");
  console.log("========================================");
  console.log("TOTAL:", analyticsTests.length);
  console.log("PASSED:", passed);
  console.log("FAILED:", failed);
  console.log("FINAL DONE:", failed === 0);
  console.log("ANALYTICS TEST:", failed === 0 ? "PASS" : "FAIL");
  console.log("========================================");

  assert.equal(
    failed,
    0,
    `${failed} analytics module test(s) failed`,
  );
});
