 /**
  * Enterprise API Error System
  *
  * Responsibilities:
  * - Standardize API errors
  * - Preserve HTTP status information
  * - Preserve backend error codes
  * - Track correlation IDs
  * - Support validation errors
  * - Support authentication errors
  * - Support authorization errors
  * - Support rate limiting
  * - Support network and timeout failures
  */

/* =========================================================
   Error Categories
========================================================= */

const API_ERROR_TYPES = {
  UNKNOWN:
    "UNKNOWN_ERROR",

  NETWORK:
    "NETWORK_ERROR",

  TIMEOUT:
    "TIMEOUT_ERROR",

  CANCELLED:
    "REQUEST_CANCELLED",

  VALIDATION:
    "VALIDATION_ERROR",

  AUTHENTICATION:
    "AUTHENTICATION_ERROR",

  AUTHORIZATION:
    "AUTHORIZATION_ERROR",

  NOT_FOUND:
    "NOT_FOUND_ERROR",

  CONFLICT:
    "CONFLICT_ERROR",

  RATE_LIMITED:
    "RATE_LIMITED_ERROR",

  SERVER:
    "SERVER_ERROR",

  SERVICE_UNAVAILABLE:
    "SERVICE_UNAVAILABLE_ERROR",
};

/* =========================================================
   HTTP Status Codes
========================================================= */

const HTTP_STATUS = {
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
};

/* =========================================================
   Default Error Messages
========================================================= */

const DEFAULT_ERROR_MESSAGES = {
  [API_ERROR_TYPES.UNKNOWN]:
    "An unexpected error occurred.",

  [API_ERROR_TYPES.NETWORK]:
    "Unable to connect to the server.",

  [API_ERROR_TYPES.TIMEOUT]:
    "The request timed out. Please try again.",

  [API_ERROR_TYPES.CANCELLED]:
    "The request was cancelled.",

  [API_ERROR_TYPES.VALIDATION]:
    "The submitted information is invalid.",

  [API_ERROR_TYPES.AUTHENTICATION]:
    "Authentication is required. Please sign in again.",

  [API_ERROR_TYPES.AUTHORIZATION]:
    "You do not have permission to perform this action.",

  [API_ERROR_TYPES.NOT_FOUND]:
    "The requested resource could not be found.",

  [API_ERROR_TYPES.CONFLICT]:
    "The request conflicts with existing data.",

  [API_ERROR_TYPES.RATE_LIMITED]:
    "Too many requests. Please try again later.",

  [API_ERROR_TYPES.SERVER]:
    "An unexpected server error occurred.",

  [API_ERROR_TYPES.SERVICE_UNAVAILABLE]:
    "The service is temporarily unavailable.",
};

/* =========================================================
   API Error Class
========================================================= */

class ApiError extends Error {
  constructor({
    message,
    code = null,
    type = API_ERROR_TYPES.UNKNOWN,
    status = null,
    details = null,
    validationErrors = null,
    correlationId = null,
    endpoint = null,
    method = null,
    requestId = null,
    retryAfter = null,
    originalError = null,
  } = {}) {
    super(
      message ||
        DEFAULT_ERROR_MESSAGES[
          type
        ] ||
        DEFAULT_ERROR_MESSAGES[
          API_ERROR_TYPES.UNKNOWN
        ]
    );

    this.name =
      "ApiError";

    this.code =
      code;

    this.type =
      type;

    this.status =
      status;

    this.details =
      details;

    this.validationErrors =
      validationErrors;

    this.correlationId =
      correlationId;

    this.endpoint =
      endpoint;

    this.method =
      method;

    this.requestId =
      requestId;

    this.retryAfter =
      retryAfter;

    this.originalError =
      originalError;

    this.timestamp =
      new Date().toISOString();

    /* Preserve native stack trace */

    if (
      Error.captureStackTrace
    ) {
      Error.captureStackTrace(
        this,
        ApiError
      );
    }
  }

  /* =======================================================
     Authentication Check
  ======================================================= */

  isAuthenticationError() {
    return (
      this.type ===
      API_ERROR_TYPES.AUTHENTICATION
    );
  }

  /* =======================================================
     Authorization Check
  ======================================================= */

  isAuthorizationError() {
    return (
      this.type ===
      API_ERROR_TYPES.AUTHORIZATION
    );
  }

