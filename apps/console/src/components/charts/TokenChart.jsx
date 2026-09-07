"use client";

import React, { useMemo } from "react";

/**
 * Enterprise Token Usage Chart
 *
 * Responsibilities:
 * - Display input token usage
 * - Display output token usage
 * - Display total token usage
 * - Calculate token utilization
 * - Handle loading state
 * - Handle error state
 * - Handle empty state
 * - Provide accessible summaries
 *
 * Expected data:
 *
 * [
 *   {
 *     date: "2026-07-25",
 *     inputTokens: 12000,
 *     outputTokens: 5000
 *   }
 * ]
 *
 * Supported alternative fields:
 *
 * input
 * inputTokenCount
 * promptTokens
 *
 * output
 * outputTokenCount
 * completionTokens
 */

export default function TokenChart({
  data = [],
  loading = false,
  error = null,
  title = "Token Usage",
  description =
    "Monitor input and output token consumption across your AI workloads.",
  height = 320,
}) {
  /**
   * Normalize incoming token data.
   */
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map(
      (item, index) => {
        const inputTokens =
          Number(
            item?.inputTokens ??
              item?.input ??
              item?.inputTokenCount ??
              item?.promptTokens ??
              0
          ) || 0;

        const outputTokens =
          Number(
            item?.outputTokens ??
              item?.output ??
              item?.outputTokenCount ??
              item?.completionTokens ??
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

          inputTokens,

          outputTokens,

          totalTokens:
            inputTokens +
            outputTokens,
        };
      }
    );
  }, [data]);

  /**
   * Calculate maximum token value.
   */
  const maxTokens = useMemo(() => {
    if (
      chartData.length === 0
    ) {
      return 0;
    }

    return Math.max(
      ...chartData.map(
        (item) =>
          item.totalTokens
      )
    );
  }, [chartData]);

  /**
   * Calculate overall token summary.
   */
  const summary = useMemo(() => {
    return chartData.reduce(
      (
        result,
        item
      ) => {
        result.input +=
          item.inputTokens;

        result.output +=
          item.outputTokens;

        result.total +=
          item.totalTokens;

        return result;
      },
      {
        input: 0,
        output: 0,
        total: 0,
      }
    );
  }, [chartData]);

  /**
   * Calculate input token percentage.
   */
  const inputPercentage =
    summary.total > 0
      ? (summary.input /
          summary.total) *
        100
      : 0;

  /**
   * Calculate output token percentage.
   */
  const outputPercentage =
    summary.total > 0
      ? (summary.output /
          summary.total) *
        100
      : 0;

  /**
   * Format large token numbers.
   *
   * Examples:
   * 1000     -> 1K
   * 1000000  -> 1M
   * 1000000000 -> 1B
   */
  const formatTokens = (
    value
  ) => {
    const numericValue =
      Number(value) || 0;

    if (
      numericValue >=
      1_000_000_000
    ) {
      return `${(
        numericValue /
        1_000_000_000
      ).toFixed(2)}B`;
    }

    if (
      numericValue >=
      1_000_000
    ) {
      return `${(
        numericValue /
        1_000_000
      ).toFixed(2)}M`;
    }

    if (
      numericValue >=
      1_000
    ) {
      return `${(
        numericValue /
        1_000
      ).toFixed(2)}K`;
    }

    return numericValue.toLocaleString(
      "en-IN"
    );
  };

  /**
   * Format exact token count.
   */
  const formatExactTokens = (
    value
  ) => {
    return (
      Number(value) || 0
    ).toLocaleString(
      "en-IN"
    );
  };

  /**
   * Format chart labels.
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
      maxTokens <= 0 ||
      value <= 0
    ) {
      return 0;
    }

    return Math.max(
      (value /
        maxTokens) *
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
        className="token-chart"
        aria-busy="true"
      >
        <header className="token-chart-header">
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
          className="token-chart-loading"
          style={{
            minHeight: height,
          }}
        >
          <div className="token-chart-spinner" />

          <span>
            Loading token usage data...
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
        className="token-chart"
        role="alert"
      >
        <header className="token-chart-header">
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
          className="token-chart-error"
          style={{
            minHeight: height,
          }}
        >
          <strong>
            Unable to load token usage
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
      <section className="token-chart">
        <header className="token-chart-header">
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
          className="token-chart-empty"
          style={{
            minHeight: height,
          }}
        >
          <span className="token-chart-empty-icon">
            T
          </span>

          <h3>
            No token usage data
          </h3>

          <p>
            Token consumption will
            appear here once AI
            requests are processed.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="token-chart">
      {/* ======================================
          Header
      ======================================= */}
      <header className="token-chart-header">
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
          Summary Cards
      ======================================= */}
      <div className="token-summary">
        <div className="token-summary-card">
          <span>
            Total Tokens
          </span>

          <strong>
            {formatTokens(
              summary.total
            )}
          </strong>

          <small>
            {formatExactTokens(
              summary.total
            )}
          </small>
        </div>

        <div className="token-summary-card">
          <span>
            Input Tokens
          </span>

          <strong>
            {formatTokens(
              summary.input
            )}
          </strong>

          <small>
            {inputPercentage.toFixed(
              1
            )}
            % of total
          </small>
        </div>

        <div className="token-summary-card">
          <span>
            Output Tokens
          </span>

          <strong>
            {formatTokens(
              summary.output
            )}
          </strong>

          <small>
            {outputPercentage.toFixed(
              1
            )}
            % of total
          </small>
        </div>
      </div>

      {/* ======================================
          Accessible Summary
      ======================================= */}
      <div className="token-accessible-summary">
        <p>
          Total token usage is{" "}
          <strong>
            {formatExactTokens(
              summary.total
            )}
          </strong>{" "}
          tokens.
        </p>

        <p>
          Input usage is{" "}
          <strong>
            {formatExactTokens(
              summary.input
            )}
          </strong>{" "}
          tokens and output usage is{" "}
          <strong>
            {formatExactTokens(
              summary.output
            )}
          </strong>{" "}
          tokens.
        </p>
      </div>

      {/* ======================================
          Chart
      ======================================= */}
      <div
        className="token-chart-container"
        style={{
          minHeight: height,
        }}
        role="img"
        aria-label={`Token usage chart showing ${chartData.length} data points`}
      >
        <div className="token-chart-bars">
          {chartData.map(
            (item) => (
              <div
                key={item.id}
                className="token-chart-group"
              >
                <div className="token-chart-bars-inner">
                  {/* Input Tokens */}
                  <div className="token-bar-wrapper">
                    <div className="token-tooltip">
                      <strong>
                        Input Tokens
                      </strong>

                      <span>
                        {formatExactTokens(
                          item.inputTokens
                        )}
                      </span>
                    </div>

                    <div
                      className="token-bar token-bar--input"
                      style={{
                        height: `${getBarHeight(
                          item.inputTokens
                        )}%`,
                      }}
                      title={`Input tokens: ${formatExactTokens(
                        item.inputTokens
                      )}`}
                    />
                  </div>

                  {/* Output Tokens */}
                  <div className="token-bar-wrapper">
                    <div className="token-tooltip">
                      <strong>
                        Output Tokens
                      </strong>

                      <span>
                        {formatExactTokens(
                          item.outputTokens
                        )}
                      </span>
                    </div>

                    <div
                      className="token-bar token-bar--output"
                      style={{
                        height: `${getBarHeight(
                          item.outputTokens
                        )}%`,
                      }}
                      title={`Output tokens: ${formatExactTokens(
                        item.outputTokens
                      )}`}
                    />
                  </div>
                </div>

                <span className="token-chart-label">
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
      <div className="token-chart-legend">
        <span>
          <i className="token-legend-marker token-legend-marker--input" />
          Input Tokens
        </span>

        <span>
          <i className="token-legend-marker token-legend-marker--output" />
          Output Tokens
        </span>
      </div>

      {/* ======================================
          Detailed Data
      ======================================= */}
      <details className="token-chart-data">
        <summary>
          View detailed token usage
        </summary>

        <div className="token-table-wrapper">
          <table className="token-table">
            <thead>
              <tr>
                <th>
                  Period
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
                  Input %
                </th>

                <th>
                  Output %
                </th>
              </tr>
            </thead>

            <tbody>
              {chartData.map(
                (item) => {
                  const itemInputPercentage =
                    item.totalTokens >
                    0
                      ? (item.inputTokens /
                          item.totalTokens) *
                        100
                      : 0;

                  const itemOutputPercentage =
                    item.totalTokens >
                    0
                      ? (item.outputTokens /
                          item.totalTokens) *
                        100
                      : 0;

                  return (
                    <tr
                      key={`table-${item.id}`}
                    >
                      <td>
                        {formatLabel(
                          item.label
                        )}
                      </td>

                      <td>
                        {formatExactTokens(
                          item.inputTokens
                        )}
                      </td>

                      <td>
                        {formatExactTokens(
                          item.outputTokens
                        )}
                      </td>

                      <td>
                        {formatExactTokens(
                          item.totalTokens
                        )}
                      </td>

                      <td>
                        {itemInputPercentage.toFixed(
                          1
                        )}
                        %
                      </td>

                      <td>
                        {itemOutputPercentage.toFixed(
                          1
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