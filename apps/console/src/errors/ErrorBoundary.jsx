"use client";

import React from "react";

/**
 * Enterprise React Error Boundary
 *
 * Responsibilities:
 * - Catch unexpected React rendering errors
 * - Prevent complete application crashes
 * - Display a safe fallback UI
 * - Generate an error correlation ID
 * - Log diagnostic information
 * - Support retry / recovery
 * - Support optional custom fallback UI
 * - Support optional error callback
 */

/**
 * Generate a unique error ID.
 *
 * Uses crypto.randomUUID when available
 * and falls back to a timestamp-based ID.
 */
const generateErrorId = () => {
  try {
    if (
      typeof crypto !==
        "undefined" &&
      typeof crypto.randomUUID ===
        "function"
    ) {
      return crypto.randomUUID();
    }
  } catch {
    // Fall through to fallback implementation.
  }

  return `err_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 10)}`;
};

/**
 * Safely convert an error
 * into a serializable structure.
 */
const serializeError = (
  error
) => {
  if (!error) {
    return {
      name: "UnknownError",
      message:
        "An unknown error occurred.",
      stack: null,
    };
  }

  return {
    name:
      error.name ||
      "Error",

    message:
      error.message ||
      "Unknown error",

    stack:
      error.stack ||
      null,
  };
};

/**
 * Enterprise Error Boundary.
 */
class ErrorBoundary extends React.Component {
  constructor(
    props
  ) {
    super(props);

    this.state = {
      hasError: false,

      error: null,

      errorInfo: null,

      errorId: null,
    };

    this.handleRetry =
      this.handleRetry.bind(
        this
      );

    this.handleReload =
      this.handleReload.bind(
        this
      );
  }

  /**
   * React lifecycle method.
   *
   * Updates state before rendering
   * the fallback UI.
   */
  static getDerivedStateFromError(
    error
  ) {
    return {
      hasError: true,

      error,

      errorId:
        generateErrorId(),
    };
  }

  /**
   * React lifecycle method.
   *
   * Used for logging errors and
   * sending diagnostics to an
   * observability platform.
   */
  componentDidCatch(
    error,
    errorInfo
  ) {
    const errorId =
      this.state.errorId ||
      generateErrorId();

    const serializedError =
      serializeError(
        error
      );

    const errorPayload = {
      errorId,

      ...serializedError,

      componentStack:
        errorInfo
          ?.componentStack ||
        null,

      timestamp:
        new Date().toISOString(),

      url:
        typeof window !==
        "undefined"
          ? window.location.href
          : null,

      userAgent:
        typeof navigator !==
        "undefined"
          ? navigator.userAgent
          : null,
    };

    /**
     * Log to browser console
     * during development.
     */
    if (
      process.env.NODE_ENV !==
      "production"
    ) {
      console.error(
        "[ErrorBoundary] React rendering error:",
        errorPayload
      );
    }

    /**
     * Call optional external
     * error handler.
     *
     * This can be connected to:
     * - Sentry
     * - Datadog
     * - New Relic
     * - OpenTelemetry
     * - Internal observability API
     */
    if (
      typeof this.props
        .onError ===
      "function"
    ) {
      try {
        this.props.onError(
          error,
          errorInfo,
          errorPayload
        );
      } catch (
        callbackError
      ) {
        if (
          process.env.NODE_ENV !==
          "production"
        ) {
          console.error(
            "[ErrorBoundary] Error callback failed:",
            callbackError
          );
        }
      }
    }
  }

  /**
   * Reset the boundary state.
   *
   * Useful for retrying the failed
   * React component tree.
   */
  handleRetry() {
    this.setState({
      hasError: false,

      error: null,

      errorInfo: null,

      errorId: null,
    });

    /**
     * Optional callback when
     * recovery is attempted.
     */
    if (
      typeof this.props
        .onReset ===
      "function"
    ) {
      try {
        this.props.onReset();
      } catch (
        resetError
      ) {
        if (
          process.env.NODE_ENV !==
          "production"
        ) {
          console.error(
            "[ErrorBoundary] Reset callback failed:",
            resetError
          );
        }
      }
    }
  }

  /**
   * Reload the current page.
   */
  handleReload() {
    if (
      typeof window !==
      "undefined"
    ) {
      window.location.reload();
    }
  }

  /**
   * Render custom fallback.
   */
  renderCustomFallback() {
    const {
      fallback,
    } = this.props;

    if (
      typeof fallback ===
      "function"
    ) {
      return fallback({
        error:
          this.state.error,

        errorId:
          this.state.errorId,

        retry:
          this.handleRetry,

        reload:
          this.handleReload,
      });
    }

    return fallback;
  }

