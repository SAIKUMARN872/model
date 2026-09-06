"use client";

import React, { useMemo, useState } from "react";

import useUsage from "../../hooks/useUsage";

import UsageChart from "../../components/usage-chart/UsageChart";
import Spinner from "../../components/loading/Spinner";

/**
 * Enterprise Usage Analytics Page
 *
 * Route:
 * /usage
 *
 * Responsibilities:
 * - Display usage KPIs
 * - Track API requests
 * - Track input/output tokens
 * - Display estimated costs
 * - Display model-level usage
 * - Filter usage by date range
 * - Display usage trends
 * - Handle loading and error states
 */
export default function UsagePage() {
  const [dateRange, setDateRange] =
    useState("30d");

  const [modelFilter, setModelFilter] =
    useState("all");

  const {
    data,
    loading,
    error,
    refetch,
  } = useUsage({
    range: dateRange,
    model:
      modelFilter === "all"
        ? undefined
        : modelFilter,
  });

  /**
   * Normalize API response.
   */
  const usage = useMemo(() => {
    return (
      data?.usage ||
      data?.data ||
      data ||
      {}
    );
  }, [data]);

  /**
   * Normalize usage metrics.
   */
  const metrics = useMemo(() => {
    return {
      totalRequests:
        usage?.totalRequests ||
        usage?.requests ||
        0,

      inputTokens:
        usage?.inputTokens ||
        usage?.promptTokens ||
        0,

      outputTokens:
        usage?.outputTokens ||
        usage?.completionTokens ||
        0,

      totalTokens:
        usage?.totalTokens ||
        0,

      estimatedCost:
        usage?.estimatedCost ||
        usage?.cost ||
        0,

      averageLatency:
        usage?.averageLatency ||
        usage?.avgLatency ||
        0,

      errorRate:
        usage?.errorRate ||
        0,
    };
  }, [usage]);

  /**
   * Calculate total tokens if
   * backend doesn't provide it.
   */
  const totalTokens =
    metrics.totalTokens ||
    metrics.inputTokens +
      metrics.outputTokens;

  /**
   * Normalize usage timeline.
   */
  const usageTimeline = useMemo(() => {
    return (
      usage?.timeline ||
      usage?.history ||
      usage?.dailyUsage ||
      []
    );
  }, [usage]);

  /**
   * Normalize model breakdown.
   */
  const modelBreakdown = useMemo(() => {
    return (
      usage?.models ||
      usage?.modelBreakdown ||
      []
    );
  }, [usage]);

  /**
   * Extract unique model names.
   */
  const models = useMemo(() => {
    const names =
      modelBreakdown
        .map(
          (item) =>
            item?.model ||
            item?.modelName ||
            item?.name
        )
        .filter(Boolean);

    return [
      ...new Set(names),
    ];
  }, [modelBreakdown]);

  /**
   * Format numbers.
   */
  const formatNumber = (
    value
  ) => {
    return new Intl.NumberFormat(
      "en-IN"
    ).format(
      Number(value) || 0
    );
  };

  /**
   * Format currency.
   */
  const formatCurrency = (
    value
  ) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2,
      }
    ).format(
      Number(value) || 0
    );
  };

  /**
   * Format percentage.
   */
  const formatPercentage = (
    value
  ) => {
    return `${(
      Number(value) || 0
    ).toFixed(2)}%`;
  };

  /**
   * Format latency.
   */
  const formatLatency = (
    value
  ) => {
    return `${(
      Number(value) || 0
    ).toFixed(0)} ms`;
  };

  /**
   * Loading state.
   */
  if (
    loading &&
    !data
  ) {
    return (
      <main
        className="console-usage"
        aria-label="Usage Analytics"
      >
        <div className="usage-loading">
          <Spinner />

          <p>
            Loading usage analytics...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className="console-usage"
      aria-label="Usage Analytics"
    >
      {/* ========================================
          Page Header
      ========================================= */}
      <header className="usage-header">
        <div>
          <h1>
            Usage
          </h1>

          <p>
            Monitor API activity, token
            consumption, model usage, and
            estimated costs.
          </p>
        </div>

        <div className="usage-header-actions">
          <select
            value={dateRange}
            onChange={(event) =>
              setDateRange(
                event.target.value
              )
            }
            aria-label="Usage date range"
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

            <option value="1y">
              Last Year
            </option>
          </select>

          <button
            type="button"
            onClick={() =>
              refetch?.()
            }
            disabled={loading}
            className="usage-refresh-button"
          >
            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>
      </header>

      {/* ========================================
          Error State
      ========================================= */}
      {error && (
        <div
          className="usage-error"
          role="alert"
        >
          <strong>
            Unable to load usage data
          </strong>

          <p>
            {error?.message ||
              "An unexpected error occurred."}
          </p>

          <button
            type="button"
            onClick={() =>
              refetch?.()
            }
          >
            Try Again
          </button>
        </div>
      )}

      {/* ========================================
          KPI Cards
      ========================================= */}
      <section
        className="usage-kpi-grid"
        aria-label="Usage overview"
      >
        <div className="usage-kpi-card">
          <span className="usage-kpi-label">
            Total Requests
          </span>

          <strong className="usage-kpi-value">
            {formatNumber(
              metrics.totalRequests
            )}
          </strong>

          <span className="usage-kpi-description">
            API requests
          </span>
        </div>

        <div className="usage-kpi-card">
          <span className="usage-kpi-label">
            Total Tokens
          </span>

          <strong className="usage-kpi-value">
            {formatNumber(
              totalTokens
            )}
          </strong>

          <span className="usage-kpi-description">
            Input + output tokens
          </span>
        </div>

        <div className="usage-kpi-card">
          <span className="usage-kpi-label">
            Estimated Cost
          </span>

          <strong className="usage-kpi-value">
            {formatCurrency(
              metrics.estimatedCost
            )}
          </strong>

          <span className="usage-kpi-description">
            Estimated usage cost
          </span>
        </div>

        <div className="usage-kpi-card">
          <span className="usage-kpi-label">
            Average Latency
          </span>

          <strong className="usage-kpi-value">
            {formatLatency(
              metrics.averageLatency
            )}
          </strong>

          <span className="usage-kpi-description">
            Average API response time
          </span>
        </div>

        <div className="usage-kpi-card">
          <span className="usage-kpi-label">
            Error Rate
          </span>

          <strong className="usage-kpi-value">
            {formatPercentage(
              metrics.errorRate
            )}
          </strong>

          <span className="usage-kpi-description">
            Failed requests
          </span>
        </div>
      </section>

      {/* ========================================
          Token Summary
      ========================================= */}
      <section className="usage-token-summary">
        <div className="usage-section-header">
          <div>
            <h2>
              Token Consumption
            </h2>

            <p>
              Breakdown of input and output
              token usage.
            </p>
          </div>
        </div>

        <div className="usage-token-grid">
          <div className="usage-token-card">
            <span>
              Input Tokens
            </span>

            <strong>
              {formatNumber(
                metrics.inputTokens
              )}
            </strong>
          </div>

          <div className="usage-token-card">
            <span>
              Output Tokens
            </span>

            <strong>
              {formatNumber(
                metrics.outputTokens
              )}
            </strong>
          </div>

          <div className="usage-token-card">
            <span>
              Total Tokens
            </span>

            <strong>
              {formatNumber(
                totalTokens
              )}
            </strong>
          </div>
        </div>
      </section>

      {/* ========================================
          Usage Trend Chart
      ========================================= */}
      <section className="usage-chart-section">
        <div className="usage-section-header">
          <div>
            <h2>
              Usage Trend
            </h2>

            <p>
              Monitor usage activity over
              the selected time period.
            </p>
          </div>
        </div>

        <div className="usage-chart-container">
          {usageTimeline.length >
          0 ? (
            <UsageChart
              data={
                usageTimeline
              }
            />
          ) : (
            <div className="usage-empty-chart">
              <p>
                No usage data available
                for this period.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ========================================
          Model Usage
      ========================================= */}
      <section className="usage-model-section">
        <div className="usage-section-header">
          <div>
            <h2>
              Model Usage
            </h2>

            <p>
              Analyze usage and cost by
              individual AI model.
            </p>
          </div>

          <select
            value={
              modelFilter
            }
            onChange={(event) =>
              setModelFilter(
                event.target.value
              )
            }
            aria-label="Filter by model"
          >
            <option value="all">
              All Models
            </option>

            {models.map(
              (model) => (
                <option
                  key={model}
                  value={model}
                >
                  {model}
                </option>
              )
            )}
          </select>
        </div>

        {modelBreakdown.length >
        0 ? (
          <div className="usage-model-table-container">
            <table className="usage-model-table">
              <thead>
                <tr>
                  <th>
                    Model
                  </th>

                  <th>
                    Requests
                  </th>

                  <th>
                    Input Tokens
                  </th>

                  <th>
                    Output Tokens
                  </th>

                  <th>
                    Total Tokens
                  </th>

                  <th>
                    Estimated Cost
                  </th>

                  <th>
                    Average Latency
                  </th>
                </tr>
              </thead>

              <tbody>
                {modelBreakdown.map(
                  (
                    model,
                    index
                  ) => {
                    const inputTokens =
                      model?.inputTokens ||
                      model?.promptTokens ||
                      0;

                    const outputTokens =
                      model?.outputTokens ||
                      model?.completionTokens ||
                      0;

                    const totalModelTokens =
                      model?.totalTokens ||
                      inputTokens +
                        outputTokens;

                    return (
                      <tr
                        key={
                          model?.modelId ||
                          model?.model ||
                          index
                        }
                      >
                        <td>
                          <strong>
                            {model?.model ||
                              model?.modelName ||
                              model?.name ||
                              "Unknown"}
                          </strong>
                        </td>

                        <td>
                          {formatNumber(
                            model?.requests ||
                              0
                          )}
                        </td>

                        <td>
                          {formatNumber(
                            inputTokens
                          )}
                        </td>

                        <td>
                          {formatNumber(
                            outputTokens
                          )}
                        </td>

                        <td>
                          {formatNumber(
                            totalModelTokens
                          )}
                        </td>

                        <td>
                          {formatCurrency(
                            model?.cost ||
                              model?.estimatedCost ||
                              0
                          )}
                        </td>

                        <td>
                          {formatLatency(
                            model?.averageLatency ||
                              model?.avgLatency ||
                              0
                          )}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="usage-empty">
            <h3>
              No model usage data
            </h3>

            <p>
              Model-level usage will
              appear here once requests
              have been processed.
            </p>
          </div>
        )}
      </section>

      {/* ========================================
          Usage Footer
      ========================================= */}
      <footer className="usage-footer">
        <p>
          Usage data is based on the
          selected reporting period and
          may be delayed depending on
          backend processing.
        </p>
      </footer>
    </main>
  );
}