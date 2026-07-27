import React, { useEffect, useMemo, useState } from "react";

/* =========================================================
   Constants
========================================================= */

const TIME_RANGES = {
  SEVEN_DAYS: "7d",
  THIRTY_DAYS: "30d",
  NINETY_DAYS: "90d",
  ONE_YEAR: "1y",
};

const ANALYTICS_TABS = {
  OVERVIEW: "overview",
  PERFORMANCE: "performance",
  USAGE: "usage",
  COST: "cost",
};

/* =========================================================
   Demo Analytics Data
   Replace with analytics API later
========================================================= */

const ANALYTICS_DATA = {
  "7d": {
    summary: {
      totalExecutions: 128420,
      successfulExecutions: 126118,
      failedExecutions: 2302,
      successRate: 98.2,
      avgLatency: 842,
      totalCost: 1248.64,
      activeAgents: 42,
      totalAgents: 58,
    },

    trend: [
      { label: "Mon", executions: 14200, success: 97.8 },
      { label: "Tue", executions: 16800, success: 98.1 },
      { label: "Wed", executions: 17400, success: 98.5 },
      { label: "Thu", executions: 19200, success: 98.8 },
      { label: "Fri", executions: 21100, success: 98.4 },
      { label: "Sat", executions: 16820, success: 98.1 },
      { label: "Sun", executions: 12900, success: 97.9 },
    ],

    agents: [
      {
        name: "Customer Support Agent",
        executions: 28420,
        successRate: 99.4,
        latency: 620,
        cost: 284.12,
      },
      {
        name: "Data Analysis Agent",
        executions: 22180,
        successRate: 98.7,
        latency: 890,
        cost: 342.82,
      },
      {
        name: "Security Monitoring Agent",
        executions: 19450,
        successRate: 99.8,
        latency: 410,
        cost: 192.44,
      },
      {
        name: "Invoice Processing Agent",
        executions: 16320,
        successRate: 96.8,
        latency: 1240,
        cost: 214.76,
      },
      {
        name: "Workflow Orchestrator",
        executions: 12840,
        successRate: 97.9,
        latency: 980,
        cost: 154.50,
      },
    ],
  },

  "30d": {
    summary: {
      totalExecutions: 524820,
      successfulExecutions: 515124,
      failedExecutions: 9696,
      successRate: 98.15,
      avgLatency: 864,
      totalCost: 4862.48,
      activeAgents: 48,
      totalAgents: 64,
    },

    trend: [
      { label: "Week 1", executions: 102400, success: 97.8 },
      { label: "Week 2", executions: 118200, success: 98.1 },
      { label: "Week 3", executions: 143800, success: 98.4 },
      { label: "Week 4", executions: 160420, success: 98.5 },
    ],

    agents: [
      {
        name: "Customer Support Agent",
        executions: 118420,
        successRate: 99.4,
        latency: 620,
        cost: 1024.12,
      },
      {
        name: "Data Analysis Agent",
        executions: 98420,
        successRate: 98.7,
        latency: 890,
        cost: 1284.82,
      },
      {
        name: "Security Monitoring Agent",
        executions: 84200,
        successRate: 99.8,
        latency: 410,
        cost: 824.44,
      },
      {
        name: "Invoice Processing Agent",
        executions: 72400,
        successRate: 96.8,
        latency: 1240,
        cost: 914.76,
      },
      {
        name: "Workflow Orchestrator",
        executions: 64800,
        successRate: 97.9,
        latency: 980,
        cost: 754.50,
      },
    ],
  },

  "90d": {
    summary: {
      totalExecutions: 1682400,
      successfulExecutions: 1651200,
      failedExecutions: 31200,
      successRate: 98.14,
      avgLatency: 901,
      totalCost: 14248.64,
      activeAgents: 52,
      totalAgents: 72,
    },

    trend: [
      { label: "Jan", executions: 420000, success: 97.8 },
      { label: "Feb", executions: 548000, success: 98.1 },
      { label: "Mar", executions: 714400, success: 98.5 },
    ],

    agents: [
      {
        name: "Customer Support Agent",
        executions: 382420,
        successRate: 99.4,
        latency: 620,
        cost: 3214.12,
      },
      {
        name: "Data Analysis Agent",
        executions: 324820,
        successRate: 98.7,
        latency: 890,
        cost: 3842.82,
      },
      {
        name: "Security Monitoring Agent",
        executions: 284200,
        successRate: 99.8,
        latency: 410,
        cost: 2824.44,
      },
      {
        name: "Invoice Processing Agent",
        executions: 242400,
        successRate: 96.8,
        latency: 1240,
        cost: 2914.76,
      },
      {
        name: "Workflow Orchestrator",
        executions: 218800,
        successRate: 97.9,
        latency: 980,
        cost: 1754.50,
      },
    ],
  },

  "1y": {
    summary: {
      totalExecutions: 8242400,
      successfulExecutions: 8081200,
      failedExecutions: 161200,
      successRate: 98.04,
      avgLatency: 928,
      totalCost: 72482.64,
      activeAgents: 58,
      totalAgents: 86,
    },

    trend: [
      { label: "Q1", executions: 1820000, success: 97.8 },
      { label: "Q2", executions: 2010000, success: 98.0 },
      { label: "Q3", executions: 2180000, success: 98.2 },
      { label: "Q4", executions: 2232400, success: 98.1 },
    ],

    agents: [
      {
        name: "Customer Support Agent",
        executions: 1820420,
        successRate: 99.4,
        latency: 620,
        cost: 14214.12,
      },
      {
        name: "Data Analysis Agent",
        executions: 1624820,
        successRate: 98.7,
        latency: 890,
        cost: 18442.82,
      },
      {
        name: "Security Monitoring Agent",
        executions: 1424200,
        successRate: 99.8,
        latency: 410,
        cost: 12824.44,
      },
      {
        name: "Invoice Processing Agent",
        executions: 1222400,
        successRate: 96.8,
        latency: 1240,
        cost: 13914.76,
      },
      {
        name: "Workflow Orchestrator",
        executions: 1088800,
        successRate: 97.9,
        latency: 980,
        cost: 8754.50,
      },
    ],
  },
};

