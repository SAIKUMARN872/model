import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

/* =========================================================
   Analytics Engine
   Enterprise Analytics Processing Layer
========================================================= */

/*
  Architecture:

  Raw Agent Events
        ↓
  Data Normalization
        ↓
  Metric Aggregation
        ↓
  KPI Calculation
        ↓
  Trend Analysis
        ↓
  Health Scoring
        ↓
  Cost Analysis
        ↓
  Insights
        ↓
  Analytics Dashboard
*/

/* =========================================================
   Constants
========================================================= */

const ENGINE_STATUS = {
  IDLE: "idle",
  PROCESSING: "processing",
  COMPLETED: "completed",
  ERROR: "error",
};

const HEALTH_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 75,
  WARNING: 50,
};

const COST_CONFIG = {
  INPUT_TOKEN_COST: 0.000003,
  OUTPUT_TOKEN_COST: 0.000015,
  EXECUTION_COST: 0.002,
};

/* =========================================================
   Demo Raw Data
   Replace with backend analytics stream
========================================================= */

const RAW_AGENT_DATA = [
  {
    agentId: "agent_001",
    agentName: "Customer Support Agent",
    executions: 28420,
    successfulExecutions: 28250,
    failedExecutions: 170,
    averageLatency: 620,
    inputTokens: 1240000,
    outputTokens: 842000,
    uptime: 99.8,
    activeUsers: 1240,
  },
  {
    agentId: "agent_002",
    agentName: "Data Analysis Agent",
    executions: 22180,
    successfulExecutions: 21892,
    failedExecutions: 288,
    averageLatency: 890,
    inputTokens: 1680000,
    outputTokens: 1120000,
    uptime: 99.1,
    activeUsers: 842,
  },
  {
    agentId: "agent_003",
    agentName: "Security Monitoring Agent",
    executions: 19450,
    successfulExecutions: 19410,
    failedExecutions: 40,
    averageLatency: 410,
    inputTokens: 940000,
    outputTokens: 520000,
    uptime: 99.99,
    activeUsers: 320,
  },
  {
    agentId: "agent_004",
    agentName: "Invoice Processing Agent",
    executions: 16320,
    successfulExecutions: 15800,
    failedExecutions: 520,
    averageLatency: 1240,
    inputTokens: 1820000,
    outputTokens: 980000,
    uptime: 97.2,
    activeUsers: 560,
  },
  {
    agentId: "agent_005",
    agentName: "Workflow Orchestrator",
    executions: 12840,
    successfulExecutions: 12570,
    failedExecutions: 270,
    averageLatency: 980,
    inputTokens: 1100000,
    outputTokens: 720000,
    uptime: 98.6,
    activeUsers: 430,
  },
];

/* =========================================================
   Utility Functions
========================================================= */

const round = (
  value,
  decimals = 2
) => {
  const multiplier =
    10 ** decimals;

  return (
    Math.round(
      value * multiplier
    ) / multiplier
  );
};

const calculateSuccessRate = (
  successful,
  total
) => {
  if (!total) {
    return 0;
  }

  return round(
    (successful / total) * 100
  );
};

const calculateFailureRate = (
  failed,
  total
) => {
  if (!total) {
    return 0;
  }

  return round(
    (failed / total) * 100
  );
};

const calculateTokenCost = (
  inputTokens,
  outputTokens
) => {
  const inputCost =
    inputTokens *
    COST_CONFIG.INPUT_TOKEN_COST;

  const outputCost =
    outputTokens *
    COST_CONFIG.OUTPUT_TOKEN_COST;

  return round(
    inputCost + outputCost
  );
};

const calculateExecutionCost = (
  executions
) => {
  return round(
    executions *
      COST_CONFIG.EXECUTION_COST
  );
};

const calculateTotalCost = (
  executions,
  inputTokens,
  outputTokens
) => {
  const tokenCost =
    calculateTokenCost(
      inputTokens,
      outputTokens
    );

  const executionCost =
    calculateExecutionCost(
      executions
    );

  return round(
    tokenCost + executionCost
  );
};

/* =========================================================
   Health Score Engine
========================================================= */

