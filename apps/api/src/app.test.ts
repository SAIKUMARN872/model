import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import type { Server } from "node:http";
import app, { createApp } from "./app.js";
import { API_VERSION_PREFIX } from "./api/version.js";
import { computeWebhookSignature } from "./webhooks/webhook.security.js";
import { InvalidCredentialsError } from "./errors/authentication.error.js";
import { loadEnvironment } from "./config/environment.js";
import { getHttpMetricSnapshot, resetHttpMetricsForTests } from "./telemetry/metrics.js";

let server: Server;
let baseUrl: string;
let receivedWebhookEvent: unknown;

const webhookSecret = "test-only-webhook-secret-for-integration-tests";
const webhookSecrets = {
  getSecret: (_provider: string) => webhookSecret,
};

const testAuthenticationProvider = {
  async verifyAccessToken(token: string) {
    if (token !== "test-valid-token") {
      throw new InvalidCredentialsError();
    }
    return {
      userId: "api-integration-test-user",
      roles: ["user"],
      scopes: ["chat:read"],
    };
  },
};

before(async () => {
  const testApp = createApp({
    authenticationProvider: testAuthenticationProvider,
    webhooks: {
      secrets: webhookSecrets,
      handlers: {
        example: {
          handle: async (event) => {
            receivedWebhookEvent = event;
          },
        },
      },
    },
  });

  await new Promise<void>((resolve, reject) => {
    server = testApp.listen(0, "127.0.0.1", () => {
      const address = server.address();

      if (!address || typeof address === "string") {
        reject(new Error("Could not determine the test server address."));
        return;
      }

      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });

    server.once("error", reject);
  });
});

