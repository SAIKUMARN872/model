import apiClient from "../api/client";

/**
 * Logs API Service
 *
 * Responsible for:
 * - Fetching logs
 * - Searching logs
 * - Filtering logs
 * - Getting individual log details
 * - Log statistics
 * - Log streams
 * - Log retention
 * - Exporting logs
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
 * Get logs.
 */
export const getLogs = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/logs",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Search logs.
 */
export const searchLogs = async (
  searchQuery,
  params = {}
) => {
  if (
    !searchQuery ||
    typeof searchQuery !== "string"
  ) {
    throw new Error(
      "Search query is required."
    );
  }

  const response = await apiClient.get(
    "/logs/search",
    {
      params: buildQueryParams({
        ...params,
        query: searchQuery,
      }),
    }
  );

  return getResponseData(response);
};

/**
 * Get a single log entry.
 */
export const getLog = async (
  logId
) => {
  if (!logId) {
    throw new Error(
      "Log ID is required."
    );
  }

  const response = await apiClient.get(
    `/logs/${encodeURIComponent(
      logId
    )}`
  );

  return getResponseData(response);
};

/**
 * Get logs by severity.
 */
export const getLogsBySeverity = async (
  severity,
  params = {}
) => {
  if (!severity) {
    throw new Error(
      "Severity is required."
    );
  }

  const response = await apiClient.get(
    "/logs",
    {
      params: buildQueryParams({
        ...params,
        severity,
      }),
    }
  );

  return getResponseData(response);
};

/**
 * Get logs by service.
 */
export const getLogsByService = async (
  service,
  params = {}
) => {
  if (!service) {
    throw new Error(
      "Service name is required."
    );
  }

  const response = await apiClient.get(
    "/logs",
    {
      params: buildQueryParams({
        ...params,
        service,
      }),
    }
  );

  return getResponseData(response);
};

/**
 * Get logs by environment.
 */
export const getLogsByEnvironment = async (
  environment,
  params = {}
) => {
  if (!environment) {
    throw new Error(
      "Environment is required."
    );
  }

  const response = await apiClient.get(
    "/logs",
    {
      params: buildQueryParams({
        ...params,
        environment,
      }),
    }
  );

  return getResponseData(response);
};

/**
 * Get logs by request ID.
 */
export const getLogsByRequestId = async (
  requestId,
  params = {}
) => {
  if (!requestId) {
    throw new Error(
      "Request ID is required."
    );
  }

  const response = await apiClient.get(
    "/logs",
    {
      params: buildQueryParams({
        ...params,
        requestId,
      }),
    }
  );

  return getResponseData(response);
};

/**
 * Get log statistics.
 */
export const getLogStatistics = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/logs/statistics",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get log summary.
 */
export const getLogSummary = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/logs/summary",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get log trends.
 */
export const getLogTrends = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/logs/trends",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get available log streams.
 */
export const getLogStreams = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/logs/streams",
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get a specific log stream.
 */
export const getLogStream = async (
  streamId,
  params = {}
) => {
  if (!streamId) {
    throw new Error(
      "Stream ID is required."
    );
  }

  const response = await apiClient.get(
    `/logs/streams/${encodeURIComponent(
      streamId
    )}`,
    {
      params: buildQueryParams(params),
    }
  );

  return getResponseData(response);
};

/**
 * Get log retention configuration.
 */
export const getLogRetention = async () => {
  const response = await apiClient.get(
    "/logs/retention"
  );

  return getResponseData(response);
};

/**
 * Update log retention configuration.
 */
export const updateLogRetention = async (
  retentionData
) => {
  if (
    !retentionData ||
    typeof retentionData !== "object"
  ) {
    throw new Error(
      "Retention data is required."
    );
  }

  const response = await apiClient.put(
    "/logs/retention",
    retentionData
  );

  return getResponseData(response);
};

/**
 * Export logs.
 */
export const exportLogs = async (
  params = {}
) => {
  const response = await apiClient.get(
    "/logs/export",
    {
      params: buildQueryParams(params),
      responseType: "blob",
    }
  );

  return response;
};

/**
 * Delete a specific log.
 */
export const deleteLog = async (
  logId
) => {
  if (!logId) {
    throw new Error(
      "Log ID is required."
    );
  }

  const response = await apiClient.delete(
    `/logs/${encodeURIComponent(
      logId
    )}`
  );

  return getResponseData(response);
};

/**
 * Clear logs using filters.
 */
export const clearLogs = async (
  filterData = {}
) => {
  const response = await apiClient.post(
    "/logs/clear",
    filterData
  );

  return getResponseData(response);
};

/**
 * Get log configuration.
 */
export const getLogConfiguration =
  async () => {
    const response = await apiClient.get(
      "/logs/configuration"
    );

    return getResponseData(response);
  };

/**
 * Update log configuration.
 */
export const updateLogConfiguration =
  async (configurationData) => {
    if (
      !configurationData ||
      typeof configurationData !== "object"
    ) {
      throw new Error(
        "Log configuration is required."
      );
    }

    const response = await apiClient.put(
      "/logs/configuration",
      configurationData
    );

    return getResponseData(response);
  };

/**
 * Logs API service.
 */
const logsApi = {
  getLogs,

  searchLogs,

  getLog,

  getLogsBySeverity,

  getLogsByService,

  getLogsByEnvironment,

  getLogsByRequestId,

  getLogStatistics,

  getLogSummary,

  getLogTrends,

  getLogStreams,

  getLogStream,

  getLogRetention,

  updateLogRetention,

  exportLogs,

  deleteLog,

  clearLogs,

  getLogConfiguration,

  updateLogConfiguration,
};

export default logsApi;