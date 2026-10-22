import type { Request, RequestHandler } from "express";

export interface WebhookEventHandler {
  readonly handle: (
    event: unknown,
    request: Request,
  ) => void | Promise<void>;
}

export type WebhookEventHandlers = Readonly<Record<string, WebhookEventHandler>>;

/**
 * Dispatches verified webhook events to explicitly injected handlers.
 * It does not persist events or promise idempotency; those require a durable store.
 */
export function createWebhookReceiver(
  handlers: WebhookEventHandlers,
): RequestHandler {
  if (!handlers || typeof handlers !== "object" || Array.isArray(handlers)) {
    throw new TypeError("Webhook handlers must be an object.");
  }

  for (const [provider, handler] of Object.entries(handlers)) {
    if (
      !/^[a-z0-9][a-z0-9_-]{0,63}$/.test(provider) ||
      !handler ||
      typeof handler.handle !== "function"
    ) {
      throw new TypeError("Invalid webhook handler configuration.");
    }
  }

  return async (request, response, next) => {
    try {
      const provider = request.params.provider;
      const handler = typeof provider === "string" ? handlers[provider] : undefined;

      if (!handler) {
        response.status(404).json({
          success: false,
          error: {
            code: "WEBHOOK_PROVIDER_UNSUPPORTED",
            message: "The webhook provider is not supported.",
          },
          requestId: response.locals.requestId,
        });
        return;
      }

      await handler.handle(request.body, request);

      if (response.headersSent) return;

      response.status(202).json({
        success: true,
        data: { accepted: true },
        requestId: response.locals.requestId,
      });
    } catch (error: unknown) {
      if (!response.headersSent) next(error);
    }
  };
}
