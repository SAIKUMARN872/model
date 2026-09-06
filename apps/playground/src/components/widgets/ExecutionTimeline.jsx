"use client";

import React from "react";

export default function ExecutionTimeline({
  steps = [],
}) {
  const defaultSteps = [
    {
      id: 1,
      title: "Request Received",
      description:
        "The AI agent received the user request.",
      status: "completed",
    },
    {
      id: 2,
      title: "Processing Request",
      description:
        "The agent is processing the request.",
      status: "completed",
    },
    {
      id: 3,
      title: "Tool Execution",
      description:
        "The selected tool is being executed.",
      status: "running",
    },
    {
      id: 4,
      title: "Response Generated",
      description:
        "The final response will be generated.",
      status: "pending",
    },
  ];

  const timeline =
    steps.length > 0
      ? steps
      : defaultSteps;

  return (
    <div
      style={{
        width: "100%",
        padding: "20px",
        backgroundColor: "#ffffff",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        boxSizing: "border-box",
      }}
    >
      <h2
        style={{
          marginTop: 0,
          color: "#0f172a",
        }}
      >
        Execution Timeline
      </h2>

      <div
        style={{
          marginTop: "20px",
        }}
      >
        {timeline.map(
          (step, index) => (
            <div
              key={step.id}
              style={{
                display: "flex",
                gap: "16px",
                position: "relative",
                paddingBottom:
                  index ===
                  timeline.length - 1
                    ? "0"
                    : "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection:
                    "column",
                  alignItems:
                    "center",
                }}
              >
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    backgroundColor:
                      step.status ===
                      "completed"
                        ? "#16a34a"
                        : step.status ===
                          "running"
                        ? "#2563eb"
                        : "#cbd5e1",
                  }}
                />

                {index <
                  timeline.length - 1 && (
                  <div
                    style={{
                      width: "2px",
                      flex: 1,
                      marginTop: "4px",
                      backgroundColor:
                        "#e2e8f0",
                    }}
                  />
                )}
              </div>

              <div>
                <h3
                  style={{
                    margin: 0,
                    color: "#0f172a",
                  }}
                >
                  {step.title}
                </h3>

                <p
                  style={{
                    marginTop: "6px",
                    marginBottom: "6px",
                    color: "#64748b",
                  }}
                >
                  {step.description}
                </p>

                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    textTransform:
                      "capitalize",
                    color:
                      step.status ===
                      "completed"
                        ? "#166534"
                        : step.status ===
                          "running"
                        ? "#1d4ed8"
                        : "#64748b",
                  }}
                >
                  {step.status}
                </span>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}