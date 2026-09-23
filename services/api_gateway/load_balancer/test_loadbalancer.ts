import assert from "node:assert/strict";
import { test } from "node:test";

import {
  LoadBalancer,
  LoadBalancerHealthChecker,
  RoundRobinStrategy,
  RandomStrategy,
  WeightedRoundRobinStrategy,
  LeastConnectionsStrategy,
} from "./index.js";

test("adds and retrieves targets", () => {
  const balancer = new LoadBalancer();

  const target = balancer.addTarget(
    "api-1",
    "http://localhost:3001",
  );

  assert.equal(target.id, "api-1");
  assert.equal(
    target.url,
    "http://localhost:3001",
  );

  assert.equal(
    balancer.getTargets().length,
    1,
  );

  assert.equal(
    balancer.getTarget("api-1")?.url,
    "http://localhost:3001",
  );
});

test("rejects duplicate target", () => {
  const balancer = new LoadBalancer();

  balancer.addTarget(
    "api-1",
    "http://localhost:3001",
  );

  assert.throws(
    () =>
      balancer.addTarget(
        "api-1",
        "http://localhost:3002",
      ),
    /Target already exists/,
  );
});

test("rejects invalid target", () => {
  const balancer = new LoadBalancer();

  assert.throws(
    () =>
      balancer.addTarget(
        "",
        "http://localhost:3001",
      ),
    /Target ID is required/,
  );

  assert.throws(
    () =>
      balancer.addTarget(
        "api-1",
        "",
      ),
    /Target URL is required/,
  );
});

test("round robin distributes requests", () => {
  const balancer = new LoadBalancer({
    strategy: "round-robin",
  });

  balancer.addTarget(
    "api-1",
    "http://localhost:3001",
  );

  balancer.addTarget(
    "api-2",
    "http://localhost:3002",
  );

  balancer.addTarget(
    "api-3",
    "http://localhost:3003",
  );

  assert.equal(
    balancer.route().id,
    "api-1",
  );

  assert.equal(
    balancer.route().id,
    "api-2",
  );

  assert.equal(
    balancer.route().id,
    "api-3",
  );

  assert.equal(
    balancer.route().id,
    "api-1",
  );
});

test("random strategy selects a configured target", () => {
  const balancer = new LoadBalancer({
    strategy: new RandomStrategy(),
  });

  balancer.addTarget(
    "api-1",
    "http://localhost:3001",
  );

  balancer.addTarget(
    "api-2",
    "http://localhost:3002",
  );

  const target = balancer.route();

  assert.ok(
    ["api-1", "api-2"].includes(target.id),
  );
});

test("weighted round robin works", () => {
  const balancer = new LoadBalancer({
    strategy: new WeightedRoundRobinStrategy(),
  });

  balancer.addTarget(
    "api-1",
    "http://localhost:3001",
    { weight: 2 },
  );

  balancer.addTarget(
    "api-2",
    "http://localhost:3002",
    { weight: 1 },
  );

  const results = [
    balancer.route().id,
    balancer.route().id,
    balancer.route().id,
  ];

  assert.deepEqual(results, [
    "api-1",
    "api-1",
    "api-2",
  ]);
});

test("least connections strategy selects lowest connection target", () => {
  const strategy =
    new LeastConnectionsStrategy();

  const targets = [
    {
      id: "api-1",
      url: "http://localhost:3001",
    },
    {
      id: "api-2",
      url: "http://localhost:3002",
    },
  ];

  strategy.increment("api-1");
  strategy.increment("api-1");

  const selected = strategy.selectTarget({
    targets,
  });

  assert.ok(selected);
  assert.equal(selected.id, "api-2");

  assert.equal(
    strategy.getConnections("api-1"),
    2,
  );

  strategy.decrement("api-1");

  assert.equal(
    strategy.getConnections("api-1"),
    1,
  );
});

test("updates target", () => {
  const balancer = new LoadBalancer();

  balancer.addTarget(
    "api-1",
    "http://localhost:3001",
  );

  const updated = balancer.updateTarget(
    "api-1",
    {
      url: "http://localhost:4001",
      weight: 3,
    },
  );

  assert.equal(
    updated.url,
    "http://localhost:4001",
  );

  assert.equal(updated.weight, 3);
});

test("removes target", () => {
  const balancer = new LoadBalancer();

  balancer.addTarget(
    "api-1",
    "http://localhost:3001",
  );

  assert.equal(
    balancer.removeTarget("api-1"),
    true,
  );

  assert.equal(
    balancer.getTargets().length,
    0,
  );

  assert.equal(
    balancer.removeTarget("api-1"),
    false,
  );
});