const calculateHealthScore = ({
  successRate,
  uptime,
  averageLatency,
}) => {
  const reliabilityScore =
    successRate * 0.45;

  const uptimeScore =
    uptime * 0.35;

  const latencyScore =
    Math.max(
      0,
      100 -
        Math.min(
          averageLatency / 20,
          100
        )
    ) * 0.2;

  return round(
    reliabilityScore +
      uptimeScore +
      latencyScore
  );
};

const getHealthStatus = (
  score
) => {
  if (
    score >=
    HEALTH_THRESHOLDS.EXCELLENT
  ) {
    return "excellent";
  }

  if (
    score >=
    HEALTH_THRESHOLDS.GOOD
  ) {
    return "good";
  }

  if (
    score >=
    HEALTH_THRESHOLDS.WARNING
  ) {
    return "warning";
  }

  return "critical";
};

/* =========================================================
   Agent Metric Processor
========================================================= */

const processAgentMetrics = (
  agent
) => {
  const successRate =
    calculateSuccessRate(
      agent.successfulExecutions,
      agent.executions
    );

  const failureRate =
    calculateFailureRate(
      agent.failedExecutions,
      agent.executions
    );

  const tokenCost =
    calculateTokenCost(
      agent.inputTokens,
      agent.outputTokens
    );

  const executionCost =
    calculateExecutionCost(
      agent.executions
    );

  const totalCost =
    calculateTotalCost(
      agent.executions,
      agent.inputTokens,
      agent.outputTokens
    );

  const healthScore =
    calculateHealthScore({
      successRate,
      uptime: agent.uptime,
      averageLatency:
        agent.averageLatency,
    });

  return {
    ...agent,

    successRate,

    failureRate,

    tokenCost,

    executionCost,

    totalCost,

    healthScore,

    healthStatus:
      getHealthStatus(
        healthScore
      ),
  };
};

/* =========================================================
   Aggregate Metrics
========================================================= */

const aggregateMetrics = (
  agents
) => {
  const totals = agents.reduce(
    (accumulator, agent) => {
      accumulator.executions +=
        agent.executions;

      accumulator.successfulExecutions +=
        agent.successfulExecutions;

      accumulator.failedExecutions +=
        agent.failedExecutions;

      accumulator.inputTokens +=
        agent.inputTokens;

      accumulator.outputTokens +=
        agent.outputTokens;

      accumulator.activeUsers +=
        agent.activeUsers;

      accumulator.totalLatency +=
        agent.averageLatency;

      accumulator.totalCost +=
        agent.totalCost;

      return accumulator;
    },
    {
      executions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      inputTokens: 0,
      outputTokens: 0,
      activeUsers: 0,
      totalLatency: 0,
      totalCost: 0,
    }
  );

  const successRate =
    calculateSuccessRate(
      totals.successfulExecutions,
      totals.executions
    );

  const failureRate =
    calculateFailureRate(
      totals.failedExecutions,
      totals.executions
    );

  const averageLatency =
    agents.length
      ? round(
          totals.totalLatency /
            agents.length
        )
      : 0;

  return {
    ...totals,

    successRate,

    failureRate,

    averageLatency,

    totalCost: round(
      totals.totalCost
    ),
  };
};

/* =========================================================
   Trend Engine
========================================================= */

const calculateTrend = (
  current,
  previous
) => {
  if (!previous) {
    return {
      value: 0,
      direction: "stable",
    };
  }

  const percentage =
    round(
      ((current - previous) /
        previous) *
        100
    );

  return {
    value: Math.abs(
      percentage
    ),

    direction:
      percentage > 0
        ? "up"
        : percentage < 0
        ? "down"
        : "stable",
  };
};

/* =========================================================
   Performance Ranking
========================================================= */

const rankAgentsByPerformance = (
  agents
) => {
  return [...agents]
    .sort(
      (a, b) =>
        b.healthScore -
        a.healthScore
    )
    .map(
      (agent, index) => ({
        ...agent,
        performanceRank:
          index + 1,
      })
    );
};

/* =========================================================
   Cost Analysis
========================================================= */

