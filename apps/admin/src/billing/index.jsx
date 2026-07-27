"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../api/client";

/**
 * Enterprise Billing Management
 *
 * Features:
 * - Current subscription
 * - Billing status
 * - Usage summary
 * - Invoice history
 * - Payment status
 * - Plan management
 * - Renewal information
 * - Invoice details
 */

/* =========================================================
   Constants
========================================================= */

const BILLING_STATUS = {
  ACTIVE: "active",
  TRIALING: "trialing",
  PAST_DUE: "past_due",
  CANCELED: "canceled",
  INACTIVE: "inactive",
};

const INVOICE_STATUS = {
  PAID: "paid",
  OPEN: "open",
  PENDING: "pending",
  FAILED: "failed",
  VOID: "void",
};

/* =========================================================
   Utilities
========================================================= */

const formatCurrency = (
  amount,
  currency = "USD"
) => {
  if (
    amount === null ||
    amount === undefined
  ) {
    return "—";
  }

  return new Intl.NumberFormat(
    "en-US",
    {
      style: "currency",
      currency,
    }
  ).format(amount);
};

const formatDate = (
  value
) => {
  if (!value) {
    return "—";
  }

  try {
    return new Intl.DateTimeFormat(
      "en-US",
      {
        dateStyle: "medium",
      }
    ).format(
      new Date(value)
    );
  } catch {
    return "—";
  }
};

const formatLabel = (
  value
) => {
  if (!value) {
    return "Unknown";
  }

  return value
    .replace(
      /[_-]/g,
      " "
    )
    .replace(
      /\b\w/g,
      (char) =>
        char.toUpperCase()
    );
};

/* =========================================================
   Status Badge
========================================================= */

const StatusBadge = ({
  status,
}) => {
  return (
    <span
      className={`billing-status billing-status-${status}`}
    >
      {formatLabel(status)}
    </span>
  );
};

/* =========================================================
   Subscription Card
========================================================= */

