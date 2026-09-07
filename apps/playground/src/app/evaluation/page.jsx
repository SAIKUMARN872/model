export default function EvaluationPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px",
        backgroundColor: "#f8fafc",
        color: "#0f172a",
      }}
    >
      <h1>Evaluation</h1>

      <p>
        Evaluate AI models and review
        their performance.
      </p>

      <section
        style={{
          marginTop: "24px",
          padding: "24px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          border:
            "1px solid #e2e8f0",
        }}
      >
        <h2>Model Evaluation</h2>

        <div
          style={{
            marginTop: "16px",
            display: "grid",
            gap: "16px",
          }}
        >
          <div
            style={{
              padding: "16px",
              border:
                "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          >
            <h3>Accuracy</h3>
            <p>
              Measure the accuracy of
              model responses.
            </p>
          </div>

          <div
            style={{
              padding: "16px",
              border:
                "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          >
            <h3>Response Quality</h3>
            <p>
              Review the quality and
              relevance of responses.
            </p>
          </div>

          <div
            style={{
              padding: "16px",
              border:
                "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          >
            <h3>Performance Score</h3>
            <p>
              Track overall model
              performance.
            </p>
          </div>
        </div>

        <button
          type="button"
          style={{
            marginTop: "24px",
            padding: "10px 20px",
            border: "none",
            borderRadius: "6px",
            backgroundColor: "#2563eb",
            color: "#ffffff",
            cursor: "pointer",
          }}
        >
          Start Evaluation
        </button>
      </section>
    </main>
  );
}