import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { failed: false, retryCount: 0 };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error, info) {
    if (typeof this.props.onError === "function") {
      try {
        this.props.onError(error, info);
      } catch {
        // A reporting callback must not break the fallback UI.
      }
    }
  }

  render() {
    if (!this.state.failed) {
      return <React.Fragment key={this.state.retryCount}>{this.props.children}</React.Fragment>;
    }

    const title = typeof this.props.title === "string" && this.props.title.trim()
      ? this.props.title
      : "This section is unavailable";
    const message = typeof this.props.message === "string" && this.props.message.trim()
      ? this.props.message
      : "An unexpected rendering error occurred.";

    return <section role="alert" style={{ padding: 16, border: "1px solid var(--line, #374151)", borderRadius: 10 }}>
      <h3>{title}</h3>
      <p>{message}</p>
      <button
        type="button"
        onClick={() => this.setState(state => ({
          failed: false,
          retryCount: state.retryCount + 1
        }))}
      >Try again</button>
    </section>;
  }
}