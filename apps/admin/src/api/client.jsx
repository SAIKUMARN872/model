import axios from "axios";

/**
 * Enterprise API Client
 *
 * Responsibilities:
 * - Centralized HTTP communication
 * - Base URL management
 * - Authentication token handling
 * - Request correlation IDs
 * - Timeout protection
 * - Standardized error handling
 * - Request cancellation
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "/api";

const API_TIMEOUT = 30000;

/* =========================================================
   Axios Instance
========================================================= */

const apiClient = axios.create({
  baseURL: API_BASE_URL,

  timeout: API_TIMEOUT,

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* =========================================================
   Authentication
========================================================= */

const getAccessToken = () => {
  try {
    return (
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("access_token")
    );
  } catch (error) {
    console.error(
      "Unable to access authentication storage:",
      error
    );

    return null;
  }
};

/* =========================================================
   Correlation ID
========================================================= */

const generateCorrelationId = () => {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  return `req_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 10)}`;
};

/* =========================================================
   Request Interceptor
========================================================= */

apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();

    const correlationId =
      generateCorrelationId();

    config.headers = config.headers || {};

    config.headers["X-Correlation-ID"] =
      correlationId;

    config.headers["X-Client-Version"] =
      import.meta.env.VITE_APP_VERSION ||
      "1.0.0";

    if (token) {
      config.headers.Authorization =
        `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.debug("[API Request]", {
        method:
          config.method?.toUpperCase(),

        url: config.url,

        correlationId,
      });
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);

/* =========================================================
   Response Interceptor
========================================================= */

apiClient.interceptors.response.use(
  (response) => {
    if (import.meta.env.DEV) {
      console.debug("[API Response]", {
        status: response.status,

        url: response.config?.url,

        correlationId:
          response.config?.headers?.[
            "X-Correlation-ID"
          ],
      });
    }

    return response;
  },

  async (error) => {
    const status =
      error.response?.status;

    const responseData =
      error.response?.data;

    const correlationId =
      error.config?.headers?.[
        "X-Correlation-ID"
      ];

    /* =====================================================
       401 - Unauthorized
    ===================================================== */

    if (status === 401) {
      try {
        localStorage.removeItem(
          "access_token"
        );

        sessionStorage.removeItem(
          "access_token"
        );
      } catch (storageError) {
        console.error(
          "Unable to clear authentication storage:",
          storageError
        );
      }

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(
            "auth:unauthorized",
            {
              detail: {
                correlationId,
              },
            }
          )
        );
      }
    }

    /* =====================================================
       403 - Forbidden
    ===================================================== */

    if (status === 403) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent(
            "auth:forbidden",
            {
              detail: {
                correlationId,
              },
            }
          )
        );
      }
    }

    /* =====================================================
       5xx - Server Errors
    ===================================================== */

    if (status >= 500) {
      console.error(
        "Enterprise API Server Error",
        {
          status,

          correlationId,

          endpoint:
            error.config?.url,
        }
      );
    }

    return Promise.reject(
      normalizeApiError(error)
    );
  }
);

/* =========================================================
   API Error Normalization
========================================================= */

const normalizeApiError = (
  error
) => {
  /* Request Cancelled */

  if (
    error?.name ===
    "CanceledError"
  ) {
    return {
      ...error,

      code:
        "REQUEST_CANCELLED",

      message:
        "The request was cancelled.",
    };
  }

  /* Request Timeout */

  if (
    error?.code ===
    "ECONNABORTED"
  ) {
    return {
      ...error,

      code:
        "REQUEST_TIMEOUT",

      message:
        "The request timed out. Please try again.",
    };
  }

  /* Network Error */

  if (!error.response) {
    return {
      ...error,

      code:
        "NETWORK_ERROR",

      message:
        "Unable to connect to the server.",
    };
  }

  /* HTTP Error */

  const status =
    error.response.status;

  const data =
    error.response.data;

  return {
    ...error,

    code:
      data?.code ||
      `HTTP_${status}`,

    status,

    message:
      data?.message ||
      getDefaultErrorMessage(
        status
      ),

    details:
      data?.details ||
      null,
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
      "Authentication is required.",

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
   HTTP Methods
========================================================= */

const get = (
  url,
  config = {}
) => {
  return apiClient.get(
    url,
    config
  );
};

const post = (
  url,
  data = {},
  config = {}
) => {
  return apiClient.post(
    url,
    data,
    config
  );
};

const put = (
  url,
  data = {},
  config = {}
) => {
  return apiClient.put(
    url,
    data,
    config
  );
};

const patch = (
  url,
  data = {},
  config = {}
) => {
  return apiClient.patch(
    url,
    data,
    config
  );
};

const remove = (
  url,
  config = {}
) => {
  return apiClient.delete(
    url,
    config
  );
};

/* =========================================================
   Request Cancellation
========================================================= */

const createCancelController =
  () => {
    return new AbortController();
  };

/* =========================================================
   Public API
========================================================= */

const api = {
  get,

  post,

  put,

  patch,

  delete: remove,

  createCancelController,
};

/* =========================================================
   Named Exports
========================================================= */

export {
  apiClient,

  getAccessToken,

  createCancelController,
};

/* =========================================================
   Default Export
========================================================= */

export default api;