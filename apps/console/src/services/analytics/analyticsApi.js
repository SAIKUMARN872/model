import apiClient from "../../api/client";

/**
 * Analytics API Service
 *
 * Responsible for:
 * - Dashboard analytics
 * - Request metrics
 * - Token metrics
 * - Cost analytics
 * - Latency analytics
 * - Error analytics
 * - Model performance
 * - Time-series analytics
 */

/**
 * Return the actual response payload.
 */
const getResponseData = (
  response
) => {
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
 * Remove empty query parameters.
 */
const buildQueryParams = (
  params = {}
) => {
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
 * Get dashboard analytics.
 */
export const getDashboardAnalytics =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/analytics/dashboard",
        {
          params:
            buildQueryParams(
              params
            ),
        }
      );

    return getResponseData(
      response
    );
  };

/**
 * Get overview analytics.
 */
export const getOverviewAnalytics =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/analytics/overview",
        {
          params:
            buildQueryParams(
              params
            ),
        }
      );

    return getResponseData(
      response
    );
  };

/**
 * Get request analytics.
 */
export const getRequestAnalytics =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/analytics/requests",
        {
          params:
            buildQueryParams(
              params
            ),
        }
      );

    return getResponseData(
      response
    );
  };

/**
 * Get token usage analytics.
 */
export const getTokenAnalytics =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/analytics/tokens",
        {
          params:
            buildQueryParams(
              params
            ),
        }
      );

    return getResponseData(
      response
    );
  };

/**
 * Get cost analytics.
 */
export const getCostAnalytics =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/analytics/cost",
        {
          params:
            buildQueryParams(
              params
            ),
        }
      );

    return getResponseData(
      response
    );
  };

/**
 * Get latency analytics.
 */
export const getLatencyAnalytics =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/analytics/latency",
        {
          params:
            buildQueryParams(
              params
            ),
        }
      );

    return getResponseData(
      response
    );
  };

/**
 * Get error analytics.
 */
export const getErrorAnalytics =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/analytics/errors",
        {
          params:
            buildQueryParams(
              params
            ),
        }
      );

    return getResponseData(
      response
    );
  };

/**
 * Get model performance analytics.
 */
export const getModelPerformance =
  async (
    modelId,
    params = {}
  ) => {
    if (!modelId) {
      throw new Error(
        "Model ID is required."
      );
    }

    const response =
      await apiClient.get(
        `/analytics/models/${encodeURIComponent(
          modelId
        )}`,
        {
          params:
            buildQueryParams(
              params
            ),
        }
      );

    return getResponseData(
      response
    );
  };

/**
 * Get analytics for all models.
 */
export const getModelsAnalytics =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/analytics/models",
        {
          params:
            buildQueryParams(
              params
            ),
        }
      );

    return getResponseData(
      response
    );
  };

/**
 * Get time-series analytics.
 *
 * Example parameters:
 * {
 *   startDate: "2026-07-01",
 *   endDate: "2026-07-29",
 *   interval: "day"
 * }
 */
export const getTimeSeriesAnalytics =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/analytics/timeseries",
        {
          params:
            buildQueryParams(
              params
            ),
        }
      );

    return getResponseData(
      response
    );
  };

/**
 * Get analytics by provider.
 */
export const getProviderAnalytics =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/analytics/providers",
        {
          params:
            buildQueryParams(
              params
            ),
        }
      );

    return getResponseData(
      response
    );
  };

/**
 * Get analytics by environment.
 */
export const getEnvironmentAnalytics =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/analytics/environments",
        {
          params:
            buildQueryParams(
              params
            ),
        }
      );

    return getResponseData(
      response
    );
  };

/**
 * Get analytics summary.
 */
export const getAnalyticsSummary =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/analytics/summary",
        {
          params:
            buildQueryParams(
              params
            ),
        }
      );

    return getResponseData(
      response
    );
  };

/**
 * Export analytics data.
 */
export const exportAnalytics =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/analytics/export",
        {
          params:
            buildQueryParams(
              params
            ),
          responseType: "blob",
        }
      );

    return response;
  };

/**
 * Analytics API object.
 */
const analyticsApi = {
  getDashboardAnalytics,

  getOverviewAnalytics,

  getRequestAnalytics,

  getTokenAnalytics,

  getCostAnalytics,

  getLatencyAnalytics,

  getErrorAnalytics,

  getModelPerformance,

  getModelsAnalytics,

  getTimeSeriesAnalytics,

  getProviderAnalytics,

  getEnvironmentAnalytics,

  getAnalyticsSummary,

  exportAnalytics,
};

export default analyticsApi;