import assert from "node:assert/strict";
import { test } from "node:test";

import {
  RequestHandler,
  ResponseHandler,
} from "./index.js";

test("normalizes request method and path", () => {
  const handler = new RequestHandler();

  const request = handler.normalize({
    method: " get ",
    path: "/api/v1/users",
  });

  assert.equal(request.method, "GET");
  assert.equal(request.path, "/api/v1/users");
  assert.ok(request.requestId.startsWith("req_"));
  assert.equal(request.body, null);
});

test("normalizes headers", () => {
  const handler = new RequestHandler();

  const request = handler.normalize({
    method: "GET",
    path: "/health",
    headers: {
      Authorization: "Bearer abc123",
      "Content-Type": "application/json",
    },
  });

  assert.equal(
    handler.getHeader(request, "authorization"),
    "Bearer abc123",
  );

  assert.equal(
    handler.getHeader(request, "CONTENT-TYPE"),
    "application/json",
  );
});

test("normalizes query parameters", () => {
  const handler = new RequestHandler();

  const request = handler.normalize({
    method: "GET",
    path: "/users",
    query: {
      page: "1",
      limit: "10",
      unused: undefined,
    },
  });

  assert.equal(
    handler.getQueryParam(request, "page"),
    "1",
  );

  assert.equal(
    handler.getQueryParam(request, "limit"),
    "10",
  );

  assert.equal(
    handler.getQueryParam(request, "unused"),
    undefined,
  );
});

test("normalizes path parameters", () => {
  const handler = new RequestHandler();

  const request = handler.normalize({
    method: "GET",
    path: "/users/123",
    params: {
      userId: "123",
    },
  });

  assert.equal(
    handler.getPathParam(request, "userid"),
    "123",
  );
});

test("detects JSON request", () => {
  const handler = new RequestHandler();

  const request = handler.normalize({
    method: "POST",
    path: "/users",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });

  assert.equal(
    handler.isJsonRequest(request),
    true,
  );
});

test("detects bearer authentication", () => {
  const handler = new RequestHandler();

  const request = handler.normalize({
    method: "GET",
    path: "/protected",
    headers: {
      Authorization: "Bearer test-token",
    },
  });

  assert.equal(
    handler.isAuthenticated(request),
    true,
  );

  assert.equal(
    handler.getBearerToken(request),
    "test-token",
  );
});

test("detects missing authentication", () => {
  const handler = new RequestHandler();

  const request = handler.normalize({
    method: "GET",
    path: "/protected",
  });

  assert.equal(
    handler.isAuthenticated(request),
    false,
  );

  assert.equal(
    handler.getBearerToken(request),
    undefined,
  );
});

test("accepts custom request ID", () => {
  const handler = new RequestHandler();

  const request = handler.normalize({
    method: "GET",
    path: "/health",
    requestId: "req_custom_001",
  });

  assert.equal(
    request.requestId,
    "req_custom_001",
  );
});

test("rejects empty request method", () => {
  const handler = new RequestHandler();

  assert.throws(
    () =>
      handler.normalize({
        method: "",
        path: "/health",
      }),
    /Request method is required/,
  );
});

test("rejects invalid request path", () => {
  const handler = new RequestHandler();

  assert.throws(
    () =>
      handler.normalize({
        method: "GET",
        path: "users",
      }),
    /Request path must start/,
  );
});

test("creates successful response", () => {
  const handler = new ResponseHandler();

  const response = handler.success(
    { id: "123", name: "Prasanth" },
    "User retrieved successfully",
    200,
    {
      requestId: "req_123",
    },
  );

  assert.equal(response.success, true);
  assert.equal(response.statusCode, 200);
  assert.equal(
    response.message,
    "User retrieved successfully",
  );
  assert.deepEqual(response.data, {
    id: "123",
    name: "Prasanth",
  });
  assert.equal(response.error, null);
  assert.equal(response.requestId, "req_123");
  assert.ok(response.timestamp);
});

test("creates created response", () => {
  const handler = new ResponseHandler();

  const response = handler.created(
    { id: "user_001" },
    "User created",
  );

  assert.equal(response.success, true);
  assert.equal(response.statusCode, 201);
  assert.deepEqual(response.data, {
    id: "user_001",
  });
});

test("creates no-content response", () => {
  const handler = new ResponseHandler();

  const response = handler.noContent();

  assert.equal(response.success, true);
  assert.equal(response.statusCode, 204);
  assert.equal(response.data, null);
});

test("creates bad request response", () => {
  const handler = new ResponseHandler();

  const response = handler.badRequest(
    "Invalid user input",
    {
      field: "email",
    },
    {
      requestId: "req_456",
    },
  );

  assert.equal(response.success, false);
  assert.equal(response.statusCode, 400);
  assert.equal(response.error?.code, "BAD_REQUEST");
  assert.equal(response.error?.details instanceof Object, true);
  assert.equal(response.requestId, "req_456");
});

test("creates unauthorized response", () => {
  const handler = new ResponseHandler();

  const response = handler.unauthorized();

  assert.equal(response.success, false);
  assert.equal(response.statusCode, 401);
  assert.equal(response.error?.code, "UNAUTHORIZED");
});

test("creates forbidden response", () => {
  const handler = new ResponseHandler();

  const response = handler.forbidden();

  assert.equal(response.success, false);
  assert.equal(response.statusCode, 403);
  assert.equal(response.error?.code, "FORBIDDEN");
});

test("creates not found response", () => {
  const handler = new ResponseHandler();

  const response = handler.notFound();

  assert.equal(response.success, false);
  assert.equal(response.statusCode, 404);
  assert.equal(response.error?.code, "NOT_FOUND");
});

test("creates conflict response", () => {
  const handler = new ResponseHandler();

  const response = handler.conflict();

  assert.equal(response.success, false);
  assert.equal(response.statusCode, 409);
  assert.equal(response.error?.code, "CONFLICT");
});

test("creates rate limit response", () => {
  const handler = new ResponseHandler();

  const response = handler.tooManyRequests();

  assert.equal(response.success, false);
  assert.equal(response.statusCode, 429);
  assert.equal(
    response.error?.code,
    "RATE_LIMIT_EXCEEDED",
  );
});

test("creates internal server error response", () => {
  const handler = new ResponseHandler();

  const response = handler.internalServerError();

  assert.equal(response.success, false);
  assert.equal(response.statusCode, 500);
  assert.equal(
    response.error?.code,
    "INTERNAL_SERVER_ERROR",
  );
});

test("rejects invalid response status code", () => {
  const handler = new ResponseHandler();

  assert.throws(
    () => handler.success({}, "Invalid", 999),
    /Invalid HTTP status code/,
  );
});

test("health checks work", () => {
  const requestHandler = new RequestHandler();
  const responseHandler = new ResponseHandler();

  assert.deepEqual(requestHandler.health(), {
    status: "ok",
    component: "request-handler",
  });

  assert.deepEqual(responseHandler.health(), {
    status: "ok",
    component: "response-handler",
  });
});