const calculateCostAnalysis = (
  agents
) => {
  const totalCost =
    agents.reduce(
      (sum, agent) =>
        sum + agent.totalCost,
      0
    );

  const averageCostPerExecution =
    agents.reduce(
      (sum, agent) =>
        sum +
        agent.totalCost,
      0
    ) /
    agents.reduce(
      (sum, agent) =>
        sum +
        agent.executions,
      0
    );

  const highestCostAgent =
    [...agents].sort(
      (a, b) =>
        b.totalCost -
        a.totalCost
    )[0];

  return {
    totalCost: round(
      totalCost
    ),

    averageCostPerExecution:
      round(
        averageCostPerExecution,
        6
      ),

    highestCostAgent:
      highestCostAgent
        ? {
            name:
              highestCostAgent.agentName,

            cost:
              highestCostAgent.totalCost,
          }
        : null,
  };
};

/* =========================================================
   Insight Engine
========================================================= */

const generateInsights = (
  agents,
  aggregate
) => {
  const insights = [];

  const highestPerformingAgent =
    [...agents].sort(
      (a, b) =>
        b.healthScore -
        a.healthScore
    )[0];

  const slowestAgent =
    [...agents].sort(
      (a, b) =>
        b.averageLatency -
        a.averageLatency
    )[0];

  const mostExpensiveAgent =
    [...agents].sort(
      (a, b) =>
        b.totalCost -
        a.totalCost
    )[0];

  if (
    highestPerformingAgent
  ) {
    insights.push({
      type: "success",

      title:
        "Top Performing Agent",

      message: `${highestPerformingAgent.agentName} has the highest overall health score at ${highestPerformingAgent.healthScore}%.`,
    });
  }

  if (
    aggregate.successRate <
    98
  ) {
    insights.push({
      type: "warning",

      title:
        "Success Rate Below Target",

      message: `Platform success rate is ${aggregate.successRate}%. Consider investigating failed executions.`,
    });
  }

  if (slowestAgent) {
    insights.push({
      type: "performance",

      title:
        "Latency Optimization Opportunity",

      message: `${slowestAgent.agentName} has the highest average latency at ${slowestAgent.averageLatency} ms.`,
    });
  }

  if (
    mostExpensiveAgent
  ) {
    insights.push({
      type: "cost",

      title:
        "Highest Cost Agent",

      message: `${mostExpensiveAgent.agentName} currently represents the highest estimated operational cost.`,
    });
  }

  return insights;
};

/* =========================================================
   Analytics Engine Processor
========================================================= */

const runAnalyticsEngine = (
  rawData
) => {
  const processedAgents =
    rawData.map(
      processAgentMetrics
    );

  const rankedAgents =
    rankAgentsByPerformance(
      processedAgents
    );

  const aggregate =
    aggregateMetrics(
      processedAgents
    );

  const costAnalysis =
    calculateCostAnalysis(
      processedAgents
    );

  const insights =
    generateInsights(
      processedAgents,
      aggregate
    );

  return {
    generatedAt:
      new Date().toISOString(),

    engineVersion:
      "1.0.0",

    status:
      ENGINE_STATUS.COMPLETED,

    aggregate,

    agents:
      rankedAgents,

    costAnalysis,

    insights,
  };
};

/* =========================================================
   Health Status Component
========================================================= */

const HealthStatus = ({
  status,
}) => {
  return (
    <span
      className={`analytics-engine-health analytics-engine-health-${status}`}
    >
      {status
        .charAt(0)
        .toUpperCase() +
        status.slice(1)}
    </span>
  );
};

/* =========================================================
   KPI Card
========================================================= */

const MetricCard = ({
  title,
  value,
  subtitle,
}) => {
  return (
    <div className="analytics-engine-metric">
      <span>{title}</span>

      <strong>{value}</strong>

      <small>{subtitle}</small>
    </div>
  );
};

/* =========================================================
   Main Analytics Engine Component
========================================================= */

