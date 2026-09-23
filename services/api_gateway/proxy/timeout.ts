export interface TimeoutOptions {
  timeoutMs: number;
}

export class ProxyTimeoutError extends Error {
  readonly timeoutMs: number;

  constructor(timeoutMs: number) {
    super(`Proxy request timed out after ${timeoutMs}ms`);
    this.name = "ProxyTimeoutError";
    this.timeoutMs = timeoutMs;
  }
}

export function validateTimeout(timeoutMs: number): void {
  if (!Number.isFinite(timeoutMs)) {
    throw new Error("timeoutMs must be a finite number");
  }

  if (timeoutMs <= 0) {
    throw new Error("timeoutMs must be greater than 0");
  }
}

export function createTimeoutSignal(
  timeoutMs: number,
): AbortSignal {
  validateTimeout(timeoutMs);

  return AbortSignal.timeout(Math.floor(timeoutMs));
}

export async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  validateTimeout(timeoutMs);

  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new ProxyTimeoutError(timeoutMs));
    }, timeoutMs);
  });

  try {
    return await Promise.race([
      operation,
      timeoutPromise,
    ]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}