  /* =======================================================
     Validation Check
  ======================================================= */

  isValidationError() {
    return (
      this.type ===
      API_ERROR_TYPES.VALIDATION
    );
  }

  /* =======================================================
     Network Check
  ======================================================= */

  isNetworkError() {
    return (
      this.type ===
      API_ERROR_TYPES.NETWORK
    );
  }

  /* =======================================================
     Timeout Check
  ======================================================= */

  isTimeoutError() {
    return (
      this.type ===
      API_ERROR_TYPES.TIMEOUT
    );
  }

  /* =======================================================
     Retry Check
  ======================================================= */

  isRetryable() {
    return [
      API_ERROR_TYPES.NETWORK,

      API_ERROR_TYPES.TIMEOUT,

      API_ERROR_TYPES.RATE_LIMITED,

      API_ERROR_TYPES.SERVER,

      API_ERROR_TYPES.SERVICE_UNAVAILABLE,
    ].includes(
      this.type
    );
  }

  /* =======================================================
     Client Error Check
  ======================================================= */

  isClientError() {
    return (
      this.status >= 400 &&
      this.status < 500
    );
  }

  /* =======================================================
     Server Error Check
  ======================================================= */

  isServerError() {
    return (
      this.status >= 500
    );
  }

  /* =======================================================
     JSON Serialization
  ======================================================= */

  toJSON() {
    return {
      name:
        this.name,

      message:
        this.message,

      code:
        this.code,

      type:
        this.type,

      status:
        this.status,

      details:
        this.details,

      validationErrors:
        this.validationErrors,

      correlationId:
        this.correlationId,

      endpoint:
        this.endpoint,

      method:
        this.method,

      requestId:
        this.requestId,

      retryAfter:
        this.retryAfter,

      timestamp:
        this.timestamp,
    };
  }
}

/* =========================================================
   Error Type Resolver
========================================================= */

const resolveErrorType = ({
  status,
  code,
  error,
}) => {
  /* Request Cancelled */

  if (
    error?.name ===
    "CanceledError"
  ) {
    return (
      API_ERROR_TYPES.CANCELLED
    );
  }

  /* Timeout */

  if (
    error?.code ===
      "ECONNABORTED" ||
    error?.code ===
      "ETIMEDOUT"
  ) {
    return (
      API_ERROR_TYPES.TIMEOUT
    );
  }

  /* Network */

  if (
    !status &&
    !error?.response
  ) {
    return (
      API_ERROR_TYPES.NETWORK
    );
  }

  /* Explicit Backend Code */

  if (
    code ===
    "VALIDATION_ERROR"
  ) {
    return (
      API_ERROR_TYPES.VALIDATION
    );
  }

  /* HTTP Status Mapping */

  switch (status) {
    case HTTP_STATUS.BAD_REQUEST:
      return (
        API_ERROR_TYPES.VALIDATION
      );

    case HTTP_STATUS.UNAUTHORIZED:
      return (
        API_ERROR_TYPES.AUTHENTICATION
      );

    case HTTP_STATUS.FORBIDDEN:
      return (
        API_ERROR_TYPES.AUTHORIZATION
      );

    case HTTP_STATUS.NOT_FOUND:
      return (
        API_ERROR_TYPES.NOT_FOUND
      );

    case HTTP_STATUS.CONFLICT:
      return (
        API_ERROR_TYPES.CONFLICT
      );

    case HTTP_STATUS.UNPROCESSABLE_ENTITY:
      return (
        API_ERROR_TYPES.VALIDATION
      );

    case HTTP_STATUS.TOO_MANY_REQUESTS:
      return (
        API_ERROR_TYPES.RATE_LIMITED
      );

    case HTTP_STATUS.INTERNAL_SERVER_ERROR:
    case HTTP_STATUS.BAD_GATEWAY:
      return (
        API_ERROR_TYPES.SERVER
      );

    case HTTP_STATUS.SERVICE_UNAVAILABLE:
    case HTTP_STATUS.GATEWAY_TIMEOUT:
      return (
        API_ERROR_TYPES.SERVICE_UNAVAILABLE
      );

    default:
      return (
        API_ERROR_TYPES.UNKNOWN
      );
  }
};

/* =========================================================
   Axios Error Converter
========================================================= */

