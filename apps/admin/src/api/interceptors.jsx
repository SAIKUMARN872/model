import {
  getAccessToken,
} from "./client";

/**
 * Enterprise API Interceptors
 *
 * Responsibilities:
 * - Attach authentication tokens
 * - Generate request correlation IDs
 * - Track request timing
 * - Handle authentication failures
 * - Handle authorization failures
 * - Handle server errors
 * - Normalize API responses
 * - Provide centralized API observability
 */

/* =========================================================
   Constants
========================================================= */

const AUTH_EVENTS = {
  UNAUTHORIZED:
    "auth:unauthorized",

  FORBIDDEN:
    "auth:forbidden",

  SESSION_EXPIRED:
    "auth:session-expired",
};

const API_EVENTS = {
  REQUEST_STARTED:
    "api:request-started",

  REQUEST_COMPLETED:
    "api:request-completed",

  REQUEST_FAILED:
    "api:request-failed",
};

/* =========================================================
   Correlation ID
========================================================= */

const generateCorrelationId = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID ===
      "function"
  ) {
    return crypto.randomUUID();
  }

  return `req_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 10)}`;
};

/* =========================================================
   Event Dispatcher
========================================================= */

const dispatchBrowserEvent = (
  eventName,
  detail = {}
) => {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      eventName,
      {
        detail,
      }
    )
  );
};

/* =========================================================
   Request Interceptor
========================================================= */

const requestInterceptor = (
  config
) => {
  const token =
    getAccessToken();

  const correlationId =
    generateCorrelationId();

  const requestStartedAt =
    Date.now();

  config.headers =
    config.headers || {};

  /* Authentication */

  if (token) {
    config.headers.Authorization =
      `Bearer ${token}`;
  }

  /* Correlation */

  config.headers[
    "X-Correlation-ID"
  ] = correlationId;

  /* Client Information */

  config.headers[
    "X-Client-Version"
  ] =
    import.meta.env
      .VITE_APP_VERSION ||
    "1.0.0";

  config.headers[
    "X-Client-Platform"
  ] = "web-admin";

  /* Internal Request Metadata */

  config.metadata = {
    ...(config.metadata || {}),

    correlationId,

    requestStartedAt,
  };

  /* Observability */

  dispatchBrowserEvent(
    API_EVENTS.REQUEST_STARTED,
    {
      method:
        config.method?.toUpperCase(),

      url:
        config.url,

      correlationId,

      timestamp:
        requestStartedAt,
    }
  );

  /* Development Logging */

  if (
    import.meta.env.DEV
  ) {
    console.debug(
      "[API REQUEST]",
      {
        method:
          config.method?.toUpperCase(),

        url:
          config.url,

        correlationId,
      }
    );
  }

  return config;
};

/* =========================================================
   Request Error Interceptor
========================================================= */

const requestErrorInterceptor = (
  error
) => {
  if (
    import.meta.env.DEV
  ) {
    console.error(
      "[API REQUEST ERROR]",
      error
    );
  }

  return Promise.reject(
    error
  );
};

/* =========================================================
   Response Interceptor
========================================================= */

const responseInterceptor = (
  response
) => {
  const metadata =
    response.config
      ?.metadata || {};

  const completedAt =
    Date.now();

  const duration =
    metadata.requestStartedAt
      ? completedAt -
        metadata.requestStartedAt
      : null;

  const correlationId =
    metadata.correlationId;

  /* Observability */

  dispatchBrowserEvent(
    API_EVENTS.REQUEST_COMPLETED,
    {
      method:
        response.config?.method?.toUpperCase(),

      url:
        response.config?.url,

      status:
        response.status,

      duration,

      correlationId,

      timestamp:
        completedAt,
    }
  );

  /* Development Logging */

  if (
    import.meta.env.DEV
  ) {
    console.debug(
      "[API RESPONSE]",
      {
        status:
          response.status,

        url:
          response.config?.url,

        duration:

          duration !== null
            ? `${duration}ms`
            : "unknown",

        correlationId,
      }
    );
  }

  return response;
};

/* =========================================================
   Response Error Interceptor
========================================================= */

