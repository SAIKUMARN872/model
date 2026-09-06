"use client";

import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      error: null,
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
      "Error Boundary:",
      error,
      errorInfo
    );
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "300px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
            textAlign: "center",
            backgroundColor: "#f8fafc",
          }}
        >
          <h2
            style={{
              color: "#991b1b",
              marginBottom: "10px",
            }}
          >
            Something went wrong
          </h2>

          <p
            style={{
              color: "#64748b",
              maxWidth: "500px",
            }}
          >
            An unexpected error occurred
            while loading this section.
          </p>

          {this.state.error?.message && (
            <p
              style={{
                color: "#b91c1c",
                fontSize: "14px",
              }}
            >
              {this.state.error.message}
            </p>
          )}

          <button
            type="button"
            onClick={this.handleRetry}
            style={{
              marginTop: "16px",
              padding: "10px 20px",
              border: "none",
              borderRadius: "6px",
              backgroundColor: "#2563eb",
              color: "#ffffff",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}