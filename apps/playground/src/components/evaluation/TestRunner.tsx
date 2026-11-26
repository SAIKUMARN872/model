import React, { useState } from "react";
import {
  Play,
  LoaderCircle,
  CheckCircle2,
  XCircle,
  FlaskConical,
  Clock3,
} from "lucide-react";

interface Test {
  id: string | number;
  name: string;
  description: string;
}

interface TestRunnerProps {
  tests?: Test[];
}

type TestStatus = "Passed" | "Failed";

const defaultTests: Test[] = [
  {
    id: 1,
    name: "Basic Model Test",
    description: "Tests the basic response of an AI model.",
  },
  {
    id: 2,
    name: "Response Quality Test",
    description: "Evaluates the quality and relevance of model responses.",
  },
  {
    id: 3,
    name: "Performance Test",
    description: "Checks model performance and reliability.",
  },
];

export default function TestRunner({
  tests = [],
}: TestRunnerProps) {
  const testList: Test[] =
    tests.length > 0 ? tests : defaultTests;

  const [runningTest, setRunningTest] = useState<
    string | number | null
  >(null);

  const [results, setResults] = useState<
    Record<string, TestStatus>
  >({});

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  const runTest = async (test: Test): Promise<void> => {
    if (runningTest !== null) return;

    const testId = String(test.id);

    setRunningTest(test.id);

    setErrors((previous) => ({
      ...previous,
      [testId]: "",
    }));

    try {
      // Temporary frontend simulation.
      // Replace with the evaluation API when backend integration is ready.
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 1200);
      });

      setResults((previous) => ({
        ...previous,
        [testId]: "Passed",
      }));
    } catch (error: unknown) {
      console.error("Test execution error:", error);

      setResults((previous) => ({
        ...previous,
        [testId]: "Failed",
      }));

      setErrors((previous) => ({
        ...previous,
        [testId]: "Test execution failed. Please try again.",
      }));
    } finally {
      setRunningTest(null);
    }
  };

  const passedCount = Object.values(results).filter(
    (result) => result === "Passed"
  ).length;

  return (
    <div
      style={{
        width: "100%",
        padding: "22px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        boxSizing: "border-box",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "16px",
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "9px",
            }}
          >
            <FlaskConical size={19} color="#2563eb" />

            <h2
              style={{
                margin: 0,
                color: "#172033",
                fontSize: "18px",
                fontWeight: 750,
              }}
            >
              Test Runner
            </h2>
          </div>

          <p
            style={{
              margin: "7px 0 0",
              color: "#64748b",
              fontSize: "13px",
            }}
          >
            Run evaluation tests to assess your AI models.
          </p>
        </div>

        <div
          style={{
            padding: "8px 12px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "9px",
            fontSize: "12px",
            color: "#475569",
            fontWeight: 650,
          }}
        >
          {passedCount}/{testList.length} Passed
        </div>
      </div>

      {/* Test Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "14px",
          marginTop: "22px",
        }}
      >
        {testList.map((test) => {
          const testId = String(test.id);
          const isRunning = runningTest === test.id;
          const result = results[testId];
          const error = errors[testId];

          return (
            <div
              key={test.id}
              style={{
                padding: "17px",
                border: "1px solid #e2e8f0",
                borderRadius: "11px",
                background: "#ffffff",
                display: "flex",
                flexDirection: "column",
                minHeight: "190px",
              }}
            >
              {/* Card Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <span
                  style={{
                    width: "34px",
                    height: "34px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "9px",
                    background: "#eff6ff",
                    color: "#2563eb",
                  }}
                >
                  <FlaskConical size={17} />
                </span>

                {isRunning ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      color: "#2563eb",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    <LoaderCircle size={13} />
                    Running
                  </span>
                ) : result === "Passed" ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      color: "#15803d",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    <CheckCircle2 size={14} />
                    Passed
                  </span>
                ) : result === "Failed" ? (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      color: "#dc2626",
                      fontSize: "11px",
                      fontWeight: 700,
                    }}
                  >
                    <XCircle size={14} />
                    Failed
                  </span>
                ) : (
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      color: "#94a3b8",
                      fontSize: "11px",
                    }}
                  >
                    <Clock3 size={13} />
                    Not Run
                  </span>
                )}
              </div>

              {/* Test Information */}
              <h3
                style={{
                  margin: "15px 0 6px",
                  color: "#172033",
                  fontSize: "14px",
                  fontWeight: 700,
                }}
              >
                {test.name}
              </h3>

              <p
                style={{
                  margin: 0,
                  color: "#64748b",
                  fontSize: "12px",
                  lineHeight: 1.6,
                  flex: 1,
                }}
              >
                {test.description}
              </p>

              {/* Error Message */}
              {error && (
                <p
                  style={{
                    margin: "10px 0 0",
                    color: "#dc2626",
                    fontSize: "11px",
                  }}
                >
                  {error}
                </p>
              )}

              {/* Run Button */}
              <button
                type="button"
                onClick={() => runTest(test)}
                disabled={runningTest !== null}
                style={{
                  width: "100%",
                  marginTop: "16px",
                  padding: "10px 13px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "7px",
                  border: "none",
                  borderRadius: "7px",
                  background:
                    runningTest !== null
                      ? "#94a3b8"
                      : "#2563eb",
                  color: "#ffffff",
                  fontSize: "12px",
                  fontWeight: 650,
                  cursor:
                    runningTest !== null
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {isRunning ? (
                  <>
                    <LoaderCircle size={14} />
                    Running Test...
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    Run Test
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}