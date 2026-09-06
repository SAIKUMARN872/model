import apiClient from "../../api/client";

/**
 * Cost API Service
 *
 * Responsible for:
 * - Cost overview
 * - Cost summary
 * - Cost breakdown
 * - Cost trends
 * - Model costs
 * - Provider costs
 * - Environment costs
 * - Cost forecasting
 * - Cost budgets
 */

/**
 * Extract response payload.
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
 * Build clean query parameters.
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
 * Get cost overview.
 */
export const getCostOverview =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/cost/overview",
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
 * Get cost summary.
 */
export const getCostSummary =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/cost/summary",
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
 * Get detailed cost breakdown.
 */
export const getCostBreakdown =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/cost/breakdown",
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
 * Get cost trends over time.
 */
export const getCostTrends =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/cost/trends",
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
 * Get cost by model.
 */
export const getCostByModel =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/cost/models",
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
 * Get cost for a specific model.
 */
export const getModelCost =
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
        `/cost/models/${encodeURIComponent(
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
 * Get cost by provider.
 */
export const getCostByProvider =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/cost/providers",
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
 * Get cost by environment.
 */
export const getCostByEnvironment =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/cost/environments",
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
 * Get cost by project.
 */
export const getCostByProject =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/cost/projects",
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
 * Get cost forecast.
 */
export const getCostForecast =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/cost/forecast",
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
 * Get current cost budget.
 */
export const getCostBudget =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/cost/budget",
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
 * Create a cost budget.
 */
export const createCostBudget =
  async (budgetData) => {
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
        "/cost/budget",
        budgetData
      );

    return getResponseData(
      response
    );
  };

/**
 * Update cost budget.
 */
export const updateCostBudget =
  async (
    budgetId,
    budgetData
  ) => {
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
        "Budget data is required."
      );
    }

    const response =
      await apiClient.put(
        `/cost/budget/${encodeURIComponent(
          budgetId
        )}`,
        budgetData
      );

    return getResponseData(
      response
    );
  };

/**
 * Delete cost budget.
 */
export const deleteCostBudget =
  async (budgetId) => {
    if (!budgetId) {
      throw new Error(
        "Budget ID is required."
      );
    }

    const response =
      await apiClient.delete(
        `/cost/budget/${encodeURIComponent(
          budgetId
        )}`
      );

    return getResponseData(
      response
    );
  };

/**
 * Export cost data.
 */
export const exportCostData =
  async (params = {}) => {
    const response =
      await apiClient.get(
        "/cost/export",
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
 * Cost API service.
 */
const costApi = {
  getCostOverview,

  getCostSummary,

  getCostBreakdown,

  getCostTrends,

  getCostByModel,

  getModelCost,

  getCostByProvider,

  getCostByEnvironment,

  getCostByProject,

  getCostForecast,

  getCostBudget,

  createCostBudget,

  updateCostBudget,

  deleteCostBudget,

  exportCostData,
};

export default costApi;