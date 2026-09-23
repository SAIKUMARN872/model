import assert from "node:assert/strict";
import { test } from "node:test";

import {
  CorsMiddleware,
  LoggingMiddleware,
  SecurityMiddleware,
  composeMiddleware,
  createJsonResponse,
  createRequestId,
  getHeader,
  withRequestId,
} from "./index.js";

import type {
  MiddlewareRequest,
  MiddlewareResponse,
} from "./index.js";

import {
  Logger,
} from "../logging/index.js";

function createRequest(): MiddlewareRequest {
  return {
    method: "GET",
    path: "/api/users",
    headers: {
      "content-type": "application/json",
    },
  };
}

test("createRequestId generates a valid ID", () => {
  const requestId =
    createRequestId();

  assert.equal(
    typeof requestId,
    "string",
  );

  assert.ok(
    requestId.length > 0,
  );
});

test("getHeader is case insensitive", () => {
  const request =
    createRequest();

  request.headers[
    "X-Request-ID"
  ] = "req-123";

  assert.equal(
    getHeader(
      request,
      "x-request-id",
    ),
    "req-123",
  );
});

test("withRequestId creates request ID", () => {
  const request =
    createRequest();

  const result =
    withRequestId(request);

  assert.ok(
    result.requestId,
  );

  assert.equal(
    result.context?.requestId,
    result.requestId,
  );
});

test("withRequestId preserves existing request ID", () => {
  const request =
    createRequest();

  request.headers[
    "x-request-id"
  ] = "existing-123";

  const result =
    withRequestId(request);

  assert.equal(
    result.requestId,
    "existing-123",
  );
});

test("composeMiddleware executes middleware in order", async () => {
  const calls: string[] = [];

  const first = async (
    request: MiddlewareRequest,
    next: () => Promise<MiddlewareResponse>,
  ) => {
    calls.push("first-before");

    const response =
      await next();

    calls.push("first-after");

    return response;
  };

  const second = async (
    _request: MiddlewareRequest,
    next: () => Promise<MiddlewareResponse>,
  ) => {
    calls.push("second-before");

    const response =
      await next();

    calls.push("second-after");

    return response;
  };

  const handler = async () => {
    calls.push("handler");

    return {
      statusCode: 200,
      headers: {},
      body: {
        success: true,
      },
    };
  };

  const app = composeMiddleware([
    first,
    second,
    async () => handler(),
  ]);

  const response =
    await app(createRequest());

  assert.equal(
    response.statusCode,
    200,
  );

  assert.deepEqual(
    calls,
    [
      "first-before",
      "second-before",
      "handler",
      "second-after",
      "first-after",
    ],
  );
});

test("createJsonResponse creates JSON response", () => {
  const response =
    createJsonResponse(
      200,
      {
        success: true,
      },
    );

  assert.equal(
    response.statusCode,
    200,
  );

  assert.equal(
    response.headers[
      "content-type"
    ],
    "application/json",
  );

  assert.deepEqual(
    response.body,
    {
      success: true,
    },
  );
});

test("CORS allows configured origin", async () => {
  const middleware =
    new CorsMiddleware({
      origins: [
        "https://example.com",
      ],
    }).middleware();

  const request =
    createRequest();

  request.headers.origin =
    "https://example.com";

  const response =
    await middleware(
      request,
      async () => ({
        statusCode: 200,
        headers: {},
        body: {
          success: true,
        },
      }),
    );

  assert.equal(
    response.headers[
      "access-control-allow-origin"
    ],
    "https://example.com",
  );
});

test("CORS rejects unconfigured origin", async () => {
  const middleware =
    new CorsMiddleware({
      origins: [
        "https://example.com",
      ],
    }).middleware();

  const request =
    createRequest();

  request.headers.origin =
    "https://evil.example";

  const response =
    await middleware(
      request,
      async () => ({
        statusCode: 200,
        headers: {},
      }),
    );

  assert.equal(
    response.headers[
      "access-control-allow-origin"
    ],
    undefined,
  );
});

test("CORS handles preflight request", async () => {
  const middleware =
    new CorsMiddleware({
      origins: [
        "https://example.com",
      ],
    }).middleware();

  const request =
    createRequest();

  request.method = "OPTIONS";

  request.headers.origin =
    "https://example.com";

  const response =
    await middleware(
      request,
      async () => ({
        statusCode: 500,
        headers: {},
      }),
    );

  assert.equal(
    response.statusCode,
    204,
  );

  assert.equal(
    response.headers[
      "access-control-allow-methods"
    ],
    "GET, POST, PUT, PATCH, DELETE, OPTIONS",
  );
});

test("CORS prevents wildcard with credentials", () => {
  assert.throws(
    () => {
      new CorsMiddleware({
        origins: ["*"],
        allowCredentials: true,
      });
    },
    /wildcard origin/,
  );
});

