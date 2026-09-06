"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import billingApi from "../services/billingApi";

import {
  normalizeApiError,
} from "../errors/ApiError";

/**
 * Enterprise Billing Hook
 *
 * Responsibilities:
 * - Billing overview
 * - Current subscription
 * - Invoices
 * - Payment methods
 * - Billing usage
 * - Cost summary
 * - Invoice download
 * - Payment method management
 * - Subscription cancellation
 * - Pagination
 * - Filtering
 * - Loading states
 * - Error normalization
 * - Refresh support
 */

/**
 * Default invoice filters.
 */
const DEFAULT_FILTERS = {
  search: "",
  status: "",
  currency: "",
  startDate: "",
  endDate: "",
};

/**
 * Default pagination.
 */
const DEFAULT_PAGINATION = {
  page: 1,
  pageSize: 20,
  total: 0,
  totalPages: 0,
};

/**
 * Normalize API response.
 */
const normalizeResponse = (
  response
) => {
  if (!response) {
    return {};
  }

  if (
    response.data &&
    typeof response.data === "object"
  ) {
    return response.data;
  }

  return response;
};

/**
 * Normalize collection response.
 */
const normalizeCollection = (
  response,
  keys = []
) => {
  const data =
    normalizeResponse(response);

  if (Array.isArray(data)) {
    return data;
  }

  for (const key of keys) {
    if (Array.isArray(data[key])) {
      return data[key];
    }
  }

  if (Array.isArray(data.items)) {
    return data.items;
  }

  if (Array.isArray(data.data)) {
    return data.data;
  }

  return [];
};

/**
 * Normalize paginated response.
 */
const normalizePaginatedResponse = (
  response
) => {
  const data =
    normalizeResponse(response);

  const items =
    Array.isArray(data)
      ? data
      : data.items ||
        data.invoices ||
        data.data ||
        [];

  const total =
    data.total ??
    data.pagination?.total ??
    items.length;

  const page =
    data.page ??
    data.pagination?.page ??
    1;

  const pageSize =
    data.pageSize ??
    data.pagination?.pageSize ??
    20;

  const totalPages =
    data.totalPages ??
    data.pagination?.totalPages ??
    Math.ceil(
      total /
        Math.max(pageSize, 1)
    );

  return {
    items: Array.isArray(items)
      ? items
      : [],
    total,
    page,
    pageSize,
    totalPages,
  };
};

/**
 * Main useBilling hook.
 */
