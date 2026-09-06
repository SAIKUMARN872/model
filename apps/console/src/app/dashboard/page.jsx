"use client";

import React, { useMemo, useState } from "react";

import useAnalytics from "../../hooks/analytics/useAnalytics";
import useUsage from "../../hooks/useUsage";
import useCost from "../../hooks/cost/useCost";
import useLatency from "../../hooks/latency/useLatency";

import Spinner from "../../components/loading/Spinner";
import KpiCard from "../../components/widgets/KpiCard";
import MetricCard from "../../components/widgets/MetricCard";
import ActivityFeed from "../../components/widgets/ActivityFeed";

import UsageChart from "../../components/usage-chart/UsageChart";
import CostChart from "../../components/charts/CostChart";
import LatencyChart from "../../components/charts/LatencyChart";
import TokenChart from "../../components/charts/TokenChart";

/**
 * Enterprise Console Dashboard
 *
 * Route:
 * /dashboard
 *
 * Responsibilities:
 * - Platform overview
 * - Request analytics
 * - Token usage
 * - Cost monitoring
 * - Latency monitoring
 * - Error rate monitoring
 * - Active models
 * - Active agents
 * - Active users
 * - Recent platform activity
 */
export default function DashboardPage() {
  const [timeRange, setTimeRange] = useState("7d");

  /**
   * Analytics data
   */
  const analyticsQuery = useAnalytics({
    range: timeRange,
  });

  /**
   * Usage data
   */
  const usageQuery = useUsage({
    range: timeRange,
  });

  /**
   * Cost data
   */
  const costQuery = useCost({
    range: timeRange,
  });

  /**
   * Latency data
   */
  const latencyQuery = useLatency({
    range: timeRange,
  });

  const analytics =
    analyticsQuery?.data || {};

  const usage =
    usageQuery?.data || {};

  const cost =
    costQuery?.data || {};

  const latency =
    latencyQuery?.data || {};

  /**
   * Loading state.
   */
  const loading =
    analyticsQuery?.loading ||
    usageQuery?.loading ||
    costQuery?.loading ||
    latencyQuery?.loading;

  /**
   * Error state.
   */
  const error =
    analyticsQuery?.error ||
    usageQuery?.error ||
    costQuery?.error ||
    latencyQuery?.error;

  /**
   * Refresh all dashboard resources.
   */
  const handleRefresh = async () => {
    const requests = [
      analyticsQuery?.refetch,
      usageQuery?.refetch,
      costQuery?.refetch,
      latencyQuery?.refetch,
    ].filter(
      (refetch) =>
        typeof refetch === "function"
    );

    await Promise.allSettled(
      requests.map((refetch) => refetch())
    );
  };

  /**
   * Normalize dashboard metrics.
   */
  const metrics = useMemo(() => {
    return {
      totalRequests:
        analytics.totalRequests ??
        usage.totalRequests ??
        usage.requests ??
        0,

      totalTokens:
        analytics.totalTokens ??
        usage.totalTokens ??
        0,

      totalCost:
        analytics.totalCost ??
        cost.totalCost ??
        cost.currentSpend ??
        0,

      averageLatency:
        analytics.averageLatency ??
        latency.averageLatency ??
        latency.avgLatency ??
        0,

      errorRate:
        analytics.errorRate ??
        analytics.errorsRate ??
        0,

      activeModels:
        analytics.activeModels ??
        0,

      activeAgents:
        analytics.activeAgents ??
        0,

      activeUsers:
        analytics.activeUsers ??
        0,
    };
  }, [
    analytics,
    usage,
    cost,
    latency,
  ]);

  /**
   * Format currency.
   */
  const formatCurrency = (value) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }
    ).format(Number(value) || 0);
  };

  /**
   * Determine error status.
   */
  const errorStatus = useMemo(() => {
    if (metrics.errorRate >= 5) {
      return "critical";
    }

    if (metrics.errorRate >= 2) {
      return "warning";
    }

    return "healthy";
  }, [metrics.errorRate]);

  /**
   * Determine latency status.
   */
  const latencyStatus = useMemo(() => {
    if (metrics.averageLatency >= 2000) {
      return "critical";
    }

    if (metrics.averageLatency >= 1000) {
      return "warning";
    }

    return "healthy";
  }, [metrics.averageLatency]);

  /**
   * Chart data normalization.
   */
  const usageChartData =
    usage.requests ||
    usage.history ||
    usage.data ||
    [];

  const costChartData =
    cost.history ||
    cost.data ||
    [];

  const latencyChartData =
    latency.history ||
    latency.data ||
    [];

  const tokenChartData =
    usage.tokens ||
    analytics.tokens ||
    [];

  /**
   * Activity normalization.
   */
  const recentActivity =
    analytics.recentActivity ||
    analytics.activities ||
    [];

  /**
   * Initial loading state.
   */
  if (loading && !analyticsQuery?.data) {
    return (
      <main
        className="console-dashboard"
        aria-label="Dashboard"
      >
        <div className="dashboard-loading">
          <Spinner />

          <p>
            Loading dashboard...
          </p>
        </div>
      </main>
    );
  }

  /**
   * Error state.
   */
  if (error && !analyticsQuery?.data) {
    return (
      <main
        className="console-dashboard"
        aria-label="Dashboard"
      >
        <section className="dashboard-error">
          <div className="dashboard-error__content">
            <h1>
              Unable to load dashboard
            </h1>

            <p>
              We couldn't retrieve the latest
              platform metrics.
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
      {/* ========================================
          Dashboard Header
      ========================================= */}
      <header className="dashboard-header">
        <div className="dashboard-header__content">
          <div>
            <h1>
              Dashboard
            </h1>

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
              Select dashboard time range
            </label>

            <select
              id="dashboard-time-range"
              value={timeRange}
              onChange={(event) =>
                setTimeRange(
                  event.target.value
                )
              }
              className="dashboard-select"
            >
              <option value="24h">
                Last 24 Hours
              </option>

              <option value="7d">
                Last 7 Days
              </option>

              <option value="30d">
                Last 30 Days
              </option>

              <option value="90d">
                Last 90 Days
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

      {/* ========================================
          KPI Cards
      ========================================= */}
      <section
        className="dashboard-kpi-grid"
        aria-label="Key Performance Indicators"
      >
        <KpiCard
          title="Total Requests"
          value={metrics.totalRequests}
          trend={
            analytics.requestTrend ??
            analytics.requestsTrend
          }
          description={`Requests in ${timeRange}`}
        />

        <KpiCard
          title="Total Tokens"
          value={metrics.totalTokens}
          trend={
            analytics.tokenTrend
          }
          description="Tokens processed"
        />

        <KpiCard
          title="Total Cost"
          value={formatCurrency(
            metrics.totalCost
          )}
          trend={
            cost.costTrend
          }
          description="Estimated platform cost"
        />

        <KpiCard
          title="Average Latency"
          value={`${Number(
            metrics.averageLatency
          ).toFixed(0)} ms`}
          trend={
            latency.latencyTrend
          }
          description="Average API response time"
        />
      </section>

      {/* ========================================
          Operational Metrics
      ========================================= */}
      <section
        className="dashboard-metrics-grid"
        aria-label="Operational Metrics"
      >
        <MetricCard
          title="Error Rate"
          value={`${Number(
            metrics.errorRate
          ).toFixed(2)}%`}
          status={errorStatus}
        />

        <MetricCard
          title="Average Latency"
          value={`${Number(
            metrics.averageLatency
          ).toFixed(0)} ms`}
          status={latencyStatus}
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

      {/* ========================================
          Analytics Charts
      ========================================= */}
      <section
        className="dashboard-chart-grid"
        aria-label="Platform Analytics"
      >
        {/* Usage */}
        <article className="dashboard-chart-card">
          <header className="dashboard-chart-card__header">
            <div>
              <h2>
                Usage Overview
              </h2>

              <p>
                Monitor request activity
                over time.
              </p>
            </div>
          </header>

          <UsageChart
            data={usageChartData}
          />
        </article>

        {/* Cost */}
        <article className="dashboard-chart-card">
          <header className="dashboard-chart-card__header">
            <div>
              <h2>
                Cost Analysis
              </h2>

              <p>
                Track platform spending
                over time.
              </p>
            </div>
          </header>

          <CostChart
            data={costChartData}
          />
        </article>

        {/* Latency */}
        <article className="dashboard-chart-card">
          <header className="dashboard-chart-card__header">
            <div>
              <h2>
                Latency Performance
              </h2>

              <p>
                Monitor API response
                performance.
              </p>
            </div>
          </header>

          <LatencyChart
            data={latencyChartData}
          />
        </article>

        {/* Tokens */}
        <article className="dashboard-chart-card">
          <header className="dashboard-chart-card__header">
            <div>
              <h2>
                Token Consumption
              </h2>

              <p>
                Monitor input and output
                token usage.
              </p>
            </div>
          </header>

          <TokenChart
            data={tokenChartData}
          />
        </article>
      </section>

      {/* ========================================
          Recent Activity
      ========================================= */}
      <section
        className="dashboard-activity"
        aria-label="Recent Activity"
      >
        <header className="dashboard-activity__header">
          <div>
            <h2>
              Recent Activity
            </h2>

            <p>
              Latest events across your
              AI platform.
            </p>
          </div>
        </header>

        <ActivityFeed
          activities={recentActivity}
        />
      </section>
    </main>
  );
}