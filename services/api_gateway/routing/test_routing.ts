import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  RoutingLoadBalancer,
  ServiceRouter,
  type RoutingTarget,
} from "./index.js";

const targetA: RoutingTarget = {
  id: "users-1",
  url: "http://localhost:3001",
  weight: 1,
  healthy: true,
};

const targetB: RoutingTarget = {
  id: "users-2",
  url: "http://localhost:3002",
  weight: 2,
  healthy: true,
};

test("load balancer creates successfully", () => {
  const lb = new RoutingLoadBalancer();

  assert.equal(lb.size(), 0);
  assert.equal(lb.getStrategy(), "round_robin");
});

test("load balancer adds targets", () => {
  const lb = new RoutingLoadBalancer();

  lb.addTarget(targetA);
  lb.addTarget(targetB);

  assert.equal(lb.size(), 2);
  assert.equal(lb.getTarget("users-1")?.url, "http://localhost:3001");
});

test("load balancer rejects duplicate targets", () => {
  const lb = new RoutingLoadBalancer();

  lb.addTarget(targetA);

  assert.throws(
    () => lb.addTarget(targetA),
    /Target already exists/,
  );
});

test("round robin selects healthy targets", () => {
  const lb = new RoutingLoadBalancer({
    strategy: "round_robin",
  });

  lb.addTarget(targetA);
  lb.addTarget(targetB);

  const first = lb.selectTarget();
  const second = lb.selectTarget();

  assert.equal(first.id, "users-1");
  assert.equal(second.id, "users-2");
});

test("unhealthy targets are excluded", () => {
  const lb = new RoutingLoadBalancer();

  lb.addTarget(targetA);
  lb.addTarget({
    ...targetB,
    healthy: false,
  });

  for (let index = 0; index < 5; index += 1) {
    assert.equal(lb.selectTarget().id, "users-1");
  }
});

test("least connections selects the target with fewer connections", () => {
  const lb = new RoutingLoadBalancer({
    strategy: "least_connections",
  });

  lb.addTarget(targetA);
  lb.addTarget(targetB);

  lb.acquire("users-1");
  lb.acquire("users-1");
  lb.acquire("users-1");

  const selected = lb.selectTarget();

  assert.equal(selected.id, "users-2");
});

test("release never makes connections negative", () => {
  const lb = new RoutingLoadBalancer();

  lb.addTarget(targetA);

  lb.release("users-1");
  lb.release("users-1");

  assert.equal(lb.getTarget("users-1")?.activeConnections, 0);
});

test("weighted strategy works", () => {
  const lb = new RoutingLoadBalancer({
    strategy: "weighted",
  });

  lb.addTarget({
    id: "weighted-1",
    url: "http://localhost:4001",
    weight: 1,
  });

  lb.addTarget({
    id: "weighted-2",
    url: "http://localhost:4002",
    weight: 10,
  });

  const selected = lb.selectTarget();

  assert.ok(
    selected.id === "weighted-1" ||
      selected.id === "weighted-2",
  );
});

test("health reports healthy targets", () => {
  const lb = new RoutingLoadBalancer();

  lb.addTarget(targetA);
  lb.addTarget({
    ...targetB,
    healthy: false,
  });

  const health = lb.health();

  assert.equal(health.targetCount, 2);
  assert.equal(health.healthyTargets, 1);
  assert.equal(health.healthy, true);
});

test("health becomes unhealthy when all targets are unhealthy", () => {
  const lb = new RoutingLoadBalancer();

  lb.addTarget({
    ...targetA,
    healthy: false,
  });

  const health = lb.health();

  assert.equal(health.targetCount, 1);
  assert.equal(health.healthyTargets, 0);
  assert.equal(health.healthy, false);
});

test("service router adds a route", () => {
  const router = new ServiceRouter();

  router.addRoute({
    service: "user-service",
    path: "/users",
    methods: ["GET"],
    targets: [targetA],
  });

  assert.equal(router.size(), 1);

  const route = router.getRoute(
    "user-service",
    "/users",
  );

  assert.ok(route);
  assert.equal(route?.service, "user-service");
  assert.deepEqual(route?.methods, ["GET"]);
});

