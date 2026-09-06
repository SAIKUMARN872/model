import apiClient from "../../api/client";

/**
 * Latency API Service
 *
 * Responsible for:
 * - Latency overview
 * - Latency summary
 * - Latency trends
 * - Model latency
 * - Provider latency
 * - Percentile metrics
 * - Endpoint latency
 * - Slow requests
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
 * Get latency overview.
 */
export const getLatencyOverview = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/latency/overview",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get latency summary.
 */
export const getLatencySummary = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/latency/summary",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get latency trends.
 */
export const getLatencyTrends = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/latency/trends",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get latency time-series data.
 */
export const getLatencyTimeSeries = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/latency/timeseries",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get latency by model.
 */
export const getLatencyByModel = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/latency/models",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get latency for a specific model.
 */
export const getModelLatency = async (
  modelId,
  params = {}
) => {
  if (!modelId) {
    throw new Error(
      "Model ID is required."
    );
  }

  const response = await apiClient.get(
    `/latency/models/${encodeURIComponent(
      modelId
    )}`,
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get latency by provider.
 */
export const getLatencyByProvider = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/latency/providers",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get latency by environment.
 */
export const getLatencyByEnvironment = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/latency/environments",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get latency percentile metrics.
 *
 * Supported percentiles may include:
 * - p50
 * - p75
 * - p90
 * - p95
 * - p99
 */
export const getLatencyPercentiles = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/latency/percentiles",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get endpoint latency.
 */
export const getEndpointLatency = async (
  endpoint,
  params = {}
) => {
  if (!endpoint) {
    throw new Error(
      "Endpoint is required."
    );
  }

  const response = await apiClient.get(
    `/latency/endpoints/${encodeURIComponent(
      endpoint
    )}`,
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get slow requests.
 */
export const getSlowRequests = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/latency/slow-requests",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get latency thresholds.
 */
export const getLatencyThresholds = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/latency/thresholds",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Update latency thresholds.
 */
export const updateLatencyThresholds = async (
  thresholdData
) => {
  if (
    !thresholdData ||
    typeof thresholdData !== "object"
  ) {
    throw new Error(
      "Threshold data is required."
    );
  }

  const response = await apiClient.put(
    "/latency/thresholds",
    thresholdData
  );

  return getResponseData(response);
};

/**
 * Get latency health status.
 */
export const getLatencyHealth = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/latency/health",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Export latency data.
 */
export const exportLatencyData = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/latency/export",
    {
      params: buildQueryParams(params),
      responseType: "blob",
    }
  );

  return response;
};

/**
 * Latency API service.
 */
const latencyApi = {
  getLatencyOverview,

  getLatencySummary,

  getLatencyTrends,

  getLatencyTimeSeries,

  getLatencyByModel,

  getModelLatency,

  getLatencyByProvider,

  getLatencyByEnvironment,

  getLatencyPercentiles,

  getEndpointLatency,

  getSlowRequests,

  getLatencyThresholds,

  updateLatencyThresholds,

  getLatencyHealth,

  exportLatencyData,
};

export default latencyApi;