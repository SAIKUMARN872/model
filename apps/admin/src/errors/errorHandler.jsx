/**
 * Global Error Handler
 *
 * Centralized error handling utilities for the Admin application.
 */

const ERROR_TYPES = {
  NETWORK: "NETWORK_ERROR",
  API: "API_ERROR",
  AUTHENTICATION: "AUTHENTICATION_ERROR",
  AUTHORIZATION: "AUTHORIZATION_ERROR",
  VALIDATION: "VALIDATION_ERROR",
  NOT_FOUND: "NOT_FOUND_ERROR",
  SERVER: "SERVER_ERROR",
  UNKNOWN: "UNKNOWN_ERROR",
};

/**
 * Application Error class
 */
export class AppError extends Error {
  constructor(
    message,
    type = ERROR_TYPES.UNKNOWN,
    statusCode = null,
    details = null
  ) {
    super(message);

    this.name = "AppError";
    this.type = type;
    this.statusCode = statusCode;
    this.details = details;

    // Required for extending Error in some environments
    Object.setPrototypeOf(
      this,
      AppError.prototype
    );
  }
}

/**
 * Convert HTTP status code to error type
 */
export function getErrorType(statusCode) {
  if (!statusCode) {
    return ERROR_TYPES.UNKNOWN;
  }

  switch (statusCode) {
    case 400:
      return ERROR_TYPES.VALIDATION;

    case 401:
      return ERROR_TYPES.AUTHENTICATION;

    case 403:
      return ERROR_TYPES.AUTHORIZATION;

    case 404:
      return ERROR_TYPES.NOT_FOUND;

    case 500:
    case 501:
    case 502:
    case 503:
    case 504:
      return ERROR_TYPES.SERVER;

    default:
      return ERROR_TYPES.API;
  }
}

/**
 * Normalize any error into a predictable format
 */
export function normalizeError(error) {
  if (!error) {
    return new AppError(
      "An unknown error occurred.",
      ERROR_TYPES.UNKNOWN
    );
  }

  // Already normalized
  if (error instanceof AppError) {
    return error;
  }

  // Axios-style error
  if (error.response) {
    const statusCode = error.response.status;

    const message =
      error.response.data?.message ||
      error.response.data?.error ||
      error.message ||
      "An API request failed.";

    return new AppError(
      message,
      getErrorType(statusCode),
      statusCode,
      error.response.data
    );
  }

  // Fetch/network error
  if (
    error instanceof TypeError ||
    error.message?.toLowerCase().includes("network")
  ) {
    return new AppError(
      "Unable to connect to the server. Please check your internet connection.",
      ERROR_TYPES.NETWORK,
      null,
      error
    );
  }

  // Standard JavaScript Error
  if (error instanceof Error) {
    return new AppError(
      error.message || "An unexpected error occurred.",
      ERROR_TYPES.UNKNOWN,
      null,
      error
    );
  }

  // String or unknown value
  return new AppError(
    String(error),
    ERROR_TYPES.UNKNOWN
  );
}

/**
 * Get a user-friendly error message
 */
export function getUserFriendlyMessage(error) {
  const normalizedError =
    normalizeError(error);

  switch (normalizedError.type) {
    case ERROR_TYPES.NETWORK:
      return "Unable to connect to the server. Please check your internet connection and try again.";

    case ERROR_TYPES.AUTHENTICATION:
      return "Your session has expired. Please sign in again.";

    case ERROR_TYPES.AUTHORIZATION:
      return "You do not have permission to perform this action.";

    case ERROR_TYPES.VALIDATION:
      return (
        normalizedError.message ||
        "Please check the information you entered."
      );

    case ERROR_TYPES.NOT_FOUND:
      return "The requested resource could not be found.";

    case ERROR_TYPES.SERVER:
      return "The server encountered an error. Please try again later.";

    case ERROR_TYPES.API:
      return (
        normalizedError.message ||
        "The request could not be completed."
      );

    default:
      return (
        normalizedError.message ||
        "Something went wrong. Please try again."
      );
  }
}

/**
 * Log errors during development
 */
export function logError(
  error,
  context = {}
) {
  const normalizedError =
    normalizeError(error);

  const errorDetails = {
    name: normalizedError.name,
    message: normalizedError.message,
    type: normalizedError.type,
    statusCode:
      normalizedError.statusCode,
    details: normalizedError.details,
    context,
    timestamp:
      new Date().toISOString(),
  };

  if (
    typeof process !== "undefined" &&
    process.env?.NODE_ENV === "development"
  ) {
    console.group(
      "Application Error"
    );

    console.error(
      "Message:",
      errorDetails.message
    );

    console.error(
      "Type:",
      errorDetails.type
    );

    console.error(
      "Status:",
      errorDetails.statusCode
    );

    console.error(
      "Context:",
      errorDetails.context
    );

    console.error(
      "Details:",
      errorDetails.details
    );

    console.groupEnd();
  }

  return errorDetails;
}

/**
 * Handle authentication errors
 */
export function handleAuthenticationError(
  error
) {
  const normalizedError =
    normalizeError(error);

  if (
    normalizedError.type ===
    ERROR_TYPES.AUTHENTICATION
  ) {
    // Clear authentication data
    try {
      localStorage.removeItem(
        "accessToken"
      );

      localStorage.removeItem(
        "refreshToken"
      );

      sessionStorage.removeItem(
        "accessToken"
      );
    } catch (storageError) {
      console.error(
        "Unable to clear authentication data:",
        storageError
      );
    }

    return true;
  }

  return false;
}

/**
 * Handle API errors
 */
export function handleApiError(
  error,
  context = {}
) {
  const normalizedError =
    normalizeError(error);

  logError(
    normalizedError,
    context
  );

  handleAuthenticationError(
    normalizedError
  );

  return {
    success: false,
    error: normalizedError,
    message:
      getUserFriendlyMessage(
        normalizedError
      ),
  };
}

/**
 * Global unhandled Promise rejection handler
 */
export function setupGlobalErrorHandlers() {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleUnhandledRejection = (
    event
  ) => {
    const error =
      normalizeError(event.reason);

    logError(error, {
      source:
        "unhandledrejection",
    });
  };

  const handleWindowError = (
    event
  ) => {
    const error =
      normalizeError(event.error);

    logError(error, {
      source: "window.onerror",
      filename: event.filename,
      lineNumber:
        event.lineno,
      columnNumber:
        event.colno,
    });
  };

  window.addEventListener(
    "unhandledrejection",
    handleUnhandledRejection
  );

  window.addEventListener(
    "error",
    handleWindowError
  );

  // Cleanup function
  return () => {
    window.removeEventListener(
      "unhandledrejection",
      handleUnhandledRejection
    );

    window.removeEventListener(
      "error",
      handleWindowError
    );
  };
}

/**
 * Export error types
 */
export { ERROR_TYPES };

export default {
  AppError,
  normalizeError,
  getErrorType,
  getUserFriendlyMessage,
  logError,
  handleApiError,
  handleAuthenticationError,
  setupGlobalErrorHandlers,
  ERROR_TYPES,
};