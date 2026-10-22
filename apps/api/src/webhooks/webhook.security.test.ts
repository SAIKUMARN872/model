import assert from "node:assert/strict";
import test from "node:test";
import type { Request, Response, NextFunction } from "express";
import {
  computeWebhookSignature,
  verifyWebhookSignature,
  createWebhookSignatureMiddleware,
  type RawBodyRequest,
} from "./webhook.security.js";
import { createWebhookReceiver } from "./webhook.controller.js";

const secret = "test-secret-that-is-only-used-in-unit-tests";
const body = Buffer.from('{"event":"invoice.paid","id":"evt_test_123"}');

test("computes and verifies HMAC-SHA256 over exact raw bytes", () => {
  const signature = computeWebhookSignature(body, secret);
  assert.match(signature, /^sha256=[a-f0-9]{64}$/);
  assert.equal(verifyWebhookSignature(body, signature, secret), true);
  assert.equal(verifyWebhookSignature(Buffer.from(body.toString() + " "), signature, secret), false);
});

test("rejects malformed signatures, wrong secrets, and missing values", () => {
  const signature = computeWebhookSignature(body, secret);
  assert.equal(verifyWebhookSignature(body, "nope", secret), false);
  assert.equal(verifyWebhookSignature(body, "sha256=abcd", secret), false);
  assert.equal(verifyWebhookSignature(body, signature, "different-secret"), false);
  assert.equal(verifyWebhookSignature(body, undefined, secret), false);
  assert.equal(verifyWebhookSignature(body, signature, ""), false);
});

test("signature helper rejects non-buffer request bodies", () => {
  assert.throws(() => computeWebhookSignature("body" as unknown as Buffer, secret), TypeError);
  assert.equal(verifyWebhookSignature("body" as unknown as Buffer, "invalid", secret), false);
});

test("middleware requires a configured secret provider", () => {
  assert.throws(
    () => createWebhookSignatureMiddleware(null as never),
    TypeError,
  );
  assert.throws(
    () => createWebhookSignatureMiddleware({ secrets: null as never }),
    TypeError,
  );
});

test("middleware rejects missing raw body and invalid signatures", async () => {
  const middleware = createWebhookSignatureMiddleware({
    secrets: { getSecret: (provider) => provider === "example" ? secret : undefined },
  });

  const invoke = (rawBody: Buffer | undefined, signature: string | undefined) =>
    new Promise<unknown>((resolve) => {
      const request = {
        params: { provider: "example" },
        get: (name: string) => name === "x-modelnow-signature" ? signature : undefined,
        rawBody,
      } as unknown as RawBodyRequest;
      const response = {} as Response;
      const next: NextFunction = (error?: unknown) => resolve(error);
      middleware(request, response, next);
    });

  assert.equal((await invoke(undefined, computeWebhookSignature(body, secret)) as { code: string }).code, "WEBHOOK_RAW_BODY_REQUIRED");
  assert.equal((await invoke(body, "sha256=bad") as { code: string }).code, "WEBHOOK_SIGNATURE_INVALID");
});

test("middleware fails closed when provider secret is not configured", async () => {
  const middleware = createWebhookSignatureMiddleware({
    secrets: { getSecret: () => undefined },
  });

  const error = await new Promise<unknown>((resolve) => {
    middleware(
      {
        params: { provider: "example" },
        get: () => computeWebhookSignature(body, secret),
        rawBody: body,
      } as unknown as Request,
      {} as Response,
      (value?: unknown) => resolve(value),
    );
  });

  assert.equal((error as { code: string }).code, "WEBHOOK_CONFIGURATION_UNAVAILABLE");
});

test("receiver requires valid injected handlers", () => {
  assert.throws(() => createWebhookReceiver(null as never), TypeError);
  assert.throws(() => createWebhookReceiver({ example: {} as never }), TypeError);
});

test("receiver rejects unsupported providers without dispatching", async () => {
  const receiver = createWebhookReceiver({});
  let status = 0;
  let payload: unknown;

  await receiver(
    { params: { provider: "unknown" }, body: {} } as unknown as Request,
    {
      locals: {},
      headersSent: false,
      status(code: number) { status = code; return this; },
      json(value: unknown) { payload = value; return this; },
    } as unknown as Response,
    (() => {}) as NextFunction,
  );

  assert.equal(status, 404);
  assert.equal((payload as { error: { code: string } }).error.code, "WEBHOOK_PROVIDER_UNSUPPORTED");
});

test("receiver dispatches to an explicitly configured handler", async () => {
  let received: unknown;
  const receiver = createWebhookReceiver({
    example: { handle: async (event) => { received = event; } },
  });

  let status = 0;
  await receiver(
    { params: { provider: "example" }, body: { id: "evt_1" } } as unknown as Request,
    {
      locals: {},
      headersSent: false,
      status(code: number) { status = code; return this; },
      json() { return this; },
    } as unknown as Response,
    (() => {}) as NextFunction,
  );

  assert.deepEqual(received, { id: "evt_1" });
  assert.equal(status, 202);
});
