/**
 * Cost API Service
 *
 * Central API service for cost management.
 *
 * Supports:
 * - Cost overview
 * - Cost summary
 * - Cost breakdown
 * - Cost by organization
 * - Cost by agent
 * - Cost by model
 * - Usage costs
 * - Budgets
 * - Budget alerts
 * - Cost forecasts
 * - Cost trends
 * - Cost transactions
 * - Cost export
 */

import apiClient from "../../api/client";

/* =================================================
   API Endpoints
================================================= */

const COST_ENDPOINTS = {
  BASE: "/costs",

  OVERVIEW:
    "/costs/overview",

  SUMMARY:
    "/costs/summary",

  BREAKDOWN:
    "/costs/breakdown",

  TRENDS:
    "/costs/trends",

  FORECAST:
    "/costs/forecast",

  ORGANIZATIONS:
    "/costs/organizations",

  AGENTS:
    "/costs/agents",

  MODELS:
    "/costs/models",

  USAGE:
    "/costs/usage",

  TRANSACTIONS:
    "/costs/transactions",

  BUDGETS:
    "/costs/budgets",

  ALERTS:
    "/costs/alerts",

  EXPORT:
    "/costs/export",
};

/* =================================================
   Utility: Clean Parameters
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
      Number.isNaN(
        start.getTime()
      ) ||
      Number.isNaN(
        end.getTime()
      )
    ) {
      throw new Error(
        "Invalid date range."
      );
    }

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
   Get Cost Overview
================================================= */

