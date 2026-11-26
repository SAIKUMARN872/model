/**
 * Analytics API Service
 *
 * Central API service for the Admin Analytics system.
 *
 * Supports:
 * - Dashboard overview
 * - KPI metrics
 * - Time-series analytics
 * - Usage analytics
 * - Performance analytics
 * - Cost analytics
 * - Agent analytics
 * - Model analytics
 * - Organization analytics
 * - Trend analysis
 * - Custom analytics queries
 */

import apiClient from "../../api/client";

/* =================================================
   API Endpoints
================================================= */

const ANALYTICS_ENDPOINTS = {
  BASE: "/analytics",

  OVERVIEW:
    "/analytics/overview",

  DASHBOARD:
    "/analytics/dashboard",

  METRICS:
    "/analytics/metrics",

  TIMESERIES:
    "/analytics/timeseries",

  USAGE:
    "/analytics/usage",

  PERFORMANCE:
    "/analytics/performance",

  COST:
    "/analytics/cost",

  TRENDS:
    "/analytics/trends",

  AGENTS:
    "/analytics/agents",

  MODELS:
    "/analytics/models",

  ORGANIZATIONS:
    "/analytics/organizations",

  CUSTOM:
    "/analytics/query",
};

/* =================================================
   Utility: Clean Query Parameters
================================================= */

function cleanParams(
  params = {}
) {
  return Object.fromEntries(
    Object.entries(
      params
    ).filter(
      ([, value]) =>
        value !==
          undefined &&
        value !== null &&
        value !== ""
    )
  );
}

/* =================================================
   Utility: Validate Date Range
================================================= */

function validateDateRange(
  params = {}
) {
  if (
    params.startDate &&
    params.endDate
  ) {
    const start =
      new Date(
        params.startDate
      );

    const end =
      new Date(
        params.endDate
      );

    if (
      start > end
    ) {
      throw new Error(
        "Start date cannot be after end date."
      );
    }
  }
}

/* =================================================
   Get Analytics Overview
================================================= */

export async function getAnalyticsOverview(
  params = {}
) {
  validateDateRange(
    params
  );

  const response =
    await apiClient.get(
      ANALYTICS_ENDPOINTS.OVERVIEW,
      {
        params:
          cleanParams(
            params
          ),
      }
    );

  return response.data;
}

/* =================================================
   Get Analytics Dashboard
================================================= */

export async function getAnalyticsDashboard(
  params = {}
) {
  validateDateRange(
    params
  );

  const response =
    await apiClient.get(
      ANALYTICS_ENDPOINTS.DASHBOARD,
      {
        params:
          cleanParams(
            params
          ),
      }
    );

  return response.data;
}

/* =================================================
   Get KPI Metrics
================================================= */

export async function getMetrics(
  params = {}
) {
  validateDateRange(
    params
  );

  const response =
    await apiClient.get(
      ANALYTICS_ENDPOINTS.METRICS,
      {
        params:
          cleanParams(
            params
          ),
      }
    );

  return response.data;
}

/* =================================================
   Get Time Series Data
================================================= */

export async function getTimeSeries(
  params = {}
) {
  validateDateRange(
    params
  );

  const response =
    await apiClient.get(
      ANALYTICS_ENDPOINTS.TIMESERIES,
      {
        params:
          cleanParams({
            interval:
              "day",

            ...params,
          }),
      }
    );

  return response.data;
}

/* =================================================
   Get Usage Analytics
================================================= */

export async function getUsageAnalytics(
  params = {}
) {
  validateDateRange(
    params
  );

  const response =
    await apiClient.get(
      ANALYTICS_ENDPOINTS.USAGE,
      {
        params:
          cleanParams(
            params
          ),
      }
    );

  return response.data;
}

/* =================================================
   Get Performance Analytics
================================================= */

export async function getPerformanceAnalytics(
  params = {}
) {
  validateDateRange(
    params
  );

  const response =
    await apiClient.get(
      ANALYTICS_ENDPOINTS.PERFORMANCE,
      {
        params:
          cleanParams(
            params
          ),
      }
    );

  return response.data;
}

/* =================================================
   Get Cost Analytics
================================================= */

export async function getCostAnalytics(
  params = {}
) {
  validateDateRange(
    params
  );

  const response =
    await apiClient.get(
      ANALYTICS_ENDPOINTS.COST,
      {
        params:
          cleanParams(
            params
          ),
      }
    );

  return response.data;
}

/* =================================================
   Get Analytics Trends
================================================= */

export async function getTrends(
  params = {}
) {
  validateDateRange(
    params
  );

  const response =
    await apiClient.get(
      ANALYTICS_ENDPOINTS.TRENDS,
      {
        params:
          cleanParams(
            params
          ),
      }
    );

  return response.data;
}

/* =================================================
   Get Agent Analytics
================================================= */

