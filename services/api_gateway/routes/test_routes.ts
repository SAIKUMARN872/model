import assert from "node:assert/strict";
import test from "node:test";

import {
  ApiVersionManager,
} from "./versioning.js";

import {
  ServiceRouteRegistry,
} from "./service_routes.js";

import {
  ApiRouter,
} from "./router.js";

test("ApiVersionManager adds API version", () => {
  const manager =
    new ApiVersionManager("v1");

  const version =
    manager.addVersion("v1");

  assert.equal(
    version.version,
    "v1",
  );

  assert.equal(
    version.prefix,
    "/api/v1",
  );

  assert.equal(
    manager.size(),
    1,
  );
});

test("ApiVersionManager resolves versioned path", () => {
  const manager =
    new ApiVersionManager("v1");

  manager.addVersion("v1");
  manager.addVersion("v2");

  const result =
    manager.resolve(
      "/api/v2/users",
    );

  assert.equal(
    result.version,
    "v2",
  );

  assert.equal(
    result.path,
    "/users",
  );
});

test("ApiVersionManager resolves default version", () => {
  const manager =
    new ApiVersionManager("v1");

  manager.addVersion("v1");

  const result =
    manager.resolve("/users");

  assert.equal(
    result.version,
    "v1",
  );

  assert.equal(
    result.path,
    "/users",
  );
});

test("ApiVersionManager supports deprecation", () => {
  const manager =
    new ApiVersionManager("v1");

  manager.addVersion("v1");

  manager.updateVersion(
    "v1",
    {
      deprecated: true,
      sunsetAt:
        "2027-01-01T00:00:00Z",
    },
  );

  assert.equal(
    manager.isDeprecated("v1"),
    true,
  );

  const version =
    manager.getVersion("v1");

  assert.equal(
    version?.sunsetAt,
    "2027-01-01T00:00:00Z",
  );
});

test("ApiVersionManager rejects invalid version", () => {
  const manager =
    new ApiVersionManager("v1");

  assert.throws(() => {
    manager.addVersion("version1");
  });
});

test("ServiceRouteRegistry adds route", () => {
  const registry =
    new ServiceRouteRegistry();

  registry.add({
    id: "get-users",
    service: "user-service",
    method: "GET",
    path: "/users",
    handler: () => ({
      status: 200,
      body: {
        users: [],
      },
    }),
  });

  assert.equal(
    registry.size(),
    1,
  );

  const route =
    registry.get(
      "GET",
      "/users",
    );

  assert.ok(route);
  assert.equal(
    route.service,
    "user-service",
  );
});

test("ServiceRouteRegistry dispatches route", async () => {
  const registry =
    new ServiceRouteRegistry();

  registry.add({
    id: "health",
    service: "health-service",
    method: "GET",
    path: "/health",
    handler: () => ({
      status: 200,
      body: {
        healthy: true,
      },
    }),
  });

  const response =
    await registry.dispatch({
      method: "GET",
      path: "/health",
    });

  assert.equal(
    response.status,
    200,
  );

  assert.deepEqual(
    response.body,
    {
      healthy: true,
    },
  );
});

test("ServiceRouteRegistry returns 404 for unknown route", async () => {
  const registry =
    new ServiceRouteRegistry();

  const response =
    await registry.dispatch({
      method: "GET",
      path: "/unknown",
    });

  assert.equal(
    response.status,
    404,
  );
});

test("ServiceRouteRegistry filters by service", () => {
  const registry =
    new ServiceRouteRegistry();

  registry.add({
    id: "users",
    service: "user-service",
    method: "GET",
    path: "/users",
    handler: () => ({
      status: 200,
    }),
  });

  registry.add({
    id: "user-by-id",
    service: "user-service",
    method: "GET",
    path: "/users/:id",
    handler: () => ({
      status: 200,
    }),
  });

  registry.add({
    id: "models",
    service: "model-service",
    method: "GET",
    path: "/models",
    handler: () => ({
      status: 200,
    }),
  });

  const routes =
    registry.getByService(
      "user-service",
    );

  assert.equal(
    routes.length,
    2,
  );
});

test("ApiRouter handles versioned route", async () => {
  const versions =
    new ApiVersionManager("v1");

  versions.addVersion("v1");
  versions.addVersion("v2");

  const router =
    new ApiRouter({
      versionManager: versions,
    });

  router.addRoute(
    "GET",
    "/users",
    () => ({
      status: 200,
      body: {
        message: "Users API",
      },
    }),
    {
      id: "users-v2",
      service: "user-service",
    },
  );

  const result =
    await router.get(
      "/api/v2/users",
    );

  assert.equal(
    result.routeFound,
    true,
  );

  assert.equal(
    result.version,
    "v2",
  );

  assert.equal(
    result.path,
    "/users",
  );

  assert.equal(
    result.response.status,
    200,
  );
});

test("ApiRouter handles POST route", async () => {
  const router =
    new ApiRouter();

  router.addRoute(
    "POST",
    "/users",
    (request) => ({
      status: 201,
      body: {
        name: request.body,
      },
    }),
    {
      id: "create-user",
      service: "user-service",
    },
  );

  const result =
    await router.post(
      "/users",
      {
        body: {
          name: "Prasanth",
        },
      },
    );

  assert.equal(
    result.routeFound,
    true,
  );

  assert.equal(
    result.response.status,
    201,
  );

  assert.deepEqual(
    result.response.body,
    {
      name: {
        name: "Prasanth",
      },
    },
  );
});

test("ApiRouter returns 404 for missing route", async () => {
  const router =
    new ApiRouter();

  const result =
    await router.get(
      "/api/v1/missing",
    );

  assert.equal(
    result.routeFound,
    false,
  );

  assert.equal(
    result.response.status,
    404,
  );
});

test("ApiRouter health works", () => {
  const versions =
    new ApiVersionManager("v1");

  versions.addVersion("v1");

  const router =
    new ApiRouter({
      versionManager: versions,
    });

  router.addRoute(
    "GET",
    "/health",
    () => ({
      status: 200,
    }),
    {
      id: "health",
      service: "health-service",
    },
  );

  const health =
    router.health();

  assert.equal(
    health.healthy,
    true,
  );

  assert.equal(
    health.routes.routeCount,
    1,
  );

  assert.equal(
    health.versions.versionCount,
    1,
  );
});

test("ServiceRouteRegistry rejects duplicate route", () => {
  const registry =
    new ServiceRouteRegistry();

  const route = {
    id: "test",
    service: "test-service",
    method: "GET" as const,
    path: "/test",
    handler: () => ({
      status: 200,
    }),
  };

  registry.add(route);

  assert.throws(() => {
    registry.add({
      ...route,
      id: "test-duplicate",
    });
  });
});

test("ServiceRouteRegistry removes route", () => {
  const registry =
    new ServiceRouteRegistry();

  registry.add({
    id: "test",
    service: "test-service",
    method: "GET",
    path: "/test",
    handler: () => ({
      status: 200,
    }),
  });

  assert.equal(
    registry.remove(
      "GET",
      "/test",
    ),
    true,
  );

  assert.equal(
    registry.size(),
    0,
  );
});