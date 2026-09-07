import apiClient from "../api/client";

/**
 * Billing API Service
 *
 * Responsible for:
 * - Billing overview
 * - Billing account
 * - Subscription management
 * - Invoices
 * - Payment methods
 * - Transactions
 * - Usage charges
 * - Billing history
 */

/**
 * Extract response payload.
 */
const getResponseData = (response) => {
  if (
    response &&
    Object.prototype.hasOwnProperty.call(
      response,
      "data"
    )
  ) {
    return response.data;
  }

  return response;
};

/**
 * Build clean query parameters.
 */
const buildQueryParams = (params = {}) => {
  const query = {};

  Object.entries(params).forEach(
    ([key, value]) => {
      if (
        value !== undefined &&
        value !== null &&
        value !== ""
      ) {
        query[key] = value;
      }
    }
  );

  return query;
};

/**
 * Get billing overview.
 */
export const getBillingOverview = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/billing/overview",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get billing account.
 */
export const getBillingAccount = async () => {
  const response = await apiClient.get(
    "/billing/account"
  );

  return getResponseData(response);
};

/**
 * Update billing account.
 */
export const updateBillingAccount = async (
  accountData
) => {
  if (
    !accountData ||
    typeof accountData !== "object"
  ) {
    throw new Error(
      "Billing account data is required."
    );
  }

  const response = await apiClient.put(
    "/billing/account",
    accountData
  );

  return getResponseData(response);
};

/**
 * Get current subscription.
 */
export const getSubscription = async () => {
  const response = await apiClient.get(
    "/billing/subscription"
  );

  return getResponseData(response);
};

/**
 * Get available billing plans.
 */
export const getBillingPlans = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/billing/plans",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Create a subscription.
 */
export const createSubscription = async (
  subscriptionData
) => {
  if (
    !subscriptionData ||
    typeof subscriptionData !== "object"
  ) {
    throw new Error(
      "Subscription data is required."
    );
  }

  const response = await apiClient.post(
    "/billing/subscription",
    subscriptionData
  );

  return getResponseData(response);
};

/**
 * Update subscription.
 */
export const updateSubscription = async (
  subscriptionData
) => {
  if (
    !subscriptionData ||
    typeof subscriptionData !== "object"
  ) {
    throw new Error(
      "Subscription data is required."
    );
  }

  const response = await apiClient.put(
    "/billing/subscription",
    subscriptionData
  );

  return getResponseData(response);
};

/**
 * Cancel subscription.
 */
export const cancelSubscription = async (
  cancellationData = {}
) => {
  const response = await apiClient.post(
    "/billing/subscription/cancel",
    cancellationData
  );

  return getResponseData(response);
};

/**
 * Resume subscription.
 */
export const resumeSubscription = async () => {
  const response = await apiClient.post(
    "/billing/subscription/resume"
  );

  return getResponseData(response);
};

/**
 * Get invoices.
 */
export const getInvoices = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/billing/invoices",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get a single invoice.
 */
export const getInvoice = async (
  invoiceId
) => {
  if (!invoiceId) {
    throw new Error(
      "Invoice ID is required."
    );
  }

  const response = await apiClient.get(
    `/billing/invoices/${encodeURIComponent(
      invoiceId
    )}`
  );

  return getResponseData(response);
};

/**
 * Download invoice.
 */
export const downloadInvoice = async (
  invoiceId
) => {
  if (!invoiceId) {
    throw new Error(
      "Invoice ID is required."
    );
  }

  const response = await apiClient.get(
    `/billing/invoices/${encodeURIComponent(
      invoiceId
    )}/download`,
    {
      responseType: "blob",
    }
  );

  return response;
};

/**
 * Get payment methods.
 */
export const getPaymentMethods = async () => {
  const response = await apiClient.get(
    "/billing/payment-methods"
  );

  return getResponseData(response);
};

/**
 * Add payment method.
 */
export const addPaymentMethod = async (
  paymentMethodData
) => {
  if (
    !paymentMethodData ||
    typeof paymentMethodData !== "object"
  ) {
    throw new Error(
      "Payment method data is required."
    );
  }

  const response = await apiClient.post(
    "/billing/payment-methods",
    paymentMethodData
  );

  return getResponseData(response);
};

/**
 * Update payment method.
 */
export const updatePaymentMethod = async (
  paymentMethodId,
  paymentMethodData
) => {
  if (!paymentMethodId) {
    throw new Error(
      "Payment method ID is required."
    );
  }

  if (
    !paymentMethodData ||
    typeof paymentMethodData !== "object"
  ) {
    throw new Error(
      "Payment method data is required."
    );
  }

  const response = await apiClient.put(
    `/billing/payment-methods/${encodeURIComponent(
      paymentMethodId
    )}`,
    paymentMethodData
  );

  return getResponseData(response);
};

/**
 * Delete payment method.
 */
export const deletePaymentMethod = async (
  paymentMethodId
) => {
  if (!paymentMethodId) {
    throw new Error(
      "Payment method ID is required."
    );
  }

  const response = await apiClient.delete(
    `/billing/payment-methods/${encodeURIComponent(
      paymentMethodId
    )}`
  );

  return getResponseData(response);
};

/**
 * Set default payment method.
 */
export const setDefaultPaymentMethod = async (
  paymentMethodId
) => {
  if (!paymentMethodId) {
    throw new Error(
      "Payment method ID is required."
    );
  }

  const response = await apiClient.post(
    `/billing/payment-methods/${encodeURIComponent(
      paymentMethodId
    )}/default`
  );

  return getResponseData(response);
};

/**
 * Get billing transactions.
 */
export const getTransactions = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/billing/transactions",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get a single transaction.
 */
export const getTransaction = async (
  transactionId
) => {
  if (!transactionId) {
    throw new Error(
      "Transaction ID is required."
    );
  }

  const response = await apiClient.get(
    `/billing/transactions/${encodeURIComponent(
      transactionId
    )}`
  );

  return getResponseData(response);
};

/**
 * Get usage charges.
 */
export const getUsageCharges = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/billing/usage-charges",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get billing history.
 */
export const getBillingHistory = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/billing/history",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Export billing history.
 */
export const exportBillingHistory = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/billing/history/export",
    {
      params: buildQueryParams(params),
      responseType: "blob",
    }
  );

  return response;
};

/**
 * Billing API service.
 */
const billingApi = {
  getBillingOverview,

  getBillingAccount,

  updateBillingAccount,

  getSubscription,

  getBillingPlans,

  createSubscription,

  updateSubscription,

  cancelSubscription,

  resumeSubscription,

  getInvoices,

  getInvoice,

  downloadInvoice,

  getPaymentMethods,

  addPaymentMethod,

  updatePaymentMethod,

  deletePaymentMethod,

  setDefaultPaymentMethod,

  getTransactions,

  getTransaction,

  getUsageCharges,

  getBillingHistory,

  exportBillingHistory,
};

export default billingApi;