/* =========================================================
   Utility Functions
========================================================= */

const formatNumber = (value) =>
  new Intl.NumberFormat("en-US").format(value);

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);

const formatLatency = (value) => {
  if (value < 1000) {
    return `${value} ms`;
  }

  return `${(value / 1000).toFixed(2)} s`;
};

/* =========================================================
   Mock Analytics API
========================================================= */

const analyticsApi = {
  getDashboard: async (range) => {
    await new Promise((resolve) =>
      setTimeout(resolve, 500)
    );

    return ANALYTICS_DATA[range];
  },
};

/* =========================================================
   KPI Card
========================================================= */

const KpiCard = ({
  title,
  value,
  description,
  trend,
  icon,
}) => {
  return (
    <div className="analytics-kpi-card">
      <div className="analytics-kpi-top">
        <span className="analytics-kpi-icon">
          {icon}
        </span>

        <span
          className={
            trend >= 0
              ? "analytics-trend-positive"
              : "analytics-trend-negative"
          }
        >
          {trend >= 0 ? "↑" : "↓"}{" "}
          {Math.abs(trend)}%
        </span>
      </div>

      <span className="analytics-kpi-title">
        {title}
      </span>

      <strong className="analytics-kpi-value">
        {value}
      </strong>

      <span className="analytics-kpi-description">
        {description}
      </span>
    </div>
  );
};

/* =========================================================
   Trend Chart
========================================================= */

