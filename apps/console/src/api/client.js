/**
 * Enterprise API Client
 * ---------------------
 * Centralized HTTP client for the Console application.
 *
 * Responsibilities:
 * - API base URL management
 * - Authentication
 * - Request/response normalization
 * - Timeout handling
 * - Retry handling
 * - Correlation/request IDs
 * - JSON and text response parsing
 * - File upload support
 * - Standardized API errors
 *
 * Usage:
 *
 * import apiClient from "@/api/client";
 *
 * const response = await apiClient.get("/models");
 *
 * const result = await apiClient.post("/models", {
 *   name: "gpt-model",
 * });
 */

const DEFAULT_TIMEOUT = 30_000;

const DEFAULT_RETRY_CONFIG = {
  retries: 2,
  retryDelay: 500,
  retryStatusCodes: [408, 429, 500, 502, 503, 504],
};

const HTTP_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  PATCH: "PATCH",
  DELETE: "DELETE",
};

const STORAGE_KEYS = {
  ACCESS_TOKEN: "access_token",
  TOKEN: "token",
};

/**
 * Custom API Error
 */
export class ApiError extends Error {
  constructor(message, options = {}) {
    super(message);

    this.name = "ApiError";

    this.status = options.status ?? null;
    this.statusText = options.statusText ?? "";
    this.code = options.code ?? null;
    this.details = options.details ?? null;
    this.data = options.data ?? null;
    this.requestId = options.requestId ?? null;
    this.url = options.url ?? null;

    if (options.cause) {
      this.cause = options.cause;
    }
  }
}

/**
 * Request Timeout Error
 */
export class RequestTimeoutError extends ApiError {
  constructor(message = "The request timed out.", options = {}) {
    super(message, {
      ...options,
      code: "REQUEST_TIMEOUT",
    });

    this.name = "RequestTimeoutError";
  }
}

/**
 * Network Error
 */
export class NetworkError extends ApiError {
  constructor(message = "Unable to connect to the server.", options = {}) {
    super(message, {
      ...options,
      code: "NETWORK_ERROR",
    });

    this.name = "NetworkError";
  }
}

/**
 * Generate a unique request ID.
 *
 * Used for:
 * - Debugging
 * - Distributed tracing
 * - Backend log correlation
 */
function generateRequestId() {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `req_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 12)}`;
}

/**
 * Get API base URL.
 *
 * Supports:
 * - Vite
 * - Next.js
 * - React environment variables
 *
 * Priority:
 * 1. VITE_API_BASE_URL
 * 2. NEXT_PUBLIC_API_BASE_URL
 * 3. REACT_APP_API_BASE_URL
 * 4. Default /api
 */
function getApiBaseUrl() {
  if (typeof import.meta !== "undefined" && import.meta.env) {
    if (import.meta.env.VITE_API_BASE_URL) {
      return import.meta.env.VITE_API_BASE_URL;
    }
  }

  if (typeof process !== "undefined" && process.env) {
    if (process.env.NEXT_PUBLIC_API_BASE_URL) {
      return process.env.NEXT_PUBLIC_API_BASE_URL;
    }

    if (process.env.REACT_APP_API_BASE_URL) {
      return process.env.REACT_APP_API_BASE_URL;
    }
  }

  return "/api";
}

/**
 * Safely read token from storage.
 */
function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return (
      window.localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
      window.localStorage.getItem(STORAGE_KEYS.TOKEN)
    );
  } catch (error) {
    console.warn("Unable to access localStorage.", error);
    return null;
  }
}

/**
 * Remove authentication token.
 */
function clearStoredToken() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    window.localStorage.removeItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.warn("Unable to clear authentication token.", error);
  }
}

/**
 * Redirect to login when authentication expires.
 */
function handleUnauthorized() {
  if (typeof window === "undefined") {
    return;
  }

  clearStoredToken();

  const currentPath = window.location.pathname;

  if (!currentPath.includes("/login")) {
    const redirectPath = encodeURIComponent(
      `${window.location.pathname}${window.location.search}`
    );

    window.location.assign(`/login?redirect=${redirectPath}`);
  }
}

/**
 * Normalize URL.
 */
