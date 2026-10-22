import assert from "node:assert/strict";
import { test } from "node:test";
import type { Request, Response } from "express";
import { z } from "zod";
import type { ControllerSchema } from "./controller-factory.js";
import {
  createDomainControllers,
  type ControllerOperation,
} from "./controller-factory.js";

type MockResponse = {
  statusCode?: number;
  body?: unknown;
  headersSent: boolean;
  locals: { requestId: string };
  status: (code: number) => MockResponse;
  json: (body: unknown) => MockResponse;
};

function createResponse(): MockResponse {
  return {
    headersSent: false,
    locals: { requestId: "controller-test-request" },
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
  };
}

async function invoke(
  handler: (request: Request, response: Response, next: (error?: unknown) => void) => unknown,
  input: {
    body?: unknown;
    query?: unknown;
    params?: unknown;
  } = {},
) {
  const response = createResponse();
  let forwardedError: unknown;

  const request = {
    body: input.body,
    query: input.query ?? {},
    params: input.params ?? {},
  };

  await handler(
    request as Request,
    response as unknown as Response,
    (error?: unknown) => {
      forwardedError = error;
    },
  );

  return { response, forwardedError };
}

test("valid body input is parsed and passed to the service", async () => {
  let received: unknown;

  const operation: ControllerOperation = {
    source: "body",
    schema: z.object({ count: z.coerce.number().int().positive() }) as unknown as ControllerSchema,
    execute(input) {
      received = input;
      return { accepted: true };
    },
  };

  const handlers = createDomainControllers("test", { create: operation });
  const { response, forwardedError } = await invoke(handlers.create, {
    body: { count: "3" },
  });

  assert.equal(forwardedError, undefined);
  assert.deepEqual(received, { count: 3 });
  assert.equal(response.statusCode, 200);
  assert.deepEqual(response.body, {
    data: { accepted: true },
    requestId: "controller-test-request",
  });
});

test("invalid input returns structured HTTP 400 validation details", async () => {
  let executed = false;

  const handlers = createDomainControllers("test", {
    create: {
      source: "body",
      schema: z.object({ name: z.string().min(1) }) as unknown as ControllerSchema,
      execute() {
        executed = true;
        return {};
      },
    },
  });

  const { response, forwardedError } = await invoke(handlers.create, {
    body: { name: "" },
  });

  assert.equal(forwardedError, undefined);
  assert.equal(executed, false);
  assert.equal(response.statusCode, 400);
  const body = response.body as {
    error: {
      code: string;
      message: string;
      details: Array<{ path: (string | number)[]; code: string; message: string }>;
    };
    requestId: string;
  };

  assert.equal(body.error.code, "VALIDATION_ERROR");
  assert.equal(body.error.message, "The request contains invalid fields.");
  assert.equal(body.error.details[0]?.code, "too_small");
  assert.deepEqual(body.error.details[0]?.path, ["name"]);
  assert.equal(body.requestId, "controller-test-request");
});

function expectValidationMessage(): string {
  return "Too small: expected string to have >=1 characters";
}

test("service failures are forwarded to centralized error handling", async () => {
  const serviceError = new Error("service failure");
  const handlers = createDomainControllers("test", {
    read: {
      source: "params",
      schema: z.object({ id: z.string() }) as unknown as ControllerSchema,
      execute() {
        throw serviceError;
      },
    },
  });

  const { response, forwardedError } = await invoke(handlers.read, {
    params: { id: "item-1" },
  });

  assert.equal(forwardedError, serviceError);
  assert.equal(response.statusCode, undefined);
  assert.equal(response.body, undefined);
});

test("asynchronous service failures are forwarded", async () => {
  const serviceError = new Error("async service failure");
  const handlers = createDomainControllers("test", {
    read: {
      source: "query",
      schema: z.object({ page: z.string() }) as unknown as ControllerSchema,
      async execute() {
        throw serviceError;
      },
    },
  });

  const { forwardedError } = await invoke(handlers.read, {
    query: { page: "1" },
  });

  assert.equal(forwardedError, serviceError);
});

test("custom success status is applied", async () => {
  const handlers = createDomainControllers("test", {
    create: {
      source: "body",
      schema: z.object({ name: z.string() }) as unknown as ControllerSchema,
      execute(input) {
        return input;
      },
      successStatus: 201,
    },
  });

  const { response } = await invoke(handlers.create, {
    body: { name: "ModelNow" },
  });

  assert.equal(response.statusCode, 201);
});

test("empty domain name is rejected", () => {
  assert.throws(
    () => createDomainControllers(" ", {
      read: {
        source: "body",
        schema: z.object({}) as unknown as ControllerSchema,
        execute: () => ({}),
      },
    }),
    /non-empty string/,
  );
});

test("empty operations are rejected", () => {
  assert.throws(
    () => createDomainControllers("test", {}),
    /At least one operation/,
  );
});

test("invalid success status is rejected during configuration", () => {
  assert.throws(
    () => createDomainControllers("test", {
      read: {
        source: "body",
        schema: z.object({}) as unknown as ControllerSchema,
        execute: () => ({}),
        successStatus: 302,
      },
    }),
    /Invalid success status/,
  );
});

test("invalid request source is rejected during configuration", () => {
  assert.throws(
    () => createDomainControllers("test", {
      read: {
        source: "cookie" as ControllerOperation["source"],
        schema: z.object({}) as unknown as ControllerSchema,
        execute: () => ({}),
      },
    }),
    /Invalid request source/,
  );
});

