"use client";

import React, { useEffect, useMemo, useState } from "react";

import useBilling from "../../hooks/useBilling";

import Spinner from "../../components/loading/Spinner";
import MetricCard from "../../components/widgets/MetricCard";

/**
 * Enterprise Billing Page
 *
 * Responsibilities:
 * - Display current billing summary
 * - Display current plan
 * - Display usage and spending
 * - Display payment status
 * - Display billing history
 * - Display invoices
 * - Handle loading and error states
 * - Support billing period selection
 */
export default function BillingPage() {
  const [billingPeriod, setBillingPeriod] =
    useState("current");

  const {
    data: billing,
    loading,
    error,
    refetch,
  } = useBilling({
    period: billingPeriod,
  });

  /**
   * Normalize billing data.
   *
   * This protects the UI if the API returns
   * incomplete or optional billing fields.
   */
  const billingData = useMemo(() => {
    return {
      plan:
        billing?.plan ||
        billing?.subscription?.plan ||
        "Free",

      status:
        billing?.status ||
        billing?.subscription?.status ||
        "active",

      currency:
        billing?.currency ||
        "INR",

      currentSpend:
        Number(
          billing?.currentSpend ??
            billing?.usage?.cost ??
            0
        ),

      monthlyLimit:
        Number(
          billing?.monthlyLimit ??
            billing?.plan?.monthlyLimit ??
            0
        ),

      totalRequests:
        Number(
          billing?.totalRequests ??
            billing?.usage?.requests ??
            0
        ),

      totalTokens:
        Number(
          billing?.totalTokens ??
            billing?.usage?.tokens ??
            0
        ),

      invoices:
        billing?.invoices ||
        billing?.billingHistory ||
        [],

      paymentMethod:
        billing?.paymentMethod ||
        null,

      nextBillingDate:
        billing?.nextBillingDate ||
        billing?.subscription?.nextBillingDate ||
        null,
    };
  }, [billing]);

  /**
   * Calculate billing usage percentage.
   */
  const usagePercentage = useMemo(() => {
    if (
      !billingData.monthlyLimit ||
      billingData.monthlyLimit <= 0
    ) {
      return 0;
    }

    return Math.min(
      100,
      Math.round(
        (billingData.currentSpend /
          billingData.monthlyLimit) *
          100
      )
    );
  }, [
    billingData.currentSpend,
    billingData.monthlyLimit,
  ]);

  /**
   * Format currency according to
   * Indian locale.
   */
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: billingData.currency || "INR",
      maximumFractionDigits: 2,
    }).format(amount);
  };

  /**
   * Format dates.
   */
  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "—";
    }

    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(parsedDate);
  };

  /**
   * Capitalize status text.
   */
  const formatStatus = (status) => {
    if (!status) {
      return "Unknown";
    }

    return String(status)
      .charAt(0)
      .toUpperCase()
      .concat(String(status).slice(1));
  };

  /**
   * Refresh billing information.
   */
  const handleRefresh = async () => {
    await refetch?.();
  };

  /**
   * Handle invoice download.
   *
   * This expects the invoice object to contain
   * a downloadable URL.
   */
  const handleDownloadInvoice = (invoice) => {
    if (!invoice?.url) {
      return;
    }

    window.open(
      invoice.url,
      "_blank",
      "noopener,noreferrer"
    );
  };

  /**
   * Loading state.
   */
  if (loading && !billing) {
    return (
      <main
        className="console-billing"
        aria-label="Billing"
      >
        <div className="billing-loading">
          <Spinner />

          <p>
            Loading billing information...
          </p>
        </div>
      </main>
    );
  }

  /**
   * Error state.
   */
  if (error && !billing) {
    return (
      <main
        className="console-billing"
        aria-label="Billing"
      >
        <section className="billing-error">
          <h1>
            Unable to load billing
          </h1>

          <p>
            We couldn't retrieve your billing
            information. Please try again.
          </p>

          <button
            type="button"
            onClick={handleRefresh}
            className="billing-button"
          >
            Try Again
          </button>
        </section>
      </main>
    );
  }

  return (
    <main
      className="console-billing"
      aria-label="Billing Management"
    >
      {/* Page Header */}
      <header className="billing-header">
        <div>
          <h1>Billing</h1>

          <p>
            Manage your subscription, usage,
            payments, and invoices.
          </p>
        </div>

        <div className="billing-header__actions">
          <label
            htmlFor="billing-period"
            className="sr-only"
          >
            Billing period
          </label>

          <select
            id="billing-period"
            value={billingPeriod}
            onChange={(event) =>
              setBillingPeriod(event.target.value)
            }
            className="billing-select"
          >
            <option value="current">
              Current Period
            </option>

            <option value="previous">
              Previous Period
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
            className="billing-button"
          >
            {loading
              ? "Refreshing..."
              : "Refresh"}
          </button>
        </div>
      </header>

      {/* Subscription Overview */}
      <section
        className="billing-subscription-card"
        aria-label="Subscription overview"
      >
        <div className="billing-subscription-card__main">
          <div>
            <span className="billing-label">
              Current Plan
            </span>

            <h2>
              {billingData.plan}
            </h2>

            <span
              className={`billing-status billing-status--${String(
                billingData.status
              ).toLowerCase()}`}
            >
              {formatStatus(
                billingData.status
              )}
            </span>
          </div>

          <div>
            <span className="billing-label">
              Next Billing Date
            </span>

            <strong>
              {formatDate(
                billingData.nextBillingDate
              )}
            </strong>
          </div>

          <div>
            <span className="billing-label">
              Payment Method
            </span>

            <strong>
              {billingData.paymentMethod?.brand
                ? `${billingData.paymentMethod.brand} •••• ${
                    billingData.paymentMethod.last4 ||
                    ""
                  }`
                : "No payment method"}
            </strong>
          </div>
        </div>

        <div className="billing-subscription-card__actions">
          <button
            type="button"
            className="billing-button billing-button--primary"
          >
            Manage Plan
          </button>
        </div>
      </section>

      {/* Billing KPIs */}
      <section
        className="billing-kpi-grid"
        aria-label="Billing metrics"
      >
        <MetricCard
          title="Current Spend"
          value={formatCurrency(
            billingData.currentSpend
          )}
          status={
            usagePercentage >= 90
              ? "critical"
              : usagePercentage >= 75
              ? "warning"
              : "healthy"
          }
        />

        <MetricCard
          title="Monthly Limit"
          value={
            billingData.monthlyLimit > 0
              ? formatCurrency(
                  billingData.monthlyLimit
                )
              : "Unlimited"
          }
          status="healthy"
        />

        <MetricCard
          title="Total Requests"
          value={billingData.totalRequests}
          status="healthy"
        />

        <MetricCard
          title="Total Tokens"
          value={billingData.totalTokens}
          status="healthy"
        />
      </section>

      {/* Usage Progress */}
      <section
        className="billing-usage-card"
        aria-label="Billing usage"
      >
        <div className="billing-section-header">
          <div>
            <h2>
              Usage & Spending
            </h2>

            <p>
              Monitor your current spending
              against your plan limit.
            </p>
          </div>

          <strong>
            {usagePercentage}%
          </strong>
        </div>

        <div
          className="billing-progress"
          role="progressbar"
          aria-valuenow={usagePercentage}
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div
            className="billing-progress__bar"
            style={{
              width: `${usagePercentage}%`,
            }}
          />
        </div>

        <div className="billing-progress__footer">
          <span>
            Spent:{" "}
            {formatCurrency(
              billingData.currentSpend
            )}
          </span>

          <span>
            Limit:{" "}
            {billingData.monthlyLimit > 0
              ? formatCurrency(
                  billingData.monthlyLimit
                )
              : "Unlimited"}
          </span>
        </div>
      </section>

      {/* Billing History */}
      <section
        className="billing-history"
        aria-label="Billing history"
      >
        <div className="billing-section-header">
          <div>
            <h2>
              Billing History
            </h2>

            <p>
              View your previous invoices
              and payment records.
            </p>
          </div>
        </div>

        <div className="billing-table-container">
          <table className="billing-table">
            <thead>
              <tr>
                <th scope="col">
                  Invoice
                </th>

                <th scope="col">
                  Date
                </th>

                <th scope="col">
                  Amount
                </th>

                <th scope="col">
                  Status
                </th>

                <th scope="col">
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {billingData.invoices.length ===
              0 ? (
                <tr>
                  <td
                    colSpan="5"
                    className="billing-empty"
                  >
                    No billing history available.
                  </td>
                </tr>
              ) : (
                billingData.invoices.map(
                  (invoice, index) => (
                    <tr
                      key={
                        invoice.id ||
                        invoice.invoiceId ||
                        index
                      }
                    >
                      <td>
                        {invoice.number ||
                          invoice.invoiceId ||
                          "—"}
                      </td>

                      <td>
                        {formatDate(
                          invoice.date ||
                            invoice.createdAt
                        )}
                      </td>

                      <td>
                        {formatCurrency(
                          Number(
                            invoice.amount || 0
                          )
                        )}
                      </td>

                      <td>
                        <span
                          className={`billing-status billing-status--${String(
                            invoice.status ||
                              "unknown"
                          ).toLowerCase()}`}
                        >
                          {formatStatus(
                            invoice.status
                          )}
                        </span>
                      </td>

                      <td>
                        <button
                          type="button"
                          onClick={() =>
                            handleDownloadInvoice(
                              invoice
                            )
                          }
                          disabled={
                            !invoice.url
                          }
                          className="billing-link-button"
                        >
                          View Invoice
                        </button>
                      </td>
                    </tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}