after(async () => {
  if (server?.listening) {
    await new Promise<void>((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
});

test("default app export remains available", () => {
  assert.equal(typeof app, "function");
});

test("GET / returns service status and security headers", async () => {
  const response = await fetch(baseUrl);
  const body = await response.json() as {
    service: string;
    version: string;
    status: string;
  };

  assert.equal(response.status, 200);
  assert.equal(body.service, "ModelNow API");
  assert.equal(body.version, "v1");
  assert.equal(body.status, "running");
  assert.ok(response.headers.get("x-request-id"));
  assert.equal(response.headers.get("x-powered-by"), null);
  assert.ok(response.headers.get("x-content-type-options"));
});

test("GET /api/v1/health succeeds", async () => {
  const response = await fetch(`${baseUrl}${API_VERSION_PREFIX}/health`);

  assert.equal(response.status, 200);
  assert.ok(response.headers.get("x-request-id"));
});


test("POST versioned /chat remains mounted and reports runtime unavailable", async () => {
  const response = await fetch(`${baseUrl}${API_VERSION_PREFIX}/chat`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer test-valid-token",
    },
    body: JSON.stringify({ message: "Hello ModelNow" }),
  });

  const body = await response.json() as {
    success: boolean;
    error: { code: string; message: string };
    requestId: string;
  };

  assert.equal(response.status, 503);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "RUNTIME_UNAVAILABLE");
  assert.ok(body.requestId);
  assert.equal(body.requestId, response.headers.get("x-request-id"));
});
test("versioned chat rejects requests without a bearer token", async () => {
  const response = await fetch(`${baseUrl}${API_VERSION_PREFIX}/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message: "Hello ModelNow" }),
  });
  const body = await response.json() as {
    success: boolean;
    error: { code: string };
  };

  assert.equal(response.status, 401);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "AUTHENTICATION_REQUIRED");
});

test("versioned chat rejects invalid bearer tokens", async () => {
  const response = await fetch(`${baseUrl}${API_VERSION_PREFIX}/chat`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: "Bearer invalid-test-token",
    },
    body: JSON.stringify({ message: "Hello ModelNow" }),
  });
  const body = await response.json() as {
    success: boolean;
    error: { code: string };
  };

  assert.equal(response.status, 401);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "INVALID_CREDENTIALS");
});

test("signed webhook dispatches an event after raw-body verification", async () => {
  receivedWebhookEvent = undefined;

  const rawBody = '{"event":"invoice.paid","id":"evt_http_1"}';
  const response = await fetch(
    `${baseUrl}${API_VERSION_PREFIX}/webhooks/example`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-modelnow-signature": computeWebhookSignature(
          Buffer.from(rawBody, "utf8"),
          webhookSecret,
        ),
      },
      body: rawBody,
    },
  );

  const body = await response.json() as {
    success: boolean;
    data: { accepted: boolean };
    requestId: string;
  };

  assert.equal(response.status, 202);
  assert.equal(body.success, true);
  assert.equal(body.data.accepted, true);
  assert.deepEqual(receivedWebhookEvent, {
    event: "invoice.paid",
    id: "evt_http_1",
  });
  assert.equal(body.requestId, response.headers.get("x-request-id"));
});

test("webhook rejects an invalid signature without dispatching", async () => {
  receivedWebhookEvent = undefined;

  const response = await fetch(
    `${baseUrl}${API_VERSION_PREFIX}/webhooks/example`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-modelnow-signature": "sha256=" + "0".repeat(64),
      },
      body: '{"event":"invoice.paid","id":"evt_invalid"}',
    },
  );

  const body = await response.json() as {
    success: boolean;
    error: { code: string };
  };

  assert.equal(response.status, 401);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "WEBHOOK_SIGNATURE_INVALID");
  assert.equal(receivedWebhookEvent, undefined);
});

test("webhook rejects providers without registered handlers", async () => {
  const rawBody = '{"event":"invoice.paid","id":"evt_unknown"}';
  const response = await fetch(
    `${baseUrl}${API_VERSION_PREFIX}/webhooks/unknown`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-modelnow-signature": computeWebhookSignature(
          Buffer.from(rawBody, "utf8"),
          webhookSecret,
        ),
      },
      body: rawBody,
    },
  );

  const body = await response.json() as {
    success: boolean;
    error: { code: string };
  };

  assert.equal(response.status, 404);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "WEBHOOK_PROVIDER_UNSUPPORTED");
});

test("unknown routes return standardized JSON 404", async () => {
  const response = await fetch(`${baseUrl}${API_VERSION_PREFIX}/route-that-does-not-exist`);
  const body = await response.json() as {
    success: boolean;
    error: { code: string; message: string };
    requestId: string;
  };

  assert.equal(response.status, 404);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "NOT_FOUND");
  assert.equal(body.error.message, "The requested resource was not found.");
  assert.ok(body.requestId);
  assert.equal(body.requestId, response.headers.get("x-request-id"));
});


test("liveness probe reports that the API process is alive", async () => {
  const response = await fetch(`${baseUrl}${API_VERSION_PREFIX}/health/live`);
  const body = await response.json() as { success: boolean; status: string };

  assert.equal(response.status, 200);
  assert.equal(body.success, true);
  assert.equal(body.status, "alive");
});

test("readiness probe reports runtime disconnection as not ready", async () => {
  const response = await fetch(`${baseUrl}${API_VERSION_PREFIX}/health/ready`);
  const body = await response.json() as {
    success: boolean;
    status: string;
    checks: { runtime: string; chatAvailable: boolean };
  };

  assert.equal(response.status, 503);
  assert.equal(body.success, false);
  assert.equal(body.status, "not_ready");
  assert.equal(body.checks.runtime, "not_connected");
  assert.equal(body.checks.chatAvailable, false);
});

test("health endpoint reports degraded runtime without failing liveness", async () => {
  const response = await fetch(`${baseUrl}${API_VERSION_PREFIX}/health`);
  const body = await response.json() as {
    status: string;
    runtime: { status: string; chatAvailable: boolean };
  };

  assert.equal(response.status, 200);
  assert.equal(body.status, "degraded");
  assert.equal(body.runtime.status, "not_connected");
  assert.equal(body.runtime.chatAvailable, false);
});

test("malformed JSON returns standardized 400", async () => {
  const response = await fetch(`${baseUrl}${API_VERSION_PREFIX}/chat`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: "{",
  });

  const body = await response.json() as {
    success: boolean;
    error: { code: string; message: string };
    requestId: string;
  };

  assert.equal(response.status, 400);
  assert.equal(body.success, false);
  assert.equal(body.error.code, "BAD_REQUEST");
  assert.equal(
    body.error.message,
    "The request body contains invalid JSON.",
  );
  assert.equal(body.requestId, response.headers.get("x-request-id"));
});


test("production environment rejects missing JWT configuration", () => {
  assert.throws(
    () => loadEnvironment({ NODE_ENV: "production" }),
    /Production requires JWT issuer, audience, and JWKS configuration/,
  );
});

test("environment rejects partially configured JWT settings", () => {
  assert.throws(
    () => loadEnvironment({
      NODE_ENV: "development",
      JWT_ISSUER: "https://identity.example.test",
    }),
    /must be configured together/,
  );
});

test("production environment rejects a missing PostgreSQL URL", () => {
  assert.throws(
    () => loadEnvironment({
      NODE_ENV: "production",
      JWT_ISSUER: "https://identity.example.test",
      JWT_AUDIENCE: "modelnow-api",
      JWT_JWKS_URL: "https://identity.example.test/.well-known/jwks.json",
    }),
    /Production requires DATABASE_URL/,
  );
});

test("environment rejects a non-PostgreSQL database URL", () => {
  assert.throws(
    () => loadEnvironment({
      NODE_ENV: "development",
      DATABASE_URL: "https://example.com",
    }),
    /valid PostgreSQL connection URL/,
  );
});
test("environment rejects an insecure JWT issuer", () => {
  assert.throws(
    () => loadEnvironment({
      NODE_ENV: "development",
      JWT_ISSUER: "http://identity.example.test",
      JWT_AUDIENCE: "modelnow-api",
      JWT_JWKS_URL: "https://identity.example.test/.well-known/jwks.json",
    }),
    /JWT_ISSUER must be a valid HTTPS URL/,
  );
});

test("environment rejects a malformed JWT JWKS path", () => {
  assert.throws(
    () => loadEnvironment({
      NODE_ENV: "development",
      JWT_ISSUER: "https://identity.example.test/",
      JWT_AUDIENCE: "modelnow-api",
      JWT_JWKS_URL: "https://identity.example.test/keys",
    }),
    /JWT_JWKS_URL must be an HTTPS URL ending in/,
  );
});

test("environment rejects JWT issuer and JWKS hostname mismatch", () => {
  assert.throws(
    () => loadEnvironment({
      NODE_ENV: "development",
      JWT_ISSUER: "https://identity.example.test/",
      JWT_AUDIENCE: "modelnow-api",
      JWT_JWKS_URL: "https://other.example.test/.well-known/jwks.json",
    }),
    /same hostname as JWT_ISSUER/,
  );
});
test("environment accepts complete production JWT configuration", () => {
  const result = loadEnvironment({
    NODE_ENV: "production",
    JWT_ISSUER: "https://identity.example.test",
    JWT_AUDIENCE: "modelnow-api",
    JWT_JWKS_URL: "https://identity.example.test/.well-known/jwks.json",
    JWT_ALGORITHMS: "RS256",
    DATABASE_URL: "postgresql://modelnow:test-password@localhost:5432/modelnow_test",

  });

  assert.equal(result.NODE_ENV, "production");
  assert.equal(result.JWT_ISSUER, "https://identity.example.test");
  assert.equal(result.JWT_AUDIENCE, "modelnow-api");
  assert.deepEqual(result.JWT_ALGORITHMS, ["RS256"]);
});

test("environment rejects unsupported JWT algorithms", () => {
  assert.throws(
    () => loadEnvironment({
      NODE_ENV: "development",
      JWT_ALGORITHMS: "HS256",
    }),
    /JWT_ALGORITHMS/,
  );
});

test("environment rejects duplicate JWT algorithms", () => {
  assert.throws(
    () => loadEnvironment({
      NODE_ENV: "development",
      JWT_ALGORITHMS: "RS256,RS256",
    }),
    /must not contain duplicates/,
  );
});

test("completed HTTP requests are recorded in telemetry metrics", async () => {
  resetHttpMetricsForTests();

  const response = await fetch(baseUrl);
  await response.arrayBuffer();

  const metrics = getHttpMetricSnapshot();

  assert.equal(response.status, 200);
  assert.equal(metrics.requestCount, 1);
  assert.equal(metrics.seriesCount, 1);
  assert.ok(metrics.durationSumMs >= 0);
});