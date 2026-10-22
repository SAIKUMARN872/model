import assert from "node:assert/strict";
import { test } from "node:test";
import type { ErrorRequestHandler } from "express";
import { ApiError } from "../errors/api.error.js";
import { ValidationError } from "../errors/validation.error.js";
import { errorHandler } from "./error-handler.js";

type CapturedResponse = {
  statusCode?: number;
  body?: Record<string, unknown>;
  headersSent: boolean;
  locals: { requestId: string };
  status: (code: number) => CapturedResponse;
  json: (body: Record<string, unknown>) => CapturedResponse;
};

function runHandler(error: unknown, headersSent = false) {
  const response: CapturedResponse = {
    headersSent,
    locals: { requestId: "test-request-id" },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };

  let forwardedError: unknown;
  const request = { method: "POST", path: "/test" };
  const next = (nextError?: unknown) => {
    forwardedError = nextError;
  };

  (errorHandler as ErrorRequestHandler)(
    error,
    request as never,
    response as never,
    next as never,
  );

  return { response, forwardedError };
}

test("validation errors include structured issues", () => {
  const error = new ValidationError([
    {
      path: ["email"],
      code: "invalid_format",
      message: "Invalid email address.",
    },
  ]);

  const { response } = runHandler(error);

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.body, {
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: "The request contains invalid fields.",
      issues: [
        {
          path: ["email"],
          code: "invalid_format",
          message: "Invalid email address.",
        },
      ],
    },
    requestId: "test-request-id",
  });
});

test("ordinary API errors retain the standard response shape", () => {
  const { response } = runHandler(new ApiError(403, "FORBIDDEN", "Forbidden."));

  assert.equal(response.statusCode, 403);
  assert.deepEqual(response.body, {
    success: false,
    error: { code: "FORBIDDEN", message: "Forbidden." },
    requestId: "test-request-id",
  });
});

test("malformed JSON maps to a standardized 400 response", () => {
  const error = Object.assign(new SyntaxError("private parser detail"), {
    type: "entity.parse.failed",
  });

  const { response } = runHandler(error);

  assert.equal(response.statusCode, 400);
  assert.deepEqual(response.body, {
    success: false,
    error: {
      code: "BAD_REQUEST",
      message: "The request body contains invalid JSON.",
    },
    requestId: "test-request-id",
  });
});

test("oversized payloads map to a standardized 413 response", () => {
  const error = Object.assign(new Error("private parser detail"), {
    type: "entity.too.large",
  });

  const { response } = runHandler(error);

  assert.equal(response.statusCode, 413);
  assert.deepEqual(response.body, {
    success: false,
    error: {
      code: "PAYLOAD_TOO_LARGE",
      message: "The request body is too large.",
    },
    requestId: "test-request-id",
  });
});

test("unexpected errors do not expose internal messages", () => {
  const { response } = runHandler(new Error("database password or SQL detail"));

  assert.equal(response.statusCode, 500);
  assert.deepEqual(response.body, {
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred.",
    },
    requestId: "test-request-id",
  });
});

test("errors are forwarded when response headers have been sent", () => {
  const error = new Error("late error");
  const { response, forwardedError } = runHandler(error, true);

  assert.equal(forwardedError, error);
  assert.equal(response.statusCode, undefined);
  assert.equal(response.body, undefined);
});

test("ApiError rejects invalid HTTP status codes", () => {
  const invalidStatuses = [99, 200, 399, 600, 400.5, NaN];

  for (const status of invalidStatuses) {
    assert.throws(
      () => new ApiError(status, "TEST_ERROR", "Test error."),
      RangeError,
      `Expected status ${status} to be rejected`,
    );
  }
});

test("ApiError accepts valid HTTP error status codes", () => {
  for (const status of [400, 401, 403, 404, 413, 500, 503, 599]) {
    assert.equal(
      new ApiError(status, "TEST_ERROR", "Test error.").statusCode,
      status,
    );
  }
});

test("error response schema matches the middleware response", async () => {
  const { apiErrorSchema } = await import("../schemas/error.schema.js");

  const { response } = runHandler(
    new ValidationError([
      {
        path: ["email"],
        code: "invalid_format",
        message: "Invalid email address.",
      },
    ]),
  );

  assert.equal(apiErrorSchema.safeParse(response.body).success, true);
});

test("error response schema rejects the incompatible legacy shape", async () => {
  const { apiErrorSchema } = await import("../schemas/error.schema.js");

  const parsed = apiErrorSchema.safeParse({
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred.",
      requestId: "test-request-id",
    },
  });

  assert.equal(parsed.success, false);
});
