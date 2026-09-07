import apiClient from "../api/client";

/**
 * Usage API Service
 *
 * Responsible for:
 * - Usage overview
 * - Usage summary
 * - Token usage
 * - Request usage
 * - Model usage
 * - Provider usage
 * - Usage trends
 * - Cost breakdown
 * - Usage exports
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
 * Get usage overview.
 */
export const getUsageOverview = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/usage/overview",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get usage summary.
 */
export const getUsageSummary = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/usage/summary",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get usage statistics.
 */
export const getUsageStatistics = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/usage/statistics",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get token usage.
 */
export const getTokenUsage = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/usage/tokens",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get token usage trends.
 */
export const getTokenUsageTrends = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/usage/tokens/trends",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get request usage.
 */
export const getRequestUsage = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/usage/requests",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get request usage trends.
 */
export const getRequestUsageTrends = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/usage/requests/trends",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get usage by model.
 */
export const getUsageByModel = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/usage/models",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get usage for a specific model.
 */
export const getModelUsage = async (
  modelId,
  params = {}
) => {
  if (!modelId) {
    throw new Error(
      "Model ID is required."
    );
  }

  const response = await apiClient.get(
    `/usage/models/${encodeURIComponent(
      modelId
    )}`,
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get usage by provider.
 */
export const getUsageByProvider = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/usage/providers",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get usage by environment.
 */
export const getUsageByEnvironment = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/usage/environments",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get usage trends.
 */
export const getUsageTrends = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/usage/trends",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get usage time-series data.
 */
export const getUsageTimeSeries = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/usage/timeseries",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get usage cost breakdown.
 */
export const getUsageCostBreakdown = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/usage/cost-breakdown",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get usage by API key.
 */
export const getUsageByApiKey = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/usage/api-keys",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get usage for a specific API key.
 */
export const getApiKeyUsage = async (
  apiKeyId,
  params = {}
) => {
  if (!apiKeyId) {
    throw new Error(
      "API key ID is required."
    );
  }

  const response = await apiClient.get(
    `/usage/api-keys/${encodeURIComponent(
      apiKeyId
    )}`,
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get usage by user.
 */
export const getUsageByUser = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/usage/users",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get usage limits.
 */
export const getUsageLimits = async () => {
  const response = await apiClient.get(
    "/usage/limits"
  );

  return getResponseData(response);
};

/**
 * Update usage limits.
 */
export const updateUsageLimits = async (
  limitData
) => {
  if (
    !limitData ||
    typeof limitData !== "object"
  ) {
    throw new Error(
      "Usage limit data is required."
    );
  }

  const response = await apiClient.put(
    "/usage/limits",
    limitData
  );

  return getResponseData(response);
};

/**
 * Get usage alerts.
 */
export const getUsageAlerts = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/usage/alerts",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Create a usage alert.
 */
export const createUsageAlert = async (
  alertData
) => {
  if (
    !alertData ||
    typeof alertData !== "object"
  ) {
    throw new Error(
      "Usage alert data is required."
    );
  }

  const response = await apiClient.post(
    "/usage/alerts",
    alertData
  );

  return getResponseData(response);
};

/**
 * Update a usage alert.
 */
export const updateUsageAlert = async (
  alertId,
  alertData
) => {
  if (!alertId) {
    throw new Error(
      "Alert ID is required."
    );
  }

  if (
    !alertData ||
    typeof alertData !== "object"
  ) {
    throw new Error(
      "Usage alert data is required."
    );
  }

  const response = await apiClient.put(
    `/usage/alerts/${encodeURIComponent(
      alertId
    )}`,
    alertData
  );

  return getResponseData(response);
};

/**
 * Delete a usage alert.
 */
export const deleteUsageAlert = async (
  alertId
) => {
  if (!alertId) {
    throw new Error(
      "Alert ID is required."
    );
  }

  const response = await apiClient.delete(
    `/usage/alerts/${encodeURIComponent(
      alertId
    )}`
  );

  return getResponseData(response);
};

/**
 * Export usage data.
 */
export const exportUsageData = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/usage/export",
    {
      params: buildQueryParams(params),
      responseType: "blob",
    }
  );

  return response;
};

/**
 * Usage API service.
 */
const usageApi = {
  getUsageOverview,

  getUsageSummary,

  getUsageStatistics,

  getTokenUsage,

  getTokenUsageTrends,

  getRequestUsage,

  getRequestUsageTrends,

  getUsageByModel,

  getModelUsage,

  getUsageByProvider,

  getUsageByEnvironment,

  getUsageTrends,

  getUsageTimeSeries,

  getUsageCostBreakdown,

  getUsageByApiKey,

  getApiKeyUsage,

  getUsageByUser,

  getUsageLimits,

  updateUsageLimits,

  getUsageAlerts,

  createUsageAlert,

  updateUsageAlert,

  deleteUsageAlert,

  exportUsageData,
};

export default usageApi;