import React, { useState } from "react";

export default function TestRunner({
  tests = [],
}) {
  const defaultTests = [
    {
      id: 1,
      name: "Basic Model Test",
      description:
        "Tests the basic response of an AI model.",
    },
    {
      id: 2,
      name: "Response Quality Test",
      description:
        "Evaluates the quality of model responses.",
    },
    {
      id: 3,
      name: "Performance Test",
      description:
        "Checks model performance and reliability.",
    },
  ];

  const testList =
    tests.length > 0
      ? tests
      : defaultTests;

  const [runningTest, setRunningTest] =
    useState(null);

  const [results, setResults] =
    useState({});

  const runTest = async (test) => {
    setRunningTest(test.id);

    await new Promise((resolve) =>
      setTimeout(resolve, 1000)
    );

    setResults((previous) => ({
      ...previous,
      [test.id]: "Passed",
    }));

    setRunningTest(null);
  };

  return (
    <div
      style={{
        width: "100%",
        padding: "20px",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border:
          "1px solid #e2e8f0",
      }}
    >
      <h2>Test Runner</h2>

      <p
        style={{
          color: "#64748b",
        }}
      >
        Run tests to evaluate your AI
        models.
      </p>

      <div
        style={{
          display: "grid",
          gap: "16px",
          marginTop: "20px",
        }}
      >
        {testList.map((test) => (
          <div
            key={test.id}
            style={{
              padding: "16px",
              border:
                "1px solid #e2e8f0",
              borderRadius: "8px",
            }}
          >
            <h3>{test.name}</h3>

            <p>{test.description}</p>

            {results[test.id] && (
              <p
                style={{
                  fontWeight: 600,
                }}
              >
                Result: {results[test.id]}
              </p>
            )}

            <button
              type="button"
              onClick={() =>
                runTest(test)
              }
              disabled={
                runningTest === test.id
              }
              style={{
                padding: "10px 16px",
                border: "none",
                borderRadius: "6px",
                backgroundColor:
                  runningTest === test.id
                    ? "#94a3b8"
                    : "#2563eb",
                color: "#ffffff",
                cursor:
                  runningTest === test.id
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {runningTest === test.id
                ? "Running..."
                : "Run Test"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}