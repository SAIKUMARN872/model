export async function withTimeout<T>(
  operation: Promise<T>,
  timeoutMs: number,
): Promise<T> {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error("Timeout must be positive");
  }

  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>(
    (_resolve, reject) => {
      timer = setTimeout(() => {
        reject(new Error("Operation timed out"));
      }, timeoutMs);
    },
  );

  try {
    return await Promise.race([
      operation,
      timeout,
    ]);
  } finally {
    if (timer) {
      clearTimeout(timer);
    }
  }
}