function buildUrl(baseUrl, endpoint, queryParams) {
  if (!endpoint) {
    throw new ApiError("API endpoint is required.", {
      code: "INVALID_ENDPOINT",
    });
  }

  const normalizedBaseUrl = String(baseUrl).replace(/\/+$/, "");

  const normalizedEndpoint = String(endpoint).startsWith("/")
    ? endpoint
    : `/${endpoint}`;

  const url = new URL(
    `${normalizedBaseUrl}${normalizedEndpoint}`,
    typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost"
  );

  if (queryParams && typeof queryParams === "object") {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value === undefined || value === null) {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => {
          url.searchParams.append(key, String(item));
        });

        return;
      }

      if (typeof value === "boolean") {
        url.searchParams.set(key, value ? "true" : "false");
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

/**
 * Determine whether request body should be JSON encoded.
 */
function shouldSerializeJson(body) {
  if (body === null || body === undefined) {
    return false;
  }

  if (typeof body === "string") {
    return false;
  }

  if (
    body instanceof FormData ||
    body instanceof Blob ||
    body instanceof ArrayBuffer ||
    body instanceof URLSearchParams
  ) {
    return false;
  }

  return typeof body === "object";
}

/**
 * Parse response body safely.
 */
async function parseResponseBody(response) {
  const contentType = response.headers.get("content-type") || "";

  if (response.status === 204) {
    return null;
  }

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  if (
    contentType.includes("text/") ||
    contentType.includes("application/xml")
  ) {
    return await response.text();
  }

  try {
    return await response.json();
  } catch {
    try {
      return await response.text();
    } catch {
      return null;
    }
  }
}

/**
 * Extract meaningful error message.
 */
function extractErrorMessage(data, fallbackMessage) {
  if (!data) {
    return fallbackMessage;
  }

  if (typeof data === "string") {
    return data;
  }

  if (data.message) {
    return data.message;
  }

  if (data.error) {
    if (typeof data.error === "string") {
      return data.error;
    }

    if (data.error.message) {
      return data.error.message;
    }
  }

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors
      .map((error) => {
        if (typeof error === "string") {
          return error;
        }

        return error.message || JSON.stringify(error);
      })
      .join(", ");
  }

  return fallbackMessage;
}

/**
 * Create standardized API error.
 */
async function createApiError(response, requestUrl) {
  const data = await parseResponseBody(response);

  const requestId =
    response.headers.get("x-request-id") ||
    response.headers.get("x-correlation-id");

  const message = extractErrorMessage(
    data,
    `Request failed with status ${response.status}.`
  );

  return new ApiError(message, {
    status: response.status,
    statusText: response.statusText,
    data,
    details: data?.details || data?.errors || null,
    code: data?.code || `HTTP_${response.status}`,
    requestId,
    url: requestUrl,
  });
}

/**
 * Check if an HTTP request can safely be retried.
 */
function isRetryableMethod(method) {
  return [
    HTTP_METHODS.GET,
    HTTP_METHODS.PUT,
    HTTP_METHODS.DELETE,
  ].includes(method);
}

/**
 * Check if error is retryable.
 */
function isRetryableError(error) {
  if (!error) {
    return false;
  }

  if (error instanceof RequestTimeoutError) {
    return true;
  }

  if (error instanceof NetworkError) {
    return true;
  }

  if (
    typeof error.status === "number" &&
    DEFAULT_RETRY_CONFIG.retryStatusCodes.includes(error.status)
  ) {
    return true;
  }

  return false;
}

/**
 * Exponential backoff.
 */
function getRetryDelay(attempt, baseDelay) {
  const exponentialDelay = baseDelay * 2 ** attempt;

  const jitter = Math.floor(Math.random() * 100);

  return exponentialDelay + jitter;
}

/**
 * Wait helper.
 */