  /**
   * Render default fallback UI.
   */
  renderDefaultFallback() {
    const {
      showDetails = false,
      title = "Something went wrong",
      message =
        "An unexpected error occurred while displaying this page.",
    } = this.props;

    const {
      error,
      errorId,
    } = this.state;

    return (
      <main
        role="alert"
        style={{
          minHeight:
            "100vh",

          display:
            "flex",

          alignItems:
            "center",

          justifyContent:
            "center",

          padding:
            "2rem",

          background:
            "#f8fafc",

          fontFamily:
            "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        }}
      >
        <section
          style={{
            width:
              "100%",

            maxWidth:
              "560px",

            padding:
              "2rem",

            background:
              "#ffffff",

            border:
              "1px solid #e2e8f0",

            borderRadius:
              "12px",

            boxShadow:
              "0 10px 30px rgba(15, 23, 42, 0.08)",
          }}
        >
          <div
            style={{
              marginBottom:
                "1.5rem",
            }}
          >
            <div
              style={{
                width:
                  "48px",

                height:
                  "48px",

                display:
                  "flex",

                alignItems:
                  "center",

                justifyContent:
                  "center",

                marginBottom:
                  "1rem",

                borderRadius:
                  "50%",

                background:
                  "#fee2e2",

                color:
                  "#b91c1c",

                fontSize:
                  "24px",

                fontWeight:
                  "700",
              }}
            >
              !
            </div>

            <h1
              style={{
                margin:
                  "0 0 0.5rem",

                fontSize:
                  "1.5rem",

                fontWeight:
                  "700",

                color:
                  "#0f172a",
              }}
            >
              {title}
            </h1>

            <p
              style={{
                margin:
                  "0",

                lineHeight:
                  "1.6",

                color:
                  "#475569",
              }}
            >
              {message}
            </p>
          </div>

          {errorId && (
            <div
              style={{
                marginBottom:
                  "1.5rem",

                padding:
                  "0.75rem",

                borderRadius:
                  "8px",

                background:
                  "#f8fafc",

                border:
                  "1px solid #e2e8f0",

                fontSize:
                  "0.875rem",

                color:
                  "#64748b",
              }}
            >
              <strong>
                Error ID:
              </strong>{" "}
              {errorId}
            </div>
          )}

          {showDetails &&
            error && (
              <details
                style={{
                  marginBottom:
                    "1.5rem",
                }}
              >
                <summary
                  style={{
                    cursor:
                      "pointer",

                    color:
                      "#334155",

                    fontWeight:
                      "600",
                  }}
                >
                  Technical details
                </summary>

                <pre
                  style={{
                    marginTop:
                      "1rem",

                    padding:
                      "1rem",

                    overflowX:
                      "auto",

                    borderRadius:
                      "8px",

                    background:
                      "#0f172a",

                    color:
                      "#e2e8f0",

                    fontSize:
                      "0.75rem",

                    lineHeight:
                      "1.5",

                    whiteSpace:
                      "pre-wrap",

                    wordBreak:
                      "break-word",
                  }}
                >
                  {serializeError(
                    error
                  ).message}
                </pre>
              </details>
            )}

          <div
            style={{
              display:
                "flex",

              gap:
                "0.75rem",

              flexWrap:
                "wrap",
            }}
          >
            <button
              type="button"
              onClick={
                this.handleRetry
              }
              style={{
                padding:
                  "0.75rem 1.25rem",

                border:
                  "none",

                borderRadius:
                  "8px",

                background:
                  "#2563eb",

                color:
                  "#ffffff",

                fontWeight:
                  "600",

                cursor:
                  "pointer",
              }}
            >
              Try again
            </button>

            <button
              type="button"
              onClick={
                this.handleReload
              }
              style={{
                padding:
                  "0.75rem 1.25rem",

                border:
                  "1px solid #cbd5e1",

                borderRadius:
                  "8px",

                background:
                  "#ffffff",

                color:
                  "#334155",

                fontWeight:
                  "600",

                cursor:
                  "pointer",
              }}
            >
              Reload page
            </button>
          </div>
        </section>
      </main>
    );
  }

  render() {
    if (
      !this.state.hasError
    ) {
      return this.props
        .children;
    }

    /**
     * Use custom fallback
     * when provided.
     */
    if (
      this.props.fallback
    ) {
      return this.renderCustomFallback();
    }

    /**
     * Otherwise use the
     * enterprise default UI.
     */
    return this.renderDefaultFallback();
  }
}

/**
 * Default props.
 */
ErrorBoundary.defaultProps = {
  children: null,

  fallback: null,

  onError: null,

  onReset: null,

  showDetails:
    process.env.NODE_ENV !==
    "production",

  title:
    "Something went wrong",

  message:
    "An unexpected error occurred while displaying this page.",
};

export default ErrorBoundary;