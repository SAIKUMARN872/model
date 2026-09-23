import { strict as assert } from "node:assert";
import { test } from "node:test";

import {
  ServiceDiscovery,
  ServiceRegistry,
  createServiceInstance,
  getServiceUrl,
} from "./index.js";

const userService = {
  serviceName: "user-service",
  host: "localhost",
  port: 3001,
  protocol: "http" as const,
  version: "1.0.0",
  weight: 1,
  metadata: {
    environment: "test",
    region: "india",
  },
};

const orderService = {
  serviceName: "order-service",
  host: "localhost",
  port: 3002,
  protocol: "http" as const,
  version: "1.0.0",
  weight: 2,
};

test("create service instance", () => {
  const instance = createServiceInstance(
    userService,
    "user-1",
  );

  assert.equal(instance.id, "user-1");
  assert.equal(
    instance.serviceName,
    "user-service",
  );
  assert.equal(instance.port, 3001);
  assert.equal(instance.status, "starting");
});

test("service URL is generated correctly", () => {
  const instance = createServiceInstance(
    userService,
    "user-1",
  );

  assert.equal(
    getServiceUrl(instance),
    "http://localhost:3001",
  );
});

test("registry starts empty", () => {
  const registry = new ServiceRegistry();

  assert.equal(registry.size(), 0);
  assert.equal(registry.serviceCount(), 0);
});

test("register service instance", () => {
  const registry = new ServiceRegistry();

  const instance = registry.register(
    userService,
    "user-1",
  );

  assert.equal(instance.id, "user-1");
  assert.equal(registry.size(), 1);
  assert.equal(
    registry.serviceCount(),
    1,
  );
});

test("duplicate instance registration is rejected", () => {
  const registry = new ServiceRegistry();

  registry.register(
    userService,
    "user-1",
  );

  assert.throws(
    () =>
      registry.register(
        userService,
        "user-1",
      ),
    /Service instance already exists/,
  );
});

test("get service instance", () => {
  const registry = new ServiceRegistry();

  registry.register(
    userService,
    "user-1",
  );

  const instance =
    registry.get("user-1");

  assert.ok(instance);
  assert.equal(
    instance?.serviceName,
    "user-service",
  );
});

test("get instances by service", () => {
  const registry = new ServiceRegistry();

  registry.register(
    userService,
    "user-1",
  );

  registry.register(
    {
      ...userService,
      port: 3002,
    },
    "user-2",
  );

  registry.register(
    orderService,
    "order-1",
  );

  const users =
    registry.getByService("user-service");

  assert.equal(users.length, 2);
});

test("heartbeat changes starting service to healthy", () => {
  const registry = new ServiceRegistry();

  registry.register(
    userService,
    "user-1",
  );

  const instance =
    registry.heartbeat("user-1");

  assert.equal(instance.status, "healthy");
  assert.ok(instance.lastHeartbeatAt);
});

test("set service status", () => {
  const registry = new ServiceRegistry();

  registry.register(
    userService,
    "user-1",
  );

  const instance =
    registry.setStatus(
      "user-1",
      "draining",
    );

  assert.equal(
    instance.status,
    "draining",
  );
});

test("healthy service discovery", () => {
  const registry = new ServiceRegistry();

  registry.register(
    userService,
    "user-1",
  );

  registry.heartbeat("user-1");

  const healthy =
    registry.getHealthy(
      "user-service",
    );

  assert.equal(healthy.length, 1);
  assert.equal(
    healthy[0]?.status,
    "healthy",
  );
});

test("query by version", () => {
  const registry = new ServiceRegistry();

  registry.register(
    userService,
    "user-1",
  );

  registry.register(
    {
      ...userService,
      version: "2.0.0",
      port: 3002,
    },
    "user-2",
  );

  const version2 =
    registry.query({
      serviceName: "user-service",
      version: "2.0.0",
    });

  assert.equal(version2.length, 1);
  assert.equal(
    version2[0]?.id,
    "user-2",
  );
});

test("query by metadata", () => {
  const registry = new ServiceRegistry();

  registry.register(
    userService,
    "user-1",
  );

  registry.register(
    {
      ...userService,
      port: 3002,
      metadata: {
        environment: "production",
        region: "india",
      },
    },
    "user-2",
  );

  const result =
    registry.query({
      metadata: {
        environment: "production",
      },
    });

  assert.equal(result.length, 1);
  assert.equal(
    result[0]?.id,
    "user-2",
  );
});

test("service summaries work", () => {
  const registry = new ServiceRegistry();

  registry.register(
    userService,
    "user-1",
  );

  registry.register(
    {
      ...userService,
      port: 3002,
      version: "2.0.0",
    },
    "user-2",
  );

  registry.heartbeat("user-1");
  registry.setStatus(
    "user-2",
    "unhealthy",
  );

  const summaries =
    registry.getSummaries();

  assert.equal(summaries.length, 1);
  assert.equal(
    summaries[0]?.serviceName,
    "user-service",
  );
  assert.equal(
    summaries[0]?.totalInstances,
    2,
  );
  assert.equal(
    summaries[0]?.healthyInstances,
    1,
  );
  assert.equal(
    summaries[0]?.unhealthyInstances,
    1,
  );
  assert.deepEqual(
    summaries[0]?.versions.sort(),
    ["1.0.0", "2.0.0"],
  );
});

