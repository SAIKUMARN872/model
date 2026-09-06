"use client";

import React from "react";

/**
 * Enterprise React Error Boundary
 *
 * Responsibilities:
 * - Catch React rendering errors
 * - Prevent the entire application from crashing
 * - Display a user-friendly fallback UI
 * - Provide retry / recovery functionality
 * - Support custom fallback rendering
 * - Support external error logging
 *
 * Usage:
 *
 * <ErrorBoundary>
 *   <YourApplication />
 * </ErrorBoundary>
 *
 * Or:
 *
 * <ErrorBoundary
 *   onError={(error, errorInfo) => {
 *     console.error(error);
 *   }}
 * >
 *   <Dashboard />
 * </ErrorBoundary>
 */

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  /**
   * Update state when a child component
   * throws an error during rendering.
   */
  static getDerivedStateFromError(
    error
  ) {
    return {
      hasError: true,
      error,
    };
  }

  /**
   * Capture detailed error information.
   */
  componentDidCatch(
    error,
    errorInfo
  ) {
    this.setState({
      error,
      errorInfo,
    });

    /**
     * Development logging.
     */
    if (
      process.env.NODE_ENV !==
      "production"
    ) {
      console.error(
        "ErrorBoundary caught an error:",
        error
      );

      console.error(
        "Component stack:",
        errorInfo?.componentStack
      );
    }

    /**
     * Optional enterprise error
     * monitoring integration.
     *
     * Example:
     *
     * Sentry.captureException(
     *   error,
     *   {
     *     extra: {
     *       componentStack:
     *         errorInfo?.componentStack,
     *     },
     *   }
     * );
     */
    if (
      typeof this.props.onError ===
      "function"
    ) {
      try {
        this.props.onError(
          error,
          errorInfo
        );
      } catch (
        loggingError
      ) {
        console.error(
          "Error logging failed:",
          loggingError
        );
      }
    }
  }

  /**
   * Reset the error boundary.
   */
  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    /**
     * Optional callback after
     * recovery.
     */
    if (
      typeof this.props.onReset ===
      "function"
    ) {
      try {
        this.props.onReset();
      } catch (resetError) {
        console.error(
          "ErrorBoundary reset callback failed:",
          resetError
        );
      }
    }
  };

  /**
   * Reload the current application.
   */
  handleReload = () => {
    if (
      typeof window !==
      "undefined"
    ) {
      window.location.reload();
    }
  };

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
        error: this.state.error,
        errorInfo:
          this.state.errorInfo,
        reset:
          this.handleRetry,
      });
    }

    return fallback;
  }

  /**
   * Render default fallback.
   */
  renderDefaultFallback() {
    const {
      error,
    } = this.state;

    const {
      title = "Something went wrong",
      message =
        "An unexpected error occurred while loading this section.",
      showDetails = false,
    } = this.props;

    return (
      <div
        className="error-boundary"
        role="alert"
        aria-live="assertive"
      >
        <div className="error-boundary-card">
          {/* Error Icon */}
          <div
            className="error-boundary-icon"
            aria-hidden="true"
          >
            !
          </div>

          {/* Error Heading */}
          <h1 className="error-boundary-title">
            {title}
          </h1>

          {/* Error Message */}
          <p className="error-boundary-message">
            {message}
          </p>

          {/* Actions */}
          <div className="error-boundary-actions">
            <button
              type="button"
              onClick={
                this.handleRetry
              }
              className="error-boundary-button error-boundary-button--primary"
            >
              Try Again
            </button>

            <button
              type="button"
              onClick={
                this.handleReload
              }
              className="error-boundary-button error-boundary-button--secondary"
            >
              Reload Page
            </button>
          </div>

          {/* Optional Error Details */}
          {showDetails &&
            error && (
              <details className="error-boundary-details">
                <summary>
                  Technical Details
                </summary>

                <pre>
                  {error?.message ||
                    "Unknown error"}
                </pre>

                {error?.stack && (
                  <pre>
                    {error.stack}
                  </pre>
                )}
              </details>
            )}
        </div>
      </div>
    );
  }

  render() {
    const {
      hasError,
    } = this.state;

    const {
      children,
      fallback,
    } = this.props;

    /**
     * If an error occurred,
     * display fallback UI.
     */
    if (hasError) {
      if (fallback) {
        return this.renderCustomFallback();
      }

      return this.renderDefaultFallback();
    }

    /**
     * Render children normally.
     */
    return children;
  }
}

export default ErrorBoundary;