"use client";

import React, {
  useMemo,
} from "react";

/**
 * Enterprise Cost Chart
 *
 * Responsibilities:
 * - Display cost trends
 * - Support daily/monthly usage data
 * - Format currency using INR
 * - Handle loading state
 * - Handle error state
 * - Handle empty state
 * - Provide accessible summary
 *
 * Expected data:
 *
 * [
 *   {
 *     date: "2026-07-01",
 *     cost: 1250.50
 *   },
 *   {
 *     date: "2026-07-02",
 *     cost: 980.25
 *   }
 * ]
 *
 * Or:
 *
 * [
 *   {
 *     label: "July",
 *     value: 25000
 *   }
 * ]
 */

export default function CostChart({
  data = [],
  loading = false,
  error = null,
  title = "Cost Overview",
  description = "Monitor estimated AI infrastructure and model usage costs.",
  currency = "INR",
  height = 320,
}) {
  /**
   * Normalize chart data.
   */
  const chartData = useMemo(() => {
    if (
      !Array.isArray(data)
    ) {
      return [];
    }

    return data
      .map(
        (item, index) => {
          const rawValue =
            item?.cost ??
            item?.value ??
            item?.amount ??
            0;

          const numericValue =
            Number(
              rawValue
            );

          return {
            id:
              item?.id ||
              item?.date ||
              item?.label ||
              index,

            label:
              item?.label ||
              item?.date ||
              `Period ${index + 1}`,

            value:
              Number.isFinite(
                numericValue
              )
                ? numericValue
                : 0,
          };
        }
      );
  }, [data]);

  /**
   * Calculate maximum chart value.
   */
  const maxValue = useMemo(() => {
    if (
      chartData.length === 0
    ) {
      return 0;
    }

    return Math.max(
      ...chartData.map(
        (item) =>
          item.value
      )
    );
  }, [chartData]);

  /**
   * Calculate total cost.
   */
  const totalCost = useMemo(() => {
    return chartData.reduce(
      (
        total,
        item
      ) =>
        total +
        item.value,
      0
    );
  }, [chartData]);

  /**
   * Calculate average cost.
   */
  const averageCost = useMemo(() => {
    if (
      chartData.length === 0
    ) {
      return 0;
    }

    return (
      totalCost /
      chartData.length
    );
  }, [
    chartData.length,
    totalCost,
  ]);

  /**
   * Find highest cost period.
   */
  const highestCost = useMemo(() => {
    if (
      chartData.length === 0
    ) {
      return null;
    }

    return chartData.reduce(
      (
        highest,
        current
      ) =>
        current.value >
        highest.value
          ? current
          : highest
    );
  }, [chartData]);

  /**
   * Currency formatter.
   */
  const formatCurrency = (
    value
  ) => {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }
    ).format(
      Number(value) || 0
    );
  };

  /**
   * Format chart label.
   */
  const formatLabel = (
    label
  ) => {
    if (!label) {
      return "";
    }

    const parsedDate =
      new Date(label);

    if (
      !Number.isNaN(
        parsedDate.getTime()
      ) &&
      /^\d{4}-\d{2}-\d{2}/.test(
        String(label)
      )
    ) {
      return new Intl.DateTimeFormat(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
        }
      ).format(parsedDate);
    }

    return String(label);
  };

  /**
   * Loading state.
   */
  if (loading) {
    return (
      <section
        className="cost-chart"
        aria-busy="true"
      >
        <header className="cost-chart-header">
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
          className="cost-chart-loading"
          style={{
            minHeight: height,
          }}
        >
          <div className="cost-chart-spinner" />

          <span>
            Loading cost data...
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
        className="cost-chart"
        role="alert"
      >
        <header className="cost-chart-header">
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
          className="cost-chart-error"
          style={{
            minHeight: height,
          }}
        >
          <strong>
            Unable to load cost data
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
      <section className="cost-chart">
        <header className="cost-chart-header">
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
          className="cost-chart-empty"
          style={{
            minHeight: height,
          }}
        >
          <span className="cost-chart-empty-icon">
            ₹
          </span>

          <h3>
            No cost data available
          </h3>

          <p>
            Cost information will
            appear here once usage
            data is available.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="cost-chart">
      {/* ======================================
          Header
      ======================================= */}
      <header className="cost-chart-header">
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
      <div className="cost-chart-summary">
        <div className="cost-summary-card">
          <span>
            Total Cost
          </span>

          <strong>
            {formatCurrency(
              totalCost
            )}
          </strong>
        </div>

        <div className="cost-summary-card">
          <span>
            Average
          </span>

          <strong>
            {formatCurrency(
              averageCost
            )}
          </strong>
        </div>

        <div className="cost-summary-card">
          <span>
            Peak Cost
          </span>

          <strong>
            {formatCurrency(
              highestCost?.value ||
                0
            )}
          </strong>
        </div>
      </div>

      {/* ======================================
          Accessible Summary
      ======================================= */}
      <div className="cost-chart-accessible-summary">
        <p>
          Total cost for the selected
          period is{" "}
          <strong>
            {formatCurrency(
              totalCost
            )}
          </strong>
          .
        </p>

        {highestCost && (
          <p>
            The highest cost occurred
            during{" "}
            <strong>
              {formatLabel(
                highestCost.label
              )}
            </strong>{" "}
            at{" "}
            <strong>
              {formatCurrency(
                highestCost.value
              )}
            </strong>
            .
          </p>
        )}
      </div>

      {/* ======================================
          Chart
      ======================================= */}
      <div
        className="cost-chart-container"
        style={{
          minHeight: height,
        }}
        role="img"
        aria-label={`Cost chart showing ${chartData.length} data points`}
      >
        <div className="cost-chart-bars">
          {chartData.map(
            (item) => {
              const percentage =
                maxValue > 0
                  ? (item.value /
                      maxValue) *
                    100
                  : 0;

              return (
                <div
                  key={
                    item.id
                  }
                  className="cost-chart-bar-wrapper"
                >
                  <div className="cost-chart-tooltip">
                    <strong>
                      {formatCurrency(
                        item.value
                      )}
                    </strong>

                    <span>
                      {formatLabel(
                        item.label
                      )}
                    </span>
                  </div>

                  <div
                    className="cost-chart-bar"
                    style={{
                      height: `${Math.max(
                        percentage,
                        item.value >
                          0
                          ? 2
                          : 0
                      )}%`,
                    }}
                    aria-label={`${formatLabel(
                      item.label
                    )}: ${formatCurrency(
                      item.value
                    )}`}
                    title={`${formatLabel(
                      item.label
                    )}: ${formatCurrency(
                      item.value
                    )}`}
                  />

                  <span className="cost-chart-label">
                    {formatLabel(
                      item.label
                    )}
                  </span>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* ======================================
          Data Table
      ======================================= */}
      <details className="cost-chart-data">
        <summary>
          View detailed cost data
        </summary>

        <div className="cost-chart-table-wrapper">
          <table className="cost-chart-table">
            <thead>
              <tr>
                <th>
                  Period
                </th>

                <th>
                  Cost
                </th>

                <th>
                  Percentage of Total
                </th>
              </tr>
            </thead>

            <tbody>
              {chartData.map(
                (item) => {
                  const percentage =
                    totalCost > 0
                      ? (item.value /
                          totalCost) *
                        100
                      : 0;

                  return (
                    <tr
                      key={
                        `table-${item.id}`
                      }
                    >
                      <td>
                        {formatLabel(
                          item.label
                        )}
                      </td>

                      <td>
                        {formatCurrency(
                          item.value
                        )}
                      </td>

                      <td>
                        {percentage.toFixed(
                          2
                        )}
                        %
                      </td>
                    </tr>
                  );
                }
              )}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}