const fromAxiosError = (
  error
) => {
  if (
    error instanceof
    ApiError
  ) {
    return error;
  }

  const response =
    error?.response;

  const config =
    error?.config;

  const responseData =
    response?.data || {};

  const status =
    response?.status ||
    null;

  const code =
    responseData?.code ||
    error?.code ||
    null;

  const type =
    resolveErrorType({
      status,

      code,

      error,
    });

  const correlationId =
    config?.metadata
      ?.correlationId ||
    response?.headers?.[
      "x-correlation-id"
    ] ||
    null;

  const requestId =
    response?.headers?.[
      "x-request-id"
    ] ||
    null;

  const retryAfter =
    response?.headers?.[
      "retry-after"
    ] ||
    null;

  const validationErrors =
    responseData?.errors ||
    responseData?.validationErrors ||
    null;

  const message =
    responseData?.message ||
    error?.message ||
    DEFAULT_ERROR_MESSAGES[
      type
    ];

  return new ApiError({
    message,

    code,

    type,

    status,

    details:
      responseData?.details ||
      null,

    validationErrors,

    correlationId,

    endpoint:
      config?.url ||
      null,

    method:
      config?.method
        ?.toUpperCase() ||
      null,

    requestId,

    retryAfter,

    originalError:
      error,
  });
};

/* =========================================================
   Generic Error Converter
========================================================= */

const toApiError = (
  error
) => {
  if (
    error instanceof
    ApiError
  ) {
    return error;
  }

  return fromAxiosError(
    error
  );
};

/* =========================================================
   Validation Error Factory
========================================================= */

const createValidationError = (
  message,
  validationErrors = {},
  details = null
) => {
  return new ApiError({
    message:
      message ||
      DEFAULT_ERROR_MESSAGES[
        API_ERROR_TYPES.VALIDATION
      ],

    type:
      API_ERROR_TYPES.VALIDATION,

    code:
      "VALIDATION_ERROR",

    status:
      HTTP_STATUS.UNPROCESSABLE_ENTITY,

    validationErrors,

    details,
  });
};

/* =========================================================
   Authentication Error Factory
========================================================= */

const createAuthenticationError = (
  message =
    "Authentication is required."
) => {
  return new ApiError({
    message,

    type:
      API_ERROR_TYPES.AUTHENTICATION,

    code:
      "AUTHENTICATION_REQUIRED",

    status:
      HTTP_STATUS.UNAUTHORIZED,
  });
};

/* =========================================================
   Authorization Error Factory
========================================================= */

const createAuthorizationError = (
  message =
    "You do not have permission to perform this action."
) => {
  return new ApiError({
    message,

    type:
      API_ERROR_TYPES.AUTHORIZATION,

    code:
      "INSUFFICIENT_PERMISSIONS",

    status:
      HTTP_STATUS.FORBIDDEN,
  });
};

/* =========================================================
   Network Error Factory
========================================================= */

const createNetworkError = (
  message =
    "Unable to connect to the server."
) => {
  return new ApiError({
    message,

    type:
      API_ERROR_TYPES.NETWORK,

    code:
      "NETWORK_ERROR",
  });
};

/* =========================================================
   Timeout Error Factory
========================================================= */

const createTimeoutError = (
  message =
    "The request timed out. Please try again."
) => {
  return new ApiError({
    message,

    type:
      API_ERROR_TYPES.TIMEOUT,

    code:
      "REQUEST_TIMEOUT",
  });
};

/* =========================================================
   Error Message Helper
========================================================= */

const getApiErrorMessage = (
  error,
  fallback =
    "An unexpected error occurred."
) => {
  if (
    error instanceof
    ApiError
  ) {
    return error.message;
  }

  if (
    error?.response?.data
      ?.message
  ) {
    return (
      error.response.data
        .message
    );
  }

  if (
    error?.message
  ) {
    return error.message;
  }

  return fallback;
};

/* =========================================================
   Exports
========================================================= */

export {
  ApiError,

  API_ERROR_TYPES,

  HTTP_STATUS,

  DEFAULT_ERROR_MESSAGES,

  resolveErrorType,

  fromAxiosError,

  toApiError,

  createValidationError,

  createAuthenticationError,

  createAuthorizationError,

  createNetworkError,

  createTimeoutError,

  getApiErrorMessage,
};

/* =========================================================
   Default Export
========================================================= */

export default ApiError;