const SubscriptionCard = ({
  subscription,
  onManage,
}) => {
  if (!subscription) {
    return (
      <div className="billing-empty-card">
        <h3>
          No Active Subscription
        </h3>

        <p>
          There is currently no
          active billing subscription
          for this organization.
        </p>

        <button
          type="button"
          onClick={onManage}
        >
          Choose a Plan
        </button>
      </div>
    );
  }

  return (
    <div className="billing-subscription-card">
      <div className="billing-card-header">
        <div>
          <span className="billing-eyebrow">
            CURRENT PLAN
          </span>

          <h2>
            {subscription.planName ||
              "Enterprise"}
          </h2>
        </div>

        <StatusBadge
          status={
            subscription.status ||
            BILLING_STATUS.ACTIVE
          }
        />
      </div>

      <div className="billing-plan-price">
        <strong>
          {formatCurrency(
            subscription.amount,
            subscription.currency
          )}
        </strong>

        <span>
          /{" "}
          {subscription.interval ||
            "month"}
        </span>
      </div>

      <div className="billing-subscription-details">
        <div>
          <span>
            Started
          </span>

          <strong>
            {formatDate(
              subscription.startedAt
            )}
          </strong>
        </div>

        <div>
          <span>
            Next Billing
          </span>

          <strong>
            {formatDate(
              subscription.currentPeriodEnd
            )}
          </strong>
        </div>

        <div>
          <span>
            Auto Renewal
          </span>

          <strong>
            {subscription.cancelAtPeriodEnd
              ? "Disabled"
              : "Enabled"}
          </strong>
        </div>
      </div>

      <div className="billing-card-actions">
        <button
          type="button"
          onClick={onManage}
        >
          Manage Subscription
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   Usage Card
========================================================= */

const UsageCard = ({
  usage,
}) => {
  if (!usage) {
    return null;
  }

  const percentage = Math.min(
    100,
    Math.round(
      (usage.used /
        usage.limit) *
        100
    )
  );

  return (
    <div className="billing-usage-card">
      <div className="billing-card-header">
        <div>
          <span className="billing-eyebrow">
            PLAN USAGE
          </span>

          <h2>
            Resource Consumption
          </h2>
        </div>

        <strong>
          {percentage}%
        </strong>
      </div>

      <div className="billing-progress">
        <div
          className="billing-progress-bar"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <div className="billing-usage-details">
        <div>
          <span>
            Used
          </span>

          <strong>
            {(
              usage.used || 0
            ).toLocaleString()}
          </strong>
        </div>

        <div>
          <span>
            Limit
          </span>

          <strong>
            {(
              usage.limit || 0
            ).toLocaleString()}
          </strong>
        </div>

        <div>
          <span>
            Remaining
          </span>

          <strong>
            {Math.max(
              0,
              (usage.limit || 0) -
                (usage.used || 0)
            ).toLocaleString()}
          </strong>
        </div>
      </div>
    </div>
  );
};

/* =========================================================
   Invoice Table
========================================================= */

const InvoiceTable = ({
  invoices,
  onView,
}) => {
  return (
    <div className="billing-invoices-card">
      <div className="billing-card-header">
        <div>
          <span className="billing-eyebrow">
            BILLING HISTORY
          </span>

          <h2>
            Invoices
          </h2>
        </div>
      </div>

      <div className="billing-table-wrapper">
        <table className="billing-table">
          <thead>
            <tr>
              <th>
                Invoice
              </th>

              <th>
                Date
              </th>

              <th>
                Amount
              </th>

              <th>
                Status
              </th>

              <th>
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {invoices.length ===
            0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="billing-empty"
                >
                  No invoices found.
                </td>
              </tr>
            ) : (
              invoices.map(
                (invoice) => (
                  <tr
                    key={
                      invoice.id
                    }
                  >
                    <td>
                      <strong>
                        {invoice.number ||
                          invoice.id}
                      </strong>
                    </td>

                    <td>
                      {formatDate(
                        invoice.createdAt
                      )}
                    </td>

                    <td>
                      {formatCurrency(
                        invoice.amount,
                        invoice.currency
                      )}
                    </td>

                    <td>
                      <StatusBadge
                        status={
                          invoice.status ||
                          INVOICE_STATUS.PENDING
                        }
                      />
                    </td>

                    <td>
                      <button
                        type="button"
                        onClick={() =>
                          onView(
                            invoice
                          )
                        }
                      >
                        View
                      </button>
                    </td>
                  </tr>
                )
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

/* =========================================================
   Invoice Details Modal
========================================================= */

const InvoiceDetails = ({
  invoice,
  onClose,
}) => {
  if (!invoice) {
    return null;
  }

  return (
    <div className="billing-modal-overlay">
      <div className="billing-modal">
        <div className="billing-modal-header">
          <div>
            <span className="billing-eyebrow">
              INVOICE
            </span>

            <h2>
              {invoice.number ||
                invoice.id}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="billing-invoice-details">
          <div>
            <span>
              Status
            </span>

            <StatusBadge
              status={
                invoice.status ||
                "pending"
              }
            />
          </div>

          <div>
            <span>
              Amount
            </span>

            <strong>
              {formatCurrency(
                invoice.amount,
                invoice.currency
              )}
            </strong>
          </div>

          <div>
            <span>
              Created
            </span>

            <strong>
              {formatDate(
                invoice.createdAt
              )}
            </strong>
          </div>

          <div>
            <span>
              Due Date
            </span>

            <strong>
              {formatDate(
                invoice.dueDate
              )}
            </strong>
          </div>

          <div>
            <span>
              Paid At
            </span>

            <strong>
              {formatDate(
                invoice.paidAt
              )}
            </strong>
          </div>
        </div>

        {invoice.description && (
          <div className="billing-invoice-description">
            <h3>
              Description
            </h3>

            <p>
              {
                invoice.description
              }
            </p>
          </div>
        )}

        {invoice.pdfUrl && (
          <a
            href={
              invoice.pdfUrl
            }
            target="_blank"
            rel="noreferrer"
            className="billing-invoice-download"
          >
            Download Invoice
          </a>
        )}
      </div>
    </div>
  );
};

/* =========================================================
   Main Billing Component
========================================================= */

const Billing = () => {
  const [
    subscription,
    setSubscription,
  ] = useState(null);

  const [
    usage,
    setUsage,
  ] = useState(null);

  const [
    invoices,
    setInvoices,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    selectedInvoice,
    setSelectedInvoice,
  ] = useState(null);

  /* =======================================================
     Load Billing Data
  ======================================================= */

  const loadBilling =
    useCallback(
      async () => {
        try {
          setLoading(true);

          setError("");

          const [
            subscriptionResponse,
            usageResponse,
            invoicesResponse,
          ] =
            await Promise.all([
              api.get(
                "/billing/subscription"
              ),

              api.get(
                "/billing/usage"
              ),

              api.get(
                "/billing/invoices"
              ),
            ]);

          setSubscription(
            subscriptionResponse
              .data?.data ||
              subscriptionResponse
                .data ||
              null
          );

          setUsage(
            usageResponse.data
              ?.data ||
              usageResponse.data ||
              null
          );

          const invoiceData =
            invoicesResponse.data;

          setInvoices(
            invoiceData?.data ||
              invoiceData?.invoices ||
              invoiceData ||
              []
          );
        } catch (err) {
          console.error(
            "Failed to load billing data:",
            err
          );

          setError(
            err?.message ||
              "Unable to load billing information."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    loadBilling();
  }, [
    loadBilling,
  ]);

  /* =======================================================
     Manage Subscription
  ======================================================= */

  const handleManageSubscription =
    () => {
      window.location.href =
        "/billing/manage";
    };

  /* =======================================================
     Loading
  ======================================================= */

  if (loading) {
    return (
      <div className="billing-page">
        <div className="billing-loading">
          Loading billing information...
        </div>
      </div>
    );
  }

  /* =======================================================
     Render
  ======================================================= */

  return (
    <main className="billing-page">
      {/* Header */}

      <header className="billing-header">
        <div>
          <span className="billing-eyebrow">
            FINANCE & BILLING
          </span>

          <h1>
            Billing
          </h1>

          <p>
            Manage your organization's
            subscription, usage, invoices,
            and payment information.
          </p>
        </div>

        <button
          type="button"
          onClick={
            loadBilling
          }
          disabled={loading}
        >
          Refresh
        </button>
      </header>

      {/* Error */}

      {error && (
        <div
          className="billing-error"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Subscription */}

      <section className="billing-section">
        <SubscriptionCard
          subscription={
            subscription
          }
          onManage={
            handleManageSubscription
          }
        />
      </section>

      {/* Usage */}

      <section className="billing-section">
        <UsageCard
          usage={usage}
        />
      </section>

      {/* Invoices */}

      <section className="billing-section">
        <InvoiceTable
          invoices={
            invoices
          }
          onView={
            setSelectedInvoice
          }
        />
      </section>

      {/* Invoice Details */}

      {selectedInvoice && (
        <InvoiceDetails
          invoice={
            selectedInvoice
          }
          onClose={() =>
            setSelectedInvoice(
              null
            )
          }
        />
      )}
    </main>
  );
};

export default Billing;