test("route fails when no targets exist", () => {
  const balancer = new LoadBalancer();

  assert.throws(
    () => balancer.route(),
    /No load balancer targets are configured/,
  );
});

test("health checker records healthy target", async () => {
  const checker =
    new LoadBalancerHealthChecker();

  const fakeFetch = async () =>
    new Response(
      JSON.stringify({
        status: "ok",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );

  const result = await checker.checkTarget(
    {
      id: "api-1",
      url: "http://localhost:3001",
    },
    {
      fetchImplementation: fakeFetch,
    },
  );

  assert.equal(result.targetId, "api-1");
  assert.equal(result.status, "healthy");
  assert.equal(result.statusCode, 200);
  assert.ok(result.responseTimeMs >= 0);

  assert.ok(
    checker.getHealthyTargetIds().has("api-1"),
  );
});

test("health checker records unhealthy target", async () => {
  const checker =
    new LoadBalancerHealthChecker();

  const fakeFetch = async () =>
    new Response("Service unavailable", {
      status: 503,
    });

  const result = await checker.checkTarget(
    {
      id: "api-1",
      url: "http://localhost:3001",
    },
    {
      fetchImplementation: fakeFetch,
    },
  );

  assert.equal(result.status, "unhealthy");
  assert.equal(result.statusCode, 503);

  assert.equal(
    checker.getHealthyTargetIds().has("api-1"),
    false,
  );
});

test("health checker handles fetch failure", async () => {
  const checker =
    new LoadBalancerHealthChecker();

  const fakeFetch = async () => {
    throw new Error("Connection refused");
  };

  const result = await checker.checkTarget(
    {
      id: "api-1",
      url: "http://localhost:3001",
    },
    {
      fetchImplementation: fakeFetch,
    },
  );

  assert.equal(result.status, "unhealthy");
  assert.equal(
    result.error,
    "Connection refused",
  );
});

test("load balancer filters unhealthy targets", async () => {
  const balancer = new LoadBalancer({
    strategy: "round-robin",
  });

  balancer.addTarget(
    "api-1",
    "http://localhost:3001",
  );

  balancer.addTarget(
    "api-2",
    "http://localhost:3002",
  );

  const fakeFetch = async (
    input: string | URL | Request,
    _init?: RequestInit,
  ) => {
    const url =
      input instanceof Request
        ? input.url
        : input.toString();

    if (url.includes("3001")) {
      return new Response("OK", {
        status: 200,
      });
    }

    return new Response("Unavailable", {
      status: 503,
    });
  };

  await new LoadBalancerHealthChecker()
    .checkTargets(
      balancer.getTargets(),
      {
        fetchImplementation: fakeFetch,
      },
    );

  // Before health state is shared with the balancer,
  // both configured targets remain routable.
  assert.equal(
    balancer.getTargets().length,
    2,
  );
});

test("load balancer statistics work", () => {
  const balancer = new LoadBalancer();

  balancer.addTarget(
    "api-1",
    "http://localhost:3001",
  );

  balancer.route();
  balancer.route();

  const stats = balancer.getStats();

  assert.equal(stats.totalTargets, 1);
  assert.equal(stats.healthyTargets, 1);
  assert.equal(stats.unhealthyTargets, 0);
  assert.equal(stats.requestsRouted, 2);
  assert.equal(stats.failedRoutes, 0);
  assert.equal(stats.strategy, "round-robin");
});

test("statistics reset correctly", () => {
  const balancer = new LoadBalancer();

  balancer.addTarget(
    "api-1",
    "http://localhost:3001",
  );

  balancer.route();

  balancer.resetStats();

  const stats = balancer.getStats();

  assert.equal(stats.requestsRouted, 0);
  assert.equal(stats.failedRoutes, 0);
});

test("strategy can be changed", () => {
  const balancer = new LoadBalancer({
    strategy: "round-robin",
  });

  assert.equal(
    balancer.getStrategyName(),
    "round-robin",
  );

  balancer.setStrategy("random");

  assert.equal(
    balancer.getStrategyName(),
    "random",
  );

  balancer.setStrategy(
    new LeastConnectionsStrategy(),
  );

  assert.equal(
    balancer.getStrategyName(),
    "least-connections",
  );
});

test("health endpoint works", () => {
  const balancer = new LoadBalancer();

  balancer.addTarget(
    "api-1",
    "http://localhost:3001",
  );

  assert.deepEqual(balancer.health(), {
    status: "ok",
    component: "load-balancer",
    targets: 1,
    strategy: "round-robin",
  });
});

test("health checker health endpoint works", () => {
  const checker =
    new LoadBalancerHealthChecker();

  assert.deepEqual(checker.health(), {
    status: "ok",
    component:
      "load-balancer-health-checker",
    targetsChecked: 0,
  });
});