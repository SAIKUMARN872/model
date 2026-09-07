"use client";

/**
 * Enterprise API Error Handling
 *
 * Responsibilities:
 * - Standardize API errors
 * - Preserve HTTP status information
 * - Normalize backend error responses
 * - Support validation errors
 * - Support request IDs / correlation IDs
 * - Provide safe serialization
 * - Provide consistent error messages
 */

/**
 * Standard API error codes.
 */
export const API_ERROR_CODES =
  Object.freeze({
    UNKNOWN_ERROR:
      "UNKNOWN_ERROR",

    NETWORK_ERROR:
      "NETWORK_ERROR",

    TIMEOUT:
      "TIMEOUT",

    UNAUTHORIZED:
      "UNAUTHORIZED",

    FORBIDDEN:
      "FORBIDDEN",

    NOT_FOUND:
      "NOT_FOUND",

    VALIDATION_ERROR:
      "VALIDATION_ERROR",

    CONFLICT:
      "CONFLICT",

    RATE_LIMITED:
      "RATE_LIMITED",

    SERVER_ERROR:
      "SERVER_ERROR",

    SERVICE_UNAVAILABLE:
      "SERVICE_UNAVAILABLE",

    REQUEST_ABORTED:
      "REQUEST_ABORTED",
  });

/**
 * HTTP status constants.
 */
export const HTTP_STATUS =
  Object.freeze({
    BAD_REQUEST: 400,

    UNAUTHORIZED: 401,

    FORBIDDEN: 403,

    NOT_FOUND: 404,

    CONFLICT: 409,

    UNPROCESSABLE_ENTITY: 422,

    TOO_MANY_REQUESTS: 429,

    INTERNAL_SERVER_ERROR: 500,

    BAD_GATEWAY: 502,

    SERVICE_UNAVAILABLE: 503,

    GATEWAY_TIMEOUT: 504,
  });

/**
 * Convert HTTP status to
 * an application error code.
 */
export const getErrorCodeFromStatus =
  (
    status
  ) => {
    switch (status) {
      case HTTP_STATUS.UNAUTHORIZED:
        return API_ERROR_CODES.UNAUTHORIZED;

      case HTTP_STATUS.FORBIDDEN:
        return API_ERROR_CODES.FORBIDDEN;

      case HTTP_STATUS.NOT_FOUND:
        return API_ERROR_CODES.NOT_FOUND;

      case HTTP_STATUS.BAD_REQUEST:
      case HTTP_STATUS.UNPROCESSABLE_ENTITY:
        return API_ERROR_CODES.VALIDATION_ERROR;

      case HTTP_STATUS.CONFLICT:
        return API_ERROR_CODES.CONFLICT;

      case HTTP_STATUS.TOO_MANY_REQUESTS:
        return API_ERROR_CODES.RATE_LIMITED;

      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
      case HTTP_STATUS.BAD_GATEWAY:
        return API_ERROR_CODES.SERVER_ERROR;

      case HTTP_STATUS.SERVICE_UNAVAILABLE:
      case HTTP_STATUS.GATEWAY_TIMEOUT:
        return API_ERROR_CODES.SERVICE_UNAVAILABLE;

      default:
        return API_ERROR_CODES.UNKNOWN_ERROR;
    }
  };

/**
 * Get a user-friendly message
 * based on HTTP status.
 */
export const getDefaultErrorMessage =
  (
    status
  ) => {
    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        return "The request was invalid.";

      case HTTP_STATUS.UNAUTHORIZED:
        return "Your session has expired. Please sign in again.";

      case HTTP_STATUS.FORBIDDEN:
        return "You do not have permission to perform this action.";

      case HTTP_STATUS.NOT_FOUND:
        return "The requested resource was not found.";

      case HTTP_STATUS.CONFLICT:
        return "The request conflicts with the current resource state.";

      case HTTP_STATUS.UNPROCESSABLE_ENTITY:
        return "The submitted data could not be processed.";

      case HTTP_STATUS.TOO_MANY_REQUESTS:
        return "Too many requests. Please try again later.";

      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return "An unexpected server error occurred.";

      case HTTP_STATUS.BAD_GATEWAY:
        return "The server received an invalid response.";

      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        return "The service is temporarily unavailable.";

      case HTTP_STATUS.GATEWAY_TIMEOUT:
        return "The server took too long to respond.";

      default:
        return "An unexpected error occurred.";
    }
  };

/**
 * Safely extract a message from
 * an unknown error response.
 */