export async function getCostOverview(
  params = {}
) {
  validateDateRange(
    params
  );

  const response =
    await apiClient.get(
      COST_ENDPOINTS.OVERVIEW,
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
   Get Cost Summary
================================================= */

export async function getCostSummary(
  params = {}
) {
  validateDateRange(
    params
  );

  const response =
    await apiClient.get(
      COST_ENDPOINTS.SUMMARY,
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
   Get Cost Breakdown
================================================= */

export async function getCostBreakdown(
  params = {}
) {
  validateDateRange(
    params
  );

  const response =
    await apiClient.get(
      COST_ENDPOINTS.BREAKDOWN,
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
   Get Cost Trends
================================================= */

export async function getCostTrends(
  params = {}
) {
  validateDateRange(
    params
  );

  const response =
    await apiClient.get(
      COST_ENDPOINTS.TRENDS,
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
   Get Cost Forecast
================================================= */

export async function getCostForecast(
  params = {}
) {
  const response =
    await apiClient.get(
      COST_ENDPOINTS.FORECAST,
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
   Get Organization Costs
================================================= */

export async function getOrganizationCosts(
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

  validateDateRange(
    params
  );

  const response =
    await apiClient.get(
      COST_ENDPOINTS.ORGANIZATIONS,
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
   Get Agent Costs
================================================= */

export async function getAgentCosts(
  agentId,
  params = {}
) {
  if (!agentId) {
    throw new Error(
      "Agent ID is required."
    );
  }

  validateDateRange(
    params
  );

  const response =
    await apiClient.get(
      COST_ENDPOINTS.AGENTS,
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
   Get Model Costs
================================================= */

export async function getModelCosts(
  modelId,
  params = {}
) {
  if (!modelId) {
    throw new Error(
      "Model ID is required."
    );
  }

  validateDateRange(
    params
  );

  const response =
    await apiClient.get(
      COST_ENDPOINTS.MODELS,
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
   Get Usage Costs
================================================= */

export async function getUsageCosts(
  params = {}
) {
  validateDateRange(
    params
  );

  const response =
    await apiClient.get(
      COST_ENDPOINTS.USAGE,
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
   Get Cost Transactions
================================================= */

export async function getCostTransactions(
  params = {}
) {
  validateDateRange(
    params
  );

  const response =
    await apiClient.get(
      COST_ENDPOINTS.TRANSACTIONS,
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
   Get Budgets
================================================= */

export async function getBudgets(
  params = {}
) {
  const response =
    await apiClient.get(
      COST_ENDPOINTS.BUDGETS,
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
   Get Budget By ID
================================================= */

export async function getBudget(
  budgetId
) {
  if (!budgetId) {
    throw new Error(
      "Budget ID is required."
    );
  }

  const response =
    await apiClient.get(
      `${COST_ENDPOINTS.BUDGETS}/${budgetId}`
    );

  return response.data;
}

/* =================================================
   Create Budget
================================================= */

export async function createBudget(
  budgetData
) {
  if (
    !budgetData ||
    typeof budgetData !==
      "object"
  ) {
    throw new Error(
      "Budget data is required."
    );
  }

  const response =
    await apiClient.post(
      COST_ENDPOINTS.BUDGETS,
      budgetData
    );

  return response.data;
}

/* =================================================
   Update Budget
================================================= */

export async function updateBudget(
  budgetId,
  budgetData
) {
  if (!budgetId) {
    throw new Error(
      "Budget ID is required."
    );
  }

  if (
    !budgetData ||
    typeof budgetData !==
      "object"
  ) {
    throw new Error(
      "Budget update data is required."
    );
  }

  const response =
    await apiClient.patch(
      `${COST_ENDPOINTS.BUDGETS}/${budgetId}`,
      budgetData
    );

  return response.data;
}

/* =================================================
   Delete Budget
================================================= */

export async function deleteBudget(
  budgetId
) {
  if (!budgetId) {
    throw new Error(
      "Budget ID is required."
    );
  }

  const response =
    await apiClient.delete(
      `${COST_ENDPOINTS.BUDGETS}/${budgetId}`
    );

  return response.data;
}

/* =================================================
   Get Budget Alerts
================================================= */

export async function getBudgetAlerts(
  params = {}
) {
  const response =
    await apiClient.get(
      COST_ENDPOINTS.ALERTS,
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
   Create Budget Alert
================================================= */

export async function createBudgetAlert(
  alertData
) {
  if (
    !alertData ||
    typeof alertData !==
      "object"
  ) {
    throw new Error(
      "Alert data is required."
    );
  }

  const response =
    await apiClient.post(
      COST_ENDPOINTS.ALERTS,
      alertData
    );

  return response.data;
}

/* =================================================
   Update Budget Alert
================================================= */

export async function updateBudgetAlert(
  alertId,
  alertData
) {
  if (!alertId) {
    throw new Error(
      "Alert ID is required."
    );
  }

  const response =
    await apiClient.patch(
      `${COST_ENDPOINTS.ALERTS}/${alertId}`,
      alertData
    );

  return response.data;
}

/* =================================================
   Delete Budget Alert
================================================= */

export async function deleteBudgetAlert(
  alertId
) {
  if (!alertId) {
    throw new Error(
      "Alert ID is required."
    );
  }

  const response =
    await apiClient.delete(
      `${COST_ENDPOINTS.ALERTS}/${alertId}`
    );

  return response.data;
}

/* =================================================
   Export Cost Data
================================================= */

export async function exportCostData(
  params = {}
) {
  validateDateRange(
    params
  );

  const response =
    await apiClient.get(
      COST_ENDPOINTS.EXPORT,
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
   Get Cost By Date Range
================================================= */

export async function getCostByDateRange(
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
      COST_ENDPOINTS.BASE,
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
   Default API Object
================================================= */

const costApi = {
  getCostOverview,

  getCostSummary,

  getCostBreakdown,

  getCostTrends,

  getCostForecast,

  getOrganizationCosts,

  getAgentCosts,

  getModelCosts,

  getUsageCosts,

  getCostTransactions,

  getBudgets,

  getBudget,

  createBudget,

  updateBudget,

  deleteBudget,

  getBudgetAlerts,

  createBudgetAlert,

  updateBudgetAlert,

  deleteBudgetAlert,

  exportCostData,

  getCostByDateRange,
};

export default costApi;