test("security middleware adds security headers", async () => {
  const middleware =
    new SecurityMiddleware({
      enableHsts: true,
    }).middleware();

  const response =
    await middleware(
      createRequest(),
      async () => ({
        statusCode: 200,
        headers: {},
      }),
    );

  assert.equal(
    response.headers[
      "x-content-type-options"
    ],
    "nosniff",
  );

  assert.equal(
    response.headers[
      "x-frame-options"
    ],
    "DENY",
  );

  assert.equal(
    response.headers[
      "x-xss-protection"
    ],
    "0",
  );

  assert.ok(
    response.headers[
      "strict-transport-security"
    ],
  );
});

test("security middleware blocks oversized URL", async () => {
  const middleware =
    new SecurityMiddleware({
      maxUrlLength: 10,
    }).middleware();

  const request =
    createRequest();

  request.path =
    "/this/path/is/too/long";

  const response =
    await middleware(
      request,
      async () => ({
        statusCode: 200,
        headers: {},
      }),
    );

  assert.equal(
    response.statusCode,
    414,
  );
});

test("logging middleware logs requests", async () => {
  const output: string[] = [];

  const originalLog =
    console.log;

  console.log = (
    message?: unknown,
  ) => {
    output.push(
      String(message),
    );
  };

  try {
    const testLogger =
      new Logger({
        serviceName:
          "middleware-test",
        level: "info",
        consoleOutput: true,
      });

    const middleware =
      new LoggingMiddleware({
        logger: testLogger,
      }).middleware();

    const request =
      createRequest();

    request.requestId =
      "request-123";

    const response =
      await middleware(
        request,
        async () => ({
          statusCode: 200,
          headers: {},
        }),
      );

    assert.equal(
      response.statusCode,
      200,
    );

    assert.equal(
      output.length,
      2,
    );

    const first =
      JSON.parse(output[0]);

    const second =
      JSON.parse(output[1]);

    assert.equal(
      first.message,
      "HTTP request started",
    );

    assert.equal(
      second.message,
      "HTTP request completed",
    );

    assert.equal(
      second.context.requestId,
      "request-123",
    );

    assert.equal(
      second.context.statusCode,
      200,
    );
  } finally {
    console.log = originalLog;
  }
});

test("logging middleware redacts sensitive headers", async () => {
  const output: string[] = [];

  const originalLog =
    console.log;

  console.log = (
    message?: unknown,
  ) => {
    output.push(
      String(message),
    );
  };

  try {
    const testLogger =
      new Logger({
        level: "info",
        consoleOutput: true,
      });

    const middleware =
      new LoggingMiddleware({
        logger: testLogger,
        includeHeaders: true,
      }).middleware();

    const request =
      createRequest();

    request.headers.authorization =
      "Bearer secret-token";

    request.headers[
      "x-api-key"
    ] = "super-secret";

    await middleware(
      request,
      async () => ({
        statusCode: 200,
        headers: {},
      }),
    );

    const entry =
      JSON.parse(output[0]);

    assert.equal(
      entry.context.headers.authorization,
      "[REDACTED]",
    );

    assert.equal(
      entry.context.headers[
        "x-api-key"
      ],
      "[REDACTED]",
    );
  } finally {
    console.log = originalLog;
  }
});

test("logging middleware can include sanitized body", async () => {
  const output: string[] = [];

  const originalLog =
    console.log;

  console.log = (
    message?: unknown,
  ) => {
    output.push(
      String(message),
    );
  };

  try {
    const testLogger =
      new Logger({
        level: "info",
        consoleOutput: true,
      });

    const middleware =
      new LoggingMiddleware({
        logger: testLogger,
        includeBody: true,
      }).middleware();

    const request =
      createRequest();

    request.body = {
      username: "prasanth",
      password: "secret",
      token: "private-token",
    };

    await middleware(
      request,
      async () => ({
        statusCode: 200,
        headers: {},
      }),
    );

    const entry =
      JSON.parse(output[0]);

    assert.equal(
      entry.context.body.username,
      "prasanth",
    );

    assert.equal(
      entry.context.body.password,
      "[REDACTED]",
    );

    assert.equal(
      entry.context.body.token,
      "[REDACTED]",
    );
  } finally {
    console.log = originalLog;
  }
});

test("middleware health functions work", () => {
  const corsMiddleware =
    new CorsMiddleware();

  const securityMiddleware =
    new SecurityMiddleware();

  const loggingMiddleware =
    new LoggingMiddleware({
      logger: new Logger({
        consoleOutput: false,
      }),
    });

  assert.equal(
    corsMiddleware.health().status,
    "healthy",
  );

  assert.equal(
    securityMiddleware.health().status,
    "healthy",
  );

  assert.equal(
    loggingMiddleware.health().status,
    "healthy",
  );
});