const TrendChart = ({ data }) => {
  const maxExecutions = Math.max(
    ...data.map((item) => item.executions)
  );

  return (
    <div className="analytics-chart">
      <div className="analytics-chart-header">
        <div>
          <h2>Execution Volume</h2>

          <p>
            Agent execution activity over time
          </p>
        </div>
      </div>

      <div className="analytics-bars">
        {data.map((item) => {
          const height =
            (item.executions /
              maxExecutions) *
            100;

          return (
            <div
              className="analytics-bar-column"
              key={item.label}
            >
              <div className="analytics-bar-value">
                {formatNumber(
                  item.executions
                )}
              </div>

              <div className="analytics-bar-track">
                <div
                  className="analytics-bar"
                  style={{
                    height: `${height}%`,
                  }}
                />
              </div>

              <span>{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* =========================================================
   Performance Table
========================================================= */

const PerformanceTable = ({ agents }) => {
  return (
    <div className="analytics-panel">
      <div className="analytics-panel-header">
        <div>
          <h2>Agent Performance</h2>

          <p>
            Performance metrics by agent
          </p>
        </div>

        <button className="analytics-button-secondary">
          View All
        </button>
      </div>

      <div className="analytics-table-wrapper">
        <table className="analytics-table">
          <thead>
            <tr>
              <th>Agent</th>
              <th>Executions</th>
              <th>Success Rate</th>
              <th>Latency</th>
              <th>Cost</th>
            </tr>
          </thead>

          <tbody>
            {agents.map((agent) => (
              <tr key={agent.name}>
                <td>
                  <strong>{agent.name}</strong>
                </td>

                <td>
                  {formatNumber(
                    agent.executions
                  )}
                </td>

                <td>
                  <span
                    className={
                      agent.successRate >= 98
                        ? "analytics-success"
                        : "analytics-warning"
                    }
                  >
                    {agent.successRate}%
                  </span>
                </td>

                <td>
                  {formatLatency(
                    agent.latency
                  )}
                </td>

                <td>
                  {formatCurrency(
                    agent.cost
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* =========================================================
   Main Analytics Component
========================================================= */

const Analytics = () => {
  const [timeRange, setTimeRange] =
    useState(TIME_RANGES.THIRTY_DAYS);

  const [activeTab, setActiveTab] =
    useState(
      ANALYTICS_TABS.OVERVIEW
    );

  const [data, setData] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] = useState("");

  /* =======================================================
     Fetch Analytics
  ======================================================= */

  useEffect(() => {
    let mounted = true;

    const loadAnalytics = async () => {
      try {
        setLoading(true);

        setError("");

        const response =
          await analyticsApi.getDashboard(
            timeRange
          );

        if (mounted) {
          setData(response);
        }
      } catch (err) {
        if (mounted) {
          setError(
            err.message ||
              "Unable to load analytics."
          );
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadAnalytics();

    return () => {
      mounted = false;
    };
  }, [timeRange]);

  /* =======================================================
     Calculated Metrics
  ======================================================= */

  const metrics = useMemo(() => {
    if (!data) {
      return null;
    }

    const executionGrowth = 18.4;

    const successGrowth = 2.8;

    const latencyGrowth = -6.2;

    const costGrowth = 11.5;

    return {
      executionGrowth,
      successGrowth,
      latencyGrowth,
      costGrowth,
    };
  }, [data]);

  /* =======================================================
     Loading
  ======================================================= */

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          <div className="analytics-spinner" />

          <p>
            Loading enterprise analytics...
          </p>
        </div>
      </div>
    );
  }

  /* =======================================================
     Error
  ======================================================= */

  if (error || !data) {
    return (
      <div className="analytics-page">
        <div className="analytics-error">
          <h2>
            Unable to load analytics
          </h2>

          <p>
            {error ||
              "Analytics data is unavailable."}
          </p>

          <button
            className="analytics-button-primary"
            onClick={() =>
              setTimeRange(
                TIME_RANGES.THIRTY_DAYS
              )
            }
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const { summary, trend, agents } = data;

  /* =======================================================
     Render
  ======================================================= */

  return (
    <div className="analytics-page">
      {/* Header */}

      <header className="analytics-header">
        <div>
          <span className="analytics-eyebrow">
            ENTERPRISE INTELLIGENCE
          </span>

          <h1>Analytics</h1>

          <p>
            Monitor agent performance,
            platform usage and operational
            efficiency.
          </p>
        </div>

        <div className="analytics-header-actions">
          <select
            value={timeRange}
            onChange={(event) =>
              setTimeRange(
                event.target.value
              )
            }
            className="analytics-range-select"
          >
            <option value="7d">
              Last 7 Days
            </option>

            <option value="30d">
              Last 30 Days
            </option>

            <option value="90d">
              Last 90 Days
            </option>

            <option value="1y">
              Last Year
            </option>
          </select>

          <button className="analytics-button-primary">
            Export Report
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}

      <nav className="analytics-tabs">
        {Object.values(
          ANALYTICS_TABS
        ).map((tab) => (
          <button
            key={tab}
            className={
              activeTab === tab
                ? "analytics-tab analytics-tab-active"
                : "analytics-tab"
            }
            onClick={() =>
              setActiveTab(tab)
            }
          >
            {tab.charAt(0).toUpperCase() +
              tab.slice(1)}
          </button>
        ))}
      </nav>

      {/* KPI Cards */}

      <section className="analytics-kpi-grid">
        <KpiCard
          title="Total Executions"
          value={formatNumber(
            summary.totalExecutions
          )}
          description="Total agent executions"
          trend={metrics.executionGrowth}
          icon="⚡"
        />

        <KpiCard
          title="Success Rate"
          value={`${summary.successRate}%`}
          description="Successful executions"
          trend={metrics.successGrowth}
          icon="✓"
        />

        <KpiCard
          title="Average Latency"
          value={formatLatency(
            summary.avgLatency
          )}
          description="Average response time"
          trend={metrics.latencyGrowth}
          icon="◷"
        />

        <KpiCard
          title="Total Cost"
          value={formatCurrency(
            summary.totalCost
          )}
          description="Estimated platform cost"
          trend={metrics.costGrowth}
          icon="$"
        />
      </section>

      {/* Platform Health */}

      <section className="analytics-health-banner">
        <div>
          <span>
            Platform Agent Health
          </span>

          <strong>
            {summary.activeAgents} /{" "}
            {summary.totalAgents}
          </strong>

          <p>
            agents currently active
          </p>
        </div>

        <div className="analytics-health-progress">
          <div
            style={{
              width: `${
                (summary.activeAgents /
                  summary.totalAgents) *
                100
              }%`,
            }}
          />
        </div>
      </section>

      {/* Overview */}

      {activeTab ===
        ANALYTICS_TABS.OVERVIEW && (
        <>
          <TrendChart data={trend} />

          <PerformanceTable
            agents={agents}
          />
        </>
      )}

      {/* Performance */}

      {activeTab ===
        ANALYTICS_TABS.PERFORMANCE && (
        <section className="analytics-panel">
          <div className="analytics-panel-header">
            <div>
              <h2>
                Performance Intelligence
              </h2>

              <p>
                Analyze execution reliability,
                response latency and agent
                efficiency.
              </p>
            </div>
          </div>

          <PerformanceTable
            agents={agents}
          />
        </section>
      )}

      {/* Usage */}

      {activeTab ===
        ANALYTICS_TABS.USAGE && (
        <section className="analytics-panel">
          <div className="analytics-panel-header">
            <div>
              <h2>Platform Usage</h2>

              <p>
                Monitor agent execution
                consumption across the
                platform.
              </p>
            </div>
          </div>

          <div className="analytics-usage-grid">
            <div className="analytics-usage-card">
              <span>
                Successful Executions
              </span>

              <strong>
                {formatNumber(
                  summary.successfulExecutions
                )}
              </strong>
            </div>

            <div className="analytics-usage-card">
              <span>
                Failed Executions
              </span>

              <strong>
                {formatNumber(
                  summary.failedExecutions
                )}
              </strong>
            </div>

            <div className="analytics-usage-card">
              <span>
                Active Agents
              </span>

              <strong>
                {summary.activeAgents}
              </strong>
            </div>

            <div className="analytics-usage-card">
              <span>
                Total Agents
              </span>

              <strong>
                {summary.totalAgents}
              </strong>
            </div>
          </div>
        </section>
      )}

      {/* Cost */}

      {activeTab ===
        ANALYTICS_TABS.COST && (
        <section className="analytics-panel">
          <div className="analytics-panel-header">
            <div>
              <h2>Cost Intelligence</h2>

              <p>
                Analyze operational cost
                across AI agents.
              </p>
            </div>
          </div>

          <div className="analytics-cost-summary">
            <div>
              <span>
                Total Platform Cost
              </span>

              <strong>
                {formatCurrency(
                  summary.totalCost
                )}
              </strong>
            </div>

            <div>
              <span>
                Average Cost / Execution
              </span>

              <strong>
                {formatCurrency(
                  summary.totalCost /
                    summary.totalExecutions
                )}
              </strong>
            </div>
          </div>

          <PerformanceTable
            agents={agents}
          />
        </section>
      )}
    </div>
  );
};

export default Analytics;