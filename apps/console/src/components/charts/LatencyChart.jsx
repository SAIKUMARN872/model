"use client";

import React, { useMemo } from "react";

/**
 * Enterprise Latency Chart
 *
 * Responsibilities:
 * - Display latency trends
 * - Show average latency
 * - Show P50 / P95 / P99 latency
 * - Format latency in milliseconds
 * - Handle loading state
 * - Handle error state
 * - Handle empty state
 * - Provide accessible data summary
 *
 * Expected data:
 *
 * [
 *   {
 *     date: "2026-07-28",
 *     average: 420,
 *     p50: 350,
 *     p95: 780,
 *     p99: 1200
 *   }
 * ]
 *
 * Supported alternative field names:
 *
 * avgLatency
 * averageLatency
 * p50Latency
 * p95Latency
 * p99Latency
 */

export default function LatencyChart({
  data = [],
  loading = false,
  error = null,
  title = "Latency Overview",
  description =
    "Monitor API and model response latency over time.",
  height = 320,
}) {
  /**
   * Normalize incoming latency data.
   */
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map(
      (item, index) => {
        const average =
          Number(
            item?.average ??
              item?.avgLatency ??
              item?.averageLatency ??
              0
          ) || 0;

        const p50 =
          Number(
            item?.p50 ??
              item?.p50Latency ??
              0
          ) || 0;

        const p95 =
          Number(
            item?.p95 ??
              item?.p95Latency ??
              0
          ) || 0;

        const p99 =
          Number(
            item?.p99 ??
              item?.p99Latency ??
              0
          ) || 0;

        return {
          id:
            item?.id ||
            item?.date ||
            item?.timestamp ||
            index,

          label:
            item?.label ||
            item?.date ||
            item?.timestamp ||
            `Period ${index + 1}`,

          average,
          p50,
          p95,
          p99,
        };
      }
    );
  }, [data]);

  /**
   * Calculate maximum latency.
   */
  const maxLatency = useMemo(() => {
    if (
      chartData.length === 0
    ) {
      return 0;
    }

    return Math.max(
      ...chartData.flatMap(
        (item) => [
          item.average,
          item.p50,
          item.p95,
          item.p99,
        ]
      )
    );
  }, [chartData]);

  /**
   * Calculate summary metrics.
   */
  const summary = useMemo(() => {
    if (
      chartData.length === 0
    ) {
      return {
        average: 0,
        p50: 0,
        p95: 0,
        p99: 0,
      };
    }

    const average =
      chartData.reduce(
        (sum, item) =>
          sum + item.average,
        0
      ) / chartData.length;

    const p50 =
      chartData.reduce(
        (sum, item) =>
          sum + item.p50,
        0
      ) / chartData.length;

    const p95 =
      chartData.reduce(
        (sum, item) =>
          sum + item.p95,
        0
      ) / chartData.length;

    const p99 =
      chartData.reduce(
        (sum, item) =>
          sum + item.p99,
        0
      ) / chartData.length;

    return {
      average,
      p50,
      p95,
      p99,
    };
  }, [chartData]);

  /**
   * Format milliseconds.
   */
  const formatLatency = (
    value
  ) => {
    const numericValue =
      Number(value) || 0;

    if (
      numericValue >= 1000
    ) {
      return `${(
        numericValue / 1000
      ).toFixed(2)} s`;
    }

    return `${numericValue.toFixed(
      0
    )} ms`;
  };

  /**
   * Format date or chart label.
   */
  const formatLabel = (
    label
  ) => {
    if (!label) {
      return "";
    }

    const value =
      String(label);

    const isDate =
      /^\d{4}-\d{2}-\d{2}/.test(
        value
      );

    if (isDate) {
      const date =
        new Date(value);

      if (
        !Number.isNaN(
          date.getTime()
        )
      ) {
        return new Intl.DateTimeFormat(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
          }
        ).format(date);
      }
    }

    return value;
  };

  /**
   * Calculate bar height.
   */
  const getBarHeight = (
    value
  ) => {
    if (
      maxLatency <= 0 ||
      value <= 0
    ) {
      return 0;
    }

    return Math.max(
      (value /
        maxLatency) *
        100,
      2
    );
  };

  /**
   * Loading state.
   */
  if (loading) {
    return (
      <section
        className="latency-chart"
        aria-busy="true"
      >
        <header className="latency-chart-header">
          <div>
            <h2>
              {title}
            </h2>

            <p>
              {description}
            </p>
          </div>
        </header>

        <div
          className="latency-chart-loading"
          style={{
            minHeight: height,
          }}
        >
          <div className="latency-chart-spinner" />

          <span>
            Loading latency data...
          </span>
        </div>
      </section>
    );
  }

  /**
   * Error state.
   */
  if (error) {
    return (
      <section
        className="latency-chart"
        role="alert"
      >
        <header className="latency-chart-header">
          <div>
            <h2>
              {title}
            </h2>

            <p>
              {description}
            </p>
          </div>
        </header>

        <div
          className="latency-chart-error"
          style={{
            minHeight: height,
          }}
        >
          <strong>
            Unable to load latency data
          </strong>

          <p>
            {error?.message ||
              error ||
              "An unexpected error occurred."}
          </p>
        </div>
      </section>
    );
  }

  /**
   * Empty state.
   */
  if (
    chartData.length === 0
  ) {
    return (
      <section className="latency-chart">
        <header className="latency-chart-header">
          <div>
            <h2>
              {title}
            </h2>

            <p>
              {description}
            </p>
          </div>
        </header>

        <div
          className="latency-chart-empty"
          style={{
            minHeight: height,
          }}
        >
          <span className="latency-chart-empty-icon">
            ↯
          </span>

          <h3>
            No latency data available
          </h3>

          <p>
            Latency information will
            appear here once API
            requests have been processed.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="latency-chart">
      {/* ======================================
          Header
      ======================================= */}
      <header className="latency-chart-header">
        <div>
          <h2>
            {title}
          </h2>

          <p>
            {description}
          </p>
        </div>
      </header>

      {/* ======================================
          Summary Metrics
      ======================================= */}
      <div className="latency-summary">
        <div className="latency-summary-card">
          <span>
            Average
          </span>

          <strong>
            {formatLatency(
              summary.average
            )}
          </strong>
        </div>

        <div className="latency-summary-card">
          <span>
            P50
          </span>

          <strong>
            {formatLatency(
              summary.p50
            )}
          </strong>
        </div>

        <div className="latency-summary-card">
          <span>
            P95
          </span>

          <strong>
            {formatLatency(
              summary.p95
            )}
          </strong>
        </div>

        <div className="latency-summary-card">
          <span>
            P99
          </span>

          <strong>
            {formatLatency(
              summary.p99
            )}
          </strong>
        </div>
      </div>

      {/* ======================================
          Accessible Summary
      ======================================= */}
      <div className="latency-accessible-summary">
        <p>
          Average latency is{" "}
          <strong>
            {formatLatency(
              summary.average
            )}
          </strong>
          .
        </p>

        <p>
          P95 latency is{" "}
          <strong>
            {formatLatency(
              summary.p95
            )}
          </strong>{" "}
          and P99 latency is{" "}
          <strong>
            {formatLatency(
              summary.p99
            )}
          </strong>
          .
        </p>
      </div>

      {/* ======================================
          Chart
      ======================================= */}
      <div
        className="latency-chart-container"
        style={{
          minHeight: height,
        }}
        role="img"
        aria-label={`Latency chart showing ${chartData.length} data points`}
      >
        <div className="latency-chart-bars">
          {chartData.map(
            (item) => (
              <div
                key={item.id}
                className="latency-chart-group"
              >
                <div className="latency-chart-bars-inner">
                  {/* Average */}
                  <div className="latency-bar-wrapper">
                    <div className="latency-tooltip">
                      <strong>
                        Average
                      </strong>

                      <span>
                        {formatLatency(
                          item.average
                        )}
                      </span>
                    </div>

                    <div
                      className="latency-bar latency-bar--average"
                      style={{
                        height: `${getBarHeight(
                          item.average
                        )}%`,
                      }}
                      title={`Average: ${formatLatency(
                        item.average
                      )}`}
                    />
                  </div>

                  {/* P50 */}
                  <div className="latency-bar-wrapper">
                    <div className="latency-tooltip">
                      <strong>
                        P50
                      </strong>

                      <span>
                        {formatLatency(
                          item.p50
                        )}
                      </span>
                    </div>

                    <div
                      className="latency-bar latency-bar--p50"
                      style={{
                        height: `${getBarHeight(
                          item.p50
                        )}%`,
                      }}
                      title={`P50: ${formatLatency(
                        item.p50
                      )}`}
                    />
                  </div>

                  {/* P95 */}
                  <div className="latency-bar-wrapper">
                    <div className="latency-tooltip">
                      <strong>
                        P95
                      </strong>

                      <span>
                        {formatLatency(
                          item.p95
                        )}
                      </span>
                    </div>

                    <div
                      className="latency-bar latency-bar--p95"
                      style={{
                        height: `${getBarHeight(
                          item.p95
                        )}%`,
                      }}
                      title={`P95: ${formatLatency(
                        item.p95
                      )}`}
                    />
                  </div>

                  {/* P99 */}
                  <div className="latency-bar-wrapper">
                    <div className="latency-tooltip">
                      <strong>
                        P99
                      </strong>

                      <span>
                        {formatLatency(
                          item.p99
                        )}
                      </span>
                    </div>

                    <div
                      className="latency-bar latency-bar--p99"
                      style={{
                        height: `${getBarHeight(
                          item.p99
                        )}%`,
                      }}
                      title={`P99: ${formatLatency(
                        item.p99
                      )}`}
                    />
                  </div>
                </div>

                <span className="latency-chart-label">
                  {formatLabel(
                    item.label
                  )}
                </span>
              </div>
            )
          )}
        </div>
      </div>

      {/* ======================================
          Legend
      ======================================= */}
      <div className="latency-chart-legend">
        <span>
          <i className="latency-legend-marker latency-legend-marker--average" />
          Average
        </span>

        <span>
          <i className="latency-legend-marker latency-legend-marker--p50" />
          P50
        </span>

        <span>
          <i className="latency-legend-marker latency-legend-marker--p95" />
          P95
        </span>

        <span>
          <i className="latency-legend-marker latency-legend-marker--p99" />
          P99
        </span>
      </div>

      {/* ======================================
          Detailed Data
      ======================================= */}
      <details className="latency-chart-data">
        <summary>
          View detailed latency data
        </summary>

        <div className="latency-table-wrapper">
          <table className="latency-table">
            <thead>
              <tr>
                <th>
                  Period
                </th>

                <th>
                  Average
                </th>

                <th>
                  P50
                </th>

                <th>
                  P95
                </th>

                <th>
                  P99
                </th>
              </tr>
            </thead>

            <tbody>
              {chartData.map(
                (item) => (
                  <tr
                    key={`table-${item.id}`}
                  >
                    <td>
                      {formatLabel(
                        item.label
                      )}
                    </td>

                    <td>
                      {formatLatency(
                        item.average
                      )}
                    </td>

                    <td>
                      {formatLatency(
                        item.p50
                      )}
                    </td>

                    <td>
                      {formatLatency(
                        item.p95
                      )}
                    </td>

                    <td>
                      {formatLatency(
                        item.p99
                      )}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}