function sleep(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

/**
 * Create timeout controller.
 */
function createTimeoutController(timeout, externalSignal) {
  const controller = new AbortController();

  let timeoutId = null;

  if (timeout > 0) {
    timeoutId = setTimeout(() => {
      controller.abort("timeout");
    }, timeout);
  }

  if (externalSignal) {
    if (externalSignal.aborted) {
      controller.abort(externalSignal.reason);
    } else {
      externalSignal.addEventListener(
        "abort",
        () => {
          controller.abort(externalSignal.reason);
        },
        {
          once: true,
        }
      );
    }
  }

  return {
    controller,
    cleanup() {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    },
  };
}

/**
 * Enterprise API Client.
 */
class ApiClient {
  constructor(config = {}) {
    this.baseUrl = config.baseUrl || getApiBaseUrl();

    this.defaultTimeout =
      config.timeout !== undefined
        ? config.timeout
        : DEFAULT_TIMEOUT;

    this.defaultHeaders = {
      Accept: "application/json",
      ...(config.headers || {}),
    };

    this.retryConfig = {
      ...DEFAULT_RETRY_CONFIG,
      ...(config.retry || {}),
    };

    this.getToken =
      config.getToken ||
      (() => {
        return getStoredToken();
      });

    this.onUnauthorized =
      config.onUnauthorized ||
      (() => {
        handleUnauthorized();
      });

    this.onRequest = config.onRequest || null;
    this.onResponse = config.onResponse || null;
    this.onError = config.onError || null;
  }

  /**
   * Update API base URL.
   */
  setBaseUrl(baseUrl) {
    if (!baseUrl) {
      throw new ApiError("API base URL cannot be empty.", {
        code: "INVALID_BASE_URL",
      });
    }

    this.baseUrl = baseUrl;
  }

  /**
   * Get current API base URL.
   */
  getBaseUrl() {
    return this.baseUrl;
  }

  /**
   * Build request headers.
   */
  buildHeaders(options = {}) {
    const {
      headers = {},
      body,
      authenticated = true,
      requestId,
    } = options;

    const token = authenticated ? this.getToken() : null;

    const finalHeaders = {
      ...this.defaultHeaders,
      ...headers,
      "X-Request-ID": requestId,
    };

    if (token) {
      finalHeaders.Authorization = `Bearer ${token}`;
    }

    if (
      body !== undefined &&
      body !== null &&
      !(body instanceof FormData) &&
      !(body instanceof Blob) &&
      !(body instanceof ArrayBuffer) &&
      !(body instanceof URLSearchParams)
    ) {
      finalHeaders["Content-Type"] =
        finalHeaders["Content-Type"] ||
        "application/json";
    }

    return finalHeaders;
  }

  /**
   * Execute HTTP request.
   */
  async request(endpoint, options = {}) {
    const {
      method = HTTP_METHODS.GET,
      body,
      params,
      headers,
      timeout = this.defaultTimeout,
      signal,
      authenticated = true,
      retries = this.retryConfig.retries,
      retryDelay = this.retryConfig.retryDelay,
      skipRetry = false,
    } = options;

    const normalizedMethod = method.toUpperCase();

    const requestId = generateRequestId();

    const requestUrl = buildUrl(
      this.baseUrl,
      endpoint,
      params
    );

    const finalHeaders = this.buildHeaders({
      headers,
      body,
      authenticated,
      requestId,
    });

    let requestBody = body;

    if (shouldSerializeJson(body)) {
      requestBody = JSON.stringify(body);
    }

    const maxRetries =
      skipRetry ||
      !isRetryableMethod(normalizedMethod)
        ? 0
        : retries;

    let attempt = 0;

    while (attempt <= maxRetries) {
      const startedAt = Date.now();

      const timeoutController = createTimeoutController(
        timeout,
        signal
      );

      const requestOptions = {
        method: normalizedMethod,
        headers: finalHeaders,
        body: requestBody,
        signal: timeoutController.controller.signal,
      };

      try {
        if (this.onRequest) {
          await this.onRequest({
            url: requestUrl,
            method: normalizedMethod,
            requestId,
            attempt,
          });
        }

        const response = await fetch(
          requestUrl,
          requestOptions
        );

        timeoutController.cleanup();

        const duration = Date.now() - startedAt;

        if (this.onResponse) {
          await this.onResponse({
            response,
            url: requestUrl,
            method: normalizedMethod,
            requestId,
            duration,
            attempt,
          });
        }

        if (response.status === 401) {
          const error = await createApiError(
            response,
            requestUrl
          );

          if (this.onError) {
            await this.onError(error);
          }

          this.onUnauthorized();

          throw error;
        }

        if (response.status === 403) {
          const error = await createApiError(
            response,
            requestUrl
          );

          if (this.onError) {
            await this.onError(error);
          }

          throw error;
        }

        if (!response.ok) {
          const error = await createApiError(
            response,
            requestUrl
          );

          if (
            attempt < maxRetries &&
            isRetryableError(error)
          ) {
            const delay = getRetryDelay(
              attempt,
              retryDelay
            );

            await sleep(delay);

            attempt += 1;

            continue;
          }

          if (this.onError) {
            await this.onError(error);
          }

          throw error;
        }

        return await parseResponseBody(response);
      } catch (error) {
        timeoutController.cleanup();

        if (error instanceof ApiError) {
          if (
            attempt < maxRetries &&
            isRetryableError(error)
          ) {
            const delay = getRetryDelay(
              attempt,
              retryDelay
            );

            await sleep(delay);

            attempt += 1;

            continue;
          }

          throw error;
        }

        if (
          error?.name === "AbortError" ||
          error?.message === "timeout"
        ) {
          const timeoutError =
            new RequestTimeoutError(
              `Request timed out after ${timeout}ms.`,
              {
                url: requestUrl,
                requestId,
                cause: error,
              }
            );

          if (
            attempt < maxRetries
          ) {
            const delay = getRetryDelay(
              attempt,
              retryDelay
            );

            await sleep(delay);

            attempt += 1;

            continue;
          }

          if (this.onError) {
            await this.onError(timeoutError);
          }

          throw timeoutError;
        }

        const networkError = new NetworkError(
          "A network error occurred while communicating with the API.",
          {
            url: requestUrl,
            requestId,
            cause: error,
          }
        );

        if (
          attempt < maxRetries
        ) {
          const delay = getRetryDelay(
            attempt,
            retryDelay
          );

          await sleep(delay);

          attempt += 1;

          continue;
        }

        if (this.onError) {
          await this.onError(networkError);
        }

        throw networkError;
      }
    }

    throw new ApiError(
      "Request failed after all retry attempts.",
      {
        code: "MAX_RETRIES_EXCEEDED",
        url: requestUrl,
        requestId,
      }
    );
  }

  /**
   * GET request.
   */
  get(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: HTTP_METHODS.GET,
    });
  }

  /**
   * POST request.
   */
  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: HTTP_METHODS.POST,
      body,
    });
  }

  /**
   * PUT request.
   */
  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: HTTP_METHODS.PUT,
      body,
    });
  }

  /**
   * PATCH request.
   */
  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: HTTP_METHODS.PATCH,
      body,
    });
  }

  /**
   * DELETE request.
   */
  delete(endpoint, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: HTTP_METHODS.DELETE,
    });
  }

  /**
   * Upload file.
   */
  upload(endpoint, formData, options = {}) {
    if (!(formData instanceof FormData)) {
      throw new ApiError(
        "Upload requires a FormData instance.",
        {
          code: "INVALID_FORM_DATA",
        }
      );
    }

    return this.request(endpoint, {
      ...options,
      method: HTTP_METHODS.POST,
      body: formData,
    });
  }

  /**
   * Download file.
   */
  async download(endpoint, options = {}) {
    const {
      params,
      headers,
      timeout,
      signal,
      authenticated = true,
    } = options;

    const requestId = generateRequestId();

    const requestUrl = buildUrl(
      this.baseUrl,
      endpoint,
      params
    );

    const finalHeaders = this.buildHeaders({
      headers,
      authenticated,
      requestId,
    });

    const timeoutController =
      createTimeoutController(
        timeout || this.defaultTimeout,
        signal
      );

    try {
      const response = await fetch(
        requestUrl,
        {
          method: HTTP_METHODS.GET,
          headers: finalHeaders,
          signal:
            timeoutController.controller.signal,
        }
      );

      timeoutController.cleanup();

      if (!response.ok) {
        throw await createApiError(
          response,
          requestUrl
        );
      }

      return await response.blob();
    } catch (error) {
      timeoutController.cleanup();

      if (error instanceof ApiError) {
        throw error;
      }

      throw new NetworkError(
        "Unable to download the requested file.",
        {
          url: requestUrl,
          requestId,
          cause: error,
        }
      );
    }
  }
}

/**
 * Default API client instance.
 */
const apiClient = new ApiClient();

/**
 * Named exports.
 */
export {
  ApiClient,
  apiClient,
  getApiBaseUrl,
  getStoredToken,
  clearStoredToken,
  generateRequestId,
};

/**
 * Default export.
 */
export default apiClient;