test("update service instance", () => {
  const registry = new ServiceRegistry();

  registry.register(
    userService,
    "user-1",
  );

  const updated =
    registry.update(
      "user-1",
      {
        port: 4000,
        version: "2.0.0",
      },
    );

  assert.equal(updated.port, 4000);
  assert.equal(
    updated.version,
    "2.0.0",
  );
});

test("deregister service instance", () => {
  const registry = new ServiceRegistry();

  registry.register(
    userService,
    "user-1",
  );

  assert.equal(
    registry.deregister("user-1"),
    true,
  );

  assert.equal(registry.size(), 0);
});

test("remove unhealthy services", () => {
  const registry = new ServiceRegistry();

  registry.register(
    userService,
    "user-1",
  );

  registry.register(
    {
      ...userService,
      port: 3002,
    },
    "user-2",
  );

  registry.setStatus(
    "user-2",
    "unhealthy",
  );

  const removed =
    registry.removeUnhealthy();

  assert.equal(removed, 1);
  assert.equal(registry.size(), 1);
});

test("registry health works", () => {
  const registry = new ServiceRegistry();

  registry.register(
    userService,
    "user-1",
  );

  registry.heartbeat("user-1");

  const health =
    registry.health();

  assert.equal(health.healthy, true);
  assert.equal(
    health.serviceCount,
    1,
  );
  assert.equal(
    health.instanceCount,
    1,
  );
  assert.equal(
    health.healthyInstances,
    1,
  );
});

test("service discovery round robin works", () => {
  const discovery =
    new ServiceDiscovery({
      strategy: "round_robin",
    });

  discovery.register(
    userService,
    "user-1",
  );

  discovery.register(
    {
      ...userService,
      port: 3002,
    },
    "user-2",
  );

  discovery.heartbeat("user-1");
  discovery.heartbeat("user-2");

  const first =
    discovery.discover(
      "user-service",
    );

  const second =
    discovery.discover(
      "user-service",
    );

  assert.equal(
    first.instance.id,
    "user-1",
  );

  assert.equal(
    second.instance.id,
    "user-2",
  );
});

test("service discovery first strategy works", () => {
  const discovery =
    new ServiceDiscovery({
      strategy: "first",
    });

  discovery.register(
    userService,
    "user-1",
  );

  discovery.register(
    {
      ...userService,
      port: 3002,
    },
    "user-2",
  );

  discovery.heartbeat("user-1");
  discovery.heartbeat("user-2");

  const result =
    discovery.discover(
      "user-service",
    );

  assert.equal(
    result.instance.id,
    "user-1",
  );

  assert.equal(
    result.url,
    "http://localhost:3001",
  );
});

test("service discovery does not return unhealthy services", () => {
  const discovery =
    new ServiceDiscovery();

  discovery.register(
    userService,
    "user-1",
  );

  assert.throws(
    () =>
      discovery.discover(
        "user-service",
      ),
    /No healthy instances found/,
  );
});

test("service discovery returns all healthy instances", () => {
  const discovery =
    new ServiceDiscovery();

  discovery.register(
    userService,
    "user-1",
  );

  discovery.register(
    {
      ...userService,
      port: 3002,
    },
    "user-2",
  );

  discovery.heartbeat("user-1");
  discovery.heartbeat("user-2");

  const instances =
    discovery.discoverAll(
      "user-service",
    );

  assert.equal(instances.length, 2);
});

test("service discovery health works", () => {
  const discovery =
    new ServiceDiscovery();

  discovery.register(
    userService,
    "user-1",
  );

  discovery.heartbeat("user-1");

  const health =
    discovery.health();

  assert.equal(health.healthy, true);
  assert.equal(
    health.registry.serviceCount,
    1,
  );
});

test("registry clear works", () => {
  const registry = new ServiceRegistry();

  registry.register(
    userService,
    "user-1",
  );

  registry.clear();

  assert.equal(registry.size(), 0);
  assert.equal(
    registry.serviceCount(),
    0,
  );
});

test("invalid service name is rejected", () => {
  const registry = new ServiceRegistry();

  assert.throws(
    () =>
      registry.register(
        {
          ...userService,
          serviceName: "invalid service",
        },
        "user-1",
      ),
    /Invalid service name/,
  );
});

test("invalid service port is rejected", () => {
  const registry = new ServiceRegistry();

  assert.throws(
    () =>
      registry.register(
        {
          ...userService,
          port: 70000,
        },
        "user-1",
      ),
    /Service port must be between/,
  );
});