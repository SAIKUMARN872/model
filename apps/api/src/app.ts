import express from "express";
import type { Pool } from "pg";
import type { RequestHandler } from "express";
import helmet from "helmet";
import { createVersionedApiRouter } from "./api/router.js";
import { API_VERSION_PREFIX } from "./api/version.js";
import { environment } from "./config/environment.js";
import { settings } from "./config/settings.js";
import { createJwtAuthenticationConfig } from "./auth/security.js";
import { createJwtAuthenticationProvider } from "./auth/jwt.js";
import { createAuthenticationMiddleware } from "./middleware/authentication.js";
import type { AuthenticationProvider } from "./middleware/authentication-provider.js";
import { ApiError } from "./errors/api.error.js";
import {
  corsMiddleware,
  requestIdMiddleware,
  requestTracingMiddleware,
  requestLoggerMiddleware,
  createRateLimitMiddleware,
} from "./middleware/index.js";
import { errorHandler } from "./middleware/error-handler.js";
import { API_ERROR_CODES } from "./errors/error-codes.js";
import type { RateLimitStore } from "./middleware/rate-limit.js";
import { createWebhookRoutes } from "./routes/webhook.routes.js";
import {
  createWebhookReceiver,
  createWebhookSignatureMiddleware,
} from "./webhooks/index.js";
import type {
  WebhookEventHandlers,
  WebhookSecretProvider,
} from "./webhooks/index.js";

export interface AppOptions {
  /**
   * Inject a trusted provider for isolated tests or controlled deployments.
   * Passing null deliberately disables authentication configuration and fails
   * protected requests closed; it never permits anonymous access.
   */
  readonly authenticationProvider?: AuthenticationProvider | null;
  readonly rateLimitStore?: RateLimitStore;
  /** Explicitly injected PostgreSQL pool; absent in isolated/dev configurations. */
  readonly databasePool?: Pool;
  /**
   * Webhooks are disabled unless trusted secrets and handlers are injected.
   */
  readonly webhooks?: {
    readonly secrets: WebhookSecretProvider;
    readonly handlers: WebhookEventHandlers;
  };
}

function unavailableAuthenticationMiddleware(): RequestHandler {
  return (_req, _res, next) => {
    next(new ApiError(
      503,
      "AUTHENTICATION_NOT_CONFIGURED",
      "Authentication is not configured for this API.",
    ));
  };
}

function buildAuthenticationMiddleware(
  injectedProvider: AuthenticationProvider | null | undefined,
): RequestHandler {
  if (injectedProvider === null) {
    return unavailableAuthenticationMiddleware();
  }

  if (injectedProvider !== undefined) {
    return createAuthenticationMiddleware(injectedProvider);
  }

  if (
    !environment.JWT_ISSUER ||
    !environment.JWT_AUDIENCE ||
    !environment.JWT_JWKS_URL
  ) {
    return unavailableAuthenticationMiddleware();
  }

  const config = createJwtAuthenticationConfig({
    issuer: environment.JWT_ISSUER,
    audience: environment.JWT_AUDIENCE,
    jwksUrl: environment.JWT_JWKS_URL,
    algorithms: environment.JWT_ALGORITHMS,
  });

  return createAuthenticationMiddleware(
    createJwtAuthenticationProvider(config),
  );
}

export function createApp(options: AppOptions = {}) {
  const app = express();
  const authenticationMiddleware = buildAuthenticationMiddleware(
    options.authenticationProvider,
  );

  app.disable("x-powered-by");

  if (settings.server.trustProxy) {
    app.set("trust proxy", 1);
  }

  app.use(requestIdMiddleware);
  app.use(requestTracingMiddleware);
  app.use(requestLoggerMiddleware);
  app.use(helmet());
  app.use(corsMiddleware);

  // Keep health probes available to load balancers and monitoring systems.
  // All other requests, including JSON parsing failures, count toward the limit.
  app.use(
    createRateLimitMiddleware({
      maxRequests: settings.rateLimit.maxRequests,
      windowMs: settings.rateLimit.windowMs,
      maxKeys: settings.rateLimit.maxKeys,
      store: options.rateLimitStore,
      skip: (request) => {
        const path = request.path;
        return (
          path === `${API_VERSION_PREFIX}/health` ||
          path === `${API_VERSION_PREFIX}/health/live` ||
          path === `${API_VERSION_PREFIX}/health/ready`
        );
      },
    }),
  );

  app.use(express.json({
    limit: settings.server.bodyLimit,
    verify: (request, _response, buffer) => {
      const requestPath = (request.url ?? "").split("?", 1)[0] ?? "";

      if (requestPath.startsWith(`${API_VERSION_PREFIX}/webhooks/`)) {
        (request as import("express").Request & { rawBody?: Buffer }).rawBody =
          Buffer.from(buffer);
      }
    },
  }));

  app.get("/", (_req, res) => {
    return res.json({
      service: settings.serviceName,
      version: settings.apiVersion,
      status: "running",
    });
  });

  const domainRoutes = [
    ...(options.webhooks
      ? [{
          path: "/webhooks",
          router: createWebhookRoutes(
            createWebhookSignatureMiddleware({
              secrets: options.webhooks.secrets,
            }),
            {
              receive: createWebhookReceiver(options.webhooks.handlers),
            },
          ),
        }]
      : []),
  ];

  app.use(
    createVersionedApiRouter(authenticationMiddleware, domainRoutes),
  );

  app.use((_req, res) => {
    return res.status(404).json({
      success: false,
      error: {
        code: API_ERROR_CODES.NOT_FOUND,
        message: "The requested resource was not found.",
      },
      requestId: res.locals.requestId,
    });
  });

  app.use(errorHandler);

  return app;
}

const app = createApp();

export default app;