const useBilling = (
  options = {}
) => {
  const {
    enabled = true,
    initialFilters = {},
    initialPage = 1,
    initialPageSize = 20,
  } = options;

  /**
   * Billing overview.
   */
  const [
    overview,
    setOverview,
  ] = useState(null);

  /**
   * Current subscription.
   */
  const [
    subscription,
    setSubscription,
  ] = useState(null);

  /**
   * Invoice list.
   */
  const [
    invoices,
    setInvoices,
  ] = useState([]);

  /**
   * Payment methods.
   */
  const [
    paymentMethods,
    setPaymentMethods,
  ] = useState([]);

  /**
   * Billing usage.
   */
  const [
    usage,
    setUsage,
  ] = useState(null);

  /**
   * Cost summary.
   */
  const [
    costSummary,
    setCostSummary,
  ] = useState(null);

  /**
   * Pagination.
   */
  const [
    pagination,
    setPagination,
  ] = useState({
    ...DEFAULT_PAGINATION,
    page: initialPage,
    pageSize: initialPageSize,
  });

  /**
   * Filters.
   */
  const [
    filters,
    setFiltersState,
  ] = useState({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  /**
   * Loading states.
   */
  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    isFetching,
    setIsFetching,
  ] = useState(false);

  const [
    isLoadingOverview,
    setIsLoadingOverview,
  ] = useState(false);

  const [
    isLoadingSubscription,
    setIsLoadingSubscription,
  ] = useState(false);

  const [
    isLoadingInvoices,
    setIsLoadingInvoices,
  ] = useState(false);

  const [
    isLoadingPaymentMethods,
    setIsLoadingPaymentMethods,
  ] = useState(false);

  const [
    isLoadingUsage,
    setIsLoadingUsage,
  ] = useState(false);

  const [
    isLoadingCost,
    setIsLoadingCost,
  ] = useState(false);

  const [
    isDownloadingInvoice,
    setIsDownloadingInvoice,
  ] = useState(false);

  const [
    isAddingPaymentMethod,
    setIsAddingPaymentMethod,
  ] = useState(false);

  const [
    isRemovingPaymentMethod,
    setIsRemovingPaymentMethod,
  ] = useState(false);

  const [
    isCancellingSubscription,
    setIsCancellingSubscription,
  ] = useState(false);

  /**
   * Error states.
   */
  const [
    error,
    setError,
  ] = useState(null);

  const [
    overviewError,
    setOverviewError,
  ] = useState(null);

  const [
    subscriptionError,
    setSubscriptionError,
  ] = useState(null);

  const [
    invoiceError,
    setInvoiceError,
  ] = useState(null);

  const [
    paymentMethodError,
    setPaymentMethodError,
  ] = useState(null);

  const [
    usageError,
    setUsageError,
  ] = useState(null);

  const [
    costError,
    setCostError,
  ] = useState(null);

  /**
   * Last successful fetch.
   */
  const [
    lastFetchedAt,
    setLastFetchedAt,
  ] = useState(null);

  /**
   * Build common request parameters.
   */
  const getRequestParams =
    useCallback(
      () => ({
        page: pagination.page,

        pageSize:
          pagination.pageSize,

        search:
          filters.search ||
          undefined,

        status:
          filters.status ||
          undefined,

        currency:
          filters.currency ||
          undefined,

        startDate:
          filters.startDate ||
          undefined,

        endDate:
          filters.endDate ||
          undefined,
      }),
      [
        pagination.page,
        pagination.pageSize,
        filters.search,
        filters.status,
        filters.currency,
        filters.startDate,
        filters.endDate,
      ]
    );

  /**
   * Fetch billing overview.
   */
  const fetchOverview =
    useCallback(
      async (
        requestOptions = {}
      ) => {
        if (
          !enabled &&
          !requestOptions.force
        ) {
          return null;
        }

        setIsLoadingOverview(
          true
        );

        setOverviewError(null);

        try {
          const response =
            await billingApi.getOverview();

          const data =
            normalizeResponse(
              response
            );

          setOverview(data);

          return data;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/billing/overview",
                method: "GET",
              }
            );

          setOverviewError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingOverview(
            false
          );
        }
      },
      [enabled]
    );

  /**
   * Fetch current subscription.
   */
  const fetchSubscription =
    useCallback(
      async (
        requestOptions = {}
      ) => {
        if (
          !enabled &&
          !requestOptions.force
        ) {
          return null;
        }

        setIsLoadingSubscription(
          true
        );

        setSubscriptionError(
          null
        );

        try {
          const response =
            await billingApi.getSubscription();

          const data =
            normalizeResponse(
              response
            );

          setSubscription(data);

          return data;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/billing/subscription",
                method: "GET",
              }
            );

          setSubscriptionError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingSubscription(
            false
          );
        }
      },
      [enabled]
    );

  /**
   * Fetch invoices.
   */
  const fetchInvoices =
    useCallback(
      async (
        requestOptions = {}
      ) => {
        if (
          !enabled &&
          !requestOptions.force
        ) {
          return null;
        }

        setIsLoadingInvoices(
          true
        );

        setInvoiceError(null);

        try {
          const response =
            await billingApi.listInvoices(
              getRequestParams()
            );

          const normalized =
            normalizePaginatedResponse(
              response
            );

          setInvoices(
            normalized.items
          );

          setPagination(
            (current) => ({
              ...current,
              page:
                normalized.page,
              pageSize:
                normalized.pageSize,
              total:
                normalized.total,
              totalPages:
                normalized.totalPages,
            })
          );

          return normalized;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/billing/invoices",
                method: "GET",
              }
            );

          setInvoiceError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingInvoices(
            false
          );
        }
      },
      [
        enabled,
        getRequestParams,
      ]
    );

  /**
   * Fetch payment methods.
   */
  const fetchPaymentMethods =
    useCallback(
      async (
        requestOptions = {}
      ) => {
        if (
          !enabled &&
          !requestOptions.force
        ) {
          return [];
        }

        setIsLoadingPaymentMethods(
          true
        );

        setPaymentMethodError(
          null
        );

        try {
          const response =
            await billingApi.listPaymentMethods();

          const items =
            normalizeCollection(
              response,
              [
                "paymentMethods",
                "methods",
              ]
            );

          setPaymentMethods(
            items
          );

          return items;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/billing/payment-methods",
                method: "GET",
              }
            );

          setPaymentMethodError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingPaymentMethods(
            false
          );
        }
      },
      [enabled]
    );

  /**
   * Fetch billing usage.
   */
  const fetchUsage =
    useCallback(
      async (
        requestOptions = {}
      ) => {
        if (
          !enabled &&
          !requestOptions.force
        ) {
          return null;
        }

        setIsLoadingUsage(true);

        setUsageError(null);

        try {
          const response =
            await billingApi.getUsage(
              getRequestParams()
            );

          const data =
            normalizeResponse(
              response
            );

          setUsage(data);

          return data;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/billing/usage",
                method: "GET",
              }
            );

          setUsageError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingUsage(false);
        }
      },
      [
        enabled,
        getRequestParams,
      ]
    );

  /**
   * Fetch cost summary.
   */
  const fetchCostSummary =
    useCallback(
      async (
        requestOptions = {}
      ) => {
        if (
          !enabled &&
          !requestOptions.force
        ) {
          return null;
        }

        setIsLoadingCost(true);

        setCostError(null);

        try {
          const response =
            await billingApi.getCostSummary(
              getRequestParams()
            );

          const data =
            normalizeResponse(
              response
            );

          setCostSummary(data);

          return data;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/billing/cost",
                method: "GET",
              }
            );

          setCostError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsLoadingCost(false);
        }
      },
      [
        enabled,
        getRequestParams,
      ]
    );

  /**
   * Fetch all billing data.
   *
   * Promise.allSettled allows
   * partial dashboard rendering.
   */
  const fetchBilling =
    useCallback(
      async (
        requestOptions = {}
      ) => {
        if (
          !enabled &&
          !requestOptions.force
        ) {
          return null;
        }

        setIsFetching(true);

        setIsLoading(true);

        setError(null);

        try {
          const results =
            await Promise.allSettled(
              [
                fetchOverview(
                  requestOptions
                ),

                fetchSubscription(
                  requestOptions
                ),

                fetchInvoices(
                  requestOptions
                ),

                fetchPaymentMethods(
                  requestOptions
                ),

                fetchUsage(
                  requestOptions
                ),

                fetchCostSummary(
                  requestOptions
                ),
              ]
            );

          const rejected =
            results.filter(
              (result) =>
                result.status ===
                "rejected"
            );

          if (
            rejected.length > 0
          ) {
            setError(
              rejected[0].reason
            );
          }

          setLastFetchedAt(
            new Date()
          );

          return results;
        } finally {
          setIsFetching(false);

          setIsLoading(false);
        }
      },
      [
        enabled,
        fetchOverview,
        fetchSubscription,
        fetchInvoices,
        fetchPaymentMethods,
        fetchUsage,
        fetchCostSummary,
      ]
    );

  /**
   * Download invoice.
   */
  const downloadInvoice =
    useCallback(
      async (
        invoiceId
      ) => {
        if (!invoiceId) {
          throw new Error(
            "Invoice ID is required."
          );
        }

        setIsDownloadingInvoice(
          true
        );

        setInvoiceError(null);

        try {
          const response =
            await billingApi.downloadInvoice(
              invoiceId
            );

          return response;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  `/billing/invoices/${invoiceId}/download`,
                method: "GET",
              }
            );

          setInvoiceError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsDownloadingInvoice(
            false
          );
        }
      },
      []
    );

  /**
   * Add payment method.
   */
  const addPaymentMethod =
    useCallback(
      async (
        payload
      ) => {
        if (!payload) {
          throw new Error(
            "Payment method data is required."
          );
        }

        setIsAddingPaymentMethod(
          true
        );

        setPaymentMethodError(
          null
        );

        try {
          const response =
            await billingApi.addPaymentMethod(
              payload
            );

          await fetchPaymentMethods({
            force: true,
          });

          return response;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/billing/payment-methods",
                method: "POST",
              }
            );

          setPaymentMethodError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsAddingPaymentMethod(
            false
          );
        }
      },
      [fetchPaymentMethods]
    );

  /**
   * Remove payment method.
   */
  const removePaymentMethod =
    useCallback(
      async (
        paymentMethodId
      ) => {
        if (!paymentMethodId) {
          throw new Error(
            "Payment method ID is required."
          );
        }

        setIsRemovingPaymentMethod(
          true
        );

        setPaymentMethodError(
          null
        );

        try {
          await billingApi.removePaymentMethod(
            paymentMethodId
          );

          setPaymentMethods(
            (currentMethods) =>
              currentMethods.filter(
                (method) =>
                  method.id !==
                  paymentMethodId
              )
          );

          return true;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  `/billing/payment-methods/${paymentMethodId}`,
                method: "DELETE",
              }
            );

          setPaymentMethodError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsRemovingPaymentMethod(
            false
          );
        }
      },
      []
    );

  /**
   * Cancel subscription.
   */
  const cancelSubscription =
    useCallback(
      async (
        payload = {}
      ) => {
        setIsCancellingSubscription(
          true
        );

        setSubscriptionError(
          null
        );

        try {
          const response =
            await billingApi.cancelSubscription(
              payload
            );

          setSubscription(
            (current) => ({
              ...current,
              status:
                "cancellation_pending",
              ...response,
            })
          );

          return response;
        } catch (requestError) {
          const normalizedError =
            normalizeApiError(
              requestError,
              {
                endpoint:
                  "/billing/subscription/cancel",
                method: "POST",
              }
            );

          setSubscriptionError(
            normalizedError
          );

          throw normalizedError;
        } finally {
          setIsCancellingSubscription(
            false
          );
        }
      },
      []
    );

  /**
   * Set pagination page.
   */
  const setPage =
    useCallback(
      (page) => {
        const nextPage =
          Math.max(
            1,
            Number(page) || 1
          );

        setPagination(
          (current) => ({
            ...current,
            page: nextPage,
          })
        );
      },
      []
    );

  /**
   * Set pagination page size.
   */
  const setPageSize =
    useCallback(
      (pageSize) => {
        const nextPageSize =
          Math.max(
            1,
            Number(pageSize) || 20
          );

        setPagination(
          (current) => ({
            ...current,
            page: 1,
            pageSize:
              nextPageSize,
          })
        );
      },
      []
    );

  /**
   * Update filters.
   */
  const setFilters =
    useCallback(
      (updates) => {
        setFiltersState(
          (current) => ({
            ...current,
            ...updates,
          })
        );

        setPagination(
          (current) => ({
            ...current,
            page: 1,
          })
        );
      },
      []
    );

  /**
   * Search invoices.
   */
  const search =
    useCallback(
      (value) => {
        setFilters({
          search: value || "",
        });
      },
      [setFilters]
    );

  /**
   * Filter invoice status.
   */
  const filterByStatus =
    useCallback(
      (status) => {
        setFilters({
          status: status || "",
        });
      },
      [setFilters]
    );

  /**
   * Filter currency.
   */
  const filterByCurrency =
    useCallback(
      (currency) => {
        setFilters({
          currency:
            currency || "",
        });
      },
      [setFilters]
    );

  /**
   * Set billing date range.
   */
  const setDateRange =
    useCallback(
      (
        startDate,
        endDate
      ) => {
        setFilters({
          startDate:
            startDate || "",

          endDate:
            endDate || "",
        });
      },
      [setFilters]
    );

  /**
   * Reset filters.
   */
  const resetFilters =
    useCallback(
      () => {
        setFiltersState(
          DEFAULT_FILTERS
        );

        setPagination(
          (current) => ({
            ...current,
            page: 1,
          })
        );
      },
      []
    );

  /**
   * Clear all errors.
   */
  const clearErrors =
    useCallback(
      () => {
        setError(null);

        setOverviewError(null);

        setSubscriptionError(
          null
        );

        setInvoiceError(null);

        setPaymentMethodError(
          null
        );

        setUsageError(null);

        setCostError(null);
      },
      []
    );

  /**
   * Refresh billing data.
   */
  const refresh =
    useCallback(
      async () => {
        return fetchBilling({
          force: true,
        });
      },
      [fetchBilling]
    );

  /**
   * Initial fetch.
   */
  useEffect(
    () => {
      if (!enabled) {
        return;
      }

      fetchBilling().catch(
        () => {
          /**
           * Errors are already
           * normalized and stored.
           */
        }
      );
    },
    [
      enabled,
      fetchBilling,
    ]
  );

  /**
   * Derived states.
   */
  const hasOverview =
    useMemo(
      () => Boolean(overview),
      [overview]
    );

  const hasSubscription =
    useMemo(
      () =>
        Boolean(subscription),
      [subscription]
    );

  const hasInvoices =
    useMemo(
      () =>
        invoices.length > 0,
      [invoices]
    );

  const hasPaymentMethods =
    useMemo(
      () =>
        paymentMethods.length > 0,
      [paymentMethods]
    );

  const hasUsage =
    useMemo(
      () => Boolean(usage),
      [usage]
    );

  const hasCostSummary =
    useMemo(
      () =>
        Boolean(costSummary),
      [costSummary]
    );

  const isEmpty =
    useMemo(
      () =>
        !isFetching &&
        !hasOverview &&
        !hasSubscription &&
        !hasInvoices &&
        !hasPaymentMethods &&
        !hasUsage &&
        !hasCostSummary,
      [
        isFetching,
        hasOverview,
        hasSubscription,
        hasInvoices,
        hasPaymentMethods,
        hasUsage,
        hasCostSummary,
      ]
    );

  /**
   * Public hook API.
   */
  return {
    /**
     * Billing data.
     */
    overview,

    subscription,

    invoices,

    paymentMethods,

    usage,

    costSummary,

    /**
     * Pagination.
     */
    pagination,

    /**
     * Filters.
     */
    filters,

    /**
     * Loading.
     */
    isLoading,

    isFetching,

    isLoadingOverview,

    isLoadingSubscription,

    isLoadingInvoices,

    isLoadingPaymentMethods,

    isLoadingUsage,

    isLoadingCost,

    isDownloadingInvoice,

    isAddingPaymentMethod,

    isRemovingPaymentMethod,

    isCancellingSubscription,

    /**
     * Errors.
     */
    error,

    overviewError,

    subscriptionError,

    invoiceError,

    paymentMethodError,

    usageError,

    costError,

    /**
     * Metadata.
     */
    lastFetchedAt,

    hasOverview,

    hasSubscription,

    hasInvoices,

    hasPaymentMethods,

    hasUsage,

    hasCostSummary,

    isEmpty,

    /**
     * Fetch methods.
     */
    fetchOverview,

    fetchSubscription,

    fetchInvoices,

    fetchPaymentMethods,

    fetchUsage,

    fetchCostSummary,

    fetchBilling,

    refresh,

    /**
     * Billing actions.
     */
    downloadInvoice,

    addPaymentMethod,

    removePaymentMethod,

    cancelSubscription,

    /**
     * Pagination.
     */
    setPage,

    setPageSize,

    /**
     * Filters.
     */
    setFilters,

    search,

    filterByStatus,

    filterByCurrency,

    setDateRange,

    resetFilters,

    /**
     * Errors.
     */
    clearErrors,
  };
};

export default useBilling;