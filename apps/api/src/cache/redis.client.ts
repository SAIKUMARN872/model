import { createClient } from "redis";

type ModelNowRedisClient = ReturnType<typeof createClient>;

let redisClient: ModelNowRedisClient | undefined;
let connectPromise: Promise<ModelNowRedisClient> | undefined;

/**
 * Returns the shared Redis client.
 * Configure REDIS_URL before using Redis-backed cache operations.
 */
export function getRedisClient(): ModelNowRedisClient {
  const url = process.env.REDIS_URL?.trim();

  if (!url) {
    throw new Error("REDIS_URL must be configured to use Redis.");
  }

  if (!redisClient) {
    redisClient = createClient({
      url,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) =>
          retries >= 5 ? false : Math.min(retries * 250, 1500),
      },
    });

    redisClient.on("error", (error: Error) => {
      console.error("[ModelNow Redis] Client error:", error.message);
    });
  }

  return redisClient;
}

/**
 * Connects once and shares an in-flight connection attempt.
 * Connection errors are propagated to the caller.
 */
export async function connectRedisClient(): Promise<ModelNowRedisClient> {
  const client = getRedisClient();

  if (client.isReady) {
    return client;
  }

  if (!connectPromise) {
    connectPromise = client
      .connect()
      .then(() => client)
      .finally(() => {
        connectPromise = undefined;
      });
  }

  return connectPromise;
}

/**
 * Gracefully closes the shared connection.
 * Safe to call repeatedly when no connection exists.
 */
export async function closeRedisClient(): Promise<void> {
  const client = redisClient;

  if (!client) {
    return;
  }

  if (connectPromise) {
    await connectPromise.catch(() => undefined);
  }

  if (client.isOpen) {
    await client.quit();
  }

  if (redisClient === client) {
    redisClient = undefined;
    connectPromise = undefined;
  }
}

export function isRedisReady(): boolean {
  return redisClient?.isReady ?? false;
}