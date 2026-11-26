import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    console.error(
      "Application Error:",
      error
    );

    console.error(
      "Error Details:",
      errorInfo
    );

    this.setState({
      error,
      errorInfo,
    });

    // In production, you can send this error
    // to your monitoring service.
    //
    // Example:
    // errorTrackingService.captureException(
    //   error,
    //   { errorInfo }
    // );
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={styles.container}>
          <div style={styles.card}>
            <div style={styles.icon}>
              !
            </div>

            <h1 style={styles.title}>
              Something went wrong
            </h1>

            <p style={styles.message}>
              An unexpected error occurred while
              loading this page. Please try again.
            </p>

            <div style={styles.actions}>
              <button
                type="button"
                onClick={this.handleReload}
                style={styles.primaryButton}
              >
                Try Again
              </button>

              <button
                type="button"
                onClick={this.handleGoHome}
                style={styles.secondaryButton}
              >
                Go to Dashboard
              </button>
            </div>

            {process.env.NODE_ENV === "development" &&
              this.state.error && (
                <details style={styles.details}>
                  <summary style={styles.summary}>
                    Developer Error Details
                  </summary>

                  <pre style={styles.errorText}>
                    {this.state.error.toString()}
                  </pre>

                  {this.state.errorInfo && (
                    <pre style={styles.errorText}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </details>
              )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    backgroundColor: "#f8fafc",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  },

  card: {
    width: "100%",
    maxWidth: "520px",
    padding: "40px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    textAlign: "center",
    boxShadow:
      "0 10px 30px rgba(15, 23, 42, 0.08)",
  },

  icon: {
    width: "64px",
    height: "64px",
    margin: "0 auto 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "50%",
    backgroundColor: "#fef2f2",
    color: "#dc2626",
    fontSize: "32px",
    fontWeight: 700,
  },

  title: {
    margin: 0,
    color: "#0f172a",
    fontSize: "24px",
    fontWeight: 700,
  },

  message: {
    marginTop: "12px",
    color: "#64748b",
    fontSize: "15px",
    lineHeight: 1.6,
  },

  actions: {
    display: "flex",
    justifyContent: "center",
    gap: "12px",
    marginTop: "28px",
    flexWrap: "wrap",
  },

  primaryButton: {
    padding: "11px 18px",
    border: "none",
    borderRadius: "8px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },

  secondaryButton: {
    padding: "11px 18px",
    border: "1px solid #cbd5e1",
    borderRadius: "8px",
    backgroundColor: "#ffffff",
    color: "#334155",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },

  details: {
    marginTop: "28px",
    padding: "16px",
    textAlign: "left",
    backgroundColor: "#f8fafc",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
  },

  summary: {
    cursor: "pointer",
    color: "#475569",
    fontSize: "13px",
    fontWeight: 600,
  },

  errorText: {
    marginTop: "12px",
    padding: "12px",
    overflowX: "auto",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    color: "#b91c1c",
    backgroundColor: "#fef2f2",
    borderRadius: "6px",
    fontSize: "12px",
    lineHeight: 1.5,
  },
};

export default ErrorBoundary;