export const extractErrorMessage =
  (
    payload
  ) => {
    if (!payload) {
      return null;
    }

    if (
      typeof payload ===
      "string"
    ) {
      return payload;
    }

    if (
      typeof payload.message ===
      "string"
    ) {
      return payload.message;
    }

    if (
      typeof payload.error ===
      "string"
    ) {
      return payload.error;
    }

    if (
      typeof payload.error?.message ===
      "string"
    ) {
      return payload.error.message;
    }

    if (
      typeof payload.detail ===
      "string"
    ) {
      return payload.detail;
    }

    return null;
  };

/**
 * Extract validation errors.
 */
export const extractValidationErrors =
  (
    payload
  ) => {
    if (!payload) {
      return {};
    }

    if (
      payload.errors &&
      typeof payload.errors ===
        "object"
    ) {
      return payload.errors;
    }

    if (
      payload.error?.errors &&
      typeof payload.error.errors ===
        "object"
    ) {
      return payload.error.errors;
    }

    if (
      payload.details &&
      typeof payload.details ===
        "object"
    ) {
      return payload.details;
    }

    return {};
  };

/**
 * Enterprise API Error class.
 */
export class ApiError extends Error {
  /**
   * @param {Object} options
   */
  constructor({
    message,
    status = null,
    code = API_ERROR_CODES.UNKNOWN_ERROR,
    data = null,
    errors = {},
    requestId = null,
    correlationId = null,
    endpoint = null,
    method = null,
    cause = null,
  } = {}) {
    super(
      message ||
        getDefaultErrorMessage(
          status
        )
    );

    this.name =
      "ApiError";

    this.status =
      status;

    this.code =
      code;

    this.data =
      data;

    this.errors =
      errors;

    this.requestId =
      requestId;

    this.correlationId =
      correlationId;

    this.endpoint =
      endpoint;

    this.method =
      method;

    this.timestamp =
      new Date().toISOString();

    /**
     * Preserve original error
     * when supported by runtime.
     */
    if (cause) {
      this.cause =
        cause;
    }

    /**
     * Capture stack trace when
     * available.
     */
    if (
      Error.captureStackTrace
    ) {
      Error.captureStackTrace(
        this,
        ApiError
      );
    }
  }

  /**
   * Check whether this is
   * an authentication error.
   */
  isUnauthorized() {
    return (
      this.status ===
        HTTP_STATUS.UNAUTHORIZED ||
      this.code ===
        API_ERROR_CODES.UNAUTHORIZED
    );
  }

  /**
   * Check whether this is
   * a forbidden error.
   */
  isForbidden() {
    return (
      this.status ===
        HTTP_STATUS.FORBIDDEN ||
      this.code ===
        API_ERROR_CODES.FORBIDDEN
    );
  }

  /**
   * Check whether this is
   * a not-found error.
   */
  isNotFound() {
    return (
      this.status ===
        HTTP_STATUS.NOT_FOUND ||
      this.code ===
        API_ERROR_CODES.NOT_FOUND
    );
  }

  /**
   * Check whether this is
   * a validation error.
   */
  isValidationError() {
    return (
      this.status ===
        HTTP_STATUS.BAD_REQUEST ||
      this.status ===
        HTTP_STATUS.UNPROCESSABLE_ENTITY ||
      this.code ===
        API_ERROR_CODES.VALIDATION_ERROR
    );
  }

  /**
   * Check whether this is
   * a rate-limit error.
   */
  isRateLimited() {
    return (
      this.status ===
        HTTP_STATUS.TOO_MANY_REQUESTS ||
      this.code ===
        API_ERROR_CODES.RATE_LIMITED
    );
  }

  /**
   * Check whether this is
   * a server-side error.
   */
  isServerError() {
    return (
      this.status >= 500 ||
      this.code ===
        API_ERROR_CODES.SERVER_ERROR ||
      this.code ===
        API_ERROR_CODES.SERVICE_UNAVAILABLE
    );
  }

  /**
   * Convert error into a
   * serializable object.
   */
  toJSON() {
    return {
      name:
        this.name,

      message:
        this.message,

      status:
        this.status,

      code:
        this.code,

      data:
        this.data,

      errors:
        this.errors,

      requestId:
        this.requestId,

      correlationId:
        this.correlationId,

      endpoint:
        this.endpoint,

      method:
        this.method,

      timestamp:
        this.timestamp,
    };
  }
}

/**
 * Create ApiError from an HTTP response.
 *
 * Works with fetch Response objects.
 */
