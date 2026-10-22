import { createApp } from "./app.js";
import { connectRedisClient, closeRedisClient } from "./cache/redis.client.js";
import { settings } from "./config/settings.js";
import { logger } from "./config/logging.js";
import { RedisRateLimitStore } from "./middleware/redis-rate-limit-store.js";
import {
  closeDatabasePool,
  createDatabasePool,
  loadDatabaseConfig,
  verifyDatabaseConnection,
} from "./database/index.js";
import { setDatabasePool } from "./database/runtime.js";

type DatabasePool = ReturnType<typeof createDatabasePool>;

let databasePool: DatabasePool | undefined;

async function closeDatabase(): Promise<void> {
  const pool = databasePool;
  databasePool = undefined;
  setDatabasePool(undefined);

  if (pool) {
    await closeDatabasePool(pool);
  }
}

async function startServer(): Promise<void> {
  let rateLimitStore: RedisRateLimitStore | undefined;

  if (settings.isProduction) {
    const databaseConfig = loadDatabaseConfig(process.env);
    databasePool = createDatabasePool(databaseConfig);
    await verifyDatabaseConnection(databasePool);
    setDatabasePool(databasePool);

    const client = await connectRedisClient();
    rateLimitStore = new RedisRateLimitStore(client);
  }

  const app = createApp({ rateLimitStore, databasePool });
  const server = app.listen(
    settings.server.port,
    settings.server.host,
    () => {
      logger.info("API server started", {
        host: settings.server.host,
        port: settings.server.port,
        environment: settings.environment,
      });
    },
  );

  server.requestTimeout = settings.server.requestTimeoutMs;

  let shutdownPromise: Promise<void> | undefined;

  function shutdown(signal: string): Promise<void> {
    if (shutdownPromise) return shutdownPromise;

    shutdownPromise = (async () => {
      logger.info("API server shutdown requested", { signal });

      if (server.listening) {
        await new Promise<void>((resolve) => {
          server.close((error) => {
            if (error) {
              logger.error("API server shutdown failed", { message: error.message });
              process.exitCode = 1;
            }
            resolve();
          });
        });
      }

      try {
        await closeRedisClient();
      } catch (error: unknown) {
        logger.error("Redis shutdown failed", {
          message: error instanceof Error ? error.message : String(error),
        });
        process.exitCode = 1;
      }

      try {
        await closeDatabase();
      } catch (error: unknown) {
        logger.error("PostgreSQL shutdown failed", {
          message: error instanceof Error ? error.message : String(error),
        });
        process.exitCode = 1;
      }
    })();

    return shutdownPromise;
  }

  server.on("error", (error: NodeJS.ErrnoException) => {
    logger.error("API server failed to start or encountered a server error", {
      code: error.code,
      message: error.message,
    });
    process.exitCode = 1;
    void shutdown("SERVER_ERROR");
  });

  process.once("SIGINT", () => { void shutdown("SIGINT"); });
  process.once("SIGTERM", () => { void shutdown("SIGTERM"); });
}

void startServer().catch(async (error: unknown) => {
  logger.error("API server failed to start", {
    message: error instanceof Error ? error.message : String(error),
  });
  process.exitCode = 1;

  try {
    await closeRedisClient();
  } catch (cleanupError: unknown) {
    logger.error("Redis cleanup after startup failure failed", {
      message: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
    });
  }

  try {
    await closeDatabase();
  } catch (cleanupError: unknown) {
    logger.error("PostgreSQL cleanup after startup failure failed", {
      message: cleanupError instanceof Error ? cleanupError.message : String(cleanupError),
    });
  }
});