const AnalyticsEngine = () => {
  const [
    engineStatus,
    setEngineStatus,
  ] = useState(
    ENGINE_STATUS.IDLE
  );

  const [
    analytics,
    setAnalytics,
  ] = useState(null);

  const [
    error,
    setError,
  ] = useState("");

  /* =======================================================
     Execute Engine
  ======================================================= */

  const executeEngine =
    useCallback(async () => {
      try {
        setEngineStatus(
          ENGINE_STATUS.PROCESSING
        );

        setError("");

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              600
            )
        );

        const result =
          runAnalyticsEngine(
            RAW_AGENT_DATA
          );

        setAnalytics(result);

        setEngineStatus(
          ENGINE_STATUS.COMPLETED
        );
      } catch (err) {
        setError(
          err.message ||
            "Analytics engine failed."
        );

        setEngineStatus(
          ENGINE_STATUS.ERROR
        );
      }
    }, []);

  /* =======================================================
     Initial Execution
  ======================================================= */

  useEffect(() => {
    executeEngine();
  }, [executeEngine]);

  /* =======================================================
     Engine Statistics
  ======================================================= */

  const engineStatistics =
    useMemo(() => {
      if (!analytics) {
        return null;
      }

      const healthyAgents =
        analytics.agents.filter(
          (agent) =>
            agent.healthStatus ===
              "excellent" ||
            agent.healthStatus ===
              "good"
        ).length;

      const criticalAgents =
        analytics.agents.filter(
          (agent) =>
            agent.healthStatus ===
            "critical"
        ).length;

      return {
        healthyAgents,

        criticalAgents,

        totalAgents:
          analytics.agents.length,

        healthPercentage:
          analytics.agents.length
            ? round(
                (healthyAgents /
                  analytics.agents
                    .length) *
                  100
              )
            : 0,
      };
    }, [analytics]);

  /* =======================================================
     Processing State
  ======================================================= */

  if (
    engineStatus ===
    ENGINE_STATUS.PROCESSING
  ) {
    return (
      <div className="analytics-engine-page">
        <div className="analytics-engine-loading">
          <div className="analytics-engine-spinner" />

          <h2>
            Processing Analytics
          </h2>

          <p>
            Calculating enterprise
            performance metrics...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     Error State
  ======================================================= */

  if (
    engineStatus ===
      ENGINE_STATUS.ERROR ||
    !analytics
  ) {
    return (
      <div className="analytics-engine-page">
        <div className="analytics-engine-error">
          <h2>
            Analytics Engine Error
          </h2>

          <p>
            {error ||
              "Unable to process analytics data."}
          </p>

          <button
            className="analytics-engine-button-primary"
            onClick={
              executeEngine
            }
          >
            Run Engine Again
          </button>
        </div>
      </div>
    );
  }

  /* =======================================================
     Main UI
  ======================================================= */

  return (
    <div className="analytics-engine-page">
      {/* Header */}

      <header className="analytics-engine-header">
        <div>
          <span className="analytics-engine-eyebrow">
            ANALYTICS PROCESSING ENGINE
          </span>

          <h1>
            Analytics Engine
          </h1>

          <p>
            Enterprise intelligence
            processing and performance
            analysis layer.
          </p>
        </div>

        <div className="analytics-engine-header-actions">
          <span className="analytics-engine-status">
            ●{" "}
            {engineStatus}
          </span>

          <button
            className="analytics-engine-button-primary"
            onClick={
              executeEngine
            }
          >
            Refresh Analysis
          </button>
        </div>
      </header>

      {/* Engine Metrics */}

      <section className="analytics-engine-metrics">
        <MetricCard
          title="Total Executions"
          value={analytics.aggregate.executions.toLocaleString()}
          subtitle="Processed executions"
        />

        <MetricCard
          title="Success Rate"
          value={`${analytics.aggregate.successRate}%`}
          subtitle="Platform reliability"
        />

        <MetricCard
          title="Average Latency"
          value={`${analytics.aggregate.averageLatency} ms`}
          subtitle="Average response time"
        />

        <MetricCard
          title="Total Cost"
          value={`$${analytics.aggregate.totalCost.toLocaleString()}`}
          subtitle="Estimated operational cost"
        />
      </section>

      {/* Agent Health Overview */}

      <section className="analytics-engine-health-panel">
        <div className="analytics-engine-section-header">
          <div>
            <h2>
              Platform Health
            </h2>

            <p>
              Aggregated health status
              across all monitored agents.
            </p>
          </div>

          <strong>
            {
              engineStatistics.healthPercentage
            }
            %
          </strong>
        </div>

        <div className="analytics-engine-health-track">
          <div
            style={{
              width: `${engineStatistics.healthPercentage}%`,
            }}
          />
        </div>

        <div className="analytics-engine-health-summary">
          <span>
            Healthy:{" "}
            {
              engineStatistics.healthyAgents
            }
          </span>

          <span>
            Critical:{" "}
            {
              engineStatistics.criticalAgents
            }
          </span>

          <span>
            Total:{" "}
            {
              engineStatistics.totalAgents
            }
          </span>
        </div>
      </section>

      {/* Agent Performance */}

      <section className="analytics-engine-panel">
        <div className="analytics-engine-section-header">
          <div>
            <h2>
              Agent Performance Ranking
            </h2>

            <p>
              Agents ranked by composite
              health and reliability score.
            </p>
          </div>
        </div>

        <div className="analytics-engine-table-wrapper">
          <table className="analytics-engine-table">
            <thead>
              <tr>
                <th>Rank</th>

                <th>Agent</th>

                <th>Executions</th>

                <th>Success Rate</th>

                <th>Latency</th>

                <th>Health Score</th>

                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {analytics.agents.map(
                (agent) => (
                  <tr
                    key={
                      agent.agentId
                    }
                  >
                    <td>
                      #
                      {
                        agent.performanceRank
                      }
                    </td>

                    <td>
                      <strong>
                        {
                          agent.agentName
                        }
                      </strong>
                    </td>

                    <td>
                      {formatNumber(
                        agent.executions
                      )}
                    </td>

                    <td>
                      {
                        agent.successRate
                      }
                      %
                    </td>

                    <td>
                      {
                        agent.averageLatency
                      }{" "}
                      ms
                    </td>

                    <td>
                      {
                        agent.healthScore
                      }
                      %
                    </td>

                    <td>
                      <HealthStatus
                        status={
                          agent.healthStatus
                        }
                      />
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Cost Analysis */}

      <section className="analytics-engine-cost-grid">
        <div className="analytics-engine-cost-card">
          <span>
            Total Platform Cost
          </span>

          <strong>
            $
            {
              analytics.costAnalysis.totalCost
            }
          </strong>
        </div>

        <div className="analytics-engine-cost-card">
          <span>
            Average Cost / Execution
          </span>

          <strong>
            $
            {
              analytics.costAnalysis
                .averageCostPerExecution
            }
          </strong>
        </div>

        <div className="analytics-engine-cost-card">
          <span>
            Highest Cost Agent
          </span>

          <strong>
            {
              analytics.costAnalysis
                .highestCostAgent
                ?.name
            }
          </strong>
        </div>
      </section>

      {/* Automated Insights */}

      <section className="analytics-engine-panel">
        <div className="analytics-engine-section-header">
          <div>
            <h2>
              Automated Insights
            </h2>

            <p>
              Intelligence generated by
              the analytics engine.
            </p>
          </div>
        </div>

        <div className="analytics-engine-insights">
          {analytics.insights.map(
            (insight, index) => (
              <div
                key={`${insight.type}-${index}`}
                className={`analytics-engine-insight analytics-engine-insight-${insight.type}`}
              >
                <div>
                  <strong>
                    {
                      insight.title
                    }
                  </strong>

                  <p>
                    {
                      insight.message
                    }
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </section>

      {/* Engine Metadata */}

      <footer className="analytics-engine-footer">
        <span>
          Engine Version:{" "}
          {analytics.engineVersion}
        </span>

        <span>
          Last Processed:{" "}
          {new Date(
            analytics.generatedAt
          ).toLocaleString()}
        </span>
      </footer>
    </div>
  );
};

/* =========================================================
   Local Formatting Helper
========================================================= */

const formatNumber = (
  value
) => {
  return new Intl.NumberFormat(
    "en-US"
  ).format(value);
};

export default AnalyticsEngine;