const responseErrorInterceptor = (
  error
) => {
  const response =
    error.response;

  const config =
    error.config;

  const metadata =
    config?.metadata ||
    {};

  const status =
    response?.status;

  const correlationId =
    metadata.correlationId;

  const completedAt =
    Date.now();

  const duration =
    metadata.requestStartedAt
      ? completedAt -
        metadata.requestStartedAt
      : null;

  /* =======================================================
     Request Cancelled
  ======================================================= */

  if (
    error.name ===
    "CanceledError"
  ) {
    dispatchBrowserEvent(
      API_EVENTS.REQUEST_FAILED,
      {
        type:
          "cancelled",

        url:
          config?.url,

        correlationId,

        duration,
      }
    );

    return Promise.reject(
      normalizeInterceptorError(
        error
      )
    );
  }

  /* =======================================================
     Unauthorized
  ======================================================= */

  if (
    status === 401
  ) {
    handleUnauthorized(
      error
    );
  }

  /* =======================================================
     Forbidden
  ======================================================= */

  if (
    status === 403
  ) {
    handleForbidden(
      error
    );
  }

  /* =======================================================
     Rate Limited
  ======================================================= */

  if (
    status === 429
  ) {
    handleRateLimit(
      error
    );
  }

  /* =======================================================
     Server Error
  ======================================================= */

  if (
    status >= 500
  ) {
    handleServerError(
      error
    );
  }

  /* =======================================================
     Network Error
  ======================================================= */

  if (
    !response
  ) {
    handleNetworkError(
      error
    );
  }

  /* =======================================================
     Observability
  ======================================================= */

  dispatchBrowserEvent(
    API_EVENTS.REQUEST_FAILED,
    {
      type:
        getErrorType(
          error
        ),

      status,

      url:
        config?.url,

      method:
        config?.method?.toUpperCase(),

      correlationId,

      duration,

      timestamp:
        completedAt,
    }
  );

  /* Development Logging */

  if (
    import.meta.env.DEV
  ) {
    console.error(
      "[API ERROR]",
      {
        status,

        url:
          config?.url,

        method:
          config?.method?.toUpperCase(),

        correlationId,

        duration,

        error,
      }
    );
  }

  return Promise.reject(
    normalizeInterceptorError(
      error
    )
  );
};

/* =========================================================
   Unauthorized Handler
========================================================= */

const handleUnauthorized = (
  error
) => {
  const correlationId =
    error.config?.metadata
      ?.correlationId;

  try {
    localStorage.removeItem(
      "access_token"
    );

    sessionStorage.removeItem(
      "access_token"
    );
  } catch (
    storageError
  ) {
    console.error(
      "Unable to clear authentication storage:",
      storageError
    );
  }

  dispatchBrowserEvent(
    AUTH_EVENTS.UNAUTHORIZED,
    {
      correlationId,

      status: 401,
    }
  );

  dispatchBrowserEvent(
    AUTH_EVENTS.SESSION_EXPIRED,
    {
      correlationId,
    }
  );
};

/* =========================================================
   Forbidden Handler
========================================================= */

const handleForbidden = (
  error
) => {
  const correlationId =
    error.config?.metadata
      ?.correlationId;

  dispatchBrowserEvent(
    AUTH_EVENTS.FORBIDDEN,
    {
      correlationId,

      status: 403,
    }
  );
};

/* =========================================================
   Rate Limit Handler
========================================================= */

const handleRateLimit = (
  error
) => {
  const retryAfter =
    error.response?.headers?.[
      "retry-after"
    ];

  dispatchBrowserEvent(
    "api:rate-limited",
    {
      retryAfter:
        retryAfter || null,

      status: 429,

      correlationId:
        error.config?.metadata
          ?.correlationId,
    }
  );
};

/* =========================================================
   Server Error Handler
========================================================= */

const handleServerError = (
  error
) => {
  const correlationId =
    error.config?.metadata
      ?.correlationId;

  dispatchBrowserEvent(
    "api:server-error",
    {
      status:
        error.response
          ?.status,

      correlationId,

      endpoint:
        error.config?.url,
    }
  );
};

/* =========================================================
   Network Error Handler
========================================================= */

