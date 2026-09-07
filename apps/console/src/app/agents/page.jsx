"use client";

import React, { useEffect, useMemo, useState } from "react";

import KpiCard from "../../components/widgets/KpiCard";
import MetricCard from "../../components/widgets/MetricCard";
import ActivityFeed from "../../components/widgets/ActivityFeed";

import UsageChart from "../../components/usage-chart/UsageChart";

import CostChart from "../../components/charts/CostChart";
import LatencyChart from "../../components/charts/LatencyChart";
import TokenChart from "../../components/charts/TokenChart";

import Spinner from "../../components/loading/Spinner";

import useAnalytics from "../../hooks/analytics/useAnalytics";
import useUsage from "../../hooks/useUsage";
import useCost from "../../hooks/cost/useCost";
import useLatency from "../../hooks/latency/useLatency";

/**
 * Enterprise Console Dashboard
 *
 * Responsibilities:
 * - Display platform KPIs
 * - Display usage analytics
 * - Display cost analytics
 * - Display latency metrics
 * - Display token consumption
 * - Display recent activity
 * - Handle loading and error states
 */
export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("7d");

  const {
    data: analytics,
    loading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useAnalytics({
    range: timeRange,
  });

  const {
    data: usage,
    loading: usageLoading,
    error: usageError,
    refetch: refetchUsage,
  } = useUsage({
    range: timeRange,
  });

  const {
    data: cost,
    loading: costLoading,
    error: costError,
    refetch: refetchCost,
  } = useCost({
    range: timeRange,
  });

  const {
    data: latency,
    loading: latencyLoading,
    error: latencyError,
    refetch: refetchLatency,
  } = useLatency({
    range: timeRange,
  });

  const loading =
    analyticsLoading ||
    usageLoading ||
    costLoading ||
    latencyLoading;

  const hasError =
    analyticsError ||
    usageError ||
    costError ||
    latencyError;

  /**
   * Refresh all dashboard data.
   */
  const handleRefresh = async () => {
    await Promise.allSettled([
      refetchAnalytics?.(),
      refetchUsage?.(),
      refetchCost?.(),
      refetchLatency?.(),
    ]);
  };

  /**
   * Normalize KPI data.
   */
  const metrics = useMemo(() => {
    return {
      totalRequests:
        analytics?.totalRequests ??
        usage?.totalRequests ??
        0,

      totalTokens:
        analytics?.totalTokens ??
        usage?.totalTokens ??
        0,

      totalCost:
        analytics?.totalCost ??
        cost?.totalCost ??
        0,

      averageLatency:
        analytics?.averageLatency ??
        latency?.averageLatency ??
        0,

      errorRate:
        analytics?.errorRate ??
        0,

      activeModels:
        analytics?.activeModels ??
        0,

      activeAgents:
        analytics?.activeAgents ??
        0,

      activeUsers:
        analytics?.activeUsers ??
        0,
    };
  }, [
    analytics,
    usage,
    cost,
    latency,
  ]);

  /**
   * Display error message.
   */
  if (hasError && !loading) {
    return (
      <main className="console-dashboard">
        <section className="dashboard-error">
          <div className="dashboard-error__content">
            <h1>Unable to load dashboard</h1>

            <p>
              We couldn't retrieve the latest
              dashboard metrics. Please try again.
            </p>

            <button
              type="button"
              onClick={handleRefresh}
              className="dashboard-button"
            >
              Try Again
            </button>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main
      className="console-dashboard"
      aria-label="Console Dashboard"
    >
      {/* Header */}
      <header className="dashboard-header">
        <div className="dashboard-header__content">
          <div>
            <h1>Dashboard</h1>

            <p>
              Monitor your AI platform performance,
              usage, costs, and operational health.
            </p>
          </div>

          <div className="dashboard-header__actions">
            <label
              htmlFor="dashboard-time-range"
              className="sr-only"
            >
              Select time range
            </label>

            <select
              id="dashboard-time-range"
              value={timeRange}
              onChange={(event) =>
                setTimeRange(event.target.value)
              }
              className="dashboard-select"
            >
              <option value="24h">
                Last 24 hours
              </option>

              <option value="7d">
                Last 7 days
              </option>

              <option value="30d">
                Last 30 days
              </option>

              <option value="90d">
                Last 90 days
              </option>
            </select>

            <button
              type="button"
              onClick={handleRefresh}
              disabled={loading}
              className="dashboard-button"
            >
              {loading
                ? "Refreshing..."
                : "Refresh"}
            </button>
          </div>
        </div>
      </header>

      {/* Loading State */}
      {loading && (
        <div
          className="dashboard-loading"
          role="status"
          aria-live="polite"
        >
          <Spinner />

          <span>
            Loading dashboard metrics...
          </span>
        </div>
      )}

      {/* KPI Section */}
      <section
        className="dashboard-kpi-grid"
        aria-label="Key performance indicators"
      >
        <KpiCard
          title="Total Requests"
          value={metrics.totalRequests}
          trend={analytics?.requestTrend}
          description={`Requests in ${timeRange}`}
        />

        <KpiCard
          title="Total Tokens"
          value={metrics.totalTokens}
          trend={analytics?.tokenTrend}
          description="Tokens processed"
        />

        <KpiCard
          title="Total Cost"
          value={`₹${Number(
            metrics.totalCost
          ).toFixed(2)}`}
          trend={cost?.costTrend}
          description="Estimated platform cost"
        />

        <KpiCard
          title="Average Latency"
          value={`${Number(
            metrics.averageLatency
          ).toFixed(0)} ms`}
          trend={latency?.latencyTrend}
          description="Average response latency"
        />
      </section>

      {/* Operational Metrics */}
      <section
        className="dashboard-metrics-grid"
        aria-label="Operational metrics"
      >
        <MetricCard
          title="Error Rate"
          value={`${Number(
            metrics.errorRate
          ).toFixed(2)}%`}
          status={
            metrics.errorRate > 5
              ? "critical"
              : metrics.errorRate > 2
              ? "warning"
              : "healthy"
          }
        />

        <MetricCard
          title="Active Models"
          value={metrics.activeModels}
          status="healthy"
        />

        <MetricCard
          title="Active Agents"
          value={metrics.activeAgents}
          status="healthy"
        />

        <MetricCard
          title="Active Users"
          value={metrics.activeUsers}
          status="healthy"
        />
      </section>

      {/* Analytics Charts */}
      <section
        className="dashboard-chart-grid"
        aria-label="Analytics"
      >
        <div className="dashboard-chart-card">
          <div className="dashboard-chart-card__header">
            <div>
              <h2>Usage Overview</h2>

              <p>
                Request activity over time.
              </p>
            </div>
          </div>

          <UsageChart
            data={
              usage?.requests ||
              usage?.usage ||
              []
            }
          />
        </div>

        <div className="dashboard-chart-card">
          <div className="dashboard-chart-card__header">
            <div>
              <h2>Cost Analysis</h2>

              <p>
                Platform spending over time.
              </p>
            </div>
          </div>

          <CostChart
            data={
              cost?.history ||
              cost?.data ||
              []
            }
          />
        </div>

        <div className="dashboard-chart-card">
          <div className="dashboard-chart-card__header">
            <div>
              <h2>Latency Performance</h2>

              <p>
                API response performance.
              </p>
            </div>
          </div>

          <LatencyChart
            data={
              latency?.history ||
              latency?.data ||
              []
            }
          />
        </div>

        <div className="dashboard-chart-card">
          <div className="dashboard-chart-card__header">
            <div>
              <h2>Token Consumption</h2>

              <p>
                Input and output token usage.
              </p>
            </div>
          </div>

          <TokenChart
            data={
              usage?.tokens ||
              analytics?.tokens ||
              []
            }
          />
        </div>
      </section>

      {/* Activity Section */}
      <section
        className="dashboard-activity"
        aria-label="Recent activity"
      >
        <div className="dashboard-activity__header">
          <div>
            <h2>Recent Activity</h2>

            <p>
              Latest events across your platform.
            </p>
          </div>
        </div>

        <ActivityFeed
          activities={
            analytics?.recentActivity ||
            analytics?.activities ||
            []
          }
        />
      </section>
    </main>
  );
}