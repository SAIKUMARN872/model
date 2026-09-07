import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * Billing Hook
 * Admin Dashboard
 *
 * Handles:
 * - Billing information
 * - Subscription details
 * - Invoices
 * - Payment methods
 * - Loading and error states
 *
 * Replace the mock API functions with your
 * actual billingApi service when available.
 */

const initialBilling = {
  organizationId: null,
  plan: "free",
  status: "active",
  billingCycle: "monthly",
  amount: 0,
  currency: "USD",
  nextBillingDate: null,
};

const initialInvoices = [];

const initialPaymentMethods = [];

/**
 * Mock billing API.
 *
 * Replace these functions with:
 *
 * import billingApi from "../services/billingApi";
 *
 * Example:
 * billingApi.getBilling()
 */

const billingApi = {
  getBilling: async () => {
    return initialBilling;
  },

  getInvoices: async () => {
    return initialInvoices;
  },

  getPaymentMethods: async () => {
    return initialPaymentMethods;
  },

  updatePlan: async (plan) => {
    return {
      ...initialBilling,
      plan,
    };
  },

  cancelSubscription: async () => {
    return {
      ...initialBilling,
      status: "cancelled",
    };
  },
};

/**
 * Main Billing Hook
 */
export const useBilling = (
  organizationId = null
) => {
  const [billing, setBilling] =
    useState({
      ...initialBilling,
      organizationId,
    });

  const [invoices, setInvoices] =
    useState(initialInvoices);

  const [
    paymentMethods,
    setPaymentMethods,
  ] = useState(
    initialPaymentMethods
  );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState(null);

  /**
   * Fetch billing data.
   */
  const fetchBilling = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          billingData,
          invoiceData,
          paymentData,
        ] = await Promise.all([
          billingApi.getBilling(),
          billingApi.getInvoices(),
          billingApi.getPaymentMethods(),
        ]);

        setBilling({
          ...billingData,
          organizationId,
        });

        setInvoices(invoiceData);

        setPaymentMethods(
          paymentData
        );
      } catch (err) {
        setError(
          err?.message ||
            "Failed to load billing information."
        );
      } finally {
        setLoading(false);
      }
    },
    [organizationId]
  );

  /**
   * Update subscription plan.
   */
  const updatePlan = useCallback(
    async (plan) => {
      try {
        setLoading(true);
        setError(null);

        const updatedBilling =
          await billingApi.updatePlan(
            plan
          );

        setBilling(
          updatedBilling
        );

        return {
          success: true,
          data: updatedBilling,
        };
      } catch (err) {
        const message =
          err?.message ||
          "Failed to update billing plan.";

        setError(message);

        return {
          success: false,
          error: message,
        };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  /**
   * Cancel subscription.
   */
  const cancelSubscription =
    useCallback(async () => {
      try {
        setLoading(true);
        setError(null);

        const updatedBilling =
          await billingApi.cancelSubscription();

        setBilling(
          updatedBilling
        );

        return {
          success: true,
          data: updatedBilling,
        };
      } catch (err) {
        const message =
          err?.message ||
          "Failed to cancel subscription.";

        setError(message);

        return {
          success: false,
          error: message,
        };
      } finally {
        setLoading(false);
      }
    }, []);

  /**
   * Refresh billing information.
   */
  const refresh = useCallback(
    async () => {
      await fetchBilling();
    },
    [fetchBilling]
  );

  /**
   * Clear billing error.
   */
  const clearError =
    useCallback(() => {
      setError(null);
    }, []);

  /**
   * Calculate total invoice amount.
   */
  const totalInvoiceAmount =
    useMemo(() => {
      return invoices.reduce(
        (total, invoice) =>
          total +
          Number(
            invoice?.amount || 0
          ),
        0
      );
    }, [invoices]);

  /**
   * Check whether subscription is active.
   */
  const isSubscriptionActive =
    useMemo(() => {
      return (
        billing.status ===
          "active" &&
        billing.status !==
          "cancelled"
      );
    }, [billing.status]);

  /**
   * Check whether the account
   * has a paid plan.
   */
  const isPaidPlan = useMemo(() => {
    return (
      billing.plan !== "free"
    );
  }, [billing.plan]);

  /**
   * Automatically fetch billing
   * when organization changes.
   */
  useEffect(() => {
    fetchBilling();
  }, [fetchBilling]);

  return {
    // Data
    billing,
    invoices,
    paymentMethods,

    // State
    loading,
    error,

    // Actions
    fetchBilling,
    updatePlan,
    cancelSubscription,
    refresh,
    clearError,

    // Computed values
    totalInvoiceAmount,
    isSubscriptionActive,
    isPaidPlan,
  };
};

export default useBilling;