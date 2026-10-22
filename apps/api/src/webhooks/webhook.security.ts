import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, RequestHandler } from "express";
import { ApiError } from "../errors/api.error.js";

export const WEBHOOK_SIGNATURE_HEADER = "x-modelnow-signature";
export const WEBHOOK_RAW_BODY_PROPERTY = "rawBody";

export interface RawBodyRequest extends Request {
  readonly rawBody?: Buffer;
}

export interface WebhookSecretProvider {
  getSecret(provider: string): string | undefined;
}

export interface WebhookSecurityOptions {
  readonly secrets: WebhookSecretProvider;
  readonly signatureHeader?: string;
}

const PROVIDER_PATTERN = /^[a-z0-9][a-z0-9_-]{0,63}$/;
const SIGNATURE_PATTERN = /^sha256=([a-f0-9]{64})$/i;

export function computeWebhookSignature(
  rawBody: Buffer,
  secret: string,
): string {
  if (!Buffer.isBuffer(rawBody)) {
    throw new TypeError("Webhook raw body must be a Buffer.");
  }
  if (typeof secret !== "string" || secret.length === 0) {
    throw new TypeError("Webhook secret must not be empty.");
  }

  return `sha256=${createHmac("sha256", secret).update(rawBody).digest("hex")}`;
}

export function verifyWebhookSignature(
  rawBody: Buffer,
  suppliedSignature: unknown,
  secret: string,
): boolean {
  if (!Buffer.isBuffer(rawBody) || typeof suppliedSignature !== "string") {
    return false;
  }

  const match = SIGNATURE_PATTERN.exec(suppliedSignature);
  if (!match || typeof secret !== "string" || secret.length === 0) {
    return false;
  }

  const expected = Buffer.from(
    computeWebhookSignature(rawBody, secret).slice("sha256=".length),
    "hex",
  );
  const supplied = Buffer.from(match[1]!, "hex");

  return expected.length === supplied.length &&
    timingSafeEqual(expected, supplied);
}

/**
 * This middleware implements ModelNow's generic HMAC-SHA256 signature format.
 * It is not automatically compatible with third-party provider protocols.
 * Provider-specific timestamp/replay validation must be implemented separately.
 */
export function createWebhookSignatureMiddleware(
  options: WebhookSecurityOptions,
): RequestHandler {
  if (
    !options ||
    !options.secrets ||
    typeof options.secrets.getSecret !== "function"
  ) {
    throw new TypeError("A webhook secret provider is required.");
  }

  const signatureHeader = options.signatureHeader ?? WEBHOOK_SIGNATURE_HEADER;
  if (
    typeof signatureHeader !== "string" ||
    !/^[a-z0-9-]+$/i.test(signatureHeader)
  ) {
    throw new TypeError("Invalid webhook signature header name.");
  }

  return (request, _response, next) => {
    const provider = request.params.provider;

    if (typeof provider !== "string" || !PROVIDER_PATTERN.test(provider)) {
      next(new ApiError(400, "WEBHOOK_PROVIDER_INVALID", "Invalid webhook provider."));
      return;
    }

    let secret: string | undefined;
    try {
      secret = options.secrets.getSecret(provider);
    } catch {
      next(new ApiError(503, "WEBHOOK_CONFIGURATION_UNAVAILABLE", "Webhook verification is unavailable."));
      return;
    }

    if (typeof secret !== "string" || secret.length === 0) {
      next(new ApiError(503, "WEBHOOK_CONFIGURATION_UNAVAILABLE", "Webhook verification is unavailable."));
      return;
    }

    const rawBody = (request as RawBodyRequest).rawBody;
    if (!Buffer.isBuffer(rawBody)) {
      next(new ApiError(400, "WEBHOOK_RAW_BODY_REQUIRED", "Webhook raw body is unavailable."));
      return;
    }

    const signature = request.get(signatureHeader);
    if (!verifyWebhookSignature(rawBody, signature, secret)) {
      next(new ApiError(401, "WEBHOOK_SIGNATURE_INVALID", "Webhook signature verification failed."));
      return;
    }

    next();
  };
}
