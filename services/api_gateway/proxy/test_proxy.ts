import assert from "node:assert/strict";
import test from "node:test";

import {
  ProxyForwarder,
} from "./forwarder.js";

import {
  ProxyService,
} from "./proxy.js";

import {
  ProxyTimeoutError,
  validateTimeout,
  withTimeout,
} from "./timeout.js";

function createMockFetch(
  status = 200,
  body = "OK",
): typeof fetch {
  return async (
    _input: RequestInfo | URL,
    _init?: RequestInit,
  ): Promise<Response> => {
    return new Response(body, {
      status,
      headers: {
        "content-type": "text/plain",
      },
    });
  };
}

test("validateTimeout accepts valid timeout", () => {
  assert.doesNotThrow(() => {
    validateTimeout(5000);
  });
});

test("validateTimeout rejects invalid timeout", () => {
  assert.throws(() => {
    validateTimeout(0);
  });

  assert.throws(() => {
    validateTimeout(-100);
  });

  assert.throws(() => {
    validateTimeout(Number.NaN);
  });
});

test("withTimeout resolves successful operation", async () => {
  const result = await withTimeout(
    Promise.resolve("success"),
    1000,
  );

  assert.equal(result, "success");
});

test("withTimeout rejects slow operation", async () => {
  await assert.rejects(
    withTimeout(
      new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve("too late");
        }, 100);
      }),
      10,
    ),
    ProxyTimeoutError,
  );
});

test("ProxyForwarder forwards GET request", async () => {
  const forwarder = new ProxyForwarder({
    defaultTimeoutMs: 1000,
    fetchImplementation: createMockFetch(
      200,
      "Hello ModelNow",
    ),
  });

  const response = await forwarder.forward({
    url: "https://example.com/api",
    method: "GET",
  });

  assert.equal(response.status, 200);
  assert.equal(response.body, "Hello ModelNow");
  assert.equal(
    response.headers["content-type"],
    "text/plain",
  );
});

test("ProxyForwarder forwards POST request", async () => {
  let receivedMethod = "";
  let receivedBody = "";

  const mockFetch: typeof fetch = async (
    _input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    receivedMethod = init?.method ?? "";
    receivedBody = String(init?.body ?? "");

    return new Response(
      JSON.stringify({
        success: true,
      }),
      {
        status: 201,
        headers: {
          "content-type": "application/json",
        },
      },
    );
  };

  const forwarder = new ProxyForwarder({
    fetchImplementation: mockFetch,
  });

  const response = await forwarder.forward({
    url: "https://example.com/api/users",
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      name: "Prasanth",
    }),
  });

  assert.equal(response.status, 201);
  assert.equal(receivedMethod, "POST");
  assert.equal(
    receivedBody,
    JSON.stringify({
      name: "Prasanth",
    }),
  );
});

test("ProxyForwarder rejects invalid URL", async () => {
  const forwarder = new ProxyForwarder({
    fetchImplementation: createMockFetch(),
  });

  await assert.rejects(
    forwarder.forward({
      url: "invalid-url",
    }),
    /Invalid proxy target URL/,
  );
});

test("ProxyForwarder rejects unsupported protocol", async () => {
  const forwarder = new ProxyForwarder({
    fetchImplementation: createMockFetch(),
  });

  await assert.rejects(
    forwarder.forward({
      url: "ftp://example.com/file",
    }),
    /must use http or https/,
  );
});

test("ProxyService forwards allowed host", async () => {
  const proxy = new ProxyService({
    allowedHosts: ["example.com"],
    fetchImplementation: createMockFetch(
      200,
      "Forwarded",
    ),
  });

  const response = await proxy.forward({
    targetUrl: "https://example.com/api",
  });

  assert.equal(response.status, 200);
  assert.equal(response.body, "Forwarded");
});

test("ProxyService rejects disallowed host", async () => {
  const proxy = new ProxyService({
    allowedHosts: ["example.com"],
    fetchImplementation: createMockFetch(),
  });

  await assert.rejects(
    proxy.forward({
      targetUrl: "https://evil.example.com/api",
    }),
    /Proxy target host is not allowed/,
  );
});

test("ProxyService removes hop-by-hop headers", async () => {
  let receivedHeaders: Headers | undefined;

  const mockFetch: typeof fetch = async (
    _input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> => {
    receivedHeaders = new Headers(init?.headers);

    return new Response("OK", {
      status: 200,
    });
  };

  const proxy = new ProxyService({
    fetchImplementation: mockFetch,
  });

  await proxy.forward({
    targetUrl: "https://example.com/api",
    headers: {
      "content-type": "application/json",
      connection: "keep-alive",
      "x-request-id": "req-123",
    },
  });

  assert.ok(receivedHeaders);
  assert.equal(
    receivedHeaders.get("content-type"),
    "application/json",
  );
  assert.equal(
    receivedHeaders.get("x-request-id"),
    "req-123",
  );
  assert.equal(
    receivedHeaders.get("connection"),
    null,
  );
});

test("ProxyService execute returns success", async () => {
  const proxy = new ProxyService({
    fetchImplementation: createMockFetch(
      200,
      "Success",
    ),
  });

  const result = await proxy.execute({
    targetUrl: "https://example.com/api",
  });

  assert.equal(result.success, true);
  assert.ok(result.response);
  assert.equal(result.response.status, 200);
});

test("ProxyService execute handles server error", async () => {
  const proxy = new ProxyService({
    fetchImplementation: createMockFetch(
      500,
      "Internal Server Error",
    ),
  });

  const result = await proxy.execute({
    targetUrl: "https://example.com/api",
  });

  assert.equal(result.success, false);
  assert.ok(result.response);
  assert.equal(result.response.status, 500);
});

test("ProxyService execute handles proxy failure", async () => {
  const failingFetch: typeof fetch = async () => {
    throw new Error("Upstream unavailable");
  };

  const proxy = new ProxyService({
    fetchImplementation: failingFetch,
  });

  const result = await proxy.execute({
    targetUrl: "https://example.com/api",
  });

  assert.equal(result.success, false);
  assert.equal(
    result.error,
    "Upstream unavailable",
  );
});

test("ProxyService health works", () => {
  const proxy = new ProxyService({
    allowedHosts: [
      "api.example.com",
      "llm.example.com",
    ],
  });

  const health = proxy.health();

  assert.equal(health.healthy, true);
  assert.equal(health.allowedHosts, 2);
  assert.ok(health.timestamp);
});