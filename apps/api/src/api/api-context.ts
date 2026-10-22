export interface ApiContext {
  readonly requestId: string;
  readonly apiVersion: string;
}

export function createApiContext(
  requestId: string,
  apiVersion: string,
): ApiContext {
  if (requestId.trim().length === 0) {
    throw new Error("A request ID is required.");
  }

  if (apiVersion.trim().length === 0) {
    throw new Error("An API version is required.");
  }

  return Object.freeze({
    requestId,
    apiVersion,
  });
}