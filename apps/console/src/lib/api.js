import { consoleConfig } from "../config/console.js";
import { getAuthorizationHeader } from "../auth/tokens.jsx";

export class ApiError extends Error {
  constructor(message, { status = 0, code = "API_ERROR", details = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

function resolveUrl(path) {
  if (typeof path !== "string" || !path.startsWith("/") || path.startsWith("//")) {
    throw new ApiError("An API request must use a same-origin absolute path.", {
      code: "INVALID_API_PATH"
    });
  }

  return `${consoleConfig.apiBaseUrl}${path}`;
}

async function request(path, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    consoleConfig.requestTimeoutMs
  );

  try {
    const response = await fetch(resolveUrl(path), {
      method: options.method || "GET",
      credentials: "include",
      cache: "no-store",
      redirect: "error",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(getAuthorizationHeader()
          ? { Authorization: getAuthorizationHeader() }
          : {}),
        ...options.headers
      },
      ...(options.body ? { body: JSON.stringify(options.body) } : {})
    });

    if (response.status === 204) {
      if (!response.ok) {
        throw new ApiError("The API request was rejected.", {
          status: response.status
        });
      }
      return null;
    }

    const contentType = response.headers.get("content-type") || "";
    let payload = null;

    if (contentType.includes("application/json")) {
      try {
        payload = await response.json();
      } catch {
        throw new ApiError("The API returned invalid JSON.", {
          status: response.status,
          code: "INVALID_RESPONSE"
        });
      }
    } else {
      const text = await response.text();
      payload = text ? { message: text.slice(0, 500) } : null;
    }

    if (!response.ok) {
      const message =
        payload && typeof payload.message === "string"
          ? payload.message
          : response.status === 401
            ? "Authentication is required. Sign in through the configured identity provider."
            : response.status === 403
              ? "You do not have permission to perform this operation."
              : response.status === 404
                ? "The requested API endpoint was not found."
                : `The API request failed with status ${response.status}.`;

      throw new ApiError(message, {
        status: response.status,
        code: payload?.code || "HTTP_ERROR",
        details: payload
      });
    }

    return payload;
  } catch (error) {
    if (error instanceof ApiError) throw error;

    if (error?.name === "AbortError") {
      throw new ApiError("The API request timed out.", { code: "TIMEOUT" });
    }

    if (error instanceof TypeError) {
      throw new ApiError(
        "The API could not be reached. Check the API origin, network, and CORS configuration.",
        { code: "NETWORK_ERROR" }
      );
    }

    throw new ApiError("An unexpected API error occurred.", {
      code: "UNEXPECTED_ERROR"
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export const api = Object.freeze({
  get: (path, options = {}) => request(path, { ...options, method: "GET" }),
  post: (path, body, options = {}) =>
    request(path, { ...options, method: "POST", body }),
  put: (path, body, options = {}) =>
    request(path, { ...options, method: "PUT", body }),
  patch: (path, body, options = {}) =>
    request(path, { ...options, method: "PATCH", body }),
  delete: (path, options = {}) => request(path, { ...options, method: "DELETE" })
});