export async function getAgentAnalytics(
  params = {}
) {
  validateDateRange(
    params
  );

  const response =
    await apiClient.get(
      ANALYTICS_ENDPOINTS.AGENTS,
      {
        params:
          cleanParams(
            params
          ),
      }
    );

  return response.data;
}

/* =================================================
   Get Model Analytics
================================================= */

export async function getModelAnalytics(
  params = {}
) {
  validateDateRange(
    params
  );

  const response =
    await apiClient.get(
      ANALYTICS_ENDPOINTS.MODELS,
      {
        params:
          cleanParams(
            params
          ),
      }
    );

  return response.data;
}

/* =================================================
   Get Organization Analytics
================================================= */

export async function getOrganizationAnalytics(
  params = {}
) {
  validateDateRange(
    params
  );

  const response =
    await apiClient.get(
      ANALYTICS_ENDPOINTS.ORGANIZATIONS,
      {
        params:
          cleanParams(
            params
          ),
      }
    );

  return response.data;
}

/* =================================================
   Get Analytics By Date Range
================================================= */

export async function getAnalyticsByDateRange(
  startDate,
  endDate,
  options = {}
) {
  if (
    !startDate ||
    !endDate
  ) {
    throw new Error(
      "Start date and end date are required."
    );
  }

  validateDateRange({
    startDate,
    endDate,
  });

  const response =
    await apiClient.get(
      ANALYTICS_ENDPOINTS.BASE,
      {
        params:
          cleanParams({
            startDate,

            endDate,

            ...options,
          }),
      }
    );

  return response.data;
}

/* =================================================
   Get Analytics By Organization
================================================= */

export async function getAnalyticsByOrganization(
  organizationId,
  params = {}
) {
  if (
    !organizationId
  ) {
    throw new Error(
      "Organization ID is required."
    );
  }

  const response =
    await apiClient.get(
      ANALYTICS_ENDPOINTS.ORGANIZATIONS,
      {
        params:
          cleanParams({
            organizationId,

            ...params,
          }),
      }
    );

  return response.data;
}

/* =================================================
   Get Analytics By Agent
================================================= */

export async function getAnalyticsByAgent(
  agentId,
  params = {}
) {
  if (!agentId) {
    throw new Error(
      "Agent ID is required."
    );
  }

  const response =
    await apiClient.get(
      ANALYTICS_ENDPOINTS.AGENTS,
      {
        params:
          cleanParams({
            agentId,

            ...params,
          }),
      }
    );

  return response.data;
}

/* =================================================
   Get Analytics By Model
================================================= */

export async function getAnalyticsByModel(
  modelId,
  params = {}
) {
  if (!modelId) {
    throw new Error(
      "Model ID is required."
    );
  }

  const response =
    await apiClient.get(
      ANALYTICS_ENDPOINTS.MODELS,
      {
        params:
          cleanParams({
            modelId,

            ...params,
          }),
      }
    );

  return response.data;
}

/* =================================================
   Custom Analytics Query
================================================= */

export async function queryAnalytics(
  query
) {
  if (
    !query ||
    typeof query !==
      "object"
  ) {
    throw new Error(
      "Analytics query is required."
    );
  }

  const response =
    await apiClient.post(
      ANALYTICS_ENDPOINTS.CUSTOM,
      query
    );

  return response.data;
}

/* =================================================
   Export Analytics Data
================================================= */

export async function exportAnalytics(
  params = {}
) {
  validateDateRange(
    params
  );

  const response =
    await apiClient.get(
      `${ANALYTICS_ENDPOINTS.BASE}/export`,
      {
        params:
          cleanParams(
            params
          ),

        responseType:
          "blob",
      }
    );

  return response.data;
}

/* =================================================
   Get Analytics Summary
================================================= */

export async function getAnalyticsSummary(
  params = {}
) {
  const response =
    await apiClient.get(
      `${ANALYTICS_ENDPOINTS.BASE}/summary`,
      {
        params:
          cleanParams(
            params
          ),
      }
    );

  return response.data;
}

/* =================================================
   Get Real-Time Analytics
================================================= */

export async function getRealtimeAnalytics() {
  const response =
    await apiClient.get(
      `${ANALYTICS_ENDPOINTS.BASE}/realtime`
    );

  return response.data;
}

/* =================================================
   Default API Object
================================================= */

const analyticsApi = {
  getAnalyticsOverview,

  getAnalyticsDashboard,

  getMetrics,

  getTimeSeries,

  getUsageAnalytics,

  getPerformanceAnalytics,

  getCostAnalytics,

  getTrends,

  getAgentAnalytics,

  getModelAnalytics,

  getOrganizationAnalytics,

  getAnalyticsByDateRange,

  getAnalyticsByOrganization,

  getAnalyticsByAgent,

  getAnalyticsByModel,

  queryAnalytics,

  exportAnalytics,

  getAnalyticsSummary,

  getRealtimeAnalytics,
};

export default analyticsApi;