export const createApiErrorFromResponse =
  async (
    response,
    options = {}
  ) => {
    let payload = null;

    try {
      const contentType =
        response.headers?.get(
          "content-type"
        );

      if (
        contentType?.includes(
          "application/json"
        )
      ) {
        payload =
          await response.json();
      } else {
        payload =
          await response.text();
      }
    } catch {
      payload = null;
    }

    const status =
      response.status;

    const message =
      extractErrorMessage(
        payload
      ) ||
      getDefaultErrorMessage(
        status
      );

    const code =
      payload?.code ||
      payload?.error?.code ||
      getErrorCodeFromStatus(
        status
      );

    const errors =
      extractValidationErrors(
        payload
      );

    const requestId =
      response.headers?.get(
        "x-request-id"
      ) ||
      response.headers?.get(
        "x-request-id"
      ) ||
      payload?.requestId ||
      payload?.request_id ||
      null;

    const correlationId =
      response.headers?.get(
        "x-correlation-id"
      ) ||
      payload?.correlationId ||
      payload?.correlation_id ||
      null;

    return new ApiError({
      message,

      status,

      code,

      data:
        payload,

      errors,

      requestId,

      correlationId,

      endpoint:
        options.endpoint ||
        null,

      method:
        options.method ||
        null,
    });
  };

/**
 * Normalize any unknown error
 * into an ApiError.
 */
export const normalizeApiError =
  (
    error,
    options = {}
  ) => {
    /**
     * Already normalized.
     */
    if (
      error instanceof
      ApiError
    ) {
      return error;
    }

    /**
     * AbortController error.
     */
    if (
      error?.name ===
      "AbortError"
    ) {
      return new ApiError({
        message:
          "The request was cancelled.",

        code:
          API_ERROR_CODES.REQUEST_ABORTED,

        endpoint:
          options.endpoint,

        method:
          options.method,

        cause:
          error,
      });
    }

    /**
     * Network error.
     */
    if (
      error instanceof
      TypeError
    ) {
      return new ApiError({
        message:
          "Unable to connect to the server. Please check your network connection.",

        code:
          API_ERROR_CODES.NETWORK_ERROR,

        endpoint:
          options.endpoint,

        method:
          options.method,

        cause:
          error,
      });
    }

    /**
     * Generic error object.
     */
    if (
      error instanceof
      Error
    ) {
      return new ApiError({
        message:
          error.message,

        code:
          API_ERROR_CODES.UNKNOWN_ERROR,

        endpoint:
          options.endpoint,

        method:
          options.method,

        cause:
          error,
      });
    }

    /**
     * Unknown value.
     */
    return new ApiError({
      message:
        "An unexpected error occurred.",

      code:
        API_ERROR_CODES.UNKNOWN_ERROR,

      data:
        error,

      endpoint:
        options.endpoint,

      method:
        options.method,
    });
  };

/**
 * Check whether an error
 * is an ApiError.
 */
export const isApiError = (
  error
) => {
  return (
    error instanceof
    ApiError
  );
};

/**
 * Get a safe user-facing
 * error message.
 *
 * Internal backend details should
 * not be exposed directly to users.
 */
export const getUserFriendlyErrorMessage =
  (
    error
  ) => {
    const normalizedError =
      normalizeApiError(
        error
      );

    if (
      normalizedError.isUnauthorized()
    ) {
      return "Your session has expired. Please sign in again.";
    }

    if (
      normalizedError.isForbidden()
    ) {
      return "You do not have permission to perform this action.";
    }

    if (
      normalizedError.isNotFound()
    ) {
      return "The requested resource could not be found.";
    }

    if (
      normalizedError.isValidationError()
    ) {
      return (
        normalizedError.message ||
        "Please check the submitted information."
      );
    }

    if (
      normalizedError.isRateLimited()
    ) {
      return "Too many requests. Please wait and try again.";
    }

    if (
      normalizedError.isServerError()
    ) {
      return "The service is temporarily unavailable. Please try again later.";
    }

    return (
      normalizedError.message ||
      "Something went wrong. Please try again."
    );
  };

/**
 * Export everything as default.
 */
export default {
  ApiError,

  API_ERROR_CODES,

  HTTP_STATUS,

  getErrorCodeFromStatus,

  getDefaultErrorMessage,

  extractErrorMessage,

  extractValidationErrors,

  createApiErrorFromResponse,

  normalizeApiError,

  isApiError,

  getUserFriendlyErrorMessage,
};