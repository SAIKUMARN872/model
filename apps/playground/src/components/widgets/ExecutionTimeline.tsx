import React from "react";
import {
  Check,
  Circle,
  Clock3,
  LoaderCircle,
  ListChecks,
  AlertCircle,
} from "lucide-react";

interface ExecutionStep {
  id: string | number;
  title: string;
  description: string;
  status: string;
  timestamp?: string;
}

interface ExecutionTimelineProps {
  steps?: ExecutionStep[];
}

const defaultSteps: ExecutionStep[] = [
  {
    id: 1,
    title: "Request Received",
    description: "The AI agent received the user request.",
    status: "completed",
  },
  {
    id: 2,
    title: "Processing Request",
    description: "The agent is processing the request.",
    status: "completed",
  },
  {
    id: 3,
    title: "Tool Execution",
    description: "The selected tool is being executed.",
    status: "running",
  },
  {
    id: 4,
    title: "Response Generated",
    description: "The final response will be generated.",
    status: "pending",
  },
];

export default function ExecutionTimeline({
  steps = [],
}: ExecutionTimelineProps) {
  const timeline = steps.length > 0 ? steps : defaultSteps;

  const completedCount = timeline.filter(
    (step) => step.status.toLowerCase() === "completed"
  ).length;

  const runningCount = timeline.filter(
    (step) => step.status.toLowerCase() === "running"
  ).length;

  const progress =
    timeline.length > 0
      ? Math.round((completedCount / timeline.length) * 100)
      : 0;

  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case "completed":
        return "#16a34a";
      case "running":
        return "#2563eb";
      case "failed":
        return "#dc2626";
      default:
        return "#94a3b8";
    }
  };

  const getStatusBackground = (status: string): string => {
    switch (status.toLowerCase()) {
      case "completed":
        return "#dcfce7";
      case "running":
        return "#dbeafe";
      case "failed":
        return "#fee2e2";
      default:
        return "#f1f5f9";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "completed":
        return Check;
      case "running":
        return LoaderCircle;
      case "failed":
        return AlertCircle;
      default:
        return Circle;
    }
  };

  return (
    <section
      style={{
        width: "100%",
        padding: "22px",
        background: "#ffffff",
        borderRadius: "14px",
        border: "1px solid #e2e8f0",
        boxSizing: "border-box",
        color: "#0f172a",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "11px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#eff6ff",
              color: "#2563eb",
              borderRadius: "10px",
            }}
          >
            <ListChecks size={21} />
          </div>

          <div>
            <h2
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 700,
              }}
            >
              Execution Timeline
            </h2>

            <p
              style={{
                margin: "5px 0 0",
                color: "#64748b",
                fontSize: "12px",
              }}
            >
              Track each stage of agent execution.
            </p>
          </div>
        </div>

        <span
          style={{
            padding: "6px 10px",
            borderRadius: "7px",
            background: "#f1f5f9",
            color: "#475569",
            fontSize: "12px",
            fontWeight: 600,
          }}
        >
          {completedCount}/{timeline.length} Completed
        </span>
      </div>

      {/* Progress */}
      <div
        style={{
          marginTop: "22px",
          padding: "14px",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "9px",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: "#475569",
            }}
          >
            Execution Progress
          </span>

          <span
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "#2563eb",
            }}
          >
            {progress}%
          </span>
        </div>

        <div
          style={{
            height: "7px",
            background: "#e2e8f0",
            borderRadius: "20px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              background: "#2563eb",
              borderRadius: "20px",
              transition: "width 0.3s ease",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "12px",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "11px", color: "#15803d" }}>
            ● {completedCount} Completed
          </span>

          <span style={{ fontSize: "11px", color: "#2563eb" }}>
            ● {runningCount} Running
          </span>

          <span style={{ fontSize: "11px", color: "#64748b" }}>
            ● {timeline.length - completedCount - runningCount} Pending
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ marginTop: "24px" }}>
        {timeline.map((step, index) => {
          const status = step.status.toLowerCase();
          const StatusIcon = getStatusIcon(status);
          const statusColor = getStatusColor(status);
          const isLast = index === timeline.length - 1;

          return (
            <div
              key={step.id}
              style={{
                display: "flex",
                gap: "14px",
                position: "relative",
                paddingBottom: isLast ? "0" : "25px",
              }}
            >
              {/* Timeline marker */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: "32px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                    background: getStatusBackground(status),
                    color: statusColor,
                    border: `1px solid ${statusColor}30`,
                  }}
                >
                  <StatusIcon
                    size={16}
                    style={
                      status === "running"
                        ? {
                            animation: "timeline-spin 1.2s linear infinite",
                          }
                        : undefined
                    }
                  />
                </div>

                {!isLast && (
                  <div
                    style={{
                      width: "2px",
                      flex: 1,
                      minHeight: "35px",
                      marginTop: "5px",
                      background:
                        status === "completed"
                          ? "#86efac"
                          : "#e2e8f0",
                    }}
                  />
                )}
              </div>

              {/* Step information */}
              <div
                style={{
                  flex: 1,
                  minWidth: 0,
                  paddingTop: "3px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "14px",
                      fontWeight: 650,
                      color: "#1e293b",
                    }}
                  >
                    {step.title}
                  </h3>

                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: "6px",
                      background: getStatusBackground(status),
                      color: statusColor,
                      fontSize: "10px",
                      fontWeight: 700,
                      textTransform: "capitalize",
                    }}
                  >
                    {step.status}
                  </span>
                </div>

                <p
                  style={{
                    margin: "7px 0 0",
                    color: "#64748b",
                    fontSize: "12px",
                    lineHeight: 1.6,
                  }}
                >
                  {step.description}
                </p>

                {step.timestamp && (
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      marginTop: "8px",
                      fontSize: "11px",
                      color: "#94a3b8",
                    }}
                  >
                    <Clock3 size={12} />
                    {step.timestamp}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes timeline-spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
    </section>
  );
}