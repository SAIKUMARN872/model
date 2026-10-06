import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import { loadAccountConfig } from "./config/config.js";
import {
  InMemoryAccountRepository,
  InMemoryProfileRepository,
} from "./repository/index.js";
import { AccountEventBus } from "./events/account-events.js";
import { AccountService } from "./services/account-service.js";
import { ProfileService } from "./services/profile-service.js";
import {
  AccountController,
  ProfileController,
} from "./api/index.js";

export function createAccountApp() {
  const config = loadAccountConfig();

  const accountRepository = new InMemoryAccountRepository();
  const profileRepository = new InMemoryProfileRepository();
  const eventBus = new AccountEventBus();

  const accountService = new AccountService(
    accountRepository,
    eventBus,
  );

  const profileService = new ProfileService(
    profileRepository,
    accountRepository,
    eventBus,
  );

  const accountController = new AccountController(accountService);
  const profileController = new ProfileController(profileService);

  const app = express();

  app.use(express.json({ limit: "1mb" }));

  app.get("/health", (_req, res) => {
    res.json({
      success: true,
      service: "modelnow-account",
      status: "healthy",
      environment: config.environment,
      timestamp: new Date().toISOString(),
    });
  });

  app.get("/account", accountController.list);
  app.post("/account", accountController.create);

  app.get("/account/by-email", accountController.getByEmail);

  app.get("/account/:id", accountController.getById);
  app.patch("/account/:id", accountController.update);
  app.delete("/account/:id", accountController.delete);

  app.get(
    "/account/:id/profile",
    profileController.get,
  );

  app.patch(
    "/account/:id/profile",
    profileController.update,
  );

  app.get("/account/events/stream", (req, res) => {
    res.status(200);

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    res.flushHeaders();

    const sendEvent = (event: {
      id: string;
      type: string;
      timestamp: string;
      data: unknown;
    }) => {
      res.write(`id: ${event.id}\n`);
      res.write(`event: ${event.type}\n`);
      res.write(
        `data: ${JSON.stringify({
          id: event.id,
          type: event.type,
          timestamp: event.timestamp,
          data: event.data,
        })}\n\n`,
      );
    };

    res.write(
      `event: connected\ndata: ${JSON.stringify({
        service: "modelnow-account",
        connectedAt: new Date().toISOString(),
      })}\n\n`,
    );

    const unsubscribe = eventBus.subscribe(sendEvent);

    const heartbeat = setInterval(() => {
      res.write(
        `event: heartbeat\ndata: ${JSON.stringify({
          timestamp: new Date().toISOString(),
        })}\n\n`,
      );
    }, 15000);

    req.on("close", () => {
      clearInterval(heartbeat);
      unsubscribe();
      res.end();
    });
  });

  app.use(
    (
      err: unknown,
      _req: Request,
      res: Response,
      _next: NextFunction,
    ) => {
      const message =
        err instanceof Error
          ? err.message
          : "Internal server error";

      const status =
        message === "Account not found"
          ? 404
          : message.includes("already exists")
            ? 409
            : message.includes("Invalid") ||
                message.includes("required")
              ? 400
              : 500;

      res.status(status).json({
        success: false,
        error: message,
      });
    },
  );

  return {
    app,
    accountRepository,
    profileRepository,
    eventBus,
  };
}