test("service router resolves a GET request", () => {
  const router = new ServiceRouter();

  router.addRoute({
    service: "user-service",
    path: "/users",
    methods: ["GET"],
    targets: [targetA],
  });

  const response = router.route({
    service: "user-service",
    path: "/users",
    method: "GET",
  });

  assert.equal(response.statusCode, 200);
  assert.equal(response.service, "user-service");
  assert.equal(response.targetId, "users-1");
  assert.equal(response.targetUrl, "http://localhost:3001");
});

test("service router rejects unsupported method", () => {
  const router = new ServiceRouter();

  router.addRoute({
    service: "user-service",
    path: "/users",
    methods: ["GET"],
    targets: [targetA],
  });

  assert.throws(
    () =>
      router.route({
        service: "user-service",
        path: "/users",
        method: "POST",
      }),
    /Method POST is not allowed/,
  );
});

test("service router rejects missing route", () => {
  const router = new ServiceRouter();

  assert.throws(
    () =>
      router.route({
        service: "user-service",
        path: "/missing",
        method: "GET",
      }),
    /No route found/,
  );
});

test("service router supports multiple methods", () => {
  const router = new ServiceRouter();

  router.addRoute({
    service: "order-service",
    path: "/orders",
    methods: ["GET", "POST", "PUT"],
    targets: [targetA],
  });

  const getResponse = router.route({
    service: "order-service",
    path: "/orders",
    method: "GET",
  });

  const postResponse = router.route({
    service: "order-service",
    path: "/orders",
    method: "POST",
  });

  assert.equal(getResponse.method, "GET");
  assert.equal(postResponse.method, "POST");
});

test("service router excludes unhealthy route targets", () => {
  const router = new ServiceRouter();

  router.addRoute({
    service: "payment-service",
    path: "/payments",
    methods: ["POST"],
    targets: [
      {
        id: "payment-1",
        url: "http://localhost:5001",
        healthy: false,
      },
      {
        id: "payment-2",
        url: "http://localhost:5002",
        healthy: true,
      },
    ],
  });

  const response = router.route({
    service: "payment-service",
    path: "/payments",
    method: "POST",
  });

  assert.equal(response.targetId, "payment-2");
});

test("service router normalizes paths", () => {
  const router = new ServiceRouter();

  router.addRoute({
    service: "catalog-service",
    path: "/products/",
    methods: ["GET"],
    targets: [targetA],
  });

  const response = router.route({
    service: "catalog-service",
    path: "products",
    method: "GET",
  });

  assert.equal(response.path, "/products");
});

test("service router updates routes", () => {
  const router = new ServiceRouter();

  router.addRoute({
    service: "user-service",
    path: "/users",
    methods: ["GET"],
    targets: [targetA],
  });

  const updated = router.updateRoute(
    "user-service",
    "/users",
    {
      methods: ["GET", "POST"],
    },
  );

  assert.deepEqual(updated.methods, ["GET", "POST"]);
});

test("service router removes routes", () => {
  const router = new ServiceRouter();

  router.addRoute({
    service: "user-service",
    path: "/users",
    methods: ["GET"],
    targets: [targetA],
  });

  assert.equal(
    router.removeRoute("user-service", "/users"),
    true,
  );

  assert.equal(router.size(), 0);
});

test("service router health works", () => {
  const router = new ServiceRouter();

  router.addRoute({
    service: "user-service",
    path: "/users",
    methods: ["GET"],
    targets: [targetA],
  });

  const health = router.health();

  assert.equal(health.routeCount, 1);
  assert.equal(health.targetCount, 1);
  assert.equal(health.healthyTargets, 1);
  assert.equal(health.healthy, true);
});

test("service router clear removes routes and targets", () => {
  const router = new ServiceRouter();

  router.addRoute({
    service: "user-service",
    path: "/users",
    methods: ["GET"],
    targets: [targetA],
  });

  router.clear();

  assert.equal(router.size(), 0);
  assert.equal(router.getLoadBalancer().size(), 0);
});

test("service router rejects duplicate routes", () => {
  const router = new ServiceRouter();

  router.addRoute({
    service: "user-service",
    path: "/users",
    methods: ["GET"],
    targets: [targetA],
  });

  assert.throws(
    () =>
      router.addRoute({
        service: "user-service",
        path: "/users/",
        methods: ["GET"],
        targets: [targetB],
      }),
    /Route already exists/,
  );
});