const handleNetworkError = (
  error
) => {
  dispatchBrowserEvent(
    "api:network-error",
    {
      message:
        error.message,

      endpoint:
        error.config?.url,

      correlationId:
        error.config
          ?.metadata
          ?.correlationId,
    }
  );
};

/* =========================================================
   Error Type Detection
========================================================= */

const getErrorType = (
  error
) => {
  if (
    error.name ===
    "CanceledError"
  ) {
    return "cancelled";
  }

  if (
    !error.response
  ) {
    return "network";
  }

  if (
    error.response.status ===
    401
  ) {
    return "unauthorized";
  }

  if (
    error.response.status ===
    403
  ) {
    return "forbidden";
  }

  if (
    error.response.status ===
    429
  ) {
    return "rate_limited";
  }

  if (
    error.response.status >=
    500
  ) {
    return "server";
  }

  if (
    error.response.status >=
    400
  ) {
    return "client";
  }

  return "unknown";
};

/* =========================================================
   Error Normalization
========================================================= */

const normalizeInterceptorError = (
  error
) => {
  const response =
    error.response;

  const data =
    response?.data;

  const status =
    response?.status;

  const correlationId =
    error.config?.metadata
      ?.correlationId;

  return {
    ...error,

    code:
      data?.code ||
      error.code ||
      `HTTP_${status || "UNKNOWN"}`,

    status:

      status || null,

    message:
      data?.message ||
      getDefaultErrorMessage(
        status
      ),

    details:
      data?.details ||
      null,

    correlationId,

    errorType:
      getErrorType(
        error
      ),
  };
};

/* =========================================================
   Default Error Messages
========================================================= */

const getDefaultErrorMessage = (
  status
) => {
  const messages = {
    400:
      "The request was invalid.",

    401:
      "Your session has expired. Please sign in again.",

    403:
      "You do not have permission to perform this action.",

    404:
      "The requested resource was not found.",

    409:
      "The request conflicts with existing data.",

    422:
      "The submitted data is invalid.",

    429:
      "Too many requests. Please try again later.",

    500:
      "An unexpected server error occurred.",

    502:
      "The server is temporarily unavailable.",

    503:
      "The service is currently unavailable.",

    504:
      "The server request timed out.",
  };

  return (
    messages[status] ||
    "An unexpected error occurred."
  );
};

/* =========================================================
   Axios Interceptor Registration
========================================================= */

const attachInterceptors = (
  axiosInstance
) => {
  if (
    !axiosInstance
  ) {
    throw new Error(
      "Axios instance is required to attach interceptors."
    );
  }

  const requestInterceptorId =
    axiosInstance.interceptors.request.use(
      requestInterceptor,
      requestErrorInterceptor
    );

  const responseInterceptorId =
    axiosInstance.interceptors.response.use(
      responseInterceptor,
      responseErrorInterceptor
    );

  return {
    requestInterceptorId,

    responseInterceptorId,
  };
};

/* =========================================================
   Axios Interceptor Cleanup
========================================================= */

const detachInterceptors = (
  axiosInstance,
  interceptorIds
) => {
  if (
    !axiosInstance ||
    !interceptorIds
  ) {
    return;
  }

  const {
    requestInterceptorId,

    responseInterceptorId,
  } = interceptorIds;

  if (
    requestInterceptorId !==
    undefined
  ) {
    axiosInstance.interceptors.request.eject(
      requestInterceptorId
    );
  }

  if (
    responseInterceptorId !==
    undefined
  ) {
    axiosInstance.interceptors.response.eject(
      responseInterceptorId
    );
  }
};

/* =========================================================
   Exports
========================================================= */

export {
  AUTH_EVENTS,

  API_EVENTS,

  generateCorrelationId,

  requestInterceptor,

  requestErrorInterceptor,

  responseInterceptor,

  responseErrorInterceptor,

  attachInterceptors,

  detachInterceptors,

  normalizeInterceptorError,
};

export default {
  AUTH_EVENTS,

  API_EVENTS,

  requestInterceptor,

  responseInterceptor,

  attachInterceptors,

  detachInterceptors,
};